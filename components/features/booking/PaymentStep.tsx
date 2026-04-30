import React from 'react';
import { formatCurrency } from '@/lib/cloudbeds/utils';

interface PaymentStepProps {
  reservationId: string;
  total: number;
  onPay: () => void;
  loading: boolean;
  onBack?: () => void;
}

const PAYMENT_METHODS = [
  { id: 'bank_transfer', label: 'Bank Transfer / Virtual Account', icon: 'account_balance' },
  { id: 'ewallet', label: 'E-Wallet (OVO, DANA, LinkAja)', icon: 'account_balance_wallet' },
  { id: 'credit_card', label: 'Credit Card', icon: 'credit_card' },
  { id: 'qris', label: 'QRIS', icon: 'qr_code_2' },
];

export default function PaymentStep({
  reservationId,
  total,
  onPay,
  loading,
  onBack,
}: PaymentStepProps) {
  return (
    <section className="flex-1">
      <header className="mb-12">
        <div className="flex items-center gap-4 mb-4">
          {onBack && (
            <button 
              onClick={onBack}
              className="material-symbols-outlined text-primary p-2 hover:bg-secondary-container/50 rounded-full transition-colors"
            >
              arrow_back
            </button>
          )}
          <p className="font-label-caps text-primary uppercase">STEP 06</p>
        </div>
        <h1 className="font-display text-5xl text-primary">Finalize Payment</h1>
        <p className="font-body text-lg text-secondary max-w-2xl mt-6">
          Your reservation <span className="font-bold text-primary">#{reservationId}</span> has been created. 
          Please proceed to payment to secure your sanctuary.
        </p>
      </header>

      <div className="bg-surface-container p-8 border border-outline-variant/30 mb-8">
        <h2 className="font-display text-2xl text-primary mb-6">Supported Payment Methods</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PAYMENT_METHODS.map((method) => (
            <div 
              key={method.id}
              className="flex items-center gap-4 p-4 border border-outline-variant bg-background/50"
            >
              <span className="material-symbols-outlined text-primary">{method.icon}</span>
              <span className="font-body text-secondary">{method.label}</span>
            </div>
          ))}
        </div>
        <p className="mt-6 text-sm text-outline italic">
          * You will be redirected to our secure payment partner, Xendit, to complete the transaction.
        </p>
      </div>

      <div className="bg-primary/5 p-8 border border-primary/20 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <span className="font-label-caps text-xs text-outline uppercase block mb-1">Amount to Pay</span>
          <span className="font-display text-3xl text-primary">{formatCurrency(total)}</span>
        </div>
        
        <button
          onClick={onPay}
          disabled={loading}
          className="w-full md:w-auto bg-primary text-on-primary px-12 py-4 font-label-caps tracking-[0.2em] uppercase hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-4"
        >
          {loading ? (
            <>
              <div className="h-5 w-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></div>
              <span>Processing...</span>
            </>
          ) : (
            <>
              <span>Proceed to Payment</span>
              <span className="material-symbols-outlined">payments</span>
            </>
          )}
        </button>
      </div>
    </section>
  );
}
