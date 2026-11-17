import React, { useState } from 'react';
import { 
  X, 
  Wrench, 
  Cpu, 
  HardDrive, 
  Printer, 
  Camera, 
  ShieldCheck, 
  CheckCircle2, 
  Calendar, 
  MapPin, 
  Phone,
  ArrowRight
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { ServiceRequest } from '../types';

interface BookServiceModalProps {
  isOpen: boolean;
  preselectedService?: string;
  onClose: () => void;
  onSuccess: (ticket: ServiceRequest) => void;
}

export const BookServiceModal: React.FC<BookServiceModalProps> = ({
  isOpen,
  preselectedService,
  onClose,
  onSuccess,
}) => {
  const { bookServiceRequest, settings } = useStore();
  const { user } = useAuth();
  const { language, t } = useLanguage();

  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [serviceType, setServiceType] = useState(preselectedService || 'Laptop & Desktop Motherboard / Chip-Level Repair');
  const [deviceType, setDeviceType] = useState<'Desktop' | 'Laptop' | 'Printer' | 'CCTV' | 'Network' | 'Other'>('Laptop');
  const [brandModel, setBrandModel] = useState('');
  const [problemDescription, setProblemDescription] = useState('');
  const [preferredDate, setPreferredDate] = useState(() => {
    return new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  });
  const [serviceMode, setServiceMode] = useState<'store_dropoff' | 'on_site'>('store_dropoff');
  const [address, setAddress] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !problemDescription) return;

    const ticket = bookServiceRequest({
      customerName,
      customerPhone,
      customerEmail,
      serviceType,
      serviceTypeMr: serviceType,
      deviceType,
      brandModel: brandModel || 'Not Specified',
      problemDescription,
      preferredDate,
      serviceMode,
      address: serviceMode === 'on_site' ? (address || 'Chikhli Area') : undefined,
    });

    onSuccess(ticket);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-6 max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-white">
                {t('bookServiceNow')}
              </h2>
              <div className="text-[11px] text-slate-300">
                Vishvjeet Computer Service Center • Chikhli
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Customer Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {t('fullName')} *
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Anand Shinde"
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl font-medium outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {t('mobileNumber')} *
              </label>
              <input
                type="tel"
                required
                pattern="[0-9]{10}"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="10-digit Mobile"
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl font-medium outline-none focus:border-blue-600 font-mono"
              />
            </div>
          </div>

          {/* Service & Device Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Service Category *
              </label>
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl font-medium outline-none focus:border-blue-600 bg-white"
              >
                <option value="Laptop & Desktop Motherboard / Chip-Level Repair">
                  Laptop / Desktop Motherboard Repair
                </option>
                <option value="SSD & RAM Performance Upgrade">
                  SSD & RAM Speed Upgrade
                </option>
                <option value="Genuine Windows 11/10 Installation & Formatting">
                  Windows Installation & Formatting
                </option>
                <option value="Printer Repair & Toner Cartridge Refilling">
                  Printer Repair & Toner Refilling
                </option>
                <option value="CCTV Camera Setup, Wiring & Mobile Online Configuration">
                  CCTV Camera Setup & Mobile Viewing
                </option>
                <option value="Annual Maintenance Contract (AMC) for Offices & Schools">
                  Office / School IT AMC
                </option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {t('deviceType')} *
              </label>
              <select
                value={deviceType}
                onChange={(e) => setDeviceType(e.target.value as any)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl font-medium outline-none focus:border-blue-600 bg-white"
              >
                <option value="Laptop">Laptop</option>
                <option value="Desktop">Desktop Computer</option>
                <option value="Printer">Printer / Scanner</option>
                <option value="CCTV">CCTV Security</option>
                <option value="Network">Wi-Fi & Router</option>
                <option value="Other">Other Hardware</option>
              </select>
            </div>
          </div>

          {/* Brand & Model */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              {t('brandAndModel')} (Optional)
            </label>
            <input
              type="text"
              value={brandModel}
              onChange={(e) => setBrandModel(e.target.value)}
              placeholder="e.g. HP 15s-eq2144au / Canon G3000 / Dell Inspiron"
              className="w-full px-3 py-2.5 border border-slate-300 rounded-xl font-medium outline-none focus:border-blue-600"
            />
          </div>

          {/* Problem Description */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              {t('problemDesc')} *
            </label>
            <textarea
              required
              rows={3}
              value={problemDescription}
              onChange={(e) => setProblemDescription(e.target.value)}
              placeholder="Describe the fault (e.g. laptop not turning on, blank display, paper jam in printer, slow booting, virus popup)..."
              className="w-full px-3 py-2.5 border border-slate-300 rounded-xl font-medium outline-none focus:border-blue-600"
            />
          </div>

          {/* Service Mode */}
          <div className="space-y-2">
            <label className="font-bold text-slate-700 block">
              {t('serviceOption')}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label
                className={`p-3 rounded-xl border cursor-pointer text-center transition-all ${
                  serviceMode === 'store_dropoff'
                    ? 'border-blue-600 bg-blue-50/50 text-blue-900 font-bold'
                    : 'border-slate-200 text-slate-600'
                }`}
              >
                <input
                  type="radio"
                  name="service_mode"
                  checked={serviceMode === 'store_dropoff'}
                  onChange={() => setServiceMode('store_dropoff')}
                  className="sr-only"
                />
                <BuildingCheckIcon />
                <span className="block mt-1">{t('serviceStore')}</span>
              </label>

              <label
                className={`p-3 rounded-xl border cursor-pointer text-center transition-all ${
                  serviceMode === 'on_site'
                    ? 'border-blue-600 bg-blue-50/50 text-blue-900 font-bold'
                    : 'border-slate-200 text-slate-600'
                }`}
              >
                <input
                  type="radio"
                  name="service_mode"
                  checked={serviceMode === 'on_site'}
                  onChange={() => setServiceMode('on_site')}
                  className="sr-only"
                />
                <TechnicianVisitIcon />
                <span className="block mt-1">{t('serviceOnsite')}</span>
              </label>
            </div>
          </div>

          {/* On-site Address if selected */}
          {serviceMode === 'on_site' && (
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Your Address in Chikhli or Buldhana *
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Shop/House Address in Chikhli"
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl font-medium outline-none focus:border-blue-600"
              />
            </div>
          )}

          {/* Preferred Appointment Date */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              {t('preferredDate')}
            </label>
            <input
              type="date"
              value={preferredDate}
              onChange={(e) => setPreferredDate(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-xl font-medium outline-none focus:border-blue-600"
            />
          </div>

          {/* Submit CTA */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 bg-blue-700 hover:bg-blue-800 text-white font-extrabold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-700/20 active:scale-98 transition-all"
            >
              <span>{t('submitService')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-[10px] text-slate-400 text-center mt-2">
              Our technician will call you within 2 working hours to confirm diagnosis time.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

const BuildingCheckIcon = () => (
  <div className="w-6 h-6 mx-auto rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
    <MapPin className="w-3.5 h-3.5" />
  </div>
);

const TechnicianVisitIcon = () => (
  <div className="w-6 h-6 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
    <Wrench className="w-3.5 h-3.5" />
  </div>
);
