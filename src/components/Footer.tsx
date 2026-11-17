import React from 'react';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  MessageCircle, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Wrench,
  ExternalLink
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useLanguage } from '../context/LanguageContext';
import { InfoPageType } from './InfoPagesModal';
import { ProductCategory } from '../types';

interface FooterProps {
  onOpenPage: (page: InfoPageType) => void;
  onSelectCategory: (category: ProductCategory | 'all' | 'services') => void;
  onOpenServices: () => void;
  onOpenTrackOrder: () => void;
  onOpenOwner?: () => void;
  onOpenAdmin?: () => void;
  onOpenLogin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenPage,
  onSelectCategory,
  onOpenServices,
  onOpenTrackOrder,
  onOpenOwner,
  onOpenAdmin,
  onOpenLogin,
}) => {
  const { settings } = useStore();
  const { language, t } = useLanguage();

  return (
    <footer className="bg-slate-950 text-slate-300 pt-12 pb-8 border-t border-slate-800 text-xs mt-12">
      {/* Top Value Badges Bar */}
      <div className="max-w-7xl mx-auto px-4 pb-10 border-b border-slate-800/80">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-900/60 text-blue-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-white">{t('badgeGenuine')}</div>
              <div className="text-[11px] text-slate-400">{t('badgeGenuineDesc')}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-900/50 text-amber-400 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-white">{t('badgeLocal')}</div>
              <div className="text-[11px] text-slate-400">{t('badgeLocalDesc')}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-900/50 text-emerald-400 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-white">{t('badgeFast')}</div>
              <div className="text-[11px] text-slate-400">{t('badgeFastDesc')}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-900/50 text-purple-400 flex items-center justify-center shrink-0">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-white">{t('badgeRepair')}</div>
              <div className="text-[11px] text-slate-400">{t('badgeRepairDesc')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
        {/* Col 1 & 2: About Store & Location */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-700 text-white flex items-center justify-center font-extrabold text-sm tracking-wider">
              VC
            </div>
            <div>
              <div className="text-base font-extrabold text-white">
                {t('brandName')}
              </div>
              <div className="text-[11px] text-amber-400 font-medium">
                {language === 'mr' ? settings.taglineMr : settings.tagline}
              </div>
            </div>
          </div>

          <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
            {t('aboutUsShort')}
          </p>

          <div className="space-y-2 pt-2 text-slate-300">
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{settings.address}</span>
            </div>

            <div className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-blue-400 shrink-0" />
              <a href={`tel:${settings.phone.replace(/\s+/g, '')}`} className="hover:text-white transition-colors">
                Phone: {settings.phone}
              </a>
            </div>

            <div className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-amber-400 shrink-0" />
              <a href={`mailto:${settings.email}`} className="text-amber-300 hover:text-white transition-colors font-mono">
                Email: {settings.email}
              </a>
            </div>

            <div className="flex items-center gap-2.5">
              <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <a
                href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                WhatsApp: {settings.whatsapp}
              </a>
            </div>

            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-blue-400 shrink-0" />
              <span>{language === 'mr' ? settings.openingHoursMr : settings.openingHours}</span>
            </div>
          </div>
        </div>

        {/* Col 3: Categories */}
        <div className="space-y-3">
          <h4 className="text-white font-extrabold uppercase tracking-wider text-xs">
            Categories
          </h4>
          <ul className="space-y-2 text-slate-400">
            <li>
              <button onClick={() => onSelectCategory('laptops')} className="hover:text-white transition-colors">
                {t('navLaptops')}
              </button>
            </li>
            <li>
              <button onClick={() => onSelectCategory('computers_desktops')} className="hover:text-white transition-colors">
                {t('navComputers')}
              </button>
            </li>
            <li>
              <button onClick={() => onSelectCategory('printers_scanners')} className="hover:text-white transition-colors">
                {t('navPrinters')}
              </button>
            </li>
            <li>
              <button onClick={() => onSelectCategory('cameras_cctv')} className="hover:text-white transition-colors">
                {t('navCameras')}
              </button>
            </li>
            <li>
              <button onClick={() => onSelectCategory('toner_ink')} className="hover:text-white transition-colors">
                {t('navToners')}
              </button>
            </li>
            <li>
              <button onClick={() => onSelectCategory('computer_accessories')} className="hover:text-white transition-colors">
                {t('navCompAcc')}
              </button>
            </li>
            <li>
              <button onClick={() => onSelectCategory('networking')} className="hover:text-white transition-colors">
                {t('navNetworking')}
              </button>
            </li>
          </ul>
        </div>

        {/* Col 4: Services & Support */}
        <div className="space-y-3">
          <h4 className="text-white font-extrabold uppercase tracking-wider text-xs">
            Repair & IT Services
          </h4>
          <ul className="space-y-2 text-slate-400">
            <li>
              <button onClick={onOpenServices} className="hover:text-white transition-colors">
                Motherboard Chip Repair
              </button>
            </li>
            <li>
              <button onClick={onOpenServices} className="hover:text-white transition-colors">
                SSD & RAM Upgrade
              </button>
            </li>
            <li>
              <button onClick={onOpenServices} className="hover:text-white transition-colors">
                Windows 11 Setup & Formatting
              </button>
            </li>
            <li>
              <button onClick={onOpenServices} className="hover:text-white transition-colors">
                Laser Printer & Toner Refill
              </button>
            </li>
            <li>
              <button onClick={onOpenServices} className="hover:text-white transition-colors">
                CCTV Camera Fitting & Mobile View
              </button>
            </li>
            <li>
              <button onClick={onOpenTrackOrder} className="text-amber-400 font-semibold hover:underline">
                {t('trackOrder')}
              </button>
            </li>
          </ul>
        </div>

        {/* Col 5: Policies & Legal */}
        <div className="space-y-3">
          <h4 className="text-white font-extrabold uppercase tracking-wider text-xs">
            Customer Information
          </h4>
          <ul className="space-y-2 text-slate-400">
            <li>
              <button onClick={() => onOpenPage('about')} className="hover:text-white transition-colors">
                {t('aboutUs')}
              </button>
            </li>
            <li>
              <button onClick={() => onOpenPage('contact')} className="hover:text-white transition-colors">
                {t('contactUs')}
              </button>
            </li>
            <li>
              <button onClick={() => onOpenPage('faqs')} className="hover:text-white transition-colors">
                Frequently Asked Questions
              </button>
            </li>
            <li>
              <button onClick={() => onOpenPage('shipping')} className="hover:text-white transition-colors">
                {t('shippingPolicy')}
              </button>
            </li>
            <li>
              <button onClick={() => onOpenPage('returns')} className="hover:text-white transition-colors">
                {t('returnPolicy')}
              </button>
            </li>
            <li>
              <button onClick={() => onOpenPage('privacy')} className="hover:text-white transition-colors">
                {t('privacyPolicy')}
              </button>
            </li>
            <li>
              <button onClick={() => onOpenPage('terms')} className="hover:text-white transition-colors">
                {t('termsConditions')}
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Legal & Copyright Bar */}
      <div className="max-w-7xl mx-auto px-4 pt-6 border-t border-slate-900 flex flex-wrap justify-between items-center gap-3 text-[11px] text-slate-400">
        <div>
          © {new Date().getFullYear()} {settings.storeName}. {t('allRightsReserved')}
          <span className="ml-2 font-mono text-slate-400">GSTIN: {settings.gstin}</span>
        </div>

        <div className="flex items-center gap-3 text-slate-500">
          <span>Shop No. 4, Shivaji Complex, Chikhli, Buldhana (443201)</span>
          {(onOpenOwner || onOpenAdmin || onOpenLogin) && (
            <span className="hidden sm:inline text-slate-700">|</span>
          )}
          {onOpenOwner && (
            <button 
              onClick={onOpenOwner} 
              className="text-slate-500 hover:text-amber-400 transition-colors cursor-pointer"
              title="Store Owner Portal (Images & Payments)"
            >
              👑 Owner Portal
            </button>
          )}
          {onOpenAdmin && (
            <button 
              onClick={onOpenAdmin} 
              className="text-slate-500 hover:text-purple-400 transition-colors cursor-pointer"
              title="Super Admin Master Console"
            >
              ⚡ Admin Console
            </button>
          )}
          {onOpenLogin && (
            <button 
              onClick={onOpenLogin} 
              className="text-slate-500 hover:text-blue-400 transition-colors cursor-pointer"
            >
              🔑 Switch Role / Login
            </button>
          )}
        </div>
      </div>
    </footer>
  );
};
