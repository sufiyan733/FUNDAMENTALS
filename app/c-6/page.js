"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const T = {
  bg:"#010308", bg1:"#040B14", bg2:"#07111F",
  glass:"rgba(4,11,20,0.92)",
  neon:"#FF6400", neon2:"#00E5FF", neon3:"#FF2D6B", neon4:"#B4FF00", accent:"#A855F7",
  text:"#C8D8E8", textStrong:"#FFFFFF", muted:"#2E4A62", dim:"#0A1520",
  border:"rgba(255,255,255,0.06)",
};
const sp = { type:"spring", stiffness:320, damping:32 };
const ease = { type:"tween", duration:0.3, ease:[0.4,0,0.2,1] };

const G = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Fira+Code:wght@400;500;600&family=JetBrains+Mono:wght@300;400;600;700&family=Syne:wght@400;700;800&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    html{scroll-behavior:smooth;scrollbar-width:thin;scrollbar-color:${T.muted} ${T.bg1}}
    body{background:${T.bg};color:${T.text};font-family:'Syne',sans-serif;overflow-x:hidden}
    ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:${T.bg1}}
    ::-webkit-scrollbar-thumb{background:${T.muted};border-radius:3px}
    ::selection{background:rgba(0,229,255,0.18);color:#fff}
    a{color:inherit;text-decoration:none}
    button,input,select{font-family:inherit;cursor:pointer}
    input[type=range]{-webkit-appearance:none;height:4px;border-radius:2px;outline:none;background:${T.muted}55}
    input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;border-radius:50%;background:${T.neon2};border:2px solid ${T.bg};cursor:pointer}
    .fk:focus-visible{outline:2px solid ${T.neon2};outline-offset:2px;border-radius:6px}
    @keyframes pulse{0%,100%{opacity:0.4}50%{opacity:1}}
    @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
    @media(max-width:900px){.hide-mobile{display:none!important}}
  `}</style>
);

const Tag = ({c=T.neon2,children}) => (
  <span style={{display:"inline-flex",alignItems:"center",padding:"3px 10px",borderRadius:999,
    fontSize:10,fontWeight:600,letterSpacing:"0.1em",fontFamily:"'Fira Code',monospace",
    background:`${c}15`,border:`1px solid ${c}40`,color:c,textTransform:"uppercase"}}>{children}</span>
);

const Mono = ({c=T.neon2,size=13,children,style={}}) => (
  <span style={{fontFamily:"'Fira Code',monospace",fontSize:size,color:c,...style}}>{children}</span>
);

const Glow = ({c=T.neon2,size=120,x=0,y=0,op=0.12}) => (
  <div style={{position:"absolute",left:x,top:y,width:size,height:size,borderRadius:"50%",
    background:c,filter:`blur(${size*0.5}px)`,opacity:op,pointerEvents:"none",zIndex:0}} />
);

// Syntax highlighter
const KW=new Set(["FILE","NULL","EOF","int","char","size_t","long","void","struct","return","if","else","while","for","break","const","unsigned","static","sizeof","typedef","include","define","stderr","stdout","stdin","goto","main","enum"]);
const FN=new Set(["fopen","fclose","fread","fwrite","fprintf","fscanf","fgetc","fputc","fgets","fputs","fseek","ftell","rewind","fflush","setvbuf","feof","ferror","perror","strerror","printf","malloc","free","vfprintf","va_start","va_end","time","strftime","localtime","remove","rename","clearerr","putchar","snprintf"]);
const CN=new Set(["SEEK_SET","SEEK_CUR","SEEK_END","EXIT_SUCCESS","EXIT_FAILURE","_IOFBF","_IOLBF","_IONBF","ENOENT","EACCES","LOG_MAX","LOG_FILE","BACKUP","INFO","WARN","ERROR"]);
const TY=new Set(["uint32_t","uint8_t","int64_t","float","double","bool","Level","FileHeader","Player","Record","va_list"]);

function hl(line){
  const out=[];let i=0;
  while(i<line.length){
    if(line[i]==='/'&&line[i+1]==='/'){out.push(<span key={i} style={{color:T.muted}}>{line.slice(i)}</span>);break;}
    if(line[i]==='"'||line[i]==="'"){
      let j=i+1,q=line[i];while(j<line.length&&line[j]!==q)j++;
      out.push(<span key={i} style={{color:T.neon4}}>{line.slice(i,j+1)}</span>);i=j+1;continue;
    }
    if(line[i]==='<'&&i>0){
      let j=i+1;while(j<line.length&&line[j]!=='>') j++;
      out.push(<span key={i} style={{color:T.neon4}}>{line.slice(i,j+1)}</span>);i=j+1;continue;
    }
    if(/[a-zA-Z_]/.test(line[i])){
      let j=i;while(j<line.length&&/\w/.test(line[j]))j++;
      const w=line.slice(i,j);
      const c=KW.has(w)?T.neon2:FN.has(w)?T.neon:CN.has(w)?T.neon3:TY.has(w)?T.accent:T.text;
      out.push(<span key={i} style={{color:c}}>{w}</span>);i=j;continue;
    }
    if(/\d/.test(line[i])){
      let j=i;while(j<line.length&&/[\d.xA-Fa-f]/.test(line[j]))j++;
      out.push(<span key={i} style={{color:T.neon3}}>{line.slice(i,j)}</span>);i=j;continue;
    }
    out.push(<span key={i} style={{color:"#3A5A76"}}>{line[i]}</span>);i++;
  }
  return out;
}

function Code({src,title,hlLines=[]}){
  const [copied,setCopied]=useState(false);
  const lines=src.trim().split("\n");
  return(
    <motion.div initial={{opacity:0,y:12}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={ease}
      style={{borderRadius:16,overflow:"hidden",border:`1px solid ${T.border}`,background:"#030D1A",marginTop:16}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
        padding:"8px 16px",background:T.dim,borderBottom:`1px solid ${T.border}`}}>
        <div style={{display:"flex",gap:6}}>
          {["#FF5F57","#FEBC2E","#28C840"].map(c=><div key={c} style={{width:9,height:9,borderRadius:"50%",background:c}}/>)}
        </div>
        {title&&<Mono c={T.muted} size={10}>{title}</Mono>}
        <button className="fk" onClick={()=>{navigator.clipboard.writeText(src.trim());setCopied(true);setTimeout(()=>setCopied(false),2000);}}
          style={{padding:"2px 10px",borderRadius:6,border:`1px solid ${T.border}`,fontSize:10,
            color:copied?T.neon4:T.muted,background:copied?`${T.neon4}18`:"transparent",fontFamily:"'Fira Code'"}}>{copied?"✓ COPIED":"COPY"}</button>
      </div>
      <div style={{overflowX:"auto",padding:"14px 0"}}>
        <table style={{borderSpacing:0,width:"100%",minWidth:"max-content"}}>
          <tbody>
            {lines.map((ln,i)=>{
              const hi=hlLines.includes(i+1);
              return(
                <tr key={i} style={{background:hi?`${T.neon}0E`:"transparent"}}>
                  <td style={{fontFamily:"'Fira Code'",fontSize:12,color:hi?T.neon:`${T.muted}66`,
                    textAlign:"right",padding:"1px 14px 1px 10px",userSelect:"none",
                    borderRight:`2px solid ${hi?T.neon:T.dim}`,minWidth:38}}>{i+1}</td>
                  <td style={{padding:"1px 20px 1px 14px",fontFamily:"'Fira Code'",fontSize:13,lineHeight:1.75,whiteSpace:"pre"}}>
                    {hl(ln)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

function Sec({id,num,title,sub,color=T.neon,children}){
  return(
    <section id={id} style={{marginBottom:88,position:"relative"}}>
      <Glow c={color} size={280} x={-80} y={-40} op={0.035}/>
      <motion.div initial={{opacity:0,y:18}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={ease} style={{marginBottom:28}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:6}}>
          <span style={{fontFamily:"'Bebas Neue'",fontSize:10,color:T.muted,letterSpacing:"0.3em"}}>SECTION {num}</span>
          <div style={{flex:1,height:1,background:`linear-gradient(90deg,${color}44,transparent)`}}/>
        </div>
        <h2 style={{fontFamily:"'Bebas Neue'",fontSize:"clamp(38px,5vw,68px)",color,letterSpacing:"0.04em",lineHeight:0.92,marginBottom:sub?8:0}}>{title}</h2>
        {sub&&<p style={{color:T.muted,fontSize:12,maxWidth:480}}>{sub}</p>}
      </motion.div>
      <div style={{position:"relative",zIndex:1}}>{children}</div>
    </section>
  );
}

// ── HERO ──────────────────────────────────────────────────────────
function FileDiagram(){
  const [tick,setTick]=useState(0);
  useEffect(()=>{const id=setInterval(()=>setTick(t=>t+1),70);return()=>clearInterval(id);},[]);
  const progress=(tick%100)/100;
  const stages=[
    {label:"PROGRAM",sub:"memory",color:T.neon2,x:8},
    {label:"STDIO",sub:"buffer",color:T.accent,x:128},
    {label:"KERNEL",sub:"syscall",color:T.neon,x:248},
    {label:"DISK",sub:"storage",color:T.neon4,x:368},
  ];
  const activeEdge=Math.floor(progress*3);
  const ep=(progress*3)%1;
  return(
    <div style={{background:T.bg2,border:`1px solid ${T.border}`,borderRadius:20,padding:"24px 28px",position:"relative",overflow:"hidden"}}>
      <Glow c={T.neon2} size={200} x={-50} y={-60} op={0.06}/>
      <Mono c={T.muted} size={9} style={{letterSpacing:"0.18em",display:"block",marginBottom:20}}>FILE I/O DATA FLOW</Mono>
      <svg width="100%" viewBox="0 0 470 100" style={{overflow:"visible"}}>
        {stages.slice(0,-1).map((s,i)=>{
          const x1=s.x+56,x2=stages[i+1].x,y=46;
          const active=i===activeEdge,done=i<activeEdge;
          const px=active?ep:done?1:0;
          return(
            <g key={i}>
              <line x1={x1} y1={y} x2={x2} y2={y} stroke={T.muted} strokeWidth={1.5} opacity={0.3}/>
              <line x1={x1} y1={y} x2={x1+(x2-x1)*px} y2={y}
                stroke={stages[i].color} strokeWidth={active?2:1.5} opacity={done?0.6:1}
                strokeDasharray={active?"6 3":"none"}/>
              {active&&<circle cx={x1+(x2-x1)*px} cy={y} r={4} fill={stages[i].color}
                style={{filter:`drop-shadow(0 0 5px ${stages[i].color})`}}/>}
            </g>
          );
        })}
        {stages.map((s,i)=>(
          <g key={i}>
            <rect x={s.x} y={20} width={58} height={52} rx={8}
              fill={`${s.color}14`} stroke={`${s.color}44`} strokeWidth={1.5}/>
            <text x={s.x+29} y={38} textAnchor="middle" fontSize={8.5}
              fill={s.color} fontFamily="'Bebas Neue'" letterSpacing="0.12em">{s.label}</text>
            <text x={s.x+29} y={54} textAnchor="middle" fontSize={7.5}
              fill={T.muted} fontFamily="'Fira Code'">{s.sub}</text>
          </g>
        ))}
      </svg>
      {/* Buffer fill */}
      <div style={{marginTop:16}}>
        <Mono c={T.muted} size={9} style={{letterSpacing:"0.12em",display:"block",marginBottom:6}}>STDIO BUFFER</Mono>
        <div style={{display:"flex",gap:2}}>
          {Array.from({length:12}).map((_,i)=>(
            <div key={i} style={{flex:1,height:8,borderRadius:2,
              background:i<Math.floor(progress*12)?`${T.neon2}70`:T.dim,
              border:`1px solid ${T.border}`,transition:"background 0.1s"}}/>
          ))}
        </div>
      </div>
      <div style={{display:"flex",gap:20,marginTop:14,paddingTop:14,borderTop:`1px solid ${T.border}`}}>
        {[["CALLS",Math.floor(progress*64)],["BYTES",Math.floor(progress*8192)],["BUF %",Math.floor(progress*100)]].map(([l,v])=>(
          <div key={l}>
            <div style={{fontSize:8,color:T.muted,fontFamily:"'Fira Code'",letterSpacing:"0.12em"}}>{l}</div>
            <div style={{fontFamily:"'Bebas Neue'",fontSize:22,color:T.neon2}}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Hero(){
  const fns=["fopen()","fclose()","fread()","fwrite()","fseek()","ftell()","fflush()","fprintf()"];
  const [fi,setFi]=useState(0);
  useEffect(()=>{const id=setInterval(()=>setFi(i=>(i+1)%fns.length),1600);return()=>clearInterval(id);},[]);
  return(
    <div style={{paddingTop:72,paddingBottom:40,position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",inset:0,backgroundImage:`linear-gradient(${T.border} 1px,transparent 1px),linear-gradient(90deg,${T.border} 1px,transparent 1px)`,backgroundSize:"48px 48px",opacity:0.4,maskImage:"radial-gradient(ellipse 80% 70% at 50% 50%,black,transparent)"}}/>
      <Glow c={T.neon} size={500} x="25%" y={-80} op={0.05}/>
      <Glow c={T.neon2} size={350} x="55%" y={60} op={0.05}/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:48,alignItems:"center",maxWidth:1200,margin:"0 auto",padding:"0 32px"}}>
        <div style={{position:"relative",zIndex:1}}>
          <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} transition={{duration:0.5}}>
            <Tag c={T.neon}>C · CHAPTER 6</Tag>
          </motion.div>
          <motion.h1 initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} transition={{duration:0.7,delay:0.1}}
            style={{fontFamily:"'Bebas Neue'",fontSize:"clamp(60px,8vw,108px)",lineHeight:0.88,letterSpacing:"0.03em",margin:"18px 0 14px",color:T.textStrong}}>
            C FILE<br/>
            <span style={{color:T.neon,WebkitTextStroke:`1px ${T.neon}`,WebkitTextFillColor:"transparent",
              textShadow:`0 0 40px ${T.neon}60`}}>I/O</span><br/>MASTER
          </motion.h1>
          <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.35}}
            style={{height:26,overflow:"hidden",marginBottom:20}}>
            <AnimatePresence mode="wait">
              <motion.div key={fi} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} transition={ease}>
                <Mono c={T.neon2} size={15} style={{letterSpacing:"0.04em"}}>{fns[fi]}</Mono>
              </motion.div>
            </AnimatePresence>
          </motion.div>
          <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.5}}
            style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {["Text/Binary","Error Handling","Seek","Buffering","Structs","Log System"].map(t=><Tag key={t} c={T.muted}>{t}</Tag>)}
          </motion.div>
        </div>
        <motion.div initial={{opacity:0,scale:0.92}} animate={{opacity:1,scale:1}} transition={{duration:0.7,delay:0.2}}>
          <FileDiagram/>
        </motion.div>
      </div>
    </div>
  );
}

// ── S01: FILE MODES ───────────────────────────────────────────────
const MODES=[
  {mode:'"r"', name:"Read",     color:T.neon2, creates:false,truncates:false,read:true, write:false,append:false,
   note:"File must exist. Pointer at byte 0."},
  {mode:'"w"', name:"Write",    color:T.neon,  creates:true, truncates:true, read:false,write:true, append:false,
   note:"Creates or TRUNCATES existing file immediately!"},
  {mode:'"a"', name:"Append",   color:T.neon4, creates:true, truncates:false,read:false,write:true, append:true,
   note:"Always writes to end. Safe for logs."},
  {mode:'"r+"',name:"Read+Write",color:T.accent,creates:false,truncates:false,read:true, write:true, append:false,
   note:"File must exist. Full read/write access."},
  {mode:'"w+"',name:"W+Read",   color:T.neon3, creates:true, truncates:true, read:true, write:true, append:false,
   note:"Creates or truncates, then read/write."},
  {mode:'"a+"',name:"App+Read", color:"#FF9500",creates:true,truncates:false,read:true, write:true, append:true,
   note:"Reads anywhere, writes go to end."},
];

function TapeViz({m,tick}){
  const bytes=["H","e","l","l","o","!",null,null,null,null];
  const ptr=m.append?6:m.truncates?0:Math.min(4,Math.floor((tick%80)/20));
  return(
    <div style={{display:"flex",gap:3,marginTop:12}}>
      {bytes.map((b,i)=>{
        const isData=b!==null;
        const isPtr=i===ptr;
        const deleted=m.truncates&&isData;
        return(
          <div key={i} style={{position:"relative"}}>
            <div style={{width:26,height:32,display:"flex",alignItems:"center",justifyContent:"center",
              borderRadius:4,border:`1px solid ${isPtr?m.color:T.border}`,
              background:deleted?`${T.neon3}25`:isData?`${m.color}18`:T.dim,
              fontSize:10,fontFamily:"'Fira Code'",
              color:deleted?T.neon3:isData?m.color:T.muted,
              transition:"all 0.15s"}}>
              {deleted?"✕":isData?b:"·"}
            </div>
            {isPtr&&<div style={{position:"absolute",top:-12,left:"50%",transform:"translateX(-50%)",
              fontSize:8,color:m.color,fontFamily:"'Fira Code'"}}>▼</div>}
          </div>
        );
      })}
    </div>
  );
}

function S01(){
  const [sel,setSel]=useState(0);
  const m=MODES[sel];
  const [tick,setTick]=useState(0);
  useEffect(()=>{const id=setInterval(()=>setTick(t=>t+1),60);return()=>clearInterval(id);},[]);

  return(
    <Sec id="s01" num="01" title="FILE MODES" color={T.neon2}>
      {/* Mode tabs */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:6,marginBottom:20}}>
        {MODES.map((md,i)=>(
          <motion.button key={i} className="fk" onClick={()=>setSel(i)}
            whileHover={{y:-2}} whileTap={{scale:0.96}}
            style={{padding:"12px 6px",borderRadius:10,border:`1px solid ${sel===i?md.color:T.border}`,
              background:sel===i?`${md.color}18`:T.bg2,transition:"all 0.2s",textAlign:"center"}}>
            <div style={{fontFamily:"'Bebas Neue'",fontSize:20,color:sel===i?md.color:T.text}}>{md.mode}</div>
            <div style={{fontSize:9,fontFamily:"'Fira Code'",color:sel===i?md.color:T.muted,marginTop:1}}>{md.name}</div>
          </motion.button>
        ))}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
        <AnimatePresence mode="wait">
          <motion.div key={sel} initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}} exit={{opacity:0}} transition={ease}
            style={{background:T.bg2,border:`1px solid ${m.color}30`,borderRadius:14,padding:22,position:"relative",overflow:"hidden"}}>
            <Glow c={m.color} size={180} x={-40} y={-50} op={0.08}/>
            <div style={{fontFamily:"'Bebas Neue'",fontSize:48,color:m.color,lineHeight:1}}>{m.mode}</div>
            <div style={{fontFamily:"'Syne'",fontWeight:700,fontSize:18,color:T.textStrong,marginTop:2,marginBottom:10}}>{m.name}</div>
            <p style={{fontSize:12,color:T.muted,marginBottom:14,lineHeight:1.6}}>{m.note}</p>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
              {[{l:"Creates",v:m.creates},{l:"Truncates",v:m.truncates},{l:"Read",v:m.read},{l:"Write",v:m.write},{l:"Append",v:m.append}].map(({l,v})=>(
                <div key={l} style={{padding:"3px 9px",borderRadius:6,fontSize:10,fontFamily:"'Fira Code'",
                  background:v?`${T.neon4}12`:`${T.neon3}0A`,border:`1px solid ${v?T.neon4:T.neon3}30`,
                  color:v?T.neon4:T.neon3}}>{v?"✓":"✗"} {l}</div>
              ))}
            </div>
            <TapeViz m={m} tick={tick}/>
            <div style={{marginTop:14,padding:"8px 12px",background:T.dim,borderRadius:8,fontFamily:"'Fira Code'",fontSize:12}}>
              <span style={{color:T.accent}}>FILE</span>
              <span style={{color:T.text}}> *fp = </span>
              <span style={{color:T.neon}}>fopen</span>
              <span style={{color:T.text}}>(</span>
              <span style={{color:T.neon4}}>&quot;f.txt&quot;</span>
              <span style={{color:T.text}}>, </span>
              <span style={{color:T.neon4}}>{m.mode}</span>
              <span style={{color:T.text}}>);</span>
            </div>
          </motion.div>
        </AnimatePresence>
        <Code src={`FILE *fp = fopen("data.txt", ${m.mode});
