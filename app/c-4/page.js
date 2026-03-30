"use client";

import {
  useState, useEffect, useRef, useCallback, useMemo, Suspense,
} from "react";
import {
  motion, AnimatePresence,
} from "framer-motion";
import Link from "next/link";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, Float, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN TOKENS
// ─────────────────────────────────────────────────────────────────────────────
const T = {
  bg:      "#030810",
  bg1:     "#060D1C",
  bg2:     "#0A1428",
  glass:   "rgba(10,20,40,0.75)",
  border:  "rgba(0,255,163,0.10)",
  neon:    "#00FFA3",
  neon2:   "#00D4FF",
  neon3:   "#FF6B6B",
  neon4:   "#FFB347",
  accent:  "#BD69FF",
  text:    "#DDE8F8",
  muted:   "#3E5A7A",
  dim:     "#1A2A3A",
  mono:    "'JetBrains Mono', monospace",
  display: "'Syne', sans-serif",
};

// ─────────────────────────────────────────────────────────────────────────────
// VOICE NARRATION SCRIPTS — one per section, "crazy level" explanations
// ─────────────────────────────────────────────────────────────────────────────
const VOICE_SCRIPTS = {
  hero: `Welcome to Chapter 4 of C programming — the big three: Functions, Arrays, and Strings. 
  These are not just topics. They are the architecture of every real program ever written. 
  By the end of this chapter, you will think in terms of modular logic, contiguous memory, and null-terminated data. 
  Let's build your mental engine from the ground up.`,

  "why-fn": `Why do functions exist? Because the human brain cannot hold 800 lines of logic at once. 
  Functions are cognitive compression. You name a chunk of behavior, and from that point on, 
  the name IS the behavior. You don't need to know how square root works — you just call sqrt and trust it. 
  That's abstraction. That's power. Functions also enforce the DRY principle — Don't Repeat Yourself. 
  Write once, call a thousand times. If there's a bug, fix it in one place, and every caller gets the fix instantly.`,

  "fn-anatomy": `Every function call is a three-act play. Act one: the caller pushes arguments onto the stack. 
  Act two: the function executes in its own private memory frame — a completely isolated box. 
  Act three: the return value travels back to the caller, and the frame is destroyed. 
  The critical insight? Arguments are COPIED. Pass-by-value means the function gets a xerox of your data, 
  not the original. So it cannot corrupt your variables — unless you deliberately pass a pointer, 
  which is a completely different beast we cover in Chapter 5.`,

  "fn-types": `The four function types are not arbitrary. They map directly to what a function's relationship is with the world. 
  No input, no output — pure side effect machine. Input, no output — consumes data, produces side effects like printing. 
  Input AND output — the gold standard: pure function. Same input, always same output. Zero hidden state. Maximally testable. 
  And finally: no input, return value — reads from global state or generates values like random numbers. 
  Your goal as a programmer? Make as many functions pure as possible. Pure functions are the ones you can trust absolutely.`,

  scope: `Scope is the answer to: who can see what, and for how long? 
  Local variables are born when execution enters their block, and they die when execution leaves it. 
  Literally destroyed. The memory is reclaimed. Global variables live for the entire lifetime of the program — 
  they're always there, always accessible, always a temptation. But resist that temptation. 
  Globals create invisible dependencies. Function A changes a global, Function B reads it later, 
  now B's behavior depends on A's execution order. That's a debugging nightmare. 
  Pass data as arguments. Return results. Keep functions independent.`,

  recursion: `Recursion is a function calling itself. But here's the mental model that makes it click: 
  don't think about the full chain of calls. Think about ONE call. 
  What does factorial of N need? It needs N times factorial of N-minus-1. 
  Does factorial of N-minus-1 work? Trust that it does. That's the recursive leap of faith. 
  The call stack is the bookkeeper. Every call gets its own frame, its own copy of N. 
  The stack grows as calls pile up, then collapses as returns cascade back down. 
  The base case is the emergency brake. Without it, the stack grows forever until the OS kills your program.`,

  "arrays-1d": `An array is not a concept. It's a physical layout in memory. 
  When you declare int arr of 6, the compiler reserves 24 consecutive bytes — 4 bytes per integer, 6 integers, done. 
  arr bracket i is not magic. It compiles to: take the base address, add i times 4, dereference that pointer. 
  That's it. O of 1 access because it's pure arithmetic. 
  The dark side? C has zero bounds checking. arr bracket 100 will silently read whatever memory happens to be there. 
  It won't crash immediately. It'll corrupt your data and crash three function calls later in a completely unrelated place. 
  That's why off-by-one errors are so lethal in C.`,

  "arrays-2d": `A 2D array is a beautiful lie. It looks like a grid, but in memory it's completely flat. 
  Row zero, then row one, then row two — laid out sequentially, no gaps. 
  m bracket r bracket c compiles to: base address plus r times number-of-columns times 4, plus c times 4. 
  Pure arithmetic. The implication for performance? Row traversal is cache-friendly because you're walking 
  through memory sequentially. Column traversal jumps by a full row width each step — 
  that's a cache miss every single access. For large matrices, this is the difference between fast and catastrophically slow.`,

  traversal: `Traversal is the fundamental algorithm primitive. Before you can sort, search, transform, or filter — 
  you must traverse. Index-based traversal: i from 0 to n minus 1, access arr bracket i. 
  Pointer-based: start at the array's base address, increment the pointer, stop when it passes the end. 
  Both compile to identical machine code. The difference is only in how you express your intent. 
  Index-based is more readable for beginners. Pointer-based is how C's standard library is implemented internally. 
  Master both. The off-by-one boundary — i less than n, not i less than or equal to n — must be tattooed on your brain.`,

  "array-probs": `Sum, maximum, and reversal are not just homework exercises. They're the atoms of algorithm design. 
  Sum teaches you the accumulator pattern — initialize before the loop, update inside, read after. 
  Maximum teaches you the running-best pattern — initialize with the first element, not with zero. 
  Never with zero. What if all values are negative? Zero would win incorrectly. 
  Reversal teaches you the two-pointer technique — left and right indices moving toward each other, 
  swapping elements. This exact pattern appears in quicksort's partition step, in palindrome checks, 
  in Dutch flag problems. These three patterns recur endlessly in competitive programming and interviews.`,

  strings: `In C, a string is not a type. It's a convention. An array of characters where the last one is the null character — 
  ASCII value zero, written as backslash zero. That terminator is not optional. 
  It's how every string function knows where your data ends. 
  strlen doesn't magically know the length — it walks byte by byte, counting, until it hits null. 
  printf with percent s does the same. No null terminator means these functions keep reading 
  into whatever memory comes after your array. Data corruption. Security vulnerabilities. Crashes. 
  Always allocate strlen of s PLUS ONE byte for the null. That plus one has caused more security bugs than almost anything else in history.`,

  "str-fns": `The string dot h library is powerful but treacherous. 
  strcpy trusts you completely. It copies bytes from source to destination until it hits null — 
  and if your destination buffer is too small, it just keeps writing, obliterating whatever is next in memory. 
  This is a buffer overflow. It's how half of all C security vulnerabilities are born. 
  The safe versions — strncpy, strncat — take a maximum length argument. Always use them. 
  And strcmp — critical gotcha: it returns zero when strings are EQUAL. Zero is false in C. 
  So if you write if-strcmp-a-b and they ARE equal, the condition is FALSE. 
  Always write strcmp equals equals zero to test for equality. Burned into memory. Forever.`,

  engine: `This final section is where everything fuses together. Functions operating on arrays of strings. 
  A real program isn't one thing — it's a composition. A validation function that takes a string array 
  and returns a filtered integer array. A display function that formats a 2D grid of strings. 
  A recursive function that processes nested data. 
  The mental shift: stop thinking about syntax. Start thinking about data flowing through functions, 
  transforming at each step, accumulating in arrays, encoded as strings. 
  That is what programming is. You are now ready for Chapter 5: Pointers and Structs. 
  Everything accelerates from here.`,
};

// ─────────────────────────────────────────────────────────────────────────────
// PREMIUM VOICE ENGINE
// ─────────────────────────────────────────────────────────────────────────────
// Priority list of premium male voices (browser-dependent)
const PREFERRED_MALE_VOICES = [
  "Microsoft Guy Online (Natural) - English (United States)",
  "Microsoft Ryan Online (Natural) - English (United Kingdom)",
  "Microsoft James Online (Natural) - English (United Kingdom)",
  "Google UK English Male",
  "Microsoft David Desktop - English (United States)",
  "Microsoft Mark Desktop - English (United States)",
  "Alex",           // macOS
  "Daniel",         // macOS UK
  "Microsoft David",
  "Microsoft Mark",
  "Google US English",
];

function getBestMaleVoice(voices) {
  for (const preferred of PREFERRED_MALE_VOICES) {
    const match = voices.find(v => v.name === preferred);
    if (match) return match;
  }
  // Fallback: any voice with "male" in name, or first english voice
  const maleFallback = voices.find(v =>
    v.name.toLowerCase().includes("male") && v.lang.startsWith("en")
  );
  if (maleFallback) return maleFallback;
  return voices.find(v => v.lang.startsWith("en")) || voices[0];
}

