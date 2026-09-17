import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Info, CheckCircle2 } from "lucide-react";

export default function ToastContainer({ toasts, isDark }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 16, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 24, scale: 0.94 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className={`flex items-start gap-3 p-3.5 rounded-2xl border shadow-2xl backdrop-blur-2xl pointer-events-auto min-w-[280px] max-w-sm ${
              isDark 
                ? "bg-[#150624]/95 border-white/10 text-white shadow-black/70" 
                : "bg-white/95 border-slate-200 text-slate-900 shadow-xl"
            }`}
          >
            <div className="pt-0.5 shrink-0">
              {toast.type === "error" ? (
                <AlertTriangle className="w-4 h-4 text-rose-400" />
              ) : toast.type === "info" ? (
                <Info className="w-4 h-4 text-purple-400" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold font-mono tracking-tight">{toast.title}</p>
              {toast.description && (
                <p className={`text-[11px] font-sans mt-0.5 leading-tight ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  {toast.description}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}