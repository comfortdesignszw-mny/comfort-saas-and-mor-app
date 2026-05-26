/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PaymentGatewayResponse } from '../types';

export interface PaymentInitiationParams {
  orderId: string;
  amount: number;
  currency: string;
  customerPhone?: string; // Required for EcoCash/Omari USSD push
  customerEmail: string;
  buyerName: string;
  productName: string;
}

export interface IPaymentAdapter {
  gatewayId: 'ecocash' | 'innbucks' | 'omari' | 'paynow';
  name: string;
  initiatePayment(params: PaymentInitiationParams): Promise<PaymentGatewayResponse>;
  verifyPayment(transactionId: string): Promise<'success' | 'pending' | 'failed'>;
}

/**
 * EcoCash Merchant Adapter
 * Simulates triggering of direct USSD push messages (Econet Zimbabwe API integration point)
 */
export class EcoCashPaymentAdapter implements IPaymentAdapter {
  gatewayId = 'ecocash' as const;
  name = 'EcoCash';

  async initiatePayment(params: PaymentInitiationParams): Promise<PaymentGatewayResponse> {
    const { orderId, amount, customerPhone, currency } = params;

    if (!customerPhone) {
      return {
        success: false,
        transactionId: `eco_failed_${Date.now()}`,
        status: 'failed',
        message: 'Mobile number is required for EcoCash USSD Push payment'
      };
    }

    // Format phone: expect format like +26377xxxxxxx or 077xxxxxxx
    const isCleanPhone = /^(?:\+263|0)7[78]\d{7}$/.test(customerPhone.replace(/\s+/g, ''));
    if (!isCleanPhone) {
      return {
        success: false,
        transactionId: `eco_invalid_${Date.now()}`,
        status: 'failed',
        message: 'Invalid EcoCash number. Econet numbers start with 077 or 078.'
      };
    }

    // Simulation of calling Econet API for Direct Dial / USSD Push
    // Real API Endpoint is usually: https://api.econet.co.zw/ecocash/v1/transaction
    // with header authentication, client credentials, and payloads like:
    // { "clientCorrelator": "orderId", "endUserId": "26377xxxxxxx", "paymentAmount": { "amount": "10.00", "currency": "USD" } }

    const mockTxId = `ECO-${Math.floor(100000 + Math.random() * 900000)}`;

    return {
      success: true,
      transactionId: mockTxId,
      status: 'pending',
      ussdPromptTriggered: true,
      message: `USSD push prompt sent to ${customerPhone}.`,
      instructions: `An automated EcoCash PIN prompt has been triggered. Please dial *151*200# if you don't receive the prompt within 15 seconds to authorize transaction of ${currency} ${amount.toFixed(2)}.`
    };
  }

  async verifyPayment(transactionId: string): Promise<'success' | 'pending' | 'failed'> {
    // Real integration polls the merchant status check endpoint or waits for an asynchronous instant notification callback (IPN).
    // Here we auto-approve standard payments for UX demonstration purposes after a multi-second delay.
    return 'success';
  }
}

/**
 * Innbucks Payment Adapter
 * Simulates generating voucher authorization or deep link trigger
 */
export class InnbucksPaymentAdapter implements IPaymentAdapter {
  gatewayId = 'innbucks' as const;
  name = 'Innbucks';

  async initiatePayment(params: PaymentInitiationParams): Promise<PaymentGatewayResponse> {
    const { amount, currency } = params;
    const mockTxId = `IB-${Math.floor(100000 + Math.random() * 900000)}`;
    const mockVoucher = Math.floor(100000 + Math.random() * 900000).toString();

    // Simulates calling Innbucks Merchant API to lock a voucher creation
    return {
      success: true,
      transactionId: mockTxId,
      status: 'pending',
      message: 'Innbucks voucher payload prepared.',
      instructions: `Please open your Innbucks App, select 'Pay Merchant', insert Merchant Code: 89327, and input code: ${mockVoucher} to authorize ${currency} ${amount.toFixed(2)}.`
    };
  }

  async verifyPayment(transactionId: string): Promise<'success' | 'pending' | 'failed'> {
    return 'success';
  }
}

/**
 * Omari Payment Adapter
 * Simulates Cassava Smartech/Omari direct wallet charge with USSD or App challenge
 */
export class OmariPaymentAdapter implements IPaymentAdapter {
  gatewayId = 'omari' as const;
  name = 'Omari';

  async initiatePayment(params: PaymentInitiationParams): Promise<PaymentGatewayResponse> {
    const { amount, customerPhone, currency } = params;

    if (!customerPhone) {
      return {
        success: false,
        transactionId: `om_failed_${Date.now()}`,
        status: 'failed',
        message: 'Phone number is required for Omari transaction authorization.'
      };
    }

    const mockTxId = `OM-${Math.floor(100000 + Math.random() * 900000)}`;

    return {
      success: true,
      transactionId: mockTxId,
      status: 'pending',
      ussdPromptTriggered: true,
      message: 'Omari charging request initiated.',
      instructions: `Check phone screen for the Omari PIN dialogue to approve ${currency} ${amount.toFixed(2)} transfer.`
    };
  }

  async verifyPayment(transactionId: string): Promise<'success' | 'pending' | 'failed'> {
    return 'success';
  }
}

/**
 * Paynow Multi-Processor Adapter
 * Simulates aggregate processing including Visa, Mastercards, and local platforms
 */
export class PaynowPaymentAdapter implements IPaymentAdapter {
  gatewayId = 'paynow' as const;
  name = 'Paynow';

  async initiatePayment(params: PaymentInitiationParams): Promise<PaymentGatewayResponse> {
    const { amount, currency, customerEmail } = params;
    const mockTxId = `PN-${Math.floor(1000000 + Math.random() * 9000000)}`;
    
    // Simulate API Post payload to https://www.paynow.co.zw/interface/initiatetransaction
    // Key variables to supply: id (Integration ID), reference (order number), amount, backurl, statusurl
    const redirectUrl = `https://www.paynow.co.zw/payment/confirm?tx=${mockTxId}`;

    return {
      success: true,
      transactionId: mockTxId,
      status: 'pending',
      message: 'Paynow transaction initialized.',
      instructions: `Click 'Go to Paynow' to execute secure checkout processing for ${currency} ${amount.toFixed(2)}. This aggregates multiple Zimbabwe banks and gateways.`,
    };
  }

  async verifyPayment(transactionId: string): Promise<'success' | 'pending' | 'failed'> {
    return 'success';
  }
}

/**
 * Payment Adapter Orchestrator
 */
export class PaymentOrchestrator {
  private static adapters: Record<string, IPaymentAdapter> = {
    ecocash: new EcoCashPaymentAdapter(),
    innbucks: new InnbucksPaymentAdapter(),
    omari: new OmariPaymentAdapter(),
    paynow: new PaynowPaymentAdapter()
  };

  static getAdapter(gateway: 'ecocash' | 'innbucks' | 'omari' | 'paynow'): IPaymentAdapter {
    const adapter = this.adapters[gateway];
    if (!adapter) {
      throw new Error(`Unsupported regional payment gateway: ${gateway}`);
    }
    return adapter;
  }

  static getSupportedGateways() {
    return Object.values(this.adapters).map(a => ({
      id: a.gatewayId,
      name: a.name
    }));
  }
}
