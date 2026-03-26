"use client";

/**
 * C PROGRAMMING — VISUAL LOGIC EXECUTION ENGINE
 * ================================================
 * Route: /c3
 * Teaches: Operators + Control Flow
 * Next.js App Router. Drop in: app/c3/page.jsx
 *
 * Dependencies:
 *   npm install framer-motion gsap @gsap/react three @react-three/fiber @react-three/drei
 */

import { useState, useEffect, useRef, useCallback, useMemo, Suspense } from "react";
import { motion, AnimatePresence, useAnimation, useMotionValue, useTransform, useSpring } from "framer-motion";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Stars, Float, Line, Html, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { gsap } from "gsap";

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN TOKENS — identical to /c-intro & /c2
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
// NAV
// ─────────────────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: "hero",        label: "INTRO",       num: "00", icon: "◎" },
  { id: "arithmetic",  label: "ARITHMETIC",  num: "01", icon: "➕" },
  { id: "relational",  label: "RELATIONAL",  num: "02", icon: "⚖" },
  { id: "logical",     label: "LOGICAL",     num: "03", icon: "🔗" },
  { id: "assignment",  label: "ASSIGNMENT",  num: "04", icon: "📥" },
  { id: "incdec",      label: "INC/DEC",     num: "05", icon: "🔢" },
  { id: "precedence",  label: "PRECEDENCE",  num: "06", icon: "🌳" },
  { id: "ifelse",      label: "IF/ELSE",     num: "07", icon: "🔀" },
  { id: "switchcase",  label: "SWITCH",      num: "08", icon: "🎛" },
  { id: "loops",       label: "LOOPS",       num: "09", icon: "🔄" },
  { id: "jumps",       label: "JUMP",        num: "10", icon: "⚡" },
  { id: "engine",      label: "ENGINE",      num: "11", icon: "🚀" },
];

// ─────────────────────────────────────────────────────────────────────────────
// 3D BACKGROUND COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
function ParticleField() {
  const mesh = useRef();
  const positions = useMemo(() => {
    const arr = new Float32Array(2500 * 3);
    for (let i = 0; i < 2500; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 50;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 30;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 30;
    }
    return arr;
  }, []);
  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.y = state.clock.elapsedTime * 0.025;
      mesh.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.012) * 0.06;
    }
  });
  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.045} color="#00FFA3" transparent opacity={0.38} sizeAttenuation />
    </points>
  );
}

// Logic Flow Nodes 3D — for the 3D panel
function LogicNodes3D({ activeSection }) {
  const groupRef = useRef();
  const nodes = useMemo(() => [
    { pos: [0, 2, 0],    color: "#00FFA3", label: "START",  size: 0.22 },
    { pos: [-2, 0.5, 0], color: "#00D4FF", label: "COND",   size: 0.18 },
    { pos: [2, 0.5, 0],  color: "#FFB347", label: "LOOP",   size: 0.18 },
    { pos: [-3, -1, 0],  color: "#FF6B6B", label: "TRUE",   size: 0.14 },
    { pos: [-1, -1, 0],  color: "#BD69FF", label: "FALSE",  size: 0.14 },
    { pos: [2, -1.2, 0], color: "#00FFA3", label: "ITER",   size: 0.14 },
    { pos: [0, -2.5, 0], color: "#00D4FF", label: "END",    size: 0.20 },
  ], []);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.18) * 0.35;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.08;
    }
  });

  return (
    <group ref={groupRef}>
      {nodes.map((n, i) => (
        <Float key={i} speed={1.2 + i * 0.15} floatIntensity={0.3} rotationIntensity={0.1}>
          <mesh position={n.pos}>
            <sphereGeometry args={[n.size, 16, 16]} />
            <meshStandardMaterial
              color={n.color}
              emissive={n.color}
              emissiveIntensity={0.6}
              transparent
              opacity={0.85}
            />
          </mesh>
        </Float>
      ))}
      {/* Connections */}
      {[[0,1],[0,2],[1,3],[1,4],[2,5],[3,6],[4,6],[5,6]].map(([a,b], i) => {
        const start = new THREE.Vector3(...nodes[a].pos);
        const end = new THREE.Vector3(...nodes[b].pos);
        return (
          <line key={i}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                args={[new Float32Array([...nodes[a].pos, ...nodes[b].pos]), 3]}
              />
            </bufferGeometry>
            <lineBasicMaterial color={nodes[a].color} transparent opacity={0.22} />
          </line>
        );
      })}
    </group>
  );
}

