// "use client";

// import { useEffect, useRef, useState, useCallback } from "react";
// import { useRouter } from "next/navigation";
// import gsap from "gsap";
// import { ScrollTrigger } from "gsap/ScrollTrigger";

// if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

// // ─── DATA ────────────────────────────────────────────────────────────────────

// const BOOT_NORMAL = [
//   { t: "Memory: 256 GiB DDR5 ECC Registered @ 4800 MT/s",          c: "dim" },
//   { t: "Storage: NVMe Samsung PM9A3 3.84TB  [GPT, EXT4]",          c: "dim" },
//   { t: "Network: eth0 10.0.4.22/24  gw 10.0.4.1",                  c: "dim" },
//   { t: "  -> C_PROGRAM ............ [DECRYPTED]  1.2ms",            c: "ok"  },
//   { t: "  -> PYTHON_CORE ....... [DECRYPTED]  0.8ms",               c: "ok"  },
//   { t: "  -> JAVA_RUNTIME ...... [DECRYPTED]  1.1ms",               c: "ok"  },
//   { t: "Initialising VisuoSlayer security layer: [ OK ]",           c: "ok"  },
// ];

// const BOOT_ERROR = [
//   { t: "!! CRITICAL: Memory fault at 0x7FFE2C4A — ECC correction failed. SYSTEM HALT.", c: "err" },
// ];

// const BOOT_RECOVERY = [
//   { t: "SELECT YOUR TARGET LANGUAGE", c: "hd" },
// ];

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

// // ─── CURSOR (ENHANCED) ───────────────────────────────────────────────────────

// function Cursor() {
//   const dot  = useRef(null);
//   const ring = useRef(null);
//   const trailRef = useRef(null);
//   const mp   = useRef({ x: -200, y: -200 });
//   const rp   = useRef({ x: -200, y: -200 });
//   const trailPos = useRef({ x: -200, y: -200 });
//   const raf  = useRef(null);
//   const big  = useRef(false);
//   const scrollProgress = useRef(0);

//   useEffect(() => {
//     const mv = e => {
//       mp.current = { x: e.clientX, y: e.clientY };
//       big.current = !!document.elementFromPoint(e.clientX, e.clientY)?.closest("[data-cur]");
//     };
//     window.addEventListener("mousemove", mv);
    
//     const updateScrollProgress = () => {
//       const winScroll = window.scrollY;
//       const height = document.documentElement.scrollHeight - window.innerHeight;
//       scrollProgress.current = winScroll / height;
//     };
//     window.addEventListener("scroll", updateScrollProgress);
//     updateScrollProgress();
    
//     const loop = () => {
//       rp.current.x += (mp.current.x - rp.current.x) * 0.09;
//       rp.current.y += (mp.current.y - rp.current.y) * 0.09;
//       trailPos.current.x += (rp.current.x - trailPos.current.x) * 0.05;
//       trailPos.current.y += (rp.current.y - trailPos.current.y) * 0.05;
      
//       const sz = big.current ? 34 : 20;
//       const hue = 180 + scrollProgress.current * 180;
//       const glowColor = `hsla(${hue}, 100%, 65%, 0.8)`;
//       if (dot.current) {
//         dot.current.style.transform = `translate(${mp.current.x - 4}px,${mp.current.y - 4}px)`;
//         dot.current.style.background = `radial-gradient(circle, ${glowColor}, #00f7ff)`;
//       }
//       if (ring.current) {
//         ring.current.style.transform = `translate(${rp.current.x - sz}px,${rp.current.y - sz}px)`;
//         ring.current.style.width = ring.current.style.height = `${sz * 2}px`;
//         ring.current.style.borderColor = `hsla(${hue}, 100%, 65%, 0.6)`;
//       }
//       if (trailRef.current) {
//         trailRef.current.style.transform = `translate(${trailPos.current.x - 12}px,${trailPos.current.y - 12}px)`;
//       }
//       raf.current = requestAnimationFrame(loop);
//     };
//     raf.current = requestAnimationFrame(loop);
//     return () => { 
//       window.removeEventListener("mousemove", mv);
//       window.removeEventListener("scroll", updateScrollProgress);
//       cancelAnimationFrame(raf.current);
//     };
//   }, []);

//   return (
//     <>
//       <div ref={dot} style={{ position:"fixed",top:0,left:0,zIndex:99999,pointerEvents:"none",width:8,height:8,borderRadius:"50%",background:"#00f7ff",boxShadow:"0 0 12px #00f7ff",willChange:"transform",transition:"background 0.2s" }} />
//       <div ref={ring} style={{ position:"fixed",top:0,left:0,zIndex:99998,pointerEvents:"none",width:40,height:40,borderRadius:"50%",border:"1px solid rgba(0,247,255,0.6)",willChange:"transform",transition:"width .38s cubic-bezier(.34,1.56,.64,1),height .38s cubic-bezier(.34,1.56,.64,1),border-color 0.2s" }} />
//       <div ref={trailRef} style={{ position:"fixed",top:0,left:0,zIndex:99997,pointerEvents:"none",width:24,height:24,borderRadius:"50%",background:"radial-gradient(circle, rgba(0,247,255,0.2) 0%, rgba(0,247,255,0) 70%)",willChange:"transform",filter:"blur(4px)" }} />
//     </>
//   );
// }

// // ─── BOOT (UNCHANGED) ───────────────────────────────────────────────────────

// function Boot({ onDone }) {
//   const [lines,   setLines]   = useState([]);
//   const [pct,     setPct]     = useState(0);
//   const [isErr,   setIsErr]   = useState(false);
//   const [frozen,  setFrozen]  = useState(false);
//   const [exiting, setExiting] = useState(false);
//   const termRef = useRef(null);
//   const bodyRef = useRef(null);
//   const doneRef = useRef(onDone);
//   useEffect(() => { doneRef.current = onDone; }, [onDone]);

//   useEffect(() => {
//     if (termRef.current)
//       gsap.from(termRef.current, { y: 36, opacity: 0, duration: .9, ease: "power3.out", delay: .3 });

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
//           .to(termRef.current, { x: -9, duration: .04 })
//           .to(termRef.current, { x:  8, duration: .04 })
//           .to(termRef.current, { x: -6, duration: .04 })
//           .to(termRef.current, { x:  5, duration: .04 })
//           .to(termRef.current, { x: -3, duration: .04 })
//           .to(termRef.current, { x:  0, duration: .04 });
//       }
//       setLines(l => [...l, safeLine(BOOT_ERROR[0])]);
//       setPct(88); scroll();
//       setFrozen(true);
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
//             else {
//               tid = setTimeout(() => {
//                 setExiting(true);
//                 setTimeout(() => doneRef.current?.(), 900);
//               }, 500);
//             }
//           };
//           requestAnimationFrame(animPct);
//           return;
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

//   const col = { sys:"#c8d8f0", dim:"#4a5f7a", ok:"#39ff14", err:"#ff3366", wrn:"#ffb347", hd:"#ffb347" };

//   return (
//     <div style={{ position:"fixed",inset:0,zIndex:1000,background:"#05060e",display:"flex",alignItems:"center",justifyContent:"center",opacity:exiting?0:1,transition:exiting?"opacity .9s cubic-bezier(.4,0,.2,1)":"none",pointerEvents:exiting?"none":"all" }}>
//       <svg style={{ position:"absolute",inset:0,width:"100%",height:"100%",opacity:.05,pointerEvents:"none" }}>
//         <filter id="bn"><feTurbulence type="fractalNoise" baseFrequency=".65" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>
//         <rect width="100%" height="100%" filter="url(#bn)"/>
//       </svg>
//       <div style={{ position:"absolute",inset:0,pointerEvents:"none",background:"repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.12) 2px,rgba(0,0,0,.12) 4px)" }} />

//       <div style={{ width:"min(700px,93vw)",position:"relative" }}>
//         <div style={{ marginBottom:26,display:"flex",alignItems:"flex-start",justifyContent:"space-between" }}>
//           <div style={{ display:"flex",gap:14,alignItems:"center" }}>
//             <div style={{ width:2,height:44,background:"linear-gradient(to bottom,#00f7ff,#00f7ff00)" }} />
//             <div>
//               <div style={{ color:"#2a3548",fontSize:9,letterSpacing:5,fontFamily:"'Fira Code',monospace",marginBottom:3 }}>VISUOSLAYER // SAIF — TOP SECRET</div>
//               <div style={{ color:"#c8d8f0",fontSize:22,fontFamily:"'Fira Code',monospace",fontWeight:800,letterSpacing:3 }}>VisuoSlayer !</div>
//             </div>
//           </div>
//           <div style={{ fontFamily:"'Fira Code',monospace",fontSize:9,color:"#2a3548",letterSpacing:2,textAlign:"right",lineHeight:1.8 }}>
//             <div>CASE #2026</div>
//             <div style={{ color:"#ff3366",display:"flex",alignItems:"center",gap:5,justifyContent:"flex-end" }}>
//               <span style={{ width:5,height:5,borderRadius:"50%",background:"#ff3366",display:"inline-block",animation:"bl 1.1s step-end infinite" }}/>REC
//             </div>
//           </div>
//         </div>

//         <div ref={termRef} style={{ border:`1px solid ${isErr?"#ff336666":"#1a2030"}`,background:isErr?"rgba(12,5,8,.98)":"rgba(5,7,14,.98)",boxShadow:isErr?"0 0 120px rgba(255,51,102,.25),inset 0 0 80px rgba(255,51,102,.08)":"0 0 60px rgba(0,247,255,.05)",transition:"border-color .35s,box-shadow .4s,background .4s" }}>
//           <div style={{ background:isErr?"#0a0508":"#080a12",borderBottom:`1px solid ${isErr?"#ff336633":"#1a2030"}`,padding:"8px 16px",display:"flex",alignItems:"center",gap:8,transition:"background .4s" }}>
//             {["#ff3366","#ffb347","#39ff14"].map(c => <span key={c} style={{ width:10,height:10,borderRadius:"50%",background:c,display:"block",opacity:.7 }}/>)}
//             <span style={{ color:isErr?"#ff336688":"#2a3548",fontSize:9,marginLeft:10,letterSpacing:2,fontFamily:"'Fira Code',monospace",transition:"color .4s" }}>
//               {isErr ? "visuoslayer@saif:~$  !! SYSTEM HALTED" : "visuoslayer@saif:~$  BOOT_SEQUENCE.sh"}
//             </span>
//           </div>

//           <div ref={bodyRef} style={{ padding:"18px 20px 14px",minHeight:220,maxHeight:"40vh",overflowY:"hidden",fontFamily:"'Fira Code',monospace",fontSize:12,lineHeight:1.7 }}>
//             {lines.map((l, i) => (
//               <div key={i} style={{ display:"flex",gap:12,marginBottom:3,color:col[l.c]||"#c8d8f0",fontWeight:l.c==="hd"||l.c==="err"?700:400,fontSize:l.c==="hd"?13:12,textShadow:l.c==="err"?"0 0 18px rgba(255,51,102,.8)":l.c==="ok"?"0 0 6px rgba(57,255,20,.2)":"none",animation:"bi .1s ease forwards" }}>
//                 <span style={{ color:l.c==="err"||l.c==="wrn"?"#ff336666":"#253040",userSelect:"none",flexShrink:0 }}>{l.c==="err"||l.c==="wrn"?"!":"$"}</span>
//                 {l.t}
//               </div>
//             ))}
//             {!frozen && (
//               <span style={{ display:"inline-block",width:8,height:13,verticalAlign:"middle",background:isErr?"#ff3366":"#00f7ff",boxShadow:isErr?"0 0 12px #ff3366":"0 0 8px #00f7ff",animation:"bl 1s step-end infinite",opacity:isErr?0:1,transition:"background .3s,opacity .3s" }}/>
//             )}
//             {frozen && (
//               <div style={{ marginTop:10,color:"#ff3366",fontFamily:"'Fira Code',monospace",fontSize:11,letterSpacing:3,textShadow:"0 0 14px rgba(255,51,102,.7)",animation:"bl 1.2s step-end infinite" }}>
//                 !! TERMINAL HALTED — AWAITING OVERRIDE...
//               </div>
//             )}
//           </div>

//           <div style={{ borderTop:`1px solid ${isErr?"#ff336622":"#1a2030"}`,padding:"12px 20px",transition:"border-color .4s" }}>
//             <div style={{ display:"flex",justifyContent:"space-between",marginBottom:7,fontSize:9,letterSpacing:3,fontFamily:"'Fira Code',monospace" }}>
//               <span style={{ color:isErr?"#ff3366":"#2a3548",transition:"color .3s" }}>
//                 {isErr ? (frozen ? "SYSTEM CRITICAL — OVERRIDE PENDING" : "OVERRIDE ACTIVE — RESUMING") : "LOADING CASE FILES"}
//               </span>
//               <span style={{ color:isErr?"#ff3366":"#00f7ff",transition:"color .3s" }}>{pct}%</span>
//             </div>
//             <div style={{ height:1,background:isErr?"#ff336618":"#1a2030",position:"relative",overflow:"hidden" }}>
//               <div style={{ position:"absolute",inset:0,background:isErr?"linear-gradient(90deg,#ff3366,#ff336688)":"linear-gradient(90deg,#00f7ff,#00f7ff55)",width:`${pct}%`,transition:"width .3s ease,background .4s",boxShadow:isErr?"0 0 18px #ff3366":"0 0 18px #00f7ff" }}/>
//               {isErr && frozen && <div style={{ position:"absolute",top:0,bottom:0,width:40,background:"linear-gradient(90deg,transparent,#ff336644,transparent)",animation:"scan 2s ease-in-out infinite" }}/>}
//             </div>
//           </div>
//         </div>

//         <div style={{ display:"flex",justifyContent:"space-between",marginTop:12,fontSize:9,color:"#1e2535",letterSpacing:2,fontFamily:"'Fira Code',monospace" }}>
//           <span>CAM_04 [REC]</span>
//           <span>VISUOSLAYER // SAIF</span>
//           <span style={{ color:isErr?"#ff336688":"#1e2535",transition:"color .3s" }}>
//             {isErr ? (frozen?"SIGNAL: CRITICAL — HALTED":"SIGNAL: OVERRIDE ACTIVE") : "SIGNAL: STABLE"}
//           </span>
//         </div>
//       </div>

//       <style>{`
//         @keyframes bl{0%,100%{opacity:1}50%{opacity:0}}
//         @keyframes bi{from{opacity:0;transform:translateX(-5px)}to{opacity:1;transform:none}}
//         @keyframes scan{0%{left:-40px}100%{left:100%}}
//       `}</style>
//     </div>
//   );
// }

// // ─── HUD (ENHANCED) ─────────────────────────────────────────────────────────

// function HUD({ activeLang }) {
//   const [time, setTime] = useState("00:00:00");
//   const ref = useRef(null);
//   useEffect(() => {
//     const iv = setInterval(() => {
//       const n = new Date();
//       setTime([n.getHours(),n.getMinutes(),n.getSeconds()].map(x=>String(x).padStart(2,"0")).join(":"));
//     }, 1000);
//     if (ref.current) gsap.from(ref.current, { y:-80,opacity:0,duration:1,ease:"power3.out",delay:.15 });
//     return () => clearInterval(iv);
//   }, []);
  
//   // Scroll-triggered HUD color shift
//   useEffect(() => {
//     const ctx = gsap.context(() => {
//       ScrollTrigger.create({
//         trigger: "body",
//         start: "top top",
//         end: "bottom bottom",
//         scrub: 1.5,
//         onUpdate: (self) => {
//           if (ref.current) {
//             const intensity = self.progress * 0.3;
//             ref.current.style.background = `rgba(5,6,14,${0.92 - intensity * 0.2})`;
//             ref.current.style.backdropFilter = `blur(${20 + intensity * 10}px)`;
//           }
//         },
//       });
//     });
//     return () => ctx.revert();
//   }, []);
  
//   return (
//     <div ref={ref} style={{ position:"fixed",top:0,left:0,right:0,zIndex:100,display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 5vw",background:"rgba(5,6,14,.92)",borderBottom:"1px solid #1a2030",backdropFilter:"blur(20px)",fontFamily:"'Fira Code',monospace",fontSize:10,letterSpacing:2,transition:"background 0.2s, backdrop-filter 0.2s" }}>
//       <div style={{ display:"flex",gap:"clamp(12px,3vw,24px)",alignItems:"center",flexWrap:"wrap" }}>
//         <div style={{ display:"flex",alignItems:"center",gap:8 }}>
//           <span style={{ width:6,height:6,borderRadius:"50%",background:"#00f7ff",display:"block",boxShadow:"0 0 10px #00f7ff",animation:"hp 2.5s ease-in-out infinite" }}/>
//           <span style={{ color:"#c8d8f0",fontWeight:800,letterSpacing:4 }}>VISUOSLAYER</span>
//         </div>
//         <span style={{ color:"#1a2030" }}>|</span>
//         <span style={{ color:"#3a4558" }}>LANG_FILES <span style={{ color:"#00f7ff" }}>SAIF</span></span>
//       </div>
//       <div style={{ display:"flex",gap:"clamp(12px,3vw,24px)",alignItems:"center",flexWrap:"wrap" }}>
//         {activeLang && <span style={{ color:"#ffb347",animation:"fr .4s ease" }}>TARGET: <span style={{ color:"#ff3366" }}>{activeLang}</span></span>}
//         <span style={{ color:"#2a3548" }}>SIG: <span style={{ color:"#39ff14" }}>99%</span></span>
//         <span style={{ display:"flex",alignItems:"center",gap:5,color:"#ff3366" }}>
//           <span style={{ width:5,height:5,borderRadius:"50%",background:"#ff3366",display:"inline-block",boxShadow:"0 0 6px #ff3366",animation:"hp 1.3s ease-in-out infinite" }}/>REC
//         </span>
//         <span style={{ color:"#2a3548" }}>{time}</span>
//       </div>
//       <style>{`@keyframes hp{0%,100%{opacity:1}50%{opacity:.2}}@keyframes fr{from{opacity:0;transform:translateX(8px)}to{opacity:1;transform:none}}`}</style>
//     </div>
//   );
// }

// // ─── SCROLL PROGRESS (ENHANCED) ─────────────────────────────────────────────

// function ScrollBar() {
//   const ref = useRef(null);
//   const glowRef = useRef(null);
//   useEffect(() => {
//     const upd = () => {
//       const total = document.documentElement.scrollHeight - window.innerHeight;
//       if (ref.current) ref.current.style.transform = `scaleX(${total>0?window.scrollY/total:0})`;
//       if (glowRef.current) {
//         const progress = total>0 ? window.scrollY/total : 0;
//         const hue = 180 + progress * 180;
//         glowRef.current.style.boxShadow = `0 0 20px 2px hsla(${hue}, 100%, 65%, 0.8)`;
//       }
//     };
//     window.addEventListener("scroll", upd, { passive:true });
//     return () => window.removeEventListener("scroll", upd);
//   }, []);
//   return (
//     <div style={{ position:"fixed",top:41,left:0,right:0,height:3,zIndex:101,background:"rgba(255,255,255,0.03)" }}>
//       <div ref={ref} style={{ position:"absolute",inset:0,background:"linear-gradient(90deg,#00f7ff,#ff3366,#ffb347)",transformOrigin:"left",transform:"scaleX(0)",transition:"transform 0.05s linear" }}/>
//       <div ref={glowRef} style={{ position:"absolute",top:-2,left:0,right:0,height:7,background:"linear-gradient(90deg,transparent,#00f7ff80,transparent)",filter:"blur(4px)",transformOrigin:"left",transform:"scaleX(0)",transition:"transform 0.05s linear" }}/>
//     </div>
//   );
// }

// // ─── TICKER (ENHANCED WITH SCROLL SPEED) ─────────────────────────────────────

