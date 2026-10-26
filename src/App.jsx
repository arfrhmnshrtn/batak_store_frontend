import React, { useState, useEffect, Suspense, lazy } from 'react';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import StatCard from './components/Dashboard/StatCard';
import { useAuth } from './hooks/useAuth';

import {
  DollarSign,
  ShoppingBag,
  Utensils,
  Users,
  RefreshCw,
  Download,
  Calendar,
  Layers,
  Settings,
  HelpCircle,
  Trash2,
  Receipt,
  BookOpen,
  Calculator
} from 'lucide-react';
import './index.css';
import { DashboardPage } from './pages/dashboard/DashboardPage';

// Lazy loading heavy components
const SalesAnalysis = lazy(() => import('./pages/analysis/SalesAnalysis'));
const OrdersTable = lazy(() => import('./components/Orders/OrdersTable'));
const MenuKatalogView = lazy(() => import('./components/MenuKatalog/MenuKatalogView'));
const WasteManagementView = lazy(() => import('./components/Kebocoran/WasteManagementView'));
const IncomeExpenseView = lazy(() => import('./components/Transaksi/IncomeExpenseView'));
const DebtManagementView = lazy(() => import('./components/Hutang/DebtManagementView'));
const PosView = lazy(() => import('./components/Pos/PosView'));
const CashReportView = lazy(() => import('./components/Keuangan/CashReportView'));
const AddOrderModal = lazy(() => import('./components/Orders/AddOrderModal'));
const LoginView = lazy(() => import('./components/Auth/LoginView'));
const UsersPage = lazy(() => import('./pages/users/UsersPage').then(module => ({ default: module.UsersPage })));
const ProductsSoldPage = lazy(() => import('./pages/analysis/ProductsSoldPage'));
const MaterialExpensesPage = lazy(() => import('./pages/expenses/MaterialExpensesPage'));

