"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import Link from "next/link";

// ─── DESIGN TOKENS ───────────────────────────────────────────────────────────
const T = {
  bg: "#020609", bg1: "#060D1C", bg2: "#0A1428",
  glass: "rgba(8,16,32,0.65)", glassBright: "rgba(12,24,48,0.45)",
  border: "rgba(0,255,163,0.08)", borderHov: "rgba(0,255,163,0.25)",
  neon: "#00FFA3", neon2: "#00D4FF", neon3: "#FF6B6B",
  neon4: "#FFB347", accent: "#BD69FF",
  warm: "#FF9F43", cool: "#54A0FF",
  text: "#E2ECF9", textBright: "#FFFFFF",
  muted: "#4A6A8A", dim: "#1A2A3A", dimmer: "#0D1520",
  mono: "'JetBrains Mono', 'Fira Code', monospace",
  display: "'Syne', 'Inter', sans-serif",
};

const CHAPTERS = [
  {
    num: 1, path: "/c-1", title: "C Fundamentals", color: T.neon, icon: "🚀",
    subtitle: "The Foundation",
    topics: ["What is C?", "History (1972–now)", "Program structure", "32 Keywords", "Compilation pipeline", "Hello World", "Execution flow"],
    difficulty: "Beginner",
  },
  {
    num: 2, path: "/c-2", title: "Memory & Data", color: T.neon2, icon: "🧠",
    subtitle: "Bytes & Beyond",
    topics: ["Bits & binary", "int / float / char", "sizeof operator", "Type limits & overflow", "Type casting", "Constants & literals"],
    difficulty: "Beginner",
  },
  {
    num: 3, path: "/c-3", title: "Operators & Flow", color: T.neon4, icon: "⚡",
    subtitle: "Logic & Control",
    topics: ["Arithmetic ops", "Relational & logical", "Bitwise ops", "if / else branching", "switch-case", "for / while / do-while"],
    difficulty: "Intermediate",
  },
  {
    num: 4, path: "/c-4", title: "Functions & Arrays", color: T.accent, icon: "🔧",
    subtitle: "Modular Power",
    topics: ["Define & call functions", "4 function types", "Scope & lifetime", "Recursion & stack", "1D arrays", "2D arrays & matrices"],
    difficulty: "Intermediate",
  },
  {
    num: 5, path: "/c-5", title: "Pointers & Structs", color: T.neon3, icon: "🎯",
    subtitle: "Deep Memory",
    topics: ["& and * operators", "Pointer arithmetic", "Arrays ↔ pointers", "malloc / free", "Structures & typedef", "Function pointers"],
    difficulty: "Advanced",
  },
  {
    num: 6, path: "/c-6", title: "Files & Strings", color: "#00E5FF", icon: "📁",
    subtitle: "Data Streams",
    topics: ["String basics", "string.h library", "File modes r/w/a", "fopen & fclose", "fprintf / fscanf", "Error handling"],
    difficulty: "Advanced",
  },
  {
    num: 7, path: "/c-7", title: "Advanced Topics", color: "#FF61D2", icon: "🏆",
    subtitle: "Master Level",
    topics: ["Preprocessor", "Macros vs functions", "Enums & unions", "CLI args", "Multi-file build", "Memory layout"],
    difficulty: "Expert",
  },
];

