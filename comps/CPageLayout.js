"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useVoiceEngine } from "@/comps/VoiceEngine";

// ─────────────────────────────────────────────────────────────────────────────
// UNIFIED DESIGN TOKENS — shared across all C pages
// ─────────────────────────────────────────────────────────────────────────────
export const T = {
  bg: "#030810",
  bg1: "#060D1C",
  bg2: "#0A1428",
  glass: "rgba(10,20,40,0.75)",
  border: "rgba(0,255,163,0.10)",
  neon: "#00FFA3",
  neon2: "#00D4FF",
  neon3: "#FF6B6B",
  neon4: "#FFB347",
  accent: "#BD69FF",
  text: "#DDE8F8",
  muted: "#3E5A7A",
  dim: "#1A2A3A",
  mono: "'JetBrains Mono', monospace",
  display: "'Syne', sans-serif",
};

// ─────────────────────────────────────────────────────────────────────────────
// CHAPTER METADATA
// ─────────────────────────────────────────────────────────────────────────────
const CHAPTERS = [
  { num: 1, path: "/c-1", title: "C Fundamentals", short: "INTRO" },
  { num: 2, path: "/c-2", title: "Memory & Data", short: "DATA TYPES" },
  { num: 3, path: "/c-3", title: "Operators & Control", short: "OPERATORS" },
  { num: 4, path: "/c-4", title: "Functions & Arrays", short: "FUNCTIONS" },
  { num: 5, path: "/c-5", title: "Pointers & Structs", short: "POINTERS" },
  { num: 6, path: "/c-6", title: "File I/O", short: "FILE I/O" },
  { num: 7, path: "/c-7", title: "Advanced Topics", short: "ADVANCED" },
];

