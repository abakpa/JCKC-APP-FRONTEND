import { useState, useEffect } from 'react';

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed (standalone mode)
    const standalone = window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
    setIsStandalone(standalone);

    // Check if iOS
    const ios = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
    setIsIOS(ios);

    // Check if dismissed recently
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      const hoursSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60);
      if (hoursSinceDismissed < 24) {
        return; // Don't show if dismissed within 24 hours
      }
    }

    // Listen for beforeinstallprompt event (Android/Chrome)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Show iOS prompt after a delay if not standalone
    if (ios && !standalone) {
      setTimeout(() => {
        setShowInstallPrompt(true);
      }, 3000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setShowInstallPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  if (isStandalone || !showInstallPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-slide-up">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-md">
              <img src="/icon-96x96.png" alt="JCKC App" className="w-10 h-10" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-white text-lg">Install JCKC App</h3>
              <p className="text-primary-100 text-sm">Get quick access anytime</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {isIOS ? (
            <div className="space-y-3">
              <p className="text-gray-600 text-sm">
                Install this app on your iPhone for the best experience:
              </p>
              <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center justify-center w-8 h-8 bg-primary-100 rounded-full text-primary-600">
                  1
                </div>
                <p className="text-gray-700 text-sm">
                  Tap the <span className="inline-flex items-center">
                    <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2L12 14M12 2L8 6M12 2L16 6M4 14L4 20C4 21.1 4.9 22 6 22L18 22C19.1 22 20 21.1 20 20L20 14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span> Share button
                </p>
              </div>
              <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center justify-center w-8 h-8 bg-primary-100 rounded-full text-primary-600">
                  2
                </div>
                <p className="text-gray-700 text-sm">
                  Scroll and tap <strong>"Add to Home Screen"</strong>
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Works offline</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Quick access from home screen</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Fast and lightweight</span>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleDismiss}
              className="flex-1 px-4 py-2.5 text-gray-600 bg-gray-100 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              Not now
            </button>
            {!isIOS && (
              <button
                onClick={handleInstall}
                className="flex-1 px-4 py-2.5 text-white bg-primary-600 rounded-xl font-medium hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Install
              </button>
            )}
            {isIOS && (
              <button
                onClick={handleDismiss}
                className="flex-1 px-4 py-2.5 text-white bg-primary-600 rounded-xl font-medium hover:bg-primary-700 transition-colors"
              >
                Got it
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default InstallPrompt;
