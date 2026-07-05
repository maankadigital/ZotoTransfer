import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Logo } from '../components/Logo';
import type { Transfer } from '../context/AppContext';
import { supabase } from '../utils/supabaseClient';

export const DownloadFiles: React.FC = () => {
  const { addDownloadLog, viewParams, setView } = useApp();
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [downloadingFileId, setDownloadingFileId] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [dbTransfer, setDbTransfer] = useState<Transfer | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadFileName, setDownloadFileName] = useState<string>('');

  const shortLink = viewParams?.shortLink || 'brand-2026';

  useEffect(() => {
    const loadTransfer = async () => {
      setLoading(true);
      try {
        const { data: transData, error: transError } = await supabase
          .from('transfers')
          .select('*')
          .eq('id', shortLink);

        if (transError || !transData || transData.length === 0) {
          setLoading(false);
          return;
        }

        const t = transData[0];

        const { data: filesData } = await supabase
          .from('files')
          .select('*')
          .eq('transfer_id', t.id);

        const mappedTransfer = {
          id: t.id,
          title: t.title,
          senderEmail: t.sender_email,
          storageUsed: parseInt(t.storage_used),
          downloads: t.downloads,
          expiresAt: t.expires_at,
          createdAt: t.created_at,
          shortLink: t.id,
          isPublic: false,
          passwordProtected: false,
          files: (filesData || []).map((f: any) => ({
            id: f.id,
            name: f.name,
            size: parseInt(f.size),
            mimeType: f.mime_type,
            uploadedAt: f.uploaded_at,
            downloadsCount: 0
          }))
        };
        setDbTransfer(mappedTransfer);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadTransfer();
  }, [shortLink]);

  const transfer = dbTransfer;

  // Auto select all files on mount / when transfer loaded
  useEffect(() => {
    if (transfer) {
      setSelectedFiles(transfer.files.map(f => f.id));
    }
  }, [transfer]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transfer) return;

    if (passwordInput === transfer.password) {
      setIsUnlocked(true);
    } else {
      alert('❌ Incorrect password. Please try again.');
    }
  };

  const toggleSelectAll = (checked: boolean) => {
    if (!transfer) return;
    if (checked) {
      setSelectedFiles(transfer.files.map(f => f.id));
    } else {
      setSelectedFiles([]);
    }
  };

  const toggleSelectFile = (fileId: string) => {
    if (selectedFiles.includes(fileId)) {
      setSelectedFiles((prev) => prev.filter(id => id !== fileId));
    } else {
      setSelectedFiles((prev) => [...prev, fileId]);
    }
  };

  const triggerDownload = async (fileId: string, fileName: string) => {
    if (!transfer) return;

    setDownloadingFileId(fileId);
    setDownloadFileName(fileName);
    setIsDownloading(true);
    setDownloadProgress(10);

    try {
      let filePath = `${transfer.id}/requested file/${fileName}`;
      let { data: testData, error: testError } = await supabase.storage
        .from('transfers')
        .createSignedUrl(filePath, 60);

      let downloadUrl = testData?.signedUrl;

      if (testError || !downloadUrl) {
        // Fallback to standard transfer path if requested file prefix download fails
        filePath = `${transfer.id}/${fileName}`;
        const { data: fallbackData } = await supabase.storage
          .from('transfers')
          .createSignedUrl(filePath, 60);
        downloadUrl = fallbackData?.signedUrl;
      }

      if (!downloadUrl) {
        throw new Error('Could not create signed download URL');
      }

      setDownloadProgress(80);

      const element = document.createElement('a');
      element.href = downloadUrl;
      element.download = fileName;
      element.target = "_blank";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);

      setDownloadProgress(100);
      addDownloadLog(transfer.id, fileName);
      
      setTimeout(() => {
        setIsDownloading(false);
        setDownloadingFileId(null);
      }, 300);

    } catch (err) {
      console.error('Download failed:', err);
      alert('❌ Failed to download file. It might have been deleted or expired.');
      setIsDownloading(false);
      setDownloadingFileId(null);
    }
  };

  const triggerDownloadSelected = () => {
    if (!transfer) return;
    const selected = transfer.files.filter(f => selectedFiles.includes(f.id));
    if (selected.length === 0) return;

    selected.forEach(file => {
      triggerDownload(file.id, file.name);
    });
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
      case 'mp4':
      case 'mkv':
      case 'avi':
      case 'mov':
        return 'movie';
      case 'zip':
      case 'rar':
      case 'tar':
      case 'gz':
        return 'folder_zip';
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'svg':
        return 'image';
      case 'pdf':
        return 'picture_as_pdf';
      default:
        return 'description';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans antialiased text-on-surface items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-500 font-semibold">Loading shared transfer...</p>
        </div>
      </div>
    );
  }

  if (!transfer) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0f1117] flex flex-col font-sans antialiased text-on-surface dark:text-[#e8eaf0]">
        {/* Suppressed Navbar: Transactional Header */}
        <header className="w-full px-6 py-4 flex justify-between items-center bg-white dark:bg-[#1a1f2e] border-b border-slate-200 dark:border-[#2e3445]">
          <div 
            onClick={() => setView('home')}
            className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <Logo className="h-8" variant="full" />
          </div>
        </header>

        <main className="flex-grow flex items-center justify-center p-6">
          <div className="bg-white border border-slate-200 rounded-[24px] p-8 shadow-xl max-w-md w-full text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-[36px]">error</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Transfer Expired or Invalid</h2>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              The link you followed has expired, been deleted by the owner, or is invalid. Please check the URL and try again.
            </p>
            <button
              onClick={() => setView('home')}
              className="bg-primary text-white px-6 py-2.5 rounded-xl font-semibold text-xs transition-all scale-98 active:scale-95 shadow"
            >
              Return to Homepage
            </button>
          </div>
        </main>
      </div>
    );
  }

  const needsUnlock = transfer.passwordProtected && !isUnlocked;
  const totalSize = transfer.files.reduce((acc, f) => acc + f.size, 0);
  const selectedSize = transfer.files.filter(f => selectedFiles.includes(f.id)).reduce((acc, f) => acc + f.size, 0);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0f1117] flex flex-col font-sans antialiased text-on-surface dark:text-[#e8eaf0]">
      {/* Suppressed Navbar: Transactional Header */}
      <header className="w-full px-6 py-4 flex justify-between items-center bg-white dark:bg-[#1a1f2e] border-b border-slate-200 dark:border-[#2e3445]">
        <div 
          onClick={() => setView('home')}
          className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity"
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

      <main className="flex-grow flex flex-col items-center justify-center p-6 md:p-10">
        {needsUnlock ? (
          /* Password Protected Card */
          <div className="bg-white border border-slate-200 rounded-[24px] p-8 shadow-xl text-center max-w-md w-full">
            <div className="w-14 h-14 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-amber-100">
              <span className="material-symbols-outlined text-[30px]">lock</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">This transfer is password protected</h2>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Please enter the correct access password to view and download files in this transfer.
            </p>
            <form onSubmit={handlePasswordSubmit} className="space-y-4 text-left">
              <div>
                <input
                  type="password"
                  required
                  placeholder="Enter transfer password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-xs outline-none focus:border-primary transition-all shadow-sm"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary-container text-white py-3 rounded-xl text-xs font-bold shadow-sm transition-all scale-98 active:scale-95"
              >
                Unlock Transfer
              </button>
            </form>
          </div>
        ) : (
          /* Main Unlocked Download Dashboard Card */
          <div className="w-full max-w-3xl bg-white rounded-[24px] border border-slate-200/80 shadow-xl overflow-hidden flex flex-col md:flex-row relative">
            
            {/* Left Column: Message details & Sender */}
            <div className="md:w-5/12 bg-slate-50/80 p-8 border-b md:border-b-0 md:border-r border-slate-200 flex flex-col justify-between text-left">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm bg-primary/10 text-primary flex items-center justify-center font-bold">
                    {transfer.senderEmail?.charAt(0).toUpperCase() || 'A'}
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-slate-800 leading-tight">Shared Deliverable</h2>
                    <p className="text-[10px] text-slate-400 truncate max-w-[150px] mt-0.5">{transfer.senderEmail}</p>
                  </div>
                </div>
                
                <h1 className="text-xl md:text-2xl text-slate-900 font-bold leading-tight mb-4">
                  You received a transfer
                </h1>
                
                <div className="mt-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Message</p>
                  <p className="text-xs text-slate-500 leading-relaxed italic bg-white p-3 rounded-xl border border-slate-100 shadow-inner">
                    {transfer.message || '"No message provided by sender."'}
                  </p>
                </div>
              </div>
              
              <div className="mt-8 flex items-center gap-1.5 text-primary">
                <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                <span className="text-[10px] font-bold">Scanned for viruses. Encrypted delivery.</span>
              </div>
            </div>

            {/* Right Column: Files selection & Downloads list */}
            <div className="md:w-7/12 p-8 flex flex-col text-left">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-1 text-slate-900">
                  <span className="text-sm font-bold">{transfer.files.length} Files</span>
                  <span className="text-xs text-slate-400">• {formatSize(totalSize)} total</span>
                </div>
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-500 hover:text-primary transition-colors font-medium">
                  <input
                    type="checkbox"
                    checked={selectedFiles.length === transfer.files.length && transfer.files.length > 0}
                    onChange={(e) => toggleSelectAll(e.target.checked)}
                    className="w-4 h-4 text-primary focus:ring-primary rounded border-slate-350"
                  />
                  <span>Select All</span>
                </label>
              </div>

              {/* Files scrollable items */}
              <div className="flex-grow flex flex-col gap-1 mb-6 overflow-y-auto pr-1" style={{ maxHeight: '320px' }}>
                {transfer.files.map((file) => {
                  const isChecked = selectedFiles.includes(file.id);
                  const isSingleDownloading = downloadingFileId === file.id;
                  
                  return (
                    <div 
                      key={file.id} 
                      onClick={() => toggleSelectFile(file.id)}
                      className={`flex items-center justify-between p-3 rounded-xl cursor-pointer group border transition-all ${
                        isChecked 
                          ? 'bg-slate-50/50 border-slate-200/80' 
                          : 'bg-transparent border-transparent hover:bg-slate-50/30'
                      }`}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                          <span className="material-symbols-outlined">{getFileIcon(file.name)}</span>
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-xs font-semibold text-slate-800 truncate pr-2 group-hover:text-primary transition-colors">
                            {file.name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px] uppercase font-bold">
                              {file.name.split('.').pop() || 'FILE'}
                            </span>
                            <span className="text-[10px] text-slate-400 font-semibold">{formatSize(file.size)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => triggerDownload(file.id, file.name)}
                          disabled={isSingleDownloading}
                          className="p-1 text-slate-400 hover:text-primary transition-colors mr-1"
                        >
                          <span className={`material-symbols-outlined text-lg ${isSingleDownloading ? 'animate-spin' : ''}`}>
                            {isSingleDownloading ? 'autorenew' : 'download'}
                          </span>
                        </button>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectFile(file.id)}
                          className="w-4 h-4 text-primary focus:ring-primary rounded border-slate-350"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Area footer download button */}
              <div className="pt-4 border-t border-slate-100 mt-auto flex flex-col gap-3">
                <button
                  onClick={triggerDownloadSelected}
                  disabled={selectedFiles.length === 0}
                  className="w-full bg-primary hover:bg-primary-container text-white font-bold py-3 px-6 rounded-xl shadow-sm hover:shadow transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-1.5 scale-98 active:scale-95"
                >
                  <span className="material-symbols-outlined text-sm">download</span>
                  Download {selectedFiles.length === transfer.files.length ? 'All' : 'Selected'} ({formatSize(selectedSize)})
                </button>
                
                <p className="text-[10px] text-slate-400 font-semibold text-center">
                  ⏳ Link expires: {new Date(transfer.expiresAt).toLocaleDateString()}
                </p>
              </div>
            </div>

          </div>
        )}
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

      {isDownloading && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 flex flex-col items-center justify-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-blue-50 text-primary flex items-center justify-center animate-bounce">
              <span className="material-symbols-outlined text-[36px]">download</span>
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm">Downloading File</h4>
              <p className="text-xs text-slate-500 font-semibold mt-1 truncate max-w-[280px]">{downloadFileName}</p>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden max-w-xs mt-2 relative">
              <div 
                className="bg-primary h-full rounded-full transition-all duration-150" 
                style={{ width: `${downloadProgress}%` }}
              ></div>
            </div>
            <span className="text-xs font-bold text-primary font-mono">{downloadProgress}%</span>
          </div>
        </div>
      )}
    </div>
  );
};
