"use client";

import {
  useState, useEffect, useRef, useCallback, useMemo,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN TOKENS — darker, more electric than C4
// ─────────────────────────────────────────────────────────────────────────────
const T = {
  bg:      "#020509",
  bg1:     "#050A12",
  bg2:     "#08111F",
  glass:   "rgba(5,12,25,0.82)",
  border:  "rgba(255,100,0,0.10)",
  neon:    "#FF6400",
  neon2:   "#00E5FF",
  neon3:   "#FF2D6B",
  neon4:   "#B4FF00",
  accent:  "#A855F7",
  text:    "#E8ECF4",
  muted:   "#3A506B",
  dim:     "#111D2A",
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
// SHARED COMPONENTS (minimal text, visual-first)
// ─────────────────────────────────────────────────────────────────────────────
function GlassCard({ children, style = {}, hover = true, glowColor = T.neon, onClick }) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={hover ? {
        scale: 1.003,
        borderColor: `${glowColor}50`,
        boxShadow: `0 8px 60px rgba(0,0,0,0.7), 0 0 30px ${glowColor}15`,
      } : {}}
      transition={{ type: "spring", stiffness: 280, damping: 28 }}
      style={{
        background: T.glass,
        border: `1px solid ${T.border}`,
        borderRadius: 14,
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        boxShadow: "0 4px 50px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.03)",
        ...style,
      }}
    >{children}</motion.div>
  );
}

function Section({ id, children, style = {} }) {
  return (
    <section id={id} style={{ padding: "72px 0", borderBottom: `1px solid ${T.dim}`, ...style }}>
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
      style={{ display: "flex", alignItems: "flex-end", gap: 20, marginBottom: 40 }}
    >
      <motion.span
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        style={{ fontFamily: T.mono, fontSize: 56, fontWeight: 700, color: T.dim, lineHeight: 1, letterSpacing: -2 }}
      >{num}</motion.span>
      <div>
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: "100%" }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 5, color: T.neon, fontWeight: 600, marginBottom: 5, overflow: "hidden", whiteSpace: "nowrap" }}
        >{tag}</motion.div>
        <h2 style={{ fontFamily: T.display, fontSize: 36, fontWeight: 400, color: T.text, letterSpacing: 3, lineHeight: 1 }}>{title}</h2>
        {subtitle && <p style={{ fontFamily: T.mono, fontSize: 11, color: T.muted, marginTop: 6 }}>{subtitle}</p>}
      </div>
    </motion.div>
  );
}

function CodeBlock({ code, highlightLine = -1, style = {} }) {
  const lines = (code || "").split("\n");
  return (
    <div style={{
      background: "rgba(0,0,0,0.55)", borderRadius: 12,
      border: `1px solid ${T.dim}`, overflow: "hidden", ...style,
    }}>
      <div style={{ padding: "8px 14px", borderBottom: `1px solid ${T.dim}`, display: "flex", gap: 6, alignItems: "center" }}>
        {["#FF5F57", "#FEBC2E", "#28C840"].map((c, i) => (
          <div key={i} style={{ width: 9, height: 9, borderRadius: "50%", background: c }} />
        ))}
        <span style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, marginLeft: 8, letterSpacing: 2 }}>main.c</span>
      </div>
      <div style={{ padding: "14px 0", overflowX: "auto" }}>
        {lines.map((line, i) => (
          <motion.div
            key={i}
            animate={{ background: highlightLine === i ? `${T.neon}1A` : "transparent" }}
            style={{
              fontFamily: T.mono, fontSize: 12, lineHeight: 2,
              paddingLeft: highlightLine === i ? 22 : 18, paddingRight: 18,
              borderLeft: `3px solid ${highlightLine === i ? T.neon : "transparent"}`,
              color: highlightLine === i ? T.neon : T.text,
              transition: "all 0.25s",
              whiteSpace: "pre",
            }}
          >
            <span style={{ color: T.dim, marginRight: 16, fontSize: 9, userSelect: "none" }}>{String(i + 1).padStart(2, " ")}</span>
            {line}
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
        borderRadius: 6, padding: "7px 16px", cursor: "pointer",
        transition: "all 0.18s",
        boxShadow: active ? `0 0 20px ${color}50` : "none",
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
      style={{ padding: "16px", borderRadius: 12, background: `${color}08`, border: `1px solid ${color}28` }}
    >
      <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 4, color, marginBottom: 10 }}>
        {icon} {title}
      </div>
      <div style={{ fontFamily: T.mono, fontSize: 11, color: T.text, lineHeight: 1.9 }}>{children}</div>
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
        borderRadius: 5, padding: "2px 8px", display: "inline-block",
      }}
    >{addr}</motion.span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 01 — POINTERS INTRO (visual heavy)
