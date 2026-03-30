"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN TOKENS
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
  { id: "hero",       label: "INTRO",       num: "00", icon: "◈" },
  { id: "ram",        label: "RAM MODEL",   num: "01", icon: "⬜" },
  { id: "pointers",   label: "POINTERS",    num: "02", icon: "→" },
  { id: "ops",        label: "& * OPS",     num: "03", icon: "&" },
  { id: "ptr-fn",     label: "PTR + FN",    num: "04", icon: "ƒ" },
  { id: "recursion",  label: "RECURSION",   num: "05", icon: "↻" },
  { id: "callstack",  label: "CALL STACK",  num: "06", icon: "⧖" },
  { id: "engine",     label: "ENGINE",      num: "07", icon: "🚀" },
];

// ─────────────────────────────────────────────────────────────────────────────
// SHARED PRIMITIVES
// ─────────────────────────────────────────────────────────────────────────────
function GlassCard({ children, style = {}, hover = true, glowColor = T.neon, onClick }) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={hover ? { borderColor: `${glowColor}50`, boxShadow: `0 8px 60px rgba(0,0,0,0.7), 0 0 40px ${glowColor}18` } : {}}
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
    <section id={id} style={{ padding: "80px 0", borderBottom: `1px solid ${T.dim}`, ...style }}>
      {children}
    </section>
  );
}

function SectionHeader({ num, tag, title, subtitle, color = T.neon }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      style={{ marginBottom: 44 }}
    >
      <div style={{ display: "flex", alignItems: "flex-end", gap: 20, marginBottom: subtitle ? 14 : 0 }}>
        <span style={{ fontFamily: T.mono, fontSize: 52, fontWeight: 700, color: T.dim, lineHeight: 1, letterSpacing: -2 }}>{num}</span>
        <div>
          <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 5, color, fontWeight: 600, marginBottom: 5 }}>{tag}</div>
          <h2 style={{ fontFamily: T.display, fontSize: 38, fontWeight: 400, color: T.text, letterSpacing: 3, lineHeight: 1 }}>{title}</h2>
        </div>
      </div>
      {subtitle && (
        <div style={{
          fontFamily: T.mono, fontSize: 12, color: T.muted, lineHeight: 1.9,
          maxWidth: 620, marginLeft: 80,
          borderLeft: `2px solid ${color}40`, paddingLeft: 16,
        }}>{subtitle}</div>
      )}
    </motion.div>
  );
}

function Pill({ children, color = T.neon, active = false, onClick, style = {} }) {
  return (
    <motion.button
      whileHover={{ scale: 1.06, y: -2 }} whileTap={{ scale: 0.95 }}
      onClick={onClick}
      style={{
        fontFamily: T.mono, fontSize: 10, fontWeight: 600, letterSpacing: 2,
        color: active ? "#000" : color,
        background: active ? color : `${color}12`,
        border: `1px solid ${active ? color : `${color}40`}`,
        borderRadius: 6, padding: "7px 16px", cursor: "pointer",
        boxShadow: active ? `0 0 20px ${color}50` : "none",
        transition: "all 0.18s", ...style,
      }}
    >{children}</motion.button>
  );
}

