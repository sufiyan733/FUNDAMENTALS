"use client";

/**
 * C PROGRAMMING — FUNDAMENTALS PAGE (PAGE 2)
 * ============================================
 * Premium Voice Engine + Reduced Left Sidebar (324px, -10%)
 */

import { useState, useEffect, useRef, useCallback, useMemo, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, Float, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";
import Link from "next/link";

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN TOKENS
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
  muted:   "#3E5A7A",
  dim:     "#1A2A3A",
  mono:    "'JetBrains Mono', monospace",
  display: "'Syne', sans-serif",
};

// ─────────────────────────────────────────────────────────────────────────────
// ★ PREMIUM VOICE ENGINE
// Uses Web Speech API — free, unlimited, works in all modern browsers.
// Intelligently selects the highest-quality male voice available on the device.
// Applies prosody (rate/pitch/volume) tuning for a rich, radio-host quality feel.
// ─────────────────────────────────────────────────────────────────────────────

const VOICE_PRIORITY = [
  // Google Neural voices (Chrome/Edge — best quality)
  "Google UK English Male",
  "Google US English",
  // Microsoft Neural voices (Edge)
  "Microsoft Ryan Online (Natural) - English (United Kingdom)",
  "Microsoft Guy Online (Natural) - English (United States)",
  "Microsoft David - English (United States)",
  "Microsoft Mark - English (United States)",
  // macOS / iOS premium voices
  "Daniel",
  "Alex",
  "Tom",
  // Android
  "en-gb-x-gbd-network",
  "en-us-x-sfg-network",
];

function pickBestMaleVoice(voices) {
  for (const name of VOICE_PRIORITY) {
    const found = voices.find(v => v.name === name);
    if (found) return found;
  }
  // Fallback: any English male-sounding voice
  const englishMale = voices.find(
    v => v.lang.startsWith("en") && /male|man|guy|ryan|david|mark|daniel|alex|tom|george|james/i.test(v.name)
  );
  if (englishMale) return englishMale;
  // Last resort: any English voice
  return voices.find(v => v.lang.startsWith("en")) || voices[0] || null;
}

// Craft "crazy level" explanations with dramatic pauses using SSML-like text tricks
// We insert commas and ellipses to force natural pauses in the Web Speech API
function buildDramaticScript(text) {
  return text
    // Add breathing pause after colons
    .replace(/: /g, "… ")
    // Add micro pause after em-dash concepts
    .replace(/— /g, ", — ")
    // Slow down for numbers/technical terms
    .replace(/(\d+)/g, "$1,")
    // Remove double commas
    .replace(/,,/g, ",");
}

// The main speak function — returns a cancel handle
function speakPremium({ text, onStart, onEnd, onError, mode = "beginner" }) {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    onError?.("Speech synthesis not supported");
    return () => {};
  }

  window.speechSynthesis.cancel();

  const voices = window.speechSynthesis.getVoices();
  const voice = pickBestMaleVoice(voices);

  const dramaticText = buildDramaticScript(text);
  const utt = new SpeechSynthesisUtterance(dramaticText);

  if (voice) utt.voice = voice;
  utt.lang = "en-US";

  // Prosody tuning for "premium radio host" feel
  if (mode === "beginner") {
    utt.rate   = 0.88;   // Slightly slower, very clear
    utt.pitch  = 0.95;   // Slightly deeper, authoritative
    utt.volume = 1.0;
  } else {
    utt.rate   = 0.82;   // Even slower for complex deep-dive content
    utt.pitch  = 0.90;   // Deeper, more gravitas
    utt.volume = 1.0;
  }

  utt.onstart = () => onStart?.();
  utt.onend   = () => onEnd?.();
  utt.onerror = (e) => onError?.(e.error);

  // Chrome bug workaround: voices may not be loaded yet
  if (voices.length === 0) {
    window.speechSynthesis.onvoiceschanged = () => {
      const v2 = window.speechSynthesis.getVoices();
      const bestVoice = pickBestMaleVoice(v2);
      if (bestVoice) utt.voice = bestVoice;
      window.speechSynthesis.speak(utt);
    };
  } else {
    window.speechSynthesis.speak(utt);
  }

  return () => window.speechSynthesis.cancel();
}

// Hook: manage speak state cleanly
function usePremiumVoice() {
  const [speaking, setSpeaking] = useState(false);
  const [speakingId, setSpeakingId] = useState(null);
  const cancelRef = useRef(null);

  const speak = useCallback(({ id, text, mode }) => {
    cancelRef.current?.();
    setSpeaking(true);
    setSpeakingId(id ?? "default");
    cancelRef.current = speakPremium({
      text,
      mode,
      onStart: () => { setSpeaking(true); setSpeakingId(id ?? "default"); },
      onEnd:   () => { setSpeaking(false); setSpeakingId(null); },
      onError: () => { setSpeaking(false); setSpeakingId(null); },
    });
  }, []);

  const stop = useCallback(() => {
    cancelRef.current?.();
    setSpeaking(false);
    setSpeakingId(null);
  }, []);

  useEffect(() => () => cancelRef.current?.(), []);

  return { speaking, speakingId, speak, stop };
}

// Crazy-level scripts by section — rich, educational, dramatic storytelling
const CRAZY_SCRIPTS = {
  hero2: `Welcome… to the world beneath the surface of every program ever written.
Right now… your computer's RAM is a vast ocean of bytes. And C… is the only language that lets you swim in it directly.
No training wheels. No garbage collector holding your hand. Just you… the compiler… and raw memory.
In this chapter, you will learn how C names memory, how it stores different kinds of data, and how it talks to the outside world through printf and scanf.
By the end… you won't just write C code. You'll SEE what it does to memory. Line. By. Line.`,

  datatype_char: `The char. One single byte. Eight bits. That's all.
And yet… every character you've ever typed — every letter, every space, every punctuation mark — is just a number hiding behind a mask.
Press the letter A on your keyboard? The computer doesn't see A. It sees… sixty-five. That's ASCII. The American Standard Code for Information Interchange.
Seventy years old… and still running inside every computer on the planet.
When you write char c equals quote A, you're telling C: give me ONE byte of memory… and store the number sixty-five in it.
The quotes are just a convenience. Underneath, char is nothing more than a tiny, tiny integer.`,

  datatype_int: `The int. Thirty-two bits. Four bytes. The workhorse of C.
This is the type your CPU was BORN to handle. When your processor fetches an int from memory, it does it in one single clock cycle. One tick. Instant.
Why four bytes? Because modern CPUs have thirty-two-bit or sixty-four-bit internal registers. Four bytes fits perfectly into the pipeline.
The range? Negative two point one billion… to positive two point one billion.
That sounds like a lot. But exceed it by even ONE… and something terrifying happens. The number wraps around to the most negative value possible. Silent. Invisible. Catastrophic.
This is called integer overflow. And it has crashed spacecraft, corrupted financial records, and caused some of the most devastating bugs in software history.`,

  datatype_float: `Now we enter the realm of approximation.
Float. Four bytes. But these four bytes do something extraordinary — they represent numbers with decimal points across an enormous range.
How? Through a standard called IEEE 754. The thirty-two bits are split three ways: one bit for the sign — positive or negative. Eight bits for the exponent — how big or small. And twenty-three bits for the mantissa — the actual digits.
Here's the mind-bending part: because of how binary fractions work… the number zero point one… cannot be represented exactly.
You read that right.
Zero. Point. One. Does. Not. Exist. In. Binary.
It's rounded to the nearest representable value. Which is why zero point one plus zero point two does not equal zero point three in C.
Never. Use. Float. For. Money.`,

  datatype_double: `Double. Eight bytes. Sixty-four bits.
If float gives you seven significant decimal digits of precision… double gives you FIFTEEN.
The extra thirty-two bits go entirely into the mantissa — doubling the number of significant digits your calculation can track.
This is why scientific computing, physics simulations, orbital mechanics, and financial modeling use double.
When in doubt… use double. The performance cost is negligible on modern hardware. The accuracy improvement? Enormous.`,

  datatype_short: `Short. Two bytes. Sixteen bits.
Half the size of int. Perfect when you have thousands, or millions, of small values and memory matters.
Audio samples are often stored as shorts. Sensor readings from embedded systems. Pixel color channels in some formats.
The range is negative thirty-two thousand seven hundred sixty-eight… to positive thirty-two thousand seven hundred sixty-seven.
Small. Efficient. Precise when you know your values stay small.`,

  datatype_long: `Long long. Eight bytes. Sixty-four bits.
This is the nuclear option for integer storage.
Nine point two QUINTILLION. That's the maximum value. Written out: nine followed by eighteen zeros.
You'll need this for: Unix timestamps beyond the year 2038, file sizes larger than two gigabytes, cryptographic calculations, unique ID generation for massive distributed systems.
The double L suffix — nine billion L L — is how you tell the compiler: yes, I KNOW this is a long long literal. Don't truncate it.`,

  variables: `Let's talk about variables. And what they REALLY are.
When you write int x equals five… you're not creating a concept. You're not storing an idea.
You're asking the operating system for four bytes of stack memory… giving that memory a name… and writing the bits representing five into those bytes.
The name x? The compiler throws it away at compile time. It becomes a memory address. Something like zero x F F one zero.
When you later write x equals ten… you're not changing a variable. You're writing the bit pattern for ten… to that same address.
Now. Constants. The keyword const tells the COMPILER: if anyone tries to assign a new value to this name… shout an error and refuse to compile.
But here's the dark secret of C: const is not a hardware lock. A sufficiently determined programmer can cast away const with a pointer and write to it anyway.
const is a SOCIAL CONTRACT. A promise to yourself and your team. Not a wall.`,

  io: `printf and scanf. The two functions every C programmer meets on day one.
And most C programmers… never fully understand them.
Let's fix that.
printf takes a format string — a template with percent-sign placeholders. It walks through the string character by character. When it hits a percent sign, it knows: the next character tells me how to interpret the next argument.
Percent D? Read four bytes as a signed integer. Percent F? Read eight bytes as a double. Percent C? Read one byte as a character.
If you get this wrong — if you pass a float but use percent D — printf reads the float's bytes AS IF they were an integer. The result is garbage. And in some cases, it corrupts the stack.
Now. scanf. This one trips up every beginner. Every. Single. One.
scanf needs to WRITE to your variable. It needs to store the user's input somewhere.
If you pass the value of x… scanf gets a COPY of that value. It writes the input there, into the void, and x is never updated.
You must pass the ADDRESS of x. That's what the ampersand operator does. Ampersand x means: give me the memory address where x lives.
scanf can then navigate to that address and write the user's input directly into your variable's memory slot.
No ampersand, no update. It's that simple. And that easy to forget.`,

  formatspec: `Format specifiers. The Rosetta Stone between C values and human-readable output.
Every percent-sign code is an instruction to printf: here's a chunk of memory. Interpret it THIS way. Display it THAT way.
Percent D: treat these four bytes as a signed decimal integer.
Percent F: treat these eight bytes as a floating-point number, show six decimal places.
Percent C: treat this one byte as an ASCII character code, show the character.
Percent S: treat this value as a memory address pointing to a string. Walk forward from there, printing characters, until you hit a null byte.
The precision modifier — dot, then a number — controls decimal places for floats.
The width modifier — a number before the specifier — controls minimum field width for alignment.
And the danger: type mismatch. If you have a float and you print it with percent D, printf reads the four bytes of that float's IEEE 754 representation AS IF they were a signed integer.
The result? A seemingly random number in the billions. Not a crash. Not a warning. Just… silent wrongness.
C trusts you to get this right. That trust is both a gift and a curse.`,

  stepexec: `Let's step through a complete C program. Line. By. Line.
The preprocessor directive at the top — hash include stdio dot h — is not actually C code.
It runs BEFORE compilation. The preprocessor physically replaces that line with the entire contents of stdio dot h. Thousands of lines of function declarations suddenly appear in your file.
Then main. The entry point. The OS calls this function when your program starts. The int before main means it returns an exit code — zero for success, anything else for failure.
The opening brace begins a scope. All variables declared inside this scope live on the stack. When the closing brace is reached, the stack pointer moves back, and they're gone forever.
int score equals zero. Four bytes allocated on the stack. Initialized to zero. Address: something like zero x F F one zero.
float gpa equals three point eight f. Four more bytes. The f suffix is critical — without it, three point eight is a double literal: eight bytes. C would then warn you about implicit conversion.
char grade equals quote A. One byte. Stores the number sixty-five.
score equals ninety-five. The value in score's four bytes is OVERWRITTEN. The old zero? Gone.
printf. The format string is parsed. Each specifier is matched to an argument in order. The substitutions happen. The formatted string is sent to standard output.
Return zero. The stack frame is destroyed. Every local variable evaporates. The OS takes back the memory.
That's it. That's C. Precise. Deterministic. Unforgiving. Beautiful.`,
};