if (fp == NULL) {    // ALWAYS check!
    perror("fopen");
    return EXIT_FAILURE;
}

// ... use fp ...

if (fclose(fp) != 0) {
    perror("fclose");
}
return EXIT_SUCCESS;`} title="fopen.c" hlLines={[1,2,3,4]}/>
      </div>
    </Sec>
  );
}

// ── S02: TEXT VS BINARY ───────────────────────────────────────────
function ByteInspector({value=1000,mode}){
  const [hov,setHov]=useState(null);
  const textBytes=Array.from(String(value)).map(c=>c.charCodeAt(0));
  const binBytes=[(value>>24)&0xFF,(value>>16)&0xFF,(value>>8)&0xFF,value&0xFF];
  const bytes=mode==="text"?textBytes:binBytes;
  const c=mode==="text"?T.neon4:T.accent;
  return(
    <div style={{padding:20}}>
      <div style={{fontSize:10,color:T.muted,fontFamily:"'Fira Code'",letterSpacing:"0.1em",marginBottom:10}}>
        {mode==="text"?`"${value}" = ${bytes.length} ASCII chars`:`${value} = 4 raw bytes (0x000003E8)`}
      </div>
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
        {bytes.map((b,i)=>(
          <motion.div key={i} whileHover={{scale:1.08}} onHoverStart={()=>setHov(i)} onHoverEnd={()=>setHov(null)}
            style={{cursor:"pointer",padding:"10px 10px",borderRadius:10,textAlign:"center",minWidth:54,
              background:hov===i?`${c}20`:T.dim,border:`1px solid ${hov===i?c:T.border}`,transition:"all 0.15s"}}>
            <div style={{fontFamily:"'JetBrains Mono'",fontSize:15,fontWeight:700,color:c}}>
              {`0x${b.toString(16).toUpperCase().padStart(2,"0")}`}
            </div>
            <div style={{fontSize:8,color:T.muted,fontFamily:"'Fira Code'",marginTop:2}}>
              {b>=32&&b<127?String.fromCharCode(b):"·"}
            </div>
          </motion.div>
        ))}
      </div>
      <AnimatePresence>
        {hov!==null&&(
          <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}}
            style={{padding:"10px 12px",borderRadius:8,background:`${c}0C`,border:`1px solid ${c}25`,
              display:"flex",gap:18,fontFamily:"'Fira Code'",fontSize:11,overflow:"hidden"}}>
            {[["HEX",bytes[hov].toString(16).toUpperCase().padStart(2,"0")],
              ["DEC",bytes[hov]],
              ["BIN",bytes[hov].toString(2).padStart(8,"0")],
              ["ASCII",bytes[hov]>=32&&bytes[hov]<127?String.fromCharCode(bytes[hov]):"N/A"],
            ].map(([l,v])=>(
              <div key={l}><div style={{fontSize:8,color:T.muted,letterSpacing:"0.1em"}}>{l}</div>
                <div style={{color:T.textStrong,marginTop:1}}>{v}</div></div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function S02(){
  const [mode,setMode]=useState("text");
  return(
    <Sec id="s02" num="02" title="TEXT vs BINARY" color={T.neon4}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:16}}>
        <div style={{background:T.bg2,borderRadius:14,border:`1px solid ${T.border}`,overflow:"hidden"}}>
          <div style={{display:"flex",borderBottom:`1px solid ${T.border}`}}>
            {["text","binary"].map(m=>(
              <button key={m} className="fk" onClick={()=>setMode(m)} style={{flex:1,padding:"11px",
                fontFamily:"'Bebas Neue'",fontSize:16,letterSpacing:"0.1em",
                color:mode===m?(m==="text"?T.neon4:T.accent):T.muted,
                background:mode===m?(m==="text"?`${T.neon4}12`:`${T.accent}12`):"transparent",
                borderBottom:mode===m?`2px solid ${m==="text"?T.neon4:T.accent}`:"2px solid transparent",
                transition:"all 0.2s"}}>
                {m==="text"?"TEXT MODE":"BINARY MODE"}
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={mode} initial={{opacity:0}} animate={{opacity:1}} transition={ease}>
              <ByteInspector value={1000} mode={mode}/>
            </motion.div>
          </AnimatePresence>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {[
            {label:"Text Mode",c:T.neon4,items:["fprintf / fscanf / fgets","\\n → \\r\\n on Windows","Human-readable output","CSV, config, log files"]},
            {label:"Binary Mode",c:T.accent,items:["fread / fwrite","Exact bytes, no translation","Platform-dependent sizes","Images, structs, databases"]},
          ].map(card=>(
            <div key={card.label} style={{flex:1,background:T.bg2,borderRadius:12,padding:16,border:`1px solid ${card.c}22`}}>
              <div style={{fontFamily:"'Bebas Neue'",fontSize:18,color:card.c,marginBottom:8}}>{card.label}</div>
              {card.items.map(it=>(
                <div key={it} style={{display:"flex",gap:7,marginBottom:5,fontSize:11,color:T.text}}>
                  <span style={{color:card.c,fontSize:8,marginTop:3}}>▸</span>{it}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <Code src={`// TEXT — fprintf/fscanf
