import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

import { SensorReadings, RiskLevel, MLPrediction, GeminiRecommendations, PredictionRecord } from './types';
import { RandomForestClassifier, generatePoultryDataset } from './utils/randomForest';

const app = express();

app.use(express.json());

// Initialize Random Forest
const rfModel = new RandomForestClassifier(12, 6, 2);

console.log('Initializing and training Poultry Risk Random Forest Classifier...');
const { X, y } = generatePoultryDataset(200);
const trainStats = rfModel.train(X, y);
console.log(`Random Forest trained successfully! Training Accuracy: ${(trainStats.accuracy * 100).toFixed(1)}% across ${X.length} samples.`);

// Safe lazy setup of Gemini SDK
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log('Gemini AI SDK initialized on the server.');
  } catch (err) {
    console.error('Failed to initialize Gemini AI SDK:', err);
  }
} else {
  console.log('GEMINI_API_KEY not found in environment. Recommendations will use high-fidelity scientific rules as fallback.');
}

// Generate realistic mock trends
const initialHistory: PredictionRecord[] = [];
const now = new Date();

// Create 12 historical coordinates
const sensorTrendData = [
  { temp: 22.1, humid: 62.0, co2: 650, amm: 4.2, label: 'Healthy' as RiskLevel },
  { temp: 21.8, humid: 63.5, co2: 700, amm: 4.8, label: 'Healthy' as RiskLevel },
  { temp: 21.5, humid: 65.0, co2: 780, amm: 5.5, label: 'Healthy' as RiskLevel },
  { temp: 20.9, humid: 68.2, co2: 890, amm: 6.1, label: 'Healthy' as RiskLevel },
  { temp: 26.5, humid: 74.8, co2: 1750, amm: 14.5, label: 'Low Risk' as RiskLevel },
  { temp: 28.2, humid: 79.1, co2: 2400, amm: 22.1, label: 'Moderate Risk' as RiskLevel },
  { temp: 29.5, humid: 82.5, co2: 3100, amm: 32.4, label: 'High Disease Risk' as RiskLevel },
  { temp: 25.4, humid: 72.0, co2: 1600, amm: 18.2, label: 'Moderate Risk' as RiskLevel },
  { temp: 23.1, humid: 64.5, co2: 950, amm: 8.9, label: 'Low Risk' as RiskLevel },
  { temp: 22.5, humid: 61.2, co2: 710, amm: 5.8, label: 'Healthy' as RiskLevel },
  { temp: 22.3, humid: 59.8, co2: 640, amm: 4.1, label: 'Healthy' as RiskLevel },
  { temp: 21.9, humid: 58.5, co2: 590, amm: 3.5, label: 'Healthy' as RiskLevel },
];

sensorTrendData.forEach((trend, idx) => {
  const timestamp = new Date(now.getTime() - (12 - idx) * 3600 * 1000).toISOString();
  const mlResult = rfModel.predict([trend.temp, trend.humid, trend.co2, trend.amm]);
  const fallbackRecs = getFallbackRuleRecommendations(trend.temp, trend.humid, trend.co2, trend.amm, mlResult.riskLevel);
  
  initialHistory.push({
    id: `hist-${idx}`,
    timestamp,
    sensors: {
      temperature: trend.temp,
      humidity: trend.humid,
      co2: trend.co2,
      ammonia: trend.amm
    },
    prediction: {
      ...mlResult,
      featureImportance: rfModel.getFeatureImportances(),
      treeCount: rfModel.trees.length
    },
    aiRecommendations: fallbackRecs,
    notes: idx === 6 ? 'Temporary extractor breakdown' : (idx === 7 ? 'Extractor rebooted manually' : undefined)
  });
});

let historyRecords: PredictionRecord[] = [...initialHistory];

