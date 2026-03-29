"use client";

import {
  useState, useEffect, useRef, useCallback, useMemo,
} from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN TOKENS
// ─────────────────────────────────────────────────────────────────────────────
const T = {
  bg:      "#060A10",
  bg1:     "#080D16",
  bg2:     "#0C1520",
  glass:   "rgba(8,14,26,0.88)",
  border:  "rgba(255,100,0,0.10)",
  neon:    "#FF6400",
  neon2:   "#00D4FF",
  neon3:   "#FF2D6B",
  neon4:   "#B4FF00",
  accent:  "#A855F7",
  text:    "#E0E8F4",
  muted:   "#3A506B",
  dim:     "#101A28",
  mono:    "'Fira Code', monospace",
  display: "'Bebas Neue', sans-serif",
};

const NAV_ITEMS = [
  { id: "hero",       label: "INTRO",         num: "00", icon: "◈" },
  { id: "pointers",   label: "POINTERS",      num: "01", icon: "→" },
  { id: "addr-deref", label: "ADDR & DEREF",  num: "02", icon: "⊕" },
  { id: "ptr-arrays", label: "PTR + ARRAYS",  num: "03", icon: "⧖" },
  { id: "structs",    label: "STRUCTS",        num: "04", icon: "⬡" },
  { id: "unions",     label: "UNIONS",         num: "05", icon: "◎" },
  { id: "preproc",    label: "PREPROCESSOR",  num: "06", icon: "#" },
  { id: "dynmem",     label: "DYN MEMORY",    num: "07", icon: "∞" },
  { id: "engine",     label: "MASTER ENGINE", num: "08", icon: "🚀" },
];

// ─────────────────────────────────────────────────────────────────────────────
// SHARED COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
function GlassCard({ children, style = {}, hover = true, glowColor = T.neon, onClick }) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={hover ? {
        scale: 1.002,
        borderColor: `${glowColor}45`,
        boxShadow: `0 8px 60px rgba(0,0,0,0.75), 0 0 35px ${glowColor}12`,
      } : {}}
      transition={{ type: "spring", stiffness: 280, damping: 28 }}
      style={{
        background: T.glass,
        border: `1px solid ${T.border}`,
        borderRadius: 16,
        backdropFilter: "blur(28px)",
        WebkitBackdropFilter: "blur(28px)",
        boxShadow: "0 4px 50px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.035)",
        ...style,
      }}
    >{children}</motion.div>
  );
}

function Section({ id, children, style = {} }) {
  return (
    <section id={id} style={{ padding: "80px 0", borderBottom: `1px solid ${T.dim}`, ...style }}>
      {children}
    </section>
  );
}

function SectionHeader({ num, tag, title, subtitle }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      style={{ display: "flex", alignItems: "flex-end", gap: 22, marginBottom: 44 }}
    >
      <motion.span
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        style={{ fontFamily: T.mono, fontSize: 60, fontWeight: 700, color: T.dim, lineHeight: 1, letterSpacing: -2, userSelect: "none" }}
      >{num}</motion.span>
      <div>
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: "100%" }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 5, color: T.neon, fontWeight: 600, marginBottom: 6, overflow: "hidden", whiteSpace: "nowrap" }}
        >{tag}</motion.div>
        <h2 style={{ fontFamily: T.display, fontSize: 38, fontWeight: 400, color: T.text, letterSpacing: 3, lineHeight: 1 }}>{title}</h2>
        {subtitle && <p style={{ fontFamily: T.mono, fontSize: 11, color: T.muted, marginTop: 7, lineHeight: 1.6 }}>{subtitle}</p>}
      </div>
    </motion.div>
  );
}

