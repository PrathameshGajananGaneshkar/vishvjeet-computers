import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  Tag, 
  ArrowRight, 
  ShieldCheck, 
  Truck 
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { useLanguage } from '../context/LanguageContext';
import { formatINR } from '../utils/formatters';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToCheckout: () => void;
  onStartShopping: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  onProceedToCheckout,
  onStartShopping,
}) => {
  const { 
    items, 
    removeItem, 
    updateQuantity, 
    itemCount, 
    subtotal, 
    discountAmount, 
    shippingFee, 
    taxAmount, 
    totalAmount,
    appliedCoupon,
    applyCouponCode,
    removeCoupon
  } = useCart();
  const { settings } = useStore();
  const { language, t } = useLanguage();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');

  if (!isOpen) return null;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    if (!couponInput.trim()) return;

    const res = applyCouponCode(couponInput);
    if (!res.success) {
      setCouponError(res.message);
    } else {
      setCouponInput('');
    }
  };

  const amountNeededForFreeShipping = Math.max(0, settings.freeShippingThreshold - subtotal);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-blue-700" />
            <span className="font-extrabold text-slate-900 text-sm">
              {t('shoppingCart')} ({itemCount})
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        {subtotal > 0 && (
          <div className="p-3 bg-blue-50 border-b border-blue-100 text-xs text-blue-900 flex items-center gap-2">
            <Truck className="w-4 h-4 text-blue-700 shrink-0" />
            {amountNeededForFreeShipping > 0 ? (
              <span>
                Add <strong>{formatINR(amountNeededForFreeShipping)}</strong> more for <strong>FREE Delivery</strong>!
              </span>
            ) : (
              <span className="font-bold text-emerald-700">
                You've unlocked FREE Delivery across Maharashtra!
              </span>
            )}
          </div>
        )}

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length > 0 ? (
            items.map(({ product, quantity }) => (
              <div
                key={product.id}
                className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex gap-3 items-center"
              >
                <img
                  src={product.images[0]}
                  alt=""
                  className="w-16 h-16 object-contain rounded-xl bg-white p-1 border border-slate-200 shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                    {language === 'mr' && product.titleMr ? product.titleMr : product.title}
                  </h4>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                    {product.brand}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs font-extrabold text-slate-900">
                      {formatINR(product.price * quantity)}
                    </span>

                    {/* Quantity controls */}
                    <div className="flex items-center border border-slate-300 rounded-lg bg-white p-0.5">
                      <button
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        className="p-1 rounded hover:bg-slate-100 text-slate-600"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-bold text-slate-800">
                        {quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        className="p-1 rounded hover:bg-slate-100 text-slate-600 disabled:opacity-30"
                        disabled={quantity >= product.stock}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => removeItem(product.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                  title="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  {t('emptyCartMsg')}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Browse laptops, printers, accessories, or toners to get started.
                </p>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onStartShopping();
                }}
                className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold"
              >
                {t('startShopping')}
              </button>
            </div>
          )}
        </div>

        {/* Footer Summary & Checkout Area */}
        {items.length > 0 && (
          <div className="border-t border-slate-200 p-4 bg-slate-50 space-y-3">
            {/* Coupon Box */}
            {appliedCoupon ? (
              <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs">
                <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                  <Tag className="w-3.5 h-3.5" />
                  <span>Coupon {appliedCoupon.code} applied (-{formatINR(discountAmount)})</span>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-xs text-rose-600 font-bold hover:underline"
                >
                  {t('removeCoupon')}
                </button>
              </div>
            ) : (
              <div>
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="Try VISHVJEET10, FIRST500"
                      className="w-full pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold outline-none focus:border-blue-600"
                    />
                    <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  </div>
                  <button
                    type="submit"
                    className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl transition-colors"
                  >
                    Apply
                  </button>
                </form>
                {couponError && (
                  <p className="text-[11px] text-rose-600 mt-1">{couponError}</p>
                )}
              </div>
            )}

            {/* Price Calculations */}
            <div className="space-y-1.5 text-xs text-slate-600 pt-1">
              <div className="flex justify-between">
                <span>{t('subtotal')}</span>
                <span className="font-semibold text-slate-900">{formatINR(subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>{t('discount')}</span>
                  <span>-{formatINR(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>{t('deliveryCharges')}</span>
                <span className="font-semibold text-slate-900">
                  {shippingFee === 0 ? <span className="text-emerald-700 font-bold">{t('free')}</span> : formatINR(shippingFee)}
                </span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>{t('applicableTaxes')}</span>
                <span>{formatINR(taxAmount)}</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                <span>{t('totalAmount')}</span>
                <span className="text-blue-900">{formatINR(totalAmount)}</span>
              </div>
            </div>

            {/* Primary Proceed CTA */}
            <button
              onClick={() => {
                onClose();
                onProceedToCheckout();
              }}
              className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-98 transition-all"
            >
              <span>{t('proceedToCheckout')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-[10px] text-slate-400 text-center flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Razorpay 256-bit Secure Checkout & Local Store Support</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
