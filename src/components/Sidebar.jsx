import React, { useState, memo } from "react";
import { 
  FolderKanban, Sparkles, Plus, Compass, 
  X, FolderPlus, Trash2, Code2, Terminal,
  Bookmark, Folder, Layers
} from "lucide-react";
import Logo from "./Logo";
import { useTheme } from "../context/ThemeContext";

function Sidebar({ 
  currentCategory, 
  setCategory, 
  categories, 
  onAddCategory, 
  onPromptDeleteCategory, 
  onNewNote, 
  isOpen, 
  onClose, 
  notesCountByCat,
  trashCount,
  isTrashView,
  setIsTrashView,
  onDropNoteOnWorkspace,
  onDropNoteOnTrash
}) {
  const { isDark } = useTheme();
  const [isAddingWorkspace, setIsAddingWorkspace] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [activeDropZone, setActiveDropZone] = useState(null);

  const handleCreateWorkspace = (e) => {
    e.preventDefault();
    const trimmed = newWorkspaceName.trim();
    if (trimmed) {
      onAddCategory(trimmed);
      setNewWorkspaceName("");
      setIsAddingWorkspace(false);
    }
  };

  const getWorkspaceIcon = (cat) => {
    const lower = cat.toLowerCase();
    if (cat === 'All') return <Compass className="w-4 h-4 shrink-0" />;
    if (cat === 'Ideas' || lower.includes('idea')) return <Sparkles className="w-4 h-4 shrink-0" />;
    if (cat === 'Code Snippets' || lower.includes('code') || lower.includes('dev')) return <Code2 className="w-4 h-4 shrink-0" />;
    if (cat === 'Architecture' || lower.includes('arch') || lower.includes('design')) return <FolderKanban className="w-4 h-4 shrink-0" />;
    if (lower.includes('cli') || lower.includes('script') || lower.includes('api')) return <Terminal className="w-4 h-4 shrink-0" />;
    if (lower.includes('doc') || lower.includes('read') || lower.includes('book')) return <Bookmark className="w-4 h-4 shrink-0" />;
    return <Folder className="w-4 h-4 shrink-0" />;
  };

  const defaultCategories = ["All", "Ideas", "Code Snippets", "Architecture"];

  return (
    <>
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-200"
        />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 lg:z-20 w-72 lg:w-64 xl:w-72 flex flex-col h-screen shrink-0 transition-transform duration-300 ease-out select-none
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        ${isDark 
          ? "bg-[#0b0314]/95 lg:bg-[#0b0314]/85 border-white/[0.06]" 
          : "bg-[#fbfafd] lg:bg-white/95 border-slate-200/70 shadow-[4px_0_30px_rgba(0,0,0,0.03)]"}
        border-r backdrop-blur-2xl
      `}>
        {/* Brand Header */}
        <div className={`h-16 px-5 border-b flex items-center justify-between shrink-0 ${
          isDark ? "border-white/[0.06]" : "border-slate-200/70"
        }`}>
          <div className="flex items-center gap-3">
            <Logo className="w-9 h-9 drop-shadow-[0_0_15px_rgba(168,85,247,0.45)]" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className={`text-sm font-bold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>Aetheris</h1>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/25 font-mono font-semibold">
                  PRO
                </span>
              </div>
              <p className={`text-[10px] font-mono tracking-wide ${isDark ? "text-purple-300/40" : "text-slate-400"}`}>
                Knowledge Workspace
              </p>
            </div>
          </div>
          
          <button 
            onClick={onClose} 
            className={`lg:hidden p-2 rounded-xl transition-colors cursor-pointer ${isDark ? "text-purple-300 hover:bg-white/5" : "text-slate-600 hover:bg-slate-100"}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Button */}
        <div className="p-4 shrink-0">
          <button
            onClick={() => { 
              setIsTrashView(false);
              onNewNote(); 
              if(onClose) onClose(); 
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-purple-500 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-mono text-xs font-semibold shadow-[0_4px_16px_rgba(168,85,247,0.35)] transition-all cursor-pointer active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Document</span>
          </button>
        </div>

        {/* Workspaces List with Direct Drop Handlers */}
        <div className="flex-1 px-3 py-1 space-y-1.5 overflow-y-auto">
          <div className="flex items-center justify-between px-3 py-1.5 mb-0.5">
            <span className={`text-[10px] font-mono tracking-wider uppercase font-semibold flex items-center gap-1.5 ${isDark ? "text-purple-300/40" : "text-slate-400"}`}>
              <Layers className="w-3 h-3" /> Workspaces
            </span>
            <button 
              onClick={() => setIsAddingWorkspace(true)}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                isDark 
                  ? "text-purple-400 hover:bg-purple-500/15 hover:text-purple-300" 
                  : "text-purple-600 hover:bg-purple-50"
              }`}
              title="Add New Workspace"
            >
              <FolderPlus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Inline Add Input */}
          {isAddingWorkspace && (
            <form onSubmit={handleCreateWorkspace} className="px-1 mb-2 animate-in fade-in duration-150">
              <div className={`flex items-center gap-1.5 p-1.5 rounded-xl border shadow-sm ${
                isDark ? "bg-[#18082e] border-purple-500/40" : "bg-purple-50/70 border-purple-300"
              }`}>
                <input
                  type="text"
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  placeholder="Workspace name..."
                  autoFocus
                  className={`w-full bg-transparent text-xs px-2.5 py-1 focus:outline-none font-mono ${isDark ? "text-white placeholder-purple-400/40" : "text-slate-800 placeholder-slate-400"}`}
                />
                <button type="submit" className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-[10px] font-mono font-medium cursor-pointer shrink-0">
                  Save
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsAddingWorkspace(false)}
                  className="px-1.5 py-1 text-[10px] font-mono text-slate-400 hover:text-slate-600 cursor-pointer shrink-0"
                >
                  ✕
                </button>
              </div>
            </form>
          )}

          {/* Workspace Folders */}
          <div className="space-y-1">
            {categories.map((cat) => {
              const isActive = !isTrashView && currentCategory === cat;
              const isProtected = defaultCategories.includes(cat);
              const count = notesCountByCat[cat] || 0;
              const isDropHovered = activeDropZone === cat;

              return (
                <div
                  key={cat}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.dataTransfer.dropEffect = "move";
                    if (cat !== "All" && activeDropZone !== cat) {
                      setActiveDropZone(cat);
                    }
                  }}
                  onDragEnter={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (cat !== "All") setActiveDropZone(cat);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!e.currentTarget.contains(e.relatedTarget)) {
                      setActiveDropZone(null);
                    }
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setActiveDropZone(null);
                    const rawId = e.dataTransfer.getData("text/plain") || e.dataTransfer.getData("application/json");
                    if (rawId && cat !== "All") {
                      onDropNoteOnWorkspace(Number(rawId), cat);
                    }
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono transition-all duration-150 group relative border ${
                    isDropHovered
                      ? "bg-purple-600/40 border-purple-400 ring-2 ring-purple-400 scale-[1.04] shadow-[0_0_20px_rgba(168,85,247,0.4)] text-white"
                      : isActive
                      ? (isDark 
                          ? 'bg-purple-500/15 text-purple-200 border-purple-500/35 font-semibold shadow-xs' 
                          : 'bg-purple-100/90 text-purple-950 border-purple-200 font-semibold shadow-2xs')
                      : (isDark 
                          ? 'border-transparent text-purple-300/60 hover:text-purple-100 hover:bg-white/[0.04]' 
                          : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-purple-50/50')
                  }`}
                >
                  <button
                    onClick={() => { 
                      setIsTrashView(false);
                      setCategory(cat); 
                      if(onClose) onClose(); 
                    }}
                    className={`flex items-center gap-2.5 flex-1 min-w-0 pr-2 text-left cursor-pointer ${
                      activeDropZone ? "pointer-events-none" : ""
                    }`}
                  >
                    <span className={`transition-colors shrink-0 ${
                      isActive 
                        ? (isDark ? 'text-purple-300' : 'text-purple-700') 
                        : (isDark ? 'text-purple-400/50 group-hover:text-purple-300' : 'text-slate-400 group-hover:text-purple-600')
                    }`}>
                      {getWorkspaceIcon(cat)}
                    </span>
                    <span className="truncate capitalize">{cat}</span>
                  </button>

                  <div className={`flex items-center gap-1 shrink-0 ${activeDropZone ? "pointer-events-none" : ""}`}>
                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-mono transition-colors ${
                      isActive 
                        ? (isDark ? 'bg-purple-500/30 text-purple-200' : 'bg-purple-200 text-purple-900') 
                        : (isDark ? 'bg-white/[0.04] text-purple-300/50' : 'bg-slate-100 text-slate-500')
                    }`}>
                      {count}
                    </span>

                    {!isProtected && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onPromptDeleteCategory(cat);
                        }}
                        className={`p-1 rounded-md cursor-pointer transition-colors ${
                          isDark 
                            ? "text-slate-400 hover:text-rose-400 hover:bg-rose-500/20" 
                            : "text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        }`}
                        title={`Delete ${cat}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Droppable Trash Bin Target */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              e.dataTransfer.dropEffect = "move";
              if (activeDropZone !== "trash") setActiveDropZone("trash");
            }}
            onDragEnter={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setActiveDropZone("trash");
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!e.currentTarget.contains(e.relatedTarget)) {
                setActiveDropZone(null);
              }
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setActiveDropZone(null);
              const rawId = e.dataTransfer.getData("text/plain") || e.dataTransfer.getData("application/json");
              if (rawId) {
                onDropNoteOnTrash(Number(rawId));
              }
            }}
            className={`pt-2 transition-all ${activeDropZone === "trash" ? "scale-[1.04]" : ""}`}
          >
            <div className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono transition-all duration-150 cursor-pointer border ${
              activeDropZone === "trash"
                ? "bg-rose-500/40 border-rose-400 ring-2 ring-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.4)] text-rose-100"
                : isTrashView
                ? (isDark 
                    ? 'bg-rose-500/15 text-rose-300 border-rose-500/35 font-semibold shadow-xs' 
                    : 'bg-rose-50 text-rose-800 border-rose-200 font-semibold shadow-2xs')
                : (isDark 
                    ? 'border-transparent text-rose-400/60 hover:text-rose-300 hover:bg-white/[0.04]' 
                    : 'border-transparent text-slate-500 hover:text-rose-600 hover:bg-rose-50/50')
            }`}>
              <button
                onClick={() => {
                  setIsTrashView(true);
                  if (onClose) onClose();
                }}
                className={`flex items-center gap-2.5 flex-1 text-left cursor-pointer ${
                  activeDropZone ? "pointer-events-none" : ""
                }`}
              >
                <Trash2 className={`w-4 h-4 shrink-0 ${isTrashView ? (isDark ? 'text-rose-400' : 'text-rose-600') : 'text-rose-400/50'}`} />
                <span>Trash Bin</span>
              </button>
              <span className={`text-[10px] px-2 py-0.5 rounded-md font-mono ${activeDropZone ? "pointer-events-none" : ""} ${
                isTrashView
                  ? (isDark ? 'bg-rose-500/30 text-rose-200' : 'bg-rose-200 text-rose-900')
                  : (isDark ? 'bg-white/[0.04] text-rose-400/50' : 'bg-slate-100 text-slate-500')
              }`}>
                {trashCount}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className={`h-12 px-4 border-t text-[11px] font-mono flex items-center justify-between shrink-0 ${
          isDark ? "border-white/[0.06] text-purple-300/40" : "border-slate-200/70 text-slate-400"
        }`}>
          <span className="flex items-center gap-1.5">
            <kbd className={`px-1.5 py-0.5 rounded text-[9px] border ${isDark ? "bg-white/[0.04] border-white/10 text-purple-300" : "bg-slate-100 border-slate-200 text-slate-600"}`}>
              Ctrl+K
            </kbd>
            <span>Command</span>
          </span>
          <span className="flex items-center gap-1.5 text-emerald-500 font-medium text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Vault
          </span>
        </div>
      </aside>
    </>
  );
}

export default memo(Sidebar);