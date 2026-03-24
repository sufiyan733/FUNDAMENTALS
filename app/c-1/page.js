"use client";

/**
 * C PROGRAMMING — VISUAL SIMULATION ENGINE (ENHANCED)
 * =====================================================
 * Next.js page (App Router). Drop this in: app/c-intro/page.jsx
 *
 * Dependencies:
 *   npm install framer-motion gsap @gsap/react three @react-three/fiber @react-three/drei
 */

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence, useInView, useScroll, useTransform, useSpring } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, Float, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";
import { gsap } from "gsap";

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN TOKENS
// ─────────────────────────────────────────────────────────────────────────────
const T = {
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
// C LANGUAGE DATA
// ─────────────────────────────────────────────────────────────────────────────
const C_KEYWORDS = {
    int: "Signed integer type. Stores whole numbers from −2,147,483,648 to 2,147,483,647.",
    float: "Single-precision floating-point. ~7 decimal digits of precision.",
    double: "Double-precision float. ~15 decimal digits of precision.",
    char: "1 byte. Stores a single character via ASCII encoding.",
    void: "'Nothing.' Used for functions that return no value.",
    return: "Exits a function and sends a value back to the caller.",
    if: "Conditional branch — block runs only when condition is truthy.",
    else: "Alternative branch when the 'if' condition is false.",
    while: "Loop repeating while a condition stays true.",
    for: "Compact loop: init; condition; increment.",
    do: "Loop that executes at least once before checking condition.",
    break: "Immediately exits the nearest enclosing loop or switch.",
    continue: "Skips remaining loop body, jumps to next iteration.",
    switch: "Multi-way branch — efficiently matches one value to many cases.",
    case: "A label inside switch matching a specific value.",
    default: "Fallback label in switch when no case matches.",
    struct: "Groups variables of different types under one name.",
    typedef: "Creates an alias for an existing type name.",
    sizeof: "Compile-time operator — returns byte size of type/variable.",
    static: "Persistent storage + internal linkage.",
    extern: "Declares variable/function defined in another translation unit.",
    const: "Read-only after initialization.",
    volatile: "Variable may change externally (hardware, ISR). Don't optimize.",
    unsigned: "Non-negative integer modifier. Doubles max positive range.",
    signed: "Explicitly marks integer as signed (usually default).",
    short: "Smaller integer — at least 16 bits.",
    long: "Larger integer — at least 32 bits.",
    register: "Hints compiler: store in CPU register for speed.",
    auto: "Default local storage class. Rarely written explicitly.",
    goto: "Unconditional jump to a labeled statement. Use sparingly.",
    enum: "Named integer constants — cleaner than raw magic numbers.",
    union: "All members share the same memory location.",
};

const KEYWORD_SET = new Set(Object.keys(C_KEYWORDS));

const COMPILE_STAGES = [
    {
        id: "source",
        label: "SOURCE",
        sublabel: ".c file",
        icon: "📄",
        color: T.neon,
        input: `#include <stdio.h>\n// Say hello\n#define GREETING "Hello, C!"\n\nint main() {\n    printf(GREETING);\n    return 0;\n}`,
        output: `Unchanged .c file\nHuman-readable text\nComments present\nMacros unexpanded\nHeaders not inlined`,
        transformLabel: "YOU WRITE",
        transformIcon: "✏️",
        desc: "You write human-readable C source in a .c file. This is the only stage you directly author — everything else is automated. The compiler hasn't touched it.",
    },
    {
        id: "preprocess",
        label: "PREPROCESS",
        sublabel: "cpp / gcc -E",
        icon: "🔍",
        color: T.neon2,
        input: `Source .c file\n#include <stdio.h>\n#define GREETING "Hello, C!"\n// Say hello`,
        output: `// Comments stripped\n// #include replaced with\n// full stdio.h contents (~800 lines)\n// GREETING → "Hello, C!"\nint main() {\n    printf("Hello, C!");\n    return 0;\n}`,
        transformLabel: "EXPAND MACROS",
        transformIcon: "📋",
        desc: "The C Preprocessor (cpp) runs first. It strips comments, expands #define macros inline, and replaces #include with the full contents of the header file. Output: pure C, no directives.",
    },
    {
        id: "compile",
        label: "COMPILE",
        sublabel: "gcc -S → .s",
        icon: "⚙️",
        color: T.neon4,
        input: `Preprocessed .c\n(pure C code)\n\nint main() {\n    printf("Hello, C!");\n    return 0;\n}`,
        output: `.section .text\n.globl main\nmain:\n    pushq %rbp\n    movq  %rsp, %rbp\n    leaq  .LC0(%rip), %rdi\n    call  printf\n    movl  $0, %eax\n    popq  %rbp\n    ret\n.LC0: .string "Hello, C!"`,
        transformLabel: "→ ASSEMBLY",
        transformIcon: "🔧",
        desc: "GCC parses the C into an AST, optimises, then emits human-readable x86-64 Assembly (.s). You can see the actual CPU instructions — registers, stack frames, calls — your code will perform.",
    },
    {
        id: "assemble",
        label: "ASSEMBLE",
        sublabel: "as → .o",
        icon: "🔢",
        color: T.accent,
        input: `Assembly text (.s)\nHuman-readable mnemonics:\npushq, movq, call, ret...\n\n~16 lines of assembly`,
        output: `Binary Object File (.o)\nELF format\n\nB8 01 00 00 00  ← MOV EAX,1\nCD 80           ← INT 0x80\n48 89 E5        ← MOV RBP,RSP\n[relocatable — not runnable yet]`,
        transformLabel: "→ BINARY",
        transformIcon: "💾",
        desc: "The Assembler (as) converts assembly mnemonics into raw binary machine code and packages it into an object file (.o). It's binary, but not yet executable — symbol references are unresolved placeholders.",
    },
    {
        id: "link",
        label: "LINK",
        sublabel: "ld / gcc → exe",
        icon: "🔗",
        color: T.neon3,
        input: `main.o (your code)\n+\nlibc.a (printf, stdlib)\n+\ncrt0.o (startup code)\n\nAll relocatable objects`,
        output: `a.out / main (ELF executable)\n\n• All symbols resolved\n• Addresses fixed\n• Startup code added\n• Ready to run on OS`,
        transformLabel: "→ EXECUTABLE",
        transformIcon: "⛓️",
        desc: "The Linker (ld) combines your .o with libc (printf lives there!), resolves all symbol references, fixes memory addresses, and adds OS startup code. Output: a complete, runnable executable.",
    },
    {
        id: "execute",
        label: "EXECUTE",
        sublabel: "OS → CPU",
        icon: "🚀",
        color: "#00FFA3",
        input: `./main (executable)\n\nOS loads into RAM\nKernel sets up:\n• Stack\n• Heap  \n• Text segment\n• Calls main()`,
        output: `CPU executes binary:\n\nFetch → Decode → Execute\n\nRegisters fire\nprintf syscall → kernel\nkernel → stdout\n\n> Hello, C!`,
        transformLabel: "CPU RUNS",
        transformIcon: "⚡",
        desc: "The OS kernel loads your executable into RAM, sets up stack/heap/segments, and jumps to main(). The CPU fetches, decodes, and executes your binary instructions at billions of ops/sec. No interpreter. Pure metal.",
    },
];

const PROGRAM_PARTS = [
    {
        id: "preprocessor",
        lines: [0],
        color: "#C792EA",
        label: "Preprocessor Directive",
        short: "#include <stdio.h>",
        detail: "Runs before compilation. Tells cpp to paste the entire stdio.h header here — giving you access to printf, scanf, FILE, etc. The # marks it as a preprocessor command, not C code.",
        icon: "📋",
    },
    {
        id: "main",
        lines: [1, 4],
        color: "#82AAFF",
        label: "main() — Entry Point",
        short: "int main() { }",
        detail: "Every C program starts here. The OS calls main(). 'int' means it returns an integer exit code. The braces define scope. Everything inside executes sequentially, top to bottom.",
        icon: "🚪",
    },
    {
        id: "statement",
        lines: [2],
        color: "#C3E88D",
        label: "Function Call Statement",
        short: 'printf("Hello");',
        detail: "Calls printf() from stdio.h. Outputs text to stdout (your terminal). The semicolon ; terminates the statement — mandatory in C. Skip it and gcc gives a syntax error.",
        icon: "📢",
    },
    {
        id: "return",
        lines: [3],
        color: "#F78C6C",
        label: "return Statement",
        short: "return 0;",
        detail: "Exits main() and sends exit code 0 to the OS. Code 0 = success. Non-zero = error. The shell can read this: echo $? after running your program shows the return value.",
        icon: "↩️",
    },
];

const PROGRAM_CODE_LINES = [
    { text: '#include <stdio.h>', indent: 0 },
    { text: 'int main() {', indent: 0 },
    { text: '    printf("Hello, World!\\n");', indent: 1 },
    { text: '    return 0;', indent: 1 },
    { text: '}', indent: 0 },
];

const PIPELINE_STAGES = [
    {
        id: "human",
        label: "HUMAN CODE",
        icon: "👨‍💻",
        color: T.neon,
        sample: 'printf("Hi");',
        explain: "You write readable C source code.\nText file. Humans can read it.\nCompiler hasn't seen it yet.",
    },
    {
        id: "compiler",
        label: "COMPILER",
        icon: "⚙️",
        color: T.neon2,
        sample: "gcc hello.c",
        explain: "GCC reads your code.\nParses into an Abstract Syntax Tree.\nOptimises, generates assembly.",
    },
    {
        id: "machine",
        label: "MACHINE CODE",
        icon: "🔢",
        color: T.neon4,
        sample: "B8 01 00 00 00",
        explain: "Pure binary instructions.\nCPU-specific opcodes.\nNo text, no abstractions.",
    },
    {
        id: "cpu",
        label: "CPU RUNS",
        icon: "🖥️",
        color: T.neon3,
        sample: "10¹⁰ ops/sec",
        explain: "CPU fetches → decodes → executes.\nNo runtime overhead.\nDirect metal. Blazing fast.",
    },
];

const NAV_ITEMS = [
    { id: "hero", label: "INTRO", num: "00", icon: "◎" },
    { id: "whatIsc", label: "WHAT IS C", num: "01", icon: "⚡" },
    { id: "structure", label: "STRUCTURE", num: "02", icon: "🧬" },
    { id: "keywords", label: "KEYWORDS", num: "03", icon: "🔑" },
    { id: "compilation", label: "COMPILATION", num: "04", icon: "⚙️" },
    { id: "execution", label: "EXECUTION", num: "05", icon: "▶" },
];

// Expanded insight data
const INSIGHTS = [
    {
        label: "ORIGIN",
        title: "Born 1972 at Bell Labs",
        body: "Dennis Ritchie created C to rewrite UNIX. It replaced assembly while keeping near-metal speed.",
        color: T.neon,
        icon: "🕰️",
    },
    {
        label: "PERFORMANCE",
        title: "10–100× Faster",
        body: "No VM overhead. Your code compiles directly to CPU opcodes. Python loops through an interpreter on every iteration.",
        color: T.neon2,
        icon: "⚡",
    },
    {
        label: "UBIQUITY",
        title: "Linux: 27M Lines of C",
        body: "The Linux kernel, Android core, SQLite, Python interpreter, and nginx — all written in C.",
        color: T.neon3,
        icon: "🌍",
    },
    {
        label: "KEYWORDS",
        title: "Only 32 Reserved Words",
        body: "English has 150+ stop words. C has just 32 keywords. Entire operating systems are built with that vocabulary.",
        color: T.neon4,
        icon: "🔑",
        tip: true,
    },
    {
        label: "MEMORY",
        title: "You Own the Heap",
        body: "malloc() gives you raw RAM. free() returns it. No GC pause, no hidden cost. You are the memory manager.",
        color: T.accent,
        icon: "🧠",
    },
    {
        label: "TIP",
        title: "Pointer = Address",
        body: "int *p = &x; — p holds the memory address of x. *p dereferences it. This is the most powerful (and dangerous) feature in C.",
        color: T.neon,
        icon: "👁️",
        tip: true,
    },
    {
        label: "COMPILATION",
        title: "4 Distinct Phases",
        body: "Preprocess → Compile → Assemble → Link. Each transforms your code into something closer to bare metal.",
        color: T.neon2,
        icon: "🔧",
    },
    {
        label: "UNDEFINED BEHAVIOR",
        title: "The Silent Killer",
        body: "Reading uninitialized memory, buffer overflow, or null dereference = undefined behavior. Anything can happen — even 'correct' output.",
        color: T.neon3,
        icon: "💀",
        tip: true,
    },
    {
        label: "SIZEOF",
        title: "sizeof() at Compile Time",
        body: "sizeof(int) returns 4 on 64-bit systems. sizeof(struct S) includes padding. Always use sizeof — never hardcode sizes.",
        color: T.neon4,
        icon: "📐",
    },
    {
        label: "LEGACY",
        title: "Mother of All Languages",
        body: "C++ extends C. Java's syntax mirrors C. Python's runtime is C. Rust fights C's demons. You can't escape C's DNA.",
        color: T.accent,
        icon: "🧬",
    },
];

const EV_CODE = [
    { line: '#include <stdio.h>', type: "preprocessor" },
    { line: 'int main() {', type: "entry" },
    { line: '    int x = 10;', type: "stmt", mem: { x: 10 } },
    { line: '    int y = 20;', type: "stmt", mem: { x: 10, y: 20 } },
    { line: '    int sum = x + y;', type: "stmt", mem: { x: 10, y: 20, sum: 30 } },
    { line: '    printf("Sum = %d\\n", sum);', type: "output", out: "Sum = 30\n" },
    { line: '    return 0;', type: "return" },
    { line: '}', type: "close" },
];
const EV_MEM_ADDRS = { x: "0xFF10", y: "0xFF14", sum: "0xFF18" };

// ─────────────────────────────────────────────────────────────────────────────
// UTILS
// ─────────────────────────────────────────────────────────────────────────────
function tokenize(code) {
    const tokens = [];
    const regex = /\/\/[^\n]*|\/\*[\s\S]*?\*\/|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|[a-zA-Z_]\w*|\d+\.?\d*|[^\s\w]/g;
    let match;
    while ((match = regex.exec(code)) !== null) {
        const val = match[0];
        let type = "punct";
        if (val.startsWith("//") || val.startsWith("/*")) type = "comment";
        else if (val.startsWith('"') || val.startsWith("'")) type = "string";
        else if (/^\d/.test(val)) type = "number";
        else if (KEYWORD_SET.has(val)) type = "keyword";
        else if (/^[a-zA-Z_]\w*$/.test(val)) type = "identifier";
        tokens.push({ val, type, start: match.index });
    }
    return tokens;
}

// ─────────────────────────────────────────────────────────────────────────────
// THREE.JS COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
function ParticleField() {
    const mesh = useRef();
    const positions = useMemo(() => {
        const arr = new Float32Array(3000 * 3);
        for (let i = 0; i < 3000; i++) {
            arr[i * 3] = (Math.random() - 0.5) * 40;
            arr[i * 3 + 1] = (Math.random() - 0.5) * 25;
            arr[i * 3 + 2] = (Math.random() - 0.5) * 25;
        }
        return arr;
    }, []);

    useFrame((state) => {
        if (mesh.current) {
            mesh.current.rotation.y = state.clock.elapsedTime * 0.03;
            mesh.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.015) * 0.08;
        }
    });

    return (
        <points ref={mesh}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[positions, 3]} />
            </bufferGeometry>
            <pointsMaterial size={0.05} color="#00FFA3" transparent opacity={0.45} sizeAttenuation />
        </points>
    );
}

