import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Logo } from '../components/Logo';
import { supabase } from '../utils/supabaseClient';

export const SignIn: React.FC = () => {
  const { login, register, viewParams, setView } = useApp();
  const [isRegister, setIsRegister] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [emailError, setEmailError] = useState<boolean>(false);
  const [errorType, setErrorType] = useState<'not_found' | 'exists' | 'suspended' | 'error' | 'wrong_password' | null>(null);

  useEffect(() => {
    if (viewParams) {
      if (viewParams.mode === 'register') {
        setIsRegister(true);
      } else {
        setIsRegister(false);
      }
      if (viewParams.email) {
        setEmail(viewParams.email);
      }
    }
  }, [viewParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setEmailError(false);
    setErrorType(null);
    setIsLoading(true);

    try {
      if (isRegister) {
        const result = await register(email, fullName || email.split('@')[0], password);
        setIsLoading(false);
        if (result !== 'success') {
          setEmailError(true);
          setErrorType(result);
        }
      } else {
        const result = await login(email, password);
        setIsLoading(false);
        if (result !== 'success') {
          setEmailError(true);
          setErrorType(result);
        }
      }
    } catch (err) {
      console.error(err);
      setIsLoading(false);
      setEmailError(true);
      setErrorType('error');
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch public Supabase Auth settings to verify if Google Provider is active
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
      if (supabaseUrl) {
        try {
          const settingsRes = await fetch(`${supabaseUrl}/auth/v1/settings`);
          if (settingsRes.ok) {
            const settings = await settingsRes.json();
            // GoTrue settings API exposes external provider status
            if (settings?.external && settings.external.google === false) {
              setIsLoading(false);
              alert('❌ Google Login is not enabled in your Supabase dashboard yet.\n\nTo use real Google login, please log into supabase.com, enable Google under Auth > Providers, and input your Google Console credentials.');
              return;
            }
          }
        } catch (settingsErr) {
          console.warn('Could not verify Supabase provider settings:', settingsErr);
        }
      }

      // 2. Generate authorization redirect URL
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          skipBrowserRedirect: true
        }
      });
      
      if (error) {
        throw error;
      }
      
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('OAuth redirect URL not generated.');
      }
    } catch (err: any) {
      console.error('Google login redirect error:', err);
      setIsLoading(false);
      alert('❌ Google Login failed to initialize: ' + (err.message || err));
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-sm antialiased font-body-md text-on-surface bg-[#F4F6F9] dark:bg-[#1a1a1f] relative">
      {/* Return to Homepage shortcut */}
      <button
        onClick={() => setView('home')}
        className="absolute top-md left-md flex items-center gap-xs text-label-sm font-label-sm text-on-surface-variant hover:text-primary transition-all bg-surface-container-lowest px-sm py-2 rounded-xl shadow-sm border border-outline-variant/30 hover:shadow-md"
      >
        <span className="material-symbols-outlined text-[16px]">arrow_back</span>
        Return Home
      </button>

      <main className="w-full max-w-[420px] bg-white dark:bg-[#222228] rounded-[24px] shadow-xl dark:shadow-black/50 border border-slate-200 dark:border-white/[0.07] overflow-hidden relative z-10">
        {/* Header */}
        <div className="px-lg pt-lg pb-sm text-center">
          <div
            onClick={() => setView('home')}
            className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-sm cursor-pointer hover:scale-105 transition-transform"
          >
            <Logo className="w-12 h-12" />
          </div>
          <h1 className="font-headline-md text-headline-md text-on-surface mb-base">ZotoTransfer</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            {isRegister ? 'Create your account to start sharing' : 'Sign in to continue to your workspace'}
          </p>
        </div>

        {/* Form Body */}
        <div className="px-lg pb-lg">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-xl gap-md">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-label-sm font-label-sm text-on-surface-variant">
                Authenticating securely...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-sm">
              {isRegister && (
                <div>
                  <label
                    className="block font-label-md text-label-md text-on-surface mb-xs text-left"
                    htmlFor="fullname"
                  >
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-sm flex items-center pointer-events-none">
                      <span className="material-symbols-outlined text-outline-variant text-[20px]">
                        person
                      </span>
                    </div>
                    <input
                      className="block w-full pl-[44px] pr-sm py-sm border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md placeholder:text-outline focus:ring-0 focus:border-primary transition-all duration-200"
                      id="fullname"
                      name="fullname"
                      placeholder="Sarah Chen"
                      required
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div>
                <label
                  className="block font-label-md text-label-md text-on-surface mb-xs text-left"
                  htmlFor="email"
                >
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-sm flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-outline-variant text-[20px]">
                      mail
                    </span>
                  </div>
                  <input
                    className={`block w-full pl-[44px] pr-sm py-sm border rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md placeholder:text-outline transition-all duration-200 ${
                      emailError 
                        ? 'border-red-500 focus:border-red-600 focus:ring-1 focus:ring-red-500/20' 
                        : 'border-outline-variant focus:ring-0 focus:border-primary'
                    }`}
                    id="email"
                    name="email"
                    placeholder="you@gmail.com or email..."
                    required
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailError(false); // Reset error status on change
                    }}
                  />
                </div>
                {emailError && (
                  <p className="text-[11px] text-red-500 mt-1.5 text-left font-medium">
                    {errorType === 'exists' && 'This email is already registered.'}
                    {errorType === 'not_found' && 'This email was not found. Please register first.'}
                    {errorType === 'suspended' && 'This account has been suspended for violating terms.'}
                    {errorType === 'error' && 'Database connection error. Check browser console or pause ad-blockers.'}
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-xs">
                  <label
                    className="block font-label-md text-label-md text-on-surface text-left"
                    htmlFor="password"
                  >
                    Password
                  </label>
                  {!isRegister && (
                    <button
                      type="button"
                      onClick={() => alert('🔒 Mock password reset link sent to your email!')}
                      className="font-label-md text-label-md text-primary hover:text-primary-container transition-colors"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-sm flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-outline-variant text-[20px]">
                      lock
                    </span>
                  </div>
                  <input
                    className={`block w-full pl-[44px] pr-sm py-sm border rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md placeholder:text-outline transition-all duration-200 ${
                      errorType === 'wrong_password'
                        ? 'border-red-500 focus:border-red-600 focus:ring-1 focus:ring-red-500/20'
                        : 'border-outline-variant focus:ring-0 focus:border-primary'
                    }`}
                    id="password"
                    name="password"
                    placeholder="••••••••"
                    required
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errorType === 'wrong_password') {
                        setEmailError(false);
                        setErrorType(null);
                      }
                    }}
                  />
                </div>
                {errorType === 'wrong_password' && (
                  <p className="text-[11px] text-red-500 mt-1.5 text-left font-medium">
                    Incorrect password. Please try again.
                  </p>
                )}
              </div>

              <div className="pt-base">
                <button
                  className="w-full flex justify-center items-center py-sm px-md border border-transparent rounded-[12px] shadow-sm font-label-md text-label-md text-on-primary bg-primary hover:bg-primary-container focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200 transform hover:-translate-y-[1px]"
                  type="submit"
                >
                  {isRegister ? 'Register' : 'Sign In'}
                </button>
              </div>

              {/* Text Divider */}
              <div className="relative my-4 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <span className="relative px-3 bg-white text-[10px] text-slate-400 font-bold uppercase tracking-wider">Or continue with</span>
              </div>

              {/* Google Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full flex justify-center items-center gap-2.5 py-3 px-4 border border-slate-200 rounded-[14px] bg-white hover:bg-slate-50 text-slate-700 font-extrabold text-xs shadow-sm hover:shadow-md transition-all active:scale-[0.98] cursor-pointer"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              {/* Sandbox Google Bypass Escapement Link */}
              <div className="text-center mt-3.5">
                <button
                  type="button"
                  onClick={async () => {
                    setIsLoading(true);
                    await new Promise(resolve => setTimeout(resolve, 800));
                    try {
                      const demoEmail = 'google.pilot@zototransfer.com';
                      const demoName = 'Google Pilot Member';
                      let result = await login(demoEmail, 'google_mock_1234');
                      if (result === 'not_found') {
                        await register(demoEmail, demoName, 'google_mock_1234');
                        result = await login(demoEmail, 'google_mock_1234');
                      }
                      if (result === 'success') {
                        setIsLoading(false);
                      } else {
                        throw new Error('Sandbox login failed');
                      }
                    } catch (e) {
                      setIsLoading(false);
                      alert('Bypass login failed.');
                    }
                  }}
                  className="text-[10px] text-slate-400 hover:text-primary transition-colors underline cursor-pointer"
                >
                  Bypass redirect & log in with Sandbox Google Account
                </button>
              </div>
            </form>
          )}

          {!isLoading && (
            <div className="mt-md">
              <p className="mt-lg text-center font-body-sm text-body-sm text-on-surface-variant">
                {isRegister ? 'Already have an account? ' : "Don't have an account? "}
                <button
                  onClick={() => setIsRegister(!isRegister)}
                  className="font-label-md text-label-md text-primary hover:text-primary-container transition-colors inline-block focus:outline-none cursor-pointer"
                >
                  {isRegister ? 'Sign In' : 'Create an account'}
                </button>
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
