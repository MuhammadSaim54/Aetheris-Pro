import React, { useState, memo } from "react";
import { Plus, Sparkles, Pin, Trash2, GripVertical } from "lucide-react";

function NoteList({
  currentCategory,
  filteredNotes,
  activeNoteId,
  setActiveNoteId,
  allTags,
  selectedTag,
  setSelectedTag,
  onNewNote,
  onTogglePin,
  onDeleteNote,
  onReorderNotes,
  isDark
}) {
  const [draggedId, setDraggedId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);

  const handleDragStart = (e, noteId) => {
    setDraggedId(noteId);
    e.dataTransfer.setData("text/plain", String(noteId));
    e.dataTransfer.setData("application/json", String(noteId));
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, noteId) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    if (dragOverId !== noteId) {
      setDragOverId(noteId);
    }
  };

  const handleDrop = (e, targetNoteId) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedId && targetNoteId && draggedId !== targetNoteId) {
      onReorderNotes(draggedId, targetNoteId);
    }
    setDraggedId(null);
    setDragOverId(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

  return (
    <div className="h-[calc(100dvh-5.5rem)] max-h-[calc(100dvh-5.5rem)] flex flex-col justify-between">
      {/* Vault Header & Tag Filters */}
      <div className="pb-3 space-y-3 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className={`text-xl font-bold tracking-tight capitalize ${isDark ? "text-white" : "text-slate-900"}`}>
              {currentCategory} Vault
            </h2>
            <p className={`text-xs font-mono mt-0.5 ${isDark ? "text-purple-300/40" : "text-slate-400"}`}>
              {filteredNotes.length} {filteredNotes.length === 1 ? "document" : "documents"} indexed
            </p>
          </div>

          <button
            onClick={onNewNote}
            className="md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono font-medium shadow-md shadow-purple-600/30 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New</span>
          </button>
        </div>

        {/* Tag Filters Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {allTags.map((tag) => {
            const isSelected = selectedTag === tag;
            return (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`text-[11px] font-mono px-2.5 py-1 rounded-lg transition-all cursor-pointer shrink-0 border ${
                  isSelected
                    ? (isDark 
                        ? "bg-purple-500/25 border-purple-500/40 text-purple-200 font-semibold" 
                        : "bg-purple-100 border-purple-300 text-purple-900 font-semibold shadow-2xs")
                    : (isDark 
                        ? "bg-white/[0.03] border-white/5 text-slate-400 hover:text-white hover:bg-white/[0.06]" 
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50")
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      {/* Cards Stream */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 sm:space-y-3">
        {filteredNotes.length === 0 ? (
          <div className={`h-full min-h-[260px] flex flex-col items-center justify-center p-8 rounded-3xl border border-dashed text-center ${
            isDark ? "border-white/10 text-purple-300/40 bg-[#12071f]/20" : "border-slate-200 text-slate-400 bg-white/60"
          }`}>
            <Sparkles className="w-6 h-6 mx-auto mb-2 opacity-40 text-purple-400" />
            <p className="text-xs font-mono">No documents found.</p>
          </div>
        ) : (
          filteredNotes.map((note) => {
            const isSelected = note.id === activeNoteId;
            const previewText = note.content ? note.content.replace(/<[^>]*>/g, '') : "No preview available";
            const isDragging = draggedId === note.id;
            const isTarget = dragOverId === note.id;

            return (
              <div
                key={note.id}
                draggable
                onDragStart={(e) => handleDragStart(e, note.id)}
                onDragOver={(e) => handleDragOver(e, note.id)}
                onDrop={(e) => handleDrop(e, note.id)}
                onDragEnd={handleDragEnd}
                onClick={() => setActiveNoteId(note.id)}
                className={`p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl transition-all duration-150 cursor-pointer flex flex-col justify-between group select-none relative border active:scale-[0.99] ${
                  isDragging 
                    ? "opacity-30 scale-95 border-dashed border-purple-500 bg-purple-500/5" 
                    : isTarget 
                    ? "border-t-4 border-t-purple-500 scale-[1.02] shadow-xl bg-purple-500/10" 
                    : isSelected 
                    ? (isDark 
                        ? "bg-gradient-to-b from-[#1c0c33] to-[#140826] border-purple-500/40 shadow-lg ring-1 ring-purple-500/20" 
                        : "bg-white border-purple-300 shadow-md ring-1 ring-purple-400/20")
                    : (isDark 
                        ? "bg-[#120620]/70 border-white/[0.05] hover:border-purple-500/30 hover:bg-[#170929]" 
                        : "bg-white border-slate-200/80 hover:border-purple-200 hover:shadow-xs")
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5 sm:mb-2">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <div 
                        className="opacity-40 group-hover:opacity-100 hover:text-purple-400 cursor-grab active:cursor-grabbing p-0.5 rounded transition-colors"
                        title="Drag to reorder"
                      >
                        <GripVertical className="w-3.5 h-3.5" />
                      </div>

                      <span className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-md border ${
                        isDark 
                          ? "bg-purple-500/10 text-purple-300 border-purple-500/20" 
                          : "bg-purple-50 text-purple-700 border-purple-200/80"
                      }`}>
                        {note.category}
                      </span>
                      {note.pinned && (
                        <span className="flex items-center gap-1 text-[10px] font-mono text-amber-400 font-semibold">
                          <Pin className="w-3 h-3 fill-amber-400 text-amber-400" /> Pinned
                        </span>
                      )}
                    </div>
                    <span className={`text-[10px] font-mono ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                      {note.createdAt}
                    </span>
                  </div>

                  <h3 className={`text-sm font-semibold mb-1 line-clamp-1 tracking-tight ${
                    isSelected ? (isDark ? "text-white font-bold" : "text-purple-950") : (isDark ? "text-slate-200" : "text-slate-800")
                  }`}>
                    {note.title || "Untitled Document"}
                  </h3>
                  <p className={`text-xs line-clamp-2 leading-relaxed ${isDark ? "text-slate-400/80" : "text-slate-500"}`}>
                    {previewText}
                  </p>
                </div>

                <div className={`flex items-center justify-between mt-2.5 pt-2 border-t ${
                  isDark ? "border-white/[0.05]" : "border-slate-100"
                }`}>
                  <span className="text-[11px] font-mono text-rose-400/90 font-medium">{note.tag}</span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => onTogglePin(note.id, e)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        note.pinned ? "text-amber-400" : "text-slate-400 hover:text-amber-400"
                      }`}
                      title={note.pinned ? "Unpin document" : "Pin to top"}
                    >
                      <Pin className={`w-3.5 h-3.5 ${note.pinned ? "fill-amber-400" : ""}`} />
                    </button>
                    <button 
                      onClick={(e) => onDeleteNote(note.id, e)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                      title="Move to Trash"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default memo(NoteList);