// ─────────────────────────────────────────────────────────────────────────────
// VOICE PLAYER COMPONENT — Floating premium UI
// ─────────────────────────────────────────────────────────────────────────────
function VoicePlayer({ activeSection }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused]   = useState(false);
  const [voiceName, setVoiceName] = useState("Loading...");
  const [progress, setProgress]   = useState(0);
  const utteranceRef              = useRef(null);
  const progressRef               = useRef(null);
  const startTimeRef              = useRef(0);
  const totalDurationRef          = useRef(0);
  const script                    = VOICE_SCRIPTS[activeSection] || VOICE_SCRIPTS.hero;

  // Estimate duration: ~140 words per minute at rate 0.88
  const wordCount = script.split(/\s+/).length;
  totalDurationRef.current = (wordCount / 140) * 60; // seconds

  useEffect(() => {
    const loadVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        const best = getBestMaleVoice(voices);
        setVoiceName(best ? best.name.split(" - ")[0].replace(" Online (Natural)", " ★") : "Browser Voice");
      }
    };
    loadVoice();
    window.speechSynthesis.onvoiceschanged = loadVoice;
    return () => { window.speechSynthesis.cancel(); clearInterval(progressRef.current); };
  }, []);

  // Stop when section changes
  useEffect(() => {
    if (isPlaying || isPaused) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(false);
      setProgress(0);
      clearInterval(progressRef.current);
    }
  }, [activeSection]);

  const startProgress = () => {
    clearInterval(progressRef.current);
    startTimeRef.current = Date.now();
    progressRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const pct = Math.min((elapsed / totalDurationRef.current) * 100, 99);
      setProgress(pct);
    }, 200);
  };

  const speak = () => {
    window.speechSynthesis.cancel();
    clearInterval(progressRef.current);
    setProgress(0);

    const voices = window.speechSynthesis.getVoices();
    const voice  = getBestMaleVoice(voices);

    const utter       = new SpeechSynthesisUtterance(script);
    utter.voice       = voice;
    utter.rate        = 0.88;
    utter.pitch       = 0.92;
    utter.volume      = 1.0;

    utter.onstart  = () => { setIsPlaying(true); setIsPaused(false); startProgress(); };
    utter.onend    = () => { setIsPlaying(false); setIsPaused(false); setProgress(100); clearInterval(progressRef.current); };
    utter.onerror  = () => { setIsPlaying(false); setIsPaused(false); clearInterval(progressRef.current); };
    utter.onpause  = () => { setIsPaused(true); clearInterval(progressRef.current); };
    utter.onresume = () => { setIsPaused(false); startProgress(); };

    utteranceRef.current = utter;
    window.speechSynthesis.speak(utter);
  };

  const pause = () => {
    window.speechSynthesis.pause();
    setIsPaused(true);
    clearInterval(progressRef.current);
  };

  const resume = () => {
    window.speechSynthesis.resume();
    setIsPaused(false);
    startProgress();
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setProgress(0);
    clearInterval(progressRef.current);
  };

  const replay = () => speak();

  const sectionLabel = (activeSection || "hero").toUpperCase().replace(/-/g, " ");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      style={{
        marginTop: "auto",               // push to bottom of sidebar
        background: "rgba(6,13,28,0.95)",
        borderTop: `1px solid ${T.neon}20`,
        borderRadius: 12,
        padding: "14px 12px",
        backdropFilter: "blur(12px)",
        width: "100%",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <div style={{
          width: 28, height: 28, borderRadius: "50%",
          background: `linear-gradient(135deg, ${T.neon}, ${T.accent})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 12 }}>🎙</span>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: T.display, fontSize: 11, fontWeight: 800, color: T.text }}>
            AI Voice Narrator
          </div>
          <div style={{ fontFamily: T.mono, fontSize: 7, color: T.neon, letterSpacing: 1 }}>
            {voiceName}
          </div>
        </div>
        <div style={{
          padding: "2px 6px", borderRadius: 4,
          background: isPlaying ? `${T.neon}15` : `${T.muted}20`,
          border: `1px solid ${isPlaying ? T.neon : T.muted}40`,
          fontFamily: T.mono, fontSize: 6, letterSpacing: 2,
          color: isPlaying ? T.neon : T.muted,
        }}>
          {isPlaying && !isPaused ? "● LIVE" : isPaused ? "⏸ PAUSED" : "○ IDLE"}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ height: 2, background: T.dim, borderRadius: 2, overflow: "hidden" }}>
          <motion.div
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.2 }}
            style={{
              height: "100%",
              background: `linear-gradient(90deg, ${T.neon}, ${T.accent})`,
              borderRadius: 2,
            }}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: T.mono, fontSize: 7, color: T.muted, marginTop: 4 }}>
          <span>{Math.round(progress)}%</span>
          <span>~{Math.ceil(wordCount / 140)}m read</span>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={isPlaying ? (isPaused ? resume : pause) : speak}
          style={{
            flex: 1, height: 32, borderRadius: 6,
            background: isPlaying && !isPaused
              ? `rgba(255,183,71,0.15)`
              : `linear-gradient(135deg, ${T.neon}, ${T.accent})`,
            border: isPlaying && !isPaused ? `1px solid ${T.neon4}60` : "none",
            cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
            fontFamily: T.display, fontWeight: 700, fontSize: 9, letterSpacing: 1,
            color: isPlaying && !isPaused ? T.neon4 : "#000",
          }}
        >
          {isPlaying && !isPaused ? "⏸" : isPaused ? "▶" : "▶"}
          <span>{isPlaying && !isPaused ? "PAUSE" : isPaused ? "RESUME" : "EXPLAIN"}</span>
        </motion.button>

        {(isPlaying || isPaused || progress > 0) && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={stop}
            style={{
              width: 32, height: 32, borderRadius: 6,
              background: `${T.neon3}12`, border: `1px solid ${T.neon3}40`,
              cursor: "pointer", fontSize: 12, color: T.neon3,
            }}
          >
            ■
          </motion.button>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={replay}
          style={{
            width: 32, height: 32, borderRadius: 6,
            background: `${T.neon2}10`, border: `1px solid ${T.neon2}30`,
            cursor: "pointer", fontSize: 12, color: T.neon2,
          }}
        >
          ↺
        </motion.button>
      </div>

      {/* Script preview (short) */}
      <div style={{
        padding: "6px 8px",
        borderRadius: 6,
        background: `${T.dim}30`,
        maxHeight: 42,
        overflow: "hidden",
        position: "relative",
      }}>
        <div style={{ fontFamily: T.mono, fontSize: 6, color: T.muted, letterSpacing: 2, marginBottom: 2 }}>
          SCRIPT PREVIEW
        </div>
        <div style={{ fontFamily: T.mono, fontSize: 8, color: T.text, opacity: 0.7, lineHeight: 1.4 }}>
          {script.slice(0, 80).trim()}...
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NAV ITEMS
// ─────────────────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: "hero",        label: "INTRO",        num: "00", icon: "◎" },
  { id: "why-fn",      label: "WHY FUNCTIONS",num: "01", icon: "🔷" },
  { id: "fn-anatomy",  label: "FN ANATOMY",   num: "02", icon: "🔬" },
  { id: "fn-types",    label: "FN TYPES",     num: "03", icon: "⚙" },
  { id: "scope",       label: "SCOPE",        num: "04", icon: "🔭" },
  { id: "recursion",   label: "RECURSION",    num: "05", icon: "🌀" },
  { id: "arrays-1d",   label: "1D ARRAYS",    num: "06", icon: "▦" },
  { id: "arrays-2d",   label: "2D ARRAYS",    num: "07", icon: "⊞" },
  { id: "traversal",   label: "TRAVERSAL",    num: "08", icon: "→" },
  { id: "array-probs", label: "ARRAY PROBS",  num: "09", icon: "🧮" },
  { id: "strings",     label: "STRINGS",      num: "10", icon: "🔤" },
  { id: "str-fns",     label: "STRING FNS",   num: "11", icon: "🛠" },
  { id: "engine",      label: "ENGINE",       num: "12", icon: "🚀" },
];

// ─────────────────────────────────────────────────────────────────────────────
// 3D BACKGROUND — PARTICLE FIELD
// ─────────────────────────────────────────────────────────────────────────────
function ParticleField() {
  const mesh = useRef();
  const positions = useMemo(() => {
    const arr = new Float32Array(2000 * 3);
    for (let i = 0; i < 2000; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 60;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 35;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 35;
    }
    return arr;
  }, []);
  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.y = state.clock.elapsedTime * 0.022;
      mesh.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.011) * 0.05;
    }
  });
  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.042} color={T.neon} transparent opacity={0.35} sizeAttenuation />
    </points>
  );
}

function StackFrames3D({ frames }) {
  const groupRef = useRef();
  useFrame((s) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(s.clock.elapsedTime * 0.3) * 0.4;
    }
  });
  const colors = [T.neon, T.neon2, T.accent, T.neon4, T.neon3];
  if (!frames || frames.length === 0) return null;
  return (
    <group ref={groupRef}>
      {frames.map((f, i) => (
        <Float key={i} speed={0.8 + i * 0.2} floatIntensity={0.15}>
          <mesh position={[0, i * 0.9 - frames.length * 0.45, 0]}>
            <boxGeometry args={[2.4 - i * 0.08, 0.7, 0.35]} />
            <meshStandardMaterial
              color={colors[i % colors.length]}
              emissive={colors[i % colors.length]}
              emissiveIntensity={0.5}
              transparent
              opacity={0.78}
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

function ArrayOrbs3D({ count, highlighted }) {
  const groupRef = useRef();
  useFrame((s) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = s.clock.elapsedTime * 0.18;
    }
  });
  return (
    <group ref={groupRef}>
      {Array.from({ length: count }, (_, i) => (
        <Float key={i} speed={1 + i * 0.1} floatIntensity={0.2}>
          <mesh position={[(i - count / 2) * 1.1, 0, 0]}>
            <sphereGeometry args={[0.28, 16, 16]} />
            <meshStandardMaterial
              color={i === highlighted ? T.neon4 : T.neon}
              emissive={i === highlighted ? T.neon4 : T.neon}
              emissiveIntensity={i === highlighted ? 0.9 : 0.45}
              transparent
              opacity={0.85}
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SHARED COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
function GlassCard({ children, style = {}, hover = true, glowColor = T.neon, onClick }) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={hover ? {
        scale: 1.003,
        borderColor: `${glowColor}40`,
        boxShadow: `0 8px 50px rgba(0,0,0,0.6), 0 0 25px ${glowColor}12`,
      } : {}}
      transition={{ type: "spring", stiffness: 280, damping: 28 }}
      style={{
        background: T.glass,
        border: `1px solid ${T.border}`,
        borderRadius: 14,
        backdropFilter: "blur(22px)",
        WebkitBackdropFilter: "blur(22px)",
        boxShadow: "0 4px 40px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.04)",
        ...style,
      }}
    >
      {children}
    </motion.div>
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
      initial={{ opacity: 0, x: -24 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      style={{ display: "flex", alignItems: "flex-end", gap: 18, marginBottom: 36 }}
    >
      <span style={{ fontFamily: T.mono, fontSize: 52, fontWeight: 700, color: T.dim, lineHeight: 1, letterSpacing: -2 }}>
        {num}
      </span>
      <div>
        <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 5, color: T.neon, fontWeight: 500, marginBottom: 4 }}>
          {tag}
        </div>
        <h2 style={{ fontFamily: T.display, fontSize: 28, fontWeight: 800, color: T.text, letterSpacing: -0.5, lineHeight: 1 }}>
          {title}
        </h2>
        {subtitle && (
          <p style={{ fontFamily: T.mono, fontSize: 11, color: T.muted, marginTop: 5 }}>{subtitle}</p>
        )}
      </div>
    </motion.div>
  );
}

function CodeBlock({ code, highlightLine = -1, style = {} }) {
  const lines = (code || "").split("\n");
  return (
    <div style={{
      background: "rgba(0,0,0,0.5)", borderRadius: 10,
      border: `1px solid ${T.dim}`, overflow: "hidden", ...style,
    }}>
      <div style={{ padding: "8px 14px", borderBottom: `1px solid ${T.dim}`, display: "flex", gap: 6 }}>
        {["#FF5F57", "#FEBC2E", "#28C840"].map((c, i) => (
          <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: c }} />
        ))}
      </div>
      <div style={{ padding: "14px 0", overflowX: "auto" }}>
        {lines.map((line, i) => (
          <motion.div
            key={i}
            animate={{ background: highlightLine === i ? `${T.neon}18` : "transparent" }}
            style={{
              fontFamily: T.mono, fontSize: 12, lineHeight: 1.9,
              paddingLeft: highlightLine === i ? 20 : 16, paddingRight: 16,
              borderLeft: `2px solid ${highlightLine === i ? T.neon : "transparent"}`,
              color: highlightLine === i ? T.neon : T.text,
              transition: "all 0.2s",
              whiteSpace: "pre",
            }}
          >
            <span style={{ color: T.dim, marginRight: 14, fontSize: 9, userSelect: "none" }}>{String(i + 1).padStart(2, " ")}</span>
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
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      style={{
        fontFamily: T.mono, fontSize: 10, fontWeight: 700, letterSpacing: 2,
        color: active ? "#000" : color,
        background: active ? color : `${color}14`,
        border: `1px solid ${active ? color : `${color}35`}`,
        borderRadius: 6, padding: "6px 14px", cursor: "pointer",
        transition: "all 0.2s",
      }}
    >
      {children}
    </motion.button>
  );
}

function InsightBlock({ title, color, icon, children }) {
  return (
    <div style={{
      padding: "14px", borderRadius: 10,
      background: `${color}08`, border: `1px solid ${color}25`,
    }}>
      <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 3, color, marginBottom: 8 }}>
        {icon} {title}
      </div>
      <div style={{ fontFamily: T.mono, fontSize: 11, color: T.text, lineHeight: 1.85 }}>
        {children}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 01 — WHY FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────
function WhyFunctionsSection() {
  const [exploded, setExploded] = useState(false);
  const [activeModule, setActiveModule] = useState(null);

  const modules = [
    { id: "input",   label: "getInput()",   color: T.neon2,  desc: "Handles all user input. Isolated. Testable. Reusable.", x: -180, y: -75 },
    { id: "compute", label: "calculate()",  color: T.neon,   desc: "Pure logic — no I/O. Accepts data, returns result.", x: 0,    y: -105 },
    { id: "output",  label: "display()",    color: T.accent, desc: "Formats and prints. Zero knowledge of how data was made.", x: 180, y: -75 },
    { id: "valid",   label: "validate()",   color: T.neon4,  desc: "Validates constraints. Can be called from anywhere.", x: -140, y: 75 },
    { id: "save",    label: "saveData()",   color: T.neon3,  desc: "Handles persistence. Swap implementation without touching logic.", x: 140,  y: 75 },
  ];

  return (
    <Section id="why-fn">
      <SectionHeader num="01" tag="FUNCTIONS · WHY" title="The Decomposition Engine" subtitle="A large problem splitting into focused, reusable modules" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
        <GlassCard style={{ padding: 28, minHeight: 420 }}>
          <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 4, color: T.neon, marginBottom: 20 }}>
            🔷 PROGRAM DECOMPOSITION VISUAL
          </div>
          <div style={{ position: "relative", minHeight: 300, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            {!exploded ? (
              <motion.div key="monolith" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                style={{ width: 180, padding: "24px 0", background: `${T.neon3}15`, border: `2px solid ${T.neon3}60`, borderRadius: 14, textAlign: "center", boxShadow: `0 0 40px ${T.neon3}30` }}>
                <div style={{ fontFamily: T.mono, fontSize: 13, fontWeight: 700, color: T.neon3, marginBottom: 8 }}>main()</div>
                <div style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, lineHeight: 2, whiteSpace: "pre" }}>{"// 800 lines\n// impossible to read\n// can't reuse parts\n// one bug = all broken"}</div>
              </motion.div>
            ) : (
              <motion.div key="modules" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ position: "relative", width: "100%", height: 280 }}>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                  style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 72, height: 72, borderRadius: "50%", background: `${T.neon}15`, border: `2px solid ${T.neon}80`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: T.mono, fontSize: 10, fontWeight: 700, color: T.neon, boxShadow: `0 0 30px ${T.neon}40`, zIndex: 2 }}>
                  main()
                </motion.div>
                {modules.map((m, i) => (
                  <motion.div key={m.id} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.25 + i * 0.12, type: "spring", stiffness: 220 }}
                    whileHover={{ scale: 1.12 }} onClick={() => setActiveModule(activeModule === m.id ? null : m.id)}
                    style={{ position: "absolute", top: `calc(50% + ${m.y}px)`, left: `calc(50% + ${m.x}px)`, transform: "translate(-50%, -50%)", padding: "8px 12px", borderRadius: 9, zIndex: 3, background: `${m.color}18`, border: `2px solid ${m.color}70`, fontFamily: T.mono, fontSize: 10, fontWeight: 700, color: m.color, cursor: "pointer", whiteSpace: "nowrap", boxShadow: activeModule === m.id ? `0 0 25px ${m.color}60` : "none", transition: "box-shadow 0.25s" }}>
                    {m.label}
                  </motion.div>
                ))}
              </motion.div>
            )}
            <AnimatePresence>
              {activeModule && (
                <motion.div key={activeModule} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{ marginTop: 12, padding: "10px 14px", borderRadius: 8, width: "100%", background: `${modules.find(m => m.id === activeModule)?.color}15`, border: `1px solid ${modules.find(m => m.id === activeModule)?.color}40`, fontFamily: T.mono, fontSize: 11, color: T.text, textAlign: "center" }}>
                  {modules.find(m => m.id === activeModule)?.desc}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <motion.button whileTap={{ scale: 0.96 }} onClick={() => { setExploded(false); setActiveModule(null); }}
              style={{ flex: 1, fontFamily: T.mono, fontSize: 10, fontWeight: 700, letterSpacing: 2, color: T.neon3, background: `${T.neon3}10`, border: `1px solid ${T.neon3}40`, borderRadius: 8, padding: "11px", cursor: "pointer" }}>
              MONOLITH
            </motion.button>
            <motion.button whileTap={{ scale: 0.96 }} onClick={() => { setExploded(true); setActiveModule(null); }}
              style={{ flex: 2, fontFamily: T.display, fontWeight: 700, fontSize: 11, letterSpacing: 3, color: "#000", background: `linear-gradient(135deg, ${T.neon}, ${T.neon2})`, border: "none", borderRadius: 8, padding: "11px", cursor: "pointer" }}>
              ▶ DECOMPOSE INTO FUNCTIONS
            </motion.button>
          </div>
        </GlassCard>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <CodeBlock code={`// WITHOUT functions — 800-line main()\nint main() {\n  // validate input\n  if (x < 0 || x > 100) { ... }\n  // calculate\n  int result = x * 2 + 5;\n  // display\n  printf(...); // deeply tangled\n}\n\n// WITH functions — each does ONE thing\nint validate(int x) { return x >= 0 && x <= 100; }\nint calculate(int x) { return x * 2 + 5; }\nvoid display(int r)  { printf("Result: %d", r); }\n\nint main() {\n  if (validate(x)) display(calculate(x));\n}`} highlightLine={16} />
          <InsightBlock title="WHY FUNCTIONS" color={T.neon} icon="💡">
            Functions enforce a contract: given these inputs, produce this output. Nothing else.{"\n\n"}
            <span style={{ color: T.neon }}>DRY principle</span>{" — Don't Repeat Yourself. Write once, call many times.\n\n"}
            <span style={{ color: T.neon2 }}>Stack-based</span>{" — each call gets its own frame in memory. Variables don't bleed between calls."}
          </InsightBlock>
          <InsightBlock title="COMMON MISTAKE" color={T.neon3} icon="⚠">
            {"Functions that do too many things (God functions).\nIf you can't describe what a function does in one sentence → split it."}
          </InsightBlock>
        </div>
      </div>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 02 — FUNCTION ANATOMY
// ─────────────────────────────────────────────────────────────────────────────
function FnAnatomySection() {
  const [a, setA] = useState(6);
  const [b, setB] = useState(4);
  const [phase, setPhase] = useState("idle");
  const [returnVal, setReturnVal] = useState(null);
  const [step, setStep] = useState(-1);
  const simulatingRef = useRef(false);

  const simulate = async () => {
    if (simulatingRef.current) return;
    simulatingRef.current = true;
    setReturnVal(null);
    setStep(0); setPhase("calling");
    await new Promise(r => setTimeout(r, 700));
    setStep(1); setPhase("inside");
    await new Promise(r => setTimeout(r, 700));
    setStep(2);
    await new Promise(r => setTimeout(r, 600));
    setStep(3); setPhase("returning");
    setReturnVal(a + b);
    await new Promise(r => setTimeout(r, 700));
    setStep(4); setPhase("idle");
    simulatingRef.current = false;
  };

  const codeLines = [
    `int add(int x, int y);        // DECLARATION`,
    ``,
    `int main() {`,
    `  int result = add(${a}, ${b});`,
    `  printf("%d", result);`,
    `}`,
    ``,
    `int add(int x, int y) {       // DEFINITION`,
    `  int sum = x + y;`,
    `  return sum;`,
    `}`,
  ];
  const highlightMap = { 0: 3, 1: 7, 2: 8, 3: 9, 4: 4 };

  return (
    <Section id="fn-anatomy">
      <SectionHeader num="02" tag="FUNCTIONS · ANATOMY" title="Call Stack Engine" subtitle="Watch arguments flow in, computation happen, return value flow out" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
        <GlassCard style={{ padding: 28 }}>
          <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 4, color: T.neon2, marginBottom: 22 }}>🔬 FUNCTION CALL SIMULATION</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}>
            {[["a (argument)", a, setA, T.neon], ["b (argument)", b, setB, T.neon2]].map(([lbl, v, set, c]) => (
              <div key={lbl}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontFamily: T.mono, fontSize: 9, color: T.muted }}>{lbl}</span>
                  <motion.span key={v} animate={{ scale: [1.4, 1] }} style={{ fontFamily: T.mono, fontSize: 16, fontWeight: 700, color: c }}>{v}</motion.span>
                </div>
                <input type="range" min={0} max={20} value={v} onChange={e => { set(Number(e.target.value)); setPhase("idle"); setStep(-1); setReturnVal(null); simulatingRef.current = false; }} style={{ width: "100%", accentColor: c }} />
              </div>
            ))}
          </div>
          <div style={{ position: "relative", marginBottom: 24 }}>
            <motion.div animate={{ borderColor: phase === "calling" ? T.neon : phase === "returning" ? T.neon4 : T.dim, boxShadow: phase === "calling" || phase === "returning" ? `0 0 20px ${T.neon}40` : "none" }}
              style={{ padding: "14px 16px", borderRadius: 10, border: "1px solid", marginBottom: 8 }}>
              <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, marginBottom: 6, letterSpacing: 3 }}>CALLER: main()</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ fontFamily: T.mono, fontSize: 11, color: T.text }}>result = add(<span style={{ color: T.neon }}>{a}</span>, <span style={{ color: T.neon2 }}>{b}</span>)</div>
                <AnimatePresence>
                  {returnVal !== null && (
                    <motion.span initial={{ scale: 0, x: 20 }} animate={{ scale: 1, x: 0 }} style={{ fontFamily: T.mono, fontSize: 14, fontWeight: 800, color: T.neon4, marginLeft: "auto" }}>= {returnVal}</motion.span>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 32, position: "relative" }}>
              <div style={{ width: 1, height: "100%", background: T.dim }} />
              <AnimatePresence>
                {phase === "calling" && (
                  <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 10, opacity: 1 }} transition={{ duration: 0.5 }}
                    style={{ position: "absolute", display: "flex", gap: 6, fontFamily: T.mono, fontSize: 9, color: T.neon }}>
                    <span style={{ background: `${T.neon}15`, border: `1px solid ${T.neon}40`, padding: "2px 8px", borderRadius: 4 }}>x={a}</span>
                    <span style={{ background: `${T.neon2}15`, border: `1px solid ${T.neon2}40`, padding: "2px 8px", borderRadius: 4 }}>y={b}</span>
                  </motion.div>
                )}
                {phase === "returning" && (
                  <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: -8, opacity: 1 }} transition={{ duration: 0.5 }}
                    style={{ position: "absolute", fontFamily: T.mono, fontSize: 9, color: T.neon4 }}>
                    <span style={{ background: `${T.neon4}15`, border: `1px solid ${T.neon4}40`, padding: "2px 8px", borderRadius: 4 }}>return {a + b}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <motion.div animate={{ borderColor: phase === "inside" || phase === "returning" ? T.accent : T.dim, boxShadow: phase === "inside" ? `0 0 25px ${T.accent}40` : "none" }}
              style={{ padding: "14px 16px", borderRadius: 10, border: "1px solid" }}>
              <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, marginBottom: 6, letterSpacing: 3 }}>CALLEE: add()</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                {[{ label: "x", val: step < 0 ? "?" : a, color: T.neon }, { label: "y", val: step < 0 ? "?" : b, color: T.neon2 }, { label: "sum", val: step >= 2 ? a + b : "?", color: T.neon4 }].map(v => (
                  <div key={v.label} style={{ textAlign: "center", padding: "8px", borderRadius: 7, background: `${v.color}10`, border: `1px solid ${v.color}30` }}>
                    <div style={{ fontFamily: T.mono, fontSize: 8, color: T.muted, marginBottom: 3 }}>{v.label}</div>
                    <motion.div key={String(v.val)} animate={{ scale: [1.3, 1] }} style={{ fontFamily: T.mono, fontSize: 16, fontWeight: 800, color: v.color }}>{v.val}</motion.div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
          <div style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, marginBottom: 14, minHeight: 20 }}>
            {step >= 0 ? (["Preparing call...", "Entering add() — args copied to params", `Computing sum = ${a} + ${b}`, `return ${a + b} → back to main()`, "Call complete ✓"][step]) : "Press SIMULATE to run"}
          </div>
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} onClick={simulate} disabled={phase !== "idle"}
            style={{ width: "100%", fontFamily: T.display, fontWeight: 700, fontSize: 11, letterSpacing: 4, color: "#000", background: phase !== "idle" ? T.muted : `linear-gradient(135deg, ${T.neon}, ${T.accent})`, border: "none", borderRadius: 8, padding: "13px", cursor: phase !== "idle" ? "not-allowed" : "pointer" }}>
            {phase === "idle" ? "▶ SIMULATE FUNCTION CALL" : "EXECUTING..."}
          </motion.button>
        </GlassCard>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <CodeBlock code={codeLines.join("\n")} highlightLine={step >= 0 ? (highlightMap[step] ?? -1) : -1} />
          <InsightBlock title="DECLARATION vs DEFINITION" color={T.neon} icon="🔬">
            <span style={{ color: T.neon }}>Declaration</span>{" (prototype): tells the compiler the function's signature BEFORE it's defined.\n"}
            <span style={{ color: T.accent }}>Definition</span>{": the actual body. Can be in a different file.\n\nArguments are "}
            <span style={{ color: T.neon2 }}>COPIED</span>{" into parameters — this is pass-by-value. The original is unchanged."}
          </InsightBlock>
          <InsightBlock title="COMMON MISTAKES" color={T.neon3} icon="⚠">
            {"• Forgetting the return statement (undefined behavior)\n• Returning a local variable's ADDRESS (dangling pointer)\n• Calling a function before its declaration — compiler error in C"}
          </InsightBlock>
        </div>
      </div>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 03 — FUNCTION TYPES
