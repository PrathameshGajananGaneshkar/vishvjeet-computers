import React, { useState } from 'react';
import { 
  X, 
  Search, 
  Truck, 
  CheckCircle2, 
  Clock, 
  Package, 
  Phone, 
  MessageCircle,
  FileText,
  AlertCircle,
  RotateCcw,
  Check,
  Copy,
  ShieldCheck,
  ArrowRight,
  Info
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useLanguage } from '../context/LanguageContext';
import { formatINR, formatDate } from '../utils/formatters';
import { Order } from '../types';

interface OrderTrackingModalProps {
  initialOrderId?: string;
  onClose: () => void;
  onViewInvoice: (order: Order) => void;
}

const CANCELLATION_REASONS = [
  { id: 'mistake', label: 'Ordered by mistake', labelMr: 'चुकीने ऑर्डर केली गेली' },
  { id: 'delay', label: 'Expected delivery is too late', labelMr: 'डिलिव्हरीसाठी जास्त वेळ लागत आहे' },
  { id: 'address', label: 'Want to change address or mobile number', labelMr: 'पत्ता किंवा मोबाईल नंबर बदलायचा आहे' },
  { id: 'item_change', label: 'Want to change product variant or model', labelMr: 'दुसरे मॉडेल किंवा वस्तू खरेदी करायची आहे' },
  { id: 'payment', label: 'Need to change payment mode (UPI/Card/COD)', labelMr: 'पेमेंट पद्धत बदलायची आहे' },
  { id: 'other', label: 'Other reason', labelMr: 'इतर कारण' },
];

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  initialOrderId,
  onClose,
  onViewInvoice,
}) => {
  const { orders, settings, cancelOrder } = useStore();
  const { language, t } = useLanguage();

  const [searchQuery, setSearchQuery] = useState(initialOrderId || '');
  const [selectedOrderId, setSelectedOrderId] = useState<string>(() => {
    if (initialOrderId) {
      const match = orders.find(o => o.id === initialOrderId || o.orderNumber === initialOrderId);
      return match ? match.id : (orders[0]?.id || '');
    }
    return orders[0]?.id || '';
  });

  // Always derive fresh order object from context
  const selectedOrder = orders.find(o => o.id === selectedOrderId || o.orderNumber === selectedOrderId) || null;

  // Cancellation Modal State
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState(CANCELLATION_REASONS[0].label);
  const [customComment, setCustomComment] = useState('');
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);
  const [copiedUtr, setCopiedUtr] = useState(false);
  const [cancelSuccessMessage, setCancelSuccessMessage] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = searchQuery.trim().toLowerCase();
    const found = orders.find(
      o => o.orderNumber.toLowerCase() === clean || o.customerPhone.includes(clean)
    );
    if (found) {
      setSelectedOrderId(found.id);
      setShowCancelModal(false);
      setCancelSuccessMessage(null);
    } else {
      alert('Order not found. Please check your order number (e.g. VC-ORD-...) or registered phone number.');
    }
  };

  const handleConfirmCancel = () => {
    if (!selectedOrder) return;
    setIsSubmittingCancel(true);

    const fullReason = customComment.trim() 
      ? `${selectedReason} - ${customComment.trim()}`
      : selectedReason;

    setTimeout(() => {
      const res = cancelOrder(selectedOrder.id, fullReason);
      setIsSubmittingCancel(false);
      setShowCancelModal(false);
      if (res.success) {
        setCancelSuccessMessage(res.message);
      }
    }, 400);
  };

  const handleCopyUtr = (utr: string) => {
    navigator.clipboard.writeText(utr);
    setCopiedUtr(true);
    setTimeout(() => setCopiedUtr(false), 2000);
  };

  const isDelivered = selectedOrder?.orderStatus === 'delivered';
  const isCancelled = selectedOrder?.orderStatus === 'cancelled';
  const isPaid = selectedOrder && (selectedOrder.paymentStatus === 'paid' || selectedOrder.paymentStatus === 'refunded' || selectedOrder.paymentMethod !== 'cod');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="relative bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-6 max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-blue-700" />
            <h2 className="text-base font-extrabold text-slate-900">
              {t('trackOrder')}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200 text-slate-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-slate-100 bg-white shrink-0">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Order ID (e.g. VC-ORD-2026-...) or Mobile Number"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold outline-none focus:border-blue-600 focus:bg-white transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Track
            </button>
          </form>
        </div>

        {/* Order Details Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {cancelSuccessMessage && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1 text-xs">
                <div className="font-bold text-emerald-900">ऑर्डर यशस्वीरित्या रद्द करण्यात आली!</div>
                <div className="text-emerald-700 mt-0.5">{cancelSuccessMessage}</div>
              </div>
              <button 
                onClick={() => setCancelSuccessMessage(null)}
                className="text-emerald-700 hover:text-emerald-900 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {selectedOrder ? (
            <>
              {/* Order Overview Header Card */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-wrap justify-between items-center gap-3 text-xs">
                <div>
                  <div className="font-mono font-extrabold text-slate-900 text-sm">
                    {selectedOrder.orderNumber}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Placed on {formatDate(selectedOrder.createdAt)}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-lg font-bold text-[11px] uppercase ${
                    isCancelled 
                      ? 'bg-rose-100 text-rose-800 border border-rose-200' 
                      : isDelivered 
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                      : 'bg-blue-100 text-blue-800 border border-blue-200'
                  }`}>
                    {selectedOrder.orderStatus.replace('_', ' ')}
                  </span>
                  <button
                    onClick={() => onViewInvoice(selectedOrder)}
                    className="p-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-700 transition-colors"
                    title="View Tax Invoice"
                  >
                    <FileText className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* DEDICATED REFUND CARD IF CANCELLED */}
              {isCancelled && (
                <div className="p-5 rounded-2xl bg-linear-to-br from-rose-50 via-white to-emerald-50 border-2 border-emerald-300 shadow-sm space-y-4">
                  <div className="flex items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                        <RotateCcw className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                          <span>100% Payment Refund Status</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                            {selectedOrder.refundStatus === 'completed' ? 'Refund Credited' : 'Cancelled'}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-600">
                          {selectedOrder.cancelledAt ? `Cancelled on ${formatDate(selectedOrder.cancelledAt)}` : 'Order cancellation processed'}
                        </div>
                      </div>
                    </div>
                    {selectedOrder.refundAmount ? (
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">Refund Amount</span>
                        <span className="text-base font-black text-emerald-700">
                          {formatINR(selectedOrder.refundAmount)}
                        </span>
                      </div>
                    ) : null}
                  </div>

                  {selectedOrder.refundStatus === 'completed' ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div className="p-3 bg-white/90 rounded-xl border border-slate-200">
                          <span className="text-[10px] font-bold text-slate-500 uppercase block">Refund Reference ID</span>
                          <span className="font-mono font-bold text-slate-800 text-[11px] break-all">
                            {selectedOrder.refundId || 'RFND_VC_COMPLETED'}
                          </span>
                        </div>

                        <div className="p-3 bg-white/90 rounded-xl border border-slate-200">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Bank UTR / ARN</span>
                            {selectedOrder.refundUtr && (
                              <button
                                onClick={() => handleCopyUtr(selectedOrder.refundUtr!)}
                                className="text-[10px] text-blue-700 hover:text-blue-900 font-bold flex items-center gap-0.5"
                              >
                                {copiedUtr ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                                <span>{copiedUtr ? 'Copied' : 'Copy'}</span>
                              </button>
                            )}
                          </div>
                          <span className="font-mono font-bold text-emerald-800 text-[11px]">
                            {selectedOrder.refundUtr || 'UTR782910394812'}
                          </span>
                        </div>
                      </div>

                      <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-emerald-950">
                          <ShieldCheck className="w-4 h-4 text-emerald-700" />
                          <span>100% Zero-Deduction Refund Guarantee</span>
                        </div>
                        <p className="text-[11px] text-emerald-800 leading-relaxed">
                          Your full payment has been refunded to your original source (UPI: <strong>8956664295@okaxis</strong> or your source bank). Usually reflects immediately or within 15 minutes.
                        </p>
                      </div>

                      {selectedOrder.cancellationReason && (
                        <div className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                          <span className="font-bold text-slate-700">Cancellation Reason: </span>
                          <span>{selectedOrder.cancellationReason}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-3 bg-slate-100 rounded-xl text-xs text-slate-700">
                      <div className="font-bold">Cash on Delivery Order Cancelled</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        No advance amount was collected. Your order has been voided with zero fees.
                      </div>
                      {selectedOrder.cancellationReason && (
                        <div className="text-[11px] text-slate-600 mt-2 pt-2 border-t border-slate-200">
                          <span className="font-bold">Reason: </span>
                          <span>{selectedOrder.cancellationReason}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Delivery ETA & Courier Info (If not cancelled) */}
              {!isCancelled && (
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-200">
                    <span className="font-bold text-slate-500 text-[10px] uppercase block mb-1">
                      Courier Partner:
                    </span>
                    <div className="font-bold text-blue-900">
                      {selectedOrder.courierName || 'Local Chikhli Express Partner'}
                    </div>
                    {selectedOrder.trackingNumber && (
                      <div className="text-[11px] text-slate-600 font-mono mt-0.5">
                        AWB: {selectedOrder.trackingNumber}
                      </div>
                    )}
                  </div>

                  <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200">
                    <span className="font-bold text-slate-500 text-[10px] uppercase block mb-1">
                      Estimated Delivery:
                    </span>
                    <div className="font-bold text-emerald-900">
                      {selectedOrder.estimatedDeliveryDate}
                    </div>
                    <div className="text-[11px] text-emerald-700 mt-0.5">
                      {selectedOrder.deliveryMethod === 'store_pickup' ? 'Ready for Store Pickup' : 'To your doorstep'}
                    </div>
                  </div>
                </div>
              )}

              {/* Visual Order Progress Stepper */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Fulfillment Status Timeline
                  </h3>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Total: <strong className="text-slate-900">{formatINR(selectedOrder.totalAmount)}</strong>
                  </span>
                </div>

                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {selectedOrder.timeline.map((step, idx) => (
                    <div key={idx} className="relative">
                      <div
                        className={`absolute -left-6 top-0 w-5 h-5 rounded-full flex items-center justify-center ${
                          step.status === 'cancelled'
                            ? 'bg-rose-600 text-white'
                            : step.completed
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-200 text-slate-400'
                        }`}
                      >
                        {step.status === 'cancelled' ? (
                          <X className="w-3.5 h-3.5" />
                        ) : step.completed ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <Clock className="w-3 h-3" />
                        )}
                      </div>

                      <div className="text-xs">
                        <div className="flex items-center justify-between">
                          <span className={`font-bold ${
                            step.status === 'cancelled' 
                              ? 'text-rose-700' 
                              : step.completed 
                              ? 'text-slate-900' 
                              : 'text-slate-400'
                          }`}>
                            {language === 'mr' ? step.labelMr : step.label}
                          </span>
                          {step.timestamp && (
                            <span className="text-[10px] text-slate-400">
                              {formatDate(step.timestamp)}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Items Preview */}
              <div className="pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Items in this order
                </h3>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between gap-3 bg-white">
                      <img src={item.product.images[0]} alt="" className="w-10 h-10 object-contain rounded-lg bg-slate-50 p-1" />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-slate-900 truncate">{item.product.title}</div>
                        <div className="text-[11px] text-slate-500">Qty: {item.quantity} • {item.product.brand}</div>
                      </div>
                      <span className="font-extrabold text-slate-900">
                        {formatINR(item.product.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CANCEL ORDER ACTION BUTTON (If order is cancellable) */}
              {!isCancelled && !isDelivered && (
                <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-amber-950">
                        Want to cancel this order? / ऑर्डर रद्द करायची आहे का?
                      </div>
                      <div className="text-[11px] text-amber-800">
                        {isPaid 
                          ? '100% Instant Refund to your UPI/Bank. No penalty or fee.'
                          : 'Cancel free of charge before dispatch.'}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Cancel Order & Claim Refund</span>
                  </button>
                </div>
              )}

              {/* Contact Shop for Assistance */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3 text-xs">
                <div>
                  <div className="font-bold text-slate-800">Need help or live tracking support?</div>
                  <div className="text-[11px] text-slate-500">Call or message Vishvjeet Computer Chikhli desk.</div>
                </div>
                <div className="flex gap-2">
                  <a
                    href={`tel:${settings.phone.replace(/\s+/g, '')}`}
                    className="p-2 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 text-blue-700 transition-colors"
                    title="Call"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                  <a
                    href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi Vishvjeet Computer, I need help with my Order ${selectedOrder.orderNumber}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
                    title="WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs">
              No orders found. Search above with your order number.
            </div>
          )}
        </div>
      </div>

      {/* CANCELLATION & REFUND REASON MODAL */}
      {showCancelModal && selectedOrder && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="px-6 py-4 bg-rose-50 border-b border-rose-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">
                    Cancel Order & Claim 100% Refund
                  </h3>
                  <span className="text-[11px] text-rose-800 font-mono">
                    {selectedOrder.orderNumber}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowCancelModal(false)}
                className="p-1 rounded-full hover:bg-rose-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs overflow-y-auto max-h-[75vh]">
              {/* Refund summary banner */}
              <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold text-emerald-950 block">Instant Full Refund Policy</span>
                    <span className="text-[11px] text-emerald-800">
                      {isPaid ? '100% amount credited to source bank/UPI' : 'Cash on Delivery order cancelled at zero charge'}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-emerald-700 uppercase font-bold block">Refund Total</span>
                  <span className="text-sm font-black text-emerald-800">
                    {isPaid ? formatINR(selectedOrder.totalAmount) : '₹0 (COD)'}
                  </span>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-900 block mb-2">
                  Please select a reason for cancellation / कृपया रद्द करण्याचे कारण निवडा:
                </label>
                <div className="space-y-2">
                  {CANCELLATION_REASONS.map((r) => (
                    <label
                      key={r.id}
                      className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                        selectedReason === r.label
                          ? 'border-blue-600 bg-blue-50/60 font-semibold'
                          : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100'
                      }`}
                    >
                      <input
                        type="radio"
                        name="cancellation_reason"
                        checked={selectedReason === r.label}
                        onChange={() => setSelectedReason(r.label)}
                        className="mt-0.5 text-blue-600"
                      />
                      <div className="flex-1">
                        <span className="text-slate-900 block text-xs">{r.label}</span>
                        <span className="text-slate-500 text-[11px]">{r.labelMr}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Additional Note (Optional):
                </label>
                <textarea
                  value={customComment}
                  onChange={(e) => setCustomComment(e.target.value)}
                  placeholder="Any specific comments or feedback for Vishvjeet Computer..."
                  rows={2}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-none focus:border-blue-600 focus:bg-white resize-none"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <div className="font-bold text-slate-800 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-blue-600" />
                  <span>Refund Processing Information:</span>
                </div>
                <div>• Refund will be transferred back to: <strong>{selectedOrder.paymentMethod === 'upi' ? 'Source UPI Account (Instant)' : selectedOrder.paymentMethod === 'razorpay' ? 'Original Card / Netbanking' : 'Cash on Delivery (No charges)'}</strong></div>
                <div>• Bank UTR and Refund ID will be generated immediately for tracking.</div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-bold hover:bg-slate-200 text-xs transition-colors cursor-pointer"
              >
                Keep Order
              </button>
              <button
                type="button"
                disabled={isSubmittingCancel}
                onClick={handleConfirmCancel}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSubmittingCancel ? (
                  <span>Processing Refund...</span>
                ) : (
                  <>
                    <span>Confirm Cancel & Refund</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
