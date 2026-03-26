"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";

const BOOT_LINES = [
  "LANG_FILES v4.002.0 — BOOT SEQUENCE INITIATED",
  "UEFI Firmware Version: 2024.03 (VISUOSLAYER)",
  "CPU: AMD EPYC 9754 128-Core @ 2.25GHz",
  "Memory: 256 GiB DDR5 ECC @ 4800 MT/s",
  "Storage: NVMe Samsung PM9A3 3.84TB [GPT, EXT4]",
  "Network: eth0: 10.0.4.22/24, gateway 10.0.4.1",
  "Loading kernel modules: nvidia, i2c, usbhid... OK",
  "Starting system services:",
  "  → systemd-logind ................... [ACTIVE]",
  "  → NetworkManager ................... [ACTIVE]",
  "  → firewalld ........................ [ACTIVE]",
  "Mounting encrypted partition /dev/mapper/luks-...",
  "  → Passphrase accepted. Decrypting case files...",
  "  → C_LANG ............ [DECRYPTED] ✓ 1.2ms",
  "  → PYTHON_CORE ....... [DECRYPTED] ✓ 0.8ms",
  "  → JAVA_RUNTIME ...... [DECRYPTED] ✓ 1.1ms",
  "Performing filesystem check: /dev/sda1: clean",
  "Starting audit daemon: [ OK ]",
  "Starting sshd: [ OK ]",
  "Starting nginx: [ OK ]",
  "CASE FILE LANG-01 UNLOCKED — CLEARANCE: ALPHA",
  "SELECT YOUR TARGET LANGUAGE",
];

const LANGUAGES = [
  {
    id: "c",
    label: "C",
    tag: "EVIDENCE_01",
    tagline: "Systems & Speed",
    desc: "The foundation of modern computing. Raw, fast, and close to the metal.",
    meta: ["Compiled", "Low-Level", "1972"],
    accent: "#00f7ff",
    route: "/c-1",
    features: ["Memory Management", "Pointer Arithmetic", "OS Development"],
  },
  {
    id: "python",
    label: "PYTHON",
    tag: "EVIDENCE_02",
    tagline: "Readability & Versatility",
    desc: "Clean syntax, massive ecosystem. From scripts to machine learning.",
    meta: ["Interpreted", "High-Level", "1991"],
    accent: "#ffb347",
    route: "/p-1",
    features: ["Data Science", "Automation", "Web Backend"],
  },
  {
    id: "java",
    label: "JAVA",
    tag: "EVIDENCE_03",
    tagline: "Enterprise & Stability",
    desc: "Write once, run anywhere. The backbone of enterprise software.",
    meta: ["Compiled+VM", "OOP", "1995"],
    accent: "#ff3366",
    route: "/j-1",
    features: ["Android Dev", "Enterprise Apps", "Cross-Platform"],
  },
];

/* ── Glitch Text ── */
const GLITCH_CHARS = "!<>-_\\/[]{}—=+*^?#@$%&";
function GlitchText({ text, active }) {
  const [display, setDisplay] = useState(text);
  useEffect(() => {
    if (!active) { setDisplay(text); return; }
    let iter = 0;
    const iv = setInterval(() => {
      setDisplay(
        text.split("").map((c, i) =>
          i < iter ? c : c === " " ? " " : GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]
        ).join("")
      );
      iter += 0.4;
      if (iter >= text.length) { setDisplay(text); clearInterval(iv); }
    }, 30);
    return () => clearInterval(iv);
  }, [active, text]);
  return <span>{display}</span>;
}