export default function App() {
  const { isAuthenticated, user, role, loading } = useAuth();

  // Local state for sidebar/theme
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkTheme, setDarkTheme] = useState(() => {
    try {
      const storedTheme = localStorage.getItem('angkringan_theme');
      if (storedTheme === 'dark') return true;
      if (storedTheme === 'light') return false;
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('angkringan_active_tab') || 'dashboard';
  });

  // Save active tab to localStorage so it persists on refresh
  useEffect(() => {
    if (activeTab) {
      localStorage.setItem('angkringan_active_tab', activeTab);
    }
  }, [activeTab]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Apply dark mode class to document body and save to localStorage
  useEffect(() => {
    try {
      if (darkTheme) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('angkringan_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('angkringan_theme', 'light');
      }
    } catch (e) {
      // Error accessing localStorage, ignore
    }
  }, [darkTheme]);

  // Handle default tab based on role
  useEffect(() => {
    if (isAuthenticated) {
      const currentRole = typeof role === 'string' ? role.toUpperCase() : role?.name?.toUpperCase() || 'KASIR';
      if (currentRole !== 'OWNER' && activeTab === 'dashboard') {
        setActiveTab('pos');
      }
    }
  }, [isAuthenticated, role, activeTab]);

  // Initial Sample Orders
  const [orders, setOrders] = useState([
    {
      id: 'AK-1089',
      customer: 'Rian Permana',
      table: '03',
      items: '2x Sate Kulit, 1x Nasi Kucing Teri, 1x Es Teh',
      total: 'Rp 14.000',
      payment: 'QRIS',
      paymentStatus: 'Lunas',
      time: '19:42'
    },
    {
      id: 'AK-1088',
      customer: 'Siti Rahma',
      table: '01',
      items: '3x Sate Puyuh, 2x Nasi Kucing Bandeng, 2x Wedang Jahe',
      total: 'Rp 32.000',
      payment: 'Tunai',
      paymentStatus: 'Lunas',
      time: '19:35'
    },
    {
      id: 'AK-1087',
      customer: 'Budi Santoso',
      table: '05',
      items: '5x Sate Usus, 2x Tempe Mendoan, 1x Kopi Joss',
      total: 'Rp 25.000',
      payment: 'Hutang / Kasbon',
      paymentStatus: 'Utang',
      time: '19:10'
    },
    {
      id: 'AK-1086',
      customer: 'Dewi Lestari',
      table: 'Bungkus',
      items: '4x Sate Kulit, 3x Nasi Kucing Teri',
      total: 'Rp 24.000',
      payment: 'Tunai',
      paymentStatus: 'Lunas',
      time: '18:50'
    },
    {
      id: 'AK-1085',
      customer: 'Andi Pratama',
      table: '02',
      items: '1x Es Jeruk, 2x Sate Usus',
      total: 'Rp 10.000',
      payment: 'Hutang / Kasbon',
      paymentStatus: 'Utang',
      time: '18:20'
    }
  ]);

  const handleAddOrder = (newOrder) => {
    setOrders([newOrder, ...orders]);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-main text-text">Tunggu sebentar...</div>;
  }

  if (!isAuthenticated) {
    return (
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-main text-text">Memuat...</div>}>
        <LoginView
          onLoginSuccess={(role) => {
            window.location.reload();
          }}
        />
      </Suspense>
    );
  }

  return (
    <div className="flex w-full h-screen overflow-hidden bg-main text-text relative">
      {/* Left Sidebar */}
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Content Outer Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto overflow-x-hidden custom-scrollbar">
        {/* Top Header Bar */}
        <Header
          darkTheme={darkTheme}
          setDarkTheme={setDarkTheme}
          setMobileOpen={setMobileOpen}
          onOpenAddModal={() => setIsAddModalOpen(true)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {/* Dashboard Main Scrollable Area */}
        <main className="p-7 flex-1 flex flex-col gap-6 max-w-[1600px] w-full mx-auto">
          {/* Header Title Section - Hidden on Dashboard as it has its own Welcome Banner */}
          {activeTab !== 'dashboard' && (
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-2xl font-extrabold text-text mb-1 tracking-tight">
                  {activeTab === 'pos' && 'Kasir (Input Pembelian)'}
                  {activeTab === 'pesanan' && 'Kelola Pesanan'}
                  {activeTab === 'katalog' && 'Katalog & Stok Menu'}
                  {activeTab === 'pelanggan' && 'Data Pelanggan'}
                  {activeTab === 'transaksi' && 'Pemasukan & Pengeluaran'}
                  {activeTab === 'hutang' && 'Catatan Buku Hutang & Piutang'}
                  {activeTab === 'analitik' && 'Analisis Penjualan'}
                  {activeTab === 'barang-terjual' && 'Laporan Barang Terjual'}
                  {activeTab === 'bahan-baku' && 'Pengeluaran Bahan Baku'}
                  {activeTab === 'keuangan' && 'Laporan Kas & Keuangan'}
                  {activeTab === 'kebocoran' && 'Barang Terbuang'}
                  {activeTab === 'users' && 'Kelola Pengguna & Kasir'}
                  {activeTab === 'pengaturan' && 'Pengaturan Toko'}
                </h1>
                <p className="text-sm text-text-secondary">
                  Selamat datang kembali, {user?.fullname || user?.name || 'Kasir'}!
                </p>
              </div>
            </div>
          )}

          {/* Conditional View Rendering based on active tab */}
          <Suspense fallback={
            <div className="flex-1 flex flex-col items-center justify-center p-12">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-text-secondary font-medium">Memuat modul...</p>
            </div>
          }>
            {activeTab === 'dashboard' && (
              <>
                <DashboardPage setActiveTab={setActiveTab} />

                {/* Orders Data Table */}
                <OrdersTable
                  orders={orders}
                  setOrders={setOrders}
                  searchQuery={searchQuery}
                />
              </>
            )}

            {activeTab === 'pesanan' && (
              <OrdersTable
                orders={orders}
                setOrders={setOrders}
                searchQuery={searchQuery}
              />
            )}

            {activeTab === 'katalog' && (
              <MenuKatalogView />
            )}

            {activeTab === 'users' && (
              <UsersPage />
            )}

            {activeTab === 'pelanggan' && (
              <div className="bg-card border border-border rounded-xl shadow-sm p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <div className="flex items-center gap-2 font-bold text-text text-[1.05rem]">
                    <Users size={20} className="text-primary" />
                    <span>Daftar Pelanggan Setia Angkringan</span>
                  </div>
                </div>
                <div className="w-full overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 bg-main text-text-secondary font-semibold text-xs uppercase tracking-wider border-b border-border">Nama Pelanggan</th>
                        <th className="px-4 py-3 bg-main text-text-secondary font-semibold text-xs uppercase tracking-wider border-b border-border">Total Kunjungan</th>
                        <th className="px-4 py-3 bg-main text-text-secondary font-semibold text-xs uppercase tracking-wider border-b border-border">Total Transaksi</th>
                        <th className="px-4 py-3 bg-main text-text-secondary font-semibold text-xs uppercase tracking-wider border-b border-border">Favorit Menu</th>
                        <th className="px-4 py-3 bg-main text-text-secondary font-semibold text-xs uppercase tracking-wider border-b border-border">Status Membership</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="px-4 py-3.5 border-b border-border font-semibold text-text">Rian Permana</td>
                        <td className="px-4 py-3.5 border-b border-border text-text">14 Kali</td>
                        <td className="px-4 py-3.5 border-b border-border font-bold text-text">Rp 280.000</td>
                        <td className="px-4 py-3.5 border-b border-border text-text">Sate Kulit Bakar</td>
                        <td className="px-4 py-3.5 border-b border-border"><span className="bg-success-bg text-success px-2.5 py-1 rounded-full text-[0.7rem] font-bold">VIP Member</span></td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3.5 border-b border-border font-semibold text-text">Siti Rahma</td>
                        <td className="px-4 py-3.5 border-b border-border text-text">9 Kali</td>
                        <td className="px-4 py-3.5 border-b border-border font-bold text-text">Rp 195.000</td>
                        <td className="px-4 py-3.5 border-b border-border text-text">Wedang Jahe</td>
                        <td className="px-4 py-3.5 border-b border-border"><span className="bg-warning-bg text-amber-700 px-2.5 py-1 rounded-full text-[0.7rem] font-bold">Reguler</span></td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3.5 border-b border-border font-semibold text-text">Budi Santoso</td>
                        <td className="px-4 py-3.5 border-b border-border text-text">22 Kali</td>
                        <td className="px-4 py-3.5 border-b border-border font-bold text-text">Rp 450.000</td>
                        <td className="px-4 py-3.5 border-b border-border text-text">Nasi Kucing Teri</td>
                        <td className="px-4 py-3.5 border-b border-border"><span className="bg-success-bg text-success px-2.5 py-1 rounded-full text-[0.7rem] font-bold">VIP Member</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'pos' && (
              <PosView onAddOrder={handleAddOrder} />
            )}

            {activeTab === 'transaksi' && (
              <IncomeExpenseView />
            )}

            {activeTab === 'hutang' && (
              <DebtManagementView />
            )}

            {activeTab === 'analitik' && (
              <SalesAnalysis />
            )}

            {activeTab === 'barang-terjual' && (
              <ProductsSoldPage />
            )}

            {activeTab === 'bahan-baku' && (
              <MaterialExpensesPage />
            )}

            {activeTab === 'keuangan' && (
              <CashReportView />
            )}

            {activeTab === 'kebocoran' && (
              <WasteManagementView />
            )}

            {activeTab === 'pengaturan' && (
              <div className="bg-card border border-border rounded-xl shadow-sm p-6 flex flex-col gap-4 max-w-full">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <div className="flex items-center gap-2 font-bold text-text text-[1.05rem]">
                    <Settings size={20} className="text-primary" />
                    <span>Pengaturan Angkringan</span>
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-text-secondary mb-1">Nama Outlet / Angkringan</label>
                    <input type="text" className="w-full bg-main border border-border rounded-lg text-sm text-text px-3 py-2.5 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition-all" defaultValue="Angkringan Mas Pak" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text-secondary mb-1">Jam Operasional</label>
                    <input type="text" className="w-full bg-main border border-border rounded-lg text-sm text-text px-3 py-2.5 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition-all" defaultValue="17.00 - 01.00 WIB" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text-secondary mb-1">Alamat Toko</label>
                    <input type="text" className="w-full bg-main border border-border rounded-lg text-sm text-text px-3 py-2.5 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition-all" defaultValue="Jl. Malioboro No. 42, Yogyakarta" />
                  </div>
                  <button className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md mt-2 self-start">
                    Simpan Perubahan
                  </button>
                </div>
              </div>
            )}
          </Suspense>
        </main>
      </div>

      {/* Add New Order Modal */}
      <Suspense fallback={null}>
        <AddOrderModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAddOrder={handleAddOrder}
        />
      </Suspense>
    </div>
  );
}
