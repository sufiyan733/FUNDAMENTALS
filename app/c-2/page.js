"use client";

/**
 * C PROGRAMMING — FUNDAMENTALS PAGE (PAGE 2)
 * ============================================
 * Continuation of C Intro page. Same design system.
 * Next.js App Router → app/c-fundamentals/page.jsx
 *
 * Dependencies (same as page 1):
 *   npm install framer-motion gsap @gsap/react three @react-three/fiber @react-three/drei
 */

import { useState, useEffect, useRef, useCallback, useMemo, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, Float, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN TOKENS — identical to page 1
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
// DATA DEFINITIONS
// ─────────────────────────────────────────────────────────────────────────────
const DATA_TYPES = [
  {
    id: "char",
    label: "char",
    bytes: 1,
    color: T.neon,
    range: "-128 to 127",
    desc: "Stores a single character. 1 byte = 8 bits. Internally it's just a small integer mapped to ASCII.",
    why: "Each character in your keyboard has an ASCII code. 'A'=65, 'a'=97, '0'=48. char is just a tiny int.",
    example: "char c = 'A';  // stores 65",
    glowColor: "rgba(0,255,163,0.3)",
    blockSize: 1,
  },
  {
    id: "short",
    label: "short",
    bytes: 2,
    color: T.neon2,
    range: "-32,768 to 32,767",
    desc: "16-bit signed integer. Half the size of int. Used when memory is tight and values are small.",
    why: "Good for sensor data, audio samples, or when storing thousands of small values in an array.",
    example: "short s = 1000;",
    glowColor: "rgba(0,212,255,0.3)",
    blockSize: 2,
  },
  {
    id: "int",
    label: "int",
    bytes: 4,
    color: T.neon4,
    range: "-2.1B to 2.1B",
    desc: "32-bit signed integer. The workhorse of C. Most arithmetic defaults to int.",
    why: "CPU is natively optimized for 32-bit operations. int is the 'natural' size for most counters, indices, and math.",
    example: "int x = 42;",
    glowColor: "rgba(255,179,71,0.3)",
    blockSize: 4,
  },
  {
    id: "float",
    label: "float",
    bytes: 4,
    color: "#FF6FD8",
    range: "~±3.4×10³⁸ (7 digits)",
    desc: "32-bit IEEE 754 floating-point. Can represent fractions but with ~7 decimal digits of precision.",
    why: "The bits are split: 1 sign bit, 8 exponent bits, 23 mantissa bits. That's why 0.1 + 0.2 ≠ 0.3 exactly.",
    example: "float pi = 3.14159f;",
    glowColor: "rgba(255,111,216,0.3)",
    blockSize: 4,
  },
  {
    id: "double",
    label: "double",
    bytes: 8,
    color: T.accent,
    range: "~±1.8×10³⁰⁸ (15 digits)",
    desc: "64-bit IEEE 754 floating-point. Double the precision of float. Default for decimal literals.",
    why: "64 bits: 1 sign + 11 exponent + 52 mantissa. 15+ significant digits. Used in scientific computing.",
    example: "double d = 3.14159265358979;",
    glowColor: "rgba(189,105,255,0.3)",
    blockSize: 8,
  },
  {
    id: "long",
    label: "long long",
    bytes: 8,
    color: T.neon3,
    range: "-9.2×10¹⁸ to 9.2×10¹⁸",
    desc: "64-bit signed integer. For very large whole numbers. Use when int overflows.",
    why: "int max is ~2.1 billion. A 64-bit long long holds 9.2 quintillion. Never overflow a counter again.",
    example: "long long big = 9000000000LL;",
    glowColor: "rgba(255,107,107,0.3)",
    blockSize: 8,
  },
];

const FORMAT_SPECIFIERS = [
  { spec: "%d", type: "int", label: "Signed Integer", color: T.neon4, example: 42, output: "42" },
  { spec: "%f", type: "float", label: "Float (6 decimal places)", color: "#FF6FD8", example: 3.14, output: "3.140000" },
  { spec: "%.2f", type: "float", label: "Float (2 decimal places)", color: "#FF6FD8", example: 3.14159, output: "3.14" },
  { spec: "%c", type: "char", label: "Character", color: T.neon, example: 65, output: "A" },
  { spec: "%s", type: "string", label: "String", color: T.neon2, example: '"Hello"', output: "Hello" },
  { spec: "%x", type: "int", label: "Hexadecimal", color: T.accent, example: 255, output: "ff" },
  { spec: "%o", type: "int", label: "Octal", color: T.neon3, example: 8, output: "10" },
  { spec: "%p", type: "pointer", label: "Pointer Address", color: T.muted, example: "&x", output: "0x7ffd..." },
];

const NAV_ITEMS = [
  { id: "hero2",      label: "OVERVIEW",   num: "00", icon: "◎" },
  { id: "datatypes",  label: "DATA TYPES", num: "01", icon: "🧊" },
  { id: "variables",  label: "VARIABLES",  num: "02", icon: "📦" },
  { id: "io",         label: "I/O ENGINE", num: "03", icon: "⌨️" },
  { id: "formatspec", label: "FORMAT %",   num: "04", icon: "🔣" },
  { id: "stepexec",   label: "EXECUTION",  num: "05", icon: "▶" },
];

const DEEP_INSIGHTS_BY_SECTION = {
  hero2: [
    { icon: "🧠", title: "Memory is Just Bytes", body: "Everything in C — chars, ints, floats — is ultimately just bytes in RAM. The type tells the compiler how to interpret those bytes.", color: T.neon },
    { icon: "📐", title: "Type = Interpretation Rule", body: "The same 4 bytes that hold int 1078523331 also represent float 3.14 when cast. Type is just a lens over raw memory.", color: T.neon2 },
    { icon: "⚡", title: "Stack vs Heap", body: "Local variables live on the stack — ultra-fast, auto-freed. malloc() gives heap memory — persistent, manual. Most beginners only use the stack.", color: T.neon4 },
  ],
  datatypes: [
    { icon: "🔢", title: "Byte = 8 Bits", body: "A byte holds values 0–255 (unsigned) or -128 to 127 (signed). All data types are multiples of 1 byte.", color: T.neon },
    { icon: "💥", title: "Integer Overflow", body: "int max is 2,147,483,647. Add 1 and you get -2,147,483,648. This wraps silently — one of C's most dangerous behaviors.", color: T.neon3 },
    { icon: "🤔", title: "Why int vs float?", body: "Integers are exact. Floats are approximations. int 5 is exactly 5. float 5.0f might be 4.9999997 internally. Never use float for money.", color: T.neon4 },
    { icon: "📏", title: "Always Use sizeof()", body: "sizeof(int) is 4 on most systems but NOT guaranteed. sizeof() asks the compiler at compile time — always use it instead of hardcoding sizes.", color: T.accent },
  ],
  variables: [
    { icon: "📦", title: "Variable = Named Memory", body: "int x = 5 asks the OS for 4 bytes of stack space, names them 'x', and stores the value 5 there. The name is erased at compile time — it becomes an address.", color: T.neon2 },
    { icon: "🔒", title: "const ≠ immutable in C", body: "const tells the COMPILER to warn on reassignment, but you can still bypass it with pointers. It's a contract, not a hardware lock.", color: T.neon3 },
    { icon: "🕳️", title: "Uninitialized = Garbage", body: "int x; declares x but gives it whatever bytes were in that memory location. Reading uninitialized memory is undefined behavior.", color: T.neon4 },
    { icon: "🏠", title: "Variable Scope", body: "Variables live inside their { } block. Once you exit the block, the variable is gone. A variable in main() is invisible inside a function.", color: T.neon },
  ],
  io: [
    { icon: "📺", title: "stdout is Buffered", body: "printf doesn't always write immediately. Output is buffered for performance. Use fflush(stdout) or \\n to force a flush.", color: T.neon },
    { icon: "⚠️", title: "scanf & is Mandatory", body: "scanf needs the ADDRESS of the variable to store input. scanf(\"%d\", x) is wrong — it passes the value. scanf(\"%d\", &x) passes the address.", color: T.neon3 },
    { icon: "🛡️", title: "Buffer Overflow Risk", body: "scanf(\"%s\", str) has no bounds check. If input is longer than str[], it overwrites adjacent memory. Use scanf(\"%19s\", str) to limit.", color: T.neon4 },
    { icon: "↩️", title: "Return Value of scanf", body: "scanf returns the number of items successfully read. Always check it: if (scanf(\"%d\", &x) != 1) — error handling 101.", color: T.accent },
  ],
  formatspec: [
    { icon: "🔣", title: "Format String = Template", body: "printf(\"Value: %d\", x) — the format string is parsed left-to-right. Each % starts a conversion specifier. Values fill them in order.", color: T.neon },
    { icon: "💥", title: "Type Mismatch = Crash", body: "printf(\"%d\", 3.14f) reads 4 bytes of float as if they were int. The output is garbage — and in some cases, it corrupts the stack.", color: T.neon3 },
    { icon: "🎯", title: "Width & Precision", body: "printf(\"%10d\", 42) right-aligns 42 in 10 chars. printf(\"%.3f\", 3.14159) rounds to 3 decimal places. printf(\"%010d\", 42) zero-pads.", color: T.neon4 },
    { icon: "🔍", title: "Scanf is Stricter", body: "In scanf, %d skips whitespace before matching. %c does NOT skip whitespace — it reads the next character including newlines.", color: T.neon2 },
  ],
  stepexec: [
    { icon: "📋", title: "Declaration vs Definition", body: "int x; is a declaration (reserves memory). int x = 5; is a definition (reserves + initializes). In C, declaration without init leaves garbage.", color: T.neon },
    { icon: "🔄", title: "Assignment Creates a Copy", body: "int y = x; copies the VALUE of x into y. Changing y later does NOT change x. They're separate boxes in memory.", color: T.neon2 },
    { icon: "⏱️", title: "Execution is Sequential", body: "C runs top-to-bottom, one statement at a time. No magic concurrency. int x = 5; int y = x + 1; — x is definitely 5 when y is calculated.", color: T.neon4 },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// THREE.JS — SAME COMPONENTS AS PAGE 1
// ─────────────────────────────────────────────────────────────────────────────
function ParticleField() {
  const mesh = useRef();
  const positions = useMemo(() => {
    const arr = new Float32Array(3000 * 3);
    for (let i = 0; i < 3000; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 40;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 25;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 25;
    }
    return arr;
  }, []);
  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.y = state.clock.elapsedTime * 0.03;
      mesh.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.015) * 0.08;
    }
  });
  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#00FFA3" transparent opacity={0.45} sizeAttenuation />
    </points>
  );
}

