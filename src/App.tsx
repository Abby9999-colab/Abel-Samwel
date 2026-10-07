/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Leaf, 
  Droplets, 
  MapPin, 
  Sparkles, 
  Sun, 
  Thermometer, 
  CloudRain, 
  Clock, 
  Compass, 
  ArrowRight, 
  Database,
  CloudLightning,
  CloudDrizzle,
  Cloudy,
  Bot,
  Search,
  BookOpen,
  Send,
  X,
  Plus,
  RefreshCw,
  Building2,
  Globe,
  Settings,
  Sliders,
  Bell,
  ShieldAlert,
  Info,
  Scale,
  ShieldCheck,
  Lock,
  CheckCircle2,
  Trash2,
  HelpCircle,
  Copyright,
  ExternalLink,
  AlertTriangle,
  FileText,
  Zap,
  Gauge,
  Timer,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Camera,
  UploadCloud,
  ImageIcon,
  FileImage,
  Bug,
  Stethoscope,
  AudioLines,
  Play,
  Square,
  CalendarClock,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Crop, 
  CropCategory, 
  WeatherForecastDay, 
  WeatherForecastResponse, 
  ImageAnalysisResult,
  CropTask,
  LocationPreset
} from './types';
import { CROPS_DATA } from './data/crops';
import { AGRIBUSINESSES } from './data/companies';
import { DEFAULT_PROHIBITED_TERMS, LEGAL_CHARTER } from './data/terms';
import FallingRainBackground from './components/FallingRainBackground';
import LegalTermsModal from './components/LegalTermsModal';
import CropGrowthChart from './components/CropGrowthChart';
import LocationModal, { ALL_LOCATION_PRESETS } from './components/LocationModal';
import DueAlertsBanner from './components/DueAlertsBanner';
import TasksTab from './components/TasksTab';
// @ts-ignore
import appIcon from './assets/images/app_icon_1780129514145.png';

