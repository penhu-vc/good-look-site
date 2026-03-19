"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import {
  Sparkles,
  Download,
  Wand2,
  BookOpen,
  ArrowRight,
  Twitter,
  Linkedin,
  Instagram,
  Menu,
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  User,
  Plus,
  ChevronRight,
  ExternalLink,
  Eye,
  Check,
  Circle,
} from "lucide-react";
import Image from "next/image";

/* ── Overlay / Modal shell ── */
function Overlay({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="liquid-glass-strong relative rounded-3xl p-8 max-w-lg w-[90%] animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-transform"
        >
          <X className="w-4 h-4" />
        </button>
        {children}
      </div>
    </div>
  );
}

/* ── Pill button with ripple ── */
function RippleButton({
  children,
  className = "",
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);
  const nextId = useRef(0);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = nextId.current++;
    setRipples((r) => [...r, { x, y, id }]);
    setTimeout(() => setRipples((r) => r.filter((ri) => ri.id !== id)), 600);
    onClick?.();
  };

  return (
    <button className={`relative overflow-hidden ${className}`} onClick={handleClick}>
      {ripples.map((r) => (
        <span
          key={r.id}
          className="absolute rounded-full bg-white/20 animate-ripple pointer-events-none"
          style={{ left: r.x - 20, top: r.y - 20, width: 40, height: 40 }}
        />
      ))}
      {children}
    </button>
  );
}

/* ── Shortcut categories ── */
const CATEGORIES = ["All", "Tool", "外務"] as const;
type Category = (typeof CATEGORIES)[number];