// function Ticker() {
//   const items = [...TICKER_ITEMS,...TICKER_ITEMS,...TICKER_ITEMS];
//   const trackRef = useRef(null);
//   useEffect(() => {
//     const track = trackRef.current;
//     if (!track) return;
//     let speed = 24;
//     const updateSpeed = () => {
//       const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
//       const newSpeed = 12 + scrollPercent * 30;
//       gsap.to(track, {
//         duration: 1.5,
//         animationPlayState: "running",
//         animationDuration: `${newSpeed}s`,
//         ease: "none",
//       });
//     };
//     window.addEventListener("scroll", updateSpeed);
//     return () => window.removeEventListener("scroll", updateSpeed);
//   }, []);
//   return (
//     <div style={{ borderTop:"2px solid rgba(0,247,255,0.25)",borderBottom:"2px solid rgba(0,247,255,0.25)",padding:"9px 0",overflow:"hidden",position:"relative",marginBottom:52,boxShadow:"0 0 15px rgba(0,247,255,0.1)" }}>
//       <div style={{ position:"absolute",left:0,top:0,bottom:0,width:"15%",zIndex:2,background:"linear-gradient(90deg,#05060e,transparent)",pointerEvents:"none" }}/>
//       <div style={{ position:"absolute",right:0,top:0,bottom:0,width:"15%",zIndex:2,background:"linear-gradient(270deg,#05060e,transparent)",pointerEvents:"none" }}/>
//       <div ref={trackRef} style={{ display:"flex",animation:"tk 24s linear infinite",whiteSpace:"nowrap",width:"max-content" }}>
//         {items.map((item,i)=>(
//           <span key={i} style={{ fontSize:9,letterSpacing:4,color:"#3a4f70",fontFamily:"'Fira Code',monospace",paddingRight:48,display:"inline-flex",alignItems:"center" }}>
//             <span style={{ color:"#00f7ff40",marginRight:18,fontSize:7 }}>*</span>{item}
//           </span>
//         ))}
//       </div>
//       <style>{`@keyframes tk{from{transform:translateX(0)}to{transform:translateX(-33.33%)}}`}</style>
//     </div>
//   );
// }

// // ─── PREMIUM PROFESSIONAL TECH GLOBE (Fully Responsive & Smooth) ─────────────

// function PremiumGSAPOrb() {
//   const canvasRef = useRef(null);
//   const scrollProgress = useRef(0);
//   const time = useRef(0);
//   const mousePos = useRef({ x: 0.5, y: 0.5 });
//   const pixelRatio = useRef(1);
//   const isMobile = useRef(false);
  
//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;
//     const ctx = canvas.getContext("2d");
//     let width = 0, height = 0;
//     let animationId;
//     let resizeTimer;
    
//     const updateIsMobile = () => {
//       isMobile.current = window.innerWidth <= 768;
//     };
//     updateIsMobile();
//     window.addEventListener("resize", () => {
//       clearTimeout(resizeTimer);
//       resizeTimer = setTimeout(() => updateIsMobile(), 100);
//     });
    
//     const updatePixelRatio = () => {
//       const dpr = window.devicePixelRatio || 1;
//       pixelRatio.current = dpr;
//       width = canvas.clientWidth * dpr;
//       height = canvas.clientHeight * dpr;
//       canvas.width = width;
//       canvas.height = height;
//     };
    
//     const updateScroll = () => {
//       const total = document.documentElement.scrollHeight - window.innerHeight;
//       scrollProgress.current = total > 0 ? window.scrollY / total : 0;
//     };
//     window.addEventListener("scroll", updateScroll);
//     updateScroll();
    
//     const handleMouseMove = (e) => {
//       const rect = canvas.getBoundingClientRect();
//       if (rect.width > 0) {
//         mousePos.current = {
//           x: (e.clientX - rect.left) / rect.width,
//           y: (e.clientY - rect.top) / rect.height,
//         };
//       }
//     };
//     window.addEventListener("mousemove", handleMouseMove);
    
//     const resize = () => {
//       const rect = canvas.getBoundingClientRect();
//       width = rect.width;
//       height = rect.height;
//       updatePixelRatio();
//     };
//     resize();
//     window.addEventListener("resize", resize);
    
//     // Helper: draw sphere wireframe (latitude/longitude) – simplified on mobile
//     function drawSphere(ctx, centerX, centerY, radius, rotX, rotY, rotZ, color, lineWidth) {
//       const stepsLat = isMobile.current ? 8 : 14;   // fewer lines on mobile
//       const stepsLong = isMobile.current ? 12 : 20;
      
//       const rotate = (p, rx, ry, rz) => {
//         let x = p.x, y = p.y, z = p.z;
//         let cos = Math.cos(rx), sin = Math.sin(rx);
//         let y1 = y * cos - z * sin;
//         let z1 = y * sin + z * cos;
//         y = y1; z = z1;
//         cos = Math.cos(ry); sin = Math.sin(ry);
//         let x1 = x * cos + z * sin;
//         let z2 = -x * sin + z * cos;
//         x = x1; z = z2;
//         cos = Math.cos(rz); sin = Math.sin(rz);
//         let x2 = x * cos - y * sin;
//         let y2 = x * sin + y * cos;
//         return { x: x2, y: y2 };
//       };
      
//       const project = (p, radius) => ({
//         x: centerX + p.x * radius,
//         y: centerY + p.y * radius
//       });
      
//       // Latitude rings
//       for (let i = 1; i < stepsLat; i++) {
//         const phi = (i / stepsLat) * Math.PI;
//         const r = Math.sin(phi);
//         const y = Math.cos(phi);
//         const points = [];
//         for (let j = 0; j <= stepsLong; j++) {
//           const theta = (j / stepsLong) * Math.PI * 2;
//           const x = r * Math.cos(theta);
//           const z = r * Math.sin(theta);
//           let p = rotate({ x, y: y, z }, rotX, rotY, rotZ);
//           p = project(p, radius);
//           points.push(p);
//         }
//         ctx.beginPath();
//         for (let j = 0; j < points.length; j++) {
//           if (j === 0) ctx.moveTo(points[j].x, points[j].y);
//           else ctx.lineTo(points[j].x, points[j].y);
//         }
//         ctx.strokeStyle = color;
//         ctx.lineWidth = lineWidth;
//         ctx.stroke();
//       }
      
//       // Longitude lines
//       for (let j = 0; j < stepsLong; j++) {
//         const theta = (j / stepsLong) * Math.PI * 2;
//         const points = [];
//         for (let i = 0; i <= stepsLat; i++) {
//           const phi = (i / stepsLat) * Math.PI;
//           const x = Math.sin(phi) * Math.cos(theta);
//           const y = Math.cos(phi);
//           const z = Math.sin(phi) * Math.sin(theta);
//           let p = rotate({ x, y, z }, rotX, rotY, rotZ);
//           p = project(p, radius);
//           points.push(p);
//         }
//         ctx.beginPath();
//         for (let i = 0; i < points.length; i++) {
//           if (i === 0) ctx.moveTo(points[i].x, points[i].y);
//           else ctx.lineTo(points[i].x, points[i].y);
//         }
//         ctx.stroke();
//       }
//     }
    
//     const draw = () => {
//       if (!ctx || width === 0 || height === 0) return;
//       ctx.clearRect(0, 0, width, height);
      
//       time.current += 0.008;
//       const t = time.current;
//       const progress = scrollProgress.current;
      
//       const centerX = width / 2;
//       const centerY = height / 2;
//       const baseRadius = Math.min(width, height) * (isMobile.current ? 0.32 : 0.38);
      
//       const hue = 200 + progress * 100;
//       const mainColor = `hsla(${hue}, 80%, 65%, 0.9)`;
//       const accentColor = `hsla(${hue + 30}, 85%, 70%, 0.85)`;
      
//       ctx.save();
//       ctx.translate(centerX, centerY);
//       ctx.scale(1, 0.95);
//       ctx.translate(-centerX, -centerY);
      
//       const rotX = t * 0.2;
//       const rotY = t * 0.15;
//       const rotZ = t * 0.05;
//       drawSphere(ctx, centerX, centerY, baseRadius, rotX, rotY, rotZ, mainColor, isMobile.current ? 1 : 1.2);
      
//       ctx.shadowBlur = 15;
//       ctx.shadowColor = `hsla(${hue}, 85%, 70%, 0.8)`;
//       drawSphere(ctx, centerX, centerY, baseRadius * 0.98, rotX, rotY, rotZ, accentColor, isMobile.current ? 0.8 : 1);
//       ctx.shadowBlur = 0;
//       ctx.restore();
      
//       // Orbiting rings – fewer on mobile
//       const ringCount = isMobile.current ? 2 : 3;
//       for (let i = 0; i < ringCount; i++) {
//         const ringRadius = baseRadius * (0.85 + i * 0.12);
//         const tilt = Math.sin(t * 0.5 + i) * 0.2;
//         const angle = t * (0.5 + i * 0.3);
//         ctx.save();
//         ctx.translate(centerX, centerY);
//         ctx.rotate(angle);
//         ctx.scale(1, 0.7 + tilt * 0.1);
//         ctx.beginPath();
//         ctx.ellipse(0, 0, ringRadius, ringRadius * 0.45, 0, 0, Math.PI * 2);
//         ctx.strokeStyle = `hsla(${hue + i * 20}, 85%, 70%, 0.5)`;
//         ctx.lineWidth = isMobile.current ? 0.8 : 1.2;
//         ctx.stroke();
//         ctx.restore();
//       }
      
//       // Particles – reduced on mobile
//       const particleCount = isMobile.current ? 40 : 80;
//       for (let i = 0; i < particleCount; i++) {
//         const ringIdx = i % ringCount;
//         const ringRadius = baseRadius * (0.85 + ringIdx * 0.12);
//         const angleStep = (Math.PI * 2 / (particleCount / ringCount));
//         const baseAngle = i * angleStep + t * 1.5;
//         const x = centerX + Math.cos(baseAngle) * ringRadius;
//         const y = centerY + Math.sin(baseAngle) * ringRadius * 0.75;
//         const size = isMobile.current ? 1.2 : 1.8 + Math.sin(t * 5 + i) * 0.8;
//         ctx.beginPath();
//         ctx.arc(x, y, size, 0, Math.PI * 2);
//         ctx.fillStyle = `hsla(${hue + ringIdx * 30}, 90%, 75%, 0.9)`;
//         ctx.fill();
//       }
      
//       // Central core
//       const coreGlow = 0.4 + Math.sin(t * 3) * 0.15;
//       const gradient = ctx.createRadialGradient(centerX, centerY, baseRadius * 0.08, centerX, centerY, baseRadius * 0.28);
//       gradient.addColorStop(0, `hsla(${hue}, 90%, 70%, 0.95)`);
//       gradient.addColorStop(0.7, `hsla(${hue}, 85%, 65%, 0.4)`);
//       gradient.addColorStop(1, 'transparent');
//       ctx.fillStyle = gradient;
//       ctx.beginPath();
//       ctx.arc(centerX, centerY, baseRadius * 0.28, 0, Math.PI * 2);
//       ctx.fill();
//       ctx.beginPath();
//       ctx.arc(centerX, centerY, baseRadius * 0.08, 0, Math.PI * 2);
//       ctx.fillStyle = `hsla(${hue}, 100%, 85%, 1)`;
//       ctx.fill();
      
//       // Mouse highlight (only on non‑mobile)
//       if (!isMobile.current) {
//         const mouseGlowX = centerX + (mousePos.current.x - 0.5) * width * 0.2;
//         const mouseGlowY = centerY + (mousePos.current.y - 0.5) * height * 0.2;
//         const grad = ctx.createRadialGradient(mouseGlowX, mouseGlowY, 5, mouseGlowX, mouseGlowY, baseRadius * 0.6);
//         grad.addColorStop(0, `hsla(${hue}, 85%, 70%, 0.12)`);
//         grad.addColorStop(1, 'transparent');
//         ctx.fillStyle = grad;
//         ctx.fillRect(0, 0, width, height);
//       }
      
//       animationId = requestAnimationFrame(draw);
//     };
    
//     draw();
//     return () => {
//       cancelAnimationFrame(animationId);
//       window.removeEventListener("scroll", updateScroll);
//       window.removeEventListener("mousemove", handleMouseMove);
//       window.removeEventListener("resize", resize);
//     };
//   }, []);
  
//   return (
//     <canvas 
//       ref={canvasRef} 
//       style={{ 
//         position: "absolute", 
//         top: "8%", 
//         right: "2%", 
//         width: "min(500px, 45vw, 70vh)", 
//         height: "min(500px, 45vw, 70vh)", 
//         pointerEvents: "none", 
//         zIndex: 5, 
//         filter: "drop-shadow(0 0 20px rgba(0, 150, 255, 0.25))",
//         opacity: 0.95,
//         willChange: "transform"
//       }} 
//     />
//   );
// }

// // ─── ENHANCED SCROLL MARQUEE WITH PREMIUM LINES ─────────────────────────────

// function ScrollMarquee({ text, direction, accent = "#00f7ff", dim = "#161b26" }) {
//   const trackRef = useRef(null);
//   const wrapRef  = useRef(null);
//   const lineRef = useRef(null);
//   const words    = Array(14).fill(text);

//   useEffect(() => {
//     const track = trackRef.current;
//     const wrap  = wrapRef.current;
//     const line = lineRef.current;
//     if (!track || !wrap) return;

//     const baseX = direction === 1 ? 0 : -50;
//     gsap.set(track, { xPercent: baseX });

//     const st = ScrollTrigger.create({
//       trigger: wrap,
//       start: "top bottom",
//       end: "bottom top",
//       scrub: 1.8,
//       onUpdate: self => {
//         const velocity = self.getVelocity();
//         const move = direction * velocity * 0.014;
//         gsap.to(track, {
//           xPercent: `+=${move}`,
//           duration: 0.8,
//           ease: "power1.out",
//           modifiers: {
//             xPercent: x => {
//               let v = parseFloat(x) % 50;
//               if (v > 0) v -= 50;
//               return v;
//             },
//           },
//         });
//         if (line) {
//           const hue = 180 + self.progress * 180;
//           line.style.background = `linear-gradient(90deg, transparent, hsla(${hue}, 100%, 65%, 0.8), transparent)`;
//         }
//       },
//     });

//     return () => st.kill();
//   }, [direction]);

//   return (
//     <div ref={wrapRef} style={{ overflow:"hidden", borderTop:"2px solid rgba(0,247,255,0.2)", borderBottom:"2px solid rgba(0,247,255,0.2)", padding:"10px 0", marginBottom:2, position:"relative", boxShadow:"0 0 12px rgba(0,247,255,0.08)" }}>
//       <div ref={lineRef} style={{ position:"absolute", top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,transparent,${accent}aa,transparent)`, pointerEvents:"none", transition:"background 0.1s" }}/>
//       <div ref={trackRef} style={{ display:"flex", whiteSpace:"nowrap", width:"max-content", willChange:"transform" }}>
//         {words.map((w, i) => (
//           <span key={i} style={{
//             fontSize:"clamp(32px, 7vw, 100px)", fontWeight:900, letterSpacing:-3,
//             fontFamily:"'Fira Code',monospace", paddingRight:"clamp(24px, 5vw, 64px)",
//             color: i % 2 === 0 ? "transparent" : dim,
//             WebkitTextStroke: i % 2 === 0 ? `1px ${accent}aa` : "none",
//             textShadow: i % 2 !== 0 ? "none" : `0 0 80px ${accent}30`,
//             transition: "color .3s",
//           }}>{w}</span>
//         ))}
//       </div>
//       <div style={{ position:"absolute", bottom:0, left:0, right:0, height:2, background:`linear-gradient(90deg,transparent,${accent}88,transparent)`, pointerEvents:"none" }}/>
//     </div>
//   );
// }

// // ─── PARTICLES (ENHANCED, RESPONSIVE) ───────────────────────────────────────

// function Particles() {
//   const cvs = useRef(null);
//   useEffect(() => {
//     const c = cvs.current;
//     if (!c) return;
//     const ctx = c.getContext("2d");
//     let W = c.width = window.innerWidth, H = c.height = window.innerHeight;
//     let pts = [];
//     let particleCount = 85;
    
//     const initParticles = () => {
//       const isMobile = window.innerWidth <= 768;
//       particleCount = isMobile ? 40 : 85;
//       pts = Array.from({ length: particleCount }, () => ({
//         x: Math.random()*W, y: Math.random()*H,
//         vx: (Math.random()-.5)*.22, vy: (Math.random()-.5)*.22,
//         r: Math.random()*1.5+.3, o: Math.random()*.28+.06,
//       }));
//     };
//     initParticles();
    
//     const onR = () => {
//       W = c.width = window.innerWidth;
//       H = c.height = window.innerHeight;
//       initParticles();
//     };
//     window.addEventListener("resize", onR);
//     let af;
//     let time = 0;
//     const draw = () => {
//       ctx.clearRect(0,0,W,H);
//       time += 0.01;
//       const hueBase = 180 + Math.sin(time) * 30;
//       pts.forEach(p => {
//         p.x+=p.vx; p.y+=p.vy;
//         if(p.x<0)p.x=W; if(p.x>W)p.x=0;
//         if(p.y<0)p.y=H; if(p.y>H)p.y=0;
//         ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
//         ctx.fillStyle=`hsla(${hueBase}, 100%, 60%, ${p.o})`;
//         ctx.fill();
//       });
//       for(let i=0;i<pts.length;i++) for(let j=i+1;j<pts.length;j++){
//         const dx=pts[i].x-pts[j].x, dy=pts[i].y-pts[j].y, d=Math.sqrt(dx*dx+dy*dy);
//         if(d<100){
//           ctx.beginPath(); ctx.moveTo(pts[i].x,pts[i].y); ctx.lineTo(pts[j].x,pts[j].y);
//           ctx.strokeStyle=`hsla(${hueBase}, 100%, 65%, ${(1-d/100)*.08})`;
//           ctx.lineWidth=0.6; ctx.stroke();
//         }
//       }
//       af=requestAnimationFrame(draw);
//     };
//     draw();
//     return () => { cancelAnimationFrame(af); window.removeEventListener("resize",onR); };
//   }, []);
//   return <canvas ref={cvs} style={{ position:"fixed",inset:0,zIndex:0,pointerEvents:"none",willChange:"transform" }}/>;
// }

// // ─── ANIMATED COUNTER (ENHANCED) ────────────────────────────────────────────

// function AnimCounter({ from = 0, to, suffix = "" }) {
//   const [val, setVal] = useState(from);
//   const ref = useRef(null);
//   useEffect(() => {
//     if (!ref.current) return;
//     const obs = new IntersectionObserver(([e]) => {
//       if (!e.isIntersecting) return;
//       obs.disconnect();
//       gsap.fromTo(ref.current, 
//         { innerText: from },
//         { 
//           innerText: to, 
//           duration: 1.6, 
//           snap: { innerText: 1 },
//           ease: "power2.out",
//           onUpdate: function() {
//             setVal(Math.floor(this.targets()[0].innerText));
//           }
//         }
//       );
//     }, { threshold:0.4 });
//     obs.observe(ref.current);
//     return () => obs.disconnect();
//   }, [from, to]);
//   return <span ref={ref}>{val}{suffix}</span>;
// }

// // ─── ENHANCED CARD (WITH SCROLL TRIGGERED GLOW) ────────────────────────────

// function Card({ lang, onSelect, index }) {
//   const [hov, setHov] = useState(false);
//   const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
//   const ref     = useRef(null);
//   const topLine = useRef(null);
//   const glowRef = useRef(null);
//   const btn = useGlitch("[ DECRYPT FILE ]", hov);
//   const lbl = useGlitch(lang.label, hov);
//   const RGB = { "#00f7ff":"0,247,255","#ffb347":"255,179,71","#ff3366":"255,51,102" };
//   const rgb = RGB[lang.accent];

//   useEffect(() => {
//     if (!ref.current) return;
//     gsap.set(ref.current, { opacity:0, y:100, rotateX:12 });
//     ScrollTrigger.create({
//       trigger:ref.current, start:"top 90%",
//       onEnter:()=>gsap.to(ref.current,{
//         opacity:1, y:0, rotateX:0,
//         duration:1.1, ease:"power3.out", delay:index*.18,
//       }),
//       once:true,
//     });
//   }, [index]);

//   const enter = e => {
//     setHov(true);
//     const rect = ref.current.getBoundingClientRect();
//     const mx = (e.clientX - rect.left) / rect.width;
//     const my = (e.clientY - rect.top) / rect.height;
//     setMousePos({ x: mx, y: my });
//     gsap.to(ref.current, { y:-16, scale:1.018, duration:.5, ease:"power2.out" });
//     if (topLine.current) gsap.to(topLine.current, { scaleX:1, duration:.45, ease:"power2.out" });
//     if (glowRef.current) gsap.to(glowRef.current, { opacity:1, duration:.4 });
//   };
//   const leave = () => {
//     setHov(false);
//     gsap.to(ref.current, { y:0, scale:1, rotateY:0, rotateX:0, duration:.6, ease:"power2.inOut" });
//     if (topLine.current) gsap.to(topLine.current, { scaleX:0, duration:.3 });
//     if (glowRef.current) gsap.to(glowRef.current, { opacity:0, duration:.4 });
//   };

//   const mouseMove = e => {
//     if (!hov || !ref.current) return;
//     const rect = ref.current.getBoundingClientRect();
//     const mx = (e.clientX - rect.left) / rect.width - 0.5;
//     const my = (e.clientY - rect.top)  / rect.height - 0.5;
//     gsap.to(ref.current, { rotateY: mx * 9, rotateX: -my * 6, duration:.4, ease:"power1.out" });
//     setMousePos({ x: (e.clientX - rect.left) / rect.width, y: (e.clientY - rect.top) / rect.height });
//   };

