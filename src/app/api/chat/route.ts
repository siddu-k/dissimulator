import { NextResponse } from "next/server";
import { getGeminiClient, DEFAULT_FLASH_MODEL } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const { messages, contextData, apiKey, model = DEFAULT_FLASH_MODEL } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages payload" }, { status: 400 });
    }

    const effectiveApiKey = apiKey || process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
    const client = getGeminiClient(effectiveApiKey);
    if (!client) {
      return NextResponse.json({
        reply: "🔑 **Real AI API Key Required:** Please configure your Google Gemini API key in settings (top right) to chat with the real disaster intelligence officer.",
      });
    }

    const lastUserMessage = messages[messages.length - 1]?.content || "Provide emergency advice.";

    const systemContext = `
You are the AI Disaster Intelligence Officer for DisasterLens Command Platform.
CURRENT SITUATIONAL CONTEXT:
${contextData ? JSON.stringify(contextData, null, 2) : "No active scenario loaded yet."}

RULES:
1. Ground your answers strictly in the provided situational context or physics of disaster management.
2. Be concise, direct, and actionable (bullet points preferred for tactical decisions).
3. Do not invent arbitrary numbers that contradict the active telemetry.
4. Always prioritize human life safety, road evacuation status, and high-ground routing.
`;

    const fullPrompt = `${systemContext}\n\nUSER QUESTION: ${lastUserMessage}`;
    const response = await client.models.generateContent({
      model: model || DEFAULT_FLASH_MODEL,
      contents: fullPrompt,
    });

    return NextResponse.json({
      reply: response.text || "Real AI assessment completed.",
    });
  } catch (err: any) {
    console.error("API /api/chat error:", err);
    return NextResponse.json({
      reply: `⚠️ Real AI Error: ${err.message || "Failed to contact Gemini Flash"}. Please verify your API key.`,
    });
  }
}
