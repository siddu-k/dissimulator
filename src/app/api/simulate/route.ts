import { NextResponse } from "next/server";
import { runDisasterSimulation } from "@/lib/simulationEngine";
import { fetchRealPlaceName } from "@/lib/geo";
import { DEFAULT_FLASH_MODEL } from "@/lib/gemini";
import { BoundingBox, GeoPoint, SimulationParams } from "@/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      locationName: initialLocationName,
      center,
      boundingBox,
      params,
      apiKey,
      model = DEFAULT_FLASH_MODEL,
    }: {
      locationName?: string;
      center: GeoPoint;
      boundingBox: BoundingBox;
      params: SimulationParams;
      apiKey?: string;
      model?: string;
    } = body;

    if (!center || !boundingBox || !params) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    const effectiveApiKey = apiKey || process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
    if (!effectiveApiKey.trim()) {
      return NextResponse.json({ 
        error: "REAL_AI_KEY_REQUIRED: A valid Google Gemini API Key is required to run disaster simulations. Please enter your API key in settings." 
      }, { status: 400 });
    }

    let locationName = initialLocationName?.trim() || "";
    if (!locationName || locationName.startsWith("Lat:") || locationName === "Target Disaster Zone") {
      locationName = await fetchRealPlaceName(center.lat, center.lng);
    }

    const simulationResult = await runDisasterSimulation(
      locationName,
      center,
      boundingBox,
      params,
      apiKey,
      model
    );

    return NextResponse.json(simulationResult);
  } catch (error: any) {
    console.error("API /api/simulate error:", error);
    return NextResponse.json({ error: error.message || "Failed to execute disaster simulation" }, { status: 500 });
  }
}
