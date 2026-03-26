"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";

/* ─────────────────────────────────────────
   BOOT LINES — REAL TERMINAL STYLE
───────────────────────────────────────── */
const BOOT_LINES = [
  "LANG_FILES v4.2.0 — BOOT SEQUENCE INITIATED",
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
  "Network interfaces up: lo, eth0, wlan0",
  "Pinging 8.8.8.8 ... 64 bytes from 8.8.8.8: icmp_seq=1 ttl=117 time=14.2 ms",
  "Synchronizing system clock with ntp.ubuntu.com: done",
  "Loading user environment: PATH, LD_LIBRARY_PATH",
  "Initializing VISUOSLAYER runtime:",
  "  → Setting up sandbox container: OK",
  "  → Mounting proc, sys, dev: OK",
  "  → Starting VM monitor: OK",
  "  → Language file index built: 3 entries",
  "CASE FILE LANG-01 UNLOCKED — CLEARANCE: ALPHA",
  "SELECT YOUR TARGET LANGUAGE",
];

/* ─────────────────────────────────────────
   LANGUAGE DATA (unchanged)
───────────────────────────────────────── */
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

/* ─────────────────────────────────────────
   UTILITY: typewriter hook
───────────────────────────────────────── */
function useTypewriter(text, speed = 28, start = true) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    if (!start) return;
    setDisplayed("");
    let i = 0;
    const iv = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(iv);
    }, speed);
    return () => clearInterval(iv);
  }, [text, start]);
  return displayed;
}

/* ─────────────────────────────────────────
   GLITCH TEXT component
───────────────────────────────────────── */
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

