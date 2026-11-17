import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ShieldCheck, Sparkles, ArrowRight, Wrench } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useStore } from '../context/StoreContext';

interface HeroBannerProps {
  onShopNow: () => void;
  onBookService: () => void;
  onViewDeals: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onShopNow,
  onBookService,
  onViewDeals,
}) => {
  const { t, language } = useLanguage();
  const { settings } = useStore();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      badge: language === 'mr' ? 'चिखलीतील अधिकृत आयटी दालन' : 'Authorized Technology Hub • Chikhli',
      title: language === 'mr' ? 'विश्वजीत कॉम्प्युटरसह आपले तंत्रज्ञान अपग्रेड करा' : 'Upgrade Your Technology with Vishvjeet Computer',
      subtitle: language === 'mr' 
        ? 'लॅपटॉप्स, डेस्कटॉप्स, प्रिंटर्स, सीसीटीव्ही सुरक्षा व तज्ज्ञ हार्डवेअर दुरुस्ती सेवा.' 
        : 'Genuine Laptops, Custom Workstations, Printers, CCTV Security & Expert Local IT Services in Chikhli, Buldhana.',
      cta1Text: language === 'mr' ? 'आता खरेदी करा' : 'Shop Hardware',
      cta2Text: language === 'mr' ? 'दुरुस्ती सेवा बुक करा' : 'Book a Repair',
      bgGradient: 'from-blue-900 via-blue-800 to-indigo-950',
      image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=900&auto=format&fit=crop&q=80',
    },
    {
      id: 2,
      badge: language === 'mr' ? 'सर्वोत्तम किमतीत ब्रँडेड लॅपटॉप्स' : 'Business & Student Laptops from ₹18,990',
      title: language === 'mr' ? 'एचपी, डेल, लेनोवोचे अस्सल लॅपटॉप्स' : 'HP, Dell, Lenovo & Custom Assembled PCs',
      subtitle: language === 'mr'
        ? 'प्रत्येक लॅपटॉपसोबत ओरिजिनल बिल, ब्रँड वॉरंटी आणि चिखली स्टोअरकडून मोफत १ वर्ष सर्व्हिस सपोर्ट.'
        : 'Backed by 100% Genuine Brand Warranty and lifetime local software support from our Chikhli technicians.',
      cta1Text: language === 'mr' ? 'लॅपटॉप्स पहा' : 'Explore Laptops',
      cta2Text: language === 'mr' ? 'खास ऑफर्स' : "Today's Deals",
      bgGradient: 'from-slate-900 via-indigo-900 to-blue-950',
      image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=900&auto=format&fit=crop&q=80',
    },
    {
      id: 3,
      badge: language === 'mr' ? 'चिखलीत व्यावसायिक कॉम्प्युटर रिपेअर' : 'Fast Chip-Level Laptop & Printer Repair',
      title: language === 'mr' ? 'संथ झालेला लॅपटॉप करा १० पट जलद!' : 'Make Your Slow Laptop 10x Faster with SSD',
      subtitle: language === 'mr'
        ? 'मदरबोर्ड रिपेअर, एसएसडी व रॅम अपग्रेड, विंडोज इन्स्टॉलेशन आणि टोनर रिफिलिंग — एकाच छताखाली.'
        : 'Expert motherboard repair, Crucial SSD upgrades, toner refill, and CCTV surveillance fitting by certified engineers.',
      cta1Text: language === 'mr' ? 'सर्व्हिस तिकीट बुक करा' : 'Book Inspection',
      cta2Text: language === 'mr' ? 'उत्पादने पहा' : 'View Supplies',
      bgGradient: 'from-blue-950 via-slate-900 to-sky-950',
      image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=900&auto=format&fit=crop&q=80',
    },
  ];

  const activeSlides = (settings.heroBanners && settings.heroBanners.length > 0)
    ? settings.heroBanners.map(b => ({
        id: b.id,
        badge: language === 'mr' ? (b.badgeMr || b.badge) : b.badge,
        title: language === 'mr' ? (b.titleMr || b.title) : b.title,
        subtitle: language === 'mr' ? (b.subtitleMr || b.subtitle) : b.subtitle,
        cta1Text: b.cta1Text || (language === 'mr' ? 'आता खरेदी करा' : 'Shop Hardware'),
        cta2Text: b.cta2Text || (language === 'mr' ? 'दुरुस्ती सेवा बुक करा' : 'Book a Repair'),
        bgGradient: b.bgGradient || 'from-blue-900 via-blue-800 to-indigo-950',
        image: b.image,
      }))
    : slides;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [activeSlides.length]);

  const slide = activeSlides[currentSlide % activeSlides.length] || activeSlides[0];

  return (
    <div className="relative overflow-hidden bg-slate-950 text-white rounded-2xl md:rounded-3xl shadow-xl my-2.5 sm:my-4 mx-2.5 sm:mx-4 max-w-7xl lg:mx-auto">
      <div className={`relative min-h-[260px] sm:min-h-[360px] md:min-h-[440px] flex items-center bg-gradient-to-r ${slide.bgGradient} transition-all duration-700 px-10 py-6 sm:p-10 md:p-12`}>
        {/* Decorative Grid Overlay */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>

        <div className="relative z-10 grid md:grid-cols-12 gap-6 md:gap-8 items-center w-full">
          {/* Left Text */}
          <div className="md:col-span-7 space-y-3 sm:space-y-4">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-amber-300 text-[10px] sm:text-xs font-bold tracking-wide uppercase">
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              <span className="line-clamp-1">{slide.badge}</span>
            </div>

            <h1 className="text-xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-snug text-white drop-shadow-sm">
              {slide.title}
            </h1>

            <p className="text-slate-300 text-xs sm:text-base leading-relaxed max-w-xl line-clamp-3 sm:line-clamp-none">
              {slide.subtitle}
            </p>

            <div className="flex flex-wrap gap-2.5 sm:gap-3 pt-1 sm:pt-2">
              <button
                onClick={onShopNow}
                className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm shadow-lg shadow-amber-500/25 transition-all transform active:scale-95"
              >
                <span>{slide.cta1Text}</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>

              <button
                onClick={onBookService}
                className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/25 text-white font-semibold rounded-xl text-xs sm:text-sm transition-all"
              >
                <Wrench className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300" />
                <span>{slide.cta2Text}</span>
              </button>
            </div>

            {/* Micro Trust Proof */}
            <div className="flex items-center gap-3 sm:gap-4 text-[11px] sm:text-xs text-slate-300 pt-2 border-t border-white/10">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
                {t('badgeGenuine')}
              </span>
              <span className="hidden sm:inline text-white/30">•</span>
              <span className="hidden sm:flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                Chikhli Buldhana Local Store
              </span>
            </div>
          </div>

          {/* Right Image Display */}
          <div className="hidden md:flex md:col-span-5 justify-center relative">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-blue-500 rounded-2xl blur-lg opacity-40 group-hover:opacity-75 transition duration-500"></div>
              <img
                src={slide.image}
                alt={slide.title}
                className="relative rounded-2xl shadow-2xl object-cover h-64 lg:h-72 w-96 border border-white/15"
              />
            </div>
          </div>
        </div>

        {/* Carousel Navigation Buttons */}
        <button
          onClick={() => setCurrentSlide((prev) => (prev === 0 ? activeSlides.length - 1 : prev - 1))}
          className="absolute left-1.5 sm:left-3 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 rounded-full bg-black/30 hover:bg-black/60 text-white backdrop-blur-sm transition-colors"
          aria-label="Previous Slide"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % activeSlides.length)}
          className="absolute right-1.5 sm:right-3 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 rounded-full bg-black/30 hover:bg-black/60 text-white backdrop-blur-sm transition-colors"
          aria-label="Next Slide"
        >
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Carousel Dots */}
        <div className="absolute bottom-2.5 sm:bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {activeSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-1.5 rounded-full transition-all ${
                idx === currentSlide % activeSlides.length ? 'w-6 bg-amber-400' : 'w-2 bg-white/40'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