function GlowOrb() {
  const mesh = useRef();
  useFrame((state) => {
    if (mesh.current) {
      mesh.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.4;
      mesh.current.rotation.z = state.clock.elapsedTime * 0.2;
    }
  });
  return (
    <Float speed={1.5} rotationIntensity={0.4} floatIntensity={0.8}>
      <mesh ref={mesh} position={[2, 0, -3]}>
        <sphereGeometry args={[1.2, 32, 32]} />
        <MeshDistortMaterial color="#00FFA3" distort={0.4} speed={2} transparent opacity={0.08} wireframe />
      </mesh>
    </Float>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SHARED COMPONENTS — exact parity with page 1
// ─────────────────────────────────────────────────────────────────────────────
function GlassCard({ children, style = {}, hover = true, glowColor = T.neon, ...props }) {
  return (
    <motion.div
      whileHover={hover ? { scale: 1.005, borderColor: `${glowColor}35`, boxShadow: `0 8px 40px rgba(0,0,0,0.5), 0 0 20px ${glowColor}0A` } : {}}
      transition={{ type: "spring", stiffness: 280, damping: 28 }}
      style={{
        background: T.glass,
        border: `1px solid ${T.border}`,
        borderRadius: 14,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        boxShadow: "0 4px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)",
        ...style,
      }}
      {...props}
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

function SectionHeader({ num, tag, title }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -24 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      style={{ display: "flex", alignItems: "flex-end", gap: 18, marginBottom: 36 }}
    >
      <span style={{ fontFamily: T.mono, fontSize: 56, fontWeight: 700, color: T.dim, lineHeight: 1, letterSpacing: -2 }}>{num}</span>
      <div>
        <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 5, color: T.neon, fontWeight: 500, marginBottom: 4 }}>{tag}</div>
        <h2 style={{ fontFamily: T.display, fontSize: 28, fontWeight: 800, color: T.text, letterSpacing: -0.5, lineHeight: 1 }}>{title}</h2>
      </div>
    </motion.div>
  );
}

function NeonTag({ children, color = T.neon }) {
  return (
    <span style={{
      fontFamily: T.mono, fontSize: 9, letterSpacing: 2, fontWeight: 700, color,
      background: `${color}14`, border: `1px solid ${color}28`, padding: "2px 7px", borderRadius: 3,
    }}>
      {children}
    </span>
  );
}

function ScanLine() {
  return (
    <motion.div
      animate={{ y: ["-100%", "200%"] }}
      transition={{ duration: 3.5, repeat: Infinity, ease: "linear", repeatDelay: 1.5 }}
      style={{
        position: "absolute", left: 0, right: 0, height: 1,
        background: `linear-gradient(90deg, transparent, ${T.neon}30, transparent)`,
        pointerEvents: "none", zIndex: 0,
      }}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 1 HERO — page 2 intro
// ─────────────────────────────────────────────────────────────────────────────
function Hero2() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick(x => x + 1), 90);
    return () => clearInterval(t);
  }, []);

  const binaryChars = useMemo(() => Array.from({ length: 360 }, () => Math.round(Math.random())).join(""), []);

  const pills = [
    { label: "DATA TYPES", color: T.neon, icon: "🧊" },
    { label: "VARIABLES", color: T.neon2, icon: "📦" },
    { label: "CONSTANTS", color: T.neon4, icon: "🔒" },
    { label: "printf / scanf", color: T.accent, icon: "⌨️" },
  ];

  return (
    <section id="hero2" style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      position: "relative", overflow: "hidden",
      background: `
        radial-gradient(ellipse 90% 60% at 50% -10%, rgba(0,255,163,0.07) 0%, transparent 65%),
        radial-gradient(ellipse 50% 30% at 90% 60%, rgba(0,212,255,0.05) 0%, transparent 60%),
        radial-gradient(ellipse 40% 25% at 10% 80%, rgba(189,105,255,0.04) 0%, transparent 60%),
        ${T.bg}
      `,
    }}>
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
          <Suspense fallback={null}>
            <ParticleField />
            <GlowOrb />
            <Stars radius={120} depth={60} count={1200} factor={3} saturation={0} fade speed={0.4} />
          </Suspense>
        </Canvas>
      </div>
      <div style={{
        position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
        backgroundImage: `linear-gradient(rgba(0,255,163,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,163,0.018) 1px, transparent 1px)`,
        backgroundSize: "52px 52px",
      }} />
      <div style={{ position: "absolute", inset: 0, zIndex: 1, overflow: "hidden", pointerEvents: "none" }}>
        <ScanLine />
      </div>
      <div style={{ position: "absolute", inset: 0, zIndex: 1, overflow: "hidden", pointerEvents: "none", opacity: 0.055 }}>
        <div style={{ fontFamily: T.mono, fontSize: 10, color: T.neon, wordBreak: "break-all", lineHeight: 1.9, padding: "0 24px", animation: "scrollUp 28s linear infinite" }}>
          {binaryChars.repeat(8)}
        </div>
      </div>

      <div style={{ position: "relative", zIndex: 10, textAlign: "center", maxWidth: 820, padding: "0 24px" }}>
        <motion.div
          initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }}
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            fontFamily: T.mono, fontSize: 9, letterSpacing: 5, color: T.neon,
            border: `1px solid ${T.border}`, background: "rgba(0,255,163,0.04)",
            padding: "6px 20px", borderRadius: 100, marginBottom: 30,
          }}
        >
          <motion.span animate={{ opacity: [1, 0.2, 1], scale: [1, 0.7, 1] }} transition={{ duration: 1.2, repeat: Infinity }}
            style={{ width: 5, height: 5, borderRadius: "50%", background: T.neon, display: "inline-block" }} />
          C FUNDAMENTALS — CHAPTER 2
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 36 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          style={{ fontFamily: T.display, fontWeight: 800, fontSize: "clamp(48px, 9vw, 100px)", lineHeight: 0.92, letterSpacing: -4, color: T.text, marginBottom: 22 }}
        >
          <motion.span animate={{ textShadow: [`0 0 60px ${T.neon}80, 0 0 120px ${T.neon}20`, `0 0 80px ${T.neon}A0, 0 0 160px ${T.neon}30`, `0 0 60px ${T.neon}80, 0 0 120px ${T.neon}20`] }} transition={{ duration: 2.5, repeat: Infinity }} style={{ color: T.neon }}>
            Memory
          </motion.span>
          {" & "}
          <span style={{ color: T.neon2 }}>Data</span>
          <br />
          <span style={{ color: T.muted, fontSize: "0.34em", letterSpacing: 9, fontWeight: 400, fontFamily: T.mono }}>
            simulation engine
          </span>
        </motion.h1>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          style={{ fontFamily: T.mono, fontSize: 13, color: T.neon2, letterSpacing: 1, marginBottom: 36 }}>
          visualize how C stores, names, and moves data through memory
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.7 }}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, flexWrap: "wrap", marginBottom: 44 }}>
          {pills.map((p, i) => (
            <motion.div key={p.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 + i * 0.1 }}
              whileHover={{ y: -4, boxShadow: `0 8px 30px ${p.color}35` }}
              style={{
                background: `${p.color}10`, border: `1px solid ${p.color}35`, borderRadius: 10,
                padding: "12px 20px", textAlign: "center",
              }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>{p.icon}</div>
              <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 2, color: p.color, fontWeight: 700 }}>{p.label}</div>
            </motion.div>
          ))}
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }}
          whileHover={{ scale: 1.06, boxShadow: `0 0 50px ${T.neon}60` }}
          whileTap={{ scale: 0.96 }}
          onClick={() => document.getElementById("datatypes")?.scrollIntoView({ behavior: "smooth" })}
          style={{
            fontFamily: T.display, fontWeight: 700, fontSize: 12, letterSpacing: 4,
            color: "#000", background: `linear-gradient(135deg, ${T.neon}, ${T.neon2})`,
            border: "none", borderRadius: 7, padding: "15px 44px", cursor: "pointer",
          }}
        >
          ENTER SIMULATION
        </motion.button>
      </div>

      <motion.div animate={{ y: [0, 9, 0] }} transition={{ duration: 2.2, repeat: Infinity }}
        style={{ position: "absolute", bottom: 30, zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, fontFamily: T.mono, fontSize: 8, letterSpacing: 5, color: T.muted }}>
        SCROLL
        <svg width="14" height="22" viewBox="0 0 14 22">
          <rect x="5" y="3" width="4" height="7" rx="2" stroke={T.muted} strokeWidth="1.2" fill="none" />
          <motion.rect animate={{ y: [0, 5, 0], opacity: [1, 0, 1] }} transition={{ duration: 1.8, repeat: Infinity }} x="5.5" y="4" width="3" height="2" rx="1" fill={T.neon} />
          <line x1="7" y1="14" x2="7" y2="20" stroke={T.muted} strokeWidth="1.2" strokeLinecap="round" />
          <polyline points="4,17 7,20 10,17" stroke={T.muted} strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </motion.div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 1: DATA TYPES — 3D Memory Visualizer
// ─────────────────────────────────────────────────────────────────────────────

// 3D Memory Grid in Canvas
function MemoryGrid3D({ selectedType, showBinary, overflowDemo }) {
  const groupRef = useRef();
  const [time, setTime] = useState(0);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.15;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.08;
    }
    setTime(state.clock.elapsedTime);
  });

  const dt = selectedType ? DATA_TYPES.find(d => d.id === selectedType) : null;

  return (
    <group ref={groupRef}>
      {/* Base grid of 16 memory blocks (representing RAM) */}
      {Array.from({ length: 16 }).map((_, i) => {
        const col = i % 8;
        const row = Math.floor(i / 8);
        const x = (col - 3.5) * 0.55;
        const y = (row - 0.5) * 0.55;

        const isActive = dt && i < dt.bytes;
        const isOverflow = overflowDemo && i === dt?.bytes;

        const baseColor = isOverflow
          ? new THREE.Color(T.neon3)
          : isActive
            ? new THREE.Color(dt.color)
            : new THREE.Color(T.dim);

        return (
          <mesh key={i} position={[x, y, 0]}>
            <boxGeometry args={[0.44, 0.44, isActive ? 0.44 + Math.sin(time * 2 + i) * 0.06 : 0.2]} />
            <meshStandardMaterial
              color={baseColor}
              emissive={baseColor}
              emissiveIntensity={isActive ? (overflowDemo && i === dt?.bytes - 1 ? 1.5 : 0.6 + Math.sin(time * 3 + i) * 0.3) : 0.05}
              transparent
              opacity={isActive ? 0.95 : 0.2}
              wireframe={showBinary && isActive}
            />
          </mesh>
        );
      })}

      {/* Byte count floating text is handled in HTML overlay */}
      <ambientLight intensity={0.3} />
      <pointLight position={[3, 3, 3]} intensity={1.5} color={dt ? dt.color : T.neon} />
      <pointLight position={[-3, -3, 2]} intensity={0.8} color={T.neon2} />
    </group>
  );
}