// Loop Visualizer 3D
function LoopOrb3D({ count }) {
  const groupRef = useRef();
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.6;
      groupRef.current.rotation.z = state.clock.elapsedTime * 0.3;
    }
  });
  const orbs = Array.from({ length: Math.min(count, 8) }, (_, i) => i);
  return (
    <group ref={groupRef}>
      {orbs.map((i) => {
        const angle = (i / orbs.length) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(angle) * 2, Math.sin(angle) * 2, 0]}>
            <sphereGeometry args={[0.2, 12, 12]} />
            <meshStandardMaterial color={T.neon} emissive={T.neon} emissiveIntensity={0.7} />
          </mesh>
        );
      })}
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SHARED COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
function GlassCard({ children, style = {}, hover = true, glowColor = T.neon, onClick, ...props }) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={hover ? {
        scale: 1.004,
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
  const lines = code.split("\n");
  return (
    <div style={{
      background: "rgba(0,0,0,0.5)", borderRadius: 10,
      border: `1px solid ${T.dim}`, overflow: "hidden", ...style
    }}>
      <div style={{ padding: "8px 14px", borderBottom: `1px solid ${T.dim}`, display: "flex", gap: 6 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#FF5F57" }} />
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#FEBC2E" }} />
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#28C840" }} />
      </div>
      <div style={{ padding: "14px 0" }}>
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
            }}
          >
            <span style={{ color: T.dim, marginRight: 14, fontSize: 9 }}>{i + 1}</span>
            {line}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function NeonTag({ children, color = T.neon }) {
  return (
    <span style={{
      fontFamily: T.mono, fontSize: 9, letterSpacing: 2, fontWeight: 700, color,
      background: `${color}14`, border: `1px solid ${color}30`,
      padding: "2px 8px", borderRadius: 3,
    }}>
      {children}
    </span>
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

// Animated flowing dot along a path
function FlowDot({ color = T.neon, delay = 0, duration = 2 }) {
  return (
    <motion.div
      animate={{ x: ["0%", "100%"] }}
      transition={{ duration, delay, repeat: Infinity, ease: "linear" }}
      style={{
        width: 8, height: 8, borderRadius: "50%", background: color,
        boxShadow: `0 0 12px ${color}, 0 0 24px ${color}60`,
        position: "absolute", top: "50%", transform: "translateY(-50%)",
      }}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 01 — ARITHMETIC OPERATORS
// ─────────────────────────────────────────────────────────────────────────────
const ARITH_OPS = [
  { op: "+", name: "Addition",       a: 8, b: 5, result: 13, color: T.neon,   code: "int result = a + b;" },
  { op: "-", name: "Subtraction",    a: 8, b: 5, result: 3,  color: T.neon2,  code: "int result = a - b;" },
  { op: "*", name: "Multiplication", a: 8, b: 5, result: 40, color: T.neon4,  code: "int result = a * b;" },
  { op: "/", name: "Division",       a: 8, b: 5, result: 1,  color: T.accent, code: "int result = a / b; // integer division!" },
  { op: "%", name: "Modulus",        a: 8, b: 5, result: 3,  color: T.neon3,  code: "int result = a % b; // remainder" },
];

function ArithmeticSection() {
  const [selected, setSelected] = useState(0);
  const [aVal, setAVal] = useState(8);
  const [bVal, setBVal] = useState(5);
  const [animating, setAnimating] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const op = ARITH_OPS[selected];

  const compute = (a, b, opSym) => {
    switch(opSym) {
      case "+": return a + b;
      case "-": return a - b;
      case "*": return a * b;
      case "/": return Math.trunc(a / b);
      case "%": return a % b;
      default: return 0;
    }
  };
  const result = compute(aVal, bVal, op.op);

  const handleAnimate = () => {
    setAnimating(true);
    setShowResult(false);
    setTimeout(() => { setShowResult(true); setAnimating(false); }, 1000);
  };

  return (
    <Section id="arithmetic">
      <SectionHeader num="01" tag="OPERATORS · ARITHMETIC" title="Calculator Engine" subtitle="Numbers transform into values — watch the operation happen" />

      {/* Op selector */}
      <div style={{ display: "flex", gap: 8, marginBottom: 28, flexWrap: "wrap" }}>
        {ARITH_OPS.map((op, i) => (
          <Pill key={op.op} color={op.color} active={selected === i} onClick={() => { setSelected(i); setShowResult(false); setAnimating(false); }}>
            {op.op} {op.name}
          </Pill>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
        {/* Visual calculator */}
        <GlassCard style={{ padding: 28 }}>
          <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 4, color: op.color, marginBottom: 24 }}>
            ⚡ LIVE OPERATION
          </div>

          {/* Input sliders */}
          <div style={{ marginBottom: 24 }}>
            {[["A", aVal, setAVal], ["B", bVal, setBVal]].map(([label, val, setter]) => (
              <div key={label} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontFamily: T.mono, fontSize: 12, color: T.muted }}>{label}</span>
                  <motion.span
                    key={val}
                    initial={{ scale: 1.4, color: op.color }}
                    animate={{ scale: 1, color: T.text }}
                    style={{ fontFamily: T.mono, fontSize: 16, fontWeight: 700 }}
                  >
                    {val}
                  </motion.span>
                </div>
                <input
                  type="range" min={-20} max={20} value={val}
                  onChange={e => { setter(Number(e.target.value)); setShowResult(false); }}
                  style={{ width: "100%", accentColor: op.color, cursor: "pointer" }}
                />
              </div>
            ))}
          </div>

          {/* Block animation */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: 24, minHeight: 80 }}>
            <motion.div
              animate={animating ? { x: [0, 20, 0], scale: [1, 0.9, 1] } : {}}
              transition={{ duration: 0.8 }}
              style={{
                width: 72, height: 72, borderRadius: 12,
                background: `${op.color}18`, border: `2px solid ${op.color}60`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: T.mono, fontSize: 24, fontWeight: 700, color: op.color,
              }}
            >
              {aVal}
            </motion.div>

            <motion.div
              animate={animating ? { scale: [1, 1.6, 1], rotate: [0, 180, 360] } : {}}
              transition={{ duration: 0.8 }}
              style={{ fontFamily: T.display, fontSize: 32, fontWeight: 800, color: op.color, minWidth: 30, textAlign: "center" }}
            >
              {op.op}
            </motion.div>

            <motion.div
              animate={animating ? { x: [0, -20, 0], scale: [1, 0.9, 1] } : {}}
              transition={{ duration: 0.8 }}
              style={{
                width: 72, height: 72, borderRadius: 12,
                background: `${T.neon2}18`, border: `2px solid ${T.neon2}60`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: T.mono, fontSize: 24, fontWeight: 700, color: T.neon2,
              }}
            >
              {bVal}
            </motion.div>

            <span style={{ fontFamily: T.display, fontSize: 28, color: T.muted }}>=</span>

            <AnimatePresence mode="wait">
              {showResult ? (
                <motion.div
                  key="result"
                  initial={{ scale: 0, rotate: -20, opacity: 0 }}
                  animate={{ scale: 1, rotate: 0, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  style={{
                    width: 80, height: 80, borderRadius: 12,
                    background: `${op.color}25`, border: `2px solid ${op.color}`,
                    boxShadow: `0 0 30px ${op.color}60`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: T.mono, fontSize: 26, fontWeight: 800, color: op.color,
                  }}
                >
                  {result}
                </motion.div>
              ) : (
                <motion.div
                  key="placeholder"
                  style={{
                    width: 80, height: 80, borderRadius: 12,
                    background: T.dim, border: `2px dashed ${T.muted}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: T.mono, fontSize: 12, color: T.muted,
                  }}
                >
                  ?
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleAnimate}
            style={{
              width: "100%", fontFamily: T.display, fontWeight: 700, fontSize: 11,
              letterSpacing: 4, color: "#000", background: `linear-gradient(135deg, ${op.color}, ${T.neon2})`,
              border: "none", borderRadius: 8, padding: "13px", cursor: "pointer",
            }}
          >
            ▶ EXECUTE {aVal} {op.op} {bVal}
          </motion.button>
        </GlassCard>

        {/* Code + insight */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <CodeBlock
            code={`int a = ${aVal};\nint b = ${bVal};\n${op.code.replace('a', aVal).replace('b', bVal)}\n// result = ${result}`}
            highlightLine={2}
          />

          <GlassCard style={{ padding: 20 }} hover={false}>
            <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 4, color: op.color, marginBottom: 12 }}>
              🧠 WHY THIS WORKS
            </div>
            {selected === 3 && (
              <div style={{ fontFamily: T.mono, fontSize: 11, color: T.text, lineHeight: 1.85, marginBottom: 10 }}>
                <span style={{ color: T.neon3 }}>⚠ INTEGER DIVISION</span>{"\n"}
                {aVal}/{bVal} = {aVal/bVal} in math, but C truncates toward zero. {"\n"}
                You get <span style={{ color: op.color }}>{Math.trunc(aVal/bVal)}</span>, not {(aVal/bVal).toFixed(2)}.
                Use <span style={{ color: T.neon2 }}>float</span> to keep decimals.
              </div>
            )}
            {selected === 4 && (
              <div style={{ fontFamily: T.mono, fontSize: 11, color: T.text, lineHeight: 1.85 }}>
                <span style={{ color: T.neon }}>MODULUS</span> gives the REMAINDER after division.{"\n"}
                {aVal} ÷ {bVal} = {Math.trunc(aVal/bVal)} remainder <span style={{ color: op.color, fontWeight: 700 }}>{Math.abs(aVal % bVal)}</span>{"\n"}
                Used for: even/odd checks, circular arrays, clock math.
              </div>
            )}
            {selected < 3 && (
              <div style={{ fontFamily: T.mono, fontSize: 11, color: T.text, lineHeight: 1.85 }}>
                Standard arithmetic operates on integers directly.{"\n"}
                Result type matches operand types.{"\n"}
                Watch out for overflow if values exceed <span style={{ color: op.color }}>INT_MAX (2,147,483,647)</span>.
              </div>
            )}
          </GlassCard>

          <GlassCard style={{ padding: 18 }} hover={false}>
            <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 4, color: T.neon3, marginBottom: 10 }}>⚠ COMMON MISTAKES</div>
            <div style={{ fontFamily: T.mono, fontSize: 11, color: T.text, lineHeight: 1.85 }}>
              {selected === 3 ? "• 7/2 gives 3, NOT 3.5\n• Cast to float: (float)7/2 = 3.5" :
               selected === 4 ? "• % only works on integers\n• Result sign matches left operand" :
               "• Integer overflow wraps silently\n• No automatic bounds checking in C"}
            </div>
          </GlassCard>
        </div>
      </div>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 02 — RELATIONAL OPERATORS
// ─────────────────────────────────────────────────────────────────────────────
const REL_OPS = [
  { op: "==", name: "Equal to",            example: "5 == 5",  res: true,  warning: "= is assignment! == is comparison" },
  { op: "!=", name: "Not equal to",        example: "5 != 3",  res: true },
  { op: ">",  name: "Greater than",        example: "7 > 3",   res: true },
  { op: "<",  name: "Less than",           example: "3 < 7",   res: true },
  { op: ">=", name: "Greater or equal",    example: "5 >= 5",  res: true },
  { op: "<=", name: "Less or equal",       example: "4 <= 5",  res: true },
];

function RelationalSection() {
  const [leftVal, setLeftVal] = useState(7);
  const [rightVal, setRightVal] = useState(4);
  const [selectedOp, setSelectedOp] = useState(">");

  const evaluate = (a, b, op) => {
    switch(op) {
      case "==": return a === b;
      case "!=": return a !== b;
      case ">":  return a > b;
      case "<":  return a < b;
      case ">=": return a >= b;
      case "<=": return a <= b;
    }
  };

  const result = evaluate(leftVal, rightVal, selectedOp);
  const tilt = leftVal > rightVal ? -18 : leftVal < rightVal ? 18 : 0;

  return (
    <Section id="relational">
      <SectionHeader num="02" tag="OPERATORS · RELATIONAL" title="The Balance Engine" subtitle="Every comparison returns 1 (true) or 0 (false) — nothing else" />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
        {/* Balance visual */}
        <GlassCard style={{ padding: 28 }}>
          <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 4, color: T.neon2, marginBottom: 22 }}>
            ⚖ COMPARISON SCALE
          </div>

          {/* Scale */}
          <div style={{ position: "relative", height: 180, marginBottom: 24 }}>
            {/* Pivot */}
            <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: 4, height: 70, background: T.muted, borderRadius: 2 }} />
            <div style={{ position: "absolute", bottom: 70, left: "50%", transform: "translateX(-50%)", width: 10, height: 10, borderRadius: "50%", background: T.neon2, boxShadow: `0 0 15px ${T.neon2}` }} />

            {/* Beam */}
            <motion.div
              animate={{ rotate: tilt }}
              transition={{ type: "spring", stiffness: 120, damping: 18 }}
              style={{
                position: "absolute", bottom: 75, left: "50%",
                width: 280, height: 3,
                background: `linear-gradient(90deg, ${T.neon3}, ${T.neon2}, ${T.neon})`,
                borderRadius: 2, transformOrigin: "center",
                transform: "translateX(-50%)",
              }}
            />

            {/* Left pan */}
            <motion.div
              animate={{ rotate: tilt, y: tilt > 0 ? -20 : tilt < 0 ? 20 : 0 }}
              transition={{ type: "spring", stiffness: 120, damping: 18 }}
              style={{
                position: "absolute", bottom: 80, left: "calc(50% - 140px)",
                transformOrigin: "right center",
                display: "flex", flexDirection: "column", alignItems: "center",
              }}
            >
              <motion.div
                key={leftVal}
                animate={{ scale: [1.3, 1] }}
                style={{
                  width: 70, height: 70, borderRadius: 12,
                  background: `${T.neon}20`, border: `2px solid ${T.neon}60`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: T.mono, fontSize: 26, fontWeight: 700, color: T.neon,
                }}
              >
                {leftVal}
              </motion.div>
              <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, marginTop: 5 }}>LEFT</div>
            </motion.div>

            {/* Right pan */}
            <motion.div
              animate={{ rotate: -tilt, y: tilt < 0 ? -20 : tilt > 0 ? 20 : 0 }}
              transition={{ type: "spring", stiffness: 120, damping: 18 }}
              style={{
                position: "absolute", bottom: 80, right: "calc(50% - 140px)",
                transformOrigin: "left center",
                display: "flex", flexDirection: "column", alignItems: "center",
              }}
            >
              <motion.div
                key={rightVal}
                animate={{ scale: [1.3, 1] }}
                style={{
                  width: 70, height: 70, borderRadius: 12,
                  background: `${T.neon2}20`, border: `2px solid ${T.neon2}60`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: T.mono, fontSize: 26, fontWeight: 700, color: T.neon2,
                }}
              >
                {rightVal}
              </motion.div>
              <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, marginTop: 5 }}>RIGHT</div>
            </motion.div>
          </div>

          {/* Sliders */}
          {[["LEFT", leftVal, setLeftVal, T.neon], ["RIGHT", rightVal, setRightVal, T.neon2]].map(([lbl, v, set, c]) => (
            <div key={lbl} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontFamily: T.mono, fontSize: 10, color: T.muted }}>{lbl}</span>
                <span style={{ fontFamily: T.mono, fontSize: 14, fontWeight: 700, color: c }}>{v}</span>
              </div>
              <input type="range" min={-10} max={10} value={v} onChange={e => set(Number(e.target.value))}
                style={{ width: "100%", accentColor: c }} />
            </div>
          ))}

          {/* Operator selector */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 16 }}>
            {REL_OPS.map(r => (
              <motion.button
                key={r.op}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedOp(r.op)}
                style={{
                  fontFamily: T.mono, fontSize: 12, fontWeight: 700,
                  color: selectedOp === r.op ? "#000" : T.neon2,
                  background: selectedOp === r.op ? T.neon2 : `${T.neon2}10`,
                  border: `1px solid ${selectedOp === r.op ? T.neon2 : `${T.neon2}30`}`,
                  borderRadius: 6, padding: "6px 14px", cursor: "pointer", flex: 1,
                }}
              >
                {r.op}
              </motion.button>
            ))}
          </div>

          {/* Result */}
          <motion.div
            key={`${leftVal}-${selectedOp}-${rightVal}`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
            style={{
              marginTop: 20, padding: "14px",
              background: result ? `${T.neon}15` : `${T.neon3}15`,
              border: `2px solid ${result ? T.neon : T.neon3}`,
              borderRadius: 10, textAlign: "center",
            }}
          >
            <div style={{ fontFamily: T.mono, fontSize: 14, color: T.muted, marginBottom: 4 }}>
              {leftVal} {selectedOp} {rightVal}
            </div>
            <div style={{ fontFamily: T.display, fontSize: 28, fontWeight: 800, color: result ? T.neon : T.neon3 }}>
              {result ? "1 (true)" : "0 (false)"}
            </div>
          </motion.div>
        </GlassCard>

        {/* Right side */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <GlassCard style={{ padding: 20 }} hover={false}>
            <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 4, color: T.neon3, marginBottom: 14 }}>
              ⚠ CRITICAL: = vs == vs ===
            </div>
            {[
              { code: "if (x = 5)",   label: "ASSIGNMENT — x becomes 5! Always true. Bug.", color: T.neon3, bad: true },
              { code: "if (x == 5)",  label: "COMPARISON — is x equal to 5? Returns 0 or 1.", color: T.neon, bad: false },
              { code: "if (5 == x)",  label: "YODA CONDITION — safer, compiler error if typo.", color: T.neon2, bad: false },
            ].map(item => (
              <div key={item.code} style={{
                marginBottom: 10, padding: "10px 12px", borderRadius: 8,
                background: item.bad ? `${T.neon3}08` : `${item.color}08`,
                border: `1px solid ${item.bad ? T.neon3 : item.color}30`,
              }}>
                <code style={{ fontFamily: T.mono, fontSize: 12, color: item.color }}>{item.code}</code>
                <div style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, marginTop: 4 }}>{item.label}</div>
              </div>
            ))}
          </GlassCard>

          <GlassCard style={{ padding: 20 }} hover={false}>
            <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 4, color: T.neon, marginBottom: 12 }}>
              🧠 MENTAL MODEL
            </div>
            <div style={{ fontFamily: T.mono, fontSize: 11, color: T.text, lineHeight: 1.85 }}>
              In C, there is no <span style={{ color: T.neon2 }}>boolean</span> type natively.
              {"\n\n"}Relational operators return <span style={{ color: T.neon }}>int</span>:{"\n"}
              • <span style={{ color: T.neon }}>1</span> for true{"\n"}
              • <span style={{ color: T.neon3 }}>0</span> for false{"\n\n"}
              ANY non-zero value is considered <span style={{ color: T.neon }}>truthy</span>.
              That's why <span style={{ color: T.neon3 }}>if(x = 5)</span> always executes.
            </div>
          </GlassCard>

          <CodeBlock code={`int a = ${leftVal}, b = ${rightVal};\nint result = (a ${selectedOp} b);\n// result = ${result ? 1 : 0}\nif (result) printf("TRUE");\nelse printf("FALSE");`} highlightLine={1} />
        </div>
      </div>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 03 — LOGICAL OPERATORS (Logic Gates)
