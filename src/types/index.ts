export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export type DisasterType = 'flood' | 'heavy_rainfall' | 'dam_break' | 'cyclone_surge' | 'landslide';

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface BoundingBox {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface PresetLocation {
  id: string;
  name: string;
  country: string;
  description: string;
  center: GeoPoint;
  defaultZoom: number;
  boundingBox: BoundingBox;
  disasterHistory: string;
}

export interface WeatherData {
  currentRainfallMm: number;
  forecast24hRainfallMm: number;
  temperatureC: number;
  humidityPercent: number;
  windSpeedKmh: number;
  pressureHpa: number;
  weatherAlert?: string;
  soilMoistureIndex?: number;
  isRealApi: boolean;
}

export interface TerrainData {
  elevationM: number;
  minElevationM: number;
  maxElevationM: number;
  terrainType: 'lowland_basin' | 'coastal_plain' | 'river_valley' | 'hilly_plateau' | 'urban_flat';
  waterProximityScore: number; // 0 - 100
  riverDistanceMeters: number;
  elevationRiskFactor: number; // 0 - 100
}

export interface InfrastructureItem {
  id: string;
  name: string;
  type: 'hospital' | 'school' | 'shelter' | 'bridge' | 'power_station';
  lat: number;
  lng: number;
  elevationM: number;
}

export interface RoadSegment {
  id: string;
  name: string;
  type: 'highway' | 'primary' | 'secondary' | 'residential';
  coords: [number, number][];
  status: 'clear' | 'partially_blocked' | 'submerged';
  waterDepthCm: number;
  detourName?: string;
}

export interface SafeShelter {
  id: string;
  name: string;
  type: 'shelter' | 'hospital' | 'school' | 'high_ground';
  lat: number;
  lng: number;
  elevationM: number;
  capacity: number;
  status: 'open' | 'at_capacity' | 'risk_adjacent' | 'flooded';
  recommendedRoute: string;
}

export interface PredictionResult {
  id: string;
  locationName: string;
  center: GeoPoint;
  boundingBox: BoundingBox;
  areaKm2: number;
  estimatedPopulation: number;
  overallRiskScore: number; // 0 - 100
  riskLevel: RiskLevel;
  categoryScores: {
    rainfall: number;
    elevation: number;
    waterProximity: number;
    historical: number;
    populationExposure: number;
    infrastructureVulnerability: number;
  };
  weather: WeatherData;
  terrain: TerrainData;
  infrastructure: {
    totalHospitals: number;
    totalShelters: number;
    totalRoadKm: number;
    criticalFacilities: InfrastructureItem[];
  };
  aiAssessment: {
    summary: string;
    vulnerableZones: string;
    peopleImpact: string;
    infrastructureImpact: string;
    roadRisks: string;
    precautions: string[];
    evacuationPriorities: string[];
    limitations: string;
  };
  heatPoints: [number, number, number][]; // [lat, lng, intensity]
  roads?: RoadSegment[];
  isDemoData: boolean;
  timestamp: string;
}

export interface SimulationParams {
  disasterType: DisasterType;
  rainfallMm: number;
  durationHours: number;
  riverLevelIncreaseM: number;
  soilSaturationPercent: number;
  severity: 'minor' | 'moderate' | 'severe' | 'catastrophic';
  customPrompt?: string;
}

export interface FloodZonePolygon {
  id: string;
  coords: [number, number][];
  severity: 'low' | 'moderate' | 'high' | 'critical';
  depthM: number;
}

export interface SimulationTimeStep {
  hour: number;
  affectedAreaKm2: number;
  peopleExposed: number;
  highRiskPeople: number;
  blockedRoadsCount: number;
  submergedCriticalFacilitiesCount: number;
  floodZones: FloodZonePolygon[];
  blockedRoads: RoadSegment[];
  accessibleShelters: SafeShelter[];
  heatPoints: [number, number, number][];
}

export interface SimulationResult {
  id: string;
  locationName: string;
  center: GeoPoint;
  boundingBox: BoundingBox;
  params: SimulationParams;
  timeSteps: SimulationTimeStep[];
  maxAffectedAreaKm2: number;
  maxPeopleExposed: number;
  maxBlockedRoads: number;
  allShelters: SafeShelter[];
  allRoads: RoadSegment[];
  criticalFacilities: InfrastructureItem[];
  aiReport: {
    situationSummary: string;
    mostVulnerableAreas: string;
    humanImpactAnalysis: string;
    infrastructureImpactAnalysis: string;
    evacuationPriorities: string[];
    recommendedActions: string[];
    importantLimitations: string;
  };
  isDemoData: boolean;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  contextType?: 'prediction' | 'simulation';
}