// Get the right script for a context
function getScript(context, mode = "beginner") {
  const base = CRAZY_SCRIPTS[context] || CRAZY_SCRIPTS["hero2"];
  if (mode === "deep") {
    return `[DEEP DIVE] — ` + base + ` ... And at the hardware level, this maps directly to machine instructions. The compiler translates each of these operations into assembly language — MOV, ADD, SUB — which the CPU executes in nanoseconds. This is why C is still the language of operating systems, embedded firmware, and anything where performance is life or death.`;
  }
  return base;
}

// ─────────────────────────────────────────────────────────────────────────────
// DATA DEFINITIONS
// ─────────────────────────────────────────────────────────────────────────────
const DATA_TYPES = [
  {
    id: "char",
    label: "char",
    bytes: 1,
    color: T.neon,
    range: "-128 to 127",
    desc: "Stores a single character. 1 byte = 8 bits. Internally it's just a small integer mapped to ASCII.",
    why: "Each character in your keyboard has an ASCII code. 'A'=65, 'a'=97, '0'=48. char is just a tiny int.",
    example: "char c = 'A';  // stores 65",
    glowColor: "rgba(0,255,163,0.3)",
    blockSize: 1,
    scriptKey: "datatype_char",
  },
  {
    id: "short",
    label: "short",
    bytes: 2,
    color: T.neon2,
    range: "-32,768 to 32,767",
    desc: "16-bit signed integer. Half the size of int. Used when memory is tight and values are small.",
    why: "Good for sensor data, audio samples, or when storing thousands of small values in an array.",
    example: "short s = 1000;",
    glowColor: "rgba(0,212,255,0.3)",
    blockSize: 2,
    scriptKey: "datatype_short",
  },
  {
    id: "int",
    label: "int",
    bytes: 4,
    color: T.neon4,
    range: "-2.1B to 2.1B",
    desc: "32-bit signed integer. The workhorse of C. Most arithmetic defaults to int.",
    why: "CPU is natively optimized for 32-bit operations. int is the 'natural' size for most counters, indices, and math.",
    example: "int x = 42;",
    glowColor: "rgba(255,179,71,0.3)",
    blockSize: 4,
    scriptKey: "datatype_int",
  },
  {
    id: "float",
    label: "float",
    bytes: 4,
    color: "#FF6FD8",
    range: "~±3.4×10³⁸ (7 digits)",
    desc: "32-bit IEEE 754 floating-point. Can represent fractions but with ~7 decimal digits of precision.",
    why: "The bits are split: 1 sign bit, 8 exponent bits, 23 mantissa bits. That's why 0.1 + 0.2 ≠ 0.3 exactly.",
    example: "float pi = 3.14159f;",
    glowColor: "rgba(255,111,216,0.3)",
    blockSize: 4,
    scriptKey: "datatype_float",
  },
  {
    id: "double",
    label: "double",
    bytes: 8,
    color: T.accent,
    range: "~±1.8×10³⁰⁸ (15 digits)",
    desc: "64-bit IEEE 754 floating-point. Double the precision of float. Default for decimal literals.",
    why: "64 bits: 1 sign + 11 exponent + 52 mantissa. 15+ significant digits. Used in scientific computing.",
    example: "double d = 3.14159265358979;",
    glowColor: "rgba(189,105,255,0.3)",
    blockSize: 8,
    scriptKey: "datatype_double",
  },
  {
    id: "long",
    label: "long long",
    bytes: 8,
    color: T.neon3,
    range: "-9.2×10¹⁸ to 9.2×10¹⁸",
    desc: "64-bit signed integer. For very large whole numbers. Use when int overflows.",
    why: "int max is ~2.1 billion. A 64-bit long long holds 9.2 quintillion. Never overflow a counter again.",
    example: "long long big = 9000000000LL;",
    glowColor: "rgba(255,107,107,0.3)",
    blockSize: 8,
    scriptKey: "datatype_long",
  },
];

const FORMAT_SPECIFIERS = [
  { spec: "%d", type: "int", label: "Signed Integer", color: T.neon4, example: 42, output: "42" },
  { spec: "%f", type: "float", label: "Float (6 decimal places)", color: "#FF6FD8", example: 3.14, output: "3.140000" },
  { spec: "%.2f", type: "float", label: "Float (2 decimal places)", color: "#FF6FD8", example: 3.14159, output: "3.14" },
  { spec: "%c", type: "char", label: "Character", color: T.neon, example: 65, output: "A" },
  { spec: "%s", type: "string", label: "String", color: T.neon2, example: '"Hello"', output: "Hello" },
  { spec: "%x", type: "int", label: "Hexadecimal", color: T.accent, example: 255, output: "ff" },
  { spec: "%o", type: "int", label: "Octal", color: T.neon3, example: 8, output: "10" },
  { spec: "%p", type: "pointer", label: "Pointer Address", color: T.muted, example: "&x", output: "0x7ffd..." },
];

const NAV_ITEMS = [
  { id: "hero2",      label: "OVERVIEW",   num: "00", icon: "◎" },
  { id: "datatypes",  label: "DATA TYPES", num: "01", icon: "🧊" },
  { id: "variables",  label: "VARIABLES",  num: "02", icon: "📦" },
  { id: "io",         label: "I/O ENGINE", num: "03", icon: "⌨️" },
  { id: "formatspec", label: "FORMAT %",   num: "04", icon: "🔣" },
  { id: "stepexec",   label: "EXECUTION",  num: "05", icon: "▶" },
];

const DEEP_INSIGHTS_BY_SECTION = {
  hero2: [
    { icon: "🧠", title: "Memory is Just Bytes", body: "Everything in C — chars, ints, floats — is ultimately just bytes in RAM. The type tells the compiler how to interpret those bytes.", color: T.neon },
    { icon: "📐", title: "Type = Interpretation Rule", body: "The same 4 bytes that hold int 1078523331 also represent float 3.14 when cast. Type is just a lens over raw memory.", color: T.neon2 },
    { icon: "⚡", title: "Stack vs Heap", body: "Local variables live on the stack — ultra-fast, auto-freed. malloc() gives heap memory — persistent, manual. Most beginners only use the stack.", color: T.neon4 },
  ],
  datatypes: [
    { icon: "🔢", title: "Byte = 8 Bits", body: "A byte holds values 0–255 (unsigned) or -128 to 127 (signed). All data types are multiples of 1 byte.", color: T.neon },
    { icon: "💥", title: "Integer Overflow", body: "int max is 2,147,483,647. Add 1 and you get -2,147,483,648. This wraps silently — one of C's most dangerous behaviors.", color: T.neon3 },
    { icon: "🤔", title: "Why int vs float?", body: "Integers are exact. Floats are approximations. int 5 is exactly 5. float 5.0f might be 4.9999997 internally. Never use float for money.", color: T.neon4 },
    { icon: "📏", title: "Always Use sizeof()", body: "sizeof(int) is 4 on most systems but NOT guaranteed. sizeof() asks the compiler at compile time — always use it instead of hardcoding sizes.", color: T.accent },
  ],
  variables: [
    { icon: "📦", title: "Variable = Named Memory", body: "int x = 5 asks the OS for 4 bytes of stack space, names them 'x', and stores the value 5 there. The name is erased at compile time — it becomes an address.", color: T.neon2 },
    { icon: "🔒", title: "const ≠ immutable in C", body: "const tells the COMPILER to warn on reassignment, but you can still bypass it with pointers. It's a contract, not a hardware lock.", color: T.neon3 },
    { icon: "🕳️", title: "Uninitialized = Garbage", body: "int x; declares x but gives it whatever bytes were in that memory location. Reading uninitialized memory is undefined behavior.", color: T.neon4 },
    { icon: "🏠", title: "Variable Scope", body: "Variables live inside their { } block. Once you exit the block, the variable is gone. A variable in main() is invisible inside a function.", color: T.neon },
  ],
  io: [
    { icon: "📺", title: "stdout is Buffered", body: "printf doesn't always write immediately. Output is buffered for performance. Use fflush(stdout) or \\n to force a flush.", color: T.neon },
    { icon: "⚠️", title: "scanf & is Mandatory", body: "scanf needs the ADDRESS of the variable to store input. scanf(\"%d\", x) is wrong — it passes the value. scanf(\"%d\", &x) passes the address.", color: T.neon3 },
    { icon: "🛡️", title: "Buffer Overflow Risk", body: "scanf(\"%s\", str) has no bounds check. If input is longer than str[], it overwrites adjacent memory. Use scanf(\"%19s\", str) to limit.", color: T.neon4 },
    { icon: "↩️", title: "Return Value of scanf", body: "scanf returns the number of items successfully read. Always check it: if (scanf(\"%d\", &x) != 1) — error handling 101.", color: T.accent },
  ],
  formatspec: [
    { icon: "🔣", title: "Format String = Template", body: "printf(\"Value: %d\", x) — the format string is parsed left-to-right. Each % starts a conversion specifier. Values fill them in order.", color: T.neon },
    { icon: "💥", title: "Type Mismatch = Crash", body: "printf(\"%d\", 3.14f) reads 4 bytes of float as if they were int. The output is garbage — and in some cases, it corrupts the stack.", color: T.neon3 },
    { icon: "🎯", title: "Width & Precision", body: "printf(\"%10d\", 42) right-aligns 42 in 10 chars. printf(\"%.3f\", 3.14159) rounds to 3 decimal places. printf(\"%010d\", 42) zero-pads.", color: T.neon4 },
    { icon: "🔍", title: "Scanf is Stricter", body: "In scanf, %d skips whitespace before matching. %c does NOT skip whitespace — it reads the next character including newlines.", color: T.neon2 },
  ],
  stepexec: [
    { icon: "📋", title: "Declaration vs Definition", body: "int x; is a declaration (reserves memory). int x = 5; is a definition (reserves + initializes). In C, declaration without init leaves garbage.", color: T.neon },
    { icon: "🔄", title: "Assignment Creates a Copy", body: "int y = x; copies the VALUE of x into y. Changing y later does NOT change x. They're separate boxes in memory.", color: T.neon2 },
    { icon: "⏱️", title: "Execution is Sequential", body: "C runs top-to-bottom, one statement at a time. No magic concurrency. int x = 5; int y = x + 1; — x is definitely 5 when y is calculated.", color: T.neon4 },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// THREE.JS COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
function ParticleField() {
  const mesh = useRef();
  const positions = useMemo(() => {
    const arr = new Float32Array(4000 * 3);
    for (let i = 0; i < 4000; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 45;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 30;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 30;
    }
    return arr;
  }, []);
  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.y = state.clock.elapsedTime * 0.02;
      mesh.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.01) * 0.05;
    }
  });
  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.04} color="#00FFA3" transparent opacity={0.4} sizeAttenuation />
    </points>
  );
}

