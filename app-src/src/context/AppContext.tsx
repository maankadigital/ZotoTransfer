import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabaseClient';

// Types
export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'user' | 'admin' | 'super_admin';
  avatarUrl?: string;
  plan: 'free' | 'pro' | 'business' | 'enterprise';
  mfaEnabled: boolean;
  status: 'active' | 'suspended';
  createdAt: string;
  joinedWorkspace?: string;
}

export interface FileItem {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
  downloadsCount: number;
}

export interface Transfer {
  id: string;
  title: string;
  message?: string;
  shortLink: string;
  senderEmail?: string;
  recipientEmails?: string[];
  files: FileItem[];
  isPublic: boolean;
  passwordProtected: boolean;
  password?: string;
  expiresAt: string;
  createdAt: string;
  downloads: number;
  storageUsed: number;
  companyId?: string;
}

export interface DownloadLog {
  id: string;
  transferId: string;
  fileName: string;
  ipAddress: string;
  deviceType: string;
  countryCode: string;
  downloadTime: string;
  companyId?: string;
}


export interface SharedFolder {
  id: string;
  name: string;
  description?: string;
  ownerEmail: string;
  icon?: string;
  color?: string;
  createdAt: string;
  expiresAt?: string;
  password?: string;
  publicShareEnabled: boolean;
  publicSharePermission: 'view' | 'download' | 'upload';
  publicShareLink?: string;
}

export interface SharedFolderMember {
  id: string;
  folderId: string;
  email: string;
  role: 'viewer' | 'contributor' | 'manager';
  invitedAt: string;
}

export interface SharedFolderFile {
  id: string;
  folderId: string;
  parentPath: string;
  name: string;
  size: number;
  mimeType?: string;
  uploadedBy: string;
  uploadedAt: string;
  downloadCount: number;
  version: number;
}

export interface SharedFolderActivity {
  id: string;
  folderId: string;
  email: string;
  actionType: 'file_uploaded' | 'file_downloaded' | 'file_viewed' | 'folder_created' | 'folder_renamed' | 'user_invited' | 'user_removed';
  details?: string;
  createdAt: string;
}

export interface TeamMember {
  id: string;
  email: string;
  fullName: string;
  role: 'owner' | 'admin' | 'manager' | 'member' | 'viewer';
  joinedAt: string;
}

export interface FileRequest {
  id: string;
  requesterEmail: string;
  title: string;
  description?: string;
  folderId?: string;
  status: string;
  createdAt: string;
  clientEmail?: string;
}


interface AppContextType {
  currentView: string;
  viewParams: any;
  setView: (view: string, params?: any) => void;
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  transfers: Transfer[];
  setTransfers: React.Dispatch<React.SetStateAction<Transfer[]>>;
  downloadLogs: DownloadLog[];
  addDownloadLog: (transferId: string, fileName: string, companyId?: string) => void;
  teamMembers: TeamMember[];
  addTeamMember: (email: string, fullName: string, role: any) => void;
  removeTeamMember: (id: string) => void;
  createTransfer: (transferData: Omit<Transfer, 'id' | 'shortLink' | 'createdAt' | 'downloads'> & { id?: string }) => Transfer;
  deleteTransfer: (id: string) => void;
  login: (email: string, password?: string) => Promise<'success' | 'not_found' | 'suspended' | 'error' | 'wrong_password'>;
  register: (email: string, fullName: string, password?: string) => Promise<'success' | 'exists' | 'error'>;
  logout: () => void;
  updateUserPlan: (plan: 'free' | 'pro' | 'business' | 'enterprise') => void;


  // Shared Folders CRM states & methods
  sharedFolders: SharedFolder[];
  setSharedFolders: React.Dispatch<React.SetStateAction<SharedFolder[]>>;
  sharedFolderMembers: SharedFolderMember[];
  setSharedFolderMembers: React.Dispatch<React.SetStateAction<SharedFolderMember[]>>;
  sharedFolderFiles: SharedFolderFile[];
  setSharedFolderFiles: React.Dispatch<React.SetStateAction<SharedFolderFile[]>>;
  sharedFolderActivities: SharedFolderActivity[];
  setSharedFolderActivities: React.Dispatch<React.SetStateAction<SharedFolderActivity[]>>;
  