//   const click = () => {
//     gsap.timeline()
//       .to(ref.current,{scale:.96,duration:.12,ease:"power2.in"})
//       .to(ref.current,{scale:1,duration:.25,ease:"back.out(1.5)"});
//     const flash = document.createElement("div");
//     Object.assign(flash.style,{
//       position:"absolute",inset:0,zIndex:20,
//       background:`radial-gradient(circle at ${mousePos.x*100}% ${mousePos.y*100}%, ${lang.accent}50, transparent 70%)`,
//       pointerEvents:"none",animation:"ripFade .5s ease forwards",borderRadius:"inherit",
//     });
//     ref.current.appendChild(flash);
//     setTimeout(()=>flash.remove(),550);
//     setTimeout(()=>onSelect(lang),330);
//   };

//   return (
//     <div
//       ref={ref}
//       data-cur
//       onMouseEnter={enter}
//       onMouseLeave={leave}
//       onMouseMove={mouseMove}
//       onClick={click}
//       style={{
//         position:"relative", cursor:"none", overflow:"hidden",
//         border:`1px solid ${hov?lang.accent+"cc":"#1a2030"}`,
//         background:hov?`rgba(${rgb},.06)`:"rgba(5,7,14,.95)",
//         padding:"clamp(20px, 4vw, 48px) clamp(18px, 3vw, 38px)",
//         transformStyle:"preserve-3d",
//         willChange:"transform",
//       }}
//     >
//       <div ref={glowRef} style={{
//         position:"absolute", inset:0, pointerEvents:"none", opacity:0,
//         background:`radial-gradient(ellipse at ${mousePos.x*100}% ${mousePos.y*100}%, rgba(${rgb},0.2) 0%, transparent 70%)`,
//         transition:"background .12s",
//       }}/>

//       <div style={{ position:"absolute",top:0,left:0,right:0,height:200,pointerEvents:"none",background:`radial-gradient(ellipse at 50% 0%,rgba(${rgb},${hov?.18:0}) 0%,transparent 70%)`,transition:"background .5s" }}/>

//       <div ref={topLine} style={{ position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,transparent,${lang.accent},transparent)`,boxShadow:`0 0 24px 2px ${lang.accent}`,transformOrigin:"center",transform:"scaleX(0)" }}/>

//       {["tl","tr","bl","br"].map(c=>(
//         <div key={c} style={{ position:"absolute",top:c[0]==="t"?12:"auto",bottom:c[0]==="b"?12:"auto",left:c[1]==="l"?12:"auto",right:c[1]==="r"?12:"auto",width:16,height:16,borderTop:c[0]==="t"?`1.5px solid ${lang.accent}`:"none",borderBottom:c[0]==="b"?`1.5px solid ${lang.accent}`:"none",borderLeft:c[1]==="l"?`1.5px solid ${lang.accent}`:"none",borderRight:c[1]==="r"?`1.5px solid ${lang.accent}`:"none",opacity:hov?1:.2,transition:"opacity .3s, transform .3s",transform:hov?`translate(${c[1]==="l"?"-2px":"2px"},${c[0]==="t"?"-2px":"2px"})`:""}}/>
//       ))}

//       <div style={{ position:"absolute",bottom:-20,right:-10,fontSize:"clamp(80px, 18vw, 190px)",fontWeight:900,color:lang.accent,opacity:hov?.1:.04,lineHeight:1,fontFamily:"'Fira Code',monospace",pointerEvents:"none",userSelect:"none",transition:"opacity .4s, transform .6s",transform:hov?"translateY(-8px)":"none" }}>{lang.index}</div>

//       {hov && <div style={{ position:"absolute",top:0,left:0,right:0,bottom:0,pointerEvents:"none",overflow:"hidden",zIndex:1 }}>
//         <div style={{ position:"absolute",width:"100%",height:1,background:`linear-gradient(90deg,transparent,${lang.accent}88,transparent)`,animation:"cardScan 2.2s ease-in-out infinite" }}/>
//       </div>}

//       <div style={{ position:"relative",zIndex:2 }}>
//         <div style={{ fontSize:9,letterSpacing:4,color:lang.accent,opacity:.6,marginBottom:22,fontFamily:"'Fira Code',monospace",transition:"opacity .3s",display:"flex",alignItems:"center",gap:10 }}>
//           <span style={{ width:18,height:1,background:lang.accent,display:"inline-block",opacity:.5 }}/>
//           {lang.tag}
//         </div>

//         <div style={{ fontSize:"clamp(42px, 8vw, 90px)",fontWeight:800,letterSpacing:-4,lineHeight:.87,color:hov?lang.accent:"#c8d8f0",marginBottom:18,transition:"color .28s",textShadow:hov?`0 0 120px ${lang.accent}60, 0 0 40px ${lang.accent}30`:"none",fontFamily:"'Fira Code',monospace" }}>{lbl}</div>

//         <div style={{ fontSize:10,color:hov?lang.accent+"aa":"#506070",letterSpacing:3,marginBottom:20,fontFamily:"'Fira Code',monospace",transition:"color .3s" }}>{lang.tagline}</div>

//         <div style={{ height:1,background:`linear-gradient(90deg,${lang.accent}aa,${lang.accent}33,transparent)`,marginBottom:22,opacity:hov?1:.3,transition:"opacity .3s,background .3s" }}/>

//         <p style={{ fontSize:"clamp(11px, 2vw, 12px)",color:hov?"#8a9ab0":"#6a7a90",lineHeight:1.9,marginBottom:28,fontFamily:"'Fira Code',monospace",transition:"color .3s" }}>{lang.desc}</p>

//         <div style={{ display:"flex",gap:8,flexWrap:"wrap",marginBottom:28 }}>
//           {lang.meta.map(m=>(
//             <span key={m} style={{ fontSize:9,letterSpacing:2,padding:"5px 12px",border:`1px solid ${lang.accent}${hov?"66":"33"}`,color:hov?lang.accent:lang.accent+"88",background:`${lang.accent}${hov?"15":"08"}`,fontFamily:"'Fira Code',monospace",transition:"all .3s" }}>{m}</span>
//           ))}
//         </div>

//         <div style={{ marginBottom:38 }}>
//           {lang.features.map((f,i)=>(
//             <div key={f} style={{ fontSize:11,color:hov?"#90a0b0":"#506070",marginBottom:9,display:"flex",alignItems:"center",gap:10,fontFamily:"'Fira Code',monospace",transform:hov?"translateX(8px)":"none",transition:`transform .4s ${i*.07}s ease, color .3s` }}>
//               <span style={{ color:lang.accent,fontSize:8,transition:"transform .3s",transform:hov?"scale(1.4)":"scale(1)" }}>▶</span>{f}
//             </div>
//           ))}
//         </div>

//         <button style={{ width:"100%",padding:"clamp(12px, 3vw, 16px)",cursor:"none",border:`1.5px solid ${lang.accent}${hov?"ff":"66"}`,color:hov?"#fff":lang.accent,fontFamily:"'Fira Code',monospace",fontSize:10,letterSpacing:4,background:hov?`${lang.accent}25`:"transparent",boxShadow:hov?`0 0 70px ${lang.accent}33,inset 0 0 50px ${lang.accent}15, 0 0 0 1px ${lang.accent}44`:"none",transition:"all .35s",position:"relative",overflow:"hidden" }}>
//           {hov && <div style={{ position:"absolute",inset:0,background:`linear-gradient(90deg,transparent,${lang.accent}20,transparent)`,animation:"btnShine 1.4s ease-in-out infinite" }}/>}
//           <span style={{ position:"relative",zIndex:1 }}>{btn}</span>
//         </button>
//       </div>
//     </div>
//   );
// }

// // ─── STATS STRIP (ENHANCED WITH SCROLL GLOW) ────────────────────────────────

// function StatsStrip() {
//   const stripRef = useRef(null);
//   const stats = [
//     { label:"LANG FILES", val:3, suffix:"", accent:"#00f7ff" },
//     { label:"CONCEPTS COVERED", val:120, suffix:"+", accent:"#ffb347" },
//     { label:"HOURS OF CONTENT", val:48, suffix:"H", accent:"#ff3366" },
//     { label:"SKILL LEVEL", val:0, suffix:"→∞", accent:"#39ff14" },
//   ];

//   useEffect(() => {
//     if (!stripRef.current) return;
//     gsap.from(stripRef.current.querySelectorAll(".stat-item"), {
//       opacity:0, y:30, stagger:.1, duration:.8, ease:"power2.out",
//       scrollTrigger:{ trigger:stripRef.current, start:"top 88%", once:true },
//     });
    
//     ScrollTrigger.create({
//       trigger: stripRef.current,
//       start: "top 80%",
//       end: "bottom 20%",
//       scrub: 1,
//       onUpdate: (self) => {
//         const glowIntensity = self.progress * 0.5;
//         if (stripRef.current) {
//           stripRef.current.style.boxShadow = `0 0 ${20 + glowIntensity * 30}px rgba(0,247,255,${0.1 + glowIntensity * 0.2})`;
//         }
//       },
//     });
//   }, []);

//   return (
//     <div ref={stripRef} style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",borderTop:"2px solid rgba(0,247,255,0.25)",borderLeft:"1px solid #1a2030",marginBottom:52,transition:"box-shadow 0.2s" }}>
//       {stats.map((s,i)=>(
//         <div key={s.label} className="stat-item" style={{ padding:"clamp(20px, 5vw, 30px) clamp(16px, 4vw, 24px)",borderRight:"1px solid #1a2030",borderBottom:"1px solid #1a2030",fontFamily:"'Fira Code',monospace",position:"relative",overflow:"hidden",transition:"background .3s" }}
//           onMouseEnter={e=>e.currentTarget.style.background=`rgba(0,247,255,.04)`}
//           onMouseLeave={e=>e.currentTarget.style.background="transparent"}
//         >
//           <div style={{ position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,${s.accent}aa,transparent)` }}/>
//           <div style={{ fontSize:9,letterSpacing:3,color:"#2a3548",marginBottom:10 }}>{s.label}</div>
//           <div style={{ fontSize:"clamp(28px, 6vw, 38px)",fontWeight:800,color:s.accent,letterSpacing:-2,textShadow:`0 0 60px ${s.accent}80` }}>
//             <AnimCounter to={s.val} suffix={s.suffix}/>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }

// // ─── FEATURE ITEMS (ENHANCED) ───────────────────────────────────────────────

// function FeatureItem({ item, idx }) {
//   const [hov, setHov] = useState(false);
//   const ref = useRef(null);
//   useEffect(() => {
//     if (!ref.current) return;
//     gsap.set(ref.current, { opacity:0,y:40 });
//     ScrollTrigger.create({
//       trigger:ref.current, start:"top 92%",
//       onEnter:()=>gsap.to(ref.current,{opacity:1,y:0,duration:.7,ease:"power3.out",delay:idx*.08}),
//       once:true,
//     });
//   }, [idx]);
//   return (
//     <div ref={ref} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
//       style={{ padding:"clamp(20px, 5vw, 30px) clamp(18px, 4vw, 22px)",border:`1px solid ${hov?"#00f7ff60":"#1a2030"}`,background:hov?"rgba(0,247,255,.04)":"transparent",transition:"border-color .3s,background .3s",fontFamily:"'Fira Code',monospace",position:"relative",overflow:"hidden" }}>
//       {hov && <div style={{ position:"absolute",top:0,left:0,right:0,height:2,background:"linear-gradient(90deg,transparent,#00f7ffaa,transparent)" }}/>}
//       <div style={{ fontSize:"clamp(20px, 5vw, 24px)",marginBottom:16,color:"#00f7ff",opacity:hov?1:.55,transition:"opacity .3s, transform .35s",transform:hov?"scale(1.2) translateX(3px)":"none" }}>{item.icon}</div>
//       <div style={{ fontSize:10,letterSpacing:3,color:hov?"#c8d8f0":"#506070",marginBottom:10,transition:"color .3s" }}>{item.title}</div>
//       <div style={{ fontSize:"clamp(10px, 2vw, 11px)",color:hov?"#4a6f80":"#2a3548",lineHeight:1.7,transition:"color .3s" }}>{item.desc}</div>
//     </div>
//   );
// }

// function HorizontalFeatures() {
//   const items = [
//     { icon:"◈",title:"MODULAR LESSONS",desc:"Each concept is a self-contained file. Open, decrypt, master." },
//     { icon:"⬡",title:"OPERATOR FLOW",desc:"Progress through missions like an intelligence analyst on assignment." },
//     { icon:"◎",title:"CASE SYSTEM",desc:"Your learning path is your case file. Every concept a new lead." },
//     { icon:"▣",title:"LIVE FEEDBACK",desc:"Instant output. See your code run in real-time terminal output." },
//     { icon:"◆",title:"ZERO FILLER",desc:"No fluff. Pure signal. Every lesson is mission-critical intel." },
//   ];
//   return (
//     <div style={{ marginBottom:80 }}>
//       <div style={{ fontSize:9,letterSpacing:5,color:"#2a3548",fontFamily:"'Fira Code',monospace",marginBottom:28 }}>// INTEL BRIEF — WHY VISUOSLAYER</div>
//       <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:2 }}>
//         {items.map((it,i)=><FeatureItem key={it.title} item={it} idx={i}/>)}
//       </div>
//     </div>
//   );
// }

// // ─── HERO BG (SIMPLIFIED) ────────────────────────────────────────────────────

// function HeroBG() {
//   const cvs = useRef(null);
//   useEffect(() => {
//     const c = cvs.current;
//     if (!c) return;
//     const ctx = c.getContext("2d");
//     let W, H;
//     const resize = () => { W = c.width = c.offsetWidth; H = c.height = c.offsetHeight; };
//     resize();
//     window.addEventListener("resize", resize);

//     const HEX_R = 42;
//     const buildHexes = () => {
//       const list = [];
//       const cols = Math.ceil(W / (HEX_R * 1.732)) + 2;
//       const rows = Math.ceil(H / (HEX_R * 1.5))   + 2;
//       for (let r = 0; r < rows; r++) for (let col = 0; col < cols; col++) {
//         const ox = r % 2 === 0 ? 0 : HEX_R * 0.866;
//         list.push({ x: col * HEX_R * 1.732 + ox, y: r * HEX_R * 1.5, pulse: Math.random() * 6, speed: 0.003 + Math.random() * 0.006, bright: Math.random() });
//       }
//       return list;
//     };
//     let hexes = buildHexes();
//     window.addEventListener("resize", () => { hexes = buildHexes(); });

//     const CHARS = "01アイウエオ<>{}[]#@";
//     const streams = Array.from({ length: 28 }, () => ({
//       x: Math.random() * 2000, y: Math.random() * 900, speed: 0.4 + Math.random() * 0.8,
//       chars: Array.from({ length: 9 }, () => CHARS[Math.floor(Math.random() * CHARS.length)]),
//       op: 0.03 + Math.random() * 0.09, timer: 0,
//     }));

//     let af;
//     let time = 0;
//     const draw = () => {
//       ctx.clearRect(0, 0, W, H);
//       time += 0.008;
//       const hueBase = 180 + Math.sin(time) * 30;
      
//       hexes.forEach(h => {
//         h.pulse += h.speed;
//         const alpha = (Math.sin(h.pulse) * 0.5 + 0.5) * h.bright * 0.05;
//         ctx.beginPath();
//         for (let i = 0; i < 6; i++) {
//           const a = (Math.PI / 3) * i - Math.PI / 6;
//           const px = h.x + HEX_R * 0.9 * Math.cos(a);
//           const py = h.y + HEX_R * 0.9 * Math.sin(a);
//           i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
//         }
//         ctx.closePath();
//         ctx.strokeStyle = `hsla(${hueBase}, 100%, 65%, ${alpha})`;
//         ctx.lineWidth = 0.6;
//         ctx.stroke();
//       });

//       streams.forEach(s => {
//         s.timer++;
//         if (s.timer % 7 === 0) { s.chars.shift(); s.chars.push(CHARS[Math.floor(Math.random() * CHARS.length)]); }
//         s.y += s.speed;
//         if (s.y > H + 130) { s.y = -130; s.x = Math.random() * W; }
//         s.chars.forEach((ch, i) => {
//           ctx.font = `10px 'Fira Code',monospace`;
//           ctx.fillStyle = `hsla(${hueBase}, 100%, 70%, ${s.op * ((s.chars.length - i) / s.chars.length)})`;
//           ctx.fillText(ch, s.x, s.y + i * 13);
//         });
//       });

//       [[0,0],[W,0],[0,H],[W,H]].forEach(([bx, by]) => {
//         const sx = bx===0?1:-1, sy = by===0?1:-1;
//         ctx.strokeStyle = `hsla(${hueBase}, 100%, 65%, 0.12)`;
//         ctx.lineWidth = 1;
//         ctx.beginPath(); ctx.moveTo(bx+sx*18,by+sy*1); ctx.lineTo(bx+sx*70,by+sy*1); ctx.stroke();
//         ctx.beginPath(); ctx.moveTo(bx+sx*1,by+sy*18); ctx.lineTo(bx+sx*1,by+sy*70); ctx.stroke();
//       });

//       af = requestAnimationFrame(draw);
//     };
//     af = requestAnimationFrame(draw);
//     return () => { cancelAnimationFrame(af); window.removeEventListener("resize", resize); };
//   }, []);
//   return <canvas ref={cvs} style={{ position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none",zIndex:1 }}/>;
// }

// // ─── ENHANCED HERO (WITH NEW PREMIUM ORB) ───────────────────────────────────

// function Hero({ eyeRef, h1Ref, subRef }) {
//   const reticleRef   = useRef(null);
//   const hRef         = useRef(null);
//   const orb1         = useRef(null);
//   const orb2         = useRef(null);
//   const scrollArrow  = useRef(null);
//   const dividerRef   = useRef(null);
//   const statusRef    = useRef(null);
//   const [typed, setTyped] = useState("");
//   const STATUS = "AWAITING_SELECTION...";

//   useEffect(() => {
//     let i = 0;
//     const iv = setInterval(() => { setTyped(STATUS.slice(0, i)); i = i >= STATUS.length + 6 ? 0 : i + 1; }, 90);
//     return () => clearInterval(iv);
//   }, []);

//   useEffect(() => {
//     if (orb1.current) gsap.to(orb1.current, { x:70,y:-50,duration:8,ease:"sine.inOut",yoyo:true,repeat:-1 });
//     if (orb2.current) gsap.to(orb2.current, { x:-60,y:40,duration:10,ease:"sine.inOut",yoyo:true,repeat:-1,delay:2 });
//   }, []);

//   useEffect(() => {
//     if (scrollArrow.current) {
//       gsap.to(scrollArrow.current, { y:10,duration:1.4,ease:"sine.inOut",yoyo:true,repeat:-1 });
//     }
//     if (dividerRef.current) {
//       gsap.from(dividerRef.current, { scaleX:0,duration:1.4,ease:"power3.out",delay:.6,
//         scrollTrigger:{ trigger:dividerRef.current, start:"top 95%", once:true }
//       });
//     }
//     if (statusRef.current) {
//       gsap.from(statusRef.current, { x:30,opacity:0,duration:.9,ease:"power3.out",delay:.9 });
//     }
//   }, []);

//   useEffect(() => {
//     const el = hRef.current;
//     if (!el) return;
//     const move = e => {
//       const rect = el.getBoundingClientRect();
//       gsap.to(reticleRef.current, { x:e.clientX-rect.left,y:e.clientY-rect.top,duration:.5,ease:"power2.out" });
//     };
//     el.addEventListener("mousemove", move);
//     return () => el.removeEventListener("mousemove", move);
//   }, []);

//   return (
//     <section ref={hRef} style={{ width:"100%",minHeight:"100vh",padding:"80px clamp(20px, 5vw, 80px) 0",position:"relative",overflow:"hidden",display:"flex",flexDirection:"column",justifyContent:"center",boxSizing:"border-box" }}>
//       <HeroBG/>
//       <PremiumGSAPOrb />
      
//       <div ref={orb1} style={{ position:"absolute",top:"15%",right:"6%",width:600,height:600,borderRadius:"50%",background:"radial-gradient(circle,rgba(0,247,255,.07) 0%,transparent 70%)",pointerEvents:"none",zIndex:0 }}/>
//       <div ref={orb2} style={{ position:"absolute",bottom:"10%",left:"3%",width:440,height:440,borderRadius:"50%",background:"radial-gradient(circle,rgba(0,247,255,.045) 0%,transparent 70%)",pointerEvents:"none",zIndex:0 }}/>