// Animated SVG arrow between two DOM elements
function SvgArrow({ from, to, color = T.neon, label = "", visible = true, animated = true }) {
  const [coords, setCoords] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!from?.current || !to?.current || !containerRef.current) return;
    const update = () => {
      const container = containerRef.current.getBoundingClientRect();
      const a = from.current.getBoundingClientRect();
      const b = to.current.getBoundingClientRect();
      setCoords({
        x1: a.right - container.left,
        y1: a.top + a.height / 2 - container.top,
        x2: b.left - container.left,
        y2: b.top + b.height / 2 - container.top,
      });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [from, to]);

  return (
    <div ref={containerRef} style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 10 }}>
      {coords && visible && (
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" }}>
          <defs>
            <marker id={`arrow-${color.replace("#","")}`} markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L8,3 z" fill={color} />
            </marker>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          <motion.path
            d={`M ${coords.x1} ${coords.y1} C ${coords.x1 + 60} ${coords.y1}, ${coords.x2 - 60} ${coords.y2}, ${coords.x2 - 10} ${coords.y2}`}
            fill="none" stroke={color} strokeWidth="2.5" strokeDasharray="8 4"
            markerEnd={`url(#arrow-${color.replace("#","")})`}
            filter="url(#glow)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          />
          {label && (
            <motion.text
              x={(coords.x1 + coords.x2) / 2}
              y={Math.min(coords.y1, coords.y2) - 10}
              textAnchor="middle"
              fill={color}
              fontSize="9"
              fontFamily={T.mono}
              letterSpacing="2"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            >{label}</motion.text>
          )}
        </svg>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HERO
// ─────────────────────────────────────────────────────────────────────────────
function HeroSection() {
  const canvasRef = useRef(null);
  const [phase, setPhase] = useState(0);
  const phrases = [
    "pointer = variable that stores an address",
    "*p = follow the arrow to RAM",
    "&x = the house number where x lives",
    "recursion = function that calls itself",
    "base case = when to stop calling",
    "call stack = tower of waiting frames",
  ];

  useEffect(() => {
    const iv = setInterval(() => setPhase(p => (p + 1) % phrases.length), 2800);
    return () => clearInterval(iv);
  }, []);

  // GSAP-style particle canvas — pure JS canvas animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf;
    let W = canvas.width = window.innerWidth;
    let H = canvas.height = window.innerHeight;

    const HEX_CHARS = "0x1000 0x1004 0x1008 *p &x int* NULL ptr addr".split(" ");
    const particles = Array.from({ length: 55 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vy: -(0.15 + Math.random() * 0.3),
      vx: (Math.random() - 0.5) * 0.1,
      alpha: Math.random() * 0.35 + 0.05,
      size: 9 + Math.floor(Math.random() * 5),
      char: HEX_CHARS[Math.floor(Math.random() * HEX_CHARS.length)],
      color: [T.neon, T.neon2, T.neon4, T.muted][Math.floor(Math.random() * 4)],
    }));

    const loop = () => {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => {
        p.y += p.vy;
        p.x += p.vx;
        if (p.y < -20) { p.y = H + 10; p.x = Math.random() * W; }
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.font = `${p.size}px 'Fira Code', monospace`;
        ctx.fillText(p.char, p.x, p.y);
      });
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(loop);
    };
    loop();
    const onResize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); };
  }, []);

  const TOPICS = [
    { label: "Variables in RAM",     icon: "⬜", color: T.neon4 },
    { label: "Address-of  &",        icon: "&",  color: T.neon2 },
    { label: "Dereference  *",       icon: "*",  color: T.neon },
    { label: "Pointer Arithmetic",   icon: "++", color: T.accent },
    { label: "Pass by Pointer",      icon: "ƒ",  color: T.neon3 },
    { label: "Base Case",            icon: "⊡",  color: T.neon4 },
    { label: "Recursive Call",       icon: "↻",  color: T.neon2 },
    { label: "Stack Frames",         icon: "⧖",  color: T.neon },
    { label: "Stack Overflow",       icon: "☠",  color: T.neon3 },
  ];

  return (
    <section id="hero" style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      position: "relative", overflow: "hidden",
      background: `radial-gradient(ellipse 80% 50% at 50% -5%, rgba(255,100,0,0.09) 0%, transparent 60%),
                   radial-gradient(ellipse 50% 35% at 85% 75%, rgba(168,85,247,0.07) 0%, transparent 55%),
                   radial-gradient(ellipse 35% 25% at 10% 85%, rgba(0,229,255,0.05) 0%, transparent 55%), ${T.bg}`,
    }}>
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none", opacity: 0.45 }} />
      <div style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none", backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,100,0,0.012) 2px, rgba(255,100,0,0.012) 4px)" }} />

      <div style={{ position: "relative", zIndex: 10, textAlign: "center", maxWidth: 940, padding: "0 24px" }}>
        <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          style={{ display: "inline-flex", alignItems: "center", gap: 10, fontFamily: T.mono, fontSize: 9, letterSpacing: 5, color: T.neon, border: `1px solid ${T.border}`, background: "rgba(255,100,0,0.05)", padding: "7px 22px", borderRadius: 100, marginBottom: 30 }}>
          <motion.span animate={{ opacity: [1, 0.1, 1], scale: [1, 0.6, 1] }} transition={{ duration: 1.1, repeat: Infinity }}
            style={{ width: 5, height: 5, borderRadius: "50%", background: T.neon, display: "inline-block" }} />
          C · CHAPTER 7 · POINTERS + RECURSION
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
          style={{ fontFamily: T.display, fontWeight: 400, fontSize: "clamp(50px, 9vw, 108px)", lineHeight: 0.9, letterSpacing: 6, color: T.text, marginBottom: 22 }}>
          FINAL
          <br />
          <motion.span
            animate={{ textShadow: [`0 0 50px ${T.neon}90`, `0 0 80px ${T.neon}B0`, `0 0 50px ${T.neon}90`] }}
            transition={{ duration: 2.2, repeat: Infinity }}
            style={{ color: T.neon }}>CHAPTER</motion.span>
        </motion.h1>

        <div style={{ height: 32, marginBottom: 36, overflow: "hidden" }}>
          <AnimatePresence mode="wait">
            <motion.p key={phase} initial={{ y: 22, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -22, opacity: 0 }}
              transition={{ duration: 0.32 }}
              style={{ fontFamily: T.mono, fontSize: 13, color: T.neon2, letterSpacing: 1 }}>
              → {phrases[phase]}
            </motion.p>
          </AnimatePresence>
        </div>

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}
          style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8, marginBottom: 46 }}>
          {TOPICS.map((t, i) => (
            <motion.div key={t.label}
              initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.65 + i * 0.06, type: "spring", stiffness: 280 }}
              whileHover={{ y: -5, boxShadow: `0 10px 35px ${t.color}50` }}
              style={{ padding: "8px 18px", borderRadius: 7, background: `${t.color}10`, border: `1px solid ${t.color}35`, fontFamily: T.mono, fontSize: 10, color: t.color, display: "flex", alignItems: "center", gap: 7, transition: "box-shadow 0.2s" }}>
              <span style={{ fontSize: 13 }}>{t.icon}</span> {t.label}
            </motion.div>
          ))}
        </motion.div>

        <motion.button initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.05 }}
          whileHover={{ scale: 1.07, boxShadow: `0 0 55px ${T.neon}70` }} whileTap={{ scale: 0.96 }}
          onClick={() => document.getElementById("ram")?.scrollIntoView({ behavior: "smooth" })}
          style={{ fontFamily: T.display, fontSize: 14, letterSpacing: 6, color: "#000", background: `linear-gradient(135deg, ${T.neon}, ${T.neon2})`, border: "none", borderRadius: 8, padding: "16px 50px", cursor: "pointer" }}>
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
// SECTION 01 — RAM MODEL (the true mental model)
// ─────────────────────────────────────────────────────────────────────────────
function RamSection() {
  const [step, setStep] = useState(0);
  const [hovered, setHovered] = useState(null);
  const totalSteps = 4;

  const CONCEPTS = [
    {
      title: "RAM is just a giant array",
      sub: "Every byte has a unique index — its ADDRESS",
      color: T.neon,
      cells: [
        { addr: "0x00", val: "??", label: "", empty: true },
        { addr: "0x01", val: "??", label: "", empty: true },
        { addr: "0x02", val: "??", label: "", empty: true },
        { addr: "0x03", val: "??", label: "", empty: true },
        { addr: "0x04", val: "??", label: "", empty: true },
        { addr: "0x05", val: "??", label: "", empty: true },
      ],
      insight: "Think of RAM as a street. Each house has a number (address). Each house stores data (value). The CPU knows every house by its number.",
    },
    {
      title: "Declare int a = 42",
      sub: "Compiler reserves 4 bytes, fills them with 42",
      color: T.neon4,
      cells: [
        { addr: "0x1000", val: "42", label: "a", type: "int", color: T.neon4 },
        { addr: "0x1001", val: "0", label: "", part: true, color: T.neon4 },
        { addr: "0x1002", val: "0", label: "", part: true, color: T.neon4 },
        { addr: "0x1003", val: "0", label: "", part: true, color: T.neon4 },
        { addr: "0x1004", val: "??", label: "", empty: true },
        { addr: "0x1005", val: "??", label: "", empty: true },
      ],
      insight: "int is 4 bytes. So variable 'a' occupies addresses 0x1000–0x1003. The address of 'a' = the FIRST byte = 0x1000. That's what &a gives you.",
    },
    {
      title: "Declare int b = 99",
      sub: "Next variable goes right after — address 0x1004",
      color: T.neon2,
      cells: [
        { addr: "0x1000", val: "42", label: "a", type: "int", color: T.neon4 },
        { addr: "0x1001", val: "0",  label: "", part: true, color: T.neon4 },
        { addr: "0x1002", val: "0",  label: "", part: true, color: T.neon4 },
        { addr: "0x1003", val: "0",  label: "", part: true, color: T.neon4 },
        { addr: "0x1004", val: "99", label: "b", type: "int", color: T.neon2 },
        { addr: "0x1005", val: "0",  label: "", part: true, color: T.neon2 },
      ],
      insight: "Variables sit next to each other in RAM. &a = 0x1000, &b = 0x1004. Distance = 4 (size of int). This is WHY pointer arithmetic works: ptr+1 means 'jump one int forward'.",
    },
    {
      title: "Pointer = stores an address",
      sub: "int *p = &a stores 0x1000 inside p",
      color: T.neon,
      cells: [
        { addr: "0x1000", val: "42",     label: "a",  type: "int",  color: T.neon4 },
        { addr: "0x1004", val: "99",     label: "b",  type: "int",  color: T.neon2 },
        { addr: "0x1008", val: "0x1000", label: "p",  type: "int*", color: T.neon, isPtr: true, pointsTo: "0x1000" },
      ],
      insight: "p is a variable too! It lives at 0x1008 and holds the VALUE 0x1000 (address of a). When you say *p, CPU reads p, gets 0x1000, then goes to address 0x1000 and reads 42.",
    },
  ];

  const current = CONCEPTS[step];

  return (
    <Section id="ram">
      <SectionHeader
        num="01" tag="RAM MODEL" title="MEMORY IS AN ARRAY"
        color={T.neon}
        subtitle="Before pointers make sense, you must SEE what RAM looks like. Every variable is just bytes at an address. A pointer is just a variable that stores an address — that's literally it."
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
        <GlassCard style={{ padding: 30 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
            {CONCEPTS.map((c, i) => (
              <Pill key={i} color={c.color} active={step === i} onClick={() => setStep(i)}>STEP {i + 1}</Pill>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3 }}>
              <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 4, color: current.color, marginBottom: 6 }}>▸ {current.title.toUpperCase()}</div>
              <div style={{ fontFamily: T.mono, fontSize: 11, color: T.muted, marginBottom: 24 }}>{current.sub}</div>

              {/* Memory grid */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 24 }}>
                {current.cells.map((cell, i) => (
                  <motion.div key={i}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.07, type: "spring", stiffness: 240 }}
                    onMouseEnter={() => setHovered(i)}
                    onMouseLeave={() => setHovered(null)}
                    style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {/* Address tag */}
                    <div style={{ width: 76, fontFamily: T.mono, fontSize: 9, color: T.muted, textAlign: "right" }}>{cell.addr}</div>

                    {/* Cell box */}
                    <motion.div
                      animate={{
                        borderColor: hovered === i ? (cell.color || T.muted) : `${cell.color || T.muted}${cell.empty ? "15" : "35"}`,
                        background: hovered === i ? `${cell.color || T.muted}20` : `${cell.color || T.muted}${cell.empty ? "05" : "0A"}`,
                        boxShadow: hovered === i && !cell.empty ? `0 0 30px ${cell.color}50` : "none",
                      }}
                      style={{ flex: 1, height: 50, borderRadius: 8, border: "2px solid", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px" }}>
                      <div>
                        {!cell.empty && !cell.part && (
                          <div style={{ fontFamily: T.mono, fontSize: 8, color: T.muted, marginBottom: 2 }}>
                            {cell.type} <span style={{ color: cell.color }}>{cell.label}</span>
                          </div>
                        )}
                        {cell.part && <div style={{ fontFamily: T.mono, fontSize: 8, color: T.dim }}>continuation...</div>}
                      </div>
                      <span style={{ fontFamily: T.mono, fontSize: cell.isPtr ? 12 : 18, fontWeight: 700, color: cell.empty ? T.dim : (cell.color || T.muted) }}>
                        {String(cell.val)}
                      </span>
                    </motion.div>

                    {/* Arrow indicator */}
                    {cell.isPtr && (
                      <motion.div animate={{ x: [0, 4, 0] }} transition={{ duration: 1.2, repeat: Infinity }}
                        style={{ fontFamily: T.mono, fontSize: 14, color: T.neon }}>→</motion.div>
                    )}
                    {!cell.isPtr && <div style={{ width: 20 }} />}
                  </motion.div>
                ))}
              </div>

              {/* Insight */}
              <motion.div
                key={`insight-${step}`}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                style={{ padding: "16px", borderRadius: 10, background: `${current.color}08`, border: `1px solid ${current.color}30` }}>
                <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 4, color: current.color, marginBottom: 8 }}>💡 INSIGHT</div>
                <div style={{ fontFamily: T.mono, fontSize: 11, color: T.text, lineHeight: 1.9 }}>{current.insight}</div>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </GlassCard>

        {/* Right: the BIG mental model diagram */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <GlassCard style={{ padding: 26 }}>
            <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 4, color: T.neon2, marginBottom: 20 }}>🧠 THE CORE MENTAL MODEL</div>

            {/* Visual: variable vs pointer side by side */}
            <div style={{ display: "flex", gap: 12, marginBottom: 24, alignItems: "center" }}>
              {/* Box A — normal variable */}
              <div style={{ flex: 1, textAlign: "center" }}>
                <div style={{ fontFamily: T.mono, fontSize: 8, color: T.muted, marginBottom: 8, letterSpacing: 3 }}>NORMAL VAR</div>
                <motion.div
                  animate={{ boxShadow: [`0 0 15px ${T.neon4}40`, `0 0 30px ${T.neon4}70`, `0 0 15px ${T.neon4}40`] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{ background: `${T.neon4}12`, border: `2px solid ${T.neon4}`, borderRadius: 10, padding: "20px 14px", position: "relative" }}>
                  <div style={{ fontFamily: T.mono, fontSize: 8, color: T.neon4, marginBottom: 4 }}>int a</div>
                  <div style={{ fontFamily: T.mono, fontSize: 28, fontWeight: 700, color: T.neon4 }}>42</div>
                  <div style={{ fontFamily: T.mono, fontSize: 8, color: T.muted, marginTop: 6 }}>@ 0x1000</div>
                </motion.div>
                <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, marginTop: 8 }}>stores DATA</div>
              </div>

              {/* Arrow */}
              <div style={{ textAlign: "center" }}>
                <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }} transition={{ duration: 1.5, repeat: Infinity }}
                  style={{ fontFamily: T.mono, fontSize: 20, color: T.neon }}>VS</motion.div>
              </div>

              {/* Box B — pointer */}
              <div style={{ flex: 1, textAlign: "center" }}>
                <div style={{ fontFamily: T.mono, fontSize: 8, color: T.muted, marginBottom: 8, letterSpacing: 3 }}>POINTER VAR</div>
                <motion.div
                  animate={{ boxShadow: [`0 0 15px ${T.neon}40`, `0 0 30px ${T.neon}70`, `0 0 15px ${T.neon}40`] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                  style={{ background: `${T.neon}12`, border: `2px solid ${T.neon}`, borderRadius: 10, padding: "20px 14px" }}>
                  <div style={{ fontFamily: T.mono, fontSize: 8, color: T.neon, marginBottom: 4 }}>int* p</div>
                  <div style={{ fontFamily: T.mono, fontSize: 16, fontWeight: 700, color: T.neon }}>0x1000</div>
                  <div style={{ fontFamily: T.mono, fontSize: 8, color: T.muted, marginTop: 6 }}>@ 0x1008</div>
                </motion.div>
                <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, marginTop: 8 }}>stores ADDRESS</div>
              </div>
            </div>

            {/* Key facts */}
            {[
              { icon: "1", color: T.neon4, text: "int a = 42   → stores 42 at address 0x1000" },
              { icon: "2", color: T.neon2, text: "int *p = &a  → stores 0x1000 at address 0x1008" },
              { icon: "3", color: T.neon,  text: "p == 0x1000  (the address itself)" },
              { icon: "4", color: T.neon3, text: "*p == 42     (go to 0x1000, read value)" },
            ].map((f, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, x: 10 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                style={{ display: "flex", gap: 12, alignItems: "center", padding: "8px 12px", borderRadius: 7, marginBottom: 6, background: `${f.color}08`, border: `1px solid ${f.color}22` }}>
                <div style={{ width: 18, height: 18, borderRadius: "50%", background: f.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontFamily: T.mono, color: "#000", flexShrink: 0 }}>{f.icon}</div>
                <div style={{ fontFamily: T.mono, fontSize: 11, color: T.text }}>{f.text}</div>
              </motion.div>
            ))}
          </GlassCard>

          <GlassCard style={{ padding: 22 }} glowColor={T.neon3}>
            <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 4, color: T.neon3, marginBottom: 14 }}>⚠ SIZES MATTER</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[
                { type: "char",   size: "1 byte",  color: T.neon4 },
                { type: "int",    size: "4 bytes", color: T.neon2 },
                { type: "float",  size: "4 bytes", color: T.neon },
                { type: "double", size: "8 bytes", color: T.accent },
                { type: "int*",   size: "8 bytes", color: T.neon3, note: "on 64-bit" },
                { type: "char*",  size: "8 bytes", color: T.neon3, note: "same!" },
              ].map((t, i) => (
                <div key={i} style={{ padding: "8px 10px", borderRadius: 6, background: `${t.color}08`, border: `1px solid ${t.color}25` }}>
                  <span style={{ fontFamily: T.mono, fontSize: 11, color: t.color }}>{t.type}</span>
                  <span style={{ fontFamily: T.mono, fontSize: 10, color: T.muted }}> → {t.size}</span>
                  {t.note && <div style={{ fontFamily: T.mono, fontSize: 8, color: T.dim }}>{t.note}</div>}
                </div>
              ))}
            </div>
            <div style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, marginTop: 12, lineHeight: 1.8 }}>
              All pointers are the same size (8 bytes on 64-bit) because they all store addresses, and addresses are just 64-bit integers.
            </div>
          </GlassCard>
        </div>
      </div>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 02 — POINTERS LIVE (step by step animation)