function GlowOrb() {
  const mesh = useRef();
  useFrame((state) => {
    if (mesh.current) {
      mesh.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.5;
      mesh.current.rotation.z = state.clock.elapsedTime * 0.15;
    }
  });
  return (
    <Float speed={1.5} rotationIntensity={0.4} floatIntensity={0.8}>
      <mesh ref={mesh} position={[2.5, 0, -3.5]}>
        <sphereGeometry args={[1.4, 64, 64]} />
        <MeshDistortMaterial color="#00FFA3" distort={0.5} speed={2} transparent opacity={0.06} wireframe />
      </mesh>
    </Float>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SHARED COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
function GlassCard({ children, style = {}, hover = true, glowColor = T.neon, ...props }) {
  return (
    <motion.div
      whileHover={hover ? { scale: 1.003, borderColor: `${glowColor}50`, boxShadow: `0 12px 40px rgba(0,0,0,0.4), 0 0 28px ${glowColor}18` } : {}}
      transition={{ type: "spring", stiffness: 280, damping: 28 }}
      style={{
        background: T.glass,
        border: `1px solid ${T.border}`,
        borderRadius: 16,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        boxShadow: "0 6px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)",
        ...style,
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

function Section({ id, children, style = {} }) {
  return (
    <section id={id} style={{ padding: "80px 0", borderBottom: `1px solid ${T.dim}`, ...style }}>
      {children}
    </section>
  );
}

function SectionHeader({ num, tag, title }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -24 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      style={{ display: "flex", alignItems: "flex-end", gap: 18, marginBottom: 42 }}
    >
      <span style={{ fontFamily: T.mono, fontSize: 64, fontWeight: 700, color: T.dim, lineHeight: 1, letterSpacing: -4 }}>{num}</span>
      <div>
        <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 5, color: T.neon, fontWeight: 500, marginBottom: 6 }}>{tag}</div>
        <h2 style={{ fontFamily: T.display, fontSize: 32, fontWeight: 800, color: T.text, letterSpacing: -0.5, lineHeight: 1 }}>{title}</h2>
      </div>
    </motion.div>
  );
}

function NeonTag({ children, color = T.neon }) {
  return (
    <span style={{
      fontFamily: T.mono, fontSize: 9, letterSpacing: 2, fontWeight: 700, color,
      background: `${color}14`, border: `1px solid ${color}28`, padding: "2px 8px", borderRadius: 4,
    }}>
      {children}
    </span>
  );
}

function ScanLine() {
  return (
    <motion.div
      animate={{ y: ["-100%", "200%"] }}
      transition={{ duration: 4, repeat: Infinity, ease: "linear", repeatDelay: 1.5 }}
      style={{
        position: "absolute", left: 0, right: 0, height: 1,
        background: `linear-gradient(90deg, transparent, ${T.neon}40, transparent)`,
        pointerEvents: "none", zIndex: 0,
      }}
    />
  );
}

// ★ Premium Voice Button — reusable component
function VoiceButton({ id, label = "🎙 EXPLAIN", text, mode = "beginner", voice }) {
  const isActive = voice.speakingId === id && voice.speaking;
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.04 }}
      onClick={() => isActive ? voice.stop() : voice.speak({ id, text, mode })}
      style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        fontFamily: T.mono, fontSize: 9, letterSpacing: 2, fontWeight: 700,
        color: isActive ? "#000" : T.neon4,
        background: isActive
          ? `linear-gradient(135deg, ${T.neon4}, ${T.neon})`
          : "transparent",
        border: `1px solid ${isActive ? T.neon4 : T.dim}`,
        borderRadius: 6, padding: "7px 16px", cursor: "pointer",
        transition: "all 0.2s",
        boxShadow: isActive ? `0 0 24px ${T.neon4}60` : "none",
      }}
    >
      {isActive ? (
        <>
          <motion.span
            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 0.6, repeat: Infinity }}
            style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "#000" }}
          />
          SPEAKING… (STOP)
        </>
      ) : (
        <>🎙 {label}</>
      )}
    </motion.button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 0: HERO
// ─────────────────────────────────────────────────────────────────────────────
function Hero2({ voice }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick(x => x + 1), 90);
    return () => clearInterval(t);
  }, []);

  const binaryChars = useMemo(() => Array.from({ length: 500 }, () => Math.round(Math.random())).join(""), []);

  const pills = [
    { label: "DATA TYPES", color: T.neon, icon: "🧊" },
    { label: "VARIABLES", color: T.neon2, icon: "📦" },
    { label: "CONSTANTS", color: T.neon4, icon: "🔒" },
    { label: "printf / scanf", color: T.accent, icon: "⌨️" },
  ];

  return (
    <section id="hero2" style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      position: "relative", overflow: "hidden",
      background: `
        radial-gradient(ellipse 90% 60% at 50% -10%, rgba(0,255,163,0.08) 0%, transparent 65%),
        radial-gradient(ellipse 50% 30% at 90% 60%, rgba(0,212,255,0.06) 0%, transparent 60%),
        radial-gradient(ellipse 40% 25% at 10% 80%, rgba(189,105,255,0.05) 0%, transparent 60%),
        ${T.bg}
      `,
    }}>
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
          <Suspense fallback={null}>
            <ParticleField />
            <GlowOrb />
            <Stars radius={140} depth={70} count={1800} factor={3} saturation={0} fade speed={0.5} />
          </Suspense>
        </Canvas>
      </div>
      <div style={{
        position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
        backgroundImage: `linear-gradient(rgba(0,255,163,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,163,0.02) 1px, transparent 1px)`,
        backgroundSize: "56px 56px",
      }} />
      <div style={{ position: "absolute", inset: 0, zIndex: 1, overflow: "hidden", pointerEvents: "none" }}>
        <ScanLine />
      </div>
      <div style={{ position: "absolute", inset: 0, zIndex: 1, overflow: "hidden", pointerEvents: "none", opacity: 0.045 }}>
        <div style={{ fontFamily: T.mono, fontSize: 10, color: T.neon, wordBreak: "break-all", lineHeight: 1.9, padding: "0 24px", animation: "scrollUp 28s linear infinite" }}>
          {binaryChars.repeat(10)}
        </div>
      </div>

      <div style={{ position: "relative", zIndex: 10, textAlign: "center", maxWidth: 860, padding: "0 24px" }}>
        <motion.div
          initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }}
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            fontFamily: T.mono, fontSize: 9, letterSpacing: 5, color: T.neon,
            border: `1px solid ${T.border}`, background: "rgba(0,255,163,0.05)",
            padding: "8px 22px", borderRadius: 100, marginBottom: 34,
          }}
        >
          <motion.span animate={{ opacity: [1, 0.2, 1], scale: [1, 0.7, 1] }} transition={{ duration: 1.2, repeat: Infinity }}
            style={{ width: 6, height: 6, borderRadius: "50%", background: T.neon, display: "inline-block" }} />
          C FUNDAMENTALS — CHAPTER 2
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 36 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          style={{ fontFamily: T.display, fontWeight: 800, fontSize: "clamp(52px, 10vw, 110px)", lineHeight: 0.92, letterSpacing: -4, color: T.text, marginBottom: 24 }}
        >
          <motion.span animate={{ textShadow: [`0 0 70px ${T.neon}80, 0 0 140px ${T.neon}20`, `0 0 90px ${T.neon}A0, 0 0 180px ${T.neon}30`, `0 0 70px ${T.neon}80, 0 0 140px ${T.neon}20`] }} transition={{ duration: 2.5, repeat: Infinity }} style={{ color: T.neon }}>
            Memory
          </motion.span>
          {" & "}
          <span style={{ color: T.neon2 }}>Data</span>
          <br />
          <span style={{ color: T.muted, fontSize: "0.34em", letterSpacing: 9, fontWeight: 400, fontFamily: T.mono }}>
            C programming
          </span>
        </motion.h1>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          style={{ fontFamily: T.mono, fontSize: 14, color: T.neon2, letterSpacing: 1, marginBottom: 28 }}>
          visualize how C stores, names, and moves data through memory
        </motion.p>

        {/* Hero voice button */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.75 }}
          style={{ marginBottom: 30 }}>
          <VoiceButton
            id="hero2"
            label="PLAY CHAPTER INTRO"
            text={getScript("hero2")}
            voice={voice}
          />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.7 }}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, flexWrap: "wrap", marginBottom: 42 }}>
          {pills.map((p, i) => (
            <motion.div key={p.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 + i * 0.1 }}
              whileHover={{ y: -5, boxShadow: `0 10px 35px ${p.color}40` }}
              style={{
                background: `${p.color}10`, border: `1px solid ${p.color}40`, borderRadius: 12,
                padding: "14px 24px", textAlign: "center",
              }}>
              <div style={{ fontSize: 26, marginBottom: 6 }}>{p.icon}</div>
              <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 2, color: p.color, fontWeight: 700 }}>{p.label}</div>
            </motion.div>
          ))}
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }}
          whileHover={{ scale: 1.06, boxShadow: `0 0 60px ${T.neon}70` }}
          whileTap={{ scale: 0.96 }}
          onClick={() => document.getElementById("datatypes")?.scrollIntoView({ behavior: "smooth" })}
          style={{
            fontFamily: T.display, fontWeight: 700, fontSize: 12, letterSpacing: 4,
            color: "#000", background: `linear-gradient(135deg, ${T.neon}, ${T.neon2})`,
            border: "none", borderRadius: 8, padding: "16px 48px", cursor: "pointer",
          }}
        >
          ENTER SIMULATION
        </motion.button>
      </div>

      <motion.div animate={{ y: [0, 9, 0] }} transition={{ duration: 2.2, repeat: Infinity }}
        style={{ position: "absolute", bottom: 30, zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, fontFamily: T.mono, fontSize: 8, letterSpacing: 5, color: T.muted }}>
        SCROLL
        <svg width="14" height="22" viewBox="0 0 14 22">
          <rect x="5" y="3" width="4" height="7" rx="2" stroke={T.muted} strokeWidth="1.2" fill="none" />
          <motion.rect animate={{ y: [0, 5, 0], opacity: [1, 0, 1] }} transition={{ duration: 1.8, repeat: Infinity }} x="5.5" y="4" width="3" height="2" rx="1" fill={T.neon} />
          <line x1="7" y1="14" x2="7" y2="20" stroke={T.muted} strokeWidth="1.2" strokeLinecap="round" />
          <polyline points="4,17 7,20 10,17" stroke={T.muted} strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </motion.div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 1: DATA TYPES
// ─────────────────────────────────────────────────────────────────────────────
function MemoryGrid3D({ selectedType, showBinary, overflowDemo }) {
  const groupRef = useRef();
  const [time, setTime] = useState(0);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.15;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.08;
    }
    setTime(state.clock.elapsedTime);
  });

  const dt = selectedType ? DATA_TYPES.find(d => d.id === selectedType) : null;

  return (
    <group ref={groupRef}>
      {Array.from({ length: 16 }).map((_, i) => {
        const col = i % 8;
        const row = Math.floor(i / 8);
        const x = (col - 3.5) * 0.55;
        const y = (row - 0.5) * 0.55;

        const isActive = dt && i < dt.bytes;
        const isOverflow = overflowDemo && i === dt?.bytes;

        const baseColor = isOverflow
          ? new THREE.Color(T.neon3)
          : isActive
            ? new THREE.Color(dt.color)
            : new THREE.Color(T.dim);

        return (
          <mesh key={i} position={[x, y, 0]}>
            <boxGeometry args={[0.44, 0.44, isActive ? 0.44 + Math.sin(time * 2 + i) * 0.08 : 0.2]} />
            <meshStandardMaterial
              color={baseColor}
              emissive={baseColor}
              emissiveIntensity={isActive ? (overflowDemo && i === dt?.bytes - 1 ? 1.6 : 0.7 + Math.sin(time * 3 + i) * 0.3) : 0.05}
              transparent
              opacity={isActive ? 0.95 : 0.2}
              wireframe={showBinary && isActive}
            />
          </mesh>
        );
      })}
      <ambientLight intensity={0.3} />
      <pointLight position={[3, 3, 3]} intensity={1.5} color={dt ? dt.color : T.neon} />
      <pointLight position={[-3, -3, 2]} intensity={0.8} color={T.neon2} />
    </group>
  );
}

