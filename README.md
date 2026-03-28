// "use client";

// import { useEffect, useRef, useState, useCallback } from "react";
// import { useRouter } from "next/navigation";
// import gsap from "gsap";
// import { ScrollTrigger } from "gsap/ScrollTrigger";

// if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

// const FONT_LINK = `
//   @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Chakra+Petch:wght@400;600;700&family=Orbitron:wght@400;600;700;900&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap');
// `;

// const F = {
//   display: "'Bebas Neue', sans-serif",
//   crazy: "'Chakra Petch', monospace",
//   hud: "'Orbitron', monospace",
//   mono: "'Space Mono', monospace",
// };

// const BOOT_NORMAL = [
//   { t: "Network: eth0 10.0.4.22/24  gw 10.0.4.1", c: "dim" },
//   { t: "  -> C_PROGRAM ............ [DECRYPTED]  1.2ms", c: "ok" },
//   { t: "  -> PYTHON_CORE ....... [DECRYPTED]  0.8ms", c: "ok" },
//   { t: "  -> JAVA_RUNTIME ...... [DECRYPTED]  1.1ms", c: "ok" },
//   { t: "Initialising VisuoSlayer security layer: [ OK ]", c: "ok" },
// ];
// const BOOT_ERROR = [
//   { t: "!! CRITICAL: Memory fault at 0x7FFE2C4A — ECC correction failed. SYSTEM HALT.", c: "err" },
// ];
// const BOOT_RECOVERY = [{ t: "SELECT YOUR TARGET LANGUAGE", c: "hd" }];
// const safeLine = l => ({ c: "dim", ...l });

// const LANGUAGES = [
//   {
//     id: "c", label: "C", index: "01", tag: "EVIDENCE_01",
//     tagline: "Systems & Speed",
//     desc: "The foundation of modern computing. Raw, fast, impossibly close to the metal.",
//     meta: ["Compiled", "Low-Level", "1972"],
//     accent: "#00f7ff", route: "/c-1",
//     features: ["Memory Management", "Pointer Arithmetic", "OS Development"],
//   },
//   {
//     id: "python", label: "PYTHON", index: "02", tag: "EVIDENCE_02",
//     tagline: "Readability & Versatility",
//     desc: "Clean syntax, massive ecosystem. From scripts to neural networks effortlessly.",
//     meta: ["Interpreted", "High-Level", "1991"],
//     accent: "#ffb347", route: "/p-1",
//     features: ["Data Science", "Automation", "Web Backend"],
//   },
//   {
//     id: "java", label: "JAVA", index: "03", tag: "EVIDENCE_03",
//     tagline: "Enterprise & Stability",
//     desc: "Write once, run anywhere. The backbone of enterprise software for three decades.",
//     meta: ["Compiled+VM", "OOP", "1995"],
//     accent: "#ff3366", route: "/j-1",
//     features: ["Android Dev", "Enterprise Apps", "Cross-Platform"],
//   },
// ];

// const TICKER_ITEMS = [
//   "VISUOSLAYER", "LANG FILES", "CASE #2026", "CLEARANCE ALPHA",
//   "SAIF // OPERATOR", "3 FILES FOUND", "DECRYPTION READY", "ANALYST: BEGINNER",
// ];
// const GLITCH_CHARS = "!<>-_\\/[]{}=+*^?#@$%&";

// // ─── HOOK: GLITCH TEXT ────────────────────────────────────────────────────────
// function useGlitch(text, active) {
//   const [display, setDisplay] = useState(text);
//   useEffect(() => {
//     if (!active) { setDisplay(text); return; }
//     let i = 0;
//     const iv = setInterval(() => {
//       setDisplay(text.split("").map((c, j) =>
//         j < i ? c : c === " " ? " " : GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]
//       ).join(""));
//       i += 0.5;
//       if (i >= text.length) { setDisplay(text); clearInterval(iv); }
//     }, 28);
//     return () => clearInterval(iv);
//   }, [active, text]);
//   return display;
// }

// // ─── CINEMATIC SECTION WRAPPER ────────────────────────────────────────────────
// function CinematicSection({ children, id, enterFX = "surge", exitFX = "dissolve", enterStart = "top 85%", exitStart = "bottom 20%" }) {
//   const sectionRef = useRef(null);

//   useEffect(() => {
//     const el = sectionRef.current;
//     if (!el) return;

//     const enterAnimations = {
//       surge: () => {
//         gsap.set(el, { y: 160, opacity: 0, filter: "blur(30px) brightness(0.1) saturate(0)", skewY: 5, scale: 0.94 });
//         return gsap.timeline({ paused: true })
//           .to(el, { y: -8, opacity: 1, filter: "blur(0px) brightness(1.4) saturate(1)", skewY: -1, scale: 1.01, duration: 0.9, ease: "expo.out" })
//           .to(el, { y: 0, filter: "blur(0px) brightness(1) saturate(1)", skewY: 0, scale: 1, duration: 0.5, ease: "elastic.out(1.2,0.5)" });
//       },
//       "glitch-slam": () => {
//         gsap.set(el, { opacity: 0, x: -120, skewX: 18, filter: "blur(24px) saturate(0) contrast(3) hue-rotate(180deg)" });
//         return gsap.timeline({ paused: true })
//           .to(el, { opacity: 1, x: 28, skewX: -6, filter: "blur(6px) saturate(0.3) contrast(1.8) hue-rotate(90deg)", duration: 0.2, ease: "power4.out" })
//           .to(el, { x: -12, skewX: 3, filter: "blur(3px) saturate(0.6) contrast(1.3) hue-rotate(30deg)", duration: 0.1 })
//           .to(el, { x: 6, skewX: -1.5, filter: "blur(1px) saturate(0.85) contrast(1.1) hue-rotate(10deg)", duration: 0.1 })
//           .to(el, { x: 0, skewX: 0, filter: "blur(0px) saturate(1) contrast(1) hue-rotate(0deg)", duration: 0.3, ease: "expo.out" });
//       },
//       "iris-open": () => {
//         gsap.set(el, { scale: 0.7, opacity: 0, filter: "blur(40px) saturate(0) brightness(0)", transformOrigin: "center", rotationX: 20, transformPerspective: 800 });
//         return gsap.timeline({ paused: true })
//           .to(el, { scale: 1.06, opacity: 0.7, filter: "blur(16px) saturate(0.5) brightness(1.2)", rotationX: -3, duration: 0.6, ease: "expo.out" })
//           .to(el, { scale: 1, opacity: 1, filter: "blur(0px) saturate(1) brightness(1)", rotationX: 0, duration: 0.7, ease: "expo.out" });
//       },
//       "light-sweep": () => {
//         gsap.set(el, { opacity: 0, y: 80, clipPath: "inset(0 0 100% 0 round 2px)" });
//         return gsap.timeline({ paused: true })
//           .to(el, { clipPath: "inset(0 0 0% 0 round 2px)", y: 0, opacity: 1, duration: 0.9, ease: "expo.inOut" });
//       },
//       "scanline-wipe": () => {
//         gsap.set(el, { opacity: 0, clipPath: "inset(50% 0 50% 0)", filter: "blur(18px) brightness(3) saturate(0)" });
//         return gsap.timeline({ paused: true })
//           .to(el, { clipPath: "inset(0% 0 0% 0)", filter: "blur(0px) brightness(1) saturate(1)", opacity: 1, duration: 1.0, ease: "expo.out" });
//       },
//       "shatter-in": () => {
//         gsap.set(el, { opacity: 0, scale: 1.15, rotationX: 22, filter: "blur(28px) brightness(3) saturate(0)", transformPerspective: 1000, transformOrigin: "center top" });
//         return gsap.timeline({ paused: true })
//           .to(el, { scale: 0.96, rotationX: -3, opacity: 1, filter: "blur(4px) brightness(1.5) saturate(0.5)", duration: 0.45, ease: "power4.out" })
//           .to(el, { scale: 1.02, rotationX: 1.5, filter: "blur(1.5px) brightness(1.1) saturate(0.85)", duration: 0.22, ease: "power2.inOut" })
//           .to(el, { scale: 1, rotationX: 0, filter: "blur(0px) brightness(1) saturate(1)", duration: 0.4, ease: "expo.out" });
//       },
//       "data-stream": () => {
//         gsap.set(el, { opacity: 0, y: 60, filter: "blur(0px) brightness(4) saturate(0)", clipPath: "inset(0 100% 0 0 round 2px)" });
//         return gsap.timeline({ paused: true })
//           .to(el, { clipPath: "inset(0 0% 0 0 round 2px)", duration: 0.85, ease: "expo.inOut" })
//           .to(el, { opacity: 1, y: 0, filter: "blur(0px) brightness(1) saturate(1)", duration: 0.7, ease: "expo.out" }, "-=0.6");
//       },
//       "vhs-glitch": () => {
//         gsap.set(el, { opacity: 0, scaleY: 0.05, filter: "blur(20px) contrast(8) saturate(0) brightness(5)", transformOrigin: "center" });
//         return gsap.timeline({ paused: true })
//           .to(el, { scaleY: 1.08, opacity: 1, filter: "blur(8px) contrast(2) saturate(0.3) brightness(2)", duration: 0.35, ease: "power4.out" })
//           .to(el, { scaleY: 0.97, filter: "blur(3px) contrast(1.3) saturate(0.7) brightness(1.2)", duration: 0.15 })
//           .to(el, { scaleY: 1, filter: "blur(0px) contrast(1) saturate(1) brightness(1)", duration: 0.35, ease: "expo.out" });
//       },
//     };

//     const exitAnimations = {
//       dissolve: () => gsap.timeline({ paused: true })
//         .to(el, { opacity: 0, y: -100, filter: "blur(32px) brightness(3) saturate(0)", scale: 1.08, duration: 1.1, ease: "expo.in" }),

//       "shatter-apart": () => gsap.timeline({ paused: true })
//         .to(el, { skewY: 6, scaleX: 1.03, filter: "blur(3px) contrast(2) brightness(1.5)", duration: 0.2, ease: "power3.in" })
//         .to(el, { y: -140, opacity: 0, skewY: -5, scaleX: 0.97, scale: 0.9, filter: "blur(28px) brightness(3) saturate(0)", duration: 0.7, ease: "expo.in" }),

//       "static-burst": () => gsap.timeline({ paused: true })
//         .to(el, { filter: "blur(0px) contrast(5) saturate(0) brightness(6)", duration: 0.12 })
//         .to(el, { filter: "blur(40px) contrast(1) saturate(0) brightness(0)", opacity: 0, y: -80, scale: 1.05, duration: 0.6, ease: "power4.in" }),

//       implode: () => gsap.timeline({ paused: true })
//         .to(el, { scale: 0.82, filter: "blur(36px) brightness(0) saturate(0)", opacity: 0, duration: 0.9, ease: "expo.in", transformOrigin: "center" }),

//       "slide-left": () => gsap.timeline({ paused: true })
//         .to(el, { x: -200, opacity: 0, filter: "blur(24px) saturate(0) brightness(2)", skewX: -8, duration: 0.85, ease: "expo.in" }),

//       "fold-up": () => gsap.timeline({ paused: true })
//         .to(el, { rotationX: 45, y: -120, opacity: 0, filter: "blur(22px) brightness(2)", transformPerspective: 1000, transformOrigin: "center bottom", scale: 0.9, duration: 0.9, ease: "expo.in" }),

