import React, { useState } from 'react';
import { 
  X, 
  Star, 
  Heart, 
  ShoppingCart, 
  Zap, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  MapPin, 
  MessageCircle, 
  Phone, 
  Check, 
  Plus, 
  Minus,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Product } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { formatINR, calculateDiscountPercent, checkPincodeDelivery } from '../utils/formatters';

interface ProductDetailsModalProps {
  product: Product;
  onClose: () => void;
  onQuickBuy: (product: Product) => void;
  onSelectRelatedProduct: (product: Product) => void;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  product,
  onClose,
  onQuickBuy,
  onSelectRelatedProduct,
}) => {
  const { language, t } = useLanguage();
  const { addItem, items } = useCart();
  const { 
    currentPincode, 
    setCurrentPincode, 
    toggleWishlist, 
    isInWishlist, 
    reviews, 
    addReview, 
    settings,
    products 
  } = useStore();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [pincodeInput, setPincodeInput] = useState(currentPincode);
  const [pincodeInfo, setPincodeInfo] = useState(() => checkPincodeDelivery(currentPincode));

  // Review submission form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [revRating, setRevRating] = useState(5);
  const [revName, setRevName] = useState('');
  const [revComment, setRevComment] = useState('');

  const discountPercent = calculateDiscountPercent(product.mrp, product.price);
  const inCart = items.some(item => item.product.id === product.id);
  const wishlisted = isInWishlist(product.id);

  // Filter reviews for this product
  const productReviews = reviews.filter(r => r.productId === product.id);

  // Compatible accessories
  const compatibleItems = (product.compatibleWith || [])
    .map(id => products.find(p => p.id === id))
    .filter((p): p is Product => !!p);

  const handlePincodeCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (pincodeInput.length === 6) {
      setCurrentPincode(pincodeInput);
      setPincodeInfo(checkPincodeDelivery(pincodeInput));
    }
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!revName.trim() || !revComment.trim()) return;

    addReview({
      productId: product.id,
      customerName: revName,
      customerLocation: 'Chikhli, Maharashtra',
      rating: revRating,
      title: 'Customer Feedback',
      comment: revComment,
      verifiedPurchase: true,
    });

    setRevName('');
    setRevComment('');
    setShowReviewForm(false);
  };

  const whatsappMessage = encodeURIComponent(
    `Hello Vishvjeet Computer Chikhli, I am interested in: ${product.title} (SKU: ${product.sku}, Price: ₹${product.price}). Is this currently available in the shop?`
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="relative bg-white rounded-3xl max-w-5xl w-full my-6 shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Sticky Modal Header */}
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-100/60 px-2.5 py-0.5 rounded-lg">
              {product.brand}
            </span>
            <span className="text-xs font-mono text-slate-400">
              {t('skuLabel')}: {product.sku}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Left Image Gallery (5 cols) */}
            <div className="md:col-span-5 space-y-4">
              <div className="relative aspect-square rounded-2xl bg-slate-50 border border-slate-200 p-4 flex items-center justify-center overflow-hidden">
                {discountPercent > 0 && (
                  <span className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-xs font-extrabold uppercase shadow-sm">
                    {discountPercent}% {t('off')}
                  </span>
                )}
                <img
                  src={product.images[selectedImageIndex] || product.images[0]}
                  alt={product.title}
                  className="max-h-full max-w-full object-contain mix-blend-multiply"
                />
              </div>

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="flex gap-2.5 overflow-x-auto pb-1">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`w-16 h-16 rounded-xl border-2 p-1 bg-slate-50 shrink-0 transition-all ${
                        selectedImageIndex === idx
                          ? 'border-blue-600 ring-2 ring-blue-100'
                          : 'border-slate-200 hover:border-slate-400'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-contain" />
                    </button>
                  ))}
                </div>
              )}

              {/* Action Buttons: WhatsApp & Call */}
              <div className="pt-2 grid grid-cols-2 gap-2">
                <a
                  href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{t('whatsappInquiry')}</span>
                </a>

                <a
                  href={`tel:${settings.phone.replace(/\s+/g, '')}`}
                  className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                >
                  <Phone className="w-4 h-4 text-blue-400" />
                  <span>{t('callForAssistance')}</span>
                </a>
              </div>
            </div>

            {/* Right Details (7 cols) */}
            <div className="md:col-span-7 space-y-5">
              <div>
                <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug">
                  {language === 'mr' && product.titleMr ? product.titleMr : product.title}
                </h1>

                {/* Rating & Review Counter */}
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-1 bg-emerald-700 text-white px-2 py-0.5 rounded-lg text-xs font-bold">
                    <span>{product.rating}</span>
                    <Star className="w-3.5 h-3.5 fill-white" />
                  </div>
                  <span className="text-xs text-slate-500 font-medium">
                    {product.reviewCount} {language === 'mr' ? 'ग्राहकांचे अभिप्राय' : 'Verified Reviews'}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs text-blue-700 font-semibold">100% Genuine</span>
                </div>
              </div>

              {/* Pricing & Savings */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                    {formatINR(product.price)}
                  </span>
                  {product.mrp > product.price && (
                    <span className="text-base text-slate-400 line-through">
                      {formatINR(product.mrp)}
                    </span>
                  )}
                  {discountPercent > 0 && (
                    <span className="text-sm font-extrabold text-emerald-600">
                      Save {formatINR(product.mrp - product.price)} ({discountPercent}% OFF)
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                  <span>{t('inclusiveTaxes')}</span>
                  <span>•</span>
                  <span className="text-blue-700 font-semibold">{t('freeDelivery')}</span>
                </div>
              </div>

              {/* Stock Status & Quantity Controls */}
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-slate-300 rounded-xl bg-white p-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 disabled:opacity-30"
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-9 text-center font-bold text-xs text-slate-800">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 disabled:opacity-30"
                    disabled={quantity >= product.stock}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-xs">
                  {product.stock > 0 ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      {t('inStock')} ({product.stock} units available at Chikhli warehouse)
                    </span>
                  ) : (
                    <span className="text-rose-600 font-bold">{t('outOfStock')}</span>
                  )}
                </div>
              </div>

              {/* Add to Cart / Buy Now CTAs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => addItem(product, quantity)}
                  disabled={product.stock <= 0}
                  className={`py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                    inCart
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-blue-700 hover:bg-blue-800 text-white shadow-md shadow-blue-700/20 active:scale-98'
                  } disabled:opacity-50`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>{inCart ? t('addedToCart') : t('addToCart')}</span>
                </button>

                <button
                  onClick={() => {
                    addItem(product, quantity);
                    onQuickBuy(product);
                  }}
                  disabled={product.stock <= 0}
                  className="py-3.5 px-4 bg-amber-500 hover:bg-amber-600 active:scale-98 text-slate-950 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 disabled:opacity-50"
                >
                  <Zap className="w-4 h-4 fill-current" />
                  <span>{t('buyNow')}</span>
                </button>
              </div>

              {/* Delivery Pincode Checker */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <MapPin className="w-4 h-4 text-amber-500" />
                  <span>{t('deliveryCheck')}</span>
                </div>

                <form onSubmit={handlePincodeCheck} className="flex gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    value={pincodeInput}
                    onChange={(e) => setPincodeInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 6-digit PIN"
                    className="w-36 px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-800 outline-none focus:border-blue-600"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl transition-colors"
                  >
                    Check
                  </button>
                </form>

                {pincodeInfo.deliverable ? (
                  <div className="text-[11px] text-slate-600 space-y-0.5 pt-1">
                    <div className="font-bold text-emerald-700 flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5" />
                      <span>Delivery Available to {pincodeInfo.city}!</span>
                    </div>
                    <div className="text-slate-500">
                      Estimated Delivery: <strong>{pincodeInfo.estimatedDays}</strong>
                    </div>
                  </div>
                ) : (
                  <div className="text-[11px] text-rose-600">
                    {pincodeInfo.estimatedDays}
                  </div>
                )}
              </div>

              {/* Trust Badges Bar */}
              <div className="grid grid-cols-3 gap-2 text-center pt-2">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <ShieldCheck className="w-4 h-4 text-blue-700 mx-auto mb-1" />
                  <div className="text-[10px] font-bold text-slate-800">Brand Warranty</div>
                  <div className="text-[9px] text-slate-500">100% Genuine</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <RotateCcw className="w-4 h-4 text-blue-700 mx-auto mb-1" />
                  <div className="text-[10px] font-bold text-slate-800">7 Days Return</div>
                  <div className="text-[9px] text-slate-500">Hardware defect</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <Truck className="w-4 h-4 text-blue-700 mx-auto mb-1" />
                  <div className="text-[10px] font-bold text-slate-800">Chikhli Store</div>
                  <div className="text-[9px] text-slate-500">Walk-in Support</div>
                </div>
              </div>
            </div>
          </div>

          {/* Key Features & Description */}
          <div className="pt-4 border-t border-slate-200 space-y-4">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900">
              {t('keyFeatures')}
            </h3>
            <ul className="grid sm:grid-cols-2 gap-2 text-xs text-slate-700">
              {product.keyFeatures.map((feat, idx) => (
                <li key={idx} className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Specifications Table */}
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900">
              {t('specifications')}
            </h3>
            <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 text-xs">
              {Object.entries(product.specifications).map(([specKey, specVal]) => (
                <div key={specKey} className="grid grid-cols-12 p-3 bg-white hover:bg-slate-50">
                  <div className="col-span-4 font-semibold text-slate-500">{specKey}</div>
                  <div className="col-span-8 font-bold text-slate-800">{specVal}</div>
                </div>
              ))}
              <div className="grid grid-cols-12 p-3 bg-white">
                <div className="col-span-4 font-semibold text-slate-500">{t('warrantyDetails')}</div>
                <div className="col-span-8 font-bold text-slate-800">{product.warranty}</div>
              </div>
              <div className="grid grid-cols-12 p-3 bg-white">
                <div className="col-span-4 font-semibold text-slate-500">{t('returnDetails')}</div>
                <div className="col-span-8 font-bold text-slate-800">{product.returnPolicy}</div>
              </div>
            </div>
          </div>

          {/* Verified Compatible Accessories Section */}
          {compatibleItems.length > 0 && (
            <div className="p-5 bg-blue-50/60 rounded-2xl border border-blue-200 space-y-3">
              <div className="flex items-center gap-2 text-blue-900 font-extrabold text-sm">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>{t('compatibleAccessories')}</span>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {compatibleItems.map((acc) => (
                  <div
                    key={acc.id}
                    onClick={() => onSelectRelatedProduct(acc)}
                    className="p-3 bg-white rounded-xl border border-blue-100 flex items-center justify-between gap-3 hover:shadow-md cursor-pointer transition-shadow"
                  >
                    <img src={acc.images[0]} alt="" className="w-12 h-12 object-contain rounded-lg" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate">{acc.title}</div>
                      <div className="text-xs font-extrabold text-blue-700">{formatINR(acc.price)}</div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addItem(acc, 1);
                      }}
                      className="px-2.5 py-1.5 bg-blue-700 text-white text-[11px] font-bold rounded-lg hover:bg-blue-800"
                    >
                      Add
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Customer Reviews Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900">
                {t('customerReviews')} ({productReviews.length})
              </h3>
              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="text-xs font-bold text-blue-700 hover:text-blue-800"
              >
                {showReviewForm ? 'Cancel' : t('writeReview')}
              </button>
            </div>

            {/* Write Review Form */}
            {showReviewForm && (
              <form onSubmit={handleAddReview} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700">Your Rating:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRevRating(star)}
                        className="text-amber-400 hover:scale-110 transition-transform"
                      >
                        <Star className={`w-5 h-5 ${star <= revRating ? 'fill-amber-400' : 'text-slate-300'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <input
                  type="text"
                  required
                  value={revName}
                  onChange={(e) => setRevName(e.target.value)}
                  placeholder="Your Full Name (e.g. Ramesh Patil, Chikhli)"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white outline-none focus:border-blue-600"
                />

                <textarea
                  required
                  rows={3}
                  value={revComment}
                  onChange={(e) => setRevComment(e.target.value)}
                  placeholder="Share your experience with this computer or accessory..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white outline-none focus:border-blue-600"
                />

                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold"
                >
                  Submit Verified Review
                </button>
              </form>
            )}

            {/* Reviews List */}
            {productReviews.length > 0 ? (
              <div className="space-y-3">
                {productReviews.map((rev) => (
                  <div key={rev.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{rev.customerName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">({rev.customerLocation})</span>
                        {rev.verifiedPurchase && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                            Verified Purchase
                          </span>
                        )}
                      </div>
                      <div className="flex items-center text-amber-500">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
                    <div className="text-[10px] text-slate-400">{rev.date}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">
                No customer reviews yet. Be the first to share your experience with Vishvjeet Computer!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