// ─────────────────────────────────────────────────────────────────────────────
const FN_TYPES = [
  { id: "nn", label: "No Args / No Return", sig: "void greet(void)", code: `void greet(void) {\n  printf("Hello, World!\\n");\n}\n\n// Call:\ngreet();`, color: T.neon, desc: "Pure side effect. Does something, takes nothing, gives back nothing.", example: { input: null, output: "Hello, World!" }, use: "Printing menus, initialization routines" },
  { id: "an", label: "Args / No Return", sig: "void printSquare(int n)", code: `void printSquare(int n) {\n  printf("%d\\n", n * n);\n}\n\n// Call:\nprintSquare(7); // prints 49`, color: T.neon2, desc: "Takes data, produces side effect. Doesn't hand anything back.", example: { input: "7", output: "49" }, use: "Logging, displaying formatted data" },
  { id: "ar", label: "Args / Return", sig: "int add(int a, int b)", code: `int add(int a, int b) {\n  return a + b;\n}\n\n// Call:\nint r = add(3, 5); // r = 8`, color: T.neon4, desc: "The pure function ideal. Input → deterministic output. No side effects.", example: { input: "3, 5", output: "8" }, use: "Math, validation, computation — MOST functions should be this type" },
  { id: "nr", label: "No Args / Return", sig: "int getCount(void)", code: `int count = 0;\n\nint getCount(void) {\n  return count;  // reads global\n}\n\n// Call:\nint n = getCount(); // n = 0`, color: T.accent, desc: "Returns derived or global state. No input needed.", example: { input: null, output: "count value" }, use: "Getters, reading global state, random numbers" },
];

function FnTypesSection() {
  const [selected, setSelected] = useState("ar");
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState(null);
  const fn = FN_TYPES.find(f => f.id === selected);

  const run = async () => {
    if (running) return;
    setRunning(true); setOutput(null);
    await new Promise(r => setTimeout(r, 600));
    setOutput(fn.example.output);
    setRunning(false);
  };

  return (
    <Section id="fn-types">
      <SectionHeader num="03" tag="FUNCTIONS · TYPES" title="The Function Taxonomy" subtitle="4 types based on what goes in and what comes out" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 22 }}>
        {FN_TYPES.map(ft => (
          <motion.div key={ft.id} whileHover={{ scale: 1.02, borderColor: `${ft.color}60` }} whileTap={{ scale: 0.98 }}
            onClick={() => { setSelected(ft.id); setOutput(null); }}
            style={{ padding: "16px 18px", borderRadius: 12, cursor: "pointer", background: selected === ft.id ? `${ft.color}12` : "rgba(255,255,255,0.02)", border: `2px solid ${selected === ft.id ? ft.color : T.dim}`, boxShadow: selected === ft.id ? `0 0 25px ${ft.color}30` : "none", transition: "all 0.2s" }}>
            <div style={{ fontFamily: T.mono, fontSize: 9, color: ft.color, letterSpacing: 3, marginBottom: 6 }}>{ft.id === "nn" ? "NO INPUT · NO OUTPUT" : ft.id === "an" ? "INPUT · NO OUTPUT" : ft.id === "ar" ? "INPUT · OUTPUT" : "NO INPUT · OUTPUT"}</div>
            <div style={{ fontFamily: T.display, fontSize: 14, fontWeight: 700, color: selected === ft.id ? ft.color : T.text, marginBottom: 4 }}>{ft.label}</div>
            <code style={{ fontFamily: T.mono, fontSize: 10, color: T.muted }}>{ft.sig}</code>
          </motion.div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
        <GlassCard style={{ padding: 28 }}>
          <AnimatePresence mode="wait">
            <motion.div key={selected} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 4, color: fn.color, marginBottom: 16 }}>⚙ LIVE SIMULATION</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginBottom: 24 }}>
                <div style={{ padding: "12px 16px", borderRadius: 9, minWidth: 80, textAlign: "center", background: fn.example.input ? `${T.neon}10` : `${T.dim}50`, border: `1px solid ${fn.example.input ? `${T.neon}40` : T.muted}` }}>
                  <div style={{ fontFamily: T.mono, fontSize: 8, color: T.muted, marginBottom: 4 }}>INPUT</div>
                  <div style={{ fontFamily: T.mono, fontSize: 14, fontWeight: 700, color: fn.example.input ? T.neon : T.muted }}>{fn.example.input || "none"}</div>
                </div>
                <motion.div animate={{ background: running ? `${fn.color}20` : `${fn.color}10` }} style={{ padding: "14px 20px", borderRadius: 12, border: `2px solid ${fn.color}60`, textAlign: "center", boxShadow: running ? `0 0 30px ${fn.color}50` : "none", transition: "all 0.3s" }}>
                  <div style={{ fontFamily: T.mono, fontSize: 10, color: fn.color, fontWeight: 700 }}>{fn.sig.split("(")[0].split(" ").pop()}()</div>
                </motion.div>
                <div style={{ padding: "12px 16px", borderRadius: 9, minWidth: 80, textAlign: "center", background: output ? `${T.neon4}10` : `${T.dim}50`, border: `1px solid ${output ? `${T.neon4}40` : T.muted}` }}>
                  <div style={{ fontFamily: T.mono, fontSize: 8, color: T.muted, marginBottom: 4 }}>OUTPUT</div>
                  <AnimatePresence mode="wait">
                    {output ? <motion.div key="val" initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ fontFamily: T.mono, fontSize: 14, fontWeight: 700, color: T.neon4 }}>{output}</motion.div> : <div key="none" style={{ fontFamily: T.mono, fontSize: 14, color: T.muted }}>?</div>}
                  </AnimatePresence>
                </div>
              </div>
              <div style={{ fontFamily: T.mono, fontSize: 11, color: T.text, lineHeight: 1.8, marginBottom: 18 }}>{fn.desc}</div>
              <div style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, marginBottom: 18 }}><span style={{ color: fn.color }}>USE WHEN:</span> {fn.use}</div>
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} onClick={run}
                style={{ width: "100%", fontFamily: T.display, fontWeight: 700, fontSize: 11, letterSpacing: 3, color: "#000", background: `linear-gradient(135deg, ${fn.color}, ${T.neon2})`, border: "none", borderRadius: 8, padding: "12px", cursor: "pointer" }}>
                {running ? "CALLING..." : `▶ CALL ${fn.sig.split("(")[0].split(" ").pop()}()`}
              </motion.button>
            </motion.div>
          </AnimatePresence>
        </GlassCard>
        <CodeBlock code={fn.code} highlightLine={1} />
      </div>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 04 — SCOPE
// ─────────────────────────────────────────────────────────────────────────────
function ScopeSection() {
  const [phase, setPhase] = useState(0);
  const phases = [
    { desc: "Global scope: g=10. Local variables don't exist yet.", fn1Active: false, fn2Active: false },
    { desc: "Inside fn1(): local x=5 is born. Global g is visible. x is NOT visible outside fn1.", fn1Active: true, fn2Active: false },
    { desc: "Inside fn2(): local y=3 is born. fn2 can see g (global), but NOT x (local to fn1).", fn1Active: false, fn2Active: true },
    { desc: "Both functions returned. x and y are DESTROYED. g persists for the program's lifetime.", fn1Active: false, fn2Active: false },
  ];
  const current = phases[phase];

  return (
    <Section id="scope">
      <SectionHeader num="04" tag="FUNCTIONS · SCOPE" title="Variable Lifetime Engine" subtitle="Where a variable lives — and when it dies" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
        <GlassCard style={{ padding: 28 }}>
          <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 4, color: T.accent, marginBottom: 20 }}>🔭 SCOPE VISUALIZATION</div>
          <div style={{ border: `2px solid ${T.neon2}40`, borderRadius: 12, padding: "18px", background: `${T.neon2}05`, marginBottom: 12, position: "relative" }}>
            <div style={{ position: "absolute", top: -10, left: 14, fontFamily: T.mono, fontSize: 8, fontWeight: 700, letterSpacing: 3, color: T.neon2, background: T.bg2, padding: "0 8px" }}>GLOBAL SCOPE</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <motion.div animate={{ boxShadow: `0 0 20px ${T.neon2}60` }} style={{ padding: "8px 16px", borderRadius: 8, background: `${T.neon2}15`, border: `2px solid ${T.neon2}80`, fontFamily: T.mono, fontSize: 12, fontWeight: 700, color: T.neon2 }}>
                <span style={{ color: T.muted, fontSize: 9 }}>int </span>g = 10
              </motion.div>
              <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, lineHeight: 1.7 }}>visible everywhere<br />lives for entire program</div>
            </div>
            <motion.div animate={{ borderColor: current.fn1Active ? `${T.neon}80` : `${T.neon}20`, background: current.fn1Active ? `${T.neon}08` : "transparent", boxShadow: current.fn1Active ? `0 0 20px ${T.neon}30` : "none" }}
              style={{ border: "1px dashed", borderRadius: 9, padding: "12px 14px", marginBottom: 8, borderColor: `${T.neon}20` }}>
              <div style={{ fontFamily: T.mono, fontSize: 8, color: T.neon, letterSpacing: 3, marginBottom: 6 }}>fn1() LOCAL SCOPE</div>
              <AnimatePresence>
                {current.fn1Active ? (
                  <motion.div key="x-live" initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}
                    style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 12px", borderRadius: 6, background: `${T.neon}18`, border: `1px solid ${T.neon}60`, fontFamily: T.mono, fontSize: 12, fontWeight: 700, color: T.neon }}>
                    int x = 5 <span style={{ fontSize: 9, opacity: 0.7 }}>← ALIVE</span>
                  </motion.div>
                ) : (
                  <motion.div key="x-dead" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ fontFamily: T.mono, fontSize: 10, color: T.muted }}>
                    {phase > 1 ? "int x — DESTROYED (out of scope)" : "int x — not allocated yet"}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
            <motion.div animate={{ borderColor: current.fn2Active ? `${T.accent}80` : `${T.accent}20`, background: current.fn2Active ? `${T.accent}08` : "transparent", boxShadow: current.fn2Active ? `0 0 20px ${T.accent}30` : "none" }}
              style={{ border: "1px dashed", borderRadius: 9, padding: "12px 14px", borderColor: `${T.accent}20` }}>
              <div style={{ fontFamily: T.mono, fontSize: 8, color: T.accent, letterSpacing: 3, marginBottom: 6 }}>fn2() LOCAL SCOPE</div>
              <AnimatePresence>
                {current.fn2Active ? (
                  <motion.div key="y-live" initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}
                    style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 12px", borderRadius: 6, background: `${T.accent}18`, border: `1px solid ${T.accent}60`, fontFamily: T.mono, fontSize: 12, fontWeight: 700, color: T.accent }}>
                    int y = 3 <span style={{ fontSize: 9, opacity: 0.7 }}>← ALIVE</span>
                  </motion.div>
                ) : (
                  <motion.div key="y-dead" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ fontFamily: T.mono, fontSize: 10, color: T.muted }}>
                    {phase > 2 ? "int y — DESTROYED" : "int y — not allocated yet"}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={phase} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ padding: "12px 14px", borderRadius: 8, marginBottom: 14, background: "rgba(255,255,255,0.03)", border: `1px solid ${T.dim}`, fontFamily: T.mono, fontSize: 11, color: T.text, lineHeight: 1.75 }}>
              {current.desc}
            </motion.div>
          </AnimatePresence>
          <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
            {phases.map((_, i) => (
              <motion.div key={i} animate={{ background: i <= phase ? T.neon : T.dim }} style={{ flex: 1, height: 3, borderRadius: 2, cursor: "pointer" }} onClick={() => setPhase(i)} />
            ))}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <motion.button whileTap={{ scale: 0.96 }} onClick={() => setPhase(p => Math.max(0, p - 1))}
              style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, background: "transparent", border: `1px solid ${T.dim}`, borderRadius: 8, padding: "10px 14px", cursor: "pointer" }}>← PREV</motion.button>
            <motion.button whileTap={{ scale: 0.96 }} onClick={() => setPhase(p => p < phases.length - 1 ? p + 1 : 0)}
              style={{ flex: 1, fontFamily: T.display, fontWeight: 700, fontSize: 11, letterSpacing: 3, color: "#000", background: `linear-gradient(135deg, ${T.neon}, ${T.accent})`, border: "none", borderRadius: 8, padding: "10px", cursor: "pointer" }}>
              {phase < phases.length - 1 ? "NEXT STEP →" : "↺ RESTART"}
            </motion.button>
          </div>
        </GlassCard>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <CodeBlock code={`int g = 10;           // GLOBAL — lives forever\n\nvoid fn1() {\n  int x = 5;          // LOCAL to fn1 only\n  g = g + x;          // can access global g\n  // x cannot be seen from fn2 or main\n}\n\nvoid fn2() {\n  int y = 3;          // LOCAL to fn2 only\n  // int z = x + y;   // ERROR: x doesn't exist here!\n  g = g * y;          // g is accessible\n}\n\nint main() {\n  fn1();  // x born, lives, dies\n  fn2();  // y born, lives, dies\n  // x, y don't exist here\n  printf("%d", g);    // g still alive\n}`} highlightLine={phase === 1 ? 3 : phase === 2 ? 9 : -1} />
          <InsightBlock title="SCOPE MENTAL MODEL" color={T.accent} icon="🔭">
            {"Scope is like a flashlight. You can only see variables within your light cone.\n\n"}
            <span style={{ color: T.neon2 }}>Global scope</span>{" = stadium lights — everyone sees it.\n"}
            <span style={{ color: T.neon }}>Local scope</span>{" = your phone flashlight — only you see it.\n\nA variable ceases to exist when its "}
            <span style={{ color: T.accent }}>{"{ }"}</span>{" closing brace is reached."}
          </InsightBlock>
          <InsightBlock title="COMMON MISTAKE" color={T.neon3} icon="⚠">
            {"Overusing globals — they create hidden dependencies and make functions hard to test.\n\nRule: "}
            <span style={{ color: T.neon }}>pass data as arguments</span>{", return results. Minimize globals."}
          </InsightBlock>
        </div>
      </div>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 05 — RECURSION