function CodeBlock({ code, highlightLine = -1, style = {} }) {
  const [copied, setCopied] = useState(false);
  const lines = (code || "").split("\n");

  const copy = () => {
    navigator.clipboard?.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  // Basic syntax highlighting
  const highlight = (line) => {
    const rules = [
      // Comments
      { re: /(\/\/.*$)/, color: "#4A6580" },
      // Keywords
      { re: /\b(int|float|char|double|void|struct|union|typedef|return|if|else|for|while|NULL|sizeof|static|const|unsigned|long|short|include|define|ifdef|ifndef|endif|pragma|malloc|calloc|realloc|free|printf|else)\b/g, color: "#FF6400" },
      // Strings
      { re: /(".*?"|'.')/g, color: "#B4FF00" },
      // Numbers
      { re: /\b(\d+\.?\d*[fF]?|0x[0-9A-Fa-f]+)\b/g, color: "#00D4FF" },
      // Preprocessor
      { re: /^(\s*#\w+)/g, color: "#A855F7" },
      // Types + pointers
      { re: /(\*+)/g, color: "#FF2D6B" },
      // Functions
      { re: /\b([a-zA-Z_]\w*)\s*(?=\()/g, color: "#FFD700" },
    ];
    return line; // return raw for now; coloring is done via spans below
  };

  const tokenize = (line) => {
    // Simple tokenizer for colorful output
    const segments = [];
    let remaining = line;

    // comment
    const commentIdx = remaining.indexOf("//");
    let commentPart = "";
    if (commentIdx !== -1) {
      commentPart = remaining.slice(commentIdx);
      remaining = remaining.slice(0, commentIdx);
    }

    // Regex-based coloring on the non-comment part
    const colored = remaining
      .replace(/(&amp;|&lt;|&gt;)/g, m => m)
      .split(/(\b(?:int|float|char|double|void|struct|union|typedef|return|if|else|for|while|NULL|sizeof|static|const|unsigned|long|short|include|define|ifdef|ifndef|endif|pragma|malloc|calloc|realloc|free|printf|else)\b|"[^"]*"|'[^']*'|\b0x[0-9A-Fa-f]+\b|\b\d+\.?\d*[fF]?\b|\*+|#\w+|\b[a-zA-Z_]\w*(?=\s*\())/g);

    return { colored, commentPart };
  };

  const renderLine = (line) => {
    // Detect comment
    const commentMatch = line.match(/^(.*?)(\/\/.*)$/);
    let main = line;
    let comment = "";
    if (commentMatch) { main = commentMatch[1]; comment = commentMatch[2]; }

    const parts = main.split(/(\b(?:int|float|char|double|void|struct|union|typedef|return|if|else|for|while|NULL|sizeof|static|const|unsigned|long|short|malloc|calloc|realloc|free|printf)\b|"[^"]*"|'[^']*'|\b0x[0-9A-Fa-f]+\b|\b\d+\.?\d*[fF]?\b|#\w+|\*+(?!\s))/g);

    return (
      <>
        {parts.map((p, i) => {
          if (/^(int|float|char|double|void|struct|union|typedef|return|if|else|for|while|NULL|sizeof|static|const|unsigned|long|short|malloc|calloc|realloc|free|printf)$/.test(p))
            return <span key={i} style={{ color: "#FF8C42" }}>{p}</span>;
          if (/^"[^"]*"$/.test(p) || /^'[^']*'$/.test(p))
            return <span key={i} style={{ color: "#B4FF00" }}>{p}</span>;
          if (/^(0x[0-9A-Fa-f]+|\d+\.?\d*[fF]?)$/.test(p))
            return <span key={i} style={{ color: "#00D4FF" }}>{p}</span>;
          if (/^#\w+/.test(p))
            return <span key={i} style={{ color: "#A855F7" }}>{p}</span>;
          if (/^\*+$/.test(p))
            return <span key={i} style={{ color: "#FF2D6B" }}>{p}</span>;
          return <span key={i}>{p}</span>;
        })}
        {comment && <span style={{ color: "#3A5570", fontStyle: "italic" }}>{comment}</span>}
      </>
    );
  };

  return (
    <div style={{
      background: "rgba(0,0,0,0.6)", borderRadius: 14,
      border: `1px solid ${T.dim}`, overflow: "hidden", ...style,
    }}>
      <div style={{
        padding: "9px 16px", borderBottom: `1px solid ${T.dim}`,
        display: "flex", gap: 6, alignItems: "center",
        background: "rgba(0,0,0,0.3)",
      }}>
        {["#FF5F57", "#FEBC2E", "#28C840"].map((c, i) => (
          <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: c, opacity: 0.85 }} />
        ))}
        <span style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, marginLeft: 8, letterSpacing: 2 }}>main.c</span>
        <motion.button
          whileHover={{ opacity: 1 }}
          whileTap={{ scale: 0.92 }}
          onClick={copy}
          style={{
            marginLeft: "auto", fontFamily: T.mono, fontSize: 8, color: copied ? T.neon4 : T.muted,
            background: "transparent", border: `1px solid ${copied ? T.neon4 : T.muted}40`,
            borderRadius: 4, padding: "3px 10px", cursor: "pointer", letterSpacing: 1,
            opacity: 0.7,
          }}
        >{copied ? "COPIED!" : "COPY"}</motion.button>
      </div>
      <div style={{ padding: "14px 0", overflowX: "auto" }}>
        {lines.map((line, i) => (
          <motion.div
            key={i}
            animate={{
              background: highlightLine === i ? `${T.neon}18` : "transparent",
            }}
            style={{
              display: "flex", alignItems: "center",
              fontFamily: T.mono, fontSize: 12.5, lineHeight: 2,
              paddingLeft: highlightLine === i ? 20 : 16, paddingRight: 18,
              borderLeft: `3px solid ${highlightLine === i ? T.neon : "transparent"}`,
              transition: "all 0.25s",
              whiteSpace: "pre",
            }}
          >
            <span style={{ color: "#1E2E3E", marginRight: 18, fontSize: 10, userSelect: "none", minWidth: 20, textAlign: "right" }}>
              {i + 1}
            </span>
            <span style={{ color: highlightLine === i ? T.neon : T.text }}>
              {renderLine(line)}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function Pill({ children, color = T.neon, active = false, onClick }) {
  return (
    <motion.button
      whileHover={{ scale: 1.06, y: -2 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      style={{
        fontFamily: T.mono, fontSize: 10, fontWeight: 600, letterSpacing: 2,
        color: active ? "#000" : color,
        background: active ? color : `${color}12`,
        border: `1px solid ${active ? color : `${color}40`}`,
        borderRadius: 7, padding: "8px 18px", cursor: "pointer",
        transition: "all 0.18s",
        boxShadow: active ? `0 0 22px ${color}50` : "none",
      }}
    >{children}</motion.button>
  );
}

function InsightBlock({ title, color, icon, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      style={{
        padding: "18px 20px", borderRadius: 13,
        background: `${color}08`, border: `1px solid ${color}28`,
      }}
    >
      <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 4, color, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
        <span>{icon}</span> {title}
      </div>
      <div style={{ fontFamily: T.mono, fontSize: 11.5, color: T.text, lineHeight: 2 }}>{children}</div>
    </motion.div>
  );
}

function AddrTag({ addr, color = T.neon2 }) {
  return (
    <motion.span
      animate={{ boxShadow: [`0 0 8px ${color}60`, `0 0 18px ${color}90`, `0 0 8px ${color}60`] }}
      transition={{ duration: 1.8, repeat: Infinity }}
      style={{
        fontFamily: T.mono, fontSize: 11, fontWeight: 700, color,
        background: `${color}15`, border: `1px solid ${color}50`,
        borderRadius: 5, padding: "2px 9px", display: "inline-block",
      }}
    >{addr}</motion.span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MEMORY DIAGRAM — 2D animated replacement for 3D grid
// ─────────────────────────────────────────────────────────────────────────────
function MemoryDiagram({ cells = [], highlightAddr = null }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {cells.map((cell, i) => {
        const isHl = cell.addr === highlightAddr;
        return (
          <motion.div
            key={i}
            animate={{
              background: isHl ? `${T.neon}18` : `rgba(0,0,0,0.3)`,
              borderColor: isHl ? T.neon : `${T.dim}`,
            }}
            style={{
              display: "grid",
              gridTemplateColumns: "90px 1fr 90px",
              alignItems: "center",
              border: "1px solid",
              borderBottom: i < cells.length - 1 ? "none" : "1px solid",
              padding: "10px 16px",
              borderRadius: i === 0 ? "10px 10px 0 0" : i === cells.length - 1 ? "0 0 10px 10px" : 0,
            }}
          >
            <span style={{ fontFamily: T.mono, fontSize: 10, color: isHl ? T.neon2 : T.muted }}>
              {cell.addr}
            </span>
            <div style={{ textAlign: "center" }}>
              <span style={{ fontFamily: T.mono, fontSize: 8, color: T.muted, display: "block", marginBottom: 2 }}>
                {cell.type} {cell.label}
              </span>
              <motion.span
                key={String(cell.value)}
                animate={isHl ? { textShadow: [`0 0 12px ${T.neon}`, `0 0 24px ${T.neon}`, `0 0 12px ${T.neon}`] } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={{
                  fontFamily: T.mono, fontSize: 17, fontWeight: 700,
                  color: isHl ? T.neon : cell.isPointer ? T.neon2 : T.text,
                }}
              >
                {String(cell.value)}
              </motion.span>
            </div>
            <span style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, textAlign: "right" }}>
              {cell.size}B
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 01 — POINTERS INTRO
// ─────────────────────────────────────────────────────────────────────────────
function PointersSection() {
  const [showPointer, setShowPointer] = useState(false);
  const [animPhase, setAnimPhase] = useState(0);

  const memCells = [
    { addr: "0x1000", label: "x",   value: 42,       type: "int",  size: 4 },
    { addr: "0x1004", label: "y",   value: 99,       type: "int",  size: 4 },
    { addr: "0x1008", label: "ptr", value: showPointer ? "0x1000" : "???", type: "int*", size: 8, isPointer: true },
    { addr: "0x1010", label: "z",   value: 7,        type: "int",  size: 4 },
  ];

  const animatePointer = async () => {
    setAnimPhase(1);
    await new Promise(r => setTimeout(r, 600));
    setShowPointer(true);
    setAnimPhase(2);
    await new Promise(r => setTimeout(r, 700));
    setAnimPhase(3);
    await new Promise(r => setTimeout(r, 900));
    setAnimPhase(4);
  };

  const stepMessages = [
    "int x = 42 lives at address 0x1000 in RAM. Press SHOW to animate.",
    "Declaring int *ptr — allocating 8 bytes for an address on the stack…",
    "ptr = &x — storing the address of x into ptr…",
    <span key="3">ptr contains <AddrTag addr="0x1000" /> — it points to x!</span>,
    <span key="4">*ptr dereferences: follow <AddrTag addr="0x1000" /> → read value <strong style={{ color: T.neon }}>42</strong></span>,
  ];

  return (
    <Section id="pointers">
      <SectionHeader num="01" tag="POINTERS · INTRODUCTION" title="ADDRESS MACHINE" subtitle="A pointer is a variable that stores a memory address — not the value itself. It is a level of indirection." />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
        <GlassCard style={{ padding: 32 }}>
          <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 4, color: T.neon, marginBottom: 24 }}>
            → MEMORY LAYOUT VISUALIZER
          </div>

          <MemoryDiagram cells={memCells} highlightAddr={showPointer ? "0x1000" : null} />

          {/* Arrow connecting ptr → x */}
          <AnimatePresence>
            {showPointer && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  margin: "14px 0",
                  padding: "10px 16px",
                  borderRadius: 9,
                  background: `${T.neon}10`,
                  border: `1px solid ${T.neon}35`,
                  fontFamily: T.mono, fontSize: 12,
                  display: "flex", alignItems: "center", gap: 10,
                }}
              >
                <span style={{ color: T.neon2 }}>ptr @ 0x1008</span>
                <motion.span
                  animate={{ x: [0, 6, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                  style={{ color: T.neon, fontSize: 18 }}
                >→</motion.span>
                <span style={{ color: T.neon }}>x @ 0x1000 = 42</span>
                <motion.div
                  animate={{ scale: [1, 1.4, 1], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                  style={{ width: 8, height: 8, borderRadius: "50%", background: T.neon, boxShadow: `0 0 10px ${T.neon}`, marginLeft: 4 }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Status */}
          <AnimatePresence mode="wait">
            <motion.div
              key={animPhase}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                padding: "14px 18px", borderRadius: 10, marginBottom: 18,
                background: `${T.neon}0A`, border: `1px solid ${T.neon}28`,
                fontFamily: T.mono, fontSize: 11.5, color: T.text, lineHeight: 1.8,
                minHeight: 46,
              }}
            >
              {stepMessages[animPhase]}
            </motion.div>
          </AnimatePresence>

          <div style={{ display: "flex", gap: 10 }}>
            <motion.button
              whileHover={{ scale: 1.04, boxShadow: `0 0 32px ${T.neon}55` }}
              whileTap={{ scale: 0.97 }}
              onClick={animatePointer}
              style={{
                flex: 1, fontFamily: T.display, fontWeight: 400, fontSize: 15, letterSpacing: 4,
                color: "#000", background: `linear-gradient(135deg, ${T.neon}, #FF9200)`,
                border: "none", borderRadius: 9, padding: "14px", cursor: "pointer",
              }}
            >SHOW POINTER CHAIN</motion.button>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => { setShowPointer(false); setAnimPhase(0); }}
              style={{ fontFamily: T.mono, fontSize: 13, color: T.muted, background: "transparent", border: `1px solid ${T.dim}`, borderRadius: 9, padding: "14px 18px", cursor: "pointer" }}
            >↺</motion.button>
          </div>
        </GlassCard>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <CodeBlock
            code={`int x = 42;          // x lives at some address
int y = 99;          // y lives at another

// Declare a POINTER to int
int *ptr;            // ptr holds an address (8 bytes on 64-bit)

// Assign address of x to ptr
ptr = &x;            // & = "address-of" operator

// ptr now contains 0x1000 (wherever x lives)
printf("%p\\n", ptr);   // prints the address (e.g. 0x1000)
printf("%d\\n", *ptr);  // *ptr = dereference = 42

// ptr can be re-pointed to any int
ptr = &y;
printf("%d\\n", *ptr);  // now prints 99`}
            highlightLine={showPointer ? 7 : -1}
          />

          <InsightBlock title="THE POINTER CONTRACT" color={T.neon} icon="→">
            A pointer holds an address. That's its only job.{"\n\n"}
            <span style={{ color: T.neon }}>&x</span>{" = 'give me the address where x lives'\n"}
            <span style={{ color: T.neon2 }}>*ptr</span>{" = 'go to the address in ptr, read what's there'\n\n"}
            Pointer size is always <span style={{ color: T.neon4 }}>8 bytes on 64-bit</span> / 4 bytes on 32-bit — regardless of the pointed-to type. A pointer to int and a pointer to a 1MB struct are both 8 bytes.
          </InsightBlock>

          <InsightBlock title="COMMON MISTAKE — UNINITIALIZED POINTER" color={T.neon3} icon="⚠">
            {"int *ptr;   // ptr contains GARBAGE address!\n*ptr = 42;  // CRASH — writing to unknown memory\n\n"}
            Always initialize: <span style={{ color: T.neon }}>int *ptr = &x;</span> or <span style={{ color: T.neon4 }}>int *ptr = NULL;</span>
            {"\n\nNULL is a safe sentinel — dereferencing it will segfault predictably."}
          </InsightBlock>
        </div>
      </div>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 02 — ADDRESS & DEREFERENCE
// ─────────────────────────────────────────────────────────────────────────────
function AddrDerefSection() {
  const [val, setVal] = useState(37);
  const [phase, setPhase] = useState("idle");
  const [derefResult, setDerefResult] = useState(null);
  const [addrResult, setAddrResult] = useState(null);
  const [step, setStep] = useState(-1);

  const baseAddr = 0x2A44;

  const simulate = async () => {
    if (phase !== "idle") return;
    setPhase("running");
    setDerefResult(null);
    setAddrResult(null);

    setStep(0); await new Promise(r => setTimeout(r, 700));
    setAddrResult(`0x${baseAddr.toString(16).toUpperCase()}`);
    setStep(1); await new Promise(r => setTimeout(r, 750));
    setStep(2); await new Promise(r => setTimeout(r, 700));
    setDerefResult(val);
    setStep(3); await new Promise(r => setTimeout(r, 600));
    setStep(4);
    setPhase("idle");
  };

  return (
    <Section id="addr-deref">
      <SectionHeader num="02" tag="POINTERS · & AND *" title="OPERATOR DUALITY" subtitle="& gives you the address of a variable. * follows an address to the value stored there. They are exact inverses." />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
        <GlassCard style={{ padding: 32 }}>
          <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 4, color: T.neon2, marginBottom: 24 }}>
            ⊕ ADDRESS & DEREFERENCE ENGINE
          </div>

          <div style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontFamily: T.mono, fontSize: 10, color: T.muted }}>int x =</span>
              <motion.span key={val} animate={{ scale: [1.4, 1] }}
                style={{ fontFamily: T.mono, fontSize: 24, fontWeight: 700, color: T.neon4 }}>{val}</motion.span>
            </div>
            <input type="range" min={0} max={255} value={val}
              onChange={e => { setVal(Number(e.target.value)); setStep(-1); setDerefResult(null); setAddrResult(null); setPhase("idle"); }}
              style={{ width: "100%", accentColor: T.neon4 }} />
            <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, marginTop: 4 }}>
              hex: 0x{val.toString(16).toUpperCase().padStart(2, "0")} | binary: {val.toString(2).padStart(8, "0")}
            </div>
          </div>

          {/* Two-column operator visualization */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 12, alignItems: "center", marginBottom: 28 }}>
            {/* Variable */}
            <motion.div
              animate={{ boxShadow: step >= 2 ? `0 0 28px ${T.neon4}70` : "none" }}
              style={{ padding: "20px", borderRadius: 12, background: `${T.neon4}10`, border: `2px solid ${T.neon4}40`, textAlign: "center" }}
            >
              <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, marginBottom: 6 }}>VARIABLE</div>
              <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, marginBottom: 4 }}>int x</div>
              <motion.div key={val} initial={{ scale: 1.3 }} animate={{ scale: 1 }}
                style={{ fontFamily: T.mono, fontSize: 30, fontWeight: 700, color: T.neon4, lineHeight: 1 }}>{val}</motion.div>
              <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, marginTop: 6 }}>
                @ 0x{baseAddr.toString(16).toUpperCase()}
              </div>
            </motion.div>

            {/* Operators */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
              <motion.div
                animate={{
                  boxShadow: step === 0 || step === 1 ? `0 0 22px ${T.neon2}80` : "none",
                  background: step === 0 || step === 1 ? `${T.neon2}25` : `${T.neon2}10`,
                }}
                style={{ padding: "10px 14px", borderRadius: 9, border: `2px solid ${T.neon2}50`, textAlign: "center", transition: "all 0.3s", minWidth: 58 }}
              >
                <div style={{ fontFamily: T.mono, fontSize: 22, fontWeight: 700, color: T.neon2 }}>&</div>
                <div style={{ fontFamily: T.mono, fontSize: 7, color: T.muted, letterSpacing: 1 }}>address-of</div>
              </motion.div>
              <motion.div
                animate={{
                  boxShadow: step === 2 || step === 3 ? `0 0 22px ${T.neon}80` : "none",
                  background: step === 2 || step === 3 ? `${T.neon}25` : `${T.neon}10`,
                }}
                style={{ padding: "10px 14px", borderRadius: 9, border: `2px solid ${T.neon}50`, textAlign: "center", transition: "all 0.3s", minWidth: 58 }}
              >
                <div style={{ fontFamily: T.mono, fontSize: 22, fontWeight: 700, color: T.neon }}>*</div>
                <div style={{ fontFamily: T.mono, fontSize: 7, color: T.muted, letterSpacing: 1 }}>deref</div>
              </motion.div>
            </div>

            {/* Results */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <motion.div
                animate={{ boxShadow: addrResult ? `0 0 20px ${T.neon2}50` : "none" }}
                style={{ padding: "14px", borderRadius: 10, background: `${T.neon2}10`, border: `1px solid ${T.neon2}35`, textAlign: "center", minHeight: 64, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}
              >
                <div style={{ fontFamily: T.mono, fontSize: 8, color: T.muted, marginBottom: 4 }}>&x =</div>
                <AnimatePresence mode="wait">
                  {addrResult
                    ? <motion.div key="a" initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ fontFamily: T.mono, fontSize: 11, fontWeight: 700, color: T.neon2 }}>{addrResult}</motion.div>
                    : <div style={{ fontFamily: T.mono, fontSize: 14, color: T.muted }}>?</div>
                  }
                </AnimatePresence>
              </motion.div>
              <motion.div
                animate={{ boxShadow: derefResult !== null ? `0 0 20px ${T.neon}50` : "none" }}
                style={{ padding: "14px", borderRadius: 10, background: `${T.neon}10`, border: `1px solid ${T.neon}35`, textAlign: "center", minHeight: 64, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}
              >
                <div style={{ fontFamily: T.mono, fontSize: 8, color: T.muted, marginBottom: 4 }}>*(&x) =</div>
                <AnimatePresence mode="wait">
                  {derefResult !== null
                    ? <motion.div key="d" initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ fontFamily: T.mono, fontSize: 20, fontWeight: 700, color: T.neon }}>{derefResult}</motion.div>
                    : <div style={{ fontFamily: T.mono, fontSize: 14, color: T.muted }}>?</div>
                  }
                </AnimatePresence>
              </motion.div>
            </div>
          </div>

          <div style={{ fontFamily: T.mono, fontSize: 11.5, color: T.text, marginBottom: 18, minHeight: 22, lineHeight: 1.75, padding: "10px 14px", borderRadius: 8, background: `${T.neon2}08`, border: `1px solid ${T.neon2}20` }}>
            {step < 0 && "Set a value and press SIMULATE"}
            {step === 0 && "Computing address of x using & operator…"}
            {step === 1 && <span>&x resolved to <AddrTag addr={`0x${baseAddr.toString(16).toUpperCase()}`} color={T.neon2} /></span>}
            {step === 2 && "Following address with * operator (dereference)…"}
            {step === 3 && <span>*(&x) followed the address → found <strong style={{ color: T.neon }}>{val}</strong></span>}
            {step === 4 && `Complete! *(&x) == x == ${val}. Always true.`}
          </div>

          <motion.button
            whileHover={{ scale: 1.04, boxShadow: `0 0 32px ${T.neon2}55` }}
            whileTap={{ scale: 0.97 }}
            onClick={simulate}
            disabled={phase !== "idle"}
            style={{
              width: "100%", fontFamily: T.display, fontWeight: 400, fontSize: 15, letterSpacing: 4,
              color: "#000", background: phase !== "idle" ? T.muted : `linear-gradient(135deg, ${T.neon2}, ${T.accent})`,
              border: "none", borderRadius: 9, padding: "14px", cursor: phase !== "idle" ? "not-allowed" : "pointer",
            }}
          >{phase !== "idle" ? "RUNNING…" : "▶ SIMULATE & AND *"}</motion.button>
        </GlassCard>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <CodeBlock
            code={`int x = ${val};
int *ptr = &x;       // ptr = address of x

// & operator — gives you the address
printf("%p\\n", &x);    // e.g. 0x${baseAddr.toString(16).toUpperCase()}
printf("%p\\n", ptr);   // same — ptr HOLDS that address

// * operator — follows the address to the value
printf("%d\\n", *ptr);  // ${val} — the value AT that address
printf("%d\\n", x);     // ${val} — same thing

// Modify x through the pointer
*ptr = 100;          // x is now 100!
printf("%d\\n", x);  // 100

// These identities always hold:
// *(&x) == x
// &(*ptr) == ptr`}
            highlightLine={step >= 2 ? 8 : step >= 0 ? 4 : -1}
          />
          <InsightBlock title="& vs * — EXACT INVERSES" color={T.neon2} icon="⊕">
            <span style={{ color: T.neon2 }}>&</span>{" = go UP: from value → address\n"}
            <span style={{ color: T.neon }}>*</span>{" = go DOWN: from address → value\n\n"}
            {"They cancel out: *(&x) == x and &(*ptr) == ptr\n\n"}
            <span style={{ color: T.neon4 }}>int *ptr</span>{" in a declaration — the * is part of the type, NOT an operator. It means 'ptr is a pointer-to-int'."}
          </InsightBlock>
          <InsightBlock title="MODIFYING THROUGH A POINTER" color={T.neon} icon="💡">
            {"*ptr = 100; modifies x directly — no copy.\n\nThis is how functions modify caller variables:\nvoid double_it(int *n) { *n *= 2; }\ndouble_it(&x); // x is now doubled!\n\nWithout pointers you'd need to return new values."}
          </InsightBlock>
        </div>
      </div>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 03 — POINTERS + ARRAYS
// ─────────────────────────────────────────────────────────────────────────────
function PtrArraysSection() {
  const arr = [10, 20, 30, 40, 50];
  const [offset, setOffset] = useState(0);
  const baseAddr = 0x3000;

  const dereffed = arr[offset];
  const currentAddr = `0x${(baseAddr + offset * 4).toString(16).toUpperCase()}`;

  return (
    <Section id="ptr-arrays">
      <SectionHeader num="03" tag="POINTERS · ARRAYS" title="POINTER ARITHMETIC" subtitle="arr[i] is syntactic sugar for *(arr+i). Array indexing IS pointer arithmetic — the compiler does the same thing." />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
        <GlassCard style={{ padding: 32 }}>
          <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 4, color: T.neon4, marginBottom: 24 }}>
            ⧖ POINTER ARITHMETIC DEMO
          </div>

          {/* Address row */}
          <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
            {arr.map((_, i) => (
              <div key={i} style={{ flex: 1, textAlign: "center", fontFamily: T.mono, fontSize: 8, color: T.dim }}>
                0x{(baseAddr + i * 4).toString(16).toUpperCase()}
              </div>
            ))}
          </div>

          {/* Array cells */}
          <div style={{ display: "flex", gap: 0, borderRadius: 10, overflow: "hidden", border: `2px solid ${T.neon4}30`, marginBottom: 8 }}>
            {arr.map((v, i) => (
              <motion.div
                key={i}
                animate={{
                  background: i === offset ? `${T.neon4}28` : `${T.neon}06`,
                  boxShadow: i === offset ? `inset 0 0 20px ${T.neon4}30` : "none",
                }}
                style={{
                  flex: 1, height: 76, borderRight: i < arr.length - 1 ? `1px solid ${T.dim}` : "none",
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  cursor: "pointer",
                }}
                onClick={() => setOffset(i)}
              >
                <motion.span
                  animate={{ scale: i === offset ? 1 : 1, color: i === offset ? T.neon4 : T.text }}
                  style={{ fontFamily: T.mono, fontSize: 20, fontWeight: 700, lineHeight: 1 }}
                >{v}</motion.span>
                <span style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, marginTop: 4 }}>[{i}]</span>
              </motion.div>
            ))}
          </div>

          {/* Pointer arrow */}
          <div style={{ position: "relative", height: 36, marginBottom: 18 }}>
            <motion.div
              animate={{ left: `${(offset / arr.length) * 100 + 10 / arr.length}%` }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              style={{ position: "absolute", display: "flex", flexDirection: "column", alignItems: "center", transform: "translateX(-50%)" }}
            >
              <motion.div
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                style={{ width: 0, height: 0, borderLeft: "9px solid transparent", borderRight: "9px solid transparent", borderBottom: `14px solid ${T.neon4}` }}
              />
              <span style={{ fontFamily: T.mono, fontSize: 9, color: T.neon4, marginTop: 3 }}>ptr+{offset}</span>
            </motion.div>
          </div>

          {/* Offset control */}
          <div style={{ marginBottom: 22 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontFamily: T.mono, fontSize: 10, color: T.muted }}>Offset i</span>
              <motion.span key={offset} animate={{ scale: [1.4, 1] }}
                style={{ fontFamily: T.mono, fontSize: 22, fontWeight: 700, color: T.neon4 }}>{offset}</motion.span>
            </div>
            <input type="range" min={0} max={4} value={offset}
              onChange={e => setOffset(Number(e.target.value))}
              style={{ width: "100%", accentColor: T.neon4 }} />
          </div>

          {/* Equivalence cards */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontFamily: T.mono, fontSize: 8, color: T.muted, marginBottom: 10, letterSpacing: 3 }}>
              ALL FOUR EXPRESSIONS ARE IDENTICAL:
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[
                { expr: `arr[${offset}]`,    desc: "index syntax",    note: "most readable" },
                { expr: `*(arr+${offset})`,  desc: "ptr arithmetic",  note: "compiler sees this" },
                { expr: `*(ptr+${offset})`,  desc: "ptr offset",      note: "same thing" },
                { expr: `ptr[${offset}]`,    desc: "ptr as array",    note: "ptrs are indexable" },
              ].map(({ expr, desc, note }) => (
                <motion.div key={expr} whileHover={{ scale: 1.04 }}
                  style={{ padding: "10px 12px", borderRadius: 9, background: `${T.neon}10`, border: `1px solid ${T.neon}25` }}
                >
                  <div style={{ fontFamily: T.mono, fontSize: 14, fontWeight: 700, color: T.neon }}>{expr}</div>
                  <div style={{ fontFamily: T.mono, fontSize: 8, color: T.muted, marginTop: 2 }}>{desc}</div>
                  <div style={{ fontFamily: T.mono, fontSize: 8, color: T.dim, marginTop: 1 }}>{note}</div>
                  <div style={{ fontFamily: T.mono, fontSize: 13, color: T.neon4, marginTop: 4 }}>= {dereffed}</div>
                </motion.div>
              ))}
            </div>
          </div>

          <div style={{
            fontFamily: T.mono, fontSize: 11.5, color: T.text, lineHeight: 1.8,
            padding: "12px 16px", borderRadius: 9, background: `${T.neon2}08`, border: `1px solid ${T.neon2}20`,
          }}>
            Current address: <AddrTag addr={currentAddr} color={T.neon2} />
            &nbsp;= 0x{baseAddr.toString(16).toUpperCase()} + {offset} × 4 bytes
          </div>
        </GlassCard>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <CodeBlock
            code={`int arr[] = {10, 20, 30, 40, 50};
int *ptr = arr;      // ptr = &arr[0] (implicit)

// These four are COMPILED TO THE SAME THING:
arr[2]               // index notation
*(arr + 2)           // pointer + offset
*(ptr + 2)           // ptr + offset
ptr[2]               // ptr as array

// Pointer arithmetic advances by sizeof(element):
// ptr + 1 → adds 4 bytes (sizeof int)
// ptr + 2 → adds 8 bytes
ptr++;               // now points to arr[1]
ptr += 2;            // now points to arr[3]

// PROOF: arr is a pointer to its first element
printf("%p %p\\n", arr, &arr[0]); // identical!

// No bounds checking — danger zone:
*(arr + 100);        // undefined behavior / crash`}
            highlightLine={offset > 0 ? 12 : 4}
          />
          <InsightBlock title="WHY POINTER ARITHMETIC WORKS" color={T.neon4} icon="⧖">
            {"When you write ptr + i, C adds i × sizeof(*ptr) bytes — not i bytes. This is why:\n\n"}
            <span style={{ color: T.neon4 }}>int</span>{" ptr: ptr+1 adds 4 bytes\n"}
            <span style={{ color: T.neon2 }}>double</span>{" ptr: ptr+1 adds 8 bytes\n"}
            <span style={{ color: T.neon }}>char</span>{" ptr: ptr+1 adds 1 byte\n\n"}
            {"The type of the pointer is what makes array indexing type-safe."}
          </InsightBlock>
          <InsightBlock title="ARRAY vs POINTER — KEY DIFFERENCES" color={T.neon3} icon="⚠">
            <span style={{ color: T.neon }}>int arr[5]</span>{" — fixed size, can't reassign arr\n"}
            <span style={{ color: T.neon2 }}>int *ptr = arr</span>{" — can be moved: ptr = &other\n\n"}
            {"sizeof(arr) = 20 bytes (full array)\n"}
            {"sizeof(ptr) = 8 bytes (just the address)\n\n"}
            {"Once you pass arr to a function, it decays to a pointer and sizeof is lost forever."}
          </InsightBlock>
        </div>
      </div>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 04 — STRUCTS
// ─────────────────────────────────────────────────────────────────────────────
function StructsSection() {
  const [student, setStudent] = useState({ name: "Alice", age: 20, gpa: 3.8, id: 1001 });
  const [editing, setEditing] = useState(null);
  const [accessMode, setAccessMode] = useState("dot");
  const [animField, setAnimField] = useState(null);

  const fields = [
    { key: "name", type: "char[20]", color: T.neon2,  size: 20, label: "Name",       offset: 0 },
    { key: "age",  type: "int",      color: T.neon,   size: 4,  label: "Age",        offset: 20 },
    { key: "gpa",  type: "float",    color: T.neon4,  size: 4,  label: "GPA",        offset: 24 },
    { key: "id",   type: "int",      color: T.accent, size: 4,  label: "Student ID", offset: 28 },
  ];
  const totalSize = 32; // with padding

  const accessField = async (key) => {
    setAnimField(key);
    await new Promise(r => setTimeout(r, 1200));
    setAnimField(null);
  };

  return (
    <Section id="structs">
      <SectionHeader num="04" tag="STRUCTURES · BASICS" title="STRUCT MEMORY MODEL" subtitle="A struct groups related variables into one named block. Members are laid out sequentially in memory with possible padding for alignment." />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
        <GlassCard style={{ padding: 32 }}>
          <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 4, color: T.accent, marginBottom: 24 }}>
            ⬡ STRUCT MEMORY LAYOUT — sizeof = {totalSize} bytes
          </div>

          <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
            <Pill color={T.accent} active={accessMode === "dot"}   onClick={() => setAccessMode("dot")}>. DOT ACCESS</Pill>
            <Pill color={T.neon2}  active={accessMode === "arrow"} onClick={() => setAccessMode("arrow")}>→ ARROW ACCESS</Pill>
          </div>

          {/* Memory layout bar */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontFamily: T.mono, fontSize: 8, color: T.muted, marginBottom: 6, letterSpacing: 2 }}>
              MEMORY LAYOUT (offset from struct base):
            </div>
            <div style={{ display: "flex", height: 32, borderRadius: 8, overflow: "hidden", border: `1px solid ${T.dim}`, marginBottom: 4 }}>
              {fields.map((f) => (
                <motion.div
                  key={f.key}
                  animate={{ opacity: animField === f.key ? 1 : animField ? 0.3 : 1 }}
                  style={{ flex: f.size, background: `${f.color}28`, borderRight: `1px solid ${T.dim}`, display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  <span style={{ fontFamily: T.mono, fontSize: 8, color: f.color }}>{f.size}B</span>
                </motion.div>
              ))}
            </div>
            <div style={{ display: "flex" }}>
              {fields.map((f) => (
                <div key={f.key} style={{ flex: f.size, fontFamily: T.mono, fontSize: 7, color: f.color, textAlign: "center" }}>
                  +{f.offset}
                </div>
              ))}
            </div>
          </div>

          {/* Fields */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
            {fields.map((f) => (
              <motion.div key={f.key}
                animate={{
                  background: animField === f.key ? `${f.color}20` : `${f.color}08`,
                  borderColor: animField === f.key ? f.color : `${f.color}25`,
                  boxShadow: animField === f.key ? `0 0 28px ${f.color}50` : "none",
                }}
                style={{ borderRadius: 11, border: "2px solid", padding: "12px 16px", display: "flex", alignItems: "center", gap: 14 }}
              >
                <div style={{ width: 70, fontFamily: T.mono, fontSize: 8, color: f.color, letterSpacing: 1.5, lineHeight: 1.6 }}>
                  {f.type}<br />
                  <span style={{ color: T.muted }}>{f.key}</span>
                </div>
                <div style={{ flex: 1 }}>
                  {editing === f.key ? (
                    <input
                      autoFocus
                      defaultValue={student[f.key]}
                      onBlur={e => {
                        const v = e.target.value;
                        setStudent(prev => ({ ...prev, [f.key]: f.type === "int" ? parseInt(v) || prev[f.key] : f.type === "float" ? parseFloat(v) || prev[f.key] : v }));
                        setEditing(null);
                      }}
                      onKeyDown={e => e.key === "Enter" && e.target.blur()}
                      style={{ background: "transparent", border: "none", outline: "none", fontFamily: T.mono, fontSize: 18, fontWeight: 700, color: f.color, width: "100%" }}
                    />
                  ) : (
                    <motion.div key={String(student[f.key])} animate={{ scale: [1.12, 1] }}
                      style={{ fontFamily: T.mono, fontSize: 18, fontWeight: 700, color: f.color, cursor: "text" }}
                      onClick={() => setEditing(f.key)}
                    >{String(student[f.key])}</motion.div>
                  )}
                  <div style={{ fontFamily: T.mono, fontSize: 8, color: T.muted, marginTop: 2 }}>
                    {accessMode === "dot" ? `s.${f.key}` : `ptr->${f.key}`}
                  </div>
                </div>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  onClick={() => accessField(f.key)}
                  style={{ fontFamily: T.mono, fontSize: 8, color: f.color, background: `${f.color}15`, border: `1px solid ${f.color}40`, borderRadius: 5, padding: "5px 12px", cursor: "pointer" }}>
                  ACCESS
                </motion.button>
              </motion.div>
            ))}
          </div>

          <motion.div key={accessMode} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            style={{ padding: "14px 16px", borderRadius: 11, background: `${T.accent}0C`, border: `1px solid ${T.accent}30`, fontFamily: T.mono, fontSize: 12, color: T.text, lineHeight: 2 }}
          >
            {accessMode === "dot" ? (
              <>
                <span style={{ color: T.accent }}>struct Student s;</span><br />
                s.name = <span style={{ color: T.neon2 }}>"{student.name}"</span><br />
                s.age = <span style={{ color: T.neon }}>{student.age}</span> &nbsp;·&nbsp;
                s.gpa = <span style={{ color: T.neon4 }}>{student.gpa}</span> &nbsp;·&nbsp;
                s.id = <span style={{ color: T.accent }}>{student.id}</span>
              </>
            ) : (
              <>
                <span style={{ color: T.accent }}>struct Student *ptr = &s;</span><br />
                ptr→name = <span style={{ color: T.neon2 }}>"{student.name}"</span><br />
                ptr→age = <span style={{ color: T.neon }}>{student.age}</span> &nbsp;·&nbsp;
                ptr→gpa = <span style={{ color: T.neon4 }}>{student.gpa}</span>
                <br /><span style={{ color: T.muted, fontSize: 9 }}>ptr→field is shorthand for (*ptr).field</span>
              </>
            )}
          </motion.div>
        </GlassCard>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <CodeBlock
            code={`// DEFINITION — creates a new type blueprint
struct Student {
  char  name[20];  // offset 0,  20 bytes
  int   age;       // offset 20,  4 bytes
  float gpa;       // offset 24,  4 bytes
  int   id;        // offset 28,  4 bytes
};                 // total: 32 bytes (incl. padding)

// Use typedef to avoid writing 'struct' every time
typedef struct Student Student;

// Create and initialize an instance
Student s = {"${student.name}", ${student.age}, ${student.gpa}f, ${student.id}};

// DOT access — direct struct variable
printf("%s\\n",  s.name);  // "${student.name}"
printf("%d\\n",  s.age);   // ${student.age}
printf("%.1f\\n",s.gpa);   // ${student.gpa}

// ARROW access — pointer to struct
Student *ptr = &s;
printf("%s\\n", ptr->name);  // ptr->name == (*ptr).name
ptr->age = 21;               // modifies s.age directly`}
            highlightLine={animField ? fields.findIndex(f => f.key === animField) + 2 : -1}
          />
          <InsightBlock title="DOT vs ARROW — THE RULE" color={T.accent} icon="⬡">
            <span style={{ color: T.accent }}>s.name</span>{" — s is the struct itself (value)\n"}
            <span style={{ color: T.neon2 }}>ptr→name</span>{" — ptr is a pointer to a struct\n\n"}
            {"ptr→name is EXACTLY (*ptr).name — dereference then dot.\nThe arrow exists purely for readability.\n\n"}
            <span style={{ color: T.neon4 }}>Rule: dot when you have the thing, arrow when you have a pointer to the thing."}
          </InsightBlock>
          <InsightBlock title="STRUCT PADDING & ALIGNMENT" color={T.neon3} icon="⚠">
            {"struct { char c; int i; } — 8 bytes, not 5!\n"}
            {"The compiler inserts 3 padding bytes after char c so that int i is 4-byte aligned.\n\n"}
            {"Reorder fields from largest to smallest to minimize wasted space:\nstruct { int i; char c; } — only 5–8 bytes instead of more."}
          </InsightBlock>
        </div>
      </div>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 05 — UNIONS
// ─────────────────────────────────────────────────────────────────────────────
function UnionsSection() {
  const [activeType, setActiveType] = useState("i");
  const [intVal, setIntVal] = useState(1078530011);

  const floatBits = useMemo(() => {
    const buf = new ArrayBuffer(4);
    const view = new DataView(buf);
    view.setInt32(0, intVal, true);
    return view.getFloat32(0, true).toFixed(6);
  }, [intVal]);

  const charVal = String.fromCharCode(intVal & 0xFF);
  const hexVal = `0x${(intVal >>> 0).toString(16).toUpperCase().padStart(8, "0")}`;

  const members = [
    { key: "i", label: "int i",   type: "int",   size: 4, color: T.neon,  value: intVal },
    { key: "f", label: "float f", type: "float", size: 4, color: T.neon4, value: floatBits },
    { key: "c", label: "char c",  type: "char",  size: 1, color: T.neon2, value: `'${charVal}'` },
  ];

  const activeMember = members.find(m => m.key === activeType);

  const bytes = [0, 1, 2, 3].map(i => ({
    hex: ((intVal >> (i * 8)) & 0xFF).toString(16).toUpperCase().padStart(2, "0"),
    dec: (intVal >> (i * 8)) & 0xFF,
    active: activeType === "c" ? i === 0 : true,
  }));

  return (
    <Section id="unions">
      <SectionHeader num="05" tag="UNIONS · SHARED MEMORY" title="ONE MEMORY, MANY TYPES" subtitle="A union allocates one block of memory large enough for its biggest member. All members share that same block." />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
        <GlassCard style={{ padding: 32 }}>
          <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 4, color: T.neon3, marginBottom: 24 }}>
            ◎ UNION MEMORY VISUALIZER
          </div>

          <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
            {members.map(m => (
              <Pill key={m.key} color={m.color} active={activeType === m.key} onClick={() => setActiveType(m.key)}>
                {m.label}
              </Pill>
            ))}
          </div>

          {/* 4 byte cells */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontFamily: T.mono, fontSize: 8, color: T.muted, marginBottom: 8, letterSpacing: 2 }}>
              SHARED MEMORY — 4 BYTES TOTAL
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {bytes.map((b, i) => (
                <motion.div
                  key={i}
                  animate={{
                    background: b.active ? `${activeMember.color}22` : `${T.dim}80`,
                    borderColor: b.active ? activeMember.color : T.muted,
                    opacity: b.active ? 1 : 0.35,
                  }}
                  style={{ flex: 1, height: 82, borderRadius: 10, border: "2px solid", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2 }}
                >
                  <div style={{ fontFamily: T.mono, fontSize: 8, color: T.muted }}>byte {i}</div>
                  <div style={{ fontFamily: T.mono, fontSize: 15, fontWeight: 700, color: b.active ? activeMember.color : T.muted }}>
                    {b.hex}
                  </div>
                  <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted }}>{b.dec}</div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Struct vs Union comparison */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 22 }}>
            <div style={{ padding: "14px", borderRadius: 10, background: `${T.neon3}08`, border: `1px solid ${T.neon3}25` }}>
              <div style={{ fontFamily: T.mono, fontSize: 8, color: T.neon3, marginBottom: 8, letterSpacing: 2 }}>STRUCT = SEPARATE</div>
              <div style={{ display: "flex", gap: 3, marginBottom: 6 }}>
                {members.map(m => (
                  <div key={m.key} style={{ flex: m.size, height: 20, borderRadius: 4, background: `${m.color}30`, border: `1px solid ${m.color}50` }} />
                ))}
              </div>
              <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted }}>9+ bytes, all coexist</div>
            </div>
            <div style={{ padding: "14px", borderRadius: 10, background: `${T.neon}08`, border: `1px solid ${T.neon}25` }}>
              <div style={{ fontFamily: T.mono, fontSize: 8, color: T.neon, marginBottom: 8, letterSpacing: 2 }}>UNION = SHARED</div>
              <div style={{ position: "relative", height: 20, marginBottom: 6 }}>
                {members.map((m, i) => (
                  <div key={m.key} style={{ position: "absolute", inset: 0, borderRadius: 4, background: `${m.color}${i === 0 ? "30" : "18"}`, border: `1px solid ${m.color}50` }} />
                ))}
              </div>
              <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted }}>4 bytes, one at a time</div>
            </div>
          </div>

          {/* Slider */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontFamily: T.mono, fontSize: 9, color: T.muted }}>u.i raw value</span>
              <span style={{ fontFamily: T.mono, fontSize: 10, color: T.neon4 }}>{hexVal}</span>
            </div>
            <input type="range" min={0} max={2147483647} step={1000000} value={intVal}
              onChange={e => setIntVal(Number(e.target.value))}
              style={{ width: "100%", accentColor: T.neon }} />
          </div>

          {/* All interpretations */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {members.map(m => (
              <motion.div key={m.key}
                animate={{
                  background: activeType === m.key ? `${m.color}18` : `${m.color}06`,
                  borderColor: activeType === m.key ? m.color : `${m.color}25`,
                  boxShadow: activeType === m.key ? `0 0 22px ${m.color}40` : "none",
                }}
                style={{ padding: "12px 16px", borderRadius: 10, border: "2px solid", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
                onClick={() => setActiveType(m.key)}
              >
                <span style={{ fontFamily: T.mono, fontSize: 10, color: m.color }}>{m.label}</span>
                <span style={{ fontFamily: T.mono, fontSize: 15, fontWeight: 700, color: m.color }}>{String(m.value)}</span>
              </motion.div>
            ))}
          </div>
        </GlassCard>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <CodeBlock
            code={`union Data {
  int   i;    // 4 bytes
  float f;    // 4 bytes
  char  c;    // 1 byte
};
// sizeof(union Data) = 4 (largest member wins)

union Data u;
u.i = ${intVal};     // write as int

// SAME 4 BYTES interpreted differently:
printf("%d\\n",   u.i);   // int:   ${intVal}
printf("%.4f\\n", u.f);   // float: ${floatBits}
printf("%c\\n",   u.c);   // char:  '${charVal}'

// Real use case: type punning (IEEE 754 trick)
// 0x3F800000 stored as int → read as float → 1.0f
// This is how you inspect floating point bits!

// Safer pattern: tagged union
struct Tagged {
  int type;        // 0=int, 1=float, 2=char
  union Data val;
};`}
            highlightLine={activeType === "i" ? 11 : activeType === "f" ? 12 : 13}
          />
          <InsightBlock title="UNION vs STRUCT — THE DIFFERENCE" color={T.neon3} icon="◎">
            <span style={{ color: T.neon }}>struct</span>{" — each member has its own memory. Size = sum of members + padding.\n"}
            <span style={{ color: T.neon4 }}>union</span>{" — all members share one block. Size = largest member.\n\n"}
            {"Writing u.i and then reading u.f is 'type punning' — valid in C (C99 allows it via union). This is how embedded systems read raw hardware bytes as typed values."}
          </InsightBlock>
          <InsightBlock title="TAGGED UNION — THE SAFE PATTERN" color={T.neon2} icon="💡">
            {"Combine union with an integer 'tag' to track which member is active:\n\n"}
            {"struct { int type; union { int i; float f; char c; } val; }\n\n"}
            {"This is the foundation of 'sum types', 'variants', and 'tagged unions' in Rust, Haskell, Swift, and TypeScript — all inspired by C unions."}
          </InsightBlock>
        </div>
      </div>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 06 — PREPROCESSOR
// ─────────────────────────────────────────────────────────────────────────────
function PreprocessorSection() {
  const [activeDirective, setActiveDirective] = useState("include");
  const [macroN, setMacroN] = useState(7);
  const [showExpanded, setShowExpanded] = useState(false);

  const directives = {
    include: {
      color: T.neon2,
      label: "#include",
      desc: "Inserts the entire content of another file at this exact point — before the compiler ever sees your code.",
      before: `#include <stdio.h>
#include <stdlib.h>
#include "mymath.h"

int main() {
  printf("Hello!");
  return 0;
}`,
      after: `// [contents of stdio.h — ~800 lines]
// int printf(const char *format, ...);
// int scanf(const char *format, ...);
// FILE *fopen(const char *path, ...);
// ... hundreds more declarations

// [contents of stdlib.h — ~600 lines]
// void *malloc(size_t size);
// void free(void *ptr);
// ...

// [contents of mymath.h]
// int add(int a, int b);

int main() {
  printf("Hello!");
  return 0;
}`,
    },
    define: {
      color: T.neon4,
      label: "#define",
      desc: "Textual substitution before compilation. Not a variable, not a function — pure find-and-replace with no type safety.",
      before: `#define PI 3.14159265
#define MAX(a,b) ((a)>(b)?(a):(b))
#define SQ(x) ((x)*(x))

double area = PI * r * r;
int m = MAX(3, 7);
int s = SQ(${macroN});`,
      after: `// PI → 3.14159265 (pure text replacement)
// MAX(a,b) → ((a)>(b)?(a):(b))
// SQ(x) → ((x)*(x))

double area = 3.14159265 * r * r;
int m = ((3)>(7)?(3):(7));        // = 7
int s = ((${macroN})*(${macroN}));          // = ${macroN * macroN}`,
    },
    ifdef: {
      color: T.accent,
      label: "#ifdef",
      desc: "Conditional compilation — entire sections of code are included or excluded based on whether a macro is defined.",
      before: `#define DEBUG   // comment this to disable

int main() {
#ifdef DEBUG
  printf("Debug mode\\n");
  log_verbose();
#else
  // production path — no logging
#endif
  return 0;
}`,
      after: `// DEBUG is defined → keep the #ifdef branch
// #else branch is completely removed

int main() {
  printf("Debug mode\\n");
  log_verbose();
  return 0;
}`,
    },
  };

  const d = directives[activeDirective];

  return (
    <Section id="preproc">
      <SectionHeader num="06" tag="PREPROCESSOR · #DIRECTIVES" title="PRE-COMPILE TRANSFORM" subtitle="The preprocessor runs BEFORE the compiler. It transforms your source code through text substitution, file inclusion, and conditional removal." />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
        <GlassCard style={{ padding: 32 }}>
          <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 4, color: T.neon2, marginBottom: 24 }}>
            # PREPROCESSOR PIPELINE
          </div>

          {/* Pipeline */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 28, flexWrap: "wrap" }}>
            {[
              { label: "source.c", color: T.muted, icon: "📄" },
              { label: "→", color: T.dim },
              { label: "preprocessor", color: T.neon2, icon: "#" },
              { label: "→", color: T.dim },
              { label: "compiler", color: T.neon, icon: "⚙" },
              { label: "→", color: T.dim },
              { label: "linker", color: T.accent, icon: "⧖" },
              { label: "→", color: T.dim },
              { label: "binary", color: T.neon4, icon: "⬡" },
            ].map((step, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                style={{
                  fontFamily: T.mono, fontSize: step.icon ? 10 : 14, fontWeight: 700,
                  color: step.color, padding: step.icon ? "6px 10px" : "0 2px",
                  background: step.icon ? `${step.color}12` : "transparent",
                  border: step.icon ? `1px solid ${step.color}28` : "none",
                  borderRadius: 6,
                }}>
                {step.icon ? `${step.icon} ${step.label}` : step.label}
              </motion.div>
            ))}
          </div>

          {/* Directive selector */}
          <div style={{ display: "flex", gap: 8, marginBottom: 22 }}>
            {Object.entries(directives).map(([k, v]) => (
              <Pill key={k} color={v.color} active={activeDirective === k} onClick={() => { setActiveDirective(k); setShowExpanded(false); }}>
                {v.label}
              </Pill>
            ))}
          </div>

          {activeDirective === "define" && (
            <div style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontFamily: T.mono, fontSize: 9, color: T.muted }}>SQ(x) where x =</span>
                <motion.span key={macroN} animate={{ scale: [1.4, 1] }}
                  style={{ fontFamily: T.mono, fontSize: 18, fontWeight: 700, color: T.neon4 }}>{macroN}</motion.span>
              </div>
              <input type="range" min={1} max={20} value={macroN}
                onChange={e => { setMacroN(Number(e.target.value)); setShowExpanded(false); }}
                style={{ width: "100%", accentColor: T.neon4 }} />
            </div>
          )}

          {/* Before/After */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontFamily: T.mono, fontSize: 8, color: T.muted, marginBottom: 8, letterSpacing: 3 }}>
              {showExpanded ? "▼ AFTER PREPROCESSING" : "▲ ORIGINAL SOURCE"}
            </div>
            <motion.div key={`${activeDirective}-${showExpanded}-${macroN}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{
                background: "rgba(0,0,0,0.55)", borderRadius: 12,
                border: `1px solid ${showExpanded ? d.color + "45" : T.dim}`,
                padding: "16px 18px", minHeight: 176,
                fontFamily: T.mono, fontSize: 11.5, lineHeight: 1.9,
                color: T.text, whiteSpace: "pre", overflowX: "auto",
                boxShadow: showExpanded ? `0 0 22px ${d.color}18` : "none",
              }}
            >{showExpanded ? d.after : d.before}</motion.div>
          </div>

          <div style={{ fontFamily: T.mono, fontSize: 11.5, color: T.text, lineHeight: 1.8, marginBottom: 18, padding: "12px 14px", borderRadius: 9, background: `${d.color}0A`, border: `1px solid ${d.color}25` }}>
            {d.desc}
          </div>

          <motion.button
            whileHover={{ scale: 1.04, boxShadow: `0 0 28px ${d.color}50` }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowExpanded(prev => !prev)}
            style={{
              width: "100%", fontFamily: T.display, fontWeight: 400, fontSize: 15, letterSpacing: 4,
              color: "#000", background: `linear-gradient(135deg, ${d.color}, ${T.neon2})`,
              border: "none", borderRadius: 9, padding: "14px", cursor: "pointer",
            }}
          >{showExpanded ? "↺ SHOW SOURCE" : "▶ EXPAND PREPROCESSOR"}</motion.button>
        </GlassCard>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <CodeBlock
            code={`// ── #include — file text insertion ──────────────
#include <stdio.h>    // angle brackets: system headers
#include "myfile.h"   // quotes: local project headers

// ── #define — object macro (constant-like) ───────
#define PI     3.14159265358979
#define MAXN   1000
#define TRUE   1

// ── #define — function macro ─────────────────────
// CRITICAL: wrap both args AND result in ()
#define SQ(x)     ((x) * (x))
#define MAX(a, b) ((a) > (b) ? (a) : (b))
#define ABS(x)    ((x) < 0 ? -(x) : (x))

// ── Conditional compilation ───────────────────────
#ifdef DEBUG
  #define LOG(fmt, ...) printf(fmt, ##__VA_ARGS__)
#else
  #define LOG(fmt, ...)   // compiled out entirely
#endif

// ── Include guard (prevents double-inclusion) ─────
#ifndef MYHEADER_H
  #define MYHEADER_H
  // ... header contents ...
#endif`}
            highlightLine={activeDirective === "include" ? 1 : activeDirective === "define" ? 10 : 16}
          />
          <InsightBlock title="THE PARENTHESES RULE — CRITICAL" color={T.neon3} icon="⚠">
            <span style={{ color: T.neon3 }}>Wrong:</span>{" #define SQ(x) x*x\n"}
            {"SQ(3+1) → 3+1*3+1 = 7, not 16!\n\n"}
            <span style={{ color: T.neon4 }}>Correct:</span>{" #define SQ(x) ((x)*(x))\n"}
            {"SQ(3+1) → ((3+1)*(3+1)) = 16 ✓\n\n"}
            {"Wrap every argument and the entire macro body in parentheses. Without this, operator precedence creates silent bugs."}
          </InsightBlock>
          <InsightBlock title="PREFER CONST AND INLINE OVER MACROS" color={T.neon2} icon="💡">
            <span style={{ color: T.neon }}>const int MAX = 1000;</span>{" instead of #define MAX 1000\n→ Type-checked, appears in debugger, respects scope\n\n"}
            <span style={{ color: T.neon2 }}>inline int sq(int x) { return x*x; }</span>{"\n→ Same speed as macro, but type-safe and debuggable\n\nMacros are still necessary for include guards, LOG wrappers, and platform-specific code."}
          </InsightBlock>
        </div>
      </div>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 07 — DYNAMIC MEMORY
// ─────────────────────────────────────────────────────────────────────────────
function DynMemSection() {
  const [heapBlocks, setHeapBlocks] = useState([]);
  const [allocSize, setAllocSize] = useState(5);
  const [phase, setPhase] = useState("idle");
  const [log, setLog] = useState([]);
  const [leakWarning, setLeakWarning] = useState(false);
  const nextId = useRef(1);

  const addLog = (msg, color = T.text) => setLog(prev => [...prev.slice(-7), { msg, color, id: Math.random() }]);

  const malloc_ = async () => {
    if (phase !== "idle" || heapBlocks.length >= 6) return;
    setPhase("alloc");
    addLog(`malloc(${allocSize} * sizeof(int)) = ${allocSize * 4} bytes…`, T.neon2);
    await new Promise(r => setTimeout(r, 450));
    const id = nextId.current++;
    const addr = `0x${(0x8000 + id * 100).toString(16).toUpperCase()}`;
    setHeapBlocks(prev => [...prev, { id, size: allocSize, freed: false, addr, zeroed: false }]);
    addLog(`→ allocated at ${addr} ✓`, T.neon4);
    setPhase("idle");
  };

  const calloc_ = async () => {
    if (phase !== "idle" || heapBlocks.length >= 6) return;
    setPhase("alloc");
    addLog(`calloc(${allocSize}, sizeof(int)) — alloc + zero init…`, T.neon2);
    await new Promise(r => setTimeout(r, 450));
    const id = nextId.current++;
    const addr = `0x${(0x8000 + id * 100).toString(16).toUpperCase()}`;
    setHeapBlocks(prev => [...prev, { id, size: allocSize, freed: false, addr, zeroed: true }]);
    addLog(`→ zero-initialized ${allocSize * 4} bytes at ${addr} ✓`, T.neon);
    setPhase("idle");
  };

  const free_ = async (id) => {
    if (phase !== "idle") return;
    setPhase("free");
    const block = heapBlocks.find(b => b.id === id);
    addLog(`free(${block.addr})…`, T.neon3);
    await new Promise(r => setTimeout(r, 350));
    setHeapBlocks(prev => prev.map(b => b.id === id ? { ...b, freed: true } : b));
    await new Promise(r => setTimeout(r, 400));
    setHeapBlocks(prev => prev.filter(b => b.id !== id));
    addLog(`→ ${block.size * 4} bytes returned to heap ✓`, T.neon4);
    setPhase("idle");
    setLeakWarning(false);
  };

  const liveBlocks = heapBlocks.filter(b => !b.freed);
  const leakedBytes = liveBlocks.reduce((a, b) => a + b.size * 4, 0);

  return (
    <Section id="dynmem">
      <SectionHeader num="07" tag="DYNAMIC MEMORY · malloc/calloc/free" title="HEAP ENGINE" subtitle="Stack memory is automatic. Heap memory is manual — you request it, use it, and must return it. Forgetting to free is a memory leak." />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
        <GlassCard style={{ padding: 32 }}>
          <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 4, color: T.neon2, marginBottom: 22 }}>
            ∞ HEAP ALLOCATOR SIMULATION
          </div>

          {/* Size control */}
          <div style={{ marginBottom: 22 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontFamily: T.mono, fontSize: 10, color: T.muted }}>Array elements</span>
              <motion.span key={allocSize} animate={{ scale: [1.4, 1] }}
                style={{ fontFamily: T.mono, fontSize: 20, fontWeight: 700, color: T.neon2 }}>{allocSize}</motion.span>
            </div>
            <input type="range" min={1} max={12} value={allocSize}
              onChange={e => setAllocSize(Number(e.target.value))}
              style={{ width: "100%", accentColor: T.neon2 }} />
            <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, marginTop: 4 }}>
              = {allocSize * 4} bytes (int × {allocSize})
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
            {[
              { label: "malloc()", fn: malloc_, color: T.neon2, desc: "uninitialized — faster" },
              { label: "calloc()", fn: calloc_, color: T.neon,  desc: "zero-init — safer" },
            ].map(({ label, fn, color, desc }) => (
              <motion.button key={label}
                whileHover={{ scale: 1.04, boxShadow: `0 0 25px ${color}50` }}
                whileTap={{ scale: 0.97 }}
                onClick={fn}
                disabled={phase !== "idle" || liveBlocks.length >= 6}
                style={{
                  fontFamily: T.display, fontWeight: 400, fontSize: 14, letterSpacing: 3,
                  color: "#000", background: phase !== "idle" || liveBlocks.length >= 6 ? T.muted : `linear-gradient(135deg, ${color}, ${color}99)`,
                  border: "none", borderRadius: 9, padding: "13px", cursor: "pointer",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                }}
              >
                {label}
                <span style={{ fontFamily: T.mono, fontSize: 8, color: "rgba(0,0,0,0.6)", letterSpacing: 1 }}>{desc}</span>
              </motion.button>
            ))}
          </div>

          {/* Heap visualization */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ fontFamily: T.mono, fontSize: 8, color: T.muted, letterSpacing: 2 }}>
                HEAP — {liveBlocks.length} BLOCKS · {leakedBytes} BYTES ALLOCATED
              </div>
              {leakWarning && (
                <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 0.8, repeat: Infinity }}
                  style={{ fontFamily: T.mono, fontSize: 8, color: T.neon3 }}>⚠ LEAK!</motion.span>
              )}
            </div>
            <div style={{
              minHeight: 140, background: "rgba(0,0,0,0.4)", borderRadius: 12,
              border: `2px solid ${leakWarning ? T.neon3 : T.dim}`,
              padding: "14px", display: "flex", flexWrap: "wrap", gap: 10, alignContent: "flex-start",
              transition: "border-color 0.3s",
            }}>
              <AnimatePresence>
                {liveBlocks.map(block => (
                  <motion.div key={block.id}
                    initial={{ scale: 0, opacity: 0, y: -16 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0, opacity: 0, y: 16 }}
                    transition={{ type: "spring", stiffness: 320, damping: 24 }}
                    whileHover={{ scale: 1.06 }}
                    onClick={() => free_(block.id)}
                    style={{
                      padding: "10px 14px", borderRadius: 10, cursor: "pointer",
                      background: block.zeroed ? `${T.neon}22` : `${T.neon2}1C`,
                      border: `2px solid ${block.zeroed ? T.neon : T.neon2}`,
                      boxShadow: `0 0 16px ${block.zeroed ? T.neon : T.neon2}35`,
                    }}
                  >
                    <div style={{ fontFamily: T.mono, fontSize: 8, color: T.muted, marginBottom: 3 }}>{block.addr}</div>
                    <div style={{ fontFamily: T.mono, fontSize: 14, fontWeight: 700, color: block.zeroed ? T.neon : T.neon2 }}>
                      int[{block.size}]
                    </div>
                    <div style={{ fontFamily: T.mono, fontSize: 8, color: T.muted }}>{block.size * 4}B {block.zeroed ? "· 0-init" : ""}</div>
                    <div style={{ fontFamily: T.mono, fontSize: 8, color: T.neon3, marginTop: 3 }}>click → free()</div>
                  </motion.div>
                ))}
                {liveBlocks.length === 0 && (
                  <div style={{ fontFamily: T.mono, fontSize: 11, color: T.dim, padding: "10px" }}>
                    Heap is empty. Allocate blocks above…
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Log */}
          <div style={{
            background: "rgba(0,0,0,0.5)", borderRadius: 10, border: `1px solid ${T.dim}`,
            padding: "10px 14px", marginBottom: 14, minHeight: 72, maxHeight: 88, overflowY: "auto",
          }}>
            {log.length === 0
              ? <div style={{ fontFamily: T.mono, fontSize: 10, color: T.dim }}>allocator log…</div>
              : log.map(entry => (
                <motion.div key={entry.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                  style={{ fontFamily: T.mono, fontSize: 10, color: entry.color, marginBottom: 2, lineHeight: 1.6 }}>
                  {entry.msg}
                </motion.div>
              ))
            }
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <motion.button whileTap={{ scale: 0.96 }}
              onClick={() => { setLeakWarning(true); addLog("EXIT without free() — memory leak!", T.neon3); addLog(`${leakedBytes} bytes leaked — use Valgrind to detect`, T.neon3); }}
              disabled={liveBlocks.length === 0}
              style={{ flex: 1, fontFamily: T.mono, fontSize: 10, color: T.neon3, background: `${T.neon3}10`, border: `1px solid ${T.neon3}40`, borderRadius: 9, padding: "11px", cursor: "pointer" }}>
              ⚠ SIMULATE EXIT (LEAK)
            </motion.button>
            <motion.button whileTap={{ scale: 0.96 }}
              onClick={() => { setHeapBlocks([]); setLog([]); setLeakWarning(false); setPhase("idle"); }}
              style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, background: "transparent", border: `1px solid ${T.dim}`, borderRadius: 9, padding: "11px 16px", cursor: "pointer" }}>
              ↺ RESET
            </motion.button>
          </div>
        </GlassCard>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <CodeBlock
            code={`#include <stdlib.h>

// malloc — allocate n bytes, UNINITIALIZED
int *arr = malloc(${allocSize} * sizeof(int));

// ALWAYS check for NULL (out of memory)
if (arr == NULL) {
  fprintf(stderr, "malloc failed!\\n");
  return 1;
}

// calloc — allocate AND zero-initialize
int *arr2 = calloc(${allocSize}, sizeof(int));
// all elements guaranteed to be 0

// realloc — resize an existing allocation
arr = realloc(arr, ${allocSize * 2} * sizeof(int));
if (arr == NULL) { /* original freed, handle error */ }

// free — MUST call when done
free(arr);
arr = NULL;   // prevent dangling pointer use

free(arr2);
arr2 = NULL;`}
            highlightLine={liveBlocks.length > 0 ? 3 : 19}
          />
          <InsightBlock title="THE 4 RULES OF HEAP MEMORY" color={T.neon2} icon="∞">
            {"1. "}
            <span style={{ color: T.neon }}>Always check malloc's return for NULL</span>
            {"\n2. Every malloc/calloc must have exactly one matching free()\n3. "}
            <span style={{ color: T.neon3 }}>Never free() the same pointer twice</span>
            {" — double-free is a security vulnerability\n4. Set ptr = NULL after free — prevents accidental use-after-free"}
          </InsightBlock>
          <InsightBlock title="STACK vs HEAP — WHEN TO USE EACH" color={T.neon4} icon="💡">
            <span style={{ color: T.neon }}>Stack:</span>{" automatic, fast, limited (~8MB), freed when function returns\n"}
            <span style={{ color: T.neon2 }}>Heap:</span>{" manual, slower, huge (GBs), lasts as long as you need it\n\n"}
            {"Use stack for: local variables, small arrays, function args\nUse heap for: large data, unknown-size arrays, data that outlives the function that created it"}
          </InsightBlock>
        </div>
      </div>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 08 — MASTER ENGINE
