import { createContext, useCallback, useContext, useRef, useState } from "react";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

// Bootstrap-flavored color variants, done in plain Tailwind (no bootstrap dependency)
const VARIANTS = {
  success: {
    wrapper: "bg-emerald-50 border-emerald-200 text-emerald-800",
    icon: CheckCircle2,
    iconClass: "text-emerald-600",
  },
  danger: {
    wrapper: "bg-red-50 border-red-200 text-red-800",
    icon: XCircle,
    iconClass: "text-red-600",
  },
  info: {
    wrapper: "bg-blue-50 border-blue-200 text-blue-800",
    icon: Info,
    iconClass: "text-blue-600",
  },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(0);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message, variant = "success", duration = 3000) => {
      const id = nextId.current++;
      setToasts((prev) => [...prev, { id, message, variant }]);
      if (duration > 0) {
        setTimeout(() => dismissToast(id), duration);
      }
      return id;
    },
    [dismissToast],
  );

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}

      {/* Toast stack - fixed top-center, stacked, dismissible, auto-fading */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-[calc(100%-2rem)] max-w-sm">
        {toasts.map((toast) => {
          const { wrapper, icon: Icon, iconClass } =
            VARIANTS[toast.variant] || VARIANTS.info;
          return (
            <div
              key={toast.id}
              role="alert"
              className={`flex items-start gap-2.5 border rounded-lg shadow-sm px-4 py-3 text-sm font-medium animate-[toast-in_0.2s_ease-out] ${wrapper}`}
            >
              <Icon size={18} className={`shrink-0 mt-0.5 ${iconClass}`} />
              <p className="flex-1 leading-snug">{toast.message}</p>
              <button
                onClick={() => dismissToast(toast.id)}
                aria-label="Dismiss"
                className="shrink-0 opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}