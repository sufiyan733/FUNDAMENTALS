// "use client";

// import { useState, useEffect, useRef } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import Link from "next/link";

// // ─────────────────────────────────────────────────────────────────────────────
// // DESIGN TOKENS — matching C5 theme exactly
// // ─────────────────────────────────────────────────────────────────────────────
// const T = {
//   bg:      "#020509",
//   bg1:     "#050A12",
//   bg2:     "#08111F",
//   glass:   "rgba(5,12,25,0.82)",
//   border:  "rgba(255,100,0,0.10)",
//   neon:    "#FF6400",   // primary orange
//   neon2:   "#00E5FF",   // cyan
//   neon3:   "#FF2D6B",   // pink/red
//   neon4:   "#B4FF00",   // lime
//   accent:  "#A855F7",   // purple
//   text:    "#E8ECF4",
//   muted:   "#3A506B",
//   dim:     "#111D2A",
//   mono:    "'Fira Code', monospace",
//   display: "'Bebas Neue', sans-serif",
// };

// const NAV_ITEMS = [
//   { id: "hero",       label: "INTRO",      num: "00", icon: "◈" },
//   { id: "memory",     label: "MEMORY",     num: "01", icon: "⬜" },
//   { id: "pointers",   label: "POINTERS",   num: "02", icon: "→" },
//   { id: "deref",      label: "DEREF",      num: "03", icon: "*" },
//   { id: "recursion",  label: "RECURSION",  num: "04", icon: "↻" },
//   { id: "callstack",  label: "CALL STACK", num: "05", icon: "⧖" },
//   { id: "engine",     label: "ENGINE",     num: "06", icon: "🚀" },
// ];

// // ─────────────────────────────────────────────────────────────────────────────
// // SHARED COMPONENTS
// // ─────────────────────────────────────────────────────────────────────────────
// function GlassCard({ children, style = {}, hover = true, glowColor = T.neon, onClick }) {
//   return (
//     <motion.div
//       onClick={onClick}
//       whileHover={hover ? {
//         borderColor: `${glowColor}50`,
//         boxShadow: `0 8px 60px rgba(0,0,0,0.7), 0 0 30px ${glowColor}15`,
//       } : {}}
//       transition={{ type: "spring", stiffness: 280, damping: 28 }}
//       style={{
//         background: T.glass,
//         border: `1px solid ${T.border}`,
//         borderRadius: 14,
//         backdropFilter: "blur(24px)",
//         WebkitBackdropFilter: "blur(24px)",
//         boxShadow: "0 4px 50px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.03)",
//         ...style,
//       }}
//     >{children}</motion.div>
//   );
// }

// function Section({ id, children, style = {} }) {
//   return (
//     <section id={id} style={{ padding: "72px 0", borderBottom: `1px solid ${T.dim}`, ...style }}>
//       {children}
//     </section>
//   );
// }

// function SectionHeader({ num, tag, title, color = T.neon }) {
//   return (
//     <motion.div
//       initial={{ opacity: 0, x: -30 }}
//       whileInView={{ opacity: 1, x: 0 }}
//       viewport={{ once: true, amount: 0.4 }}
//       transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
//       style={{ display: "flex", alignItems: "flex-end", gap: 20, marginBottom: 40 }}
//     >
//       <span style={{ fontFamily: T.mono, fontSize: 56, fontWeight: 700, color: T.dim, lineHeight: 1, letterSpacing: -2 }}>{num}</span>
//       <div>
//         <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 5, color, fontWeight: 600, marginBottom: 5 }}>{tag}</div>
//         <h2 style={{ fontFamily: T.display, fontSize: 36, fontWeight: 400, color: T.text, letterSpacing: 3, lineHeight: 1 }}>{title}</h2>
//       </div>
//     </motion.div>
//   );
// }

// function CodeBlock({ lines, highlightLine = -1, filename = "main.c", style = {} }) {
//   const linesArr = typeof lines === "string" ? lines.split("\n") : lines;
//   return (
//     <div style={{
//       background: "rgba(0,0,0,0.55)", borderRadius: 12,
//       border: `1px solid ${T.dim}`, overflow: "hidden", ...style,
//     }}>
//       <div style={{ padding: "8px 14px", borderBottom: `1px solid ${T.dim}`, display: "flex", gap: 6, alignItems: "center" }}>
//         {["#FF5F57","#FEBC2E","#28C840"].map((c,i) => <div key={i} style={{ width: 9, height: 9, borderRadius: "50%", background: c }} />)}
//         <span style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, marginLeft: 8, letterSpacing: 2 }}>{filename}</span>
//       </div>
//       <div style={{ padding: "14px 0", overflowX: "auto" }}>
//         {linesArr.map((line, i) => (
//           <motion.div key={i}
//             animate={{ background: highlightLine === i ? `${T.neon}1A` : "transparent" }}
//             style={{
//               fontFamily: T.mono, fontSize: 12, lineHeight: 2,
//               paddingLeft: highlightLine === i ? 22 : 18, paddingRight: 18,
//               borderLeft: `3px solid ${highlightLine === i ? T.neon : "transparent"}`,
//               color: highlightLine === i ? T.neon : T.text,
//               transition: "all 0.25s", whiteSpace: "pre",
//             }}>
//             <span style={{ color: T.dim, marginRight: 16, fontSize: 9, userSelect: "none" }}>{String(i+1).padStart(2," ")}</span>
//             {line}
//           </motion.div>
//         ))}
//       </div>
//     </div>
//   );
// }

// function Pill({ children, color = T.neon, active = false, onClick, style = {} }) {
//   return (
//     <motion.button
//       whileHover={{ scale: 1.06, y: -2 }}
//       whileTap={{ scale: 0.95 }}
//       onClick={onClick}
//       style={{
//         fontFamily: T.mono, fontSize: 10, fontWeight: 600, letterSpacing: 2,
//         color: active ? "#000" : color,
//         background: active ? color : `${color}12`,
//         border: `1px solid ${active ? color : `${color}40`}`,
//         borderRadius: 6, padding: "7px 16px", cursor: "pointer",
//         transition: "all 0.18s",
//         boxShadow: active ? `0 0 20px ${color}50` : "none",
//         ...style,
//       }}
//     >{children}</motion.button>
//   );
// }

// function InsightBlock({ title, color, icon, children }) {
//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 12 }}
//       whileInView={{ opacity: 1, y: 0 }}
//       viewport={{ once: true }}
//       style={{ padding: "16px", borderRadius: 12, background: `${color}08`, border: `1px solid ${color}28` }}
//     >
//       <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 4, color, marginBottom: 10 }}>{icon} {title}</div>
//       <div style={{ fontFamily: T.mono, fontSize: 11, color: T.text, lineHeight: 1.9 }}>{children}</div>
//     </motion.div>
//   );
// }

// function AddrTag({ addr, color = T.neon2 }) {
//   return (
//     <motion.span
//       animate={{ boxShadow: [`0 0 8px ${color}60`, `0 0 18px ${color}90`, `0 0 8px ${color}60`] }}
//       transition={{ duration: 1.8, repeat: Infinity }}
//       style={{
//         fontFamily: T.mono, fontSize: 11, fontWeight: 700, color,
//         background: `${color}15`, border: `1px solid ${color}50`,
//         borderRadius: 5, padding: "2px 8px", display: "inline-block",
//       }}
//     >{addr}</motion.span>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // HERO SECTION
// // ─────────────────────────────────────────────────────────────────────────────
// function HeroSection() {
//   const [phase, setPhase] = useState(0);
//   const phrases = [
//     "pointer = just an address",
//     "*p = follow the arrow",
//     "&x = where x lives in RAM",
//     "recursion = function calls itself",
//     "call stack grows, then unwinds",
//   ];
//   useEffect(() => {
//     const iv = setInterval(() => setPhase(p => (p+1) % phrases.length), 2600);
//     return () => clearInterval(iv);
//   }, []);

//   const TOPICS = [
//     { label: "What is a Pointer?",    icon: "→",  color: T.neon },
//     { label: "& Address-of",          icon: "&",  color: T.neon2 },
//     { label: "* Dereference",         icon: "*",  color: T.neon4 },
//     { label: "Pointer Arithmetic",    icon: "+",  color: T.accent },
//     { label: "Base Case",             icon: "⊡",  color: T.neon3 },
//     { label: "Recursive Call",        icon: "↻",  color: T.neon },
//     { label: "Stack Frames",          icon: "⧖",  color: T.neon2 },
//     { label: "Stack Overflow",        icon: "☠",  color: T.neon3 },
//     { label: "Unwind Phase",          icon: "↑",  color: T.neon4 },
//   ];

//   return (
//     <section id="hero" style={{
//       minHeight: "100vh", display: "flex", flexDirection: "column",
//       alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden",
//       background: `
//         radial-gradient(ellipse 80% 50% at 50% -5%, rgba(255,100,0,0.09) 0%, transparent 60%),
//         radial-gradient(ellipse 50% 35% at 85% 75%, rgba(168,85,247,0.07) 0%, transparent 55%),
//         radial-gradient(ellipse 35% 25% at 10% 85%, rgba(0,229,255,0.05) 0%, transparent 55%),
//         ${T.bg}
//       `,
//     }}>
//       <div style={{
//         position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
//         backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,100,0,0.012) 2px, rgba(255,100,0,0.012) 4px)",
//       }} />

//       <div style={{ position: "relative", zIndex: 10, textAlign: "center", maxWidth: 920, padding: "0 24px" }}>
//         <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
//           style={{
//             display: "inline-flex", alignItems: "center", gap: 10,
//             fontFamily: T.mono, fontSize: 9, letterSpacing: 5, color: T.neon,
//             border: `1px solid ${T.border}`, background: "rgba(255,100,0,0.05)",
//             padding: "7px 22px", borderRadius: 100, marginBottom: 30,
//           }}>
//           <motion.span animate={{ opacity: [1,0.1,1], scale: [1,0.6,1] }} transition={{ duration: 1.1, repeat: Infinity }}
//             style={{ width: 5, height: 5, borderRadius: "50%", background: T.neon, display: "inline-block" }} />
//           C · CHAPTER 6 · POINTERS + RECURSION
//         </motion.div>

//         <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.3, duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
//           style={{
//             fontFamily: T.display, fontWeight: 400,
//             fontSize: "clamp(50px, 9vw, 108px)",
//             lineHeight: 0.9, letterSpacing: 6, color: T.text, marginBottom: 22,
//           }}>
//           MEMORY
//           <br />
//           <motion.span
//             animate={{ textShadow: [`0 0 50px ${T.neon}90`, `0 0 80px ${T.neon}B0`, `0 0 50px ${T.neon}90`] }}
//             transition={{ duration: 2.2, repeat: Infinity }}
//             style={{ color: T.neon }}>
//             CHAPTER 6
//           </motion.span>
//         </motion.h1>

//         <div style={{ height: 30, marginBottom: 34, overflow: "hidden" }}>
//           <AnimatePresence mode="wait">
//             <motion.p key={phase} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}
//               transition={{ duration: 0.3 }}
//               style={{ fontFamily: T.mono, fontSize: 13, color: T.neon2, letterSpacing: 1 }}>
//               → {phrases[phase]}
//             </motion.p>
//           </AnimatePresence>
//         </div>

//         <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}
//           style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8, marginBottom: 44 }}>
//           {TOPICS.map((t, i) => (
//             <motion.div key={t.label}
//               initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}
//               transition={{ delay: 0.65 + i * 0.06, type: "spring", stiffness: 280 }}
//               whileHover={{ y: -5, boxShadow: `0 10px 35px ${t.color}50` }}
//               style={{
//                 padding: "8px 18px", borderRadius: 7,
//                 background: `${t.color}10`, border: `1px solid ${t.color}35`,
//                 fontFamily: T.mono, fontSize: 10, color: t.color,
//                 display: "flex", alignItems: "center", gap: 7,
//                 transition: "box-shadow 0.2s",
//               }}>
//               <span style={{ fontSize: 13 }}>{t.icon}</span> {t.label}
//             </motion.div>
//           ))}
//         </motion.div>

//         <motion.button initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.05 }}
//           whileHover={{ scale: 1.07, boxShadow: `0 0 55px ${T.neon}70` }}
//           whileTap={{ scale: 0.96 }}
//           onClick={() => document.getElementById("memory")?.scrollIntoView({ behavior: "smooth" })}
//           style={{
//             fontFamily: T.display, fontWeight: 400, fontSize: 14, letterSpacing: 6,
//             color: "#000", background: `linear-gradient(135deg, ${T.neon}, ${T.neon2})`,
//             border: "none", borderRadius: 8, padding: "16px 50px", cursor: "pointer",
//           }}>
//           ENTER
//         </motion.button>
//       </div>

//       <motion.div animate={{ y: [0,10,0] }} transition={{ duration: 2.3, repeat: Infinity }}
//         style={{ position: "absolute", bottom: 30, zIndex: 10, fontFamily: T.mono, fontSize: 8, letterSpacing: 6, color: T.muted }}>
//         SCROLL
//       </motion.div>
//     </section>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // SECTION 01 — MEMORY WORLD (what is RAM?)
// // ─────────────────────────────────────────────────────────────────────────────
// function MemorySection() {
//   const [hovered, setHovered] = useState(null);
//   const cells = [
//     { addr: "0x1000", label: "a", value: 10, type: "int", color: T.neon4 },
//     { addr: "0x1004", label: "b", value: 99, type: "int", color: T.neon2 },
//     { addr: "0x1008", label: "c", value: 42, type: "int", color: T.neon },
//     { addr: "0x100C", label: "d", value: 7,  type: "int", color: T.accent },
//     { addr: "0x1010", label: "?", value: "??", type: "???", color: T.muted, empty: true },
//     { addr: "0x1014", label: "?", value: "??", type: "???", color: T.muted, empty: true },
//   ];

//   return (
//     <Section id="memory">
//       <SectionHeader num="01" tag="RAM BASICS" title="MEMORY = GIANT ARRAY" color={T.neon} />
//       <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
//         <GlassCard style={{ padding: 30 }}>
//           <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 4, color: T.neon, marginBottom: 20 }}>▸ YOUR RAM RIGHT NOW</div>

//           <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 28 }}>
//             {cells.map((cell, i) => (
//               <motion.div key={i}
//                 initial={{ x: -30, opacity: 0 }}
//                 animate={{ x: 0, opacity: 1 }}
//                 transition={{ delay: i * 0.08, type: "spring", stiffness: 220 }}
//                 onMouseEnter={() => setHovered(i)}
//                 onMouseLeave={() => setHovered(null)}
//                 style={{ display: "flex", alignItems: "center", gap: 12, cursor: "default" }}>
//                 <div style={{ width: 72, fontFamily: T.mono, fontSize: 9, color: T.muted, textAlign: "right", letterSpacing: 1 }}>
//                   {cell.addr}
//                 </div>
//                 <motion.div
//                   animate={{
//                     borderColor: hovered === i ? cell.color : `${cell.color}${cell.empty ? "15" : "30"}`,
//                     background: hovered === i ? `${cell.color}20` : `${cell.color}${cell.empty ? "05" : "08"}`,
//                     boxShadow: hovered === i && !cell.empty ? `0 0 25px ${cell.color}50` : "none",
//                   }}
//                   style={{ flex: 1, height: 52, borderRadius: 8, border: "2px solid", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px" }}>
//                   <span style={{ fontFamily: T.mono, fontSize: 10, color: cell.empty ? T.dim : T.muted }}>
//                     {cell.empty ? "——" : `${cell.type} ${cell.label}`}
//                   </span>
//                   <span style={{ fontFamily: T.mono, fontSize: 18, fontWeight: 700, color: cell.empty ? T.dim : cell.color }}>
//                     {String(cell.value)}
//                   </span>
//                 </motion.div>
//                 <div style={{ width: 30, fontFamily: T.mono, fontSize: 10, color: T.dim }}>
//                   {!cell.empty && <span style={{ color: `${cell.color}80` }}>←</span>}
//                 </div>
//               </motion.div>
//             ))}
//           </div>

