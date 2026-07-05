import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAdmin?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isAdmin = false }) => {
  const { currentUser, logout, setView } = useApp();
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  const handleHelpClick = () => {
    alert("ℹ️ Support portal can be reached at support@zototransfer.com");
  };

  const getTabClass = (tabName: string) => {
    const isActive = activeTab === tabName;
    return `flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-3.5 px-3.5'} py-2.5 rounded-2xl transition-all duration-200 w-full active:scale-95 group relative text-left text-xs border ${
      isActive
        ? 'bg-primary text-white font-bold border-primary/20 shadow-[0_4px_14px_rgba(26,127,212,0.35)]'
        : 'font-semibold text-slate-600 dark:text-slate-300 hover:bg-primary/8 dark:hover:bg-primary/10 hover:text-primary dark:hover:text-primary border-transparent'
    }`;
  };

  return (
    <nav
      className={`bg-white/60 dark:bg-[#222228]/80 backdrop-blur-md flex flex-col p-6 gap-6 shrink-0 z-20 border border-white/40 dark:border-white/[0.06] shadow-xl dark:shadow-black/40 transition-all duration-300 select-none text-left h-[calc(100vh-2rem)] my-4 ml-4 rounded-[28px] relative ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Collapse / Expand Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute top-6 -right-3 w-6 h-6 rounded-full bg-white/80 backdrop-blur-sm border border-slate-200 text-slate-400 hover:text-slate-655 flex items-center justify-center transition-all shadow-sm z-50 cursor-pointer hover:scale-105"
      >
        <span className="material-symbols-outlined text-[14px] font-bold">
          {isCollapsed ? 'chevron_right' : 'chevron_left'}
        </span>
      </button>

      {/* Menu Header Space */}
      <div className="h-6" />

      {/* Navigation Items Group */}
      <div className="flex flex-col gap-6 flex-grow overflow-y-auto pr-1">
        
        {/* MENU Section */}
        <div className="flex flex-col gap-1">
          {!isCollapsed && (
            <span className="text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase px-3.5 mb-2 block">
              {isAdmin ? 'Admin Console' : 'Menu'}
            </span>
          )}

          {isAdmin ? (
            <>
              {/* Analytics Tab — FIRST */}
              <button
                onClick={() => setActiveTab('analytics')}
                className={getTabClass('analytics')}
              >
                <span className="material-symbols-outlined text-[18px]">analytics</span>
                {!isCollapsed && <span>Analytics</span>}
                {isCollapsed && (
                  <span className="scale-0 group-hover:scale-100 absolute left-20 bg-slate-850 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-md border border-slate-800 opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none z-50">
                    Analytics
                  </span>
                )}
              </button>

              {/* Admin Overview Tab */}
              <button
                onClick={() => setActiveTab('overview')}
                className={getTabClass('overview')}
              >
                <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
                {!isCollapsed && <span>Admin Center</span>}
                {isCollapsed && (
                  <span className="scale-0 group-hover:scale-100 absolute left-20 bg-slate-850 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-md border border-slate-800 opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none z-50">
                    Admin Center
                  </span>
                )}
              </button>

              {/* Users Tab */}
              <button
                onClick={() => setActiveTab('users')}
                className={getTabClass('users')}
              >
                <span className="material-symbols-outlined text-[18px]">group</span>
                {!isCollapsed && <span>User Management</span>}
                {isCollapsed && (
                  <span className="scale-0 group-hover:scale-100 absolute left-20 bg-slate-850 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-md border border-slate-800 opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none z-50">
                    User Management
                  </span>
                )}
              </button>

              {/* Transfers Tab */}
              <button
                onClick={() => setActiveTab('transfers')}
                className={getTabClass('transfers')}
              >
                <span className="material-symbols-outlined text-[18px]">swap_horiz</span>
                {!isCollapsed && <span>Transfers</span>}
                {isCollapsed && (
                  <span className="scale-0 group-hover:scale-100 absolute left-20 bg-slate-850 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-md border border-slate-800 opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none z-50">
                    Transfers
                  </span>
                )}
              </button>

              {/* Moderation Tab */}
              <button
                onClick={() => setActiveTab('moderation')}
                className={getTabClass('moderation')}
              >
                <span className="material-symbols-outlined text-[18px]">security</span>
                {!isCollapsed && <span>Moderation</span>}
                {isCollapsed && (
                  <span className="scale-0 group-hover:scale-100 absolute left-20 bg-slate-850 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-md border border-slate-800 opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none z-50">
                    Moderation
                  </span>
                )}
              </button>

              {/* Audit Logs Tab */}
              <button
                onClick={() => setActiveTab('audit')}
                className={getTabClass('audit')}
              >
                <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                {!isCollapsed && <span>Audit Logs</span>}
                {isCollapsed && (
                  <span className="scale-0 group-hover:scale-100 absolute left-20 bg-slate-850 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-md border border-slate-800 opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none z-50">
                    Audit Logs
                  </span>
                )}
              </button>

              {/* Support Tab */}
              <button
                onClick={() => setActiveTab('support')}
                className={getTabClass('support')}
              >
                <span className="material-symbols-outlined text-[18px]">support_agent</span>
                {!isCollapsed && <span>System Support</span>}
                {isCollapsed && (
                  <span className="scale-0 group-hover:scale-100 absolute left-20 bg-slate-850 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-md border border-slate-800 opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none z-50">
                    System Support
                  </span>
                )}
              </button>

            </>
          ) : (
            <>
              {/* Overview Tab */}
              <button
                onClick={() => setActiveTab('overview')}
                className={getTabClass('overview')}
              >
                <span className="material-symbols-outlined text-[18px]">grid_view</span>
                {!isCollapsed && <span>Overview</span>}
                {isCollapsed && (
                  <span className="scale-0 group-hover:scale-100 absolute left-20 bg-slate-850 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-md border border-slate-800 opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none z-50">
                    Overview
                  </span>
                )}
              </button>

              {/* Deliveries Tab */}
              <button
                onClick={() => setActiveTab('deliveries')}
                className={getTabClass('deliveries')}
              >
                <span className="material-symbols-outlined text-[18px]">send</span>
                {!isCollapsed && <span>Deliveries</span>}
                {isCollapsed && (
                  <span className="scale-0 group-hover:scale-100 absolute left-20 bg-slate-850 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-md border border-slate-800 opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none z-50">
                    Deliveries
                  </span>
                )}
              </button>

              {/* Shared Folders Tab */}
              <button
                onClick={() => setActiveTab('shared_folders')}
                className={getTabClass('shared_folders')}
              >
                <span className="material-symbols-outlined text-[18px]">folder_shared</span>
                {!isCollapsed && <span>Shared Folders</span>}
                {isCollapsed && (
                  <span className="scale-0 group-hover:scale-100 absolute left-20 bg-slate-850 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-md border border-slate-800 opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none z-50">
                    Shared Folders
                  </span>
                )}
              </button>

              {/* File Requests Tab */}
              <button
                onClick={() => setActiveTab('file_requests')}
                className={getTabClass('file_requests')}
              >
                <span className="material-symbols-outlined text-[18px]">move_to_inbox</span>
                {!isCollapsed && <span>File Requests</span>}
                {isCollapsed && (
                  <span className="scale-0 group-hover:scale-100 absolute left-20 bg-slate-850 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-md border border-slate-800 opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none z-50">
                    File Requests
                  </span>
                )}
              </button>

              {/* Transfer Intelligence™ Tab */}
              <button
                onClick={() => setActiveTab('intelligence')}
                className={getTabClass('intelligence')}
              >
                <span className="material-symbols-outlined text-[18px]">insights</span>
                {!isCollapsed && <span>Transfer Intelligence™</span>}
                {isCollapsed && (
                  <span className="scale-0 group-hover:scale-100 absolute left-20 bg-slate-850 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-md border border-slate-800 opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none z-50">
                    Transfer Intelligence™
                  </span>
                )}
              </button>

              {/* Insights Center Center™ Tab */}
              <button
                onClick={() => setActiveTab('insights_center')}
                className={getTabClass('insights_center')}
              >
                <span className="material-symbols-outlined text-[18px]">pie_chart</span>
                {!isCollapsed && <span>Insights Center Center™</span>}
                {isCollapsed && (
                  <span className="scale-0 group-hover:scale-100 absolute left-20 bg-slate-850 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-md border border-slate-800 opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none z-50">
                    Insights Center Center™
                  </span>
                )}
              </button>

              {/* Vault™ Tab */}
              <button
                onClick={() => setActiveTab('vault')}
                className={getTabClass('vault')}
              >
                <span className="material-symbols-outlined text-[18px]">lock</span>
                {!isCollapsed && <span>Vault™</span>}
                {isCollapsed && (
                  <span className="scale-0 group-hover:scale-100 absolute left-20 bg-slate-850 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-md border border-slate-800 opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none z-50">
                    Vault™
                  </span>
                )}
              </button>
            </>
          )}
        </div>

        {/* ACCOUNT Section */}
        <div className="flex flex-col gap-1">
          {!isCollapsed && (
            <span className="text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase px-3.5 mb-2 block">
              Account
            </span>
          )}

          {/* Settings */}
          <button
            onClick={() => setActiveTab('settings')}
            className={getTabClass('settings')}
          >
            <span className="material-symbols-outlined text-[18px]">settings</span>
            {!isCollapsed && <span>{isAdmin ? 'System Settings' : 'Settings'}</span>}
            {isCollapsed && (
              <span className="scale-0 group-hover:scale-100 absolute left-20 bg-slate-850 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-md border border-slate-800 opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none z-50">
                {isAdmin ? 'System Settings' : 'Settings'}
              </span>
            )}
          </button>

          {/* Help & Support */}
          <button
            onClick={handleHelpClick}
            className={`flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-3.5 px-3.5'} py-2.5 rounded-2xl text-slate-600 dark:text-slate-300 hover:bg-primary/8 dark:hover:bg-primary/10 hover:text-primary transition-all w-full active:scale-95 group relative text-left font-semibold text-xs border border-transparent`}
          >
            <span className="material-symbols-outlined text-[18px]">info</span>
            {!isCollapsed && <span>Help & Support</span>}
            {isCollapsed && (
              <span className="scale-0 group-hover:scale-100 absolute left-20 bg-slate-850 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-md border border-slate-800 opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none z-50">
                Help & Support
              </span>
            )}
          </button>
 
          {/* Log out */}
          <button
            onClick={logout}
            className={`flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-3.5 px-3.5'} py-2.5 rounded-2xl text-slate-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-all w-full active:scale-95 group relative text-left font-semibold text-xs border border-transparent`}
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            {!isCollapsed && <span>Log out</span>}
            {isCollapsed && (
              <span className="scale-0 group-hover:scale-100 absolute left-20 bg-red-50 text-red-650 text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-md border border-red-100 opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none z-50">
                Log out
              </span>
            )}
          </button>
        </div>

      </div>

      {/* Plan Billing Card Footer / Switch to User Portal */}
      {isAdmin ? (
        isCollapsed ? (
          <div className="flex justify-center items-center">
            <button
              onClick={() => setView('dashboard')}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-650 flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer"
              title="Switch to User Portal"
            >
              <span className="material-symbols-outlined text-[18px]">dashboard</span>
            </button>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-slate-800 via-slate-850 to-slate-900 rounded-[20px] p-4 flex flex-col gap-3 text-white shadow-md relative overflow-hidden">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0">
                <span className="material-symbols-outlined text-[16px]">dashboard</span>
              </div>
              <div className="text-left">
                <p className="text-[8px] opacity-75 font-bold uppercase tracking-wider leading-none">System Admin :</p>
                <p className="text-xs font-extrabold mt-0.5 capitalize">Admin Console</p>
              </div>
            </div>
            <p className="text-[9px] opacity-90 leading-relaxed text-left">
              Manage system metrics, security, users, and audit logs.
            </p>
            <button
              onClick={() => setView('dashboard')}
              className="bg-white text-slate-800 hover:bg-slate-50 transition-all font-bold text-[10px] py-2.5 rounded-full text-center shadow-sm cursor-pointer scale-98 active:scale-95"
            >
              Switch to User Portal
            </button>
          </div>
        )
      ) : (
        isCollapsed ? (
          <div className="flex justify-center items-center">
            <button
              onClick={() => setActiveTab('settings')}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-indigo-650 flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">flash_on</span>
            </button>
          </div>
        ) : (
          (() => {
            const plan = (currentUser?.plan || 'free').toLowerCase();
            const upgradeText = plan === 'enterprise' ? 'Enterprise Active' : plan === 'pro' ? 'Upgrade to Enterprise' : 'Upgrade to Pro';
            const upgradeDesc = plan === 'enterprise' ? 'You are on our highest tier plan. Enjoy full access!' : plan === 'pro' ? 'Unlock premium intelligence features. Upgrade to Enterprise Workspace.' : 'Collaborate on your transfers. Upgrade to Pro Workspace.';

            return (
              <div className="bg-gradient-to-br from-primary via-primary/95 to-indigo-650 rounded-[20px] p-4 flex flex-col gap-3 text-white shadow-md relative overflow-hidden">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0">
                    <span className="material-symbols-outlined text-[16px]">flash_on</span>
                  </div>
                  <div className="text-left">
                    <p className="text-[8px] opacity-75 font-bold uppercase tracking-wider leading-none">Current plan :</p>
                    <p className="text-xs font-extrabold mt-0.5 capitalize">{currentUser?.plan || 'Free Workspace'}</p>
                  </div>
                </div>
                <p className="text-[9px] opacity-90 leading-relaxed text-left">
                  {upgradeDesc}
                </p>
                <button
                  onClick={() => setActiveTab('settings')}
                  disabled={plan === 'enterprise'}
                  className="bg-white text-primary hover:bg-slate-50 disabled:opacity-75 disabled:cursor-not-allowed transition-all font-bold text-[10px] py-2.5 rounded-full text-center shadow-sm cursor-pointer scale-98 active:scale-95"
                >
                  {upgradeText}
                </button>
              </div>
            );
          })()
        )
      )}
    </nav>
  );
};