function DataTypesSection({ voice }) {
  const [selectedType, setSelectedType] = useState("int");
  const [inputValue, setInputValue] = useState("42");
  const [showBinary, setShowBinary] = useState(false);
  const [overflowDemo, setOverflowDemo] = useState(false);

  const dt = DATA_TYPES.find(d => d.id === selectedType);

  const toBinary = (val, bytes) => {
    const n = parseInt(val) || 0;
    const bits = bytes * 8;
    const bin = ((n >>> 0) >>> 0).toString(2).padStart(bits, "0");
    return bin.match(/.{1,8}/g)?.join(" ") || bin;
  };

  const isOverflow = useMemo(() => {
    const n = parseInt(inputValue) || 0;
    if (!dt) return false;
    if (dt.id === "char") return n > 127 || n < -128;
    if (dt.id === "short") return n > 32767 || n < -32768;
    if (dt.id === "int") return n > 2147483647 || n < -2147483648;
    return false;
  }, [inputValue, dt]);

  return (
    <Section id="datatypes">
      <SectionHeader num="01" tag="MEMORY SIM · DATA TYPES" title="3D Memory Allocation Engine" />

      <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 24, marginBottom: 28 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 3, color: T.muted, marginBottom: 6 }}>SELECT TYPE</div>
          {DATA_TYPES.map(type => (
            <motion.button
              key={type.id}
              whileHover={{ x: 5 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => { setSelectedType(type.id); setOverflowDemo(false); }}
              style={{
                background: selectedType === type.id ? `${type.color}18` : "rgba(255,255,255,0.02)",
                border: `1px solid ${selectedType === type.id ? type.color : T.dim}`,
                borderRadius: 10, padding: "12px 16px",
                fontFamily: T.mono, fontSize: 12, fontWeight: 700,
                color: selectedType === type.id ? type.color : T.muted,
                cursor: "pointer", textAlign: "left",
                display: "flex", justifyContent: "space-between", alignItems: "center",
                transition: "all 0.18s",
              }}
            >
              <span>{type.label}</span>
              <span style={{ fontSize: 9, opacity: 0.7 }}>{type.bytes}B</span>
            </motion.button>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <GlassCard style={{ height: 300, overflow: "hidden", position: "relative" }} hover={false}>
            <Canvas camera={{ position: [0, 0, 5], fov: 55 }}>
              <Suspense fallback={null}>
                <MemoryGrid3D selectedType={selectedType} showBinary={showBinary} overflowDemo={overflowDemo || isOverflow} />
              </Suspense>
            </Canvas>
            <div style={{ position: "absolute", top: 16, left: 16, fontFamily: T.mono }}>
              <motion.div
                key={selectedType}
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                style={{ display: "flex", alignItems: "center", gap: 10 }}
              >
                <div style={{ width: 10, height: 10, borderRadius: 3, background: dt?.color }} />
                <span style={{ fontSize: 12, color: dt?.color, fontWeight: 700 }}>{dt?.label}</span>
                <span style={{ fontSize: 10, color: T.muted }}>{dt?.bytes} byte{dt?.bytes !== 1 ? "s" : ""} = {(dt?.bytes || 0) * 8} bits</span>
              </motion.div>
            </div>
            <div style={{ position: "absolute", top: 16, right: 16, display: "flex", gap: 10 }}>
              <motion.button whileTap={{ scale: 0.95 }}
                onClick={() => setShowBinary(!showBinary)}
                style={{
                  fontFamily: T.mono, fontSize: 8, letterSpacing: 2,
                  color: showBinary ? "#000" : T.neon2, background: showBinary ? T.neon2 : "rgba(0,0,0,0.6)",
                  border: `1px solid ${showBinary ? T.neon2 : T.dim}`, borderRadius: 5,
                  padding: "5px 12px", cursor: "pointer",
                }}>
                {showBinary ? "⬛ BINARY" : "◻ BINARY"}
              </motion.button>
            </div>
            <div style={{ position: "absolute", bottom: 16, left: 16, right: 16, display: "flex", gap: 4, alignItems: "center" }}>
              {Array.from({ length: dt?.bytes || 0 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
                  transition={{ delay: i * 0.06, type: "spring", stiffness: 300 }}
                  style={{
                    flex: 1, height: 24, borderRadius: 4,
                    background: `${dt?.color}70`,
                    border: `1px solid ${dt?.color}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <span style={{ fontFamily: T.mono, fontSize: 8, color: dt?.color }}>byte</span>
                </motion.div>
              ))}
              {Array.from({ length: 8 - (dt?.bytes || 0) }).map((_, i) => (
                <div key={`empty-${i}`} style={{ flex: 1, height: 24, borderRadius: 4, background: T.dim, border: `1px solid ${T.dim}` }} />
              ))}
              <span style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, marginLeft: 8, whiteSpace: "nowrap" }}>of 8 max</span>
            </div>
          </GlassCard>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
            <GlassCard style={{ padding: 18 }} hover={false}>
              <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 3, color: T.muted, marginBottom: 10 }}>ENTER VALUE</div>
              <input
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                style={{
                  width: "100%", fontFamily: T.mono, fontSize: 15, fontWeight: 700,
                  color: isOverflow ? T.neon3 : dt?.color,
                  background: "transparent", border: "none", outline: "none",
                  borderBottom: `2px solid ${isOverflow ? T.neon3 : (dt?.color || T.dim)}`,
                  paddingBottom: 6, marginBottom: 10,
                }}
              />
              <div style={{ fontFamily: T.mono, fontSize: 10, color: T.muted }}>Range: {dt?.range}</div>
              <AnimatePresence>
                {isOverflow && (
                  <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    style={{ marginTop: 10, fontFamily: T.mono, fontSize: 11, color: T.neon3 }}>
                    ⚠ OVERFLOW — value exceeds {dt?.label} range!
                  </motion.div>
                )}
              </AnimatePresence>
            </GlassCard>

            <GlassCard style={{ padding: 18 }} hover={false}>
              <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 3, color: T.muted, marginBottom: 10 }}>BINARY VIEW</div>
              <div style={{ fontFamily: T.mono, fontSize: 11, color: T.neon2, wordBreak: "break-all", lineHeight: 1.8 }}>
                {showBinary ? toBinary(inputValue, dt?.bytes || 4) : <span style={{ color: T.muted }}>Toggle binary mode ↑</span>}
              </div>
            </GlassCard>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={selectedType} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
          <GlassCard style={{ padding: 28, borderColor: `${dt?.color}30` }} hover={false}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24 }}>
              <div>
                <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 3, color: dt?.color, marginBottom: 10 }}>WHAT IT IS</div>
                <div style={{ fontFamily: T.mono, fontSize: 12, color: T.text, lineHeight: 1.8 }}>{dt?.desc}</div>
              </div>
              <div>
                <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 3, color: dt?.color, marginBottom: 10 }}>WHY IT WORKS THIS WAY</div>
                <div style={{ fontFamily: T.mono, fontSize: 12, color: T.text, lineHeight: 1.8 }}>{dt?.why}</div>
              </div>
              <div>
                <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 3, color: dt?.color, marginBottom: 10 }}>EXAMPLE CODE</div>
                <div style={{ fontFamily: T.mono, fontSize: 13, color: "#C3E88D", background: "rgba(0,0,0,0.5)", borderRadius: 8, padding: "12px 16px", lineHeight: 1.7, marginBottom: 12 }}>
                  {dt?.example}
                </div>
                <VoiceButton
                  id={`dt-${selectedType}`}
                  label="EXPLAIN THIS TYPE"
                  text={getScript(dt?.scriptKey || "datatype_int")}
                  voice={voice}
                />
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </AnimatePresence>

      <div style={{ marginTop: 28 }}>
        <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 4, color: T.muted, marginBottom: 16 }}>SIZE COMPARISON (relative byte width)</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {DATA_TYPES.map(type => (
            <div key={type.id} style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ fontFamily: T.mono, fontSize: 12, fontWeight: 700, color: type.color, minWidth: 80 }}>{type.label}</span>
              <div style={{ flex: 1, height: 24, background: T.dim, borderRadius: 6, overflow: "hidden", position: "relative" }}>
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${(type.bytes / 8) * 100}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, delay: DATA_TYPES.indexOf(type) * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    height: "100%", borderRadius: 6,
                    background: selectedType === type.id
                      ? `linear-gradient(90deg, ${type.color}CC, ${type.color})`
                      : `${type.color}50`,
                    boxShadow: selectedType === type.id ? `0 0 15px ${type.color}90` : "none",
                    cursor: "pointer",
                  }}
                  onClick={() => setSelectedType(type.id)}
                />
              </div>
              <span style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, minWidth: 60 }}>{type.bytes} byte{type.bytes !== 1 ? "s" : ""}</span>
              <span style={{ fontFamily: T.mono, fontSize: 9, color: T.dim }}>{type.bytes * 8} bits</span>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 2: VARIABLES & CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
function VariablesSection({ voice }) {
  const [containers, setContainers] = useState([]);
  const [newName, setNewName] = useState("");
  const [newValue, setNewValue] = useState("");
  const [isConst, setIsConst] = useState(false);
  const [shakingId, setShakingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [error, setError] = useState("");
  const [memBase] = useState(0xFF10);

  const addContainer = () => {
    if (!newName.trim()) return;
    if (!/^[a-zA-Z_]\w*$/.test(newName)) { setError("Invalid identifier: must start with letter or _"); return; }
    setContainers(prev => [...prev, {
      id: Date.now(),
      name: newName.trim(),
      value: newValue || "0",
      isConst,
      address: `0x${(memBase + prev.length * 4).toString(16).toUpperCase()}`,
      type: isNaN(newValue) ? "char*" : (newValue.includes(".") ? "float" : "int"),
    }]);
    setNewName(""); setNewValue(""); setError("");
  };

  const tryEdit = (container) => {
    if (container.isConst) {
      setShakingId(container.id);
      setError(`❌ Cannot modify const '${container.name}' — it's read-only!`);
      setTimeout(() => { setShakingId(null); setError(""); }, 1200);
    } else {
      setEditingId(container.id);
      setEditValue(container.value);
    }
  };

  const commitEdit = (id) => {
    setContainers(prev => prev.map(c => c.id === id ? { ...c, value: editValue } : c));
    setEditingId(null);
  };

  const getContainerScript = (c) =>
    c.isConst
      ? `${c.name} is a constant with value ${c.value}. Once set, it cannot change. The compiler enforces this at compile time — any attempt to reassign it will cause a compilation error and refuse to build your program. Constants are promises. To the compiler, to your team, and to yourself.`
      : `${c.name} is a variable of type ${c.type}, currently holding the value ${c.value}, stored at memory address ${c.address}. This is a real location in your computer's RAM. Four bytes. Right now, those four bytes contain the bit pattern representing ${c.value}. You can change it at any time — just assign a new value, and those bytes get overwritten.`;

  return (
    <Section id="variables">
      <SectionHeader num="02" tag="STATE MACHINE · VARIABLES & CONSTANTS" title="Named Memory Containers" />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 28 }}>
        <div>
          <GlassCard style={{ padding: 24, marginBottom: 20 }} hover={false}>
            <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 4, color: T.neon, fontWeight: 700, marginBottom: 20 }}>CREATE NEW VARIABLE</div>

            <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: T.mono, fontSize: 8, color: T.muted, marginBottom: 6 }}>NAME</div>
                <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. age"
                  onKeyDown={e => e.key === "Enter" && addContainer()}
                  style={{ width: "100%", fontFamily: T.mono, fontSize: 14, color: T.neon2, background: "rgba(0,0,0,0.4)", border: `1px solid ${T.dim}`, borderRadius: 8, padding: "10px 14px", outline: "none" }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: T.mono, fontSize: 8, color: T.muted, marginBottom: 6 }}>VALUE</div>
                <input value={newValue} onChange={e => setNewValue(e.target.value)} placeholder="e.g. 25"
                  onKeyDown={e => e.key === "Enter" && addContainer()}
                  style={{ width: "100%", fontFamily: T.mono, fontSize: 14, color: T.neon4, background: "rgba(0,0,0,0.4)", border: `1px solid ${T.dim}`, borderRadius: 8, padding: "10px 14px", outline: "none" }} />
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
              <motion.button whileTap={{ scale: 0.95 }}
                onClick={() => setIsConst(!isConst)}
                style={{
                  fontFamily: T.mono, fontSize: 9, letterSpacing: 2, fontWeight: 700,
                  color: isConst ? "#000" : T.neon4, padding: "7px 16px",
                  background: isConst ? T.neon4 : "transparent",
                  border: `1px solid ${isConst ? T.neon4 : T.dim}`, borderRadius: 6, cursor: "pointer",
                }}>
                {isConst ? "🔒 const" : "📦 variable"}
              </motion.button>
              <span style={{ fontFamily: T.mono, fontSize: 10, color: T.muted }}>
                {isConst ? "Read-only after init" : "Can be reassigned"}
              </span>
            </div>

            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={addContainer}
              style={{
                width: "100%", fontFamily: T.display, fontWeight: 700, fontSize: 12, letterSpacing: 3,
                color: "#000", background: `linear-gradient(135deg, ${T.neon}, ${T.neon2})`,
                border: "none", borderRadius: 8, padding: "14px", cursor: "pointer",
              }}>
              + ALLOCATE MEMORY
            </motion.button>

            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{ marginTop: 12, fontFamily: T.mono, fontSize: 11, color: T.neon3, background: `${T.neon3}10`, border: `1px solid ${T.neon3}30`, borderRadius: 8, padding: "10px 14px" }}>
                  {error}
                </motion.div>
              )}
            </AnimatePresence>
          </GlassCard>

          <GlassCard style={{ padding: 20, marginBottom: 16 }} hover={false}>
            <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 4, color: T.neon2, fontWeight: 700, marginBottom: 14 }}>HOW IT WORKS</div>
            {[
              { step: "1", text: "int x = 5; reserves 4 bytes on the stack", color: T.neon },
              { step: "2", text: "The name 'x' is erased at compile time → becomes an address", color: T.neon2 },
              { step: "3", text: "x = 10; writes value 10 to that address", color: T.neon4 },
              { step: "const", text: "const blocks the compiler from allowing reassignment", color: T.neon3 },
            ].map(item => (
              <div key={item.step} style={{ display: "flex", gap: 12, marginBottom: 12, alignItems: "flex-start" }}>
                <div style={{ background: `${item.color}20`, border: `1px solid ${item.color}50`, borderRadius: 5, padding: "3px 8px", fontFamily: T.mono, fontSize: 9, color: item.color, flexShrink: 0, fontWeight: 700 }}>{item.step}</div>
                <div style={{ fontFamily: T.mono, fontSize: 11, color: T.text, lineHeight: 1.7 }}>{item.text}</div>
              </div>
            ))}
          </GlassCard>

          {/* Section-level voice button */}
          <VoiceButton
            id="variables-section"
            label="EXPLAIN VARIABLES & CONSTANTS"
            text={getScript("variables")}
            voice={voice}
          />
        </div>

        <div>
          <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 4, color: T.muted, marginBottom: 12 }}>STACK MEMORY — LIVE VIEW</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, minHeight: 220 }}>
            <AnimatePresence>
              {containers.length === 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  style={{ fontFamily: T.mono, fontSize: 12, color: T.dim, textAlign: "center", padding: 48, border: `1px dashed ${T.dim}`, borderRadius: 12 }}>
                  No variables yet.<br />Create one above ↑
                </motion.div>
              )}
              {containers.map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, x: 30, scale: 0.95 }}
                  animate={{
                    opacity: 1, x: 0, scale: 1,
                    ...(shakingId === c.id ? { x: [0, -8, 8, -8, 8, 0] } : {}),
                  }}
                  exit={{ opacity: 0, x: -30, scale: 0.95 }}
                  transition={shakingId === c.id ? { duration: 0.4, times: [0, 0.2, 0.4, 0.6, 0.8, 1] } : { type: "spring", stiffness: 280, damping: 26 }}
                  style={{
                    background: c.isConst ? `${T.neon4}0C` : `${T.neon2}0A`,
                    border: `1px solid ${shakingId === c.id ? T.neon3 : (c.isConst ? `${T.neon4}50` : `${T.neon2}40`)}`,
                    borderRadius: 12, padding: "16px 18px",
                    boxShadow: shakingId === c.id ? `0 0 24px ${T.neon3}60` : "none",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                    <span style={{ fontSize: 20 }}>{c.isConst ? "🔒" : "📦"}</span>
                    <div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <span style={{ fontFamily: T.mono, fontWeight: 700, fontSize: 15, color: c.isConst ? T.neon4 : T.neon2 }}>{c.name}</span>
                        <NeonTag color={c.isConst ? T.neon4 : T.neon2}>{c.isConst ? "const" : c.type}</NeonTag>
                      </div>
                      <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted }}>{c.address}</div>
                    </div>

                    <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
                      {editingId === c.id ? (
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} style={{ display: "flex", gap: 8 }}>
                          <input value={editValue} onChange={e => setEditValue(e.target.value)} autoFocus
                            onKeyDown={e => e.key === "Enter" && commitEdit(c.id)}
                            style={{ width: 90, fontFamily: T.mono, fontSize: 14, color: T.neon, background: "rgba(0,0,0,0.6)", border: `1px solid ${T.neon}`, borderRadius: 6, padding: "5px 10px", outline: "none" }} />
                          <motion.button whileTap={{ scale: 0.95 }} onClick={() => commitEdit(c.id)}
                            style={{ fontFamily: T.mono, fontSize: 9, color: "#000", background: T.neon, border: "none", borderRadius: 5, padding: "5px 12px", cursor: "pointer" }}>✓</motion.button>
                        </motion.div>
                      ) : (
                        <motion.div
                          key={c.value}
                          initial={{ scale: 1.3, color: c.isConst ? T.neon4 : T.neon }}
                          animate={{ scale: 1, color: T.text }}
                          style={{ fontFamily: T.mono, fontSize: 22, fontWeight: 700, color: T.text }}
                        >
                          {c.value}
                        </motion.div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 10 }}>
                    <motion.button whileTap={{ scale: 0.95 }} onClick={() => tryEdit(c)}
                      style={{
                        fontFamily: T.mono, fontSize: 8, letterSpacing: 1, color: c.isConst ? T.neon3 : T.neon2,
                        background: "transparent", border: `1px solid ${c.isConst ? T.neon3 + "50" : T.dim}`,
                        borderRadius: 5, padding: "5px 12px", cursor: "pointer",
                      }}>
                      {c.isConst ? "🔒 LOCKED" : "✏️ EDIT"}
                    </motion.button>
                    <VoiceButton
                      id={`var-${c.id}`}
                      label="EXPLAIN"
                      text={getContainerScript(c)}
                      voice={voice}
                    />
                    <motion.button whileTap={{ scale: 0.95 }}
                      onClick={() => setContainers(prev => prev.filter(x => x.id !== c.id))}
                      style={{
                        fontFamily: T.mono, fontSize: 8, letterSpacing: 1, color: T.neon3,
                        background: "transparent", border: `1px solid ${T.neon3}40`,
                        borderRadius: 5, padding: "5px 12px", cursor: "pointer", marginLeft: "auto",
                      }}>
                      FREE
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {containers.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: 18 }}>
              <GlassCard style={{ overflow: "hidden" }} hover={false}>
                <div style={{ background: "rgba(0,0,0,0.5)", borderBottom: `1px solid ${T.dim}`, padding: "10px 16px", fontFamily: T.mono, fontSize: 8, letterSpacing: 3, color: T.neon }}>GENERATED C CODE</div>
                <div style={{ padding: "14px 18px" }}>
                  <pre style={{ fontFamily: T.mono, fontSize: 12, color: T.text, lineHeight: 2 }}>
                    <span style={{ color: T.accent }}>int</span> main() {"{"}
                    {containers.map(c => (
                      <div key={c.id} style={{ paddingLeft: 24 }}>
                        {c.isConst && <span style={{ color: T.neon4 }}>const </span>}
                        <span style={{ color: T.neon2 }}>{c.type}</span>
                        {" "}
                        <span style={{ color: "#C3E88D" }}>{c.name}</span>
                        {" = "}
                        <span style={{ color: T.neon4 }}>{c.value}</span>
                        {";"}
                      </div>
                    ))}
                    {"    "}<span style={{ color: T.neon3 }}>return</span> <span style={{ color: T.neon4 }}>0</span>;
                    {"\n}"}
                  </pre>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </div>
      </div>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 3: printf / scanf