/* ── Boot Screen — BUG FIXED ──
   Root cause: useEffect deps included `isRed`, causing the effect to
   re-run and spawn a second setTimeout chain every time isRed flipped.
   Fix: move all mutable counters into refs so the closure never goes
   stale, use functional setState, and keep deps array empty.
*/
function BootScreen({ onComplete }) {
  const [lines, setLines]       = useState([]);
  const [progress, setProgress] = useState(0);
  const [done, setDone]         = useState(false);
  const [isRed, setIsRed]       = useState(false);
  const [errorLine, setErrorLine] = useState(null);

  const mountedRef  = useRef(false);
  const lineIdxRef  = useRef(0);
  const isRedRef    = useRef(false);
  const timerRef    = useRef(null);
  const termRef     = useRef(null);
  const headerRef   = useRef(null);
  const barFillRef  = useRef(null);
  const onCompleteRef = useRef(onComplete);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  /* GSAP entrance */
  useEffect(() => {
    if (headerRef.current)
      gsap.from(headerRef.current, { y: -24, opacity: 0, duration: 0.7, ease: "power3.out" });
    if (termRef.current)
      gsap.from(termRef.current,   { y:  24, opacity: 0, duration: 0.7, ease: "power3.out", delay: 0.18 });
  }, []);

  /* GSAP progress bar glow pulse */
  useEffect(() => {
    if (!barFillRef.current) return;
    gsap.killTweensOf(barFillRef.current);
    gsap.to(barFillRef.current, {
      boxShadow: isRed
        ? "0 0 18px #ff3366, 0 0 6px #ff3366"
        : "0 0 14px #00f7ff, 0 0 4px #00f7ff",
      duration: 0.9, yoyo: true, repeat: -1, ease: "sine.inOut",
    });
  }, [isRed]);

  /* Line ticker — single chain, no stale closures */
  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;

    const tick = () => {
      const idx = lineIdxRef.current;
      if (idx >= BOOT_LINES.length) {
        setTimeout(() => setDone(true), 600);
        setTimeout(() => onCompleteRef.current?.(), 1200);
        return;
      }

      setLines(prev => [...prev, BOOT_LINES[idx]]);
      const pct = Math.round(((idx + 1) / BOOT_LINES.length) * 100);
      setProgress(pct);

      if (pct >= 80 && !isRedRef.current) {
        isRedRef.current = true;
        setIsRed(true);
        setErrorLine("⚠️ CRITICAL ERROR: Memory fault at 0x7FFE — Kernel panic! ⚠️");
        if (termRef.current) {
          gsap.to(termRef.current, {
            keyframes: [
              { boxShadow: "0 0 50px rgba(255,51,102,0.9)", duration: 0.08 },
              { boxShadow: "0 0 12px rgba(255,51,102,0.25)", duration: 0.35 },
            ],
          });
        }
      }

      lineIdxRef.current += 1;
      timerRef.current = setTimeout(tick, 260 + Math.random() * 180);
    };

    timerRef.current = setTimeout(tick, 400);
    return () => clearTimeout(timerRef.current);
  }, []); // ← empty: intentional, all state via refs

  return (
    <div style={{
      position: "fixed", inset: 0, background: "#060810", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column",
      opacity: done ? 0 : 1, transition: "opacity 0.6s ease",
      pointerEvents: done ? "none" : "all",
    }}>
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.08) 2px,rgba(0,0,0,0.08) 4px)",
        zIndex: 1,
      }} />

      <div style={{ width: "min(600px,90vw)", position: "relative", zIndex: 2 }}>
        {/* header */}
        <div ref={headerRef} style={{ borderLeft: "2px solid #00f7ff", paddingLeft: 16, marginBottom: 28 }}>
          <div style={{ color: "#00f7ff", fontSize: 10, letterSpacing: 4, marginBottom: 4 }}>
            TOP SECRET // CASE #2026
          </div>
          <div style={{ color: "#c8d8f0", fontSize: 22, fontFamily: "'Fira Code',monospace", fontWeight: 700, letterSpacing: 2 }}>
            LANG_FILES
          </div>
        </div>

        {/* terminal */}
        <div
          ref={termRef}
          className={isRed ? "shake-terminal terminal-red" : ""}
          style={{
            border: "1px solid #1e2535", background: "rgba(10,13,20,0.95)",
            position: "relative", transition: "border 0.2s",
          }}
        >
          {/* title bar */}
          <div style={{
            background: "#0d1118", borderBottom: "1px solid #1e2535",
            padding: "6px 14px", display: "flex", alignItems: "center", gap: 8,
          }}>
            {["#ff3366","#ffb347","#39ff14"].map(c => (
              <span key={c} style={{ width: 8, height: 8, borderRadius: "50%", background: c, display: "block" }} />
            ))}
            <span style={{ color: "#3a4558", fontSize: 10, marginLeft: 8, letterSpacing: 2 }}>
              TERMINAL — BOOT_SEQUENCE.sh
            </span>
          </div>

          {/* lines */}
          <div style={{ padding: "20px 20px 16px", minHeight: 220, fontFamily: "'Fira Code',monospace", fontSize: 12 }}>
            {lines.map((l, i) => (
              <div key={i} style={{
                display: "flex", gap: 10, marginBottom: 6,
                color: l.includes("✓") ? "#39ff14" : l.includes("SELECT") ? "#ffb347" : "#c8d8f0",
                animation: "fadeIn 0.2s ease",
              }}>
                <span style={{ color: "#00f7ff", userSelect: "none" }}>$</span>
                <span>{l}</span>
              </div>
            ))}
            {errorLine && (
              <div style={{
                display: "flex", gap: 10, marginBottom: 6, color: "#ff3366",
                animation: "fadeIn 0.2s ease, glitch 0.3s infinite",
              }}>
                <span style={{ color: "#ff3366", userSelect: "none" }}>!</span>
                <span>{errorLine}</span>
              </div>
            )}
            <span style={{
              display: "inline-block", width: 8, height: 14,
              background: "#00f7ff", animation: "blink 1s step-end infinite", verticalAlign: "middle",
            }} />
          </div>

          {/* progress */}
          <div style={{ borderTop: "1px solid #1e2535", padding: "10px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 10, color: "#3a4558", letterSpacing: 2 }}>
              <span>LOADING</span><span>{progress}%</span>
            </div>
            <div style={{ height: 2, background: "#1e2535", width: "100%" }}>
              <div
                ref={barFillRef}
                style={{
                  height: "100%",
                  background: isRed ? "#ff3366" : "#00f7ff",
                  width: `${progress}%`,
                  transition: "width 0.3s ease, background 0.2s",
                }}
              />
            </div>
          </div>
        </div>

        {/* bottom status */}
        <div style={{
          display: "flex", justifyContent: "space-between",
          marginTop: 12, fontSize: 9, color: "#3a4558", letterSpacing: 2,
        }}>
          <span>CAM_04 [●REC]</span>
          <span>FREQ: 12.4 Hz</span>
          <span>SIGNAL: STABLE</span>
        </div>
      </div>

      <style>{`
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes fadeIn{from{opacity:0;transform:translateX(-4px)}to{opacity:1;transform:none}}
        @keyframes shakeTerminal{
          0%{transform:translate(1px,1px) rotate(0deg)}10%{transform:translate(-1px,-2px) rotate(-0.5deg)}
          20%{transform:translate(-2px,0px) rotate(0.5deg)}30%{transform:translate(2px,1px) rotate(0deg)}
          40%{transform:translate(1px,-1px) rotate(0.5deg)}50%{transform:translate(-1px,2px) rotate(-0.5deg)}
          60%{transform:translate(-2px,1px) rotate(0deg)}70%{transform:translate(2px,1px) rotate(-0.5deg)}
          80%{transform:translate(-1px,-1px) rotate(0.5deg)}90%{transform:translate(1px,2px) rotate(0deg)}
          100%{transform:translate(1px,-2px) rotate(-0.5deg)}
        }
        .shake-terminal{animation:shakeTerminal 0.15s infinite}
        .terminal-red{border:1px solid #ff3366 !important;box-shadow:0 0 20px rgba(255,51,102,0.4)}
        @keyframes glitch{
          0%{text-shadow:-1px 0 red,1px 0 blue;opacity:1}
          50%{text-shadow:-2px 0 red,2px 0 blue;opacity:0.8}
          100%{text-shadow:-1px 0 red,1px 0 blue;opacity:1}
        }
      `}</style>
    </div>
  );
}