export default function App() {
  // Navigation & Category States
  const [activeTab, setActiveTab] = useState<'catalog' | 'search' | 'weather' | 'tasks' | 'assistant' | 'companies' | 'settings'>('catalog');
  const [selectedCategory, setSelectedCategory] = useState<CropCategory | 'all'>('all');
  const [companyFilter, setCompanyFilter] = useState<'all' | 'Tanzanian' | 'Global'>('all');
  
  // App settings states
  const [temperatureScale, setTemperatureScale] = useState<'C' | 'F'>('C');
  const [rainfallUnit, setRainfallUnit] = useState<'mm' | 'in'>('mm');
  const [swahiliPreference, setSwahiliPreference] = useState<boolean>(false);
  const [enableClimateAlerts, setEnableClimateAlerts] = useState<boolean>(true);
  const [enableSoilWarnings, setEnableSoilWarnings] = useState<boolean>(true);
  const [offlineCaching, setOfflineCaching] = useState<boolean>(true);

  // Cache simulation states
  const [syncStatus, setSyncStatus] = useState<'synced' | 'cleared'>('synced');
  const [syncLoading, setSyncLoading] = useState<boolean>(false);
  const [clearLoading, setClearLoading] = useState<boolean>(false);

  // Legal & Reserved / Prohibited Terms states
  const [showTermsModal, setShowTermsModal] = useState<boolean>(false);
  const [initialTermsTab, setInitialTermsTab] = useState<'all' | 'reserved' | 'prohibited' | 'fairuse'>('all');
  const [prohibitedTermsList, setProhibitedTermsList] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('abel_prohibited_terms');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_PROHIBITED_TERMS;
  });
  const [newProhibitedInput, setNewProhibitedInput] = useState<string>('');
  const [enforceProhibitedShield, setEnforceProhibitedShield] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('abel_prohibited_shield');
      if (saved !== null) return JSON.parse(saved);
    } catch (e) {}
    return true;
  });
  const [enforceAntiScrape, setEnforceAntiScrape] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('abel_anti_scrape');
      if (saved !== null) return JSON.parse(saved);
    } catch (e) {}
    return true;
  });

  // Save prohibited terms to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('abel_prohibited_terms', JSON.stringify(prohibitedTermsList));
    } catch (e) {}
  }, [prohibitedTermsList]);

  useEffect(() => {
    try {
      localStorage.setItem('abel_prohibited_shield', JSON.stringify(enforceProhibitedShield));
    } catch (e) {}
  }, [enforceProhibitedShield]);

  useEffect(() => {
    try {
      localStorage.setItem('abel_anti_scrape', JSON.stringify(enforceAntiScrape));
    } catch (e) {}
  }, [enforceAntiScrape]);

  // AI Acceleration & Speed States
  const [aiSpeedMode, setAiSpeedMode] = useState<'ultra_fast' | 'balanced'>(() => {
    try {
      const saved = localStorage.getItem('abel_ai_speed_mode');
      if (saved === 'balanced' || saved === 'ultra_fast') return saved;
    } catch (e) {}
    return 'ultra_fast';
  });
  const [aiResponseTimeMs, setAiResponseTimeMs] = useState<number | null>(null);
  const [aiResponseCached, setAiResponseCached] = useState<boolean>(false);
  const [aiStreamingActive, setAiStreamingActive] = useState<boolean>(false);
  const [cacheClearSuccess, setCacheClearSuccess] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem('abel_ai_speed_mode', aiSpeedMode);
    } catch (e) {}
  }, [aiSpeedMode]);

  const handleClearServerAiCache = async () => {
    try {
      await fetch('/api/abel/cache/clear', { method: 'POST' });
      setCacheClearSuccess(true);
      setTimeout(() => setCacheClearSuccess(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddProhibitedTerm = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newProhibitedInput.trim().toLowerCase();
    if (!trimmed) return;
    if (!prohibitedTermsList.map(t => t.toLowerCase()).includes(trimmed)) {
      setProhibitedTermsList([...prohibitedTermsList, trimmed]);
    }
    setNewProhibitedInput('');
  };

  const handleRemoveProhibitedTerm = (termToRemove: string) => {
    setProhibitedTermsList(prohibitedTermsList.filter(t => t.toLowerCase() !== termToRemove.toLowerCase()));
  };

  const handleResetProhibitedTerms = () => {
    setProhibitedTermsList(DEFAULT_PROHIBITED_TERMS);
  };

  const findProhibitedTerm = (text: string): string | null => {
    if (!enforceProhibitedShield || !text) return null;
    const lower = text.toLowerCase();
    for (const term of prohibitedTermsList) {
      const trimmed = term.trim().toLowerCase();
      if (trimmed && lower.includes(trimmed)) {
        return term;
      }
    }
    return null;
  };

  // Dynamic formatting functions
  const formatTemp = (tempStr: string) => {
    if (temperatureScale === 'F') {
      return tempStr.replace(/(\d+)\s*(°C|C|°)/gi, (_, p1) => {
        const c = parseInt(p1);
        const f = Math.round((c * 9/5) + 32);
        return `${f}°F`;
      });
    }
    return tempStr;
  };

  const formatRain = (rainStr: string) => {
    if (rainfallUnit === 'in') {
      return rainStr.replace(/([\d,]+)\s*mm/gi, (_, p1) => {
        const mm = parseInt(p1.replace(/,/g, ''));
        if (isNaN(mm)) return _;
        const inches = (mm / 25.4).toFixed(1);
        return `${inches} in`;
      });
    }
    return rainStr;
  };
  
  // Crop detailed view state
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
  
  // Search Filter specific states
  const [searchWaterFilter, setSearchWaterFilter] = useState<'all' | 'low' | 'high'>('all');
  const [searchHarvestSpeed, setSearchHarvestSpeed] = useState<'all' | 'fast' | 'slow'>('all');

  // Weather & Farm Location states (with persistence)
  const [selectedLocation, setSelectedLocation] = useState<LocationPreset>(() => {
    try {
      const saved = localStorage.getItem('abel_selected_location');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return ALL_LOCATION_PRESETS[0];
  });
  const [showLocationModal, setShowLocationModal] = useState<boolean>(false);
  const [weatherData, setWeatherData] = useState<WeatherForecastResponse | null>(null);
  const [weatherLoading, setWeatherLoading] = useState<boolean>(true);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [customLat, setCustomLat] = useState<string>('');
  const [customLon, setCustomLon] = useState<string>('');

  // Persist selected location
  useEffect(() => {
    try {
      localStorage.setItem('abel_selected_location', JSON.stringify(selectedLocation));
    } catch (e) {}
  }, [selectedLocation]);

  // Farm Planting & Watering Task / Reminder states
  const generateInitialTasks = (): CropTask[] => {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const in3Days = new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0];

    return [
      {
        id: 'task-initial-1',
        title: 'Morning Drip Irrigation Cycle (Tomatoes)',
        taskType: 'watering',
        cropName: 'Tomato',
        cropId: 'tomato',
        dueDate: today,
        dueTime: '07:30',
        frequency: 'daily',
        priority: 'high',
        status: 'pending',
        notes: 'Target 3.5L/plant soil moisture before morning temperature spikes above 25°C.',
        createdAt: new Date().toISOString()
      },
      {
        id: 'task-initial-2',
        title: 'Main Season Hybrid Maize Sowing Window',
        taskType: 'planting',
        cropName: 'Maize',
        cropId: 'maize',
        dueDate: today,
        dueTime: '08:00',
        frequency: 'once',
        priority: 'critical',
        status: 'pending',
        notes: 'Optimal planting window: Sow at 75cm x 25cm with DAP basal dressing in loose tilth.',
        createdAt: new Date().toISOString()
      },
      {
        id: 'task-initial-3',
        title: 'Secondary Loam Moisture Top-up (Coffee)',
        taskType: 'watering',
        cropName: 'Arabica Coffee',
        cropId: 'coffee',
        dueDate: tomorrow,
        dueTime: '06:30',
        frequency: 'weekly',
        priority: 'medium',
        status: 'pending',
        notes: 'Maintain root collar moisture during flowering stage.',
        createdAt: new Date().toISOString()
      },
      {
        id: 'task-initial-4',
        title: 'First Nitrogen (CAN) Top-Dressing at Knee-High',
        taskType: 'fertilizer',
        cropName: 'Maize',
        cropId: 'maize',
        dueDate: in3Days,
        dueTime: '09:00',
        frequency: 'once',
        priority: 'high',
        status: 'pending',
        notes: 'Apply 50kg/acre CAN in moist soil 5cm away from maize stems.',
        createdAt: new Date().toISOString()
      }
    ];
  };

  const [tasks, setTasks] = useState<CropTask[]>(() => {
    try {
      const saved = localStorage.getItem('abel_crop_tasks');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return generateInitialTasks();
  });

  // Save tasks to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('abel_crop_tasks', JSON.stringify(tasks));
    } catch (e) {}
  }, [tasks]);

  const handleAddTask = (newTaskData: Omit<CropTask, 'id' | 'createdAt' | 'status'>) => {
    const newTask: CropTask = {
      ...newTaskData,
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const handleToggleCompleteTask = (taskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      const isCompleting = t.status === 'pending';

      if (isCompleting && t.frequency !== 'once') {
        const currentDate = new Date(t.dueDate);
        let daysToAdd = 1;
        if (t.frequency === 'daily') daysToAdd = 1;
        else if (t.frequency === 'every_2_days') daysToAdd = 2;
        else if (t.frequency === 'weekly') daysToAdd = 7;
        else if (t.frequency === 'biweekly') daysToAdd = 14;

        currentDate.setDate(currentDate.getDate() + daysToAdd);
        const nextDueDate = currentDate.toISOString().split('T')[0];

        return {
          ...t,
          dueDate: nextDueDate,
          status: 'pending'
        };
      }

      return {
        ...t,
        status: isCompleting ? 'completed' : 'pending',
        completedAt: isCompleting ? new Date().toISOString() : undefined
      };
    }));
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const handleSnoozeTask = (taskId: string, days: number = 1) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      const d = new Date(t.dueDate);
      d.setDate(d.getDate() + days);
      return {
        ...t,
        dueDate: d.toISOString().split('T')[0]
      };
    }));
  };

  // Due alerts count for navigation badge
  const todayDateStr = new Date().toISOString().split('T')[0];
  const dueAlertsCount = tasks.filter(t => t.status === 'pending' && t.dueDate <= todayDateStr).length;
  
  // Helper to completely strip star marks / asterisks from AI responses
  const stripStarMarks = (text: string): string => {
    if (!text) return '';
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/^\s*[\*•]\s+/gm, '- ')
      .replace(/\*/g, '');
  };

  // Abel AI Assistant States
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [aiResponse, setAiResponse] = useState<string>('');
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiCropsList, setAiCropsList] = useState<string[]>([]);
  const [aiSuitability, setAiSuitability] = useState<string>('');
  const [assistantSubTab, setAssistantSubTab] = useState<'chat' | 'vision'>('chat');

  // Voice Chat States
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [speechSupported, setSpeechSupported] = useState<boolean>(true);
  const [voiceModeActive, setVoiceModeActive] = useState<boolean>(false);
  const [voiceStatusText, setVoiceStatusText] = useState<string>('');

  // Crop Vision & Pathology Scanner States
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedImageName, setUploadedImageName] = useState<string>('');
  const [imageNotes, setImageNotes] = useState<string>('');
  const [imageAnalyzing, setImageAnalyzing] = useState<boolean>(false);
  const [imageAnalysisResult, setImageAnalysisResult] = useState<ImageAnalysisResult | null>(null);
  const [imageAnalysisError, setImageAnalysisError] = useState<string | null>(null);
  const [selectedCropHint, setSelectedCropHint] = useState<string>('Maize (Zea mays)');

  // Preset Sample Crop Photos for Instant 1-Click Diagnostic Testing
  const SAMPLE_DISEASE_PHOTOS = [
    {
      title: 'Maize - Armyworm Attack',
      titleSw: 'Mahindi - Funza wa Jeshi',
      image: 'https://images.unsplash.com/photo-1551462147-ff29053bfc14?auto=format&fit=crop&q=80&w=600',
      hint: 'Maize (Zea mays)',
      notes: 'Leaf whorl feeding damage and ragged edges from armyworm caterpillar feeding.'
    },
    {
      title: 'Tomato - Early Leaf Blight',
      titleSw: 'Nyanya - Ukungu wa Majani',
      image: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&q=80&w=600',
      hint: 'Tomato (Solanum lycopersicum)',
      notes: 'Concentric ring brown lesions on lower leaves with chlorotic halo.'
    },
    {
      title: 'Coffee - Rust Pustules',
      titleSw: 'Kahawa - Kutu ya Majani',
      image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=600',
      hint: 'Arabica Coffee (Coffea arabica)',
      notes: 'Orange powdery rust pustules on leaf underside with premature defoliation.'
    },
    {
      title: 'Bean - Vigorous Healthy',
      titleSw: 'Maharage - Afya Nzuri',
      image: 'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&q=80&w=600',
      hint: 'Phaseolus vulgaris (Common Bean)',
      notes: 'Vibrant green canopy, normal chlorophyll density for baseline monitoring.'
    }
  ];

  // Web Speech API Voice Recognition (Speech-to-Text)
  const toggleSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    if (isListening) {
      setIsListening(false);
      setVoiceStatusText('');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = swahiliPreference ? 'sw-TZ' : 'en-US';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceStatusText(swahiliPreference ? 'Inasikiliza sauti ya mkulima...' : 'Listening... Speak your agronomic question');
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setAiPrompt(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setVoiceStatusText(swahiliPreference ? 'Hitilafu ya sauti. Jaribu tena.' : 'Speech error. Try again.');
      };

      recognition.onend = () => {
        setIsListening(false);
        setVoiceStatusText('');
      };

      recognition.start();
    } catch (err) {
      console.error(err);
      setIsListening(false);
    }
  };

  // Web Speech API Text-to-Speech Output
  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    
    window.speechSynthesis.cancel();
    if (isSpeaking) {
      setIsSpeaking(false);
      return;
    }

    // Clean text of asterisks, markdown, and brackets for crisp spoken delivery
    const cleanSpokenText = stripStarMarks(text)
      .replace(/#/g, '')
      .replace(/\[!\]/g, '')
      .replace(/- /g, '')
      .replace(/Abel Crop Intelligence API Signed Release/g, 'Diagnosed by Abel Crop Intelligence.');

    const utterance = new SpeechSynthesisUtterance(cleanSpokenText);
    utterance.lang = swahiliPreference ? 'sw' : 'en-US';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Image Upload and Analysis Handlers
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedImageName(file.name);
    setImageAnalysisError(null);
    setImageAnalysisResult(null);

    const reader = new FileReader();
    reader.onload = () => {
      setUploadedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSamplePhoto = (sample: typeof SAMPLE_DISEASE_PHOTOS[0]) => {
    setUploadedImage(sample.image);
    setUploadedImageName(swahiliPreference ? sample.titleSw : sample.title);
    setSelectedCropHint(sample.hint);
    setImageNotes(sample.notes);
    setImageAnalysisResult(null);
    setImageAnalysisError(null);
  };

  const clearUploadedImage = () => {
    setUploadedImage(null);
    setUploadedImageName('');
    setImageAnalysisResult(null);
    setImageAnalysisError(null);
  };

  const analyzeCropImage = async () => {
    if (!uploadedImage) return;

    setImageAnalyzing(true);
    setImageAnalysisError(null);

    try {
      const res = await fetch('/api/abel/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: uploadedImage,
          cropHint: selectedCropHint,
          userNotes: imageNotes,
          language: swahiliPreference ? 'sw' : 'en'
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server returned ${res.status}`);
      }

      const data: ImageAnalysisResult = await res.json();
      setImageAnalysisResult(data);
    } catch (err: any) {
      console.error(err);
      setImageAnalysisError(err.message || 'Failed to analyze crop image');
    } finally {
      setImageAnalyzing(false);
    }
  };

  const sendDiagnosisToChat = (result: ImageAnalysisResult) => {
    const promptText = `I scanned a ${result.plantIdentified} image. Condition: ${result.plantCondition}. Primary Issue: ${result.primaryIssue}. Health Score: ${result.healthScore}/100. Pests: ${result.pestDetected || 'None'}. Disease: ${result.diseaseDetected || 'None'}. Please provide a prioritized regional treatment protocol.`;
    setAiPrompt(promptText);
    setAssistantSubTab('chat');
  };
  
  // Search state for crops
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [companySearchQuery, setCompanySearchQuery] = useState<string>('');

  // Search & Filter agribusinesses list
  const filteredAgribusinesses = AGRIBUSINESSES.filter(company => {
    const matchesCategory = companyFilter === 'all' || company.category === companyFilter;
    const matchesSearch = companySearchQuery === '' || 
      company.name.toLowerCase().includes(companySearchQuery.toLowerCase()) ||
      company.specialization.toLowerCase().includes(companySearchQuery.toLowerCase()) ||
      company.description.toLowerCase().includes(companySearchQuery.toLowerCase()) ||
      company.location.toLowerCase().includes(companySearchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Fetch weather forecast from Frogcast proxy endpoint on coordinate change
  const fetchWeather = async (lat: number, lon: number, name: string) => {
    setWeatherLoading(true);
    setWeatherError(null);
    try {
      const response = await fetch(`/api/weather?lat=${lat}&lon=${lon}&location=${encodeURIComponent(name)}`);
      if (!response.ok) {
        throw new Error(`Failed to load Frogcast weather feeds. Server returned status: ${response.status}`);
      }
      const data: WeatherForecastResponse = await response.json();
      setWeatherData(data);
    } catch (err: any) {
      console.error(err);
      setWeatherError(err.message || 'Error pulling weather payload.');
    } finally {
      setWeatherLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(selectedLocation.lat, selectedLocation.lon, selectedLocation.name);
  }, [selectedLocation]);



  // Handle custom coordinates form submission
  const handleCustomCoordinatesSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const latNum = parseFloat(customLat);
    const lonNum = parseFloat(customLon);
    if (!isNaN(latNum) && !isNaN(lonNum)) {
      const customLocation = {
        name: `Custom [${latNum.toFixed(3)}, ${lonNum.toFixed(3)}]`,
        lat: latNum,
        lon: lonNum
      };
      setSelectedLocation(customLocation);
    }
  };

  // Ask Abel AI diagnostic endpoint
  const askAbelAI = async (cropContext?: Crop) => {
    // Switch tab if not already on assistant
    if (!cropContext) {
      setActiveTab('assistant');
    }

    const currentPrompt = aiPrompt || (cropContext ? `Diagnostic analysis for ${cropContext.name}` : `Coordinates assessment`);
    const matchedProhibited = findProhibitedTerm(currentPrompt);
    if (matchedProhibited) {
      setAiResponse(
        swahiliPreference
          ? `⚠️ OMBI LIMEZUIWA NA SERA YA VIGEZO VILIVYOPIGWA MARUFUKU:\n\nSwali lako lina neno au maudhui yaliyopigwa marufuku: "${matchedProhibited}".\nKulingana na Kifungu cha 2.0 cha Mkataba wa Haki Zilizohifadhiwa na Vigezo Vilivyokatazwa (Reserved Rights & Prohibited Terms Charter), maombi yanayohusu utengenezaji wa sumu kali za kilimo (mfano DDT), kemikali hatarishi, madawa ya kulevya, kubomoa mifumo ya kihesabu, au uvunaji holela wa data (scraping) hayaruhusiwi kamwe.\n\nTafadhali badilisha swali lako kuelekea ushauri halisi wa kilimo au tembelea kichupo cha Mipangilio kubadili vigezo hivi.`
          : `⚠️ REQUEST BLOCKED UNDER PROHIBITED TERMS POLICY:\n\nYour query contains a flagged prohibited term: "${matchedProhibited}".\nIn accordance with Section 2.0 of the Abel Crop Intelligence Reserved Rights & Prohibited Terms Charter, requests concerning banned toxic organochlorines, illicit crop propagation, reverse engineering, or automated scraping exploits are disallowed.\n\nPlease reformulate your agricultural inquiry or modify the Prohibited Terms policy in the App Settings panel.`
      );
      return;
    }

    setAiLoading(true);
    setAiStreamingActive(true);
    setAiResponse('');
    setAiResponseTimeMs(null);
    setAiResponseCached(false);

    const clientStartTime = Date.now();
    
    try {
      const payload = {
        prompt: aiPrompt || `Give me an analysis of crops suitable for climate with coordinates: latitude ${selectedLocation.lat}, longitude ${selectedLocation.lon}.`,
        cropContext: cropContext ? {
          name: cropContext.name,
          category: cropContext.category,
          description: cropContext.description,
          requirements: cropContext.requirements,
          id: cropContext.id
        } : undefined,
        speedMode: aiSpeedMode
      };

      // Real-Time High-Speed SSE Streaming
      const response = await fetch('/api/abel/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok || !response.body) {
        // Fallback to unary endpoint if stream is unavailable
        const fallbackRes = await fetch('/api/abel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!fallbackRes.ok) {
          throw new Error(`Abel API status code exception: ${fallbackRes.status}`);
        }
        const data = await fallbackRes.json();
        const cleanAdvice = stripStarMarks(data.advice);
        setAiResponse(cleanAdvice);
        setAiResponseTimeMs(data.latencyMs || (Date.now() - clientStartTime));
        if (data.cached) setAiResponseCached(true);
        if (data.recommendedCrops) setAiCropsList(data.recommendedCrops);
        if (data.climateAnalysis) setAiSuitability(data.climateAnalysis.suitability);
        if (voiceModeActive && cleanAdvice) {
          speakText(cleanAdvice);
        }
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data:')) {
            try {
              const data = JSON.parse(trimmed.slice(5).trim());
              if (data.chunk) {
                accumulated += data.chunk;
                setAiResponse(stripStarMarks(accumulated));
              }
              if (data.done) {
                const finalClean = stripStarMarks(accumulated);
                setAiResponse(finalClean);
                setAiResponseTimeMs(data.latencyMs || (Date.now() - clientStartTime));
                if (data.cached) setAiResponseCached(true);
                if (data.recommendedCrops) setAiCropsList(data.recommendedCrops);
                if (data.climateAnalysis) setAiSuitability(data.climateAnalysis.suitability);
                if (voiceModeActive && finalClean) {
                  speakText(finalClean);
                }
              }
              if (data.error) {
                setAiResponse(`Failed to request help: ${data.error}`);
              }
            } catch (e) {}
          }
        }
      }
    } catch (err: any) {
      console.error(err);
      setAiResponse(`Failed to request help from Abel Crop Intelligence: ${err.message}`);
    } finally {
      setAiLoading(false);
      setAiStreamingActive(false);
    }
  };

  // Filter crops by category and search term
  const filteredCrops = CROPS_DATA.filter(crop => {
    const matchesCategory = selectedCategory === 'all' || crop.category === selectedCategory;
    const matchesSearch = crop.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          crop.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          crop.variants.some(v => v.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Sophisticated multi-filter search for the dedicated Search tab
  const searchTabCrops = CROPS_DATA.filter(crop => {
    const matchesSearch = searchQuery === '' || 
                          crop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          crop.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          crop.variants.some(v => v.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || crop.category === selectedCategory;

    let matchesWater = true;
    const rainStr = crop.requirements.rainfall.toLowerCase();
    const isLowRain = rainStr.includes('300') || rainStr.includes('350') || rainStr.includes('400') || rainStr.includes('500') || rainStr.includes('little') || rainStr.includes('dry');
    const isHighRain = rainStr.includes('1,500') || rainStr.includes('1200') || rainStr.includes('1500') || rainStr.includes('2,000') || rainStr.includes('1800') || rainStr.includes('standing water') || rainStr.includes('humid');
    
    if (searchWaterFilter === 'low') {
      matchesWater = isLowRain && !isHighRain;
    } else if (searchWaterFilter === 'high') {
      matchesWater = isHighRain;
    }

    let matchesHarvest = true;
    const harvStr = crop.requirements.timeToHarvest.toLowerCase();
    const isFast = harvStr.includes('1.5') || harvStr.includes('2') || harvStr.includes('3') || harvStr.includes('45') || harvStr.includes('60') || harvStr.includes('90 days') || harvStr.includes('2 -') || harvStr.includes('2.5');
    const isSlow = harvStr.includes('year') || harvStr.includes('years') || harvStr.includes('9 -') || harvStr.includes('12 months') || harvStr.includes('6 months') || harvStr.includes('9 months') || harvStr.includes('18 months') || harvStr.includes('5 -');
    
    if (searchHarvestSpeed === 'fast') {
      matchesHarvest = isFast;
    } else if (searchHarvestSpeed === 'slow') {
      matchesHarvest = isSlow;
    }

    return matchesSearch && matchesCategory && matchesWater && matchesHarvest;
  });

  const getWeatherIcon = (condition: string) => {
    const cond = condition.toLowerCase();
    if (cond.includes('rain') || cond.includes('drizzle')) {
      return <CloudRain className="w-8 h-8 text-blue-300" />;
    } else if (cond.includes('storm') || cond.includes('lightning')) {
      return <CloudLightning className="w-8 h-8 text-amber-300" />;
    } else if (cond.includes('cloud')) {
      return <Cloudy className="w-8 h-8 text-slate-300" />;
    }
    return <Sun className="w-8 h-8 text-amber-400 animate-spin-slow" />;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative" id="app_frame">
      {/* Dynamic Water Droplets Falling layer */}
      <FallingRainBackground />

      {/* Main Container */}
      <div className="w-full max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 z-20 flex-grow flex flex-col space-y-6">
        
        {/* Upper Header Block */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-blue-950/50">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-slate-900 border border-blue-800/40 rounded-2xl shadow-lg relative overflow-hidden flex items-center justify-center p-0.5">
              <img 
                src={appIcon} 
                alt="Abel Crop Intelligence Icon" 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover rounded-[14px]"
              />
              <div className="absolute inset-0 bg-blue-500/10 pointer-events-none rounded-[14px]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-mono tracking-widest bg-blue-900/45 text-blue-300 px-2.5 py-0.5 rounded-full border border-blue-800/30">
                  Farmer Workspace 
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Feed Dynamic" />
              </div>
              <h1 className="font-display font-medium text-2xl sm:text-3xl tracking-tight text-white mt-1">
                Abel Crop Intelligence
              </h1>
            </div>
          </div>

          {/* Quick info / Weather capsule at the top */}
          <div className="flex items-center gap-4 bg-slate-900/50 backdrop-blur-md rounded-2xl p-3 border border-blue-950/60 self-start md:self-center">
            <button
              type="button"
              onClick={() => setShowLocationModal(true)}
              className="flex items-center gap-2.5 group text-left cursor-pointer hover:bg-slate-800/50 p-1.5 -m-1.5 rounded-xl transition-all"
              title={swahiliPreference ? "Bofya kubadilisha eneo au kuratibu za shamba lako" : "Click to change your farm location or GPS station"}
            >
              <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 group-hover:text-blue-300 transition-colors">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <p className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Agricultural Area</p>
                  <span className="text-[9px] font-mono text-blue-400 group-hover:text-blue-300 underline underline-offset-2">Change ↗</span>
                </div>
                <p className="text-xs font-semibold text-white group-hover:text-blue-200 transition-colors max-w-[160px] truncate">{selectedLocation.name}</p>
              </div>
            </button>
            <div className="h-8 w-px bg-blue-950/80" />
            <div className="flex items-center gap-2">
              {weatherLoading ? (
                <div className="w-5 h-5 rounded-full border-2 border-blue-400/30 border-t-blue-400 animate-spin" />
              ) : weatherData && weatherData.forecast.length > 0 ? (
                <>
                  {getWeatherIcon(weatherData.forecast[0].condition)}
                  <div className="text-left">
                    <p className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Current Forecast</p>
                    <p className="text-xs font-semibold text-white">
                      {weatherData.forecast[0].tempMax}°C / {weatherData.forecast[0].condition}
                    </p>
                  </div>
                </>
              ) : (
                <span className="text-xs text-slate-400">Feeds offline</span>
              )}
            </div>
          </div>
        </header>

        {/* Tab Selection Navigation */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/40 p-2 rounded-2xl border border-blue-950/50 backdrop-blur-md">
          <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium tracking-wide transition-all cursor-pointer ${
                activeTab === 'catalog'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-950/50 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <BookOpen className="w-4 h-4" /> {swahiliPreference ? 'Katalogi ya Mazao' : 'Comprehensive Crop Catalog'}
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium tracking-wide transition-all cursor-pointer ${
                activeTab === 'search'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-950/50 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <Search className="w-4 h-4" /> {swahiliPreference ? 'Utafutaji wa Mazao' : 'Interactive Crop Search'}
            </button>
            <button
              onClick={() => setActiveTab('weather')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium tracking-wide transition-all cursor-pointer ${
                activeTab === 'weather'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-950/50 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <Droplets className="w-4 h-4" /> {swahiliPreference ? 'Hali ya Hewa (Frogcast)' : 'Frogcast Meteorological Feeds'}
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium tracking-wide transition-all cursor-pointer relative ${
                activeTab === 'tasks'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-950/50 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <CalendarClock className="w-4 h-4" /> {swahiliPreference ? 'Ratiba na Vikumbusho' : 'Task & Reminders'}
              {dueAlertsCount > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 text-[10px] font-mono font-bold bg-amber-500 text-slate-950 rounded-full animate-pulse shadow-sm">
                  {dueAlertsCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('assistant')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium tracking-wide transition-all cursor-pointer relative ${
                activeTab === 'assistant'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-950/50 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <Bot className="w-4 h-4" /> {swahiliPreference ? 'Mshauri wa AI' : 'Abel AI Advisor'}
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400" />
            </button>
            <button
              onClick={() => setActiveTab('companies')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium tracking-wide transition-all cursor-pointer ${
                activeTab === 'companies'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-950/50 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <Building2 className="w-4 h-4" /> {swahiliPreference ? 'Wauzaji Pembejeo' : 'Agribusiness Partners'}
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium tracking-wide transition-all cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-950/50 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <Settings className="w-4 h-4" /> {swahiliPreference ? 'Mipangilio' : 'App Settings'}
            </button>
          </div>

          {/* Quick search input (Hidden on Settings & Tasks pages) */}
          {activeTab !== 'settings' && activeTab !== 'tasks' && (
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder={activeTab === 'companies' ? "Search partners (e.g., Bayer, Yara)..." : "Filter crops, requirements or crop variants..."}
                value={activeTab === 'companies' ? companySearchQuery : searchQuery}
                onChange={(e) => activeTab === 'companies' ? setCompanySearchQuery(e.target.value) : setSearchQuery(e.target.value)}
                className={`w-full bg-slate-950/80 border ${
                  findProhibitedTerm(activeTab === 'companies' ? companySearchQuery : searchQuery)
                    ? 'border-red-500 focus:border-red-400 focus:ring-red-400 text-red-200'
                    : 'border-blue-950/85 focus:border-blue-600 focus:ring-blue-600 text-white'
                } rounded-xl pl-9 pr-4 py-2 text-xs placeholder-slate-500 outline-none focus:ring-1 transition-all font-sans`}
              />
              {((activeTab === 'companies' ? companySearchQuery : searchQuery)) && (
                <button 
                  onClick={() => activeTab === 'companies' ? setCompanySearchQuery('') : setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-500 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              {findProhibitedTerm(activeTab === 'companies' ? companySearchQuery : searchQuery) && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-red-950/95 border border-red-800 text-red-300 text-[10px] p-2 rounded-lg z-30 shadow-lg flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3 text-red-400 shrink-0" />
                    Filtered by Prohibited Terms Policy
                  </span>
                  <button 
                    onClick={() => { setInitialTermsTab('prohibited'); setShowTermsModal(true); }}
                    className="underline hover:text-white font-mono text-[9px] cursor-pointer"
                  >
                    Details ↗
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Dynamic Display Sections */}
        <main className="flex-grow space-y-6">
          {/* Due Planting & Watering Schedule Alerts Banner at Top of Dashboard */}
          <DueAlertsBanner
            tasks={tasks}
            onCompleteTask={handleToggleCompleteTask}
            onSnoozeTask={handleSnoozeTask}
            onOpenTasksTab={() => setActiveTab('tasks')}
            swahiliPreference={swahiliPreference}
          />

          <AnimatePresence mode="wait">
            
            {/* View 1: Crop Catalog */}
            {activeTab === 'catalog' && (
              <motion.div
                key="catalog_tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {/* Category filters */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 mr-2">Category:</span>
                  {(['all', 'cereals', 'fruits', 'vegetables'] as const).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer border ${
                        selectedCategory === cat
                          ? 'bg-blue-600/30 text-blue-300 border-blue-500/40 shadow-xs'
                          : 'bg-slate-900/60 text-slate-400 border-blue-950/40 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                  <span className="text-[10px] uppercase font-mono text-slate-500 ml-auto bg-slate-900/40 px-2 py-1 rounded">
                    Showing {filteredCrops.length} Crops
                  </span>
                </div>

                {/* Grid Catalog */}
                {filteredCrops.length === 0 ? (
                  <div className="glass-panel rounded-2xl p-12 text-center max-w-md mx-auto">
                    <Compass className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <h3 className="text-md font-semibold text-white">No Crops Match</h3>
                    <p className="text-xs text-slate-400 mt-2">
                      We couldn't locate any plants matching '{searchQuery}'. Try searching other categories like coffee or cereals.
                    </p>
                    <button 
                      onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                      className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-xs text-white rounded-lg transition-all"
                    >
                      Reset Catalog filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCrops.map((crop) => (
                      <motion.div
                        key={crop.id}
                        layout
                        className="glass-panel hover:glass-panel-active rounded-2xl overflow-hidden transition-all flex flex-col justify-between group h-[390px]"
                        style={{ contentVisibility: 'auto' }}
                      >
                        <div>
                          {/* Image box */}
                          <div className="h-44 overflow-hidden relative border-b border-blue-950/60 bg-slate-900">
                            <img
                              src={crop.image}
                              alt={crop.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                            />
                            <div className="absolute top-3 left-3">
                              <span className="text-[9px] uppercase font-mono font-bold tracking-widest bg-slate-950/90 text-blue-300 px-2.5 py-1 rounded-full border border-blue-800/40">
                                {crop.category}
                              </span>
                            </div>
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 to-slate-950/0 h-16 pointer-events-none" />
                          </div>

                          {/* Info section */}
                          <div className="p-5 space-y-2">
                            <h3 className="font-display font-medium text-lg text-white group-hover:text-blue-300 transition-colors">
                              {crop.name}
                            </h3>
                            <p className="text-slate-400 text-xs leading-relaxed line-clamp-3">
                              {crop.description}
                            </p>
                          </div>
                        </div>

                        {/* Action Drawer Launcher */}
                        <div className="p-5 pt-0">
                          <button
                            onClick={() => setSelectedCrop(crop)}
                            className="w-full flex items-center justify-center gap-2 bg-blue-950/60 hover:bg-blue-600/90 border border-blue-800/30 hover:border-blue-500 rounded-xl px-4 py-2.5 text-xs font-semibold text-blue-300 hover:text-white transition-all cursor-pointer group/btn duration-300"
                          >
                            Examine requirements & Variants 
                            <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* View: Interactive Crop Search Hub */}
            {activeTab === 'search' && (
              <motion.div
                key="search_tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {/* Search Header Banner */}
                <div className="glass-panel rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-blue-900/40 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
                  <div className="space-y-2 z-10">
                    <span className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-widest text-blue-400 bg-blue-950/80 px-3 py-1 rounded-md border border-blue-900/30">
                      Unified Directory Search
                    </span>
                    <h2 className="text-2xl font-display font-medium text-white tracking-tight">
                      Botanical Crop Search Hub
                    </h2>
                    <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
                      Filter across 100+ precision tropical crop profiles, weather adaptation traits, and variant seed configurations approved for East African microclimates.
                    </p>
                  </div>
                  <div className="bg-slate-900/80 border border-blue-950 px-4 py-3.5 rounded-xl z-10 min-w-[140px] text-center">
                    <div className="text-2xl font-mono text-blue-300 font-bold">
                      {searchTabCrops.length}
                    </div>
                    <div className="text-[10px] uppercase font-mono tracking-wider text-slate-500 mt-1">
                      Crops Available
                    </div>
                  </div>
                </div>

                {/* Unified Filter Dashboard */}
                <div className="glass-panel p-5 rounded-2xl gap-5 grid grid-cols-1 md:grid-cols-4 border border-blue-950/40">
                  
                  {/* Text keyword searches */}
                  <div className="space-y-2.5">
                    <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Search className="w-3 h-3 text-blue-400" /> Search Keywords
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Type name, alt, description..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-950/90 border border-blue-950/80 focus:border-blue-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-all"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="absolute right-3 top-3 text-slate-400 hover:text-white"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Category select tabs */}
                  <div className="space-y-2.5">
                    <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Leaf className="w-3 h-3 text-emerald-400" /> Crop Category
                    </label>
                    <div className="grid grid-cols-4 gap-1 p-1 bg-slate-950/80 rounded-xl border border-blue-950/60">
                      {(['all', 'cereals', 'fruits', 'vegetables'] as const).map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={`py-1.5 rounded-lg text-[10px] font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                            selectedCategory === cat
                              ? 'bg-blue-600/80 text-white shadow-xs'
                              : 'text-slate-400 hover:text-white hover:bg-slate-900'
                          }`}
                        >
                          {cat === 'all' ? 'All' : cat.substring(0, 3)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Water Requirements choice */}
                  <div className="space-y-2.5">
                    <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Droplets className="w-3 h-3 text-blue-300" /> Adaptation / Precipitation
                    </label>
                    <div className="grid grid-cols-3 gap-1 p-1 bg-slate-950/80 rounded-xl border border-blue-950/60">
                      {(['all', 'low', 'high'] as const).map((wt) => (
                        <button
                          key={wt}
                          onClick={() => setSearchWaterFilter(wt)}
                          className={`py-1.5 rounded-lg text-[10px] font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                            searchWaterFilter === wt
                              ? 'bg-blue-600/80 text-white shadow-xs'
                              : 'text-slate-400 hover:text-white hover:bg-slate-900'
                          }`}
                        >
                          {wt === 'all' ? 'All' : wt === 'low' ? 'Drought Tol.' : 'Rain-loving'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Harvest Cycle speed selection */}
                  <div className="space-y-2.5">
                    <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-amber-400" /> Harvesting Cycle
                    </label>
                    <div className="grid grid-cols-3 gap-1 p-1 bg-slate-950/80 rounded-xl border border-blue-950/60">
                      {(['all', 'fast', 'slow'] as const).map((sp) => (
                        <button
                          key={sp}
                          onClick={() => setSearchHarvestSpeed(sp)}
                          className={`py-1.5 rounded-lg text-[10px] font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                            searchHarvestSpeed === sp
                              ? 'bg-blue-600/80 text-white shadow-xs'
                              : 'text-slate-400 hover:text-white hover:bg-slate-900'
                          }`}
                        >
                          {sp === 'all' ? 'Any' : sp === 'fast' ? 'Fast (<90d)' : 'Slow (>180d)'}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Grid Catalog showing matches */}
                {searchTabCrops.length === 0 ? (
                  <div className="glass-panel rounded-2xl p-12 text-center max-w-md mx-auto">
                    <Compass className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <h3 className="text-md font-semibold text-white">No Index Matches</h3>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      We searched 100+ species profile listings but none matched your interactive water needs or keyword query filters.
                    </p>
                    <button 
                      onClick={() => { 
                        setSearchQuery(''); 
                        setSelectedCategory('all'); 
                        setSearchWaterFilter('all'); 
                        setSearchHarvestSpeed('all'); 
                      }}
                      className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-xs text-white rounded-lg transition-all font-semibold uppercase tracking-wider cursor-pointer"
                    >
                      Clear Search Filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {searchTabCrops.map((crop) => (
                      <motion.div
                        key={crop.id}
                        layout
                        className="glass-panel hover:glass-panel-active rounded-2xl overflow-hidden transition-all flex flex-col justify-between group h-[390px]"
                        style={{ contentVisibility: 'auto' }}
                      >
                        <div>
                          {/* Rich Premium Real Image */}
                          <div className="h-44 overflow-hidden relative border-b border-blue-950/60 bg-slate-900">
                            <img
                              src={crop.image}
                              alt={crop.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                              loading="lazy"
                            />
                            <div className="absolute top-3 left-3 flex gap-1.5">
                              <span className="text-[9px] uppercase font-mono font-bold tracking-widest bg-slate-950/90 text-blue-300 px-2.5 py-1 rounded-full border border-blue-800/40">
                                {crop.category}
                              </span>
                            </div>
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 to-slate-950/0 h-16 pointer-events-none" />
                          </div>

                          {/* Detail Profile summary */}
                          <div className="p-5 space-y-2">
                            <h3 className="font-display font-medium text-lg text-white group-hover:text-blue-300 transition-colors truncate">
                              {crop.name}
                            </h3>
                            <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">
                              {crop.description}
                            </p>
                            
                            {/* Requirements microbadges */}
                            <div className="pt-2 flex flex-wrap gap-1.5">
                              <span className="text-[10px] font-mono bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded flex items-center gap-1">
                                <Droplets className="w-2.5 h-2.5 text-blue-400" />
                                {formatRain(crop.requirements.rainfall).split(' ')[0]}
                              </span>
                              <span className="text-[10px] font-mono bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded flex items-center gap-1">
                                <Clock className="w-2.5 h-2.5 text-amber-500" />
                                {crop.requirements.timeToHarvest.split(' ')[0]} {crop.requirements.timeToHarvest.includes('month') ? 'mos' : 'days'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Expand Detailed Requirement Modal on click */}
                        <div className="p-5 pt-0">
                          <button
                            onClick={() => setSelectedCrop(crop)}
                            className="w-full flex items-center justify-center gap-2 bg-blue-950/60 hover:bg-blue-600/90 border border-blue-800/30 hover:border-blue-500 rounded-xl px-4 py-2.5 text-xs font-semibold text-blue-300 hover:text-white transition-all cursor-pointer group/btn duration-300"
                          >
                            Examine requirements & Variants 
                            <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* View 2: Weather forecasts from Frogcast */}
            {activeTab === 'weather' && (
              <motion.div
                key="weather_tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Left panel: Config and stations */}
                  <div className="glass-panel rounded-2xl p-5 space-y-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-display font-medium text-md text-white mb-1 flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-blue-400" /> {swahiliPreference ? 'Chagua Eneo la Kilimo' : 'Select Agricultural Area'}
                        </h3>
                        <p className="text-xs text-slate-400">
                          {swahiliPreference 
                            ? 'Chagua kituo cha hali ya hewa au rekebisha kuratibu za GPS ya shamba lako.' 
                            : 'Select a target Tanzanian agricultural microclimate station or set custom GPS.'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowLocationModal(true)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 shadow-md shadow-blue-950"
                        title={swahiliPreference ? "Fungua dirisha la kubadilisha eneo na GPS" : "Open full location changer and GPS tool"}
                      >
                        <Compass className="w-3.5 h-3.5" />
                        <span>{swahiliPreference ? 'Badilisha Eneo' : 'Change Location'}</span>
                      </button>
                    </div>

                    {/* Pre-installed presets selection */}
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                      {ALL_LOCATION_PRESETS.map((preset) => (
                        <button
                          key={preset.name}
                          onClick={() => setSelectedLocation(preset)}
                          className={`w-full text-left p-3 rounded-xl border transition-all text-xs flex items-center justify-between cursor-pointer ${
                            selectedLocation.name === preset.name
                              ? 'bg-blue-600/20 text-white border-blue-500/70'
                              : 'bg-slate-900/50 text-slate-400 border-blue-950 hover:bg-slate-800/20'
                          }`}
                        >
                          <div>
                            <p className="font-semibold">{preset.name}</p>
                            <p className="text-[10px] font-mono text-slate-500 mt-0.5">
                              Lat: {preset.lat.toFixed(4)} / Lon: {preset.lon.toFixed(4)}
                            </p>
                          </div>
                          {selectedLocation.name === preset.name && (
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                          )}
                        </button>
                      ))}
                    </div>

                    <div className="h-px bg-blue-950/60" />

                    {/* Coordinates input form */}
                    <form onSubmit={handleCustomCoordinatesSubmit} className="space-y-3">
                      <div>
                        <p className="text-[10px] uppercase font-mono tracking-wider text-slate-400 mb-2">Configure custom location</p>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[9px] font-mono text-slate-500 block mb-1">Latitude</label>
                            <input
                              type="text"
                              value={customLat}
                              placeholder="e.g. -1.292"
                              onChange={(e) => setCustomLat(e.target.value)}
                              className="w-full bg-slate-950 border border-blue-950 rounded-lg p-2 text-xs text-white placeholder-slate-600 outline-none focus:border-blue-800"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-mono text-slate-500 block mb-1">Longitude</label>
                            <input
                              type="text"
                              value={customLon}
                              placeholder="e.g. 36.82"
                              onChange={(e) => setCustomLon(e.target.value)}
                              className="w-full bg-slate-950 border border-blue-950 rounded-lg p-2 text-xs text-white placeholder-slate-600 outline-none focus:border-blue-800"
                            />
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={!customLat || !customLon}
                        className="w-full bg-slate-800 hover:bg-blue-600 text-xs font-semibold py-2 rounded-xl transition-all disabled:opacity-50 disabled:hover:bg-slate-800 cursor-pointer text-white"
                      >
                        Query Coordinates
                      </button>
                    </form>

                    <div className="rounded-xl bg-blue-950/20 p-3.5 border border-blue-900/20 text-[11px] text-blue-300/90 leading-relaxed">
                      <p className="font-semibold mb-1 flex items-center gap-1">
                        <Database className="w-3.5 h-3.5 text-blue-400" /> Frogcast Meteorological Token
                      </p>
                      This app queries FROGCAST forecast arrays directly using standard header authentication tokens.
                    </div>
                  </div>

                  {/* Right panel: Active forecasts and charts */}
                  <div className="lg:col-span-2 space-y-6">
                    
                    {/* Meteorological State summary card */}
                    <div className="glass-panel rounded-2xl p-6 border-l-4 border-l-blue-500">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-[9px] uppercase font-mono tracking-widest bg-blue-900/40 text-blue-300 px-2 py-0.5 rounded border border-blue-800/30">
                              Frogcast Atmospheric Feed
                            </span>
                            {weatherData?.source === 'frogcast' ? (
                              <span className="text-[9px] uppercase font-mono tracking-widest bg-emerald-950/60 text-emerald-300 px-2 py-0.5 rounded border border-emerald-900/30">
                                Realtime API Connected
                              </span>
                            ) : (
                              <span className="text-[9px] uppercase font-mono tracking-widest bg-amber-950/60 text-amber-300 px-2 py-0.5 rounded border border-amber-900/30">
                                Adaptive Meteorological Simulation
                              </span>
                            )}
                          </div>
                          <h3 className="font-display font-medium text-lg text-white">
                            Agronomy Weather for {selectedLocation.name}
                          </h3>
                        </div>

                        <button
                          onClick={() => fetchWeather(selectedLocation.lat, selectedLocation.lon, selectedLocation.name)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors text-white"
                        >
                          Refresh Feed
                        </button>
                      </div>

                      {weatherLoading ? (
                        <div className="py-24 text-center">
                          <div className="w-8 h-8 rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin mx-auto mb-3" />
                          <p className="text-xs text-slate-400 font-mono">Syncing meteorology charts...</p>
                        </div>
                      ) : weatherError ? (
                        <div className="py-12 text-center bg-red-950/20 rounded-xl border border-red-900/30 my-4 p-4">
                          <p className="text-xs text-red-300">
                            <strong>API Request Halt:</strong> {weatherError}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-2">
                            The Frogcast weather API is secured under standard rate limits. Running fallbacks.
                          </p>
                        </div>
                      ) : weatherData ? (
                        <div className="mt-6 space-y-6">
                          
                          {/* 5-day columns */}
                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                            {weatherData.forecast.slice(0, 5).map((day, idx) => (
                              <div
                                key={idx}
                                className={`p-3.5 rounded-xl text-center border flex flex-col justify-between h-[160px] ${
                                  idx === 0 
                                    ? 'bg-blue-600/10 border-blue-500/30 shadow-md shadow-blue-950/20' 
                                    : 'bg-slate-900/40 border-blue-950'
                                }`}
                              >
                                <div>
                                  <p className="text-[10px] font-mono text-slate-500">{day.date}</p>
                                  <div className="my-2.5 flex justify-center">{getWeatherIcon(day.condition)}</div>
                                  <p className="text-xs font-bold text-white mt-1">{day.tempMax}°C</p>
                                  <p className="text-[10px] text-slate-400">{day.condition}</p>
                                </div>

                                <div className="mt-2.5 pt-1.5 border-t border-slate-800">
                                  <p className="text-[9px] font-mono text-blue-300">☔ {day.rainfall}mm</p>
                                  <span className="text-[9px] font-mono text-amber-300 block">☀️ {day.sunshineHours}h</span>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Graphical Trends */}
                          <div className="bg-slate-900/30 rounded-xl p-5 border border-blue-950/50">
                            <h4 className="text-xs font-mono tracking-wider font-semibold text-blue-400 uppercase mb-4 flex items-center gap-1.5">
                              <Thermometer className="w-3.5 h-3.5" /> 5-Day Temperature Curve (°C)
                            </h4>
                            
                            {/* Graphic SVG Plot */}
                            <div className="h-44 w-full relative">
                              <svg className="w-full h-full" viewBox="0 0 500 120" preserveAspectRatio="none">
                                <defs>
                                  <linearGradient id="weather-glow" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
                                    <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                                  </linearGradient>
                                </defs>
                                {/* Grid lines */}
                                <line x1="0" y1="20" x2="500" y2="20" stroke="rgba(30, 41, 59, 0.4)" strokeWidth="1" strokeDasharray="3" />
                                <line x1="0" y1="60" x2="500" y2="60" stroke="rgba(30, 41, 59, 0.4)" strokeWidth="1" strokeDasharray="3" />
                                <line x1="0" y1="100" x2="500" y2="100" stroke="rgba(30, 41, 59, 0.4)" strokeWidth="1" strokeDasharray="3" />

                                {/* Trend Area Fill */}
                                <path
                                  d={`M 10 90 
                                      L 125 ${110 - (weatherData.forecast[0]?.tempMax || 24) * 2.5} 
                                      L 250 ${110 - (weatherData.forecast[1]?.tempMax || 25) * 2.5} 
                                      L 375 ${110 - (weatherData.forecast[2]?.tempMax || 23) * 2.5} 
                                      L 490 ${110 - (weatherData.forecast[3]?.tempMax || 26) * 2.5} 
                                      L 490 120 L 10 120 Z`}
                                  fill="url(#weather-glow)"
                                />

                                {/* Line path */}
                                <path
                                  d={`M 10 ${110 - (weatherData.forecast[0]?.tempMax || 24) * 2.5} 
                                      L 125 ${110 - (weatherData.forecast[0]?.tempMax || 24) * 2.5} 
                                      L 250 ${110 - (weatherData.forecast[1]?.tempMax || 25) * 2.5} 
                                      L 375 ${110 - (weatherData.forecast[2]?.tempMax || 23) * 2.5} 
                                      L 490 ${110 - (weatherData.forecast[3]?.tempMax || 26) * 2.5}`}
                                  fill="none"
                                  stroke="#3b82f6"
                                  strokeWidth="2.5"
                                  strokeLinecap="round"
                                />

                                {/* Min temp line */}
                                <path
                                  d={`M 10 ${120 - (weatherData.forecast[0]?.tempMin || 14) * 2.5} 
                                      L 125 ${120 - (weatherData.forecast[0]?.tempMin || 14) * 2.5} 
                                      L 250 ${120 - (weatherData.forecast[1]?.tempMin || 15) * 2.5} 
                                      L 375 ${120 - (weatherData.forecast[2]?.tempMin || 13) * 2.5} 
                                      L 490 ${120 - (weatherData.forecast[3]?.tempMin || 16) * 2.5}`}
                                  fill="none"
                                  stroke="#60a5fa"
                                  strokeOpacity="0.5"
                                  strokeWidth="1.5"
                                  strokeDasharray="4"
                                />

                                {/* Labels & points */}
                                {weatherData.forecast.slice(0, 5).map((day, idx) => {
                                  const xPos = 10 + idx * 120;
                                  return (
                                    <g key={idx}>
                                      <circle cx={xPos} cy={110 - day.tempMax * 2.5} r="4" fill="#60a5fa" />
                                      <text x={xPos} y={100 - day.tempMax * 2.5} fill="#fff" fontSize="9" textAnchor="middle" fontFamily="monospace">
                                        {day.tempMax}°
                                      </text>
                                    </g>
                                  );
                                })}
                              </svg>
                            </div>
                            <div className="flex justify-between px-2.5 text-[9px] font-mono text-slate-500 mt-2">
                              <span>Today ({weatherData.forecast[0]?.date})</span>
                              <span>{weatherData.forecast[1]?.date}</span>
                              <span>{weatherData.forecast[2]?.date}</span>
                              <span>{weatherData.forecast[3]?.date}</span>
                              <span>{weatherData.forecast[4]?.date}</span>
                            </div>
                          </div>

                        </div>
                      ) : null}
                    </div>

                  </div>

                </div>
              </motion.div>
            )}

            {/* View: Tasks & Schedule Reminders */}
            {activeTab === 'tasks' && (
              <motion.div
                key="tasks_tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <TasksTab
                  tasks={tasks}
                  onAddTask={handleAddTask}
                  onToggleComplete={handleToggleCompleteTask}
                  onDeleteTask={handleDeleteTask}
                  onSnoozeTask={handleSnoozeTask}
                  swahiliPreference={swahiliPreference}
                />
              </motion.div>
            )}

            {/* View 3: AI Assistant */}
            {activeTab === 'assistant' && (
              <motion.div
                key="assistant_tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="max-w-4xl mx-auto space-y-6"
              >
                {/* Header card with Sub-Tab Selector & Speed Controls */}
                <div className="glass-panel rounded-2xl p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full filter blur-3xl pointer-events-none" />

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex gap-4 items-start">
                      <div className="p-3.5 bg-blue-600/10 border border-blue-500/20 rounded-2xl">
                        <Bot className="w-7 h-7 text-blue-400 stroke-2" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[9px] uppercase font-mono tracking-widest bg-blue-900/40 text-blue-300 px-2.5 py-1 rounded-md border border-blue-800/30">
                            Interactive Agent
                          </span>
                          <span className="text-[9px] uppercase font-mono tracking-widest bg-amber-950/60 text-amber-300 px-2.5 py-1 rounded-md border border-amber-800/30 flex items-center gap-1">
                            <Zap className="w-3 h-3 text-amber-400" />
                            {aiSpeedMode === 'ultra_fast' ? 'Ultra-Fast Mode (~0.25s)' : 'Balanced Mode Active'}
                          </span>
                        </div>
                        <h3 className="font-display font-medium text-lg text-white mt-1">
                          Abel AI Agricultural Diagnostic Agent
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">
                          {swahiliPreference 
                            ? 'Ushauri wa haraka wa kilimo kwa kutumia Gemini 3.1 Flash-Lite, uchunguzi wa sauti, na skana ya picha za magonjwa ya mazao.'
                            : 'Query Abel AI with voice chat, ultra-fast streaming responses, and multimodal photo diagnosis for plant diseases & pests.'}
                        </p>
                      </div>
                    </div>

                    {/* Speed Engine Selector Pills */}
                    <div className="flex bg-slate-950/80 border border-blue-950/60 rounded-xl p-1 shrink-0 self-start md:self-center">
                      <button
                        type="button"
                        onClick={() => setAiSpeedMode('ultra_fast')}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
                          aiSpeedMode === 'ultra_fast'
                            ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                            : 'text-slate-400 hover:text-white'
                        }`}
                        title="Sub-second streaming latency with gemini-3.1-flash-lite"
                      >
                        <Zap className="w-3 h-3" />
                        {swahiliPreference ? 'Haraka Sana' : 'Ultra-Fast (~0.25s)'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setAiSpeedMode('balanced')}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
                          aiSpeedMode === 'balanced'
                            ? 'bg-blue-600 text-white font-bold shadow-md'
                            : 'text-slate-400 hover:text-white'
                        }`}
                        title="Standard multi-factor model with gemini-3.8-flash"
                      >
                        <Gauge className="w-3 h-3" />
                        {swahiliPreference ? 'Wastani' : 'Balanced'}
                      </button>
                    </div>
                  </div>

                  {/* Mode Navigation Tabs: Agronomic Chat vs Photo Vision Scanner */}
                  <div className="mt-5 pt-4 border-t border-blue-950/60 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex bg-slate-950 p-1 rounded-xl border border-blue-950/80">
                      <button
                        type="button"
                        onClick={() => setAssistantSubTab('chat')}
                        className={`px-4 py-2 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                          assistantSubTab === 'chat'
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <Bot className="w-3.5 h-3.5 text-blue-300" />
                        <span>{swahiliPreference ? 'Ushauri wa Kilimo & Sauti' : 'Agronomic Chat & Voice'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setAssistantSubTab('vision')}
                        className={`px-4 py-2 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                          assistantSubTab === 'vision'
                            ? 'bg-emerald-600 text-white shadow-md'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <Camera className="w-3.5 h-3.5 text-emerald-300" />
                        <span>{swahiliPreference ? 'Skana ya Picha za Magonjwa' : 'Crop Photo & Disease Scanner'}</span>
                        <span className="text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-700/50 px-1.5 py-0.2 rounded font-mono">
                          API
                        </span>
                      </button>
                    </div>

                    {/* Voice Mode Toggle (Only in chat sub-tab) */}
                    {assistantSubTab === 'chat' && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (voiceModeActive && isSpeaking) stopSpeaking();
                            setVoiceModeActive(!voiceModeActive);
                          }}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
                            voiceModeActive 
                              ? 'bg-emerald-950/80 border-emerald-600/80 text-emerald-300 shadow-md'
                              : 'bg-slate-900 border-blue-950 text-slate-400 hover:text-white'
                          }`}
                          title="Read out Abel AI answers automatically"
                        >
                          <Volume2 className={`w-3.5 h-3.5 ${voiceModeActive ? 'text-emerald-400 animate-pulse' : 'text-slate-400'}`} />
                          <span>{swahiliPreference ? 'Majibu ya Sauti:' : 'Voice Output:'}</span>
                          <span className={`text-[10px] font-bold ${voiceModeActive ? 'text-emerald-300' : 'text-slate-500'}`}>
                            {voiceModeActive ? 'ON' : 'OFF'}
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* SUB-VIEW 1: AGRONOMIC CHAT & VOICE (TEXTAREA ALWAYS BELOW THE DIV COMPONENT) */}
                {assistantSubTab === 'chat' && (
                  <div className="space-y-6">
                    {/* 1. THE DIV COMPONENT: AI Diagnostic Report & Response Terminal (ALWAYS ABOVE TEXTAREA) */}
                    <div className="glass-panel p-6 rounded-2xl space-y-4 border-l-4 border-l-emerald-500 shadow-xl transition-all">
                      <div className="flex items-center justify-between border-b border-blue-950 pb-3 flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-medium tracking-wide text-blue-400 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                            {aiResponse || aiLoading 
                              ? (swahiliPreference ? 'Ripoti ya Uchunguzi wa Abel AI' : 'Abel Crop Intelligence API Diagnostic Report')
                              : (swahiliPreference ? 'Kituo cha Ushauri wa Kilimo cha Abel AI' : 'Abel AI Agronomic Diagnostic Console')}
                          </span>
                          {aiResponseTimeMs !== null && (aiResponse || aiLoading) && (
                            <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/80 border border-emerald-800/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Zap className="w-2.5 h-2.5 text-amber-400" />
                              {aiResponseCached ? 'Cache Hit' : `${(aiResponseTimeMs / 1000).toFixed(2)}s`}
                              {aiResponseCached && ` (${aiResponseTimeMs}ms)`}
                            </span>
                          )}
                          {!aiResponse && !aiLoading && (
                            <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/80 border border-emerald-800/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              {swahiliPreference ? 'Tayari Kutoa Ushauri' : 'Ready & Connected'}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Audio Speak / Listen Button */}
                          {aiResponse && (
                            <button
                              type="button"
                              onClick={() => {
                                if (isSpeaking) {
                                  stopSpeaking();
                                } else {
                                  speakText(aiResponse);
                                }
                              }}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
                                isSpeaking 
                                  ? 'bg-red-950 border border-red-700 text-red-300 animate-pulse'
                                  : 'bg-blue-950 hover:bg-blue-900 border border-blue-800/50 text-blue-300'
                              }`}
                              title="Listen to Abel AI's diagnosis aloud via speech synthesis"
                            >
                              {isSpeaking ? (
                                <>
                                  <Square className="w-3 h-3 text-red-400" />
                                  <span>{swahiliPreference ? 'Acha Sauti' : 'Stop Audio'}</span>
                                </>
                              ) : (
                                <>
                                  <Volume2 className="w-3 h-3 text-emerald-400" />
                                  <span>{swahiliPreference ? 'Sikiliza Sauti' : 'Listen Aloud'}</span>
                                </>
                              )}
                            </button>
                          )}

                          {aiStreamingActive && (
                            <span className="text-[10px] font-mono text-amber-300 bg-amber-950/80 border border-amber-800/50 px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                              Live SSE Stream
                            </span>
                          )}
                          {aiSuitability && (
                            <span className="text-[10px] font-mono uppercase bg-emerald-900/45 text-emerald-300 border border-emerald-800/45 px-2 py-0.5 rounded">
                              Suitability: {aiSuitability}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Content of the DIV Component */}
                      {aiLoading && !aiResponse ? (
                        <div className="py-10 text-center space-y-2">
                          <div className="w-6 h-6 rounded-full border-2 border-emerald-500/20 border-t-emerald-400 animate-spin mx-auto" />
                          <p className="text-xs text-slate-400 font-mono">
                            {swahiliPreference ? 'Mfumo wa Abel AI (Flash-Lite) unaandaa data ya haraka...' : 'Gemini 3.1 Flash-Lite generating agronomic solution...'}
                          </p>
                        </div>
                      ) : aiResponse ? (
                        <div className="space-y-4 animate-fade-in text-xs text-slate-200 leading-relaxed font-sans prose prose-invert max-w-none">
                          <div className="whitespace-pre-line leading-relaxed">
                            {stripStarMarks(aiResponse)}
                            {aiStreamingActive && (
                              <span className="inline-block w-2 h-3.5 bg-emerald-400 animate-pulse ml-0.5 align-middle" />
                            )}
                          </div>
                          
                          {aiCropsList.length > 0 && (
                            <div className="mt-4 pt-3 border-t border-blue-950 flex items-center gap-2.5 flex-wrap">
                              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Linked Catalog Items:</span>
                              {aiCropsList.map((c) => (
                                <button
                                  key={c}
                                  onClick={() => {
                                    const cItem = CROPS_DATA.find(cr => cr.id === c);
                                    if (cItem) {
                                      setSelectedCrop(cItem);
                                      setActiveTab('catalog');
                                    }
                                  }}
                                  className="text-[10px] bg-blue-950 hover:bg-blue-600/40 text-blue-300 border border-blue-900/40 px-2.5 py-1 rounded-lg transition-colors cursor-pointer capitalize font-mono"
                                >
                                  {c}
                                </button>
                              ))}
                            </div>
                          )}
                          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mt-2 pt-2 border-t border-blue-950/40">
                            <span className="flex items-center gap-1">
                              <Zap className="w-3 h-3 text-amber-400" />
                              {aiSpeedMode === 'ultra_fast' ? 'Gemini 3.1 Flash-Lite Engine' : 'Gemini 3.8 Flash Engine'}
                            </span>
                            <span className="italic">
                              Abel Crop Intelligence API Signed Release
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="py-3 space-y-3">
                          <p className="text-xs text-slate-300 leading-relaxed">
                            {swahiliPreference
                              ? 'Mfumo wa Abel AI wa kilimo uko tayari. Andika swali lako lolote kuhusu mbegu bora, udongo, mahitaji ya mbolea au ratiba ya umwagiliaji kwenye sehemu ya maandishi hapa chini, au chagua mfano wa haraka.'
                              : 'Abel AI agronomic engine is active and ready. Enter your questions about varieties, soil requirements, fertilizer rates, or irrigation in the text area below, or choose an instant prompt.'}
                          </p>

                          <div className="p-3 bg-slate-950/60 rounded-xl border border-blue-950/70 flex items-center justify-between gap-3 text-slate-400 text-xs flex-wrap">
                            <span className="flex items-center gap-2">
                              <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              <span className="text-[11px] font-mono">
                                {aiSpeedMode === 'ultra_fast' 
                                  ? (swahiliPreference ? 'Hali ya Haraka Sana (~0.25s TTFT streaming)' : 'Ultra-Fast Mode (~0.25s TTFT streaming with Gemini 3.1 Flash-Lite)') 
                                  : (swahiliPreference ? 'Hali ya Kawaida (Gemini 3.8 Flash)' : 'Balanced Mode (Comprehensive reasoning with Gemini 3.8 Flash)')}
                              </span>
                            </span>
                            <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                              <Database className="w-3 h-3 text-slate-500" />
                              <span>Station: <strong className="text-slate-300">{selectedLocation.name}</strong></span>
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 2. THE TEXTAREA INPUT COMPONENT: ALWAYS BELOW THE DIV COMPONENT */}
                    <div className="glass-panel p-6 rounded-2xl space-y-4 border border-blue-950/70 shadow-xl transition-all">
                      <div className="flex flex-col space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                            <span>{swahiliPreference ? 'Uliza Swali kwa Abel AI (Andika au Ongea kwa Sauti)' : 'Ask Abel AI a question (Type or use Voice)'}</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => { setInitialTermsTab('prohibited'); setShowTermsModal(true); }}
                            className="text-[10px] font-mono text-slate-500 hover:text-blue-400 transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <ShieldAlert className="w-3 h-3 text-slate-500" />
                            {swahiliPreference ? 'Sera ya Vigezo Vilivyokatazwa' : 'Prohibited Terms Policy'}
                          </button>
                        </div>

                        {/* Textarea + Voice Microphone Control */}
                        <div className="relative">
                          <textarea
                            placeholder="e.g. Which of the coffee variants (Arabica, Robusta, Liberica) works best in high acid hillside loose loam with 1500mm rain?"
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                            rows={3}
                            className={`w-full bg-slate-950 border ${
                              findProhibitedTerm(aiPrompt) 
                                ? 'border-red-600 focus:border-red-500 focus:ring-red-500' 
                                : 'border-blue-950 focus:border-blue-700 focus:ring-blue-700'
                            } p-4 pr-14 rounded-xl text-xs text-white placeholder-slate-600 outline-none focus:ring-1 transition-all font-sans resize-none`}
                          />

                          {/* Voice Dictation Button inside Textarea */}
                          <div className="absolute right-3 bottom-3 flex items-center gap-2">
                            <button
                              type="button"
                              onClick={toggleSpeechRecognition}
                              className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                                isListening 
                                  ? 'bg-red-600 border-red-500 text-white animate-pulse shadow-lg shadow-red-600/30 ring-2 ring-red-400'
                                  : 'bg-slate-900 border-blue-900/60 text-slate-400 hover:text-blue-300 hover:bg-blue-950/60'
                              }`}
                              title={isListening ? 'Click to stop listening' : 'Click to speak question via voice (Speech-to-Text)'}
                            >
                              {isListening ? (
                                <AudioLines className="w-4 h-4 text-white animate-bounce" />
                              ) : (
                                <Mic className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Live Voice Status Indicator */}
                        {isListening && (
                          <div className="p-2.5 bg-red-950/40 border border-red-900/60 rounded-xl flex items-center gap-2 text-red-300 text-xs animate-fade-in">
                            <span className="w-2 h-2 rounded-full bg-red-400 animate-ping shrink-0" />
                            <span className="font-mono text-[11px] font-semibold">
                              {voiceStatusText || (swahiliPreference ? 'Inasikiliza sauti yako... Ongea swali lako sasa' : 'Listening to your voice... Speak your agricultural question clearly')}
                            </span>
                          </div>
                        )}

                        {/* Quick Prompt Suggestions */}
                        <div className="flex items-center gap-1.5 flex-wrap pt-1">
                          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">
                            {swahiliPreference ? 'Mifano ya Haraka:' : 'Instant Prompts:'}
                          </span>
                          {[
                            { en: '🌽 Optimal maize fertilizer for Southern Highlands', sw: '🌽 Mbolea bora ya mahindi Nyanda za Juu Kusini' },
                            { en: '☕ Drought-hardy Arabica coffee variants', sw: '☕ Aina ya kahawa inayostahimili ukame' },
                            { en: '🍅 Tomato leaf blight remedy', sw: '🍅 Dawa ya ukungu kwenye nyanya' },
                            { en: '💧 Sandy soil irrigation cycles', sw: '💧 Ratiba ya kumwagilia udongo wa mchanga' }
                          ].map((promptItem, pIdx) => (
                            <button
                              key={pIdx}
                              type="button"
                              onClick={() => {
                                const text = swahiliPreference ? promptItem.sw : promptItem.en;
                                setAiPrompt(text);
                              }}
                              className="text-[10px] bg-slate-900 hover:bg-blue-950 text-slate-400 hover:text-blue-300 border border-blue-950/80 px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
                            >
                              {swahiliPreference ? promptItem.sw : promptItem.en}
                            </button>
                          ))}
                        </div>

                        {/* Live Prohibited Term Alert */}
                        {findProhibitedTerm(aiPrompt) && (
                          <div className="p-3 bg-red-950/40 border border-red-900/60 rounded-xl flex items-center justify-between gap-3 text-red-300 text-xs animate-fade-in">
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                              <span>
                                {swahiliPreference 
                                  ? `Neno lililopigwa marufuku: "${findProhibitedTerm(aiPrompt)}". Maombi ya sumu au uvunaji data yamezuiwa.` 
                                  : `Prohibited term detected: "${findProhibitedTerm(aiPrompt)}". Queries involving banned toxics or scraping exploits are restricted.`}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => { setInitialTermsTab('prohibited'); setShowTermsModal(true); }}
                              className="text-[10px] font-mono uppercase bg-red-950 border border-red-800 text-red-300 px-2 py-1 rounded hover:bg-red-900/50 cursor-pointer shrink-0"
                            >
                              {swahiliPreference ? 'Soma Sera' : 'Review Charter'}
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-4 flex-wrap text-xs pt-1 border-t border-blue-950/60">
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Database className="w-3.5 h-3.5 text-slate-500" />
                          <span>Active Station : <strong className="text-white">{selectedLocation.name}</strong></span>
                        </div>
                        <button
                          onClick={() => askAbelAI()}
                          disabled={aiLoading || !aiPrompt.trim()}
                          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-blue-950/50"
                        >
                          {aiLoading ? (
                            <>
                              <Zap className="w-4 h-4 animate-pulse text-amber-300" /> 
                              {aiStreamingActive ? (swahiliPreference ? 'Inatiririsha Majibu...' : 'Streaming Response...') : (swahiliPreference ? 'Inachakata...' : 'Synthesizing...')}
                            </>
                          ) : (
                            <>
                              <Zap className="w-3.5 h-3.5 text-amber-300" /> 
                              {swahiliPreference ? 'Uliza Haraka (Flash-Lite)' : 'Request Fast AI Diagnostics'}
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* SUB-VIEW 2: CROP PHOTO UPLOAD & DISEASE SCANNER */}
                {assistantSubTab === 'vision' && (
                  <div className="glass-panel rounded-2xl p-6 relative overflow-hidden space-y-5 animate-fade-in">
                    <div className="mt-5 space-y-5 animate-fade-in">
                      <div className="p-4 bg-emerald-950/20 border border-emerald-900/40 rounded-xl space-y-2">
                        <div className="flex items-center gap-2">
                          <Stethoscope className="w-4 h-4 text-emerald-400" />
                          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-300">
                            {swahiliPreference ? 'Uchunguzi wa Picha za Mazao, Wadudu na Magonjwa (Vision API)' : 'Multimodal Crop Vision & Pathology Diagnostic API'}
                          </h4>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          {swahiliPreference 
                            ? 'Pakia picha ya zao lako lililoathirika au chagua picha ya mfano. Abel AI inatathmini hali ya afya, inatambua wadudu waharibifu (mfano Funza wa Jeshi), magonjwa ya ukungu au virusi, na kutoa hatua za matibabu.'
                            : 'Upload or capture a leaf, stem, or fruit photo. Abel AI analyzes cellular condition, diagnoses pests & pathogen infections, and computes an agronomic health score.'}
                        </p>
                      </div>

                      {/* 1-Click Preset Samples for Instant Testing */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center justify-between">
                          <span>{swahiliPreference ? 'Picha za Mfano wa Uchunguzi wa Haraka (Gusa Kupima):' : 'Instant Preset Samples (Click to test diagnostic engine):'}</span>
                          <span className="text-[9px] text-blue-400 font-mono">1-Click Test</span>
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                          {SAMPLE_DISEASE_PHOTOS.map((sample, sIdx) => (
                            <button
                              key={sIdx}
                              type="button"
                              onClick={() => handleSelectSamplePhoto(sample)}
                              className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1.5 group ${
                                uploadedImage === sample.image 
                                  ? 'bg-emerald-950/60 border-emerald-500 shadow-md ring-1 ring-emerald-500'
                                  : 'bg-slate-900/80 border-blue-950 hover:border-blue-800'
                              }`}
                            >
                              <div className="w-full h-16 rounded-lg overflow-hidden bg-slate-950 border border-slate-800">
                                <img
                                  src={sample.image}
                                  alt={sample.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              </div>
                              <div>
                                <p className="text-[11px] font-semibold text-white truncate">
                                  {swahiliPreference ? sample.titleSw : sample.title}
                                </p>
                                <p className="text-[9px] font-mono text-slate-400 truncate">
                                  {sample.hint}
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Image Upload Dropzone / Preview Area */}
                      <div className="space-y-3">
                        <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                          {swahiliPreference ? 'Picha Yako ya Zao (Upload au Kamera):' : 'Custom Crop Photo (Upload or Camera):'}
                        </label>

                        {!uploadedImage ? (
                          <label className="border-2 border-dashed border-blue-950 hover:border-emerald-600/70 bg-slate-950/60 hover:bg-slate-900/50 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all text-center group">
                            <input
                              type="file"
                              accept="image/*"
                              capture="environment"
                              onChange={handleImageFileChange}
                              className="hidden"
                            />
                            <div className="p-3 bg-blue-900/20 group-hover:bg-emerald-900/30 rounded-2xl border border-blue-800/40 text-blue-400 group-hover:text-emerald-400 transition-colors">
                              <UploadCloud className="w-6 h-6" />
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-white">
                                {swahiliPreference ? 'Bofya kupakia picha au kupiga kwa kamera' : 'Click to browse files or capture with camera'}
                              </p>
                              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                                JPG, PNG, WEBP (Direct leaf / stem close-ups work best)
                              </p>
                            </div>
                          </label>
                        ) : (
                          <div className="p-4 bg-slate-950 rounded-2xl border border-blue-950/80 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                            <div className="flex items-center gap-3.5">
                              <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-blue-900/40 bg-slate-900">
                                <img
                                  src={uploadedImage}
                                  alt="Crop preview"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800/40 px-2 py-0.5 rounded">
                                    Ready to Analyze
                                  </span>
                                </div>
                                <h4 className="text-xs font-semibold text-white mt-1 font-display">
                                  {uploadedImageName || 'Selected Crop Photograph'}
                                </h4>
                                <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                                  Target: {selectedCropHint}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={clearUploadedImage}
                                className="px-3 py-1.5 rounded-lg border border-red-950 bg-red-950/30 hover:bg-red-950/60 text-red-300 text-xs font-mono transition-colors cursor-pointer flex items-center gap-1.5"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                {swahiliPreference ? 'Ondoa' : 'Remove'}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Optional Context Inputs */}
                      {uploadedImage && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                              {swahiliPreference ? 'Aina ya Zao (Crop Context):' : 'Crop Type Hint:'}
                            </label>
                            <input
                              type="text"
                              value={selectedCropHint}
                              onChange={(e) => setSelectedCropHint(e.target.value)}
                              placeholder="e.g. Maize, Tomato, Arabica Coffee, Rice"
                              className="w-full bg-slate-950 border border-blue-950 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 outline-none focus:border-blue-700"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                              {swahiliPreference ? 'Uchunguzi wa Mkulima (Notes):' : 'Field Observations / Notes:'}
                            </label>
                            <input
                              type="text"
                              value={imageNotes}
                              onChange={(e) => setImageNotes(e.target.value)}
                              placeholder="e.g. White caterpillars noticed in whorl after rains"
                              className="w-full bg-slate-950 border border-blue-950 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 outline-none focus:border-blue-700"
                            />
                          </div>
                        </div>
                      )}

                      {/* Run Diagnostic Button */}
                      {uploadedImage && (
                        <div className="pt-2 flex justify-end">
                          <button
                            type="button"
                            onClick={analyzeCropImage}
                            disabled={imageAnalyzing}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-semibold text-xs font-mono uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-emerald-950/50 flex items-center gap-2"
                          >
                            {imageAnalyzing ? (
                              <>
                                <RefreshCw className="w-4 h-4 animate-spin text-emerald-300" />
                                {swahiliPreference ? 'Inachambua Picha & Wadudu...' : 'Analyzing Plant Pathology & Pests...'}
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-4 h-4 text-emerald-300" />
                                {swahiliPreference ? 'Fanya Uchunguzi wa Picha (Pathology API)' : 'Run Crop Image Analysis API'}
                              </>
                            )}
                          </button>
                        </div>
                      )}

                      {/* Error Alert */}
                      {imageAnalysisError && (
                        <div className="p-3 bg-red-950/40 border border-red-900/60 rounded-xl text-red-300 text-xs flex items-center gap-2 animate-fade-in">
                          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                          <span>{imageAnalysisError}</span>
                        </div>
                      )}

                      {/* Vision Analysis Results Presentation */}
                      {imageAnalysisResult && (
                        <div className="mt-6 p-5 bg-slate-950/90 border border-emerald-900/50 rounded-2xl space-y-5 animate-fade-in">
                          {/* Result Header & Score Gauge */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-blue-950/70">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono uppercase tracking-wider bg-emerald-950 text-emerald-300 border border-emerald-800/40 px-2 py-0.5 rounded">
                                  Diagnostic Verified
                                </span>
                                <span className="text-[10px] font-mono text-slate-400">
                                  Confidence: {imageAnalysisResult.confidence}%
                                </span>
                              </div>
                              <h3 className="font-display font-medium text-lg text-white mt-1">
                                {imageAnalysisResult.plantIdentified}
                              </h3>
                              <p className="text-xs text-slate-400 mt-0.5">
                                Condition: <strong className="text-slate-200">{imageAnalysisResult.plantCondition}</strong>
                              </p>
                            </div>

                            {/* Health Meter & Severity Badge */}
                            <div className="flex items-center gap-4 bg-slate-900/90 border border-blue-950 p-3 rounded-xl shrink-0">
                              <div className="text-center">
                                <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 block">Health Score</span>
                                <span className={`text-xl font-mono font-bold ${
                                  imageAnalysisResult.healthScore >= 80 ? 'text-emerald-400' :
                                  imageAnalysisResult.healthScore >= 50 ? 'text-amber-400' : 'text-rose-400'
                                }`}>
                                  {imageAnalysisResult.healthScore}<span className="text-xs text-slate-500">/100</span>
                                </span>
                              </div>

                              <div className="w-px h-8 bg-blue-950" />

                              <div>
                                <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 block">Severity</span>
                                <span className={`text-xs font-mono font-semibold px-2 py-0.5 rounded ${
                                  imageAnalysisResult.severity === 'Healthy' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/40' :
                                  imageAnalysisResult.severity === 'Low Risk' ? 'bg-blue-950 text-blue-300 border border-blue-800/40' :
                                  imageAnalysisResult.severity === 'Moderate' ? 'bg-amber-950 text-amber-300 border border-amber-800/40' :
                                  'bg-rose-950 text-rose-300 border border-rose-800/40'
                                }`}>
                                  {imageAnalysisResult.severity}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Pests & Diseases Detection Summary */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            {/* Pests Card */}
                            <div className="p-3.5 bg-slate-900/80 border border-blue-950 rounded-xl space-y-1">
                              <div className="flex items-center gap-1.5 text-amber-400 font-mono text-[10px] uppercase tracking-wider">
                                <Bug className="w-3.5 h-3.5" />
                                <span>Pest Vector Detected</span>
                              </div>
                              <p className="font-semibold text-white">
                                {imageAnalysisResult.pestDetected || 'None detected'}
                              </p>
                            </div>

                            {/* Disease Pathogen Card */}
                            <div className="p-3.5 bg-slate-900/80 border border-blue-950 rounded-xl space-y-1">
                              <div className="flex items-center gap-1.5 text-rose-400 font-mono text-[10px] uppercase tracking-wider">
                                <Stethoscope className="w-3.5 h-3.5" />
                                <span>Pathogen / Disease Detected</span>
                              </div>
                              <p className="font-semibold text-white">
                                {imageAnalysisResult.diseaseDetected || 'None detected'}
                              </p>
                            </div>
                          </div>

                          {/* Technical Pathology Diagnosis Report (Zero Asterisks) */}
                          <div className="space-y-2">
                            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Technical Agronomic Diagnosis Report
                            </h4>
                            <div className="p-4 bg-slate-900/60 border border-blue-950/70 rounded-xl text-xs text-slate-300 leading-relaxed font-sans">
                              {stripStarMarks(imageAnalysisResult.diagnosisReport)}
                            </div>
                          </div>

                          {/* Treatment Steps Action Checklist */}
                          {imageAnalysisResult.treatmentSteps && imageAnalysisResult.treatmentSteps.length > 0 && (
                            <div className="space-y-2">
                              <h4 className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Actionable Treatment Protocol (Tanzania Field-Approved)
                              </h4>
                              <div className="space-y-2">
                                {imageAnalysisResult.treatmentSteps.map((step, idx) => (
                                  <div key={idx} className="p-3 bg-slate-900/80 border border-blue-950 rounded-xl flex items-start gap-2.5 text-xs text-slate-200">
                                    <span className="font-mono text-emerald-400 font-bold shrink-0">{idx + 1}.</span>
                                    <span>{stripStarMarks(step)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Preventative Agronomic Advice */}
                          {imageAnalysisResult.preventativeAdvice && imageAnalysisResult.preventativeAdvice.length > 0 && (
                            <div className="space-y-2">
                              <h4 className="text-xs font-mono uppercase tracking-wider text-blue-400 font-semibold flex items-center gap-1.5">
                                <Leaf className="w-3.5 h-3.5" /> Preventative Cultural Practices
                              </h4>
                              <div className="space-y-1.5">
                                {imageAnalysisResult.preventativeAdvice.map((advice, idx) => (
                                  <div key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                                    <span className="text-blue-400 shrink-0">•</span>
                                    <span>{stripStarMarks(advice)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Action Button: Send Diagnosis to Chat for Follow-Up */}
                          <div className="pt-2 border-t border-blue-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <span className="text-[10px] font-mono text-slate-500">
                              Abel Multimodal Vision Engine Signed Release
                            </span>
                            <button
                              type="button"
                              onClick={() => sendDiagnosisToChat(imageAnalysisResult)}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-mono transition-colors cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
                            >
                              <Bot className="w-3.5 h-3.5" />
                              {swahiliPreference ? 'Jadili Matokeo Haya Kwenye Chat' : 'Ask Abel AI Follow-up Questions'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* View 4: Agribusiness Partners */}
            {activeTab === 'companies' && (
              <motion.div
                key="companies_tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="max-w-5xl mx-auto space-y-6"
              >
                {/* Header card */}
                <div className="glass-panel rounded-2xl p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600/5 rounded-full filter blur-3xl pointer-events-none" />
                  
                  <div className="flex gap-4 items-start">
                    <div className="p-3.5 bg-emerald-600/10 border border-emerald-500/20 rounded-2xl">
                      <Building2 className="w-7 h-7 text-emerald-400 stroke-2" />
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-mono tracking-widest bg-emerald-900/40 text-emerald-300 px-2.5 py-1 rounded-md border border-blue-800/30 font-semibold text-center inline-block">
                        Agribusiness Directory
                      </span>
                      <h2 className="font-display font-medium text-lg text-white mt-1.5">Verified Seed, Crop Nutrition & Input Partners</h2>
                      <p className="text-xs text-slate-400 leading-relaxed mt-1">
                        Connect with real, established domestic Tanzanian seed houses and world-leading crop protection companies like Bayer and Yara to acquire certified inputs, premium technical diagnostics, and soil health management services.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Scope Filters */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-2 border-b border-blue-950/40">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400">Operation Scope:</span>
                    <div className="flex bg-slate-950/60 p-1 rounded-xl border border-blue-950/40">
                      {(['all', 'Tanzanian', 'Global'] as const).map((filter) => (
                        <button
                          key={filter}
                          onClick={() => setCompanyFilter(filter)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                            companyFilter === filter
                              ? 'bg-blue-600 text-white shadow font-semibold'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {filter === 'all' ? 'All Partners' : filter === 'Tanzanian' ? 'Tanzanian Local' : 'Global Giants'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">
                    Showing {filteredAgribusinesses.length} verified agricultural operators
                  </span>
                </div>

                {/* Empty State */}
                {filteredAgribusinesses.length === 0 ? (
                  <div className="glass-panel rounded-2xl p-12 text-center max-w-md mx-auto">
                    <Building2 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                    <p className="text-xs font-semibold text-slate-300">No Agribusiness Match Found</p>
                    <p className="text-[11px] text-slate-500 mt-1">Try resetting your search filter or checking for typos.</p>
                    <button
                      onClick={() => { setCompanySearchQuery(''); setCompanyFilter('all'); }}
                      className="mt-4 bg-blue-950 text-blue-400 hover:bg-blue-600 hover:text-white border border-blue-900/40 px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer"
                    >
                      Clear search filters
                    </button>
                  </div>
                ) : (
                  /* Grid list of companies */
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredAgribusinesses.map((company) => (
                      <div key={company.id} className="glass-panel rounded-2xl overflow-hidden border border-blue-950/40 flex flex-col justify-between hover:border-blue-800/30 hover:shadow-xl transition-all duration-300">
                        <div>
                          {/* Image banner */}
                          <div className="relative h-44 overflow-hidden border-b border-blue-950/30">
                            <img
                              src={company.image}
                              alt={company.name}
                              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                            <div className="absolute top-3 left-3">
                              <span className={`text-[9px] uppercase font-mono tracking-wider px-2.5 py-1 rounded-md border font-semibold shadow-lg ${
                                company.category === 'Tanzanian'
                                  ? 'bg-emerald-950/85 border-emerald-900/30 text-emerald-300'
                                  : 'bg-blue-950/85 border-blue-900/30 text-blue-300'
                              }`}>
                                {company.category} Partner
                              </span>
                            </div>
                          </div>

                          {/* Content details */}
                          <div className="p-5 space-y-3">
                            <div>
                              <h3 className="font-display font-medium text-white text-md tracking-tight">{company.name}</h3>
                              <p className="text-[10px] font-mono text-emerald-400 mt-0.5 font-semibold">{company.specialization}</p>
                            </div>

                            <p className="text-slate-300 text-xs leading-relaxed">
                              {company.description}
                            </p>

                            {/* Location Block */}
                            <div className="flex items-start gap-2 text-xs pt-3 border-t border-blue-950/40">
                              <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                              <div className="space-y-0.5">
                                <p className="text-[9px] font-mono uppercase text-slate-500 leading-none font-semibold">HQ & Coordinates</p>
                                <p className="text-slate-300 text-[11px] leading-tight">{company.location}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Action footer link */}
                        <div className="p-5 pt-0">
                          <a
                            href={company.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full flex items-center justify-center gap-2 bg-blue-950/60 hover:bg-blue-600/95 border border-blue-800/30 hover:border-blue-500 text-blue-300 hover:text-white font-mono px-4 py-2.5 rounded-xl text-xs transition-all duration-300 cursor-pointer text-center font-medium"
                          >
                            <Globe className="w-3.5 h-3.5" /> Visit Official Website ↗
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* View 5: App Settings */}
            {activeTab === 'settings' && (
              <motion.div
                key="settings_tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="max-w-4xl mx-auto space-y-6"
              >
                {/* Header panel */}
                <div className="glass-panel rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden border border-blue-900/30">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
                  <div className="space-y-2 z-10">
                    <span className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-widest text-blue-400 bg-blue-950/80 px-3 py-1 rounded-md border border-blue-900/30">
                      {swahiliPreference ? 'MIPANGILIO YA MFUMO' : 'SYSTEM PREFERENCES'}
                    </span>
                    <h2 className="text-2xl font-display font-medium text-white tracking-tight">
                      {swahiliPreference ? 'Mipangilio ya Programu' : 'App Configuration Panel'}
                    </h2>
                    <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
                      {swahiliPreference 
                        ? 'Sanidi vipimo vyako, arifa za dharura, hifadhi ya nje ya mkopo na lugha ya uendeshaji katika kituo hiki cha kisasa.' 
                        : 'Configure localized metrics units, toggle meteorological warning alerts, manage local device caching, and toggle workspace language parameters.'}
                    </p>
                  </div>
                  <div className="bg-slate-900/80 border border-blue-950 px-4 py-3.5 rounded-xl z-10 min-w-[140px] text-center shrink-0">
                    <div className="text-sm font-mono text-emerald-400 font-bold flex items-center justify-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                      {swahiliPreference ? 'IMEKAA SAWA' : 'OPTIMAL'}
                    </div>
                    <div className="text-[10px] uppercase font-mono tracking-wider text-slate-500 mt-1">
                      {swahiliPreference ? 'Hali ya Mfumo' : 'Engine State'}
                    </div>
                  </div>
                </div>

                {/* Main Settings Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Category 1: Measurements */}
                  <div className="glass-panel rounded-2xl p-6 border border-blue-950/40 space-y-6">
                    <div className="flex items-center gap-2.5 pb-4 border-b border-blue-950/40">
                      <Sliders className="w-5 h-5 text-blue-400 stroke-2" />
                      <h3 className="font-semibold text-white text-sm">
                        {swahiliPreference ? 'Ripoti & Vipimo vya Kisayansi' : 'Scientific Measurement Units'}
                      </h3>
                    </div>

                    {/* Temp Select Row */}
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold text-slate-200">
                          {swahiliPreference ? 'Kipimo cha Joto la Hewa' : 'Temperature Metric'}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {swahiliPreference ? 'Chagua Celsius au Fahrenheit kwa mahitaji ya zao.' : 'Toggle Celsius or Fahrenheit references dynamically.'}
                        </p>
                      </div>
                      <div className="flex bg-slate-950/80 border border-blue-950/60 rounded-xl p-1 shrink-0">
                        <button
                          onClick={() => setTemperatureScale('C')}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                            temperatureScale === 'C'
                              ? 'bg-blue-600 text-white shadow-md font-semibold'
                              : 'text-slate-500 hover:text-white'
                          }`}
                        >
                          °C
                        </button>
                        <button
                          onClick={() => setTemperatureScale('F')}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                            temperatureScale === 'F'
                              ? 'bg-blue-600 text-white shadow-md font-semibold'
                              : 'text-slate-500 hover:text-white'
                          }`}
                        >
                          °F
                        </button>
                      </div>
                    </div>

                    {/* Rain Select Row */}
                    <div className="flex items-center justify-between gap-4 py-1">
                      <div>
                        <p className="text-xs font-semibold text-slate-200">
                          {swahiliPreference ? 'Kiwango cha Mvua / Unyevunyevu' : 'Precipitation & Rainfall Unit'}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {swahiliPreference ? 'Viwango vya ugavi wa maji kwa Milimita au Inches.' : 'Water delivery rate expressed in Millimeters or Inches.'}
                        </p>
                      </div>
                      <div className="flex bg-slate-950/80 border border-blue-950/60 rounded-xl p-1 shrink-0">
                        <button
                          onClick={() => setRainfallUnit('mm')}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                            rainfallUnit === 'mm'
                              ? 'bg-blue-600 text-white shadow-md font-semibold'
                              : 'text-slate-500 hover:text-white'
                          }`}
                        >
                          mm
                        </button>
                        <button
                          onClick={() => setRainfallUnit('in')}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                            rainfallUnit === 'in'
                              ? 'bg-blue-600 text-white shadow-md font-semibold'
                              : 'text-slate-500 hover:text-white'
                          }`}
                        >
                          in
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Category 2: Localization */}
                  <div className="glass-panel rounded-2xl p-6 border border-blue-950/40 space-y-6">
                    <div className="flex items-center gap-2.5 pb-4 border-b border-blue-950/40">
                      <Globe className="w-5 h-5 text-blue-400 stroke-2" />
                      <h3 className="font-semibold text-white text-sm">
                        {swahiliPreference ? 'Mpangilio wa Lugha' : 'Workspace Localisation'}
                      </h3>
                    </div>

                    {/* Language Preference */}
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold text-slate-200">
                          {swahiliPreference ? 'Lugha Kuu ya Programu' : 'App Interface Language'}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {swahiliPreference 
                            ? 'Badilisha lugha kati ya Kiingereza na Kiswahili mara moja.' 
                            : 'Set your primary workspace communication language.'}
                        </p>
                      </div>
                      <div className="flex bg-slate-950/80 border border-blue-950/60 rounded-xl p-1 shrink-0">
                        <button
                          onClick={() => setSwahiliPreference(false)}
                          className={`px-3.5 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                            !swahiliPreference
                              ? 'bg-blue-600 text-white shadow-md font-semibold'
                              : 'text-slate-500 hover:text-white'
                          }`}
                        >
                          EN
                        </button>
                        <button
                          onClick={() => setSwahiliPreference(true)}
                          className={`px-3.5 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                            swahiliPreference
                              ? 'bg-blue-600 text-white shadow-md font-semibold'
                              : 'text-slate-500 hover:text-white'
                          }`}
                        >
                          SW
                        </button>
                      </div>
                    </div>

                    {/* Language status banner */}
                    <div className="p-3 bg-slate-950 rounded-xl border border-blue-950 flex gap-2.5 items-center">
                      <Info className="w-4 h-4 text-emerald-400 shrink-0" />
                      <p className="text-[10px] leading-relaxed text-slate-400">
                        {swahiliPreference 
                          ? 'Mfumo unatumia teknolojia ya Abel AI kutafsiri vichwa vya habari na vipimo vya katalogi kwa urahisi wa matumizi.' 
                          : 'The localized workspace leverages Abel AI to translate indices, header tabs, and metrics references automatically.'}
                      </p>
                    </div>
                  </div>

                  {/* Category: Farm Location & Microclimate Station */}
                  <div className="glass-panel rounded-2xl p-6 border border-blue-950/40 md:col-span-2 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-blue-950/40">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-blue-600/10 border border-blue-500/20 rounded-xl text-blue-400">
                          <MapPin className="w-5 h-5 stroke-2" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white text-sm">
                            {swahiliPreference ? 'Eneo la Shamba & Kituo cha Hali ya Hewa' : 'Farm Location & Agricultural Microclimate Station'}
                          </h3>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {swahiliPreference
                              ? 'Eneo lako linaongoza utabiri wa Frogcast, mapendekezo ya mimea ya Abel AI na ratiba za kazi za shamba.'
                              : 'Calibrates Frogcast meteorological feeds, Abel AI regional crop suitability, and localized planting windows.'}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowLocationModal(true)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer shadow-md shadow-blue-950 shrink-0"
                      >
                        <Compass className="w-4 h-4" />
                        <span>{swahiliPreference ? 'Badilisha Eneo / GPS' : 'Change Location / GPS'}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="p-3.5 bg-slate-950/70 rounded-xl border border-blue-950/80">
                        <p className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">
                          {swahiliPreference ? 'Kituo Kilichochaguliwa' : 'Selected Station'}
                        </p>
                        <p className="text-xs font-semibold text-white mt-1">{selectedLocation.name}</p>
                        {selectedLocation.region && (
                          <span className="inline-block mt-1.5 text-[9px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-900/40">
                            {selectedLocation.region}
                          </span>
                        )}
                      </div>

                      <div className="p-3.5 bg-slate-950/70 rounded-xl border border-blue-950/80">
                        <p className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">
                          {swahiliPreference ? 'Kuratibu za GPS' : 'GPS Coordinates'}
                        </p>
                        <p className="text-xs font-mono font-semibold text-emerald-400 mt-1">
                          Lat {selectedLocation.lat.toFixed(4)}, Lon {selectedLocation.lon.toFixed(4)}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-1 font-mono">
                          {swahiliPreference ? 'Kituo cha utabiri kipo hewani' : 'Active telemetry station'}
                        </p>
                      </div>

                      <div className="p-3.5 bg-slate-950/70 rounded-xl border border-blue-950/80">
                        <p className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">
                          {swahiliPreference ? 'Hali ya Udongo & Ukanda' : 'Soil Profile & Zone'}
                        </p>
                        <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                          {selectedLocation.description || 'Custom user-specified farm coordinates'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Category 3: Alert & Signal Feeds */}
                  <div className="glass-panel rounded-2xl p-6 border border-blue-950/40 space-y-6">
                    <div className="flex items-center gap-2.5 pb-4 border-b border-blue-950/40">
                      <Bell className="w-5 h-5 text-blue-400 stroke-2" />
                      <h3 className="font-semibold text-white text-sm">
                        {swahiliPreference ? 'Arifa za Dharura & Mawimbi' : 'Intelligent Signal Feeds'}
                      </h3>
                    </div>

                    {/* Microclimate Toggle */}
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold text-slate-200">
                          {swahiliPreference ? 'Arifa Maalum za Hali ya Hewa' : 'Extreme Weather Advisories'}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {swahiliPreference 
                            ? 'Pokea tahadhari pindi mabadiliko ya ghafula yanapotokea.' 
                            : 'Receive weather warnings in Frogcast for severe anomalies or droughts.'}
                        </p>
                      </div>
                      <button
                        onClick={() => setEnableClimateAlerts(!enableClimateAlerts)}
                        className={`w-10 h-6 flex items-center rounded-full p-1 transition-all cursor-pointer ${
                          enableClimateAlerts ? 'bg-blue-600' : 'bg-slate-800'
                        }`}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                            enableClimateAlerts ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Soil Warning Toggle */}
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold text-slate-200">
                          {swahiliPreference ? 'Tahadhari ya Kufaa kwa Udongo' : 'Soil Suitability Safety Flags'}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {swahiliPreference 
                            ? 'Weka alama za onyo iwapo ph ya udongo hailingani na mahitaji.' 
                            : 'Flag immediate visual pH alerts if ranges diverge from crop models.'}
                        </p>
                      </div>
                      <button
                        onClick={() => setEnableSoilWarnings(!enableSoilWarnings)}
                        className={`w-10 h-6 flex items-center rounded-full p-1 transition-all cursor-pointer ${
                          enableSoilWarnings ? 'bg-blue-600' : 'bg-slate-800'
                        }`}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                            enableSoilWarnings ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Category 4: Storage & Caching */}
                  <div className="glass-panel rounded-2xl p-6 border border-blue-950/40 space-y-6">
                    <div className="flex items-center gap-2.5 pb-4 border-b border-blue-950/40">
                      <Database className="w-5 h-5 text-blue-400 stroke-2" />
                      <h3 className="font-semibold text-white text-sm">
                        {swahiliPreference ? 'Uhifadhi wa Nje ya Mtandao' : 'Local Storage & Cache Sync'}
                      </h3>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-xs font-semibold text-slate-200">
                            {swahiliPreference ? 'Hali ya Kilimo-Cache' : 'Offline Workspace Cache'}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {swahiliPreference 
                              ? 'Hifadhi wasifu kamili vya mimea kwa ajili ya kufanya kazi shambani.' 
                              : 'Keep crop profiles locally cached directly in browser memory.'}
                          </p>
                        </div>
                        <span className="text-xs font-mono px-3 py-1 bg-slate-950 border border-blue-950 rounded-lg text-blue-300 font-semibold shrink-0">
                          {syncStatus === 'synced' 
                            ? (swahiliPreference ? 'Imejaa (1.2 MB)' : 'Fully Synced (1.2 MB)')
                            : (swahiliPreference ? 'Tupu (0.0 MB)' : 'Cache Cleared (0.0 MB)')}
                        </span>
                      </div>

                      {/* Cache buttons */}
                      <div className="grid grid-cols-2 gap-2.5 pt-2">
                        <button
                          disabled={syncLoading || clearLoading}
                          onClick={() => {
                            setSyncLoading(true);
                            setTimeout(() => {
                              setSyncLoading(false);
                              setSyncStatus('synced');
                            }, 1500);
                          }}
                          className="flex items-center justify-center gap-1.5 py-2 px-3 bg-blue-950/50 hover:bg-blue-600/10 border border-blue-900/30 text-[10px] font-bold text-blue-400 rounded-xl transition-all disabled:opacity-50 cursor-pointer uppercase tracking-wider"
                        >
                          {syncLoading ? (
                            <>
                              <RefreshCw className="w-3 h-3 animate-spin text-blue-400" />
                              {swahiliPreference ? 'Inapakia...' : 'Syncing...'}
                            </>
                          ) : (
                            swahiliPreference ? 'Landanisha Database' : 'Force Re-Sync'
                          )}
                        </button>

                        <button
                          disabled={syncLoading || clearLoading}
                          onClick={() => {
                            setClearLoading(true);
                            setTimeout(() => {
                              setClearLoading(false);
                              setSyncStatus('cleared');
                            }, 1200);
                          }}
                          className="flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-950 border border-slate-900 hover:border-red-900/40 text-[10px] font-bold text-slate-500 hover:text-red-400 rounded-xl transition-all disabled:opacity-50 cursor-pointer uppercase tracking-wider"
                        >
                          {clearLoading ? (
                            <>
                              <RefreshCw className="w-3 h-3 animate-spin text-red-400" />
                              {swahiliPreference ? 'Inasafisha...' : 'Purging...'}
                            </>
                          ) : (
                            swahiliPreference ? 'Futa Yaliyomo' : 'Clear Local Cache'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Category: AI Engine Acceleration & Response Latency */}
                  <div className="glass-panel rounded-2xl p-6 border border-amber-950/40 md:col-span-2 space-y-6 relative overflow-hidden">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-blue-950/40">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
                          <Zap className="w-5 h-5 stroke-2" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-white text-sm">
                              {swahiliPreference ? 'Maboresho ya Kasi ya Majibu ya AI' : 'AI Engine Acceleration & Response Optimization'}
                            </h3>
                            <span className="text-[10px] font-mono uppercase bg-amber-950/80 text-amber-300 border border-amber-800/40 px-2 py-0.5 rounded-full font-semibold">
                              ~0.25s TTFT Active
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {swahiliPreference 
                              ? 'Sanidi mfumo wa kisasa wa Gemini 3.1 Flash-Lite wenye utiririshaji wa data mara moja (SSE Streaming) na uhifadhi wa akiba (Cache).'
                              : 'Control low-latency model inference, Server-Sent Events progressive streaming, and in-memory agronomic response caching.'}
                          </p>
                        </div>
                      </div>

                      {/* Speed badge */}
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-950 border border-amber-900/30 rounded-xl text-xs font-mono text-amber-300 shrink-0">
                        <Timer className="w-3.5 h-3.5 text-amber-400" />
                        <span>{aiSpeedMode === 'ultra_fast' ? 'Sub-Second Latency' : 'Standard 1-2s'}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* Setting 1: Speed Mode Selection */}
                      <div className="p-4 bg-slate-950/70 rounded-xl border border-blue-950/80 space-y-3">
                        <div>
                          <p className="text-xs font-semibold text-slate-200">
                            {swahiliPreference ? 'Uchaguzi wa Muundo wa Injini ya AI' : 'Inference Model & Latency Tier'}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {swahiliPreference 
                              ? 'Chagua kati ya kasi ya juu zaidi ya Flash-Lite au muundo wa kawaida.' 
                              : 'Select high-speed Flash-Lite with minimal reasoning overhead, or balanced reasoning.'}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setAiSpeedMode('ultra_fast')}
                            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                              aiSpeedMode === 'ultra_fast'
                                ? 'bg-amber-950/30 border-amber-500/60 shadow-sm'
                                : 'bg-slate-900/40 border-blue-950/60 hover:border-slate-800'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1 font-mono">
                                <Zap className="w-3 h-3 text-amber-400" /> Ultra-Fast
                              </span>
                              {aiSpeedMode === 'ultra_fast' && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />}
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1">Gemini 3.1 Flash-Lite &bull; ~250ms</p>
                          </button>

                          <button
                            type="button"
                            onClick={() => setAiSpeedMode('balanced')}
                            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                              aiSpeedMode === 'balanced'
                                ? 'bg-blue-950/30 border-blue-500/60 shadow-sm'
                                : 'bg-slate-900/40 border-blue-950/60 hover:border-slate-800'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold text-blue-300 flex items-center gap-1 font-mono">
                                <Gauge className="w-3 h-3 text-blue-400" /> Balanced
                              </span>
                              {aiSpeedMode === 'balanced' && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />}
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1">Gemini 3.8 Flash &bull; ~1.5s</p>
                          </button>
                        </div>
                      </div>

                      {/* Setting 2: High-Speed Cache & Streaming */}
                      <div className="p-4 bg-slate-950/70 rounded-xl border border-blue-950/80 space-y-3 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold text-slate-200">
                              {swahiliPreference ? 'Uhifadhi wa Majibu ya Haraka (Memory Cache)' : 'Instant Replay In-Memory Cache'}
                            </p>
                            <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-900/40 px-2 py-0.5 rounded">
                              &lt; 15ms Replay
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {swahiliPreference 
                              ? 'Hifadhi majibu ya maswali ya mara kwa mara ili kutoa majibu ya papo hapo bila kuchelewa.' 
                              : 'Stores recent regional crop advisories in server RAM to return identical queries in milliseconds.'}
                          </p>
                        </div>

                        <div className="flex items-center justify-between gap-3 pt-2 border-t border-blue-950/50">
                          <span className="text-[10px] font-mono text-slate-400">
                            {cacheClearSuccess ? (swahiliPreference ? '✓ Akiba imesafishwa' : '✓ Cache purged successfully') : (swahiliPreference ? 'Hali: Inafanya kazi' : 'Status: Warm & Active')}
                          </span>

                          <button
                            type="button"
                            onClick={handleClearServerAiCache}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-blue-950 text-slate-300 hover:text-white rounded-lg text-[10px] font-mono uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <RefreshCw className="w-3 h-3 text-slate-400" />
                            {swahiliPreference ? 'Safisha Akiba ya AI' : 'Purge AI Cache'}
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>

                </div>

                {/* Category 5: Reserved Rights & Prohibited Terms Governance Card */}
                <div className="glass-panel rounded-2xl p-6 md:p-8 border border-blue-900/40 space-y-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-72 h-72 bg-blue-600/5 rounded-full filter blur-3xl pointer-events-none" />

                  {/* Header Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-blue-950/60">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-blue-600/10 border border-blue-500/20 rounded-xl text-blue-400">
                        <Scale className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-white text-base">
                            {swahiliPreference 
                              ? 'Sera ya Haki Zilizohifadhiwa na Vigezo Vilivyokatazwa' 
                              : 'Reserved Rights & Prohibited Terms Policy'}
                          </h3>
                          <span className="text-[10px] font-mono uppercase bg-blue-950 text-blue-300 border border-blue-800/40 px-2.5 py-0.5 rounded-full font-semibold">
                            Charter v2.4 (2026)
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {swahiliPreference 
                            ? 'Usimamizi wa haki miliki za kiakili, vigezo vilivyopigwa marufuku (sumu kali & scraping), na ruhusa ya kilimo cha jamii.' 
                            : 'Governance of intellectual property reservations, active prohibited terms (toxic chemicals & bot scraping), and community fair-use.'}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => { setInitialTermsTab('all'); setShowTermsModal(true); }}
                      className="flex items-center gap-1.5 px-4 py-2 bg-blue-600/90 hover:bg-blue-600 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-lg shadow-blue-950/50 shrink-0"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      {swahiliPreference ? 'Fungua Mkataba Kamili' : 'Open Legal Charter'}
                      <ExternalLink className="w-3 h-3 ml-0.5" />
                    </button>
                  </div>

                  {/* Two Sub-Cards: Reserved Rights vs Prohibited Terms */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    
                    {/* Panel 1: Reserved Rights */}
                    <div className="p-5 bg-slate-950/60 rounded-xl border border-blue-950/70 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Lock className="w-4 h-4 text-blue-400" />
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                            {swahiliPreference ? 'Haki Zilizohifadhiwa (Reserved)' : 'Reserved Proprietary Rights'}
                          </h4>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-900/40 px-2 py-0.5 rounded">
                          &copy; 2026 Abel Samwel
                        </span>
                      </div>

                      <div className="space-y-2 text-xs text-slate-300 leading-relaxed font-sans">
                        <p>
                          <strong className="text-white">&bull; Algorithmic IP: </strong>
                          {swahiliPreference 
                            ? 'Mifumo yote ya kihesabu ya microclimate, alama za Frogcast, na maelekezo ya Abel AI ni mali ya kitaaluma iliyolindwa kisheria.' 
                            : 'All microclimatic scoring models, Frogcast meteorological calibrations, and Abel AI prompt engineering remain proprietary.'}
                        </p>
                        <p>
                          <strong className="text-white">&bull; Botanical Database: </strong>
                          {swahiliPreference 
                            ? 'Hifadhidata ya aina za kahawa, nafaka, mboga, na magonjwa inalindwa chini ya sheria za hakimiliki ya kidijitali.' 
                            : 'The curated crop taxonomies, East African coffee variants, and disease symptom guides are protected compilations.'}
                        </p>
                        <p>
                          <strong className="text-white">&bull; Farmer Exemption: </strong>
                          {swahiliPreference 
                            ? 'Wakulima wadogo na vyuo wanaruhusiwa kutumia na kurejelea data hizi kwa ajili ya uzalishaji wa shambani bila malipo.' 
                            : 'Non-commercial agricultural use by smallholder farmers and agronomy students is freely permitted worldwide.'}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-blue-950/50 flex justify-end">
                        <button
                          onClick={() => { setInitialTermsTab('reserved'); setShowTermsModal(true); }}
                          className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 cursor-pointer"
                        >
                          {swahiliPreference ? 'Soma Haki Zilizohifadhiwa (Kifungu 1.0) ↗' : 'View Section 1.0 (Reserved Rights) ↗'}
                        </button>
                      </div>
                    </div>

                    {/* Panel 2: Prohibited Terms & Safeguards */}
                    <div className="p-5 bg-slate-950/60 rounded-xl border border-red-950/50 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ShieldAlert className="w-4 h-4 text-red-400" />
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                            {swahiliPreference ? 'Vigezo Vilivyokatazwa (Prohibited)' : 'Prohibited Terms & Misuse'}
                          </h4>
                        </div>
                        <span className="text-[10px] font-mono text-red-400 bg-red-950/60 border border-red-900/40 px-2 py-0.5 rounded">
                          {enforceProhibitedShield ? 'Shield: Active' : 'Shield: Off'}
                        </span>
                      </div>

                      {/* Policy Toggles */}
                      <div className="space-y-3 pt-1">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-xs font-medium text-slate-200">
                              {swahiliPreference ? 'Kinga ya Maswali Yasiyofaa (Query Shield)' : 'Enforce Prohibited Prompt Shield'}
                            </p>
                            <p className="text-[10px] text-slate-500">
                              {swahiliPreference ? 'Zuia maombi ya sumu hatarishi au uvunaji haramu wa data.' : 'Block prompts querying toxic organochlorines, narcotics, or exploits.'}
                            </p>
                          </div>
                          <button
                            onClick={() => setEnforceProhibitedShield(!enforceProhibitedShield)}
                            className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-all cursor-pointer ${
                              enforceProhibitedShield ? 'bg-red-600' : 'bg-slate-800'
                            }`}
                          >
                            <div
                              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                                enforceProhibitedShield ? 'translate-x-4' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </div>

                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-xs font-medium text-slate-200">
                              {swahiliPreference ? 'Kinga ya Roboti & Scraping (Anti-Scrape)' : 'Anti-Scrape Bot Extraction Barrier'}
                            </p>
                            <p className="text-[10px] text-slate-500">
                              {swahiliPreference ? 'Piga marufuku roboti za kunakili data nzima ya kilimo.' : 'Disallow headless automated crawlers from dumping catalog datasets.'}
                            </p>
                          </div>
                          <button
                            onClick={() => setEnforceAntiScrape(!enforceAntiScrape)}
                            className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-all cursor-pointer ${
                              enforceAntiScrape ? 'bg-red-600' : 'bg-slate-800'
                            }`}
                          >
                            <div
                              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                                enforceAntiScrape ? 'translate-x-4' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-red-950/40 flex justify-end">
                        <button
                          onClick={() => { setInitialTermsTab('prohibited'); setShowTermsModal(true); }}
                          className="text-xs text-red-400 hover:text-red-300 font-medium flex items-center gap-1 cursor-pointer"
                        >
                          {swahiliPreference ? 'Soma Vigezo Vilivyokatazwa (Kifungu 2.0) ↗' : 'View Section 2.0 (Prohibited Terms) ↗'}
                        </button>
                      </div>
                    </div>

                  </div>

                  {/* Interactive Prohibited Terms Filter & Tag Manager */}
                  <div className="p-5 bg-slate-950/80 rounded-xl border border-blue-950/80 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                          {swahiliPreference ? 'Meneja wa Maneno Yaliyopigwa Marufuku kwenye Mfumo' : 'Active Prohibited Terms & Restrictions Registry'}
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {swahiliPreference 
                            ? 'Maneno na dhana zilizo chini huzuiliwa kwenye injini ya Abel AI na utafutaji kulinda usalama wa wakulima.' 
                            : 'Terms and activities actively filtered out from Abel AI advisory inputs and crop searches to safeguard agronomic integrity.'}
                        </p>
                      </div>
                      
                      <button
                        onClick={handleResetProhibitedTerms}
                        className="text-[10px] font-mono text-slate-400 hover:text-slate-200 underline cursor-pointer self-start sm:self-auto"
                      >
                        {swahiliPreference ? 'Rejesha ya Awali' : 'Reset to Default Terms'}
                      </button>
                    </div>

                    {/* Chips Display */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {prohibitedTermsList.map(term => (
                        <span 
                          key={term}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-950/50 hover:bg-red-950 border border-red-900/40 rounded-lg text-xs font-mono text-red-300 transition-colors"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                          {term}
                          <button
                            type="button"
                            onClick={() => handleRemoveProhibitedTerm(term)}
                            className="text-red-400 hover:text-red-200 ml-0.5 cursor-pointer"
                            title={`Remove ${term}`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>

                    {/* Add New Prohibited Term Form */}
                    <form onSubmit={handleAddProhibitedTerm} className="flex gap-2 pt-2">
                      <input
                        type="text"
                        placeholder={swahiliPreference ? 'Ongeza neno jipya lililokatazwa (mfano: hazardous_pesticide)...' : 'Add custom prohibited term (e.g. hazardous_chemical)...'}
                        value={newProhibitedInput}
                        onChange={(e) => setNewProhibitedInput(e.target.value)}
                        className="bg-slate-900 border border-blue-950 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-600 flex-grow font-sans"
                      />
                      <button
                        type="submit"
                        disabled={!newProhibitedInput.trim()}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        {swahiliPreference ? 'Ongeza' : 'Add Term'}
                      </button>
                    </form>
                  </div>

                </div>

                {/* Craftsmanship Note */}
                <div className="p-4 bg-slate-900/40 border border-blue-950/50 rounded-2xl flex items-start gap-3 relative overflow-hidden">
                  <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <h4 className="text-xs font-semibold text-slate-200">
                        {swahiliPreference ? 'Usalama wa Data ya Mkulima & Mkataba wa Kisheria' : 'Privacy, Client Integrity & Legal Compliance'}
                      </h4>
                      <button
                        onClick={() => { setInitialTermsTab('all'); setShowTermsModal(true); }}
                        className="text-[10px] font-mono text-blue-400 hover:underline cursor-pointer"
                      >
                        {swahiliPreference ? 'Tazama Masharti Yote ↗' : 'Review Full Terms ↗'}
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed mt-1">
                      {swahiliPreference 
                        ? 'Abel Crop Intelligence huhifadhi mipangilio yako yote kwenye kivinjari chako cha kielektroniki pekee. Hakuna anwani ya IP au siri ya pembejeo inayosafirishwa nje. Matumizi yote yanasimamiwa na Mkataba wa Haki Zilizohifadhiwa na Vigezo Vilivyokatazwa (2026).'
                        : 'All adjustments, metric choices, and system keys persist strictly onto your local browser sandbox context. Your geographical telemetry data remains offline. Governed by the 2026 Reserved Rights & Prohibited Terms Charter.'}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}



          </AnimatePresence>
        </main>
      </div>

      {/* FOOTER */}
      <footer className="py-6 border-t border-blue-950/40 text-center text-xs text-slate-500 z-20 bg-slate-950/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-mono text-slate-400 text-xs">
            &copy; 2026 ABEL CROP INTELLIGENCE &bull; ALL RIGHTS RESERVED
          </p>
          <div className="flex items-center gap-3 text-xs flex-wrap justify-center">
            <button 
              onClick={() => { setInitialTermsTab('reserved'); setShowTermsModal(true); }}
              className="text-slate-400 hover:text-blue-400 transition-colors cursor-pointer flex items-center gap-1 font-mono text-[11px]"
            >
              <Lock className="w-3 h-3 text-blue-400" />
              {swahiliPreference ? 'Haki Zilizohifadhiwa' : 'Reserved Rights'}
            </button>
            <span className="text-slate-700">&bull;</span>
            <button 
              onClick={() => { setInitialTermsTab('prohibited'); setShowTermsModal(true); }}
              className="text-slate-400 hover:text-red-400 transition-colors cursor-pointer flex items-center gap-1 font-mono text-[11px]"
            >
              <ShieldAlert className="w-3 h-3 text-red-400" />
              {swahiliPreference ? 'Vigezo Vilivyokatazwa' : 'Prohibited Terms'}
            </button>
            <span className="text-slate-700">&bull;</span>
            <button 
              onClick={() => { setInitialTermsTab('fairuse'); setShowTermsModal(true); }}
              className="text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer flex items-center gap-1 font-mono text-[11px]"
            >
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              {swahiliPreference ? 'Ruhusa ya Mkulima' : 'Farmer Fair-Use'}
            </button>
          </div>
          <p className="font-mono text-[10px] text-slate-500">
            POWERED BY THE ABEL AI API &bull; FROGCAST ATMOSPHERICS
          </p>
        </div>
      </footer>

      {/* OVERLAY DRAWER: CROP DETAIL & REQUIREMENT VIEW AND COFFEE VARIANTS */}
      <AnimatePresence>
        {selectedCrop && (
          <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-start justify-center p-0 overflow-hidden">
            {/* Click backdrop to exit */}
            <div className="absolute inset-0" onClick={() => setSelectedCrop(null)} />

            {/* Panel slider container */}
            <motion.div
              initial={{ y: '-100%', opacity: 0.95 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '-100%', opacity: 0.95 }}
              transition={{ type: 'spring', damping: 28, stiffness: 170 }}
              className="bg-slate-900 w-[92vw] sm:w-[85vw] md:w-[75vw] h-screen max-h-screen flex flex-col justify-between shadow-2xl relative z-10 border-x border-blue-950/80 rounded-none overflow-hidden"
              id="crop_detail_drawer"
            >
              {/* Header */}
              <div className="p-6 border-b border-blue-950/50 flex justify-between items-center bg-slate-900/80 backdrop-blur-md sticky top-0 z-20">
                <div className="flex items-center gap-2">
                  <Leaf className="w-5 h-5 text-emerald-400" />
                  <span className="text-xs uppercase font-mono tracking-widest text-blue-400">{selectedCrop.category} profile</span>
                </div>
                <button
                  onClick={() => setSelectedCrop(null)}
                  className="p-2 text-slate-400 hover:text-white bg-slate-950/50 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable contents */}
              <div className="p-6 overflow-y-auto space-y-6 flex-grow">
                
                {/* Crop Title Hero banner */}
                <div className="relative h-52 rounded-2xl overflow-hidden border border-blue-950 bg-slate-950 flex flex-col justify-end items-center text-center p-6">
                  <img
                    src={selectedCrop.image}
                    alt={selectedCrop.name}
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
                  <div className="relative z-10 space-y-1">
                    <h2 className="font-display font-medium text-2xl sm:text-3xl text-white tracking-tight">{selectedCrop.name}</h2>
                    <span className="inline-block text-[10px] font-mono uppercase tracking-widest text-emerald-400 bg-emerald-950/60 px-3 py-0.5 rounded-full border border-emerald-900/30">
                      {selectedCrop.category}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2 text-center bg-slate-950/30 border border-blue-950/40 p-5 rounded-2xl">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold text-center">Botanical Description</h3>
                  <p className="text-xs leading-relaxed text-slate-300 text-center mx-auto max-w-xl">{selectedCrop.description}</p>
                </div>

                <div className="h-px bg-blue-950/60" />

                {/* Requirements Grid */}
                <div className="space-y-4">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">Crops Requirements</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    
                    {/* Rainfall */}
                    <div className="p-3.5 bg-slate-950 rounded-xl border border-blue-950 flex gap-3 h-20 items-center">
                      <div className="p-2 sm:p-2.5 bg-blue-500/10 rounded-lg text-blue-400">
                        <CloudRain className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Rainfall</p>
                        <p className="text-[11px] font-semibold text-white mt-0.5">{formatRain(selectedCrop.requirements.rainfall)}</p>
                      </div>
                    </div>

                    {/* Temperature */}
                    <div className="p-3.5 bg-slate-950 rounded-xl border border-blue-950 flex gap-3 h-20 items-center">
                      <div className="p-2 sm:p-2.5 bg-amber-500/10 rounded-lg text-amber-500">
                        <Thermometer className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Temperature</p>
                        <p className="text-[11px] font-semibold text-white mt-0.5">{formatTemp(selectedCrop.requirements.temperature)}</p>
                      </div>
                    </div>

                    {/* Sunshine */}
                    <div className="p-3.5 bg-slate-950 rounded-xl border border-blue-950 flex gap-3 h-20 items-center">
                      <div className="p-2 sm:p-2.5 bg-yellow-500/10 rounded-lg text-yellow-400">
                        <Sun className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Sunshine</p>
                        <p className="text-[11px] font-semibold text-white mt-0.5">{selectedCrop.requirements.sunshine}</p>
                      </div>
                    </div>

                    {/* Time required to grow/harvest */}
                    <div className="p-3.5 bg-slate-950 rounded-xl border border-blue-950 flex gap-3 h-20 items-center">
                      <div className="p-2 sm:p-2.5 bg-emerald-500/10 rounded-lg text-emerald-400">
                        <Clock className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Time to Harvest</p>
                        <p className="text-[11px] font-semibold text-white mt-0.5">{selectedCrop.requirements.timeToHarvest}</p>
                      </div>
                    </div>

                  </div>
                </div>

                <div className="h-px bg-blue-950/60" />

                {/* D3-based Line Chart for Crop Growth Progression */}
                <CropGrowthChart crop={selectedCrop} swahiliPreference={swahiliPreference} />

                <div className="h-px bg-blue-950/60" />

                {/* Major Crop Diseases Section */}
                {selectedCrop.diseases && selectedCrop.diseases.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
                      🔬 Major Crop Diseases ({selectedCrop.diseases.length})
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      {selectedCrop.diseases.map((disease, dIdx) => (
                        <div key={dIdx} className="p-4 bg-slate-950/80 rounded-xl border border-red-950/45 flex flex-col sm:flex-row gap-4 shadow-sm">
                          <div className="w-full sm:w-28 h-24 rounded-lg overflow-hidden shrink-0 border border-red-900/20 bg-slate-950">
                            <img
                              src={disease.image}
                              alt={disease.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-sm font-semibold text-red-400 font-display">{disease.name}</h4>
                            <p className="text-slate-300 text-xs leading-relaxed">{disease.harmDescription}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="h-px bg-blue-950/60" />

                {/* Variants List Section */}
                {selectedCrop.variants.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">Cultivated Sub-Variants ({selectedCrop.variants.length})</h3>
                      <span className="text-[10px] font-mono bg-blue-950 text-blue-300 border border-blue-900/40 px-2 py-0.5 rounded-full">Each with customized properties</span>
                    </div>

                    <div className="space-y-6">
                      {selectedCrop.variants.map((variant, idx) => (
                        <div key={idx} className="p-5 bg-slate-950/40 rounded-xl border border-blue-950/60 flex flex-col gap-4">
                          <div className="flex flex-col sm:flex-row gap-4">
                            <div className="w-full sm:w-28 h-28 rounded-xl overflow-hidden shrink-0 border border-blue-950 bg-slate-950">
                              <img
                                src={variant.image}
                                alt={variant.name}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="space-y-2 flex-grow">
                              <div className="flex items-start justify-between gap-2 flex-wrap">
                                <h4 className="text-sm font-semibold text-white font-display">{variant.name}</h4>
                                {variant.link && (
                                  <a
                                    href={variant.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[10px] font-mono font-medium text-blue-400 hover:text-blue-300 hover:underline bg-blue-950/60 px-2.5 py-1 rounded border border-blue-800/30 flex items-center gap-1 cursor-pointer"
                                  >
                                    Seed Manual ↗
                                  </a>
                                )}
                              </div>
                              <p className="text-slate-300 text-xs leading-relaxed">{variant.description}</p>
                              
                              {/* Display Custom Variables */}
                              {variant.variables && (
                                <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-blue-950/50">
                                  {Object.entries(variant.variables).map(([key, val]) => (
                                    <div key={key} className="bg-slate-950/70 p-2 rounded-lg border border-blue-950/30">
                                      <p className="text-[9px] font-mono uppercase text-slate-500 tracking-wider">
                                        {key.replace(/([A-Z])/g, ' $1').trim()}
                                      </p>
                                      <p className="text-[10px] font-semibold text-slate-200 mt-0.5">{val}</p>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Specific Variant Diseases */}
                          {variant.diseases && variant.diseases.length > 0 && (
                            <div className="mt-2 pt-3 border-t border-blue-950/40 space-y-2">
                              <p className="text-[10px] font-mono uppercase text-red-400/90 tracking-wider font-semibold">
                                🦠 Specific Diseases Affecting {variant.name}
                              </p>
                              <div className="grid grid-cols-1 gap-2.5">
                                {variant.diseases.map((vDisease, vdIdx) => (
                                  <div key={vdIdx} className="p-3 bg-slate-950 rounded-lg border border-red-950/30 flex gap-3 h-20 items-center">
                                    <div className="w-14 h-14 rounded overflow-hidden shrink-0 border border-red-900/15 bg-slate-950">
                                      <img
                                        src={vDisease.image}
                                        alt={vDisease.name}
                                        referrerPolicy="no-referrer"
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                    <div className="min-w-0 flex-grow">
                                      <h5 className="text-[11px] font-semibold text-red-300 truncate">{vDisease.name}</h5>
                                      <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5 leading-snug">{vDisease.harmDescription}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* Abel AI Assistant Quick Diagnostic Bar on Drawer bottom */}
              <div className="p-6 border-t border-blue-950/70 bg-slate-950/90 z-20 flex flex-col space-y-3.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-blue-400">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span className="font-semibold">Abel AI Microclimatic Analysis</span>
                  </div>
                  <span className="text-[9px] font-mono text-slate-400">Powered by Gemini 3.5 Flash</span>
                </div>
                
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Query the **Abel AI agronomist engine** specifically using the genetic profiles and thresholds of this crop under current variables.
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setAiPrompt(`Provide highly detailed regional advice, planting soil profiles, fertilization requirements, and common diseases specifically for ${selectedCrop.name} and its variants!`);
                      askAbelAI(selectedCrop);
                      setSelectedCrop(null);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 font-semibold px-4 py-2.5 rounded-xl text-xs text-white transition-all cursor-pointer shadow-lg"
                  >
                    Generate Specific Abel AI Advice
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      handleAddTask({
                        title: `Planting & Watering Plan: ${selectedCrop.name}`,
                        taskType: 'planting',
                        cropName: selectedCrop.name,
                        cropId: selectedCrop.id,
                        dueDate: new Date().toISOString().split('T')[0],
                        dueTime: '08:00',
                        frequency: 'once',
                        priority: 'high',
                        notes: `Follow agronomic recommendations for ${selectedCrop.name}: soil pH ${selectedCrop.requirements.soilPh}, water ${selectedCrop.requirements.waterMmPerSeason}.`
                      });
                      setActiveTab('tasks');
                      setSelectedCrop(null);
                    }}
                    className="flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 border border-blue-900/60 font-semibold px-3 py-2.5 rounded-xl text-xs text-slate-200 hover:text-white transition-all cursor-pointer shadow-md"
                    title={swahiliPreference ? "Weka ratiba ya zao hili" : "Add to Schedule Reminders"}
                  >
                    <CalendarClock className="w-3.5 h-3.5 text-blue-400" />
                    <span>{swahiliPreference ? 'Weka Ratiba' : 'Schedule'}</span>
                  </button>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* LEGAL & TERMS MODAL */}
      <LegalTermsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        swahiliPreference={swahiliPreference}
        initialTab={initialTermsTab}
      />

      {/* FARM LOCATION SELECTOR & GPS MODAL */}
      <LocationModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        currentLocation={selectedLocation}
        onSelectLocation={(loc) => setSelectedLocation(loc)}
        swahiliPreference={swahiliPreference}
      />

    </div>
  );
}