// ─────────────────────────────────────────────────────────────────────────────
// GLOBAL STYLES COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export function CPageStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=JetBrains+Mono:ital,wght@0,300;0,500;0,700;1,400&display=swap');
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html { scroll-behavior: smooth; }
      body { background: ${T.bg}; color: ${T.text}; overflow-x: hidden; }
      ::-webkit-scrollbar { width: 3px; }
      ::-webkit-scrollbar-track { background: ${T.bg}; }
      ::-webkit-scrollbar-thumb { background: ${T.neon}; border-radius: 2px; }
      input[type=range] {
        -webkit-appearance: none; appearance: none;
        height: 4px; cursor: pointer; background: ${T.dim};
        border-radius: 2px; outline: none;
      }
      input[type=range]::-webkit-slider-thumb {
        -webkit-appearance: none; width: 14px; height: 14px;
        border-radius: 50%; background: ${T.neon}; cursor: pointer;
        box-shadow: 0 0 10px ${T.neon}70;
      }
      a { text-decoration: none; }
      button { outline: none; }
      @keyframes scrollUp { from{transform:translateY(0)} to{transform:translateY(-50%)} }
      @keyframes voicePulse { 0%,100%{box-shadow:0 0 0 0 rgba(0,255,163,0.3)} 50%{box-shadow:0 0 0 6px rgba(0,255,163,0)} }

      /* ── RESPONSIVE LAYOUT ── */
      .cpl-root { display:flex; height:100vh; overflow:hidden; background:${T.bg}; }
      .cpl-left { width:180px; min-width:180px; height:100vh; overflow-y:auto; overflow-x:hidden; background:${T.bg1}; border-right:1px solid ${T.dim}; display:flex; flex-direction:column; position:sticky; top:0; }
      .cpl-main { flex:1; overflow-y:auto; overflow-x:hidden; min-width:0; position:relative; }
      .cpl-right { width:280px; min-width:280px; height:100vh; background:${T.bg1}; border-left:1px solid ${T.dim}; display:flex; flex-direction:column; position:sticky; top:0; overflow:hidden; }
      .cpl-right-scroll { flex:1; overflow-y:auto; overflow-x:hidden; padding:16px 14px; }
      .cpl-right-nav { flex-shrink:0; border-top:1px solid ${T.dim}; background:${T.bg1}; }

      /* Tablet: hide left sidebar, right sidebar goes full-width bottom */
      @media (max-width:1024px) {
        .cpl-root { flex-direction:column; height:auto; overflow:visible; }
        .cpl-left { width:100%; min-width:100%; height:auto; position:relative; border-right:none; border-bottom:1px solid ${T.dim}; }
        .cpl-left nav { max-height:180px; }
        .cpl-main { overflow:visible; }
        .cpl-right { width:100%; min-width:100%; height:auto; position:relative; border-left:none; border-top:1px solid ${T.dim}; }
        .cpl-right-scroll { overflow:visible; flex:none; }
      }

      /* Phone: compact everything */
      @media (max-width:640px) {
        .cpl-left { padding:8px 0 !important; }
        .cpl-left nav { max-height:150px; font-size:9px; }
        .cpl-right-scroll { padding:10px 8px; }
        .cpl-right-nav { font-size:9px; }
      }
    `}</style>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LEFT SIDEBAR — Navigation + Progress + Prev/Next
// Width: 220px fixed (compact)
// ─────────────────────────────────────────────────────────────────────────────
function LeftSidebar({ chapterNum, navItems, activeSection }) {
  const chapter = CHAPTERS.find(c => c.num === chapterNum);
  const prevChapter = CHAPTERS.find(c => c.num === chapterNum - 1);
  const nextChapter = CHAPTERS.find(c => c.num === chapterNum + 1);
  const progress = Math.round((chapterNum / CHAPTERS.length) * 100);

  return (
    <aside className="cpl-left">
      {/* Header */}
      <div style={{ padding: "22px 20px 14px", borderBottom: `1px solid ${T.dim}` }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <div style={{
            fontFamily: T.mono, fontSize: 8, letterSpacing: 4, color: T.muted,
            marginBottom: 4,
          }}>C VISUAL LEARNING</div>
        </Link>
        <div style={{
          fontFamily: T.display, fontSize: 20, fontWeight: 800,
          color: T.text, letterSpacing: -0.5, lineHeight: 1.1,
        }}>
          <span style={{ color: T.neon }}>Chapter {chapterNum}</span>
        </div>
        <div style={{
          fontFamily: T.mono, fontSize: 10, color: T.muted, marginTop: 4,
        }}>{chapter?.title}</div>
      </div>

      {/* Nav Items */}
      <nav style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
        {navItems.map(item => {
          const isActive = activeSection === item.id;
          return (
            <motion.a
              key={item.id}
              href={`#${item.id}`}
              onClick={e => {
                e.preventDefault();
                document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" });
              }}
              animate={{
                color: isActive ? T.neon : T.muted,
                background: isActive ? `${T.neon}08` : "transparent",
                borderLeftColor: isActive ? T.neon : "transparent",
              }}
              whileHover={{ color: T.text, paddingLeft: 24 }}
              transition={{ duration: 0.2 }}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "9px 20px",
                fontFamily: T.mono, fontSize: 10, fontWeight: 700,
                letterSpacing: 1.5, textDecoration: "none",
                borderLeft: "3px solid transparent",
                cursor: "pointer", transition: "all 0.2s",
              }}
            >
              <span style={{ fontSize: 12, width: 18, textAlign: "center", flexShrink: 0 }}>
                {item.icon}
              </span>
              <div>
                <div style={{ fontSize: 7, opacity: 0.45, marginBottom: 1 }}>{item.num}</div>
                {item.label}
              </div>
              {isActive && (
                <motion.div
                  layoutId="nav-dot"
                  style={{
                    width: 5, height: 5, borderRadius: "50%",
                    background: T.neon, marginLeft: "auto", flexShrink: 0,
                  }}
                />
              )}
            </motion.a>
          );
        })}
      </nav>

      {/* Bottom: Progress + Prev/Next */}
      <div style={{
        flexShrink: 0, padding: "14px 16px 20px",
        borderTop: `1px solid ${T.dim}`,
        display: "flex", flexDirection: "column", gap: 10,
      }}>
        {/* Progress bar */}
        <div>
          <div style={{
            fontFamily: T.mono, fontSize: 7, letterSpacing: 3,
            color: T.muted, marginBottom: 6,
          }}>COURSE PROGRESS</div>
          <div style={{
            height: 3, background: T.dim, borderRadius: 2, overflow: "hidden",
          }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              style={{
                height: "100%",
                background: `linear-gradient(90deg, ${T.neon}, ${T.neon2})`,
                borderRadius: 2,
              }}
            />
          </div>
          <div style={{
            fontFamily: T.mono, fontSize: 8, color: T.neon, marginTop: 4,
          }}>{chapterNum} / {CHAPTERS.length} chapters</div>
        </div>

        {/* Prev Button */}
        {prevChapter ? (
          <Link href={prevChapter.path} passHref legacyBehavior>
            <motion.a
              whileHover={{ x: -3, borderColor: T.neon2 }}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                fontFamily: T.mono, fontSize: 9, letterSpacing: 1.5, fontWeight: 700,
                color: T.neon2, textDecoration: "none",
                background: `${T.neon2}08`,
                border: `1px solid ${T.neon2}30`,
                borderRadius: 8, padding: "8px 12px",
                transition: "all 0.2s",
              }}
            >
              <span>← PREV</span>
              <span style={{ color: T.text, letterSpacing: 0, fontSize: 8, maxWidth: 120, textAlign: "right", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {prevChapter.title}
              </span>
            </motion.a>
          </Link>
        ) : (
          <Link href="/" passHref legacyBehavior>
            <motion.a
              whileHover={{ x: -3, borderColor: T.muted }}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: T.mono, fontSize: 9, letterSpacing: 1.5, fontWeight: 700,
                color: T.muted, textDecoration: "none",
                background: `${T.muted}08`,
                border: `1px solid ${T.muted}30`,
                borderRadius: 8, padding: "8px 12px",
                transition: "all 0.2s",
              }}
            >
              ← HOME
            </motion.a>
          </Link>
        )}

        {/* Next Button */}
        {nextChapter ? (
          <Link href={nextChapter.path} passHref legacyBehavior>
            <motion.a
              whileHover={{ x: 3, borderColor: T.neon }}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                fontFamily: T.mono, fontSize: 9, letterSpacing: 1.5, fontWeight: 700,
                color: T.neon, textDecoration: "none",
                background: `${T.neon}08`,
                border: `1px solid ${T.neon}30`,
                borderRadius: 8, padding: "8px 12px",
                transition: "all 0.2s",
              }}
            >
              <span style={{ color: T.text, letterSpacing: 0, fontSize: 8, maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {nextChapter.title}
              </span>
              <span>NEXT →</span>
            </motion.a>
          </Link>
        ) : (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: T.mono, fontSize: 9, letterSpacing: 1.5, fontWeight: 700,
            color: T.neon, textDecoration: "none",
            background: `linear-gradient(135deg, ${T.neon}18, ${T.neon2}18)`,
            border: `1px solid ${T.neon}40`,
            borderRadius: 8, padding: "8px 12px",
          }}>
            🎉 COURSE COMPLETE
          </div>
        )}

        {/* Version */}
        <div style={{
          fontFamily: T.mono, fontSize: 7, color: T.dim,
          letterSpacing: 2, textAlign: "center", marginTop: 4,
        }}>
          C VISUAL SIM · v7.0
        </div>
      </div>
    </aside>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RIGHT SIDEBAR — Section insights + deep learning panel + fixed chapter nav
