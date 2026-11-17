import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * AuthModal delegates directly to the Firebase Mobile Number OTP login page
 * to ensure no authentication bypasses exist anywhere in the storefront.
 */
export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { openFirstTimeLogin, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isOpen) {
      if (isAuthenticated) {
        onSuccess();
        onClose();
      } else {
        openFirstTimeLogin();
        onClose();
      }
    }
  }, [isOpen, isAuthenticated, openFirstTimeLogin, onClose, onSuccess]);

  return null;
};