// ─────────────────────────────────────────────────────────────────────────────
function PointersSection() {
  const [step, setStep] = useState(-1);
  const [running, setRunning] = useState(false);
  const runRef = useRef(false);
  const boxARef = useRef(null);
  const boxPRef = useRef(null);
  const [arrowVisible, setArrowVisible] = useState(false);

  const STEPS = [
    { code: "int x = 42;",        desc: "CPU allocates 4 bytes at address 0x2000. Writes 42 into those bytes.", x: 42, ptrSet: false, deref: null },
    { code: "int *ptr;",           desc: "CPU allocates 8 bytes for ptr (it's a pointer). Not yet assigned — contains garbage!", x: 42, ptrSet: false, deref: null },
    { code: "ptr = &x;",          desc: "&x evaluates to 0x2000 (address of x). That value is stored inside ptr. Arrow drawn!", x: 42, ptrSet: true, deref: null },
    { code: "printf(\"%p\", ptr);", desc: "Print ptr's value = 0x2000. We're printing the ADDRESS, not the value at that address.", x: 42, ptrSet: true, deref: "addr" },
    { code: "printf(\"%d\", *ptr);", desc: "*ptr = DEREFERENCE. CPU reads ptr → gets 0x2000 → goes to address 0x2000 → reads 42.", x: 42, ptrSet: true, deref: "value" },
    { code: "*ptr = 999;",         desc: "*ptr on LEFT side = WRITE. CPU reads ptr → gets 0x2000 → goes there → writes 999. x is now 999!", x: 999, ptrSet: true, deref: "write" },
  ];

  const current = step >= 0 ? STEPS[step] : null;

  const run = async () => {
    if (runRef.current) return;
    runRef.current = true;
    setRunning(true);
    setArrowVisible(false);
    for (let i = 0; i < STEPS.length; i++) {
      if (!runRef.current) break;
      setStep(i);
      if (STEPS[i].ptrSet) setArrowVisible(true);
      await new Promise(r => setTimeout(r, 1100));
    }
    runRef.current = false;
    setRunning(false);
  };

  const reset = () => { runRef.current = false; setRunning(false); setStep(-1); setArrowVisible(false); };

  return (
    <Section id="pointers">
      <SectionHeader
        num="02" tag="POINTERS" title="FOLLOW THE ARROW"
        color={T.neon}
        subtitle="A pointer is just a variable that holds an address. There's no magic. When you write *ptr, the CPU follows the stored address — like following a road sign to a destination."
      />

      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 28 }}>
        <GlassCard style={{ padding: 30 }}>
          <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 4, color: T.neon, marginBottom: 24 }}>→ LIVE MEMORY SIMULATION</div>

          {/* Memory visualization */}
          <div style={{ position: "relative", marginBottom: 28 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Variable x */}
              <motion.div ref={boxARef}
                animate={{
                  borderColor: current?.ptrSet ? `${T.neon4}80` : `${T.neon4}30`,
                  background: current?.deref === "write" ? `${T.neon4}35` : current?.deref === "value" ? `${T.neon4}22` : step >= 0 ? `${T.neon4}10` : `${T.neon4}05`,
                  boxShadow: current?.deref ? `0 0 40px ${T.neon4}60` : step >= 0 ? `0 0 20px ${T.neon4}30` : "none",
                }}
                style={{ padding: "18px 20px", borderRadius: 12, border: "2px solid" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontFamily: T.mono, fontSize: 8, color: T.muted, marginBottom: 4 }}>ADDRESS: 0x2000</div>
                    <div style={{ fontFamily: T.mono, fontSize: 10, color: T.neon4 }}>int x</div>
                  </div>
                  <motion.div key={current?.x}
                    animate={{ scale: [1.5, 1] }} transition={{ duration: 0.3 }}
                    style={{ fontFamily: T.mono, fontSize: 32, fontWeight: 700, color: T.neon4 }}>
                    {step >= 0 ? String(current.x) : "?"}
                  </motion.div>
                </div>
                {current?.deref === "value" && (
                  <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                    style={{ fontFamily: T.mono, fontSize: 9, color: T.neon4, marginTop: 8, letterSpacing: 2 }}>
                    ← CPU reads this value via *ptr
                  </motion.div>
                )}
                {current?.deref === "write" && (
                  <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                    style={{ fontFamily: T.mono, fontSize: 9, color: T.neon3, marginTop: 8, letterSpacing: 2 }}>
                    ← CPU WROTE here via *ptr = 999
                  </motion.div>
                )}
              </motion.div>

              {/* Spacer with arrow hint */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "4px 20px" }}>
                <div style={{ flex: 1, height: 1, background: `${T.dim}` }} />
                {arrowVisible && (
                  <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
                    style={{ fontFamily: T.mono, fontSize: 9, color: T.neon, letterSpacing: 2 }}>
                    ptr points HERE ↑
                  </motion.div>
                )}
                <div style={{ flex: 1, height: 1, background: `${T.dim}` }} />
              </div>

              {/* Pointer ptr */}
              <motion.div ref={boxPRef}
                animate={{
                  borderColor: step >= 2 ? `${T.neon}80` : step >= 1 ? `${T.neon}30` : `${T.muted}20`,
                  background: step >= 2 ? `${T.neon}10` : step >= 1 ? `${T.neon}05` : "transparent",
                  boxShadow: step >= 2 ? `0 0 25px ${T.neon}40` : "none",
                }}
                style={{ padding: "18px 20px", borderRadius: 12, border: "2px solid" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontFamily: T.mono, fontSize: 8, color: T.muted, marginBottom: 4 }}>ADDRESS: 0x2008</div>
                    <div style={{ fontFamily: T.mono, fontSize: 10, color: T.neon }}>int* ptr</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <motion.div key={`ptr-${step}`} animate={{ scale: [1.3, 1] }} transition={{ duration: 0.25 }}
                      style={{ fontFamily: T.mono, fontSize: step >= 2 ? 16 : 14, fontWeight: 700, color: step >= 2 ? T.neon : T.muted }}>
                      {step < 1 ? "N/A" : step === 1 ? "garbage" : "0x2000"}
                    </motion.div>
                    {step >= 2 && <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted }}>= address of x</div>}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* SVG arrow from ptr → x when assigned */}
            <AnimatePresence>
              {arrowVisible && (
                <motion.svg
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "visible", width: "100%", height: "100%" }}
                >
                  <defs>
                    <marker id="arrow-neon" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
                      <path d="M0,0 L0,6 L8,3 z" fill={T.neon} />
                    </marker>
                    <filter id="arrowglow"><feGaussianBlur stdDeviation="2.5" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
                  </defs>
                  <motion.path
                    d="M 380 200 C 430 200 430 80 380 80"
                    fill="none" stroke={T.neon} strokeWidth="3" strokeDasharray="8 4"
                    markerEnd="url(#arrow-neon)" filter="url(#arrowglow)"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                  />
                  <motion.text x="440" y="145" textAnchor="middle" fill={T.neon} fontSize="9" fontFamily={T.mono} letterSpacing="1"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
                    ptr → x
                  </motion.text>
                </motion.svg>
              )}
            </AnimatePresence>
          </div>

          {/* Output / description */}
          <AnimatePresence mode="wait">
            <motion.div key={step}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ padding: "14px 16px", borderRadius: 10, marginBottom: 18, background: `${T.neon}0A`, border: `1px solid ${T.neon}30` }}>
              {step >= 0 ? (
                <>
                  <div style={{ fontFamily: T.mono, fontSize: 11, color: T.neon, marginBottom: 6 }}>
                    <span style={{ color: T.dim }}>&gt; </span>{current.code}
                  </div>
                  <div style={{ fontFamily: T.mono, fontSize: 11, color: T.text, lineHeight: 1.8 }}>{current.desc}</div>
                  {(current.deref === "addr" || current.deref === "value") && (
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                      style={{ marginTop: 10, padding: "8px 14px", borderRadius: 7, background: `${T.neon4}15`, border: `1px solid ${T.neon4}40`, fontFamily: T.mono, fontSize: 12, fontWeight: 700, color: T.neon4 }}>
                      OUTPUT: {current.deref === "addr" ? "0x2000" : "42"}
                    </motion.div>
                  )}
                </>
              ) : (
                <div style={{ fontFamily: T.mono, fontSize: 11, color: T.muted }}>Press ▶ RUN to simulate line by line →</div>
              )}
            </motion.div>
          </AnimatePresence>

          <div style={{ display: "flex", gap: 10 }}>
            <motion.button whileHover={{ scale: 1.04, boxShadow: `0 0 35px ${T.neon}60` }} whileTap={{ scale: 0.97 }}
              onClick={run} disabled={running}
              style={{ flex: 1, fontFamily: T.display, fontSize: 14, letterSpacing: 4, color: "#000", background: running ? T.muted : `linear-gradient(135deg, ${T.neon}, ${T.neon2})`, border: "none", borderRadius: 8, padding: "13px", cursor: running ? "not-allowed" : "pointer" }}>
              {running ? "RUNNING…" : "▶ RUN STEP BY STEP"}
            </motion.button>
            <motion.button whileTap={{ scale: 0.96 }} onClick={reset}
              style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, background: "transparent", border: `1px solid ${T.dim}`, borderRadius: 8, padding: "13px 18px", cursor: "pointer" }}>↺</motion.button>
          </div>
        </GlassCard>

        {/* Right side: code + explanation */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <GlassCard style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "8px 14px", borderBottom: `1px solid ${T.dim}`, display: "flex", gap: 6, alignItems: "center" }}>
              {["#FF5F57","#FEBC2E","#28C840"].map((c, i) => <div key={i} style={{ width: 9, height: 9, borderRadius: "50%", background: c }} />)}
              <span style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, marginLeft: 8, letterSpacing: 2 }}>pointers.c</span>
            </div>
            <div style={{ padding: "14px 0" }}>
              {[
                "int x = 42;",
                "int *ptr;",
                "ptr = &x;",
                "",
                'printf("%p", ptr);   // 0x2000',
                'printf("%d", *ptr);  // 42',
                "",
                "*ptr = 999;",
                'printf("%d", x);     // 999 !!',
              ].map((line, i) => {
                const stepLine = current ? [0, 1, 2, -1, 3, 4, -1, 5, -1][i] : -1;
                const isActive = stepLine === step;
                return (
                  <motion.div key={i}
                    animate={{ background: isActive ? `${T.neon}1A` : "transparent", paddingLeft: isActive ? 22 : 18 }}
                    style={{ fontFamily: T.mono, fontSize: 12, lineHeight: 2.1, paddingRight: 18, borderLeft: `3px solid ${isActive ? T.neon : "transparent"}`, color: isActive ? T.neon : T.text, whiteSpace: "pre" }}>
                    <span style={{ color: T.dim, marginRight: 16, fontSize: 9, userSelect: "none" }}>{String(i + 1).padStart(2, " ")}</span>
                    {line}
                  </motion.div>
                );
              })}
            </div>
          </GlassCard>

          {/* Three laws */}
          {[
            { icon: "&", color: T.neon2,  title: "ADDRESS-OF  &x",      text: "Returns the memory address where x lives.\nResult type: int* (pointer to int)\nThis is how you get a pointer to any variable." },
            { icon: "*", color: T.neon,   title: "DEREFERENCE  *ptr",   text: "Follows the address stored in ptr.\nReads or writes the data at that address.\nLeft of = writes. Right of = reads." },
            { icon: "≡", color: T.neon4,  title: "DECLARATION  int *p", text: "The * in int *p means 'p is a pointer to int'\nDON'T confuse declaration * with dereference *\nSame symbol, different contexts!" },
          ].map((item, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              style={{ padding: "14px 16px", borderRadius: 10, background: `${item.color}08`, border: `1px solid ${item.color}28`, display: "flex", gap: 14 }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: `${item.color}20`, border: `1px solid ${item.color}50`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: T.mono, fontSize: 14, fontWeight: 700, color: item.color, flexShrink: 0 }}>{item.icon}</div>
              <div>
                <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 4, color: item.color, marginBottom: 5 }}>{item.title}</div>
                <div style={{ fontFamily: T.mono, fontSize: 11, color: T.text, lineHeight: 1.9, whiteSpace: "pre" }}>{item.text}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 03 — & and * OPERATOR DEEP DIVE
