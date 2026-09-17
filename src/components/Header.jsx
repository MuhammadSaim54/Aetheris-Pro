import React from "react";
import Logo from "./Logo";
import { Search, Sun, Moon, Menu, Command } from "lucide-react";

export default function Header({ isDark, toggleTheme, onOpenSidebar, onOpenPalette }) {
  return (
    <header className={`h-16 border-b sticky top-0 z-30 px-4 sm:px-6 md:px-8 flex items-center justify-between gap-3 shrink-0 transition-all duration-300 ${
      isDark 
        ? "border-white/[0.06] bg-[#0d0417]/80 backdrop-blur-2xl" 
        : "border-slate-200/70 bg-white/85 backdrop-blur-2xl shadow-xs"
    }`}>
      <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
        <button
          onClick={onOpenSidebar}
          className={`lg:hidden p-2 rounded-xl border transition-all cursor-pointer ${
            isDark ? "bg-[#160a26] border-white/10 text-purple-300" : "bg-white border-slate-200 text-slate-700 shadow-xs"
          }`}
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 lg:hidden">
          <Logo className="w-7 h-7" />
          <span className="font-bold tracking-tight text-sm">Aetheris</span>
        </div>
      </div>

      <button 
        onClick={onOpenPalette}
        className={`flex items-center justify-between border rounded-2xl px-3 sm:px-4 py-2 flex-1 max-w-lg transition-all duration-300 cursor-pointer ${
          isDark 
            ? "bg-[#130722]/80 border-white/[0.08] hover:border-purple-500/50 hover:bg-[#19092c] text-white" 
            : "bg-slate-100/70 border-slate-200/80 hover:border-purple-300 hover:bg-white text-slate-900 shadow-2xs"
        }`}
      >
        <div className="flex items-center gap-2 sm:gap-2.5 truncate">
          <Search className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${isDark ? "text-purple-400" : "text-purple-600"}`} />
          <span className={`text-xs font-mono truncate ${isDark ? "text-purple-300/40" : "text-slate-400"}`}>
            Search vault...
          </span>
        </div>
        <kbd className={`hidden sm:inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-lg border ${
          isDark ? "bg-white/[0.04] border-white/10 text-purple-300/60" : "bg-white border-slate-200 text-slate-500 shadow-2xs"
        }`}>
          <Command className="w-3 h-3" /> K
        </kbd>
      </button>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={toggleTheme}
          className={`p-2 sm:px-3 sm:py-2 rounded-2xl border transition-all cursor-pointer flex items-center gap-1.5 text-xs font-mono font-medium ${
            isDark 
              ? "bg-[#160a26] border-white/[0.08] text-purple-200 hover:border-purple-500/40 hover:bg-[#1f0e37]" 
              : "bg-white border-slate-200 text-slate-700 hover:bg-purple-50/50 shadow-2xs"
          }`}
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-purple-600" />}
          <span className="hidden sm:inline">{isDark ? "Light" : "Dark"}</span>
        </button>
      </div>
    </header>
  );
}