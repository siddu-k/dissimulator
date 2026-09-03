import { GoogleGenAI } from "@google/genai";
import { PredictionResult, SimulationParams, SimulationResult } from "@/types";

export interface AIAnalysisRequest {
  locationName: string;
  weather: any;
  terrain: any;
  riskScores: any;
  areaKm2: number;
  estimatedPopulation: number;
  apiKey?: string;
  model?: string;
  userPrompt?: string;
}

export const DEFAULT_FLASH_MODEL = "gemini-3.5-flash-lite";

export function getGeminiClient(apiKey?: string) {
  const key = apiKey || process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
  if (!key || !key.trim()) return null;
  return new GoogleGenAI({ apiKey: key.trim() });
}

export function resolveFlashModelName(model?: string): string {
  if (!model || !model.trim()) return DEFAULT_FLASH_MODEL;
  return model.trim();
}

async function callGeminiFlash(client: GoogleGenAI, prompt: string, modelName: string): Promise<string> {
  const resolved = resolveFlashModelName(modelName);
  const modelsToTry = [
    resolved,
    "gemini-3.5-flash-lite",
    "gemini-1.5-flash",
    "gemini-2.0-flash",
    "gemini-2.5-flash-lite",
    "gemini-2.5-flash",
  ].filter((v, i, a) => a.indexOf(v) === i);

  let lastError: any = null;
  for (const m of modelsToTry) {
    try {
      const response = await client.models.generateContent({
        model: m,
        contents: prompt,
      });
      const text = response.text || "";
      if (text) return text;
    } catch (err: any) {
      lastError = err;
      // If error is model not found (404), continue loop to next flash fallback
      const msg = err?.message || String(err);
      if (msg.includes("404") || msg.includes("not found") || msg.includes("NOT_FOUND")) {
        console.warn(`Model ${m} not found, trying next flash candidate...`);
        continue;
      }
      // Otherwise rethrow immediately (e.g. invalid key, quota, permission)
      throw err;
    }
  }

  throw lastError || new Error("Failed to generate content with Gemini Flash model.");
}

