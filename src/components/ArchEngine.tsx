/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Database, 
  CheckCircle2, 
  Zap, 
  Shield, 
  Server, 
  ArrowRight, 
  Layers, 
  CreditCard, 
  Activity, 
  Network, 
  Key, 
  Calendar, 
  Mail, 
  Globe,
  Settings,
  User,
  ShoppingBag,
  Bell
} from 'lucide-react';

export default function ArchEngine() {
  const [activeTab, setActiveTab] = useState<'topology' | 'isolation' | 'payments' | 'pipeline'>('topology');
  const [activeStep, setActiveStep] = useState<number>(0);

  const steps = [
    { title: "Customer Checkout", desc: "Buyer checks out on store (eg: apex.comfortmor.com) choosing EcoCash or Cards.", icon: <ShoppingBag className="w-5 h-5 text-indigo-500" /> },
    { title: "MoR Transaction Authorization", desc: "System locks tax rate compliance, initiates USSD, and authorizes payment.", icon: <Shield className="w-5 h-5 text-emerald-500" /> },
    { title: "Instant License Generation", desc: "Secure algorithms issue digital file access tokens or cryptographic API keys.", icon: <Key className="w-5 h-5 text-amber-500" /> },
    { title: "Real-time Dispatch Alerts", desc: "Merchant Developer Webhook dispatches secure JSON payload in under 200ms.", icon: <Bell className="w-5 h-5 text-pink-500" /> }
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden" id="architecture-panel">
      {/* Header Banner */}
      <div className="bg-[#111827] px-6 sm:px-8 py-8 text-white flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative">
        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-indigo-500/10 text-indigo-400 text-[10px] uppercase font-bold px-2.5 py-1 rounded-full border border-indigo-500/20 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 animate-pulse text-indigo-400" /> Active System Blueprint
            </span>
            <span className="bg-emerald-500/10 text-emerald-400 text-[10px] uppercase font-bold px-2.5 py-1 rounded-full border border-emerald-500/20">
              Verified Compliant
            </span>
          </div>
          <h2 className="text-xl font-sans font-black tracking-tight text-white uppercase sm:text-2xl">
            SaaS Platform & MoR Architecture Map
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm font-medium max-w-2xl leading-relaxed">
            A real-time visualization of the tenant separation engine, localized transactional pipelines, and instant payment notification topologies.
          </p>
        </div>

        {/* Small Status Badge Card */}
        <div className="flex items-center gap-3.5 bg-slate-800/45 border border-slate-700/50 rounded-2xl p-4 max-w-sm z-10 select-none">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm">
            <Network className="w-5 h-5" />
          </div>
          <div className="text-xs">
            <p className="font-sans font-black text-slate-100 uppercase tracking-wider">MoR Gateway Hub</p>
            <p className="text-slate-400 font-medium">Auto handles VAT, cellular handshakes & local tax.</p>
          </div>
        </div>
        
        {/* Absolute visual subtle decor block */}
        <div className="absolute right-0 top-0 bottom-0 bg-radial-gradient from-indigo-500/10 to-transparent w-96 pointer-events-none"></div>
      </div>

      {/* Tabs List */}
      <div className="flex flex-wrap border-b border-slate-200 bg-slate-50/50 p-1.5 gap-1 select-none">
        <button
          onClick={() => setActiveTab('topology')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-sans font-black rounded-xl transition-all duration-150 cursor-pointer ${
            activeTab === 'topology'
              ? 'bg-white text-[#111827] shadow-sm border border-slate-200'
              : 'text-slate-550 hover:text-slate-900 hover:bg-slate-100'
          }`}
          id="btn-arch-top"
        >
          <Network className="w-4 h-4 text-indigo-600" /> System Topology Node-Map
        </button>
        <button
          onClick={() => setActiveTab('isolation')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-sans font-black rounded-xl transition-all duration-150 cursor-pointer ${
            activeTab === 'isolation'
              ? 'bg-white text-[#111827] shadow-sm border border-slate-200'
              : 'text-slate-550 hover:text-slate-900 hover:bg-slate-100'
          }`}
          id="btn-arch-iso"
        >
          <Layers className="w-4 h-4 text-emerald-600" /> Multi-Tenant Isolation
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-sans font-black rounded-xl transition-all duration-150 cursor-pointer ${
            activeTab === 'payments'
              ? 'bg-white text-[#111827] shadow-sm border border-slate-200'
              : 'text-slate-550 hover:text-slate-900 hover:bg-slate-100'
          }`}
          id="btn-arch-pay"
        >
          <CreditCard className="w-4 h-4 text-amber-500" /> African Gateway Adapters
        </button>
        <button
          onClick={() => setActiveTab('pipeline')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-sans font-black rounded-xl transition-all duration-150 cursor-pointer ${
            activeTab === 'pipeline'
              ? 'bg-white text-[#111827] shadow-sm border border-slate-200'
              : 'text-slate-550 hover:text-slate-900 hover:bg-slate-100'
          }`}
          id="btn-arch-pipe"
        >
          <Zap className="w-4 h-4 text-fuchsia-500" /> Live Webhook Pipeline
        </button>
      </div>

      {/* Main Tab View Contents */}
      <div className="p-6 sm:p-8">
        
        {activeTab === 'topology' && (
          <div className="space-y-8 animate-fade-in">
            {/* Visual Topology Header */}
            <div className="bg-indigo-50/60 border border-indigo-100/80 p-5 rounded-2xl flex items-start gap-4">
              <Shield className="w-6 h-6 text-indigo-600 shrink-0 mt-0.5" />
              <div className="text-xs text-indigo-950 space-y-1">
                <p className="font-bold uppercase tracking-wider text-indigo-900">Platform Infrastructure Topology</p>
                <p className="font-medium leading-relaxed text-indigo-805">
                  Visual mapping of how tenant traffic flows from client stores, is securely routed by the Merchant of Record proxies to specialized microservices, and recorded in structural high-speed data vaults.
                </p>
              </div>
            </div>

            {/* Interactive Visual Network Drawing */}
            <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 text-slate-350 shadow-inner relative overflow-hidden flex flex-col gap-6 md:gap-10">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                
                {/* Visual Node 1: Incoming Stores */}
                <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 space-y-4 hover:border-indigo-500/40 transition-all select-none group text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold bg-indigo-500/15 text-indigo-405 px-2 py-0.5 rounded-full uppercase border border-indigo-500/20">Client Layer</span>
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-sans font-black text-white text-xs uppercase tracking-wider">Storefront Frontends</h4>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">Static HTML & React SPA</p>
                    </div>
                  </div>
                  <div className="space-y-2 border-t border-slate-700/60 pt-3 text-[10px] text-slate-400 font-medium leading-relaxed">
                    <p>• Tenant subdomain URL dynamic matching (eg: glowpixels.comfortmor.com)</p>
                    <p>• Local caching & rapid static reload with PWA specs</p>
                    <p>• Real-time responsive payment checkout frames</p>
                  </div>
                </div>

                {/* Visual Node 2: MoR Broker API Core */}
                <div className="bg-slate-805/90 border border-indigo-500/30 rounded-2xl p-5 space-y-4 relative hover:border-indigo-500/50 transition-all group text-left shadow-lg scale-102">
                  {/* Decorative glowing back light */}
                  <div className="absolute inset-x-0 -top-px h-1.5 bg-indigo-550 rounded-t-2xl"></div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold bg-indigo-600/15 text-indigo-310 px-2.5 py-1 rounded-full uppercase border border-indigo-500/30">Orchestration</span>
                    <span className="text-[9px] font-mono font-bold text-indigo-450 uppercase flex items-center gap-1">
                      <Zap className="w-3 h-3 text-indigo-400 animate-pulse" /> Active Router
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600/20 rounded-xl flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      <Server className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-sans font-black text-white text-xs uppercase tracking-wider">MoR App Server</h4>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">Express API + Security Handlers</p>
                    </div>
                  </div>
                  <div className="space-y-2 border-t border-slate-700/60 pt-3 text-[10px] text-slate-400 font-medium leading-relaxed">
                    <p>• Local USSD dial challenge generation loop</p>
                    <p>• ISO-compliance tax & VAT dynamic logs</p>
                    <p>• Cryptographic webhook signatures (SHA-256)</p>
                  </div>
                </div>

                {/* Visual Node 3: Database & Vaults Layer */}
                <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 space-y-4 hover:border-emerald-500/40 transition-all select-none group text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-405 px-2 py-0.5 rounded-full uppercase border border-emerald-500/20">Data Vaults</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-555"></span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                      <Database className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-sans font-black text-white text-xs uppercase tracking-wider">Tenant Storage Vaults</h4>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">Secured SQL Isolation Matrix</p>
                    </div>
                  </div>
                  <div className="space-y-2 border-t border-slate-700/60 pt-3 text-[10px] text-slate-400 font-medium leading-relaxed">
                    <p>• Store metadata & localized layout params</p>
                    <p>• License key ledger status check logs</p>
                    <p>• Live webhook audit journals stored chronologically</p>
                  </div>
                </div>

              </div>

              {/* Connections/Active Path representation */}
              <div className="border-t border-dashed border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs gap-4 text-slate-400">
                <span className="font-mono text-[10px] uppercase text-slate-500 font-semibold">Active Pipeline Connections: Secure SSL handshake</span>
                <div className="flex gap-4 items-center">
                  <div className="flex items-center gap-1.5 bg-slate-805 px-3 py-1.5 rounded-lg border border-slate-800">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                    <span className="text-[10px]">Client -&gt; Proxy</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-805 px-3 py-1.5 rounded-lg border border-slate-800">
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                    <span className="text-[10px]">Proxy -&gt; Vault</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {activeTab === 'isolation' && (
          <div className="space-y-8 animate-fade-in">
            {/* Visual Isolation Header */}
            <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-2xl flex items-start gap-4">
              <Layers className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-950 space-y-1">
                <p className="font-bold uppercase tracking-wider text-emerald-900">Dynamic Multi-Tenant Isolation Paradigm</p>
                <p className="font-medium leading-relaxed text-emerald-805">
                  Our system achieves instant, reliable merchant segregation by using dynamic host headers to virtualize separate catalogs. Each store possesses isolated styling parameters, items, billing targets, and distinct cryptographic keys.
                </p>
              </div>
            </div>

            {/* Bento Grid layout representing Tenant separation visually */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="border border-slate-200 rounded-2xl p-5 space-y-3bg-slate-50/50">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold mb-3">01</div>
                <h4 className="text-xs font-sans font-black text-slate-800 uppercase tracking-widest">Header Host Switcher</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                  Express Server catches inbound URLs. If subdomains (e.g. <code className="bg-slate-200 px-1 py-0.5 rounded text-[10px] text-slate-700">apex</code> or <code className="bg-slate-200 px-1 py-0.5 rounded text-[10px] text-slate-700">glowpixels</code>) do not match the system tenant lists, we dynamically route traffic safely.
                </p>
              </div>

              <div className="border border-slate-200 rounded-2xl p-5 space-y-3 bg-slate-50/50">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold mb-3">02</div>
                <h4 className="text-xs font-sans font-black text-slate-800 uppercase tracking-widest">Isolated Vault Catalogs</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                  Each product entry references unique tenant identifiers in high performance indices. Checkouts occur directly inside isolated database schemas, protecting other stores on the platform from data leaks.
                </p>
              </div>

              <div className="border border-slate-200 rounded-2xl p-5 space-y-3 bg-slate-50/50">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold mb-3">03</div>
                <h4 className="text-xs font-sans font-black text-slate-800 uppercase tracking-widest">Cryptographic Segregation</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                  License validations are isolated. Customer verification endpoints check ONLY keys corresponding to the specific products sold by that specific tenant, leaving other credentials completely secure.
                </p>
              </div>

            </div>
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="space-y-6 animate-fade-in text-sm text-slate-650">
            {/* Payment Adaptors Header */}
            <div className="bg-amber-50 border border-amber-100 p-5 rounded-2xl flex gap-3.5 items-start">
              <Zap className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-950 space-y-1">
                <p className="font-bold uppercase tracking-wider text-amber-900">Regional Gateway Handshakes (Africa-Optimized)</p>
                <p className="text-amber-805 leading-relaxed font-medium">
                  We abstract the physical carrier and card API connections behind uniform interface templates. This enables immediate support for dynamic USSD prompts, app verification codes, and secure card processors.
                </p>
              </div>
            </div>

            {/* Visual Interactive Cards representing Gateway endpoints */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              
              <div className="border border-slate-200 rounded-2xl p-6 bg-slate-50/50 flex flex-col justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                    <h4 className="font-sans font-black text-[#111827] text-xs uppercase tracking-wider">
                      EcoCash USSD Mobile Push
                    </h4>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    Initiates an active SOAP/XML payload exchange with regional cell carriers. Triggers a real-time dial notification on the buyer's hand-set to input PIN, returning feedback immediately.
                  </p>
                </div>
                <div className="border-t border-slate-200 pt-3 flex items-center justify-between text-[11px] font-mono font-bold text-slate-400">
                  <span>Merchant Target: Dial Prompt Trigger</span>
                  <span className="text-[#111827] bg-slate-100 border px-2 py-0.5 rounded">*151*200#</span>
                </div>
              </div>

              <div className="border border-slate-200 rounded-2xl p-6 bg-slate-50/50 flex flex-col justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-500"></div>
                    <h4 className="font-sans font-black text-[#111827] text-xs uppercase tracking-wider">
                      Innbucks App Vouchers
                    </h4>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    Creates an active ledger. Customers input 6-digit Innbucks app voucher numbers to safely settle checkouts. Sells and settles SaaS subscriptions and download packages instantly.
                  </p>
                </div>
                <div className="border-t border-slate-200 pt-3 flex items-center justify-between text-[11px] font-mono font-bold text-slate-400">
                  <span>Innbucks ID Reference</span>
                  <span className="text-[#111827] bg-slate-100 border px-2 py-0.5 rounded">Store Code: 89327</span>
                </div>
              </div>

              <div className="border border-slate-200 rounded-2xl p-6 bg-slate-50/50 flex flex-col justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                    <h4 className="font-sans font-black text-[#111827] text-xs uppercase tracking-wider">
                      Omari Mobile Wallet
                    </h4>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    Schedules direct wallet authorization sequences. Automatically monitors callback endpoints, unlocking the merchant goods the instant funds are deposited onto the compliance registry.
                  </p>
                </div>
                <div className="border-t border-slate-200 pt-3 flex items-center justify-between text-[11px] font-mono font-bold text-slate-400">
                  <span>Omari API Channel</span>
                  <span className="text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded">Secure Node Link</span>
                </div>
              </div>

              <div className="border border-slate-200 rounded-2xl p-6 bg-slate-50/50 flex flex-col justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                    <h4 className="font-sans font-black text-[#111827] text-xs uppercase tracking-wider">
                      Paynow Aggregate Integrator
                    </h4>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    Accepts international credit cards, Visa/Mastercard processing, and multiple local bank routing options. Guarantees safety while handling customer checkout transfers on the platform.
                  </p>
                </div>
                <div className="border-t border-slate-200 pt-3 flex items-center justify-between text-[11px] font-mono font-bold text-slate-400">
                  <span>Paynow Checkout Endpoint</span>
                  <span className="text-emerald-700 bg-emerald-50 border border-emerald-110 px-2 py-0.5 rounded">Adapter Connected</span>
                </div>
              </div>

            </div>
          </div>
        )}

        {activeTab === 'pipeline' && (
          <div className="space-y-8 animate-fade-in">
            {/* Live Webhook Header */}
            <div className="bg-fuchsia-50 border border-fuchsia-100 p-5 rounded-2xl flex items-start gap-4">
              <Zap className="w-6 h-6 text-fuchsia-600 shrink-0 mt-0.5" />
              <div className="text-xs text-fuchsia-950 space-y-1">
                <p className="font-bold uppercase tracking-wider text-fuchsia-900">Interactive Dispatch Flow Pipeline</p>
                <p className="font-medium leading-relaxed text-fuchsia-805">
                  Click through the timeline steps below to preview exactly how checkouts are captured, secure license keys are generated, and instant webhooks are dispatched with matching cryptographic SHA-256 signatures.
                </p>
              </div>
            </div>

            {/* Stepper Timeline & Visual Details block */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              
              {/* Steppers selector */}
              <div className="lg:col-span-5 flex flex-col gap-3.5">
                {steps.map((st, i) => (
                  <div
                    key={i}
                    onClick={() => setActiveStep(i)}
                    className={`p-4 border rounded-2xl cursor-pointer text-left select-none transition-all duration-150 flex items-start gap-3.5 ${
                      activeStep === i 
                        ? 'border-indigo-550 bg-indigo-50/20 shadow-xs ring-1 ring-indigo-50'
                        : 'border-slate-200 bg-slate-50/30 hover:bg-slate-50 hover:border-slate-350'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      activeStep === i ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {st.icon}
                    </div>
                    <div className="space-y-0.5 text-xs">
                      <h4 className={`font-sans font-black uppercase tracking-wide ${activeStep === i ? 'text-indigo-650' : 'text-slate-700'}`}>
                        {st.title}
                      </h4>
                      <p className="text-slate-500 text-[11px] leading-relaxed font-medium">{st.desc.substring(0, 90)}...</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Stepper Live Details view */}
              <div className="lg:col-span-7 bg-slate-900 border border-slate-800 text-slate-300 rounded-3xl p-6 sm:p-8 flex flex-col justify-between gap-6 relative overflow-hidden select-none text-left">
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <span className="text-[10px] font-mono font-bold bg-indigo-500/15 text-indigo-405 px-2.5 py-1 rounded-full uppercase border border-indigo-500/20">
                      Pipeline State Visualizer
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">STEP 0{activeStep + 1} OF 04</span>
                  </div>

                  <div className="flex items-center gap-3.5 pt-2">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center border border-slate-700 text-indigo-400">
                      {steps[activeStep].icon}
                    </div>
                    <div>
                      <h3 className="text-sm font-sans font-black text-white uppercase tracking-wider">{steps[activeStep].title}</h3>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">Active Transaction Broadcast Event</p>
                    </div>
                  </div>

                  <p className="text-slate-300 text-xs font-medium leading-relaxed bg-slate-850/65 p-4 rounded-xl border border-slate-800/80">
                    {steps[activeStep].desc}
                  </p>
                </div>

                <div className="space-y-2 border-t border-slate-800/80 pt-4 text-[10px] font-mono text-slate-500 leading-relaxed">
                  <p>• SSL SHA-256 Check: <span className="text-emerald-400 font-bold">STABLE CONNECTION</span></p>
                  <p>• Database Sync latency: <span className="text-emerald-405">&lt; 14ms response</span></p>
                  <p>• Webhook security signature: <span className="text-indigo-400">X-MoR-Signature payload validated</span></p>
                </div>

                {/* Steppers trigger helper button */}
                <button
                  onClick={() => setActiveStep((activeStep + 1) % steps.length)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-sans font-extrabold text-[10px] uppercase tracking-wider px-4 py-2.5 rounded-xl self-end flex items-center gap-1 transition-all cursor-pointer"
                >
                  Next Demo State <ArrowRight className="w-3.5 h-3.5 text-white" />
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