// ─────────────────────────────────────────────────────────────────────────────
function IOSection({ voice }) {
  const [scanfValue, setScanfValue] = useState("");
  const [variable, setVariable] = useState(null);
  const [phase, setPhase] = useState("idle");
  const [formatStr, setFormatStr] = useState("Your score is: %d points!");
  const [displayedOutput, setDisplayedOutput] = useState("");

  const runFlow = async () => {
    if (!scanfValue) return;
    setPhase("scanning");
    setVariable(null);
    setDisplayedOutput("");

    await new Promise(r => setTimeout(r, 600));
    setVariable({ name: "score", value: scanfValue, address: "0xFF10" });
    setPhase("printing");

    await new Promise(r => setTimeout(r, 500));
    const result = formatStr.replace("%d", scanfValue).replace("%f", parseFloat(scanfValue).toFixed(6)).replace("%.2f", parseFloat(scanfValue).toFixed(2)).replace("%s", scanfValue).replace("%c", String.fromCharCode(parseInt(scanfValue) || 65));
    let i = 0;
    const interval = setInterval(() => {
      if (i <= result.length) {
        setDisplayedOutput(result.slice(0, i));
        i++;
      } else {
        clearInterval(interval);
        setPhase("done");
      }
    }, 35);
  };

  const reset = () => {
    setPhase("idle"); setScanfValue(""); setVariable(null); setDisplayedOutput("");
  };

  const phaseColors = { idle: T.muted, scanning: T.neon2, printing: T.neon, done: "#C3E88D" };
  const phaseLabels = { idle: "READY", scanning: "SCANNING INPUT…", printing: "CALLING printf…", done: "COMPLETE" };

  return (
    <Section id="io">
      <SectionHeader num="03" tag="TERMINAL SIM · printf / scanf" title="Input/Output Simulation Engine" />

      <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 32, overflowX: "auto", paddingBottom: 6 }}>
        {[
          { label: "USER INPUT", sub: "keyboard", icon: "⌨️", color: T.neon2 },
          { label: "scanf()", sub: '"%d", &score', icon: "📥", color: T.neon4 },
          { label: "MEMORY", sub: "0xFF10: score", icon: "🧠", color: T.accent },
          { label: "printf()", sub: '"Score: %d"', icon: "📤", color: T.neon },
          { label: "TERMINAL", sub: "stdout", icon: "💻", color: "#C3E88D" },
        ].map((node, i) => (
          <div key={node.label} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
            <motion.div
              animate={
                (phase === "scanning" && i <= 1) ||
                (phase === "printing" && i >= 2) ||
                (phase === "done")
                  ? { borderColor: `${node.color}90`, background: `${node.color}15`, scale: 1.04 }
                  : { borderColor: T.dim, background: "transparent", scale: 1 }
              }
              style={{ border: `1px solid`, borderRadius: 12, padding: "14px 18px", textAlign: "center", minWidth: 110 }}>
              <div style={{ fontSize: 26, marginBottom: 6 }}>{node.icon}</div>
              <div style={{ fontFamily: T.mono, fontSize: 9, fontWeight: 700, letterSpacing: 2, color: node.color }}>{node.label}</div>
              <div style={{ fontFamily: T.mono, fontSize: 8, color: T.muted, marginTop: 3 }}>{node.sub}</div>
            </motion.div>
            {i < 4 && (
              <div style={{ width: 42, position: "relative", height: 2, flexShrink: 0 }}>
                <div style={{ height: 1, width: "100%", background: T.dim }} />
                <motion.div
                  animate={
                    (phase === "scanning" && i < 2) || (phase === "printing" && i >= 2) || phase === "done"
                      ? { x: [0, 34, 0], opacity: 1 }
                      : { opacity: 0 }
                  }
                  transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
                  style={{ position: "absolute", top: "50%", left: 0, transform: "translateY(-50%)", width: 8, height: 8, borderRadius: "50%", background: node.color, boxShadow: `0 0 10px ${node.color}` }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 26 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <GlassCard style={{ overflow: "hidden" }} hover={false}>
            <div style={{ background: "rgba(0,0,0,0.5)", borderBottom: `1px solid ${T.dim}`, padding: "12px 18px", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: phaseColors[phase] }} />
              <span style={{ fontFamily: T.mono, fontSize: 8, color: T.muted }}>io_demo.c</span>
              <span style={{ fontFamily: T.mono, fontSize: 8, color: phaseColors[phase], marginLeft: "auto", letterSpacing: 2 }}>{phaseLabels[phase]}</span>
            </div>
            <div style={{ padding: "18px 20px" }}>
              {[
                { line: '#include <stdio.h>', color: T.accent },
                { line: '', color: T.muted },
                { line: 'int main() {', color: T.neon2 },
                { line: '    int score;', color: T.text },
                { line: '    scanf("%d", &score);', color: phase === "scanning" || phase === "done" ? T.neon4 : T.text, glow: phase === "scanning" },
                { line: '    printf("' + formatStr.replace(/"/g, '\\"') + '", score);', color: phase === "printing" || phase === "done" ? T.neon : T.text, glow: phase === "printing" },
                { line: '    return 0;', color: T.text },
                { line: '}', color: T.neon2 },
              ].map((item, i) => (
                <motion.div key={i}
                  animate={{ background: item.glow ? `${item.color}15` : "transparent", paddingLeft: item.glow ? 26 : 20 }}
                  style={{ fontFamily: T.mono, fontSize: 12, lineHeight: 2, paddingRight: 20, borderLeft: `3px solid ${item.glow ? item.color : "transparent"}`, transition: "border-color 0.2s" }}>
                  <span style={{ color: T.dim, marginRight: 14, fontSize: 10 }}>{i + 1}</span>
                  <span style={{ color: item.color }}>{item.line}</span>
                </motion.div>
              ))}
            </div>
          </GlassCard>

          <GlassCard style={{ padding: 18 }} hover={false}>
            <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 3, color: T.neon, marginBottom: 10 }}>FORMAT STRING (editable)</div>
            <input value={formatStr} onChange={e => setFormatStr(e.target.value)}
              style={{ width: "100%", fontFamily: T.mono, fontSize: 13, color: T.neon2, background: "rgba(0,0,0,0.5)", border: `1px solid ${T.dim}`, borderRadius: 8, padding: "10px 14px", outline: "none" }} />
            <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, marginTop: 8 }}>
              Use %d for int, %f for float, %s for string, %c for char
            </div>
          </GlassCard>

          <VoiceButton
            id="io-section"
            label="EXPLAIN printf & scanf (DEEP)"
            text={getScript("io", "deep")}
            mode="deep"
            voice={voice}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <GlassCard style={{ padding: 20 }} hover={false}>
            <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 3, color: T.neon2, marginBottom: 12 }}>⌨️ USER INPUT (simulates stdin)</div>
            <div style={{ display: "flex", gap: 12 }}>
              <input value={scanfValue} onChange={e => setScanfValue(e.target.value)}
                placeholder="Enter a number…"
                onKeyDown={e => e.key === "Enter" && runFlow()}
                style={{ flex: 1, fontFamily: T.mono, fontSize: 16, fontWeight: 700, color: T.neon2, background: "rgba(0,0,0,0.5)", border: `1px solid ${T.neon2}50`, borderRadius: 8, padding: "12px 16px", outline: "none" }} />
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                onClick={runFlow} disabled={!scanfValue || phase === "scanning" || phase === "printing"}
                style={{
                  fontFamily: T.display, fontWeight: 700, fontSize: 10, letterSpacing: 2, color: "#000",
                  background: T.neon, border: "none", borderRadius: 8, padding: "12px 24px", cursor: "pointer",
                }}>
                RUN
              </motion.button>
              <motion.button whileTap={{ scale: 0.96 }} onClick={reset}
                style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, background: "transparent", border: `1px solid ${T.dim}`, borderRadius: 8, padding: "12px 18px", cursor: "pointer" }}>
                RESET
              </motion.button>
            </div>
          </GlassCard>

          <GlassCard style={{ padding: 20 }} hover={false}>
            <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 3, color: T.accent, marginBottom: 14 }}>🧠 MEMORY STATE</div>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, minWidth: 70 }}>0xFF10</div>
              <div style={{ fontFamily: T.mono, fontSize: 10, color: T.neon2, minWidth: 45 }}>score</div>
              <motion.div
                animate={{ background: variable ? `${T.neon}18` : T.dim, borderColor: variable ? `${T.neon}70` : T.dim }}
                style={{ border: "1px solid", borderRadius: 6, padding: "6px 16px", minWidth: 80, textAlign: "center" }}>
                <motion.span key={variable?.value}
                  initial={{ scale: 1.4, color: T.neon }} animate={{ scale: 1, color: variable ? T.neon : T.dim }}
                  style={{ fontFamily: T.mono, fontSize: 20, fontWeight: 700 }}>
                  {variable ? variable.value : "???"}
                </motion.span>
              </motion.div>
              <div style={{ fontFamily: T.mono, fontSize: 10, color: T.muted }}>int (4 bytes)</div>
            </div>
            {phase === "scanning" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 0.8 }}
                style={{ fontFamily: T.mono, fontSize: 10, color: T.neon2, marginTop: 12 }}>
                ← scanf reading from stdin and writing to &score…
              </motion.div>
            )}
          </GlassCard>

          <GlassCard style={{ overflow: "hidden", flex: 1 }} hover={false}>
            <div style={{ background: "rgba(0,0,0,0.5)", borderBottom: `1px solid ${T.dim}`, padding: "12px 18px", fontFamily: T.mono, fontSize: 8, letterSpacing: 3, color: "#C3E88D" }}>
              💻 TERMINAL OUTPUT (stdout)
            </div>
            <div style={{ padding: "16px 20px", minHeight: 90 }}>
              {displayedOutput ? (
                <div style={{ fontFamily: T.mono, fontSize: 16, color: "#C3E88D", lineHeight: 1.8 }}>
                  <span style={{ color: T.dim, marginRight: 10 }}>$</span>
                  {displayedOutput}
                  {phase !== "done" && (
                    <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.6, repeat: Infinity }}
                      style={{ display: "inline-block", width: 8, height: 16, background: T.neon, verticalAlign: "middle", marginLeft: 3 }} />
                  )}
                </div>
              ) : (
                <div style={{ fontFamily: T.mono, fontSize: 12, color: T.muted }}>
                  {phase === "idle" ? "Awaiting input… enter a value and click RUN" : "Processing…"}
                  {phase === "idle" && (
                    <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ duration: 1.2, repeat: Infinity }}
                      style={{ display: "inline-block", width: 7, height: 14, background: T.muted, verticalAlign: "middle", marginLeft: 5 }} />
                  )}
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 4: FORMAT SPECIFIERS
// ─────────────────────────────────────────────────────────────────────────────
function FormatSpecSection({ voice }) {
  const [selected, setSelected] = useState(FORMAT_SPECIFIERS[0]);
  const [mismatchDemo, setMismatchDemo] = useState(false);
  const [glitching, setGlitching] = useState(false);

  const triggerMismatch = () => {
    setMismatchDemo(true);
    setGlitching(true);
    setTimeout(() => setGlitching(false), 1000);
    setTimeout(() => setMismatchDemo(false), 3000);
  };

  return (
    <Section id="formatspec">
      <SectionHeader num="04" tag="FORMAT SPEC VISUALIZER · %d %f %s %c" title="How Values Are Interpreted" />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
        <div>
          <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 3, color: T.muted, marginBottom: 14 }}>SELECT SPECIFIER</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 22 }}>
            {FORMAT_SPECIFIERS.map(fs => (
              <motion.button
                key={fs.spec}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => { setSelected(fs); setMismatchDemo(false); setGlitching(false); }}
                style={{
                  background: selected.spec === fs.spec ? `${fs.color}18` : "rgba(255,255,255,0.02)",
                  border: `1px solid ${selected.spec === fs.spec ? fs.color : T.dim}`,
                  borderRadius: 10, padding: "14px 16px", cursor: "pointer", textAlign: "left",
                  transition: "all 0.18s",
                }}>
                <div style={{ fontFamily: T.mono, fontSize: 18, fontWeight: 700, color: fs.color, marginBottom: 4 }}>{fs.spec}</div>
                <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted }}>{fs.label}</div>
                <div style={{ fontFamily: T.mono, fontSize: 9, color: T.text, marginTop: 5 }}>→ {fs.output}</div>
              </motion.button>
            ))}
          </div>

          <GlassCard style={{ padding: 20, marginBottom: 16 }} hover={false}>
            <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 3, color: T.neon3, marginBottom: 12 }}>⚠ TYPE MISMATCH DEMO</div>
            <div style={{ fontFamily: T.mono, fontSize: 11, color: T.text, lineHeight: 1.8, marginBottom: 14 }}>
              What happens when you use <span style={{ color: T.neon4 }}>%d</span> with a <span style={{ color: "#FF6FD8" }}>float</span>?
            </div>
            <div style={{ fontFamily: T.mono, fontSize: 13, color: "#C3E88D", background: "rgba(0,0,0,0.5)", borderRadius: 8, padding: "12px 16px", marginBottom: 14 }}>
              float x = 3.14f;<br />
              printf(<span style={{ color: T.neon3 }}>"%d"</span>, x);  // ← wrong!
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={triggerMismatch}
                style={{ fontFamily: T.display, fontWeight: 700, fontSize: 10, letterSpacing: 3, color: "#000", background: T.neon3, border: "none", borderRadius: 7, padding: "12px 24px", cursor: "pointer" }}>
                TRIGGER MISMATCH
              </motion.button>
              <VoiceButton
                id="formatspec-section"
                label="EXPLAIN FORMAT SPECS"
                text={getScript("formatspec", "deep")}
                mode="deep"
                voice={voice}
              />
            </div>
          </GlassCard>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <AnimatePresence mode="wait">
            <motion.div key={selected.spec + mismatchDemo}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.28 }}>
              <GlassCard style={{ padding: 28, borderColor: `${selected.color}40` }} hover={false}>
                <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 3, color: selected.color, marginBottom: 18 }}>FORMAT SPECIFIER BREAKDOWN</div>

                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
                  <div style={{ background: `${selected.color}20`, border: `1px solid ${selected.color}70`, borderRadius: 10, padding: "12px 24px", textAlign: "center" }}>
                    <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, marginBottom: 6 }}>VALUE</div>
                    <div style={{ fontFamily: T.mono, fontSize: 20, fontWeight: 700, color: selected.color }}>{selected.example}</div>
                  </div>
                  <div style={{ flex: 1, textAlign: "center" }}>
                    <div style={{ fontFamily: T.mono, fontSize: 26, color: selected.color }}>→</div>
                    <div style={{ fontFamily: T.mono, fontSize: 18, fontWeight: 700, color: selected.color }}>{selected.spec}</div>
                  </div>
                  <motion.div
                    animate={glitching ? {
                      x: [0, -5, 5, -3, 3, 0],
                      filter: ["hue-rotate(0deg)", "hue-rotate(120deg)", "hue-rotate(240deg)", "hue-rotate(0deg)"],
                    } : {}}
                    transition={glitching ? { duration: 0.6, repeat: 1 } : {}}
                    style={{ background: mismatchDemo ? `${T.neon3}20` : `${T.neon}20`, border: `1px solid ${mismatchDemo ? T.neon3 : T.neon}70`, borderRadius: 10, padding: "12px 24px", textAlign: "center", minWidth: 120 }}>
                    <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, marginBottom: 6 }}>OUTPUT</div>
                    <div style={{ fontFamily: T.mono, fontSize: 20, fontWeight: 700, color: mismatchDemo ? T.neon3 : T.neon }}>
                      {mismatchDemo ? "1078523331" : selected.output}
                    </div>
                  </motion.div>
                </div>

                {mismatchDemo && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    style={{ background: `${T.neon3}12`, border: `1px solid ${T.neon3}50`, borderRadius: 8, padding: "14px 18px", marginBottom: 18 }}>
                    <div style={{ fontFamily: T.mono, fontSize: 11, color: T.neon3, lineHeight: 1.8 }}>
                      💥 <strong>TYPE MISMATCH:</strong> The 4 bytes of float 3.14f (0x4048F5C3) were read as a signed int → 1078523331. Your format specifier must match the type!
                    </div>
                  </motion.div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div>
                    <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 3, color: selected.color, marginBottom: 8 }}>TYPE</div>
                    <NeonTag color={selected.color}>{selected.type}</NeonTag>
                  </div>
                  <div>
                    <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 3, color: selected.color, marginBottom: 8 }}>SPECIFIER</div>
                    <NeonTag color={selected.color}>{selected.spec}</NeonTag>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </AnimatePresence>

          <GlassCard style={{ padding: 20 }} hover={false}>
            <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 3, color: T.neon3, marginBottom: 14 }}>❓ WHY DOES scanf NEED &amp; ?</div>
            <div style={{ display: "flex", gap: 16, marginBottom: 14 }}>
              <div style={{ flex: 1 }}>
                <NeonTag color={T.neon3}>WRONG ❌</NeonTag>
                <div style={{ fontFamily: T.mono, fontSize: 11, color: T.neon3, background: "rgba(255,107,107,0.08)", border: `1px solid ${T.neon3}30`, borderRadius: 8, padding: "12px 14px", marginTop: 8, lineHeight: 1.8 }}>
                  scanf("%d", x);<br />
                  <span style={{ color: T.muted }}>// passes VALUE of x<br />// scanf can't write to it</span>
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <NeonTag color={T.neon}>CORRECT ✓</NeonTag>
                <div style={{ fontFamily: T.mono, fontSize: 11, color: T.neon, background: "rgba(0,255,163,0.08)", border: `1px solid ${T.neon}30`, borderRadius: 8, padding: "12px 14px", marginTop: 8, lineHeight: 1.8 }}>
                  scanf("%d", &amp;x);<br />
                  <span style={{ color: T.muted }}>// passes ADDRESS of x<br />// scanf writes there ✓</span>
                </div>
              </div>
            </div>
            <div style={{ fontFamily: T.mono, fontSize: 12, color: T.text, lineHeight: 1.8 }}>
              <span style={{ color: T.neon4 }}>&amp;</span> is the "address-of" operator. scanf needs to <em>write</em> to your variable — so it needs to know <em>where</em> in memory it lives.
            </div>
          </GlassCard>
        </div>
      </div>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 5: STEP EXECUTION
