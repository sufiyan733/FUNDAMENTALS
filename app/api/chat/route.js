import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM = `Programming tutor for engineering students (C/Python/Java). Rules: no greetings, answer directly, keep short, use \`\`\`lang code blocks, bullets for lists.`;

function getMaxTokens(msg) {
  if (/code|program|write|implement|function|example/i.test(msg)) return 500;
  if (/explain|what|how|why|difference|compare/i.test(msg)) return 350;
  return 250;
}

export async function POST(req) {
  try {
    const { message } = await req.json();
    if (!message) return NextResponse.json({ error: "No message" }, { status: 400 });

    const maxTokens = getMaxTokens(message);
    const msgs = [
      { role: "system", content: SYSTEM },
      { role: "user", content: message },
    ];

    // 1. TRY GEMINI
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              { role: "user", parts: [{ text: SYSTEM + "\n\nQ: " + message }] },
            ],
            generationConfig: { maxOutputTokens: maxTokens, temperature: 0.4 },
          }),
        }
      );
      if (res.ok) {
        const d = await res.json();
        const t = d.candidates?.[0]?.content?.parts?.[0]?.text;
        if (t) return NextResponse.json({ content: t });
      }
    } catch {}

    // 2. FALLBACK → GROQ
    try {
      const r = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: msgs,
        temperature: 0.4,
        max_tokens: maxTokens,
      });
      return NextResponse.json({ content: r.choices[0].message.content });
    } catch {}

    return NextResponse.json({ error: "API unavailable. Try again." }, { status: 500 });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: "POST only" }, { status: 405 });
}