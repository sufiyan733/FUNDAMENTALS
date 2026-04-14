"use client";
import { useState, useEffect, useRef, useCallback } from "react";

// ─── THEME: MATRIX NOIR ──────────────────────────────────────
const C = {
  bg: "#07080c",
  card: "rgba(10,12,18,0.96)",
  glass: "rgba(255,255,255,0.025)",
  glass2: "rgba(255,255,255,0.05)",
  b1: "rgba(255,255,255,0.04)",
  b2: "rgba(255,255,255,0.08)",
  txt: "#d0d8e8",
  sub: "#7888a0",
  dim: "#3a4558",
  neon: "#00ff88",
  cyan: "#00d4ff",
  red: "#ff4466",
  amber: "#ffaa22",
  purple: "#8b5cf6",
  mono: "'JetBrains Mono','Fira Code',monospace",
  sans: "'Inter',-apple-system,sans-serif",
};

// ─── LOCAL REPLIES (zero API) ────────────────────────────────
const LOCAL_MAP = [
  [/^(hi|hii+|hello|hey|yo|sup|hola|hy)\b/i, "Hey! What do you need help with?"],
  [/^(good morning|good afternoon|good evening|gm|gn)\b/i, "Hello! What's the topic?"],
  [/^(thanks|thank you|thx|ty|thanku)\b/i, "Welcome! Next question?"],
  [/^(ok|okay|cool|nice|great|awesome|got it|understood|alright|k)\b/i, "Next question?"],
  [/^(bye|goodbye|see you|cya|later)\b/i, "Bye! Keep coding."],
  [/^(how are you|how r you|whats up|wassup)\b/i, "Ready. Ask anything!"],
  [/^(yes|no|yep|nope|ya|nah|yea|yeah)\b/i, "Got a coding question?"],
  [/^(who are you|what are you|your name)\b/i, "VisuoSlayer AI — your C/Python/Java tutor."],
  [/^help$/i, "I help with:\n- **C**: pointers, arrays, structs, memory\n- **Python**: lists, functions, OOP\n- **Java**: classes, inheritance\n\nJust ask!"],
  [/^(lol|haha|lmao)$/i, "Got a coding question?"],
  [/^(what can you do)$/i, "Ask about C, Python, or Java — concepts, code, errors!"],
];

function localReply(t) {
  const s = (t || "").trim();
  if (!s || s.length > 50) return null;
  for (const [r, a] of LOCAL_MAP) if (r.test(s)) return a;
  return null;
}