// ─────────────────────────────────────────────────────────────────────────────
function PointersSection() {
  const [activeCell, setActiveCell] = useState(null);
  const [showPointer, setShowPointer] = useState(false);
  const [animPhase, setAnimPhase] = useState(0);

  const memCells = [
    { addr: "0x1000", label: "x", value: 42, type: "int" },
    { addr: "0x1004", label: "y", value: 99, type: "int" },
    { addr: "0x1008", label: "ptr", value: "0x1000", type: "int*", isPointer: true },
    { addr: "0x100C", label: "z", value: 7, type: "int" },
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

  return (
    <Section id="pointers">
      <SectionHeader num="01" tag="POINTERS" title="ADDRESS MACHINE" subtitle="" />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <GlassCard style={{ padding: 30, glowColor: T.neon }}>
          <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 4, color: T.neon, marginBottom: 24 }}>
            → MEMORY LAYOUT
          </div>

          <div style={{ position: "relative", marginBottom: 28 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {memCells.map((cell, i) => {
                const isTarget = cell.isPointer && showPointer;
                const isPointedAt = cell.addr === "0x1000" && showPointer;
                return (
                  <motion.div
                    key={i}
                    initial={{ x: -30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.1, type: "spring", stiffness: 220 }}
                    whileHover={{ x: 4 }}
                    onClick={() => setActiveCell(activeCell === i ? null : i)}
                    style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}
                  >
                    <div style={{
                      width: 72, fontFamily: T.mono, fontSize: 9, color: T.muted,
                      textAlign: "right", letterSpacing: 1,
                    }}>{cell.addr}</div>

                    <motion.div
                      animate={{
                        borderColor: isPointedAt ? T.neon : isTarget ? T.neon2 : activeCell === i ? T.neon4 : `${T.neon}20`,
                        background: isPointedAt ? `${T.neon}18` : isTarget ? `${T.neon2}12` : `${T.neon}06`,
                        boxShadow: isPointedAt ? `0 0 25px ${T.neon}60` : isTarget ? `0 0 20px ${T.neon2}40` : "none",
                      }}
                      style={{
                        flex: 1, height: 52, borderRadius: 8, border: "2px solid",
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "0 16px",
                      }}
                    >
                      <span style={{ fontFamily: T.mono, fontSize: 10, color: T.muted }}>{cell.type} {cell.label}</span>
                      <motion.span
                        key={String(cell.value)}
                        animate={isPointedAt ? {
                          textShadow: [`0 0 10px ${T.neon}`, `0 0 25px ${T.neon}`, `0 0 10px ${T.neon}`],
                        } : {}}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        style={{
                          fontFamily: T.mono, fontSize: 16, fontWeight: 700,
                          color: isPointedAt ? T.neon : isTarget ? T.neon2 : T.text,
                        }}
                      >{String(cell.value)}</motion.span>
                    </motion.div>

                    <div style={{ width: 36, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {cell.isPointer && showPointer && (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          style={{ fontFamily: T.mono, fontSize: 18, color: T.neon }}
                        >→</motion.div>
                      )}
                      {isPointedAt && showPointer && (
                        <motion.div
                          animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
                          transition={{ duration: 1.2, repeat: Infinity }}
                          style={{ width: 10, height: 10, borderRadius: "50%", background: T.neon, boxShadow: `0 0 12px ${T.neon}` }}
                        />
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <AnimatePresence>
              {showPointer && (
                <motion.svg
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none" }}
                  viewBox="0 0 400 220"
                >
                  <motion.path
                    d="M 340 140 C 390 140 390 20 340 20"
                    fill="none"
                    stroke={T.neon}
                    strokeWidth="2"
                    strokeDasharray="6 4"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                  <motion.circle cx="340" cy="20" r="5" fill={T.neon}
                    animate={{ r: [4, 7, 4] }} transition={{ duration: 1.5, repeat: Infinity }} />
                </motion.svg>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={animPhase}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                padding: "12px 16px", borderRadius: 10, marginBottom: 16,
                background: `${T.neon}0C`, border: `1px solid ${T.neon}30`,
                fontFamily: T.mono, fontSize: 11, color: T.text, lineHeight: 1.75,
              }}
            >
              {animPhase === 0 && "int x = 42 @ 0x1000. Press SHOW."}
              {animPhase === 1 && "int *ptr = &x — stores address."}
              {animPhase === 2 && "ptr = 0x1000 → points to x."}
              {animPhase === 3 && <span>*ptr dereferences → <strong style={{ color: T.neon }}>42</strong></span>}
              {animPhase === 4 && "Pointer = address, * = follow."}
            </motion.div>
          </AnimatePresence>

          <div style={{ height: 20 }} />

          <div style={{ display: "flex", gap: 10 }}>
            <motion.button
              whileHover={{ scale: 1.04, boxShadow: `0 0 30px ${T.neon}50` }}
              whileTap={{ scale: 0.97 }}
              onClick={animatePointer}
              style={{
                flex: 1, fontFamily: T.display, fontWeight: 400, fontSize: 14, letterSpacing: 4,
                color: "#000", background: `linear-gradient(135deg, ${T.neon}, #FF9000)`,
                border: "none", borderRadius: 8, padding: "13px", cursor: "pointer",
              }}
            >SHOW POINTER</motion.button>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => { setShowPointer(false); setAnimPhase(0); setActiveCell(null); }}
              style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, background: "transparent", border: `1px solid ${T.dim}`, borderRadius: 8, padding: "13px 16px", cursor: "pointer" }}
            >↺</motion.button>
          </div>
        </GlassCard>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <CodeBlock code={`int x = 42;          // value at address\nint *ptr;            // pointer variable\nptr = &x;            // store address\nprintf("%p", ptr);   // prints 0x1000\nprintf("%d", *ptr);  // prints 42`} highlightLine={showPointer ? 2 : -1} />
          <InsightBlock title="POINTER CONTRACT" color={T.neon} icon="→">
            Pointer = address.{"\n"}*ptr = follow address.{"\n"}Size: 8 bytes on 64-bit.
          </InsightBlock>
        </div>
      </div>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 02 — ADDRESS & DEREFERENCE (visual slider)
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

    setStep(0);
    await new Promise(r => setTimeout(r, 800));
    setAddrResult(`0x${baseAddr.toString(16).toUpperCase()}`);
    setStep(1);
    await new Promise(r => setTimeout(r, 800));
    setStep(2);
    await new Promise(r => setTimeout(r, 700));
    setDerefResult(val);
    setStep(3);
    await new Promise(r => setTimeout(r, 600));
    setStep(4);
    setPhase("idle");
  };

  return (
    <Section id="addr-deref">
      <SectionHeader num="02" tag="& AND *" title="ADDRESS / DEREF" subtitle="" />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <GlassCard style={{ padding: 30 }}>
          <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 4, color: T.neon2, marginBottom: 24 }}>
            ⊕ OPERATOR VISUAL
          </div>

          <div style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontFamily: T.mono, fontSize: 10, color: T.muted }}>int x =</span>
              <motion.span key={val} animate={{ scale: [1.5, 1] }}
                style={{ fontFamily: T.mono, fontSize: 22, fontWeight: 700, color: T.neon4 }}>{val}</motion.span>
            </div>
            <input type="range" min={0} max={255} value={val}
              onChange={e => { setVal(Number(e.target.value)); setStep(-1); setDerefResult(null); setAddrResult(null); setPhase("idle"); }}
              style={{ width: "100%", accentColor: T.neon4 }} />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: T.mono, fontSize: 8, color: T.muted, marginBottom: 6, letterSpacing: 3 }}>VARIABLE</div>
              <motion.div
                animate={{ boxShadow: step === 2 || step === 3 ? `0 0 30px ${T.neon4}70` : "none" }}
                style={{
                  padding: "18px", borderRadius: 10,
                  background: `${T.neon4}10`, border: `2px solid ${T.neon4}40`,
                  textAlign: "center",
                }}
              >
                <div style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, marginBottom: 4 }}>int x</div>
                <motion.div
                  key={val}
                  initial={{ scale: 1.3 }}
                  animate={{ scale: 1 }}
                  style={{ fontFamily: T.mono, fontSize: 28, fontWeight: 700, color: T.neon4 }}
                >{val}</motion.div>
                <div style={{ fontFamily: T.mono, fontSize: 8, color: T.muted, marginTop: 4 }}>
                  0x{(baseAddr).toString(16).toUpperCase()}
                </div>
              </motion.div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
              <motion.div
                animate={{
                  boxShadow: step === 0 || step === 1 ? `0 0 20px ${T.neon2}70` : "none",
                  background: step === 0 || step === 1 ? `${T.neon2}20` : `${T.neon2}10`,
                }}
                style={{ padding: "10px 14px", borderRadius: 8, border: `2px solid ${T.neon2}50`, textAlign: "center", transition: "all 0.3s" }}
              >
                <div style={{ fontFamily: T.mono, fontSize: 20, fontWeight: 700, color: T.neon2 }}>&</div>
                <div style={{ fontFamily: T.mono, fontSize: 8, color: T.muted }}>address-of</div>
              </motion.div>
              <motion.div
                animate={{
                  boxShadow: step === 2 || step === 3 ? `0 0 20px ${T.neon}70` : "none",
                  background: step === 2 || step === 3 ? `${T.neon}20` : `${T.neon}10`,
                }}
                style={{ padding: "10px 14px", borderRadius: 8, border: `2px solid ${T.neon}50`, textAlign: "center", transition: "all 0.3s" }}
              >
                <div style={{ fontFamily: T.mono, fontSize: 20, fontWeight: 700, color: T.neon }}>*</div>
                <div style={{ fontFamily: T.mono, fontSize: 8, color: T.muted }}>dereference</div>
              </motion.div>
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: T.mono, fontSize: 8, color: T.muted, marginBottom: 6, letterSpacing: 3 }}>RESULTS</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <motion.div
                  animate={{ boxShadow: addrResult ? `0 0 20px ${T.neon2}50` : "none" }}
                  style={{
                    padding: "12px", borderRadius: 9,
                    background: `${T.neon2}10`, border: `1px solid ${T.neon2}35`,
                    textAlign: "center", minHeight: 60,
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <div style={{ fontFamily: T.mono, fontSize: 8, color: T.muted, marginBottom: 4 }}>&x =</div>
                  <AnimatePresence mode="wait">
                    {addrResult ? (
                      <motion.div key="addr" initial={{ scale: 0 }} animate={{ scale: 1 }}
                        style={{ fontFamily: T.mono, fontSize: 12, fontWeight: 700, color: T.neon2 }}>
                        {addrResult}
                      </motion.div>
                    ) : (
                      <div style={{ fontFamily: T.mono, fontSize: 12, color: T.muted }}>?</div>
                    )}
                  </AnimatePresence>
                </motion.div>

                <motion.div
                  animate={{ boxShadow: derefResult !== null ? `0 0 20px ${T.neon}50` : "none" }}
                  style={{
                    padding: "12px", borderRadius: 9,
                    background: `${T.neon}10`, border: `1px solid ${T.neon}35`,
                    textAlign: "center", minHeight: 60,
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <div style={{ fontFamily: T.mono, fontSize: 8, color: T.muted, marginBottom: 4 }}>*(&x) =</div>
                  <AnimatePresence mode="wait">
                    {derefResult !== null ? (
                      <motion.div key="deref" initial={{ scale: 0 }} animate={{ scale: 1 }}
                        style={{ fontFamily: T.mono, fontSize: 18, fontWeight: 700, color: T.neon }}>
                        {derefResult}
                      </motion.div>
                    ) : (
                      <div style={{ fontFamily: T.mono, fontSize: 12, color: T.muted }}>?</div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>
            </div>
          </div>

          <div style={{ fontFamily: T.mono, fontSize: 11, color: T.text, marginBottom: 16, minHeight: 20, lineHeight: 1.7 }}>
            {step < 0 && "Set value & press SIMULATE"}
            {step === 0 && "&x → address"}
            {step === 1 && <span>&x = <AddrTag addr={`0x${baseAddr.toString(16).toUpperCase()}`} color={T.neon2} /></span>}
            {step === 2 && "* follows address..."}
            {step === 3 && <span>* value = <strong style={{ color: T.neon }}>{val}</strong></span>}
            {step === 4 && "*(&x) == x"}
          </div>

          <motion.button
            whileHover={{ scale: 1.04, boxShadow: `0 0 30px ${T.neon2}50` }}
            whileTap={{ scale: 0.97 }}
            onClick={simulate}
            disabled={phase !== "idle"}
            style={{
              width: "100%", fontFamily: T.display, fontWeight: 400, fontSize: 14, letterSpacing: 4,
              color: "#000", background: phase !== "idle" ? T.muted : `linear-gradient(135deg, ${T.neon2}, ${T.accent})`,
              border: "none", borderRadius: 8, padding: "13px", cursor: phase !== "idle" ? "not-allowed" : "pointer",
            }}
          >{phase !== "idle" ? "RUNNING..." : "▶ SIMULATE"}</motion.button>
        </GlassCard>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <CodeBlock code={`int x = ${val};\nint *ptr = &x;\nprintf("%p", &x);  // 0x${baseAddr.toString(16).toUpperCase()}\nprintf("%d", *ptr); // ${val}`} highlightLine={step >= 2 ? 3 : step >= 0 ? 2 : -1} />
          <InsightBlock title="& vs *" color={T.neon2} icon="⊕">
            & = address, * = value. Inverse.
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
      <SectionHeader num="03" tag="PTR + ARRAYS" title="ARR[i] = *(ARR+i)" subtitle="" />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <GlassCard style={{ padding: 30 }}>
          <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 4, color: T.neon4, marginBottom: 24 }}>
            ⧖ POINTER ARITHMETIC
          </div>

          <div style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
              {arr.map((v, i) => (
                <div key={i} style={{ flex: 1, textAlign: "center", fontFamily: T.mono, fontSize: 8, color: T.dim }}>
                  +{i * 4}B
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 0, borderRadius: 10, overflow: "hidden", border: `2px solid ${T.neon4}30` }}>
              {arr.map((v, i) => (
                <motion.div
                  key={i}
                  animate={{
                    background: i === offset ? `${T.neon4}25` : `${T.neon}06`,
                    boxShadow: i === offset ? `inset 0 0 20px ${T.neon4}30` : "none",
                  }}
                  style={{
                    flex: 1, height: 72, borderRight: i < arr.length - 1 ? `1px solid ${T.dim}` : "none",
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <motion.span
                    animate={{ scale: i === offset ? [1.3, 1] : 1, color: i === offset ? T.neon4 : T.text }}
                    style={{ fontFamily: T.mono, fontSize: 18, fontWeight: 700, lineHeight: 1 }}
                  >{v}</motion.span>
                  <span style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, marginTop: 3 }}>[{i}]</span>
                </motion.div>
              ))}
            </div>
            <div style={{ position: "relative", height: 32, marginTop: 2 }}>
              <motion.div
                animate={{ left: `calc(${(offset / arr.length) * 100}% + ${offset * 0}px)` }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                style={{ position: "absolute", display: "flex", flexDirection: "column", alignItems: "center", width: `${100 / arr.length}%` }}
              >
                <motion.div
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                  style={{ width: 0, height: 0, borderLeft: "8px solid transparent", borderRight: "8px solid transparent", borderBottom: `12px solid ${T.neon4}` }}
                />
                <span style={{ fontFamily: T.mono, fontSize: 9, color: T.neon4, marginTop: 2 }}>ptr+{offset}</span>
              </motion.div>
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontFamily: T.mono, fontSize: 10, color: T.muted }}>offset (i)</span>
              <motion.span key={offset} animate={{ scale: [1.4, 1] }}
                style={{ fontFamily: T.mono, fontSize: 20, fontWeight: 700, color: T.neon4 }}>{offset}</motion.span>
            </div>
            <input type="range" min={0} max={4} value={offset}
              onChange={e => setOffset(Number(e.target.value))}
              style={{ width: "100%", accentColor: T.neon4 }} />
          </div>

          <div style={{
            padding: "16px", borderRadius: 10,
            background: `${T.neon4}0C`, border: `1px solid ${T.neon4}35`,
            marginBottom: 16,
          }}>
            <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, marginBottom: 8 }}>IDENTICAL:</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[
                { expr: `arr[${offset}]`, val: dereffed },
                { expr: `*(arr+${offset})`, val: dereffed },
                { expr: `*(ptr+${offset})`, val: dereffed },
              ].map(({ expr, val }) => (
                <div key={expr} style={{ padding: "8px 10px", borderRadius: 7, background: `${T.neon}10`, border: `1px solid ${T.neon}25` }}>
                  <div style={{ fontFamily: T.mono, fontSize: 12, fontWeight: 700, color: T.neon }}>{expr}</div>
                  <div style={{ fontFamily: T.mono, fontSize: 11, color: T.neon4, marginTop: 3 }}>= {val}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{
            fontFamily: T.mono, fontSize: 11, color: T.text, lineHeight: 1.8,
            padding: "10px 14px", borderRadius: 8, background: `${T.neon2}08`, border: `1px solid ${T.neon2}20`,
          }}>
            Address: <AddrTag addr={currentAddr} color={T.neon2} /> = base + {offset}×4
          </div>
        </GlassCard>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <CodeBlock code={`int arr[] = {10,20,30,40,50};\nint *ptr = arr;\narr[${offset}] = ${dereffed}\n*(arr+${offset}) = ${dereffed}`} highlightLine={offset > 0 ? 2 : 1} />
          <InsightBlock title="ARRAY = POINTER" color={T.neon4} icon="⧖">
            arr[i] ≡ *(arr+i). No bounds check.
          </InsightBlock>
        </div>
      </div>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 04 — STRUCTS (visual layout)
// ─────────────────────────────────────────────────────────────────────────────
function StructsSection() {
  const [student, setStudent] = useState({ name: "Alice", age: 20, gpa: 3.8, id: 1001 });
  const [editing, setEditing] = useState(null);
  const [accessMode, setAccessMode] = useState("dot");
  const [animField, setAnimField] = useState(null);

  const fields = [
    { key: "name",   type: "char[20]", color: T.neon2,  size: 20, label: "Name" },
    { key: "age",    type: "int",      color: T.neon,   size: 4,  label: "Age" },
    { key: "gpa",    type: "float",    color: T.neon4,  size: 4,  label: "GPA" },
    { key: "id",     type: "int",      color: T.accent, size: 4,  label: "ID" },
  ];

  const totalSize = fields.reduce((a, b) => a + b.size, 0);

  const accessField = async (key) => {
    setAnimField(key);
    await new Promise(r => setTimeout(r, 1200));
    setAnimField(null);
  };

  return (
    <Section id="structs">
      <SectionHeader num="04" tag="STRUCTS" title="MEMORY LAYOUT" subtitle="" />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <GlassCard style={{ padding: 30 }}>
          <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 4, color: T.accent, marginBottom: 24 }}>
            ⬡ STRUCT MEMORY
          </div>

          <div style={{ display: "flex", gap: 8, marginBottom: 22 }}>
            <Pill color={T.accent} active={accessMode === "dot"} onClick={() => setAccessMode("dot")}>DOT .</Pill>
            <Pill color={T.neon2} active={accessMode === "arrow"} onClick={() => setAccessMode("arrow")}>ARROW →</Pill>
          </div>

          <div style={{ marginBottom: 24 }}>
            <div style={{ fontFamily: T.mono, fontSize: 8, color: T.muted, marginBottom: 8, letterSpacing: 3 }}>
              sizeof = {totalSize} bytes
            </div>
            <div style={{ display: "flex", height: 28, borderRadius: 6, overflow: "hidden", border: `1px solid ${T.dim}` }}>
              {fields.map((f) => (
                <motion.div
                  key={f.key}
                  animate={{ opacity: animField === f.key ? 1 : animField ? 0.35 : 1 }}
                  style={{
                    flex: f.size, background: `${f.color}25`,
                    borderRight: `1px solid ${T.dim}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <span style={{ fontFamily: T.mono, fontSize: 8, color: f.color, overflow: "hidden", whiteSpace: "nowrap" }}>
                    {f.size}B
                  </span>
                </motion.div>
              ))}
            </div>
            <div style={{ display: "flex", marginTop: 4 }}>
              {fields.map((f) => (
                <div key={f.key} style={{ flex: f.size, fontFamily: T.mono, fontSize: 7, color: f.color, textAlign: "center" }}>
                  {f.key}
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
            {fields.map((f) => (
              <motion.div
                key={f.key}
                animate={{
                  background: animField === f.key ? `${f.color}20` : `${f.color}08`,
                  borderColor: animField === f.key ? f.color : `${f.color}25`,
                  boxShadow: animField === f.key ? `0 0 25px ${f.color}50` : "none",
                }}
                style={{ borderRadius: 10, border: "2px solid", padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}
              >
                <div style={{ width: 60, fontFamily: T.mono, fontSize: 8, color: f.color, letterSpacing: 2, lineHeight: 1.5 }}>
                  {f.type}<br />{f.key}
                </div>
                <div style={{ flex: 1 }}>
                  {editing === f.key ? (
                    <input
                      autoFocus
                      defaultValue={student[f.key]}
                      onBlur={e => { setStudent(prev => ({ ...prev, [f.key]: f.type === "int" ? parseInt(e.target.value) || prev[f.key] : f.type === "float" ? parseFloat(e.target.value) || prev[f.key] : e.target.value })); setEditing(null); }}
                      onKeyDown={e => e.key === "Enter" && e.target.blur()}
                      style={{ background: "transparent", border: "none", outline: "none", fontFamily: T.mono, fontSize: 18, fontWeight: 700, color: f.color, width: "100%" }}
                    />
                  ) : (
                    <motion.div key={String(student[f.key])} animate={{ scale: [1.15, 1] }}
                      style={{ fontFamily: T.mono, fontSize: 18, fontWeight: 700, color: f.color, cursor: "text" }}
                      onClick={() => setEditing(f.key)}
                    >{String(student[f.key])}</motion.div>
                  )}
                  <div style={{ fontFamily: T.mono, fontSize: 8, color: T.muted, marginTop: 2 }}>
                    {accessMode === "dot" ? `s.${f.key}` : `ptr->${f.key}`}
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => accessField(f.key)}
                  style={{
                    fontFamily: T.mono, fontSize: 8, color: f.color,
                    background: `${f.color}15`, border: `1px solid ${f.color}40`,
                    borderRadius: 5, padding: "4px 10px", cursor: "pointer",
                  }}
                >ACCESS</motion.button>
              </motion.div>
            ))}
          </div>

          <motion.div
            key={accessMode}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: "14px", borderRadius: 10,
              background: `${T.accent}0C`, border: `1px solid ${T.accent}30`,
              fontFamily: T.mono, fontSize: 12, color: T.text, lineHeight: 2,
            }}
          >
            {accessMode === "dot" ? (
              <>s.name = "{student.name}"<br />s.age = {student.age}<br />s.gpa = {student.gpa}</>
            ) : (
              <>ptr→name = "{student.name}"<br />ptr→age = {student.age}<br />ptr→gpa = {student.gpa}</>
            )}
          </motion.div>
        </GlassCard>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <CodeBlock code={`struct Student {\n  char name[20];\n  int age;\n  float gpa;\n  int id;\n};\nstruct Student s = {"${student.name}", ${student.age}, ${student.gpa}, ${student.id}};\ns.${accessMode === "dot" ? "name" : "age"} = ...`} />
          <InsightBlock title="DOT vs ARROW" color={T.accent} icon="⬡">
            s.name  ← direct<br />
            ptr→name ← (*ptr).name
          </InsightBlock>
        </div>
      </div>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 05 — UNIONS (shared memory)
// ─────────────────────────────────────────────────────────────────────────────
function UnionsSection() {
  const [activeType, setActiveType] = useState("i");
  const [intVal, setIntVal] = useState(1078530011);
  const [phase, setPhase] = useState(0);

  const floatBits = useMemo(() => {
    const buf = new ArrayBuffer(4);
    const view = new DataView(buf);
    view.setInt32(0, intVal, true);
    return view.getFloat32(0, true).toFixed(6);
  }, [intVal]);

  const charVal = String.fromCharCode(intVal & 0xFF);
  const hexVal = `0x${(intVal >>> 0).toString(16).toUpperCase().padStart(8, "0")}`;

  const members = [
    { key: "i", label: "int i", type: "int", size: 4, color: T.neon, value: intVal },
    { key: "f", label: "float f", type: "float", size: 4, color: T.neon4, value: floatBits },
    { key: "c", label: "char c", type: "char", size: 1, color: T.neon2, value: `'${charVal}'` },
  ];

  const activeMember = members.find(m => m.key === activeType);

  return (
    <Section id="unions">
      <SectionHeader num="05" tag="UNIONS" title="SHARED MEMORY" subtitle="" />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <GlassCard style={{ padding: 30 }}>
          <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 4, color: T.neon3, marginBottom: 24 }}>
            ◎ MEMORY VISUALIZER
          </div>

          <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
            {members.map(m => (
              <Pill key={m.key} color={m.color} active={activeType === m.key} onClick={() => setActiveType(m.key)}>
                {m.label}
              </Pill>
            ))}
          </div>

          <div style={{ marginBottom: 24 }}>
            <div style={{ fontFamily: T.mono, fontSize: 8, color: T.muted, marginBottom: 8, letterSpacing: 3 }}>
              sizeof(union) = 4 bytes
            </div>
            <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
              {[0, 1, 2, 3].map(byteIdx => {
                const byteVal = (intVal >> (byteIdx * 8)) & 0xFF;
                const isActive = activeType === "c" ? byteIdx === 0 : true;
                return (
                  <motion.div
                    key={byteIdx}
                    animate={{
                      background: isActive ? `${activeMember.color}20` : `${T.dim}80`,
                      borderColor: isActive ? activeMember.color : T.muted,
                      opacity: isActive ? 1 : 0.4,
                    }}
                    style={{ flex: 1, height: 72, borderRadius: 10, border: "2px solid", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}
                  >
                    <div style={{ fontFamily: T.mono, fontSize: 8, color: T.dim, marginBottom: 4 }}>byte {byteIdx}</div>
                    <div style={{ fontFamily: T.mono, fontSize: 13, fontWeight: 700, color: isActive ? activeMember.color : T.muted }}>
                      {byteVal.toString(16).toUpperCase().padStart(2, "0")}
                    </div>
                    <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted }}>{byteVal}</div>
                  </motion.div>
                );
              })}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              <div style={{ padding: "12px", borderRadius: 9, background: `${T.neon3}08`, border: `1px solid ${T.neon3}25` }}>
                <div style={{ fontFamily: T.mono, fontSize: 8, color: T.neon3, marginBottom: 8, letterSpacing: 3 }}>STRUCT — separate</div>
                <div style={{ display: "flex", gap: 3 }}>
                  {members.map(m => (
                    <div key={m.key} style={{ flex: m.size, height: 18, borderRadius: 3, background: `${m.color}30`, border: `1px solid ${m.color}50` }} />
                  ))}
                </div>
                <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, marginTop: 4 }}>9+ bytes</div>
              </div>
              <div style={{ padding: "12px", borderRadius: 9, background: `${T.neon}08`, border: `1px solid ${T.neon}25` }}>
                <div style={{ fontFamily: T.mono, fontSize: 8, color: T.neon, marginBottom: 8, letterSpacing: 3 }}>UNION — shared</div>
                <div style={{ position: "relative", height: 18 }}>
                  {members.map((m, i) => (
                    <div key={m.key} style={{
                      position: "absolute", top: 0, left: 0, right: 0, height: "100%", borderRadius: 3,
                      background: `${m.color}${i === 0 ? "30" : "20"}`,
                      border: `1px solid ${m.color}${i === 0 ? "60" : "40"}`,
                    }} />
                  ))}
                </div>
                <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, marginTop: 4 }}>4 bytes</div>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontFamily: T.mono, fontSize: 10, color: T.muted }}>u.i (raw int)</span>
              <span style={{ fontFamily: T.mono, fontSize: 10, color: T.neon4 }}>{hexVal}</span>
            </div>
            <input type="range" min={0} max={2147483647} step={1000000} value={intVal}
              onChange={e => setIntVal(Number(e.target.value))}
              style={{ width: "100%", accentColor: T.neon }} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {members.map(m => (
              <motion.div
                key={m.key}
                animate={{
                  background: activeType === m.key ? `${m.color}18` : `${m.color}06`,
                  borderColor: activeType === m.key ? m.color : `${m.color}25`,
                  boxShadow: activeType === m.key ? `0 0 20px ${m.color}40` : "none",
                }}
                style={{ padding: "10px 14px", borderRadius: 9, border: "2px solid", display: "flex", justifyContent: "space-between", alignItems: "center" }}
              >
                <span style={{ fontFamily: T.mono, fontSize: 10, color: m.color }}>{m.label}</span>
                <span style={{ fontFamily: T.mono, fontSize: 14, fontWeight: 700, color: m.color }}>{String(m.value)}</span>
              </motion.div>
            ))}
          </div>
        </GlassCard>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <CodeBlock code={`union Data { int i; float f; char c; };\nu.i = ${intVal};\nprintf("%d", u.i);   // ${intVal}\nprintf("%.4f", u.f); // ${floatBits}\nprintf("%c", u.c);   // '${charVal}'`} highlightLine={activeType === "i" ? 2 : activeType === "f" ? 3 : 4} />
          <InsightBlock title="UNION vs STRUCT" color={T.neon3} icon="◎">
            union members share same memory. Write one, read any.
          </InsightBlock>
        </div>
      </div>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 06 — PREPROCESSOR (visual pipeline)
// ─────────────────────────────────────────────────────────────────────────────
function PreprocessorSection() {
  const [activeDirective, setActiveDirective] = useState("include");
  const [macroN, setMacroN] = useState(7);
  const [showExpanded, setShowExpanded] = useState(false);
  const [animating, setAnimating] = useState(false);

  const directives = {
    include: {
      color: T.neon2,
      label: "#include",
      desc: "Text insertion",
      before: `#include <stdio.h>\n#include "mymath.h"\nint main() {\n  printf("Hello");\n}`,
      after: `// [stdio.h content]\n// [mymath.h content]\nint main() {\n  printf("Hello");\n}`,
    },
    define: {
      color: T.neon4,
      label: "#define",
      desc: "Text substitution",
      before: `#define SQ(x) ((x)*(x))\nint s = SQ(${macroN});`,
      after: `int s = ((${macroN})*(${macroN})); // = ${macroN * macroN}`,
    },
    ifdef: {
      color: T.accent,
      label: "#ifdef",
      desc: "Conditional compile",
      before: `#define DEBUG\n#ifdef DEBUG\n  printf("debug");\n#endif`,
      after: `  printf("debug");\n`,
    },
  };

  const d = directives[activeDirective];

  const animate = async () => {
    setAnimating(true);
    setShowExpanded(false);
    await new Promise(r => setTimeout(r, 400));
    setShowExpanded(true);
    setAnimating(false);
  };

  return (
    <Section id="preproc">
      <SectionHeader num="06" tag="PREPROCESSOR" title="TEXT TRANSFORM" subtitle="" />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <GlassCard style={{ padding: 30 }}>
          <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 4, color: T.neon2, marginBottom: 22 }}>
            # PIPELINE
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 28, justifyContent: "center" }}>
            {[
              { label: "source.c", color: T.muted, icon: "📄" },
              { label: "→", color: T.dim },
              { label: "preproc", color: T.neon2, icon: "#" },
              { label: "→", color: T.dim },
              { label: "compiler", color: T.neon, icon: "⚙" },
              { label: "→", color: T.dim },
              { label: "binary", color: T.neon4, icon: "⬡" },
            ].map((step, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                style={{
                  fontFamily: T.mono, fontSize: step.icon ? 11 : 14, fontWeight: 700,
                  color: step.color, padding: step.icon ? "6px 10px" : "0 4px",
                  background: step.icon ? `${step.color}12` : "transparent",
                  border: step.icon ? `1px solid ${step.color}30` : "none",
                  borderRadius: 6,
                }}
              >{step.icon || step.label}{step.icon ? ` ${step.label}` : ""}</motion.div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 8, marginBottom: 22 }}>
            {Object.entries(directives).map(([k, v]) => (
              <Pill key={k} color={v.color} active={activeDirective === k} onClick={() => { setActiveDirective(k); setShowExpanded(false); }}>
                {v.label}
              </Pill>
            ))}
          </div>

          {activeDirective === "define" && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontFamily: T.mono, fontSize: 9, color: T.muted }}>SQ(x) x =</span>
                <motion.span key={macroN} animate={{ scale: [1.4, 1] }}
                  style={{ fontFamily: T.mono, fontSize: 16, fontWeight: 700, color: T.neon4 }}>{macroN}</motion.span>
              </div>
              <input type="range" min={1} max={20} value={macroN}
                onChange={e => { setMacroN(Number(e.target.value)); setShowExpanded(false); }}
                style={{ width: "100%", accentColor: T.neon4 }} />
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: showExpanded ? "1fr" : "1fr", gap: 10, marginBottom: 20 }}>
            <div>
              <div style={{ fontFamily: T.mono, fontSize: 8, color: T.muted, marginBottom: 6, letterSpacing: 3 }}>
                {showExpanded ? "AFTER PREPROC" : "SOURCE"}
              </div>
              <motion.div
                key={`${activeDirective}-${showExpanded}-${macroN}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  background: "rgba(0,0,0,0.5)", borderRadius: 10,
                  border: `1px solid ${showExpanded ? d.color + "50" : T.dim}`,
                  padding: "14px 16px", minHeight: 140,
                  fontFamily: T.mono, fontSize: 11, lineHeight: 1.9,
                  color: T.text, whiteSpace: "pre",
                  overflow: "auto",
                  boxShadow: showExpanded ? `0 0 20px ${d.color}20` : "none",
                }}
              >{showExpanded ? d.after : d.before}</motion.div>
            </div>
          </div>

          <div style={{ fontFamily: T.mono, fontSize: 11, color: T.text, lineHeight: 1.75, marginBottom: 16, padding: "10px 12px", borderRadius: 8, background: `${d.color}0A`, border: `1px solid ${d.color}25` }}>
            {d.desc}
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <motion.button
              whileHover={{ scale: 1.04, boxShadow: `0 0 25px ${d.color}50` }}
              whileTap={{ scale: 0.97 }}
              onClick={animate}
              disabled={animating}
              style={{
                flex: 1, fontFamily: T.display, fontWeight: 400, fontSize: 14, letterSpacing: 4,
                color: "#000", background: `linear-gradient(135deg, ${d.color}, ${T.neon2})`,
                border: "none", borderRadius: 8, padding: "12px", cursor: "pointer",
              }}
            >{showExpanded ? "↺ SHOW SOURCE" : "▶ EXPAND"}</motion.button>
          </div>
        </GlassCard>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <CodeBlock code={`#include <stdio.h>\n#define SQ(x) ((x)*(x))\n#ifdef DEBUG\n  // ...`} highlightLine={activeDirective === "include" ? 0 : activeDirective === "define" ? 1 : 2} />
          <InsightBlock title="MACRO SAFETY" color={T.neon3} icon="⚠">
            Wrap args: #define SQ(x) ((x)*(x))
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
    if (phase !== "idle") return;
    setPhase("alloc");
    addLog(`malloc(${allocSize} * 4 bytes)`, T.neon2);
    await new Promise(r => setTimeout(r, 500));
    const id = nextId.current++;
    setHeapBlocks(prev => [...prev, { id, size: allocSize, freed: false, addr: `0x${(0x8000 + id * 100).toString(16).toUpperCase()}` }]);
    addLog(`→ allocated at ${(0x8000 + id * 100).toString(16).toUpperCase()}`, T.neon4);
    setPhase("idle");
  };

  const calloc_ = async () => {
    if (phase !== "idle") return;
    setPhase("alloc");
    addLog(`calloc(${allocSize}, 4) zeroed`, T.neon2);
    await new Promise(r => setTimeout(r, 500));
    const id = nextId.current++;
    setHeapBlocks(prev => [...prev, { id, size: allocSize, freed: false, zeroed: true, addr: `0x${(0x8000 + id * 100).toString(16).toUpperCase()}` }]);
    addLog(`→ zeroed block`, T.neon);
    setPhase("idle");
  };

  const free_ = async (id) => {
    if (phase !== "idle") return;
    setPhase("free");
    const block = heapBlocks.find(b => b.id === id);
    addLog(`free(${block?.addr})`, T.neon3);
    await new Promise(r => setTimeout(r, 400));
    setHeapBlocks(prev => prev.map(b => b.id === id ? { ...b, freed: true } : b));
    await new Promise(r => setTimeout(r, 500));
    setHeapBlocks(prev => prev.filter(b => b.id !== id));
    addLog(`→ freed`, T.neon4);
    setPhase("idle");
    setLeakWarning(false);
  };

  const leakAll = () => {
    setLog([]);
    setHeapBlocks([]);
    setLeakWarning(true);
    addLog("MEMORY LEAK!", T.neon3);
  };

  const liveBlocks = heapBlocks.filter(b => !b.freed);
  const leakedBytes = liveBlocks.reduce((a, b) => a + b.size * 4, 0);

  return (
    <Section id="dynmem">
      <SectionHeader num="07" tag="DYNAMIC MEMORY" title="HEAP ALLOCATOR" subtitle="" />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <GlassCard style={{ padding: 30 }}>
          <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 4, color: T.neon2, marginBottom: 22 }}>
            ∞ HEAP SIM
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontFamily: T.mono, fontSize: 10, color: T.muted }}>Array size</span>
              <motion.span key={allocSize} animate={{ scale: [1.4, 1] }}
                style={{ fontFamily: T.mono, fontSize: 18, fontWeight: 700, color: T.neon2 }}>{allocSize}</motion.span>
            </div>
            <input type="range" min={1} max={12} value={allocSize}
              onChange={e => setAllocSize(Number(e.target.value))}
              style={{ width: "100%", accentColor: T.neon2 }} />
            <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, marginTop: 4 }}>
              = {allocSize * 4} bytes
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 22 }}>
            {[
              { label: "malloc()", fn: malloc_, color: T.neon2, desc: "uninit" },
              { label: "calloc()", fn: calloc_, color: T.neon, desc: "zeroed" },
            ].map(({ label, fn, color, desc }) => (
              <motion.button
                key={label}
                whileHover={{ scale: 1.04, boxShadow: `0 0 25px ${color}50` }}
                whileTap={{ scale: 0.97 }}
                onClick={fn}
                disabled={phase !== "idle" || liveBlocks.length >= 6}
                style={{
                  fontFamily: T.display, fontWeight: 400, fontSize: 14, letterSpacing: 3,
                  color: "#000", background: phase !== "idle" || liveBlocks.length >= 6 ? T.muted : `linear-gradient(135deg, ${color}, ${color}99)`,
                  border: "none", borderRadius: 8, padding: "12px", cursor: "pointer",
                }}
              >{label}<br /><span style={{ fontFamily: T.mono, fontSize: 8, color: "rgba(0,0,0,0.6)", letterSpacing: 2 }}>{desc}</span>
              </motion.button>
            ))}
          </div>

          <div style={{ marginBottom: 18 }}>
            <div style={{ fontFamily: T.mono, fontSize: 8, color: T.muted, marginBottom: 8, letterSpacing: 3 }}>
              HEAP BLOCKS ({liveBlocks.length} active)
            </div>
            <div style={{
              minHeight: 130, background: "rgba(0,0,0,0.4)", borderRadius: 10,
              border: `1px solid ${leakWarning ? T.neon3 : T.dim}`,
              padding: "12px", display: "flex", flexWrap: "wrap", gap: 8, alignContent: "flex-start",
            }}>
              <AnimatePresence>
                {liveBlocks.map(block => (
                  <motion.div
                    key={block.id}
                    initial={{ scale: 0, opacity: 0, y: -20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0, opacity: 0, y: 20 }}
                    transition={{ type: "spring", stiffness: 300, damping: 22 }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.06 }}
                      style={{
                        padding: "8px 12px", borderRadius: 8,
                        background: block.zeroed ? `${T.neon}20` : `${T.neon2}18`,
                        border: `2px solid ${block.zeroed ? T.neon : T.neon2}`,
                        boxShadow: `0 0 15px ${block.zeroed ? T.neon : T.neon2}40`,
                        cursor: "pointer",
                      }}
                      onClick={() => free_(block.id)}
                    >
                      <div style={{ fontFamily: T.mono, fontSize: 8, color: T.muted, marginBottom: 3 }}>{block.addr}</div>
                      <div style={{ fontFamily: T.mono, fontSize: 13, fontWeight: 700, color: block.zeroed ? T.neon : T.neon2 }}>
                        int[{block.size}]
                      </div>
                      <div style={{ fontFamily: T.mono, fontSize: 8, color: T.muted }}>{block.size * 4}B {block.zeroed ? "·zeroed" : ""}</div>
                      <div style={{ fontFamily: T.mono, fontSize: 8, color: T.neon3, marginTop: 2 }}>tap free</div>
                    </motion.div>
                  </motion.div>
                ))}
                {liveBlocks.length === 0 && !leakWarning && (
                  <div style={{ fontFamily: T.mono, fontSize: 11, color: T.dim, padding: "12px" }}>
                    Heap empty. Allocate.
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div style={{
            background: "rgba(0,0,0,0.5)", borderRadius: 9, border: `1px solid ${T.dim}`,
            padding: "10px 14px", marginBottom: 12, minHeight: 72, maxHeight: 90, overflowY: "auto",
          }}>
            {log.map(entry => (
              <motion.div key={entry.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                style={{ fontFamily: T.mono, fontSize: 10, color: entry.color, marginBottom: 2, lineHeight: 1.6 }}>
                {entry.msg}
              </motion.div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <motion.button whileTap={{ scale: 0.96 }} onClick={leakAll}
              style={{
                flex: 1, fontFamily: T.mono, fontSize: 10, color: T.neon3,
                background: `${T.neon3}10`, border: `1px solid ${T.neon3}40`,
                borderRadius: 8, padding: "10px", cursor: "pointer",
              }}>⚠ LEAK</motion.button>
            <motion.button whileTap={{ scale: 0.96 }}
              onClick={() => { setHeapBlocks([]); setLog([]); setLeakWarning(false); setPhase("idle"); }}
              style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, background: "transparent", border: `1px solid ${T.dim}`, borderRadius: 8, padding: "10px 14px", cursor: "pointer" }}>
              ↺ RESET
            </motion.button>
          </div>
        </GlassCard>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <CodeBlock code={`int *arr = malloc(${allocSize} * sizeof(int));\nif (!arr) return 1;\nfree(arr);`} highlightLine={liveBlocks.length > 0 ? 0 : 2} />
          <InsightBlock title="RULES" color={T.neon2} icon="∞">
            malloc → free. Check NULL. Never double-free.
          </InsightBlock>
        </div>
      </div>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 08 — MASTER ENGINE (visual with memory grid)
// ─────────────────────────────────────────────────────────────────────────────
const ENGINE_PROGS5 = [
  {
    name: "PTR + STRUCT",
    color: T.accent,
    lines: [
      `struct Point { int x, y; };`,
      `struct Point p = {3, 7};`,
      `struct Point *ptr = &p;`,
      `ptr->x = 10;`,
      `int dist = ptr->x + ptr->y;`,
      `printf("%d", dist);`,
    ],
    steps: [
      { line: 0, mem: {}, out: "" },
      { line: 1, mem: { "p.x": 3, "p.y": 7 }, out: "" },
      { line: 2, mem: { "p.x": 3, "p.y": 7, ptr: "&p" }, out: "" },
      { line: 3, mem: { "p.x": 10, "p.y": 7, ptr: "&p" }, out: "" },
      { line: 4, mem: { "p.x": 10, "p.y": 7, dist: 17 }, out: "" },
      { line: 5, mem: { "p.x": 10, "p.y": 7, dist: 17 }, out: "17" },
    ],
  },
  {
    name: "MALLOC ARRAY",
    color: T.neon2,
    lines: [
      `int n = 5;`,
      `int *arr = malloc(n*sizeof(int));`,
      `if (!arr) return 1;`,
      `for (int i=0; i<n; i++)`,
      `  arr[i] = i * i;`,
      `printf("%d", arr[3]);`,
      `free(arr); arr = NULL;`,
    ],
    steps: [
      { line: 0, mem: { n: 5 }, out: "" },
      { line: 1, mem: { n: 5, arr: "0x8000" }, out: "" },
      { line: 2, mem: { n: 5, arr: "0x8000" }, out: "" },
      { line: 3, mem: { n: 5, arr: "0x8000", i: 0 }, out: "" },
      { line: 4, mem: { n: 5, "arr[0..4]": "0,1,4,9,16", i: 4 }, out: "" },
      { line: 5, mem: { n: 5, "arr[3]": 9 }, out: "9" },
      { line: 6, mem: { n: 5, arr: "NULL" }, out: "9 (freed)" },
    ],
  },
  {
    name: "UNION TRICK",
    color: T.neon4,
    lines: [
      `union { int i; float f; } u;`,
      `u.i = 0x3F800000;`,
      `printf("%.1f", u.f);`,
    ],
    steps: [
      { line: 0, mem: { "union": "4 bytes" }, out: "" },
      { line: 1, mem: { "u.i": "0x3F800000", "u.f": "???" }, out: "" },
      { line: 2, mem: { "u.i": "0x3F800000", "u.f": "1.0" }, out: "1.0" },
    ],
  },
];

function EngineSection5() {
  const [progIdx, setProgIdx] = useState(0);
  const [step, setStep] = useState(-1);
  const [memory, setMemory] = useState({});
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);
  const runningRef = useRef(false);
  const prog = ENGINE_PROGS5[progIdx];

  const reset = () => { runningRef.current = false; setStep(-1); setMemory({}); setOutput(""); setRunning(false); };

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
      await new Promise(r => setTimeout(r, 850));
    }
    setStep(-1);
    setRunning(false);
    runningRef.current = false;
  };

  const MemoryGrid2D = ({ active }) => {
    const rows = 5;
    const cols = 7;
    const totalCells = rows * cols;
    const highlightIndex = active !== undefined && active >= 0 ? (active % totalCells) : -1;
    const cells = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const idx = r * cols + c;
        cells.push({ r, c, idx });
      }
    }
    return (
      <div style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: 4,
        background: "rgba(0,0,0,0.3)",
        borderRadius: 8,
        padding: 8,
        height: "100%",
      }}>
        {cells.map(cell => (
          <div
            key={cell.idx}
            style={{
              aspectRatio: "1 / 1",
              backgroundColor: highlightIndex === cell.idx ? prog.color : T.muted,
              opacity: highlightIndex === cell.idx ? 1 : 0.4,
              borderRadius: 4,
              transition: "all 0.2s",
              boxShadow: highlightIndex === cell.idx ? `0 0 12px ${prog.color}` : "none",
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <Section id="engine">
      <SectionHeader num="08" tag="ENGINE" title="FULL SIMULATION" subtitle="" />

      <div style={{ display: "flex", gap: 10, marginBottom: 28, flexWrap: "wrap" }}>
        {ENGINE_PROGS5.map((p, i) => (
          <Pill key={p.name} color={p.color} active={progIdx === i} onClick={() => { setProgIdx(i); reset(); }}>
            {p.name}
          </Pill>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <GlassCard style={{ overflow: "hidden" }}>
          <div style={{
            background: "rgba(0,0,0,0.45)", borderBottom: `1px solid ${T.dim}`,
            padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <motion.div
                animate={{ background: running ? prog.color : T.muted, boxShadow: running ? `0 0 12px ${prog.color}` : "none" }}
                style={{ width: 7, height: 7, borderRadius: "50%" }}
              />
              <span style={{ fontFamily: T.mono, fontSize: 9, color: T.muted }}>
                {prog.name.toLowerCase().replace(/ /g, "_")}.c
              </span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <motion.button whileTap={{ scale: 0.95 }} onClick={run} disabled={running}
                style={{
                  fontFamily: T.display, fontWeight: 400, fontSize: 11, letterSpacing: 3,
                  color: "#000", background: running ? T.muted : prog.color,
                  border: "none", borderRadius: 5, padding: "6px 16px", cursor: running ? "not-allowed" : "pointer",
                }}>
                {running ? "RUNNING…" : "▶ RUN"}
              </motion.button>
              <motion.button whileTap={{ scale: 0.95 }} onClick={reset}
                style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, background: "transparent", border: `1px solid ${T.dim}`, borderRadius: 5, padding: "6px 12px", cursor: "pointer" }}>
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
                  style={{ display: "flex", alignItems: "center", paddingRight: 16, paddingTop: 3, paddingBottom: 3, borderLeft: `3px solid ${isActive ? prog.color : "transparent"}` }}
                >
                  <span style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, minWidth: 26, textAlign: "right", marginRight: 14, userSelect: "none" }}>{i + 1}</span>
                  <span style={{ fontFamily: T.mono, fontSize: 12, color: isActive ? prog.color : T.text, whiteSpace: "pre" }}>{line}</span>
                  {isActive && (
                    <motion.span animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 0.5, repeat: Infinity }}
                      style={{ fontFamily: T.mono, fontSize: 8, color: prog.color, marginLeft: "auto", letterSpacing: 2 }}>
                      ◀
                    </motion.span>
                  )}
                </motion.div>
              );
            })}
          </div>
        </GlassCard>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <GlassCard style={{ padding: 0, overflow: "hidden", flex: 1 }}>
            <div style={{ background: "rgba(0,0,0,0.4)", borderBottom: `1px solid ${T.dim}`, padding: "10px 16px", fontFamily: T.mono, fontSize: 8, letterSpacing: 3, color: T.neon2 }}>
              MEMORY STATE
            </div>
            <div style={{ padding: "16px", minHeight: 130 }}>
              <AnimatePresence>
                {Object.keys(memory).length === 0 ? (
                  <div style={{ fontFamily: T.mono, fontSize: 11, color: T.muted }}>No variables...</div>
                ) : Object.entries(memory).map(([k, v]) => (
                  <motion.div key={k} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    style={{ display: "flex", alignItems: "center", gap: 12, fontFamily: T.mono, fontSize: 12, marginBottom: 10 }}>
                    <span style={{ color: T.neon2, minWidth: 80 }}>{k}</span>
                    <motion.div key={String(v)} initial={{ scale: 1.4, color: prog.color }} animate={{ scale: 1, color: T.text }}
                      style={{ background: `${prog.color}15`, border: `1px solid ${prog.color}40`, borderRadius: 5, padding: "3px 12px", fontWeight: 700, fontFamily: T.mono, fontSize: 11 }}>
                      {String(v)}
                    </motion.div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </GlassCard>

          <GlassCard style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ background: "rgba(0,0,0,0.4)", borderBottom: `1px solid ${T.dim}`, padding: "10px 16px", fontFamily: T.mono, fontSize: 8, letterSpacing: 3, color: T.neon3 }}>
              OUTPUT
            </div>
            <div style={{ padding: "14px 16px", minHeight: 56 }}>
              {output ? (
                <motion.pre initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  style={{ fontFamily: T.mono, fontSize: 16, color: "#B4FF00", lineHeight: 1.8 }}>
                  {output}
                </motion.pre>
              ) : (
                <span style={{ fontFamily: T.mono, fontSize: 11, color: T.muted }}>
                  {running ? "executing..." : "press ▶ RUN"}
                </span>
              )}
            </div>
          </GlassCard>

          <GlassCard style={{ padding: 0, overflow: "hidden", height: 165 }} hover={false}>
            <div style={{ padding: "8px 14px", borderBottom: `1px solid ${T.dim}`, fontFamily: T.mono, fontSize: 8, color: prog.color, letterSpacing: 4 }}>
              2D MEMORY GRID
            </div>
            <div style={{ height: 130, padding: 8 }}>
              <MemoryGrid2D active={step} />
            </div>
          </GlassCard>
        </div>
      </div>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HERO SECTION (minimal text)
// ─────────────────────────────────────────────────────────────────────────────
function HeroSection5() {
  const [phase, setPhase] = useState(0);
  const phases = [
    "pointer = address",
    "malloc → heap → free",
    "struct packs, union shares",
    "#define transforms code",
    "C chapter 5 engine",
  ];

  useEffect(() => {
    const iv = setInterval(() => setPhase(p => (p + 1) % phases.length), 2600);
    return () => clearInterval(iv);
  }, []);

  const TOPICS = [
    { label: "Pointers",         icon: "→",  color: T.neon },
    { label: "& Address-of",     icon: "&",  color: T.neon2 },
    { label: "* Dereference",    icon: "*",  color: T.neon4 },
    { label: "Ptr + Arrays",     icon: "⧖", color: T.accent },
    { label: "Structs",          icon: "⬡", color: T.neon3 },
    { label: "Unions",           icon: "◎", color: T.neon },
    { label: "#define",          icon: "#",  color: T.neon2 },
    { label: "malloc/calloc",    icon: "∞",  color: T.accent },
    { label: "free()",           icon: "✕",  color: T.neon3 },
  ];

  return (
    <section id="hero" style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden",
      background: `
        radial-gradient(ellipse 80% 50% at 50% -5%, rgba(255,100,0,0.09) 0%, transparent 60%),
        radial-gradient(ellipse 50% 35% at 85% 75%, rgba(168,85,247,0.07) 0%, transparent 55%),
        radial-gradient(ellipse 35% 25% at 10% 85%, rgba(0,229,255,0.05) 0%, transparent 55%),
        ${T.bg}
      `,
    }}>
      <div style={{
        position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
        backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,100,0,0.012) 2px, rgba(255,100,0,0.012) 4px)",
      }} />

      <div style={{ position: "relative", zIndex: 10, textAlign: "center", maxWidth: 920, padding: "0 24px" }}>
        <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            fontFamily: T.mono, fontSize: 9, letterSpacing: 5, color: T.neon,
            border: `1px solid ${T.border}`, background: "rgba(255,100,0,0.05)",
            padding: "7px 22px", borderRadius: 100, marginBottom: 30,
          }}>
          <motion.span animate={{ opacity: [1, 0.1, 1], scale: [1, 0.6, 1] }} transition={{ duration: 1.1, repeat: Infinity }}
            style={{ width: 5, height: 5, borderRadius: "50%", background: T.neon, display: "inline-block" }} />
          C · CHAPTER 5 · POINTERS + HEAP
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontFamily: T.display, fontWeight: 400,
            fontSize: "clamp(50px, 9vw, 108px)",
            lineHeight: 0.9, letterSpacing: 6, color: T.text, marginBottom: 22,
          }}>
          C
          <br />
          <motion.span
            animate={{ textShadow: [`0 0 50px ${T.neon}90`, `0 0 80px ${T.neon}B0`, `0 0 50px ${T.neon}90`] }}
            transition={{ duration: 2.2, repeat: Infinity }}
            style={{ color: T.neon }}>
            CHAPTER 5
          </motion.span>
        </motion.h1>

        <div style={{ height: 30, marginBottom: 34, overflow: "hidden" }}>
          <AnimatePresence mode="wait">
            <motion.p key={phase} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{ fontFamily: T.mono, fontSize: 13, color: T.neon2, letterSpacing: 1 }}>
              → {phases[phase]}
            </motion.p>
          </AnimatePresence>
        </div>

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}
          style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8, marginBottom: 44 }}>
          {TOPICS.map((t, i) => (
            <motion.div key={t.label}
              initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.65 + i * 0.06, type: "spring", stiffness: 280 }}
              whileHover={{ y: -5, boxShadow: `0 10px 35px ${t.color}50` }}
              style={{
                padding: "8px 18px", borderRadius: 7,
                background: `${t.color}10`, border: `1px solid ${t.color}35`,
                fontFamily: T.mono, fontSize: 10, color: t.color,
                display: "flex", alignItems: "center", gap: 7,
                transition: "box-shadow 0.2s",
              }}>
              <span style={{ fontSize: 13 }}>{t.icon}</span> {t.label}
            </motion.div>
          ))}
        </motion.div>

        <motion.button initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.05 }}
          whileHover={{ scale: 1.07, boxShadow: `0 0 55px ${T.neon}70` }}
          whileTap={{ scale: 0.96 }}
          onClick={() => document.getElementById("pointers")?.scrollIntoView({ behavior: "smooth" })}
          style={{
            fontFamily: T.display, fontWeight: 400, fontSize: 14, letterSpacing: 6,
            color: "#000", background: `linear-gradient(135deg, ${T.neon}, ${T.neon2})`,
            border: "none", borderRadius: 8, padding: "16px 50px", cursor: "pointer",
          }}>
          ENTER
        </motion.button>
      </div>

      <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 2.3, repeat: Infinity }}
        style={{ position: "absolute", bottom: 30, zIndex: 10, fontFamily: T.mono, fontSize: 8, letterSpacing: 6, color: T.muted }}>
        SCROLL
      </motion.div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SIDEBAR
