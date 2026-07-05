import React from 'react';
import { useApp } from '../context/AppContext';
import { Logo } from './Logo';
import { useDarkMode } from '../hooks/useDarkMode';

export const Header: React.FC = () => {
  const { currentView, setView, currentUser } = useApp();
  const { dark, toggle } = useDarkMode();

  const handleNavClick = (sectionId: string) => {
    if (currentView !== 'home') {
      setView('home');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navBtnClass =
    'flex items-center font-bold text-xs px-5 py-2 rounded-full cursor-pointer transition-all duration-200 ' +
    'text-slate-700 ' +
    'hover:text-primary ' +
    'hover:bg-white ' +
    'active:scale-95';

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/60 shadow-[0_2px_15px_rgba(0,0,0,0.03)] sticky top-0 z-50">
      <div className="flex justify-between items-center w-full px-lg py-sm max-w-container-max mx-auto">

        {/* Brand */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('home')}>
          <Logo className="h-9 shrink-0" variant="full" isWhite={false} />
        </div>

        {/* Nav links (home & send views) */}
        {(currentView === 'home' || currentView === 'send') && (
          <nav className="hidden md:flex items-center gap-0.5 bg-slate-100/70 p-1 rounded-full border border-slate-200/60">
            <button onClick={() => handleNavClick('transfer-widget')} className={navBtnClass}>Transfer</button>
            <button onClick={() => handleNavClick('activity-heatmap')} className={navBtnClass}>Activity</button>
            <button onClick={() => handleNavClick('pricing')} className={navBtnClass}>Pricing</button>
            <button onClick={() => handleNavClick('contacts-info')} className={navBtnClass}>Contacts</button>
          </nav>
        )}

        {/* Right actions */}
        <div className="flex items-center gap-3">

          {currentUser ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setView((currentUser.role === 'super_admin' || currentUser.role === 'admin') ? 'admin' : 'dashboard')}
                className="bg-primary hover:opacity-90 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-all shadow-sm"
              >
                Dashboard
              </button>
              <img
                alt="User profile"
                className="w-10 h-10 rounded-full object-cover border border-slate-200 cursor-pointer shrink-0"
                onClick={() => setView((currentUser.role === 'super_admin' || currentUser.role === 'admin') ? 'admin' : 'dashboard')}
                src={currentUser.avatarUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuClFQcLZSdDvj2ZHUVRoEIbngUXgdf4-bPBy-pEqDlkvJpPsaAu4wm2gXO8Sq6T27kG124cp8_7ZTUEu6j82_9ZbT-l2anVeOk5wI-ZbNvjz8LsG1N5S17XYHEnR-wdFHkcuEPmLeLroDxS_JT0VzEDC1ajNWpKNZ8RPZzATp89kNtn8Wrs1btXRzJWmLP07WPhx6M6YPEA2ZwHYZerIt24gIM-0heIKH1u8KqPHxhz8bALGUgJ-7JfvR7SLWYniZAWF5q8r-j2Vrc'}
              />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setView('signin', { mode: 'login' })}
                className="text-slate-700 hover:text-primary font-semibold text-xs py-2 px-3 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => setView('signin', { mode: 'register' })}
                className="bg-primary hover:opacity-90 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-all shadow-sm"
              >
                Send Files
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