// ─────────────────────────────────────────────────────────────────────────────
function OpsSection() {
  const [val, setVal] = useState(7);
  const [pTarget, setPTarget] = useState("a");
  const [flash, setFlash] = useState(null);
  const [writeVal, setWriteVal] = useState(42);
  const [history, setHistory] = useState([]);

  const vars = { a: { val: val, addr: "0x3000", color: T.neon4 }, b: { val: 99, addr: "0x3004", color: T.neon2 } };
  const [bVal, setBVal] = useState(99);
  const allVars = { a: { val, addr: "0x3000", color: T.neon4 }, b: { val: bVal, addr: "0x3004", color: T.neon2 } };

  const doWrite = () => {
    const prev = pTarget === "a" ? val : bVal;
    if (pTarget === "a") { setVal(writeVal); setFlash("a"); }
    else { setBVal(writeVal); setFlash("b"); }
    setTimeout(() => setFlash(null), 900);
    setHistory(h => [...h.slice(-4), `*p = ${writeVal}  →  ${pTarget} changed: ${prev} → ${writeVal}`]);
  };

  const target = allVars[pTarget];

  return (
    <Section id="ops">
      <SectionHeader
        num="03" tag="& and * OPS" title="POINTER OPERATORS"
        color={T.neon2}
        subtitle="The & and * operators are the only two things you need to master. & gets an address. * follows an address. Use this playground until it's muscle memory."
      />

      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 28 }}>
        <GlassCard style={{ padding: 30 }}>
          <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 4, color: T.neon2, marginBottom: 24 }}>⊕ INTERACTIVE POINTER PLAYGROUND</div>

          {/* Two memory boxes */}
          <div style={{ display: "flex", gap: 14, marginBottom: 28 }}>
            {Object.entries(allVars).map(([k, v]) => (
              <motion.div key={k}
                animate={{
                  borderColor: flash === k ? "#fff" : pTarget === k ? v.color : `${v.color}30`,
                  background: flash === k ? `${v.color}50` : pTarget === k ? `${v.color}18` : `${v.color}08`,
                  boxShadow: flash === k ? `0 0 60px ${v.color}90` : pTarget === k ? `0 0 30px ${v.color}40` : "none",
                }}
                style={{ flex: 1, borderRadius: 14, border: "2px solid", padding: "22px 16px", textAlign: "center", cursor: "pointer" }}
                onClick={() => setPTarget(k)}
                whileHover={{ scale: 1.02 }}>
                <div style={{ fontFamily: T.mono, fontSize: 8, color: v.color, marginBottom: 6, letterSpacing: 2 }}>{v.addr}</div>
                <div style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, marginBottom: 8 }}>int {k}</div>
                <motion.div key={`${k}-${k === "a" ? val : bVal}`} animate={{ scale: [1.4, 1] }}
                  style={{ fontFamily: T.mono, fontSize: 36, fontWeight: 700, color: v.color }}>
                  {k === "a" ? val : bVal}
                </motion.div>
                {pTarget === k && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.2, repeat: Infinity }}
                    style={{ fontFamily: T.mono, fontSize: 9, color: v.color, marginTop: 8 }}>← p points here</motion.div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Pointer control */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontFamily: T.mono, fontSize: 8, color: T.muted, letterSpacing: 4, marginBottom: 10 }}>RETARGET POINTER:</div>
            <div style={{ display: "flex", gap: 10 }}>
              <Pill color={T.neon4} active={pTarget === "a"} onClick={() => setPTarget("a")}>p = &a</Pill>
              <Pill color={T.neon2} active={pTarget === "b"} onClick={() => setPTarget("b")}>p = &b</Pill>
            </div>
          </div>

          {/* Write through */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontFamily: T.mono, fontSize: 8, color: T.muted, letterSpacing: 4, marginBottom: 10 }}>WRITE THROUGH *p:</div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <input type="number" value={writeVal} onChange={e => setWriteVal(Number(e.target.value))}
                style={{ flex: 1, background: `${T.neon2}10`, border: `1px solid ${T.neon2}35`, borderRadius: 8, padding: "10px 14px", fontFamily: T.mono, fontSize: 15, color: T.neon2, outline: "none" }} />
              <motion.button
                whileHover={{ scale: 1.04, boxShadow: `0 0 30px ${T.neon2}60` }} whileTap={{ scale: 0.97 }}
                onClick={doWrite}
                style={{ fontFamily: T.display, fontSize: 12, letterSpacing: 4, color: "#000", background: `linear-gradient(135deg, ${T.neon2}, ${T.accent})`, border: "none", borderRadius: 8, padding: "10px 20px", cursor: "pointer" }}>
                *p = {writeVal}
              </motion.button>
            </div>
          </div>

          {/* Live explanation */}
          <div style={{ padding: "14px 16px", borderRadius: 10, background: `${target.color}0A`, border: `1px solid ${target.color}30`, marginBottom: 18 }}>
            <div style={{ fontFamily: T.mono, fontSize: 10, color: target.color, marginBottom: 6 }}>WHAT IS HAPPENING:</div>
            <div style={{ fontFamily: T.mono, fontSize: 11, color: T.text, lineHeight: 1.9 }}>
              <span style={{ color: target.color }}>p = &{pTarget}</span> → p holds value <span style={{ color: target.color }}>{target.addr}</span><br />
              <span style={{ color: T.neon2 }}>*p</span> → CPU goes to {target.addr} → reads <span style={{ color: target.color }}>{pTarget === "a" ? val : bVal}</span><br />
              <span style={{ color: T.neon3 }}>*p = {writeVal}</span> → CPU goes to {target.addr} → writes <span style={{ color: T.neon3 }}>{writeVal}</span> → <strong>{pTarget}</strong> changes!
            </div>
          </div>

          {/* History */}
          {history.length > 0 && (
            <div>
              <div style={{ fontFamily: T.mono, fontSize: 8, color: T.muted, letterSpacing: 4, marginBottom: 8 }}>OPERATION LOG:</div>
              {history.map((h, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  style={{ fontFamily: T.mono, fontSize: 10, color: T.neon4, padding: "4px 0", borderBottom: `1px solid ${T.dim}` }}>
                  {h}
                </motion.div>
              ))}
            </div>
          )}
        </GlassCard>

        {/* Right: under-the-hood CPU walk */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <GlassCard style={{ padding: 24 }} glowColor={T.neon2}>
            <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 4, color: T.neon2, marginBottom: 18 }}>🖥 CPU STEPS FOR *p = {writeVal}</div>
            {[
              { step: "1", text: `Read p → get value ${target.addr}`, color: T.neon2 },
              { step: "2", text: `Use ${target.addr} as destination address`, color: T.neon },
              { step: "3", text: `Write ${writeVal} to bytes at ${target.addr}`, color: T.neon3 },
              { step: "4", text: `${pTarget} in RAM now holds ${writeVal}`, color: T.neon4 },
            ].map((s, i) => (
              <motion.div key={`${pTarget}-${writeVal}-${i}`}
                initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 14 }}>
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: `${s.color}25`, border: `1px solid ${s.color}60`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: T.mono, fontSize: 9, color: s.color, flexShrink: 0 }}>{s.step}</div>
                <div style={{ fontFamily: T.mono, fontSize: 11, color: T.text, lineHeight: 1.8, paddingTop: 2 }}>{s.text}</div>
              </motion.div>
            ))}
          </GlassCard>

          <GlassCard style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "8px 14px", borderBottom: `1px solid ${T.dim}`, display: "flex", gap: 6, alignItems: "center" }}>
              {["#FF5F57","#FEBC2E","#28C840"].map((c, i) => <div key={i} style={{ width: 9, height: 9, borderRadius: "50%", background: c }} />)}
              <span style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, marginLeft: 8, letterSpacing: 2 }}>ptr_ops.c</span>
            </div>
            <div style={{ padding: "14px 0" }}>
              {[
                `int a = ${val}, b = ${bVal === 99 ? 99 : bVal};`,
                `int *p;`,
                ``,
                `p = &${pTarget};           // point at ${pTarget}`,
                `printf("%p", p);    // ${target.addr}`,
                `printf("%d", *p);   // ${pTarget === "a" ? val : bVal}`,
                ``,
                `*p = ${writeVal};          // WRITE through ptr`,
                `// ${pTarget} is now ${writeVal}`,
              ].map((line, i) => (
                <div key={i} style={{ fontFamily: T.mono, fontSize: 11, lineHeight: 2.1, padding: "0 18px", color: [3,4,5,7,8].includes(i) ? T.neon2 : T.text, whiteSpace: "pre" }}>
                  <span style={{ color: T.dim, marginRight: 14, fontSize: 9 }}>{String(i + 1).padStart(2)}</span>
                  {line}
                </div>
              ))}
            </div>
          </GlassCard>

          <motion.div style={{ padding: "16px", borderRadius: 12, background: `${T.neon3}08`, border: `1px solid ${T.neon3}30` }}>
            <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 4, color: T.neon3, marginBottom: 10 }}>⚠ COMMON MISTAKES</div>
            {[
              { bad: "int *p; *p = 5;",      why: "p was never assigned an address! Writing to garbage address = crash (segfault)" },
              { bad: "int *p = NULL; *p = 5;", why: "NULL = address 0, OS protects it. Dereferencing NULL always crashes." },
              { bad: "p = x;  (not &x)",      why: "Assigns the VALUE of x as an address. Almost never what you want." },
            ].map((m, i) => (
              <div key={i} style={{ marginBottom: 12 }}>
                <div style={{ fontFamily: T.mono, fontSize: 11, color: T.neon3 }}>{m.bad}</div>
                <div style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, marginTop: 2, lineHeight: 1.7 }}>{m.why}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 04 — POINTERS + FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────
function PtrFnSection() {
  const [mode, setMode] = useState("copy"); // copy | pointer
  const [val, setVal] = useState(5);
  const [ran, setRan] = useState(false);
  const [animStep, setAnimStep] = useState(-1);
  const runRef = useRef(false);

  const run = async () => {
    if (runRef.current) return;
    runRef.current = true;
    setRan(false);
    setAnimStep(-1);
    for (let i = 0; i < 5; i++) {
      if (!runRef.current) break;
      setAnimStep(i);
      await new Promise(r => setTimeout(r, 800));
    }
    setRan(true);
    if (mode === "pointer") setVal(v => v * 2);
    runRef.current = false;
    setAnimStep(-1);
  };

  const reset = () => { runRef.current = false; setVal(5); setRan(false); setAnimStep(-1); };

  const copySteps = [
    "main() calls double_bad(x)",
    "CPU copies value 5 → local param n",
    "n = n * 2 → n = 10 (local copy!)",
    "double_bad() returns — n DESTROYED",
    "x is still 5. Change was lost!",
  ];
  const ptrSteps = [
    "main() calls double_good(&x)",
    "CPU passes address 0x4000 as param p",
    "*p = *p * 2 → goes to 0x4000, writes 10",
    "double_good() returns — p destroyed",
    "x is now 10. Change PERSISTS! ✓",
  ];
  const steps = mode === "copy" ? copySteps : ptrSteps;

  return (
    <Section id="ptr-fn">
      <SectionHeader
        num="04" tag="POINTERS + FUNCTIONS" title="PASS BY POINTER"
        color={T.neon3}
        subtitle="Functions receive COPIES of arguments by default. To modify a caller's variable, you must pass its address. This is the #1 real-world use of pointers."
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
        <GlassCard style={{ padding: 30 }}>
          <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
            <Pill color={T.neon3} active={mode === "copy"} onClick={() => { setMode("copy"); reset(); }}>❌ BY VALUE (WRONG)</Pill>
            <Pill color={T.neon4} active={mode === "pointer"} onClick={() => { setMode("pointer"); reset(); }}>✓ BY POINTER</Pill>
          </div>

          {/* Stack visualization: main frame + function frame */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
            {/* Function frame */}
            <AnimatePresence>
              {animStep >= 0 && animStep <= 3 && (
                <motion.div
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  style={{ padding: "16px 20px", borderRadius: 12, background: `${T.neon}12`, border: `2px solid ${T.neon}60`, position: "relative" }}>
                  <div style={{ fontFamily: T.mono, fontSize: 8, color: T.neon, letterSpacing: 3, marginBottom: 8 }}>
                    {mode === "copy" ? "double_bad() STACK FRAME" : "double_good() STACK FRAME"}
                  </div>
                  <div style={{ display: "flex", gap: 20 }}>
                    <div>
                      <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted }}>param: {mode === "copy" ? "n" : "p"}</div>
                      <motion.div key={animStep} animate={{ scale: [1.3, 1] }}
                        style={{ fontFamily: T.mono, fontSize: 20, fontWeight: 700, color: T.neon }}>
                        {mode === "copy"
                          ? (animStep >= 2 ? "10" : "5")
                          : "0x4000"
                        }
                      </motion.div>
                    </div>
                    {mode === "copy" && animStep >= 2 && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, paddingTop: 16 }}>← local copy only</motion.div>
                    )}
                    {mode === "pointer" && animStep >= 2 && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        style={{ fontFamily: T.mono, fontSize: 10, color: T.neon4, paddingTop: 16 }}>← follows to x!</motion.div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main frame */}
            <motion.div
              animate={{
                borderColor: mode === "pointer" && animStep >= 2 ? `${T.neon4}80` : `${T.neon4}30`,
                boxShadow: mode === "pointer" && animStep >= 2 ? `0 0 40px ${T.neon4}50` : "none",
              }}
              style={{ padding: "16px 20px", borderRadius: 12, background: `${T.neon4}08`, border: "2px solid" }}>
              <div style={{ fontFamily: T.mono, fontSize: 8, color: T.neon4, letterSpacing: 3, marginBottom: 8 }}>main() STACK FRAME</div>
              <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
                <div>
                  <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted }}>int x @ 0x4000</div>
                  <motion.div key={`x-${ran}-${mode}`} animate={{ scale: [1.3, 1] }}
                    style={{ fontFamily: T.mono, fontSize: 28, fontWeight: 700, color: T.neon4 }}>
                    {ran && mode === "pointer" ? "10" : "5"}
                  </motion.div>
                </div>
                {ran && (
                  <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
                    style={{ padding: "6px 14px", borderRadius: 7, background: mode === "pointer" ? `${T.neon4}25` : `${T.neon3}15`, border: `1px solid ${mode === "pointer" ? T.neon4 : T.neon3}`, fontFamily: T.mono, fontSize: 11, color: mode === "pointer" ? T.neon4 : T.neon3 }}>
                    {mode === "pointer" ? "✓ CHANGED" : "✗ UNCHANGED"}
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Step indicator */}
          <div style={{ marginBottom: 18 }}>
            {steps.map((s, i) => (
              <motion.div key={i}
                animate={{ opacity: animStep === i ? 1 : animStep > i ? 0.45 : 0.2, x: animStep === i ? 4 : 0, color: animStep === i ? (mode === "pointer" ? T.neon4 : T.neon3) : T.muted }}
                style={{ fontFamily: T.mono, fontSize: 11, padding: "5px 0", borderLeft: `2px solid ${animStep === i ? (mode === "pointer" ? T.neon4 : T.neon3) : T.dim}`, paddingLeft: 12, marginBottom: 4 }}>
                {animStep === i && <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.5, repeat: Infinity }}>▶ </motion.span>}
                {s}
              </motion.div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <motion.button whileHover={{ scale: 1.04, boxShadow: `0 0 35px ${mode === "pointer" ? T.neon4 : T.neon3}60` }} whileTap={{ scale: 0.97 }}
              onClick={run}
              style={{ flex: 1, fontFamily: T.display, fontSize: 13, letterSpacing: 4, color: "#000", background: `linear-gradient(135deg, ${mode === "pointer" ? T.neon4 : T.neon3}, ${T.neon2})`, border: "none", borderRadius: 8, padding: "12px", cursor: "pointer" }}>
              ▶ RUN
            </motion.button>
            <motion.button whileTap={{ scale: 0.96 }} onClick={reset}
              style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, background: "transparent", border: `1px solid ${T.dim}`, borderRadius: 8, padding: "12px 16px", cursor: "pointer" }}>↺</motion.button>
          </div>
        </GlassCard>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <GlassCard style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "8px 14px", borderBottom: `1px solid ${T.dim}`, display: "flex", gap: 6, alignItems: "center" }}>
              {["#FF5F57","#FEBC2E","#28C840"].map((c, i) => <div key={i} style={{ width: 9, height: 9, borderRadius: "50%", background: c }} />)}
              <span style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, marginLeft: 8 }}>pass_by_ptr.c</span>
            </div>
            <div style={{ padding: "14px 0" }}>
              {[
                "// ❌ WRONG — won't modify x",
                "void double_bad(int n) {",
                "    n = n * 2;  // local copy!",
                "}",
                "",
                "// ✓ CORRECT — modifies x",
                "void double_good(int *p) {",
                "    *p = *p * 2;  // real x!",
                "}",
                "",
                "int main() {",
                "    int x = 5;",
                "    double_bad(x);   // x still 5",
                "    double_good(&x); // x = 10 ✓",
                "}",
              ].map((line, i) => (
                <div key={i} style={{ fontFamily: T.mono, fontSize: 11, lineHeight: 2.0, padding: "0 18px", color: [0].includes(i) ? T.dim : [5].includes(i) ? T.neon4 : [6, 7, 8].includes(i) ? T.neon4 : [1, 2, 3].includes(i) ? `${T.neon3}90` : T.text, whiteSpace: "pre" }}>
                  <span style={{ color: T.dim, marginRight: 14, fontSize: 9 }}>{String(i + 1).padStart(2)}</span>
                  {line}
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard style={{ padding: 22 }} glowColor={T.accent}>
            <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 4, color: T.accent, marginBottom: 14 }}>🧠 WHY C DOES THIS</div>
            <div style={{ fontFamily: T.mono, fontSize: 11, color: T.text, lineHeight: 1.9 }}>
              C passes COPIES to protect caller's data. To modify caller data you must explicitly opt-in by passing the address. This makes code predictable — a function can't accidentally modify your variables unless you give it the address.
              <br /><br />
              <span style={{ color: T.neon2 }}>scanf("%d", &x)</span> — now you know why scanf takes &x! It needs the address to write the user's input back into x.
            </div>
          </GlassCard>

          <GlassCard style={{ padding: 22 }} glowColor={T.neon2}>
            <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 4, color: T.neon2, marginBottom: 14 }}>⚡ REAL WORLD USES</div>
            {[
              { icon: "1", text: "scanf(&x) — read user input into variable" },
              { icon: "2", text: "swap(int *a, int *b) — swap two vars" },
              { icon: "3", text: "Pass large structs without copying (performance)" },
              { icon: "4", text: "Return multiple values from a function" },
              { icon: "5", text: "Dynamic memory: malloc returns a pointer" },
            ].map((f, i) => (
              <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8 }}>
                <div style={{ width: 18, height: 18, borderRadius: "50%", background: `${T.neon2}20`, border: `1px solid ${T.neon2}50`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: T.mono, fontSize: 8, color: T.neon2, flexShrink: 0 }}>{f.icon}</div>
                <div style={{ fontFamily: T.mono, fontSize: 11, color: T.text, lineHeight: 1.7 }}>{f.text}</div>
              </div>
            ))}
          </GlassCard>
        </div>
      </div>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 05 — RECURSION DEEP DIVE