//       "glitch-out": () => gsap.timeline({ paused: true })
//         .to(el, { x: 30, skewX: 8, filter: "blur(6px) contrast(3) saturate(0) hue-rotate(90deg)", duration: 0.1 })
//         .to(el, { x: -45, skewX: -12, filter: "blur(12px) contrast(5) saturate(0) brightness(3) hue-rotate(180deg)", duration: 0.12 })
//         .to(el, { x: 15, opacity: 0.3, filter: "blur(32px) saturate(0) brightness(0)", duration: 0.3, ease: "expo.in" }),

//       "scan-erase": () => gsap.timeline({ paused: true })
//         .to(el, { clipPath: "inset(0 100% 0 0 round 2px)", filter: "blur(8px) brightness(3)", opacity: 0, duration: 0.8, ease: "expo.inOut" }),

//       "vhs-collapse": () => gsap.timeline({ paused: true })
//         .to(el, { scaleY: 1.05, filter: "blur(4px) contrast(2) brightness(2)", duration: 0.15, ease: "power2.in" })
//         .to(el, { scaleY: 0.02, opacity: 0, filter: "blur(20px) brightness(5) saturate(0)", transformOrigin: "center", duration: 0.55, ease: "power4.in" }),
//     };

//     const enterTL = (enterAnimations[enterFX] || enterAnimations.surge)();
//     const exitTL = (exitAnimations[exitFX] || exitAnimations.dissolve)();

//     const stEnter = ScrollTrigger.create({
//       trigger: el,
//       start: enterStart,
//       onEnter: () => enterTL.restart(),
//       onEnterBack: () => { exitTL.progress(0).pause(); enterTL.restart(); },
//     });

//     const stExit = ScrollTrigger.create({
//       trigger: el,
//       start: exitStart,
//       end: "bottom top",
//       onLeave: () => exitTL.restart(),
//       onLeaveBack: () => { exitTL.progress(0).pause(); },
//     });

//     return () => { stEnter.kill(); stExit.kill(); };
//   }, [enterFX, exitFX, enterStart, exitStart]);

//   return (
//     <div ref={sectionRef} id={id} style={{ position: "relative", willChange: "transform, opacity, filter" }}>
//       {children}
//     </div>
//   );
// }

// // ─── CURSOR ──────────────────────────────────────────────────────────────────
// function Cursor() {
//   const dot = useRef(null);
//   const ring = useRef(null);
//   const trail = useRef(null);
//   const mp = useRef({ x: -200, y: -200 });
//   const rp = useRef({ x: -200, y: -200 });
//   const tp = useRef({ x: -200, y: -200 });
//   const raf = useRef(null);
//   const big = useRef(false);
//   const sp = useRef(0);

//   useEffect(() => {
//     const mv = e => {
//       mp.current = { x: e.clientX, y: e.clientY };
//       big.current = !!document.elementFromPoint(e.clientX, e.clientY)?.closest("[data-cur]");
//     };
//     window.addEventListener("mousemove", mv);
//     const upd = () => {
//       const h = document.documentElement.scrollHeight - window.innerHeight;
//       if (h > 0) sp.current = window.scrollY / h;
//     };
//     window.addEventListener("scroll", upd); upd();
//     const loop = () => {
//       rp.current.x += (mp.current.x - rp.current.x) * 0.09;
//       rp.current.y += (mp.current.y - rp.current.y) * 0.09;
//       tp.current.x += (rp.current.x - tp.current.x) * 0.05;
//       tp.current.y += (rp.current.y - tp.current.y) * 0.05;
//       const sz = big.current ? 34 : 20;
//       const hue = 180 + sp.current * 180;
//       if (dot.current) dot.current.style.transform = `translate(${mp.current.x - 4}px,${mp.current.y - 4}px)`;
//       if (ring.current) {
//         ring.current.style.transform = `translate(${rp.current.x - sz}px,${rp.current.y - sz}px)`;
//         ring.current.style.width = ring.current.style.height = `${sz * 2}px`;
//         ring.current.style.borderColor = `hsla(${hue},100%,65%,0.6)`;
//       }
//       if (trail.current) trail.current.style.transform = `translate(${tp.current.x - 12}px,${tp.current.y - 12}px)`;
//       raf.current = requestAnimationFrame(loop);
//     };
//     raf.current = requestAnimationFrame(loop);
//     return () => { window.removeEventListener("mousemove", mv); window.removeEventListener("scroll", upd); cancelAnimationFrame(raf.current); };
//   }, []);

//   return (
//     <>
//       <div ref={dot} style={{ position: "fixed", top: 0, left: 0, zIndex: 99999, pointerEvents: "none", width: 8, height: 8, borderRadius: "50%", background: "#00f7ff", boxShadow: "0 0 12px #00f7ff", willChange: "transform" }} />
//       <div ref={ring} style={{ position: "fixed", top: 0, left: 0, zIndex: 99998, pointerEvents: "none", width: 40, height: 40, borderRadius: "50%", border: "1px solid rgba(0,247,255,0.6)", willChange: "transform", transition: "width .38s cubic-bezier(.34,1.56,.64,1),height .38s cubic-bezier(.34,1.56,.64,1),border-color .2s" }} />
//       <div ref={trail} style={{ position: "fixed", top: 0, left: 0, zIndex: 99997, pointerEvents: "none", width: 24, height: 24, borderRadius: "50%", background: "radial-gradient(circle,rgba(0,247,255,0.2) 0%,rgba(0,247,255,0) 70%)", willChange: "transform", filter: "blur(4px)" }} />
//     </>
//   );
// }

// // ─── BOOT ─────────────────────────────────────────────────────────────────────
// function Boot({ onDone }) {
//   const [lines, setLines] = useState([]);
//   const [pct, setPct] = useState(0);
//   const [isErr, setIsErr] = useState(false);
//   const [frozen, setFrozen] = useState(false);
//   const [exiting, setExiting] = useState(false);
//   const termRef = useRef(null);
//   const bodyRef = useRef(null);
//   const doneRef = useRef(onDone);
//   useEffect(() => { doneRef.current = onDone; }, [onDone]);

//   useEffect(() => {
//     if (termRef.current) gsap.from(termRef.current, { y: 36, opacity: 0, duration: .9, ease: "power3.out", delay: .3 });
//     let tid;
//     const scroll = () => { if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight; };
//     let ni = 0;
//     const normalTick = () => {
//       if (ni >= BOOT_NORMAL.length) { tid = setTimeout(startError, 300); return; }
//       setLines(l => [...l, safeLine(BOOT_NORMAL[ni])]);
//       setPct(Math.round(((ni + 1) / BOOT_NORMAL.length) * 88));
//       scroll(); ni++;
//       tid = setTimeout(normalTick, 500);
//     };
//     const startError = () => {
//       setIsErr(true);
//       if (termRef.current) {
//         gsap.timeline()
//           .to(termRef.current, { x: -9, duration: .04 }).to(termRef.current, { x: 8, duration: .04 })
//           .to(termRef.current, { x: -6, duration: .04 }).to(termRef.current, { x: 5, duration: .04 })
//           .to(termRef.current, { x: -3, duration: .04 }).to(termRef.current, { x: 0, duration: .04 });
//       }
//       setLines(l => [...l, safeLine(BOOT_ERROR[0])]);
//       setPct(88); scroll(); setFrozen(true);
//       tid = setTimeout(startRecovery, 1600);
//     };
//     const startRecovery = () => {
//       setFrozen(false);
//       let ri = 0;
//       const recTick = () => {
//         if (ri >= BOOT_RECOVERY.length) {
//           const start = performance.now();
//           const animPct = ts => {
//             const t = Math.min((ts - start) / 1300, 1);
//             setPct(Math.round(88 + t * 12));
//             if (t < 1) requestAnimationFrame(animPct);
//             else { tid = setTimeout(() => { setExiting(true); setTimeout(() => doneRef.current?.(), 900); }, 500); }
//           };
//           requestAnimationFrame(animPct); return;
//         }
//         setLines(l => [...l, safeLine(BOOT_RECOVERY[ri])]);
//         scroll(); ri++;
//         tid = setTimeout(recTick, 480);
//       };
//       recTick();
//     };
//     tid = setTimeout(normalTick, 700);
//     return () => clearTimeout(tid);
//   }, []);

//   const col = { sys: "#c8d8f0", dim: "#4a5f7a", ok: "#39ff14", err: "#ff3366", wrn: "#ffb347", hd: "#ffb347" };