// ─────────────────────────────────────────────────────────────────────────────
function Sidebar5({ activeSection }) {
  return (
    <aside style={{
      width: 215, minWidth: 215, flexShrink: 0,
      background: `linear-gradient(180deg, ${T.bg1} 0%, ${T.bg} 100%)`,
      borderRight: `1px solid ${T.dim}`,
      display: "flex", flexDirection: "column",
      padding: "26px 0", position: "sticky", top: 0, height: "100vh", overflow: "hidden",
    }}>
      <div style={{ padding: "0 18px 20px" }}>
        <div style={{ fontFamily: T.display, fontWeight: 400, fontSize: 18, letterSpacing: 4, color: T.neon }}>C LANG</div>
        <div style={{ fontFamily: T.mono, fontSize: 7, letterSpacing: 4, color: T.muted, marginTop: 2 }}>CH.5 · POINTERS</div>
      </div>
      <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${T.neon}40, transparent)`, marginBottom: 14 }} />
      <nav style={{ overflowY: "auto", flex: 1 }}>
        {NAV_ITEMS.map(item => {
          const isActive = activeSection === item.id;
          return (
            <motion.a key={item.id} href={`#${item.id}`}
              onClick={e => { e.preventDefault(); document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" }); }}
              animate={{ color: isActive ? T.neon : T.muted, background: isActive ? `${T.neon}08` : "transparent" }}
              whileHover={{ color: T.text, paddingLeft: 24 }}
              transition={{ duration: 0.18 }}
              style={{
                display: "flex", alignItems: "center", gap: 9,
                padding: "10px 18px", fontFamily: T.mono, fontSize: 10,
                fontWeight: 600, letterSpacing: 1.5, textDecoration: "none",
                borderLeft: `2px solid ${isActive ? T.neon : "transparent"}`,
              }}>
              <span style={{ fontSize: 11 }}>{item.icon}</span>
              <div>
                <div style={{ fontSize: 7, opacity: 0.4, marginBottom: 1 }}>{item.num}</div>
                {item.label}
              </div>
              {isActive && (
                <motion.div layoutId="nav-dot-c5"
                  style={{ width: 4, height: 4, borderRadius: "50%", background: T.neon, marginLeft: "auto" }} />
              )}
            </motion.a>
          );
        })}
      </nav>
      <div style={{ padding: "14px 18px", fontFamily: T.mono, fontSize: 9, color: T.dim, letterSpacing: 2, lineHeight: 2 }}>
        C VISUAL SIM<br />v5.0
      </div>
    </aside>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RIGHT PANEL (minimal text, with actual prev/next navigation)