// Width: 280px fixed (compact for 20% more content area)
// ─────────────────────────────────────────────────────────────────────────────
function RightSidebar({ chapterNum, activeSection, sectionInsights, voiceEngine, children }) {
  const data = sectionInsights?.[activeSection];

  const speakCard = (text) => {
    if (!voiceEngine?.ready) return;
    if (voiceEngine.speaking) { voiceEngine.stop(); return; }
    voiceEngine.speak(text, { rate: 0.85, pitch: 0.95, volume: 1 });
  };

  return (
    <aside className="cpl-right">
      {/* Scrollable insights area */}
      <div className="cpl-right-scroll">
      {/* Header */}
      <div style={{
        fontFamily: T.mono, fontSize: 8, letterSpacing: 4,
        color: T.muted, marginBottom: 14,
      }}>
        DEEP INSIGHTS
      </div>

      {/* Active section indicator */}
      <div style={{
        padding: "10px 12px", borderRadius: 10,
        background: `${T.neon}08`, border: `1px solid ${T.neon}25`,
        marginBottom: 14,
      }}>
        <div style={{ fontFamily: T.mono, fontSize: 7, letterSpacing: 3, color: T.neon, marginBottom: 4 }}>
          VIEWING
        </div>
        <div style={{ fontFamily: T.display, fontSize: 14, fontWeight: 800, color: T.text }}>
          {activeSection?.toUpperCase().replace(/-/g, " ") || "—"}
        </div>
      </div>

      {/* Insights cards */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
        {data ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.25 }}
              style={{ display: "flex", flexDirection: "column", gap: 10 }}
            >
              {Array.isArray(data) ? data.map((insight, i) => (
                <div key={i} style={{
                  padding: "12px", borderRadius: 10,
                  background: `${insight.color || T.neon}08`,
                  border: `1px solid ${insight.color || T.neon}25`,
                }}>
                  <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    marginBottom: 6,
                  }}>
                    <div style={{
                      fontFamily: T.mono, fontSize: 7, letterSpacing: 3,
                      color: insight.color || T.neon,
                    }}>{insight.icon} {insight.title}</div>
                    {voiceEngine?.ready && (
                      <motion.button
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => speakCard(`${insight.title}. ${insight.body || insight.text}`)}
                        style={{
                          background: "none", border: `1px solid ${insight.color || T.neon}40`,
                          borderRadius: 20, width: 22, height: 22, cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: insight.color || T.neon, fontSize: 10, flexShrink: 0,
                          transition: "all 0.2s",
                          animation: voiceEngine.speaking ? "voicePulse 1.5s infinite" : "none",
                        }}
                        title="Listen to this insight"
                      >🔈</motion.button>
                    )}
                  </div>
                  <div style={{
                    fontFamily: T.mono, fontSize: 10, color: T.text,
                    lineHeight: 1.85,
                  }}>{insight.body || insight.text}</div>
                </div>
              )) : (
                <div style={{
                  padding: "12px", borderRadius: 10,
                  background: `${T.neon}08`, border: `1px solid ${T.neon}25`,
                }}>
                  <div style={{
                    fontFamily: T.mono, fontSize: 10, color: T.text,
                    lineHeight: 1.85,
                  }}>{typeof data === "string" ? data : JSON.stringify(data)}</div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              {
                icon: "💡", title: "KEY TAKEAWAYS",
                color: T.neon,
                body: "Scroll into a section to see context-specific insights. Key concepts are summarized and linked to real-world applications.",
              },
              {
                icon: "📋", title: "QUICK SUMMARY",
                color: T.neon2,
                body: "This chapter builds foundational knowledge required for advanced topics. Master each section before moving forward.",
              },
              {
                icon: "⚡", title: "WHY THIS MATTERS",
                color: T.neon4,
                body: "Every concept here is used daily by professional engineers. Understanding these fundamentals separates average from excellent developers.",
              },
              {
                icon: "🌍", title: "REAL-WORLD USAGE",
                color: T.accent,
                body: "These patterns appear in OS kernels, embedded systems, web backends, and production codebases worldwide.",
              },
            ].map((block, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.3 }}
                style={{
                  padding: "12px", borderRadius: 10,
                  background: `${block.color}08`, border: `1px solid ${block.color}20`,
                }}
              >
                <div style={{
                  fontFamily: T.mono, fontSize: 7, letterSpacing: 3,
                  color: block.color, marginBottom: 6, fontWeight: 700,
                }}>{block.icon} {block.title}</div>
                <div style={{
                  fontFamily: T.mono, fontSize: 10, color: T.muted,
                  lineHeight: 1.85,
                }}>{block.body}</div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Custom children content */}
        {children}
      </div>
      {/* End scrollable area */}
      </div>

      {/* Chapter quick-jump — 8-column grid, FIXED at bottom */}
      <div className="cpl-right-nav">
        <div style={{
          fontFamily: T.mono, fontSize: 8, letterSpacing: 4, fontWeight: 700,
          color: T.muted, padding: "12px 14px 6px",
          borderBottom: `1px solid ${T.dim}`,
        }}>⌘ NAVIGATE</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 0, width: "100%" }}>
          {CHAPTERS.map(ch => {
            const isActive = ch.num === chapterNum;
            return (
              <Link key={ch.num} href={ch.path} style={{ textDecoration: "none" }}>
                <motion.div
                  whileHover={{ background: `${T.neon}22`, color: T.neon, scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    padding: "16px 0", textAlign: "center",
                    background: isActive ? `${T.neon}15` : "transparent",
                    borderRight: `1px solid ${T.dim}`,
                    borderBottom: `3px solid ${isActive ? T.neon : "transparent"}`,
                    fontFamily: T.mono, fontSize: 12, fontWeight: 700,
                    color: isActive ? T.neon : T.muted,
                    cursor: "pointer", transition: "all 0.2s",
                    position: "relative",
                  }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="ch-active"
                      style={{
                        position: "absolute", top: 0, left: 0, right: 0, height: 2,
                        background: `linear-gradient(90deg, transparent, ${T.neon}, transparent)`,
                      }}
                    />
                  )}
                  C{ch.num}
                </motion.div>
              </Link>
            );
          })}

          {/* 8th slot — AI Chatbot (themed) */}
          <motion.div
            onClick={() => typeof window !== 'undefined' && window.dispatchEvent(new CustomEvent('open-chatbot'))}
            whileHover={{ scale: 1.08, boxShadow: `0 0 20px ${T.accent}40` }}
            whileTap={{ scale: 0.92 }}
            style={{
              padding: "16px 0", textAlign: "center",
              background: `linear-gradient(135deg, ${T.accent}20, ${T.neon2}15)`,
              borderBottom: `3px solid ${T.accent}60`,
              fontFamily: T.mono, fontSize: 15, fontWeight: 700,
              color: T.accent, cursor: "pointer", transition: "all 0.25s",
              position: "relative",
            }}
            title="Open AI Tutor"
          >
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: 2,
              background: `linear-gradient(90deg, ${T.accent}, ${T.neon2}, ${T.accent})`,
              opacity: 0.6,
            }} />
            ⚡
          </motion.div>
        </div>
      </div>
    </aside>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE LAYOUT — wraps everything in a consistent 3-column grid
