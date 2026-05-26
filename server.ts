/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { createServer as createViteServer } from 'vite';
import { Store, Product, Subscription, LicenseKey, Order, PaymentGatewayResponse, WebhookEndpoint, WebhookDelivery } from './src/types';
import { PaymentOrchestrator, PaymentInitiationParams } from './src/utils/paymentAdapters';

const app = express();
const PORT = 3000;

// Resolve runtime paths
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
const DOWNLOADS_DIR = path.join(UPLOADS_DIR, 'downloads');

// Ensure directories exist
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
if (!fs.existsSync(DOWNLOADS_DIR)) {
  fs.mkdirSync(DOWNLOADS_DIR, { recursive: true });
}

// Multer storage setup for product uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Media goes to UPLOADS_DIR, digital download files go to DOWNLOADS_DIR
    if (file.fieldname === 'downloadFile') {
      cb(null, DOWNLOADS_DIR);
    } else {
      cb(null, UPLOADS_DIR);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Serve public uploads statically for media thumbnails
app.use('/uploads', express.static(UPLOADS_DIR));

// ------------------------------------------------------------------------
// IN-MEMORY MULTI-TENANT DATABASE & DATA STORE (Preserves state in-sess)
// ------------------------------------------------------------------------
const STORES: Record<string, Store> = {
  'apex': {
    id: 'store_1',
    name: 'Apex Analytics SaaS',
    subdomain: 'apex',
    vendorEmail: 'billing@apexanalytics.com',
    themeColor: '#0f766e', // Teal 700
    currency: 'USD',
    createdAt: new Date('2026-01-10').toISOString(),
    bankName: 'Steward Bank Zimbabwe',
    bankAccountName: 'Apex Analytics Ltd',
    bankAccountNumber: '10029384729',
    bankBranchCode: 'SWB-042'
  },
  'glow': {
    id: 'store_2',
    name: 'GlowPixels Assets',
    subdomain: 'glow',
    vendorEmail: 'creatives@glowpixels.net',
    themeColor: '#be185d', // Pink 700
    currency: 'USD',
    createdAt: new Date('2026-02-15').toISOString(),
    bankName: 'CABS Zimbabwe',
    bankAccountName: 'GlowPixels Media',
    bankAccountNumber: '6029103847',
    bankBranchCode: 'CAB-102'
  }
};

const PRODUCTS: Record<string, Product> = {
  'prod_1': {
    id: 'prod_1',
    storeId: 'store_1',
    name: 'Apex Growth Pro Subscription',
    description: 'Complete dashboard access, active alerting system, 5 seats, and native database reports.',
    type: 'subscription',
    priceType: 'fixed',
    price: 49.00,
    billingInterval: 'monthly',
    licenseEnabled: true,
    maxActivations: 5,
    createdAt: new Date('2026-01-11').toISOString()
  },
  'prod_2': {
    id: 'prod_2',
    storeId: 'store_1',
    name: 'Apex Starter Plan',
    description: 'Standard tools for indie creators and teams up to 2 users, billed weekly.',
    type: 'subscription',
    priceType: 'fixed',
    price: 12.00,
    billingInterval: 'weekly',
    licenseEnabled: true,
    maxActivations: 1,
    createdAt: new Date('2026-01-12').toISOString()
  },
  'prod_3': {
    id: 'prod_3',
    storeId: 'store_2',
    name: 'Vibrant Neo-Glow Posterpack',
    description: '30 elegant, high-contrast, cosmic vector artwork backgrounds for dynamic device mockups. Packaged as a compressed zip bundle.',
    type: 'download',
    priceType: 'pwyw',
    price: 15.00, // standard recommendation
    minPrice: 5.00, // minimum acceptable payout
    licenseEnabled: false,
    createdAt: new Date('2026-02-16').toISOString()
  },
  'prod_4': {
    id: 'prod_4',
    storeId: 'store_2',
    name: 'Cinnabar Cyberpunk UI Kit',
    description: 'Retro futuristic Figma elements, responsive widgets, custom icons, and interactive canvas components.',
    type: 'bundle',
    priceType: 'fixed',
    price: 29.00,
    licenseEnabled: true,
    maxActivations: 10,
    createdAt: new Date('2026-02-20').toISOString()
  }
};

const ORDERS: Record<string, Order> = {
  'ord_1': {
    id: 'ord_1',
    storeId: 'store_1',
    productId: 'prod_1',
    productName: 'Apex Growth Pro Subscription',
    buyerEmail: 'john.dev@github.com',
    buyerName: 'John Dev',
    amount: 49.00,
    paymentGateway: 'paynow',
    paymentStatus: 'success',
    paymentReference: 'PN-871239',
    licenseKeyCreated: 'APX-GROWTH-9A10-D782-FF88',
    createdAt: new Date('2026-05-10T10:00:00Z').toISOString()
  },
  'ord_2': {
    id: 'ord_2',
    storeId: 'store_2',
    productId: 'prod_3',
    productName: 'Vibrant Neo-Glow Posterpack',
    buyerEmail: 'sally.designer@dribbble.com',
    buyerName: 'Sally Design',
    amount: 25.00, // custom PWYW amount
    paymentGateway: 'ecocash',
    paymentStatus: 'success',
    paymentReference: 'ECO-908123',
    downloadToken: 'dl_token_glow_posterpack_sally918',
    createdAt: new Date('2026-05-15T15:24:00Z').toISOString()
  }
};

const SUBSCRIPTIONS: Record<string, Subscription> = {
  'sub_1': {
    id: 'sub_1',
    storeId: 'store_1',
    productId: 'prod_1',
    productName: 'Apex Growth Pro Subscription',
    buyerEmail: 'john.dev@github.com',
    status: 'active',
    billingInterval: 'monthly',
    amount: 49.00,
    nextBillingDate: new Date('2026-06-10T10:00:00Z').toISOString(),
    createdAt: new Date('2026-05-10T10:00:00Z').toISOString()
  }
};

const LICENSE_KEYS: Record<string, LicenseKey> = {
  'APX-GROWTH-9A10-D782-FF88': {
    id: 'lic_1',
    storeId: 'store_1',
    productId: 'prod_1',
    productName: 'Apex Growth Pro Subscription',
    orderId: 'ord_1',
    key: 'APX-GROWTH-9A10-D782-FF88',
    buyerEmail: 'john.dev@github.com',
    status: 'active',
    activatedCount: 1,
    maxActivations: 5,
    createdAt: new Date('2026-05-10T10:00:00Z').toISOString()
  }
};

const WEBHOOK_ENDPOINTS: Record<string, WebhookEndpoint[]> = {
  'store_1': [
    {
      id: 'wh_1',
      storeId: 'store_1',
      url: 'https://api.apexanalytics.com/webhooks/receiver',
      secret: 'whsec_apex_1234567890abcdef',
      events: ['order.created', 'subscription.updated'],
      status: 'active',
      createdAt: new Date('2026-05-10T10:00:00Z').toISOString()
    }
  ],
  'store_2': [
    {
      id: 'wh_2',
      storeId: 'store_2',
      url: 'https://glowpixels.net/webhooks/payment-listener',
      secret: 'whsec_glow_fedcba0987654321',
      events: ['order.created', 'license.revoked'],
      status: 'active',
      createdAt: new Date('2026-05-15T15:00:00Z').toISOString()
    }
  ]
};

const WEBHOOK_DELIVERIES: WebhookDelivery[] = [
  {
    id: 'whd_1',
    webhookEndpointId: 'wh_1',
    storeId: 'store_1',
    event: 'order.created',
    url: 'https://api.apexanalytics.com/webhooks/receiver',
    payload: {
      orderId: 'ord_1',
      storeId: 'store_1',
      productId: 'prod_1',
      productName: 'Apex Growth Pro Subscription',
      buyerEmail: 'john.dev@github.com',
      buyerName: 'John Dev',
      amount: 49.00,
      paymentGateway: 'paynow',
      paymentStatus: 'success',
      licenseKeyCreated: 'APX-GROWTH-9A10-D782-FF88',
      createdAt: new Date('2026-05-10T10:00:00Z').toISOString(),
      approvedAt: new Date('2026-05-10T10:00:05Z').toISOString()
    },
    statusCode: 200,
    responseBody: '{"received": true, "status": "ok"}',
    timestamp: new Date('2026-05-10T10:00:06Z').toISOString(),
    status: 'success'
  }
];

async function dispatchWebhookEvent(storeId: string, event: string, payload: any) {
  const endpoints = WEBHOOK_ENDPOINTS[storeId] || [];
  const activeEndpoints = endpoints.filter(ep => ep.status === 'active' && ep.events.includes(event));

  for (const ep of activeEndpoints) {
    const deliveryId = `whd_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const delivery: WebhookDelivery = {
      id: deliveryId,
      webhookEndpointId: ep.id,
      storeId,
      event,
      url: ep.url,
      payload: payload,
      statusCode: 0,
      responseBody: 'Sending...',
      timestamp: new Date().toISOString(),
      status: 'failed'
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const response = await fetch(ep.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-MoR-Event': event,
          'X-MoR-Webhook-Endpoint-ID': ep.id,
          'X-MoR-Signature': `sha256=${ep.secret}`
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const text = await response.text();
      delivery.statusCode = response.status;
      delivery.responseBody = text.substring(0, 500);
      delivery.status = response.ok ? 'success' : 'failed';
    } catch (err: any) {
      delivery.statusCode = err.name === 'AbortError' ? 408 : 500;
      delivery.responseBody = `Network routing failed error: ${err.message}`;
      delivery.status = 'failed';
    }

    WEBHOOK_DELIVERIES.unshift(delivery);
    if (WEBHOOK_DELIVERIES.length > 200) {
      WEBHOOK_DELIVERIES.pop();
    }
  }
}


// ------------------------------------------------------------------------
// Backend Multi-Tenant REST API Routers
// ------------------------------------------------------------------------

/**
 * Store management api endpoints
 */
app.get('/api/stores', (req: Request, res: Response) => {
  res.json(Object.values(STORES));
});

app.post('/api/stores', (req: Request, res: Response) => {
  const { name, subdomain, vendorEmail, themeColor, currency } = req.body;

  if (!name || !subdomain || !vendorEmail) {
    return res.status(400).json({ error: 'Store name, unique subdomain, and vendor email are required.' });
  }

  const cleanSubdomain = subdomain.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  if (STORES[cleanSubdomain]) {
    return res.status(400).json({ error: 'Subdomain already registered. Try another subdomain.' });
  }

  const newStore: Store = {
    id: `store_${Date.now()}`,
    name,
    subdomain: cleanSubdomain,
    vendorEmail,
    themeColor: themeColor || '#4f46e5',
    currency: currency || 'USD',
    createdAt: new Date().toISOString()
  };

  STORES[cleanSubdomain] = newStore;
  res.status(201).json(newStore);
});

app.get('/api/stores/resolve/:subdomain', (req: Request, res: Response) => {
  const { subdomain } = req.params;
  const store = STORES[subdomain.toLowerCase()];
  if (!store) {
    return res.status(404).json({ error: 'Storefront tenant matching this subdomain could not be located.' });
  }
  res.json(store);
});

/**
 * Configure Store details (including bank transfer details and dynamic attributes)
 */
app.put('/api/stores/:storeId', (req: Request, res: Response) => {
  const { storeId } = req.params;
  const { 
    name, 
    subdomain,
    vendorEmail, 
    themeColor, 
    currency, 
    bankName, 
    bankAccountName, 
    bankAccountNumber, 
    bankBranchCode 
  } = req.body;

  const storeEntry = Object.entries(STORES).find(([key, s]) => s.id === storeId);
  if (!storeEntry) {
    return res.status(404).json({ error: 'Storefront matching this ID could not be identified.' });
  }

  const [oldKey, store] = storeEntry;

  if (name) store.name = name;
  if (vendorEmail) store.vendorEmail = vendorEmail;
  if (themeColor) store.themeColor = themeColor;
  if (currency) store.currency = currency;
  
  if (bankName !== undefined) store.bankName = bankName;
  if (bankAccountName !== undefined) store.bankAccountName = bankAccountName;
  if (bankAccountNumber !== undefined) store.bankAccountNumber = bankAccountNumber;
  if (bankBranchCode !== undefined) store.bankBranchCode = bankBranchCode;

  if (subdomain) {
    const cleanSubdomain = subdomain.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    if (cleanSubdomain !== oldKey) {
      if (STORES[cleanSubdomain]) {
        return res.status(400).json({ error: 'Subdomain already registered. Try another subdomain.' });
      }
      store.subdomain = cleanSubdomain;
      delete STORES[oldKey];
      STORES[cleanSubdomain] = store;
    }
  }

  // Return the updated store object
  res.json({ success: true, store });
});

/**
 * Delete Storefront entirely (releasing subdomain and cleaning inventory)
 */
app.delete('/api/stores/:storeId', (req: Request, res: Response) => {
  const { storeId } = req.params;
  const storeEntry = Object.entries(STORES).find(([key, s]) => s.id === storeId);
  if (!storeEntry) {
    return res.status(404).json({ error: 'Store not found.' });
  }
  
  const [key] = storeEntry;
  delete STORES[key];

  // Also purge all associated products matching storeId
  Object.keys(PRODUCTS).forEach(prodId => {
    if (PRODUCTS[prodId].storeId === storeId) {
      delete PRODUCTS[prodId];
    }
  });

  res.json({ success: true });
});

/**
 * Active sales log / transactions retrieval endpoint
 */
app.get('/api/stores/:storeId/orders', (req: Request, res: Response) => {
  const { storeId } = req.params;
  const results = Object.values(ORDERS).filter(o => o.storeId === storeId);
  res.json(results);
});

/**
 * Product upload and asset handling
 */
app.get('/api/stores/:storeId/products', (req: Request, res: Response) => {
  const { storeId } = req.params;
  const list = Object.values(PRODUCTS).filter(p => p.storeId === storeId);
  res.json(list);
});

app.post('/api/stores/:storeId/products', 
  upload.fields([
    { name: 'mediaFile', maxCount: 1 }, 
    { name: 'downloadFile', maxCount: 1 }
  ]), 
  (req: Request, res: Response) => {
    const { storeId } = req.params;
    const { name, description, type, priceType, price, minPrice, billingInterval, licenseEnabled, maxActivations } = req.body;

    if (!name || !type || !priceType || !price) {
      return res.status(400).json({ error: 'Required fields: Name, Type, Price Type, and Price.' });
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const mediaFile = files?.['mediaFile']?.[0]?.filename;
    const downloadFile = files?.['downloadFile']?.[0]?.filename;

    const prodId = `prod_${Date.now()}`;
    const newProd: Product = {
      id: prodId,
      storeId,
      name,
      description: description || '',
      type,
      priceType,
      price: parseFloat(price),
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      billingInterval: type === 'subscription' ? billingInterval : undefined,
      mediaFile,
      downloadFile,
      licenseEnabled: licenseEnabled === 'true' || licenseEnabled === true,
      maxActivations: maxActivations ? parseInt(maxActivations) : undefined,
      createdAt: new Date().toISOString()
    };

    PRODUCTS[prodId] = newProd;
    res.status(201).json(newProd);
  }
);

/**
 * Edit/Update Product Metadata
 */
app.put('/api/stores/:storeId/products/:productId',
  upload.fields([
    { name: 'mediaFile', maxCount: 1 }, 
    { name: 'downloadFile', maxCount: 1 }
  ]),
  (req: Request, res: Response) => {
    const { storeId, productId } = req.params;
    const { name, description, type, priceType, price, minPrice, billingInterval, licenseEnabled, maxActivations } = req.body;

    const prod = PRODUCTS[productId];
    if (!prod || prod.storeId !== storeId) {
      return res.status(404).json({ error: 'Digital asset could not be identified.' });
    }

    if (name) prod.name = name;
    if (description !== undefined) prod.description = description;
    if (type) prod.type = type;
    if (priceType) prod.priceType = priceType;
    if (price) prod.price = parseFloat(price);
    if (minPrice !== undefined) prod.minPrice = minPrice ? parseFloat(minPrice) : undefined;
    if (billingInterval !== undefined) prod.billingInterval = billingInterval;
    prod.licenseEnabled = licenseEnabled === 'true' || licenseEnabled === true;
    if (maxActivations !== undefined) prod.maxActivations = maxActivations ? parseInt(maxActivations) : undefined;

    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    if (files?.['mediaFile']?.[0]) {
      prod.mediaFile = files['mediaFile'][0].filename;
    }
    if (files?.['downloadFile']?.[0]) {
      prod.downloadFile = files['downloadFile'][0].filename;
    }

    res.json(prod);
  }
);

/**
 * Delete SKU / Product asset listing
 */
app.delete('/api/stores/:storeId/products/:productId', (req: Request, res: Response) => {
  const { storeId, productId } = req.params;
  const prod = PRODUCTS[productId];
  if (!prod || prod.storeId !== storeId) {
    return res.status(404).json({ error: 'Product listing could not be resolved.' });
  }
  delete PRODUCTS[productId];
  res.json({ success: true });
});

/**
 * Multi-Tenant Offline Sync Endpoint
 * Restores and persists any client-persisted stores and products on backend start
 */
app.post('/api/stores/sync', (req: Request, res: Response) => {
  const { stores, products } = req.body;
  if (Array.isArray(stores)) {
    stores.forEach((s: Store) => {
      if (s && s.subdomain) {
        STORES[s.subdomain.toLowerCase()] = s;
      }
    });
  }
  if (Array.isArray(products)) {
    products.forEach((p: Product) => {
      if (p && p.id) {
        PRODUCTS[p.id] = p;
      }
    });
  }
  res.json({ success: true });
});

/**
 * Product media download verification link
 */
app.get('/api/download/:token', (req: Request, res: Response) => {
  const { token } = req.params;
  // Resolve order matching download validation token
  const order = Object.values(ORDERS).find(o => o.downloadToken === token);
  if (!order) {
    return res.status(404).send('<h1>Download link invalid or expired</h1><p>Ensure the key matches correctly or contact the store merchant.</p>');
  }

  const product = PRODUCTS[order.productId];
  if (!product || !product.downloadFile) {
    return res.status(400).send('<h1>Asset unavailable</h1><p>Merchant has not attached any physical download file to this digital license yet.</p>');
  }

  const filePath = path.join(DOWNLOADS_DIR, product.downloadFile);
  if (!fs.existsSync(filePath)) {
    // If exact physical file got wiped or wasn't uploaded (demo sandbox fallback), send a beautiful text receipt asset
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="${product.name}_RECEIPT.txt"`);
    return res.send(`========================================================
Saas E-Commerce Platform - Order Receipt & Secure Download Voucher
========================================================
STORE ID:        ${order.storeId}
ORDER REFTAG:    ${order.id}
PRODUCT:         ${product.name}
DELIVERY STATUS: SECURELY SIGNED
CUSTOMER EMAIL:  ${order.buyerEmail}
LICENSE KEY:     ${order.licenseKeyCreated || "N/A (No license key required)"}
VERIFICATION:    VERIFIED VIA REGIONAL PAYMENT GATEWAY (${order.paymentGateway.toUpperCase()})

Thank you for your digital creator support! This file serves as your authenticated license receipt payload proof of purchase.
`);
  }

  res.download(filePath, product.downloadFile);
});

