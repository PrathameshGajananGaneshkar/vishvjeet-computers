export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function calculateDiscountPercent(mrp: number, price: number): number {
  if (mrp <= price || mrp === 0) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function checkPincodeDelivery(pincode: string): {
  deliverable: boolean;
  city: string;
  estimatedDays: string;
  isLocalChikhli: boolean;
} {
  const cleanPin = pincode.trim();
  if (cleanPin === '443201') {
    return {
      deliverable: true,
      city: 'Chikhli, Buldhana',
      estimatedDays: 'Same Day or Next Day (Express Local Store Delivery)',
      isLocalChikhli: true,
    };
  }
  if (cleanPin.startsWith('443')) {
    return {
      deliverable: true,
      city: 'Buldhana District',
      estimatedDays: '1 - 2 Business Days',
      isLocalChikhli: false,
    };
  }
  if (cleanPin.startsWith('44') || cleanPin.startsWith('43') || cleanPin.startsWith('41') || cleanPin.startsWith('42') || cleanPin.startsWith('40')) {
    return {
      deliverable: true,
      city: 'Maharashtra State',
      estimatedDays: '2 - 4 Business Days',
      isLocalChikhli: false,
    };
  }
  if (cleanPin.length === 6 && /^\d+$/.test(cleanPin)) {
    return {
      deliverable: true,
      city: 'Rest of India',
      estimatedDays: '4 - 6 Business Days via Bluedart / SpeedPost',
      isLocalChikhli: false,
    };
  }
  return {
    deliverable: false,
    city: 'Invalid PIN Code',
    estimatedDays: 'Please check your 6-digit postal code',
    isLocalChikhli: false,
  };
}
