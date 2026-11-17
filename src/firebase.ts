import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
  setPersistence,
  browserLocalPersistence,
  ConfirmationResult,
  Auth,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  updateDoc,
  serverTimestamp,
  Firestore,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { ShippingAddress, UserProfile, UserRole } from './types';

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

// --- RECAPTCHA VERIFIER & PHONE AUTH ---
export function clearRecaptchaVerifier(containerId: string = 'recaptcha-container'): void {
  if (typeof window === 'undefined') return;
  const win = window as any;
  if (win.recaptchaVerifier) {
    try {
      win.recaptchaVerifier.clear();
    } catch {
      // ignore cleanup error
    }
    win.recaptchaVerifier = null;
  }
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = '';
  }
}

/**
 * Initialize a clean Firebase RecaptchaVerifier instance.
 * Clears any previous instance to safely support retries & Resend OTP.
 */
export function initRecaptchaVerifier(
  containerId: string = 'recaptcha-container',
  size: 'invisible' | 'normal' = 'invisible',
  onExpired?: () => void
): RecaptchaVerifier {
  if (typeof window === 'undefined') {
    throw new Error('reCAPTCHA can only be initialized in a browser environment.');
  }

  clearRecaptchaVerifier(containerId);

  const container = document.getElementById(containerId);
  if (!container) {
    throw new Error(`reCAPTCHA container #${containerId} not found in DOM.`);
  }

  const verifier = new RecaptchaVerifier(auth, containerId, {
    size,
    callback: () => {
      // reCAPTCHA solved automatically or by user
    },
    'expired-callback': () => {
      console.warn('reCAPTCHA challenge expired.');
      if (onExpired) onExpired();
    },
  });

  (window as any).recaptchaVerifier = verifier;
  return verifier;
}

/**
 * Send a real 6-digit SMS OTP via Firebase Authentication Phone Provider.
 */
export async function sendFirebasePhoneOtp(
  phoneNumberE164: string,
  verifier: RecaptchaVerifier
): Promise<ConfirmationResult> {
  return await signInWithPhoneNumber(auth, phoneNumberE164, verifier);
}

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

/**
 * Sign in using Firebase Google Authentication Popup.
 */
export async function signInWithGooglePopup() {
  return await signInWithPopup(auth, googleProvider);
}

// --- FIRESTORE CUSTOMER PROFILE SYNC ---
const ADMIN_PHONES = ['8788409279', '8956664295'];
const OWNER_PHONES = ['9876543210'];

function inferStoreRoleFromVerifiedUser(fbUser: FirebaseUser, firestoreRole?: UserRole): UserRole {
  if (firestoreRole && ['admin', 'owner', 'customer'].includes(firestoreRole)) {
    return firestoreRole;
  }
  const digits = (fbUser.phoneNumber || '').replace(/\D/g, '').slice(-10);
  if (
    (fbUser.emailVerified && fbUser.email === 'p.ganeshkar8788@gmail.com') ||
    ADMIN_PHONES.includes(digits)
  ) {
    return 'admin';
  }
  if (OWNER_PHONES.includes(digits)) {
    return 'owner';
  }
  return 'customer';
}

/**
 * Fetch or create the authenticated user's profile in Firestore `/users/{uid}`.
 * Ensures verified mobile number is persisted securely and creates a new customer record on first login.
 */
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
    // Only throw structured error on real permission/network issues
    handleFirestoreError(err, OperationType.GET, userDocPath);
  }

  if (existingSnap.exists()) {
    const data = existingSnap.data();
    const role = inferStoreRoleFromVerifiedUser(fbUser, data.role as UserRole);
    const storedPhone = typeof data.phone === 'string' ? data.phone : '';
    const storedDigits = storedPhone.replace(/\D/g, '').slice(-10);
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

  // First-time customer login: create Firestore profile with role: 'customer'
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
    role: 'customer',
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

  const effectiveRole = inferStoreRoleFromVerifiedUser(fbUser, 'customer');
  return {
    id: fbUser.uid,
    name: defaultName,
    email: fbUser.email || '',
    phone: displayPhone,
    role: effectiveRole,
    savedPincode: '443201',
    addresses: [defaultAddress],
  };
}

/**
 * Update customer profile fields in Firestore `/users/{uid}`.
 */
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

export {
  signInWithPhoneNumber,
  onAuthStateChanged,
  signOut,
  RecaptchaVerifier,
};

export type { ConfirmationResult, FirebaseUser };
