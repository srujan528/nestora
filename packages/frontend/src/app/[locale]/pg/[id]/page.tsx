'use client';

import { use, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTRPC } from '@/lib/trpc';
import { useAuth } from '@/hooks/use-auth';
import Image from 'next/image';
import Link from 'next/link';
import {
  HiExclamationTriangle,
  HiStar,
  HiMapPin,
  HiCheckCircle,
  HiHeart,
  HiOutlineHeart,
  HiPaperAirplane,
  HiCalendarDays,
  HiClock,
  HiInformationCircle,
  HiUser,
  HiPhone,
  HiEnvelope,
  HiCalculator,
  HiAcademicCap,
  HiScale,
} from 'react-icons/hi2';

export default function PGDetailsPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const { id } = use(params);
  const pgId = Number(id);
  const trpc = useTRPC();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [activePhotoCategory, setActivePhotoCategory] = useState<string>('ALL');
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number>(0);
  const [isSaved, setIsSaved] = useState(false);
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [activeMenuDay, setActiveMenuDay] = useState<string>('monday');

  // Inquiry Form state
  const [inquiryMessage, setInquiryMessage] = useState('Hi, I am interested in visiting this PG for admission. Please let me know room availability.');
  const [inquiryRoomType, setInquiryRoomType] = useState<any>('DOUBLE_SHARING');
  const [inquiryMoveInDate, setInquiryMoveInDate] = useState('');
  const [inquirySuccess, setInquirySuccess] = useState(false);

  const pgQuery = useQuery(trpc.pgs.getById.queryOptions({ id: pgId }));
  const pg = pgQuery.data as any;

  const toggleSaveMutation = useMutation(
    trpc.savedPgs.toggle.mutationOptions({
      onSuccess: (data) => {
        setIsSaved(data.isSaved);
      },
    })
  );

  const createInquiryMutation = useMutation(
    trpc.inquiries.create.mutationOptions({
      onSuccess: () => {
        setInquirySuccess(true);
        setTimeout(() => {
          setShowInquiryModal(false);
          setInquirySuccess(false);
        }, 2000);
      },
    })
  );

  if (pgQuery.isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-8 space-y-6">
        <div className="h-64 bg-slate-200 animate-pulse rounded-2xl" />
        <div className="h-12 bg-slate-200 animate-pulse rounded-xl w-2/3" />
        <div className="h-40 bg-slate-200 animate-pulse rounded-xl" />
      </div>
    );
  }

  if (!pg) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white border rounded-2xl text-center shadow-lg">
        <h2 className="text-xl font-bold text-slate-800">PG Listing Not Found</h2>
        <p className="text-xs text-slate-500 mt-2">The accommodation listing you requested does not exist or has been removed.</p>
        <Link href="/" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl">
          Back to Find PGs
        </Link>
      </div>
    );
  }

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Please log in as a student to send inquiries.');
      return;
    }
    createInquiryMutation.mutate({
      pgId: pg.id,
      message: inquiryMessage,
      preferredRoomType: inquiryRoomType,
      moveInDate: inquiryMoveInDate || undefined,
    });
  };

  const filteredPhotos =
    activePhotoCategory === 'ALL'
      ? pg.photos
      : pg.photos.filter((p) => p.category === activePhotoCategory);

  const activePhoto = filteredPhotos[selectedPhotoIndex] || pg.photos[0];

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Demo Banner */}
      {pg.isDemoData && (
        <div className="bg-amber-500 text-slate-950 font-extrabold text-xs uppercase tracking-wider py-2 px-4 flex items-center justify-center gap-2 shadow-md">
          <HiExclamationTriangle className="w-4 h-4" />
          <span>DEMO LISTING (SEED DATA ONLY — NOT REAL CUSTOMER DATA)</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Header Title & Actions */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                {pg.genderRestriction === 'BOYS' ? 'Boys PG' : pg.genderRestriction === 'GIRLS' ? 'Girls PG' : 'Co-Ed PG'}
              </span>
              {pg.isVerified && (
                <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <HiCheckCircle className="w-4 h-4 text-emerald-600" /> Verified PG
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">{pg.title}</h1>

            <p className="text-xs sm:text-sm text-slate-600 mt-1 flex items-center gap-1.5 font-medium">
              <HiMapPin className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{pg.address}, {pg.locality}, {pg.city} — {pg.pincode}</span>
            </p>
          </div>

          {/* Price Card & Actions */}
          <div className="w-full md:w-auto flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
            <div className="text-left md:text-right">
              <span className="text-xs text-slate-500 font-medium">Monthly Rent Range</span>
              <p className="text-2xl font-extrabold text-blue-700">
                ₹{pg.minRent.toLocaleString()} – ₹{pg.maxRent.toLocaleString()}
                <span className="text-xs font-normal text-slate-500"> /mo</span>
              </p>
              <p className="text-[11px] text-slate-500 font-medium">Security Deposit: ₹{pg.securityDeposit.toLocaleString()}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => user ? toggleSaveMutation.mutate({ pgId: pg.id }) : alert('Please log in first.')}
                className="p-3 rounded-xl border border-slate-200 bg-white text-rose-500 hover:bg-rose-50 transition-all shadow-sm"
                title="Save PG"
              >
                {isSaved ? <HiHeart className="w-5 h-5 fill-current" /> : <HiOutlineHeart className="w-5 h-5 text-slate-600" />}
              </button>

              <button
                onClick={() => setShowInquiryModal(true)}
                className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-1.5 transition-all"
              >
                <HiPaperAirplane className="w-4 h-4" />
                <span>Contact Owner</span>
              </button>
            </div>
          </div>
        </div>

        {/* Photo Gallery with Categories */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between overflow-x-auto pb-2 gap-2 text-xs font-semibold border-b border-slate-100">
            {['ALL', 'ROOM', 'BATHROOM', 'KITCHEN', 'DINING', 'COMMON_AREA', 'EXTERIOR', 'BUILDING'].map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setActivePhotoCategory(cat);
                  setSelectedPhotoIndex(0);
                }}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                  activePhotoCategory === cat
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {cat.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Main Photo View */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 relative h-80 sm:h-96 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
              {activePhoto ? (
                <Image
                  src={activePhoto.url}
                  alt={activePhoto.caption || pg.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400 text-sm">No photo available</div>
              )}
              {activePhoto?.category && (
                <span className="absolute bottom-3 left-3 px-3 py-1 bg-black/70 text-white text-xs font-semibold rounded-lg backdrop-blur-sm">
                  {activePhoto.category}
                </span>
              )}
            </div>

            {/* Thumbnail Strip */}
            <div className="grid grid-cols-2 md:grid-cols-1 gap-2 max-h-96 overflow-y-auto pr-1">
              {filteredPhotos.map((photo, idx) => (
                <div
                  key={photo.id}
                  onClick={() => setSelectedPhotoIndex(idx)}
                  className={`relative h-24 rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                    selectedPhotoIndex === idx ? 'border-blue-600 ring-2 ring-blue-500/20' : 'border-transparent opacity-80 hover:opacity-100'
                  }`}
                >
                  <Image src={photo.url} alt={photo.caption || ''} fill className="object-cover" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Grid: Room Options & Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Rooms, Food Menu, House Rules, Reviews */}
          <div className="lg:col-span-2 space-y-6">
            {/* Room Options Table */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>Available Room Types</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-100">
                  {pg.rooms.length} Configured
                </span>
              </h2>

              <div className="space-y-3">
                {pg.rooms.map((room) => (
                  <div key={room.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-sm">{room.roomType.replace('_', ' ')}</h3>
                        {room.isAc && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded">AC Room</span>
                        )}
                        {room.hasAttachedBath && (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">Attached Bath</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Beds: <span className="font-semibold text-slate-800">{room.availableBeds} available</span> out of {room.totalBeds} total
                      </p>
                    </div>

                    <div className="text-left sm:text-right">
                      <p className="text-base font-extrabold text-blue-700">₹{room.monthlyRent.toLocaleString()} <span className="text-xs font-normal text-slate-500">/mo</span></p>
                      <p className="text-[11px] text-slate-500 font-medium">Deposit: ₹{room.securityDeposit.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly Food Menu */}
            {pg.weeklyMenu && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                <h2 className="text-lg font-bold text-slate-900 flex items-center justify-between">
                  <span>Weekly Mess Menu</span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {pg.foodType.replace('_', ' ')}
                  </span>
                </h2>

                {/* Day selector tabs */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs font-semibold border-b border-slate-100">
                  {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                    <button
                      key={day}
                      onClick={() => setActiveMenuDay(day)}
                      className={`px-3 py-1.5 rounded-lg capitalize whitespace-nowrap transition-all ${
                        activeMenuDay === day ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>

                {(() => {
                  const rawDayData = (pg.weeklyMenu as any)[activeMenuDay];
                  let parsedMenu: any = null;
                  if (rawDayData) {
                    try {
                      parsedMenu = typeof rawDayData === 'string' ? JSON.parse(rawDayData) : rawDayData;
                    } catch (e) {
                      parsedMenu = null;
                    }
                  }

                  if (parsedMenu && typeof parsedMenu === 'object' && (parsedMenu.breakfast || parsedMenu.lunch || parsedMenu.dinner)) {
                    return (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 shadow-sm space-y-1">
                          <span className="text-[10px] font-black text-amber-800 uppercase tracking-wider block">
                            🌅 Breakfast
                          </span>
                          <p className="text-xs font-bold text-slate-800 leading-snug">
                            {parsedMenu.breakfast || 'N/A'}
                          </p>
                        </div>

                        <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 shadow-sm space-y-1">
                          <span className="text-[10px] font-black text-emerald-800 uppercase tracking-wider block">
                            ☀️ Lunch
                          </span>
                          <p className="text-xs font-bold text-slate-800 leading-snug">
                            {parsedMenu.lunch || 'N/A'}
                          </p>
                        </div>

                        <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-200/80 shadow-sm space-y-1">
                          <span className="text-[10px] font-black text-indigo-800 uppercase tracking-wider block">
                            🌙 Dinner
                          </span>
                          <p className="text-xs font-bold text-slate-800 leading-snug">
                            {parsedMenu.dinner || 'N/A'}
                          </p>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                        {activeMenuDay} Meals Menu
                      </p>
                      <p className="text-sm font-medium text-slate-800 leading-relaxed whitespace-pre-line">
                        {rawDayData || 'Menu details available on request.'}
                      </p>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* House Rules & Attributes */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-slate-900">House Rules & Timings</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                  <HiClock className="w-5 h-5 text-blue-600 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-700">Curfew Time</span>
                    <p className="text-slate-900 font-semibold">{pg.curfewTime || 'No strict curfew'}</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                  <HiCalendarDays className="w-5 h-5 text-blue-600 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-700">Notice Period</span>
                    <p className="text-slate-900 font-semibold">{pg.noticePeriodDays} Days</p>
                  </div>
                </div>
              </div>

              {pg.houseRules && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <span className="font-bold text-slate-700 block mb-1">Rules & Policies</span>
                  <p className="text-slate-700 whitespace-pre-line font-medium">{pg.houseRules}</p>
                </div>
              )}
            </div>

            {/* Reviews Section */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">Student Reviews</h2>
                <div className="flex items-center gap-1 text-sm font-extrabold text-amber-500">
                  <HiStar className="w-5 h-5 fill-amber-400" />
                  <span>{pg.averageRating ? pg.averageRating.toFixed(1) : '4.5'}</span>
                  <span className="text-xs text-slate-500 font-normal">({pg.reviews.length} reviews)</span>
                </div>
              </div>

              {/* Category Scores */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-semibold text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>Cleanliness: <span className="text-blue-600 font-bold">{pg.cleanlinessScore || 4.5}/5</span></div>
                <div>Food Quality: <span className="text-blue-600 font-bold">{pg.foodScore || 4.5}/5</span></div>
                <div>Wi-Fi Speed: <span className="text-blue-600 font-bold">{pg.wifiScore || 4.5}/5</span></div>
                <div>Security: <span className="text-blue-600 font-bold">{pg.securityScore || 4.5}/5</span></div>
              </div>

              <div className="space-y-3">
                {pg.reviews.length === 0 ? (
                  <p className="text-xs text-slate-500 py-2">No student reviews posted yet.</p>
                ) : (
                  pg.reviews.map((r) => (
                    <div key={r.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1 text-xs">
                      <div className="flex items-center justify-between font-bold text-slate-900">
                        <span>{r.user.name}</span>
                        <span className="text-amber-500 flex items-center gap-1">
                          <HiStar className="w-4 h-4 fill-amber-400" /> {r.rating}/5
                        </span>
                      </div>
                      <p className="text-slate-700 leading-relaxed font-medium">{r.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Col: True Monthly Cost Calculator, Amenities & Owner Info Card */}
          <div className="space-y-6">
            {/* Prominent PG True Monthly Cost Calculator Card */}
            <div className="bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 text-white rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <HiCalculator className="w-5 h-5 text-amber-400" />
                  <h3 className="font-extrabold text-sm text-white uppercase tracking-wider">
                    True Monthly Cost Calculator
                  </h3>
                </div>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/30 font-bold">
                  All-Inclusive
                </span>
              </div>

              {/* Itemized Cost Breakdown */}
              <div className="space-y-2 text-xs font-medium text-slate-300">
                <div className="flex items-center justify-between">
                  <span>Base Rent (from):</span>
                  <span className="font-bold text-white">₹{pg.minRent?.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Food / Mess Charges:</span>
                  <span className="font-bold text-white">
                    {pg.foodIncludedInRent ? 'Included (₹0)' : `₹${pg.extraFoodCharges?.toLocaleString() || 0}`}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Est. Electricity:</span>
                  <span className="font-bold text-white">₹{pg.estElectricityMonthly || 800}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Est. Maintenance:</span>
                  <span className="font-bold text-white">₹{pg.estMaintenanceMonthly || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Est. Commute Cost:</span>
                  <span className="font-bold text-blue-300">
                    ₹{pg.commuteCostEstMonthly || 0} ({pg.commuteMode === 'DRIVING' ? 'Auto/Drive' : 'Walk'})
                  </span>
                </div>

                {/* Total True Monthly Cost */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="font-extrabold text-xs text-amber-300">Total True Monthly Cost</span>
                  <span className="text-xl font-black text-amber-300">
                    ₹{(pg.trueMonthlyCost || (pg.minRent + (pg.foodIncludedInRent ? 0 : (pg.extraFoodCharges || 0)) + (pg.estElectricityMonthly || 800) + (pg.commuteCostEstMonthly || 0))).toLocaleString()}
                    <span className="text-xs font-normal text-slate-300">/mo</span>
                  </span>
                </div>
              </div>

              {/* Simple College Hostel Reference Pill */}
              <div className="p-3 rounded-xl bg-blue-950/60 border border-blue-800/40 text-[11px] text-blue-200 flex items-center gap-2">
                <HiAcademicCap className="w-4 h-4 text-blue-400 shrink-0" />
                <span>
                  <strong>College Hostel Reference:</strong> ~₹1,20,000/yr (~₹10,000/mo inclusive of mess).
                </span>
              </div>
            </div>

            {/* Amenities Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-900">Included Amenities</h2>
              <div className="flex flex-wrap gap-2">
                {pg.amenities.map((a) => (
                  <span key={a.id} className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-800 text-xs font-semibold border border-blue-100">
                    {a.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Owner Info Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-900">Owner Information</h2>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                  <HiUser className="w-4 h-4 text-blue-600" />
                  <span>{pg.owner.name}</span>
                </div>
                {pg.owner.phone && (
                  <p className="text-slate-700 flex items-center gap-2 font-medium">
                    <HiPhone className="w-4 h-4 text-slate-400" />
                    <span>{pg.owner.phone}</span>
                  </p>
                )}
                <p className="text-slate-700 flex items-center gap-2 font-medium">
                  <HiEnvelope className="w-4 h-4 text-slate-400" />
                  <span>{pg.owner.email}</span>
                </p>
              </div>

              <button
                onClick={() => setShowInquiryModal(true)}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
              >
                Send Inquiry to Owner
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Inquiry Modal */}
      {showInquiryModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-slate-900">Contact Owner — {pg.title}</h3>
              <button onClick={() => setShowInquiryModal(false)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">
                ✕
              </button>
            </div>

            {inquirySuccess ? (
              <div className="p-6 bg-emerald-50 text-emerald-800 rounded-xl text-center font-bold text-sm">
                🎉 Inquiry sent successfully to owner! Check status under My Inquiries.
              </div>
            ) : (
              <form onSubmit={handleInquirySubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Preferred Room Type</label>
                  <select
                    value={inquiryRoomType}
                    onChange={(e) => setInquiryRoomType(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 font-medium"
                  >
                    <option value="SINGLE">Single Room</option>
                    <option value="DOUBLE_SHARING">Double Sharing</option>
                    <option value="TRIPLE_SHARING">Triple Sharing</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Expected Move-In Date</label>
                  <input
                    type="date"
                    value={inquiryMoveInDate}
                    onChange={(e) => setInquiryMoveInDate(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Message to Owner</label>
                  <textarea
                    rows={4}
                    value={inquiryMessage}
                    onChange={(e) => setInquiryMessage(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Write a message..."
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowInquiryModal(false)}
                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createInquiryMutation.isPending}
                    className="px-5 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-sm"
                  >
                    {createInquiryMutation.isPending ? 'Sending...' : 'Send Inquiry'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