// ─────────────────────────────────────────────────────────────────────────────
const FACT_STEPS = [
  { n: 5, state: "call",   result: null, depth: 0 },
  { n: 4, state: "call",   result: null, depth: 1 },
  { n: 3, state: "call",   result: null, depth: 2 },
  { n: 2, state: "call",   result: null, depth: 3 },
  { n: 1, state: "base",   result: 1,    depth: 4 },
  { n: 2, state: "return", result: 2,    depth: 3 },
  { n: 3, state: "return", result: 6,    depth: 2 },
  { n: 4, state: "return", result: 24,   depth: 1 },
  { n: 5, state: "return", result: 120,  depth: 0 },
];

function RecursionSection() {
  const [animIdx, setAnimIdx] = useState(-1);
  const [stack, setStack] = useState([]);
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState("idle"); // idle | diving | unwinding | done
  const runRef = useRef(false);

  const stateColor = s => s === "base" ? T.neon4 : s === "return" ? T.neon3 : T.neon2;

  const run = async () => {
    if (runRef.current) return;
    runRef.current = true;
    setRunning(true);
    setStack([]);
    setAnimIdx(-1);
    setPhase("diving");
    const callStack = [];
    for (let i = 0; i < FACT_STEPS.length; i++) {
      if (!runRef.current) break;
      const step = FACT_STEPS[i];
      setAnimIdx(i);
      if (step.state === "call" || step.state === "base") {
        callStack.push(step);
        setStack([...callStack]);
        if (step.state === "base") setPhase("unwinding");
      } else {
        callStack.pop();
        setStack([...callStack]);
      }
      await new Promise(r => setTimeout(r, 820));
    }
    setPhase("done");
    runRef.current = false;
    setRunning(false);
    setAnimIdx(-1);
  };

  const reset = () => { runRef.current = false; setRunning(false); setStack([]); setAnimIdx(-1); setPhase("idle"); };
  const current = animIdx >= 0 ? FACT_STEPS[animIdx] : null;

  return (
    <Section id="recursion">
      <SectionHeader
        num="05" tag="RECURSION" title="FUNCTION CALLS ITSELF"
        color={T.neon3}
        subtitle="Recursion is not magic. It's just a function calling itself with a smaller problem. Two rules: 1) Must have a base case (where to stop). 2) Each call must get closer to the base case."
      />

      {/* The mental model before the demo */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 32 }}>
        {[
          { icon: "↻", color: T.neon2,  title: "RECURSIVE CASE", text: "Problem too big? Break it down.\nfact(5) → 5 × fact(4)\nfact(4) → 4 × fact(3)\nKeep going until small enough." },
          { icon: "⊡", color: T.neon4,  title: "BASE CASE",       text: "The stopping condition.\nfact(1) = 1  (no more calls)\nWithout this = infinite loop!\nAlways write this FIRST." },
          { icon: "↑", color: T.neon3,  title: "UNWIND PHASE",    text: "Base case returns 1.\nStack starts popping back.\n2×1=2, 3×2=6, 4×6=24, 5×24=120\nAnswers bubble back up." },
        ].map((item, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: i * 0.12 }}
            style={{ padding: "20px", borderRadius: 12, background: `${item.color}08`, border: `1px solid ${item.color}30`, textAlign: "center" }}>
            <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              style={{ fontSize: 32, marginBottom: 12 }}>{item.icon}</motion.div>
            <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 4, color: item.color, marginBottom: 10 }}>{item.title}</div>
            <div style={{ fontFamily: T.mono, fontSize: 11, color: T.text, lineHeight: 1.9, whiteSpace: "pre" }}>{item.text}</div>
          </motion.div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 28 }}>
        <GlassCard style={{ padding: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 4, color: T.neon3, marginBottom: 4 }}>▸ CALL STACK — LIVE</div>
              <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted }}>
                {phase === "idle" ? "Press RUN to watch factorial(5)" : phase === "diving" ? "↓ DIVING — building up frames" : phase === "unwinding" ? "↑ UNWINDING — passing values back" : "✓ DONE — final answer: 120"}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <motion.button whileHover={{ scale: 1.05, boxShadow: `0 0 28px ${T.neon3}50` }} whileTap={{ scale: 0.97 }}
                onClick={run} disabled={running}
                style={{ fontFamily: T.display, fontSize: 11, letterSpacing: 4, color: "#000", background: running ? T.muted : `linear-gradient(135deg, ${T.neon3}, ${T.accent})`, border: "none", borderRadius: 8, padding: "8px 20px", cursor: running ? "not-allowed" : "pointer" }}>
                {running ? "RUNNING…" : "▶ FACTORIAL(5)"}
              </motion.button>
              <motion.button whileTap={{ scale: 0.95 }} onClick={reset}
                style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, background: "transparent", border: `1px solid ${T.dim}`, borderRadius: 7, padding: "8px 12px", cursor: "pointer" }}>↺</motion.button>
            </div>
          </div>

          {/* Depth indicator */}
          <div style={{ display: "flex", gap: 4, marginBottom: 20, alignItems: "center" }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <motion.div key={i}
                animate={{ background: stack.length > i ? stateColor(stack[i]?.state || "call") : T.dim, boxShadow: stack.length > i ? `0 0 10px ${stateColor(stack[i]?.state || "call")}80` : "none" }}
                style={{ flex: 1, height: 6, borderRadius: 3, transition: "all 0.3s" }} />
            ))}
            <span style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, marginLeft: 8, minWidth: 60 }}>depth {stack.length}/5</span>
          </div>

          {/* Stack visualization — newest on top */}
          <div style={{ minHeight: 340, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
            {stack.length === 0 && !running && (
              <div style={{ fontFamily: T.mono, fontSize: 11, color: T.muted, textAlign: "center", padding: "80px 0" }}>Stack empty — press ▶</div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <AnimatePresence>
                {[...stack].reverse().map((frame, i) => {
                  const color = stateColor(frame.state);
                  const isTop = i === 0;
                  return (
                    <motion.div key={`${frame.depth}-${frame.state}`}
                      initial={{ scale: 0.85, opacity: 0, y: isTop ? -30 : 0 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      exit={{ scale: 0.85, opacity: 0, y: -24, transition: { duration: 0.35 } }}
                      transition={{ type: "spring", stiffness: 280, damping: 24 }}
                      style={{ padding: "12px 20px", borderRadius: 10, background: isTop ? `${color}22` : `${color}08`, border: `${isTop ? "2px" : "1px"} solid ${isTop ? color : `${color}45`}`, boxShadow: isTop ? `0 0 30px ${color}50` : "none", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div>
                        <div style={{ fontFamily: T.mono, fontSize: 8, color, letterSpacing: 3, marginBottom: 3 }}>
                          {isTop ? "◀ ACTIVE" : `depth ${frame.depth}`}
                        </div>
                        <div style={{ fontFamily: T.mono, fontSize: 18, fontWeight: 700, color }}>fact({frame.n})</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted }}>n = {frame.n}</div>
                        {frame.result !== null && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                            style={{ fontFamily: T.mono, fontSize: 18, fontWeight: 700, color: T.neon4 }}>
                            = {frame.result}
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

          {/* Current step description */}
          <AnimatePresence mode="wait">
            {current && (
              <motion.div key={animIdx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ marginTop: 16, padding: "14px 16px", borderRadius: 10, background: `${stateColor(current.state)}10`, border: `1px solid ${stateColor(current.state)}40`, fontFamily: T.mono, fontSize: 11, color: T.text, lineHeight: 1.8 }}>
                {current.state === "call" && `→ Calling fact(${current.n}) — CPU pushes new frame, starts executing with n=${current.n}`}
                {current.state === "base" && `⊡ BASE CASE HIT: n=1, return 1. Now we start unwinding the stack upward!`}
                {current.state === "return" && `↑ fact(${current.n}) = ${current.n} × ${current.result / current.n} = ${current.result}. Frame popped, value passed back to caller.`}
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Code with annotation */}
          <GlassCard style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "8px 14px", borderBottom: `1px solid ${T.dim}`, display: "flex", gap: 6, alignItems: "center" }}>
              {["#FF5F57","#FEBC2E","#28C840"].map((c, i) => <div key={i} style={{ width: 9, height: 9, borderRadius: "50%", background: c }} />)}
              <span style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, marginLeft: 8 }}>factorial.c</span>
            </div>
            <div style={{ padding: "14px 0" }}>
              {[
                { line: "int fact(int n) {",      color: T.text,  note: "" },
                { line: "  if (n <= 1)        ",  color: T.neon4, note: "← BASE CASE" },
                { line: "    return 1;         ",  color: T.neon4, note: "← STOP HERE" },
                { line: "                     ",   color: T.dim,   note: "" },
                { line: "  return n * fact(n-1);", color: T.neon3, note: "← RECURSIVE" },
                { line: "}",                       color: T.text,  note: "" },
              ].map((l, i) => {
                const isBase = current?.state === "base" && i <= 2;
                const isCall = current?.state === "call" && i === 4;
                const isReturn = current?.state === "return" && i === 4;
                const highlight = isBase || isCall || isReturn;
                return (
                  <motion.div key={i}
                    animate={{ background: highlight ? `${l.color}20` : "transparent", paddingLeft: highlight ? 22 : 18 }}
                    style={{ fontFamily: T.mono, fontSize: 12, lineHeight: 2.2, paddingRight: 18, borderLeft: `3px solid ${highlight ? l.color : "transparent"}`, display: "flex", justifyContent: "space-between" }}>
                    <span>
                      <span style={{ color: T.dim, marginRight: 14, fontSize: 9 }}>{String(i + 1).padStart(2)}</span>
                      <span style={{ color: l.color, whiteSpace: "pre" }}>{l.line}</span>
                    </span>
                    {l.note && <span style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, marginLeft: 8 }}>{l.note}</span>}
                  </motion.div>
                );
              })}
            </div>
          </GlassCard>

          {/* TRACE — manual expansion */}
          <GlassCard style={{ padding: 22 }} glowColor={T.neon4}>
            <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 4, color: T.neon4, marginBottom: 16 }}>📋 MANUAL TRACE (READ THIS)</div>
            {[
              { call: "fact(5)", exp: "= 5 × fact(4)",  color: T.neon2 },
              { call: "fact(4)", exp: "= 4 × fact(3)",  color: T.neon2 },
              { call: "fact(3)", exp: "= 3 × fact(2)",  color: T.neon2 },
              { call: "fact(2)", exp: "= 2 × fact(1)",  color: T.neon2 },
              { call: "fact(1)", exp: "= 1  ← base!",   color: T.neon4 },
              { call: "↑ 2×1",  exp: "= 2",            color: T.neon3 },
              { call: "↑ 3×2",  exp: "= 6",            color: T.neon3 },
              { call: "↑ 4×6",  exp: "= 24",           color: T.neon3 },
              { call: "↑ 5×24", exp: "= 120 ✓",        color: T.neon3 },
            ].map((row, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, x: 10 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.04 }}
                style={{ display: "flex", justifyContent: "space-between", padding: "5px 10px", borderRadius: 6, background: `${row.color}06`, marginBottom: 3 }}>
                <span style={{ fontFamily: T.mono, fontSize: 11, color: row.color }}>{row.call}</span>
                <span style={{ fontFamily: T.mono, fontSize: 11, color: T.muted }}>{row.exp}</span>
              </motion.div>
            ))}
          </GlassCard>

          <motion.div style={{ padding: "16px", borderRadius: 12, background: `${T.neon3}08`, border: `1px solid ${T.neon3}30` }}>
            <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 4, color: T.neon3, marginBottom: 10 }}>⚠ THE TWO LAWS OF RECURSION</div>
            <div style={{ fontFamily: T.mono, fontSize: 11, color: T.text, lineHeight: 1.9 }}>
              <span style={{ color: T.neon4 }}>LAW 1:</span> Every recursive function MUST have a base case. This is where the recursion stops.<br />
              <br />
              <span style={{ color: T.neon3 }}>LAW 2:</span> Every recursive call must move TOWARD the base case. n-1, not n+1!<br />
              <br />
              Break either law → infinite recursion → stack overflow → crash ☠
            </div>
          </motion.div>
        </div>
      </div>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 06 — CALL STACK DEEP DIVE