/* ─────────────────────────────────────────
   BOOT SCREEN (with shake + red error at 80% progress)
───────────────────────────────────────── */
function BootScreen({ onComplete }) {
  const [lines, setLines] = useState([]);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [shakeRed, setShakeRed] = useState(false);

  useEffect(() => {
    let lineIdx = 0;
    const addLine = () => {
      if (lineIdx >= BOOT_LINES.length) {
        setTimeout(() => setDone(true), 600);
        setTimeout(() => onComplete(), 1200);
        return;
      }
      setLines((prev) => [...prev, BOOT_LINES[lineIdx]]);
      const newProgress = Math.round(((lineIdx + 1) / BOOT_LINES.length) * 100);
      setProgress(newProgress);
      lineIdx++;
      setTimeout(addLine, 260 + Math.random() * 180);
    };
    const t = setTimeout(addLine, 400);
    return () => clearTimeout(t);
  }, []);

  // Trigger shake + red when progress >= 80
  useEffect(() => {
    if (progress >= 80 && progress < 100) {
      setShakeRed(true);
    } else {
      setShakeRed(false);
    }
  }, [progress]);

  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "#060810", zIndex: 1000,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexDirection: "column",
        opacity: done ? 0 : 1,
        transition: "opacity 0.6s ease",
        pointerEvents: done ? "none" : "all",
      }}
    >
      {/* scanlines */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.08) 2px,rgba(0,0,0,0.08) 4px)",
        zIndex: 1,
      }} />
      <div style={{ width: "min(600px,90vw)", position: "relative", zIndex: 2 }}>
        {/* header */}
        <div style={{
          borderLeft: "2px solid #00f7ff", paddingLeft: 16, marginBottom: 28,
        }}>
          <div style={{ color: "#00f7ff", fontSize: 10, letterSpacing: 4, marginBottom: 4 }}>
            TOP SECRET // CASE #2026
          </div>
          <div style={{ color: "#c8d8f0", fontSize: 22, fontFamily: "'Fira Code',monospace", fontWeight: 700, letterSpacing: 2 }}>
            LANG_FILES
          </div>
        </div>

        {/* terminal window with dynamic shake+red class */}
        <div
          className={`terminal-container ${shakeRed ? "shake-terminal terminal-red" : ""}`}
          style={{
            border: "1px solid #1e2535",
            background: "rgba(10,13,20,0.95)",
            padding: "0",
            position: "relative",
            transition: "border 0.2s, box-shadow 0.2s",
          }}
        >
          {/* title bar */}
          <div style={{
            background: "#0d1118", borderBottom: "1px solid #1e2535",
            padding: "6px 14px", display: "flex", alignItems: "center", gap: 8,
          }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#ff3366", display: "block" }} />
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#ffb347", display: "block" }} />
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#39ff14", display: "block" }} />
            <span style={{ color: "#3a4558", fontSize: 10, marginLeft: 8, letterSpacing: 2 }}>
              TERMINAL — BOOT_SEQUENCE.sh
            </span>
          </div>
          {/* lines */}
          <div style={{ padding: "20px 20px 16px", minHeight: 220, fontFamily: "'Fira Code',monospace", fontSize: 12 }}>
            {lines.filter(Boolean).map((l, i) => (
              <div key={i} style={{
                display: "flex", gap: 10, marginBottom: 6,
                color: l.includes("✓") ? "#39ff14" : l.includes("SELECT") ? "#ffb347" : "#c8d8f0",
                animation: "fadeIn 0.2s ease",
              }}>
                <span style={{ color: "#00f7ff", userSelect: "none" }}>$</span>
                <span>{l}</span>
              </div>
            ))}
            <span style={{
              display: "inline-block", width: 8, height: 14,
              background: "#00f7ff", animation: "blink 1s step-end infinite",
              verticalAlign: "middle",
            }} />
          </div>
          {/* progress bar */}
          <div style={{ borderTop: "1px solid #1e2535", padding: "10px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 10, color: "#3a4558", letterSpacing: 2 }}>
              <span>LOADING</span><span>{progress}%</span>
            </div>
            <div style={{ height: 2, background: "#1e2535", width: "100%" }}>
              <div style={{
                height: "100%", background: shakeRed ? "#ff3366" : "#00f7ff",
                width: `${progress}%`, transition: "width 0.3s ease, background 0.2s",
                boxShadow: shakeRed ? "0 0 8px #ff3366" : "0 0 8px #00f7ff",
              }} />
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
        
        /* SHAKE animation for terminal */
        @keyframes shakeTerminal {
          0% { transform: translate(1px, 1px) rotate(0deg); }
          10% { transform: translate(-1px, -2px) rotate(-0.5deg); }
          20% { transform: translate(-2px, 0px) rotate(0.5deg); }
          30% { transform: translate(2px, 1px) rotate(0deg); }
          40% { transform: translate(1px, -1px) rotate(0.5deg); }
          50% { transform: translate(-1px, 2px) rotate(-0.5deg); }
          60% { transform: translate(-2px, 1px) rotate(0deg); }
          70% { transform: translate(2px, 1px) rotate(-0.5deg); }
          80% { transform: translate(-1px, -1px) rotate(0.5deg); }
          90% { transform: translate(1px, 2px) rotate(0deg); }
          100% { transform: translate(1px, -2px) rotate(-0.5deg); }
        }
        .shake-terminal {
          animation: shakeTerminal 0.15s infinite;
        }
        .terminal-red {
          border: 1px solid #ff3366 !important;
          box-shadow: 0 0 20px rgba(255,51,102,0.4);
        }
      `}</style>
    </div>
  );
}

/* ─────────────────────────────────────────
   HUD (unchanged)
───────────────────────────────────────── */
function HUD({ activeLanguage }) {
  const [time, setTime] = useState("00:00:00");
  useEffect(() => {
    const iv = setInterval(() => {
      const n = new Date();
      setTime([n.getHours(), n.getMinutes(), n.getSeconds()].map(x => String(x).padStart(2, "0")).join(":"));
    }, 1000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div style={{
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

/* ─────────────────────────────────────────
   LANGUAGE CARD (unchanged)
───────────────────────────────────────── */
function LanguageCard({ lang, onSelect, index }) {
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);

  const handleClick = () => {
    setClicked(true);
    setTimeout(() => onSelect(lang), 300);
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleClick}
      style={{
        border: `1px solid ${hovered ? lang.accent : "#1e2535"}`,
        background: hovered ? `rgba(${lang.accent === "#00f7ff" ? "0,247,255" : lang.accent === "#ffb347" ? "255,179,71" : "255,51,102"},0.04)` : "#0a0d14",
        padding: "32px 28px",
        cursor: "none",
        position: "relative",
        overflow: "hidden",
        transition: "border-color 0.2s, background 0.2s, transform 0.2s",
        transform: clicked ? "scale(0.97)" : hovered ? "scale(1.01)" : "scale(1)",
        animationDelay: `${index * 0.12}s`,
        animation: "cardReveal 0.6s ease both",
      }}
    >
      {/* scan sweep on hover */}
      {hovered && (
        <div style={{
          position: "absolute", inset: 0,
          background: `linear-gradient(90deg,transparent 0%,${lang.accent}0a 50%,transparent 100%)`,
          animation: "scanSweep 0.8s ease",
          pointerEvents: "none",
        }} />
      )}

      {/* corner brackets */}
      <div style={{ position: "absolute", top: 10, left: 10, width: 12, height: 12, borderTop: `1px solid ${lang.accent}`, borderLeft: `1px solid ${lang.accent}` }} />
      <div style={{ position: "absolute", top: 10, right: 10, width: 12, height: 12, borderTop: `1px solid ${lang.accent}`, borderRight: `1px solid ${lang.accent}` }} />
      <div style={{ position: "absolute", bottom: 10, left: 10, width: 12, height: 12, borderBottom: `1px solid ${lang.accent}`, borderLeft: `1px solid ${lang.accent}` }} />
      <div style={{ position: "absolute", bottom: 10, right: 10, width: 12, height: 12, borderBottom: `1px solid ${lang.accent}`, borderRight: `1px solid ${lang.accent}` }} />

      {/* tag */}
      <div style={{ fontSize: 9, letterSpacing: 3, color: lang.accent, marginBottom: 20, opacity: 0.7 }}>
        {lang.tag}
      </div>

      {/* big label */}
      <div style={{
        fontSize: "clamp(42px,7vw,64px)",
        fontWeight: 700,
        letterSpacing: -1,
        color: hovered ? lang.accent : "#c8d8f0",
        lineHeight: 1,
        marginBottom: 8,
        transition: "color 0.2s",
        textShadow: hovered ? `0 0 30px ${lang.accent}40` : "none",
      }}>
        {lang.label}
      </div>

      {/* tagline */}
      <div style={{ fontSize: 11, color: "#6b7fa3", letterSpacing: 2, marginBottom: 20 }}>
        {lang.tagline}
      </div>

      {/* desc */}
      <div style={{ fontSize: 12, color: "#8a9ab8", lineHeight: 1.7, marginBottom: 24, fontFamily: "'Fira Code',monospace" }}>
        {lang.desc}
      </div>

      {/* meta pills */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 28 }}>
        {lang.meta.map((m) => (
          <span key={m} style={{
            fontSize: 9, letterSpacing: 2, padding: "3px 10px",
            border: `1px solid ${lang.accent}30`,
            color: lang.accent, background: `${lang.accent}08`,
          }}>{m}</span>
        ))}
      </div>

      {/* features */}
      <div style={{ marginBottom: 28 }}>
        {lang.features.map((f) => (
          <div key={f} style={{
            fontSize: 11, color: "#6b7fa3", marginBottom: 6,
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <span style={{ color: lang.accent, fontSize: 8 }}>▸</span>
            {f}
          </div>
        ))}
      </div>

      {/* SELECT button */}
      <button
        style={{
          width: "100%", padding: "12px",
          border: `1px solid ${lang.accent}`,
          color: lang.accent,
          fontFamily: "'Fira Code',monospace",
          fontSize: 11, letterSpacing: 3,
          cursor: "none",
          transition: "background 0.2s, box-shadow 0.2s",
          background: hovered ? `${lang.accent}15` : "transparent",
          boxShadow: hovered ? `0 0 20px ${lang.accent}20, inset 0 0 20px ${lang.accent}08` : "none",
        }}
      >
        <GlitchText text="[ DECRYPT FILE ]" active={hovered} />
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────
   MAIN PAGE (with GSAP floating heading)
───────────────────────────────────────── */
export default function Page() {
  const router = useRouter();
  const [booted, setBooted] = useState(false);
  const [activeLanguage, setActiveLanguage] = useState(null);
  const [sectionVisible, setSectionVisible] = useState(false);
  const mainRef = useRef(null);
  const floatingHeadingRef = useRef(null);

  useEffect(() => {
    if (booted) {
      setTimeout(() => setSectionVisible(true), 100);
    }
  }, [booted]);

  // GSAP floating animation for heading span
  useEffect(() => {
    if (floatingHeadingRef.current) {
      gsap.to(floatingHeadingRef.current, {
        y: -8,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: 0,
      });
    }
  }, []);

  const handleSelect = (lang) => {
    setActiveLanguage(lang.label);
    setTimeout(() => router.push(lang.route), 400);
  };

  return (
    <>
      {/* Boot Screen */}
      {!booted && <BootScreen onComplete={() => setBooted(true)} />}

      {/* HUD */}
      <HUD activeLanguage={activeLanguage} />

      {/* Scanlines overlay */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 50,
        background: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.06) 2px,rgba(0,0,0,0.06) 4px)",
      }} />

      {/* Vignette */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 49,
        background: "radial-gradient(ellipse at center,transparent 60%,rgba(0,0,0,0.55) 100%)",
      }} />

      {/* Grid background */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        backgroundImage: `
          linear-gradient(rgba(0,247,255,0.025) 1px,transparent 1px),
          linear-gradient(90deg,rgba(0,247,255,0.025) 1px,transparent 1px)
        `,
        backgroundSize: "60px 60px",
      }} />

      {/* MAIN */}
      <main
        ref={mainRef}
        style={{
          position: "relative", zIndex: 10,
          paddingTop: 80,
          minHeight: "100vh",
          opacity: sectionVisible ? 1 : 0,
          transition: "opacity 0.8s ease",
        }}
      >
        {/* ── SECTION 1 — CHOOSE LANGUAGE ── */}
        <section style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "60px 24px 100px",
        }}>
          {/* Section header */}
          <div style={{ marginBottom: 60 }}>
            <div style={{
              fontSize: 10, letterSpacing: 4, color: "#00f7ff",
              marginBottom: 12, display: "flex", alignItems: "center", gap: 12,
            }}>
              <span style={{ display: "inline-block", width: 30, height: 1, background: "#00f7ff" }} />
              SECTION_01 // LANGUAGE SELECTION
              <span style={{ display: "inline-block", width: 30, height: 1, background: "#00f7ff" }} />
            </div>

            {/* Single line heading with floating GSAP animation */}
            <h1 style={{
              fontSize: "clamp(28px,5vw,52px)",
              fontWeight: 700,
              letterSpacing: -1,
              color: "#c8d8f0",
              lineHeight: 1.2,
              marginBottom: 16,
            }}>
              CHOOSE YOUR{" "}
              <span
                ref={floatingHeadingRef}
                style={{
                  color: "#00f7ff",
                  display: "inline-block",
                  textShadow: "0 0 12px rgba(0,247,255,0.5)",
                  letterSpacing: "-0.5px",
                }}
              >
                TARGET LANGUAGE
              </span>
            </h1>

            <p style={{
              fontSize: 12, color: "#6b7fa3", letterSpacing: 1, lineHeight: 1.8,
              maxWidth: 500,
            }}>
              Three encrypted files. Each contains the fundamentals of a programming language.
              Select one to begin decryption. Your mission starts now.
            </p>
          </div>

          {/* Status bar */}
          <div style={{
            display: "flex", gap: 24, marginBottom: 40, flexWrap: "wrap",
            padding: "10px 16px",
            border: "1px solid #1e2535",
            background: "#0a0d14",
            fontSize: 10, letterSpacing: 2,
          }}>
            <span style={{ color: "#3a4558" }}>ACTIVE_CASE: <span style={{ color: "#00f7ff" }}>LANG-SELECT</span></span>
            <span style={{ color: "#3a4558" }}>FILES_FOUND: <span style={{ color: "#ffb347" }}>3</span></span>
            <span style={{ color: "#3a4558" }}>CLEARANCE: <span style={{ color: "#39ff14" }}>GRANTED</span></span>
            <span style={{ color: "#3a4558" }}>ANALYST: <span style={{ color: "#c8d8f0" }}>BEGINNER</span></span>
          </div>

          {/* Cards grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
            gap: 2,
          }}>
            {LANGUAGES.map((lang, i) => (
              <LanguageCard
                key={lang.id}
                lang={lang}
                index={i}
                onSelect={handleSelect}
              />
            ))}
          </div>

          {/* Bottom note */}
          <div style={{
            marginTop: 40, display: "flex", alignItems: "center", gap: 12,
            fontSize: 10, color: "#3a4558", letterSpacing: 2,
          }}>
            <span style={{ color: "#ff3366" }}>▲</span>
            WARNING: Once a language file is opened, full immersion begins. Proceed carefully.
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer style={{
          borderTop: "1px solid #1e2535",
          padding: "20px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 9,
          color: "#3a4558",
          letterSpacing: 2,
          maxWidth: 1200,
          margin: "0 auto",
        }}>
          <span>LANG_FILES // CASE #2026</span>
          <span>ALL FILES ENCRYPTED — AUTHORIZED PERSONNEL ONLY</span>
          <span>SYS.STABLE</span>
        </footer>
      </main>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; cursor: none !important; }
        html { scroll-behavior: smooth; }
        body {
          background: #060810;
          color: #c8d8f0;
          font-family: 'Fira Code', 'Courier New', monospace;
          overflow-x: hidden;
        }

        @keyframes cardReveal {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes scanSweep {
          from { transform: translateX(-100%); }
          to   { transform: translateX(100%); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }

        ::selection {
          background: #00f7ff22;
          color: #00f7ff;
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #060810; }
        ::-webkit-scrollbar-thumb { background: #1e2535; }
        ::-webkit-scrollbar-thumb:hover { background: #00f7ff44; }
      `}</style>
    </>
  );
}