//   return (
//     <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "#05060e", display: "flex", alignItems: "center", justifyContent: "center", opacity: exiting ? 0 : 1, transition: exiting ? "opacity .9s cubic-bezier(.4,0,.2,1)" : "none", pointerEvents: exiting ? "none" : "all" }}>
//       <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: .05, pointerEvents: "none" }}>
//         <filter id="bn"><feTurbulence type="fractalNoise" baseFrequency=".65" numOctaves="3" stitchTiles="stitch" /><feColorMatrix type="saturate" values="0" /></filter>
//         <rect width="100%" height="100%" filter="url(#bn)" />
//       </svg>
//       <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.12) 2px,rgba(0,0,0,.12) 4px)" }} />
//       <div style={{ width: "min(700px,93vw)", position: "relative" }}>
//         <div style={{ marginBottom: 26, display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
//           <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
//             <div style={{ width: 2, height: 44, background: "linear-gradient(to bottom,#00f7ff,#00f7ff00)" }} />
//             <div>
//               <div style={{ color: "#2a3548", fontSize: 9, letterSpacing: 5, fontFamily: F.hud, marginBottom: 3 }}>VISUOSLAYER // SAIF — TOP SECRET</div>
//               <div style={{ color: "#c8d8f0", fontSize: "clamp(20px, 6vw, 28px)", fontFamily: F.display, letterSpacing: 6, lineHeight: 1.2 }}>VisuoSlayer !</div>
//             </div>
//           </div>
//           <div style={{ fontFamily: F.hud, fontSize: 9, color: "#2a3548", letterSpacing: 2, textAlign: "right", lineHeight: 1.8 }}>
//             <div>CASE #2026</div>
//             <div style={{ color: "#ff3366", display: "flex", alignItems: "center", gap: 5, justifyContent: "flex-end" }}>
//               <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#ff3366", display: "inline-block", animation: "bl 1.1s step-end infinite" }} />REC
//             </div>
//           </div>
//         </div>
//         <div ref={termRef} style={{ border: `1px solid ${isErr ? "#ff336666" : "#1a2030"}`, background: isErr ? "rgba(12,5,8,.98)" : "rgba(5,7,14,.98)", boxShadow: isErr ? "0 0 120px rgba(255,51,102,.25),inset 0 0 80px rgba(255,51,102,.08)" : "0 0 60px rgba(0,247,255,.05)", transition: "border-color .35s,box-shadow .4s,background .4s" }}>
//           <div style={{ background: isErr ? "#0a0508" : "#080a12", borderBottom: `1px solid ${isErr ? "#ff336633" : "#1a2030"}`, padding: "8px 16px", display: "flex", alignItems: "center", gap: 8, transition: "background .4s" }}>
//             {["#ff3366", "#ffb347", "#39ff14"].map(c => <span key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c, display: "block", opacity: .7 }} />)}
//             <span style={{ color: isErr ? "#ff336688" : "#2a3548", fontSize: 9, marginLeft: 10, letterSpacing: 2, fontFamily: F.mono, transition: "color .4s" }}>
//               {isErr ? "visuoslayer@saif:~$  !! SYSTEM HALTED" : "visuoslayer@saif:~$  BOOT_SEQUENCE.sh"}
//             </span>
//           </div>
//           <div ref={bodyRef} style={{ padding: "18px 20px 14px", minHeight: 220, maxHeight: "40vh", overflowY: "hidden", fontFamily: F.mono, fontSize: 12, lineHeight: 1.7, wordBreak: "break-word" }}>
//             {lines.map((l, i) => (
//               <div key={i} style={{ display: "flex", gap: 12, marginBottom: 3, color: col[l.c] || "#c8d8f0", fontWeight: l.c === "hd" || l.c === "err" ? 700 : 400, fontSize: l.c === "hd" ? 13 : 12, textShadow: l.c === "err" ? "0 0 18px rgba(255,51,102,.8)" : l.c === "ok" ? "0 0 6px rgba(57,255,20,.2)" : "none", animation: "bi .1s ease forwards" }}>
//                 <span style={{ color: l.c === "err" || l.c === "wrn" ? "#ff336666" : "#253040", userSelect: "none", flexShrink: 0 }}>{l.c === "err" || l.c === "wrn" ? "!" : "$"}</span>
//                 {l.t}
//               </div>
//             ))}
//             {!frozen && <span style={{ display: "inline-block", width: 8, height: 13, verticalAlign: "middle", background: isErr ? "#ff3366" : "#00f7ff", boxShadow: isErr ? "0 0 12px #ff3366" : "0 0 8px #00f7ff", animation: "bl 1s step-end infinite", opacity: isErr ? 0 : 1, transition: "background .3s,opacity .3s" }} />}
//             {frozen && <div style={{ marginTop: 10, color: "#ff3366", fontFamily: F.mono, fontSize: 11, letterSpacing: 3, textShadow: "0 0 14px rgba(255,51,102,.7)", animation: "bl 1.2s step-end infinite" }}>!! TERMINAL HALTED — AWAITING OVERRIDE...</div>}
//           </div>
//           <div style={{ borderTop: `1px solid ${isErr ? "#ff336622" : "#1a2030"}`, padding: "12px 20px", transition: "border-color .4s" }}>
//             <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7, fontSize: 9, letterSpacing: 3, fontFamily: F.hud }}>
//               <span style={{ color: isErr ? "#ff3366" : "#2a3548", transition: "color .3s" }}>{isErr ? (frozen ? "SYSTEM CRITICAL — OVERRIDE PENDING" : "OVERRIDE ACTIVE — RESUMING") : "LOADING CASE FILES"}</span>
//               <span style={{ color: isErr ? "#ff3366" : "#00f7ff", transition: "color .3s" }}>{pct}%</span>
//             </div>
//             <div style={{ height: 1, background: isErr ? "#ff336618" : "#1a2030", position: "relative", overflow: "hidden" }}>
//               <div style={{ position: "absolute", inset: 0, background: isErr ? "linear-gradient(90deg,#ff3366,#ff336688)" : "linear-gradient(90deg,#00f7ff,#00f7ff55)", width: `${pct}%`, transition: "width .3s ease,background .4s", boxShadow: isErr ? "0 0 18px #ff3366" : "0 0 18px #00f7ff" }} />
//             </div>
//           </div>
//         </div>
//         <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, fontSize: 9, color: "#1e2535", letterSpacing: 2, fontFamily: F.hud }}>
//           <span>CAM_04 [REC]</span><span>VISUOSLAYER // SAIF</span>
//           <span style={{ color: isErr ? "#ff336688" : "#1e2535", transition: "color .3s" }}>{isErr ? (frozen ? "SIGNAL: CRITICAL — HALTED" : "SIGNAL: OVERRIDE ACTIVE") : "SIGNAL: STABLE"}</span>
//         </div>
//       </div>
//       <style>{`@keyframes bl{0%,100%{opacity:1}50%{opacity:0}} @keyframes bi{from{opacity:0;transform:translateX(-5px)}to{opacity:1;transform:none}}`}</style>
//     </div>
//   );
// }

// // ─── HUD ─────────────────────────────────────────────────────────────────────
// function HUD({ activeLang }) {
//   const [time, setTime] = useState("00:00:00");
//   const ref = useRef(null);
//   useEffect(() => {
//     const iv = setInterval(() => {
//       const n = new Date();
//       setTime([n.getHours(), n.getMinutes(), n.getSeconds()].map(x => String(x).padStart(2, "0")).join(":"));
//     }, 1000);
//     if (ref.current) gsap.from(ref.current, { y: -80, opacity: 0, duration: 1, ease: "power3.out", delay: .15 });
//     return () => clearInterval(iv);
//   }, []);
//   return (
//     <div ref={ref} style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 5vw", background: "rgba(5,6,14,.92)", borderBottom: "1px solid #1a2030", backdropFilter: "blur(20px)", fontFamily: F.hud, fontSize: 9, letterSpacing: 3 }}>
//       <div style={{ display: "flex", gap: "clamp(12px,3vw,24px)", alignItems: "center", flexWrap: "wrap" }}>
//         <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
//           <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#00f7ff", display: "block", boxShadow: "0 0 10px #00f7ff", animation: "hp 2.5s ease-in-out infinite" }} />
//           <span style={{ color: "#c8d8f0", fontFamily: F.display, fontSize: 18, letterSpacing: 6 }}>VISUOSLAYER</span>
//         </div>
//         <span style={{ color: "#1a2030" }}>|</span>
//         <span style={{ color: "#3a4558", fontSize: 8 }}>LANG_FILES <span style={{ color: "#00f7ff" }}>SAIF</span></span>
//       </div>
//       <div style={{ display: "flex", gap: "clamp(12px,3vw,24px)", alignItems: "center", flexWrap: "wrap" }}>
//         {activeLang && <span style={{ color: "#ffb347", fontSize: 8 }}>TARGET: <span style={{ color: "#ff3366" }}>{activeLang}</span></span>}
//         <span style={{ color: "#2a3548", fontSize: 8 }}>SIG: <span style={{ color: "#39ff14" }}>99%</span></span>
//         <span style={{ display: "flex", alignItems: "center", gap: 5, color: "#ff3366", fontSize: 8 }}>
//           <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#ff3366", display: "inline-block", boxShadow: "0 0 6px #ff3366", animation: "hp 1.3s ease-in-out infinite" }} />REC
//         </span>
//         <span style={{ color: "#2a3548", fontSize: 8, fontFamily: F.mono }}>{time}</span>
//       </div>
//       <style>{`@keyframes hp{0%,100%{opacity:1}50%{opacity:.2}}`}</style>
//     </div>
//   );
// }

// // ─── SCROLL PROGRESS ─────────────────────────────────────────────────────────
// function ScrollBar() {
//   const ref = useRef(null);
//   useEffect(() => {
//     const upd = () => {
//       const total = document.documentElement.scrollHeight - window.innerHeight;
//       if (ref.current) ref.current.style.transform = `scaleX(${total > 0 ? window.scrollY / total : 0})`;
//     };
//     window.addEventListener("scroll", upd, { passive: true });
//     return () => window.removeEventListener("scroll", upd);
//   }, []);
//   return (
//     <div style={{ position: "fixed", top: 41, left: 0, right: 0, height: 2, zIndex: 101, background: "rgba(255,255,255,0.03)" }}>
//       <div ref={ref} style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg,#00f7ff,#ff3366,#ffb347)", transformOrigin: "left", transform: "scaleX(0)" }} />
//     </div>
//   );
// }

// // ─── TICKER ─────────────────────────────────────────────────────────────────
// function Ticker() {
//   const items = [...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS];
//   return (
//     <div style={{ borderTop: "2px solid rgba(0,247,255,0.25)", borderBottom: "2px solid rgba(0,247,255,0.25)", padding: "10px 0", overflow: "hidden", position: "relative", marginBottom: 52, boxShadow: "0 0 15px rgba(0,247,255,0.1)" }}>
//       <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "15%", zIndex: 2, background: "linear-gradient(90deg,#05060e,transparent)", pointerEvents: "none" }} />
//       <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "15%", zIndex: 2, background: "linear-gradient(270deg,#05060e,transparent)", pointerEvents: "none" }} />
//       <div style={{ display: "flex", animation: "tk 24s linear infinite", whiteSpace: "nowrap", width: "max-content" }}>
//         {items.map((item, i) => (
//           <span key={i} style={{ fontSize: 9, letterSpacing: 5, color: "#3a4f70", fontFamily: F.hud, paddingRight: 48, display: "inline-flex", alignItems: "center" }}>
//             <span style={{ color: "#00f7ff40", marginRight: 18, fontSize: 7 }}>*</span>{item}
//           </span>
//         ))}
//       </div>
//       <style>{`@keyframes tk{from{transform:translateX(0)}to{transform:translateX(-33.33%)}}`}</style>
//     </div>
//   );
// }

// // ─── ORB ─────────────────────────────────────────────────────────────────────
// function PremiumGSAPOrb() {
//   const canvasRef = useRef(null);
//   const scrollProgress = useRef(0);
//   const time = useRef(0);
//   const isMobile = useRef(false);

//   useEffect(() => {
//     const canvas = canvasRef.current; if (!canvas) return;
//     const ctx = canvas.getContext("2d");
//     let width = 0, height = 0, animationId;
//     const updateIsMobile = () => { isMobile.current = window.innerWidth <= 768; };
//     updateIsMobile(); window.addEventListener("resize", updateIsMobile);
//     const updatePixelRatio = () => {
//       const dpr = window.devicePixelRatio || 1;
//       width = canvas.clientWidth * dpr; height = canvas.clientHeight * dpr;
//       canvas.width = width; canvas.height = height;
//     };
//     const updateScroll = () => {
//       const total = document.documentElement.scrollHeight - window.innerHeight;
//       scrollProgress.current = total > 0 ? window.scrollY / total : 0;
//     };
//     window.addEventListener("scroll", updateScroll); updateScroll();
//     updatePixelRatio(); window.addEventListener("resize", updatePixelRatio);