// ─────────────────────────────────────────────────────────────────────────────
const ENGINE_PROGS = [
  {
    name: "PTR + STRUCT",
    color: T.accent,
    lines: [
      "struct Point { int x, y; };",
      "struct Point p = {3, 7};",
      "struct Point *ptr = &p;",
      "ptr->x = 10;",
      "int dist = ptr->x + ptr->y;",
      'printf("%d\\n", dist);',
    ],
    steps: [
      { line: 0, mem: {}, out: "" },
      { line: 1, mem: { "p.x": 3, "p.y": 7 }, out: "" },
      { line: 2, mem: { "p.x": 3, "p.y": 7, ptr: "&p" }, out: "" },
      { line: 3, mem: { "p.x": 10, "p.y": 7, ptr: "&p" }, out: "" },
      { line: 4, mem: { "p.x": 10, "p.y": 7, ptr: "&p", dist: 17 }, out: "" },
      { line: 5, mem: { "p.x": 10, "p.y": 7, dist: 17 }, out: "17" },
    ],
    explain: [
      "Defining struct Point type blueprint",
      "Creating p at some address — p.x=3, p.y=7",
      "ptr holds the address of p (ptr = &p)",
      "ptr→x = (*ptr).x = p.x — modifies to 10",
      "dist = p.x + p.y = 10 + 7 = 17",
      "Output: 17",
    ],
  },
  {
    name: "MALLOC ARRAY",
    color: T.neon2,
    lines: [
      "int n = 5;",
      "int *arr = malloc(n * sizeof(int));",
      "if (!arr) return 1;",
      "for (int i = 0; i < n; i++)",
      "  arr[i] = i * i;",
      'printf("%d\\n", arr[3]);',
      "free(arr); arr = NULL;",
    ],
    steps: [
      { line: 0, mem: { n: 5 }, out: "" },
      { line: 1, mem: { n: 5, arr: "0x8100" }, out: "" },
      { line: 2, mem: { n: 5, arr: "0x8100 ✓" }, out: "" },
      { line: 3, mem: { n: 5, arr: "0x8100", i: "0→4" }, out: "" },
      { line: 4, mem: { n: 5, "arr[0..4]": "0,1,4,9,16" }, out: "" },
      { line: 5, mem: { n: 5, "arr[3]": 9 }, out: "9" },
      { line: 6, mem: { n: 5, arr: "NULL (freed)" }, out: "9" },
    ],
    explain: [
      "n = 5 on the stack",
      "malloc(20 bytes) on the heap → arr points to 0x8100",
      "NULL check — heap can return NULL if out of memory",
      "Loop: i goes from 0 to 4",
      "arr[i] = *(arr+i) = i² → {0, 1, 4, 9, 16}",
      "arr[3] = *(arr+3) = 9",
      "free() returns memory to heap. NULL prevents dangling use.",
    ],
  },
  {
    name: "UNION TRICK",
    color: T.neon4,
    lines: [
      "union { int i; float f; } u;",
      "u.i = 0x3F800000;",
      "// same 4 bytes, read as float:",
      'printf("%.1f\\n", u.f);',
      "// IEEE 754: 0x3F800000 = 1.0f",
      "// sign=0 exp=127 mantissa=0",
    ],
    steps: [
      { line: 0, mem: { "union size": "4 bytes" }, out: "" },
      { line: 1, mem: { "u.i": "0x3F800000", "raw bytes": "00 00 80 3F" }, out: "" },
      { line: 3, mem: { "u.i": "0x3F800000", "u.f": "1.0 (same bytes!)" }, out: "1.0" },
    ],
    explain: [
      "Union: int i and float f share the same 4 bytes",
      "Writing u.i = 0x3F800000 stores 4 bytes on the heap",
      "Reading u.f interprets those same bytes as IEEE 754 float = 1.0",
    ],
  },
];

