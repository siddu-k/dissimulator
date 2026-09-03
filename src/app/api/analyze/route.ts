import { NextResponse } from "next/server";
import { fetchLiveWeatherData } from "@/lib/weather";
import { fetchElevationData, fetchRealPlaceName, fetchRealRoads, generateRiskHeatPoints, generateSyntheticInfrastructure } from "@/lib/geo";
import { generateDisasterAssessmentWithGemini, DEFAULT_FLASH_MODEL } from "@/lib/gemini";
import { BoundingBox, GeoPoint, PredictionResult, RiskLevel } from "@/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      center, 
      boundingBox, 
      locationName: initialLocationName,
      apiKey,
      model = DEFAULT_FLASH_MODEL,
      userPrompt,
    }: {
      center: GeoPoint;
      boundingBox: BoundingBox;
      locationName?: string;
      apiKey?: string;
      model?: string;
      userPrompt?: string;
    } = body;

    if (!center || !boundingBox) {
      return NextResponse.json({ error: "Missing center coordinates or boundingBox" }, { status: 400 });
    }

    const effectiveApiKey = apiKey || process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
    if (!effectiveApiKey.trim()) {
      return NextResponse.json({ 
        error: "REAL_AI_KEY_REQUIRED: A valid Google Gemini API Key is required. Please open settings (top-right key icon) and enter your Gemini API key." 
      }, { status: 400 });
    }

    // 1. Resolve real place name if generic or not provided
    let locationName = initialLocationName?.trim() || "";
    if (!locationName || locationName.startsWith("Lat:") || locationName === "Selected Target Area") {
      locationName = await fetchRealPlaceName(center.lat, center.lng);
    }

    // 2. Fetch live real-world weather from Open-Meteo
    const weather = await fetchLiveWeatherData(center.lat, center.lng);

    // 3. Fetch real elevation & terrain characteristics
    const terrain = await fetchElevationData(center.lat, center.lng, boundingBox);

    // 4. Generate Infrastructure & Shelters
    const { facilities, shelters } = generateSyntheticInfrastructure(boundingBox, center);

    // 4. Calculate Area and Population
    const latKm = (boundingBox.north - boundingBox.south) * 111;
    const lngKm = (boundingBox.east - boundingBox.west) * 111 * Math.cos((center.lat * Math.PI) / 180);
    const areaKm2 = Math.round(latKm * lngKm * 10) / 10;
    const estimatedPopulation = Math.round(areaKm2 * 3200);

    // 5. Transparent Weighted Multi-factor Risk Calculation
    // Rainfall Risk (0-100)
    const rainfallRisk = Math.min(100, Math.round((weather.forecast24hRainfallMm / 100) * 80 + (weather.currentRainfallMm * 4)));
    // Elevation Risk (0-100)
    const elevationRisk = terrain.elevationRiskFactor;
    // Water Proximity (0-100)
    const waterProximity = terrain.waterProximityScore;
    // Historical / Soil Saturation Risk (0-100)
    const historicalRisk = Math.min(100, Math.round((weather.soilMoistureIndex || 60) * 0.9));
    // Population Exposure (0-100)
    const populationExposure = Math.min(100, Math.round((estimatedPopulation / 40000) * 75));
    // Infrastructure Vulnerability (0-100)
    const infrastructureVulnerability = 65;

    // Weighted Overall Score
    const overallRiskScore = Math.min(100, Math.max(5, Math.round(
      rainfallRisk * 0.30 +
      elevationRisk * 0.25 +
      waterProximity * 0.20 +
      historicalRisk * 0.10 +
      populationExposure * 0.10 +
      infrastructureVulnerability * 0.05
    )));

    let riskLevel: RiskLevel = "LOW";
    if (overallRiskScore >= 75) riskLevel = "CRITICAL";
    else if (overallRiskScore >= 55) riskLevel = "HIGH";
    else if (overallRiskScore >= 35) riskLevel = "MODERATE";

    // 6. Fetch Real Road Network from OpenStreetMap Overpass & evaluate open/closed status
    const roads = await fetchRealRoads(boundingBox, center, overallRiskScore / 100);

    // 7. GenAI Expert Assessment
    const aiAssessment = await generateDisasterAssessmentWithGemini({
      locationName,
      weather,
      terrain,
      areaKm2,
      estimatedPopulation,
      riskScores: {
        overall: overallRiskScore,
        rainfall: rainfallRisk,
        elevation: elevationRisk,
        waterProximity,
        populationExposure,
      },
      apiKey: effectiveApiKey,
      model,
      userPrompt,
    });

    const heatPoints = generateRiskHeatPoints(center, boundingBox, overallRiskScore / 100);

    const result: PredictionResult = {
      id: `pred-${Date.now()}`,
      locationName,
      center,
      boundingBox,
      areaKm2,
      estimatedPopulation,
      overallRiskScore,
      riskLevel,
      categoryScores: {
        rainfall: rainfallRisk,
        elevation: elevationRisk,
        waterProximity,
        historical: historicalRisk,
        populationExposure,
        infrastructureVulnerability,
      },
      weather,
      terrain,
      infrastructure: {
        totalHospitals: facilities.filter(f => f.type === "hospital").length,
        totalShelters: shelters.length,
        totalRoadKm: Math.round(areaKm2 * 1.8 * 10) / 10,
        criticalFacilities: facilities,
      },
      aiAssessment,
      heatPoints,
      roads,
      isDemoData: !weather.isRealApi,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("API /api/analyze error:", error);
    return NextResponse.json({ error: error.message || "Failed to analyze region" }, { status: 500 });
  }
}
