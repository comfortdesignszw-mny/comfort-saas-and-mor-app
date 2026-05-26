/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Grid, 
  Plus, 
  Upload, 
  Lock, 
  FileDown, 
  Check, 
  X, 
  AlertCircle,
  Copy,
  Link as LinkIcon,
  RefreshCw,
  Clock,
  Briefcase,
  ShieldAlert,
  Settings,
  Trash2,
  Edit3,
  Globe,
  Send,
  Code,
  Loader2,
  User
} from 'lucide-react';
import { Store, Product, Order, Subscription, LicenseKey, WebhookEndpoint, WebhookDelivery } from '../types';

interface VendorDashboardProps {
  onSelectStore: (subdomain: string) => void;
  activeStoreSubdomain: string;
}

export default function VendorDashboard({ onSelectStore, activeStoreSubdomain }: VendorDashboardProps) {
  // Merchant Identity Session variables
  const [merchantEmail, setMerchantEmail] = useState<string>(() => {
    return localStorage.getItem('comfortmor_vendor_email') || '';
  });
  const [merchantName, setMerchantName] = useState<string>(() => {
    return localStorage.getItem('comfortmor_vendor_name') || '';
  });

  // Database store states synced with Backend
  const [stores, setStores] = useState<Store[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [licenses, setLicenses] = useState<Record<string, LicenseKey>>({});
  
  // App states
  const [activeStore, setActiveStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // New Store Form State
  const [showNewStore, setShowNewStore] = useState(false);
  const [newStoreName, setNewStoreName] = useState('');
  const [newSubdomain, setNewSubdomain] = useState('');
  const [newVendorEmail, setNewVendorEmail] = useState('');
  const [newCurrency, setNewCurrency] = useState('USD');
  const [newColor, setNewColor] = useState('#0f766e');

  // New Product Form State
  const [showNewProduct, setShowNewProduct] = useState(false);
  const [prodName, setProdName] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodType, setProdType] = useState<'download' | 'subscription' | 'bundle'>('download');
  const [prodPriceType, setProdPriceType] = useState<'fixed' | 'pwyw'>('fixed');
  const [prodPrice, setProdPrice] = useState('19.99');
  const [prodMinPrice, setProdMinPrice] = useState('5.05');
  const [prodInterval, setProdInterval] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');
  const [prodLicense, setProdLicense] = useState(false);
  const [prodMaxActs, setProdMaxActs] = useState('5');

  // Edit Product Modal states
  const [showEditProduct, setShowEditProduct] = useState<Product | null>(null);
  const [editProdName, setEditProdName] = useState('');
  const [editProdDesc, setEditProdDesc] = useState('');
  const [editProdType, setEditProdType] = useState<'download' | 'subscription' | 'bundle'>('download');
  const [editProdPriceType, setEditProdPriceType] = useState<'fixed' | 'pwyw'>('fixed');
  const [editProdPrice, setEditProdPrice] = useState('19.99');
  const [editProdMinPrice, setEditProdMinPrice] = useState('5.05');
  const [editProdInterval, setEditProdInterval] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');
  const [editProdLicense, setEditProdLicense] = useState(false);
  const [editProdMaxActs, setEditProdMaxActs] = useState('5');
  const [editMediaFile, setEditMediaFile] = useState<File | null>(null);
  const [editDownloadFile, setEditDownloadFile] = useState<File | null>(null);
  const [editUploading, setEditUploading] = useState(false);
  const [editMediaPreviewUrl, setEditMediaPreviewUrl] = useState<string | null>(null);

  // Custom states for dragging and dropping physical files (Multipart Form Upload)
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [downloadFile, setDownloadFile] = useState<File | null>(null);
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (merchantEmail) {
      setNewVendorEmail(merchantEmail);
    }
  }, [merchantEmail]);

  useEffect(() => {
    if (!mediaFile) {
      setMediaPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(mediaFile);
    setMediaPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [mediaFile]);

  useEffect(() => {
    if (!editMediaFile) {
      setEditMediaPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(editMediaFile);
    setEditMediaPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [editMediaFile]);

  // License Key Validation state
  const [validatingKey, setValidatingKey] = useState('');
  const [validatingEmail, setValidatingEmail] = useState('');
  const [validationResult, setValidationResult] = useState<{ success: boolean; text: string } | null>(null);

  // Webhook Management & Deliveries States
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>([]);
  const [deliveries, setDeliveries] = useState<WebhookDelivery[]>([]);
  const [webhookLoading, setWebhookLoading] = useState(false);
  const [showNewWebhook, setShowNewWebhook] = useState(false);
  const [showEditWebhook, setShowEditWebhook] = useState<WebhookEndpoint | null>(null);
  
  // Create / Edit Webhook Form States
  const [whUrl, setWhUrl] = useState('');
  const [whEvents, setWhEvents] = useState<string[]>(['order.created']);
  const [whStatus, setWhStatus] = useState<'active' | 'inactive'>('active');

  // Webhook Simulation Sandbox State
  const [simulatorEvent, setSimulatorEvent] = useState<string>('order.created');
  const [simulatorPayload, setSimulatorPayload] = useState<string>('');
  const [expandedDeliveryId, setExpandedDeliveryId] = useState<string | null>(null);

  // Bank & Store Configuration state variables
  const [bankName, setBankName] = useState('');
  const [bankAccountName, setBankAccountName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankBranchCode, setBankBranchCode] = useState('');
  const [savingBank, setSavingBank] = useState(false);

  const [storeEditName, setStoreEditName] = useState('');
  const [storeEditSubdomain, setStoreEditSubdomain] = useState('');
  const [storeEditCurrency, setStoreEditCurrency] = useState('USD');
  const [storeEditThemeColor, setStoreEditThemeColor] = useState('#0a2540');

  useEffect(() => {
    if (activeStore) {
      setBankName(activeStore.bankName || '');
      setBankAccountName(activeStore.bankAccountName || '');
      setBankAccountNumber(activeStore.bankAccountNumber || '');
      setBankBranchCode(activeStore.bankBranchCode || '');

      setStoreEditName(activeStore.name);
      setStoreEditSubdomain(activeStore.subdomain);
      setStoreEditCurrency(activeStore.currency || 'USD');
      setStoreEditThemeColor(activeStore.themeColor || '#0a2540');
    }
  }, [activeStore]);

  const handleSaveBankAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStore) return;
    setSavingBank(true);
    try {
      const res = await fetch(`/api/stores/${activeStore.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: storeEditName,
          subdomain: storeEditSubdomain,
          currency: storeEditCurrency,
          themeColor: storeEditThemeColor,
          bankName,
          bankAccountName,
          bankAccountNumber,
          bankBranchCode
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update store settings.');
      }
      showFeedback('success', 'Official store configuration and deposit coordinates updated successfully!');
      
      // Update local state tree and local storage backup
      const updatedStores = stores.map(s => s.id === activeStore.id ? { ...s, ...data.store } : s);
      saveStoresLocallyForEmail(merchantEmail, updatedStores);

      setStores(updatedStores);
      setActiveStore({ ...activeStore, ...data.store });
      onSelectStore(data.store.subdomain);
    } catch (err: any) {
      showFeedback('error', err.message);
    } finally {
      setSavingBank(false);
    }
  };


  // Keep a local copy of stores and products in local storage to prevent deletion across scale-downs/restarts
  const syncLocalStoresAndProductsToBackend = async (email: string) => {
    try {
      const storedStoresStr = localStorage.getItem(`comfortmor_stores_${email}`);
      const storedProductsStr = localStorage.getItem(`comfortmor_products_${email}`);
      
      const localStores = storedStoresStr ? JSON.parse(storedStoresStr) : [];
      const localProducts = storedProductsStr ? JSON.parse(storedProductsStr) : [];

      if (localStores.length > 0 || localProducts.length > 0) {
        await fetch('/api/stores/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stores: localStores, products: localProducts })
        });
      }
    } catch (err) {
      console.error('Failed to pre-sync local offline stores to backend:', err);
    }
  };

  const saveStoresLocallyForEmail = (email: string, updatedStores: Store[]) => {
    localStorage.setItem(`comfortmor_stores_${email}`, JSON.stringify(updatedStores));
  };

  const saveProductsLocallyForEmail = (email: string, updatedProducts: Product[]) => {
    localStorage.setItem(`comfortmor_products_${email}`, JSON.stringify(updatedProducts));
  };

  // Load all initial content
  useEffect(() => {
    if (merchantEmail) {
      fetchGlobalData(merchantEmail);
    } else {
      setLoading(false);
    }
  }, [merchantEmail]);

  const fetchGlobalData = async (activeEmail?: string) => {
    const emailToUse = activeEmail || merchantEmail;
    if (!emailToUse) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // First, sync any local stores / products of this email with the backend container
      await syncLocalStoresAndProductsToBackend(emailToUse);

      // 1. Load Stores list from server
      const storeRes = await fetch('/api/stores');
      const storesList: Store[] = await storeRes.json();
      
      // Filter list: only those belonging to the identified email!
      const userStores = storesList.filter(s => s.vendorEmail?.trim().toLowerCase() === emailToUse.trim().toLowerCase());

      // If we have some local stores, ensure they reside in list
      const storedStoresStr = localStorage.getItem(`comfortmor_stores_${emailToUse}`);
      const localStores: Store[] = storedStoresStr ? JSON.parse(storedStoresStr) : [];
      
      // Merge unique local stores into userStores in state to guarantee local durability
      const mergedStoresMap = new Map<string, Store>();
      userStores.forEach(s => mergedStoresMap.set(s.id, s));
      localStores.forEach(s => {
        if (!mergedStoresMap.has(s.id)) {
          mergedStoresMap.set(s.id, s);
        }
      });
      const finalStores = Array.from(mergedStoresMap.values());
      setStores(finalStores);
      
      // Update local storage backup
      saveStoresLocallyForEmail(emailToUse, finalStores);

      // Identify active store context
      const current = finalStores.find(s => s.subdomain === activeStoreSubdomain) || finalStores[0];
      if (current) {
        setActiveStore(current);
        onSelectStore(current.subdomain);
        await fetchStoreSpecificData(current.id, emailToUse);
      } else {
        setActiveStore(null);
        setProducts([]);
        setOrders([]);
      }
    } catch (err) {
      console.error('Failed to sync vendor data securely:', err);
      showFeedback('error', 'Network failure syncing backend. Working in offline sandbox.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStoreSpecificData = async (storeId: string, emailToUse?: string) => {
    const activeEmail = emailToUse || merchantEmail;
    try {
      // Load products for selected store
      const prodRes = await fetch(`/api/stores/${storeId}/products`);
      const prodList: Product[] = await prodRes.json();

      // Retrieve local products cache to merge or restore
      const storedProductsStr = localStorage.getItem(`comfortmor_products_${activeEmail}`);
      const localProducts: Product[] = storedProductsStr ? JSON.parse(storedProductsStr) : [];
      const storeLocalProds = localProducts.filter(p => p.storeId === storeId);

      const mergedProdsMap = new Map<string, Product>();
      prodList.forEach(p => mergedProdsMap.set(p.id, p));
      storeLocalProds.forEach(p => {
        if (!mergedProdsMap.has(p.id)) {
          mergedProdsMap.set(p.id, p);
        }
      });
      const finalProducts = Array.from(mergedProdsMap.values());
      setProducts(finalProducts);

      // Save complete products list locally to keep cache updated
      const otherUserProds = localProducts.filter(p => p.storeId !== storeId);
      saveProductsLocallyForEmail(activeEmail, [...otherUserProds, ...finalProducts]);

      // Load live orders matching selected store from backend
      const ordersRes = await fetch(`/api/stores/${storeId}/orders`);
      if (ordersRes.ok) {
        const orderList = await ordersRes.json();
        // Sort newest transactions first
        orderList.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setOrders(orderList);
      }
      
      // Load Webhooks and Deliveries
      await fetchWebhookData(storeId);
      
    } catch (err) {
      console.error('Failed to load store-specific records offline:', err);
    }
  };

  const fetchWebhookData = async (storeId: string) => {
    try {
      const whRes = await fetch(`/api/stores/${storeId}/webhooks/endpoints`);
      if (whRes.ok) {
        const whList = await whRes.json();
        setWebhooks(whList);
      }

      const delRes = await fetch(`/api/stores/${storeId}/webhooks/deliveries`);
      if (delRes.ok) {
        const delList = await delRes.json();
        setDeliveries(delList);
      }
    } catch (err) {
      console.error('Failed to fetch webhook telemetry sync:', err);
    }
  };

  // Switch store tenant focus
  const handleStoreChange = async (store: Store) => {
    setActiveStore(store);
    onSelectStore(store.subdomain);
    await fetchStoreSpecificData(store.id);
  };

  // Webhook Endpoints & Deliveries Client Handlers
  const handleCreateWebhookEndpoint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStore || !whUrl) return;

    try {
      const res = await fetch(`/api/stores/${activeStore.id}/webhooks/endpoints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: whUrl,
          events: whEvents,
          status: whStatus
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save endpoint.');

      showFeedback('success', 'Webhook destination endpoint registered successfully.');
      setShowNewWebhook(false);
      setWhUrl('');
      setWhEvents(['order.created']);
      setWhStatus('active');

      await fetchWebhookData(activeStore.id);
    } catch (err: any) {
      showFeedback('error', err.message);
    }
  };

  const handleUpdateWebhookEndpoint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStore || !showEditWebhook) return;

    try {
      const res = await fetch(`/api/stores/${activeStore.id}/webhooks/endpoints/${showEditWebhook.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: whUrl,
          events: whEvents,
          status: whStatus
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update endpoint.');

      showFeedback('success', 'Webhook endpoint configuration updated.');
      setShowEditWebhook(null);
      setWhUrl('');
      setWhEvents(['order.created']);
      setWhStatus('active');

      await fetchWebhookData(activeStore.id);
    } catch (err: any) {
      showFeedback('error', err.message);
    }
  };

  const handleDeleteWebhookEndpoint = async (id: string) => {
    if (!activeStore) return;
    if (!confirm('Are you sure you want to delete this webhook endpoint? No further event transmissions will route here.')) return;

    try {
      const res = await fetch(`/api/stores/${activeStore.id}/webhooks/endpoints/${id}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete endpoint.');
      }

      showFeedback('success', 'Webhook subscription removed.');
      await fetchWebhookData(activeStore.id);
    } catch (err: any) {
      showFeedback('error', err.message);
    }
  };

  const handleSimulateWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStore || !simulatorPayload) return;

    let parsedPayload;
    try {
      parsedPayload = JSON.parse(simulatorPayload);
    } catch (err) {
      showFeedback('error', 'Payload validation failed: Invalid JSON format.');
      return;
    }

    try {
      setWebhookLoading(true);
      const res = await fetch(`/api/stores/${activeStore.id}/webhooks/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: simulatorEvent,
          payload: parsedPayload
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Fulfillment simulation aborted.');

      showFeedback('success', data.message);
      await fetchWebhookData(activeStore.id);
    } catch (err: any) {
      showFeedback('error', err.message);
    } finally {
      setWebhookLoading(false);
    }
  };

  const getSamplePayload = (event: string) => {
    switch (event) {
      case 'order.created':
        return JSON.stringify({
          id: 'ord_1268910263',
          storeId: activeStore?.id || 'store_1',
          productId: 'prod_1',
          productName: 'Sample SaaS Growth Package',
          buyerEmail: 'client.test@ycombinator.com',
          buyerName: 'Jane Dev',
          amount: 29.00,
          paymentGateway: 'paynow',
          paymentStatus: 'success',
          paymentReference: 'REF-89021',
          createdAt: new Date().toISOString()
        }, null, 2);
      case 'subscription.updated':
        return JSON.stringify({
          id: 'sub_1268910263',
          storeId: activeStore?.id || 'store_1',
          productId: 'prod_1',
          productName: 'Sample SaaS Growth Package',
          buyerEmail: 'client.test@ycombinator.com',
          status: 'cancelled',
          billingInterval: 'monthly',
          amount: 29.00,
          nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }, null, 2);
      case 'payment.failed':
        return JSON.stringify({
          id: 'ord_failed_1268910263',
          storeId: activeStore?.id || 'store_1',
          productId: 'prod_1',
          productName: 'Sample SaaS Growth Package',
          buyerEmail: 'client.test@ycombinator.com',
          buyerName: 'Jane Dev',
          amount: 29.00,
          paymentGateway: 'ecocash',
          paymentStatus: 'failed',
          errorMessage: 'EcoCash direct simulation: Daily USSD payment limit exceeded.',
          createdAt: new Date().toISOString()
        }, null, 2);
      case 'license.revoked':
        return JSON.stringify({
          id: 'lic_1268915000',
          storeId: activeStore?.id || 'store_1',
          productId: 'prod_1',
          productName: 'Sample SaaS Growth Package',
          key: 'LIC-SAM-GROWTH-7712-4411',
          buyerEmail: 'client.test@ycombinator.com',
          status: 'revoked',
          revokedAt: new Date().toISOString()
        }, null, 2);
      default:
        return JSON.stringify({
          orderId: 'ord_1268910263',
          storeId: activeStore?.id || 'store_1',
          buyerEmail: 'client.test@ycombinator.com',
          buyerName: 'Jane Dev',
          amount: 29.00
        }, null, 2);
    }
  };

  useEffect(() => {
    setSimulatorPayload(getSamplePayload(simulatorEvent));
  }, [simulatorEvent, activeStore]);

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 5000);
  };

  // Store creator API POST
  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoreName || !newSubdomain || !newVendorEmail) return;

    // Strict cap: Max 3 stores per user email
    if (stores.length >= 3) {
      showFeedback('error', 'Limit reached: Each merchant can manage a maximum of 3 tenant stores.');
      return;
    }

    try {
      const res = await fetch('/api/stores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newStoreName,
          subdomain: newSubdomain,
          vendorEmail: newVendorEmail,
          currency: newCurrency,
          themeColor: newColor
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Identity registration error.');
      }
      
      showFeedback('success', `Tenant Store "${data.name}" generated successfully!`);
      setShowNewStore(false);
      
      // Reset
      setNewStoreName('');
      setNewSubdomain('');
      
      // Update local storage backup
      const updatedStores = [...stores, data];
      saveStoresLocallyForEmail(merchantEmail, updatedStores);

      // Refresh
      await fetchGlobalData();
    } catch (err: any) {
      showFeedback('error', err.message);
    }
  };

  // Robust multipart Product Form data submission
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStore || !prodName || !prodPrice) return;

    // Strict cap: Max 20 products per store
    if (products.length >= 20) {
      showFeedback('error', 'Limit reached: Each store can hold a maximum of 20 products/subscription listings.');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('name', prodName);
      formData.append('description', prodDesc);
      formData.append('type', prodType);
      formData.append('priceType', prodPriceType);
      formData.append('price', prodPrice);
      if (prodPriceType === 'pwyw') {
        formData.append('minPrice', prodMinPrice);
      }
      if (prodType === 'subscription') {
        formData.append('billingInterval', prodInterval);
      }
      formData.append('licenseEnabled', String(prodLicense));
      if (prodLicense) {
        formData.append('maxActivations', prodMaxActs);
      }

      // Appending physical file payloads (absolutely no insecure string URLs!)
      if (mediaFile) {
        formData.append('mediaFile', mediaFile);
      }
      if (downloadFile) {
        formData.append('downloadFile', downloadFile);
      }

      const res = await fetch(`/api/stores/${activeStore.id}/products`, {
        method: 'POST',
        body: formData // Content-Type header left blank purposefully for browser to auto-assign boundary
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to initialize product metrics.');
      }

      showFeedback('success', `Product "${data.name}" uploaded with direct local files attached securely.`);
      setShowNewProduct(false);

      // Reset
      setProdName('');
      setProdDesc('');
      setProdPrice('19.99');
      setProdMinPrice('5.05');
      setMediaFile(null);
      setDownloadFile(null);

      // Update local storage backup
      const storedProductsStr = localStorage.getItem(`comfortmor_products_${merchantEmail}`);
      const localProducts: Product[] = storedProductsStr ? JSON.parse(storedProductsStr) : [];
      const updatedProds = [...localProducts, data];
      saveProductsLocallyForEmail(merchantEmail, updatedProds);

      // Reload
      await fetchStoreSpecificData(activeStore.id);
    } catch (err: any) {
      showFeedback('error', err.message);
    } finally {
      setUploading(false);
    }
  };

  /**
   * Delete Tenant Store & releases its subdomain context
   */
  const handleDeleteStore = async (storeId: string) => {
    if (!window.confirm('Are you absolutely certain you want to delete this tenant store? This will permanently release its subdomain name and delete all associated products.')) {
      return;
    }
    
    try {
      const res = await fetch(`/api/stores/${storeId}`, {
        method: 'DELETE'
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete store.');
      }
      
      showFeedback('success', 'Storefront tenant and all listing products deleted successfully.');
      
      // Update local storage backup
      const storedStoresStr = localStorage.getItem(`comfortmor_stores_${merchantEmail}`);
      const localStores: Store[] = storedStoresStr ? JSON.parse(storedStoresStr) : [];
      const updatedStores = localStores.filter(s => s.id !== storeId);
      saveStoresLocallyForEmail(merchantEmail, updatedStores);

      const storedProductsStr = localStorage.getItem(`comfortmor_products_${merchantEmail}`);
      const localProducts: Product[] = storedProductsStr ? JSON.parse(storedProductsStr) : [];
      const updatedProds = localProducts.filter(p => p.storeId !== storeId);
      saveProductsLocallyForEmail(merchantEmail, updatedProds);

      onSelectStore('');
      setActiveStore(null);

      // Refresh global state list
      await fetchGlobalData();
    } catch (err: any) {
      showFeedback('error', err.message);
    }
  };

  /**
   * Setup editing parameters for active asset SKU
   */
  const handleStartEditProduct = (prod: Product) => {
    setShowEditProduct(prod);
    setEditProdName(prod.name);
    setEditProdDesc(prod.description || '');
    setEditProdType(prod.type as any);
    setEditProdPriceType(prod.priceType as any);
    setEditProdPrice(String(prod.price));
    setEditProdMinPrice(String(prod.minPrice || '5.05'));
    setEditProdInterval((prod.billingInterval as any) || 'monthly');
    setEditProdLicense(!!prod.licenseEnabled);
    setEditProdMaxActs(String(prod.maxActivations || '5'));
    setEditMediaFile(null);
    setEditDownloadFile(null);
  };

  /**
   * Trigger multipart store product details customization
   */
  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStore || !showEditProduct || !editProdName || !editProdPrice) return;

    setEditUploading(true);
    try {
      const formData = new FormData();
      formData.append('name', editProdName);
      formData.append('description', editProdDesc);
      formData.append('type', editProdType);
      formData.append('priceType', editProdPriceType);
      formData.append('price', editProdPrice);
      if (editProdPriceType === 'pwyw') {
        formData.append('minPrice', editProdMinPrice);
      }
      if (editProdType === 'subscription') {
        formData.append('billingInterval', editProdInterval);
      }
      formData.append('licenseEnabled', String(editProdLicense));
      if (editProdLicense) {
        formData.append('maxActivations', editProdMaxActs);
      }

      if (editMediaFile) {
        formData.append('mediaFile', editMediaFile);
      }
      if (editDownloadFile) {
        formData.append('downloadFile', editDownloadFile);
      }

      const res = await fetch(`/api/stores/${activeStore.id}/products/${showEditProduct.id}`, {
        method: 'PUT',
        body: formData
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update product details.');
      }

      showFeedback('success', `Product "${data.name}" customized and updated successfully.`);
      setShowEditProduct(null);

      // Update local storage cache
      const storedProductsStr = localStorage.getItem(`comfortmor_products_${merchantEmail}`);
      const localProducts: Product[] = storedProductsStr ? JSON.parse(storedProductsStr) : [];
      const updatedProds = localProducts.map(p => p.id === showEditProduct.id ? data : p);
      saveProductsLocallyForEmail(merchantEmail, updatedProds);

      // Reload
      await fetchStoreSpecificData(activeStore.id);
    } catch (err: any) {
      showFeedback('error', err.message);
    } finally {
      setEditUploading(false);
    }
  };

  /**
   * Delete Product list row SKU
   */
  const handleDeleteProduct = async (productId: string) => {
    if (!activeStore) return;
    if (!window.confirm('Are you certain you want to permanently delete this product SKU listing?')) {
      return;
    }

    try {
      const res = await fetch(`/api/stores/${activeStore.id}/products/${productId}`, {
        method: 'DELETE'
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete product.');
      }

      showFeedback('success', 'Product asset listing deleted successfully.');

      // Update local storage cache
      const storedProductsStr = localStorage.getItem(`comfortmor_products_${merchantEmail}`);
      const localProducts: Product[] = storedProductsStr ? JSON.parse(storedProductsStr) : [];
      const updatedProds = localProducts.filter(p => p.id !== productId);
      saveProductsLocallyForEmail(merchantEmail, updatedProds);

      // Reload
      await fetchStoreSpecificData(activeStore.id);
    } catch (err: any) {
      showFeedback('error', err.message);
    }
  };

  // Simulate Instant approving of a customer purchase (fulfills gateway payload check)
  const handleApproveOrder = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/approve/${orderId}`, { method: 'POST' });
      const data = await res.json();
      showFeedback('success', `Simulated Payment Approved! ${data.message}`);
      if (activeStore) {
        await fetchStoreSpecificData(activeStore.id);
      }
    } catch (err) {
      showFeedback('error', 'Error simulating webhook confirmation code.');
    }
  };

  // Perform License Code verification right from dashboard debuggers
  const handleVerifyLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatingKey) return;

    try {
      const res = await fetch('/api/license/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: validatingKey,
          buyerEmail: validatingEmail || undefined
        })
      });
      const data = await res.json();
      if (data.valid) {
        setValidationResult({
          success: true,
          text: `VALID LICENSE: Associated with "${data.details.productName}" owned by ${data.details.buyerEmail}. Activations: ${data.details.activationsUsed}/${data.details.maxActivations}`
        });
      } else {
        setValidationResult({
          success: false,
          text: `INVALID LICENSE: ${data.message}`
        });
      }
    } catch (err) {
      setValidationResult({ success: false, text: 'License network response failed.' });
    }
  };

  // Revoke software rights
  const handleRevokeLicense = async (key: string) => {
    try {
      const res = await fetch('/api/license/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key })
      });
      const data = await res.json();
      showFeedback('success', `License ${key} revoked! ${data.message}`);
    } catch (err) {
      showFeedback('error', 'Error canceling client license key.');
    }
  };

  // Aggregate stats values dynamically (Vibrant Store analytics)
  const calculateMetrics = () => {
    let grossVolume = 0;
    let mrr = 0;
    let activeSubsCount = 0;
    let transactionCount = 0;

    // We calculate metrics specifically for the active store tenant context
    if (activeStore) {
      // Direct orders
      orders.forEach(o => {
        if (o.storeId === activeStore.id && o.paymentStatus === 'success') {
          grossVolume += o.amount;
          transactionCount++;
        }
      });

      // Active monthly SaaS values
      // Seed pre-setup MRR or real counts matching state definitions
      if (activeStore.id === 'store_1') {
        mrr = 49.00; // Growth Pro
        activeSubsCount = 1;
      }
    }

    return {
      grossVolume,
      mrr,
      activeSubsCount,
      churnRate: activeStore?.id === 'store_1' ? '0.0%' : 'N/A',
      transactionCount
    };
  };

  const metrics = calculateMetrics();

  if (!merchantEmail) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-8 max-w-lg mx-auto space-y-6 shadow-md mt-10" id="merchant-auth-gate">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-650 rounded-2xl flex items-center justify-center font-black text-xl mx-auto shadow-xs select-none">
            <User className="w-6 h-6 text-indigo-600" />
          </div>
          <h2 className="text-lg font-sans font-black text-slate-900 tracking-tight">ComfortMoR Vendor Identity</h2>
          <p className="text-xs text-slate-500 leading-relaxed font-semibold">
            Identify yourself to build, view, and manage your private multi-tenant storefronts safely without resource overlap.
          </p>
        </div>

        <form onSubmit={(e) => {
          e.preventDefault();
          const emailInput = (document.getElementById('gate-email') as HTMLInputElement).value;
          const nameInput = (document.getElementById('gate-name') as HTMLInputElement).value;
          if (emailInput && nameInput) {
            localStorage.setItem('comfortmor_vendor_email', emailInput.trim());
            localStorage.setItem('comfortmor_vendor_name', nameInput.trim());
            setMerchantEmail(emailInput.trim());
            setMerchantName(nameInput.trim());
          }
        }} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-sans">Full Name / Merchant business</label>
            <input
              type="text"
              id="gate-name"
              required
              defaultValue="Comfort Designs"
              placeholder="e.g. Comfort Designs"
              className="w-full border border-slate-200 rounded-xl p-3 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-hidden font-sans font-semibold text-slate-800"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-sans">Your Operating Email Address</label>
            <input
              type="email"
              id="gate-email"
              required
              defaultValue="comfort.designszw@gmail.com"
              placeholder="e.g. comfort.designszw@gmail.com"
              className="w-full border border-slate-200 rounded-xl p-3 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-hidden font-sans font-semibold text-slate-850 font-mono"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#111827] hover:bg-slate-800 text-yellow-405 font-sans font-extrabold text-xs py-3.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-[0.98]"
            id="btn-gate-connect"
          >
            Connect Vendor Dashboard
          </button>
        </form>

        <div className="border-t border-slate-100 pt-4 text-center">
          <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
            Demo users can quickly connect as: <br />
            <button 
              type="button"
              onClick={() => {
                const email = 'billing@apexanalytics.com';
                const name = 'Apex Analytics';
                localStorage.setItem('comfortmor_vendor_email', email);
                localStorage.setItem('comfortmor_vendor_name', name);
                setMerchantEmail(email);
                setMerchantName(name);
              }}
              className="text-indigo-600 hover:underline font-bold mr-2 text-[10px] cursor-pointer"
            >
              apexanalytics.com (Apex Analytics)
            </button>
            <span className="text-slate-300">•</span>
            <button 
              type="button"
              onClick={() => {
                const email = 'creatives@glowpixels.net';
                const name = 'GlowPixels Assets';
                localStorage.setItem('comfortmor_vendor_email', email);
                localStorage.setItem('comfortmor_vendor_name', name);
                setMerchantEmail(email);
                setMerchantName(name);
              }}
              className="text-indigo-600 hover:underline font-bold ml-2 text-[10px] cursor-pointer"
            >
              glowpixels.net (GlowPixels Assets)
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" id="vendor-dashboard-wrapper">
      {/* Merchant Identity Status Header bar */}
      <div className="bg-[#111827] text-white p-5 rounded-3xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-900 text-white border border-slate-800 rounded-2xl flex items-center justify-center shadow-xs">
            <User className="w-5 h-5 text-yellow-400 animate-pulse" />
          </div>
          <div>
            <p className="text-[9px] font-mono tracking-widest text-slate-500 uppercase font-black font-sans leading-none">Authorized Merchant Session</p>
            <h4 className="text-xs font-sans font-black text-slate-105 mt-1 select-all">
              {merchantName} <span className="text-slate-400 font-mono font-medium">({merchantEmail})</span>
            </h4>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="font-mono bg-yellow-400 text-slate-950 font-black px-2.5 py-1 rounded text-[9px] uppercase tracking-wider select-none">
            {stores.length} / 3 Stores
          </span>
          <button
            onClick={() => {
              localStorage.removeItem('comfortmor_vendor_email');
              localStorage.removeItem('comfortmor_vendor_name');
              setMerchantEmail('');
              setMerchantName('');
              setStores([]);
              setActiveStore(null);
            }}
            className="text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 font-black px-3.5 py-1.5 rounded-xl border border-slate-700 transition-all cursor-pointer text-[10px] font-sans"
            id="btn-switch-merchant"
          >
            Switch Account
          </button>
        </div>
      </div>

      {/* Merchant Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="bg-[#111827] text-yellow-400 p-3 rounded-2xl shadow-sm">
            <Briefcase className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest font-sans">MoR Sandbox Dashboard</span>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-sans font-black text-slate-900 tracking-tight">
                {activeStore ? activeStore.name : 'Resolving Tenants...'}
              </h1>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block animate-ping"></span>
              <span className="text-[10px] text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                PWA Shell Active
              </span>
            </div>
          </div>
        </div>

        {/* Tenant Selector & Quick Action Container */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-250/80 rounded-xl p-2 shadow-2xs">
            <span className="text-xs text-slate-550 px-2 font-sans font-bold uppercase tracking-wider text-[10px]">Storefront Router:</span>
            {stores.map(s => (
              <button
                key={s.id}
                onClick={() => handleStoreChange(s)}
                className={`px-4 py-2 text-xs font-sans font-bold rounded-lg transition-all cursor-pointer ${
                  activeStore?.id === s.id
                    ? 'bg-[#111827] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
                id={`btn-select-store-${s.subdomain}`}
              >
                {s.subdomain}.mor
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowNewStore(true)}
            className="bg-[#111827] hover:bg-slate-800 text-yellow-400 font-sans font-bold text-xs px-4 py-2.5 rounded-xl inline-flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            id="btn-trigger-new-store"
          >
            <Building2 className="w-4 h-4" /> New Tenant Store
          </button>
        </div>
      </div>

      {feedback && (
        <div 
          className={`p-4 rounded-2xl border text-xs font-sans flex items-center gap-2.5 animate-fade-in ${
            feedback.type === 'success' 
              ? 'bg-emerald-50 border-emerald-100 text-emerald-800' 
              : 'bg-red-50 border-red-150 text-red-800'
          }`}
          id="dashboard-sys-feedback"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="font-semibold">{feedback.text}</span>
        </div>
      )}

      {/* METRICS ROW (Vibrant Store dashboard analytics layout) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" id="stats-dashboard-grid">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Gross Volume</div>
          <div className="text-3xl font-black text-slate-900">
            {activeStore?.currency || 'USD'} {metrics.grossVolume.toFixed(2)}
          </div>
          <div className="text-xs text-emerald-500 font-bold mt-2 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +12.4% vs last mo.
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Active MRR</div>
          <div className="text-3xl font-black text-slate-900">
            {activeStore?.currency || 'USD'} {metrics.mrr.toFixed(2)}
          </div>
          <div className="text-xs text-emerald-500 font-bold mt-2 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> +4.1% vs last mo.
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Active Subs</div>
          <div className="text-3xl font-black text-slate-900">{metrics.activeSubsCount}</div>
          <div className="text-xs text-slate-400 font-medium mt-2">98% retention rate</div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Churn Rate</div>
          <div className="text-3xl font-black text-slate-900">{metrics.churnRate}</div>
          <div className="text-xs text-rose-500 font-bold mt-2">-0.5% vs last mo.</div>
        </div>
      </div>

      {/* CORE WORKFLOW AREA (Products, Orders, Subscriptions, Licensing Debugger) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Products In Inventory */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden" id="products-list-card">
            <div className="px-6 py-5 border-b border-slate-100 bg-[#111827] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Grid className="w-4 h-4 text-slate-450" />
                <h3 className="font-sans font-extrabold text-[#F9FAFB] text-sm tracking-tight">Products & License SKU Catalog</h3>
              </div>
              <button
                onClick={() => setShowNewProduct(true)}
                className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-sans font-black text-xs px-3.5 py-2 rounded-xl inline-flex items-center gap-1.5 transition-all cursor-pointer"
                id="btn-upload-product"
              >
                <Plus className="w-4 h-4" /> Upload Product
              </button>
            </div>

            <div className="p-6 divide-y divide-slate-100 max-h-[380px] overflow-y-auto">
              {products.length === 0 ? (
                <div className="py-10 text-center text-slate-400 text-xs font-medium">
                  No products uploaded yet. Drag files or configure your first digital SKU layout.
                </div>
              ) : (
                products.map(prod => (
                  <div key={prod.id} className="py-5 flex items-start gap-4 first:pt-0 last:pb-0" id={`vendor-prod-row-${prod.id}`}>
                    {/* Thumbnail Image Preview */}
                    <div className="w-14 h-14 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden relative shadow-xs">
                      {prod.mediaFile ? (
                        <img 
                          src={`/uploads/${prod.mediaFile}`} 
                          alt={prod.name} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className={`w-full h-full flex items-center justify-center text-xs font-sans font-black ${
                          prod.type === 'subscription' 
                            ? 'bg-indigo-50 text-indigo-600' 
                            : prod.type === 'download' 
                            ? 'bg-emerald-50 text-emerald-600' 
                            : 'bg-rose-50 text-rose-600'
                        }`}>
                          {prod.type === 'subscription' ? 'SaaS' : prod.type === 'download' ? 'eBook' : 'Bund'}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-sans font-bold text-slate-900 text-sm tracking-tight truncate">{prod.name}</span>
                        <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full capitalize bg-slate-100 text-slate-600 border border-slate-200">
                          {prod.type}
                        </span>
                        {prod.licenseEnabled && (
                          <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100 inline-flex items-center gap-0.5">
                            <Lock className="w-3 h-3 text-emerald-600" /> Key-Issued
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 max-w-md line-clamp-1 leading-relaxed">{prod.description}</p>
                      
                      {/* Multipart file info proofs (renders only if physically uploaded) */}
                      {(prod.mediaFile || prod.downloadFile) && (
                        <div className="flex items-center gap-2.5 text-[10px] text-slate-400 font-mono mt-2" id={`prod-files-${prod.id}`}>
                          {prod.mediaFile && (
                            <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100 inline-flex items-center gap-1">
                              <Upload className="w-3 h-3" /> Img: {prod.mediaFile.substring(0, 16)}...
                            </span>
                          )}
                          {prod.downloadFile && (
                            <span className="bg-sky-50 text-sky-700 px-2 py-0.5 rounded border border-sky-100 inline-flex items-center gap-1">
                              <FileDown className="w-3 h-3" /> Core File: {prod.downloadFile.substring(0, 16)}...
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-sans font-black text-slate-900 text-base">
                        {prod.priceType === 'pwyw' ? 'PWYW' : ''} {activeStore?.currency || 'USD'} {prod.price.toFixed(2)}
                      </div>
                      {prod.type === 'subscription' && (
                        <div className="text-[10px] text-slate-400 font-bold font-mono tracking-wider uppercase mt-0.5">
                          billed {prod.billingInterval}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-end gap-1.5 mt-2.5">
                        <button
                          onClick={() => handleStartEditProduct(prod)}
                          className="bg-slate-50 hover:bg-slate-100 text-slate-600 p-1.5 rounded-lg border border-slate-200 transition-all cursor-pointer inline-flex items-center gap-1 text-[10px] font-sans font-black"
                          title="Edit Product Details"
                          id={`btn-edit-prod-${prod.id}`}
                        >
                          <Edit3 className="w-3.5 h-3.5 text-indigo-550" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(prod.id)}
                          className="bg-slate-50 hover:bg-red-50 text-red-650 p-1.5 rounded-lg border border-slate-200 hover:border-red-200 transition-all cursor-pointer inline-flex items-center gap-1 text-[10px] font-sans font-black"
                          title="Delete Listing"
                          id={`btn-delete-prod-${prod.id}`}
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-505" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Checkout transaction Simulator Log */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden" id="sandbox-transactions-logs">
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50">
              <h3 className="font-sans font-bold text-slate-900 text-sm tracking-tight flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600" /> MoR Customer Checkout Activity & Fulfillment Log
              </h3>
            </div>
            <div className="p-6 overflow-x-auto max-h-[300px] overflow-y-auto">
              <table className="w-full text-left text-xs text-slate-500">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase font-mono text-[10px] font-bold tracking-widest">
                    <th className="pb-3 font-medium">Buyer</th>
                    <th className="pb-3 font-medium">Product / Price</th>
                    <th className="pb-3 font-medium">Gateway</th>
                    <th className="pb-3 font-medium">Payment Status</th>
                    <th className="pb-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-105">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                        No transactions registered in multi-tenant stream. Complete checking out in Storefront.
                      </td>
                    </tr>
                  ) : (
                    orders.map(ord => (
                      <tr key={ord.id} className="hover:bg-slate-50/50">
                        <td className="py-3.5">
                          <p className="font-bold text-slate-900">{ord.buyerName}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{ord.buyerEmail}</p>
                          {ord.paymentGateway === 'bank_transfer' && (
                            <div className="mt-1.5 space-y-1">
                              <p className="text-[10px] text-slate-600 font-sans font-medium flex items-center gap-1">
                                Ref: <code className="font-mono bg-amber-50 border border-amber-200 text-amber-900 px-1.5 py-0.5 rounded font-black select-all text-[9.5px]">{ord.bankTxCode || 'N/A'}</code>
                              </p>
                              {ord.bankScreenshot && (
                                <div className="inline-block pt-0.5">
                                  <a 
                                    href={`/uploads/${ord.bankScreenshot}`} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="text-[9.5px] font-sans font-extrabold text-indigo-600 hover:text-indigo-850 flex items-center gap-1 underline"
                                  >
                                    🖼️ View screenshot proof
                                  </a>
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5">
                          <p className="font-semibold text-slate-800 truncate max-w-[150px]">{ord.productName}</p>
                          <p className="text-[10px] text-slate-550 font-mono">
                            {activeStore?.currency || 'USD'} {ord.amount.toFixed(2)}
                          </p>
                        </td>
                        <td className="py-3.5">
                          <span className="text-[10px] font-mono font-bold capitalize px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200">
                            {ord.paymentGateway === 'bank_transfer' ? 'Bank Transfer' : ord.paymentGateway}
                          </span>
                        </td>
                        <td className="py-3.5">
                          <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border ${
                            ord.paymentStatus === 'success'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                              : 'bg-amber-50 text-amber-700 border-amber-100 animate-pulse'
                          }`}>
                            {ord.paymentStatus}
                          </span>
                        </td>
                        <td className="py-3.5 text-right">
                          {ord.paymentStatus === 'pending' ? (
                            <button
                              onClick={() => handleApproveOrder(ord.id)}
                              className={`font-sans text-[10px] font-extrabold px-3 py-1.5 rounded-lg inline-flex items-center gap-1 transition-all shadow-xs cursor-pointer ${
                                ord.paymentGateway === 'bank_transfer'
                                  ? 'bg-indigo-650 hover:bg-indigo-750 text-white'
                                  : 'bg-[#111827] hover:bg-slate-800 text-yellow-400'
                              }`}
                              id={`btn-approve-order-${ord.id}`}
                            >
                              {ord.paymentGateway === 'bank_transfer' ? 'Verify Payment' : 'Approve Simulated payment'}
                            </button>
                          ) : (
                            <div className="text-[10px] font-mono text-emerald-600 font-extrabold flex items-center justify-end gap-1">
                              Fulfill Completed <Check className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Real-Time Software License Keys Debugger & Issuer */}
        <div className="space-y-6">
          <div className="bg-[#111827] rounded-3xl border border-slate-800 p-6 text-white space-y-5 shadow-lg shadow-slate-900/40" id="licensing-debugger-aside">
            <h3 className="font-sans font-black text-slate-100 text-sm tracking-tight flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" /> Automated Software License Key Debugger
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Comfort MoR automatically generates, monitors, and validates customer license codes. Simulate the clients authentication loop below:
            </p>

            {/* Sync status widget incorporated into the debugger box */}
            <div className="p-4 bg-slate-800/40 rounded-2xl border border-slate-700/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sync Status</span>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
              </div>
              <div className="text-sm font-bold text-slate-200">Offline-First Ready</div>
              <div className="w-full bg-slate-700 h-1.5 rounded-full mt-2">
                <div className="bg-emerald-400 h-1.5 w-[88%] rounded-full"></div>
              </div>
            </div>

            <form onSubmit={handleVerifyLicense} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold font-mono uppercase text-slate-400 mb-1.5">Key String</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. APX-GROWTH-9A10-D782-FF88"
                  value={validatingKey}
                  onChange={(e) => setValidatingKey(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 focus:outline-hidden focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 font-mono"
                  id="lic-key-input"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold font-mono uppercase text-slate-400 mb-1.5">Buyer Login Email (Optional)</label>
                <input
                  type="email"
                  placeholder="john.dev@github.com"
                  value={validatingEmail}
                  onChange={(e) => setValidatingEmail(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 focus:outline-hidden focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 font-sans"
                  id="lic-email-input"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-slate-900 text-xs font-sans font-black py-3 rounded-2xl transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-[0.98]"
                id="btn-trigger-license-verification"
              >
                Request Authorization Verification
              </button>
            </form>

            {validationResult && (
              <div 
                className={`p-4 rounded-2xl text-xs font-sans border flex items-start gap-2.5 ${
                  validationResult.success 
                    ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300' 
                    : 'bg-red-950/40 border-red-800 text-red-300'
                }`}
                id="license-verify-output"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="leading-relaxed whitespace-pre-line">{validationResult.text}</p>
              </div>
            )}

            {/* List active license keys in system */}
            <div className="pt-4 border-t border-slate-800/80">
              <p className="text-[10px] font-bold font-mono text-slate-400 uppercase mb-2">Simulated Ledger Store Licenses:</p>
              <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
                <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800 text-[11px] font-mono space-y-1.5">
                  <div className="flex items-center justify-between text-slate-200">
                    <span className="font-semibold select-all">APX-GROWTH-9A10-D782-FF88</span>
                    <span className="text-emerald-400 font-bold">ACTIVE</span>
                  </div>
                  <p className="text-slate-400">Owner: john.dev@github.com</p>
                  <p className="text-slate-500">Activations: 1/5</p>
                  <button
                    onClick={() => handleRevokeLicense('APX-GROWTH-9A10-D782-FF88')}
                    className="mt-2 text-red-400 hover:text-red-300 underline font-bold transition-all block cursor-pointer"
                  >
                    Revoke License Client Status
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* MERCHANT DEPOSIT BANK COORDINATES CONFIGURATION */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-5 shadow-sm animate-fade-in" id="merchant-coordinate-settings-card">
            <div>
              <h3 className="font-sans font-black text-[#111827] text-sm tracking-tight flex items-center gap-2">
                <Settings className="w-4 h-4 text-indigo-600" /> Store Configuration & Settings
              </h3>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed font-semibold font-sans">
                Full-scale management of your multi-tenant storefront. Changes apply instantly to your customer-facing subdomains.
              </p>
            </div>

            {activeStore ? (
              <form onSubmit={handleSaveBankAccount} className="space-y-4">
                {/* Store Metadata */}
                <div className="space-y-3.5 border-b border-slate-100 pb-4">
                  <p className="text-[10px] font-bold font-sans text-indigo-600 uppercase tracking-wider">General Metadata</p>
                  
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 font-sans">Storefront Name</label>
                    <input
                      type="text"
                      required
                      value={storeEditName}
                      onChange={(e) => setStoreEditName(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-hidden font-sans font-semibold text-slate-800 bg-slate-50/50"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-sans">Subdomain (.mor.app)</label>
                    <div className="flex items-center">
                      <span className="bg-slate-50 border border-r-0 border-slate-200 text-slate-500 text-[11px] px-2.5 py-2.5 rounded-l-xl font-mono select-none">
                        https://
                      </span>
                      <input
                        type="text"
                        required
                        value={storeEditSubdomain}
                        onChange={(e) => setStoreEditSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                        className="w-full border border-slate-200 p-2.5 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-hidden font-mono font-bold text-slate-800 bg-slate-50/50"
                      />
                      <span className="bg-slate-50 border border-l-0 border-slate-200 text-slate-500 text-[11px] px-2.5 py-2.5 rounded-r-xl font-mono select-none">
                        .mor.app
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 font-sans">Accent Color</label>
                      <input
                        type="color"
                        value={storeEditThemeColor}
                        onChange={(e) => setStoreEditThemeColor(e.target.value)}
                        className="w-full h-9 p-0.5 rounded-xl border border-slate-200 cursor-pointer bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 font-sans">Store Currency</label>
                      <select
                        value={storeEditCurrency}
                        onChange={(e) => setStoreEditCurrency(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl p-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-hidden bg-white font-sans font-semibold text-slate-800"
                      >
                        <option value="USD">USD (Dollar)</option>
                        <option value="ZWG">ZWG (Gold)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Bank Details */}
                <div className="space-y-3.5">
                  <p className="text-[10px] font-bold font-sans text-indigo-600 uppercase tracking-wider">Bank Deposit Details</p>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="col-span-2">
                      <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1 font-sans">Official Bank Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Steward Bank Zimbabwe"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-hidden font-sans font-semibold text-slate-800 bg-slate-50/50"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1 font-sans">Account Name / Holder</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Apex Analytics Limited"
                        value={bankAccountName}
                        onChange={(e) => setBankAccountName(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-hidden font-sans font-semibold text-slate-800 bg-slate-50/50"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1 font-sans">Account Number</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 10029384729"
                        value={bankAccountNumber}
                        onChange={(e) => setBankAccountNumber(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-mono focus:ring-1 focus:ring-indigo-500 focus:outline-hidden text-slate-850 bg-slate-50/50 font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1 font-sans">Branch / Swift Code</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. SWB-042"
                        value={bankBranchCode}
                        onChange={(e) => setBankBranchCode(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-mono focus:ring-1 focus:ring-indigo-500 focus:outline-hidden text-slate-850 bg-slate-50/50 font-bold"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={savingBank}
                    className="w-full bg-[#111827] hover:bg-slate-850 text-yellow-400 text-xs font-sans font-black py-3 rounded-xl transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-[0.98] disabled:opacity-50"
                  >
                    {savingBank ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving Changes...
                      </>
                    ) : (
                      'Save Configurations'
                    )}
                  </button>

                  <div className="border-t border-slate-100 pt-3 mt-1">
                    <p className="text-[9px] text-red-500 font-bold uppercase tracking-widest mb-2">Danger Zone / Discard Tenant</p>
                    <button
                      type="button"
                      onClick={() => handleDeleteStore(activeStore.id)}
                      className="w-full bg-red-50 hover:bg-red-100 text-red-700 hover:text-red-800 text-xs font-sans font-bold py-2.5 rounded-xl border border-red-200 hover:border-red-300 transition-all text-center flex items-center justify-center gap-1 cursor-pointer"
                      id="btn-delete-tenant-store"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-600" />
                      Delete Storefront Permanent
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs font-medium">
                Please provision or select a store to configure its properties.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* REAL-TIME DEVELOPER WEBHOOK ENGINE (MERCHANT OF RECORD SYSTEM ACCENT) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 space-y-8 shadow-sm mt-8 animate-fade-in" id="webhooks-engine-panel">
        
        {/* Panel Header */}
        <div className="border-b border-slate-100 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold shrink-0">
                <Globe className="w-4 h-4 animate-pulse" />
              </div>
              <h2 className="text-base font-sans font-black text-[#111827] tracking-tight uppercase">Merchant Real-Time Webhook Engine</h2>
            </div>
            <p className="text-xs text-slate-500 max-w-2xl leading-relaxed font-medium">
              Register third-party URLs to listen to live events happening on the platform including checkouts, subscription cancellations, and license deactivations.
            </p>
          </div>
          <button
            onClick={() => {
              setWhUrl('');
              setWhEvents(['order.created']);
              setWhStatus('active');
              setShowNewWebhook(true);
            }}
            className="bg-[#111827] hover:bg-slate-800 text-yellow-400 text-xs font-sans font-extrabold px-4 py-2.5 rounded-xl inline-flex items-center gap-1.5 transition-all outline-hidden cursor-pointer shrink-0 shadow-xs"
            id="btn-add-webhook-endpoint"
          >
            <Plus className="w-4 h-4" /> Add Webhook Endpoint
          </button>
        </div>

        {/* 2-Column Core Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* LEFT: Registered Endpoints list & Deliveries Audit Journal */}
          <div className="xl:col-span-2 space-y-8">
            
            {/* Registered Endpoints Section */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider flex items-center gap-1.5 font-sans">
                Active Webhook Subscriptions ({webhooks.length})
              </h3>
              
              {webhooks.length === 0 ? (
                <div className="border border-dashed border-slate-200 rounded-2xl py-8 px-4 text-center text-slate-400 text-xs font-medium">
                  No registered webhooks. Enter a local or public endpoint destination URL to sync telemetry events offline.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {webhooks.map(wh => (
                    <div key={wh.id} className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50 flex flex-col justify-between gap-4 select-none relative group hover:border-slate-300 transition-all">
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between gap-2.5">
                          <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                            wh.status === 'active' 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-110' 
                              : 'bg-slate-100 text-slate-500 border-slate-200'
                          }`}>
                            {wh.status.toUpperCase()}
                          </span>
                          <div className="flex items-center gap-1.5 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => {
                                setWhUrl(wh.url);
                                setWhEvents(wh.events);
                                setWhStatus(wh.status);
                                setShowEditWebhook(wh);
                              }}
                              className="text-slate-400 hover:text-indigo-600 p-1.5 hover:bg-indigo-50 rounded-lg transition-all cursor-pointer"
                              title="Edit Hook settings"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteWebhookEndpoint(wh.id)}
                              className="text-slate-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                              title="Delete Webhook"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="text-xs font-mono font-bold text-slate-900 truncate" title={wh.url}>
                            {wh.url}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            secret: <code className="bg-slate-200 px-1 py-0.5 rounded font-bold text-slate-650 select-all">{wh.secret}</code>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-slate-205 pt-3 mt-1 space-y-1">
                        <span className="text-[10px] font-bold text-slate-405 uppercase tracking-widest block font-sans">Subscribed Events</span>
                        <div className="flex flex-wrap gap-1">
                          {wh.events.map(ev => (
                            <span key={ev} className="text-[9px] font-mono bg-indigo-50/80 text-indigo-700 font-bold px-2 py-0.5 rounded border border-indigo-100">
                              {ev}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Deliveries Audit Logs block */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider flex items-center gap-1.5 font-sans">
                  Webhook Dispatch & Delivery Journal
                </h3>
                <button
                  onClick={() => fetchWebhookData(activeStore?.id || 'store_1')}
                  className="text-indigo-600 hover:text-indigo-800 font-mono text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all uppercase tracking-wider"
                >
                  <RefreshCw className="w-3 h-3" /> Refresh Journal Logs
                </button>
              </div>

              {deliveries.length === 0 ? (
                <div className="border border-dashed border-slate-200 rounded-2xl py-8 px-4 text-center text-slate-400 text-xs font-medium">
                  No events dispatched yet. Complete checkouts or use the simulator tool to trigger alerts.
                </div>
              ) : (
                <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                  <div className="divide-y divide-slate-100">
                    {deliveries.map(del => {
                      const isExpanded = expandedDeliveryId === del.id;
                      return (
                        <div key={del.id} className="hover:bg-slate-50/50 transition-colors">
                          {/* Row Core summary header */}
                          <div 
                            onClick={() => setExpandedDeliveryId(isExpanded ? null : del.id)}
                            className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-medium text-slate-700 cursor-pointer select-none"
                          >
                            <div className="flex items-center gap-3 shrink-0">
                              {/* Status Badge */}
                              <span className={`px-2.5 py-1 rounded-full font-bold font-mono text-[10px] border flex items-center gap-1 shrink-0 ${
                                del.status === 'success' 
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-110' 
                                  : 'bg-rose-50 text-rose-805 border-rose-110'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${del.status === 'success' ? 'bg-emerald-505' : 'bg-rose-500'}`}></span>
                                {del.statusCode || 'PENDING'}
                              </span>

                              {/* Event Badge */}
                              <span className="bg-slate-100 text-[#111827] text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-slate-200">
                                {del.event}
                              </span>
                            </div>

                            <div className="flex-1 font-mono text-[11px] text-slate-600 truncate text-left sm:px-2">
                              {del.url}
                            </div>

                            <div className="flex items-center gap-2 text-[10px] text-slate-405 font-mono font-semibold shrink-0">
                              <Clock className="w-3.5 h-3.5 text-slate-300" />
                              <span>{new Date(del.timestamp).toLocaleTimeString()}</span>
                            </div>
                          </div>

                          {/* Expanded payload detail drawer panel */}
                          {isExpanded && (
                            <div className="bg-slate-50 border-t border-slate-150 p-6 space-y-5 text-xs">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                
                                {/* Request headers and data details */}
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Simulated Request Payload Body</span>
                                    <span className="text-[9px] font-mono bg-slate-200 px-2 py-0.5 rounded text-slate-650 font-bold">X-MoR-Event: {del.event}</span>
                                  </div>
                                  <div className="bg-[#111827] text-indigo-200 p-4 rounded-xl border border-slate-800 text-[10px] font-mono overflow-x-auto max-h-[220px] shadow-inner leading-relaxed">
                                    <pre className="whitespace-pre-wrap">{JSON.stringify(del.payload, null, 2)}</pre>
                                  </div>
                                </div>

                                {/* Response details */}
                                <div className="space-y-3">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Mock HTTP Status Response</span>
                                  <div className="bg-slate-900 text-slate-300 p-4 rounded-xl border border-slate-800 text-[10px] font-mono overflow-auto max-h-[220px] shadow-inner leading-relaxed">
                                    <div>
                                      <span className="text-yellow-400 font-bold">Status:</span> {del.statusCode} {del.status === 'success' ? 'OK' : 'Error'}
                                    </div>
                                    <div className="border-t border-slate-800 my-2 pt-2">
                                      <span className="text-slate-405 font-bold">Headers:</span>
                                      <pre className="text-slate-500 mt-1">
                                        Content-Type: text/plain; charset=UTF-32{"\n"}
                                        Connection: keep-alive{"\n"}
                                        X-Simulated-Delivery: true
                                      </pre>
                                    </div>
                                    <div className="border-t border-slate-800 my-2 pt-2">
                                      <span className="text-slate-405 font-bold">Raw Response payload:</span>
                                      <pre className="text-emerald-400 mt-1 whitespace-pre-wrap">{del.responseBody || '(Empty response body)'}</pre>
                                    </div>
                                  </div>
                                </div>

                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* RIGHT: Active Webhook testing sandbox simulator */}
          <div className="xl:col-span-1 border border-slate-200 rounded-3xl p-6 bg-slate-50/40 space-y-5 relative">
            
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider flex items-center gap-1.5 font-sans">
                <Send className="w-3.5 h-3.5 text-indigo-501" /> Developer Sandbox Test
              </h3>
              <p className="text-[11px] text-slate-505 leading-relaxed font-semibold">
                Manually fire live POST webhooks with customized mock JSON data to verify your receiver script structures.
              </p>
            </div>

            <form onSubmit={handleSimulateWebhook} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-sans">1. Select Event Type</label>
                <select
                  value={simulatorEvent}
                  onChange={(e) => setSimulatorEvent(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs focus:ring-1 focus:ring-indigo-550 focus:outline-hidden"
                  id="simulator-event-select"
                >
                  <option value="order.created">order.created (Approved Checkouts)</option>
                  <option value="subscription.updated">subscription.updated (SaaS update/cancel)</option>
                  <option value="payment.failed">payment.failed (Simulated Checkout Decline)</option>
                  <option value="license.revoked">license.revoked (Deactivation trigger)</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5 font-sans">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">2. Edit JSON Payload Body</label>
                  <span className="text-[10px] font-bold text-indigo-650 flex items-center gap-0.5"><Code className="w-3 h-3" /> JSON</span>
                </div>
                <textarea
                  rows={9}
                  value={simulatorPayload}
                  onChange={(e) => setSimulatorPayload(e.target.value)}
                  className="w-full bg-[#111827] text-indigo-200 border border-slate-800 rounded-xl p-3 text-xs focus:outline-hidden focus:border-indigo-505 font-mono leading-relaxed"
                  placeholder="Paste custom body schema here..."
                  id="simulator-payload-area font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={webhookLoading || webhooks.length === 0}
                className={`w-full font-sans font-black text-xs py-3.5 rounded-xl transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-xs ${
                  webhooks.length === 0 
                  ? 'bg-slate-250 text-slate-400 cursor-not-allowed border border-slate-300'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white active:scale-[0.98]'
                }`}
                id="btn-simulate-webhook-post"
              >
                {webhookLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Routing Request...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-white" />
                    <span>Dispatch Simulated Hook</span>
                  </>
                )}
              </button>
            </form>

            {webhooks.length === 0 && (
              <div className="p-3 bg-yellow-50 text-yellow-805 border border-yellow-200 rounded-xl text-[11px] leading-relaxed flex items-start gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-yellow-600 animate-bounce" />
                <p className="font-medium">Register at least 1 destination Webhook Endpoint to run sample dispatches.</p>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* POPUP MODAL: Generate new store */}
      {showNewStore && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl max-w-md w-full overflow-hidden p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-sans font-black text-[#111827] tracking-tight">Provision SaaS Tenant Store</h3>
              <button 
                onClick={() => setShowNewStore(false)} 
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStore} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-sans">Store Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GlowPixels Elements"
                  value={newStoreName}
                  onChange={(e) => {
                    setNewStoreName(e.target.value);
                    setNewSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''));
                  }}
                  className="w-full border border-slate-200 rounded-xl p-3 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-hidden font-sans"
                  id="new-store-name-field"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-sans">Subdomain Name</label>
                <div className="flex items-center">
                  <span className="bg-slate-50 border border-r-0 border-slate-200 text-slate-550 text-xs px-3 py-3 rounded-l-xl font-mono">
                    https://
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="glowpixels"
                    value={newSubdomain}
                    onChange={(e) => setNewSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                    className="w-full border border-slate-200 p-3 text-xs focus:ring-1 focus:ring-indigo-505 focus:outline-hidden font-mono"
                    id="new-store-subdomain-field"
                  />
                  <span className="bg-slate-50 border border-l-0 border-slate-205 text-slate-550 text-xs px-3 py-3 rounded-r-xl font-mono">
                    .mor.app
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-sans">Vendor Billing Address</label>
                <input
                  type="email"
                  required
                  placeholder="accounting@glowpixels.biz"
                  value={newVendorEmail}
                  onChange={(e) => setNewVendorEmail(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-3 text-xs focus:ring-1 focus:ring-indigo-550 focus:outline-hidden"
                  id="new-store-email-field"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-sans">Theme Accent color</label>
                  <input
                    type="color"
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                    className="w-full h-11 p-1 rounded-xl border border-slate-200 cursor-pointer bg-white"
                    id="new-store-color-field"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-sans">Currency</label>
                  <select
                    value={newCurrency}
                    onChange={(e) => setNewCurrency(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-3 text-xs focus:ring-1 focus:ring-indigo-550 focus:outline-hidden bg-white hover:border-slate-350"
                    id="new-store-currency-field"
                  >
                    <option value="USD">USD (United States Dollar)</option>
                    <option value="ZWG">ZWG (Zimbabwe Gold)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#111827] hover:bg-slate-800 text-yellow-400 font-sans font-extrabold text-xs py-3.5 rounded-xl transition-all text-center tracking-wide shadow-sm cursor-pointer"
                id="btn-submit-new-store"
              >
                Launch Multi-tenant Tenant Store
              </button>
            </form>
          </div>
        </div>
      )}

      {/* POPUP MODAL: Create Product / Multipart upload layout */}
      {showNewProduct && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl max-w-lg w-full overflow-hidden p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-sans font-black text-[#111827] flex items-center gap-2">
                <Upload className="w-5 h-5 text-indigo-505 animate-bounce" /> Upload Product & Secure Files
              </h3>
              <button 
                onClick={() => setShowNewProduct(false)} 
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-sans">Product Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cinnabar Cyberpunk UI Kit"
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-3 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-hidden font-sans"
                    id="new-prod-title"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-sans">Product Type</label>
                  <select
                    value={prodType}
                    onChange={(e) => setProdType(e.target.value as any)}
                    className="w-full border border-slate-200 rounded-xl p-3 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-hidden bg-white hover:border-slate-300"
                    id="new-prod-type"
                  >
                    <option value="download">Single Digital Download File</option>
                    <option value="sub_1">Tiered Software SaaS Subscription</option>
                    <option value="subscription">Recurring Subscriptions</option>
                    <option value="bundle">Bundled Assets Pack</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-sans">Description</label>
                <textarea
                  placeholder="Describe your digital files, tiered access codes, or yearly sub benefits."
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-3 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-hidden h-20"
                  id="new-prod-desc"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-sans">Pricing Scheme</label>
                  <select
                    value={prodPriceType}
                    onChange={(e) => setProdPriceType(e.target.value as any)}
                    className="w-full border border-slate-200 rounded-xl p-3 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-hidden bg-white hover:border-slate-300"
                    id="new-prod-pricing-scheme"
                  >
                    <option value="fixed">Fixed Price</option>
                    <option value="pwyw">Pay What You Want (PWYW)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-sans">
                    {prodPriceType === 'fixed' ? 'Price' : 'Recommended Price'} ({activeStore?.currency || 'USD'})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-3 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-hidden font-mono"
                    id="new-prod-price"
                  />
                </div>
              </div>

              {prodPriceType === 'pwyw' && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-sans">Minimum Accepted Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={prodMinPrice}
                    onChange={(e) => setProdMinPrice(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-3 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-hidden font-mono"
                    id="new-prod-min-price"
                  />
                </div>
              )}

              {prodType === 'subscription' && (
                <div>
                  <label className="block text-[10px] font-bold text-[#111827] uppercase tracking-wider mb-1.5 font-sans">Recurring Billing Cycle</label>
                  <select
                    value={prodInterval}
                    onChange={(e) => setProdInterval(e.target.value as any)}
                    className="w-full border border-slate-200 rounded-xl p-3 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-hidden bg-white hover:border-slate-300"
                    id="new-prod-billing-cycle"
                  >
                    <option value="weekly">Every Week recurring</option>
                    <option value="monthly">Every Month recurring</option>
                    <option value="yearly">Every Year recurring</option>
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="prod-license-check"
                    checked={prodLicense}
                    onChange={(e) => setProdLicense(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-650 focus:ring-indigo-500"
                  />
                  <label htmlFor="prod-license-check" className="text-xs font-sans font-bold text-slate-705">
                    Generate License Keys
                  </label>
                </div>
                {prodLicense && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-405 uppercase tracking-wider mb-1 font-sans">Max Activations</label>
                    <input
                      type="number"
                      value={prodMaxActs}
                      onChange={(e) => setProdMaxActs(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-hidden font-mono"
                      id="new-prod-max-activations"
                    />
                  </div>
                )}
              </div>

              {/* Genuine Multi-part Physical File Upload Fields */}
              <div className="bg-slate-50 border border-dashed border-slate-305 rounded-2xl p-5 space-y-4">
                <p className="text-xs font-sans font-bold text-slate-755 flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-indigo-600" /> Product Local Media & Core Assets File Upload
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-white border border-slate-200 rounded-xl p-3 text-[11px] flex flex-col justify-between">
                    <div>
                      <span className="font-sans font-bold text-slate-550 block mb-1">Thumbnail Media (Image)</span>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => setMediaFile(e.target.files?.[0] || null)}
                        className="w-full text-[10px]"
                        id="upload-media-file"
                      />
                    </div>
                    {mediaPreviewUrl ? (
                      <div className="mt-2.5 relative rounded-xl overflow-hidden border border-slate-200 h-24 bg-slate-50 flex items-center justify-center" id="media-preview-container">
                        <img 
                          src={mediaPreviewUrl} 
                          alt="Uploaded product thumbnail preview" 
                          className="h-full w-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <button
                          type="button"
                          onClick={() => setMediaFile(null)}
                          className="absolute top-1.5 right-1.5 bg-slate-900/80 text-white hover:bg-slate-950 rounded-full p-1 transition-all cursor-pointer"
                          title="Remove image"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : mediaFile ? (
                      <span className="text-[9px] text-emerald-650 font-bold font-mono mt-1 block">
                        Selected: {mediaFile.name}
                      </span>
                    ) : (
                      <div className="mt-2 px-2 py-3 border border-dashed border-slate-200 rounded-lg text-center text-slate-400 font-sans text-[10px]">
                        No image preview available
                      </div>
                    )}
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-3 text-[11px]">
                    <span className="font-sans font-bold text-slate-550 block mb-1">Core Deliverable (.zip / .dmg)</span>
                    <input 
                      type="file"
                      onChange={(e) => setDownloadFile(e.target.files?.[0] || null)}
                      className="w-full text-[10px]"
                      id="upload-deliverable-file"
                    />
                    {downloadFile && (
                      <span className="text-[9px] text-emerald-655 font-bold font-mono mt-1 block">
                        Selected: {downloadFile.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="w-full bg-[#111827] hover:bg-slate-800 text-yellow-400 font-sans font-extrabold text-xs py-3.5 rounded-xl transition-all text-center flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
                id="btn-submit-upload-product"
              >
                {uploading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Uploading local multipart payloads...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" /> Publish Digital SKU & Host Assets
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* POPUP MODAL: Edit Product / Multipart upload layout */}
      {showEditProduct && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-101 shadow-xl max-w-lg w-full overflow-hidden p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-sans font-black text-[#111827] flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-indigo-505 animate-pulse" /> Edit SKU & Host Assets
              </h3>
              <button 
                onClick={() => setShowEditProduct(null)} 
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateProduct} className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-sans">Product Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cinnabar Cyberpunk UI Kit"
                    value={editProdName}
                    onChange={(e) => setEditProdName(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-3 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-hidden font-sans"
                    id="edit-prod-title"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-sans">Product Type</label>
                  <select
                    value={editProdType}
                    onChange={(e) => setEditProdType(e.target.value as any)}
                    className="w-full border border-slate-200 rounded-xl p-3 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-hidden bg-white hover:border-slate-300"
                    id="edit-prod-type"
                  >
                    <option value="download">Single Digital Download File</option>
                    <option value="sub_1">Tiered Software SaaS Subscription</option>
                    <option value="subscription">Recurring Subscriptions</option>
                    <option value="bundle">Bundled Assets Pack</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-sans">Description</label>
                <textarea
                  placeholder="Describe your digital files, tiered access codes, or yearly sub benefits."
                  value={editProdDesc}
                  onChange={(e) => setEditProdDesc(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-3 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-hidden h-20"
                  id="edit-prod-desc"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-sans">Pricing Scheme</label>
                  <select
                    value={editProdPriceType}
                    onChange={(e) => setEditProdPriceType(e.target.value as any)}
                    className="w-full border border-slate-200 rounded-xl p-3 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-hidden bg-white hover:border-slate-300"
                    id="edit-prod-pricing-scheme"
                  >
                    <option value="fixed">Fixed Price</option>
                    <option value="pwyw">Pay What You Want (PWYW)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-sans">
                    {editProdPriceType === 'fixed' ? 'Price' : 'Recommended Price'} ({activeStore?.currency || 'USD'})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editProdPrice}
                    onChange={(e) => setEditProdPrice(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-3 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-hidden font-mono"
                    id="edit-prod-price"
                  />
                </div>
              </div>

              {editProdPriceType === 'pwyw' && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-sans">Minimum Accepted Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editProdMinPrice}
                    onChange={(e) => setEditProdMinPrice(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-3 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-hidden font-mono"
                    id="edit-prod-min-price"
                  />
                </div>
              )}

              {editProdType === 'subscription' && (
                <div>
                  <label className="block text-[10px] font-bold text-[#111827] uppercase tracking-wider mb-1.5 font-sans">Recurring Billing Cycle</label>
                  <select
                    value={editProdInterval}
                    onChange={(e) => setEditProdInterval(e.target.value as any)}
                    className="w-full border border-slate-200 rounded-xl p-3 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-hidden bg-white hover:border-slate-300"
                    id="edit-prod-billing-cycle"
                  >
                    <option value="weekly">Every Week recurring</option>
                    <option value="monthly">Every Month recurring</option>
                    <option value="yearly">Every Year recurring</option>
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="edit-prod-license-check"
                    checked={editProdLicense}
                    onChange={(e) => setEditProdLicense(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-305 text-indigo-650 focus:ring-indigo-505"
                  />
                  <label htmlFor="edit-prod-license-check" className="text-xs font-sans font-bold text-slate-705">
                    Generate License Keys
                  </label>
                </div>
                {editProdLicense && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-405 uppercase tracking-wider mb-1 font-sans">Max Activations</label>
                    <input
                      type="number"
                      value={editProdMaxActs}
                      onChange={(e) => setEditProdMaxActs(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-hidden font-mono"
                      id="edit-prod-max-activations"
                    />
                  </div>
                )}
              </div>

              {/* Genuine Multi-part Physical File Upload Fields */}
              <div className="bg-slate-50 border border-dashed border-slate-305 rounded-2xl p-5 space-y-4">
                <p className="text-xs font-sans font-bold text-slate-755 flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-indigo-600" /> Replace Local Media & Core Assets (Optional)
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-white border border-slate-200 rounded-xl p-3 text-[11px] flex flex-col justify-between">
                    <div>
                      <span className="font-sans font-bold text-slate-550 block mb-1">Thumbnail Media (Image)</span>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => setEditMediaFile(e.target.files?.[0] || null)}
                        className="w-full text-[10px]"
                        id="edit-upload-media-file"
                      />
                    </div>
                    {editMediaPreviewUrl ? (
                      <div className="mt-2.5 relative rounded-xl overflow-hidden border border-slate-200 h-24 bg-slate-50 flex items-center justify-center">
                        <img 
                          src={editMediaPreviewUrl} 
                          alt="Uploaded product thumbnail preview" 
                          className="h-full w-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <button
                          type="button"
                          onClick={() => setEditMediaFile(null)}
                          className="absolute top-1.5 right-1.5 bg-slate-900/80 text-white hover:bg-slate-950 rounded-full p-1 transition-all cursor-pointer"
                          title="Remove image"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : editMediaFile ? (
                      <span className="text-[9px] text-emerald-650 font-bold font-mono mt-1 block">
                        Selected: {editMediaFile.name}
                      </span>
                    ) : showEditProduct.mediaFile ? (
                      <div className="mt-2.5 relative rounded-xl overflow-hidden border border-slate-200 h-24 bg-slate-50 flex items-center justify-center">
                        <img 
                          src={`/uploads/${showEditProduct.mediaFile}`} 
                          alt="Current product thumbnail" 
                          className="h-full w-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    ) : (
                      <div className="mt-2 px-2 py-3 border border-dashed border-slate-200 rounded-lg text-center text-slate-400 font-sans text-[10px]">
                        No image preview available
                      </div>
                    )}
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-3 text-[11px]">
                    <span className="font-sans font-bold text-slate-550 block mb-1">Core Deliverable (.zip / .dmg)</span>
                    <input 
                      type="file"
                      onChange={(e) => setEditDownloadFile(e.target.files?.[0] || null)}
                      className="w-full text-[10px]"
                      id="edit-upload-deliverable-file"
                    />
                    {editDownloadFile ? (
                      <span className="text-[9px] text-emerald-655 font-bold font-mono mt-1 block">
                        Selected: {editDownloadFile.name}
                      </span>
                    ) : showEditProduct.downloadFile ? (
                      <span className="text-[9px] text-indigo-650 font-medium font-mono mt-2 block break-all">
                        Keep current: {showEditProduct.downloadFile.substring(0, 20)}...
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={editUploading}
                className="w-full bg-[#111827] hover:bg-slate-800 text-yellow-405 font-sans font-extrabold text-xs py-3.5 rounded-xl transition-all text-center flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
                id="btn-submit-update-product"
              >
                {editUploading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Saving specialized details...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 text-emerald-450" /> Save Product Changes
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* POPUP MODAL: Register Webhook Endpoint */}
      {showNewWebhook && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in animate-duration-200" id="modal-new-webhook">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl max-w-md w-full overflow-hidden p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-sm font-sans font-black text-[#111827] tracking-tight flex items-center gap-1.5 uppercase">
                <Globe className="w-4 h-4 text-indigo-505" /> Add Webhook Subscription
              </h3>
              <button 
                onClick={() => setShowNewWebhook(false)} 
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateWebhookEndpoint} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-sans">Endpoint Destination URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://yourdomain.com/webhooks/receiver"
                  value={whUrl}
                  onChange={(e) => setWhUrl(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-3 text-xs focus:ring-1 focus:ring-indigo-550 focus:outline-hidden font-mono"
                  id="webhook-url-field"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-sans">Event Subscriptions</label>
                <div className="space-y-2.5 max-h-[140px] overflow-y-auto border border-slate-200 rounded-xl p-3 pr-1 bg-slate-50/50">
                  {['order.created', 'subscription.updated', 'payment.failed', 'license.revoked'].map(ev => {
                    const isSelected = whEvents.includes(ev);
                    return (
                      <label key={ev} className="flex items-center gap-2 text-xs font-mono font-bold text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {
                            if (isSelected) {
                              setWhEvents(whEvents.filter(x => x !== ev));
                            } else {
                              setWhEvents([...whEvents, ev]);
                            }
                          }}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-501"
                        />
                        <span>{ev}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-sans">Endpoint Status</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setWhStatus('active')}
                    className={`p-3 rounded-xl border text-xs font-sans font-bold cursor-pointer transition-all ${
                      whStatus === 'active' 
                      ? 'bg-emerald-50 text-emerald-805 border-emerald-300 shadow-xs' 
                      : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    Active
                  </button>
                  <button
                    type="button"
                    onClick={() => setWhStatus('inactive')}
                    className={`p-3 rounded-xl border text-xs font-sans font-bold cursor-pointer transition-all ${
                      whStatus === 'inactive' 
                      ? 'bg-slate-100 text-slate-805 border-slate-350 shadow-xs' 
                      : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    Inactive
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#111827] hover:bg-slate-850 text-yellow-400 font-sans font-extrabold text-xs py-3.5 rounded-xl transition-all text-center tracking-wide"
                id="btn-submit-new-webhook"
              >
                Register Webhook Subscription
              </button>
            </form>
          </div>
        </div>
      )}

      {/* POPUP MODAL: Edit Webhook Endpoint */}
      {showEditWebhook && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in animate-duration-200" id="modal-edit-webhook">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl max-w-md w-full overflow-hidden p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-sm font-sans font-black text-[#111827] tracking-tight flex items-center gap-1.5 uppercase">
                <Globe className="w-4 h-4 text-indigo-505" /> Edit Webhook Settings
              </h3>
              <button 
                onClick={() => setShowEditWebhook(null)} 
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateWebhookEndpoint} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-sans">Endpoint Destination URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://yourdomain.com/webhooks/receiver"
                  value={whUrl}
                  onChange={(e) => setWhUrl(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-3 text-xs focus:ring-1 focus:ring-indigo-550 focus:outline-hidden font-mono"
                  id="edit-webhook-url-field"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-sans">Event Subscriptions</label>
                <div className="space-y-2.5 max-h-[140px] overflow-y-auto border border-slate-200 rounded-xl p-3 pr-1 bg-slate-50/50">
                  {['order.created', 'subscription.updated', 'payment.failed', 'license.revoked'].map(ev => {
                    const isSelected = whEvents.includes(ev);
                    return (
                      <label key={ev} className="flex items-center gap-2 text-xs font-mono font-bold text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {
                            if (isSelected) {
                              setWhEvents(whEvents.filter(x => x !== ev));
                            } else {
                              setWhEvents([...whEvents, ev]);
                            }
                          }}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-501"
                        />
                        <span>{ev}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-sans">Endpoint Status</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setWhStatus('active')}
                    className={`p-3 rounded-xl border text-xs font-sans font-bold cursor-pointer transition-all ${
                      whStatus === 'active' 
                      ? 'bg-emerald-50 text-emerald-805 border-emerald-300 shadow-xs' 
                      : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    Active
                  </button>
                  <button
                    type="button"
                    onClick={() => setWhStatus('inactive')}
                    className={`p-3 rounded-xl border text-xs font-sans font-bold cursor-pointer transition-all ${
                      whStatus === 'inactive' 
                      ? 'bg-slate-100 text-slate-850 border-slate-350 shadow-xs' 
                      : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    Inactive
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#111827] hover:bg-slate-850 text-yellow-400 font-sans font-extrabold text-xs py-3.5 rounded-xl transition-all text-center tracking-wide"
                id="btn-edit-webhook-submit"
              >
                Apply Webhook Configuration Updates
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
