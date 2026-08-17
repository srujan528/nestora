'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTRPC } from '@/lib/trpc';
import PGCard from '@/components/PGCard';
import GoogleMapView from '@/components/GoogleMapView';
import PGComparisonModal from '@/components/PGComparisonModal';
import {
  HiMagnifyingGlass,
  HiFunnel,
  HiAcademicCap,
  HiBuildingOffice2,
  HiMap,
  HiListBullet,
  HiArrowPath,
  HiScale,
  HiXMark,
  HiSparkles,
  HiStar,
} from 'react-icons/hi2';
import { AIAssistantDrawer } from '@/components/AIAssistantDrawer';

export default function StudentMarketplaceHome() {
  const trpc = useTRPC();

  // Search & Filter State
  const [selectedCollegeId, setSelectedCollegeId] = useState<number>(5); // Default NMIT Yelahanka
  const [genderFilter, setGenderFilter] = useState<'BOYS' | 'GIRLS' | 'CO_ED' | undefined>(undefined);
  const [roomTypeFilter, setRoomTypeFilter] = useState<string | undefined>(undefined);
  const [foodFilter, setFoodFilter] = useState<'VEG_ONLY' | 'NON_VEG_ALLOWED' | undefined>(undefined);
  const [acOnly, setAcOnly] = useState(false);
  const [maxBudget, setMaxBudget] = useState<number>(20000);
  const [maxDistanceKm, setMaxDistanceKm] = useState<number>(10);
  const [searchQuery, setSearchQuery] = useState('');

  // Comparison State
  const [comparedPgIds, setComparedPgIds] = useState<number[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  // AI Assistant State
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);

  // Mobile View Switcher (List vs Map)
  const [mobileView, setMobileView] = useState<'LIST' | 'MAP'>('LIST');

  // Interactive Card <-> Marker Synergy
  const [selectedPgId, setSelectedPgId] = useState<number | null>(null);
  const [hoveredPgId, setHoveredPgId] = useState<number | null>(null);

  // Queries
  const collegesQuery = useQuery(trpc.colleges.list.queryOptions());
  const pgsQuery = useQuery(
    trpc.pgs.list.queryOptions({
      collegeId: selectedCollegeId,
      genderRestriction: genderFilter,
      roomType: roomTypeFilter as any,
      foodType: foodFilter,
      acRequired: acOnly,
      maxRent: maxBudget,
      maxDistanceKm: maxDistanceKm,
      search: searchQuery || undefined,
      page: 1,
      pageSize: 50,
    })
  );

  const colleges = collegesQuery.data || [
    { id: 5, name: 'Nitte Meenakshi Institute of Technology (NMIT) — Yelahanka', city: 'Bengaluru', latitude: 13.1294, longitude: 77.5879 },
    { id: 1, name: 'Delhi University — North Campus', city: 'New Delhi', latitude: 28.6904, longitude: 77.2066 },
    { id: 2, name: 'IIT Bombay — Powai', city: 'Mumbai', latitude: 19.1334, longitude: 72.9133 },
    { id: 3, name: 'Christ University — Koramangala', city: 'Bengaluru', latitude: 12.9344, longitude: 77.6060 },
    { id: 4, name: 'VIT Vellore', city: 'Vellore', latitude: 12.9692, longitude: 79.1559 },
  ];

  const selectedCollegeObj = colleges.find((c) => c.id === selectedCollegeId) || colleges[0];
  const pgsList = pgsQuery.data?.pgs || [];

  const comparedPgsList = pgsList.filter((pg: any) => comparedPgIds.includes(pg.id));

  const handleToggleCompare = (pgId: number) => {
    if (comparedPgIds.includes(pgId)) {
      setComparedPgIds(comparedPgIds.filter((id) => id !== pgId));
    } else {
      if (comparedPgIds.length >= 4) {
        alert('You can compare up to 4 PGs at a time.');
        return;
      }
      setComparedPgIds([...comparedPgIds, pgId]);
    }
  };

  const handleSelectPgFromMap = (pgId: number) => {
    setSelectedPgId(pgId);
    const cardEl = document.getElementById(`pg-card-${pgId}`);
    if (cardEl) {
      cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Top Hero Header */}
      <section className="bg-gradient-to-b from-blue-950 via-indigo-950 to-slate-900 text-white pt-8 pb-10 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/30 backdrop-blur-sm">
                <HiAcademicCap className="w-4 h-4 text-blue-400" />
                Phase 4 — AI-Powered Multi-Agent Accommodation Engine
              </span>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mt-2 leading-tight flex flex-wrap items-center gap-3">
                <span>Find & Compare Perfect PGs Near Your College</span>
                <button
                  onClick={() => setIsAiDrawerOpen(true)}
                  className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500 via-indigo-600 to-blue-600 text-white font-extrabold text-xs shadow-lg hover:brightness-110 transition-all flex items-center gap-1.5 border border-amber-300/40"
                >
                  <HiSparkles className="w-4 h-4 text-amber-200 animate-pulse" />
                  <span>Nestora AI Assistant</span>
                </button>
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
                Compare verified base rent, electricity, food, commute costs, sharing options, and total true monthly expenses.
              </p>
            </div>

            {/* College Selection Dropdown */}
            <div className="w-full md:w-auto bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 space-y-1">
              <label className="block text-[11px] font-bold text-blue-300 uppercase tracking-wider">
                Select Target College:
              </label>
              <select
                value={selectedCollegeId}
                onChange={(e) => {
                  const newId = Number(e.target.value);
                  setSelectedCollegeId(newId);
                  setSelectedPgId(null);
                  setComparedPgIds([]);
                }}
                className="w-full md:w-72 bg-slate-900 text-white font-bold text-xs p-2.5 rounded-xl border border-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer"
              >
                {colleges.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.city})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Search Input */}
          <div className="bg-white rounded-2xl p-2 shadow-xl flex items-center gap-2 text-slate-800 border border-slate-200">
            <HiMagnifyingGlass className="w-5 h-5 text-slate-400 ml-2 shrink-0" />
            <input
              type="text"
              placeholder="Search by PG name, locality, or landmark (e.g. Kamla Nagar, Powai, Koramangala)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs font-medium bg-transparent focus:outline-none placeholder:text-slate-400 py-2"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-xs text-slate-400 hover:text-slate-600 font-bold px-2">
                ✕
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Main Filter & Discovery Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Comprehensive Filters Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
              <HiFunnel className="w-4 h-4 text-blue-600" />
              <span>Search Filters</span>
            </div>

            <button
              onClick={() => {
                setGenderFilter(undefined);
                setRoomTypeFilter(undefined);
                setFoodFilter(undefined);
                setAcOnly(false);
                setMaxBudget(20000);
                setMaxDistanceKm(10);
                setSearchQuery('');
              }}
              className="text-[11px] text-blue-600 hover:underline font-bold flex items-center gap-1"
            >
              <HiArrowPath className="w-3.5 h-3.5" />
              <span>Reset All</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
            {/* Gender */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Gender</label>
              <select
                value={genderFilter || ''}
                onChange={(e) => setGenderFilter((e.target.value as any) || undefined)}
                className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Genders</option>
                <option value="BOYS">Boys Only</option>
                <option value="GIRLS">Girls Only</option>
                <option value="CO_ED">Co-Ed PG</option>
              </select>
            </div>

            {/* Room Type */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Room Sharing</label>
              <select
                value={roomTypeFilter || ''}
                onChange={(e) => setRoomTypeFilter(e.target.value || undefined)}
                className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Any Room Type</option>
                <option value="SINGLE">Single Room</option>
                <option value="DOUBLE_SHARING">Double Sharing</option>
                <option value="TRIPLE_SHARING">Triple Sharing</option>
                <option value="FOUR_SHARING">Four Sharing</option>
              </select>
            </div>

            {/* Food Preference */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Food Option</label>
              <select
                value={foodFilter || ''}
                onChange={(e) => setFoodFilter((e.target.value as any) || undefined)}
                className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Any Food</option>
                <option value="VEG_ONLY">Pure Veg Only</option>
                <option value="NON_VEG_ALLOWED">Non-Veg Allowed</option>
              </select>
            </div>

            {/* Max Distance */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Max Distance: <span className="text-blue-600 font-bold">{maxDistanceKm} km</span>
              </label>
              <input
                type="range"
                min="1"
                max="15"
                step="1"
                value={maxDistanceKm}
                onChange={(e) => setMaxDistanceKm(Number(e.target.value))}
                className="w-full accent-blue-600 mt-1"
              />
            </div>

            {/* Max Rent */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Max Rent: <span className="text-blue-600 font-bold">₹{maxBudget.toLocaleString()}</span>
              </label>
              <input
                type="range"
                min="5000"
                max="25000"
                step="500"
                value={maxBudget}
                onChange={(e) => setMaxBudget(Number(e.target.value))}
                className="w-full accent-blue-600 mt-1"
              />
            </div>

            {/* AC Filter Toggle */}
            <div className="flex items-center pt-4">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={acOnly}
                  onChange={(e) => setAcOnly(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <span>AC Required</span>
              </label>
            </div>
          </div>
        </div>

        {/* Split-Screen Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT PANE: PG Cards Grid (7 Cols on Desktop) */}
          <div className={`lg:col-span-7 space-y-4 ${mobileView === 'MAP' ? 'hidden lg:block' : 'block'}`}>
            <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-slate-200">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <HiBuildingOffice2 className="w-5 h-5 text-blue-600" />
                <span>Accommodations Near {selectedCollegeObj.name.split('—')[0]}</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-100">
                  {pgsQuery.data?.total || 0} listings
                </span>
              </h2>
            </div>

            {pgsQuery.isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-72 bg-slate-200 animate-pulse rounded-2xl" />
                ))}
              </div>
            ) : pgsList.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto">
                <HiAcademicCap className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-slate-800">No PGs found in this distance/budget range</h3>
                <p className="text-xs text-slate-500 mt-1">Try increasing the distance slider or resetting your filters.</p>
                <button
                  onClick={() => {
                    setMaxDistanceKm(15);
                    setMaxBudget(25000);
                    setGenderFilter(undefined);
                  }}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
                >
                  Expand Distance & Budget
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pgsList.map((pg: any) => (
                  <PGCard
                    key={pg.id}
                    {...pg}
                    isSelected={selectedPgId === pg.id}
                    isCompared={comparedPgIds.includes(pg.id)}
                    onToggleCompare={() => handleToggleCompare(pg.id)}
                    onMouseEnter={() => setHoveredPgId(pg.id)}
                    onMouseLeave={() => setHoveredPgId(null)}
                  />
                ))}
              </div>
            )}

            {/* What our residents say section matching Stanza UI */}
            <div className="mt-8 p-5 rounded-2xl bg-teal-50/60 border border-teal-100/80 shadow-sm">
              <h3 className="text-sm font-extrabold text-slate-900 mb-3 tracking-tight">
                What our residents say
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-white border border-teal-100 shadow-sm space-y-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shadow-sm">
                      R
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-900">Rasal Tech Vlog</h4>
                      <span className="text-[10px] text-slate-400 block">Newport House • 16 Aug 2026</span>
                    </div>
                  </div>
                  <div className="flex items-center text-amber-400 text-xs gap-0.5">
                    <HiStar className="fill-current" />
                    <HiStar className="fill-current" />
                    <HiStar className="fill-current" />
                    <HiStar className="fill-current" />
                    <HiStar className="fill-current" />
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    "Food quality and cleaning standards both add to a good stay. Overall service quality in food and cleaning is good."
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-teal-100 shadow-sm space-y-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center shadow-sm">
                      H
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-900">Hot Gaming</h4>
                      <span className="text-[10px] text-slate-400 block">Salta House • 16 Aug 2026</span>
                    </div>
                  </div>
                  <div className="flex items-center text-amber-400 text-xs gap-0.5">
                    <HiStar className="fill-current" />
                    <HiStar className="fill-current" />
                    <HiStar className="fill-current" />
                    <HiStar className="fill-current" />
                    <HiStar className="fill-current" />
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    "The upkeep of the place makes it feel warm and welcoming. Garbage is disposed of correctly and promptly. Bathrooms receive daily cleaning."
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-teal-100 shadow-sm space-y-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-teal-600 text-white font-extrabold text-xs flex items-center justify-center shadow-sm">
                      F
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-900">Fxzen</h4>
                      <span className="text-[10px] text-slate-400 block">Vernon House • 16 Aug 2026</span>
                    </div>
                  </div>
                  <div className="flex items-center text-amber-400 text-xs gap-0.5">
                    <HiStar className="fill-current" />
                    <HiStar className="fill-current" />
                    <HiStar className="fill-current" />
                    <HiStar className="fill-current" />
                    <HiStar className="fill-current" />
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    "The dining and common area is well coordinated. Positive standards maintained everywhere. High speed internet for gaming!"
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT PANE: Interactive Google Map (5 Cols on Desktop) */}
          <div className={`lg:col-span-5 lg:sticky lg:top-20 h-[calc(100vh-140px)] min-h-[450px] ${mobileView === 'LIST' ? 'hidden lg:block' : 'block'}`}>
            <GoogleMapView
              college={selectedCollegeObj}
              pgs={pgsList}
              selectedPgId={selectedPgId}
              hoveredPgId={hoveredPgId}
              onSelectPg={handleSelectPgFromMap}
              radiusKm={maxDistanceKm}
            />
          </div>
        </div>
      </div>

      {/* Floating PG Compare Bar */}
      {comparedPgIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 backdrop-blur-md text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-4 max-w-lg w-[90%] justify-between">
          <div className="flex items-center gap-2">
            <HiScale className="w-6 h-6 text-amber-400 shrink-0" />
            <div>
              <span className="font-extrabold text-xs text-white block">
                {comparedPgIds.length}/4 PGs Selected for Comparison
              </span>
              <span className="text-[10px] text-slate-300">Compare rent, food, commute & true cost</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCompareModalOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-indigo-600 text-white rounded-xl text-xs font-black shadow-md hover:brightness-110 transition-all"
            >
              Compare Side-by-Side
            </button>
            <button
              onClick={() => setComparedPgIds([])}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              title="Clear comparison list"
            >
              <HiXMark className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Side-by-Side PG Comparison Modal */}
      <PGComparisonModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        pgs={comparedPgsList}
        onRemovePg={handleToggleCompare}
      />

      {/* AI Assistant Slide-over Drawer */}
      <AIAssistantDrawer
        isOpen={isAiDrawerOpen}
        onClose={() => setIsAiDrawerOpen(false)}
        selectedCollegeId={selectedCollegeId}
      />

      {/* Desktop Floating AI Trigger Button */}
      <button
        onClick={() => setIsAiDrawerOpen(true)}
        className="hidden md:flex fixed bottom-6 right-6 z-40 px-4 py-3 rounded-full bg-gradient-to-r from-amber-500 via-indigo-600 to-blue-600 text-white font-extrabold text-xs shadow-2xl hover:scale-105 transition-all items-center gap-2 border border-amber-300/40 ring-4 ring-indigo-500/20"
      >
        <HiSparkles className="w-5 h-5 text-amber-200 animate-pulse" />
        <span>Ask Nestora AI</span>
      </button>

      {/* Mobile Fixed Bottom View Mode Switcher */}
      <div className="lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-slate-900/90 backdrop-blur-md text-white p-1.5 rounded-full shadow-2xl border border-slate-700 flex items-center gap-1">
        <button
          onClick={() => setMobileView('LIST')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
            mobileView === 'LIST' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-300 hover:bg-white/10'
          }`}
        >
          <HiListBullet className="w-4 h-4" />
          <span>List View ({pgsList.length})</span>
        </button>

        <button
          onClick={() => setMobileView('MAP')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
            mobileView === 'MAP' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-300 hover:bg-white/10'
          }`}
        >
          <HiMap className="w-4 h-4" />
          <span>Map View</span>
        </button>

        <button
          onClick={() => setIsAiDrawerOpen(true)}
          className="px-3 py-2 rounded-full text-xs font-bold bg-amber-500 text-slate-950 flex items-center gap-1 shadow-md"
        >
          <HiSparkles className="w-4 h-4" />
          <span>AI</span>
        </button>
      </div>
    </div>
  );
}