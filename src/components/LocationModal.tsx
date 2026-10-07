/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Navigation, 
  Search, 
  Check, 
  Compass, 
  Sliders, 
  CheckCircle2, 
  AlertCircle,
  Globe,
  Mountain
} from 'lucide-react';
import { LocationPreset } from '../types';

export const ALL_LOCATION_PRESETS: LocationPreset[] = [
  { 
    name: 'Kilimanjaro Highlands (Coffee & Bananas)', 
    lat: -3.3410, 
    lon: 37.3424,
    region: 'Northern Zone',
    description: 'Volcanic rich loam, 1200-1800m altitude. Premier Arabica coffee & banana belts.'
  },
  { 
    name: 'Mbeya Southern Highlands (Maize & Wheat)', 
    lat: -8.9094, 
    lon: 33.4608,
    region: 'Southern Highlands',
    description: 'Breadbasket region, high rainfall plateau. Cereals, potatoes, and tea plantations.'
  },
  { 
    name: 'Morogoro Eastern Basin (Rice & Fruits)', 
    lat: -6.8278, 
    lon: 37.6591,
    region: 'Eastern Zone',
    description: 'Fertile river valleys & tropical lowland. Kilombero paddy rice and citrus orchards.'
  },
  { 
    name: 'Dodoma Semi-Arid Zone (Sorghum & Sunflowers)', 
    lat: -6.1731, 
    lon: 35.7419,
    region: 'Central Zone',
    description: 'Drought-tolerant crops, viticulture grapes, sunflower oilseeds, and pearl millet.'
  },
  { 
    name: 'Zanzibar Island (Spices & Cassava)', 
    lat: -6.1659, 
    lon: 39.1990,
    region: 'Coastal / Islands',
    description: 'Tropical spice belt (cloves, vanilla, cinnamon) and coastal cassava varieties.'
  },
  { 
    name: 'Arusha Volcanic Slopes (Horticulture & Beans)', 
    lat: -3.3869, 
    lon: 36.6830,
    region: 'Northern Zone',
    description: 'Export-grade green beans, tomatoes, onions, and avocado orchards under Mount Meru.'
  },
  { 
    name: 'Iringa Southern Escarpment (Potatoes & Maize)', 
    lat: -7.7699, 
    lon: 35.6980,
    region: 'Southern Highlands',
    description: 'Cool elevated climate. Round potatoes, commercial timber, and commercial hybrid maize.'
  },
  { 
    name: 'Kagera Lake Basin (Robusta Coffee & Bananas)', 
    lat: -1.3267, 
    lon: 31.8124,
    region: 'Lake Victoria Zone',
    description: 'High humidity lake zone. Deep weathered soils supporting organic Robusta and plantains.'
  },
  { 
    name: 'Tanga Coastal Plains (Sisal & Coconuts)', 
    lat: -5.0743, 
    lon: 39.0988,
    region: 'Coastal Zone',
    description: 'Lowland maritime tropics. Sisal estates, coconuts, black pepper, and tropical fruit.'
  },
  { 
    name: 'Mtwara Southern Coast (Cashews & Sesame)', 
    lat: -10.2744, 
    lon: 40.1836,
    region: 'Southern Coast',
    description: 'Sandy coastal loam. Major Tanzanian cashew nut harvest belt and export oilseeds.'
  }
];

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation: LocationPreset;
  onSelectLocation: (loc: LocationPreset) => void;
  swahiliPreference: boolean;
}

