import { createContext, useCallback, useContext, useRef, useState } from "react";
import { AlertTriangle } from "lucide-react";

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [dialog, setDialog] = useState(null); // { message, title, confirmLabel }
  const resolveRef = useRef(null);

  // Returns a Promise<boolean> - true if the user confirmed, false if cancelled
  const confirm = useCallback((message, options = {}) => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setDialog({
        message,
        title: options.title || "Are you sure?",
        confirmLabel: options.confirmLabel || "Delete",
        cancelLabel: options.cancelLabel || "Cancel",
      });
    });
  }, []);

  const handleChoice = (result) => {
    setDialog(null);
    resolveRef.current?.(result);
    resolveRef.current = null;
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}

      {dialog && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-lg">
            <div className="flex items-start gap-3 mb-2">
              <span className="flex items-center justify-center w-9 h-9 rounded-full bg-red-50 text-red-600 shrink-0">
                <AlertTriangle size={18} />
              </span>
              <div>
                <h2 className="font-display font-bold text-motolink-blue-dark leading-snug">
                  {dialog.title}
                </h2>
                <p className="text-motolink-slate text-sm mt-1">{dialog.message}</p>
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <button
                onClick={() => handleChoice(false)}
                className="flex-1 px-3 py-2 text-sm font-display font-semibold text-motolink-blue-dark border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              >
                {dialog.cancelLabel}
              </button>
              <button
                onClick={() => handleChoice(true)}
                className="flex-1 px-3 py-2 text-sm font-display font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors cursor-pointer"
              >
                {dialog.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error("useConfirm must be used within a ConfirmProvider");
  }
  return ctx.confirm;
}