"use client";

import { useState, useEffect, useRef, useMemo, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import CPageLayout, { useActiveSection } from "@/comps/CPageLayout";
import dynamic from "next/dynamic";
import { useVoiceEngine, VoiceButton } from "@/comps/VoiceEngine";

const Hero3D = dynamic(() => import("@/comps/Hero3D"), { ssr: false });

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN TOKENS — unified green neon theme
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
  textStrong: "#FFFFFF",
  muted:   "#3E5A7A",
  dim:     "#1A2A3A",
  mono:    "'JetBrains Mono', monospace",
  display: "'Syne', sans-serif",
  body:    "'Syne', sans-serif",
};

const sp = { type: "spring", stiffness: 320, damping: 32 };
const ease = { type: "tween", duration: 0.3, ease: [0.4, 0, 0.2, 1] };

// ─────────────────────────────────────────────────────────────────────────────
// GLOBAL STYLES
// ─────────────────────────────────────────────────────────────────────────────
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:ital,wght@0,300;0,500;0,700;1,400&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; scrollbar-width: thin; scrollbar-color: ${T.muted} ${T.bg1}; }
    body { background: ${T.bg}; color: ${T.text}; font-family: 'Syne', sans-serif; overflow-x: hidden; }
    ::-webkit-scrollbar { width: 3px; }
    ::-webkit-scrollbar-track { background: ${T.bg}; }
    ::-webkit-scrollbar-thumb { background: ${T.neon}; border-radius: 2px; }
    ::selection { background: rgba(0,255,163,0.18); color: #fff; }
    a { color: inherit; text-decoration: none; }
    button, input, select { font-family: inherit; cursor: pointer; }
    input[type=range] { -webkit-appearance: none; height: 4px; border-radius: 2px; outline: none; background: ${T.muted}55; }
    input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 16px; height: 16px; border-radius: 50%; background: ${T.neon}; border: 2px solid ${T.bg}; cursor: pointer; }
    .fk:focus-visible { outline: 2px solid ${T.neon}; outline-offset: 2px; border-radius: 6px; }
    @keyframes pulse { 0%,100%{opacity:0.4} 50%{opacity:1} }
    @keyframes scanLine { from{transform:translateY(-100%)} to{transform:translateY(200vh)} }
    @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
    @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }

    .page-layout {
      display: grid;
      grid-template-columns: 320px 1fr 220px;
      height: 100vh;
      overflow: hidden;
    }
    @media (max-width: 1100px) {
      .page-layout {
        grid-template-columns: 1fr;
        height: auto;
        overflow-y: auto;
      }
      .sidebar-left, .sidebar-right {
        position: relative !important;
        width: 100% !important;
        height: auto !important;
        border: none !important;
        border-bottom: 1px solid ${T.dim} !important;
      }
    }
  `}</style>
);

// ─────────────────────────────────────────────────────────────────────────────
// SMALL REUSABLE COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
const Tag = ({ c = T.neon2, children }) => (
  <span style={{
    display: "inline-flex", alignItems: "center", padding: "3px 10px", borderRadius: 999,
    fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", fontFamily: T.mono,
    background: `${c}15`, border: `1px solid ${c}40`, color: c, textTransform: "uppercase",
  }}>{children}</span>
);

const Mono = ({ c = T.neon2, size = 13, children, style = {} }) => (
  <span style={{ fontFamily: T.mono, fontSize: size, color: c, ...style }}>{children}</span>
);

const Glow = ({ c = T.neon2, size = 120, x = 0, y = 0, op = 0.12 }) => (
  <div style={{
    position: "absolute", left: x, top: y, width: size, height: size, borderRadius: "50%",
    background: c, filter: `blur(${size * 0.5}px)`, opacity: op, pointerEvents: "none", zIndex: 0,
  }} />
);

// ─────────────────────────────────────────────────────────────────────────────
// SYNTAX HIGHLIGHTER
// ─────────────────────────────────────────────────────────────────────────────
const KW = new Set(["FILE","NULL","EOF","int","char","size_t","long","void","struct","return","if","else","while","for","break","const","unsigned","static","sizeof","typedef","include","define","stderr","stdout","stdin","goto","main","enum"]);
const FN = new Set(["fopen","fclose","fread","fwrite","fprintf","fscanf","fgetc","fputc","fgets","fputs","fseek","ftell","rewind","fflush","setvbuf","feof","ferror","perror","strerror","printf","malloc","free","vfprintf","va_start","va_end","time","strftime","localtime","remove","rename","clearerr","putchar","snprintf"]);
const CN = new Set(["SEEK_SET","SEEK_CUR","SEEK_END","EXIT_SUCCESS","EXIT_FAILURE","_IOFBF","_IOLBF","_IONBF","ENOENT","EACCES","LOG_MAX","LOG_FILE","BACKUP","INFO","WARN","ERROR"]);
const TY = new Set(["uint32_t","uint8_t","int64_t","float","double","bool","Level","FileHeader","Player","Record","va_list"]);

function hl(line) {
  const out = []; let i = 0;
  while (i < line.length) {
    if (line[i] === '/' && line[i+1] === '/') { out.push(<span key={i} style={{color:T.muted}}>{line.slice(i)}</span>); break; }
    if (line[i] === '"' || line[i] === "'") {
      let j = i+1, q = line[i]; while (j < line.length && line[j] !== q) j++;
      out.push(<span key={i} style={{color:T.neon4}}>{line.slice(i,j+1)}</span>); i = j+1; continue;
    }
    if (line[i] === '<' && i > 0) {
      let j = i+1; while (j < line.length && line[j] !== '>') j++;
      out.push(<span key={i} style={{color:T.neon4}}>{line.slice(i,j+1)}</span>); i = j+1; continue;
    }
    if (/[a-zA-Z_]/.test(line[i])) {
      let j = i; while (j < line.length && /\w/.test(line[j])) j++;
      const w = line.slice(i, j);
      const c = KW.has(w) ? T.neon2 : FN.has(w) ? T.neon : CN.has(w) ? T.neon3 : TY.has(w) ? T.accent : T.text;
      out.push(<span key={i} style={{color:c}}>{w}</span>); i = j; continue;
    }
    if (/\d/.test(line[i])) {
      let j = i; while (j < line.length && /[\d.xA-Fa-f]/.test(line[j])) j++;
      out.push(<span key={i} style={{color:T.neon3}}>{line.slice(i,j)}</span>); i = j; continue;
    }
    out.push(<span key={i} style={{color:"#3A5A76"}}>{line[i]}</span>); i++;
  }
  return out;
}

function CodeBlock({ src, title, hlLines = [] }) {
  const [copied, setCopied] = useState(false);
  const lines = src.trim().split("\n");
  return (
    <motion.div initial={{opacity:0,y:12}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={ease}
      style={{borderRadius:12,overflow:"hidden",border:`1px solid ${T.border}`,background:"#030D1A",marginTop:12}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"7px 14px",background:T.dim,borderBottom:`1px solid ${T.border}`}}>
        <div style={{display:"flex",gap:5}}>
          {["#FF5F57","#FEBC2E","#28C840"].map(c=><div key={c} style={{width:8,height:8,borderRadius:"50%",background:c}}/>)}
        </div>
        {title && <Mono c={T.muted} size={9}>{title}</Mono>}
        <button className="fk" onClick={()=>{navigator.clipboard.writeText(src.trim());setCopied(true);setTimeout(()=>setCopied(false),2000);}}
          style={{padding:"2px 9px",borderRadius:5,border:`1px solid ${T.border}`,fontSize:9,color:copied?T.neon4:T.muted,background:copied?`${T.neon4}18`:"transparent",fontFamily:T.mono}}>
          {copied ? "✓ COPIED" : "COPY"}
        </button>
      </div>
      <div style={{overflowX:"auto",padding:"12px 0"}}>
        <table style={{borderSpacing:0,width:"100%",minWidth:"max-content"}}>
          <tbody>
            {lines.map((ln,i)=>{
              const hi = hlLines.includes(i+1);
              return (
                <tr key={i} style={{background:hi?`${T.neon}0E`:"transparent"}}>
                  <td style={{fontFamily:T.mono,fontSize:11,color:hi?T.neon:`${T.muted}66`,textAlign:"right",padding:"1px 12px 1px 8px",userSelect:"none",borderRight:`2px solid ${hi?T.neon:T.dim}`,minWidth:32}}>{i+1}</td>
                  <td style={{padding:"1px 18px 1px 12px",fontFamily:T.mono,fontSize:12,lineHeight:1.75,whiteSpace:"pre"}}>{hl(ln)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION WRAPPER — matches Page 2 style
// ─────────────────────────────────────────────────────────────────────────────
function Section({ id, num, title, sub, color = T.neon, children }) {
  return (
    <section id={id} style={{ padding: "64px 0", borderBottom: `1px solid ${T.dim}`, position: "relative" }}>
      <Glow c={color} size={300} x={-80} y={-40} op={0.03} />
      <motion.div initial={{opacity:0,x:-20}} whileInView={{opacity:1,x:0}} viewport={{once:true}} transition={ease} style={{marginBottom:28}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:4}}>
          <span style={{fontFamily:T.mono,fontSize:9,color:T.muted,letterSpacing:"0.3em"}}>SECTION {num}</span>
          <div style={{flex:1,height:1,background:`linear-gradient(90deg,${color}44,transparent)`}}/>
        </div>
        <h2 style={{fontFamily:T.display,fontSize:"clamp(34px,5vw,58px)",color,letterSpacing:"0.04em",lineHeight:0.92,marginBottom:sub?6:0}}>{title}</h2>
        {sub && <p style={{color:T.muted,fontSize:11,maxWidth:480,marginTop:4}}>{sub}</p>}
      </motion.div>
      <div style={{position:"relative",zIndex:1}}>{children}</div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HERO
// ─────────────────────────────────────────────────────────────────────────────
function FileDiagramAnim() {
  const [tick, setTick] = useState(0);
  useEffect(() => { const id = setInterval(() => setTick(t => t + 1), 70); return () => clearInterval(id); }, []);
  const progress = (tick % 100) / 100;
  const stages = [
    { label: "PROGRAM", sub: "memory", color: T.neon2, x: 8 },
    { label: "STDIO", sub: "buffer", color: T.accent, x: 128 },
    { label: "KERNEL", sub: "syscall", color: T.neon, x: 248 },
    { label: "DISK", sub: "storage", color: T.neon4, x: 368 },
  ];
  const activeEdge = Math.floor(progress * 3);
  const ep = (progress * 3) % 1;
  return (
    <div style={{background:T.bg2,border:`1px solid ${T.border}`,borderRadius:16,padding:"20px 24px",position:"relative",overflow:"hidden"}}>
      <Glow c={T.neon2} size={180} x={-40} y={-50} op={0.06}/>
      <Mono c={T.muted} size={9} style={{letterSpacing:"0.18em",display:"block",marginBottom:16}}>FILE I/O DATA FLOW</Mono>
      <svg width="100%" viewBox="0 0 470 90" style={{overflow:"visible"}}>
        {stages.slice(0,-1).map((s,i) => {
          const x1=s.x+56, x2=stages[i+1].x, y=42;
          const active=i===activeEdge, done=i<activeEdge;
          const px=active?ep:done?1:0;
          return (
            <g key={i}>
              <line x1={x1} y1={y} x2={x2} y2={y} stroke={T.muted} strokeWidth={1.5} opacity={0.3}/>
              <line x1={x1} y1={y} x2={x1+(x2-x1)*px} y2={y} stroke={stages[i].color} strokeWidth={active?2:1.5} opacity={done?0.6:1} strokeDasharray={active?"6 3":"none"}/>
              {active && <circle cx={x1+(x2-x1)*px} cy={y} r={4} fill={stages[i].color} style={{filter:`drop-shadow(0 0 5px ${stages[i].color})`}}/>}
            </g>
          );
        })}
        {stages.map((s,i) => (
          <g key={i}>
            <rect x={s.x} y={16} width={56} height={50} rx={8} fill={`${s.color}14`} stroke={`${s.color}44`} strokeWidth={1.5}/>
            <text x={s.x+28} y={34} textAnchor="middle" fontSize={8} fill={s.color} fontFamily="'Syne'" letterSpacing="0.12em">{s.label}</text>
            <text x={s.x+28} y={50} textAnchor="middle" fontSize={7} fill={T.muted} fontFamily="'JetBrains Mono'">{s.sub}</text>
          </g>
        ))}
      </svg>
      <div style={{display:"flex",gap:2,marginTop:14}}>
        {Array.from({length:12}).map((_,i)=>(
          <div key={i} style={{flex:1,height:7,borderRadius:2,background:i<Math.floor(progress*12)?`${T.neon2}70`:T.dim,border:`1px solid ${T.border}`,transition:"background 0.1s"}}/>
        ))}
      </div>
      <div style={{display:"flex",gap:16,marginTop:12,paddingTop:12,borderTop:`1px solid ${T.border}`}}>
        {[["CALLS",Math.floor(progress*64)],["BYTES",Math.floor(progress*8192)],["BUF %",Math.floor(progress*100)]].map(([l,v])=>(
          <div key={l}>
            <div style={{fontSize:8,color:T.muted,fontFamily:T.mono,letterSpacing:"0.12em"}}>{l}</div>
            <div style={{fontFamily:T.display,fontSize:20,color:T.neon2}}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Hero() {
  const fns = ["fopen()","fclose()","fread()","fwrite()","fseek()","ftell()","fflush()","fprintf()"];
  const [fi, setFi] = useState(0);
  useEffect(() => { const id = setInterval(() => setFi(i => (i+1)%fns.length), 1600); return () => clearInterval(id); }, []);
  return (
    <div style={{paddingTop:48,paddingBottom:32,position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",inset:0,backgroundImage:`linear-gradient(${T.border} 1px,transparent 1px),linear-gradient(90deg,${T.border} 1px,transparent 1px)`,backgroundSize:"48px 48px",opacity:0.5,maskImage:"radial-gradient(ellipse 80% 70% at 50% 50%,black,transparent)"}}/>
      <Glow c={T.neon} size={400} x="25%" y={-60} op={0.05}/>
      <Glow c={T.neon2} size={300} x="60%" y={40} op={0.05}/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:32,alignItems:"center"}}>
        <div style={{position:"relative",zIndex:1}}>
          <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} transition={{duration:0.5}}>
            <Tag c={T.neon}>C · CHAPTER 6</Tag>
          </motion.div>
          <motion.h1 initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} transition={{duration:0.7,delay:0.1}}
            style={{fontFamily:T.display,fontSize:"clamp(54px,7vw,90px)",lineHeight:0.88,letterSpacing:"0.03em",margin:"14px 0 12px",color:T.textStrong}}>
            C FILE<br/>
            <span style={{color:T.neon,WebkitTextStroke:`1px ${T.neon}`,WebkitTextFillColor:"transparent",textShadow:`0 0 40px ${T.neon}60`}}>I/O</span><br/>MASTER
          </motion.h1>
          <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.35}} style={{height:24,overflow:"hidden",marginBottom:16}}>
            <AnimatePresence mode="wait">
              <motion.div key={fi} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} transition={ease}>
                <Mono c={T.neon2} size={14} style={{letterSpacing:"0.04em"}}>{fns[fi]}</Mono>
              </motion.div>
            </AnimatePresence>
          </motion.div>
          <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.5}} style={{display:"flex",gap:5,flexWrap:"wrap"}}>
            {["Modes","Text/Binary","Seeking","Buffering","Structs","Errors","Log System"].map(t=><Tag key={t} c={T.muted}>{t}</Tag>)}
          </motion.div>
        </div>
        <motion.div initial={{opacity:0,scale:0.92}} animate={{opacity:1,scale:1}} transition={{duration:0.7,delay:0.2}}>
          <FileDiagramAnim/>
        </motion.div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// S01: FILE MODES — Animated open/close lifecycle
// ─────────────────────────────────────────────────────────────────────────────
const MODES = [
  { mode:'"r"',  name:"Read",       color:T.neon2,  creates:false, truncates:false, read:true,  write:false, append:false, note:"File must exist. Pointer at byte 0." },
  { mode:'"w"',  name:"Write",      color:T.neon,   creates:true,  truncates:true,  read:false, write:true,  append:false, note:"Creates or TRUNCATES existing file immediately!" },
  { mode:'"a"',  name:"Append",     color:T.neon4,  creates:true,  truncates:false, read:false, write:true,  append:true,  note:"Always writes to end. Safe for logs." },
  { mode:'"r+"', name:"Read+Write", color:T.accent, creates:false, truncates:false, read:true,  write:true,  append:false, note:"File must exist. Full read/write access." },
  { mode:'"w+"', name:"W+Read",     color:T.neon3,  creates:true,  truncates:true,  read:true,  write:true,  append:false, note:"Creates or truncates, then read/write." },
  { mode:'"a+"', name:"App+Read",   color:"#FF9500",creates:true,  truncates:false, read:true,  write:true,  append:true,  note:"Reads anywhere, writes go to end." },
];

function FileLifecycleAnim({ mode }) {
  const [phase, setPhase] = useState(0);
  const phases = ["CLOSED", "fopen()", "IN USE", "fclose()", "CLOSED"];
  const phaseColors = [T.muted, T.neon2, mode.color, T.neon3, T.muted];

  useEffect(() => {
    setPhase(0);
    const timers = [0, 700, 1400, 2200, 3000].map((delay, i) =>
      setTimeout(() => setPhase(i), delay)
    );
    return () => timers.forEach(clearTimeout);
  }, [mode.mode]);

  const content = "Hello, World!\n";
  const bytes = Array.from(content);
  const ptr = mode.append ? bytes.length - 1 : mode.truncates ? 0 : 4;

  return (
    <div style={{background:T.bg2,border:`1px solid ${T.border}`,borderRadius:14,padding:20,overflow:"hidden",position:"relative"}}>
      <Glow c={mode.color} size={160} x={100} y={-30} op={0.06}/>

      {/* Lifecycle phases */}
      <div style={{display:"flex",alignItems:"center",gap:0,marginBottom:20}}>
        {phases.map((p, i) => (
          <div key={i} style={{display:"flex",alignItems:"center",flex:i<4?1:0}}>
            <motion.div
              animate={{
                background: phase >= i ? `${phaseColors[i]}20` : "transparent",
                borderColor: phase >= i ? phaseColors[i] : T.dim,
                color: phase >= i ? phaseColors[i] : T.muted,
              }}
              transition={{duration:0.3}}
              style={{padding:"6px 10px",borderRadius:7,border:"1px solid",fontFamily:T.mono,fontSize:9,letterSpacing:"0.05em",textAlign:"center",whiteSpace:"nowrap"}}
            >
              {p}
            </motion.div>
            {i < 4 && (
              <div style={{flex:1,height:1,position:"relative",margin:"0 4px"}}>
                <div style={{height:1,width:"100%",background:T.dim}}/>
                <motion.div animate={{scaleX:phase>i?1:0}} initial={{scaleX:0}} transition={{duration:0.3}} style={{position:"absolute",top:0,left:0,right:0,height:1,background:mode.color,transformOrigin:"left"}}/>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Tape visualization */}
      <Mono c={T.muted} size={8} style={{display:"block",marginBottom:8,letterSpacing:"0.12em"}}>FILE CONTENTS</Mono>
      <div style={{display:"flex",gap:3,flexWrap:"wrap",marginBottom:16}}>
        {bytes.map((b, i) => {
          const isPtr = i === ptr && phase === 2;
          const deleted = mode.truncates && phase >= 2;
          return (
            <div key={i} style={{position:"relative"}}>
              <motion.div
                animate={{
                  background: deleted ? `${T.neon3}25` : phase >= 2 ? `${mode.color}18` : T.dim,
                  borderColor: isPtr ? mode.color : deleted ? T.neon3 : T.border,
                  scale: isPtr ? 1.1 : 1,
                }}
                style={{width:28,height:32,display:"flex",alignItems:"center",justifyContent:"center",borderRadius:5,border:"1px solid",fontFamily:T.mono,fontSize:11}}
              >
                <span style={{color:deleted?T.neon3:mode.color}}>{deleted?"✕":b==="\n"?"↵":b}</span>
              </motion.div>
              {isPtr && <div style={{position:"absolute",top:-11,left:"50%",transform:"translateX(-50%)",fontSize:8,color:mode.color,fontFamily:T.mono}}>▼fp</div>}
            </div>
          );
        })}
      </div>

      {/* Flags */}
      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
        {[{l:"Creates",v:mode.creates},{l:"Truncates",v:mode.truncates},{l:"Read",v:mode.read},{l:"Write",v:mode.write},{l:"Append",v:mode.append}].map(({l,v})=>(
          <div key={l} style={{padding:"3px 9px",borderRadius:6,fontSize:10,fontFamily:T.mono,background:v?`${T.neon4}12`:`${T.neon3}0A`,border:`1px solid ${v?T.neon4:T.neon3}30`,color:v?T.neon4:T.neon3}}>
            {v?"✓":"✗"} {l}
          </div>
        ))}
      </div>
    </div>
  );
}

function S01() {
  const [sel, setSel] = useState(0);
  const m = MODES[sel];
  return (
    <Section id="s01" num="01" title="FILE MODES" color={T.neon2} sub="How fopen() opens, creates, or truncates files">
      <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:6,marginBottom:18}}>
        {MODES.map((md, i) => (
          <motion.button key={i} className="fk" onClick={() => setSel(i)} whileHover={{y:-2}} whileTap={{scale:0.96}}
            style={{padding:"10px 4px",borderRadius:10,border:`1px solid ${sel===i?md.color:T.border}`,background:sel===i?`${md.color}18`:T.bg2,transition:"all 0.2s",textAlign:"center"}}>
            <div style={{fontFamily:T.display,fontSize:18,color:sel===i?md.color:T.text}}>{md.mode}</div>
            <div style={{fontSize:8,fontFamily:T.mono,color:sel===i?md.color:T.muted,marginTop:1}}>{md.name}</div>
          </motion.button>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        <AnimatePresence mode="wait">
          <motion.div key={sel} initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}} exit={{opacity:0}} transition={ease}>
            <div style={{background:T.bg2,border:`1px solid ${m.color}30`,borderRadius:14,padding:18,position:"relative",overflow:"hidden",marginBottom:12}}>
              <Glow c={m.color} size={140} x={-30} y={-40} op={0.08}/>
              <div style={{fontFamily:T.display,fontSize:40,color:m.color,lineHeight:1}}>{m.mode}</div>
              <div style={{fontFamily:T.body,fontWeight:700,fontSize:16,color:T.textStrong,marginTop:2,marginBottom:8}}>{m.name}</div>
              <p style={{fontSize:11,color:T.muted,lineHeight:1.6}}>{m.note}</p>
            </div>
            <FileLifecycleAnim mode={m}/>
          </motion.div>
        </AnimatePresence>
        <CodeBlock src={`FILE *fp = fopen("data.txt", ${m.mode});
