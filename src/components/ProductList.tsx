import React, { useState, useMemo, useEffect } from 'react';
import { 
  Filter, 
  X, 
  LayoutGrid, 
  List, 
  Check, 
  Star, 
  SlidersHorizontal,
  Clock,
  Zap,
  ArrowRight
} from 'lucide-react';
import { Product, ProductCategory } from '../types';
import { ProductCard } from './ProductCard';
import { useLanguage } from '../context/LanguageContext';
import { formatINR } from '../utils/formatters';

interface ProductListProps {
  products: Product[];
  currentCategory: ProductCategory | 'all' | 'deals_offers';
  onSelectProduct: (product: Product) => void;
  onQuickBuy: (product: Product) => void;
  onViewAllDeals?: () => void;
}

export const ProductList: React.FC<ProductListProps> = ({
  products,
  currentCategory,
  onSelectProduct,
  onQuickBuy,
  onViewAllDeals,
}) => {
  const { t, language } = useLanguage();

  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(120000);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'featured' | 'price_low' | 'price_high' | 'rating' | 'newest'>('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Flipkart Deal Countdown Timer
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 22, seconds: 35 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Available brands in the current products set
  const availableBrands = useMemo(() => {
    const brands = new Set<string>();
    products.forEach(p => brands.add(p.brand));
    return Array.from(brands).sort();
  }, [products]);

  // Featured Deals of the Day (Flipkart Shelf)
  const dealProducts = useMemo(() => {
    return products.filter(p => p.isDealOfDay || p.isFeatured).slice(0, 6);
  }, [products]);

  // Filtered & sorted products
  const filteredProducts = useMemo(() => {
    return products
      .filter(p => {
        // Category filter
        if (currentCategory !== 'all' && currentCategory !== 'deals_offers') {
          if (p.category !== currentCategory) return false;
        } else if (currentCategory === 'deals_offers') {
          if (!p.isDealOfDay && !p.isFeatured) return false;
        }

        // Brand filter
        if (selectedBrands.length > 0 && !selectedBrands.includes(p.brand)) {
          return false;
        }

        // Price filter
        if (p.price > maxPrice) return false;

        // In-stock filter
        if (inStockOnly && p.stock <= 0) return false;

        // Rating filter
        if (minRating > 0 && p.rating < minRating) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price_low') return a.price - b.price;
        if (sortBy === 'price_high') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'newest') return b.id.localeCompare(a.id);
        return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
      });
  }, [products, currentCategory, selectedBrands, maxPrice, inStockOnly, minRating, sortBy]);

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev =>
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  const handleClearFilters = () => {
    setSelectedBrands([]);
    setMaxPrice(120000);
    setInStockOnly(false);
    setMinRating(0);
    setSortBy('featured');
  };

  const hasActiveFilters =
    selectedBrands.length > 0 ||
    maxPrice < 120000 ||
    inStockOnly ||
    minRating > 0;

  // Filter Sidebar Content (Reused for desktop & mobile drawer)
  const FilterSidebar = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
          <SlidersHorizontal className="w-4 h-4 text-[#2874f0]" />
          <span>{t('filters')}</span>
        </div>
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700"
          >
            {t('clearAll')}
          </button>
        )}
      </div>

      {/* Brand Filter */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5">
          {t('brandFilter')}
        </h4>
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {availableBrands.map((brand) => (
            <label
              key={brand}
              className="flex items-center gap-2 text-xs text-slate-700 hover:text-[#2874f0] cursor-pointer py-0.5"
            >
              <input
                type="checkbox"
                checked={selectedBrands.includes(brand)}
                onChange={() => toggleBrand(brand)}
                className="w-3.5 h-3.5 rounded text-[#2874f0] border-slate-300 focus:ring-blue-500"
              />
              <span>{brand}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range Slider */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            {t('priceRange')}
          </h4>
          <span className="text-xs font-extrabold text-[#2874f0]">
            Up to {formatINR(maxPrice)}
          </span>
        </div>
        <input
          type="range"
          min="500"
          max="120000"
          step="500"
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-[#2874f0] h-1.5 bg-slate-200 rounded-lg cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
          <span>₹500</span>
          <span>₹1,20,000+</span>
        </div>
      </div>

      {/* Stock Availability */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
          {t('availability')}
        </h4>
        <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
            className="w-3.5 h-3.5 rounded text-[#2874f0] border-slate-300 focus:ring-blue-500"
          />
          <span>{t('inStockOnly')}</span>
        </label>
      </div>

      {/* Customer Rating Filter */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
          Customer Rating
        </h4>
        <div className="space-y-1.5">
          {[4, 3].map((stars) => (
            <label
              key={stars}
              className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer"
            >
              <input
                type="radio"
                name="rating_filter"
                checked={minRating === stars}
                onChange={() => setMinRating(minRating === stars ? 0 : stars)}
                className="w-3.5 h-3.5 text-[#2874f0] border-slate-300 focus:ring-blue-500"
              />
              <span className="flex items-center gap-1 font-medium">
                {stars}★ & above
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 space-y-6">
      {/* 1. Flipkart Signature Shelf: "Best of Electronics & Computers - Deals of the Day" */}
      {currentCategory === 'all' && (
        <div className="bg-white rounded-xs border border-slate-200 shadow-xs overflow-hidden">
          {/* Header Row */}
          <div className="px-4 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                {language === 'mr' ? 'आजच्या सर्वोत्तम ऑफर्स (Best of Electronics)' : 'Best of Electronics & Hardware Deals'}
              </h2>
              {/* Flipkart style countdown clock */}
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium bg-slate-100 px-2.5 py-1 rounded-xs">
                <Clock className="w-3.5 h-3.5 text-[#2874f0]" />
                <span className="font-mono font-bold text-slate-800">
                  {String(timeLeft.hours).padStart(2, '0')}h : {String(timeLeft.minutes).padStart(2, '0')}m : {String(timeLeft.seconds).padStart(2, '0')}s Left
                </span>
              </div>
            </div>

            <button
              onClick={onViewAllDeals}
              className="px-4 py-1.5 bg-[#2874f0] hover:bg-blue-600 text-white rounded-xs text-xs font-bold shadow-xs transition-colors flex items-center gap-1"
            >
              <span>VIEW ALL</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Horizontal Product Shelf */}
          <div className="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 overflow-x-auto">
            {dealProducts.map((prod) => (
              <div 
                key={prod.id}
                onClick={() => onSelectProduct(prod)}
                className="group flex flex-col text-center items-center p-2 rounded hover:shadow-md transition-shadow cursor-pointer bg-white border border-slate-100"
              >
                <div className="w-28 h-28 sm:w-32 sm:h-32 p-2 flex items-center justify-center mb-2">
                  <img
                    src={prod.images[0]}
                    alt={prod.title}
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                    loading="lazy"
                  />
                </div>
                <div className="text-xs font-semibold text-slate-900 line-clamp-1 group-hover:text-[#2874f0]">
                  {language === 'mr' && prod.titleMr ? prod.titleMr : prod.title}
                </div>
                <div className="text-[11px] font-bold text-[#388e3c] mt-0.5">
                  ₹{prod.price.toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-slate-400">
                  {prod.brand} • Up to 25% Off
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Top Filter Bar & Sorting */}
      <div className="bg-white rounded-xs border border-slate-200 p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xs"
          >
            <Filter className="w-3.5 h-3.5 text-[#2874f0]" />
            <span>{t('filters')}</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-[#2874f0]"></span>
            )}
          </button>

          <span className="text-xs sm:text-sm font-semibold text-slate-700">
            {t('showingProducts')}{' '}
            <strong className="text-slate-900 font-extrabold">{filteredProducts.length}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 ml-auto">
          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-medium hidden sm:inline">{t('sortBy')}:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-xs px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#2874f0]"
            >
              <option value="featured">{t('sortFeatured')}</option>
              <option value="price_low">{t('sortPriceLow')}</option>
              <option value="price_high">{t('sortPriceHigh')}</option>
              <option value="rating">{t('sortRating')}</option>
              <option value="newest">{t('sortNewest')}</option>
            </select>
          </div>

          {/* View mode toggle */}
          <div className="hidden sm:flex items-center border border-slate-200 rounded-xs p-0.5 bg-slate-50">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-xs transition-colors ${
                viewMode === 'grid' ? 'bg-white shadow-xs text-[#2874f0]' : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-xs transition-colors ${
                viewMode === 'list' ? 'bg-white shadow-xs text-[#2874f0]' : 'text-slate-400 hover:text-slate-700'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Main Grid with Flipkart Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 items-start">
        {/* Desktop Filter Sidebar */}
        <aside className="hidden lg:block lg:col-span-1 bg-white p-4 rounded-xs border border-slate-200 shadow-xs sticky top-28">
          <FilterSidebar />
        </aside>

        {/* Product Cards Container */}
        <main className="lg:col-span-3">
          {filteredProducts.length > 0 ? (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4'
                  : 'space-y-3'
              }
            >
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelect={onSelectProduct}
                  onQuickBuy={onQuickBuy}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xs border border-slate-200 p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-400">
                <Filter className="w-8 h-8" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 mb-1">
                {t('noProductsFound')}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
                Try widening your price range or clearing brand filters.
              </p>
              <button
                onClick={handleClearFilters}
                className="px-5 py-2.5 bg-[#2874f0] hover:bg-blue-600 text-white rounded-xs text-xs font-bold transition-colors"
              >
                {t('clearAll')}
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filter Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex lg:hidden">
          <div className="w-4/5 max-w-sm bg-white h-full shadow-2xl flex flex-col p-5 overflow-y-auto ml-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 mb-4">
              <span className="font-extrabold text-slate-900 text-sm">
                Filter Products
              </span>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <FilterSidebar />

            <div className="pt-6 border-t border-slate-200 mt-6">
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-full py-3 bg-[#2874f0] text-white rounded-xs text-xs font-bold"
              >
                Apply Filters ({filteredProducts.length} Results)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
