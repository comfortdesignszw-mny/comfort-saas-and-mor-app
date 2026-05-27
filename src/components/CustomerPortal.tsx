/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  User, 
  Search, 
  Download, 
  Key, 
  Loader2, 
  Check, 
  X, 
  AlertCircle,
  HelpCircle,
  Calendar,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { Order, Subscription } from '../types';

export default function CustomerPortal() {
  const [email, setEmail] = useState('john.dev@github.com'); // Pre-fill with seeded subscription user for easy sandbox testing
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [simulatedEmails, setSimulatedEmails] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSearchBuyerRecords = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setSearching(true);
    setHasSearched(true);
    setFeedback(null);
    try {
      // 1. Fetch Orders matching email
      const ordResp = await fetch(`/api/customer/orders?email=${encodeURIComponent(email.trim())}`);
      const ordData = await ordResp.json();
      setOrders(ordData);

      // 2. Fetch Subscriptions matching email
      const subResp = await fetch(`/api/customer/subscriptions?email=${encodeURIComponent(email.trim())}`);
      const subData = await subResp.json();
      setSubscriptions(subData);

      // 3. Fetch Simulated Emails
      const emailResp = await fetch(`/api/debug/emails?email=${encodeURIComponent(email.trim())}`);
      const emailData = await emailResp.json();
      setSimulatedEmails(emailData);
    } catch (err) {
      setFeedback({ type: 'error', text: 'Error querying customer portal database records.' });
    } finally {
      setSearching(false);
    }
  };

  const handleCancelSubscription = async (subId: string) => {
    try {
      const res = await fetch('/api/customer/subscriptions/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId: subId })
      });
      const data = await res.json();
      setFeedback({ type: 'success', text: `Recurring subscription suspended. ${data.message}` });
      
      // Refresh list
      const subResp = await fetch(`/api/customer/subscriptions?email=${encodeURIComponent(email.trim())}`);
      const subData = await subResp.json();
      setSubscriptions(subData);
    } catch (err) {
      setFeedback({ type: 'error', text: 'Failed to request subscription suspension.' });
    }
  };

  return (
    <div className="space-y-6" id="customer-portal-root">
      
      {/* Introduction Banner header */}
      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-5">
        <div className="flex items-center gap-4">
          <div className="bg-[#111827] text-yellow-400 p-3 rounded-2xl">
            <User className="w-6 h-6 text-yellow-400" />
          </div>
          <div>
            <span className="text-[10px] text-slate-450 font-bold font-sans uppercase tracking-wider block">End-Buyer Self-Service</span>
            <h2 className="text-xl font-sans font-black text-[#111827] tracking-tight">Credentials & Licensing Vault</h2>
          </div>
        </div>
        <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
          Access your digital solutions purchased across stores processed securely on our Merchant of Record networks. Re-download compressed media files, copy license keys, and suspend active SaaS memberships instantly.
        </p>

        {/* Email lookup form */}
        <form onSubmit={handleSearchBuyerRecords} className="flex flex-col sm:flex-row gap-3 pt-2">
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-3.5 text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="email"
              required
              placeholder="Enter your customer billing email Address..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
              id="portal-email-input"
            />
          </div>
          <button
            type="submit"
            disabled={searching}
            className="bg-[#111827] hover:bg-slate-800 text-yellow-400 font-sans font-extrabold px-6 py-3.5 rounded-xl transition-all inline-flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-sm"
            id="btn-portal-lookup"
          >
            {searching ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Retrieving...
              </>
            ) : (
              'Access Licensing Vault'
            )}
          </button>
        </form>

        <p className="text-[10px] text-slate-400 font-sans">
          💡 Demo Sandbox Quick-Check: Query <span className="font-sans font-bold underline text-indigo-600 select-all">john.dev@github.com</span> to inspect active licenses and cancel SaaS subscriptions.
        </p>
      </div>

      {feedback && (
        <div 
          className={`p-4 rounded-2xl text-xs font-sans border flex items-center gap-2.5 ${
            feedback.type === 'success' 
              ? 'bg-emerald-50 border-emerald-100 text-emerald-800 font-bold' 
              : 'bg-red-50 border-red-150 text-red-850 font-bold'
          }`}
          id="portal-feedback-banner"
        >
          <AlertCircle className="w-5 h-5" />
          {feedback.text}
        </div>
      )}

      {hasSearched && !searching && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="portal-results-layout">
          
          {/* Active SaaS Subsubscriptions */}
          <div className="space-y-4">
            <h3 className="font-sans font-black text-[#111827] text-sm tracking-tight flex items-center gap-1.5 pb-1">
              <span className="w-1.5 h-3 bg-indigo-505 rounded-full" style={{ backgroundColor: '#111827' }}></span> Active SaaS Subscriptions
            </h3>

            {subscriptions.length === 0 ? (
              <div className="bg-white border border-slate-100 p-8 rounded-3xl text-center text-xs text-slate-400 font-sans">
                No active SaaS subscriptions found linked to this email address.
              </div>
            ) : (
              subscriptions.map(sub => (
                <div key={sub.id} className="bg-white border border-slate-100 rounded-3xl p-6 space-y-4 shadow-sm" id={`sub-card-${sub.id}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-sans font-extrabold text-[#111827] text-sm tracking-tight">{sub.productName}</h4>
                      <p className="text-[9px] text-slate-400 font-mono mt-0.5 uppercase tracking-wide">ID: {sub.id}</p>
                    </div>

                    <span className={`text-[10px] font-sans font-black px-2.5 py-1 rounded-full border ${
                      sub.status === 'active'
                        ? 'bg-emerald-50 text-emerald-850 border-emerald-250'
                        : 'bg-amber-50 text-amber-850 border-amber-250'
                    }`}>
                      {sub.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 border-y border-slate-100 py-4 text-xs font-sans">
                    <div>
                      <span className="text-[9px] text-slate-400 font-bold font-mono block uppercase">Billing Cycle</span>
                      <span className="font-semibold text-slate-800 capitalize">Billed {sub.billingInterval}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 font-bold font-mono block uppercase">Renewal Amount</span>
                      <span className="font-semibold text-slate-800 font-sans">USD {sub.amount.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-[10px] text-slate-450 font-mono font-bold">
                      Next Period Charge: {new Date(sub.nextBillingDate).toLocaleDateString()}
                    </span>

                    {sub.status === 'active' && (
                      <button
                        onClick={() => handleCancelSubscription(sub.id)}
                        className="text-red-655 hover:bg-red-50 hover:text-red-700 px-3.5 py-1.5 rounded-xl border border-red-200 text-xs font-sans font-extrabold transition-all cursor-pointer"
                        id={`btn-cancel-sub-${sub.id}`}
                      >
                        Suspend SaaS Billing
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Purchased Digital Downloads Ledger */}
          <div className="space-y-4">
            <h3 className="font-sans font-black text-[#111827] text-sm tracking-tight flex items-center gap-1.5 pb-1">
              <span className="w-1.5 h-3 bg-indigo-505 rounded-full" style={{ backgroundColor: '#111827' }}></span> Digital Credentials & Key Vault
            </h3>

            {orders.length === 0 ? (
              <div className="bg-white border border-slate-100 p-8 rounded-3xl text-center text-xs text-slate-400 font-sans">
                No verified purchase ledger assets found matching this address.
              </div>
            ) : (
              orders.map(ord => (
                <div key={ord.id} className="bg-white border border-slate-100 rounded-3xl p-6 space-y-4 shadow-sm" id={`ord-license-vault-${ord.id}`}>
                  <div>
                    <h4 className="font-sans font-extrabold text-[#111827] text-sm tracking-tight">{ord.productName}</h4>
                    <span className="text-[9px] text-slate-400 font-mono mt-0.5 block uppercase">
                      RECEIPT REFERENCE ID: {ord.id} • PURCHASED {new Date(ord.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {ord.paymentStatus === 'pending' ? (
                    <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-start gap-3 font-sans">
                      <Clock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5 animate-pulse" />
                      <div>
                        <span className="block text-xs font-sans font-black text-amber-900 uppercase tracking-wide">Awaiting Vendor Verification</span>
                        <p className="text-[11px] text-amber-800 leading-relaxed mt-1 font-medium">
                          You submitted a bank transfer payment with reference code <code className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-amber-200 select-all text-slate-900 mx-1">{ord.bankTxCode || 'N/A'}</code>. The merchant is auditing the ledger and will approve access shortly. The licensing details and download button will automatically appear here once approved.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {ord.licenseKeyCreated && (
                        <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-center justify-between gap-3 font-sans">
                          <div>
                            <span className="block text-[9px] font-sans font-bold text-slate-400 uppercase tracking-wider">Client License Key Code</span>
                            <code className="text-xs font-mono font-black text-indigo-950 tracking-wider select-all">{ord.licenseKeyCreated}</code>
                          </div>
                          <span className="text-[10px] font-sans font-black px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5 text-emerald-600" /> Authenticated
                          </span>
                        </div>
                      )}

                      {ord.downloadToken ? (
                        <div className="flex items-center gap-3 pt-1 font-sans">
                          <a
                            href={`/api/download/${ord.downloadToken}`}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-[#111827] hover:bg-slate-800 text-yellow-405 text-xs font-sans font-extrabold py-2.5 px-4 rounded-xl transition-all inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
                            id="portal-direct-file-download-btn"
                          >
                            <Download className="w-4 h-4 text-yellow-400" /> Download Digital File
                          </a>
                          <span className="text-[10.5px] text-slate-450 font-sans">
                            Signed secure download voucher active.
                          </span>
                        </div>
                      ) : (
                        <p className="text-[10.5px] text-slate-455 font-sans italic">
                          This subscription includes service dashboard access. No standalone physical files are attached.
                        </p>
                      )}
                    </>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Simulated Email Receipts Feed in Portal */}
          {simulatedEmails.length > 0 && (
            <div className="col-span-1 md:col-span-2 bg-[#111827] border border-slate-800 rounded-3xl p-6 space-y-4 shadow-lg text-slate-100 mt-4" id="portal-simulated-mailbox">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-[#fbbf24] rounded-full animate-pulse animate-duration-1000"></span>
                  <span className="text-xs font-sans font-black uppercase text-[#fbbf24] tracking-wider">Simulated Sandbox Email Client For {email}</span>
                </div>
                <span className="text-[10px] uppercase font-mono bg-slate-800 text-slate-300 px-3 py-1 rounded-full font-bold">INTERCEPTED EMAILS</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans max-w-2xl font-medium">
                The Merchant of Record network automatically fires email receipts and download link fallback details. Since no physical SMTP is linked in this environment, you can audit the dispatched payloads right here:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {simulatedEmails.map(mail => (
                  <div key={mail.id} className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden flex flex-col shadow-inner">
                    <div className="p-3 bg-slate-900 border-b border-slate-800 flex flex-col gap-0.5">
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                        <span>To: {mail.to}</span>
                        <span>{new Date(mail.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <div className="text-[11px] font-sans font-black text-white mt-1">
                        Subject: {mail.subject}
                      </div>
                    </div>
                    <div className="p-4 bg-white text-slate-900 overflow-y-auto max-h-60 text-xs custom-scrollbar flex-1">
                      <div dangerouslySetInnerHTML={{ __html: mail.bodyHtml }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* SUPPORT WIDGET */}
      <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex gap-3.5 items-start">
        <HelpCircle className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-600 space-y-1">
          <p className="font-semibold text-slate-900">Need direct merchant support?</p>
          <p className="leading-relaxed">
            Because our platform serves as the **Merchant of Record**, we guarantee compliance audits and support services. If you have experienced regional cellular drops during your EcoCash dial prompt sequences, please dial *151*200# on your network hand unit or contact billing support at <b>support@comfortmor.com</b>.
          </p>
        </div>
      </div>
    </div>
  );
}
