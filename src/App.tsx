import React, { useState } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StoreProvider, useStore } from './context/StoreContext';
import { CartProvider, useCart } from './context/CartContext';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { CategoryBar } from './components/CategoryBar';
import { ProductList } from './components/ProductList';
import { ProductDetailsModal } from './components/ProductDetailsModal';
import { ProductCompareModal } from './components/ProductCompareModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderConfirmationModal } from './components/OrderConfirmationModal';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { InvoiceModal } from './components/InvoiceModal';
import { ServicesSection } from './components/ServicesSection';
import { BookServiceModal } from './components/BookServiceModal';
import { ServiceTrackingModal } from './components/ServiceTrackingModal';
import { AdminDashboard } from './components/AdminDashboard';
import { OwnerDashboard } from './components/OwnerDashboard';
import { FirstTimeLoginPage } from './components/FirstTimeLoginPage';
import { AuthModal } from './components/AuthModal';
import { CustomerAccountModal } from './components/CustomerAccountModal';
import { InfoPagesModal, InfoPageType } from './components/InfoPagesModal';
import { Footer } from './components/Footer';
import { BottomNavBar } from './components/BottomNavBar';
import { AndroidAppModal } from './components/AndroidAppModal';
import { Product, Order, ProductCategory, ServiceRequest } from './types';
import { ArrowLeftRight, CheckCircle2, Mail, Phone, MessageCircle, Smartphone, Sparkles, X, RefreshCw } from 'lucide-react';

