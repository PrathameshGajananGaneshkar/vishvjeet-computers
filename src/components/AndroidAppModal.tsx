import React, { useState } from 'react';
import { 
  X, 
  Smartphone, 
  Download, 
  CheckCircle2, 
  Copy, 
  ExternalLink, 
  Sparkles, 
  ShieldCheck, 
  Code, 
  Play, 
  Layers, 
  FileCode2, 
  HelpCircle,
  QrCode,
  Share2,
  Check
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { usePWAInstall } from '../utils/usePWAInstall';

interface AndroidAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  onToggleMobileSimulator?: () => void;
  isMobileSimulatorActive?: boolean;
}

export const AndroidAppModal: React.FC<AndroidAppModalProps> = ({
  isOpen,
  onClose,
  onToggleMobileSimulator,
  isMobileSimulatorActive = false,
}) => {
  const { language } = useLanguage();
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'guide' | 'files' | 'simulator'>('guide');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const twaManifest = JSON.stringify({
    packageId: "com.vishvjeetcomputer.app",
    host: window.location.host || "vishvjeetcomputer.web.app",
    name: "Vishvjeet Computer",
    launcherName: "Vishvjeet",
    themeColor: "#2874f0",
    navigationColor: "#2874f0",
    backgroundColor: "#ffffff",
    enableNotifications: true,
    startUrl: "/",
    iconUrl: `${window.location.origin}/icon.svg`,
    maskableIconUrl: `${window.location.origin}/icon.svg`,
    appVersion: "1.0.0",
    appVersionCode: 1,
    shortcuts: [
      {
        name: "Book Repair",
        short_name: "Repair",
        url: "/#services"
      },
      {
        name: "Laptops & Desktops",
        short_name: "Laptops",
        url: "/#laptops"
      }
    ]
  }, null, 2);

  const androidManifestXml = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.vishvjeetcomputer.app">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="Vishvjeet Computer"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.LauncherActivity">

        <activity
            android:name="com.google.androidbrowserhelper.trusted.LauncherActivity"
            android:exported="true"
            android:screenOrientation="portrait">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>

            <!-- TWA URL Intent Filter for Google Play Store -->
            <intent-filter android:autoVerify="true">
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data
                    android:scheme="https"
                    android:host="${window.location.host || 'vishvjeetcomputer.web.app'}" />
            </intent-filter>
        </activity>
    </application>
</manifest>`;

  const downloadJson = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex justify-center items-center p-3 sm:p-6 animate-in fade-in">
      <div className="relative bg-white rounded-3xl w-full max-w-4xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Header - Flipkart Blue */}
        <div className="px-6 py-4 bg-[#2874f0] text-white flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <Smartphone className="w-6 h-6 text-yellow-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Google Play Store Android App Builder
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-yellow-400 text-slate-900 text-[10px] font-black uppercase tracking-wider">
                  Ready for Play Store
                </span>
              </div>
              <p className="text-blue-100 text-xs mt-0.5">
                {language === 'mr' 
                  ? 'क्लायंटसाठी अँड्रॉइड मोबाईल ॲप (.apk व .aab) तयार करण्याची संपूर्ण माहिती व फाइल्स'
                  : 'Convert this e-commerce platform into a native Google Play Store Android App'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-blue-100 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-2 shrink-0">
          <button
            onClick={() => setActiveTab('guide')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'guide'
                ? 'border-[#2874f0] text-[#2874f0] bg-white rounded-t-xl'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>{language === 'mr' ? 'कसे करायचे? (How to Publish)' : 'Step-by-Step Play Store Guide'}</span>
          </button>

          <button
            onClick={() => setActiveTab('files')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'files'
                ? 'border-[#2874f0] text-[#2874f0] bg-white rounded-t-xl'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileCode2 className="w-4 h-4" />
            <span>{language === 'mr' ? 'ॲप फाइल्स व Manifest' : 'APK & Manifest Files'}</span>
          </button>

          <button
            onClick={() => setActiveTab('simulator')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'simulator'
                ? 'border-[#2874f0] text-[#2874f0] bg-white rounded-t-xl'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>{language === 'mr' ? 'मोबाईल ॲप सिम्युलेटर' : 'Live Mobile Simulator'}</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 text-xs sm:text-sm">
          {activeTab === 'guide' && (
            <div className="space-y-6">
              {/* Important Reassurance Box in Marathi */}
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-200">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 font-black">
                    💡
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                      {language === 'mr' 
                        ? 'क्लायंटला उत्तर: "वेबसाइट आणि अँड्रॉइड ॲप दोन्ही एकाच कोडने कसे शक्य आहे?"'
                        : 'Answer to Client: "How does this code run as an Android Play Store App?"'}
                    </h3>
                    <p className="text-slate-700 text-xs sm:text-sm leading-relaxed">
                      {language === 'mr' ? (
                        <>
                          क्लायंटला सांगा की यासाठी वेगळे ₹५०,००० ते ₹१,००,००० खर्च करून शून्यातून कोड करण्याची अजिबात गरज नाही! 
                          आजकाल <strong>Flipkart, Amazon, Twitter, Swiggy</strong> या सर्व मोठ्या कंपन्या Google च्या अधिकृत 
                          <strong> Trusted Web Activity (TWA) आणि PWA तंत्रज्ञानाचा</strong> वापर करतात.
                          यामुळे तुमचे सर्व उत्पादन अपडेट्स, नवीन प्रॉडक्ट्स आणि ऑर्डर्स एकाच जागेवरून वेबसाइट आणि ॲप दोन्हीमध्ये आपोआप सिंक होतात!
                        </>
                      ) : (
                        <>
                          Tell your client: No need to spend ₹50,000+ rebuilding from scratch! Major brands like 
                          <strong>Flipkart, Twitter, and Amazon</strong> use Google's official 
                          <strong>Trusted Web Activity (TWA) & Progressive Web App (PWA)</strong> architecture to deliver their Play Store apps.
                          This ensures one unified inventory, instant updates, and zero maintenance overhead!
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* 3 Practical Ways to Deliver the Android App */}
              <div className="space-y-4">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#2874f0]" />
                  <span>{language === 'mr' ? 'प्ले स्टोअर ॲप बनवण्याचे ३ सोपे मार्ग:' : '3 Ways to Deliver the Android App:'}</span>
                </h3>

                {/* Way 1: PWABuilder (Google & Microsoft official 1-click builder) */}
                <div className="p-4 rounded-2xl border-2 border-blue-100 hover:border-[#2874f0] bg-white transition-all space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#2874f0] text-white flex items-center justify-center font-bold text-xs">
                        1
                      </span>
                      <h4 className="font-extrabold text-slate-900 text-sm">
                        PWABuilder.com (सर्वात सोपा व मोफत - फक्त ६० सेकंदात APK & AAB)
                      </h4>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      Recommended
                    </span>
                  </div>

                  <p className="text-slate-600 text-xs leading-relaxed">
                    Google आणि Microsoft ने एकत्र बनवलेले हे अधिकृत टूल आहे. 
                    यामध्ये तुम्हाला कोडिंगची गरज नाही. खालील बटणावर क्लिक करून वेबसाइट URL टाका आणि थेट Google Play Store साठी 
                    <strong>.aab (Android App Bundle)</strong> आणि थेट मोबाईलमध्ये इन्स्टॉल करण्यासाठी <strong>.apk</strong> फाईल डाउनलोड करा.
                  </p>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <a
                      href="https://www.pwabuilder.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-[#2874f0] hover:bg-blue-600 text-white rounded-xl text-xs font-bold inline-flex items-center gap-2 shadow-sm transition-all"
                    >
                      <span>Open PWABuilder.com</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    <button
                      onClick={() => handleCopy(window.location.origin, 'url')}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold inline-flex items-center gap-2 transition-all"
                    >
                      {copiedKey === 'url' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'url' ? 'URL Copied!' : 'Copy App URL for PWABuilder'}</span>
                    </button>
                  </div>
                </div>

                {/* Way 2: Google's Official CLI (Bubblewrap) */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs">
                      2
                    </span>
                    <h4 className="font-extrabold text-slate-900 text-sm">
                      Google Bubblewrap CLI (डेव्हलपर्ससाठी थेट कमांडने .apk व .aab बनवणे)
                    </h4>
                  </div>

                  <p className="text-slate-600 text-xs">
                    Google च्या अधिकृत <code>@bubblewrap/cli</code> टूलने फक्त २ कमांड्स चालवून Play Store Bundle तयार होते:
                  </p>

                  <div className="bg-slate-900 text-slate-200 p-3 rounded-xl font-mono text-xs space-y-1 overflow-x-auto relative group">
                    <div className="text-slate-400"># 1. Initialize Bubblewrap project</div>
                    <div className="text-emerald-400">npx @bubblewrap/cli init --manifest={window.location.origin}/manifest.json</div>
                    <div className="text-slate-400 mt-2"># 2. Build signed APK and Play Store Bundle (.aab)</div>
                    <div className="text-emerald-400">npx @bubblewrap/cli build</div>
                    <button
                      onClick={() => handleCopy(`npx @bubblewrap/cli init --manifest=${window.location.origin}/manifest.json\nnpx @bubblewrap/cli build`, 'cli')}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                      title="Copy Commands"
                    >
                      {copiedKey === 'cli' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Way 3: Direct Android Home Screen Install (Instant - No waiting for Play Store) */}
                <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                        3
                      </span>
                      <h4 className="font-extrabold text-slate-900 text-sm">
                        थेट मोबाईलमध्ये इन्स्टॉल (क्लायंटला तात्काळ दाखवण्यासाठी)
                      </h4>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 text-[10px] font-extrabold">
                      Works Instantly
                    </span>
                  </div>

                  <p className="text-slate-600 text-xs">
                    कोणत्याही Android फोनमध्ये Chrome किंवा ब्राउझर उघडून खालील बटणावर किंवा वेबसाईटवरील "Install App" वर टॅप करा. 
                    मोबाईलच्या ॲप ड्रॉवरमध्ये Vishvjeet Computer चे अधिकृत ॲप आयकॉन तयार होईल आणि ते अगदी Native App सारखे फुल स्क्रीन उघडेल!
                  </p>

                  <div className="pt-1">
                    {isInstalled ? (
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Already Running as Installed Android App!</span>
                      </div>
                    ) : (
                      <button
                        onClick={install}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold inline-flex items-center gap-2 shadow-sm transition-all"
                      >
                        <Download className="w-4 h-4" />
                        <span>Install Vishvjeet App on This Device Now</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'files' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200">
                <p className="text-xs text-blue-900">
                  Google Play Store आणि Android build साठी लागणाऱ्या सर्व आवश्यक कॉन्फिगरेशन फाइल्स आम्ही येथे तयार केल्या आहेत. 
                  तुम्ही या फाइल्स १-क्लिकने डाउनलोड करू शकता किंवा कॉपी करू शकता:
                </p>
              </div>

              {/* File 1: twa-manifest.json */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCode2 className="w-4 h-4 text-[#2874f0]" />
                    <span className="font-extrabold text-xs text-slate-900">twa-manifest.json</span>
                    <span className="text-[11px] text-slate-400">(Bubblewrap configuration)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(twaManifest, 'twa')}
                      className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center gap-1"
                    >
                      {copiedKey === 'twa' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copy</span>
                    </button>
                    <button
                      onClick={() => downloadJson('twa-manifest.json', twaManifest)}
                      className="px-2.5 py-1 text-xs font-semibold bg-[#2874f0] hover:bg-blue-600 text-white rounded-lg flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
                <pre className="p-3 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] max-h-48 overflow-y-auto">
                  {twaManifest}
                </pre>
              </div>

              {/* File 2: AndroidManifest.xml */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCode2 className="w-4 h-4 text-emerald-600" />
                    <span className="font-extrabold text-xs text-slate-900">AndroidManifest.xml</span>
                    <span className="text-[11px] text-slate-400">(Native Android permissions & launcher)</span>
                  </div>
                  <button
                    onClick={() => handleCopy(androidManifestXml, 'xml')}
                    className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center gap-1"
                  >
                    {copiedKey === 'xml' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copy XML</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] max-h-48 overflow-y-auto">
                  {androidManifestXml}
                </pre>
              </div>

              {/* File 3: assetlinks.json info */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-white space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-500" />
                    <span className="font-extrabold text-xs text-slate-900">assetlinks.json</span>
                    <span className="text-[11px] text-emerald-700 font-bold">• Active at /.well-known/assetlinks.json</span>
                  </div>
                </div>
                <p className="text-slate-600 text-xs">
                  This file is already active in your public directory. It proves to Google Play Store and Android that the domain belongs to this app, removing the browser URL bar completely for a 100% native feel!
                </p>
              </div>
            </div>
          )}

          {activeTab === 'simulator' && (
            <div className="space-y-4 text-center">
              <div className="max-w-md mx-auto space-y-2">
                <h3 className="font-black text-slate-900 text-base">
                  {language === 'mr' ? 'मोबाईल ॲप व्ह्यू सिम्युलेटर' : 'Live Android Mobile Experience'}
                </h3>
                <p className="text-slate-600 text-xs">
                  {language === 'mr'
                    ? 'क्लायंटला दाखवा की हा ई-कॉमर्स प्लॅटफॉर्म मोबाईल स्क्रीनवर अगदी Flipkart Android App सारखा कसा दिसतो!'
                    : 'Preview exactly how the Flipkart-styled mobile app looks on an Android smartphone device.'}
                </p>
              </div>

              {onToggleMobileSimulator && (
                <div className="pt-2">
                  <button
                    onClick={onToggleMobileSimulator}
                    className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 mx-auto shadow-md transition-all ${
                      isMobileSimulatorActive
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                        : 'bg-[#2874f0] hover:bg-blue-600 text-white'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>
                      {isMobileSimulatorActive
                        ? 'Exit Android Phone Frame Mode'
                        : 'Launch Android Phone Frame Mode'}
                    </span>
                  </button>
                </div>
              )}

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 max-w-lg mx-auto text-left space-y-2 mt-4">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Mobile App Features Included:</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-600">
                  <li>Flipkart-style Bottom Navigation Bar (Home, Categories, Repair, Cart, Account)</li>
                  <li>Fast 1-tap WhatsApp and Call buttons for Chikhli store (89566 64295)</li>
                  <li>Instant Add to Cart & Buy Now with Razorpay gateway</li>
                  <li>Offline support with Service Worker caching</li>
                  <li>Fast search with autocomplete suggestions</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className="font-bold text-[#2874f0]">Package:</span>
            <code className="bg-white px-2 py-0.5 rounded border border-slate-200 font-mono text-[11px]">
              com.vishvjeetcomputer.app
            </code>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition-colors"
            >
              {language === 'mr' ? 'बंद करा' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