//           <div style={{
//             padding: "14px 16px", borderRadius: 10,
//             background: `${T.neon}08`, border: `1px solid ${T.neon}30`,
//             fontFamily: T.mono, fontSize: 11, color: T.text, lineHeight: 1.9,
//           }}>
//             <span style={{ color: T.neon }}>KEY INSIGHT:</span> Every variable = a box in RAM.<br />
//             Every box has an <span style={{ color: T.neon2 }}>address</span> (like a house number).<br />
//             A <span style={{ color: T.neon }}>pointer</span> stores that address.
//           </div>
//         </GlassCard>

//         <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
//           <CodeBlock
//             lines={`int a = 10;   // box at 0x1000\nint b = 99;   // box at 0x1004\nint c = 42;   // box at 0x1008\n// addresses are just numbers!\n// &a  →  0x1000\n// &b  →  0x1004`}
//             highlightLine={hovered !== null && hovered < 4 ? hovered : -1}
//           />
//           <InsightBlock title="SIZES IN MEMORY" color={T.neon2} icon="⬜">
//             {"int   → 4 bytes\nchar  → 1 byte\nfloat → 4 bytes\nptr   → 8 bytes (64-bit)\n\nEach next var = prev addr + size"}
//           </InsightBlock>
//           <InsightBlock title="ADDRESSES ARE INTEGERS" color={T.neon4} icon="→">
//             {"0x1004 is just 4100 in decimal.\nPointers are just big integers.\nThat's literally it."}
//           </InsightBlock>
//         </div>
//       </div>
//     </Section>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // SECTION 02 — POINTERS VISUAL
// // ─────────────────────────────────────────────────────────────────────────────
// function PointersSection() {
//   const [phase, setPhase] = useState(0); // 0=idle 1=x created 2=ptr assigned 3=done
//   const [ptrMode, setPtrMode] = useState("addr"); // addr | value
//   const [running, setRunning] = useState(false);

//   const runAnim = async () => {
//     if (running) return;
//     setRunning(true);
//     setPtrMode("addr");
//     setPhase(1); await new Promise(r => setTimeout(r, 700));
//     setPhase(2); await new Promise(r => setTimeout(r, 600));
//     setPhase(3);
//     setRunning(false);
//   };
//   const reset = () => { setPhase(0); setPtrMode("addr"); };

//   const memCells = [
//     { addr: "0x2000", label: "x",   value: 42,       type: "int",  color: T.neon4, active: phase >= 1 },
//     { addr: "0x2004", label: "ptr", value: "0x2000", type: "int*", color: T.neon,  active: phase >= 2, isPtr: true },
//   ];

//   return (
//     <Section id="pointers">
//       <SectionHeader num="02" tag="POINTERS" title="ADDRESS MACHINE" color={T.neon} />
//       <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
//         <GlassCard style={{ padding: 30 }}>
//           <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 4, color: T.neon, marginBottom: 22 }}>→ LIVE MEMORY</div>

//           <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28, position: "relative" }}>
//             {memCells.map((cell, i) => (
//               <motion.div key={i}
//                 animate={{
//                   borderColor: cell.active ? cell.color : `${cell.color}20`,
//                   background: cell.active ? `${cell.color}14` : `${cell.color}05`,
//                   boxShadow: cell.active ? `0 0 30px ${cell.color}50` : "none",
//                 }}
//                 style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", borderRadius: 10, border: "2px solid" }}>
//                 <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, width: 72 }}>{cell.addr}</div>
//                 <div style={{ flex: 1 }}>
//                   <div style={{ fontFamily: T.mono, fontSize: 9, color: cell.color, marginBottom: 4 }}>{cell.type} {cell.label}</div>
//                   <motion.div
//                     animate={cell.isPtr && phase >= 3 && ptrMode === "value" ? { color: [T.neon, T.neon4, T.neon] } : {}}
//                     transition={{ duration: 1.2, repeat: Infinity }}
//                     style={{ fontFamily: T.mono, fontSize: 20, fontWeight: 700, color: cell.active ? cell.color : T.muted }}>
//                     {cell.isPtr && phase >= 3
//                       ? ptrMode === "value" ? "*ptr = 42" : "ptr = 0x2000"
//                       : cell.active ? String(cell.value) : "???"}
//                   </motion.div>
//                 </div>
//                 {cell.active && (
//                   <motion.div animate={{ scale: [1,1.4,1], opacity: [0.6,1,0.6] }} transition={{ duration: 1.2, repeat: Infinity }}
//                     style={{ width: 10, height: 10, borderRadius: "50%", background: cell.color, boxShadow: `0 0 12px ${cell.color}` }} />
//                 )}
//               </motion.div>
//             ))}

//             {/* Arrow from ptr → x */}
//             <AnimatePresence>
//               {phase >= 2 && (
//                 <motion.svg initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
//                   style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none" }}
//                   viewBox="0 0 400 140">
//                   <motion.path
//                     d="M 350 100 C 400 100 400 40 350 40"
//                     fill="none" stroke={T.neon} strokeWidth="2.5" strokeDasharray="7 4"
//                     initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
//                     transition={{ duration: 0.8, ease: "easeOut" }} />
//                   <motion.circle cx="350" cy="40" r="5" fill={T.neon}
//                     animate={{ r: [4,8,4], opacity: [1,0.5,1] }} transition={{ duration: 1.5, repeat: Infinity }} />
//                   <motion.circle cx="350" cy="100" r="4" fill={T.neon}
//                     initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.7 }} />
//                 </motion.svg>
//               )}
//             </AnimatePresence>
//           </div>

//           {/* Mode pills */}
//           <AnimatePresence>
//             {phase >= 3 && (
//               <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
//                 style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
//                 <Pill color={T.neon} active={ptrMode === "addr"} onClick={() => setPtrMode("addr")}>ptr (address)</Pill>
//                 <Pill color={T.neon4} active={ptrMode === "value"} onClick={() => setPtrMode("value")}>*ptr (value)</Pill>
//               </motion.div>
//             )}
//           </AnimatePresence>

//           <AnimatePresence mode="wait">
//             <motion.div key={`${phase}-${ptrMode}`}
//               initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
//               style={{ padding: "12px 16px", borderRadius: 10, marginBottom: 18, background: `${T.neon}0C`, border: `1px solid ${T.neon}30`, fontFamily: T.mono, fontSize: 11, color: T.text, lineHeight: 1.8 }}>
//               {phase === 0 && "Press ASSIGN to watch a pointer get created →"}
//               {phase === 1 && <span>int x = 42 — stored at <AddrTag addr="0x2000" color={T.neon4} /></span>}
//               {phase === 2 && <span>ptr = <AddrTag addr="0x2000" color={T.neon} /> — it points to x!</span>}
//               {phase >= 3 && ptrMode === "addr" && <span>ptr = <AddrTag addr="0x2000" color={T.neon} /> — the address</span>}
//               {phase >= 3 && ptrMode === "value" && <span>*ptr = <strong style={{ color: T.neon4 }}>42</strong> — follow arrow → get value</span>}
//             </motion.div>
//           </AnimatePresence>

//           <div style={{ display: "flex", gap: 10 }}>
//             {phase === 0 ? (
//               <motion.button whileHover={{ scale: 1.04, boxShadow: `0 0 35px ${T.neon}60` }} whileTap={{ scale: 0.97 }}
//                 onClick={runAnim}
//                 style={{ flex: 1, fontFamily: T.display, fontSize: 14, letterSpacing: 4, color: "#000", background: `linear-gradient(135deg, ${T.neon}, ${T.neon2})`, border: "none", borderRadius: 8, padding: "13px", cursor: "pointer" }}>
//                 ▶ ASSIGN POINTER
//               </motion.button>
//             ) : (
//               <motion.button whileTap={{ scale: 0.96 }} onClick={reset}
//                 style={{ flex: 1, fontFamily: T.mono, fontSize: 10, color: T.muted, background: "transparent", border: `1px solid ${T.dim}`, borderRadius: 8, padding: "13px", cursor: "pointer" }}>
//                 ↺ RESET
//               </motion.button>
//             )}
//           </div>
//         </GlassCard>

//         <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
//           <CodeBlock
//             lines={`int x = 42;          // x lives at 0x2000\nint *ptr = &x;       // ptr stores 0x2000\n\nprintf("%p", ptr);   // 0x2000 (address)\nprintf("%d", *ptr);  // 42    (value)\n\n// RULE:\n// ptr  = address\n// *ptr = value at address\n// &x   = address of x`}
//             highlightLine={phase === 1 ? 0 : phase === 2 ? 1 : phase >= 3 ? (ptrMode === "value" ? 4 : 3) : -1}
//           />
//           <InsightBlock title="3 OPERATORS" color={T.neon} icon="→">
//             {"& = address-of  (get the house number)\n* = dereference  (go to that house)\n  int *p  ← * means 'pointer type'\n  *p      ← * means 'follow pointer'"}
//           </InsightBlock>
//         </div>
//       </div>
//     </Section>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // SECTION 03 — DEREFERENCE PLAYGROUND
// // ─────────────────────────────────────────────────────────────────────────────
// function DerefSection() {
//   const [varX, setVarX] = useState(7);
//   const [varY, setVarY] = useState(99);
//   const [target, setTarget] = useState("x");
//   const [writeVal, setWriteVal] = useState(55);
//   const [flash, setFlash] = useState(null);

//   const vars = { x: varX, y: varY };
//   const addrs = { x: "0x3000", y: "0x3004" };
//   const colors = { x: T.neon4, y: T.neon2 };

//   const writeThrough = () => {
//     if (target === "x") { setVarX(writeVal); setFlash("x"); }
//     else { setVarY(writeVal); setFlash("y"); }
//     setTimeout(() => setFlash(null), 800);
//   };

//   return (
//     <Section id="deref">
//       <SectionHeader num="03" tag="DEREFERENCE" title="WRITE THROUGH PTR" color={T.neon2} />
//       <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
//         <GlassCard style={{ padding: 30 }}>
//           <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 4, color: T.neon2, marginBottom: 22 }}>⊕ POINTER CONTROL</div>

//           {/* Memory boxes */}
//           <div style={{ display: "flex", gap: 12, marginBottom: 28 }}>
//             {["x","y"].map(k => (
//               <motion.div key={k}
//                 animate={{
//                   borderColor: flash === k ? "#fff" : target === k ? colors[k] : `${colors[k]}30`,
//                   background: flash === k ? `${colors[k]}40` : target === k ? `${colors[k]}18` : `${colors[k]}08`,
//                   boxShadow: flash === k ? `0 0 50px ${colors[k]}90` : target === k ? `0 0 25px ${colors[k]}40` : "none",
//                 }}
//                 style={{ flex: 1, borderRadius: 12, border: "2px solid", padding: "20px 14px", textAlign: "center" }}>
//                 <div style={{ fontFamily: T.mono, fontSize: 9, color: colors[k], marginBottom: 6 }}>{addrs[k]}</div>
//                 <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, marginBottom: 6 }}>int {k}</div>
//                 <motion.div key={vars[k]} animate={{ scale: [1.4, 1] }}
//                   style={{ fontFamily: T.mono, fontSize: 32, fontWeight: 700, color: colors[k] }}>
//                   {vars[k]}
//                 </motion.div>
//                 {target === k && (
//                   <motion.div animate={{ opacity: [0.5,1,0.5] }} transition={{ duration: 1, repeat: Infinity }}
//                     style={{ fontFamily: T.mono, fontSize: 9, color: colors[k], marginTop: 8 }}>
//                     ← ptr points here
//                   </motion.div>
//                 )}
//               </motion.div>
//             ))}
//           </div>

//           {/* Pointer selector */}
//           <div style={{ marginBottom: 18 }}>
//             <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 4, color: T.muted, marginBottom: 10 }}>POINT p AT:</div>
//             <div style={{ display: "flex", gap: 8 }}>
//               <Pill color={colors.x} active={target === "x"} onClick={() => setTarget("x")}>p = &x</Pill>
//               <Pill color={colors.y} active={target === "y"} onClick={() => setTarget("y")}>p = &y</Pill>
//             </div>
//           </div>

//           {/* Write value */}
//           <div style={{ marginBottom: 20 }}>
//             <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 4, color: T.muted, marginBottom: 10 }}>WRITE VALUE THROUGH POINTER:</div>
//             <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
//               <input
//                 type="number"
//                 value={writeVal}
//                 onChange={e => setWriteVal(Number(e.target.value))}
//                 style={{
//                   flex: 1, background: `${T.neon2}10`, border: `1px solid ${T.neon2}35`,
//                   borderRadius: 8, padding: "9px 14px",
//                   fontFamily: T.mono, fontSize: 15, color: T.neon2, outline: "none",
//                 }}
//               />
//               <motion.button
//                 whileHover={{ scale: 1.04, boxShadow: `0 0 25px ${T.neon2}50` }}
//                 whileTap={{ scale: 0.97 }}
//                 onClick={writeThrough}
//                 style={{
//                   fontFamily: T.display, fontSize: 12, letterSpacing: 4,
//                   color: "#000", background: `linear-gradient(135deg, ${T.neon2}, ${T.accent})`,
//                   border: "none", borderRadius: 8, padding: "9px 18px", cursor: "pointer",
//                 }}>*p = {writeVal}</motion.button>
//             </div>
//           </div>

//           <div style={{ padding: "12px 14px", borderRadius: 9, background: `${T.neon2}0A`, border: `1px solid ${T.neon2}25`, fontFamily: T.mono, fontSize: 11, color: T.text, lineHeight: 1.8 }}>
//             <span style={{ color: T.neon2 }}>p = &{target}</span> → writing *p changes <strong style={{ color: colors[target] }}>{target}</strong> directly in RAM.
//           </div>
//         </GlassCard>

//         <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
//           <CodeBlock
//             lines={`int x = ${varX}, y = ${varY};\nint *p;\n\n// Point at x:\np = &x;\n*p = ${writeVal};   // x is now ${target === "x" ? writeVal : varX}\n\n// Repoint at y:\np = &y;\n*p = ${writeVal};   // y is now ${target === "y" ? writeVal : varY}\n\n// Pointer is flexible!\n// Retarget, then write.`}
//             highlightLine={4}
//           />
//           <InsightBlock title="WHY USE POINTERS?" color={T.neon3} icon="⚡">
//             {"1. Modify vars inside functions\n2. Share large data (no copying)\n3. Dynamic memory (malloc)\n4. Build linked data structures"}
//           </InsightBlock>
//           <InsightBlock title="NULL POINTER" color={T.neon3} icon="⚠">
//             {"int *p = NULL;  // safe default\n*p = 5;         // CRASH! Segfault\n\nAlways initialize pointers!"}
//           </InsightBlock>
//         </div>
//       </div>
//     </Section>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // SECTION 04 — RECURSION INTRO
// // ─────────────────────────────────────────────────────────────────────────────
// const FACT_STEPS = [
//   { n: 5, state: "call",   result: null, depth: 0 },
//   { n: 4, state: "call",   result: null, depth: 1 },
//   { n: 3, state: "call",   result: null, depth: 2 },
//   { n: 2, state: "call",   result: null, depth: 3 },
//   { n: 1, state: "base",   result: 1,    depth: 4 },
//   { n: 2, state: "return", result: 2,    depth: 3 },
//   { n: 3, state: "return", result: 6,    depth: 2 },
//   { n: 4, state: "return", result: 24,   depth: 1 },
//   { n: 5, state: "return", result: 120,  depth: 0 },
// ];

// function RecursionSection() {
//   const [animIdx, setAnimIdx] = useState(-1);
//   const [stack, setStack] = useState([]);
//   const [running, setRunning] = useState(false);
//   const runRef = useRef(false);

