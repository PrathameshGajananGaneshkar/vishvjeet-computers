import React, { useRef, useState } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  CheckCircle2, 
  FileText, 
  Maximize2, 
  Minimize2, 
  Loader2,
  ShieldCheck,
  Building2,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Order } from '../types';
import { useStore } from '../context/StoreContext';
import { formatINR, formatDate } from '../utils/formatters';

interface InvoiceModalProps {
  order: Order;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, onClose }) => {
  const { settings } = useStore();
  const invoiceSheetRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [isFullWidth, setIsFullWidth] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!invoiceSheetRef.current) return;
    setIsDownloading(true);
    setDownloadSuccess(false);

    try {
      const element = invoiceSheetRef.current;
      
      // Capture at high resolution for crisp PDF text and lines
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Vishvjeet_Computer_Invoice_${order.orderNumber}.pdf`);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to generate PDF, trying fallback printer:', err);
      window.print();
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex justify-center items-start p-2 sm:p-4 md:p-6 print:p-0 print:bg-white print:overflow-visible">
      {/* Modal Container */}
      <div 
        className={`relative bg-white rounded-2xl sm:rounded-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-2 sm:my-4 transition-all duration-300 print:shadow-none print:border-none print:rounded-none print:m-0 print:w-full ${
          isFullWidth ? 'max-w-6xl' : 'max-w-3xl'
        }`}
      >
        {/* Sticky Action Header (Always visible at top, never cuts off!) */}
        <div className="sticky top-0 z-30 px-4 sm:px-6 py-3.5 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 shadow-md print:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-xs">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="font-extrabold text-xs sm:text-sm text-white flex items-center gap-2">
                <span>Tax Invoice</span>
                <span className="font-mono text-amber-400">#{order.orderNumber}</span>
              </div>
              <div className="text-[10px] text-slate-400">
                Vishvjeet Computer • Chikhli (Buldhana)
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Width Toggle */}
            <button
              onClick={() => setIsFullWidth(!isFullWidth)}
              className="hidden sm:flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-colors"
              title={isFullWidth ? 'Standard View' : 'Wide View'}
            >
              {isFullWidth ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              <span>{isFullWidth ? 'Normal' : 'Wide'}</span>
            </button>

            {/* Direct PDF Download Button */}
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="px-3.5 sm:px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all disabled:opacity-50"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : downloadSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                  <span>Downloaded!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </>
              )}
            </button>

            {/* Print Invoice Button */}
            <button
              onClick={handlePrint}
              className="px-3.5 sm:px-4 py-2 bg-blue-700 hover:bg-blue-600 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-700/30 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1"
              title="Close Invoice"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable/Downloadable A4 Invoice Sheet */}
        <div 
          ref={invoiceSheetRef}
          className="p-6 sm:p-10 md:p-12 space-y-6 text-slate-800 font-sans text-xs bg-white min-h-[700px]"
        >
          {/* 1. Letterhead & Tax Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-slate-800 pb-6 gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-blue-800 text-white flex items-center justify-center font-black text-sm tracking-wider shadow-sm">
                  VC
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-blue-900 tracking-tight leading-none">
                    {settings.storeName}
                  </h1>
                  <span className="text-[11px] font-bold text-amber-600 block mt-0.5">
                    {settings.tagline}
                  </span>
                </div>
              </div>

              <div className="text-slate-600 text-[11px] leading-relaxed pt-1">
                {settings.address}
              </div>

              <div className="text-[11px] text-slate-600 flex flex-wrap gap-x-3 gap-y-1">
                <span>Phone: <strong>{settings.phone}</strong></span>
                <span>•</span>
                <span>Email: <strong>{settings.email}</strong></span>
              </div>

              <div className="inline-block mt-1 px-2.5 py-0.5 bg-slate-100 rounded text-[11px] font-mono text-slate-800 font-extrabold border border-slate-300">
                GSTIN: {settings.gstin}
              </div>
            </div>

            <div className="text-left sm:text-right shrink-0 bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-xl sm:rounded-none border sm:border-none border-slate-200 w-full sm:w-auto">
              <span className="inline-block px-3 py-1 bg-blue-950 text-white font-black rounded-lg text-xs tracking-wider uppercase shadow-xs">
                TAX INVOICE
              </span>

              <div className="mt-2.5 text-xs space-y-1">
                <div>
                  <span className="text-slate-500">Invoice / Order No: </span>
                  <strong className="text-slate-900 font-mono font-bold text-sm block sm:inline">
                    {order.orderNumber}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500">Invoice Date: </span>
                  <strong className="text-slate-900">{formatDate(order.createdAt)}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Payment Status: </span>
                  <strong className={`uppercase font-extrabold ${order.paymentStatus === 'paid' ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {order.paymentStatus}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500">Payment Mode: </span>
                  <strong className="text-slate-800 uppercase font-bold">{order.paymentMethod}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Billed To & Delivery Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200">
            <div>
              <div className="font-extrabold text-blue-900 uppercase text-[10px] tracking-wider mb-1.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-blue-700" />
                <span>Billed & Shipped To:</span>
              </div>
              <div className="font-black text-slate-900 text-sm">
                {order.customerName}
              </div>
              <div className="text-slate-600 mt-1 font-medium">
                Phone: <strong>{order.customerPhone}</strong>
              </div>
              {order.customerEmail && (
                <div className="text-slate-600 text-[11px]">
                  Email: {order.customerEmail}
                </div>
              )}
              <div className="text-slate-700 mt-1.5 leading-relaxed text-[11px]">
                {order.shippingAddress.flatBuilding}, {order.shippingAddress.streetArea},<br />
                {order.shippingAddress.city}, {order.shippingAddress.district}, {order.shippingAddress.state} - <strong>{order.shippingAddress.pincode}</strong>
              </div>
            </div>

            <div className="border-t sm:border-t-0 sm:border-l border-slate-200 pt-3 sm:pt-0 sm:pl-4">
              <div className="font-extrabold text-blue-900 uppercase text-[10px] tracking-wider mb-1.5 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-blue-700" />
                <span>Fulfillment & Dispatch:</span>
              </div>
              <div className="font-bold text-slate-800">
                Method: {order.deliveryMethod === 'store_pickup' ? 'Store Pickup (Chikhli Counter)' : 'Doorstep Courier Delivery'}
              </div>
              <div className="text-slate-600 mt-1 text-[11px]">
                Courier: <strong>{order.courierName || 'Local Express Chikhli Partner'}</strong>
              </div>
              {order.trackingNumber && (
                <div className="text-slate-700 mt-0.5 font-mono text-[11px]">
                  Tracking AWB: <strong>{order.trackingNumber}</strong>
                </div>
              )}
              <div className="text-slate-600 mt-1 text-[11px]">
                Delivery Estimate: <strong>{order.estimatedDeliveryDate}</strong>
              </div>
              <div className="text-emerald-700 font-bold mt-2 text-[10px] flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Verified by Vishvjeet Computer Chikhli Quality Control</span>
              </div>
            </div>
          </div>

          {/* 3. Items Breakdown Table */}
          <div className="border border-slate-300 rounded-xl overflow-hidden shadow-xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-extrabold border-b border-slate-300">
                  <th className="p-3 w-10 text-center">#</th>
                  <th className="p-3">Item Description</th>
                  <th className="p-3 w-24">HSN/SAC</th>
                  <th className="p-3 text-center w-16">Qty</th>
                  <th className="p-3 text-right w-24">Unit Price</th>
                  <th className="p-3 text-right w-28">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {order.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="p-3 text-center text-slate-500 font-bold">{idx + 1}</td>
                    <td className="p-3">
                      <div className="font-bold text-slate-900 leading-snug">
                        {item.product.title}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        Brand: {item.product.brand} | SKU: {item.product.sku}
                      </div>
                    </td>
                    <td className="p-3 text-slate-600 font-mono text-[11px]">84713010</td>
                    <td className="p-3 text-center font-bold text-slate-900">{item.quantity}</td>
                    <td className="p-3 text-right font-mono font-medium">{formatINR(item.product.price)}</td>
                    <td className="p-3 text-right font-extrabold font-mono text-slate-900">
                      {formatINR(item.product.price * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 4. Calculations & GST Tax Breakdown */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-2">
            <div className="max-w-xs text-[11px] text-slate-500 space-y-1">
              <div className="font-bold text-slate-700 uppercase text-[10px]">Payment Note:</div>
              <p>
                {order.paymentStatus === 'paid' 
                  ? 'Payment verified via Razorpay 256-bit secure gateway.' 
                  : 'Cash on Delivery. Please keep exact cash ready upon arrival.'}
              </p>
              {order.paymentId && (
                <p className="font-mono text-[10px] text-slate-600">
                  Transaction Ref: {order.paymentId}
                </p>
              )}
            </div>

            <div className="w-full sm:w-80 space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Items Subtotal:</span>
                <span className="font-mono font-bold text-slate-900">{formatINR(order.subtotal)}</span>
              </div>

              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Coupon Discount ({order.couponCode || 'Promo'}):</span>
                  <span className="font-mono">-{formatINR(order.discount)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600">
                <span>Shipping & Delivery Fee:</span>
                <span className="font-mono font-bold text-slate-900">
                  {order.shippingFee === 0 ? <strong className="text-emerald-700">FREE</strong> : formatINR(order.shippingFee)}
                </span>
              </div>

              <div className="flex justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                <span>CGST (9%) + SGST (9%) Included:</span>
                <span className="font-mono">{formatINR(order.taxAmount)}</span>
              </div>

              <div className="flex justify-between text-base font-black text-blue-950 pt-2 border-t-2 border-slate-300">
                <span>Total Invoice Amount:</span>
                <span className="font-mono text-lg text-blue-900">{formatINR(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* 5. Terms, Signatory & Stamp */}
          <div className="pt-8 border-t-2 border-slate-200 grid grid-cols-1 sm:grid-cols-2 items-end gap-6 text-[11px] text-slate-500">
            <div>
              <div className="font-bold text-slate-800 mb-1 uppercase tracking-wider text-[10px]">
                Standard Store Policies:
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-[10px] text-slate-600">
                <li>Goods carry 100% manufacturer warranty across India.</li>
                <li>7 Days hardware replacement for transit damage or manufacturing defects.</li>
                <li>Walk-in support available at Shop No. 4, Shivaji Complex, Chikhli.</li>
                <li>Subject to Chikhli (Buldhana District) jurisdiction.</li>
              </ul>
            </div>

            <div className="text-left sm:text-right flex flex-col items-start sm:items-end">
              <div className="text-slate-500 font-bold text-xs">For VISHVJEET COMPUTER</div>
              <div className="my-3 py-1.5 px-3 border border-dashed border-slate-300 rounded-lg text-slate-400 font-mono text-[10px] text-center inline-block">
                [Digitally Signed & Verified]
              </div>
              <div className="font-black text-slate-900 text-xs uppercase tracking-wider">
                Authorized Signatory
              </div>
              <div className="text-[10px] text-slate-400">
                Chikhli, Buldhana, Maharashtra - 443201
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Download Helper Bar (Hidden in Print) */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 print:hidden">
          <span>
            Click <strong>Download PDF</strong> to save this invoice as a PDF file on your computer or phone.
          </span>
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="text-emerald-700 font-bold hover:underline flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Invoice PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};