// ─────────────────────────────────────────────────────────────────────────────
const STEP_PROGRAM = [
  { line: "#include <stdio.h>", type: "preprocessor", desc: "Preprocessor directive. Before compilation, cpp replaces this with the entire contents of stdio.h — giving us printf and scanf.", memory: {}, output: "", color: T.accent },
  { line: "int main() {", type: "entry", desc: "Entry point. The OS calls main() first. 'int' means it returns an exit code. The '{' opens the function's scope — variables declared here live on the stack.", memory: {}, output: "", color: T.neon2 },
  { line: "    int score = 0;", type: "declare", desc: "Allocates 4 bytes on the stack for 'score'. Initializes to 0. The address might be 0xFF10. Memory now holds: 0xFF10 → 0", memory: { score: 0 }, output: "", color: T.neon4 },
  { line: "    float gpa = 3.8f;", type: "declare", desc: "Allocates 4 bytes for a float. The 'f' suffix marks this as float literal (not double). IEEE 754 representation: 0x40733333. Memory now holds: 0xFF14 → 3.8", memory: { score: 0, gpa: 3.8 }, output: "", color: "#FF6FD8" },
  { line: "    char grade = 'A';", type: "declare", desc: "Allocates 1 byte for char. 'A' is ASCII code 65. Memory holds: 0xFF18 → 65. char is literally a small integer — 'A' + 1 = 'B' in C.", memory: { score: 0, gpa: 3.8, grade: "'A'" }, output: "", color: T.neon },
  { line: "    score = 95;", type: "assign", desc: "Assignment. Writes integer 95 into the 4 bytes at score's address (0xFF10). The old value (0) is overwritten. Memory: 0xFF10 → 95", memory: { score: 95, gpa: 3.8, grade: "'A'" }, output: "", color: T.neon4 },
  { line: '    printf("Score: %d, GPA: %.1f, Grade: %c\\n", score, gpa, grade);', type: "output", desc: "printf reads the format string. %d → substitutes score (95). %.1f → formats gpa with 1 decimal (3.8). %c → converts grade's ASCII value to character 'A'. \\n adds a newline.", memory: { score: 95, gpa: 3.8, grade: "'A'" }, output: "Score: 95, GPA: 3.8, Grade: A\n", color: T.neon },
  { line: "    return 0;", type: "return", desc: "Exits main() and returns 0 to the OS. Exit code 0 = success. The stack frame is destroyed — score, gpa, grade are all gone from memory. OS reclaims the stack space.", memory: { score: 95, gpa: 3.8, grade: "'A'" }, output: "Score: 95, GPA: 3.8, Grade: A\n", color: T.neon3 },
  { line: "}", type: "close", desc: "Closing brace. End of main(). All local variables go out of scope. The stack pointer moves back. Memory 0xFF10–0xFF18 is reclaimed for future use.", memory: {}, output: "Score: 95, GPA: 3.8, Grade: A\n", color: T.neon2 },
];