//       <div ref={reticleRef} style={{ position:"absolute",pointerEvents:"none",width:88,height:88,marginLeft:-44,marginTop:-44,zIndex:8,opacity:.3,top:0,left:0 }}>
//         <svg width="88" height="88" viewBox="0 0 88 88">
//           <circle cx="44" cy="44" r="42" fill="none" stroke="#00f7ff" strokeWidth=".5" strokeDasharray="5 9"/>
//           <circle cx="44" cy="44" r="5"  fill="none" stroke="#00f7ff" strokeWidth="1"/>
//           <line x1="0"  y1="44" x2="28" y2="44" stroke="#00f7ff" strokeWidth=".6"/>
//           <line x1="60" y1="44" x2="88" y2="44" stroke="#00f7ff" strokeWidth=".6"/>
//           <line x1="44" y1="0"  x2="44" y2="28" stroke="#00f7ff" strokeWidth=".6"/>
//           <line x1="44" y1="60" x2="44" y2="88" stroke="#00f7ff" strokeWidth=".6"/>
//         </svg>
//       </div>

//       <div style={{ position:"relative",zIndex:10 }}>
//         <div ref={eyeRef} style={{ display:"flex",alignItems:"center",gap:12,marginBottom:28,fontFamily:"'Fira Code',monospace",fontSize:9,letterSpacing:5,color:"#00f7ffaa",flexWrap:"wrap" }}>
//           <span style={{ width:36,height:2,background:"linear-gradient(90deg,#00f7ff,transparent)",display:"inline-block" }}/>
//           VISUOSLAYER // CASE #2026 // LANG-SELECT
//           <span style={{ width:36,height:2,background:"linear-gradient(270deg,#00f7ff,transparent)",display:"inline-block" }}/>
//         </div>

//         <h1 ref={h1Ref} style={{ lineHeight:.82,fontFamily:"'Fira Code',monospace",fontWeight:800,fontSize:"clamp(48px, 12vw, 190px)",letterSpacing:"-.05em",width:"100%" }}>
//           <span className="word" style={{ display:"block",color:"transparent",WebkitTextStroke:"1px rgba(200,216,240,.3)",lineHeight:.88 }}>BEGINNER?</span>
//           <span className="word" style={{ display:"block",color:"#00f7ff",textShadow:"0 0 160px rgba(0,247,255,.8),0 0 60px rgba(0,247,255,.5)",animation:"floatY 3.8s ease-in-out infinite",position:"relative",lineHeight:.88 }}>
//             SELECT
//             <span style={{ position:"absolute",left:0,top:"52%",width:"100%",height:3,background:"linear-gradient(90deg,transparent 0%,#00f7ff88 30%,#00f7ff 50%,#00f7ff88 70%,transparent 100%)",animation:"scanH 2.8s cubic-bezier(.4,0,.2,1) infinite",pointerEvents:"none",boxShadow:"0 0 18px #00f7ff" }}/>
//           </span>
//           <span className="word" style={{ display:"block",color:"#c8d8f0",lineHeight:.88 }}>LANGUAGE</span>
//         </h1>
//       </div>

//       <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:40,marginTop:56,position:"relative",zIndex:10,flexWrap:"wrap" }}>
//         <div style={{ display:"flex",gap:24,alignItems:"flex-start",maxWidth:520,flex:"1 1 300px" }}>
//           <div style={{ width:2,minHeight:90,background:"linear-gradient(to bottom,#00f7ff,transparent)",flexShrink:0,marginTop:4,boxShadow:"0 0 12px #00f7ffaa" }}/>
//           <p ref={subRef} style={{ fontSize:"clamp(11px, 2vw, 12px)",color:"#607080",letterSpacing:1,lineHeight:2,fontFamily:"'Fira Code',monospace" }}>
//             Three encrypted files. Each contains the fundamentals of a programming language.
//             Select one to begin decryption. Your mission starts now.
//             <br/><br/>
//             <span style={{ color:"#304050" }}>// VISUOSLAYER by SAIF — CASE #2026</span>
//           </p>
//         </div>

//         <div ref={statusRef} style={{ flexShrink:0,border:"1px solid #2a3a4a",padding:"clamp(12px, 3vw, 16px) clamp(16px, 4vw, 22px)",fontFamily:"'Fira Code',monospace",fontSize:10,lineHeight:1.9,color:"#2a4050",minWidth:240,background:"rgba(5,7,14,.85)",backdropFilter:"blur(12px)",flex:"0 0 auto",position:"relative",overflow:"hidden" }}>
//           <div style={{ position:"absolute",top:0,left:0,right:0,height:2,background:"linear-gradient(90deg,transparent,#00f7ff88,transparent)" }}/>
//           <div style={{ color:"#2a3548",fontSize:9,letterSpacing:3,marginBottom:10 }}>SYSTEM STATUS</div>
//           {[["KERNEL","OVERRIDE_ACTIVE","#00f7ff33"],["FILES","3 / UNLOCKED","#39ff1433"],["OPERATOR","SAIF","#c8d8f033"],["SIGNAL","99%","#00f7ff33"]].map(([k,v,c])=>(
//             <div key={k} style={{ display:"flex",justifyContent:"space-between",gap:24 }}>
//               <span style={{ color:"#1e2535" }}>{k}</span>
//               <span style={{ color:"#4a6a80" }}>{v}</span>
//             </div>
//           ))}
//           <div style={{ marginTop:12,borderTop:"1px solid #1a2030",paddingTop:10,color:"#00f7ff77",fontSize:9,letterSpacing:2 }}>
//             &gt; {typed}<span style={{ animation:"bl 1s step-end infinite",color:"#00f7ffaa" }}>_</span>
//           </div>
//         </div>
//       </div>

//       <div ref={dividerRef} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:52,paddingTop:18,borderTop:"2px solid rgba(0,247,255,0.4)",fontFamily:"'Fira Code',monospace",fontSize:9,letterSpacing:2,color:"#2a4050",flexWrap:"wrap",gap:12,position:"relative",zIndex:10,transformOrigin:"left",boxShadow:"0 -4px 15px rgba(0,247,255,0.1)" }}>
//         <span>CAM_01 · LAT 23.0225°N · LONG 72.5714°E</span>
//         <div style={{ display:"flex",gap:16,alignItems:"center" }}>
//           {[0,1,2,3,4].map(i=><div key={i} style={{ width:28,height:2,background:i===2?"#00f7ffaa":"#2a4050",boxShadow:i===2?"0 0 12px #00f7ff":"none" }}/>)}
//         </div>
//         <span>ALT 53M · <span style={{ color:"#00f7ff55" }}>{typed}<span style={{ animation:"bl 1s step-end infinite",color:"#00f7ff66" }}>_</span></span></span>
//       </div>

//       <div ref={scrollArrow} style={{ position:"absolute",bottom:36,left:"50%",transform:"translateX(-50%)",zIndex:20,display:"flex",flexDirection:"column",alignItems:"center",gap:8,fontFamily:"'Fira Code',monospace",fontSize:8,letterSpacing:4,color:"#00f7ffaa" }}>
//         <span>SCROLL</span>
//         <div style={{ width:2,height:32,background:"linear-gradient(to bottom,#00f7ffcc,transparent)",boxShadow:"0 0 12px #00f7ff" }}/>
//         <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
//           <path d="M1 1L6 7L11 1" stroke="#00f7ff" strokeWidth="1.5" strokeLinecap="round"/>
//         </svg>
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

// // ─── MAIN PAGE ───────────────────────────────────────────────────────────────

// export default function Page() {
//   const router = useRouter();
//   const [booted,     setBooted]     = useState(false);
//   const [vis,        setVis]        = useState(false);
//   const [activeLang, setActiveLang] = useState(null);

//   const eyeRef  = useRef(null);
//   const h1Ref   = useRef(null);
//   const subRef  = useRef(null);
//   const warnRef = useRef(null);

//   // Lenis smooth scroll with optimizations
//   useEffect(() => {
//     let lenis;
//     (async () => {
//       try {
//         const { default: Lenis } = await import("@studio-freight/lenis");
//         lenis = new Lenis({ 
//           duration: 1.2,
//           easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
//           smoothWheel: true,
//           wheelMultiplier: 0.9,
//           touchMultiplier: 1.2,
//           infinite: false,
//         });
//         const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
//         requestAnimationFrame(raf);
//         lenis.on("scroll", ScrollTrigger.update);
//         ScrollTrigger.scrollerProxy(document.body, {
//           scrollTop(value) { return arguments.length ? lenis.scrollTo(value) : lenis.scroll; },
//           getBoundingClientRect() { return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight }; },
//           pinType: document.body.style.transform ? "transform" : "fixed",
//         });
//         ScrollTrigger.refresh();
//       } catch (e) { /* fallback to native scroll */ }
//     })();
//     return () => { lenis?.destroy(); ScrollTrigger.killAll(); };
//   }, []);

//   // Mouse parallax on hero h1
//   useEffect(() => {
//     const onM = e => {
//       const x = (e.clientX/window.innerWidth-.5)*18;
//       const y = (e.clientY/window.innerHeight-.5)*10;
//       if (h1Ref.current) gsap.to(h1Ref.current,{x,y,duration:.9,ease:"power2.out"});
//     };
//     window.addEventListener("mousemove", onM);
//     return () => window.removeEventListener("mousemove", onM);
//   }, []);

//   // Reveal after boot
//   useEffect(() => {
//     if (!booted) return;
//     setTimeout(() => setVis(true), 80);
//     const tl = gsap.timeline({ delay:.3 });
//     if (eyeRef.current)  tl.from(eyeRef.current,{opacity:0,y:24,duration:.7,ease:"power3.out"});
//     if (h1Ref.current)   tl.from(h1Ref.current.querySelectorAll(".word"),{opacity:0,y:80,stagger:.12,duration:1,ease:"power3.out"},"-.=.4");
//     if (subRef.current)  tl.from(subRef.current,{opacity:0,y:20,duration:.7,ease:"power2.out"},"-=.5");
//     if (warnRef.current) {
//       ScrollTrigger.create({
//         trigger:warnRef.current, start:"top 92%",
//         onEnter:()=>gsap.from(warnRef.current,{opacity:0,x:-20,duration:.6,ease:"power2.out"}),
//         once:true,
//       });
//     }
//   }, [booted]);

//   const handleSelect = useCallback(lang => {
//     setActiveLang(lang.label);
//     const fl = document.createElement("div");
//     Object.assign(fl.style,{position:"fixed",inset:0,zIndex:9000,background:lang.accent,opacity:"0",pointerEvents:"none"});
//     document.body.appendChild(fl);
//     gsap.timeline()
//       .to(fl,{opacity:.22,duration:.2})
//       .to(fl,{opacity:0,duration:.45})
//       .then(()=>{ fl.remove(); router.push(lang.route); });
//   }, [router]);

//   return (
//     <>
//       <Cursor/>
//       {!booted && <Boot onDone={()=>setBooted(true)}/>}
//       {booted && <><HUD activeLang={activeLang}/><ScrollBar/></>}

//       <div style={{ position:"fixed",inset:0,background:"#05060e",zIndex:-5 }}/>
//       <Particles/>
//       <svg style={{ position:"fixed",inset:0,width:"100%",height:"100%",opacity:.04,pointerEvents:"none",zIndex:1 }}>
//         <filter id="gr"><feTurbulence type="fractalNoise" baseFrequency=".68" numOctaves="4" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>
//         <rect width="100%" height="100%" filter="url(#gr)"/>
//       </svg>
//       <div style={{ position:"fixed",inset:0,zIndex:1,pointerEvents:"none",backgroundImage:"radial-gradient(circle,rgba(0,247,255,.08) 1px,transparent 1px)",backgroundSize:"44px 44px",maskImage:"radial-gradient(ellipse 65% 65% at center,black 10%,transparent 78%)",WebkitMaskImage:"radial-gradient(ellipse 65% 65% at center,black 10%,transparent 78%)" }}/>
//       <div style={{ position:"fixed",inset:0,pointerEvents:"none",zIndex:2,background:"repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.065) 2px,rgba(0,0,0,.065) 4px)" }}/>
//       <div style={{ position:"fixed",inset:0,pointerEvents:"none",zIndex:3,background:"radial-gradient(ellipse at center,transparent 40%,rgba(5,6,14,.88) 100%)" }}/>

//       <main style={{ position:"relative",zIndex:10,paddingTop:80,opacity:vis?1:0,transition:"opacity 1s cubic-bezier(.4,0,.2,1)" }}>

//         <Hero eyeRef={eyeRef} h1Ref={h1Ref} subRef={subRef}/>

//         <div style={{ overflow:"hidden",margin:"60px 0 0",position:"relative" }}>
//           <div style={{ position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",width:"60%",height:2,background:"linear-gradient(90deg,transparent,#00f7ffaa,transparent)",pointerEvents:"none",zIndex:2 }}/>
//           <ScrollMarquee text="VISUOSLAYER - SAIF - " direction={1} accent="#00f7ff" dim="#182232"/>
//           <ScrollMarquee text="C  - PYTHON - JAVA -" direction={-1} accent="#ffb347" dim="#1e1a0e"/>
//           <div style={{ position:"absolute",bottom:0,left:"50%",transform:"translateX(-50%)",width:"60%",height:2,background:"linear-gradient(90deg,transparent,#ffb347aa,transparent)",pointerEvents:"none",zIndex:2 }}/>
//         </div>

//         <section style={{ maxWidth:1280,margin:"0 auto",padding:"80px 5vw 140px" }}>
//           <Ticker/>
//           <StatsStrip/>

//           <div style={{ display:"flex",gap:0,marginBottom:48,border:"1px solid #1a2030",flexWrap:"wrap" }}>
//             {[["ACTIVE_CASE","LANG-SELECT","#00f7ff"],["FILES_FOUND","3","#ffb347"],["CLEARANCE","GRANTED","#39ff14"],["OPERATOR","SAIF","#c8d8f0"],["SYSTEM","VISUOSLAYER","#506070"]].map(([k,v,c],i,a)=>(
//               <div key={k} style={{ padding:"clamp(10px, 2vw, 13px) clamp(16px, 4vw, 24px)",borderRight:i<a.length-1?"1px solid #1a2030":"none",fontFamily:"'Fira Code',monospace",fontSize:9,letterSpacing:2,background:"rgba(5,7,14,.7)",display:"flex",flexDirection:"column",gap:5,flexShrink:0 }}>
//                 <span style={{ color:"#253040" }}>{k}</span>
//                 <span style={{ color:c,textShadow:`0 0 20px ${c}88` }}>{v}</span>
//               </div>
//             ))}
//           </div>

//           <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:2,marginBottom:80,perspective:"1200px" }}>
//             {LANGUAGES.map((lang,i)=><Card key={lang.id} lang={lang} index={i} onSelect={handleSelect}/>)}
//           </div>

//           <HorizontalFeatures/>

//           <div ref={warnRef} style={{ display:"flex",alignItems:"center",gap:14,padding:"14px 22px",border:"1px solid #ff3366aa",background:"rgba(255,51,102,.035)",fontFamily:"'Fira Code',monospace",fontSize:9,color:"#3a5060",letterSpacing:2,position:"relative",overflow:"hidden",flexWrap:"wrap" }}>
//             <div style={{ position:"absolute",top:0,left:0,right:0,height:2,background:"linear-gradient(90deg,#ff336600,#ff3366aa,#ff336600)" }}/>
//             <span style={{ color:"#ff3366",fontSize:13,animation:"bl 2s step-end infinite",flexShrink:0 }}>!</span>
//             WARNING: Once a language file is opened, full immersion begins. Proceed carefully.
//             <span style={{ color:"#2a4050",marginLeft:"auto",flexShrink:0 }}> // VISUOSLAYER OS — AUTHORISED BY SAIF</span>
//           </div>
//         </section>

//         <footer style={{ borderTop:"2px solid rgba(0,247,255,0.3)",maxWidth:1280,margin:"0 auto",padding:"22px 5vw",display:"flex",justifyContent:"space-between",alignItems:"center",fontFamily:"'Fira Code',monospace",fontSize:9,color:"#2a4050",letterSpacing:2,flexWrap:"wrap",gap:10 }}>
//           <span>VISUOSLAYER // SAIF</span>
//           <span>LANG_FILES — CASE #2026</span>
//           <span>ALL FILES ENCRYPTED — AUTHORISED PERSONNEL ONLY</span>
//           <span style={{ color:"#00f7ff44" }}>SYS.STABLE</span>
//         </footer>
//       </main>

//       <style>{`
//         *{box-sizing:border-box;margin:0;padding:0;cursor:none!important}
//         html,body{background:#05060e;color:#c8d8f0;font-family:'Fira Code','Courier New',monospace;overflow-x:hidden;scroll-behavior:auto}
//         @keyframes floatY{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}
//         @keyframes bl{0%,100%{opacity:1}50%{opacity:0}}
//         ::selection{background:#00f7ff20;color:#00f7ff}
//         ::-webkit-scrollbar{width:3px}
//         ::-webkit-scrollbar-track{background:#05060e}
//         ::-webkit-scrollbar-thumb{background:#1a2030}
//         ::-webkit-scrollbar-thumb:hover{background:#00f7ff66}
//         @media(max-width:640px){footer{flex-direction:column;text-align:center}}
//       `}</style>
//     </>
//   );
// }
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

// ─── DATA ────────────────────────────────────────────────────────────────────

const BOOT_NORMAL = [
  { t: "Memory: 256 GiB DDR5 ECC Registered @ 4800 MT/s",          c: "dim" },
  { t: "Storage: NVMe Samsung PM9A3 3.84TB  [GPT, EXT4]",          c: "dim" },
  { t: "Network: eth0 10.0.4.22/24  gw 10.0.4.1",                  c: "dim" },
  { t: "  -> C_PROGRAM ............ [DECRYPTED]  1.2ms",            c: "ok"  },
  { t: "  -> PYTHON_CORE ....... [DECRYPTED]  0.8ms",               c: "ok"  },
  { t: "  -> JAVA_RUNTIME ...... [DECRYPTED]  1.1ms",               c: "ok"  },
  { t: "Initialising VisuoSlayer security layer: [ OK ]",           c: "ok"  },
];

const BOOT_ERROR = [
  { t: "!! CRITICAL: Memory fault at 0x7FFE2C4A — ECC correction failed. SYSTEM HALT.", c: "err" },
];

const BOOT_RECOVERY = [
  { t: "SELECT YOUR TARGET LANGUAGE", c: "hd" },
];

const safeLine = l => ({ c: "dim", ...l });

const LANGUAGES = [
  {
    id: "c", label: "C", index: "01", tag: "EVIDENCE_01",
    tagline: "Systems & Speed",
    desc: "The foundation of modern computing. Raw, fast, impossibly close to the metal.",
    meta: ["Compiled", "Low-Level", "1972"],
    accent: "#00f7ff", route: "/c-1",
    features: ["Memory Management", "Pointer Arithmetic", "OS Development"],
  },
  {
    id: "python", label: "PYTHON", index: "02", tag: "EVIDENCE_02",
    tagline: "Readability & Versatility",
    desc: "Clean syntax, massive ecosystem. From scripts to neural networks effortlessly.",
    meta: ["Interpreted", "High-Level", "1991"],
    accent: "#ffb347", route: "/p-1",
    features: ["Data Science", "Automation", "Web Backend"],
  },
  {
    id: "java", label: "JAVA", index: "03", tag: "EVIDENCE_03",
    tagline: "Enterprise & Stability",
    desc: "Write once, run anywhere. The backbone of enterprise software for three decades.",
    meta: ["Compiled+VM", "OOP", "1995"],
    accent: "#ff3366", route: "/j-1",
    features: ["Android Dev", "Enterprise Apps", "Cross-Platform"],
  },
];

const TICKER_ITEMS = [
  "VISUOSLAYER", "LANG FILES", "CASE #2026", "CLEARANCE ALPHA",
  "SAIF // OPERATOR", "3 FILES FOUND", "DECRYPTION READY", "ANALYST: BEGINNER",
];

const GLITCH_CHARS = "!<>-_\\/[]{}=+*^?#@$%&";

// ─── HOOK: GLITCH TEXT ────────────────────────────────────────────────────────

function useGlitch(text, active) {
  const [display, setDisplay] = useState(text);
  useEffect(() => {
    if (!active) { setDisplay(text); return; }
    let i = 0;
    const iv = setInterval(() => {
      setDisplay(text.split("").map((c, j) =>
        j < i ? c : c === " " ? " " : GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]
      ).join(""));
      i += 0.5;
      if (i >= text.length) { setDisplay(text); clearInterval(iv); }
    }, 28);
    return () => clearInterval(iv);
  }, [active, text]);
  return display;
}