//     function drawSphere(ctx, cx, cy, radius, rx, ry, rz, color, lw) {
//       const stL = isMobile.current ? 8 : 14, stN = isMobile.current ? 12 : 20;
//       const rotate = (p, rx, ry, rz) => {
//         let x = p.x, y = p.y, z = p.z;
//         let c = Math.cos(rx), s = Math.sin(rx); let y1 = y * c - z * s, z1 = y * s + z * c; y = y1; z = z1;
//         c = Math.cos(ry); s = Math.sin(ry); let x1 = x * c + z * s, z2 = -x * s + z * c; x = x1; z = z2;
//         c = Math.cos(rz); s = Math.sin(rz); let x2 = x * c - y * s, y2 = x * s + y * c;
//         return { x: x2, y: y2 };
//       };
//       const proj = (p, r) => ({ x: cx + p.x * r, y: cy + p.y * r });
//       for (let i = 1; i < stL; i++) {
//         const phi = (i / stL) * Math.PI, r = Math.sin(phi), y = Math.cos(phi);
//         const pts = []; for (let j = 0; j <= stN; j++) { const t = (j / stN) * Math.PI * 2; pts.push(proj(rotate({ x: r * Math.cos(t), y, z: r * Math.sin(t) }, rx, ry, rz), radius)); }
//         ctx.beginPath(); pts.forEach((p, j) => j === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
//         ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.stroke();
//       }
//       for (let j = 0; j < stN; j++) {
//         const t = (j / stN) * Math.PI * 2, pts = [];
//         for (let i = 0; i <= stL; i++) { const phi = (i / stL) * Math.PI; pts.push(proj(rotate({ x: Math.sin(phi) * Math.cos(t), y: Math.cos(phi), z: Math.sin(phi) * Math.sin(t) }, rx, ry, rz), radius)); }
//         ctx.beginPath(); pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)); ctx.stroke();
//       }
//     }

//     const draw = () => {
//       if (!ctx || width === 0 || height === 0) return;
//       ctx.clearRect(0, 0, width, height);
//       time.current += 0.008;
//       const t = time.current, progress = scrollProgress.current;
//       const cx = width / 2, cy = height / 2;
//       const baseRadius = Math.min(width, height) * (isMobile.current ? 0.32 : 0.38);
//       const hue = 200 + progress * 100;
//       ctx.save(); ctx.translate(cx, cy); ctx.scale(1, 0.95); ctx.translate(-cx, -cy);
//       drawSphere(ctx, cx, cy, baseRadius, t * 0.2, t * 0.15, t * 0.05, `hsla(${hue},80%,65%,0.9)`, isMobile.current ? 1 : 1.2);
//       ctx.shadowBlur = 15; ctx.shadowColor = `hsla(${hue},85%,70%,0.8)`;
//       drawSphere(ctx, cx, cy, baseRadius * 0.98, t * 0.2, t * 0.15, t * 0.05, `hsla(${hue + 30},85%,70%,0.85)`, isMobile.current ? 0.8 : 1);
//       ctx.shadowBlur = 0; ctx.restore();
//       const rc = isMobile.current ? 2 : 3;
//       for (let i = 0; i < rc; i++) {
//         const rr = baseRadius * (0.85 + i * 0.12), tilt = Math.sin(t * 0.5 + i) * 0.2, angle = t * (0.5 + i * 0.3);
//         ctx.save(); ctx.translate(cx, cy); ctx.rotate(angle); ctx.scale(1, 0.7 + tilt * 0.1);
//         ctx.beginPath(); ctx.ellipse(0, 0, rr, rr * 0.45, 0, 0, Math.PI * 2);
//         ctx.strokeStyle = `hsla(${hue + i * 20},85%,70%,0.5)`; ctx.lineWidth = isMobile.current ? 0.8 : 1.2; ctx.stroke(); ctx.restore();
//       }
//       const pc = isMobile.current ? 40 : 80;
//       for (let i = 0; i < pc; i++) {
//         const ri = i % rc, rr = baseRadius * (0.85 + ri * 0.12), a = i * (Math.PI * 2 / (pc / rc)) + t * 1.5;
//         const x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr * 0.75;
//         const sz = isMobile.current ? 1.2 : 1.8 + Math.sin(t * 5 + i) * 0.8;
//         ctx.beginPath(); ctx.arc(x, y, sz, 0, Math.PI * 2);
//         ctx.fillStyle = `hsla(${hue + ri * 30},90%,75%,0.9)`; ctx.fill();
//       }
//       const g = ctx.createRadialGradient(cx, cy, baseRadius * 0.08, cx, cy, baseRadius * 0.28);
//       g.addColorStop(0, `hsla(${hue},90%,70%,0.95)`); g.addColorStop(0.7, `hsla(${hue},85%,65%,0.4)`); g.addColorStop(1, "transparent");
//       ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, baseRadius * 0.28, 0, Math.PI * 2); ctx.fill();
//       ctx.beginPath(); ctx.arc(cx, cy, baseRadius * 0.08, 0, Math.PI * 2);
//       ctx.fillStyle = `hsla(${hue},100%,85%,1)`; ctx.fill();
//       animationId = requestAnimationFrame(draw);
//     };
//     draw();
//     return () => { cancelAnimationFrame(animationId); window.removeEventListener("scroll", updateScroll); window.removeEventListener("resize", updatePixelRatio); window.removeEventListener("resize", updateIsMobile); };
//   }, []);

//   return <canvas ref={canvasRef} style={{ position: "absolute", top: "8%", right: "2%", width: "min(500px,45vw,70vh)", height: "min(500px,45vw,70vh)", pointerEvents: "none", zIndex: 5, filter: "drop-shadow(0 0 20px rgba(0,150,255,0.25))", opacity: 0.95, willChange: "transform" }} />;
// }

// // ─── SCROLL MARQUEE ──────────────────────────────────────────────────────────
// function ScrollMarquee({ text, direction, accent = "#00f7ff", dim = "#161b26", index = 0 }) {
//   const trackRef = useRef(null), wrapRef = useRef(null), glowRef = useRef(null);
//   const isTop = index === 0;
//   const words = Array(14).fill(text);

//   useEffect(() => {
//     const track = trackRef.current, wrap = wrapRef.current;
//     if (!track || !wrap) return;
//     gsap.set(track, { xPercent: direction === 1 ? 0 : -50 });
//     const st = ScrollTrigger.create({
//       trigger: wrap, start: "top bottom", end: "bottom top", scrub: 1.8,
//       onUpdate: self => {
//         const v = self.getVelocity(), move = direction * v * 0.014;
//         gsap.to(track, { xPercent: `+=${move}`, duration: .8, ease: "power1.out", modifiers: { xPercent: x => { let v = parseFloat(x) % 50; if (v > 0) v -= 50; return v; } } });
//         if (glowRef.current) {
//           const spd = Math.abs(v), int = Math.min(spd / 800, 1), hue = isTop ? 190 + int * 20 : 38 + int * 15;
//           glowRef.current.style.opacity = `${0.4 + int * 0.6}`;
//           glowRef.current.style.background = `linear-gradient(90deg,transparent,hsla(${hue},100%,65%,0.9),transparent)`;
//           glowRef.current.style.filter = `blur(${2 + int * 6}px)`;
//         }
//       },
//     });
//     return () => st.kill();
//   }, [direction, isTop]);

//   const accentMid = isTop ? "#00f7ff" : "#ffb347";
//   return (
//     <div ref={wrapRef} style={{ overflow: "hidden", position: "relative", borderTop: `1px solid ${accentMid}55`, borderBottom: `1px solid ${accentMid}33` }}>
//       <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,transparent,${accentMid}cc,#fff,${accentMid}cc,transparent)`, boxShadow: `0 0 18px 2px ${accentMid}aa`, zIndex: 3, pointerEvents: "none" }} />
//       <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,transparent,${accentMid}88,${accentMid}cc,${accentMid}88,transparent)`, zIndex: 3, pointerEvents: "none" }} />
//       <div ref={glowRef} style={{ position: "absolute", top: "30%", left: "-10%", width: "40%", height: "40%", background: `linear-gradient(90deg,transparent,${accentMid}99,transparent)`, filter: "blur(4px)", pointerEvents: "none", zIndex: 2, opacity: 0.5 }} />
//       <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "12%", zIndex: 4, background: `linear-gradient(90deg,#05060e,transparent)`, pointerEvents: "none" }} />
//       <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "12%", zIndex: 4, background: `linear-gradient(270deg,#05060e,transparent)`, pointerEvents: "none" }} />
//       <div ref={trackRef} style={{ display: "flex", whiteSpace: "nowrap", width: "max-content", willChange: "transform", padding: "clamp(7px,2vw,12px) 0", position: "relative", zIndex: 1 }}>
//         {words.map((w, i) => (
//           <span key={i} style={{ fontSize: "clamp(30px,6.5vw,96px)", fontWeight: 900, letterSpacing: 2, fontFamily: F.display, paddingRight: "clamp(22px,4vw,60px)", color: i % 2 === 0 ? "transparent" : `${dim}`, WebkitTextStroke: i % 2 === 0 ? `1.5px ${accentMid}cc` : "none", textShadow: i % 2 === 0 ? `0 0 80px ${accentMid}50,0 0 20px ${accentMid}30` : i % 4 === 1 ? `0 0 40px ${accentMid}22` : "none", filter: i % 2 === 0 ? `drop-shadow(0 0 8px ${accentMid}66)` : "none" }}>{w}</span>
//         ))}
//       </div>
//     </div>
//   );
// }

// // ─── PARTICLES ───────────────────────────────────────────────────────────────
// function Particles() {
//   const cvs = useRef(null);
//   useEffect(() => {
//     const c = cvs.current; if (!c) return;
//     const ctx = c.getContext("2d");
//     let W = c.width = window.innerWidth, H = c.height = window.innerHeight, pts = [];
//     const init = () => { const mob = window.innerWidth <= 768, n = mob ? 40 : 85; pts = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .22, vy: (Math.random() - .5) * .22, r: Math.random() * 1.5 + .3, o: Math.random() * .28 + .06 })); };
//     init();
//     const onR = () => { W = c.width = window.innerWidth; H = c.height = window.innerHeight; init(); };
//     window.addEventListener("resize", onR);
//     let af, time = 0;
//     const draw = () => { ctx.clearRect(0, 0, W, H); time += 0.01; const hb = 180 + Math.sin(time) * 30; pts.forEach(p => { p.x += p.vx; p.y += p.vy; if (p.x < 0) p.x = W; if (p.x > W) p.x = 0; if (p.y < 0) p.y = H; if (p.y > H) p.y = 0; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fillStyle = `hsla(${hb},100%,60%,${p.o})`; ctx.fill(); }); for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) { const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y, d = Math.sqrt(dx * dx + dy * dy); if (d < 100) { ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.strokeStyle = `hsla(${hb},100%,65%,${(1 - d / 100) * .08})`; ctx.lineWidth = 0.6; ctx.stroke(); } } af = requestAnimationFrame(draw); };
//     draw();
//     return () => { cancelAnimationFrame(af); window.removeEventListener("resize", onR); };
//   }, []);
//   return <canvas ref={cvs} style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", willChange: "transform" }} />;
// }

// // ─── ANIMATED COUNTER ────────────────────────────────────────────────────────
// function AnimCounter({ from = 0, to, suffix = "" }) {
//   const [val, setVal] = useState(from);
//   const ref = useRef(null);
//   useEffect(() => {
//     if (!ref.current) return;
//     const obs = new IntersectionObserver(([e]) => {
//       if (!e.isIntersecting) return; obs.disconnect();
//       gsap.fromTo(ref.current, { innerText: from }, { innerText: to, duration: 1.6, snap: { innerText: 1 }, ease: "power2.out", onUpdate: function () { setVal(Math.floor(this.targets()[0].innerText)); } });
//     }, { threshold: .4 });
//     obs.observe(ref.current);
//     return () => obs.disconnect();
//   }, [from, to]);
//   return <span ref={ref}>{val}{suffix}</span>;
// }