function StepExecutionSection({ voice }) {
  const [step, setStep] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const playRef = useRef(null);

  const current = step >= 0 ? STEP_PROGRAM[step] : null;

  const goTo = (n) => setStep(Math.max(-1, Math.min(n, STEP_PROGRAM.length - 1)));

  useEffect(() => {
    if (playing) {
      playRef.current = setInterval(() => {
        setStep(s => {
          if (s >= STEP_PROGRAM.length - 1) { setPlaying(false); clearInterval(playRef.current); return s; }
          return s + 1;
        });
      }, 1200);
    } else {
      clearInterval(playRef.current);
    }
    return () => clearInterval(playRef.current);
  }, [playing]);

  const memEntries = current ? Object.entries(current.memory) : [];
  const memColors = { score: T.neon4, gpa: "#FF6FD8", grade: T.neon };

  return (
    <Section id="stepexec">
      <SectionHeader num="05" tag="STEP ENGINE · MULTI-TYPE PROGRAM" title="Step Through Execution" />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 26 }}>
        <GlassCard style={{ overflow: "hidden" }} hover={false}>
          <div style={{ background: "rgba(0,0,0,0.5)", borderBottom: `1px solid ${T.dim}`, padding: "12px 18px", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: playing ? T.neon : (step >= 0 ? T.neon4 : T.muted) }} />
            <span style={{ fontFamily: T.mono, fontSize: 9, color: T.muted }}>multivars.c</span>
            <span style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 2, color: T.muted, marginLeft: "auto" }}>
              {step >= 0 ? `LINE ${step + 1} / ${STEP_PROGRAM.length}` : "READY"}
            </span>
          </div>
          <div style={{ padding: "14px 0" }}>
            {STEP_PROGRAM.map((s, i) => {
              const isActive = step === i;
              const isPast = step > i;
              return (
                <motion.div key={i}
                  animate={{ background: isActive ? `${s.color}15` : "transparent", paddingLeft: isActive ? 24 : 18 }}
                  style={{ display: "flex", alignItems: "flex-start", gap: 12, paddingRight: 20, paddingTop: 2, paddingBottom: 2, borderLeft: `3px solid ${isActive ? s.color : "transparent"}`, opacity: isPast ? 0.32 : 1, cursor: "pointer", transition: "opacity 0.2s" }}
                  onClick={() => goTo(i)}
                >
                  <span style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, minWidth: 18, textAlign: "right", marginTop: 5, flexShrink: 0 }}>{i + 1}</span>
                  <span style={{ fontFamily: T.mono, fontSize: 12, color: isActive ? s.color : (isPast ? T.muted : T.text), lineHeight: 2, wordBreak: "break-word" }}>
                    {s.line}
                  </span>
                  {isActive && (
                    <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 0.5, repeat: Infinity }}
                      style={{ fontFamily: T.mono, fontSize: 8, color: s.color, marginLeft: "auto", flexShrink: 0, letterSpacing: 1 }}>◀ NOW</motion.span>
                  )}
                </motion.div>
              );
            })}
          </div>
        </GlassCard>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <GlassCard style={{ padding: 20, minHeight: 120, borderColor: current ? `${current.color}40` : T.border }} hover={false}>
            <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 3, color: current?.color || T.muted, marginBottom: 10 }}>
              {current ? current.type.toUpperCase() : "SELECT A LINE"}
            </div>
            <AnimatePresence mode="wait">
              <motion.div key={step} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.22 }}>
                <div style={{ fontFamily: T.mono, fontSize: 12, color: T.text, lineHeight: 1.85, marginBottom: 12 }}>
                  {current?.desc || "Click a line or use the controls below to step through the program."}
                </div>
              </motion.div>
            </AnimatePresence>
            {current && (
              <VoiceButton
                id={`step-${step}`}
                label="EXPLAIN THIS LINE"
                text={`Line ${step + 1}: ${current.line}. ${current.desc}`}
                voice={voice}
              />
            )}
          </GlassCard>

          <GlassCard style={{ padding: 0, overflow: "hidden" }} hover={false}>
            <div style={{ background: "rgba(0,0,0,0.5)", borderBottom: `1px solid ${T.dim}`, padding: "12px 18px", fontFamily: T.mono, fontSize: 8, letterSpacing: 3, color: T.neon2 }}>STACK MEMORY</div>
            <div style={{ padding: "16px 18px", minHeight: 90 }}>
              {memEntries.length === 0 && (
                <div style={{ fontFamily: T.mono, fontSize: 12, color: T.dim }}>No variables yet…</div>
              )}
              {memEntries.map(([name, val], i) => {
                const color = memColors[name] || T.neon;
                return (
                  <motion.div key={name} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12, fontFamily: T.mono, fontSize: 12 }}>
                    <span style={{ color: T.muted, minWidth: 60, fontSize: 9 }}>0xFF{(0x10 + i * 4).toString(16).toUpperCase()}</span>
                    <span style={{ color, minWidth: 48, fontWeight: 700 }}>{name}</span>
                    <motion.div
                      key={String(val)}
                      initial={{ scale: 1.4, color }} animate={{ scale: 1, color: T.text }}
                      style={{ background: `${color}15`, border: `1px solid ${color}50`, borderRadius: 5, padding: "4px 14px", fontWeight: 700, color }}>
                      {String(val)}
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>
          </GlassCard>

          <GlassCard style={{ padding: 0, overflow: "hidden" }} hover={false}>
            <div style={{ background: "rgba(0,0,0,0.5)", borderBottom: `1px solid ${T.dim}`, padding: "12px 18px", fontFamily: T.mono, fontSize: 8, letterSpacing: 3, color: "#C3E88D" }}>TERMINAL</div>
            <div style={{ padding: "14px 18px", minHeight: 70 }}>
              <AnimatePresence>
                {current?.output ? (
                  <motion.pre key="output" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    style={{ fontFamily: T.mono, fontSize: 15, color: "#C3E88D", lineHeight: 1.8 }}>
                    {current.output}
                  </motion.pre>
                ) : (
                  <span style={{ fontFamily: T.mono, fontSize: 12, color: T.muted }}>no output yet</span>
                )}
              </AnimatePresence>
            </div>
          </GlassCard>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 16, marginTop: 24, flexWrap: "wrap" }}>
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => { setPlaying(false); goTo(-1); }}
          style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: 2, color: T.muted, padding: "10px 18px", background: "transparent", border: `1px solid ${T.dim}`, borderRadius: 7, cursor: "pointer" }}>
          ⏮ RESET
        </motion.button>
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => goTo(step - 1)} disabled={step <= 0}
          style={{ fontFamily: T.display, fontWeight: 700, fontSize: 10, letterSpacing: 2, color: step <= 0 ? T.muted : T.neon, padding: "10px 26px", background: "transparent", border: `1px solid ${step <= 0 ? T.dim : T.border}`, borderRadius: 7, cursor: step <= 0 ? "not-allowed" : "pointer" }}>
          ← PREV
        </motion.button>

        <div style={{ display: "flex", gap: 5 }}>
          {STEP_PROGRAM.map((s, i) => (
            <motion.button key={i} onClick={() => goTo(i)}
              animate={{ background: step >= i ? s.color : T.dim, scale: step === i ? 1.4 : 1 }}
              style={{ width: 8, height: 8, borderRadius: "50%", border: "none", cursor: "pointer", padding: 0 }} />
          ))}
        </div>

        <motion.button whileTap={{ scale: 0.95 }} onClick={() => setPlaying(!playing)}
          style={{ fontFamily: T.display, fontWeight: 700, fontSize: 9, letterSpacing: 2, color: playing ? "#000" : T.neon2, padding: "10px 18px", background: playing ? T.neon2 : "transparent", border: `1px solid ${playing ? T.neon2 : T.dim}`, borderRadius: 7, cursor: "pointer" }}>
          {playing ? "⏸ PAUSE" : "▶ AUTO"}
        </motion.button>

        <motion.button whileTap={{ scale: 0.95 }} onClick={() => goTo(step + 1)} disabled={step >= STEP_PROGRAM.length - 1}
          style={{ fontFamily: T.display, fontWeight: 700, fontSize: 10, letterSpacing: 2, color: step >= STEP_PROGRAM.length - 1 ? T.muted : T.neon, padding: "10px 26px", background: "transparent", border: `1px solid ${step >= STEP_PROGRAM.length - 1 ? T.dim : T.border}`, borderRadius: 7, cursor: step >= STEP_PROGRAM.length - 1 ? "not-allowed" : "pointer" }}>
          NEXT →
        </motion.button>

        <VoiceButton
          id="stepexec-full"
          label="NARRATE FULL PROGRAM"
          text={getScript("stepexec", "deep")}
          mode="deep"
          voice={voice}
        />
      </div>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DEEP UNDERSTANDING PANEL (LEFT SIDEBAR) — reduced to 324px (-10%)