// ─────────────────────────────────────────────────────────────────────────────
function CallStackSection() {
  const [n, setN] = useState(4);
  const [frames, setFrames] = useState([]);
  const [running, setRunning] = useState(false);
  const [infinite, setInfinite] = useState(false);
  const [output, setOutput] = useState(null);
  const [soExplain, setSoExplain] = useState(false);
  const runRef = useRef(false);

  const buildSteps = (num) => {
    const steps = [];
    for (let i = num; i >= 1; i--) steps.push({ n: i, phase: "call", result: null });
    steps.push({ n: 1, phase: "base", result: 1 });
    let acc = 1;
    for (let i = 2; i <= num; i++) { acc *= i; steps.push({ n: i, phase: "return", result: acc }); }
    return steps;
  };

  const runSim = async () => {
    if (runRef.current) return;
    runRef.current = true;
    setRunning(true);
    setFrames([]);
    setOutput(null);
    setSoExplain(false);
    setInfinite(false);
    const steps = buildSteps(n);
    const stackArr = [];
    for (let i = 0; i < steps.length; i++) {
      if (!runRef.current) break;
      const s = steps[i];
      if (s.phase === "call" || s.phase === "base") { stackArr.push({ ...s, id: i }); setFrames([...stackArr]); }
      else { stackArr.pop(); setFrames([...stackArr]); }
      if (i === steps.length - 1) setOutput(s.result);
      await new Promise(r => setTimeout(r, 600));
    }
    runRef.current = false;
    setRunning(false);
  };

  const runInfinite = async () => {
    if (runRef.current) return;
    runRef.current = true;
    setInfinite(true);
    setRunning(true);
    setOutput(null);
    setSoExplain(false);
    const fakeStack = [];
    for (let i = 0; i < 10; i++) {
      if (!runRef.current) break;
      fakeStack.push({ n: 999 - i, phase: "call", result: null, id: i });
      setFrames([...fakeStack]);
      await new Promise(r => setTimeout(r, 180));
    }
    setOutput("STACK OVERFLOW ☠");
    setSoExplain(true);
    runRef.current = false;
    setRunning(false);
  };

  const reset = () => { runRef.current = false; setRunning(false); setFrames([]); setOutput(null); setInfinite(false); setSoExplain(false); };
  const maxDepth = n + 1;

  return (
    <Section id="callstack">
      <SectionHeader
        num="06" tag="CALL STACK" title="UNDER THE HOOD"
        color={T.neon4}
        subtitle="The call stack is a region of RAM. Every function call PUSHES a new frame (local variables, return address). Return POPS the frame. Stack is finite — too many calls = overflow."
      />

      {/* Stack anatomy diagram */}
      <GlassCard style={{ padding: 26, marginBottom: 28 }}>
        <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 4, color: T.neon4, marginBottom: 20 }}>🔬 ANATOMY OF A STACK FRAME</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          {[
            { label: "Return Address", desc: "Where to jump back to when this function finishes. Stored automatically by CPU.", color: T.neon, icon: "↩" },
            { label: "Parameters",     desc: "Copies of the arguments passed to the function (or the address if pointer).", color: T.neon2, icon: "📥" },
            { label: "Local Vars",     desc: "Variables declared inside this function. Live only while function is running.", color: T.neon4, icon: "📦" },
          ].map((f, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              style={{ padding: "16px", borderRadius: 10, background: `${f.color}08`, border: `1px solid ${f.color}30`, textAlign: "center" }}>
              <div style={{ fontSize: 22, marginBottom: 10 }}>{f.icon}</div>
              <div style={{ fontFamily: T.mono, fontSize: 9, color: f.color, letterSpacing: 3, marginBottom: 8 }}>{f.label}</div>
              <div style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, lineHeight: 1.8 }}>{f.desc}</div>
            </motion.div>
          ))}
        </div>
      </GlassCard>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
        <GlassCard style={{ padding: 28 }}>
          <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 4, color: T.neon4, marginBottom: 20 }}>▸ CONFIGURE SIMULATION</div>

          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontFamily: T.mono, fontSize: 10, color: T.muted }}>factorial(n) where n =</span>
              <motion.span key={n} animate={{ scale: [1.4, 1] }} style={{ fontFamily: T.mono, fontSize: 22, fontWeight: 700, color: T.neon4 }}>{n}</motion.span>
            </div>
            <input type="range" min={1} max={8} value={n} onChange={e => { setN(Number(e.target.value)); reset(); }}
              style={{ width: "100%", accentColor: T.neon4 }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: T.mono, fontSize: 9, color: T.dim, marginTop: 4 }}>
              <span>1 frame</span><span>{n + 1} frames at peak</span>
            </div>
          </div>

          {/* Depth meter */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontFamily: T.mono, fontSize: 8, color: T.muted, marginBottom: 10, letterSpacing: 3 }}>
              DEPTH METER [{frames.length} / {infinite ? "∞" : maxDepth}]
            </div>
            <div style={{ display: "flex", gap: 3 }}>
              {Array.from({ length: infinite ? 10 : maxDepth }).map((_, i) => {
                const filled = i < frames.length;
                return (
                  <motion.div key={i}
                    animate={{ background: filled ? (infinite ? T.neon3 : T.neon4) : T.dim, boxShadow: filled ? `0 0 8px ${infinite ? T.neon3 : T.neon4}60` : "none" }}
                    style={{ flex: 1, height: 36, borderRadius: 5, transition: "all 0.3s", display: "flex", alignItems: "flex-end", paddingBottom: 4, justifyContent: "center" }}>
                    {filled && <span style={{ fontFamily: T.mono, fontSize: 8, color: infinite ? T.neon3 : "#000", fontWeight: 700 }}>f</span>}
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
            <motion.button whileHover={{ scale: 1.04, boxShadow: `0 0 30px ${T.neon4}50` }} whileTap={{ scale: 0.97 }}
              onClick={runSim} disabled={running}
              style={{ flex: 2, fontFamily: T.display, fontSize: 13, letterSpacing: 4, color: "#000", background: running ? T.muted : `linear-gradient(135deg, ${T.neon4}, ${T.neon2})`, border: "none", borderRadius: 8, padding: "12px", cursor: running ? "not-allowed" : "pointer" }}>
              {running ? "RUNNING…" : `▶ RUN fact(${n})`}
            </motion.button>
            <motion.button whileHover={{ scale: 1.04, boxShadow: `0 0 25px ${T.neon3}50` }} whileTap={{ scale: 0.97 }}
              onClick={runInfinite} disabled={running}
              style={{ flex: 1, fontFamily: T.display, fontSize: 11, letterSpacing: 3, color: "#000", background: running ? T.muted : `linear-gradient(135deg, ${T.neon3}, #FF0055)`, border: "none", borderRadius: 8, padding: "12px", cursor: running ? "not-allowed" : "pointer" }}>
              ☠ OVERFLOW
            </motion.button>
            <motion.button whileTap={{ scale: 0.95 }} onClick={reset}
              style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, background: "transparent", border: `1px solid ${T.dim}`, borderRadius: 8, padding: "12px 14px", cursor: "pointer" }}>↺</motion.button>
          </div>

          <AnimatePresence mode="wait">
            {output && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                style={{ padding: "16px 20px", borderRadius: 11, textAlign: "center", background: infinite ? `${T.neon3}18` : `${T.neon4}14`, border: `2px solid ${infinite ? T.neon3 : T.neon4}`, boxShadow: `0 0 30px ${infinite ? T.neon3 : T.neon4}50`, fontFamily: T.display, fontSize: 24, letterSpacing: 5, color: infinite ? T.neon3 : T.neon4 }}>
                {infinite ? output : `= ${output}`}
              </motion.div>
            )}
          </AnimatePresence>

          {soExplain && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              style={{ marginTop: 14, padding: "14px", borderRadius: 10, background: `${T.neon3}08`, border: `1px solid ${T.neon3}40` }}>
              <div style={{ fontFamily: T.mono, fontSize: 9, color: T.neon3, letterSpacing: 3, marginBottom: 8 }}>☠ STACK OVERFLOW EXPLAINED</div>
              <div style={{ fontFamily: T.mono, fontSize: 11, color: T.text, lineHeight: 1.9 }}>
                The OS allocates ~1-8MB for the stack. Each frame takes space. Infinite recursion keeps pushing frames until RAM runs out. OS kills the program with a segfault.
                <br /><br />
                <span style={{ color: T.neon3 }}>Fix:</span> Always ensure your base case is reachable!
              </div>
            </motion.div>
          )}
        </GlassCard>

        {/* Live stack panel */}
        <GlassCard style={{ padding: 24, overflow: "hidden" }}>
          <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 4, color: T.neon4, marginBottom: 6 }}>▸ LIVE STACK</div>
          <div style={{ fontFamily: T.mono, fontSize: 8, color: T.muted, marginBottom: 16, letterSpacing: 2 }}>↑ TOP (currently executing)</div>

          <div style={{ display: "flex", flexDirection: "column", gap: 5, minHeight: 320 }}>
            <AnimatePresence>
              {[...frames].reverse().map((frame, i) => {
                const isTop = i === 0;
                const color = frame.phase === "base" ? T.neon4 : frame.phase === "return" ? T.neon3 : (infinite ? T.neon3 : T.neon2);
                return (
                  <motion.div key={frame.id} layout
                    initial={{ opacity: 0, y: -28, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -28, scale: 0.88, transition: { duration: 0.3 } }}
                    transition={{ type: "spring", stiffness: 300, damping: 26 }}
                    style={{ padding: "10px 16px", borderRadius: 9, background: isTop ? `${color}22` : `${color}0A`, border: `${isTop ? "2px" : "1px"} solid ${isTop ? color : `${color}40`}`, boxShadow: isTop ? `0 0 25px ${color}50` : "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontFamily: T.mono, fontSize: 8, color, letterSpacing: 2, marginBottom: 2 }}>
                        {isTop ? "▶ EXECUTING" : `waiting...`}
                      </div>
                      <span style={{ fontFamily: T.mono, fontSize: 14, fontWeight: 700, color }}>
                        {frame.n < 999 ? `fact(${frame.n})` : `fact(∞)`}
                      </span>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontFamily: T.mono, fontSize: 8, color: T.muted }}>{frame.phase.toUpperCase()}</div>
                      {frame.result !== null && <div style={{ fontFamily: T.mono, fontSize: 13, fontWeight: 700, color: T.neon4 }}>→ {frame.result}</div>}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {frames.length === 0 && <div style={{ fontFamily: T.mono, fontSize: 11, color: T.muted, textAlign: "center", paddingTop: 80 }}>Press ▶ RUN to fill stack</div>}
          </div>

          {frames.length > 0 && (
            <div style={{ marginTop: 10, fontFamily: T.mono, fontSize: 8, color: T.muted, letterSpacing: 2, textAlign: "center" }}>
              ↓ BOTTOM (first call — suspended, waiting to resume)
            </div>
          )}
        </GlassCard>
      </div>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 07 — MASTER ENGINE
// ─────────────────────────────────────────────────────────────────────────────
const ENGINE_PROGS = [
  {
    name: "PTR BASICS",
    color: T.neon,
    filename: "ptr_basics.c",
    lines: [
      "int x = 42;",
      "int *p = &x;",
      "",
      "printf(\"%p\", p);    // address",
      "printf(\"%d\", *p);   // 42",
      "*p = 100;",
      "printf(\"%d\", x);    // 100",
    ],
    steps: [
      { line: 0, mem: { x: 42 }, out: "" },
      { line: 1, mem: { x: 42, p: "0x2000→x" }, out: "" },
      { line: 3, mem: { x: 42, p: "0x2000→x" }, out: "0x2000" },
      { line: 4, mem: { x: 42, p: "0x2000→x" }, out: "42" },
      { line: 5, mem: { x: 100, p: "0x2000→x" }, out: "" },
      { line: 6, mem: { x: 100, p: "0x2000→x" }, out: "100" },
    ],
    note: "x changed from 42 → 100 via the pointer. The pointer didn't move — we wrote THROUGH it.",
  },
  {
    name: "PASS BY PTR",
    color: T.neon3,
    filename: "pass_ptr.c",
    lines: [
      "void triple(int *p) {",
      "    *p = *p * 3;",
      "}",
      "",
      "int x = 7;",
      "triple(&x);",
      "printf(\"%d\", x); // 21",
    ],
    steps: [
      { line: 4, mem: { x: 7 }, out: "" },
      { line: 5, mem: { x: 7, "p (in triple)": "&x = 0x4000" }, out: "" },
      { line: 1, mem: { x: 7, "p (in triple)": "&x = 0x4000", "*p was": "7" }, out: "" },
      { line: 1, mem: { x: 21, "p (in triple)": "&x = 0x4000" }, out: "" },
      { line: 6, mem: { x: 21 }, out: "21" },
    ],
    note: "triple() received the address of x, so writing *p directly modified x in main's stack frame.",
  },
  {
    name: "RECURSION",
    color: T.neon2,
    filename: "recursion.c",
    lines: [
      "int fact(int n) {",
      "  if (n <= 1) return 1;",
      "  return n * fact(n-1);",
      "}",
      "",
      "int r = fact(4);",
      "printf(\"%d\", r); // 24",
    ],
    steps: [
      { line: 5, mem: { "calling": "fact(4)" }, out: "" },
      { line: 1, mem: { n: 4, "calling": "fact(3)" }, out: "" },
      { line: 1, mem: { n: 3, "calling": "fact(2)" }, out: "" },
      { line: 1, mem: { n: 2, "calling": "fact(1)" }, out: "" },
      { line: 1, mem: { n: 1, "base!": "return 1" }, out: "" },
      { line: 2, mem: { "unwind": "2×1=2, 3×2=6, 4×6=24" }, out: "" },
      { line: 6, mem: { r: 24 }, out: "24" },
    ],
    note: "fact(4) pushed 4 frames. Base case returned 1. Values multiplied back up: 24.",
  },
  {
    name: "PTR + RECUR",
    color: T.accent,
    filename: "combined.c",
    lines: [
      "void fill(int *arr, int n) {",
      "  if (n == 0) return;",
      "  arr[n-1] = n * n;",
      "  fill(arr, n-1);",
      "}",
      "",
      "int a[4];",
      "fill(a, 4);",
      "// a = {1, 4, 9, 16}",
    ],
    steps: [
      { line: 6, mem: { "a[]": "uninitialized" }, out: "" },
      { line: 7, mem: { "a[]": "uninitialized", ptr: "a = &a[0]" }, out: "" },
      { line: 2, mem: { "a[3]": 16, n: 4 }, out: "" },
      { line: 2, mem: { "a[3]": 16, "a[2]": 9, n: 3 }, out: "" },
      { line: 2, mem: { "a[3]": 16, "a[2]": 9, "a[1]": 4, n: 2 }, out: "" },
      { line: 2, mem: { "a[3]": 16, "a[2]": 9, "a[1]": 4, "a[0]": 1, n: 1 }, out: "" },
      { line: 1, mem: { "a[0]": 1, "a[1]": 4, "a[2]": 9, "a[3]": 16, "done!": "✓" }, out: "{1,4,9,16}" },
    ],
    note: "Recursion fills the array backwards. Pointer lets function modify the real array in main's memory.",
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
      await new Promise(r => setTimeout(r, 900));
    }
    setStep(-1);
    setRunning(false);
    runningRef.current = false;
  };

  return (
    <Section id="engine" style={{ borderBottom: "none" }}>
      <SectionHeader
        num="07" tag="MASTER ENGINE" title="FULL SIMULATION"
        color={T.accent}
        subtitle="Run all four programs and watch memory change in real time. This is where pointers and recursion combine into real C programs."
      />

      <div style={{ display: "flex", gap: 10, marginBottom: 28, flexWrap: "wrap" }}>
        {ENGINE_PROGS.map((p, i) => (
          <Pill key={p.name} color={p.color} active={progIdx === i} onClick={() => { setProgIdx(i); reset(); }}>
            {p.name}
          </Pill>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 20 }}>
        {/* Code panel */}
        <GlassCard style={{ overflow: "hidden" }}>
          <div style={{ background: "rgba(0,0,0,0.45)", borderBottom: `1px solid ${T.dim}`, padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <motion.div animate={{ background: running ? prog.color : T.muted, boxShadow: running ? `0 0 12px ${prog.color}` : "none" }}
                style={{ width: 7, height: 7, borderRadius: "50%" }} />
              <span style={{ fontFamily: T.mono, fontSize: 9, color: T.muted }}>{prog.filename}</span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <motion.button whileTap={{ scale: 0.95 }} onClick={run} disabled={running}
                style={{ fontFamily: T.display, fontSize: 11, letterSpacing: 3, color: "#000", background: running ? T.muted : prog.color, border: "none", borderRadius: 5, padding: "6px 16px", cursor: running ? "not-allowed" : "pointer" }}>
                {running ? "RUNNING…" : "▶ RUN"}
              </motion.button>
              <motion.button whileTap={{ scale: 0.95 }} onClick={reset}
                style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, background: "transparent", border: `1px solid ${T.dim}`, borderRadius: 5, padding: "6px 12px", cursor: "pointer" }}>RESET</motion.button>
            </div>
          </div>
          <div style={{ padding: "14px 0" }}>
            {prog.lines.map((line, i) => {
              const isActive = step === i;
              return (
                <motion.div key={i}
                  animate={{ background: isActive ? `${prog.color}18` : "transparent", paddingLeft: isActive ? 22 : 16 }}
                  style={{ display: "flex", alignItems: "center", paddingRight: 16, paddingTop: 3, paddingBottom: 3, borderLeft: `3px solid ${isActive ? prog.color : "transparent"}` }}>
                  <span style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, minWidth: 26, textAlign: "right", marginRight: 14, userSelect: "none" }}>{i + 1}</span>
                  <span style={{ fontFamily: T.mono, fontSize: 12, color: isActive ? prog.color : T.text, whiteSpace: "pre" }}>{line}</span>
                  {isActive && (
                    <motion.span animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 0.5, repeat: Infinity }}
                      style={{ fontFamily: T.mono, fontSize: 8, color: prog.color, marginLeft: "auto", letterSpacing: 2 }}>◀ EXECUTING</motion.span>
                  )}
                </motion.div>
              );
            })}
          </div>
        </GlassCard>

        {/* Memory + output */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <GlassCard style={{ padding: 0, overflow: "hidden", flex: 1 }}>
            <div style={{ background: "rgba(0,0,0,0.4)", borderBottom: `1px solid ${T.dim}`, padding: "10px 16px", fontFamily: T.mono, fontSize: 8, letterSpacing: 3, color: T.neon2 }}>MEMORY STATE</div>
            <div style={{ padding: "16px", minHeight: 140 }}>
              <AnimatePresence>
                {Object.keys(memory).length === 0 ? (
                  <div style={{ fontFamily: T.mono, fontSize: 11, color: T.muted }}>No variables yet...</div>
                ) : Object.entries(memory).map(([k, v]) => (
                  <motion.div key={k} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    style={{ display: "flex", alignItems: "center", gap: 12, fontFamily: T.mono, fontSize: 12, marginBottom: 10 }}>
                    <span style={{ color: T.neon2, minWidth: 90 }}>{k}</span>
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
            <div style={{ background: "rgba(0,0,0,0.4)", borderBottom: `1px solid ${T.dim}`, padding: "10px 16px", fontFamily: T.mono, fontSize: 8, letterSpacing: 3, color: T.neon3 }}>OUTPUT</div>
            <div style={{ padding: "14px 16px", minHeight: 56 }}>
              {output ? (
                <motion.pre initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  style={{ fontFamily: T.mono, fontSize: 18, color: T.neon4, lineHeight: 1.8 }}>
                  {output}
                </motion.pre>
              ) : (
                <span style={{ fontFamily: T.mono, fontSize: 11, color: T.muted }}>
                  {running ? "executing..." : "press ▶ RUN"}
                </span>
              )}
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Note */}
      <motion.div
        key={progIdx}
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        style={{ padding: "16px 20px", borderRadius: 10, background: `${prog.color}08`, border: `1px solid ${prog.color}30` }}>
        <span style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 4, color: prog.color }}>💡 NOTE: </span>
        <span style={{ fontFamily: T.mono, fontSize: 11, color: T.text }}>{prog.note}</span>
      </motion.div>

      {/* Final summary */}
      <GlassCard style={{ padding: 30, marginTop: 28 }} glowColor={T.accent}>
        <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 4, color: T.accent, marginBottom: 20 }}>🚀 CHAPTER COMPLETE — THE COMPLETE PICTURE</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 16 }}>
          {[
            { icon: "⬜", color: T.neon4, title: "POINTERS",         text: "Store addresses. Use & to get addr, * to follow it. Essential for modifying caller's data." },
            { icon: "ƒ",  color: T.neon3, title: "FUNCTIONS + PTR",  text: "Pass &x to let a function modify x. The function receives a pointer, writes through it with *p." },
            { icon: "↻",  color: T.neon2, title: "RECURSION",        text: "Function calls itself with smaller input. Must have base case + shrink toward it every call." },
            { icon: "⧖",  color: T.neon,  title: "CALL STACK",       text: "Each call pushes a frame. Return pops it. Stack is finite. Infinite recursion = overflow crash." },
          ].map((f, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              style={{ padding: "18px", borderRadius: 12, background: `${f.color}08`, border: `1px solid ${f.color}30`, textAlign: "center" }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>{f.icon}</div>
              <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 4, color: f.color, marginBottom: 10 }}>{f.title}</div>
              <div style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, lineHeight: 1.8 }}>{f.text}</div>
            </motion.div>
          ))}
        </div>
      </GlassCard>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SIDEBAR
