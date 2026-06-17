import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import {
  Thermometer,
  Droplets,
  Wind,
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  Activity,
  History,
  Sparkles,
  RefreshCw,
  FileText,
  Moon,
  Sun,
  Download,
  Trash2,
  Lock,
  Compass,
  AlertCircle,
  ChevronRight,
  BookOpen,
  LogOut
} from 'lucide-react';
import FarmerLogin from './components/FarmerLogin';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { SensorReadings, RiskLevel, MLPrediction, GeminiRecommendations, PredictionRecord, TrainResult } from './types';

// Preset scenarios representing typical poultry climatology stresses
const SENSOR_SCENARIOS = [
  {
    name: "Perfect Autumn Comfort",
    description: "Flock is in absolute optimal thermoneutral zone. Minimum gas emission.",
    temp: 21.5,
    humid: 58,
    co2: 620,
    amm: 3.5,
    scenario: "healthy"
  },
  {
    name: "Mild Summer Humidity",
    description: "Slight heat and elevated moisture. Requires proactive window ventilation.",
    temp: 26.2,
    humid: 71,
    co2: 1350,
    amm: 11.2,
    scenario: "low-risk"
  },
  {
    name: "Winter Ventilation Lockout",
    description: "Curtains sealed for warmth, causing metabolic moisture accumulation and toxic gas spikes.",
    temp: 14.8,
    humid: 79,
    co2: 2450,
    amm: 21.0,
    scenario: "moderate-risk"
  },
  {
    name: "Critical Ammonia Gas Outbreak",
    description: "Ventilation failure and wet litter fermentation. Dangerous biological tissue toxicity risk.",
    temp: 31.0,
    humid: 84,
    co2: 3400,
    amm: 38.5,
    scenario: "high-risk"
  }
];

