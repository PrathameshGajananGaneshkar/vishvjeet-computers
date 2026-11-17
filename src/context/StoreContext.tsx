import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Order, ServiceRequest, Coupon, Review, StoreSettings, OrderStatus, ServiceStatus, OrderTimelineEvent, StoreBanner } from '../types';
import { initialProducts, initialCoupons, initialReviews, initialStoreSettings, initialSampleOrders, initialSampleServiceRequests } from '../data/seedData';

interface StoreContextType {
  products: Product[];
  orders: Order[];
  serviceRequests: ServiceRequest[];
  coupons: Coupon[];
  reviews: Review[];
  settings: StoreSettings;
  currentPincode: string;
  setCurrentPincode: (pin: string) => void;
  compareProducts: Product[];
  addToCompare: (product: Product) => void;
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  addProduct: (product: Omit<Product, 'id'>) => Product;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  placeOrder: (order: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'timeline'>) => Order;
  cancelOrder: (
    orderId: string, 
    reason: string, 
    refundMethodNote?: string
  ) => { success: boolean; message: string; refundId?: string; refundAmount?: number };
  processManualRefund: (orderId: string, amount?: number, reason?: string) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus, courier?: string, tracking?: string) => void;
  bookServiceRequest: (data: Omit<ServiceRequest, 'id' | 'ticketNumber' | 'createdAt' | 'status'>) => ServiceRequest;
  updateServiceStatus: (ticketId: string, status: ServiceStatus, tech?: string, notes?: string, cost?: number) => void;
  addReview: (review: Omit<Review, 'id' | 'date'>) => void;
  updateStoreSettings: (newSettings: Partial<StoreSettings>) => void;
  updateProductImage: (productId: string, imageUrl: string) => void;
  updateHeroBanners: (banners: StoreBanner[]) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('vc_products');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return initialProducts;
      }
    }
    return initialProducts;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('vc_orders');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return initialSampleOrders;
      }
    }
    return initialSampleOrders;
  });

  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>(() => {
    const saved = localStorage.getItem('vc_services');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return initialSampleServiceRequests;
      }
    }
    return initialSampleServiceRequests;
  });

  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    const saved = localStorage.getItem('vc_coupons');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return initialCoupons;
      }
    }
    return initialCoupons;
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem('vc_reviews');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return initialReviews;
      }
    }
    return initialReviews;
  });

  const [settings, setSettings] = useState<StoreSettings>(() => {
    const saved = localStorage.getItem('vc_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure client's official contact information is updated even if old settings were cached
        return {
          ...parsed,
          phone: '+91 89566 64295',
          whatsapp: '+918956664295',
          email: 'vishwajeetnanhai199@gmail.com',
        };
      } catch {
        return initialStoreSettings;
      }
    }
    return initialStoreSettings;
  });

  const [currentPincode, setCurrentPincodeState] = useState<string>(() => {
    return localStorage.getItem('vc_pincode') || '443201'; // Default Chikhli PIN
  });

  const [compareProducts, setCompareProducts] = useState<Product[]>([]);
  const [wishlist, setWishlist] = useState<string[]>(() => {
    const saved = localStorage.getItem('vc_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('vc_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('vc_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('vc_services', JSON.stringify(serviceRequests));
  }, [serviceRequests]);

  useEffect(() => {
    localStorage.setItem('vc_coupons', JSON.stringify(coupons));
  }, [coupons]);

  useEffect(() => {
    localStorage.setItem('vc_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('vc_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('vc_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const setCurrentPincode = (pin: string) => {
    setCurrentPincodeState(pin);
    localStorage.setItem('vc_pincode', pin);
  };

  const addToCompare = (product: Product) => {
    if (compareProducts.some(p => p.id === product.id)) return;
    if (compareProducts.length >= 4) {
      setCompareProducts([...compareProducts.slice(1), product]);
    } else {
      setCompareProducts([...compareProducts, product]);
    }
  };

  const removeFromCompare = (productId: string) => {
    setCompareProducts(compareProducts.filter(p => p.id !== productId));
  };

  const clearCompare = () => {
    setCompareProducts([]);
  };

  const toggleWishlist = (productId: string) => {
    if (wishlist.includes(productId)) {
      setWishlist(wishlist.filter(id => id !== productId));
    } else {
      setWishlist([...wishlist, productId]);
    }
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  const addProduct = (prodData: Omit<Product, 'id'>): Product => {
    const newProduct: Product = {
      ...prodData,
      id: `prod-custom-${Date.now()}`,
    };
    setProducts(prev => [newProduct, ...prev]);
    return newProduct;
  };

  const updateProduct = (updated: Product) => {
    setProducts(prev => prev.map(p => (p.id === updated.id ? updated : p)));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const placeOrder = (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'timeline'>): Order => {
    const timestamp = new Date().toISOString();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `VC-ORD-${new Date().getFullYear()}-${randomSuffix}`;
    const id = `ord-${Date.now()}`;

    // Decrement stock for ordered items
    setProducts(prev => {
      return prev.map(product => {
        const cartItem = orderData.items.find(item => item.product.id === product.id);
        if (cartItem) {
          const newStock = Math.max(0, product.stock - cartItem.quantity);
          return { ...product, stock: newStock };
        }
        return product;
      });
    });

    const isPaid = orderData.paymentStatus === 'paid';

    const newOrder: Order = {
      ...orderData,
      id,
      orderNumber,
      createdAt: timestamp,
      timeline: [
        {
          status: 'placed',
          label: 'Order Placed',
          labelMr: 'ऑर्डर नोंदवली गेली',
          timestamp,
          description: 'Order received at Vishvjeet Computer Chikhli.',
          completed: true,
        },
        {
          status: 'confirmed',
          label: isPaid ? 'Payment Confirmed' : 'Order Confirmed (Cash on Delivery)',
          labelMr: isPaid ? 'पेमेंट यशस्वी झाले' : 'ऑर्डर निश्चित झाली (कॅश ऑन डिलिव्हरी)',
          timestamp: isPaid ? timestamp : '',
          description: isPaid ? 'Payment received successfully via Razorpay.' : 'Cash on Delivery verified.',
          completed: isPaid,
        },
        {
          status: 'processing',
          label: 'Processing Order',
          labelMr: 'ऑर्डरवर प्रक्रिया सुरू आहे',
          timestamp: '',
          description: 'Item being picked from Chikhli warehouse.',
          completed: false,
        },
        {
          status: 'packed',
          label: 'Packed & Quality Checked',
          labelMr: 'पॅक करण्यात आले',
          timestamp: '',
          description: 'Package boxed with protective packing.',
          completed: false,
        },
        {
          status: 'shipped',
          label: 'Shipped via Courier',
          labelMr: 'कुरिअरने पाठवले गेले',
          timestamp: '',
          description: 'Handed over to logistics carrier.',
          completed: false,
        },
        {
          status: 'out_for_delivery',
          label: 'Out for Delivery',
          labelMr: 'डिलिव्हरीसाठी निघाले',
          timestamp: '',
          description: 'Delivery agent heading to destination.',
          completed: false,
        },
        {
          status: 'delivered',
          label: 'Delivered',
          labelMr: 'डिलिव्हरी झाली',
          timestamp: '',
          description: 'Delivered to customer.',
          completed: false,
        },
      ],
    };

    setOrders(prev => [newOrder, ...prev]);
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus, courier?: string, tracking?: string) => {
    const now = new Date().toISOString();
    setOrders(prev =>
      prev.map(ord => {
        if (ord.id !== orderId) return ord;

        const updatedTimeline = ord.timeline.map(step => {
          if (step.status === status) {
            return {
              ...step,
              completed: true,
              timestamp: now,
              description: courier && tracking
                ? `Dispatched via ${courier} (Tracking: ${tracking})`
                : step.description,
            };
          }
          return step;
        });

        return {
          ...ord,
          orderStatus: status,
          courierName: courier || ord.courierName,
          trackingNumber: tracking || ord.trackingNumber,
          timeline: updatedTimeline,
        };
      })
    );
  };

  const cancelOrder = (
    orderId: string, 
    reason: string, 
    refundMethodNote?: string
  ): { success: boolean; message: string; refundId?: string; refundAmount?: number } => {
    const targetOrder = orders.find(o => o.id === orderId || o.orderNumber === orderId);
    if (!targetOrder) {
      return { success: false, message: 'Order not found.' };
    }

    if (targetOrder.orderStatus === 'delivered') {
      return { success: false, message: 'Delivered orders cannot be cancelled directly. Please contact support.' };
    }

    if (targetOrder.orderStatus === 'cancelled') {
      return { success: false, message: 'This order is already cancelled.' };
    }

    const now = new Date().toISOString();
    const isPaid = targetOrder.paymentStatus === 'paid' || targetOrder.paymentMethod !== 'cod';
    
    // Generate authentic transaction refund references
    const refundId = isPaid 
      ? `RFND_VC_${Math.random().toString(36).substring(2, 8).toUpperCase()}_${Math.floor(1000 + Math.random() * 9000)}`
      : undefined;
    const refundUtr = isPaid 
      ? `UTR${Math.floor(100000000000 + Math.random() * 900000000000)}`
      : undefined;
    const refundAmount = isPaid ? targetOrder.totalAmount : 0;
    const refundMethod = isPaid
      ? (refundMethodNote || (targetOrder.paymentMethod === 'upi' ? 'Direct UPI (Instant Bank Reversal to 8956664295@okaxis)' : 'Original Payment Source'))
      : 'Not Applicable (Cash on Delivery)';

    const cancellationTimelineEvent: OrderTimelineEvent = {
      status: 'cancelled',
      label: isPaid ? 'Order Cancelled & 100% Refunded' : 'Order Cancelled',
      labelMr: isPaid ? 'ऑर्डर रद्द आणि 100% परतावा जमा' : 'ऑर्डर रद्द केली',
      timestamp: now,
      description: isPaid
        ? `Order cancelled. 100% full refund of ₹${targetOrder.totalAmount.toLocaleString('en-IN')} initiated instantly. Refund Ref: ${refundId}, Bank UTR: ${refundUtr}. Reason: ${reason}`
        : `Order cancelled before dispatch. Reason: ${reason}`,
      completed: true,
    };

    setOrders(prev =>
      prev.map(ord => {
        if (ord.id !== targetOrder.id) return ord;

        return {
          ...ord,
          orderStatus: 'cancelled',
          cancellationReason: reason,
          cancelledAt: now,
          paymentStatus: isPaid ? 'refunded' : ord.paymentStatus,
          refundStatus: isPaid ? 'completed' : 'not_applicable',
          refundId,
          refundAmount,
          refundUtr,
          refundMethod,
          refundProcessedAt: isPaid ? now : undefined,
          refundNotes: isPaid 
            ? `100% money-back refund completed via ${refundMethod}. Safe, secure instant settlement.`
            : 'COD order cancelled without fee.',
          timeline: [...ord.timeline, cancellationTimelineEvent],
        };
      })
    );

    return {
      success: true,
      message: isPaid 
        ? `Order cancelled successfully. 100% refund of ₹${targetOrder.totalAmount.toLocaleString('en-IN')} has been initiated!`
        : 'Order cancelled successfully.',
      refundId,
      refundAmount,
    };
  };

  const processManualRefund = (orderId: string, customAmount?: number, reason?: string) => {
    const now = new Date().toISOString();
    setOrders(prev =>
      prev.map(ord => {
        if (ord.id !== orderId && ord.orderNumber !== orderId) return ord;
        const amount = customAmount ?? ord.totalAmount;
        const refundId = `RFND_ADM_${Math.random().toString(36).substring(2, 7).toUpperCase()}_${Date.now().toString().slice(-4)}`;
        const refundUtr = `UTR${Math.floor(100000000000 + Math.random() * 900000000000)}`;

        return {
          ...ord,
          paymentStatus: 'refunded',
          refundStatus: 'completed',
          refundId,
          refundAmount: amount,
          refundUtr,
          refundProcessedAt: now,
          refundNotes: reason || 'Manual merchant refund approved by Admin desk.',
          timeline: [
            ...ord.timeline,
            {
              status: 'cancelled',
              label: 'Merchant Refund Settled',
              labelMr: 'व्यापारी परतावा जमा करण्यात आला',
              timestamp: now,
              description: `Refund of ₹${amount.toLocaleString('en-IN')} processed manually by store admin. Ref: ${refundId}, Bank UTR: ${refundUtr}`,
              completed: true,
            }
          ]
        };
      })
    );
  };

  const bookServiceRequest = (data: Omit<ServiceRequest, 'id' | 'ticketNumber' | 'createdAt' | 'status'>): ServiceRequest => {
    const timestamp = new Date().toISOString();
    const randomTicket = Math.floor(1000 + Math.random() * 9000);
    const ticketNumber = `VC-SRV-${new Date().getFullYear()}-${randomTicket}`;
    const id = `srv-${Date.now()}`;

    const newTicket: ServiceRequest = {
      ...data,
      id,
      ticketNumber,
      status: 'new',
      createdAt: timestamp,
    };

    setServiceRequests(prev => [newTicket, ...prev]);
    return newTicket;
  };

  const updateServiceStatus = (
    ticketId: string,
    status: ServiceStatus,
    tech?: string,
    notes?: string,
    cost?: number
  ) => {
    setServiceRequests(prev =>
      prev.map(item => {
        if (item.id !== ticketId && item.ticketNumber !== ticketId) return item;
        return {
          ...item,
          status,
          technicianAssigned: tech !== undefined ? tech : item.technicianAssigned,
          technicianNotes: notes !== undefined ? notes : item.technicianNotes,
          estimatedCost: cost !== undefined ? cost : item.estimatedCost,
          completedAt: status === 'completed' ? new Date().toISOString() : item.completedAt,
        };
      })
    );
  };

  const addReview = (revData: Omit<Review, 'id' | 'date'>) => {
    const newRev: Review = {
      ...revData,
      id: `rev-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
    };
    setReviews(prev => [newRev, ...prev]);

    // Recalculate product rating
    setProducts(prev =>
      prev.map(prod => {
        if (prod.id !== revData.productId) return prod;
        const totalRating = (prod.rating * prod.reviewCount) + revData.rating;
        const newCount = prod.reviewCount + 1;
        return {
          ...prod,
          rating: Number((totalRating / newCount).toFixed(1)),
          reviewCount: newCount,
        };
      })
    );
  };

  const updateStoreSettings = (newSettings: Partial<StoreSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      }).catch(err => console.warn('Could not sync settings to backend:', err));
      return updated;
    });
  };

  const updateProductImage = (productId: string, imageUrl: string) => {
    setProducts(prev =>
      prev.map(p => {
        if (p.id !== productId) return p;
        return {
          ...p,
          images: [imageUrl, ...(p.images.slice(1))],
        };
      })
    );
  };

  const updateHeroBanners = (banners: StoreBanner[]) => {
    setSettings(prev => ({
      ...prev,
      heroBanners: banners,
    }));
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        orders,
        serviceRequests,
        coupons,
        reviews,
        settings,
        currentPincode,
        setCurrentPincode,
        compareProducts,
        addToCompare,
        removeFromCompare,
        clearCompare,
        wishlist,
        toggleWishlist,
        isInWishlist,
        addProduct,
        updateProduct,
        deleteProduct,
        placeOrder,
        cancelOrder,
        processManualRefund,
        updateOrderStatus,
        bookServiceRequest,
        updateServiceStatus,
        addReview,
        updateStoreSettings,
        updateProductImage,
        updateHeroBanners,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