if (fp == NULL) {    // ALWAYS check!
    perror("fopen");
    return EXIT_FAILURE;
}

// ... read/write operations ...

if (fclose(fp) != 0) {
    perror("fclose");
}
return EXIT_SUCCESS;`} title="fopen.c" hlLines={[1,2,3,4]}/>
      </div>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// S02: TEXT vs BINARY — Animated byte inspector
// ─────────────────────────────────────────────────────────────────────────────
function ByteStreamViz({ value, mode }) {
  const [animated, setAnimated] = useState(false);
  const [hovByte, setHovByte] = useState(null);

  useEffect(() => { setAnimated(false); const t = setTimeout(() => setAnimated(true), 100); return () => clearTimeout(t); }, [mode]);

  const textBytes = Array.from(String(value)).map(c => c.charCodeAt(0));
  const n = parseInt(value) || 1000;
  const binBytes = [(n>>24)&0xFF,(n>>16)&0xFF,(n>>8)&0xFF,n&0xFF];
  const bytes = mode === "text" ? textBytes : binBytes;
  const c = mode === "text" ? T.neon4 : T.accent;

  return (
    <div style={{padding:18}}>
      <Mono c={T.muted} size={9} style={{display:"block",marginBottom:10,letterSpacing:"0.1em"}}>
        {mode === "text" ? `"${value}" = ${bytes.length} ASCII chars = ${bytes.length} bytes` : `${value} = 4 raw bytes (0x${n.toString(16).padStart(8,"0").toUpperCase()})`}
      </Mono>

      {/* Animated byte stream */}
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}>
        {bytes.map((b, i) => (
          <motion.div key={`${mode}-${i}`}
            initial={{opacity:0,y:12,scale:0.8}} animate={{opacity:1,y:0,scale:1}} transition={{delay:i*0.08,type:"spring",stiffness:260}}
            whileHover={{scale:1.1,y:-2}}
            onHoverStart={()=>setHovByte(i)} onHoverEnd={()=>setHovByte(null)}
            style={{padding:"10px 8px",borderRadius:10,textAlign:"center",minWidth:56,background:hovByte===i?`${c}25`:T.dim,border:`1px solid ${hovByte===i?c:T.border}`,cursor:"pointer",transition:"background 0.15s,border-color 0.15s"}}>
            <div style={{fontFamily:T.mono,fontSize:13,fontWeight:700,color:c}}>{`0x${b.toString(16).toUpperCase().padStart(2,"0")}`}</div>
            <div style={{fontSize:8,color:T.muted,marginTop:2}}>{b>=32&&b<127?String.fromCharCode(b):`·`}</div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {hovByte !== null && (
          <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}}
            style={{padding:"10px 12px",borderRadius:8,background:`${c}0C`,border:`1px solid ${c}25`,display:"flex",gap:16,fontFamily:T.mono,fontSize:11,overflow:"hidden"}}>
            {[["HEX",bytes[hovByte].toString(16).toUpperCase().padStart(2,"0")],["DEC",bytes[hovByte]],["BIN",bytes[hovByte].toString(2).padStart(8,"0")],["ASCII",bytes[hovByte]>=32&&bytes[hovByte]<127?String.fromCharCode(bytes[hovByte]):"N/A"]].map(([l,v])=>(
              <div key={l}><div style={{fontSize:8,color:T.muted,letterSpacing:"0.1em"}}>{l}</div><div style={{color:T.textStrong,marginTop:1}}>{v}</div></div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function S02() {
  const [mode, setMode] = useState("text");
  const [inputVal, setInputVal] = useState("1000");
  return (
    <Section id="s02" num="02" title="TEXT vs BINARY" color={T.neon4} sub="How the same value is stored differently on disk">
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:14}}>
        <div style={{background:T.bg2,borderRadius:14,border:`1px solid ${T.border}`,overflow:"hidden"}}>
          <div style={{display:"flex",borderBottom:`1px solid ${T.border}`}}>
            {["text","binary"].map(m => (
              <button key={m} className="fk" onClick={() => setMode(m)} style={{flex:1,padding:"10px",fontFamily:T.display,fontSize:15,letterSpacing:"0.1em",color:mode===m?(m==="text"?T.neon4:T.accent):T.muted,background:mode===m?(m==="text"?`${T.neon4}12`:`${T.accent}12`):"transparent",borderBottom:mode===m?`2px solid ${m==="text"?T.neon4:T.accent}`:"2px solid transparent",transition:"all 0.2s"}}>
                {m==="text" ? "TEXT MODE" : "BINARY MODE"}
              </button>
            ))}
          </div>
          <div style={{padding:"8px 16px",borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",gap:10}}>
            <Mono c={T.muted} size={9}>VALUE:</Mono>
            <input value={inputVal} onChange={e=>setInputVal(e.target.value)} style={{background:"transparent",border:`1px solid ${T.border}`,borderRadius:6,padding:"4px 10px",fontFamily:T.mono,fontSize:12,color:mode==="text"?T.neon4:T.accent,outline:"none",width:80}}/>
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={mode+inputVal} initial={{opacity:0}} animate={{opacity:1}} transition={ease}>
              <ByteStreamViz value={inputVal} mode={mode}/>
            </motion.div>
          </AnimatePresence>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {[
            {label:"Text Mode",c:T.neon4,items:["fprintf / fscanf / fgets","\\n → \\r\\n on Windows (translation)","Human-readable, editor-friendly","CSV, config, log files"]},
            {label:"Binary Mode",c:T.accent,items:["fread / fwrite (no translation)","Exact bytes copied to disk","Platform-dependent struct sizes","Images, structs, databases"]},
          ].map(card => (
            <div key={card.label} style={{flex:1,background:T.bg2,borderRadius:12,padding:16,border:`1px solid ${card.c}22`}}>
              <div style={{fontFamily:T.display,fontSize:17,color:card.c,marginBottom:8}}>{card.label}</div>
              {card.items.map(it=>(
                <div key={it} style={{display:"flex",gap:7,marginBottom:5,fontSize:11,color:T.text}}>
                  <span style={{color:card.c,fontSize:8,marginTop:3}}>▸</span>{it}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <CodeBlock src={`// TEXT — fprintf/fscanf
