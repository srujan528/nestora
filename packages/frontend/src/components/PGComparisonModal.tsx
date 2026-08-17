'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  HiXMark,
  HiCheckCircle,
  HiExclamationTriangle,
  HiStar,
  HiMapPin,
  HiClock,
  HiUsers,
  HiCurrencyRupee,
  HiAcademicCap,
  HiBuildingOffice2,
  HiScale,
  HiCalculator,
} from 'react-icons/hi2';

export interface PGComparisonItem {
  id: number;
  title: string;
  minRent: number;
  maxRent: number;
  securityDeposit: number;
  foodIncludedInRent: boolean;
  extraFoodCharges?: number;
  estElectricityMonthly?: number;
  estMaintenanceMonthly?: number;
  foodType: string;
  mealOption: string;
  genderRestriction: string;
  isDemoData: boolean;
  isVerified: boolean;
  averageRating: number;
  reviewCount: number;
  distanceKm?: number;
  commuteTimeMins?: number;
  commuteMode?: string;
  commuteCostEstMonthly?: number;
  commuteFareFormula?: string;
  trueMonthlyCost?: number;
  trueMonthlyCostBreakdown?: {
    baseRent: number;
    foodCost: number;
    electricityCost: number;
    maintenanceCost: number;
    commuteCost: number;
    totalMonthlyCost: number;
  };
  college?: {
    id: number;
    name: string;
    city: string;
    hostel?: {
      annualFee: number;
      roomSharing: string;
    } | null;
  } | null;
  rooms?: Array<{
    id: number;
    roomType: string;
    monthlyRent: number;
    availableBeds: number;
    isAc: boolean;
  }>;
  photos?: Array<{
    id: number;
    url: string;
  }>;
  amenities?: Array<{
    id: number;
    name: string;
  }>;
}

interface PGComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  pgs: PGComparisonItem[];
  onRemovePg: (pgId: number) => void;
}