export default function App() {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  // Authentication states with localStorage persistence
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('farmer_logged_in') === 'true';
  });

  const [farmerDetails, setFarmerDetails] = useState<{ name: string; location: string; farmId: string } | null>(() => {
    const name = localStorage.getItem('farmer_name');
    const location = localStorage.getItem('farmer_location');
    const farmId = localStorage.getItem('farmer_id');
    if (name && location && farmId) {
      return { name, location, farmId };
    }
    return null;
  });

  const handleLoginSuccess = (name: string, location: string, farmId: string) => {
    localStorage.setItem('farmer_logged_in', 'true');
    localStorage.setItem('farmer_name', name);
    localStorage.setItem('farmer_location', location);
    localStorage.setItem('farmer_id', farmId);
    setFarmerDetails({ name, location, farmId });
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('farmer_logged_in');
    localStorage.removeItem('farmer_name');
    localStorage.removeItem('farmer_location');
    localStorage.removeItem('farmer_id');
    setFarmerDetails(null);
    setIsLoggedIn(false);
  };

  // Core application states
  const [history, setHistory] = useState<PredictionRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isTraining, setIsTraining] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'recommendations' | 'diagnostics'>('recommendations');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Form states
  const [tempInput, setTempInput] = useState<string>('21.5');
  const [humidInput, setHumidInput] = useState<string>('58');
  const [co2Input, setCo2Input] = useState<string>('620');
  const [ammInput, setAmmInput] = useState<string>('3.5');

  // Currently focused assessment result
  const [lastPrediction, setLastPrediction] = useState<PredictionRecord | null>(null);

  // ML statistics
  const [mlStats, setMlStats] = useState<TrainResult>({
    accuracy: 0.945,
    sampleCount: 200,
    featureImportance: { temperature: 0.22, humidity: 0.18, co2: 0.24, ammonia: 0.36 },
    treeCount: 12,
    maxDepth: 6
  });

  // Success notifications
  const [trainMessage, setTrainMessage] = useState<string | null>(null);

  // Selected sensor for charts focus
  const [chartFocusSensor, setChartFocusSensor] = useState<'temp' | 'humid' | 'co2' | 'amm'>('amm');

  // Dynamic Dark Mode class on document element
  useEffect(() => {
    if (isDarkMode && isLoggedIn) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode, isLoggedIn]);

  // Fetch initial history
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/history');
      if (response.ok) {
        const data = await response.json();
        setHistory(data);
        if (data.length > 0) {
          setLastPrediction(data[0]);
        }
      }
    } catch (err) {
      console.error('Error loading prediction history:', err);
    }
  };

  // Dynamic Class Colors
  const getRiskColorClasses = (level: RiskLevel) => {
    switch (level) {
      case 'Healthy':
        return {
          bg: 'bg-emerald-50 dark:bg-emerald-950/30',
          border: 'border-emerald-200 dark:border-emerald-800/60',
          text: 'text-emerald-800 dark:text-emerald-400',
          badge: 'bg-emerald-500 text-white',
          radial: '#10b981'
        };
      case 'Low Risk':
        return {
          bg: 'bg-teal-50 dark:bg-teal-950/20',
          border: 'border-teal-200 dark:border-teal-900/40',
          text: 'text-teal-800 dark:text-teal-300',
          badge: 'bg-teal-500 text-white',
          radial: '#14b8a6'
        };
      case 'Moderate Risk':
        return {
          bg: 'bg-amber-50 dark:bg-amber-950/20',
          border: 'border-amber-200 dark:border-amber-950/60',
          text: 'text-amber-800 dark:text-amber-400',
          badge: 'bg-amber-500 text-white',
          radial: '#f59e0b'
        };
      case 'High Disease Risk':
        return {
          bg: 'bg-rose-50 dark:bg-rose-950/40',
          border: 'border-rose-200 dark:border-rose-900/60',
          text: 'text-rose-800 dark:text-rose-400',
          badge: 'bg-rose-600 text-white',
          radial: '#e11d48'
        };
    }
  };

  // Load preset scenario
  const handleLoadScenario = (sc: typeof SENSOR_SCENARIOS[0]) => {
    setTempInput(sc.temp.toString());
    setHumidInput(sc.humid.toString());
    setCo2Input(sc.co2.toString());
    setAmmInput(sc.amm.toString());
    setValidationError(null);
  };

  // Submit assessment form
  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const temp = parseFloat(tempInput);
    const humid = parseFloat(humidInput);
    const co2 = parseFloat(co2Input);
    const amm = parseFloat(ammInput);

    // Validation
    if (isNaN(temp) || isNaN(humid) || isNaN(co2) || isNaN(amm)) {
      setValidationError("All sensor readings must be valid decimal entries.");
      return;
    }

    if (temp < -15 || temp > 55) {
      setValidationError("Poultry thermometer bounds must sit between -15°C and 55°C.");
      return;
    }
    if (humid < 10 || humid > 100) {
      setValidationError("Flock house moisture meters must calculate between 10% and 100% relative humidity.");
      return;
    }
    if (co2 < 200 || co2 > 10000) {
      setValidationError("CO₂ concentrations must span between 200 ppm and 10,000 ppm.");
      return;
    }
    if (amm < 0 || amm > 120) {
      setValidationError("Ambient ammonia gas levels must scale between 0 ppm and 120 ppm.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ temperature: temp, humidity: humid, co2, ammonia: amm })
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const result: PredictionRecord = await response.json();
      setLastPrediction(result);
      setHistory(prev => [result, ...prev]);
      setActiveTab('recommendations');
    } catch (err: any) {
      console.error(err);
      setValidationError(err.message || 'An error occurred operating the analysis pipeline.');
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger RF dynamic retraining
  const handleRetrain = async () => {
    setIsTraining(true);
    setTrainMessage(null);
    try {
      const response = await fetch('/api/train', { method: 'POST' });
      const data = await response.json();
      if (data.success) {
        setMlStats({
          accuracy: data.accuracy,
          sampleCount: data.sampleCount,
          featureImportance: data.featureImportance,
          treeCount: data.treeCount,
          maxDepth: data.maxDepth
        });
        setTrainMessage(`Model re-anchored on ${data.sampleCount} bootstrapped readings with Out-Of-Bag accuracy reaching ${(data.accuracy * 100).toFixed(1)}%!`);
        setTimeout(() => setTrainMessage(null), 8000);
      }
    } catch (err) {
      console.error('Error training decision trees:', err);
    } finally {
      setIsTraining(false);
    }
  };

  // Delete prediction historical record
  const handleDeleteRecord = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await fetch(`/api/history/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setHistory(prev => prev.filter(r => r.id !== id));
        if (lastPrediction?.id === id) {
          const remaining = history.filter(r => r.id !== id);
          setLastPrediction(remaining.length > 0 ? remaining[0] : null);
        }
      }
    } catch (err) {
      console.error('Error pruning record:', err);
    }
  };

  // Downloadable Printable PDF and Report compilation
  const handlePrintReport = (record: PredictionRecord) => {
    const backupWindow = window.open('', '_blank');
    if (!backupWindow) {
      alert("Please allow popups to compile and print the disease risk report.");
      return;
    }

    const { sensors, prediction, aiRecommendations, timestamp } = record;
    const dateFormatted = new Date(timestamp).toLocaleString();
    const alertColors = getRiskColorClasses(prediction.riskLevel);
    
    const formattedHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Poultry Health Diagnostic Assessment - ${prediction.riskLevel}</title>
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
        <style>
          body { font-family: 'Inter', system-ui, sans-serif; -webkit-print-color-adjust: exact; }
          @media print {
            .no-print { display: none; }
            body { padding: 0; margin: 0; }
          }
        </style>
      </head>
      <body class="bg-white p-8 text-gray-800">
        <div class="max-w-4xl mx-auto border border-gray-200 p-8 rounded-lg shadow-sm">
          <!-- Print Control -->
          <div class="no-print flex justify-between items-center bg-gray-100 p-4 rounded mb-6">
            <span class="text-xs text-gray-500 font-mono">Report Generator Ready</span>
            <button onclick="window.print()" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm font-semibold transition">
              Print / Save as PDF
            </button>
          </div>

          <!-- Header -->
          <div class="flex justify-between items-start border-b border-gray-200 pb-6 mb-6">
            <div>
              <h1 class="text-2xl font-bold text-gray-900">POULTRY GUARDIAN AI REPORT</h1>
              <p class="text-xs text-gray-500 font-mono">Precision Agriculture & Avian Biosafety Assessment</p>
            </div>
            <div class="text-right">
              <span class="inline-block px-3 py-1 font-bold text-xs rounded text-white ${prediction.riskLevel === 'Healthy' ? 'bg-green-600' : prediction.riskLevel === 'Low Risk' ? 'bg-teal-600' : prediction.riskLevel === 'Moderate Risk' ? 'bg-yellow-600' : 'bg-red-600'}">
                ${prediction.riskLevel.toUpperCase()}
              </span>
              <p class="text-xs text-gray-400 mt-1">Confidence Score: ${(prediction.confidence * 100).toFixed(1)}%</p>
            </div>
          </div>

          <!-- Assessment Specs -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg mb-6">
            <div>
              <p class="text-xs text-gray-400 uppercase font-semibold">Temperature</p>
              <p class="text-lg font-bold text-gray-800">${sensors.temperature.toFixed(1)} °C</p>
              <span class="text-xs text-gray-400">${sensors.temperature > 30 ? 'Heat Stress' : sensors.temperature < 15 ? 'Cold Stress' : 'Thermoneutral'}</span>
            </div>
            <div>
              <p class="text-xs text-gray-400 uppercase font-semibold">Humidity</p>
              <p class="text-lg font-bold text-gray-800">${sensors.humidity.toFixed(1)} %</p>
              <span class="text-xs text-gray-400">${sensors.humidity > 75 ? 'Damp Dampness' : sensors.humidity < 40 ? 'Dry Dust' : 'Normal'}</span>
            </div>
            <div>
              <p class="text-xs text-gray-400 uppercase font-semibold">CO₂ concentration</p>
              <p class="text-lg font-bold text-gray-800">${sensors.co2.toFixed(0)} ppm</p>
              <span class="text-xs text-gray-400">${sensors.co2 > 2500 ? 'Poor Ventilation' : 'Safe'}</span>
            </div>
            <div>
              <p class="text-xs text-gray-400 uppercase font-semibold">Ammonia (NH₃)</p>
              <p class="text-lg font-bold text-gray-800">${sensors.ammonia.toFixed(1)} ppm</p>
              <span class="text-xs text-gray-400">${sensors.ammonia > 15 ? 'Mucosal Risk' : 'Excellent'}</span>
            </div>
          </div>

          <!-- Metadata -->
          <div class="mb-6 flex justify-between text-xs text-gray-500 font-mono">
            <span>Generated At: ${dateFormatted}</span>
            <span>Record ID: ${record.id}</span>
          </div>

          <!-- AI Assessment Details -->
          ${aiRecommendations ? `
            <div class="space-y-6">
              <div>
                <h3 class="text-sm font-bold text-indigo-800 uppercase tracking-wider mb-2">1. Dynamic Environmental Interpretation</h3>
                <p class="text-sm text-gray-700 leading-relaxed bg-indigo-50/50 p-4 rounded">${aiRecommendations.explanation}</p>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 class="text-sm font-bold text-gray-800 uppercase tracking-wider mb-2">2. Possible Causes</h3>
                  <ul class="list-disc pl-5 text-sm text-gray-600 space-y-1">
                    ${aiRecommendations.causes.map(c => `<li>${c}</li>`).join('')}
                  </ul>
                </div>
                <div>
                  <h3 class="text-sm font-bold text-gray-800 uppercase tracking-wider mb-2">3. Immediate On-Site Actions</h3>
                  <ul class="list-disc pl-5 text-sm text-gray-600 space-y-1">
                    ${aiRecommendations.immediatePreventiveMeasures.map(m => `<li>${m}</li>`).join('')}
                  </ul>
                </div>
              </div>

              <hr class="border-gray-200" />

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 class="text-sm font-bold text-gray-800 uppercase tracking-wider mb-2">4. Climatology & Fan Adjustments</h3>
                  <ul class="list-disc pl-5 text-sm text-gray-600 space-y-1">
                    ${aiRecommendations.environmentalAdjustments.map(env => `<li>${env}</li>`).join('')}
                  </ul>
                </div>
                <div>
                  <h3 class="text-sm font-bold text-gray-800 uppercase tracking-wider mb-2">5. Nutrition & Bio-Sanitation</h3>
                  <ul class="list-disc pl-5 text-sm text-gray-600 space-y-1">
                    ${aiRecommendations.feedingAndHygiene.map(f => `<li>${f}</li>`).join('')}
                  </ul>
                </div>
              </div>

              <hr class="border-gray-200" />

              <div class="bg-red-50 p-4 rounded border border-red-100">
                <h3 class="text-sm font-bold text-red-800 uppercase tracking-wider mb-1">6. Avian Veterinary Action Recommendation</h3>
                <p class="text-sm text-gray-700 leading-relaxed">${aiRecommendations.veterinaryAdvice}</p>
              </div>

              <div class="border-t border-dashed border-gray-300 pt-6 mt-6">
                <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 text-center">Daily Farm Logger Report</h3>
                <p class="text-sm text-center text-gray-600 italic">"${aiRecommendations.dailyFarmReport}"</p>
              </div>
            </div>
          ` : `
            <div class="p-8 text-center text-gray-400 italic">Recommendations missing. Perform an updated sensor analysis to generate Gemini insights.</div>
          `}

          <!-- Footer -->
          <div class="border-t border-gray-200 mt-12 pt-6 text-center text-xs text-gray-400 font-mono">
            <span>Powered by Poultry Guardian RF Classifier & Google Gemini 3.5 AI Core</span>
          </div>
        </div>
      </body>
      </html>
    `;

    backupWindow.document.write(formattedHtml);
    backupWindow.document.close();
  };

  const handleDownloadCSV = () => {
    if (history.length === 0) return;
    
    const headers = [
      'Timestamp',
      'Temperature (C)',
      'Humidity (%)',
      'CO2 Level (ppm)',
      'Ammonia Level (ppm)',
      'Predicted Risk Level',
      'Confidence (%)'
    ];
    
    const rows = history.map((record) => {
      const timestamp = new Date(record.timestamp).toISOString();
      const temp = record.sensors.temperature;
      const humid = record.sensors.humidity;
      const co2 = record.sensors.co2;
      const ammonia = record.sensors.ammonia;
      const riskLevel = record.prediction.riskLevel;
      const confidence = (record.prediction.confidence * 100).toFixed(1);
      
      return [
        `"${timestamp}"`,
        temp,
        humid,
        co2,
        ammonia,
        `"${riskLevel}"`,
        confidence
      ];
    });
    
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `poultry_guardian_telemetry_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Chart Formatting Helpers
  const formatChartDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getHours()}:${d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes()}`;
  };

  // Extract selected sensor parameter values for focus visualization chart
  const getFocussingChartData = () => {
    return history.slice(0, 10).reverse().map(rec => {
      let value = 0;
      let label = "";
      switch (chartFocusSensor) {
        case 'temp':
          value = rec.sensors.temperature;
          label = "Temp (°C)";
          break;
        case 'humid':
          value = rec.sensors.humidity;
          label = "Humidity (%)";
          break;
        case 'co2':
          value = rec.sensors.co2;
          label = "CO2 (ppm)";
          break;
        case 'amm':
          value = rec.sensors.ammonia;
          label = "Ammonia (ppm)";
          break;
      }
      return {
        time: formatChartDate(rec.timestamp),
        [label]: parseFloat(value.toFixed(1)),
        risk: rec.prediction.riskLevel,
        confidence: rec.prediction.confidence
      };
    });
  };

  const currentChartSensorLabel = () => {
    switch (chartFocusSensor) {
      case 'temp': return "Temperature (°C)";
      case 'humid': return "Humidity (%)";
      case 'co2': return "CO2 Level (ppm)";
      case 'amm': return "Ammonia Level (ppm)";
    }
  };

  const getChartLineColor = () => {
    switch (chartFocusSensor) {
      case 'temp': return "#ef4444";
      case 'humid': return "#06b6d4";
      case 'co2': return "#8b5cf6";
      case 'amm': return "#f59e0b";
    }
  };

  const currentChartFocussedData = getFocussingChartData();

  // Create probability weights for radar representation
  const radarChartData = lastPrediction ? [
    { subject: 'Healthy', score: lastPrediction.prediction.probabilities['Healthy'] * 100 },
    { subject: 'Low Risk', score: lastPrediction.prediction.probabilities['Low Risk'] * 100 },
    { subject: 'Moderate Risk', score: lastPrediction.prediction.probabilities['Moderate Risk'] * 100 },
    { subject: 'High Risk', score: lastPrediction.prediction.probabilities['High Disease Risk'] * 100 },
  ] : [];

  if (!isLoggedIn) {
    return <FarmerLogin onLoginSuccess={handleLoginSuccess} isDarkMode={false} />;
  }

  return (
    <div className={`min-h-screen transition-colors duration-200 ${isDarkMode ? 'bg-[#0a0f0d] text-[#e2ede8]' : 'bg-[#f4f7f5] text-slate-800'} p-4 lg:p-6`}>
      
      {/* Header Bar */}
      <header className="max-w-7xl mx-auto h-16 md:h-14 glass-card rounded-xl flex items-center justify-between px-4 md:px-6 shadow-sm mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white shadow-sm flex-shrink-0">
            <Activity className="w-4.5 h-4.5 animate-pulse text-white/90" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-black tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span>FeatherAI <span className="text-emerald-600 font-bold">PoultryGuard</span></span>
              {farmerDetails && (
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider font-extrabold bg-[#ea580c]/10 dark:bg-[#ea580c]/25 text-[#ea580c] dark:text-[#f97316] border border-[#ea580c]/20">
                  {farmerDetails.name}
                </span>
              )}
            </h1>
            <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
              ಫಾರ್ಮ್ ID: <span className="font-bold text-[#ea580c] dark:text-[#f59e0b]">{farmerDetails?.farmId || 'KA-BARN-09'}</span> • 📍 {farmerDetails?.location || 'South India'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          {/* Retrain Action Button */}
          <button
            onClick={handleRetrain}
            disabled={isTraining}
            title="Retrain Random Forest Classifier"
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-bold border transition duration-150 ${isDarkMode ? 'border-slate-800 hover:bg-slate-800 disabled:opacity-40 text-slate-300' : 'border-slate-200 hover:bg-slate-50 disabled:opacity-40 text-slate-700'}`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTraining ? 'animate-spin text-emerald-500' : 'text-slate-400'}`} />
            <span className="hidden sm:inline">{isTraining ? 'Training Model...' : 'Retrain Trees'}</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-1.5 rounded-lg transition duration-155 ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-yellow-400' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Farmer Portal Sign-Out / Log Out */}
          <button
            onClick={handleLogout}
            title="Log Out From Farmer Account"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition duration-150 ${isDarkMode ? 'border-orange-900/40 bg-orange-950/20 hover:bg-orange-950/40 text-orange-400' : 'border-orange-100 bg-orange-50 hover:bg-orange-100 text-orange-700'}`}
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto space-y-4">
        
        {/* Retraining Feedback Alert */}
        {trainMessage && (
          <div className="flex items-center gap-3 p-4 border rounded-xl bg-emerald-500/10 border-emerald-500/20 text-emerald-500 dark:text-emerald-400 animate-slide-in">
            <Sparkles className="w-5 h-5 flex-shrink-0 animate-pulse text-emerald-500" />
            <p className="text-sm font-semibold">{trainMessage}</p>
          </div>
        )}

        {/* Top Feature Division Grid (Inputs vs Active Analytics Card) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* Telemetry Inputs Column (Left Side) */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Climatology Presets Selector */}
            <div className="p-4 rounded-xl glass-card shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Compass className="w-4 h-4 text-emerald-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Dynamic Atmospheric Scenarios</h3>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3.5">Inject representative real poultry house readings instantly:</p>
              
              <div className="space-y-2">
                {SENSOR_SCENARIOS.map((sc, idx) => {
                  let accentColor = "text-emerald-600 border-emerald-500/20 bg-emerald-500/5";
                  if (sc.scenario === 'low-risk') accentColor = "text-teal-600 border-teal-500/20 bg-teal-500/5";
                  if (sc.scenario === 'moderate-risk') accentColor = "text-amber-600 border-amber-500/20 bg-amber-500/5";
                  if (sc.scenario === 'high-risk') accentColor = "text-rose-600 border-rose-500/20 bg-rose-500/5";

                  return (
                    <button
                      key={idx}
                      onClick={() => handleLoadScenario(sc)}
                      className={`w-full text-left p-3 rounded-lg border text-xs flex justify-between items-start gap-3 transition hover:bg-slate-50/50 dark:hover:bg-slate-800/50 ${isDarkMode ? 'border-slate-800/80' : 'border-slate-200'}`}
                    >
                      <div className="space-y-0.5">
                        <div className="font-bold text-slate-700 dark:text-slate-200">{sc.name}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal line-clamp-1">{sc.description}</div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full font-mono text-[9px] uppercase font-bold border ${accentColor}`}>
                        {sc.scenario.replace('-', ' ')}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Manual Input Form */}
            <form onSubmit={handleAnalyze} className="p-5 rounded-xl glass-card shadow-sm space-y-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  Manual Sensor override
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Submit ambient barn parameters to perform Gini disease predictions and compile advice.</p>
              </div>

              {validationError && (
                <div className="p-3 border rounded-lg flex items-center gap-2.5 text-xs text-rose-500 bg-rose-500/5 border-rose-500/20">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}

              <div className="space-y-3">
                
                {/* Temperature Input */}
                <div className={`p-3 rounded-lg border transition-colors ${isDarkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <span>Temperature (°C)</span>
                    <span className="text-[9px] font-mono opacity-85">Ideal: 18 - 24°C</span>
                  </div>
                  <div className="flex justify-between items-center mt-1.5 gap-2">
                    <input
                      type="number"
                      step="0.1"
                      min="-15"
                      max="55"
                      value={tempInput}
                      onChange={(e) => setTempInput(e.target.value)}
                      required
                      className="text-lg font-bold text-slate-800 dark:text-slate-100 sensor-font w-16 bg-transparent focus:outline-none"
                    />
                    <input
                      type="range"
                      min="-15"
                      max="55"
                      step="0.1"
                      value={isNaN(parseFloat(tempInput)) ? 20 : parseFloat(tempInput)}
                      onChange={(e) => setTempInput(e.target.value)}
                      className="w-32 accent-emerald-600 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Humidity Input */}
                <div className={`p-3 rounded-lg border transition-colors ${isDarkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <span>Humidity (%)</span>
                    <span className="text-[9px] font-mono opacity-85">Ideal: 50 - 70%</span>
                  </div>
                  <div className="flex justify-between items-center mt-1.5 gap-2">
                    <input
                      type="number"
                      step="0.1"
                      min="10"
                      max="100"
                      value={humidInput}
                      onChange={(e) => setHumidInput(e.target.value)}
                      required
                      className="text-lg font-bold text-slate-800 dark:text-slate-100 sensor-font w-16 bg-transparent focus:outline-none"
                    />
                    <input
                      type="range"
                      min="10"
                      max="100"
                      step="0.1"
                      value={isNaN(parseFloat(humidInput)) ? 60 : parseFloat(humidInput)}
                      onChange={(e) => setHumidInput(e.target.value)}
                      className="w-32 accent-emerald-600 cursor-pointer"
                    />
                  </div>
                </div>

                {/* CO2 concentration */}
                <div className={`p-3 rounded-lg border transition-colors ${isDarkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <span>CO₂ Level (ppm)</span>
                    <span className="text-[9px] font-mono opacity-85">Safe: &lt; 2000 ppm</span>
                  </div>
                  <div className="flex justify-between items-center mt-1.5 gap-2">
                    <input
                      type="number"
                      step="1"
                      min="200"
                      max="10000"
                      value={co2Input}
                      onChange={(e) => setCo2Input(e.target.value)}
                      required
                      className="text-lg font-bold text-slate-800 dark:text-slate-100 sensor-font w-16 bg-transparent focus:outline-none"
                    />
                    <input
                      type="range"
                      min="200"
                      max="10000"
                      step="50"
                      value={isNaN(parseFloat(co2Input)) ? 800 : parseFloat(co2Input)}
                      onChange={(e) => setCo2Input(e.target.value)}
                      className="w-32 accent-amber-500 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Ammonia Concentration */}
                <div className={`p-3 rounded-lg border transition-colors ${isDarkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <span>Ammonia (ppm)</span>
                    <span className="text-[9px] font-mono opacity-85">Toxic limit: 15+ ppm</span>
                  </div>
                  <div className="flex justify-between items-center mt-1.5 gap-2">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="120"
                      value={ammInput}
                      onChange={(e) => setAmmInput(e.target.value)}
                      required
                      className="text-lg font-bold text-slate-800 dark:text-slate-100 sensor-font w-16 bg-transparent focus:outline-none"
                    />
                    <input
                      type="range"
                      min="0"
                      max="120"
                      step="0.1"
                      value={isNaN(parseFloat(ammInput)) ? 15 : parseFloat(ammInput)}
                      onChange={(e) => setAmmInput(e.target.value)}
                      className="w-32 accent-rose-500 cursor-pointer"
                    />
                  </div>
                </div>

              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 disabled:opacity-40 text-white rounded-lg font-bold text-xs uppercase tracking-widest mt-2 transition-colors flex justify-center items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Running ML Prediction...</span>
                  </>
                ) : (
                  <>
                    <span>Run ML Prediction</span>
                  </>
                )}
              </button>
            </form>

            {/* Random Forest Parameters Display */}
            <div className="p-4 rounded-xl glass-card shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-orange-400" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">RF Classifier Parameters</h4>
                </div>
                <span className="text-[10px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/10 px-2 py-0.5 rounded">Saved Model JSON</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center mb-4">
                <div className={`p-2.5 rounded-xl ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
                  <div className="text-base font-bold font-mono text-indigo-400">{mlStats.treeCount}</div>
                  <div className="text-[9px] uppercase font-bold text-slate-400">Total Trees</div>
                </div>
                <div className={`p-2.5 rounded-xl ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
                  <div className="text-base font-bold font-mono text-cyan-400">{mlStats.maxDepth}</div>
                  <div className="text-[9px] uppercase font-bold text-slate-400">Max Depth</div>
                </div>
                <div className={`p-2.5 rounded-xl ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
                  <div className="text-base font-bold font-mono text-emerald-400">{(mlStats.accuracy * 100).toFixed(1)}%</div>
                  <div className="text-[9px] uppercase font-bold text-slate-400">OOB Accuracy</div>
                </div>
              </div>

              {/* Relative Feature Importances */}
              <div className="space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Calculated Gini Impurity Feature Importance</div>
                <div className="space-y-1.5">
                  {Object.entries(mlStats.featureImportance).map(([f, weight]) => {
                    const wNum = weight as number;
                    let label = "Ammonia (NH₃)";
                    let color = "bg-amber-400";
                    if (f === 'temperature') { label = "Temperature"; color = "bg-rose-400"; }
                    if (f === 'humidity') { label = "Humidity"; color = "bg-cyan-400"; }
                    if (f === 'co2') { label = "Carbon Dioxide"; color = "bg-purple-400"; }

                    return (
                      <div key={f} className="text-xs">
                        <div className="flex justify-between text-[11px] mb-0.5 text-slate-400 font-medium">
                          <span>{label}</span>
                          <span className="font-mono text-[10px]">{Math.round(wNum * 100)}%</span>
                        </div>
                        <div className={`w-full h-1.5 rounded-full ${isDarkMode ? 'bg-slate-950' : 'bg-slate-100'}`}>
                          <div className={`h-full rounded-full ${color}`} style={{ width: `${wNum * 100}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Active Diagnostic Analytics Card & Gemini Explanation Column (Right Side) */}
          <div className="lg:col-span-7 space-y-4">
            
            {lastPrediction ? (
              <motion.div
                key={lastPrediction.id}
                initial={{ opacity: 0, scale: 0.98, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="p-5 rounded-xl glass-card shadow-sm space-y-4"
              >
                
                {/* Active Header Result */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b pb-4 border-slate-200/40 dark:border-slate-800/40">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-100 dark:bg-slate-950/60 px-2.5 py-1 rounded">Latest Poultry Health Assessment</span>
                    <h2 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2 mt-2">
                      <span className="text-slate-700 dark:text-slate-200">Status:</span>
                      <span className={`px-2.5 py-0.5 rounded-md border text-xs font-extrabold uppercase ${getRiskColorClasses(lastPrediction.prediction.riskLevel).text} ${getRiskColorClasses(lastPrediction.prediction.riskLevel).border} ${getRiskColorClasses(lastPrediction.prediction.riskLevel).bg}`}>
                        {lastPrediction.prediction.riskLevel}
                      </span>
                    </h2>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePrintReport(lastPrediction)}
                      className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border transition cursor-pointer ${isDarkMode ? 'border-slate-800 hover:bg-slate-800 text-indigo-400' : 'border-indigo-100 hover:bg-indigo-50 text-indigo-600 bg-indigo-50/20'}`}
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Print Veterinary Report</span>
                    </button>
                  </div>
                </div>

                {/* Sub-panels switcher layout tabs */}
                <div className="flex border-b border-slate-100 dark:border-slate-800/40 mb-2">
                  <button
                    onClick={() => setActiveTab('recommendations')}
                    className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 -mb-px transition duration-150 cursor-pointer ${activeTab === 'recommendations' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-500'}`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Gemini Recommendations</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('diagnostics')}
                    className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 -mb-px transition duration-155 cursor-pointer ${activeTab === 'diagnostics' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-500'}`}
                  >
                    <div className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" />
                      <span>Classifier Probability Matrix</span>
                    </div>
                  </button>
                </div>

                {/* Content Panel Area */}
                {activeTab === 'recommendations' ? (
                  <div className="space-y-4">
                    
                    {/* Explanation Summary Statement */}
                    {lastPrediction.aiRecommendations ? (
                      <div className="space-y-4">
                        
                        {/* Fallback Notice Alert Banner */}
                        {lastPrediction.aiRecommendations.isFallback && (
                          <div className={`p-3.5 rounded-xl border flex items-start gap-2.5 text-xs ${isDarkMode ? 'bg-amber-950/20 border-amber-500/20 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
                            <AlertCircle className="w-4.5 h-4.5 text-amber-500 flex-shrink-0 mt-0.5" />
                            <div className="space-y-0.5">
                              <p className="font-bold text-xs">Automated Fail-Safe Engaged</p>
                              <p className="text-[11px] opacity-90 leading-relaxed">
                                Gemini model demand is elevated. Poultry Guardian AI has automatically activated the built-in precision avian rules engine to provide calibrated, scientifically backed recommendations seamlessly.
                              </p>
                            </div>
                          </div>
                        )}

                        <div className="p-4 rounded-xl gemini-glow relative overflow-hidden text-slate-800 dark:text-slate-200">
                          <Sparkles className="absolute -right-3 -top-3 w-16 h-16 opacity-10 text-indigo-500 pointer-events-none" />
                          <h4 className="text-[10px] uppercase font-bold tracking-widest text-indigo-600 dark:text-indigo-400 mb-1.5 flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-indigo-500" />
                            Dynamic Environmental Interpretation
                          </h4>
                          <p className="text-xs sm:text-sm leading-relaxed font-semibold">{lastPrediction.aiRecommendations.explanation}</p>
                        </div>

                        {/* Bento Grid: Causes & Immediate Onsite Actions */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          
                          {/* Possibility causes container */}
                          <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-950/40 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`}>
                            <h5 className="text-[10px] uppercase font-bold tracking-wider text-orange-600 dark:text-orange-400 mb-2.5 flex items-center gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />
                              Potential Causes
                            </h5>
                            <ul className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed list-none pl-0">
                              {lastPrediction.aiRecommendations.causes.map((c, i) => (
                                <li key={i} className="flex gap-1.5 items-start">
                                  <ChevronRight className="w-3.5 h-3.5 text-orange-500/70 mt-0.5 flex-shrink-0" />
                                  <span>{c}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Immediate Measures */}
                          <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-950/40 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`}>
                            <h5 className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400 mb-2.5 flex items-center gap-1.5">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                              Immediate On-Site Actions
                            </h5>
                            <ul className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed list-none pl-0">
                              {lastPrediction.aiRecommendations.immediatePreventiveMeasures.map((m, i) => (
                                <li key={i} className="flex gap-1.5 items-start">
                                  <ChevronRight className="w-3.5 h-3.5 text-emerald-500/80 mt-0.5 flex-shrink-0" />
                                  <span>{m}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                                     {/* Climatology & Ventilation adjustment instruction list */}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          
                          <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                            <h5 className="text-[10px] uppercase font-bold tracking-wider text-cyan-600 dark:text-cyan-400 mb-2.5 flex items-center gap-1.5">
                              <Wind className="w-3.5 h-3.5 text-cyan-500" />
                              Climatology & Fan Adjusts
                            </h5>
                            <ul className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed list-none pl-0">
                              {lastPrediction.aiRecommendations.environmentalAdjustments.map((env, i) => (
                                <li key={i} className="flex gap-1.5 items-start">
                                  <ChevronRight className="w-3.5 h-3.5 text-cyan-400/70 mt-0.5 flex-shrink-0" />
                                  <span>{env}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                            <h5 className="text-[10px] uppercase font-bold tracking-wider text-indigo-600 dark:text-indigo-400 mb-2.5 flex items-center gap-1.5">
                              <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                              Nutrition & Sanitation
                            </h5>
                            <ul className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed list-none pl-0">
                              {lastPrediction.aiRecommendations.feedingAndHygiene.map((fd, i) => (
                                <li key={i} className="flex gap-1.5 items-start">
                                  <ChevronRight className="w-3.5 h-3.5 text-indigo-400/70 mt-0.5 flex-shrink-0" />
                                  <span>{fd}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                        </div>

                        {/* Avian Veterinary Suggestion Banner */}
                        <div className="p-4 rounded-xl border border-rose-500/10 bg-rose-500/5 text-rose-400">
                          <h5 className="text-xs uppercase font-extrabold tracking-widest text-rose-400 mb-1 flex items-center gap-1.5">
                            <ShieldAlert className="w-4 h-4 text-rose-400" />
                            Avian Veterinary Assessment Protocol
                          </h5>
                          <p className="text-xs text-slate-300 leading-relaxed font-normal">{lastPrediction.aiRecommendations.veterinaryAdvice}</p>
                        </div>

                        {/* Daily Farm Summary strip */}
                        <div className={`p-3 text-center border border-dashed rounded-xl ${isDarkMode ? 'bg-slate-950/60 border-slate-800/80 text-slate-400' : 'bg-slate-100/50 border-slate-200 text-slate-600'}`}>
                          <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Flock Summary Index Logger</div>
                          <p className="text-xs italic mt-1 font-medium">"{lastPrediction.aiRecommendations.dailyFarmReport}"</p>
                        </div>

                      </div>
                    ) : (
                      <div className="py-12 text-center text-slate-500 italic text-sm">Recommendations loading...</div>
                    )}

                  </div>
                ) : (
                  // Diagnostics Tabs: probability breakdown
                  <div className="space-y-6">
                    
                    {/* Visual progress bar probability breakdown */}
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-xs uppercase font-extrabold tracking-widest text-indigo-400 mb-1">Random Forest Dynamic Voting Matrix</h4>
                        <p className="text-xs text-slate-400">This matrix represents the proportion of ensemble decision trees that classified the inputs under each category.</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                        {/* Interactive Probability Bars */}
                        <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-950 border-slate-800/80' : 'bg-slate-50 border-slate-200'} space-y-3.5`}>
                          {(Object.keys(lastPrediction.prediction.probabilities) as RiskLevel[]).map(levelKey => {
                            const weight = lastPrediction.prediction.probabilities[levelKey];
                            const percentage = Math.round(weight * 100);
                            let barColor = "bg-emerald-500";
                            if (levelKey === 'Low Risk') barColor = "bg-teal-500";
                            if (levelKey === 'Moderate Risk') barColor = "bg-amber-500";
                            if (levelKey === 'High Disease Risk') barColor = "bg-rose-600";

                            // Is this the predicting label?
                            const isWinner = lastPrediction.prediction.riskLevel === levelKey;

                            return (
                              <div key={levelKey} className={`space-y-1 ${isWinner ? 'opacity-100 ring-2 ring-indigo-500/20 p-2 rounded bg-indigo-500/5' : 'opacity-60'}`}>
                                <div className="flex justify-between items-center text-xs">
                                  <span className="font-bold flex items-center gap-1.5">
                                    {isWinner && <CheckCircle className="w-3.5 h-3.5 text-indigo-400" />}
                                    {levelKey}
                                  </span>
                                  <span className="font-mono font-bold">{percentage}%</span>
                                </div>
                                <div className={`w-full h-2 rounded-full ${isDarkMode ? 'bg-slate-900' : 'bg-slate-200'}`}>
                                  <div className={`h-full rounded-full ${barColor}`} style={{ width: `${percentage}%` }} />
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Radar Chart mapping confidence spreads */}
                        <div className={`p-2 rounded-xl border flex items-center justify-center min-h-[220px] ${isDarkMode ? 'bg-slate-950 border-slate-800/80' : 'bg-slate-50 border-slate-200'}`}>
                          <ResponsiveContainer width="100%" height={220}>
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarChartData}>
                              <PolarGrid stroke={isDarkMode ? '#334155' : '#cbd5e1'} />
                              <PolarAngleAxis dataKey="subject" tick={{ fill: isDarkMode ? '#94a3b8' : '#475569', fontSize: 10 }} />
                              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: isDarkMode ? '#64748b' : '#64748b', fontSize: 8 }} />
                              <Radar
                                name="Probability %"
                                dataKey="score"
                                stroke="#6366f1"
                                fill="#6366f1"
                                fillOpacity={0.3}
                              />
                            </RadarChart>
                          </ResponsiveContainer>
                        </div>

                      </div>

                    </div>

                    {/* Technical details block */}
                    <div className="p-4 rounded-xl border border-indigo-500/10 bg-indigo-500/5 text-xs text-slate-400 space-y-2 leading-relaxed">
                      <div className="font-bold text-slate-300 uppercase tracking-widest text-[10px]">Machine Learning Model Inference Log</div>
                      <div>
                        Predicted <span className="font-extrabold text-indigo-400">"{lastPrediction.prediction.riskLevel}"</span> with a confidence score of <span className="font-mono text-indigo-300">{(lastPrediction.prediction.confidence * 100).toFixed(1)}%</span>.
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-2 mt-2 border-t border-indigo-500/10">
                        <div>
                          <p className="font-bold text-slate-300">Feature Preprocessing:</p>
                          <p className="text-[11px] text-slate-500">Numerical vectors normalized. Inputs matched exactly to optimal poultry biosafety metrics configured during Gini node splitting.</p>
                        </div>
                        <div>
                          <p className="font-bold text-slate-300">Bagging & Voting:</p>
                          <p className="text-[11px] text-slate-500">Decision forest queried synchronously. Sub-trees provided distinct evaluations before reaching statistical consensus.</p>
                        </div>
                      </div>
                    </div>

                  </div>
                )}

              </motion.div>
            ) : (
              <div className={`p-12 text-center rounded-2xl border flex flex-col items-center justify-center space-y-3 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <Activity className="w-12 h-12 text-indigo-400 animate-pulse" />
                <h3 className="font-bold text-lg">No Environmental Diagnostics Present</h3>
                <p className="text-xs text-slate-400 max-w-sm">Please insert real-time poultry coordinates manually or load any sample preset scenario to trigger assessment pipelines.</p>
              </div>
            )}

          </div>

        </div>

        {/* Dynamic Climatology Charts Panel */}
        {history.length > 0 && (
          <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} space-y-4`}>
            
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <History className="w-4 h-4 text-indigo-400" />
                  House Climatology Sensor Trends
                </h3>
                <p className="text-xs text-slate-400">Review ambient sensor trajectories monitored across the recent 10 prediction cycles.</p>
              </div>

              {/* Focus Selector controls */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => setChartFocusSensor('amm')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${chartFocusSensor === 'amm' ? 'bg-amber-500/25 text-amber-400 border border-amber-500/30' : 'bg-slate-950/40 text-slate-400 hover:text-slate-200 border border-transparent'}`}
                >
                  Ammonia Gas (NH₃)
                </button>
                <button
                  onClick={() => setChartFocusSensor('temp')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${chartFocusSensor === 'temp' ? 'bg-rose-500/25 text-rose-400 border border-rose-500/30' : 'bg-slate-950/40 text-slate-400 hover:text-slate-200 border border-transparent'}`}
                >
                  Temperature (°C)
                </button>
                <button
                  onClick={() => setChartFocusSensor('humid')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${chartFocusSensor === 'humid' ? 'bg-cyan-500/25 text-cyan-400 border border-cyan-500/30' : 'bg-slate-950/40 text-slate-400 hover:text-slate-200 border border-transparent'}`}
                >
                  Humidity (%)
                </button>
                <button
                  onClick={() => setChartFocusSensor('co2')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${chartFocusSensor === 'co2' ? 'bg-purple-500/25 text-purple-400 border border-purple-500/30' : 'bg-slate-950/40 text-slate-400 hover:text-slate-200 border border-transparent'}`}
                >
                  Carbon Dioxide (CO₂)
                </button>
              </div>
            </div>

            <div className={`p-4 rounded-xl min-h-[300px] flex items-center justify-center ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={currentChartFocussedData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="sensorGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={getChartLineColor()} stopOpacity={0.25}/>
                      <stop offset="95%" stopColor={getChartLineColor()} stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#1e293b' : '#e2e8f0'} />
                  <XAxis dataKey="time" tick={{ fill: isDarkMode ? '#64748b' : '#475569', fontSize: 10 }} />
                  <YAxis tick={{ fill: isDarkMode ? '#64748b' : '#475569', fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
                      border: isDarkMode ? '1px solid #1e293b' : '1px solid #cbd5e1',
                      borderRadius: '12px',
                      color: isDarkMode ? '#f8fafc' : '#1e2900',
                      fontSize: '12px'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', color: '#64748b' }} />
                  <Area
                    type="monotone"
                    dataKey={Object.keys(currentChartFocussedData[0] || {}).find(k => k !== 'time' && k !== 'risk' && k !== 'confidence') || ""}
                    stroke={getChartLineColor()}
                    fillOpacity={1}
                    fill="url(#sensorGrad)"
                    strokeWidth={2.5}
                    activeDot={{ r: 6 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="text-[10px] text-slate-500 text-center font-mono">
              Graph focuses on {currentChartSensorLabel()}. Color limits correspond to critical agricultural biohazard markers.
            </div>

          </div>
        )}

        {/* Historical Logs Table */}
        <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} space-y-4`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Telemetry History Logs</h3>
              <p className="text-xs text-slate-400">Complete listing of past environmental predictions. Click any record row to select and display recommendations.</p>
            </div>
            {history.length > 0 && (
              <button
                onClick={handleDownloadCSV}
                title="Download entire telemetry history to offline CSV spreadsheet analysis"
                className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border transition cursor-pointer self-start sm:self-auto ${
                  isDarkMode 
                    ? 'border-emerald-850/60 bg-emerald-950/10 hover:bg-emerald-950/30 text-emerald-400 hover:text-emerald-300' 
                    : 'border-emerald-100 hover:bg-emerald-50 text-emerald-600 bg-emerald-50/20'
                }`}
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download CSV</span>
              </button>
            )}
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800/10">
            <table className="w-full text-xs text-left">
              <thead className={`uppercase text-[10px] font-bold tracking-wider ${isDarkMode ? 'bg-slate-950 text-slate-400' : 'bg-slate-100/80 text-slate-600'}`}>
                <tr>
                  <th className="px-4 py-3.5">Timestamp</th>
                  <th className="px-4 py-3.5 text-center">Temp (°C)</th>
                  <th className="px-4 py-3.5 text-center">Humidity (%)</th>
                  <th className="px-4 py-3.5 text-center">CO₂ Level</th>
                  <th className="px-4 py-3.5 text-center">Ammonia</th>
                  <th className="px-4 py-3.5 text-center">Disease Prediction</th>
                  <th className="px-4 py-3.5 text-center">Confidence</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/20">
                {history.length > 0 ? (
                  history.map((record) => {
                    const rowColor = getRiskColorClasses(record.prediction.riskLevel).text;
                    const rowBadge = getRiskColorClasses(record.prediction.riskLevel).badge;
                    const dateObj = new Date(record.timestamp);
                    const isCurrentlySelected = lastPrediction?.id === record.id;

                    return (
                      <tr
                        key={record.id}
                        onClick={() => setLastPrediction(record)}
                        className={`cursor-pointer transition-colors ${
                          isCurrentlySelected 
                          ? (isDarkMode ? 'bg-indigo-600/10 hover:bg-indigo-600/15' : 'bg-indigo-50/70 hover:bg-indigo-100/80') 
                          : (isDarkMode ? 'hover:bg-slate-800/60' : 'hover:bg-slate-100/40')
                        }`}
                      >
                        <td className="px-4 py-3 font-mono text-slate-400 whitespace-nowrap">
                          {dateObj.toLocaleDateString()} {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-4 py-3 text-center font-mono font-medium">{record.sensors.temperature.toFixed(1)}°C</td>
                        <td className="px-4 py-3 text-center font-mono font-medium">{record.sensors.humidity.toFixed(1)}%</td>
                        <td className="px-4 py-3 text-center font-mono font-medium text-purple-400">{record.sensors.co2.toFixed(0)} ppm</td>
                        <td className="px-4 py-3 text-center font-mono font-medium text-amber-400">{record.sensors.ammonia.toFixed(1)} ppm</td>
                        <td className="px-4 py-3 text-center font-extrabold text-[11px]">
                          <span className={`${rowColor}`}>
                            {record.prediction.riskLevel}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center font-mono text-slate-400">
                          {(record.prediction.confidence * 100).toFixed(0)}%
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handlePrintReport(record)}
                              title="Print detailed assessment summary"
                              className={`p-1.5 rounded hover:bg-slate-500/10 text-indigo-400 transition`}
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => handleDeleteRecord(record.id, e)}
                              title="Prune this telemetry log"
                              className="p-1.5 rounded hover:bg-red-500/10 text-rose-500 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-slate-500 italic">
                      Telemetry logs stack is empty. Insert a prediction to populate index.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      {/* Decorative footer */}
      <footer className="mt-16 py-8 border-t text-center text-xs text-slate-500 font-mono border-slate-800/10">
        <p>© 2026 Poultry Guardian AI. precision farming tools.</p>
        <p className="mt-1">National Institute of Veterinary Epidemiology and Disease Informatics</p>
      </footer>

    </div>
  );
}