// // ─── CARD ────────────────────────────────────────────────────────────────────
// function Card({ lang, onSelect, index }) {
//   const [hov, setHov] = useState(false);
//   const [mousePos, setMousePos] = useState({ x: .5, y: .5 });
//   const ref = useRef(null), topLine = useRef(null), glowRef = useRef(null);
//   const btn = useGlitch("[ DECRYPT FILE ]", hov);
//   const lbl = useGlitch(lang.label, hov);
//   const RGB = { "#00f7ff": "0,247,255", "#ffb347": "255,179,71", "#ff3366": "255,51,102" };
//   const rgb = RGB[lang.accent];

//   useEffect(() => {
//     if (!ref.current) return;
//     gsap.set(ref.current, { opacity: 0, y: 120, rotateX: 18, scale: 0.92 });
//     ScrollTrigger.create({
//       trigger: ref.current, start: "top 92%",
//       onEnter: () => gsap.to(ref.current, {
//         opacity: 1, y: 0, rotateX: 0, scale: 1,
//         duration: 1.2, ease: "expo.out", delay: index * .22
//       }),
//       once: true
//     });
//   }, [index]);

//   const enter = e => {
//     setHov(true);
//     const rect = ref.current.getBoundingClientRect();
//     setMousePos({ x: (e.clientX - rect.left) / rect.width, y: (e.clientY - rect.top) / rect.height });
//     gsap.to(ref.current, { y: -16, scale: 1.018, duration: .5, ease: "power2.out" });
//     if (topLine.current) gsap.to(topLine.current, { scaleX: 1, duration: .45, ease: "power2.out" });
//     if (glowRef.current) gsap.to(glowRef.current, { opacity: 1, duration: .4 });
//   };
//   const leave = () => {
//     setHov(false);
//     gsap.to(ref.current, { y: 0, scale: 1, rotateY: 0, rotateX: 0, duration: .6, ease: "power2.inOut" });
//     if (topLine.current) gsap.to(topLine.current, { scaleX: 0, duration: .3 });
//     if (glowRef.current) gsap.to(glowRef.current, { opacity: 0, duration: .4 });
//   };
//   const mouseMove = e => {
//     if (!hov || !ref.current) return;
//     const rect = ref.current.getBoundingClientRect();
//     const mx = (e.clientX - rect.left) / rect.width - .5, my = (e.clientY - rect.top) / rect.height - .5;
//     gsap.to(ref.current, { rotateY: mx * 10, rotateX: -my * 6, duration: .4, ease: "power1.out" });
//     setMousePos({ x: (e.clientX - rect.left) / rect.width, y: (e.clientY - rect.top) / rect.height });
//   };
//   const click = () => {
//     gsap.timeline().to(ref.current, { scale: .96, duration: .12, ease: "power2.in" }).to(ref.current, { scale: 1, duration: .25, ease: "back.out(1.5)" });
//     const fl = document.createElement("div");
//     Object.assign(fl.style, { position: "absolute", inset: 0, zIndex: 20, background: `radial-gradient(circle at ${mousePos.x * 100}% ${mousePos.y * 100}%,${lang.accent}60,transparent 70%)`, pointerEvents: "none", animation: "ripFade .5s ease forwards", borderRadius: "inherit" });
//     ref.current.appendChild(fl); setTimeout(() => fl.remove(), 550); setTimeout(() => onSelect(lang), 330);
//   };

//   return (
//     <div ref={ref} data-cur onMouseEnter={enter} onMouseLeave={leave} onMouseMove={mouseMove} onClick={click}
//       style={{
//         position: "relative", cursor: "none", overflow: "hidden",
//         border: `1px solid ${hov ? lang.accent + "dd" : "#1a2030"}`,
//         background: hov
//           ? `linear-gradient(145deg, rgba(${rgb},.10) 0%, rgba(5,7,14,0.98) 60%, rgba(${rgb},.05) 100%)`
//           : "rgba(5,7,14,.98)",
//         padding: "clamp(20px, 3vw, 36px) clamp(18px, 2.5vw, 28px)",
//         transformStyle: "preserve-3d", willChange: "transform",
//         boxShadow: hov
//           ? `0 0 60px rgba(${rgb},.20), 0 40px 80px rgba(0,0,0,.6), inset 0 1px 0 rgba(${rgb},.3)`
//           : "0 8px 40px rgba(0,0,0,.4)",
//         transition: "border-color .35s, box-shadow .35s, background .35s",
//       }}>

//       {/* Ambient glow */}
//       <div ref={glowRef} style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0, background: `radial-gradient(ellipse at ${mousePos.x * 100}% ${mousePos.y * 100}%,rgba(${rgb},0.22) 0%,transparent 65%)`, transition: "background .1s" }} />

//       {/* Top gradient flash */}
//       <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 220, pointerEvents: "none", background: `radial-gradient(ellipse at 50% -10%,rgba(${rgb},${hov ? .18 : 0}) 0%,transparent 70%)`, transition: "background .5s" }} />

//       {/* Top border line */}
//       <div ref={topLine} style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,transparent,${lang.accent},transparent)`, boxShadow: `0 0 24px 2px ${lang.accent}`, transformOrigin: "center", transform: "scaleX(0)" }} />

//       {/* Bottom border glow on hover */}
//       {hov && <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg,transparent,${lang.accent}44,transparent)` }} />}

//       {/* Corner accents */}
//       {["tl", "tr", "bl", "br"].map(c => (
//         <div key={c} style={{ position: "absolute", top: c[0] === "t" ? 12 : "auto", bottom: c[0] === "b" ? 12 : "auto", left: c[1] === "l" ? 12 : "auto", right: c[1] === "r" ? 12 : "auto", width: 14, height: 14, borderTop: c[0] === "t" ? `1.5px solid ${lang.accent}` : "none", borderBottom: c[0] === "b" ? `1.5px solid ${lang.accent}` : "none", borderLeft: c[1] === "l" ? `1.5px solid ${lang.accent}` : "none", borderRight: c[1] === "r" ? `1.5px solid ${lang.accent}` : "none", opacity: hov ? 1 : .25, transition: "opacity .3s,transform .3s", transform: hov ? `translate(${c[1] === "l" ? "-3px" : "3px"},${c[0] === "t" ? "-3px" : "3px"})` : "" }} />
//       ))}

//       {/* Large index watermark */}
//       <div style={{ position: "absolute", bottom: -18, right: -8, fontSize: "clamp(60px, 12vw, 120px)", fontFamily: F.crazy, color: lang.accent, opacity: hov ? .10 : .04, lineHeight: 1, pointerEvents: "none", userSelect: "none", transition: "opacity .4s,transform .6s", transform: hov ? "translateY(-8px) scale(1.05)" : "none" }}>{lang.index}</div>

//       {/* Scan line on hover */}
//       {hov && <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none", overflow: "hidden", zIndex: 1 }}>
//         <div style={{ position: "absolute", width: "100%", height: 1, background: `linear-gradient(90deg,transparent,${lang.accent}99,transparent)`, animation: "cardScan 2.2s ease-in-out infinite" }} />
//       </div>}

//       <div style={{ position: "relative", zIndex: 2 }}>
//         {/* Tag */}
//         <div style={{ fontSize: 7, letterSpacing: 4, color: lang.accent, opacity: hov ? .8 : .5, marginBottom: 20, fontFamily: F.hud, display: "flex", alignItems: "center", gap: 8, transition: "opacity .3s" }}>
//           <span style={{ width: 18, height: 1, background: lang.accent, display: "inline-block", opacity: .6 }} />{lang.tag}
//         </div>

//         {/* Label */}
//         <div style={{ fontSize: "clamp(44px, 7vw, 80px)", fontFamily: F.display, letterSpacing: 2, lineHeight: .82, color: hov ? lang.accent : "#c8d8f0", marginBottom: 16, transition: "color .28s", textShadow: hov ? `0 0 100px ${lang.accent}70,0 0 40px ${lang.accent}40` : "none" }}>{lbl}</div>

//         {/* Tagline */}
//         <div style={{ fontSize: 8, color: hov ? lang.accent + "cc" : "#506070", letterSpacing: 3, marginBottom: 18, fontFamily: F.hud, transition: "color .3s", textTransform: "uppercase" }}>{lang.tagline}</div>

//         {/* Divider */}
//         <div style={{ height: 1, background: `linear-gradient(90deg,${lang.accent}cc,${lang.accent}44,transparent)`, marginBottom: 18, opacity: hov ? 1 : .3, transition: "opacity .3s" }} />

//         {/* Description */}
//         <p style={{ fontSize: "clamp(10px, 1.8vw, 11px)", color: hov ? "#9aaabb" : "#607080", lineHeight: 1.9, marginBottom: 22, fontFamily: F.mono, transition: "color .3s" }}>{lang.desc}</p>

//         {/* Meta tags */}
//         <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 22 }}>
//           {lang.meta.map(m => (
//             <span key={m} style={{ fontSize: 7, letterSpacing: 2, padding: "5px 12px", border: `1px solid ${lang.accent}${hov ? "77" : "33"}`, color: hov ? lang.accent : lang.accent + "77", background: `${lang.accent}${hov ? "18" : "08"}`, fontFamily: F.hud, transition: "all .3s" }}>{m}</span>
//           ))}
//         </div>

//         {/* Features */}
//         <div style={{ marginBottom: 30 }}>
//           {lang.features.map((f, i) => (
//             <div key={f} style={{ fontSize: 10, color: hov ? "#9aaabb" : "#506070", marginBottom: 8, display: "flex", alignItems: "center", gap: 10, fontFamily: F.mono, transform: hov ? "translateX(8px)" : "none", transition: `transform .4s ${i * .07}s ease,color .3s` }}>
//               <span style={{ color: lang.accent, fontSize: 7, transition: "transform .3s", transform: hov ? "scale(1.4)" : "scale(1)", display: "inline-block" }}>▶</span>{f}
//             </div>
//           ))}
//         </div>

//         {/* CTA Button */}
//         <button style={{ width: "100%", padding: "clamp(10px, 2vw, 14px)", cursor: "none", border: `1px solid ${lang.accent}${hov ? "ff" : "66"}`, color: hov ? "#fff" : lang.accent, fontFamily: F.hud, fontSize: 8, letterSpacing: 4, background: hov ? `linear-gradient(135deg, rgba(${rgb},.35), rgba(${rgb},.15))` : "transparent", boxShadow: hov ? `0 0 60px ${lang.accent}44,inset 0 0 40px ${lang.accent}18,0 0 0 1px ${lang.accent}55` : "none", transition: "all .35s", position: "relative", overflow: "hidden" }}>
//           {hov && <div style={{ position: "absolute", inset: 0, background: `linear-gradient(90deg,transparent,${lang.accent}25,transparent)`, animation: "btnShine 1.4s ease-in-out infinite" }} />}
//           <span style={{ position: "relative", zIndex: 1 }}>{btn}</span>
//         </button>
//       </div>
//     </div>
//   );
// }