function EngineSection() {
  const [progIdx, setProgIdx] = useState(0);
  const [step, setStep] = useState(-1);
  const [memory, setMemory] = useState({});
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);
  const runningRef = useRef(false);
  const prog = ENGINE_PROGS[progIdx];

  const reset = () => {
    runningRef.current = false;
    setStep(-1); setMemory({}); setOutput(""); setRunning(false);
  };

  const run = async () => {
    if (runningRef.current) return;
    reset();
    await new Promise(r => setTimeout(r, 80));
    runningRef.current = true;
    setRunning(true);
    for (let i = 0; i < prog.steps.length; i++) {
      if (!runningRef.current) break;
      const s = prog.steps[i];
      setStep(s.line);
      setMemory({ ...s.mem });
      if (s.out) setOutput(s.out);
      await new Promise(r => setTimeout(r, 900));
    }
    setStep(-1);
    setRunning(false);
    runningRef.current = false;
  };

  const currentExplain = step >= 0 && prog.explain[step] ? prog.explain[step] : null;

  return (
    <Section id="engine">
      <SectionHeader num="08" tag="MASTER ENGINE · FULL SIMULATION" title="C CHAPTER 5 ENGINE" subtitle="Step-by-step execution of programs combining pointers, structs, unions, and heap memory together." />

      <div style={{ display: "flex", gap: 10, marginBottom: 30, flexWrap: "wrap" }}>
        {ENGINE_PROGS.map((p, i) => (
          <Pill key={p.name} color={p.color} active={progIdx === i}
            onClick={() => { setProgIdx(i); reset(); }}>
            {p.name}
          </Pill>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
        {/* Code editor */}
        <GlassCard style={{ overflow: "hidden" }}>
          <div style={{
            background: "rgba(0,0,0,0.45)", borderBottom: `1px solid ${T.dim}`,
            padding: "12px 18px", display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <motion.div
                animate={{ background: running ? prog.color : T.muted, boxShadow: running ? `0 0 14px ${prog.color}` : "none" }}
                style={{ width: 8, height: 8, borderRadius: "50%" }}
              />
              <span style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, letterSpacing: 1 }}>
                {prog.name.toLowerCase().replace(/ /g, "_")}.c
              </span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <motion.button whileTap={{ scale: 0.95 }} onClick={run} disabled={running}
                style={{
                  fontFamily: T.display, fontWeight: 400, fontSize: 12, letterSpacing: 3,
                  color: "#000", background: running ? T.muted : prog.color,
                  border: "none", borderRadius: 6, padding: "7px 18px", cursor: running ? "not-allowed" : "pointer",
                }}>
                {running ? "RUNNING…" : "▶ RUN"}
              </motion.button>
              <motion.button whileTap={{ scale: 0.95 }} onClick={reset}
                style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, background: "transparent", border: `1px solid ${T.dim}`, borderRadius: 6, padding: "7px 14px", cursor: "pointer" }}>
                RESET
              </motion.button>
            </div>
          </div>
          <div style={{ padding: "14px 0" }}>
            {prog.lines.map((line, i) => {
              const isActive = step === i;
              return (
                <motion.div key={i}
                  animate={{ background: isActive ? `${prog.color}18` : "transparent", paddingLeft: isActive ? 22 : 16 }}
                  style={{ display: "flex", alignItems: "center", paddingRight: 16, paddingTop: 4, paddingBottom: 4, borderLeft: `3px solid ${isActive ? prog.color : "transparent"}`, transition: "border-color 0.2s" }}
                >
                  <span style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, minWidth: 26, textAlign: "right", marginRight: 16, userSelect: "none" }}>{i + 1}</span>
                  <span style={{ fontFamily: T.mono, fontSize: 12.5, color: isActive ? prog.color : T.text, whiteSpace: "pre", flex: 1 }}>{line}</span>
                  {isActive && (
                    <motion.span animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 0.5, repeat: Infinity }}
                      style={{ fontFamily: T.mono, fontSize: 8, color: prog.color, letterSpacing: 2, marginLeft: 8 }}>◀ EXEC</motion.span>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Explanation */}
          <div style={{ padding: "12px 18px", borderTop: `1px solid ${T.dim}`, minHeight: 46 }}>
            <AnimatePresence mode="wait">
              {currentExplain && (
                <motion.div key={step} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{ fontFamily: T.mono, fontSize: 11, color: prog.color, lineHeight: 1.7 }}>
                  → {currentExplain}
                </motion.div>
              )}
              {!currentExplain && (
                <div style={{ fontFamily: T.mono, fontSize: 10, color: T.muted }}>
                  {running ? "executing…" : "press ▶ RUN to step through"}
                </div>
              )}
            </AnimatePresence>
          </div>
        </GlassCard>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Memory state */}
          <GlassCard style={{ padding: 0, overflow: "hidden", flex: 1 }}>
            <div style={{ background: "rgba(0,0,0,0.4)", borderBottom: `1px solid ${T.dim}`, padding: "12px 18px", fontFamily: T.mono, fontSize: 8, letterSpacing: 3, color: T.neon2 }}>
              MEMORY STATE
            </div>
            <div style={{ padding: "18px", minHeight: 130 }}>
              <AnimatePresence>
                {Object.keys(memory).length === 0
                  ? <div style={{ fontFamily: T.mono, fontSize: 11, color: T.muted }}>No variables yet…</div>
                  : Object.entries(memory).map(([k, v]) => (
                    <motion.div key={k} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                      style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: T.mono, fontSize: 12, marginBottom: 12 }}>
                      <span style={{ color: T.neon2, minWidth: 85 }}>{k}</span>
                      <motion.div key={String(v)} initial={{ scale: 1.4, color: prog.color }} animate={{ scale: 1, color: T.text }}
                        style={{ background: `${prog.color}18`, border: `1px solid ${prog.color}40`, borderRadius: 6, padding: "4px 14px", fontWeight: 700, fontFamily: T.mono, fontSize: 11.5 }}>
                        {String(v)}
                      </motion.div>
                    </motion.div>
                  ))
                }
              </AnimatePresence>
            </div>
          </GlassCard>

          {/* Output */}
          <GlassCard style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ background: "rgba(0,0,0,0.4)", borderBottom: `1px solid ${T.dim}`, padding: "12px 18px", fontFamily: T.mono, fontSize: 8, letterSpacing: 3, color: T.neon3 }}>
              TERMINAL OUTPUT
            </div>
            <div style={{ padding: "16px 18px", minHeight: 60 }}>
              {output ? (
                <motion.pre initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  style={{ fontFamily: T.mono, fontSize: 18, color: T.neon4, lineHeight: 1.8 }}>
                  {output}
                </motion.pre>
              ) : (
                <span style={{ fontFamily: T.mono, fontSize: 11, color: T.muted }}>
                  {running ? "executing…" : "press ▶ RUN"}
                </span>
              )}
            </div>
          </GlassCard>

          {/* Quick reference */}
          <GlassCard style={{ padding: 20 }}>
            <div style={{ fontFamily: T.mono, fontSize: 8, color: T.neon, letterSpacing: 3, marginBottom: 14 }}>
              CHAPTER 5 QUICK REFERENCE
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[
                { op: "int *p = &x", desc: "pointer to x" },
                { op: "*p", desc: "dereference" },
                { op: "p->field", desc: "(*p).field" },
                { op: "arr[i]", desc: "*(arr+i)" },
                { op: "malloc(n)", desc: "heap alloc" },
                { op: "free(p)", desc: "return heap" },
                { op: "#define X 1", desc: "macro const" },
                { op: "union { }", desc: "shared mem" },
              ].map(({ op, desc }) => (
                <div key={op} style={{ padding: "7px 10px", borderRadius: 7, background: `${T.neon}08`, border: `1px solid ${T.neon}18` }}>
                  <div style={{ fontFamily: T.mono, fontSize: 10, fontWeight: 700, color: T.neon }}>{op}</div>
                  <div style={{ fontFamily: T.mono, fontSize: 8, color: T.muted, marginTop: 2 }}>{desc}</div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HERO SECTION
// ─────────────────────────────────────────────────────────────────────────────
function HeroSection() {
  const [phase, setPhase] = useState(0);
  const phases = [
    "pointers hold addresses, not values",
    "malloc gives you heap memory — you must free it",
    "structs pack related data, unions share memory",
    "#define transforms source before compilation",
    "arr[i] and *(arr+i) compile to the same thing",
  ];

  useEffect(() => {
    const iv = setInterval(() => setPhase(p => (p + 1) % phases.length), 2800);
    return () => clearInterval(iv);
  }, []);

  const TOPICS = [
    { label: "Pointers",        icon: "→",  color: T.neon },
    { label: "& Address-of",    icon: "&",  color: T.neon2 },
    { label: "* Dereference",   icon: "*",  color: T.neon3 },
    { label: "Ptr + Arrays",    icon: "⧖", color: T.neon4 },
    { label: "Structs",         icon: "⬡", color: T.accent },
    { label: "Unions",          icon: "◎", color: T.neon },
    { label: "#include",        icon: "#",  color: T.neon2 },
    { label: "#define",         icon: "#",  color: T.neon4 },
    { label: "malloc / calloc", icon: "∞",  color: T.accent },
    { label: "free()",          icon: "✕",  color: T.neon3 },
  ];

  return (
    <section id="hero" style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden",
      background: `
        radial-gradient(ellipse 80% 50% at 50% -5%, rgba(255,100,0,0.10) 0%, transparent 60%),
        radial-gradient(ellipse 50% 35% at 85% 75%, rgba(168,85,247,0.08) 0%, transparent 55%),
        radial-gradient(ellipse 35% 25% at 10% 85%, rgba(0,212,255,0.06) 0%, transparent 55%),
        ${T.bg}
      `,
    }}>
      {/* Animated grid background */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 0,
        backgroundImage: `
          linear-gradient(rgba(255,100,0,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,100,0,0.04) 1px, transparent 1px)
        `,
        backgroundSize: "48px 48px",
      }} />

      {/* Scanlines */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
        backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,100,0,0.015) 2px, rgba(255,100,0,0.015) 4px)",
      }} />

      {/* Floating code snippets background decoration */}
      {["int *p = &x;", "*ptr = 42;", "malloc(n)", "free(ptr);", "ptr->name", "arr[i]", "#define", "struct {}", "union { }"].map((snip, i) => (
        <motion.div key={i}
          animate={{ y: [0, -12, 0], opacity: [0.04, 0.09, 0.04] }}
          transition={{ duration: 4 + i * 0.7, repeat: Infinity, delay: i * 0.4 }}
          style={{
            position: "absolute", zIndex: 1,
            left: `${8 + (i * 11) % 88}%`, top: `${10 + (i * 17) % 80}%`,
            fontFamily: T.mono, fontSize: 11, color: T.neon,
            transform: `rotate(${-15 + i * 7}deg)`,
            pointerEvents: "none", userSelect: "none",
          }}
        >{snip}</motion.div>
      ))}

      <div style={{ position: "relative", zIndex: 10, textAlign: "center", maxWidth: 960, padding: "0 28px" }}>
        {/* Badge */}
        <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            fontFamily: T.mono, fontSize: 9, letterSpacing: 5, color: T.neon,
            border: `1px solid ${T.border}`, background: "rgba(255,100,0,0.06)",
            padding: "8px 24px", borderRadius: 100, marginBottom: 32,
          }}>
          <motion.span animate={{ opacity: [1, 0.1, 1], scale: [1, 0.6, 1] }} transition={{ duration: 1.1, repeat: Infinity }}
            style={{ width: 5, height: 5, borderRadius: "50%", background: T.neon, display: "inline-block" }} />
          C LANGUAGE · CHAPTER 5 · INTERACTIVE ENGINE
        </motion.div>

        {/* Title */}
        <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontFamily: T.display, fontWeight: 400,
            fontSize: "clamp(52px, 9vw, 110px)",
            lineHeight: 0.88, letterSpacing: 6, color: T.text, marginBottom: 24,
          }}>
          C
          <br />
          <motion.span
            animate={{ textShadow: [`0 0 55px ${T.neon}90`, `0 0 90px ${T.neon}B0`, `0 0 55px ${T.neon}90`] }}
            transition={{ duration: 2.4, repeat: Infinity }}
            style={{ color: T.neon }}>
            CHAPTER 5
          </motion.span>
          <br />
          <span style={{ color: T.muted, fontSize: "0.25em", letterSpacing: 9, fontFamily: T.mono }}>
            POINTERS · STRUCTS · UNIONS · PREPROCESSOR · DYNAMIC MEMORY
          </span>
        </motion.h1>

        {/* Rotating tagline */}
        <div style={{ height: 32, marginBottom: 36, overflow: "hidden" }}>
          <AnimatePresence mode="wait">
            <motion.p key={phase} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.32 }}
              style={{ fontFamily: T.mono, fontSize: 13, color: T.neon2, letterSpacing: 1 }}>
              → {phases[phase]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Topic pills */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}
          style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 9, marginBottom: 48 }}>
          {TOPICS.map((t, i) => (
            <motion.div key={t.label}
              initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.65 + i * 0.06, type: "spring", stiffness: 280 }}
              whileHover={{ y: -5, boxShadow: `0 12px 36px ${t.color}50` }}
              style={{
                padding: "9px 20px", borderRadius: 8,
                background: `${t.color}10`, border: `1px solid ${t.color}35`,
                fontFamily: T.mono, fontSize: 10, color: t.color,
                display: "flex", alignItems: "center", gap: 8,
                transition: "box-shadow 0.2s",
              }}>
              <span style={{ fontSize: 13 }}>{t.icon}</span> {t.label}
            </motion.div>
          ))}
        </motion.div>

        <motion.button initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }}
          whileHover={{ scale: 1.07, boxShadow: `0 0 60px ${T.neon}70` }}
          whileTap={{ scale: 0.96 }}
          onClick={() => document.getElementById("pointers")?.scrollIntoView({ behavior: "smooth" })}
          style={{
            fontFamily: T.display, fontWeight: 400, fontSize: 15, letterSpacing: 6,
            color: "#000", background: `linear-gradient(135deg, ${T.neon}, ${T.neon2})`,
            border: "none", borderRadius: 9, padding: "17px 54px", cursor: "pointer",
          }}>
          ENTER THE ENGINE
        </motion.button>
      </div>

      <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 2.4, repeat: Infinity }}
        style={{ position: "absolute", bottom: 32, zIndex: 10, fontFamily: T.mono, fontSize: 8, letterSpacing: 6, color: T.muted }}>
        SCROLL DOWN ↓
      </motion.div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PREV / NEXT PAGINATION FOOTER