// ─────────────────────────────────────────────────────────────────────────────
const DEEP5 = {
  hero:        { title: "Chapter 5",   color: T.neon,   why: "Pointers, structs and dynamic memory. Master these = understand all languages.", mistake: "Treating pointers as magic. They're just integers holding addresses.", model: "Every variable is a box. A pointer is a sticky note with the address of a box." },
  pointers:    { title: "Pointers",    color: T.neon,   why: "Pointer holds an address. That's all.", mistake: "Uninitialized pointer → crash.", model: "int *p: p holds address, *p is the value there." },
  "addr-deref":{ title: "& and *",     color: T.neon2,  why: "& gives address, * follows address.", mistake: "Confusing * in type vs * expression.", model: "& goes up, * goes down." },
  "ptr-arrays":{ title: "Ptr+Arrays",  color: T.neon4,  why: "arr[i] == *(arr+i).", mistake: "sizeof(ptr) != sizeof(arr).", model: "Array name = pointer that can't move." },
  structs:     { title: "Structs",     color: T.accent, why: "Group data together.", mistake: "Cannot compare structs with ==.", model: "Blueprint and house." },
  unions:      { title: "Unions",      color: T.neon3,  why: "Share memory, type punning.", mistake: "Write one, read another = undefined behavior.", model: "One box with many labels." },
  preproc:     { title: "Preprocessor",color: T.neon2,  why: "Text substitution before compile.", mistake: "#define SQ(x) x*x → precedence bugs.", model: "Find & replace." },
  dynmem:      { title: "Dyn Memory",  color: T.neon2,  why: "Heap allocation for variable sizes.", mistake: "Memory leak = forgot free().", model: "Stack auto, heap manual." },
  engine:      { title: "Full Engine", color: T.neon,   why: "Real C programs combine all.", mistake: "Overusing pointers.", model: "Master C chapter 5 = understand internals of higher-level languages." },
};

