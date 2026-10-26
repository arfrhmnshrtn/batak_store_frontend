import React, { useState, useEffect } from 'react';
import api from '../../services/axios';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  Printer,
  CreditCard,
  DollarSign,
  QrCode,
  BookOpen,
  Utensils,
  Coffee,
  Sparkles,
  Receipt
} from 'lucide-react';
import ReceiptModal from './Modals/ReceiptModal';

export default function PosView({ onAddOrder }) {
  const [selectedCategory, setSelectedCategory] = useState('semua');
  const [searchQuery, setSearchQuery] = useState('');

  // Cart & Order Form State
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [tableNumber, setTableNumber] = useState('01');
  const [paymentMethod, setPaymentMethod] = useState('tunai');
  const [paymentStatus, setPaymentStatus] = useState('lunas');
  const [cashGiven, setCashGiven] = useState('');

  // Receipt Modal State
  const [completedOrder, setCompletedOrder] = useState(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  const [productList, setProductList] = useState([]);

  useEffect(() => {
    api.get('/katalog')
      .then(res => {
        let data = [];
        if (res && Array.isArray(res.data)) data = res.data;
        else if (res && res.data && Array.isArray(res.data.data)) data = res.data.data;
        else if (Array.isArray(res)) data = res;

        if (Array.isArray(data)) {
          const mapped = data.map(item => {
            const icons = { sate: '🍢', nasi: '🍙', minuman: '🍹', gorengan: '🥟' };
            return {
              id: item.id,
              name: item.nama_item,
              category: item.kategori,
              price: item.harga_jual,
              stock: item.stok,
              image: item.url_gambar,
              desc: item.desc || item.deskripsi || `${item.nama_item} spesial Angkringan.`
            };
          });
          setProductList(mapped);
        }
      })
      .catch(err => {
        console.error('Failed to fetch katalog in POS:', err);
      });
  }, []);

  const categories = [
    { id: 'semua', label: 'Semua Menu' },
    { id: 'Rokok', label: 'Rokok' },
    { id: 'jajanan', label: 'Jajanan' },
    { id: 'minuman', label: 'Minuman' },
    { id: 'makanan', label: 'Makanan' },
  ];

  // Cart Handlers
  const handleAddToCart = (product) => {
    setCart(prevCart => {
      const existing = prevCart.find(item => item.id === product.id);
      if (existing) {
        return prevCart.map(item =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      console.log(product);
      return [...prevCart, { ...product, qty: 1 }];
    });
  };

  const handleUpdateQty = (productId, delta) => {
    setCart(prevCart => {
      return prevCart
        .map(item => {
          if (item.id === productId) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter(Boolean);
    });
  };

  const handleRemoveItem = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
    setCashGiven('');
  };

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const total = subtotal; // Can add tax/discount if needed
  const cashNum = Number(cashGiven) || 0;
  const changeAmount = paymentMethod === 'tunai' ? Math.max(0, cashNum - total) : 0;

  // Filter products
  const filteredProducts = productList.filter(p => {
    const matchCategory = selectedCategory === 'semua' || p.category === selectedCategory;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  // Handle Complete Order (Checkout)
  const handleCheckout = async (e) => {
    e.preventDefault();

    if (!customerName.trim()) {
      alert('Nama pelanggan wajib diisi!');
      return;
    }

    if (cart.length === 0) return;



    try {
      const payload = {
        nama_pelanggan: customerName.trim(),
        items: cart.map(item => ({
          id_menu: item.id,
          jumlah: item.qty
        })),
        metode_pembayaran: paymentMethod,
        status_pembayaran: paymentStatus
      };

      const result = await api.post('/pos-kasir', payload);

      // Use order ID from API if available, else fallback
      const orderId = result.data?.nomor_pesanan || `AK-${Math.floor(1000 + Math.random() * 9000)}`;
      const now = new Date();
      const formattedTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      // Format items string
      const itemsSummary = cart.map(item => `${item.qty}x ${item.name}`).join(', ');

      const newOrder = {
        id: orderId,
        customer: customerName.trim(),
        items: itemsSummary,
        cartItems: [...cart],
        total: `Rp ${total.toLocaleString('id-ID')}`,
        rawTotal: total,
        payment: paymentMethod,
        paymentStatus: paymentStatus,
        time: formattedTime,
        date: now.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
      };

      if (onAddOrder) {
        onAddOrder(newOrder);
      }

      console.log('Order Saved:', result.data);

      setCompletedOrder(newOrder);
      setIsReceiptOpen(true);
      handleClearCart();
      setCustomerName('');
    } catch (error) {
      console.error(error);
      alert('Terjadi kesalahan saat menyimpan pesanan: ' + error.message);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-5 items-start">

      {/* LEFT SECTION: Menu Catalog & Category Filters */}
      <div className="flex flex-col gap-4 flex-1 w-full">

        {/* Search & Category Filter Header */}
        <div className="bg-card border border-border p-4 rounded-xl shadow-sm">
          <div className="flex gap-3 items-center mb-3.5 flex-wrap">
            <div className="relative flex-1 min-w-60">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted w-4 h-4" />
              <input
                type="text"
                className="w-full pl-9 pr-4 py-2 bg-main border border-border rounded-lg text-sm text-text focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition-all"
                placeholder="Cari sate, nasi kucing, gorengan, es teh..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="text-sm text-muted font-semibold">
              {filteredProducts.length} Item Ditemukan
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar">
            {categories.map(cat => (
              <button
                key={cat.id}
                className={`flex-none px-4 py-1.5 rounded-full text-sm font-semibold transition-all border whitespace-nowrap ${selectedCategory === cat.id
                  ? 'bg-primary text-white border-primary shadow-md'
                  : 'bg-main text-text-secondary border-border hover:bg-border/50'
                  }`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {filteredProducts.map(product => {
            const inCart = cart.find(item => item.id === product.id);
            const isOutOfStock = product.stock <= 0;
            return (
              <div
                key={product.id}
                className={`bg-card rounded-xl p-3.5 flex flex-col transition-all relative overflow-hidden group shadow-sm
                  ${isOutOfStock ? 'opacity-60 cursor-not-allowed grayscale' : 'cursor-pointer hover:shadow-md'}
                  ${inCart && !isOutOfStock ? 'border-2 border-primary' : 'border border-border'}
                `}
                onClick={() => !isOutOfStock && handleAddToCart(product)}
              >
                {/* Stok Habis Overlay */}
                {isOutOfStock && (
                  <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 rounded-xl">
                    <span className="bg-red-600 text-white text-xs font-extrabold px-3 py-1.5 rounded-lg uppercase tracking-wider shadow-lg">
                      Stok Habis
                    </span>
                  </div>
                )}

                {inCart && !isOutOfStock && (
                  <span className="absolute top-2.5 right-2.5 bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-extrabold z-10 shadow-sm">
                    {inCart.qty}
                  </span>
                )}

                <div className="mb-2">
                  <div className="w-full h-24 mb-2 overflow-hidden rounded-lg bg-main">
                    <img
                      src={product.image}
                      alt={product.name}
                      className={`w-full h-full object-cover transition-transform duration-300 ${!isOutOfStock ? 'group-hover:scale-110' : ''}`}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80';
                      }}
                    />
                  </div>
                  <div className="font-bold text-sm text-text mb-1 line-clamp-2 leading-tight">
                    {product.name}
                  </div>
                </div>

                <div className="mt-auto">
                  <span className="font-extrabold text-primary text-sm block mb-2">
                    Rp {product.price.toLocaleString('id-ID')}
                  </span>
                  <button
                    className={`w-full py-1.5 px-3 rounded-lg text-xs font-semibold flex flex-none items-center justify-center gap-1.5 transition-colors
                      ${isOutOfStock
                        ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600 cursor-not-allowed'
                        : 'bg-primary hover:bg-primary-10 hover:text-white text-white border border-primary/20'
                      }
                    `}
                    disabled={isOutOfStock}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isOutOfStock) handleAddToCart(product);
                    }}
                  >
                    {isOutOfStock ? (
                      <>Habis</>
                    ) : (
                      <><Plus size={14} /> Tambah</>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT SECTION: Cart / Checkout Side Panel */}
      <div className="bg-card w-full lg:w-95 p-5 border border-border rounded-xl shadow-sm sticky top-22.5 shrink-0">
        <div className="flex justify-between items-center pb-3 border-b border-border mb-3.5">
          <div className="flex items-center gap-2 font-extrabold text-[1.05rem]">
            <ShoppingCart size={20} className="text-primary" />
            <span>Keranjang Kasir</span>
          </div>
          {cart.length > 0 && (
            <button
              className="text-danger hover:text-danger hover:bg-danger-bg px-2 py-1 rounded text-xs font-semibold transition-colors"
              onClick={handleClearCart}
            >
              Kosongkan
            </button>
          )}
        </div>

        {/* Customer Input */}
        <div className="mb-3.5">
          <label className="block text-xs font-semibold text-text-secondary mb-1">Nama Pelanggan</label>
          <input
            type="text"
            className="w-full bg-main border border-border rounded-lg text-sm text-text px-3 py-1.5 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition-all"
            placeholder="Pelanggan"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            required
          />
        </div>

        {/* Cart Item List */}
        <div className="max-h-65 overflow-y-auto flex flex-col gap-2.5 pr-1 mb-4 border-b border-border pb-3.5 custom-scrollbar">
          {cart.length > 0 ? (
            cart.map(item => (
              <div
                key={item.id}
                className="flex justify-between items-center bg-main p-2 rounded-lg border border-border/50"
              >
                <div className="flex-1">
                  <div className="font-semibold text-sm leading-tight text-text">{item.name}</div>
                  <div className="text-xs text-muted font-medium mt-0.5">
                    Rp {item.price.toLocaleString('id-ID')} x {item.qty}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-card p-0.5 rounded-md border border-border">
                    <button
                      className="text-text hover:text-danger p-1 rounded hover:bg-danger-bg transition-colors"
                      onClick={() => handleUpdateQty(item.id, -1)}
                    >
                      <Minus size={12} />
                    </button>
                    <span className="text-xs font-bold w-4 text-center">{item.qty}</span>
                    <button
                      className="text-text hover:text-primary p-1 rounded hover:bg-primary-light transition-colors"
                      onClick={() => handleUpdateQty(item.id, 1)}
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  <span className="font-bold text-sm w-16 text-right text-text">
                    Rp {(item.price * item.qty).toLocaleString('id-ID')}
                  </span>

                  <button
                    className="text-danger p-1.5 hover:bg-danger-bg rounded-md transition-colors ml-1"
                    onClick={() => handleRemoveItem(item.id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted text-sm px-4">
              <div className="flex justify-center mb-2"><ShoppingCart size={32} className="opacity-20" /></div>
              Keranjang masih kosong.<br />Klik menu di samping untuk menambah.
            </div>
          )}
        </div>

        {/* Payment Options & Summary */}
        <div className="flex flex-col gap-2.5">

          <div className="flex gap-2">
            <div className="flex-1 flex flex-col gap-1">
              <label className="block text-xs font-semibold text-text-secondary">Metode</label>
              <select
                className="w-full bg-main border border-border rounded-lg text-sm text-text px-3 py-1.5 focus:outline-none focus:border-primary transition-all"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="tunai">Tunai</option>
                <option value="qris">QRIS</option>
                <option value="transfer">Transfer</option>
              </select>
            </div>

            <div className="flex-1 flex flex-col gap-1">
              <label className="block text-xs font-semibold text-text-secondary">Status</label>
              <select
                className="w-full bg-main border border-border rounded-lg text-sm text-text px-3 py-1.5 focus:outline-none focus:border-primary transition-all"
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
              >
                <option value="lunas">Lunas</option>
                <option value="hutang">Hutang</option>
              </select>
            </div>
          </div>

          {/* Total Box */}
          <div className="bg-main p-3 rounded-lg border border-border mt-1.5 flex justify-between items-center">
            <div>
              <div className="text-[0.7rem] text-muted font-bold uppercase tracking-wider mb-0.5">Total Tagihan</div>
              <div className="text-xl font-black text-primary">
                Rp {total.toLocaleString('id-ID')}
              </div>
            </div>
            <div className="text-xs text-text-secondary font-medium bg-card px-2 py-1 rounded border border-border">
              {cart.reduce((sum, item) => sum + item.qty, 0)} Items
            </div>
          </div>

          {/* Checkout Action Button */}
          <button
            className={`w-full py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 mt-1.5 transition-all shadow-md
              ${cart.length === 0 ? 'bg-primary/50 text-white/70 cursor-not-allowed shadow-none' : 'bg-primary hover:bg-primary-hover text-white hover:-translate-y-px'}
            `}
            disabled={cart.length === 0}
            onClick={handleCheckout}
          >
            <Printer size={18} />
            Buat Pesanan
          </button>
        </div>
      </div>

      {/* PRINT RECEIPT MODAL */}
      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        completedOrder={completedOrder}
      />
    </div>
  );
}