function DataTypesSection() {
  const [selectedType, setSelectedType] = useState("int");
  const [inputValue, setInputValue] = useState("42");
  const [showBinary, setShowBinary] = useState(false);
  const [overflowDemo, setOverflowDemo] = useState(false);
  const [speak, setSpeak] = useState(false);

  const dt = DATA_TYPES.find(d => d.id === selectedType);

  const toBinary = (val, bytes) => {
    const n = parseInt(val) || 0;
    const bits = bytes * 8;
    const bin = ((n >>> 0) >>> 0).toString(2).padStart(bits, "0");
    return bin.match(/.{1,8}/g)?.join(" ") || bin;
  };

  const isOverflow = useMemo(() => {
    const n = parseInt(inputValue) || 0;
    if (!dt) return false;
    if (dt.id === "char") return n > 127 || n < -128;
    if (dt.id === "short") return n > 32767 || n < -32768;
    if (dt.id === "int") return n > 2147483647 || n < -2147483648;
    return false;
  }, [inputValue, dt]);

  const speakExplanation = () => {
    if (!dt || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const text = `${dt.label} uses ${dt.bytes} byte${dt.bytes > 1 ? "s" : ""}. ${dt.desc} ${dt.why}`;
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = 0.9;
    window.speechSynthesis.speak(utt);
    setSpeak(true);
    utt.onend = () => setSpeak(false);
  };

  return (
    <Section id="datatypes">
      <SectionHeader num="01" tag="MEMORY SIM · DATA TYPES" title="3D Memory Allocation Engine" />

      <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 20, marginBottom: 24 }}>
        {/* Type Selector */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 3, color: T.muted, marginBottom: 4 }}>SELECT TYPE</div>
          {DATA_TYPES.map(type => (
            <motion.button
              key={type.id}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => { setSelectedType(type.id); setOverflowDemo(false); }}
              style={{
                background: selectedType === type.id ? `${type.color}15` : "rgba(255,255,255,0.02)",
                border: `1px solid ${selectedType === type.id ? type.color : T.dim}`,
                borderRadius: 8, padding: "10px 14px",
                fontFamily: T.mono, fontSize: 12, fontWeight: 700,
                color: selectedType === type.id ? type.color : T.muted,
                cursor: "pointer", textAlign: "left",
                display: "flex", justifyContent: "space-between", alignItems: "center",
                transition: "all 0.18s",
              }}
            >
              <span>{type.label}</span>
              <span style={{ fontSize: 9, opacity: 0.7 }}>{type.bytes}B</span>
            </motion.button>
          ))}
        </div>

        {/* Center: 3D Canvas + controls */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* 3D Memory Canvas */}
          <GlassCard style={{ height: 280, overflow: "hidden", position: "relative" }} hover={false}>
            <Canvas camera={{ position: [0, 0, 5], fov: 55 }}>
              <Suspense fallback={null}>
                <MemoryGrid3D selectedType={selectedType} showBinary={showBinary} overflowDemo={overflowDemo || isOverflow} />
              </Suspense>
            </Canvas>

            {/* Overlay info */}
            <div style={{ position: "absolute", top: 14, left: 14, fontFamily: T.mono }}>
              <motion.div
                key={selectedType}
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                style={{ display: "flex", alignItems: "center", gap: 8 }}
              >
                <div style={{ width: 8, height: 8, borderRadius: 2, background: dt?.color }} />
                <span style={{ fontSize: 11, color: dt?.color, fontWeight: 700 }}>{dt?.label}</span>
                <span style={{ fontSize: 9, color: T.muted }}>{dt?.bytes} byte{dt?.bytes !== 1 ? "s" : ""} = {(dt?.bytes || 0) * 8} bits</span>
              </motion.div>
            </div>

            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 8 }}>
              <motion.button whileTap={{ scale: 0.95 }}
                onClick={() => setShowBinary(!showBinary)}
                style={{
                  fontFamily: T.mono, fontSize: 8, letterSpacing: 2,
                  color: showBinary ? "#000" : T.neon2, background: showBinary ? T.neon2 : "rgba(0,0,0,0.5)",
                  border: `1px solid ${showBinary ? T.neon2 : T.dim}`, borderRadius: 4,
                  padding: "4px 10px", cursor: "pointer",
                }}>
                {showBinary ? "⬛ BINARY" : "◻ BINARY"}
              </motion.button>
            </div>

            {/* Bottom: byte blocks visual */}
            <div style={{ position: "absolute", bottom: 14, left: 14, right: 14, display: "flex", gap: 3, alignItems: "center" }}>
              {Array.from({ length: dt?.bytes || 0 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
                  transition={{ delay: i * 0.06, type: "spring", stiffness: 300 }}
                  style={{
                    flex: 1, height: 20, borderRadius: 3,
                    background: `${dt?.color}60`,
                    border: `1px solid ${dt?.color}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <span style={{ fontFamily: T.mono, fontSize: 7, color: dt?.color }}>byte</span>
                </motion.div>
              ))}
              {Array.from({ length: 8 - (dt?.bytes || 0) }).map((_, i) => (
                <div key={`empty-${i}`} style={{ flex: 1, height: 20, borderRadius: 3, background: T.dim, border: `1px solid ${T.dim}` }} />
              ))}
              <span style={{ fontFamily: T.mono, fontSize: 8, color: T.muted, marginLeft: 6, whiteSpace: "nowrap" }}>of 8 max</span>
            </div>
          </GlassCard>

          {/* Controls row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <GlassCard style={{ padding: 16 }} hover={false}>
              <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 3, color: T.muted, marginBottom: 8 }}>ENTER VALUE</div>
              <input
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                style={{
                  width: "100%", fontFamily: T.mono, fontSize: 14, fontWeight: 700,
                  color: isOverflow ? T.neon3 : dt?.color,
                  background: "transparent", border: "none", outline: "none",
                  borderBottom: `1px solid ${isOverflow ? T.neon3 : (dt?.color || T.dim)}`,
                  paddingBottom: 4, marginBottom: 8,
                }}
              />
              <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted }}>Range: {dt?.range}</div>
              <AnimatePresence>
                {isOverflow && (
                  <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    style={{ marginTop: 8, fontFamily: T.mono, fontSize: 10, color: T.neon3 }}>
                    ⚠ OVERFLOW — value exceeds {dt?.label} range!
                  </motion.div>
                )}
              </AnimatePresence>
            </GlassCard>

            <GlassCard style={{ padding: 16 }} hover={false}>
              <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 3, color: T.muted, marginBottom: 8 }}>BINARY VIEW</div>
              <div style={{ fontFamily: T.mono, fontSize: 10, color: T.neon2, wordBreak: "break-all", lineHeight: 1.8 }}>
                {showBinary ? toBinary(inputValue, dt?.bytes || 4) : <span style={{ color: T.muted }}>Toggle binary mode ↑</span>}
              </div>
            </GlassCard>
          </div>
        </div>
      </div>

      {/* Type detail card */}
      <AnimatePresence mode="wait">
        <motion.div key={selectedType} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
          <GlassCard style={{ padding: 24, borderColor: `${dt?.color}30` }} hover={false}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
              <div>
                <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 3, color: dt?.color, marginBottom: 8 }}>WHAT IT IS</div>
                <div style={{ fontFamily: T.mono, fontSize: 11, color: T.text, lineHeight: 1.8 }}>{dt?.desc}</div>
              </div>
              <div>
                <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 3, color: dt?.color, marginBottom: 8 }}>WHY IT WORKS THIS WAY</div>
                <div style={{ fontFamily: T.mono, fontSize: 11, color: T.text, lineHeight: 1.8 }}>{dt?.why}</div>
              </div>
              <div>
                <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 3, color: dt?.color, marginBottom: 8 }}>EXAMPLE CODE</div>
                <div style={{ fontFamily: T.mono, fontSize: 12, color: "#C3E88D", background: "rgba(0,0,0,0.4)", borderRadius: 6, padding: "10px 14px", lineHeight: 1.7 }}>
                  {dt?.example}
                </div>
                <motion.button whileTap={{ scale: 0.95 }}
                  onClick={speakExplanation}
                  style={{
                    marginTop: 10, fontFamily: T.mono, fontSize: 8, letterSpacing: 2,
                    color: speak ? "#000" : T.neon4, background: speak ? T.neon4 : "transparent",
                    border: `1px solid ${speak ? T.neon4 : T.dim}`, borderRadius: 4,
                    padding: "5px 12px", cursor: "pointer",
                  }}>
                  {speak ? "🔊 SPEAKING…" : "🔊 EXPLAIN THIS"}
                </motion.button>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </AnimatePresence>

      {/* Comparison chart */}
      <div style={{ marginTop: 20 }}>
        <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 4, color: T.muted, marginBottom: 14 }}>SIZE COMPARISON (relative byte width)</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {DATA_TYPES.map(type => (
            <div key={type.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontFamily: T.mono, fontSize: 11, fontWeight: 700, color: type.color, minWidth: 70 }}>{type.label}</span>
              <div style={{ flex: 1, height: 20, background: T.dim, borderRadius: 4, overflow: "hidden", position: "relative" }}>
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${(type.bytes / 8) * 100}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.1, delay: DATA_TYPES.indexOf(type) * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    height: "100%", borderRadius: 4,
                    background: selectedType === type.id
                      ? `linear-gradient(90deg, ${type.color}CC, ${type.color})`
                      : `${type.color}40`,
                    boxShadow: selectedType === type.id ? `0 0 12px ${type.color}80` : "none",
                    transition: "background 0.3s, box-shadow 0.3s",
                    cursor: "pointer",
                  }}
                  onClick={() => setSelectedType(type.id)}
                />
              </div>
              <span style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, minWidth: 55 }}>{type.bytes} byte{type.bytes !== 1 ? "s" : ""}</span>
              <span style={{ fontFamily: T.mono, fontSize: 9, color: T.dim }}>{type.bytes * 8} bits</span>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 2: VARIABLES & CONSTANTS — State Machine
// ─────────────────────────────────────────────────────────────────────────────
function VariablesSection() {
  const [containers, setContainers] = useState([]);
  const [newName, setNewName] = useState("");
  const [newValue, setNewValue] = useState("");
  const [isConst, setIsConst] = useState(false);
  const [shakingId, setShakingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [error, setError] = useState("");
  const [memBase] = useState(0xFF10);
  const [speak, setSpeak] = useState(false);

  const addContainer = () => {
    if (!newName.trim()) return;
    if (!/^[a-zA-Z_]\w*$/.test(newName)) { setError("Invalid identifier: must start with letter or _"); return; }
    setContainers(prev => [...prev, {
      id: Date.now(),
      name: newName.trim(),
      value: newValue || "0",
      isConst,
      address: `0x${(memBase + prev.length * 4).toString(16).toUpperCase()}`,
      type: isNaN(newValue) ? "char*" : (newValue.includes(".") ? "float" : "int"),
    }]);
    setNewName(""); setNewValue(""); setError("");
  };

  const tryEdit = (container) => {
    if (container.isConst) {
      setShakingId(container.id);
      setError(`❌ Cannot modify const '${container.name}' — it's read-only!`);
      setTimeout(() => { setShakingId(null); setError(""); }, 1200);
    } else {
      setEditingId(container.id);
      setEditValue(container.value);
    }
  };

  const commitEdit = (id) => {
    setContainers(prev => prev.map(c => c.id === id ? { ...c, value: editValue } : c));
    setEditingId(null);
  };

  const speakMemory = (c) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const text = c.isConst
      ? `${c.name} is a constant with value ${c.value}. It cannot be changed after initialization. The compiler will reject any attempt to reassign it.`
      : `${c.name} is a variable of type ${c.type}, currently holding the value ${c.value}, stored at memory address ${c.address}.`;
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = 0.9;
    window.speechSynthesis.speak(utt);
    setSpeak(c.id);
    utt.onend = () => setSpeak(null);
  };

  return (
    <Section id="variables">
      <SectionHeader num="02" tag="STATE MACHINE · VARIABLES & CONSTANTS" title="Named Memory Containers" />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 24 }}>
        {/* Left: creator */}
        <div>
          <GlassCard style={{ padding: 20, marginBottom: 16 }} hover={false}>
            <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 4, color: T.neon, fontWeight: 700, marginBottom: 16 }}>CREATE NEW VARIABLE</div>

            <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: T.mono, fontSize: 8, color: T.muted, marginBottom: 4 }}>NAME</div>
                <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. age"
                  onKeyDown={e => e.key === "Enter" && addContainer()}
                  style={{ width: "100%", fontFamily: T.mono, fontSize: 13, color: T.neon2, background: "rgba(0,0,0,0.3)", border: `1px solid ${T.dim}`, borderRadius: 6, padding: "8px 12px", outline: "none" }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: T.mono, fontSize: 8, color: T.muted, marginBottom: 4 }}>VALUE</div>
                <input value={newValue} onChange={e => setNewValue(e.target.value)} placeholder="e.g. 25"
                  onKeyDown={e => e.key === "Enter" && addContainer()}
                  style={{ width: "100%", fontFamily: T.mono, fontSize: 13, color: T.neon4, background: "rgba(0,0,0,0.3)", border: `1px solid ${T.dim}`, borderRadius: 6, padding: "8px 12px", outline: "none" }} />
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <motion.button whileTap={{ scale: 0.95 }}
                onClick={() => setIsConst(!isConst)}
                style={{
                  fontFamily: T.mono, fontSize: 9, letterSpacing: 2, fontWeight: 700,
                  color: isConst ? "#000" : T.neon4, padding: "6px 14px",
                  background: isConst ? T.neon4 : "transparent",
                  border: `1px solid ${isConst ? T.neon4 : T.dim}`, borderRadius: 5, cursor: "pointer",
                }}>
                {isConst ? "🔒 const" : "📦 variable"}
              </motion.button>
              <span style={{ fontFamily: T.mono, fontSize: 10, color: T.muted }}>
                {isConst ? "Read-only after init" : "Can be reassigned"}
              </span>
            </div>

            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={addContainer}
              style={{
                width: "100%", fontFamily: T.display, fontWeight: 700, fontSize: 11, letterSpacing: 3,
                color: "#000", background: `linear-gradient(135deg, ${T.neon}, ${T.neon2})`,
                border: "none", borderRadius: 7, padding: "12px", cursor: "pointer",
              }}>
              + ALLOCATE MEMORY
            </motion.button>

            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{ marginTop: 10, fontFamily: T.mono, fontSize: 11, color: T.neon3, background: `${T.neon3}10`, border: `1px solid ${T.neon3}30`, borderRadius: 6, padding: "8px 12px" }}>
                  {error}
                </motion.div>
              )}
            </AnimatePresence>
          </GlassCard>

          {/* How memory works */}
          <GlassCard style={{ padding: 18 }} hover={false}>
            <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 4, color: T.neon2, fontWeight: 700, marginBottom: 12 }}>HOW IT WORKS</div>
            {[
              { step: "1", text: "int x = 5; reserves 4 bytes on the stack", color: T.neon },
              { step: "2", text: "The name 'x' is erased at compile time → becomes an address", color: T.neon2 },
              { step: "3", text: "x = 10; writes value 10 to that address", color: T.neon4 },
              { step: "const", text: "const blocks the compiler from allowing reassignment", color: T.neon3 },
            ].map(item => (
              <div key={item.step} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start" }}>
                <div style={{ background: `${item.color}20`, border: `1px solid ${item.color}40`, borderRadius: 4, padding: "2px 7px", fontFamily: T.mono, fontSize: 9, color: item.color, flexShrink: 0, fontWeight: 700 }}>{item.step}</div>
                <div style={{ fontFamily: T.mono, fontSize: 10, color: T.text, lineHeight: 1.7 }}>{item.text}</div>
              </div>
            ))}
          </GlassCard>
        </div>

        {/* Right: memory grid */}
        <div>
          <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 4, color: T.muted, marginBottom: 10 }}>STACK MEMORY — LIVE VIEW</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, minHeight: 200 }}>
            <AnimatePresence>
              {containers.length === 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  style={{ fontFamily: T.mono, fontSize: 11, color: T.dim, textAlign: "center", padding: 40, border: `1px dashed ${T.dim}`, borderRadius: 10 }}>
                  No variables yet.<br />Create one above ↑
                </motion.div>
              )}
              {containers.map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, x: 30, scale: 0.95 }}
                  animate={{
                    opacity: 1, x: 0, scale: 1,
                    ...(shakingId === c.id ? { x: [0, -8, 8, -8, 8, 0] } : {}),
                  }}
                  exit={{ opacity: 0, x: -30, scale: 0.95 }}
                  transition={shakingId === c.id ? { duration: 0.4, times: [0, 0.2, 0.4, 0.6, 0.8, 1] } : { type: "spring", stiffness: 280, damping: 26 }}
                  style={{
                    background: c.isConst ? `${T.neon4}0A` : `${T.neon2}08`,
                    border: `1px solid ${shakingId === c.id ? T.neon3 : (c.isConst ? `${T.neon4}40` : `${T.neon2}30`)}`,
                    borderRadius: 10, padding: "14px 16px",
                    boxShadow: shakingId === c.id ? `0 0 20px ${T.neon3}50` : "none",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <span style={{ fontSize: 18 }}>{c.isConst ? "🔒" : "📦"}</span>
                    <div>
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <span style={{ fontFamily: T.mono, fontWeight: 700, fontSize: 14, color: c.isConst ? T.neon4 : T.neon2 }}>{c.name}</span>
                        <NeonTag color={c.isConst ? T.neon4 : T.neon2}>{c.isConst ? "const" : c.type}</NeonTag>
                      </div>
                      <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted }}>{c.address}</div>
                    </div>

                    {/* Value display or edit */}
                    <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
                      {editingId === c.id ? (
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} style={{ display: "flex", gap: 6 }}>
                          <input value={editValue} onChange={e => setEditValue(e.target.value)} autoFocus
                            onKeyDown={e => e.key === "Enter" && commitEdit(c.id)}
                            style={{ width: 80, fontFamily: T.mono, fontSize: 13, color: T.neon, background: "rgba(0,0,0,0.5)", border: `1px solid ${T.neon}`, borderRadius: 5, padding: "4px 8px", outline: "none" }} />
                          <motion.button whileTap={{ scale: 0.95 }} onClick={() => commitEdit(c.id)}
                            style={{ fontFamily: T.mono, fontSize: 9, color: "#000", background: T.neon, border: "none", borderRadius: 4, padding: "4px 10px", cursor: "pointer" }}>✓</motion.button>
                        </motion.div>
                      ) : (
                        <motion.div
                          key={c.value}
                          initial={{ scale: 1.3, color: c.isConst ? T.neon4 : T.neon }}
                          animate={{ scale: 1, color: T.text }}
                          style={{ fontFamily: T.mono, fontSize: 20, fontWeight: 700, color: T.text }}
                        >
                          {c.value}
                        </motion.div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <motion.button whileTap={{ scale: 0.95 }} onClick={() => tryEdit(c)}
                      style={{
                        fontFamily: T.mono, fontSize: 8, letterSpacing: 1, color: c.isConst ? T.neon3 : T.neon2,
                        background: "transparent", border: `1px solid ${c.isConst ? T.neon3 + "40" : T.dim}`,
                        borderRadius: 4, padding: "4px 10px", cursor: "pointer",
                      }}>
                      {c.isConst ? "🔒 LOCKED" : "✏️ EDIT"}
                    </motion.button>
                    <motion.button whileTap={{ scale: 0.95 }} onClick={() => speakMemory(c)}
                      style={{
                        fontFamily: T.mono, fontSize: 8, letterSpacing: 1,
                        color: speak === c.id ? "#000" : T.neon4,
                        background: speak === c.id ? T.neon4 : "transparent",
                        border: `1px solid ${speak === c.id ? T.neon4 : T.dim}`,
                        borderRadius: 4, padding: "4px 10px", cursor: "pointer",
                      }}>
                      {speak === c.id ? "🔊 …" : "🔊 EXPLAIN"}
                    </motion.button>
                    <motion.button whileTap={{ scale: 0.95 }}
                      onClick={() => setContainers(prev => prev.filter(x => x.id !== c.id))}
                      style={{
                        fontFamily: T.mono, fontSize: 8, letterSpacing: 1, color: T.neon3,
                        background: "transparent", border: `1px solid ${T.neon3}30`,
                        borderRadius: 4, padding: "4px 10px", cursor: "pointer", marginLeft: "auto",
                      }}>
                      FREE
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Generated code preview */}
          {containers.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: 14 }}>
              <GlassCard style={{ overflow: "hidden" }} hover={false}>
                <div style={{ background: "rgba(0,0,0,0.4)", borderBottom: `1px solid ${T.dim}`, padding: "8px 14px", fontFamily: T.mono, fontSize: 8, letterSpacing: 3, color: T.neon }}>GENERATED C CODE</div>
                <div style={{ padding: "12px 16px" }}>
                  <pre style={{ fontFamily: T.mono, fontSize: 12, color: T.text, lineHeight: 2 }}>
                    <span style={{ color: T.accent }}>int</span> main() {"{"}
                    {containers.map(c => (
                      <div key={c.id} style={{ paddingLeft: 20 }}>
                        {c.isConst && <span style={{ color: T.neon4 }}>const </span>}
                        <span style={{ color: T.neon2 }}>{c.type}</span>
                        {" "}
                        <span style={{ color: "#C3E88D" }}>{c.name}</span>
                        {" = "}
                        <span style={{ color: T.neon4 }}>{c.value}</span>
                        {";"}
                      </div>
                    ))}
                    {"    "}<span style={{ color: T.neon3 }}>return</span> <span style={{ color: T.neon4 }}>0</span>;
                    {"\n}"}
                  </pre>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </div>
      </div>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 3: printf / scanf — Terminal Simulation