/* ── HUD ── */
function HUD({ activeLanguage }) {
  const [time, setTime] = useState("00:00:00");
  const hudRef = useRef(null);
  useEffect(() => {
    const iv = setInterval(() => {
      const n = new Date();
      setTime([n.getHours(), n.getMinutes(), n.getSeconds()].map(x => String(x).padStart(2,"0")).join(":"));
    }, 1000);
    return () => clearInterval(iv);
  }, []);
  useEffect(() => {
    if (hudRef.current)
      gsap.from(hudRef.current, { y: -40, opacity: 0, duration: 0.8, ease: "power3.out", delay: 0.1 });
  }, []);
  return (
    <div ref={hudRef} style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "10px 24px",
      background: "rgba(6,8,16,0.92)",
      borderBottom: "1px solid #1e2535",
      backdropFilter: "blur(10px)",
      fontFamily: "'Fira Code',monospace",
      fontSize: 10, letterSpacing: 2,
    }}>
      <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
        <span style={{ color: "#00f7ff" }}>LANG_FILES</span>
        <span style={{ color: "#3a4558" }}>|</span>
        <span style={{ color: "#6b7fa3" }}>CASE FILE: <span style={{ color: "#00f7ff" }}>LANG-01</span></span>
      </div>
      <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
        {activeLanguage && (
          <span style={{ color: "#ffb347" }}>
            TARGET: <span style={{ color: "#ff3366" }}>{activeLanguage}</span>
          </span>
        )}
        <span style={{ color: "#3a4558" }}>SIGNAL: <span style={{ color: "#39ff14" }}>99%</span></span>
        <span style={{ color: "#ff3366" }}>● REC</span>
        <span style={{ color: "#3a4558" }}>{time}</span>
      </div>
    </div>
  );
}

