import React, { useState, useEffect } from 'react';
import { 
  User, 
  Building2, 
  LogOut, 
  Check, 
  Coins, 
  Palette, 
  Shield, 
  CreditCard,
  RefreshCw,
  Mail,
  Phone,
  Key,
  Globe
} from 'lucide-react';

interface SettingsViewProps {
  onLogoutSuccess: () => void;
  onStoreUpdated?: (subdomain: string) => void;
}

export default function SettingsView({ onLogoutSuccess, onStoreUpdated }: SettingsViewProps) {
  // Session details
  const [sessionToken, setSessionToken] = useState(() => localStorage.getItem('comfortmor_vendor_token') || '');
  const [profileEmail, setProfileEmail] = useState(() => localStorage.getItem('comfortmor_vendor_email') || '');
  const [profileName, setProfileName] = useState(() => localStorage.getItem('comfortmor_vendor_name') || '');
  const [profilePhone, setProfilePhone] = useState(() => localStorage.getItem('comfortmor_vendor_phone') || '');
  const [profileRole, setProfileRole] = useState(() => localStorage.getItem('comfortmor_vendor_role') || 'vendor');

  // Input states for updating profile
  const [newName, setNewName] = useState(profileName);
  const [newPhone, setNewPhone] = useState(profilePhone);
  const [newPin, setNewPin] = useState('');
  
  // Stores and selected store states
  const [stores, setStores] = useState<any[]>([]);
  const [selectedStore, setSelectedStore] = useState<any | null>(null);
  const [loadingStores, setLoadingStores] = useState(false);

  // Business detail form states for editing chosen store
  const [bizName, setBizName] = useState('');
  const [bizSubdomain, setBizSubdomain] = useState('');
  const [bizCurrency, setBizCurrency] = useState('USD');
  const [bizThemeColor, setBizThemeColor] = useState('#0f766e');
  const [bizVendorEmail, setBizVendorEmail] = useState('');
  const [bizBankName, setBizBankName] = useState('');
  const [bizBankAccountName, setBizBankAccountName] = useState('');
  const [bizBankAccountNumber, setBizBankAccountNumber] = useState('');
  const [bizBankBranchCode, setBizBankBranchCode] = useState('');

  // Status counters
  const [profileFeedback, setProfileFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [storeFeedback, setStoreFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [profileUpdating, setProfileUpdating] = useState(false);
  const [storeUpdating, setStoreUpdating] = useState(false);

  const isGuest = !sessionToken;

  // Load stores to modify business specs
  const fetchStores = async () => {
    setLoadingStores(true);
    try {
      const res = await fetch('/api/stores');
      if (res.ok) {
        const list = await res.json();
        setStores(list);
        if (list.length > 0) {
          // pre-select first store matching user's email, or first store overall
          const emailMatch = list.find((s: any) => s.vendorEmail?.toLowerCase() === profileEmail.toLowerCase());
          const preselected = emailMatch || list[0];
          setSelectedStore(preselected);
          populateStoreForm(preselected);
        }
      }
    } catch (err) {
      console.error('Failed to query storefront structures:', err);
    } finally {
      setLoadingStores(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [profileEmail]);

  const populateStoreForm = (store: any) => {
    setBizName(store.name || '');
    setBizSubdomain(store.subdomain || '');
    setBizCurrency(store.currency || 'USD');
    setBizThemeColor(store.themeColor || '#0f765e');
    setBizVendorEmail(store.vendorEmail || '');
    setBizBankName(store.bankName || '');
    setBizBankAccountName(store.bankAccountName || '');
    setBizBankAccountNumber(store.bankAccountNumber || '');
    setBizBankBranchCode(store.bankBranchCode || '');
  };

  const handleSelectStoreChange = (storeId: string) => {
    const store = stores.find(s => s.id === storeId);
    if (store) {
      setSelectedStore(store);
      populateStoreForm(store);
      setStoreFeedback(null);
    }
  };

  // Profile submission
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionToken) return;

    setProfileUpdating(true);
    setProfileFeedback(null);

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: sessionToken,
          name: newName,
          phone: newPhone,
          pin: newPin || undefined
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // success update local storage
        localStorage.setItem('comfortmor_vendor_name', data.user.name);
        localStorage.setItem('comfortmor_vendor_phone', data.user.phone || '');
        setProfileName(data.user.name);
        setProfilePhone(data.user.phone || '');
        setNewPin('');
        setProfileFeedback({ type: 'success', text: 'Your personal vendor profile details were updated.' });
      } else {
        setProfileFeedback({ type: 'error', text: data.error || 'Failed to update user parameters.' });
      }
    } catch (err) {
      setProfileFeedback({ type: 'error', text: 'A network problem occurred client-side.' });
    } finally {
      setProfileUpdating(false);
    }
  };

  // Business submission
  const handleUpdateBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStore) {
      setStoreFeedback({ type: 'error', text: 'Please choose or build a storefront first to adjust attributes.' });
      return;
    }

    setStoreUpdating(true);
    setStoreFeedback(null);

    try {
      const res = await fetch(`/api/stores/${selectedStore.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: bizName,
          subdomain: bizSubdomain,
          vendorEmail: bizVendorEmail,
          themeColor: bizThemeColor,
          currency: bizCurrency,
          bankName: bizBankName,
          bankAccountName: bizBankAccountName,
          bankAccountNumber: bizBankAccountNumber,
          bankBranchCode: bizBankBranchCode
        })
      });

      const data = await res.json();
      if (res.ok) {
        setStoreFeedback({ type: 'success', text: 'Excellent! business parameters saved and synced with invoices.' });
        // update stores list cache
        setStores(prev => prev.map(s => s.id === selectedStore.id ? data : s));
        setSelectedStore(data);
        if (onStoreUpdated) {
          onStoreUpdated(data.subdomain);
        }
      } else {
        setStoreFeedback({ type: 'error', text: data.error || 'Could not update active business setup.' });
      }
    } catch (err) {
      setStoreFeedback({ type: 'error', text: 'Error contacting platform ledger APIs.' });
    } finally {
      setStoreUpdating(false);
    }
  };

  // Sign out
  const handleLogout = () => {
    localStorage.removeItem('comfortmor_vendor_name');
    localStorage.removeItem('comfortmor_vendor_email');
    localStorage.removeItem('comfortmor_vendor_phone');
    localStorage.removeItem('comfortmor_vendor_role');
    localStorage.removeItem('comfortmor_vendor_token');
    
    setSessionToken('');
    setProfileEmail('');
    setProfileName('');
    setProfilePhone('');
    
    onLogoutSuccess();
  };

  return (
    <div className="space-y-8 animate-fade-in" id="settings-view-workbench">
      
      {/* Page Header */}
      <div className="bg-[#111827] text-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-md relative overflow-hidden select-none">
        <div className="space-y-1.5 relative z-10">
          <h2 className="text-xl sm:text-2xl font-sans font-black tracking-tight uppercase flex items-center gap-2">
            ⚙️ Platform System Settings
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl font-medium leading-relaxed">
            Manage your personal merchant Profile credentials, fine-tune active digital e-commerce Business parameters, configure bank ledger targets, and manage your active web sessions safely.
          </p>
        </div>

        {!isGuest && (
          <button 
            onClick={handleLogout}
            className="bg-red-650 hover:bg-red-700 text-white font-sans font-black text-xs px-5 py-3 rounded-2xl flex items-center gap-2 transition-all cursor-pointer self-start md:self-center shadow-md shadow-red-950/20 active:scale-[0.98]"
            id="btn-settings-header-signout"
          >
            <LogOut className="w-4 h-4 text-white" /> Sign Out Session
          </button>
        )}
      </div>

      {/* Grid view containing forms */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Profile Card specs */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-7 space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-sans font-black uppercase text-slate-905 tracking-wider">Merchant Profile</h3>
              <p className="text-[10px] text-slate-400 font-semibold uppercase">Manage core profile details</p>
            </div>
          </div>

          {isGuest ? (
            <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl text-center space-y-3" id="settings-guest-alert">
              <Shield className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs font-bold text-slate-700 leading-normal">Session Currently Offline</p>
              <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                You are currently viewing active catalogues as an anonymous sandbox visitor. Navigate to the <b>Vendor Console Engine</b> to login or register a verified business account to unlock profiles.
              </p>
            </div>
          ) : (
            <form onSubmit={handleUpdateProfile} className="space-y-4 font-sans" id="profile-updating-form">
              
              <div className="bg-indigo-50/50 rounded-2xl p-4 border border-indigo-100 text-[11px] text-slate-700 space-y-2.5">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold uppercase">Role Permission:</span>
                  <span className="bg-indigo-650 text-white font-bold font-sans text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {profileRole}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold uppercase">Account ID Check:</span>
                  <span className="font-mono text-slate-900 font-bold select-all truncate max-w-[130px]">{profileEmail}</span>
                </div>
              </div>

              {profileFeedback && (
                <div className={`p-3.5 rounded-xl text-[11px] leading-relaxed font-medium border ${
                  profileFeedback.type === 'success' ? 'bg-emerald-50 text-emerald-805 border-emerald-200' : 'bg-rose-50 text-rose-805 border-rose-200'
                }`} id="profile-action-status-card">
                  {profileFeedback.text}
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-sans">Full Name / Display</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3.5 text-slate-400"><User className="w-4 h-4" /></span>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-xs focus:ring-1 focus:ring-indigo-500 outline-hidden font-sans text-slate-900"
                    placeholder="Merchant Display Name"
                    id="settings-profile-name-input"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-sans">Contact Phone Number</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3.5 text-slate-400"><Phone className="w-4 h-4" /></span>
                  <input
                    type="tel"
                    required
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-xs focus:ring-1 focus:ring-indigo-500 outline-hidden font-sans text-slate-900"
                    placeholder="+26377123456"
                    id="settings-profile-phone-input"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-sans">Change PIN Lock (6-Digits)</label>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wide">6 numeric digits Only</span>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-3.5 text-slate-400"><Key className="w-4 h-4" /></span>
                  <input
                    type="password"
                    maxLength={6}
                    pattern="\d*"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-xs focus:ring-1 focus:ring-indigo-500 outline-hidden font-mono text-slate-900"
                    placeholder="Leave empty keys to retain current PIN"
                    id="settings-profile-pin-input"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={profileUpdating}
                className="w-full bg-slate-900 hover:bg-black text-white py-3 px-4 rounded-xl text-xs font-sans font-black uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-40 select-none active:scale-[0.98]"
                id="btn-submit-profile-update"
              >
                {profileUpdating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Updating Profiler...
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5 text-yellow-550" /> Update Profile Settings
                  </>
                )}
              </button>

            </form>
          )}

          {!isGuest && (
            <div className="pt-4 border-t border-slate-100 text-[10px] text-slate-400 leading-relaxed font-sans font-semibold">
              <span className="text-[#111827] block font-extrabold uppercase mb-1">🛡️ Tenant Cryptography Status:</span>
              Your active authorization keys are backed by secure Local Storage and synced to standard REST memory states securely.
            </div>
          )}
        </div>

        {/* Business Settings and Bank routing specs */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-7 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-sans font-black uppercase text-slate-905 tracking-wider">Business Configurations</h3>
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Manage storefront attributes & settle parameters</p>
              </div>
            </div>

            {/* Storefront Selector dropdown */}
            {stores.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase text-slate-400 font-sans shrink-0">Select Store:</span>
                <select
                  value={selectedStore?.id || ''}
                  onChange={(e) => handleSelectStoreChange(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-sans font-bold focus:ring-1 focus:ring-emerald-500 text-slate-900 focus:outline-hidden"
                  id="settings-store-select-field"
                >
                  {stores.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.subdomain})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {stores.length === 0 ? (
            <div className="border border-dashed border-slate-200 p-8 rounded-2xl text-center text-slate-400 text-xs font-medium space-y-2">
              <p>No active businesses detected under your account.</p>
              <p className="text-[10px] text-slate-400 select-all font-semibold">Generate a new storefront first in the Vendor Console page!</p>
            </div>
          ) : (
            <form onSubmit={handleUpdateBusiness} className="space-y-6 text-slate-800" id="business-updating-form">
              
              {storeFeedback && (
                <div className={`p-3.5 rounded-xl text-[11px] leading-relaxed font-semibold border ${
                  storeFeedback.type === 'success' ? 'bg-emerald-50 text-emerald-805 border-emerald-200' : 'bg-rose-50 text-rose-885 border-rose-200'
                }`} id="business-action-status-card">
                  {storeFeedback.text}
                </div>
              )}

              {/* Attributes Section */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-indigo-650 uppercase tracking-widest font-sans border-b border-slate-100 pb-1.5">
                  1. Business Brand Identity & Routing
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">Business / Shop Name</label>
                    <input
                      type="text"
                      required
                      value={bizName}
                      onChange={(e) => setBizName(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:ring-1 focus:ring-emerald-500 outline-hidden font-sans text-slate-900"
                      placeholder="e.g. Apex Software Hub"
                      id="settings-biz-name-input"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">Store Domain Slug</label>
                      <span className="text-[9px] text-slate-400 font-semibold font-mono">comfortmor.com</span>
                    </div>
                    <div className="relative">
                      <span className="absolute left-3.5 top-3 text-slate-400"><Globe className="w-3.5 h-3.5" /></span>
                      <input
                        type="text"
                        required
                        value={bizSubdomain}
                        onChange={(e) => setBizSubdomain(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 text-xs focus:ring-1 focus:ring-emerald-500 font-mono outline-hidden text-slate-900"
                        placeholder="e.g. apex"
                        id="settings-biz-subdomain-input"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">Vendor Business Support Email</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-3 text-slate-400"><Mail className="w-4 h-4" /></span>
                      <input
                        type="email"
                        required
                        value={bizVendorEmail}
                        onChange={(e) => setBizVendorEmail(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 text-xs focus:ring-1 focus:ring-emerald-500 outline-hidden font-sans text-slate-900"
                        placeholder="billing@yourdomain.com"
                        id="settings-biz-email-input"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">Settle Currency</label>
                      <div className="relative">
                        <span className="absolute left-3 top-3.5 text-slate-400"><Coins className="w-3.5 h-3.5" /></span>
                        <select
                          value={bizCurrency}
                          onChange={(e) => setBizCurrency(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-2.5 py-2.5 text-xs font-sans font-bold focus:ring-1 focus:ring-emerald-500 outline-hidden text-slate-905"
                          id="settings-biz-currency-select"
                        >
                          <option value="USD">USD ($)</option>
                          <option value="ZAR">ZAR (R)</option>
                          <option value="ZiG">ZiG (ZiG)</option>
                          <option value="EUR">EUR (€)</option>
                          <option value="GBP">GBP (£)</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">Hex Color Brand</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={bizThemeColor}
                          onChange={(e) => setBizThemeColor(e.target.value)}
                          className="w-10 h-10 border border-slate-200 rounded-xl cursor-copy shrink-0 bg-transparent block"
                          id="settings-biz-color-picker"
                        />
                        <input
                          type="text"
                          maxLength={7}
                          value={bizThemeColor}
                          onChange={(e) => setBizThemeColor(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2.5 text-xs font-mono select-all focus:outline-hidden focus:ring-1 focus:ring-emerald-500 text-slate-900"
                          id="settings-biz-color-text"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Settle Bank route Section */}
              <div className="space-y-4">
                <div className="border-b border-slate-101 pb-1.5 flex items-center justify-between">
                  <h4 className="text-[10px] font-black text-indigo-650 uppercase tracking-widest font-sans flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5 text-emerald-500" /> 2. Bank Ledger Settlement Spec (Offline Transfers)
                  </h4>
                  <span className="text-[9px] font-black bg-emerald-50 text-emerald-805 px-2 py-0.5 rounded border border-emerald-100 uppercase tracking-wider font-sans">
                    Zimbabwe Banking Network
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-semibold leading-relaxed font-sans mt-1">
                  When clients purchase your assets via offline bank transfer, Comfort MoR presents these banking credentials on checkouts. Simulating verification updates these parameters correctly.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">Financial Bank Institution</label>
                    <input
                      type="text"
                      value={bizBankName}
                      onChange={(e) => setBizBankName(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:ring-1 focus:ring-emerald-500 outline-hidden font-sans text-slate-900"
                      placeholder="e.g. CABS Bank Zimbabwe"
                      id="settings-bank-name-input"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">Account Beneficiary Title</label>
                    <input
                      type="text"
                      value={bizBankAccountName}
                      onChange={(e) => setBizBankAccountName(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:ring-1 focus:ring-emerald-500 outline-hidden font-sans text-slate-900"
                      placeholder="e.g. Apex Creative Group Ltd"
                      id="settings-bank-account-name-input"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">Account Routing Number</label>
                    <input
                      type="text"
                      value={bizBankAccountNumber}
                      onChange={(e) => setBizBankAccountNumber(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:ring-1 focus:ring-emerald-500 font-mono outline-hidden text-slate-900"
                      placeholder="e.g. 1007890123"
                      id="settings-bank-number-input"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">Branch / Swift Code</label>
                    <input
                      type="text"
                      value={bizBankBranchCode}
                      onChange={(e) => setBizBankBranchCode(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:ring-1 focus:ring-emerald-500 font-mono outline-hidden text-slate-900"
                      placeholder="e.g. CABZW21"
                      id="settings-bank-branch-input"
                    />
                  </div>
                </div>
              </div>

              {/* Form trigger submission */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={storeUpdating}
                  className="bg-emerald-650 hover:bg-emerald-700 text-white text-xs font-sans font-black uppercase py-4 px-6 rounded-2xl transition-all shadow-md cursor-pointer inline-flex items-center gap-1.5 active:scale-[0.98] disabled:opacity-50 select-none"
                  id="btn-settings-save-business-specs"
                  style={{ backgroundColor: bizThemeColor }}
                >
                  {storeUpdating ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Syncing Settle Settings...
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5 text-white" /> Save Business Configurations
                    </>
                  )}
                </button>
              </div>

            </form>
          )}

        </div>

      </div>

    </div>
  );
}
