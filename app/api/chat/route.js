import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req) {
  try {
    const { messages } = await req.json();

    // -------------------------
    // 1. TRY GROQ FIRST
    // -------------------------
    try {
      const groqRes = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        temperature: 0.7,
        max_tokens: 1024,
      });

      return NextResponse.json({
        provider: "groq",
        role: "assistant",
        content: groqRes.choices[0].message.content,
      });
    } catch (groqError) {
      console.error("Groq failed → switching to Gemini", groqError.message);
    }

    // -------------------------
    // 2. FALLBACK → GEMINI
    // -------------------------
    const contents = messages.map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents,
          generationConfig: {
            maxOutputTokens: 1024,
            temperature: 0.7,
          },
        }),
      }
    );

    if (!geminiRes.ok) {
      const error = await geminiRes.json();
      const msg = error.error?.message ?? "Gemini API error";

      return NextResponse.json(
        {
          error: "Both Groq and Gemini failed",
          details: msg,
        },
        { status: 500 }
      );
    }

    const data = await geminiRes.json();
    const text =
      data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    return NextResponse.json({
      provider: "gemini",
      role: "assistant",
      content: text,
    });

  } catch (error) {
    return NextResponse.json(
      {
        error: "Server error",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// Prevent 405
export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed. Use POST." },
    { status: 405 }
  );
}