// ─── CURSOR (ENHANCED) ───────────────────────────────────────────────────────

function Cursor() {
  const dot  = useRef(null);
  const ring = useRef(null);
  const trailRef = useRef(null);
  const mp   = useRef({ x: -200, y: -200 });
  const rp   = useRef({ x: -200, y: -200 });
  const trailPos = useRef({ x: -200, y: -200 });
  const raf  = useRef(null);
  const big  = useRef(false);
  const scrollProgress = useRef(0);

  useEffect(() => {
    const mv = e => {
      mp.current = { x: e.clientX, y: e.clientY };
      big.current = !!document.elementFromPoint(e.clientX, e.clientY)?.closest("[data-cur]");
    };
    window.addEventListener("mousemove", mv);
    
    const updateScrollProgress = () => {
      const winScroll = window.scrollY;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      scrollProgress.current = winScroll / height;
    };
    window.addEventListener("scroll", updateScrollProgress);
    updateScrollProgress();
    
    const loop = () => {
      rp.current.x += (mp.current.x - rp.current.x) * 0.09;
      rp.current.y += (mp.current.y - rp.current.y) * 0.09;
      trailPos.current.x += (rp.current.x - trailPos.current.x) * 0.05;
      trailPos.current.y += (rp.current.y - trailPos.current.y) * 0.05;
      
      const sz = big.current ? 34 : 20;
      const hue = 180 + scrollProgress.current * 180;
      const glowColor = `hsla(${hue}, 100%, 65%, 0.8)`;
      if (dot.current) {
        dot.current.style.transform = `translate(${mp.current.x - 4}px,${mp.current.y - 4}px)`;
        dot.current.style.background = `radial-gradient(circle, ${glowColor}, #00f7ff)`;
      }
      if (ring.current) {
        ring.current.style.transform = `translate(${rp.current.x - sz}px,${rp.current.y - sz}px)`;
        ring.current.style.width = ring.current.style.height = `${sz * 2}px`;
        ring.current.style.borderColor = `hsla(${hue}, 100%, 65%, 0.6)`;
      }
      if (trailRef.current) {
        trailRef.current.style.transform = `translate(${trailPos.current.x - 12}px,${trailPos.current.y - 12}px)`;
      }
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => { 
      window.removeEventListener("mousemove", mv);
      window.removeEventListener("scroll", updateScrollProgress);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <>
      <div ref={dot} style={{ position:"fixed",top:0,left:0,zIndex:99999,pointerEvents:"none",width:8,height:8,borderRadius:"50%",background:"#00f7ff",boxShadow:"0 0 12px #00f7ff",willChange:"transform",transition:"background 0.2s" }} />
      <div ref={ring} style={{ position:"fixed",top:0,left:0,zIndex:99998,pointerEvents:"none",width:40,height:40,borderRadius:"50%",border:"1px solid rgba(0,247,255,0.6)",willChange:"transform",transition:"width .38s cubic-bezier(.34,1.56,.64,1),height .38s cubic-bezier(.34,1.56,.64,1),border-color 0.2s" }} />
      <div ref={trailRef} style={{ position:"fixed",top:0,left:0,zIndex:99997,pointerEvents:"none",width:24,height:24,borderRadius:"50%",background:"radial-gradient(circle, rgba(0,247,255,0.2) 0%, rgba(0,247,255,0) 70%)",willChange:"transform",filter:"blur(4px)" }} />
    </>
  );
}

// ─── BOOT (UNCHANGED) ───────────────────────────────────────────────────────

function Boot({ onDone }) {
  const [lines,   setLines]   = useState([]);
  const [pct,     setPct]     = useState(0);
  const [isErr,   setIsErr]   = useState(false);
  const [frozen,  setFrozen]  = useState(false);
  const [exiting, setExiting] = useState(false);
  const termRef = useRef(null);
  const bodyRef = useRef(null);
  const doneRef = useRef(onDone);
  useEffect(() => { doneRef.current = onDone; }, [onDone]);

  useEffect(() => {
    if (termRef.current)
      gsap.from(termRef.current, { y: 36, opacity: 0, duration: .9, ease: "power3.out", delay: .3 });

    let tid;
    const scroll = () => { if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight; };

    let ni = 0;
    const normalTick = () => {
      if (ni >= BOOT_NORMAL.length) { tid = setTimeout(startError, 300); return; }
      setLines(l => [...l, safeLine(BOOT_NORMAL[ni])]);
      setPct(Math.round(((ni + 1) / BOOT_NORMAL.length) * 88));
      scroll(); ni++;
      tid = setTimeout(normalTick, 500);
    };

    const startError = () => {
      setIsErr(true);
      if (termRef.current) {
        gsap.timeline()
          .to(termRef.current, { x: -9, duration: .04 })
          .to(termRef.current, { x:  8, duration: .04 })
          .to(termRef.current, { x: -6, duration: .04 })
          .to(termRef.current, { x:  5, duration: .04 })
          .to(termRef.current, { x: -3, duration: .04 })
          .to(termRef.current, { x:  0, duration: .04 });
      }
      setLines(l => [...l, safeLine(BOOT_ERROR[0])]);
      setPct(88); scroll();
      setFrozen(true);
      tid = setTimeout(startRecovery, 1600);
    };

    const startRecovery = () => {
      setFrozen(false);
      let ri = 0;
      const recTick = () => {
        if (ri >= BOOT_RECOVERY.length) {
          const start = performance.now();
          const animPct = ts => {
            const t = Math.min((ts - start) / 1300, 1);
            setPct(Math.round(88 + t * 12));
            if (t < 1) requestAnimationFrame(animPct);
            else {
              tid = setTimeout(() => {
                setExiting(true);
                setTimeout(() => doneRef.current?.(), 900);
              }, 500);
            }
          };
          requestAnimationFrame(animPct);
          return;
        }
        setLines(l => [...l, safeLine(BOOT_RECOVERY[ri])]);
        scroll(); ri++;
        tid = setTimeout(recTick, 480);
      };
      recTick();
    };

    tid = setTimeout(normalTick, 700);
    return () => clearTimeout(tid);
  }, []);

  const col = { sys:"#c8d8f0", dim:"#4a5f7a", ok:"#39ff14", err:"#ff3366", wrn:"#ffb347", hd:"#ffb347" };

  return (
    <div style={{ position:"fixed",inset:0,zIndex:1000,background:"#05060e",display:"flex",alignItems:"center",justifyContent:"center",opacity:exiting?0:1,transition:exiting?"opacity .9s cubic-bezier(.4,0,.2,1)":"none",pointerEvents:exiting?"none":"all" }}>
      <svg style={{ position:"absolute",inset:0,width:"100%",height:"100%",opacity:.05,pointerEvents:"none" }}>
        <filter id="bn"><feTurbulence type="fractalNoise" baseFrequency=".65" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>
        <rect width="100%" height="100%" filter="url(#bn)"/>
      </svg>
      <div style={{ position:"absolute",inset:0,pointerEvents:"none",background:"repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.12) 2px,rgba(0,0,0,.12) 4px)" }} />

      <div style={{ width:"min(700px,93vw)",position:"relative" }}>
        <div style={{ marginBottom:26,display:"flex",alignItems:"flex-start",justifyContent:"space-between" }}>
          <div style={{ display:"flex",gap:14,alignItems:"center" }}>
            <div style={{ width:2,height:44,background:"linear-gradient(to bottom,#00f7ff,#00f7ff00)" }} />
            <div>
              <div style={{ color:"#2a3548",fontSize:9,letterSpacing:5,fontFamily:"'Fira Code',monospace",marginBottom:3 }}>VISUOSLAYER // SAIF — TOP SECRET</div>
              <div style={{ color:"#c8d8f0",fontSize:22,fontFamily:"'Fira Code',monospace",fontWeight:800,letterSpacing:3 }}>VisuoSlayer !</div>
            </div>
          </div>
          <div style={{ fontFamily:"'Fira Code',monospace",fontSize:9,color:"#2a3548",letterSpacing:2,textAlign:"right",lineHeight:1.8 }}>
            <div>CASE #2026</div>
            <div style={{ color:"#ff3366",display:"flex",alignItems:"center",gap:5,justifyContent:"flex-end" }}>
              <span style={{ width:5,height:5,borderRadius:"50%",background:"#ff3366",display:"inline-block",animation:"bl 1.1s step-end infinite" }}/>REC
            </div>
          </div>
        </div>

        <div ref={termRef} style={{ border:`1px solid ${isErr?"#ff336666":"#1a2030"}`,background:isErr?"rgba(12,5,8,.98)":"rgba(5,7,14,.98)",boxShadow:isErr?"0 0 120px rgba(255,51,102,.25),inset 0 0 80px rgba(255,51,102,.08)":"0 0 60px rgba(0,247,255,.05)",transition:"border-color .35s,box-shadow .4s,background .4s" }}>
          <div style={{ background:isErr?"#0a0508":"#080a12",borderBottom:`1px solid ${isErr?"#ff336633":"#1a2030"}`,padding:"8px 16px",display:"flex",alignItems:"center",gap:8,transition:"background .4s" }}>
            {["#ff3366","#ffb347","#39ff14"].map(c => <span key={c} style={{ width:10,height:10,borderRadius:"50%",background:c,display:"block",opacity:.7 }}/>)}
            <span style={{ color:isErr?"#ff336688":"#2a3548",fontSize:9,marginLeft:10,letterSpacing:2,fontFamily:"'Fira Code',monospace",transition:"color .4s" }}>
              {isErr ? "visuoslayer@saif:~$  !! SYSTEM HALTED" : "visuoslayer@saif:~$  BOOT_SEQUENCE.sh"}
            </span>
          </div>

          <div ref={bodyRef} style={{ padding:"18px 20px 14px",minHeight:220,maxHeight:"40vh",overflowY:"hidden",fontFamily:"'Fira Code',monospace",fontSize:12,lineHeight:1.7 }}>
            {lines.map((l, i) => (
              <div key={i} style={{ display:"flex",gap:12,marginBottom:3,color:col[l.c]||"#c8d8f0",fontWeight:l.c==="hd"||l.c==="err"?700:400,fontSize:l.c==="hd"?13:12,textShadow:l.c==="err"?"0 0 18px rgba(255,51,102,.8)":l.c==="ok"?"0 0 6px rgba(57,255,20,.2)":"none",animation:"bi .1s ease forwards" }}>
                <span style={{ color:l.c==="err"||l.c==="wrn"?"#ff336666":"#253040",userSelect:"none",flexShrink:0 }}>{l.c==="err"||l.c==="wrn"?"!":"$"}</span>
                {l.t}
              </div>
            ))}
            {!frozen && (
              <span style={{ display:"inline-block",width:8,height:13,verticalAlign:"middle",background:isErr?"#ff3366":"#00f7ff",boxShadow:isErr?"0 0 12px #ff3366":"0 0 8px #00f7ff",animation:"bl 1s step-end infinite",opacity:isErr?0:1,transition:"background .3s,opacity .3s" }}/>
            )}
            {frozen && (
              <div style={{ marginTop:10,color:"#ff3366",fontFamily:"'Fira Code',monospace",fontSize:11,letterSpacing:3,textShadow:"0 0 14px rgba(255,51,102,.7)",animation:"bl 1.2s step-end infinite" }}>
                !! TERMINAL HALTED — AWAITING OVERRIDE...
              </div>
            )}
          </div>

          <div style={{ borderTop:`1px solid ${isErr?"#ff336622":"#1a2030"}`,padding:"12px 20px",transition:"border-color .4s" }}>
            <div style={{ display:"flex",justifyContent:"space-between",marginBottom:7,fontSize:9,letterSpacing:3,fontFamily:"'Fira Code',monospace" }}>
              <span style={{ color:isErr?"#ff3366":"#2a3548",transition:"color .3s" }}>
                {isErr ? (frozen ? "SYSTEM CRITICAL — OVERRIDE PENDING" : "OVERRIDE ACTIVE — RESUMING") : "LOADING CASE FILES"}
              </span>
              <span style={{ color:isErr?"#ff3366":"#00f7ff",transition:"color .3s" }}>{pct}%</span>
            </div>
            <div style={{ height:1,background:isErr?"#ff336618":"#1a2030",position:"relative",overflow:"hidden" }}>
              <div style={{ position:"absolute",inset:0,background:isErr?"linear-gradient(90deg,#ff3366,#ff336688)":"linear-gradient(90deg,#00f7ff,#00f7ff55)",width:`${pct}%`,transition:"width .3s ease,background .4s",boxShadow:isErr?"0 0 18px #ff3366":"0 0 18px #00f7ff" }}/>
              {isErr && frozen && <div style={{ position:"absolute",top:0,bottom:0,width:40,background:"linear-gradient(90deg,transparent,#ff336644,transparent)",animation:"scan 2s ease-in-out infinite" }}/>}
            </div>
          </div>
        </div>

        <div style={{ display:"flex",justifyContent:"space-between",marginTop:12,fontSize:9,color:"#1e2535",letterSpacing:2,fontFamily:"'Fira Code',monospace" }}>
          <span>CAM_04 [REC]</span>
          <span>VISUOSLAYER // SAIF</span>
          <span style={{ color:isErr?"#ff336688":"#1e2535",transition:"color .3s" }}>
            {isErr ? (frozen?"SIGNAL: CRITICAL — HALTED":"SIGNAL: OVERRIDE ACTIVE") : "SIGNAL: STABLE"}
          </span>
        </div>
      </div>

      <style>{`
        @keyframes bl{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes bi{from{opacity:0;transform:translateX(-5px)}to{opacity:1;transform:none}}
        @keyframes scan{0%{left:-40px}100%{left:100%}}
      `}</style>
    </div>
  );
}

// ─── HUD (ENHANCED) ─────────────────────────────────────────────────────────

function HUD({ activeLang }) {
  const [time, setTime] = useState("00:00:00");
  const ref = useRef(null);
  useEffect(() => {
    const iv = setInterval(() => {
      const n = new Date();
      setTime([n.getHours(),n.getMinutes(),n.getSeconds()].map(x=>String(x).padStart(2,"0")).join(":"));
    }, 1000);
    if (ref.current) gsap.from(ref.current, { y:-80,opacity:0,duration:1,ease:"power3.out",delay:.15 });
    return () => clearInterval(iv);
  }, []);
  
  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: "body",
        start: "top top",
        end: "bottom bottom",
        scrub: 1.5,
        onUpdate: (self) => {
          if (ref.current) {
            const intensity = self.progress * 0.3;
            ref.current.style.background = `rgba(5,6,14,${0.92 - intensity * 0.2})`;
            ref.current.style.backdropFilter = `blur(${20 + intensity * 10}px)`;
          }
        },
      });
    });
    return () => ctx.revert();
  }, []);
  
  return (
    <div ref={ref} style={{ position:"fixed",top:0,left:0,right:0,zIndex:100,display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 5vw",background:"rgba(5,6,14,.92)",borderBottom:"1px solid #1a2030",backdropFilter:"blur(20px)",fontFamily:"'Fira Code',monospace",fontSize:10,letterSpacing:2,transition:"background 0.2s, backdrop-filter 0.2s" }}>
      <div style={{ display:"flex",gap:"clamp(12px,3vw,24px)",alignItems:"center",flexWrap:"wrap" }}>
        <div style={{ display:"flex",alignItems:"center",gap:8 }}>
          <span style={{ width:6,height:6,borderRadius:"50%",background:"#00f7ff",display:"block",boxShadow:"0 0 10px #00f7ff",animation:"hp 2.5s ease-in-out infinite" }}/>
          <span style={{ color:"#c8d8f0",fontWeight:800,letterSpacing:4 }}>VISUOSLAYER</span>
        </div>
        <span style={{ color:"#1a2030" }}>|</span>
        <span style={{ color:"#3a4558" }}>LANG_FILES <span style={{ color:"#00f7ff" }}>SAIF</span></span>
      </div>
      <div style={{ display:"flex",gap:"clamp(12px,3vw,24px)",alignItems:"center",flexWrap:"wrap" }}>
        {activeLang && <span style={{ color:"#ffb347",animation:"fr .4s ease" }}>TARGET: <span style={{ color:"#ff3366" }}>{activeLang}</span></span>}
        <span style={{ color:"#2a3548" }}>SIG: <span style={{ color:"#39ff14" }}>99%</span></span>
        <span style={{ display:"flex",alignItems:"center",gap:5,color:"#ff3366" }}>
          <span style={{ width:5,height:5,borderRadius:"50%",background:"#ff3366",display:"inline-block",boxShadow:"0 0 6px #ff3366",animation:"hp 1.3s ease-in-out infinite" }}/>REC
        </span>
        <span style={{ color:"#2a3548" }}>{time}</span>
      </div>
      <style>{`@keyframes hp{0%,100%{opacity:1}50%{opacity:.2}}@keyframes fr{from{opacity:0;transform:translateX(8px)}to{opacity:1;transform:none}}`}</style>
    </div>
  );
}

// ─── SCROLL PROGRESS ─────────────────────────────────────────────────────────

function ScrollBar() {
  const ref = useRef(null);
  const glowRef = useRef(null);
  useEffect(() => {
    const upd = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      if (ref.current) ref.current.style.transform = `scaleX(${total>0?window.scrollY/total:0})`;
      if (glowRef.current) {
        const progress = total>0 ? window.scrollY/total : 0;
        const hue = 180 + progress * 180;
        glowRef.current.style.boxShadow = `0 0 20px 2px hsla(${hue}, 100%, 65%, 0.8)`;
      }
    };
    window.addEventListener("scroll", upd, { passive:true });
    return () => window.removeEventListener("scroll", upd);
  }, []);
  return (
    <div style={{ position:"fixed",top:41,left:0,right:0,height:3,zIndex:101,background:"rgba(255,255,255,0.03)" }}>
      <div ref={ref} style={{ position:"absolute",inset:0,background:"linear-gradient(90deg,#00f7ff,#ff3366,#ffb347)",transformOrigin:"left",transform:"scaleX(0)",transition:"transform 0.05s linear" }}/>
      <div ref={glowRef} style={{ position:"absolute",top:-2,left:0,right:0,height:7,background:"linear-gradient(90deg,transparent,#00f7ff80,transparent)",filter:"blur(4px)",transformOrigin:"left",transform:"scaleX(0)",transition:"transform 0.05s linear" }}/>
    </div>
  );
}

// ─── TICKER ─────────────────────────────────────────────────────────────────

function Ticker() {
  const items = [...TICKER_ITEMS,...TICKER_ITEMS,...TICKER_ITEMS];
  return (
    <div style={{ borderTop:"2px solid rgba(0,247,255,0.25)",borderBottom:"2px solid rgba(0,247,255,0.25)",padding:"9px 0",overflow:"hidden",position:"relative",marginBottom:52,boxShadow:"0 0 15px rgba(0,247,255,0.1)" }}>
      <div style={{ position:"absolute",left:0,top:0,bottom:0,width:"15%",zIndex:2,background:"linear-gradient(90deg,#05060e,transparent)",pointerEvents:"none" }}/>
      <div style={{ position:"absolute",right:0,top:0,bottom:0,width:"15%",zIndex:2,background:"linear-gradient(270deg,#05060e,transparent)",pointerEvents:"none" }}/>
      <div style={{ display:"flex",animation:"tk 24s linear infinite",whiteSpace:"nowrap",width:"max-content" }}>
        {items.map((item,i)=>(
          <span key={i} style={{ fontSize:9,letterSpacing:4,color:"#3a4f70",fontFamily:"'Fira Code',monospace",paddingRight:48,display:"inline-flex",alignItems:"center" }}>
            <span style={{ color:"#00f7ff40",marginRight:18,fontSize:7 }}>*</span>{item}
          </span>
        ))}
      </div>
      <style>{`@keyframes tk{from{transform:translateX(0)}to{transform:translateX(-33.33%)}}`}</style>
    </div>
  );
}

// ─── PREMIUM GSAP ORB ────────────────────────────────────────────────────────