//   const stateColor = s => s === "base" ? T.neon4 : s === "return" ? T.neon3 : T.neon2;

//   const runAnim = async () => {
//     if (runRef.current) return;
//     runRef.current = true;
//     setRunning(true);
//     setStack([]);
//     setAnimIdx(-1);
//     const callStack = [];
//     for (let i = 0; i < FACT_STEPS.length; i++) {
//       if (!runRef.current) break;
//       const step = FACT_STEPS[i];
//       setAnimIdx(i);
//       if (step.state === "call" || step.state === "base") {
//         callStack.push(step);
//         setStack([...callStack]);
//       } else {
//         callStack.pop();
//         setStack([...callStack]);
//       }
//       await new Promise(r => setTimeout(r, 780));
//     }
//     runRef.current = false;
//     setRunning(false);
//     setAnimIdx(-1);
//   };

//   const reset = () => { runRef.current = false; setRunning(false); setStack([]); setAnimIdx(-1); };
//   const current = animIdx >= 0 ? FACT_STEPS[animIdx] : null;

//   return (
//     <Section id="recursion">
//       <SectionHeader num="04" tag="RECURSION" title="FUNCTION CALLS ITSELF" color={T.neon3} />
//       <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 24 }}>
//         <GlassCard style={{ padding: 28 }}>
//           <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
//             <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 4, color: T.neon3 }}>▸ CALL STACK (bottom = first call)</div>
//             <div style={{ display: "flex", gap: 8 }}>
//               <motion.button
//                 whileHover={{ scale: 1.05, boxShadow: `0 0 28px ${T.neon3}50` }}
//                 whileTap={{ scale: 0.97 }}
//                 onClick={runAnim}
//                 disabled={running}
//                 style={{
//                   fontFamily: T.display, fontSize: 12, letterSpacing: 4,
//                   color: "#000", background: running ? T.muted : `linear-gradient(135deg, ${T.neon3}, ${T.accent})`,
//                   border: "none", borderRadius: 8, padding: "8px 20px", cursor: running ? "not-allowed" : "pointer",
//                 }}>{running ? "RUNNING…" : "▶ FACTORIAL(5)"}</motion.button>
//               <motion.button whileTap={{ scale: 0.95 }} onClick={reset}
//                 style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, background: "transparent", border: `1px solid ${T.dim}`, borderRadius: 7, padding: "8px 12px", cursor: "pointer" }}>↺</motion.button>
//             </div>
//           </div>

//           {/* Depth bar */}
//           <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
//             {Array.from({ length: 5 }).map((_, i) => (
//               <motion.div key={i}
//                 animate={{
//                   background: stack.length > i ? stateColor(stack[i]?.state || "call") : T.dim,
//                   boxShadow: stack.length > i ? `0 0 12px ${stateColor(stack[i]?.state || "call")}80` : "none",
//                 }}
//                 style={{ flex: 1, height: 5, borderRadius: 3, transition: "all 0.35s" }} />
//             ))}
//             <span style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, marginLeft: 8 }}>depth {stack.length}</span>
//           </div>

//           {/* Stack — renders bottom to top: bottom = first called, top = most recent */}
//           <div style={{ position: "relative", minHeight: 300, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
//             {/* Stack labels */}
//             {stack.length > 0 && (
//               <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
//                 <span style={{ fontFamily: T.mono, fontSize: 8, color: T.muted, letterSpacing: 2 }}>BOTTOM (first call)</span>
//                 <span style={{ fontFamily: T.mono, fontSize: 8, color: T.muted, letterSpacing: 2 }}>TOP (latest)</span>
//               </div>
//             )}

//             {/* Horizontal stack bar — bottom of visual = first, top = latest */}
//             <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
//               <AnimatePresence>
//                 {/* Reverse the stack so latest is at top visually */}
//                 {[...stack].reverse().map((frame, i) => {
//                   const color = stateColor(frame.state);
//                   const isTop = i === 0; // reversed, so index 0 = most recent
//                   return (
//                     <motion.div
//                       key={`${frame.depth}-${frame.state}`}
//                       initial={{ scale: 0.85, opacity: 0, y: isTop ? -30 : 0 }}
//                       animate={{ scale: 1, opacity: 1, y: 0 }}
//                       exit={{ scale: 0.85, opacity: 0, y: -24, transition: { duration: 0.35 } }}
//                       transition={{ type: "spring", stiffness: 280, damping: 24 }}
//                       style={{
//                         padding: "12px 20px", borderRadius: 10,
//                         background: isTop ? `${color}22` : `${color}10`,
//                         border: `${isTop ? "2px" : "1px"} solid ${isTop ? color : `${color}50`}`,
//                         boxShadow: isTop ? `0 0 25px ${color}50` : "none",
//                         display: "flex", alignItems: "center", justifyContent: "space-between",
//                       }}>
//                       <div>
//                         <span style={{ fontFamily: T.mono, fontSize: 8, color, letterSpacing: 3 }}>
//                           {isTop ? "← TOP (ACTIVE)" : `depth ${frame.depth}`}
//                         </span>
//                         <div style={{ fontFamily: T.mono, fontSize: 16, fontWeight: 700, color, marginTop: 2 }}>
//                           fact({frame.n})
//                         </div>
//                       </div>
//                       <div style={{ textAlign: "right" }}>
//                         <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted }}>n = {frame.n}</div>
//                         {frame.result !== null && (
//                           <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
//                             style={{ fontFamily: T.mono, fontSize: 18, fontWeight: 700, color: T.neon4 }}>
//                             = {frame.result}
//                           </motion.div>
//                         )}
//                       </div>
//                     </motion.div>
//                   );
//                 })}
//               </AnimatePresence>

//               {stack.length === 0 && !running && (
//                 <div style={{ fontFamily: T.mono, fontSize: 11, color: T.muted, textAlign: "center", padding: "60px 0" }}>
//                   Stack empty. Press ▶ RUN.
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Step info */}
//           <AnimatePresence mode="wait">
//             {current && (
//               <motion.div key={animIdx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
//                 style={{ marginTop: 16, padding: "12px 16px", borderRadius: 9, background: `${stateColor(current.state)}10`, border: `1px solid ${stateColor(current.state)}40`, fontFamily: T.mono, fontSize: 11, color: T.text, lineHeight: 1.8 }}>
//                 {current.state === "call" && `→ Calling fact(${current.n}) — push frame to stack top`}
//                 {current.state === "base" && `⊡ Base case: n=1 → return 1. Begin unwinding!`}
//                 {current.state === "return" && `↑ fact(${current.n}) = ${current.result} — pop frame, pass value back`}
//               </motion.div>
//             )}
//           </AnimatePresence>
//         </GlassCard>

//         <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
//           <CodeBlock
//             filename="factorial.c"
//             lines={`int fact(int n) {\n  // BASE CASE — stop condition\n  if (n <= 1)\n    return 1;\n  \n  // RECURSIVE CASE\n  return n * fact(n - 1);\n}`}
//             highlightLine={current?.state === "base" ? 2 : current?.state === "call" ? 6 : -1}
//           />
//           {[
//             { icon: "⊡", color: T.neon4, label: "BASE CASE", text: "n ≤ 1 → return 1\nNo base = infinite loop + crash" },
//             { icon: "↻", color: T.neon2, label: "RECURSE",   text: "fact(n-1) — smaller every call\nMust shrink toward base case" },
//             { icon: "↑", color: T.neon3, label: "UNWIND",    text: "5×4×3×2×1 = 120\nValues bubble back up the stack" },
//           ].map((item, i) => (
//             <motion.div key={i}
//               initial={{ opacity: 0, x: 20 }}
//               whileInView={{ opacity: 1, x: 0 }}
//               viewport={{ once: true }}
//               transition={{ delay: i * 0.1 }}
//               style={{ padding: "14px 16px", borderRadius: 10, background: `${item.color}08`, border: `1px solid ${item.color}28`, display: "flex", gap: 14 }}>
//               <div style={{ fontFamily: T.mono, fontSize: 20, color: item.color, lineHeight: 1 }}>{item.icon}</div>
//               <div>
//                 <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 4, color: item.color, marginBottom: 4 }}>{item.label}</div>
//                 <div style={{ fontFamily: T.mono, fontSize: 11, color: T.text, lineHeight: 1.8, whiteSpace: "pre" }}>{item.text}</div>
//               </div>
//             </motion.div>
//           ))}
//         </div>
//       </div>
//     </Section>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // SECTION 05 — STACK SIMULATOR
// // ─────────────────────────────────────────────────────────────────────────────
// function StackSimulator() {
//   const [n, setN] = useState(4);
//   const [frames, setFrames] = useState([]);
//   const [running, setRunning] = useState(false);
//   const [infinite, setInfinite] = useState(false);
//   const [output, setOutput] = useState(null);
//   const runRef = useRef(false);

//   const buildSteps = (num) => {
//     const steps = [];
//     for (let i = num; i >= 1; i--) steps.push({ n: i, phase: "call", result: null });
//     steps.push({ n: 1, phase: "base", result: 1 });
//     let acc = 1;
//     for (let i = 2; i <= num; i++) { acc *= i; steps.push({ n: i, phase: "return", result: acc }); }
//     return steps;
//   };

//   const runSim = async () => {
//     if (runRef.current) return;
//     runRef.current = true;
//     setRunning(true);
//     setFrames([]);
//     setOutput(null);
//     const steps = buildSteps(n);
//     const stackArr = [];
//     for (let i = 0; i < steps.length; i++) {
//       if (!runRef.current) break;
//       const s = steps[i];
//       if (s.phase === "call" || s.phase === "base") {
//         stackArr.push({ ...s, id: i });
//         setFrames([...stackArr]);
//       } else {
//         stackArr.pop();
//         setFrames([...stackArr]);
//       }
//       if (i === steps.length - 1) setOutput(s.result);
//       await new Promise(r => setTimeout(r, 620));
//     }
//     runRef.current = false;
//     setRunning(false);
//   };

//   const runInfinite = async () => {
//     if (runRef.current) return;
//     runRef.current = true;
//     setInfinite(true);
//     setRunning(true);
//     setOutput(null);
//     const fakeStack = [];
//     for (let i = 0; i < 9; i++) {
//       if (!runRef.current) break;
//       fakeStack.push({ n: 999 - i, phase: "call", result: null, id: i });
//       setFrames([...fakeStack]);
//       await new Promise(r => setTimeout(r, 220));
//     }
//     setOutput("STACK OVERFLOW ☠");
//     runRef.current = false;
//     setRunning(false);
//   };

//   const reset = () => { runRef.current = false; setRunning(false); setFrames([]); setOutput(null); setInfinite(false); };
//   const maxDepth = n + 1;

//   return (
//     <Section id="callstack">
//       <SectionHeader num="05" tag="CALL STACK" title="STACK SIMULATOR" color={T.neon4} />
//       <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

//         <GlassCard style={{ padding: 28 }}>
//           <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 4, color: T.neon4, marginBottom: 20 }}>▸ CONFIGURE</div>

//           <div style={{ marginBottom: 22 }}>
//             <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
//               <span style={{ fontFamily: T.mono, fontSize: 10, color: T.muted }}>factorial(n)</span>
//               <motion.span key={n} animate={{ scale: [1.4,1] }}
//                 style={{ fontFamily: T.mono, fontSize: 22, fontWeight: 700, color: T.neon4 }}>{n}</motion.span>
//             </div>
//             <input type="range" min={1} max={8} value={n}
//               onChange={e => { setN(Number(e.target.value)); reset(); }}
//               style={{ width: "100%", accentColor: T.neon4 }} />
//             <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, marginTop: 4 }}>Max depth: {n+1} frames</div>
//           </div>

//           {/* Depth meter */}
//           <div style={{ marginBottom: 22 }}>
//             <div style={{ fontFamily: T.mono, fontSize: 8, color: T.muted, marginBottom: 10, letterSpacing: 3 }}>
//               STACK DEPTH [{frames.length} / {infinite ? "∞" : maxDepth}]
//             </div>
//             <div style={{ display: "flex", gap: 3 }}>
//               {Array.from({ length: infinite ? 9 : maxDepth }).map((_,i) => {
//                 const filled = i < frames.length;
//                 return (
//                   <motion.div key={i}
//                     animate={{
//                       background: filled ? (infinite ? T.neon3 : T.neon4) : T.dim,
//                       boxShadow: filled ? `0 0 8px ${infinite ? T.neon3 : T.neon4}60` : "none",
//                     }}
//                     style={{ flex: 1, height: 32, borderRadius: 5, transition: "all 0.3s" }} />
//                 );
//               })}
//             </div>
//           </div>

//           <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
//             <motion.button whileHover={{ scale: 1.04, boxShadow: `0 0 30px ${T.neon4}50` }} whileTap={{ scale: 0.97 }}
//               onClick={runSim} disabled={running}
//               style={{ flex: 2, fontFamily: T.display, fontSize: 13, letterSpacing: 4, color: "#000", background: running ? T.muted : `linear-gradient(135deg, ${T.neon4}, ${T.neon2})`, border: "none", borderRadius: 8, padding: "12px", cursor: running ? "not-allowed" : "pointer" }}>
//               {running ? "RUNNING…" : `▶ RUN fact(${n})`}
//             </motion.button>
//             <motion.button whileHover={{ scale: 1.04, boxShadow: `0 0 25px ${T.neon3}50` }} whileTap={{ scale: 0.97 }}
//               onClick={runInfinite} disabled={running}
//               style={{ flex: 1, fontFamily: T.display, fontSize: 11, letterSpacing: 3, color: "#000", background: running ? T.muted : `linear-gradient(135deg, ${T.neon3}, #FF0055)`, border: "none", borderRadius: 8, padding: "12px", cursor: running ? "not-allowed" : "pointer" }}>
//               ☠ INFINITE
//             </motion.button>
//             <motion.button whileTap={{ scale: 0.95 }} onClick={reset}
//               style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, background: "transparent", border: `1px solid ${T.dim}`, borderRadius: 8, padding: "12px 14px", cursor: "pointer" }}>↺</motion.button>
//           </div>

//           <AnimatePresence mode="wait">
//             {output && (
//               <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
//                 style={{
//                   padding: "16px 20px", borderRadius: 11, textAlign: "center",
//                   background: infinite ? `${T.neon3}18` : `${T.neon4}14`,
//                   border: `2px solid ${infinite ? T.neon3 : T.neon4}`,
//                   boxShadow: `0 0 30px ${infinite ? T.neon3 : T.neon4}50`,
//                   fontFamily: T.display, fontSize: 26, letterSpacing: 5,
//                   color: infinite ? T.neon3 : T.neon4,
//                 }}>{infinite ? output : `= ${output}`}</motion.div>
//             )}
//           </AnimatePresence>
//         </GlassCard>

//         {/* Live stack — newest frame pushed to top visually */}
//         <GlassCard style={{ padding: 24, overflow: "hidden" }}>
//           <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 4, color: T.neon4, marginBottom: 8 }}>▸ LIVE STACK</div>
//           <div style={{ fontFamily: T.mono, fontSize: 8, color: T.muted, marginBottom: 16, letterSpacing: 2 }}>
//             ↑ TOP (newest frame, currently executing)
//           </div>