// ─────────────────────────────────────────────────────────────────────────────
function Sidebar({ activeSection }) {
  return (
    <aside style={{
      width: 215, minWidth: 215, flexShrink: 0,
      background: `linear-gradient(180deg, ${T.bg1} 0%, ${T.bg} 100%)`,
      borderRight: `1px solid ${T.dim}`,
      display: "flex", flexDirection: "column",
      padding: "26px 0", position: "sticky", top: 0, height: "100vh", overflow: "hidden",
    }}>
      <div style={{ padding: "0 18px 20px" }}>
        <div style={{ fontFamily: T.display, fontSize: 18, letterSpacing: 4, color: T.neon }}>C LANG</div>
        <div style={{ fontFamily: T.mono, fontSize: 7, letterSpacing: 4, color: T.muted, marginTop: 2 }}>CH.7 · PTR + RECURSION</div>
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
              style={{ display: "flex", alignItems: "center", gap: 9, padding: "10px 18px", fontFamily: T.mono, fontSize: 10, fontWeight: 600, letterSpacing: 1.5, textDecoration: "none", borderLeft: `2px solid ${isActive ? T.neon : "transparent"}` }}>
              <span style={{ fontSize: 11 }}>{item.icon}</span>
              <div>
                <div style={{ fontSize: 7, opacity: 0.4, marginBottom: 1 }}>{item.num}</div>
                {item.label}
              </div>
              {isActive && (
                <motion.div layoutId="nav-dot-c7"
                  style={{ width: 4, height: 4, borderRadius: "50%", background: T.neon, marginLeft: "auto" }} />
              )}
            </motion.a>
          );
        })}
      </nav>
      <div style={{ padding: "14px 18px", fontFamily: T.mono, fontSize: 9, color: T.dim, letterSpacing: 2, lineHeight: 2 }}>
        C VISUAL SIM<br />v7.0
      </div>
    </aside>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RIGHT PANEL
