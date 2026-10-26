import React, { useState, useEffect, useCallback } from 'react';
import {
  BookOpen,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  Phone,
  Calendar,
  X,
  CreditCard,
  QrCode,
  ArrowRightLeft,
  Search,
  Eye,
  ShoppingBag,
  Package,
  Receipt
} from 'lucide-react';
import { debtService } from '../../services/debt.service';
import { useToast } from '../../contexts/ToastContext';
import { usePermission } from '../../hooks/usePermission';

export default function DebtManagementView() {
  const { hasPermission } = usePermission();
  const canRead = hasPermission('debt.read');
  const canPay = hasPermission('debt.payment');
  const { success, error } = useToast();

  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState(null);

  // Detail Modal State
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailDebt, setDetailDebt] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('semua');

  // Payment Form State
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('tunai');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenDetailModal = async (debt) => {
    setDetailDebt(debt);
    setIsDetailModalOpen(true);
    setLoadingDetail(true);
    try {
      const res = await debtService.getDebtById(debt.id);
      if (res && res.data) {
        setDetailDebt(res.data);
      }
    } catch (err) {
      console.error('Gagal mengambil detail hutang:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setDetailDebt(null);
  };

  const fetchDebts = useCallback(async () => {
    setLoading(true);
    setErrorState(null);
    try {
      const res = await debtService.getDebts();
      // Assuming response structure: { success: true, message: '...', data: [...] }
      if (res && res.data) {
        setDebts(res.data);
      } else {
        setDebts([]);
      }
    } catch (err) {
      setErrorState(err?.message || 'Gagal mengambil data hutang.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (canRead) {
      fetchDebts();
    }
  }, [canRead, fetchDebts]);

  const filteredDebts = debts.filter(rec => {
    if (String(rec.status).toUpperCase() === 'LUNAS') return false;

    const customer = (rec.customer_name || '').toLowerCase();
    const supplier = (rec.supplier_name || '').toLowerCase();
    const order = (rec.pesanan?.nomor_pesanan || '').toLowerCase();
    const q = searchQuery.toLowerCase();
    const matchSearch = customer.includes(q) || supplier.includes(q) || order.includes(q);
    const matchStatus = statusFilter === 'semua' || String(rec.status).toLowerCase() === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalUnpaidDebt = debts
    .filter(d => d.status === 'BELUM_LUNAS' || d.status === 'SEBAGIAN')
    .reduce((sum, d) => sum + (d.remaining_amount || 0), 0);

  if (!canRead) {
    return (
      <div className="flex flex-col items-center justify-center min-h-100 text-center bg-card rounded-xl border border-border">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-text mb-2">Akses Ditolak</h2>
        <p className="text-text-secondary">Anda tidak memiliki izin untuk melihat data hutang.</p>
      </div>
    );
  }

  const handleOpenPaymentModal = (debt) => {
    setSelectedDebt(debt);
    setAmount('');
    setPaymentMethod('tunai');
    setIsModalOpen(true);
  };

  const handleClosePaymentModal = () => {
    setIsModalOpen(false);
    setSelectedDebt(null);
    setAmount('');
  };

  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    if (!selectedDebt || !amount) return;

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return error('Jumlah pembayaran harus berupa angka dan lebih dari 0.');
    }

    if (numAmount > selectedDebt.remaining_amount) {
      return error('Jumlah pembayaran tidak boleh melebihi sisa hutang.');
    }

    setIsSubmitting(true);

    try {
      await debtService.createDebtPayment(selectedDebt.id, {
        amount: numAmount,
        payment_method: paymentMethod
      });

      success('Pembayaran hutang berhasil.');
      handleClosePaymentModal();
      fetchDebts();
    } catch (err) {
      error(err?.message || 'Terjadi kesalahan saat memproses pembayaran.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatRupiah = (number) => {
    if (number === null || number === undefined) return 'Rp0';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(number);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).format(d);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'BELUM_LUNAS':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.7rem] font-bold bg-danger-bg text-danger"><AlertCircle size={13} /> Belum Lunas</span>;
      case 'SEBAGIAN':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.7rem] font-bold bg-amber-100 text-amber-700"><Clock size={13} /> Sebagian</span>;
      case 'LUNAS':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.7rem] font-bold bg-success-bg text-success"><CheckCircle2 size={13} /> Lunas</span>;
      case 'DIBATALKAN':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.7rem] font-bold bg-gray-200 text-gray-700"><X size={13} /> Dibatalkan</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.7rem] font-bold bg-main text-text-secondary">{status}</span>;
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Table Card */}
      <div className="bg-card border border-border rounded-xl shadow-sm p-6 flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
          <div className="flex items-center gap-3 font-bold text-lg text-text">
            <BookOpen size={22} className="text-primary" />
            <span>Catatan Buku Hutang & Piutang Angkringan</span>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted w-4 h-4" />
            <input
              type="text"
              className="w-full pl-9 pr-4 py-2 bg-main border border-border rounded-lg text-sm text-text focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition-all"
              placeholder="Cari pelanggan, supplier, pesanan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Status Filters & Summary */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div className="flex items-center flex-wrap gap-2">
            {[
              { id: 'semua', label: 'Semua Status' },
              { id: 'belum_lunas', label: 'Belum Dibayar' },
              { id: 'sebagian', label: 'Sebagian' }
            ].map(tab => (
              <button
                key={tab.id}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all border ${statusFilter === tab.id
                  ? 'bg-primary text-white border-primary shadow-md'
                  : 'bg-main text-text-secondary border-border hover:bg-border/50'
                  }`}
                onClick={() => setStatusFilter(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 px-4 py-2 rounded-lg flex items-center gap-3 transition-colors">
            <div className="p-2 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 rounded-lg">
              <DollarSign size={18} />
            </div>

            <div>
              <p className="text-[0.7rem] font-semibold text-red-600/80 dark:text-red-400/80 uppercase tracking-wider">
                Total Hutang Berjalan
              </p>

              <p className="text-base font-bold text-red-700 dark:text-red-300">
                {formatRupiah(totalUnpaidDebt)}
              </p>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="w-full overflow-x-auto">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : errorState ? (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <span className="text-danger">{errorState}</span>
              <button onClick={fetchDebts} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-hover transition-colors">
                Coba Lagi
              </button>
            </div>
          ) : filteredDebts.length === 0 ? (
            <div className="text-center py-8 text-muted">
              {searchQuery ? `Tidak ada data hutang yang cocok dengan "${searchQuery}".` : 'Belum ada data hutang.'}
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-main text-text-secondary border-b border-border">
                  <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">No</th>
                  <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Nama</th>
                  <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider text-right">Total Hutang</th>
                  <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider text-right">Sudah Dibayar</th>
                  <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider text-right">Sisa Hutang</th>
                  <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider text-center">Status</th>
                  <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Tanggal</th>
                  <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredDebts.map((rec, index) => (
                  <tr key={rec.id} className="border-b border-border hover:bg-main/30 transition-colors">
                    <td className="px-4 py-3.5 font-medium text-muted">{index + 1}</td>
                    <td className="px-4 py-3.5 font-bold text-text">
                      {rec.type === 'CUSTOMER' ? (rec.customer_name || '-') : (rec.supplier_name || '-')}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-text text-right">
                      {formatRupiah(rec.total_amount)}
                    </td>
                    <td className="px-4 py-3.5 font-medium text-success text-right">
                      {formatRupiah(rec.paid_amount)}
                    </td>
                    <td className="px-4 py-3.5 font-extrabold text-danger text-right">
                      {formatRupiah(rec.remaining_amount)}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      {getStatusBadge(rec.status)}
                    </td>
                    <td className="px-4 py-3.5 text-text text-xs whitespace-nowrap">
                      {formatDate(rec.created_at)}
                    </td>
                    <td className="px-4 py-3.5 text-right flex items-center justify-end gap-2">
                      <button
                        className="bg-main hover:bg-border text-text border border-border px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 shadow-sm"
                        onClick={() => handleOpenDetailModal(rec)}
                        title="Lihat Detail Item Dibeli"
                      >
                        <Eye size={14} className="text-primary" />
                        <span>Detail</span>
                      </button>
                      {canPay && rec.status !== 'LUNAS' && rec.status !== 'DIBATALKAN' && (
                        <button
                          className="bg-primary hover:bg-primary-hover text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap shadow-sm hover:shadow-md"
                          onClick={() => handleOpenPaymentModal(rec)}
                        >
                          Bayar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Payment Modal Form */}
      {isModalOpen && selectedDebt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={handleClosePaymentModal}>
          <div className="bg-card w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-border flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-main/50">
              <div className="flex items-center gap-2.5">
                <DollarSign size={20} className="text-primary" />
                <h3 className="font-bold text-lg text-text m-0">Bayar Hutang</h3>
              </div>
              <button className="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:text-text hover:bg-border/50 transition-colors" onClick={handleClosePaymentModal}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitPayment} className="flex flex-col">
              <div className="p-6 flex flex-col gap-4">

                {/* Info Box */}
                <div className="bg-main/50 border border-border rounded-lg p-3 text-sm grid grid-cols-2 gap-2">
                  <div className="text-text-secondary">Pesanan:</div>
                  <div className="font-semibold text-right">{selectedDebt.pesanan?.nomor_pesanan || '-'}</div>

                  <div className="text-text-secondary">Pelanggan:</div>
                  <div className="font-semibold text-right">{selectedDebt.type === 'CUSTOMER' ? selectedDebt.customer_name : selectedDebt.supplier_name}</div>

                  <div className="col-span-2 border-t border-border my-1"></div>

                  <div className="text-text-secondary">Total Hutang:</div>
                  <div className="font-bold text-right">{formatRupiah(selectedDebt.total_amount)}</div>

                  <div className="text-text-secondary">Sudah Dibayar:</div>
                  <div className="font-bold text-success text-right">{formatRupiah(selectedDebt.paid_amount)}</div>

                  <div className="text-text-secondary">Sisa Hutang:</div>
                  <div className="font-extrabold text-danger text-right">{formatRupiah(selectedDebt.remaining_amount)}</div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">Jumlah Pembayaran</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary font-semibold">Rp</span>
                    <input
                      type="number"
                      className="w-full bg-main border border-border rounded-lg text-sm text-text pl-9 pr-3 py-2.5 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition-all"
                      placeholder="0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                      min="1"
                      max={selectedDebt.remaining_amount}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">Metode Pembayaran</label>
                  <div className="relative">
                    <select
                      className="w-full bg-main border border-border rounded-lg text-sm text-text pl-10 pr-3 py-2.5 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition-all cursor-pointer appearance-none"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    >
                      <option value="tunai">Tunai</option>
                      <option value="qris">QRIS</option>
                      <option value="transfer">Transfer</option>
                    </select>
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">
                      {paymentMethod === 'tunai' && <DollarSign size={16} />}
                      {paymentMethod === 'qris' && <QrCode size={16} />}
                      {paymentMethod === 'transfer' && <CreditCard size={16} />}
                    </div>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none">
                      <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 px-6 py-4 border-t border-border bg-main/30">
                <button type="button" disabled={isSubmitting} className="px-4 py-2 rounded-lg text-sm font-semibold bg-main text-text border border-border hover:bg-border/50 transition-colors disabled:opacity-50" onClick={handleClosePaymentModal}>
                  Batal
                </button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 rounded-lg text-sm font-bold bg-primary hover:bg-primary-hover text-white shadow-md hover:shadow-lg flex gap-2 items-center hover:-translate-y-px transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  {isSubmitting ? 'Memproses...' : 'Bayar Hutang'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal showing Purchased Items */}
      {isDetailModalOpen && detailDebt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={handleCloseDetailModal}>
          <div className="bg-card w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-border flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-main/50">
              <div className="flex items-center gap-2.5">
                <ShoppingBag size={20} className="text-primary" />
                <div>
                  <h3 className="font-bold text-lg text-text m-0">Detail Hutang & Item Dibeli</h3>
                  <p className="text-xs text-text-secondary m-0">
                    {detailDebt.type === 'CUSTOMER' ? `Pelanggan: ${detailDebt.customer_name || '-'}` : `Supplier: ${detailDebt.supplier_name || '-'}`}
                  </p>
                </div>
              </div>
              <button className="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:text-text hover:bg-border/50 transition-colors" onClick={handleCloseDetailModal}>
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex flex-col gap-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-main/50 p-3 rounded-lg border border-border flex flex-col">
                  <span className="text-xs text-text-secondary font-medium">Total Hutang</span>
                  <span className="text-base font-bold text-text mt-1">{formatRupiah(detailDebt.total_amount)}</span>
                </div>
                <div className="bg-main/50 p-3 rounded-lg border border-border flex flex-col">
                  <span className="text-xs text-text-secondary font-medium">Sudah Dibayar</span>
                  <span className="text-base font-bold text-success mt-1">{formatRupiah(detailDebt.paid_amount)}</span>
                </div>
                <div className="bg-main/50 p-3 rounded-lg border border-border flex flex-col">
                  <span className="text-xs text-text-secondary font-medium">Sisa Hutang</span>
                  <span className="text-base font-bold text-danger mt-1">{formatRupiah(detailDebt.remaining_amount)}</span>
                </div>
              </div>

              {/* Purchased Items Section */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 border-b border-border pb-2">
                  <Package size={18} className="text-primary" />
                  <span className="font-bold text-sm text-text uppercase tracking-wider">Item Yang Dibeli</span>
                </div>

                {loadingDetail ? (
                  <div className="flex justify-center py-6">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : (detailDebt.detail_items && detailDebt.detail_items.length > 0) ? (
                  <div className="overflow-x-auto border border-border rounded-lg">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-main text-text-secondary border-b border-border">
                          <th className="px-3 py-2.5 font-semibold">No</th>
                          <th className="px-3 py-2.5 font-semibold">Nama Menu</th>
                          <th className="px-3 py-2.5 font-semibold text-right">Harga</th>
                          <th className="px-3 py-2.5 font-semibold text-center">Qty</th>
                          <th className="px-3 py-2.5 font-semibold text-right">Subtotal</th>
                          <th className="px-3 py-2.5 font-semibold">Tanggal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detailDebt.detail_items.map((item, idx) => (
                          <tr key={item.id || idx} className="border-b border-border/50 hover:bg-main/30">
                            <td className="px-3 py-2 font-medium text-muted">{idx + 1}</td>
                            <td className="px-3 py-2 font-bold text-text">{item.nama_menu}</td>
                            <td className="px-3 py-2 text-right text-text">{formatRupiah(item.harga)}</td>
                            <td className="px-3 py-2 text-center font-bold text-text">{item.jumlah}</td>
                            <td className="px-3 py-2 text-right font-bold text-text">{formatRupiah(item.subtotal)}</td>
                            <td className="px-3 py-2 text-text-secondary whitespace-nowrap">{formatDate(item.tanggal || item.created_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : detailDebt.pesanan?.detail_pesanan && detailDebt.pesanan.detail_pesanan.length > 0 ? (
                  <div className="overflow-x-auto border border-border rounded-lg">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-main text-text-secondary border-b border-border">
                          <th className="px-3 py-2.5 font-semibold">No</th>
                          <th className="px-3 py-2.5 font-semibold">Nama Menu</th>
                          <th className="px-3 py-2.5 font-semibold text-right">Harga</th>
                          <th className="px-3 py-2.5 font-semibold text-center">Qty</th>
                          <th className="px-3 py-2.5 font-semibold text-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detailDebt.pesanan.detail_pesanan.map((item, idx) => (
                          <tr key={item.id || idx} className="border-b border-border/50 hover:bg-main/30">
                            <td className="px-3 py-2 font-medium text-muted">{idx + 1}</td>
                            <td className="px-3 py-2 font-bold text-text">{item.nama_menu}</td>
                            <td className="px-3 py-2 text-right text-text">{formatRupiah(item.harga)}</td>
                            <td className="px-3 py-2 text-center font-bold text-text">{item.jumlah}</td>
                            <td className="px-3 py-2 text-right font-bold text-text">{formatRupiah(item.subtotal)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted border border-dashed border-border rounded-lg text-xs">
                    Tidak ada rincian item pesanan (Hutang dibuat secara manual).
                  </div>
                )}
              </div>

              {/* Payment History Section if any */}
              {detailDebt.payments && detailDebt.payments.length > 0 && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 border-b border-border pb-2">
                    <Receipt size={18} className="text-primary" />
                    <span className="font-bold text-sm text-text uppercase tracking-wider">Riwayat Pembayaran</span>
                  </div>
                  <div className="overflow-x-auto border border-border rounded-lg">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-main text-text-secondary border-b border-border">
                          <th className="px-3 py-2.5 font-semibold">No</th>
                          <th className="px-3 py-2.5 font-semibold">Tanggal</th>
                          <th className="px-3 py-2.5 font-semibold text-right">Jumlah</th>
                          <th className="px-3 py-2.5 font-semibold uppercase">Metode</th>
                          <th className="px-3 py-2.5 font-semibold">Kasir</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detailDebt.payments.map((pmt, idx) => (
                          <tr key={pmt.id || idx} className="border-b border-border/50 hover:bg-main/30">
                            <td className="px-3 py-2 font-medium text-muted">{idx + 1}</td>
                            <td className="px-3 py-2 text-text whitespace-nowrap">{formatDate(pmt.paid_at || pmt.created_at)}</td>
                            <td className="px-3 py-2 text-right font-bold text-success">{formatRupiah(pmt.amount)}</td>
                            <td className="px-3 py-2 uppercase font-semibold text-text-secondary">{pmt.payment_method || '-'}</td>
                            <td className="px-3 py-2 text-text-secondary">{pmt.user?.fullname || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end px-6 py-4 border-t border-border bg-main/30">
              <button type="button" className="px-4 py-2 rounded-lg text-sm font-semibold bg-primary hover:bg-primary-hover text-white transition-colors" onClick={handleCloseDetailModal}>
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