FILE *tf = fopen("data.txt", "w");
fprintf(tf, "%d", 1000);  // Writes: "1000" (4 bytes ASCII)
fclose(tf);

// BINARY — fwrite/fread
FILE *bf = fopen("data.bin", "wb");
int val = 1000;
fwrite(&val, sizeof(int), 1, bf);  // Writes: 0x000003E8 (4 bytes)
fclose(bf);`} title="text_vs_binary.c" hlLines={[3,9]}/>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// S03: READING & WRITING — Pipeline animation
// ─────────────────────────────────────────────────────────────────────────────
const IO_OPS = [
  { fn:"fgetc/fputc", color:T.neon2, icon:"①", label:"Char-by-Char", unit:"1 byte",
    code:`int c = fgetc(fp);    // Returns int — NOT char!
if (c == EOF) { /* end or error */ }
fputc('A', fp);`},
  { fn:"fgets/fputs", color:T.accent, icon:"②", label:"Line-by-Line", unit:"1 line",
    code:`char buf[256];
if (fgets(buf, sizeof(buf), fp) == NULL) {
    // EOF or error
}
fputs("Hello\\n", fp);`},
  { fn:"fread/fwrite", color:T.neon4, icon:"③", label:"Block", unit:"N bytes",
    code:`uint8_t buf[4096];
size_t n = fread(buf, 1, sizeof(buf), fp);
if (n == 0 && ferror(fp)) perror("fread");
size_t w = fwrite(buf, 1, n, fp);`},
  { fn:"fprintf/fscanf", color:T.neon, icon:"④", label:"Formatted", unit:"parsed",
    code:`int age; float salary;
