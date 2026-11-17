import React from 'react';
import { ProductCategory } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { ChevronDown } from 'lucide-react';

interface CategoryBarProps {
  onSelectCategory: (cat: ProductCategory | 'services' | 'all' | 'deals_offers') => void;
  selectedCategory: string;
  onOpenAndroidAppModal?: () => void;
}

export const CategoryBar: React.FC<CategoryBarProps> = ({
  onSelectCategory,
  selectedCategory,
}) => {
  const { language } = useLanguage();

  const categoryList: {
    id: ProductCategory | 'services' | 'deals_offers';
    name: string;
    nameMr: string;
    img: string;
    hasDropdown?: boolean;
  }[] = [
    {
      id: 'deals_offers',
      name: 'Top Offers',
      nameMr: 'खास ऑफर्स',
      img: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=200&auto=format&fit=crop&q=80',
      hasDropdown: false,
    },
    {
      id: 'laptops',
      name: 'Laptops',
      nameMr: 'लॅपटॉप्स',
      img: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=200&auto=format&fit=crop&q=80',
      hasDropdown: true,
    },
    {
      id: 'computers_desktops',
      name: 'Desktop PCs',
      nameMr: 'डेस्कटॉप संगणक',
      img: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=200&auto=format&fit=crop&q=80',
      hasDropdown: true,
    },
    {
      id: 'printers_scanners',
      name: 'Printers & Ink',
      nameMr: 'प्रिंटर्स व शाई',
      img: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=200&auto=format&fit=crop&q=80',
      hasDropdown: true,
    },
    {
      id: 'cameras_cctv',
      name: 'CCTV & Cameras',
      nameMr: 'सीसीटीव्ही कॅमेरे',
      img: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=200&auto=format&fit=crop&q=80',
      hasDropdown: true,
    },
    {
      id: 'computer_accessories',
      name: 'Accessories',
      nameMr: 'अ‍ॅक्सेसरीज',
      img: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=200&auto=format&fit=crop&q=80',
      hasDropdown: true,
    },
    {
      id: 'toner_ink',
      name: 'Toner Cartridges',
      nameMr: 'टोनर व काडतुसे',
      img: 'https://images.unsplash.com/photo-1589492477829-5e65395b66cc?w=200&auto=format&fit=crop&q=80',
      hasDropdown: true,
    },
    {
      id: 'networking',
      name: 'Networking & Wi-Fi',
      nameMr: 'वाय-फाय व राऊटर',
      img: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=200&auto=format&fit=crop&q=80',
      hasDropdown: true,
    },
    {
      id: 'services',
      name: 'IT Repair Services',
      nameMr: 'रिपेअर सर्व्हिसेस',
      img: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=200&auto=format&fit=crop&q=80',
      hasDropdown: false,
    },
  ];

  return (
    <div id="category-bar" className="bg-white border-b border-slate-200 shadow-xs mb-2">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-3">
        <div className="flex items-center justify-between sm:justify-around lg:justify-between gap-3 sm:gap-6 overflow-x-auto scrollbar-none py-1">
          {categoryList.map((cat) => {
            const isSelected = selectedCategory === cat.id;

            return (
              <div
                key={cat.id}
                onClick={() => onSelectCategory(cat.id as any)}
                className={`group flex flex-col items-center justify-center shrink-0 min-w-[72px] sm:min-w-[84px] cursor-pointer transition-all ${
                  isSelected ? 'text-[#2874f0]' : 'text-slate-800 hover:text-[#2874f0]'
                }`}
              >
                {/* Flipkart circular icon thumbnail */}
                <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden p-1 flex items-center justify-center bg-slate-50 border transition-all duration-200 group-hover:scale-105 ${
                  isSelected 
                    ? 'border-[#2874f0] ring-2 ring-blue-100 bg-blue-50 shadow-xs' 
                    : 'border-slate-200 group-hover:border-[#2874f0]'
                }`}>
                  <img
                    src={cat.img}
                    alt={cat.name}
                    className="w-full h-full object-cover rounded-full"
                    loading="lazy"
                  />
                </div>

                {/* Title & Chevron */}
                <div className="mt-1.5 flex items-center gap-0.5 text-center">
                  <span className="text-xs font-bold leading-tight line-clamp-1">
                    {language === 'mr' ? cat.nameMr : cat.name}
                  </span>
                  {cat.hasDropdown && (
                    <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-[#2874f0] transition-transform group-hover:rotate-180" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