export async function generateDisasterAssessmentWithGemini(data: AIAnalysisRequest) {
  const client = getGeminiClient(data.apiKey);
  if (!client) {
    throw new Error(
      "REAL_AI_REQUIRED: A valid Google Gemini API key is required to perform real AI predictions. Please configure your Gemini API Key in the top-right settings."
    );
  }

  const modelName = resolveFlashModelName(data.model);

  const prompt = `
You are an advanced Disaster Risk Intelligence Officer and AI Emergency Modeler.
Analyze this geographic region using the verified real-time measurements below:

LOCATION: ${data.locationName}
AREA: ${data.areaKm2} km²
ESTIMATED POPULATION: ${data.estimatedPopulation.toLocaleString()}
MEASURED WEATHER:
- 24h Forecast Precipitation: ${data.weather.forecast24hRainfallMm} mm
- Current Rain: ${data.weather.currentRainfallMm} mm/h
- Wind Speed: ${data.weather.windSpeedKmh} km/h
- Soil Moisture Index: ${data.weather.soilMoistureIndex}%
- Weather Alert: ${data.weather.weatherAlert || "None"}

TERRAIN & ELEVATION:
- Average Elevation: ${data.terrain.elevationM}m (Min: ${data.terrain.minElevationM}m, Max: ${data.terrain.maxElevationM}m)
- Terrain Category: ${data.terrain.terrainType}
- Water Proximity / River Distance: ${data.terrain.riverDistanceMeters}m

CALCULATED MULTI-FACTOR RISK SCORES (0-100):
- Overall Risk: ${data.riskScores.overall} / 100
- Rainfall Risk: ${data.riskScores.rainfall}
- Elevation / Topographic Risk: ${data.riskScores.elevation}
- Water Body Proximity: ${data.riskScores.waterProximity}
- Population Exposure Risk: ${data.riskScores.populationExposure}

${data.userPrompt ? `USER SPECIFIC INQUIRY / QUESTION:\n"${data.userPrompt}"\nEnsure the summary and detailed sections directly answer the user's specific question using the telemetry data.\n` : ""}

Provide a comprehensive, professional disaster assessment in valid JSON format with the following exact keys:
{
  "summary": "2-3 sentences executive summary directly answering the user inquiry and explaining why this area is at this risk level based on the real data.",
  "vulnerableZones": "Detailed description of low-lying basins, riverbanks, and specific terrain funnels most at risk.",
  "peopleImpact": "Assessment of potential human displacement, elderly/vulnerable population risks, and safety factors.",
  "infrastructureImpact": "Assessment of power grids, hospitals, bridges, and municipal services under this condition.",
  "roadRisks": "Explanation of arterial roads or low-level underpasses likely to experience hazardous inundation.",
  "precautions": ["Action 1", "Action 2", "Action 3", "Action 4"],
  "evacuationPriorities": ["Priority 1", "Priority 2", "Priority 3"],
  "limitations": "Scientific disclaimer noting sensor latency, micro-topography variations, and that this is an AI-assisted estimate."
}

Return ONLY the raw JSON string without markdown code fences.
`;

  try {
    const rawText = await callGeminiFlash(client, prompt, modelName);
    let text = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    
    // Extract JSON object if any surrounding commentary exists
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      text = jsonMatch[0];
    }
    
    const parsed = JSON.parse(text);
    return {
      summary: parsed.summary || "AI-assisted risk analysis indicates localized water accumulation potential.",
      vulnerableZones: parsed.vulnerableZones || "Low-elevation river confluence zones and urban underpasses.",
      peopleImpact: parsed.peopleImpact || `An estimated ${data.estimatedPopulation.toLocaleString()} residents are located within the surveyed perimeter.`,
      infrastructureImpact: parsed.infrastructureImpact || "Substations and arterial bridges may face stormwater stress.",
      roadRisks: parsed.roadRisks || "Lowland transit arteries may experience transit disruptions during peak deluge.",
      precautions: Array.isArray(parsed.precautions) && parsed.precautions.length > 0 ? parsed.precautions : [
        "Activate municipal drainage pump stations.",
        "Issue flash flood warnings to river basin neighborhoods.",
        "Pre-position high-clearance rescue vehicles.",
        "Inspect bridge culverts for debris blockages."
      ],
      evacuationPriorities: Array.isArray(parsed.evacuationPriorities) && parsed.evacuationPriorities.length > 0 ? parsed.evacuationPriorities : [
        "Phase 1: Sub-5m elevation homes within 300m of riverbanks",
        "Phase 2: Ground-floor occupants in flat drainage basins",
        "Phase 3: Critical care facilities requiring emergency backup power"
      ],
      limitations: parsed.limitations || "Based on live Open-Meteo and GIS digital elevation datasets. Real AI inference via Gemini Flash."
    };
  } catch (err: any) {
    console.error("Gemini API call error in generateDisasterAssessmentWithGemini:", err);
    throw new Error(`Real AI Error (${err.message || "Failed to communicate with Gemini Flash"})`);
  }
}

export async function generateSimulationReportWithGemini(
  locationName: string,
  params: SimulationParams,
  maxAffectedArea: number,
  maxPeopleExposed: number,
  blockedRoadCount: number,
  apiKey?: string,
  model?: string
) {
  const client = getGeminiClient(apiKey);
  if (!client) {
    throw new Error(
      "REAL_AI_REQUIRED: A valid Google Gemini API key is required to perform real AI simulations. Please configure your Gemini API Key in the top-right settings."
    );
  }

  const modelName = resolveFlashModelName(model);

  const prompt = `
You are a senior Emergency Disaster Coordinator evaluating an executed numerical simulation:

SCENARIO:
- Disaster Type: ${params.disasterType}
- Simulated Precipitation: ${params.rainfallMm} mm
- Duration: ${params.durationHours} hours
- Water Level Surge: +${params.riverLevelIncreaseM} m
- Severity Level: ${params.severity}
- Location: ${locationName}
${params.customPrompt ? `- User Scenario Prompt: "${params.customPrompt}"` : ""}

SIMULATION ENGINE OUTPUTS:
- Max Inundated / Affected Area: ${maxAffectedArea} km²
- Total Population Exposed to Hazard: ${maxPeopleExposed.toLocaleString()}
- Blocked Road Corridors: ${blockedRoadCount} segments submerged / impassable

${params.customPrompt ? `Directly address what the user asked in "${params.customPrompt}" in the response.` : ""}

Generate an actionable disaster response summary in valid JSON format:
{
  "situationSummary": "A concise operational overview of the flood crest and water trajectory.",
  "mostVulnerableAreas": "Specific zones where water accumulation peaks and why.",
  "humanImpactAnalysis": "Actionable evaluation of casualties, vulnerable groups, and shelter demands.",
  "infrastructureImpactAnalysis": "Road network severance, bridge stress, and critical facility accessibility.",
  "evacuationPriorities": ["1st priority area/group", "2nd priority", "3rd priority"],
  "recommendedActions": ["Operational action 1", "Action 2", "Action 3", "Action 4"],
  "importantLimitations": "Disclaimer on hydrodynamic modeling resolution and soil absorption assumptions."
}

Return ONLY the raw JSON string without markdown code fences.
`;

  try {
    const rawText = await callGeminiFlash(client, prompt, modelName);
    let text = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      text = jsonMatch[0];
    }

    const parsed = JSON.parse(text);
    return {
      situationSummary: parsed.situationSummary || "Hydrodynamic simulation demonstrates progressive basin inundation with severe roadway cutoff.",
      mostVulnerableAreas: parsed.mostVulnerableAreas || "Valley floor residences and low-elevation arterial intersections.",
      humanImpactAnalysis: parsed.humanImpactAnalysis || `${maxPeopleExposed.toLocaleString()} persons are within the hazardous inundation envelope.`,
      infrastructureImpactAnalysis: parsed.infrastructureImpactAnalysis || `${blockedRoadCount} road corridors compromised, disrupting primary emergency access routes.`,
      evacuationPriorities: Array.isArray(parsed.evacuationPriorities) && parsed.evacuationPriorities.length > 0 ? parsed.evacuationPriorities : [
        "Immediate relocation from submerged lowlands to designated high-ground shelters",
        "Deploy amphibious rescue to severed road sectors",
        "Ensure backup power distribution to regional medical centers"
      ],
      recommendedActions: Array.isArray(parsed.recommendedActions) && parsed.recommendedActions.length > 0 ? parsed.recommendedActions : [
        "Enforce immediate closure of low-lying highway underpasses.",
        "Open high-capacity community shelters on elevated terrain.",
        "Pre-deploy water rescue units at designated choke points.",
        "Issue cell-broadcast evacuation advisories along flooded corridors."
      ],
      importantLimitations: parsed.limitations || "Simulation report generated with Real Gemini Flash model based on spatial physics parameters."
    };
  } catch (err: any) {
    console.error("Gemini API call error in generateSimulationReportWithGemini:", err);
    throw new Error(`Real AI Error (${err.message || "Failed to communicate with Gemini Flash"})`);
  }
}

export async function parseNaturalLanguageScenarioWithGemini(promptText: string, apiKey?: string, model?: string): Promise<SimulationParams> {
  const client = getGeminiClient(apiKey);
  if (!client) {
    throw new Error(
      "REAL_AI_REQUIRED: A valid Google Gemini API key is required for AI scenario parsing. Please provide a key in settings."
    );
  }

  const modelName = resolveFlashModelName(model);

  const aiPrompt = `
You are an expert GIS Disaster Simulation Parameter Extractor.
Extract structured parameters from this natural language scenario prompt:
"${promptText}"

Respond with ONLY valid JSON adhering strictly to this schema:
{
  "disasterType": "flood" | "heavy_rainfall" | "dam_break" | "cyclone_surge" | "landslide",
  "rainfallMm": number (e.g. 50 to 500),
  "durationHours": number (e.g. 1 to 48),
  "riverLevelIncreaseM": number (e.g. 0.5 to 5.0),
  "soilSaturationPercent": number (e.g. 40 to 100),
  "severity": "minor" | "moderate" | "severe" | "catastrophic"
}
`;

  try {
    const rawText = await callGeminiFlash(client, aiPrompt, modelName);
    let text = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      text = jsonMatch[0];
    }
    const parsed = JSON.parse(text);

    return {
      disasterType: parsed.disasterType || "flood",
      rainfallMm: Number(parsed.rainfallMm) || 250,
      durationHours: Number(parsed.durationHours) || 12,
      riverLevelIncreaseM: Number(parsed.riverLevelIncreaseM) || 2.0,
      soilSaturationPercent: Number(parsed.soilSaturationPercent) || 80,
      severity: parsed.severity || "severe",
      customPrompt: promptText,
    };
  } catch (err: any) {
    console.error("Failed to parse prompt with Gemini Flash:", err);
    throw new Error(`Real AI Parsing Error (${err.message || "Could not parse scenario"})`);
  }
}