int matched = fscanf(fp, "%d %f", &age, &salary);
if (matched != 2) { /* parse error */ }
fprintf(fp, "Age: %d\\n", age);`},
];

function DataFlowAnim({ op, active }) {
  const [tick, setTick] = useState(0);
  useEffect(() => { if (active) { const id = setInterval(() => setTick(t => (t+1)%60), 55); return () => clearInterval(id); } }, [active]);
  const p = tick / 60;
  const c = op.color;
  const nodes = ["PROGRAM","BUFFER","FILE","DISK"];

  return (
    <div style={{padding:"16px 16px 12px",background:T.bg2,borderRadius:12,border:`1px solid ${c}22`}}>
      <svg width="100%" viewBox="0 0 440 72" style={{overflow:"visible"}}>
        {nodes.map((n, i) => (
          <g key={i}>
            <rect x={i*110+2} y={10} width={82} height={48} rx={8} fill={`${c}12`} stroke={`${c}${i<=Math.floor(p*3)+1?"44":"22"}`} strokeWidth={1.5}/>
            <text x={i*110+43} y={30} textAnchor="middle" fontSize={8} fill={c} fontFamily="'Syne'" letterSpacing="0.1em">{n}</text>
            <text x={i*110+43} y={46} textAnchor="middle" fontSize={8} fill={T.muted} fontFamily="'JetBrains Mono'">{op.unit}</text>
            {i < 3 && (
              <g>
                <line x1={i*110+84} y1={34} x2={i*110+110} y2={34} stroke={T.muted} strokeWidth={1.5} opacity={0.3}/>
                {active && Math.floor(p*3) === i && (
                  <circle cx={i*110+84+26*(p*3-i)} cy={34} r={4} fill={c} style={{filter:`drop-shadow(0 0 4px ${c})`}}/>
                )}
              </g>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}

function S03() {
  const [step, setStep] = useState(0);
  return (
    <Section id="s03" num="03" title="READING & WRITING" color={T.neon4} sub="Four I/O strategies — choose based on your use case">
      <div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap"}}>
        {IO_OPS.map((op, i) => (
          <button key={i} className="fk" onClick={() => setStep(i)}
            style={{padding:"7px 14px",borderRadius:9,border:`1px solid ${step===i?op.color:T.border}`,background:step===i?`${op.color}18`:T.bg2,fontFamily:T.mono,fontSize:11,color:step===i?op.color:T.muted,transition:"all 0.2s"}}>
            {op.icon} {op.fn}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0}} transition={ease}>
          <DataFlowAnim op={IO_OPS[step]} active={true}/>
          <CodeBlock src={IO_OPS[step].code} title={`${IO_OPS[step].fn}.c`}/>
        </motion.div>
      </AnimatePresence>

      {/* fgetc bug callout */}
      <div style={{marginTop:18,display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <div style={{background:T.bg2,borderRadius:10,padding:14,border:`1px solid ${T.neon4}22`}}>
          <div style={{fontFamily:T.display,fontSize:14,color:T.neon4,marginBottom:6}}>✓ CORRECT</div>
          <div style={{fontFamily:T.mono,fontSize:11,lineHeight:1.9,color:T.text}}>
            <span style={{color:T.neon2}}>int</span>{" c = "}<span style={{color:T.neon}}>fgetc</span>(fp);<br/>
            <span style={{color:T.neon2}}>while</span>(c != EOF) {"{"}…{"}"}
          </div>
        </div>
        <div style={{background:T.bg2,borderRadius:10,padding:14,border:`1px solid ${T.neon3}22`}}>
          <div style={{fontFamily:T.display,fontSize:14,color:T.neon3,marginBottom:6}}>✗ BUG — unsigned char</div>
          <div style={{fontFamily:T.mono,fontSize:11,lineHeight:1.9,color:T.text}}>
            <span style={{color:T.neon3}}>char</span>{" c = "}<span style={{color:T.neon}}>fgetc</span>(fp);<br/>
            <span style={{color:T.muted}}>// EOF (-1) wraps → never detected!</span>
          </div>
        </div>
      </div>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// S04: ERRORS & EOF
// ─────────────────────────────────────────────────────────────────────────────
const ERRS = [
  { k:"ENOENT", n:"File Not Found",    c:T.neon3,  errno:2,  code:`FILE *fp = fopen("missing.txt", "r");
if (fp == NULL) {
    perror("fopen");   // "No such file or directory"
    // errno == ENOENT (2)
}`},
  { k:"EACCES", n:"Permission Denied", c:T.neon,   errno:13, code:`FILE *fp = fopen("/etc/shadow", "r");
if (fp == NULL) {
    perror("fopen");   // "Permission denied"
    // errno == EACCES (13)
}`},
  { k:"ENOSPC", n:"Disk Full",         c:T.accent, errno:28, code:`size_t n = fwrite(buf, 1, len, fp);
if (n < len) {
    perror("fwrite");  // "No space left on device"
    clearerr(fp);      // reset error flag
}`},
  { k:"EMFILE", n:"Too Many Open",     c:T.neon4,  errno:24, code:`// OS limit: ~1024 fds on Linux
// ALWAYS fclose() when done!
fclose(fp);   // Release the fd slot`},
];

function ErrorFlowAnim({ e }) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    setStep(0);
    const timers = [0,500,1000,1600].map((d,i) => setTimeout(()=>setStep(i+1),d));
    return () => timers.forEach(clearTimeout);
  }, [e.k]);
  const steps = ["fopen()","→ NULL","→ errno","→ perror()"];
  return (
    <div style={{display:"flex",alignItems:"center",gap:0,flexWrap:"wrap",marginTop:12}}>
      {steps.map((s, i) => (
        <div key={i} style={{display:"flex",alignItems:"center"}}>
          <motion.div animate={{background:step>i?`${e.c}18`:"transparent",borderColor:step>i?e.c:T.dim,color:step>i?e.c:T.muted}} transition={{duration:0.3}}
            style={{padding:"4px 10px",borderRadius:6,border:"1px solid",fontFamily:T.mono,fontSize:9}}>
            {s}
          </motion.div>
          {i<3 && <motion.div animate={{scaleX:step>i?1:0}} initial={{scaleX:0}} transition={{duration:0.2}} style={{width:16,height:1,background:e.c,transformOrigin:"left",margin:"0 2px"}}/>}
        </div>
      ))}
    </div>
  );
}