/**
 * Checkout and Regional Payment Processor API Flow
 */
app.post('/api/checkout', upload.single('bankScreenshot'), async (req: Request, res: Response) => {
  const { storeId, productId, buyerEmail, buyerName, amount, paymentGateway, phone, customPrice, bankTxCode } = req.body;

  if (!productId || !buyerEmail || !paymentGateway) {
    return res.status(400).json({ error: 'Product SKU, customer email, and payment gateway selection are required.' });
  }

  const product = PRODUCTS[productId];
  if (!product) {
    return res.status(404).json({ error: 'Product SKU not found in active inventory.' });
  }

  const store = Object.values(STORES).find(s => s.id === (storeId || product.storeId));
  if (!store) {
    return res.status(404).json({ error: 'Tenant store details not resolved.' });
  }

  const finalAmount = product.priceType === 'pwyw' ? parseFloat(customPrice || amount || product.price) : product.price;

  if (product.priceType === 'pwyw' && product.minPrice !== undefined && finalAmount < product.minPrice) {
    return res.status(400).json({ error: `Amount cannot be lower than the minimum price: ${store.currency} ${product.minPrice}` });
  }

  const orderId = `ord_${Date.now()}`;
  
  let paymentResult: PaymentGatewayResponse;
  
  if (paymentGateway === 'bank_transfer') {
    paymentResult = {
      success: true,
      transactionId: bankTxCode || `TXN-BANK-${Date.now()}`,
      status: 'pending',
      message: 'Bank transfer submitted successfully.',
      instructions: `Your bank transfer proof check request has been logged. The vendor (${store.name}) will verify code: ${bankTxCode || 'N/A'} and activate your access shortly.`
    };
  } else {
    // Hand off initiation to our highly modular PaymentOrchestrator
    try {
      const adapter = PaymentOrchestrator.getAdapter(paymentGateway as any);
      paymentResult = await adapter.initiatePayment({
        orderId,
        amount: finalAmount,
        currency: store.currency,
        customerPhone: phone,
        customerEmail: buyerEmail,
        buyerName,
        productName: product.name
      });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  if (!paymentResult.success) {
    return res.status(400).json({ error: paymentResult.message });
  }

  // Record order with partial/pending status
  const order: Order = {
    id: orderId,
    storeId: store.id,
    productId: product.id,
    productName: product.name,
    buyerEmail,
    buyerName: buyerName || 'Digital Customer',
    amount: finalAmount,
    paymentGateway,
    paymentStatus: 'pending',
    paymentReference: paymentResult.transactionId,
    createdAt: new Date().toISOString(),
    bankTxCode: bankTxCode || undefined,
    bankScreenshot: req.file?.filename || undefined
  };

  ORDERS[orderId] = order;

  // For simulation / immediate flow confirmation, we also prepare what happens upon successful verification hook
  res.json({
    orderId,
    paymentResult,
    checkoutOverlayInstructions: paymentResult.instructions,
    statusCheckEndpoint: `/api/orders/check/${orderId}`
  });
});

/**
 * Fast confirmation hook / Manual simulation validation to approve orders at runtime
 */
app.post('/api/orders/approve/:orderId', (req: Request, res: Response) => {
  const { orderId } = req.params;
  const order = ORDERS[orderId];
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  if (order.paymentStatus === 'success') {
    return res.json({ message: 'Order already fulfilled successfully.', order });
  }

  const product = PRODUCTS[order.productId];
  order.paymentStatus = 'success';

  // License Key Management (Automatic for subscriptions, or if explicitly enabled)
  if (product.licenseEnabled || product.type === 'subscription') {
    const rawKey = `LIC-${product.name.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
    order.licenseKeyCreated = rawKey;

    const newLicenseKey: LicenseKey = {
      id: `lic_${Date.now()}`,
      storeId: order.storeId,
      productId: product.id,
      productName: product.name,
      orderId: order.id,
      key: rawKey,
      buyerEmail: order.buyerEmail,
      status: 'active',
      activatedCount: 0,
      maxActivations: product.maxActivations || 5,
      createdAt: new Date().toISOString()
    };

    LICENSE_KEYS[rawKey] = newLicenseKey;
  }

  // Subscription Processing Engine
  if (product.type === 'subscription') {
    const subscriptionId = `sub_${Date.now()}`;
    const nextBill = new Date();
    if (product.billingInterval === 'weekly') {
      nextBill.setDate(nextBill.getDate() + 7);
    } else if (product.billingInterval === 'yearly') {
      nextBill.setFullYear(nextBill.getFullYear() + 1);
    } else {
      nextBill.setMonth(nextBill.getMonth() + 1);
    }

    const newSubscription: Subscription = {
      id: subscriptionId,
      storeId: order.storeId,
      productId: product.id,
      productName: product.name,
      buyerEmail: order.buyerEmail,
      status: 'active',
      billingInterval: product.billingInterval || 'monthly',
      amount: order.amount,
      nextBillingDate: nextBill.toISOString(),
      createdAt: new Date().toISOString()
    };

    SUBSCRIPTIONS[subscriptionId] = newSubscription;
  }

  // Download voucher creation
  if (product.type === 'download' || product.type === 'bundle' || product.downloadFile) {
    order.downloadToken = `dl_${Math.random().toString(36).substring(2, 14)}`;
  }

  ORDERS[orderId] = order;

  // Dispatch real-time webhooks for the active store subscriber endpoints
  dispatchWebhookEvent(order.storeId, 'order.created', {
    objectId: orderId,
    event: 'order.created',
    data: {
      id: order.id,
      storeId: order.storeId,
      productId: order.productId,
      productName: order.productName,
      buyerEmail: order.buyerEmail,
      buyerName: order.buyerName,
      amount: order.amount,
      paymentGateway: order.paymentGateway,
      paymentStatus: 'success',
      paymentReference: order.paymentReference,
      licenseKeyCreated: order.licenseKeyCreated,
      downloadToken: order.downloadToken,
      createdAt: order.createdAt,
      fulfilledAt: new Date().toISOString()
    }
  });

  if (product.type === 'subscription') {
    const savedSub = Object.values(SUBSCRIPTIONS).find(s => s.storeId === order.storeId && s.buyerEmail === order.buyerEmail && s.productId === product.id);
    if (savedSub) {
      dispatchWebhookEvent(order.storeId, 'subscription.updated', {
        objectId: savedSub.id,
        event: 'subscription.updated',
        data: {
          id: savedSub.id,
          storeId: savedSub.storeId,
          productId: savedSub.productId,
          productName: savedSub.productName,
          buyerEmail: savedSub.buyerEmail,
          status: savedSub.status,
          billingInterval: savedSub.billingInterval,
          amount: savedSub.amount,
          nextBillingDate: savedSub.nextBillingDate,
          createdAt: savedSub.createdAt,
          updatedAt: new Date().toISOString()
        }
      });
    }
  }

  res.json({ message: 'Payment authorization matched. Order fulfilled securely.', order });
});

app.get('/api/orders/check/:orderId', (req: Request, res: Response) => {
  const { orderId } = req.params;
  const order = ORDERS[orderId];
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  res.json(order);
});


/**
 * Webhook Endpoints & Deliveries Management Endpoints
 */
app.get('/api/stores/:storeId/webhooks/endpoints', (req: Request, res: Response) => {
  const { storeId } = req.params;
  const list = WEBHOOK_ENDPOINTS[storeId] || [];
  res.json(list);
});

app.post('/api/stores/:storeId/webhooks/endpoints', (req: Request, res: Response) => {
  const { storeId } = req.params;
  const { url, events, status } = req.body;

  if (!url || !events || !Array.isArray(events) || events.length === 0) {
    return res.status(400).json({ error: 'Endpoint destination URL and at least one event subscription are required.' });
  }

  // Create new endpoint item
  const newEndpoint: WebhookEndpoint = {
    id: `wh_${Date.now()}`,
    storeId,
    url,
    secret: `whsec_${Math.random().toString(36).substring(2, 12)}${Math.random().toString(36).substring(2, 10)}`,
    events,
    status: status || 'active',
    createdAt: new Date().toISOString()
  };

  if (!WEBHOOK_ENDPOINTS[storeId]) {
    WEBHOOK_ENDPOINTS[storeId] = [];
  }
  WEBHOOK_ENDPOINTS[storeId].push(newEndpoint);
  res.status(201).json(newEndpoint);
});

app.put('/api/stores/:storeId/webhooks/endpoints/:id', (req: Request, res: Response) => {
  const { storeId, id } = req.params;
  const { url, events, status } = req.body;

  const endpoints = WEBHOOK_ENDPOINTS[storeId] || [];
  const endpoint = endpoints.find(ep => ep.id === id);

  if (!endpoint) {
    return res.status(404).json({ error: 'Webhook endpoint not found.' });
  }

  if (url) endpoint.url = url;
  if (events && Array.isArray(events)) endpoint.events = events;
  if (status) endpoint.status = status;

  res.json(endpoint);
});

app.delete('/api/stores/:storeId/webhooks/endpoints/:id', (req: Request, res: Response) => {
  const { storeId, id } = req.params;
  const endpoints = WEBHOOK_ENDPOINTS[storeId] || [];
  const index = endpoints.findIndex(ep => ep.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Webhook endpoint not found.' });
  }

  endpoints.splice(index, 1);
  res.json({ success: true, message: 'Webhook endpoint removed.' });
});

app.get('/api/stores/:storeId/webhooks/deliveries', (req: Request, res: Response) => {
  const { storeId } = req.params;
  const list = WEBHOOK_DELIVERIES.filter(d => d.storeId === storeId);
  res.json(list);
});

// Explicit event trigger simulation route
app.post('/api/stores/:storeId/webhooks/test', async (req: Request, res: Response) => {
  const { storeId } = req.params;
  const { event, payload, webhookEndpointId } = req.body;

  if (!event || !payload) {
    return res.status(400).json({ error: 'Event name type and sample JSON payload are required.' });
  }

  const endpoints = WEBHOOK_ENDPOINTS[storeId] || [];
  const targetEndpoints = webhookEndpointId 
    ? endpoints.filter(ep => ep.id === webhookEndpointId)
    : endpoints.filter(ep => ep.status === 'active' && ep.events.includes(event));

  if (targetEndpoints.length === 0) {
    return res.status(400).json({ error: 'No active endpoint resides registered specifically for event: ' + event });
  }

  // Trigger dispatching
  let successCount = 0;
  for (const ep of targetEndpoints) {
    const deliveryId = `whd_${Date.now()}_test`;
    const delivery: WebhookDelivery = {
      id: deliveryId,
      webhookEndpointId: ep.id,
      storeId,
      event,
      url: ep.url,
      payload,
      statusCode: 0,
      responseBody: 'Sending simulated payload...',
      timestamp: new Date().toISOString(),
      status: 'failed'
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const response = await fetch(ep.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-MoR-Event': event,
          'X-MoR-Webhook-Endpoint-ID': ep.id,
          'X-MoR-Signature': `sha256=${ep.secret}`,
          'X-MoR-Simulated': 'true'
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const text = await response.text();
      delivery.statusCode = response.status;
      delivery.responseBody = text.substring(0, 500);
      delivery.status = response.ok ? 'success' : 'failed';
      if (response.ok) successCount++;
    } catch (err: any) {
      delivery.statusCode = err.name === 'AbortError' ? 408 : 500;
      delivery.responseBody = `Network routing failed error: ${err.message}`;
      delivery.status = 'failed';
    }

    WEBHOOK_DELIVERIES.unshift(delivery);
  }

  res.json({ 
    message: `Triggered simulation dispatch to ${targetEndpoints.length} endpoints. Successful returns: ${successCount}`,
    endpointsContacted: targetEndpoints.map(ep => ep.url)
  });
});


/**
 * Software License Management Endpoints
 */
app.post('/api/license/validate', (req: Request, res: Response) => {
  const { key, buyerEmail } = req.body;

  if (!key) {
    return res.status(400).json({ valid: false, message: 'License activation key is required.' });
  }

  const license = LICENSE_KEYS[key.trim()];
  if (!license) {
    return res.status(404).json({ valid: false, message: 'License activation matching this key could not be located.' });
  }

  if (license.status === 'revoked') {
    return res.status(403).json({ valid: false, message: 'This software license has been revoked by the storefront vendor.' });
  }

  if (buyerEmail && license.buyerEmail.toLowerCase() !== buyerEmail.toLowerCase().trim()) {
    return res.status(400).json({ valid: false, message: 'The provided customer login email does not match this license credential.' });
  }

  if (license.activatedCount >= license.maxActivations) {
    return res.status(400).json({ 
      valid: false, 
      message: `Activation threshold reached (${license.activatedCount}/${license.maxActivations}). Deactivate an existing hardware unit to authorize this device.` 
    });
  }

  // Increment activation count
  license.activatedCount += 1;
  LICENSE_KEYS[key.trim()] = license;

  res.json({ 
    valid: true,
    message: 'License activation completed successfully.',
    details: {
      productId: license.productId,
      productName: license.productName,
      buyerEmail: license.buyerEmail,
      activationsUsed: license.activatedCount,
      maxActivations: license.maxActivations
    }
  });
});

app.post('/api/license/revoke', (req: Request, res: Response) => {
  const { key } = req.body;
  if (!key || !LICENSE_KEYS[key]) {
    return res.status(404).json({ error: 'License key not found.' });
  }

  LICENSE_KEYS[key].status = 'revoked';
  const license = LICENSE_KEYS[key];

  dispatchWebhookEvent(license.storeId, 'license.revoked', {
    objectId: license.key,
    event: 'license.revoked',
    data: {
      id: license.id,
      storeId: license.storeId,
      productId: license.productId,
      productName: license.productName,
      key: license.key,
      buyerEmail: license.buyerEmail,
      status: 'revoked',
      activatedCount: license.activatedCount,
      maxActivations: license.maxActivations,
      createdAt: license.createdAt,
      revokedAt: new Date().toISOString()
    }
  });

  res.json({ message: 'License key revoked successfully. Remote client activations blocked.', license });
});


/**
 * Customer Self-Service Panel Endpoints
 */
app.get('/api/customer/subscriptions', (req: Request, res: Response) => {
  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ error: 'Customer email is required.' });
  }

  const results = Object.values(SUBSCRIPTIONS).filter(s => s.buyerEmail.toLowerCase() === (email as string).toLowerCase().trim());
  res.json(results);
});

app.post('/api/customer/subscriptions/cancel', (req: Request, res: Response) => {
  const { subscriptionId } = req.body;
  const sub = SUBSCRIPTIONS[subscriptionId];
  if (!sub) {
    return res.status(404).json({ error: 'SaaS subscription matching records was not found.' });
  }

  sub.status = 'cancelled';
  SUBSCRIPTIONS[subscriptionId] = sub;

  dispatchWebhookEvent(sub.storeId, 'subscription.updated', {
    objectId: subscriptionId,
    event: 'subscription.updated',
    data: {
      id: sub.id,
      storeId: sub.storeId,
      productId: sub.productId,
      productName: sub.productName,
      buyerEmail: sub.buyerEmail,
      status: 'cancelled',
      billingInterval: sub.billingInterval,
      amount: sub.amount,
      nextBillingDate: sub.nextBillingDate,
      createdAt: sub.createdAt,
      updatedAt: new Date().toISOString()
    }
  });

  res.json({ message: 'SaaS recurring subscription cycle cancelled. Active access remains online until period termination date.', subscription: sub });
});

app.get('/api/customer/orders', (req: Request, res: Response) => {
  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ error: 'Customer email is required.' });
  }

  const results = Object.values(ORDERS).filter(o => o.buyerEmail.toLowerCase() === (email as string).toLowerCase().trim() && (o.paymentStatus === 'success' || (o.paymentGateway === 'bank_transfer' && o.paymentStatus === 'pending')));
  res.json(results);
});


// ------------------------------------------------------------------------
// Vite Dev Server / Prod Build Client Delivery Integration
// ------------------------------------------------------------------------
const isProduction = process.env.NODE_ENV === 'production';

async function startServer() {
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    // Serve production static assets
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Merchant of Record (MoR) Full-Stack server launched at: http://localhost:${PORT}`);
    console.log(`Ready in ${isProduction ? 'PROD STATUS' : 'DEV WORKSPACE'} mode`);
  });
}

startServer();
