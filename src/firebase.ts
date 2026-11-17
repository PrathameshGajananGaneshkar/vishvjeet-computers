import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  signOut,
  setPersistence,
  browserLocalPersistence,
  Auth,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  collection,
  getDoc,
  getDocs,
  getDocFromServer,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  Firestore,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { Product, ShippingAddress, StoreSettings, UserProfile, UserRole } from './types';

// Initialize singleton Firebase App
const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore with the provisioned named database ID
export const db: Firestore = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Initialize Firebase Authentication with local persistence
export const auth: Auth = getAuth(app);
auth.useDeviceLanguage();
setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.warn('Firebase persistence setup warning:', err);
});

export { app, firebaseConfig };

// --- MANDATORY FIRESTORE CONNECTION TEST ON BOOT ---
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration. Firestore client is offline.');
    }
  }
}
testConnection();

// --- FIRESTORE ERROR HANDLER (REQUIRED BY FIREBASE INTEGRATION) ---
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    phoneNumber?: string | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
      phoneNumber?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified ?? null,
      phoneNumber: auth.currentUser?.phoneNumber || null,
      isAnonymous: auth.currentUser?.isAnonymous ?? null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
          phoneNumber: provider.phoneNumber,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// --- GOOGLE AUTHENTICATION ---
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export async function signInWithGooglePopup() {
  try {
    return await signInWithPopup(auth, googleProvider);
  } catch (err: any) {
    const code = err?.code || '';
    const isTopWindow = typeof window !== 'undefined' && window.self === window.top;
    if (
      isTopWindow &&
      (code === 'auth/popup-blocked' || code === 'auth/operation-not-supported-in-this-environment')
    ) {
      await signInWithRedirect(auth, googleProvider);
      return null;
    }
    throw err;
  }
}

export async function resolveGoogleRedirectResult() {
  try {
    return await getRedirectResult(auth);
  } catch (err) {
    console.warn('Google redirect resolution notice:', err);
    return null;
  }
}

// --- ROLE & PROFILE MANAGEMENT (ADMIN / APP OWNER / USER) ---
export const ADMIN_EMAIL = 'p.ganeshkar8788@gmail.com';
export const OWNER_EMAIL = 'vishwajeetnanhai199@gmail.com';
const ADMIN_PHONES = ['8788409279', '8956664295'];
const OWNER_PHONES = ['9876543210'];

export function inferStoreRoleFromVerifiedUser(
  fbUser: FirebaseUser,
  firestoreRole?: UserRole
): UserRole {
  const email = (fbUser.email || '').toLowerCase().trim();
  const digits = (fbUser.phoneNumber || '').replace(/\D/g, '').slice(-10);

  if ((fbUser.emailVerified && email === ADMIN_EMAIL) || ADMIN_PHONES.includes(digits)) {
    return 'admin';
  }
  if (firestoreRole === 'admin') {
    return 'admin';
  }
  if ((fbUser.emailVerified && email === OWNER_EMAIL) || OWNER_PHONES.includes(digits)) {
    return 'owner';
  }
  if (firestoreRole && ['owner', 'customer'].includes(firestoreRole)) {
    return firestoreRole;
  }
  return 'customer';
}