// ─── CONSTELLATION BACKGROUND ────────────────────────────────────────────────
function ConstellationBG() {
  const cvs = useRef(null);
  useEffect(() => {
    const c = cvs.current; if (!c) return;
    const ctx = c.getContext("2d");
    let W, H, af, t = 0, mouse = { x: -1, y: -1 };

    const stars = [];
    const STAR_COUNT = 180;
    const CONNECTION_DIST = 120;

    const resize = () => {
      W = c.width = c.offsetWidth * (window.devicePixelRatio || 1);
      H = c.height = c.offsetHeight * (window.devicePixelRatio || 1);
      ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
    };

    const init = () => {
      stars.length = 0;
      const rW = c.offsetWidth, rH = c.offsetHeight;
      for (let i = 0; i < STAR_COUNT; i++) {
        stars.push({
          x: Math.random() * rW,
          y: Math.random() * rH,
          vx: (Math.random() - 0.5) * 0.15,
          vy: (Math.random() - 0.5) * 0.15,
          r: Math.random() * 1.8 + 0.3,
          pulse: Math.random() * Math.PI * 2,
          hue: 140 + Math.random() * 80,
        });
      }
    };

    resize(); init();
    window.addEventListener("resize", () => { resize(); init(); });

    const onMouse = (e) => { mouse = { x: e.clientX, y: e.clientY }; };
    window.addEventListener("mousemove", onMouse);

    const draw = () => {
      const rW = c.offsetWidth, rH = c.offsetHeight;
      ctx.clearRect(0, 0, rW, rH);
      t += 0.004;

      // Update & draw stars
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        s.x += s.vx; s.y += s.vy;
        if (s.x < 0) s.x = rW; if (s.x > rW) s.x = 0;
        if (s.y < 0) s.y = rH; if (s.y > rH) s.y = 0;
        s.pulse += 0.02;

        const pulse = Math.sin(s.pulse) * 0.4 + 0.6;
        const alpha = pulse * 0.6;

        // Mouse interaction — stars near cursor glow brighter
        let mDist = 9999;
        if (mouse.x > 0) {
          mDist = Math.hypot(s.x - mouse.x, s.y - mouse.y);
        }
        const mInfluence = Math.max(0, 1 - mDist / 200) * 0.5;

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * (1 + mInfluence * 2), 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${s.hue}, 80%, ${65 + mInfluence * 30}%, ${alpha + mInfluence})`;
        ctx.fill();

        if (mInfluence > 0.1) {
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r * 4, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${s.hue}, 80%, 65%, ${mInfluence * 0.15})`;
          ctx.fill();
        }
      }

      // Draw connections
      for (let i = 0; i < stars.length; i++) {
        for (let j = i + 1; j < stars.length; j++) {
          const dx = stars[i].x - stars[j].x;
          const dy = stars[i].y - stars[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DIST) {
            const alpha = (1 - dist / CONNECTION_DIST) * 0.08;
            ctx.beginPath();
            ctx.moveTo(stars[i].x, stars[i].y);
            ctx.lineTo(stars[j].x, stars[j].y);
            ctx.strokeStyle = `rgba(0, 255, 163, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // Draw a very subtle hex grid overlay
      const R = 60;
      for (let row = -1; row < rH / (R * 1.5) + 2; row++) {
        for (let col = -1; col < rW / (R * 1.732) + 2; col++) {
          const ox = row % 2 === 0 ? 0 : R * 0.866;
          const cx = col * R * 1.732 + ox, cy = row * R * 1.5;
          const pulse2 = Math.sin(t * 1.5 + cx * 0.002 + cy * 0.003) * 0.5 + 0.5;
          ctx.beginPath();
          for (let k = 0; k < 6; k++) {
            const a = (Math.PI / 3) * k - Math.PI / 6;
            k === 0 ? ctx.moveTo(cx + R * 0.9 * Math.cos(a), cy + R * 0.9 * Math.sin(a))
              : ctx.lineTo(cx + R * 0.9 * Math.cos(a), cy + R * 0.9 * Math.sin(a));
          }
          ctx.closePath();
          ctx.strokeStyle = `rgba(0,255,163,${pulse2 * 0.015})`;
          ctx.lineWidth = 0.4; ctx.stroke();
        }
      }

      af = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(af); window.removeEventListener("mousemove", onMouse); };
  }, []);
  return <canvas ref={cvs} style={{ position: "fixed", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0 }} />;
}

// ─── GLITCH TEXT HOOK ────────────────────────────────────────────────────────
const GLITCH_CHARS = "!<>-_\\/[]{}=+*^?#@$%&";
function useGlitch(text, trigger) {
  const [display, setDisplay] = useState(text);
  useEffect(() => {
    if (!trigger) { setDisplay(text); return; }
    let i = 0;
    const iv = setInterval(() => {
      setDisplay(text.split("").map((c, j) =>
        j < i ? c : c === " " ? " " : GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]
      ).join(""));
      i += 0.8;
      if (i >= text.length) { setDisplay(text); clearInterval(iv); }
    }, 22);
    return () => clearInterval(iv);
  }, [trigger, text]);
  return display;
}

// ─── TYPING TEXT ─────────────────────────────────────────────────────────────
function TypingText({ text, delay = 0, speed = 30, style }) {
  const [displayed, setDisplayed] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  useEffect(() => {
    const timeout = setTimeout(() => {
      let i = 0;
      const iv = setInterval(() => {
        if (i < text.length) {
          setDisplayed(text.slice(0, i + 1));
          i++;
        } else {
          clearInterval(iv);
          setTimeout(() => setShowCursor(false), 1500);
        }
      }, speed);
      return () => clearInterval(iv);
    }, delay);
    return () => clearTimeout(timeout);
  }, [text, delay, speed]);
  return (
    <span style={style}>
      {displayed}
      {showCursor && <span style={{ animation: "blink 1s step-end infinite", color: T.neon }}>▌</span>}
    </span>
  );
}

// ─── FLOATING PARTICLES (small ambient) ──────────────────────────────────────
function FloatingOrbs() {
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1, overflow: "hidden" }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.div
          key={i}
          animate={{
            x: [0, Math.random() * 100 - 50, 0],
            y: [0, Math.random() * 60 - 30, 0],
            opacity: [0.15, 0.4, 0.15],
          }}
          transition={{ duration: 8 + i * 3, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            width: 200 + i * 80,
            height: 200 + i * 80,
            borderRadius: "50%",
            background: `radial-gradient(ellipse, ${[T.neon, T.neon2, T.accent, T.neon3, T.neon4, "#FF61D2"][i]}08 0%, transparent 70%)`,
            filter: `blur(${40 + i * 20}px)`,
            top: `${10 + i * 12}%`,
            left: `${5 + i * 14}%`,
          }}
        />
      ))}
    </div>
  );
}

// ─── DIFFICULTY BADGE ────────────────────────────────────────────────────────
function DiffBadge({ level, color }) {
  const colors = {
    Beginner: "#00FFA3",
    Intermediate: "#FFB347",
    Advanced: "#FF6B6B",
    Expert: "#FF61D2",
  };
  const c = colors[level] || color;
  return (
    <span style={{
      fontFamily: T.mono, fontSize: 7, fontWeight: 700,
      letterSpacing: 2.5, padding: "3px 8px",
      background: `${c}12`, border: `1px solid ${c}30`,
      borderRadius: 4, color: c, textTransform: "uppercase",
    }}>{level}</span>
  );
}

// ─── CHAPTER CARD — ULTRA PREMIUM ────────────────────────────────────────────
function ChapterCard({ ch, i, isActive, onHover }) {
  const [hov, setHov] = useState(false);
  const cardRef = useRef(null);
  const glitchTitle = useGlitch(ch.title, hov);

  const handleEnter = () => { setHov(true); onHover(i); };
  const handleLeave = () => { setHov(false); onHover(-1); };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.15 + i * 0.08, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      style={{ flex: 1, minWidth: 0, height: "100%", display: "flex", position: "relative" }}
    >
      <Link href={ch.path} style={{ textDecoration: "none", display: "flex", flex: 1, minWidth: 0 }}>
        <motion.div
          animate={{
            borderColor: hov ? `${ch.color}50` : `${T.dim}80`,
            y: hov ? -4 : 0,
          }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          style={{
            flex: 1, minWidth: 0, display: "flex", flexDirection: "column",
            background: hov
              ? `linear-gradient(175deg, ${ch.color}0D 0%, ${T.glass} 35%, ${ch.color}08 100%)`
              : `linear-gradient(175deg, ${T.glass} 0%, rgba(6,12,28,0.7) 100%)`,
            border: `1px solid ${T.dim}80`,
            borderRadius: 14, overflow: "hidden",
            cursor: "pointer", position: "relative",
            backdropFilter: "blur(20px)",
            transition: "background 0.4s, box-shadow 0.4s",
            boxShadow: hov
              ? `0 8px 40px ${ch.color}15, 0 0 60px ${ch.color}08, inset 0 1px 0 ${ch.color}15`
              : `0 2px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.03)`,
          }}
        >
          {/* ── Top accent beam ── */}
          <motion.div
            animate={{ opacity: hov ? 1 : 0.2, height: hov ? 3 : 2 }}
            style={{
              flexShrink: 0,
              background: `linear-gradient(90deg, transparent 2%, ${ch.color}80 25%, ${ch.color} 50%, ${ch.color}80 75%, transparent 98%)`,
              transition: "opacity 0.3s, height 0.3s",
            }}
          />

          {/* ── Holographic shimmer overlay ── */}
          <motion.div
            animate={{ opacity: hov ? 1 : 0 }}
            transition={{ duration: 0.5 }}
            style={{
              position: "absolute", top: 0, left: 0, right: 0, height: "50%",
              background: `linear-gradient(180deg, ${ch.color}08 0%, transparent 100%)`,
              pointerEvents: "none",
            }}
          />

          {/* ── Corner accents ── */}
          <div style={{ position: "absolute", top: 8, right: 8, pointerEvents: "none" }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M16 0V6H14V2H10V0H16Z" fill={hov ? `${ch.color}60` : `${ch.color}15`} style={{ transition: "fill 0.3s" }} />
            </svg>
          </div>
          <div style={{ position: "absolute", bottom: 8, left: 8, pointerEvents: "none" }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M0 16V10H2V14H6V16H0Z" fill={hov ? `${ch.color}60` : `${ch.color}15`} style={{ transition: "fill 0.3s" }} />
            </svg>
          </div>

          {/* ── HEADER ── */}
          <div style={{ padding: "12px 12px 8px", flexShrink: 0, textAlign: "center", position: "relative" }}>
            {/* Chapter number — large watermark */}
            <motion.div
              animate={{ opacity: hov ? 0.06 : 0.03, scale: hov ? 1.1 : 1 }}
              style={{
                position: "absolute", top: 6, right: 6,
                fontFamily: T.display, fontSize: 48, fontWeight: 900,
                color: ch.color, lineHeight: 1, pointerEvents: "none",
                transition: "opacity 0.3s",
              }}
            >{String(ch.num).padStart(2, "0")}</motion.div>

            {/* Icon */}
            <motion.div
              animate={{
                scale: hov ? 1.18 : 1,
                rotate: hov ? 6 : 0,
              }}
              transition={{ type: "spring", stiffness: 280, damping: 18 }}
              style={{
                fontSize: 26, width: 44, height: 44, borderRadius: 12,
                background: `linear-gradient(145deg, ${ch.color}15, ${ch.color}06)`,
                border: `1px solid ${ch.color}25`,
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 6px",
                boxShadow: hov ? `0 4px 24px ${ch.color}25, 0 0 0 1px ${ch.color}15` : "none",
                transition: "box-shadow 0.3s, border-color 0.3s",
              }}
            >{ch.icon}</motion.div>

            {/* Title */}
            <div style={{
              fontFamily: T.display, fontSize: 15, fontWeight: 800,
              color: hov ? ch.color : T.text,
              transition: "color 0.3s, text-shadow 0.3s",
              letterSpacing: -0.3, lineHeight: 1.2,
              textShadow: hov ? `0 0 28px ${ch.color}50, 0 0 8px ${ch.color}25` : "none",
              minHeight: 36, display: "flex", alignItems: "center", justifyContent: "center",
            }}>{glitchTitle}</div>

            {/* Subtitle */}
            <motion.div
              animate={{ opacity: hov ? 0.8 : 0.35 }}
              style={{
                fontFamily: T.mono, fontSize: 8, letterSpacing: 2.5,
                color: ch.color, marginTop: 3, textTransform: "uppercase",
                transition: "opacity 0.3s",
              }}
            >{ch.subtitle}</motion.div>

            {/* Difficulty badge */}
            <div style={{ marginTop: 6 }}><DiffBadge level={ch.difficulty} color={ch.color} /></div>
          </div>

          {/* ── Divider ── */}
          <div style={{
            height: 1, flexShrink: 0, margin: "0 10px",
            background: `linear-gradient(90deg, transparent, ${ch.color}${hov ? '50' : '20'}, transparent)`,
            transition: "background 0.3s",
          }} />

          {/* ── TOPICS ── */}
          <div style={{
            flex: 1, padding: "10px 8px 8px 10px",
            display: "flex", flexDirection: "column",
            justifyContent: "space-between",
            overflow: "hidden",
          }}>
            {ch.topics.map((topic, j) => (
              <motion.div
                key={j}
                animate={{
                  x: hov ? 4 : 0,
                  opacity: hov ? 1 : 0.55,
                }}
                transition={{ delay: j * 0.02, duration: 0.2 }}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  fontFamily: T.mono, fontSize: 10.5,
                  color: hov ? "#E8F0FC" : "#7A94B0",
                  lineHeight: 1.5,
                  padding: "3px 0 3px 8px",
                  borderLeft: `2px solid ${hov ? `${ch.color}55` : `${ch.color}12`}`,
                  borderRadius: "0 3px 3px 0",
                  background: hov ? `${ch.color}05` : "transparent",
                  transition: "border-color 0.25s, background 0.25s, color 0.25s",
                }}
              >
                <span style={{
                  width: 3, height: 3, borderRadius: "50%",
                  background: hov ? ch.color : `${ch.color}40`,
                  flexShrink: 0, transition: "background 0.25s",
                }} />
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{topic}</span>
              </motion.div>
            ))}
          </div>

          {/* ── Progress indicator ── */}
          <div style={{ padding: "0 10px 4px", flexShrink: 0 }}>
            <div style={{
              height: 2, borderRadius: 1,
              background: `${ch.color}10`,
              overflow: "hidden",
            }}>
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: hov ? "100%" : "0%" }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                style={{
                  height: "100%",
                  background: `linear-gradient(90deg, ${ch.color}60, ${ch.color})`,
                  borderRadius: 1,
                  boxShadow: `0 0 8px ${ch.color}40`,
                }}
              />
            </div>
          </div>

          {/* ── CTA ── */}
          <div style={{ padding: "4px 10px 10px", flexShrink: 0 }}>
            <motion.div
              animate={{
                background: hov
                  ? `linear-gradient(135deg, ${ch.color}25, ${ch.color}10)`
                  : `${ch.color}06`,
                borderColor: hov ? `${ch.color}50` : `${ch.color}18`,
                scale: hov ? 1.03 : 1,
              }}
              transition={{ duration: 0.25 }}
              style={{
                padding: "8px 0", textAlign: "center",
                borderRadius: 7, border: `1px solid ${ch.color}18`,
                fontFamily: T.mono, fontSize: 8, fontWeight: 700,
                letterSpacing: 3.5, color: ch.color,
                transition: "all 0.25s",
                boxShadow: hov ? `0 2px 20px ${ch.color}15` : "none",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              }}
            >
              <span>EXPLORE</span>
              <motion.span
                animate={{ x: hov ? 3 : 0 }}
                transition={{ duration: 0.2 }}
              >→</motion.span>
            </motion.div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}

// ─── STAT COUNTER ────────────────────────────────────────────────────────────
function StatCounter({ value, label, color, delay = 0 }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const timeout = setTimeout(() => {
      let start = 0;
      const duration = 1200;
      const startTime = performance.now();
      const animate = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(Math.floor(eased * value));
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    }, delay);
    return () => clearTimeout(timeout);
  }, [value, delay]);

  return (
    <div style={{ textAlign: "center" }}>
      <div style={{
        fontFamily: T.display, fontSize: 22, fontWeight: 900,
        color: color, lineHeight: 1,
        textShadow: `0 0 20px ${color}40`,
      }}>{count}+</div>
      <div style={{
        fontFamily: T.mono, fontSize: 7, letterSpacing: 2.5,
        color: T.muted, marginTop: 3, textTransform: "uppercase",
      }}>{label}</div>
    </div>
  );
}

// ─── MAIN PAGE ───────────────────────────────────────────────────────────────
export default function CIntroPage() {
  const [mounted, setMounted] = useState(false);
  const [activeCard, setActiveCard] = useState(-1);
  const [time, setTime] = useState("00:00:00");

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    const iv = setInterval(() => {
      const n = new Date();
      setTime([n.getHours(), n.getMinutes(), n.getSeconds()].map(x => String(x).padStart(2, "0")).join(":"));
    }, 1000);
    return () => clearInterval(iv);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:ital,wght@0,300;0,400;0,500;0,700;1,400&family=Inter:wght@300;400;500;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html,body{background:${T.bg};color:${T.text};overflow:hidden;height:100%;-webkit-font-smoothing:antialiased}
        ::-webkit-scrollbar{display:none}
        ::selection{background:${T.neon}20;color:${T.neon}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes pulse-ring{0%{transform:scale(1);opacity:0.4}50%{transform:scale(1.15);opacity:0.1}100%{transform:scale(1);opacity:0.4}}
        @keyframes sweep{0%{left:-30%}100%{left:130%}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
        @keyframes scan-line{0%{top:-2px}100%{top:100%}}
        @keyframes data-pulse{0%,100%{opacity:0.3}50%{opacity:0.8}}

        /* ── RESPONSIVE — TABLET (≤1024px) ── */
        @media(max-width:1024px){
          html,body{overflow:auto!important;overflow-x:hidden!important}
          .ci-hud-center{display:none!important}
          .ci-hud-right{display:none!important}
          .ci-main{height:auto!important;min-height:100vh;overflow:visible!important;padding:12px 16px!important}
          .ci-cards{
            flex-wrap:wrap!important;
            overflow-x:visible!important;
            gap:12px!important;
          }
          .ci-cards>div{
            min-width:calc(50% - 8px)!important;
            max-width:calc(50% - 8px)!important;
            flex:0 0 calc(50% - 8px)!important;
            height:auto!important;
            min-height:280px;
          }
          .ci-pill{flex-wrap:wrap!important;justify-content:center!important}
          .ci-pill>div{white-space:nowrap}
          .ci-bottom{
            flex-wrap:wrap!important;
            justify-content:center!important;
            gap:10px!important;
            padding:12px 16px!important;
          }
          .ci-bottom-right{display:none!important}
        }

        /* ── RESPONSIVE — PHONE (≤640px) ── */
        @media(max-width:640px){
          .ci-main{padding:10px 12px!important}
          .ci-cards{
            flex-direction:column!important;
            gap:14px!important;
          }
          .ci-cards>div{
            min-width:100%!important;
            max-width:100%!important;
            flex:0 0 100%!important;
            min-height:auto!important;
            height:auto!important;
          }
          .ci-hero-row{flex-direction:column!important;gap:8px!important}
          .ci-pill-bar{flex-direction:column!important;width:100%}
          .ci-pill-bar>div{border-right:none!important;border-bottom:1px solid ${T.neon}15;text-align:center;justify-content:center!important}
          .ci-pill-bar>div:last-child{border-bottom:none!important}
          .ci-bottom{
            flex-direction:column!important;
            gap:10px!important;
            text-align:center;
            align-items:center!important;
            padding:14px!important;
          }
        }
      `}</style>

      <ConstellationBG />
      <FloatingOrbs />

      {/* ── Ambient gradients ── */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1 }}>
        <div style={{ position: "absolute", top: "-12%", left: "15%", width: "70%", height: "40%", background: `radial-gradient(ellipse,${T.neon}05 0%,transparent 65%)`, filter: "blur(120px)" }} />
        <div style={{ position: "absolute", bottom: "0", right: "0", width: "30%", height: "30%", background: `radial-gradient(ellipse,${T.accent}04 0%,transparent 65%)`, filter: "blur(80px)" }} />
        <div style={{ position: "absolute", top: "50%", left: "0", width: "25%", height: "25%", background: `radial-gradient(ellipse,${T.neon2}03 0%,transparent 65%)`, filter: "blur(70px)" }} />
      </div>

      {/* ── Noise texture ── */}
      <svg style={{ position: "fixed", inset: 0, width: "100%", height: "100%", opacity: 0.018, pointerEvents: "none", zIndex: 2 }}>
        <filter id="n"><feTurbulence type="fractalNoise" baseFrequency=".65" numOctaves="3" stitchTiles="stitch" /><feColorMatrix type="saturate" values="0" /></filter>
        <rect width="100%" height="100%" filter="url(#n)" />
      </svg>

      {/* ── Scanlines ── */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 2, background: "repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.015) 3px,rgba(0,0,0,0.015) 6px)", mixBlendMode: "multiply" }} />

      {/* ── Animated scan beam ── */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 3, overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", left: 0, right: 0, height: 1,
          background: `linear-gradient(90deg, transparent, ${T.neon}15, transparent)`,
          animation: "scan-line 8s linear infinite",
        }} />
      </div>

      {/* === FULL VIEWPORT LAYOUT === */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: mounted ? 1 : 0 }}
        transition={{ duration: 0.8 }}
        className="ci-main"
        style={{
          position: "relative", zIndex: 10,
          width: "100%", height: "100vh",
          display: "flex", flexDirection: "column",
          padding: "clamp(8px,1.2vh,14px) clamp(10px,2vw,20px)",
          overflow: "hidden",
        }}
      >

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* ── TOP HUD BAR ── */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            marginBottom: "clamp(4px,0.6vh,8px)", flexShrink: 0,
            padding: "8px 14px",
            background: "rgba(4,8,16,0.6)",
            backdropFilter: "blur(20px)",
            border: `1px solid ${T.dim}60`,
            borderRadius: 10,
          }}
        >
          {/* Left — Back + branding */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Link href="/" style={{ textDecoration: "none" }}>
              <motion.div
                whileHover={{ x: -3, color: T.neon }}
                style={{
                  fontFamily: T.mono, fontSize: 9, letterSpacing: 2,
                  color: T.muted, cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                }}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M8 2L4 6L8 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                BACK
              </motion.div>
            </Link>
            <div style={{ width: 1, height: 14, background: T.dim }} />
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{
                width: 6, height: 6, borderRadius: "50%", background: T.neon,
                display: "block", boxShadow: `0 0 8px ${T.neon}`, animation: "data-pulse 2.5s ease-in-out infinite",
              }} />
              <span style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 3, color: T.muted }}>VISUOSLAYER</span>
            </div>
          </div>

          {/* Center — Title */}
          <div className="ci-hud-center" style={{ textAlign: "center", display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ width: 24, height: 1, background: `linear-gradient(90deg, transparent, ${T.neon}40)`, display: "block" }} />
            <span style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 4, color: T.muted }}>
              C PROGRAMMING SYLLABUS
            </span>
            <span style={{ width: 24, height: 1, background: `linear-gradient(90deg, ${T.neon}40, transparent)`, display: "block" }} />
          </div>

          {/* Right — Status (hidden on tablet/mobile via CSS) */}
          <div className="ci-hud-right" style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 2, color: T.dim, textAlign: "right" }}>
              <span style={{ color: `${T.neon}60` }}>SIG </span>
              <span style={{ color: "#39ff14" }}>LIVE</span>
            </div>
            <div style={{ width: 1, height: 14, background: T.dim }} />
            <div style={{ fontFamily: T.mono, fontSize: 9, color: T.dim, letterSpacing: 1 }}>{time}</div>
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* ── HERO SECTION — CENTERED ── */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          style={{
            flexShrink: 0,
            display: "flex", flexDirection: "column", alignItems: "center",
            padding: "clamp(6px,1vh,12px) 0 clamp(4px,0.6vh,8px)",
            position: "relative",
          }}
        >
          {/* Decorative side lines behind title */}
          <div style={{
            position: "absolute", top: "38%", left: 0, right: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            pointerEvents: "none", transform: "translateY(-50%)",
          }}>
            <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, transparent 10%, ${T.neon}10 50%, transparent 90%)` }} />
          </div>

          {/* Main heading */}
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            style={{
              fontFamily: T.display, fontSize: "clamp(24px,3.8vh,42px)",
              fontWeight: 800, letterSpacing: -1.5, lineHeight: 1.05, margin: 0,
              textAlign: "center", position: "relative",
              display: "flex", alignItems: "center", gap: "clamp(8px,1.5vw,18px)",
            }}
          >
            {/* Left decorative bracket */}
            <span style={{
              display: "inline-flex", flexDirection: "column", gap: 3, opacity: 0.2,
            }}>
              <span style={{ width: 14, height: 2, background: T.neon, borderRadius: 1 }} />
              <span style={{ width: 8, height: 2, background: T.neon, borderRadius: 1 }} />
            </span>

            <span>
              <span style={{ color: T.text }}>Master </span>
              <span style={{
                color: T.neon,
                textShadow: `0 0 40px ${T.neon}50, 0 0 80px ${T.neon}20`,
                position: "relative",
              }}>
                C
                <span style={{
                  position: "absolute", bottom: -2, left: 0, right: 0, height: 2,
                  background: `linear-gradient(90deg, ${T.neon}, transparent)`,
                  borderRadius: 1,
                }} />
              </span>
              <span style={{ color: T.text }}> Programming</span>
            </span>

            {/* Right decorative bracket */}
            <span style={{
              display: "inline-flex", flexDirection: "column", gap: 3, opacity: 0.2, alignItems: "flex-end",
            }}>
              <span style={{ width: 14, height: 2, background: T.neon, borderRadius: 1 }} />
              <span style={{ width: 8, height: 2, background: T.neon, borderRadius: 1 }} />
            </span>
          </motion.h1>


        </motion.div>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* ── FLOW CONNECTOR ── */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <div style={{
          flexShrink: 0, height: 2, marginBottom: "clamp(4px,0.5vh,6px)",
          borderRadius: 2, overflow: "hidden", position: "relative",
        }}>
          <div style={{
            position: "absolute", inset: 0,
            background: `linear-gradient(90deg, ${T.neon}00, ${T.neon}35 14%, ${T.neon2}30 28%, ${T.neon4}25 42%, ${T.accent}25 57%, ${T.neon3}25 71%, ${'#00E5FF'}25 85%, ${'#FF61D2'}20 95%, ${'#FF61D2'}00)`,
          }} />
          {/* Animated sweep */}
          <div style={{
            position: "absolute", top: 0, bottom: 0, width: "15%",
            background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)`,
            animation: "sweep 4s ease-in-out infinite",
          }} />
        </div>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* ── 7 CHAPTER CARDS ── */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <div className="ci-cards" style={{
          flex: 1, minHeight: 0,
          display: "flex", gap: "clamp(6px,0.7vw,12px)",
        }}>
          {CHAPTERS.map((ch, i) => (
            <ChapterCard key={ch.num} ch={ch} i={i} isActive={activeCard === i} onHover={setActiveCard} />
          ))}
        </div>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* ── BOTTOM BAR ── */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="ci-bottom"
          style={{
            flexShrink: 0, marginTop: "clamp(4px,0.6vh,8px)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "8px 14px",
            background: "rgba(4,8,16,0.5)",
            backdropFilter: "blur(16px)",
            border: `1px solid ${T.dim}50`,
            borderRadius: 10,
            gap: "clamp(8px,1vw,16px)",
          }}
        >
          {/* Left — Credits */}
          <div style={{
            fontFamily: T.mono, fontSize: 7, letterSpacing: 3, color: T.dim,
            display: "flex", alignItems: "center", gap: 6,
            flexShrink: 0,
          }}>
            <span style={{ width: 12, height: 1, background: `linear-gradient(90deg, ${T.neon}40, transparent)`, display: "block" }} />
            VISUOSLAYER // SAIF
          </div>

          {/* Center — Subtitle pill */}
          <div className="ci-pill-bar" style={{
            display: "flex", alignItems: "center", gap: 0,
            background: `linear-gradient(135deg, rgba(0,255,163,0.08), rgba(0,212,255,0.04))`,
            border: `1px solid ${T.neon}35`,
            borderRadius: 10, overflow: "hidden",
            boxShadow: `0 0 30px ${T.neon}12, 0 0 60px ${T.neon}06, inset 0 0 20px ${T.neon}06`,
          }}>
            {/* "From absolute zero → DSA-ready" segment */}
            <div style={{
              padding: "6px 14px",
              fontFamily: T.mono, fontSize: "clamp(9px,1vh,12px)",
              fontWeight: 600, letterSpacing: 0.8, color: T.neon,
              background: `linear-gradient(135deg, ${T.neon}18, ${T.neon}08)`,
              borderRight: `1px solid ${T.neon}25`,
              display: "flex", alignItems: "center", gap: 8,
              textShadow: `0 0 16px ${T.neon}50, 0 0 4px ${T.neon}30`,
            }}>
              <span style={{
                width: 7, height: 7, borderRadius: "50%",
                background: T.neon, boxShadow: `0 0 10px ${T.neon}, 0 0 20px ${T.neon}60`,
                animation: "data-pulse 2s ease-in-out infinite",
                flexShrink: 0,
              }} />
              From absolute zero → DSA-ready
            </div>
            {/* "7 chapters" segment */}
            <div style={{
              padding: "6px 12px",
              fontFamily: T.mono, fontSize: "clamp(9px,1vh,12px)",
              letterSpacing: 0.8, color: T.neon2,
              borderRight: `1px solid ${T.neon}18`,
              textShadow: `0 0 10px ${T.neon2}40`,
            }}>
              <span style={{ fontWeight: 800, fontSize: "clamp(11px,1.2vh,14px)" }}>7</span> chapters
            </div>
            {/* "42+ topics" segment */}
            <div style={{
              padding: "6px 12px",
              fontFamily: T.mono, fontSize: "clamp(9px,1vh,12px)",
              letterSpacing: 0.8, color: T.neon4,
              textShadow: `0 0 10px ${T.neon4}40`,
            }}>
              <span style={{ fontWeight: 800, fontSize: "clamp(11px,1.2vh,14px)" }}>42+</span> topics
            </div>
          </div>

          {/* Right — START CH-1 button */}
          <Link href="/c-1" style={{ textDecoration: "none", flexShrink: 0 }}>
            <motion.div
              whileHover={{
                scale: 1.06,
                boxShadow: `0 0 30px ${T.neon}30, 0 0 60px ${T.neon}10`,
              }}
              whileTap={{ scale: 0.96 }}
              style={{
                fontFamily: T.mono, fontSize: "clamp(9px,1vh,11px)", fontWeight: 700,
                letterSpacing: 2.5, padding: "6px 18px",
                background: `linear-gradient(135deg, ${T.neon}28, ${T.neon}10)`,
                border: `1px solid ${T.neon}50`, borderRadius: 8,
                color: T.neon, cursor: "pointer",
                boxShadow: `0 0 20px ${T.neon}18, 0 0 40px ${T.neon}08`,
                display: "flex", alignItems: "center", gap: 8,
                whiteSpace: "nowrap",
              }}
            >
              <span style={{ fontSize: "clamp(9px,1vh,12px)" }}>▶</span>
              START CH-1
              <motion.span
                animate={{ x: [0, 3, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                style={{ opacity: 0.7 }}
              >→</motion.span>
            </motion.div>
          </Link>
        </motion.div>
      </motion.div>
    </>
  );
}