// ─────────────────────────────────────────────────────────────────────────────
function LogicGate({ type, inputA, inputB, color }) {
  const result = type === "AND" ? inputA && inputB :
                 type === "OR"  ? inputA || inputB : !inputA;
  const inputs = type === "NOT" ? [inputA] : [inputA, inputB];

  return (
    <div style={{ position: "relative" }}>
      {/* Gate body */}
      <div style={{
        background: result ? `${color}18` : T.bg2,
        border: `2px solid ${result ? color : T.muted}`,
        borderRadius: 12, padding: "16px 22px",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
        minWidth: 120, boxShadow: result ? `0 0 30px ${color}40` : "none",
        transition: "all 0.3s",
      }}>
        <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 3, color: result ? color : T.muted, fontWeight: 700 }}>
          {type}
        </div>

        {/* Truth table inline */}
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {inputs.map((inp, i) => (
            <div key={i} style={{
              width: 28, height: 28, borderRadius: 6, border: `1px solid ${inp ? T.neon : T.neon3}60`,
              background: inp ? `${T.neon}15` : `${T.neon3}15`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: T.mono, fontSize: 12, fontWeight: 700, color: inp ? T.neon : T.neon3,
            }}>
              {inp ? "1" : "0"}
            </div>
          ))}
          <span style={{ color: T.muted, fontFamily: T.mono, fontSize: 14 }}>→</span>
          <motion.div
            key={result ? "t" : "f"}
            animate={{ scale: [1.3, 1] }}
            style={{
              width: 32, height: 32, borderRadius: 6, border: `2px solid ${result ? color : T.neon3}`,
              background: result ? `${color}25` : `${T.neon3}15`,
              boxShadow: result ? `0 0 15px ${color}60` : "none",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: T.mono, fontSize: 14, fontWeight: 800, color: result ? color : T.neon3,
            }}
          >
            {result ? "1" : "0"}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function LogicalSection() {
  const [a, setA] = useState(true);
  const [b, setB] = useState(false);

  const andResult = a && b;
  const orResult  = a || b;
  const notA      = !a;

  return (
    <Section id="logical">
      <SectionHeader num="03" tag="OPERATORS · LOGICAL" title="Circuit Logic Engine" subtitle="Boolean logic — signals flowing through AND, OR, NOT gates" />

      {/* Toggle inputs */}
      <div style={{ display: "flex", gap: 20, marginBottom: 32, alignItems: "center" }}>
        <span style={{ fontFamily: T.mono, fontSize: 11, color: T.muted }}>TOGGLE INPUTS:</span>
        {[["A", a, setA, T.neon], ["B", b, setB, T.neon2]].map(([lbl, val, set, c]) => (
          <motion.button
            key={lbl}
            whileTap={{ scale: 0.9 }}
            onClick={() => set(!val)}
            style={{
              width: 56, height: 56, borderRadius: 10,
              background: val ? `${c}22` : T.dim,
              border: `2px solid ${val ? c : T.muted}`,
              boxShadow: val ? `0 0 25px ${c}60` : "none",
              fontFamily: T.mono, fontSize: 18, fontWeight: 800, color: val ? c : T.muted,
              cursor: "pointer", transition: "all 0.25s",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2,
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 400 }}>{lbl}</span>
            {val ? "1" : "0"}
          </motion.button>
        ))}
        <div style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, lineHeight: 1.7 }}>
          Click to toggle between true (1) and false (0)
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
        {/* Gate visualizer */}
        <GlassCard style={{ padding: 28 }}>
          <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 4, color: T.accent, marginBottom: 24 }}>
            🔗 LOGIC GATES
          </div>

          {/* Signal lines */}
          <div style={{ marginBottom: 28 }}>
            {[["A", a, T.neon], ["B", b, T.neon2]].map(([lbl, val, c]) => (
              <div key={lbl} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 6, background: val ? `${c}22` : T.dim,
                  border: `1px solid ${val ? c : T.muted}`, display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: T.mono, fontSize: 14, fontWeight: 700, color: val ? c : T.muted,
                }}>
                  {val ? "1" : "0"}
                </div>
                <div style={{ flex: 1, height: 2, position: "relative", background: val ? `${c}30` : T.dim, borderRadius: 2 }}>
                  {val && <motion.div
                    animate={{ x: ["0%", "100%"] }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                    style={{
                      position: "absolute", top: "50%", left: 0, transform: "translateY(-50%)",
                      width: 10, height: 10, borderRadius: "50%", background: c,
                      boxShadow: `0 0 12px ${c}`,
                    }}
                  />}
                </div>
                <span style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, minWidth: 20 }}>{lbl}</span>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <LogicGate type="AND" inputA={a} inputB={b} color={T.neon}  />
            <LogicGate type="OR"  inputA={a} inputB={b} color={T.neon2} />
            <LogicGate type="NOT" inputA={a}             color={T.neon4} />
          </div>
        </GlassCard>

        {/* Truth table + code */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Full truth table */}
          <GlassCard style={{ padding: 20 }} hover={false}>
            <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 4, color: T.neon, marginBottom: 14 }}>
              TRUTH TABLE
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: T.mono, fontSize: 11 }}>
              <thead>
                <tr>
                  {["A", "B", "A&&B", "A||B", "!A"].map(h => (
                    <th key={h} style={{ color: T.muted, fontWeight: 700, letterSpacing: 2, fontSize: 9, padding: "6px 8px", borderBottom: `1px solid ${T.dim}`, textAlign: "center" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[[0,0],[0,1],[1,0],[1,1]].map(([ra, rb]) => {
                  const isActive = (ra === (a?1:0)) && (rb === (b?1:0));
                  return (
                    <motion.tr
                      key={`${ra}${rb}`}
                      animate={{ background: isActive ? `${T.neon}12` : "transparent" }}
                      style={{ borderLeft: isActive ? `2px solid ${T.neon}` : "2px solid transparent" }}
                    >
                      {[ra, rb, ra&&rb, ra||rb, 1-ra].map((v, i) => (
                        <td key={i} style={{
                          padding: "7px 8px", textAlign: "center",
                          color: isActive ? (v ? T.neon : T.neon3) : (v ? T.text : T.muted),
                          fontWeight: isActive ? 700 : 400,
                        }}>
                          {v}
                        </td>
                      ))}
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </GlassCard>

          <CodeBlock
            code={`int a = ${a?1:0}, b = ${b?1:0};\n\nif (a && b)  printf("AND: %d", ${andResult?1:0});\nif (a || b)  printf("OR: %d",  ${orResult?1:0});\nif (!a)      printf("NOT A: %d", ${notA?1:0});\n\n// Short-circuit: &&  stops at first false\n// Short-circuit: ||  stops at first true`}
            highlightLine={-1}
          />

          <GlassCard style={{ padding: 16 }} hover={false}>
            <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 4, color: T.neon4, marginBottom: 8 }}>
              ⚡ SHORT-CIRCUIT EVALUATION
            </div>
            <div style={{ fontFamily: T.mono, fontSize: 11, color: T.text, lineHeight: 1.85 }}>
              <span style={{ color: T.neon }}>&&</span> stops evaluating when it finds <span style={{ color: T.neon3 }}>false</span>
              {"\n"}<span style={{ color: T.neon2 }}>||</span> stops evaluating when it finds <span style={{ color: T.neon }}>true</span>
              {"\n\n"}This is why <span style={{ color: T.neon4 }}>ptr && ptr→val</span> is safe — if ptr is NULL, the right side never runs.
            </div>
          </GlassCard>
        </div>
      </div>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 04 — ASSIGNMENT OPERATORS
// ─────────────────────────────────────────────────────────────────────────────
const ASSIGN_OPS = [
  { op: "=",   example: "x = 10",    result: v => 10,          desc: "Direct assignment. Value flows into variable.",    color: T.neon },
  { op: "+=",  example: "x += 3",    result: v => v + 3,       desc: "Add then assign. Equivalent to x = x + 3.",       color: T.neon2 },
  { op: "-=",  example: "x -= 2",    result: v => v - 2,       desc: "Subtract then assign. x = x - 2.",               color: T.neon4 },
  { op: "*=",  example: "x *= 4",    result: v => v * 4,       desc: "Multiply then assign. x = x * 4.",               color: T.accent },
  { op: "/=",  example: "x /= 2",    result: v => Math.trunc(v / 2), desc: "Integer divide then assign. x = x / 2.",  color: T.neon3 },
  { op: "%=",  example: "x %= 3",    result: v => v % 3,       desc: "Modulus then assign. x = x % 3.",               color: "#7EB5FF" },
];

function AssignmentSection() {
  const [xVal, setXVal] = useState(10);
  const [selected, setSelected] = useState(1);
  const [animating, setAnimating] = useState(false);
  const [prevVal, setPrevVal] = useState(null);
  const op = ASSIGN_OPS[selected];
  const newVal = op.result(xVal);

  const applyOp = () => {
    if (animating) return;
    setPrevVal(xVal);
    setAnimating(true);
    setTimeout(() => {
      setXVal(newVal);
      setAnimating(false);
      setPrevVal(null);
    }, 900);
  };

  return (
    <Section id="assignment">
      <SectionHeader num="04" tag="OPERATORS · ASSIGNMENT" title="Value Flow Engine" subtitle="Watch data flow into variables and transform them" />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
        <GlassCard style={{ padding: 28 }}>
          <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 4, color: op.color, marginBottom: 22 }}>
            📥 ASSIGNMENT VISUAL
          </div>

          {/* Variable container */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, marginBottom: 28, position: "relative" }}>
            {/* Source value */}
            <div style={{
              width: 65, height: 65, borderRadius: 10,
              background: `${op.color}15`, border: `1px dashed ${op.color}60`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: T.mono, fontSize: 20, color: op.color, fontWeight: 700,
            }}>
              {op.result(xVal) !== xVal ? op.result(xVal) : "?"}
            </div>

            {/* Flow line */}
            <div style={{ flex: 1, height: 2, background: `linear-gradient(90deg, ${op.color}60, ${op.color})`, position: "relative", maxWidth: 80 }}>
              {animating && (
                <motion.div
                  animate={{ x: ["0%", "100%"] }}
                  transition={{ duration: 0.8, ease: "easeIn" }}
                  style={{
                    position: "absolute", top: "50%", transform: "translateY(-50%)",
                    width: 12, height: 12, borderRadius: "50%", background: op.color,
                    boxShadow: `0 0 20px ${op.color}`,
                  }}
                />
              )}
              <div style={{ position: "absolute", right: -4, top: "50%", transform: "translateY(-50%)", color: op.color, fontWeight: 700 }}>›</div>
            </div>

            {/* Variable box */}
            <motion.div
              animate={{
                borderColor: animating ? op.color : `${op.color}60`,
                boxShadow: animating ? `0 0 40px ${op.color}80` : "none",
              }}
              style={{
                width: 100, height: 100, borderRadius: 14,
                background: `${op.color}10`, border: `2px solid ${op.color}60`,
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              }}
            >
              <div style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, marginBottom: 4 }}>x</div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={xVal}
                  initial={{ y: -15, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 15, opacity: 0 }}
                  style={{ fontFamily: T.mono, fontSize: 32, fontWeight: 800, color: op.color }}
                >
                  {xVal}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Op display */}
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <code style={{
              fontFamily: T.mono, fontSize: 18, color: op.color, fontWeight: 700,
              background: `${op.color}10`, border: `1px solid ${op.color}30`,
              padding: "8px 20px", borderRadius: 8,
            }}>
              x {op.op} {op.op === "=" ? "10" : op.example.split(" ")[2]}
            </code>
            <div style={{ fontFamily: T.mono, fontSize: 11, color: T.muted, marginTop: 8 }}>
              → x becomes {newVal}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={applyOp}
              style={{
                flex: 1, fontFamily: T.display, fontWeight: 700, fontSize: 11, letterSpacing: 3,
                color: "#000", background: `linear-gradient(135deg, ${op.color}, ${T.neon2})`,
                border: "none", borderRadius: 8, padding: "12px", cursor: "pointer",
              }}
            >
              ▶ APPLY {op.op}
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => { setXVal(10); setAnimating(false); }}
              style={{
                fontFamily: T.mono, fontWeight: 700, fontSize: 10, letterSpacing: 2,
                color: T.muted, background: "transparent", border: `1px solid ${T.dim}`,
                borderRadius: 8, padding: "12px 16px", cursor: "pointer",
              }}
            >
              RESET
            </motion.button>
          </div>
        </GlassCard>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {ASSIGN_OPS.map((o, i) => (
            <motion.div
              key={o.op}
              whileHover={{ x: 4 }}
              onClick={() => setSelected(i)}
              style={{
                padding: "12px 16px", borderRadius: 10, cursor: "pointer",
                background: selected === i ? `${o.color}10` : "rgba(255,255,255,0.02)",
                border: `1px solid ${selected === i ? o.color : T.dim}`,
                transition: "all 0.2s",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <code style={{ fontFamily: T.mono, fontSize: 14, fontWeight: 700, color: o.color, minWidth: 28 }}>{o.op}</code>
                <code style={{ fontFamily: T.mono, fontSize: 11, color: T.muted }}>{o.example}</code>
              </div>
              <AnimatePresence>
                {selected === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    style={{ overflow: "hidden" }}
                  >
                    <div style={{ fontFamily: T.mono, fontSize: 11, color: T.text, lineHeight: 1.75, marginTop: 8 }}>
                      {o.desc}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 05 — INCREMENT / DECREMENT
// ─────────────────────────────────────────────────────────────────────────────
function IncDecSection() {
  const [i, setI] = useState(5);
  const [mode, setMode] = useState("post-inc"); // pre-inc, post-inc, pre-dec, post-dec
  const [step, setStep] = useState(0);
  const [used, setUsed] = useState(null);
  const [stored, setStored] = useState(null);
  const [animating, setAnimating] = useState(false);

  const configs = {
    "post-inc": {
      label: "i++", name: "Post-Increment", color: T.neon,
      steps: [
        { desc: "Read current value of i", readVal: i,   iVal: i, usedVal: i },
        { desc: "Use (return) current value first", readVal: i, iVal: i, usedVal: i },
        { desc: "Then increment i by 1", readVal: i+1, iVal: i+1, usedVal: i },
        { desc: "Operation complete", readVal: i+1, iVal: i+1, usedVal: i+1 },
      ],
      finalI: i + 1,
    },
    "pre-inc": {
      label: "++i", name: "Pre-Increment", color: T.neon2,
      steps: [
        { desc: "Read current value of i", readVal: i, iVal: i },
        { desc: "Increment i by 1 FIRST", readVal: i+1, iVal: i+1 },
        { desc: "Then use (return) new value", readVal: i+1, iVal: i+1, usedVal: i+1 },
      ],
      finalI: i + 1,
    },
    "post-dec": {
      label: "i--", name: "Post-Decrement", color: T.neon4,
      steps: [
        { desc: "Read current value of i", readVal: i, iVal: i, usedVal: i },
        { desc: "Use current value first", readVal: i, iVal: i, usedVal: i },
        { desc: "Then decrement i by 1", readVal: i-1, iVal: i-1, usedVal: i },
      ],
      finalI: i - 1,
    },
    "pre-dec": {
      label: "--i", name: "Pre-Decrement", color: T.neon3,
      steps: [
        { desc: "Read current value of i", readVal: i, iVal: i },
        { desc: "Decrement i FIRST", readVal: i-1, iVal: i-1 },
        { desc: "Use new decremented value", readVal: i-1, iVal: i-1, usedVal: i-1 },
      ],
      finalI: i - 1,
    },
  };

  const config = configs[mode];
  const currentStep = config.steps[Math.min(step, config.steps.length - 1)];

  const runStep = () => {
    if (step < config.steps.length - 1) {
      setStep(s => s + 1);
    } else {
      setI(config.finalI);
      setStep(0);
    }
  };

  return (
    <Section id="incdec">
      <SectionHeader num="05" tag="OPERATORS · INCREMENT/DECREMENT" title="The Step Machine" subtitle="The ONE place where i++ and ++i behave differently — visualized" />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
        <GlassCard style={{ padding: 28 }}>
          <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 4, color: config.color, marginBottom: 22 }}>
            🔢 STEP-BY-STEP EXECUTION
          </div>

          {/* Mode selector */}
          <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
            {Object.entries(configs).map(([k, v]) => (
              <Pill key={k} color={v.color} active={mode === k} onClick={() => { setMode(k); setStep(0); }}>
                {v.label}
              </Pill>
            ))}
          </div>

          {/* Variable display */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 30, marginBottom: 28 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, marginBottom: 6 }}>i (memory)</div>
              <motion.div
                key={currentStep?.iVal}
                animate={{ scale: [1.3, 1], color: [config.color, T.text] }}
                style={{
                  width: 80, height: 80, borderRadius: 12,
                  background: `${config.color}15`, border: `2px solid ${config.color}60`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: T.mono, fontSize: 28, fontWeight: 800, color: T.text,
                }}
              >
                {currentStep?.iVal ?? i}
              </motion.div>
            </div>

            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, marginBottom: 6 }}>used value</div>
              <div style={{
                width: 80, height: 80, borderRadius: 12,
                background: currentStep?.usedVal !== undefined ? `${T.neon2}15` : T.dim,
                border: `2px solid ${currentStep?.usedVal !== undefined ? T.neon2 : T.muted}60`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: T.mono, fontSize: 28, fontWeight: 800,
                color: currentStep?.usedVal !== undefined ? T.neon2 : T.muted,
              }}>
                {currentStep?.usedVal !== undefined ? currentStep.usedVal : "—"}
              </div>
            </div>
          </div>

          {/* Current step description */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              style={{
                padding: "14px 16px", borderRadius: 10,
                background: `${config.color}10`, border: `1px solid ${config.color}35`,
                fontFamily: T.mono, fontSize: 12, color: T.text, lineHeight: 1.7,
                marginBottom: 20, minHeight: 56,
              }}
            >
              <span style={{ color: config.color, fontWeight: 700 }}>STEP {step + 1}:</span>{" "}
              {currentStep?.desc}
            </motion.div>
          </AnimatePresence>

          {/* Progress */}
          <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
            {config.steps.map((_, si) => (
              <div key={si} style={{
                flex: 1, height: 3, borderRadius: 2,
                background: si <= step ? config.color : T.dim,
                transition: "background 0.3s",
              }} />
            ))}
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={runStep}
              style={{
                flex: 1, fontFamily: T.display, fontWeight: 700, fontSize: 11, letterSpacing: 3,
                color: "#000", background: `linear-gradient(135deg, ${config.color}, ${T.neon2})`,
                border: "none", borderRadius: 8, padding: "12px", cursor: "pointer",
              }}
            >
              {step < config.steps.length - 1 ? `▶ NEXT STEP (${step + 1}/${config.steps.length})` : "✓ APPLY & RESET"}
            </motion.button>
            <motion.button whileTap={{ scale: 0.96 }} onClick={() => setStep(0)}
              style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, background: "transparent", border: `1px solid ${T.dim}`, borderRadius: 8, padding: "12px 14px", cursor: "pointer" }}>
              ↺
            </motion.button>
          </div>
        </GlassCard>

        {/* Comparison */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <GlassCard style={{ padding: 22 }} hover={false}>
            <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 4, color: T.neon3, marginBottom: 16 }}>
              ⚠ THE CRITICAL DIFFERENCE
            </div>
            {[
              { label: "int i = 5;", color: T.muted },
              { label: "int a = i++;  // a=5, i=6 (use THEN increment)", color: T.neon4 },
              { label: "int b = ++i;  // b=7, i=7 (increment THEN use)", color: T.neon },
              { label: "// In standalone use: i++ and ++i are identical", color: T.muted },
            ].map((line, li) => (
              <div key={li} style={{ fontFamily: T.mono, fontSize: 11, color: line.color, lineHeight: 2, paddingLeft: 8, borderLeft: `2px solid ${li === 1 || li === 2 ? line.color : "transparent"}` }}>
                {line.label}
              </div>
            ))}
          </GlassCard>

          <GlassCard style={{ padding: 20 }} hover={false}>
            <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 4, color: T.neon, marginBottom: 12 }}>
              🧠 MENTAL MODEL
            </div>
            <div style={{ fontFamily: T.mono, fontSize: 11, color: T.text, lineHeight: 1.85 }}>
              <span style={{ color: T.neon2 }}>PREFIX (++i)</span>: "Increment, THEN use"{"\n"}
              <span style={{ color: T.neon4 }}>POSTFIX (i++)</span>: "Use, THEN increment"{"\n\n"}
              In a <span style={{ color: T.neon }}>for loop</span>: <code>for(i=0; i&lt;n; i++)</code>{"\n"}
              Post vs pre doesn't matter here — the increment happens separately after the loop body executes.
            </div>
          </GlassCard>

          <CodeBlock
            code={`int i = 5;\n\n// Postfix — use first\nint a = i++;   // a=5, i=6\n\n// Reset\ni = 5;\n\n// Prefix — increment first\nint b = ++i;   // b=6, i=6`}
            highlightLine={mode.includes("pre") ? 9 : 3}
          />
        </div>
      </div>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 06 — OPERATOR PRECEDENCE
