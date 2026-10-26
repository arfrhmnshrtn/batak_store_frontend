import React from 'react';
import { CheckCircle2, X, CreditCard, AlertTriangle } from 'lucide-react';

const paymentMethodLabels = { tunai: 'Tunai', qris: 'QRIS', transfer: 'Transfer' };
const paymentStatusLabels = { lunas: 'Lunas', hutang: 'Hutang', belum_bayar: 'Belum Bayar' };

export default function ReceiptModal({
  isOpen,
  onClose,
  completedOrder
}) {
  if (!isOpen || !completedOrder) return null;

  const isHutang = completedOrder.paymentStatus === 'hutang';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card w-full max-w-sm rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-border flex flex-col items-center justify-center text-center p-8" onClick={(e) => e.stopPropagation()}>
        <div className={`w-16 h-16 ${isHutang ? 'bg-warning-bg text-warning' : 'bg-success-bg text-success'} rounded-full flex items-center justify-center mb-5`}>
          {isHutang ? <AlertTriangle size={40} /> : <CheckCircle2 size={40} />}
        </div>
        
        <h2 className="text-xl font-extrabold text-text mb-2 tracking-tight">
          {isHutang ? 'Pesanan Dicatat Hutang!' : 'Transaksi Berhasil!'}
        </h2>
        
        <p className="text-sm text-text-secondary mb-4 leading-relaxed">
          Pesanan baru atas nama <span className="font-bold text-text">{completedOrder.customer}</span> dengan total <span className="font-bold text-primary">{completedOrder.total}</span> telah berhasil ditambahkan.
        </p>

        {/* Payment Details */}
        <div className="w-full bg-main rounded-lg border border-border p-3 mb-6 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Metode Bayar</span>
            <span className="font-semibold text-text flex items-center gap-1.5">
              <CreditCard size={14} className="text-primary" />
              {paymentMethodLabels[completedOrder.payment] || completedOrder.payment}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Status</span>
            <span className={`font-bold ${isHutang ? 'text-warning' : 'text-success'}`}>
              {paymentStatusLabels[completedOrder.paymentStatus] || completedOrder.paymentStatus}
            </span>
          </div>
        </div>

        <button 
          className="w-full py-3 rounded-lg text-sm font-bold bg-primary text-white hover:bg-primary-hover transition-colors shadow-md flex items-center justify-center gap-2" 
          onClick={onClose}
        >
          <CheckCircle2 size={18} />
          Tutup & Kembali
        </button>
      </div>
    </div>
  );
}

