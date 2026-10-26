import React from 'react';
import { TrendingDown, ChevronRight, ArrowLeft } from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import { useNavigate } from 'react-router-dom';

export default function BadProductTable({ products, isFullPage = false }) {
  const navigate = useNavigate();
  const displayProducts = isFullPage ? products : products?.slice(0, 5);

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm p-6 xl:col-span-2 h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
        <div className="flex items-center gap-2 font-bold text-lg text-text">
          {isFullPage && (
            <button onClick={() => navigate(-1)} className="p-1 hover:bg-main rounded-lg transition-colors text-text-secondary mr-1">
              <ArrowLeft size={20} />
            </button>
          )}
          <TrendingDown size={20} className="text-red-500" />
          <span>Produk Kurang Laku</span>
        </div>
      </div>

      {!products || products.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-muted font-medium py-8">
          Belum ada data produk pada periode ini.
        </div>
      ) : (
        <div className="w-full overflow-x-auto flex-1 custom-scrollbar">
          <table className="w-full text-left text-sm border-collapse min-w-175">
            <thead>
              <tr className="bg-main text-text-secondary border-b border-border">
                <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider w-16">#</th>
                <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Menu</th>
                <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Kategori</th>
                <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider text-right">Terjual</th>
                <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider text-right">Omzet</th>
                <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider text-right">Modal</th>
                <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider text-right">Laba</th>
              </tr>
            </thead>
            <tbody>
              {displayProducts?.map((item, index) => (
                <tr key={item.id} className="border-b border-border hover:bg-main/30 transition-colors">
                  <td className="px-4 py-3 font-bold text-red-500">{item.ranking || (index + 1)}</td>
                  <td className="px-4 py-3 font-semibold text-text">{item.name}</td>
                  <td className="px-4 py-3 text-text-secondary capitalize">{item.category}</td>
                  <td className="px-4 py-3 text-right font-medium text-text">{item.quantity} item</td>
                  <td className="px-4 py-3 text-right font-medium text-text">{formatCurrency(item.revenue)}</td>
                  <td className="px-4 py-3 text-right text-text-secondary">{formatCurrency(item.cost)}</td>
                  <td className="px-4 py-3 text-right font-bold text-red-500">{formatCurrency(item.profit)}</td>
                </tr>
              ))}
            </tbody>
          </table>


          {!isFullPage && products?.length > 5 && (
            <div
              className="flex justify-center border-t border-border p-3 bg-red-50/50 hover:bg-red-50 dark:bg-red-900/10 dark:hover:bg-red-900/20 transition-colors w-full cursor-pointer"
              onClick={() => navigate('/analysis/bad-products', { state: { products } })}
            >
              <button
                className="text-xs font-semibold text-red-500 flex items-center gap-1.5 focus:outline-hidden"
              >
                Lihat Detail ({products.length} Menu) <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