// ─────────────────────────────────────────────────────────────────────────────
function PrecedenceTree({ expr, steps, currentStep }) {
  // Simple expression tree renderer
  const PREC_LEVELS = [
    { ops: ["()"],       level: 14, color: T.neon,   label: "Highest" },
    { ops: ["*", "/", "%"], level: 12, color: T.neon2 },
    { ops: ["+", "-"],  level: 11, color: T.neon4 },
    { ops: ["<", ">", "<=", ">="], level: 9, color: T.accent },
    { ops: ["==", "!="],level: 8,  color: "#7EB5FF" },
    { ops: ["&&"],      level: 4,  color: T.neon3 },
    { ops: ["||"],      level: 3,  color: "#FF8FA3" },
    { ops: ["="],       level: 1,  color: T.muted, label: "Lowest" },
  ];

  return (
    <div>
      <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 4, color: T.neon, marginBottom: 16 }}>
        PRECEDENCE LADDER (HIGH → LOW)
      </div>
      {PREC_LEVELS.map((row, ri) => (
        <div key={ri} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <div style={{ width: 22, textAlign: "right", fontFamily: T.mono, fontSize: 9, color: T.dim }}>{row.level}</div>
          <div style={{ height: 1, width: `${row.level * 6}px`, background: `${row.color}60`, borderRadius: 1 }} />
          <div style={{ display: "flex", gap: 5 }}>
            {row.ops.map(op => (
              <span key={op} style={{
                fontFamily: T.mono, fontSize: 11, fontWeight: 700, color: row.color,
                background: `${row.color}12`, border: `1px solid ${row.color}30`,
                padding: "2px 8px", borderRadius: 4,
              }}>{op}</span>
            ))}
          </div>
          {row.label && <span style={{ fontFamily: T.mono, fontSize: 9, color: T.muted }}>← {row.label}</span>}
        </div>
      ))}
    </div>
  );
}

function PrecedenceSection() {
  const [exprIdx, setExprIdx] = useState(0);
  const [evalStep, setEvalStep] = useState(0);

  const EXPRS = [
    {
      expr: "3 + 5 * 2",
      steps: [
        { highlight: [2, 3, 4], partial: "3 + [5 * 2]", result: "3 + 10", explanation: "* has higher precedence than +, evaluate 5 × 2 = 10 first", color: T.neon2 },
        { highlight: [0, 1, 2], partial: "[3 + 10]",   result: "13",      explanation: "Now evaluate 3 + 10 = 13", color: T.neon },
      ],
    },
    {
      expr: "2 + 3 * 4 - 1",
      steps: [
        { highlight: [2, 3, 4], partial: "2 + [3 * 4] - 1", result: "2 + 12 - 1", explanation: "* first: 3 × 4 = 12", color: T.neon2 },
        { highlight: [0, 1, 2], partial: "[2 + 12] - 1",    result: "14 - 1",      explanation: "Left-to-right: 2 + 12 = 14", color: T.neon },
        { highlight: [0, 1, 2], partial: "[14 - 1]",         result: "13",          explanation: "14 - 1 = 13", color: T.neon },
      ],
    },
    {
      expr: "(3 + 5) * 2",
      steps: [
        { highlight: [0, 1, 2], partial: "[(3 + 5)] * 2", result: "8 * 2", explanation: "Parentheses FIRST: 3 + 5 = 8", color: T.neon },
        { highlight: [0, 1, 2], partial: "[8 * 2]",        result: "16",    explanation: "Then multiply: 8 × 2 = 16", color: T.neon2 },
      ],
    },
    {
      expr: "x = 3 + 5 * 2",
      steps: [
        { highlight: [3, 4, 5], partial: "x = 3 + [5 * 2]", result: "x = 3 + 10", explanation: "* first (precedence 12 > 11): 5 × 2 = 10", color: T.neon2 },
        { highlight: [2, 3, 4], partial: "x = [3 + 10]",    result: "x = 13",     explanation: "+ next: 3 + 10 = 13", color: T.neon },
        { highlight: [0, 1, 2], partial: "[x = 13]",         result: "x is now 13", explanation: "= last (lowest precedence): assign 13 to x", color: T.muted },
      ],
    },
  ];

  const current = EXPRS[exprIdx];
  const currentEval = current.steps[Math.min(evalStep, current.steps.length - 1)];

  return (
    <Section id="precedence">
      <SectionHeader num="06" tag="OPERATORS · PRECEDENCE" title="The Evaluation Order" subtitle="BODMAS for C — see exactly which operation runs first" />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
        <GlassCard style={{ padding: 28 }}>
          <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 4, color: T.neon, marginBottom: 20 }}>
            🌳 EXPRESSION EVALUATOR
          </div>

          {/* Expr selector */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
            {EXPRS.map((e, i) => (
              <Pill key={i} color={T.neon} active={exprIdx === i} onClick={() => { setExprIdx(i); setEvalStep(0); }}>
                {e.expr}
              </Pill>
            ))}
          </div>

          {/* Expression display */}
          <div style={{
            padding: "20px 24px", borderRadius: 12,
            background: "rgba(0,0,0,0.4)", border: `1px solid ${T.dim}`,
            textAlign: "center", marginBottom: 20,
          }}>
            <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, marginBottom: 8 }}>EXPRESSION</div>
            <div style={{ fontFamily: T.display, fontSize: 28, fontWeight: 800, color: T.text, letterSpacing: 4 }}>
              {current.expr}
            </div>
          </div>

          {/* Evaluation steps */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`${exprIdx}-${evalStep}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{ marginBottom: 20 }}
            >
              <div style={{
                padding: "16px 20px", borderRadius: 10,
                background: `${currentEval.color}10`,
                border: `1px solid ${currentEval.color}40`,
              }}>
                <div style={{ fontFamily: T.mono, fontSize: 9, color: currentEval.color, letterSpacing: 3, marginBottom: 8 }}>
                  STEP {evalStep + 1} / {current.steps.length}
                </div>
                <div style={{ fontFamily: T.display, fontSize: 20, fontWeight: 700, color: currentEval.color, marginBottom: 8 }}>
                  {currentEval.partial}
                </div>
                <div style={{ fontFamily: T.mono, fontSize: 12, color: T.text, lineHeight: 1.7 }}>
                  {currentEval.explanation}
                </div>
                <div style={{ fontFamily: T.mono, fontSize: 16, fontWeight: 700, color: T.neon, marginTop: 8 }}>
                  → {currentEval.result}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Step progress */}
          <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
            {current.steps.map((s, si) => (
              <motion.div key={si}
                animate={{ background: si <= evalStep ? s.color : T.dim }}
                style={{ flex: 1, height: 4, borderRadius: 2, cursor: "pointer" }}
                onClick={() => setEvalStep(si)}
              />
            ))}
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <motion.button whileTap={{ scale: 0.96 }} onClick={() => setEvalStep(s => Math.max(0, s - 1))} disabled={evalStep === 0}
              style={{ flex: 1, fontFamily: T.mono, fontWeight: 700, fontSize: 10, letterSpacing: 2, color: evalStep === 0 ? T.muted : T.neon, background: "transparent", border: `1px solid ${evalStep === 0 ? T.dim : T.border}`, borderRadius: 8, padding: "11px", cursor: "pointer" }}>
              ← PREV
            </motion.button>
            <motion.button whileTap={{ scale: 0.96 }}
              onClick={() => evalStep < current.steps.length - 1 ? setEvalStep(s => s + 1) : setEvalStep(0)}
              style={{
                flex: 2, fontFamily: T.display, fontWeight: 700, fontSize: 11, letterSpacing: 3,
                color: "#000", background: `linear-gradient(135deg, ${T.neon}, ${T.neon2})`,
                border: "none", borderRadius: 8, padding: "11px", cursor: "pointer",
              }}>
              {evalStep < current.steps.length - 1 ? "▶ NEXT STEP" : "↺ RESTART"}
            </motion.button>
          </div>
        </GlassCard>

        <GlassCard style={{ padding: 24 }} hover={false}>
          <PrecedenceTree />
        </GlassCard>
      </div>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 07 — IF / ELSE / ELSE-IF
// ─────────────────────────────────────────────────────────────────────────────
function IfElseSection() {
  const [score, setScore] = useState(72);
  const [step, setStep] = useState(-1);
  const [running, setRunning] = useState(false);
  const [path, setPath] = useState(null);

  const getGrade = (s) => {
    if (s >= 90) return { grade: "A", label: "EXCELLENT", color: T.neon, branch: 0 };
    if (s >= 80) return { grade: "B", label: "GOOD",      color: T.neon2, branch: 1 };
    if (s >= 70) return { grade: "C", label: "AVERAGE",   color: T.neon4, branch: 2 };
    if (s >= 60) return { grade: "D", label: "BELOW AVG", color: T.accent, branch: 3 };
    return              { grade: "F", label: "FAIL",       color: T.neon3, branch: 4 };
  };

  const gradeInfo = getGrade(score);

  const run = async () => {
    if (running) return;
    setRunning(true);
    setPath(null);
    for (let i = 0; i <= gradeInfo.branch; i++) {
      setStep(i);
      await new Promise(r => setTimeout(r, 650));
    }
    setPath(gradeInfo);
    await new Promise(r => setTimeout(r, 500));
    setRunning(false);
    setStep(-1);
  };

  const branches = [
    { cond: "score >= 90", grade: "A", color: T.neon,   y: 80  },
    { cond: "score >= 80", grade: "B", color: T.neon2,  y: 160 },
    { cond: "score >= 70", grade: "C", color: T.neon4,  y: 240 },
    { cond: "score >= 60", grade: "D", color: T.accent, y: 320 },
    { cond: "else",        grade: "F", color: T.neon3,  y: 400 },
  ];

  return (
    <Section id="ifelse">
      <SectionHeader num="07" tag="CONTROL FLOW · DECISIONS" title="The Branch Engine" subtitle="Conditions create paths — only one path executes" />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
        {/* Flowchart visual */}
        <GlassCard style={{ padding: 28 }}>
          <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 4, color: T.neon, marginBottom: 20 }}>
            🔀 CONDITION FLOW
          </div>

          {/* Score slider */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontFamily: T.mono, fontSize: 11, color: T.muted }}>score</span>
              <motion.span
                key={score}
                animate={{ scale: [1.3, 1], color: [gradeInfo.color, T.text] }}
                style={{ fontFamily: T.mono, fontSize: 22, fontWeight: 800 }}
              >
                {score}
              </motion.span>
            </div>
            <input type="range" min={0} max={100} value={score} onChange={e => { setScore(Number(e.target.value)); setPath(null); }}
              style={{ width: "100%", accentColor: gradeInfo.color }} />
          </div>

          {/* Branch visualizer */}
          <div style={{ position: "relative", minHeight: 430 }}>
            {/* Entry */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
              <div style={{
                padding: "8px 22px", borderRadius: 20, background: `${T.neon}15`,
                border: `1px solid ${T.neon}40`, fontFamily: T.mono, fontSize: 11, color: T.neon,
              }}>
                START → score = {score}
              </div>
            </div>

            {/* Connector down */}
            <div style={{ width: 2, height: 14, background: T.muted, margin: "0 auto 8px" }} />

            {branches.map((b, bi) => {
              const isActive = step === bi;
              const isTaken = path && path.branch === bi;
              const isPast = step > bi || (path && path.branch > bi);
              return (
                <div key={bi} style={{ marginBottom: 6 }}>
                  {/* Diamond/condition */}
                  <motion.div
                    animate={{
                      borderColor: isActive ? b.color : (isTaken ? b.color : T.dim),
                      background: isActive ? `${b.color}18` : (isTaken ? `${b.color}10` : T.bg2),
                      boxShadow: isActive ? `0 0 30px ${b.color}50` : "none",
                    }}
                    style={{
                      padding: "9px 16px", borderRadius: 8, margin: "0 30px",
                      border: "1px solid", fontFamily: T.mono, fontSize: 11,
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                    }}
                  >
                    <code style={{ color: isActive || isTaken ? b.color : T.muted }}>
                      {bi === 0 ? "if" : bi === 4 ? "else" : "else if"} ({b.cond})
                    </code>
                    {isTaken && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        style={{ fontFamily: T.mono, fontSize: 10, color: b.color, fontWeight: 700 }}
                      >
                        → grade = '{b.grade}' ✓
                      </motion.div>
                    )}
                    {isActive && !isTaken && (
                      <motion.div
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                        style={{ fontFamily: T.mono, fontSize: 9, color: b.color }}
                      >
                        CHECKING...
                      </motion.div>
                    )}
                  </motion.div>
                  {bi < branches.length - 1 && (
                    <div style={{ width: 2, height: 6, background: isPast ? T.dim : T.dim, margin: "0 auto" }} />
                  )}
                </div>
              );
            })}

            {/* Result */}
            <AnimatePresence>
              {path && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{
                    marginTop: 12, padding: "14px 20px", borderRadius: 12, textAlign: "center",
                    background: `${path.color}18`, border: `2px solid ${path.color}`,
                    boxShadow: `0 0 40px ${path.color}40`,
                  }}
                >
                  <div style={{ fontFamily: T.display, fontSize: 32, fontWeight: 800, color: path.color }}>
                    Grade: {path.grade}
                  </div>
                  <div style={{ fontFamily: T.mono, fontSize: 10, color: T.muted }}>{path.label}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} onClick={run} disabled={running}
            style={{
              width: "100%", fontFamily: T.display, fontWeight: 700, fontSize: 11, letterSpacing: 4,
              color: "#000", background: `linear-gradient(135deg, ${T.neon}, ${T.neon2})`,
              border: "none", borderRadius: 8, padding: "13px", cursor: "pointer", marginTop: 16,
            }}>
            {running ? "EVALUATING..." : "▶ SIMULATE EXECUTION"}
          </motion.button>
        </GlassCard>

        {/* Code + insights */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <CodeBlock
            code={`int score = ${score};\nchar grade;\n\nif (score >= 90) {\n    grade = 'A';\n} else if (score >= 80) {\n    grade = 'B';\n} else if (score >= 70) {\n    grade = 'C';\n} else if (score >= 60) {\n    grade = 'D';\n} else {\n    grade = 'F';\n}\n\n// grade = '${getGrade(score).grade}'`}
            highlightLine={2 + getGrade(score).branch * 2}
          />

          <GlassCard style={{ padding: 20 }} hover={false}>
            <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 4, color: T.neon2, marginBottom: 12 }}>
              🧠 HOW IF-ELSE WORKS
            </div>
            <div style={{ fontFamily: T.mono, fontSize: 11, color: T.text, lineHeight: 1.85 }}>
              C evaluates conditions <span style={{ color: T.neon }}>top to bottom</span>.{"\n"}
              The FIRST true condition executes, then it <span style={{ color: T.neon2 }}>jumps past</span> all other branches.{"\n\n"}
              <span style={{ color: T.neon4 }}>Only ONE branch ever runs</span> — not multiple.{"\n"}
              That's what makes it a decision, not a filter.
            </div>
          </GlassCard>

          <GlassCard style={{ padding: 20 }} hover={false}>
            <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 4, color: T.neon3, marginBottom: 12 }}>
              ⚠ COMMON MISTAKES
            </div>
            <div style={{ fontFamily: T.mono, fontSize: 11, color: T.text, lineHeight: 1.85 }}>
              • Using <span style={{ color: T.neon3 }}>if</span> for every branch instead of else-if{"\n"}
                → All conditions get checked (even after match){"\n\n"}
              • Missing braces for single-line if:{"\n"}
                <span style={{ color: T.neon3 }}>if(x) foo(); bar();</span> — bar() ALWAYS runs!{"\n\n"}
              • Dangling else ambiguity — always use braces.
            </div>
          </GlassCard>
        </div>
      </div>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 08 — SWITCH