// ─────────────────────────────────────────────────────────────────────────────
function DeepUnderstandingPanel({ activeSection, voice }) {
  const [expanded, setExpanded] = useState(null);
  const [mode, setMode] = useState("beginner");

  const insights = DEEP_INSIGHTS_BY_SECTION[activeSection] || DEEP_INSIGHTS_BY_SECTION["hero2"];

  const mentalModels = {
    hero2: [
      { icon: "🏠", model: "Variable = a named box in RAM", detail: "int x = 5 → put 5 in box labeled 'x' at address 0xFF10" },
      { icon: "📏", model: "Type = size + interpretation rule", detail: "int tells compiler: 4 bytes, treat as signed integer" },
    ],
    datatypes: [
      { icon: "🏠", model: "char='tiny box', int='medium box', double='big box'", detail: "1, 4, and 8 bytes respectively" },
      { icon: "💡", model: "int is exact, float is approximate", detail: "Never use float for money or equality checks" },
    ],
    variables: [
      { icon: "🔒", model: "const = label on a sealed box", detail: "The compiler stops you from writing to it" },
      { icon: "🕳️", model: "Uninitialized = random garbage in box", detail: "Always initialize: int x = 0; not int x;" },
    ],
    io: [
      { icon: "📮", model: "printf = post office sends", detail: "Takes value, formats it, sends to stdout" },
      { icon: "📬", model: "scanf = post office receives at address", detail: "&x gives the address where scanf delivers" },
    ],
    formatspec: [
      { icon: "🔍", model: "%d = 'look at these 4 bytes as integer'", detail: "Each specifier tells printf HOW to interpret the bytes" },
      { icon: "💣", model: "Wrong specifier = wrong interpretation", detail: "%d on float reads float bits as integer — garbage" },
    ],
    stepexec: [
      { icon: "⬇️", model: "C runs top-to-bottom, one line at a time", detail: "No magic. Each line executes before the next starts." },
      { icon: "📋", model: "Assignment = write value to address", detail: "x = 5 writes the bits of 5 to x's memory location" },
    ],
  };

  const currentModels = mentalModels[activeSection] || mentalModels["hero2"];

  // Section voice button config
  const sectionVoiceMap = {
    hero2: { id: "sidebar-hero2", text: getScript("hero2", mode), label: "NARRATE OVERVIEW" },
    datatypes: { id: "sidebar-datatypes", text: getScript("datatype_int", mode), label: "NARRATE DATA TYPES" },
    variables: { id: "sidebar-variables", text: getScript("variables", mode), label: "NARRATE VARIABLES" },
    io: { id: "sidebar-io", text: getScript("io", mode), label: "NARRATE I/O" },
    formatspec: { id: "sidebar-formatspec", text: getScript("formatspec", mode), label: "NARRATE FORMAT SPECS" },
    stepexec: { id: "sidebar-stepexec", text: getScript("stepexec", mode), label: "NARRATE EXECUTION" },
  };
  const sv = sectionVoiceMap[activeSection] || sectionVoiceMap["hero2"];

  return (
    <aside className="sidebar-left" style={{
      width: 324, minWidth: 324,  /* ← 360 × 0.9 = 324 (–10%) */
      background: `linear-gradient(180deg, ${T.bg1} 0%, ${T.bg} 100%)`,
      borderRight: `1px solid ${T.dim}`,
      padding: "24px 14px",
      display: "flex", flexDirection: "column", gap: 0,
      overflowY: "auto", overflowX: "hidden",
      position: "sticky", top: 0, height: "100vh", flexShrink: 0,
    }}>
      {/* Header */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: 4, color: T.neon, fontWeight: 700, marginBottom: 4 }}>DEEP UNDERSTANDING</div>
        <div style={{ fontFamily: T.mono, fontSize: 10, color: T.text, marginBottom: 8, fontWeight: 600 }}>Updates as you explore</div>
        <div style={{ height: 1, background: `linear-gradient(90deg, ${T.neon}35, transparent)` }} />
      </div>

      {/* Mode switcher */}
      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        {["beginner", "deep"].map(m => (
          <motion.button key={m} whileTap={{ scale: 0.95 }}
            onClick={() => setMode(m)}
            style={{
              flex: 1, fontFamily: T.mono, fontSize: 9, letterSpacing: 1, fontWeight: 700,
              color: mode === m ? "#000" : T.text, padding: "6px 0",
              background: mode === m ? T.neon2 : "transparent",
              border: `1px solid ${mode === m ? T.neon2 : T.dim}`, borderRadius: 5, cursor: "pointer",
            }}>
            {m === "beginner" ? "🟢 BEGINNER" : "🔵 DEEP"}
          </motion.button>
        ))}
      </div>

      {/* Section narrate button */}
      <div style={{ marginBottom: 14 }}>
        <VoiceButton
          id={sv.id}
          label={sv.label}
          text={sv.text}
          mode={mode}
          voice={voice}
        />
      </div>

      {/* Key Takeaways */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 4, color: T.neon, marginBottom: 8 }}>⚡ KEY TAKEAWAYS</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <AnimatePresence mode="wait">
            {insights.map((ins, i) => {
              const isExp = expanded === i;
              return (
                <motion.div key={`${activeSection}-${i}`}
                  initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 14 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ x: -2 }}
                  onClick={() => setExpanded(isExp ? null : i)}
                  style={{
                    background: isExp ? `${ins.color}0E` : "rgba(255,255,255,0.015)",
                    border: `1px solid ${isExp ? `${ins.color}50` : T.dim}`,
                    borderRadius: 10, padding: "10px 12px", cursor: "pointer",
                  }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                    <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>{ins.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ fontFamily: T.display, fontWeight: 700, fontSize: 12, color: T.text }}>{ins.title}</div>
                        <motion.div animate={{ rotate: isExp ? 90 : 0 }} style={{ color: T.text, fontSize: 12, fontWeight: 700, flexShrink: 0, marginLeft: 6 }}>›</motion.div>
                      </div>
                      <AnimatePresence>
                        {isExp && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} style={{ overflow: "hidden" }}>
                            <div style={{ fontFamily: T.mono, fontSize: 11, color: T.text, lineHeight: 1.7, marginTop: 6 }}>{ins.body}</div>
                            <div style={{ marginTop: 8 }}>
                              <VoiceButton
                                id={`ins-${activeSection}-${i}`}
                                label="EXPLAIN"
                                text={`${ins.title}. ${ins.body}`}
                                mode={mode}
                                voice={voice}
                              />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      {!isExp && (
                        <div style={{ fontFamily: T.mono, fontSize: 9, color: T.text, lineHeight: 1.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {ins.body.slice(0, 48)}…
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Mental Models */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 4, color: T.neon2, marginBottom: 8 }}>🧠 MENTAL MODELS</div>
        <AnimatePresence mode="wait">
          <motion.div key={activeSection} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            {currentModels.map((m, i) => (
              <div key={i} style={{ background: "rgba(0,212,255,0.05)", border: `1px solid ${T.neon2}20`, borderRadius: 8, padding: "10px 12px", marginBottom: 8 }}>
                <div style={{ display: "flex", gap: 6, marginBottom: 4 }}>
                  <span style={{ fontSize: 13 }}>{m.icon}</span>
                  <div style={{ fontFamily: T.mono, fontSize: 11, fontWeight: 700, color: T.neon2, lineHeight: 1.4 }}>{m.model}</div>
                </div>
                <div style={{ fontFamily: T.mono, fontSize: 10, color: T.text, lineHeight: 1.5 }}>{m.detail}</div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Common Mistakes */}
      <div>
        <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 4, color: T.neon3, marginBottom: 8 }}>🚫 COMMON MISTAKES</div>
        {[
          { mistake: "Using = instead of == for comparison", fix: "if (x == 5) not if (x = 5)" },
          { mistake: "Forgetting & in scanf", fix: "scanf(\"%d\", &x) not scanf(\"%d\", x)" },
          { mistake: "Integer division truncates", fix: "5/2 = 2 in C, not 2.5 — use 5.0/2" },
          { mistake: "Uninitialized variable", fix: "Always initialize: int x = 0;" },
        ].map((item, i) => (
          <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "flex-start" }}>
            <span style={{ color: T.neon3, fontSize: 10, flexShrink: 0, marginTop: 1 }}>✗</span>
            <div>
              <div style={{ fontFamily: T.mono, fontSize: 9, color: T.neon3, lineHeight: 1.4 }}>{item.mistake}</div>
              <div style={{ fontFamily: T.mono, fontSize: 9, color: T.neon, marginTop: 2 }}>→ {item.fix}</div>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RIGHT SIDEBAR (NAVIGATION + PREV/NEXT)
// ─────────────────────────────────────────────────────────────────────────────
function Sidebar({ activeSection }) {
  return (
    <aside className="sidebar-right" style={{
      width: 260, minWidth: 260,
      background: `linear-gradient(180deg, ${T.bg1} 0%, ${T.bg} 100%)`,
      borderLeft: `1px solid ${T.dim}`,
      display: "flex", flexDirection: "column",
      padding: "28px 0",
      position: "sticky", top: 0, height: "100vh",
      overflow: "hidden", flexShrink: 0,
    }}>
      <div style={{ padding: "0 20px 20px" }}>
        <motion.div
          animate={{ textShadow: [`0 0 22px ${T.neon}70`, `0 0 32px ${T.neon}90`, `0 0 22px ${T.neon}70`] }}
          transition={{ duration: 2.5, repeat: Infinity }}
          style={{ fontFamily: T.display, fontWeight: 800, fontSize: 20, letterSpacing: 2, color: T.neon }}
        >C</motion.div>
        <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 5, color: T.muted, marginTop: 4 }}>LANGUAGE</div>
      </div>

      <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${T.neon}35, transparent)`, marginBottom: 16 }} />

      <nav style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
        {NAV_ITEMS.map(item => {
          const isActive = activeSection === item.id;
          return (
            <motion.a
              key={item.id}
              href={`#${item.id}`}
              onClick={e => { e.preventDefault(); document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" }); }}
              animate={{ color: isActive ? T.neon : T.muted, borderLeftColor: isActive ? T.neon : "transparent", background: isActive ? `${T.neon}07` : "transparent" }}
              whileHover={{ color: T.text, paddingLeft: 26 }}
              transition={{ duration: 0.2 }}
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 20px", fontFamily: T.mono, fontSize: 12, fontWeight: 700, letterSpacing: 2, textDecoration: "none", borderLeft: "2px solid transparent", transition: "all 0.2s", cursor: "pointer" }}
            >
              <span style={{ fontSize: 13, flexShrink: 0 }}>{item.icon}</span>
              <div>
                <div style={{ fontSize: 8, opacity: 0.45, marginBottom: 2 }}>{item.num}</div>
                {item.label}
              </div>
              {isActive && (
                <motion.div layoutId="nav-indicator-2"
                  style={{ width: 5, height: 5, borderRadius: "50%", background: T.neon, marginLeft: "auto", flexShrink: 0 }} />
              )}
            </motion.a>
          );
        })}
      </nav>

      <div style={{ flex: "0 0 auto", padding: "12px 16px 16px", borderTop: `1px solid ${T.dim}`, display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ fontFamily: T.mono, fontSize: 7, letterSpacing: 3, color: T.muted }}>COURSE PROGRESS</div>
        <div style={{ height: 2, background: T.dim, borderRadius: 2, overflow: "hidden" }}>
          <motion.div style={{ height: "100%", width: "20%", background: `linear-gradient(90deg,${T.neon},${T.neon2})`, borderRadius: 2 }} />
        </div>
        <div style={{ fontFamily: T.mono, fontSize: 8, color: T.neon, marginTop: 2, marginBottom: 4 }}>2 / 7 complete</div>

        <Link href="/c-1" passHref legacyBehavior>
          <motion.a whileHover={{ x: -4, borderColor: T.neon }} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            fontFamily: T.mono, fontSize: 9, letterSpacing: 1.5, fontWeight: 700,
            color: T.neon2, textDecoration: "none", background: "rgba(0,212,255,0.05)",
            border: `1px solid ${T.neon2}30`, borderRadius: 6, padding: "8px 12px",
            transition: "all 0.2s",
          }}>
            <span>← PREV</span>
            <span style={{ color: T.text, letterSpacing: 0, fontSize: 8 }}>STRUCTURE &amp; KEYWORDS</span>
          </motion.a>
        </Link>
        <Link href="/c-3" passHref legacyBehavior>
          <motion.a whileHover={{ x: 4, borderColor: T.neon }} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            fontFamily: T.mono, fontSize: 9, letterSpacing: 1.5, fontWeight: 700,
            color: T.neon, textDecoration: "none", background: "rgba(0,255,163,0.05)",
            border: `1px solid ${T.neon}30`, borderRadius: 6, padding: "8px 12px",
            transition: "all 0.2s",
          }}>
            <span>NEXT →</span>
            <span style={{ color: T.text, letterSpacing: 0, fontSize: 8 }}>OPERATORS &amp; CONTROL FLOW</span>
          </motion.a>
        </Link>
      </div>
    </aside>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ROOT PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function CFundamentalsPage() {
  const [activeSection, setActiveSection] = useState("hero2");
  const voice = usePremiumVoice();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => { entries.forEach(e => { if (e.isIntersecting) setActiveSection(e.target.id); }); },
      { threshold: 0.3 }
    );
    NAV_ITEMS.forEach(item => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=JetBrains+Mono:ital,wght@0,300;0,500;0,700;1,400&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: ${T.bg}; color: ${T.text}; overflow-x: hidden; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: ${T.bg}; }
        ::-webkit-scrollbar-thumb { background: ${T.neon}; border-radius: 4px; }
        @keyframes scrollUp {
          from { transform: translateY(0); }
          to   { transform: translateY(-50%); }
        }
        input::placeholder { color: ${T.dim}; }
        input { transition: border-color 0.2s; }

        .page-layout {
          display: grid;
          grid-template-columns: 324px 1fr 260px; /* 360 × 0.9 = 324 */
          height: 100vh;
          overflow: hidden;
        }
        @media (max-width: 1100px) {
          .page-layout {
            grid-template-columns: 1fr;
            grid-template-rows: auto auto auto;
            overflow-y: auto;
            height: auto;
          }
          .sidebar-left, .sidebar-right {
            position: relative !important;
            width: 100% !important;
            min-width: unset !important;
            height: auto !important;
            border: none !important;
            border-bottom: 1px solid ${T.dim} !important;
            padding: 20px !important;
          }
          main { order: 1; }
          .sidebar-left { order: 2; }
          .sidebar-right { order: 3; }
        }
        @media (max-width: 640px) {
          .sidebar-left, .sidebar-right { padding: 16px !important; }
          main > div { padding: 0 16px !important; }
        }
      `}</style>

      <div className="page-layout">
        {/* LEFT: Deep Understanding + Voice */}
        <DeepUnderstandingPanel activeSection={activeSection} voice={voice} />

        {/* MAIN CONTENT */}
        <main style={{ overflowY: "auto", overflowX: "hidden", minWidth: 0 }}>
          <div style={{ maxWidth: "100%", padding: "0 36px" }}>
            <Hero2 voice={voice} />
            <DataTypesSection voice={voice} />
            <VariablesSection voice={voice} />
            <IOSection voice={voice} />
            <FormatSpecSection voice={voice} />
            <StepExecutionSection voice={voice} />
            <div style={{ height: 80 }} />
          </div>
        </main>

        {/* RIGHT: Navigation */}
        <Sidebar activeSection={activeSection} />
      </div>
    </>
  );
}