import { NextResponse } from "next/server";
import { parseNaturalLanguageScenarioWithGemini } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const { prompt, apiKey, model } = await req.json();
    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const effectiveApiKey = apiKey || process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
    if (!effectiveApiKey.trim()) {
      return NextResponse.json({ 
        error: "REAL_AI_KEY_REQUIRED: A valid Google Gemini API Key is required to parse scenarios with Real AI." 
      }, { status: 400 });
    }

    const params = await parseNaturalLanguageScenarioWithGemini(prompt, effectiveApiKey, model);
    return NextResponse.json(params);
  } catch (err: any) {
    console.error("API /api/parse-scenario error:", err);
    return NextResponse.json({ error: err.message || "Failed to parse scenario" }, { status: 500 });
  }
}