// ─────────────────────────────────────────────────────────────────────────────
export default function CPageLayout({
  chapterNum,
  navItems,
  activeSection,
  sectionInsights,
  rightSidebarChildren,
  children,
}) {
  const voiceEngine = useVoiceEngine();

  return (
    <>
      <CPageStyles />
      <div className="cpl-root">
        {/* LEFT SIDEBAR */}
        <LeftSidebar
          chapterNum={chapterNum}
          navItems={navItems}
          activeSection={activeSection}
        />

        {/* MAIN CONTENT */}
        <main className="cpl-main">
          {/* Ambient grid + glow background for content area */}
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
          }}>
            <div style={{
              position: "absolute", inset: 0,
              backgroundImage: `radial-gradient(circle, ${T.neon}08 1px, transparent 1px)`,
              backgroundSize: "40px 40px",
              maskImage: "linear-gradient(180deg, black 0%, transparent 60%)",
              WebkitMaskImage: "linear-gradient(180deg, black 0%, transparent 60%)",
            }} />
            <div style={{
              position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
              width: "70%", height: "35%",
              background: `radial-gradient(ellipse, ${T.neon}06 0%, transparent 70%)`,
              filter: "blur(50px)",
            }} />
            <div style={{
              position: "absolute", bottom: "10%", right: "5%",
              width: "35%", height: "25%",
              background: `radial-gradient(ellipse, ${T.neon2}04 0%, transparent 70%)`,
              filter: "blur(40px)",
            }} />
          </div>
          <div style={{ maxWidth: "100%", padding: "0 36px", position: "relative", zIndex: 1 }}>
            {children}

            {/* Bottom page navigation (inline, for scrollable experience) */}
            <div style={{
              display: "flex", justifyContent: "space-between", gap: 16,
              padding: "32px 0 48px",
              borderTop: `1px solid ${T.dim}`,
              marginTop: 24,
            }}>
              {chapterNum > 1 ? (
                <Link href={CHAPTERS[chapterNum - 2].path} style={{ flex: 1 }}>
                  <motion.div
                    whileHover={{ x: -4, boxShadow: `0 0 30px ${T.neon2}20` }}
                    style={{
                      display: "flex", alignItems: "center", gap: 14,
                      padding: "16px 20px", borderRadius: 12,
                      background: T.bg2, border: `1px solid ${T.dim}`,
                      transition: "all 0.2s", cursor: "pointer",
                    }}
                  >
                    <span style={{
                      fontFamily: T.display, fontSize: 24, color: T.neon2,
                    }}>←</span>
                    <div>
                      <div style={{
                        fontFamily: T.mono, fontSize: 8, letterSpacing: 3,
                        color: T.muted, marginBottom: 2,
                      }}>PREVIOUS</div>
                      <div style={{
                        fontFamily: T.display, fontSize: 16, fontWeight: 800,
                        color: T.text,
                      }}>Chapter {chapterNum - 1}: {CHAPTERS[chapterNum - 2].title}</div>
                    </div>
                  </motion.div>
                </Link>
              ) : <div style={{ flex: 1 }} />}

              {chapterNum < CHAPTERS.length ? (
                <Link href={CHAPTERS[chapterNum].path} style={{ flex: 1 }}>
                  <motion.div
                    whileHover={{ x: 4, boxShadow: `0 0 30px ${T.neon}20` }}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "flex-end",
                      gap: 14, padding: "16px 20px", borderRadius: 12,
                      background: T.bg2, border: `1px solid ${T.dim}`,
                      transition: "all 0.2s", cursor: "pointer",
                    }}
                  >
                    <div style={{ textAlign: "right" }}>
                      <div style={{
                        fontFamily: T.mono, fontSize: 8, letterSpacing: 3,
                        color: T.muted, marginBottom: 2,
                      }}>NEXT</div>
                      <div style={{
                        fontFamily: T.display, fontSize: 16, fontWeight: 800,
                        color: T.text,
                      }}>Chapter {chapterNum + 1}: {CHAPTERS[chapterNum].title}</div>
                    </div>
                    <span style={{
                      fontFamily: T.display, fontSize: 24, color: T.neon,
                    }}>→</span>
                  </motion.div>
                </Link>
              ) : (
                <div style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
                  padding: "16px 20px", borderRadius: 12,
                  background: `linear-gradient(135deg, ${T.neon}10, ${T.neon2}10)`,
                  border: `1px solid ${T.neon}30`,
                }}>
                  <div style={{
                    fontFamily: T.display, fontSize: 16, fontWeight: 800,
                    color: T.neon, textAlign: "center",
                  }}>🎉 Course Complete!</div>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* RIGHT SIDEBAR */}
        <RightSidebar
          chapterNum={chapterNum}
          activeSection={activeSection}
          sectionInsights={sectionInsights}
          voiceEngine={voiceEngine}
        >
          {rightSidebarChildren}
        </RightSidebar>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SHARED COMPONENTS — exported for use in individual pages