// // ─── STATS STRIP ─────────────────────────────────────────────────────────────
// function StatsStrip() {
//   const stripRef = useRef(null);
//   const stats = [
//     { label: "LANG FILES", val: 3, suffix: "", accent: "#00f7ff" },
//     { label: "CONCEPTS COVERED", val: 120, suffix: "+", accent: "#ffb347" },
//     { label: "HOURS OF CONTENT", val: 48, suffix: "H", accent: "#ff3366" },
//     { label: "SKILL LEVEL", val: 0, suffix: "→∞", accent: "#39ff14" },
//   ];
//   useEffect(() => {
//     if (!stripRef.current) return;
//     gsap.from(stripRef.current.querySelectorAll(".stat-item"), { opacity: 0, y: 30, stagger: .1, duration: .8, ease: "power2.out", scrollTrigger: { trigger: stripRef.current, start: "top 88%", once: true } });
//   }, []);
//   return (
//     <div ref={stripRef} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", borderTop: "2px solid rgba(0,247,255,0.25)", borderLeft: "1px solid #1a2030", marginBottom: 52 }}>
//       {stats.map(s => (
//         <div key={s.label} className="stat-item" style={{ padding: "clamp(14px, 3vw, 24px) clamp(12px, 2.5vw, 20px)", borderRight: "1px solid #1a2030", borderBottom: "1px solid #1a2030", position: "relative", overflow: "hidden", transition: "background .3s" }}
//           onMouseEnter={e => e.currentTarget.style.background = "rgba(0,247,255,.04)"}
//           onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
//           <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,${s.accent}aa,transparent)` }} />
//           <div style={{ fontSize: 7, letterSpacing: 3, color: "#2a3548", marginBottom: 8, fontFamily: F.hud }}>{s.label}</div>
//           <div style={{ fontSize: "clamp(28px, 5vw, 42px)", fontFamily: F.display, color: s.accent, letterSpacing: 2, textShadow: `0 0 40px ${s.accent}80` }}>
//             <AnimCounter to={s.val} suffix={s.suffix} />
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }

// // ─── FEATURE ITEMS ───────────────────────────────────────────────────────────
// function FeatureItem({ item, idx }) {
//   const [hov, setHov] = useState(false);
//   const ref = useRef(null);
//   useEffect(() => {
//     if (!ref.current) return;
//     gsap.set(ref.current, { opacity: 0, y: 40 });
//     ScrollTrigger.create({ trigger: ref.current, start: "top 92%", onEnter: () => gsap.to(ref.current, { opacity: 1, y: 0, duration: .7, ease: "power3.out", delay: idx * .08 }), once: true });
//   }, [idx]);
//   return (
//     <div ref={ref} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
//       style={{ padding: "clamp(16px, 4vw, 24px) clamp(14px, 3vw, 20px)", border: `1px solid ${hov ? "#00f7ff60" : "#1a2030"}`, background: hov ? "rgba(0,247,255,.04)" : "transparent", transition: "border-color .3s,background .3s", position: "relative", overflow: "hidden" }}>
//       {hov && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,transparent,#00f7ffaa,transparent)" }} />}
//       <div style={{ fontSize: "clamp(18px, 4vw, 22px)", marginBottom: 12, color: "#00f7ff", opacity: hov ? 1 : .55, transition: "opacity .3s,transform .35s", transform: hov ? "scale(1.2) translateX(3px)" : "none" }}>{item.icon}</div>
//       <div style={{ fontSize: 8, letterSpacing: 3, color: hov ? "#c8d8f0" : "#506070", marginBottom: 8, transition: "color .3s", fontFamily: F.hud }}>{item.title}</div>
//       <div style={{ fontSize: "clamp(9px, 1.8vw, 10px)", color: hov ? "#4a6f80" : "#2a3548", lineHeight: 1.6, transition: "color .3s", fontFamily: F.mono }}>{item.desc}</div>
//     </div>
//   );
// }

// function HorizontalFeatures() {
//   const items = [
//     { icon: "◈", title: "MODULAR LESSONS", desc: "Each concept is a self-contained file. Open, decrypt, master." },
//     { icon: "⬡", title: "OPERATOR FLOW", desc: "Progress through missions like an intelligence analyst on assignment." },
//     { icon: "◎", title: "CASE SYSTEM", desc: "Your learning path is your case file. Every concept a new lead." },
//     { icon: "▣", title: "LIVE FEEDBACK", desc: "Instant output. See your code run in real-time terminal output." },
//     { icon: "◆", title: "ZERO FILLER", desc: "No fluff. Pure signal. Every lesson is mission-critical intel." },
//   ];
//   return (
//     <div style={{ marginBottom: 60 }}>
//       <div style={{ fontSize: 8, letterSpacing: 5, color: "#2a3548", fontFamily: F.hud, marginBottom: 24 }}>// INTEL BRIEF — WHY VISUOSLAYER</div>
//       <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 2 }}>
//         {items.map((it, i) => <FeatureItem key={it.title} item={it} idx={i} />)}
//       </div>
//     </div>
//   );
// }

// // ─── HERO BG ─────────────────────────────────────────────────────────────────
// function HeroBG() {
//   const cvs = useRef(null);
//   useEffect(() => {
//     const c = cvs.current; if (!c) return;
//     const ctx = c.getContext("2d");
//     let W, H;
//     const resize = () => { W = c.width = c.offsetWidth; H = c.height = c.offsetHeight; };
//     resize(); window.addEventListener("resize", resize);
//     const HEX_R = 42;
//     const buildHexes = () => { const list = []; const cols = Math.ceil(W / (HEX_R * 1.732)) + 2, rows = Math.ceil(H / (HEX_R * 1.5)) + 2; for (let r = 0; r < rows; r++) for (let col = 0; col < cols; col++) { const ox = r % 2 === 0 ? 0 : HEX_R * .866; list.push({ x: col * HEX_R * 1.732 + ox, y: r * HEX_R * 1.5, pulse: Math.random() * 6, speed: .003 + Math.random() * .006, bright: Math.random() }); } return list; };
//     let hexes = buildHexes(); window.addEventListener("resize", () => { hexes = buildHexes(); });
//     const CHARS = "01アイウエオ<>{}[]#@";
//     const streams = Array.from({ length: 28 }, () => ({ x: Math.random() * 2000, y: Math.random() * 900, speed: .4 + Math.random() * .8, chars: Array.from({ length: 9 }, () => CHARS[Math.floor(Math.random() * CHARS.length)]), op: .03 + Math.random() * .09, timer: 0 }));
//     let af, time = 0;
//     const draw = () => { ctx.clearRect(0, 0, W, H); time += .008; const hb = 180 + Math.sin(time) * 30; hexes.forEach(h => { h.pulse += h.speed; const alpha = (Math.sin(h.pulse) * .5 + .5) * h.bright * .05; ctx.beginPath(); for (let i = 0; i < 6; i++) { const a = (Math.PI / 3) * i - Math.PI / 6; const px = h.x + HEX_R * .9 * Math.cos(a), py = h.y + HEX_R * .9 * Math.sin(a); i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py); } ctx.closePath(); ctx.strokeStyle = `hsla(${hb},100%,65%,${alpha})`; ctx.lineWidth = .6; ctx.stroke(); }); streams.forEach(s => { s.timer++; if (s.timer % 7 === 0) { s.chars.shift(); s.chars.push(CHARS[Math.floor(Math.random() * CHARS.length)]); } s.y += s.speed; if (s.y > H + 130) { s.y = -130; s.x = Math.random() * W; } s.chars.forEach((ch, i) => { ctx.font = "10px 'Space Mono',monospace"; ctx.fillStyle = `hsla(${hb},100%,70%,${s.op * ((s.chars.length - i) / s.chars.length)})`; ctx.fillText(ch, s.x, s.y + i * 13); }); }); [[0, 0], [W, 0], [0, H], [W, H]].forEach(([bx, by]) => { const sx = bx === 0 ? 1 : -1, sy = by === 0 ? 1 : -1; ctx.strokeStyle = `hsla(${hb},100%,65%,0.12)`; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(bx + sx * 18, by + sy * 1); ctx.lineTo(bx + sx * 70, by + sy * 1); ctx.stroke(); ctx.beginPath(); ctx.moveTo(bx + sx * 1, by + sy * 18); ctx.lineTo(bx + sx * 1, by + sy * 70); ctx.stroke(); }); af = requestAnimationFrame(draw); };
//     af = requestAnimationFrame(draw);
//     return () => { cancelAnimationFrame(af); window.removeEventListener("resize", resize); };
//   }, []);
//   return <canvas ref={cvs} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 1 }} />;
// }

// // ─── HERO ─────────────────────────────────────────────────────────────────────
// function Hero({ eyeRef, h1Ref, subRef }) {
//   const reticleRef = useRef(null), hRef = useRef(null);
//   const orb1 = useRef(null), orb2 = useRef(null);
//   const scrollArrow = useRef(null), dividerRef = useRef(null), statusRef = useRef(null);
//   const [typed, setTyped] = useState("");
//   const STATUS = "AWAITING_SELECTION...";

//   useEffect(() => { let i = 0; const iv = setInterval(() => { setTyped(STATUS.slice(0, i)); i = i >= STATUS.length + 6 ? 0 : i + 1; }, 90); return () => clearInterval(iv); }, []);

//   useEffect(() => {
//     if (orb1.current && orb2.current) {
//       ScrollTrigger.create({
//         trigger: hRef.current, start: "top top", end: "bottom top", scrub: 1.2,
//         onUpdate: (self) => {
//           const y = self.progress * 180;
//           gsap.to(orb1.current, { y: -30 - y * 0.6, x: 70 - y * 0.3, scale: 1 + self.progress * 0.2, duration: 0.1 });
//           gsap.to(orb2.current, { y: 20 + y * 0.8, x: -60 + y * 0.4, scale: 1 - self.progress * 0.15, duration: 0.1 });
//         }
//       });
//     }
//   }, []);

//   useEffect(() => {
//     const words = h1Ref.current?.querySelectorAll(".word");
//     if (words && words.length) {
//       words.forEach((word, idx) => {
//         ScrollTrigger.create({
//           trigger: hRef.current, start: "top top", end: "bottom top", scrub: 1,
//           onUpdate: (self) => {
//             const progress = self.progress;
//             gsap.to(word, { x: (idx - 1) * 40 * progress, y: -20 * progress, rotation: idx === 1 ? 0 : (idx === 0 ? -8 : 8) * progress, duration: 0.1, ease: "none" });
//           }
//         });
//       });
//     }
//   }, [h1Ref]);

//   useEffect(() => {
//     const section = hRef.current; if (!section) return;
//     ScrollTrigger.create({
//       trigger: section, start: "top top", end: "85% top", scrub: 0.8,
//       onUpdate: (self) => {
//         const p = self.progress;
//         const heroContent = section.querySelector(".hero-content");
//         if (heroContent) {
//           gsap.set(heroContent, {
//             filter: `blur(${p * 14}px) brightness(${1 + p * 0.7}) saturate(${1 - p * 0.6})`,
//             opacity: 1 - p * 0.9,
//             y: -p * 100,
//             scale: 1 - p * 0.04,
//           });
//         }
//       }
//     });
//   }, []);

//   useEffect(() => {
//     if (scrollArrow.current) gsap.to(scrollArrow.current, { y: 10, duration: 1.4, ease: "sine.inOut", yoyo: true, repeat: -1 });
//     if (dividerRef.current) gsap.from(dividerRef.current, { scaleX: 0, duration: 1.4, ease: "power3.out", delay: .6, scrollTrigger: { trigger: dividerRef.current, start: "top 95%", once: true } });
//     if (statusRef.current) gsap.from(statusRef.current, { x: 30, opacity: 0, duration: .9, ease: "power3.out", delay: .9 });
//   }, []);