// ─────────────────────────────────────────────────────────────────────────────
function IOSection() {
  const [scanfValue, setScanfValue] = useState("");
  const [variable, setVariable] = useState(null);
  const [output, setOutput] = useState([]);
  const [phase, setPhase] = useState("idle"); // idle | scanning | printing | done
  const [formatStr, setFormatStr] = useState("Your score is: %d points!");
  const [speak, setSpeak] = useState(false);

  const typewriterQueue = useRef([]);
  const [displayedOutput, setDisplayedOutput] = useState("");

  const runFlow = async () => {
    if (!scanfValue) return;
    setPhase("scanning");
    setVariable(null);
    setDisplayedOutput("");

    await new Promise(r => setTimeout(r, 600));
    setVariable({ name: "score", value: scanfValue, address: "0xFF10" });
    setPhase("printing");

    await new Promise(r => setTimeout(r, 500));
    const result = formatStr.replace("%d", scanfValue).replace("%f", parseFloat(scanfValue).toFixed(6)).replace("%.2f", parseFloat(scanfValue).toFixed(2)).replace("%s", scanfValue).replace("%c", String.fromCharCode(parseInt(scanfValue) || 65));
    let i = 0;
    const interval = setInterval(() => {
      if (i <= result.length) {
        setDisplayedOutput(result.slice(0, i));
        i++;
      } else {
        clearInterval(interval);
        setPhase("done");
      }
    }, 35);
  };

  const reset = () => {
    setPhase("idle"); setScanfValue(""); setVariable(null); setDisplayedOutput("");
  };

  const speakExplain = () => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const text = `Here is how printf and scanf work. scanf reads input from the user and stores it at a memory address using the ampersand operator. The value is stored in the variable. Then printf takes the format string and substitutes the format specifier with the variable's value, printing the result to the terminal.`;
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = 0.85;
    window.speechSynthesis.speak(utt);
    setSpeak(true);
    utt.onend = () => setSpeak(false);
  };

  const phaseColors = { idle: T.muted, scanning: T.neon2, printing: T.neon, done: "#C3E88D" };
  const phaseLabels = { idle: "READY", scanning: "SCANNING INPUT…", printing: "CALLING printf…", done: "COMPLETE" };

  return (
    <Section id="io">
      <SectionHeader num="03" tag="TERMINAL SIM · printf / scanf" title="Input/Output Simulation Engine" />

      {/* Flow diagram */}
      <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 28, overflowX: "auto", paddingBottom: 4 }}>
        {[
          { label: "USER INPUT", sub: "keyboard", icon: "⌨️", color: T.neon2 },
          { label: "scanf()", sub: '"%d", &score', icon: "📥", color: T.neon4 },
          { label: "MEMORY", sub: "0xFF10: score", icon: "🧠", color: T.accent },
          { label: "printf()", sub: '"Score: %d"', icon: "📤", color: T.neon },
          { label: "TERMINAL", sub: "stdout", icon: "💻", color: "#C3E88D" },
        ].map((node, i) => (
          <div key={node.label} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
            <motion.div
              animate={
                (phase === "scanning" && i <= 1) ||
                (phase === "printing" && i >= 2) ||
                (phase === "done")
                  ? { borderColor: `${node.color}80`, background: `${node.color}10`, scale: 1.04 }
                  : { borderColor: T.dim, background: "transparent", scale: 1 }
              }
              style={{ border: `1px solid`, borderRadius: 10, padding: "12px 16px", textAlign: "center", minWidth: 100 }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>{node.icon}</div>
              <div style={{ fontFamily: T.mono, fontSize: 9, fontWeight: 700, letterSpacing: 2, color: node.color }}>{node.label}</div>
              <div style={{ fontFamily: T.mono, fontSize: 8, color: T.muted, marginTop: 2 }}>{node.sub}</div>
            </motion.div>
            {i < 4 && (
              <div style={{ width: 36, position: "relative", height: 2, flexShrink: 0 }}>
                <div style={{ height: 1, width: "100%", background: T.dim }} />
                <motion.div
                  animate={
                    (phase === "scanning" && i < 2) || (phase === "printing" && i >= 2) || phase === "done"
                      ? { x: [0, 28, 0], opacity: 1 }
                      : { opacity: 0 }
                  }
                  transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
                  style={{ position: "absolute", top: "50%", left: 0, transform: "translateY(-50%)", width: 7, height: 7, borderRadius: "50%", background: node.color, boxShadow: `0 0 8px ${node.color}` }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
        {/* Left: Code + interaction */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Code panel */}
          <GlassCard style={{ overflow: "hidden" }} hover={false}>
            <div style={{ background: "rgba(0,0,0,0.4)", borderBottom: `1px solid ${T.dim}`, padding: "10px 16px", display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: phaseColors[phase] }} />
              <span style={{ fontFamily: T.mono, fontSize: 8, color: T.muted }}>io_demo.c</span>
              <span style={{ fontFamily: T.mono, fontSize: 8, color: phaseColors[phase], marginLeft: "auto", letterSpacing: 2 }}>{phaseLabels[phase]}</span>
            </div>
            <div style={{ padding: "16px 18px" }}>
              {[
                { line: '#include <stdio.h>', color: T.accent },
                { line: '', color: T.muted },
                { line: 'int main() {', color: T.neon2 },
                { line: '    int score;', color: T.text },
                { line: '    scanf("%d", &score);', color: phase === "scanning" || phase === "done" ? T.neon4 : T.text, glow: phase === "scanning" },
                { line: '    printf("' + formatStr.replace(/"/g, '\\"') + '", score);', color: phase === "printing" || phase === "done" ? T.neon : T.text, glow: phase === "printing" },
                { line: '    return 0;', color: T.text },
                { line: '}', color: T.neon2 },
              ].map((item, i) => (
                <motion.div key={i}
                  animate={{ background: item.glow ? `${item.color}12` : "transparent", paddingLeft: item.glow ? 22 : 16 }}
                  style={{ fontFamily: T.mono, fontSize: 12, lineHeight: 2, paddingRight: 16, borderLeft: `2px solid ${item.glow ? item.color : "transparent"}`, transition: "border-color 0.2s" }}>
                  <span style={{ color: T.dim, marginRight: 12, fontSize: 10 }}>{i + 1}</span>
                  <span style={{ color: item.color }}>{item.line}</span>
                </motion.div>
              ))}
            </div>
          </GlassCard>

          {/* Format string editor */}
          <GlassCard style={{ padding: 16 }} hover={false}>
            <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 3, color: T.neon, marginBottom: 8 }}>FORMAT STRING (editable)</div>
            <input value={formatStr} onChange={e => setFormatStr(e.target.value)}
              style={{ width: "100%", fontFamily: T.mono, fontSize: 12, color: T.neon2, background: "rgba(0,0,0,0.4)", border: `1px solid ${T.dim}`, borderRadius: 6, padding: "8px 12px", outline: "none" }} />
            <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, marginTop: 6 }}>
              Use %d for int, %f for float, %s for string, %c for char
            </div>
          </GlassCard>

          {/* Speak button */}
          <motion.button whileTap={{ scale: 0.95 }} onClick={speakExplain}
            style={{
              fontFamily: T.mono, fontSize: 9, letterSpacing: 2, fontWeight: 700,
              color: speak ? "#000" : T.neon4, background: speak ? T.neon4 : "transparent",
              border: `1px solid ${speak ? T.neon4 : T.dim}`, borderRadius: 6, padding: "10px 18px", cursor: "pointer",
            }}>
            {speak ? "🔊 EXPLAINING…" : "🔊 EXPLAIN printf & scanf"}
          </motion.button>
        </div>

        {/* Right: Input + memory + output */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Input panel */}
          <GlassCard style={{ padding: 18 }} hover={false}>
            <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 3, color: T.neon2, marginBottom: 10 }}>⌨️ USER INPUT (simulates stdin)</div>
            <div style={{ display: "flex", gap: 10 }}>
              <input value={scanfValue} onChange={e => setScanfValue(e.target.value)}
                placeholder="Enter a number…"
                onKeyDown={e => e.key === "Enter" && runFlow()}
                style={{ flex: 1, fontFamily: T.mono, fontSize: 16, fontWeight: 700, color: T.neon2, background: "rgba(0,0,0,0.4)", border: `1px solid ${T.neon2}40`, borderRadius: 6, padding: "10px 14px", outline: "none" }} />
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                onClick={runFlow} disabled={!scanfValue || phase === "scanning" || phase === "printing"}
                style={{
                  fontFamily: T.display, fontWeight: 700, fontSize: 10, letterSpacing: 2, color: "#000",
                  background: T.neon, border: "none", borderRadius: 6, padding: "10px 20px", cursor: "pointer",
                }}>
                RUN
              </motion.button>
              <motion.button whileTap={{ scale: 0.96 }} onClick={reset}
                style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, background: "transparent", border: `1px solid ${T.dim}`, borderRadius: 6, padding: "10px 14px", cursor: "pointer" }}>
                RESET
              </motion.button>
            </div>
          </GlassCard>

          {/* Memory state */}
          <GlassCard style={{ padding: 18 }} hover={false}>
            <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 3, color: T.accent, marginBottom: 12 }}>🧠 MEMORY STATE</div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, minWidth: 60 }}>0xFF10</div>
              <div style={{ fontFamily: T.mono, fontSize: 10, color: T.neon2, minWidth: 40 }}>score</div>
              <motion.div
                animate={{ background: variable ? `${T.neon}14` : T.dim, borderColor: variable ? `${T.neon}60` : T.dim }}
                style={{ border: "1px solid", borderRadius: 5, padding: "4px 14px", minWidth: 70, textAlign: "center" }}>
                <motion.span key={variable?.value}
                  initial={{ scale: 1.4, color: T.neon }} animate={{ scale: 1, color: variable ? T.neon : T.dim }}
                  style={{ fontFamily: T.mono, fontSize: 18, fontWeight: 700 }}>
                  {variable ? variable.value : "???"}
                </motion.span>
              </motion.div>
              <div style={{ fontFamily: T.mono, fontSize: 10, color: T.muted }}>int (4 bytes)</div>
            </div>
            {phase === "scanning" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 0.8 }}
                style={{ fontFamily: T.mono, fontSize: 10, color: T.neon2, marginTop: 10 }}>
                ← scanf reading from stdin and writing to &score…
              </motion.div>
            )}
          </GlassCard>

          {/* Terminal output */}
          <GlassCard style={{ overflow: "hidden", flex: 1 }} hover={false}>
            <div style={{ background: "rgba(0,0,0,0.5)", borderBottom: `1px solid ${T.dim}`, padding: "10px 16px", fontFamily: T.mono, fontSize: 8, letterSpacing: 3, color: "#C3E88D" }}>
              💻 TERMINAL OUTPUT (stdout)
            </div>
            <div style={{ padding: "14px 18px", minHeight: 80 }}>
              {displayedOutput ? (
                <div style={{ fontFamily: T.mono, fontSize: 15, color: "#C3E88D", lineHeight: 1.8 }}>
                  <span style={{ color: T.dim, marginRight: 8 }}>$</span>
                  {displayedOutput}
                  {phase !== "done" && (
                    <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.6, repeat: Infinity }}
                      style={{ display: "inline-block", width: 7, height: 14, background: T.neon, verticalAlign: "middle", marginLeft: 2 }} />
                  )}
                </div>
              ) : (
                <div style={{ fontFamily: T.mono, fontSize: 11, color: T.muted }}>
                  {phase === "idle" ? "Awaiting input… enter a value and click RUN" : "Processing…"}
                  {phase === "idle" && (
                    <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ duration: 1.2, repeat: Infinity }}
                      style={{ display: "inline-block", width: 6, height: 13, background: T.muted, verticalAlign: "middle", marginLeft: 4 }} />
                  )}
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 4: FORMAT SPECIFIER VISUALIZER
// ─────────────────────────────────────────────────────────────────────────────
function FormatSpecSection() {
  const [selected, setSelected] = useState(FORMAT_SPECIFIERS[0]);
  const [mismatchDemo, setMismatchDemo] = useState(false);
  const [glitching, setGlitching] = useState(false);

  const triggerMismatch = () => {
    setMismatchDemo(true);
    setGlitching(true);
    setTimeout(() => setGlitching(false), 1000);
    setTimeout(() => setMismatchDemo(false), 3000);
  };

  return (
    <Section id="formatspec">
      <SectionHeader num="04" tag="FORMAT SPEC VISUALIZER · %d %f %s %c" title="How Values Are Interpreted" />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Left: specifier grid */}
        <div>
          <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 3, color: T.muted, marginBottom: 12 }}>SELECT SPECIFIER</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 18 }}>
            {FORMAT_SPECIFIERS.map(fs => (
              <motion.button
                key={fs.spec}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => { setSelected(fs); setMismatchDemo(false); setGlitching(false); }}
                style={{
                  background: selected.spec === fs.spec ? `${fs.color}15` : "rgba(255,255,255,0.02)",
                  border: `1px solid ${selected.spec === fs.spec ? fs.color : T.dim}`,
                  borderRadius: 8, padding: "12px 14px", cursor: "pointer", textAlign: "left",
                  transition: "all 0.18s",
                }}>
                <div style={{ fontFamily: T.mono, fontSize: 16, fontWeight: 700, color: fs.color, marginBottom: 3 }}>{fs.spec}</div>
                <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted }}>{fs.label}</div>
                <div style={{ fontFamily: T.mono, fontSize: 9, color: T.text, marginTop: 4 }}>→ {fs.output}</div>
              </motion.button>
            ))}
          </div>

          {/* Mismatch demo */}
          <GlassCard style={{ padding: 18 }} hover={false}>
            <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 3, color: T.neon3, marginBottom: 10 }}>⚠ TYPE MISMATCH DEMO</div>
            <div style={{ fontFamily: T.mono, fontSize: 11, color: T.text, lineHeight: 1.8, marginBottom: 12 }}>
              What happens when you use <span style={{ color: T.neon4 }}>%d</span> with a <span style={{ color: "#FF6FD8" }}>float</span>?
            </div>
            <div style={{ fontFamily: T.mono, fontSize: 12, color: "#C3E88D", background: "rgba(0,0,0,0.4)", borderRadius: 6, padding: "10px 14px", marginBottom: 12 }}>
              float x = 3.14f;<br />
              printf(<span style={{ color: T.neon3 }}>"%d"</span>, x);  // ← wrong!
            </div>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={triggerMismatch}
              style={{ fontFamily: T.display, fontWeight: 700, fontSize: 10, letterSpacing: 3, color: "#000", background: T.neon3, border: "none", borderRadius: 6, padding: "10px 20px", cursor: "pointer" }}>
              TRIGGER MISMATCH
            </motion.button>
          </GlassCard>
        </div>

        {/* Right: interpretation visual */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <AnimatePresence mode="wait">
            <motion.div key={selected.spec + mismatchDemo}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.28 }}>
              <GlassCard style={{ padding: 24, borderColor: `${selected.color}30` }} hover={false}>
                <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 3, color: selected.color, marginBottom: 16 }}>FORMAT SPECIFIER BREAKDOWN</div>

                {/* Visual flow */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                  <div style={{ background: `${selected.color}20`, border: `1px solid ${selected.color}60`, borderRadius: 8, padding: "10px 20px", textAlign: "center" }}>
                    <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, marginBottom: 4 }}>VALUE</div>
                    <div style={{ fontFamily: T.mono, fontSize: 18, fontWeight: 700, color: selected.color }}>{selected.example}</div>
                  </div>
                  <div style={{ flex: 1, textAlign: "center" }}>
                    <div style={{ fontFamily: T.mono, fontSize: 22, color: selected.color }}>→</div>
                    <div style={{ fontFamily: T.mono, fontSize: 16, fontWeight: 700, color: selected.color }}>{selected.spec}</div>
                  </div>
                  <motion.div
                    animate={glitching ? {
                      x: [0, -4, 4, -2, 2, 0],
                      filter: ["hue-rotate(0deg)", "hue-rotate(120deg)", "hue-rotate(240deg)", "hue-rotate(0deg)"],
                    } : {}}
                    transition={glitching ? { duration: 0.6, repeat: 1 } : {}}
                    style={{ background: mismatchDemo ? `${T.neon3}20` : `${T.neon}20`, border: `1px solid ${mismatchDemo ? T.neon3 : T.neon}60`, borderRadius: 8, padding: "10px 20px", textAlign: "center", minWidth: 100 }}>
                    <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, marginBottom: 4 }}>OUTPUT</div>
                    <div style={{ fontFamily: T.mono, fontSize: 18, fontWeight: 700, color: mismatchDemo ? T.neon3 : T.neon }}>
                      {mismatchDemo ? "1078523331" : selected.output}
                    </div>
                  </motion.div>
                </div>

                {mismatchDemo && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    style={{ background: `${T.neon3}10`, border: `1px solid ${T.neon3}40`, borderRadius: 8, padding: "12px 16px", marginBottom: 14 }}>
                    <div style={{ fontFamily: T.mono, fontSize: 10, color: T.neon3, lineHeight: 1.8 }}>
                      💥 <strong>TYPE MISMATCH:</strong> The 4 bytes of float 3.14f (0x4048F5C3) were read as a signed int → 1078523331. Your format specifier must match the type!
                    </div>
                  </motion.div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 3, color: selected.color, marginBottom: 6 }}>TYPE</div>
                    <NeonTag color={selected.color}>{selected.type}</NeonTag>
                  </div>
                  <div>
                    <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 3, color: selected.color, marginBottom: 6 }}>SPECIFIER</div>
                    <NeonTag color={selected.color}>{selected.spec}</NeonTag>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </AnimatePresence>

          {/* Scanf & address explainer */}
          <GlassCard style={{ padding: 18 }} hover={false}>
            <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 3, color: T.neon3, marginBottom: 12 }}>❓ WHY DOES scanf NEED &amp; ?</div>
            <div style={{ display: "flex", gap: 14, marginBottom: 12 }}>
              <div style={{ flex: 1 }}>
                <NeonTag color={T.neon3}>WRONG ❌</NeonTag>
                <div style={{ fontFamily: T.mono, fontSize: 11, color: T.neon3, background: "rgba(255,107,107,0.08)", border: `1px solid ${T.neon3}25`, borderRadius: 6, padding: "10px 12px", marginTop: 6, lineHeight: 1.8 }}>
                  scanf("%d", x);<br />
                  <span style={{ color: T.muted }}>// passes VALUE of x<br />// scanf can't write to it</span>
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <NeonTag color={T.neon}>CORRECT ✓</NeonTag>
                <div style={{ fontFamily: T.mono, fontSize: 11, color: T.neon, background: "rgba(0,255,163,0.06)", border: `1px solid ${T.neon}25`, borderRadius: 6, padding: "10px 12px", marginTop: 6, lineHeight: 1.8 }}>
                  scanf("%d", &amp;x);<br />
                  <span style={{ color: T.muted }}>// passes ADDRESS of x<br />// scanf writes there ✓</span>
                </div>
              </div>
            </div>
            <div style={{ fontFamily: T.mono, fontSize: 11, color: T.text, lineHeight: 1.8 }}>
              <span style={{ color: T.neon4 }}>&amp;</span> is the "address-of" operator. scanf needs to <em>write</em> to your variable — so it needs to know <em>where</em> in memory it lives. Without &amp;, you pass a copy of the value, not a pointer to it.
            </div>
          </GlassCard>
        </div>
      </div>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 5: STEP EXECUTION ENGINE