function GlowOrb() {
    const mesh = useRef();
    useFrame((state) => {
        if (mesh.current) {
            mesh.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.4;
            mesh.current.rotation.z = state.clock.elapsedTime * 0.2;
        }
    });
    return (
        <Float speed={1.5} rotationIntensity={0.4} floatIntensity={0.8}>
            <mesh ref={mesh} position={[2, 0, -3]}>
                <sphereGeometry args={[1.2, 32, 32]} />
                <MeshDistortMaterial
                    color="#00FFA3"
                    attach="material"
                    distort={0.4}
                    speed={2}
                    transparent
                    opacity={0.08}
                    wireframe
                />
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
            whileHover={hover ? { scale: 1.005, borderColor: `${glowColor}35`, boxShadow: `0 8px 40px rgba(0,0,0,0.5), 0 0 20px ${glowColor}0A` } : {}}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
            style={{
                background: T.glass,
                border: `1px solid ${T.border}`,
                borderRadius: 14,
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                boxShadow: "0 4px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)",
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
        <section
            id={id}
            style={{
                padding: "72px 0",
                borderBottom: `1px solid ${T.dim}`,
                ...style,
            }}
        >
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
            style={{ display: "flex", alignItems: "flex-end", gap: 18, marginBottom: 36 }}
        >
            <span style={{ fontFamily: T.mono, fontSize: 56, fontWeight: 700, color: T.dim, lineHeight: 1, letterSpacing: -2 }}>
                {num}
            </span>
            <div>
                <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 5, color: T.neon, fontWeight: 500, marginBottom: 4 }}>
                    {tag}
                </div>
                <h2 style={{ fontFamily: T.display, fontSize: 28, fontWeight: 800, color: T.text, letterSpacing: -0.5, lineHeight: 1 }}>
                    {title}
                </h2>
            </div>
        </motion.div>
    );
}

function NeonTag({ children, color = T.neon }) {
    return (
        <span style={{
            fontFamily: T.mono,
            fontSize: 9,
            letterSpacing: 2,
            fontWeight: 700,
            color,
            background: `${color}14`,
            border: `1px solid ${color}28`,
            padding: "2px 7px",
            borderRadius: 3,
        }}>
            {children}
        </span>
    );
}