/* ── Language Card with GSAP hover ── */
function LanguageCard({ lang, onSelect, index }) {
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  const cardRef = useRef(null);

  /* GSAP entrance stagger */
  useEffect(() => {
    if (cardRef.current)
      gsap.from(cardRef.current, {
        y: 40, opacity: 0, duration: 0.7,
        ease: "power3.out",
        delay: 0.15 + index * 0.15,
      });
  }, []);

  const handleMouseEnter = () => {
    setHovered(true);
    if (cardRef.current)
      gsap.to(cardRef.current, { y: -6, duration: 0.35, ease: "power2.out" });
  };
  const handleMouseLeave = () => {
    setHovered(false);
    if (cardRef.current)
      gsap.to(cardRef.current, { y: 0, duration: 0.4, ease: "power2.inOut" });
  };
  const handleClick = () => {
    setClicked(true);
    if (cardRef.current) {
      gsap.to(cardRef.current, {
        scale: 0.96, duration: 0.12, ease: "power2.in",
        onComplete: () => {
          gsap.to(cardRef.current, { scale: 1, duration: 0.2, ease: "power2.out" });
        },
      });
    }
    setTimeout(() => onSelect(lang), 320);
  };

  const rgbMap = { "#00f7ff": "0,247,255", "#ffb347": "255,179,71", "#ff3366": "255,51,102" };
  const rgb = rgbMap[lang.accent];

  return (
    <div
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      style={{
        border: `1px solid ${hovered ? lang.accent : "#1e2535"}`,
        background: hovered ? `rgba(${rgb},0.04)` : "#0a0d14",
        padding: "clamp(20px,4vw,32px) clamp(20px,4vw,28px)",
        cursor: "none",
        position: "relative",
        overflow: "hidden",
        transition: "border-color 0.2s, background 0.2s",
      }}
    >
      {/* scan sweep on hover */}
      {hovered && (
        <div style={{
          position: "absolute", inset: 0,
          background: `linear-gradient(90deg,transparent 0%,${lang.accent}0d 50%,transparent 100%)`,
          animation: "scanSweep 0.8s ease",
          pointerEvents: "none",
        }} />
      )}

      {/* corner brackets */}
      {[["top","left"],["top","right"],["bottom","left"],["bottom","right"]].map(([v,h]) => (
        <div key={v+h} style={{
          position: "absolute", [v]: 10, [h]: 10, width: 12, height: 12,
          [`border${v.charAt(0).toUpperCase()+v.slice(1)}`]: `1px solid ${lang.accent}`,
          [`border${h.charAt(0).toUpperCase()+h.slice(1)}`]: `1px solid ${lang.accent}`,
          transition: "opacity 0.2s",
          opacity: hovered ? 1 : 0.4,
        }} />
      ))}

      <div style={{ fontSize: 9, letterSpacing: 3, color: lang.accent, marginBottom: 20, opacity: 0.7 }}>
        {lang.tag}
      </div>
      <div style={{
        fontSize: "clamp(36px,10vw,64px)", fontWeight: 700, letterSpacing: -1,
        color: hovered ? lang.accent : "#c8d8f0", lineHeight: 1, marginBottom: 8,
        transition: "color 0.2s",
        textShadow: hovered ? `0 0 30px ${lang.accent}50` : "none",
      }}>
        {lang.label}
      </div>
      <div style={{ fontSize: "clamp(10px,2vw,11px)", color: "#6b7fa3", letterSpacing: 2, marginBottom: 20 }}>
        {lang.tagline}
      </div>
      <div style={{ fontSize: "clamp(11px,2vw,12px)", color: "#8a9ab8", lineHeight: 1.7, marginBottom: 24, fontFamily: "'Fira Code',monospace" }}>
        {lang.desc}
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 28 }}>
        {lang.meta.map(m => (
          <span key={m} style={{
            fontSize: "clamp(8px,1.8vw,9px)", letterSpacing: 2, padding: "3px 10px",
            border: `1px solid ${lang.accent}30`,
            color: lang.accent, background: `${lang.accent}08`,
          }}>{m}</span>
        ))}
      </div>
      <div style={{ marginBottom: 28 }}>
        {lang.features.map(f => (
          <div key={f} style={{ fontSize: "clamp(10px,2vw,11px)", color: "#6b7fa3", marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: lang.accent, fontSize: 8 }}>▸</span>{f}
          </div>
        ))}
      </div>
      <button style={{
        width: "100%", padding: "12px",
        border: `1px solid ${lang.accent}`,
        color: lang.accent,
        fontFamily: "'Fira Code',monospace",
        fontSize: "clamp(10px,2vw,11px)", letterSpacing: 3,
        cursor: "none",
        transition: "background 0.2s, box-shadow 0.2s",
        background: hovered ? `${lang.accent}15` : "transparent",
        boxShadow: hovered ? `0 0 20px ${lang.accent}25, inset 0 0 20px ${lang.accent}08` : "none",
      }}>
        <GlitchText text="[ DECRYPT FILE ]" active={hovered} />
      </button>
    </div>
  );
}