// ─────────────────────────────────────────────────────────────────────────────
function PaginationFooter() {
  return (
    <div style={{
      padding: "60px 0 80px",
      display: "flex", alignItems: "center", justifyContent: "center", gap: 24,
    }}>
      {/* PREV */}
      <motion.a
        href="/c-4"
        whileHover={{ scale: 1.03, boxShadow: `0 0 40px ${T.neon}30` }}
        whileTap={{ scale: 0.97 }}
        style={{
          display: "flex", alignItems: "center", gap: 18, textDecoration: "none",
          padding: "22px 32px", borderRadius: 14,
          background: T.glass, border: `1px solid ${T.border}`,
          backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
          boxShadow: "0 4px 40px rgba(0,0,0,0.5)",
          cursor: "pointer", minWidth: 220,
        }}
      >
        <motion.span
          animate={{ x: [0, -4, 0] }}
          transition={{ duration: 1.8, repeat: Infinity }}
          style={{ fontSize: 22, color: T.neon }}
        >←</motion.span>
        <div>
          <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 4, color: T.muted, marginBottom: 4 }}>PREVIOUS</div>
          <div style={{ fontFamily: T.display, fontSize: 20, fontWeight: 400, color: T.text, letterSpacing: 3 }}>CHAPTER 4</div>
          <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, marginTop: 2 }}>Functions & Scope</div>
        </div>
      </motion.a>

      {/* Chapter indicator */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "0 8px" }}>
        <div style={{ display: "flex", gap: 6 }}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
            <motion.div key={n}
              animate={{
                background: n === 5 ? T.neon : `${T.muted}50`,
                width: n === 5 ? 24 : 8,
                boxShadow: n === 5 ? `0 0 10px ${T.neon}70` : "none",
              }}
              style={{ height: 8, borderRadius: 4 }}
            />
          ))}
        </div>
        <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, letterSpacing: 3 }}>
          CH. 5 / 8
        </div>
      </div>

      {/* NEXT */}
      <motion.a
        href="/c-6"
        whileHover={{ scale: 1.03, boxShadow: `0 0 40px ${T.neon2}30` }}
        whileTap={{ scale: 0.97 }}
        style={{
          display: "flex", alignItems: "center", gap: 18, textDecoration: "none",
          padding: "22px 32px", borderRadius: 14,
          background: T.glass, border: `1px solid rgba(0,212,255,0.12)`,
          backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
          boxShadow: "0 4px 40px rgba(0,0,0,0.5)",
          cursor: "pointer", minWidth: 220, justifyContent: "flex-end",
        }}
      >
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 4, color: T.muted, marginBottom: 4 }}>NEXT</div>
          <div style={{ fontFamily: T.display, fontSize: 20, fontWeight: 400, color: T.text, letterSpacing: 3 }}>CHAPTER 6</div>
          <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, marginTop: 2 }}>File I/O & Strings</div>
        </div>
        <motion.span
          animate={{ x: [0, 4, 0] }}
          transition={{ duration: 1.8, repeat: Infinity }}
          style={{ fontSize: 22, color: T.neon2 }}
        >→</motion.span>
      </motion.a>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SIDEBAR
