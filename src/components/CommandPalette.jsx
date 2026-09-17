import React, { memo } from "react";
import { Search, FileText, ArrowRight, Download, Upload } from "lucide-react";

function CommandPalette({
  isOpen,
  onClose,
  paletteQuery,
  setPaletteQuery,
  results,
  onSelectNote,
  onBackupVault,
  onRestoreVault,
  isDark
}) {
  if (!isOpen) return null;

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 bg-black/70 backdrop-blur-md z-[9999] flex items-start justify-center pt-24 px-4 animate-in fade-in duration-150"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-xl rounded-3xl border shadow-2xl overflow-hidden ${
          isDark 
            ? "bg-[#150727]/95 border-purple-500/30 text-white" 
            : "bg-white/95 border-slate-200 text-slate-800"
        } backdrop-blur-2xl ring-1 ring-purple-500/20`}
      >
        <div className="p-4 border-b border-white/[0.06] flex items-center gap-3">
          <Search className="w-4 h-4 text-purple-400 shrink-0" />
          <input
            type="text"
            value={paletteQuery}
            onChange={(e) => setPaletteQuery(e.target.value)}
            placeholder="Type document name or command..."
            autoFocus
            className={`w-full bg-transparent text-sm focus:outline-none font-mono ${
              isDark ? "placeholder-purple-300/30 text-white" : "placeholder-slate-400 text-slate-900"
            }`}
          />
          <kbd className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${
            isDark ? "bg-white/5 border-white/10 text-purple-300" : "bg-slate-100 border-slate-200 text-slate-500"
          }`}>
            ESC
          </kbd>
        </div>

        {/* Vault Management Actions */}
        <div className={`p-2 border-b grid grid-cols-2 gap-2 text-xs font-mono ${
          isDark ? "border-white/[0.05] bg-white/[0.02]" : "border-slate-100 bg-slate-50"
        }`}>
          <button
            onClick={() => { onBackupVault(); onClose(); }}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border transition-colors cursor-pointer ${
              isDark ? "bg-white/5 hover:bg-purple-500/20 border-white/10 text-purple-200" : "bg-white hover:bg-slate-100 border-slate-200 text-slate-700"
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Backup</span>
          </button>
          <button
            onClick={() => { onRestoreVault(); onClose(); }}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border transition-colors cursor-pointer ${
              isDark ? "bg-white/5 hover:bg-purple-500/20 border-white/10 text-purple-200" : "bg-white hover:bg-slate-100 border-slate-200 text-slate-700"
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Restore Backup</span>
          </button>
        </div>

        {/* Search Results */}
        <div className="max-h-72 overflow-y-auto p-2 space-y-1">
          {results.length === 0 ? (
            <div className="p-6 text-center text-xs font-mono opacity-50">
              No matching documents found.
            </div>
          ) : (
            results.map((note) => (
              <button
                key={note.id}
                onClick={() => onSelectNote(note.id)}
                className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-mono transition-colors text-left cursor-pointer group ${
                  isDark ? "hover:bg-white/5" : "hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <FileText className="w-4 h-4 text-purple-400 shrink-0" />
                  <span className="font-semibold truncate">{note.title || "Untitled"}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-md border ${
                    isDark ? "bg-purple-500/10 border-purple-500/20 text-purple-300" : "bg-purple-50 border-purple-200 text-purple-700"
                  }`}>
                    {note.category}
                  </span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-purple-400 transition-opacity shrink-0" />
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(CommandPalette);