// ─────────────────────────────────────────────────────────────────────────────
function SwitchSection() {
  const [day, setDay] = useState(3);
  const [showFallthrough, setShowFallthrough] = useState(false);
  const [animDay, setAnimDay] = useState(null);

  const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const TYPES = [
    { label: "Weekday", cases: [1,2,3,4,5], color: T.neon2 },
    { label: "Weekend!", cases: [6,7], color: T.neon },
  ];

  const dayType = day <= 5 ? "Weekday" : "Weekend!";

  const runAnim = (d) => {
    setAnimDay(null);
    setTimeout(() => setAnimDay(d), 50);
  };

  return (
    <Section id="switchcase">
      <SectionHeader num="08" tag="CONTROL FLOW · SWITCH" title="The Routing Engine" subtitle="Value matches a case — signal routes to the matching path" />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
        <GlassCard style={{ padding: 28 }}>
          <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 4, color: T.neon4, marginBottom: 20 }}>
            🎛 SWITCH ROUTER
          </div>

          {/* Day selector */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 24 }}>
            {DAYS.map((d, i) => {
              const num = i + 1;
              const isActive = day === num;
              const isWeekend = num > 5;
              return (
                <motion.button
                  key={d}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => { setDay(num); runAnim(num); }}
                  style={{
                    fontFamily: T.mono, fontSize: 9, fontWeight: 700,
                    color: isActive ? "#000" : (isWeekend ? T.neon : T.neon2),
                    background: isActive ? (isWeekend ? T.neon : T.neon2) : "transparent",
                    border: `1px solid ${isWeekend ? `${T.neon}50` : `${T.neon2}50`}`,
                    borderRadius: 6, padding: "7px 10px", cursor: "pointer", letterSpacing: 1,
                    transition: "all 0.18s",
                  }}
                >
                  {d.slice(0, 3)} ({num})
                </motion.button>
              );
            })}
          </div>

          {/* Signal flow visual */}
          <div style={{ position: "relative" }}>
            {/* Entry point */}
            <div style={{
              padding: "10px 16px", borderRadius: 8, background: `${T.neon4}15`,
              border: `1px solid ${T.neon4}40`, fontFamily: T.mono, fontSize: 12, color: T.neon4,
              marginBottom: 10, textAlign: "center",
            }}>
              switch (day = {day})
            </div>

            <div style={{ width: 2, height: 12, background: T.muted, margin: "0 auto 8px" }} />

            {/* Cases */}
            {[1,2,3,4,5,6,7].map(c => {
              const isMatch = c === day;
              const isWeekend = c > 5;
              const caseColor = isWeekend ? T.neon : T.neon2;
              return (
                <div key={c} style={{ marginBottom: 4 }}>
                  <motion.div
                    animate={{
                      background: isMatch ? `${caseColor}20` : "transparent",
                      borderColor: isMatch ? caseColor : T.dim,
                      boxShadow: isMatch ? `0 0 25px ${caseColor}50` : "none",
                    }}
                    style={{
                      padding: "8px 14px", borderRadius: 6, border: "1px solid",
                      fontFamily: T.mono, fontSize: 11,
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                    }}
                  >
                    <span style={{ color: isMatch ? caseColor : T.muted }}>
                      case {c}: <span style={{ color: T.muted }}>{DAYS[c-1]}</span>
                    </span>
                    {isMatch && (
                      <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
                        <NeonTag color={caseColor}>MATCH → {isWeekend ? "Weekend!" : "Weekday"}</NeonTag>
                      </motion.div>
                    )}
                  </motion.div>
                </div>
              );
            })}
          </div>

          {/* Result */}
          <motion.div
            key={day}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
              marginTop: 14, padding: "14px", borderRadius: 10, textAlign: "center",
              background: `${day > 5 ? T.neon : T.neon2}15`,
              border: `2px solid ${day > 5 ? T.neon : T.neon2}`,
            }}
          >
            <div style={{ fontFamily: T.display, fontSize: 22, fontWeight: 800, color: day > 5 ? T.neon : T.neon2 }}>
              {day > 5 ? "🎉 Weekend!" : "💼 Weekday"}
            </div>
          </motion.div>
        </GlassCard>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <CodeBlock
            code={`switch (day) {\n    case 1: case 2: case 3:\n    case 4: case 5:\n        printf("Weekday");\n        break; // ← CRITICAL!\n    case 6: case 7:\n        printf("Weekend!");\n        break;\n    default:\n        printf("Invalid");\n}\n// day = ${day} → ${day > 5 ? "Weekend!" : day >= 1 ? "Weekday" : "Invalid"}`}
            highlightLine={day > 5 ? 5 : day >= 1 ? 1 : 8}
          />

          <GlassCard style={{ padding: 20 }} hover={false}>
            <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 4, color: T.neon3, marginBottom: 12 }}>
              ⚠ FALLTHROUGH — THE SILENT KILLER
            </div>
            <div style={{ fontFamily: T.mono, fontSize: 11, color: T.text, lineHeight: 1.85 }}>
              Without <span style={{ color: T.neon3 }}>break</span>, execution continues INTO the next case.{"\n\n"}
              This is sometimes intentional (grouping cases){"\n"}
              but usually a <span style={{ color: T.neon3 }}>devastating bug</span>.{"\n\n"}
              Always use <span style={{ color: T.neon }}>break</span> unless you INTENTIONALLY want fallthrough.
            </div>
          </GlassCard>

          <GlassCard style={{ padding: 20 }} hover={false}>
            <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 4, color: T.neon, marginBottom: 12 }}>
              🧠 SWITCH vs IF-ELSE
            </div>
            <div style={{ fontFamily: T.mono, fontSize: 11, color: T.text, lineHeight: 1.85 }}>
              Switch uses a <span style={{ color: T.neon2 }}>jump table</span> internally — O(1) lookup.{"\n"}
              If-else chains are O(n) — checked sequentially.{"\n\n"}
              Use switch when matching ONE integer/char to MANY values.{"\n"}
              Use if-else for ranges or complex conditions.
            </div>
          </GlassCard>
        </div>
      </div>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 09 — LOOPS
