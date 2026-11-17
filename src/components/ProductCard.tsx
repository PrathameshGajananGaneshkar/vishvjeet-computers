import React from 'react';
import { Heart, ShoppingCart, Star, Check, Zap, ArrowLeftRight, ShieldCheck } from 'lucide-react';
import { Product } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { calculateDiscountPercent, formatINR } from '../utils/formatters';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onQuickBuy?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
  onQuickBuy,
}) => {
  const { language, t } = useLanguage();
  const { addItem, items } = useCart();
  const { toggleWishlist, isInWishlist, addToCompare, compareProducts } = useStore();

  const discountPercent = calculateDiscountPercent(product.mrp, product.price);
  const inCart = items.some(item => item.product.id === product.id);
  const wishlisted = isInWishlist(product.id);
  const isCompared = compareProducts.some(p => p.id === product.id);

  return (
    <div className="group relative bg-white rounded-xs border border-slate-200 hover:shadow-xl hover:border-slate-300 transition-all duration-200 flex flex-col overflow-hidden">
      {/* Product Image Area */}
      <div 
        className="relative aspect-square w-full p-2.5 sm:p-4 overflow-hidden flex items-center justify-center cursor-pointer bg-white"
        onClick={() => onSelect(product)}
      >
        {/* Flipkart Deal Tag */}
        {discountPercent >= 20 && (
          <span className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 z-10 px-1.5 py-0.5 rounded-xs bg-[#388e3c] text-white text-[9px] sm:text-[10px] font-bold tracking-wide">
            {discountPercent}% OFF
          </span>
        )}

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-1.5 right-1.5 sm:top-2 sm:right-2 z-10 p-1 sm:p-1.5 rounded-full transition-all ${
            wishlisted
              ? 'text-[#ff6161]'
              : 'text-slate-300 hover:text-[#ff6161]'
          }`}
          title={t('myWishlist')}
        >
          <Heart className={`w-4 h-4 ${wishlisted ? 'fill-[#ff6161] text-[#ff6161]' : ''}`} />
        </button>

        {/* Product Image */}
        <img
          src={product.images[0]}
          alt={product.title}
          className="h-full w-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-200"
          loading="lazy"
        />
      </div>

      {/* Product Content Details */}
      <div className="p-2.5 sm:p-4 flex-1 flex flex-col border-t border-slate-100">
        {/* Brand */}
        <div className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-0.5 truncate">
          {product.brand}
        </div>

        {/* Title */}
        <h3
          onClick={() => onSelect(product)}
          className="text-xs sm:text-sm font-semibold text-slate-900 group-hover:text-[#2874f0] transition-colors line-clamp-2 cursor-pointer leading-snug mb-1.5"
          title={product.title}
        >
          {language === 'mr' && product.titleMr ? product.titleMr : product.title}
        </h3>

        {/* Rating and Flipkart Assured Badge */}
        <div className="flex items-center justify-between gap-1 mb-1.5 sm:mb-2">
          <div className="flex items-center gap-1">
            <div className="inline-flex items-center gap-0.5 px-1 sm:px-1.5 py-0.5 rounded-xs bg-[#388e3c] text-white text-[9px] sm:text-[10px] font-bold">
              <span>{product.rating}</span>
              <Star className="w-2.5 h-2.5 fill-white" />
            </div>
            <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium">
              ({product.reviewCount})
            </span>
          </div>

          {/* Flipkart "f-Assured" style "VC Assured" Badge */}
          <div className="hidden xs:inline-flex sm:inline-flex items-center gap-0.5 px-1 py-0.5 bg-blue-50 border border-blue-200 rounded text-[8px] sm:text-[9px] font-black text-[#2874f0] shrink-0">
            <span>VC</span>
            <span className="text-yellow-500 font-bold">Assured</span>
          </div>
        </div>

        {/* Flipkart Pricing Layout */}
        <div className="mt-auto pt-1">
          <div className="flex items-baseline gap-1.5 sm:gap-2 flex-wrap">
            <span className="text-sm sm:text-lg font-black text-slate-900">
              {formatINR(product.price)}
            </span>
            {product.mrp > product.price && (
              <span className="text-[10px] sm:text-xs text-slate-400 line-through">
                {formatINR(product.mrp)}
              </span>
            )}
            {discountPercent > 0 && (
              <span className="text-[10px] sm:text-xs font-bold text-[#388e3c]">
                {discountPercent}% off
              </span>
            )}
          </div>

          <div className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 flex items-center justify-between gap-1">
            <span className="text-[#388e3c] font-medium truncate">Free delivery</span>
            {product.stock <= 5 && product.stock > 0 ? (
              <span className="text-rose-600 font-bold text-[9px] sm:text-[10px] shrink-0">{product.stock} left</span>
            ) : null}
          </div>
        </div>

        {/* Flipkart Signature Dual Action Buttons: Yellow Cart & Orange Buy Now */}
        <div className="grid grid-cols-2 gap-1 sm:gap-1.5 mt-2.5 sm:mt-3 pt-2 border-t border-slate-100">
          <button
            onClick={() => addItem(product, 1)}
            disabled={product.stock <= 0}
            className={`py-2 px-1 text-[10px] sm:text-xs font-bold rounded-xs flex items-center justify-center gap-1 transition-all cursor-pointer ${
              inCart
                ? 'bg-emerald-600 text-white'
                : 'bg-[#ff9f00] hover:bg-[#f39700] text-white shadow-xs'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {inCart ? (
              <>
                <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                <span className="truncate">ADDED</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                <span className="sm:hidden">CART</span>
                <span className="hidden sm:inline truncate">ADD TO CART</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              if (onQuickBuy) {
                onQuickBuy(product);
              } else {
                addItem(product, 1);
                onSelect(product);
              }
            }}
            disabled={product.stock <= 0}
            className="py-2 px-1 bg-[#fb641b] hover:bg-[#e85b17] active:scale-95 text-white rounded-xs text-[10px] sm:text-xs font-bold flex items-center justify-center gap-1 shadow-xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current shrink-0" />
            <span className="truncate">BUY NOW</span>
          </button>
        </div>

        {/* Compare link */}
        <button
          onClick={() => addToCompare(product)}
          className={`mt-2 text-center text-[10px] font-semibold transition-colors ${
            isCompared ? 'text-[#2874f0]' : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          {isCompared ? '✓ Added to Compare' : '+ Add to Compare'}
        </button>
      </div>
    </div>
  );
};