// ─────────────────────────────────────────────────────────────────────────────
const STEP_PROGRAM = [
  {
    line: "#include <stdio.h>",
    type: "preprocessor",
    desc: "Preprocessor directive. Before compilation, cpp replaces this with the entire contents of stdio.h — giving us printf and scanf.",
    memory: {},
    output: "",
    color: T.accent,
  },
  {
    line: "int main() {",
    type: "entry",
    desc: "Entry point. The OS calls main() first. 'int' means it returns an exit code. The '{' opens the function's scope — variables declared here live on the stack.",
    memory: {},
    output: "",
    color: T.neon2,
  },
  {
    line: "    int score = 0;",
    type: "declare",
    desc: "Allocates 4 bytes on the stack for 'score'. Initializes to 0. The address might be 0xFF10. Memory now holds: 0xFF10 → 0",
    memory: { score: 0 },
    output: "",
    color: T.neon4,
  },
  {
    line: "    float gpa = 3.8f;",
    type: "declare",
    desc: "Allocates 4 bytes for a float. The 'f' suffix marks this as float literal (not double). IEEE 754 representation: 0x40733333. Memory now holds: 0xFF14 → 3.8",
    memory: { score: 0, gpa: 3.8 },
    output: "",
    color: "#FF6FD8",
  },
  {
    line: '    char grade = \'A\';',
    type: "declare",
    desc: "Allocates 1 byte for char. 'A' is ASCII code 65. Memory holds: 0xFF18 → 65. char is literally a small integer — 'A' + 1 = 'B' in C.",
    memory: { score: 0, gpa: 3.8, grade: "'A'" },
    output: "",
    color: T.neon,
  },
  {
    line: "    score = 95;",
    type: "assign",
    desc: "Assignment. Writes integer 95 into the 4 bytes at score's address (0xFF10). The old value (0) is overwritten. Memory: 0xFF10 → 95",
    memory: { score: 95, gpa: 3.8, grade: "'A'" },
    output: "",
    color: T.neon4,
  },
  {
    line: '    printf("Score: %d, GPA: %.1f, Grade: %c\\n", score, gpa, grade);',
    type: "output",
    desc: "printf reads the format string. %d → substitutes score (95). %.1f → formats gpa with 1 decimal (3.8). %c → converts grade's ASCII value to character 'A'. \\n adds a newline.",
    memory: { score: 95, gpa: 3.8, grade: "'A'" },
    output: "Score: 95, GPA: 3.8, Grade: A\n",
    color: T.neon,
  },
  {
    line: "    return 0;",
    type: "return",
    desc: "Exits main() and returns 0 to the OS. Exit code 0 = success. The stack frame is destroyed — score, gpa, grade are all gone from memory. OS reclaims the stack space.",
    memory: { score: 95, gpa: 3.8, grade: "'A'" },
    output: "Score: 95, GPA: 3.8, Grade: A\n",
    color: T.neon3,
  },
  {
    line: "}",
    type: "close",
    desc: "Closing brace. End of main(). All local variables go out of scope. The stack pointer moves back. Memory 0xFF10–0xFF18 is reclaimed for future use.",
    memory: {},
    output: "Score: 95, GPA: 3.8, Grade: A\n",
    color: T.neon2,
  },
];