export async function syncFirebaseUserProfile(fbUser: FirebaseUser): Promise<UserProfile> {
  const userDocPath = `users/${fbUser.uid}`;
  const userRef = doc(db, 'users', fbUser.uid);

  const rawDigits = (fbUser.phoneNumber || '').replace(/\D/g, '').slice(-10);
  const formattedPhone = fbUser.phoneNumber || (rawDigits ? `+91${rawDigits}` : '');
  const displayPhone = rawDigits || formattedPhone;

  let existingSnap;
  try {
    existingSnap = await getDoc(userRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, userDocPath);
  }

  if (existingSnap.exists()) {
    const data = existingSnap.data();
    const role = inferStoreRoleFromVerifiedUser(fbUser, data.role as UserRole);
    const storedPhone = typeof data.phone === 'string' ? data.phone : '';
    const storedDigits = storedPhone.replace(/\D/g, '').slice(-10);

    // If bootstrapped email role upgraded from customer, sync if allowed
    if (data.role !== role && role === 'admin') {
      updateDoc(userRef, { role, updatedAt: serverTimestamp() }).catch(() => {});
    }

    return {
      id: fbUser.uid,
      name:
        data.name ||
        fbUser.displayName ||
        (displayPhone ? `Customer (+91 ${displayPhone})` : fbUser.email?.split('@')[0] || 'Customer'),
      email: data.email || fbUser.email || '',
      phone: displayPhone || storedDigits || storedPhone,
      role,
      savedPincode: data.savedPincode || '443201',
      addresses: Array.isArray(data.addresses) ? (data.addresses as ShippingAddress[]) : [],
    };
  }

  const initialRole = inferStoreRoleFromVerifiedUser(fbUser);
  const defaultName =
    fbUser.displayName ||
    (displayPhone ? `Customer (+91 ${displayPhone})` : fbUser.email?.split('@')[0] || 'VishwaJit Customer');
  const defaultAddress: ShippingAddress = {
    fullName: defaultName,
    mobile: displayPhone,
    email: fbUser.email || '',
    flatBuilding: '',
    streetArea: '',
    city: 'Chikhli',
    district: 'Buldhana',
    state: 'Maharashtra',
    pincode: '443201',
  };

  const newDocPayload = {
    uid: fbUser.uid,
    name: defaultName,
    email: fbUser.email || '',
    phone: formattedPhone,
    phoneVerified: Boolean(fbUser.phoneNumber),
    role: initialRole,
    savedPincode: '443201',
    addresses: [defaultAddress],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    await setDoc(userRef, newDocPayload);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, userDocPath);
  }

  return {
    id: fbUser.uid,
    name: defaultName,
    email: fbUser.email || '',
    phone: displayPhone,
    role: initialRole,
    savedPincode: '443201',
    addresses: [defaultAddress],
  };
}

export async function updateFirestoreUserProfile(
  uid: string,
  updates: Partial<Pick<UserProfile, 'name' | 'email' | 'phone' | 'savedPincode' | 'addresses'>>
): Promise<void> {
  const userDocPath = `users/${uid}`;
  const userRef = doc(db, 'users', uid);

  const sanitized: Record<string, any> = {
    updatedAt: serverTimestamp(),
  };
  if (typeof updates.name === 'string' && updates.name.trim()) {
    sanitized.name = updates.name.trim().slice(0, 100);
  }
  if (typeof updates.email === 'string') {
    sanitized.email = updates.email.trim().slice(0, 100);
  }
  if (typeof updates.phone === 'string') {
    sanitized.phone = updates.phone.trim().slice(0, 20);
  }
  if (typeof updates.savedPincode === 'string') {
    sanitized.savedPincode = updates.savedPincode.trim().slice(0, 10);
  }
  if (Array.isArray(updates.addresses)) {
    sanitized.addresses = updates.addresses.slice(0, 10);
  }

  try {
    await updateDoc(userRef, sanitized);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, userDocPath);
  }
}

// --- ADMIN: USER & OWNER ROLE MANAGEMENT ---
export interface AdminUserRecord {
  uid: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
}

export async function fetchAllUsersForAdmin(): Promise<AdminUserRecord[]> {
  try {
    const snap = await getDocs(collection(db, 'users'));
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        uid: data.uid || d.id,
        name: data.name || 'User',
        email: data.email || '',
        phone: data.phone || '',
        role: (data.role as UserRole) || 'customer',
      };
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'users');
  }
}

