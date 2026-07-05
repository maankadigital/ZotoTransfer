import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Sidebar } from '../components/Sidebar';
import { useDarkMode } from '../hooks/useDarkMode';

export const AdminSuite: React.FC = () => {
  const { users, setUsers, transfers, downloadLogs, currentUser } = useApp();
  const [activeTab, setActiveTab] = useState<string>('analytics');
  const { dark, toggle: toggleDark } = useDarkMode();

  // Search filter
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Security Toggles
  const [rateLimiting, setRateLimiting] = useState<boolean>(true);
  const [virusScanning, setVirusScanning] = useState<boolean>(true);
  const [mfaEnforced, setMfaEnforced] = useState<boolean>(false);

  // Moderation: track taken-down / dismissed reports
  const [dismissedReports, setDismissedReports] = useState<number[]>([]);
  const [takenDownReports, setTakenDownReports] = useState<number[]>([]);

  const handleTakedown = (idx: number) => {
    setTakenDownReports(prev => [...prev, idx]);
    setTimeout(() => setDismissedReports(prev => [...prev, idx]), 800);
  };
  const handleDismiss = (idx: number) => {
    setDismissedReports(prev => [...prev, idx]);
  };

  // Storage and User aggregations
  const totalStorageAll = transfers.reduce((acc, t) => acc + (t.storageUsed || 0), 0);
  const totalDownloads  = transfers.reduce((acc, t) => acc + (t.downloads || 0), 0);
  const avgTransferSize = transfers.length > 0 ? totalStorageAll / transfers.length : 0;
  const activeUsers     = users.filter(u => u.status === 'active').length;
  const proUsers        = users.filter(u => u.plan === 'pro' || u.plan === 'business' || u.plan === 'enterprise').length;
  // Unique senders = distinct uploaders
  const uniqueSenders   = new Set(transfers.map(t => t.senderEmail)).size;
  // "Success rate" = transfers that haven't expired yet
  const now = Date.now();
  const activeTransfers = transfers.filter(t => t.expiresAt && new Date(t.expiresAt).getTime() > now).length;
  const successRate = transfers.length > 0 ? ((activeTransfers / transfers.length) * 100).toFixed(1) : '0.0';

  const toggleUserStatus = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const newStatus = u.status === 'active' ? 'suspended' : 'active';
          alert(`👤 User ${u.fullName} is now ${newStatus.toUpperCase()}`);
          return { ...u, status: newStatus };
        }
        return u;
      })
    );
  };

  const deleteUserRecord = (userId: string) => {
    if (window.confirm('Are you sure you want to permanently delete this user account?')) {
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      alert('👤 User account deleted successfully.');
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Mock audits
  const mockAudits = [
    { time: '2026-06-26T20:45:00Z', action: 'API Access', detail: 'Rate limiting threshold triggered for IP 185.220.101.5', severity: 'warning' },
    { time: '2026-06-26T19:30:00Z', action: 'Auth Audit', detail: 'Admin login approved for admin@mytransfer.com', severity: 'info' },
    { time: '2026-06-26T16:15:00Z', action: 'Billing Event', detail: 'Subscription upgraded successfully for Sarah Chen (Pro plan)', severity: 'success' },
    { time: '2026-06-25T14:20:00Z', action: 'Security Guard', detail: 'Virus scanning complete. 0 threats detected in transfer "commercial_render"', severity: 'success' },
    { time: '2026-06-25T10:00:00Z', action: 'User Action', detail: 'Account suspended for user John Doe (Abuse report)', severity: 'critical' },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden w-full">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isAdmin={true} />

      {/* Main Admin Suite Content */}
      <main className="flex-1 overflow-y-auto p-8 text-left">
        {/* Header bar */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/[0.07] pb-5 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white capitalize">
              {activeTab === 'overview' ? 'Admin Center' : activeTab.replace(/_/g, ' ')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Enterprise Security &amp; System Administration Controls</p>
          </div>

          <div className="flex items-center gap-3">

            {/* Dark mode toggle */}
            <button
              onClick={toggleDark}
              title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="w-10 h-10 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.06] hover:bg-slate-50 dark:hover:bg-white/10 text-slate-600 dark:text-white/80 flex items-center justify-center transition-all cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">{dark ? 'light_mode' : 'dark_mode'}</span>
            </button>

            {/* Audit shortcut */}
            <button
              onClick={() => setActiveTab('audit')}
              className="w-10 h-10 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.06] hover:bg-slate-50 dark:hover:bg-white/10 hover:border-primary/30 text-slate-600 dark:text-white/80 flex items-center justify-center transition-all cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95"
              title="Audit Logs"
            >
              <span className="material-symbols-outlined text-[18px]">notifications</span>
            </button>

            {/* Separator */}
            <div className="w-[1px] h-6 bg-slate-200 dark:bg-white/10" />

            {/* Profile block */}
            {currentUser && (
              <div className="flex items-center gap-2.5">
                {/* Gradient avatar */}
                <div className="w-10 h-10 p-[2px] bg-gradient-to-tr from-red-500 via-orange-500 to-yellow-400 rounded-full flex items-center justify-center shadow-md">
                  {currentUser.avatarUrl ? (
                    <img
                      src={currentUser.avatarUrl}
                      alt={currentUser.fullName}
                      className="w-full h-full object-cover rounded-full border-2 border-white"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-red-700 text-white flex items-center justify-center font-bold text-xs border border-white">
                      {currentUser.fullName?.charAt(0).toUpperCase() || 'A'}
                    </div>
                  )}
                </div>

                {/* Name + role */}
                <div className="flex flex-col text-left select-none">
                  <span className="text-[13px] font-extrabold text-slate-800 dark:text-white capitalize leading-none mb-1">
                    {(currentUser.fullName || currentUser.email.split('@')[0]).replace(/`/g, '')}
                  </span>
                  <span className="text-[8.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border w-fit bg-red-50 text-red-600 border-red-200/60 dark:bg-red-900/20 dark:border-red-500/20 dark:text-red-400 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[9px]">shield</span>
                    Super Admin
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 1. Admin Overview Tab */}
        {activeTab === 'overview' && (
          <div className="flex flex-col gap-8">
            {/* Stats grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm relative overflow-hidden">
                {/* Watermark logo */}
                <div className="absolute -top-8 -right-8 w-32 h-32 opacity-[0.07] pointer-events-none text-slate-900 select-none">
                  <img src="/z-logo-blue.svg" alt="" className="w-full h-full object-contain" draggable="false" />
                </div>
                <span className="material-symbols-outlined text-primary text-[30px] mb-4">group</span>
                <h4 className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Total Users</h4>
                <p className="text-3xl font-extrabold text-slate-950">{users.length}</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm relative overflow-hidden">
                {/* Watermark logo */}
                <div className="absolute -top-8 -right-8 w-32 h-32 opacity-[0.07] pointer-events-none text-slate-900 select-none">
                  <img src="/z-logo-blue.svg" alt="" className="w-full h-full object-contain" draggable="false" />
                </div>
                <span className="material-symbols-outlined text-secondary text-[30px] mb-4">bolt</span>
                <h4 className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Active Transfers</h4>
                <p className="text-3xl font-extrabold text-slate-950">{transfers.length}</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm relative overflow-hidden">
                {/* Watermark logo */}
                <div className="absolute -top-8 -right-8 w-32 h-32 opacity-[0.07] pointer-events-none text-slate-900 select-none">
                  <img src="/z-logo-blue.svg" alt="" className="w-full h-full object-contain" draggable="false" />
                </div>
                <span className="material-symbols-outlined text-emerald-500 text-[30px] mb-4">download_done</span>
                <h4 className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Total Downloads</h4>
                <p className="text-3xl font-extrabold text-slate-950">{downloadLogs.length}</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm relative overflow-hidden">
                {/* Watermark logo */}
                <div className="absolute -top-8 -right-8 w-32 h-32 opacity-[0.07] pointer-events-none text-slate-900 select-none">
                  <img src="/z-logo-blue.svg" alt="" className="w-full h-full object-contain" draggable="false" />
                </div>
                <span className="material-symbols-outlined text-amber-500 text-[30px] mb-4">database</span>
                <h4 className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">System Storage</h4>
                <p className="text-2xl font-extrabold text-slate-950">{formatSize(totalStorageAll)}</p>
              </div>
            </div>

            {/* Dynamic System status charts & metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                <h3 className="text-sm font-bold text-slate-900 mb-6">Security Scanning Engine</h3>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h4 className="text-xs font-semibold text-slate-800">Automatic Virus Scanning</h4>
                      <p className="text-[10px] text-slate-400">Scan uploads using enterprise ClamAV engine</p>
                    </div>
                    <button
                      onClick={() => setVirusScanning(!virusScanning)}
                      className={`w-12 h-6 rounded-full p-1 transition-all ${virusScanning ? 'bg-primary flex justify-end' : 'bg-slate-300 flex justify-start'}`}
                    >
                      <div className="w-4 h-4 bg-white rounded-full" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h4 className="text-xs font-semibold text-slate-800">DDoS Rate Limiting</h4>
                      <p className="text-[10px] text-slate-400">IP rate limiting triggers automatically at 60 uploads/min</p>
                    </div>
                    <button
                      onClick={() => setRateLimiting(!rateLimiting)}
                      className={`w-12 h-6 rounded-full p-1 transition-all ${rateLimiting ? 'bg-primary flex justify-end' : 'bg-slate-300 flex justify-start'}`}
                    >
                      <div className="w-4 h-4 bg-white rounded-full" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-semibold text-slate-800">Enforce Multi-Factor Auth (MFA)</h4>
                      <p className="text-[10px] text-slate-400">Require MFA verification for business workspace admins</p>
                    </div>
                    <button
                      onClick={() => setMfaEnforced(!mfaEnforced)}
                      className={`w-12 h-6 rounded-full p-1 transition-all ${mfaEnforced ? 'bg-primary flex justify-end' : 'bg-slate-300 flex justify-start'}`}
                    >
                      <div className="w-4 h-4 bg-white rounded-full" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm text-left">
                <h3 className="text-sm font-bold text-slate-900 mb-4">Storage Allocation</h3>
                <div className="flex flex-col gap-4">
                  <div>
                    <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1.5 uppercase">
                      <span>R2 Cloud Storage</span>
                      <span>85%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-primary h-full rounded-full" style={{ width: '85%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1.5 uppercase">
                      <span>AWS S3 Backup</span>
                      <span>15%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-secondary h-full rounded-full" style={{ width: '15%' }} />
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal mt-4">
                    Cloudflare R2 functions as the primary CDN storage bucket. AWS S3 acts as a geo-redundant backup layer for Enterprise clients.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. User Management Tab */}
        {activeTab === 'users' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-bold text-slate-950">System Users ({users.length})</h3>
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs w-60 focus:outline-none focus:border-primary"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold">
                    <th className="pb-3 text-left">User</th>
                    <th className="pb-3 text-left">Role</th>
                    <th className="pb-3 text-left">Plan</th>
                    <th className="pb-3 text-left">Status</th>
                    <th className="pb-3 text-left">Registered</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users
                    .filter((u) => u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((user) => (
                      <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            {user.avatarUrl ? (
                              <img src={user.avatarUrl} alt={user.fullName} className="w-8 h-8 rounded-full object-cover" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs">
                                {user.fullName.charAt(0)}
                              </div>
                            )}
                            <div>
                              <h4 className="text-xs font-bold text-slate-800">{user.fullName}</h4>
                              <p className="text-[10px] text-slate-500">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 text-xs font-semibold text-slate-600">{user.role}</td>
                        <td className="py-4">
                          <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-md uppercase">
                            {user.plan}
                          </span>
                        </td>
                        <td className="py-4">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                              user.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                            }`}
                          >
                            {user.status}
                          </span>
                        </td>
                        <td className="py-4 text-slate-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td className="py-4 text-right flex items-center justify-end gap-3 mt-1">
                          <button
                            onClick={() => toggleUserStatus(user.id)}
                            className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                          >
                            {user.status === 'active' ? 'Suspend' : 'Activate'}
                          </button>
                          {user.role !== 'super_admin' && (
                            <button
                              onClick={() => deleteUserRecord(user.id)}
                              className="text-red-500 hover:text-red-700 text-xs font-semibold"
                            >
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. Security & Moderation */}
        {activeTab === 'moderation' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white dark:bg-[#222228] border border-slate-200 dark:border-[#38383f] rounded-3xl p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-950 dark:text-white mb-6">Abuse Reports & Flagged Content</h3>
              <div className="flex flex-col gap-4">
                {[
                  { title: 'abusive_phishing_link.zip', owner: 'spammer@yahoo.com', reporter: 'External Guard', reason: 'Phishing signature detected', date: '2026-06-26T12:00:00Z' },
                  { title: 'copyright_movie_render.mkv', owner: 'anonymous@mytransfer.com', reporter: 'DMCA Engine', reason: 'DMCA Takedown Notice', date: '2026-06-25T15:30:00Z' }
                ].filter((_, idx) => !dismissedReports.includes(idx)).map((rep, idx) => {
                  const realIdx = dismissedReports.reduce((acc, d) => d <= idx + acc ? acc + 1 : acc, idx);
                  const isTakenDown = takenDownReports.includes(realIdx);
                  return (
                    <div key={realIdx} className={`border rounded-2xl p-4 flex flex-col md:flex-row justify-between gap-4 transition-all duration-300 ${
                      isTakenDown
                        ? 'border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-500/20 opacity-60'
                        : 'border-slate-100 dark:border-[#38383f] bg-slate-50/50 dark:bg-white/[0.03]'
                    }`}>
                      <div>
                        <h4 className="text-xs font-bold text-red-600 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">warning</span>
                          {rep.title}
                          {isTakenDown && <span className="ml-2 text-[9px] bg-red-100 dark:bg-red-900/30 text-red-600 px-2 py-0.5 rounded-full font-black uppercase tracking-wide">TAKEN DOWN</span>}
                        </h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                          Uploaded by: {rep.owner} • Reason: <strong>{rep.reason}</strong>
                        </p>
                        <p className="text-[9px] text-slate-400 mt-0.5">Reported by: {rep.reporter} • {new Date(rep.date).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {!isTakenDown && (
                          <button
                            onClick={() => handleTakedown(realIdx)}
                            className="bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-sm active:scale-95 transition-all"
                          >
                            Takedown
                          </button>
                        )}
                        <button
                          onClick={() => handleDismiss(realIdx)}
                          className="bg-white dark:bg-white/5 border border-slate-200 dark:border-[#38383f] hover:bg-slate-50 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-sm active:scale-95 transition-all"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  );
                })}
                {dismissedReports.length === 2 && (
                  <div className="text-center py-8 text-slate-400 dark:text-slate-500">
                    <span className="material-symbols-outlined text-[40px] mb-2 block text-emerald-500">shield_check</span>
                    <p className="text-xs font-semibold text-emerald-600">All reports resolved. Queue is clear.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm text-left">
              <h3 className="text-sm font-bold text-slate-900 mb-4">Rate Limiting Thresholds</h3>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wide text-slate-500 block mb-1">Max Uploads / Minute</label>
                  <input type="number" defaultValue={20} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wide text-slate-500 block mb-1">Max Storage per Link (Free)</label>
                  <input type="text" defaultValue="2 GB" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs" />
                </div>
                <button className="bg-primary hover:bg-primary-container text-white py-2 rounded-xl text-[10px] font-bold shadow-sm transition-all scale-98 active:scale-95">
                  Save Configurations
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 4. Audit Logs Tab */}
        {activeTab === 'audit' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-950 mb-6">System Activity Logs</h3>
            <div className="flex flex-col gap-3">
              {mockAudits.map((log, idx) => (
                <div key={idx} className="flex items-start gap-4 border-b border-slate-100 pb-3">
                  <span className={`material-symbols-outlined text-[20px] shrink-0 mt-0.5 ${
                    log.severity === 'critical' ? 'text-red-600' :
                    log.severity === 'warning' ? 'text-amber-500' :
                    log.severity === 'success' ? 'text-emerald-500' : 'text-slate-400'
                  }`}>
                    {log.severity === 'critical' ? 'cancel' :
                     log.severity === 'warning' ? 'report_problem' :
                     log.severity === 'success' ? 'check_circle' : 'info'}
                  </span>
                  <div>
                    <div className="flex items-baseline gap-2">
                      <h4 className="text-xs font-bold text-slate-800">{log.action}</h4>
                      <span className="text-[10px] text-slate-400">{new Date(log.time).toLocaleString()}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">{log.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="flex flex-col gap-8">
            {/* KPI Row — real data */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">

              <div className="bg-white dark:bg-[#222228] border border-slate-200 dark:border-[#38383f] rounded-[24px] p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow text-left">
                <div className="flex justify-between items-start">
                  <div className="p-2 bg-primary/10 text-primary rounded-lg">
                    <span className="material-symbols-outlined text-[20px]">swap_horiz</span>
                  </div>
                  <span className="text-emerald-600 text-[10px] font-bold bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-0.5 rounded-full">Live</span>
                </div>
                <div className="mt-4">
                  <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold">Total Transfers</p>
                  <h3 className="text-2xl font-extrabold mt-1 text-slate-900 dark:text-white">{transfers.length}</h3>
                </div>
              </div>

              <div className="bg-white dark:bg-[#222228] border border-slate-200 dark:border-[#38383f] rounded-[24px] p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow text-left">
                <div className="flex justify-between items-start">
                  <div className="p-2 bg-violet-50 text-violet-600 rounded-lg">
                    <span className="material-symbols-outlined text-[20px]">group</span>
                  </div>
                  <span className="text-slate-500 text-[10px] font-bold bg-slate-100 dark:bg-white/10 dark:text-slate-400 px-2.5 py-0.5 rounded-full">{activeUsers} active</span>
                </div>
                <div className="mt-4">
                  <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold">Total Users</p>
                  <h3 className="text-2xl font-extrabold mt-1 text-slate-900 dark:text-white">{users.length}</h3>
                </div>
              </div>

              <div className="bg-white dark:bg-[#222228] border border-slate-200 dark:border-[#38383f] rounded-[24px] p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow text-left">
                <div className="flex justify-between items-start">
                  <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                    <span className="material-symbols-outlined text-[20px]">database</span>
                  </div>
                  <span className="text-slate-500 text-[10px] font-bold bg-slate-100 dark:bg-white/10 dark:text-slate-400 px-2.5 py-0.5 rounded-full">Stored</span>
                </div>
                <div className="mt-4">
                  <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold">Total Storage Used</p>
                  <h3 className="text-2xl font-extrabold mt-1 text-slate-900 dark:text-white">{formatSize(totalStorageAll)}</h3>
                </div>
              </div>

              <div className="bg-white dark:bg-[#222228] border border-slate-200 dark:border-[#38383f] rounded-[24px] p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow text-left">
                <div className="flex justify-between items-start">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                    <span className="material-symbols-outlined text-[20px]">download</span>
                  </div>
                  <span className="text-emerald-600 text-[10px] font-bold bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-0.5 rounded-full">All-time</span>
                </div>
                <div className="mt-4">
                  <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold">Total Downloads</p>
                  <h3 className="text-2xl font-extrabold mt-1 text-slate-900 dark:text-white">{totalDownloads.toLocaleString()}</h3>
                </div>
              </div>

              <div className="bg-white dark:bg-[#222228] border border-slate-200 dark:border-[#38383f] rounded-[24px] p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow text-left">
                <div className="flex justify-between items-start">
                  <div className="p-2 bg-blue-50 text-secondary rounded-lg">
                    <span className="material-symbols-outlined text-[20px]">straighten</span>
                  </div>
                  <span className="text-slate-500 text-[10px] font-bold bg-slate-100 dark:bg-white/10 dark:text-slate-400 px-2.5 py-0.5 rounded-full">Avg</span>
                </div>
                <div className="mt-4">
                  <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold">Avg Transfer Size</p>
                  <h3 className="text-2xl font-extrabold mt-1 text-slate-900 dark:text-white">{formatSize(avgTransferSize)}</h3>
                </div>
              </div>

              <div className="bg-white dark:bg-[#222228] border border-slate-200 dark:border-[#38383f] rounded-[24px] p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow text-left">
                <div className="flex justify-between items-start">
                  <div className="p-2 bg-pink-50 text-pink-600 rounded-lg">
                    <span className="material-symbols-outlined text-[20px]">workspace_premium</span>
                  </div>
                  <span className="text-pink-600 text-[10px] font-bold bg-pink-50 dark:bg-pink-900/20 px-2.5 py-0.5 rounded-full">Paid</span>
                </div>
                <div className="mt-4">
                  <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold">Pro/Business/Ent Users</p>
                  <h3 className="text-2xl font-extrabold mt-1 text-slate-900 dark:text-white">{proUsers}</h3>
                </div>
              </div>

              <div className="bg-white dark:bg-[#222228] border border-slate-200 dark:border-[#38383f] rounded-[24px] p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow text-left">
                <div className="flex justify-between items-start">
                  <div className="p-2 bg-cyan-50 text-cyan-600 rounded-lg">
                    <span className="material-symbols-outlined text-[20px]">person_pin</span>
                  </div>
                  <span className="text-slate-500 text-[10px] font-bold bg-slate-100 dark:bg-white/10 dark:text-slate-400 px-2.5 py-0.5 rounded-full">Unique</span>
                </div>
                <div className="mt-4">
                  <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold">Unique Senders</p>
                  <h3 className="text-2xl font-extrabold mt-1 text-slate-900 dark:text-white">{uniqueSenders}</h3>
                </div>
              </div>

              <div className="bg-white dark:bg-[#222228] border border-slate-200 dark:border-[#38383f] rounded-[24px] p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow text-left">
                <div className="flex justify-between items-start">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                    <span className="material-symbols-outlined text-[20px]">task_alt</span>
                  </div>
                  <span className="text-emerald-600 text-[10px] font-bold bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-0.5 rounded-full">{successRate}%</span>
                </div>
                <div className="mt-4">
                  <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold">Active (not expired)</p>
                  <h3 className="text-2xl font-extrabold mt-1 text-slate-900 dark:text-white">{activeTransfers} / {transfers.length}</h3>
                </div>
              </div>

            </div>



            {/* Main Visualizations Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Geographic Analytics Map */}
              <div className="lg:col-span-2 bg-white border border-slate-200 rounded-[24px] overflow-hidden shadow-sm flex flex-col text-left">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Global Transfer Hotspots</h3>
                    <p className="text-[10px] text-slate-500">Live activity map of upload and download nodes.</p>
                  </div>
                  <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button className="px-3 py-1 bg-white shadow-sm rounded text-[10px] font-bold text-primary">Uploads</button>
                    <button className="px-3 py-1 text-[10px] font-medium text-slate-500">Downloads</button>
                  </div>
                </div>
                <div className="relative flex-grow min-h-[320px] bg-sky-50 flex items-center justify-center overflow-hidden">
                  {/* Map Visuals */}
                  <div 
                    className="absolute inset-0 bg-contain bg-center bg-no-repeat opacity-[0.09] mix-blend-multiply scale-90" 
                    style={{ 
                      backgroundImage: "url('https://cdn.jsdelivr.net/gh/flekschas/simple-world-map@master/world-map.svg')",
                      filter: "brightness(0)"
                    }}
                  ></div>
                  
                  {/* Map Pulsing Effects */}
                  <div className="relative w-full h-full min-h-[320px]">
                    <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-primary rounded-full animate-ping opacity-75"></div>
                    <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary rounded-full"></div>
                    
                    <div className="absolute top-1/2 right-1/3 w-5 h-5 bg-secondary rounded-full animate-ping opacity-60"></div>
                    <div className="absolute top-1/2 right-1/3. w-3 h-3 bg-secondary rounded-full"></div>
                    
                    <div className="absolute bottom-1/3 left-1/2 w-3 h-3 bg-primary rounded-full animate-ping opacity-75"></div>
                    <div className="absolute bottom-1/3 left-1/2 w-2 h-2 bg-primary rounded-full"></div>
                  </div>

                  {/* Legend Overlay */}
                  <div className="absolute bottom-4 left-4 flex flex-col gap-1.5 bg-white/95 border border-slate-200/60 p-4 rounded-xl text-[10px] shadow-sm max-w-xs backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-primary shrink-0"></span>
                      <span className="text-slate-700 font-semibold">North America: 42%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-secondary shrink-0"></span>
                      <span className="text-slate-700 font-semibold">Europe: 31%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-400 shrink-0"></span>
                      <span className="text-slate-700 font-semibold">Asia: 18%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Protocol & Load distribution side card */}
              <div className="flex flex-col gap-6 text-left">
                {/* Transfer Protocol Distribution */}
                <div className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 mb-4">Protocol Distribution</h3>
                    <div className="flex flex-col gap-3">
                      <div>
                        <div className="flex justify-between text-[10px] font-semibold text-slate-500 mb-1">
                          <span>HTTPS (Web Uploads)</span>
                          <span>68%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-primary h-full rounded-full" style={{ width: '68%' }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-[10px] font-semibold text-slate-500 mb-1">
                          <span>SFTP Client transfers</span>
                          <span>18%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-secondary h-full rounded-full" style={{ width: '18%' }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-[10px] font-semibold text-slate-500 mb-1">
                          <span>API & Webhooks</span>
                          <span>14%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-slate-400 h-full rounded-full" style={{ width: '14%' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Storage Load */}
                <div className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-sm">
                  <h3 className="text-xs font-bold text-slate-900 mb-4">Storage Providers Load</h3>
                  <div className="flex flex-col gap-3">
                    <div>
                      <div className="flex justify-between text-[10px] font-semibold text-slate-500 mb-1">
                        <span>Cloudflare R2 Bucket</span>
                        <span>85%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-primary h-full rounded-full" style={{ width: '85%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] font-semibold text-slate-500 mb-1">
                        <span>AWS S3 Backup</span>
                        <span>15%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-secondary h-full rounded-full" style={{ width: '15%' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Scanning Scan Performance Table */}
            <div className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-sm text-left">
              <h3 className="text-sm font-bold text-slate-900 mb-6">Security Scan Engine Performance</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-450 font-bold uppercase tracking-wider">
                      <th className="pb-3">Scan Engine</th>
                      <th className="pb-3">Files Processed</th>
                      <th className="pb-3">Threats Detected</th>
                      <th className="pb-3">Average Scan Time</th>
                      <th className="pb-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-100">
                      <td className="py-4 font-bold text-slate-800">ClamAV Endpoint Engine</td>
                      <td className="py-4 text-slate-500">1,204,592 files</td>
                      <td className="py-4 font-bold text-slate-800">0 files</td>
                      <td className="py-4 text-slate-500">42 ms</td>
                      <td className="py-4 text-right">
                        <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider">
                          Optimal
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 6. Transfers & Files Tab */}
        {activeTab === 'transfers' && (
          <div className="bg-white dark:bg-[#222228] border border-slate-200 dark:border-[#38383f] rounded-3xl p-6 shadow-sm flex flex-col gap-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-950 dark:text-white">Active Transfers & File Repository</h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">All platform transfers across all users</p>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Search by title or sender..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="px-3 py-2 border border-slate-200 dark:border-[#38383f] rounded-xl text-xs bg-white dark:bg-[#1a1a1f] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30 w-52"
                />
                <span className="text-xs bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-full font-bold whitespace-nowrap">
                  {transfers.length} Total
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              {transfers.length === 0 ? (
                <div className="text-center py-16">
                  <span className="material-symbols-outlined text-[52px] text-slate-300 dark:text-slate-600 mb-3 block">cloud_upload</span>
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400">No transfers yet</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Transfers will appear here once users start sharing files.</p>
                </div>
              ) : (
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-[#38383f] text-slate-400 dark:text-slate-500 font-bold">
                      <th className="pb-3 text-left">Transfer Details</th>
                      <th className="pb-3 text-left">Sender</th>
                      <th className="pb-3 text-left">Files</th>
                      <th className="pb-3 text-left">Downloads</th>
                      <th className="pb-3 text-left">Expires</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transfers
                      .filter(t =>
                        !searchQuery ||
                        t.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        t.senderEmail?.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((trans) => (
                      <tr key={trans.id} className="border-b border-slate-100 dark:border-[#38383f] hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                        <td className="py-4">
                          <div>
                            <p className="font-bold text-slate-800 dark:text-slate-200 text-xs">{trans.title || 'Untitled Transfer'}</p>
                            <span className="font-mono text-[9px] text-slate-400">{trans.id}</span>
                          </div>
                        </td>
                        <td className="py-4 font-medium text-slate-600 dark:text-slate-400">{trans.senderEmail || 'Anonymous'}</td>
                        <td className="py-4">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{trans.files.length} Files</span>
                          <p className="text-[10px] text-slate-400">{formatSize(trans.storageUsed)}</p>
                        </td>
                        <td className="py-4 font-bold text-slate-800 dark:text-slate-200">{trans.downloads}</td>
                        <td className="py-4 text-slate-500 dark:text-slate-400">
                          {new Date(trans.expiresAt).toLocaleDateString()}
                        </td>
                        <td className="py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => alert(`📅 Expiration extended 7 days for: ${trans.title || trans.id}`)}
                              className="text-[10px] font-bold text-primary hover:underline bg-primary/5 hover:bg-primary/10 px-2 py-1 rounded cursor-pointer transition-colors"
                            >
                              Extend
                            </button>
                            <button
                              onClick={() => alert(`🗑️ Transfer "${trans.title || trans.id}" deleted.`)}
                              className="text-[10px] font-bold text-red-500 hover:underline bg-red-50 dark:bg-red-900/10 hover:bg-red-100 px-2 py-1 rounded cursor-pointer transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* 7. Support Tickets Tab */}
        {activeTab === 'support' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col gap-6">
            <h3 className="text-base font-bold text-slate-950">Customer Support Tickets Center</h3>
            <div className="flex flex-col gap-4">
              {[
                { id: 'T-9842', user: 'sarah.chen@creator.com', subject: 'Custom domain mapping issue', priority: 'High', date: '2026-06-26T12:00:00Z', status: 'Open' },
                { id: 'T-9810', user: 'johndoe@gmail.com', subject: 'Invoice refund request', priority: 'Medium', date: '2026-06-25T15:30:00Z', status: 'Open' }
              ].map((ticket) => (
                <div key={ticket.id} className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50 flex flex-col md:flex-row justify-between gap-4 text-left">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 text-xs">{ticket.id}</span>
                      <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${ticket.priority === 'High' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                        {ticket.priority} Priority
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-700 mt-2">{ticket.subject}</p>
                    <p className="text-[10px] text-slate-400 mt-1">From: {ticket.user} • Raised on: {new Date(ticket.date).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => alert(`Reply email interface opened for ${ticket.user}`)}
                      className="bg-primary hover:bg-primary-container text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-sm transition-all cursor-pointer"
                    >
                      Reply
                    </button>
                    <button 
                      onClick={() => alert(`Ticket ${ticket.id} closed.`)}
                      className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-sm transition-all cursor-pointer"
                    >
                      Close Ticket
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 8. System Settings Tab */}
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col gap-6 text-left">
              <h3 className="text-base font-bold text-slate-950 border-b border-slate-100 pb-3">Global Platform Configurations</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wide text-slate-500 block mb-1">Site Brand Name</label>
                  <input type="text" defaultValue="ZotoTransfer" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wide text-slate-500 block mb-1">Support Email</label>
                  <input type="text" defaultValue="support@zototransfer.com" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wide text-slate-500 block mb-1">Max Free File Upload Size</label>
                  <input type="text" defaultValue="2 GB" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wide text-slate-500 block mb-1">Default Link Expiration</label>
                  <input type="text" defaultValue="7 Days" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs" />
                </div>
              </div>

              <div className="flex justify-end pt-3">
                <button 
                  onClick={() => alert('⚙️ Global platform configurations updated successfully.')}
                  className="bg-primary hover:bg-primary-container text-white py-2.5 px-6 rounded-xl text-xs font-bold shadow-sm transition-all"
                >
                  Save Platform Settings
                </button>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col gap-4 text-left">
              <h3 className="text-sm font-bold text-slate-900 mb-2">Cloud Infrastructure</h3>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wide text-slate-500 block mb-1">Cloudflare R2 Bucket</label>
                <input type="text" defaultValue="r2.zototransfer-main-bucket" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono" />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wide text-slate-500 block mb-1">AWS Redundant Backup S3</label>
                <input type="text" defaultValue="s3.eu-west-1.zototransfer-backup" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono" />
              </div>
              <p className="text-[10px] text-slate-400 leading-normal">
                AWS backup triggers geo-redundancy tasks asynchronously on every verified upload transaction event.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