// Rule-based backup
function getFallbackRuleRecommendations(temp: number, humid: number, co2: number, ammonia: number, level: RiskLevel): GeminiRecommendations {
  if (level === 'Healthy') {
    return {
      explanation: "All environmental measurements reside entirely in the scientific target comfort zones for growing poultry. There is negligible immediate pathogen risk, and stress markers are minimal.",
      causes: ["Optimal ventilation cycling", "Dry litter maintenance", "Adequate bird stocking density"],
      immediatePreventiveMeasures: [
        "Continue current automated extractor fans scheduling",
        "Audit drinking water pressure to avoid localized leakage",
        "Check litter depth and dry consistency daily"
      ],
      environmentalAdjustments: [
        "Maintain current thermostat thresholds of 20°C - 23°C",
        "Keep air flow rate above 1.5 m/s to distribute carbon dioxide cleanly"
      ],
      feedingAndHygiene: [
        "Adhere to standard bio-security wash protocols before entry",
        "Observe normal feeding times; brush feed lines to prevent stale feed"
      ],
      veterinaryAdvice: "Flock is thriving. No veterinarian consultation is required. Keep conducting standard weekly visual checkups for feed conversion rating assessments.",
      dailyFarmReport: "Flock environmental indicators are fully optimal with high comfort levels."
    };
  }

  if (level === 'Low Risk') {
    return {
      explanation: `We detected mild ambient drifting in the house parameters. Specifically, ${ammonia > 10 ? 'ammonia is starting to volatize (' + ammonia.toFixed(1) + ' ppm)' : ''} ${co2 > 1200 ? 'carbon dioxide levels (' + co2.toFixed(0) + ' ppm) suggest reduced ventilation rates' : ''} ${temp > 25 ? 'temperatures are slightly elevated (' + temp.toFixed(1) + '°C)' : ''}. This requires proactive intervention to avoid pathogen incubation.`,
      causes: ["Insufficient air intake cycles", "Slightly damp litter crust under drinker lines", "Fluctuating seasonal outdoor humidity"],
      immediatePreventiveMeasures: [
        "Stir damp litter areas manually and scatter clean superphosphate or dry lime",
        "Incorporate a 10% increase in minimal fan cycle frequency"
      ],
      environmentalAdjustments: [
        "Lower wall curtain boards by 5-10 cm to improve natural cross-breeze",
        "Verify that air speed at bird level remains soft yet refreshing"
      ],
      feedingAndHygiene: [
        "Ensure drinking lines are sanitized with a low poultry-safe organic sanitizer",
        "Check feed troughs to ensure moist feed residue isn't fermenting"
      ],
      veterinaryAdvice: "Consultation isn't urgent. Perform random physical observation of the flock's snicking, coughing or eye-rubbing habits during high heat hours.",
      dailyFarmReport: "A slight environmental stressor drift detected. Recommend quick ventilative ventilation adjustment."
    };
  }

  if (level === 'Moderate Risk') {
    return {
      explanation: `Ammonia level stands at ${ammonia.toFixed(1)} ppm and moisture is at ${humid.toFixed(1)}%. At these readings, the poultry flock begins experiencing respiratory mucosa inflammation, placing them at moderate risk of chronic respiratory disease (CRD) or infectious coryza.`,
      causes: [
        "Low air exchange rates holding metabolic gases and bird vapor",
        "Prolonged high moisture in litter triggering ammonia volatilization",
        "Local heating hotspots stressing flock cluster configuration"
      ],
      immediatePreventiveMeasures: [
        "Turn on additional forced-induction extractor fans immediately",
        "Rake and thoroughly remove deep wet litter crust, replacing it with fresh kiln-dried pine shavings",
        "Deploy appropriate poultry-safe liquid ammonia binder sprays if available"
      ],
      environmentalAdjustments: [
        "Ramp up secondary cooling pad pumps if high temperature matches this humidity",
        "Set target relative humidity target floor back below 65%"
      ],
      feedingAndHygiene: [
        "Sanitize and wash water trays twice today to eliminate pathogen suspension",
        "Boost feed with essential vitamins (vitamin C/E) to offset metabolic heat stress"
      ],
      veterinaryAdvice: "Advise keeping veterinary lines on stand-by. Examine birds for wet nostrils, watery eyes, or tracheal rales (wheezing) immediately.",
      dailyFarmReport: "Moderate atmospheric hazards present. Ventilation system adjustments are highly recommended to prevent pathogen outbreaks."
    };
  }

  return {
    explanation: `CRITICAL ALERT: Your environmental metrics are extremely hostile. Temperature is ${temp.toFixed(1)}°C, Ammonia is ${ammonia.toFixed(1)} ppm, and CO₂ exceeds safe biological capacities at ${co2.toFixed(0)} ppm. High ammonia causes rapid tracheal desquamation, while CO₂ causes hypoxia and ascites. Immediate danger of respiratory disease outbreaks (Newcastle disease, avian influenza, colibacillosis) and mortality spikes.`,
    causes: [
      "Severe mechanical failure of extractor fans or power outages",
      "Overstretching house capacity limits (excessive stocking density)",
      "Saturated litter generating excessive anaerobic fermentation"
    ],
    immediatePreventiveMeasures: [
      "Manually open all emergencies side-vents, emergency curtain drops, and run backup exhaust generators",
      "Evacuate heavy wet litter crusts instantly and scrub drinker drains",
      "Isolate lethargic, huddling, or gasping birds into hospital pens immediately"
    ],
    environmentalAdjustments: [
      "Engage maximum ventilation flow immediately. Ensure wind velocity of >2.5 m/s across bird beds",
      "Run misting systems if heat stress is dry; if moisture is high, rely purely on high-capacity warm-air extraction"
    ],
    feedingAndHygiene: [
      "Administer broad-spectrum electrolytes and soluble immune boosters in clean drinking water water reservoirs",
      "Enforce total quarantine: strict footwear sterilization and restriction of farmhands movement between houses"
    ],
    veterinaryAdvice: "URGENT veterinary field visit is highly advised. Necropsy dead birds if mortality rate increases beyond 0.5% in 24 hours to check for laryngotracheitis or severe E.coli lesions.",
    dailyFarmReport: "CRITICAL hazard alarm triggered. Atmospheric toxicities require instant ventilation mitigation and emergency veterinary consultation."
  };
}