export async function updateUserRoleByAdmin(uid: string, role: UserRole): Promise<void> {
  const path = `users/${uid}`;
  try {
    await updateDoc(doc(db, 'users', uid), {
      role,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

// --- REAL-TIME STOREFRONT CATALOG & SETTINGS SYNC (FIRESTORE) ---
function sanitizeProductPayload(product: Product): Record<string, any> {
  const safeImages = (Array.isArray(product.images) ? product.images : [])
    .filter((img) => typeof img === 'string' && img.length > 0 && img.length <= 350000)
    .slice(0, 8);
  if (safeImages.length === 0) {
    safeImages.push('https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80');
  }

  const payload: Record<string, any> = {
    id: String(product.id).slice(0, 128),
    title: String(product.title || 'Product').slice(0, 200),
    brand: String(product.brand || 'Generic').slice(0, 80),
    category: String(product.category || 'computer_accessories').slice(0, 80),
    price: Math.max(0, Number(product.price) || 0),
    mrp: Math.max(0, Number(product.mrp) || 0),
    stock: Math.max(0, Math.round(Number(product.stock) || 0)),
    images: safeImages,
    updatedAt: serverTimestamp(),
  };

  if (product.titleMr) payload.titleMr = String(product.titleMr).slice(0, 250);
  if (product.subCategory) payload.subCategory = String(product.subCategory).slice(0, 80);
  if (product.sku) payload.sku = String(product.sku).slice(0, 50);
  if (typeof product.rating === 'number') payload.rating = Math.min(5, Math.max(0, product.rating));
  if (typeof product.reviewCount === 'number') payload.reviewCount = Math.max(0, Math.round(product.reviewCount));
  if (product.description) payload.description = String(product.description).slice(0, 3000);
  if (product.descriptionMr) payload.descriptionMr = String(product.descriptionMr).slice(0, 3000);
  if (Array.isArray(product.keyFeatures)) payload.keyFeatures = product.keyFeatures.slice(0, 20);
  if (Array.isArray(product.keyFeaturesMr)) payload.keyFeaturesMr = product.keyFeaturesMr.slice(0, 20);
  if (product.specifications && typeof product.specifications === 'object') payload.specifications = product.specifications;
  if (product.warranty) payload.warranty = String(product.warranty).slice(0, 300);
  if (product.returnPolicy) payload.returnPolicy = String(product.returnPolicy).slice(0, 300);
  if (typeof product.isFeatured === 'boolean') payload.isFeatured = product.isFeatured;
  if (typeof product.isDealOfDay === 'boolean') payload.isDealOfDay = product.isDealOfDay;
  if (typeof product.isBestSeller === 'boolean') payload.isBestSeller = product.isBestSeller;
  if (typeof product.isDemo === 'boolean') payload.isDemo = product.isDemo;
  if (Array.isArray(product.compatibleWith)) payload.compatibleWith = product.compatibleWith.slice(0, 20);

  return payload;
}

export async function saveProductToFirestore(
  product: Product,
  ownerPartialFields?: ('price' | 'mrp' | 'images')[]
): Promise<void> {
  const path = `products/${product.id}`;
  const ref = doc(db, 'products', product.id);
  try {
    if (ownerPartialFields && ownerPartialFields.length > 0) {
      const existingSnap = await getDoc(ref);
      if (existingSnap.exists()) {
        const fullSanitized = sanitizeProductPayload(product);
        const partial: Record<string, any> = { updatedAt: serverTimestamp() };
        for (const key of ownerPartialFields) {
          if (key in fullSanitized) partial[key] = fullSanitized[key];
        }
        await updateDoc(ref, partial);
        return;
      }
    }
    await setDoc(ref, sanitizeProductPayload(product));
  } catch (err) {
    console.warn(`Firestore product sync warning (${path}):`, err);
  }
}

export async function deleteProductFromFirestore(productId: string): Promise<void> {
  const path = `products/${productId}`;
  try {
    await deleteDoc(doc(db, 'products', productId));
  } catch (err) {
    console.warn(`Firestore product delete warning (${path}):`, err);
  }
}

export async function saveStoreSettingsToFirestore(
  settings: StoreSettings,
  ownerFieldsOnly?: boolean
): Promise<void> {
  const path = 'storeSettings/main';
  const ref = doc(db, 'storeSettings', 'main');
  const payload: Record<string, any> = {
    storeName: String(settings.storeName || 'Vishvjeet Computer').slice(0, 120),
    tagline: String(settings.tagline || '').slice(0, 200),
    taglineMr: String(settings.taglineMr || '').slice(0, 200),
    phone: String(settings.phone || '').slice(0, 30),
    whatsapp: String(settings.whatsapp || '').slice(0, 30),
    email: String(settings.email || '').slice(0, 100),
    address: String(settings.address || '').slice(0, 300),
    addressMr: String(settings.addressMr || '').slice(0, 300),
    city: String(settings.city || '').slice(0, 60),
    district: String(settings.district || '').slice(0, 60),
    state: String(settings.state || '').slice(0, 60),
    pincode: String(settings.pincode || '').slice(0, 12),
    gstin: String(settings.gstin || '').slice(0, 30),
    openingHours: String(settings.openingHours || '').slice(0, 120),
    openingHoursMr: String(settings.openingHoursMr || '').slice(0, 120),
    googleMapsUrl: String(settings.googleMapsUrl || '').slice(0, 500),
    freeShippingThreshold: Math.max(0, Number(settings.freeShippingThreshold) || 0),
    standardShippingFee: Math.max(0, Number(settings.standardShippingFee) || 0),
    razorpayKeyId: String(settings.razorpayKeyId || '').slice(0, 120),
    isRazorpayTestMode: Boolean(settings.isRazorpayTestMode),
    upiId: String(settings.upiId || '').slice(0, 100),
    upiPayeeName: String(settings.upiPayeeName || '').slice(0, 100),
    enableUpi: settings.enableUpi ?? true,
    enableCards: settings.enableCards ?? true,
    enableNetBanking: settings.enableNetBanking ?? true,
    enableCod: settings.enableCod ?? true,
    announcementText: String(settings.announcementText || '').slice(0, 300),
    announcementTextMr: String(settings.announcementTextMr || '').slice(0, 300),
    heroBanners: Array.isArray(settings.heroBanners) ? settings.heroBanners.slice(0, 10) : [],
    qrCodeUrl: String(settings.qrCodeUrl || '').slice(0, 1000),
    bankAccountName: String(settings.bankAccountName || '').slice(0, 120),
    bankAccountNumber: String(settings.bankAccountNumber || '').slice(0, 40),
    bankIfsc: String(settings.bankIfsc || '').slice(0, 30),
    bankName: String(settings.bankName || '').slice(0, 120),
    fast2smsApiKey: String(settings.fast2smsApiKey || '').slice(0, 200),
    deletedProductIds: Array.isArray(settings.deletedProductIds) ? settings.deletedProductIds.slice(0, 200) : [],
    updatedAt: serverTimestamp(),
  };

  try {
    if (ownerFieldsOnly) {
      const existingSnap = await getDoc(ref);
      if (existingSnap.exists()) {
        await updateDoc(ref, {
          heroBanners: payload.heroBanners,
          upiId: payload.upiId,
          upiPayeeName: payload.upiPayeeName,
          enableUpi: payload.enableUpi,
          enableCards: payload.enableCards,
          enableNetBanking: payload.enableNetBanking,
          enableCod: payload.enableCod,
          razorpayKeyId: payload.razorpayKeyId,
          isRazorpayTestMode: payload.isRazorpayTestMode,
          qrCodeUrl: payload.qrCodeUrl,
          bankAccountName: payload.bankAccountName,
          bankAccountNumber: payload.bankAccountNumber,
          bankIfsc: payload.bankIfsc,
          bankName: payload.bankName,
          fast2smsApiKey: payload.fast2smsApiKey,
          updatedAt: serverTimestamp(),
        });
        return;
      }
    }
    await setDoc(ref, payload);
  } catch (err) {
    console.warn(`Firestore settings sync warning (${path}):`, err);
  }
}

export function subscribeToFirestoreProducts(
  onUpdate: (cloudProducts: Product[]) => void
) {
  return onSnapshot(
    collection(db, 'products'),
    (snapshot) => {
      const list = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          ...data,
          id: data.id || d.id,
          images: Array.isArray(data.images) ? data.images : [],
        } as Product;
      });
      onUpdate(list);
    },
    (err) => {
      console.warn('Firestore products listener notice:', err?.message);
    }
  );
}

export function subscribeToFirestoreSettings(
  onUpdate: (cloudSettings: Partial<StoreSettings>) => void
) {
  return onSnapshot(
    doc(db, 'storeSettings', 'main'),
    (snapshot) => {
      if (snapshot.exists()) {
        onUpdate(snapshot.data() as Partial<StoreSettings>);
      }
    },
    (err) => {
      console.warn('Firestore storeSettings listener notice:', err?.message);
    }
  );
}

export {
  onAuthStateChanged,
  signOut,
};

export type { FirebaseUser };