FILE *tf = fopen("data.txt", "w");
fprintf(tf, "%d", 1000);  // Writes: "1000" (4 bytes ASCII)
fclose(tf);

// BINARY — fwrite/fread
FILE *bf = fopen("data.bin", "wb");
int val = 1000;
fwrite(&val, sizeof(int), 1, bf);  // Writes: 0x000003E8 (4 bytes)
fclose(bf);`} title="text_vs_binary.c" hlLines={[3,9]}/>
    </Sec>
  );
}

// ── S03: READING & WRITING ────────────────────────────────────────
const IO_OPS=[
  {fn:"fgetc/fputc",color:T.neon2,icon:"①",label:"Character",
   code:`int c = fgetc(fp);    // Returns int — NOT char!
if (c == EOF) { /* end or error */ }
fputc('A', fp);`},
  {fn:"fgets/fputs",color:T.accent,icon:"②",label:"Line",
   code:`char buf[256];
if (fgets(buf, sizeof(buf), fp) == NULL) {
    // EOF or error
}
fputs("Hello\\n", fp);`},
  {fn:"fread/fwrite",color:T.neon4,icon:"③",label:"Block",
   code:`uint8_t buf[4096];
size_t n = fread(buf, 1, sizeof(buf), fp);
if (n == 0 && ferror(fp)) perror("fread");
size_t w = fwrite(buf, 1, n, fp);`},
  {fn:"fprintf/fscanf",color:T.neon,icon:"④",label:"Formatted",
   code:`int age; float salary;