  createSharedFolder: (folderData: Omit<SharedFolder, 'id' | 'ownerEmail' | 'createdAt'> & { id?: string }) => Promise<void>;
  updateSharedFolder: (id: string, folderData: Partial<SharedFolder>) => Promise<void>;
  deleteSharedFolder: (id: string) => Promise<void>;
  addSharedFolderFile: (fileData: Omit<SharedFolderFile, 'id' | 'uploadedAt' | 'downloadCount' | 'version'>) => Promise<void>;
  deleteSharedFolderFile: (id: string) => Promise<void>;
  inviteSharedFolderMember: (memberData: Omit<SharedFolderMember, 'id' | 'invitedAt'>) => Promise<void>;
  deleteSharedFolderMember: (id: string) => Promise<void>;
  logSharedFolderActivity: (folderId: string, actionType: SharedFolderActivity['actionType'], details?: string) => Promise<void>;

  fileRequests: FileRequest[];
  createFileRequest: (requestData: Omit<FileRequest, 'id' | 'requesterEmail' | 'createdAt' | 'status'>) => Promise<void>;
  deleteFileRequest: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);



export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<string>('home');
  const [viewParams, setViewParams] = useState<any>({});
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Load from localStorage or default values
  const [users, setUsers] = useState<User[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [downloadLogs, setDownloadLogs] = useState<DownloadLog[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);


  const [sharedFolders, setSharedFolders] = useState<SharedFolder[]>([]);
  const [sharedFolderMembers, setSharedFolderMembers] = useState<SharedFolderMember[]>([]);
  const [sharedFolderFiles, setSharedFolderFiles] = useState<SharedFolderFile[]>([]);
  const [sharedFolderActivities, setSharedFolderActivities] = useState<SharedFolderActivity[]>([]);
  const [fileRequests, setFileRequests] = useState<FileRequest[]>([]);


  // Listen to Supabase Auth State Changes (for Google / Social Auth)
  useEffect(() => {
    const handleAuthStateChange = async (_event: string, session: any) => {
      if (session?.user) {
        const authEmail = session.user.email;
        if (!authEmail) return;
        
        try {
          // Check if this Google user already exists in our custom users table
          const { data: existingUser } = await supabase
            .from('users')
            .select('*')
            .ilike('email', authEmail.toLowerCase().trim())
            .maybeSingle();
            
          if (existingUser) {
            // Load user session
            const matchedUser: User = {
              id: existingUser.id,
              email: existingUser.email,
              fullName: existingUser.full_name,
              role: existingUser.role,
              avatarUrl: existingUser.avatar_url || session.user.user_metadata?.avatar_url,
              plan: existingUser.plan,
              mfaEnabled: existingUser.mfa_enabled,
              status: existingUser.status,
              joinedWorkspace: existingUser.joined_workspace,
              createdAt: existingUser.created_at
            };
            setCurrentUser(matchedUser);
            setCurrentView(matchedUser.role === 'super_admin' ? 'admin' : 'dashboard');
          } else {
            // Register a new user in our custom table automatically
            const newId = `usr_${Date.now()}`;
            const googleName = session.user.user_metadata?.full_name || authEmail.split('@')[0];
            const googleAvatar = session.user.user_metadata?.avatar_url || '';
            
            const newUserRow = {
              id: newId,
              email: authEmail.toLowerCase().trim(),
              full_name: googleName,
              role: 'user',
              status: 'active',
              plan: 'free',
              avatar_url: googleAvatar,
              password: 'oauth_signed_in_1234'
            };
            
            const { error: insertError } = await supabase
              .from('users')
              .insert(newUserRow);
              
            if (!insertError) {
              const matchedUser: User = {
                id: newId,
                email: authEmail.toLowerCase().trim(),
                fullName: googleName,
                role: 'user',
                avatarUrl: googleAvatar,
                plan: 'free',
                mfaEnabled: false,
                status: 'active',
                createdAt: new Date().toISOString()
              };
              setCurrentUser(matchedUser);
              setCurrentView('dashboard');
              
              // Refresh user directory list
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
            }
          }
        } catch (e) {
          console.error('Error syncing OAuth session:', e);
        }
      }
    };

    // Get current session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        handleAuthStateChange('SIGNED_IN', session);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch Users on Startup
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase.from('users').select('*');
        if (!error && data) {
          const mappedUsers = data.map((u: any) => ({
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
          }));
          setUsers(mappedUsers);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchUsers();
  }, []);

  // Fetch transfers for currentUser
  // Fetch transfers for currentUser
  const fetchTransfers = useCallback(async () => {
    if (!currentUser) {
      setTransfers([]);
      return;
    }
    try {
      const isAdmin = currentUser.role === 'admin' || currentUser.role === 'super_admin';
      console.log('[fetchTransfers] user:', currentUser.email, '| role:', currentUser.role, '| isAdmin:', isAdmin);

      const { data, error } = await supabase
        .from('transfers')
        .select('*, files(*)')
        .order('created_at', { ascending: false });

      console.log('[fetchTransfers] raw rows:', data?.length ?? 0, '| error:', error?.message ?? 'none');

      if (error) {
        console.error('[fetchTransfers] Supabase error:', error);
        return;
      }
      
      if (data) {
        // Admins see ALL transfers; regular users only see their own
        const filteredTransfers = isAdmin
          ? data
          : data.filter((t: any) => {
              const sender = (t.sender_email || '').toLowerCase().trim();
              const recipient = (t.recipient_email || '').toLowerCase().trim();
              const myEmail = currentUser.email.toLowerCase().trim();
              return sender === myEmail || recipient === myEmail;
            });

        console.log('[fetchTransfers] after filter:', filteredTransfers.length, 'transfers');

        const mappedTransfers = filteredTransfers.map((t: any) => ({
          id: t.id,
          title: t.title,
          senderEmail: t.sender_email,
          recipientEmails: t.recipient_email ? [t.recipient_email] : [],
          storageUsed: parseInt(t.storage_used) || 0,
          downloads: t.downloads ?? 0,
          expiresAt: t.expires_at,
          createdAt: t.created_at,
          shortLink: t.id,
          isPublic: false,
          passwordProtected: false,
          companyId: t.company_id,
          files: (t.files || []).map((f: any) => ({
            id: f.id,
            name: f.name,
            size: parseInt(f.size) || 0,
            mimeType: f.mime_type,
            uploadedAt: f.uploaded_at,
            downloadsCount: 0
          }))
        }));
        setTransfers(mappedTransfers);
      }
    } catch (e) {
      console.error('[fetchTransfers] exception:', e);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchTransfers();
  }, [fetchTransfers]);

  // Fetch Team members
  useEffect(() => {
    if (!currentUser) {
      setTeamMembers([]);
      return;
    }
    const fetchTeam = async () => {
      try {
        const { data, error } = await supabase
          .from('team_members')
          .select('*');

        if (!error && data) {
          const ownerEmail = (currentUser.joinedWorkspace || currentUser.email).toLowerCase().trim();
          const filteredTeam = data.filter((m: any) => 
            m.workspace_owner_email && m.workspace_owner_email.toLowerCase().trim() === ownerEmail
          );

          const mappedTeam = filteredTeam.map((m: any) => ({
            id: m.id,
            email: m.email,
            fullName: m.full_name,
            role: m.role,
            joinedAt: m.joined_at
          }));

          const uniqueTeam: typeof mappedTeam = [];
          const seenEmails = new Set<string>();
          mappedTeam.forEach(m => {
            if (m.email && !seenEmails.has(m.email.toLowerCase().trim())) {
              seenEmails.add(m.email.toLowerCase().trim());
              uniqueTeam.push(m);
            }
          });

          setTeamMembers(uniqueTeam);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchTeam();
  }, [currentUser]);

  // Fetch download logs for transfers owned by currentUser
  useEffect(() => {
    if (!currentUser || transfers.length === 0) {
      setDownloadLogs([]);
      return;
    }
    const fetchDownloadLogs = async () => {
      try {
        const transferIds = transfers.map(t => t.id);
        
        const { data, error } = await supabase
          .from('download_logs')
          .select('*')
          .in('transfer_id', transferIds);

        if (!error && data) {
          const mappedLogs = data.map((log: any) => {
            const transfer = transfers.find(t => t.id === log.transfer_id);
            return {
              id: log.id,
              transferId: log.transfer_id,
              fileName: transfer ? transfer.title : 'Shared File',
              ipAddress: log.ip_address || '127.0.0.1',
              countryCode: log.country_code || 'US',
              downloadTime: log.download_time,
              deviceType: 'Web Browser',
              companyId: log.company_id
            };
          });
          
          mappedLogs.sort((a: any, b: any) => new Date(b.downloadTime).getTime() - new Date(a.downloadTime).getTime());

          const uniqueLogs: typeof mappedLogs = [];
          const seenFiles = new Set<string>();
          mappedLogs.forEach(log => {
            if (log.fileName && !seenFiles.has(log.fileName.toLowerCase())) {
              seenFiles.add(log.fileName.toLowerCase());
              uniqueLogs.push(log);
            }
          });

          setDownloadLogs(uniqueLogs);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchDownloadLogs();
  }, [currentUser, transfers]);

  // Fetch File Requests
  const fetchFileRequests = useCallback(async () => {
    if (!currentUser) {
      setFileRequests([]);
      return;
    }
    try {
      const myEmail = currentUser.email.toLowerCase().trim();
      const { data, error } = await supabase
        .from('file_requests')
        .select('*')
        .or(`requester_email.eq.${myEmail},client_email.eq.${myEmail}`);
      
      if (!error && data) {
        const mapped = data.map((r: any) => ({
          id: r.id,
          requesterEmail: r.requester_email,
          title: r.title,
          description: r.description,
          folderId: r.folder_id,
          status: r.status || 'active',
          createdAt: r.created_at,
          clientEmail: r.client_email
        }));
        setFileRequests(mapped);
      }
    } catch (e) {
      console.error(e);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchFileRequests();
  }, [fetchFileRequests]);

  // Fetch Shared Folders data when currentUser changes
  const fetchSharedFoldersData = useCallback(async () => {
    if (!currentUser) {
      setSharedFolders([]);
      return;
    }
    try {
      const myEmailClean = currentUser.email.toLowerCase().trim();
      
      // 1. Fetch owned folders
      const { data: ownedFolders } = await supabase
        .from('shared_folders')
        .select('*')
        .eq('owner_email', myEmailClean);

      // 2. Fetch folders where I am invited as a member
      const { data: memberRows } = await supabase
        .from('shared_folder_members')
        .select('folder_id')
        .ilike('email', myEmailClean);
      const memberFolderIds = (memberRows || []).map((r: any) => r.folder_id).filter(Boolean);

      let memberFolders: any[] = [];
      if (memberFolderIds.length > 0) {
        const { data: memRes } = await supabase
          .from('shared_folders')
          .select('*')
          .in('id', memberFolderIds);
        if (memRes) memberFolders = memRes;
      }

      // Merge and deduplicate
      const mergedFolders = [...(ownedFolders || []), ...memberFolders];
      const seenF = new Set<string>();
      const uniqueF: SharedFolder[] = [];
      mergedFolders.forEach((f: any) => {
        if (!seenF.has(f.id)) {
          seenF.add(f.id);
          uniqueF.push({
            id: f.id,
            name: f.name,
            description: f.description,
            ownerEmail: f.owner_email,
            icon: f.icon,
            color: f.color,
            createdAt: f.created_at,
            expiresAt: f.expires_at,
            password: f.password,
            publicShareEnabled: f.public_share_enabled,
            publicSharePermission: f.public_share_permission,
            publicShareLink: f.public_share_link
          });
        }
      });
      setSharedFolders(uniqueF);

      // Fetch child objects if there are active folders
      const uniqueFolderIds = uniqueF.map(f => f.id);
      if (uniqueFolderIds.length > 0) {
        const { data: folderFiles } = await supabase
          .from('shared_folder_files')
          .select('*')
          .in('folder_id', uniqueFolderIds);
        if (folderFiles) {
          setSharedFolderFiles(folderFiles.map((ff: any) => ({
            id: ff.id,
            folderId: ff.folder_id,
            parentPath: ff.parent_path || '',
            name: ff.name,
            size: parseInt(ff.size),
            mimeType: ff.mime_type,
            uploadedBy: ff.uploaded_by,
            uploadedAt: ff.uploaded_at,
            downloadCount: ff.download_count,
            version: ff.version
          })));
        }

        const { data: folderMembers } = await supabase
          .from('shared_folder_members')
          .select('*')
          .in('folder_id', uniqueFolderIds);
        if (folderMembers) {
          setSharedFolderMembers(folderMembers.map((fm: any) => ({
            id: fm.id,
            folderId: fm.folder_id,
            email: fm.email,
            role: fm.role,
            invitedAt: fm.invited_at
          })));
        }

        const { data: folderActs } = await supabase
          .from('shared_folder_activities')
          .select('*')
          .in('folder_id', uniqueFolderIds);
        if (folderActs) {
          setSharedFolderActivities(folderActs.map((fa: any) => ({
            id: fa.id,
            folderId: fa.folder_id,
            email: fa.email,
            actionType: fa.action_type,
            details: fa.details,
            createdAt: fa.created_at
          })));
        }
      } else {
        setSharedFolderFiles([]);
        setSharedFolderMembers([]);
        setSharedFolderActivities([]);
      }
    } catch (e) {
      console.error('Failed to fetch Shared Folders data:', e);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchSharedFoldersData();
  }, [fetchSharedFoldersData]);

  // Dynamic state poller for client uploads / request status changes (every 4 seconds)
  useEffect(() => {
    if (!currentUser) return;
    const interval = setInterval(() => {
      fetchTransfers();
      fetchFileRequests();
      fetchSharedFoldersData();
    }, 4000);
    return () => clearInterval(interval);
  }, [currentUser, fetchTransfers, fetchFileRequests, fetchSharedFoldersData]);

  // Set page view helper
  const setView = useCallback((view: string, params?: any) => {
    setCurrentView(view);
    setViewParams(params || {});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Auth Operations
  const login = async (email: string, password?: string): Promise<'success' | 'not_found' | 'suspended' | 'error' | 'wrong_password'> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .ilike('email', email.toLowerCase().trim());

      if (error) {
        console.error('Supabase query error:', error);
        return 'error';
      }

      if (!data || data.length === 0) {
        return 'not_found';
      }

      const matchedRow = data[0];

      if (matchedRow.status === 'suspended') {
        return 'suspended';
      }

      if (matchedRow.password && password && matchedRow.password !== password) {
        return 'wrong_password';
      }

      const matchedUser: User = {
        id: matchedRow.id,
        email: matchedRow.email,
        fullName: matchedRow.full_name,
        role: matchedRow.role,
        avatarUrl: matchedRow.avatar_url,
        plan: matchedRow.plan,
        mfaEnabled: matchedRow.mfa_enabled,
        status: matchedRow.status,
        joinedWorkspace: matchedRow.joined_workspace,
        createdAt: matchedRow.created_at
      };

      setCurrentUser(matchedUser);
      setView(matchedUser.role === 'super_admin' ? 'admin' : 'dashboard');
      return 'success';
    } catch (e) {
      console.error(e);
      return 'error';
    }
  };

  const register = async (email: string, fullName: string, password?: string): Promise<'success' | 'exists' | 'error'> => {
    try {
      const { data, error: queryError } = await supabase
        .from('users')
        .select('id')
        .ilike('email', email.toLowerCase().trim());

      if (queryError) {
        console.error('Supabase query error:', queryError);
        return 'error';
      }

      if (data && data.length > 0) {
        return 'exists';
      }

      const newUser: User = {
        id: `u_${Date.now()}`,
        email: email.toLowerCase().trim(),
        fullName,
        role: email.includes('admin') ? 'super_admin' : 'user',
        plan: 'free',
        mfaEnabled: false,
        status: 'active',
        createdAt: new Date().toISOString(),
      };

      const { error: insertError } = await supabase.from('users').insert({
        email: newUser.email,
        full_name: newUser.fullName,
        role: newUser.role,
        plan: newUser.plan,
        mfa_enabled: newUser.mfaEnabled,
        status: newUser.status,
        password: password || null,
        created_at: newUser.createdAt
      });

      if (insertError) {
        console.error('Supabase Registration Error:', insertError);
        return 'error';
      }

      setUsers(prev => [...prev, newUser]);
      setCurrentUser(newUser);
      setView('dashboard');
      return 'success';
    } catch (e) {
      console.error(e);
      return 'error';
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setView('home');
  };

  const updateUserPlan = (plan: 'free' | 'pro' | 'business' | 'enterprise') => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, plan };
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
  };

  // Transfer & File operations
  const createTransfer = (transferData: Omit<Transfer, 'id' | 'shortLink' | 'createdAt' | 'downloads'> & { id?: string }) => {
    const shortLink = Math.random().toString(36).substring(2, 8);
    const newTransfer: Transfer = {
      ...transferData,
      id: transferData.id || `t_${Date.now()}`,
      shortLink,
      createdAt: new Date().toISOString(),
      downloads: 0
    };

    setTransfers(prev => [newTransfer, ...prev]);

    // Sync to Supabase in the background
    try {
      const rEmail = newTransfer.recipientEmails && newTransfer.recipientEmails.length > 0
        ? newTransfer.recipientEmails[0].toLowerCase().trim()
        : null;

      supabase.from('transfers').insert({
        id: newTransfer.id,
        title: newTransfer.title,
        sender_email: (newTransfer.senderEmail || '').toLowerCase().trim(),
        storage_used: newTransfer.storageUsed,
        downloads: newTransfer.downloads,
        expires_at: newTransfer.expiresAt,
        recipient_email: rEmail,
        created_at: newTransfer.createdAt,
        company_id: newTransfer.companyId
      }).then(({ error }) => {
        if (error) console.error('Supabase Sync Error:', error);
      });



      const fileInserts = newTransfer.files.map(f => ({
        id: f.id,
        transfer_id: newTransfer.id,
        name: f.name,
        size: f.size,
        mime_type: f.mimeType,
        uploaded_at: f.uploadedAt
      }));

      supabase.from('files').insert(fileInserts).then(({ error }) => {
        if (error) console.error('Supabase Sync Error:', error);
      });
    } catch (e) {
      console.error(e);
    }

    return newTransfer;
  };

  const deleteTransfer = (id: string) => {
    setTransfers(prev => prev.filter(t => t.id !== id));

    // Sync deletion to Supabase
    try {
      supabase.from('transfers').delete().eq('id', id).then(({ error }) => {
        if (error) console.error('Supabase Sync Error:', error);
      });
    } catch (e) {
      console.error(e);
    }
  };

  const addDownloadLog = (transferId: string, fileName: string, companyId?: string) => {
    // Increment count on transfer
    setTransfers(prev => prev.map(t => {
      if (t.id === transferId) {
        return {
          ...t,
          downloads: t.downloads + 1,
          files: t.files.map(f => f.name === fileName ? { ...f, downloadsCount: f.downloadsCount + 1 } : f)
        };
      }
      return t;
    }));

    // Add log
    const devices = ['Desktop (Chrome)', 'Mobile (iOS)', 'Desktop (macOS)', 'Mobile (Android)', 'Desktop (Firefox)'];
    const countries = ['US', 'GB', 'CA', 'DE', 'FR', 'JP', 'AU', 'IN'];
    
    const newLog: DownloadLog = {
      id: `d_${Date.now()}`,
      transferId,
      fileName,
      ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      deviceType: devices[Math.floor(Math.random() * devices.length)],
      countryCode: countries[Math.floor(Math.random() * countries.length)],
      downloadTime: new Date().toISOString(),
      companyId
    };

    setDownloadLogs(prev => [newLog, ...prev]);

    // Sync to Supabase in the background
    try {
      supabase.from('download_logs').insert({
        id: newLog.id,
        transfer_id: newLog.transferId,
        ip_address: newLog.ipAddress,
        country_code: newLog.countryCode,
        download_time: newLog.downloadTime,
        company_id: companyId
      }).then(({ error }) => {
        if (error) console.error('Supabase Download Log Sync Error:', error);
      });



      // Update transfer downloads count in database
      supabase
        .from('transfers')
        .select('downloads')
        .eq('id', transferId)
        .then(({ data }) => {
          if (data && data.length > 0) {
            const currentDownloads = data[0].downloads || 0;
            supabase
              .from('transfers')
              .update({ downloads: currentDownloads + 1 })
              .eq('id', transferId)
              .then(({ error }) => {
                if (error) console.error('Supabase transfer download increment error:', error);
              });
          }
        });
    } catch (e) {
      console.error(e);
    }
  };

  // Team management operations
  const addTeamMember = (email: string, fullName: string, role: any) => {
    const newMember: TeamMember = {
      id: `m_${Date.now()}`,
      email,
      fullName,
      role,
      joinedAt: new Date().toISOString()
    };
    setTeamMembers(prev => {
      if (prev.some(m => m.email.toLowerCase().trim() === email.toLowerCase().trim())) {
        return prev;
      }
      return [...prev, newMember];
    });
    
    // Write global invitation log for recipient login check
    try {
      const invites = JSON.parse(localStorage.getItem('mt_global_invites') || '[]');
      const newInvite = {
        id: `inv_${Date.now()}`,
        email: email.toLowerCase().trim(),
        inviterEmail: currentUser?.email || 'Sarah Chen',
        inviterName: currentUser?.fullName || 'Sarah Chen',
        role,
        invitedAt: new Date().toISOString()
      };
      invites.push(newInvite);
      localStorage.setItem('mt_global_invites', JSON.stringify(invites));

      // Sync invite to Supabase
      supabase.from('global_invitations').insert({
        id: newInvite.id,
        email: newInvite.email,
        inviter_email: newInvite.inviterEmail,
        inviter_name: newInvite.inviterName,
        role: newInvite.role,
        invited_at: newInvite.invitedAt
      }).then(({ error }) => {
        if (error) console.error('Supabase Sync Error:', error);
      });

      // Sync member seat to Supabase team_members
      supabase.from('team_members').insert({
        workspace_owner_email: currentUser?.email || 'Sarah Chen',
        email: email.toLowerCase().trim(),
        full_name: fullName,
        role,
        joined_at: newInvite.invitedAt
      }).then(({ error }) => {
        if (error) console.error('Supabase Sync Error:', error);
      });
    } catch (e) {
      console.error(e);
    }
  };

  const removeTeamMember = (id: string) => {
    const member = teamMembers.find(m => m.id === id);
    setTeamMembers(prev => prev.filter(m => m.id !== id));
    
    if (member) {
      supabase
        .from('team_members')
        .delete()
        .eq('id', id)
        .then(({ error }) => {
          if (error) console.error('Supabase Delete Member Error:', error);
        });

      supabase
        .from('users')
        .update({ joined_workspace: null })
        .eq('email', member.email)
        .then(({ error }) => {
          if (error) console.error('Supabase Reset Member Workspace Error:', error);
        });
    }
  };

  // Shared Folders CRUD operations
  const createSharedFolder = async (folderData: Omit<SharedFolder, 'id' | 'ownerEmail' | 'createdAt'> & { id?: string }) => {
    if (!currentUser) return;
    const id = folderData.id || `fld_${Date.now()}`;
    const createdAt = new Date().toISOString();
    const newFolder: SharedFolder = {
      ...folderData,
      id,
      ownerEmail: currentUser.email.toLowerCase().trim(),
      createdAt
    };

    setSharedFolders(prev => [newFolder, ...prev]);

    try {
      const { error } = await supabase.from('shared_folders').insert({
        id,
        name: folderData.name,
        description: folderData.description || null,
        owner_email: currentUser.email.toLowerCase().trim(),
        icon: folderData.icon || null,
        color: folderData.color || null,
        created_at: createdAt,
        expires_at: folderData.expiresAt || null,
        password: folderData.password || null,
        public_share_enabled: folderData.publicShareEnabled,
        public_share_permission: folderData.publicSharePermission,
        public_share_link: folderData.publicShareLink || null
      });
      if (error) console.error('Supabase Create Folder Error:', error);
      
      // Log creation activity
      await logSharedFolderActivity(id, 'folder_created', `Shared folder "${folderData.name}" was initialized.`);
    } catch (e) {
      console.error(e);
    }
  };

  const updateSharedFolder = async (id: string, folderData: Partial<SharedFolder>) => {
    setSharedFolders(prev => prev.map(f => f.id === id ? { ...f, ...folderData } : f));

    try {
      const updatePayload: any = {};
      if (folderData.name !== undefined) updatePayload.name = folderData.name;
      if (folderData.description !== undefined) updatePayload.description = folderData.description;
      if (folderData.icon !== undefined) updatePayload.icon = folderData.icon;
      if (folderData.color !== undefined) updatePayload.color = folderData.color;
      if (folderData.expiresAt !== undefined) updatePayload.expires_at = folderData.expiresAt;
      if (folderData.password !== undefined) updatePayload.password = folderData.password;
      if (folderData.publicShareEnabled !== undefined) updatePayload.public_share_enabled = folderData.publicShareEnabled;
      if (folderData.publicSharePermission !== undefined) updatePayload.public_share_permission = folderData.publicSharePermission;
      if (folderData.publicShareLink !== undefined) updatePayload.public_share_link = folderData.publicShareLink;

      const { error } = await supabase.from('shared_folders').update(updatePayload).eq('id', id);
      if (error) console.error('Supabase Update Folder Error:', error);
    } catch (e) {
      console.error(e);
    }
  };

  const deleteSharedFolder = async (id: string) => {
    setSharedFolders(prev => prev.filter(f => f.id !== id));

    try {
      const { error } = await supabase.from('shared_folders').delete().eq('id', id);
      if (error) console.error('Supabase Delete Folder Error:', error);
    } catch (e) {
      console.error(e);
    }
  };

  const addSharedFolderFile = async (fileData: Omit<SharedFolderFile, 'id' | 'uploadedAt' | 'downloadCount' | 'version'>) => {
    const id = `sff_${Date.now()}`;
    const uploadedAt = new Date().toISOString();
    const newFile: SharedFolderFile = {
      id,
      uploadedAt,
      downloadCount: 0,
      version: 1,
      ...fileData
    };

    setSharedFolderFiles(prev => [...prev, newFile]);

    try {
      const { error } = await supabase.from('shared_folder_files').insert({
        id,
        folder_id: fileData.folderId,
        parent_path: fileData.parentPath,
        name: fileData.name,
        size: fileData.size,
        mime_type: fileData.mimeType || null,
        uploaded_by: fileData.uploadedBy,
        uploaded_at: uploadedAt,
        download_count: 0,
        version: 1
      });
      if (error) console.error('Supabase Add Folder File Error:', error);
      
      // Log upload activity
      await logSharedFolderActivity(fileData.folderId, 'file_uploaded', `Uploaded file "${fileData.name}".`);
    } catch (e) {
      console.error(e);
    }
  };

  const deleteSharedFolderFile = async (id: string) => {
    const file = sharedFolderFiles.find(f => f.id === id);
    setSharedFolderFiles(prev => prev.filter(f => f.id !== id));

    try {
      const { error } = await supabase.from('shared_folder_files').delete().eq('id', id);
      if (error) console.error('Supabase Delete Folder File Error:', error);

      if (file) {
        // Log delete activity
        await logSharedFolderActivity(file.folderId, 'file_viewed', `Deleted file "${file.name}".`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const inviteSharedFolderMember = async (memberData: Omit<SharedFolderMember, 'id' | 'invitedAt'>) => {
    const id = `sfm_${Date.now()}`;
    const invitedAt = new Date().toISOString();
    const newMember: SharedFolderMember = {
      id,
      invitedAt,
      ...memberData
    };

    setSharedFolderMembers(prev => [...prev, newMember]);

    try {
      const { error } = await supabase.from('shared_folder_members').insert({
        id,
        folder_id: memberData.folderId,
        email: memberData.email,
        role: memberData.role,
        invited_at: invitedAt
      });
      if (error) console.error('Supabase Invite Member Error:', error);
      
      // Log invitation activity
      await logSharedFolderActivity(memberData.folderId, 'user_invited', `Invited user "${memberData.email}" as a ${memberData.role}.`);
    } catch (e) {
      console.error(e);
    }
  };

  const deleteSharedFolderMember = async (id: string) => {
    const member = sharedFolderMembers.find(m => m.id === id);
    setSharedFolderMembers(prev => prev.filter(m => m.id !== id));

    try {
      const { error } = await supabase.from('shared_folder_members').delete().eq('id', id);
      if (error) console.error('Supabase Remove Member Error:', error);

      if (member) {
        // Log remove activity
        await logSharedFolderActivity(member.folderId, 'user_removed', `Removed user "${member.email}" from membership.`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const logSharedFolderActivity = async (folderId: string, actionType: SharedFolderActivity['actionType'], details?: string) => {
    const id = `sfa_${Date.now()}`;
    const createdAt = new Date().toISOString();
    const email = currentUser?.email || 'system@zoto.com';
    const newAct: SharedFolderActivity = {
      id,
      folderId,
      email,
      actionType,
      details,
      createdAt
    };

    setSharedFolderActivities(prev => [newAct, ...prev]);

    try {
      const { error } = await supabase.from('shared_folder_activities').insert({
        id,
        folder_id: folderId,
        email,
        action_type: actionType,
        details: details || null,
        created_at: createdAt
      });
      if (error) console.error('Supabase Log Folder Activity Error:', error);
    } catch (e) {
      console.error(e);
    }
  };

  const createFileRequest = async (requestData: Omit<FileRequest, 'id' | 'requesterEmail' | 'createdAt' | 'status'>) => {
    if (!currentUser) return;
    const newRequest: FileRequest = {
      ...requestData,
      id: `req_${Date.now()}`,
      requesterEmail: currentUser.email.toLowerCase().trim(),
      clientEmail: requestData.clientEmail ? requestData.clientEmail.toLowerCase().trim() : undefined,
      status: 'active',
      createdAt: new Date().toISOString()
    };

    setFileRequests(prev => [newRequest, ...prev]);

    try {
      await supabase.from('file_requests').insert({
        id: newRequest.id,
        requester_email: newRequest.requesterEmail,
        title: newRequest.title,
        description: newRequest.description || null,
        folder_id: newRequest.folderId || null,
        status: newRequest.status,
        created_at: newRequest.createdAt,
        client_email: newRequest.clientEmail || null
      });
    } catch (e) {
      console.error(e);
    }
  };

  const deleteFileRequest = async (id: string) => {
    setFileRequests(prev => prev.filter(r => r.id !== id));
    try {
      await supabase.from('file_requests').delete().eq('id', id);
    } catch (e) {
      console.error(e);
    }
  };
  return (
    <AppContext.Provider value={{
      currentView,
      viewParams,
      setView,
      currentUser,
      setCurrentUser,
      users,
      setUsers,
      transfers,
      setTransfers,
      downloadLogs,
      addDownloadLog,
      teamMembers,
      addTeamMember,
      removeTeamMember,
      createTransfer,
      deleteTransfer,
      login,
      register,
      logout,
      updateUserPlan,

      sharedFolders,
      setSharedFolders,
      sharedFolderMembers,
      setSharedFolderMembers,
      sharedFolderFiles,
      setSharedFolderFiles,
      sharedFolderActivities,
      setSharedFolderActivities,
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
      deleteFileRequest
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
