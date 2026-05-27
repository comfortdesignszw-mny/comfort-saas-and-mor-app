/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  User, 
  Terminal, 
  Cpu, 
  Layers, 
  MonitorPlay,
  Share2,
  Clock,
  ExternalLink,
  LifeBuoy,
  ShoppingBag,
  Menu,
  X,
  Settings
} from 'lucide-react';

import VendorDashboard from './components/VendorDashboard';
import StorefrontView from './components/StorefrontView';
import CustomerPortal from './components/CustomerPortal';
import ArchEngine from './components/ArchEngine';
import SettingsView from './components/SettingsView';

export default function App() {
  const [activeTab, setActiveTab] = useState<'vendor' | 'storefront' | 'portal' | 'architecture' | 'settings'>('storefront');
  const [activeStoreSubdomain, setActiveStoreSubdomain] = useState('apex');
  const [systemTime, setSystemTime] = useState(() => {
    const now = new Date();
    const formatZero = (num: number) => String(num).padStart(2, '0');
    const tzString = now.toLocaleTimeString('en-US', { timeZoneName: 'short' }).split(' ').pop() || '';
    return `${now.getFullYear()}-${formatZero(now.getMonth() + 1)}-${formatZero(now.getDate())} ${formatZero(now.getHours())}:${formatZero(now.getMinutes())}:${formatZero(now.getSeconds())} ${tzString}`;
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Continually update a high contrast clock inside page frames
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      try {
        // Format to user's local timezone (automatically detects browser location/settings)
        const formatZero = (num: number) => String(num).padStart(2, '0');
        
        const year = now.getFullYear();
        const month = formatZero(now.getMonth() + 1);
        const date = formatZero(now.getDate());
        const hours = formatZero(now.getHours());
        const minutes = formatZero(now.getMinutes());
        const seconds = formatZero(now.getSeconds());
        
        // Get timezone abbreviation, e.g. "GMT+2" or "CAT" or "CEST"
        const tzString = now.toLocaleTimeString('en-US', { timeZoneName: 'short' }).split(' ').pop() || '';
        
        setSystemTime(`${year}-${month}-${date} ${hours}:${minutes}:${seconds} ${tzString}`);
      } catch (e) {
        setSystemTime(now.toLocaleString());
      }
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans text-slate-900 selection:bg-yellow-100 antialiased" id="platform-screen">
      
      {/* SIDEBAR NAVIGATION DRAWER */}
      <div 
        className={`fixed inset-0 z-50 flex ${sidebarOpen ? 'pointer-events-auto shadow-2xl overflow-hidden' : 'pointer-events-none'}`} 
        id="side-navigation-overlay"
      >
        {/* Backdrop overlay */}
        <div 
          onClick={() => setSidebarOpen(false)}
          className={`fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300 ${
            sidebarOpen ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Sidebar panel */}
        <div 
          className={`relative flex flex-col w-full max-w-xs sm:max-w-sm h-full bg-[#111827] text-white p-6 transition-transform duration-300 ease-out z-10 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          id="side-navigation-drawer"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-6 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-white shrink-0 shadow-xs select-none">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-sans font-black tracking-wider uppercase text-slate-100">Comfort<span className="text-indigo-400">MoR</span></h2>
                <p className="text-[9px] text-slate-500 font-sans uppercase font-extrabold tracking-wider">Zimbabwe Multi-Tenant MoR</p>
              </div>
            </div>
            
            <button 
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Close Side Menu"
              id="btn-close-sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 overflow-y-auto py-6 space-y-7">
            
            {/* Primary section */}
            <div className="space-y-3">
              <span className="text-[9px] font-sans font-black text-slate-500 uppercase tracking-widest block px-3">Main Console Pages</span>
              <div className="space-y-1.5">
                <button
                  onClick={() => {
                    setActiveTab('vendor');
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left text-xs font-sans font-bold transition-all ${
                    activeTab === 'vendor'
                      ? 'bg-yellow-400 text-slate-950 shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-semibold'
                  }`}
                  id="sidebar-btn-vendor"
                >
                  <Building2 className="w-4 h-4 shrink-0" />
                  <div className="flex-1">
                    <p className="font-extrabold uppercase tracking-wide text-[11px]">Vendor Console Engine</p>
                    <p className={`text-[9px] font-semibold mt-0.5 ${activeTab === 'vendor' ? 'text-slate-800' : 'text-slate-500'}`}>Manage stores & licenses</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('storefront');
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left text-xs font-sans font-bold transition-all ${
                    activeTab === 'storefront'
                      ? 'bg-yellow-400 text-slate-950 shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-semibold'
                  }`}
                  id="sidebar-btn-storefront"
                >
                  <MonitorPlay className="w-4 h-4 shrink-0" />
                  <div className="flex-1">
                    <p className="font-extrabold uppercase tracking-wide text-[11px]">Interactive Storefronts</p>
                    <p className={`text-[9px] font-semibold mt-0.5 ${activeTab === 'storefront' ? 'text-slate-800' : 'text-slate-500'}`}>Simulated buyer checkouts</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('portal');
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left text-xs font-sans font-bold transition-all ${
                    activeTab === 'portal'
                      ? 'bg-yellow-400 text-slate-950 shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-semibold'
                  }`}
                  id="sidebar-btn-portal"
                >
                  <User className="w-4 h-4 shrink-0" />
                  <div className="flex-1">
                    <p className="font-extrabold uppercase tracking-wide text-[11px]">Self-Serve Buyer Portal</p>
                    <p className={`text-[9px] font-semibold mt-0.5 ${activeTab === 'portal' ? 'text-slate-800' : 'text-slate-500'}`}>Retrieve keys & downloads</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('architecture');
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left text-xs font-sans font-bold transition-all ${
                    activeTab === 'architecture'
                      ? 'bg-yellow-400 text-slate-950 shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-semibold'
                  }`}
                  id="sidebar-btn-architecture"
                >
                  <Cpu className="w-4 h-4 shrink-0" />
                  <div className="flex-1">
                    <p className="font-extrabold uppercase tracking-wide text-[11px]">Architectural Blueprint</p>
                    <p className={`text-[9px] font-semibold mt-0.5 ${activeTab === 'architecture' ? 'text-slate-800' : 'text-slate-500'}`}>Interactive blueprint map</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('settings');
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left text-xs font-sans font-bold transition-all ${
                    activeTab === 'settings'
                      ? 'bg-yellow-400 text-slate-950 shadow-xs font-black'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-semibold'
                  }`}
                  id="sidebar-btn-settings"
                >
                  <Settings className="w-4 h-4 shrink-0" />
                  <div className="flex-1">
                    <p className="font-extrabold uppercase tracking-wide text-[11px]">System Settings</p>
                    <p className={`text-[9px] font-semibold mt-0.5 ${activeTab === 'settings' ? 'text-slate-800' : 'text-slate-500'}`}>Profiles & business details</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Quick specifications and current selection */}
            <div className="space-y-3 pt-2">
              <span className="text-[9px] font-sans font-black text-slate-500 uppercase tracking-widest block px-3">Platform State Info</span>
              <ul className="space-y-2 px-3 text-[11px] text-slate-400">
                <li className="flex items-center gap-2 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Active Store: <b className="font-bold uppercase text-slate-200">{activeStoreSubdomain}</b></span>
                </li>
                <li className="flex items-center gap-2 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                  <span>System Environment: <b className="font-bold text-slate-250">Mainnet Gateway</b></span>
                </li>
              </ul>
            </div>

          </div>

          {/* Footer of Sidebar */}
          <div className="pt-6 border-t border-slate-800 text-[10px] text-slate-500 font-medium space-y-1.5 select-none">
            <p className="text-slate-400">Comfort MoR and SaaS Ecommerce</p>
            <p>Active System Time: {systemTime}</p>
          </div>
        </div>
      </div>

      {/* Dynamic Global Top Header Utility bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-205/80 shadow-xs px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Hamburger Menu Trigger */}
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors text-slate-700 hover:text-indigo-650 focus:outline-hidden cursor-pointer flex items-center justify-center mr-1"
            id="btn-sidebar-toggle"
            aria-label="Toggle Navigation Side Menu"
            title="Open side menu drawer"
          >
            <Menu className="w-4 h-4" />
          </button>

          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-white shadow-xs select-none">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-sans font-black text-slate-900 tracking-tight">COMFORT<span className="text-indigo-600">MoR</span> eCommerce</h1>
            <p className="text-[10px] text-slate-400 font-sans uppercase tracking-wider font-semibold">Comfort MoR and SaaS Ecommerce — Multi-Tenant & Zimbabwe MoR</p>
          </div>
        </div>

        {/* Sync telemetry, system clocks */}
        <div className="flex items-center gap-4">
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-600 flex items-center gap-1.5 shrink-0">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span id="utc-clock-counter" className="font-semibold">{systemTime}</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 bg-indigo-50 text-indigo-805 border border-indigo-100 px-3 py-1.5 rounded-xl text-xs font-sans font-bold">
            <span>Secure Portal Mainnet</span>
          </div>
        </div>
      </header>

      {/* Main Container Layout */}
      <main className="max-w-[1360px] mx-auto p-4 sm:p-8 space-y-8" id="core-workbench">
        
        {/* Dynamic Panel rendering */}
        <section className="animate-fade-in duration-300" id="workbench-panels">
          {activeTab === 'vendor' && (
            <VendorDashboard 
              onSelectStore={(sub) => setActiveStoreSubdomain(sub)} 
              activeStoreSubdomain={activeStoreSubdomain}
            />
          )}

          {activeTab === 'storefront' && (
            <StorefrontView subdomain={activeStoreSubdomain} />
          )}

          {activeTab === 'portal' && (
            <CustomerPortal />
          )}

          {activeTab === 'architecture' && (
            <ArchEngine />
          )}

          {activeTab === 'settings' && (
            <SettingsView 
              onLogoutSuccess={() => {
                setActiveTab('storefront');
              }}
              onStoreUpdated={(newSub) => {
                setActiveStoreSubdomain(newSub);
              }}
            />
          )}
        </section>

      </main>

      {/* Global Bottom Support bar */}
      <footer className="bg-[#111827] text-slate-400 py-12 mt-20 px-6 font-sans border-t border-slate-800">
        <div className="max-w-[1360px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="space-y-3">
            <h4 className="text-white text-sm font-semibold flex items-center gap-1.5">
              <ShoppingBag className="w-4 h-4 text-indigo-400" /> Comfort MoR & SaaS Ecommerce
            </h4>
            <p className="text-xs leading-relaxed text-slate-400">
              A high-fidelity implementation of a Multi-Tenant SaaS e-commerce builder and Merchant of Record checkout aggregator designed specifically for African regional payments.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-white text-sm font-semibold flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-400" /> Interactive Sandboxes
            </h4>
            <ul className="text-xs space-y-2 text-slate-400">
              <li>• Create dynamic store subdomains on-the-fly</li>
              <li>• File attachments backed strictly by multipart local uploads</li>
              <li>• Simulated USSD push dialers for EcoCash & Omari checkouts</li>
              <li>• Comprehensive licensing, subscription cancels and file re-downloads</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-white text-sm font-semibold flex items-center gap-1.5">
              <LifeBuoy className="w-4 h-4 text-indigo-400" /> Platform Multi-Tenant Compliance
            </h4>
            <p className="text-xs leading-relaxed text-slate-400">
              Approved Merchant of Record (MoR) status handles regional VAT tax compliance, cellular payment network connections, and automated customer access receipts out of the box.
            </p>
          </div>

        </div>
        <div className="max-w-[1360px] mx-auto border-t border-slate-800/80 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-slate-500 text-[11px] gap-4">
          <p>© 2026 Comfort MoR and SaaS Ecommerce. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Status: Live Platform Environment <ExternalLink className="w-3 h-3 text-indigo-400" />
          </p>
        </div>
      </footer>

    </div>
  );
}