function StepExecutionSection() {
  const [step, setStep] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const playRef = useRef(null);
  const [speak, setSpeak] = useState(false);

  const current = step >= 0 ? STEP_PROGRAM[step] : null;

  const goTo = (n) => setStep(Math.max(-1, Math.min(n, STEP_PROGRAM.length - 1)));

  useEffect(() => {
    if (playing) {
      playRef.current = setInterval(() => {
        setStep(s => {
          if (s >= STEP_PROGRAM.length - 1) { setPlaying(false); clearInterval(playRef.current); return s; }
          return s + 1;
        });
      }, 1200);
    } else {
      clearInterval(playRef.current);
    }
    return () => clearInterval(playRef.current);
  }, [playing]);

  const speakStep = () => {
    if (!current || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(current.desc);
    utt.rate = 0.85;
    window.speechSynthesis.speak(utt);
    setSpeak(true);
    utt.onend = () => setSpeak(false);
  };

  const memEntries = current ? Object.entries(current.memory) : [];
  const memColors = { score: T.neon4, gpa: "#FF6FD8", grade: T.neon };

  return (
    <Section id="stepexec">
      <SectionHeader num="05" tag="STEP ENGINE · MULTI-TYPE PROGRAM" title="Step Through Execution" />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
        {/* Code panel */}
        <GlassCard style={{ overflow: "hidden" }} hover={false}>
          <div style={{ background: "rgba(0,0,0,0.4)", borderBottom: `1px solid ${T.dim}`, padding: "10px 16px", display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: playing ? T.neon : (step >= 0 ? T.neon4 : T.muted) }} />
            <span style={{ fontFamily: T.mono, fontSize: 9, color: T.muted }}>multivars.c</span>
            <span style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 2, color: T.muted, marginLeft: "auto" }}>
              {step >= 0 ? `LINE ${step + 1} / ${STEP_PROGRAM.length}` : "READY"}
            </span>
          </div>
          <div style={{ padding: "12px 0" }}>
            {STEP_PROGRAM.map((s, i) => {
              const isActive = step === i;
              const isPast = step > i;
              return (
                <motion.div key={i}
                  animate={{ background: isActive ? `${s.color}12` : "transparent", paddingLeft: isActive ? 20 : 14 }}
                  style={{ display: "flex", alignItems: "flex-start", gap: 10, paddingRight: 16, paddingTop: 1, paddingBottom: 1, borderLeft: `2px solid ${isActive ? s.color : "transparent"}`, opacity: isPast ? 0.32 : 1, cursor: "pointer", transition: "opacity 0.2s" }}
                  onClick={() => goTo(i)}
                >
                  <span style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, minWidth: 14, textAlign: "right", marginTop: 4, flexShrink: 0 }}>{i + 1}</span>
                  <span style={{ fontFamily: T.mono, fontSize: 11, color: isActive ? s.color : (isPast ? T.muted : T.text), lineHeight: 2, wordBreak: "break-word" }}>
                    {s.line}
                  </span>
                  {isActive && (
                    <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 0.5, repeat: Infinity }}
                      style={{ fontFamily: T.mono, fontSize: 8, color: s.color, marginLeft: "auto", flexShrink: 0, letterSpacing: 1 }}>◀ NOW</motion.span>
                  )}
                </motion.div>
              );
            })}
          </div>
        </GlassCard>

        {/* Right panels */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Description */}
          <GlassCard style={{ padding: 18, minHeight: 110, borderColor: current ? `${current.color}30` : T.border }} hover={false}>
            <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 3, color: current?.color || T.muted, marginBottom: 8 }}>
              {current ? current.type.toUpperCase() : "SELECT A LINE"}
            </div>
            <AnimatePresence mode="wait">
              <motion.div key={step} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.22 }}>
                <div style={{ fontFamily: T.mono, fontSize: 11, color: T.text, lineHeight: 1.85 }}>
                  {current?.desc || "Click a line or use the controls below to step through the program."}
                </div>
              </motion.div>
            </AnimatePresence>
            {current && (
              <motion.button whileTap={{ scale: 0.95 }} onClick={speakStep} style={{
                marginTop: 10, fontFamily: T.mono, fontSize: 8, letterSpacing: 2,
                color: speak ? "#000" : T.neon4, background: speak ? T.neon4 : "transparent",
                border: `1px solid ${speak ? T.neon4 : T.dim}`, borderRadius: 4, padding: "5px 12px", cursor: "pointer",
              }}>
                {speak ? "🔊 …" : "🔊 EXPLAIN"}
              </motion.button>
            )}
          </GlassCard>

          {/* Memory */}
          <GlassCard style={{ padding: 0, overflow: "hidden" }} hover={false}>
            <div style={{ background: "rgba(0,0,0,0.4)", borderBottom: `1px solid ${T.dim}`, padding: "10px 16px", fontFamily: T.mono, fontSize: 8, letterSpacing: 3, color: T.neon2 }}>STACK MEMORY</div>
            <div style={{ padding: "14px 16px", minHeight: 80 }}>
              {memEntries.length === 0 && (
                <div style={{ fontFamily: T.mono, fontSize: 11, color: T.dim }}>No variables yet…</div>
              )}
              {memEntries.map(([name, val], i) => {
                const color = memColors[name] || T.neon;
                return (
                  <motion.div key={name} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, fontFamily: T.mono, fontSize: 11 }}>
                    <span style={{ color: T.muted, minWidth: 55, fontSize: 9 }}>0xFF{(0x10 + i * 4).toString(16).toUpperCase()}</span>
                    <span style={{ color, minWidth: 44, fontWeight: 700 }}>{name}</span>
                    <motion.div
                      key={String(val)}
                      initial={{ scale: 1.4, color }} animate={{ scale: 1, color: T.text }}
                      style={{ background: `${color}12`, border: `1px solid ${color}40`, borderRadius: 4, padding: "3px 12px", fontWeight: 700, color }}>
                      {String(val)}
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>
          </GlassCard>

          {/* Terminal */}
          <GlassCard style={{ padding: 0, overflow: "hidden" }} hover={false}>
            <div style={{ background: "rgba(0,0,0,0.5)", borderBottom: `1px solid ${T.dim}`, padding: "10px 16px", fontFamily: T.mono, fontSize: 8, letterSpacing: 3, color: "#C3E88D" }}>TERMINAL</div>
            <div style={{ padding: "12px 16px", minHeight: 60 }}>
              <AnimatePresence>
                {current?.output ? (
                  <motion.pre key="output" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    style={{ fontFamily: T.mono, fontSize: 14, color: "#C3E88D", lineHeight: 1.8 }}>
                    {current.output}
                  </motion.pre>
                ) : (
                  <span style={{ fontFamily: T.mono, fontSize: 11, color: T.muted }}>no output yet</span>
                )}
              </AnimatePresence>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 14, marginTop: 20 }}>
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => { setPlaying(false); goTo(-1); }}
          style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: 2, color: T.muted, padding: "9px 16px", background: "transparent", border: `1px solid ${T.dim}`, borderRadius: 6, cursor: "pointer" }}>
          ⏮ RESET
        </motion.button>
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => goTo(step - 1)} disabled={step <= 0}
          style={{ fontFamily: T.display, fontWeight: 700, fontSize: 10, letterSpacing: 2, color: step <= 0 ? T.muted : T.neon, padding: "9px 22px", background: "transparent", border: `1px solid ${step <= 0 ? T.dim : T.border}`, borderRadius: 6, cursor: step <= 0 ? "not-allowed" : "pointer" }}>
          ← PREV
        </motion.button>

        {/* Step progress */}
        <div style={{ display: "flex", gap: 4 }}>
          {STEP_PROGRAM.map((s, i) => (
            <motion.button key={i} onClick={() => goTo(i)}
              animate={{ background: step >= i ? s.color : T.dim, scale: step === i ? 1.4 : 1 }}
              style={{ width: 7, height: 7, borderRadius: "50%", border: "none", cursor: "pointer", padding: 0 }} />
          ))}
        </div>

        <motion.button whileTap={{ scale: 0.95 }} onClick={() => setPlaying(!playing)}
          style={{ fontFamily: T.display, fontWeight: 700, fontSize: 9, letterSpacing: 2, color: playing ? "#000" : T.neon2, padding: "9px 16px", background: playing ? T.neon2 : "transparent", border: `1px solid ${playing ? T.neon2 : T.dim}`, borderRadius: 6, cursor: "pointer" }}>
          {playing ? "⏸ PAUSE" : "▶ AUTO"}
        </motion.button>

        <motion.button whileTap={{ scale: 0.95 }} onClick={() => goTo(step + 1)} disabled={step >= STEP_PROGRAM.length - 1}
          style={{ fontFamily: T.display, fontWeight: 700, fontSize: 10, letterSpacing: 2, color: step >= STEP_PROGRAM.length - 1 ? T.muted : T.neon, padding: "9px 22px", background: "transparent", border: `1px solid ${step >= STEP_PROGRAM.length - 1 ? T.dim : T.border}`, borderRadius: 6, cursor: step >= STEP_PROGRAM.length - 1 ? "not-allowed" : "pointer" }}>
          NEXT →
        </motion.button>
      </div>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SIDEBAR — page 2 nav
