import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Sidebar } from '../components/Sidebar';

interface PortalFile {
  id: string;
  name: string;
  size: number;
  uploadedBy: string;
  uploadedAt: string;
  downloadsCount: number;
  type: 'pdf' | 'zip' | 'mp4' | 'img' | 'other';
  progress?: number;
}

interface ActivityItem {
  id: string;
  userName: string;
  actionText: React.ReactNode;
  timeText: string;
  icon: string;
  iconColorClass: string;
  commentText?: string;
}

export const ClientPortal: React.FC = () => {
  const { currentUser, setView } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Portal statistics
  const [storageUsed, setStorageUsed] = useState(45.2 * 1024 * 1024 * 1024); // 45.2 GB
  const storageLimit = 100 * 1024 * 1024 * 1024; // 100 GB
  const [activeUploadsCount, setActiveUploadsCount] = useState(2); // 2 uploading, 1 downloading initially
  const [totalFilesCount, setTotalFilesCount] = useState(1204);

  // Portal files list
  const [portalFiles, setPortalFiles] = useState<PortalFile[]>([
    {
      id: 'pf-1',
      name: 'Q3_Marketing_Report_Final.pdf',
      size: 2.4 * 1024 * 1024,
      uploadedBy: 'Sarah J.',
      uploadedAt: '10 mins ago',
      downloadsCount: 14,
      type: 'pdf',
    },
    {
      id: 'pf-2',
      name: 'Brand_Assets_2024.zip',
      size: 145 * 1024 * 1024,
      uploadedBy: 'Mike T.',
      uploadedAt: '2 hours ago',
      downloadsCount: 38,
      type: 'zip',
    },
  ]);

  // Activity Feed state
  const [activities, setActivities] = useState<ActivityItem[]>([
    {
      id: 'act-1',
      userName: 'Sarah J.',
      actionText: (
        <>
          uploaded{' '}
          <span className="font-medium text-primary cursor-pointer hover:underline">
            Q3_Marketing_Report_Final.pdf
          </span>
        </>
      ),
      timeText: '10 mins ago',
      icon: 'upload',
      iconColorClass: 'bg-primary-container text-on-primary-container',
    },
    {
      id: 'act-2',
      userName: 'David (Client)',
      actionText: (
        <>
          downloaded{' '}
          <span className="font-medium text-primary cursor-pointer hover:underline">
            Brand_Assets_2024.zip
          </span>
        </>
      ),
      timeText: '2 hours ago',
      icon: 'download',
      iconColorClass: 'bg-secondary-container text-on-secondary-container',
    },
    {
      id: 'act-3',
      userName: 'Mike T.',
      actionText: (
        <>
          commented on{' '}
          <span className="font-medium text-primary cursor-pointer hover:underline">
            Campaign_Video_v2.mp4
          </span>
        </>
      ),
      timeText: 'Yesterday',
      icon: 'comment',
      iconColorClass: 'bg-surface-variant text-on-surface',
      commentText: 'Please review the updated color grading at 0:45.',
    },
  ]);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleUploadFiles(Array.from(e.target.files));
    }
  };

  const handleUploadFiles = (files: File[]) => {
    files.forEach((file) => {
      const fileId = `pf-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
      const fileType = file.name.endsWith('.pdf') ? 'pdf' :
                       file.name.endsWith('.zip') || file.name.endsWith('.rar') ? 'zip' :
                       file.name.endsWith('.mp4') || file.name.endsWith('.mov') ? 'mp4' :
                       (file.type.startsWith('image/') || file.name.endsWith('.png') || file.name.endsWith('.jpg')) ? 'img' : 'other';

      const newFile: PortalFile = {
        id: fileId,
        name: file.name,
        size: file.size,
        uploadedBy: currentUser?.fullName || 'Sarah Chen',
        uploadedAt: 'Uploading...',
        downloadsCount: 0,
        type: fileType,
        progress: 0,
      };

      setPortalFiles((prev) => [newFile, ...prev]);
      setActiveUploadsCount((prev) => prev + 1);

      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 20) + 10;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);

          setPortalFiles((prev) =>
            prev.map((f) => {
              if (f.id === fileId) {
                const { progress, ...rest } = f;
                return {
                  ...rest,
                  uploadedAt: 'Just now',
                };
              }
              return f;
            })
          );

          setActiveUploadsCount((prev) => Math.max(0, prev - 1));
          setTotalFilesCount((prev) => prev + 1);
          setStorageUsed((prev) => prev + file.size);

          const newActivity: ActivityItem = {
            id: `act-${Date.now()}`,
            userName: currentUser?.fullName || 'Sarah Chen',
            actionText: (
              <>
                uploaded{' '}
                <span className="font-medium text-primary cursor-pointer hover:underline">
                  {file.name}
                </span>
              </>
            ),
            timeText: 'Just now',
            icon: 'upload',
            iconColorClass: 'bg-primary-container text-on-primary-container',
          };
          setActivities((prev) => [newActivity, ...prev]);
        } else {
          setPortalFiles((prev) =>
            prev.map((f) => {
              if (f.id === fileId) {
                return { ...f, progress };
              }
              return f;
            })
          );
        }
      }, 300);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUploadFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleDownloadFile = (file: PortalFile) => {
    setPortalFiles((prev) =>
      prev.map((f) => {
        if (f.id === file.id) {
          return { ...f, downloadsCount: f.downloadsCount + 1 };
        }
        return f;
      })
    );
    alert(`⬇️ Downloading ${file.name} (${formatSize(file.size)})`);

    const newActivity: ActivityItem = {
      id: `act-${Date.now()}`,
      userName: currentUser?.fullName || 'Sarah Chen',
      actionText: (
        <>
          downloaded{' '}
          <span className="font-medium text-primary cursor-pointer hover:underline">
            {file.name}
          </span>
        </>
      ),
      timeText: 'Just now',
      icon: 'download',
      iconColorClass: 'bg-secondary-container text-on-secondary-container',
    };
    setActivities((prev) => [newActivity, ...prev]);
  };

  const handleDeleteFile = (fileId: string, fileName: string) => {
    if (window.confirm(`Are you sure you want to delete "${fileName}"?`)) {
      const fileToDelete = portalFiles.find((f) => f.id === fileId);
      setPortalFiles((prev) => prev.filter((f) => f.id !== fileId));
      setTotalFilesCount((prev) => Math.max(0, prev - 1));
      if (fileToDelete) {
        setStorageUsed((prev) => Math.max(45.2 * 1024 * 1024 * 1024, prev - fileToDelete.size));
      }
    }
  };

  const handleSharePortal = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('📋 Partner Portal share link copied to clipboard!');
  };

  const handleTabChange = (tabId: string) => {
    setView('dashboard', { tab: tabId });
  };

  const storagePercentage = Math.min(100, (storageUsed / storageLimit) * 100);

  const getFileIconInfo = (type: PortalFile['type']) => {
    switch (type) {
      case 'pdf':
        return { icon: 'picture_as_pdf', colorClass: 'bg-error-container text-on-error-container' };
      case 'zip':
        return { icon: 'folder_zip', colorClass: 'bg-secondary-container text-on-secondary-container' };
      case 'mp4':
        return { icon: 'video_library', colorClass: 'bg-primary-container text-on-primary-container' };
      case 'img':
        return { icon: 'image', colorClass: 'bg-success-container text-on-success-container' };
      default:
        return { icon: 'insert_drive_file', colorClass: 'bg-slate-100 text-slate-500' };
    }
  };

  const filteredFiles = portalFiles.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex w-full">
      {/* SideNavBar */}
      <Sidebar activeTab="files" setActiveTab={handleTabChange} isAdmin={false} />

      {/* Main Content */}
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen bg-background">
        {/* Portal Header */}
        <header className="bg-surface border-b border-outline-variant/20 px-lg py-md sticky top-0 z-10 shadow-[0_4px_24px_rgba(77,130,195,0.04)] text-left">
          <div className="max-w-container-max mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-sm">
            <div className="flex items-center gap-md">
              <img
                className="w-12 h-12 rounded-lg object-cover border border-outline-variant/20"
                alt="Acme Agency Logo"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuALQPgfTzmpetj0r3cBOl-c5NRtqBtCU-_jqr3fU_HMLPHLfzFtu8mf7aRDyREo0Mc46ExnIMuavFSnGAN9trI-vE4ou5Ednr2BGwVKyOh-ssmpz6vigKzw0euuwB5GDf0q4sUzXZC7LvRibrqRPYUNHgfdyriJpvBtbRB8BBFJ4RPn83WgbuuiDpak_DFfVOHgMgFRldT_-d5r4Q0aKIkAUWUGg16O4FISDXX8AHde1nMDuG6Q_tgGoT7VV1mULp-aI_t5FEB_qq8"
              />
              <div>
                <h2 className="text-headline-md font-display font-semibold text-on-surface">
                  Acme Agency Workspace
                </h2>
                <p className="text-body-sm text-on-surface-variant flex items-center gap-xs mt-0.5">
                  <span className="material-symbols-outlined text-[16px]">person</span>
                  Client: Global Corp
                </p>
              </div>
            </div>
            <div className="flex items-center gap-sm mt-3 md:mt-0">
              <button
                onClick={() => setView('request')}
                className="bg-primary-container text-on-primary-container hover:bg-secondary-container transition-colors py-2.5 px-4 rounded-xl font-semibold text-xs flex items-center gap-1.5 shadow-sm active:scale-98"
              >
                <span className="material-symbols-outlined text-[20px]">move_to_inbox</span>
                Request Files
              </button>
              <button
                onClick={handleSharePortal}
                className="bg-surface-container-high text-on-surface hover:bg-surface-variant transition-colors py-2.5 px-4 rounded-xl font-semibold text-xs flex items-center gap-1.5 border border-outline-variant/20 shadow-sm active:scale-98"
              >
                <span className="material-symbols-outlined text-[20px]">share</span>
                Share Portal
              </button>
            </div>
          </div>
        </header>

        <div className="p-lg max-w-container-max mx-auto w-full flex-1 flex flex-col xl:flex-row gap-lg text-left">
          {/* Main Repository Area */}
          <div className="flex-1 flex flex-col gap-md">
            {/* Quick Stats Bento */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-sm">
              <div className="bg-surface p-md rounded-2xl border border-surface-container-high shadow-[0_8px_32px_rgba(77,130,195,0.04)] relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-8 -mt-8 pointer-events-none"></div>
                <div>
                  <p className="text-label-md text-on-surface-variant mb-xs">Storage Used</p>
                  <p className="text-headline-lg font-display text-primary font-bold">
                    {formatSize(storageUsed)}
                  </p>
                </div>
                <div className="h-2 bg-surface-container w-full rounded-full overflow-hidden mt-4">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-300"
                    style={{ width: `${storagePercentage}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-surface p-md rounded-2xl border border-surface-container-high shadow-[0_8px_32px_rgba(77,130,195,0.04)] flex flex-col justify-between">
                <div className="flex justify-between items-start mb-xs">
                  <p className="text-label-md text-on-surface-variant">Active Transfers</p>
                  <span className="material-symbols-outlined text-primary">autorenew</span>
                </div>
                <div>
                  <p className="text-headline-lg font-display text-on-surface font-bold">
                    {activeUploadsCount + 1}
                  </p>
                  <p className="text-body-sm text-tertiary mt-1">
                    {activeUploadsCount} uploading, 1 downloading
                  </p>
                </div>
              </div>

              <div className="bg-surface p-md rounded-2xl border border-surface-container-high shadow-[0_8px_32px_rgba(77,130,195,0.04)] flex flex-col justify-between">
                <div className="flex justify-between items-start mb-xs">
                  <p className="text-label-md text-on-surface-variant">Total Files</p>
                  <span className="material-symbols-outlined text-primary">description</span>
                </div>
                <div>
                  <p className="text-headline-lg font-display text-on-surface font-bold">
                    {totalFilesCount.toLocaleString()}
                  </p>
                  <p className="text-body-sm text-tertiary mt-1">Across 12 projects</p>
                </div>
              </div>
            </div>

            {/* Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleBrowseClick}
              className={`border-2 border-dashed transition-all rounded-2xl p-lg flex flex-col items-center justify-center text-center cursor-pointer group shadow-[0_4px_24px_rgba(77,130,195,0.02)] ${
                isDragging
                  ? 'border-primary bg-surface-container-low scale-[1.01]'
                  : 'border-outline-variant/50 bg-surface hover:bg-surface-container-low hover:border-primary/50'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                multiple
              />
              <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mb-sm group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-primary text-[32px]">cloud_upload</span>
              </div>
              <h3 className="text-headline-sm font-semibold text-on-surface mb-xs">
                Drag &amp; drop files here
              </h3>
              <p className="text-body-md text-on-surface-variant mb-md max-w-md">
                Upload assets directly to the Global Corp shared repository. Supported formats: ZIP,
                PDF, MP4, FIG.
              </p>
              <button
                type="button"
                className="bg-primary hover:bg-primary-container text-white py-2.5 px-6 rounded-xl font-semibold text-xs hover:shadow-md transition-all active:scale-95"
              >
                Browse Files
              </button>
            </div>

            {/* File List */}
            <div className="bg-surface rounded-2xl border border-surface-container-high shadow-[0_8px_32px_rgba(77,130,195,0.04)] flex-1 flex flex-col">
              <div className="p-md border-b border-surface-container-high flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <h3 className="text-headline-sm font-semibold text-on-surface">Recent Files</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Search shared files..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="px-4 py-1.5 border border-slate-200 rounded-xl text-xs w-full sm:w-52 focus:outline-none focus:border-primary"
                  />
                  <div className="flex gap-1 shrink-0">
                    <button className="p-1.5 text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors">
                      <span className="material-symbols-outlined text-[20px]">grid_view</span>
                    </button>
                    <button className="p-1.5 text-primary bg-primary/10 rounded-lg transition-colors">
                      <span className="material-symbols-outlined text-[20px]">format_list_bulleted</span>
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex flex-col p-sm gap-xs">
                {filteredFiles.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <span className="material-symbols-outlined text-[36px] mb-2">cloud_off</span>
                    <p className="text-xs font-semibold">No matching files found.</p>
                  </div>
                ) : (
                  filteredFiles.map((file) => {
                    const iconInfo = getFileIconInfo(file.type);
                    const isUploading = file.progress !== undefined;

                    return (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-sm hover:bg-surface-container-low rounded-xl transition-all group border border-transparent hover:border-outline-variant/20"
                      >
                        <div className="flex items-center gap-md flex-1 min-w-0 pr-4">
                          <div
                            className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${iconInfo.colorClass}`}
                          >
                            <span className="material-symbols-outlined">{iconInfo.icon}</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-label-md text-on-surface font-semibold truncate">
                              {file.name}
                            </p>
                            {isUploading ? (
                              <div className="flex items-center gap-3 mt-1.5">
                                <div className="h-1.5 bg-slate-100 flex-1 rounded-full overflow-hidden max-w-xs">
                                  <div
                                    className="h-full bg-primary rounded-full transition-all duration-300"
                                    style={{ width: `${file.progress}%` }}
                                  ></div>
                                </div>
                                <span className="text-[10px] font-bold text-primary shrink-0">
                                  {file.progress}%
                                </span>
                              </div>
                            ) : (
                              <p className="text-body-sm text-on-surface-variant truncate mt-0.5">
                                Uploaded by {file.uploadedBy} • {formatSize(file.size)}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-sm">
                          {!isUploading ? (
                            <>
                              <button
                                onClick={() => handleDownloadFile(file)}
                                className="p-2 text-on-surface-variant hover:text-primary transition-colors hover:bg-slate-100 rounded-xl"
                                title="Download File"
                              >
                                <span className="material-symbols-outlined text-[20px]">download</span>
                              </button>
                              <button
                                onClick={() => handleDeleteFile(file.id, file.name)}
                                className="p-2 text-on-surface-variant hover:text-red-600 transition-colors hover:bg-red-50 rounded-xl"
                                title="Delete File"
                              >
                                <span className="material-symbols-outlined text-[20px]">delete</span>
                              </button>
                            </>
                          ) : (
                            <span className="text-[10px] font-semibold text-slate-400 px-3 py-1">
                              Processing
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Sidebar: Activity Feed */}
          <div className="w-full xl:w-80 flex flex-col gap-md">
            <div className="bg-surface rounded-2xl border border-surface-container-high shadow-[0_8px_32px_rgba(77,130,195,0.04)] flex-1 p-md flex flex-col">
              <h3 className="text-headline-sm font-semibold text-on-surface mb-md">Activity Feed</h3>
              <div className="relative before:absolute before:inset-y-0 before:left-[15px] before:w-px before:bg-outline-variant/30 flex flex-col gap-md flex-1">
                {activities.map((act) => (
                  <div key={act.id} className="relative flex gap-sm items-start">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 border-4 border-surface ${act.iconColorClass}`}
                    >
                      <span className="material-symbols-outlined text-[16px]">{act.icon}</span>
                    </div>
                    <div className="pt-0.5 min-w-0 flex-1">
                      <p className="text-body-sm text-on-surface leading-normal">
                        <span className="font-semibold text-slate-800">{act.userName}</span>{' '}
                        {act.actionText}
                      </p>
                      {act.commentText && (
                        <div className="bg-surface-container-low p-xs rounded-lg mt-xs border border-outline-variant/10 text-body-sm text-on-surface-variant italic leading-relaxed">
                          "{act.commentText}"
                        </div>
                      )}
                      <p className="text-label-sm text-on-surface-variant mt-1">{act.timeText}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
