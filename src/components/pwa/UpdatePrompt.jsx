import { useRegisterSW } from 'virtual:pwa-register/react';

const UpdatePrompt = () => {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered:', r);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  const close = () => {
    setNeedRefresh(false);
  };

  if (!needRefresh) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-50 animate-slide-down">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg border border-gray-200 p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900">Update Available</h4>
            <p className="text-sm text-gray-600 mt-1">
              A new version of JCKC App is available. Refresh to update.
            </p>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button
            onClick={close}
            className="flex-1 px-3 py-2 text-gray-600 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            Later
          </button>
          <button
            onClick={() => updateServiceWorker(true)}
            className="flex-1 px-3 py-2 text-white bg-primary-600 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
          >
            Refresh Now
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slide-down {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default UpdatePrompt;
