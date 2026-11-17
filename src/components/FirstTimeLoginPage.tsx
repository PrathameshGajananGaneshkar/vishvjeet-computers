import React, { useState } from 'react';
import {
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  Lock,
  AlertTriangle,
  Sparkles,
  Laptop,
  Wrench,
  Truck,
  ExternalLink,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { firebaseConfig, signInWithGooglePopup } from '../firebase';

interface FirstTimeLoginPageProps {
  onSuccess?: () => void;
}

export const FirstTimeLoginPage: React.FC<FirstTimeLoginPageProps> = ({ onSuccess }) => {
  const { completeFirebaseLogin } = useAuth();

  const [isSigningInWithGoogle, setIsSigningInWithGoogle] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [setupGuidance, setSetupGuidance] = useState<{
    text: string;
    url?: string;
    linkLabel?: string;
  } | null>(null);

  const mapFirebaseAuthError = (
    err: any
  ): { message: string; guidance?: { text: string; url?: string; linkLabel?: string } } => {
    const code = err?.code || '';
    const rawMsg = err?.message || String(err || '');
    const projectId = firebaseConfig.projectId;

    switch (code) {
      case 'auth/popup-closed-by-user':
      case 'auth/cancelled-popup-request':
        return {
          message: 'Google sign-in popup was closed before completing login. Please try again.',
        };
      case 'auth/popup-blocked':
        return {
          message:
            'Google sign-in popup was blocked by your browser. Please allow popups for this site and try again.',
        };
      case 'auth/operation-not-allowed':
        return {
          message: 'Google Sign-In is not enabled yet in your Firebase project.',
          guidance: {
            text: `Open Firebase Console for project "${projectId}" -> Authentication -> Sign-in method -> click "Google" -> Enable -> Save.`,
            url: `https://console.firebase.google.com/project/${projectId}/authentication/providers`,
            linkLabel: 'Enable Google Sign-In in Firebase Console',
          },
        };
      case 'auth/unauthorized-domain':
        return {
          message: `This domain (${window.location.hostname}) is not authorized for Google Sign-In.`,
          guidance: {
            text: `Open Firebase Console -> Authentication -> Settings -> Authorized domains -> Add "${window.location.hostname}".`,
            url: `https://console.firebase.google.com/project/${projectId}/authentication/settings`,
            linkLabel: 'Add Authorized Domain in Firebase Console',
          },
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
          message: rawMsg || 'Google sign-in failed. Please try again.',
        };
    }
  };

  const handleGoogleSignIn = async () => {
    if (isSigningInWithGoogle) return;
    setErrorMessage(null);
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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
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
                Login / Sign Up
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
            <span>Secured by Firebase Google Authentication</span>
          </div>
        </div>

        {/* Right Panel: Continue with Google Sign-In */}
        <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between bg-white space-y-6">
          <div className="space-y-5">
            {/* Subheader */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <div>
                <span className="text-[11px] font-bold uppercase text-[#2874f0] tracking-wider flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Google Account Sign-In</span>
                </span>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-0.5">
                  Sign in to Continue
                </h2>
              </div>
              <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1 rounded-full font-bold inline-flex items-center gap-1">
                <Zap className="w-3 h-3" />
                <span>1-Click</span>
              </span>
            </div>

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

            {/* Instant Google Login Overview */}
            <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2.5">
              <div className="text-xs font-bold text-slate-800">
                Fast & Secure Store Access
              </div>
              <div className="space-y-1.5 text-[11px] text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Instant sign-in using your verified Google account</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Track hardware orders, GST invoices & repair service tickets</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Add your delivery mobile number & address anytime in Profile</span>
                </div>
              </div>
            </div>

            {/* Continue with Google Primary Action */}
            <div className="space-y-3 pt-1">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isSigningInWithGoogle}
                className="w-full py-3.5 px-5 bg-white hover:bg-slate-50 text-slate-900 font-extrabold rounded-2xl text-sm border-2 border-slate-300 hover:border-[#2874f0] shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSigningInWithGoogle ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-[#2874f0]" />
                    <span>Signing in with Google...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
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

              <p className="text-[11px] text-slate-500 leading-relaxed text-center px-2">
                By continuing, you agree to VishwaJit Computers Terms of Use and Privacy Policy. New customers are registered automatically upon Google sign-in.
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Protected by Firebase Authentication</span>
            <span>VishwaJit Computers • Chikhli</span>
          </div>
        </div>
      </div>
    </div>
  );
};