//   useEffect(() => {
//     const el = hRef.current; if (!el) return;
//     const move = e => { const rect = el.getBoundingClientRect(); gsap.to(reticleRef.current, { x: e.clientX - rect.left, y: e.clientY - rect.top, duration: .5, ease: "power2.out" }); };
//     el.addEventListener("mousemove", move); return () => el.removeEventListener("mousemove", move);
//   }, []);

//   return (
//     <section ref={hRef} style={{ width: "100%", minHeight: "100vh", padding: "80px clamp(20px,5vw,80px) 0", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "center", boxSizing: "border-box" }}>
//       <HeroBG />
//       <PremiumGSAPOrb />
//       <div ref={orb1} style={{ position: "absolute", top: "15%", right: "6%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle,rgba(0,247,255,.07) 0%,transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
//       <div ref={orb2} style={{ position: "absolute", bottom: "10%", left: "3%", width: 440, height: 440, borderRadius: "50%", background: "radial-gradient(circle,rgba(0,247,255,.045) 0%,transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
//       <div ref={reticleRef} style={{ position: "absolute", pointerEvents: "none", width: 88, height: 88, marginLeft: -44, marginTop: -44, zIndex: 8, opacity: .3, top: 0, left: 0 }}>
//         <svg width="88" height="88" viewBox="0 0 88 88">
//           <circle cx="44" cy="44" r="42" fill="none" stroke="#00f7ff" strokeWidth=".5" strokeDasharray="5 9" />
//           <circle cx="44" cy="44" r="5" fill="none" stroke="#00f7ff" strokeWidth="1" />
//           <line x1="0" y1="44" x2="28" y2="44" stroke="#00f7ff" strokeWidth=".6" />
//           <line x1="60" y1="44" x2="88" y2="44" stroke="#00f7ff" strokeWidth=".6" />
//           <line x1="44" y1="0" x2="44" y2="28" stroke="#00f7ff" strokeWidth=".6" />
//           <line x1="44" y1="60" x2="44" y2="88" stroke="#00f7ff" strokeWidth=".6" />
//         </svg>
//       </div>

//       <div className="hero-content" style={{ position: "relative", zIndex: 10, willChange: "transform, filter, opacity" }}>
//         <div ref={eyeRef} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28, fontFamily: F.hud, fontSize: 8, letterSpacing: 5, color: "#00f7ffaa", flexWrap: "wrap" }}>
//           <span style={{ width: 36, height: 2, background: "linear-gradient(90deg,#00f7ff,transparent)", display: "inline-block" }} />
//           VISUOSLAYER // CASE #2026 // LANG-SELECT
//           <span style={{ width: 36, height: 2, background: "linear-gradient(270deg,#00f7ff,transparent)", display: "inline-block" }} />
//         </div>

//         <h1 ref={h1Ref} style={{ lineHeight: .82, fontFamily: F.display, fontWeight: 400, fontSize: "clamp(72px,14vw,220px)", letterSpacing: "0.02em", width: "100%", wordBreak: "break-word" }}>
//           <span className="word" style={{ display: "block", color: "transparent", WebkitTextStroke: "1px rgba(200,216,240,.3)", lineHeight: .9 }}>BEGINNER?</span>
//           <span className="word" id="select-word" style={{ display: "block", color: "#00f7ff", textShadow: "0 0 160px rgba(0,247,255,.8),0 0 60px rgba(0,247,255,.5)", animation: "floatY 3.8s ease-in-out infinite", position: "relative", lineHeight: .9 }}>
//             <span style={{ fontFamily: F.hud, letterSpacing: "0.04em", fontWeight: 900 }}>SELECT</span>
//             <span style={{ position: "absolute", left: 0, top: "52%", width: "100%", height: 3, background: "linear-gradient(90deg,transparent 0%,#00f7ff88 30%,#00f7ff 50%,#00f7ff88 70%,transparent 100%)", animation: "scanH 2.8s cubic-bezier(.4,0,.2,1) infinite", pointerEvents: "none", boxShadow: "0 0 18px #00f7ff" }} />
//           </span>
//           <span className="word" style={{ display: "block", color: "#c8d8f0", lineHeight: .9 }}>LANGUAGE</span>
//         </h1>

//         <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 40, marginTop: 56, flexWrap: "wrap" }}>
//           <div style={{ display: "flex", gap: 24, alignItems: "flex-start", maxWidth: 520, flex: "1 1 300px" }}>
//             <div style={{ width: 2, minHeight: 90, background: "linear-gradient(to bottom,#00f7ff,transparent)", flexShrink: 0, marginTop: 4, boxShadow: "0 0 12px #00f7ffaa" }} />
//             <p ref={subRef} style={{ fontSize: "clamp(11px,2vw,12px)", color: "#607080", letterSpacing: 1, lineHeight: 2, fontFamily: F.mono, wordBreak: "break-word" }}>
//               Three encrypted files. Each contains the fundamentals of a programming language.
//               Select one to begin decryption. Your mission starts now.
//               <br /><br /><span style={{ color: "#304050" }}>// VISUOSLAYER by SAIF — CASE #2026</span>
//             </p>
//           </div>
//           <div ref={statusRef} style={{ flexShrink: 0, border: "1px solid #2a3a4a", padding: "clamp(10px, 2.5vw, 14px) clamp(12px, 3vw, 18px)", fontFamily: F.hud, fontSize: 8, lineHeight: 1.8, color: "#2a4050", minWidth: 220, background: "rgba(5,7,14,.85)", backdropFilter: "blur(12px)", flex: "0 0 auto", position: "relative", overflow: "hidden" }}>
//             <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,transparent,#00f7ff88,transparent)" }} />
//             <div style={{ color: "#2a3548", fontSize: 7, letterSpacing: 4, marginBottom: 8 }}>SYSTEM STATUS</div>
//             {[["KERNEL", "OVERRIDE_ACTIVE"], ["FILES", "3 / UNLOCKED"], ["OPERATOR", "SAIF"], ["SIGNAL", "99%"]].map(([k, v]) => (
//               <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 24, letterSpacing: 2 }}>
//                 <span style={{ color: "#1e2535", fontSize: 7 }}>{k}</span>
//                 <span style={{ color: "#4a6a80", fontSize: 7 }}>{v}</span>
//               </div>
//             ))}
//             <div style={{ marginTop: 10, borderTop: "1px solid #1a2030", paddingTop: 8, color: "#00f7ff77", fontSize: 8, letterSpacing: 2, fontFamily: F.mono }}>
//               &gt; {typed}<span style={{ animation: "bl 1s step-end infinite", color: "#00f7ffaa" }}>_</span>
//             </div>
//           </div>
//         </div>

//         <div ref={dividerRef} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 52, paddingTop: 16, borderTop: "2px solid rgba(0,247,255,0.4)", fontFamily: F.hud, fontSize: 7, letterSpacing: 2, color: "#2a4050", flexWrap: "wrap", gap: 12, transformOrigin: "left", boxShadow: "0 -4px 15px rgba(0,247,255,0.1)" }}>
//           <span>CAM_01 · LAT 23.0225°N · LONG 72.5714°E</span>
//           <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
//             {[0, 1, 2, 3, 4].map(i => <div key={i} style={{ width: 24, height: 2, background: i === 2 ? "#00f7ffaa" : "#2a4050", boxShadow: i === 2 ? "0 0 10px #00f7ff" : "none" }} />)}
//           </div>
//           <span>ALT 53M · <span style={{ color: "#00f7ff55", fontFamily: F.mono }}>{typed}<span style={{ animation: "bl 1s step-end infinite", color: "#00f7ff66" }}>_</span></span></span>
//         </div>
//       </div>

//       <div ref={scrollArrow} style={{ position: "absolute", bottom: 36, left: "50%", transform: "translateX(-50%)", zIndex: 20, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, fontFamily: F.hud, fontSize: 6, letterSpacing: 5, color: "#00f7ffaa" }}>
//         <span>SCROLL</span>
//         <div style={{ width: 2, height: 28, background: "linear-gradient(to bottom,#00f7ffcc,transparent)", boxShadow: "0 0 8px #00f7ff" }} />
//         <svg width="10" height="6" viewBox="0 0 12 8" fill="none"><path d="M1 1L6 7L11 1" stroke="#00f7ff" strokeWidth="1.5" strokeLinecap="round" /></svg>
//       </div>

//       <style>{`
//         @keyframes scanH{0%{transform:translateX(-110%)}100%{transform:translateX(110%)}}
//         @keyframes ripFade{from{opacity:1}to{opacity:0}}
//         @keyframes cardScan{0%{top:-1px}100%{top:100%}}
//         @keyframes btnShine{0%{transform:translateX(-100%)}100%{transform:translateX(200%)}}
//       `}</style>
//     </section>
//   );
// }

// // ─── MARQUEE SECTION ─────────────────────────────────────────────────────────
// function PremiumMarqueeSection() {
//   return (
//     <div style={{ overflow: "hidden", margin: "60px 0 0", position: "relative" }}>
//       <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none", background: "linear-gradient(180deg,rgba(0,247,255,0.025) 0%,rgba(0,0,0,0) 40%,rgba(0,0,0,0) 60%,rgba(255,179,71,0.025) 100%)" }} />
//       <ScrollMarquee text="VISUOSLAYER - SAIF - " direction={1} accent="#00f7ff" dim="#0d1e2c" index={0} />
//       <div style={{ position: "relative", height: 2, background: "linear-gradient(90deg,transparent,#00f7ff33,#00f7ff88,#00f7ff33,transparent)", zIndex: 5, overflow: "visible" }}>
//         <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%) rotate(45deg)", width: 5, height: 5, background: "#00f7ff", boxShadow: "0 0 10px 2px #00f7ff", zIndex: 6 }} />
//         <div style={{ position: "absolute", top: "-1px", left: 0, right: 0, height: 4, background: "linear-gradient(90deg,transparent,#00f7ffcc,transparent)", filter: "blur(2px)", animation: "dividerSweep 3s ease-in-out infinite", pointerEvents: "none" }} />
//       </div>
//       <ScrollMarquee text="C  - PYTHON - JAVA -" direction={-1} accent="#ffb347" dim="#1a1400" index={1} />
//       <style>{`@keyframes dividerSweep{0%{transform:translateX(-120%);opacity:0}20%{opacity:1}80%{opacity:1}100%{transform:translateX(120%);opacity:0}}`}</style>
//     </div>
//   );
// }

// // ─── HUD BAR ──────────────────────────────────────────────────────────────────
// function HudBar({ items }) {
//   return (
//     <div style={{ display: "flex", gap: 0, marginBottom: 48, border: "1px solid #1a2030", flexWrap: "wrap" }}>
//       {items.map(([k, v, c], i, a) => (
//         <div key={k} className="hud-cell" style={{ padding: "clamp(8px, 1.8vw, 12px) clamp(12px, 2.5vw, 20px)", borderRight: i < a.length - 1 ? "1px solid #1a2030" : "none", fontFamily: F.hud, fontSize: 7, letterSpacing: 2, background: "rgba(5,7,14,.7)", display: "flex", flexDirection: "column", gap: 4, flexShrink: 0 }}>
//           <span style={{ color: "#253040" }}>{k}</span>
//           <span style={{ color: c, textShadow: `0 0 16px ${c}88` }}>{v}</span>
//         </div>
//       ))}
//     </div>
//   );
// }

