import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import type { SharedFolderFile } from '../context/AppContext';
import { Sidebar } from '../components/Sidebar';
import { supabase } from '../utils/supabaseClient';
import { getAppUrl } from '../utils/url';
import { useDarkMode } from '../hooks/useDarkMode';

export const Dashboard: React.FC = () => {
  const {
    currentUser,
    setCurrentUser,
    users,
    setUsers,
    transfers,
    setTransfers,
    downloadLogs,
    viewParams,
    createTransfer,

    sharedFolders,
    sharedFolderMembers,
    sharedFolderFiles,
    setSharedFolderFiles,
    sharedFolderActivities,
    createSharedFolder,
    updateSharedFolder,
    deleteSharedFolder,
    addSharedFolderFile,
    deleteSharedFolderFile,
    inviteSharedFolderMember,
    deleteSharedFolderMember,
    logSharedFolderActivity,
    fileRequests,
    createFileRequest,
    deleteFileRequest,
    logout
  } = useApp();

  const { dark, toggle: toggleDark } = useDarkMode();

  // User Profile Dropdown State
  const [showProfileDropdown, setShowProfileDropdown] = useState<boolean>(false);
  const [showAccountDetailsModal, setShowAccountDetailsModal] = useState<boolean>(false);
  const [accFirstName, setAccFirstName] = useState<string>('');
  const [accLastName, setAccLastName] = useState<string>('');
  const [accEmail, setAccEmail] = useState<string>('');
  const [accDobDay, setAccDobDay] = useState<string>('10');
  const [accDobMonth, setAccDobMonth] = useState<string>('June');
  const [accDobYear, setAccDobYear] = useState<string>('1990');
  const [accGender, setAccGender] = useState<string>('Female');
  const [accTab, setAccTab] = useState<'details' | 'shipping' | 'payment'>('details');

  useEffect(() => {
    if (currentUser) {
      const nameParts = currentUser.fullName.split(' ');
      setAccFirstName(nameParts[0] || '');
      setAccLastName(nameParts.slice(1).join(' ') || '');
      setAccEmail(currentUser.email);
    }
  }, [currentUser]);

  // Folder dropdown menu state
  const [activeFolderMenuId, setActiveFolderMenuId] = useState<string | null>(null);

  // Chat States & Poller
  const [showChatDrawer, setShowChatDrawer] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<{
    id: string;
    senderEmail: string;
    recipientEmail: string;
    message: string;
    createdAt: string;
  }[]>([]);
  const [selectedChatUserEmail, setSelectedChatUserEmail] = useState<string | null>(null);
  const [newMessageText, setNewMessageText] = useState<string>('');
  const [inviteEmailText, setInviteEmailText] = useState<string>('');

  const fetchChatMessages = useCallback(async () => {
    if (!currentUser) return;
    try {
      const { data, error } = await supabase
        .from('workspace_messages')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (!error && data) {
        setChatMessages(data.map((m: any) => ({
          id: m.id,
          senderEmail: m.sender_email,
          recipientEmail: m.recipient_email,
          message: m.message,
          createdAt: m.created_at
        })));
      }
    } catch (e) {
      console.error(e);
    }
  }, [currentUser]);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, selectedChatUserEmail]);

  useEffect(() => {
    if (!currentUser) return;
    fetchChatMessages();
    const interval = setInterval(fetchChatMessages, 3000);
    return () => clearInterval(interval);
  }, [currentUser, fetchChatMessages]);

  // File Request States
  const [showCreateRequestModal, setShowCreateRequestModal] = useState<boolean>(false);
  const [reqTitle, setReqTitle] = useState<string>('');
  const [reqDescription, setReqDescription] = useState<string>('');
  const [reqFolderId, setReqFolderId] = useState<string>('');
  const [reqClientEmail, setReqClientEmail] = useState<string>('');


  const [activeTab, setActiveTab] = useState<string>(viewParams?.tab || 'overview');

  // Shared Folders States
  const [selectedSharedFolderId, setSelectedSharedFolderId] = useState<string | null>(null);
  const [sharedFolderTab, setSharedFolderTab] = useState<'overview' | 'files' | 'members' | 'activity' | 'analytics' | 'settings'>('overview');
  const [showCreateFolderModal, setShowCreateFolderModal] = useState<boolean>(false);
  const [currentFolderPath, setCurrentFolderPath] = useState<string>(''); // For nested folders like 'Assets/Logos'
  
  // Create Shared Folder Form
  const [sfName, setSfName] = useState<string>('');
  const [sfDescription, setSfDescription] = useState<string>('');

  const [sfIcon, setSfIcon] = useState<string>('folder');
  const [sfColor, setSfColor] = useState<string>('#4f46e5');
  const [sfPublicShareEnabled, setSfPublicShareEnabled] = useState<boolean>(false);
  const [sfPublicSharePermission, setSfPublicSharePermission] = useState<'view' | 'download' | 'upload'>('view');
  const [sfExpiresAt, setSfExpiresAt] = useState<string>('');
  const [sfPassword, setSfPassword] = useState<string>('');
  const [sfInviteEmail, setSfInviteEmail] = useState<string>('');
  const [sfInviteRole, setSfInviteRole] = useState<'viewer' | 'contributor' | 'manager'>('viewer');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
  }, []);

  useEffect(() => {
    setSelectedSharedFolderId(null);
    setSharedFolderTab('overview');
    setCurrentFolderPath('');
  }, [activeTab]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);  const alert = useCallback((message: string) => {
    const isError = message.toLowerCase().includes('error') || 
                    message.toLowerCase().includes('please select') || 
                    message.toLowerCase().includes('fill out') || 
                    message.toLowerCase().includes('no new notifications');
    showToast(message, isError ? 'error' : 'success');
  }, [showToast]);

  const [newSubfolderName, setNewSubfolderName] = useState<string>('');
  const [showNewSubfolderModal, setShowNewSubfolderModal] = useState<boolean>(false);
  const [showChooseExistingModal, setShowChooseExistingModal] = useState<boolean>(false);

  // Delivery Wizard states
  const [showCreateDeliveryModal, setShowCreateDeliveryModal] = useState<boolean>(false);

  const [delFiles, setDelFiles] = useState<File[]>([]);
  const [delRecipients, setDelRecipients] = useState<string[]>([]);
  const [delManualRecipient, setDelManualRecipient] = useState<string>('');
  const [delTitle, setDelTitle] = useState<string>('');
  const [delPassword, setDelPassword] = useState<string>('');
  const [deliveryProgress, setDeliveryProgress] = useState<number>(0);
  const [isDelivering, setIsDelivering] = useState<boolean>(false);


  // AI Search states
  const [aiSearchQuery, setAiSearchQuery] = useState<string>('');
  const [aiSearchResult, setAiSearchResult] = useState<any[] | null>(null);
  const [isAiSearching, setIsAiSearching] = useState<boolean>(false);

  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [shareLink, setShareLink] = useState<string>('');
  const [shareEmail, setShareEmail] = useState<string>('');
  const [selectedShareTransferId, setSelectedShareTransferId] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const [showNewTransferModal, setShowNewTransferModal] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [newTransferFiles, setNewTransferFiles] = useState<File[]>([]);
  const [newTransferTitle, setNewTransferTitle] = useState<string>('');
  const [newTransferRecipient, setNewTransferRecipient] = useState<string>('');
  const [newTransferPassword, setNewTransferPassword] = useState<string>('');
  const modalFileInputRef = useRef<HTMLInputElement>(null);

  // Search filter
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    if (viewParams?.tab) {
      setActiveTab(viewParams.tab);
    }
  }, [viewParams?.tab]);

  const userTransfers = useMemo(() => {
    const myEmail = (currentUser?.email || '').toLowerCase().trim();

    const filtered = transfers.filter((t) => {
      const sender = (t.senderEmail || '').toLowerCase().trim();
      const myOwner = (currentUser?.joinedWorkspace || '').toLowerCase().trim();
      
      const isRecipient = t.recipientEmails && t.recipientEmails.some(r => r.toLowerCase().trim() === myEmail);
      const isPublicWorkspaceFile = !t.recipientEmails || t.recipientEmails.length === 0;

      return sender === myEmail || isRecipient || (myOwner && sender === myOwner && isPublicWorkspaceFile);
    });
    const unique: typeof filtered = [];
    const seen = new Set<string>();
    filtered.forEach(t => {
      if (!seen.has(t.id)) {
        seen.add(t.id);
        unique.push(t);
      }
    });
    return unique;
  }, [transfers, currentUser?.email, currentUser?.joinedWorkspace]);

  const allFiles = useMemo(() => {
    return userTransfers.flatMap((t) => t.files.map(f => ({
      ...f,
      senderEmail: t.senderEmail,
      transfer: t
    })));
  }, [userTransfers]);



  // Storage Limit (based on plan)
  const getStorageLimit = () => {
    switch (currentUser?.plan) {
      case 'pro':
        return 100 * 1024 * 1024 * 1024; // 100 GB
      case 'business':
        return 1024 * 1024 * 1024 * 1024; // 1 TB
      case 'enterprise':
        return 10 * 1024 * 1024 * 1024 * 1024; // 10 TB
      default:
        return 2 * 1024 * 1024 * 1024; // 2 GB
    }
  };

  const limit = getStorageLimit();
  const totalStorageUsed = userTransfers.reduce((acc, t) => acc + t.storageUsed, 0);
  const storagePercentage = Math.min(100, (totalStorageUsed / limit) * 100);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleCopyLink = (link: string, transferId?: string) => {
    setShareLink(link);
    setShareEmail('');
    setSelectedShareTransferId(transferId || '');
    setShowShareModal(true);
  };



  // Modal file handlers
  const handleModalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (selected) {
      setNewTransferFiles((prev) => [...prev, ...Array.from(selected)]);
    }
  };

  const handleModalDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files;
    if (dropped) {
      setNewTransferFiles((prev) => [...prev, ...Array.from(dropped)]);
    }
  };

  const handleStartModalUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTransferFiles.length === 0) {
      alert('Please select at least one file.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          
          const transferFiles = newTransferFiles.map((f, i) => ({
            id: `f_modal_${Date.now()}_${i}`,
            name: f.name,
            size: f.size,
            mimeType: f.type,
            uploadedAt: new Date().toISOString(),
            downloadsCount: 0
          }));

          const expiryDate = new Date();
          expiryDate.setDate(expiryDate.getDate() + 7);

          const totalSize = transferFiles.reduce((acc, tf) => acc + tf.size, 0);

          createTransfer({
            title: newTransferTitle || newTransferFiles[0].name || 'Shared Transfer',
            message: 'Uploaded via New Transfer modal',
            senderEmail: currentUser?.email || 'user@example.com',
            recipientEmails: newTransferRecipient ? [newTransferRecipient] : undefined,
            files: transferFiles,
            isPublic: true,
            passwordProtected: !!newTransferPassword,
            password: newTransferPassword || undefined,
            expiresAt: expiryDate.toISOString(),
            storageUsed: totalSize,
          });

          setIsUploading(false);
          setNewTransferFiles([]);
          setNewTransferTitle('');
          setNewTransferRecipient('');
          setNewTransferPassword('');
          setShowNewTransferModal(false);
          alert('🎉 Transfer successfully created and uploaded!');
          return 100;
        }
        return prev + 10;
      });
    }, 120);
  };

  // AI Search parser
  const handleAISearch = (query: string) => {
    if (!query) {
      setAiSearchResult(null);
      return;
    }
    setIsAiSearching(true);
    setTimeout(() => {
      const q = query.toLowerCase().trim();
      let results: any[] = [];
      
      if (q.includes('contract')) {
        results = transfers.filter(t => t.title.toLowerCase().includes('contract')).map(t => ({ type: 'delivery', name: t.title, details: `Sent to: ${t.recipientEmails?.[0] || 'N/A'}` }));
      } else {
        const matchesTransfers = transfers.filter(t => t.title.toLowerCase().includes(q));
        results = matchesTransfers.map(t => ({ type: 'delivery', name: t.title, details: `${t.files.length} files` }));
      }
      
      setAiSearchResult(results);
      setIsAiSearching(false);
    }, 650);
  };


  // Delivery wizard submission
  const handleCreateDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (delFiles.length === 0) {
      alert('Please select at least one file.');
      return;
    }

    setIsDelivering(true);
    setDeliveryProgress(0);

    try {
      const transferId = `t_${Date.now()}`;
      const filesArray = [];

      for (let i = 0; i < delFiles.length; i++) {
        const file = delFiles[i];
        const filePath = `${transferId}/${file.name}`;
        
        // Real upload to Supabase storage bucket 'transfers'
        const { error } = await supabase.storage
          .from('transfers')
          .upload(filePath, file, { cacheControl: '3600', upsert: true });

        if (error) {
          console.error('Storage upload failed:', error);
          throw error;
        }

        filesArray.push({
          id: `f_del_${Date.now()}_${i}`,
          name: file.name,
          size: file.size,
          mimeType: file.type,
          uploadedAt: new Date().toISOString(),
          downloadsCount: 0
        });

        // Set progress based on files uploaded
        setDeliveryProgress(Math.round(((i + 1) / delFiles.length) * 100));
      }

      const totalSize = filesArray.reduce((acc, tf) => acc + tf.size, 0);
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 14); // 2 weeks default

      const finalRecipients = [...delRecipients];
      if (delManualRecipient) finalRecipients.push(delManualRecipient);

      createTransfer({
        id: transferId,
        title: delTitle || 'Shared Files',
        message: 'Project delivery files',
        senderEmail: currentUser?.email || 'owner@zoto.com',
        recipientEmails: finalRecipients.length > 0 ? finalRecipients : undefined,
        files: filesArray,
        isPublic: !delPassword,
        passwordProtected: !!delPassword,
        password: delPassword || undefined,
        expiresAt: expiryDate.toISOString(),
        storageUsed: totalSize
      });

      setIsDelivering(false);
      setDelFiles([]);
      setDelRecipients([]);
      setDelManualRecipient('');
      setDelTitle('');
      setDelPassword('');
      setShowCreateDeliveryModal(false);
      alert('🚚 Delivery successfully dispatched!');
    } catch (err) {
      setIsDelivering(false);
      alert('❌ Failed to upload files. Please try again.');
    }
  };


  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden w-full">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isAdmin={false} />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-8 text-left">
        {/* Header bar */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/[0.07] pb-5 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white capitalize">
              {activeTab === 'intelligence' ? 'Transfer Intelligence™' : activeTab === 'insights_center' ? 'Insights Center™' : activeTab === 'vault' ? 'Vault™' : activeTab}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {activeTab === 'overview' ? 'Quick overview of your workspace, recent deliveries and shared directories.' :
               activeTab === 'deliveries' ? 'Manage and track your active and historical file transfers.' :
               activeTab === 'shared_folders' ? 'Collaborate on shared workspace folders and manage directory structures.' :
               activeTab === 'file_requests' ? 'Create and track file requests sent to clients or external guest partners.' :
               activeTab === 'intelligence' ? 'Analyze and extract key information from your documents using AI.' :
               activeTab === 'insights_center' ? 'Explore charts and metrics about your transfer history and usage.' :
               activeTab === 'vault' ? 'Secure, end-to-end encrypted storage vault for highly confidential assets.' :
               activeTab === 'settings' ? 'Manage account credentials, profile settings and billing preferences.' :
               'Manage and track your transfer activities'}
            </p>
          </div>
          {currentUser && (
            <div className="flex items-center gap-3.5 relative">
              {/* Dark mode toggle */}
              <button
                onClick={toggleDark}
                title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
                className="w-10 h-10 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.06] hover:bg-slate-50 dark:hover:bg-white/10 text-slate-600 dark:text-white/80 flex items-center justify-center transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {dark ? 'light_mode' : 'dark_mode'}
                </span>
              </button>

              {/* Header Chat Toggle Icon Button */}
              <button
                onClick={() => setShowChatDrawer(!showChatDrawer)}
                className="w-10 h-10 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.06] hover:bg-slate-50 dark:hover:bg-white/10 hover:border-primary/30 text-slate-600 dark:text-white/80 flex items-center justify-center transition-all duration-300 ease-out cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:rotate-12 active:translate-y-0 active:scale-95 relative"
                title="Workspace Chat"
              >
                <span className="material-symbols-outlined text-[18px]">forum</span>
                <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full bg-primary border-2 border-white dark:border-[#1a1a1f] animate-pulse" />
              </button>

              {/* Separator */}
              <div className="w-[1px] h-6 bg-slate-200 dark:bg-white/10 mx-0.5" />

              {/* Vertically Centered Profile Block */}
              <div className="flex items-center gap-2.5">
                {/* Gradient Outline Avatar Button */}
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="w-10 h-10 p-[2px] bg-gradient-to-tr from-yellow-400 via-orange-500 to-pink-500 rounded-full hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center shadow-md relative"
                >
                  {currentUser.avatarUrl ? (
                    <img
                      alt={currentUser.fullName}
                      src={currentUser.avatarUrl}
                      className="w-full h-full object-cover rounded-full border-2 border-white"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs border border-white">
                      {currentUser.fullName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </button>

                {/* Left-Aligned Metadata Labels */}
                <div className="flex flex-col text-left select-none justify-center">
                  <span className="text-[13px] font-extrabold text-slate-800 dark:text-white capitalize leading-none mb-1">
                    {(currentUser.fullName || currentUser.email.split('@')[0]).replace(/`/g, '')}
                  </span>
                  <span className={`text-[8.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border w-fit mr-auto mt-0.5 flex items-center justify-center leading-none ${
                    (currentUser.plan || 'Free').toLowerCase() === 'pro' 
                      ? 'bg-amber-50 text-amber-700 border-amber-200/50' 
                      : (currentUser.plan || 'Free').toLowerCase() === 'enterprise'
                      ? 'bg-purple-50 text-purple-700 border-purple-200/50'
                      : 'bg-slate-50/80 text-slate-500 border-slate-200/50'
                  }`}>
                    {currentUser.plan || 'Free'} Workspace
                  </span>
                </div>
              </div>

              {/* Premium Profile Dropdown Menu */}
              {showProfileDropdown && (
                <>
                  {/* Backdrop overlay to close when clicking outside */}
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowProfileDropdown(false)} 
                  />
                  <div className="absolute right-0 top-11 w-56 bg-white rounded-3xl border border-slate-100 shadow-2xl z-50 p-2 flex flex-col gap-0.5 text-left transform origin-top-right transition-all scale-100">
                    <button
                      onClick={() => {
                        setShowAccountDetailsModal(true);
                        setShowProfileDropdown(false);
                      }}
                      className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs font-semibold w-full text-slate-700 hover:bg-slate-50 transition-all text-left"
                    >
                      <span className="material-symbols-outlined text-[18px]">person</span>
                      <span>Profile</span>
                    </button>
                    <button
                      onClick={() => {
                        alert('💬 Join the ZotoTransfer community soon!');
                        setShowProfileDropdown(false);
                      }}
                      className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs font-semibold w-full text-slate-700 hover:bg-slate-50 transition-all text-left"
                    >
                      <span className="material-symbols-outlined text-[18px]">forum</span>
                      <span>Community</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('settings');
                        setShowProfileDropdown(false);
                      }}
                      className="flex items-center justify-between px-4 py-2.5 rounded-2xl text-xs font-semibold w-full text-slate-700 hover:bg-slate-50 transition-all text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="material-symbols-outlined text-[18px]">credit_card</span>
                        <span>Subscription</span>
                      </div>
                      <span className="bg-purple-100 text-purple-700 text-[9px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-0.5 uppercase tracking-wide">
                        <span className="material-symbols-outlined text-[10px]">flash_on</span>
                        <span>PRO</span>
                      </span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('settings');
                        setShowProfileDropdown(false);
                      }}
                      className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs font-semibold w-full text-slate-700 hover:bg-slate-50 transition-all text-left"
                    >
                      <span className="material-symbols-outlined text-[18px]">settings</span>
                      <span>Settings</span>
                    </button>
                    
                    <div className="border-t border-slate-100 my-1" />

                    <button
                      onClick={() => {
                        alert('ℹ️ Visit ZotoTransfer Help Center for guides.');
                        setShowProfileDropdown(false);
                      }}
                      className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs font-semibold w-full text-slate-700 hover:bg-slate-50 transition-all text-left"
                    >
                      <span className="material-symbols-outlined text-[18px]">info</span>
                      <span>Help center</span>
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        setShowProfileDropdown(false);
                      }}
                      className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs font-semibold w-full text-red-650 hover:bg-red-50 transition-all text-left"
                    >
                      <span className="material-symbols-outlined text-[18px]">logout</span>
                      <span>Sign out</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* 1. Overview Tab */}
        {activeTab === 'overview' && (
          <div className="flex flex-col gap-8">
            {/* Stats Dashboard Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm relative overflow-hidden">
                <span className="material-symbols-outlined text-emerald-500 text-[32px] mb-4">send</span>
                <h4 className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Total Deliveries</h4>
                <p className="text-3xl font-extrabold text-slate-950">{transfers.length}</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm relative overflow-hidden">
                <span className="material-symbols-outlined text-indigo-500 text-[32px] mb-4">download_done</span>
                <h4 className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Total Downloads</h4>
                <p className="text-3xl font-extrabold text-slate-950">
                  {transfers.reduce((acc, t) => acc + t.downloads, 0)}
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm relative overflow-hidden flex flex-col justify-between">
                <div>
                  <h4 className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-2">Storage Usage</h4>
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-2xl font-extrabold text-slate-950">{formatSize(totalStorageUsed)}</span>
                    <span className="text-xs text-slate-500 font-semibold">of {formatSize(limit)}</span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-primary h-full rounded-full" style={{ width: `${storagePercentage}%` }} />
                </div>
              </div>
            </div>

            {/* Split Grid for Recent Deliveries and Last Folders */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Deliveries list */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                <h3 className="text-base font-bold text-slate-950 mb-6">Recent Project Deliveries</h3>
                {transfers.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <span className="material-symbols-outlined text-[48px] mb-2 block">cloud_off</span>
                    <p className="text-xs font-semibold">No deliveries created yet.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {transfers.slice(0, 5).map((t) => {
                      return (
                        <div key={t.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between border border-slate-100 rounded-2xl p-4 bg-slate-50/50 hover:bg-slate-50 transition-colors gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center font-bold text-slate-550">
                              D
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold text-slate-800">{t.title}</h4>
                              <p className="text-[10px] text-slate-500 mt-1">
                                Expires: {new Date(t.expiresAt).toLocaleDateString()} • {t.files.length} Files • {formatSize(t.storageUsed)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleCopyLink(`${getAppUrl()}/#/t/${t.shortLink}`, t.id)}
                              className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold transition-all scale-98 active:scale-95 shadow-sm cursor-pointer animate-none"
                            >
                              Copy Link
                            </button>
                            <span className="text-xs font-bold text-slate-550 bg-slate-100 border border-slate-200 px-3 py-2 rounded-xl whitespace-nowrap">
                              {t.downloads} Downloads
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Last Folders list */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                <h3 className="text-base font-bold text-slate-950 mb-6">Last Folders</h3>
                {sharedFolders.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <span className="material-symbols-outlined text-[48px] mb-2 block">folder_off</span>
                    <p className="text-xs font-semibold">No shared folders created yet.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {sharedFolders.slice(0, 5).map((folder) => {
                      const fFiles = sharedFolderFiles.filter(f => f.folderId === folder.id && f.name !== '.dir');
                      return (
                        <div key={folder.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between border border-slate-100 rounded-2xl p-4 bg-slate-50/50 hover:bg-slate-50 transition-colors gap-4">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                              style={{ backgroundColor: folder.color || '#4f46e5' }}
                            >
                              <span className="material-symbols-outlined text-[20px]">
                                {folder.icon || 'folder'}
                              </span>
                            </div>
                            <div className="text-left">
                              <h4 className="text-sm font-semibold text-slate-800">{folder.name}</h4>
                              <p className="text-[10px] text-slate-500 mt-1">
                                Created: {new Date(folder.createdAt).toLocaleDateString()} • {fFiles.length} Files
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedSharedFolderId(folder.id);
                              setActiveTab('shared_folders');
                              setCurrentFolderPath('');
                            }}
                            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold transition-all scale-98 active:scale-95 shadow-sm cursor-pointer"
                          >
                            Open Folder
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 3. Deliveries Tab */}
        {activeTab === 'deliveries' && (
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center bg-white border border-slate-200 rounded-[24px] p-6 shadow-sm">
              <div className="text-left">
                <h3 className="text-sm font-bold text-slate-900">Company Delivery Dispatches</h3>
                <p className="text-[10px] text-slate-500 font-medium">Link dispatches directly to client folders.</p>
              </div>
              <button
                onClick={() => setShowCreateDeliveryModal(true)}
                className="bg-primary hover:bg-primary-container text-white py-2.5 px-5 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">send</span>
                <span>Create Delivery</span>
              </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              {transfers.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <span className="material-symbols-outlined text-[48px] mb-2">send</span>
                  <p className="text-xs font-semibold">No dispatches created yet.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {transfers.map((t) => {
                    return (
                      <div key={t.id} className="flex flex-col md:flex-row justify-between items-start md:items-center border border-slate-100 rounded-2xl p-4 bg-slate-50/50 hover:bg-slate-50 transition-colors gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center font-bold text-slate-550 border">
                            D
                          </div>
                          <div className="text-left">
                            <h5 className="text-sm font-semibold text-slate-800">{t.title}</h5>
                            <p className="text-[10px] text-slate-500 mt-1">
                              Recipients: {t.recipientEmails?.join(', ') || 'Public link'} • Files: {t.files.length} • Size: {formatSize(t.storageUsed)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="email"
                            placeholder="Assign Recipient Email..."
                            value={t.recipientEmails?.[0] || ''}
                            onChange={async (e) => {
                              const email = e.target.value.toLowerCase().trim();
                              setTransfers(prev => prev.map(item => item.id === t.id ? { ...item, recipientEmails: email ? [email] : [] } : item));
                              await supabase.from('transfers').update({ recipient_email: email || null }).eq('id', t.id);
                            }}
                            className="px-2.5 py-1.5 border rounded-xl text-xs bg-white text-slate-700 focus:outline-none shadow-sm w-44"
                          />
                          <button
                            onClick={() => handleCopyLink(`${getAppUrl()}/#/t/${t.shortLink}`, t.id)}
                            className="bg-white border px-3 py-1.5 text-xs font-bold shadow-sm cursor-pointer hover:bg-slate-50 transition-colors rounded-xl"
                          >
                            Copy Link
                          </button>
                          <span className="text-xs font-bold text-slate-655 bg-slate-100 border px-3 py-1.5 rounded-xl whitespace-nowrap">
                            {t.downloads} downloads
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4. Transfer Intelligence Tab */}
        {activeTab === 'intelligence' && (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Delivery Timeline */}
              <div className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-sm text-left">
                <h3 className="text-sm font-bold text-slate-900 mb-6">Delivery Timeline™</h3>
                {sharedFolderActivities.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">No timeline activity events recorded.</p>
                ) : (
                  <div className="flex flex-col gap-4 max-h-[400px] overflow-y-auto pr-2">
                    {sharedFolderActivities.map((act) => {
                      return (
                        <div key={act.id} className="flex gap-3 items-start border-b border-slate-100 pb-3">
                          <span className="material-symbols-outlined text-[18px] text-primary mt-0.5">
                            {act.actionType === 'file_downloaded' ? 'download' : act.actionType === 'file_uploaded' ? 'cloud_upload' : 'description'}
                          </span>
                          <div>
                            <p className="text-xs text-slate-800 font-semibold">
                              {act.email}: {act.details}
                            </p>
                            <span className="text-[9px] text-slate-400">{new Date(act.createdAt).toLocaleString()}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Real-time Receivers tracking */}
              <div className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-sm text-left">
                <h3 className="text-sm font-bold text-slate-900 mb-6">Real-Time Dispatch Tracking</h3>
                {downloadLogs.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">No tracker dispatches registered.</p>
                ) : (
                  <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto">
                    {downloadLogs.map((log) => {
                      return (
                        <div key={log.id} className="border rounded-2xl p-4 bg-slate-50/50 flex flex-col justify-between">
                          <div className="flex justify-between items-start text-xs">
                            <span className="font-mono text-slate-800 font-bold">{log.ipAddress}</span>
                            <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase">{log.countryCode}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-2">
                            File: <span className="font-mono">{log.fileName}</span>
                          </p>
                          <span className="text-[9px] text-slate-400 mt-2 block">{new Date(log.downloadTime).toLocaleString()}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 5. Insights Center Tab */}
        {activeTab === 'insights_center' && (
          <div className="flex flex-col gap-8">
            {/* AI Search panel */}
            <div className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-sm text-left flex flex-col gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-primary text-[20px]">psychology</span>
                  Client AI Search
                </h3>
                <p className="text-[10px] text-slate-400 leading-normal mt-0.5">
                  Try asking: "Show all files sent to Apple", "Which company downloaded the most files?", "Show inactive companies"
                </p>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ask anything about companies, files, or deliveries..."
                  value={aiSearchQuery}
                  onChange={(e) => setAiSearchQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAISearch(aiSearchQuery); }}
                  className="flex-1 px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none bg-slate-50"
                />
                <button
                  onClick={() => handleAISearch(aiSearchQuery)}
                  className="bg-primary hover:bg-primary-container text-white px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Ask AI
                </button>
              </div>

              {isAiSearching && <p className="text-xs text-slate-500 animate-pulse">Consulting transfer metrics...</p>}

              {aiSearchResult && (
                <div className="bg-slate-50 border rounded-2xl p-4 mt-2">
                  <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-3">AI Search Results</h4>
                  {aiSearchResult.length === 0 ? (
                    <p className="text-xs text-slate-550">No matches found for that query.</p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {aiSearchResult.map((res, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs bg-white border p-3 rounded-xl">
                          <span className="font-semibold text-slate-700">{res.name}</span>
                          <span className="text-slate-500 font-mono text-[10px]">{res.details}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Metrics Leaderboards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-sm text-left">
                <h3 className="text-sm font-bold text-slate-900 mb-6">Top Deliveries by Storage Used</h3>
                {transfers.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">No deliveries registered.</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {[...transfers].sort((a, b) => b.storageUsed - a.storageUsed).slice(0, 5).map((t, idx) => (
                      <div key={t.id} className="flex justify-between items-center text-xs border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-400 w-4">{idx + 1}.</span>
                          <span className="font-semibold text-slate-800">{t.title}</span>
                        </div>
                        <span className="font-mono text-slate-650 font-bold">{formatSize(t.storageUsed)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-sm text-left">
                <h3 className="text-sm font-bold text-slate-900 mb-6">Most Active Client Dispatches</h3>
                {transfers.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">No deliveries registered.</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {[...transfers].sort((a, b) => b.downloads - a.downloads).slice(0, 5).map((t, idx) => (
                      <div key={t.id} className="flex justify-between items-center text-xs border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-400 w-4">{idx + 1}.</span>
                          <span className="font-semibold text-slate-800">{t.title}</span>
                        </div>
                        <span className="font-semibold text-slate-655">{t.downloads} total downloads</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 6. Shared Folders Tab */}
        {activeTab === 'shared_folders' && (
          <div className="flex flex-col gap-6 text-left">
            {!selectedSharedFolderId ? (
              // Shared Folders Directory View
              <div className="flex flex-col gap-6">
                <div className="flex justify-between items-center bg-white border border-slate-200 rounded-[24px] p-6 shadow-sm">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Shared Folders™</h3>
                    <p className="text-[10px] text-slate-500 font-medium">Create persistent, syncing file directories for continuous client collaboration.</p>
                  </div>
                  <button
                    onClick={() => setShowCreateFolderModal(true)}
                    className="bg-primary hover:bg-primary-container text-white py-2.5 px-5 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    <span>New Folder</span>
                  </button>
                </div>

                {/* Folder Cards Grid */}
                {sharedFolders.length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-[24px] p-12 text-center text-slate-400">
                    <span className="material-symbols-outlined text-[48px] mb-2 block">folder_open</span>
                    <p className="text-xs font-semibold">No shared folders created yet.</p>
                    <button
                      onClick={() => setShowCreateFolderModal(true)}
                      className="mt-4 text-xs font-bold text-primary hover:underline"
                    >
                      Initialize your first folder
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 justify-center">
                    {sharedFolders.map((folder) => {
                      const fFiles = sharedFolderFiles.filter(f => f.folderId === folder.id && f.name !== '.dir');
                      const fMembers = sharedFolderMembers.filter(m => m.folderId === folder.id);
                      const fStorage = fFiles.reduce((acc, curr) => acc + curr.size, 0);

                      return (
                        <div
                          key={folder.id}
                          onClick={() => {
                            setSelectedSharedFolderId(folder.id);
                            setSharedFolderTab('overview');
                            setCurrentFolderPath('');
                          }}
                          className="relative h-52 cursor-pointer group w-full max-w-[280px] mx-auto select-none"
                        >
                          {/* 1. Folder Back Flap (with top tab shape) */}
                          <div 
                            className="absolute inset-0 rounded-3xl shadow-sm transition-transform duration-300 group-hover:scale-98"
                            style={{ 
                              backgroundColor: folder.color || '#4f46e5',
                              clipPath: 'polygon(0% 0%, 35% 0%, 45% 15%, 100% 15%, 100% 100%, 0% 100%)',
                              filter: 'brightness(0.9)'
                            }}
                          />

                          {/* 2. Inside Sheet / Document Peek (peeks up when hovered) */}
                          <div className="absolute left-4 right-4 bottom-4 top-5 bg-white rounded-2xl shadow-md border border-slate-100 p-4 transition-all duration-300 transform translate-y-0 group-hover:-translate-y-5 flex flex-col justify-between text-left">
                            <div className="flex justify-between items-center text-[8px] font-mono text-slate-400">
                              <span>{new Date(folder.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' })}</span>
                              <span>•••</span>
                            </div>
                            <div className="mt-2 flex-1">
                              <p className="text-[10px] font-bold text-slate-800">Files Sync Directory</p>
                              <div className="flex flex-col gap-1 mt-1">
                                {fFiles.slice(0, 2).map((file, i) => (
                                  <div key={i} className="text-[8px] text-slate-500 truncate flex items-center gap-1">
                                    <span>📎</span>
                                    <span className="truncate">{file.name}</span>
                                  </div>
                                ))}
                                {fFiles.length === 0 && (
                                  <span className="text-[8px] text-slate-400 italic">Empty folder</span>
                                )}
                              </div>
                            </div>
                            <div className="text-[8px] font-bold text-indigo-500 uppercase tracking-wider mt-2 border-t pt-1 flex justify-between">
                              <span>{fMembers.length + 1} members</span>
                              <span>{formatSize(fStorage)}</span>
                            </div>
                          </div>

                          {/* 3. Folder Front Flap */}
                          <div 
                            className="absolute left-0 right-0 bottom-0 top-[20%] rounded-b-3xl rounded-tr-3xl shadow-lg border-t border-white/20 p-5 flex flex-col justify-between text-white transition-all duration-300 transform group-hover:translate-y-2"
                            style={{ 
                              backgroundColor: folder.color || '#4f46e5',
                              backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.1) 100%)'
                            }}
                          >
                            <div className="flex justify-between items-start text-left">
                              <div>
                                <h4 className="text-base font-bold tracking-tight truncate max-w-[150px]" title={folder.name}>
                                  {folder.name}
                                </h4>
                                <p className="text-[10px] opacity-75 font-medium mt-0.5">{fFiles.length} files</p>
                              </div>
                              <div className="flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity relative z-30">
                                <span className="material-symbols-outlined text-[16px]">folder_open</span>
                                <div className="relative">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveFolderMenuId(activeFolderMenuId === folder.id ? null : folder.id);
                                    }}
                                    className="text-white hover:text-slate-200 transition-colors cursor-pointer flex items-center justify-center p-0.5"
                                    title="Folder Settings"
                                  >
                                    <span className="material-symbols-outlined text-[16px]">settings</span>
                                  </button>

                                  {activeFolderMenuId === folder.id && (
                                    <>
                                      {/* Backdrop to close menu when clicking elsewhere */}
                                      <div 
                                        className="fixed inset-0 z-40 cursor-default" 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setActiveFolderMenuId(null);
                                        }}
                                      />
                                      
                                      {/* Dropdown Card */}
                                      <div 
                                        className="absolute right-0 top-7 w-32 bg-white rounded-2xl shadow-xl border border-slate-100 p-1.5 flex flex-col gap-0.5 text-slate-800 z-50 text-[10px]"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <button
                                          type="button"
                                          onClick={async (e) => {
                                            e.stopPropagation();
                                            setActiveFolderMenuId(null);
                                            const newName = prompt("Rename Folder:", folder.name);
                                            if (newName && newName.trim()) {
                                              await updateSharedFolder(folder.id, { name: newName.trim() });
                                              alert("✏️ Folder renamed successfully!");
                                            }
                                          }}
                                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:bg-slate-50 text-slate-700 w-full font-bold cursor-pointer text-left"
                                        >
                                          <span className="material-symbols-outlined text-[14px]">edit</span>
                                          <span>Rename</span>
                                        </button>

                                        {folder.publicShareLink && (
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setActiveFolderMenuId(null);
                                              navigator.clipboard.writeText(folder.publicShareLink!);
                                              alert("🔗 Public folder link copied to clipboard!");
                                            }}
                                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:bg-slate-50 text-slate-700 w-full font-bold cursor-pointer text-left"
                                          >
                                            <span className="material-symbols-outlined text-[14px]">link</span>
                                            <span>Copy Link</span>
                                          </button>
                                        )}

                                        <button
                                          type="button"
                                          onClick={async (e) => {
                                            e.stopPropagation();
                                            setActiveFolderMenuId(null);
                                            if (confirm(`🗑️ Are you sure you want to delete the folder "${folder.name}"? This cannot be undone.`)) {
                                              await deleteSharedFolder(folder.id);
                                              alert("🗑️ Shared folder deleted successfully.");
                                            }
                                          }}
                                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:bg-red-50 text-red-650 w-full font-bold cursor-pointer text-left"
                                        >
                                          <span className="material-symbols-outlined text-[14px]">delete</span>
                                          <span>Delete</span>
                                        </button>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Subtitle / Company label at bottom */}
                            <div className="flex justify-between items-center text-[9px] opacity-80 font-bold uppercase tracking-wider">
                              <span className="truncate max-w-[120px]">
                                Shared Folder
                              </span>
                              <span className="text-[8px] bg-white/20 px-2 py-0.5 rounded-full">
                                Open
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              // Inner Folder Dashboard View
              (() => {
                const folder = sharedFolders.find(f => f.id === selectedSharedFolderId);
                if (!folder) return null;

                const fFiles = sharedFolderFiles.filter(f => f.folderId === folder.id);
                const fMembers = sharedFolderMembers.filter(m => m.folderId === folder.id);
                const fActivities = sharedFolderActivities.filter(a => a.folderId === folder.id);
                const totalStorage = fFiles.filter(f => f.name !== '.dir').reduce((acc, curr) => acc + curr.size, 0);

                // Helper to get nested files & directories at current path
                const getItemsAtCurrentPath = () => {
                  const items: { type: 'file' | 'folder'; name: string; fileObj?: SharedFolderFile }[] = [];
                  const seenSubfolders = new Set<string>();

                  fFiles.forEach((file) => {
                    const relativePath = file.parentPath;
                    
                    if (relativePath === currentFolderPath) {
                      // It belongs to the current directory level
                      if (file.name !== '.dir') {
                        items.push({ type: 'file', name: file.name, fileObj: file });
                      }
                    } else if (relativePath.startsWith(currentFolderPath ? currentFolderPath + '/' : '')) {
                      // It is a file or placeholder in a descendant subdirectory
                      const subPath = currentFolderPath 
                        ? relativePath.substring(currentFolderPath.length + 1)
                        : relativePath;
                      const topSubfolderName = subPath.split('/')[0];
                      if (topSubfolderName && !seenSubfolders.has(topSubfolderName)) {
                        seenSubfolders.add(topSubfolderName);
                        items.push({ type: 'folder', name: topSubfolderName });
                      }
                    }
                  });

                  return items;
                };

                const currentItems = getItemsAtCurrentPath();

                return (
                  <div className="flex flex-col gap-6">
                    {/* Folder Header */}
                    <div className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="flex items-center gap-4 text-left">
                        <button
                          onClick={() => setSelectedSharedFolderId(null)}
                          className="w-10 h-10 rounded-full border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-500 cursor-pointer shadow-sm"
                        >
                          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                        </button>
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className="w-3.5 h-3.5 rounded-full inline-block"
                              style={{ backgroundColor: folder.color || '#4f46e5' }}
                            />
                            <h3 className="text-base font-bold text-slate-900">{folder.name}</h3>
                          </div>
                          <p className="text-[10px] text-slate-500 font-medium mt-1">
                            {folder.description || 'Active persistent shared folder.'}
                          </p>
                        </div>
                      </div>

                      {/* Header Tab Selector */}
                      <div className="flex bg-slate-100 p-1 rounded-xl self-stretch md:self-auto">
                        {(['overview', 'files', 'members', 'activity', 'analytics', 'settings'] as const).map((tab) => (
                          <button
                            key={tab}
                            onClick={() => setSharedFolderTab(tab)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                              sharedFolderTab === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            {tab}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Tab Views */}
                    {sharedFolderTab === 'overview' && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 bg-white border border-slate-200 rounded-[24px] p-6 shadow-sm flex flex-col gap-6">
                          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Folder Overview</h4>
                          <div className="grid grid-cols-3 gap-4 text-center">
                            <div className="bg-slate-50 border rounded-2xl p-4">
                              <span className="material-symbols-outlined text-primary text-[28px] mb-2 block">description</span>
                              <p className="text-xl font-extrabold text-slate-900">{fFiles.filter(f => f.name !== '.dir').length}</p>
                              <p className="text-[8px] uppercase tracking-wider text-slate-400 mt-1">Total Files</p>
                            </div>
                            <div className="bg-slate-50 border rounded-2xl p-4">
                              <span className="material-symbols-outlined text-emerald-500 text-[28px] mb-2 block">group</span>
                              <p className="text-xl font-extrabold text-slate-900">{fMembers.length + 1}</p>
                              <p className="text-[8px] uppercase tracking-wider text-slate-400 mt-1">Total Members</p>
                            </div>
                            <div className="bg-slate-50 border rounded-2xl p-4">
                              <span className="material-symbols-outlined text-indigo-500 text-[28px] mb-2 block">database</span>
                              <p className="text-xl font-extrabold text-slate-900">{formatSize(totalStorage)}</p>
                              <p className="text-[8px] uppercase tracking-wider text-slate-400 mt-1">Storage Used</p>
                            </div>
                          </div>

                          <div className="flex flex-col gap-3 mt-4 text-left">
                            <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Public Access Portal</h5>
                            <div className="border border-slate-150 rounded-xl p-3 flex justify-between items-center bg-slate-50/50">
                              <div>
                                <p className="text-xs font-bold text-slate-700">Public Link Access</p>
                                <p className="text-[9px] text-slate-500 mt-0.5">
                                  {folder.publicShareEnabled 
                                    ? `Enabled with "${folder.publicSharePermission}" permission.` 
                                    : 'Disabled.'}
                                </p>
                              </div>
                              {folder.publicShareEnabled && (
                                <button
                                  onClick={() => handleCopyLink(folder.publicShareLink || '', folder.id)}
                                  className="text-[10px] font-bold text-primary bg-white border px-3 py-1.5 rounded-lg shadow-sm hover:bg-slate-50"
                                >
                                  Copy Link
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Recent Timeline Activity */}
                        <div className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-sm flex flex-col gap-6 text-left">
                          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Timeline Activity</h4>
                          {fActivities.length === 0 ? (
                            <p className="text-xs text-slate-400">No activity recorded yet.</p>
                          ) : (
                            <div className="flex flex-col gap-4 overflow-y-auto max-h-[300px]">
                              {fActivities.slice(0, 10).map((act) => (
                                <div key={act.id} className="flex gap-3 text-left items-start">
                                  <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                                  <div>
                                    <p className="text-xs font-semibold text-slate-700">{act.details || act.actionType}</p>
                                    <p className="text-[8px] text-slate-400 mt-0.5">
                                      by {act.email} • {new Date(act.createdAt).toLocaleTimeString()}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {sharedFolderTab === 'files' && (
                      <div className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-sm flex flex-col gap-6 text-left">
                        {/* Files Actions Bar */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          {/* Path Breadcrumbs */}
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold overflow-x-auto py-1">
                            <span 
                              className="hover:text-primary cursor-pointer"
                              onClick={() => setCurrentFolderPath('')}
                            >
                              🏠 Root
                            </span>
                            {currentFolderPath && currentFolderPath.split('/').map((pathPart, idx, arr) => {
                              const targetPath = arr.slice(0, idx + 1).join('/');
                              return (
                                <React.Fragment key={idx}>
                                  <span>/</span>
                                  <span 
                                    className="hover:text-primary cursor-pointer truncate max-w-[100px]"
                                    onClick={() => setCurrentFolderPath(targetPath)}
                                    title={pathPart}
                                  >
                                    {pathPart}
                                  </span>
                                </React.Fragment>
                              );
                            })}
                          </div>

                          <div className="flex gap-2">
                            {/* Upload Files Input */}
                            <label className="bg-primary hover:bg-primary-container text-white py-2 px-4 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm">
                              <span className="material-symbols-outlined text-[18px]">upload</span>
                              <span>Upload Files</span>
                              <input
                                type="file"
                                multiple
                                className="hidden"
                                onChange={async (e) => {
                                  if (e.target.files && e.target.files.length > 0) {
                                    for (let i = 0; i < e.target.files.length; i++) {
                                      const file = e.target.files[i];
                                      const subPath = currentFolderPath ? `${currentFolderPath}/` : '';
                                      const filePath = `${folder.id}/${subPath}${file.name}`;
                                      
                                      // Upload actual file to Supabase storage 'folders' bucket
                                      const { error } = await supabase.storage
                                        .from('folders')
                                        .upload(filePath, file, { cacheControl: '3600', upsert: true });

                                      if (error) {
                                        console.error('Storage upload failed:', error);
                                        alert(`❌ Failed to upload ${file.name}`);
                                        continue;
                                      }

                                      await addSharedFolderFile({
                                        folderId: folder.id,
                                        parentPath: currentFolderPath,
                                        name: file.name,
                                        size: file.size,
                                        mimeType: file.type,
                                        uploadedBy: currentUser?.email || 'Guest'
                                      });
                                    }
                                    alert('📁 Files uploaded successfully!');
                                  }
                                }}
                              />
                            </label>

                            <button
                              onClick={() => setShowChooseExistingModal(true)}
                              className="bg-white border hover:bg-slate-50 text-slate-700 py-2 px-4 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                            >
                              <span className="material-symbols-outlined text-[18px]">folder_open</span>
                              <span>Choose Existing</span>
                            </button>

                            <button
                              onClick={() => setShowNewSubfolderModal(true)}
                              className="bg-white border hover:bg-slate-50 text-slate-700 py-2 px-4 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                            >
                              <span className="material-symbols-outlined text-[18px]">create_new_folder</span>
                              <span>New Subfolder</span>
                            </button>
                          </div>
                        </div>

                        {/* Files and Folders Listing */}
                        {currentItems.length === 0 ? (
                          <div className="text-center py-12 text-slate-400">
                            <span className="material-symbols-outlined text-[36px] mb-1 block">cloud_off</span>
                            <p className="text-xs font-semibold">This directory path is currently empty.</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 justify-center">
                            {currentItems.map((item, idx) => {
                              if (item.type === 'folder') {
                                const newPath = currentFolderPath 
                                  ? `${currentFolderPath}/${item.name}`
                                  : item.name;
                                return (
                                  <div
                                    key={idx}
                                    onClick={() => setCurrentFolderPath(newPath)}
                                    className="bg-white border border-slate-100 hover:border-primary/30 rounded-3xl p-6 flex flex-col items-center justify-center text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group shadow-sm relative overflow-hidden h-40 max-w-[280px] w-full mx-auto"
                                  >
                                    {/* Large premium CSS 3D Folder Icon Design */}
                                    <div className="relative w-14 h-11 mb-4 mt-1 transition-transform duration-300 group-hover:scale-105">
                                      {/* Back flap */}
                                      <div className="absolute inset-0 bg-indigo-600 rounded-lg shadow-sm" style={{ clipPath: 'polygon(0% 0%, 35% 0%, 45% 20%, 100% 20%, 100% 100%, 0% 100%)' }} />
                                      {/* Inside sheet / documents pocket */}
                                      <div className="absolute left-1.5 right-1.5 bottom-1 top-2 bg-white rounded shadow-sm border border-slate-100" />
                                      {/* Front flap (slightly shifted down/rotated/skewed) */}
                                      <div className="absolute left-0 right-0 bottom-0 top-3 bg-indigo-500 rounded-lg shadow-md border-t border-indigo-400 transition-all duration-300 group-hover:top-4" />
                                    </div>
                                    <h5 className="text-xs font-bold text-slate-800 truncate w-full px-2" title={item.name}>
                                      {item.name}
                                    </h5>
                                    <p className="text-[8px] uppercase tracking-wider text-slate-400 font-bold mt-1 group-hover:text-primary transition-colors">Open Directory</p>
                                  </div>
                                );
                              }

                              return (
                                <div
                                  key={idx}
                                  className="bg-white border border-slate-100 rounded-3xl p-4 flex flex-col justify-between hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 shadow-sm relative overflow-hidden group"
                                >
                                  <div className="flex items-center gap-3">
                                    <span className={`material-symbols-outlined text-[26px] p-2.5 rounded-2xl transition-transform group-hover:scale-105 ${
                                      item.name.endsWith('.pdf')
                                        ? 'bg-red-50 text-red-500'
                                        : item.name.endsWith('.zip')
                                        ? 'bg-amber-50 text-amber-500'
                                        : 'bg-slate-50 text-slate-500'
                                    }`}>
                                      description
                                    </span>
                                    <div className="overflow-hidden min-w-0 flex-1 text-left">
                                      <p className="text-xs font-bold text-slate-800 truncate" title={item.name}>{item.name}</p>
                                      <p className="text-[9px] text-slate-500 mt-0.5">
                                        {formatSize(item.fileObj?.size || 0)} • by {item.fileObj?.uploadedBy || 'Guest'}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex justify-end gap-2 mt-4">
                                    <button
                                      onClick={async () => {
                                        if (item.fileObj) {
                                          const subPath = item.fileObj?.parentPath ? `${item.fileObj.parentPath}/` : '';
                                          let filePath = `${folder.id}/${subPath}${item.name}`;
                                          let { data: testData, error: testError } = await supabase.storage
                                            .from('folders')
                                            .createSignedUrl(filePath, 60);

                                          let downloadUrl = testData?.signedUrl;

                                          if (testError || !downloadUrl) {
                                            // Fallback to standard path if subfolder path fails
                                            filePath = `${folder.id}/${item.name}`;
                                            const { data: fallbackData } = await supabase.storage
                                              .from('folders')
                                              .createSignedUrl(filePath, 60);
                                            downloadUrl = fallbackData?.signedUrl;
                                          }

                                          if (downloadUrl) {
                                            const element = document.createElement('a');
                                            element.href = downloadUrl;
                                            element.download = item.name;
                                            element.target = "_blank";
                                            document.body.appendChild(element);
                                            element.click();
                                            document.body.removeChild(element);
                                          } else {
                                            console.error('Storage download failed:', testError);
                                            alert('❌ Failed to download file from storage.');
                                            return;
                                          }

                                          // Increment download counter
                                          const newCount = (item.fileObj.downloadCount || 0) + 1;
                                          setSharedFolderFiles(prev => prev.map(f => f.id === item.fileObj?.id ? { ...f, downloadCount: newCount } : f));
                                          await supabase
                                            .from('shared_folder_files')
                                            .update({ download_count: newCount })
                                            .eq('id', item.fileObj.id);

                                          // Log download activity
                                          await logSharedFolderActivity(folder.id, 'file_downloaded', `Downloaded file "${item.name}".`);
                                          
                                          // Register download telemetry log
                                          await supabase.from('download_logs').insert({
                                            id: `log_${Date.now()}`,
                                            folder_id: folder.id,
                                            ip_address: '127.0.0.1',
                                            country_code: 'US',
                                            download_time: new Date().toISOString()
                                          });

                                          alert(`💾 Initiated download sequence for "${item.name}"!`);
                                        }
                                      }}
                                      className="text-[10px] font-bold text-primary bg-white border px-3 py-1.5 rounded-lg shadow-sm hover:underline"
                                    >
                                      Download
                                    </button>
                                    <button
                                      onClick={async () => {
                                        if (item.fileObj && confirm('Delete this file?')) {
                                          await deleteSharedFolderFile(item.fileObj.id);
                                        }
                                      }}
                                      className="text-[10px] font-bold text-red-650 bg-white border px-3 py-1.5 rounded-lg shadow-sm hover:underline"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    {sharedFolderTab === 'members' && (
                      <div className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-sm flex flex-col gap-6 text-left">
                        <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Folder Members Directory</h4>
                        
                        {/* Invite Member Box */}
                        <div className="border border-slate-150 rounded-2xl p-4 bg-slate-50/50 flex flex-col sm:flex-row gap-3">
                          <input
                            type="email"
                            placeholder="Collaborator email address..."
                            value={sfInviteEmail}
                            onChange={(e) => setSfInviteEmail(e.target.value)}
                            className="flex-1 px-3 py-2 border rounded-xl text-xs bg-white"
                          />
                          <select
                            value={sfInviteRole}
                            onChange={(e) => setSfInviteRole(e.target.value as any)}
                            className="px-3 py-2 border rounded-xl text-xs bg-white text-slate-700 font-bold"
                          >
                            <option value="viewer">Viewer (Read Only)</option>
                            <option value="contributor">Contributor (Read/Write)</option>
                            <option value="manager">Manager (Admin)</option>
                          </select>
                          <button
                            onClick={async () => {
                              if (!sfInviteEmail) return;
                              await inviteSharedFolderMember({
                                folderId: folder.id,
                                email: sfInviteEmail.toLowerCase().trim(),
                                role: sfInviteRole
                              });
                              setSfInviteEmail('');
                              alert('📧 Collaboration invite sent successfully!');
                            }}
                            className="bg-primary hover:bg-primary-container text-white py-2 px-5 rounded-xl font-bold text-xs"
                          >
                            Invite
                          </button>
                        </div>

                        {/* Invited Members List */}
                        <div className="flex flex-col gap-3">
                          <div className="flex justify-between items-center border border-slate-100 rounded-xl p-3 bg-white">
                            <div className="text-left">
                              <p className="text-xs font-bold text-slate-800">{folder.ownerEmail}</p>
                              <p className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider mt-0.5">Owner / Administrator</p>
                            </div>
                            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[9px] font-extrabold uppercase">Owner</span>
                          </div>

                          {fMembers.map((mem) => (
                            <div key={mem.id} className="flex justify-between items-center border border-slate-100 rounded-xl p-3 bg-white">
                              <div className="text-left">
                                <p className="text-xs font-bold text-slate-800">{mem.email}</p>
                                <p className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider mt-0.5">Joined via Email</p>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-[9px] font-extrabold uppercase">
                                  {mem.role}
                                </span>
                                <button
                                  onClick={async () => {
                                    if (confirm('Revoke access for this user?')) {
                                      await deleteSharedFolderMember(mem.id);
                                    }
                                  }}
                                  className="text-red-650 font-bold hover:underline text-[10px]"
                                >
                                  Revoke
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {sharedFolderTab === 'activity' && (
                      <div className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-sm flex flex-col gap-6 text-left">
                        <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Folder Activities timeline</h4>
                        {fActivities.length === 0 ? (
                          <p className="text-xs text-slate-400">No activity logged.</p>
                        ) : (
                          <div className="flex flex-col gap-4">
                            {fActivities.map((act) => (
                              <div key={act.id} className="border-b border-slate-100 pb-3 last:border-0 flex justify-between items-start gap-4">
                                <div className="text-left">
                                  <p className="text-xs font-bold text-slate-800">{act.details || act.actionType}</p>
                                  <p className="text-[9px] text-slate-400 mt-0.5">Email collaborator: {act.email}</p>
                                </div>
                                <span className="text-[9px] text-slate-400 font-medium whitespace-nowrap">
                                  {new Date(act.createdAt).toLocaleString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {sharedFolderTab === 'analytics' && (
                      <div className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-sm flex flex-col gap-6 text-left">
                        <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Shared Folder Analytics™</h4>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="bg-slate-50 border rounded-2xl p-4">
                            <p className="text-2xl font-extrabold text-slate-900">
                              {fActivities.filter(a => a.actionType === 'file_viewed').length}
                            </p>
                            <p className="text-[8px] uppercase tracking-wider text-slate-400 font-bold mt-1">Total Views</p>
                          </div>
                          <div className="bg-slate-50 border rounded-2xl p-4">
                            <p className="text-2xl font-extrabold text-slate-900">
                              {fFiles.reduce((acc, curr) => acc + (curr.downloadCount || 0), 0)}
                            </p>
                            <p className="text-[8px] uppercase tracking-wider text-slate-400 font-bold mt-1">Total Downloads</p>
                          </div>
                          <div className="bg-slate-50 border rounded-2xl p-4">
                            <p className="text-2xl font-extrabold text-slate-900">
                              {fActivities.filter(a => a.actionType === 'file_uploaded').length}
                            </p>
                            <p className="text-[8px] uppercase tracking-wider text-slate-400 font-bold mt-1">Total Uploads</p>
                          </div>
                          <div className="bg-slate-50 border rounded-2xl p-4">
                            <p className="text-2xl font-extrabold text-slate-900">
                              {formatSize(totalStorage)}
                            </p>
                            <p className="text-[8px] uppercase tracking-wider text-slate-400 font-bold mt-1">Storage Usage</p>
                          </div>
                        </div>

                        {/* Top Downloaded Files list */}
                        <div className="mt-4">
                          <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">Top Downloaded Files</h5>
                          <div className="flex flex-col gap-2">
                            {fFiles.filter(f => f.name !== '.dir').sort((a, b) => (b.downloadCount || 0) - (a.downloadCount || 0)).slice(0, 5).map((file, i) => (
                              <div key={i} className="flex justify-between items-center p-3 bg-slate-50 border border-slate-100 rounded-xl">
                                <span className="text-xs font-bold text-slate-800">{file.name}</span>
                                <span className="text-[10px] font-bold text-slate-500 bg-slate-200/50 px-2.5 py-1 rounded-lg">
                                  {file.downloadCount || 0} downloads
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {sharedFolderTab === 'settings' && (
                      <div className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-sm flex flex-col gap-6 text-left">
                        <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Shared Folder Settings</h4>

                        {/* Public Link toggle */}
                        <div className="flex flex-col gap-4 border-b pb-6 text-left">
                          <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Security & Link Settings</h5>
                          
                          <label className="flex items-center gap-3 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={folder.publicShareEnabled}
                              onChange={async (e) => {
                                const checked = e.target.checked;
                                const link = checked 
                                  ? `${getAppUrl()}/#/folder/${folder.id}`
                                  : undefined;

                                await updateSharedFolder(folder.id, {
                                  publicShareEnabled: checked,
                                  publicShareLink: link
                                });
                                alert(checked ? '🔗 Public link enabled successfully!' : '🔒 Public link disabled.');
                              }}
                              className="rounded border-slate-300 text-primary focus:ring-primary/20 w-4 h-4"
                            />
                            <div className="text-left">
                              <p className="text-xs font-bold text-slate-800">Enable Public Share Link</p>
                              <p className="text-[9px] text-slate-500">Anyone with this URL link can view/download shared assets.</p>
                            </div>
                          </label>

                          {folder.publicShareEnabled && (
                            <div className="mt-2 flex flex-col gap-2">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Public Share Permission</label>
                              <select
                                value={folder.publicSharePermission}
                                onChange={async (e) => {
                                  await updateSharedFolder(folder.id, {
                                    publicSharePermission: e.target.value as any
                                  });
                                }}
                                className="px-3 py-2 border rounded-xl text-xs bg-white font-bold"
                              >
                                <option value="view">View Only</option>
                                <option value="download">Download Allowed</option>
                                <option value="upload">Upload Allowed</option>
                              </select>
                            </div>
                          )}
                        </div>

                        {/* Danger zone */}
                        <div className="flex flex-col gap-4 text-left">
                          <h5 className="text-[10px] font-bold uppercase tracking-wider text-red-650">Danger Zone</h5>
                          <div className="border border-red-200 rounded-2xl p-4 bg-red-50/50 flex justify-between items-center">
                            <div>
                              <p className="text-xs font-bold text-slate-800">Delete Shared Folder</p>
                              <p className="text-[9px] text-slate-500">This action permanently deletes all syncing folder files, members, and audit history logs.</p>
                            </div>
                            <button
                              onClick={async () => {
                                if (confirm('Are you absolutely sure you want to delete this shared folder and all its synced items? This cannot be undone.')) {
                                  await deleteSharedFolder(folder.id);
                                  setSelectedSharedFolderId(null);
                                  alert('🗑️ Shared folder deleted successfully.');
                                }
                              }}
                              className="bg-red-650 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-sm cursor-pointer"
                            >
                              Delete Folder
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()
            )}
          </div>
        )}

        {/* 6. Vault Tab */}
        {activeTab === 'vault' && (
          <div className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-sm text-left flex flex-col gap-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Vault™ Consolidated Repository</h3>
              <p className="text-[10px] text-slate-450 leading-normal mt-0.5">Explore, search, and preview every single file dispatched across your client portals.</p>
            </div>
            
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search across all files in vault..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-xl text-xs focus:outline-none bg-slate-50"
              />
            </div>

            {allFiles.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">The consolidated vault is currently empty.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {allFiles.filter(f => !searchQuery || f.name.toLowerCase().includes(searchQuery.toLowerCase())).map((file, idx) => {
                  return (
                    <div key={idx} className="bg-slate-50 border rounded-2xl p-4 flex flex-col justify-between hover:bg-slate-100/50 transition-colors">
                      <div className="flex items-start gap-3 text-left">
                        <span className="material-symbols-outlined text-slate-400 text-[24px]">description</span>
                        <div className="overflow-hidden">
                          <p className="text-xs font-bold text-slate-800 truncate" title={file.name}>{file.name}</p>
                          <p className="text-[10px] text-slate-500 mt-1 font-mono">Size: {formatSize(file.size)}</p>
                          <p className="text-[10px] text-slate-500 mt-1">Sender: {file.senderEmail}</p>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 mt-4">
                        <a
                          href={`/#/t/${file.transfer.shortLink}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] font-bold text-primary bg-white border px-3 py-1.5 rounded-lg shadow-sm hover:underline"
                        >
                          Download Link
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 7. File Requests Tab */}
        {activeTab === 'file_requests' && (
          <div className="flex flex-col gap-6">
            {/* Header Action Card */}
            <div className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-left">
              <div>
                <h3 className="text-sm font-bold text-slate-900">File Request Links</h3>
                <p className="text-[10px] text-slate-500 mt-1 font-medium">
                  Create secure upload links for external clients to send files directly to your workspace or folders.
                </p>
              </div>
              <button
                onClick={() => setShowCreateRequestModal(true)}
                className="bg-primary hover:bg-primary-container text-white py-2.5 px-5 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                <span>Create File Request</span>
              </button>
            </div>

            {/* List Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm text-left flex flex-col gap-6">
              
              {/* Active Links */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-4">Active Request Links</h3>
                {fileRequests.filter(r => r.status === 'active').length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 italic">No active file request links.</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {fileRequests.filter(r => r.status === 'active').map((req) => {
                      const linkedFolder = sharedFolders.find(f => f.id === req.folderId);
                      const linkUrl = `${getAppUrl()}/#/request?r=${req.id}`;
                      const isCreator = req.requesterEmail.toLowerCase() === currentUser?.email.toLowerCase();
                      
                      return (
                        <div key={req.id} className={`flex flex-col md:flex-row items-start md:items-center justify-between border border-slate-100 rounded-2xl p-4 transition-colors gap-4 ${isCreator ? 'bg-slate-50/50 hover:bg-slate-50' : 'bg-amber-50/10 border-amber-100/50'}`}>
                          <div className="flex items-center gap-3 text-left">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isCreator ? 'bg-primary/10 text-primary' : 'bg-amber-100 text-amber-600'}`}>
                              <span className="material-symbols-outlined text-[20px]">{isCreator ? 'move_to_inbox' : 'pending_actions'}</span>
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold text-slate-800">{req.title}</h4>
                              <p className="text-[10px] text-slate-500 mt-1">
                                {isCreator ? (
                                  <>
                                    Created: {new Date(req.createdAt).toLocaleDateString()}
                                    {req.clientEmail && ` • Sent to: ${req.clientEmail}`}
                                  </>
                                ) : (
                                  <>
                                    Requested by: <span className="font-bold">{req.requesterEmail}</span> • Date: {new Date(req.createdAt).toLocaleDateString()}
                                  </>
                                )}
                                {linkedFolder && ` • Uploads directly to folder: ${linkedFolder.name}`}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {!isCreator ? (
                              <a
                                href={linkUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="bg-primary text-white hover:bg-primary-container px-4 py-2 rounded-xl text-xs font-bold transition-all scale-98 active:scale-95 shadow-sm cursor-pointer flex items-center gap-1.5"
                              >
                                <span className="material-symbols-outlined text-[16px]">upload</span>
                                <span>Upload Files</span>
                              </a>
                            ) : (
                              <>
                                <a
                                  href={linkUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold transition-all scale-98 active:scale-95 shadow-sm cursor-pointer flex items-center gap-1"
                                >
                                  <span className="material-symbols-outlined text-[16px]">launch</span>
                                  <span>Open Portal</span>
                                </a>
                                <button
                                  onClick={() => handleCopyLink(linkUrl, req.id)}
                                  className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold transition-all scale-98 active:scale-95 shadow-sm cursor-pointer"
                                >
                                  Copy Link
                                </button>
                                <button
                                  onClick={async () => {
                                    if (confirm('Delete this file request link?')) {
                                      await deleteFileRequest(req.id);
                                      alert('🗑️ File request link deleted.');
                                    }
                                  }}
                                  className="bg-red-50 hover:bg-red-100 text-red-650 px-4 py-2 rounded-xl text-xs font-bold transition-all scale-98 active:scale-95 border border-red-100 cursor-pointer"
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Recent Active Links (Fulfilled) */}
              <div className="border-t pt-6">
                <h3 className="text-sm font-bold text-slate-900 mb-4">Recent Active Request Links</h3>
                {fileRequests.filter(r => r.status === 'fulfilled').length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 italic">No fulfilled requests yet.</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {fileRequests.filter(r => r.status === 'fulfilled').map((req) => {
                      const linkedFolder = sharedFolders.find(f => f.id === req.folderId);
                      const isCreator = req.requesterEmail.toLowerCase() === currentUser?.email.toLowerCase();
                      
                      return (
                        <div key={req.id} className="flex flex-col md:flex-row items-start md:items-center justify-between border border-slate-100 rounded-2xl p-4 bg-slate-50/10 transition-colors gap-4 opacity-75">
                          <div className="flex items-center gap-3 text-left">
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                              <span className="material-symbols-outlined text-[20px]">check_circle</span>
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold text-slate-800 line-through decoration-slate-400">{req.title}</h4>
                              <p className="text-[10px] text-slate-500 mt-1">
                                {isCreator ? (
                                  <>
                                    Created: {new Date(req.createdAt).toLocaleDateString()} (Fulfilled)
                                    {req.clientEmail && ` • Sent to: ${req.clientEmail}`}
                                  </>
                                ) : (
                                  <>
                                    Requested by: <span className="font-bold">{req.requesterEmail}</span> • Date: {new Date(req.createdAt).toLocaleDateString()} (Fulfilled)
                                  </>
                                )}
                                {linkedFolder && ` • Uploaded to folder: ${linkedFolder.name}`}
                              </p>
                            </div>
                          </div>
                          {isCreator && (
                            <button
                              onClick={async () => {
                                if (confirm('Delete this request log?')) {
                                  await deleteFileRequest(req.id);
                                }
                              }}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 rounded-xl text-xs font-bold transition-all scale-98 active:scale-95 cursor-pointer"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* 7. Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-sm text-left flex flex-col gap-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Workspace Settings</h3>
              <p className="text-[10px] text-slate-500 leading-normal mt-0.5">Manage your personal account profile and subscription properties.</p>
            </div>
            
            <div className="border border-slate-150 rounded-2xl p-4 flex justify-between items-center bg-slate-50/50">
              <div>
                <span className="text-xs font-bold text-slate-800">Workspace Owner</span>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">{currentUser?.email}</p>
              </div>
              <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase">{currentUser?.plan || 'Free'} Workspace</span>
            </div>
          </div>
        )}
      </main>

      {/* Share Link Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 flex flex-col gap-6 text-left transform scale-100 transition-all">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[24px]">share</span>
                Share Transfer
              </h3>
              <button 
                onClick={() => setShowShareModal(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Share Link</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  readOnly 
                  value={shareLink} 
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-700 font-mono focus:outline-none"
                />
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(shareLink);
                    alert('📋 Link copied to clipboard!');
                  }}
                  className="bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors py-2.5 px-4 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">content_copy</span>
                  <span>Copy</span>
                </button>
              </div>
            </div>

            <hr className="border-slate-100" />

            <form 
              onSubmit={async (e) => {
                e.preventDefault();
                if (!shareEmail) return;
                
                if (selectedShareTransferId) {
                  setTransfers(prev => prev.map(item => item.id === selectedShareTransferId ? { ...item, recipientEmails: [shareEmail.toLowerCase().trim()] } : item));
                  const { error } = await supabase
                    .from('transfers')
                    .update({ recipient_email: shareEmail.toLowerCase().trim() })
                    .eq('id', selectedShareTransferId);
                  
                  if (error) {
                    console.error('Failed to sync shared recipient email:', error);
                  }
                }

                alert(`🎉 Transfer link successfully shared with: ${shareEmail}`);
                setShowShareModal(false);
              }}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-2">
                <label htmlFor="shareEmailInput" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Send via Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-slate-400 text-[18px]">mail</span>
                  </div>
                  <input 
                    id="shareEmailInput"
                    type="email" 
                    required
                    placeholder="recipient@company.com" 
                    value={shareEmail}
                    onChange={(e) => setShareEmail(e.target.value)}
                    className="block w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-800 font-body-md text-xs placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>
              <button 
                type="submit"
                className="w-full bg-primary hover:bg-primary-container text-white py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">send</span>
                <span>Send Transfer Link</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* New Transfer Modal */}
      {showNewTransferModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 flex flex-col gap-6 text-left transform scale-100 transition-all">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[24px]">cloud_upload</span>
                Upload Files
              </h3>
              <button 
                onClick={() => {
                  if (!isUploading) {
                    setNewTransferFiles([]);
                    setShowNewTransferModal(false);
                  }
                }}
                className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {isUploading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <span className="material-symbols-outlined text-primary text-[48px] animate-bounce">cloud_upload</span>
                <span className="text-sm font-bold text-slate-700">
                  Uploading ({newTransferFiles.length} {newTransferFiles.length === 1 ? 'file' : 'files'})...
                </span>
                <div className="w-full bg-slate-100 h-2 rounded-full max-w-xs overflow-hidden flex items-center">
                  <div 
                    className="bg-primary h-full rounded-full transition-all duration-100" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <span className="text-xs font-bold text-primary font-mono">{uploadProgress}%</span>
              </div>
            ) : (
              <form onSubmit={handleStartModalUpload} className="flex flex-col gap-5">
                <div 
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleModalDrop}
                  onClick={() => modalFileInputRef.current?.click()}
                  className={`border-2 border-dashed transition-all rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer group hover:bg-slate-50/50 ${
                    isDragging ? 'border-primary bg-primary/5' : 'border-slate-300 bg-slate-50/30'
                  }`}
                >
                  <input 
                    type="file" 
                    ref={modalFileInputRef} 
                    className="hidden" 
                    multiple 
                    onChange={handleModalFileChange} 
                  />
                  <span className="material-symbols-outlined text-primary text-[40px] mb-2 group-hover:scale-110 transition-transform">cloud_upload</span>
                  <h4 className="text-sm font-bold text-slate-800 mb-0.5">Drag & drop files here</h4>
                  <p className="text-[11px] text-slate-500 mb-2">or click to browse files from your device</p>
                  <button 
                    type="button"
                    onClick={(e) => { e.stopPropagation(); modalFileInputRef.current?.click(); }}
                    className="bg-white border border-slate-200 shadow-sm text-slate-700 font-bold px-3 py-1.5 rounded-xl text-xs hover:bg-slate-50 transition-colors"
                  >
                    Select Files
                  </button>
                </div>

                {newTransferFiles.length > 0 && (
                  <div className="flex flex-col gap-2 max-h-40 overflow-y-auto border border-slate-100 rounded-2xl p-3 bg-slate-50/30">
                    <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Selected Files ({newTransferFiles.length})</h5>
                    {newTransferFiles.map((file, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-white p-2 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-2 overflow-hidden mr-2">
                          <span className="material-symbols-outlined text-slate-400 text-[18px]">description</span>
                          <span className="text-xs text-slate-700 font-semibold truncate max-w-[200px]">{file.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">({formatSize(file.size)})</span>
                        </div>
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setNewTransferFiles((prev) => prev.filter((_, i) => i !== idx));
                          }}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 w-6 h-6 rounded-full flex items-center justify-center transition-colors"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="newTransferTitle" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Transfer Title</label>
                  <input 
                    id="newTransferTitle"
                    type="text" 
                    placeholder="e.g. Marketing Presentation Assets" 
                    value={newTransferTitle}
                    onChange={(e) => setNewTransferTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-800 text-xs placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="newTransferRecipient" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Recipient Email (Optional)</label>
                  <input 
                    id="newTransferRecipient"
                    type="email" 
                    placeholder="recipient@company.com" 
                    value={newTransferRecipient}
                    onChange={(e) => setNewTransferRecipient(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-800 text-xs placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                  />
                </div>

                {/* Pro Features section */}
                <div className="flex flex-col gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200/60">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] text-amber-500">crown</span>
                      Premium Security
                    </span>
                    <span className="bg-amber-100 text-amber-800 text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase">Pro Feature</span>
                  </div>
                  
                  {currentUser?.plan === 'pro' || currentUser?.plan === 'business' || currentUser?.plan === 'enterprise' ? (
                    <div className="flex flex-col gap-1 mt-1">
                      <label htmlFor="modalPassword" className="text-[10px] font-semibold text-slate-660">Password Protection</label>
                      <input 
                        id="modalPassword"
                        type="password"
                        placeholder="Configure access password"
                        value={newTransferPassword}
                        onChange={(e) => setNewTransferPassword(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-xl bg-white text-slate-850 text-xs focus:outline-none focus:border-primary transition-all"
                      />
                    </div>
                  ) : (
                    <div className="text-[10px] text-slate-400 font-semibold mt-1">
                      🔒 Upgrade to Pro to configure password access control on this transfer.
                    </div>
                  )}
                </div>

                <button 
                  type="submit"
                  disabled={newTransferFiles.length === 0}
                  className="w-full bg-primary hover:bg-primary-container text-white py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-[16px]">send</span>
                  <span>Create & Send Transfer</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Create Company Modal */}


      {/* Create Delivery (Dispatch Wizard) Modal */}
      {showCreateDeliveryModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 flex flex-col gap-6 text-left max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[24px]">send</span>
                New Project Dispatch
              </h3>
              <button 
                onClick={() => {
                  if (!isDelivering) {
                    setDelFiles([]);
                    setDelRecipients([]);
                    setDelManualRecipient('');
                    setDelTitle('');
                    setDelPassword('');
                    setShowCreateDeliveryModal(false);
                  }
                }}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {isDelivering ? (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <span className="material-symbols-outlined text-primary text-[48px] animate-bounce">send</span>
                <span className="text-sm font-bold text-slate-700">Dispatching deliveries ({delFiles.length} files)...</span>
                <div className="w-full bg-slate-100 h-2 rounded-full max-w-xs overflow-hidden">
                  <div className="bg-primary h-full rounded-full" style={{ width: `${deliveryProgress}%` }}></div>
                </div>
                <span className="text-xs font-bold text-primary font-mono">{deliveryProgress}%</span>
              </div>
            ) : (
              <form onSubmit={handleCreateDelivery} className="flex flex-col gap-4">
                {/* Step 1: Select Files */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Step 1: Select Files</label>
                  <div
                    onClick={() => modalFileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-200 bg-slate-50/50 rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50"
                  >
                    <input
                      type="file"
                      ref={modalFileInputRef}
                      className="hidden"
                      multiple
                      onChange={(e) => {
                        if (e.target.files) setDelFiles(Array.from(e.target.files));
                      }}
                    />
                    <span className="material-symbols-outlined text-primary text-[32px] mb-1">cloud_upload</span>
                    <p className="text-xs text-slate-700 font-semibold">Click to choose files for dispatch</p>
                    {delFiles.length > 0 && <span className="text-[10px] text-primary font-bold mt-1">({delFiles.length} files selected)</span>}
                  </div>
                </div>

                {/* Step 2: Select Recipient */}
                <div className="flex flex-col gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Step 2: Select Recipient</label>
                  <input
                    type="email"
                    placeholder="Enter recipient email..."
                    value={delManualRecipient}
                    onChange={(e) => setDelManualRecipient(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-white mt-1"
                  />
                </div>

                {/* Delivery Settings */}
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Delivery Title</label>
                    <input type="text" placeholder="e.g. Design Presentation Assets" value={delTitle} onChange={(e) => setDelTitle(e.target.value)} className="px-3 py-2 border rounded-xl text-xs bg-slate-50" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Access Password (Optional)</label>
                    <input type="password" placeholder="e.g. secret123" value={delPassword} onChange={(e) => setDelPassword(e.target.value)} className="px-3 py-2 border rounded-xl text-xs bg-slate-50" />
                  </div>
                </div>

                <button type="submit" disabled={delFiles.length === 0} className="bg-primary hover:bg-primary-container disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl text-xs font-bold shadow-sm transition-colors mt-2 cursor-pointer text-center w-full">
                  Generate Dispatch
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Create Shared Folder Modal */}
      {showCreateFolderModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 flex flex-col gap-6 text-left transform scale-100 transition-all">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[24px]">folder_shared</span>
                Create Shared Folder
              </h3>
              <button 
                onClick={() => setShowCreateFolderModal(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form 
              onSubmit={async (e) => {
                e.preventDefault();
                if (!sfName) return;
                await createSharedFolder({
                  name: sfName,
                  description: sfDescription,
                  icon: sfIcon,
                  color: sfColor,
                  publicShareEnabled: sfPublicShareEnabled,
                  publicSharePermission: sfPublicSharePermission,
                  publicShareLink: sfPublicShareEnabled 
                    ? `${getAppUrl()}/#/folder/temp_${Date.now()}`
                    : undefined,
                  expiresAt: sfExpiresAt || undefined,
                  password: sfPassword || undefined
                });
                // Reset fields
                setSfName('');
                setSfDescription('');
                setSfIcon('folder');
                setSfColor('#4f46e5');
                setSfPublicShareEnabled(false);
                setSfPublicSharePermission('view');
                setSfExpiresAt('');
                setSfPassword('');
                setShowCreateFolderModal(false);
                alert('🎉 Shared Folder created successfully!');
              }}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Folder Name *</label>
                <input required type="text" placeholder="e.g. Marketing Assets" value={sfName} onChange={(e) => setSfName(e.target.value)} className="px-3 py-2 border rounded-xl text-xs bg-slate-50 focus:outline-none" />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Description</label>
                <textarea placeholder="Folder details..." value={sfDescription} onChange={(e) => setSfDescription(e.target.value)} className="px-3 py-2 border rounded-xl text-xs bg-slate-50 focus:outline-none h-16 resize-none" />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Color Theme</label>
                <select value={sfColor} onChange={(e) => setSfColor(e.target.value)} className="px-3 py-2 border rounded-xl text-xs bg-white font-bold">
                  <option value="#4f46e5">Indigo</option>
                  <option value="#06b6d4">Cyan</option>
                  <option value="#10b981">Emerald</option>
                  <option value="#f59e0b">Amber</option>
                  <option value="#ef4444">Rose</option>
                </select>
              </div>

              <div className="flex flex-col gap-3 border-t pt-4">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Permissions & Access</h4>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input 
                    type="checkbox"
                    checked={sfPublicShareEnabled}
                    onChange={(e) => setSfPublicShareEnabled(e.target.checked)}
                    className="rounded border-slate-300 text-primary focus:ring-primary/20"
                  />
                  <span className="text-xs font-semibold text-slate-700">Enable Public Share Link</span>
                </label>
              </div>

              <button type="submit" className="bg-primary hover:bg-primary-container text-white py-3 rounded-xl text-xs font-bold shadow-sm transition-colors mt-2 cursor-pointer text-center w-full">
                Create Folder
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Create Subfolder Modal */}
      {showNewSubfolderModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 flex flex-col gap-6 text-left transform scale-100 transition-all">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">create_new_folder</span>
                New Subfolder
              </h3>
              <button 
                onClick={() => setShowNewSubfolderModal(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form 
              onSubmit={async (e) => {
                e.preventDefault();
                if (!newSubfolderName) return;
                const fullSubPath = currentFolderPath 
                  ? `${currentFolderPath}/${newSubfolderName.trim()}`
                  : newSubfolderName.trim();

                // Insert placeholder file to register the subfolder path
                await addSharedFolderFile({
                  folderId: selectedSharedFolderId!,
                  parentPath: fullSubPath,
                  name: '.dir',
                  size: 0,
                  mimeType: 'directory',
                  uploadedBy: currentUser?.email || 'System'
                });

                setNewSubfolderName('');
                setShowNewSubfolderModal(false);
                alert('🎉 Subfolder created successfully!');
              }}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Subfolder Name</label>
                <input required type="text" placeholder="e.g. Social Media" value={newSubfolderName} onChange={(e) => setNewSubfolderName(e.target.value)} className="px-3 py-2 border rounded-xl text-xs bg-slate-50 focus:outline-none" />
              </div>

              <button type="submit" className="bg-primary hover:bg-primary-container text-white py-2.5 rounded-xl text-xs font-bold shadow-sm transition-colors mt-2 cursor-pointer text-center w-full">
                Create Subfolder
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Choose Existing Uploaded Files Modal */}
      {showChooseExistingModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 flex flex-col gap-6 text-left transform scale-100 transition-all">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[24px]">folder_open</span>
                Choose Existing Files
              </h3>
              <button 
                onClick={() => setShowChooseExistingModal(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <p className="text-[10px] text-slate-500 font-medium">Select files previously uploaded in your deliveries to import into this directory path.</p>
              
              <div className="max-h-[300px] overflow-y-auto border rounded-xl divide-y divide-slate-100 bg-slate-50/50">
                {transfers.flatMap(t => t.files.map(f => ({ ...f, transferTitle: t.title }))).length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">No previously uploaded files found.</p>
                ) : (
                  transfers.flatMap(t => t.files.map(f => ({ ...f, transferTitle: t.title }))).map((file, i) => (
                    <div 
                      key={i} 
                      onClick={async () => {
                        await addSharedFolderFile({
                          folderId: selectedSharedFolderId!,
                          parentPath: currentFolderPath,
                          name: file.name,
                          size: file.size,
                          mimeType: file.mimeType,
                          uploadedBy: currentUser?.email || 'System'
                        });
                        alert(`✅ Imported file "${file.name}"!`);
                      }}
                      className="p-3 flex justify-between items-center hover:bg-slate-100 cursor-pointer transition-colors"
                    >
                      <div className="text-left min-w-0 flex-1 pr-3">
                        <p className="text-xs font-bold text-slate-800 truncate">{file.name}</p>
                        <p className="text-[9px] text-slate-400 mt-0.5">Size: {formatSize(file.size)} • Transfer: {file.transferTitle}</p>
                      </div>
                      <span className="material-symbols-outlined text-slate-400 hover:text-primary text-[18px]">add_circle</span>
                    </div>
                  ))
                )}
              </div>

              <button 
                onClick={() => setShowChooseExistingModal(false)}
                className="bg-primary hover:bg-primary-container text-white py-2.5 rounded-xl font-bold text-xs shadow-sm transition-colors text-center w-full"
              >
                Done Importing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create File Request Modal */}
      {showCreateRequestModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 flex flex-col gap-6 text-left transform scale-100 transition-all">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[24px]">move_to_inbox</span>
                Create File Request
              </h3>
              <button 
                onClick={() => {
                  setReqTitle('');
                  setReqDescription('');
                  setReqFolderId('');
                  setReqClientEmail('');
                  setShowCreateRequestModal(false);
                }}
                className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form 
              onSubmit={async (e) => {
                e.preventDefault();
                if (!reqTitle) return;

                await createFileRequest({
                  title: reqTitle,
                  description: reqDescription,
                  folderId: reqFolderId || undefined,
                  clientEmail: reqClientEmail || undefined
                });
                setReqTitle('');
                setReqDescription('');
                setReqFolderId('');
                setReqClientEmail('');
                setShowCreateRequestModal(false);
                alert('🎉 File request link created successfully!');
              }}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Request Title *</label>
                <input required type="text" placeholder="e.g. Upload Campaign Assets" value={reqTitle} onChange={(e) => setReqTitle(e.target.value)} className="px-3 py-2 border rounded-xl text-xs bg-slate-50 focus:outline-none" />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Client Email (Optional)</label>
                <input type="email" placeholder="e.g. client@company.com" value={reqClientEmail} onChange={(e) => setReqClientEmail(e.target.value)} className="px-3 py-2 border rounded-xl text-xs bg-slate-50 focus:outline-none" />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Instructions / Message</label>
                <textarea placeholder="e.g. Please send the final Figma designs and PSDs..." value={reqDescription} onChange={(e) => setReqDescription(e.target.value)} className="px-3 py-2 border rounded-xl text-xs bg-slate-50 focus:outline-none h-20 resize-none" />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Upload Target Shared Folder (Optional)</label>
                <select value={reqFolderId} onChange={(e) => setReqFolderId(e.target.value)} className="px-3 py-2 border rounded-xl text-xs bg-white font-bold cursor-pointer">
                  <option value="">Directly to Workspace Vault</option>
                  {sharedFolders.map(folder => (
                    <option key={folder.id} value={folder.id}>{folder.name}</option>
                  ))}
                </select>
                <p className="text-[9px] text-slate-400 mt-1">If selected, uploaded files will automatically sync into this folder directory.</p>
              </div>

              <button type="submit" className="bg-primary hover:bg-primary-container text-white py-3 rounded-xl text-xs font-bold shadow-sm transition-colors mt-2 cursor-pointer text-center w-full">
                Generate Request Link
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Account Details Modal (Profile Image Click) */}
      {showAccountDetailsModal && currentUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-100 flex flex-col md:flex-row overflow-hidden transform scale-100 transition-all">
            
            {/* Left Sidebar Pane */}
            <div className="md:w-1/3 bg-slate-50 p-6 flex flex-col items-center gap-6 border-r border-slate-100">
              {/* Profile Image with Upload Trigger */}
              <div className="relative group w-44 h-44 rounded-3xl overflow-hidden shadow-md border border-slate-200 bg-slate-100 flex items-center justify-center">
                {currentUser.avatarUrl ? (
                  <img
                    alt={currentUser.fullName}
                    src={currentUser.avatarUrl}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-primary/10 text-primary flex items-center justify-center font-bold text-3xl">
                    {currentUser.fullName.charAt(0).toUpperCase()}
                  </div>
                )}
                
                {/* Upload Hover Overlay */}
                <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-2 text-white cursor-pointer select-none">
                  <span className="material-symbols-outlined text-[32px]">photo_camera</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider">Click to change photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        const file = e.target.files[0];
                        const filePath = `avatars/${currentUser.email}_${Date.now()}.png`;
                        const { error } = await supabase.storage
                          .from('folders')
                          .upload(filePath, file, { cacheControl: '3600', upsert: true });

                        if (!error) {
                          const { data } = supabase.storage
                            .from('folders')
                            .getPublicUrl(filePath);

                          await supabase
                            .from('users')
                            .update({ avatar_url: data.publicUrl })
                            .eq('email', currentUser.email);

                          setCurrentUser({ ...currentUser, avatarUrl: data.publicUrl });
                          alert('📸 Profile picture updated successfully!');
                        } else {
                          alert('❌ Failed to upload avatar: ' + error.message);
                        }
                      }
                    }}
                  />
                </label>
              </div>

              {/* Vertical Tabs */}
              <div className="flex flex-col gap-1 w-full mt-4">
                <button
                  onClick={() => setAccTab('details')}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold w-full text-left transition-all ${
                    accTab === 'details' ? 'bg-white text-slate-800 shadow-sm border border-slate-100 font-bold' : 'text-slate-500 hover:bg-slate-100/50'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">description</span>
                  <span>Account Details</span>
                </button>
                <button
                  onClick={() => setAccTab('shipping')}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold w-full text-left transition-all ${
                    accTab === 'shipping' ? 'bg-white text-slate-800 shadow-sm border border-slate-100 font-bold' : 'text-slate-500 hover:bg-slate-100/50'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">local_shipping</span>
                  <span>Shipping Address</span>
                </button>
                <button
                  onClick={() => setAccTab('payment')}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold w-full text-left transition-all ${
                    accTab === 'payment' ? 'bg-white text-slate-800 shadow-sm border border-slate-100 font-bold' : 'text-slate-500 hover:bg-slate-100/50'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">credit_card</span>
                  <span>Payment methods</span>
                </button>
              </div>
            </div>

            {/* Right Form Pane */}
            <div className="flex-1 p-8 flex flex-col gap-6 relative text-left">
              <button 
                onClick={() => setShowAccountDetailsModal(false)}
                className="absolute right-6 top-6 w-8 h-8 rounded-full hover:bg-slate-150 text-slate-400 hover:text-slate-655 flex items-center justify-center transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>

              {accTab === 'details' && (
                <form 
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const newFullName = `${accFirstName.trim()} ${accLastName.trim()}`.trim();
                    const { error } = await supabase
                      .from('users')
                      .update({ full_name: newFullName })
                      .eq('email', currentUser.email);

                    if (!error) {
                      setCurrentUser({ ...currentUser, fullName: newFullName });
                      setShowAccountDetailsModal(false);
                      alert('✅ Account details updated successfully!');
                    } else {
                      alert('❌ Failed to update details: ' + error.message);
                    }
                  }}
                  className="flex flex-col gap-5"
                >
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Account Details</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">First Name *</label>
                      <input required type="text" value={accFirstName} onChange={(e) => setAccFirstName(e.target.value)} className="px-3.5 py-2.5 border rounded-xl text-xs bg-slate-50 focus:outline-none" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Last Name *</label>
                      <input required type="text" value={accLastName} onChange={(e) => setAccLastName(e.target.value)} className="px-3.5 py-2.5 border rounded-xl text-xs bg-slate-50 focus:outline-none" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">E-Mail *</label>
                    <input disabled type="email" value={accEmail} className="px-3.5 py-2.5 border rounded-xl text-xs bg-slate-100 text-slate-400 cursor-not-allowed outline-none" />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Date of Birth (Optional)</label>
                    <div className="grid grid-cols-3 gap-2">
                      <select value={accDobDay} onChange={(e) => setAccDobDay(e.target.value)} className="px-3 py-2.5 border rounded-xl text-xs bg-white cursor-pointer font-semibold">
                        {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                      <select value={accDobMonth} onChange={(e) => setAccDobMonth(e.target.value)} className="px-3 py-2.5 border rounded-xl text-xs bg-white cursor-pointer font-semibold">
                        {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                      <select value={accDobYear} onChange={(e) => setAccDobYear(e.target.value)} className="px-3 py-2.5 border rounded-xl text-xs bg-white cursor-pointer font-semibold">
                        {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map(y => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Gender (Optional)</label>
                    <select value={accGender} onChange={(e) => setAccGender(e.target.value)} className="px-3 py-2.5 border rounded-xl text-xs bg-white cursor-pointer font-semibold">
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="flex justify-end mt-4">
                    <button type="submit" className="bg-primary hover:bg-primary-container text-white py-3 px-6 rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]">sync</span>
                      <span>Update</span>
                    </button>
                  </div>
                </form>
              )}

              {accTab === 'shipping' && (
                <div className="flex flex-col gap-4 py-8 text-center text-slate-400">
                  <span className="material-symbols-outlined text-[48px] mb-2 block">local_shipping</span>
                  <p className="text-xs font-semibold">Shipping Address settings are currently mocked.</p>
                </div>
              )}

              {accTab === 'payment' && (
                <div className="flex flex-col gap-4 py-8 text-center text-slate-400">
                  <span className="material-symbols-outlined text-[48px] mb-2 block">credit_card</span>
                  <p className="text-xs font-semibold">Payment Methods details are currently mocked.</p>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* Premium Animated Toast Notification */}
      {toast && (() => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        const title = isSuccess ? 'Notification Successful' : isError ? 'Operation Failure' : 'Attention Needed';
        const bgClass = isSuccess ? 'bg-[#edfcf6] border-[#c6f6e5]' : isError ? 'bg-[#fef2f2] border-[#fee2e2]' : 'bg-[#fffbeb] border-[#fef3c7]';
        const iconBg = isSuccess ? 'bg-[#22c55e]' : isError ? 'bg-[#ef4444]' : 'bg-[#f59e0b]';
        const iconSymbol = isSuccess ? 'check' : isError ? 'warning' : 'info';

        return (
          <div 
            className={`fixed top-6 right-6 z-[100000] flex items-center gap-4 px-5 py-4 rounded-3xl shadow-xl border w-full max-w-sm text-left transition-all duration-300 transform translate-y-0 opacity-100 ${bgClass}`}
            style={{ animation: 'toast-slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
          >
            {/* Left Circular Icon Container */}
            <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center flex-shrink-0">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white ${iconBg}`}>
                <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>{iconSymbol}</span>
              </div>
            </div>

            {/* Central Texts */}
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-slate-800 leading-tight">{title}</h4>
              <p className="text-[10px] text-slate-500 mt-0.5 font-medium line-clamp-2">{toast.message}</p>
            </div>

            {/* Close Button */}
            <button 
              onClick={() => setToast(null)}
              className="text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        );
      })()}

      {/* Floating Chat Button and Drawer */}
      <div className="fixed bottom-6 right-6 z-[999] flex flex-col items-end gap-3 font-sans">
        {showChatDrawer ? (
          <div className="w-96 h-[520px] bg-white/95 backdrop-blur-xl rounded-[28px] shadow-[0_24px_50px_-12px_rgba(0,0,0,0.15)] border border-slate-200/50 flex flex-col overflow-hidden animate-toast-slide-up select-none">
            {/* Premium Header */}
            <div className="p-4 bg-gradient-to-r from-primary to-indigo-650 text-white flex justify-between items-center shadow-sm relative z-10">
              <div className="flex items-center gap-2">
                {selectedChatUserEmail && (
                  <button
                    onClick={() => setSelectedChatUserEmail(null)}
                    className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all text-white cursor-pointer active:scale-90"
                  >
                    <span className="material-symbols-outlined text-[15px]">arrow_back</span>
                  </button>
                )}
                <div className="text-left">
                  <h4 className="text-[11px] font-extrabold tracking-wide uppercase">
                    {selectedChatUserEmail 
                      ? ((users.find(u => u.email.toLowerCase() === selectedChatUserEmail.toLowerCase())?.fullName || selectedChatUserEmail).replace(/`/g, ''))
                      : "Workspace Chat"}
                  </h4>
                  <p className="text-[9px] opacity-80 mt-0.5 leading-none">
                    {selectedChatUserEmail ? "Direct Conversation" : "Secure Team Network"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowChatDrawer(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all text-white cursor-pointer active:scale-90"
              >
                <span className="material-symbols-outlined text-[15px]">close</span>
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-4 bg-slate-50/70 flex flex-col gap-4 min-h-0">
              {!selectedChatUserEmail ? (
                // Users list with Invite Box
                <div className="flex flex-col gap-4">
                  {/* Invite Member Box */}
                  <div className="bg-white border border-slate-200/80 rounded-[20px] p-3 shadow-sm text-left flex flex-col gap-2">
                    <div>
                      <p className="text-[9px] font-extrabold text-slate-800 uppercase tracking-wide">Invite Workspace Member</p>
                      <p className="text-[8px] text-slate-400">Add colleagues to your secure chat network.</p>
                    </div>
                    <form 
                      onSubmit={async (e) => {
                        e.preventDefault();
                        if (!inviteEmailText.trim() || !currentUser) return;
                        const emailClean = inviteEmailText.trim().toLowerCase();
                        setInviteEmailText('');

                        try {
                          const { data: existing } = await supabase
                            .from('users')
                            .select('*')
                            .eq('email', emailClean)
                            .maybeSingle();

                          const workspaceOwner = currentUser.email.toLowerCase().trim();

                          if (existing) {
                            await supabase
                              .from('users')
                              .update({ joined_workspace: workspaceOwner })
                              .eq('email', emailClean);
                          } else {
                            await supabase
                              .from('users')
                              .insert({
                                id: `usr_${Date.now()}`,
                                email: emailClean,
                                full_name: emailClean.split('@')[0],
                                role: 'user',
                                status: 'active',
                                joined_workspace: workspaceOwner,
                                password: '1234'
                              });
                          }
                          alert(`📧 Success! ${emailClean} has been invited to your workspace chat.`);
                          
                          const { data: allUsers } = await supabase.from('users').select('*');
                          if (allUsers) {
                            setUsers(allUsers.map((u: any) => ({
                              id: u.id,
                              email: u.email,
                              fullName: u.full_name,
                              role: u.role,
                              avatarUrl: u.avatar_url,
                              plan: u.plan,
                              mfaEnabled: u.mfa_enabled,
                              status: u.status,
                              joinedWorkspace: u.joined_workspace,
                              createdAt: u.created_at
                            })));
                          }
                        } catch (err) {
                          console.error(err);
                        }
                      }}
                      className="flex gap-1.5"
                    >
                      <input
                        type="email"
                        required
                        placeholder="Enter email address..."
                        value={inviteEmailText}
                        onChange={(e) => setInviteEmailText(e.target.value)}
                        className="flex-1 px-3 py-2 bg-slate-50 border border-slate-150 rounded-xl text-[9px] text-slate-700 placeholder-slate-400 focus:outline-none focus:border-primary/40 focus:bg-white"
                      />
                      <button
                        type="submit"
                        className="bg-primary hover:bg-primary-container text-white py-1.5 px-3 rounded-xl font-bold text-[9px] transition-all cursor-pointer hover:scale-102 active:scale-95 whitespace-nowrap"
                      >
                        Send Invite
                      </button>
                    </form>
                  </div>

                  {/* Connected Users List */}
                  <div className="flex flex-col gap-2">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1 text-left">Active Members:</p>
                    {(() => {
                      const myWorkspaceOwner = (currentUser?.joinedWorkspace || currentUser?.email || '').toLowerCase().trim();
                      const workspaceUsers = users.filter(u => {
                        const uEmail = u.email.toLowerCase().trim();
                        const uJoined = (u.joinedWorkspace || '').toLowerCase().trim();
                        const myEmail = (currentUser?.email || '').toLowerCase().trim();
                        
                        if (uEmail === myEmail) return false;
                        return uJoined === myWorkspaceOwner || uEmail === myWorkspaceOwner;
                      });

                      if (workspaceUsers.length === 0) {
                        return (
                          <div className="text-center py-8 bg-white border border-slate-150 border-dashed rounded-2xl p-4 text-slate-400">
                            <span className="material-symbols-outlined text-[24px] mb-1.5 block opacity-60">group_add</span>
                            <p className="text-[9px] font-semibold">Your workspace has no members yet.</p>
                            <p className="text-[8px] mt-0.5">Use the invite box above to link team members!</p>
                          </div>
                        );
                      }

                      return workspaceUsers.map((u) => {
                        const initials = u.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                        return (
                          <div
                            key={u.email}
                            onClick={() => setSelectedChatUserEmail(u.email)}
                            className="flex items-center justify-between p-2.5 bg-white border border-slate-200/70 hover:border-primary/25 hover:shadow-sm rounded-2xl cursor-pointer transition-all active:scale-99"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary/10 to-indigo-650/10 flex items-center justify-center text-primary font-extrabold text-[10px] relative">
                                {initials}
                                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
                              </div>
                              <div className="text-left">
                                <p className="text-[11px] font-bold text-slate-800 capitalize">{(u.fullName || '').replace(/`/g, '')}</p>
                                <p className="text-[8px] text-slate-400 font-mono truncate max-w-[155px]">{u.email}</p>
                              </div>
                            </div>
                            <span className="material-symbols-outlined text-slate-300 text-[14px]">chevron_right</span>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              ) : (
                // Selected Conversation
                <div className="flex flex-col gap-3">
                  {chatMessages
                    .filter(m => 
                      (m.senderEmail.toLowerCase() === currentUser?.email.toLowerCase() && m.recipientEmail.toLowerCase() === selectedChatUserEmail.toLowerCase()) ||
                      (m.senderEmail.toLowerCase() === selectedChatUserEmail.toLowerCase() && m.recipientEmail.toLowerCase() === currentUser?.email.toLowerCase())
                    )
                    .map((msg, i) => {
                      const isMe = msg.senderEmail.toLowerCase() === currentUser?.email.toLowerCase();
                      return (
                        <div
                          key={msg.id || i}
                          className={`flex flex-col max-w-[85%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}
                        >
                          <div
                            className={`px-4 py-2.5 rounded-[18px] text-[10.5px] leading-relaxed shadow-[0_2px_5px_rgba(0,0,0,0.02)] transition-all hover:scale-[1.01] ${
                              isMe 
                                ? 'bg-gradient-to-br from-indigo-500 via-primary to-indigo-650 text-white rounded-tr-[4px]' 
                                : 'bg-white border border-slate-200/50 text-slate-800 rounded-tl-[4px]'
                            }`}
                          >
                            {msg.message}
                          </div>
                          <span className="text-[7.5px] text-slate-400 mt-1 select-none font-semibold px-1">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      );
                    })}
                  <div ref={chatEndRef} />
                </div>
              )}
            </div>

            {/* Input Footer */}
            {selectedChatUserEmail && (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!newMessageText.trim() || !currentUser) return;
                  const text = newMessageText.trim();
                  setNewMessageText('');

                  const newMsg = {
                    id: `msg_${Date.now()}`,
                    sender_email: currentUser.email.toLowerCase().trim(),
                    recipient_email: selectedChatUserEmail.toLowerCase().trim(),
                    message: text
                  };

                  // Optimistic local state insert
                  setChatMessages(prev => [
                    ...prev,
                    {
                      id: newMsg.id,
                      senderEmail: newMsg.sender_email,
                      recipientEmail: newMsg.recipient_email,
                      message: newMsg.message,
                      createdAt: new Date().toISOString()
                    }
                  ]);

                  try {
                    await supabase.from('workspace_messages').insert(newMsg);
                    fetchChatMessages();
                  } catch (err) {
                    console.error('Failed to send message:', err);
                  }
                }}
                className="p-3 border-t bg-white flex gap-2 items-center"
              >
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-150 rounded-xl text-[10px] focus:outline-none focus:border-primary/50 focus:bg-white"
                />
                <button
                  type="submit"
                  className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-indigo-650 text-white flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer border-none"
                >
                  <span className="material-symbols-outlined text-[15px]">send</span>
                </button>
              </form>
            )}
          </div>
        ) : (
          <button
            onClick={() => setShowChatDrawer(true)}
            className="w-14 h-14 rounded-full bg-gradient-to-tr from-primary to-indigo-650 flex items-center justify-center text-white shadow-2xl hover:scale-105 hover:rotate-6 active:scale-95 transition-all cursor-pointer"
            title="Open Chat"
          >
            <span className="material-symbols-outlined text-[24px]">forum</span>
          </button>
        )}
      </div>

      <style>{`
        @keyframes toast-slide-up {
          0% { transform: translateY(20px) scale(0.95); opacity: 0; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        .animate-toast-slide-up {
          animation: toast-slide-up 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};
