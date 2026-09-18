import React, { memo, useState, useEffect, useRef, useCallback, useMemo } from "react";
import { 
  Copy, Sparkles, FileDown, Bold, Italic, Heading1, Heading2, Highlighter, 
  List, CheckSquare, Mic, Radio, Maximize2, Minimize2, 
  Code2, Quote, Undo2, Redo2, Clock
} from "lucide-react";

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
  const [interimText, setInterimText] = useState("");
  const [slashMenu, setSlashMenu] = useState(null);
  const [slashIndex, setSlashIndex] = useState(0);

  const containerRef = useRef(null);
  const recognitionRef = useRef(null);
  const manualStopRef = useRef(false);
  const slashMenuRef = useRef(null);

  const { wordCount, charCount, readingTime } = useMemo(() => {
    if (!activeNote?.content) return { wordCount: 0, charCount: 0, readingTime: 0 };
    const plain = activeNote.content.replace(/<[^>]*>/g, ' ');
    const words = plain.split(/\s+/).filter(Boolean).length;
    const chars = activeNote.content.replace(/<[^>]*>/g, '').length;
    const mins = Math.max(1, Math.ceil(words / 200));
    return { wordCount: words, charCount: chars, readingTime: mins };
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

  useEffect(() => {
    if (!slashMenu) return;
    const handleOutsideClick = (e) => {
      if (slashMenuRef.current && !slashMenuRef.current.contains(e.target)) {
        setSlashMenu(null);
      }
    };
    window.addEventListener("mousedown", handleOutsideClick);
    return () => window.removeEventListener("mousedown", handleOutsideClick);
  }, [slashMenu]);

  const insertTodoItem = () => {
    const todoHtml = `<div class="todo-item" contenteditable="false"><input type="checkbox" class="todo-checkbox" /><span contenteditable="true">Task description</span></div><p><br></p>`;
    document.execCommand("insertHTML", false, todoHtml);
    if (editorRef.current) onUpdateNote("content", editorRef.current.innerHTML);
  };

  const insertBlockquote = () => {
    const quoteHtml = `<blockquote class="editor-quote">Important insight or reference...</blockquote><p><br></p>`;
    document.execCommand("insertHTML", false, quoteHtml);
    if (editorRef.current) onUpdateNote("content", editorRef.current.innerHTML);
  };

  const insertCodeBlock = () => {
    const codeHtml = `<pre class="editor-code"><code>// Write clean logic here...</code></pre><p><br></p>`;
    document.execCommand("insertHTML", false, codeHtml);
    if (editorRef.current) onUpdateNote("content", editorRef.current.innerHTML);
  };

  const applySlashCommand = (cmd) => {
    setSlashMenu(null);
    cmd.action();
  };

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const handleEditorClick = (e) => {
      if (e.target && e.target.classList.contains("todo-checkbox")) {
        const item = e.target.closest(".todo-item");
        if (item) {
          if (e.target.checked) {
            item.classList.add("completed");
            e.target.setAttribute("checked", "true");
          } else {
            item.classList.remove("completed");
            e.target.removeAttribute("checked");
          }
          onUpdateNote("content", editor.innerHTML);
        }
      }
    };

    editor.addEventListener("click", handleEditorClick);
    return () => editor.removeEventListener("click", handleEditorClick);
  }, [editorRef, onUpdateNote]);

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
      let liveInterim = "";
      let finalChunk = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalChunk += text + " ";
        } else {
          liveInterim += text;
        }
      }

      setInterimText(liveInterim);

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
        setInterimText("");
      }
    };

    recognition.onerror = (e) => {
      if (e.error !== "no-speech") {
        manualStopRef.current = true;
        setIsListening(false);
        setInterimText("");
      }
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
      setInterimText("");
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
      if (e.key === "Escape" || e.key === "Backspace" || e.key === " ") {
        setSlashMenu(null);
        return;
      }
    }

    if (e.key === "/" && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      if (!containerRef.current || !editorRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const selection = window.getSelection();

      let topOffset = 180;
      let leftOffset = 30;

      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0).cloneRange();
        let rect = range.getBoundingClientRect();

        if (!rect || rect.width === 0 || rect.top === 0) {
          const span = document.createElement("span");
          span.appendChild(document.createTextNode("\u200b"));
          range.insertNode(span);
          rect = span.getBoundingClientRect();
          const parent = span.parentNode;
          parent.removeChild(span);
          parent.normalize();
        }

        if (rect && rect.top > 0) {
          topOffset = rect.bottom - containerRect.top + 6;
          leftOffset = rect.left - containerRect.left;
        }
      }

      const maxLeft = containerRect.width - 240;
      const maxTop = containerRect.height - 300;

      setSlashMenu({
        top: Math.max(10, Math.min(topOffset, maxTop)),
        left: Math.max(16, Math.min(leftOffset, maxLeft))
      });
      setSlashIndex(0);
    }
  };

  if (!activeNote) {
    return (
      <div className={`h-[calc(100dvh-5.5rem)] w-full flex flex-col items-center justify-center p-8 sm:p-12 rounded-2xl sm:rounded-3xl border border-dashed text-center transition-all ${
        isDark 
          ? "border-white/[0.08] bg-[#12071f]/20 text-purple-300/40" 
          : "border-slate-200/90 bg-white/70 text-slate-400 shadow-2xs"
      }`}>
        <div className={`p-4 rounded-2xl mb-3 ${isDark ? "bg-purple-500/10 text-purple-400" : "bg-purple-50 text-purple-600"}`}>
          <Sparkles className="w-8 h-8 opacity-80" />
        </div>
        <p className="text-sm font-mono font-medium">Select a note from the vault</p>
        <p className={`text-xs font-mono mt-1 ${isDark ? "text-purple-300/30" : "text-slate-400"}`}>
          or click '+ New' to create a note
        </p>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`rounded-2xl sm:rounded-3xl border shadow-xl flex flex-col h-[calc(100dvh-5.5rem)] max-h-[calc(100dvh-5.5rem)] transition-all relative overflow-hidden ${
        isZenMode ? "max-w-4xl mx-auto shadow-[0_0_100px_rgba(0,0,0,0.8)] border-purple-500/30" : ""
      } ${
        isDark 
          ? "bg-gradient-to-b from-[#140726]/95 to-[#0f041d]/95 border-white/[0.08] backdrop-blur-2xl ring-1 ring-purple-500/10" 
          : "bg-white/95 border-slate-200/90 backdrop-blur-xl shadow-sm ring-1 ring-slate-100"
      }`}
    >
      {/* Top Action Bar (Horizontal scrolling on mobile to avoid squishing) */}
      <div className={`px-3 sm:px-6 py-2.5 border-b flex items-center justify-between gap-2 shrink-0 overflow-x-auto scrollbar-none ${
        isDark ? "border-white/[0.06] bg-purple-950/20" : "border-slate-100 bg-slate-50/50"
      }`}>
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <button
            onClick={onClose}
            className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-mono border transition-all cursor-pointer flex items-center gap-1 font-medium active:scale-95 shrink-0 ${
              isDark 
                ? "bg-[#1d0c35] border-white/10 text-purple-200 hover:bg-purple-500/20" 
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100 shadow-2xs"
            }`}
          >
            <span>←</span> <span>Close</span>
          </button>
          
          <button
            onClick={() => setIsZenMode(!isZenMode)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-mono border transition-all cursor-pointer flex items-center gap-1.5 font-medium active:scale-95 shrink-0 ${
              isZenMode 
                ? "bg-purple-600 text-white border-purple-500 shadow-sm" 
                : (isDark ? "bg-[#1d0c35] border-white/10 text-purple-300 hover:bg-purple-500/15" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100")
            }`}
            title="Toggle Zen Mode"
          >
            {isZenMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">{isZenMode ? "Exit Zen" : "Zen"}</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Undo / Redo */}
          <div className={`flex items-center gap-0.5 p-0.5 rounded-xl border ${
            isDark ? "bg-[#1a0c30] border-white/10" : "bg-slate-100 border-slate-200"
          }`}>
            <button
              onMouseDown={(e) => { e.preventDefault(); document.execCommand("undo"); if (editorRef.current) onUpdateNote("content", editorRef.current.innerHTML); }}
              className={`p-1.5 rounded-lg text-xs font-mono cursor-pointer active:scale-90 ${
                isDark ? "text-purple-300 hover:bg-purple-500/20" : "text-slate-700 hover:bg-white"
              }`}
              title="Undo"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button
              onMouseDown={(e) => { e.preventDefault(); document.execCommand("redo"); if (editorRef.current) onUpdateNote("content", editorRef.current.innerHTML); }}
              className={`p-1.5 rounded-lg text-xs font-mono cursor-pointer active:scale-90 ${
                isDark ? "text-purple-300 hover:bg-purple-500/20" : "text-slate-700 hover:bg-white"
              }`}
              title="Redo"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Voice Typing */}
          <button
            onClick={toggleListening}
            className={`px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shrink-0 ${
              isListening 
                ? "bg-rose-500/25 text-rose-300 border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.35)]" 
                : (isDark ? "bg-[#1d0c35] border-white/10 text-purple-300 hover:bg-purple-500/20" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100")
            }`}
          >
            {isListening ? (
              <span className="flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                <span className="text-rose-300 font-semibold text-[11px] sm:text-xs">Live</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Mic className="w-3.5 h-3.5 text-purple-400" />
                <span className="hidden sm:inline">Dictate</span>
              </span>
            )}
          </button>

          <button
            onClick={() => onCopyContent(activeNote)}
            className={`p-1.5 sm:p-2 rounded-xl border transition-all cursor-pointer active:scale-95 shrink-0 ${
              isDark 
                ? "bg-[#1d0c35] border-white/10 text-purple-300 hover:bg-purple-500/10" 
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-2xs"
            }`}
            title="Copy content"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onDuplicateNote(activeNote)}
            className={`p-1.5 sm:p-2 rounded-xl border transition-all cursor-pointer active:scale-95 shrink-0 ${
              isDark 
                ? "bg-[#1d0c35] border-white/10 text-purple-300 hover:bg-purple-500/10" 
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-2xs"
            }`}
            title="Clone Note"
          >
            <Sparkles className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onExportPDF(activeNote)}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white text-xs font-mono font-medium shadow-md shadow-purple-600/25 transition-all cursor-pointer active:scale-95 shrink-0"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>PDF</span>
          </button>
        </div>
      </div>

      {/* Note Title & Meta */}
      <div className="px-4 sm:px-7 pt-3 sm:pt-4 pb-2 shrink-0">
        <input
          type="text"
          value={activeNote.title}
          onChange={(e) => onUpdateNote("title", e.target.value)}
          placeholder="Document Title..."
          className={`text-lg sm:text-2xl font-extrabold bg-transparent focus:outline-none w-full tracking-tight mb-2 transition-colors ${
            isDark ? "text-white placeholder-purple-500/20" : "text-slate-900 placeholder-slate-300"
          }`}
        />

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={activeNote.category}
            onChange={(e) => onUpdateNote("category", e.target.value)}
            className={`text-xs font-mono font-medium px-2.5 py-1.5 rounded-xl border focus:outline-none cursor-pointer transition-all ${
              isDark 
                ? "bg-[#1a0c30] border-white/10 text-purple-200" 
                : "bg-slate-100/80 border-slate-200 text-slate-700"
            }`}
          >
            {categories.filter(c => c !== "All").map(cat => (
              <option key={cat} value={cat} className={isDark ? "bg-[#140822] text-white" : "bg-white text-slate-900"}>{cat}</option>
            ))}
          </select>

          <input
            type="text"
            value={activeNote.tag}
            onChange={(e) => onUpdateNote("tag", e.target.value)}
            placeholder="#tag"
            className={`text-xs font-mono px-2.5 py-1.5 rounded-xl border w-24 sm:w-28 focus:outline-none transition-all ${
              isDark 
                ? "bg-[#1a0c30] border-white/10 text-rose-400 focus:border-rose-400/60" 
                : "bg-slate-100/80 border-slate-200 text-rose-600 focus:border-rose-300"
            }`}
          />
        </div>
      </div>

      {/* Inline Toolbar */}
      <div className="px-4 sm:px-7 py-1.5 shrink-0 overflow-x-auto scrollbar-none">
        <div className={`flex items-center gap-1 p-1 rounded-2xl border backdrop-blur-md w-fit ${
          isDark ? "bg-[#1c0c35]/80 border-white/10 shadow-lg shadow-black/20" : "bg-slate-100/80 border-slate-200/80"
        }`}>
          <button
            onMouseDown={(e) => { e.preventDefault(); onCommand("bold"); }}
            className={`p-1.5 sm:p-2 rounded-xl text-xs font-mono cursor-pointer active:scale-95 ${
              isDark ? "text-purple-300 hover:bg-purple-500/20" : "text-slate-700 hover:bg-white"
            }`}
            title="Bold"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>

          <button
            onMouseDown={(e) => { e.preventDefault(); onCommand("italic"); }}
            className={`p-1.5 sm:p-2 rounded-xl text-xs font-mono cursor-pointer active:scale-95 ${
              isDark ? "text-purple-300 hover:bg-purple-500/20" : "text-slate-700 hover:bg-white"
            }`}
            title="Italic"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>

          <button
            onMouseDown={(e) => { e.preventDefault(); onHeading("<h3>"); }}
            className={`p-1.5 sm:p-2 rounded-xl text-xs font-mono cursor-pointer active:scale-95 ${
              isDark ? "text-purple-300 hover:bg-purple-500/20" : "text-slate-700 hover:bg-white"
            }`}
            title="Heading"
          >
            <Heading1 className="w-3.5 h-3.5" />
          </button>

          <button
            onMouseDown={(e) => { e.preventDefault(); onHighlight(); }}
            className={`p-1.5 sm:p-2 rounded-xl text-xs font-mono cursor-pointer active:scale-95 ${
              isDark ? "text-amber-300 hover:bg-amber-500/20" : "text-amber-600 hover:bg-white"
            }`}
            title="Highlight"
          >
            <Highlighter className="w-3.5 h-3.5" />
          </button>

          <button
            onMouseDown={(e) => { e.preventDefault(); insertTodoItem(); }}
            className={`p-1.5 sm:p-2 rounded-xl text-xs font-mono cursor-pointer active:scale-95 ${
              isDark ? "text-purple-300 hover:bg-purple-500/20" : "text-slate-700 hover:bg-white"
            }`}
            title="Checkbox"
          >
            <CheckSquare className="w-3.5 h-3.5" />
          </button>

          <div className={`w-[1px] h-4 mx-1 ${isDark ? "bg-white/10" : "bg-slate-300"}`} />

          <button
            onMouseDown={(e) => { e.preventDefault(); onCommand("insertUnorderedList"); }}
            className={`p-1.5 sm:p-2 rounded-xl text-xs font-mono cursor-pointer active:scale-95 ${
              isDark ? "text-purple-300 hover:bg-purple-500/20" : "text-slate-700 hover:bg-white"
            }`}
            title="Bullet List"
          >
            <List className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Slash Menu */}
      {slashMenu && (
        <div 
          ref={slashMenuRef}
          className={`absolute z-[9999] w-52 sm:w-56 rounded-2xl border shadow-2xl p-1.5 backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-100 ${
            isDark ? "bg-[#18082e]/98 border-purple-500/40 text-white shadow-purple-950/80" : "bg-white/98 border-slate-200 text-slate-800 shadow-xl"
          }`}
          style={{ top: `${slashMenu.top}px`, left: `${slashMenu.left}px` }}
        >
          <div className={`px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider mb-1 ${isDark ? "text-purple-300/40" : "text-slate-400"}`}>
            Insert Block
          </div>
          {slashCommands.map((cmd, i) => (
            <button
              key={cmd.id}
              onClick={() => applySlashCommand(cmd)}
              className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-mono transition-colors text-left cursor-pointer ${
                slashIndex === i 
                  ? (isDark ? "bg-purple-600 text-white" : "bg-purple-100 text-purple-900 font-semibold")
                  : (isDark ? "hover:bg-white/5" : "hover:bg-slate-100")
              }`}
            >
              <span className="opacity-75">{cmd.icon}</span>
              <span>{cmd.label}</span>
            </button>
          ))}
        </div>
      )}

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
          className="min-h-full w-full bg-transparent text-sm focus:outline-none leading-relaxed font-sans transition-colors"
        />
      </div>

      {/* Status Bar */}
      <div className={`px-4 sm:px-7 py-2 sm:py-2.5 border-t flex items-center justify-between text-[11px] sm:text-xs font-mono shrink-0 ${
        isDark ? "border-white/[0.06] text-purple-300/40 bg-purple-950/10" : "border-slate-100 text-slate-400 bg-slate-50/40"
      }`}>
        <div className="flex items-center gap-3">
          <span>Words: {wordCount}</span>
          <span className="hidden sm:inline-flex items-center gap-1">
            <Clock className="w-3 h-3 text-purple-400/70" /> {readingTime} min
          </span>
        </div>
        <span className="flex items-center gap-1 text-emerald-500 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Saved
        </span>
      </div>
    </div>
  );
}

export default memo(EditorCanvas);