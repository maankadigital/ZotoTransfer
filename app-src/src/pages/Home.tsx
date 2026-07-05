import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Header } from '../components/Header';
import { Logo } from '../components/Logo';
import { getAppUrl } from '../utils/url';

export const Home: React.FC = () => {
  const { setView, createTransfer, currentUser, updateUserPlan } = useApp();
  const [files, setFiles] = useState<File[]>([]);
  const [emailTo, setEmailTo] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [transferLink, setTransferLink] = useState<string | null>(null);
  const [isYearly, setIsYearly] = useState<boolean>(false);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [customPassword, setCustomPassword] = useState<string>('');
  const [customDays, setCustomDays] = useState<number>(7);
  const [customTitle, setCustomTitle] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSelectPlan = (plan: 'free' | 'pro' | 'business' | 'enterprise') => {
    if (plan === 'free') {
      setView('home');
      return;
    }

    if (!currentUser) {
      alert('Please Sign In first to subscribe to a plan.');
      setView('signin', { mode: 'login' });
      return;
    }

    if (plan === 'enterprise') {
      alert('📧 Thank you! Our Enterprise Sales team will reach out to you shortly.');
      return;
    }

    updateUserPlan(plan);
    alert(`🎉 Congratulations! You have successfully upgraded to the ${plan.toUpperCase()} plan!`);
    setView('dashboard');
  };

  const getPrice = (baseMonthly: number) => {
    if (isYearly) {
      return baseMonthly * 0.8; // 20% discount
    }
    return baseMonthly;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) {
      alert('Please add files to transfer.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          completeTransfer();
          return 100;
        }
        return p + 10;
      });
    }, 120);
  };

  const completeTransfer = () => {
    const transferFiles = files.map((f, i) => ({
      id: `f_home_${Date.now()}_${i}`,
      name: f.name,
      size: f.size,
      mimeType: f.type,
      uploadedAt: new Date().toISOString(),
      downloadsCount: 0,
    }));

    const totalSize = files.reduce((acc, f) => acc + f.size, 0);

    const res = createTransfer({
      title: customTitle || files[0]?.name || 'Home Shared Files',
      senderEmail: currentUser?.email || 'anonymous@zototransfer.com',
      recipientEmails: emailTo ? [emailTo] : undefined,
      files: transferFiles,
      isPublic: true,
      passwordProtected: !!customPassword,
      password: customPassword || undefined,
      expiresAt: new Date(Date.now() + customDays * 24 * 60 * 60 * 1000).toISOString(),
      storageUsed: totalSize,
    });

    setIsUploading(false);
    setTransferLink(`${getAppUrl()}/#/t/${res.shortLink}`);
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-background dark:bg-[#0f1117] text-on-background dark:text-[#e8eaf0] font-body-md antialiased selection:bg-primary-container selection:text-on-primary-container min-h-screen flex flex-col text-left">
      <Header />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="hero-gradient pt-24 pb-32 px-md md:px-lg relative overflow-hidden">
          {/* Decorative background premium glow gradients */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-primary/20 to-blue-400/20 blur-[120px] -z-10 rounded-full transform translate-x-1/4 -translate-y-1/4"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-secondary/15 to-primary/15 blur-[100px] -z-10 rounded-full transform -translate-x-1/4 translate-y-1/4"></div>          
          {/* Animated file transfer background particles */}
          <style>{`
            @keyframes float-p1 {
              0% { transform: translate(5vw, 60vh) scale(0.7) rotate(0deg); opacity: 0; }
              15% { opacity: 0.4; }
              85% { opacity: 0.4; }
              100% { transform: translate(75vw, 5vh) scale(1.1) rotate(360deg); opacity: 0; }
            }
            @keyframes float-p2 {
              0% { transform: translate(15vw, 65vh) scale(0.8) rotate(0deg); opacity: 0; }
              20% { opacity: 0.3; }
              80% { opacity: 0.3; }
              100% { transform: translate(65vw, 8vh) scale(1.3) rotate(-180deg); opacity: 0; }
            }
            @keyframes float-p3 {
              0% { transform: translate(2vw, 50vh) scale(0.6) rotate(0deg); opacity: 0; }
              10% { opacity: 0.45; }
              90% { opacity: 0.45; }
              100% { transform: translate(80vw, 15vh) scale(1.0) rotate(180deg); opacity: 0; }
            }
            @keyframes float-p4 {
              0% { transform: translate(25vw, 70vh) scale(0.75) rotate(0deg); opacity: 0; }
              15% { opacity: 0.3; }
              85% { opacity: 0.3; }
              100% { transform: translate(70vw, 2vh) scale(1.2) rotate(240deg); opacity: 0; }
            }
            @keyframes swipe-text {
              0%, 20% { transform: translateY(0); }
              25%, 45% { transform: translateY(-1.2em); }
              50%, 70% { transform: translateY(-2.4em); }
              75%, 95% { transform: translateY(-3.6em); }
              100% { transform: translateY(0); }
            }
            .bg-particle-1 { animation: float-p1 18s infinite linear; }
            .bg-particle-2 { animation: float-p2 22s infinite linear; }
            .bg-particle-3 { animation: float-p3 16s infinite linear; }
            .bg-particle-4 { animation: float-p4 26s infinite linear; }
            
            .swipe-container {
              display: inline-flex;
              flex-direction: column;
              height: 1.2em;
              overflow: hidden;
              vertical-align: bottom;
            }
            .swipe-list {
              display: flex;
              flex-direction: column;
              height: calc(1.2em * 4);
              animation: swipe-text 8s infinite cubic-bezier(0.76, 0, 0.24, 1);
            }
            .swipe-item {
              height: 1.2em;
              display: flex;
              align-items: center;
              white-space: nowrap;
            }
          `}</style>
          <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
            {/* Diagonal Floating Background File Icons (Sending Cards) */}
          <div className="bg-particle-1 absolute bg-white/90 dark:bg-[#1a1f2e]/90 border border-slate-200/50 dark:border-[#2e3445]/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] px-4 py-2.5 rounded-2xl flex items-center gap-2 text-primary backdrop-blur-sm">
              <span className="material-symbols-outlined text-[22px]">description</span>
              <span className="material-symbols-outlined text-[14px] animate-bounce">upload</span>
            </div>
            <div className="bg-particle-2 absolute bg-white/90 dark:bg-[#1a1f2e]/90 border border-slate-200/50 dark:border-[#2e3445]/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] px-4 py-2.5 rounded-2xl flex items-center gap-2 text-secondary backdrop-blur-sm">
              <span className="material-symbols-outlined text-[22px]">image</span>
              <span className="material-symbols-outlined text-[14px] animate-bounce">upload</span>
            </div>
            <div className="bg-particle-3 absolute bg-white/90 dark:bg-[#1a1f2e]/90 border border-slate-200/50 dark:border-[#2e3445]/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] px-4 py-2.5 rounded-2xl flex items-center gap-2 text-primary backdrop-blur-sm">
              <span className="material-symbols-outlined text-[22px]">folder_zip</span>
              <span className="material-symbols-outlined text-[14px] animate-bounce">upload</span>
            </div>
            <div className="bg-particle-4 absolute bg-white/90 border border-slate-200/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] px-4 py-2.5 rounded-2xl flex items-center gap-2 text-tertiary backdrop-blur-sm">
              <span className="material-symbols-outlined text-[22px]">video_file</span>
              <span className="material-symbols-outlined text-[14px] animate-bounce">upload</span>
            </div>
          </div>
 
          <div className="max-w-container-max mx-auto grid grid-cols-1 lg:grid-cols-2 gap-xl items-center pt-lg relative z-10">
            {/* Hero Copy */}
            <div className="flex flex-col gap-md reveal">
              <div className="inline-flex items-center gap-xs bg-primary/10 text-primary font-bold text-[10px] px-3.5 py-1.5 rounded-full w-fit mb-sm border border-primary/20 uppercase tracking-wider">
                <span className="material-symbols-outlined text-[14px] animate-pulse">bolt</span>
                Transfer Intelligence™
              </div>
              <h1 className="font-display text-4xl md:text-5xl lg:text-[64px] lg:leading-[72px] font-extrabold text-slate-900 tracking-tight">
                Transfer Files <br />
                <span className="swipe-container pb-1">
                  <span className="swipe-list">
                    <span className="swipe-item">
                      <span className="bg-gradient-to-r from-[#4D82C3] to-[#7FA7D6] bg-clip-text text-transparent">Without Limits</span>
                    </span>
                    <span className="swipe-item">
                      <span className="bg-gradient-to-r from-[#4D82C3] to-[#7FA7D6] bg-clip-text text-transparent">In Seconds</span>
                    </span>
                    <span className="swipe-item">
                      <span className="bg-gradient-to-r from-[#4D82C3] to-[#7FA7D6] bg-clip-text text-transparent">Securely</span>
                    </span>
                    <span className="swipe-item">
                      <span className="bg-gradient-to-r from-[#4D82C3] to-[#7FA7D6] bg-clip-text text-transparent">Globally</span>
                    </span>
                  </span>
                </span>
              </h1>
              <p className="font-body-lg text-lg text-slate-500 max-w-xl leading-relaxed">
                Secure, lightning-fast, and intelligent file delivery. Experience frictionless sharing with real-time download tracking and enterprise-grade encryption.
              </p>
              <div className="flex flex-wrap gap-sm mt-md">
                <button
                  onClick={() => {
                    setView('send');
                  }}
                  className="bg-primary hover:bg-primary-container text-white font-bold text-xs px-8 py-3.5 rounded-xl transition-all shadow-[0_4px_20px_rgba(34,94,156,0.2)] hover:shadow-[0_6px_25px_rgba(34,94,156,0.3)] hover:-translate-y-0.5 flex items-center gap-xs group cursor-pointer"
                >
                  Start Transfer
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </button>
                <button
                  onClick={() => {
                    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs px-8 py-3.5 rounded-xl transition-all border border-slate-200 flex items-center gap-xs cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-0.5"
                >
                  View Pricing
                </button>
              </div>
              <div className="mt-xl flex items-center gap-md text-slate-400 font-body-sm text-xs">
                <div className="flex -space-x-3">
                  <img className="w-8 h-8 rounded-full border-2 border-white object-cover shadow-sm" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDMD1Q7zM7hhWK-xi98q5_1CTER9-2qhk9LYrVcjqURWGRjwAAFAj2pdaZ-g9XysPNCp2K7cA9_fYBICIXIPel1r1x00Z_ds8GB2cmhT3H1WaBkQNkjqJwmCMwefGofMpnM4c2Oh_TUZBi-E6b26zn0ncrBFL176jRqypw5-nDzoBlRuA_4wWLyaP0-rmt3-rzK3_TCnfQDL2CDGOK85UFHJ2OkEiK3_rgQKa5mBdI1nAiX1HUwXZJjvmwbM1dMg-YlvXvdg5tTfQ8" alt="avatar" />
                  <img className="w-8 h-8 rounded-full border-2 border-white object-cover shadow-sm" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDLnp7RuqpzWkO22odetJYNxJKqDFCRb863OmVVni0IcE4cPmHl6or_ktdYKLhVLBG1E8hs__SIaLrP9y2aTRIRqjIOLsUjd3ME-IiCGdRBe8Mm4EwcF3dT4lC2s-uNXDKryFEp1KITK6xus87DNmVcTE6uEBd06UThRN3mxmiJiijaf-zGe4hSd6wpFnQUEEIhjM2NH-J5u_xuooz4HSHYBNlqHEnBKFXV5z9AZoPZHbKck3if_biLxp4NJEezBaBKzV2TDOrh5Fw" alt="avatar" />
                  <img className="w-8 h-8 rounded-full border-2 border-white object-cover shadow-sm" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAKW4To-9t5fG7KthixS9gckXU0afkIcB3o21HOb7n_BItM9-ycSOyHVzlfASDCh1OTpp9QpFNyP0XKJK7eNPMgN-p3dXPIyfCyV09R2OYVsMGOSTFPN3UpK1az4QSADK03myipBkyyqOb_IPUKZ683bwQh9y2uq4NahhsviD8hxs7cdpQarvrC0k4OP6BDhGw-29-OvNy_degt7BQTNY6pe5QOl1hC3gpQaTL_Rz-HGfG3F6GFvIzWiCyscAHuTpQCCBQzp4XFEc8" alt="avatar" />
                </div>
                <p className="font-semibold text-slate-500">Trusted by 10,000+ teams worldwide</p>
              </div>
            </div>
 
            {/* Hero Upload Widget */}
            <div id="transfer-widget" className="relative z-10 w-full max-w-md mx-auto lg:ml-auto">
              <div className="glass-card rounded-[24px] p-md flex flex-col gap-md ambient-shadow transform transition-transform hover:-translate-y-1 duration-300 bg-white/80">
                <div className="flex justify-between items-center border-b border-outline-variant/30 pb-sm">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">Send files securely</h3>
                  <button type="button" className="text-on-surface-variant hover:text-primary transition-colors">
                    <span className="material-symbols-outlined">more_horiz</span>
                  </button>
                </div>
 
                {transferLink ? (
                  <div className="flex flex-col items-center py-6 text-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2 shadow-sm">
                      <span className="material-symbols-outlined text-[24px]">check</span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm">Upload Complete!</h4>
                    <p className="text-xs text-slate-400 mb-2">Your secure link is ready:</p>
                    <div className="flex gap-2 w-full">
                      <input
                        type="text"
                        readOnly
                        value={transferLink}
                        onClick={(e) => {
                          const target = e.target as HTMLInputElement;
                          target.select();
                          navigator.clipboard.writeText(transferLink);
                          alert('📋 Link copied to clipboard!');
                        }}
                        className="w-full text-center bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-primary font-semibold font-mono cursor-pointer"
                      />
                      <button
                        onClick={() => {
                          if (transferLink) {
                            window.open(transferLink, '_blank');
                          }
                        }}
                        className="bg-primary/10 text-primary px-3 rounded-lg hover:bg-primary/20 transition-colors flex items-center justify-center shrink-0 cursor-pointer"
                        title="Open Transfer Link"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                      </button>
                    </div>
                    <button
                      onClick={() => {
                        setFiles([]);
                        setTransferLink(null);
                      }}
                      className="mt-4 text-xs font-bold text-slate-500 hover:text-primary transition-colors"
                    >
                      Send Another File
                    </button>
                  </div>
                ) : isUploading ? (
                  <div className="flex flex-col py-8 items-center text-center gap-3">
                    <h4 className="font-semibold text-xs text-slate-500 uppercase tracking-wider">
                      Uploading requested assets
                    </h4>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div className="h-full progress-active transition-all" style={{ width: `${uploadProgress}%` }} />
                    </div>
                    <span className="text-xs font-bold text-slate-700">{uploadProgress}% uploaded</span>
                  </div>
                ) : (
                  <form onSubmit={handleUploadSubmit} className="flex flex-col gap-md">
                    {/* Drag & Drop Zone */}
                    <div 
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-outline-variant/25 hover:border-primary bg-surface/50 hover:bg-[#F0F7FF] transition-colors rounded-xl p-xl flex flex-col items-center justify-center gap-sm text-center cursor-pointer group h-64"
                    >
                      <input
                        type="file"
                        multiple
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <div className="w-16 h-16 rounded-full bg-primary-fixed flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300 shadow-sm">
                        <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>cloud_upload</span>
                      </div>
                      <div>
                        <p className="font-label-md text-label-md text-primary">Drag and drop files here</p>
                        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">or click to browse from your computer</p>
                      </div>
                      {files.length > 0 ? (
                        <span className="text-xs font-semibold text-slate-700 bg-white border border-slate-150 px-2 py-1 rounded-md mt-1">
                          {files.length} files selected ({formatSize(files.reduce((a, f) => a + f.size, 0))})
                        </span>
                      ) : (
                        <p className="font-label-sm text-label-sm text-outline mt-2">Up to 250GB per transfer</p>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-sm">
                      <button
                        type="button"
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="text-xs font-bold text-slate-500 hover:text-primary flex items-center gap-1 justify-center mb-2 transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {showAdvanced ? 'expand_less' : 'expand_more'}
                        </span>
                        {showAdvanced ? 'Hide advanced settings' : 'Show advanced settings'}
                      </button>

                      {showAdvanced && (
                        <div className="flex flex-col gap-sm border-t border-slate-100 pt-sm pb-2">
                          <div className="text-left">
                            <label className="block text-[10px] font-bold text-slate-500 mb-1">Custom Title</label>
                            <input
                              type="text"
                              value={customTitle}
                              onChange={(e) => setCustomTitle(e.target.value)}
                              placeholder="Optional transfer title"
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs outline-none focus:border-primary focus:bg-white transition-all"
                            />
                          </div>
                          <div className="text-left">
                            <label className="block text-[10px] font-bold text-slate-500 mb-1">Password Protection</label>
                            <input
                              type="password"
                              value={customPassword}
                              onChange={(e) => setCustomPassword(e.target.value)}
                              placeholder="Set download password"
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs outline-none focus:border-primary focus:bg-white transition-all"
                            />
                          </div>
                          <div className="text-left">
                            <label className="block text-[10px] font-bold text-slate-500 mb-1">Expiry Duration</label>
                            <select
                              value={customDays}
                              onChange={(e) => setCustomDays(Number(e.target.value))}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs outline-none focus:border-primary focus:bg-white transition-all cursor-pointer"
                            >
                              <option value={1}>1 Day expiry</option>
                              <option value={3}>3 Days expiry</option>
                              <option value={7}>7 Days expiry</option>
                              <option value={30}>30 Days expiry</option>
                            </select>
                          </div>
                        </div>
                      )}

                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">mail</span>
                        <input 
                          className="w-full bg-surface border border-outline-variant rounded-lg py-sm pl-xl pr-sm text-body-sm font-body-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" 
                          placeholder="Email to (optional)" 
                          type="email"
                          value={emailTo}
                          onChange={(e) => setEmailTo(e.target.value)}
                        />
                      </div>
                      <button type="submit" className="w-full bg-surface-container-high text-on-surface-variant hover:bg-primary hover:text-on-primary font-label-md text-label-md py-sm rounded-lg transition-colors flex justify-center items-center gap-xs">
                        <span className="material-symbols-outlined text-[20px]">link</span>
                        Get a link instead
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>
        <section id="activity-heatmap" className="py-24 px-md md:px-lg bg-slate-50/50 dark:bg-[#1a1a1f] border-t border-slate-100/60 dark:border-[#2b2b33]">
          <div className="max-w-container-max mx-auto">
            <div className="text-center mb-16 max-w-2xl mx-auto reveal">
              <span className="inline-flex items-center gap-xs bg-primary/10 text-primary font-bold text-[9px] px-3.5 py-1.5 rounded-full w-fit mb-4 uppercase tracking-wider">
                Real-Time Insights
              </span>
              <h2 className="font-display text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">Know exactly where your files go.</h2>
              <p className="font-body-lg text-lg text-slate-500 dark:text-slate-400">Intelligent tracking gives you complete visibility. Track who, when, and where your files are downloaded in real-time.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Bento Box 1: Real-time Map */}
              <div className="md:col-span-2 reveal-left bg-white dark:bg-[#222228] rounded-[24px] p-8 border border-slate-200/80 dark:border-[#38383f] overflow-hidden relative min-h-[350px] flex flex-col justify-between group shadow-sm hover:shadow-[0_20px_50px_rgba(77,130,195,0.12)] hover:-translate-y-1 transition-all duration-500">
                <div className="relative z-10">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4 shadow-sm">
                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>travel_explore</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Global Download Heatmap</h3>
                  <p className="text-xs text-slate-500 max-w-sm leading-relaxed">Visualize global reach instantly. See precise geolocation data for every recipient access point as downloads happen.</p>
                </div>
                
                {/* Vector World Map Background */}
                <div 
                  className="absolute inset-0 opacity-[0.08] group-hover:opacity-[0.14] transition-opacity duration-500 bg-contain bg-center bg-no-repeat z-0 scale-95"
                  style={{ 
                    backgroundImage: "url('https://cdn.jsdelivr.net/gh/flekschas/simple-world-map@master/world-map.svg')",
                    filter: "brightness(0)"
                  }}
                ></div>

                {/* Geolocation nodes representation overlay */}
                <div className="absolute inset-0 z-10 pointer-events-none">
                  {/* Glowing Pulse Dot: London */}
                  <div className="absolute top-[50%] right-[30%] flex items-center justify-center">
                    <span className="absolute w-4 h-4 bg-emerald-500 rounded-full animate-ping opacity-60"></span>
                    <span className="relative w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                  </div>
                  {/* Glowing Pulse Dot: New York */}
                  <div className="absolute top-[42%] right-[52%] flex items-center justify-center">
                    <span className="absolute w-4 h-4 bg-primary rounded-full animate-ping opacity-60"></span>
                    <span className="relative w-2 h-2 bg-primary rounded-full shadow-[0_0_8px_rgba(77,130,195,0.8)]"></span>
                  </div>
                </div>
                
                {/* Simulated UI overlay */}
                <div className="absolute bottom-6 right-6 bg-white p-3 rounded-xl shadow-lg border border-slate-200/60 z-20 flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-slate-100 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary text-[20px]">picture_as_pdf</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Q3_Report.pdf</p>
                    <p className="text-[10px] text-emerald-600 flex items-center gap-[2px] font-semibold">
                      <span className="material-symbols-outlined text-[12px] animate-pulse">location_on</span> London, UK • Just now
                    </p>
                  </div>
                </div>
              </div>

              {/* Bento Box 2: Audit Log */}
              <div className="reveal-right bg-white dark:bg-[#222228] rounded-[24px] p-8 border border-slate-200/80 dark:border-[#38383f] flex flex-col justify-between shadow-sm hover:shadow-[0_20px_50px_rgba(77,130,195,0.12)] hover:-translate-y-1 transition-all duration-500" data-delay="150">
                <div>
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 mb-4 shadow-sm">
                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>history</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Granular Audit Logs</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">Timestamped records of every view, download, and forward at your fingertips.</p>
                </div>
                
                {/* Timeline UI */}
                <div className="mt-6 space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[1.5px] before:bg-slate-100">
                  <div className="flex items-start gap-4 relative">
                    <div className="w-6 h-6 rounded-full bg-blue-50 border border-primary text-primary flex items-center justify-center shrink-0 z-10">
                      <span className="material-symbols-outlined text-[12px]">download</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">Downloaded by client@acme.co</p>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">10:42 AM PST • IP: 82.16.4.1</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 relative">
                    <div className="w-6 h-6 rounded-full bg-slate-50 border border-slate-200 text-slate-550 flex items-center justify-center shrink-0 z-10">
                      <span className="material-symbols-outlined text-[12px]">visibility</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-850">Viewed by client@acme.co</p>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">10:38 AM PST • Chrome (MacOS)</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 px-md md:px-lg bg-slate-50/20 dark:bg-[#1a1a1f] border-t border-b border-slate-100 dark:border-[#2b2b33]">
          <div className="max-w-container-max mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="reveal flex flex-col gap-4 bg-white dark:bg-[#222228] p-8 rounded-[24px] border border-slate-200/70 dark:border-[#38383f] shadow-sm hover:shadow-[0_20px_45px_rgba(77,130,195,0.08)] hover:-translate-y-1 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 text-primary flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>radar</span>
                </div>
                <h4 className="text-base font-bold text-slate-800">Intelligent Tracking</h4>
                <p className="text-xs text-slate-500 leading-relaxed">Beyond simple delivery receipts. Get deep insights into engagement, forward chains, and geographic distribution of your sensitive assets.</p>
              </div>
              
              {/* Feature 2 */}
              <div className="reveal flex flex-col gap-4 bg-white dark:bg-[#222228] p-8 rounded-[24px] border border-slate-200/70 dark:border-[#38383f] shadow-sm hover:shadow-[0_20px_45px_rgba(77,130,195,0.08)] hover:-translate-y-1 transition-all duration-300" data-delay="150">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 text-orange-600 flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>rocket_launch</span>
                </div>
                <h4 className="text-base font-bold text-slate-800">Cloudflare R2 Speed</h4>
                <p className="text-xs text-slate-500 leading-relaxed">Powered by distributed edge networks. Experience zero-egress fee transfers that saturate your bandwidth, delivering gigabytes in seconds.</p>
              </div>
              
              {/* Feature 3 */}
              <div className="reveal flex flex-col gap-4 bg-white dark:bg-[#222228] p-8 rounded-[24px] border border-slate-200/70 dark:border-[#38383f] shadow-sm hover:shadow-[0_20px_45px_rgba(77,130,195,0.08)] hover:-translate-y-1 transition-all duration-300" data-delay="300">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 text-emerald-600 flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>shield_lock</span>
                </div>
                <h4 className="text-base font-bold text-slate-800">Enterprise Security</h4>
                <p className="text-xs text-slate-500 leading-relaxed">End-to-end AES-256 encryption. Set granular access controls, password protection, and auto-expiring links to ensure data sovereignty.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 px-md md:px-lg bg-surface dark:bg-[#1a1a1f] border-t border-slate-100 dark:border-[#2b2b33]">
          <div className="max-w-container-max mx-auto flex flex-col items-center">
            {/* Header */}
            <div className="text-center mb-16 max-w-2xl mx-auto reveal">
              <span className="inline-flex items-center gap-xs bg-primary/10 text-primary font-label-sm text-label-sm px-4 py-1.5 rounded-full w-fit mb-4">
                Flexible Plans
              </span>
              <h2 className="font-display text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
                Simple, Transparent Pricing
              </h2>
              <p className="font-body-lg text-lg text-slate-500 dark:text-slate-400">
                Choose the perfect plan for your transfer and workspace needs. Upgrade or downgrade at any time.
              </p>
            </div>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center p-1.5 rounded-full border border-slate-200 dark:border-[#38383f] bg-slate-50 dark:bg-[#222228] shadow-sm mb-16">
              <button
                type="button"
                onClick={() => setIsYearly(false)}
                className={`px-6 py-2.5 rounded-full font-semibold text-xs transition-all duration-300 ${
                  !isYearly ? 'bg-primary text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-primary'
                }`}
              >
                Monthly billing
              </button>
              <button
                type="button"
                onClick={() => setIsYearly(true)}
                className={`px-6 py-2.5 rounded-full font-semibold text-xs transition-all duration-300 flex items-center ${
                  isYearly ? 'bg-primary text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-primary'
                }`}
              >
                Yearly billing
                <span className="text-[10px] bg-primary/10 dark:bg-primary/20 text-primary px-2 py-0.5 rounded-full ml-2 font-bold">
                  Save 20%
                </span>
              </button>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full items-stretch">

              {/* ── FREE ── */}
              <div className="reveal bg-white dark:bg-[#222228] rounded-[24px] p-8 border border-slate-200 dark:border-[#38383f] shadow-sm hover:shadow-lg dark:hover:shadow-black/40 transition-all duration-300 flex flex-col h-full hover:-translate-y-1 relative overflow-hidden group" data-delay="0">
                <div className="absolute -top-8 -right-8 w-32 h-32 opacity-[0.06] pointer-events-none select-none">
                  <img src="/z-logo-blue.svg" alt="" className="w-full h-full object-contain" draggable={false} />
                </div>
                <div className="mb-6">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 mb-4">FREE</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black text-slate-900 dark:text-white tracking-tight">$0</span>
                    <span className="text-sm font-semibold text-slate-400 dark:text-slate-500">/mo</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">
                    For occasional transfers and sharing simple assets.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleSelectPlan('free')}
                  className="w-full py-3 rounded-xl border border-slate-200 dark:border-[#38383f] text-slate-700 dark:text-slate-200 bg-transparent dark:bg-transparent font-bold text-xs hover:bg-slate-50 dark:hover:bg-[#2b2b33] transition-all mb-8 mt-auto shadow-sm active:scale-95"
                >
                  Get Started
                </button>
                <ul className="space-y-3.5 flex-grow">
                  {['Up to 2GB per transfer', 'Transfers active for 7 days'].map(f => (
                    <li key={f} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                      <span className="material-symbols-outlined text-primary text-[18px] shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      {f}
                    </li>
                  ))}
                  <li className="flex items-center gap-2 text-xs text-slate-300 dark:text-slate-600 line-through">
                    <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 text-[18px] shrink-0">remove_circle</span>
                    Password protection
                  </li>
                </ul>
              </div>

              {/* ── PRO (highlighted) ── */}
              <div className="reveal lg:-translate-y-4" data-delay="150">
                <div className="bg-white dark:bg-[#1c2d42] rounded-[24px] p-8 border-2 border-primary shadow-xl dark:shadow-primary/10 relative flex flex-col h-full hover:-translate-y-2 transition-all duration-300 overflow-hidden">
                  <div className="absolute -top-8 -right-8 w-32 h-32 opacity-[0.1] pointer-events-none select-none">
                    <img src="/z-logo-blue.svg" alt="" className="w-full h-full object-contain" draggable={false} />
                  </div>
                  {/* Most Popular badge */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white font-black text-[9px] px-5 py-1.5 rounded-full uppercase tracking-wider shadow-md">
                    Most Popular
                  </div>
                  <div className="mb-6">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-4">PRO</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-black text-slate-900 dark:text-white tracking-tight">${getPrice(12).toFixed(1)}</span>
                      <span className="text-sm font-semibold text-slate-400 dark:text-slate-400">/mo</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">
                      For creative professionals sending large deliverables.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSelectPlan('pro')}
                    className="w-full py-3 rounded-xl bg-primary text-white font-bold text-xs hover:opacity-90 transition-all mb-8 mt-auto shadow-md active:scale-95"
                  >
                    Go Pro
                  </button>
                  <ul className="space-y-3.5 flex-grow">
                    {['Up to 200GB per transfer', '1TB total storage space', 'Password protection', 'Custom brand page logo'].map((f, i) => (
                      <li key={f} className={`flex items-center gap-2 text-xs dark:text-slate-200 ${i === 0 ? 'font-semibold text-slate-800 dark:text-white' : 'text-slate-700'}`}>
                        <span className="material-symbols-outlined text-primary text-[18px] shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* ── BUSINESS ── */}
              <div className="reveal bg-white dark:bg-[#222228] rounded-[24px] p-8 border border-slate-200 dark:border-[#38383f] shadow-sm hover:shadow-lg dark:hover:shadow-black/40 transition-all duration-300 flex flex-col h-full hover:-translate-y-1 relative overflow-hidden" data-delay="300">
                <div className="absolute -top-8 -right-8 w-32 h-32 opacity-[0.06] pointer-events-none select-none">
                  <img src="/z-logo-blue.svg" alt="" className="w-full h-full object-contain" draggable={false} />
                </div>
                <div className="mb-6">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 mb-4">BUSINESS</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black text-slate-900 dark:text-white tracking-tight">${getPrice(30).toFixed(0)}</span>
                    <span className="text-sm font-semibold text-slate-400 dark:text-slate-500">/mo</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">
                    For agency teams requiring collaborative storage workspace.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleSelectPlan('business')}
                  className="w-full py-3 rounded-xl border border-slate-200 dark:border-[#38383f] text-slate-700 dark:text-slate-200 bg-transparent font-bold text-xs hover:bg-slate-50 dark:hover:bg-[#2b2b33] transition-all mb-8 mt-auto shadow-sm active:scale-95"
                >
                  Start Business
                </button>
                <ul className="space-y-3.5 flex-grow">
                  {['Unlimited transfer size', '5TB team cloud storage', 'Shared team workspaces', 'Advanced tracking logs'].map(f => (
                    <li key={f} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                      <span className="material-symbols-outlined text-primary text-[18px] shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              {/* ── ENTERPRISE ── */}
              <div className="reveal bg-white dark:bg-[#222228] rounded-[24px] p-8 border border-slate-200 dark:border-[#38383f] shadow-sm hover:shadow-lg dark:hover:shadow-black/40 transition-all duration-300 flex flex-col h-full hover:-translate-y-1 relative overflow-hidden" data-delay="450">
                <div className="absolute -top-8 -right-8 w-32 h-32 opacity-[0.06] pointer-events-none select-none">
                  <img src="/z-logo-blue.svg" alt="" className="w-full h-full object-contain" draggable={false} />
                </div>
                <div className="mb-6">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 mb-4">ENTERPRISE</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Custom</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 leading-relaxed">
                    For enterprise groups with strict security, SLA, and SSO.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleSelectPlan('enterprise')}
                  className="w-full py-3 rounded-xl border border-slate-200 dark:border-[#38383f] text-slate-700 dark:text-slate-200 bg-transparent font-bold text-xs hover:bg-slate-50 dark:hover:bg-[#2b2b33] transition-all mb-8 mt-auto shadow-sm active:scale-95"
                >
                  Contact Sales
                </button>
                <ul className="space-y-3.5 flex-grow">
                  {['Unlimited scale & storage', 'Single Sign-On (SAML/SSO)', 'Dedicated Account Manager'].map(f => (
                    <li key={f} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                      <span className="material-symbols-outlined text-primary text-[18px] shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </div>
        </section>

        {/* Contacts Section */}
        <section id="contacts-info" className="py-24 px-md md:px-lg bg-slate-50 dark:bg-[#1a1a1f] border-t border-slate-100 dark:border-[#2b2b33]">
          <div className="max-w-container-max mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left side details */}
            <div className="text-left reveal-left">
              <span className="inline-flex items-center gap-xs bg-primary/10 text-primary font-label-sm text-label-sm px-4 py-1.5 rounded-full w-fit mb-4">
                Contact Us
              </span>
              <h2 className="font-display text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-6">
                Get in Touch with our Experts
              </h2>
              <p className="text-slate-500 mb-8 leading-relaxed">
                Have questions about custom features, pricing limits, or security practices? Send us a message, and our product team will assist you in setting up the perfect file transfer workspace.
              </p>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shadow-sm">
                    <span className="material-symbols-outlined text-[20px]">mail</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Email Address</h4>
                    <p className="text-xs text-slate-500">support@zototransfer.com</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shadow-sm">
                    <span className="material-symbols-outlined text-[20px]">phone</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Phone Support</h4>
                    <p className="text-xs text-slate-500">+1 (800) 555-MYTRANS</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shadow-sm">
                    <span className="material-symbols-outlined text-[20px]">location_on</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Headquarters</h4>
                    <p className="text-xs text-slate-500">100 Pine Street, San Francisco, CA 94111</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side form */}
            <div className="reveal-right bg-white dark:bg-[#222228] p-8 rounded-[24px] border border-slate-200/80 dark:border-[#38383f] shadow-lg dark:shadow-black/40" data-delay="150">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Send a Quick Message</h3>
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  alert("✉️ Thank you! Your message has been sent successfully. We will get back to you within 24 hours.");
                  (e.target as HTMLFormElement).reset();
                }} 
                className="space-y-4"
              >
                <div>
                  <label className="block text-left text-xs font-bold text-slate-650 mb-1.5">Full Name</label>
                  <input 
                    required 
                    type="text" 
                    placeholder="Enter your name" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs outline-none focus:border-primary focus:bg-white transition-all input-glow"
                  />
                </div>
                <div>
                  <label className="block text-left text-xs font-bold text-slate-650 mb-1.5">Email Address</label>
                  <input 
                    required 
                    type="email" 
                    placeholder="Enter your email" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs outline-none focus:border-primary focus:bg-white transition-all input-glow"
                  />
                </div>
                <div>
                  <label className="block text-left text-xs font-bold text-slate-650 mb-1.5">Message</label>
                  <textarea 
                    required 
                    rows={4} 
                    placeholder="How can we help you?" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs outline-none focus:border-primary focus:bg-white transition-all resize-none input-glow"
                  />
                </div>
                <button 
                  type="submit" 
                  className="w-full py-3.5 bg-primary hover:bg-primary-container text-white font-bold text-xs rounded-xl shadow-sm transition-all active:scale-98"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* Premium Footer */}
        <footer className="bg-slate-900 dark:bg-[#080a10] text-slate-400 py-16 px-md md:px-lg border-t border-slate-800 dark:border-[#1a1f2e]">
          <div className="max-w-container-max mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3">
              <Logo className="h-7" variant="full" isWhite={true} />
              <span className="text-[10px] text-slate-500">•</span>
              <span className="text-xs text-slate-500">© 2026 ZotoTransfer Inc. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-6 text-xs">
              <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-white transition-colors">Status</a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};
