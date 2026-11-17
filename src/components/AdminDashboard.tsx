import React, { useState, useMemo } from 'react';
import { 
  X, 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Wrench, 
  Settings, 
  TrendingUp, 
  AlertTriangle, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  FileText, 
  Save, 
  ShieldCheck, 
  Printer, 
  Download,
  Users,
  CreditCard,
  QrCode,
  CheckCircle2,
  RotateCcw,
  Camera,
  Upload
} from 'lucide-react';

import { useStore } from '../context/StoreContext';
import { useLanguage } from '../context/LanguageContext';
import { formatINR, formatDate } from '../utils/formatters';
import { Product, Order, ServiceRequest, OrderStatus, ServiceStatus, ProductCategory, UserRole } from '../types';
import { compressAndLoadImage } from '../utils/imageUtils';
import {
  fetchAllUsersForAdmin,
  updateUserRoleByAdmin,
  AdminUserRecord,
  ADMIN_EMAIL,
  OWNER_EMAIL,
} from '../firebase';

interface AdminDashboardProps {
  onClose: () => void;
  onViewInvoice: (order: Order) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose, onViewInvoice }) => {
  const { 
    products, 
    addProduct, 
    updateProduct, 
    deleteProduct, 
    orders, 
    updateOrderStatus, 
    processManualRefund,
    serviceRequests, 
    updateServiceStatus, 
    settings, 
    updateStoreSettings 
  } = useStore();

  const { language } = useLanguage();

  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'services' | 'settings' | 'users'>('overview');
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const [userRecords, setUserRecords] = useState<AdminUserRecord[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [roleSuccessMsg, setRoleSuccessMsg] = useState<string | null>(null);

  const loadRegisteredUsers = async () => {
    setUsersLoading(true);
    setUsersError(null);
    try {
      const list = await fetchAllUsersForAdmin();
      setUserRecords(list);
    } catch (err: any) {
      setUsersError(err?.message || 'Unable to load users from Firestore.');
    } finally {
      setUsersLoading(false);
    }
  };

  const handleAssignUserRole = async (uid: string, nextRole: UserRole) => {
    setUsersError(null);
    try {
      await updateUserRoleByAdmin(uid, nextRole);
      setUserRecords((prev) => prev.map((u) => (u.uid === uid ? { ...u, role: nextRole } : u)));
      setRoleSuccessMsg(`Role updated to ${nextRole.toUpperCase()}!`);
      setTimeout(() => setRoleSuccessMsg(null), 3000);
    } catch (err: any) {
      setUsersError(err?.message || 'Failed to update user role.');
    }
  };

  // Search & Filter state
  const [productSearch, setProductSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | 'active' | 'cancelled' | 'delivered'>('all');
  const [serviceSearch, setServiceSearch] = useState('');

  // Add/Edit Product Modal State
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [productForm, setProductForm] = useState<Partial<Product>>({
    title: '',
    brand: '',
    category: 'laptops',
    subCategory: 'Business Laptops',
    price: 25000,
    mrp: 32000,
    stock: 5,
    sku: '',
    images: ['https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80'],
    rating: 4.8,
    reviewCount: 12,
    description: 'Hardware product from Vishvjeet Computer Chikhli showroom.',
    keyFeatures: ['Genuine Brand Warranty', 'Tested for High Reliability'],
    specifications: { 'Warranty': '1 Year' },
    warranty: '1 Year Manufacturer Warranty',
    returnPolicy: '7 Days Replacement',
  });

  // Store Settings Form State
  const [settingsForm, setSettingsForm] = useState(settings);
  const [settingsSavedToast, setSettingsSavedToast] = useState(false);

  // Status update modal for order
  const [selectedOrderForUpdate, setSelectedOrderForUpdate] = useState<Order | null>(null);
  const [courierNameInput, setCourierNameInput] = useState('Shree Maruti Courier (Local Chikhli)');
  const [trackingNumberInput, setTrackingNumberInput] = useState('');

  // Status update for service
  const [selectedTicketForUpdate, setSelectedTicketForUpdate] = useState<ServiceRequest | null>(null);
  const [assignedTechInput, setAssignedTechInput] = useState('');
  const [techNotesInput, setTechNotesInput] = useState('');
  const [techCostInput, setTechCostInput] = useState<number>(0);

  // Overview Metrics Calculation
  const totalRevenue = useMemo(() => {
    return orders
      .filter(o => o.paymentStatus === 'paid')
      .reduce((sum, o) => sum + o.totalAmount, 0);
  }, [orders]);

  const pendingOrders = orders.filter(o => o.orderStatus !== 'delivered' && o.orderStatus !== 'cancelled');
  const lowStockProducts = products.filter(p => p.stock <= 5);
  const newServiceTickets = serviceRequests.filter(s => s.status === 'new' || s.status === 'in_progress');

  // Handle Save Product
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.title || !productForm.brand || !productForm.price) return;

    if (productForm.id) {
      updateProduct(productForm as Product);
    } else {
      addProduct({
        ...productForm,
        sku: productForm.sku || `VC-${Date.now().toString().slice(-6)}`,
        rating: 4.8,
        reviewCount: 1,
      } as Omit<Product, 'id'>);
    }

    setIsEditingProduct(false);
  };

  const handleExportCSV = () => {
    const headers = ['ID,Title,Brand,Category,Price,MRP,Stock,SKU\n'];
    const rows = products.map(p => `"${p.id}","${p.title}","${p.brand}","${p.category}",${p.price},${p.mrp},${p.stock},"${p.sku}"\n`);
    const blob = new Blob([...headers, ...rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vishvjeet_products_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="relative bg-white rounded-3xl max-w-6xl w-full max-h-[92vh] shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-4">
        {/* Top Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
              VC
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white">
                  Vishvjeet Computer Management Console
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-slate-950">
                  Admin
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                Chikhli, Buldhana District, Maharashtra
              </div>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0 text-xs font-bold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all ${
              activeTab === 'overview'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all ${
              activeTab === 'products'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Products ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all ${
              activeTab === 'orders'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Orders ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('services')}
            className={`px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all ${
              activeTab === 'services'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>Service Requests ({serviceRequests.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all shrink-0 ${
              activeTab === 'settings'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Store Settings</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('users');
              loadRegisteredUsers();
            }}
            className={`px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all shrink-0 ${
              activeTab === 'users'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Users & Owner Roles</span>
          </button>
        </div>

        {/* Tab Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stat Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200">
                  <div className="text-xs font-bold text-blue-700 uppercase">Verified Revenue</div>
                  <div className="text-2xl font-black text-blue-950 mt-1">{formatINR(totalRevenue)}</div>
                  <div className="text-[10px] text-blue-600 mt-1">From online & paid orders</div>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                  <div className="text-xs font-bold text-amber-800 uppercase">Pending Orders</div>
                  <div className="text-2xl font-black text-amber-950 mt-1">{pendingOrders.length}</div>
                  <div className="text-[10px] text-amber-700 mt-1">Awaiting dispatch or delivery</div>
                </div>

                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200">
                  <div className="text-xs font-bold text-rose-700 uppercase">Low Stock Alert</div>
                  <div className="text-2xl font-black text-rose-950 mt-1">{lowStockProducts.length}</div>
                  <div className="text-[10px] text-rose-600 mt-1">Items with ≤ 5 units in shop</div>
                </div>

                <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200">
                  <div className="text-xs font-bold text-purple-700 uppercase">Active Service Jobs</div>
                  <div className="text-2xl font-black text-purple-950 mt-1">{newServiceTickets.length}</div>
                  <div className="text-[10px] text-purple-600 mt-1">Computers/CCTV under repair</div>
                </div>
              </div>

              {/* Monthly Sales Mock Trend Bar Chart */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-blue-700" />
                    <span>Monthly Sales & Repair Revenue (Chikhli Center)</span>
                  </h3>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    +24% Growth vs Prev Month
                  </span>
                </div>

                {/* Bar chart visualizer */}
                <div className="h-32 flex items-end justify-between gap-2 pt-4 px-2">
                  {[
                    { month: 'May', val: 45, amt: '₹1.8L' },
                    { month: 'Jun', val: 55, amt: '₹2.2L' },
                    { month: 'Jul', val: 68, amt: '₹2.7L' },
                    { month: 'Aug', val: 82, amt: '₹3.3L' },
                    { month: 'Sep', val: 95, amt: '₹3.8L' },
                    { month: 'Oct (Current)', val: 100, amt: '₹4.1L' },
                  ].map((bar, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                      <span className="text-[10px] font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        {bar.amt}
                      </span>
                      <div
                        style={{ height: `${bar.val}%` }}
                        className="w-full max-w-[40px] bg-gradient-to-t from-blue-700 to-blue-500 rounded-t-lg transition-all group-hover:from-blue-600 group-hover:to-amber-400"
                      ></div>
                      <span className="text-[10px] font-bold text-slate-500 mt-1">{bar.month}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Table: Low Stock Watchlist */}
              {lowStockProducts.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Low Stock Watchlist</span>
                  </h3>
                  <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-slate-100 text-slate-700 font-bold">
                        <tr>
                          <th className="p-2.5">Product Title</th>
                          <th className="p-2.5">Category</th>
                          <th className="p-2.5">Price</th>
                          <th className="p-2.5 text-center">Remaining Stock</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {lowStockProducts.slice(0, 5).map((p) => (
                          <tr key={p.id}>
                            <td className="p-2.5 font-bold text-slate-900">{p.title}</td>
                            <td className="p-2.5 text-slate-500 font-mono">{p.category}</td>
                            <td className="p-2.5 font-bold">{formatINR(p.price)}</td>
                            <td className="p-2.5 text-center">
                              <span className="px-2 py-0.5 rounded-full font-bold bg-rose-100 text-rose-800">
                                {p.stock} units
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PRODUCTS MANAGEMENT */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="relative flex-1 max-w-sm">
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search products by title, brand, or SKU..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold outline-none focus:border-blue-600 focus:bg-white"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportCSV}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export CSV</span>
                  </button>

                  <button
                    onClick={() => {
                      setProductForm({
                        title: '',
                        brand: '',
                        category: 'laptops',
                        subCategory: 'Business Laptops',
                        price: 25000,
                        mrp: 30000,
                        stock: 5,
                        sku: `VC-${Date.now().toString().slice(-6)}`,
                        images: ['https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80'],
                        description: 'New product',
                        keyFeatures: ['100% Genuine', 'Warranty Included'],
                        specifications: { 'Warranty': '1 Year' },
                        warranty: '1 Year Manufacturer Warranty',
                        returnPolicy: '7 Days Replacement',
                      });
                      setIsEditingProduct(true);
                    }}
                    className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Product</span>
                  </button>
                </div>
              </div>

              {/* Products Table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 text-slate-700 font-bold">
                    <tr>
                      <th className="p-3">Product</th>
                      <th className="p-3">SKU</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Price / MRP</th>
                      <th className="p-3 text-center">Stock</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {products
                      .filter(p =>
                        p.title.toLowerCase().includes(productSearch.toLowerCase()) ||
                        p.brand.toLowerCase().includes(productSearch.toLowerCase()) ||
                        p.sku.toLowerCase().includes(productSearch.toLowerCase())
                      )
                      .map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50">
                          <td className="p-3 flex items-center gap-3">
                            <img src={p.images[0]} alt="" className="w-10 h-10 object-contain rounded-lg border border-slate-200" />
                            <div className="truncate max-w-xs font-bold text-slate-900">
                              {p.title}
                              <div className="text-[10px] text-blue-700 font-semibold">{p.brand}</div>
                            </div>
                          </td>
                          <td className="p-3 font-mono text-slate-500">{p.sku}</td>
                          <td className="p-3 text-slate-600 capitalize">{p.category.replace('_', ' ')}</td>
                          <td className="p-3 font-bold">
                            {formatINR(p.price)}{' '}
                            <span className="line-through text-slate-400 text-[10px] font-normal">
                              {formatINR(p.mrp)}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-0.5 rounded-full font-bold ${
                              p.stock <= 5 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {p.stock}
                            </span>
                          </td>
                          <td className="p-3 text-right space-x-1">
                            <button
                              onClick={() => {
                                setProductForm(p);
                                setIsEditingProduct(true);
                              }}
                              className="p-1.5 text-blue-700 hover:bg-blue-50 rounded-lg"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Delete "${p.title}"?`)) {
                                  deleteProduct(p.id);
                                }
                              }}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: ORDERS MANAGEMENT */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="relative max-w-sm flex-1">
                  <input
                    type="text"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    placeholder="Search by Order # or Mobile..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold outline-none focus:border-blue-600 focus:bg-white"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <button
                    onClick={() => setOrderStatusFilter('all')}
                    className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
                      orderStatusFilter === 'all' ? 'bg-blue-700 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    All ({orders.length})
                  </button>
                  <button
                    onClick={() => setOrderStatusFilter('active')}
                    className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
                      orderStatusFilter === 'active' ? 'bg-blue-700 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Active ({orders.filter(o => o.orderStatus !== 'delivered' && o.orderStatus !== 'cancelled').length})
                  </button>
                  <button
                    onClick={() => setOrderStatusFilter('cancelled')}
                    className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
                      orderStatusFilter === 'cancelled' ? 'bg-rose-600 text-white shadow-xs' : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                    }`}
                  >
                    Cancelled & Refunded ({orders.filter(o => o.orderStatus === 'cancelled').length})
                  </button>
                  <button
                    onClick={() => setOrderStatusFilter('delivered')}
                    className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
                      orderStatusFilter === 'delivered' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Delivered ({orders.filter(o => o.orderStatus === 'delivered').length})
                  </button>
                </div>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 text-slate-700 font-bold">
                    <tr>
                      <th className="p-3">Order Number</th>
                      <th className="p-3">Customer</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Payment / Refund</th>
                      <th className="p-3">Order Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders
                      .filter(o => {
                        const matchesSearch = 
                          o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
                          o.customerPhone.includes(orderSearch);
                        if (!matchesSearch) return false;

                        if (orderStatusFilter === 'active') {
                          return o.orderStatus !== 'delivered' && o.orderStatus !== 'cancelled';
                        }
                        if (orderStatusFilter === 'cancelled') {
                          return o.orderStatus === 'cancelled';
                        }
                        if (orderStatusFilter === 'delivered') {
                          return o.orderStatus === 'delivered';
                        }
                        return true;
                      })
                      .map((o) => (
                        <tr key={o.id} className={`hover:bg-slate-50 ${o.orderStatus === 'cancelled' ? 'bg-rose-50/20' : ''}`}>
                          <td className="p-3">
                            <span className="font-mono font-bold text-blue-900 block">{o.orderNumber}</span>
                            {o.orderStatus === 'cancelled' && (
                              <span className="text-[10px] font-bold text-rose-700 uppercase">Cancelled</span>
                            )}
                          </td>
                          <td className="p-3">
                            <div className="font-bold text-slate-900">{o.customerName}</div>
                            <div className="text-[11px] text-slate-500 font-mono">{o.customerPhone}</div>
                            {o.cancellationReason && (
                              <div className="text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded mt-1 line-clamp-1" title={o.cancellationReason}>
                                Reason: {o.cancellationReason}
                              </div>
                            )}
                          </td>
                          <td className="p-3 text-slate-500">{formatDate(o.createdAt)}</td>
                          <td className="p-3 font-extrabold">{formatINR(o.totalAmount)}</td>
                          <td className="p-3">
                            <div className="space-y-1">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase inline-block ${
                                o.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800' :
                                o.paymentStatus === 'refunded' ? 'bg-teal-100 text-teal-900 border border-teal-200' :
                                'bg-amber-100 text-amber-800'
                              }`}>
                                {o.paymentStatus} ({o.paymentMethod})
                              </span>
                              {o.refundStatus === 'completed' && (
                                <div className="text-[10px] text-emerald-800 font-medium">
                                  ✓ 100% Refunded ({formatINR(o.refundAmount || o.totalAmount)})
                                  {o.refundUtr && <div className="font-mono text-[9px] text-slate-500">UTR: {o.refundUtr}</div>}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="p-3">
                            <select
                              value={o.orderStatus}
                              onChange={(e) => {
                                updateOrderStatus(o.id, e.target.value as OrderStatus);
                              }}
                              className={`px-2 py-1 bg-white border rounded-lg text-xs font-semibold ${
                                o.orderStatus === 'cancelled' ? 'border-rose-300 text-rose-800 bg-rose-50' : 'border-slate-300'
                              }`}
                            >
                              <option value="placed">Placed</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="processing">Processing</option>
                              <option value="packed">Packed</option>
                              <option value="shipped">Shipped</option>
                              <option value="out_for_delivery">Out for Delivery</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td className="p-3 text-right space-x-1">
                            {o.orderStatus === 'cancelled' && o.paymentStatus !== 'refunded' && o.paymentMethod !== 'cod' && (
                              <button
                                onClick={() => processManualRefund(o.id)}
                                className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-[10px] transition-colors"
                                title="Process 100% Refund"
                              >
                                Process Refund
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setSelectedOrderForUpdate(o);
                                setTrackingNumberInput(o.trackingNumber || `SMC-CKL-${Math.floor(1000 + Math.random() * 9000)}`);
                              }}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[11px] transition-colors"
                            >
                              Dispatch Details
                            </button>
                            <button
                              onClick={() => onViewInvoice(o)}
                              className="p-1.5 text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Print Invoice"
                            >
                              <FileText className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: SERVICE REQUESTS MANAGEMENT */}
          {activeTab === 'services' && (
            <div className="space-y-4">
              <div className="relative max-w-sm">
                <input
                  type="text"
                  value={serviceSearch}
                  onChange={(e) => setServiceSearch(e.target.value)}
                  placeholder="Search tickets by ID, name, or phone..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold outline-none focus:border-blue-600 focus:bg-white"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 text-slate-700 font-bold">
                    <tr>
                      <th className="p-3">Ticket #</th>
                      <th className="p-3">Customer</th>
                      <th className="p-3">Device & Service</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Assigned Tech</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {serviceRequests
                      .filter(s =>
                        s.ticketNumber.toLowerCase().includes(serviceSearch.toLowerCase()) ||
                        s.customerName.toLowerCase().includes(serviceSearch.toLowerCase()) ||
                        s.customerPhone.includes(serviceSearch)
                      )
                      .map((s) => (
                        <tr key={s.id} className="hover:bg-slate-50">
                          <td className="p-3 font-mono font-bold text-blue-900">{s.ticketNumber}</td>
                          <td className="p-3">
                            <div className="font-bold text-slate-900">{s.customerName}</div>
                            <div className="text-[11px] text-slate-500 font-mono">{s.customerPhone}</div>
                          </td>
                          <td className="p-3">
                            <div className="font-bold text-slate-800">{s.serviceType}</div>
                            <div className="text-[11px] text-slate-500">{s.deviceType} ({s.brandModel})</div>
                          </td>
                          <td className="p-3">
                            <select
                              value={s.status}
                              onChange={(e) => {
                                updateServiceStatus(s.id, e.target.value as ServiceStatus);
                              }}
                              className="px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
                            >
                              <option value="new">New</option>
                              <option value="contacted">Contacted</option>
                              <option value="scheduled">Scheduled</option>
                              <option value="in_progress">In Progress</option>
                              <option value="waiting_parts">Waiting Parts</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td className="p-3 text-slate-700">
                            {s.technicianAssigned || <span className="text-slate-400 italic">Unassigned</span>}
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => {
                                setSelectedTicketForUpdate(s);
                                setAssignedTechInput(s.technicianAssigned || 'Vishvjeet Pawar');
                                setTechNotesInput(s.technicianNotes || '');
                                setTechCostInput(s.estimatedCost || 500);
                              }}
                              className="px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold rounded-lg text-[11px]"
                            >
                              Update Job Sheet
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: STORE SETTINGS */}
          {activeTab === 'settings' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateStoreSettings(settingsForm);
                setSettingsSavedToast(true);
                setTimeout(() => setSettingsSavedToast(false), 3000);
              }}
              className="space-y-5 max-w-2xl text-xs"
            >
              {settingsSavedToast && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800 font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Store and Payment Gateway settings saved successfully!</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Store Name</label>
                  <input
                    type="text"
                    value={settingsForm.storeName}
                    onChange={(e) => setSettingsForm({ ...settingsForm, storeName: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={settingsForm.phone}
                    onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Official Email</label>
                  <input
                    type="email"
                    value={settingsForm.email}
                    onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">WhatsApp Number</label>
                  <input
                    type="text"
                    value={settingsForm.whatsapp}
                    onChange={(e) => setSettingsForm({ ...settingsForm, whatsapp: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Store Address (Chikhli)</label>
                <input
                  type="text"
                  value={settingsForm.address}
                  onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              {/* PAYMENT GATEWAY & UPI CONFIGURATION */}
              <div className="p-4 bg-slate-50 border border-blue-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-700 text-white flex items-center justify-center font-bold">
                      ₹
                    </div>
                    <div>
                      <div className="font-extrabold text-xs text-slate-900">
                        Payment Gateway & UPI Integration
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Instant customer settlement via UPI QR, GPay, PhonePe, Paytm & Cards
                      </div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                    <span>100% Active</span>
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Merchant UPI ID (VPA)</label>
                    <input
                      type="text"
                      value={settingsForm.upiId || '8956664295@okaxis'}
                      onChange={(e) => setSettingsForm({ ...settingsForm, upiId: e.target.value })}
                      placeholder="e.g. 8956664295@okaxis"
                      className="w-full p-2.5 border border-slate-300 rounded-xl font-mono"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Payee Name</label>
                    <input
                      type="text"
                      value={settingsForm.upiPayeeName || 'Vishvjeet Computer'}
                      onChange={(e) => setSettingsForm({ ...settingsForm, upiPayeeName: e.target.value })}
                      placeholder="Vishvjeet Computer"
                      className="w-full p-2.5 border border-slate-300 rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Razorpay Key ID (Optional)</label>
                    <input
                      type="text"
                      value={settingsForm.razorpayKeyId}
                      onChange={(e) => setSettingsForm({ ...settingsForm, razorpayKeyId: e.target.value })}
                      placeholder="rzp_live_... or rzp_test_..."
                      className="w-full p-2.5 border border-slate-300 rounded-xl font-mono text-[11px]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Gateway Operation Mode</label>
                    <div className="p-2 border border-slate-200 bg-white rounded-xl flex items-center justify-between text-xs font-semibold">
                      <span>Zero-Failure Smart Mode</span>
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">Enabled</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">GSTIN</label>
                  <input
                    type="text"
                    value={settingsForm.gstin}
                    onChange={(e) => setSettingsForm({ ...settingsForm, gstin: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Free Delivery Threshold (₹)</label>
                  <input
                    type="number"
                    value={settingsForm.freeShippingThreshold}
                    onChange={(e) => setSettingsForm({ ...settingsForm, freeShippingThreshold: Number(e.target.value) })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Top Announcement Banner</label>
                <input
                  type="text"
                  value={settingsForm.announcementText}
                  onChange={(e) => setSettingsForm({ ...settingsForm, announcementText: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Store & Payment Settings</span>
              </button>
            </form>
          )}

          {/* TAB 6: USERS & OWNER ROLE MANAGEMENT */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-extrabold text-sm text-purple-950">
                    3-Tier Interface Access Control (Admin / App Owner / User)
                  </h3>
                  <p className="text-xs text-purple-800 mt-0.5">
                    Admin (<strong>{ADMIN_EMAIL}</strong>): All Control • Default Owner (<strong>{OWNER_EMAIL}</strong>): Images, Price & Payment Control • Customer: Buy Products Only.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={loadRegisteredUsers}
                  className="px-3.5 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  {usersLoading ? 'Loading...' : 'Refresh Users'}
                </button>
              </div>

              {roleSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800">
                  {roleSuccessMsg}
                </div>
              )}
              {usersError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-800">
                  {usersError}
                </div>
              )}

              <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 text-slate-700 font-bold">
                    <tr>
                      <th className="p-3">User Name</th>
                      <th className="p-3">Google Email / Phone</th>
                      <th className="p-3">Current Role</th>
                      <th className="p-3 text-right">Assign Interface</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {userRecords.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-6 text-center text-slate-500">
                          {usersLoading ? 'Loading Firestore users...' : 'No signed-in user records found yet.'}
                        </td>
                      </tr>
                    ) : (
                      userRecords.map((u) => {
                        const isMasterAdmin = u.email.toLowerCase() === ADMIN_EMAIL || u.role === 'admin';
                        return (
                          <tr key={u.uid} className="hover:bg-slate-50">
                            <td className="p-3 font-bold text-slate-900">{u.name}</td>
                            <td className="p-3 text-slate-600">{u.email || u.phone || u.uid}</td>
                            <td className="p-3">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                  u.role === 'admin'
                                    ? 'bg-purple-100 text-purple-900'
                                    : u.role === 'owner'
                                    ? 'bg-amber-100 text-amber-900'
                                    : 'bg-blue-100 text-blue-900'
                                }`}
                              >
                                {u.role}
                              </span>
                            </td>
                            <td className="p-3 text-right space-x-2">
                              {isMasterAdmin ? (
                                <span className="text-[11px] font-bold text-purple-700">Master Admin</span>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleAssignUserRole(u.uid, 'owner')}
                                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${
                                      u.role === 'owner'
                                        ? 'bg-amber-600 text-white'
                                        : 'bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100'
                                    }`}
                                  >
                                    Set App Owner
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleAssignUserRole(u.uid, 'customer')}
                                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${
                                      u.role === 'customer'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200'
                                    }`}
                                  >
                                    Set Customer
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isEditingProduct && (
        <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 overflow-y-auto max-h-[85vh] text-xs space-y-3">
            <div className="flex justify-between items-center pb-2 border-b">
              <h3 className="font-extrabold text-sm text-slate-900">
                {productForm.id ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button onClick={() => setIsEditingProduct(false)} className="text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3">
              <div>
                <label className="font-bold block mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={productForm.title}
                  onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold block mb-1">Brand *</label>
                  <input
                    type="text"
                    required
                    value={productForm.brand}
                    onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">SKU</label>
                  <input
                    type="text"
                    value={productForm.sku}
                    onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-bold block mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">MRP (₹)</label>
                  <input
                    type="number"
                    value={productForm.mrp}
                    onChange={(e) => setProductForm({ ...productForm, mrp: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Stock Units</label>
                  <input
                    type="number"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-xs text-slate-700">Product Image / वस्तूचा फोटो</label>
                  <label className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-2xs">
                    <Camera className="w-3.5 h-3.5" />
                    <span>कॅमेरा / फोनवरून फोटो निवडा</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setImageUploadError(null);
                        try {
                          const dataUrl = await compressAndLoadImage(file);
                          setProductForm({ ...productForm, images: [dataUrl] });
                        } catch (err: any) {
                          setImageUploadError(err?.message || 'Error loading image');
                        }
                      }}
                    />
                  </label>
                </div>
                {imageUploadError && (
                  <p className="text-[11px] text-rose-600 font-bold mb-1">{imageUploadError}</p>
                )}
                <div className="flex items-center gap-3">
                  {productForm.images?.[0] && (
                    <img
                      src={productForm.images[0]}
                      alt="Product preview"
                      className="w-12 h-12 object-contain rounded-xl border border-slate-200 bg-slate-50 p-1 shrink-0"
                    />
                  )}
                  <input
                    type="text"
                    value={productForm.images?.[0] || ''}
                    onChange={(e) => setProductForm({ ...productForm, images: [e.target.value] })}
                    placeholder="किंवा इमेज लिंक (https://...) टाका"
                    className="flex-1 p-2 border border-slate-300 rounded-xl text-xs outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingProduct(false)}
                  className="px-4 py-2 border rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-700 text-white font-bold rounded-xl"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dispatch Details Modal */}
      {selectedOrderForUpdate && (
        <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-xs space-y-3">
            <h3 className="font-bold text-sm">Add Dispatch / Courier Info</h3>
            <div>
              <label className="font-bold block mb-1">Courier Partner</label>
              <input
                type="text"
                value={courierNameInput}
                onChange={(e) => setCourierNameInput(e.target.value)}
                className="w-full p-2 border rounded-xl"
              />
            </div>
            <div>
              <label className="font-bold block mb-1">Tracking Number (AWB)</label>
              <input
                type="text"
                value={trackingNumberInput}
                onChange={(e) => setTrackingNumberInput(e.target.value)}
                className="w-full p-2 border rounded-xl font-mono"
              />
            </div>
            <div className="pt-2 flex justify-end gap-2">
              <button onClick={() => setSelectedOrderForUpdate(null)} className="px-3 py-1.5 border rounded-lg">
                Cancel
              </button>
              <button
                onClick={() => {
                  updateOrderStatus(selectedOrderForUpdate.id, 'shipped', courierNameInput, trackingNumberInput);
                  setSelectedOrderForUpdate(null);
                }}
                className="px-4 py-1.5 bg-blue-700 text-white font-bold rounded-lg"
              >
                Save Dispatch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Job Sheet Technician Modal */}
      {selectedTicketForUpdate && (
        <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-xs space-y-3">
            <h3 className="font-bold text-sm">Update Service Job Sheet</h3>
            <div>
              <label className="font-bold block mb-1">Assign Technician</label>
              <input
                type="text"
                value={assignedTechInput}
                onChange={(e) => setAssignedTechInput(e.target.value)}
                className="w-full p-2 border rounded-xl"
              />
            </div>
            <div>
              <label className="font-bold block mb-1">Diagnosis & Repair Notes</label>
              <textarea
                rows={2}
                value={techNotesInput}
                onChange={(e) => setTechNotesInput(e.target.value)}
                className="w-full p-2 border rounded-xl"
              />
            </div>
            <div>
              <label className="font-bold block mb-1">Estimated Cost (₹)</label>
              <input
                type="number"
                value={techCostInput}
                onChange={(e) => setTechCostInput(Number(e.target.value))}
                className="w-full p-2 border rounded-xl"
              />
            </div>
            <div className="pt-2 flex justify-end gap-2">
              <button onClick={() => setSelectedTicketForUpdate(null)} className="px-3 py-1.5 border rounded-lg">
                Cancel
              </button>
              <button
                onClick={() => {
                  updateServiceStatus(
                    selectedTicketForUpdate.id,
                    selectedTicketForUpdate.status,
                    assignedTechInput,
                    techNotesInput,
                    techCostInput
                  );
                  setSelectedTicketForUpdate(null);
                }}
                className="px-4 py-1.5 bg-blue-700 text-white font-bold rounded-lg"
              >
                Save Job Sheet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
