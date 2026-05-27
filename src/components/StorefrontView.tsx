/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  CreditCard, 
  ChevronRight, 
  Loader2, 
  Sparkles, 
  CheckCircle, 
  Phone, 
  Lock, 
  Download,
  DollarSign,
  Upload,
  Building2
} from 'lucide-react';
import { Store, Product } from '../types';

interface StorefrontViewProps {
  subdomain: string;
}

export default function StorefrontView({ subdomain }: StorefrontViewProps) {
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selected Product inside Checkout overlay
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [customPriceVal, setCustomPriceVal] = useState<string>('');
  
  // Checkout process fields
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [paymentGateway, setPaymentGateway] = useState<'ecocash' | 'innbucks' | 'omari' | 'paynow' | 'bank_transfer'>('ecocash');
  const [phone, setPhone] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutResponse, setCheckoutResponse] = useState<any | null>(null);
  const [simulatingPaymentApprove, setSimulatingPaymentApprove] = useState(false);
  const [paymentApproved, setPaymentApproved] = useState<any | null>(null);
  const [simulatedEmails, setSimulatedEmails] = useState<any[]>([]);

  useEffect(() => {
    if (paymentApproved && buyerEmail) {
      fetch(`/api/debug/emails?email=${encodeURIComponent(buyerEmail)}`)
        .then(res => res.json())
        .then(data => setSimulatedEmails(data))
        .catch(err => console.error('Simulated emails fetch error:', err));
    } else {
      setSimulatedEmails([]);
    }
  }, [paymentApproved, buyerEmail]);

  // New bank transfer fields
  const [bankTxCode, setBankTxCode] = useState('');
  const [bankScreenshot, setBankScreenshot] = useState<File | null>(null);
  const [screenshotPreviewUrl, setScreenshotPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!bankScreenshot) {
      setScreenshotPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(bankScreenshot);
    setScreenshotPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [bankScreenshot]);

  // Load tenant storefront assets from Server based on active Subdomain
  useEffect(() => {
    fetchStorefront();
  }, [subdomain]);

  const fetchStorefront = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch(`/api/stores/resolve/${subdomain}`);
      if (!resp.ok) {
        throw new Error('Tenant storefront subdomain offline or invalid.');
      }
      const storeData: Store = await resp.json();
      setStore(storeData);

      // Load products for this store
      const prodResp = await fetch(`/api/stores/${storeData.id}/products`);
      const prodList: Product[] = await prodResp.json();
      setProducts(prodList);
    } catch (err: any) {
      setError(err.message || 'Error loading store environment.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCheckout = (product: Product) => {
    setSelectedProduct(product);
    setCustomPriceVal(product.price.toString());
    setCheckoutResponse(null);
    setPaymentApproved(null);
    setBankTxCode('');
    setBankScreenshot(null);
  };

  const handleCreateCheckoutTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !buyerEmail) return;

    setCheckoutLoading(true);
    try {
      // Build visual FormData payload for physical proof-of-transfer uploads
      const formData = new FormData();
      formData.append('storeId', store?.id || '');
      formData.append('productId', selectedProduct.id);
      formData.append('buyerEmail', buyerEmail);
      formData.append('buyerName', buyerName);
      formData.append('paymentGateway', paymentGateway);
      
      if (paymentGateway === 'ecocash' || paymentGateway === 'omari') {
        formData.append('phone', phone);
      }
      if (selectedProduct.priceType === 'pwyw') {
        formData.append('customPrice', customPriceVal);
      }
      if (paymentGateway === 'bank_transfer') {
        if (!bankTxCode) {
          throw new Error('Please input the transaction confirmation reference code.');
        }
        formData.append('bankTxCode', bankTxCode);
        if (bankScreenshot) {
          formData.append('bankScreenshot', bankScreenshot);
        }
      }

      const res = await fetch('/api/checkout', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to trigger checkout authorization.');
      }

      setCheckoutResponse(data);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setCheckoutLoading(false);
    }
  };

  // Immediate simulation of the MoR callback webhook for testing the backend architecture
  const handleSimulateApproval = async () => {
    if (!checkoutResponse) return;
    setSimulatingPaymentApprove(true);
    try {
      const res = await fetch(`/api/orders/approve/${checkoutResponse.orderId}`, {
        method: 'POST'
      });
      const data = await res.json();
      
      setPaymentApproved(data.order);
    } catch (err) {
      alert('Simulation error.');
    } finally {
      setSimulatingPaymentApprove(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-2" id="storefront-loader">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-sm font-medium text-slate-500 font-sans">Resolving Multi-Tenant Assets...</p>
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="py-16 text-center max-w-sm mx-auto space-y-3" id="storefront-error">
        <div className="bg-red-50 text-red-650 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
          <ShoppingBag className="w-6 h-6" />
        </div>
        <h3 className="font-sans font-semibold text-slate-900 text-sm">Tenant Inactive</h3>
        <p className="text-xs text-slate-550 leading-relaxed">{error || 'This storefront does not exist or has been disabled.'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8" id="storefront-client-root" style={{ '--store-color': store.themeColor } as React.CSSProperties}>
      {/* Brand Hero Cover */}
      <div 
        className="relative rounded-3xl p-10 md:p-14 text-white overflow-hidden shadow-sm border border-slate-100"
        style={{ backgroundColor: '#111827' }}
        id="storefront-hero"
      >
        <div className="absolute right-0 top-0 w-48 h-48 bg-radial from-indigo-500/20 to-transparent blur-xl pointer-events-none"></div>
        <div className="absolute left-1/4 top-1/2 w-72 h-72 bg-radial from-yellow-400/10 to-transparent blur-2xl pointer-events-none"></div>
        
        <div className="relative z-10 max-w-xl space-y-4">
          <span className="bg-white/10 text-white/90 text-[10px] px-3 py-1 rounded-full font-mono font-bold tracking-wider uppercase border border-white/15 inline-flex items-center gap-1.5 animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" /> Mobile Optimized Storefront
          </span>
          <div className="flex items-center gap-3">
            <div className="w-4.5 h-4.5 rounded-full" style={{ backgroundColor: store.themeColor }}></div>
            <h2 className="text-2xl md:text-3.5xl font-sans font-black tracking-tight text-white">{store.name}</h2>
          </div>
          <p className="text-slate-350 text-xs md:text-sm leading-relaxed max-w-lg">
            Welcome to our digital storefront. Payments are compliance-guarded and processed securely through our global Merchant of Record (MoR) network.
          </p>
        </div>
      </div>

      {/* Catalog items grid */}
      <div className="space-y-5">
        <h3 className="font-sans font-black text-[#111827] text-sm tracking-tight">Available Digital Solutions & SaaS Plans</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="storefront-grid">
          {products.map(product => (
            <div 
              key={product.id} 
              className="bg-white rounded-3xl border border-slate-105 flex flex-col justify-between hover:border-slate-300 hover:shadow-md transition-all duration-300 overflow-hidden"
              id={`storefront-product-${product.id}`}
            >
              {/* Product Card Image/Gradient Hero Header */}
              <div className="relative h-48 w-full overflow-hidden bg-slate-50 border-b border-slate-100">
                {product.mediaFile ? (
                  <img 
                    src={`/uploads/${product.mediaFile}`} 
                    alt={product.name} 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className={`w-full h-full flex flex-col items-center justify-center p-6 text-center select-none ${
                    product.type === 'subscription' 
                      ? 'bg-gradient-to-br from-indigo-500 to-indigo-805 text-white' 
                      : product.type === 'download' 
                      ? 'bg-gradient-to-br from-emerald-500 to-emerald-805 text-white' 
                      : 'bg-gradient-to-br from-rose-500 to-rose-805 text-white'
                  }`}>
                    {product.type === 'subscription' ? (
                      <>
                        <span className="text-[10px] font-sans font-black tracking-widest uppercase bg-white/20 px-3 py-1 rounded-full mb-2">SaaS RECURRING MEMBERSHIP</span>
                        <p className="text-sm font-sans font-black opacity-80">Software Access & API Endpoint License</p>
                      </>
                    ) : product.type === 'download' ? (
                      <>
                        <span className="text-[10px] font-sans font-black tracking-widest uppercase bg-white/20 px-3 py-1 rounded-full mb-2">DIGITAL DOWNLOAD ASSET</span>
                        <p className="text-sm font-sans font-black opacity-80">Downloadable eBook, PDF, or Template Package</p>
                      </>
                    ) : (
                      <>
                        <span className="text-[10px] font-sans font-black tracking-widest uppercase bg-white/20 px-3 py-1 rounded-full mb-2 font-sans">BUNDLED SOURCE PACK</span>
                        <p className="text-sm font-sans font-black opacity-80 font-sans">Multi-file Complete Creator Bundle SKU</p>
                      </>
                    )}
                  </div>
                )}
                
                {/* Floating tags */}
                <div className="absolute top-4 left-4 flex gap-1.5 flex-wrap">
                  <span className="text-[10px] font-sans font-black px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white border border-white/10 capitalize shadow-xs">
                    {product.type}
                  </span>
                  {product.licenseEnabled && (
                    <span className="text-[10px] font-sans font-black px-3 py-1 rounded-full bg-emerald-600/90 backdrop-blur-md text-white border border-emerald-500/30 inline-flex items-center gap-1 shadow-xs">
                      <Lock className="w-2.5 h-2.5" /> License Key Included
                    </span>
                  )}
                </div>
              </div>

              {/* Product Content Details */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h4 className="font-sans font-black text-[#111827] text-lg tracking-tight line-clamp-1">{product.name}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-sans line-clamp-3">{product.description}</p>
                </div>

                {/* Secure Price and checkout trigger buttons */}
                <div className="flex items-center justify-between border-t border-slate-100 pt-5">
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold font-mono block uppercase tracking-wider">
                      {product.priceType === 'pwyw' ? 'Pay What You Want' : 'Price'}
                    </span>
                    <p className="text-xl font-sans font-black text-[#111827]">
                      {product.priceType === 'pwyw' ? 'From ' : ''}
                      {store.currency} {product.price.toFixed(2)}
                      {product.type === 'subscription' && <span className="text-[10px] text-slate-400 font-normal">/{product.billingInterval}</span>}
                    </p>
                  </div>

                  <button
                    onClick={() => handleOpenCheckout(product)}
                    className="text-yellow-400 font-sans font-black text-xs px-5 py-3 rounded-xl transition-all inline-flex items-center gap-1.5 shadow-xs cursor-pointer hover:bg-slate-800"
                    style={{ backgroundColor: '#111827' }}
                    id={`btn-buy-product-${product.id}`}
                  >
                    Purchase Access <ChevronRight className="w-4 h-4 text-yellow-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <div className="text-center py-6 border-t border-slate-100 text-[10px] text-slate-400 font-sans mt-8 flex flex-col md:flex-row items-center justify-between gap-3">
        <p>© 2026 {store.name}. Secure end-to-end multi-tenant delivery ledger.</p>
        <p className="flex items-center gap-1.5 font-bold text-slate-500 font-sans">
          <CreditCard className="w-4 h-4 text-indigo-500" /> Covered by regional Merchant of Record software billing compliance
        </p>
      </div>

      {/* EMBEDDED CHECKOUT FLOW OVERLAY */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl max-w-md w-full overflow-hidden p-8 space-y-6" id="checkout-overlay-modal">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-sans font-black text-indigo-600 uppercase tracking-widest block">SECURE GATEWAY</span>
                <h3 className="text-base font-sans font-black text-[#111827]">{store.name} Checkout</h3>
              </div>
              <button 
                onClick={() => setSelectedProduct(null)} 
                className="bg-slate-700 hover:bg-slate-800 text-white font-sans font-extrabold text-xs px-3.5 py-1.5 rounded-xl transition-all cursor-pointer shadow-xs inline-flex items-center gap-1"
                id="btn-checkout-modal-back"
              >
                ← Back
              </button>
            </div>

            {/* Product recap */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
              <span className="text-[9px] font-sans font-extrabold uppercase bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full inline-block">
                Purchasing digital access
              </span>
              <p className="text-xs font-sans font-black text-[#111827]">{selectedProduct.name}</p>
            </div>

            {!checkoutResponse ? (
              // STEP 1: Billing Form
              <form onSubmit={handleCreateCheckoutTransaction} className="space-y-4">
                
                {/* Pay what you want interactive input */}
                {selectedProduct.priceType === 'pwyw' && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-sans flex justify-between">
                      <span>Specify Contribution:</span>
                      <span className="font-extrabold text-[#111827]">Min: {store.currency} {selectedProduct.minPrice}</span>
                    </label>
                    <div className="flex items-center">
                      <span className="bg-slate-50 border border-slate-200 px-3.5 py-3 rounded-l-xl text-xs font-bold font-mono text-slate-500">
                        {store.currency}
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        required
                        min={selectedProduct.minPrice}
                        value={customPriceVal}
                        onChange={(e) => setCustomPriceVal(e.target.value)}
                        className="w-full border border-slate-200 border-l-0 rounded-r-xl p-3 text-xs font-bold font-mono focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                        id="checkout-pwyw-custom-entry-font-mono"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-sans">Your Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sally Designer"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-3 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-hidden font-sans"
                    id="checkout-buyer-name"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-sans">Your Email (Delivers files & code)</label>
                  <input
                    type="email"
                    required
                    placeholder="sally.designer@dribbble.com"
                    value={buyerEmail}
                    onChange={(e) => setBuyerEmail(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-3 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-hidden font-sans"
                    id="checkout-buyer-email"
                  />
                </div>
                {/* Highly Modularized Regional System selection */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-sans">Southern African Payment Method</label>
                  <div className="grid grid-cols-2 gap-2" id="gateway-selector-grid">
                    <button
                      type="button"
                      onClick={() => setPaymentGateway('ecocash')}
                      className={`p-3 rounded-xl border text-xs transition-all cursor-pointer ${
                        paymentGateway === 'ecocash'
                          ? 'border-indigo-600 bg-indigo-50/30 text-indigo-950 font-extrabold focus:outline-hidden shadow-xs'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-500 font-bold'
                      }`}
                    >
                      🟢 EcoCash Mobile
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentGateway('innbucks')}
                      className={`p-3 rounded-xl border text-xs transition-all cursor-pointer ${
                        paymentGateway === 'innbucks'
                          ? 'border-indigo-600 bg-indigo-50/30 text-indigo-950 font-extrabold focus:outline-hidden shadow-xs'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-500 font-bold'
                      }`}
                    >
                      🔵 Innbucks Voucher
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentGateway('omari')}
                      className={`p-3 rounded-xl border text-xs transition-all cursor-pointer ${
                        paymentGateway === 'omari'
                          ? 'border-indigo-600 bg-indigo-50/30 text-indigo-950 font-extrabold focus:outline-hidden shadow-xs'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-500 font-bold'
                      }`}
                    >
                      🔴 Omari Wallet
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentGateway('paynow')}
                      className={`p-3 rounded-xl border text-xs transition-all cursor-pointer ${
                        paymentGateway === 'paynow'
                          ? 'border-indigo-600 bg-indigo-50/30 text-indigo-950 font-extrabold focus:outline-hidden shadow-xs'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-500 font-bold'
                      }`}
                    >
                      🟡 Paynow Portal
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentGateway('bank_transfer')}
                      className={`p-3 rounded-xl border text-xs transition-all cursor-pointer col-span-2 ${
                        paymentGateway === 'bank_transfer'
                          ? 'border-indigo-600 bg-indigo-50/30 text-indigo-950 font-extrabold focus:outline-hidden shadow-xs'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-500 font-bold'
                      }`}
                      id="gateway-selector-bank-transfer"
                    >
                      🏦 Direct Bank Transfer
                    </button>
                  </div>
                </div>

                {/* Bank Transfer Information & Inputs */}
                {paymentGateway === 'bank_transfer' && (
                  <div className="space-y-4 border-t border-slate-100 pt-4" id="bank-transfer-form-area">
                    {/* Render Bank Account details */}
                    <div className="bg-indigo-50/70 border border-indigo-100 p-4 rounded-2xl space-y-2.5 font-sans">
                      <span className="text-[10px] font-sans font-black text-indigo-900 uppercase tracking-wider flex items-center gap-1 leading-none">
                        <Building2 className="w-3.5 h-3.5 shrink-0" /> OFFICIAL MERCHANT BANK ACCOUNT
                      </span>
                      <div className="grid grid-cols-2 gap-y-2 text-xs">
                        <div>
                          <span className="text-[9px] text-slate-400 block font-bold uppercase">Bank Name</span>
                          <span className="font-extrabold text-slate-900">{store.bankName || 'Steward Bank Zimbabwe'}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 block font-bold uppercase">Account Name</span>
                          <span className="font-extrabold text-slate-900">{store.bankAccountName || store.name}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-[9px] text-slate-400 block font-bold uppercase">Account Number</span>
                          <span className="font-mono font-black text-slate-900 bg-white px-2 py-1 rounded-lg border border-indigo-105 inline-block select-all mt-0.5 tracking-wider font-extrabold">{store.bankAccountNumber || '10029384729'}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 block font-bold uppercase">Branch Code</span>
                          <span className="font-mono font-bold text-slate-700">{store.bankBranchCode || 'SWB-042'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Transaction Reference input */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-sans">
                        Transaction Reference / Confirmation Code
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. BRN-901239841"
                        value={bankTxCode}
                        onChange={(e) => setBankTxCode(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl p-3 text-xs font-mono focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                        id="checkout-bank-ref-code"
                      />
                    </div>

                    {/* Image Screenshot selection & drag-drop */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-sans">
                        Screenshot Proof of Transfer (Optional)
                      </label>
                      <div 
                        className="border-2 border-dashed border-slate-200 hover:border-indigo-400 transition-all rounded-2xl p-4 text-center cursor-pointer relative bg-slate-50/50"
                        onClick={() => document.getElementById('checkout-bank-screenshot-input')?.click()}
                      >
                        <input
                          type="file"
                          id="checkout-bank-screenshot-input"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setBankScreenshot(e.target.files[0]);
                            }
                          }}
                        />
                        {screenshotPreviewUrl ? (
                          <div className="space-y-2">
                            <span className="text-[9px] font-sans font-black bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full inline-block uppercase">Screenshot attached</span>
                            <img 
                              src={screenshotPreviewUrl} 
                              alt="Screenshot Preview" 
                              className="max-h-24 mx-auto rounded-lg border border-slate-200 shadow-xs" 
                              referrerPolicy="no-referrer"
                            />
                            <p className="text-[9px] text-slate-500 font-mono tracking-tight animate-fade-in">{bankScreenshot?.name}</p>
                          </div>
                        ) : (
                          <div className="space-y-1.5 py-1">
                            <Upload className="w-5 h-5 text-slate-400 mx-auto shrink-0" />
                            <p className="text-[11px] text-slate-500 font-sans font-extrabold">Upload or drop transfer receipt</p>
                            <p className="text-[9px] text-slate-400 font-sans">PNG, JPG or JPEG up to 50MB</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* EcoCash / Omari direct phone prompts */}
                {(paymentGateway === 'ecocash' || paymentGateway === 'omari') && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-sans">
                      {paymentGateway === 'ecocash' ? 'Econet Zimbabwe' : 'Cassava Omari'} Phone (Triggers Push Prompt)
                    </label>
                    <div className="flex items-center">
                      <span className="bg-slate-50 border border-slate-200 px-3 py-3 rounded-l-xl text-xs font-mono text-slate-500">
                        <Phone className="w-4 h-4 text-slate-400" />
                      </span>
                      <input
                        type="text"
                        required
                        placeholder="0771234567 or 0781234567"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full border border-slate-200 border-l-0 rounded-r-xl p-3 text-xs font-mono focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                        id="checkout-buyer-phone"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 font-sans mt-2">
                      Secure USSD push trigger instantly calls Cassava billing verification to approve balance transfer.
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={checkoutLoading}
                  className="w-full bg-[#111827] hover:bg-slate-800 text-yellow-405 font-sans font-extrabold text-xs py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
                  id="checkout-submit-btn"
                >
                  {checkoutLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Verifying ledger limits...
                    </>
                  ) : (
                    `Authorize SECURELY • ${store.currency} ${
                      selectedProduct.priceType === 'pwyw' ? parseFloat(customPriceVal || '0').toFixed(2) : selectedProduct.price.toFixed(2)
                    }`
                  )}
                </button>
              </form>
            ) : (
              // STEP 2: Payment Action triggered & waiting callback
              <div className="space-y-5 animate-fade-in" id="checkout-ussd-challenge-area">
                <div className="bg-amber-50 border border-amber-200/60 rounded-2xl p-5 space-y-2 text-xs text-amber-900 font-sans">
                  <span className="bg-amber-100 font-mono text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wide inline-block">
                    {paymentGateway.toUpperCase()} GATEWAY INSTRUCTION TRIGGER
                  </span>
                  <p className="font-semibold leading-relaxed">
                    {checkoutResponse.checkoutOverlayInstructions}
                  </p>
                  <p className="font-mono text-[10px] text-amber-700">
                    STATUS REFERENCE: {checkoutResponse.paymentResult.transactionId}
                  </p>
                </div>

                {paymentApproved ? (
                  // Purchase complete - High-contrast deliverable focal point
                  <div className="space-y-4 animate-fade-in" id="purchase-completed-report">
                    <div className="bg-emerald-550 text-white rounded-3xl p-6 space-y-5 text-xs font-sans shadow-lg relative overflow-hidden" style={{ backgroundColor: '#059669' }}>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-emerald-200 shrink-0" />
                        <span className="font-sans font-black tracking-widest uppercase text-[11px] text-emerald-100">Deliverable Ready</span>
                      </div>

                      {/* CASE 1: Download / eBook deliverable button is the ultimate focal point */}
                      {(selectedProduct.type === 'download' || selectedProduct.type === 'bundle') && paymentApproved.downloadToken ? (
                        <div className="space-y-4" id="checkout-direct-download-area">
                          <h4 className="text-base font-sans font-black text-white leading-tight">
                            Your eBook / Asset files are processed. Start downloading your file below:
                          </h4>
                          
                          <a
                            href={`/api/download/${paymentApproved.downloadToken}`}
                            target="_blank"
                            rel="noreferrer"
                            className="w-full bg-[#111827] hover:bg-black text-yellow-405 text-sm font-sans font-black py-4 px-4 rounded-xl transition-all inline-flex items-center justify-center gap-2.5 shadow-md cursor-pointer select-none hover:scale-[1.02] active:scale-[0.98]"
                            id="checkout-direct-download-action"
                          >
                            <Download className="w-5 h-5 text-yellow-400 animate-bounce" /> Click to Download {selectedProduct.name} (.zip/.pdf)
                          </a>

                          <div className="bg-emerald-800/60 p-4 rounded-2xl border border-emerald-700/30 text-[11px] text-emerald-50 leading-relaxed font-semibold">
                            🤝 <b>Dispatched to Inbox:</b> Your official purchase receipt, order invoice, and alternative backup product download link have been sent to <b>{buyerEmail}</b>.
                          </div>
                        </div>
                      ) : null}

                      {/* CASE 2: Subscription - License Activation is the ultimate focal point */}
                      {selectedProduct.type === 'subscription' && paymentApproved.licenseKeyCreated ? (
                        <div className="space-y-4" id="checkout-subscription-key-area">
                          <h4 className="text-base font-sans font-black text-white leading-tight">
                            Subscription Activated! Here is your secure SaaS login and integration key:
                          </h4>

                          <div className="bg-white border border-emerald-200 p-5 rounded-2xl space-y-1.5 shadow-inner">
                            <span className="text-[9px] font-sans font-black text-emerald-800 uppercase tracking-widest block text-center">🔐 SECURE SUBSCRIPTION ACTIVATION KEY</span>
                            <code className="bg-slate-100 p-3 rounded-xl text-slate-900 font-mono font-black text-sm select-all block text-center border border-slate-250 tracking-wider">
                              {paymentApproved.licenseKeyCreated}
                            </code>
                          </div>

                          <div className="bg-emerald-800/60 p-4 rounded-2xl border border-emerald-700/30 text-[11px] text-emerald-50 leading-relaxed font-semibold">
                            🧾 <b>Dispatched to Inbox:</b> Your official payment receipt, SaaS subscription key, and VAT invoice details have been sent to <b>{buyerEmail}</b>.
                          </div>
                        </div>
                      ) : null}

                      <div className="text-center pt-3 border-t border-emerald-600/30">
                        <button
                          onClick={() => setSelectedProduct(null)}
                          className="text-xs text-white hover:text-yellow-250 font-sans font-black underline cursor-pointer"
                        >
                          Return to Storefront catalog
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Waiting verification simulation action
                  <div className="space-y-4 pt-2 border-t border-slate-100">
                    {paymentGateway === 'bank_transfer' ? (
                      <div className="bg-amber-50/50 border border-amber-200 p-4 rounded-2xl space-y-2 text-xs font-sans text-amber-900">
                        <span className="font-bold text-[10px] uppercase block bg-amber-100 px-2 py-0.5 rounded text-amber-800 tracking-wide font-extrabold w-max">AWAITING BACKOFFICE REVIEW</span>
                        <p className="leading-relaxed font-medium">
                          The screenshot proof and transaction reference code <code className="font-mono bg-white border border-amber-200 px-1 py-0.5 rounded font-bold text-slate-850 select-all">{bankTxCode}</code> have been dispatched to the seller's backoffice dashboard.
                        </p>
                        <p className="font-medium text-[11px] text-amber-700 leading-relaxed">
                          Please toggle to the <b>Vendor Dashboard</b> tab in the navbar, find your store, inspect the new pending bank transfer inside the <b>Bank Transfers</b> list, and click <b>"Verify Payment"</b>. This simulates a live bank ledger audit. Once verified, the software key generates and the download link unlocks!
                        </p>
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() => setCheckoutResponse(null)}
                            className="w-full bg-[#111827] hover:bg-slate-800 text-white font-sans text-xs font-black py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs border border-slate-700"
                            style={{ color: '#ffffff' }}
                            id="btn-bank-checkout-go-back"
                          >
                            ← Back to Billing Details
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-center p-4">
                          <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
                          <span className="text-xs text-slate-500 font-medium font-sans ml-2.5">Awaiting regional callback status payload...</span>
                        </div>

                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center" id="payment-test-simulator-box">
                          <p className="text-[10px] text-slate-400 font-bold font-sans uppercase mb-2">Architect Sandbox Dial Action:</p>
                          <button
                            type="button"
                            onClick={handleSimulateApproval}
                            disabled={simulatingPaymentApprove}
                            className="w-full bg-[#111827] hover:bg-slate-800 text-yellow-405 text-xs font-sans font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-1 shadow-sm cursor-pointer mb-3.5"
                            id="btn-simulate-checkout-approval"
                          >
                            {simulatingPaymentApprove ? (
                              'Approving...'
                            ) : (
                              'Dial PIN / Approve Push Notification Simulation'
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => setCheckoutResponse(null)}
                            className="w-full bg-[#4B5563] hover:bg-slate-800 text-white font-sans text-xs font-black py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs border border-slate-600"
                            style={{ color: '#ffffff' }}
                            id="btn-eco-checkout-go-back"
                          >
                            ← Go Back & Change Method
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
