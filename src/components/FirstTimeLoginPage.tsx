import React, { useState, useEffect, useRef } from 'react';
import {
  Smartphone,
  ArrowRight,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  Lock,
  AlertTriangle,
  Sparkles,
  Laptop,
  Wrench,
  Truck,
  ArrowLeft,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  firebaseConfig,
  initRecaptchaVerifier,
  clearRecaptchaVerifier,
  sendFirebasePhoneOtp,
  signInWithGooglePopup,
  ConfirmationResult,
  RecaptchaVerifier,
} from '../firebase';

interface FirstTimeLoginPageProps {
  onSuccess?: () => void;
}

const INDIAN_MOBILE_REGEX = /^[6-9]\d{9}$/;

export const FirstTimeLoginPage: React.FC<FirstTimeLoginPageProps> = ({ onSuccess }) => {
  const { completeFirebaseLogin } = useAuth();

  // Phone input state
  const [phoneNumber, setPhoneNumber] = useState('');

  // OTP verification step state
  const [otpStep, setOtpStep] = useState(false);
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [otpTimer, setOtpTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  // Loading & feedback states
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isSigningInWithGoogle, setIsSigningInWithGoogle] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [setupGuidance, setSetupGuidance] = useState<{ text: string; url?: string; linkLabel?: string } | null>(null);

  // Firebase Phone Auth references
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const enteredOtp = otpDigits.join('');
  const cleanDigits = phoneNumber.replace(/\D/g, '');
  const isValidIndianMobile = INDIAN_MOBILE_REGEX.test(cleanDigits);

  // Cleanup reCAPTCHA on unmount
  useEffect(() => {
    return () => {
      clearRecaptchaVerifier('recaptcha-container');
    };
  }, []);

  // Strict 30-second Resend OTP countdown timer
  useEffect(() => {
    if (!otpStep) return;
    if (otpTimer <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setInterval(() => {
      setOtpTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [otpStep, otpTimer]);

  // WebOTP API for Android SMS auto-fill
  useEffect(() => {
    if (!otpStep || typeof window === 'undefined') return;
    if ('OTPCredential' in window) {
      const ac = new AbortController();
      (navigator.credentials as any)
        ?.get({
          otp: { transport: ['sms'] },
          signal: ac.signal,
        })
        .then((otpCredential: any) => {
          if (otpCredential?.code && /^\d{6}$/.test(otpCredential.code)) {
            setOtpDigits(otpCredential.code.split(''));
          }
        })
        .catch(() => {
          // Ignore if unsupported or cancelled
        });
      return () => ac.abort();
    }
  }, [otpStep]);

  // Human-readable Firebase Phone Auth error mapper
  const mapFirebaseAuthError = (
    err: any
  ): { message: string; guidance?: { text: string; url?: string; linkLabel?: string } } => {
    const code = err?.code || '';
    const rawMsg = err?.message || String(err || '');
    const projectId = firebaseConfig.projectId;

    switch (code) {
      case 'auth/invalid-phone-number':
      case 'auth/missing-phone-number':
        return {
          message: 'Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.',
        };
      case 'auth/invalid-verification-code':
        return {
          message: 'Incorrect 6-digit OTP code. Please check your SMS and enter the exact code.',
        };
      case 'auth/code-expired':
        return {
          message: 'This OTP has expired. Please click "Resend OTP" to request a new SMS code.',
        };
      case 'auth/too-many-requests':
        return {
          message:
            'Too many OTP requests from this device or mobile number. Please wait a few minutes before requesting another OTP.',
        };
      case 'auth/quota-exceeded':
        return {
          message: 'Firebase SMS quota has been exceeded for this project.',
          guidance: {
            text: `Upgrade project "${projectId}" to the Blaze plan or add test phone numbers in Firebase Console -> Authentication -> Sign-in method -> Phone.`,
            url: `https://console.firebase.google.com/project/${projectId}/authentication/providers`,
            linkLabel: 'Open Firebase Auth Providers',
          },
        };
      case 'auth/operation-not-allowed':
        return {
          message: 'Phone Number Sign-In is not enabled yet in your Firebase project.',
          guidance: {
            text: `Open Firebase Console for project "${projectId}" -> Authentication -> Sign-in method -> click "Phone" -> Enable -> Save.`,
            url: `https://console.firebase.google.com/project/${projectId}/authentication/providers`,
            linkLabel: 'Enable Phone Auth in Firebase Console',
          },
        };
      case 'auth/unauthorized-domain':
        return {
          message: `This domain (${window.location.hostname}) is not authorized for Firebase Phone Auth.`,
          guidance: {
            text: `Open Firebase Console -> Authentication -> Settings -> Authorized domains -> Add "${window.location.hostname}".`,
            url: `https://console.firebase.google.com/project/${projectId}/authentication/settings`,
            linkLabel: 'Add Authorized Domain in Firebase Console',
          },
        };
      case 'auth/captcha-check-failed':
      case 'auth/missing-client-identifier':
        return {
          message: 'reCAPTCHA verification failed or expired. Please click Send OTP again.',
        };
      case 'auth/popup-closed-by-user':
        return {
          message: 'Google sign-in popup was closed before completing login. Please try again.',
        };
      case 'auth/popup-blocked':
        return {
          message: 'Google sign-in popup was blocked by your browser. Please allow popups for this site and try again.',
        };
      case 'auth/account-exists-with-different-credential':
        return {
          message: 'An account already exists with this email using another sign-in method.',
        };
      case 'auth/network-request-failed':
        return {
          message: 'Network connection error. Please check your internet connection and try again.',
        };
      default:
        return {
          message: rawMsg || 'Authentication failed. Please verify your details and try again.',
        };
    }
  };

  // Sign in with Google via Firebase Popup
  const handleGoogleSignIn = async () => {
    if (isSigningInWithGoogle || isSendingOtp || isVerifyingOtp) return;
    setErrorMessage(null);
    setInfoMessage(null);
    setSetupGuidance(null);
    setIsSigningInWithGoogle(true);

    try {
      const userCredential = await signInWithGooglePopup();
      if (userCredential?.user) {
        await completeFirebaseLogin(userCredential.user);
        if (onSuccess) onSuccess();
      }
    } catch (err: any) {
      console.warn('Firebase Google Sign-In notice:', err?.code || err?.message || err);
      const mapped = mapFirebaseAuthError(err);
      setErrorMessage(mapped.message);
      if (mapped.guidance) {
        setSetupGuidance(mapped.guidance);
      }
    } finally {
      setIsSigningInWithGoogle(false);
    }
  };

  // Dispatch Real SMS OTP using Firebase signInWithPhoneNumber + reCAPTCHA
  const dispatchPhoneOtp = async (isResend: boolean = false) => {
    if (isSendingOtp || isVerifyingOtp) return;

    setErrorMessage(null);
    setInfoMessage(null);
    setSetupGuidance(null);

    if (!isValidIndianMobile) {
      setErrorMessage('Please enter a valid 10-digit Indian mobile number (must start with 6, 7, 8, or 9).');
      return;
    }

    const formattedPhoneE164 = `+91${cleanDigits}`;
    setIsSendingOtp(true);

    try {
      const verifier = initRecaptchaVerifier('recaptcha-container', 'invisible', () => {
        setErrorMessage('reCAPTCHA expired. Please request a fresh OTP.');
      });
      recaptchaVerifierRef.current = verifier;

      const result = await sendFirebasePhoneOtp(formattedPhoneE164, verifier);
      setConfirmationResult(result);

      setOtpStep(true);
      setOtpDigits(['', '', '', '', '', '']);
      setOtpTimer(30);
      setCanResend(false);
      setInfoMessage(
        isResend
          ? `A new 6-digit OTP has been sent via SMS to +91 ${cleanDigits}.`
          : `A 6-digit OTP has been sent via SMS to +91 ${cleanDigits}.`
      );

      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 150);
    } catch (err: any) {
      console.warn('Firebase Phone OTP notice:', err?.code || err?.message || err);
      clearRecaptchaVerifier('recaptcha-container');
      recaptchaVerifierRef.current = null;
      const mapped = mapFirebaseAuthError(err);
      setErrorMessage(mapped.message);
      if (mapped.guidance) {
        setSetupGuidance(mapped.guidance);
      }
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleRequestPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    await dispatchPhoneOtp(false);
  };

  const handleResendOtp = async () => {
    if (!canResend || isSendingOtp || isVerifyingOtp) return;
    await dispatchPhoneOtp(true);
  };

  // Segmented 6-digit OTP Handlers
  const handleOtpChange = (index: number, value: string) => {
    const numeric = value.replace(/\D/g, '');
    if (!numeric) {
      const updated = [...otpDigits];
      updated[index] = '';
      setOtpDigits(updated);
      return;
    }

    // Handle multi-digit input (e.g. mobile keyboard auto-fill)
    if (numeric.length > 1) {
      const chars = numeric.slice(0, 6).split('');
      const updated = ['', '', '', '', '', ''];
      chars.forEach((ch, idx) => {
        updated[idx] = ch;
      });
      setOtpDigits(updated);
      const nextIndex = Math.min(chars.length, 5);
      otpInputRefs.current[nextIndex]?.focus();
      return;
    }

    const updated = [...otpDigits];
    updated[index] = numeric;
    setOtpDigits(updated);

    if (index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (otpDigits[index]) {
        const updated = [...otpDigits];
        updated[index] = '';
        setOtpDigits(updated);
      } else if (index > 0) {
        otpInputRefs.current[index - 1]?.focus();
        const updated = [...otpDigits];
        updated[index - 1] = '';
        setOtpDigits(updated);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const updated = ['', '', '', '', '', ''];
    pasted.split('').forEach((ch, idx) => {
      updated[idx] = ch;
    });
    setOtpDigits(updated);
    const focusIdx = Math.min(pasted.length, 5);
    otpInputRefs.current[focusIdx]?.focus();
  };

  // Verify 6-digit OTP via Firebase ConfirmationResult.confirm()
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isVerifyingOtp || isSendingOtp) return;

    setErrorMessage(null);
    setSetupGuidance(null);

    if (enteredOtp.length !== 6) {
      setErrorMessage('Please enter the complete 6-digit OTP received via SMS.');
      return;
    }

    if (!confirmationResult) {
      setErrorMessage('OTP session expired or not initialized. Please request a new OTP.');
      return;
    }

    setIsVerifyingOtp(true);
    try {
      const userCredential = await confirmationResult.confirm(enteredOtp);
      if (userCredential?.user) {
        await completeFirebaseLogin(userCredential.user);
        if (onSuccess) onSuccess();
      } else {
        setErrorMessage('Verification could not be completed. Please try again.');
      }
    } catch (err: any) {
      console.warn('Firebase OTP confirm notice:', err?.code || err?.message || err);
      const mapped = mapFirebaseAuthError(err);
      setErrorMessage(mapped.message);
      if (mapped.guidance) {
        setSetupGuidance(mapped.guidance);
      }
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      {/* Firebase reCAPTCHA mount point */}
      <div id="recaptcha-container"></div>

      {/* Flipkart-inspired Split Card */}
      <div className="relative bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden grid grid-cols-1 md:grid-cols-12 my-4">
        
        {/* Left Panel: VishwaJit Computers Flipkart-Style Branding */}
        <div className="md:col-span-5 bg-[#2874f0] text-white p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-12 -bottom-12 w-44 h-44 rounded-full bg-white/10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-10 bg-[radial-gradient(#fff_2px,transparent_2px)] [background-size:14px_14px] pointer-events-none"></div>

          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-400 text-slate-950 font-black text-[10px] uppercase tracking-wider shadow-xs">
              <Sparkles className="w-3 h-3" />
              <span>VishwaJit Computers</span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                {otpStep ? 'Verify OTP' : 'Login / Sign Up'}
              </h1>
              <p className="text-xs sm:text-sm text-blue-100 mt-2 leading-relaxed">
                Get access to your Orders, Wishlist, Repair Tickets & Express Chikhli Store Delivery.
              </p>
            </div>

            <div className="hidden md:block pt-4 space-y-3 border-t border-blue-400/30 text-xs text-blue-50">
              <div className="flex items-center gap-2.5">
                <Laptop className="w-4 h-4 text-yellow-300 shrink-0" />
                <span>Genuine Laptops, Desktops & Printers</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Wrench className="w-4 h-4 text-yellow-300 shrink-0" />
                <span>On-Site & Store IT Repair Tracking</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Truck className="w-4 h-4 text-yellow-300 shrink-0" />
                <span>Same-Day Local Dispatch in Buldhana</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-6 pt-4 border-t border-blue-400/30 flex items-center gap-2 text-[11px] text-blue-100">
            <ShieldCheck className="w-4 h-4 text-emerald-300 shrink-0" />
            <span>Secured by Firebase SMS Authentication</span>
          </div>
        </div>

        {/* Right Panel: Mobile Number & Real OTP Form */}
        <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between bg-white space-y-6">
          <div className="space-y-5">
            {/* Subheader */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[11px] font-bold uppercase text-[#2874f0] tracking-wider flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Mobile OTP Sign-In</span>
                </span>
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 mt-0.5">
                  {otpStep ? 'Enter 6-Digit SMS Code' : 'Enter Your Mobile Number'}
                </h2>
              </div>
              <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1 rounded-full font-bold">
                reCAPTCHA
              </span>
            </div>

            {/* Info Banner */}
            {infoMessage && !errorMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs font-medium flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">{infoMessage}</div>
              </div>
            )}

            {/* Error Banner */}
            {errorMessage && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-900 rounded-2xl text-xs space-y-1.5">
                <div className="flex items-start gap-2 font-semibold">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{errorMessage}</span>
                </div>
                {setupGuidance && (
                  <div className="ml-6 p-3 bg-white border border-rose-200 rounded-xl text-[11px] text-slate-700 leading-relaxed space-y-2">
                    <div>
                      <strong className="text-rose-800 block mb-0.5">Firebase Console Setup Required:</strong>
                      <span>{setupGuidance.text}</span>
                    </div>
                    {setupGuidance.url && (
                      <a
                        href={setupGuidance.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#2874f0] hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
                      >
                        <span>{setupGuidance.linkLabel || 'Open Firebase Console'}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            )}

            {!otpStep ? (
              /* STEP 1: +91 Mobile Number Entry */
              <form onSubmit={handleRequestPhoneOtp} className="space-y-4">
                <div>
                  <label
                    htmlFor="login-mobile-input"
                    className="text-xs font-bold text-slate-700 block mb-2"
                  >
                    10-Digit Indian Mobile Number *
                  </label>
                  <div className="flex items-center rounded-2xl border-2 border-slate-300 focus-within:border-[#2874f0] bg-white overflow-hidden transition-all shadow-xs">
                    <span className="px-3.5 py-3.5 bg-slate-50 border-r border-slate-200 font-bold text-xs sm:text-sm text-slate-800 flex items-center gap-1.5 select-none">
                      <span>🇮🇳</span>
                      <span>+91</span>
                    </span>
                    <input
                      id="login-mobile-input"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel-national"
                      maxLength={10}
                      value={phoneNumber}
                      onChange={(e) => {
                        setPhoneNumber(e.target.value.replace(/\D/g, ''));
                        if (errorMessage) setErrorMessage(null);
                      }}
                      placeholder="Enter 10-digit mobile number"
                      className="flex-1 px-4 py-3.5 text-sm font-semibold outline-none text-slate-900 placeholder:text-slate-400 tracking-wide"
                      autoFocus
                    />
                    {isValidIndianMobile && (
                      <span className="pr-3 text-emerald-600" title="Valid Indian mobile number">
                        <CheckCircle2 className="w-4 h-4" />
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-1.5 text-[11px] text-slate-500">
                    <span>We will send a real 6-digit SMS OTP via Firebase.</span>
                    <span className="font-mono font-semibold text-slate-600">
                      {cleanDigits.length}/10
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed">
                  By continuing, you agree to VishwaJit Computers Terms of Use and Privacy Policy. New customers are registered automatically upon OTP verification.
                </p>

                <button
                  type="submit"
                  disabled={isSendingOtp || isSigningInWithGoogle || cleanDigits.length < 10}
                  className="w-full py-3.5 bg-[#fb641b] hover:bg-[#e85b17] text-white font-extrabold rounded-2xl text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSendingOtp ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Sending SMS OTP...</span>
                    </>
                  ) : (
                    <>
                      <Smartphone className="w-4 h-4" />
                      <span>Send OTP</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Divider */}
                <div className="relative flex items-center py-1">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="shrink-0 mx-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    OR
                  </span>
                  <div className="flex-grow border-t border-slate-200"></div>
                </div>

                {/* Continue with Google Button */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isSigningInWithGoogle || isSendingOtp}
                  className="w-full py-3 px-4 bg-white hover:bg-slate-50 text-slate-800 font-bold rounded-2xl text-xs sm:text-sm border-2 border-slate-200 hover:border-slate-300 shadow-xs transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSigningInWithGoogle ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-[#2874f0]" />
                      <span>Connecting to Google...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                        <path
                          fill="#4285F4"
                          d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"
                        />
                      </svg>
                      <span>Continue with Google</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* STEP 2: 6-Digit OTP Verification & 30s Resend Timer */
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[11px] text-blue-700 font-semibold block">
                      SMS OTP sent to mobile number:
                    </span>
                    <span className="font-mono font-extrabold text-sm text-blue-950">
                      +91 {cleanDigits}
                    </span>
                  </div>
                  <button
                    type="button"
                    disabled={isVerifyingOtp || isSendingOtp}
                    onClick={() => {
                      setOtpStep(false);
                      setOtpDigits(['', '', '', '', '', '']);
                      setErrorMessage(null);
                      setInfoMessage(null);
                      setSetupGuidance(null);
                      setConfirmationResult(null);
                      clearRecaptchaVerifier('recaptcha-container');
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-blue-200 text-[11px] text-[#2874f0] hover:bg-blue-100 font-bold cursor-pointer transition-colors disabled:opacity-50"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    <span>Change</span>
                  </button>
                </div>

                {/* 6-Digit Segmented OTP Input */}
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-2.5">
                    Enter 6-Digit Verification Code *
                  </label>
                  <div className="grid grid-cols-6 gap-2 sm:gap-3">
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => {
                          otpInputRefs.current[idx] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        autoComplete={idx === 0 ? 'one-time-code' : 'off'}
                        maxLength={6}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        onPaste={handleOtpPaste}
                        aria-label={`OTP digit ${idx + 1}`}
                        className="w-full h-12 sm:h-14 text-center text-lg sm:text-xl font-mono font-black bg-slate-50 border-2 border-slate-300 focus:border-[#2874f0] focus:bg-white rounded-xl outline-none transition-all text-slate-900 shadow-xs"
                      />
                    ))}
                  </div>
                </div>

                {/* 30-Second Resend Countdown */}
                <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                  <span>
                    {!canResend && otpTimer > 0 ? (
                      <span>
                        Resend OTP in <strong className="font-mono text-slate-900">{otpTimer}s</strong>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={isSendingOtp || isVerifyingOtp}
                        className="text-[#2874f0] hover:text-blue-800 font-bold underline cursor-pointer disabled:opacity-50"
                      >
                        {isSendingOtp ? 'Resending...' : 'Resend OTP'}
                      </button>
                    )}
                  </span>

                  <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Firebase Verified</span>
                  </span>
                </div>

                {/* Verify & Login Button */}
                <button
                  type="submit"
                  disabled={isVerifyingOtp || isSendingOtp || enteredOtp.length !== 6}
                  className="w-full py-3.5 bg-[#fb641b] hover:bg-[#e85b17] text-white font-extrabold rounded-2xl text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isVerifyingOtp ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Verifying OTP...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify OTP & Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Protected by Google reCAPTCHA</span>
            <span>VishwaJit Computers • Chikhli</span>
          </div>
        </div>
      </div>
    </div>
  );
};