// ─────────────────────────────────────────────────────────────────────────────
function RecursionSection() {
  const [n, setN] = useState(4);
  const [stepIdx, setStepIdx] = useState(-1);
  const [result, setResult] = useState(null);

  const buildSteps = useCallback((num) => {
    const steps = [];
    for (let i = num; i >= 1; i--) steps.push({ type: "push", n: i, frames: Array.from({ length: num - i + 1 }, (_, k) => ({ n: num - k, status: k === 0 ? "active" : "waiting" })) });
    steps.push({ type: "push", n: 0, frames: [...Array.from({ length: num }, (_, k) => ({ n: num - k, status: "waiting" })), { n: 0, status: "base" }] });
    let acc = 1;
    for (let i = 1; i <= num; i++) { acc *= i; const remaining = num - i; steps.push({ type: "pop", n: i, val: acc, frames: Array.from({ length: remaining + 1 }, (_, k) => ({ n: remaining - k, status: k === 0 ? "returning" : "waiting" })) }); }
    steps.push({ type: "done", val: acc, frames: [] });
    return steps;
  }, []);

  const steps = useMemo(() => buildSteps(n), [n, buildSteps]);
  const advance = () => { const next = stepIdx + 1; if (next >= steps.length) { setStepIdx(-1); setResult(null); return; } setStepIdx(next); if (steps[next].type === "done") setResult(steps[next].val); else setResult(null); };
  const currentFrames = stepIdx >= 0 && stepIdx < steps.length ? steps[stepIdx].frames : [];
  const currentStep_ = stepIdx >= 0 && stepIdx < steps.length ? steps[stepIdx] : null;
  const factMemo = (x) => { let r = 1; for (let i = 2; i <= x; i++) r *= i; return r; };

  return (
    <Section id="recursion">
      <SectionHeader num="05" tag="FUNCTIONS · RECURSION" title="Call Stack Visualizer" subtitle="Watch frames push onto the stack — then pop as returns cascade back" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
        <GlassCard style={{ padding: 28 }}>
          <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 4, color: T.neon4, marginBottom: 20 }}>🌀 FACTORIAL RECURSION — factorial({n})</div>
          <div style={{ marginBottom: 22 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontFamily: T.mono, fontSize: 10, color: T.muted }}>n = </span>
              <motion.span key={n} animate={{ scale: [1.4, 1] }} style={{ fontFamily: T.mono, fontSize: 20, fontWeight: 800, color: T.neon4 }}>{n}</motion.span>
            </div>
            <input type="range" min={1} max={6} value={n} onChange={e => { setN(Number(e.target.value)); setStepIdx(-1); setResult(null); }} style={{ width: "100%", accentColor: T.neon4 }} />
            <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, marginTop: 4 }}>{n}! = {factMemo(n)} ({n} stack frames)</div>
          </div>
          <div style={{ minHeight: 240, border: `1px solid ${T.dim}`, borderRadius: 10, background: "rgba(0,0,0,0.3)", padding: "14px", display: "flex", flexDirection: "column-reverse", gap: 5, marginBottom: 14, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 8, left: 12, fontFamily: T.mono, fontSize: 7, color: T.dim, letterSpacing: 3 }}>CALL STACK (top = most recent)</div>
            {currentFrames.length === 0 ? (
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: T.mono, fontSize: 11, color: T.muted }}>Press STEP to start pushing frames...</div>
            ) : (
              [...currentFrames].reverse().map((frame, i) => {
                const colors = { active: T.neon4, waiting: T.muted, base: T.neon, returning: T.accent };
                const c = colors[frame.status] || T.muted;
                const frameResult = frame.n <= 1 ? 1 : factMemo(frame.n);
                return (
                  <motion.div key={`${frame.n}-${i}`} initial={{ scaleY: 0, opacity: 0 }} animate={{ scaleY: 1, opacity: 1 }} exit={{ scaleY: 0, opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    style={{ padding: "9px 14px", borderRadius: 7, background: `${c}12`, border: `1px solid ${c}50`, display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: (frame.status === "active" || frame.status === "returning") ? `0 0 15px ${c}40` : "none" }}>
                    <span style={{ fontFamily: T.mono, fontSize: 11, color: c }}>factorial({frame.n})</span>
                    <span style={{ fontFamily: T.mono, fontSize: 9, color: c, opacity: 0.7 }}>{frame.status === "base" ? "BASE CASE → return 1" : frame.status === "returning" ? `← returning ${frameResult}` : frame.status === "active" ? "EXECUTING" : "waiting..."}</span>
                  </motion.div>
                );
              })
            )}
          </div>
          <AnimatePresence mode="wait">
            {currentStep_ && (
              <motion.div key={stepIdx} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                style={{ padding: "10px 14px", borderRadius: 8, marginBottom: 12, background: `${T.neon4}10`, border: `1px solid ${T.neon4}30`, fontFamily: T.mono, fontSize: 11, color: T.text, lineHeight: 1.7 }}>
                {currentStep_.type === "push" && `PUSH: factorial(${currentStep_.n}) called — awaiting return from factorial(${currentStep_.n - 1})`}
                {currentStep_.type === "pop" && `POP: factorial(${currentStep_.n}) returns ${factMemo(currentStep_.n)}`}
                {currentStep_.type === "done" && `✓ COMPLETE: factorial(${n}) = ${result}`}
              </motion.div>
            )}
          </AnimatePresence>
          {result !== null && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 250 }}
              style={{ textAlign: "center", padding: "14px", borderRadius: 10, background: `${T.neon}15`, border: `2px solid ${T.neon}`, fontFamily: T.display, fontSize: 28, fontWeight: 800, color: T.neon, boxShadow: `0 0 40px ${T.neon}40`, marginBottom: 12 }}>
              {n}! = {result}
            </motion.div>
          )}
          <div style={{ height: 160, border: `1px solid ${T.dim}`, borderRadius: 10, overflow: "hidden", marginBottom: 14 }}>
            <Canvas camera={{ position: [0, 0, 7], fov: 50 }}>
              <ambientLight intensity={0.3} /><pointLight position={[5, 5, 5]} color={T.neon4} intensity={1.5} />
              <Suspense fallback={null}><StackFrames3D frames={currentFrames} /></Suspense>
              <Stars radius={40} depth={15} count={300} factor={2} saturation={0} fade speed={0.4} />
            </Canvas>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <motion.button whileTap={{ scale: 0.96 }} onClick={advance}
              style={{ flex: 1, fontFamily: T.display, fontWeight: 700, fontSize: 11, letterSpacing: 3, color: "#000", background: `linear-gradient(135deg, ${T.neon4}, ${T.neon})`, border: "none", borderRadius: 8, padding: "12px", cursor: "pointer" }}>
              {stepIdx < 0 ? "▶ START" : stepIdx >= steps.length - 1 ? "↺ RESTART" : `STEP → (${stepIdx + 1}/${steps.length})`}
            </motion.button>
            <motion.button whileTap={{ scale: 0.96 }} onClick={() => { setStepIdx(-1); setResult(null); }}
              style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, background: "transparent", border: `1px solid ${T.dim}`, borderRadius: 8, padding: "12px 14px", cursor: "pointer" }}>↺</motion.button>
          </div>
        </GlassCard>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <CodeBlock code={`int factorial(int n) {\n  if (n == 0 || n == 1)  // BASE CASE\n    return 1;            // stops recursion\n\n  return n * factorial(n - 1); // RECURSIVE CASE\n}\n\n// How it resolves:\n// factorial(4)\n// = 4 * factorial(3)\n// = 4 * 3 * factorial(2)\n// = 4 * 3 * 2 * factorial(1)\n// = 4 * 3 * 2 * 1     <- base case reached\n// = 4 * 3 * 2 = 24`} highlightLine={currentStep_?.type === "push" ? 4 : currentStep_ ? 1 : -1} />
          <InsightBlock title="HOW RECURSION WORKS" color={T.neon4} icon="🌀">
            {"Every function call creates a NEW "}<span style={{ color: T.neon4 }}>stack frame</span>{" in memory — its own copy of local variables.\n\nThe stack grows UP with each call, pops DOWN with each return.\n\n"}
            <span style={{ color: T.neon3 }}>No base case</span>{" = infinite stack growth = Stack Overflow crash."}
          </InsightBlock>
          <InsightBlock title="MENTAL MODEL" color={T.accent} icon="🧠">
            {`"Trust the recursion." Define the base case. Define what you return.\nAssume it works for n-1. Use it for n.\n\nFactorial(4) = 4 × Factorial(3). Trust Factorial(3) works.`}
          </InsightBlock>
        </div>
      </div>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 06 — 1D ARRAYS
