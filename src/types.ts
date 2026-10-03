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
