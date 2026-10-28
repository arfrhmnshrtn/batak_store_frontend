import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { usePermission } from '../../hooks/usePermission';
import { ConfirmDialog } from '../common/ConfirmDialog';
import {
  LayoutDashboard,
  ShoppingBag,
  UtensilsCrossed,
  Users,
  BarChart3,
  Wallet,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Utensils,
  Trash2,
  Receipt,
  BookOpen,
  Calculator,
  X,
  Store
} from 'lucide-react';

export default function Sidebar({ collapsed, setCollapsed, activeTab, setActiveTab, mobileOpen, setMobileOpen }) {
  const { user, role, logout } = useAuth();
  const { hasPermission } = usePermission();
  const userRoleStr = typeof role === 'string' ? role.toUpperCase() : role?.name?.toUpperCase() || 'KASIR';
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const menuItems = [
    {
      section: 'Utama',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'pos', label: 'Kasir (Order)', icon: Calculator, badge: '' },
        { id: 'katalog', label: 'Katalog Produk', icon: UtensilsCrossed }
      ]
    },
    {
      section: 'Keuangan & Operasional',
      items: [
        { id: 'keuangan', label: 'Laporan Kas', icon: Wallet },
        { id: 'transaksi', label: 'Pemasukan & Pengeluaran', icon: Receipt },
        { id: 'bahan-baku', label: 'Pengeluaran Bahan Baku', icon: UtensilsCrossed },
        { id: 'hutang', label: 'Buku Hutang & Piutang', icon: BookOpen, badge: '' },
      ]
    },
    {
      section: 'Laporan & Analitik',
      items: [
        // { id: 'laporan_penjualan', label: 'Laporan Penjualan', icon: Receipt },
        { id: 'analitik', label: 'Analisis Penjualan', icon: BarChart3 },
        { id: 'barang-terjual', label: 'Laporan Barang Terjual', icon: ShoppingBag },
        { id: 'kebocoran', label: 'Barang Terbuang', icon: Trash2, badge: '' },
      ]
    },
    {
      section: 'Sistem',
      items: [
        { id: 'users', label: 'Pengguna & Kasir', icon: Users },
      ]
    }
  ];

  const allowedKasirMenus = ['pos', 'pesanan', 'katalog', 'hutang'];

  const filteredMenuItems = menuItems.map(group => {
    let items = group.items;

    // Filter out hutang if no permission
    if (!hasPermission('debt.read') && userRoleStr !== 'OWNER') {
      items = items.filter(item => item.id !== 'hutang');
    }

    if (userRoleStr === 'OWNER') {
      return { ...group, items };
    }

    return {
      ...group,
      items: items.filter(item => allowedKasirMenus.includes(item.id))
    };
  }).filter(group => group.items.length > 0);

  return (
    <>
      <aside className={`fixed lg:relative shrink-0 top-0 h-screen bg-sidebar border-r border-border-sidebar flex flex-col transition-all duration-300 z-50 ${collapsed ? 'w-20' : 'w-72'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-5 flex items-center justify-between border-b border-border-sidebar">
          <a href="#dashboard" className="flex items-center gap-3 no-underline overflow-hidden" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-600/30">
              <Store size={22} />
            </div>
            {!collapsed && (
              <div className="flex flex-col whitespace-nowrap">
                <span className="text-[1.1rem] font-bold text-white tracking-tight">Toko Mangara</span>
                <span className="text-xs text-blue-500 font-semibold uppercase tracking-wider">Admin Panel</span>
              </div>
            )}
          </a>
          <button
            className="hidden lg:flex w-8 h-8 rounded-lg items-center justify-center bg-white/5 border border-white/10 text-slate-400 hover:bg-white/15 hover:text-white transition-colors cursor-pointer"
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
          {/* Mobile close button */}
          <button
            className="lg:hidden flex w-8 h-8 rounded-lg items-center justify-center bg-white/5 border border-white/10 text-slate-400 hover:bg-white/15 hover:text-white transition-colors cursor-pointer"
            onClick={() => setMobileOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-6 custom-scrollbar">
          {filteredMenuItems.map((group, gIdx) => (
            <div className="flex flex-col gap-1" key={gIdx}>
              {!collapsed && <span className="text-[0.7rem] font-bold uppercase text-slate-500 tracking-wider px-3 pb-1.5 whitespace-nowrap">{group.section}</span>}
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer border-none text-left w-full
                    ${isActive
                        ? 'bg-linear-to-r from-blue-600/20 to-blue-600/5 text-white font-semibold border-l-4 border-blue-500'
                        : 'text-slate-400 font-medium hover:bg-white/5 hover:text-slate-100 bg-transparent border-l-4 border-transparent'
                      }
                  `}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileOpen(false);
                    }}
                    title={collapsed ? item.label : ''}
                  >
                    <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-blue-500' : ''}`} />
                    {!collapsed && <span className="text-sm">{item.label}</span>}
                    {!collapsed && item.badge && (
                      <span className="ml-auto bg-blue-600 text-white text-[0.7rem] font-bold px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-border-sidebar bg-black/20">
          <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
            <div className="w-9 h-9 rounded-full bg-linear-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
              {user?.fullname?.[0]?.toUpperCase() || user?.name?.[0]?.toUpperCase() || 'U'}
            </div>

            {!collapsed && (
              <div className="flex flex-1 flex-col min-w-0">
                <span className="text-slate-100 text-[0.85rem] font-semibold truncate">
                  {user?.fullname || user?.name || 'User'}
                </span>
                <span className="text-slate-500 text-xs truncate">
                  {userRoleStr === 'OWNER' ? 'Owner / Admin' : 'Staff Kasir'}
                </span>
              </div>
            )}
          </div>

          <button
            className={`mt-3 w-full px-3 py-2 bg-primary hover:bg-primary/80 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 ${collapsed ? 'px-0' : ''}`}
            onClick={() => setIsLogoutModalOpen(true)}
            title="Logout"
          >
            <LogOut size={14} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <ConfirmDialog
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={() => {
          setIsLogoutModalOpen(false);
          logout();
        }}
        title="Konfirmasi Logout"
        message="Apakah Anda yakin ingin keluar dari sistem? Anda harus memasukkan PIN Anda kembali untuk masuk."
        confirmText="Keluar"
        cancelText="Batal"
        variant="danger"
      />
    </>
  );
}