// Animated scan-line background element
function ScanLine() {
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
// HERO SECTION
// ─────────────────────────────────────────────────────────────────────────────
function HeroSection() {
    const [phase, setPhase] = useState(0);
    const [tick, setTick] = useState(0);
    const heroRef = useRef(null);

    const phases = [
        "C → compiled to machine code",
        "machine code → CPU instructions",
        "CPU executes in nanoseconds",
        "no runtime overhead. pure metal.",
    ];

    useEffect(() => {
        const interval = setInterval(() => setPhase(p => (p + 1) % phases.length), 2400);
        const tick2 = setInterval(() => setTick(t => t + 1), 80);
        return () => { clearInterval(interval); clearInterval(tick2); };
    }, []);

    const binaryChars = useMemo(() =>
        Array.from({ length: 360 }, () => Math.round(Math.random())).join(""),
        []);

    return (
        <section
            id="hero"
            ref={heroRef}
            style={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                overflow: "hidden",
                background: `
          radial-gradient(ellipse 90% 60% at 50% -10%, rgba(0,255,163,0.07) 0%, transparent 65%),
          radial-gradient(ellipse 50% 30% at 90% 60%, rgba(0,212,255,0.05) 0%, transparent 60%),
          radial-gradient(ellipse 40% 25% at 10% 80%, rgba(189,105,255,0.04) 0%, transparent 60%),
          ${T.bg}
        `,
            }}
        >
            {/* Three.js BG */}
            <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
                <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
                    <ParticleField />
                    <GlowOrb />
                    <Stars radius={120} depth={60} count={1200} factor={3} saturation={0} fade speed={0.4} />
                </Canvas>
            </div>

            {/* Grid */}
            <div style={{
                position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
                backgroundImage: `
          linear-gradient(rgba(0,255,163,0.018) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,255,163,0.018) 1px, transparent 1px)
        `,
                backgroundSize: "52px 52px",
            }} />

            {/* Scan line */}
            <div style={{ position: "absolute", inset: 0, zIndex: 1, overflow: "hidden", pointerEvents: "none" }}>
                <ScanLine />
            </div>

            {/* Binary rain */}
            <div style={{
                position: "absolute", inset: 0, zIndex: 1, overflow: "hidden", pointerEvents: "none",
                opacity: 0.055,
            }}>
                <div style={{
                    fontFamily: T.mono, fontSize: 10, color: T.neon,
                    wordBreak: "break-all", lineHeight: 1.9, padding: "0 24px",
                    animation: "scrollUp 28s linear infinite",
                }}>
                    {binaryChars.repeat(8)}
                </div>
            </div>

            {/* CONTENT */}
            <div style={{ position: "relative", zIndex: 10, textAlign: "center", maxWidth: 820, padding: "0 24px" }}>
                <motion.div
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    style={{
                        display: "inline-flex", alignItems: "center", gap: 8,
                        fontFamily: T.mono, fontSize: 9, letterSpacing: 5, color: T.neon,
                        border: `1px solid ${T.border}`,
                        background: "rgba(0,255,163,0.04)",
                        padding: "6px 20px", borderRadius: 100, marginBottom: 30,
                    }}
                >
                    <motion.span
                        animate={{ opacity: [1, 0.2, 1], scale: [1, 0.7, 1] }}
                        transition={{ duration: 1.2, repeat: Infinity }}
                        style={{ width: 5, height: 5, borderRadius: "50%", background: T.neon, display: "inline-block" }}
                    />
                    ONE OF THE FASTEST PROGRAMMING LANGUAGE
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 36 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                        fontFamily: T.display, fontWeight: 800,
                        fontSize: "clamp(64px, 11vw, 118px)",
                        lineHeight: 0.92, letterSpacing: -4,
                        color: T.text, marginBottom: 22,
                    }}
                >
                    <motion.span
                        animate={{ textShadow: [`0 0 60px ${T.neon}80, 0 0 120px ${T.neon}20`, `0 0 80px ${T.neon}A0, 0 0 160px ${T.neon}30`, `0 0 60px ${T.neon}80, 0 0 120px ${T.neon}20`] }}
                        transition={{ duration: 2.5, repeat: Infinity }}
                        style={{ color: T.neon }}
                    >
                        C
                    </motion.span>
                    {" "}
                    <br />
                    <span style={{ color: T.muted, fontSize: "0.34em", letterSpacing: 9, fontWeight: 400, fontFamily: T.mono }}>
                        Programming language
                    </span>
                </motion.h1>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    style={{ height: 32, marginBottom: 28, overflow: "hidden" }}
                >
                    <AnimatePresence mode="wait">
                        <motion.p
                            key={phase}
                            initial={{ y: 18, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -18, opacity: 0 }}
                            transition={{ duration: 0.35 }}
                            style={{ fontFamily: T.mono, fontSize: 14, color: T.neon2, letterSpacing: 1 }}
                        >
                            {phases[phase]}
                        </motion.p>
                    </AnimatePresence>
                </motion.div>

                {/* Pipeline nodes */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.7 }}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, marginBottom: 44 }}
                >
                    {PIPELINE_STAGES.map((stage, i) => (
                        <div key={stage.id} style={{ display: "flex", alignItems: "center" }}>
                            <motion.div
                                whileHover={{ y: -6, boxShadow: `0 12px 40px ${stage.color}45` }}
                                transition={{ type: "spring", stiffness: 300 }}
                                style={{
                                    background: T.bg2,
                                    border: `1px solid ${stage.color}35`,
                                    borderRadius: 12, padding: "14px 18px",
                                    textAlign: "center", minWidth: 95,
                                }}
                            >
                                <div style={{ fontSize: 24, marginBottom: 6 }}>{stage.icon}</div>
                                <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 2, color: stage.color, fontWeight: 700 }}>
                                    {stage.label}
                                </div>
                                <div style={{ fontFamily: T.mono, fontSize: 8, color: T.muted, marginTop: 3 }}>
                                    {stage.sample}
                                </div>
                            </motion.div>
                            {i < PIPELINE_STAGES.length - 1 && (
                                <div style={{ width: 44, position: "relative", height: 2 }}>
                                    <div style={{ height: 1, width: "100%", background: `linear-gradient(90deg, ${PIPELINE_STAGES[i].color}80, ${PIPELINE_STAGES[i + 1].color}80)` }} />
                                    <motion.div
                                        animate={{ x: [0, 36, 0] }}
                                        transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.5, ease: "linear" }}
                                        style={{
                                            position: "absolute", top: "50%", left: 0, transform: "translateY(-50%)",
                                            width: 7, height: 7, borderRadius: "50%",
                                            background: PIPELINE_STAGES[i].color,
                                            boxShadow: `0 0 10px ${PIPELINE_STAGES[i].color}`,
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </motion.div>

                <motion.button
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.1 }}
                    whileHover={{ scale: 1.06, boxShadow: `0 0 50px ${T.neon}60` }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => document.getElementById("whatIsc")?.scrollIntoView({ behavior: "smooth" })}
                    style={{
                        fontFamily: T.display, fontWeight: 700, fontSize: 12, letterSpacing: 4,
                        color: "#000", background: `linear-gradient(135deg, ${T.neon}, ${T.neon2})`,
                        border: "none", borderRadius: 7, padding: "15px 44px", cursor: "pointer",
                    }}
                >
                    START EXPLORING
                </motion.button>
            </div>

            <motion.div
                animate={{ y: [0, 9, 0] }}
                transition={{ duration: 2.2, repeat: Infinity }}
                style={{
                    position: "absolute", bottom: 30, zIndex: 10,
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                    fontFamily: T.mono, fontSize: 8, letterSpacing: 5, color: T.muted,
                }}
            >
                SCROLL
                <svg width="14" height="22" viewBox="0 0 14 22">
                    <rect x="5" y="3" width="4" height="7" rx="2" stroke={T.muted} strokeWidth="1.2" fill="none" />
                    <motion.rect
                        animate={{ y: [0, 5, 0], opacity: [1, 0, 1] }}
                        transition={{ duration: 1.8, repeat: Infinity }}
                        x="5.5" y="4" width="3" height="2" rx="1" fill={T.neon}
                    />
                    <line x1="7" y1="14" x2="7" y2="20" stroke={T.muted} strokeWidth="1.2" strokeLinecap="round" />
                    <polyline points="4,17 7,20 10,17" stroke={T.muted} strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </motion.div>
        </section>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// WHAT IS C
// ─────────────────────────────────────────────────────────────────────────────
function WhatIsC() {
    const [activeStage, setActiveStage] = useState(null);

    const active = PIPELINE_STAGES.find(s => s.id === activeStage);

    const speedData = [
        { lang: "C", value: 97, color: T.neon, label: "COMPILED → MACHINE CODE" },
        { lang: "Go", value: 85, color: T.neon2, label: "COMPILED → MACHINE CODE" },
        { lang: "Java", value: 50, color: T.neon4, label: "JIT COMPILED" },
        { lang: "JS", value: 26, color: "#FF6B35", label: "JIT INTERPRETED" },
        { lang: "Python", value: 9, color: T.accent, label: "INTERPRETED" },
    ];

    const useCases = [
        { name: "Linux Kernel", icon: "🐧", size: "~27M lines" },
        { name: "SQLite", icon: "🗄️", size: "~150K lines" },
        { name: "Git", icon: "🌿", size: "~500K lines" },
        { name: "Python VM", icon: "🐍", size: "~400K lines" },
        { name: "nginx", icon: "🌐", size: "~140K lines" },
        { name: "Redis", icon: "⚡", size: "~60K lines" },
    ];

    return (
        <Section id="whatIsc">
            <SectionHeader num="01" tag="FOUNDATION · WHAT IS C" title="A Language That Speaks CPU" />

            {/* Pipeline interactive */}
            <div style={{ marginBottom: 28 }}>
                <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, marginBottom: 14, letterSpacing: 3 }}>
                    ↓ CLICK EACH STAGE TO EXPLORE
                </div>
                <div style={{ display: "flex", alignItems: "stretch", gap: 0, borderRadius: 14, overflow: "hidden", border: `1px solid ${T.dim}` }}>
                    {PIPELINE_STAGES.map((stage, i) => (
                        <motion.button
                            key={stage.id}
                            whileHover={{ background: `${stage.color}10` }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setActiveStage(activeStage === stage.id ? null : stage.id)}
                            style={{
                                flex: 1, padding: "22px 14px", border: "none", cursor: "pointer",
                                borderRight: i < PIPELINE_STAGES.length - 1 ? `1px solid ${T.dim}` : "none",
                                background: activeStage === stage.id ? `${stage.color}12` : T.bg2,
                                borderBottom: activeStage === stage.id ? `2px solid ${stage.color}` : "2px solid transparent",
                                transition: "all 0.25s", textAlign: "center", position: "relative",
                            }}
                        >
                            <motion.div
                                animate={{ scale: activeStage === stage.id ? 1.15 : 1 }}
                                transition={{ type: "spring", stiffness: 300 }}
                                style={{ fontSize: 26, marginBottom: 8 }}
                            >
                                {stage.icon}
                            </motion.div>
                            <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 2, color: stage.color, fontWeight: 700, marginBottom: 5 }}>
                                {stage.label}
                            </div>
                            <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted }}>{stage.sample}</div>
                        </motion.button>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {active && (
                        <motion.div
                            key={active.id}
                            initial={{ opacity: 0, y: 8, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: "auto" }}
                            exit={{ opacity: 0, y: -8, height: 0 }}
                            transition={{ duration: 0.3 }}
                            style={{ overflow: "hidden" }}
                        >
                            <div style={{
                                marginTop: 12,
                                background: `${active.color}0C`,
                                border: `1px solid ${active.color}35`,
                                borderRadius: 10, padding: "18px 22px",
                                display: "flex", alignItems: "flex-start", gap: 14,
                            }}>
                                <span style={{ fontSize: 28, flexShrink: 0 }}>{active.icon}</span>
                                <div>
                                    <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 3, color: active.color, fontWeight: 700, marginBottom: 8 }}>
                                        {active.label}
                                    </div>
                                    <pre style={{ fontFamily: T.mono, fontSize: 12, color: T.text, lineHeight: 1.9, whiteSpace: "pre-wrap" }}>
                                        {active.explain}
                                    </pre>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Speed + use-cases grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                {/* Speed */}
                <GlassCard style={{ padding: 24 }}>
                    <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 4, color: T.neon, fontWeight: 700, marginBottom: 20 }}>
                        ⚡ RELATIVE EXECUTION SPEED
                    </div>
                    {speedData.map((d, i) => (
                        <div key={d.lang} style={{ marginBottom: 14 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <span style={{ fontFamily: T.mono, fontWeight: 700, fontSize: 13, color: d.color, minWidth: 36 }}>{d.lang}</span>
                                    <NeonTag color={d.color}>{d.label}</NeonTag>
                                </div>
                                <span style={{ fontFamily: T.mono, fontSize: 12, color: d.color }}>{d.value}%</span>
                            </div>
                            <div style={{ height: 6, background: T.dim, borderRadius: 3, overflow: "hidden" }}>
                                <motion.div
                                    initial={{ width: 0 }}
                                    whileInView={{ width: `${d.value}%` }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 1.3, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                                    style={{ height: "100%", borderRadius: 3, background: `linear-gradient(90deg, ${d.color}99, ${d.color})`, position: "relative" }}
                                >
                                    <motion.div
                                        animate={{ opacity: [0, 1, 0] }}
                                        transition={{ duration: 0.8, delay: i * 0.12 + 1.1 }}
                                        style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 3, background: "white", borderRadius: 3 }}
                                    />
                                </motion.div>
                            </div>
                        </div>
                    ))}
                    <div style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, marginTop: 10 }}>
                        * Relative benchmarks — compiled langs skip interpreter overhead entirely.
                    </div>
                </GlassCard>

                {/* C in the wild */}
                <GlassCard style={{ padding: 24 }}>
                    <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 4, color: T.neon2, fontWeight: 700, marginBottom: 18 }}>
                        🌍 C IN THE WILD
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                        {useCases.map((uc, i) => (
                            <motion.div
                                key={uc.name}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.08 }}
                                whileHover={{ x: 3 }}
                                style={{
                                    background: "rgba(0,255,163,0.04)",
                                    border: `1px solid ${T.dim}`,
                                    borderRadius: 8, padding: "12px 14px",
                                }}
                            >
                                <div style={{ fontSize: 18, marginBottom: 5 }}>{uc.icon}</div>
                                <div style={{ fontFamily: T.mono, fontSize: 11, color: T.text, fontWeight: 700 }}>{uc.name}</div>
                                <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, marginTop: 2 }}>{uc.size}</div>
                            </motion.div>
                        ))}
                    </div>
                </GlassCard>
            </div>
        </Section>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// PROGRAM STRUCTURE