// ─────────────────────────────────────────────────────────────────────────────
function LoopsSection() {
  const [loopType, setLoopType] = useState("for");
  const [limit, setLimit] = useState(5);
  const [iterations, setIterations] = useState([]);
  const [running, setRunning] = useState(false);
  const [current, setCurrent] = useState(-1);
  const [phase, setPhase] = useState("");

  const runLoop = async () => {
    if (running) return;
    setRunning(true);
    setIterations([]);
    setCurrent(-1);

    if (loopType === "do-while") {
      // Always executes once
      let i = 0;
      do {
        setPhase(i === 0 ? "EXECUTE (first time, no check)" : "CHECK condition, then EXECUTE");
        setCurrent(i);
        await new Promise(r => setTimeout(r, 500));
        setIterations(prev => [...prev, i]);
        i++;
      } while (i < limit);
    } else {
      for (let i = 0; i < limit; i++) {
        setPhase(loopType === "for" ? `init: i=${i} | check: ${i}<${limit} ✓ | body` : `check: ${i}<${limit} ✓ | body`);
        setCurrent(i);
        await new Promise(r => setTimeout(r, 450));
        setIterations(prev => [...prev, i]);
      }
    }

    setPhase(`DONE — loop exited after ${limit} iterations`);
    setCurrent(-1);
    setRunning(false);
  };

  const reset = () => {
    setIterations([]);
    setCurrent(-1);
    setPhase("");
    setRunning(false);
  };

  const LOOP_CODES = {
    for: `for (int i = 0; i < ${limit}; i++) {\n    printf("%d ", i);\n}\n// Runs: ${limit} times`,
    while: `int i = 0;\nwhile (i < ${limit}) {\n    printf("%d ", i);\n    i++;\n}\n// Runs: ${limit} times`,
    "do-while": `int i = 0;\ndo {\n    printf("%d ", i); // ALWAYS runs once\n    i++;\n} while (i < ${limit});\n// Runs: ${limit} times${limit === 0 ? " (but once even if limit=0!)" : ""}`,
  };

  const LOOP_INFO = {
    for: {
      parts: ["Initialize (i=0)", "Condition (i < n)", "Body", "Increment (i++)", "→ Repeat"],
      color: T.neon,
      desc: "Use when you know the count upfront. init; condition; increment — all in one line.",
      mental: "Think: 'Repeat exactly N times'",
    },
    while: {
      parts: ["Condition check", "→ Body (if true)", "→ Back to check"],
      color: T.neon2,
      desc: "Use when you don't know how many iterations. Condition checked BEFORE body.",
      mental: "Think: 'Keep going WHILE something is true'",
    },
    "do-while": {
      parts: ["Body (FIRST)", "→ Condition check", "→ Repeat if true"],
      color: T.neon4,
      desc: "Body runs AT LEAST ONCE — condition checked AFTER. Like a menu that shows before asking to repeat.",
      mental: "Think: 'Do this, THEN decide if we repeat'",
    },
  };

  const info = LOOP_INFO[loopType];

  return (
    <Section id="loops">
      <SectionHeader num="09" tag="CONTROL FLOW · LOOPS" title="The Iteration Engine" subtitle="for / while / do-while — each has a different execution philosophy" />

      <div style={{ display: "flex", gap: 10, marginBottom: 28 }}>
        {Object.keys(LOOP_CODES).map(t => (
          <Pill key={t} color={LOOP_INFO[t].color} active={loopType === t} onClick={() => { setLoopType(t); reset(); }}>
            {t}
          </Pill>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
        <GlassCard style={{ padding: 28 }}>
          <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 4, color: info.color, marginBottom: 20 }}>
            🔄 LOOP EXECUTION VISUAL
          </div>

          {/* Limit */}
          <div style={{ marginBottom: 22 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontFamily: T.mono, fontSize: 10, color: T.muted }}>iterations (limit = n)</span>
              <span style={{ fontFamily: T.mono, fontSize: 16, fontWeight: 700, color: info.color }}>{limit}</span>
            </div>
            <input type="range" min={0} max={10} value={limit} onChange={e => { setLimit(Number(e.target.value)); reset(); }}
              style={{ width: "100%", accentColor: info.color }} />
          </div>

          {/* Loop flow diagram */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, marginBottom: 20 }}>
            {info.parts.map((part, pi) => (
              <motion.div
                key={pi}
                animate={{ background: running ? `${info.color}15` : "transparent" }}
                style={{
                  padding: "8px 20px", borderRadius: 8,
                  background: "rgba(255,255,255,0.02)", border: `1px solid ${info.color}30`,
                  fontFamily: T.mono, fontSize: 11, color: info.color,
                  width: "85%", textAlign: "center",
                }}
              >
                {part}
              </motion.div>
            ))}
          </div>

          {/* Current iteration indicator */}
          <AnimatePresence mode="wait">
            {phase && (
              <motion.div
                key={phase}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  padding: "10px 14px", borderRadius: 8, background: `${info.color}12`,
                  border: `1px solid ${info.color}40`, fontFamily: T.mono, fontSize: 10,
                  color: info.color, textAlign: "center", marginBottom: 14,
                }}
              >
                {phase}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Iteration bubbles */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, minHeight: 46, marginBottom: 16 }}>
            {iterations.map((it, idx) => (
              <motion.div
                key={idx}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                style={{
                  width: 36, height: 36, borderRadius: 8,
                  background: `${info.color}20`, border: `1px solid ${info.color}60`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: T.mono, fontSize: 12, fontWeight: 700, color: info.color,
                }}
              >
                {it}
              </motion.div>
            ))}
            {iterations.length === 0 && !running && (
              <div style={{ fontFamily: T.mono, fontSize: 11, color: T.muted, padding: "8px 0" }}>
                Press RUN to start the loop...
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={runLoop} disabled={running}
              style={{
                flex: 1, fontFamily: T.display, fontWeight: 700, fontSize: 11, letterSpacing: 3,
                color: "#000", background: `linear-gradient(135deg, ${info.color}, ${T.neon2})`,
                border: "none", borderRadius: 8, padding: "12px", cursor: "pointer",
              }}>
              {running ? "RUNNING..." : `▶ RUN ${loopType}`}
            </motion.button>
            <motion.button whileTap={{ scale: 0.96 }} onClick={reset}
              style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, background: "transparent", border: `1px solid ${T.dim}`, borderRadius: 8, padding: "12px 16px", cursor: "pointer" }}>
              ↺
            </motion.button>
          </div>
        </GlassCard>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <CodeBlock code={LOOP_CODES[loopType]} highlightLine={1} />

          <GlassCard style={{ padding: 20 }} hover={false}>
            <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 4, color: info.color, marginBottom: 12 }}>
              🧠 MENTAL MODEL
            </div>
            <div style={{ fontFamily: T.mono, fontSize: 12, color: info.color, fontWeight: 700, marginBottom: 8 }}>
              "{info.mental}"
            </div>
            <div style={{ fontFamily: T.mono, fontSize: 11, color: T.text, lineHeight: 1.85 }}>
              {info.desc}
            </div>
          </GlassCard>

          <GlassCard style={{ padding: 20 }} hover={false}>
            <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 4, color: T.neon3, marginBottom: 12 }}>
              ⚠ DO-WHILE KEY INSIGHT
            </div>
            <div style={{ fontFamily: T.mono, fontSize: 11, color: T.text, lineHeight: 1.85 }}>
              Even if <code style={{ color: T.neon4 }}>limit = 0</code>, a do-while loop executes the body <span style={{ color: T.neon }}>once</span>.{"\n\n"}
              That's the ONLY difference from while.{"\n"}
              Used for: menus, "try until valid input", retry loops.
            </div>
          </GlassCard>
        </div>
      </div>

      {/* 3D loop visualizer */}
      <GlassCard style={{ padding: 0, overflow: "hidden", height: 260, marginTop: 22 }} hover={false}>
        <div style={{ padding: "10px 18px", borderBottom: `1px solid ${T.dim}`, fontFamily: T.mono, fontSize: 9, color: info.color, letterSpacing: 4 }}>
          🔄 3D LOOP VISUALIZATION — {iterations.length} / {limit} iterations
        </div>
        <Canvas camera={{ position: [0, 0, 7], fov: 55 }} style={{ height: 220 }}>
          <ambientLight intensity={0.3} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <LoopOrb3D count={iterations.length} />
          <Stars radius={80} depth={30} count={600} factor={2} saturation={0} fade speed={0.3} />
        </Canvas>
      </GlassCard>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 10 — JUMP STATEMENTS
// ─────────────────────────────────────────────────────────────────────────────
function JumpsSection() {
  const [jumpType, setJumpType] = useState("break");
  const [skipVal, setSkipVal] = useState(3);
  const [breakAt, setBreakAt] = useState(5);
  const [iterations, setIterations] = useState([]);
  const [running, setRunning] = useState(false);
  const [currentI, setCurrentI] = useState(-1);

  const LIMIT = 10;

  const run = async () => {
    if (running) return;
    setRunning(true);
    setIterations([]);
    setCurrentI(-1);

    for (let i = 0; i < LIMIT; i++) {
      setCurrentI(i);
      await new Promise(r => setTimeout(r, 350));

      if (jumpType === "break" && i === breakAt) {
        setIterations(prev => [...prev, { i, type: "break", label: `BREAK at i=${i}` }]);
        await new Promise(r => setTimeout(r, 600));
        break;
      } else if (jumpType === "continue" && i === skipVal) {
        setIterations(prev => [...prev, { i, type: "skip", label: `SKIP i=${i}` }]);
        continue;
      } else {
        setIterations(prev => [...prev, { i, type: "normal" }]);
      }
    }

    setCurrentI(-1);
    setRunning(false);
  };

  const JUMP_CODES = {
    break: `for (int i = 0; i < 10; i++) {\n    if (i == ${breakAt}) break; // EXIT loop!\n    printf("%d ", i);\n}\n// Prints: ${Array.from({length: breakAt}, (_, i) => i).join(" ")}`,
    continue: `for (int i = 0; i < 10; i++) {\n    if (i == ${skipVal}) continue; // SKIP\n    printf("%d ", i);\n}\n// Prints: ${Array.from({length: 10}, (_, i) => i).filter(i => i !== skipVal).join(" ")}`,
  };

  return (
    <Section id="jumps">
      <SectionHeader num="10" tag="CONTROL FLOW · JUMP STATEMENTS" title="The Escape Engine" subtitle="break exits the loop — continue skips to next iteration" />

      <div style={{ display: "flex", gap: 10, marginBottom: 28 }}>
        <Pill color={T.neon3} active={jumpType === "break"} onClick={() => { setJumpType("break"); setIterations([]); }}>
          break — EXIT
        </Pill>
        <Pill color={T.neon2} active={jumpType === "continue"} onClick={() => { setJumpType("continue"); setIterations([]); }}>
          continue — SKIP
        </Pill>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
        <GlassCard style={{ padding: 28 }}>
          <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 4, color: jumpType === "break" ? T.neon3 : T.neon2, marginBottom: 22 }}>
            ⚡ JUMP VISUALIZER
          </div>

          {/* Controls */}
          {jumpType === "break" ? (
            <div style={{ marginBottom: 22 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontFamily: T.mono, fontSize: 10, color: T.muted }}>break when i ==</span>
                <span style={{ fontFamily: T.mono, fontSize: 16, fontWeight: 700, color: T.neon3 }}>{breakAt}</span>
              </div>
              <input type="range" min={0} max={9} value={breakAt} onChange={e => { setBreakAt(Number(e.target.value)); setIterations([]); }}
                style={{ width: "100%", accentColor: T.neon3 }} />
            </div>
          ) : (
            <div style={{ marginBottom: 22 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontFamily: T.mono, fontSize: 10, color: T.muted }}>skip when i ==</span>
                <span style={{ fontFamily: T.mono, fontSize: 16, fontWeight: 700, color: T.neon2 }}>{skipVal}</span>
              </div>
              <input type="range" min={0} max={9} value={skipVal} onChange={e => { setSkipVal(Number(e.target.value)); setIterations([]); }}
                style={{ width: "100%", accentColor: T.neon2 }} />
            </div>
          )}

          {/* Iteration grid */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 20 }}>
            {Array.from({length: LIMIT}, (_, i) => i).map(i => {
              const iterResult = iterations.find(it => it.i === i);
              const isActive = currentI === i;
              const color = iterResult?.type === "break" ? T.neon3 :
                           iterResult?.type === "skip"  ? T.neon2 :
                           iterResult ? T.neon : T.muted;
              return (
                <motion.div
                  key={i}
                  animate={{
                    background: isActive ? `${T.neon}20` : iterResult ? `${color}15` : T.dim,
                    borderColor: isActive ? T.neon : color,
                    scale: isActive ? 1.2 : 1,
                    boxShadow: isActive ? `0 0 20px ${T.neon}` : iterResult?.type === "break" ? `0 0 15px ${T.neon3}60` : "none",
                  }}
                  style={{
                    width: 44, height: 44, borderRadius: 8,
                    border: "1px solid", display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center",
                  }}
                >
                  <span style={{ fontFamily: T.mono, fontSize: 13, fontWeight: 700, color }}>
                    {i}
                  </span>
                  {iterResult?.type === "break" && <span style={{ fontSize: 8, color: T.neon3 }}>🛑</span>}
                  {iterResult?.type === "skip" && <span style={{ fontSize: 8, color: T.neon2 }}>↷</span>}
                </motion.div>
              );
            })}
          </div>

          {/* Log */}
          <div style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, marginBottom: 16, minHeight: 24 }}>
            {iterations.filter(it => it.type !== "normal").map(it => (
              <motion.div key={it.i} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ color: it.type === "break" ? T.neon3 : T.neon2 }}>
                {it.label}
              </motion.div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={run} disabled={running}
              style={{
                flex: 1, fontFamily: T.display, fontWeight: 700, fontSize: 11, letterSpacing: 3,
                color: "#000", background: `linear-gradient(135deg, ${jumpType === "break" ? T.neon3 : T.neon2}, ${T.neon})`,
                border: "none", borderRadius: 8, padding: "12px", cursor: "pointer",
              }}>
              {running ? "EXECUTING..." : `▶ RUN WITH ${jumpType.toUpperCase()}`}
            </motion.button>
            <motion.button whileTap={{ scale: 0.96 }} onClick={() => { setIterations([]); setCurrentI(-1); setRunning(false); }}
              style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, background: "transparent", border: `1px solid ${T.dim}`, borderRadius: 8, padding: "12px 16px", cursor: "pointer" }}>
              ↺
            </motion.button>
          </div>
        </GlassCard>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <CodeBlock code={JUMP_CODES[jumpType]} highlightLine={1} />

          {[
            {
              title: "break — Full Stop",
              color: T.neon3,
              content: "Immediately exits the nearest enclosing loop or switch.\nExecution continues AFTER the loop's closing brace.\nAlso exits switch cases (prevents fallthrough).",
            },
            {
              title: "continue — Skip Ahead",
              color: T.neon2,
              content: "Skips the REST of the current loop body.\nJumps directly to the increment/condition check.\nThe loop CONTINUES — just this iteration's body is skipped.",
            },
          ].map(item => (
            <GlassCard key={item.title} style={{ padding: 20 }} hover={false}>
              <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 4, color: item.color, marginBottom: 8 }}>
                {item.title}
              </div>
              <div style={{ fontFamily: T.mono, fontSize: 11, color: T.text, lineHeight: 1.85 }}>
                {item.content}
              </div>
            </GlassCard>
          ))}

          <GlassCard style={{ padding: 18 }} hover={false}>
            <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 4, color: T.neon3, marginBottom: 10 }}>
              ⚠ NESTED LOOPS
            </div>
            <div style={{ fontFamily: T.mono, fontSize: 11, color: T.text, lineHeight: 1.85 }}>
              <span style={{ color: T.neon3 }}>break</span> only exits the <span style={{ color: T.neon }}>innermost</span> loop!{"\n"}
              To exit outer loops, use a flag variable or goto (sparingly).
            </div>
          </GlassCard>
        </div>
      </div>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 11 — EXECUTION ENGINE (Master Demo)
