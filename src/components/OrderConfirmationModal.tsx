import React from 'react';
import { CheckCircle2, FileText, Truck, ArrowRight, ShieldCheck, MapPin } from 'lucide-react';
import { Order } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { formatINR } from '../utils/formatters';

interface OrderConfirmationModalProps {
  order: Order;
  onClose: () => void;
  onViewInvoice: () => void;
  onTrackOrder: () => void;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  order,
  onClose,
  onViewInvoice,
  onTrackOrder,
}) => {
  const { language, t } = useLanguage();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden text-center p-6 sm:p-8 space-y-6">
        {/* Animated Check Icon */}
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Order Confirmed & Received
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">
            Thank you, {order.customerName}!
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Your order has been registered with Vishvjeet Computer Chikhli.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-left space-y-2 text-xs">
          <div className="flex justify-between items-center pb-2 border-b border-slate-200">
            <span className="text-slate-500">Order Number:</span>
            <span className="font-mono font-extrabold text-blue-900 text-sm">{order.orderNumber}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-500">Payment Status:</span>
            <span className="font-bold text-emerald-700 uppercase">{order.paymentStatus}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-500">Total Amount:</span>
            <span className="font-extrabold text-slate-900">{formatINR(order.totalAmount)}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-500">Delivery Estimate:</span>
            <span className="font-bold text-blue-800">{order.estimatedDeliveryDate}</span>
          </div>

          <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-600 flex items-start gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
            <span>
              Shipping to {order.shippingAddress.flatBuilding}, {order.shippingAddress.streetArea}, {order.shippingAddress.city} - {order.shippingAddress.pincode}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onViewInvoice}
              className="py-3 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <FileText className="w-4 h-4 text-blue-700" />
              <span>{t('printInvoice')}</span>
            </button>

            <button
              onClick={onTrackOrder}
              className="py-3 px-3 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Truck className="w-4 h-4" />
              <span>{t('trackOrder')}</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Local store warranty and dispatch from Chikhli, Buldhana</span>
        </div>
      </div>
    </div>
  );
};
