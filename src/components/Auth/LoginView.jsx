import React, { useState, useEffect } from 'react';
import { User, Lock, Delete, Store } from 'lucide-react';
import { authService } from '../../services/auth.service';
import { userService } from '../../services/user.service';
import { storage } from '../../utils/storage';

export default function LoginView({ onLoginSuccess }) {
  const [role, setRole] = useState('kasir'); // 'owner' or 'kasir'
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [kasirList, setKasirList] = useState([]);
  const [selectedKasir, setSelectedKasir] = useState('');

  const roles = [
    { id: 'owner', label: 'Owner (Pemilik)' },
    { id: 'kasir', label: 'Kasir (Staff)' }
  ];

  useEffect(() => {
    if (role === 'kasir') {
      userService.getKasirUsers()
        .then(res => {
          const list = res.data || res;
          setKasirList(list);
          if (list.length > 0) {
            setSelectedKasir(list[0].id || list[0]._id);
          }
        })
        .catch(err => console.error('Gagal mengambil daftar kasir:', err));
    }
  }, [role]);

  const handleLogin = async () => {
    if (pin.length !== 4) {
      setError('PIN harus 4 digit!');
      return;
    }

    if (role === 'kasir' && !selectedKasir) {
      setError('Silakan pilih nama kasir terlebih dahulu!');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const payload = {
        role: role.toUpperCase(),
        pin,
        ...(role === 'kasir' ? { userId: parseInt(selectedKasir, 10) } : {})
      };

      const res = await authService.login(payload);
      const data = res?.data || res; // depending on axios resolution

      const accessToken = data.accessToken || data.token;
      if (accessToken) {
        // Save to local storage
        storage.setAuthData({
          accessToken,
          refreshToken: data.refreshToken,
          user: data.user || data.userData,
          role: data.role || role.toUpperCase(),
          permissions: data.permissions || [],
        });
        
        // Notify App.jsx
        if (onLoginSuccess) {
          onLoginSuccess(role);
        }
      } else {
        setError('Login gagal. Token tidak ditemukan.');
        setPin('');
      }
    } catch (err) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Terjadi kesalahan sistem';
      // Normalize error message (e.g. backend sends 'PIN_SALAH' or similar)
      const mappedMsg = errorMessage === 'PIN_SALAH' 
        ? 'PIN salah. Silakan coba lagi.'
        : errorMessage === 'PENGGUNA_TIDAK_DITEMUKAN' || errorMessage === 'KASIR_NONAKTIF' 
          ? 'Akun kasir ini dinonaktifkan atau tidak ditemukan.'
          : errorMessage;
          
      setError(mappedMsg);
      setPin('');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (pin.length === 4) {
      // Auto-submit after a slight delay for better UX
      const timer = setTimeout(() => {
        handleLogin();
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [pin, role, selectedKasir]);

  return (
    <div className="min-h-screen w-full bg-main flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-15%] left-[-10%] w-96 h-96 bg-primary/20 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-15%] right-[-10%] w-96 h-96 bg-primary/20 rounded-full blur-[120px]"></div>

      <div className="bg-card w-full max-w-sm rounded-2xl shadow-sm border border-border p-8 relative z-10 animate-in fade-in duration-500 zoom-in-95">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary">
            <Store size={32} />
          </div>
          <h1 className="text-2xl font-black text-text tracking-tight">Batak Store 808</h1>
          <p className="text-sm text-text-secondary mt-1">Silakan masuk untuk melanjutkan</p>
        </div>

        {/* Role Selection Dropdown */}
        <div className="mb-4">
          <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
            Masuk Sebagai
          </label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-primary w-5 h-5" />
            <select
              value={role}
              onChange={(e) => {
                setRole(e.target.value);
                setPin('');
                setError('');
              }}
              className="w-full pl-12 pr-4 py-3 bg-main border border-border rounded-xl text-text font-bold appearance-none focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all cursor-pointer"
            >
              {roles.map(r => (
                <option key={r.id} value={r.id}>{r.label}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>

        {/* Kasir Target Selection (Only if role === 'kasir') */}
        {role === 'kasir' && (
          <div className="mb-6 animate-in fade-in slide-in-from-top-2">
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
              Pilih Nama Kasir
            </label>
            <select
              value={selectedKasir}
              onChange={(e) => setSelectedKasir(e.target.value)}
              className="w-full bg-main border border-border rounded-xl px-4 py-3 text-sm text-text font-semibold focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition-all"
            >
              {kasirList.length === 0 && <option value="">(Belum ada data kasir...)</option>}
              {kasirList.map(k => (
                <option key={k.id || k._id} value={k.id || k._id}>{k.fullname || k.nama}</option>
              ))}
            </select>
          </div>
        )}
        
        {role === 'owner' && <div className="mb-6"></div>}

        {/* PIN Input Field */}
        <div className="mb-6">
          <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-3 text-center">
            Masukkan PIN 4 Digit
          </label>
          <div className="relative">
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, '');
                setPin(val);
                setError('');
              }}
              className="w-full bg-main border-2 border-border focus:border-primary rounded-xl py-4 text-center text-3xl tracking-[1em] font-black text-text outline-none transition-all shadow-inner"
              placeholder="••••"
              autoFocus
              disabled={isLoading}
            />
          </div>
          
          <div className="h-4 mt-3 text-center">
             {error && <span className="text-danger text-xs font-bold flex items-center justify-center gap-1"><Lock size={12}/>{error}</span>}
             {isLoading && <span className="text-primary text-xs font-bold flex items-center justify-center gap-1">Memverifikasi...</span>}
          </div>
        </div>

      </div>
    </div>
  );
}