// ─────────────────────────────────────────────────────────────────────────────
const DEEP = {
  hero:       { title: "Chapter 7",    color: T.neon,  why: "Pointers and recursion unlock systems programming. Every OS, game, and compiler uses them.", mistake: "Treating pointers as magic. They're just integers holding addresses.", model: "A pointer is a variable that stores an address — period. No magic." },
  ram:        { title: "RAM Model",    color: T.neon2, why: "Without understanding RAM, pointers feel like magic. With it, they're obvious.", mistake: "Assuming variables are always adjacent — alignment gaps can exist.", model: "RAM = a street of numbered houses. &x = x's house number." },
  pointers:   { title: "Pointers",     color: T.neon,  why: "Pointers let you work with addresses instead of values — modify ANY variable.", mistake: "Using *ptr before ptr is assigned. Always initialize pointers!", model: "ptr is a sign pointing to a house. *ptr = what's inside the house." },
  ops:        { title: "& and * Ops",  color: T.neon2, why: "Only two operators to learn: get address (&) and follow address (*).", mistake: "Confusing int *p (declaration) with *p (dereference). Same symbol, 2 uses.", model: "& = 'where does X live?' * = 'go to that address and look/write'" },
  "ptr-fn":   { title: "Ptr + Fn",     color: T.neon3, why: "Pass-by-pointer is why C functions can modify caller's variables.", mistake: "Passing by value and wondering why the variable didn't change!", model: "You can't change someone's house by talking about it — go to the address." },
  recursion:  { title: "Recursion",    color: T.neon3, why: "Elegant solution for problems that are defined in terms of themselves.", mistake: "Forgetting the base case. This causes infinite recursion + stack overflow.", model: "Russian dolls: open each to find a smaller one. Eventually: empty = stop." },
  callstack:  { title: "Call Stack",   color: T.neon4, why: "Understanding the stack explains local variables, recursion depth, overflow.", mistake: "Deep recursion on large inputs — use iteration or increase stack size.", model: "Stack = tower of cafeteria trays. Push on call, pop on return." },
  engine:     { title: "Full Engine",  color: T.accent,why: "Combining pointers + recursion = linked lists, trees, parsers, compilers.", mistake: "Using recursion where a loop is clearer. Recursion has overhead!", model: "Master Chapter 7 = understand how every OS and database is built." },
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
            <div style={{ fontFamily: T.display, fontSize: 20, letterSpacing: 3, color: data.color }}>{data.title}</div>
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
          <Link href="/c-6" passHref legacyBehavior>
            <motion.a whileHover={{ color: T.neon, scale: 1.02 }} style={{ flex: 1, textAlign: "center", padding: "7px", borderRadius: 6, background: "transparent", border: `1px solid ${T.dim}`, fontFamily: T.mono, fontSize: 9, color: T.muted, textDecoration: "none", cursor: "pointer" }}>← C6</motion.a>
          </Link>
        </div>
      </div>
    </aside>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ROOT PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function C7Page() {
  const [activeSection, setActiveSection] = useState("hero");

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => { entries.forEach(e => { if (e.isIntersecting) setActiveSection(e.target.id); }); },
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
        input[type=range] { height: 4px; cursor: pointer; -webkit-appearance: none; appearance: none; background: ${T.dim}; border-radius: 2px; outline: none; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 14px; height: 14px; border-radius: 50%; background: ${T.neon}; cursor: pointer; box-shadow: 0 0 10px ${T.neon}70; }
        input[type=number] { -moz-appearance: textfield; }
        input[type=number]::-webkit-outer-spin-button, input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
        button { outline: none; }
        a { text-decoration: none; }
      `}</style>

      <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: T.bg }}>
        <Sidebar activeSection={activeSection} />

        <main style={{ flex: 1, overflowY: "auto", overflowX: "hidden", minWidth: 0 }}>
          <div style={{ maxWidth: "100%", padding: "0 38px" }}>
            <HeroSection />
            <RamSection />
            <PointersSection />
            <OpsSection />
            <PtrFnSection />
            <RecursionSection />
            <CallStackSection />
            <EngineSection />
            <div style={{ height: 80 }} />
          </div>
        </main>

        <RightPanel activeSection={activeSection} />
      </div>
    </>
  );
}