// // ─── MAIN PAGE ────────────────────────────────────────────────────────────────
// export default function Page() {
//   const router = useRouter();
//   const [booted, setBooted] = useState(false);
//   const [vis, setVis] = useState(false);
//   const [activeLang, setActiveLang] = useState(null);

//   const eyeRef = useRef(null);
//   const h1Ref = useRef(null);
//   const subRef = useRef(null);

//   useEffect(() => {
//     let lenis;
//     const initLenis = async () => {
//       try {
//         const { default: Lenis } = await import("@studio-freight/lenis");
//         lenis = new Lenis({
//           duration: 1.2,
//           easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
//           smoothWheel: true, wheelMultiplier: 0.8, touchMultiplier: 1.5,
//           infinite: false, gestureOrientation: "vertical",
//         });
//         const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
//         requestAnimationFrame(raf);
//         lenis.on("scroll", ScrollTrigger.update);
//         ScrollTrigger.scrollerProxy(document.body, {
//           scrollTop(value) { return arguments.length ? lenis.scrollTo(value) : lenis.scroll; },
//           getBoundingClientRect() { return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight }; },
//           pinType: document.body.style.transform ? "transform" : "fixed",
//         });
//         ScrollTrigger.refresh();
//         window.addEventListener("resize", () => ScrollTrigger.refresh());
//       } catch (error) { console.warn("Lenis failed to load:", error); }
//     };
//     initLenis();
//     return () => { lenis?.destroy(); ScrollTrigger.killAll(); };
//   }, []);

//   useEffect(() => {
//     const onM = e => {
//       const x = (e.clientX / window.innerWidth - .5) * 18, y = (e.clientY / window.innerHeight - .5) * 10;
//       if (h1Ref.current) gsap.to(h1Ref.current, { x, y, duration: .9, ease: "power2.out" });
//     };
//     window.addEventListener("mousemove", onM);
//     return () => window.removeEventListener("mousemove", onM);
//   }, []);

//   useEffect(() => {
//     if (!booted) return;
//     setTimeout(() => setVis(true), 80);
//     const tl = gsap.timeline({ delay: .3 });
//     if (eyeRef.current) tl.from(eyeRef.current, { opacity: 0, y: 24, duration: .7, ease: "power3.out" });
//     if (h1Ref.current) tl.from(h1Ref.current.querySelectorAll(".word"), { opacity: 0, y: 80, stagger: .12, duration: 1, ease: "power3.out" }, "-=.4");
//     if (subRef.current) tl.from(subRef.current, { opacity: 0, y: 20, duration: .7, ease: "power2.out" }, "-=.5");
//   }, [booted]);

//   const handleSelect = useCallback(lang => {
//     setActiveLang(lang.label);
//     const fl = document.createElement("div");
//     Object.assign(fl.style, { position: "fixed", inset: 0, zIndex: 9000, background: lang.accent, opacity: "0", pointerEvents: "none" });
//     document.body.appendChild(fl);
//     gsap.timeline().to(fl, { opacity: .22, duration: .2 }).to(fl, { opacity: 0, duration: .45 }).then(() => { fl.remove(); router.push(lang.route); });
//   }, [router]);

//   const HUD_ITEMS = [
//     ["ACTIVE_CASE", "LANG-SELECT", "#00f7ff"],
//     ["FILES_FOUND", "3", "#ffb347"],
//     ["CLEARANCE", "GRANTED", "#39ff14"],
//     ["OPERATOR", "SAIF", "#c8d8f0"],
//     ["SYSTEM", "VISUOSLAYER", "#506070"],
//   ];

//   return (
//     <>
//       <style dangerouslySetInnerHTML={{
//         __html: `
//         ${FONT_LINK}
//         *{box-sizing:border-box;margin:0;padding:0;cursor:none!important}
//         html,body{background:#05060e;color:#c8d8f0;font-family:${F.mono};overflow-x:hidden;overflow-wrap:break-word;word-break:break-word}
//         html.lenis,html.lenis body{height:auto}
//         .lenis.lenis-smooth [data-lenis-prevent]{overscroll-behavior:contain}
//         @keyframes floatY{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}
//         @keyframes bl{0%,100%{opacity:1}50%{opacity:0}}
//         ::selection{background:#00f7ff20;color:#00f7ff}
//         ::-webkit-scrollbar{width:3px}
//         ::-webkit-scrollbar-track{background:#05060e}
//         ::-webkit-scrollbar-thumb{background:#1a2030}
//         ::-webkit-scrollbar-thumb:hover{background:#00f7ff66}
//         @media(max-width:640px){footer{flex-direction:column;text-align:center}}
//       `}} />

//       <Cursor />
//       {!booted && <Boot onDone={() => setBooted(true)} />}
//       {booted && <><HUD activeLang={activeLang} /><ScrollBar /></>}

//       <div style={{ position: "fixed", inset: 0, background: "#05060e", zIndex: -5 }} />
//       <Particles />
//       <svg style={{ position: "fixed", inset: 0, width: "100%", height: "100%", opacity: .04, pointerEvents: "none", zIndex: 1 }}>
//         <filter id="gr"><feTurbulence type="fractalNoise" baseFrequency=".68" numOctaves="4" stitchTiles="stitch" /><feColorMatrix type="saturate" values="0" /></filter>
//         <rect width="100%" height="100%" filter="url(#gr)" />
//       </svg>
//       <div style={{ position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none", backgroundImage: "radial-gradient(circle,rgba(0,247,255,.08) 1px,transparent 1px)", backgroundSize: "44px 44px", maskImage: "radial-gradient(ellipse 65% 65% at center,black 10%,transparent 78%)", WebkitMaskImage: "radial-gradient(ellipse 65% 65% at center,black 10%,transparent 78%)" }} />
//       <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 2, background: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.065) 2px,rgba(0,0,0,.065) 4px)" }} />
//       <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 3, background: "radial-gradient(ellipse at center,transparent 40%,rgba(5,6,14,.88) 100%)" }} />

//       <main style={{ position: "relative", zIndex: 10, paddingTop: 80, opacity: vis ? 1 : 0, transition: "opacity 1s cubic-bezier(.4,0,.2,1)" }}>

//         {/* ── HERO ── */}
//         <Hero eyeRef={eyeRef} h1Ref={h1Ref} subRef={subRef} />

//         {/* ── MARQUEE ── */}
//         <CinematicSection id="marquee-section" enterFX="glitch-slam" exitFX="static-burst" enterStart="top 88%" exitStart="bottom 15%">
//           <PremiumMarqueeSection />
//         </CinematicSection>

//         <section style={{ maxWidth: 1280, margin: "0 auto", padding: "80px 5vw 140px" }}>

//           {/* ── TICKER ── */}
//           <CinematicSection id="ticker-section" enterFX="scanline-wipe" exitFX="scan-erase" enterStart="top 87%" exitStart="bottom 18%">
//             <Ticker />
//           </CinematicSection>

//           {/* ── STATS ── */}
//           <CinematicSection id="stats-section" enterFX="iris-open" exitFX="implode" enterStart="top 85%" exitStart="bottom 16%">
//             <StatsStrip />
//           </CinematicSection>

//           {/* ── HUD BAR ── */}
//           <CinematicSection id="hud-bar-section" enterFX="light-sweep" exitFX="fold-up" enterStart="top 87%" exitStart="bottom 16%">
//             <HudBar items={HUD_ITEMS} />
//           </CinematicSection>

//           {/* ── CARDS LABEL ── */}
//           <CinematicSection id="cards-label" enterFX="data-stream" exitFX="glitch-out" enterStart="top 89%" exitStart="bottom 25%">
//             <div style={{ marginBottom: 32, display: "flex", alignItems: "center", gap: 16 }}>
//               <div style={{ width: 3, height: 28, background: "linear-gradient(to bottom, #00f7ff, transparent)" }} />
//               <span style={{ fontFamily: F.hud, fontSize: 8, letterSpacing: 5, color: "#2a3548" }}>// SELECT TARGET LANGUAGE</span>
//               <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, #00f7ff22, transparent)" }} />
//               <span style={{ fontFamily: F.hud, fontSize: 7, letterSpacing: 3, color: "#1a2535" }}>3 FILES FOUND</span>
//             </div>
//           </CinematicSection>

//           {/* ── CARDS GRID ── */}
//           <CinematicSection id="cards-grid" enterFX="shatter-in" exitFX="shatter-apart" enterStart="top 83%" exitStart="bottom 10%">
//             <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 3, marginBottom: 80, perspective: "1200px" }}>
//               {LANGUAGES.map((lang, i) => <Card key={lang.id} lang={lang} index={i} onSelect={handleSelect} />)}
//             </div>
//           </CinematicSection>

//           {/* ── FEATURES ── */}
//           <CinematicSection id="features-section" enterFX="surge" exitFX="slide-left" enterStart="top 85%" exitStart="bottom 18%">
//             <HorizontalFeatures />
//           </CinematicSection>

//           {/* ── WARNING ── */}
//           <CinematicSection id="warning-section" enterFX="vhs-glitch" exitFX="vhs-collapse" enterStart="top 90%" exitStart="bottom 12%">
//             <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 18px", border: "1px solid #ff3366aa", background: "rgba(255,51,102,.035)", fontFamily: F.mono, fontSize: 8, color: "#3a5060", letterSpacing: 2, position: "relative", overflow: "hidden", flexWrap: "wrap" }}>
//               <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,#ff336600,#ff3366aa,#ff336600)" }} />
//               <span style={{ color: "#ff3366", fontSize: 11, animation: "bl 2s step-end infinite", flexShrink: 0 }}>!</span>
//               WARNING: Once a language file is opened, full immersion begins. Proceed carefully.
//               <span style={{ color: "#2a4050", marginLeft: "auto", flexShrink: 0, fontFamily: F.hud, fontSize: 7 }}> // VISUOSLAYER OS — AUTHORISED BY SAIF</span>
//             </div>
//           </CinematicSection>

//         </section>

//         {/* ── FOOTER ── */}
//         <CinematicSection id="footer-section" enterFX="light-sweep" exitFX="dissolve" enterStart="top 95%" exitStart="bottom 5%">
//           <footer style={{ borderTop: "2px solid rgba(0,247,255,0.3)", maxWidth: 1280, margin: "0 auto", padding: "20px 5vw", display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: F.hud, fontSize: 7, color: "#2a4050", letterSpacing: 3, flexWrap: "wrap", gap: 10 }}>
//             <span style={{ fontFamily: F.display, fontSize: 14, letterSpacing: 6, color: "#1a3040" }}>VISUOSLAYER</span>
//             <span>LANG_FILES — CASE #2026</span>
//             <span>ALL FILES ENCRYPTED — AUTHORISED PERSONNEL ONLY</span>
//             <span style={{ color: "#00f7ff44" }}>SYS.STABLE</span>
//           </footer>
//         </CinematicSection>

//       </main>
//     </>
//   );
// }
