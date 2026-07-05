import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Header } from '../components/Header';

export const PricingPlans: React.FC = () => {
  const { currentUser, setView, updateUserPlan } = useApp();
  const [isYearly, setIsYearly] = useState<boolean>(false);

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

  return (
    <div className="min-h-screen bg-background text-on-background font-body-md antialiased selection:bg-primary-fixed selection:text-on-primary-fixed flex flex-col text-left">
      <Header />

      <main className="flex-grow w-full max-w-container-max mx-auto px-sm md:px-md lg:px-lg py-lg md:py-xl flex flex-col items-center">
        {/* Header Section */}
        <div className="text-center mb-xl max-w-2xl mx-auto">
          <h1 className="font-display text-display text-on-surface mb-sm">
            Simple, Transparent Pricing
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Choose the perfect plan for your transfer and workspace needs. Upgrade or downgrade at any
            time.
          </p>
        </div>

        {/* Toggle */}
        <div className="flex items-center justify-center p-2 rounded-full border border-outline-variant bg-surface-container-low shadow-sm mb-xl">
          <button
            onClick={() => setIsYearly(false)}
            className={`px-6 py-2 rounded-full font-label-md transition-all duration-300 ${
              !isYearly
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setIsYearly(true)}
            className={`px-6 py-2 rounded-full font-label-md transition-all duration-300 flex items-center ${
              isYearly
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            Yearly
            <span className="text-xs bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full ml-2">
              Save 20%
            </span>
          </button>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md w-full items-stretch">
          {/* FREE */}
          <div className="bg-surface rounded-[24px] p-md border border-outline-variant shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col h-full">
            <div className="mb-sm">
              <h3 className="font-headline-sm text-on-background">FREE</h3>
              <div className="mt-2 flex items-baseline text-on-background">
                <span className="font-display text-display">$0</span>
                <span className="font-body-sm text-on-surface-variant ml-1">/mo</span>
              </div>
              <p className="font-body-sm text-on-surface-variant mt-2">
                For occasional simple transfers.
              </p>
            </div>
            <button
              onClick={() => handleSelectPlan('free')}
              className="w-full py-3 rounded-lg border border-outline-variant text-on-surface-variant font-label-md hover:bg-surface-container-low transition-colors mb-lg mt-auto shadow-sm active:scale-98"
            >
              Get Started
            </button>
            <div className="flex-grow">
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="material-symbols-outlined text-primary text-xl mr-2">
                    check_circle
                  </span>
                  <span className="font-body-sm text-on-background">Up to 2GB per transfer</span>
                </li>
                <li className="flex items-start">
                  <span className="material-symbols-outlined text-primary text-xl mr-2">
                    check_circle
                  </span>
                  <span className="font-body-sm text-on-background">Transfers expire in 7 days</span>
                </li>
                <li className="flex items-start">
                  <span className="material-symbols-outlined text-outline-variant text-xl mr-2">
                    remove
                  </span>
                  <span className="font-body-sm text-on-surface-variant line-through">
                    Password protection
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="material-symbols-outlined text-outline-variant text-xl mr-2">
                    remove
                  </span>
                  <span className="font-body-sm text-on-surface-variant line-through">
                    Custom branding
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* PRO */}
          <div className="bg-surface rounded-[24px] p-md border-2 border-primary shadow-lg relative flex flex-col h-full transform lg:-translate-y-4">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primary text-on-primary font-label-sm px-4 py-1 rounded-full uppercase tracking-wider">
              Most Popular
            </div>
            <div className="mb-sm">
              <h3 className="font-headline-sm text-primary">PRO</h3>
              <div className="mt-2 flex items-baseline text-on-background">
                <span className="font-display text-display">${getPrice(12).toFixed(1)}</span>
                <span className="font-body-sm text-on-surface-variant ml-1">/mo</span>
              </div>
              <p className="font-body-sm text-on-surface-variant mt-2">
                For professionals sending large files regularly.
              </p>
            </div>
            <button
              onClick={() => handleSelectPlan('pro')}
              className="w-full py-3 rounded-lg bg-primary text-on-primary font-label-md hover:bg-primary-container transition-colors mb-lg mt-auto shadow-sm active:scale-98"
            >
              Get Started
            </button>
            <div className="flex-grow">
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="material-symbols-outlined text-primary text-xl mr-2">
                    check_circle
                  </span>
                  <span className="font-body-sm text-on-background font-semibold">
                    Up to 200GB per transfer
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="material-symbols-outlined text-primary text-xl mr-2">
                    check_circle
                  </span>
                  <span className="font-body-sm text-on-background">1TB storage</span>
                </li>
                <li className="flex items-start">
                  <span className="material-symbols-outlined text-primary text-xl mr-2">
                    check_circle
                  </span>
                  <span className="font-body-sm text-on-background">Password protection</span>
                </li>
                <li className="flex items-start">
                  <span className="material-symbols-outlined text-primary text-xl mr-2">
                    check_circle
                  </span>
                  <span className="font-body-sm text-on-background">Custom branding</span>
                </li>
              </ul>
            </div>
          </div>

          {/* BUSINESS */}
          <div className="bg-surface rounded-[24px] p-md border border-outline-variant shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col h-full">
            <div className="mb-sm">
              <h3 className="font-headline-sm text-on-background">BUSINESS</h3>
              <div className="mt-2 flex items-baseline text-on-background">
                <span className="font-display text-display">${getPrice(30).toFixed(0)}</span>
                <span className="font-body-sm text-on-surface-variant ml-1">/mo</span>
              </div>
              <p className="font-body-sm text-on-surface-variant mt-2">
                For small teams requiring collaboration.
              </p>
            </div>
            <button
              onClick={() => handleSelectPlan('business')}
              className="w-full py-3 rounded-lg border border-outline-variant text-on-surface-variant font-label-md hover:bg-surface-container-low transition-colors mb-lg mt-auto shadow-sm active:scale-98"
            >
              Get Started
            </button>
            <div className="flex-grow">
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="material-symbols-outlined text-primary text-xl mr-2">
                    check_circle
                  </span>
                  <span className="font-body-sm text-on-background">Unlimited transfer size</span>
                </li>
                <li className="flex items-start">
                  <span className="material-symbols-outlined text-primary text-xl mr-2">
                    check_circle
                  </span>
                  <span className="font-body-sm text-on-background">5TB shared storage</span>
                </li>
                <li className="flex items-start">
                  <span className="material-symbols-outlined text-primary text-xl mr-2">
                    check_circle
                  </span>
                  <span className="font-body-sm text-on-background">Team workspaces</span>
                </li>
                <li className="flex items-start">
                  <span className="material-symbols-outlined text-primary text-xl mr-2">
                    check_circle
                  </span>
                  <span className="font-body-sm text-on-background">Advanced Analytics</span>
                </li>
              </ul>
            </div>
          </div>

          {/* ENTERPRISE */}
          <div className="bg-surface rounded-[24px] p-md border border-outline-variant shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col h-full">
            <div className="mb-sm">
              <h3 className="font-headline-sm text-on-background">ENTERPRISE</h3>
              <div className="mt-2 flex items-baseline text-on-background">
                <span className="font-display text-headline-lg mt-3">Custom</span>
              </div>
              <p className="font-body-sm text-on-surface-variant mt-3">
                For large organizations with strict security needs.
              </p>
            </div>
            <button
              onClick={() => handleSelectPlan('enterprise')}
              className="w-full py-3 rounded-lg border border-outline-variant text-on-surface-variant font-label-md hover:bg-surface-container-low transition-colors mb-lg mt-auto shadow-sm active:scale-98"
            >
              Contact Sales
            </button>
            <div className="flex-grow">
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="material-symbols-outlined text-primary text-xl mr-2">
                    check_circle
                  </span>
                  <span className="font-body-sm text-on-background">Unlimited everything</span>
                </li>
                <li className="flex items-start">
                  <span className="material-symbols-outlined text-primary text-xl mr-2">
                    check_circle
                  </span>
                  <span className="font-body-sm text-on-background">SSO Integration</span>
                </li>
                <li className="flex items-start">
                  <span className="material-symbols-outlined text-primary text-xl mr-2">
                    check_circle
                  </span>
                  <span className="font-body-sm text-on-background">Dedicated account manager</span>
                </li>
                <li className="flex items-start">
                  <span className="material-symbols-outlined text-primary text-xl mr-2">
                    check_circle
                  </span>
                  <span className="font-body-sm text-on-background">Custom SLA</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-lowest dark:bg-on-background border-t border-outline-variant mt-auto">
        <div className="flex flex-col md:flex-row justify-between items-center px-lg py-md max-w-container-max mx-auto text-left w-full">
          <div className="text-label-md font-bold text-primary mb-4 md:mb-0">
            © 2026 ZotoTransfer Inc. All rights reserved.
          </div>
          <div className="flex space-x-6">
            <a className="font-body-sm text-body-sm text-on-surface-variant dark:text-surface-variant hover:text-primary transition-colors" href="#">Privacy Policy</a>
            <a className="font-body-sm text-body-sm text-on-surface-variant dark:text-surface-variant hover:text-primary transition-colors" href="#">Terms of Service</a>
            <a className="font-body-sm text-body-sm text-on-surface-variant dark:text-surface-variant hover:text-primary transition-colors" href="#">Security</a>
            <a className="font-body-sm text-body-sm text-on-surface-variant dark:text-surface-variant hover:text-primary transition-colors" href="#">Status</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