// ─────────────────────────────────────────────────────────────────────────────
function Sidebar({ activeSection }) {
  return (
    <aside style={{
      width: 176, minWidth: 176,
      background: `linear-gradient(180deg, ${T.bg1} 0%, ${T.bg} 100%)`,
      borderRight: `1px solid ${T.dim}`,
      display: "flex", flexDirection: "column",
      padding: "26px 0",
      position: "sticky", top: 0, height: "100vh",
      overflow: "hidden", flexShrink: 0,
    }}>
      <div style={{ padding: "0 18px 22px" }}>
        <motion.div
          animate={{ textShadow: [`0 0 20px ${T.neon}60`, `0 0 30px ${T.neon}80`, `0 0 20px ${T.neon}60`] }}
          transition={{ duration: 2.5, repeat: Infinity }}
          style={{ fontFamily: T.display, fontWeight: 800, fontSize: 18, letterSpacing: 2, color: T.neon }}
        >
          C
        </motion.div>
        <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 5, color: T.muted, marginTop: 2 }}>FUNDAMENTALS</div>
      </div>

      <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${T.neon}35, transparent)`, marginBottom: 14 }} />

      <nav>
        {NAV_ITEMS.map(item => {
          const isActive = activeSection === item.id;
          return (
            <motion.a
              key={item.id}
              href={`#${item.id}`}
              onClick={e => { e.preventDefault(); document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" }); }}
              animate={{ color: isActive ? T.neon : T.muted, borderLeftColor: isActive ? T.neon : "transparent", background: isActive ? `${T.neon}07` : "transparent" }}
              whileHover={{ color: T.text, paddingLeft: 24 }}
              transition={{ duration: 0.2 }}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 18px", fontFamily: T.mono, fontSize: 10, fontWeight: 700, letterSpacing: 2, textDecoration: "none", borderLeft: "2px solid transparent", transition: "all 0.2s" }}
            >
              <span style={{ fontSize: 12, flexShrink: 0 }}>{item.icon}</span>
              <div>
                <div style={{ fontSize: 7, opacity: 0.45, marginBottom: 1 }}>{item.num}</div>
                {item.label}
              </div>
              {isActive && (
                <motion.div layoutId="nav-indicator-2"
                  style={{ width: 4, height: 4, borderRadius: "50%", background: T.neon, marginLeft: "auto", flexShrink: 0 }} />
              )}
            </motion.a>
          );
        })}
      </nav>

      <div style={{ marginTop: "auto", padding: "18px 18px", fontFamily: T.mono, fontSize: 8, color: T.dim, letterSpacing: 2, lineHeight: 1.9 }}>
        C PROGRAMMING<br />CHAPTER 2
      </div>
    </aside>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DEEP UNDERSTANDING PANEL (RIGHT) — replaces InsightPanel
