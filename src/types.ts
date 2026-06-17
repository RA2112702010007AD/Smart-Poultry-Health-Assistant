export interface SensorReadings {
  temperature: number; // °C
  humidity: number;    // %
  co2: number;         // ppm
  ammonia: number;     // ppm
  timestamp?: string;
}

export type RiskLevel = 'Healthy' | 'Low Risk' | 'Moderate Risk' | 'High Disease Risk';

export interface MLPrediction {
  riskLevel: RiskLevel;
  confidence: number; // Probability of the final prediction (0 to 1)
  probabilities: Record<RiskLevel, number>;
  featureImportance: Record<string, number>;
  treeCount: number;
}

export interface GeminiRecommendations {
  explanation: string;
  causes: string[];
  immediatePreventiveMeasures: string[];
  environmentalAdjustments: string[];
  feedingAndHygiene: string[];
  veterinaryAdvice: string;
  dailyFarmReport: string;
  isFallback?: boolean;
  fallbackReason?: string;
}

export interface PredictionRecord {
  id: string;
  timestamp: string;
  sensors: SensorReadings;
  prediction: MLPrediction;
  aiRecommendations: GeminiRecommendations | null;
  notes?: string;
}

export interface TrainResult {
  accuracy: number;
  sampleCount: number;
  featureImportance: Record<string, number>;
  treeCount: number;
  maxDepth: number;
}
