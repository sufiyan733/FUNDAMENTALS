"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

/* ────────────────────────────────────────────────────────────────
   BOOT LINES & UTILITIES
──────────────────────────────────────────────────────────────── */
const BOOT_LINES = [
  "INITIALIZING LEARNING PROTOCOL...",
  "DECRYPTING LANGUAGE FILES...",
  "LOADING MODULE: C ████████████ OK",
  "LOADING MODULE: PYTHON ██████████ OK",
  "LOADING MODULE: JAVA █████████████ OK",
  "SIGNAL STRENGTH: 99% — STABLE",
  "CASE FILE: LANG-01 UNLOCKED",
  "SELECT YOUR TARGET LANGUAGE",
];

const GLITCH_CHARS = "!<>-_\\/[]{}—=+*^?#@$%&";
const randomChar = () => GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];

// Character-level glitch & typewriter
function typewriterWithGlitch(text, onChar, speed = 30) {
  let i = 0;
  const interval = setInterval(() => {
    if (i < text.length) {
      // Random glitch flickers per character
      const glitched = text.split('').map((ch, idx) => {
        if (idx === i && Math.random() > 0.7) return randomChar();
        if (idx < i) return text[idx];
        if (idx === i) return text[idx];
        return randomChar();
      }).join('');
      onChar(glitched, i);
      i++;
    } else {
      clearInterval(interval);
      onChar(text, text.length);
    }
  }, speed);
  return () => clearInterval(interval);
}