// ─────────────────────────────────────────────────────────────────────────────
function Sidebar({ activeSection }) {
  return (
    <aside style={{
      width: 220, minWidth: 220, flexShrink: 0,
      background: `linear-gradient(180deg, ${T.bg1} 0%, ${T.bg} 100%)`,
      borderRight: `1px solid ${T.dim}`,
      display: "flex", flexDirection: "column",
      padding: "28px 0", position: "sticky", top: 0, height: "100vh", overflow: "hidden",
    }}>
      <div style={{ padding: "0 20px 22px" }}>
        <div style={{ fontFamily: T.display, fontWeight: 400, fontSize: 20, letterSpacing: 4, color: T.neon }}>C LANG</div>
        <div style={{ fontFamily: T.mono, fontSize: 7, letterSpacing: 4, color: T.muted, marginTop: 3 }}>CHAPTER 5 · INTERACTIVE ENGINE</div>
      </div>
      <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${T.neon}40, transparent)`, marginBottom: 14 }} />
      <nav style={{ overflowY: "auto", flex: 1 }}>
        {NAV_ITEMS.map(item => {
          const isActive = activeSection === item.id;
          return (
            <motion.a key={item.id} href={`#${item.id}`}
              onClick={e => { e.preventDefault(); document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" }); }}
              animate={{ color: isActive ? T.neon : T.muted, background: isActive ? `${T.neon}08` : "transparent" }}
              whileHover={{ color: T.text, paddingLeft: 28 }}
              transition={{ duration: 0.18 }}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "11px 20px", fontFamily: T.mono, fontSize: 10,
                fontWeight: 600, letterSpacing: 1.5, textDecoration: "none",
                borderLeft: `2px solid ${isActive ? T.neon : "transparent"}`,
              }}
            >
              <span style={{ fontSize: 12, opacity: 0.8 }}>{item.icon}</span>
              <div>
                <div style={{ fontSize: 7, opacity: 0.4, marginBottom: 1, letterSpacing: 2 }}>{item.num}</div>
                {item.label}
              </div>
              {isActive && (
                <motion.div layoutId="nav-dot"
                  style={{ width: 4, height: 4, borderRadius: "50%", background: T.neon, marginLeft: "auto", boxShadow: `0 0 8px ${T.neon}` }} />
              )}
            </motion.a>
          );
        })}
      </nav>

      {/* Prev/Next mini in sidebar */}
      <div style={{ padding: "16px 20px", borderTop: `1px solid ${T.dim}`, display: "flex", gap: 8 }}>
        {[{ href: "/c-4", label: "← C4" }, { href: "/c-6", label: "C6 →" }].map(link => (
          <motion.a key={link.href} href={link.href} whileHover={{ color: T.neon }}
            style={{
              flex: 1, textAlign: "center", padding: "8px", borderRadius: 7,
              background: "transparent", border: `1px solid ${T.dim}`,
              fontFamily: T.mono, fontSize: 9, color: T.muted, textDecoration: "none",
            }}>
            {link.label}
          </motion.a>
        ))}
      </div>

      <div style={{ padding: "10px 20px 0", fontFamily: T.mono, fontSize: 8, color: T.dim, letterSpacing: 2, lineHeight: 2 }}>
        C VISUAL SIM v5.0
      </div>
    </aside>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RIGHT PANEL
