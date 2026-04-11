import React, { useEffect, useState } from "react";
import { RefreshCcw, WifiOff } from "lucide-react";

const ConnectivityBanner = () => {
  const [isOnline, setIsOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="border-b border-rose-100 bg-rose-50/95 px-4 py-3 text-rose-800 shadow-sm">
      <div className="mx-auto flex max-w-md items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 flex-none items-center justify-center rounded-2xl bg-white text-rose-600 shadow-sm ring-1 ring-rose-100">
          <WifiOff className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-black">You're offline</p>
          <p className="mt-1 text-xs font-medium leading-5 text-rose-700">
            Some live updates may pause for now. Saved data and local actions still work safely.
          </p>
        </div>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-black text-rose-700 shadow-sm ring-1 ring-rose-100"
        >
          <RefreshCcw className="h-3.5 w-3.5" />
          Retry
        </button>
      </div>
    </div>
  );
};

export default ConnectivityBanner;