function PremiumGSAPOrb() {
  const canvasRef = useRef(null);
  const scrollProgress = useRef(0);
  const time = useRef(0);
  const mousePos = useRef({ x: 0.5, y: 0.5 });
  const isMobile = useRef(false);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let width = 0, height = 0;
    let animationId;
    let resizeTimer;
    
    const updateIsMobile = () => { isMobile.current = window.innerWidth <= 768; };
    updateIsMobile();
    window.addEventListener("resize", () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => updateIsMobile(), 100); });
    
    const updatePixelRatio = () => {
      const dpr = window.devicePixelRatio || 1;
      width = canvas.clientWidth * dpr;
      height = canvas.clientHeight * dpr;
      canvas.width = width;
      canvas.height = height;
    };
    
    const updateScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      scrollProgress.current = total > 0 ? window.scrollY / total : 0;
    };
    window.addEventListener("scroll", updateScroll);
    updateScroll();
    
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width > 0) {
        mousePos.current = { x: (e.clientX - rect.left) / rect.width, y: (e.clientY - rect.top) / rect.height };
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    
    const resize = () => { updatePixelRatio(); };
    resize();
    window.addEventListener("resize", resize);
    
    function drawSphere(ctx, centerX, centerY, radius, rotX, rotY, rotZ, color, lineWidth) {
      const stepsLat = isMobile.current ? 8 : 14;
      const stepsLong = isMobile.current ? 12 : 20;
      const rotate = (p, rx, ry, rz) => {
        let x = p.x, y = p.y, z = p.z;
        let cos = Math.cos(rx), sin = Math.sin(rx);
        let y1 = y * cos - z * sin; let z1 = y * sin + z * cos; y = y1; z = z1;
        cos = Math.cos(ry); sin = Math.sin(ry);
        let x1 = x * cos + z * sin; let z2 = -x * sin + z * cos; x = x1; z = z2;
        cos = Math.cos(rz); sin = Math.sin(rz);
        let x2 = x * cos - y * sin; let y2 = x * sin + y * cos;
        return { x: x2, y: y2 };
      };
      const project = (p, radius) => ({ x: centerX + p.x * radius, y: centerY + p.y * radius });
      for (let i = 1; i < stepsLat; i++) {
        const phi = (i / stepsLat) * Math.PI;
        const r = Math.sin(phi); const y = Math.cos(phi);
        const points = [];
        for (let j = 0; j <= stepsLong; j++) {
          const theta = (j / stepsLong) * Math.PI * 2;
          let p = rotate({ x: r * Math.cos(theta), y, z: r * Math.sin(theta) }, rotX, rotY, rotZ);
          points.push(project(p, radius));
        }
        ctx.beginPath();
        for (let j = 0; j < points.length; j++) { if (j === 0) ctx.moveTo(points[j].x, points[j].y); else ctx.lineTo(points[j].x, points[j].y); }
        ctx.strokeStyle = color; ctx.lineWidth = lineWidth; ctx.stroke();
      }
      for (let j = 0; j < stepsLong; j++) {
        const theta = (j / stepsLong) * Math.PI * 2;
        const points = [];
        for (let i = 0; i <= stepsLat; i++) {
          const phi = (i / stepsLat) * Math.PI;
          let p = rotate({ x: Math.sin(phi) * Math.cos(theta), y: Math.cos(phi), z: Math.sin(phi) * Math.sin(theta) }, rotX, rotY, rotZ);
          points.push(project(p, radius));
        }
        ctx.beginPath();
        for (let i = 0; i < points.length; i++) { if (i === 0) ctx.moveTo(points[i].x, points[i].y); else ctx.lineTo(points[i].x, points[i].y); }
        ctx.stroke();
      }
    }
    
    const draw = () => {
      if (!ctx || width === 0 || height === 0) return;
      ctx.clearRect(0, 0, width, height);
      time.current += 0.008;
      const t = time.current;
      const progress = scrollProgress.current;
      const centerX = width / 2; const centerY = height / 2;
      const baseRadius = Math.min(width, height) * (isMobile.current ? 0.32 : 0.38);
      const hue = 200 + progress * 100;
      const mainColor = `hsla(${hue}, 80%, 65%, 0.9)`;
      const accentColor = `hsla(${hue + 30}, 85%, 70%, 0.85)`;
      ctx.save(); ctx.translate(centerX, centerY); ctx.scale(1, 0.95); ctx.translate(-centerX, -centerY);
      const rotX = t * 0.2; const rotY = t * 0.15; const rotZ = t * 0.05;
      drawSphere(ctx, centerX, centerY, baseRadius, rotX, rotY, rotZ, mainColor, isMobile.current ? 1 : 1.2);
      ctx.shadowBlur = 15; ctx.shadowColor = `hsla(${hue}, 85%, 70%, 0.8)`;
      drawSphere(ctx, centerX, centerY, baseRadius * 0.98, rotX, rotY, rotZ, accentColor, isMobile.current ? 0.8 : 1);
      ctx.shadowBlur = 0; ctx.restore();
      const ringCount = isMobile.current ? 2 : 3;
      for (let i = 0; i < ringCount; i++) {
        const ringRadius = baseRadius * (0.85 + i * 0.12);
        const tilt = Math.sin(t * 0.5 + i) * 0.2;
        const angle = t * (0.5 + i * 0.3);
        ctx.save(); ctx.translate(centerX, centerY); ctx.rotate(angle); ctx.scale(1, 0.7 + tilt * 0.1);
        ctx.beginPath(); ctx.ellipse(0, 0, ringRadius, ringRadius * 0.45, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(${hue + i * 20}, 85%, 70%, 0.5)`; ctx.lineWidth = isMobile.current ? 0.8 : 1.2; ctx.stroke(); ctx.restore();
      }
      const particleCount = isMobile.current ? 40 : 80;
      for (let i = 0; i < particleCount; i++) {
        const ringIdx = i % ringCount; const ringRadius = baseRadius * (0.85 + ringIdx * 0.12);
        const angleStep = (Math.PI * 2 / (particleCount / ringCount));
        const baseAngle = i * angleStep + t * 1.5;
        const x = centerX + Math.cos(baseAngle) * ringRadius; const y = centerY + Math.sin(baseAngle) * ringRadius * 0.75;
        const size = isMobile.current ? 1.2 : 1.8 + Math.sin(t * 5 + i) * 0.8;
        ctx.beginPath(); ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hue + ringIdx * 30}, 90%, 75%, 0.9)`; ctx.fill();
      }
      const gradient = ctx.createRadialGradient(centerX, centerY, baseRadius * 0.08, centerX, centerY, baseRadius * 0.28);
      gradient.addColorStop(0, `hsla(${hue}, 90%, 70%, 0.95)`); gradient.addColorStop(0.7, `hsla(${hue}, 85%, 65%, 0.4)`); gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient; ctx.beginPath(); ctx.arc(centerX, centerY, baseRadius * 0.28, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(centerX, centerY, baseRadius * 0.08, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${hue}, 100%, 85%, 1)`; ctx.fill();
      if (!isMobile.current) {
        const mouseGlowX = centerX + (mousePos.current.x - 0.5) * width * 0.2;
        const mouseGlowY = centerY + (mousePos.current.y - 0.5) * height * 0.2;
        const grad = ctx.createRadialGradient(mouseGlowX, mouseGlowY, 5, mouseGlowX, mouseGlowY, baseRadius * 0.6);
        grad.addColorStop(0, `hsla(${hue}, 85%, 70%, 0.12)`); grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad; ctx.fillRect(0, 0, width, height);
      }
      animationId = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("scroll", updateScroll);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", resize);
    };
  }, []);
  
  return (
    <canvas ref={canvasRef} style={{ position:"absolute",top:"8%",right:"2%",width:"min(500px, 45vw, 70vh)",height:"min(500px, 45vw, 70vh)",pointerEvents:"none",zIndex:5,filter:"drop-shadow(0 0 20px rgba(0, 150, 255, 0.25))",opacity:0.95,willChange:"transform" }} />
  );
}

// ─── PREMIUM SCROLL MARQUEE — FULLY ENHANCED ────────────────────────────────

function ScrollMarquee({ text, direction, accent = "#00f7ff", dim = "#161b26", index = 0 }) {
  const trackRef = useRef(null);
  const wrapRef  = useRef(null);
  const canvasRef = useRef(null);
  const glowBeamRef = useRef(null);
  const edgeTagRef = useRef(null);
  const words = Array(14).fill(text);
  const isTop = index === 0;

  // Animated canvas background inside the marquee strip
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let W, H, af;
    let t = 0;
    const resize = () => { W = canvas.width = canvas.offsetWidth; H = canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener("resize", resize);
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      t += 0.012;
      // Animated noise bars
      for (let i = 0; i < W; i += 3) {
        const v = Math.sin(i * 0.018 + t * (direction === 1 ? 1 : -1)) * 0.5 + 0.5;
        const alpha = v * 0.04;
        ctx.fillStyle = `hsla(${isTop ? 190 : 38}, 100%, 65%, ${alpha})`;
        ctx.fillRect(i, 0, 2, H);
      }
      // Center shimmer pulse
      const cx = W / 2 + Math.sin(t * 0.6) * W * 0.1;
      const grad = ctx.createRadialGradient(cx, H / 2, 0, cx, H / 2, W * 0.35);
      grad.addColorStop(0, `${accent}10`);
      grad.addColorStop(1, "transparent");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
      af = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(af); window.removeEventListener("resize", resize); };
  }, [accent, direction, isTop]);

  // Scroll-driven marquee movement
  useEffect(() => {
    const track = trackRef.current;
    const wrap  = wrapRef.current;
    if (!track || !wrap) return;
    const baseX = direction === 1 ? 0 : -50;
    gsap.set(track, { xPercent: baseX });
    const st = ScrollTrigger.create({
      trigger: wrap,
      start: "top bottom",
      end: "bottom top",
      scrub: 1.8,
      onUpdate: self => {
        const velocity = self.getVelocity();
        const move = direction * velocity * 0.014;
        gsap.to(track, {
          xPercent: `+=${move}`,
          duration: 0.8,
          ease: "power1.out",
          modifiers: {
            xPercent: x => { let v = parseFloat(x) % 50; if (v > 0) v -= 50; return v; },
          },
        });
        // Glow beam responds to scroll velocity
        if (glowBeamRef.current) {
          const speed = Math.abs(velocity);
          const intensity = Math.min(speed / 800, 1);
          const hue = isTop ? 190 + intensity * 20 : 38 + intensity * 15;
          glowBeamRef.current.style.opacity = `${0.4 + intensity * 0.6}`;
          glowBeamRef.current.style.background = `linear-gradient(90deg, transparent 0%, hsla(${hue},100%,65%,0.9) 50%, transparent 100%)`;
          glowBeamRef.current.style.filter = `blur(${2 + intensity * 6}px)`;
        }
        if (edgeTagRef.current) {
          const progress = self.progress;
          edgeTagRef.current.style.opacity = `${0.3 + progress * 0.7}`;
        }
      },
    });
    return () => st.kill();
  }, [direction, isTop]);

  const accentDim = isTop ? "#0a1a22" : "#1a1200";
  const accentMid = isTop ? "#00f7ff" : "#ffb347";

  return (
    <div
      ref={wrapRef}
      style={{
        overflow: "hidden",
        position: "relative",
        marginBottom: 0,
        // Top border: thick, multi-layered, glowing
        borderTop: `1px solid ${accentMid}55`,
        borderBottom: `1px solid ${accentMid}33`,
      }}
    >
      {/* Animated canvas BG */}
      <canvas
        ref={canvasRef}
        style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none", zIndex:0 }}
      />

      {/* Top prismatic border beam */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, transparent 0%, ${accentMid}cc 20%, #fff 50%, ${accentMid}cc 80%, transparent 100%)`,
        boxShadow: `0 0 18px 2px ${accentMid}aa, 0 0 60px 4px ${accentMid}44`,
        zIndex: 3,
        pointerEvents: "none",
      }} />

      {/* Bottom prismatic border beam */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, transparent 0%, ${accentMid}88 30%, ${accentMid}cc 50%, ${accentMid}88 70%, transparent 100%)`,
        boxShadow: `0 0 12px 1px ${accentMid}66`,
        zIndex: 3,
        pointerEvents: "none",
      }} />

      {/* Animated glow beam that sweeps across */}
      <div ref={glowBeamRef} style={{
        position: "absolute", top: "30%", left: "-10%", width: "40%", height: "40%",
        background: `linear-gradient(90deg, transparent, ${accentMid}99, transparent)`,
        filter: "blur(4px)",
        pointerEvents: "none",
        zIndex: 2,
        animation: `marqueeBeam${isTop ? "A" : "B"} 3.5s ease-in-out infinite`,
        opacity: 0.5,
      }} />

      {/* Left fade */}
      <div style={{ position:"absolute",left:0,top:0,bottom:0,width:"12%",zIndex:4,background:`linear-gradient(90deg, #05060e 0%, ${accentDim}dd 40%, transparent 100%)`,pointerEvents:"none" }} />
      {/* Right fade */}
      <div style={{ position:"absolute",right:0,top:0,bottom:0,width:"12%",zIndex:4,background:`linear-gradient(270deg, #05060e 0%, ${accentDim}dd 40%, transparent 100%)`,pointerEvents:"none" }} />

      {/* Left edge tag */}
      <div ref={edgeTagRef} style={{
        position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)",
        zIndex: 5, fontFamily: "'Fira Code',monospace", fontSize: 7, letterSpacing: 3,
        color: accentMid, opacity: 0.3, paddingLeft: 14, whiteSpace: "nowrap",
        textShadow: `0 0 8px ${accentMid}`,
        transition: "opacity 0.2s",
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <span style={{ width: 16, height: 1, background: accentMid, display: "inline-block", opacity: 0.6 }}/>
        {isTop ? "SIG.STABLE" : "FILE.OPEN"}
      </div>

      {/* Right edge tag */}
      <div style={{
        position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)",
        zIndex: 5, fontFamily: "'Fira Code',monospace", fontSize: 7, letterSpacing: 3,
        color: accentMid, opacity: 0.25, paddingRight: 14, whiteSpace: "nowrap",
        textShadow: `0 0 8px ${accentMid}`,
        display: "flex", alignItems: "center", gap: 8,
      }}>
        {isTop ? "ALPHA" : "CASE.26"}
        <span style={{ width: 16, height: 1, background: accentMid, display: "inline-block", opacity: 0.6 }}/>
      </div>

      {/* The scrolling track */}
      <div
        ref={trackRef}
        style={{
          display: "flex",
          whiteSpace: "nowrap",
          width: "max-content",
          willChange: "transform",
          padding: "clamp(7px, 2vw, 12px) 0",
          position: "relative",
          zIndex: 1,
        }}
      >
        {words.map((w, i) => (
          <span key={i} style={{
            fontSize: "clamp(30px, 6.5vw, 96px)",
            fontWeight: 900,
            letterSpacing: -3,
            fontFamily: "'Fira Code',monospace",
            paddingRight: "clamp(22px, 4vw, 60px)",
            // Alternating: outline vs filled, with chromatic shimmer
            color: i % 2 === 0 ? "transparent" : `${dim}`,
            WebkitTextStroke: i % 2 === 0 ? `1.5px ${accentMid}cc` : "none",
            textShadow: i % 2 === 0
              ? `0 0 80px ${accentMid}50, 0 0 20px ${accentMid}30`
              : i % 4 === 1
                ? `0 0 40px ${accentMid}22`
                : "none",
            filter: i % 2 === 0 ? `drop-shadow(0 0 8px ${accentMid}66)` : "none",
            transition: "color .3s",
            position: "relative",
            display: "inline-block",
          }}>
            {w}
          </span>
        ))}
      </div>

      <style>{`
        @keyframes marqueeBeamA {
          0%   { left: -20%; opacity: 0.3; }
          50%  { left: 80%;  opacity: 0.7; }
          100% { left: -20%; opacity: 0.3; }
        }
        @keyframes marqueeBeamB {
          0%   { left: 80%;  opacity: 0.3; }
          50%  { left: -20%; opacity: 0.65; }
          100% { left: 80%;  opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}

// ─── PARTICLES ───────────────────────────────────────────────────────────────

function Particles() {
  const cvs = useRef(null);
  useEffect(() => {
    const c = cvs.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    let W = c.width = window.innerWidth, H = c.height = window.innerHeight;
    let pts = [];
    const initParticles = () => {
      const isMobile = window.innerWidth <= 768;
      const count = isMobile ? 40 : 85;
      pts = Array.from({ length: count }, () => ({ x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.22,vy:(Math.random()-.5)*.22,r:Math.random()*1.5+.3,o:Math.random()*.28+.06 }));
    };
    initParticles();
    const onR = () => { W = c.width = window.innerWidth; H = c.height = window.innerHeight; initParticles(); };
    window.addEventListener("resize", onR);
    let af; let time = 0;
    const draw = () => {
      ctx.clearRect(0,0,W,H); time += 0.01;
      const hueBase = 180 + Math.sin(time) * 30;
      pts.forEach(p => {
        p.x+=p.vx; p.y+=p.vy;
        if(p.x<0)p.x=W; if(p.x>W)p.x=0; if(p.y<0)p.y=H; if(p.y>H)p.y=0;
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fillStyle=`hsla(${hueBase},100%,60%,${p.o})`; ctx.fill();
      });
      for(let i=0;i<pts.length;i++) for(let j=i+1;j<pts.length;j++){
        const dx=pts[i].x-pts[j].x,dy=pts[i].y-pts[j].y,d=Math.sqrt(dx*dx+dy*dy);
        if(d<100){ ctx.beginPath(); ctx.moveTo(pts[i].x,pts[i].y); ctx.lineTo(pts[j].x,pts[j].y); ctx.strokeStyle=`hsla(${hueBase},100%,65%,${(1-d/100)*.08})`; ctx.lineWidth=0.6; ctx.stroke(); }
      }
      af=requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(af); window.removeEventListener("resize",onR); };
  }, []);
  return <canvas ref={cvs} style={{ position:"fixed",inset:0,zIndex:0,pointerEvents:"none",willChange:"transform" }}/>;
}

// ─── ANIMATED COUNTER ────────────────────────────────────────────────────────

function AnimCounter({ from = 0, to, suffix = "" }) {
  const [val, setVal] = useState(from);
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      gsap.fromTo(ref.current,{ innerText:from },{ innerText:to,duration:1.6,snap:{innerText:1},ease:"power2.out",onUpdate:function(){ setVal(Math.floor(this.targets()[0].innerText)); } });
    }, { threshold:0.4 });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [from, to]);
  return <span ref={ref}>{val}{suffix}</span>;
}

// ─── CARD ────────────────────────────────────────────────────────────────────

function Card({ lang, onSelect, index }) {
  const [hov, setHov] = useState(false);
  const [mousePos, setMousePos] = useState({ x:0.5,y:0.5 });
  const ref = useRef(null); const topLine = useRef(null); const glowRef = useRef(null);
  const btn = useGlitch("[ DECRYPT FILE ]", hov);
  const lbl = useGlitch(lang.label, hov);
  const RGB = { "#00f7ff":"0,247,255","#ffb347":"255,179,71","#ff3366":"255,51,102" };
  const rgb = RGB[lang.accent];

  useEffect(() => {
    if (!ref.current) return;
    gsap.set(ref.current, { opacity:0,y:100,rotateX:12 });
    ScrollTrigger.create({ trigger:ref.current,start:"top 90%",onEnter:()=>gsap.to(ref.current,{ opacity:1,y:0,rotateX:0,duration:1.1,ease:"power3.out",delay:index*.18 }),once:true });
  }, [index]);

  const enter = e => {
    setHov(true);
    const rect = ref.current.getBoundingClientRect();
    setMousePos({ x:(e.clientX-rect.left)/rect.width, y:(e.clientY-rect.top)/rect.height });
    gsap.to(ref.current,{y:-16,scale:1.018,duration:.5,ease:"power2.out"});
    if(topLine.current) gsap.to(topLine.current,{scaleX:1,duration:.45,ease:"power2.out"});
    if(glowRef.current) gsap.to(glowRef.current,{opacity:1,duration:.4});
  };
  const leave = () => {
    setHov(false);
    gsap.to(ref.current,{y:0,scale:1,rotateY:0,rotateX:0,duration:.6,ease:"power2.inOut"});
    if(topLine.current) gsap.to(topLine.current,{scaleX:0,duration:.3});
    if(glowRef.current) gsap.to(glowRef.current,{opacity:0,duration:.4});
  };
  const mouseMove = e => {
    if(!hov||!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const mx=(e.clientX-rect.left)/rect.width-.5,my=(e.clientY-rect.top)/rect.height-.5;
    gsap.to(ref.current,{rotateY:mx*9,rotateX:-my*6,duration:.4,ease:"power1.out"});
    setMousePos({x:(e.clientX-rect.left)/rect.width,y:(e.clientY-rect.top)/rect.height});
  };
  const click = () => {
    gsap.timeline().to(ref.current,{scale:.96,duration:.12,ease:"power2.in"}).to(ref.current,{scale:1,duration:.25,ease:"back.out(1.5)"});
    const flash = document.createElement("div");
    Object.assign(flash.style,{ position:"absolute",inset:0,zIndex:20,background:`radial-gradient(circle at ${mousePos.x*100}% ${mousePos.y*100}%, ${lang.accent}50, transparent 70%)`,pointerEvents:"none",animation:"ripFade .5s ease forwards",borderRadius:"inherit" });
    ref.current.appendChild(flash);
    setTimeout(()=>flash.remove(),550);
    setTimeout(()=>onSelect(lang),330);
  };

  return (
    <div ref={ref} data-cur onMouseEnter={enter} onMouseLeave={leave} onMouseMove={mouseMove} onClick={click}
      style={{ position:"relative",cursor:"none",overflow:"hidden",border:`1px solid ${hov?lang.accent+"cc":"#1a2030"}`,background:hov?`rgba(${rgb},.06)`:"rgba(5,7,14,.95)",padding:"clamp(20px, 4vw, 48px) clamp(18px, 3vw, 38px)",transformStyle:"preserve-3d",willChange:"transform" }}>
      <div ref={glowRef} style={{ position:"absolute",inset:0,pointerEvents:"none",opacity:0,background:`radial-gradient(ellipse at ${mousePos.x*100}% ${mousePos.y*100}%, rgba(${rgb},0.2) 0%, transparent 70%)`,transition:"background .12s" }}/>
      <div style={{ position:"absolute",top:0,left:0,right:0,height:200,pointerEvents:"none",background:`radial-gradient(ellipse at 50% 0%,rgba(${rgb},${hov?.18:0}) 0%,transparent 70%)`,transition:"background .5s" }}/>
      <div ref={topLine} style={{ position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,transparent,${lang.accent},transparent)`,boxShadow:`0 0 24px 2px ${lang.accent}`,transformOrigin:"center",transform:"scaleX(0)" }}/>
      {["tl","tr","bl","br"].map(c=>(
        <div key={c} style={{ position:"absolute",top:c[0]==="t"?12:"auto",bottom:c[0]==="b"?12:"auto",left:c[1]==="l"?12:"auto",right:c[1]==="r"?12:"auto",width:16,height:16,borderTop:c[0]==="t"?`1.5px solid ${lang.accent}`:"none",borderBottom:c[0]==="b"?`1.5px solid ${lang.accent}`:"none",borderLeft:c[1]==="l"?`1.5px solid ${lang.accent}`:"none",borderRight:c[1]==="r"?`1.5px solid ${lang.accent}`:"none",opacity:hov?1:.2,transition:"opacity .3s, transform .3s",transform:hov?`translate(${c[1]==="l"?"-2px":"2px"},${c[0]==="t"?"-2px":"2px"})`:""}}/>
      ))}
      <div style={{ position:"absolute",bottom:-20,right:-10,fontSize:"clamp(80px, 18vw, 190px)",fontWeight:900,color:lang.accent,opacity:hov?.1:.04,lineHeight:1,fontFamily:"'Fira Code',monospace",pointerEvents:"none",userSelect:"none",transition:"opacity .4s, transform .6s",transform:hov?"translateY(-8px)":"none" }}>{lang.index}</div>
      {hov && <div style={{ position:"absolute",top:0,left:0,right:0,bottom:0,pointerEvents:"none",overflow:"hidden",zIndex:1 }}>
        <div style={{ position:"absolute",width:"100%",height:1,background:`linear-gradient(90deg,transparent,${lang.accent}88,transparent)`,animation:"cardScan 2.2s ease-in-out infinite" }}/>
      </div>}
      <div style={{ position:"relative",zIndex:2 }}>
        <div style={{ fontSize:9,letterSpacing:4,color:lang.accent,opacity:.6,marginBottom:22,fontFamily:"'Fira Code',monospace",transition:"opacity .3s",display:"flex",alignItems:"center",gap:10 }}>
          <span style={{ width:18,height:1,background:lang.accent,display:"inline-block",opacity:.5 }}/>{lang.tag}
        </div>
        <div style={{ fontSize:"clamp(42px, 8vw, 90px)",fontWeight:800,letterSpacing:-4,lineHeight:.87,color:hov?lang.accent:"#c8d8f0",marginBottom:18,transition:"color .28s",textShadow:hov?`0 0 120px ${lang.accent}60, 0 0 40px ${lang.accent}30`:"none",fontFamily:"'Fira Code',monospace" }}>{lbl}</div>
        <div style={{ fontSize:10,color:hov?lang.accent+"aa":"#506070",letterSpacing:3,marginBottom:20,fontFamily:"'Fira Code',monospace",transition:"color .3s" }}>{lang.tagline}</div>
        <div style={{ height:1,background:`linear-gradient(90deg,${lang.accent}aa,${lang.accent}33,transparent)`,marginBottom:22,opacity:hov?1:.3,transition:"opacity .3s" }}/>
        <p style={{ fontSize:"clamp(11px, 2vw, 12px)",color:hov?"#8a9ab0":"#6a7a90",lineHeight:1.9,marginBottom:28,fontFamily:"'Fira Code',monospace",transition:"color .3s" }}>{lang.desc}</p>
        <div style={{ display:"flex",gap:8,flexWrap:"wrap",marginBottom:28 }}>
          {lang.meta.map(m=>(<span key={m} style={{ fontSize:9,letterSpacing:2,padding:"5px 12px",border:`1px solid ${lang.accent}${hov?"66":"33"}`,color:hov?lang.accent:lang.accent+"88",background:`${lang.accent}${hov?"15":"08"}`,fontFamily:"'Fira Code',monospace",transition:"all .3s" }}>{m}</span>))}
        </div>
        <div style={{ marginBottom:38 }}>
          {lang.features.map((f,i)=>(<div key={f} style={{ fontSize:11,color:hov?"#90a0b0":"#506070",marginBottom:9,display:"flex",alignItems:"center",gap:10,fontFamily:"'Fira Code',monospace",transform:hov?"translateX(8px)":"none",transition:`transform .4s ${i*.07}s ease, color .3s` }}>
            <span style={{ color:lang.accent,fontSize:8,transition:"transform .3s",transform:hov?"scale(1.4)":"scale(1)" }}>▶</span>{f}
          </div>))}
        </div>
        <button style={{ width:"100%",padding:"clamp(12px, 3vw, 16px)",cursor:"none",border:`1.5px solid ${lang.accent}${hov?"ff":"66"}`,color:hov?"#fff":lang.accent,fontFamily:"'Fira Code',monospace",fontSize:10,letterSpacing:4,background:hov?`${lang.accent}25`:"transparent",boxShadow:hov?`0 0 70px ${lang.accent}33,inset 0 0 50px ${lang.accent}15, 0 0 0 1px ${lang.accent}44`:"none",transition:"all .35s",position:"relative",overflow:"hidden" }}>
          {hov && <div style={{ position:"absolute",inset:0,background:`linear-gradient(90deg,transparent,${lang.accent}20,transparent)`,animation:"btnShine 1.4s ease-in-out infinite" }}/>}
          <span style={{ position:"relative",zIndex:1 }}>{btn}</span>
        </button>
      </div>
    </div>
  );
}

