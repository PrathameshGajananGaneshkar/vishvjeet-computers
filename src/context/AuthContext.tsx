import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProfile, ShippingAddress, UserRole } from '../types';
import {
  auth,
  signOut,
  onAuthStateChanged,
  FirebaseUser,
  syncFirebaseUserProfile,
  updateFirestoreUserProfile,
} from '../firebase';

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  user: UserProfile | null;
  authLoading: boolean;
  authError: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isOwner: boolean;
  isCustomer: boolean;
  role: UserRole;
  isFirstTimeLoginOpen: boolean;
  openFirstTimeLogin: () => void;
  closeFirstTimeLogin: () => void;
  completeFirebaseLogin: (fbUser: FirebaseUser) => Promise<UserProfile>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  addAddress: (address: ShippingAddress) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isFirstTimeLoginOpen, setIsFirstTimeLoginOpen] = useState<boolean>(false);

  const openFirstTimeLogin = useCallback(() => {
    setIsFirstTimeLoginOpen(true);
  }, []);

  const closeFirstTimeLogin = useCallback(() => {
    if (auth.currentUser) {
      setIsFirstTimeLoginOpen(false);
    }
  }, []);

  const completeFirebaseLogin = useCallback(async (fbUser: FirebaseUser): Promise<UserProfile> => {
    setAuthError(null);
    const profile = await syncFirebaseUserProfile(fbUser);
    setFirebaseUser(fbUser);
    setUser(profile);
    setIsFirstTimeLoginOpen(false);
    return profile;
  }, []);

  // Listen to Firebase Auth persistence state across refreshes and logins/logouts
  useEffect(() => {
    // Clean up any legacy insecure localStorage mock sessions
    localStorage.removeItem('vc_user');

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setFirebaseUser(fbUser);
        try {
          const profile = await syncFirebaseUserProfile(fbUser);
          setUser(profile);
          setIsFirstTimeLoginOpen(false);
          setAuthError(null);
        } catch (err: any) {
          console.error('Failed to load/create customer profile in Firestore:', err);
          setAuthError('Unable to sync customer profile from Firestore.');
          // Still keep minimal verified phone identity if Firestore read fails temporarily
          const digits = (fbUser.phoneNumber || '').replace(/\D/g, '').slice(-10);
          const fallbackRole: UserRole =
            fbUser.emailVerified && fbUser.email === 'p.ganeshkar8788@gmail.com' ? 'admin' : 'customer';
          setUser({
            id: fbUser.uid,
            name:
              fbUser.displayName ||
              (digits ? `Customer (+91 ${digits})` : fbUser.email?.split('@')[0] || 'Verified Customer'),
            email: fbUser.email || '',
            phone: digits || fbUser.phoneNumber || '',
            role: fallbackRole,
            savedPincode: '443201',
            addresses: [],
          });
          setIsFirstTimeLoginOpen(false);
        }
      } else {
        setFirebaseUser(null);
        setUser(null);
        setIsFirstTimeLoginOpen(true);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Firebase signOut error:', err);
    } finally {
      setFirebaseUser(null);
      setUser(null);
      localStorage.removeItem('vc_user');
      setIsFirstTimeLoginOpen(true);
    }
  }, []);

  const updateProfile = useCallback(
    async (data: Partial<UserProfile>) => {
      if (!user || !firebaseUser) return;
      const updated: UserProfile = {
        ...user,
        name: data.name !== undefined ? data.name : user.name,
        email: data.email !== undefined ? data.email : user.email,
        phone: data.phone !== undefined ? data.phone : user.phone,
        savedPincode: data.savedPincode !== undefined ? data.savedPincode : user.savedPincode,
        addresses: data.addresses !== undefined ? data.addresses : user.addresses,
      };
      await updateFirestoreUserProfile(firebaseUser.uid, {
        name: updated.name,
        email: updated.email,
        ...(firebaseUser.phoneNumber ? {} : { phone: updated.phone }),
        savedPincode: updated.savedPincode,
        addresses: updated.addresses,
      });
      setUser(updated);
    },
    [user, firebaseUser]
  );

  const addAddress = useCallback(
    async (address: ShippingAddress) => {
      if (!user || !firebaseUser) return;
      const nextAddresses = [
        address,
        ...user.addresses.filter((a) => a.streetArea !== address.streetArea),
      ].slice(0, 10);
      await updateFirestoreUserProfile(firebaseUser.uid, {
        addresses: nextAddresses,
        savedPincode: address.pincode || user.savedPincode,
      });
      setUser({
        ...user,
        addresses: nextAddresses,
        savedPincode: address.pincode || user.savedPincode,
      });
    },
    [user, firebaseUser]
  );

  const isAuthenticated = Boolean(firebaseUser && user);
  const role: UserRole = user?.role || 'customer';
  const isAdmin = isAuthenticated && role === 'admin';
  const isOwner = isAuthenticated && role === 'owner';
  const isCustomer = isAuthenticated && role === 'customer';

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        user,
        authLoading,
        authError,
        isAuthenticated,
        isAdmin,
        isOwner,
        isCustomer,
        role,
        isFirstTimeLoginOpen,
        openFirstTimeLogin,
        closeFirstTimeLogin,
        completeFirebaseLogin,
        logout,
        updateProfile,
        addAddress,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
