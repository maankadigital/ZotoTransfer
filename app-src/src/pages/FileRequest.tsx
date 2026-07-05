import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Logo } from '../components/Logo';
import { supabase } from '../utils/supabaseClient';

export const FileRequest: React.FC = () => {
  const { createTransfer, setView, viewParams, users, addSharedFolderFile } = useApp();
  const [requestDetails, setRequestDetails] = useState<{
    id: string;
    title: string;
    description: string;
    requesterEmail: string;
    folderId?: string;
    clientEmail?: string;
  } | null>(null);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);

  useEffect(() => {
    const requestId = viewParams?.r;
    if (!requestId) {
      setIsLoadingData(false);
      return;
    }

    const fetchRequest = async () => {
      try {
        const { data, error } = await supabase
          .from('file_requests')
          .select('*')
          .eq('id', requestId)
          .single();

        if (!error && data) {
          setRequestDetails({
            id: data.id,
            title: data.title,
            description: data.description || '',
            requesterEmail: data.requester_email,
            folderId: data.folder_id || undefined,
            clientEmail: data.client_email || undefined
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchRequest();
  }, [viewParams]);

  const requesterUser = requestDetails
    ? users.find(u => u.email.toLowerCase() === requestDetails.requesterEmail.toLowerCase())
    : null;
  const requesterName = requesterUser?.fullName || requestDetails?.requesterEmail || 'Sarah Jenkins';
  const requesterAvatar = requesterUser?.avatarUrl || '';

  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [success, setSuccess] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFiles((prev) => [...prev, ...Array.from(e.dataTransfer.files)]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files as FileList)]);
    }
  };

  const removeFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) {
      alert('Please add files to upload.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const transferId = `t_${Date.now()}`;
      
      // Upload files
      let completedCount = 0;
      for (const file of files) {
        let uploadError = null;
        if (requestDetails?.folderId) {
          // Upload to folders bucket under "requested file" subfolder
          const filePath = `${requestDetails.folderId}/requested file/${file.name}`;
          const { error } = await supabase.storage
            .from('folders')
            .upload(filePath, file, { cacheControl: '3600', upsert: true });
          uploadError = error;
        } else {
          // Upload to transfers bucket under "requested file" subfolder
          const filePath = `${transferId}/requested file/${file.name}`;
          const { error } = await supabase.storage
            .from('transfers')
            .upload(filePath, file, { cacheControl: '3600', upsert: true });
          uploadError = error;
        }

        if (uploadError) {
          throw uploadError;
        }

        completedCount++;
        setUploadProgress(Math.round((completedCount / files.length) * 100));
      }

      await completeRequestUpload(transferId);
    } catch (err) {
      console.error(err);
      setIsUploading(false);
      alert('❌ Failed to upload files. Please try again.');
    }
  };

  const completeRequestUpload = async (transferId: string) => {
    const finalEmail = requestDetails?.clientEmail || email || 'guest@zototransfer.com';
    const finalName = name || requestDetails?.clientEmail || 'Guest Client';

    // Generate transfer
    createTransfer({
      id: transferId,
      title: requestDetails?.title || `File Request from ${finalName}`,
      message: message || `Uploaded files from ${finalName} (${finalEmail})`,
      senderEmail: finalEmail,
      files: files.map((f, i) => ({
        id: `req_${Date.now()}_${i}`,
        name: f.name,
        size: f.size,
        mimeType: f.type,
        uploadedAt: new Date().toISOString(),
        downloadsCount: 0,
      })),
      isPublic: true,
      passwordProtected: false,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      storageUsed: files.reduce((acc, f) => acc + f.size, 0),
    });

    // If request has linked target folder, add files to it!
    if (requestDetails?.folderId) {
      try {
        // Insert placeholder file to register the "requested file" subfolder
        await addSharedFolderFile({
          folderId: requestDetails.folderId,
          parentPath: 'requested file',
          name: '.dir',
          size: 0,
          mimeType: 'directory',
          uploadedBy: finalEmail
        });

        // Insert actual files under the virtual subfolder path
        for (const f of files) {
          await addSharedFolderFile({
            folderId: requestDetails.folderId,
            parentPath: 'requested file',
            name: f.name,
            size: f.size,
            mimeType: f.type,
            uploadedBy: finalEmail
          });
        }
      } catch (err) {
        console.error('Error syncing request files to folder:', err);
      }
    }

    // Update the file request link status to fulfilled so it moves out of active status
    if (requestDetails?.id) {
      try {
        await supabase
          .from('file_requests')
          .update({ status: 'fulfilled' })
          .eq('id', requestDetails.id);
      } catch (err) {
        console.error('Error updating active request link:', err);
      }
    }

    setIsUploading(false);
    setSuccess(true);
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'svg':
        return 'image';
      case 'mp4':
      case 'mov':
        return 'movie';
      case 'zip':
      case 'rar':
        return 'folder_zip';
      default:
        return 'description';
    }
  };

  const getIconColorClass = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'svg':
        return 'bg-tertiary-container/20 text-tertiary';
      case 'mp4':
      case 'mov':
        return 'bg-secondary-container text-on-secondary-container';
      case 'zip':
      case 'rar':
        return 'bg-primary-container/20 text-primary';
      default:
        return 'bg-slate-100 text-slate-500';
    }
  };

  const totalFilesSize = files.reduce((acc, f) => acc + f.size, 0);

  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs text-slate-500">Loading request details...</p>
      </div>
    );
  }

  if (!requestDetails) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center">
          <span className="material-symbols-outlined text-[48px] text-red-500 mb-4">error</span>
          <h2 className="text-lg font-bold text-slate-900 mb-2">Invalid or Expired Request Link</h2>
          <p className="text-xs text-slate-500 mb-6">This file request link does not exist, has expired, or is invalid.</p>
          <button onClick={() => setView('home')} className="bg-primary text-white py-2.5 px-6 rounded-xl font-bold text-xs cursor-pointer hover:bg-primary-container transition-colors shadow-sm">Go to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0f1117] flex flex-col antialiased text-on-surface dark:text-[#e8eaf0] font-body-md">
      {/* Suppressed Navbar: Transactional Header */}
      <header className="w-full py-4 px-6 flex justify-between items-center border-b border-slate-200 dark:border-[#2e3445] bg-white dark:bg-[#1a1f2e]">
        <div 
          onClick={() => setView('home')}
          className="text-lg font-display font-bold text-primary flex items-center gap-2 cursor-pointer"
        >
          <Logo className="h-8" variant="full" />
        </div>
        <button 
          onClick={() => setView('home')}
          className="text-xs font-semibold text-slate-500 hover:text-primary transition-colors"
        >
          Cancel
        </button>
      </header>

      {/* Main Container */}
      <main className="flex-grow flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-2xl bg-white rounded-[24px] border border-slate-200/80 shadow-xl p-8 flex flex-col">
          {success ? (
            /* Success Card */
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-sm">
                <span className="material-symbols-outlined text-[36px]">verified</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Files Submitted Successfully!</h2>
              <p className="text-xs text-slate-500 mb-6 leading-relaxed max-w-sm mx-auto">
                Your files have been safely uploaded. The requester ({requesterName}) has been notified. Thank you!
              </p>
              <button
                onClick={() => {
                  setSuccess(false);
                  setFiles([]);
                  setName('');
                  setEmail('');
                  setMessage('');
                }}
                className="bg-primary hover:bg-primary-container text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all scale-98 active:scale-95"
              >
                Submit More Files
              </button>
            </div>
          ) : isUploading ? (
            /* Uploading Card */
            <div className="text-center py-12">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mx-auto mb-6 animate-pulse">
                <span className="material-symbols-outlined text-[28px]">upload</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 mb-2">Uploading requested files...</h2>
              <p className="text-xs text-slate-500 mb-6">{uploadProgress}% uploaded</p>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden max-w-md mx-auto">
                <div className="h-full bg-primary transition-all duration-150 rounded-full" style={{ width: `${uploadProgress}%` }} />
              </div>
            </div>
          ) : (
            /* Request Form Card */
            <form onSubmit={handleRequestSubmit} className="flex flex-col gap-6">
              {/* Header Section */}
              <div className="text-center">
                {requesterAvatar ? (
                  <div className="w-16 h-16 rounded-full border-2 border-primary-container mx-auto mb-3 flex items-center justify-center overflow-hidden shadow-sm">
                    <img 
                      alt={requesterName} 
                      className="w-full h-full object-cover" 
                      src={requesterAvatar}
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-full border-2 border-primary-container mx-auto mb-3 flex items-center justify-center bg-primary/10 text-primary font-bold text-lg shadow-sm">
                    {requesterName.charAt(0).toUpperCase()}
                  </div>
                )}
                <h1 className="text-xl font-bold text-slate-900 mb-1">{requesterName} is requesting files</h1>
                {requestDetails?.description && (
                  <p className="text-xs text-slate-500 max-w-lg mx-auto italic mt-2">
                    "{requestDetails.description}"
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1 text-left">
                <label className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Message for requester</label>
                <textarea
                  rows={5}
                  placeholder="Tell us what you are uploading..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-sm resize-y min-h-[100px]"
                />
              </div>

              {/* Drag & Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 hover:bg-[#F0F7FF] hover:border-primary p-8 text-center transition-all duration-200 ease-in-out cursor-pointer group"
              >
                <span className="material-symbols-outlined text-[48px] text-primary mb-3 block group-hover:scale-110 transition-transform">cloud_upload</span>
                <h3 className="text-sm font-bold text-slate-800 mb-1">Drag and drop files here</h3>
                <p className="text-xs text-slate-400">or <span className="text-primary font-semibold">browse your computer</span></p>
                <p className="text-[10px] text-slate-400 mt-2 font-medium">Supports any file type up to 50GB</p>
                <input className="hidden" ref={fileInputRef} multiple type="file" onChange={handleFileChange} />
              </div>

              {/* Staged Files List */}
              {files.length > 0 && (
                <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                  {files.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 overflow-hidden text-left">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${getIconColorClass(file.name)}`}>
                          <span className="material-symbols-outlined text-md">{getFileIcon(file.name)}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-800 truncate">{file.name}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{formatSize(file.size)}</p>
                        </div>
                      </div>
                      <button 
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="text-slate-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-slate-100"
                      >
                        <span className="material-symbols-outlined text-lg">close</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Area */}
              <div className="border-t border-slate-100 pt-5 flex items-center justify-between">
                <div className="text-slate-500 text-xs text-left">
                  <span className="font-semibold text-slate-800">{files.length} files</span> selected ({formatSize(totalFilesSize)})
                </div>
                <button 
                  type="submit"
                  className="bg-primary hover:bg-primary-container text-white font-bold text-xs py-3 px-6 rounded-xl transition-all shadow-sm hover:shadow flex items-center gap-1.5 scale-98 active:scale-95"
                >
                  Upload Files
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>arrow_upward</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-white text-slate-400 py-6 border-t border-slate-200/60 mt-auto text-xs">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="font-bold text-primary text-sm font-display">ZotoTransfer</div>
          <div>© 2026 ZotoTransfer Inc. All rights reserved.</div>
          <div className="flex gap-6">
            <a className="hover:text-primary transition-colors" href="#/plans">Privacy Policy</a>
            <a className="hover:text-primary transition-colors" href="#/plans">Terms of Service</a>
            <a className="hover:text-primary transition-colors" href="#/plans">Security</a>
            <a className="hover:text-primary transition-colors" href="#/plans">Status</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