// ─────────────────────────────────────────────────────────────────────────────
const ENGINE_PROGRAMS = [
  {
    name: "OPERATORS",
    color: T.neon,
    code: [
      { text: "int a = 10, b = 3;",  mem: { a: 10, b: 3 } },
      { text: "int sum = a + b;",     mem: { a: 10, b: 3, sum: 13 } },
      { text: "int diff = a - b;",    mem: { a: 10, b: 3, sum: 13, diff: 7 } },
      { text: "int prod = a * b;",    mem: { a: 10, b: 3, sum: 13, diff: 7, prod: 30 } },
      { text: "int quot = a / b;",    mem: { a: 10, b: 3, sum: 13, diff: 7, prod: 30, quot: 3 } },
      { text: "int mod  = a % b;",    mem: { a: 10, b: 3, sum: 13, diff: 7, prod: 30, quot: 3, mod: 1 } },
      { text: 'printf("%d %d %d %d %d", sum,diff,prod,quot,mod);', out: "13 7 30 3 1\n" },
    ],
  },
  {
    name: "IF-ELSE",
    color: T.neon2,
    code: [
      { text: "int x = 42;",       mem: { x: 42 } },
      { text: "if (x > 0) {",      branch: "CONDITION: 42 > 0 → TRUE" },
      { text: '    printf("positive");', out: "positive\n" },
      { text: "} else {",          skip: true },
      { text: '    printf("non-pos");', skip: true },
      { text: "}",                  end: true },
    ],
  },
  {
    name: "FOR LOOP",
    color: T.neon4,
    code: [
      { text: "int sum = 0;",         mem: { sum: 0 } },
      { text: "for (int i=0; i<5; i++) {", loop: "START" },
      { text: "    sum += i;",        mem: { sum: 0, i: 0 }, loopNote: "i=0: sum=0" },
      { text: "    sum += i;",        mem: { sum: 1, i: 1 }, loopNote: "i=1: sum=1" },
      { text: "    sum += i;",        mem: { sum: 3, i: 2 }, loopNote: "i=2: sum=3" },
      { text: "    sum += i;",        mem: { sum: 6, i: 3 }, loopNote: "i=3: sum=6" },
      { text: "    sum += i;",        mem: { sum: 10, i: 4 }, loopNote: "i=4: sum=10" },
      { text: "}",                    loop: "END" },
      { text: 'printf("%d", sum);',   out: "10\n" },
    ],
  },
];

function EngineSection() {
  const [progIdx, setProgIdx] = useState(0);
  const [step, setStep] = useState(-1);
  const [memory, setMemory] = useState({});
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);
  const [info, setInfo] = useState("");

  const prog = ENGINE_PROGRAMS[progIdx];

  const reset = () => { setStep(-1); setMemory({}); setOutput(""); setRunning(false); setInfo(""); };

  const run = async () => {
    if (running) return;
    reset();
    await new Promise(r => setTimeout(r, 50));
    setRunning(true);

    for (let i = 0; i < prog.code.length; i++) {
      const line = prog.code[i];
      if (line.skip) continue;
      setStep(i);
      if (line.mem) setMemory({ ...line.mem });
      if (line.out) setOutput(prev => prev + line.out);
      if (line.branch) setInfo(line.branch);
      if (line.loopNote) setInfo(line.loopNote);
      await new Promise(r => setTimeout(r, 750));
    }

    setStep(-1);
    setRunning(false);
  };

  return (
    <Section id="engine">
      <SectionHeader num="11" tag="MASTER DEMO · LOGIC ENGINE" title="Full Execution Simulator" subtitle="Watch operators and control flow work together in real C programs" />

      {/* Program selector */}
      <div style={{ display: "flex", gap: 10, marginBottom: 28 }}>
        {ENGINE_PROGRAMS.map((p, i) => (
          <Pill key={p.name} color={p.color} active={progIdx === i} onClick={() => { setProgIdx(i); reset(); }}>
            {p.name}
          </Pill>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
        {/* Code panel */}
        <GlassCard style={{ overflow: "hidden" }}>
          <div style={{
            background: "rgba(0,0,0,0.45)", borderBottom: `1px solid ${T.dim}`,
            padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <motion.div
                animate={{ background: running ? T.neon : T.muted, boxShadow: running ? `0 0 10px ${T.neon}` : "none" }}
                style={{ width: 7, height: 7, borderRadius: "50%" }}
              />
              <span style={{ fontFamily: T.mono, fontSize: 9, color: T.muted }}>{prog.name.toLowerCase()}.c</span>
              <AnimatePresence mode="wait">
                {info && (
                  <motion.span
                    key={info}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    style={{ fontFamily: T.mono, fontSize: 8, color: prog.color, background: `${prog.color}15`, padding: "2px 8px", borderRadius: 3, letterSpacing: 1 }}
                  >
                    {info}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
            <div style={{ display: "flex", gap: 7 }}>
              <motion.button whileTap={{ scale: 0.95 }} onClick={run} disabled={running}
                style={{ fontFamily: T.display, fontWeight: 700, fontSize: 9, letterSpacing: 2, color: "#000", background: running ? T.muted : prog.color, border: "none", borderRadius: 4, padding: "5px 14px", cursor: "pointer" }}>
                {running ? "RUNNING…" : "▶ RUN"}
              </motion.button>
              <motion.button whileTap={{ scale: 0.95 }} onClick={reset}
                style={{ fontFamily: T.mono, fontWeight: 700, fontSize: 9, letterSpacing: 2, color: T.muted, background: "transparent", border: `1px solid ${T.dim}`, borderRadius: 4, padding: "5px 11px", cursor: "pointer" }}>
                RESET
              </motion.button>
            </div>
          </div>

          <div style={{ padding: "14px 0" }}>
            {prog.code.map((line, i) => {
              const isActive = step === i;
              const isPast = step > i;
              return (
                <motion.div
                  key={i}
                  animate={{ background: isActive ? `${prog.color}18` : "transparent", paddingLeft: isActive ? 22 : 16 }}
                  style={{
                    display: "flex", alignItems: "center", paddingRight: 16, paddingTop: 2, paddingBottom: 2,
                    borderLeft: `2px solid ${isActive ? prog.color : "transparent"}`,
                    opacity: line.skip ? 0.25 : isPast ? 0.4 : 1,
                    transition: "opacity 0.2s",
                  }}
                >
                  <span style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, minWidth: 24, textAlign: "right", marginRight: 14 }}>{i + 1}</span>
                  <span style={{ fontFamily: T.mono, fontSize: 12, color: isActive ? prog.color : T.text }}>{line.text}</span>
                  {isActive && (
                    <motion.span
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                      style={{ fontFamily: T.mono, fontSize: 8, color: prog.color, marginLeft: "auto", letterSpacing: 2 }}
                    >
                      ◀ NOW
                    </motion.span>
                  )}
                </motion.div>
              );
            })}
          </div>
        </GlassCard>

        {/* Memory + output */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <GlassCard style={{ padding: 0, overflow: "hidden", flex: 1 }}>
            <div style={{ background: "rgba(0,0,0,0.4)", borderBottom: `1px solid ${T.dim}`, padding: "10px 16px", fontFamily: T.mono, fontSize: 8, letterSpacing: 3, color: T.neon2 }}>
              MEMORY (STACK)
            </div>
            <div style={{ padding: "16px" }}>
              {Object.keys(memory).length === 0 ? (
                <div style={{ fontFamily: T.mono, fontSize: 11, color: T.muted }}>No variables yet...</div>
              ) : (
                Object.entries(memory).map(([k, v]) => (
                  <motion.div key={k}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    style={{ display: "flex", alignItems: "center", gap: 12, fontFamily: T.mono, fontSize: 12, marginBottom: 10 }}
                  >
                    <span style={{ color: T.neon2, minWidth: 50 }}>{k}</span>
                    <span style={{ color: T.muted, fontSize: 9 }}>int</span>
                    <motion.div
                      key={v}
                      initial={{ scale: 1.4, color: prog.color }}
                      animate={{ scale: 1, color: T.text }}
                      style={{
                        background: `${prog.color}15`, border: `1px solid ${prog.color}40`,
                        borderRadius: 5, padding: "3px 12px",
                        fontWeight: 700, color: T.text,
                      }}
                    >
                      {v}
                    </motion.div>
                  </motion.div>
                ))
              )}
            </div>
          </GlassCard>

          <GlassCard style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ background: "rgba(0,0,0,0.4)", borderBottom: `1px solid ${T.dim}`, padding: "10px 16px", fontFamily: T.mono, fontSize: 8, letterSpacing: 3, color: T.neon3 }}>
              TERMINAL OUTPUT
            </div>
            <div style={{ padding: "14px 16px", minHeight: 64 }}>
              {output ? (
                <motion.pre initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ fontFamily: T.mono, fontSize: 14, color: "#C3E88D", lineHeight: 1.9 }}>
                  {output}
                </motion.pre>
              ) : (
                <span style={{ fontFamily: T.mono, fontSize: 11, color: T.muted }}>
                  {running ? "executing..." : "press ▶ RUN to see output"}
                </span>
              )}
            </div>
          </GlassCard>

          {/* 3D logic node viz */}
          <GlassCard style={{ padding: 0, overflow: "hidden", height: 200 }} hover={false}>
            <div style={{ padding: "8px 14px", borderBottom: `1px solid ${T.dim}`, fontFamily: T.mono, fontSize: 8, color: T.accent, letterSpacing: 4 }}>
              3D LOGIC FLOW
            </div>
            <Canvas camera={{ position: [0, 0, 8], fov: 55 }} style={{ height: 166 }}>
              <ambientLight intensity={0.4} />
              <pointLight position={[5, 5, 5]} color={prog.color} intensity={1.5} />
              <Suspense fallback={null}>
                <LogicNodes3D activeSection={prog.name} />
              </Suspense>
              <Stars radius={60} depth={20} count={400} factor={2} saturation={0} fade speed={0.4} />
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
  const phases = [
    "operators transform values",
    "conditions select paths",
    "loops repeat logic",
    "this page is a live execution engine",
  ];
  useEffect(() => {
    const iv = setInterval(() => setPhase(p => (p + 1) % phases.length), 2800);
    return () => clearInterval(iv);
  }, []);

  const TOPICS = [
    { label: "Arithmetic", icon: "➕", color: T.neon },
    { label: "Relational", icon: "⚖",  color: T.neon2 },
    { label: "Logical",    icon: "🔗", color: T.accent },
    { label: "Assignment", icon: "📥", color: T.neon4 },
    { label: "Inc/Dec",    icon: "🔢", color: T.neon3 },
    { label: "Precedence", icon: "🌳", color: "#7EB5FF" },
    { label: "if/else",    icon: "🔀", color: T.neon },
    { label: "switch",     icon: "🎛", color: T.neon2 },
    { label: "Loops",      icon: "🔄", color: T.neon4 },
    { label: "break/cont", icon: "⚡", color: T.neon3 },
  ];

  return (
    <section id="hero" style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden",
      background: `
        radial-gradient(ellipse 90% 60% at 50% -10%, rgba(0,255,163,0.07) 0%, transparent 65%),
        radial-gradient(ellipse 60% 40% at 90% 70%, rgba(0,212,255,0.05) 0%, transparent 60%),
        radial-gradient(ellipse 40% 30% at 10% 80%, rgba(189,105,255,0.04) 0%, transparent 60%),
        ${T.bg}
      `,
    }}>
      {/* 3D BG */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
          <ParticleField />
          <Stars radius={120} depth={60} count={1000} factor={3} saturation={0} fade speed={0.3} />
        </Canvas>
      </div>

      {/* Grid */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
        backgroundImage: `
          linear-gradient(rgba(0,255,163,0.016) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,255,163,0.016) 1px, transparent 1px)
        `,
        backgroundSize: "52px 52px",
      }} />

      <div style={{ position: "relative", zIndex: 10, textAlign: "center", maxWidth: 860, padding: "0 24px" }}>
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            fontFamily: T.mono, fontSize: 9, letterSpacing: 5, color: T.neon,
            border: `1px solid ${T.border}`, background: "rgba(0,255,163,0.04)",
            padding: "6px 20px", borderRadius: 100, marginBottom: 28,
          }}
        >
          <motion.span
            animate={{ opacity: [1, 0.2, 1], scale: [1, 0.7, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            style={{ width: 5, height: 5, borderRadius: "50%", background: T.neon, display: "inline-block" }}
          />
          C LANGUAGE · CHAPTER 3 · OPERATORS & CONTROL FLOW
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 36 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontFamily: T.display, fontWeight: 800,
            fontSize: "clamp(56px, 9vw, 108px)",
            lineHeight: 0.92, letterSpacing: -4,
            color: T.text, marginBottom: 20,
          }}
        >
          LOGIC
          <br />
          <motion.span
            animate={{ textShadow: [`0 0 60px ${T.neon}80`, `0 0 80px ${T.neon}A0`, `0 0 60px ${T.neon}80`] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            style={{ color: T.neon }}
          >
            ENGINE
          </motion.span>
          <br />
          <span style={{ color: T.muted, fontSize: "0.3em", letterSpacing: 8, fontWeight: 400, fontFamily: T.mono }}>
            OPERATORS + CONTROL FLOW
          </span>
        </motion.h1>

        {/* Phase text */}
        <div style={{ height: 28, marginBottom: 32, overflow: "hidden" }}>
          <AnimatePresence mode="wait">
            <motion.p
              key={phase}
              initial={{ y: 18, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -18, opacity: 0 }}
              transition={{ duration: 0.35 }}
              style={{ fontFamily: T.mono, fontSize: 13, color: T.neon2, letterSpacing: 1 }}
            >
              → {phases[phase]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Topic grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8, marginBottom: 40 }}
        >
          {TOPICS.map((t, i) => (
            <motion.div
              key={t.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 + i * 0.05 }}
              whileHover={{ y: -4, boxShadow: `0 8px 30px ${t.color}40` }}
              style={{
                padding: "8px 16px", borderRadius: 8,
                background: `${t.color}10`, border: `1px solid ${t.color}30`,
                fontFamily: T.mono, fontSize: 10, color: t.color,
                display: "flex", alignItems: "center", gap: 6,
              }}
            >
              {t.icon} {t.label}
            </motion.div>
          ))}
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          whileHover={{ scale: 1.06, boxShadow: `0 0 50px ${T.neon}60` }}
          whileTap={{ scale: 0.96 }}
          onClick={() => document.getElementById("arithmetic")?.scrollIntoView({ behavior: "smooth" })}
          style={{
            fontFamily: T.display, fontWeight: 700, fontSize: 12, letterSpacing: 4,
            color: "#000", background: `linear-gradient(135deg, ${T.neon}, ${T.neon2})`,
            border: "none", borderRadius: 7, padding: "15px 44px", cursor: "pointer",
          }}
        >
          START LOGIC ENGINE
        </motion.button>
      </div>

      <motion.div
        animate={{ y: [0, 9, 0] }}
        transition={{ duration: 2.2, repeat: Infinity }}
        style={{ position: "absolute", bottom: 30, zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", gap: 5, fontFamily: T.mono, fontSize: 8, letterSpacing: 5, color: T.muted }}
      >
        SCROLL
      </motion.div>
    </section>
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
      padding: "26px 0", position: "sticky",
      top: 0, height: "100vh", overflow: "hidden",
    }}>
      <div style={{ padding: "0 16px 20px" }}>
        <div style={{ fontFamily: T.display, fontWeight: 800, fontSize: 16, letterSpacing: 2, color: T.neon }}>
          C LANG
        </div>
        <div style={{ fontFamily: T.mono, fontSize: 7, letterSpacing: 4, color: T.muted, marginTop: 2 }}>
          CH.3 · LOGIC ENGINE
        </div>
      </div>
      <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${T.neon}35, transparent)`, marginBottom: 12 }} />
      <nav style={{ overflowY: "auto", flex: 1 }}>
        {NAV_ITEMS.map(item => {
          const isActive = activeSection === item.id;
          return (
            <motion.a
              key={item.id}
              href={`#${item.id}`}
              onClick={e => { e.preventDefault(); document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" }); }}
              animate={{ color: isActive ? T.neon : T.muted, background: isActive ? `${T.neon}07` : "transparent", borderLeftColor: isActive ? T.neon : "transparent" }}
              whileHover={{ color: T.text, paddingLeft: 22 }}
              transition={{ duration: 0.2 }}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "9px 16px", fontFamily: T.mono, fontSize: 10,
                fontWeight: 700, letterSpacing: 1.5, textDecoration: "none",
                borderLeft: "2px solid transparent",
              }}
            >
              <span style={{ fontSize: 10 }}>{item.icon}</span>
              <div>
                <div style={{ fontSize: 7, opacity: 0.4, marginBottom: 1 }}>{item.num}</div>
                {item.label}
              </div>
              {isActive && (
                <motion.div layoutId="nav-dot-c3" style={{ width: 4, height: 4, borderRadius: "50%", background: T.neon, marginLeft: "auto" }} />
              )}
            </motion.a>
          );
        })}
      </nav>
      <div style={{ padding: "14px 16px", fontFamily: T.mono, fontSize: 9, color: T.dim, letterSpacing: 2, lineHeight: 1.9 }}>
        C VISUAL SIM<br />v3.0 · /c3
      </div>
    </aside>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RIGHT PANEL — Deep Thinking Panel
