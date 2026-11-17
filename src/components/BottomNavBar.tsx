import React from 'react';
import { Home, Grid, Wrench, ShoppingCart, User, Smartphone, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { ProductCategory } from '../types';

interface BottomNavBarProps {
  activeCategory: string;
  onSelectCategory: (cat: ProductCategory | 'all' | 'services') => void;
  onOpenCart: () => void;
  onOpenAccount: () => void;
  onOpenServices: () => void;
  onOpenAndroidModal: () => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeCategory,
  onSelectCategory,
  onOpenCart,
  onOpenAccount,
  onOpenServices,
  onOpenAndroidModal,
}) => {
  const { itemCount } = useCart();
  const { language } = useLanguage();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-lg md:hidden flex items-center justify-around py-2 px-1 text-[11px] font-semibold text-slate-600">
      {/* 1. Home */}
      <button
        onClick={() => {
          onSelectCategory('all');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        className={`flex flex-col items-center gap-0.5 p-1 transition-colors ${
          activeCategory === 'all' ? 'text-[#2874f0]' : 'hover:text-[#2874f0]'
        }`}
      >
        <Home className="w-5 h-5" />
        <span>{language === 'mr' ? 'होम' : 'Home'}</span>
      </button>

      {/* 2. Categories */}
      <button
        onClick={() => {
          const catElem = document.getElementById('category-bar');
          if (catElem) {
            catElem.scrollIntoView({ behavior: 'smooth' });
          } else {
            onSelectCategory('all');
          }
        }}
        className={`flex flex-col items-center gap-0.5 p-1 transition-colors ${
          activeCategory !== 'all' && activeCategory !== 'services' ? 'text-[#2874f0]' : 'hover:text-[#2874f0]'
        }`}
      >
        <Grid className="w-5 h-5" />
        <span>{language === 'mr' ? 'कॅटेगरीज' : 'Categories'}</span>
      </button>

      {/* 3. Services / Repair */}
      <button
        onClick={onOpenServices}
        className="flex flex-col items-center gap-0.5 p-1 text-slate-600 hover:text-amber-600 transition-colors"
      >
        <Wrench className="w-5 h-5 text-amber-500" />
        <span>{language === 'mr' ? 'रिपेअर' : 'Repair'}</span>
      </button>

      {/* 4. Play Store App */}
      <button
        onClick={onOpenAndroidModal}
        className="flex flex-col items-center gap-0.5 p-1 text-[#2874f0] hover:text-blue-700 transition-colors"
      >
        <div className="relative">
          <Smartphone className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-yellow-400"></span>
        </div>
        <span>{language === 'mr' ? 'ॲप APK' : 'Play Store'}</span>
      </button>

      {/* 5. Cart */}
      <button
        onClick={onOpenCart}
        className="relative flex flex-col items-center gap-0.5 p-1 text-slate-600 hover:text-[#2874f0] transition-colors"
      >
        <div className="relative">
          <ShoppingCart className="w-5 h-5" />
          {itemCount > 0 && (
            <span className="absolute -top-1.5 -right-2 bg-yellow-400 text-slate-900 font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
              {itemCount}
            </span>
          )}
        </div>
        <span>{language === 'mr' ? 'कार्ट' : 'Cart'}</span>
      </button>

      {/* 6. Account */}
      <button
        onClick={onOpenAccount}
        className="flex flex-col items-center gap-0.5 p-1 text-slate-600 hover:text-[#2874f0] transition-colors"
      >
        <User className="w-5 h-5" />
        <span>{language === 'mr' ? 'अकाउंट' : 'Account'}</span>
      </button>
    </nav>
  );
};
