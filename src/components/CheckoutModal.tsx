import React, { useState } from 'react';
import { 
  X, 
  Check, 
  MapPin, 
  CreditCard, 
  Truck, 
  Building2, 
  ShieldCheck, 
  ArrowRight, 
  ArrowLeft,
  Banknote,
  QrCode,
  Smartphone
} from 'lucide-react';

import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { RazorpayModal } from './RazorpayModal';
import { formatINR } from '../utils/formatters';
import { ShippingAddress, PaymentMethod, Order } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onOrderSuccess,
}) => {
  const { items, subtotal, discountAmount, shippingFee, taxAmount, totalAmount, appliedCoupon, clearCart } = useCart();
  const { placeOrder, settings, currentPincode } = useStore();
  const { user } = useAuth();
  const { language, t } = useLanguage();

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Step 1: Customer Contact
  const [fullName, setFullName] = useState(user?.name || '');
  const [mobile, setMobile] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');

  // Step 2: Address
  const defaultAddress = user?.addresses[0];
  const [flatBuilding, setFlatBuilding] = useState(defaultAddress?.flatBuilding || '');
  const [streetArea, setStreetArea] = useState(defaultAddress?.streetArea || '');
  const [city, setCity] = useState(defaultAddress?.city || 'Chikhli');
  const [district, setDistrict] = useState(defaultAddress?.district || 'Buldhana');
  const [state, setState] = useState(defaultAddress?.state || 'Maharashtra');
  const [pincode, setPincode] = useState(defaultAddress?.pincode || currentPincode || '443201');
  const [landmark, setLandmark] = useState(defaultAddress?.landmark || '');

  // Step 3: Delivery Method
  const [deliveryMethod, setDeliveryMethod] = useState<'standard_shipping' | 'store_pickup'>('standard_shipping');

  // Step 4: Payment Method
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('razorpay');

  // Step 5: Terms agreement
  const [agreedTerms, setAgreedTerms] = useState(true);

  // Razorpay Modal state
  const [showRazorpayModal, setShowRazorpayModal] = useState(false);
  const [pendingOrderNumber, setPendingOrderNumber] = useState('');

  if (!isOpen) return null;

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 5) {
      setStep((step + 1) as any);
    }
  };

  const currentShippingAddress: ShippingAddress = {
    fullName,
    mobile,
    email,
    flatBuilding,
    streetArea,
    city,
    district,
    state,
    pincode,
    landmark,
  };

  const handleConfirmAndPay = () => {
    if (!agreedTerms) return;

    const tempOrderNum = `VC-ORD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    if (paymentMethod === 'razorpay' || paymentMethod === 'upi' || paymentMethod === 'card' || paymentMethod === 'netbanking') {
      setPendingOrderNumber(tempOrderNum);
      setShowRazorpayModal(true);
    } else {
      // Cash on Delivery
      const order = placeOrder({
        userId: user?.id,
        customerName: fullName,
        customerPhone: mobile,
        customerEmail: email,
        shippingAddress: currentShippingAddress,
        deliveryMethod,
        items,
        subtotal,
        discount: discountAmount,
        couponCode: appliedCoupon?.code,
        shippingFee: deliveryMethod === 'store_pickup' ? 0 : shippingFee,
        taxAmount,
        totalAmount: deliveryMethod === 'store_pickup' ? (totalAmount - shippingFee) : totalAmount,
        paymentMethod: 'cod',
        paymentStatus: 'pending',
        orderStatus: 'placed',
        estimatedDeliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      });

      clearCart();
      onClose();
      onOrderSuccess(order);
    }
  };

  const handleRazorpaySuccess = (paymentId: string, razorpayOrderId: string) => {
    setShowRazorpayModal(false);

    const order = placeOrder({
      userId: user?.id,
      customerName: fullName,
      customerPhone: mobile,
      customerEmail: email,
      shippingAddress: currentShippingAddress,
      deliveryMethod,
      items,
      subtotal,
      discount: discountAmount,
      couponCode: appliedCoupon?.code,
      shippingFee: deliveryMethod === 'store_pickup' ? 0 : shippingFee,
      taxAmount,
      totalAmount: deliveryMethod === 'store_pickup' ? (totalAmount - shippingFee) : totalAmount,
      paymentMethod: paymentMethod === 'cod' ? 'cod' : paymentMethod,
      paymentStatus: 'paid',
      paymentId,
      razorpayOrderId,
      orderStatus: 'confirmed',
      estimatedDeliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });

    clearCart();
    onClose();
    onOrderSuccess(order);
  };


  const stepsList = [
    { num: 1, label: t('stepContact') },
    { num: 2, label: t('stepAddress') },
    { num: 3, label: t('stepMethod') },
    { num: 4, label: t('stepPayment') },
    { num: 5, label: t('stepReview') },
  ];

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
        <div className="relative bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-6 max-h-[92vh]">
          {/* Header */}
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                {t('checkoutTitle')}
              </h2>
              <p className="text-xs text-slate-500">
                Vishvjeet Computer • Chikhli, Buldhana
              </p>
            </div>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200 text-slate-500">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stepper Progress */}
          <div className="px-6 py-3 bg-white border-b border-slate-100 flex items-center justify-between text-[11px] overflow-x-auto scrollbar-none">
            {stepsList.map((s, idx) => (
              <div key={s.num} className="flex items-center shrink-0">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                    step === s.num
                      ? 'bg-blue-700 text-white'
                      : step > s.num
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {step > s.num ? <Check className="w-3.5 h-3.5" /> : s.num}
                </div>
                <span
                  className={`ml-1.5 font-bold hidden sm:inline ${
                    step === s.num ? 'text-blue-900' : 'text-slate-500'
                  }`}
                >
                  {s.label.split('.')[1] || s.label}
                </span>
                {idx < stepsList.length - 1 && (
                  <div className="w-4 sm:w-8 h-0.5 bg-slate-200 mx-2"></div>
                )}
              </div>
            ))}
          </div>

          {/* Step Form Body */}
          <div className="p-6 overflow-y-auto flex-1">
            {/* Step 1: Contact Details */}
            {step === 1 && (
              <form onSubmit={handleNextStep} className="space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900 mb-2">
                  {t('stepContact')}
                </h3>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {t('fullName')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Ramesh Patil"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {t('mobileNumber')} *
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-slate-300 bg-slate-50 text-slate-500 text-xs font-bold">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      pattern="[0-9]{10}"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="10 digit mobile number"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-r-xl text-xs font-semibold text-slate-900 outline-none focus:border-blue-600 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {t('emailAddress')} *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@gmail.com"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-blue-600"
                  />
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                  >
                    <span>Continue to Address</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* Step 2: Delivery Address */}
            {step === 2 && (
              <form onSubmit={handleNextStep} className="space-y-4">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="text-sm font-extrabold text-slate-900">
                    {t('stepAddress')}
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setCity('Chikhli');
                      setDistrict('Buldhana');
                      setState('Maharashtra');
                      setPincode('443201');
                    }}
                    className="text-[11px] font-bold text-blue-700 hover:underline"
                  >
                    Quick Fill Chikhli (443201)
                  </button>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {t('flatHouse')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={flatBuilding}
                    onChange={(e) => setFlatBuilding(e.target.value)}
                    placeholder="House/Shop No., Apartment/Building Name"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {t('areaStreet')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={streetArea}
                    onChange={(e) => setStreetArea(e.target.value)}
                    placeholder="Street, Main Road, Colony, Area"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-blue-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      {t('townCity')} *
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Chikhli"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      {t('district')} *
                    </label>
                    <input
                      type="text"
                      required
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      placeholder="Buldhana"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-blue-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      {t('pincode')} *
                    </label>
                    <input
                      type="text"
                      required
                      pattern="[0-9]{6}"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="443201"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-blue-600 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      {t('state')} *
                    </label>
                    <input
                      type="text"
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-blue-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {t('landmark')}
                  </label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder="Near SBI Bank, Behind Bus Stand, etc."
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-blue-600"
                  />
                </div>

                <div className="pt-4 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                  >
                    <span>Delivery Method</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: Delivery Method */}
            {step === 3 && (
              <form onSubmit={handleNextStep} className="space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900 mb-2">
                  {t('stepMethod')}
                </h3>

                <div className="space-y-3">
                  <label
                    className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                      deliveryMethod === 'standard_shipping'
                        ? 'border-blue-600 bg-blue-50/50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="delivery_mode"
                      checked={deliveryMethod === 'standard_shipping'}
                      onChange={() => setDeliveryMethod('standard_shipping')}
                      className="mt-0.5 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <div className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                        <Truck className="w-4 h-4 text-blue-700" />
                        <span>{t('deliveryStandard')}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        Dispatched from Chikhli center. Delivered to your doorstep with tracking.
                      </div>
                      <div className="text-xs font-bold text-blue-700 mt-1">
                        {shippingFee === 0 ? 'FREE Delivery' : formatINR(shippingFee)}
                      </div>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                      deliveryMethod === 'store_pickup'
                        ? 'border-blue-600 bg-blue-50/50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="delivery_mode"
                      checked={deliveryMethod === 'store_pickup'}
                      onChange={() => setDeliveryMethod('store_pickup')}
                      className="mt-0.5 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <div className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-emerald-700" />
                        <span>{t('pickupStore')}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        Collect directly from {settings.address}. Ready within 2 hours.
                      </div>
                      <div className="text-xs font-bold text-emerald-700 mt-1">
                        FREE Store Pickup
                      </div>
                    </div>
                  </label>
                </div>

                <div className="pt-4 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                  >
                    <span>Payment Method</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* Step 4: Payment Method */}
            {step === 4 && (
              <form onSubmit={handleNextStep} className="space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900 mb-2">
                  {t('stepPayment')}
                </h3>

                <div className="space-y-3">
                  {/* UPI Instant Option */}
                  <label
                    className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                      paymentMethod === 'upi'
                        ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-500'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="pay_mode"
                      checked={paymentMethod === 'upi'}
                      onChange={() => setPaymentMethod('upi')}
                      className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div className="flex-1">
                      <div className="font-extrabold text-xs text-slate-900 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <QrCode className="w-4 h-4 text-emerald-700" />
                          <span>Direct UPI PG (0% Transaction Fee)</span>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                          0% Fee • Direct Bank Transfer
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        Free Direct UPI: Scan QR with GPay, PhonePe, Paytm, or BHIM. 100% of amount goes directly to Vishvjeet Computer (89566 64295) with ZERO gateway cuts.
                      </div>
                    </div>
                  </label>

                  {/* Razorpay Online Cards & NetBanking */}
                  <label
                    className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                      paymentMethod === 'razorpay'
                        ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-500'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="pay_mode"
                      checked={paymentMethod === 'razorpay'}
                      onChange={() => setPaymentMethod('razorpay')}
                      className="mt-0.5 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="font-extrabold text-xs text-slate-900 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <CreditCard className="w-4 h-4 text-blue-700" />
                          <span>Debit / Credit Cards & NetBanking</span>
                        </div>
                        <span className="text-[10px] font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full">
                          RBI & PCI-DSS Verified
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        RuPay, Visa, MasterCard, SBI, HDFC, ICICI, Bank of Maharashtra & 50+ Banks.
                      </div>
                    </div>
                  </label>

                  {/* Cash on Delivery */}
                  <label
                    className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                      paymentMethod === 'cod'
                        ? 'border-amber-600 bg-amber-50/50 ring-1 ring-amber-500'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="pay_mode"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="mt-0.5 text-amber-600 focus:ring-amber-500"
                    />
                    <div className="flex-1">
                      <div className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                        <Banknote className="w-4 h-4 text-amber-700" />
                        <span>{t('paymentCod')}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        Pay in cash or UPI scan at your doorstep upon courier arrival or upon pickup at Chikhli showroom.
                      </div>
                    </div>
                  </label>
                </div>

                <div className="pt-4 flex justify-between">

                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                  >
                    <span>Review Order</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* Step 5: Order Review & Placement */}
            {step === 5 && (
              <div className="space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900">
                  {t('stepReview')}
                </h3>

                {/* Items Summary */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 max-h-44 overflow-y-auto">
                  {items.map(({ product, quantity }) => (
                    <div key={product.id} className="flex justify-between items-center text-xs">
                      <div className="truncate pr-2">
                        <span className="font-bold text-slate-900">
                          {language === 'mr' && product.titleMr ? product.titleMr : product.title}
                        </span>
                        <span className="text-slate-500"> × {quantity}</span>
                      </div>
                      <span className="font-bold text-slate-900 shrink-0">
                        {formatINR(product.price * quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Shipping & Payment summary */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-500 uppercase text-[10px] block mb-1">
                      Deliver To:
                    </span>
                    <div className="font-bold text-slate-800">{fullName} ({mobile})</div>
                    <div className="text-slate-600 text-[11px] mt-0.5">
                      {flatBuilding}, {streetArea}, {city}, {pincode}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-500 uppercase text-[10px] block mb-1">
                      Payment & Delivery:
                    </span>
                    <div className="font-bold text-slate-800 capitalize">
                      {paymentMethod === 'razorpay' ? 'Razorpay Online' : 'Cash on Delivery'}
                    </div>
                    <div className="text-slate-600 text-[11px] mt-0.5">
                      {deliveryMethod === 'store_pickup' ? 'Store Pickup (Chikhli)' : 'Doorstep Courier'}
                    </div>
                  </div>
                </div>

                {/* Cost Breakdown */}
                <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-200 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span className="font-semibold text-slate-900">{formatINR(subtotal)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-bold">
                      <span>Discount:</span>
                      <span>-{formatINR(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600">
                    <span>Delivery:</span>
                    <span className="font-semibold text-slate-900">
                      {deliveryMethod === 'store_pickup' || shippingFee === 0
                        ? <span className="text-emerald-700 font-bold">FREE</span>
                        : formatINR(shippingFee)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Estimated 18% GST (Included):</span>
                    <span>{formatINR(taxAmount)}</span>
                  </div>
                  <div className="flex justify-between text-base font-extrabold text-blue-950 pt-2 border-t border-blue-200">
                    <span>Total Payable:</span>
                    <span>
                      {formatINR(deliveryMethod === 'store_pickup' ? totalAmount - shippingFee : totalAmount)}
                    </span>
                  </div>
                </div>

                {/* Terms checkbox */}
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={agreedTerms}
                    onChange={(e) => setAgreedTerms(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
                  />
                  <span>{t('agreeTerms')}</span>
                </label>

                {/* Navigation Buttons */}
                <div className="pt-4 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleConfirmAndPay}
                    disabled={!agreedTerms}
                    className="px-8 py-3 bg-amber-500 hover:bg-amber-600 active:scale-98 text-slate-950 font-extrabold rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50"
                  >
                    <span>
                      {paymentMethod === 'cod' 
                        ? t('confirmOrder') 
                        : paymentMethod === 'upi'
                        ? 'Proceed to Pay with UPI / QR'
                        : 'Proceed to Pay Securely'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Razorpay & UPI Online Checkout Modal */}
      <RazorpayModal
        isOpen={showRazorpayModal}
        amount={deliveryMethod === 'store_pickup' ? totalAmount - shippingFee : totalAmount}
        customerName={fullName}
        customerPhone={mobile}
        customerEmail={email}
        orderNumber={pendingOrderNumber}
        onSuccess={handleRazorpaySuccess}
        onClose={() => setShowRazorpayModal(false)}
      />
    </>
  );
};