//           {/* Stack grows UP — newest at top of visual, oldest at bottom */}
//           <div style={{ display: "flex", flexDirection: "column", gap: 6, minHeight: 300 }}>
//             <AnimatePresence>
//               {[...frames].reverse().map((frame, i) => {
//                 const isTop = i === 0;
//                 const color = frame.phase === "base" ? T.neon4 : frame.phase === "return" ? T.neon3 : (infinite ? T.neon3 : T.neon2);
//                 return (
//                   <motion.div
//                     key={frame.id}
//                     layout
//                     initial={{ opacity: 0, y: -28, scale: 0.9 }}
//                     animate={{ opacity: 1, y: 0, scale: 1 }}
//                     exit={{ opacity: 0, y: -28, scale: 0.88, transition: { duration: 0.3 } }}
//                     transition={{ type: "spring", stiffness: 300, damping: 26 }}
//                     style={{
//                       padding: "10px 16px", borderRadius: 9,
//                       background: isTop ? `${color}22` : `${color}0A`,
//                       border: `${isTop ? "2px" : "1px"} solid ${isTop ? color : `${color}40`}`,
//                       boxShadow: isTop ? `0 0 25px ${color}50` : "none",
//                       display: "flex", justifyContent: "space-between", alignItems: "center",
//                     }}>
//                     <div>
//                       <div style={{ fontFamily: T.mono, fontSize: 8, color, letterSpacing: 2, marginBottom: 2 }}>
//                         {isTop ? "▶ EXECUTING" : `frame ${frame.n < 999 ? frames.length - i - 1 : "?"}`}
//                       </div>
//                       <span style={{ fontFamily: T.mono, fontSize: 15, fontWeight: 700, color }}>
//                         {frame.n < 999 ? `fact(${frame.n})` : `fact(∞)`}
//                       </span>
//                     </div>
//                     <div style={{ textAlign: "right" }}>
//                       <div style={{ fontFamily: T.mono, fontSize: 8, color: T.muted, letterSpacing: 2 }}>{frame.phase.toUpperCase()}</div>
//                       {frame.result !== null && (
//                         <div style={{ fontFamily: T.mono, fontSize: 14, fontWeight: 700, color: T.neon4 }}>→ {frame.result}</div>
//                       )}
//                     </div>
//                   </motion.div>
//                 );
//               })}
//             </AnimatePresence>
//             {frames.length === 0 && (
//               <div style={{ fontFamily: T.mono, fontSize: 11, color: T.muted, textAlign: "center", paddingTop: 80 }}>
//                 Press ▶ RUN to fill stack
//               </div>
//             )}
//           </div>

//           {frames.length > 0 && (
//             <div style={{ marginTop: 12, fontFamily: T.mono, fontSize: 8, color: T.muted, letterSpacing: 2, textAlign: "center" }}>
//               ↓ BOTTOM (first call — waiting to resume)
//             </div>
//           )}
//         </GlassCard>
//       </div>
//     </Section>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // SECTION 06 — MASTER ENGINE
// // ─────────────────────────────────────────────────────────────────────────────
// const ENGINE_PROGS = [
//   {
//     name: "PTR BASICS",
//     color: T.neon,
//     lines: [
//       `int x = 42;`,
//       `int *p = &x;`,
//       `printf("%p", p);`,
//       `printf("%d", *p);`,
//       `*p = 100;`,
//       `printf("%d", x);`,
//     ],
//     steps: [
//       { line: 0, mem: { x: 42 }, out: "" },
//       { line: 1, mem: { x: 42, p: "0x2000" }, out: "" },
//       { line: 2, mem: { x: 42, p: "0x2000" }, out: "0x2000" },
//       { line: 3, mem: { x: 42, p: "0x2000" }, out: "42" },
//       { line: 4, mem: { x: 100, p: "0x2000" }, out: "" },
//       { line: 5, mem: { x: 100, p: "0x2000" }, out: "100" },
//     ],
//   },
//   {
//     name: "RECURSION",
//     color: T.neon3,
//     lines: [
//       `int fact(int n) {`,
//       `  if (n <= 1)`,
//       `    return 1;`,
//       `  return n * fact(n-1);`,
//       `}`,
//       `int r = fact(4);`,
//       `printf("%d", r);`,
//     ],
//     steps: [
//       { line: 5, mem: { "fact(4)": "calling..." }, out: "" },
//       { line: 1, mem: { n: 4 }, out: "" },
//       { line: 3, mem: { n: 4, "calling": "fact(3)" }, out: "" },
//       { line: 1, mem: { n: 3, "calling": "fact(2)" }, out: "" },
//       { line: 1, mem: { n: 2, "calling": "fact(1)" }, out: "" },
//       { line: 2, mem: { n: 1, result: 1 }, out: "" },
//       { line: 3, mem: { "unwinding": "2×1=2, 3×2=6, 4×6=24" }, out: "" },
//       { line: 6, mem: { r: 24 }, out: "24" },
//     ],
//   },
//   {
//     name: "PTR + FUNCTION",
//     color: T.neon2,
//     lines: [
//       `void double(int *p) {`,
//       `  *p = *p * 2;`,
//       `}`,
//       `int x = 5;`,
//       `double(&x);`,
//       `printf("%d", x);`,
//     ],
//     steps: [
//       { line: 3, mem: { x: 5 }, out: "" },
//       { line: 4, mem: { x: 5, p: "&x" }, out: "" },
//       { line: 1, mem: { x: 5, p: "&x", "*p": "5*2" }, out: "" },
//       { line: 1, mem: { x: 10, p: "&x" }, out: "" },
//       { line: 5, mem: { x: 10 }, out: "10" },
//     ],
//   },
// ];

// function EngineSection() {
//   const [progIdx, setProgIdx] = useState(0);
//   const [step, setStep] = useState(-1);
//   const [memory, setMemory] = useState({});
//   const [output, setOutput] = useState("");
//   const [running, setRunning] = useState(false);
//   const runningRef = useRef(false);
//   const prog = ENGINE_PROGS[progIdx];

//   const reset = () => { runningRef.current = false; setStep(-1); setMemory({}); setOutput(""); setRunning(false); };

//   const run = async () => {
//     if (runningRef.current) return;
//     reset();
//     await new Promise(r => setTimeout(r, 80));
//     runningRef.current = true;
//     setRunning(true);
//     for (let i = 0; i < prog.steps.length; i++) {
//       if (!runningRef.current) break;
//       const s = prog.steps[i];
//       setStep(s.line);
//       setMemory({ ...s.mem });
//       if (s.out) setOutput(s.out);
//       await new Promise(r => setTimeout(r, 850));
//     }
//     setStep(-1);
//     setRunning(false);
//     runningRef.current = false;
//   };

//   return (
//     <Section id="engine">
//       <SectionHeader num="06" tag="MASTER ENGINE" title="FULL SIMULATION" color={T.accent} />

//       <div style={{ display: "flex", gap: 10, marginBottom: 28, flexWrap: "wrap" }}>
//         {ENGINE_PROGS.map((p, i) => (
//           <Pill key={p.name} color={p.color} active={progIdx === i} onClick={() => { setProgIdx(i); reset(); }}>
//             {p.name}
//           </Pill>
//         ))}
//       </div>

//       <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
//         <GlassCard style={{ overflow: "hidden" }}>
//           <div style={{ background: "rgba(0,0,0,0.45)", borderBottom: `1px solid ${T.dim}`, padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
//             <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
//               <motion.div animate={{ background: running ? prog.color : T.muted, boxShadow: running ? `0 0 12px ${prog.color}` : "none" }}
//                 style={{ width: 7, height: 7, borderRadius: "50%" }} />
//               <span style={{ fontFamily: T.mono, fontSize: 9, color: T.muted }}>{prog.name.toLowerCase().replace(/ /g,"_")}.c</span>
//             </div>
//             <div style={{ display: "flex", gap: 8 }}>
//               <motion.button whileTap={{ scale: 0.95 }} onClick={run} disabled={running}
//                 style={{ fontFamily: T.display, fontWeight: 400, fontSize: 11, letterSpacing: 3, color: "#000", background: running ? T.muted : prog.color, border: "none", borderRadius: 5, padding: "6px 16px", cursor: running ? "not-allowed" : "pointer" }}>
//                 {running ? "RUNNING…" : "▶ RUN"}
//               </motion.button>
//               <motion.button whileTap={{ scale: 0.95 }} onClick={reset}
//                 style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, background: "transparent", border: `1px solid ${T.dim}`, borderRadius: 5, padding: "6px 12px", cursor: "pointer" }}>
//                 RESET
//               </motion.button>
//             </div>
//           </div>

//           <div style={{ padding: "14px 0" }}>
//             {prog.lines.map((line, i) => {
//               const isActive = step === i;
//               return (
//                 <motion.div key={i}
//                   animate={{ background: isActive ? `${prog.color}18` : "transparent", paddingLeft: isActive ? 22 : 16 }}
//                   style={{ display: "flex", alignItems: "center", paddingRight: 16, paddingTop: 3, paddingBottom: 3, borderLeft: `3px solid ${isActive ? prog.color : "transparent"}` }}>
//                   <span style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, minWidth: 26, textAlign: "right", marginRight: 14, userSelect: "none" }}>{i+1}</span>
//                   <span style={{ fontFamily: T.mono, fontSize: 12, color: isActive ? prog.color : T.text, whiteSpace: "pre" }}>{line}</span>
//                   {isActive && (
//                     <motion.span animate={{ opacity: [1,0.2,1] }} transition={{ duration: 0.5, repeat: Infinity }}
//                       style={{ fontFamily: T.mono, fontSize: 8, color: prog.color, marginLeft: "auto", letterSpacing: 2 }}>◀</motion.span>
//                   )}
//                 </motion.div>
//               );
//             })}
//           </div>
//         </GlassCard>

//         <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
//           <GlassCard style={{ padding: 0, overflow: "hidden", flex: 1 }}>
//             <div style={{ background: "rgba(0,0,0,0.4)", borderBottom: `1px solid ${T.dim}`, padding: "10px 16px", fontFamily: T.mono, fontSize: 8, letterSpacing: 3, color: T.neon2 }}>MEMORY STATE</div>
//             <div style={{ padding: "16px", minHeight: 130 }}>
//               <AnimatePresence>
//                 {Object.keys(memory).length === 0 ? (
//                   <div style={{ fontFamily: T.mono, fontSize: 11, color: T.muted }}>No variables yet...</div>
//                 ) : Object.entries(memory).map(([k, v]) => (
//                   <motion.div key={k} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
//                     style={{ display: "flex", alignItems: "center", gap: 12, fontFamily: T.mono, fontSize: 12, marginBottom: 10 }}>
//                     <span style={{ color: T.neon2, minWidth: 80 }}>{k}</span>
//                     <motion.div key={String(v)} initial={{ scale: 1.4, color: prog.color }} animate={{ scale: 1, color: T.text }}
//                       style={{ background: `${prog.color}15`, border: `1px solid ${prog.color}40`, borderRadius: 5, padding: "3px 12px", fontWeight: 700, fontFamily: T.mono, fontSize: 11 }}>
//                       {String(v)}
//                     </motion.div>
//                   </motion.div>
//                 ))}
//               </AnimatePresence>
//             </div>
//           </GlassCard>

//           <GlassCard style={{ padding: 0, overflow: "hidden" }}>
//             <div style={{ background: "rgba(0,0,0,0.4)", borderBottom: `1px solid ${T.dim}`, padding: "10px 16px", fontFamily: T.mono, fontSize: 8, letterSpacing: 3, color: T.neon3 }}>OUTPUT</div>
//             <div style={{ padding: "14px 16px", minHeight: 56 }}>
//               {output ? (
//                 <motion.pre initial={{ opacity: 0 }} animate={{ opacity: 1 }}
//                   style={{ fontFamily: T.mono, fontSize: 16, color: T.neon4, lineHeight: 1.8 }}>
//                   {output}
//                 </motion.pre>
//               ) : (
//                 <span style={{ fontFamily: T.mono, fontSize: 11, color: T.muted }}>
//                   {running ? "executing..." : "press ▶ RUN"}
//                 </span>
//               )}
//             </div>
//           </GlassCard>

//           <InsightBlock title="COMBINE BOTH" color={T.accent} icon="🚀">
//             {"Pointers let functions modify real vars.\nRecursion breaks big problems small.\nTogether = linked lists, trees, parsers."}
//           </InsightBlock>
//         </div>
//       </div>
//     </Section>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // SIDEBAR
// // ─────────────────────────────────────────────────────────────────────────────
// function Sidebar({ activeSection }) {
//   return (
//     <aside style={{
//       width: 215, minWidth: 215, flexShrink: 0,
//       background: `linear-gradient(180deg, ${T.bg1} 0%, ${T.bg} 100%)`,
//       borderRight: `1px solid ${T.dim}`,
//       display: "flex", flexDirection: "column",
//       padding: "26px 0", position: "sticky", top: 0, height: "100vh", overflow: "hidden",
//     }}>
//       <div style={{ padding: "0 18px 20px" }}>
//         <div style={{ fontFamily: T.display, fontWeight: 400, fontSize: 18, letterSpacing: 4, color: T.neon }}>C LANG</div>
//         <div style={{ fontFamily: T.mono, fontSize: 7, letterSpacing: 4, color: T.muted, marginTop: 2 }}>CH.6 · PTR + RECURSION</div>
//       </div>
//       <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${T.neon}40, transparent)`, marginBottom: 14 }} />
//       <nav style={{ overflowY: "auto", flex: 1 }}>
//         {NAV_ITEMS.map(item => {
//           const isActive = activeSection === item.id;
//           return (
//             <motion.a key={item.id} href={`#${item.id}`}
//               onClick={e => { e.preventDefault(); document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" }); }}
//               animate={{ color: isActive ? T.neon : T.muted, background: isActive ? `${T.neon}08` : "transparent" }}
//               whileHover={{ color: T.text, paddingLeft: 24 }}
//               transition={{ duration: 0.18 }}
//               style={{
//                 display: "flex", alignItems: "center", gap: 9,
//                 padding: "10px 18px", fontFamily: T.mono, fontSize: 10,
//                 fontWeight: 600, letterSpacing: 1.5, textDecoration: "none",
//                 borderLeft: `2px solid ${isActive ? T.neon : "transparent"}`,
//               }}>
//               <span style={{ fontSize: 11 }}>{item.icon}</span>
//               <div>
//                 <div style={{ fontSize: 7, opacity: 0.4, marginBottom: 1 }}>{item.num}</div>
//                 {item.label}
//               </div>
//               {isActive && (
//                 <motion.div layoutId="nav-dot-c6"
//                   style={{ width: 4, height: 4, borderRadius: "50%", background: T.neon, marginLeft: "auto" }} />
//               )}
//             </motion.a>
//           );
//         })}
//       </nav>
//       <div style={{ padding: "14px 18px", fontFamily: T.mono, fontSize: 9, color: T.dim, letterSpacing: 2, lineHeight: 2 }}>
//         C VISUAL SIM<br />v6.0
//       </div>
//     </aside>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // RIGHT PANEL
// // ─────────────────────────────────────────────────────────────────────────────
// const DEEP = {
//   hero:      { title: "Chapter 6",   color: T.neon,   why: "Pointers and recursion are C superpowers. Used in every system program ever written.", mistake: "Dereferencing a NULL or uninitialized pointer = instant crash (segfault).", model: "Pointer = sticky note with an address. Follow it to find the box." },
//   memory:    { title: "RAM Basics",  color: T.neon2,  why: "All variables live in RAM. Knowing where = power.", mistake: "Assuming variables are adjacent — padding/alignment can add gaps.", model: "RAM = a street of numbered houses. &x = house number of x." },
//   pointers:  { title: "Pointers",    color: T.neon,   why: "Pointers enable functions to modify real data, not copies.", mistake: "Printing *p before p is assigned = garbage or crash.", model: "int *p = address. *p = the thing. & = find the address." },
//   deref:     { title: "Dereference", color: T.neon2,  why: "Write through a pointer = change the original variable.", mistake: "Forgetting to assign pointer before writing = wild pointer = data corruption.", model: "p = road sign. *p = destination. Change *p = change destination." },
//   recursion: { title: "Recursion",   color: T.neon3,  why: "Some problems are naturally recursive: trees, mazes, math.", mistake: "Missing base case = infinite recursion = stack overflow crash (☠).", model: "Recursion = Russian dolls. Open each, find a smaller one, until empty." },
//   callstack: { title: "Call Stack",  color: T.neon4,  why: "Each function call gets its own frame with local vars.", mistake: "Stack overflow when recursion is too deep (default ~1-8MB limit).", model: "Stack = tower of trays. Push when calling, pop when returning." },
//   engine:    { title: "Full Engine", color: T.accent, why: "Real code combines pointers + recursion constantly.", mistake: "Overcomplicating — use recursion only when it simplifies the logic.", model: "Master Ch.6 = understand how every compiler, OS and game engine works internally." },
// };