// ─────────────────────────────────────────────────────────────────────────────
function ProgramStructure() {
    const [selectedPart, setSelectedPart] = useState(null);
    const [execStep, setExecStep] = useState(-1);
    const [isRunning, setIsRunning] = useState(false);

    const runExecution = async () => {
        if (isRunning) return;
        setIsRunning(true);
        setExecStep(-1);
        for (let i = 0; i < PROGRAM_CODE_LINES.length; i++) {
            await new Promise(r => setTimeout(r, 700));
            setExecStep(i);
        }
        await new Promise(r => setTimeout(r, 1200));
        setExecStep(-1);
        setIsRunning(false);
    };

    const getPartForLine = (lineIdx) => PROGRAM_PARTS.find(p => p.lines.includes(lineIdx));

    const getLineColor = (lineIdx) => {
        const part = selectedPart ? PROGRAM_PARTS.find(p => p.id === selectedPart) : null;
        if (part && part.lines.includes(lineIdx)) return part.color;
        if (!selectedPart) {
            const p = getPartForLine(lineIdx);
            return p ? p.color : T.muted;
        }
        return T.muted;
    };

    return (
        <Section id="structure">
            <SectionHeader num="02" tag="ANATOMY · PROGRAM STRUCTURE" title="Dissect a C Program" />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                <div>
                    <GlassCard style={{ overflow: "hidden" }}>
                        {/* title bar */}
                        <div style={{
                            background: "rgba(0,0,0,0.5)", borderBottom: `1px solid ${T.dim}`,
                            padding: "10px 18px", display: "flex", alignItems: "center", gap: 8,
                        }}>
                            <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#FF5F57" }} />
                            <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#FEBC2E" }} />
                            <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#28C840" }} />
                            <span style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, marginLeft: 8 }}>hello.c</span>
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={runExecution}
                                disabled={isRunning}
                                style={{
                                    marginLeft: "auto", fontFamily: T.display, fontSize: 9, fontWeight: 700,
                                    letterSpacing: 2, color: "#000", background: isRunning ? T.muted : T.neon,
                                    border: "none", borderRadius: 4, padding: "4px 13px", cursor: isRunning ? "not-allowed" : "pointer",
                                }}
                            >
                                {isRunning ? "RUNNING…" : "▶ RUN"}
                            </motion.button>
                        </div>

                        <div style={{ padding: "20px 0 20px 0" }}>
                            {PROGRAM_CODE_LINES.map((line, i) => {
                                const part = getPartForLine(i);
                                const isExecActive = execStep === i;
                                return (
                                    <motion.div
                                        key={i}
                                        animate={{
                                            background: isExecActive ? `${T.neon}14` : "transparent",
                                            paddingLeft: isExecActive ? 22 : 16,
                                        }}
                                        onClick={() => part && setSelectedPart(selectedPart === part.id ? null : part.id)}
                                        style={{
                                            fontFamily: T.mono, fontSize: 13, lineHeight: 2.1,
                                            color: getLineColor(i),
                                            paddingRight: 20,
                                            borderLeft: `2px solid ${isExecActive ? T.neon : (part && selectedPart === part.id ? part.color : "transparent")}`,
                                            cursor: part ? "pointer" : "default",
                                            transition: "color 0.2s, border-color 0.2s",
                                            position: "relative",
                                        }}
                                    >
                                        <span style={{ color: T.dim, marginRight: 16, userSelect: "none", fontSize: 10 }}>{i + 1}</span>
                                        {line.text}
                                        <AnimatePresence>
                                            {isExecActive && (
                                                <motion.span
                                                    initial={{ opacity: 0, x: 8 }}
                                                    animate={{ opacity: [1, 0.4, 1], x: 0 }}
                                                    exit={{ opacity: 0 }}
                                                    transition={{ opacity: { duration: 0.6, repeat: Infinity }, x: { duration: 0.2 } }}
                                                    style={{ color: T.neon, marginLeft: 10, fontSize: 10, position: "absolute", right: 16 }}
                                                >
                                                    ◀ executing
                                                </motion.span>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </GlassCard>

                    <GlassCard style={{ padding: "14px 18px", marginTop: 14 }} hover={false}>
                        <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 3, color: T.neon, fontWeight: 700, marginBottom: 10 }}>
                            EXECUTION ORDER
                        </div>
                        <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
                            {["#include", "main()", "printf()", "return 0", "EXIT"].map((step, i) => (
                                <div key={step} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    <motion.div
                                        animate={isRunning && execStep >= i ? {
                                            borderColor: T.neon, color: T.neon, background: `${T.neon}14`,
                                        } : {}}
                                        style={{
                                            fontFamily: T.mono, fontSize: 10, color: T.muted,
                                            border: `1px solid ${T.dim}`, background: "transparent",
                                            borderRadius: 4, padding: "3px 10px", transition: "all 0.3s",
                                        }}
                                    >
                                        {step}
                                    </motion.div>
                                    {i < 4 && <span style={{ color: T.dim, fontSize: 11 }}>→</span>}
                                </div>
                            ))}
                        </div>
                    </GlassCard>
                </div>

                {/* Parts panel */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {PROGRAM_PARTS.map(part => (
                        <motion.div
                            key={part.id}
                            whileHover={{ x: 4 }}
                            onClick={() => setSelectedPart(selectedPart === part.id ? null : part.id)}
                            style={{
                                background: selectedPart === part.id ? `${part.color}0E` : "rgba(255,255,255,0.015)",
                                border: `1px solid ${selectedPart === part.id ? part.color : T.dim}`,
                                borderRadius: 10, padding: 16, cursor: "pointer",
                                transition: "border-color 0.2s, background 0.2s",
                            }}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                                <span style={{ fontSize: 16 }}>{part.icon}</span>
                                <div style={{ width: 7, height: 7, borderRadius: "50%", background: part.color }} />
                                <div style={{ fontFamily: T.mono, fontSize: 12, fontWeight: 700, color: part.color }}>{part.short}</div>
                            </div>
                            <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 2, color: T.muted, marginBottom: 0 }}>{part.label}</div>
                            <AnimatePresence>
                                {selectedPart === part.id && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.28 }}
                                        style={{ overflow: "hidden" }}
                                    >
                                        <div style={{
                                            fontFamily: T.mono, fontSize: 11, color: T.text, lineHeight: 1.75,
                                            borderTop: `1px solid ${part.color}28`, paddingTop: 10, marginTop: 10,
                                        }}>
                                            {part.detail}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            </div>
        </Section>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// KEYWORDS & IDENTIFIERS
// ─────────────────────────────────────────────────────────────────────────────
function KeywordsIdentifiers() {
    const [code, setCode] = useState(`int main() {\n    int age = 25;\n    float score = 99.5;\n    char grade = 'A';\n    return 0;\n}`);
    const [hoveredKw, setHoveredKw] = useState(null);
    const [invalidIds, setInvalidIds] = useState([]);

    const tokens = useMemo(() => tokenize(code), [code]);

    useEffect(() => {
        const words = code.split(/\W+/).filter(Boolean);
        const invalid = words.filter(w => /^[0-9]/.test(w) && /[a-zA-Z]/.test(w));
        setInvalidIds(invalid);
    }, [code]);

    const stats = useMemo(() => {
        const kws = tokens.filter(t => t.type === "keyword").map(t => t.val);
        const ids = [...new Set(tokens.filter(t => t.type === "identifier").map(t => t.val))];
        return { keywords: [...new Set(kws)], identifiers: ids };
    }, [tokens]);

    const getTokenColor = (type) => ({
        keyword: "#89DDFF",
        identifier: "#C3E88D",
        string: "#F78C6C",
        number: "#FFB347",
        comment: "#546E7A",
    }[type] || T.text);

    const renderHighlighted = () => {
        const lines = code.split("\n");
        let charOffset = 0;
        return lines.map((line, lineIdx) => {
            const lineStart = charOffset;
            const lineEnd = lineStart + line.length;
            charOffset += line.length + 1;
            const lineTokens = tokens.filter(t => t.start >= lineStart && t.start < lineEnd);
            let cursor = 0;
            const parts = [];
            lineTokens.forEach((tok, i) => {
                const tokStart = tok.start - lineStart;
                if (tokStart > cursor) {
                    parts.push(<span key={`g${i}`} style={{ color: T.text }}>{line.slice(cursor, tokStart)}</span>);
                }
                parts.push(
                    <motion.span
                        key={`t${i}`}
                        animate={hoveredKw === tok.val && tok.type === "keyword" ? { background: "rgba(137,221,255,0.2)" } : { background: "transparent" }}
                        style={{
                            color: getTokenColor(tok.type),
                            borderRadius: 2, padding: "0 1px",
                            cursor: tok.type === "keyword" ? "help" : "default",
                            textDecoration: tok.type === "keyword" ? "underline dotted rgba(137,221,255,0.4)" : "none",
                        }}
                        onMouseEnter={() => tok.type === "keyword" && setHoveredKw(tok.val)}
                        onMouseLeave={() => setHoveredKw(null)}
                    >
                        {tok.val}
                    </motion.span>
                );
                cursor = tokStart + tok.val.length;
            });
            if (cursor < line.length) parts.push(<span key="tail" style={{ color: T.text }}>{line.slice(cursor)}</span>);
            return (
                <div key={lineIdx} style={{ display: "flex", lineHeight: 1.95 }}>
                    <span style={{ color: T.muted, fontSize: 10, minWidth: 26, userSelect: "none", textAlign: "right", paddingRight: 14, marginTop: 2 }}>
                        {lineIdx + 1}
                    </span>
                    <div>{parts}</div>
                </div>
            );
        });
    };

    return (
        <Section id="keywords">
            <SectionHeader num="03" tag="PARSER LAB · KEYWORDS & IDENTIFIERS" title="Live Token Classifier" />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 22 }}>
                <div>
                    <GlassCard style={{ overflow: "hidden" }}>
                        <div style={{
                            background: "rgba(0,0,0,0.45)", borderBottom: `1px solid ${T.dim}`,
                            padding: "10px 18px", display: "flex", justifyContent: "space-between", alignItems: "center",
                        }}>
                            <span style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 3, color: T.neon }}>LIVE PARSER</span>
                            <div style={{ display: "flex", gap: 14 }}>
                                {[["KEYWORD", "#89DDFF"], ["IDENTIFIER", "#C3E88D"], ["LITERAL", "#F78C6C"], ["NUMBER", "#FFB347"]].map(([label, color]) => (
                                    <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                        <div style={{ width: 7, height: 7, borderRadius: 2, background: color }} />
                                        <span style={{ fontFamily: T.mono, fontSize: 8, color: T.muted }}>{label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div style={{ position: "relative", padding: 20 }}>
                            <div style={{ fontFamily: T.mono, fontSize: 13, pointerEvents: "none", minHeight: 160 }}>
                                {renderHighlighted()}
                            </div>
                            <textarea
                                value={code}
                                onChange={e => setCode(e.target.value)}
                                spellCheck={false}
                                style={{
                                    position: "absolute", inset: 20,
                                    fontFamily: T.mono, fontSize: 13, lineHeight: 1.95,
                                    background: "transparent", color: "transparent",
                                    caretColor: T.neon, border: "none", outline: "none",
                                    resize: "none", width: "calc(100% - 40px)", padding: 0, overflow: "hidden",
                                }}
                            />
                        </div>
                    </GlassCard>

                    <div style={{ display: "flex", gap: 12, marginTop: 14 }}>
                        {[
                            { label: "KEYWORDS FOUND", color: "#89DDFF", items: stats.keywords },
                            { label: "IDENTIFIERS FOUND", color: "#C3E88D", items: stats.identifiers },
                        ].map(({ label, color, items }) => (
                            <GlassCard key={label} style={{ flex: 1, padding: "13px 16px" }} hover={false}>
                                <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 3, color, marginBottom: 8 }}>{label}</div>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                                    {items.length === 0
                                        ? <span style={{ fontFamily: T.mono, fontSize: 10, color: T.muted }}>none</span>
                                        : items.map(kw => (
                                            <motion.span
                                                key={kw}
                                                initial={{ scale: 0.7, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                transition={{ type: "spring", stiffness: 300 }}
                                                style={{
                                                    fontFamily: T.mono, fontSize: 10, color,
                                                    background: `${color}12`, border: `1px solid ${color}22`,
                                                    padding: "2px 8px", borderRadius: 3,
                                                }}
                                            >
                                                {kw}
                                            </motion.span>
                                        ))
                                    }
                                </div>
                            </GlassCard>
                        ))}
                    </div>

                    <AnimatePresence>
                        {invalidIds.length > 0 && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                style={{
                                    background: "rgba(255,107,107,0.07)", border: `1px solid ${T.neon3}33`,
                                    borderRadius: 8, padding: "11px 15px", marginTop: 11,
                                    fontFamily: T.mono, fontSize: 11, color: T.neon3,
                                }}
                            >
                                ⚠ Invalid identifier(s): <strong>{invalidIds.join(", ")}</strong> — cannot start with a digit.
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <GlassCard style={{ padding: 16 }} hover={false}>
                        <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 3, color: T.neon, fontWeight: 700, marginBottom: 10 }}>
                            IDENTIFIER RULES
                        </div>
                        {[
                            ["✅ Start with letter or _", true],
                            ["✅ Can contain letters, digits, _", true],
                            ["✅ Case-sensitive: a ≠ A", true],
                            ["❌ Cannot start with a digit", false],
                            ["❌ Cannot be a keyword", false],
                            ["❌ No spaces or special chars", false],
                        ].map(([rule, ok]) => (
                            <div key={rule} style={{ fontFamily: T.mono, fontSize: 10, color: ok ? "#C3E88D" : T.neon3, lineHeight: 1.95 }}>
                                {rule}
                            </div>
                        ))}
                    </GlassCard>

                    <AnimatePresence mode="wait">
                        {hoveredKw ? (
                            <motion.div
                                key={hoveredKw}
                                initial={{ opacity: 0, y: 8, scale: 0.97 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 8, scale: 0.97 }}
                                style={{
                                    background: "rgba(137,221,255,0.06)",
                                    border: "1px solid rgba(137,221,255,0.28)",
                                    borderRadius: 10, padding: 16,
                                }}
                            >
                                <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 3, color: "#89DDFF", marginBottom: 6 }}>KEYWORD</div>
                                <div style={{ fontFamily: T.mono, fontSize: 18, fontWeight: 700, color: "#89DDFF", marginBottom: 10 }}>
                                    {hoveredKw}
                                </div>
                                <div style={{ fontFamily: T.mono, fontSize: 11, color: T.text, lineHeight: 1.75 }}>
                                    {C_KEYWORDS[hoveredKw]}
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="hint"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                style={{
                                    background: "rgba(255,255,255,0.02)", border: `1px solid ${T.dim}`,
                                    borderRadius: 10, padding: 16, fontFamily: T.mono, fontSize: 11,
                                    color: T.muted, textAlign: "center", lineHeight: 1.8,
                                }}
                            >
                                Hover a <span style={{ color: "#89DDFF" }}>keyword</span> in the editor to see its definition.
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </Section>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPILATION PIPELINE
// ─────────────────────────────────────────────────────────────────────────────
function CompilationPipeline() {
    const [step, setStep] = useState(0);
    const [animDir, setAnimDir] = useState(1);
    const [autoPlay, setAutoPlay] = useState(false);
    const autoRef = useRef(null);

    const goTo = (next) => {
        setAnimDir(next > step ? 1 : -1);
        setStep(next);
    };

    useEffect(() => {
        if (autoPlay) {
            autoRef.current = setInterval(() => {
                setStep(s => {
                    const next = (s + 1) % COMPILE_STAGES.length;
                    setAnimDir(1);
                    return next;
                });
            }, 2500);
        } else {
            clearInterval(autoRef.current);
        }
        return () => clearInterval(autoRef.current);
    }, [autoPlay]);

    const current = COMPILE_STAGES[step];
    const variants = {
        enter: (dir) => ({ x: dir > 0 ? 50 : -50, opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit: (dir) => ({ x: dir > 0 ? -50 : 50, opacity: 0 }),
    };

    return (
        <Section id="compilation">
            <SectionHeader num="04" tag="DEEP PIPELINE · HOW C COMPILES" title="The 6-Stage Transformation" />

            {/* Stage tabs */}
            <div style={{ display: "flex", background: "rgba(0,0,0,0.4)", border: `1px solid ${T.dim}`, borderRadius: 10, padding: 5, gap: 3, marginBottom: 24 }}>
                {COMPILE_STAGES.map((s, i) => (
                    <motion.button
                        key={s.id}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => goTo(i)}
                        style={{
                            flex: 1, padding: "9px 5px", border: "none", cursor: "pointer", borderRadius: 7,
                            fontFamily: T.mono, fontSize: 8, fontWeight: 700, letterSpacing: 1.5, textAlign: "center",
                            background: step === i ? `${s.color}1A` : "transparent",
                            color: step === i ? s.color : T.muted,
                            borderBottom: step === i ? `2px solid ${s.color}` : "2px solid transparent",
                            transition: "all 0.2s",
                        }}
                    >
                        <div style={{ fontSize: 14, marginBottom: 3 }}>{s.icon}</div>
                        {s.label}
                        <div style={{ fontSize: 7, marginTop: 2, opacity: 0.6 }}>{s.sublabel}</div>
                    </motion.button>
                ))}
            </div>

            <AnimatePresence mode="wait" custom={animDir}>
                <motion.div key={step} custom={animDir} variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 18, alignItems: "center", marginBottom: 16 }}>
                        <GlassCard style={{ padding: 20 }} hover={false}>
                            <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 3, color: T.muted, marginBottom: 10 }}>INPUT</div>
                            <pre style={{ fontFamily: T.mono, fontSize: 11, color: T.text, lineHeight: 1.85, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                                {current.input}
                            </pre>
                        </GlassCard>

                        <div style={{ textAlign: "center", padding: "0 10px" }}>
                            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.4, repeat: Infinity }} style={{ fontSize: 28, marginBottom: 6 }}>
                                {current.transformIcon}
                            </motion.div>
                            <div style={{ fontFamily: T.mono, fontSize: 9, fontWeight: 700, color: current.color, letterSpacing: 2, marginBottom: 8 }}>
                                {current.transformLabel}
                            </div>
                            <motion.div animate={{ x: [0, 7, 0] }} transition={{ duration: 0.85, repeat: Infinity }} style={{ fontSize: 24, color: current.color }}>
                                →
                            </motion.div>
                        </div>

                        <GlassCard style={{ padding: 20, borderColor: `${current.color}35`, background: `${current.color}06` }} hover={false}>
                            <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 3, color: current.color, marginBottom: 10 }}>OUTPUT</div>
                            <pre style={{ fontFamily: T.mono, fontSize: 11, color: T.text, lineHeight: 1.85, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                                {current.output}
                            </pre>
                        </GlassCard>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.18 }}
                        style={{
                            background: `${current.color}0A`, border: `1px solid ${current.color}25`,
                            borderRadius: 10, padding: "14px 20px",
                            fontFamily: T.mono, fontSize: 12, color: T.text, lineHeight: 1.85,
                            display: "flex", gap: 12, alignItems: "flex-start",
                        }}
                    >
                        <span style={{ fontSize: 18 }}>{current.icon}</span>
                        <div>
                            <div style={{ color: current.color, fontWeight: 700, marginBottom: 4, fontSize: 10, letterSpacing: 1 }}>{current.label}</div>
                            {current.desc}
                        </div>
                    </motion.div>
                </motion.div>
            </AnimatePresence>

            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 14, marginTop: 20 }}>
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => step > 0 && goTo(step - 1)}
                    disabled={step === 0}
                    style={{
                        fontFamily: T.display, fontWeight: 700, fontSize: 10, letterSpacing: 2,
                        color: step === 0 ? T.muted : T.neon, padding: "9px 22px",
                        background: "transparent", border: `1px solid ${step === 0 ? T.dim : T.border}`,
                        borderRadius: 6, cursor: step === 0 ? "not-allowed" : "pointer",
                    }}
                >← PREV</motion.button>

                <div style={{ display: "flex", gap: 5 }}>
                    {COMPILE_STAGES.map((s, i) => (
                        <motion.button
                            key={s.id}
                            onClick={() => goTo(i)}
                            animate={{ background: step === i ? s.color : T.dim, scale: step === i ? 1.3 : 1 }}
                            style={{ width: 7, height: 7, borderRadius: "50%", border: "none", cursor: "pointer", padding: 0 }}
                        />
                    ))}
                </div>

                {/* Auto-play toggle */}
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setAutoPlay(!autoPlay)}
                    style={{
                        fontFamily: T.display, fontWeight: 700, fontSize: 9, letterSpacing: 2,
                        color: autoPlay ? "#000" : T.neon2, padding: "9px 16px",
                        background: autoPlay ? T.neon2 : "transparent",
                        border: `1px solid ${autoPlay ? T.neon2 : T.dim}`,
                        borderRadius: 6, cursor: "pointer",
                    }}
                >
                    {autoPlay ? "⏸ PAUSE" : "▶ AUTO"}
                </motion.button>

                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => step < COMPILE_STAGES.length - 1 && goTo(step + 1)}
                    disabled={step === COMPILE_STAGES.length - 1}
                    style={{
                        fontFamily: T.display, fontWeight: 700, fontSize: 10, letterSpacing: 2,
                        color: step === COMPILE_STAGES.length - 1 ? T.muted : T.neon, padding: "9px 22px",
                        background: "transparent", border: `1px solid ${step === COMPILE_STAGES.length - 1 ? T.dim : T.border}`,
                        borderRadius: 6, cursor: step === COMPILE_STAGES.length - 1 ? "not-allowed" : "pointer",
                    }}
                >NEXT →</motion.button>
            </div>
        </Section>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// EXECUTION VISUALIZER
