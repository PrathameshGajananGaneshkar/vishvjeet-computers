import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  ShoppingCart, 
  Heart, 
  User, 
  MapPin, 
  Phone, 
  Wrench, 
  Layers, 
  Globe, 
  ShieldCheck, 
  X,
  Menu,
  ChevronDown,
  Smartphone,
  Download,
  Sparkles,
  Zap,
  Crown
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { usePWAInstall } from '../utils/usePWAInstall';
import { ProductCategory, Product } from '../types';

interface HeaderProps {
  onSelectCategory: (category: ProductCategory | 'all' | 'services') => void;
  selectedCategory: string;
  onOpenCart: () => void;
  onOpenAuth: () => void;
  onOpenAccount: () => void;
  onOpenAdmin: () => void;
  onOpenOwner?: () => void;
  onOpenServices: () => void;
  onOpenTrackOrder: () => void;
  onSelectProduct: (product: Product) => void;
  onOpenAndroidAppModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onSelectCategory,
  selectedCategory,
  onOpenCart,
  onOpenAuth,
  onOpenAccount,
  onOpenAdmin,
  onOpenOwner,
  onOpenServices,
  onOpenTrackOrder,
  onSelectProduct,
  onOpenAndroidAppModal,
}) => {
  const { language, setLanguage, t } = useLanguage();
  const { user, isAuthenticated, isAdmin, isOwner, role, logout } = useAuth();
  const { itemCount } = useCart();
  const { products, wishlist, currentPincode, setCurrentPincode, settings } = useStore();
  const { isInstallable, isInstalled, install } = usePWAInstall();

  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [showMoreDropdown, setShowMoreDropdown] = useState(false);
  const [showPincodeModal, setShowPincodeModal] = useState(false);
  const [tempPincode, setTempPincode] = useState(currentPincode);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);

  // Close search suggestions & dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const inDesktopSearch = searchRef.current && searchRef.current.contains(target);
      const inMobileSearch = mobileSearchRef.current && mobileSearchRef.current.contains(target);
      if (!inDesktopSearch && !inMobileSearch) {
        setShowSuggestions(false);
      }
      if (accountRef.current && !accountRef.current.contains(target)) {
        setShowAccountDropdown(false);
      }
      if (moreRef.current && !moreRef.current.contains(target)) {
        setShowMoreDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchResults = searchQuery.trim().length > 1
    ? products.filter(p => {
        const query = searchQuery.toLowerCase();
        return (
          p.title.toLowerCase().includes(query) ||
          (p.titleMr && p.titleMr.toLowerCase().includes(query)) ||
          p.brand.toLowerCase().includes(query) ||
          p.sku.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query)
        );
      }).slice(0, 6)
    : [];

  const handleSelectSearchProduct = (product: Product) => {
    setShowSuggestions(false);
    setSearchQuery('');
    onSelectProduct(product);
  };

  const categories: { id: ProductCategory | 'services' | 'all'; labelKey: keyof typeof import('../utils/translations').translations.en }[] = [
    { id: 'all', labelKey: 'allCategories' },
    { id: 'laptops', labelKey: 'navLaptops' },
    { id: 'computers_desktops', labelKey: 'navComputers' },
    { id: 'printers_scanners', labelKey: 'navPrinters' },
    { id: 'cameras_cctv', labelKey: 'navCameras' },
    { id: 'toner_ink', labelKey: 'navToners' },
    { id: 'computer_accessories', labelKey: 'navCompAcc' },
    { id: 'networking', labelKey: 'navNetworking' },
    { id: 'deals_offers', labelKey: 'navDeals' },
    { id: 'services', labelKey: 'navServices' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#2874f0] shadow-md select-none">
      {/* 1. Flipkart Top Sub-bar (Contact phone, Chikhli location, Language, App CTA - NO GMAIL) */}
      <div className="bg-[#1f5ec4] text-white/90 text-[10px] sm:text-[11px] py-1 px-2.5 sm:px-4 border-b border-blue-400/30">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          {/* Left: Location & Chikhli Store Notice */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="inline-flex items-center gap-1 font-bold text-yellow-300 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
              <span className="truncate">{settings.storeName} • {settings.city}</span>
            </span>
            <span className="hidden md:inline text-blue-300">|</span>
            <span className="hidden md:inline text-white/80 truncate">
              {language === 'mr' ? 'विश्वजीत कॉम्प्युटर - आपले तंत्रज्ञान दालन' : 'Genuine Hardware & Expert IT Services in Buldhana'}
            </span>
          </div>

          {/* Right: Phone, Android App, Language (No Gmail in navbar) */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0 font-medium">
            <a 
              href={`tel:${settings.phone.replace(/\s+/g, '')}`} 
              className="flex items-center gap-1 text-white hover:text-yellow-300 font-bold transition-colors"
              title="Call Chikhli Store"
            >
              <Phone className="w-3 h-3 text-yellow-300 shrink-0" />
              <span className="hidden xs:inline sm:inline">{settings.phone}</span>
              <span className="xs:hidden sm:hidden">Call</span>
            </a>

            {isInstallable && !isInstalled && (
              <button
                onClick={async () => {
                  const res = await install();
                  if (res === 'unavailable' && onOpenAndroidAppModal) {
                    onOpenAndroidAppModal();
                  }
                }}
                className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-[10px] transition-colors shadow-xs cursor-pointer"
              >
                <Download className="w-3 h-3 shrink-0" />
                <span>Install App</span>
              </button>
            )}

            <span className="hidden sm:inline text-blue-300">•</span>

            {/* Language Selector */}
            <div className="flex items-center bg-blue-900/60 rounded px-1.5 py-0.5 border border-blue-400/30">
              <Globe className="w-3 h-3 text-blue-200 mr-1 shrink-0" />
              <button
                onClick={() => setLanguage('en')}
                className={`px-1 py-0.2 rounded text-[10px] font-bold transition-colors ${
                  language === 'en' ? 'bg-white text-[#2874f0]' : 'text-blue-100 hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('mr')}
                className={`px-1 py-0.2 rounded text-[10px] font-bold transition-colors ml-0.5 ${
                  language === 'mr' ? 'bg-white text-[#2874f0]' : 'text-blue-100 hover:text-white'
                }`}
              >
                मराठी
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Flipkart-Style Blue Header */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between gap-2 sm:gap-4 md:gap-6 text-white">
        {/* Left: Mobile hamburger & Flipkart-Style Logo Lockup */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 -ml-1 rounded text-white hover:bg-blue-600 focus:outline-none"
            aria-label="Toggle Menu"
          >
            <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Flipkart Brand Logo: Vishvjeet Explore Plus */}
          <button
            onClick={() => onSelectCategory('all')}
            className="flex flex-col text-left group focus:outline-none cursor-pointer"
          >
            <div className="flex items-center gap-1.5">
              <span className="text-lg sm:text-xl md:text-2xl font-black italic tracking-wide text-white drop-shadow-xs">
                Vishvjeet
              </span>
            </div>
            <div className="flex items-center gap-1 -mt-1 text-[10px] sm:text-[11px] font-medium text-white/90 italic group-hover:underline">
              <span>Explore</span>
              <span className="text-[#ffe500] font-bold">Plus</span>
              <span className="text-[#ffe500] text-xs font-black">✦</span>
            </div>
          </button>
        </div>

        {/* Center: Flipkart White Search Bar (Desktop) */}
        <div ref={searchRef} className="hidden md:block flex-1 max-w-2xl relative">
          <div className="relative flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Search for products, brands and more"
              className="w-full pl-4 pr-11 py-2 bg-white text-slate-900 text-sm rounded-xs border-0 shadow-sm focus:outline-none placeholder:text-slate-400 placeholder:text-xs sm:placeholder:text-sm"
            />
            <button
              onClick={() => {
                if (searchQuery.trim()) {
                  setShowSuggestions(true);
                }
              }}
              className="absolute right-0 top-0 bottom-0 px-3.5 bg-white text-[#2874f0] hover:text-blue-800 transition-colors flex items-center justify-center rounded-r-xs cursor-pointer"
              title="Search"
            >
              <Search className="w-4 h-4 text-[#2874f0]" />
            </button>
          </div>

          {/* Autocomplete Suggestions Box */}
          {showSuggestions && searchQuery.trim().length > 1 && (
            <div className="absolute left-0 right-0 mt-1 bg-white rounded-md shadow-2xl border border-slate-200 overflow-hidden z-50 text-slate-800">
              <div className="p-2 bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider flex justify-between items-center">
                <span>Matching Products ({searchResults.length})</span>
                <button onClick={() => setShowSuggestions(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              {searchResults.length > 0 ? (
                <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                  {searchResults.map((prod) => (
                    <div
                      key={prod.id}
                      onClick={() => handleSelectSearchProduct(prod)}
                      className="p-2.5 flex items-center gap-3 hover:bg-blue-50/70 cursor-pointer transition-colors"
                    >
                      <img
                        src={prod.images[0]}
                        alt={prod.title}
                        className="w-10 h-10 object-contain rounded bg-white p-0.5 border border-slate-200 shrink-0"
                      />
                      <div className="flex-1 min-w-0 text-left">
                        <div className="text-xs font-semibold text-slate-900 truncate">
                          {language === 'mr' && prod.titleMr ? prod.titleMr : prod.title}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px]">
                          <span className="font-bold text-[#2874f0]">₹{prod.price.toLocaleString('en-IN')}</span>
                          <span className="line-through text-slate-400 text-[10px]">₹{prod.mrp.toLocaleString('en-IN')}</span>
                          <span className="px-1 py-0.2 rounded text-[9px] bg-slate-100 font-bold text-slate-600">{prod.brand}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-xs text-slate-500">
                  No matching products found for "{searchQuery}".
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Section: Flipkart White Login Button, Chikhli Store, More, Cart */}
        <div className="flex items-center gap-2.5 sm:gap-5 shrink-0 text-white">
          {/* Flipkart Iconic White "Login" Button */}
          <div ref={accountRef} className="relative">
            {!isAuthenticated ? (
              <button
                onClick={onOpenAuth}
                className="bg-white text-[#2874f0] hover:bg-slate-50 font-bold px-3.5 sm:px-8 py-1.5 text-xs sm:text-sm rounded-xs shadow-xs transition-colors cursor-pointer border border-white"
              >
                Login
              </button>
            ) : (
              <button
                onClick={() => setShowAccountDropdown(!showAccountDropdown)}
                className="flex items-center gap-1 font-semibold text-xs sm:text-sm hover:text-yellow-300 py-1.5 transition-colors cursor-pointer"
              >
                <User className="w-4 h-4 text-yellow-300" />
                <span className="max-w-[90px] truncate">{user?.name.split(' ')[0]}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-80" />
              </button>
            )}

            {/* User Dropdown */}
            {showAccountDropdown && isAuthenticated && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xs shadow-2xl border border-slate-200 py-1 z-50 text-slate-800 animate-in fade-in">
                <div className="px-4 py-2 border-b border-slate-100 bg-slate-50">
                  <div className="text-xs font-bold text-slate-900">{user?.name}</div>
                  <div className="text-[11px] text-slate-500 truncate">{user?.email}</div>
                  {isAdmin && (
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-900 border border-purple-200">
                      ⚡ Super Admin (All Control)
                    </span>
                  )}
                  {isOwner && (
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                      👑 Store Owner (Image, Price & Payment)
                    </span>
                  )}
                  {role === 'customer' && (
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-900">
                      👤 Customer / User
                    </span>
                  )}
                </div>

                <button
                  onClick={() => {
                    setShowAccountDropdown(false);
                    onOpenAccount();
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-blue-50 hover:text-[#2874f0] flex items-center gap-2"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>My Profile & Orders</span>
                </button>

                <button
                  onClick={() => {
                    setShowAccountDropdown(false);
                    onOpenTrackOrder();
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-blue-50 hover:text-[#2874f0] flex items-center gap-2"
                >
                  <Layers className="w-4 h-4 text-slate-400" />
                  <span>Track Orders & Refunds</span>
                </button>

                <button
                  onClick={() => {
                    setShowAccountDropdown(false);
                    onOpenAccount();
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-blue-50 hover:text-[#2874f0] flex items-center gap-2"
                >
                  <Heart className="w-4 h-4 text-slate-400" />
                  <span>Wishlist ({wishlist.length})</span>
                </button>

                {(isOwner || isAdmin) && onOpenOwner && (
                  <button
                    onClick={() => {
                      setShowAccountDropdown(false);
                      onOpenOwner();
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-amber-800 font-bold hover:bg-amber-50 flex items-center gap-2"
                  >
                    <Crown className="w-4 h-4 text-amber-600" />
                    <span>Owner Control (Images, Price & Payment)</span>
                  </button>
                )}

                {isAdmin && (
                  <button
                    onClick={() => {
                      setShowAccountDropdown(false);
                      onOpenAdmin();
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-purple-800 font-bold hover:bg-purple-50 flex items-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4 text-purple-600" />
                    <span>Admin Master Console (All Control)</span>
                  </button>
                )}

                <div className="border-t border-slate-100 my-1"></div>

                <button
                  onClick={() => {
                    setShowAccountDropdown(false);
                    logout();
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 font-bold"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>

          {/* Become a Seller / Store Phone */}
          <a
            href={`tel:${settings.phone.replace(/\s+/g, '')}`}
            className="hidden lg:flex items-center gap-1 font-semibold text-xs sm:text-sm hover:text-yellow-300 transition-colors"
            title="Call Vishvjeet Computer Chikhli"
          >
            <span>Chikhli Store</span>
          </a>

          {/* More Dropdown (Flipkart style) */}
          <div ref={moreRef} className="relative hidden md:block">
            <button
              onClick={() => setShowMoreDropdown(!showMoreDropdown)}
              className="flex items-center gap-1 font-semibold text-xs sm:text-sm hover:text-yellow-300 py-1 transition-colors cursor-pointer"
            >
              <span>More</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-80" />
            </button>

            {showMoreDropdown && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-xs shadow-2xl border border-slate-200 py-1 z-50 text-slate-800 animate-in fade-in">
                <button
                  onClick={() => {
                    setShowMoreDropdown(false);
                    onOpenServices();
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:bg-blue-50 hover:text-[#2874f0] flex items-center gap-2.5"
                >
                  <Wrench className="w-4 h-4 text-amber-500" />
                  <div>
                    <div className="font-bold">Book Repair Service</div>
                    <div className="text-[10px] text-slate-400">Laptop, PC & Printer repair</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setShowMoreDropdown(false);
                    if (onOpenAndroidAppModal) onOpenAndroidAppModal();
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:bg-blue-50 hover:text-[#2874f0] flex items-center gap-2.5"
                >
                  <Smartphone className="w-4 h-4 text-[#2874f0]" />
                  <div>
                    <div className="font-bold text-[#2874f0]">Play Store Android App</div>
                    <div className="text-[10px] text-slate-400">APK, TWA & Play Store files</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setShowMoreDropdown(false);
                    onOpenTrackOrder();
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-blue-50 hover:text-[#2874f0] flex items-center gap-2.5"
                >
                  <Layers className="w-4 h-4 text-slate-400" />
                  <span>24x7 Customer Care</span>
                </button>

                <button
                  onClick={() => {
                    setShowMoreDropdown(false);
                    setShowPincodeModal(true);
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-blue-50 hover:text-[#2874f0] flex items-center gap-2.5"
                >
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span>Delivery PIN: {currentPincode}</span>
                </button>
              </div>
            )}
          </div>

          {/* Flipkart Cart Button with Icon and Badge */}
          <button
            onClick={onOpenCart}
            className="flex items-center gap-1.5 font-bold text-xs sm:text-sm hover:text-yellow-300 py-1 transition-colors cursor-pointer"
            title="Cart"
          >
            <div className="relative">
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-yellow-400 text-slate-950 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </div>
            <span className="hidden sm:inline">Cart</span>
          </button>
        </div>
      </div>

      {/* Mobile Full-Width Search Row (Flipkart Android App style) */}
      <div ref={mobileSearchRef} className="md:hidden px-3 pb-2.5 relative">
        <div className="relative flex items-center">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            placeholder={language === 'mr' ? 'लॅपटॉप, प्रिंटर, सीसीटीव्ही शोधा...' : 'Search laptops, printers, CCTV & more'}
            className="w-full pl-3.5 pr-10 py-2 bg-white text-slate-900 text-xs rounded-sm border-0 shadow-sm focus:outline-none placeholder:text-slate-400"
          />
          <button
            type="button"
            onClick={() => {
              if (searchQuery.trim()) setShowSuggestions(true);
            }}
            className="absolute right-0 top-0 bottom-0 px-3 bg-white text-[#2874f0] flex items-center justify-center rounded-r-sm cursor-pointer"
            title="Search"
          >
            <Search className="w-4 h-4 text-[#2874f0]" />
          </button>
        </div>

        {showSuggestions && searchQuery.trim().length > 1 && (
          <div className="absolute left-3 right-3 mt-1 bg-white rounded-md shadow-2xl border border-slate-200 overflow-hidden z-50 text-slate-800">
            <div className="p-2 bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider flex justify-between items-center">
              <span>Matching Products ({searchResults.length})</span>
              <button onClick={() => setShowSuggestions(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            {searchResults.length > 0 ? (
              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                {searchResults.map((prod) => (
                  <div
                    key={prod.id}
                    onClick={() => handleSelectSearchProduct(prod)}
                    className="p-2.5 flex items-center gap-3 hover:bg-blue-50/70 cursor-pointer transition-colors"
                  >
                    <img
                      src={prod.images[0]}
                      alt={prod.title}
                      className="w-10 h-10 object-contain rounded bg-white p-0.5 border border-slate-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0 text-left">
                      <div className="text-xs font-semibold text-slate-900 truncate">
                        {language === 'mr' && prod.titleMr ? prod.titleMr : prod.title}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px]">
                        <span className="font-bold text-[#2874f0]">₹{prod.price.toLocaleString('en-IN')}</span>
                        <span className="line-through text-slate-400 text-[10px]">₹{prod.mrp.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-slate-500">
                No matching products found for "{searchQuery}".
              </div>
            )}
          </div>
        )}
      </div>

      {/* PIN Code Modal */}
      {showPincodeModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2 text-blue-900 font-bold">
                <MapPin className="w-5 h-5 text-amber-500" />
                <span>Choose Delivery Location</span>
              </div>
              <button onClick={() => setShowPincodeModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Enter your 6-digit postal PIN code to check shipping speed and product availability.
            </p>

            <div className="space-y-3">
              <input
                type="text"
                maxLength={6}
                value={tempPincode}
                onChange={(e) => setTempPincode(e.target.value.replace(/\D/g, ''))}
                placeholder="e.g. 443201"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold tracking-widest text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setTempPincode('443201')}
                  className="px-2.5 py-1 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium"
                >
                  Chikhli (443201)
                </button>
                <button
                  type="button"
                  onClick={() => setTempPincode('443001')}
                  className="px-2.5 py-1 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium"
                >
                  Buldhana (443001)
                </button>
              </div>

              <button
                onClick={() => {
                  if (tempPincode.length === 6) {
                    setCurrentPincode(tempPincode);
                    setShowPincodeModal(false);
                  }
                }}
                className="w-full py-2.5 bg-[#2874f0] hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Set Delivery Location
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu Drawer (No Gmail in navbar!) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex md:hidden">
          <div className="w-4/5 max-w-xs bg-white h-full shadow-2xl flex flex-col p-4 overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div className="font-black text-[#2874f0] text-xl italic">
                Vishvjeet <span className="text-yellow-500 font-bold">Plus ✦</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Play Store App Banner in Mobile Menu */}
            <div className="my-3 p-3 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-center gap-2 font-bold text-[#2874f0] text-xs">
                <Smartphone className="w-4 h-4" />
                <span>Google Play Store App</span>
              </div>
              <p className="text-[11px] text-slate-600 mt-1">
                Install as Android App on your smartphone for faster shopping.
              </p>
              <button
                onClick={async () => {
                  setMobileMenuOpen(false);
                  const outcome = await install();
                  if (outcome === 'unavailable' && onOpenAndroidAppModal) {
                    onOpenAndroidAppModal();
                  }
                }}
                className="mt-2 w-full py-1.5 bg-[#2874f0] hover:bg-blue-600 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isInstallable ? 'Install App on Phone Now' : 'Get Android APK / App'}</span>
              </button>
            </div>

            <div className="py-2 space-y-1">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Categories
              </div>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (c.id === 'services') onOpenServices();
                    else onSelectCategory(c.id);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold ${
                    selectedCategory === c.id ? 'bg-blue-50 text-[#2874f0]' : 'text-slate-700'
                  }`}
                >
                  {t(c.labelKey)}
                </button>
              ))}
            </div>

            {/* Store Contact: Phone ONLY (Gmail removed from navbar as requested!) */}
            <div className="pt-4 border-t border-slate-100 space-y-2 mt-auto">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs">
                <div className="font-bold text-[11px] uppercase text-slate-500">
                  Chikhli Store Contact:
                </div>
                <div className="flex items-center gap-1.5 text-blue-900 font-bold">
                  <Phone className="w-3.5 h-3.5 text-[#2874f0]" />
                  <a href={`tel:${settings.phone.replace(/\s+/g, '')}`}>{settings.phone}</a>
                </div>
                <div className="text-[11px] text-slate-500">
                  Shop No. 4, Shivaji Complex, Chikhli
                </div>
              </div>

              {(isOwner || isAdmin) && onOpenOwner && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenOwner();
                  }}
                  className="w-full py-2 text-center text-xs font-bold text-amber-900 bg-amber-100 border border-amber-200 rounded-xl flex items-center justify-center gap-1.5"
                >
                  <Crown className="w-3.5 h-3.5 text-amber-700" />
                  <span>Owner Control (Images, Price & Payment)</span>
                </button>
              )}

              {isAdmin && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAdmin();
                  }}
                  className="w-full py-2 text-center text-xs font-bold text-purple-900 bg-purple-100 border border-purple-200 rounded-xl flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-700" />
                  <span>Admin Master Console (All Control)</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
