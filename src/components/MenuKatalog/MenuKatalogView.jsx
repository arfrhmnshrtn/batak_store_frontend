import React, { useState, useEffect } from 'react';
import api from '../../services/axios';
import { UtensilsCrossed, Plus, Search, CheckCircle2, Eye, Edit3, Trash2, Box, AlertTriangle } from 'lucide-react';
import AddEditMenuModal from './Modals/AddEditMenuModal';

export default function MenuKatalogView() {
  const [selectedCategory, setSelectedCategory] = useState('semua');
  const [katalogQuery, setKatalogQuery] = useState('');

  // Sample Preset Images for Quick Selection
  const presetImages = [
    { label: '🍢 Sate Kulit', url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80' },
    { label: '🍢 Sate Usus', url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80' },
    { label: '🍡 Sate Puyuh', url: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=600&q=80' },
    { label: '🍙 Nasi Teri', url: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=600&q=80' },
    { label: '🐟 Nasi Bandeng', url: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=600&q=80' },
    { label: '☕ Wedang Jahe', url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80' },
    { label: '🍹 Es Teh', url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=600&q=80' },
    { label: '🧇 Tempe Mendoan', url: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=600&q=80' }
  ];

  const [menuList, setMenuList] = useState([]);

  const fetchKatalog = async () => {
    try {
      const res = await api.get('/katalog');
      let data = [];
      if (res && Array.isArray(res.data)) data = res.data;
      else if (res && res.data && Array.isArray(res.data.data)) data = res.data.data;
      else if (Array.isArray(res)) data = res;

      if (Array.isArray(data)) {
        const mapped = data.map(item => {
          const stockNum = item.stok || 0;
          const autoStatus = stockNum === 0 ? 'Habis' : stockNum <= 10 ? 'Stok Menipis' : 'Tersedia';
          return {
            id: item.id,
            name: item.nama_item,
            category: item.kategori,
            harga_jual: `Rp ${item.harga_jual.toLocaleString('id-ID')}`,
            price: `Rp ${item.harga_modal.toLocaleString('id-ID')}`,
            rawHargaJual: item.harga_jual,
            rawHargaBeli: item.harga_modal,
            stock: stockNum,
            status: autoStatus,
            image: item.url_gambar || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80'
          };
        });
        setMenuList(mapped);
      }
    } catch (err) {
      console.error('Failed to fetch katalog:', err);
    }
  };

  useEffect(() => {
    fetchKatalog();
  }, []);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Alert State
  const [successAlert, setSuccessAlert] = useState({ show: false, message: '' });

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: 'bakaran',
    harga_jual: '4000',
    price: '2000',
    stock: 20,
    status: 'Tersedia',
    image: presetImages[0].url,
    desc: ''
  });

  const filteredMenu = menuList.filter(item => {
    const matchCat = selectedCategory === 'semua' || item.category === selectedCategory;
    const matchSearch = item.name.toLowerCase().includes(katalogQuery.toLowerCase()) ||
      (item.desc && item.desc.toLowerCase().includes(katalogQuery.toLowerCase()));
    return matchCat && matchSearch;
  });

  // Calculate quick metrics
  const totalItems = menuList.length;
  const lowStockItems = menuList.filter(i => i.stock <= 10 && i.stock > 0).length;
  const outOfStockItems = menuList.filter(i => i.stock === 0).length;

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      category: 'rokok',
      harga_jual: '4000',
      price: '2000',
      stock: 30,
      status: 'Tersedia',
      image: presetImages[0].url,
      desc: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      harga_jual: item.harga_jual.replace(/[^0-9]/g, '') || item.rawHargaJual || '4000',
      price: item.price.replace(/[^0-9]/g, '') || item.rawHargaBeli || '2000',
      stock: item.stock,
      status: item.status,
      image: item.image || presetImages[0].url,
      desc: item.desc || ''
    });
    setIsModalOpen(true);
  };

  const handleDeleteItem = async (id, namaItem) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus katalog "${namaItem}"?`)) {
      try {
        await api.delete(`/katalog/${id}`);
        setSuccessAlert({ show: true, message: 'Berhasil menghapus katalog!' });
        await fetchKatalog();
        setTimeout(() => {
          setSuccessAlert({ show: false, message: '' });
        }, 3000);
      } catch (error) {
        console.error('Failed to delete katalog:', error);
        alert(error?.response?.data?.message || 'Gagal menghapus katalog');
      }
    }
  };

  const handleSaveSuccess = async (isEdit) => {
    setIsModalOpen(false);

    if (isEdit) {
      setSuccessAlert({ show: true, message: 'Berhasil memperbarui menu!' });
    } else {
      setSuccessAlert({ show: true, message: 'Berhasil menambahkan menu baru!' });
    }

    await fetchKatalog();

    setTimeout(() => {
      setSuccessAlert({ show: false, message: '' });
    }, 3000);
  };

  return (
    <div className="flex flex-col gap-5 relative">
      {/* Success Alert */}
      {successAlert.show && (
        <div className="absolute top-0 right-0 z-50 animate-in fade-in slide-in-from-top-4 flex items-center gap-2 bg-green-100 text-green-700 font-bold px-4 py-3 rounded-lg shadow-md border border-green-200">
          <CheckCircle2 size={20} />
          <span>{successAlert.message}</span>
        </div>
      )}

      {/* Top Banner Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border p-4 rounded-xl shadow-sm flex items-center gap-4">
          <div className="p-2.5 rounded-lg bg-primary-light text-primary flex items-center justify-center">
            <Box size={22} />
          </div>
          <div>
            <div className="text-xs text-muted font-medium uppercase tracking-wider mb-1">Total Varian Menu</div>
            <div className="text-xl font-extrabold text-text">{totalItems} Menu</div>
          </div>
        </div>

        <div className="bg-card border border-border p-4 rounded-xl shadow-sm flex items-center gap-4">
          <div className="p-2.5 rounded-lg bg-success-bg text-success flex items-center justify-center">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div className="text-xs text-muted font-medium uppercase tracking-wider mb-1">Stok Tersedia</div>
            <div className="text-xl font-extrabold text-success">{totalItems - (lowStockItems + outOfStockItems)} Menu</div>
          </div>
        </div>

        <div className="bg-card border border-border p-4 rounded-xl shadow-sm flex items-center gap-4">
          <div className="p-2.5 rounded-lg bg-warning-bg text-amber-700 flex items-center justify-center">
            <AlertTriangle size={22} />
          </div>
          <div>
            <div className="text-xs text-muted font-medium uppercase tracking-wider mb-1">Stok Menipis (≤10)</div>
            <div className="text-xl font-extrabold text-amber-700">{lowStockItems} Menu</div>
          </div>
        </div>
      </div>

      {/* Main Catalog Header & Filter Card */}
      <div className="bg-card border border-border rounded-xl shadow-sm p-5 flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <UtensilsCrossed size={24} className="text-primary" />
            <div>
              <h2 className="text-lg font-bold text-text mb-0.5">Katalog & Stok Menu Toko</h2>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted w-4 h-4" />
              <input
                type="text"
                className="w-60 pl-9 pr-4 py-2 bg-main border border-border rounded-lg text-sm text-text focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition-all"
                placeholder="Cari sate, nasi, minuman..."
                value={katalogQuery}
                onChange={(e) => setKatalogQuery(e.target.value)}
              />
            </div>
            <button
              className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors shadow-sm"
              onClick={handleOpenAddModal}
            >
              <Plus size={16} />
              Tambah Menu Baru
            </button>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center flex-wrap gap-2 pt-2">
          {['semua', 'rokok', 'jajanan', 'minuman', 'makanan'].map(cat => (
            <button
              key={cat}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all capitalize border ${selectedCategory === cat
                ? 'bg-primary text-white border-primary shadow-md'
                : 'bg-main text-text-secondary border-border hover:bg-border/50'
                }`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat === 'rokok' ? 'rokok' : cat === 'jajanan' ? 'jajanan' : cat === 'minuman' ? 'minuman' : cat === 'makanan' ? 'makanan' : 'Semua Kategori'}
            </button>
          ))}
        </div>

        {/* Product Cards Grid with Food Images */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-5 gap-4 mt-2">
          {filteredMenu.map(item => {
            const isLowStock = item.stock <= 10 && item.stock > 0;
            const isOutOfStock = item.stock === 0;

            const badgeBg = isOutOfStock ? 'bg-danger/90' : isLowStock ? 'bg-amber-500/90' : 'bg-emerald-500/90';

            return (
              <div key={item.id} className="flex flex-col bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group relative">
                {/* Food Image Banner Container */}
                <div className="relative w-full h-40 bg-main overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80';
                    }}
                  />

                  {/* Image Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                  {/* Top-Left Category Badge */}
                  <span className="absolute top-2.5 left-2.5 text-[0.65rem] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-900/75 backdrop-blur-sm text-white border border-white/20">
                    {item.category === 'bakaran' ? 'bakaran' : item.category === 'jajanan' ? 'jajanan' : item.category === 'minuman' ? 'minuman' : 'makanan'}
                  </span>

                  {/* Top-Right Status Badge */}
                  <span className={`absolute top-2.5 right-2.5 text-[0.65rem] font-bold px-2.5 py-1 rounded-full text-white shadow-sm ${badgeBg}`}>
                    {isOutOfStock ? 'Habis' : isLowStock ? 'Stok Menipis' : 'Tersedia'}
                  </span>

                  <div className="absolute bottom-2.5 left-3 text-white text-xs font-semibold drop-shadow-md">
                    Stok: {item.stock}
                  </div>
                </div>

                {/* Card Body Details */}
                <div className="p-4 flex flex-col flex-1 gap-3">
                  <div>
                    <h4 className="text-[1.05rem] font-bold text-text mb-1 leading-tight">
                      {item.name}
                    </h4>
                    {item.desc && (
                      <p className="text-xs text-text-secondary leading-snug line-clamp-2">
                        {item.desc}
                      </p>
                    )}
                  </div>

                  {/* Price & Stock Stats Box */}
                  <div className="bg-main border border-border rounded-lg p-2.5 flex items-center justify-between mt-auto">
                    <div>
                      <div className="text-[0.65rem] text-muted uppercase font-bold tracking-wider mb-0.5">Harga Jual</div>
                      <div className="text-base font-black text-primary">{item.harga_jual}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[0.65rem] text-muted uppercase font-bold tracking-wider mb-0.5">Harga Beli</div>
                      <div className="text-sm font-bold text-text-secondary">{item.price}</div>
                    </div>
                  </div>

                  {/* Stock Progress Indicator */}
                  <div>
                    <div className="flex justify-between items-center text-[0.7rem] font-bold mb-1.5">
                      <span className="text-muted text-[0.68rem] uppercase tracking-wider">Status Stok</span>
                      <span className={isOutOfStock ? 'text-danger' : isLowStock ? 'text-warning' : 'text-success'}>
                        {item.stock} porsi tersisa
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-border/50 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${isOutOfStock ? 'bg-danger' : isLowStock ? 'bg-warning' : 'bg-success'}`}
                        style={{ width: `${Math.min(100, (item.stock / 50) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Card Action Buttons */}
                  <div className="flex items-center gap-2 pt-2 border-t border-border border-dashed mt-1">
                    <button
                      className="flex-1 flex justify-center items-center gap-1.5 px-2 py-1.5 bg-card hover:bg-main border border-border rounded bg-main text-text text-xs font-semibold transition-colors"
                      onClick={() => handleOpenEditModal(item)}
                    >
                      <Edit3 size={13} /> Edit
                    </button>
                    <button
                      className="flex justify-center flex-none items-center p-1.5 bg-card hover:bg-danger-bg border border-border hover:border-danger-bg rounded text-danger transition-colors cursor-pointer"
                      onClick={() => handleDeleteItem(item.id, item.name)}
                      title="Hapus Menu"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL: ADD / EDIT MENU ITEM */}
      <AddEditMenuModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingItem={editingItem}
        formData={formData}
        setFormData={setFormData}
        onSaveSuccess={handleSaveSuccess}
        presetImages={presetImages}
      />

    </div>
  );
}
