import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  ShoppingBag, 
  Wrench, 
  Heart, 
  MapPin, 
  LogOut, 
  ShieldCheck, 
  FileText, 
  Truck, 
  Trash2,
  ShoppingCart,
  RotateCcw,
  Crown,
  CheckCircle2,
  Save,
  Smartphone
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { formatINR, formatDate } from '../utils/formatters';
import { Order, Product } from '../types';

interface CustomerAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewInvoice: (order: Order) => void;
  onTrackOrder: (orderId: string) => void;
  onSelectProduct: (product: Product) => void;
  onOpenAdmin: () => void;
  onOpenOwner?: () => void;
}

export const CustomerAccountModal: React.FC<CustomerAccountModalProps> = ({
  isOpen,
  onClose,
  onViewInvoice,
  onTrackOrder,
  onSelectProduct,
  onOpenAdmin,
  onOpenOwner,
}) => {
  const { user, firebaseUser, logout, updateProfile, isAdmin, isOwner } = useAuth();
  const { orders, serviceRequests, wishlist, products, toggleWishlist } = useStore();
  const { addItem } = useCart();

  const [activeTab, setActiveTab] = useState<'orders' | 'services' | 'wishlist' | 'profile'>('orders');
  const [editName, setEditName] = useState(user?.name || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [editPhone, setEditPhone] = useState(user?.phone ? user.phone.replace(/\D/g, '').slice(-10) : '');
  const [editPincode, setEditPincode] = useState(user?.savedPincode || '443201');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSavedMsg, setProfileSavedMsg] = useState<string | null>(null);
  const [profileErrorMsg, setProfileErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setEditName(user.name || '');
      setEditEmail(user.email || '');
      setEditPhone(user.phone ? user.phone.replace(/\D/g, '').slice(-10) : '');
      setEditPincode(user.savedPincode || '443201');
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const isPhoneVerified = Boolean(firebaseUser?.phoneNumber);

  // Filter orders and service tickets belonging to this user
  const userOrders = orders.filter(
    o =>
      o.userId === user.id ||
      (user.phone && o.customerPhone === user.phone) ||
      (user.email && o.customerEmail === user.email)
  );

  const userServices = serviceRequests.filter(
    s =>
      (user.phone && s.customerPhone === user.phone) ||
      (user.email && s.customerEmail === user.email)
  );

  const wishlistProducts = products.filter(p => wishlist.includes(p.id));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-4">
        {/* User Card Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-blue-900 to-indigo-950 text-white flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center font-bold text-amber-400 text-lg">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white">{user.name}</h2>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  user.role === 'admin' ? 'bg-purple-300 text-purple-950' :
                  user.role === 'owner' ? 'bg-amber-300 text-amber-950' :
                  'bg-blue-300 text-blue-950'
                }`}>
                  {user.role}
                </span>
              </div>
              <div className="text-xs text-blue-200 mt-0.5">
                {[
                  user.email,
                  user.phone ? `+91 ${user.phone.replace(/\D/g, '').slice(-10)}` : null,
                ]
                  .filter(Boolean)
                  .join(' • ')}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {(isOwner || isAdmin) && onOpenOwner && (
              <button
                onClick={() => {
                  onClose();
                  onOpenOwner();
                }}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Crown className="w-3.5 h-3.5" />
                <span>Owner Control</span>
              </button>
            )}

            {isAdmin && (
              <button
                onClick={() => {
                  onClose();
                  onOpenAdmin();
                }}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin Console</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="px-6 py-2 bg-slate-100 border-b border-slate-200 flex items-center gap-2 text-xs font-bold overflow-x-auto scrollbar-none shrink-0">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 ${
              activeTab === 'orders' ? 'bg-blue-700 text-white' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>My Orders ({userOrders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('services')}
            className={`px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 ${
              activeTab === 'services' ? 'bg-blue-700 text-white' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>Service Tickets ({userServices.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('wishlist')}
            className={`px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 ${
              activeTab === 'wishlist' ? 'bg-blue-700 text-white' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Wishlist ({wishlistProducts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 ${
              activeTab === 'profile' ? 'bg-blue-700 text-white' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile & Addresses</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          {/* TAB 1: ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-3">
              {userOrders.length > 0 ? (
                userOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
                      <div>
                        <span className="font-mono font-extrabold text-blue-900 text-sm">
                          {ord.orderNumber}
                        </span>
                        <div className="text-[11px] text-slate-500">
                          {formatDate(ord.createdAt)}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          ord.orderStatus === 'cancelled'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : ord.orderStatus === 'delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {ord.orderStatus.replace('_', ' ')}
                        </span>
                        <span className="font-extrabold text-slate-900 text-sm">
                          {formatINR(ord.totalAmount)}
                        </span>
                      </div>
                    </div>

                    {/* Refund info if cancelled */}
                    {ord.orderStatus === 'cancelled' && (
                      <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-[11px]">
                        <div>
                          <span className="font-bold text-emerald-900 block">
                            {ord.refundStatus === 'completed' ? '100% Refund Credited' : 'Order Cancelled'}
                          </span>
                          {ord.refundUtr && (
                            <span className="font-mono text-emerald-700 text-[10px]">
                              Bank UTR: {ord.refundUtr}
                            </span>
                          )}
                        </div>
                        {ord.refundAmount ? (
                          <span className="font-black text-emerald-800 text-xs">
                            {formatINR(ord.refundAmount)}
                          </span>
                        ) : null}
                      </div>
                    )}

                    {/* Items */}
                    <div className="space-y-1">
                      {ord.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-slate-700">
                          <span className="truncate pr-2 font-medium">{item.product.title} × {item.quantity}</span>
                          <span className="font-mono font-semibold">{formatINR(item.product.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-wrap justify-end gap-2 pt-1 border-t border-slate-200">
                      {ord.orderStatus !== 'delivered' && ord.orderStatus !== 'cancelled' && (
                        <button
                          onClick={() => {
                            onClose();
                            onTrackOrder(ord.orderNumber);
                          }}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Cancel & Refund</span>
                        </button>
                      )}

                      <button
                        onClick={() => onViewInvoice(ord)}
                        className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Invoice</span>
                      </button>

                      <button
                        onClick={() => {
                          onClose();
                          onTrackOrder(ord.orderNumber);
                        }}
                        className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>{ord.orderStatus === 'cancelled' ? 'Refund Details' : 'Track Status'}</span>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-slate-500">
                  You haven't placed any orders yet.
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SERVICE REQUESTS */}
          {activeTab === 'services' && (
            <div className="space-y-3">
              {userServices.length > 0 ? (
                userServices.map((srv) => (
                  <div
                    key={srv.id}
                    className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-mono font-extrabold text-blue-900">
                          {srv.ticketNumber}
                        </span>
                        <div className="font-bold text-slate-900 mt-0.5">{srv.serviceType}</div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-100 text-amber-800">
                        {srv.status}
                      </span>
                    </div>

                    <div className="text-slate-600 text-[11px]">
                      Device: <strong>{srv.deviceType}</strong> ({srv.brandModel})
                    </div>
                    <div className="text-slate-600 text-[11px]">
                      Problem: {srv.problemDescription}
                    </div>

                    {srv.technicianNotes && (
                      <div className="p-2 bg-amber-50 rounded-lg text-amber-900 text-[11px]">
                        <strong>Technician Note:</strong> {srv.technicianNotes}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-slate-500">
                  No service tickets logged. Book a computer repair service whenever needed!
                </div>
              )}
            </div>
          )}

          {/* TAB 3: WISHLIST */}
          {activeTab === 'wishlist' && (
            <div className="space-y-3">
              {wishlistProducts.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-3">
                  {wishlistProducts.map((p) => (
                    <div
                      key={p.id}
                      className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3"
                    >
                      <img
                        src={p.images[0]}
                        alt=""
                        className="w-14 h-14 object-contain rounded-xl bg-white p-1 border border-slate-200 shrink-0 cursor-pointer"
                        onClick={() => {
                          onClose();
                          onSelectProduct(p);
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div
                          className="font-bold text-slate-900 truncate cursor-pointer hover:text-blue-700"
                          onClick={() => {
                            onClose();
                            onSelectProduct(p);
                          }}
                        >
                          {p.title}
                        </div>
                        <div className="font-extrabold text-blue-800 mt-0.5">
                          {formatINR(p.price)}
                        </div>
                      </div>

                      <div className="flex flex-col gap-1 shrink-0">
                        <button
                          onClick={() => addItem(p, 1)}
                          className="p-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl"
                          title="Add to Cart"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => toggleWishlist(p.id)}
                          className="p-2 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl border border-slate-200"
                          title="Remove from Wishlist"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500">
                  Your wishlist is empty. Tap the heart icon on any product to save it.
                </div>
              )}
            </div>
          )}

          {/* TAB 4: PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-4 max-w-md">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-700 uppercase text-[10px]">
                    Customer Profile (Firestore Synced)
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{isPhoneVerified ? 'Verified Phone' : 'Verified Google Account'}</span>
                  </span>
                </div>

                {isPhoneVerified && (
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center gap-2 text-slate-800">
                    <Smartphone className="w-4 h-4 text-[#2874f0] shrink-0" />
                    <div>
                      <div className="text-[10px] text-slate-400 font-semibold uppercase">Verified Mobile Number</div>
                      <div className="font-mono font-bold text-xs text-slate-900">
                        +91 {user.phone.replace(/\D/g, '').slice(-10)}
                      </div>
                    </div>
                  </div>
                )}

                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setSavingProfile(true);
                    setProfileSavedMsg(null);
                    setProfileErrorMsg(null);
                    try {
                      const cleanedPhone = editPhone.replace(/\D/g, '').slice(-10);
                      await updateProfile({
                        name: editName.trim() || user.name,
                        email: editEmail.trim(),
                        ...(isPhoneVerified ? {} : { phone: cleanedPhone ? `+91${cleanedPhone}` : '' }),
                        savedPincode: editPincode.trim() || '443201',
                      });
                      setProfileSavedMsg('Profile saved to your account.');
                    } catch {
                      setProfileErrorMsg('Could not save profile changes. Please try again.');
                    } finally {
                      setSavingProfile(false);
                    }
                  }}
                  className="space-y-2.5"
                >
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Full Name</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Your full name"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs outline-none focus:border-[#2874f0]"
                    />
                  </div>
                  {!isPhoneVerified && (
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Mobile Number (+91)</label>
                      <input
                        type="tel"
                        maxLength={10}
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder="10-digit mobile number"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono outline-none focus:border-[#2874f0]"
                      />
                    </div>
                  )}
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Email Address</label>
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      placeholder="example@gmail.com"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs outline-none focus:border-[#2874f0]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Delivery Pincode</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={editPincode}
                      onChange={(e) => setEditPincode(e.target.value.replace(/\D/g, ''))}
                      placeholder="443201"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono outline-none focus:border-[#2874f0]"
                    />
                  </div>

                  {profileSavedMsg && (
                    <div className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
                      {profileSavedMsg}
                    </div>
                  )}
                  {profileErrorMsg && (
                    <div className="text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-lg">
                      {profileErrorMsg}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="px-4 py-2 bg-[#2874f0] hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{savingProfile ? 'Saving...' : 'Save Profile'}</span>
                  </button>
                </form>
              </div>

              <button
                onClick={async () => {
                  await logout();
                  onClose();
                }}
                className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
