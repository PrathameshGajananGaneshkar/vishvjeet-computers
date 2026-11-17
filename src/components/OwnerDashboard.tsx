import React, { useState } from 'react';
import { 
  X, 
  Image as ImageIcon, 
  CreditCard, 
  QrCode, 
  Save, 
  Plus, 
  Trash2, 
  Check, 
  ShieldCheck, 
  TrendingUp, 
  Sparkles, 
  RefreshCw,
  Search,
  ExternalLink,
  Sliders,
  DollarSign,
  Building,
  Smartphone,
  Camera,
  Upload,
  Edit3,
  Eye
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useLanguage } from '../context/LanguageContext';
import { formatINR } from '../utils/formatters';
import { StoreBanner } from '../types';
import { compressAndLoadImage } from '../utils/imageUtils';

interface OwnerDashboardProps {
  onClose: () => void;
}

export const OwnerDashboard: React.FC<OwnerDashboardProps> = ({ onClose }) => {
  const { settings, updateStoreSettings, updateHeroBanners, products, updateProductImage, orders } = useStore();
  const { language } = useLanguage();

  const [activeTab, setActiveTab] = useState<'images' | 'payments'>('images');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // --- Payment Form State ---
  const [paymentForm, setPaymentForm] = useState({
    upiId: settings.upiId || '8956664295@okaxis',
    upiPayeeName: settings.upiPayeeName || 'Vishvjeet Computer',
    enableUpi: settings.enableUpi ?? true,
    enableCards: settings.enableCards ?? true,
    enableNetBanking: settings.enableNetBanking ?? true,
    enableCod: settings.enableCod ?? true,
    razorpayKeyId: settings.razorpayKeyId || '',
    isRazorpayTestMode: settings.isRazorpayTestMode ?? true,
    qrCodeUrl: settings.qrCodeUrl || 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=8956664295@okaxis&pn=Vishvjeet%20Computer&cu=INR',
    bankAccountName: settings.bankAccountName || 'Vishvjeet Computer Chikhli',
    bankAccountNumber: settings.bankAccountNumber || '392810485910',
    bankIfsc: settings.bankIfsc || 'SBIN0000348',
    bankName: settings.bankName || 'State Bank of India (Chikhli Branch)',
    fast2smsApiKey: settings.fast2smsApiKey || '',
  });

  // --- Banner Images Form State ---
  const [banners, setBanners] = useState<StoreBanner[]>(() => {
    return settings.heroBanners && settings.heroBanners.length > 0
      ? settings.heroBanners
      : [
          {
            id: 'banner-01',
            badge: 'Authorized Technology Hub • Chikhli',
            badgeMr: 'चिखलीतील अधिकृत आयटी दालन',
            title: 'Upgrade Your Technology with Vishvjeet Computer',
            titleMr: 'विश्वजीत कॉम्प्युटरसह आपले तंत्रज्ञान अपग्रेड करा',
            subtitle: 'Genuine Laptops, Custom Workstations, Printers, CCTV Security & Expert Local IT Services in Chikhli, Buldhana.',
            subtitleMr: 'लॅपटॉप्स, डेस्कटॉप्स, प्रिंटर्स, सीसीटीव्ही सुरक्षा व तज्ज्ञ हार्डवेअर दुरुस्ती सेवा.',
            cta1Text: 'Shop Hardware',
            cta2Text: 'Book a Repair',
            bgGradient: 'from-blue-900 via-blue-800 to-indigo-950',
            image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=900&auto=format&fit=crop&q=80',
            active: true,
          },
        ];
  });

  // --- Product Image Search ---
  const [productSearch, setProductSearch] = useState('');
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [newProductImgUrl, setNewProductImgUrl] = useState('');

  // Financial Stats calculation
  const totalRevenue = orders
    .filter(o => o.paymentStatus === 'paid')
    .reduce((acc, curr) => acc + curr.totalAmount, 0);
  const upiOrders = orders.filter(o => o.paymentMethod === 'upi');
  const razorpayOrders = orders.filter(o => o.paymentMethod === 'razorpay' || o.paymentMethod === 'card');
  const codOrders = orders.filter(o => o.paymentMethod === 'cod');

  const handleSavePaymentSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateStoreSettings(paymentForm);
    triggerSuccess();
  };

  const handleSaveBanners = () => {
    updateHeroBanners(banners);
    triggerSuccess();
  };

  const triggerSuccess = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleUpdateBanner = (index: number, field: keyof StoreBanner, value: string) => {
    setBanners(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // --- Banner Modal Dialog State ---
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [editingBannerIndex, setEditingBannerIndex] = useState<number | null>(null);
  const [modalBannerForm, setModalBannerForm] = useState<StoreBanner>({
    id: 'banner-new',
    badge: 'Special Festive Offer',
    badgeMr: 'खास सणासुदीची ऑफर',
    title: 'Upgrade Your Technology with Vishvjeet Computer',
    titleMr: 'विश्‍वजीत कॉम्प्युटरसह आपले तंत्रज्ञान अपग्रेड करा',
    subtitle: 'Visit Vishvjeet Computer Chikhli showroom for genuine laptops, computers and accessories.',
    subtitleMr: 'ओरिजिनल लॅपटॉप, कॉम्प्युटर आणि ॲक्सेसरीजसाठी आजच विश्‍वजीत कॉम्प्युटर चिखली दालनाला भेट द्या.',
    cta1Text: 'Shop Hardware',
    cta2Text: 'Book a Repair',
    bgGradient: 'from-blue-900 via-indigo-900 to-slate-900',
    image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=900&auto=format&fit=crop&q=80',
    active: true,
  });

  const handleOpenAddBanner = () => {
    setEditingBannerIndex(null);
    setModalBannerForm({
      id: `banner-${Date.now()}`,
      badge: 'Special Festive Offer',
      badgeMr: 'खास सणासुदीची ऑफर',
      title: 'Upgrade Your Technology with Vishvjeet Computer',
      titleMr: 'विश्‍वजीत कॉम्प्युटरसह आपले तंत्रज्ञान अपग्रेड करा',
      subtitle: 'Visit Vishvjeet Computer Chikhli showroom for genuine laptops, computers and accessories.',
      subtitleMr: 'ओरिजिनल लॅपटॉप, कॉम्प्युटर आणि ॲक्सेसरीजसाठी आजच विश्‍वजीत कॉम्प्युटर चिखली दालनाला भेट द्या.',
      cta1Text: 'Shop Hardware',
      cta2Text: 'Book a Repair',
      bgGradient: 'from-blue-900 via-indigo-900 to-slate-900',
      image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=900&auto=format&fit=crop&q=80',
      active: true,
    });
    setIsBannerModalOpen(true);
  };

  const handleOpenEditBanner = (index: number) => {
    setEditingBannerIndex(index);
    setModalBannerForm({ ...banners[index] });
    setIsBannerModalOpen(true);
  };

  const handleModalImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressedDataUrl = await compressAndLoadImage(file);
      setModalBannerForm(prev => ({ ...prev, image: compressedDataUrl }));
    } catch (err: any) {
      alert(err?.message || 'Error processing image file.');
    }
  };

  const handleSaveModalBanner = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!modalBannerForm.image) {
      alert('कृपया बॅनरचा फोटो किंवा लिंक टाका.');
      return;
    }
    let updated: StoreBanner[];
    if (editingBannerIndex !== null) {
      updated = [...banners];
      updated[editingBannerIndex] = modalBannerForm;
    } else {
      updated = [modalBannerForm, ...banners];
    }
    setBanners(updated);
    updateHeroBanners(updated);
    setIsBannerModalOpen(false);
    triggerSuccess();
  };

  const handleDeleteBanner = (id: string) => {
    if (banners.length <= 1) {
      alert('You must have at least one hero banner.');
      return;
    }
    const updated = banners.filter(b => b.id !== id);
    setBanners(updated);
    updateHeroBanners(updated);
    triggerSuccess();
  };

  const handleSaveProductImage = (productId: string) => {
    if (!newProductImgUrl.trim()) return;
    updateProductImage(productId, newProductImgUrl.trim());
    setEditingProductId(null);
    setNewProductImgUrl('');
    triggerSuccess();
  };

  const handleBannerFileUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressedDataUrl = await compressAndLoadImage(file);
      handleUpdateBanner(index, 'image', compressedDataUrl);
      triggerSuccess();
    } catch (err: any) {
      alert(err?.message || 'Error processing image file.');
    }
  };

  const handleProductFileUpload = async (productId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressedDataUrl = await compressAndLoadImage(file);
      updateProductImage(productId, compressedDataUrl);
      setEditingProductId(null);
      setNewProductImgUrl('');
      triggerSuccess();
    } catch (err: any) {
      alert(err?.message || 'Error processing image file.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-6 max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-linear-to-r from-amber-600 via-amber-700 to-amber-900 text-white flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
              <span className="text-xl">👑</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black">
                  Owner Control Center / मालक नियंत्रण पॅनेल
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-white text-amber-900">
                  Images & Payment Only
                </span>
              </div>
              <p className="text-[11px] text-amber-100">
                विशेषतः स्टोअर बॅनर प्रतिमा, प्रॉडक्ट फोटो आणि UPI / गेटवे पेमेंट नियंत्रणासाठी
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 py-2.5 bg-amber-50/60 border-b border-amber-200/80 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 text-xs font-bold">
            <button
              onClick={() => setActiveTab('images')}
              className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'images'
                  ? 'bg-amber-600 text-white shadow-xs font-black'
                  : 'text-amber-950 hover:bg-amber-100/80'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>1. Image & Banner Control (प्रतिमा व्यवस्थापन)</span>
            </button>

            <button
              onClick={() => setActiveTab('payments')}
              className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'payments'
                  ? 'bg-amber-600 text-white shadow-xs font-black'
                  : 'text-amber-950 hover:bg-amber-100/80'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>2. Payment & Gateway Control (पेमेंट व बँक)</span>
            </button>
          </div>

          {saveSuccess && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold border border-emerald-300 animate-in fade-in">
              <Check className="w-3.5 h-3.5" />
              <span>बदल यशस्वीरित्या सेव्ह झाले!</span>
            </div>
          )}
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs">
          
          {/* TAB 1: IMAGE & BANNER MANAGEMENT */}
          {activeTab === 'images' && (
            <div className="space-y-6">
              {/* Guidance Info Banner for Store Owner */}
              <div className="p-4 bg-linear-to-r from-blue-50 via-indigo-50 to-blue-50 rounded-2xl border border-blue-200 flex items-start gap-3 shadow-2xs">
                <div className="p-2 bg-blue-600 text-white rounded-xl shrink-0 mt-0.5">
                  <Camera className="w-4 h-4" />
                </div>
                <div className="text-xs space-y-1 text-slate-700">
                  <div className="font-extrabold text-blue-950 text-sm">
                    दुकानदारांसाठी स्वतःचे फोटो जोडण्याची सुविधा (Real Shop Photos)
                  </div>
                  <p className="leading-relaxed">
                    तुम्ही तुमच्या शोरूममध्ये घेतलेले <strong>लॅपटॉप, पीसी, कॅमेरा, सीसीटीव्ही किंवा प्रिंटरचे</strong> फोटो खालील <strong>"Upload Photo"</strong> किंवा <strong>"कॅमेरा / फोनवरून फोटो निवडा"</strong> बटणावर क्लिक करून मोबाईलच्या कॅमेऱ्यातून किंवा गॅलरीतून थेट निवडू शकता. फोटो आपोआप योग्य साईझमध्ये ॲडजस्ट होऊन वेबसाईटवर झटपट दिसू लागेल!
                  </p>
                </div>
              </div>

              {/* Slider Image Setting */}
              <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/80 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-extrabold text-amber-950 text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-700" />
                    <span>Hero Banner Slider Control / मुख्य बॅनर प्रतिमा व्यवस्थापन</span>
                  </h3>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    वेबसाईटच्या पहिल्या पानावर दिसणारे मुख्य बॅनर्स, त्यांचे फोटो व शीर्षक येथे बदला.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleOpenAddBanner}
                    className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer text-xs"
                    title="नवीन बॅनर जोडण्यासाठी विंडो उघडा"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add New Banner / नवीन बॅनर जोडा</span>
                  </button>
                  <button
                    onClick={handleSaveBanners}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-1 shadow-xs transition-colors cursor-pointer text-xs"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Banners</span>
                  </button>
                </div>
              </div>

              {/* Banner Cards List */}
              <div className="space-y-4">
                {banners.map((b, idx) => (
                  <div key={b.id || idx} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-800 text-xs">
                          Banner #{idx + 1}
                        </span>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium truncate max-w-[200px]">
                          {b.title || 'Untitled Banner'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEditBanner(idx)}
                          className="px-2.5 py-1 text-xs font-bold text-amber-700 hover:bg-amber-50 rounded-lg flex items-center gap-1 border border-amber-200 transition-colors cursor-pointer"
                          title="बॅनर संपादन करण्यासाठी उघडा"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit / संपादन करा</span>
                        </button>
                        <button
                          onClick={() => handleDeleteBanner(b.id)}
                          className="p-1 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete banner"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                      {/* Thumbnail Preview */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block">
                          Banner Image Preview
                        </span>
                        <div className="relative h-28 w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                          <img
                            src={b.image}
                            alt="Banner preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800';
                            }}
                          />
                        </div>
                      </div>

                      {/* Fields */}
                      <div className="md:col-span-2 space-y-2.5">
                        <div>
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase block">
                              Banner Photo / बॅनर फोटो
                            </label>
                            <label className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 hover:bg-amber-200 text-amber-950 rounded-lg text-xs font-bold cursor-pointer transition-colors border border-amber-300">
                              <Camera className="w-3.5 h-3.5 text-amber-700" />
                              <span>कॅमेरा / फोनवरून फोटो निवडा</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleBannerFileUpload(idx, e)}
                              />
                            </label>
                          </div>
                          <input
                            type="text"
                            value={b.image}
                            onChange={(e) => handleUpdateBanner(idx, 'image', e.target.value)}
                            placeholder="किंवा वेब इमेज लिंक पेस्ट करा (https://...)"
                            className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono outline-none focus:border-amber-600 focus:bg-white"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                              Headline (English)
                            </label>
                            <input
                              type="text"
                              value={b.title}
                              onChange={(e) => handleUpdateBanner(idx, 'title', e.target.value)}
                              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-none focus:border-amber-600 focus:bg-white"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                              Headline (मराठी)
                            </label>
                            <input
                              type="text"
                              value={b.titleMr || ''}
                              onChange={(e) => handleUpdateBanner(idx, 'titleMr', e.target.value)}
                              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-none focus:border-amber-600 focus:bg-white"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                            Badge Offer Tag (उदा. सणासुदीची खास ऑफर / Brand Warranty)
                          </label>
                          <input
                            type="text"
                            value={b.badge}
                            onChange={(e) => handleUpdateBanner(idx, 'badge', e.target.value)}
                            className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-none focus:border-amber-600 focus:bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* PRODUCT IMAGE QUICK MANAGER */}
              <div className="pt-4 border-t border-slate-200 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-blue-700" />
                      <span>Product Image Manager / उत्पादनांचे फोटो बदलणे</span>
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      कोणत्याही लॅपटॉप, प्रिंटर किंवा ॲक्सेसरीजचा फोटो कॅमेऱ्यातून किंवा गॅलरीतून थेट अपडेट करा.
                    </p>
                  </div>

                  <div className="relative w-64">
                    <input
                      type="text"
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder="Search product (Laptop, PC, Camera)..."
                      className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-none focus:border-amber-600 focus:bg-white"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto p-1">
                  {products
                    .filter(p => p.title.toLowerCase().includes(productSearch.toLowerCase()) || p.brand.toLowerCase().includes(productSearch.toLowerCase()))
                    .slice(0, 12)
                    .map((p) => (
                      <div key={p.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3 hover:border-slate-300 transition-colors">
                        <img
                          src={p.images[0]}
                          alt={p.title}
                          className="w-16 h-16 object-contain rounded-xl bg-white p-1 border border-slate-200 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-slate-900 truncate text-xs">{p.title}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{p.brand} • {formatINR(p.price)}</div>

                          {editingProductId === p.id ? (
                            <div className="mt-2 flex gap-1">
                              <input
                                type="text"
                                value={newProductImgUrl}
                                onChange={(e) => setNewProductImgUrl(e.target.value)}
                                placeholder="Paste new Image URL..."
                                className="flex-1 p-1 bg-white border border-blue-400 rounded text-[11px] outline-none"
                              />
                              <button
                                onClick={() => handleSaveProductImage(p.id)}
                                className="px-2 py-1 bg-emerald-600 text-white rounded text-[10px] font-bold cursor-pointer"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingProductId(null)}
                                className="px-2 py-1 bg-slate-200 text-slate-700 rounded text-[10px] cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              <label className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-[11px] font-bold cursor-pointer transition-colors shadow-2xs">
                                <Camera className="w-3 h-3 text-blue-600" />
                                <span>Upload Store Photo</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => handleProductFileUpload(p.id, e)}
                                />
                              </label>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingProductId(p.id);
                                  setNewProductImgUrl(p.images[0]);
                                }}
                                className="text-[11px] text-slate-500 hover:text-slate-800 underline font-medium cursor-pointer"
                              >
                                Paste URL
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PAYMENT & GATEWAY MANAGEMENT */}
          {activeTab === 'payments' && (
            <form onSubmit={handleSavePaymentSettings} className="space-y-6">
              
              {/* Financial Snapshot */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase block">Total Paid Revenue</span>
                  <span className="text-lg font-black text-emerald-950 mt-0.5 block">{formatINR(totalRevenue)}</span>
                  <span className="text-[9px] text-emerald-700">Verified online payments</span>
                </div>
                <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200">
                  <span className="text-[10px] font-bold text-blue-800 uppercase block">Direct UPI Orders</span>
                  <span className="text-lg font-black text-blue-950 mt-0.5 block">{upiOrders.length}</span>
                  <span className="text-[9px] text-blue-700">0% transaction fee</span>
                </div>
                <div className="p-3 rounded-2xl bg-purple-50 border border-purple-200">
                  <span className="text-[10px] font-bold text-purple-800 uppercase block">Razorpay / Card</span>
                  <span className="text-lg font-black text-purple-950 mt-0.5 block">{razorpayOrders.length}</span>
                  <span className="text-[9px] text-purple-700">Cards & Netbanking</span>
                </div>
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200">
                  <span className="text-[10px] font-bold text-amber-800 uppercase block">Cash On Delivery</span>
                  <span className="text-lg font-black text-amber-950 mt-0.5 block">{codOrders.length}</span>
                  <span className="text-[9px] text-amber-700">Pay at doorstep/store</span>
                </div>
              </div>

              {/* Direct UPI Gateway Settings */}
              <div className="p-5 bg-linear-to-br from-blue-50 to-indigo-50/40 rounded-2xl border border-blue-200 space-y-4">
                <div className="flex items-center justify-between border-b border-blue-200/80 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-700 text-white flex items-center justify-center font-black">
                      ₹
                    </div>
                    <div>
                      <h4 className="font-extrabold text-blue-950 text-sm">
                        Direct UPI Payment Gateway (0% Fee) / थेट यूपीआय गेटवे
                      </h4>
                      <p className="text-[11px] text-blue-800">
                        ग्राहकांचे पेमेंट थेट तुमच्या बँक खात्यात विना शुल्क जमा होते.
                      </p>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer font-bold text-blue-950">
                    <input
                      type="checkbox"
                      checked={paymentForm.enableUpi}
                      onChange={(e) => setPaymentForm({ ...paymentForm, enableUpi: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span>UPI Active</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                      Store UPI ID / स्टोअर यूपीआय आयडी *
                    </label>
                    <input
                      type="text"
                      value={paymentForm.upiId}
                      onChange={(e) => setPaymentForm({ ...paymentForm, upiId: e.target.value })}
                      placeholder="e.g. 8956664295@okaxis"
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-mono text-xs font-bold text-blue-900 outline-none focus:border-blue-600"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Google Pay, PhonePe, Paytm, BHIM द्वारे पेमेंट स्वीकारण्यासाठी.
                    </span>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                      UPI Payee Name / खात्यावरील नाव
                    </label>
                    <input
                      type="text"
                      value={paymentForm.upiPayeeName}
                      onChange={(e) => setPaymentForm({ ...paymentForm, upiPayeeName: e.target.value })}
                      placeholder="e.g. Vishvjeet Computer"
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-blue-600"
                    />
                  </div>
                </div>

                {/* QR Code Preview */}
                <div className="p-3 bg-white rounded-xl border border-blue-200 flex items-center gap-4">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=${paymentForm.upiId}&pn=${encodeURIComponent(paymentForm.upiPayeeName)}&cu=INR`}
                    alt="UPI QR Code"
                    className="w-16 h-16 object-contain rounded-lg border border-slate-200 p-1"
                  />
                  <div>
                    <span className="font-bold text-slate-900 block">Dynamic UPI QR Code Generated</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Customer can scan this QR code with any UPI app for instant payments.
                    </p>
                    <span className="text-[10px] font-mono text-blue-700 font-bold block mt-1">
                      upi://pay?pa={paymentForm.upiId}&pn={paymentForm.upiPayeeName}
                    </span>
                  </div>
                </div>
              </div>

              {/* Razorpay & Online Card Gateway Settings */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-2.5">
                    <CreditCard className="w-5 h-5 text-purple-700" />
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm">
                        Razorpay Gateway & Card Processing
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Visa, Mastercard, RuPay, NetBanking आणि Wallet पेमेंटसाठी
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-600">Mode:</span>
                    <button
                      type="button"
                      onClick={() => setPaymentForm({ ...paymentForm, isRazorpayTestMode: !paymentForm.isRazorpayTestMode })}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition-colors ${
                        paymentForm.isRazorpayTestMode
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      }`}
                    >
                      {paymentForm.isRazorpayTestMode ? 'Test Sandbox Mode' : 'Live Production'}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                    Razorpay Key ID
                  </label>
                  <input
                    type="text"
                    value={paymentForm.razorpayKeyId}
                    onChange={(e) => setPaymentForm({ ...paymentForm, razorpayKeyId: e.target.value })}
                    placeholder="rzp_live_... or rzp_test_..."
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-mono text-xs outline-none focus:border-purple-600"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                  <label className="flex items-center gap-2 p-2.5 bg-white rounded-xl border border-slate-200 cursor-pointer font-bold text-slate-700">
                    <input
                      type="checkbox"
                      checked={paymentForm.enableCards}
                      onChange={(e) => setPaymentForm({ ...paymentForm, enableCards: e.target.checked })}
                      className="w-4 h-4 text-purple-600 rounded"
                    />
                    <span>Debit & Credit Cards</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 bg-white rounded-xl border border-slate-200 cursor-pointer font-bold text-slate-700">
                    <input
                      type="checkbox"
                      checked={paymentForm.enableNetBanking}
                      onChange={(e) => setPaymentForm({ ...paymentForm, enableNetBanking: e.target.checked })}
                      className="w-4 h-4 text-purple-600 rounded"
                    />
                    <span>Net Banking</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 bg-white rounded-xl border border-slate-200 cursor-pointer font-bold text-slate-700">
                    <input
                      type="checkbox"
                      checked={paymentForm.enableCod}
                      onChange={(e) => setPaymentForm({ ...paymentForm, enableCod: e.target.checked })}
                      className="w-4 h-4 text-purple-600 rounded"
                    />
                    <span>Cash on Delivery</span>
                  </label>
                </div>
              </div>

              {/* Settlement Bank Account Details */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                  <Building className="w-4 h-4 text-slate-700" />
                  <h4 className="font-extrabold text-slate-900 text-sm">
                    Settlement Bank Account / सेटलमेंट बँक खाते तपशील
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                      Bank Name / बँकेचे नाव
                    </label>
                    <input
                      type="text"
                      value={paymentForm.bankName}
                      onChange={(e) => setPaymentForm({ ...paymentForm, bankName: e.target.value })}
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold outline-none focus:border-amber-600"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                      Account Holder / खातेदाराचे नाव
                    </label>
                    <input
                      type="text"
                      value={paymentForm.bankAccountName}
                      onChange={(e) => setPaymentForm({ ...paymentForm, bankAccountName: e.target.value })}
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold outline-none focus:border-amber-600"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                      Account Number / खाते क्रमांक
                    </label>
                    <input
                      type="text"
                      value={paymentForm.bankAccountNumber}
                      onChange={(e) => setPaymentForm({ ...paymentForm, bankAccountNumber: e.target.value })}
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold outline-none focus:border-amber-600"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                      IFSC Code / आयएफएससी कोड
                    </label>
                    <input
                      type="text"
                      value={paymentForm.bankIfsc}
                      onChange={(e) => setPaymentForm({ ...paymentForm, bankIfsc: e.target.value })}
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold outline-none focus:border-amber-600"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Live SMS & OTP Gateway Configuration */}
              <div className="p-5 bg-blue-50/70 rounded-2xl border border-blue-200 space-y-4">
                <div className="flex items-center justify-between border-b border-blue-200 pb-3">
                  <div className="flex items-center gap-2.5">
                    <Smartphone className="w-5 h-5 text-blue-700" />
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm">
                        Live Telecom SMS Gateway (मोबाईलवर प्रत्यक्ष SMS येण्यासाठी)
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Fast2SMS API Key जोडून थेट ग्राहकांच्या व ॲडमिनच्या सिम कार्डवर OTP पाठवा
                      </p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${
                    paymentForm.fast2smsApiKey 
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' 
                      : 'bg-amber-100 text-amber-900 border border-amber-300'
                  }`}>
                    {paymentForm.fast2smsApiKey ? '● Gateway Active' : '○ Offline Mode'}
                  </span>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-700 uppercase block mb-1">
                    Fast2SMS Authorization API Key
                  </label>
                  <input
                    type="password"
                    value={paymentForm.fast2smsApiKey || ''}
                    onChange={(e) => setPaymentForm({ ...paymentForm, fast2smsApiKey: e.target.value })}
                    placeholder="उदा. u2j83kf9abc123..."
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-mono text-xs outline-none focus:border-blue-600"
                  />
                  <div className="mt-2.5 p-3 bg-white rounded-xl border border-blue-100 text-[11px] text-slate-600 space-y-1.5">
                    <p className="font-bold text-blue-900">ही मोफत API Key कशी मिळवावी? (२ मिनिटांत):</p>
                    <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-700">
                      <li><strong>www.fast2sms.com</strong> वर जाऊन तुमच्या मोबाईल नंबरने मोफत साईन अप करा (मोफत टेस्ट क्रेडिट्स मिळतात).</li>
                      <li>लॉगिन झाल्यावर डाव्या मेनूमधील <strong>Dev API</strong> पर्यायावर क्लिक करा.</li>
                      <li>तिथे दिलेली तुमची <strong>Authorization Key</strong> कॉपी करून वरील बॉक्समध्ये पेस्ट करा आणि खाली सेव्ह करा.</li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Payment & Gateway Settings</span>
                </button>
              </div>
            </form>
          )}

        </div>
      </div>

      {/* ============================================================== */}
      {/* ADD / EDIT HERO BANNER MODAL (FOR PC & MOBILE)                */}
      {/* ============================================================== */}
      {isBannerModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-600 to-orange-600 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/20 backdrop-blur-xs rounded-xl">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-white">
                    {editingBannerIndex !== null 
                      ? 'बॅनर संपादन करा (Edit Hero Banner)' 
                      : 'नवीन मुख्य बॅनर जोडा (Add New Hero Banner)'}
                  </h3>
                  <p className="text-xs text-amber-100">
                    वेबसाईटच्या पहिल्या पानावर (Hero Slider) हा बॅनर सर्व ग्राहकांना दिसेल.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBannerModalOpen(false)}
                className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-colors cursor-pointer"
                title="बंद करा"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-6">

              {/* 1. Live Interactive Banner Preview */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-amber-600" />
                    <span>Live Banner Preview / प्रत्यक्ष वेबसाईटवर बॅनर कसा दिसेल:</span>
                  </span>
                  <span className="text-[11px] text-amber-700 font-bold bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                    Live Real-Time View
                  </span>
                </div>

                <div className={`relative w-full rounded-2xl overflow-hidden bg-gradient-to-r ${modalBannerForm.bgGradient || 'from-blue-900 via-indigo-900 to-slate-900'} text-white shadow-lg p-5 sm:p-7 border border-slate-700/50`}>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                    <div className="md:col-span-7 space-y-2.5">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400 text-slate-950 text-[11px] font-black rounded-full uppercase tracking-wider shadow-xs">
                        <Sparkles className="w-3 h-3" />
                        <span>{language === 'mr' ? (modalBannerForm.badgeMr || modalBannerForm.badge) : modalBannerForm.badge}</span>
                      </div>
                      <h4 className="text-lg sm:text-2xl font-black leading-tight text-white line-clamp-2">
                        {language === 'mr' ? (modalBannerForm.titleMr || modalBannerForm.title) : modalBannerForm.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-200 line-clamp-2 leading-relaxed">
                        {language === 'mr' ? (modalBannerForm.subtitleMr || modalBannerForm.subtitle) : modalBannerForm.subtitle}
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <span className="px-3.5 py-1.5 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-xs">
                          {modalBannerForm.cta1Text || 'Shop Deals'}
                        </span>
                        <span className="px-3.5 py-1.5 bg-white/20 text-white font-bold text-xs rounded-xl backdrop-blur-xs">
                          {modalBannerForm.cta2Text || 'Contact Us'}
                        </span>
                      </div>
                    </div>

                    <div className="md:col-span-5 flex justify-center">
                      <div className="relative w-full h-36 sm:h-44 rounded-xl overflow-hidden bg-slate-800/80 border-2 border-white/20 shadow-md">
                        <img
                          src={modalBannerForm.image}
                          alt="Banner preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=900&auto=format&fit=crop&q=80';
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Photo Upload Section (PC & Mobile) */}
              <div className="p-4 sm:p-5 bg-amber-50/70 rounded-2xl border-2 border-dashed border-amber-300 space-y-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                      <Camera className="w-4 h-4 text-amber-700" />
                      <span>बॅनरचा फोटो निवडा (PC / लॅपटॉप / फोनवरून अपलोड करा)</span>
                    </h4>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      तुमच्या कॉम्प्युटर, गॅलरी किंवा मोबाईल कॅमेऱ्यातून थेट फोटो निवडा:
                    </p>
                  </div>

                  <label className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow-md transition-all active:scale-95">
                    <Upload className="w-4 h-4" />
                    <span>📁 PC / फोनवरून फोटो निवडा (Choose File)</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleModalImageUpload}
                    />
                  </label>
                </div>

                {/* Or Web Image URL */}
                <div className="pt-2 border-t border-amber-200">
                  <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                    किंवा थेट वेब इमेज लिंक (URL) टाका:
                  </label>
                  <input
                    type="text"
                    value={modalBannerForm.image}
                    onChange={(e) => setModalBannerForm({ ...modalBannerForm, image: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono outline-none focus:border-amber-600"
                  />

                  {/* Quick Preset Buttons */}
                  <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">
                      झटपट रेडीमेड फोटो (Quick Presets):
                    </span>
                    <button
                      type="button"
                      onClick={() => setModalBannerForm({
                        ...modalBannerForm,
                        image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=900&auto=format&fit=crop&q=80',
                        title: 'Premium Laptops & Workstations',
                        titleMr: 'प्रीमियम लॅपटॉप्स व वर्कस्टेशन्स',
                      })}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-medium text-slate-700 cursor-pointer"
                    >
                      💻 Laptops
                    </button>
                    <button
                      type="button"
                      onClick={() => setModalBannerForm({
                        ...modalBannerForm,
                        image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=900&auto=format&fit=crop&q=80',
                        title: 'High Performance Gaming PCs',
                        titleMr: 'हाय-परफॉर्मन्स गेमिंग कॉम्प्युटर्स',
                      })}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-medium text-slate-700 cursor-pointer"
                    >
                      🎮 Gaming Rig
                    </button>
                    <button
                      type="button"
                      onClick={() => setModalBannerForm({
                        ...modalBannerForm,
                        image: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=900&auto=format&fit=crop&q=80',
                        title: 'All-in-One Printers & Cartridges',
                        titleMr: 'ऑल-इन-वन प्रिंटर्स व कार्ट्रिज',
                      })}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-medium text-slate-700 cursor-pointer"
                    >
                      🖨️ Printers
                    </button>
                    <button
                      type="button"
                      onClick={() => setModalBannerForm({
                        ...modalBannerForm,
                        image: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=900&auto=format&fit=crop&q=80',
                        title: 'HD CCTV Cameras & Security Setup',
                        titleMr: 'एचडी सीसीटीव्ही कॅमेरे व सुरक्षा प्रणाली',
                      })}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-medium text-slate-700 cursor-pointer"
                    >
                      📹 CCTV Cameras
                    </button>
                  </div>
                </div>
              </div>

              {/* 3. Headlines & Description (English & Marathi) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-extrabold text-xs uppercase text-slate-600 border-b border-slate-200 pb-1">
                    English Content (इंग्रजी माहिती)
                  </h4>
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                      Headline (English) *
                    </label>
                    <input
                      type="text"
                      value={modalBannerForm.title}
                      onChange={(e) => setModalBannerForm({ ...modalBannerForm, title: e.target.value })}
                      placeholder="उदा. Upgrade Your Technology with Vishvjeet Computer"
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-none focus:border-amber-600 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                      Subtitle / Description (English)
                    </label>
                    <textarea
                      rows={2}
                      value={modalBannerForm.subtitle}
                      onChange={(e) => setModalBannerForm({ ...modalBannerForm, subtitle: e.target.value })}
                      placeholder="उदा. Genuine Laptops, Desktops, Printers & CCTV Security..."
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-none focus:border-amber-600 focus:bg-white resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                      Offer Badge / Tag (English)
                    </label>
                    <input
                      type="text"
                      value={modalBannerForm.badge}
                      onChange={(e) => setModalBannerForm({ ...modalBannerForm, badge: e.target.value })}
                      placeholder="उदा. Special Festive Offer"
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-none focus:border-amber-600 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-extrabold text-xs uppercase text-slate-600 border-b border-slate-200 pb-1">
                    Marathi Content (मराठी माहिती)
                  </h4>
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                      मुख्य शीर्षक (मराठी) *
                    </label>
                    <input
                      type="text"
                      value={modalBannerForm.titleMr || ''}
                      onChange={(e) => setModalBannerForm({ ...modalBannerForm, titleMr: e.target.value })}
                      placeholder="उदा. विश्वजीत कॉम्प्युटरसह आपले तंत्रज्ञान अपग्रेड करा"
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-none focus:border-amber-600 focus:bg-white font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                      उपशीर्षक / माहिती (मराठी)
                    </label>
                    <textarea
                      rows={2}
                      value={modalBannerForm.subtitleMr || ''}
                      onChange={(e) => setModalBannerForm({ ...modalBannerForm, subtitleMr: e.target.value })}
                      placeholder="उदा. लॅपटॉप्स, डेस्कटॉप्स, प्रिंटर्स, सीसीटीव्ही सुरक्षा व दुरुस्ती सेवा..."
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-none focus:border-amber-600 focus:bg-white resize-none font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                      ऑफर टॅग (मराठी)
                    </label>
                    <input
                      type="text"
                      value={modalBannerForm.badgeMr || ''}
                      onChange={(e) => setModalBannerForm({ ...modalBannerForm, badgeMr: e.target.value })}
                      placeholder="उदा. खास सणासुदीची ऑफर"
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-none focus:border-amber-600 focus:bg-white font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Background Gradient Themes & CTA Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
                <div>
                  <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1.5">
                    Background Color Theme / बॅकग्राउंड रंग थीम:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { name: 'Tech Blue', gradient: 'from-blue-900 via-indigo-900 to-slate-900', color: 'bg-blue-900' },
                      { name: 'Royal Purple', gradient: 'from-purple-950 via-indigo-900 to-slate-950', color: 'bg-purple-900' },
                      { name: 'Cyber Emerald', gradient: 'from-emerald-950 via-teal-900 to-slate-950', color: 'bg-emerald-900' },
                      { name: 'Warm Amber', gradient: 'from-amber-950 via-orange-900 to-slate-950', color: 'bg-amber-900' },
                      { name: 'Dark Slate', gradient: 'from-slate-950 via-slate-900 to-zinc-950', color: 'bg-slate-900' },
                    ].map((g) => (
                      <button
                        key={g.gradient}
                        type="button"
                        onClick={() => setModalBannerForm({ ...modalBannerForm, bgGradient: g.gradient })}
                        className={`p-2 rounded-xl border text-left flex items-center gap-2 cursor-pointer transition-all ${
                          modalBannerForm.bgGradient === g.gradient
                            ? 'border-amber-600 bg-amber-50 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <span className={`w-4 h-4 rounded-full ${g.color} shrink-0 shadow-xs`} />
                        <span className="text-[11px] font-bold text-slate-700 truncate">{g.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1.5">
                    Button Action Labels / बटणांवरील मजकूर:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-500 block mb-0.5">बटन १ (Primary):</span>
                      <input
                        type="text"
                        value={modalBannerForm.cta1Text}
                        onChange={(e) => setModalBannerForm({ ...modalBannerForm, cta1Text: e.target.value })}
                        placeholder="Shop Hardware"
                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-none focus:border-amber-600 focus:bg-white"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block mb-0.5">बटन २ (Secondary):</span>
                      <input
                        type="text"
                        value={modalBannerForm.cta2Text}
                        onChange={(e) => setModalBannerForm({ ...modalBannerForm, cta2Text: e.target.value })}
                        placeholder="Book a Repair"
                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-none focus:border-amber-600 focus:bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsBannerModalOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                रद्द करा (Cancel)
              </button>

              <button
                type="button"
                onClick={handleSaveModalBanner}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-extrabold text-xs shadow-lg flex items-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>
                  {editingBannerIndex !== null 
                    ? 'बदल सेव्ह करा (Save Changes)' 
                    : '✅ बॅनर जोडा आणि सेव्ह करा (Save & Publish Banner)'}
                </span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