function S04() {
  const [sel, setSel] = useState(0);
  const e = ERRS[sel];
  return (
    <Section id="s04" num="04" title="ERRORS & EOF" color={T.neon3} sub="Always check return values — never assume success">
      <div style={{display:"grid",gridTemplateColumns:"180px 1fr",gap:14}}>
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {ERRS.map((er, i) => (
            <button key={i} className="fk" onClick={() => setSel(i)} style={{padding:"10px 12px",borderRadius:10,border:`1px solid ${sel===i?er.c:T.border}`,background:sel===i?`${er.c}14`:T.bg2,textAlign:"left",transition:"all 0.2s"}}>
              <div style={{fontFamily:T.mono,fontSize:8,color:sel===i?er.c:T.muted,letterSpacing:"0.1em"}}>{er.k}</div>
              <div style={{fontSize:11,color:sel===i?T.textStrong:T.text,marginTop:2}}>{er.n}</div>
              <div style={{fontFamily:T.display,fontSize:16,color:sel===i?er.c:T.muted,marginTop:1}}>errno={er.errno}</div>
            </button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={sel} initial={{opacity:0,x:10}} animate={{opacity:1,x:0}} exit={{opacity:0}} transition={ease}>
            <div style={{background:T.bg2,borderRadius:12,border:`1px solid ${e.c}28`,padding:18,marginBottom:12,position:"relative",overflow:"hidden"}}>
              <Glow c={e.c} size={130} x={160} y={-30} op={0.07}/>
              <div style={{fontFamily:T.display,fontSize:32,color:e.c,lineHeight:1}}>{e.k}</div>
              <div style={{fontSize:12,color:T.text,marginBottom:8}}>{e.n} — errno {e.errno}</div>
              <ErrorFlowAnim e={e}/>
            </div>
            <CodeBlock src={e.code}/>
          </motion.div>
        </AnimatePresence>
      </div>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// S05: FILE POINTERS & SEEK — Interactive animator
// ─────────────────────────────────────────────────────────────────────────────
function SeekViz() {
  const content = "Hello, World!\n";
  const bytes = Array.from(content);
  const [pos, setPos] = useState(0);
  const [whence, setWhence] = useState("SEEK_SET");
  const [offset, setOffset] = useState(0);
  const base = whence === "SEEK_SET" ? 0 : whence === "SEEK_CUR" ? pos : bytes.length;
  const newPos = Math.max(0, Math.min(bytes.length, base + offset));

  return (
    <div style={{background:T.bg2,borderRadius:14,border:`1px solid ${T.border}`,overflow:"hidden"}}>
      <div style={{padding:"8px 14px",borderBottom:`1px solid ${T.border}`}}>
        <Mono c={T.muted} size={9} style={{letterSpacing:"0.14em"}}>INTERACTIVE FILE POINTER — click bytes to teleport</Mono>
      </div>
      <div style={{padding:18}}>
        <div style={{display:"flex",gap:3,flexWrap:"wrap",marginBottom:18}}>
          {bytes.map((ch, i) => (
            <motion.div key={i} whileHover={{scale:1.12,y:-2}} onClick={() => setPos(i)}
              animate={{background:i===pos?`${T.neon}28`:T.dim, borderColor:i===pos?T.neon:T.border}} transition={ease}
              style={{width:32,height:40,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",borderRadius:6,border:"1px solid",cursor:"pointer",position:"relative"}}>
              {i===pos && <div style={{position:"absolute",top:-13,fontSize:9,color:T.neon,fontFamily:T.mono}}>▼fp</div>}
              <Mono c={i===pos?T.neon:T.text} size={11}>{ch==="\n"?"↵":ch}</Mono>
              <Mono c={T.muted} size={7}>{i}</Mono>
            </motion.div>
          ))}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
          <div>
            <Mono c={T.muted} size={9} style={{display:"block",marginBottom:6,letterSpacing:"0.12em"}}>WHENCE</Mono>
            {["SEEK_SET","SEEK_CUR","SEEK_END"].map(w => (
              <button key={w} className="fk" onClick={() => setWhence(w)} style={{display:"block",width:"100%",marginBottom:5,padding:"7px 10px",borderRadius:7,textAlign:"left",background:whence===w?`${T.neon2}15`:T.dim,border:`1px solid ${whence===w?T.neon2:T.border}`,transition:"all 0.2s"}}>
                <Mono c={whence===w?T.neon2:T.text} size={11}>{w}</Mono>
                <div style={{fontSize:9,color:T.muted}}>{w==="SEEK_SET"?"from start":w==="SEEK_CUR"?"from current":"from end"}</div>
              </button>
            ))}
          </div>
          <div>
            <Mono c={T.muted} size={9} style={{display:"block",marginBottom:6,letterSpacing:"0.12em"}}>OFFSET: {offset}</Mono>
            <input type="range" min={-5} max={14} value={offset} onChange={e=>setOffset(Number(e.target.value))} style={{width:"100%",marginBottom:12}}/>
            <div style={{padding:"8px 12px",background:T.dim,borderRadius:9,marginBottom:10}}>
              <Mono c={T.neon} size={11}>fseek</Mono>
              <Mono c={T.text} size={11}>(fp, {offset}, {whence});</Mono>
              <br/><Mono c={T.muted} size={9}>→ new position: {newPos}</Mono>
            </div>
            <motion.button className="fk" onClick={() => setPos(newPos)} whileTap={{scale:0.97}}
              style={{width:"100%",padding:"8px",borderRadius:8,background:`${T.neon}18`,border:`1px solid ${T.neon}44`,color:T.neon,fontFamily:T.mono,fontSize:11}}>
              Apply fseek →
            </motion.button>
            <div style={{marginTop:10}}>
              <Mono c={T.muted} size={9} style={{display:"block"}}>ftell(fp) =</Mono>
              <span style={{fontFamily:T.display,fontSize:30,color:T.neon2}}>{pos}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function S05() {
  return (
    <Section id="s05" num="05" title="FILE POINTERS & SEEK" color={T.accent} sub="Navigate anywhere in a file — not just front-to-back">
      <SeekViz/>
      <CodeBlock src={`// Jump to record #10 in a binary file
long offset = 10L * sizeof(Record);
if (fseek(fp, offset, SEEK_SET) != 0) {
    perror("fseek");
}
long pos = ftell(fp);   // current position → 440
rewind(fp);              // fseek(fp, 0, SEEK_SET)`} title="seek.c" hlLines={[2,3,4]}/>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// S06: BUFFERING — Buffer size vs syscall visualizer
// ─────────────────────────────────────────────────────────────────────────────
function BufferViz() {
  const [size, setSize] = useState(512);
  const fileSize = 65536;
  const calls = Math.ceil(fileSize / size);
  const eff = Math.min(100, Math.round((1 - calls / fileSize) * 100));
  const c = calls === 1 ? T.neon4 : calls < 20 ? T.neon2 : calls < 200 ? T.neon : T.neon3;
  return (
    <div style={{background:T.bg2,borderRadius:14,border:`1px solid ${T.border}`,overflow:"hidden"}}>
      <div style={{padding:"8px 14px",borderBottom:`1px solid ${T.border}`}}>
        <Mono c={T.muted} size={9} style={{letterSpacing:"0.14em"}}>BUFFER SIZE vs SYSCALLS (64KB file)</Mono>
      </div>
      <div style={{padding:18}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:16}}>
          {[{l:"BUFFER",v:size>=1024?`${size/1024}KB`:`${size}B`,c:T.neon2},{l:"SYSCALLS",v:calls.toLocaleString(),c},{l:"EFFICIENCY",v:`${eff}%`,c:eff>80?T.neon4:eff>50?T.neon:T.neon3}].map(({l,v,c})=>(
            <div key={l} style={{background:T.dim,borderRadius:9,padding:"10px 12px",border:`1px solid ${c}22`}}>
              <div style={{fontSize:8,color:T.muted,fontFamily:T.mono,letterSpacing:"0.1em",marginBottom:2}}>{l}</div>
              <div style={{fontFamily:T.display,fontSize:24,color:c}}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{height:8,background:T.dim,borderRadius:5,overflow:"hidden",marginBottom:4}}>
          <motion.div animate={{width:`${eff}%`}} transition={sp} style={{height:"100%",borderRadius:5,background:`linear-gradient(90deg,${T.neon3},${T.neon4})`}}/>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:8,color:T.muted,fontFamily:T.mono,marginBottom:10}}>
          <span>1B (worst)</span><span>8KB (default)</span>
        </div>
        <input type="range" min={1} max={8192} step={1} value={size} onChange={e=>setSize(Number(e.target.value))} style={{width:"100%",marginBottom:12}}/>
        <div style={{padding:"7px 12px",borderRadius:7,background:eff>80?`${T.neon4}0E`:`${T.neon3}0E`,border:`1px solid ${eff>80?T.neon4:T.neon3}28`,fontSize:11,fontFamily:T.mono,color:eff>80?T.neon4:T.neon3}}>
          {calls===1 ? "✓ Single read — optimal!" : calls<20 ? "✓ Good" : calls<200 ? "△ Acceptable" : "✗ Too many tiny reads — slow!"}
        </div>
      </div>
    </div>
  );
}

function S06() {
  return (
    <Section id="s06" num="06" title="BUFFERING" color={T.neon} sub="STDIO caches writes — control when bytes actually hit disk">
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18,marginBottom:14}}>
        <BufferViz/>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {[{flag:"_IOFBF",name:"Fully Buffered",c:T.neon4,desc:"Default for files. Flushes when full or on fflush()."},
            {flag:"_IOLBF",name:"Line Buffered",c:T.neon2,desc:"Flushes on \\n. Default for stdout (terminal)."},
            {flag:"_IONBF",name:"Unbuffered",c:T.neon3,desc:"Every write = syscall. Default for stderr."}].map(b=>(
            <div key={b.flag} style={{flex:1,background:T.bg2,borderRadius:10,padding:"12px 14px",border:`1px solid ${b.c}20`}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
                <Mono c={b.c} size={11}>{b.flag}</Mono>
                <span style={{fontFamily:T.display,fontSize:14,color:T.text}}>{b.name}</span>
              </div>
              <p style={{fontSize:11,color:T.muted}}>{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
      <CodeBlock src={`setvbuf(fp, NULL, _IOFBF, 65536);   // 64KB fully-buffered
setvbuf(stdout, NULL, _IOLBF, 0);   // line-buffered
setvbuf(stderr, NULL, _IONBF, 0);   // unbuffered

fflush(fp);    // Force-flush before fseek or fork!`} title="buffering.c" hlLines={[4]}/>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// S07: STRUCTURED DATA — Struct layout visualizer
// ─────────────────────────────────────────────────────────────────────────────
const FIELDS = [
  { name:"id",     type:"uint32_t", bytes:4,  offset:0,  color:T.neon2  },
  { name:"score",  type:"float",    bytes:4,  offset:4,  color:T.neon4  },
  { name:"level",  type:"uint8_t",  bytes:1,  offset:8,  color:T.accent },
  { name:"_pad",   type:"padding",  bytes:3,  offset:9,  color:T.muted  },
  { name:"name[]", type:"char[32]", bytes:32, offset:12, color:T.neon   },
];

function StructViz() {
  const [hov, setHov] = useState(null);
  const total = FIELDS.reduce((a,f) => a+f.bytes, 0);
  return (
    <div style={{background:T.bg2,borderRadius:14,border:`1px solid ${T.border}`,overflow:"hidden"}}>
      <div style={{padding:"8px 14px",borderBottom:`1px solid ${T.border}`}}>
        <Mono c={T.muted} size={9} style={{letterSpacing:"0.14em"}}>STRUCT MEMORY LAYOUT — {total} bytes total</Mono>
      </div>
      <div style={{padding:18}}>
        {/* Byte map */}
        <div style={{display:"flex",height:48,borderRadius:8,overflow:"hidden",marginBottom:4,border:`1px solid ${T.border}`}}>
          {FIELDS.map((f, i) => (
            <motion.div key={i} style={{flex:f.bytes,cursor:"pointer",overflow:"hidden",background:hov===i?f.color:`${f.color}${f.name==="_pad"?"18":"38"}`,display:"flex",alignItems:"center",justifyContent:"center",transition:"background 0.2s"}}
              onHoverStart={()=>setHov(i)} onHoverEnd={()=>setHov(null)}>
              {f.bytes >= 3 && <span style={{fontFamily:T.mono,fontSize:8,color:hov===i?T.bg:T.textStrong,whiteSpace:"nowrap",padding:"0 2px",fontWeight:600}}>{f.name}</span>}
            </motion.div>
          ))}
        </div>
        {/* Offset ruler */}
        <div style={{display:"flex",height:12,marginBottom:12}}>
          {FIELDS.map((f,i) => (
            <div key={i} style={{flex:f.bytes,borderLeft:`1px solid ${T.border}`}}>
              <span style={{fontFamily:T.mono,fontSize:7,color:T.muted,paddingLeft:2}}>{f.offset}</span>
            </div>
          ))}
        </div>
        {/* Field list */}
        {FIELDS.map((f, i) => (
          <motion.div key={i} whileHover={{x:3}} onHoverStart={()=>setHov(i)} onHoverEnd={()=>setHov(null)}
            style={{display:"flex",gap:10,alignItems:"center",padding:"5px 10px",borderRadius:7,cursor:"pointer",background:hov===i?`${f.color}10`:T.dim,marginBottom:4,transition:"background 0.2s"}}>
            <div style={{width:8,height:8,borderRadius:2,background:f.color,flexShrink:0}}/>
            <Mono c={f.color} size={11} style={{width:68,flexShrink:0}}>{f.name}</Mono>
            <Mono c={T.muted} size={10} style={{width:72,flexShrink:0}}>{f.type}</Mono>
            <Mono c={T.text} size={10} style={{width:56,flexShrink:0}}>+{f.offset}</Mono>
            <Mono c={T.neon4} size={10}>{f.bytes}B</Mono>
          </motion.div>
        ))}
        <div style={{marginTop:10,padding:"7px 12px",background:`${T.neon3}0C`,borderRadius:7,border:`1px solid ${T.neon3}28`,fontSize:11,color:T.neon3}}>
          ⚠ Never fwrite structs with pointer members — pointers are addresses, meaningless on disk
        </div>
      </div>
    </div>
  );
}

function S07() {
  return (
    <Section id="s07" num="07" title="STRUCTURED DATA" color={T.neon2} sub="Serialize C structs to disk — mind alignment and padding">
      <StructViz/>
      <CodeBlock src={`typedef struct {
    char     magic[4];  // "PLYR" — file magic bytes
    uint32_t version;   // Format version
    uint32_t count;     // Record count
} FileHeader;

typedef struct {
    uint32_t id;        // offset  0 — 4B
    float    score;     // offset  4 — 4B
    uint8_t  level;     // offset  8 — 1B
    // 3B compiler padding here!
    char     name[32];  // offset 12 — 32B
} Player;               // sizeof == 44

FileHeader hdr = { .magic="PLYR", .version=1, .count=n };
fwrite(&hdr, sizeof(hdr), 1, fp);
fwrite(arr,  sizeof(Player), n, fp);`} title="serialization.c" hlLines={[15,16,17]}/>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// S08: LOG SYSTEM — Interactive demo
// ─────────────────────────────────────────────────────────────────────────────
const LOG_SRC = `#include <stdio.h>
#include <time.h>
#include <stdarg.h>

#define LOG_MAX  (1024*1024)
#define LOG_FILE "app.log"
#define BACKUP   "app.log.1"

typedef enum { INFO, WARN, ERROR } Level;
static FILE *g_log = NULL;

static void rotate(void) {
    if (ftell(g_log) < LOG_MAX) return;
    fclose(g_log);
    remove(BACKUP); rename(LOG_FILE, BACKUP);
    g_log = fopen(LOG_FILE, "w");
}

int log_open(void) {
    g_log = fopen(LOG_FILE, "a");
    if (!g_log) { perror("log_open"); return -1; }
    setvbuf(g_log, NULL, _IOLBF, 0);
    return 0;
}

void log_write(Level lv, const char *fmt, ...) {
    if (!g_log) return;
    rotate();
    time_t now = time(NULL);
    char ts[32];
    strftime(ts, sizeof(ts), "%H:%M:%S", localtime(&now));
    const char *ls[] = {"INFO","WARN","ERROR"};
    fprintf(g_log, "[%s] %-5s ", ts, ls[lv]);
    va_list ap;
    va_start(ap, fmt); vfprintf(g_log, fmt, ap); va_end(ap);
    fputc('\\n', g_log);
}

void log_close(void) {
    if (g_log) { fclose(g_log); g_log = NULL; }
}`;

function LogDemo() {
  const [entries, setEntries] = useState([
    { lv:"INFO", msg:"Server started on :8080", ts:"10:00:01" },
    { lv:"WARN", msg:"Memory usage 87.3%",      ts:"10:00:05" },
    { lv:"ERROR",msg:"DB timeout after 5s",     ts:"10:00:09" },
  ]);
  const [msg, setMsg] = useState("");
  const [lv, setLv] = useState("INFO");
  const endRef = useRef(null);
  const lvc = { INFO:T.neon2, WARN:T.neon, ERROR:T.neon3 };

  const add = () => {
    if (!msg.trim()) return;
    const ts = new Date().toTimeString().slice(0,8);
    setEntries(e => [...e, { lv, msg:msg.trim(), ts }]);
    setMsg("");
    setTimeout(() => endRef.current?.scrollIntoView({behavior:"smooth"}), 40);
  };

  return (
    <div style={{background:T.bg2,borderRadius:14,border:`1px solid ${T.border}`,overflow:"hidden"}}>
      <div style={{padding:"8px 14px",background:T.dim,borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",gap:10}}>
        <div style={{display:"flex",gap:5}}>
          {["#FF5F57","#FEBC2E","#28C840"].map(c=><div key={c} style={{width:8,height:8,borderRadius:"50%",background:c}}/>)}
        </div>
        <div style={{width:5,height:5,borderRadius:"50%",background:T.neon4,animation:"pulse 2s infinite"}}/>
        <Mono c={T.muted} size={9}>app.log — {entries.length} entries</Mono>
        <button className="fk" onClick={()=>{const blob=new Blob([LOG_SRC],{type:"text/plain"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="log_system.c";a.click();}}
          style={{marginLeft:"auto",padding:"2px 9px",borderRadius:5,border:`1px solid ${T.neon4}40`,color:T.neon4,fontSize:9,fontFamily:T.mono,background:`${T.neon4}10`}}>⬇ .c</button>
      </div>
      <div style={{background:"#030A10",padding:"10px 14px",minHeight:140,maxHeight:180,overflowY:"auto",fontFamily:"'JetBrains Mono',monospace",fontSize:12}}>
        <AnimatePresence>
          {entries.map((e,i) => (
            <motion.div key={i} initial={{opacity:0,x:-6}} animate={{opacity:1,x:0}} transition={ease} style={{marginBottom:2,lineHeight:1.65}}>
              <span style={{color:T.muted}}>[{e.ts}]</span>
              {" "}<span style={{color:lvc[e.lv],fontWeight:600}}>{e.lv}</span>
              {" "}<span style={{color:T.text}}>{e.msg}</span>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={endRef}/>
      </div>
      <div style={{padding:"8px 14px",borderTop:`1px solid ${T.border}`,display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
        <div style={{display:"flex",borderRadius:7,overflow:"hidden",border:`1px solid ${T.border}`}}>
          {["INFO","WARN","ERROR"].map(l => (
            <button key={l} className="fk" onClick={()=>setLv(l)} style={{padding:"5px 9px",fontFamily:T.mono,fontSize:9,color:lv===l?T.bg:lvc[l],background:lv===l?lvc[l]:"transparent",transition:"all 0.2s"}}>{l}</button>
          ))}
        </div>
        <input value={msg} onChange={e=>setMsg(e.target.value)} onKeyDown={e=>e.key==="Enter"&&add()} placeholder="Enter log message…"
          style={{flex:1,background:T.dim,border:`1px solid ${T.border}`,borderRadius:7,padding:"5px 10px",fontFamily:T.mono,fontSize:11,color:T.text,outline:"none",minWidth:100}}/>
        <button className="fk" onClick={add} style={{padding:"5px 12px",borderRadius:7,background:`${T.neon4}15`,border:`1px solid ${T.neon4}38`,color:T.neon4,fontFamily:T.mono,fontSize:10}}>WRITE →</button>
        <button className="fk" onClick={()=>setEntries([])} style={{padding:"5px 9px",borderRadius:7,background:`${T.neon3}0E`,border:`1px solid ${T.neon3}28`,color:T.neon3,fontFamily:T.mono,fontSize:10}}>CLR</button>
      </div>
    </div>
  );
}

function S08() {
  return (
    <Section id="s08" num="08" title="MASTER PROJECT" color={T.neon4} sub="Production log system: rotation, timestamps, levels.">
      <LogDemo/>
      <CodeBlock src={LOG_SRC} title="log_system.c" hlLines={[12,13,14,15,22,32,33]}/>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LEFT SIDEBAR — Deep Understanding Panel (matches Page 2 style)
// ─────────────────────────────────────────────────────────────────────────────
const INSIGHTS = {
  s01: [
    { icon:"🚪", title:"fopen returns a pointer", body:"NULL means failure. ALWAYS check. File descriptors are limited — never skip the NULL check.", color:T.neon2 },
    { icon:"⚠️", title:"\"w\" truncates immediately", body:"Opening with \"w\" destroys existing content the instant fopen() is called — before you write a single byte.", color:T.neon3 },
    { icon:"🔒", title:"Always fclose()", body:"Every open file descriptor costs OS resources. Unclosed files can corrupt data on crash and leak fds.", color:T.neon4 },
  ],
  s02: [
    { icon:"🔤", title:"Text = ASCII translation", body:"fprintf writes characters. The number 1000 becomes '1','0','0','0' — 4 bytes. On Windows, \\n becomes \\r\\n.", color:T.neon4 },
    { icon:"📦", title:"Binary = exact copy", body:"fwrite copies raw memory to disk. sizeof(int) bytes, no translation. Faster, smaller, but not human-readable.", color:T.accent },
    { icon:"💡", title:"\"b\" in mode string", body:"\"wb\", \"rb\" — the b matters on Windows. On POSIX/Linux it's a no-op but include it for portability.", color:T.neon2 },
  ],
  s03: [
    { icon:"🔢", title:"fgetc returns int, not char", body:"EOF is -1. If you store it in char (signed or unsigned), comparison with EOF may never trigger. Always use int.", color:T.neon3 },
    { icon:"📏", title:"fgets keeps the \\n", body:"Unlike gets(), fgets() keeps the newline in the buffer. Strip it with buf[strcspn(buf,\"\\n\")] = 0.", color:T.neon2 },
    { icon:"⚡", title:"fread is the fastest", body:"Block reads minimize system calls. Read 4096+ bytes at a time. One syscall for 4KB beats 4096 syscalls for 1 byte each.", color:T.neon4 },
  ],
  s04: [
    { icon:"🧪", title:"ferror vs feof", body:"feof() returns true only AFTER a failed read. Always check the return value of fread/fgets FIRST, then feof to distinguish EOF from error.", color:T.neon3 },
    { icon:"🔄", title:"errno is global", body:"errno is set on failure but NOT cleared on success. Check it immediately after a failed call before calling anything else.", color:T.neon },
    { icon:"🛡️", title:"clearerr() resets flags", body:"After handling an error, call clearerr(fp) to reset the error and EOF indicators so you can continue using the stream.", color:T.neon4 },
  ],
  s05: [
    { icon:"📍", title:"ftell returns long", body:"The file position is a long. For files > 2GB, use fseeko/ftello with off_t. Plain ftell overflows on large files.", color:T.accent },
    { icon:"🔄", title:"SEEK_END may not work in binary", body:"SEEK_END with positive offsets is undefined behavior. Use SEEK_SET or SEEK_CUR with known offsets for portability.", color:T.neon3 },
    { icon:"⚠️", title:"Flush before seeking", body:"Always fflush() before fseek() when mixing reads and writes on the same stream, or data corruption can occur.", color:T.neon },
  ],
  s06: [
    { icon:"🪣", title:"STDIO buffer = 8KB default", body:"glibc uses 8192 bytes by default for file buffers. For massive files, setvbuf with 64KB-1MB gives huge speedups.", color:T.neon },
    { icon:"⚡", title:"fflush != fsync", body:"fflush() moves data from STDIO buffer to kernel. fsync() pushes from kernel to physical disk. For crash safety, you need fsync.", color:T.neon4 },
    { icon:"🔍", title:"stderr is unbuffered", body:"stderr flushes immediately so error messages appear even if the program crashes before stdout is flushed.", color:T.neon3 },
  ],
  s07: [
    { icon:"📐", title:"Padding is invisible", body:"The compiler inserts padding bytes between struct members for alignment. sizeof(struct) can be larger than sum of members.", color:T.neon2 },
    { icon:"🚫", title:"No pointers in binary files", body:"Pointers hold virtual addresses — meaningless after the program exits. Serialize values, never raw pointer contents.", color:T.neon3 },
    { icon:"🔮", title:"Magic bytes identify formats", body:"Start binary files with a magic number (e.g., \"PLYR\", or 0x89PNG). Lets tools identify the format and detect corruption.", color:T.neon4 },
  ],
  s08: [
    { icon:"🔄", title:"Log rotation prevents bloat", body:"Check ftell() before each write. If size exceeds limit, rename current log to .1 and open a fresh file.", color:T.neon4 },
    { icon:"📅", title:"Timestamps need localtime", body:"time() returns Unix epoch. strftime with localtime converts to human-readable. Use gmtime for UTC logs.", color:T.neon2 },
    { icon:"🔀", title:"va_list for variadic logging", body:"vfprintf takes a va_list, letting your log_write accept printf-style format strings without reimplementing formatting.", color:T.accent },
  ],
};

const MENTAL_MODELS = {
  s01: [
    { icon:"🚪", model:"fopen = unlock + get a handle", detail:"fp is your key to the file. NULL means the lock failed." },
    { icon:"💀", model:'"w" = immediate data murder', detail:"The old file is gone the moment you call fopen(\"w\")." },
  ],
  s02: [
    { icon:"📖", model:"Text = human language", detail:"Numbers as digits. Newlines translated. Portable, readable." },
    { icon:"💾", model:"Binary = machine language", detail:"Raw memory. Exact bits. Fast. Platform-dependent." },
  ],
  s03: [
    { icon:"🏗️", model:"fread = industrial crane", detail:"Lifts massive blocks at once. One syscall, lots of data." },
    { icon:"🐌", model:"fgetc = picking grains of sand", detail:"One byte per call. 1MB file = 1M system calls. Avoid." },
  ],
  s04: [
    { icon:"🚦", model:"Return value = traffic light", detail:"NULL / 0 / EOF = red. Check it before proceeding." },
    { icon:"🔍", model:"errno = clue at the crime scene", detail:"Read it immediately after failure. Next call may overwrite it." },
  ],
  s05: [
    { icon:"📖", model:"File = random access array", detail:"fseek lets you jump to any byte. Files aren't just tapes." },
    { icon:"📍", model:"ftell = bookmark", detail:"Save position with ftell, jump back with fseek+SEEK_SET." },
  ],
  s06: [
    { icon:"🪣", model:"Buffer = batching writes", detail:"Don't mail one letter at a time — collect them, then send." },
    { icon:"⚡", model:"fflush = force delivery now", detail:"Buffer holding data? fflush sends it immediately." },
  ],
  s07: [
    { icon:"📦", model:"Struct in memory = struct on disk", detail:"fwrite copies exact bytes — alignment and all." },
    { icon:"📏", model:"sizeof() never lies", detail:"Always use sizeof(struct) not manual byte count." },
  ],
  s08: [
    { icon:"📋", model:"Log = append-only journal", detail:"Open with \"a\", write timestamped lines, never truncate." },
    { icon:"🔄", model:"Rotation = new page in notebook", detail:"When file is full, rename it and open a fresh one." },
  ],
};

function DeepPanel({ active }) {
  const [expanded, setExpanded] = useState(null);
  const insights = INSIGHTS[active] || INSIGHTS["s01"];
  const models = MENTAL_MODELS[active] || MENTAL_MODELS["s01"];

  useEffect(() => setExpanded(null), [active]);

  return (
    <aside className="sidebar-left" style={{
      width:320, minWidth:320,
      background:`linear-gradient(180deg,${T.bg1} 0%,${T.bg} 100%)`,
      borderRight:`1px solid ${T.dim}`,
      padding:"24px 14px",
      display:"flex", flexDirection:"column", gap:0,
      overflowY:"auto", overflowX:"hidden",
      position:"sticky", top:0, height:"100vh", flexShrink:0,
    }}>
      {/* Header */}
      <div style={{marginBottom:16}}>
        <div style={{fontFamily:T.mono,fontSize:10,letterSpacing:4,color:T.neon,fontWeight:700,marginBottom:4}}>DEEP UNDERSTANDING</div>
        <div style={{fontFamily:T.mono,fontSize:10,color:T.text,marginBottom:10}}>Updates as you explore</div>
        <div style={{height:1,background:`linear-gradient(90deg,${T.neon}35,transparent)`}}/>
      </div>

      {/* Key Takeaways */}
      <div style={{marginBottom:18}}>
        <div style={{fontFamily:T.mono,fontSize:9,letterSpacing:4,color:T.neon,marginBottom:10}}>⚡ KEY TAKEAWAYS</div>
        <AnimatePresence mode="wait">
          <motion.div key={active} initial={{opacity:0,x:10}} animate={{opacity:1,x:0}} exit={{opacity:0}} transition={{duration:0.3}}>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {insights.map((ins, i) => {
                const isExp = expanded === i;
                return (
                  <motion.div key={i} initial={{opacity:0,x:12}} animate={{opacity:1,x:0}} transition={{delay:i*0.06}}
                    whileHover={{x:-2}}
                    onClick={() => setExpanded(isExp ? null : i)}
                    style={{background:isExp?`${ins.color}0E`:"rgba(255,255,255,0.015)",border:`1px solid ${isExp?`${ins.color}50`:T.dim}`,borderRadius:10,padding:"10px 12px",cursor:"pointer",transition:"border-color 0.2s,background 0.2s"}}>
                    <div style={{display:"flex",alignItems:"flex-start",gap:8}}>
                      <span style={{fontSize:14,flexShrink:0,marginTop:1}}>{ins.icon}</span>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                          <div style={{fontFamily:T.body,fontWeight:700,fontSize:12,color:T.text}}>{ins.title}</div>
                          <motion.div animate={{rotate:isExp?90:0}} style={{color:T.text,fontSize:13,fontWeight:700,flexShrink:0,marginLeft:6}}>›</motion.div>
                        </div>
                        <AnimatePresence>
                          {isExp ? (
                            <motion.div initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}} exit={{height:0,opacity:0}} transition={{duration:0.22}} style={{overflow:"hidden"}}>
                              <div style={{fontFamily:T.mono,fontSize:11,color:T.text,lineHeight:1.7,marginTop:7}}>{ins.body}</div>
                            </motion.div>
                          ) : (
                            <div style={{fontFamily:T.mono,fontSize:9,color:T.muted,lineHeight:1.5,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{ins.body.slice(0,54)}…</div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Mental Models */}
      <div style={{marginBottom:18}}>
        <div style={{fontFamily:T.mono,fontSize:9,letterSpacing:4,color:T.neon2,marginBottom:10}}>🧠 MENTAL MODELS</div>
        <AnimatePresence mode="wait">
          <motion.div key={active} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0}} transition={{duration:0.3}}>
            {models.map((m, i) => (
              <div key={i} style={{background:`rgba(0,229,255,0.05)`,border:`1px solid ${T.neon2}20`,borderRadius:9,padding:"10px 12px",marginBottom:8}}>
                <div style={{display:"flex",gap:8,marginBottom:4}}>
                  <span style={{fontSize:14}}>{m.icon}</span>
                  <div style={{fontFamily:T.mono,fontSize:11,fontWeight:700,color:T.neon2,lineHeight:1.5}}>{m.model}</div>
                </div>
                <div style={{fontFamily:T.mono,fontSize:10,color:T.text,lineHeight:1.6}}>{m.detail}</div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Common Mistakes */}
      <div>
        <div style={{fontFamily:T.mono,fontSize:9,letterSpacing:4,color:T.neon3,marginBottom:10}}>🚫 COMMON MISTAKES</div>
        {[
          { mistake:"Not checking fopen() return",  fix:"if (fp == NULL) — always, no exceptions" },
          { mistake:"Using char for fgetc() return", fix:"int c = fgetc(fp); — EOF is -1, not a char" },
          { mistake:"Forgetting fclose()",           fix:"Every fopen must have a matching fclose" },
          { mistake:"Mixing text and binary modes",  fix:"Open with \"rb\"/\"wb\" for binary data" },
        ].map((item, i) => (
          <div key={i} style={{display:"flex",gap:8,marginBottom:9,alignItems:"flex-start"}}>
            <span style={{color:T.neon3,fontSize:10,flexShrink:0,marginTop:1}}>✗</span>
            <div>
              <div style={{fontFamily:T.mono,fontSize:9,color:T.neon3,lineHeight:1.5}}>{item.mistake}</div>
              <div style={{fontFamily:T.mono,fontSize:9,color:T.neon,marginTop:2}}>→ {item.fix}</div>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RIGHT SIDEBAR — Navigation (matches Page 2 style)
// ─────────────────────────────────────────────────────────────────────────────
const NAV = [
  { id:"hero",  n:"00", label:"OVERVIEW",  c:T.neon2 },
  { id:"s01",   n:"01", label:"MODES",     c:T.neon2 },
  { id:"s02",   n:"02", label:"TXT/BIN",   c:T.neon4 },
  { id:"s03",   n:"03", label:"R/W",       c:T.neon4 },
  { id:"s04",   n:"04", label:"ERRORS",    c:T.neon3 },
  { id:"s05",   n:"05", label:"SEEK",      c:T.accent },
  { id:"s06",   n:"06", label:"BUFFER",    c:T.neon  },
  { id:"s07",   n:"07", label:"STRUCT",    c:T.neon2 },
  { id:"s08",   n:"08", label:"PROJECT",   c:T.neon4 },
];

function RightSidebar({ active }) {
  return (
    <aside className="sidebar-right" style={{
      width:220, minWidth:220,
      background:`linear-gradient(180deg,${T.bg1} 0%,${T.bg} 100%)`,
      borderLeft:`1px solid ${T.dim}`,
      display:"flex", flexDirection:"column",
      padding:"24px 0",
      position:"sticky", top:0, height:"100vh",
      overflow:"hidden", flexShrink:0,
    }}>
      {/* Logo */}
      <div style={{padding:"0 18px 18px"}}>
        <motion.div animate={{textShadow:[`0 0 20px ${T.neon}70`,`0 0 30px ${T.neon}90`,`0 0 20px ${T.neon}70`]}} transition={{duration:2.5,repeat:Infinity}}
          style={{fontFamily:T.display,fontWeight:800,fontSize:22,letterSpacing:2,color:T.neon}}>C</motion.div>
        <div style={{fontFamily:T.mono,fontSize:8,letterSpacing:5,color:T.muted,marginTop:3}}>FILE I/O</div>
      </div>
      <div style={{height:1,background:`linear-gradient(90deg,transparent,${T.neon}35,transparent)`,marginBottom:14}}/>

      {/* Nav items */}
      <nav style={{flex:1,overflowY:"auto",minHeight:0}}>
        {NAV.map(n => {
          const on = active === n.id;
          return (
            <motion.a key={n.id} href={`#${n.id}`}
              onClick={e=>{e.preventDefault();document.getElementById(n.id)?.scrollIntoView({behavior:"smooth"});}}
              animate={{color:on?n.c:T.muted,borderLeftColor:on?n.c:"transparent",background:on?`${n.c}07`:"transparent"}}
              whileHover={{color:T.text,paddingLeft:24}} transition={{duration:0.2}}
              style={{display:"flex",alignItems:"center",gap:10,padding:"9px 18px",fontFamily:T.mono,fontSize:11,fontWeight:700,letterSpacing:2,textDecoration:"none",borderLeft:"2px solid transparent",transition:"all 0.2s",cursor:"pointer"}}>
              <div>
                <div style={{fontSize:7,opacity:0.45,marginBottom:1}}>{n.n}</div>
                {n.label}
              </div>
              {on && <motion.div layoutId="nav-dot" style={{width:5,height:5,borderRadius:"50%",background:n.c,marginLeft:"auto",flexShrink:0}}/>}
            </motion.a>
          );
        })}
      </nav>

      {/* Progress + prev/next */}
      <div style={{flexShrink:0,padding:"14px 14px 18px",borderTop:`1px solid ${T.dim}`,display:"flex",flexDirection:"column",gap:8}}>
        <div style={{fontFamily:T.mono,fontSize:7,letterSpacing:3,color:T.muted}}>COURSE PROGRESS</div>
        <div style={{height:2,background:T.dim,borderRadius:2,overflow:"hidden"}}>
          <motion.div style={{height:"100%",width:"60%",background:`linear-gradient(90deg,${T.neon},${T.neon2})`,borderRadius:2}}/>
        </div>
        <div style={{fontFamily:T.mono,fontSize:8,color:T.neon,marginBottom:4}}>6 / 7 chapters</div>

        <motion.a href="/c-5" whileHover={{x:-3,borderColor:T.neon}} style={{display:"flex",alignItems:"center",justifyContent:"space-between",fontFamily:T.mono,fontSize:8,letterSpacing:1.5,fontWeight:700,color:T.neon2,textDecoration:"none",background:`rgba(0,229,255,0.05)`,border:`1px solid ${T.neon2}30`,borderRadius:6,padding:"7px 11px",transition:"all 0.2s"}}>
          <span>← PREV</span><span style={{color:T.text,letterSpacing:0,fontSize:8}}>Pointers & Structs</span>
        </motion.a>
        <motion.a href="/c-7" whileHover={{x:3,borderColor:T.neon}} style={{display:"flex",alignItems:"center",justifyContent:"space-between",fontFamily:T.mono,fontSize:8,letterSpacing:1.5,fontWeight:700,color:T.neon,textDecoration:"none",background:`rgba(255,100,0,0.05)`,border:`1px solid ${T.neon}30`,borderRadius:6,padding:"7px 11px",transition:"all 0.2s"}}>
          <span>NEXT →</span><span style={{color:T.text,letterSpacing:0,fontSize:8}}>Advanced</span>
        </motion.a>
      </div>
    </aside>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ROOT PAGE — uses shared CPageLayout
// ─────────────────────────────────────────────────────────────────────────────
const C6_NAV_ITEMS = [
  { id: "hero", label: "OVERVIEW",  num: "00", icon: "◎" },
  { id: "s01",  label: "MODES",     num: "01", icon: "📂" },
  { id: "s02",  label: "TXT/BIN",   num: "02", icon: "💾" },
  { id: "s03",  label: "R/W",       num: "03", icon: "✍️" },
  { id: "s04",  label: "ERRORS",    num: "04", icon: "⚠️" },
  { id: "s05",  label: "SEEK",      num: "05", icon: "🔍" },
  { id: "s06",  label: "BUFFER",    num: "06", icon: "📦" },
  { id: "s07",  label: "STRUCT",    num: "07", icon: "🧩" },
  { id: "s08",  label: "PROJECT",   num: "08", icon: "🚀" },
];

export default function CFileIOPage() {
  const active = useActiveSection(C6_NAV_ITEMS);

  return (
    <CPageLayout
      chapterNum={6}
      navItems={C6_NAV_ITEMS}
      activeSection={active}
      sectionInsights={{
        hero: [
          { icon: "◎", title: "CHAPTER 6", body: "File I/O connects your program to the outside world. Read data, write results, persist state — files are how programs survive shutdown.", color: T.neon },
          { icon: "🎯", title: "LEARNING GOAL", body: "Master fopen/fclose, text vs binary modes, reading/writing strategies, error handling, seeking, buffering, and struct serialization.", color: T.neon2 },
          { icon: "💡", title: "KEY INSIGHT", body: "A FILE* is an opaque pointer to a struct that tracks: the file descriptor, buffer, position, error status. fopen gives you this handle.", color: T.neon4 },
        ],
        s01: [
          { icon: "📂", title: "FILE MODES", body: "\"r\" = read (must exist). \"w\" = write (creates/truncates!). \"a\" = append. \"+\" = read+write. \"b\" = binary. Always pair fopen ↔ fclose.", color: T.neon },
          { icon: "📐", title: "fopen RETURNS NULL ON FAILURE", body: "File doesn't exist? Permission denied? Disk full? fopen returns NULL. ALWAYS check: if (fp == NULL) { perror(\"fopen\"); return 1; }", color: T.neon2 },
          { icon: "⚠️", title: "DEADLY MISTAKE", body: "\"w\" truncates IMMEDIATELY. Opening an existing file with \"w\" destroys ALL content the instant fopen() is called — before you write anything.", color: T.neon3 },
          { icon: "🧠", title: "MENTAL MODEL", body: "fopen = unlock a door and get a key (FILE*). fclose = return the key. The OS limits open files (~1024). Unclosed files leak resources.", color: T.neon4 },
        ],
        s02: [
          { icon: "💾", title: "TEXT vs BINARY", body: "Text mode: newlines translated (\\n → \\r\\n on Windows), numbers as ASCII digits. Binary mode: exact bytes copied, no translation.", color: T.neon },
          { icon: "📐", title: "WHEN TO USE WHICH", body: "Config files, logs, CSV → text mode. Images, databases, serialized structs → binary mode. Text is human-readable but larger and slower.", color: T.neon2 },
          { icon: "⚠️", title: "COMMON MISTAKE", body: "Opening binary files in text mode on Windows. \\r\\n translation corrupts binary data. Always use \"rb\"/\"wb\" for non-text files.", color: T.neon3 },
          { icon: "🧠", title: "MENTAL MODEL", body: "Text = human language (digits, letters, newlines). Binary = machine language (raw bytes, exact memory copy). Choose based on audience.", color: T.neon4 },
        ],
        s03: [
          { icon: "✍️", title: "4 I/O STRATEGIES", body: "fgetc/fputc: one char at a time. fgets/fputs: one line. fread/fwrite: block of bytes. fprintf/fscanf: formatted. Choose wisely.", color: T.neon },
          { icon: "📐", title: "PERFORMANCE", body: "fread(buf, 1, 4096, fp) = 1 syscall for 4KB. fgetc() 4096 times = 4096 function calls. Block reads are 100-1000x faster.", color: T.neon2 },
          { icon: "⚠️", title: "CRITICAL BUG", body: "fgetc returns INT, not char! EOF is -1. char c = fgetc(fp); — on unsigned char, EOF wraps to 255 and is never detected. Always use int.", color: T.neon3 },
          { icon: "🧠", title: "MENTAL MODEL", body: "fgetc = picking grains of sand (slow). fgets = grabbing handfuls (better). fread = scooping with a shovel (fast). Choose the right tool.", color: T.neon4 },
        ],
        s04: [
          { icon: "⚠️", title: "ERROR HANDLING", body: "ALWAYS check return values. fopen → NULL. fread → 0. fprintf → negative. ferror(fp) checks for errors. feof(fp) checks for end-of-file.", color: T.neon },
          { icon: "📐", title: "errno + perror", body: "errno is set on failure. perror(\"context\") prints: context: No such file or directory. Check errno IMMEDIATELY after failure — next call may overwrite it.", color: T.neon2 },
          { icon: "⚠️", title: "COMMON MISTAKE", body: "Checking feof BEFORE reading. Wrong! feof only returns true AFTER a failed read. Pattern: read first, check return value, then check feof vs ferror.", color: T.neon3 },
          { icon: "🧠", title: "MENTAL MODEL", body: "Return value = traffic light. NULL/0/EOF = red light. Check it BEFORE proceeding. errno = detective clue at the crime scene — read it immediately.", color: T.neon4 },
        ],
        s05: [
          { icon: "🔍", title: "FILE SEEKING", body: "fseek(fp, offset, SEEK_SET/SEEK_CUR/SEEK_END) — jump to any byte in the file. ftell(fp) — get current position. rewind(fp) — go to start.", color: T.neon },
          { icon: "📐", title: "RANDOM ACCESS", body: "Files aren't just sequential tapes. fseek lets you jump to record #500 instantly: fseek(fp, 500 * sizeof(Record), SEEK_SET).", color: T.neon2 },
          { icon: "⚠️", title: "COMMON MISTAKE", body: "Seeking without flushing. When mixing reads and writes on the same file, always fflush() before fseek() or data corruption can occur.", color: T.neon3 },
          { icon: "🧠", title: "MENTAL MODEL", body: "FILE* has an invisible cursor. fseek moves it. ftell reads it. fread/fwrite advance it. You can teleport anywhere in the file.", color: T.neon4 },
        ],
        s06: [
          { icon: "📦", title: "BUFFERING", body: "STDIO doesn't write directly to disk. It buffers data (8KB default). _IOFBF = fully buffered (files). _IOLBF = line buffered (stdout). _IONBF = unbuffered (stderr).", color: T.neon },
          { icon: "📐", title: "PERFORMANCE TUNING", body: "setvbuf(fp, NULL, _IOFBF, 65536) — 64KB buffer reduces syscalls dramatically. For massive files, buffer = free performance.", color: T.neon2 },
          { icon: "⚠️", title: "COMMON MISTAKE", body: "fflush ≠ fsync. fflush moves data from STDIO buffer → OS kernel. fsync moves from kernel → physical disk. For crash safety, need BOTH.", color: T.neon3 },
          { icon: "🧠", title: "MENTAL MODEL", body: "Buffer = batching letters before mailing. Don't send one letter at a time — collect them, then send in bulk. fflush = 'send everything NOW'.", color: T.neon4 },
        ],
        s07: [
          { icon: "🧩", title: "STRUCT I/O", body: "fwrite(&record, sizeof(Record), 1, fp) — writes raw struct bytes to disk. fread reads them back. Fast binary serialization.", color: T.neon },
          { icon: "📐", title: "ALIGNMENT & PADDING", body: "Compiler inserts padding bytes for alignment. sizeof(struct) can be larger than sum of fields. This affects binary file format.", color: T.neon2 },
          { icon: "⚠️", title: "DANGER", body: "Never fwrite structs with pointer members! Pointers hold virtual addresses — meaningless after program exits or on different machines.", color: T.neon3 },
          { icon: "🧠", title: "MENTAL MODEL", body: "fwrite copies memory → disk. fread copies disk → memory. Same struct definition = same layout = works. Different compiler/platform = might not.", color: T.neon4 },
          { icon: "💡", title: "MAGIC BYTES", body: "Start binary files with a magic number (e.g., 'PLYR'). Lets tools identify the format and detect corruption. Always validate on read.", color: T.accent },
        ],
        s08: [
          { icon: "🚀", title: "MASTER PROJECT", body: "Build a production-grade logging system: rotation, timestamps, severity levels, variadic formatting. This uses EVERY file I/O concept.", color: T.neon },
          { icon: "📐", title: "LOG ROTATION", body: "Check ftell() before each write. If size > limit, rename current log to .1 and open a fresh file. Prevents unbounded log growth.", color: T.neon2 },
          { icon: "⚠️", title: "COMMON MISTAKE", body: "Not flushing log files. If program crashes, buffered log entries are lost. Use setvbuf with _IOLBF for line-buffered logging.", color: T.neon3 },
          { icon: "🧠", title: "MENTAL MODEL", body: "Logging = append-only journal. Open with \"a\", timestamp every entry, never truncate. Rotate when full = new page in notebook.", color: T.neon4 },
        ],
      }}
    >
      <div id="hero"><Hero /></div>
      <S01 /><S02 /><S03 /><S04 /><S05 /><S06 /><S07 /><S08 />
      <div style={{ height: 80 }} />
    </CPageLayout>
  );
}