/* ── Shortcut links ── */
const SHORTCUTS: { label: string; url: string; icon: typeof Eye; category: Category }[] = [
  { label: "IG Viewer", url: "https://ig-viewer-1045287228517.asia-east1.run.app", icon: Eye, category: "Tool" },
];

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(true);
  const [accountOpen, setAccountOpen] = useState(false);
  const [sparklesActive, setSparklesActive] = useState(false);
  const [featureModal, setFeatureModal] = useState<number | null>(null);
  const [communityOpen, setCommunityOpen] = useState(false);
  const [sculptingOpen, setSculptingOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteTab, setNoteTab] = useState<"Work" | "Personal">("Work");
  const [noteItems, setNoteItems] = useState<{ Work: string[]; Personal: string[] }>({ Work: [""], Personal: [""] });
  const noteTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [addSiteOpen, setAddSiteOpen] = useState(false);
  const [addSiteUrl, setAddSiteUrl] = useState("");
  const [addSiteCategory, setAddSiteCategory] = useState<"Tool" | "外務">("Tool");
  const [addSiteLoading, setAddSiteLoading] = useState(false);
  const [customSites, setCustomSites] = useState<{ label: string; url: string; category: "Tool" | "外務"; favicon: string }[]>([]);
  const addSiteInputRef = useRef<HTMLInputElement>(null);
  const [todos, setTodos] = useState<{ id: number; text: string; done: boolean }[]>([]);
  const [todoInput, setTodoInput] = useState("");
  const todoInputRef = useRef<HTMLInputElement>(null);
  const todoIdRef = useRef(0);
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [quickAddUrl, setQuickAddUrl] = useState("");
  const [quickAddLoading, setQuickAddLoading] = useState(false);
  const [tempSites, setTempSites] = useState<{ label: string; url: string; favicon: string }[]>([]);
  const quickAddInputRef = useRef<HTMLInputElement>(null);

  const allShortcuts = [
    ...SHORTCUTS,
    ...customSites.map((s) => ({ ...s, icon: ExternalLink as typeof Sparkles })),
  ];
  const filteredShortcuts = activeCategory === "All"
    ? allShortcuts
    : allShortcuts.filter((s) => s.category === activeCategory);

  const handleAddSite = useCallback(async () => {
    let url = addSiteUrl.trim();
    if (!url) return;
    if (!/^https?:\/\//i.test(url)) url = "https://" + url;
    setAddSiteLoading(true);
    try {
      let title = new URL(url).hostname.replace(/^www\./, "");
      try {
        const res = await fetch(`/api/site-meta?url=${encodeURIComponent(url)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.title) title = data.title;
        }
      } catch { /* fallback to hostname */ }
      const favicon = `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=64`;
      const newSite = { label: title, url, category: addSiteCategory, favicon };
      setCustomSites((prev) => [...prev, newSite]);
      supabase.from("sites").insert(newSite).then(() => {});
      setAddSiteUrl("");
      setAddSiteOpen(false);
    } catch { /* invalid URL */ }
    finally { setAddSiteLoading(false); }
  }, [addSiteUrl, addSiteCategory]);

  const handleQuickAdd = useCallback(async () => {
    let url = quickAddUrl.trim();
    if (!url) return;
    if (!/^https?:\/\//i.test(url)) url = "https://" + url;
    setQuickAddLoading(true);
    try {
      // Try fetching title via a simple proxy-free approach
      let title = new URL(url).hostname.replace(/^www\./, "");
      try {
        const res = await fetch(`/api/site-meta?url=${encodeURIComponent(url)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.title) title = data.title;
        }
      } catch { /* fallback to hostname */ }
      const favicon = `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=64`;
      setTempSites((prev) => [...prev, { label: title, url, favicon }]);
      setQuickAddUrl("");
      setQuickAddOpen(false);
    } catch {
      // invalid URL
    } finally {
      setQuickAddLoading(false);
    }
  }, [quickAddUrl]);

  // Load data from Supabase on mount
  useEffect(() => {
    // Load notes
    supabase.from("notes").select("*").then(({ data }) => {
      if (data) {
        const obj: { Work: string[]; Personal: string[] } = { Work: [""], Personal: [""] };
        for (const row of data) {
          if (row.tab === "Work" || row.tab === "Personal") {
            obj[row.tab] = Array.isArray(row.items) ? row.items : [""];
          }
        }
        setNoteItems(obj);
      }
    });
    // Load todos
    supabase.from("todos").select("*").order("created_at", { ascending: true }).then(({ data }) => {
      if (data) {
        setTodos(data.map((t) => ({ id: t.id, text: t.text, done: t.done })));
        if (data.length > 0) todoIdRef.current = Math.max(...data.map((t) => t.id)) + 1;
      }
    });
    // Load custom sites
    supabase.from("sites").select("*").order("created_at", { ascending: true }).then(({ data }) => {
      if (data) {
        setCustomSites(data.map((s) => ({
          label: s.label, url: s.url, category: s.category as "Tool" | "外務", favicon: s.favicon || "",
        })));
      }
    });
  }, []);

  const saveNotes = useCallback((items: { Work: string[]; Personal: string[] }) => {
    if (noteTimerRef.current) clearTimeout(noteTimerRef.current);
    noteTimerRef.current = setTimeout(() => {
      supabase.from("notes").update({ items: items.Work, updated_at: new Date().toISOString() }).eq("tab", "Work").then(() => {});
      supabase.from("notes").update({ items: items.Personal, updated_at: new Date().toISOString() }).eq("tab", "Personal").then(() => {});
    }, 500);
  }, []);

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (playing) videoRef.current.pause();
    else videoRef.current.play();
    setPlaying((p) => !p);
  }, [playing]);

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.muted = !muted;
    setMuted((m) => !m);
  }, [muted]);

  return (
    <div className="relative min-h-screen flex flex-col lg:flex-row overflow-x-hidden overflow-y-auto lg:overflow-hidden">
      {/* ── CSS animations ── */}
      <style jsx global>{`
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.92); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes ripple {
          to { transform: scale(4); opacity: 0; }
        }
        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255,255,255,0.15); }
          50% { box-shadow: 0 0 20px 4px rgba(255,255,255,0.1); }
        }
        .animate-scale-in { animation: scale-in 0.25s ease-out; }
        .animate-ripple { animation: ripple 0.6s ease-out; }
        .animate-slide-down { animation: slide-down 0.2s ease-out; }
        .animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
      `}</style>

      {/* Video Background */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 w-full h-full object-cover z-0"
      >
        <source
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260315_073750_51473149-4350-4920-ae24-c8214286f323.mp4"
          type="video/mp4"
        />
      </video>

      {/* Video controls (bottom-left) */}
      <div className="fixed bottom-4 left-4 z-30 flex items-center gap-2">
        <RippleButton
          className="liquid-glass rounded-full w-9 h-9 flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-transform"
          onClick={togglePlay}
        >
          {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        </RippleButton>
        <RippleButton
          className="liquid-glass rounded-full w-9 h-9 flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-transform"
          onClick={toggleMute}
        >
          {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
        </RippleButton>
      </div>

      {/* ===== LEFT PANEL ===== */}
      <div className="relative z-10 w-full lg:w-[52%] min-h-0 lg:min-h-screen flex flex-col">
        <div className="liquid-glass absolute inset-4 lg:inset-6 rounded-3xl" />

        <div className="relative z-10 flex flex-col min-h-0 lg:min-h-screen px-8 lg:px-12 py-10 lg:py-12">
          {/* Nav */}
          <nav className="flex items-center justify-between">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="flex items-center gap-2 hover:scale-105 active:scale-95 transition-transform"
            >
              <span className="text-white font-semibold text-2xl tracking-tighter">YAjA</span>
            </button>

            <div className="flex items-center gap-2">
              {/* Category pills */}
              <div className="liquid-glass rounded-full px-1.5 py-1 flex items-center gap-0.5">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`rounded-full px-3 py-1.5 text-xs transition-all ${
                      activeCategory === cat
                        ? "bg-white/15 text-white"
                        : "text-white/50 hover:text-white/80"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

            </div>
          </nav>

          {/* Shortcuts Grid */}
          <div className="flex-1 flex flex-col justify-center gap-6 py-8">
            <h2 className="text-white/50 text-xs tracking-widest uppercase">Quick Access</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredShortcuts.map((s, i) => (
                <a
                  key={`${s.label}-${i}`}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="liquid-glass rounded-2xl p-4 flex flex-col gap-3 text-left hover:scale-[1.03] active:scale-[0.97] transition-transform group"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                      {'favicon' in s ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={(s as { favicon: string }).favicon} alt="" className="w-5 h-5 rounded-full" />
                      ) : (
                        <s.icon className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-white/30 group-hover:text-white/60 transition-colors" />
                  </div>
                  <span className="text-white text-sm font-medium">{s.label}</span>
                </a>
              ))}

              {/* Add site button */}
              <button
                onClick={() => { setAddSiteOpen(true); setTimeout(() => addSiteInputRef.current?.focus(), 50); }}
                className="liquid-glass rounded-2xl p-4 flex flex-col items-center justify-center gap-2 hover:scale-[1.03] active:scale-[0.97] transition-transform group border border-dashed border-white/10 min-h-[88px]"
              >
                <Plus className="w-5 h-5 text-white/30 group-hover:text-white/60 transition-colors" />
                <span className="text-white/30 text-xs group-hover:text-white/60 transition-colors">Add Site</span>
              </button>
            </div>

            {/* Add site modal */}
            {addSiteOpen && (
              <div className="liquid-glass rounded-2xl p-4 mt-3 flex flex-col gap-3 animate-in">
                <form
                  onSubmit={(e) => { e.preventDefault(); handleAddSite(); }}
                  className="flex items-center gap-2"
                >
                  <input
                    ref={addSiteInputRef}
                    type="text"
                    value={addSiteUrl}
                    onChange={(e) => setAddSiteUrl(e.target.value)}
                    placeholder="Paste URL..."
                    className="flex-1 bg-transparent text-white text-sm placeholder:text-white/30 outline-none"
                    onKeyDown={(e) => { if (e.key === "Escape") { setAddSiteOpen(false); setAddSiteUrl(""); } }}
                  />
                  <div className="liquid-glass rounded-full px-1 py-0.5 flex items-center gap-0.5">
                    {(["Tool", "外務"] as const).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setAddSiteCategory(cat)}
                        className={`rounded-full px-2.5 py-1 text-xs transition-all ${addSiteCategory === cat ? "bg-white/15 text-white" : "text-white/50 hover:text-white/80"}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                  <button
                    type="submit"
                    disabled={addSiteLoading}
                    className="liquid-glass w-8 h-8 rounded-full flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {addSiteLoading ? <span className="animate-spin text-xs">...</span> : <ArrowRight className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setAddSiteOpen(false); setAddSiteUrl(""); }}
                    className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/50 hover:text-white hover:scale-105 active:scale-95 transition-all"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===== RIGHT PANEL ===== */}
      <div className="flex relative z-10 w-full lg:w-[48%] min-h-[auto] lg:min-h-screen flex-col px-6 py-6" data-features>
        {/* Top bar */}
        <div className="hidden lg:flex items-center justify-between">
          <div className="liquid-glass rounded-full px-3 py-2 flex items-center gap-1">
            {[
              { Icon: Twitter, href: "https://twitter.com" },
              { Icon: Linkedin, href: "https://linkedin.com" },
              { Icon: Instagram, href: "https://instagram.com" },
            ].map(({ Icon, href }, i) => (
              <a
                key={i}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:text-white/80 hover:bg-white/20 hover:scale-105 active:scale-95 transition-all"
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}
            <a
              href="https://linktr.ee"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:text-white/80 hover:bg-white/20 hover:scale-105 active:scale-95 transition-all ml-1"
            >
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <div className="flex items-center gap-2">
            <RippleButton
              className="liquid-glass rounded-full px-4 py-2 text-white text-sm flex items-center gap-2 hover:scale-105 active:scale-95 transition-transform"
              onClick={() => setAccountOpen(true)}
            >
              <User className="w-3.5 h-3.5" />
              Account
            </RippleButton>
            <RippleButton
              className={`liquid-glass rounded-full w-10 h-10 flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all ${
                sparklesActive ? "bg-white/15 animate-pulse-glow" : ""
              }`}
              onClick={() => setSparklesActive((s) => !s)}
            >
              <Sparkles className="w-4 h-4" />
            </RippleButton>
          </div>
        </div>

        {/* Community card */}
        <div className="mt-6 mb-4">
          <button
            onClick={() => setNoteOpen(true)}
            className="liquid-glass rounded-[2.5rem] p-4 w-full lg:w-56 lg:ml-auto lg:block text-left hover:scale-[1.01] active:scale-[0.99] transition-transform group"
          >
            <div className="flex items-center justify-between mb-1 px-1">
              <h3 className="text-white text-sm font-medium flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" />
                Notes
              </h3>
              <ArrowRight className="w-3.5 h-3.5 text-white/30 group-hover:text-white/60 transition-colors" />
            </div>
            <p className="text-white/60 text-xs px-1">
              {noteItems.Work.filter(Boolean).length || noteItems.Personal.filter(Boolean).length
                ? `${noteItems.Work.filter(Boolean).length + noteItems.Personal.filter(Boolean).length} items`
                : "Tap to write..."}
            </p>
          </button>
        </div>

        {/* Bottom todo section */}
        <div className="mt-auto">
          <div className="liquid-glass rounded-[2.5rem] p-4">
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="text-white text-sm font-medium">Todo</h3>
              <span className="text-white/30 text-xs">
                {todos.filter((t) => t.done).length}/{todos.length}
              </span>
            </div>

            {/* Todo list */}
            <div className="flex flex-col gap-1.5 h-40 overflow-y-auto mb-3">
              {todos.length === 0 && (
                <p className="text-white/20 text-xs text-center py-3">No tasks yet</p>
              )}
              {todos.map((todo) => (
                <div
                  key={todo.id}
                  className="liquid-glass rounded-2xl px-4 py-2.5 flex items-center gap-3 group"
                >
                  <button
                    onClick={() => {
                      const newDone = !todo.done;
                      setTodos((prev) => prev.map((t) => t.id === todo.id ? { ...t, done: newDone } : t));
                      supabase.from("todos").update({ done: newDone }).eq("id", todo.id).then(() => {});
                    }}
                    className="flex-shrink-0 hover:scale-110 active:scale-90 transition-transform"
                  >
                    {todo.done ? (
                      <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    ) : (
                      <Circle className="w-5 h-5 text-white/30" />
                    )}
                  </button>
                  <span className={`flex-1 text-sm ${todo.done ? "text-white/30 line-through" : "text-white/80"}`}>
                    {todo.text}
                  </span>
                  <button
                    onClick={() => {
                      setTodos((prev) => prev.filter((t) => t.id !== todo.id));
                      supabase.from("todos").delete().eq("id", todo.id).then(() => {});
                    }}
                    className="w-5 h-5 rounded-full flex items-center justify-center text-white/0 group-hover:text-white/30 hover:!text-white/60 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add todo input */}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const text = todoInput.trim();
                if (!text) return;
                setTodoInput("");
                const { data } = await supabase.from("todos").insert({ text, done: false }).select().single();
                if (data) {
                  setTodos((prev) => [...prev, { id: data.id, text: data.text, done: data.done }]);
                }
              }}
              className="liquid-glass rounded-3xl px-4 py-3 flex items-center gap-3"
            >
              <input
                ref={todoInputRef}
                type="text"
                value={todoInput}
                onChange={(e) => setTodoInput(e.target.value)}
                placeholder="Add a task..."
                className="flex-1 bg-transparent text-white text-sm placeholder:text-white/30 outline-none"
              />
              <button
                type="submit"
                className="liquid-glass w-8 h-8 rounded-full flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ===== MODALS ===== */}

      {/* Notes modal */}
      <Overlay open={noteOpen} onClose={() => setNoteOpen(false)}>
        <div className="mb-4">
          <h2 className="text-white text-lg font-medium flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Notes
          </h2>
          <span className="text-white/30 text-xs mt-1 block">Auto-saved</span>
        </div>
        <div className="flex justify-center mb-4">
          <div className="liquid-glass rounded-full px-1.5 py-1 flex items-center gap-1">
            {(["Work", "Personal"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setNoteTab(tab)}
                className={`rounded-full px-4 py-1.5 text-xs transition-all ${noteTab === tab ? "bg-white/15 text-white" : "text-white/50 hover:text-white/80"}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-1.5 h-64 overflow-y-auto bg-white/5 rounded-2xl p-3">
          {noteItems[noteTab].map((item, i) => (
            <div
              key={i}
              draggable
              onDragStart={() => setDragIdx(i)}
              onDragOver={(e) => {
                e.preventDefault();
                if (dragIdx === null || dragIdx === i) return;
                setNoteItems((prev) => {
                  const list = [...prev[noteTab]];
                  const [moved] = list.splice(dragIdx, 1);
                  list.splice(i, 0, moved);
                  const next = { ...prev, [noteTab]: list };
                  saveNotes(next);
                  return next;
                });
                setDragIdx(i);
              }}
              onDragEnd={() => setDragIdx(null)}
              className={`flex items-center gap-2 group ${dragIdx === i ? "opacity-50" : ""}`}
            >
              <span className="text-white/30 text-xs w-5 text-right flex-shrink-0 cursor-grab active:cursor-grabbing select-none">
                {i + 1}.
              </span>
              <input
                type="text"
                value={item}
                onChange={(e) => {
                  const val = e.target.value;
                  setNoteItems((prev) => {
                    const list = [...prev[noteTab]];
                    list[i] = val;
                    const next = { ...prev, [noteTab]: list };
                    saveNotes(next);
                    return next;
                  });
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    setNoteItems((prev) => {
                      const list = [...prev[noteTab]];
                      list.splice(i + 1, 0, "");
                      const next = { ...prev, [noteTab]: list };
                      saveNotes(next);
                      return next;
                    });
                    setTimeout(() => {
                      const inputs = document.querySelectorAll<HTMLInputElement>("[data-note-input]");
                      inputs[i + 1]?.focus();
                    }, 50);
                  } else if (e.key === "Backspace" && item === "" && noteItems[noteTab].length > 1) {
                    e.preventDefault();
                    setNoteItems((prev) => {
                      const list = [...prev[noteTab]];
                      list.splice(i, 1);
                      const next = { ...prev, [noteTab]: list };
                      saveNotes(next);
                      return next;
                    });
                    setTimeout(() => {
                      const inputs = document.querySelectorAll<HTMLInputElement>("[data-note-input]");
                      inputs[Math.max(0, i - 1)]?.focus();
                    }, 50);
                  }
                }}
                data-note-input
                placeholder="Type here..."
                className="flex-1 bg-transparent text-white text-sm placeholder:text-white/20 outline-none py-1"
                autoFocus={i === noteItems[noteTab].length - 1 && item === ""}
              />
              {noteItems[noteTab].length > 1 && (
                <button
                  onClick={() => {
                    setNoteItems((prev) => {
                      const list = [...prev[noteTab]];
                      list.splice(i, 1);
                      const next = { ...prev, [noteTab]: list };
                      saveNotes(next);
                      return next;
                    });
                  }}
                  className="w-4 h-4 flex items-center justify-center text-white/0 group-hover:text-white/30 hover:!text-white/60 transition-colors flex-shrink-0"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      </Overlay>


      {/* Account modal */}
      <Overlay open={accountOpen} onClose={() => setAccountOpen(false)}>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-white text-lg font-medium">Welcome back</h2>
            <p className="text-white/50 text-xs">Sign in to access your designs</p>
          </div>
        </div>
        <div className="space-y-3">
          <input
            type="email"
            placeholder="Email"
            className="w-full liquid-glass rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/30 outline-none focus:ring-1 focus:ring-white/20"
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full liquid-glass rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/30 outline-none focus:ring-1 focus:ring-white/20"
          />
          <RippleButton
            className="w-full liquid-glass-strong rounded-xl px-4 py-3 text-white text-sm font-medium hover:scale-[1.02] active:scale-[0.98] transition-transform"
            onClick={() => setAccountOpen(false)}
          >
            Sign In
          </RippleButton>
        </div>
      </Overlay>

      {/* Community modal */}
      <Overlay open={communityOpen} onClose={() => setCommunityOpen(false)}>
        <h2 className="text-white text-2xl font-medium mb-2">Join the Ecosystem</h2>
        <p className="text-white/60 text-sm mb-5">
          Connect with plant designers, share your AI creations, and discover new techniques.
        </p>
        <input
          type="email"
          placeholder="Enter your email"
          className="w-full liquid-glass rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/30 outline-none focus:ring-1 focus:ring-white/20 mb-3"
        />
        <RippleButton
          className="w-full liquid-glass-strong rounded-xl px-4 py-3 text-white text-sm font-medium hover:scale-[1.02] active:scale-[0.98] transition-transform"
          onClick={() => setCommunityOpen(false)}
        >
          Join Waitlist
        </RippleButton>
      </Overlay>

      {/* Sculpting modal */}
      <Overlay open={sculptingOpen} onClose={() => setSculptingOpen(false)}>
        <h2 className="text-white text-2xl font-medium mb-2">Advanced Plant Sculpting</h2>
        <p className="text-white/60 text-sm mb-4 leading-relaxed">
          Our sculpting engine lets you manipulate botanical geometry at the vertex level.
          Bend stems, reshape petals, and evolve new species — all with AI-assisted precision.
        </p>
        <div className="flex gap-2">
          <RippleButton
            className="liquid-glass-strong rounded-full px-5 py-2.5 text-white text-sm font-medium hover:scale-105 active:scale-95 transition-transform"
            onClick={() => setSculptingOpen(false)}
          >
            Try Sculpting
          </RippleButton>
          <RippleButton
            className="liquid-glass rounded-full px-5 py-2.5 text-white/70 text-sm hover:scale-105 active:scale-95 transition-transform"
            onClick={() => setSculptingOpen(false)}
          >
            Later
          </RippleButton>
        </div>
      </Overlay>

    </div>
  );
}
