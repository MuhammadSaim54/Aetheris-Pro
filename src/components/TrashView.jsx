import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, RotateCcw, Flame, ShieldAlert, Sparkles } from "lucide-react";

export default function TrashView({
  trashedNotes,
  onRestoreNote,
  onPermanentDelete,
  onEmptyTrash,
  isDark
}) {
  return (
    <div className={`w-full rounded-2xl sm:rounded-3xl border shadow-2xl flex flex-col h-[calc(100vh-110px)] transition-all overflow-hidden p-5 sm:p-7 ${
      isDark 
        ? "bg-gradient-to-b from-[#140726]/90 to-[#0f041d]/90 border-white/[0.08] backdrop-blur-2xl shadow-purple-950/40 ring-1 ring-purple-500/10" 
        : "bg-white/95 border-slate-200/90 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.04)] ring-1 ring-slate-100"
    }`}>
      {/* Trash Header Banner */}
      <div className="pb-4 border-b border-white/[0.06] flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-2xl border ${
            isDark ? "bg-rose-500/15 border-rose-500/30 text-rose-400" : "bg-rose-50 border-rose-200 text-rose-600"
          }`}>
            <Trash2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className={`text-xl font-bold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                Trash Bin
              </h2>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                isDark ? "bg-rose-500/20 text-rose-300 border-rose-500/30" : "bg-rose-100 text-rose-800 border-rose-200"
              }`}>
                {trashedNotes.length} {trashedNotes.length === 1 ? "item" : "items"}
              </span>
            </div>
            <p className={`text-xs font-mono mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Items here are excluded from search. You can restore them anytime.
            </p>
          </div>
        </div>

        {trashedNotes.length > 0 && (
          <button
            onClick={onEmptyTrash}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-mono font-semibold shadow-lg shadow-rose-600/30 active:scale-95 transition-all cursor-pointer"
          >
            <Flame className="w-4 h-4" />
            <span>Empty Trash</span>
          </button>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto pt-4 pr-1">
        {trashedNotes.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-12 text-center">
            <div className={`p-4 rounded-3xl mb-4 border ${
              isDark ? "bg-white/[0.02] border-white/5 text-purple-300/40" : "bg-slate-50 border-slate-200 text-slate-400"
            }`}>
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className={`text-base font-bold tracking-tight ${isDark ? "text-slate-300" : "text-slate-700"}`}>
              Trash is empty
            </h3>
            <p className={`text-xs font-mono mt-1 max-w-sm ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              Deleted documents will be collected here before permanent deletion.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {trashedNotes.map((note) => {
                const previewText = note.content ? note.content.replace(/<[^>]*>/g, '') : "No content";

                return (
                  <motion.div
                    key={note.id}
                    layout
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.94 }}
                    transition={{ duration: 0.15 }}
                    className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                      isDark 
                        ? "bg-[#160a26]/70 border-white/[0.06] hover:border-purple-500/25 shadow-sm" 
                        : "bg-white border-slate-200/80 hover:border-slate-300 shadow-xs"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <span className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-md border ${
                          isDark 
                            ? "bg-purple-500/10 text-purple-300 border-purple-500/20" 
                            : "bg-purple-50 text-purple-700 border-purple-200"
                        }`}>
                          {note.category}
                        </span>
                        <span className={`text-[10px] font-mono ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                          {note.createdAt}
                        </span>
                      </div>

                      <h4 className={`text-sm font-semibold mb-1 line-clamp-1 ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                        {note.title || "Untitled Document"}
                      </h4>
                      <p className={`text-xs line-clamp-3 leading-relaxed ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                        {previewText}
                      </p>
                    </div>

                    <div className={`flex items-center justify-between mt-4 pt-3 border-t gap-2 ${
                      isDark ? "border-white/[0.05]" : "border-slate-100"
                    }`}>
                      <span className="text-[10px] font-mono text-rose-400/90">{note.tag}</span>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onRestoreNote(note.id)}
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                            isDark 
                              ? "bg-purple-500/15 text-purple-300 hover:bg-purple-500/25" 
                              : "bg-purple-50 text-purple-700 hover:bg-purple-100"
                          }`}
                          title="Restore back to vault"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Restore</span>
                        </button>
                        <button
                          onClick={() => onPermanentDelete(note.id)}
                          className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                            isDark 
                              ? "text-slate-400 hover:text-rose-400 hover:bg-rose-500/15" 
                              : "text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          }`}
                          title="Delete Permanently"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}