int matched = fscanf(fp, "%d %f", &age, &salary);
if (matched != 2) { /* parse error */ }
fprintf(fp, "Age: %d\\n", age);`},
];

function PipelineAnim({step}){
  const [tick,setTick]=useState(0);
  useEffect(()=>{const id=setInterval(()=>setTick(t=>(t+1)%60),55);return()=>clearInterval(id);},[]);
  const p=tick/60;
  const c=IO_OPS[step].color;
  const nodes=["PROGRAM","BUFFER","FILE","DISK"];
  return(
    <div style={{padding:"20px 20px 16px",background:T.bg2,borderRadius:14,border:`1px solid ${c}22`}}>
      <svg width="100%" viewBox="0 0 460 80" style={{overflow:"visible"}}>
        {nodes.map((n,i)=>(
          <g key={i}>
            <rect x={i*116+2} y={14} width={88} height={48} rx={8}
              fill={`${c}12`} stroke={`${c}${i<=Math.floor(p*3)+1?"44":"22"}`} strokeWidth={1.5}/>
            <text x={i*116+46} y={34} textAnchor="middle" fontSize={8.5}
              fill={c} fontFamily="'Bebas Neue'" letterSpacing="0.1em">{n}</text>
            {i<3&&(
              <g>
                <line x1={i*116+90} y1={38} x2={i*116+114} y2={38} stroke={T.muted} strokeWidth={1.5} opacity={0.3}/>
                {Math.floor(p*3)===i&&(
                  <circle cx={i*116+90+24*(p*3-i)} cy={38} r={4} fill={c}
                    style={{filter:`drop-shadow(0 0 4px ${c})`}}/>
                )}
              </g>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}

function S03(){
  const [step,setStep]=useState(0);
  return(
    <Sec id="s03" num="03" title="READING &amp; WRITING" color={T.neon4}>
      <div style={{display:"flex",gap:6,marginBottom:16,flexWrap:"wrap"}}>
        {IO_OPS.map((op,i)=>(
          <button key={i} className="fk" onClick={()=>setStep(i)}
            style={{padding:"7px 14px",borderRadius:9,border:`1px solid ${step===i?op.color:T.border}`,
              background:step===i?`${op.color}18`:T.bg2,fontFamily:"'Fira Code'",fontSize:11,
              color:step===i?op.color:T.muted,transition:"all 0.2s"}}>
            {op.icon} {op.fn}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0}} transition={ease}>
          <PipelineAnim step={step}/>
          <Code src={IO_OPS[step].code} title={`${IO_OPS[step].fn}.c`}/>
        </motion.div>
      </AnimatePresence>

      <div style={{marginTop:20,display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        <div style={{background:T.bg2,borderRadius:10,padding:16,border:`1px solid ${T.neon4}22`}}>
          <div style={{fontFamily:"'Bebas Neue'",fontSize:16,color:T.neon4,marginBottom:8}}>✓ CORRECT</div>
          <div style={{fontFamily:"'Fira Code'",fontSize:12,lineHeight:1.9}}>
            <div><span style={{color:T.neon2}}>int</span><span style={{color:T.text}}> c = </span><span style={{color:T.neon}}>fgetc</span><span style={{color:T.text}}>(fp);</span></div>
            <div><span style={{color:T.neon2}}>while</span><span style={{color:T.text}}>(c != EOF) {"{"} ... {"}"}</span></div>
          </div>
        </div>
        <div style={{background:T.bg2,borderRadius:10,padding:16,border:`1px solid ${T.neon3}22`}}>
          <div style={{fontFamily:"'Bebas Neue'",fontSize:16,color:T.neon3,marginBottom:8}}>✗ BUG</div>
          <div style={{fontFamily:"'Fira Code'",fontSize:12,lineHeight:1.9}}>
            <div><span style={{color:T.neon3}}>char</span><span style={{color:T.text}}> c = </span><span style={{color:T.neon}}>fgetc</span><span style={{color:T.text}}>(fp);</span></div>
            <div><span style={{color:T.neon3}}>// EOF never detected on unsigned!</span></div>
          </div>
        </div>
      </div>
    </Sec>
  );
}

// ── S04: ERRORS ───────────────────────────────────────────────────
const ERRS=[
  {k:"ENOENT",n:"File Not Found",c:T.neon3,errno:2,
   code:`FILE *fp = fopen("missing.txt", "r");