// ─────────────────────────────────────────────────────────────────────────────
const DEEP = {
  hero:         { title: "Chapter 5",    color: T.neon,   why: "Pointers, structs and dynamic memory are what make C powerful and dangerous. Master these and you understand how every high-level language works at the machine level.", mistake: "Treating pointers as magic. They are just integers that hold addresses. Once you demystify them, everything clicks.", model: "Every variable is a named box at a known address. A pointer is a sticky note with that box's address written on it." },
  pointers:     { title: "Pointers",     color: T.neon,   why: "Pointers let you pass large structs by reference instead of copying, build dynamic data structures (linked lists, trees), and interact with hardware registers directly.", mistake: "int *p; *p = 5; — p is uninitialized. It contains garbage. Writing to it is undefined behavior and will likely crash.", model: "'int *p' means: p is a variable whose value is an address of an int. That's the complete mental model." },
  "addr-deref": { title: "& and *",      color: T.neon2,  why: "& and * are the only two ways to bridge between values and addresses. Everything else (array indexing, arrow operator) is built on these two primitives.", mistake: "Confusing *p in a declaration (type annotation: 'p is a pointer') vs *p in an expression (operator: 'dereference p').", model: "& goes UP the abstraction ladder (value → address). * goes DOWN (address → value). They are perfect inverses." },
  "ptr-arrays": { title: "Ptr + Arrays", color: T.neon4,  why: "Understanding that arr[i] compiles to *(arr+i) lets you reason about memory, pass arrays to functions correctly, and understand buffer overflows.", mistake: "Assuming sizeof(ptr) gives the array size. sizeof(ptr) = 8. Once an array decays to a pointer, its size is lost forever.", model: "An array name is a pointer that cannot be reassigned. That is the only difference between int arr[5] and int *ptr." },
  structs:      { title: "Structs",      color: T.accent, why: "Structs let you create compound types. They are the building block of every complex data structure: linked lists, trees, queues, hash maps.", mistake: "Comparing structs with == — it does not work in C. You must compare field by field. C has no operator overloading.", model: "A struct is a blueprint. Declaring 'struct Point p' builds an instance from that blueprint at a fixed memory address." },
  unions:       { title: "Unions",       color: T.neon3,  why: "Unions save memory when only one member is active at a time. They enable type punning — interpreting raw bytes as different types — critical for embedded and network code.", mistake: "Writing one member and reading another is 'type punning'. Valid in C99 via union, but undefined behavior in C++ without memcpy.", model: "A union is one box with multiple labels. Writing through any label puts data in the same bytes; reading through another label reinterprets those bytes." },
  preproc:      { title: "Preprocessor", color: T.neon2,  why: "The preprocessor enables code reuse (#include), named constants (#define), and platform/build-specific code (#ifdef). It runs before any type-checking occurs.", mistake: "#define MAX(a,b) a>b?a:b — missing parentheses causes operator precedence bugs that are extremely hard to debug.", model: "The preprocessor is a smart find-and-replace that runs before the compiler. It knows nothing about types or scope." },
  dynmem:       { title: "Dyn Memory",   color: T.neon2,  why: "Dynamic memory is the only way to allocate arrays whose size is unknown at compile time, or data that must outlive the function that created it.", mistake: "Calling malloc without free = memory leak. Calling free twice = double-free (security vulnerability). Both are silent in small programs.", model: "Stack manages itself. Heap is your responsibility. Think of malloc as checking out a library book — you must return it." },
  engine:       { title: "Full Engine",  color: T.neon,   why: "Real C programs combine all these: structs of pointers to heap-allocated arrays, processed by macros, in functions that handle their own memory. This engine shows all that at once.", mistake: "After learning pointers, beginners overuse them. Prefer value semantics when the data is small. Pointers introduce indirection and bugs.", model: "Master C chapter 5 and you will understand how Python objects, Rust borrows, Go slices, and C++ references actually work in memory." },
};

