import React, { memo, useState, useEffect, useRef, useMemo } from "react";
import { 
  Copy, Sparkles, FileDown, Bold, Italic, Heading1, Heading2, Highlighter, 
  List, CheckSquare, Mic, Radio, Maximize2, Minimize2, 
  Code2, Quote, Undo2, Redo2, Clock, Command, MoreHorizontal
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function EditorCanvas({
  activeNote,
  editorRef,
  categories,
  onClose,
  onUpdateNote,
  onDuplicateNote,
  onCopyContent,
  onExportPDF,
  onCommand,
  onHighlight,
  onHeading,
  isZenMode,
  setIsZenMode,
  isDark
}) {
  const [isListening, setIsListening] = useState(false);
  const [slashMenu, setSlashMenu] = useState(null);
  const [slashIndex, setSlashIndex] = useState(0);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  const containerRef = useRef(null);
  const recognitionRef = useRef(null);
  const manualStopRef = useRef(false);
  const slashMenuRef = useRef(null);
  const moreMenuRef = useRef(null);

  const { wordCount, readingTime } = useMemo(() => {
    if (!activeNote?.content) return { wordCount: 0, readingTime: 0 };
    const plain = activeNote.content.replace(/<[^>]*>/g, ' ');
    const words = plain.split(/\s+/).filter(Boolean).length;
    const mins = Math.max(1, Math.ceil(words / 200));
    return { wordCount: words, readingTime: mins };
  }, [activeNote?.content]);

  const slashCommands = [
    { id: "h1", label: "Heading 1", icon: <Heading1 className="w-4 h-4" />, action: () => onHeading("<h1>") },
    { id: "h2", label: "Heading 2", icon: <Heading2 className="w-4 h-4" />, action: () => onHeading("<h2>") },
    { id: "todo", label: "To-do Task", icon: <CheckSquare className="w-4 h-4" />, action: () => insertTodoItem() },
    { id: "bullet", label: "Bulleted List", icon: <List className="w-4 h-4" />, action: () => onCommand("insertUnorderedList") },
    { id: "quote", label: "Blockquote", icon: <Quote className="w-4 h-4" />, action: () => insertBlockquote() },
    { id: "code", label: "Code Snippet", icon: <Code2 className="w-4 h-4" />, action: () => insertCodeBlock() },
    { id: "highlight", label: "Highlight", icon: <Highlighter className="w-4 h-4" />, action: () => onHighlight() }
  ];

  // Outside click listeners
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (slashMenuRef.current && !slashMenuRef.current.contains(e.target)) {
        setSlashMenu(null);
      }
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target)) {
        setIsMoreMenuOpen(false);
      }
    };
    window.addEventListener("mousedown", handleOutsideClick);
    return () => window.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const insertTodoItem = () => {
    const todoHtml = `<div class="todo-item" contenteditable="false"><input type="checkbox" class="todo-checkbox" /><span contenteditable="true">Task description</span></div><p><br></p>`;
    document.execCommand("insertHTML", false, todoHtml);
    if (editorRef.current) onUpdateNote("content", editorRef.current.innerHTML);
  };

  const insertBlockquote = () => {
    const quoteHtml = `<blockquote class="editor-quote">Important reference...</blockquote><p><br></p>`;
    document.execCommand("insertHTML", false, quoteHtml);
    if (editorRef.current) onUpdateNote("content", editorRef.current.innerHTML);
  };

  const insertCodeBlock = () => {
    const codeHtml = `<pre class="editor-code"><code>// Write logic here...</code></pre><p><br></p>`;
    document.execCommand("insertHTML", false, codeHtml);
    if (editorRef.current) onUpdateNote("content", editorRef.current.innerHTML);
  };

  const openSlashMenuManual = () => {
    setSlashMenu({ top: 120, left: 24 });
    setSlashIndex(0);
  };

  const applySlashCommand = (cmd) => {
    setSlashMenu(null);
    cmd.action();
  };

  // Speech Recognition Engine
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
      manualStopRef.current = false;
    };

    recognition.onresult = (event) => {
      let finalChunk = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalChunk += event.results[i][0].transcript + " ";
        }
      }
      if (finalChunk && editorRef.current) {
        editorRef.current.focus();
        document.execCommand("insertText", false, finalChunk);
        onUpdateNote("content", editorRef.current.innerHTML);
      }
    };

    recognition.onend = () => {
      if (!manualStopRef.current) {
        try { recognition.start(); } catch (e) { setIsListening(false); }
      } else {
        setIsListening(false);
      }
    };

    recognition.onerror = () => {
      manualStopRef.current = true;
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    return () => {
      manualStopRef.current = true;
      try { recognition.stop(); } catch (e) {}
    };
  }, [editorRef, onUpdateNote]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      manualStopRef.current = true;
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      manualStopRef.current = false;
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        recognitionRef.current.stop();
        setTimeout(() => {
          recognitionRef.current.start();
          setIsListening(true);
        }, 100);
      }
    }
  };

  const handleEditorKeyDown = (e) => {
    if (slashMenu) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSlashIndex((prev) => (prev + 1) % slashCommands.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSlashIndex((prev) => (prev - 1 + slashCommands.length) % slashCommands.length);
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        applySlashCommand(slashCommands[slashIndex]);
        return;
      }
      if (e.key === "Escape" || e.key === "Backspace") {
        setSlashMenu(null);
        return;
      }
    }

    if (e.key === "/" && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      openSlashMenuManual();
    }
  };

  if (!activeNote) {
    return (
      <div className={`h-[calc(100dvh-5.5rem)] w-full flex flex-col items-center justify-center p-8 rounded-3xl border border-dashed text-center ${
        isDark ? "border-white/[0.08] bg-[#12071f]/20 text-purple-300/40" : "border-slate-200/90 bg-white/70 text-slate-400"
      }`}>
        <Sparkles className="w-8 h-8 opacity-80 mb-2 text-purple-500" />
        <p className="text-sm font-mono font-medium">Select a note from the vault</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      ref={containerRef}
      className={`rounded-2xl sm:rounded-3xl border shadow-xl flex flex-col h-[calc(100dvh-5.5rem)] max-h-[calc(100dvh-5.5rem)] relative overflow-hidden ${
        isZenMode ? "max-w-4xl mx-auto shadow-2xl border-purple-500/30" : ""
      } ${
        isDark 
          ? "bg-[#130722]/95 border-white/[0.08] text-slate-200" 
          : "bg-white/95 border-slate-200/90 text-slate-800"
      }`}
    >
      {/* Top Action Bar */}
      <div className={`px-3.5 sm:px-6 py-2.5 border-b flex items-center justify-between gap-2 shrink-0 ${
        isDark ? "border-white/[0.06] bg-purple-950/20" : "border-slate-100 bg-slate-50/50"
      }`}>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onClose}
            className="px-2.5 py-1.5 rounded-xl text-xs font-mono border transition-all cursor-pointer flex items-center gap-1 font-medium bg-purple-500/10 border-purple-500/20 text-purple-600 dark:text-purple-300 active:scale-95"
          >
            <span>←</span> <span>Close</span>
          </button>
          
          <button
            onClick={openSlashMenuManual}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-300 text-xs font-mono font-medium transition-all cursor-pointer active:scale-95"
            title="Open Block Insertion Menu"
          >
            <Command className="w-3.5 h-3.5" />
            <span>Blocks</span>
          </button>
        </div>

        {/* Desktop View: Full Toolbar In-Line (lg:flex) */}
        <div className="hidden lg:flex items-center gap-2">
          {/* Undo / Redo */}
          <div className={`flex items-center gap-0.5 p-0.5 rounded-xl border ${
            isDark ? "bg-[#1a0c30] border-white/10" : "bg-slate-100 border-slate-200"
          }`}>
            <button
              onMouseDown={(e) => { e.preventDefault(); document.execCommand("undo"); if (editorRef.current) onUpdateNote("content", editorRef.current.innerHTML); }}
              className="p-1.5 rounded-lg text-xs font-mono cursor-pointer active:scale-90 hover:bg-white/10"
              title="Undo"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button
              onMouseDown={(e) => { e.preventDefault(); document.execCommand("redo"); if (editorRef.current) onUpdateNote("content", editorRef.current.innerHTML); }}
              className="p-1.5 rounded-lg text-xs font-mono cursor-pointer active:scale-90 hover:bg-white/10"
              title="Redo"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Zen Mode */}
          <button
            onClick={() => setIsZenMode(!isZenMode)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-mono border transition-all cursor-pointer flex items-center gap-1.5 font-medium active:scale-95 ${
              isZenMode 
                ? "bg-purple-600 text-white border-purple-500" 
                : (isDark ? "bg-[#1d0c35] border-white/10 text-purple-300 hover:bg-purple-500/15" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100")
            }`}
          >
            {isZenMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span>{isZenMode ? "Exit Zen" : "Zen"}</span>
          </button>

          {/* Voice Dictation */}
          <button
            onClick={toggleListening}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
              isListening 
                ? "bg-rose-500/25 text-rose-300 border-rose-500/50 shadow-md" 
                : (isDark ? "bg-[#1d0c35] border-white/10 text-purple-300 hover:bg-purple-500/20" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100")
            }`}
          >
            {isListening ? (
              <span className="flex items-center gap-1.5 text-rose-300 font-semibold">
                <Radio className="w-3.5 h-3.5 text-rose-400 animate-pulse" /> Live
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Mic className="w-3.5 h-3.5 text-purple-400" /> Dictate
              </span>
            )}
          </button>

          {/* Copy Clean Content */}
          <button
            onClick={() => onCopyContent(activeNote)}
            className="p-2 rounded-xl border border-white/10 hover:bg-purple-500/10 transition-all cursor-pointer active:scale-95"
            title="Copy Note Text"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>

          {/* Clone Note */}
          <button
            onClick={() => onDuplicateNote(activeNote)}
            className="p-2 rounded-xl border border-white/10 hover:bg-purple-500/10 transition-all cursor-pointer active:scale-95"
            title="Duplicate Note"
          >
            <Sparkles className="w-3.5 h-3.5" />
          </button>

          {/* Export PDF */}
          <button
            onClick={() => onExportPDF(activeNote)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono font-medium shadow-md transition-all cursor-pointer active:scale-95"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>PDF</span>
          </button>
        </div>

        {/* Mobile & Tablet: Stacked "More Options" Menu (lg:hidden) */}
        <div className="flex lg:hidden items-center gap-1.5 relative" ref={moreMenuRef}>
          <button
            onClick={() => onExportPDF(activeNote)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-mono font-medium shadow-sm active:scale-95"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>PDF</span>
          </button>

          <button
            onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
            className={`p-1.5 rounded-xl border transition-all cursor-pointer active:scale-95 ${
              isMoreMenuOpen 
                ? "bg-purple-600 text-white border-purple-500" 
                : (isDark ? "bg-[#1d0c35] border-white/10 text-purple-200" : "bg-white border-slate-200 text-slate-700")
            }`}
            title="More Options"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {/* Stacked Dropdown Popover */}
          <AnimatePresence>
            {isMoreMenuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className={`absolute right-0 top-10 z-[9999] w-48 rounded-2xl border shadow-2xl p-1.5 backdrop-blur-2xl ${
                  isDark ? "bg-[#18082e]/98 border-purple-500/40 text-slate-200" : "bg-white/98 border-slate-200 text-slate-800"
                }`}
              >
                {/* Voice Dictation */}
                <button
                  onClick={() => { toggleListening(); setIsMoreMenuOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-mono hover:bg-purple-500/15 transition-colors text-left cursor-pointer"
                >
                  <Mic className={`w-3.5 h-3.5 ${isListening ? "text-rose-400" : "text-purple-400"}`} />
                  <span>{isListening ? "Stop Dictation" : "Voice Dictate"}</span>
                </button>

                {/* Zen Mode */}
                <button
                  onClick={() => { setIsZenMode(!isZenMode); setIsMoreMenuOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-mono hover:bg-purple-500/15 transition-colors text-left cursor-pointer"
                >
                  <Maximize2 className="w-3.5 h-3.5 text-purple-400" />
                  <span>{isZenMode ? "Exit Zen Mode" : "Zen Focus Mode"}</span>
                </button>

                {/* Undo */}
                <button
                  onClick={() => { document.execCommand("undo"); if (editorRef.current) onUpdateNote("content", editorRef.current.innerHTML); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-mono hover:bg-purple-500/15 transition-colors text-left cursor-pointer"
                >
                  <Undo2 className="w-3.5 h-3.5 text-purple-400" />
                  <span>Undo Change</span>
                </button>

                {/* Redo */}
                <button
                  onClick={() => { document.execCommand("redo"); if (editorRef.current) onUpdateNote("content", editorRef.current.innerHTML); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-mono hover:bg-purple-500/15 transition-colors text-left cursor-pointer"
                >
                  <Redo2 className="w-3.5 h-3.5 text-purple-400" />
                  <span>Redo Change</span>
                </button>

                {/* Duplicate Note */}
                <button
                  onClick={() => { onDuplicateNote(activeNote); setIsMoreMenuOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-mono hover:bg-purple-500/15 transition-colors text-left cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>Duplicate Note</span>
                </button>

                {/* Copy Text */}
                <button
                  onClick={() => { onCopyContent(activeNote); setIsMoreMenuOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-mono hover:bg-purple-500/15 transition-colors text-left cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5 text-purple-400" />
                  <span>Copy Clean Text</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Note Title & Meta */}
      <div className="px-4 sm:px-7 pt-3 pb-1 shrink-0">
        <input
          type="text"
          value={activeNote.title}
          onChange={(e) => onUpdateNote("title", e.target.value)}
          placeholder="Document Title..."
          className={`text-lg sm:text-2xl font-bold bg-transparent focus:outline-none w-full tracking-tight mb-2 ${
            isDark ? "text-slate-100 placeholder-purple-500/30" : "text-slate-900 placeholder-slate-400"
          }`}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <select
              value={activeNote.category}
              onChange={(e) => onUpdateNote("category", e.target.value)}
              className={`text-xs font-mono px-2 py-1 rounded-lg border bg-transparent focus:outline-none cursor-pointer ${
                isDark ? "border-white/10 text-slate-300" : "border-slate-200 text-slate-700"
              }`}
            >
              {categories.filter(c => c !== "All").map(cat => (
                <option key={cat} value={cat} className={isDark ? "bg-[#140822] text-slate-200" : "bg-white text-slate-900"}>{cat}</option>
              ))}
            </select>
            <input
              type="text"
              value={activeNote.tag}
              onChange={(e) => onUpdateNote("tag", e.target.value)}
              placeholder="#tag"
              className="text-xs font-mono px-2 py-1 rounded-lg border border-rose-500/30 bg-transparent focus:outline-none text-rose-400 w-24"
            />
          </div>

          <div className="text-[11px] font-mono text-purple-400/80 hidden sm:flex items-center gap-1">
            <span>Press</span>
            <kbd className="px-1.5 py-0.5 rounded border border-purple-400/30 bg-purple-500/10 text-[10px]"> / </kbd>
            <span>or click Blocks</span>
          </div>
        </div>
      </div>

      {/* Basic Quick Inline Bar */}
      <div className="px-4 sm:px-7 py-1.5 shrink-0 overflow-x-auto scrollbar-none">
        <div className={`flex items-center gap-1 p-1 rounded-xl border backdrop-blur-md w-fit ${
          isDark ? "bg-[#1a0b2e]/70 border-white/10" : "bg-slate-100 border-slate-200"
        }`}>
          <button
            onMouseDown={(e) => { e.preventDefault(); onCommand("bold"); }}
            className="p-1.5 rounded-lg text-xs font-mono cursor-pointer active:scale-95 hover:bg-purple-500/15"
            title="Bold"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            onMouseDown={(e) => { e.preventDefault(); onCommand("italic"); }}
            className="p-1.5 rounded-lg text-xs font-mono cursor-pointer active:scale-95 hover:bg-purple-500/15"
            title="Italic"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            onMouseDown={(e) => { e.preventDefault(); onHeading("<h3>"); }}
            className="p-1.5 rounded-lg text-xs font-mono cursor-pointer active:scale-95 hover:bg-purple-500/15"
            title="Heading"
          >
            <Heading1 className="w-3.5 h-3.5" />
          </button>
          <button
            onMouseDown={(e) => { e.preventDefault(); onHighlight(); }}
            className="p-1.5 rounded-lg text-xs font-mono cursor-pointer active:scale-95 text-amber-400 hover:bg-amber-400/10"
            title="Highlight"
          >
            <Highlighter className="w-3.5 h-3.5" />
          </button>
          <button
            onMouseDown={(e) => { e.preventDefault(); insertTodoItem(); }}
            className="p-1.5 rounded-lg text-xs font-mono cursor-pointer active:scale-95 hover:bg-purple-500/15"
            title="Task item"
          >
            <CheckSquare className="w-3.5 h-3.5" />
          </button>
          <button
            onMouseDown={(e) => { e.preventDefault(); onCommand("insertUnorderedList"); }}
            className="p-1.5 rounded-lg text-xs font-mono cursor-pointer active:scale-95 hover:bg-purple-500/15"
            title="Bulleted List"
          >
            <List className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Editor Content Area */}
      <div className="flex-1 px-4 sm:px-7 py-2 overflow-y-auto">
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onKeyDown={handleEditorKeyDown}
          onInput={() => {
            if (editorRef.current) {
              onUpdateNote("content", editorRef.current.innerHTML);
            }
          }}
          className="min-h-full w-full bg-transparent text-sm focus:outline-none leading-relaxed font-sans"
        />
      </div>

      {/* Slash Menu Popover */}
      <AnimatePresence>
        {slashMenu && (
          <motion.div 
            ref={slashMenuRef}
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`absolute z-[9999] w-52 rounded-2xl border shadow-2xl p-1.5 backdrop-blur-2xl ${
              isDark ? "bg-[#18082e]/98 border-purple-500/40 text-slate-200" : "bg-white/98 border-slate-200 text-slate-800"
            }`}
            style={{ top: `${slashMenu.top}px`, left: `${slashMenu.left}px` }}
          >
            <div className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-purple-400 mb-1">
              Insert Block
            </div>
            {slashCommands.map((cmd, i) => (
              <button
                key={cmd.id}
                onClick={() => applySlashCommand(cmd)}
                className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-mono transition-colors text-left cursor-pointer ${
                  slashIndex === i 
                    ? "bg-purple-600 text-white font-semibold" 
                    : "hover:bg-purple-500/10"
                }`}
              >
                <span>{cmd.icon}</span>
                <span>{cmd.label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Status Bar */}
      <div className={`px-4 sm:px-7 py-2 border-t flex items-center justify-between text-xs font-mono shrink-0 ${
        isDark ? "border-white/[0.06] text-slate-400" : "border-slate-100 text-slate-500"
      }`}>
        <div className="flex items-center gap-3">
          <span>{wordCount} words</span>
          <span className="hidden sm:inline flex items-center gap-1">
            <Clock className="w-3 h-3 text-purple-400" /> {readingTime} min
          </span>
        </div>
        <span className="flex items-center gap-1 text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Saved
        </span>
      </div>
    </motion.div>
  );
}

export default memo(EditorCanvas);