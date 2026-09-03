import { 
  BoundingBox, 
  FloodZonePolygon, 
  GeoPoint, 
  RoadSegment, 
  SafeShelter, 
  SimulationParams, 
  SimulationResult, 
  SimulationTimeStep 
} from "@/types";
import { fetchRealRoads, generateRiskHeatPoints, generateSyntheticInfrastructure } from "./geo";
import { generateSimulationReportWithGemini } from "./gemini";

export async function runDisasterSimulation(
  locationName: string,
  center: GeoPoint,
  bbox: BoundingBox,
  params: SimulationParams,
  apiKey?: string,
  model?: string
): Promise<SimulationResult> {
  const { facilities, shelters: baseShelters } = generateSyntheticInfrastructure(bbox, center);
  const baseRoads = await fetchRealRoads(bbox, center, (params.rainfallMm / 350) * 0.8);
  
  // Calculate bounding box area in km2
  const latKm = (bbox.north - bbox.south) * 111;
  const lngKm = (bbox.east - bbox.west) * 111 * Math.cos((center.lat * Math.PI) / 180);
  const totalAreaKm2 = Math.round(latKm * lngKm * 10) / 10;
  
  // Estimate population density based on severity / urban scale
  const density = 2800; // people per km2
  const maxPossiblePopulation = Math.round(totalAreaKm2 * density);

  // Time steps from 0 to duration
  const stepCount = Math.min(10, Math.max(5, Math.ceil(params.durationHours / 2)));
  const stepIntervalHours = Math.round((params.durationHours / stepCount) * 10) / 10;

  const timeSteps: SimulationTimeStep[] = [];
  const latSpan = bbox.north - bbox.south;
  const lngSpan = bbox.east - bbox.west;

  // Severity multiplier
  const severityMultipliers: Record<string, number> = {
    minor: 0.35,
    moderate: 0.65,
    severe: 1.0,
    catastrophic: 1.45,
  };
  const mult = severityMultipliers[params.severity] || 1.0;
  const maxFloodFraction = Math.min(0.85, (params.rainfallMm / 400) * 0.55 * mult);

  let maxAffectedArea = 0;
  let maxPeopleExposed = 0;
  let maxBlockedRoads = 0;

  for (let i = 0; i <= stepCount; i++) {
    const currentHour = Math.round(i * stepIntervalHours * 10) / 10;
    // S-curve progression for flood build-up
    const progressFraction = i === 0 ? 0 : Math.sin((i / stepCount) * (Math.PI / 2));
    const currentFloodFraction = maxFloodFraction * progressFraction;
    
    const affectedAreaKm2 = Math.round(totalAreaKm2 * currentFloodFraction * 10) / 10;
    const peopleExposed = Math.round(maxPossiblePopulation * currentFloodFraction);
    const highRiskPeople = Math.round(peopleExposed * (0.35 + (progressFraction * 0.25)));

    // Generate expanding flood zone polygons
    const floodZones: FloodZonePolygon[] = [];
    if (progressFraction > 0.05) {
      const radiusLat = (latSpan * 0.4) * progressFraction;
      const radiusLng = (lngSpan * 0.45) * progressFraction;
      
      // Riverbed / low basin polygon
      floodZones.push({
        id: `flood-core-${i}`,
        severity: progressFraction > 0.6 ? "critical" : progressFraction > 0.3 ? "high" : "moderate",
        depthM: Math.round((0.4 + (params.riverLevelIncreaseM * progressFraction * 0.8)) * 10) / 10,
        coords: [
          [center.lat - radiusLat * 0.8, center.lng - radiusLng * 0.7],
          [center.lat - radiusLat * 0.2, center.lng - radiusLng * 0.3],
          [center.lat + radiusLat * 0.4, center.lng + radiusLng * 0.2],
          [center.lat + radiusLat * 0.9, center.lng + radiusLng * 0.8],
          [center.lat + radiusLat * 0.7, center.lng + radiusLng * 0.9],
          [center.lat + radiusLat * 0.1, center.lng + radiusLng * 0.4],
          [center.lat - radiusLat * 0.5, center.lng - radiusLng * 0.1],
          [center.lat - radiusLat * 0.9, center.lng - radiusLng * 0.5],
        ],
      });

      if (progressFraction > 0.4) {
        // Secondary overflow basin
        floodZones.push({
          id: `flood-basin-${i}`,
          severity: progressFraction > 0.75 ? "high" : "moderate",
          depthM: Math.round((0.2 + (params.riverLevelIncreaseM * progressFraction * 0.4)) * 10) / 10,
          coords: [
            [center.lat - radiusLat * 0.6, center.lng + radiusLng * 0.3],
            [center.lat - radiusLat * 0.1, center.lng + radiusLng * 0.6],
            [center.lat + radiusLat * 0.3, center.lng + radiusLng * 0.5],
            [center.lat + radiusLat * 0.1, center.lng + radiusLng * 0.1],
          ],
        });
      }
    }

    // Dynamic Road Status evaluation
    const updatedRoads: RoadSegment[] = baseRoads.map((road, idx) => {
      let status: RoadSegment["status"] = "clear";
      let depthCm = 0;

      // Road blockage logic based on simulation hour & road type
      if (progressFraction > 0.2 && (road.id.includes("river") || road.type === "residential")) {
        status = progressFraction > 0.5 ? "submerged" : "partially_blocked";
        depthCm = Math.round(progressFraction * 75);
      } else if (progressFraction > 0.5 && road.id.includes("bridge")) {
        status = progressFraction > 0.75 ? "submerged" : "partially_blocked";
        depthCm = Math.round(progressFraction * 45);
      } else if (progressFraction > 0.7 && road.type === "highway") {
        status = "partially_blocked";
        depthCm = Math.round(progressFraction * 30);
      }

      return {
        ...road,
        status,
        waterDepthCm: depthCm,
      };
    });

    const blockedCount = updatedRoads.filter(r => r.status !== "clear").length;

    // Shelter Accessibility evaluation
    const updatedShelters: SafeShelter[] = baseShelters.map((shelter) => {
      let status = shelter.status;
      if (shelter.elevationM < 16 && progressFraction > 0.6) {
        status = "flooded";
      } else if (shelter.elevationM < 25 && progressFraction > 0.4) {
        status = "risk_adjacent";
      } else {
        status = progressFraction > 0.8 ? "at_capacity" : "open";
      }
      return { ...shelter, status };
    });

    const heatPoints = generateRiskHeatPoints(center, bbox, Math.min(1.0, 0.2 + progressFraction * 0.9));

    timeSteps.push({
      hour: currentHour,
      affectedAreaKm2,
      peopleExposed,
      highRiskPeople,
      blockedRoadsCount: blockedCount,
      submergedCriticalFacilitiesCount: progressFraction > 0.6 ? 2 : progressFraction > 0.3 ? 1 : 0,
      floodZones,
      blockedRoads: updatedRoads,
      accessibleShelters: updatedShelters,
      heatPoints,
    });

    if (affectedAreaKm2 > maxAffectedArea) maxAffectedArea = affectedAreaKm2;
    if (peopleExposed > maxPeopleExposed) maxPeopleExposed = peopleExposed;
    if (blockedCount > maxBlockedRoads) maxBlockedRoads = blockedCount;
  }

  // Generate AI Comprehensive Report with Gemini
  const aiReport = await generateSimulationReportWithGemini(
    locationName,
    params,
    maxAffectedArea,
    maxPeopleExposed,
    maxBlockedRoads,
    apiKey,
    model
  );

  return {
    id: `sim-${Date.now()}`,
    locationName,
    center,
    boundingBox: bbox,
    params,
    timeSteps,
    maxAffectedAreaKm2: maxAffectedArea,
    maxPeopleExposed,
    maxBlockedRoads,
    allShelters: baseShelters,
    allRoads: baseRoads,
    criticalFacilities: facilities,
    aiReport,
    isDemoData: false,
    createdAt: new Date().toISOString(),
  };
}
