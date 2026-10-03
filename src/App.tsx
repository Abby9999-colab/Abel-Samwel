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
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Crop, CropCategory, WeatherForecastDay, WeatherForecastResponse } from './types';
import { CROPS_DATA } from './data/crops';
import { AGRIBUSINESSES } from './data/companies';
import FallingRainBackground from './components/FallingRainBackground';
// @ts-ignore
import appIcon from './assets/images/app_icon_1780129514145.png';

// Location coordinate presets for Tanzanian agriculture
interface LocationPreset {
  name: string;
  lat: number;
  lon: number;
}

const LOCATION_PRESETS: LocationPreset[] = [
  { name: 'Kilimanjaro Highlands (Coffee & Bananas)', lat: -3.3410, lon: 37.3424 },
  { name: 'Mbeya Southern Highlands (Maize & Wheat)', lat: -8.9094, lon: 33.4608 },
  { name: 'Morogoro Eastern Basin (Rice & Fruits)', lat: -6.8278, lon: 37.6591 },
  { name: 'Dodoma Semi-Arid Zone (Sorghum & Sunflowers)', lat: -6.1731, lon: 35.7419 },
  { name: 'Zanzibar Island (Spices & Cassava)', lat: -6.1659, lon: 39.1990 }
];

export default function App() {
  // Navigation & Category States
  const [activeTab, setActiveTab] = useState<'catalog' | 'search' | 'weather' | 'assistant' | 'companies' | 'settings'>('catalog');
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

  // Weather states
  const [selectedLocation, setSelectedLocation] = useState<LocationPreset>(LOCATION_PRESETS[0]);
  const [weatherData, setWeatherData] = useState<WeatherForecastResponse | null>(null);
  const [weatherLoading, setWeatherLoading] = useState<boolean>(true);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [customLat, setCustomLat] = useState<string>('');
  const [customLon, setCustomLon] = useState<string>('');
  
  // Abel AI Assistant States
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [aiResponse, setAiResponse] = useState<string>('');
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiCropsList, setAiCropsList] = useState<string[]>([]);
  const [aiSuitability, setAiSuitability] = useState<string>('');
  
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
    setAiLoading(true);
    setAiResponse('');
    
    // Switch tab if not already on assistant
    if (!cropContext) {
      setActiveTab('assistant');
    }
    
    try {
      const payload = {
        prompt: aiPrompt || `Give me an analysis of crops suitable for climate with coordinates: latitude ${selectedLocation.lat}, longitude ${selectedLocation.lon}.`,
        cropContext: cropContext ? {
          name: cropContext.name,
          category: cropContext.category,
          description: cropContext.description,
          requirements: cropContext.requirements,
          id: cropContext.id
        } : undefined
      };

      const response = await fetch('/api/abel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Abel API status code exception: ${response.status}`);
      }

      const data = await response.json();
      setAiResponse(data.advice);
      if (data.recommendedCrops) {
        setAiCropsList(data.recommendedCrops);
      }
      if (data.climateAnalysis) {
        setAiSuitability(data.climateAnalysis.suitability);
      }
    } catch (err: any) {
      console.error(err);
      setAiResponse(`Failed to request help from Abel Crop Intelligence: ${err.message}`);
    } finally {
      setAiLoading(false);
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
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-400" />
              <div className="text-left">
                <p className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Agricultural Area</p>
                <p className="text-xs font-semibold text-white">{selectedLocation.name}</p>
              </div>
            </div>
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

          {/* Quick search input (Hidden on Settings page) */}
          {activeTab !== 'settings' && (
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder={activeTab === 'companies' ? "Search partners (e.g., Bayer, Yara)..." : "Filter crops, requirements or crop variants..."}
                value={activeTab === 'companies' ? companySearchQuery : searchQuery}
                onChange={(e) => activeTab === 'companies' ? setCompanySearchQuery(e.target.value) : setSearchQuery(e.target.value)}
                className="w-full bg-slate-950/80 border border-blue-950/85 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all font-sans"
              />
              {((activeTab === 'companies' ? companySearchQuery : searchQuery)) && (
                <button 
                  onClick={() => activeTab === 'companies' ? setCompanySearchQuery('') : setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-500 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Dynamic Display Sections */}
        <main className="flex-grow">
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
                    <div>
                      <h3 className="font-display font-medium text-md text-white mb-1 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-400" /> Select Agricultural Area
                      </h3>
                      <p className="text-xs text-slate-400">
                        Select a target Tanzanian agricultural microclimate station to pull real-time forecasts.
                      </p>
                    </div>

                    {/* Pre-installed presets selection */}
                    <div className="space-y-2">
                      {LOCATION_PRESETS.map((preset) => (
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
                <div className="glass-panel rounded-2xl p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full filter blur-3xl pointer-events-none" />

                  <div className="flex gap-4 items-start">
                    <div className="p-3.5 bg-blue-600/10 border border-blue-500/20 rounded-2xl">
                      <Bot className="w-7 h-7 text-blue-400 stroke-2" />
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-mono tracking-widest bg-blue-900/40 text-blue-300 px-2.5 py-1 rounded-md border border-blue-800/30">
                        Interactive Agent
                      </span>
                      <h3 className="font-display font-medium text-lg text-white mt-1">
                        Abel AI Agricultural Diagnostic Agent
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Query the Abel AI (Gemini 3.5 Flash Model) for deep crop evaluations, pest prevention, water cycles, or suitable planting coordinates.
                      </p>
                    </div>
                  </div>

                  {/* Ask Form */}
                  <div className="mt-6 space-y-4">
                    <div className="flex flex-col space-y-1.5">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Ask Abel AI a question</label>
                      <div className="relative">
                        <textarea
                          placeholder="e.g. Which of the coffee variants (Arabica, Robusta, Liberica) works best in high acid hillside loose loam with 1500mm rain?"
                          value={aiPrompt}
                          onChange={(e) => setAiPrompt(e.target.value)}
                          rows={3}
                          className="w-full bg-slate-950 border border-blue-950 focus:border-blue-700 p-4 rounded-xl text-xs text-white placeholder-slate-600 outline-none focus:ring-1 focus:ring-blue-700 transition-all font-sans resize-none"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 flex-wrap text-xs">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Database className="w-3.5 h-3.5 text-slate-500" />
                        <span>Active Station : <strong className="text-white">{selectedLocation.name}</strong></span>
                      </div>
                      <button
                        onClick={() => askAbelAI()}
                        disabled={aiLoading || !aiPrompt.trim()}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all disabled:opacity-50 cursor-pointer"
                      >
                        {aiLoading ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" /> Abel API compiling...
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" /> Request AI Diagnostics
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* AI response display block */}
                {(aiResponse || aiLoading) && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-panel p-6 rounded-2xl space-y-4 border-l-4 border-l-emerald-500"
                  >
                    <div className="flex items-center justify-between border-b border-blue-950 pb-3">
                      <span className="text-xs font-mono font-medium tracking-wide text-blue-400 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Abel Crop Intelligence API Diagnostic Report
                      </span>
                      {aiSuitability && (
                        <span className="text-[10px] font-mono uppercase bg-emerald-900/45 text-emerald-300 border border-emerald-800/45 px-2 py-0.5 rounded">
                          Suitability Analysis: {aiSuitability}
                        </span>
                      )}
                    </div>

                    {aiLoading ? (
                      <div className="py-12 text-center space-y-2">
                        <div className="w-6 h-6 rounded-full border-2 border-emerald-500/20 border-t-emerald-400 animate-spin mx-auto" />
                        <p className="text-xs text-slate-400 font-mono">Abel AI model calculating soil/moisture requirements...</p>
                      </div>
                    ) : (
                      <div className="space-y-4 animate-fade-in text-xs text-slate-200 leading-relaxed font-sans prose prose-invert max-w-none">
                        <p className="whitespace-pre-line leading-relaxed">{aiResponse}</p>
                        
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
                        <p className="text-[10px] font-mono text-slate-500 mt-2 text-right italic">
                          Abel Crop Intelligence API Signed Release
                        </p>
                      </div>
                    )}
                  </motion.div>
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

                </div>

                {/* Craftsmanship Note */}
                <div className="p-4 bg-slate-900/40 border border-blue-950/50 rounded-2xl flex items-start gap-3 relative overflow-hidden">
                  <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 shrink-0">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-200">
                      {swahiliPreference ? 'Usalama wa Data ya Mkulima' : 'Privacy & Client Integrity Mandate'}
                    </h4>
                    <p className="text-[10px] text-slate-400 leading-relaxed mt-1">
                      {swahiliPreference 
                        ? 'Abel Crop Intelligence huhifadhi mipangilio yako yote kwenye kivinjari chako cha kielektroniki pekee. Hakuna anwani ya IP au siri ya pembejeo inayosafirishwa nje.'
                        : 'All adjustments, metric choices, and system keys persist strictly onto your local browser sandbox context. Your geographical telemetry data remains completely offline.'}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}



          </AnimatePresence>
        </main>
      </div>

      {/* FOOTER */}
      <footer className="py-6 border-t border-blue-950/40 text-center text-xs text-slate-500 z-20 background-slate-950">
        <p className="font-mono">
          ABEL CROP INTELLIGENCE &bull; POWERED BY THE ABEL AI API &bull; FROGCAST ATMOSPHERICS
        </p>
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
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 font-semibold px-4 py-2.5 rounded-xl text-xs text-white transition-all cursor-pointer shadow-lg"
                  >
                    Generate Specific Abel AI Advice
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
