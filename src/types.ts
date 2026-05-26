/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Store {
  id: string;
  name: string;
  subdomain: string;
  vendorEmail: string;
  logoUrl?: string;
  themeColor: string;
  currency: string;
  createdAt: string;
  bankName?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
  bankBranchCode?: string;
}

export interface Product {
  id: string;
  storeId: string;
  name: string;
  description: string;
  type: 'download' | 'subscription' | 'bundle';
  priceType: 'fixed' | 'pwyw';
  price: number; // default price or fixed price
  minPrice?: number; // for pay-what-you-want
  billingInterval?: 'weekly' | 'monthly' | 'yearly'; // for SaaS subscriptions
  mediaFile?: string; // name in local upload storage
  downloadFile?: string; // name in local upload digital asset storage
  licenseEnabled: boolean;
  maxActivations?: number; // for software license keys
  createdAt: string;
}

export interface Subscription {
  id: string;
  storeId: string;
  productId: string;
  productName: string;
  buyerEmail: string;
  status: 'active' | 'cancelled' | 'paused';
  billingInterval: 'weekly' | 'monthly' | 'yearly';
  amount: number;
  nextBillingDate: string;
  createdAt: string;
}

export interface LicenseKey {
  id: string;
  storeId: string;
  productId: string;
  productName: string;
  orderId: string;
  key: string;
  buyerEmail: string;
  status: 'active' | 'revoked';
  activatedCount: number;
  maxActivations: number;
  createdAt: string;
}

export interface Order {
  id: string;
  storeId: string;
  productId: string;
  productName: string;
  buyerEmail: string;
  buyerName: string;
  amount: number;
  paymentGateway: 'ecocash' | 'innbucks' | 'omari' | 'paynow' | 'bank_transfer';
  paymentStatus: 'pending' | 'success' | 'failed';
  paymentReference?: string;
  licenseKeyCreated?: string;
  downloadToken?: string;
  createdAt: string;
  bankTxCode?: string;
  bankScreenshot?: string;
}

export interface PaymentGatewayResponse {
  success: boolean;
  transactionId: string;
  status: 'success' | 'pending' | 'failed';
  message: string;
  ussdPromptTriggered?: boolean; // Specific to EcoCash direct USSD shortcodes
  instructions?: string;
}

export interface WebhookEndpoint {
  id: string;
  storeId: string;
  url: string;
  secret: string;
  events: string[];
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface WebhookDelivery {
  id: string;
  webhookEndpointId: string;
  storeId: string;
  event: string;
  url: string;
  payload: any;
  statusCode: number;
  responseBody: string;
  timestamp: string;
  status: 'success' | 'failed';
}

