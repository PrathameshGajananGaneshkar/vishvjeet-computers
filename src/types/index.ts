export type Language = 'en' | 'mr';

export type ProductCategory = 
  | 'computers_desktops'
  | 'laptops'
  | 'printers_scanners'
  | 'cameras_cctv'
  | 'toner_ink'
  | 'computer_accessories'
  | 'printer_accessories'
  | 'camera_accessories'
  | 'networking'
  | 'deals_offers';

export interface Product {
  id: string;
  title: string;
  titleMr?: string;
  brand: string;
  category: ProductCategory;
  subCategory: string;
  price: number;
  mrp: number;
  stock: number;
  sku: string;
  images: string[];
  rating: number;
  reviewCount: number;
  description: string;
  descriptionMr?: string;
  keyFeatures: string[];
  keyFeaturesMr?: string[];
  specifications: Record<string, string>;
  warranty: string;
  returnPolicy: string;
  isFeatured?: boolean;
  isDealOfDay?: boolean;
  isBestSeller?: boolean;
  isDemo?: boolean;
  compatibleWith?: string[]; // IDs or names of compatible products (e.g. toner -> printer)
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariant?: string;
}

export type OrderStatus = 
  | 'placed'
  | 'confirmed'
  | 'processing'
  | 'packed'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'returned';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export type PaymentMethod = 'razorpay' | 'upi' | 'card' | 'netbanking' | 'cod';

export interface ShippingAddress {
  fullName: string;
  mobile: string;
  email?: string;
  flatBuilding: string;
  streetArea: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  landmark?: string;
}

export interface OrderTimelineEvent {
  status: OrderStatus;
  label: string;
  labelMr: string;
  timestamp: string;
  description: string;
  completed: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  shippingAddress: ShippingAddress;
  deliveryMethod: 'standard_shipping' | 'store_pickup';
  items: CartItem[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  shippingFee: number;
  taxAmount: number; // GST 18% inclusive/calculated
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentId?: string;
  razorpayOrderId?: string;
  orderStatus: OrderStatus;
  cancellationReason?: string;
  cancelledAt?: string;
  refundStatus?: 'not_applicable' | 'initiated' | 'completed';
  refundId?: string;
  refundAmount?: number;
  refundUtr?: string;
  refundMethod?: string;
  refundProcessedAt?: string;
  refundNotes?: string;
  courierName?: string;
  trackingNumber?: string;
  estimatedDeliveryDate: string;
  createdAt: string;
  timeline: OrderTimelineEvent[];
}

export type ServiceStatus = 
  | 'new'
  | 'contacted'
  | 'scheduled'
  | 'in_progress'
  | 'waiting_parts'
  | 'completed'
  | 'cancelled';

export interface ServiceRequest {
  id: string;
  ticketNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  serviceType: string;
  serviceTypeMr?: string;
  deviceType: 'Desktop' | 'Laptop' | 'Printer' | 'CCTV' | 'Network' | 'Other';
  brandModel: string;
  problemDescription: string;
  preferredDate: string;
  serviceMode: 'store_dropoff' | 'on_site';
  address?: string;
  status: ServiceStatus;
  technicianAssigned?: string;
  technicianNotes?: string;
  estimatedCost?: number;
  createdAt: string;
  completedAt?: string;
}

export interface Coupon {
  code: string;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  description: string;
  descriptionMr?: string;
  isActive: boolean;
  expiresAt: string;
}

export interface Review {
  id: string;
  productId: string;
  customerName: string;
  customerLocation: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
  verifiedPurchase: boolean;
}

export type UserRole = 'customer' | 'owner' | 'admin';

export interface StoreBanner {
  id: string;
  badge: string;
  badgeMr?: string;
  title: string;
  titleMr?: string;
  subtitle: string;
  subtitleMr?: string;
  cta1Text: string;
  cta2Text?: string;
  bgGradient: string;
  image: string;
  active?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  addresses: ShippingAddress[];
  savedPincode?: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  taglineMr: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  addressMr: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  gstin: string;
  openingHours: string;
  openingHoursMr: string;
  googleMapsUrl: string;
  freeShippingThreshold: number;
  standardShippingFee: number;
  razorpayKeyId: string;
  isRazorpayTestMode: boolean;
  upiId?: string;
  upiPayeeName?: string;
  enableUpi?: boolean;
  enableCards?: boolean;
  enableNetBanking?: boolean;
  enableCod?: boolean;
  announcementText: string;
  announcementTextMr: string;
  heroBanners?: StoreBanner[];
  qrCodeUrl?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
  bankIfsc?: string;
  bankName?: string;
  fast2smsApiKey?: string;
  deletedProductIds?: string[];
}

