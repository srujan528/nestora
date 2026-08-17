'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import {
  HiHeart,
  HiOutlineHeart,
  HiStar,
  HiMapPin,
  HiCheckCircle,
  HiExclamationTriangle,
  HiUsers,
  HiSparkles,
  HiClock,
  HiCurrencyRupee,
  HiCalculator,
  HiScale,
} from 'react-icons/hi2';
import { useAuth } from '@/hooks/use-auth';
import { useTRPC } from '@/lib/trpc';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export interface PGCardProps {
  id: number;
  title: string;
  address: string;
  locality: string;
  city: string;
  minRent: number;
  maxRent: number;
  securityDeposit: number;
  genderRestriction: 'BOYS' | 'GIRLS' | 'CO_ED';
  foodType: 'VEG_ONLY' | 'NON_VEG_ALLOWED' | 'JAIN_AVAILABLE' | 'NO_FOOD';
  foodIncludedInRent: boolean;
  extraFoodCharges?: number;
  estElectricityMonthly?: number;
  averageRating: number;
  reviewCount: number;
  isDemoData: boolean;
  isVerified: boolean;
  status?: 'DRAFT' | 'PUBLISHED' | 'UNPUBLISHED';
  college?: {
    id: number;
    name: string;
    city: string;
  } | null;
  rooms?: Array<{
    id: number;
    roomType: string;
    monthlyRent: number;
    totalBeds: number;
    availableBeds: number;
    isAc: boolean;
  }>;
  photos?: Array<{
    id: number;
    url: string;
    category: string;
  }>;
  amenities?: Array<{
    id: number;
    name: string;
  }>;
  distanceKm?: number;
  commuteTimeMins?: number;
  commuteMode?: 'WALKING' | 'DRIVING' | 'TRANSIT';
  commuteCostEstMonthly?: number;
  commuteFareFormula?: string;
  trueMonthlyCost?: number;
  aiMatchScore?: number;
  isSavedInitial?: boolean;
  isSelected?: boolean;
  isCompared?: boolean;
  onToggleCompare?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export default function PGCard({
  id,
  title,
  address,
  locality,
  city,
  minRent,
  maxRent,
  securityDeposit,
  genderRestriction,
  foodType,
  foodIncludedInRent,
  extraFoodCharges = 0,
  estElectricityMonthly = 800,
  averageRating,
  reviewCount,
  isDemoData,
  isVerified,
  college,
  rooms = [],
  photos = [],
  amenities = [],
  distanceKm,
  commuteTimeMins,
  commuteMode,
  commuteCostEstMonthly = 0,
  commuteFareFormula,
  trueMonthlyCost,
  aiMatchScore = 92,
  isSavedInitial = false,
  isSelected = false,
  isCompared = false,
  onToggleCompare,
  onMouseEnter,
  onMouseLeave,
}: PGCardProps) {
  const [isSaved, setIsSaved] = useState(isSavedInitial);
  const { user } = useAuth();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const toggleSaveMutation = useMutation(
    trpc.savedPgs.toggle.mutationOptions({
      onSuccess: (data: any) => {
        setIsSaved(data.isSaved);
        queryClient.invalidateQueries({ queryKey: [['savedPgs', 'list']] });
      },
    })
  );

  const handleToggleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      alert('Please log in as a student to save PGs.');
      return;
    }
    (toggleSaveMutation.mutate as any)({ pgId: id });
  };

  const totalAvailableBeds = rooms.reduce((acc, r) => acc + r.availableBeds, 0);
  const coverPhoto = photos[0]?.url || '/uploads/demo/du_boys_room.jpg';

  const trueEstCost =
    trueMonthlyCost ||
    minRent + (foodIncludedInRent ? 0 : extraFoodCharges) + estElectricityMonthly + commuteCostEstMonthly;

  const genderBadgeColor =
    genderRestriction === 'GIRLS'
      ? 'bg-pink-100 text-pink-800 border-pink-200'
      : genderRestriction === 'BOYS'
      ? 'bg-blue-100 text-blue-800 border-blue-200'
      : 'bg-purple-100 text-purple-800 border-purple-200';

  const roomTypesSummary = Array.from(new Set(rooms.map(r => r.roomType.replace('_', ' ')))).join(', ') || 'Sharing & Single';

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      id={`pg-card-${id}`}
      className={`group relative bg-white rounded-2xl border transition-all duration-300 flex flex-col overflow-hidden ${
        isSelected
          ? 'border-blue-600 ring-2 ring-blue-500/30 shadow-xl scale-[1.01]'
          : 'border-slate-200 shadow-sm hover:shadow-lg'
      }`}
    >
      {/* Demo Tag Banner */}
      {isDemoData && (
        <div className="bg-amber-500 text-slate-950 font-extrabold text-[10px] uppercase tracking-wider py-0.5 px-3 flex items-center justify-center gap-1 z-20">
          <HiExclamationTriangle className="w-3.5 h-3.5" />
          <span>DEMO LISTING (SEED DATA)</span>
        </div>
      )}

      {/* Main Image Thumbnail */}
      <div className="relative w-full h-48 bg-slate-100 overflow-hidden">
        <Image
          src={coverPhoto}
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />

        {/* Top Badges & AI Score Placeholder */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
          <div className="flex items-center gap-1.5">
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border backdrop-blur-md shadow-sm ${genderBadgeColor}`}>
              {genderRestriction === 'BOYS' ? 'Boys PG' : genderRestriction === 'GIRLS' ? 'Girls PG' : 'Co-Ed PG'}
            </span>

            {/* AI Match Score Placeholder */}
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-gradient-to-r from-amber-500 to-indigo-600 text-white shadow-sm flex items-center gap-1">
              <HiSparkles className="w-3 h-3 text-amber-200 animate-pulse" />
              <span>{aiMatchScore}% Match</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Compare Checkbox Trigger */}
            {onToggleCompare && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onToggleCompare();
                }}
                className={`px-2 py-1 rounded-full text-[10px] font-bold transition-all shadow-md flex items-center gap-1 backdrop-blur-md ${
                  isCompared
                    ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-300'
                    : 'bg-slate-900/80 text-white hover:bg-slate-800'
                }`}
                title="Compare with other PGs"
              >
                <HiScale className="w-3.5 h-3.5" />
                <span>{isCompared ? 'Comparing' : 'Compare'}</span>
              </button>
            )}

            <button
              onClick={handleToggleSave}
              disabled={toggleSaveMutation.isPending}
              className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-md text-rose-500 flex items-center justify-center shadow-md hover:bg-white transition-all transform active:scale-95"
              title={isSaved ? 'Remove from Saved' : 'Save PG'}
            >
              {isSaved ? <HiHeart className="w-4 h-4 text-rose-500 fill-current" /> : <HiOutlineHeart className="w-4 h-4 text-slate-600" />}
            </button>
          </div>
        </div>

        {/* Bottom Image Overlay Info */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white z-10 flex items-end justify-between">
          <div>
            <div className="flex items-center gap-1 text-xs text-amber-300 font-semibold mb-0.5">
              <HiStar className="w-3.5 h-3.5 fill-amber-400" />
              <span>{averageRating ? averageRating.toFixed(1) : '4.5'}</span>
              <span className="text-white/80">({reviewCount || 1} reviews)</span>
            </div>
            {college && (
              <p className="text-[11px] font-medium text-white/90 flex items-center gap-1 truncate max-w-[180px]">
                <HiMapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>Near {college.name.split('—')[0]}</span>
              </p>
            )}
          </div>

          <div className="text-right">
            <span className="text-[10px] text-white/80 font-medium">Base Rent</span>
            <p className="text-base font-extrabold text-white">
              ₹{minRent.toLocaleString()}<span className="text-[10px] font-normal text-white/80">/mo</span>
            </p>
          </div>
        </div>
      </div>

      {/* Card Content Area */}
      <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2.5 text-xs">
        <div>
          <div className="flex items-start justify-between gap-1.5">
            <h3 className="font-bold text-slate-900 text-sm leading-snug group-hover:text-blue-600 transition-colors line-clamp-1">
              {title}
            </h3>
            {isVerified && !isDemoData && (
              <span className="shrink-0 flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                <HiCheckCircle className="w-3 h-3 text-emerald-600" /> Verified
              </span>
            )}
          </div>

          <p className="text-[11px] text-slate-500 mt-0.5 truncate">
            {locality}, {city}
          </p>

          {/* Prominent True Monthly Cost Box */}
          <div className="mt-2.5 p-2.5 rounded-xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between shadow-sm border border-blue-800/50">
            <div>
              <span className="text-[10px] uppercase font-black text-amber-300 tracking-wider flex items-center gap-1">
                <HiCalculator className="w-3.5 h-3.5 text-amber-400" />
                True Monthly Cost
              </span>
              <span className="text-[10px] text-slate-300 font-medium">Rent + Food + Elec + Commute</span>
            </div>
            <div className="text-right">
              <span className="text-base font-black text-amber-300">
                ₹{trueEstCost.toLocaleString()}
              </span>
              <span className="text-[10px] font-normal text-slate-300">/mo</span>
            </div>
          </div>

          {/* Distance & Commute Metrics */}
          {distanceKm !== undefined && (
            <div className="mt-2 p-2 rounded-xl bg-blue-50/70 border border-blue-100 flex items-center justify-between text-[11px] text-slate-800">
              <div className="flex items-center gap-1.5 font-semibold">
                <HiMapPin className="w-4 h-4 text-blue-600 shrink-0" />
                <span>{distanceKm} km to College</span>
              </div>

              {commuteTimeMins !== undefined && (
                <div className="flex items-center gap-1 font-bold text-blue-700">
                  <HiClock className="w-3.5 h-3.5" />
                  <span>{commuteTimeMins} min ({commuteMode === 'DRIVING' ? 'Drive' : commuteMode === 'TRANSIT' ? 'Transit' : 'Walk'})</span>
                </div>
              )}
            </div>
          )}

          {/* Room Sharing & Beds Open */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 truncate max-w-[160px]">
              {roomTypesSummary}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <HiUsers className="w-3 h-3" />
              {totalAvailableBeds > 0 ? `${totalAvailableBeds} Beds Open` : 'Rooms Open'}
            </span>
          </div>

          {/* Key Amenities Preview */}
          {amenities.length > 0 && (
            <div className="flex items-center gap-1 text-[11px] text-slate-600 mt-2">
              {amenities.slice(0, 3).map((a, i) => (
                <span key={i} className="text-[10px] font-medium text-slate-700 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                  {a.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons matching Stanza Living UI */}
        <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-100">
          <Link
            href={`/pg/${id}#visit`}
            className="py-2 px-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-[11px] uppercase tracking-wider text-center transition-all shadow-sm flex items-center justify-center"
          >
            Schedule A Visit
          </Link>

          <Link
            href={`/pg/${id}#contact`}
            className="py-2 px-2.5 rounded-xl border border-teal-600 text-teal-700 hover:bg-teal-50 font-extrabold text-[11px] uppercase tracking-wider text-center transition-all flex items-center justify-center"
          >
            Request Callback
          </Link>
        </div>

        {/* View Details Link */}
        <Link
          href={`/pg/${id}`}
          className="w-full text-[11px] font-bold text-slate-500 hover:text-blue-600 text-center transition-colors pt-1"
        >
          View Full Details & True Monthly Cost →
        </Link>
      </div>
    </div>
  );
}
