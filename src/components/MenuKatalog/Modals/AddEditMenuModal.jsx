import React from 'react';
import api from '../../../services/axios';
import { UtensilsCrossed, X } from 'lucide-react';

export default function AddEditMenuModal({
  isOpen,
  onClose,
  editingItem,
  formData,
  setFormData,
  onSaveSuccess,
  presetImages
}) {
  if (!isOpen) return null;
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSaveMenu = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Mohon isi nama menu!');
      return;
    }

    const jualNum = parseInt(formData.harga_jual) || 0;
    const beliNum = parseInt(formData.price) || 0;
    const stockNum = parseInt(formData.stock) || 0;
    const autoStatus = stockNum === 0 ? 'Habis' : stockNum <= 10 ? 'Stok Menipis' : 'Tersedia';

    const payload = {
      nama_item: formData.name,
      kategori: formData.category,
      stok: stockNum,
      harga_modal: beliNum,
      harga_jual: jualNum,
      url_gambar: formData.image || presetImages[0].url
    };

    console.log(payload)

    setIsSubmitting(true);
    try {
      if (editingItem) {
        await api.patch(`/katalog/${editingItem.id}`, payload);
        onSaveSuccess(true);
      } else {
        await api.post('/katalog', payload);
        onSaveSuccess(false);
      }
    } catch (error) {
      console.error('Failed to save katalog item on server:', error);
      alert(error?.response?.data?.message || 'Terjadi kesalahan saat menyimpan data');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card w-full max-w-lg rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-border" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-main/50">
          <div className="flex items-center gap-2.5">
            <UtensilsCrossed size={20} className="text-primary" />
            <h3 className="font-bold text-lg text-text m-0">{editingItem ? 'Edit Stok & Info Menu' : 'Tambah Menu Angkringan Baru'}</h3>
          </div>
          <button
            className="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:text-text hover:bg-border/50 transition-colors"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSaveMenu} className="p-6 flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">Nama Item Menu *</label>
            <input
              type="text"
              className="w-full bg-main border border-border rounded-lg text-sm text-text px-3 py-2.5 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition-all"
              placeholder="Contoh: Sate Kulit Bakar"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">Kategori Menu</label>
              <select
                className="w-full bg-main border border-border rounded-lg text-sm text-text px-3 py-2.5 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition-all cursor-pointer"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="rokok"> Rokok</option>
                <option value="jajanan"> Jajanan</option>
                <option value="minuman"> Minuman</option>
                <option value="makanan"> Makanan</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">Stok Tersedia (Porsi)</label>
              <input
                type="number"
                className="w-full bg-main border border-border rounded-lg text-sm text-text px-3 py-2.5 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition-all"
                placeholder="30"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">Harga Jual (Rp)</label>
              <input
                type="number"
                className="w-full bg-main border border-border rounded-lg text-sm text-text px-3 py-2.5 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition-all"
                placeholder="4000"
                value={formData.harga_jual}
                onChange={(e) => setFormData({ ...formData, harga_jual: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">Harga Beli / Modal (Rp)</label>
              <input
                type="number"
                className="w-full bg-main border border-border rounded-lg text-sm text-text px-3 py-2.5 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition-all"
                placeholder="2000"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <label className="flex justify-between items-center text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
              <span>URL Foto Gambar Menu</span>
              <span className="text-primary tracking-normal">Preview Live</span>
            </label>
            <div className="flex gap-3 items-center">
              <input
                type="text"
                className="flex-1 bg-main border border-border rounded-lg text-sm text-text px-3 py-2.5 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition-all"
                placeholder="https://images.unsplash.com/..."
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              />
              <div className="w-11 h-11 rounded-lg overflow-hidden border border-border shrink-0 bg-main shadow-sm flex items-center justify-center">
                <img
                  src={formData.image}
                  alt="preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80';
                  }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-border">
            <button
              type="button"
              className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-main text-text border border-border hover:bg-border/50 transition-colors disabled:opacity-50"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold bg-primary hover:bg-primary-hover text-white shadow-md hover:shadow-lg hover:-translate-y-px transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                  Menyimpan...
                </>
              ) : (
                editingItem ? 'Simpan Perubahan' : 'Tambah Menu Ke Katalog'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