// REST APIs
app.get('/api/history', (req, res) => {
  res.json(historyRecords);
});

app.post('/api/train', (req, res) => {
  try {
    const { X: newX, y: newY } = generatePoultryDataset(240);
    const newStats = rfModel.train(newX, newY);
    
    res.json({
      success: true,
      accuracy: newStats.accuracy,
      sampleCount: newX.length,
      featureImportance: rfModel.getFeatureImportances(),
      treeCount: newStats.size,
      maxDepth: 6
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/predict', async (req, res) => {
  try {
    const { temperature, humidity, co2, ammonia } = req.body;
    const temp = parseFloat(temperature);
    const humid = parseFloat(humidity);
    const co2Val = parseFloat(co2);
    const amm = parseFloat(ammonia);

    if (isNaN(temp) || isNaN(humid) || isNaN(co2Val) || isNaN(amm)) {
      return res.status(400).json({ error: 'All sensor readings must be valid numeric values.' });
    }

    if (temp < -20 || temp > 60 || humid < 0 || humid > 100 || co2Val < 0 || co2Val > 15000 || amm < 0 || amm > 150) {
      return res.status(400).json({ error: 'Sensor readings exceed biological farm limits.' });
    }

    const mlPrediction = rfModel.predict([temp, humid, co2Val, amm]);
    let aiRecs: GeminiRecommendations;

    if (ai) {
      const prompt = `
        Analyze the following poultry farm sensor readings and ML classification result to output an expert agricultural summary and structured response:
        
        Sensor Readings:
        - Temperature: ${temp}°C
        - Relative Humidity: ${humid}%
        - CO2 Concentration: ${co2Val} ppm
        - Ammonia (NH3) Gas Level: ${amm} ppm
        
        Random Forest ML Prediction:
        - Detected Disease Risk Level: ${mlPrediction.riskLevel}
        - Model Prediction Confidence: ${(mlPrediction.confidence * 100).toFixed(1)}%

        Poultry Guidelines Reference:
        - Ideal temp is 18-24°C. Severe heat starts at 30°C.
        - Ideal humidity is 50-70%. Wet litter starts at 75-80%.
        - Safe CO2 level is under 1500-2500 ppm. Danger begins at 3000 ppm.
        - Safe Ammonia level is under 10 ppm. mucosal irritation & respiratory susceptibility spikes above 15-20 ppm. Above 25 ppm is highly toxic to chicken lung tissue and corneas.

        Translate this complex telemetry into simple, practical, actionable instructions for a small-scale chicken farmer. Do not use complex jargon. Keep descriptions extremely supportive and easy to comprehend.
      `;

      const queryConfig = {
        systemInstruction: "You are an expert avian veterinarian and precision poultry farm climatologist. Provide structural, highly practical, and empathetic farming advice centered on real poultry respiratory and biological sciences. Format your answer as a clean JSON object mirroring the exact response schema.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            explanation: { type: Type.STRING, description: "A highly simplified poultry biology explanation on how these specific sensor results affect flock health." },
            causes: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List 2 to 3 practical farm causes for this state." },
            immediatePreventiveMeasures: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List 2 to 3 rapid physical actions a farmer must immediately do." },
            environmentalAdjustments: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List 2 environmental settings coordinates adjusts." },
            feedingAndHygiene: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List 2 simple nutritional or sanitation adjustments." },
            veterinaryAdvice: { type: Type.STRING, description: "Compassionate, scientific advice on when to call a vet and what specific symptoms to monitor." },
            dailyFarmReport: { type: Type.STRING, description: "A high-level executive report line summarizing flock situation index." }
          },
          required: [
            "explanation", "causes", "immediatePreventiveMeasures", "environmentalAdjustments", "feedingAndHygiene", "veterinaryAdvice", "dailyFarmReport"
          ]
        }
      };

      const modelsToTry = ['gemini-flash-latest', 'gemini-3.1-flash-lite', 'gemini-3.5-flash'];
      let succeeded = false;
      let lastError: any = null;

      for (const modelName of modelsToTry) {
        if (succeeded) break;
        for (let attempt = 1; attempt <= 2; attempt++) {
          try {
            console.log(`Sending API request to Gemini - Model: ${modelName} (Attempt ${attempt}/2)...`);
            const response = await ai.models.generateContent({
              model: modelName,
              contents: prompt,
              config: queryConfig
            });

            const textOutput = response.text || '';
            aiRecs = JSON.parse(textOutput.trim());
            aiRecs.isFallback = false;
            succeeded = true;
            console.log(`Gemini dynamically generated detailed recommendations using ${modelName}.`);
            break;
          } catch (gemError: any) {
            lastError = gemError;
            const errorMsg = gemError.message || String(gemError);
            console.warn(`Attempt ${attempt} with ${modelName} failed. Error:`, errorMsg);
            
            const errorStr = errorMsg.toLowerCase();
            const isServiceOverloaded = errorStr.includes('503') || 
                                        errorStr.includes('unavailable') || 
                                        errorStr.includes('high demand') || 
                                        errorStr.includes('limit') || 
                                        errorStr.includes('429');
            
            if (isServiceOverloaded) {
              console.log(`Model "${modelName}" is currently experiencing elevated demands/limits. Speed-routing to the next model in the fallback chain immediately...`);
              break; 
            }

            if (attempt < 2) {
              await new Promise(resolve => setTimeout(resolve, 500 * attempt));
            }
          }
        }
      }

      if (!succeeded) {
        console.error('Failed to generate Gemini output using all models/attempts, falling back to local rule system. Last error:', lastError);
        aiRecs = getFallbackRuleRecommendations(temp, humid, co2Val, amm, mlPrediction.riskLevel);
        aiRecs.isFallback = true;
        aiRecs.fallbackReason = lastError?.message || String(lastError);
      }
    } else {
      aiRecs = getFallbackRuleRecommendations(temp, humid, co2Val, amm, mlPrediction.riskLevel);
      aiRecs.isFallback = true;
      aiRecs.fallbackReason = 'No API key configured';
    }

    const finalPrediction: MLPrediction = {
      ...mlPrediction,
      featureImportance: rfModel.getFeatureImportances(),
      treeCount: rfModel.trees.length
    };

    const record: PredictionRecord = {
      id: `p-${Date.now()}`,
      timestamp: new Date().toISOString(),
      sensors: { temperature: temp, humidity: humid, co2: co2Val, ammonia: amm },
      prediction: finalPrediction,
      aiRecommendations: aiRecs
    };

    historyRecords.unshift(record);
    res.json(record);

  } catch (err: any) {
    console.error('API predict error:', err);
    res.status(500).json({ error: err.message || 'An unexpected error occurred during prediction analysis.' });
  }
});

app.delete('/api/history/:id', (req, res) => {
  const { id } = req.params;
  historyRecords = historyRecords.filter(r => r.id !== id);
  res.json({ success: true });
});

export default app;
