/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type CropCategory = 'cereals' | 'fruits' | 'vegetables';

export interface Disease {
  name: string;
  harmDescription: string;
  image: string;
}

export interface CropRequirements {
  rainfall: string;
  temperature: string;
  sunshine: string;
  timeToHarvest: string;
}

export interface CropVariant {
  name: string;
  description: string;
  image: string;
  link?: string;
  variables?: {
    yieldPotential?: string;
    optimalPh?: string;
    droughtTolerance?: string;
    altitudeRange?: string;
    [key: string]: string | undefined;
  };
  diseases: Disease[];
}

export interface Crop {
  id: string;
  name: string;
  category: CropCategory;
  description: string;
  image: string;
  requirements: CropRequirements;
  variants: CropVariant[];
  diseases: Disease[];
}

export interface WeatherForecastDay {
  date: string;
  tempMin: number;
  tempMax: number;
  condition: string; // e.g., "Rainy", "Sunny", "Cloudy", "Drizzle", "Storm"
  rainfall: number; // in mm
  sunshineHours: number;
  humidity: number;
}

export interface WeatherForecastResponse {
  locationName: string;
  latitude: number;
  longitude: number;
  source: 'frogcast' | 'fallback_simulator';
  forecast: WeatherForecastDay[];
}

export interface AIAdviceResponse {
  advice: string;
  recommendedCrops: string[];
  climateAnalysis: {
    suitability: 'High' | 'Moderate' | 'Low';
    limitingFactor?: string;
  };
}

export interface GrowthStagePoint {
  day: number;
  stageName: string;
  stageNameSw: string;
  heightCm: number;
  leafCount: number;
  agronomicNote: string;
  agronomicNoteSw: string;
  keyAction: string;
}

export interface ImageAnalysisResult {
  plantIdentified: string;
  healthScore: number;
  plantCondition: string;
  primaryIssue: string;
  confidence: number;
  pestDetected?: string;
  diseaseDetected?: string;
  severity: 'Healthy' | 'Low Risk' | 'Moderate' | 'Severe';
  diagnosisReport: string;
  treatmentSteps: string[];
  preventativeAdvice: string[];
}

export type TaskType = 'watering' | 'planting' | 'fertilizer' | 'pest_control' | 'harvesting' | 'general';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
export type TaskFrequency = 'once' | 'daily' | 'every_2_days' | 'weekly' | 'biweekly';

export interface CropTask {
  id: string;
  title: string;
  taskType: TaskType;
  cropId?: string;
  cropName?: string;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:MM
  frequency: TaskFrequency;
  priority: TaskPriority;
  status: 'pending' | 'completed';
  notes?: string;
  createdAt: string;
  completedAt?: string;
}

export interface LocationPreset {
  name: string;
  lat: number;
  lon: number;
  region?: string;
  description?: string;
}

