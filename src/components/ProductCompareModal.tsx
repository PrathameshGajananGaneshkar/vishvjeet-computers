import React from 'react';
import { X, Star, ShoppingCart, Trash2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { formatINR } from '../utils/formatters';

interface ProductCompareModalProps {
  onClose: () => void;
}

export const ProductCompareModal: React.FC<ProductCompareModalProps> = ({ onClose }) => {
  const { compareProducts, removeFromCompare, clearCompare } = useStore();
  const { addItem } = useCart();
  const { language, t } = useLanguage();

  if (compareProducts.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="relative bg-white rounded-3xl max-w-6xl w-full max-h-[90vh] shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
              Product Comparison ({compareProducts.length} items)
            </h2>
            <p className="text-xs text-slate-500">
              Compare hardware specifications, prices, and features side by side
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={clearCompare}
              className="text-xs text-rose-600 font-bold hover:underline"
            >
              Clear All
            </button>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200 text-slate-500">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto p-6">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr>
                <th className="p-3 text-left w-40 text-slate-400 uppercase font-bold text-[10px] bg-slate-50 rounded-l-xl">
                  Product
                </th>
                {compareProducts.map((p) => (
                  <th key={p.id} className="p-4 text-center min-w-[200px] max-w-[240px] bg-white border border-slate-100">
                    <div className="relative group">
                      <button
                        onClick={() => removeFromCompare(p.id)}
                        className="absolute -top-2 -right-2 p-1 bg-rose-50 text-rose-600 rounded-full hover:bg-rose-100"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <img
                        src={p.images[0]}
                        alt=""
                        className="w-24 h-24 object-contain mx-auto mb-2"
                      />
                      <div className="font-bold text-slate-900 line-clamp-2 text-xs leading-tight mb-2">
                        {language === 'mr' && p.titleMr ? p.titleMr : p.title}
                      </div>
                      <div className="text-base font-extrabold text-blue-800">
                        {formatINR(p.price)}
                      </div>
                      <button
                        onClick={() => addItem(p, 1)}
                        className="mt-3 w-full py-1.5 px-3 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1"
                      >
                        <ShoppingCart className="w-3 h-3" />
                        <span>{t('addToCart')}</span>
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="p-3 font-semibold text-slate-500 bg-slate-50">Brand</td>
                {compareProducts.map((p) => (
                  <td key={p.id} className="p-3 text-center font-bold text-slate-800">
                    {p.brand}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-500 bg-slate-50">Rating</td>
                {compareProducts.map((p) => (
                  <td key={p.id} className="p-3 text-center">
                    <div className="inline-flex items-center gap-1 bg-emerald-700 text-white px-2 py-0.5 rounded text-[11px] font-bold">
                      <span>{p.rating}</span>
                      <Star className="w-3 h-3 fill-white" />
                    </div>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-500 bg-slate-50">Warranty</td>
                {compareProducts.map((p) => (
                  <td key={p.id} className="p-3 text-center text-slate-700">
                    {p.warranty}
                  </td>
                ))}
              </tr>
              {/* Dynamic Specifications */}
              {['Processor', 'RAM', 'Storage', 'Graphics', 'Display', 'Functions'].map((key) => (
                <tr key={key}>
                  <td className="p-3 font-semibold text-slate-500 bg-slate-50">{key}</td>
                  {compareProducts.map((p) => (
                    <td key={p.id} className="p-3 text-center text-slate-700">
                      {p.specifications[key] || '—'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