if (fp == NULL) {
    perror("fopen");   // No such file
    // errno == ENOENT
}`},
  {k:"EACCES",n:"Permission Denied",c:T.neon,errno:13,
   code:`FILE *fp = fopen("/etc/shadow", "r");
if (fp == NULL) {
    perror("fopen");   // Permission denied
    // errno == EACCES
}`},
  {k:"ENOSPC",n:"Disk Full",c:T.accent,errno:28,
   code:`size_t n = fwrite(buf, 1, len, fp);
if (n < len) {
    perror("fwrite");  // No space left
    clearerr(fp);
}`},
  {k:"EMFILE",n:"Too Many Open",c:T.neon4,errno:24,
   code:`// Process limit ~1024 fds on Linux
// Always fclose() when done!
fclose(fp);   // Releases the fd slot`},
];

function S04(){
  const [sel,setSel]=useState(0);
  const e=ERRS[sel];
  return(
    <Sec id="s04" num="04" title="ERRORS &amp; EOF" color={T.neon3}>
      <div style={{display:"grid",gridTemplateColumns:"180px 1fr",gap:14}}>
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {ERRS.map((er,i)=>(
            <button key={i} className="fk" onClick={()=>setSel(i)}
              style={{padding:"11px 12px",borderRadius:10,border:`1px solid ${sel===i?er.c:T.border}`,
                background:sel===i?`${er.c}14`:T.bg2,textAlign:"left",transition:"all 0.2s"}}>
              <div style={{fontFamily:"'Fira Code'",fontSize:9,color:sel===i?er.c:T.muted,letterSpacing:"0.1em"}}>{er.k}</div>
              <div style={{fontSize:11,color:sel===i?T.textStrong:T.text,marginTop:2}}>{er.n}</div>
              <div style={{fontFamily:"'Bebas Neue'",fontSize:18,color:sel===i?er.c:T.muted,marginTop:1}}>errno={er.errno}</div>
            </button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={sel} initial={{opacity:0,x:10}} animate={{opacity:1,x:0}} exit={{opacity:0}} transition={ease}>
            <div style={{background:T.bg2,borderRadius:12,border:`1px solid ${e.c}28`,padding:18,marginBottom:12,position:"relative",overflow:"hidden"}}>
              <Glow c={e.c} size={140} x={160} y={-30} op={0.07}/>
              <div style={{fontFamily:"'Bebas Neue'",fontSize:36,color:e.c,lineHeight:1}}>{e.k}</div>
              <div style={{fontSize:12,color:T.text,marginBottom:12}}>{e.n} — errno {e.errno}</div>
              <div style={{display:"flex",alignItems:"center",gap:0,flexWrap:"wrap"}}>
                {["fopen()","→ NULL","→ check errno","→ perror()"].map((s,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center"}}>
                    <div style={{padding:"4px 10px",borderRadius:5,background:`${e.c}14`,border:`1px solid ${e.c}30`,
                      fontFamily:"'Fira Code'",fontSize:10,color:e.c}}>{s}</div>
                    {i<3&&<div style={{width:14,height:1,background:`${e.c}60`}}/>}
                  </div>
                ))}
              </div>
            </div>
            <Code src={e.code}/>
          </motion.div>
        </AnimatePresence>
      </div>
    </Sec>
  );
}

// ── S05: SEEK ─────────────────────────────────────────────────────
function SeekViz(){
  const content="Hello, World!\n";
  const bytes=Array.from(content);
  const [pos,setPos]=useState(0);
  const [whence,setWhence]=useState("SEEK_SET");
  const [offset,setOffset]=useState(0);
  const base=whence==="SEEK_SET"?0:whence==="SEEK_CUR"?pos:bytes.length;
  const newPos=Math.max(0,Math.min(bytes.length,base+offset));

  return(
    <div style={{background:T.bg2,borderRadius:14,border:`1px solid ${T.border}`,overflow:"hidden"}}>
      <div style={{padding:"9px 16px",borderBottom:`1px solid ${T.border}`}}>
        <Mono c={T.muted} size={9} style={{letterSpacing:"0.14em"}}>INTERACTIVE FILE POINTER ANIMATOR</Mono>
      </div>
      <div style={{padding:20}}>
        <div style={{display:"flex",gap:3,flexWrap:"wrap",marginBottom:20}}>
          {bytes.map((ch,i)=>(
            <motion.div key={i} whileHover={{scale:1.12}} onClick={()=>setPos(i)}
              animate={{background:i===pos?`${T.neon}28`:T.dim,borderColor:i===pos?T.neon:T.border}}
              transition={ease}
              style={{width:34,height:42,display:"flex",flexDirection:"column",alignItems:"center",
                justifyContent:"center",borderRadius:6,border:"1px solid",cursor:"pointer",position:"relative"}}>
              {i===pos&&<div style={{position:"absolute",top:-14,fontSize:9,color:T.neon,fontFamily:"'Fira Code'"}}>▼fp</div>}
              <Mono c={i===pos?T.neon:T.text} size={11}>{ch==="\n"?"↵":ch}</Mono>
              <Mono c={T.muted} size={8}>{i}</Mono>
            </motion.div>
          ))}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
          <div>
            <Mono c={T.muted} size={9} style={{display:"block",marginBottom:6,letterSpacing:"0.12em"}}>WHENCE</Mono>
            {["SEEK_SET","SEEK_CUR","SEEK_END"].map(w=>(
              <button key={w} className="fk" onClick={()=>setWhence(w)}
                style={{display:"block",width:"100%",marginBottom:5,padding:"8px 10px",borderRadius:7,textAlign:"left",
                  background:whence===w?`${T.neon2}15`:T.dim,border:`1px solid ${whence===w?T.neon2:T.border}`,
                  transition:"all 0.2s"}}>
                <Mono c={whence===w?T.neon2:T.text} size={11}>{w}</Mono>
                <div style={{fontSize:9,color:T.muted}}>{w==="SEEK_SET"?"from start":w==="SEEK_CUR"?"from current":"from end"}</div>
              </button>
            ))}
          </div>
          <div>
            <Mono c={T.muted} size={9} style={{display:"block",marginBottom:6,letterSpacing:"0.12em"}}>OFFSET: {offset}</Mono>
            <input type="range" min={-5} max={14} value={offset} onChange={e=>setOffset(Number(e.target.value))}
              style={{width:"100%",marginBottom:12}}/>
            <div style={{padding:"10px 12px",background:T.dim,borderRadius:9,marginBottom:10}}>
              <Mono c={T.neon} size={12}>fseek</Mono>
              <Mono c={T.text} size={12}>(fp, {offset}, {whence});</Mono>
              <br/><Mono c={T.muted} size={10}>→ new position: {newPos}</Mono>
            </div>
            <motion.button className="fk" onClick={()=>setPos(newPos)} whileTap={{scale:0.97}}
              style={{width:"100%",padding:"9px",borderRadius:8,background:`${T.neon}18`,
                border:`1px solid ${T.neon}44`,color:T.neon,fontFamily:"'Fira Code'",fontSize:11}}>
              Apply fseek →
            </motion.button>
            <div style={{marginTop:10}}>
              <Mono c={T.muted} size={9} style={{display:"block"}}>ftell(fp) =</Mono>
              <span style={{fontFamily:"'Bebas Neue'",fontSize:34,color:T.neon2}}>{pos}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function S05(){
  return(
    <Sec id="s05" num="05" title="FILE POINTERS &amp; SEEK" color={T.accent}>
      <SeekViz/>
      <Code src={`// Jump to record #10 in a binary file
long offset = 10L * sizeof(Record);
if (fseek(fp, offset, SEEK_SET) != 0) {
    perror("fseek");
}
long pos = ftell(fp);   // current position
rewind(fp);              // fseek(fp, 0, SEEK_SET)`} title="seek.c" hlLines={[2,3,4]}/>
    </Sec>
  );
}

// ── S06: BUFFERING ────────────────────────────────────────────────
function BufferViz(){
  const [size,setSize]=useState(512);
  const fileSize=65536;
  const calls=Math.ceil(fileSize/size);
  const eff=Math.min(100,Math.round((1-calls/fileSize)*100));
  const c=calls===1?T.neon4:calls<20?T.neon2:calls<200?T.neon:T.neon3;
  return(
    <div style={{background:T.bg2,borderRadius:14,border:`1px solid ${T.border}`,overflow:"hidden"}}>
      <div style={{padding:"9px 16px",borderBottom:`1px solid ${T.border}`}}>
        <Mono c={T.muted} size={9} style={{letterSpacing:"0.14em"}}>BUFFER SIZE vs SYSCALLS (64KB file)</Mono>
      </div>
      <div style={{padding:20}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:18}}>
          {[{l:"BUFFER",v:size>=1024?`${size/1024}KB`:`${size}B`,c:T.neon2},
            {l:"SYSCALLS",v:calls.toLocaleString(),c},
            {l:"EFFICIENCY",v:`${eff}%`,c:eff>80?T.neon4:eff>50?T.neon:T.neon3}].map(({l,v,c})=>(
            <div key={l} style={{background:T.dim,borderRadius:9,padding:"12px 14px",border:`1px solid ${c}22`}}>
              <div style={{fontSize:8,color:T.muted,fontFamily:"'Fira Code'",letterSpacing:"0.1em",marginBottom:3}}>{l}</div>
              <div style={{fontFamily:"'Bebas Neue'",fontSize:28,color:c}}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{marginBottom:12}}>
          <div style={{height:10,background:T.dim,borderRadius:5,overflow:"hidden",marginBottom:4}}>
            <motion.div animate={{width:`${eff}%`}} transition={sp}
              style={{height:"100%",borderRadius:5,background:`linear-gradient(90deg,${T.neon3},${T.neon4})`}}/>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:8,color:T.muted,fontFamily:"'Fira Code'"}}>
            <span>1B</span><span>8KB default</span>
          </div>
        </div>
        <input type="range" min={1} max={8192} step={1} value={size}
          onChange={e=>setSize(Number(e.target.value))} style={{width:"100%",marginBottom:12}}/>
        <div style={{padding:"8px 12px",borderRadius:7,
          background:eff>80?`${T.neon4}0E`:`${T.neon3}0E`,
          border:`1px solid ${eff>80?T.neon4:T.neon3}28`,fontSize:11,fontFamily:"'Fira Code'",
          color:eff>80?T.neon4:T.neon3}}>
          {calls===1?"✓ Single read — optimal":calls<20?"✓ Good":calls<200?"△ Acceptable":"✗ Too many tiny reads"}
        </div>
      </div>
    </div>
  );
}

function S06(){
  return(
    <Sec id="s06" num="06" title="BUFFERING" color={T.neon}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:16}}>
        <BufferViz/>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {[{flag:"_IOFBF",name:"Fully Buffered",c:T.neon4,desc:"Default for files. Flushes when full or fflush()."},
            {flag:"_IOLBF",name:"Line Buffered",c:T.neon2,desc:"Flushes on \\n. Default for stdout (terminal)."},
            {flag:"_IONBF",name:"Unbuffered",c:T.neon3,desc:"Every write = syscall. Default for stderr."}].map(b=>(
            <div key={b.flag} style={{flex:1,background:T.bg2,borderRadius:10,padding:"13px 15px",border:`1px solid ${b.c}20`}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
                <Mono c={b.c} size={11}>{b.flag}</Mono>
                <span style={{fontFamily:"'Bebas Neue'",fontSize:15,color:T.text}}>{b.name}</span>
              </div>
              <p style={{fontSize:11,color:T.muted}}>{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
      <Code src={`setvbuf(fp, NULL, _IOFBF, 65536);   // 64KB fully-buffered
setvbuf(stdout, NULL, _IOLBF, 0);   // line-buffered
setvbuf(stderr, NULL, _IONBF, 0);   // unbuffered

fflush(fp);    // Force-flush before fseek or fork!`} title="buffering.c" hlLines={[4]}/>
    </Sec>
  );
}

// ── S07: STRUCTS ──────────────────────────────────────────────────
const FIELDS=[
  {name:"id",     type:"uint32_t",bytes:4,  offset:0, color:T.neon2},
  {name:"score",  type:"float",   bytes:4,  offset:4, color:T.neon4},
  {name:"level",  type:"uint8_t", bytes:1,  offset:8, color:T.accent},
  {name:"_pad",   type:"padding", bytes:3,  offset:9, color:T.muted},
  {name:"name[]", type:"char[32]",bytes:32, offset:12,color:T.neon},
];

function StructViz(){
  const [hov,setHov]=useState(null);
  const total=FIELDS.reduce((a,f)=>a+f.bytes,0);
  return(
    <div style={{background:T.bg2,borderRadius:14,border:`1px solid ${T.border}`,overflow:"hidden"}}>
      <div style={{padding:"9px 16px",borderBottom:`1px solid ${T.border}`}}>
        <Mono c={T.muted} size={9} style={{letterSpacing:"0.14em"}}>STRUCT MEMORY LAYOUT — {total} bytes total</Mono>
      </div>
      <div style={{padding:20}}>
        {/* Byte map */}
        <div style={{display:"flex",height:52,borderRadius:8,overflow:"hidden",marginBottom:4,border:`1px solid ${T.border}`}}>
          {FIELDS.map((f,i)=>(
            <motion.div key={i} style={{flex:f.bytes,cursor:"pointer",overflow:"hidden",
              background:hov===i?f.color:`${f.color}${f.name==="_pad"?"18":"38"}`,
              display:"flex",alignItems:"center",justifyContent:"center",transition:"background 0.2s"}}
              onHoverStart={()=>setHov(i)} onHoverEnd={()=>setHov(null)}>
              {f.bytes>=3&&<span style={{fontFamily:"'Fira Code'",fontSize:8,color:hov===i?T.bg:T.textStrong,
                whiteSpace:"nowrap",padding:"0 2px",fontWeight:600}}>{f.name}</span>}
            </motion.div>
          ))}
        </div>
        {/* Offset ruler */}
        <div style={{display:"flex",height:14,marginBottom:14}}>
          {FIELDS.map((f,i)=>(
            <div key={i} style={{flex:f.bytes,borderLeft:`1px solid ${T.border}`}}>
              <span style={{fontFamily:"'Fira Code'",fontSize:7,color:T.muted,paddingLeft:2}}>{f.offset}</span>
            </div>
          ))}
        </div>
        {/* Field table */}
        {FIELDS.map((f,i)=>(
          <motion.div key={i} whileHover={{x:3}} onHoverStart={()=>setHov(i)} onHoverEnd={()=>setHov(null)}
            style={{display:"flex",gap:10,alignItems:"center",padding:"6px 10px",borderRadius:7,cursor:"pointer",
              background:hov===i?`${f.color}10`:T.dim,marginBottom:4,transition:"background 0.2s"}}>
            <div style={{width:8,height:8,borderRadius:2,background:f.color,flexShrink:0}}/>
            <Mono c={f.color} size={11} style={{width:72,flexShrink:0}}>{f.name}</Mono>
            <Mono c={T.muted} size={10} style={{width:76,flexShrink:0}}>{f.type}</Mono>
            <Mono c={T.text} size={10} style={{width:64,flexShrink:0}}>+{f.offset}</Mono>
            <Mono c={T.neon4} size={10}>{f.bytes}B</Mono>
          </motion.div>
        ))}
        <div style={{marginTop:12,padding:"8px 12px",background:`${T.neon3}0C`,borderRadius:7,
          border:`1px solid ${T.neon3}28`,fontSize:11,color:T.neon3}}>
          ⚠ Never fwrite structs with pointer members
        </div>
      </div>
    </div>
  );
}

function S07(){
  return(
    <Sec id="s07" num="07" title="STRUCTURED DATA" color={T.neon2}>
      <StructViz/>
      <Code src={`typedef struct {
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
    </Sec>
  );
}

// ── S08: LOG SYSTEM ───────────────────────────────────────────────
const LOG_SRC=`#include <stdio.h>
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

function LogDemo(){
  const [entries,setEntries]=useState([
    {lv:"INFO",msg:"Server started on :8080",ts:"10:00:01"},
    {lv:"WARN",msg:"Memory usage 87.3%",ts:"10:00:05"},
    {lv:"ERROR",msg:"DB timeout after 5s",ts:"10:00:09"},
  ]);
  const [msg,setMsg]=useState("");
  const [lv,setLv]=useState("INFO");
  const endRef=useRef(null);
  const lvc={INFO:T.neon2,WARN:T.neon,ERROR:T.neon3};

  const add=()=>{
    if(!msg.trim())return;
    const ts=new Date().toTimeString().slice(0,8);
    setEntries(e=>[...e,{lv,msg:msg.trim(),ts}]);
    setMsg("");
    setTimeout(()=>endRef.current?.scrollIntoView({behavior:"smooth"}),40);
  };

  return(
    <div style={{background:T.bg2,borderRadius:14,border:`1px solid ${T.border}`,overflow:"hidden"}}>
      <div style={{padding:"9px 16px",background:T.dim,borderBottom:`1px solid ${T.border}`,
        display:"flex",alignItems:"center",gap:10}}>
        <div style={{display:"flex",gap:5}}>
          {["#FF5F57","#FEBC2E","#28C840"].map(c=><div key={c} style={{width:9,height:9,borderRadius:"50%",background:c}}/>)}
        </div>
        <div style={{width:6,height:6,borderRadius:"50%",background:T.neon4,animation:"pulse 2s infinite"}}/>
        <Mono c={T.muted} size={10}>app.log — {entries.length} entries</Mono>
        <button className="fk" onClick={()=>{
          const blob=new Blob([LOG_SRC],{type:"text/plain"});
          const a=document.createElement("a");a.href=URL.createObjectURL(blob);
          a.download="log_system.c";a.click();
        }} style={{marginLeft:"auto",padding:"3px 10px",borderRadius:5,border:`1px solid ${T.neon4}40`,
          color:T.neon4,fontSize:9,fontFamily:"'Fira Code'",background:`${T.neon4}10`}}>⬇ .c</button>
      </div>
      <div style={{background:"#030A10",padding:"12px 16px",minHeight:150,maxHeight:190,overflowY:"auto",
        fontFamily:"'JetBrains Mono'",fontSize:12}}>
        <AnimatePresence>
          {entries.map((e,i)=>(
            <motion.div key={i} initial={{opacity:0,x:-6}} animate={{opacity:1,x:0}} transition={ease}
              style={{marginBottom:2,lineHeight:1.65}}>
              <span style={{color:T.muted}}>[{e.ts}]</span>
              {" "}<span style={{color:lvc[e.lv],fontWeight:600}}>{e.lv}</span>
              {" "}<span style={{color:T.text}}>{e.msg}</span>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={endRef}/>
      </div>
      <div style={{padding:"10px 16px",borderTop:`1px solid ${T.border}`,display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
        <div style={{display:"flex",borderRadius:7,overflow:"hidden",border:`1px solid ${T.border}`}}>
          {["INFO","WARN","ERROR"].map(l=>(
            <button key={l} className="fk" onClick={()=>setLv(l)} style={{padding:"5px 9px",fontFamily:"'Fira Code'",fontSize:9,
              color:lv===l?T.bg:lvc[l],background:lv===l?lvc[l]:"transparent",transition:"all 0.2s"}}>{l}</button>
          ))}
        </div>
        <input value={msg} onChange={e=>setMsg(e.target.value)} onKeyDown={e=>e.key==="Enter"&&add()}
          placeholder="Enter log message…"
          style={{flex:1,background:T.dim,border:`1px solid ${T.border}`,borderRadius:7,
            padding:"5px 10px",fontFamily:"'Fira Code'",fontSize:11,color:T.text,outline:"none",minWidth:120}}/>
        <button className="fk" onClick={add} style={{padding:"5px 12px",borderRadius:7,
          background:`${T.neon4}15`,border:`1px solid ${T.neon4}38`,color:T.neon4,fontFamily:"'Fira Code'",fontSize:10}}>WRITE →</button>
        <button className="fk" onClick={()=>setEntries([])} style={{padding:"5px 9px",borderRadius:7,
          background:`${T.neon3}0E`,border:`1px solid ${T.neon3}28`,color:T.neon3,fontFamily:"'Fira Code'",fontSize:10}}>CLR</button>
      </div>
    </div>
  );
}

function S08(){
  return(
    <Sec id="s08" num="08" title="MASTER PROJECT" sub="Production log system: rotation, timestamps, levels." color={T.neon4}>
      <LogDemo/>
      <Code src={LOG_SRC} title="log_system.c" hlLines={[12,13,14,15,22,32,33]}/>
    </Sec>
  );
}

// ── SIDEBAR ───────────────────────────────────────────────────────
const NAV=[
  {id:"s01",n:"01",label:"MODES",c:T.neon2},
  {id:"s02",n:"02",label:"TXT/BIN",c:T.neon4},
  {id:"s03",n:"03",label:"R/W",c:T.neon4},
  {id:"s04",n:"04",label:"ERRORS",c:T.neon3},
  {id:"s05",n:"05",label:"SEEK",c:T.accent},
  {id:"s06",n:"06",label:"BUFFER",c:T.neon},
  {id:"s07",n:"07",label:"STRUCT",c:T.neon2},
  {id:"s08",n:"08",label:"PROJECT",c:T.neon4},
];

function Sidebar({active}){
  return(
    <nav className="hide-mobile" style={{position:"sticky",top:66,width:66,flexShrink:0,
      display:"flex",flexDirection:"column",gap:4,paddingTop:8}}>
      {NAV.map(n=>{
        const on=active===n.id;
        return(
          <a key={n.id} href={`#${n.id}`} className="fk"
            style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"7px 4px",
              borderRadius:9,border:`1px solid ${on?n.c:T.border}`,
              background:on?`${n.c}16`:T.bg2,transition:"all 0.2s",textDecoration:"none"}}>
            <span style={{fontFamily:"'Bebas Neue'",fontSize:8,color:on?n.c:T.muted,letterSpacing:"0.1em"}}>{n.n}</span>
            <span style={{fontFamily:"'Fira Code'",fontSize:7,color:on?n.c:T.muted,marginTop:1,textAlign:"center"}}>{n.label}</span>
          </a>
        );
      })}
    </nav>
  );
}

// ── PAGE ──────────────────────────────────────────────────────────
export default function CFileIOPage(){
  const [active,setActive]=useState("s01");

  useEffect(()=>{
    const obs=new IntersectionObserver(es=>{
      es.forEach(e=>{if(e.isIntersecting)setActive(e.target.id);});
    },{rootMargin:"-30% 0px -60% 0px"});
    NAV.forEach(n=>{const el=document.getElementById(n.id);if(el)obs.observe(el);});
    return()=>obs.disconnect();
  },[]);

  return(
    <>
      <G/>
      <div style={{minHeight:"100vh",background:T.bg}}>
        {/* Topbar */}
        <div style={{position:"fixed",top:0,left:0,right:0,zIndex:100,
          background:`${T.bg}EC`,backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",
          borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",
          padding:"0 24px",height:48,gap:12}}>
          <span style={{fontFamily:"'Bebas Neue'",fontSize:20,color:T.neon,letterSpacing:"0.1em"}}>C FILE I/O</span>
          <Mono c={T.muted} size={10}>Chapter 6</Mono>
          <div style={{marginLeft:"auto",display:"flex",gap:6}}>
            <Tag c={T.neon4}>C17/C23</Tag>
            <Tag c={T.muted}>No 3D</Tag>
          </div>
        </div>

        <div style={{maxWidth:1200,margin:"0 auto",padding:"0 20px",paddingTop:48}}>
          <Hero/>
          <div style={{display:"flex",gap:24,alignItems:"flex-start"}}>
            <Sidebar active={active}/>
            <main style={{flex:1,minWidth:0,paddingTop:12}}>
              <S01/><S02/><S03/><S04/><S05/><S06/><S07/><S08/>

              {/* Nav footer */}
              <div style={{display:"flex",justifyContent:"space-between",gap:10,
                paddingTop:28,borderTop:`1px solid ${T.border}`,flexWrap:"wrap"}}>
                {[
                  {href:"/c-5",dir:"←",pre:"PREVIOUS",title:"Chapter 5: Pointers",c:T.neon2},
                  {href:"/c-7",dir:"→",pre:"NEXT",title:"Chapter 7: Advanced Topics",c:T.neon},
                ].map(({href,dir,pre,title,c})=>(
                  <motion.a key={href} href={href} whileHover={{x:dir==="←"?-3:3}} transition={sp}
                    style={{display:"flex",alignItems:"center",gap:10,padding:"12px 18px",
                      borderRadius:11,border:`1px solid ${T.border}`,background:T.bg2}}>
                    {dir==="←"&&<span style={{color:c,fontSize:18}}>{dir}</span>}
                    <div style={{textAlign:dir==="→"?"right":"left"}}>
                      <div style={{fontSize:8,color:T.muted,fontFamily:"'Fira Code'",letterSpacing:"0.1em"}}>{pre}</div>
                      <div style={{fontFamily:"'Bebas Neue'",fontSize:16,color:T.textStrong}}>{title}</div>
                    </div>
                    {dir==="→"&&<span style={{color:c,fontSize:18}}>{dir}</span>}
                  </motion.a>
                ))}
              </div>

              <div style={{textAlign:"center",padding:"20px 0 40px",marginTop:24,borderTop:`1px solid ${T.border}`}}>
                <div style={{display:"flex",gap:6,justifyContent:"center",flexWrap:"wrap",marginBottom:6}}>
                  {["Next.js 14.2+","React 18.3+","Framer Motion 11+","C17/C23","No 3D"].map(l=>(
                    <span key={l} style={{fontFamily:"'Fira Code'",fontSize:8,color:T.muted,
                      padding:"2px 7px",borderRadius:999,border:`1px solid ${T.border}`}}>{l}</span>
                  ))}
                </div>
                <Mono c={T.muted} size={9}>C File I/O Masterclass — Chapter 6</Mono>
              </div>
            </main>
          </div>
        </div>
      </div>
    </>
  );
}