/* ────────────────────────────────────────────────────────────────
   BOOT SCREEN UPGRADE
──────────────────────────────────────────────────────────────── */
function BootScreen({ onComplete }) {
  const containerRef = useRef(null);
  const terminalRef = useRef(null);
  const progressBarRef = useRef(null);
  const [lines, setLines] = useState([]);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let lineIdx = 0;
    let currentLineCleanup = null;
    let progressTween = null;

    const addLine = () => {
      if (lineIdx >= BOOT_LINES.length) {
        // Progress bar overshoot + elastic easing
        if (progressBarRef.current) {
          progressTween = gsap.to(progressBarRef.current, {
            width: "100%",
            duration: 0.8,
            ease: "elastic.out(1, 0.3)",
            overwrite: true,
            onComplete: () => {
              gsap.to(progressBarRef.current, {
                width: "102%",
                duration: 0.2,
                repeat: 1,
                yoyo: true,
                ease: "power2.out",
              });
            }
          });
        }
        setTimeout(() => {
          setDone(true);
          // Exit transition: distort and collapse with clip-path
          gsap.to(containerRef.current, {
            duration: 0.8,
            scale: 1.2,
            skewX: 15,
            filter: "blur(12px)",
            clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
            ease: "power3.inOut",
            onComplete: () => {
              onComplete();
            }
          });
        }, 400);
        return;
      }

      const currentText = BOOT_LINES[lineIdx];
      // Character-level typewriter with glitch flickers
      let displayedChars = "";
      const cleanup = typewriterWithGlitch(currentText, (glitched, index) => {
        displayedChars = glitched;
        setLines(prev => {
          const updated = [...prev];
          if (updated[lineIdx]) updated[lineIdx] = glitched;
          else updated.push(glitched);
          return updated;
        });
        if (index === currentText.length - 1) {
          // slight screen shake on initialization lines
          if (currentText.includes("INITIALIZING") || currentText.includes("DECRYPTING")) {
            gsap.to(terminalRef.current, {
              duration: 0.08,
              x: "random(-4,4)",
              y: "random(-2,2)",
              repeat: 4,
              yoyo: true,
              ease: "none",
            });
          }
        }
      }, 28);
      currentLineCleanup = cleanup;

      // Update progress with elastic easing
      const newProgress = Math.round(((lineIdx + 1) / BOOT_LINES.length) * 100);
      setProgress(newProgress);
      if (progressBarRef.current) {
        gsap.to(progressBarRef.current, {
          width: `${newProgress}%`,
          duration: 0.5,
          ease: "back.out(0.8)",
          overwrite: true,
        });
      }

      lineIdx++;
      setTimeout(addLine, 280 + Math.random() * 120);
    };

    // Screen flicker + skew at start
    gsap.to(containerRef.current, {
      duration: 0.1,
      opacity: 0.8,
      skewX: 2,
      repeat: 3,
      yoyo: true,
      ease: "none",
      delay: 0.2,
    });

    const timer = setTimeout(addLine, 200);
    return () => {
      clearTimeout(timer);
      if (currentLineCleanup) currentLineCleanup();
      if (progressTween) progressTween.kill();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed", inset: 0, background: "#060810", zIndex: 1000,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexDirection: "column",
        pointerEvents: done ? "none" : "all",
        willChange: "transform, filter, clip-path",
      }}
    >
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.08) 2px,rgba(0,0,0,0.08) 4px)",
        zIndex: 1,
      }} />
      <div ref={terminalRef} style={{ width: "min(600px,90vw)", position: "relative", zIndex: 2 }}>
        <div style={{
          borderLeft: "2px solid #00f7ff", paddingLeft: 16, marginBottom: 28,
        }}>
          <div style={{ color: "#00f7ff", fontSize: 10, letterSpacing: 4, marginBottom: 4 }}>
            TOP SECRET // CASE #2026
          </div>
          <div style={{ color: "#c8d8f0", fontSize: 22, fontFamily: "'Fira Code',monospace", fontWeight: 700, letterSpacing: 2 }}>
            LANG_FILES // VISUOSLAYER
          </div>
        </div>

        <div style={{
          border: "1px solid #1e2535",
          background: "rgba(10,13,20,0.95)",
          padding: "0",
          position: "relative",
        }}>
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
          <div style={{ padding: "20px 20px 16px", minHeight: 220, fontFamily: "'Fira Code',monospace", fontSize: 12 }}>
            {lines.map((l, i) => (
              <div key={i} style={{
                display: "flex", gap: 10, marginBottom: 6,
                color: l.includes("OK") ? "#39ff14" : l.includes("SELECT") ? "#ffb347" : "#c8d8f0",
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
          <div style={{ borderTop: "1px solid #1e2535", padding: "10px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 10, color: "#3a4558", letterSpacing: 2 }}>
              <span>LOADING</span><span>{progress}%</span>
            </div>
            <div style={{ height: 2, background: "#1e2535", width: "100%" }}>
              <div ref={progressBarRef} style={{
                height: "100%", background: "#00f7ff", width: "0%",
                boxShadow: "0 0 8px #00f7ff",
                willChange: "width",
              }} />
            </div>
          </div>
        </div>

        <div style={{
          display: "flex", justifyContent: "space-between",
          marginTop: 12, fontSize: 9, color: "#3a4558", letterSpacing: 2,
        }}>
          <span>CAM_04 [●REC]</span>
          <span>FREQ: 12.4 Hz</span>
          <span>SIGNAL: STABLE</span>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────
   CUSTOM CURSOR (dot + ring)
──────────────────────────────────────────────────────────────── */
function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    const onMouseMove = (e) => {
      gsap.to(dotRef.current, {
        duration: 0.1,
        x: e.clientX,
        y: e.clientY,
        overwrite: true,
      });
      gsap.to(ringRef.current, {
        duration: 0.2,
        x: e.clientX,
        y: e.clientY,
        overwrite: true,
      });
    };
    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, []);

  return (
    <>
      <div
        ref={dotRef}
        style={{
          position: "fixed",
          width: 4, height: 4,
          background: "#00f7ff",
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 9999,
          top: -2, left: -2,
          willChange: "transform",
        }}
      />
      <div
        ref={ringRef}
        style={{
          position: "fixed",
          width: 28, height: 28,
          border: "1px solid #00f7ff",
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 9998,
          top: -14, left: -14,
          willChange: "transform",
          transition: "width 0.2s, height 0.2s, border-color 0.2s",
        }}
      />
    </>
  );
}

/* ────────────────────────────────────────────────────────────────
   HUD with flickering values and parallax
──────────────────────────────────────────────────────────────── */
function HUD({ activeLanguage }) {
  const [time, setTime] = useState("00:00:00");
  const [signalFlicker, setSignalFlicker] = useState("99%");
  const containerRef = useRef(null);

  useEffect(() => {
    const iv = setInterval(() => {
      const n = new Date();
      setTime([n.getHours(), n.getMinutes(), n.getSeconds()].map(x => String(x).padStart(2, "0")).join(":"));
    }, 1000);
    return () => clearInterval(iv);
  }, []);

  // Random flickering for signal %
  useEffect(() => {
    const flicker = setInterval(() => {
      if (Math.random() > 0.7) {
        setSignalFlicker(Math.floor(95 + Math.random() * 5) + "%");
        setTimeout(() => setSignalFlicker("99%"), 100);
      } else {
        setSignalFlicker("99%");
      }
    }, 800);
    return () => clearInterval(flicker);
  }, []);

  // subtle floating/parallax on scroll
  useEffect(() => {
    ScrollTrigger.create({
      trigger: "body",
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        gsap.to(containerRef.current, {
          y: self.progress * 8,
          duration: 0.1,
          overwrite: true,
        });
      },
    });
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "10px 24px",
        background: "rgba(6,8,16,0.92)",
        borderBottom: "1px solid #1e2535",
        backdropFilter: "blur(10px)",
        fontFamily: "'Fira Code',monospace",
        fontSize: 10, letterSpacing: 2,
        willChange: "transform",
      }}
    >
      <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
        <span style={{ color: "#00f7ff" }}>VISUOSLAYER</span>
        <span style={{ color: "#3a4558" }}>|</span>
        <span style={{ color: "#6b7fa3" }}>CASE FILE: <span style={{ color: "#00f7ff" }}>LANG-01</span></span>
      </div>
      <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
        {activeLanguage && (
          <span style={{ color: "#ffb347" }}>
            TARGET: <span style={{ color: "#ff3366" }}>{activeLanguage}</span>
          </span>
        )}
        <span style={{ color: "#3a4558" }}>SIGNAL: <span style={{ color: "#39ff14" }}>{signalFlicker}</span></span>
        <span style={{ color: "#ff3366" }}>● REC</span>
        <span style={{ color: "#3a4558" }}>{time}</span>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────
   LANGUAGE CARD with Magnetic, 3D Tilt, Glitch & Scan Line
──────────────────────────────────────────────────────────────── */
function LanguageCard({ lang, onSelect, index }) {
  const cardRef = useRef(null);
  const scanRef = useRef(null);
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Magnetic effect: move toward cursor
  const handleMouseMove = useCallback((e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setMousePos({ x, y });
    // magnetic pull
    gsap.to(cardRef.current, {
      x: x * 0.15,
      y: y * 0.15,
      duration: 0.4,
      ease: "power2.out",
      overwrite: true,
    });
  }, []);

  const handleMouseLeave = () => {
    setHovered(false);
    gsap.to(cardRef.current, {
      x: 0, y: 0, rotationX: 0, rotationY: 0,
      duration: 0.6,
      ease: "elastic.out(1, 0.5)",
      overwrite: true,
    });
  };

  // 3D tilt based on mouse position
  useEffect(() => {
    if (!hovered) return;
    const rotateY = (mousePos.x / (cardRef.current?.offsetWidth || 200)) * 20;
    const rotateX = -(mousePos.y / (cardRef.current?.offsetHeight || 300)) * 20;
    gsap.to(cardRef.current, {
      rotationY: rotateY,
      rotationX: rotateX,
      duration: 0.3,
      overwrite: true,
      ease: "power2.out",
    });
  }, [mousePos, hovered]);

  const handleClick = () => {
    setClicked(true);
    // Animate selected card scaling and centering
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const centerX = window.innerWidth / 2 - rect.width / 2;
    const centerY = window.innerHeight / 2 - rect.height / 2;

    const tl = gsap.timeline({
      onComplete: () => onSelect(lang),
    });
    tl.to(card, {
      scale: 1.2,
      x: centerX - rect.left,
      y: centerY - rect.top,
      duration: 0.6,
      ease: "back.inOut(1.2)",
      zIndex: 1000,
    })
    .to("body", {
      backdropFilter: "blur(8px) brightness(0.7)",
      duration: 0.4,
      overwrite: true,
    }, "<")
    .to(".page-container", {
      clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
      duration: 0.8,
      ease: "power3.inOut",
    }, "<+=0.2");
  };

  // Animated scan line on hover (gradient + clip-path)
  useEffect(() => {
    if (!hovered || !scanRef.current) return;
    const tl = gsap.fromTo(scanRef.current,
      { clipPath: "inset(0% 0% 100% 0%)" },
      { clipPath: "inset(0% 0% 0% 0%)", duration: 0.8, repeat: 1, yoyo: true, ease: "power2.out" }
    );
    return () => tl.kill();
  }, [hovered]);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      style={{
        border: `1px solid ${hovered ? lang.accent : "#1e2535"}`,
        background: hovered ? `rgba(${lang.accent === "#00f7ff" ? "0,247,255" : lang.accent === "#ffb347" ? "255,179,71" : "255,51,102"},0.04)` : "#0a0d14",
        padding: "32px 28px",
        cursor: "none",
        position: "relative",
        overflow: "hidden",
        transition: "border-color 0.2s, background 0.2s",
        transformStyle: "preserve-3d",
        willChange: "transform",
        transform: clicked ? "scale(0.97)" : "scale(1)",
        animationDelay: `${index * 0.12}s`,
        animation: "cardReveal 0.6s ease both",
      }}
    >
      {/* Scan line overlay */}
      <div
        ref={scanRef}
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(90deg, transparent, ${lang.accent}40, transparent)`,
          pointerEvents: "none",
          clipPath: "inset(0% 0% 100% 0%)",
          willChange: "clip-path",
        }}
      />

      {/* Glitch flicker layer on hover */}
      {hovered && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `repeating-linear-gradient(45deg, ${lang.accent}10, ${lang.accent}10 2px, transparent 2px, transparent 8px)`,
            pointerEvents: "none",
            mixBlendMode: "overlay",
            animation: "glitchFlicker 0.08s infinite",
          }}
        />
      )}

      <div style={{ position: "absolute", top: 10, left: 10, width: 12, height: 12, borderTop: `1px solid ${lang.accent}`, borderLeft: `1px solid ${lang.accent}` }} />
      <div style={{ position: "absolute", top: 10, right: 10, width: 12, height: 12, borderTop: `1px solid ${lang.accent}`, borderRight: `1px solid ${lang.accent}` }} />
      <div style={{ position: "absolute", bottom: 10, left: 10, width: 12, height: 12, borderBottom: `1px solid ${lang.accent}`, borderLeft: `1px solid ${lang.accent}` }} />
      <div style={{ position: "absolute", bottom: 10, right: 10, width: 12, height: 12, borderBottom: `1px solid ${lang.accent}`, borderRight: `1px solid ${lang.accent}` }} />

      <div style={{ fontSize: 9, letterSpacing: 3, color: lang.accent, marginBottom: 20, opacity: 0.7 }}>
        {lang.tag}
      </div>

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

      <div style={{ fontSize: 11, color: "#6b7fa3", letterSpacing: 2, marginBottom: 20 }}>
        {lang.tagline}
      </div>

      <div style={{ fontSize: 12, color: "#8a9ab8", lineHeight: 1.7, marginBottom: 24, fontFamily: "'Fira Code',monospace" }}>
        {lang.desc}
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 28 }}>
        {lang.meta.map((m) => (
          <span key={m} style={{
            fontSize: 9, letterSpacing: 2, padding: "3px 10px",
            border: `1px solid ${lang.accent}30`,
            color: lang.accent, background: `${lang.accent}08`,
          }}>{m}</span>
        ))}
      </div>

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
        <ScrambleText text="[ DECRYPT FILE ]" active={hovered} />
      </button>
    </div>
  );
}

// Scrambled text button effect
function ScrambleText({ text, active }) {
  const [display, setDisplay] = useState(text);
  useEffect(() => {
    if (!active) { setDisplay(text); return; }
    let iterations = 0;
    const interval = setInterval(() => {
      setDisplay(
        text.split("").map((char, i) => {
          if (i < iterations) return text[i];
          return randomChar();
        }).join("")
      );
      iterations += 1 / 3;
      if (iterations >= text.length) {
        setDisplay(text);
        clearInterval(interval);
      }
    }, 35);
    return () => clearInterval(interval);
  }, [active, text]);
  return <span>{display}</span>;
}

/* ────────────────────────────────────────────────────────────────
   MAIN PAGE with LENIS + GSAP SYNC, SCROLLTRIGGER, PARALLAX
──────────────────────────────────────────────────────────────── */
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

export default function Page() {
  const router = useRouter();
  const [booted, setBooted] = useState(false);
  const [activeLanguage, setActiveLanguage] = useState(null);
  const [sectionVisible, setSectionVisible] = useState(false);
  const mainRef = useRef(null);
  const headingRef = useRef(null);
  const gridLayersRef = useRef({ far: null, mid: null, near: null });
  const containerRef = useRef(null);

  // Setup Lenis + GSAP sync
  useEffect(() => {
    if (!booted) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    function raf(time) {
      lenis.raf(time);
      ScrollTrigger.update();
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Sync ScrollTrigger with Lenis
    ScrollTrigger.scrollerProxy(document.body, {
      scrollTop(value) {
        if (arguments.length) {
          lenis.scrollTo(value, { immediate: true });
        }
        return lenis.scroll;
      },
      getBoundingClientRect() {
        return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
      },
      pinType: document.body.style.transform ? "transform" : "fixed",
    });

    ScrollTrigger.addEventListener("refresh", () => lenis.resize());
    ScrollTrigger.refresh();

    return () => {
      lenis.destroy();
      ScrollTrigger.killAll();
    };
  }, [booted]);

  // Hero text split into characters + idle floating + scroll parallax
  useEffect(() => {
    if (!booted || !headingRef.current) return;
    const heading = headingRef.current;
    const text = heading.innerText;
    const chars = text.split("").map(ch => ch === " " ? "\u00A0" : ch);
    heading.innerHTML = "";
    const spans = chars.map((ch, i) => {
      const span = document.createElement("span");
      span.innerText = ch;
      span.style.display = "inline-block";
      span.style.willChange = "transform";
      heading.appendChild(span);
      return span;
    });

    // Idle floating animation
    gsap.to(spans, {
      y: "random(-6, 6)",
      x: "random(-2, 2)",
      duration: 3,
      repeat: -1,
      yoyo: true,
      stagger: 0.03,
      ease: "sine.inOut",
    });

    // Scroll-driven parallax per character
    ScrollTrigger.create({
      trigger: heading,
      start: "top bottom",
      end: "bottom top",
      scrub: 1.5,
      onUpdate: (self) => {
        spans.forEach((span, idx) => {
          const speed = 0.5 + (idx % 5) * 0.2;
          gsap.set(span, { y: self.progress * 40 * speed });
        });
      },
    });
  }, [booted]);

  // Multi-layer parallax grid
  useEffect(() => {
    if (!booted) return;
    const far = gridLayersRef.current.far;
    const mid = gridLayersRef.current.mid;
    const near = gridLayersRef.current.near;
    if (!far || !mid || !near) return;

    ScrollTrigger.create({
      trigger: "body",
      start: "top top",
      end: "bottom bottom",
      scrub: 1,
      onUpdate: (self) => {
        gsap.set(far, { y: self.progress * 80 });
        gsap.set(mid, { y: self.progress * 40 });
        gsap.set(near, { y: self.progress * 20 });
      },
    });
  }, [booted]);

  // Mouse perspective tilt on container
  useEffect(() => {
    if (!booted) return;
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      gsap.to(containerRef.current, {
        rotationY: x * 3,
        rotationX: -y * 2,
        duration: 0.6,
        ease: "power2.out",
        overwrite: true,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [booted]);

  // Alive effects: breathing, scanlines, noise flicker
  useEffect(() => {
    if (!booted) return;
    // Subtle breathing scale loop
    gsap.to(containerRef.current, {
      scale: 1.002,
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
    // Random UI flickers
    const flickerInterval = setInterval(() => {
      if (Math.random() > 0.85) {
        gsap.to(".hud-value", { opacity: 0.7, duration: 0.05, yoyo: true, repeat: 1 });
      }
    }, 400);
    return () => clearInterval(flickerInterval);
  }, [booted]);

  const handleSelect = (lang) => {
    setActiveLanguage(lang.label);
    setTimeout(() => router.push(lang.route), 800);
  };

  useEffect(() => {
    if (booted) {
      setSectionVisible(true);
      ScrollTrigger.refresh();
    }
  }, [booted]);

  return (
    <>
      {!booted && <BootScreen onComplete={() => setBooted(true)} />}
      {booted && <CustomCursor />}
      {booted && <HUD activeLanguage={activeLanguage} />}

      {/* Multi-layer grid backgrounds */}
      <div
        ref={(el) => (gridLayersRef.current.far = el)}
        style={{
          position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
          backgroundImage: `linear-gradient(rgba(0,247,255,0.012) 1px,transparent 1px),
                            linear-gradient(90deg,rgba(0,247,255,0.012) 1px,transparent 1px)`,
          backgroundSize: "80px 80px",
          willChange: "transform",
        }}
      />
      <div
        ref={(el) => (gridLayersRef.current.mid = el)}
        style={{
          position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
          backgroundImage: `linear-gradient(rgba(0,247,255,0.025) 1px,transparent 1px),
                            linear-gradient(90deg,rgba(0,247,255,0.025) 1px,transparent 1px)`,
          backgroundSize: "60px 60px",
          willChange: "transform",
        }}
      />
      <div
        ref={(el) => (gridLayersRef.current.near = el)}
        style={{
          position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
          backgroundImage: `linear-gradient(rgba(0,247,255,0.04) 1px,transparent 1px),
                            linear-gradient(90deg,rgba(0,247,255,0.04) 1px,transparent 1px)`,
          backgroundSize: "40px 40px",
          willChange: "transform",
        }}
      />

      {/* Scanlines overlay alive */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 50,
        background: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.06) 2px,rgba(0,0,0,0.06) 4px)",
        animation: "moveScanlines 10s linear infinite",
      }} />

      {/* Grain/noise flicker */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 51,
        background: "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJmIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjciIG51bU9jdGF2ZXM9IjMiLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWx0ZXI9InVybCgjZikiIG9wYWNpdHk9IjAuMDYiLz48L3N2Zz4=') repeat",
        opacity: 0.06,
        mixBlendMode: "overlay",
        pointerEvents: "none",
      }} />

      <div
        ref={containerRef}
        className="page-container"
        style={{
          position: "relative", zIndex: 10,
          paddingTop: 80,
          minHeight: "100vh",
          opacity: sectionVisible ? 1 : 0,
          transition: "opacity 0.8s ease",
          willChange: "transform",
          transformStyle: "preserve-3d",
        }}
      >
        <main ref={mainRef}>
          <section style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "60px 24px 100px",
          }}>
            <div style={{ marginBottom: 60 }}>
              <div style={{
                fontSize: 10, letterSpacing: 4, color: "#00f7ff",
                marginBottom: 12, display: "flex", alignItems: "center", gap: 12,
              }}>
                <span style={{ display: "inline-block", width: 30, height: 1, background: "#00f7ff" }} />
                SECTION_01 // LANGUAGE SELECTION
                <span style={{ display: "inline-block", width: 30, height: 1, background: "#00f7ff" }} />
              </div>

              <h1
                ref={headingRef}
                style={{
                  fontSize: "clamp(28px,5vw,52px)",
                  fontWeight: 700,
                  letterSpacing: -1,
                  color: "#c8d8f0",
                  lineHeight: 1.1,
                  marginBottom: 16,
                }}
              >
                CHOOSE YOUR<br />
                <span style={{ color: "#00f7ff" }}>TARGET LANGUAGE</span>
              </h1>

              <p style={{
                fontSize: 12, color: "#6b7fa3", letterSpacing: 1, lineHeight: 1.8,
                maxWidth: 500,
              }}>
                Three encrypted files. Each contains the fundamentals of a programming language.
                Select one to begin decryption. Your mission starts now.
              </p>
            </div>

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
              <span style={{ color: "#3a4558" }}>ANALYST: <span style={{ color: "#c8d8f0" }}>SAIF</span></span>
            </div>

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

            <div style={{
              marginTop: 40, display: "flex", alignItems: "center", gap: 12,
              fontSize: 10, color: "#3a4558", letterSpacing: 2,
            }}>
              <span style={{ color: "#ff3366" }}>▲</span>
              WARNING: Once a language file is opened, full immersion begins. Proceed carefully.
            </div>
          </section>

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
            <span>VISUOSLAYER // CASE #2026 // SAIF</span>
            <span>ALL FILES ENCRYPTED — AUTHORIZED PERSONNEL ONLY</span>
            <span>SYS.STABLE</span>
          </footer>
        </main>
      </div>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes cardReveal {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes glitchFlicker {
          0% { opacity: 0.2; transform: translate(0); }
          20% { opacity: 0.4; transform: translate(-1px, 1px); }
          40% { opacity: 0.2; transform: translate(1px, -1px); }
          60% { opacity: 0.5; transform: translate(0); }
          80% { opacity: 0.3; transform: translate(-1px, 0); }
          100% { opacity: 0.2; transform: translate(0); }
        }
        @keyframes moveScanlines {
          0% { background-position: 0 0; }
          100% { background-position: 0 20px; }
        }
        * {
          cursor: none !important;
        }
        body {
          background: #060810;
          color: #c8d8f0;
          font-family: 'Fira Code', 'Courier New', monospace;
          overflow-x: hidden;
          margin: 0;
          padding: 0;
        }
        ::selection {
          background: #00f7ff22;
          color: #00f7ff;
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #060810; }
        ::-webkit-scrollbar-thumb { background: #1e2535; }
      `}</style>
    </>
  );
}