// ─────────────────────────────────────────────────────────────────────────────
function Arrays1DSection() {
  const [arr, setArr] = useState([10, 25, 7, 42, 18, 33]);
  const [highlighted, setHighlighted] = useState(-1);
  const [editIdx, setEditIdx] = useState(null);
  const [editVal, setEditVal] = useState("");

  const updateCell = (i, v) => { const next = [...arr]; const parsed = parseInt(v); if (!isNaN(parsed)) next[i] = parsed; setArr(next); setEditIdx(null); };

  return (
    <Section id="arrays-1d">
      <SectionHeader num="06" tag="ARRAYS · 1D" title="Contiguous Memory Engine" subtitle="An array is a row of consecutive boxes — all same type, same size" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
        <GlassCard style={{ padding: 28 }}>
          <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 4, color: T.neon, marginBottom: 20 }}>▦ MEMORY LAYOUT — int arr[{arr.length}]</div>
          <div style={{ display: "flex", gap: 0, marginBottom: 4, paddingLeft: 2 }}>
            {arr.map((_, i) => <div key={i} style={{ flex: 1, fontFamily: T.mono, fontSize: 7, color: T.dim, textAlign: "center", overflow: "hidden" }}>+{i * 4}</div>)}
          </div>
          <div style={{ display: "flex", gap: 0, marginBottom: 4 }}>
            {arr.map((v, i) => (
              <motion.div key={i} whileHover={{ y: -4 }} onHoverStart={() => setHighlighted(i)} onHoverEnd={() => setHighlighted(-1)} onClick={() => { setEditIdx(i); setEditVal(String(v)); }}
                animate={{ background: highlighted === i ? `${T.neon}20` : `${T.neon}08`, borderColor: highlighted === i ? T.neon : `${T.neon}30`, boxShadow: highlighted === i ? `0 0 20px ${T.neon}50` : "none" }}
                style={{ flex: 1, height: 64, border: "1px solid", borderRight: i < arr.length - 1 ? "1px solid" : undefined, borderRadius: i === 0 ? "8px 0 0 8px" : i === arr.length - 1 ? "0 8px 8px 0" : 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative", overflow: "hidden" }}>
                {editIdx === i ? (
                  <input autoFocus value={editVal} onChange={e => setEditVal(e.target.value)} onBlur={() => updateCell(i, editVal)} onKeyDown={e => e.key === "Enter" && updateCell(i, editVal)}
                    style={{ width: "90%", background: "transparent", border: "none", outline: "none", fontFamily: T.mono, fontSize: 16, fontWeight: 700, color: T.neon4, textAlign: "center" }} />
                ) : (
                  <motion.span key={v} animate={{ scale: [1.3, 1] }} style={{ fontFamily: T.mono, fontSize: 16, fontWeight: 700, color: highlighted === i ? T.neon : T.text }}>{v}</motion.span>
                )}
              </motion.div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 0, marginBottom: 20 }}>
            {arr.map((_, i) => <div key={i} style={{ flex: 1, textAlign: "center", fontFamily: T.mono, fontSize: 10, fontWeight: 700, color: highlighted === i ? T.neon : T.muted, padding: "4px 0", borderTop: `2px solid ${highlighted === i ? T.neon : T.dim}` }}>[{i}]</div>)}
          </div>
          <AnimatePresence>
            {highlighted >= 0 && highlighted < arr.length && (
              <motion.div key={highlighted} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ padding: "10px 14px", borderRadius: 8, marginBottom: 14, background: `${T.neon}10`, border: `1px solid ${T.neon}30`, fontFamily: T.mono, fontSize: 11, color: T.text }}>
                arr[{highlighted}] = <span style={{ color: T.neon, fontWeight: 700 }}>{arr[highlighted]}</span>&nbsp;| Addr: <span style={{ color: T.neon2 }}>0x{(0x1000 + highlighted * 4).toString(16)}</span>&nbsp;| Offset: <span style={{ color: T.neon4 }}>{highlighted * 4} bytes</span>
                <div style={{ fontSize: 9, color: T.muted, marginTop: 4 }}>Click to edit value</div>
              </motion.div>
            )}
          </AnimatePresence>
          <div style={{ height: 150, border: `1px solid ${T.dim}`, borderRadius: 10, overflow: "hidden", marginBottom: 14 }}>
            <Canvas camera={{ position: [0, 0, 6], fov: 55 }}>
              <ambientLight intensity={0.35} /><pointLight position={[5, 5, 5]} color={T.neon} intensity={1.2} />
              <Suspense fallback={null}><ArrayOrbs3D count={arr.length} highlighted={highlighted} /></Suspense>
              <Stars radius={30} depth={12} count={200} factor={2} saturation={0} fade speed={0.5} />
            </Canvas>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <motion.button whileTap={{ scale: 0.96 }} onClick={() => arr.length < 8 && setArr([...arr, Math.floor(Math.random() * 50 + 1)])} disabled={arr.length >= 8}
              style={{ flex: 1, fontFamily: T.display, fontWeight: 700, fontSize: 10, letterSpacing: 2, color: "#000", background: arr.length < 8 ? `linear-gradient(135deg, ${T.neon}, ${T.neon2})` : T.dim, border: "none", borderRadius: 7, padding: "10px", cursor: arr.length < 8 ? "pointer" : "not-allowed" }}>+ ADD ELEMENT</motion.button>
            <motion.button whileTap={{ scale: 0.96 }} onClick={() => arr.length > 1 && setArr(arr.slice(0, -1))}
              style={{ fontFamily: T.mono, fontSize: 10, color: T.neon3, background: "transparent", border: `1px solid ${T.neon3}40`, borderRadius: 7, padding: "10px 14px", cursor: "pointer" }}>REMOVE</motion.button>
          </div>
        </GlassCard>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <CodeBlock code={`int arr[6] = {10, 25, 7, 42, 18, 33};\n//            [0]  [1] [2] [3] [4] [5]\n\n// Access by index (0-based!)\nprintf("%d", arr[0]);  // 10\nprintf("%d", arr[3]);  // 42\n\n// Modify\narr[2] = 99;\n\n// Array NAME = pointer to first element\nprintf("%p", arr);     // = &arr[0]\n\n// Size of array\nint n = sizeof(arr) / sizeof(arr[0]); // = 6`} highlightLine={highlighted >= 0 ? 4 : -1} />
          <InsightBlock title="KEY MENTAL MODEL" color={T.neon} icon="▦">
            {"Arrays are "}<span style={{ color: T.neon }}>contiguous</span>{" — every element is exactly sizeof(type) bytes after the previous.\n\narr[i] compiles to: "}<span style={{ color: T.neon2 }}>*(arr + i)</span>{" — pointer arithmetic.\n\n"}<span style={{ color: T.neon3 }}>No bounds checking</span>{" — arr[100] won't crash immediately, just reads garbage memory."}
          </InsightBlock>
          <InsightBlock title="COMMON MISTAKES" color={T.neon3} icon="⚠">
            {"• Off-by-one: arr[n] is OUT of bounds (valid: 0 to n-1)\n• sizeof(arr) inside a function — gives pointer size, not array size\n• int arr[0] — zero-length arrays: undefined behavior"}
          </InsightBlock>
        </div>
      </div>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 07 — 2D ARRAYS
// ─────────────────────────────────────────────────────────────────────────────
function Arrays2DSection() {
  const ROWS = 3, COLS = 4;
  const [grid] = useState(() => Array.from({ length: ROWS }, (_, r) => Array.from({ length: COLS }, (_, c) => r * COLS + c + 1)));
  const [activeCell, setActiveCell] = useState(null);
  const [accessMode, setAccessMode] = useState("cell");
  const [activeRow, setActiveRow] = useState(0);
  const [activeCol, setActiveCol] = useState(0);

  return (
    <Section id="arrays-2d">
      <SectionHeader num="07" tag="ARRAYS · 2D" title="The Grid Matrix Engine" subtitle="A 2D array is rows of 1D arrays laid out contiguously in memory" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
        <GlassCard style={{ padding: 28 }}>
          <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 4, color: T.neon2, marginBottom: 20 }}>⊞ MATRIX VISUAL — int m[{ROWS}][{COLS}]</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
            {["cell", "row", "col"].map(m => <Pill key={m} color={T.neon2} active={accessMode === m} onClick={() => setAccessMode(m)}>{m === "cell" ? "Cell Access" : m === "row" ? "Row Access" : "Column Access"}</Pill>)}
          </div>
          {accessMode !== "cell" && (
            <div style={{ display: "flex", gap: 14, marginBottom: 16 }}>
              {accessMode === "row" && <div style={{ flex: 1 }}><div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, marginBottom: 4 }}>Row</div><input type="range" min={0} max={ROWS - 1} value={activeRow} onChange={e => setActiveRow(Number(e.target.value))} style={{ width: "100%", accentColor: T.neon2 }} /><div style={{ fontFamily: T.mono, fontSize: 10, color: T.neon2 }}>m[{activeRow}][*]</div></div>}
              {accessMode === "col" && <div style={{ flex: 1 }}><div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, marginBottom: 4 }}>Column</div><input type="range" min={0} max={COLS - 1} value={activeCol} onChange={e => setActiveCol(Number(e.target.value))} style={{ width: "100%", accentColor: T.accent }} /><div style={{ fontFamily: T.mono, fontSize: 10, color: T.accent }}>m[*][{activeCol}]</div></div>}
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 18 }}>
            <div style={{ display: "flex", gap: 4, paddingLeft: 32 }}>{Array.from({ length: COLS }, (_, c) => <div key={c} style={{ flex: 1, textAlign: "center", fontFamily: T.mono, fontSize: 9, color: T.muted, padding: "2px 0" }}>[{c}]</div>)}</div>
            {grid.map((row, r) => (
              <div key={r} style={{ display: "flex", gap: 4, alignItems: "center" }}>
                <div style={{ width: 28, fontFamily: T.mono, fontSize: 9, color: T.muted, textAlign: "right", paddingRight: 4 }}>[{r}]</div>
                {row.map((v, c) => {
                  const isActive = accessMode === "cell" ? (activeCell?.r === r && activeCell?.c === c) : accessMode === "row" ? r === activeRow : c === activeCol;
                  const cellColor = accessMode === "row" ? T.neon2 : accessMode === "col" ? T.accent : T.neon;
                  return (
                    <motion.div key={c} whileHover={{ scale: 1.1, zIndex: 2 }} onClick={() => accessMode === "cell" && setActiveCell({ r, c })}
                      animate={{ background: isActive ? `${cellColor}25` : `${T.neon}06`, borderColor: isActive ? `${cellColor}80` : `${T.neon}20`, boxShadow: isActive ? `0 0 15px ${cellColor}50` : "none", scale: isActive ? 1.05 : 1 }}
                      style={{ flex: 1, height: 52, border: "1px solid", borderRadius: 7, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                      <span style={{ fontFamily: T.mono, fontSize: 14, fontWeight: 700, color: isActive ? cellColor : T.text }}>{v}</span>
                      <span style={{ fontFamily: T.mono, fontSize: 7, color: T.dim }}>[{r}][{c}]</span>
                    </motion.div>
                  );
                })}
              </div>
            ))}
          </div>
          <div style={{ padding: "10px 14px", borderRadius: 8, background: `${T.neon2}08`, border: `1px solid ${T.neon2}25`, fontFamily: T.mono, fontSize: 10, color: T.text, lineHeight: 1.75 }}>
            <span style={{ color: T.neon2 }}>Row-major:</span> m[0][0], m[0][1], m[0][2], m[0][3], m[1][0]...<br />
            <span style={{ color: T.muted }}>All {ROWS * COLS} ints → {ROWS * COLS * 4} bytes total, laid out sequentially</span>
          </div>
        </GlassCard>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <CodeBlock code={`int m[3][4] = {\n  {1,  2,  3,  4},   // row 0\n  {5,  6,  7,  8},   // row 1\n  {9,  10, 11, 12}   // row 2\n};\n\n// Access: m[row][col]\nprintf("%d", m[1][2]);  // = 7\n\n// Row traversal (cache-friendly!)\nfor (int c = 0; c < 4; c++)\n  printf("%d ", m[1][c]); // 5 6 7 8\n\n// Column traversal (cache-unfriendly)\nfor (int r = 0; r < 3; r++)\n  printf("%d ", m[r][2]); // 3 7 11`} highlightLine={accessMode === "row" ? 10 : accessMode === "col" ? 14 : 7} />
          <InsightBlock title="ROW-MAJOR ORDER" color={T.neon2} icon="⊞">
            {"C stores 2D arrays ROW by ROW in memory.\n\n"}<span style={{ color: T.neon }}>m[r][c]</span>{" = "}<span style={{ color: T.neon2 }}>*(m + r*COLS + c)</span>{"\n\nRow traversal is "}<span style={{ color: T.neon }}>cache-friendly</span>{" — sequential memory access.\nColumn traversal "}<span style={{ color: T.neon3 }}>jumps COLS×4 bytes</span>{" each step — cache miss per element."}
          </InsightBlock>
        </div>
      </div>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 08 — TRAVERSAL
// ─────────────────────────────────────────────────────────────────────────────
function TraversalSection() {
  const [arr] = useState([14, 7, 33, 2, 19, 45, 8]);
  const [ptr, setPtr] = useState(-1);
  const [running, setRunning] = useState(false);
  const [visited, setVisited] = useState([]);
  const [speed, setSpeed] = useState(500);
  const runningRef = useRef(false);

  const traverse = async () => {
    if (runningRef.current) return;
    runningRef.current = true; setRunning(true); setVisited([]); setPtr(-1);
    for (let i = 0; i < arr.length; i++) {
      if (!runningRef.current) break;
      setPtr(i); setVisited(prev => [...prev, i]);
      await new Promise(r => setTimeout(r, speed));
    }
    setPtr(-1); setRunning(false); runningRef.current = false;
  };

  const reset = () => { runningRef.current = false; setPtr(-1); setVisited([]); setRunning(false); };

  return (
    <Section id="traversal">
      <SectionHeader num="08" tag="ARRAYS · TRAVERSAL" title="The Pointer Walk" subtitle="Watch the index pointer sweep through every element" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
        <GlassCard style={{ padding: 28 }}>
          <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 4, color: T.neon, marginBottom: 20 }}>→ TRAVERSAL ANIMATION</div>
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
              <span style={{ fontFamily: T.mono, fontSize: 9, color: T.muted }}>Speed</span>
              <span style={{ fontFamily: T.mono, fontSize: 10, color: T.neon }}>{speed >= 700 ? "Slow" : speed >= 350 ? "Normal" : "Fast"}</span>
            </div>
            <input type="range" min={100} max={900} step={100} value={speed} onChange={e => setSpeed(Number(e.target.value))} style={{ width: "100%", accentColor: T.neon }} />
          </div>
          <div style={{ position: "relative", marginBottom: 36 }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              {arr.map((v, i) => (
                <motion.div key={i} animate={{ background: ptr === i ? `${T.neon4}30` : visited.includes(i) ? `${T.neon}10` : `${T.neon}06`, borderColor: ptr === i ? T.neon4 : visited.includes(i) ? `${T.neon}50` : `${T.neon}20`, boxShadow: ptr === i ? `0 0 25px ${T.neon4}60` : "none", scale: ptr === i ? 1.15 : 1, y: ptr === i ? -8 : 0 }}
                  style={{ flex: 1, height: 56, border: "2px solid", borderRadius: 8, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontFamily: T.mono, fontSize: 15, fontWeight: 700, color: ptr === i ? T.neon4 : visited.includes(i) ? T.neon : T.muted }}>{v}</span>
                  <span style={{ fontFamily: T.mono, fontSize: 8, color: T.dim }}>[{i}]</span>
                </motion.div>
              ))}
            </div>
            <AnimatePresence>
              {ptr >= 0 && (
                <motion.div key={`ptr-${ptr}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  style={{ position: "absolute", bottom: -28, left: 0, right: 0, display: "flex", justifyContent: "flex-start", paddingLeft: `calc(${(ptr / arr.length) * 100}% + ${ptr * 8}px)` }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 32 }}>
                    <div style={{ width: 0, height: 0, borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderBottom: `7px solid ${T.neon4}` }} />
                    <span style={{ fontFamily: T.mono, fontSize: 8, color: T.neon4 }}>i={ptr}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div style={{ padding: "10px 14px", borderRadius: 8, marginBottom: 16, background: ptr >= 0 ? `${T.neon4}10` : "rgba(255,255,255,0.02)", border: `1px solid ${ptr >= 0 ? `${T.neon4}30` : T.dim}`, fontFamily: T.mono, fontSize: 11, color: T.text, minHeight: 40 }}>
            {ptr >= 0 ? <span>arr[<span style={{ color: T.neon4 }}>{ptr}</span>] = <span style={{ color: T.neon, fontWeight: 700 }}>{arr[ptr]}</span> | Visited: {visited.length}/{arr.length}</span> : visited.length === arr.length ? "Traversal complete! ✓" : "Press TRAVERSE to start"}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} onClick={traverse} disabled={running}
              style={{ flex: 1, fontFamily: T.display, fontWeight: 700, fontSize: 11, letterSpacing: 3, color: "#000", background: running ? T.muted : `linear-gradient(135deg, ${T.neon}, ${T.neon4})`, border: "none", borderRadius: 8, padding: "12px", cursor: running ? "not-allowed" : "pointer" }}>
              {running ? "TRAVERSING..." : "▶ TRAVERSE"}
            </motion.button>
            <motion.button whileTap={{ scale: 0.96 }} onClick={reset} style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, background: "transparent", border: `1px solid ${T.dim}`, borderRadius: 8, padding: "12px 14px", cursor: "pointer" }}>↺</motion.button>
          </div>
        </GlassCard>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <CodeBlock code={`int arr[] = {14, 7, 33, 2, 19, 45, 8};\nint n = 7;\n\n// Standard traversal\nfor (int i = 0; i < n; i++) {\n  printf("arr[%d] = %d\\n", i, arr[i]);\n}\n\n// Pointer-based traversal (equivalent!)\nfor (int *p = arr; p < arr + n; p++) {\n  printf("%d\\n", *p);\n}\n\n// Reverse traversal\nfor (int i = n - 1; i >= 0; i--) {\n  printf("%d ", arr[i]);\n}`} highlightLine={ptr >= 0 ? 4 : -1} />
          <InsightBlock title="TRAVERSAL PATTERNS" color={T.neon} icon="→">
            {"Three valid ways to traverse:\n\n"}<span style={{ color: T.neon }}>Index-based</span>{": arr[i] — most readable, O(1) random access\n"}<span style={{ color: T.neon2 }}>Pointer-based</span>{": *p — same compiled code, pointer arithmetic\n"}<span style={{ color: T.neon4 }}>Reverse</span>{": i = n-1 → 0 — useful for in-place reversal"}
          </InsightBlock>
        </div>
      </div>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 09 — ARRAY PROBLEMS
// ─────────────────────────────────────────────────────────────────────────────
function ArrayProblemsSection() {
  const initialArr = [14, 7, 33, 2, 19, 45, 8];
  const [arr, setArr] = useState([...initialArr]);
  const [problem, setProblem] = useState("sum");
  const [highlight, setHighlight] = useState(-1);
  const [acc, setAcc] = useState(null);
  const [running, setRunning] = useState(false);
  const runningRef = useRef(false);

  const resetProblem = () => { runningRef.current = false; setArr([...initialArr]); setHighlight(-1); setAcc(null); setRunning(false); };

  const runSum = async (a) => { let sum = 0; for (let i = 0; i < a.length; i++) { if (!runningRef.current) break; setHighlight(i); sum += a[i]; setAcc(sum); await new Promise(r => setTimeout(r, 450)); } setHighlight(-1); };
  const runMax = async (a) => { let max = a[0]; for (let i = 0; i < a.length; i++) { if (!runningRef.current) break; setHighlight(i); if (a[i] > max) max = a[i]; setAcc(max); await new Promise(r => setTimeout(r, 450)); } setHighlight(-1); };
  const runReverse = async (a) => { const temp = [...a]; let left = 0, right = temp.length - 1; while (left < right && runningRef.current) { setHighlight(left); const t = temp[left]; temp[left] = temp[right]; temp[right] = t; setArr([...temp]); setAcc([...temp]); await new Promise(r => setTimeout(r, 400)); left++; right--; } setHighlight(-1); };

  const runProblem = async () => {
    if (runningRef.current) return;
    runningRef.current = true; setRunning(true); setAcc(null); setHighlight(-1);
    const currentArr = problem === "reverse" ? [...initialArr] : [...arr];
    if (problem === "reverse") setArr([...initialArr]);
    if (problem === "sum") await runSum(currentArr);
    else if (problem === "max") await runMax(currentArr);
    else if (problem === "reverse") await runReverse(currentArr);
    setRunning(false); runningRef.current = false;
  };

  const problems = {
    sum:     { label: "Sum of Array",  color: T.neon,   code: `int sum = 0;\nfor (int i = 0; i < n; i++)\n  sum += arr[i];\n// sum = ${initialArr.reduce((a,b)=>a+b,0)}` },
    max:     { label: "Find Maximum",  color: T.neon4,  code: `int max = arr[0];\nfor (int i = 1; i < n; i++)\n  if (arr[i] > max) max = arr[i];\n// max = ${Math.max(...initialArr)}` },
    reverse: { label: "Reverse Array", color: T.accent, code: `int l = 0, r = n - 1;\nwhile (l < r) {\n  int t = arr[l]; arr[l] = arr[r]; arr[r] = t;\n  l++; r--;\n}` },
  };
  const p = problems[problem];

  return (
    <Section id="array-probs">
      <SectionHeader num="09" tag="ARRAYS · PROBLEMS" title="Algorithm Visualizer" subtitle="Classic array operations — step by step" />
      <div style={{ display: "flex", gap: 10, marginBottom: 22, flexWrap: "wrap" }}>
        {Object.entries(problems).map(([k, v]) => <Pill key={k} color={v.color} active={problem === k} onClick={() => { setProblem(k); resetProblem(); }}>{v.label}</Pill>)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
        <GlassCard style={{ padding: 28 }}>
          <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 4, color: p.color, marginBottom: 20 }}>🧮 {p.label.toUpperCase()}</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 22 }}>
            {arr.map((v, i) => (
              <motion.div key={i} animate={{ background: highlight === i ? `${p.color}30` : `${T.neon}06`, borderColor: highlight === i ? p.color : `${T.neon}20`, boxShadow: highlight === i ? `0 0 20px ${p.color}60` : "none", scale: highlight === i ? 1.15 : 1, y: highlight === i ? -6 : 0 }}
                style={{ flex: 1, height: 56, border: "2px solid", borderRadius: 8, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontFamily: T.mono, fontSize: 14, fontWeight: 700, color: highlight === i ? p.color : T.text }}>{v}</span>
                <span style={{ fontFamily: T.mono, fontSize: 8, color: T.dim }}>[{i}]</span>
              </motion.div>
            ))}
          </div>
          <div style={{ padding: "16px", borderRadius: 10, marginBottom: 18, background: acc !== null ? `${p.color}12` : "rgba(0,0,0,0.2)", border: `1px solid ${acc !== null ? `${p.color}50` : T.dim}`, textAlign: "center", minHeight: 72, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            {acc !== null ? (
              <><div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, marginBottom: 4 }}>{problem === "sum" ? "running sum" : problem === "max" ? "current max" : "array state"}</div>
              <AnimatePresence mode="wait">
                <motion.div key={JSON.stringify(acc)} initial={{ scale: 1.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ fontFamily: T.display, fontSize: Array.isArray(acc) ? 16 : 28, fontWeight: 800, color: p.color }}>{Array.isArray(acc) ? `[${acc.join(", ")}]` : acc}</motion.div>
              </AnimatePresence></>
            ) : <div style={{ fontFamily: T.mono, fontSize: 11, color: T.muted }}>Press RUN to visualize...</div>}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} onClick={runProblem} disabled={running}
              style={{ flex: 1, fontFamily: T.display, fontWeight: 700, fontSize: 11, letterSpacing: 3, color: "#000", background: running ? T.muted : `linear-gradient(135deg, ${p.color}, ${T.neon2})`, border: "none", borderRadius: 8, padding: "12px", cursor: running ? "not-allowed" : "pointer" }}>
              {running ? "RUNNING..." : `▶ RUN ${p.label.toUpperCase()}`}
            </motion.button>
            <motion.button whileTap={{ scale: 0.96 }} onClick={resetProblem} style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, background: "transparent", border: `1px solid ${T.dim}`, borderRadius: 8, padding: "12px 14px", cursor: "pointer" }}>↺</motion.button>
          </div>
        </GlassCard>
        <CodeBlock code={p.code} highlightLine={highlight >= 0 ? 1 : -1} />
      </div>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 10 — STRINGS
// ─────────────────────────────────────────────────────────────────────────────
function StringsSection() {
  const [inputStr, setInputStr] = useState("Hello");
  const [showNull, setShowNull] = useState(true);
  const [scanfInput, setScanfInput] = useState("World");
  const [termOutput, setTermOutput] = useState([]);
  const [simRunning, setSimRunning] = useState(false);
  const chars = inputStr.split("").concat(showNull ? ["\0"] : []);

  const runSim = async () => {
    if (simRunning) return;
    setSimRunning(true); setTermOutput([]);
    await new Promise(r => setTimeout(r, 400)); setTermOutput(["$ ./a.out"]);
    await new Promise(r => setTimeout(r, 400)); setTermOutput(prev => [...prev, `Enter name: `]);
    await new Promise(r => setTimeout(r, 600)); setTermOutput(prev => [...prev, `> ${scanfInput}`]);
    await new Promise(r => setTimeout(r, 500)); setTermOutput(prev => [...prev, `Hello, ${scanfInput}!`]);
    await new Promise(r => setTimeout(r, 400)); setTermOutput(prev => [...prev, `Length: ${scanfInput.length}`]);
    setSimRunning(false);
  };

  return (
    <Section id="strings">
      <SectionHeader num="10" tag="STRINGS · CHAR ARRAYS" title="String Memory Engine" subtitle="A string in C is just a char array ending with \\0 (null terminator)" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
        <GlassCard style={{ padding: 28 }}>
          <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 4, color: T.neon2, marginBottom: 20 }}>🔤 CHAR ARRAY VISUALIZER</div>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, marginBottom: 8 }}>Edit string (max 10):</div>
            <input value={inputStr} onChange={e => setInputStr(e.target.value.slice(0, 10))}
              style={{ width: "100%", background: "rgba(0,0,0,0.4)", border: `1px solid ${T.neon2}40`, borderRadius: 8, padding: "10px 14px", fontFamily: T.mono, fontSize: 16, color: T.neon2, outline: "none" }} />
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
            {chars.map((ch, i) => {
              const isNull = ch === "\0";
              const color = isNull ? T.neon3 : T.neon2;
              return (
                <motion.div key={i} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: i * 0.04, type: "spring", stiffness: 250 }}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                  <div style={{ fontFamily: T.mono, fontSize: 7, color: T.dim }}>+{i}</div>
                  <div style={{ width: 44, height: 52, borderRadius: 7, background: isNull ? `${T.neon3}12` : `${color}12`, border: `2px solid ${isNull ? `${T.neon3}60` : `${color}50`}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: isNull ? `0 0 12px ${T.neon3}40` : "none" }}>
                    <span style={{ fontFamily: T.mono, fontSize: isNull ? 11 : 18, fontWeight: 800, color: isNull ? T.neon3 : color }}>{isNull ? "\\0" : ch}</span>
                  </div>
                  <div style={{ fontFamily: T.mono, fontSize: 7, color: T.muted }}>{isNull ? "0" : ch.charCodeAt(0)}</div>
                  <div style={{ fontFamily: T.mono, fontSize: 8, color: T.muted }}>[{i}]</div>
                </motion.div>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
            <motion.button whileTap={{ scale: 0.96 }} onClick={() => setShowNull(!showNull)}
              style={{ flex: 1, fontFamily: T.mono, fontSize: 9, fontWeight: 700, letterSpacing: 2, color: showNull ? T.neon3 : T.muted, background: showNull ? `${T.neon3}10` : "transparent", border: `1px solid ${showNull ? `${T.neon3}40` : T.dim}`, borderRadius: 7, padding: "9px", cursor: "pointer" }}>
              {showNull ? "\\0 VISIBLE" : "\\0 HIDDEN"}
            </motion.button>
          </div>
          <div style={{ fontFamily: T.mono, fontSize: 9, color: T.neon, marginBottom: 10, letterSpacing: 3 }}>INPUT SIMULATION</div>
          <input value={scanfInput} onChange={e => setScanfInput(e.target.value.slice(0, 15))} placeholder="Type a name..."
            style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: `1px solid ${T.neon}30`, borderRadius: 7, padding: "9px 12px", fontFamily: T.mono, fontSize: 13, color: T.neon, outline: "none", marginBottom: 10 }} />
          <div style={{ background: "rgba(0,0,0,0.5)", borderRadius: 9, border: `1px solid ${T.dim}`, padding: "12px 14px", minHeight: 100, marginBottom: 12, fontFamily: T.mono, fontSize: 12 }}>
            {termOutput.map((line, i) => <motion.div key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} style={{ color: line.startsWith(">") ? T.neon2 : line.startsWith("$") ? T.muted : T.neon, marginBottom: 2 }}>{line}</motion.div>)}
            {simRunning && <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.7, repeat: Infinity }} style={{ color: T.neon }}>_</motion.span>}
          </div>
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} onClick={runSim} disabled={simRunning}
            style={{ width: "100%", fontFamily: T.display, fontWeight: 700, fontSize: 11, letterSpacing: 3, color: "#000", background: simRunning ? T.muted : `linear-gradient(135deg, ${T.neon2}, ${T.neon})`, border: "none", borderRadius: 8, padding: "12px", cursor: simRunning ? "not-allowed" : "pointer" }}>
            {simRunning ? "SIMULATING..." : "▶ SIMULATE scanf / printf"}
          </motion.button>
        </GlassCard>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <CodeBlock code={`char name[20];          // array of 20 chars\n\n// Initialize with literal\nchar s[] = "Hello";    // 6 chars: H,e,l,l,o,\\0\n\n// Input (scanf stops at whitespace)\nscanf("%s", name);     // No & needed\n\n// Input with spaces (reads whole line)\nfgets(name, 20, stdin);\n\n// Output\nprintf("Hello, %s!\\n", name);\nputs(name);            // also prints + newline\n\n// NULL terminator is crucial:\n// printf reads until it finds \\0\n// Without it: undefined behavior`} highlightLine={3} />
          <InsightBlock title="NULL TERMINATOR IS NOT OPTIONAL" color={T.neon3} icon="⚠">
            {"C strings don't store their length. Functions like printf, strlen, strcpy scan byte by byte until they hit "}<span style={{ color: T.neon3 }}>\\0</span>{".\n\nNo \\0 = function keeps reading past your array into random memory → crash or data leak."}
          </InsightBlock>
          <InsightBlock title="scanf needs no & for strings" color={T.neon2} icon="💡">
            {"For %d: scanf(\"%d\", &x) — we need address of x\nFor %s: scanf(\"%s\", name) — name IS already a pointer\n\n"}<span style={{ color: T.neon3 }}>No bounds check</span>{" — use scanf(\"%19s\", name) to limit input size."}
          </InsightBlock>
        </div>
      </div>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 11 — STRING FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────
function StringFunctionsSection() {
  const [strA, setStrA] = useState("Hello");
  const [strB, setStrB] = useState("World");
  const [fn, setFn] = useState("strlen");
  const [animStep, setAnimStep] = useState(-1);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const runningRef = useRef(false);

  const strFns = {
    strlen: { label: "strlen", color: T.neon, desc: "Counts chars until \\0", sig: "size_t strlen(const char *s)", getChars: (a) => [...a.split(""), "\0"], run: async (a) => { for (let i = 0; i <= a.length; i++) { if (!runningRef.current) return; setAnimStep(i); await new Promise(r => setTimeout(r, 350)); } setResult(a.length); setAnimStep(-1); }, code: (a) => `strlen("${a}") = ${a.length}` },
    strcpy: { label: "strcpy", color: T.neon2, desc: "Copies src into dest char by char", sig: "char* strcpy(char *dest, const char *src)", getChars: (a) => [...a.split(""), "\0"], run: async (a) => { for (let i = 0; i <= a.length; i++) { if (!runningRef.current) return; setAnimStep(i); await new Promise(r => setTimeout(r, 300)); } setResult(a); setAnimStep(-1); }, code: (a) => `char dest[50];\nstrcpy(dest, "${a}");\n// dest = "${a}"` },
    strcmp: { label: "strcmp", color: T.accent, desc: "Compares two strings lexicographically", sig: "int strcmp(const char *s1, const char *s2)", getChars: (a) => [...a.split(""), "\0"], run: async (a, b) => { const len = Math.min(a.length, b.length); for (let i = 0; i < len; i++) { if (!runningRef.current) return; setAnimStep(i); await new Promise(r => setTimeout(r, 350)); if (a[i] !== b[i]) { setResult(a.charCodeAt(i) - b.charCodeAt(i)); setAnimStep(-1); return; } } setResult(a.length - b.length); setAnimStep(-1); }, code: (a, b) => `strcmp("${a}", "${b}") = ${a < b ? "negative (s1 < s2)" : a > b ? "positive (s1 > s2)" : "0 (equal)"}` },
    strcat: { label: "strcat", color: T.neon4, desc: "Appends src to end of dest", sig: "char* strcat(char *dest, const char *src)", getChars: (a, b) => [...a.split(""), ...b.split("")], run: async (a, b) => { const combined = a + b; for (let i = 0; i < combined.length; i++) { if (!runningRef.current) return; setAnimStep(i); await new Promise(r => setTimeout(r, 250)); } setResult(combined); setAnimStep(-1); }, code: (a, b) => `char s[50] = "${a}";\nstrcat(s, "${b}");\n// s = "${a + b}"` },
  };
  const f = strFns[fn];

  const runFn = async () => {
    if (runningRef.current) return;
    runningRef.current = true; setRunning(true); setResult(null); setAnimStep(-1);
    await f.run(strA, strB);
    setRunning(false); runningRef.current = false;
  };

  const displayChars = f.getChars(strA, strB);

  return (
    <Section id="str-fns">
      <SectionHeader num="11" tag="STRINGS · FUNCTIONS" title="string.h Visualizer" subtitle="strlen, strcpy, strcmp, strcat — animated char by char" />
      <div style={{ display: "flex", gap: 10, marginBottom: 22, flexWrap: "wrap" }}>
        {Object.entries(strFns).map(([k, v]) => <Pill key={k} color={v.color} active={fn === k} onClick={() => { setFn(k); setAnimStep(-1); setResult(null); runningRef.current = false; setRunning(false); }}>{v.label}()</Pill>)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
        <GlassCard style={{ padding: 28 }}>
          <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 4, color: f.color, marginBottom: 20 }}>🛠 {f.label.toUpperCase()}() SIMULATION</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
            <div>
              <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, marginBottom: 5 }}>String A</div>
              <input value={strA} onChange={e => { setStrA(e.target.value.slice(0, 10)); setResult(null); setAnimStep(-1); runningRef.current = false; setRunning(false); }}
                style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: `1px solid ${f.color}30`, borderRadius: 7, padding: "8px 12px", fontFamily: T.mono, fontSize: 14, color: f.color, outline: "none" }} />
            </div>
            {(fn === "strcmp" || fn === "strcat") && (
              <div>
                <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, marginBottom: 5 }}>String B</div>
                <input value={strB} onChange={e => { setStrB(e.target.value.slice(0, 10)); setResult(null); setAnimStep(-1); runningRef.current = false; setRunning(false); }}
                  style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: `1px solid ${T.neon2}30`, borderRadius: 7, padding: "8px 12px", fontFamily: T.mono, fontSize: 14, color: T.neon2, outline: "none" }} />
              </div>
            )}
          </div>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, marginBottom: 8 }}>{fn === "strcmp" ? "Comparison:" : fn === "strcpy" ? "Copy progress:" : fn === "strcat" ? "Build progress:" : "Scanning:"}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {displayChars.map((ch, i) => {
                const isNull = ch === "\0"; const isSep = fn === "strcat" && i === strA.length;
                const isScanned = animStep >= 0 && i <= animStep; const isCurrent = animStep === i;
                return (
                  <motion.div key={i} animate={{ background: isCurrent ? `${f.color}35` : isScanned ? `${f.color}15` : `${T.neon}06`, borderColor: isCurrent ? f.color : isScanned ? `${f.color}50` : `${T.neon}20`, boxShadow: isCurrent ? `0 0 14px ${f.color}60` : "none", scale: isCurrent ? 1.18 : 1 }}
                    style={{ width: 34, height: 38, border: "1px solid", borderRadius: 6, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", marginLeft: isSep ? 8 : 0 }}>
                    <span style={{ fontFamily: T.mono, fontSize: isNull ? 9 : 13, fontWeight: 700, color: isCurrent ? f.color : isScanned ? T.text : T.muted }}>{ch === "\0" ? "\\0" : ch}</span>
                  </motion.div>
                );
              })}
            </div>
          </div>
          <AnimatePresence>
            {result !== null && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                style={{ padding: "14px", borderRadius: 10, marginBottom: 14, background: `${f.color}15`, border: `2px solid ${f.color}`, textAlign: "center", boxShadow: `0 0 30px ${f.color}30` }}>
                <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, marginBottom: 4 }}>RESULT</div>
                <div style={{ fontFamily: T.display, fontSize: 22, fontWeight: 800, color: f.color }}>{typeof result === "number" ? fn === "strcmp" ? `${result} (${result < 0 ? "A < B" : result > 0 ? "A > B" : "A == B"})` : result : `"${result}"`}</div>
              </motion.div>
            )}
          </AnimatePresence>
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} onClick={runFn} disabled={running}
            style={{ width: "100%", fontFamily: T.display, fontWeight: 700, fontSize: 11, letterSpacing: 3, color: "#000", background: running ? T.muted : `linear-gradient(135deg, ${f.color}, ${T.neon2})`, border: "none", borderRadius: 8, padding: "12px", cursor: running ? "not-allowed" : "pointer" }}>
            {running ? `${f.label}() RUNNING...` : `▶ CALL ${f.label}("${strA}"${fn === "strcmp" || fn === "strcat" ? `, "${strB}"` : ""})`}
          </motion.button>
        </GlassCard>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <CodeBlock code={`#include <string.h>\n\nchar a[50] = "${strA}";\nchar b[50] = "${strB}";\n\n// strlen — count chars\nsize_t len = strlen(a);       // ${strA.length}\n\n// strcpy — copy string\nstrcpy(a, b);                 // a = "${strB}"\n\n// strcmp — compare (0 if equal)\nint cmp = strcmp(a, b);\n\n// strcat — concatenate\nstrcat(a, b);                 // "${strA + strB}"`} highlightLine={fn === "strlen" ? 6 : fn === "strcpy" ? 9 : fn === "strcmp" ? 12 : 15} />
          <InsightBlock title="DANGER: Buffer Overflow" color={T.neon3} icon="⚠">
            {"strcpy, strcat, gets — these are "}<span style={{ color: T.neon3 }}>unsafe</span>{". They don't check if dest is big enough.\n\nPrefer: "}<span style={{ color: T.neon }}>strncpy, strncat, fgets</span>{" — they take a max-length argument.\n\nBuffer overflow is the #1 C security vulnerability."}
          </InsightBlock>
          <InsightBlock title="strcmp returns 0, not false" color={T.neon2} icon="💡">
            {"if (strcmp(a, b)) → TRUE when strings DIFFER, FALSE when equal!\n\nCorrect: if ("}<span style={{ color: T.neon }}>strcmp(a, b) == 0</span>{") — explicit comparison with 0."}
          </InsightBlock>
        </div>
      </div>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 12 — MASTER ENGINE
