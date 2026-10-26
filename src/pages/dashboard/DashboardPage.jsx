import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Loading } from '../../components/common/Loading';
import { ShoppingCart, Users, RefreshCw, AlertCircle } from 'lucide-react';

// Services & Components
import { getDashboard } from '../../services/dashboard.service';
import { SummaryCard } from '../../components/Dashboard/SummaryCard';
import { OrderSummary } from '../../components/Dashboard/OrderSummary';
import { SalesChart7Days } from '../../components/Dashboard/SalesChart7Days';
import { TopMenus } from '../../components/Dashboard/TopMenus';
import { AllTimeStats } from '../../components/Dashboard/AllTimeStats';


export const DashboardPage = ({ setActiveTab }) => {
  const { user, role } = useAuth();
  const roleName = (typeof role === 'string' ? role : role?.name || '').toUpperCase();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getDashboard();
      if (res && res.success) {
        setDashboardData(res.data);
      } else {
        setError(res.message || 'Gagal mengambil data dashboard.');
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Gagal terhubung ke server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return (
    <div className="space-y-6 w-full overflow-hidden pb-0">
      {/* Clean Welcome Banner */}
      <div className="bg-card border border-border rounded-xl shadow-sm p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-4">
            <Badge variant="primary" className="px-3 py-1 font-bold text-[0.7rem] uppercase tracking-wider">
              {roleName} DASHBOARD
            </Badge>
            <span className="text-sm font-medium text-text-secondary flex items-center gap-1">
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Live Data
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight mb-2">
            Selamat Datang, {user?.name || user?.fullname || 'User'}!
          </h1>
          <p className="text-sm text-text-secondary leading-relaxed">
            Pantau ringkasan operasional harian, transaksi pesanan, dan laporan pengeluaran Toko Anda secara keseluruhan dari satu panel utama.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 min-w-50 w-full md:w-auto">
          {roleName === 'KASIR' ? (
            <Button
              size="lg"
              variant="primary"
              onClick={() => setActiveTab('pos')}
              className="w-full sm:w-auto font-bold shadow-sm"
              icon={ShoppingCart}
            >
              Buka Kasir POS
            </Button>
          ) : (
            <Button
              size="lg"
              variant="primary"
              onClick={() => setActiveTab('users')}
              className="w-full sm:w-auto font-bold shadow-sm"
              icon={Users}
            >
              Kelola Kasir
            </Button>
          )}
          <Button
            size="lg"
            variant="outline"
            onClick={fetchDashboard}
            isLoading={loading}
            icon={RefreshCw}
            className="w-full sm:w-auto"
          >
            Sinkronisasi
          </Button>
        </div>
      </div>

      {loading && !dashboardData && (
        <Loading text="Memuat dashboard..." />
      )}

      {error && !loading && (
        <div className="flex flex-col items-center justify-center p-12 bg-rose-50 dark:bg-rose-900/10 rounded-2xl border border-rose-200 dark:border-rose-900/30 text-rose-500">
          <AlertCircle size={40} className="mb-4" />
          <h3 className="text-lg font-bold mb-2">Gagal Memuat Data</h3>
          <p className="text-sm opacity-80 mb-6">{error}</p>
          <Button variant="primary" onClick={fetchDashboard} icon={RefreshCw}>
            Coba Lagi
          </Button>
        </div>
      )}

      {!loading && !error && dashboardData && (
        <div className="space-y-6">
          {/* Ringkasan & Pesanan Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <SummaryCard title="Ringkasan Hari Ini" data={dashboardData.ringkasan?.hari_ini} />
            <SummaryCard title="Ringkasan Bulan Ini" data={dashboardData.ringkasan?.bulan_ini} isMonthly={true} />
            <OrderSummary data={dashboardData.ringkasan?.hari_ini?.pesanan} />
          </div>

          {/* Keseluruhan Waktu */}
          <AllTimeStats data={dashboardData.ringkasan?.semua_waktu} />

          {/* Grafik & Top Menu */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 w-full overflow-hidden">
              <SalesChart7Days data={dashboardData.grafik_7_hari} />
            </div>
            <div className="w-full">
              <TopMenus data={dashboardData.top_menus} />
            </div>
          </div>


        </div>
      )}
    </div>
  );
};
