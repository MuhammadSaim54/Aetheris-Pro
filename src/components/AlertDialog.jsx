import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";

export default function AlertDialog({ isOpen, workspaceName, onCancel, onConfirm, isDark }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 bg-black/75 backdrop-blur-md"
          />

          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={`w-full max-w-md rounded-3xl border p-6 shadow-2xl relative z-10 ${
              isDark 
                ? "bg-[#140624] border-white/10 text-white shadow-purple-950/70" 
                : "bg-white border-slate-200 text-slate-900 shadow-2xl shadow-slate-900/10"
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-2xl shrink-0 ${
                isDark ? "bg-rose-500/15 text-rose-400 border border-rose-500/25" : "bg-rose-50 text-rose-600 border border-rose-200"
              }`}>
                <AlertTriangle className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-base font-bold tracking-tight">Delete Workspace</h3>
                <p className={`text-xs mt-1.5 leading-relaxed font-sans ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                  Are you sure you want to delete <span className="font-semibold text-purple-400">"{workspaceName}"</span>? All indexed documents will automatically migrate to your <span className="font-semibold">Ideas</span> vault.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-white/[0.06]">
              <button
                type="button"
                onClick={onCancel}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-medium border transition-colors cursor-pointer ${
                  isDark 
                    ? "border-white/10 text-slate-300 hover:bg-white/5 hover:text-white" 
                    : "border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className="px-4 py-2 rounded-xl text-xs font-mono font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 transition-all cursor-pointer active:scale-95"
              >
                Delete Workspace
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}