/* ── Main Page ── */
export default function Page() {
  const router = useRouter();
  const [booted, setBooted] = useState(false);
  const [activeLanguage, setActiveLanguage] = useState(null);
  const [sectionVisible, setSectionVisible] = useState(false);
  const floatingHeadingRef = useRef(null);
  const metaBarRef = useRef(null);
  const warningRef = useRef(null);

  useEffect(() => {
    if (!booted) return;
    setTimeout(() => setSectionVisible(true), 100);
  }, [booted]);

  /* GSAP floating heading */
  useEffect(() => {
    if (floatingHeadingRef.current)
      gsap.to(floatingHeadingRef.current, { y: -10, duration: 2.2, repeat: -1, yoyo: true, ease: "sine.inOut" });
  }, []);

  /* GSAP meta bar + warning fade-in after boot */
  useEffect(() => {
    if (!sectionVisible) return;
    if (metaBarRef.current)
      gsap.from(metaBarRef.current, { opacity: 0, y: 16, duration: 0.6, ease: "power2.out", delay: 0.6 });
    if (warningRef.current)
      gsap.from(warningRef.current, { opacity: 0, x: -12, duration: 0.5, ease: "power2.out", delay: 1.1 });
  }, [sectionVisible]);

  const handleSelect = (lang) => {
    setActiveLanguage(lang.label);
    setTimeout(() => router.push(lang.route), 400);
  };

  return (
    <>
      {!booted && <BootScreen onComplete={() => setBooted(true)} />}
      <HUD activeLanguage={activeLanguage} />

      {/* scanlines overlay */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 50,
        background: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.06) 2px,rgba(0,0,0,0.06) 4px)",
      }} />
      {/* vignette */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 49,
        background: "radial-gradient(ellipse at center,transparent 60%,rgba(0,0,0,0.55) 100%)",
      }} />
      {/* grid */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        backgroundImage: `
          linear-gradient(rgba(0,247,255,0.025) 1px,transparent 1px),
          linear-gradient(90deg,rgba(0,247,255,0.025) 1px,transparent 1px)
        `,
        backgroundSize: "60px 60px",
      }} />

      <main style={{
        position: "relative", zIndex: 10,
        paddingTop: 80, minHeight: "100vh",
        opacity: sectionVisible ? 1 : 0,
        transition: "opacity 0.8s ease",
      }}>
        <section style={{ maxWidth: 1200, margin: "0 auto", padding: "60px 24px 100px" }}>
          {/* heading block */}
          <div style={{ marginBottom: 60 }}>
            <div style={{
              fontSize: "clamp(8px,2vw,10px)", letterSpacing: 4, color: "#00f7ff",
              marginBottom: 12, display: "flex", alignItems: "center", gap: 12,
            }}>
              <span style={{ display: "inline-block", width: 30, height: 1, background: "#00f7ff" }} />
              SECTION_01 // LANGUAGE SELECTION
              <span style={{ display: "inline-block", width: 30, height: 1, background: "#00f7ff" }} />
            </div>
            <h1 style={{
              fontSize: "clamp(24px,8vw,52px)", fontWeight: 700, letterSpacing: -1,
              color: "#c8d8f0", lineHeight: 1.2, marginBottom: 16,
            }}>
              CHOOSE YOUR{" "}
              <span
                ref={floatingHeadingRef}
                style={{
                  color: "#00f7ff", display: "inline-block",
                  textShadow: "0 0 12px rgba(0,247,255,0.5)", letterSpacing: "-0.5px",
                }}
              >
                TARGET LANGUAGE
              </span>
            </h1>
            <p style={{
              fontSize: "clamp(11px,2.5vw,12px)", color: "#6b7fa3",
              letterSpacing: 1, lineHeight: 1.8, maxWidth: 500,
            }}>
              Three encrypted files. Each contains the fundamentals of a programming language.
              Select one to begin decryption. Your mission starts now.
            </p>
          </div>

          {/* meta bar */}
          <div ref={metaBarRef} style={{
            display: "flex", gap: 24, marginBottom: 40, flexWrap: "wrap",
            padding: "10px 16px", border: "1px solid #1e2535", background: "#0a0d14",
            fontSize: "clamp(8px,2vw,10px)", letterSpacing: 2,
          }}>
            <span style={{ color: "#3a4558" }}>ACTIVE_CASE: <span style={{ color: "#00f7ff" }}>LANG-SELECT</span></span>
            <span style={{ color: "#3a4558" }}>FILES_FOUND: <span style={{ color: "#ffb347" }}>3</span></span>
            <span style={{ color: "#3a4558" }}>CLEARANCE: <span style={{ color: "#39ff14" }}>GRANTED</span></span>
            <span style={{ color: "#3a4558" }}>ANALYST: <span style={{ color: "#c8d8f0" }}>BEGINNER</span></span>
          </div>

          {/* cards */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
            gap: "2px",
          }}>
            {LANGUAGES.map((lang, i) => (
              <LanguageCard key={lang.id} lang={lang} index={i} onSelect={handleSelect} />
            ))}
          </div>

          {/* warning */}
          <div ref={warningRef} style={{
            marginTop: 40, display: "flex", alignItems: "center", gap: 12,
            fontSize: "clamp(8px,2vw,10px)", color: "#3a4558", letterSpacing: 2,
          }}>
            <span style={{ color: "#ff3366" }}>▲</span>
            WARNING: Once a language file is opened, full immersion begins. Proceed carefully.
          </div>
        </section>

        <footer style={{
          borderTop: "1px solid #1e2535", padding: "20px 24px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          fontSize: "clamp(8px,2vw,9px)", color: "#3a4558", letterSpacing: 2,
          maxWidth: 1200, margin: "0 auto", flexWrap: "wrap", gap: "10px",
        }}>
          <span>LANG_FILES // CASE #2026</span>
          <span>ALL FILES ENCRYPTED — AUTHORIZED PERSONNEL ONLY</span>
          <span>SYS.STABLE</span>
        </footer>
      </main>

      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;cursor:none !important}
        html{scroll-behavior:smooth}
        body{background:#060810;color:#c8d8f0;font-family:'Fira Code','Courier New',monospace;overflow-x:hidden}

        @keyframes scanSweep{from{transform:translateX(-100%)}to{transform:translateX(100%)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}

        ::selection{background:#00f7ff22;color:#00f7ff}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:#060810}
        ::-webkit-scrollbar-thumb{background:#1e2535}
        ::-webkit-scrollbar-thumb:hover{background:#00f7ff44}

        @media(max-width:768px){
          .terminal-container{width:95vw}
        }
        @media(max-width:480px){
          footer{flex-direction:column;text-align:center}
        }
      `}</style>
    </>
  );
}