// ─────────────────────────────────────────────────────────────────────────────
function DeepUnderstandingPanel({ activeSection }) {
  const [expanded, setExpanded] = useState(null);
  const [speakId, setSpeakId] = useState(null);
  const [mode, setMode] = useState("beginner"); // beginner | deep

  const insights = DEEP_INSIGHTS_BY_SECTION[activeSection] || DEEP_INSIGHTS_BY_SECTION["hero2"];

  const speakInsight = (ins) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const text = mode === "beginner"
      ? `${ins.title}. ${ins.body}`
      : `Deep explanation: ${ins.title}. ${ins.body} This is a fundamental concept in how C manages memory at the hardware level.`;
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = mode === "beginner" ? 0.9 : 0.85;
    window.speechSynthesis.speak(utt);
    setSpeakId(ins.title);
    utt.onend = () => setSpeakId(null);
  };

  // Mental models quick reference
  const mentalModels = {
    hero2: [
      { icon: "🏠", model: "Variable = a named box in RAM", detail: "int x = 5 → put 5 in box labeled 'x' at address 0xFF10" },
      { icon: "📏", model: "Type = size + interpretation rule", detail: "int tells compiler: 4 bytes, treat as signed integer" },
    ],
    datatypes: [
      { icon: "🏠", model: "char='tiny box', int='medium box', double='big box'", detail: "1, 4, and 8 bytes respectively" },
      { icon: "💡", model: "int is exact, float is approximate", detail: "Never use float for money or equality checks" },
    ],
    variables: [
      { icon: "🔒", model: "const = label on a sealed box", detail: "The compiler stops you from writing to it" },
      { icon: "🕳️", model: "Uninitialized = random garbage in box", detail: "Always initialize: int x = 0; not int x;" },
    ],
    io: [
      { icon: "📮", model: "printf = post office sends", detail: "Takes value, formats it, sends to stdout" },
      { icon: "📬", model: "scanf = post office receives at address", detail: "&x gives the address where scanf delivers" },
    ],
    formatspec: [
      { icon: "🔍", model: "%d = 'look at these 4 bytes as integer'", detail: "Each specifier tells printf HOW to interpret the bytes" },
      { icon: "💣", model: "Wrong specifier = wrong interpretation", detail: "%d on float reads float bits as integer — garbage" },
    ],
    stepexec: [
      { icon: "⬇️", model: "C runs top-to-bottom, one line at a time", detail: "No magic. Each line executes before the next starts." },
      { icon: "📋", model: "Assignment = write value to address", detail: "x = 5 writes the bits of 5 to x's memory location" },
    ],
  };

  const currentModels = mentalModels[activeSection] || mentalModels["hero2"];

  return (
    <aside style={{
      width: 272, minWidth: 272,
      background: `linear-gradient(180deg, ${T.bg1} 0%, ${T.bg} 100%)`,
      borderLeft: `1px solid ${T.dim}`,
      padding: "26px 14px",
      display: "flex", flexDirection: "column", gap: 0,
      overflowY: "auto", overflowX: "hidden",
      position: "sticky", top: 0, height: "100vh", flexShrink: 0,
    }}>
      {/* Header */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 5, color: T.neon, fontWeight: 700, marginBottom: 4 }}>DEEP UNDERSTANDING</div>
        <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, marginBottom: 8 }}>Updates as you explore</div>
        <div style={{ height: 1, background: `linear-gradient(90deg, ${T.neon}35, transparent)` }} />
      </div>

      {/* Mode toggle */}
      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        {["beginner", "deep"].map(m => (
          <motion.button key={m} whileTap={{ scale: 0.95 }}
            onClick={() => setMode(m)}
            style={{
              flex: 1, fontFamily: T.mono, fontSize: 8, letterSpacing: 2, fontWeight: 700,
              color: mode === m ? "#000" : T.muted, padding: "6px 0",
              background: mode === m ? T.neon2 : "transparent",
              border: `1px solid ${mode === m ? T.neon2 : T.dim}`, borderRadius: 4, cursor: "pointer",
            }}>
            {m === "beginner" ? "🟢 BEGINNER" : "🔵 DEEP"}
          </motion.button>
        ))}
      </div>

      {/* Section insights */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontFamily: T.mono, fontSize: 7, letterSpacing: 4, color: T.neon, marginBottom: 8 }}>⚡ KEY TAKEAWAYS</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <AnimatePresence mode="wait">
            {insights.map((ins, i) => {
              const isExp = expanded === i;
              return (
                <motion.div key={`${activeSection}-${i}`}
                  initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 18 }}
                  transition={{ delay: i * 0.06 }}
                  whileHover={{ x: -3 }}
                  onClick={() => setExpanded(isExp ? null : i)}
                  style={{
                    background: isExp ? `${ins.color}0E` : "rgba(255,255,255,0.015)",
                    border: `1px solid ${isExp ? `${ins.color}40` : T.dim}`,
                    borderRadius: 9, padding: "10px 12px", cursor: "pointer",
                    transition: "border-color 0.2s, background 0.2s",
                  }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                    <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>{ins.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ fontFamily: T.display, fontWeight: 700, fontSize: 11, color: T.text }}>{ins.title}</div>
                        <motion.div animate={{ rotate: isExp ? 90 : 0 }} style={{ color: T.muted, fontSize: 10, flexShrink: 0, marginLeft: 6 }}>›</motion.div>
                      </div>
                      <AnimatePresence>
                        {isExp && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} style={{ overflow: "hidden" }}>
                            <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, lineHeight: 1.7, marginTop: 6 }}>{ins.body}</div>
                            <motion.button whileTap={{ scale: 0.95 }} onClick={e => { e.stopPropagation(); speakInsight(ins); }}
                              style={{ marginTop: 8, fontFamily: T.mono, fontSize: 7, letterSpacing: 2, color: speakId === ins.title ? "#000" : ins.color, background: speakId === ins.title ? ins.color : "transparent", border: `1px solid ${ins.color}40`, borderRadius: 3, padding: "3px 8px", cursor: "pointer" }}>
                              {speakId === ins.title ? "🔊 …" : "🔊 EXPLAIN"}
                            </motion.button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      {!isExp && (
                        <div style={{ fontFamily: T.mono, fontSize: 8, color: T.muted, lineHeight: 1.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {ins.body.slice(0, 48)}…
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Mental models */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontFamily: T.mono, fontSize: 7, letterSpacing: 4, color: T.neon2, marginBottom: 8 }}>🧠 MENTAL MODELS</div>
        <AnimatePresence mode="wait">
          <motion.div key={activeSection} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            {currentModels.map((m, i) => (
              <div key={i} style={{ background: "rgba(0,212,255,0.04)", border: `1px solid ${T.neon2}18`, borderRadius: 8, padding: "10px 12px", marginBottom: 8 }}>
                <div style={{ display: "flex", gap: 6, marginBottom: 4 }}>
                  <span style={{ fontSize: 14 }}>{m.icon}</span>
                  <div style={{ fontFamily: T.mono, fontSize: 10, fontWeight: 700, color: T.neon2, lineHeight: 1.5 }}>{m.model}</div>
                </div>
                <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, lineHeight: 1.6 }}>{m.detail}</div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Common mistakes */}
      <div>
        <div style={{ fontFamily: T.mono, fontSize: 7, letterSpacing: 4, color: T.neon3, marginBottom: 8 }}>🚫 COMMON MISTAKES</div>
        {[
          { mistake: "Using = instead of == for comparison", fix: "if (x == 5) not if (x = 5)" },
          { mistake: "Forgetting & in scanf", fix: "scanf(\"%d\", &x) not scanf(\"%d\", x)" },
          { mistake: "Integer division truncates", fix: "5/2 = 2 in C, not 2.5 — use 5.0/2" },
          { mistake: "Uninitialized variable", fix: "Always initialize: int x = 0;" },
        ].map((item, i) => (
          <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "flex-start" }}>
            <span style={{ color: T.neon3, fontSize: 10, flexShrink: 0, marginTop: 1 }}>✗</span>
            <div>
              <div style={{ fontFamily: T.mono, fontSize: 9, color: T.neon3, lineHeight: 1.5 }}>{item.mistake}</div>
              <div style={{ fontFamily: T.mono, fontSize: 9, color: T.neon, marginTop: 2 }}>→ {item.fix}</div>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ROOT PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function CFundamentalsPage() {
  const [activeSection, setActiveSection] = useState("hero2");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => { entries.forEach(e => { if (e.isIntersecting) setActiveSection(e.target.id); }); },
      { threshold: 0.3 }
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
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=JetBrains+Mono:ital,wght@0,300;0,500;0,700;1,400&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: ${T.bg}; color: ${T.text}; overflow-x: hidden; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: ${T.bg}; }
        ::-webkit-scrollbar-thumb { background: ${T.neon}; border-radius: 2px; }
        @keyframes scrollUp {
          from { transform: translateY(0); }
          to   { transform: translateY(-50%); }
        }
        input::placeholder { color: ${T.dim}; }
        input { transition: border-color 0.2s; }
      `}</style>

      <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: T.bg }}>
        <Sidebar activeSection={activeSection} />

        <main style={{ flex: 7, overflowY: "auto", overflowX: "hidden", minWidth: 0 }}>
          <div style={{ maxWidth: "100%", padding: "0 36px" }}>
            <Hero2 />
            <DataTypesSection />
            <VariablesSection />
            <IOSection />
            <FormatSpecSection />
            <StepExecutionSection />
            <div style={{ height: 80 }} />
          </div>
        </main>

        <DeepUnderstandingPanel activeSection={activeSection} />
      </div>
    </>
  );
}