// ─────────────────────────────────────────────────────────────────────────────

export function GlassCard({ children, style = {}, hover = true, glowColor = T.neon, onClick, ...props }) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={hover ? {
        scale: 1.003,
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

export function Section({ id, children, style = {} }) {
  return (
    <section id={id} style={{
      padding: "72px 0",
      borderBottom: `1px solid ${T.dim}`,
      ...style,
    }}>
      {children}
    </section>
  );
}

export function SectionHeader({ num, tag, title, subtitle }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -24 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      style={{
        display: "flex", alignItems: "flex-end", gap: 18,
        marginBottom: 36,
      }}
    >
      <span style={{
        fontFamily: T.mono, fontSize: 52, fontWeight: 700,
        color: T.dim, lineHeight: 1, letterSpacing: -2,
      }}>{num}</span>
      <div>
        <div style={{
          fontFamily: T.mono, fontSize: 9, letterSpacing: 5,
          color: T.neon, fontWeight: 500, marginBottom: 4,
        }}>{tag}</div>
        <h2 style={{
          fontFamily: T.display, fontSize: 28, fontWeight: 800,
          color: T.text, letterSpacing: -0.5, lineHeight: 1,
        }}>{title}</h2>
        {subtitle && (
          <p style={{
            fontFamily: T.mono, fontSize: 11, color: T.muted,
            marginTop: 5, maxWidth: 500,
          }}>{subtitle}</p>
        )}
      </div>
    </motion.div>
  );
}

export function CodeBlock({ code, highlightLine = -1, style = {} }) {
  const lines = (code || "").split("\n");
  return (
    <div style={{
      background: "rgba(0,0,0,0.5)", borderRadius: 10,
      border: `1px solid ${T.dim}`, overflow: "hidden", ...style,
    }}>
      <div style={{
        padding: "8px 14px", borderBottom: `1px solid ${T.dim}`,
        display: "flex", gap: 6, alignItems: "center",
      }}>
        {["#FF5F57", "#FEBC2E", "#28C840"].map((c, i) => (
          <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: c }} />
        ))}
      </div>
      <div style={{ padding: "14px 0", overflowX: "auto" }}>
        {lines.map((line, i) => (
          <motion.div
            key={i}
            animate={{ background: highlightLine === i ? `${T.neon}18` : "transparent" }}
            style={{
              fontFamily: T.mono, fontSize: 12, lineHeight: 1.9,
              paddingLeft: highlightLine === i ? 20 : 16, paddingRight: 16,
              borderLeft: `2px solid ${highlightLine === i ? T.neon : "transparent"}`,
              color: highlightLine === i ? T.neon : T.text,
              transition: "all 0.2s", whiteSpace: "pre",
            }}
          >
            <span style={{
              color: T.dim, marginRight: 14, fontSize: 9, userSelect: "none",
            }}>{String(i + 1).padStart(2, " ")}</span>
            {line}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function NeonTag({ children, color = T.neon }) {
  return (
    <span style={{
      fontFamily: T.mono, fontSize: 9, letterSpacing: 2, fontWeight: 700,
      color, background: `${color}14`, border: `1px solid ${color}28`,
      padding: "2px 8px", borderRadius: 4,
    }}>
      {children}
    </span>
  );
}

export function Pill({ children, color = T.neon, active = false, onClick }) {
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
        boxShadow: active ? `0 0 20px ${color}50` : "none",
      }}
    >
      {children}
    </motion.button>
  );
}

export function InsightBlock({ title, color, icon, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      style={{
        padding: "14px", borderRadius: 10,
        background: `${color}08`, border: `1px solid ${color}25`,
      }}
    >
      <div style={{
        fontFamily: T.mono, fontSize: 8, letterSpacing: 3,
        color, marginBottom: 8,
      }}>
        {icon} {title}
      </div>
      <div style={{
        fontFamily: T.mono, fontSize: 11, color: T.text, lineHeight: 1.85,
      }}>
        {children}
      </div>
    </motion.div>
  );
}

export function ScanLine() {
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
// HOOK: observe sections for active tracking
// ─────────────────────────────────────────────────────────────────────────────
export function useActiveSection(navItems) {
  const [activeSection, setActiveSection] = useState(navItems[0]?.id || "hero");

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) setActiveSection(e.target.id);
        });
      },
      { threshold: 0.25, rootMargin: "-10% 0px -10% 0px" }
    );
    navItems.forEach(item => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [navItems]);

  return activeSection;
}