function MainAppContent() {
  const { products, compareProducts, settings } = useStore();
  const { addItem } = useCart();
  const { language } = useLanguage();
  const { isFirstTimeLoginOpen, openFirstTimeLogin, isAuthenticated, authLoading, isAdmin, isOwner } = useAuth();

  // Navigation & Category state
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all' | 'deals_offers'>('all');

  // Modals state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [ownerModalOpen, setOwnerModalOpen] = useState(false);
  const [bookServiceOpen, setBookServiceOpen] = useState(false);
  const [preselectedServiceName, setPreselectedServiceName] = useState<string | undefined>(undefined);
  const [serviceTrackingOpen, setServiceTrackingOpen] = useState(false);
  const [orderTrackingOpen, setOrderTrackingOpen] = useState(false);
  const [trackingOrderId, setTrackingOrderId] = useState<string | undefined>(undefined);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [invoiceModalOrder, setInvoiceModalOrder] = useState<Order | null>(null);
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [activeInfoPage, setActiveInfoPage] = useState<InfoPageType | null>(null);
  const [androidModalOpen, setAndroidModalOpen] = useState(false);
  const [isMobileSimulator, setIsMobileSimulator] = useState(false);
  const [showAppBanner, setShowAppBanner] = useState(true);

  // Quick Notification Banner
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotificationMsg(msg);
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  const handleSelectCategory = (cat: ProductCategory | 'all' | 'deals_offers' | 'services') => {
    if (cat === 'services') {
      const servicesElement = document.getElementById('services-section');
      if (servicesElement) {
        servicesElement.scrollIntoView({ behavior: 'smooth' });
      } else {
        setBookServiceOpen(true);
      }
    } else {
      setSelectedCategory(cat);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleQuickBuy = (product: Product) => {
    if (!isAuthenticated) {
      openFirstTimeLogin();
      return;
    }
    addItem(product, 1);
    setCheckoutModalOpen(true);
  };

  const handleOpenCustomerAccount = () => {
    if (!isAuthenticated) {
      openFirstTimeLogin();
      return;
    }
    setAccountModalOpen(true);
  };

  const handleOpenAdminConsole = () => {
    if (!isAuthenticated) {
      openFirstTimeLogin();
      return;
    }
    if (!isAdmin) {
      showNotification('Access denied: Admin privileges required.');
      return;
    }
    setAdminModalOpen(true);
  };

  const handleOpenOwnerConsole = () => {
    if (!isAuthenticated) {
      openFirstTimeLogin();
      return;
    }
    if (!isOwner && !isAdmin) {
      showNotification('Access denied: Store Owner privileges required.');
      return;
    }
    setOwnerModalOpen(true);
  };

  const handleOrderSuccess = (order: Order) => {
    setConfirmedOrder(order);
  };

  const handleBookServiceSuccess = (ticket: ServiceRequest) => {
    setBookServiceOpen(false);
    showNotification(`Service Ticket ${ticket.ticketNumber} created successfully! Our technician will call you shortly.`);
    setServiceTrackingOpen(true);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#f1f3f6] flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8 max-w-sm w-full space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#2874f0] text-white flex items-center justify-center mx-auto shadow-md">
            <RefreshCw className="w-6 h-6 animate-spin" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900">VishwaJit Computers</h2>
            <p className="text-xs text-slate-500 mt-1">
              Restoring your verified Firebase session...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Main UI Tree
  const appContent = (
    <div className="min-h-screen flex flex-col bg-[#f1f3f6] text-slate-800">
      {/* Toast Notification */}
      {notificationMsg && (
        <div className="fixed top-16 right-4 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-bold border border-slate-700 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notificationMsg}</span>
        </div>
      )}


      {/* Flipkart-Style Mobile App Promotion Banner */}
      {showAppBanner && (
        <div className="bg-gradient-to-r from-blue-900 via-[#2874f0] to-indigo-900 text-white px-3 py-1.5 text-xs flex items-center justify-between gap-2 shadow-xs border-b border-blue-400/40">
          <div className="flex items-center gap-2 min-w-0">
            <span className="p-1 bg-yellow-400 text-slate-900 rounded font-black text-[10px]">
              <Smartphone className="w-3.5 h-3.5" />
            </span>
            <span className="font-semibold truncate">
              {language === 'mr' 
                ? 'अधिक जलद अनुभवासाठी विश्‍वजीत कॉम्प्युटर अँड्रॉइड ॲप वापरा!' 
                : 'Experience the Vishvjeet Computer Mobile App on Android & Play Store!'}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setAndroidModalOpen(true)}
              className="px-2.5 py-0.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black rounded text-[11px] transition-all shadow-xs"
            >
              {language === 'mr' ? 'ॲप मिळवा' : 'GET APP'}
            </button>
            <button
              onClick={() => setShowAppBanner(false)}
              className="text-white/70 hover:text-white p-0.5"
              aria-label="Dismiss banner"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Flipkart-Style Header */}
      <Header
        onSelectCategory={handleSelectCategory}
        selectedCategory={selectedCategory}
        onOpenCart={() => setCartDrawerOpen(true)}
        onOpenAuth={openFirstTimeLogin}
        onOpenAccount={handleOpenCustomerAccount}
        onOpenAdmin={handleOpenAdminConsole}
        onOpenOwner={handleOpenOwnerConsole}
        onOpenServices={() => {
          const srvElem = document.getElementById('services-section');
          if (srvElem) srvElem.scrollIntoView({ behavior: 'smooth' });
          else setBookServiceOpen(true);
        }}
        onOpenTrackOrder={() => {
          if (!isAuthenticated) {
            openFirstTimeLogin();
            return;
          }
          setTrackingOrderId(undefined);
          setOrderTrackingOpen(true);
        }}
        onSelectProduct={(p) => setSelectedProduct(p)}
        onOpenAndroidAppModal={() => setAndroidModalOpen(true)}
      />

      <main className="flex-1 pb-16 md:pb-6">
        {/* Flipkart White Category Bar */}
        <CategoryBar
          onSelectCategory={handleSelectCategory}
          selectedCategory={selectedCategory}
          onOpenAndroidAppModal={() => setAndroidModalOpen(true)}
        />

        {/* Promotional Hero Banner */}
        {(selectedCategory === 'all' || selectedCategory === 'deals_offers') && (
          <HeroBanner
            onShopNow={() => {
              const listElem = document.getElementById('product-catalogue');
              if (listElem) listElem.scrollIntoView({ behavior: 'smooth' });
            }}
            onBookService={() => setBookServiceOpen(true)}
            onViewDeals={() => setSelectedCategory('deals_offers')}
          />
        )}

        {/* Products Catalogue & Flipkart Deals Shelf */}
        <section id="product-catalogue">
          <ProductList
            products={products}
            currentCategory={selectedCategory}
            onSelectProduct={(p) => setSelectedProduct(p)}
            onQuickBuy={handleQuickBuy}
            onViewAllDeals={() => setSelectedCategory('deals_offers')}
          />
        </section>

        {/* Computer Repair & IT Services Section */}
        <div id="services-section">
          <ServicesSection
            onBookService={(serviceName) => {
              setPreselectedServiceName(serviceName);
              setBookServiceOpen(true);
            }}
            onTrackService={() => setServiceTrackingOpen(true)}
          />
        </div>

        {/* Store Contact Showcase (Customer Info with phone 89566 64295 & email vishwajeetnanhai199@gmail.com) */}
        <div className="max-w-7xl mx-auto px-4 my-8">
          <div className="bg-gradient-to-r from-blue-900 via-[#2874f0] to-blue-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-blue-500/30">
            <div className="space-y-2 text-center md:text-left">
              <span className="px-3 py-1 rounded-full bg-yellow-400 text-slate-950 font-black text-[11px] uppercase tracking-wider inline-block">
                Direct Store Support
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Vishvjeet Computer • Chikhli (Buldhana)
              </h3>
              <p className="text-blue-100 text-xs sm:text-sm max-w-xl">
                Need product advice, price quotation, or urgent computer repair support? Reach out directly via phone, WhatsApp, or email!
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
              {/* Phone */}
              <a
                href={`tel:${settings.phone.replace(/\s+/g, '')}`}
                className="flex items-center gap-2 px-4 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 rounded-xl text-xs sm:text-sm font-black shadow-md transition-all"
                title="Call Now"
              >
                <Phone className="w-4 h-4 shrink-0" />
                <span>{settings.phone}</span>
              </a>

              {/* WhatsApp */}
              <a
                href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs sm:text-sm font-black shadow-md transition-all"
                title="Chat on WhatsApp"
              >
                <MessageCircle className="w-4 h-4 shrink-0" />
                <span>WhatsApp</span>
              </a>

              {/* Email (Kept in Store Support Showcase & Footer, removed from Navbar as requested) */}
              <a
                href={`mailto:${settings.email}`}
                className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-100 text-blue-950 rounded-xl text-xs sm:text-sm font-black shadow-md transition-all font-mono"
                title="Send Email"
              >
                <Mail className="w-4 h-4 text-[#2874f0] shrink-0" />
                <span>{settings.email}</span>
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Bottom Comparison Tray */}
      {compareProducts.length > 0 && (
        <div className="fixed bottom-16 md:bottom-4 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-white px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-3 border border-slate-700">
          <span className="text-xs font-bold text-yellow-400">
            {compareProducts.length} Product(s) Selected for Compare
          </span>
          <button
            onClick={() => setCompareModalOpen(true)}
            className="px-3 py-1 bg-[#2874f0] hover:bg-blue-600 text-white rounded-full text-xs font-bold flex items-center gap-1"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Compare Now</span>
          </button>
        </div>
      )}

      {/* Flipkart Mobile App Bottom Navigation Bar */}
      <BottomNavBar
        activeCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
        onOpenCart={() => setCartDrawerOpen(true)}
        onOpenAccount={handleOpenCustomerAccount}
        onOpenServices={() => {
          const srvElem = document.getElementById('services-section');
          if (srvElem) srvElem.scrollIntoView({ behavior: 'smooth' });
          else setBookServiceOpen(true);
        }}
        onOpenAndroidModal={() => setAndroidModalOpen(true)}
      />

      {/* Flipkart Styled Footer */}
      <Footer
        onOpenPage={(p: InfoPageType) => setActiveInfoPage(p)}
        onSelectCategory={handleSelectCategory}
        onOpenServices={() => {
          const srvElem = document.getElementById('services-section');
          if (srvElem) srvElem.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenTrackOrder={() => {
          if (!isAuthenticated) {
            openFirstTimeLogin();
            return;
          }
          setTrackingOrderId(undefined);
          setOrderTrackingOpen(true);
        }}
        onOpenOwner={handleOpenOwnerConsole}
        onOpenAdmin={handleOpenAdminConsole}
        onOpenLogin={openFirstTimeLogin}
      />

      {/* --- ALL MODALS --- */}

      {/* 0. Flipkart Style Real Firebase Mobile OTP Login Gate */}
      {(!isAuthenticated || isFirstTimeLoginOpen) && (
        <FirstTimeLoginPage
          onSuccess={() => {
            showNotification('Mobile number verified! Welcome to VishwaJit Computers.');
          }}
        />
      )}

      {/* 1. Android App & Play Store Builder Center */}
      <AndroidAppModal
        isOpen={androidModalOpen}
        onClose={() => setAndroidModalOpen(false)}
        onToggleMobileSimulator={() => {
          setIsMobileSimulator(!isMobileSimulator);
          setAndroidModalOpen(false);
        }}
        isMobileSimulatorActive={isMobileSimulator}
      />

      {/* 2. Product Details Modal */}
      {selectedProduct && (
        <ProductDetailsModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onQuickBuy={(p) => {
            setSelectedProduct(null);
            handleQuickBuy(p);
          }}
          onSelectRelatedProduct={(rel) => setSelectedProduct(rel)}
        />
      )}

      {/* 3. Product Compare Modal */}
      {compareModalOpen && (
        <ProductCompareModal onClose={() => setCompareModalOpen(false)} />
      )}

      {/* 4. Shopping Cart Drawer */}
      <CartDrawer
        isOpen={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
        onProceedToCheckout={() => {
          if (!isAuthenticated) {
            openFirstTimeLogin();
            return;
          }
          setCheckoutModalOpen(true);
        }}
        onStartShopping={() => {
          const catElem = document.getElementById('product-catalogue');
          if (catElem) catElem.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* 5. Multi-step Checkout Modal (Customer-Protected) */}
      {isAuthenticated && (
        <CheckoutModal
          isOpen={checkoutModalOpen}
          onClose={() => setCheckoutModalOpen(false)}
          onOrderSuccess={handleOrderSuccess}
        />
      )}

      {/* 6. Order Confirmation Celebratory Modal */}
      {confirmedOrder && (
        <OrderConfirmationModal
          order={confirmedOrder}
          onClose={() => setConfirmedOrder(null)}
          onViewInvoice={() => setInvoiceModalOrder(confirmedOrder)}
          onTrackOrder={() => {
            setTrackingOrderId(confirmedOrder.orderNumber);
            setConfirmedOrder(null);
            setOrderTrackingOpen(true);
          }}
        />
      )}

      {/* 7. Tax Invoice Modal (Full view and downloadable PDF) */}
      {invoiceModalOrder && (
        <InvoiceModal
          order={invoiceModalOrder}
          onClose={() => setInvoiceModalOrder(null)}
        />
      )}

      {/* 8. Order Tracking Modal (Customer-Protected) */}
      {isAuthenticated && orderTrackingOpen && (
        <OrderTrackingModal
          initialOrderId={trackingOrderId}
          onClose={() => setOrderTrackingOpen(false)}
          onViewInvoice={(ord) => setInvoiceModalOrder(ord)}
        />
      )}

      {/* 9. Book Repair Service Modal */}
      <BookServiceModal
        isOpen={bookServiceOpen}
        preselectedService={preselectedServiceName}
        onClose={() => setBookServiceOpen(false)}
        onSuccess={handleBookServiceSuccess}
      />

      {/* 10. Service Ticket Tracking Modal */}
      {serviceTrackingOpen && (
        <ServiceTrackingModal
          onClose={() => setServiceTrackingOpen(false)}
          onBookNewService={() => {
            setServiceTrackingOpen(false);
            setBookServiceOpen(true);
          }}
        />
      )}

      {/* 11. Admin Management Dashboard (Admin-Protected) */}
      {isAuthenticated && isAdmin && adminModalOpen && (
        <AdminDashboard
          onClose={() => setAdminModalOpen(false)}
          onViewInvoice={(ord) => setInvoiceModalOrder(ord)}
        />
      )}

      {/* 11.5 Owner Control Dashboard (Owner/Admin-Protected) */}
      {isAuthenticated && (isOwner || isAdmin) && ownerModalOpen && (
        <OwnerDashboard
          onClose={() => setOwnerModalOpen(false)}
        />
      )}

      {/* 12. Customer Account Profile Modal (Customer-Protected) */}
      {isAuthenticated && (
        <CustomerAccountModal
          isOpen={accountModalOpen}
          onClose={() => setAccountModalOpen(false)}
          onViewInvoice={(ord) => setInvoiceModalOrder(ord)}
          onTrackOrder={(ordId) => {
            setAccountModalOpen(false);
            setTrackingOrderId(ordId);
            setOrderTrackingOpen(true);
          }}
          onSelectProduct={(p) => {
            setAccountModalOpen(false);
            setSelectedProduct(p);
          }}
          onOpenAdmin={() => {
            setAccountModalOpen(false);
            handleOpenAdminConsole();
          }}
          onOpenOwner={() => {
            setAccountModalOpen(false);
            handleOpenOwnerConsole();
          }}
        />
      )}

      {/* 13. Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => {
          showNotification('Successfully authenticated!');
        }}
      />

      {/* 14. Information & Policies Modal */}
      <InfoPagesModal
        page={activeInfoPage}
        onClose={() => setActiveInfoPage(null)}
        onBookService={() => {
          setActiveInfoPage(null);
          setBookServiceOpen(true);
        }}
      />
    </div>
  );

  // If Mobile Simulator is active, render inside a smartphone frame
  if (isMobileSimulator) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-2 sm:p-4">
        {/* Simulator Control Bar */}
        <div className="w-full max-w-sm mb-3 flex items-center justify-between text-white text-xs px-2">
          <div className="flex items-center gap-1.5 font-bold">
            <Smartphone className="w-4 h-4 text-yellow-400" />
            <span>Android Phone Simulator</span>
          </div>
          <button
            onClick={() => setIsMobileSimulator(false)}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-amber-300 font-bold"
          >
            Exit Phone Frame
          </button>
        </div>

        {/* Android Device Mockup */}
        <div className="w-full max-w-sm h-[850px] bg-black rounded-[48px] p-3 shadow-2xl border-4 border-slate-700 flex flex-col relative overflow-hidden">
          {/* Speaker / Camera Notch */}
          <div className="w-28 h-4 bg-slate-900 rounded-full mx-auto mb-2 shrink-0 flex items-center justify-center">
            <div className="w-2.5 h-2.5 bg-slate-800 rounded-full"></div>
          </div>

          {/* Android Status Bar */}
          <div className="h-6 bg-[#1f5ec4] text-white flex items-center justify-between px-4 text-[10px] font-mono shrink-0">
            <span>12:00</span>
            <div className="flex items-center gap-1.5">
              <span>5G</span>
              <span>100%</span>
            </div>
          </div>

          {/* Screen Content */}
          <div className="flex-1 overflow-y-auto bg-[#f1f3f6] rounded-b-[36px]">
            {appContent}
          </div>
        </div>
      </div>
    );
  }

  return appContent;
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <StoreProvider>
          <CartProvider>
            <MainAppContent />
          </CartProvider>
        </StoreProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
