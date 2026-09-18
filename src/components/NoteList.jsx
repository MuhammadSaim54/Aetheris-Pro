import React, { useState, memo } from "react";
import { Plus, Sparkles, Pin, Trash2, GripVertical } from "lucide-react";
import { motion } from "framer-motion";

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
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, noteId) => {
    e.preventDefault();
    if (dragOverId !== noteId) setDragOverId(noteId);
  };

  const handleDrop = (e, targetNoteId) => {
    e.preventDefault();
    if (draggedId && targetNoteId && draggedId !== targetNoteId) {
      onReorderNotes(draggedId, targetNoteId);
    }
    setDraggedId(null);
    setDragOverId(null);
  };

  return (
    <div className="h-[calc(100dvh-5.5rem)] max-h-[calc(100dvh-5.5rem)] flex flex-col justify-between">
      <div className="pb-3 space-y-3 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className={`text-xl font-bold tracking-tight capitalize ${isDark ? "text-white" : "text-slate-900"}`}>
              {currentCategory} Vault
            </h2>
            <p className={`text-xs font-mono mt-0.5 ${isDark ? "text-purple-300/40" : "text-slate-400"}`}>
              {filteredNotes.length} documents
            </p>
          </div>

          <button
            onClick={onNewNote}
            className="md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono font-medium shadow-md transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New</span>
          </button>
        </div>

        {/* Tag Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`text-[11px] font-mono px-2.5 py-1 rounded-lg transition-all shrink-0 border ${
                selectedTag === tag
                  ? "bg-purple-500/20 border-purple-500/40 text-purple-700 dark:text-purple-300 font-semibold"
                  : "bg-transparent border-slate-200 dark:border-white/5 opacity-70 hover:opacity-100"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Framer-Motion Animated Card Stream */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-2.5">
        {filteredNotes.map((note, index) => {
          const isSelected = note.id === activeNoteId;
          const previewText = note.content ? note.content.replace(/<[^>]*>/g, '') : "Empty";

          return (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: Math.min(index * 0.04, 0.25) }}
              draggable
              onDragStart={(e) => handleDragStart(e, note.id)}
              onDragOver={(e) => handleDragOver(e, note.id)}
              onDrop={(e) => handleDrop(e, note.id)}
              onClick={() => setActiveNoteId(note.id)}
              className={`p-3.5 sm:p-4 rounded-2xl transition-all duration-150 cursor-pointer flex flex-col justify-between border select-none ${
                dragOverId === note.id ? "border-t-4 border-t-purple-500 scale-[1.01]" : ""
              } ${
                isSelected 
                  ? (isDark ? "bg-[#1c0c33] border-purple-500/50 shadow-lg" : "bg-white border-purple-400 shadow-md")
                  : (isDark ? "bg-[#120620]/70 border-white/5 hover:border-purple-500/30" : "bg-white border-slate-200/80 hover:border-purple-200")
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <GripVertical className="w-3.5 h-3.5 opacity-30 hover:opacity-100" />
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-300">
                      {note.category}
                    </span>
                    {note.pinned && <Pin className="w-3 h-3 fill-amber-400 text-amber-400" />}
                  </div>
                  <span className="text-[10px] font-mono opacity-50">{note.createdAt}</span>
                </div>

                <h3 className={`text-sm font-semibold mb-1 line-clamp-1 ${isSelected ? "text-purple-600 dark:text-white" : ""}`}>
                  {note.title || "Untitled Document"}
                </h3>
                <p className="text-xs line-clamp-2 opacity-60 leading-relaxed">
                  {previewText}
                </p>
              </div>

              <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-black/5 dark:border-white/5">
                <span className="text-[11px] font-mono text-rose-500 font-medium">{note.tag}</span>
                <div className="flex items-center gap-1">
                  <button onClick={(e) => onTogglePin(note.id, e)} className="p-1 opacity-60 hover:opacity-100">
                    <Pin className={`w-3.5 h-3.5 ${note.pinned ? "fill-amber-400 text-amber-400" : ""}`} />
                  </button>
                  <button onClick={(e) => onDeleteNote(note.id, e)} className="p-1 opacity-60 hover:text-rose-500">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default memo(NoteList);