// function RightPanel({ activeSection }) {
//   const data = DEEP[activeSection] || DEEP.hero;
//   const [liveTime, setLiveTime] = useState(0);
//   useEffect(() => {
//     const iv = setInterval(() => setLiveTime(t => t+1), 1000);
//     return () => clearInterval(iv);
//   }, []);

//   return (
//     <aside style={{
//       width: 285, minWidth: 285, flexShrink: 0,
//       background: `linear-gradient(180deg, ${T.bg1} 0%, ${T.bg} 100%)`,
//       borderLeft: `1px solid ${T.dim}`,
//       padding: "26px 14px",
//       display: "flex", flexDirection: "column", gap: 12,
//       overflowY: "auto", overflowX: "hidden",
//       position: "sticky", top: 0, height: "100vh",
//     }}>
//       <div>
//         <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 5, color: T.neon, marginBottom: 8 }}>DEEP</div>
//         <div style={{ height: 1, background: `linear-gradient(90deg, ${T.neon}40, transparent)` }} />
//       </div>

//       <div style={{ background: `${T.neon}05`, border: `1px solid ${T.neon}18`, borderRadius: 9, padding: "10px 12px" }}>
//         <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 4, color: T.neon, marginBottom: 8 }}>⚙ LIVE</div>
//         <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
//           {[
//             { label: "SECTION", value: (activeSection || "hero").toUpperCase().slice(0,8), color: data.color },
//             { label: "UPTIME",  value: `${liveTime}s`, color: T.neon2 },
//             { label: "TOPICS",  value: "6", color: T.neon4 },
//             { label: "ENGINE",  value: "LIVE", color: T.neon },
//           ].map(({ label, value, color }) => (
//             <div key={label}>
//               <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 2, color: T.muted }}>{label}</div>
//               <motion.div key={value} initial={{ opacity: 0.4 }} animate={{ opacity: 1 }}
//                 style={{ fontFamily: T.mono, fontSize: 12, fontWeight: 700, color }}>{value}</motion.div>
//             </div>
//           ))}
//         </div>
//       </div>

//       <AnimatePresence mode="wait">
//         <motion.div key={activeSection} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
//           transition={{ duration: 0.28 }}
//           style={{ display: "flex", flexDirection: "column", gap: 10 }}>

//           <div style={{ padding: "12px 14px", borderRadius: 10, background: `${data.color}10`, border: `1px solid ${data.color}35` }}>
//             <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 3, color: data.color, marginBottom: 4 }}>CURRENT</div>
//             <div style={{ fontFamily: T.display, fontSize: 20, fontWeight: 400, letterSpacing: 3, color: data.color }}>{data.title}</div>
//           </div>

//           <div style={{ padding: "14px", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: `1px solid ${T.dim}` }}>
//             <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 3, color: T.neon, marginBottom: 8 }}>💡 WHY</div>
//             <div style={{ fontFamily: T.mono, fontSize: 11, color: T.text, lineHeight: 1.85 }}>{data.why}</div>
//           </div>

//           <div style={{ padding: "14px", borderRadius: 10, background: `${T.neon3}08`, border: `1px solid ${T.neon3}25` }}>
//             <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 3, color: T.neon3, marginBottom: 8 }}>⚠ MISTAKE</div>
//             <div style={{ fontFamily: T.mono, fontSize: 11, color: T.text, lineHeight: 1.85 }}>{data.mistake}</div>
//           </div>

//           <div style={{ padding: "14px", borderRadius: 10, background: `${data.color}08`, border: `1px solid ${data.color}20` }}>
//             <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 3, color: data.color, marginBottom: 8 }}>🧠 MODEL</div>
//             <div style={{ fontFamily: T.mono, fontSize: 11, color: T.text, lineHeight: 1.85, fontStyle: "italic" }}>"{data.model}"</div>
//           </div>
//         </motion.div>
//       </AnimatePresence>

//       <div style={{ marginTop: "auto" }}>
//         <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${T.dim}, transparent)`, marginBottom: 12 }} />
//         <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 3, color: T.muted, marginBottom: 8 }}>CHAPTER NAVIGATION</div>
//         <div style={{ display: "flex", gap: 8 }}>
//           <Link href="/c-5" passHref legacyBehavior>
//             <motion.a whileHover={{ color: T.neon, scale: 1.02 }} style={{
//               flex: 1, textAlign: "center", padding: "7px", borderRadius: 6,
//               background: "transparent", border: `1px solid ${T.dim}`,
//               fontFamily: T.mono, fontSize: 9, color: T.muted, textDecoration: "none", cursor: "pointer",
//             }}>← C5</motion.a>
//           </Link>
//           <Link href="/c-7" passHref legacyBehavior>
//             <motion.a whileHover={{ color: T.neon, scale: 1.02 }} style={{
//               flex: 1, textAlign: "center", padding: "7px", borderRadius: 6,
//               background: "transparent", border: `1px solid ${T.dim}`,
//               fontFamily: T.mono, fontSize: 9, color: T.muted, textDecoration: "none", cursor: "pointer",
//             }}>C7 →</motion.a>
//           </Link>
//         </div>
//       </div>
//     </aside>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // ROOT PAGE
// // ─────────────────────────────────────────────────────────────────────────────
// export default function C6Page() {
//   const [activeSection, setActiveSection] = useState("hero");

//   useEffect(() => {
//     const observer = new IntersectionObserver(
//       entries => { entries.forEach(e => { if (e.isIntersecting) setActiveSection(e.target.id); }); },
//       { threshold: 0.2, rootMargin: "-10% 0px -10% 0px" }
//     );
//     NAV_ITEMS.forEach(item => {
//       const el = document.getElementById(item.id);
//       if (el) observer.observe(el);
//     });
//     return () => observer.disconnect();
//   }, []);

//   return (
//     <>
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Fira+Code:wght@300;400;500;600;700&display=swap');
//         *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
//         html { scroll-behavior: smooth; }
//         body { background: ${T.bg}; color: ${T.text}; overflow-x: hidden; }
//         ::-webkit-scrollbar { width: 3px; }
//         ::-webkit-scrollbar-track { background: ${T.bg}; }
//         ::-webkit-scrollbar-thumb { background: ${T.neon}; border-radius: 2px; }
//         input[type=range] { height: 4px; cursor: pointer; -webkit-appearance: none; appearance: none; background: ${T.dim}; border-radius: 2px; outline: none; }
//         input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 14px; height: 14px; border-radius: 50%; background: ${T.neon}; cursor: pointer; box-shadow: 0 0 10px ${T.neon}70; }
//         input[type=number] { -moz-appearance: textfield; }
//         input[type=number]::-webkit-outer-spin-button, input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
//         button { outline: none; }
//         a { text-decoration: none; }
//       `}</style>

//       <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: T.bg }}>
//         <Sidebar activeSection={activeSection} />

//         <main style={{ flex: 1, overflowY: "auto", overflowX: "hidden", minWidth: 0 }}>
//           <div style={{ maxWidth: "100%", padding: "0 38px" }}>
//             <HeroSection />
//             <MemorySection />
//             <PointersSection />
//             <DerefSection />
//             <RecursionSection />
//             <StackSimulator />
//             <EngineSection />
//             <div style={{ height: 80 }} />
//           </div>
//         </main>

//         <RightPanel activeSection={activeSection} />
//       </div>
//     </>
//   );
// }
"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useInView } from "framer-motion";
import { useRouter } from "next/navigation";

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN TOKENS
// ─────────────────────────────────────────────────────────────────────────────
const T = {
  bg: "#03050A",
  bg1: "#060B14",
  bg2: "#091220",
  glass: "rgba(6,12,24,0.85)",
  border: "rgba(0,200,255,0.10)",
  neon: "#00C8FF",
  neon2: "#FF4D6D",
  neon3: "#39FF14",
  neon4: "#FFB800",
  purple: "#9D4EDD",
  text: "#DCE8F5",
  muted: "#3A5068",
  dim: "#0E1E2F",
  mono: "'Fira Code', 'Cascadia Code', monospace",
  display: "'Bebas Neue', sans-serif",
  sans: "'DM Sans', 'Segoe UI', sans-serif",
};

// ─────────────────────────────────────────────────────────────────────────────
// UTILITY COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
function Glow({ color = T.neon, size = 300, opacity = 0.08, style = {} }) {
  return (
    <div style={{
      position: "absolute", borderRadius: "50%",
      width: size, height: size,
      background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
      opacity, pointerEvents: "none", ...style,
    }} />
  );
}

function GlassCard({ children, style = {}, glow = T.neon, onClick, hover = true }) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={hover ? { borderColor: `${glow}50`, boxShadow: `0 0 40px ${glow}18, 0 8px 60px rgba(0,0,0,0.6)` } : {}}
      transition={{ type: "spring", stiffness: 260, damping: 26 }}
      style={{
        background: T.glass,
        border: `1px solid ${T.border}`,
        borderRadius: 16,
        backdropFilter: "blur(28px)",
        WebkitBackdropFilter: "blur(28px)",
        boxShadow: "0 4px 50px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.04)",
        ...style,
      }}
    >{children}</motion.div>
  );
}

function NeonText({ children, color = T.neon, style = {} }) {
  return (
    <motion.span
      animate={{ textShadow: [`0 0 20px ${color}80`, `0 0 45px ${color}C0`, `0 0 20px ${color}80`] }}
      transition={{ duration: 2.4, repeat: Infinity }}
      style={{ color, ...style }}
    >{children}</motion.span>
  );
}

