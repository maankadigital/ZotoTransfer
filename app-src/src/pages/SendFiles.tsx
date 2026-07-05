import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import type { FileItem, Transfer } from '../context/AppContext';
import { Header } from '../components/Header';
import { getAppUrl } from '../utils/url';

export const SendFiles: React.FC = () => {
  const { createTransfer, currentUser, setView } = useApp();

  const [files, setFiles] = useState<File[]>([]);
  const [recipientEmails, setRecipientEmails] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState<string>('');
  const [senderEmail] = useState<string>(currentUser?.email || 'alex@enterprise.com');
  const [title] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [expiresInDays, setExpiresInDays] = useState<number>(7);
  const [advancedOpen, setAdvancedOpen] = useState<boolean>(false);

  // Upload/Transfer simulations
  const [isTransferring, setIsTransferring] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [transferResult, setTransferResult] = useState<Transfer | null>(null);

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

  const addRecipientEmail = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = emailInput.trim();
      if (val && !recipientEmails.includes(val)) {
        setRecipientEmails((prev) => [...prev, val]);
      }
      setEmailInput('');
    }
  };

  const removeRecipientEmail = (email: string) => {
    setRecipientEmails((prev) => prev.filter((e) => e !== email));
  };

  const triggerUploadProgress = () => {
    setIsTransferring(true);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          completeTransfer();
          return 100;
        }
        return prev + 10;
      });
    }, 120);
  };

  const completeTransfer = () => {
    const transferFiles: FileItem[] = files.map((f, i) => ({
      id: `f_trans_${Date.now()}_${i}`,
      name: f.name,
      size: f.size,
      mimeType: f.type,
      uploadedAt: new Date().toISOString(),
      downloadsCount: 0,
    }));

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + expiresInDays);

    const totalSize = files.reduce((acc, f) => acc + f.size, 0);

    const res = createTransfer({
      title: title || files[0]?.name || 'Shared Transfer',
      message: message,
      senderEmail: senderEmail,
      recipientEmails: recipientEmails.length > 0 ? recipientEmails : undefined,
      files: transferFiles,
      isPublic: true,
      passwordProtected: !!password,
      password: password,
      expiresAt: expiryDate.toISOString(),
      storageUsed: totalSize,
    });

    setIsTransferring(false);
    setTransferResult(res);
  };

  const handleStartTransfer = () => {
    if (files.length === 0) {
      alert('Please add at least one file.');
      return;
    }
    triggerUploadProgress();
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    alert('📋 Link copied to clipboard!');
  };

  const totalBytes = files.reduce((acc, f) => acc + f.size, 0);

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf':
        return 'picture_as_pdf';
      case 'zip':
      case 'rar':
      case '7z':
        return 'folder_zip';
      case 'mp4':
      case 'mov':
      case 'avi':
      case 'mkv':
        return 'movie';
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
        return 'image';
      default:
        return 'insert_drive_file';
    }
  };

  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen flex flex-col antialiased selection:bg-primary-fixed selection:text-on-primary-fixed text-left">
      <Header />

      {transferResult ? (
        /* Transfer Success View matching the premium bento specs */
        <main className="flex-grow w-full max-w-container-max mx-auto px-sm md:px-md lg:px-lg py-lg md:py-xl flex items-center justify-center">
          <div className="bg-surface-container-lowest border border-[#E2E8F0] rounded-[24px] p-lg shadow-xl max-w-xl w-full text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-[36px]">check_circle</span>
            </div>
            <h2 className="text-headline-lg font-headline-lg text-on-surface mb-xs">Upload complete!</h2>
            <p className="text-body-sm text-on-surface-variant mb-6">
              Your files have been securely processed and are ready to share.
            </p>
            <div className="bg-surface border border-outline-variant/20 rounded-xl p-md text-left mb-md">
              <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block mb-sm">
                Share Link
              </label>
              <div className="flex gap-sm">
                <input
                  type="text"
                  readOnly
                  value={`${getAppUrl()}/#/t/${transferResult.shortLink}`}
                  className="w-full bg-surface-container-lowest border border-[#E2E8F0] rounded-lg p-2.5 text-xs text-primary font-semibold font-mono"
                />
                <button
                  onClick={() =>
                    handleCopyLink(`${getAppUrl()}/#/t/${transferResult.shortLink}`)
                  }
                  className="bg-primary hover:bg-primary-container text-on-primary font-semibold text-xs px-5 rounded-lg shadow-sm"
                >
                  Copy
                </button>
              </div>
            </div>
            <div className="flex items-center justify-center gap-sm mt-8">
              <button
                onClick={() => {
                  setFiles([]);
                  setTransferResult(null);
                }}
                className="bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md px-6 py-2.5 rounded-button shadow-sm transition-all"
              >
                Send Another
              </button>
              <button
                onClick={() => setView('dashboard')}
                className="bg-surface-container-high text-on-surface hover:bg-surface-container-highest font-label-md text-label-md px-6 py-2.5 rounded-button border border-outline-variant/30 shadow-sm transition-all"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </main>
      ) : isTransferring ? (
        /* Uploading progress screen */
        <main className="flex-grow w-full max-w-container-max mx-auto px-sm md:px-md lg:px-lg py-lg md:py-xl flex items-center justify-center">
          <div className="bg-surface-container-lowest border border-[#E2E8F0] rounded-[24px] p-lg shadow-xl max-w-md w-full text-center">
            <div className="w-12 h-12 bg-primary-fixed text-primary rounded-xl flex items-center justify-center mx-auto mb-6 animate-pulse">
              <span className="material-symbols-outlined text-[28px]">upload</span>
            </div>
            <h2 className="text-headline-sm font-headline-sm text-on-surface mb-xs">
              Uploading requested assets
            </h2>
            <p className="text-body-sm text-on-surface-variant mb-6">{uploadProgress}% complete</p>
            <div className="w-full bg-surface-container-high rounded-full h-2 overflow-hidden mb-6">
              <div
                className="h-full rounded-full progress-active"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <span className="text-label-sm font-label-sm text-primary">Speed: 45.2 MB/s</span>
          </div>
        </main>
      ) : (
        /* Double Column Grid matching code.html exactly */
        <main className="flex-grow w-full max-w-container-max mx-auto px-sm md:px-md lg:px-lg py-lg md:py-xl grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          {/* Left Column: File Canvas & Upload Area (8 cols on desktop) */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-md">
            <header className="mb-sm">
              <h1 className="text-headline-lg font-headline-lg text-on-surface">Transfer Files</h1>
              <p className="text-body-md font-body-md text-on-surface-variant mt-1">
                Upload and configure your files for secure delivery.
              </p>
            </header>

            {/* Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-outline-variant rounded-card bg-surface-container-lowest flex flex-col items-center justify-center py-xl px-md text-center transition-colors hover:border-primary hover:bg-[#F8FAFC] cursor-pointer group"
              id="drop-zone"
            >
              <input
                type="file"
                multiple
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="h-16 w-16 bg-surface-container-low rounded-full flex items-center justify-center mb-sm group-hover:bg-primary-fixed transition-colors shadow-sm">
                <span className="material-symbols-outlined text-3xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                  cloud_upload
                </span>
              </div>
              <h3 className="text-headline-sm font-headline-sm text-on-surface mb-1">
                Drag &amp; drop files here
              </h3>
              <p className="text-body-sm font-body-sm text-on-surface-variant mb-md">
                or click to browse from your computer
              </p>
              <button
                type="button"
                className="bg-surface-container-high text-on-surface font-label-md text-label-md px-6 py-2 rounded-button hover:bg-surface-container-highest transition-colors shadow-sm active:scale-95"
              >
                Browse Files
              </button>
            </div>

            {/* File List Section */}
            {files.length > 0 && (
              <div className="mt-md flex flex-col gap-sm">
                <div className="flex justify-between items-end mb-2">
                  <h2 className="text-label-md font-label-md text-on-surface-variant">
                    Uploading ({files.length} {files.length === 1 ? 'file' : 'files'})
                  </h2>
                  <span className="text-label-sm font-label-sm text-on-surface-variant">
                    {formatSize(totalBytes)} total
                  </span>
                </div>

                <div className="flex flex-col gap-sm">
                  {files.map((file, idx) => (
                    <div
                      key={idx}
                      className="bg-surface-container-lowest rounded-card p-md border border-[#E2E8F0] hover:shadow-sm transition-all flex items-center gap-md"
                    >
                      <div className="h-12 w-12 rounded-lg bg-surface-container flex items-center justify-center shrink-0 text-primary">
                        <span className="material-symbols-outlined">{getFileIcon(file.name)}</span>
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="flex justify-between items-baseline mb-1">
                          <h4 className="text-label-md font-label-md text-on-surface truncate pr-4">
                            {file.name}
                          </h4>
                          <span
                            className="material-symbols-outlined text-primary shrink-0 text-sm"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            check_circle
                          </span>
                        </div>
                        <div className="text-body-sm font-body-sm text-on-surface-variant">
                          <span>{formatSize(file.size)} • Ready to upload</span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(idx);
                        }}
                        className="text-on-surface-variant hover:text-error transition-colors p-2 shrink-0"
                      >
                        <span className="material-symbols-outlined text-xl">delete</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Configuration Panel (4 cols on desktop) */}
          <aside className="lg:col-span-5 xl:col-span-4 mt-lg lg:mt-0">
            <div className="bg-surface-container-lowest rounded-card p-md md:p-lg border border-[#E2E8F0] shadow-sm sticky top-[100px]">
              <h2 className="text-headline-sm font-headline-sm text-on-surface mb-md">
                Transfer Details
              </h2>
              <div className="flex flex-col gap-md">
                {/* Sender Email */}
                <div className="flex flex-col gap-base">
                  <label className="text-label-sm font-label-sm text-on-surface" htmlFor="sender-email">
                    From
                  </label>
                  <div className="relative rounded-lg">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-on-surface-variant">
                      <span className="material-symbols-outlined text-sm">person</span>
                    </div>
                    <input
                      className="block w-full pl-10 pr-3 py-2 bg-surface-container-lowest border border-[#E2E8F0] rounded-lg text-body-md font-body-md text-on-surface focus:outline-none focus:ring-0"
                      id="sender-email"
                      readOnly
                      type="email"
                      value={senderEmail}
                    />
                  </div>
                </div>

                {/* Recipient Emails */}
                <div className="flex flex-col gap-base">
                  <label className="text-label-sm font-label-sm text-on-surface" htmlFor="recipient-email">
                    To
                  </label>
                  <div className="rounded-lg border border-[#E2E8F0] bg-surface-container-lowest p-2 flex flex-wrap gap-2 items-center min-h-[44px]">
                    {recipientEmails.map((email) => (
                      <div
                        key={email}
                        className="bg-surface-container-high text-on-surface text-label-sm font-label-sm px-2 py-1 rounded-md flex items-center gap-1"
                      >
                        {email}
                        <button
                          onClick={() => removeRecipientEmail(email)}
                          className="hover:text-error transition-colors flex items-center"
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[14px]">close</span>
                        </button>
                      </div>
                    ))}
                    <input
                      className="flex-grow min-w-[120px] bg-transparent border-none p-0 text-body-md font-body-md focus:outline-none focus:ring-0 placeholder:text-on-surface-variant/50"
                      id="recipient-email"
                      placeholder="Add email & press Enter..."
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      onKeyDown={addRecipientEmail}
                    />
                  </div>
                </div>

                {/* Message */}
                <div className="flex flex-col gap-base">
                  <label className="text-label-sm font-label-sm text-on-surface" htmlFor="message">
                    Message (Optional)
                  </label>
                  <textarea
                    className="block w-full px-3 py-2 bg-surface-container-lowest border border-[#E2E8F0] rounded-lg text-body-md font-body-md text-on-surface focus:outline-none focus:ring-0 resize-none"
                    id="message"
                    placeholder="Here are the files for the Q3 campaign review..."
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>

                <hr className="border-[#E2E8F0] my-2" />

                {/* Advanced Options Toggle */}
                <div
                  className="flex items-center justify-between cursor-pointer group"
                  onClick={() => setAdvancedOpen(!advancedOpen)}
                >
                  <span className="text-label-md font-label-md text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors text-sm">
                      settings_applications
                    </span>
                    Advanced Options
                  </span>
                  <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors text-sm">
                    {advancedOpen ? 'expand_less' : 'expand_more'}
                  </span>
                </div>

                {/* Advanced Options Panel */}
                {advancedOpen && (
                  <div className="flex flex-col gap-md bg-surface p-md rounded-xl border border-surface-container-high mt-1 animate-fadeIn">
                    {/* Password Protection */}
                    <div className="flex flex-col gap-base">
                      <div className="flex items-center justify-between">
                        <label
                          className="text-label-sm font-label-sm text-on-surface flex items-center gap-1"
                          htmlFor="password"
                        >
                          <span className="material-symbols-outlined text-[14px]">lock</span> Password
                        </label>
                        <div
                          className={`w-8 h-4 rounded-full relative cursor-pointer transition-colors ${
                            password ? 'bg-primary' : 'bg-primary-container'
                          }`}
                          onClick={() => setPassword(password ? '' : '********')}
                        >
                          <div
                            className={`w-3 h-3 bg-on-primary rounded-full absolute top-0.5 transition-all ${
                              password ? 'right-0.5' : 'left-0.5'
                            }`}
                          ></div>
                        </div>
                      </div>
                      <input
                        className="block w-full px-3 py-2 bg-surface-container-lowest border border-[#E2E8F0] rounded-lg text-body-md font-body-md text-on-surface focus:outline-none focus:ring-0 mt-1"
                        id="password"
                        type="password"
                        placeholder="Enter password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>

                    {/* Expiration */}
                    <div className="flex flex-col gap-base">
                      <label className="text-label-sm font-label-sm text-on-surface flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">timer</span> Expiration
                      </label>
                      <div className="grid grid-cols-3 gap-2 mt-1">
                        <button
                          type="button"
                          onClick={() => setExpiresInDays(7)}
                          className={`text-center py-1.5 rounded-md border text-[10px] font-bold transition-all ${
                            expiresInDays === 7
                              ? 'bg-primary text-on-primary border-primary'
                              : 'bg-surface-container-lowest text-on-surface-variant border-[#E2E8F0]'
                          }`}
                        >
                          7 Days
                        </button>
                        <button
                          type="button"
                          onClick={() => setExpiresInDays(30)}
                          className={`text-center py-1.5 rounded-md border text-[10px] font-bold transition-all ${
                            expiresInDays === 30
                              ? 'bg-primary text-on-primary border-primary'
                              : 'bg-surface-container-lowest text-on-surface-variant border-[#E2E8F0]'
                          }`}
                        >
                          30 Days
                        </button>
                        <button
                          type="button"
                          onClick={() => setExpiresInDays(1)}
                          className={`text-center py-1.5 rounded-md border text-[10px] font-bold transition-all ${
                            expiresInDays === 1
                              ? 'bg-primary text-on-primary border-primary'
                              : 'bg-surface-container-lowest text-on-surface-variant border-[#E2E8F0]'
                          }`}
                          title="First Download Only"
                        >
                          1st DL
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Primary Action */}
                <button
                  onClick={handleStartTransfer}
                  className="w-full bg-primary text-on-primary font-bold text-xs py-3.5 rounded-button mt-2 hover:bg-primary-container transition-colors shadow flex items-center justify-center gap-2 group scale-98 active:scale-95"
                  type="button"
                >
                  Transfer Files
                  <span className="material-symbols-outlined text-sm group-hover:translate-x-0.5 transition-transform">
                    arrow_forward
                  </span>
                </button>
                <p className="text-center text-label-sm font-label-sm text-outline-variant mt-1 uppercase tracking-wider">
                  Ready to send {files.length} {files.length === 1 ? 'file' : 'files'} ({formatSize(totalBytes)})
                </p>
              </div>
            </div>
          </aside>
        </main>
      )}
    </div>
  );
};
