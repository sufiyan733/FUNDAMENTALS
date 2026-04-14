"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";

// ─────────────────────────────────────────────────────────────────────────────
// PREFERRED VOICE LIST — highest quality first
// ─────────────────────────────────────────────────────────────────────────────
const PREFERRED_MALE_VOICES = [
  // Premium natural voices (Windows)
  "Microsoft Guy Online (Natural) - English (United States)",
  "Microsoft Ryan Online (Natural) - English (United Kingdom)",
  "Microsoft Eric Online (Natural) - English (United States)",
  "Microsoft Christopher Online (Natural) - English (United States)",
  "Microsoft Steffan Online (Natural) - English (United Kingdom)",
  // Premium natural voices (macOS/iOS)
  "Evan (Premium)",
  "Daniel (Premium)",
  "Samantha (Enhanced)",
  "Daniel (Enhanced)",
  // Google Cloud voices (Chrome)
  "Google UK English Male",
  "Google US English",
  // Windows desktop fallbacks
  "Microsoft David Desktop - English (United States)",
  "Microsoft David - English (United States)",
  "Microsoft Mark - English (United States)",
  // Mac fallbacks
  "Daniel",
  "Alex",
  "Fred",
  // Cloud TTS identifiers
  "en-GB-Standard-B",
  "en-US-Standard-B",
  "en-US-Neural2-D",
  "en-US-Neural2-J",
];

function pickBestMaleVoice(voices) {
  for (const name of PREFERRED_MALE_VOICES) {
    const v = voices.find((v) => v.name === name);
    if (v) return v;
  }
  return (
    voices.find(
      (v) =>
        v.lang.startsWith("en") &&
        !v.name.toLowerCase().includes("female") &&
        !v.name.toLowerCase().includes("woman")
    ) ||
    voices.find((v) => v.lang.startsWith("en")) ||
    voices[0] ||
    null
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// VOICE ENGINE HOOK — shared across all pages
// Picks the best available male voice. Includes Chrome 15s bug fix.
// Uses Web Speech API (free, no API key, unlimited usage).
// ─────────────────────────────────────────────────────────────────────────────
export function useVoiceEngine() {
  const synthRef = useRef(null);
  const voiceRef = useRef(null);
  const heartbeatRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [voiceName, setVoiceName] = useState("");

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    synthRef.current = window.speechSynthesis;

    const load = () => {
      const voices = synthRef.current.getVoices();
      if (voices.length > 0) {
        voiceRef.current = pickBestMaleVoice(voices);
        setVoiceName(voiceRef.current?.name || "Default");
        setReady(true);
      }
    };

    load();
    synthRef.current.addEventListener("voiceschanged", load);
    return () => {
      synthRef.current?.removeEventListener("voiceschanged", load);
      synthRef.current?.cancel();
      clearInterval(heartbeatRef.current);
    };
  }, []);

  const speak = useCallback(
    (text, { rate = 0.82, pitch = 0.95, volume = 1 } = {}) => {
      if (!synthRef.current) return;
      synthRef.current.cancel();
      clearInterval(heartbeatRef.current);

      // Clean text for better speech: strip markdown, code blocks, special chars
      const cleanText = text
        .replace(/```[\s\S]*?```/g, ' code block omitted ')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/[*_#>~]/g, '')
        .replace(/\n+/g, '. ')
        .replace(/\s+/g, ' ')
        .trim();

      const utt = new SpeechSynthesisUtterance(cleanText);
      utt.voice = voiceRef.current;
      utt.rate = rate;
      utt.pitch = pitch;
      utt.volume = volume;

      utt.onstart = () => {
        setSpeaking(true);
        // Chrome bug fix: after ~15s Chrome silently stops — keep alive
        heartbeatRef.current = setInterval(() => {
          if (synthRef.current?.speaking) {
            synthRef.current.pause();
            synthRef.current.resume();
          }
        }, 10000);
      };

      utt.onend = () => {
        setSpeaking(false);
        clearInterval(heartbeatRef.current);
      };

      utt.onerror = () => {
        setSpeaking(false);
        clearInterval(heartbeatRef.current);
      };

      synthRef.current.speak(utt);
    },
    []
  );

  const stop = useCallback(() => {
    synthRef.current?.cancel();
    setSpeaking(false);
    clearInterval(heartbeatRef.current);
  }, []);

  return { speak, stop, speaking, ready, voiceName };
}

// ─────────────────────────────────────────────────────────────────────────────
// WAVEFORM ICON — animated bars when speaking
// ─────────────────────────────────────────────────────────────────────────────
function WaveformIcon({ color }) {
  return (
    <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.rect
          key={i}
          x={i * 3.2}
          y={0}
          width={2}
          height={12}
          rx={1}
          fill={color}
          animate={{ scaleY: [0.3, 1, 0.3], originY: "50%" }}
          transition={{
            duration: 0.7,
            repeat: Infinity,
            delay: i * 0.12,
            ease: "easeInOut",
          }}
          style={{ transformOrigin: "center" }}
        />
      ))}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// VOICE BUTTON — click to speak/stop. Uses shared engine.
// ─────────────────────────────────────────────────────────────────────────────
export function VoiceButton({ text, color = "#00FFA3", engine }) {
  if (!engine) return null;

  const handleClick = () => {
    if (engine.speaking) {
      engine.stop();
    } else {
      engine.speak(text, { rate: 0.82, pitch: 0.95 });
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.12 }}
      whileTap={{ scale: 0.9 }}
      onClick={handleClick}
      title={engine.speaking ? "Stop" : `Voice · ${engine.voiceName}`}
      style={{
        background: engine.speaking ? `${color}25` : "transparent",
        border: `1px solid ${engine.speaking ? color : `${color}40`}`,
        borderRadius: 40,
        width: 32,
        height: 32,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        fontSize: 15,
        color: engine.speaking ? color : "#3E5A7A",
        marginLeft: 10,
        flexShrink: 0,
        transition: "all 0.2s",
        position: "relative",
      }}
    >
      {engine.speaking ? <WaveformIcon color={color} /> : "🔈"}
    </motion.button>
  );
}