// ─────────────────────────────────────────────────────────────────────────────
const ENGINE_PROGS = [
  { name: "FUNCTION CALL", color: T.neon, lines: [`int square(int n) { return n * n; }`, ``, `int main() {`, `  int x = 5;`, `  int result = square(x);`, `  printf("%d", result);`, `  return 0;`, `}`], steps: [{ line: 2, mem: {}, out: "" }, { line: 3, mem: { x: 5 }, out: "" }, { line: 4, mem: { x: 5, "square(5)": "..." }, out: "" }, { line: 0, mem: { x: 5, n: 5, "n*n": 25 }, out: "" }, { line: 4, mem: { x: 5, result: 25 }, out: "" }, { line: 5, mem: { x: 5, result: 25 }, out: "25" }] },
  { name: "ARRAY TRAVERSAL", color: T.neon2, lines: [`int arr[] = {3, 7, 1, 9, 4};`, `int sum = 0;`, ``, `for (int i = 0; i < 5; i++) {`, `  sum += arr[i];`, `}`, ``, `printf("Sum: %d", sum);`], steps: [{ line: 0, mem: { arr: "[3,7,1,9,4]" }, out: "" }, { line: 1, mem: { arr: "[3,7,1,9,4]", sum: 0 }, out: "" }, { line: 3, mem: { arr: "[3,7,1,9,4]", sum: 0, i: 0 }, out: "" }, { line: 4, mem: { arr: "[3,7,1,9,4]", sum: 3, i: 0 }, out: "" }, { line: 4, mem: { arr: "[3,7,1,9,4]", sum: 10, i: 1 }, out: "" }, { line: 4, mem: { arr: "[3,7,1,9,4]", sum: 11, i: 2 }, out: "" }, { line: 4, mem: { arr: "[3,7,1,9,4]", sum: 20, i: 3 }, out: "" }, { line: 4, mem: { arr: "[3,7,1,9,4]", sum: 24, i: 4 }, out: "" }, { line: 7, mem: { arr: "[3,7,1,9,4]", sum: 24 }, out: "Sum: 24" }] },
  { name: "STRING OPS", color: T.neon4, lines: [`char name[20];`, `scanf("%s", name);`, `int len = strlen(name);`, ``, `if (len > 5)`, `  printf("Long name!");`, `else`, `  printf("Short: %s", name);`], steps: [{ line: 0, mem: { name: `"?"` }, out: "" }, { line: 1, mem: { name: `"Alice"` }, out: "" }, { line: 2, mem: { name: `"Alice"`, len: 5 }, out: "" }, { line: 4, mem: { name: `"Alice"`, len: 5 }, out: "" }, { line: 7, mem: { name: `"Alice"`, len: 5 }, out: `Short: Alice` }] },
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
    reset(); await new Promise(r => setTimeout(r, 80));
    runningRef.current = true; setRunning(true);
    for (let i = 0; i < prog.steps.length; i++) {
      if (!runningRef.current) break;
      const s = prog.steps[i]; setStep(s.line); setMemory({ ...s.mem }); if (s.out) setOutput(s.out);
      await new Promise(r => setTimeout(r, 800));
    }
    setStep(-1); setRunning(false); runningRef.current = false;
  };

  return (
    <Section id="engine">
      <SectionHeader num="12" tag="MASTER ENGINE · FULL SIMULATION" title="End-to-End Execution Engine" subtitle="Functions, arrays, and strings working together in real programs" />
      <div style={{ display: "flex", gap: 10, marginBottom: 28, flexWrap: "wrap" }}>
        {ENGINE_PROGS.map((p, i) => <Pill key={p.name} color={p.color} active={progIdx === i} onClick={() => { setProgIdx(i); reset(); }}>{p.name}</Pill>)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
        <GlassCard style={{ overflow: "hidden" }}>
          <div style={{ background: "rgba(0,0,0,0.45)", borderBottom: `1px solid ${T.dim}`, padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <motion.div animate={{ background: running ? prog.color : T.muted, boxShadow: running ? `0 0 10px ${prog.color}` : "none" }} style={{ width: 7, height: 7, borderRadius: "50%" }} />
              <span style={{ fontFamily: T.mono, fontSize: 9, color: T.muted }}>{prog.name.toLowerCase().replace(/ /g, "_")}.c</span>
            </div>
            <div style={{ display: "flex", gap: 7 }}>
              <motion.button whileTap={{ scale: 0.95 }} onClick={run} disabled={running}
                style={{ fontFamily: T.display, fontWeight: 700, fontSize: 9, letterSpacing: 2, color: "#000", background: running ? T.muted : prog.color, border: "none", borderRadius: 4, padding: "5px 14px", cursor: running ? "not-allowed" : "pointer" }}>
                {running ? "RUNNING…" : "▶ RUN"}
              </motion.button>
              <motion.button whileTap={{ scale: 0.95 }} onClick={reset}
                style={{ fontFamily: T.mono, fontWeight: 700, fontSize: 9, color: T.muted, background: "transparent", border: `1px solid ${T.dim}`, borderRadius: 4, padding: "5px 11px", cursor: "pointer" }}>RESET</motion.button>
            </div>
          </div>
          <div style={{ padding: "14px 0" }}>
            {prog.lines.map((line, i) => {
              const isActive = step === i;
              return (
                <motion.div key={i} animate={{ background: isActive ? `${prog.color}18` : "transparent", paddingLeft: isActive ? 22 : 16 }}
                  style={{ display: "flex", alignItems: "center", paddingRight: 16, paddingTop: 2, paddingBottom: 2, borderLeft: `2px solid ${isActive ? prog.color : "transparent"}` }}>
                  <span style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, minWidth: 24, textAlign: "right", marginRight: 14, userSelect: "none" }}>{i + 1}</span>
                  <span style={{ fontFamily: T.mono, fontSize: 12, color: isActive ? prog.color : T.text, whiteSpace: "pre" }}>{line}</span>
                  {isActive && <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 0.5, repeat: Infinity }} style={{ fontFamily: T.mono, fontSize: 8, color: prog.color, marginLeft: "auto", letterSpacing: 2 }}>◀ NOW</motion.span>}
                </motion.div>
              );
            })}
          </div>
        </GlassCard>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <GlassCard style={{ padding: 0, overflow: "hidden", flex: 1 }}>
            <div style={{ background: "rgba(0,0,0,0.4)", borderBottom: `1px solid ${T.dim}`, padding: "10px 16px", fontFamily: T.mono, fontSize: 8, letterSpacing: 3, color: T.neon2 }}>MEMORY (STACK)</div>
            <div style={{ padding: "16px", minHeight: 120 }}>
              {Object.keys(memory).length === 0 ? <div style={{ fontFamily: T.mono, fontSize: 11, color: T.muted }}>No variables yet...</div> : Object.entries(memory).map(([k, v]) => (
                <motion.div key={k} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} style={{ display: "flex", alignItems: "center", gap: 12, fontFamily: T.mono, fontSize: 12, marginBottom: 10 }}>
                  <span style={{ color: T.neon2, minWidth: 70 }}>{k}</span>
                  <motion.div key={String(v)} initial={{ scale: 1.4, color: prog.color }} animate={{ scale: 1, color: T.text }}
                    style={{ background: `${prog.color}15`, border: `1px solid ${prog.color}40`, borderRadius: 5, padding: "3px 12px", fontWeight: 700, fontFamily: T.mono, fontSize: 12 }}>{String(v)}</motion.div>
                </motion.div>
              ))}
            </div>
          </GlassCard>
          <GlassCard style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ background: "rgba(0,0,0,0.4)", borderBottom: `1px solid ${T.dim}`, padding: "10px 16px", fontFamily: T.mono, fontSize: 8, letterSpacing: 3, color: T.neon3 }}>TERMINAL OUTPUT</div>
            <div style={{ padding: "14px 16px", minHeight: 64 }}>
              {output ? <motion.pre initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ fontFamily: T.mono, fontSize: 14, color: "#C3E88D", lineHeight: 1.9 }}>{output}</motion.pre> : <span style={{ fontFamily: T.mono, fontSize: 11, color: T.muted }}>{running ? "executing..." : "press ▶ RUN to see output"}</span>}
            </div>
          </GlassCard>
          <GlassCard style={{ padding: 0, overflow: "hidden", height: 160 }} hover={false}>
            <div style={{ padding: "8px 14px", borderBottom: `1px solid ${T.dim}`, fontFamily: T.mono, fontSize: 8, color: prog.color, letterSpacing: 4 }}>3D MEMORY VISUALIZATION</div>
            <Canvas camera={{ position: [0, 0, 7], fov: 55 }} style={{ height: 125 }}>
              <ambientLight intensity={0.35} /><pointLight position={[5, 5, 5]} color={prog.color} intensity={1.5} />
              <Suspense fallback={null}><StackFrames3D frames={Object.keys(memory).map((k) => ({ n: k, status: "waiting" }))} /></Suspense>
              <Stars radius={50} depth={18} count={300} factor={2} saturation={0} fade speed={0.4} />
            </Canvas>
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
  const phases = ["functions decompose complexity", "arrays pack data in contiguous memory", "strings are char arrays ending with \\0", "this page is a live execution engine for C"];

  useEffect(() => { const iv = setInterval(() => setPhase(p => (p + 1) % phases.length), 2800); return () => clearInterval(iv); }, []);

  const TOPICS = [
    { label: "Why Functions", icon: "🔷", color: T.neon }, { label: "Call Stack", icon: "📚", color: T.neon2 }, { label: "Fn Types", icon: "⚙", color: T.neon4 }, { label: "Scope", icon: "🔭", color: T.accent }, { label: "Recursion", icon: "🌀", color: T.neon3 },
    { label: "1D Arrays", icon: "▦", color: T.neon }, { label: "2D Arrays", icon: "⊞", color: T.neon2 }, { label: "Traversal", icon: "→", color: T.neon4 }, { label: "Array Problems", icon: "🧮", color: T.accent }, { label: "Strings", icon: "🔤", color: T.neon3 }, { label: "string.h", icon: "🛠", color: T.neon },
  ];

  return (
    <section id="hero" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", background: `radial-gradient(ellipse 90% 60% at 50% -10%, rgba(0,255,163,0.07) 0%, transparent 65%), radial-gradient(ellipse 60% 40% at 90% 70%, rgba(189,105,255,0.05) 0%, transparent 60%), radial-gradient(ellipse 40% 30% at 10% 80%, rgba(0,212,255,0.04) 0%, transparent 60%), ${T.bg}` }}>
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
          <Suspense fallback={null}><ParticleField /></Suspense>
          <Stars radius={120} depth={60} count={800} factor={3} saturation={0} fade speed={0.3} />
        </Canvas>
      </div>
      <div style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none", backgroundImage: `linear-gradient(rgba(0,255,163,0.016) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,163,0.016) 1px, transparent 1px)`, backgroundSize: "52px 52px" }} />
      <div style={{ position: "relative", zIndex: 10, textAlign: "center", maxWidth: 880, padding: "0 24px" }}>
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: T.mono, fontSize: 9, letterSpacing: 5, color: T.neon, border: `1px solid ${T.border}`, background: "rgba(0,255,163,0.04)", padding: "6px 20px", borderRadius: 100, marginBottom: 28 }}>
          <motion.span animate={{ opacity: [1, 0.2, 1], scale: [1, 0.7, 1] }} transition={{ duration: 1.2, repeat: Infinity }} style={{ width: 5, height: 5, borderRadius: "50%", background: T.neon, display: "inline-block" }} />
          FUNCTIONS + ARRAYS + STRINGS
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 36 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          style={{ fontFamily: T.display, fontWeight: 800, fontSize: "clamp(52px, 9vw, 104px)", lineHeight: 0.92, letterSpacing: -4, color: T.text, marginBottom: 20 }}>
          C<br />
          <motion.span animate={{ textShadow: [`0 0 60px ${T.accent}80`, `0 0 80px ${T.accent}A0`, `0 0 60px ${T.accent}80`] }} transition={{ duration: 2.5, repeat: Infinity }} style={{ color: T.accent }}>CHAP 4</motion.span><br />
          <span style={{ color: T.muted, fontSize: "0.29em", letterSpacing: 8, fontWeight: 400, fontFamily: T.mono }}>FUNCTIONS · ARRAYS · STRINGS</span>
        </motion.h1>
        <div style={{ height: 28, marginBottom: 32, overflow: "hidden" }}>
          <AnimatePresence mode="wait">
            <motion.p key={phase} initial={{ y: 18, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -18, opacity: 0 }} transition={{ duration: 0.35 }}
              style={{ fontFamily: T.mono, fontSize: 13, color: T.neon2, letterSpacing: 1 }}>→ {phases[phase]}</motion.p>
          </AnimatePresence>
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
          style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8, marginBottom: 40 }}>
          {TOPICS.map((t, i) => (
            <motion.div key={t.label} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.7 + i * 0.05 }}
              whileHover={{ y: -4, boxShadow: `0 8px 30px ${t.color}40` }}
              style={{ padding: "8px 16px", borderRadius: 8, background: `${t.color}10`, border: `1px solid ${t.color}30`, fontFamily: T.mono, fontSize: 10, color: t.color, display: "flex", alignItems: "center", gap: 6 }}>
              {t.icon} {t.label}
            </motion.div>
          ))}
        </motion.div>
        <motion.button initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }}
          whileHover={{ scale: 1.06, boxShadow: `0 0 50px ${T.accent}60` }} whileTap={{ scale: 0.96 }}
          onClick={() => document.getElementById("why-fn")?.scrollIntoView({ behavior: "smooth" })}
          style={{ fontFamily: T.display, fontWeight: 700, fontSize: 12, letterSpacing: 4, color: "#000", background: `linear-gradient(135deg, ${T.neon}, ${T.accent})`, border: "none", borderRadius: 7, padding: "15px 44px", cursor: "pointer" }}>
          START DATA ENGINE
        </motion.button>
      </div>
      <motion.div animate={{ y: [0, 9, 0] }} transition={{ duration: 2.2, repeat: Infinity }}
        style={{ position: "absolute", bottom: 30, zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", gap: 5, fontFamily: T.mono, fontSize: 8, letterSpacing: 5, color: T.muted }}>
        SCROLL
      </motion.div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DEEP UNDERSTANDING DATA
// ─────────────────────────────────────────────────────────────────────────────
const DEEP = {
  hero:         { title: "Chapter 4",     color: T.neon,   why: "Functions, arrays, and strings are the foundation of all real C programs. Master these and you can build anything.", mistake: "Treating these as separate topics. In real code, functions operate on arrays of strings — they always work together.", model: "Functions = verbs. Arrays = nouns (collections). Strings = labeled data. Programs combine all three." },
  "why-fn":     { title: "Why Functions", color: T.neon,   why: "Every function enforces a contract: same input always gives same output. This predictability is the bedrock of reliable software.", mistake: "God functions — one 500-line function that does everything. Unmaintainable, untestable.", model: "If you can't describe a function in one sentence, it's doing too much. Split it." },
  "fn-anatomy": { title: "Fn Anatomy",    color: T.neon2,  why: "Arguments are COPIED into parameters (pass-by-value). The function operates on copies — the original is safe. Pointers change this rule.", mistake: "Assuming the function modifies your original variable. It doesn't unless you pass a pointer.", model: "Function call = create new stack frame + copy args + execute + destroy frame + return value." },
  "fn-types":   { title: "Fn Types",      color: T.neon4,  why: "The arg/return taxonomy tells you the function's relationship with the outside world. Pure functions (arg+return) are the safest and most testable.", mistake: "Mixing I/O with logic in the same function — printf inside a calculation function.", model: "Separate concerns: one function computes, one displays. Never both." },
  scope:        { title: "Scope",          color: T.accent, why: "Scope prevents name collisions and controls lifetime. Without it, all variables would fight for global namespace.", mistake: "Shadowing: declaring a local var with same name as global. Compiles fine but causes subtle logic bugs.", model: "Think in lifetime: 'this variable exists from declaration to its closing brace.'" },
  recursion:    { title: "Recursion",      color: T.neon4,  why: "Recursion is not magic — it's the call stack doing bookkeeping. Each call is an entirely separate function execution.", mistake: "Forgetting the base case. Without it: infinite recursion → stack overflow → crash.", model: "Trust the recursion. Define base case. Assume it works for n-1. Use it for n. That's all." },
  "arrays-1d":  { title: "1D Arrays",     color: T.neon,   why: "Arrays are contiguous memory — the CPU can access arr[i] in O(1) by simple pointer arithmetic: base + i*sizeof(type).", mistake: "arr[n] — reading one past the end. C won't stop you. You'll read garbage or crash.", model: "Array = address of first element. Index = offset. arr[i] = *(arr + i)." },
  "arrays-2d":  { title: "2D Arrays",     color: T.neon2,  why: "2D arrays are still flat in memory — row by row. m[r][c] = *(m + r*COLS + c). Matrix is an illusion on top of a 1D array.", mistake: "Column traversal in loops — skips COLS×4 bytes each step, causing cache misses.", model: "Row-major: adjacent elements in a row are adjacent in memory. Prefer row traversal." },
  traversal:    { title: "Traversal",      color: T.neon,   why: "Array traversal is O(n) — there's no shortcut to touch every element. The question is only how you express it.", mistake: "i <= n instead of i < n — classic off-by-one, reads one past the end.", model: "Pointer-based and index-based traversal compile to the same machine code." },
  "array-probs":{ title: "Array Probs",   color: T.neon4,  why: "Sum, max, reverse are the building blocks of all algorithms. Master these and sorting, searching, and dynamic programming follow naturally.", mistake: "Not resetting accumulators between runs, or using wrong initial value for max.", model: "For max: start with arr[0], not 0. Starting with 0 fails if all values are negative." },
  strings:      { title: "Strings",        color: T.neon2,  why: "Strings have no length field — the null terminator IS the length marker. strlen() traverses until it finds \\0.", mistake: "char s[5] = \"Hello\" — no room for \\0! Needs [6]. Silent buffer overflow.", model: "Always allocate strlen(s) + 1 bytes — the +1 is for \\0." },
  "str-fns":    { title: "String Fns",     color: T.neon3,  why: "string.h functions are fast (often hand-optimized in libc) but they trust YOU to provide valid null-terminated strings.", mistake: "if (strcmp(a, b)) — this is TRUE when strings differ, FALSE when equal! strcmp returns 0 on match.", model: "Always use strncpy/strncat over strcpy/strcat. The 'n' variants prevent buffer overflow." },
  engine:       { title: "Full Engine",    color: T.neon,   why: "Real programs combine all of these: functions that operate on arrays of strings. They're inseparable in practice.", mistake: "Passing arrays to functions — you're passing a pointer, not a copy. Changes inside the function affect the original!", model: "Master functions + arrays + strings and you're ready for pointers, structs, and file I/O." },
};

// ─────────────────────────────────────────────────────────────────────────────
// SIDEBAR — width reduced by ~16% (378px → 318px)
// ─────────────────────────────────────────────────────────────────────────────
function Sidebar({ activeSection }) {
  const data = DEEP[activeSection] || DEEP.hero;
  const [liveTime, setLiveTime] = useState(0);

  useEffect(() => { const iv = setInterval(() => setLiveTime(t => t + 1), 1000); return () => clearInterval(iv); }, []);

  return (
    <aside style={{
      width: 318,
      minWidth: 318,
      flexShrink: 0,
      background: `linear-gradient(180deg, ${T.bg1} 0%, ${T.bg} 100%)`,
      borderRight: `1px solid ${T.dim}`,
      padding: "26px 12px",
      display: "flex", flexDirection: "column", gap: 12,
      overflowY: "auto", overflowX: "hidden",
      position: "sticky", top: 0, height: "100vh",
    }}>
      <div>
        <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 5, color: T.neon, marginBottom: 8 }}>DEEP UNDERSTANDING</div>
        <div style={{ height: 1, background: `linear-gradient(90deg, ${T.neon}35, transparent)` }} />
      </div>

      {/* Live stats */}
      <div style={{ background: `${T.neon}05`, border: `1px solid ${T.neon}18`, borderRadius: 8, padding: "10px 11px" }}>
        <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 4, color: T.neon, marginBottom: 8 }}>⚙ LIVE</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[
            { label: "SECTION", value: (activeSection || "hero").toUpperCase().slice(0, 8), color: data.color },
            { label: "UPTIME",  value: `${liveTime}s`, color: T.neon2 },
            { label: "TOPICS",  value: "12", color: T.neon4 },
            { label: "ENGINE",  value: "LIVE", color: T.neon },
          ].map(({ label, value, color }) => (
            <div key={label}>
              <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 2, color: T.muted }}>{label}</div>
              <motion.div key={value} initial={{ opacity: 0.5 }} animate={{ opacity: 1 }} style={{ fontFamily: T.mono, fontSize: 12, fontWeight: 700, color }}>{value}</motion.div>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeSection} initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -14 }} transition={{ duration: 0.3 }}
          style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ padding: "12px 12px", borderRadius: 10, background: `${data.color}10`, border: `1px solid ${data.color}30` }}>
            <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 3, color: data.color, marginBottom: 4 }}>CURRENT TOPIC</div>
            <div style={{ fontFamily: T.display, fontSize: 17, fontWeight: 800, color: data.color }}>{data.title}</div>
          </div>
          <div style={{ padding: "13px 12px", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: `1px solid ${T.dim}` }}>
            <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 3, color: T.neon, marginBottom: 8 }}>💡 WHY THIS WORKS</div>
            <div style={{ fontFamily: T.mono, fontSize: 10.5, color: T.text, lineHeight: 1.8 }}>{data.why}</div>
          </div>
          <div style={{ padding: "13px 12px", borderRadius: 10, background: `${T.neon3}08`, border: `1px solid ${T.neon3}25` }}>
            <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 3, color: T.neon3, marginBottom: 8 }}>⚠ COMMON MISTAKE</div>
            <div style={{ fontFamily: T.mono, fontSize: 10.5, color: T.text, lineHeight: 1.8 }}>{data.mistake}</div>
          </div>
          <div style={{ padding: "13px 12px", borderRadius: 10, background: `${data.color}08`, border: `1px solid ${data.color}20` }}>
            <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 3, color: data.color, marginBottom: 8 }}>🧠 MENTAL MODEL</div>
            <div style={{ fontFamily: T.mono, fontSize: 10.5, color: T.text, lineHeight: 1.8, fontStyle: "italic" }}>"{data.model}"</div>
          </div>
        </motion.div>
      </AnimatePresence>

    

      {/* ========== VOICE PLAYER (now at bottom of sidebar) ========== */}
      <VoicePlayer activeSection={activeSection} />
    </aside>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RIGHT PANEL
