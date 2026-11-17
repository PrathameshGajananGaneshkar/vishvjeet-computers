import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Product, CartItem, Coupon } from '../types';
import { useStore } from './StoreContext';

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  appliedCoupon: Coupon | null;
  applyCouponCode: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  itemCount: number;
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  taxAmount: number;
  totalAmount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { coupons, settings, products } = useStore();

  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('vc_cart');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(() => {
    const saved = localStorage.getItem('vc_coupon');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  useEffect(() => {
    localStorage.setItem('vc_cart', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem('vc_coupon', JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem('vc_coupon');
    }
  }, [appliedCoupon]);

  const addItem = (product: Product, quantity = 1) => {
    // Validate live stock from catalog
    const liveProd = products.find(p => p.id === product.id) || product;
    if (liveProd.stock <= 0) return;

    setItems(prev => {
      const existingIndex = prev.findIndex(item => item.product.id === product.id);
      if (existingIndex > -1) {
        const currentQty = prev[existingIndex].quantity;
        const newQty = Math.min(currentQty + quantity, liveProd.stock);
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
          product: liveProd,
        };
        return updated;
      } else {
        const initialQty = Math.min(quantity, liveProd.stock);
        return [...prev, { product: liveProd, quantity: initialQty }];
      }
    });
  };

  const removeItem = (productId: string) => {
    setItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    const liveProd = products.find(p => p.id === productId);
    const maxStock = liveProd ? liveProd.stock : 999;
    const finalQty = Math.min(quantity, maxStock);

    setItems(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, quantity: finalQty } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
  };

  const itemCount = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }, [items]);

  const discountAmount = useMemo(() => {
    if (!appliedCoupon || subtotal === 0) return 0;
    if (subtotal < appliedCoupon.minOrderValue) return 0;

    if (appliedCoupon.discountType === 'percent') {
      const calculated = (subtotal * appliedCoupon.discountValue) / 100;
      return appliedCoupon.maxDiscount ? Math.min(calculated, appliedCoupon.maxDiscount) : calculated;
    } else {
      return Math.min(appliedCoupon.discountValue, subtotal);
    }
  }, [appliedCoupon, subtotal]);

  const shippingFee = useMemo(() => {
    if (subtotal === 0) return 0;
    if (subtotal >= settings.freeShippingThreshold) return 0;
    return settings.standardShippingFee;
  }, [subtotal, settings]);

  const totalAmount = useMemo(() => {
    if (subtotal === 0) return 0;
    const amount = subtotal - discountAmount + shippingFee;
    return Math.max(0, Math.round(amount));
  }, [subtotal, discountAmount, shippingFee]);

  // GST 18% calculation for display
  const taxAmount = useMemo(() => {
    if (totalAmount === 0) return 0;
    // 18% GST inclusive: Amount * 18 / 118
    return Math.round((totalAmount * 18) / 118);
  }, [totalAmount]);

  const applyCouponCode = (code: string): { success: boolean; message: string } => {
    const cleanCode = code.trim().toUpperCase();
    const found = coupons.find(c => c.code.toUpperCase() === cleanCode && c.isActive);

    if (!found) {
      return { success: false, message: 'Invalid or expired coupon code' };
    }

    if (subtotal < found.minOrderValue) {
      return {
        success: false,
        message: `This coupon requires a minimum cart value of ₹${found.minOrderValue}`,
      };
    }

    setAppliedCoupon(found);
    return { success: true, message: `Coupon ${found.code} applied successfully!` };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        appliedCoupon,
        applyCouponCode,
        removeCoupon,
        itemCount,
        subtotal,
        discountAmount,
        shippingFee,
        taxAmount,
        totalAmount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
