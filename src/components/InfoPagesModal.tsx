import React from 'react';
import { X, MapPin, Phone, Mail, Clock, MessageCircle, ExternalLink, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useLanguage } from '../context/LanguageContext';

export type InfoPageType = 'about' | 'contact' | 'faqs' | 'shipping' | 'returns' | 'privacy' | 'terms';

interface InfoPagesModalProps {
  page: InfoPageType | null;
  onClose: () => void;
  onBookService: () => void;
}

export const InfoPagesModal: React.FC<InfoPagesModalProps> = ({
  page,
  onClose,
  onBookService,
}) => {
  const { settings } = useStore();
  const { language, t } = useLanguage();

  if (!page) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-4">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <h2 className="text-base font-extrabold text-slate-900 capitalize">
            {page === 'about' && t('aboutUs')}
            {page === 'contact' && t('contactUs')}
            {page === 'faqs' && 'Frequently Asked Questions (FAQs)'}
            {page === 'shipping' && t('shippingPolicy')}
            {page === 'returns' && t('returnPolicy')}
            {page === 'privacy' && t('privacyPolicy')}
            {page === 'terms' && t('termsConditions')}
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs text-slate-700 leading-relaxed">
          {/* ABOUT US */}
          {page === 'about' && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-200">
                <h3 className="font-extrabold text-blue-950 text-sm mb-1">
                  Welcome to {settings.storeName}
                </h3>
                <p className="text-blue-900">
                  {language === 'mr' ? settings.taglineMr : settings.tagline} • Chikhli, Buldhana
                </p>
              </div>

              <p>
                Established in 2015, <strong>Vishvjeet Computer</strong> has grown to become the trusted technology showroom and IT hardware repair destination for students, professionals, schools, retail shops, and commercial offices across Chikhli and the entire Buldhana district.
              </p>

              <div className="grid sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>100% Genuine Hardware</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Official retail partners for HP, Dell, Lenovo, Canon, Epson, CP PLUS, Logitech, and Crucial with manufacturer warranty.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <span>Physical Walk-in Support</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Real store presence in Chikhli where customers can test laptops before purchasing and receive instant hands-on technical guidance.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* CONTACT US */}
          {page === 'contact' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-slate-900 font-bold mb-0.5">Store Address:</strong>
                    <span>{settings.address}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-blue-700 shrink-0" />
                  <div>
                    <strong className="block text-slate-900 font-bold mb-0.5">Phone Call Support:</strong>
                    <a href={`tel:${settings.phone.replace(/\s+/g, '')}`} className="text-blue-700 font-bold hover:underline">
                      {settings.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <MessageCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <strong className="block text-slate-900 font-bold mb-0.5">Direct WhatsApp Desk:</strong>
                    <a
                      href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-700 font-bold hover:underline"
                    >
                      {settings.whatsapp}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-blue-700 shrink-0" />
                  <div>
                    <strong className="block text-slate-900 font-bold mb-0.5">Official Email:</strong>
                    <span>{settings.email}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-blue-700 shrink-0" />
                  <div>
                    <strong className="block text-slate-900 font-bold mb-0.5">Opening Hours:</strong>
                    <span>{language === 'mr' ? settings.openingHoursMr : settings.openingHours}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <a
                  href={settings.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Open in Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  onClick={() => {
                    onClose();
                    onBookService();
                  }}
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-bold transition-colors"
                >
                  Book Service Request
                </button>
              </div>
            </div>
          )}

          {/* FAQS */}
          {page === 'faqs' && (
            <div className="space-y-3">
              {[
                {
                  q: 'Do you provide doorstep delivery in Chikhli and Buldhana?',
                  a: 'Yes! For customers within Chikhli (PIN 443201) and surrounding Buldhana villages, we provide same-day or next-day delivery. We also ship across Maharashtra with tracking numbers via courier.',
                },
                {
                  q: 'Can I test laptops and desktops at the Chikhli store before buying?',
                  a: 'Absolutely. We invite you to visit Shop No. 4, Shivaji Complex, Main Road, Chikhli. You can inspect screen quality, keyboard typing feel, and speed in person.',
                },
                {
                  q: 'How fast is laser toner cartridge refilling?',
                  a: 'Standard HP 88A, 12A, and Canon cartridges are refilled with premium micro-refined toner powder within 2 to 3 hours at our workshop.',
                },
                {
                  q: 'What warranty is provided on custom PC assemblies?',
                  a: 'All components (Processor, Motherboard, RAM, SSD, Graphics Card) carry their full 3-year brand warranties, along with free local software checkups at our store.',
                },
                {
                  q: 'Do you offer on-site CCTV installation quotes for shops and bungalows?',
                  a: 'Yes. Our technician conducts a site survey in Chikhli, measures cable wiring lengths, and provides a customized quote before starting work.',
                },
              ].map((faq, idx) => (
                <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <h4 className="font-extrabold text-slate-900 mb-1">{faq.q}</h4>
                  <p className="text-slate-600 text-[11px] leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          )}

          {/* SHIPPING POLICY */}
          {page === 'shipping' && (
            <div className="space-y-3">
              <h3 className="font-extrabold text-sm text-slate-900">Delivery Rules & Dispatch</h3>
              <p>
                All orders are dispatched directly from our Chikhli showroom and warehouse.
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Local Chikhli Orders (PIN 443201):</strong> Same Day or Next Day Delivery.</li>
                <li><strong>Buldhana District:</strong> 1 to 2 business days.</li>
                <li><strong>Across Maharashtra:</strong> 2 to 4 business days via Express Couriers.</li>
                <li><strong>Free Shipping:</strong> Automatically applied on all orders above ₹1,500.</li>
                <li><strong>Store Pickup:</strong> Free self-pickup available immediately during shop hours (9:30 AM - 8:30 PM).</li>
              </ul>
            </div>
          )}

          {/* RETURNS & REPLACEMENT */}
          {page === 'returns' && (
            <div className="space-y-3">
              <h3 className="font-extrabold text-sm text-slate-900">7-Day Replacement Policy</h3>
              <p>
                We stand behind the quality of every hardware item sold:
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Products with manufacturing defects or transit damage are eligible for replacement within 7 days of delivery.</li>
                <li>Please retain the original box, invoice, serial number sticker, and included accessories.</li>
                <li>Walk-in returns and replacements are gladly serviced directly at our Chikhli counter.</li>
              </ul>
            </div>
          )}

          {/* PRIVACY POLICY */}
          {page === 'privacy' && (
            <div className="space-y-3">
              <h3 className="font-extrabold text-sm text-slate-900">Customer Privacy & Security</h3>
              <p>
                Vishvjeet Computer respects your personal data. We collect customer names, phone numbers, and delivery addresses strictly for order fulfillment, courier delivery, and repair job sheet notifications.
              </p>
              <p>
                We never store raw debit/credit card numbers or bank passwords. All online payments are handled securely through PCI-DSS certified Razorpay gateway with 256-bit SSL encryption.
              </p>
            </div>
          )}

          {/* TERMS & CONDITIONS */}
          {page === 'terms' && (
            <div className="space-y-3">
              <h3 className="font-extrabold text-sm text-slate-900">Terms of Service</h3>
              <p>
                Prices and availability are updated regularly. In case of pricing or stock errors, our team reserves the right to contact the customer and adjust or refund the order. All disputes are subject to Chikhli (Buldhana district) jurisdiction.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