export default function PGComparisonModal({
  isOpen,
  onClose,
  pgs,
  onRemovePg,
}: PGComparisonModalProps) {
  if (!isOpen) return null;

  const collegeHostelFee = pgs[0]?.college?.hostel?.annualFee || 120000;
  const collegeHostelMonthly = Math.round(collegeHostelFee / 12);
  const collegeName = pgs[0]?.college?.name || 'Selected College';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-6xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Bar */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-amber-300 shadow-md">
              <HiScale className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white">
                Side-by-Side PG Cost & Accommodation Comparison
              </h2>
              <p className="text-slate-400 text-xs mt-0.5">
                Comparing {pgs.length} PGs relative to <span className="text-blue-300 font-semibold">{collegeName}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <HiXMark className="w-6 h-6" />
          </button>
        </div>

        {/* Optional College Hostel Fixed Reference Row Banner */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white px-6 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs border-b border-blue-800/60 shrink-0 gap-2">
          <div className="flex items-center gap-2">
            <HiAcademicCap className="w-5 h-5 text-amber-400 shrink-0" />
            <span>
              <strong className="text-amber-300 font-extrabold">{collegeName} Hostel Fixed Reference: </strong>
              Est. ₹{collegeHostelFee.toLocaleString()}/yr (~₹{collegeHostelMonthly.toLocaleString()}/mo inclusive of mess).
            </span>
          </div>
          <span className="text-[10px] text-slate-300 font-medium bg-blue-950/80 px-2.5 py-1 rounded-full border border-blue-400/30">
            Fixed Reference (Marketplace choices below)
          </span>
        </div>

        {/* Scrollable Comparison Table Body */}
        <div className="p-6 overflow-x-auto overflow-y-auto space-y-6">
          {pgs.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <HiBuildingOffice2 className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">No PGs selected for comparison</p>
              <p className="text-xs text-slate-500">Click "Compare" on any PG card to add it to this side-by-side view.</p>
            </div>
          ) : (
            <div className="min-w-[700px]">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="p-3 w-48 text-slate-500 font-extrabold uppercase text-[11px]">Feature / PG</th>
                    {pgs.map((pg) => {
                      const coverPhoto = pg.photos?.[0]?.url || '/uploads/demo/du_boys_room.jpg';
                      return (
                        <th key={pg.id} className="p-3 w-64 align-top">
                          <div className="relative rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 p-3 space-y-2">
                            <button
                              onClick={() => onRemovePg(pg.id)}
                              className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-slate-900/80 text-white flex items-center justify-center hover:bg-rose-600 transition-colors"
                              title="Remove from comparison"
                            >
                              ✕
                            </button>

                            <div className="relative h-28 w-full rounded-xl overflow-hidden">
                              <Image src={coverPhoto} alt={pg.title} fill className="object-cover" />
                              {pg.isDemoData && (
                                <span className="absolute bottom-1 left-1 bg-amber-500 text-slate-950 font-black text-[9px] px-1.5 py-0.5 rounded">
                                  DEMO
                                </span>
                              )}
                            </div>

                            <div>
                              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                                {pg.genderRestriction}
                              </span>
                              <h3 className="font-extrabold text-slate-900 text-sm mt-1 line-clamp-1">{pg.title}</h3>
                            </div>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {/* PROMINENT TRUE MONTHLY COST ROW */}
                  <tr className="bg-gradient-to-r from-amber-50 via-blue-50 to-indigo-50 font-bold">
                    <td className="p-3 text-slate-900 font-extrabold text-sm flex items-center gap-1">
                      <HiCalculator className="w-5 h-5 text-blue-600" />
                      <span>True Monthly Cost</span>
                    </td>
                    {pgs.map((pg) => {
                      const total =
                        pg.trueMonthlyCost ||
                        (pg.trueMonthlyCostBreakdown?.totalMonthlyCost) ||
                        (pg.minRent + (pg.estElectricityMonthly || 800) + (pg.commuteCostEstMonthly || 0));

                      return (
                        <td key={pg.id} className="p-3 text-slate-900">
                          <span className="text-lg font-black text-blue-700 block">
                            ₹{total.toLocaleString()}<span className="text-xs font-normal text-slate-500">/mo</span>
                          </span>
                          <span className="text-[10px] text-slate-600 font-medium block mt-0.5">
                            Rent + Food + Elec + Commute
                          </span>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Base Rent Row */}
                  <tr>
                    <td className="p-3 font-semibold text-slate-600">Base Monthly Rent</td>
                    {pgs.map((pg) => (
                      <td key={pg.id} className="p-3 font-bold text-slate-900">
                        ₹{pg.minRent.toLocaleString()} - ₹{pg.maxRent.toLocaleString()} / mo
                      </td>
                    ))}
                  </tr>

                  {/* Security Deposit Row */}
                  <tr>
                    <td className="p-3 font-semibold text-slate-600">Security Deposit</td>
                    {pgs.map((pg) => (
                      <td key={pg.id} className="p-3 font-medium text-slate-800">
                        ₹{pg.securityDeposit.toLocaleString()} (Refundable)
                      </td>
                    ))}
                  </tr>

                  {/* Distance & Commute Time Row */}
                  <tr>
                    <td className="p-3 font-semibold text-slate-600">Distance & Commute</td>
                    {pgs.map((pg) => (
                      <td key={pg.id} className="p-3 space-y-1">
                        <span className="font-bold text-blue-700 block flex items-center gap-1">
                          <HiMapPin className="w-3.5 h-3.5 text-blue-600" />
                          {pg.distanceKm || 1.2} km to College
                        </span>
                        <span className="text-[11px] text-slate-600 font-medium block flex items-center gap-1">
                          <HiClock className="w-3.5 h-3.5 text-slate-400" />
                          {pg.commuteTimeMins || 10} min ({pg.commuteMode === 'DRIVING' ? 'Drive' : 'Walk'})
                        </span>
                        {pg.commuteFareFormula && (
                          <span className="text-[10px] text-slate-500 italic block">
                            Fare: {pg.commuteFareFormula}
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Room Types & AC Row */}
                  <tr>
                    <td className="p-3 font-semibold text-slate-600">Room Sharing & AC</td>
                    {pgs.map((pg) => {
                      const roomTypesStr = Array.from(new Set(pg.rooms?.map((r) => r.roomType.replace('_', ' ')) || [])).join(', ') || 'Single, Double Sharing';
                      const hasAc = pg.rooms?.some((r) => r.isAc) ?? true;
                      return (
                        <td key={pg.id} className="p-3 space-y-1">
                          <span className="font-semibold text-slate-900 block">{roomTypesStr}</span>
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${hasAc ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                            {hasAc ? '❄️ AC Available' : 'Non-AC'}
                          </span>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Food & Mess Menu Row */}
                  <tr>
                    <td className="p-3 font-semibold text-slate-600">Food / Mess Option</td>
                    {pgs.map((pg) => (
                      <td key={pg.id} className="p-3 space-y-1">
                        <span className="font-semibold text-slate-900 block">
                          {pg.foodType === 'VEG_ONLY' ? '🥗 Pure Veg' : '🍗 Non-Veg Allowed'}
                        </span>
                        <span className="text-[11px] text-slate-600 block">
                          {pg.foodIncludedInRent ? 'Food included in rent' : `Extra food fee: ₹${pg.extraFoodCharges}/mo`}
                        </span>
                      </td>
                    ))}
                  </tr>

                  {/* Key Amenities Row */}
                  <tr>
                    <td className="p-3 font-semibold text-slate-600">Key Amenities</td>
                    {pgs.map((pg) => (
                      <td key={pg.id} className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {(pg.amenities || [
                            { id: 1, name: 'High-Speed Wi-Fi' },
                            { id: 2, name: 'Power Backup' },
                            { id: 3, name: 'Housekeeping' },
                          ]).map((a, i) => (
                            <span key={i} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium border border-slate-200">
                              {a.name}
                            </span>
                          ))}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Bed Availability Row */}
                  <tr>
                    <td className="p-3 font-semibold text-slate-600">Available Beds</td>
                    {pgs.map((pg) => {
                      const totalBeds = pg.rooms?.reduce((sum, r) => sum + r.availableBeds, 0) || 4;
                      return (
                        <td key={pg.id} className="p-3 font-extrabold text-emerald-700">
                          {totalBeds > 0 ? `🟢 ${totalBeds} Beds Ready` : '🔴 Contact for Availability'}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Rating & Reviews Row */}
                  <tr>
                    <td className="p-3 font-semibold text-slate-600">Student Rating</td>
                    {pgs.map((pg) => (
                      <td key={pg.id} className="p-3">
                        <div className="flex items-center gap-1 font-bold text-slate-900">
                          <HiStar className="w-4 h-4 text-amber-400 fill-current" />
                          <span>{pg.averageRating ? pg.averageRating.toFixed(1) : '4.5'}</span>
                          <span className="text-slate-500 font-normal">({pg.reviewCount || 1} reviews)</span>
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* CTA Action Row */}
                  <tr>
                    <td className="p-3 font-semibold text-slate-600">Action</td>
                    {pgs.map((pg) => (
                      <td key={pg.id} className="p-3">
                        <Link
                          href={`/pg/${pg.id}`}
                          onClick={onClose}
                          className="w-full inline-block text-center py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-sm"
                        >
                          View PG Details
                        </Link>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