export default function LocationModal({
  isOpen,
  onClose,
  currentLocation,
  onSelectLocation,
  swahiliPreference
}: LocationModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'presets' | 'custom'>('presets');
  
  // Custom coordinates state
  const [customName, setCustomName] = useState('');
  const [customLat, setCustomLat] = useState('');
  const [customLon, setCustomLon] = useState('');
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [geoSuccess, setGeoSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredPresets = ALL_LOCATION_PRESETS.filter(loc => 
    loc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (loc.region && loc.region.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (loc.description && loc.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(customLat);
    const lon = parseFloat(customLon);
    if (isNaN(lat) || isNaN(lon)) {
      setGeoError(swahiliPreference ? 'Tafadhali weka namba sahihi za latitudo na longitudo.' : 'Please enter valid numerical latitude and longitude.');
      return;
    }
    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      setGeoError(swahiliPreference ? 'Kuratibu ziko nje ya mipaka ya dunia.' : 'Coordinates outside valid Earth range.');
      return;
    }

    const name = customName.trim() || `Custom Farm [${lat.toFixed(3)}, ${lon.toFixed(3)}]`;
    const newLoc: LocationPreset = {
      name,
      lat,
      lon,
      region: 'Custom Location',
      description: `User-defined field coordinates: Lat ${lat.toFixed(4)}, Lon ${lon.toFixed(4)}`
    };
    onSelectLocation(newLoc);
    onClose();
  };

  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      setGeoError(swahiliPreference ? 'Kifaa chako hakiauni utambuzi wa GPS.' : 'Geolocation is not supported by your browser.');
      return;
    }

    setGeoLoading(true);
    setGeoError(null);
    setGeoSuccess(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        setCustomLat(lat.toFixed(4));
        setCustomLon(lon.toFixed(4));
        setCustomName(swahiliPreference ? `Shamba Langu la GPS [${lat.toFixed(2)}, ${lon.toFixed(2)}]` : `My GPS Farm [${lat.toFixed(2)}, ${lon.toFixed(2)}]`);
        setGeoLoading(false);
        setGeoSuccess(swahiliPreference ? 'GPS imetambuliwa kikamilifu!' : 'Current GPS location detected successfully!');
      },
      (err) => {
        setGeoLoading(false);
        setGeoError(err.message || (swahiliPreference ? 'Imeshindikana kupata GPS.' : 'Failed to retrieve GPS location.'));
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div 
        className="glass-panel w-full max-w-xl max-h-[90vh] rounded-3xl overflow-hidden border border-blue-900/60 shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-blue-950/80 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/20 border border-blue-500/30 rounded-xl text-blue-400">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-medium text-base text-white">
                {swahiliPreference ? 'Badilisha Eneo la Shamba' : 'Change Farm Location & Station'}
              </h3>
              <p className="text-xs text-slate-400">
                {swahiliPreference 
                  ? 'Rekebisha data ya hali ya hewa na ushauri wa AI kulingana na eneo lako.' 
                  : 'Calibrate Frogcast meteorological feeds and AI diagnostic recommendations.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle: Presets vs Custom Coordinates */}
        <div className="px-5 pt-4 pb-2 border-b border-blue-950/50 flex items-center gap-2 bg-slate-950/40">
          <button
            onClick={() => setActiveTab('presets')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'presets'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Mountain className="w-3.5 h-3.5" />
            {swahiliPreference ? 'Mikoa Maarufu ya Kilimo' : 'Tanzanian Farming Regions'}
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'custom'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            {swahiliPreference ? 'Weka Kuratibu / GPS Maalum' : 'Custom GPS / Coordinates'}
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'presets' ? (
            <>
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder={swahiliPreference ? "Tafuta eneo au zao (mfano: Kilimanjaro, Mbeya, Mahindi)..." : "Search region or crop (e.g. Mbeya, Morogoro, Coffee)..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-950 border border-blue-950/90 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-700"
                />
              </div>

              {/* Current Active Location Callout */}
              <div className="p-3 bg-blue-950/30 border border-blue-900/40 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-slate-300">
                    {swahiliPreference ? 'Eneo linalotumika sasa:' : 'Currently Active:'}{' '}
                    <strong className="text-white font-semibold">{currentLocation.name}</strong>
                  </span>
                </div>
                <span className="text-[10px] font-mono text-blue-400 bg-blue-950 px-2 py-0.5 rounded border border-blue-800/40 shrink-0">
                  {currentLocation.lat.toFixed(2)}°, {currentLocation.lon.toFixed(2)}°
                </span>
              </div>

              {/* Presets Grid */}
              <div className="space-y-2">
                {filteredPresets.map((loc, idx) => {
                  const isSelected = currentLocation.name === loc.name;
                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        onSelectLocation(loc);
                        onClose();
                      }}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-start justify-between gap-3 group ${
                        isSelected
                          ? 'bg-blue-600/20 border-blue-500 shadow-md ring-1 ring-blue-500'
                          : 'bg-slate-900/70 border-blue-950 hover:border-blue-800/80 hover:bg-slate-900'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-semibold text-white font-display group-hover:text-blue-300 transition-colors">
                            {loc.name}
                          </h4>
                          {loc.region && (
                            <span className="text-[9px] font-mono uppercase bg-slate-950 text-slate-400 px-1.5 py-0.5 rounded border border-slate-800">
                              {loc.region}
                            </span>
                          )}
                        </div>
                        {loc.description && (
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            {loc.description}
                          </p>
                        )}
                        <p className="text-[10px] font-mono text-slate-500">
                          Coordinates: Lat {loc.lat.toFixed(4)}, Lon {loc.lon.toFixed(4)}
                        </p>
                      </div>

                      <div className="shrink-0 pt-0.5">
                        {isSelected ? (
                          <span className="p-1 bg-blue-600 text-white rounded-lg flex items-center justify-center">
                            <Check className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <button
                            type="button"
                            className="px-2.5 py-1 bg-slate-950 border border-blue-900/40 text-[10px] font-mono text-blue-400 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors"
                          >
                            {swahiliPreference ? 'Chagua' : 'Select'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            /* Custom Coordinates Form */
            <form onSubmit={handleCustomSubmit} className="space-y-4">
              {/* GPS Auto-detect Button */}
              <div className="p-4 bg-slate-900/70 border border-blue-900/40 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-semibold text-white">
                      {swahiliPreference ? 'Utambuzi wa Moja kwa Moja wa GPS' : 'Automatic GPS Location Detection'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleDetectGPS}
                    disabled={geoLoading}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-emerald-950"
                  >
                    {geoLoading ? (
                      <span className="animate-spin w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full" />
                    ) : (
                      <Navigation className="w-3.5 h-3.5" />
                    )}
                    {swahiliPreference ? 'Tumia GPS Yangu' : 'Use My GPS'}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {swahiliPreference 
                    ? 'Bofya kitufe hiki kupata latitudo na longitudo halisi za shamba lako kwa kutumia kifaa chako.' 
                    : 'Pulls real-time GPS coordinates directly from your device to precisely customize local microclimate advisory.'}
                </p>

                {geoSuccess && (
                  <div className="p-2.5 bg-emerald-950/60 border border-emerald-800/60 rounded-xl text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{geoSuccess}</span>
                  </div>
                )}
                {geoError && (
                  <div className="p-2.5 bg-red-950/60 border border-red-800/60 rounded-xl text-red-300 text-xs flex items-center gap-2 animate-fade-in">
                    <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    <span>{geoError}</span>
                  </div>
                )}
              </div>

              {/* Manual Input Fields */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                    {swahiliPreference ? 'Jina la Shamba au Eneo:' : 'Farm / Location Name:'}
                  </label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="e.g. Shamba la Kaskazini (Moshi Mashariki)"
                    className="w-full bg-slate-950 border border-blue-950 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 outline-none focus:border-blue-700"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                      Latitude (-90 to +90):
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={customLat}
                      onChange={(e) => setCustomLat(e.target.value)}
                      placeholder="-3.3410"
                      required
                      className="w-full bg-slate-950 border border-blue-950 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 outline-none focus:border-blue-700 font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                      Longitude (-180 to +180):
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={customLon}
                      onChange={(e) => setCustomLon(e.target.value)}
                      placeholder="37.3424"
                      required
                      className="w-full bg-slate-950 border border-blue-950 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 outline-none focus:border-blue-700 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-blue-950 text-xs font-mono text-slate-400 hover:text-white cursor-pointer"
                >
                  {swahiliPreference ? 'Ghairi' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer shadow-lg shadow-blue-950"
                >
                  {swahiliPreference ? 'Hifadhi Eneo Jipya' : 'Save & Set Location'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