// ─────────────────────────────────────────────────────────────────────────────
function ExecutionVisualizer() {
    const [running, setRunning] = useState(false);
    const [currentLine, setCurrentLine] = useState(-1);
    const [memory, setMemory] = useState({});
    const [output, setOutput] = useState("");
    const [phase, setPhase] = useState("");
    const [done, setDone] = useState(false);

    const reset = () => { setRunning(false); setCurrentLine(-1); setMemory({}); setOutput(""); setPhase(""); setDone(false); };

    const run = async () => {
        if (running) return;
        reset();
        await new Promise(r => setTimeout(r, 80));
        setRunning(true);
        const phaseMap = { preprocessor: "PREPROCESS", entry: "ENTER MAIN", stmt: "ALLOCATE", output: "CALL printf", return: "RETURN 0", close: "EXIT" };
        for (let i = 0; i < EV_CODE.length; i++) {
            setCurrentLine(i);
            const step = EV_CODE[i];
            setPhase(phaseMap[step.type] || "");
            if (step.mem) setMemory({ ...step.mem });
            if (step.out) setOutput(prev => prev + step.out);
            await new Promise(r => setTimeout(r, 880));
        }
        setRunning(false);
        setDone(true);
    };

    const typeColor = { preprocessor: T.accent, entry: T.neon2, stmt: T.neon4, output: "#C3E88D", return: T.neon3, close: T.neon2 };

    return (
        <Section id="execution">
            <SectionHeader num="05" tag="RUNTIME SIM · EXECUTION VISUALIZER" title="Watch Code Run Line by Line" />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
                <GlassCard style={{ overflow: "hidden" }}>
                    <div style={{
                        background: "rgba(0,0,0,0.45)", borderBottom: `1px solid ${T.dim}`,
                        padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between",
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <motion.div
                                animate={{ background: running ? T.neon : T.muted, boxShadow: running ? `0 0 10px ${T.neon}` : "none" }}
                                transition={{ duration: 0.3 }}
                                style={{ width: 7, height: 7, borderRadius: "50%" }}
                            />
                            <span style={{ fontFamily: T.mono, fontSize: 9, color: T.muted }}>main.c</span>
                            <AnimatePresence mode="wait">
                                {phase && (
                                    <motion.span
                                        key={phase}
                                        initial={{ opacity: 0, x: 8 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -8 }}
                                        style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 2, color: T.neon, background: `${T.neon}14`, padding: "2px 8px", borderRadius: 3 }}
                                    >
                                        {phase}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </div>
                        <div style={{ display: "flex", gap: 7 }}>
                            <motion.button whileTap={{ scale: 0.95 }} onClick={run} disabled={running} style={{ fontFamily: T.display, fontWeight: 700, fontSize: 9, letterSpacing: 2, color: "#000", background: running ? T.muted : T.neon, border: "none", borderRadius: 4, padding: "5px 14px", cursor: running ? "not-allowed" : "pointer" }}>
                                {running ? "RUNNING…" : "▶ RUN"}
                            </motion.button>
                            <motion.button whileTap={{ scale: 0.95 }} onClick={reset} style={{ fontFamily: T.display, fontWeight: 700, fontSize: 9, letterSpacing: 2, color: T.muted, background: "transparent", border: `1px solid ${T.dim}`, borderRadius: 4, padding: "5px 11px", cursor: "pointer" }}>
                                RESET
                            </motion.button>
                        </div>
                    </div>

                    <div style={{ padding: "14px 0" }}>
                        {EV_CODE.map((step, i) => {
                            const isActive = currentLine === i;
                            const isPast = currentLine > i;
                            const color = typeColor[step.type] || T.text;
                            return (
                                <motion.div
                                    key={i}
                                    animate={{ background: isActive ? `${color}14` : "transparent", paddingLeft: isActive ? 22 : 16 }}
                                    transition={{ duration: 0.18 }}
                                    style={{
                                        display: "flex", alignItems: "center", gap: 10, paddingRight: 16, paddingTop: 2, paddingBottom: 2,
                                        borderLeft: `2px solid ${isActive ? color : "transparent"}`,
                                        opacity: isPast ? 0.38 : 1, transition: "opacity 0.2s",
                                    }}
                                >
                                    <span style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, minWidth: 16, textAlign: "right" }}>{i + 1}</span>
                                    <span style={{ fontFamily: T.mono, fontSize: 12, color: isActive ? color : (isPast ? T.muted : T.text) }}>
                                        {step.line}
                                    </span>
                                    {isActive && (
                                        <motion.span
                                            animate={{ opacity: [1, 0.3, 1] }}
                                            transition={{ duration: 0.55, repeat: Infinity }}
                                            style={{ fontFamily: T.mono, fontSize: 8, color, marginLeft: "auto", letterSpacing: 2 }}
                                        >
                                            ◀ NOW
                                        </motion.span>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                </GlassCard>

                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <GlassCard style={{ padding: 0, overflow: "hidden", flex: 1 }}>
                        <div style={{ background: "rgba(0,0,0,0.4)", borderBottom: `1px solid ${T.dim}`, padding: "10px 16px", fontFamily: T.mono, fontSize: 8, letterSpacing: 3, color: T.neon2 }}>
                            STACK MEMORY
                        </div>
                        <div style={{ padding: "14px 16px" }}>
                            {Object.entries(EV_MEM_ADDRS).map(([varName, addr]) => {
                                const val = memory[varName];
                                const show = val !== undefined;
                                return (
                                    <motion.div key={varName} animate={{ opacity: show ? 1 : 0.22 }} style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: T.mono, fontSize: 11, marginBottom: 12 }}>
                                        <span style={{ color: T.muted, minWidth: 55, fontSize: 10 }}>{addr}</span>
                                        <span style={{ color: T.neon2, minWidth: 36 }}>{varName}</span>
                                        <motion.div
                                            animate={{ background: show ? `${T.neon}14` : T.dim, borderColor: show ? `${T.neon}50` : T.dim }}
                                            style={{ border: "1px solid", borderRadius: 4, padding: "2px 12px", minWidth: 48, textAlign: "center" }}
                                        >
                                            <motion.span key={val} initial={{ scale: 1.5, color: T.neon }} animate={{ scale: 1, color: T.text }} transition={{ duration: 0.38 }} style={{ color: show ? T.neon : T.dim, fontWeight: show ? 700 : 400 }}>
                                                {show ? val : "—"}
                                            </motion.span>
                                        </motion.div>
                                        <span style={{ color: T.muted, fontSize: 9 }}>int</span>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </GlassCard>

                    <GlassCard style={{ padding: 0, overflow: "hidden" }}>
                        <div style={{ background: "rgba(0,0,0,0.4)", borderBottom: `1px solid ${T.dim}`, padding: "10px 16px", fontFamily: T.mono, fontSize: 8, letterSpacing: 3, color: T.neon3 }}>
                            TERMINAL OUTPUT
                        </div>
                        <div style={{ padding: "14px 16px", minHeight: 68 }}>
                            {output ? (
                                <motion.pre initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ fontFamily: T.mono, fontSize: 14, color: "#C3E88D", lineHeight: 1.85 }}>
                                    {output}
                                </motion.pre>
                            ) : (
                                <span style={{ fontFamily: T.mono, fontSize: 11, color: T.muted }}>{running ? "waiting for output…" : "press RUN to start"}</span>
                            )}
                            {running && (
                                <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.65, repeat: Infinity }} style={{ display: "inline-block", width: 7, height: 13, background: T.neon, verticalAlign: "middle", marginLeft: 2 }} />
                            )}
                        </div>
                    </GlassCard>

                    <AnimatePresence>
                        {done && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                style={{ background: `${T.neon}0E`, border: `1px solid ${T.neon}35`, borderRadius: 8, padding: "11px 15px", fontFamily: T.mono, fontSize: 11, color: T.neon, textAlign: "center" }}
                            >
                                ✅ Process exited with code 0 — SUCCESS
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </Section>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// SIDEBAR (LEFT) — fixed width, slimmer
// ─────────────────────────────────────────────────────────────────────────────
function Sidebar({ activeSection }) {
    return (
        <aside style={{
            width: 176,
            minWidth: 176,
            background: `linear-gradient(180deg, ${T.bg1} 0%, ${T.bg} 100%)`,
            borderRight: `1px solid ${T.dim}`,
            display: "flex",
            flexDirection: "column",
            padding: "26px 0",
            position: "sticky",
            top: 0,
            height: "100vh",
            overflow: "hidden",
            flexShrink: 0,
        }}>
            {/* Logo */}
            <div style={{ padding: "0 18px 22px" }}>
                <motion.div
                    animate={{ textShadow: [`0 0 20px ${T.neon}60`, `0 0 30px ${T.neon}80`, `0 0 20px ${T.neon}60`] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                    style={{ fontFamily: T.display, fontWeight: 800, fontSize: 18, letterSpacing: 2, color: T.neon }}
                >
                    C
                </motion.div>
                <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 5, color: T.muted, marginTop: 2 }}>
                    PROGRAMMING
                </div>
            </div>

            <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${T.neon}35, transparent)`, marginBottom: 14 }} />

            <nav>
                {NAV_ITEMS.map(item => {
                    const isActive = activeSection === item.id;
                    return (
                        <motion.a
                            key={item.id}
                            href={`#${item.id}`}
                            onClick={e => { e.preventDefault(); document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" }); }}
                            animate={{ color: isActive ? T.neon : T.muted, borderLeftColor: isActive ? T.neon : "transparent", background: isActive ? `${T.neon}07` : "transparent" }}
                            whileHover={{ color: T.text, paddingLeft: 24 }}
                            transition={{ duration: 0.2 }}
                            style={{
                                display: "flex", alignItems: "center", gap: 10,
                                padding: "10px 18px", fontFamily: T.mono, fontSize: 10,
                                fontWeight: 700, letterSpacing: 2, textDecoration: "none",
                                borderLeft: "2px solid transparent", transition: "all 0.2s",
                            }}
                        >
                            <span style={{ fontSize: 12, flexShrink: 0 }}>{item.icon}</span>
                            <div>
                                <div style={{ fontSize: 7, opacity: 0.45, marginBottom: 1 }}>{item.num}</div>
                                {item.label}
                            </div>
                            {isActive && (
                                <motion.div
                                    layoutId="nav-indicator"
                                    style={{ width: 4, height: 4, borderRadius: "50%", background: T.neon, marginLeft: "auto", flexShrink: 0 }}
                                />
                            )}
                        </motion.a>
                    );
                })}
            </nav>

            <div style={{ marginTop: "auto", padding: "18px 18px", fontFamily: T.mono, fontSize: 8, color: T.dim, letterSpacing: 2, lineHeight: 1.9 }}>
                C PROGRAMMING<br />v2.0
            </div>
        </aside>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// INSIGHT PANEL (RIGHT) — wider, richer
// ─────────────────────────────────────────────────────────────────────────────
function InsightPanel() {
    const [expanded, setExpanded] = useState(null);
    const [liveTime, setLiveTime] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => setLiveTime(t => t + 1), 1000);
        return () => clearInterval(interval);
    }, []);

    // Fake "compiler ops" counter
    const opsCount = useMemo(() => (liveTime * 2_871_234).toLocaleString(), [liveTime]);

    return (
        <aside style={{
            width: 272,
            minWidth: 272,
            background: `linear-gradient(180deg, ${T.bg1} 0%, ${T.bg} 100%)`,
            borderLeft: `1px solid ${T.dim}`,
            padding: "26px 14px",
            display: "flex",
            flexDirection: "column",
            gap: 0,
            overflowY: "auto",
            overflowX: "hidden",
            position: "sticky",
            top: 0,
            height: "100vh",
            flexShrink: 0,
        }}>
            {/* Header */}
            <div style={{ marginBottom: 14 }}>
                <div style={{ fontFamily: T.mono, fontSize: 8, letterSpacing: 5, color: T.neon, fontWeight: 700, marginBottom: 8 }}>
                    INSIGHT PANEL
                </div>
                <div style={{ height: 1, background: `linear-gradient(90deg, ${T.neon}35, transparent)` }} />
            </div>

            {/* Live stats ticker */}
            <motion.div
                style={{
                    background: "rgba(0,255,163,0.04)", border: `1px solid ${T.neon}18`,
                    borderRadius: 8, padding: "10px 12px", marginBottom: 14,
                }}
            >
                <div style={{ fontFamily: T.mono, fontSize: 7, letterSpacing: 4, color: T.neon, marginBottom: 8 }}>⚙ LIVE STATS</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {[
                        { label: "UPTIME", value: `${liveTime}s`, color: T.neon },
                        { label: "C KEYWORDS", value: "32", color: T.neon2 },
                        { label: "OPS SIMULATED", value: opsCount, color: T.neon4 },
                        { label: "STAGE", value: "READY", color: T.accent },
                    ].map(({ label, value, color }) => (
                        <div key={label}>
                            <div style={{ fontFamily: T.mono, fontSize: 7, letterSpacing: 2, color: T.muted }}>{label}</div>
                            <motion.div
                                key={value}
                                initial={{ opacity: 0.5, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={{ fontFamily: T.mono, fontSize: 11, fontWeight: 700, color, marginTop: 1 }}
                            >
                                {value}
                            </motion.div>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Insights */}
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                {INSIGHTS.map((ins, i) => {
                    const isExpanded = expanded === i;
                    return (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: 18 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.06 }}
                            whileHover={{ x: -3 }}
                            onClick={() => setExpanded(isExpanded ? null : i)}
                            style={{
                                background: isExpanded ? `${ins.color}0E` : (ins.tip ? `${ins.color}07` : "rgba(255,255,255,0.015)"),
                                border: `1px solid ${isExpanded ? `${ins.color}40` : (ins.tip ? `${ins.color}25` : T.dim)}`,
                                borderRadius: 9, padding: "12px 12px",
                                cursor: "pointer",
                                transition: "border-color 0.2s, background 0.2s",
                            }}
                        >
                            <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                                <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{ins.icon}</span>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6 }}>
                                        <div style={{ fontFamily: T.mono, fontSize: 7, letterSpacing: 3, color: ins.color, fontWeight: 700 }}>
                                            {ins.tip ? "⚡ " : ""}{ins.label}
                                        </div>
                                        <motion.div animate={{ rotate: isExpanded ? 90 : 0 }} style={{ color: T.muted, fontSize: 10 }}>›</motion.div>
                                    </div>
                                    <div style={{ fontFamily: T.display, fontWeight: 700, fontSize: 12, color: T.text, margin: "3px 0" }}>
                                        {ins.title}
                                    </div>
                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.25 }}
                                                style={{ overflow: "hidden" }}
                                            >
                                                <div style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, lineHeight: 1.7, marginTop: 6 }}>
                                                    {ins.body}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                    {!isExpanded && (
                                        <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, lineHeight: 1.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                            {ins.body.slice(0, 48)}…
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Bottom C tip */}
            <motion.div
                style={{
                    marginTop: 14, background: `${T.accent}0A`,
                    border: `1px solid ${T.accent}22`, borderRadius: 9, padding: "12px 12px",
                }}
                whileHover={{ borderColor: `${T.accent}44` }}
            >
                <div style={{ fontFamily: T.mono, fontSize: 7, letterSpacing: 4, color: T.accent, marginBottom: 6 }}>DID YOU KNOW</div>
                <div style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, lineHeight: 1.7 }}>
                    <span style={{ color: T.neon }}>C</span> has influenced <span style={{ color: T.neon2 }}>C++, Java, C#, Go, Rust, PHP, JavaScript</span> and dozens more. Learning C is learning the root of modern programming.
                </div>
            </motion.div>
        </aside>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// ROOT PAGE — 70:30 main:sidebar layout
// ─────────────────────────────────────────────────────────────────────────────
export default function CIntroPage() {
    const [activeSection, setActiveSection] = useState("hero");

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
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: ${T.bg}; }
        ::-webkit-scrollbar-thumb { background: ${T.neon}; border-radius: 2px; }
        @keyframes scrollUp {
          from { transform: translateY(0); }
          to   { transform: translateY(-50%); }
        }
      `}</style>

            {/*
        LAYOUT: sidebar(176px) + main(flex:7) + insight(272px)
        Main body gets ~70% of remaining space (roughly 70:30 relative to right panel).
        Total: 176 + main + 272. Main area gets all remaining width with padding.
      */}
            <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: T.bg }}>
                {/* LEFT SIDEBAR */}
                <Sidebar activeSection={activeSection} />

                {/* MAIN AREA — flex: 7 relative weight */}
                <main style={{ flex: 7, overflowY: "auto", overflowX: "hidden", minWidth: 0 }}>
                    <div style={{ maxWidth: "100%", padding: "0 36px" }}>
                        <HeroSection />
                        <WhatIsC />
                        <ProgramStructure />
                        <KeywordsIdentifiers />
                        <CompilationPipeline />
                        <ExecutionVisualizer />
                        <div style={{ height: 80 }} />
                    </div>
                </main>

                {/* RIGHT INSIGHT PANEL — flex: 3 relative weight */}
                <InsightPanel />
            </div>
        </>
    );
}