function Pill({ children, color = T.neon, active, onClick, style = {} }) {
  return (
    <motion.button
      whileHover={{ scale: 1.07, y: -2 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      style={{
        fontFamily: T.mono, fontSize: 10, fontWeight: 600, letterSpacing: 2,
        color: active ? "#000" : color,
        background: active ? color : `${color}15`,
        border: `1px solid ${active ? color : `${color}45`}`,
        borderRadius: 7, padding: "7px 18px", cursor: "pointer",
        boxShadow: active ? `0 0 22px ${color}60` : "none",
        transition: "all 0.18s", ...style,
      }}
    >{children}</motion.button>
  );
}

function AddressTag({ addr, color = T.neon }) {
  return (
    <motion.span
      animate={{ boxShadow: [`0 0 8px ${color}50`, `0 0 18px ${color}90`, `0 0 8px ${color}50`] }}
      transition={{ duration: 1.8, repeat: Infinity }}
      style={{
        fontFamily: T.mono, fontSize: 11, fontWeight: 700, color,
        background: `${color}18`, border: `1px solid ${color}55`,
        borderRadius: 5, padding: "2px 9px", display: "inline-block",
      }}
    >{addr}</motion.span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 1: HERO — MEMORY WORLD
// ─────────────────────────────────────────────────────────────────────────────
function HeroSection() {
  const [pointerMode, setPointerMode] = useState("addr"); // addr | value
  const [lineDrawn, setLineDrawn] = useState(false);
  const [hovered, setHovered] = useState(null);
  const [phase, setPhase] = useState(0);
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end start"] });
  const yBg = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const memCells = [
    { addr: "0x1A00", label: null, value: "??", color: T.muted, dim: true },
    { addr: "0x1A04", label: "x", value: 42, color: T.neon3, isVar: true },
    { addr: "0x1A08", label: "p", value: "0x1A04", color: T.neon, isPtr: true },
    { addr: "0x1A0C", label: null, value: "??", color: T.muted, dim: true },
    { addr: "0x1A10", label: null, value: "??", color: T.muted, dim: true },
  ];

  const xCell = memCells[1];
  const pCell = memCells[2];

  const runAnimation = async () => {
    setPhase(1);
    await new Promise(r => setTimeout(r, 700));
    setPhase(2);
    await new Promise(r => setTimeout(r, 600));
    setLineDrawn(true);
    setPhase(3);
  };

  const phrases = ["pointer = address", "*p = follow arrow", "&x = where x lives", "p → 0x1A04 → 42"];
  const [phraseIdx, setPhraseIdx] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setPhraseIdx(p => (p + 1) % phrases.length), 3000);
    return () => clearInterval(iv);
  }, []);

  return (
    <section ref={containerRef} id="hero" style={{
      minHeight: "100vh", position: "relative", overflow: "hidden",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      background: `radial-gradient(ellipse 90% 60% at 50% -10%, rgba(0,200,255,0.1) 0%, transparent 65%),
                   radial-gradient(ellipse 50% 40% at 90% 80%, rgba(157,78,221,0.08) 0%, transparent 55%),
                   ${T.bg}`,
    }}>
      {/* Scan lines */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
        backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,200,255,0.008) 3px, rgba(0,200,255,0.008) 4px)",
      }} />

      <Glow color={T.neon} size={600} opacity={0.07} style={{ top: -150, left: "50%", transform: "translateX(-50%)" }} />
      <Glow color={T.purple} size={400} opacity={0.06} style={{ bottom: 100, right: -100 }} />

      <motion.div style={{ y: yBg, opacity, position: "relative", zIndex: 10, width: "100%", maxWidth: 1100, padding: "0 40px" }}>

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            fontFamily: T.mono, fontSize: 9, letterSpacing: 5, color: T.neon,
            border: `1px solid ${T.border}`, background: "rgba(0,200,255,0.05)",
            padding: "7px 22px", borderRadius: 100, marginBottom: 28,
          }}
        >
          <motion.span
            animate={{ opacity: [1, 0.1, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            style={{ width: 5, height: 5, borderRadius: "50%", background: T.neon, display: "inline-block" }}
          />
          C · CHAPTER 6 · POINTERS + RECURSION
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 1, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontFamily: T.display, fontWeight: 400,
            fontSize: "clamp(56px, 9vw, 118px)",
            lineHeight: 0.88, letterSpacing: 5, color: T.text, marginBottom: 20,
          }}
        >
          MEMORY
          <br />
          <NeonText color={T.neon} style={{ fontFamily: T.display, fontWeight: 400, fontSize: "inherit", letterSpacing: 5 }}>
            WORLD
          </NeonText>
        </motion.h1>

        {/* Rotating phrase */}
        <div style={{ height: 28, marginBottom: 44, overflow: "hidden" }}>
          <AnimatePresence mode="wait">
            <motion.p
              key={phraseIdx}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.32 }}
              style={{ fontFamily: T.mono, fontSize: 13, color: T.neon2, letterSpacing: 1 }}
            >
              → {phrases[phraseIdx]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Memory visual */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, alignItems: "start" }}>

          {/* Left: Memory grid */}
          <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.55 }}>
            <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 5, color: T.neon, marginBottom: 16 }}>▸ RAM CELLS</div>

            {/* SVG connection line */}
            <div style={{ position: "relative" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {memCells.map((cell, i) => (
                  <motion.div
                    key={i}
                    initial={{ x: -30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.6 + i * 0.09, type: "spring", stiffness: 220 }}
                    onMouseEnter={() => setHovered(i)}
                    onMouseLeave={() => setHovered(null)}
                    style={{ display: "flex", alignItems: "center", gap: 12, cursor: "default" }}
                  >
                    <span style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, width: 68, textAlign: "right" }}>{cell.addr}</span>

                    <motion.div
                      animate={{
                        borderColor: hovered === i ? (cell.isVar ? T.neon3 : cell.isPtr ? T.neon : `${T.muted}60`) :
                          (cell.isVar && lineDrawn) ? T.neon3 :
                            (cell.isPtr && lineDrawn) ? T.neon :
                              `${T.neon}18`,
                        background: hovered === i ? `${(cell.isVar ? T.neon3 : cell.isPtr ? T.neon : T.muted)}18` :
                          (cell.isVar && lineDrawn) ? `${T.neon3}12` :
                            (cell.isPtr && lineDrawn) ? `${T.neon}12` :
                              `${T.neon}05`,
                        boxShadow: (cell.isVar || cell.isPtr) && lineDrawn ? `0 0 30px ${cell.isVar ? T.neon3 : T.neon}50` : "none",
                      }}
                      transition={{ duration: 0.4 }}
                      style={{
                        flex: 1, height: 56, borderRadius: 9, border: "2px solid",
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "0 16px",
                      }}
                    >
                      <span style={{ fontFamily: T.mono, fontSize: 9, color: cell.dim ? T.muted : (cell.isVar ? T.neon3 : T.neon) }}>
                        {cell.label ? `${cell.isPtr ? "int*" : "int"} ${cell.label}` : "···"}
                      </span>
                      <motion.span
                        animate={cell.isPtr && pointerMode === "value" && lineDrawn ? {
                          color: [T.neon, T.neon3, T.neon],
                        } : {}}
                        transition={{ duration: 1.2, repeat: Infinity }}
                        style={{
                          fontFamily: T.mono, fontSize: 15, fontWeight: 700,
                          color: cell.dim ? `${T.muted}60` : (cell.isVar ? T.neon3 : cell.isPtr ? T.neon : T.muted),
                        }}
                      >
                        {cell.isPtr && lineDrawn
                          ? (pointerMode === "value" ? `*p = 42` : `p = 0x1A04`)
                          : String(cell.value)}
                      </motion.span>
                    </motion.div>

                    <div style={{ width: 28, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {cell.isPtr && lineDrawn && (
                        <motion.div
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          style={{ fontFamily: T.mono, fontSize: 20, color: T.neon }}
                        >→</motion.div>
                      )}
                      {cell.isVar && lineDrawn && (
                        <motion.div
                          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1.3, repeat: Infinity }}
                          style={{ width: 9, height: 9, borderRadius: "50%", background: T.neon3, boxShadow: `0 0 14px ${T.neon3}` }}
                        />
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Animated connector arc */}
              <AnimatePresence>
                {lineDrawn && (
                  <motion.svg
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none" }}
                    viewBox="0 0 400 260"
                  >
                    <motion.path
                      d="M 350 160 C 410 160 410 100 350 100"
                      fill="none"
                      stroke={T.neon}
                      strokeWidth="2.5"
                      strokeDasharray="7 5"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.9, ease: "easeOut" }}
                    />
                    <motion.circle cx="350" cy="100" r="5" fill={T.neon}
                      animate={{ r: [4, 8, 4], opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1.6, repeat: Infinity }}
                    />
                    <motion.circle cx="350" cy="160" r="4" fill={T.neon}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.8 }}
                    />
                  </motion.svg>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Right: Controls + code */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            style={{ display: "flex", flexDirection: "column", gap: 16 }}
          >
            {/* Code block */}
            <GlassCard style={{ overflow: "hidden" }}>
              <div style={{
                padding: "9px 16px", borderBottom: `1px solid ${T.dim}`,
                display: "flex", gap: 6, alignItems: "center",
              }}>
                {["#FF5F57", "#FEBC2E", "#28C840"].map((c, i) => (
                  <div key={i} style={{ width: 9, height: 9, borderRadius: "50%", background: c }} />
                ))}
                <span style={{ fontFamily: T.mono, fontSize: 8, color: T.muted, marginLeft: 8, letterSpacing: 2 }}>main.c</span>
              </div>
              <div style={{ padding: "16px 20px" }}>
                {[
                  { line: `int x = 42;`, color: T.neon3, active: phase >= 1 },
                  { line: `int *p = &x;`, color: T.neon, active: phase >= 2 },
                  { line: `printf("%p", p);  // 0x1A04`, color: T.text, active: phase >= 3 },
                  { line: `printf("%d", *p); // 42`, color: T.text, active: phase >= 3 },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      background: item.active ? `${item.color}12` : "transparent",
                      borderLeftColor: item.active ? item.color : "transparent",
                    }}
                    style={{
                      fontFamily: T.mono, fontSize: 12, lineHeight: 2.1,
                      paddingLeft: 12, borderLeft: "3px solid",
                      color: item.active ? item.color : `${T.text}60`,
                      transition: "all 0.3s",
                    }}
                  >
                    <span style={{ color: T.muted, marginRight: 14, fontSize: 9 }}>{i + 1}</span>
                    {item.line}
                  </motion.div>
                ))}
              </div>
            </GlassCard>

            {/* Controls */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {!lineDrawn ? (
                <motion.button
                  whileHover={{ scale: 1.04, boxShadow: `0 0 35px ${T.neon}60` }}
                  whileTap={{ scale: 0.97 }}
                  onClick={runAnimation}
                  style={{
                    flex: 1, fontFamily: T.display, fontSize: 14, letterSpacing: 6,
                    color: "#000", background: `linear-gradient(135deg, ${T.neon}, ${T.purple})`,
                    border: "none", borderRadius: 9, padding: "14px", cursor: "pointer",
                  }}
                >▶ ASSIGN POINTER</motion.button>
              ) : (
                <>
                  <Pill color={T.neon} active={pointerMode === "addr"} onClick={() => setPointerMode("addr")}>p (addr)</Pill>
                  <Pill color={T.neon3} active={pointerMode === "value"} onClick={() => setPointerMode("value")}>*p (value)</Pill>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { setLineDrawn(false); setPhase(0); setPointerMode("addr"); }}
                    style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, background: "transparent", border: `1px solid ${T.dim}`, borderRadius: 8, padding: "7px 14px", cursor: "pointer" }}
                  >↺</motion.button>
                </>
              )}
            </div>

            {/* Insight box */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`${phase}-${pointerMode}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  padding: "14px 18px", borderRadius: 11,
                  background: `${T.neon}08`, border: `1px solid ${T.neon}30`,
                  fontFamily: T.mono, fontSize: 11, color: T.text, lineHeight: 1.9,
                }}
              >
                {phase === 0 && "int x lives at 0x1A04. Press ASSIGN."}
                {phase === 1 && "x = 42 stored in memory."}
                {phase === 2 && <span>p stores <AddressTag addr="0x1A04" color={T.neon} /> — x's address.</span>}
                {phase === 3 && pointerMode === "addr" && <span>p = <AddressTag addr="0x1A04" color={T.neon} /> (the address)</span>}
                {phase === 3 && pointerMode === "value" && <span>*p = <strong style={{ color: T.neon3 }}>42</strong> (follow arrow → get value)</span>}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll hint */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2.5, repeat: Infinity }}
        style={{ position: "absolute", bottom: 30, zIndex: 10, fontFamily: T.mono, fontSize: 8, letterSpacing: 6, color: T.muted }}
      >
        SCROLL ↓
      </motion.div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 2: POINTER PLAYGROUND
// ─────────────────────────────────────────────────────────────────────────────
function PointerPlayground() {
  const [varValue, setVarValue] = useState(7);
  const [ptrTarget, setPtrTarget] = useState("x"); // x | y | null
  const [ppMode, setPpMode] = useState(false); // pointer to pointer
  const [step, setStep] = useState(-1);
  const [vars, setVars] = useState({ x: 7, y: 99 });
  const [writeVal, setWriteVal] = useState(55);

  const colors = { x: T.neon3, y: T.neon4, p: T.neon, pp: T.purple };

  const memLayout = [
    { key: "x", addr: "0x2000", type: "int", color: colors.x },
    { key: "y", addr: "0x2004", type: "int", color: colors.y },
    { key: "p", addr: "0x2008", type: "int*", color: colors.p },
    ...(ppMode ? [{ key: "pp", addr: "0x200C", type: "int**", color: colors.pp }] : []),
  ];

  const writeThruPtr = () => {
    if (!ptrTarget) return;
    setVars(prev => ({ ...prev, [ptrTarget]: writeVal }));
    setStep(3);
    setTimeout(() => setStep(-1), 1200);
  };

  return (
    <section id="playground" style={{
      padding: "90px 0",
      background: `radial-gradient(ellipse 70% 50% at 20% 50%, rgba(57,255,20,0.05) 0%, transparent 55%),
                   radial-gradient(ellipse 60% 40% at 80% 30%, rgba(0,200,255,0.05) 0%, transparent 55%),
                   ${T.bg1}`,
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 40px" }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          style={{ marginBottom: 44, display: "flex", alignItems: "flex-end", gap: 20 }}
        >
          <span style={{ fontFamily: T.mono, fontSize: 60, fontWeight: 700, color: T.dim, lineHeight: 1 }}>02</span>
          <div>
            <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 5, color: T.neon, marginBottom: 5 }}>CONTROL THE MEMORY</div>
            <h2 style={{ fontFamily: T.display, fontSize: 38, fontWeight: 400, color: T.text, letterSpacing: 3 }}>POINTER PLAYGROUND</h2>
          </div>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

          {/* Left: Interactive memory */}
          <GlassCard style={{ padding: 28 }}>
            <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 4, color: T.neon, marginBottom: 20 }}>▸ MEMORY STATE</div>

            <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 26 }}>
              {memLayout.map((cell) => {
                const val = cell.key === "p" ? (ptrTarget ? `&${ptrTarget}` : "NULL") :
                  cell.key === "pp" ? "&p" :
                    vars[cell.key];
                const isTarget = (cell.key === ptrTarget) || (ppMode && cell.key === "p" && ptrTarget);
                return (
                  <motion.div
                    key={cell.key}
                    animate={{
                      borderColor: isTarget ? cell.color : `${cell.color}25`,
                      background: isTarget ? `${cell.color}18` : `${cell.color}06`,
                      boxShadow: isTarget ? `0 0 28px ${cell.color}50` : "none",
                    }}
                    style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "12px 16px", borderRadius: 10, border: "2px solid",
                      transition: "all 0.35s",
                    }}
                  >
                    <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, width: 60 }}>{cell.addr}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: T.mono, fontSize: 9, color: cell.color, marginBottom: 3 }}>{cell.type} {cell.key}</div>
                      <motion.div
                        key={String(val)}
                        initial={{ scale: 1.2 }}
                        animate={{ scale: 1 }}
                        style={{ fontFamily: T.mono, fontSize: 17, fontWeight: 700, color: cell.color }}
                      >{String(val)}</motion.div>
                    </div>
                    {isTarget && (
                      <motion.div
                        animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
                        transition={{ duration: 1.1, repeat: Infinity }}
                        style={{ width: 8, height: 8, borderRadius: "50%", background: cell.color }}
                      />
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Controls */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 4, color: T.muted }}>POINT p AT:</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <Pill color={colors.x} active={ptrTarget === "x"} onClick={() => { setPtrTarget("x"); setStep(0); }}>p = &x</Pill>
                <Pill color={colors.y} active={ptrTarget === "y"} onClick={() => { setPtrTarget("y"); setStep(1); }}>p = &y</Pill>
                <Pill color={T.muted} active={ptrTarget === null} onClick={() => { setPtrTarget(null); setStep(-1); }}>NULL</Pill>
              </div>

              <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 6 }}>
                <input
                  type="number"
                  value={writeVal}
                  onChange={e => setWriteVal(Number(e.target.value))}
                  style={{
                    flex: 1, background: `${T.neon}10`, border: `1px solid ${T.neon}35`,
                    borderRadius: 8, padding: "9px 14px",
                    fontFamily: T.mono, fontSize: 13, color: T.neon, outline: "none",
                  }}
                  placeholder="value"
                />
                <motion.button
                  whileHover={{ scale: 1.04, boxShadow: `0 0 25px ${T.neon}50` }}
                  whileTap={{ scale: 0.97 }}
                  onClick={writeThruPtr}
                  disabled={!ptrTarget}
                  style={{
                    fontFamily: T.display, fontSize: 12, letterSpacing: 4,
                    color: "#000", background: ptrTarget ? `linear-gradient(135deg, ${T.neon}, ${T.neon2})` : T.muted,
                    border: "none", borderRadius: 8, padding: "9px 18px", cursor: ptrTarget ? "pointer" : "not-allowed",
                  }}
                >*p = {writeVal}</motion.button>
              </div>

              <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                <Pill color={T.purple} active={ppMode} onClick={() => setPpMode(p => !p)} style={{ fontSize: 9 }}>
                  {ppMode ? "** ON" : "** OFF"} (ptr→ptr)
                </Pill>
              </div>
            </div>
          </GlassCard>

          {/* Right: Concept cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {[
              {
                icon: "&", color: T.neon2, title: "Address-of",
                code: "p = &x;",
                desc: `& gives the memory address.\nPrints as 0x2000`,
              },
              {
                icon: "*", color: T.neon, title: "Dereference",
                code: "*p = 55;",
                desc: `* follows the arrow.\nChanges x through p.`,
              },
              {
                icon: "**", color: T.purple, title: "Ptr to Ptr",
                code: "pp = &p;",
                desc: `**pp = address of address.\nTwo levels of indirection.`,
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.6 }}
                whileHover={{ x: -4, borderColor: `${item.color}60` }}
                style={{
                  padding: "16px 20px", borderRadius: 12,
                  background: `${item.color}08`, border: `1px solid ${item.color}28`,
                  display: "flex", gap: 16, alignItems: "center",
                  transition: "border-color 0.2s",
                }}
              >
                <div style={{
                  width: 46, height: 46, borderRadius: 10, flexShrink: 0,
                  background: `${item.color}18`, border: `1px solid ${item.color}45`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: T.mono, fontSize: 18, fontWeight: 700, color: item.color,
                }}>{item.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 4, color: item.color, marginBottom: 3 }}>{item.title.toUpperCase()}</div>
                  <div style={{ fontFamily: T.mono, fontSize: 13, color: T.text, marginBottom: 4 }}>{item.code}</div>
                  <div style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, lineHeight: 1.7, whiteSpace: "pre" }}>{item.desc}</div>
                </div>
              </motion.div>
            ))}

            {/* Quick rule */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              style={{
                padding: "14px 18px", borderRadius: 11,
                background: `${T.neon3}08`, border: `1px solid ${T.neon3}30`,
                fontFamily: T.mono, fontSize: 12, color: T.text, lineHeight: 1.9,
              }}
            >
              <span style={{ color: T.neon3 }}>RULE:</span>{" "}
              p = address · *p = value · &x = address of x
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 3: RECURSION INTRO
// ─────────────────────────────────────────────────────────────────────────────
const FACTORIAL_STEPS = [
  { n: 5, state: "call", label: "fact(5)", result: null, depth: 0 },
  { n: 4, state: "call", label: "fact(4)", result: null, depth: 1 },
  { n: 3, state: "call", label: "fact(3)", result: null, depth: 2 },
  { n: 2, state: "call", label: "fact(2)", result: null, depth: 3 },
  { n: 1, state: "base", label: "fact(1)", result: 1, depth: 4 },
  { n: 2, state: "return", label: "fact(2)", result: 2, depth: 3 },
  { n: 3, state: "return", label: "fact(3)", result: 6, depth: 2 },
  { n: 4, state: "return", label: "fact(4)", result: 24, depth: 1 },
  { n: 5, state: "return", label: "fact(5)", result: 120, depth: 0 },
];

function RecursionIntro() {
  const [animIdx, setAnimIdx] = useState(-1);
  const [stack, setStack] = useState([]);
  const [running, setRunning] = useState(false);
  const runRef = useRef(false);

  const stateColor = (s) => s === "base" ? T.neon3 : s === "return" ? T.neon4 : T.neon;

  const runAnim = async () => {
    if (runRef.current) return;
    runRef.current = true;
    setRunning(true);
    setStack([]);
    setAnimIdx(-1);

    const callStack = [];
    for (let i = 0; i < FACTORIAL_STEPS.length; i++) {
      if (!runRef.current) break;
      const step = FACTORIAL_STEPS[i];
      setAnimIdx(i);

      if (step.state === "call" || step.state === "base") {
        callStack.push(step);
        setStack([...callStack]);
      } else {
        callStack.pop();
        setStack([...callStack]);
      }

      await new Promise(r => setTimeout(r, 780));
    }

    runRef.current = false;
    setRunning(false);
    setAnimIdx(-1);
  };

  const reset = () => {
    runRef.current = false;
    setRunning(false);
    setStack([]);
    setAnimIdx(-1);
  };

  const currentStep = animIdx >= 0 ? FACTORIAL_STEPS[animIdx] : null;

  return (
    <section id="recursion" style={{
      padding: "90px 0",
      background: `radial-gradient(ellipse 80% 60% at 80% 30%, rgba(255,77,109,0.07) 0%, transparent 60%),
                   radial-gradient(ellipse 50% 40% at 10% 70%, rgba(157,78,221,0.06) 0%, transparent 55%),
                   ${T.bg}`,
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 40px" }}>

        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
          style={{ marginBottom: 44, display: "flex", alignItems: "flex-end", gap: 20 }}
        >
          <span style={{ fontFamily: T.mono, fontSize: 60, fontWeight: 700, color: T.dim, lineHeight: 1 }}>03</span>
          <div>
            <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 5, color: T.neon2, marginBottom: 5 }}>FUNCTION CALLING ITSELF</div>
            <h2 style={{ fontFamily: T.display, fontSize: 38, fontWeight: 400, color: T.text, letterSpacing: 3 }}>RECURSION</h2>
          </div>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 24 }}>

          {/* Left: Stack visualizer */}
          <GlassCard style={{ padding: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 4, color: T.neon2 }}>▸ CALL STACK</div>
              <div style={{ display: "flex", gap: 8 }}>
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: `0 0 28px ${T.neon2}50` }}
                  whileTap={{ scale: 0.97 }}
                  onClick={runAnim}
                  disabled={running}
                  style={{
                    fontFamily: T.display, fontSize: 12, letterSpacing: 4,
                    color: "#000", background: running ? T.muted : `linear-gradient(135deg, ${T.neon2}, ${T.purple})`,
                    border: "none", borderRadius: 8, padding: "8px 20px", cursor: running ? "not-allowed" : "pointer",
                  }}
                >{running ? "RUNNING…" : "▶ FACTORIAL(5)"}</motion.button>
                <motion.button whileTap={{ scale: 0.95 }} onClick={reset}
                  style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, background: "transparent", border: `1px solid ${T.dim}`, borderRadius: 7, padding: "8px 12px", cursor: "pointer" }}
                >↺</motion.button>
              </div>
            </div>

            {/* Stack depth indicator */}
            <div style={{ display: "flex", gap: 4, marginBottom: 18 }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    background: stack.length > i ? stateColor(stack[stack.length - 1 - i]?.state || "call") : T.dim,
                    boxShadow: stack.length > i ? `0 0 12px ${stateColor(stack[stack.length - 1 - i]?.state || "call")}80` : "none",
                  }}
                  style={{ flex: 1, height: 5, borderRadius: 3, transition: "all 0.35s" }}
                />
              ))}
              <span style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, marginLeft: 8 }}>depth {stack.length}</span>
            </div>

            {/* Stack cards */}
            <div style={{ position: "relative", minHeight: 280, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
              <AnimatePresence>
                {stack.map((frame, i) => {
                  const color = stateColor(frame.state);
                  return (
                    <motion.div
                      key={`${frame.label}-${i}`}
                      initial={{ scale: 0.85, opacity: 0, y: -30 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      exit={{ scale: 0.85, opacity: 0, y: -24, transition: { duration: 0.35 } }}
                      transition={{ type: "spring", stiffness: 280, damping: 24 }}
                      style={{
                        padding: "12px 20px", borderRadius: 10, marginTop: 7,
                        background: `${color}18`, border: `2px solid ${color}`,
                        boxShadow: `0 0 22px ${color}40`,
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                      }}
                    >
                      <div>
                        <span style={{ fontFamily: T.mono, fontSize: 8, color, letterSpacing: 3 }}>
                          {frame.state.toUpperCase()}
                        </span>
                        <div style={{ fontFamily: T.mono, fontSize: 16, fontWeight: 700, color, marginTop: 2 }}>{frame.label}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted }}>n = {frame.n}</div>
                        {frame.result !== null && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            style={{ fontFamily: T.mono, fontSize: 18, fontWeight: 700, color: T.neon3 }}
                          >= {frame.result}</motion.div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {stack.length === 0 && !running && (
                <div style={{ fontFamily: T.mono, fontSize: 11, color: T.muted, textAlign: "center", padding: "60px 0" }}>
                  Stack empty. Press ▶ RUN.
                </div>
              )}
            </div>

            {/* Current step */}
            <AnimatePresence mode="wait">
              {currentStep && (
                <motion.div
                  key={animIdx}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  style={{
                    marginTop: 16, padding: "12px 16px", borderRadius: 9,
                    background: `${stateColor(currentStep.state)}10`,
                    border: `1px solid ${stateColor(currentStep.state)}40`,
                    fontFamily: T.mono, fontSize: 11, color: T.text, lineHeight: 1.8,
                  }}
                >
                  {currentStep.state === "call" && `Calling fact(${currentStep.n}) → pushing to stack`}
                  {currentStep.state === "base" && `Base case: fact(1) = 1 → begin unwinding`}
                  {currentStep.state === "return" && `fact(${currentStep.n}) = ${currentStep.result} → popping stack`}
                </motion.div>
              )}
            </AnimatePresence>
          </GlassCard>

          {/* Right: Code + rules */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <GlassCard style={{ overflow: "hidden" }}>
              <div style={{ padding: "9px 16px", borderBottom: `1px solid ${T.dim}`, display: "flex", gap: 6, alignItems: "center" }}>
                {["#FF5F57", "#FEBC2E", "#28C840"].map((c, i) => <div key={i} style={{ width: 9, height: 9, borderRadius: "50%", background: c }} />)}
                <span style={{ fontFamily: T.mono, fontSize: 8, color: T.muted, marginLeft: 8, letterSpacing: 2 }}>factorial.c</span>
              </div>
              <div style={{ padding: "16px 20px" }}>
                {[
                  { line: "int fact(int n) {", color: T.neon2, highlight: false },
                  { line: "  if (n <= 1)", color: T.neon3, highlight: currentStep?.state === "base" },
                  { line: "    return 1;", color: T.neon3, highlight: currentStep?.state === "base" },
                  { line: "  return n * fact(n-1);", color: T.neon, highlight: currentStep?.state === "call" },
                  { line: "}", color: T.text, highlight: false },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    animate={{ background: item.highlight ? `${item.color}18` : "transparent", borderLeftColor: item.highlight ? item.color : "transparent" }}
                    style={{ fontFamily: T.mono, fontSize: 12, lineHeight: 2.1, paddingLeft: 12, borderLeft: "3px solid", color: item.color, transition: "all 0.3s" }}
                  >
                    <span style={{ color: T.muted, marginRight: 14, fontSize: 9 }}>{i + 1}</span>
                    {item.line}
                  </motion.div>
                ))}
              </div>
            </GlassCard>

            {[
              { color: T.neon3, icon: "⊡", label: "BASE CASE", text: "n ≤ 1 → return 1\nStop condition. No base = ∞ loop." },
              { color: T.neon, icon: "↻", label: "RECURSE", text: "fact(n-1) calls itself.\nSmaller problem each time." },
              { color: T.neon4, icon: "↑", label: "UNWIND", text: "Return values bubble back.\n5 × 4 × 3 × 2 × 1 = 120" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                style={{
                  padding: "14px 18px", borderRadius: 10,
                  background: `${item.color}08`, border: `1px solid ${item.color}28`,
                  display: "flex", gap: 14, alignItems: "flex-start",
                }}
              >
                <div style={{ fontFamily: T.mono, fontSize: 20, color: item.color, lineHeight: 1, marginTop: 2 }}>{item.icon}</div>
                <div>
                  <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 4, color: item.color, marginBottom: 4 }}>{item.label}</div>
                  <div style={{ fontFamily: T.mono, fontSize: 11, color: T.text, lineHeight: 1.8, whiteSpace: "pre" }}>{item.text}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 4: STACK SIMULATOR
// ─────────────────────────────────────────────────────────────────────────────
function StackSimulator() {
  const [n, setN] = useState(4);
  const [execIdx, setExecIdx] = useState(-1);
  const [frames, setFrames] = useState([]);
  const [running, setRunning] = useState(false);
  const [infinite, setInfinite] = useState(false);
  const [output, setOutput] = useState(null);
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
    setExecIdx(-1);

    const steps = buildSteps(n);
    const stackArr = [];

    for (let i = 0; i < steps.length; i++) {
      if (!runRef.current) break;
      const s = steps[i];
      setExecIdx(i);
      if (s.phase === "call" || s.phase === "base") {
        stackArr.push({ ...s, id: i });
        setFrames([...stackArr]);
      } else {
        stackArr.pop();
        setFrames([...stackArr]);
      }
      if (i === steps.length - 1) setOutput(s.result);
      await new Promise(r => setTimeout(r, 640));
    }

    runRef.current = false;
    setRunning(false);
    setExecIdx(-1);
  };

  const runInfinite = async () => {
    if (runRef.current) return;
    runRef.current = true;
    setInfinite(true);
    setRunning(true);
    setOutput(null);
    const fakeStack = [];
    for (let i = 0; i < 9; i++) {
      if (!runRef.current) break;
      fakeStack.push({ n: 999 - i, phase: "call", result: null, id: i });
      setFrames([...fakeStack]);
      await new Promise(r => setTimeout(r, 220));
    }
    setOutput("STACK OVERFLOW! ☠");
    runRef.current = false;
    setRunning(false);
  };

  const reset = () => {
    runRef.current = false;
    setRunning(false);
    setFrames([]);
    setOutput(null);
    setExecIdx(-1);
    setInfinite(false);
  };

  const maxDepth = n + 1;

  return (
    <section id="simulator" style={{
      padding: "90px 0",
      background: `radial-gradient(ellipse 60% 50% at 50% 100%, rgba(0,200,255,0.06) 0%, transparent 60%),
                   ${T.bg1}`,
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 40px" }}>

        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
          style={{ marginBottom: 44, display: "flex", alignItems: "flex-end", gap: 20 }}
        >
          <span style={{ fontFamily: T.mono, fontSize: 60, fontWeight: 700, color: T.dim, lineHeight: 1 }}>04</span>
          <div>
            <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 5, color: T.neon4, marginBottom: 5 }}>MAKE RECURSION PREDICTABLE</div>
            <h2 style={{ fontFamily: T.display, fontSize: 38, fontWeight: 400, color: T.text, letterSpacing: 3 }}>STACK SIMULATOR</h2>
          </div>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

          {/* Left: Controls + horizontal stack bars */}
          <GlassCard style={{ padding: 28 }}>
            <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 4, color: T.neon4, marginBottom: 20 }}>▸ CONFIGURE</div>

            {/* n slider */}
            <div style={{ marginBottom: 22 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontFamily: T.mono, fontSize: 10, color: T.muted }}>factorial(n)</span>
                <motion.span key={n} animate={{ scale: [1.4, 1] }}
                  style={{ fontFamily: T.mono, fontSize: 22, fontWeight: 700, color: T.neon4 }}>{n}</motion.span>
              </div>
              <input type="range" min={1} max={8} value={n}
                onChange={e => { setN(Number(e.target.value)); reset(); }}
                style={{ width: "100%", accentColor: T.neon4 }} />
              <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, marginTop: 4 }}>
                Max depth: {n + 1} frames
              </div>
            </div>

            {/* Stack depth visual */}
            <div style={{ marginBottom: 22 }}>
              <div style={{ fontFamily: T.mono, fontSize: 8, color: T.muted, marginBottom: 10, letterSpacing: 3 }}>
                STACK DEPTH [{frames.length} / {infinite ? "∞" : maxDepth}]
              </div>
              <div style={{ display: "flex", gap: 3 }}>
                {Array.from({ length: infinite ? 9 : maxDepth }).map((_, i) => {
                  const filled = i < frames.length;
                  const isDanger = infinite && filled;
                  return (
                    <motion.div
                      key={i}
                      animate={{
                        background: isDanger ? T.neon2 : filled ? T.neon4 : T.dim,
                        boxShadow: isDanger ? `0 0 14px ${T.neon2}` : filled ? `0 0 8px ${T.neon4}60` : "none",
                      }}
                      style={{ flex: 1, height: 32, borderRadius: 5, transition: "all 0.3s" }}
                    />
                  );
                })}
              </div>
            </div>

            {/* Buttons */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
              <motion.button
                whileHover={{ scale: 1.04, boxShadow: `0 0 30px ${T.neon4}50` }}
                whileTap={{ scale: 0.97 }}
                onClick={runSim}
                disabled={running}
                style={{
                  flex: 2, fontFamily: T.display, fontSize: 13, letterSpacing: 4,
                  color: "#000", background: running ? T.muted : `linear-gradient(135deg, ${T.neon4}, ${T.neon})`,
                  border: "none", borderRadius: 8, padding: "12px", cursor: running ? "not-allowed" : "pointer",
                }}
              >{running ? "RUNNING…" : `▶ RUN fact(${n})`}</motion.button>
              <motion.button
                whileHover={{ scale: 1.04, boxShadow: `0 0 25px ${T.neon2}50` }}
                whileTap={{ scale: 0.97 }}
                onClick={runInfinite}
                disabled={running}
                style={{
                  flex: 1, fontFamily: T.display, fontSize: 11, letterSpacing: 3,
                  color: "#000", background: running ? T.muted : `linear-gradient(135deg, ${T.neon2}, #FF0055)`,
                  border: "none", borderRadius: 8, padding: "12px", cursor: running ? "not-allowed" : "pointer",
                }}
              >☠ INFINITE</motion.button>
              <motion.button whileTap={{ scale: 0.95 }} onClick={reset}
                style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, background: "transparent", border: `1px solid ${T.dim}`, borderRadius: 8, padding: "12px 14px", cursor: "pointer" }}
              >↺</motion.button>
            </div>

            {/* Output */}
            <AnimatePresence mode="wait">
              {output && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  style={{
                    padding: "16px 20px", borderRadius: 11, textAlign: "center",
                    background: infinite ? `${T.neon2}18` : `${T.neon3}14`,
                    border: `2px solid ${infinite ? T.neon2 : T.neon3}`,
                    boxShadow: `0 0 30px ${infinite ? T.neon2 : T.neon3}50`,
                    fontFamily: T.display, fontSize: 26, letterSpacing: 5,
                    color: infinite ? T.neon2 : T.neon3,
                  }}
                >{infinite ? output : `= ${output}`}</motion.div>
              )}
            </AnimatePresence>
          </GlassCard>

          {/* Right: Live stack cards */}
          <GlassCard style={{ padding: 24, overflow: "hidden" }}>
            <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 4, color: T.neon4, marginBottom: 16 }}>▸ LIVE STACK (top = newest)</div>

            <div style={{ display: "flex", flexDirection: "column-reverse", gap: 6, minHeight: 300 }}>
              <AnimatePresence>
                {frames.map((frame, i) => {
                  const isTop = i === frames.length - 1;
                  const color = frame.phase === "base" ? T.neon3 : frame.phase === "return" ? T.neon4 : (infinite ? T.neon2 : T.neon);
                  return (
                    <motion.div
                      key={frame.id}
                      layout
                      initial={{ opacity: 0, y: -20, scale: 0.92 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 20, scale: 0.88, transition: { duration: 0.3 } }}
                      transition={{ type: "spring", stiffness: 300, damping: 26 }}
                      style={{
                        padding: "10px 16px", borderRadius: 9,
                        background: isTop ? `${color}22` : `${color}0A`,
                        border: `${isTop ? "2px" : "1px"} solid ${isTop ? color : `${color}40`}`,
                        boxShadow: isTop ? `0 0 25px ${color}50` : "none",
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                      }}
                    >
                      <span style={{ fontFamily: T.mono, fontSize: 14, fontWeight: 700, color }}>{frame.n < 999 ? `fact(${frame.n})` : `fact(∞)`}</span>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontFamily: T.mono, fontSize: 8, color: T.muted, letterSpacing: 2 }}>{frame.phase.toUpperCase()}</div>
                        {frame.result !== null && (
                          <div style={{ fontFamily: T.mono, fontSize: 14, fontWeight: 700, color: T.neon3 }}>→ {frame.result}</div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {frames.length === 0 && (
                <div style={{ fontFamily: T.mono, fontSize: 11, color: T.muted, textAlign: "center", paddingTop: 80 }}>
                  Press ▶ RUN to fill stack
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 5: COMBINED — LINKED LIST TRAVERSAL
// ─────────────────────────────────────────────────────────────────────────────
const NODES = [
  { id: 0, val: 10, next: 1, addr: "0xA100" },
  { id: 1, val: 25, next: 2, addr: "0xA200" },
  { id: 2, val: 37, next: 3, addr: "0xA300" },
  { id: 3, val: 42, next: 4, addr: "0xA400" },
  { id: 4, val: 58, next: null, addr: "0xA500" },
];

function CombinedSection() {
  const [activeNode, setActiveNode] = useState(-1);
  const [stack, setStack] = useState([]);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const runRef = useRef(false);

  const runTraversal = async () => {
    if (runRef.current) return;
    runRef.current = true;
    setRunning(true);
    setStack([]);
    setDone(false);
    setActiveNode(-1);

    // Simulate recursive traversal: visit all nodes, then unwind
    for (let i = 0; i < NODES.length; i++) {
      if (!runRef.current) break;
      setActiveNode(i);
      setStack(prev => [...prev, { ...NODES[i], phase: "visit" }]);
      await new Promise(r => setTimeout(r, 750));
    }

    // Base case (NULL reached)
    await new Promise(r => setTimeout(r, 500));

    // Unwind
    for (let i = NODES.length - 1; i >= 0; i--) {
      if (!runRef.current) break;
      setActiveNode(i);
      setStack(prev => prev.filter((_, idx) => idx < i + 1));
      await new Promise(r => setTimeout(r, 600));
    }

    setActiveNode(-1);
    setDone(true);
    runRef.current = false;
    setRunning(false);
  };

  const reset = () => {
    runRef.current = false;
    setRunning(false);
    setActiveNode(-1);
    setStack([]);
    setDone(false);
  };

  return (
    <section id="combined" style={{
      padding: "90px 0 120px",
      background: `radial-gradient(ellipse 80% 60% at 50% 20%, rgba(157,78,221,0.08) 0%, transparent 55%),
                   radial-gradient(ellipse 60% 40% at 10% 80%, rgba(0,200,255,0.05) 0%, transparent 55%),
                   ${T.bg}`,
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 40px" }}>

        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
          style={{ marginBottom: 44, display: "flex", alignItems: "flex-end", gap: 20 }}
        >
          <span style={{ fontFamily: T.mono, fontSize: 60, fontWeight: 700, color: T.dim, lineHeight: 1 }}>05</span>
          <div>
            <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 5, color: T.purple, marginBottom: 5 }}>POINTERS + RECURSION</div>
            <h2 style={{ fontFamily: T.display, fontSize: 38, fontWeight: 400, color: T.text, letterSpacing: 3 }}>LINKED LIST TRAVERSAL</h2>
          </div>
        </motion.div>

        {/* Linked list visual */}
        <GlassCard style={{ padding: 30, marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 4, color: T.purple }}>▸ NODE CHAIN</div>
            <div style={{ display: "flex", gap: 8 }}>
              <motion.button
                whileHover={{ scale: 1.04, boxShadow: `0 0 28px ${T.purple}50` }}
                whileTap={{ scale: 0.97 }}
                onClick={runTraversal}
                disabled={running}
                style={{
                  fontFamily: T.display, fontSize: 13, letterSpacing: 4,
                  color: "#000", background: running ? T.muted : `linear-gradient(135deg, ${T.purple}, ${T.neon})`,
                  border: "none", borderRadius: 8, padding: "9px 22px", cursor: running ? "not-allowed" : "pointer",
                }}
              >{running ? "TRAVERSING…" : "▶ TRAVERSE"}</motion.button>
              <motion.button whileTap={{ scale: 0.95 }} onClick={reset}
                style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, background: "transparent", border: `1px solid ${T.dim}`, borderRadius: 7, padding: "9px 14px", cursor: "pointer" }}
              >↺</motion.button>
            </div>
          </div>

          {/* Nodes row */}
          <div style={{ display: "flex", alignItems: "center", gap: 0, overflowX: "auto", paddingBottom: 8 }}>
            {NODES.map((node, i) => {
              const isActive = activeNode === i;
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
                  <motion.div
                    animate={{
                      borderColor: isActive ? T.purple : `${T.neon}25`,
                      background: isActive ? `${T.purple}22` : `${T.neon}06`,
                      boxShadow: isActive ? `0 0 35px ${T.purple}70` : "none",
                      scale: isActive ? 1.08 : 1,
                    }}
                    transition={{ type: "spring", stiffness: 280, damping: 24 }}
                    style={{ width: 110, borderRadius: 12, border: "2px solid", padding: "14px 12px" }}
                  >
                    <div style={{ fontFamily: T.mono, fontSize: 8, color: T.muted, marginBottom: 4 }}>{node.addr}</div>
                    <div style={{ fontFamily: T.mono, fontSize: 22, fontWeight: 700, color: isActive ? T.purple : T.neon, marginBottom: 6, textAlign: "center" }}>{node.val}</div>
                    <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, textAlign: "center" }}>
                      next → {node.next !== null ? NODES[node.next].addr : "NULL"}
                    </div>
                  </motion.div>

                  {node.next !== null && (
                    <motion.div
                      animate={{ opacity: activeNode >= i ? 1 : 0.25, color: activeNode === i ? T.purple : T.muted }}
                      style={{ padding: "0 6px", fontFamily: T.mono, fontSize: 22, color: T.muted, transition: "all 0.4s" }}
                    >→</motion.div>
                  )}
                  {node.next === null && (
                    <div style={{ padding: "0 8px", fontFamily: T.mono, fontSize: 10, color: T.neon2 }}>NULL</div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Pointer indicator */}
          <AnimatePresence>
            {activeNode >= 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{ marginTop: 16, fontFamily: T.mono, fontSize: 11, color: T.text, lineHeight: 1.8 }}
              >
                <span style={{ color: T.purple }}>curr</span> → <AddressTag addr={NODES[activeNode].addr} color={T.purple} /> → value = <strong style={{ color: T.neon3 }}>{NODES[activeNode].val}</strong>
                <span style={{ color: T.muted, marginLeft: 16 }}>stack depth: {stack.length}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {done && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                marginTop: 14, padding: "12px 20px", borderRadius: 9,
                background: `${T.neon3}12`, border: `1px solid ${T.neon3}50`,
                fontFamily: T.mono, fontSize: 13, color: T.neon3, textAlign: "center",
              }}
            >
              ✓ Traversal complete — all {NODES.length} nodes visited
            </motion.div>
          )}
        </GlassCard>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

          {/* Stack during traversal */}
          <GlassCard style={{ padding: 22, overflow: "hidden" }}>
            <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 4, color: T.purple, marginBottom: 14 }}>▸ CALL STACK</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5, minHeight: 180 }}>
              <AnimatePresence>
                {stack.map((frame, i) => (
                  <motion.div
                    key={`${frame.id}-${i}`}
                    initial={{ opacity: 0, x: -12, scale: 0.94 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 12, scale: 0.94, transition: { duration: 0.25 } }}
                    style={{
                      padding: "9px 14px", borderRadius: 8,
                      background: `${T.purple}12`, border: `1px solid ${T.purple}40`,
                      display: "flex", justifyContent: "space-between",
                    }}
                  >
                    <span style={{ fontFamily: T.mono, fontSize: 12, color: T.purple }}>print({frame.val})</span>
                    <span style={{ fontFamily: T.mono, fontSize: 10, color: T.muted }}>{frame.addr}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
              {stack.length === 0 && (
                <div style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, textAlign: "center", paddingTop: 50 }}>Stack builds as we traverse…</div>
              )}
            </div>
          </GlassCard>

          {/* Code */}
          <GlassCard style={{ overflow: "hidden" }}>
            <div style={{ padding: "9px 16px", borderBottom: `1px solid ${T.dim}`, display: "flex", gap: 6, alignItems: "center" }}>
              {["#FF5F57", "#FEBC2E", "#28C840"].map((c, i) => <div key={i} style={{ width: 9, height: 9, borderRadius: "50%", background: c }} />)}
              <span style={{ fontFamily: T.mono, fontSize: 8, color: T.muted, marginLeft: 8, letterSpacing: 2 }}>traverse.c</span>
            </div>
            <div style={{ padding: "16px 20px" }}>
              {[
                { line: "struct Node {", color: T.purple, active: false },
                { line: "  int val;", color: T.text, active: false },
                { line: "  struct Node *next; // ptr", color: T.neon, active: running && activeNode >= 0 },
                { line: "};", color: T.purple, active: false },
                { line: "", color: T.text, active: false },
                { line: "void traverse(Node *curr) {", color: T.neon4, active: false },
                { line: "  if (!curr) return;  //base", color: T.neon3, active: running && activeNode < 0 },
                { line: "  printf(\"%d\", curr->val);", color: T.neon2, active: running && activeNode >= 0 },
                { line: "  traverse(curr->next);", color: T.neon, active: running && activeNode >= 0 },
                { line: "}", color: T.purple, active: false },
              ].map((item, i) => (
                <motion.div key={i}
                  animate={{ background: item.active ? `${item.color}14` : "transparent", borderLeftColor: item.active ? item.color : "transparent" }}
                  style={{ fontFamily: T.mono, fontSize: 11, lineHeight: 2, paddingLeft: 10, borderLeft: "3px solid", color: item.color, transition: "all 0.3s" }}
                >
                  {item.line !== "" && <span style={{ color: T.muted, marginRight: 12, fontSize: 9 }}>{i + 1}</span>}
                  {item.line}
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NAVIGATION BAR
// ─────────────────────────────────────────────────────────────────────────────
function NavBar({ active }) {
  const sections = [
    { id: "hero", label: "MEMORY", num: "01" },
    { id: "playground", label: "PTRS", num: "02" },
    { id: "recursion", label: "RECUR", num: "03" },
    { id: "simulator", label: "STACK", num: "04" },
    { id: "combined", label: "COMBO", num: "05" },
  ];

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.7 }}
      style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 40px",
        background: "rgba(3,5,10,0.88)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderBottom: `1px solid ${T.dim}`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <motion.div
          animate={{ boxShadow: [`0 0 8px ${T.neon}60`, `0 0 20px ${T.neon}90`, `0 0 8px ${T.neon}60`] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ width: 8, height: 8, borderRadius: "50%", background: T.neon }}
        />
        <span style={{ fontFamily: T.display, fontSize: 16, letterSpacing: 4, color: T.neon }}>C · CH.6</span>
      </div>

      <div style={{ display: "flex", gap: 4 }}>
        {sections.map(sec => (
          <motion.button
            key={sec.id}
            whileHover={{ color: T.neon }}
            onClick={() => scrollTo(sec.id)}
            style={{
              fontFamily: T.mono, fontSize: 9, letterSpacing: 2,
              color: active === sec.id ? T.neon : T.muted,
              background: active === sec.id ? `${T.neon}10` : "transparent",
              border: active === sec.id ? `1px solid ${T.neon}40` : "1px solid transparent",
              borderRadius: 5, padding: "5px 12px", cursor: "pointer",
              transition: "all 0.2s",
            }}
          ><span style={{ opacity: 0.4, marginRight: 4 }}>{sec.num}</span>{sec.label}</motion.button>
        ))}
      </div>

      <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, letterSpacing: 2 }}>
        PTR + RECURSION
      </div>
    </motion.nav>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FOOTER WITH PREV/NEXT NAV
// ─────────────────────────────────────────────────────────────────────────────
function Footer() {
  const router = useRouter();

  return (
    <footer style={{
      padding: "60px 40px",
      background: T.bg1,
      borderTop: `1px solid ${T.dim}`,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      maxWidth: "100%",
    }}>
      <div>
        <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 4, color: T.muted, marginBottom: 6 }}>YOU LEARNED</div>
        <div style={{ fontFamily: T.display, fontSize: 28, letterSpacing: 4, color: T.text }}>POINTERS + RECURSION</div>
        <div style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, marginTop: 4 }}>C · Chapter 6 · Complete</div>
      </div>

      <div style={{ display: "flex", gap: 14 }}>
        <motion.button
          whileHover={{ scale: 1.05, boxShadow: `0 0 40px ${T.neon}50`, borderColor: `${T.neon}70` }}
          whileTap={{ scale: 0.96 }}
          onClick={() => router.push("/c-5")}
          style={{
            fontFamily: T.display, fontSize: 14, letterSpacing: 5,
            color: T.neon, background: "transparent",
            border: `1px solid ${T.neon}35`, borderRadius: 10,
            padding: "16px 36px", cursor: "pointer",
            backdropFilter: "blur(12px)",
            boxShadow: `inset 0 1px 0 rgba(0,200,255,0.08)`,
          }}
        >← PREV: C5</motion.button>

        <motion.button
          whileHover={{ scale: 1.05, boxShadow: `0 0 50px ${T.neon}70` }}
          whileTap={{ scale: 0.96 }}
          onClick={() => router.push("/c-7")}
          style={{
            fontFamily: T.display, fontSize: 14, letterSpacing: 5,
            color: "#000", background: `linear-gradient(135deg, ${T.neon}, ${T.purple})`,
            border: "none", borderRadius: 10, padding: "16px 40px", cursor: "pointer",
          }}
        >NEXT: C7 →</motion.button>
      </div>
    </footer>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ROOT PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function C6Page() {
  const [activeSection, setActiveSection] = useState("hero");

  useEffect(() => {
    const sections = ["hero", "playground", "recursion", "simulator", "combined"];
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setActiveSection(e.target.id); }),
      { threshold: 0.25, rootMargin: "-5% 0px -5% 0px" }
    );
    sections.forEach(id => { const el = document.getElementById(id); if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Fira+Code:wght@300;400;500;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: ${T.bg}; color: ${T.text}; overflow-x: hidden; font-family: ${T.sans}; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: ${T.bg}; }
        ::-webkit-scrollbar-thumb { background: ${T.neon}; border-radius: 2px; }
        input[type=range] { height: 4px; cursor: pointer; -webkit-appearance: none; appearance: none; background: ${T.dim}; border-radius: 2px; outline: none; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 14px; height: 14px; border-radius: 50%; background: ${T.neon}; cursor: pointer; box-shadow: 0 0 10px ${T.neon}70; }
        input[type=number] { -moz-appearance: textfield; }
        input[type=number]::-webkit-outer-spin-button, input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
        button { outline: none; }
        a { text-decoration: none; }
        section { will-change: transform; }
      `}</style>

      <NavBar active={activeSection} />

      <main style={{ paddingTop: 56 }}>
        <HeroSection />
        <PointerPlayground />
        <RecursionIntro />
        <StackSimulator />
        <CombinedSection />
      </main>

      <Footer />
    </>
  );
}