// ─────────────────────────────────────────────────────────────────────────────
const DEEP_PANELS = {
  hero:       { title: "Chapter 3", color: T.neon,   why: "Operators and control flow are the backbone of all C programs. Without them, code is just declarations.", mistake: "Jumping ahead to functions without mastering control flow = fragile code.", model: "Think of C as a CPU director: operators compute, conditions route, loops repeat." },
  arithmetic: { title: "Arithmetic", color: T.neon,  why: "CPU has native ADD/SUB/MUL/DIV instructions. C maps directly to these — zero abstraction.", mistake: "Integer division truncates toward zero. 7/2 = 3, not 3.5. Endless source of bugs.", model: "Numbers are just bit patterns. Operations rearrange bits in defined ways." },
  relational: { title: "Relational", color: T.neon2,  why: "Comparison generates a 1/0 integer. This flows into if/while conditions as truthy/falsy.", mistake: "if(x = 5) assigns 5 to x and always runs. Single = is the most common C bug.", model: "Every condition is just an integer: 0 = stop, anything else = go." },
  logical:    { title: "Logical", color: T.accent,    why: "Short-circuit evaluation prevents crashes. if(ptr && ptr->val) is safe because of &&.", mistake: "Confusing & (bitwise AND) with && (logical AND). They behave very differently.", model: "Logic gates from digital circuits. Same truth tables, same behavior." },
  assignment: { title: "Assignment", color: T.neon4,  why: "+= is syntactic sugar — compiler generates identical code to x = x + 3.", mistake: "Forgetting that = is right-associative: a = b = 5 sets both, but reads right-to-left.", model: "= is a statement. The right side is fully evaluated, then stored in the left." },
  incdec:     { title: "Inc/Dec", color: T.neon3,     why: "i++ compiles to a single INC instruction on x86. Fastest way to add 1.", mistake: "In expressions: int a = i++ gives a=5,i=6. int a = ++i gives a=6,i=6. Different!", model: "Pre: increment happens in-place. Post: old value is copied, then incremented." },
  precedence: { title: "Precedence", color: "#7EB5FF", why: "Compiler uses these rules to build the AST (Abstract Syntax Tree) for evaluation.", mistake: "Assuming left-to-right when operators mix. 3+5*2 ≠ (3+5)*2.", model: "When in doubt: add parentheses. They're free and eliminate ambiguity." },
  ifelse:     { title: "If / Else", color: T.neon,    why: "Compiles to CMP + conditional JMP instructions. No overhead — pure CPU branching.", mistake: "if without braces: only the NEXT statement is conditional. else binds to nearest if.", model: "Decision tree. One path chosen, rest skipped. Mutually exclusive branches." },
  switchcase: { title: "Switch", color: T.neon2,      why: "Compiler builds a jump table — O(1) dispatch vs O(n) if-else chains.", mistake: "Missing break causes fallthrough — execution runs into the NEXT case's body.", model: "A router: value comes in, gets matched, signal exits at the right port." },
  loops:      { title: "Loops", color: T.neon4,       why: "for = init+condition+increment in one line. while = condition only. do-while = body first.", mistake: "Infinite loops from forgetting i++ or wrong condition. Off-by-one (i < n vs i <= n).", model: "Loops are just conditional jumps in disguise. The CPU jumps back to the condition." },
  jumps:      { title: "Jump", color: T.neon3,        why: "break and continue compile to unconditional JMP instructions — instant exit.", mistake: "break in nested loops only exits the INNERMOST loop. Not all loops.", model: "Early exit is NOT bad practice. It can make code cleaner and faster." },
  engine:     { title: "Full Engine", color: T.neon,  why: "Real programs combine all of these: operators inside conditions inside loops.", mistake: "Complex expressions inside loop conditions — compute them once outside for clarity.", model: "Break any program into: data (variables) + logic (operators) + flow (control)." },
};

function RightPanel({ activeSection }) {
  const data = DEEP_PANELS[activeSection] || DEEP_PANELS.hero;
  const [liveTime, setLiveTime] = useState(0);

  useEffect(() => {
    const iv = setInterval(() => setLiveTime(t => t + 1), 1000);
    return () => clearInterval(iv);
  }, []);

  return (
    <aside style={{
      width: 320, minWidth: 320, flexShrink: 0,
      background: `linear-gradient(180deg, ${T.bg1} 0%, ${T.bg} 100%)`,
      borderLeft: `1px solid ${T.dim}`,
      padding: "26px 14px",
      display: "flex", flexDirection: "column", gap: 12,
      overflowY: "auto", overflowX: "hidden",
      position: "sticky", top: 0, height: "100vh",
    }}>
      {/* Header */}
      <div>
        <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 5, color: T.neon, marginBottom: 8 }}>
          DEEP THINKING PANEL
        </div>
        <div style={{ height: 1, background: `linear-gradient(90deg, ${T.neon}35, transparent)` }} />
      </div>

      {/* Live stats */}
      <div style={{ background: `${T.neon}05`, border: `1px solid ${T.neon}18`, borderRadius: 8, padding: "10px 12px" }}>
        <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 4, color: T.neon, marginBottom: 8 }}>⚙ LIVE</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[
            { label: "SECTION", value: activeSection.toUpperCase(), color: data.color },
            { label: "UPTIME", value: `${liveTime}s`, color: T.neon2 },
            { label: "TOPICS", value: "11", color: T.neon4 },
            { label: "ENGINE", value: "LIVE", color: T.neon },
          ].map(({ label, value, color }) => (
            <div key={label}>
              <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 2, color: T.muted }}>{label}</div>
              <motion.div key={value} initial={{ opacity: 0.5 }} animate={{ opacity: 1 }} style={{ fontFamily: T.mono, fontSize: 12, fontWeight: 700, color }}>
                {value}
              </motion.div>
            </div>
          ))}
        </div>
      </div>

      {/* Dynamic content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, x: 14 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -14 }}
          transition={{ duration: 0.3 }}
          style={{ display: "flex", flexDirection: "column", gap: 10 }}
        >
          {/* Section title */}
          <div style={{
            padding: "12px 14px", borderRadius: 10,
            background: `${data.color}10`, border: `1px solid ${data.color}30`,
          }}>
            <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 3, color: data.color, marginBottom: 4 }}>CURRENT TOPIC</div>
            <div style={{ fontFamily: T.display, fontSize: 18, fontWeight: 800, color: data.color }}>
              {data.title}
            </div>
          </div>

          {/* Why this works */}
          <div style={{ padding: "14px", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: `1px solid ${T.dim}` }}>
            <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 3, color: T.neon, marginBottom: 8 }}>
              💡 WHY THIS WORKS
            </div>
            <div style={{ fontFamily: T.mono, fontSize: 11, color: T.text, lineHeight: 1.8 }}>
              {data.why}
            </div>
          </div>

          {/* Common mistake */}
          <div style={{ padding: "14px", borderRadius: 10, background: `${T.neon3}08`, border: `1px solid ${T.neon3}25` }}>
            <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 3, color: T.neon3, marginBottom: 8 }}>
              ⚠ COMMON MISTAKE
            </div>
            <div style={{ fontFamily: T.mono, fontSize: 11, color: T.text, lineHeight: 1.8 }}>
              {data.mistake}
            </div>
          </div>

          {/* Mental model */}
          <div style={{ padding: "14px", borderRadius: 10, background: `${data.color}08`, border: `1px solid ${data.color}20` }}>
            <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 3, color: data.color, marginBottom: 8 }}>
              🧠 MENTAL MODEL
            </div>
            <div style={{ fontFamily: T.mono, fontSize: 11, color: T.text, lineHeight: 1.8, fontStyle: "italic" }}>
              "{data.model}"
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Chapter navigation */}
      <div style={{ marginTop: "auto" }}>
        <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${T.dim}, transparent)`, marginBottom: 12 }} />
        <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 3, color: T.muted, marginBottom: 8 }}>CHAPTER NAVIGATION</div>
        <div style={{ display: "flex", gap: 8 }}>
          {[
            { label: "← C-Intro", href: "/c-intro", color: T.muted },
            { label: "C2 →", href: "/c2", color: T.muted },
          ].map(link => (
            <motion.a
              key={link.href}
              href={link.href}
              whileHover={{ color: T.neon }}
              style={{
                flex: 1, textAlign: "center", padding: "7px", borderRadius: 6,
                background: "transparent", border: `1px solid ${T.dim}`,
                fontFamily: T.mono, fontSize: 9, color: T.muted,
                textDecoration: "none", transition: "color 0.2s",
              }}
            >
              {link.label}
            </motion.a>
          ))}
        </div>
      </div>
    </aside>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ROOT PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function C3Page() {
  const [activeSection, setActiveSection] = useState("hero");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) setActiveSection(e.target.id);
        });
      },
      { threshold: 0.25 }
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
        input[type=range] { height: 4px; cursor: pointer; }
        a { text-decoration: none; }
      `}</style>

      <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: T.bg }}>
        {/* LEFT SIDEBAR */}
        <Sidebar activeSection={activeSection} />

        {/* MAIN */}
        <main style={{ flex: 7, overflowY: "auto", overflowX: "hidden", minWidth: 0 }}>
          <div style={{ maxWidth: "100%", padding: "0 36px" }}>
            <HeroSection />
            <ArithmeticSection />
            <RelationalSection />
            <LogicalSection />
            <AssignmentSection />
            <IncDecSection />
            <PrecedenceSection />
            <IfElseSection />
            <SwitchSection />
            <LoopsSection />
            <JumpsSection />
            <EngineSection />
            <div style={{ height: 80 }} />
          </div>
        </main>

        {/* RIGHT PANEL */}
        <RightPanel activeSection={activeSection} />
      </div>
    </>
  );
}