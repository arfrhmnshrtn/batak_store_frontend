import React, { useRef, useState } from 'react';
import api from '../../../services/axios';
import { UtensilsCrossed, X, Upload, ImagePlus, Trash2 } from 'lucide-react';
import { getMenuImageSrc, DEFAULT_MENU_IMAGE } from '../../../utils/imageUrl';

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

export default function AddEditMenuModal({
  isOpen,
  onClose,
  editingItem,
  formData,
  setFormData,
  onSaveSuccess,
}) {
  if (!isOpen) return null;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [fileError, setFileError] = useState('');
  const fileInputRef = useRef(null);

  // Current image to display when editing (before choosing new file)
  const currentImageSrc = previewUrl
    ? previewUrl
    : editingItem
      ? getMenuImageSrc(editingItem.url_gambar)
      : null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileError('');

    // Client-side MIME type check
    if (!ALLOWED_TYPES.includes(file.type)) {
      setFileError(`Format file tidak didukung. Hanya JPEG, PNG, dan WebP yang diizinkan.`);
      e.target.value = '';
      return;
    }

    // Client-side extension check
    const ext = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setFileError(`Ekstensi file tidak valid (${ext}). Hanya .jpg, .jpeg, .png, .webp.`);
      e.target.value = '';
      return;
    }

    // Client-side size check
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setFileError(`Ukuran file terlalu besar (${(file.size / 1024 / 1024).toFixed(2)} MB). Maksimum ${MAX_FILE_SIZE_MB} MB.`);
      e.target.value = '';
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setFileError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSaveMenu = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Mohon isi nama menu!');
      return;
    }

    const jualNum = parseInt(formData.harga_jual) || 0;
    const beliNum = parseInt(formData.price) || 0;
    const stockNum = parseInt(formData.stock) || 0;

    // Build FormData for multipart/form-data
    const data = new FormData();
    data.append('nama_item', formData.name);
    data.append('kategori', formData.category);
    data.append('stok', String(stockNum));
    data.append('harga_modal', String(beliNum));
    data.append('harga_jual', String(jualNum));

    // Only send file if user selected one
    if (selectedFile) {
      data.append('foto', selectedFile);
    }

    setIsSubmitting(true);
    try {
      if (editingItem) {
        await api.patch(`/katalog/${editingItem.id}`, data, {
          headers: { 'Content-Type': undefined }, // Let browser set multipart boundary
        });
        onSaveSuccess(true);
      } else {
        await api.post('/katalog', data, {
          headers: { 'Content-Type': undefined },
        });
        onSaveSuccess(false);
      }
    } catch (error) {
      console.error('Failed to save katalog item on server:', error);
      const msg =
        error?.message ||
        error?.response?.data?.message ||
        error?.data?.message ||
        'Terjadi kesalahan saat menyimpan data';
      alert(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    handleClearFile();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="bg-card w-full max-w-lg rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-main/50">
          <div className="flex items-center gap-2.5">
            <UtensilsCrossed size={20} className="text-primary" />
            <h3 className="font-bold text-lg text-text m-0">
              {editingItem ? 'Edit Stok & Info Menu' : 'Tambah Menu Baru'}
            </h3>
          </div>
          <button
            className="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:text-text hover:bg-border/50 transition-colors"
            onClick={handleClose}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSaveMenu} className="p-6 flex flex-col gap-4 max-h-[80vh] overflow-y-auto">
          {/* Nama Item */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
              Nama Item Menu *
            </label>
            <input
              type="text"
              className="w-full bg-main border border-border rounded-lg text-sm text-text px-3 py-2.5 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition-all"
              placeholder="Contoh: Sate Kulit Bakar"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          {/* Kategori & Stok */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
                Kategori Menu
              </label>
              <select
                className="w-full bg-main border border-border rounded-lg text-sm text-text px-3 py-2.5 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition-all cursor-pointer"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="rokok">Rokok</option>
                <option value="jajanan">Jajanan</option>
                <option value="minuman">Minuman</option>
                <option value="makanan">Makanan</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
                Stok Tersedia (Porsi)
              </label>
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

          {/* Harga */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
                Harga Jual (Rp)
              </label>
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
              <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
                Harga Beli / Modal (Rp)
              </label>
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

          {/* Upload Foto */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
              Foto Menu{' '}
              <span className="normal-case text-muted font-normal tracking-normal">
                (opsional · maks. {MAX_FILE_SIZE_MB} MB · JPEG/PNG/WebP)
              </span>
            </label>

            {/* Preview gambar saat ini */}
            {currentImageSrc && (
              <div className="relative mb-3 w-full h-36 rounded-lg overflow-hidden border border-border bg-main">
                <img
                  src={currentImageSrc}
                  alt="Preview foto menu"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = DEFAULT_MENU_IMAGE;
                  }}
                />
                {/* Label preview */}
                <span className="absolute bottom-2 left-2 text-[0.65rem] bg-black/60 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">
                  {selectedFile ? 'Foto baru (belum disimpan)' : 'Foto saat ini'}
                </span>
                {/* Tombol hapus pilihan foto baru */}
                {selectedFile && (
                  <button
                    type="button"
                    onClick={handleClearFile}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-danger/80 transition-colors"
                    title="Batalkan pilihan foto baru"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            )}

            {/* Area pilih file */}
            <div className="relative">
              <input
                ref={fileInputRef}
                id="foto-upload-input"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                onChange={handleFileChange}
                disabled={isSubmitting}
              />
              <div
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all ${
                  fileError
                    ? 'border-danger bg-danger-bg'
                    : 'border-border bg-main hover:border-primary hover:ring-2 hover:ring-primary-light'
                }`}
              >
                <div className="flex items-center gap-2 text-sm text-text-secondary flex-1 min-w-0">
                  <ImagePlus size={16} className="shrink-0 text-primary" />
                  <span className="truncate">
                    {selectedFile ? selectedFile.name : 'Pilih foto dari perangkat...'}
                  </span>
                </div>
                <div className="shrink-0 flex items-center gap-1.5 text-xs font-semibold text-primary border border-primary/30 bg-primary-light px-2.5 py-1 rounded-lg whitespace-nowrap">
                  <Upload size={12} />
                  {selectedFile ? 'Ganti' : 'Pilih File'}
                </div>
              </div>
            </div>

            {/* Info ukuran file */}
            {selectedFile && !fileError && (
              <p className="text-xs text-success mt-1.5 flex items-center gap-1">
                <span className="inline-block w-3 h-3 rounded-full bg-success/20 border border-success text-center leading-3 text-[10px]">✓</span>
                {selectedFile.name} · {(selectedFile.size / 1024).toFixed(0)} KB
              </p>
            )}

            {/* Info: foto lama dipertahankan */}
            {editingItem && !selectedFile && !fileError && (
              <p className="text-xs text-muted mt-1.5">
                Biarkan kosong untuk mempertahankan foto saat ini.
              </p>
            )}

            {/* Error pesan */}
            {fileError && (
              <p className="text-xs text-danger mt-1.5 font-medium">{fileError}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 mt-2 pt-4 border-t border-border">
            <button
              type="button"
              className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-main text-text border border-border hover:bg-border/50 transition-colors disabled:opacity-50"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !!fileError}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold bg-primary hover:bg-primary-hover text-white shadow-md hover:shadow-lg hover:-translate-y-px transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
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