function RightPanel5({ activeSection }) {
  const data = DEEP5[activeSection] || DEEP5.hero;
  const [liveTime, setLiveTime] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setLiveTime(t => t + 1), 1000);
    return () => clearInterval(iv);
  }, []);

  return (
    <aside style={{
      width: 285, minWidth: 285, flexShrink: 0,
      background: `linear-gradient(180deg, ${T.bg1} 0%, ${T.bg} 100%)`,
      borderLeft: `1px solid ${T.dim}`,
      padding: "26px 14px",
      display: "flex", flexDirection: "column", gap: 12,
      overflowY: "auto", overflowX: "hidden",
      position: "sticky", top: 0, height: "100vh",
    }}>
      <div>
        <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 5, color: T.neon, marginBottom: 8 }}>DEEP</div>
        <div style={{ height: 1, background: `linear-gradient(90deg, ${T.neon}40, transparent)` }} />
      </div>

      <div style={{ background: `${T.neon}05`, border: `1px solid ${T.neon}18`, borderRadius: 9, padding: "10px 12px" }}>
        <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 4, color: T.neon, marginBottom: 8 }}>⚙ LIVE</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[
            { label: "SECTION", value: (activeSection || "hero").toUpperCase().slice(0, 8), color: data.color },
            { label: "UPTIME",  value: `${liveTime}s`, color: T.neon2 },
            { label: "TOPICS",  value: "8", color: T.neon4 },
            { label: "ENGINE",  value: "LIVE", color: T.neon },
          ].map(({ label, value, color }) => (
            <div key={label}>
              <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 2, color: T.muted }}>{label}</div>
              <motion.div key={value} initial={{ opacity: 0.4 }} animate={{ opacity: 1 }}
                style={{ fontFamily: T.mono, fontSize: 12, fontWeight: 700, color }}>{value}</motion.div>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeSection} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.28 }}
          style={{ display: "flex", flexDirection: "column", gap: 10 }}>

          <div style={{ padding: "12px 14px", borderRadius: 10, background: `${data.color}10`, border: `1px solid ${data.color}35` }}>
            <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 3, color: data.color, marginBottom: 4 }}>CURRENT</div>
            <div style={{ fontFamily: T.display, fontSize: 20, fontWeight: 400, letterSpacing: 3, color: data.color }}>{data.title}</div>
          </div>

          <div style={{ padding: "14px", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: `1px solid ${T.dim}` }}>
            <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 3, color: T.neon, marginBottom: 8 }}>💡 WHY</div>
            <div style={{ fontFamily: T.mono, fontSize: 11, color: T.text, lineHeight: 1.85 }}>{data.why}</div>
          </div>

          <div style={{ padding: "14px", borderRadius: 10, background: `${T.neon3}08`, border: `1px solid ${T.neon3}25` }}>
            <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 3, color: T.neon3, marginBottom: 8 }}>⚠ MISTAKE</div>
            <div style={{ fontFamily: T.mono, fontSize: 11, color: T.text, lineHeight: 1.85 }}>{data.mistake}</div>
          </div>

          <div style={{ padding: "14px", borderRadius: 10, background: `${data.color}08`, border: `1px solid ${data.color}20` }}>
            <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 3, color: data.color, marginBottom: 8 }}>🧠 MODEL</div>
            <div style={{ fontFamily: T.mono, fontSize: 11, color: T.text, lineHeight: 1.85, fontStyle: "italic" }}>"{data.model}"</div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div style={{ marginTop: "auto" }}>
        <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${T.dim}, transparent)`, marginBottom: 12 }} />
        <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 3, color: T.muted, marginBottom: 8 }}>CHAPTER NAVIGATION</div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href="/c-4" passHref legacyBehavior>
            <motion.a whileHover={{ color: T.neon, scale: 1.02 }} style={{
              flex: 1, textAlign: "center", padding: "7px", borderRadius: 6,
              background: "transparent", border: `1px solid ${T.dim}`,
              fontFamily: T.mono, fontSize: 9, color: T.muted, textDecoration: "none", cursor: "pointer",
            }}>
              ← C4
            </motion.a>
          </Link>
          <Link href="/c-6" passHref legacyBehavior>
            <motion.a whileHover={{ color: T.neon, scale: 1.02 }} style={{
              flex: 1, textAlign: "center", padding: "7px", borderRadius: 6,
              background: "transparent", border: `1px solid ${T.dim}`,
              fontFamily: T.mono, fontSize: 9, color: T.muted, textDecoration: "none", cursor: "pointer",
            }}>
              C6 →
            </motion.a>
          </Link>
        </div>
      </div>
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
      entries => {
        entries.forEach(e => { if (e.isIntersecting) setActiveSection(e.target.id); });
      },
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
        input[type=range] { height: 4px; cursor: pointer; }
        a { text-decoration: none; }
        button { outline: none; }
      `}</style>

      <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: T.bg }}>
        <Sidebar5 activeSection={activeSection} />

        <main style={{ flex: 1, overflowY: "auto", overflowX: "hidden", minWidth: 0 }}>
          <div style={{ maxWidth: "100%", padding: "0 38px" }}>
            <HeroSection5 />
            <PointersSection />
            <AddrDerefSection />
            <PtrArraysSection />
            <StructsSection />
            <UnionsSection />
            <PreprocessorSection />
            <DynMemSection />
            <EngineSection5 />
            <div style={{ height: 80 }} />
          </div>
        </main>

        <RightPanel5 activeSection={activeSection} />
      </div>
    </>
  );
}