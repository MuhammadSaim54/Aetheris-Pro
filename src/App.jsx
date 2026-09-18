import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import BackgroundFX from "./components/BackgroundFX";
import Header from "./components/Header";
import NoteList from "./components/NoteList";
import EditorCanvas from "./components/EditorCanvas";
import TrashView from "./components/TrashView";
import AlertDialog from "./components/AlertDialog";
import CommandPalette from "./components/CommandPalette";
import ToastContainer from "./components/ToastContainer";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { useTheme } from "./context/ThemeContext";

export default function App() {
  const { isDark, toggleTheme } = useTheme();
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);

  const [toasts, setToasts] = useState([]);
  const addToast = useCallback((title, description = "", type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, title, description, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 2800);
  }, []);

  const [workspaceToDelete, setWorkspaceToDelete] = useState(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [paletteQuery, setPaletteQuery] = useState("");
  const [isZenMode, setIsZenMode] = useState(false);

  const [categories, setCategories] = useLocalStorage("aetheris_categories", [
    "All", "Ideas", "Code Snippets", "Architecture"
  ]);
  const [currentCategory, setCategory] = useState("All");
  const [selectedTag, setSelectedTag] = useState("All");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isTrashView, setIsTrashView] = useState(false);

  const [notes, setNotes] = useLocalStorage("aetheris_notes", [
    { 
      id: 1, 
      title: "Quantum State Neural Architecture", 
      category: "Architecture", 
      content: "<h3>System Overview</h3><p>Exploring decentralized neural nodes for secure multi-tenant data synchronization across edge clusters.</p><ul><li>Zero-latency verification protocol</li><li>High availability distributed state mesh</li></ul>", 
      tag: "#security", 
      pinned: true,
      isTrash: false,
      createdAt: "Sep 16, 2026"
    },
    { 
      id: 2, 
      title: "Tailwind v4 & Void Theme Aesthetics", 
      category: "Code Snippets", 
      content: "<h3>Design Principles</h3><p>Implementing custom radial gradients and amethyst glow layers with zero performance overhead.</p><ul><li>Pure CSS hardware acceleration</li><li>Pristine micro-contrast in dual views</li></ul>", 
      tag: "#react", 
      pinned: false,
      isTrash: false,
      createdAt: "Sep 16, 2026"
    }
  ]);

  // Fix: On mobile screens, do NOT open note by default (user sees note list first)
  const [activeNoteId, setActiveNoteId] = useState(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      return null;
    }
    return notes[0]?.id || null;
  });

  const activeNote = useMemo(() => notes.find((n) => n.id === activeNoteId && !n.isTrash) || null, [notes, activeNoteId]);

  const filteredNotes = useMemo(() => {
    const list = notes
      .filter((n) => !n.isTrash)
      .filter((n) => currentCategory === "All" || n.category === currentCategory)
      .filter((n) => selectedTag === "All" || n.tag === selectedTag);

    const pinned = list.filter((n) => n.pinned);
    const unpinned = list.filter((n) => !n.pinned);
    return [...pinned, ...unpinned];
  }, [notes, currentCategory, selectedTag]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "f") {
        e.preventDefault();
        setIsZenMode((prev) => !prev);
        return;
      }
      if (e.key === "Escape") {
        setIsCommandPaletteOpen(false);
        setWorkspaceToDelete(null);
        setIsZenMode(false);
        return;
      }

      if (document.activeElement.tagName !== "INPUT" && document.activeElement.contentEditable !== "true") {
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          e.preventDefault();
          const currIdx = filteredNotes.findIndex(n => n.id === activeNoteId);
          if (currIdx === -1) {
            if (filteredNotes.length > 0) setActiveNoteId(filteredNotes[0].id);
          } else {
            const nextIdx = e.key === "ArrowDown" 
              ? Math.min(filteredNotes.length - 1, currIdx + 1)
              : Math.max(0, currIdx - 1);
            setActiveNoteId(filteredNotes[nextIdx].id);
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [filteredNotes, activeNoteId]);

  useEffect(() => {
    if (editorRef.current && activeNote) {
      if (editorRef.current.innerHTML !== activeNote.content) {
        editorRef.current.innerHTML = activeNote.content || "";
      }
    }
  }, [activeNoteId]);

  const allTags = useMemo(() => {
    const tags = new Set(["All"]);
    notes.filter(n => !n.isTrash).forEach(n => { if (n.tag) tags.add(n.tag); });
    return Array.from(tags);
  }, [notes]);

  const notesCountByCat = useMemo(() => {
    const counts = { All: notes.filter(n => !n.isTrash).length };
    notes.filter(n => !n.isTrash).forEach((n) => { counts[n.category] = (counts[n.category] || 0) + 1; });
    return counts;
  }, [notes]);

  const trashCount = useMemo(() => notes.filter(n => n.isTrash).length, [notes]);
  const trashedNotes = useMemo(() => notes.filter(n => n.isTrash), [notes]);

  const updateActiveNote = useCallback((field, value) => {
    setNotes((prev) => prev.map((n) => (n.id === activeNoteId ? { ...n, [field]: value } : n)));
  }, [activeNoteId, setNotes]);

  const executeCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    if (editorRef.current) updateActiveNote("content", editorRef.current.innerHTML);
  };

  const handleToggleHeading = useCallback((tag = "<h3>") => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    let node = selection.anchorNode;
    if (node && node.nodeType === Node.TEXT_NODE) node = node.parentElement;

    let isHeading = false;
    let curr = node;
    while (curr && curr !== editorRef.current) {
      if (/^H[1-6]$/i.test(curr.tagName)) {
        isHeading = true;
        break;
      }
      curr = curr.parentElement;
    }

    if (isHeading) {
      document.execCommand("formatBlock", false, "<p>");
      addToast("Heading Removed", "Converted to normal paragraph", "info");
    } else {
      document.execCommand("formatBlock", false, tag);
      addToast("Heading Applied", "Click again to revert to paragraph", "info");
    }

    if (editorRef.current) updateActiveNote("content", editorRef.current.innerHTML);
  }, [addToast, updateActiveNote]);

  const handleHighlight = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      addToast("Select text first", "Highlight words using cursor before clicking", "info");
      return;
    }

    let parent = selection.anchorNode;
    if (parent && parent.nodeType === Node.TEXT_NODE) parent = parent.parentElement;

    const hasHighlight = parent && (
      parent.tagName === "MARK" ||
      (parent.style && parent.style.backgroundColor && parent.style.backgroundColor !== "transparent" && parent.style.backgroundColor !== "rgba(0, 0, 0, 0)")
    );

    if (hasHighlight) {
      document.execCommand("hiliteColor", false, "transparent");
      document.execCommand("removeFormat", false, null);
      if (parent.tagName === "MARK") parent.replaceWith(parent.innerText);
      addToast("Highlight Removed", "Cleaned selection formatting", "info");
    } else {
      const highlightBg = isDark ? "rgba(168, 85, 247, 0.35)" : "#fef08a";
      document.execCommand("hiliteColor", false, highlightBg);
      document.execCommand("foreColor", false, isDark ? "#ffffff" : "#0f172a");
      addToast("Text Highlighted", "Click again on selection to unhighlight", "info");
    }

    if (editorRef.current) updateActiveNote("content", editorRef.current.innerHTML);
  }, [isDark, addToast, updateActiveNote]);

  const handleExportVaultBackup = () => {
    const data = {
      version: "2.0",
      exportDate: new Date().toISOString(),
      categories,
      notes
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Aetheris_Vault_Backup_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    addToast("Backup Downloaded", "Entire vault exported as JSON");
  };

  const handleImportVaultBackup = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed.notes && Array.isArray(parsed.notes)) {
          setNotes(parsed.notes);
          if (parsed.categories && Array.isArray(parsed.categories)) {
            setCategories(parsed.categories);
          }
          if (parsed.notes.length > 0) setActiveNoteId(parsed.notes[0].id);
          addToast("Vault Restored", `Imported ${parsed.notes.length} documents safely`, "success");
        } else {
          addToast("Invalid Backup", "JSON structure not recognized", "error");
        }
      } catch (err) {
        addToast("Import Failed", "Corrupt JSON file", "error");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleAddCategory = useCallback((newCat) => {
    if (!categories.includes(newCat)) {
      setCategories((prev) => [...prev, newCat]);
      setCategory(newCat);
      setIsTrashView(false);
      addToast("Workspace Created", `Added "${newCat}" to active vaults`);
    }
  }, [categories, setCategories, addToast]);

  const handleConfirmDeleteWorkspace = useCallback(() => {
    if (!workspaceToDelete) return;
    const cat = workspaceToDelete;
    setCategories((prev) => prev.filter((c) => c !== cat));
    if (currentCategory === cat) setCategory("All");
    setNotes((prev) => prev.map((n) => (n.category === cat ? { ...n, category: "Ideas" } : n)));
    addToast("Workspace Deleted", `Documents shifted to Ideas vault`, "info");
    setWorkspaceToDelete(null);
  }, [workspaceToDelete, currentCategory, setCategories, setNotes, addToast]);

  const handleNewNote = useCallback(() => {
    setIsTrashView(false);
    const newDoc = {
      id: Date.now(),
      title: "Untitled Document",
      category: currentCategory === "All" ? "Ideas" : currentCategory,
      content: "<p>Start writing your thoughts, documentation, or code here...</p>",
      tag: "#general",
      pinned: false,
      isTrash: false,
      createdAt: "Sep 18, 2026"
    };
    setNotes((prev) => [newDoc, ...prev]);
    setActiveNoteId(newDoc.id);
    addToast("Document Initialized", "Ready for live capture");
  }, [currentCategory, setNotes, addToast]);

  const togglePinNote = useCallback((id, e) => {
    e.stopPropagation();
    const targetNote = notes.find((n) => n.id === id);
    if (!targetNote) return;
    const willPin = !targetNote.pinned;
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, pinned: willPin } : n)));
    addToast(willPin ? "Document Pinned" : "Document Unpinned", targetNote.title, "info");
  }, [notes, setNotes, addToast]);

  const deleteNote = useCallback((id, e) => {
    if (e) e.stopPropagation();
    setNotes((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, isTrash: true, pinned: false } : n));
      const remainingActive = updated.filter(n => !n.isTrash);
      if (activeNoteId === id) {
        setActiveNoteId(remainingActive.length > 0 ? remainingActive[0].id : null);
      }
      return updated;
    });
    addToast("Moved to Trash Bin", "Item can be restored from trash", "info");
  }, [activeNoteId, setNotes, addToast]);

  const handleRestoreNote = useCallback((id) => {
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, isTrash: false } : n)));
    setActiveNoteId(id);
    addToast("Document Restored", "Moved back to active vault", "success");
  }, [setNotes, addToast]);

  const handlePermanentDelete = useCallback((id) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    addToast("Permanently Deleted", "Item wiped from storage", "error");
  }, [setNotes, addToast]);

  const handleEmptyTrash = useCallback(() => {
    setNotes((prev) => prev.filter(n => !n.isTrash));
    addToast("Trash Emptied", "All deleted documents wiped", "error");
  }, [setNotes, addToast]);

  const handleReorderNotes = useCallback((draggedNoteId, targetNoteId) => {
    setNotes((prevNotes) => {
      const draggedIdx = prevNotes.findIndex((n) => n.id === draggedNoteId);
      const targetIdx = prevNotes.findIndex((n) => n.id === targetNoteId);

      if (draggedIdx === -1 || targetIdx === -1) return prevNotes;

      const updated = Array.from(prevNotes);
      const [movedItem] = updated.splice(draggedIdx, 1);
      updated.splice(targetIdx, 0, movedItem);

      return updated;
    });
    addToast("Notes Reordered", "Saved sequence to vault", "info");
  }, [setNotes, addToast]);

  const handleDropNoteOnWorkspace = useCallback((noteId, targetWorkspace) => {
    setNotes((prev) => prev.map((n) => (n.id === noteId ? { ...n, category: targetWorkspace } : n)));
    addToast("Moved to Workspace", `Transferred note to "${targetWorkspace}"`, "success");
  }, [setNotes, addToast]);

  const handleDropNoteOnTrash = useCallback((noteId) => {
    deleteNote(noteId);
  }, [deleteNote]);

  const handleDuplicateNote = useCallback((note) => {
    const dup = { ...note, id: Date.now(), title: `${note.title} (Copy)`, pinned: false, isTrash: false, createdAt: "Sep 18, 2026" };
    setNotes((prev) => [dup, ...prev]);
    setActiveNoteId(dup.id);
    addToast("Document Duplicated", `Cloned inside ${note.category}`);
  }, [setNotes, addToast]);

  const copyCleanContent = useCallback((note) => {
    if (!note) return;
    const clean = note.content.replace(/<[^>]*>/g, '');
    navigator.clipboard.writeText(`${note.title}\n\n${clean}`);
    addToast("Copied to Clipboard", "Ready to paste anywhere");
  }, [addToast]);

  const handleExportPDF = useCallback((note) => {
    if (!note) return;
    addToast("Generating PDF...", "Opening print pipeline", "info");

    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${note.title}</title>
          <style>
            @page { margin: 20mm; size: A4; }
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; box-sizing: border-box; }
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #0f172a !important; background: #ffffff !important; line-height: 1.65; padding: 24px; }
            .header { border-bottom: 2px solid #9333ea; padding-bottom: 16px; margin-bottom: 24px; }
            h1 { font-size: 26px; margin: 0 0 8px 0; color: #4c1d95 !important; }
            .meta { font-family: monospace; font-size: 11px; color: #64748b !important; }
            .content { font-size: 14px; color: #0f172a !important; }
            h2, h3 { color: #6b21a8 !important; margin-top: 20px; }
            ul { padding-left: 24px; list-style-type: disc !important; }
            ol { padding-left: 24px; list-style-type: decimal !important; }
            li { margin-bottom: 6px; color: #0f172a !important; }
            mark, span[style*="background-color"], [style*="background-color"] {
              background-color: #fef08a !important; color: #0f172a !important; padding: 1px 4px !important; border-radius: 3px !important; border: 1px solid #fde047 !important; display: inline !important;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${note.title}</h1>
            <div class="meta">Workspace: ${note.category} | Tag: ${note.tag} | Timestamp: ${note.createdAt}</div>
          </div>
          <div class="content">${note.content}</div>
        </body>
      </html>
    `);
    doc.close();

    iframe.contentWindow.focus();
    setTimeout(() => {
      iframe.contentWindow.print();
      document.body.removeChild(iframe);
    }, 400);
  }, [addToast]);

  return (
    <div 
      className={`h-[100dvh] w-full flex font-sans transition-colors duration-500 relative overflow-hidden ${
        isDark ? "bg-[#090310] text-slate-100" : "bg-[#faf9fe] text-slate-900"
      }`} 
      data-theme={isDark ? "dark" : "light"}
    >
      {isDark && <BackgroundFX />}

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleImportVaultBackup} 
        accept=".json" 
        className="hidden" 
      />

      {!isZenMode && (
        <Sidebar 
          currentCategory={currentCategory} 
          setCategory={(cat) => {
            setCategory(cat);
            setIsTrashView(false);
          }} 
          categories={categories}
          onAddCategory={handleAddCategory}
          onPromptDeleteCategory={(cat) => setWorkspaceToDelete(cat)}
          onNewNote={handleNewNote}
          notesCountByCat={notesCountByCat}
          trashCount={trashCount}
          isTrashView={isTrashView}
          setIsTrashView={setIsTrashView}
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
          onDropNoteOnWorkspace={handleDropNoteOnWorkspace}
          onDropNoteOnTrash={handleDropNoteOnTrash}
        />
      )}

      {/* Main Viewport Container */}
      <div className="flex-1 flex flex-col h-[100dvh] relative lg:z-30 overflow-hidden">
        {!isZenMode && (
          <Header 
            isDark={isDark}
            toggleTheme={() => {
              toggleTheme();
              addToast("Theme Toggled", `Switched to ${isDark ? "Light" : "Dark"} mode`, "info");
            }}
            onOpenSidebar={() => setIsMobileSidebarOpen(true)}
            onOpenPalette={() => setIsCommandPaletteOpen(true)}
          />
        )}

        <main className={`mx-auto w-full px-3 sm:px-6 md:px-6 lg:px-8 py-2 sm:py-4 flex-1 overflow-hidden ${isZenMode ? "max-w-4xl" : "max-w-[1600px]"}`}>
          {isTrashView ? (
            <TrashView 
              trashedNotes={trashedNotes}
              onRestoreNote={handleRestoreNote}
              onPermanentDelete={handlePermanentDelete}
              onEmptyTrash={handleEmptyTrash}
              isDark={isDark}
            />
          ) : (
            <div className={`h-full grid gap-3 sm:gap-4 md:gap-5 ${isZenMode ? "grid-cols-1" : "grid-cols-1 md:grid-cols-12"}`}>
              {/* NoteList: Mobile par tabhi show ho jab note select na ho */}
              {!isZenMode && (
                <div className={`h-full md:col-span-5 lg:col-span-4 ${activeNote ? "hidden md:block" : "block"}`}>
                  <NoteList 
                    currentCategory={currentCategory}
                    filteredNotes={filteredNotes}
                    activeNoteId={activeNoteId}
                    setActiveNoteId={setActiveNoteId}
                    allTags={allTags}
                    selectedTag={selectedTag}
                    setSelectedTag={setSelectedTag}
                    onNewNote={handleNewNote}
                    onTogglePin={togglePinNote}
                    onDeleteNote={deleteNote}
                    onReorderNotes={handleReorderNotes}
                    isDark={isDark}
                  />
                </div>
              )}

              {/* Editor Canvas: Mobile par tabhi show ho jab note active ho */}
              <div className={`h-full ${isZenMode ? "col-span-1" : `md:col-span-7 lg:col-span-8 ${activeNote ? "block" : "hidden md:block"}`}`}>
                <EditorCanvas 
                  activeNote={activeNote}
                  editorRef={editorRef}
                  categories={categories}
                  onClose={() => setActiveNoteId(null)}
                  onUpdateNote={updateActiveNote}
                  onDuplicateNote={handleDuplicateNote}
                  onCopyContent={copyCleanContent}
                  onExportPDF={handleExportPDF}
                  onCommand={executeCommand}
                  onHighlight={handleHighlight}
                  onHeading={handleToggleHeading}
                  isZenMode={isZenMode}
                  setIsZenMode={setIsZenMode}
                  isDark={isDark}
                />
              </div>
            </div>
          )}
        </main>
      </div>

      <AlertDialog 
        isOpen={Boolean(workspaceToDelete)}
        workspaceName={workspaceToDelete}
        onCancel={() => setWorkspaceToDelete(null)}
        onConfirm={handleConfirmDeleteWorkspace}
        isDark={isDark}
      />

      <CommandPalette 
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        paletteQuery={paletteQuery}
        setPaletteQuery={setPaletteQuery}
        results={notes.filter(n => !n.isTrash && (!paletteQuery.trim() || n.title.toLowerCase().includes(paletteQuery.toLowerCase())))}
        onSelectNote={(id) => { 
          setIsTrashView(false);
          setActiveNoteId(id); 
          setIsCommandPaletteOpen(false); 
        }}
        onBackupVault={handleExportVaultBackup}
        onRestoreVault={() => fileInputRef.current?.click()}
        isDark={isDark}
      />

      <ToastContainer toasts={toasts} isDark={isDark} />
    </div>
  );
}