// ─────────────────────────────────────────────────────────────────────────────
function RightPanel({ activeSection }) {
  return (
    <aside style={{
      width: "16%", minWidth: 160, flexShrink: 0,
      background: `linear-gradient(180deg, ${T.bg1} 0%, ${T.bg} 100%)`,
      borderLeft: `1px solid ${T.dim}`,
      display: "flex", flexDirection: "column",
      padding: "26px 0",
      position: "sticky", top: 0, height: "100vh",
      overflow: "hidden",
    }}>
      <div style={{ padding: "0 16px 20px" }}>
        <div style={{ fontFamily: T.display, fontWeight: 800, fontSize: 16, letterSpacing: 2, color: T.neon }}>C</div>
        <div style={{ fontFamily: T.mono, fontSize: 7, letterSpacing: 4, color: T.muted, marginTop: 2 }}>CH.4 · DATA ENGINE</div>
      </div>
      <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${T.neon}35, transparent)`, marginBottom: 12 }} />
      <nav style={{ overflowY: "auto", flex: 1 }}>
        {NAV_ITEMS.map(item => {
          const isActive = activeSection === item.id;
          return (
            <motion.a key={item.id} href={`#${item.id}`}
              onClick={e => { e.preventDefault(); document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" }); }}
              animate={{ color: isActive ? T.neon : T.muted, background: isActive ? `${T.neon}07` : "transparent" }}
              whileHover={{ color: T.text, paddingLeft: 22 }} transition={{ duration: 0.2 }}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 16px", fontFamily: T.mono, fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textDecoration: "none", borderLeft: `2px solid ${isActive ? T.neon : "transparent"}` }}>
              <span style={{ fontSize: 10 }}>{item.icon}</span>
              <div>
                <div style={{ fontSize: 7, opacity: 0.4, marginBottom: 1 }}>{item.num}</div>
                {item.label}
              </div>
              {isActive && <motion.div layoutId="nav-dot-c4" style={{ width: 4, height: 4, borderRadius: "50%", background: T.neon, marginLeft: "auto" }} />}
            </motion.a>
          );
        })}
      </nav>
      <div style={{ marginTop: "auto", padding: "14px 16px 20px", borderTop: `1px solid ${T.dim}`, display: "flex", flexDirection: "column", gap: 12 }}>
        <div>
          <div style={{ fontFamily: T.mono, fontSize: 7, letterSpacing: 3, color: T.muted, marginBottom: 6 }}>COURSE PROGRESS</div>
          <div style={{ height: 2, background: T.dim, borderRadius: 2, overflow: "hidden" }}>
            <motion.div style={{ height: "100%", width: "57.1%", background: `linear-gradient(90deg, ${T.neon}, ${T.neon2})`, borderRadius: 2 }} />
          </div>
          <div style={{ fontFamily: T.mono, fontSize: 8, color: T.neon, marginTop: 4 }}>4 / 7 complete</div>
        </div>
        <Link href="/c-3" passHref legacyBehavior>
          <motion.a whileHover={{ x: -4, borderColor: T.neon }}
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: T.mono, fontSize: 8, letterSpacing: 1.5, fontWeight: 700, color: T.neon2, textDecoration: "none", background: "rgba(0,212,255,0.05)", border: `1px solid ${T.neon2}30`, borderRadius: 6, padding: "6px 10px", transition: "all 0.2s" }}>
            <span>← PREV</span>
            <span style={{ color: T.text, letterSpacing: 0, fontSize: 7 }}>OPERATORS &amp; CONTROL FLOW</span>
          </motion.a>
        </Link>
        <Link href="/c-5" passHref legacyBehavior>
          <motion.a whileHover={{ x: 4, borderColor: T.neon }}
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: T.mono, fontSize: 8, letterSpacing: 1.5, fontWeight: 700, color: T.neon, textDecoration: "none", background: "rgba(0,255,163,0.05)", border: `1px solid ${T.neon}30`, borderRadius: 6, padding: "6px 10px", transition: "all 0.2s" }}>
            <span>NEXT →</span>
            <span style={{ color: T.text, letterSpacing: 0, fontSize: 7 }}>POINTERS &amp; STRUCTS</span>
          </motion.a>
        </Link>
      </div>
    </aside>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ROOT PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function C4Page() {
  const [activeSection, setActiveSection] = useState("hero");

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => { entries.forEach(e => { if (e.isIntersecting) setActiveSection(e.target.id); }); },
      { threshold: 0.25, rootMargin: "-10% 0px -10% 0px" }
    );
    NAV_ITEMS.forEach(item => { const el = document.getElementById(item.id); if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=JetBrains+Mono:ital,wght@0,300;0,500;0,700;1,400&display=swap');
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
        <Sidebar activeSection={activeSection} />

        <main style={{ flex: 1, overflowY: "auto", overflowX: "hidden", minWidth: 0 }}>
          <div style={{ maxWidth: "100%", padding: "0 36px" }}>
            <HeroSection />
            <WhyFunctionsSection />
            <FnAnatomySection />
            <FnTypesSection />
            <ScopeSection />
            <RecursionSection />
            <Arrays1DSection />
            <Arrays2DSection />
            <TraversalSection />
            <ArrayProblemsSection />
            <StringsSection />
            <StringFunctionsSection />
            <EngineSection />
            <div style={{ height: 80 }} />
          </div>
        </main>

        <RightPanel activeSection={activeSection} />
      </div>

    </>
  );
}