function RightPanel({ activeSection }) {
  const data = DEEP[activeSection] || DEEP.hero;
  const [liveTime, setLiveTime] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setLiveTime(t => t + 1), 1000);
    return () => clearInterval(iv);
  }, []);

  return (
    <aside style={{
      width: 290, minWidth: 290, flexShrink: 0,
      background: `linear-gradient(180deg, ${T.bg1} 0%, ${T.bg} 100%)`,
      borderLeft: `1px solid ${T.dim}`,
      padding: "28px 16px",
      display: "flex", flexDirection: "column", gap: 14,
      overflowY: "auto", overflowX: "hidden",
      position: "sticky", top: 0, height: "100vh",
    }}>
      <div>
        <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 5, color: T.neon, marginBottom: 10 }}>DEEP UNDERSTANDING</div>
        <div style={{ height: 1, background: `linear-gradient(90deg, ${T.neon}40, transparent)` }} />
      </div>

      {/* Live stats */}
      <div style={{ background: `${T.neon}05`, border: `1px solid ${T.neon}18`, borderRadius: 10, padding: "12px 14px" }}>
        <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 4, color: T.neon, marginBottom: 10 }}>⚙ LIVE STATUS</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[
            { label: "SECTION", value: (activeSection || "hero").toUpperCase().slice(0, 8), color: data.color },
            { label: "UPTIME",  value: `${liveTime}s`, color: T.neon2 },
            { label: "TOPICS",  value: "8",          color: T.neon4 },
            { label: "ENGINE",  value: "LIVE",       color: T.neon },
          ].map(({ label, value, color }) => (
            <div key={label}>
              <div style={{ fontFamily: T.mono, fontSize: 7, letterSpacing: 2, color: T.muted, marginBottom: 2 }}>{label}</div>
              <motion.div key={value} initial={{ opacity: 0.4 }} animate={{ opacity: 1 }}
                style={{ fontFamily: T.mono, fontSize: 13, fontWeight: 700, color }}>{value}</motion.div>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeSection} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.28 }}
          style={{ display: "flex", flexDirection: "column", gap: 12 }}>

          <div style={{ padding: "13px 16px", borderRadius: 11, background: `${data.color}10`, border: `1px solid ${data.color}35` }}>
            <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 3, color: data.color, marginBottom: 5 }}>CURRENT TOPIC</div>
            <div style={{ fontFamily: T.display, fontSize: 22, fontWeight: 400, letterSpacing: 3, color: data.color }}>{data.title}</div>
          </div>

          <div style={{ padding: "15px 16px", borderRadius: 11, background: "rgba(255,255,255,0.02)", border: `1px solid ${T.dim}` }}>
            <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 3, color: T.neon, marginBottom: 9 }}>💡 WHY THIS MATTERS</div>
            <div style={{ fontFamily: T.mono, fontSize: 11, color: T.text, lineHeight: 1.9 }}>{data.why}</div>
          </div>

          <div style={{ padding: "15px 16px", borderRadius: 11, background: `${T.neon3}08`, border: `1px solid ${T.neon3}25` }}>
            <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 3, color: T.neon3, marginBottom: 9 }}>⚠ COMMON MISTAKE</div>
            <div style={{ fontFamily: T.mono, fontSize: 11, color: T.text, lineHeight: 1.9 }}>{data.mistake}</div>
          </div>

          <div style={{ padding: "15px 16px", borderRadius: 11, background: `${data.color}08`, border: `1px solid ${data.color}22` }}>
            <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 3, color: data.color, marginBottom: 9 }}>🧠 MENTAL MODEL</div>
            <div style={{ fontFamily: T.mono, fontSize: 11, color: T.text, lineHeight: 1.9, fontStyle: "italic" }}>"{data.model}"</div>
          </div>
        </motion.div>
      </AnimatePresence>
    </aside>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ROOT PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function C5Page() {
  const [activeSection, setActiveSection] = useState("hero");

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setActiveSection(e.target.id); }),
      { threshold: 0.2, rootMargin: "-10% 0px -10% 0px" }
    );
    NAV_ITEMS.forEach(item => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Fira+Code:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: ${T.bg}; color: ${T.text}; overflow-x: hidden; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: ${T.bg}; }
        ::-webkit-scrollbar-thumb { background: ${T.neon}; border-radius: 2px; }
        input[type=range] { height: 4px; cursor: pointer; border-radius: 2px; }
        a { text-decoration: none; }
        button { outline: none; }
      `}</style>

      <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: T.bg }}>
        <Sidebar activeSection={activeSection} />

        <main style={{ flex: 1, overflowY: "auto", overflowX: "hidden", minWidth: 0 }}>
          <div style={{ maxWidth: "100%", padding: "0 40px" }}>
            <HeroSection />
            <PointersSection />
            <AddrDerefSection />
            <PtrArraysSection />
            <StructsSection />
            <UnionsSection />
            <PreprocessorSection />
            <DynMemSection />
            <EngineSection />
            <PaginationFooter />
          </div>
        </main>

        <RightPanel activeSection={activeSection} />
      </div>
    </>
  );
}