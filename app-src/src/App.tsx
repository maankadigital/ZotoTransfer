import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { useDarkMode } from './hooks/useDarkMode';

// Import Pages
import { Home } from './pages/Home';
import { SendFiles } from './pages/SendFiles';
import { SignIn } from './pages/SignIn';
import { PricingPlans } from './pages/PricingPlans';
import { Dashboard } from './pages/Dashboard';
import { DownloadFiles } from './pages/DownloadFiles';
import { FileRequest } from './pages/FileRequest';
import { ClientPortal } from './pages/ClientPortal';
import { AdminSuite } from './pages/AdminSuite';

// ─── App Content ────────────────────────────────────────────────────────────
const AppContent: React.FC = () => {
  const { currentView, setView, currentUser } = useApp();
  // Initialize dark mode at the top of the component tree
  useDarkMode();

  const currentViewRef = React.useRef(currentView);
  
  useEffect(() => {
    currentViewRef.current = currentView;
  }, [currentView]);

  // Route guarding for dashboard and admin views
  useEffect(() => {
    if (!currentUser) {
      if (currentView === 'dashboard' || currentView === 'admin') {
        setView('signin');
      }
    } else {
      const isAdmin = currentUser.role === 'super_admin' || currentUser.role === 'admin';
      if (currentView === 'admin' && !isAdmin) {
        setView('dashboard');
      }
    }
  }, [currentUser, currentView, setView]);

  // Listen to hash change to handle shared link routing
  useEffect(() => {
    const handleHashRouting = () => {
      const hash = window.location.hash;
      
      // Pattern: #/t/shortlink
      if (hash.startsWith('#/t/')) {
        const shortLink = hash.substring(4);
        if (currentViewRef.current !== 'download') {
          setView('download', { shortLink });
        }
      } else if (hash.startsWith('#/portal')) {
        if (currentViewRef.current !== 'portal') setView('portal');
      } else if (hash.startsWith('#/request')) {
        const queryIndex = hash.indexOf('?');
        const params: any = {};
        if (queryIndex !== -1) {
          const queryString = hash.substring(queryIndex + 1);
          const searchParams = new URLSearchParams(queryString);
          searchParams.forEach((val, key) => {
            params[key] = val;
          });
        }
        if (currentViewRef.current !== 'request') setView('request', params);
      } else if (hash.startsWith('#/plans')) {
        if (currentViewRef.current !== 'plans') setView('plans');
      } else if (hash.startsWith('#/send')) {
        if (currentViewRef.current !== 'send') setView('send');
      } else if (hash.startsWith('#/signin')) {
        const params: any = {};
        const queryIndex = hash.indexOf('?');
        if (queryIndex !== -1) {
          const queryString = hash.substring(queryIndex + 1);
          const searchParams = new URLSearchParams(queryString);
          searchParams.forEach((val, key) => {
            params[key] = val;
          });
        }
        const locSearch = new URLSearchParams(window.location.search);
        locSearch.forEach((val, key) => {
          params[key] = val;
        });
        setView('signin', params);
      } else if (hash.startsWith('#/dashboard')) {
        if (currentViewRef.current !== 'dashboard') setView('dashboard');
      } else if (hash.startsWith('#/admin')) {
        if (currentViewRef.current !== 'admin') setView('admin');
      } else if (hash === '' || hash === '#') {
        if (currentViewRef.current !== 'home') setView('home');
      }
    };

    window.addEventListener('hashchange', handleHashRouting);
    handleHashRouting(); // Run on initial load

    return () => {
      window.removeEventListener('hashchange', handleHashRouting);
    };
  }, [setView]);

  // Update hash when view changes to allow bookmarking / reloading
  useEffect(() => {
    const expectedHash = currentView === 'home' ? '' : `/${currentView}`;
    const cleanHash = window.location.hash.startsWith('#') ? window.location.hash.substring(1) : window.location.hash;
    
    if (currentView === 'download') {
      // Don't override hash if it's already set (starts with /t/)
      return;
    }
    
    if (cleanHash !== expectedHash) {
      window.location.hash = expectedHash;
    }
  }, [currentView]);

  // Render correct page
  switch (currentView) {
    case 'home':
      return <Home />;
    case 'send':
      return <SendFiles />;
    case 'signin':
      return <SignIn />;
    case 'plans':
      return <PricingPlans />;
    case 'dashboard':
      return <Dashboard />;
    case 'download':
      return <DownloadFiles />;
    case 'request':
      return <FileRequest />;
    case 'portal':
      return <ClientPortal />;
    case 'admin':
      return <AdminSuite />;
    default:
      return <Home />;
  }
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