// ─── SVG ICONS ───────────────────────────────────────────────
const Ix = ({ s = 16 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>;
const Icp = ({ s = 11 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>;
const Ick = ({ s = 11 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>;
const Imc = ({ s = 14 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>;
const Ist = ({ s = 12 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>;
const Isd = ({ s = 14 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" style={{ transform: "rotate(180deg)", transformOrigin: "center" }} /></svg>;
const Itr = ({ s = 13 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg>;

const CHIPS = [
  "Pointers in C",
  "Array vs Linked List",
  "Recursion example",
  "malloc vs calloc",
  "Python list ops",
  "Java OOP basics",
  "Struct in C",
  "Switch vs if-else",
];

// ─── CODE BLOCK ──────────────────────────────────────────────
function CodeBlock({ code, lang }) {
  const [cp, setCp] = useState(false);
  return (
    <div style={{
      margin: "10px 0", borderRadius: 8, overflow: "hidden",
      border: `1px solid ${C.b2}`, background: "rgba(0,0,0,0.5)"
    }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "5px 10px", background: "rgba(0,0,0,0.4)", borderBottom: `1px solid ${C.b1}`
      }}>
        <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
          {["#ff5f57", "#febc2e", "#28c840"].map(c =>
            <div key={c} style={{ width: 6, height: 6, borderRadius: "50%", background: c, opacity: 0.5 }} />
          )}
          {lang && <span style={{
            fontFamily: C.mono, fontSize: 9, color: C.neon, marginLeft: 6,
            background: "rgba(0,255,136,0.08)", padding: "1px 6px", borderRadius: 3,
            border: "1px solid rgba(0,255,136,0.15)", letterSpacing: ".04em",
            textTransform: "uppercase"
          }}>{lang}</span>}
        </div>
        <button onClick={() => {
          navigator.clipboard?.writeText(code); setCp(true);
          setTimeout(() => setCp(false), 1400);
        }}
          style={{
            display: "flex", alignItems: "center", gap: 3, background: "none", border: "none",
            color: cp ? C.neon : C.dim, cursor: "pointer", fontFamily: C.mono, fontSize: 8, outline: "none",
            transition: "color .15s"
          }}>
          {cp ? <><Ick s={8} /> copied</> : <><Icp s={8} /> copy</>}
        </button>
      </div>
      <pre style={{
        padding: "10px 12px", margin: 0, fontFamily: C.mono, fontSize: 11.5,
        color: "#c0d0e0", lineHeight: 1.65, overflowX: "auto", whiteSpace: "pre"
      }}>{code}</pre>
    </div>
  );
}

// ─── RICH TEXT ────────────────────────────────────────────────
function Rich({ content }) {
  const parts = content.replace(/^#{1,6}\s+/gm, "").split(/(```(?:\w+)?\n?[\s\S]*?```)/g);
  return (
    <div style={{ lineHeight: 1.72, wordBreak: "break-word" }}>
      {parts.map((p, i) => {
        if (p.startsWith("```")) {
          const m = p.match(/^```(\w+)/);
          return <CodeBlock key={i} code={p.replace(/^```\w*\n?/, "").replace(/```$/, "").trimEnd()} lang={m ? m[1] : null} />;
        }
        return <span key={i}>{p.split("\n").map((line, li, arr) => {
          const bl = line.match(/^(\s*[-•*]\s+)(.*)/);
          const nm = line.match(/^(\s*\d+\.\s+)(.*)/);
          const raw = bl ? bl[2] : nm ? nm[2] : line;
          const toks = raw.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).map((tk, ti) => {
            if (!tk) return null;
            if (tk.startsWith("`") && tk.endsWith("`"))
              return <code key={ti} style={{
                background: "rgba(0,255,136,0.08)", border: "1px solid rgba(0,255,136,0.15)",
                borderRadius: 3, padding: "1px 4px", fontFamily: C.mono, fontSize: 10.5, color: C.neon
              }}>{tk.slice(1, -1)}</code>;
            if (tk.startsWith("**") && tk.endsWith("**"))
              return <strong key={ti} style={{ color: C.txt, fontWeight: 600 }}>{tk.slice(2, -2)}</strong>;
            return tk;
          });
          if (bl) return <div key={li} style={{ display: "flex", gap: 7, margin: "2px 0", paddingLeft: 2 }}>
            <span style={{ color: C.neon, fontSize: 9 }}>▹</span><span>{toks}</span></div>;
          if (nm) return <div key={li} style={{ display: "flex", gap: 7, margin: "2px 0", paddingLeft: 2 }}>
            <span style={{ color: C.cyan, fontFamily: C.mono, fontSize: 10 }}>{nm[1].trim()}</span><span>{toks}</span></div>;
          return <span key={li}>{toks}{li < arr.length - 1 ? <br /> : null}</span>;
        })}</span>;
      })}
    </div>
  );
}

// ─── STREAM ──────────────────────────────────────────────────
function Stream({ text, onDone, sk }) {
  const [d, setD] = useState("");
  const r = useRef(0);
  useEffect(() => {
    r.current = 0; setD("");
    let af;
    const tick = () => {
      r.current = Math.min(r.current + 4, text.length);
      setD(text.slice(0, r.current));
      if (r.current >= text.length) { onDone?.(); return; }
      af = requestAnimationFrame(tick);
    };
    af = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(af);
  }, [text, sk]);
  return <Rich content={d} />;
}

// ─── VOICE INPUT ─────────────────────────────────────────────
function useVoice(onText) {
  const [on, setOn] = useState(false);
  const ref = useRef(null);
  const toggle = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    if (on) { ref.current?.stop(); setOn(false); return; }
    const r = new SR(); ref.current = r;
    r.continuous = false; r.interimResults = false; r.lang = "en-US";
    r.onstart = () => setOn(true); r.onend = () => setOn(false); r.onerror = () => setOn(false);
    r.onresult = e => {
      const t = Array.from(e.results).map(r => r[0].transcript).join(" ").trim();
      if (t) onText(t);
    };
    r.start();
  }, [on, onText]);
  return { on, toggle };
}

// ─── TTS ─────────────────────────────────────────────────────
function useTTS() {
  const [si, setSi] = useState(null);
  const speak = useCallback((text, idx) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel(); setSi(idx);
    const c = text.replace(/```[\s\S]*?```/g, " code block ").replace(/\*\*/g, "").replace(/`/g, "").replace(/\n+/g, ". ").trim();
    if (!c) { setSi(null); return; }
    const u = new SpeechSynthesisUtterance(c); u.lang = "en-US"; u.rate = 1.1;
    u.onend = () => setSi(null); u.onerror = () => setSi(null);
    window.speechSynthesis.speak(u);
  }, []);
  const stopS = useCallback(() => { window.speechSynthesis?.cancel(); setSi(null); }, []);
  return { si, speak, stopS };
}

// ─── MAIN ────────────────────────────────────────────────────
export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([]);
  const [sIdx, setSIdx] = useState(null);
  const [inp, setInp] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [hov, setHov] = useState(false);
  const [mob, setMob] = useState(false);
  const [anim, setAnim] = useState("in");
  const [foc, setFoc] = useState(false);

  const abortRef = useRef(null);
  const endRef = useRef(null);
  const inpRef = useRef(null);
  const taRef = useRef(null);

  const { si, speak, stopS } = useTTS();
  const { on: mic, toggle: toggleMic } = useVoice(t => setInp(p => (p ? p + " " : "") + t));

  useEffect(() => {
    setMounted(true);
    const h = () => setMob(window.innerWidth <= 640);
    h(); window.addEventListener("resize", h);
    const cbOpen = () => { setOpen(true); setAnim("in"); };
    window.addEventListener("open-chatbot", cbOpen);
    return () => {
      window.removeEventListener("resize", h);
      window.removeEventListener("open-chatbot", cbOpen);
    };
  }, []);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, loading]);
  useEffect(() => { if (open) setTimeout(() => inpRef.current?.focus(), 300); }, [open]);
  useEffect(() => {
    if (open) {
      const p = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
      return () => { document.body.style.overflow = p; document.body.style.position = ""; document.body.style.width = ""; };
    }
  }, [open]);
  useEffect(() => {
    const h = e => { if (e.key === "Escape" && open) doClose(); };
    window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h);
  }, [open]);
  useEffect(() => {
    if (taRef.current) {
      taRef.current.style.height = "24px";
      taRef.current.style.height = Math.min(taRef.current.scrollHeight, 100) + "px";
    }
  }, [inp]);

  const doClose = () => { setAnim("out"); setTimeout(() => { setOpen(false); setAnim("in"); }, 200); };
  const doOpen = () => { setOpen(true); setAnim("in"); };
  const ts = () => new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  const send = useCallback(async (text) => {
    const t = (text ?? inp).trim();
    if (!t || loading) return;
    if (t.length > 1500) {
      setMsgs(p => [...p, { r: "ai", c: "Too long. Keep under 1500 chars.", t: ts(), sk: Date.now() }]);
      return;
    }
    stopS(); setInp(""); setLoading(true); setSIdx(null);
    const sk = Date.now();
    setMsgs(p => [...p, { r: "user", c: t, t: ts() }]);

    const loc = localReply(t);
    if (loc) {
      setMsgs(p => [...p, { r: "ai", c: loc, t: ts(), sk }]);
      setSIdx(msgs.length + 1); setLoading(false); return;
    }

    const ctrl = new AbortController(); abortRef.current = ctrl;
    try {
      const res = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: t }), signal: ctrl.signal,
      });
      if (!res.ok) throw new Error(res.status);
      const data = await res.json();
      let reply = (data.content || data.error || "Error. Try again.")
        .replace(/^(Great question!|Sure!|Absolutely!|Of course!|Here(?:'s| is)|Let(?:'s dive|me explain)|No problem|Got it!|Okay!)[^\n]*/i, "").trim();
      if (!reply) reply = "Could not generate response.";
      if (!ctrl.signal.aborted) {
        setMsgs(p => { const n = [...p, { r: "ai", c: reply, t: ts(), sk }]; setSIdx(n.length - 1); return n; });
      }
    } catch (e) {
      if (e.name !== "AbortError") setMsgs(p => [...p, { r: "ai", c: "Connection error. Try again.", t: ts(), sk }]);
    } finally {
      if (!ctrl.signal.aborted) setLoading(false); abortRef.current = null;
    }
  }, [inp, msgs, loading, stopS]);

  if (!mounted) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');
        @keyframes cb-in{from{opacity:0;transform:scale(.97)}to{opacity:1;transform:none}}
        @keyframes cb-out{to{opacity:0;transform:scale(.98)}}
        @keyframes cb-msg{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
        @keyframes cb-dot{0%,70%,100%{transform:scale(.6);opacity:.25}35%{transform:scale(1.15);opacity:1}}
        @keyframes cb-pulse{0%,100%{box-shadow:0 0 0 0 rgba(0,255,136,0),0 4px 16px rgba(0,0,0,.4)}50%{box-shadow:0 0 0 8px rgba(0,255,136,.06),0 4px 20px rgba(0,255,136,.15)}}
        @keyframes cb-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
        @keyframes cb-glow{0%,100%{opacity:.3}50%{opacity:.7}}
        @keyframes cb-bar{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes cb-mic{0%,100%{box-shadow:0 0 0 0 rgba(255,68,102,.4)}50%{box-shadow:0 0 0 5px rgba(255,68,102,0)}}
        @keyframes cb-border{0%,100%{border-color:rgba(0,255,136,.15)}50%{border-color:rgba(0,212,255,.2)}}
        .cb-scroll{scrollbar-width:none;overscroll-behavior:contain}
        .cb-scroll::-webkit-scrollbar{display:none}
        .cb-msg{animation:cb-msg .2s ease-out both}
        .cb-ta::placeholder{color:#3a4558 !important;font-size:12px !important}
        .cb-ta::selection{background:rgba(0,255,136,.2)}
      `}</style>

      {/* FAB removed — chatbot opened via 'open-chatbot' custom event from sidebar */}

      {/* ── FULLSCREEN PANEL ── */}
      {open && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 9999,
          background: C.bg, display: "flex", flexDirection: "column",
          animation: anim === "in" ? "cb-in .25s ease-out" : "cb-out .18s ease-in forwards",
        }}>

          {/* ── AMBIENT BG ── */}
          <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
            <div style={{
              position: "absolute", top: "-15%", right: "10%", width: "35%", height: "40%",
              background: "radial-gradient(ellipse,rgba(0,255,136,.04),transparent 70%)",
              filter: "blur(60px)"
            }} />
            <div style={{
              position: "absolute", bottom: "-10%", left: "5%", width: "30%", height: "35%",
              background: "radial-gradient(ellipse,rgba(0,212,255,.03),transparent 70%)",
              filter: "blur(50px)"
            }} />
            {/* Scanlines */}
            <div style={{
              position: "absolute", inset: 0, opacity: 0.015,
              background: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(255,255,255,.1) 2px,rgba(255,255,255,.1) 4px)"
            }} />
          </div>

          {/* ── HEADER ── */}
          <div style={{
            padding: mob ? "10px 14px" : "12px 20px",
            display: "flex", alignItems: "center", gap: 10, flexShrink: 0,
            position: "relative", zIndex: 2,
            borderBottom: `1px solid ${C.b1}`,
            background: "rgba(7,8,12,.85)", backdropFilter: "blur(16px)"
          }}>
            {/* Gradient line */}
            <div style={{
              position: "absolute", bottom: -1, left: 0, right: 0, height: 1,
              background: `linear-gradient(90deg,transparent,${C.neon}30,${C.cyan}20,transparent)`,
            }} />

            {/* Logo */}
            <div style={{
              width: 34, height: 34, borderRadius: 10, flexShrink: 0,
              background: `linear-gradient(135deg,rgba(0,255,136,.1),rgba(0,212,255,.06))`,
              display: "flex", alignItems: "center", justifyContent: "center",
              border: `1px solid rgba(0,255,136,.12)`, fontSize: 15,
              boxShadow: `0 0 16px rgba(0,255,136,.08)`,
            }}>⚡</div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontFamily: C.mono, fontWeight: 700, fontSize: mob ? 11 : 13,
                color: C.txt, letterSpacing: ".1em",
                display: "flex", alignItems: "center", gap: 6,
              }}>
                VISUOSLAYER
                <span style={{
                  fontSize: 8, fontWeight: 500, color: C.neon,
                  background: "rgba(0,255,136,.08)", padding: "2px 6px",
                  borderRadius: 4, border: "1px solid rgba(0,255,136,.12)",
                  letterSpacing: ".06em",
                }}>AI</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                <span style={{
                  width: 4, height: 4, borderRadius: "50%", background: C.neon,
                  boxShadow: `0 0 6px ${C.neon}`, animation: "cb-glow 2s infinite"
                }} />
                <span style={{ fontFamily: C.mono, fontSize: 8, color: C.neon, letterSpacing: ".12em" }}>
                  ONLINE
                </span>
                {msgs.length > 0 && <>
                  <span style={{ color: C.dim, fontSize: 6 }}>·</span>
                  <span style={{ fontFamily: C.mono, fontSize: 8, color: C.dim }}>{msgs.length} msgs</span>
                </>}
              </div>
            </div>

            {/* Header actions */}
            <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
              {msgs.length > 0 && (
                <button onClick={() => { setMsgs([]); stopS(); setSIdx(null); abortRef.current?.abort(); setLoading(false); }}
                  style={{
                    width: 32, height: 32, borderRadius: 8, background: "none",
                    border: "1px solid transparent", color: C.dim, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", outline: "none",
                    transition: "all .15s"
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = C.red; e.currentTarget.style.borderColor = "rgba(255,68,102,.15)"; }}
                  onMouseLeave={e => { e.currentTarget.style.color = C.dim; e.currentTarget.style.borderColor = "transparent"; }}
                  title="Clear">
                  <Itr />
                </button>
              )}
              <button onClick={doClose}
                style={{
                  width: 32, height: 32, borderRadius: 8, background: "none",
                  border: "1px solid transparent", color: C.dim, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", outline: "none",
                  transition: "all .15s"
                }}
                onMouseEnter={e => { e.currentTarget.style.color = C.txt; e.currentTarget.style.background = C.glass2; }}
                onMouseLeave={e => { e.currentTarget.style.color = C.dim; e.currentTarget.style.background = "none"; }}
                title="Close (Esc)">
                <Ix s={15} />
              </button>
            </div>
          </div>

          {/* ── MESSAGES ── */}
          <div className="cb-scroll" style={{
            flex: 1, overflowY: "auto",
            padding: mob ? "16px 12px 8px" : "20px 24px 8px",
            display: "flex", flexDirection: "column",
            position: "relative", zIndex: 1,
          }}>
            <div style={{
              display: "flex", flexDirection: "column", gap: 14,
              maxWidth: 700, margin: "0 auto", width: "100%"
            }}>
              {msgs.length === 0 ? (
                /* ── EMPTY ── */
                <div style={{
                  flex: 1, display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center",
                  padding: "60px 16px", minHeight: "100%"
                }}>
                  {/* Animated logo */}
                  <div style={{
                    width: 56, height: 56, borderRadius: 16,
                    background: "linear-gradient(135deg,rgba(0,255,136,.08),rgba(0,212,255,.05))",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    border: "1px solid rgba(0,255,136,.1)", fontSize: 24, marginBottom: 20,
                    animation: "cb-float 4s ease-in-out infinite",
                    boxShadow: "0 0 30px rgba(0,255,136,.06)",
                  }}>⚡</div>

                  <div style={{
                    fontFamily: C.mono, fontSize: 9, fontWeight: 700,
                    color: C.neon, letterSpacing: ".2em", marginBottom: 8,
                    textShadow: `0 0 12px rgba(0,255,136,.3)`,
                  }}>VISUOSLAYER AI</div>

                  <div style={{
                    fontFamily: C.sans, fontSize: mob ? 18 : 22, fontWeight: 600,
                    color: C.txt, textAlign: "center", marginBottom: 6,
                    letterSpacing: "-0.01em", lineHeight: 1.2,
                  }}>What do you want to learn?</div>

                  <div style={{
                    fontFamily: C.sans, fontSize: 11, color: C.dim,
                    textAlign: "center", marginBottom: 28, lineHeight: 1.6,
                  }}>
                    C · Python · Java — no history, each question standalone
                  </div>

                  {/* Suggestion chips */}
                  <div style={{
                    display: "flex", flexWrap: "wrap", gap: 6,
                    justifyContent: "center", maxWidth: 420
                  }}>
                    {CHIPS.map(s => (
                      <button key={s} onClick={() => send(s)}
                        style={{
                          padding: "7px 14px", borderRadius: 8,
                          background: C.glass, border: `1px solid ${C.b1}`,
                          fontFamily: C.mono, fontSize: 10, color: C.sub,
                          cursor: "pointer", transition: "all .15s", outline: "none",
                          letterSpacing: ".02em",
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = "rgba(0,255,136,.06)";
                          e.currentTarget.style.borderColor = "rgba(0,255,136,.2)";
                          e.currentTarget.style.color = C.neon;
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = C.glass;
                          e.currentTarget.style.borderColor = C.b1;
                          e.currentTarget.style.color = C.sub;
                        }}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {msgs.map((m, i) => {
                    const isUser = m.r === "user";
                    const isStr = sIdx === i;
                    return (
                      <div key={i} className="cb-msg" style={{
                        display: "flex", flexDirection: "column",
                        alignItems: isUser ? "flex-end" : "flex-start",
                      }}>
                        {/* AI label */}
                        {!isUser && (
                          <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
                            <div style={{
                              width: 18, height: 18, borderRadius: 5, fontSize: 8,
                              background: "linear-gradient(135deg,rgba(0,255,136,.12),rgba(0,212,255,.08))",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              border: "1px solid rgba(0,255,136,.1)",
                            }}>⚡</div>
                            <span style={{
                              fontFamily: C.mono, fontSize: 8, fontWeight: 700,
                              color: C.neon, letterSpacing: ".1em", opacity: .7,
                            }}>AI</span>
                          </div>
                        )}
                        <div style={{
                          maxWidth: isUser ? (mob ? "85%" : "70%") : "100%",
                          width: isUser ? "auto" : "100%",
                          padding: isUser ? "8px 14px" : "12px 14px",
                          borderRadius: isUser ? "12px 4px 12px 12px" : "4px 12px 12px 12px",
                          background: isUser
                            ? "linear-gradient(135deg,rgba(0,255,136,.1),rgba(0,212,255,.06))"
                            : C.glass,
                          border: `1px solid ${isUser ? "rgba(0,255,136,.12)" : C.b1}`,
                        }}>
                          <div style={{
                            fontFamily: C.sans, fontSize: 13, lineHeight: 1.7,
                            color: isUser ? C.txt : C.sub, wordBreak: "break-word"
                          }}>
                            {isUser ? m.c
                              : isStr ? <Stream text={m.c} onDone={() => setSIdx(null)} sk={m.sk} />
                                : <Rich content={m.c} />}
                          </div>
                          {/* Footer */}
                          <div style={{
                            marginTop: 4, display: "flex", alignItems: "center",
                            justifyContent: "space-between"
                          }}>
                            <span style={{ fontFamily: C.mono, fontSize: 7, color: C.dim }}>{m.t}</span>
                            {!isUser && (
                              <button onClick={() => si === i ? stopS() : speak(m.c, i)}
                                style={{
                                  background: "none", border: "none",
                                  color: si === i ? C.neon : C.dim, cursor: "pointer",
                                  fontSize: 7, fontFamily: C.mono, display: "flex",
                                  alignItems: "center", gap: 2, outline: "none",
                                  transition: "color .15s",
                                }}
                                onMouseEnter={e => { if (si !== i) e.currentTarget.style.color = C.sub; }}
                                onMouseLeave={e => { if (si !== i) e.currentTarget.style.color = C.dim; }}>
                                {si === i ? "■ stop" : "▶ speak"}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {/* Loading */}
                  {loading && (
                    <div className="cb-msg" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{
                        width: 18, height: 18, borderRadius: 5, fontSize: 8,
                        background: "linear-gradient(135deg,rgba(0,255,136,.12),rgba(0,212,255,.08))",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        border: "1px solid rgba(0,255,136,.1)",
                      }}>⚡</div>
                      <div style={{
                        display: "flex", gap: 4, padding: "8px 12px",
                        borderRadius: "4px 10px 10px 10px", background: C.glass,
                        border: `1px solid ${C.b1}`,
                      }}>
                        {[0, 1, 2].map(i =>
                          <span key={i} style={{
                            width: 4, height: 4, borderRadius: "50%",
                            background: C.neon, animation: `cb-dot 1.2s ${i * .15}s infinite`,
                            boxShadow: `0 0 4px ${C.neon}`,
                          }} />
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
              <div ref={endRef} />
            </div>
          </div>

          {/* ── INPUT ── */}
          <div style={{
            padding: mob ? "10px 12px 14px" : "12px 24px 16px",
            borderTop: `1px solid ${C.b1}`, flexShrink: 0,
            position: "relative", zIndex: 2,
            background: "rgba(7,8,12,.9)", backdropFilter: "blur(16px)",
          }}>
            {/* Progress bar */}
            {loading && <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: 2,
              background: `linear-gradient(90deg,${C.neon},${C.cyan},${C.purple},${C.neon})`,
              backgroundSize: "300% 100%", animation: "cb-bar 1.5s linear infinite",
            }} />}

            <div style={{ maxWidth: 700, margin: "0 auto" }}>
              <div style={{
                display: "flex", alignItems: "flex-end", gap: 6,
                background: foc ? "rgba(0,255,136,.02)" : C.glass,
                border: `1px solid ${foc ? "rgba(0,255,136,.15)" : C.b2}`,
                borderRadius: 14, padding: "8px 8px 8px 14px",
                transition: "all .2s",
                animation: foc ? "cb-border 3s ease-in-out infinite" : "none",
                boxShadow: foc ? "0 0 0 2px rgba(0,255,136,.04),0 4px 16px rgba(0,255,136,.04)" : "none",
              }}>
                <textarea className="cb-ta"
                  ref={el => { inpRef.current = el; taRef.current = el; }}
                  value={inp} onChange={e => setInp(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                  onFocus={() => setFoc(true)} onBlur={() => setFoc(false)}
                  placeholder="Ask about C, Python, Java..."
                  rows={1}
                  style={{
                    flex: 1, background: "none", border: "none", outline: "none",
                    fontFamily: C.sans, fontSize: 13, color: C.txt, resize: "none",
                    lineHeight: 1.5, maxHeight: 100, overflow: "auto", minHeight: 24,
                    caretColor: C.neon, padding: 0,
                  }} />

                {/* Mic */}
                <button onClick={toggleMic}
                  style={{
                    width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                    background: mic ? "rgba(255,68,102,.08)" : "none",
                    border: `1px solid ${mic ? "rgba(255,68,102,.25)" : "transparent"}`,
                    color: mic ? C.red : C.dim, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    outline: "none", animation: mic ? "cb-mic 1.2s infinite" : "none",
                    transition: "all .15s",
                  }}
                  onMouseEnter={e => { if (!mic) e.currentTarget.style.color = C.sub; }}
                  onMouseLeave={e => { if (!mic) e.currentTarget.style.color = C.dim; }}>
                  {mic ? <Ist s={10} /> : <Imc s={12} />}
                </button>

                {/* Send/Stop */}
                <button onClick={() => {
                  if (loading) { abortRef.current?.abort(); setLoading(false); }
                  else send();
                }}
                  style={{
                    width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                    background: loading ? "rgba(255,68,102,.1)"
                      : inp.trim() ? `linear-gradient(135deg,${C.neon},${C.cyan})` : "none",
                    border: `1px solid ${loading ? "rgba(255,68,102,.2)"
                      : inp.trim() ? "rgba(0,255,136,.2)" : "transparent"}`,
                    color: loading ? C.red : inp.trim() ? C.bg : C.dim,
                    cursor: (loading || inp.trim()) ? "pointer" : "default",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    outline: "none", transition: "all .18s", fontWeight: 700,
                    boxShadow: inp.trim() && !loading ? `0 4px 14px rgba(0,255,136,.15)` : "none",
                  }}
                  onMouseEnter={e => { if (inp.trim() && !loading) e.currentTarget.style.transform = "scale(1.06)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "none"; }}>
                  {loading ? <Ist s={10} /> : <Isd s={14} />}
                </button>
              </div>

              {/* Hints */}
              {!mob && (
                <div style={{ textAlign: "center", marginTop: 5 }}>
                  <span style={{ fontFamily: C.mono, fontSize: 7, color: C.dim, opacity: .25 }}>
                    ↵ send · shift+↵ newline · esc close · each question is standalone
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