// ─── STATS STRIP ────────────────────────────────────────────────────────────

function StatsStrip() {
  const stripRef = useRef(null);
  const stats = [
    { label:"LANG FILES",val:3,suffix:"",accent:"#00f7ff" },
    { label:"CONCEPTS COVERED",val:120,suffix:"+",accent:"#ffb347" },
    { label:"HOURS OF CONTENT",val:48,suffix:"H",accent:"#ff3366" },
    { label:"SKILL LEVEL",val:0,suffix:"→∞",accent:"#39ff14" },
  ];
  useEffect(() => {
    if (!stripRef.current) return;
    gsap.from(stripRef.current.querySelectorAll(".stat-item"),{ opacity:0,y:30,stagger:.1,duration:.8,ease:"power2.out",scrollTrigger:{ trigger:stripRef.current,start:"top 88%",once:true } });
    ScrollTrigger.create({ trigger:stripRef.current,start:"top 80%",end:"bottom 20%",scrub:1,onUpdate:(self)=>{ const g=self.progress*.5; if(stripRef.current) stripRef.current.style.boxShadow=`0 0 ${20+g*30}px rgba(0,247,255,${.1+g*.2})`; } });
  }, []);
  return (
    <div ref={stripRef} style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",borderTop:"2px solid rgba(0,247,255,0.25)",borderLeft:"1px solid #1a2030",marginBottom:52,transition:"box-shadow 0.2s" }}>
      {stats.map((s)=>(
        <div key={s.label} className="stat-item" style={{ padding:"clamp(20px, 5vw, 30px) clamp(16px, 4vw, 24px)",borderRight:"1px solid #1a2030",borderBottom:"1px solid #1a2030",fontFamily:"'Fira Code',monospace",position:"relative",overflow:"hidden",transition:"background .3s" }}
          onMouseEnter={e=>e.currentTarget.style.background="rgba(0,247,255,.04)"}
          onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
          <div style={{ position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,${s.accent}aa,transparent)` }}/>
          <div style={{ fontSize:9,letterSpacing:3,color:"#2a3548",marginBottom:10 }}>{s.label}</div>
          <div style={{ fontSize:"clamp(28px, 6vw, 38px)",fontWeight:800,color:s.accent,letterSpacing:-2,textShadow:`0 0 60px ${s.accent}80` }}><AnimCounter to={s.val} suffix={s.suffix}/></div>
        </div>
      ))}
    </div>
  );
}

// ─── FEATURE ITEMS ───────────────────────────────────────────────────────────

function FeatureItem({ item, idx }) {
  const [hov, setHov] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    gsap.set(ref.current,{opacity:0,y:40});
    ScrollTrigger.create({ trigger:ref.current,start:"top 92%",onEnter:()=>gsap.to(ref.current,{opacity:1,y:0,duration:.7,ease:"power3.out",delay:idx*.08}),once:true });
  }, [idx]);
  return (
    <div ref={ref} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ padding:"clamp(20px, 5vw, 30px) clamp(18px, 4vw, 22px)",border:`1px solid ${hov?"#00f7ff60":"#1a2030"}`,background:hov?"rgba(0,247,255,.04)":"transparent",transition:"border-color .3s,background .3s",fontFamily:"'Fira Code',monospace",position:"relative",overflow:"hidden" }}>
      {hov && <div style={{ position:"absolute",top:0,left:0,right:0,height:2,background:"linear-gradient(90deg,transparent,#00f7ffaa,transparent)" }}/>}
      <div style={{ fontSize:"clamp(20px, 5vw, 24px)",marginBottom:16,color:"#00f7ff",opacity:hov?1:.55,transition:"opacity .3s, transform .35s",transform:hov?"scale(1.2) translateX(3px)":"none" }}>{item.icon}</div>
      <div style={{ fontSize:10,letterSpacing:3,color:hov?"#c8d8f0":"#506070",marginBottom:10,transition:"color .3s" }}>{item.title}</div>
      <div style={{ fontSize:"clamp(10px, 2vw, 11px)",color:hov?"#4a6f80":"#2a3548",lineHeight:1.7,transition:"color .3s" }}>{item.desc}</div>
    </div>
  );
}

function HorizontalFeatures() {
  const items = [
    { icon:"◈",title:"MODULAR LESSONS",desc:"Each concept is a self-contained file. Open, decrypt, master." },
    { icon:"⬡",title:"OPERATOR FLOW",desc:"Progress through missions like an intelligence analyst on assignment." },
    { icon:"◎",title:"CASE SYSTEM",desc:"Your learning path is your case file. Every concept a new lead." },
    { icon:"▣",title:"LIVE FEEDBACK",desc:"Instant output. See your code run in real-time terminal output." },
    { icon:"◆",title:"ZERO FILLER",desc:"No fluff. Pure signal. Every lesson is mission-critical intel." },
  ];
  return (
    <div style={{ marginBottom:80 }}>
      <div style={{ fontSize:9,letterSpacing:5,color:"#2a3548",fontFamily:"'Fira Code',monospace",marginBottom:28 }}>// INTEL BRIEF — WHY VISUOSLAYER</div>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:2 }}>
        {items.map((it,i)=><FeatureItem key={it.title} item={it} idx={i}/>)}
      </div>
    </div>
  );
}

// ─── HERO BG ─────────────────────────────────────────────────────────────────

function HeroBG() {
  const cvs = useRef(null);
  useEffect(() => {
    const c = cvs.current; if (!c) return;
    const ctx = c.getContext("2d");
    let W, H;
    const resize = () => { W = c.width = c.offsetWidth; H = c.height = c.offsetHeight; };
    resize();
    window.addEventListener("resize", resize);
    const HEX_R = 42;
    const buildHexes = () => {
      const list = [];
      const cols = Math.ceil(W/(HEX_R*1.732))+2, rows = Math.ceil(H/(HEX_R*1.5))+2;
      for(let r=0;r<rows;r++) for(let col=0;col<cols;col++){
        const ox = r%2===0?0:HEX_R*.866;
        list.push({x:col*HEX_R*1.732+ox,y:r*HEX_R*1.5,pulse:Math.random()*6,speed:.003+Math.random()*.006,bright:Math.random()});
      }
      return list;
    };
    let hexes = buildHexes();
    window.addEventListener("resize",()=>{hexes=buildHexes();});
    const CHARS="01アイウエオ<>{}[]#@";
    const streams = Array.from({length:28},()=>({ x:Math.random()*2000,y:Math.random()*900,speed:.4+Math.random()*.8,chars:Array.from({length:9},()=>CHARS[Math.floor(Math.random()*CHARS.length)]),op:.03+Math.random()*.09,timer:0 }));
    let af; let time=0;
    const draw = () => {
      ctx.clearRect(0,0,W,H); time+=.008;
      const hueBase=180+Math.sin(time)*30;
      hexes.forEach(h=>{
        h.pulse+=h.speed;
        const alpha=(Math.sin(h.pulse)*.5+.5)*h.bright*.05;
        ctx.beginPath();
        for(let i=0;i<6;i++){ const a=(Math.PI/3)*i-Math.PI/6; const px=h.x+HEX_R*.9*Math.cos(a),py=h.y+HEX_R*.9*Math.sin(a); i===0?ctx.moveTo(px,py):ctx.lineTo(px,py); }
        ctx.closePath(); ctx.strokeStyle=`hsla(${hueBase},100%,65%,${alpha})`; ctx.lineWidth=.6; ctx.stroke();
      });
      streams.forEach(s=>{
        s.timer++; if(s.timer%7===0){s.chars.shift();s.chars.push(CHARS[Math.floor(Math.random()*CHARS.length)]);}
        s.y+=s.speed; if(s.y>H+130){s.y=-130;s.x=Math.random()*W;}
        s.chars.forEach((ch,i)=>{ ctx.font="10px 'Fira Code',monospace"; ctx.fillStyle=`hsla(${hueBase},100%,70%,${s.op*((s.chars.length-i)/s.chars.length)})`; ctx.fillText(ch,s.x,s.y+i*13); });
      });
      [[0,0],[W,0],[0,H],[W,H]].forEach(([bx,by])=>{
        const sx=bx===0?1:-1,sy=by===0?1:-1;
        ctx.strokeStyle=`hsla(${hueBase},100%,65%,0.12)`; ctx.lineWidth=1;
        ctx.beginPath(); ctx.moveTo(bx+sx*18,by+sy*1); ctx.lineTo(bx+sx*70,by+sy*1); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(bx+sx*1,by+sy*18); ctx.lineTo(bx+sx*1,by+sy*70); ctx.stroke();
      });
      af=requestAnimationFrame(draw);
    };
    af=requestAnimationFrame(draw);
    return ()=>{cancelAnimationFrame(af);window.removeEventListener("resize",resize);};
  },[]);
  return <canvas ref={cvs} style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none",zIndex:1}}/>;
}

// ─── HERO ────────────────────────────────────────────────────────────────────

function Hero({ eyeRef, h1Ref, subRef }) {
  const reticleRef = useRef(null); const hRef = useRef(null);
  const orb1 = useRef(null); const orb2 = useRef(null);
  const scrollArrow = useRef(null); const dividerRef = useRef(null); const statusRef = useRef(null);
  const [typed, setTyped] = useState("");
  const STATUS = "AWAITING_SELECTION...";

  useEffect(() => {
    let i=0; const iv=setInterval(()=>{setTyped(STATUS.slice(0,i));i=i>=STATUS.length+6?0:i+1;},90);
    return ()=>clearInterval(iv);
  },[]);
  useEffect(()=>{
    if(orb1.current) gsap.to(orb1.current,{x:70,y:-50,duration:8,ease:"sine.inOut",yoyo:true,repeat:-1});
    if(orb2.current) gsap.to(orb2.current,{x:-60,y:40,duration:10,ease:"sine.inOut",yoyo:true,repeat:-1,delay:2});
  },[]);
  useEffect(()=>{
    if(scrollArrow.current) gsap.to(scrollArrow.current,{y:10,duration:1.4,ease:"sine.inOut",yoyo:true,repeat:-1});
    if(dividerRef.current) gsap.from(dividerRef.current,{scaleX:0,duration:1.4,ease:"power3.out",delay:.6,scrollTrigger:{trigger:dividerRef.current,start:"top 95%",once:true}});
    if(statusRef.current) gsap.from(statusRef.current,{x:30,opacity:0,duration:.9,ease:"power3.out",delay:.9});
  },[]);
  useEffect(()=>{
    const el=hRef.current; if(!el) return;
    const move=e=>{const rect=el.getBoundingClientRect();gsap.to(reticleRef.current,{x:e.clientX-rect.left,y:e.clientY-rect.top,duration:.5,ease:"power2.out"});};
    el.addEventListener("mousemove",move); return ()=>el.removeEventListener("mousemove",move);
  },[]);

  return (
    <section ref={hRef} style={{width:"100%",minHeight:"100vh",padding:"80px clamp(20px, 5vw, 80px) 0",position:"relative",overflow:"hidden",display:"flex",flexDirection:"column",justifyContent:"center",boxSizing:"border-box"}}>
      <HeroBG/>
      <PremiumGSAPOrb/>
      <div ref={orb1} style={{position:"absolute",top:"15%",right:"6%",width:600,height:600,borderRadius:"50%",background:"radial-gradient(circle,rgba(0,247,255,.07) 0%,transparent 70%)",pointerEvents:"none",zIndex:0}}/>
      <div ref={orb2} style={{position:"absolute",bottom:"10%",left:"3%",width:440,height:440,borderRadius:"50%",background:"radial-gradient(circle,rgba(0,247,255,.045) 0%,transparent 70%)",pointerEvents:"none",zIndex:0}}/>
      <div ref={reticleRef} style={{position:"absolute",pointerEvents:"none",width:88,height:88,marginLeft:-44,marginTop:-44,zIndex:8,opacity:.3,top:0,left:0}}>
        <svg width="88" height="88" viewBox="0 0 88 88">
          <circle cx="44" cy="44" r="42" fill="none" stroke="#00f7ff" strokeWidth=".5" strokeDasharray="5 9"/>
          <circle cx="44" cy="44" r="5" fill="none" stroke="#00f7ff" strokeWidth="1"/>
          <line x1="0" y1="44" x2="28" y2="44" stroke="#00f7ff" strokeWidth=".6"/>
          <line x1="60" y1="44" x2="88" y2="44" stroke="#00f7ff" strokeWidth=".6"/>
          <line x1="44" y1="0" x2="44" y2="28" stroke="#00f7ff" strokeWidth=".6"/>
          <line x1="44" y1="60" x2="44" y2="88" stroke="#00f7ff" strokeWidth=".6"/>
        </svg>
      </div>
      <div style={{position:"relative",zIndex:10}}>
        <div ref={eyeRef} style={{display:"flex",alignItems:"center",gap:12,marginBottom:28,fontFamily:"'Fira Code',monospace",fontSize:9,letterSpacing:5,color:"#00f7ffaa",flexWrap:"wrap"}}>
          <span style={{width:36,height:2,background:"linear-gradient(90deg,#00f7ff,transparent)",display:"inline-block"}}/>
          VISUOSLAYER // CASE #2026 // LANG-SELECT
          <span style={{width:36,height:2,background:"linear-gradient(270deg,#00f7ff,transparent)",display:"inline-block"}}/>
        </div>
        <h1 ref={h1Ref} style={{lineHeight:.82,fontFamily:"'Fira Code',monospace",fontWeight:800,fontSize:"clamp(48px, 12vw, 190px)",letterSpacing:"-.05em",width:"100%"}}>
          <span className="word" style={{display:"block",color:"transparent",WebkitTextStroke:"1px rgba(200,216,240,.3)",lineHeight:.88}}>BEGINNER?</span>
          <span className="word" style={{display:"block",color:"#00f7ff",textShadow:"0 0 160px rgba(0,247,255,.8),0 0 60px rgba(0,247,255,.5)",animation:"floatY 3.8s ease-in-out infinite",position:"relative",lineHeight:.88}}>
            SELECT
            <span style={{position:"absolute",left:0,top:"52%",width:"100%",height:3,background:"linear-gradient(90deg,transparent 0%,#00f7ff88 30%,#00f7ff 50%,#00f7ff88 70%,transparent 100%)",animation:"scanH 2.8s cubic-bezier(.4,0,.2,1) infinite",pointerEvents:"none",boxShadow:"0 0 18px #00f7ff"}}/>
          </span>
          <span className="word" style={{display:"block",color:"#c8d8f0",lineHeight:.88}}>LANGUAGE</span>
        </h1>
      </div>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:40,marginTop:56,position:"relative",zIndex:10,flexWrap:"wrap"}}>
        <div style={{display:"flex",gap:24,alignItems:"flex-start",maxWidth:520,flex:"1 1 300px"}}>
          <div style={{width:2,minHeight:90,background:"linear-gradient(to bottom,#00f7ff,transparent)",flexShrink:0,marginTop:4,boxShadow:"0 0 12px #00f7ffaa"}}/>
          <p ref={subRef} style={{fontSize:"clamp(11px, 2vw, 12px)",color:"#607080",letterSpacing:1,lineHeight:2,fontFamily:"'Fira Code',monospace"}}>
            Three encrypted files. Each contains the fundamentals of a programming language.
            Select one to begin decryption. Your mission starts now.
            <br/><br/><span style={{color:"#304050"}}>// VISUOSLAYER by SAIF — CASE #2026</span>
          </p>
        </div>
        <div ref={statusRef} style={{flexShrink:0,border:"1px solid #2a3a4a",padding:"clamp(12px, 3vw, 16px) clamp(16px, 4vw, 22px)",fontFamily:"'Fira Code',monospace",fontSize:10,lineHeight:1.9,color:"#2a4050",minWidth:240,background:"rgba(5,7,14,.85)",backdropFilter:"blur(12px)",flex:"0 0 auto",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:"linear-gradient(90deg,transparent,#00f7ff88,transparent)"}}/>
          <div style={{color:"#2a3548",fontSize:9,letterSpacing:3,marginBottom:10}}>SYSTEM STATUS</div>
          {[["KERNEL","OVERRIDE_ACTIVE"],["FILES","3 / UNLOCKED"],["OPERATOR","SAIF"],["SIGNAL","99%"]].map(([k,v])=>(
            <div key={k} style={{display:"flex",justifyContent:"space-between",gap:24}}><span style={{color:"#1e2535"}}>{k}</span><span style={{color:"#4a6a80"}}>{v}</span></div>
          ))}
          <div style={{marginTop:12,borderTop:"1px solid #1a2030",paddingTop:10,color:"#00f7ff77",fontSize:9,letterSpacing:2}}>
            &gt; {typed}<span style={{animation:"bl 1s step-end infinite",color:"#00f7ffaa"}}>_</span>
          </div>
        </div>
      </div>
      <div ref={dividerRef} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:52,paddingTop:18,borderTop:"2px solid rgba(0,247,255,0.4)",fontFamily:"'Fira Code',monospace",fontSize:9,letterSpacing:2,color:"#2a4050",flexWrap:"wrap",gap:12,position:"relative",zIndex:10,transformOrigin:"left",boxShadow:"0 -4px 15px rgba(0,247,255,0.1)"}}>
        <span>CAM_01 · LAT 23.0225°N · LONG 72.5714°E</span>
        <div style={{display:"flex",gap:16,alignItems:"center"}}>
          {[0,1,2,3,4].map(i=><div key={i} style={{width:28,height:2,background:i===2?"#00f7ffaa":"#2a4050",boxShadow:i===2?"0 0 12px #00f7ff":"none"}}/>)}
        </div>
        <span>ALT 53M · <span style={{color:"#00f7ff55"}}>{typed}<span style={{animation:"bl 1s step-end infinite",color:"#00f7ff66"}}>_</span></span></span>
      </div>
      <div ref={scrollArrow} style={{position:"absolute",bottom:36,left:"50%",transform:"translateX(-50%)",zIndex:20,display:"flex",flexDirection:"column",alignItems:"center",gap:8,fontFamily:"'Fira Code',monospace",fontSize:8,letterSpacing:4,color:"#00f7ffaa"}}>
        <span>SCROLL</span>
        <div style={{width:2,height:32,background:"linear-gradient(to bottom,#00f7ffcc,transparent)",boxShadow:"0 0 12px #00f7ff"}}/>
        <svg width="12" height="8" viewBox="0 0 12 8" fill="none"><path d="M1 1L6 7L11 1" stroke="#00f7ff" strokeWidth="1.5" strokeLinecap="round"/></svg>
      </div>
      <style>{`
        @keyframes scanH{0%{transform:translateX(-110%)}100%{transform:translateX(110%)}}
        @keyframes ripFade{from{opacity:1}to{opacity:0}}
        @keyframes cardScan{0%{top:-1px}100%{top:100%}}
        @keyframes btnShine{0%{transform:translateX(-100%)}100%{transform:translateX(200%)}}
      `}</style>
    </section>
  );
}

// ─── PREMIUM MARQUEE WRAPPER — the full enhanced section ─────────────────────

function PremiumMarqueeSection() {
  const sectionRef = useRef(null);
  const topAccentRef = useRef(null);
  const bottomAccentRef = useRef(null);
  const dividerRef = useRef(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    // Scroll-driven glow intensity on the entire section
    ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top 85%",
      end: "bottom 15%",
      scrub: 1.2,
      onUpdate: (self) => {
        const p = self.progress;
        const eased = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
        if (sectionRef.current) {
          sectionRef.current.style.filter = `brightness(${0.85 + eased * 0.3})`;
        }
        if (topAccentRef.current) {
          const hue = 185 + eased * 15;
          const glow = 0.3 + eased * 0.7;
          topAccentRef.current.style.boxShadow = `0 0 ${30 + eased * 40}px ${eased * 8}px hsla(${hue},100%,65%,${glow}), inset 0 0 ${20 + eased * 30}px hsla(${hue},100%,65%,${glow * 0.3})`;
          topAccentRef.current.style.background = `linear-gradient(90deg, transparent 0%, hsla(${hue},100%,70%,${0.5 + eased * 0.5}) 50%, transparent 100%)`;
        }
        if (bottomAccentRef.current) {
          const hue2 = 38 + eased * 10;
          const glow2 = 0.3 + eased * 0.6;
          bottomAccentRef.current.style.boxShadow = `0 0 ${25 + eased * 35}px ${eased * 6}px hsla(${hue2},100%,60%,${glow2}), inset 0 0 ${15 + eased * 25}px hsla(${hue2},100%,60%,${glow2 * 0.3})`;
          bottomAccentRef.current.style.background = `linear-gradient(90deg, transparent 0%, hsla(${hue2},100%,65%,${0.4 + eased * 0.6}) 50%, transparent 100%)`;
        }
        if (dividerRef.current) {
          const glow3 = 0.2 + eased * 0.5;
          dividerRef.current.style.boxShadow = `0 0 ${10 + eased * 20}px rgba(0,247,255,${glow3})`;
          dividerRef.current.style.opacity = `${0.4 + eased * 0.6}`;
        }
      },
    });

    // Entry animation
    gsap.from(sectionRef.current, {
      opacity: 0,
      y: 30,
      duration: 1,
      ease: "power2.out",
      scrollTrigger: { trigger: sectionRef.current, start: "top 90%", once: true },
    });
  }, []);

  return (
    <div
      ref={sectionRef}
      style={{
        overflow: "hidden",
        margin: "60px 0 0",
        position: "relative",
        transition: "filter 0.15s",
      }}
    >
      {/* Top super-glow accent bar */}
      <div
        ref={topAccentRef}
        style={{
          position: "absolute",
          top: 0,
          left: "5%",
          right: "5%",
          height: 3,
          background: "linear-gradient(90deg, transparent, #00f7ffaa, transparent)",
          boxShadow: "0 0 30px 4px rgba(0,247,255,0.3)",
          zIndex: 10,
          pointerEvents: "none",
          transition: "box-shadow 0.1s, background 0.1s",
          borderRadius: 2,
        }}
      />

      {/* Prismatic shimmer overlay — full width, animated */}
      <div style={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        background: "linear-gradient(180deg, rgba(0,247,255,0.025) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0) 60%, rgba(255,179,71,0.025) 100%)",
        animation: "prismPulse 4s ease-in-out infinite alternate",
      }}/>

      {/* Corner reticle marks — top left */}
      <div style={{ position:"absolute", top:0, left:0, width:20, height:20, borderTop:"1px solid #00f7ff66", borderLeft:"1px solid #00f7ff66", zIndex:10, pointerEvents:"none" }}/>
      {/* Corner reticle marks — top right */}
      <div style={{ position:"absolute", top:0, right:0, width:20, height:20, borderTop:"1px solid #00f7ff66", borderRight:"1px solid #00f7ff66", zIndex:10, pointerEvents:"none" }}/>
      {/* Corner reticle marks — bottom left */}
      <div style={{ position:"absolute", bottom:0, left:0, width:20, height:20, borderBottom:"1px solid #ffb34766", borderLeft:"1px solid #ffb34766", zIndex:10, pointerEvents:"none" }}/>
      {/* Corner reticle marks — bottom right */}
      <div style={{ position:"absolute", bottom:0, right:0, width:20, height:20, borderBottom:"1px solid #ffb34766", borderRight:"1px solid #ffb34766", zIndex:10, pointerEvents:"none" }}/>

      {/* Row 1 — Cyan marquee */}
      <ScrollMarquee text="VISUOSLAYER - SAIF - " direction={1} accent="#00f7ff" dim="#0d1e2c" index={0} />

      {/* Divider between rows — premium glowing line */}
      <div
        ref={dividerRef}
        style={{
          position: "relative",
          height: 2,
          background: "linear-gradient(90deg, transparent 0%, #00f7ff33 20%, #00f7ff88 50%, #00f7ff33 80%, transparent 100%)",
          boxShadow: "0 0 10px rgba(0,247,255,0.2)",
          zIndex: 5,
          overflow: "visible",
          transition: "box-shadow 0.1s, opacity 0.1s",
        }}
      >
        {/* Center diamond decoration */}
        <div style={{
          position: "absolute", left: "50%", top: "50%",
          transform: "translate(-50%, -50%) rotate(45deg)",
          width: 6, height: 6,
          background: "#00f7ff",
          boxShadow: "0 0 12px 3px #00f7ff",
          zIndex: 6,
        }}/>
        {/* Side tick marks */}
        {[15, 25, 35, 65, 75, 85].map(pct => (
          <div key={pct} style={{
            position: "absolute", left: `${pct}%`, top: "50%",
            transform: "translate(-50%, -50%)",
            width: 3, height: 3,
            background: "#00f7ff44",
            borderRadius: "50%",
          }}/>
        ))}
        {/* Animated sweep line */}
        <div style={{
          position: "absolute", top: "-1px", left: 0, right: 0, height: 4,
          background: "linear-gradient(90deg, transparent 0%, #00f7ffcc 50%, transparent 100%)",
          filter: "blur(2px)",
          animation: "dividerSweep 3s ease-in-out infinite",
          pointerEvents: "none",
        }}/>
      </div>

      {/* Row 2 — Amber marquee */}
      <ScrollMarquee text="C  - PYTHON - JAVA -" direction={-1} accent="#ffb347" dim="#1a1400" index={1} />

      {/* Bottom super-glow accent bar */}
      <div
        ref={bottomAccentRef}
        style={{
          position: "absolute",
          bottom: 0,
          left: "5%",
          right: "5%",
          height: 3,
          background: "linear-gradient(90deg, transparent, #ffb347aa, transparent)",
          boxShadow: "0 0 25px 3px rgba(255,179,71,0.25)",
          zIndex: 10,
          pointerEvents: "none",
          transition: "box-shadow 0.1s, background 0.1s",
          borderRadius: 2,
        }}
      />

      <style>{`
        @keyframes prismPulse {
          from { opacity: 0.6; }
          to   { opacity: 1;   }
        }
        @keyframes dividerSweep {
          0%   { transform: translateX(-120%); opacity: 0;   }
          20%  { opacity: 1;                                  }
          80%  { opacity: 1;                                  }
          100% { transform: translateX(120%);  opacity: 0;   }
        }
      `}</style>
    </div>
  );
}

// ─── MAIN PAGE ───────────────────────────────────────────────────────────────

export default function Page() {
  const router = useRouter();
  const [booted,     setBooted]     = useState(false);
  const [vis,        setVis]        = useState(false);
  const [activeLang, setActiveLang] = useState(null);

  const eyeRef  = useRef(null);
  const h1Ref   = useRef(null);
  const subRef  = useRef(null);
  const warnRef = useRef(null);

  useEffect(() => {
    let lenis;
    (async () => {
      try {
        const { default: Lenis } = await import("@studio-freight/lenis");
        lenis = new Lenis({ duration:1.2, easing:t=>Math.min(1,1.001-Math.pow(2,-10*t)), smoothWheel:true, wheelMultiplier:0.9, touchMultiplier:1.2, infinite:false });
        const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
        requestAnimationFrame(raf);
        lenis.on("scroll", ScrollTrigger.update);
        ScrollTrigger.scrollerProxy(document.body, {
          scrollTop(value) { return arguments.length ? lenis.scrollTo(value) : lenis.scroll; },
          getBoundingClientRect() { return { top:0,left:0,width:window.innerWidth,height:window.innerHeight }; },
          pinType: document.body.style.transform ? "transform" : "fixed",
        });
        ScrollTrigger.refresh();
      } catch(e) {}
    })();
    return () => { lenis?.destroy(); ScrollTrigger.killAll(); };
  }, []);

  useEffect(() => {
    const onM = e => {
      const x=(e.clientX/window.innerWidth-.5)*18, y=(e.clientY/window.innerHeight-.5)*10;
      if(h1Ref.current) gsap.to(h1Ref.current,{x,y,duration:.9,ease:"power2.out"});
    };
    window.addEventListener("mousemove",onM);
    return ()=>window.removeEventListener("mousemove",onM);
  },[]);

  useEffect(() => {
    if(!booted) return;
    setTimeout(()=>setVis(true),80);
    const tl = gsap.timeline({delay:.3});
    if(eyeRef.current)  tl.from(eyeRef.current,{opacity:0,y:24,duration:.7,ease:"power3.out"});
    if(h1Ref.current)   tl.from(h1Ref.current.querySelectorAll(".word"),{opacity:0,y:80,stagger:.12,duration:1,ease:"power3.out"},"-=.4");
    if(subRef.current)  tl.from(subRef.current,{opacity:0,y:20,duration:.7,ease:"power2.out"},"-=.5");
    if(warnRef.current) {
      ScrollTrigger.create({ trigger:warnRef.current,start:"top 92%",onEnter:()=>gsap.from(warnRef.current,{opacity:0,x:-20,duration:.6,ease:"power2.out"}),once:true });
    }
  },[booted]);

  const handleSelect = useCallback(lang => {
    setActiveLang(lang.label);
    const fl = document.createElement("div");
    Object.assign(fl.style,{position:"fixed",inset:0,zIndex:9000,background:lang.accent,opacity:"0",pointerEvents:"none"});
    document.body.appendChild(fl);
    gsap.timeline()
      .to(fl,{opacity:.22,duration:.2})
      .to(fl,{opacity:0,duration:.45})
      .then(()=>{fl.remove();router.push(lang.route);});
  },[router]);

  return (
    <>
      <Cursor/>
      {!booted && <Boot onDone={()=>setBooted(true)}/>}
      {booted && <><HUD activeLang={activeLang}/><ScrollBar/></>}

      <div style={{position:"fixed",inset:0,background:"#05060e",zIndex:-5}}/>
      <Particles/>
      <svg style={{position:"fixed",inset:0,width:"100%",height:"100%",opacity:.04,pointerEvents:"none",zIndex:1}}>
        <filter id="gr"><feTurbulence type="fractalNoise" baseFrequency=".68" numOctaves="4" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>
        <rect width="100%" height="100%" filter="url(#gr)"/>
      </svg>
      <div style={{position:"fixed",inset:0,zIndex:1,pointerEvents:"none",backgroundImage:"radial-gradient(circle,rgba(0,247,255,.08) 1px,transparent 1px)",backgroundSize:"44px 44px",maskImage:"radial-gradient(ellipse 65% 65% at center,black 10%,transparent 78%)",WebkitMaskImage:"radial-gradient(ellipse 65% 65% at center,black 10%,transparent 78%)"}}/>
      <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:2,background:"repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.065) 2px,rgba(0,0,0,.065) 4px)"}}/>
      <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:3,background:"radial-gradient(ellipse at center,transparent 40%,rgba(5,6,14,.88) 100%)"}}/>

      <main style={{position:"relative",zIndex:10,paddingTop:80,opacity:vis?1:0,transition:"opacity 1s cubic-bezier(.4,0,.2,1)"}}>

        <Hero eyeRef={eyeRef} h1Ref={h1Ref} subRef={subRef}/>

        {/* ── PREMIUM MARQUEE SECTION ── */}
        <PremiumMarqueeSection />

        <section style={{maxWidth:1280,margin:"0 auto",padding:"80px 5vw 140px"}}>
          <Ticker/>
          <StatsStrip/>

          <div style={{display:"flex",gap:0,marginBottom:48,border:"1px solid #1a2030",flexWrap:"wrap"}}>
            {[["ACTIVE_CASE","LANG-SELECT","#00f7ff"],["FILES_FOUND","3","#ffb347"],["CLEARANCE","GRANTED","#39ff14"],["OPERATOR","SAIF","#c8d8f0"],["SYSTEM","VISUOSLAYER","#506070"]].map(([k,v,c],i,a)=>(
              <div key={k} style={{padding:"clamp(10px, 2vw, 13px) clamp(16px, 4vw, 24px)",borderRight:i<a.length-1?"1px solid #1a2030":"none",fontFamily:"'Fira Code',monospace",fontSize:9,letterSpacing:2,background:"rgba(5,7,14,.7)",display:"flex",flexDirection:"column",gap:5,flexShrink:0}}>
                <span style={{color:"#253040"}}>{k}</span>
                <span style={{color:c,textShadow:`0 0 20px ${c}88`}}>{v}</span>
              </div>
            ))}
          </div>

          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:2,marginBottom:80,perspective:"1200px"}}>
            {LANGUAGES.map((lang,i)=><Card key={lang.id} lang={lang} index={i} onSelect={handleSelect}/>)}
          </div>

          <HorizontalFeatures/>

          <div ref={warnRef} style={{display:"flex",alignItems:"center",gap:14,padding:"14px 22px",border:"1px solid #ff3366aa",background:"rgba(255,51,102,.035)",fontFamily:"'Fira Code',monospace",fontSize:9,color:"#3a5060",letterSpacing:2,position:"relative",overflow:"hidden",flexWrap:"wrap"}}>
            <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:"linear-gradient(90deg,#ff336600,#ff3366aa,#ff336600)"}}/>
            <span style={{color:"#ff3366",fontSize:13,animation:"bl 2s step-end infinite",flexShrink:0}}>!</span>
            WARNING: Once a language file is opened, full immersion begins. Proceed carefully.
            <span style={{color:"#2a4050",marginLeft:"auto",flexShrink:0}}> // VISUOSLAYER OS — AUTHORISED BY SAIF</span>
          </div>
        </section>

        <footer style={{borderTop:"2px solid rgba(0,247,255,0.3)",maxWidth:1280,margin:"0 auto",padding:"22px 5vw",display:"flex",justifyContent:"space-between",alignItems:"center",fontFamily:"'Fira Code',monospace",fontSize:9,color:"#2a4050",letterSpacing:2,flexWrap:"wrap",gap:10}}>
          <span>VISUOSLAYER // SAIF</span>
          <span>LANG_FILES — CASE #2026</span>
          <span>ALL FILES ENCRYPTED — AUTHORISED PERSONNEL ONLY</span>
          <span style={{color:"#00f7ff44"}}>SYS.STABLE</span>
        </footer>
      </main>

      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;cursor:none!important}
        html,body{background:#05060e;color:#c8d8f0;font-family:'Fira Code','Courier New',monospace;overflow-x:hidden;scroll-behavior:auto}
        @keyframes floatY{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}
        @keyframes bl{0%,100%{opacity:1}50%{opacity:0}}
        ::selection{background:#00f7ff20;color:#00f7ff}
        ::-webkit-scrollbar{width:3px}
        ::-webkit-scrollbar-track{background:#05060e}
        ::-webkit-scrollbar-thumb{background:#1a2030}
        ::-webkit-scrollbar-thumb:hover{background:#00f7ff66}
        @media(max-width:640px){footer{flex-direction:column;text-align:center}}
      `}</style>
    </>
  );
}