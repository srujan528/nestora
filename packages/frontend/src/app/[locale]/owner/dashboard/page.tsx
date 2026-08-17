'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTRPC } from '@/lib/trpc';
import { useAuth } from '@/hooks/use-auth';
import {
  HiPlus,
  HiPencilSquare,
  HiTrash,
  HiBuildingOffice2,
  HiClipboardDocumentList,
  HiPhoto,
  HiCalendar,
  HiTag,
  HiCheckCircle,
  HiExclamationTriangle,
  HiEye,
} from 'react-icons/hi2';
import Link from 'next/link';

export default function OwnerDashboardPage() {
  const { user } = useAuth();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'LISTINGS' | 'INQUIRIES'>('LISTINGS');

  // Modals state
  const [showPgModal, setShowPgModal] = useState(false);
  const [editingPg, setEditingPg] = useState<any>(null);

  const [showRoomModal, setShowRoomModal] = useState(false);
  const [targetPgForRoom, setTargetPgForRoom] = useState<any>(null);

  const [showMenuModal, setShowMenuModal] = useState(false);
  const [targetPgForMenu, setTargetPgForMenu] = useState<any>(null);

  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [targetPgForPhoto, setTargetPgForPhoto] = useState<any>(null);

  // Queries
  const ownerPgsQuery = useQuery(trpc.pgs.getOwnerListings.queryOptions());
  const ownerInquiriesQuery = useQuery(trpc.inquiries.getOwnerInquiries.queryOptions());

  // PG Form state
  const [pgTitle, setPgTitle] = useState('');
  const [pgCollegeId, setPgCollegeId] = useState(1);
  const [pgAddress, setPgAddress] = useState('');
  const [pgLocality, setPgLocality] = useState('');
  const [pgCity, setPgCity] = useState('');
  const [pgPincode, setPgPincode] = useState('');
  const [pgGender, setPgGender] = useState<'BOYS' | 'GIRLS' | 'CO_ED'>('CO_ED');
  const [pgMinRent, setPgMinRent] = useState(8000);
  const [pgMaxRent, setPgMaxRent] = useState(14000);
  const [pgDeposit, setPgDeposit] = useState(10000);
  const [pgFoodType, setPgFoodType] = useState<any>('VEG_ONLY');
  const [pgDescription, setPgDescription] = useState('');
  const [pgStatus, setPgStatus] = useState<'DRAFT' | 'PUBLISHED' | 'UNPUBLISHED'>('DRAFT');

  // Room Form state
  const [roomType, setRoomType] = useState<any>('DOUBLE_SHARING');
  const [roomRent, setRoomRent] = useState(8500);
  const [roomDeposit, setRoomDeposit] = useState(10000);
  const [roomIsAc, setRoomIsAc] = useState(false);
  const [roomHasAttachedBath, setRoomHasAttachedBath] = useState(false);
  const [roomTotalBeds, setRoomTotalBeds] = useState(4);
  const [roomAvailableBeds, setRoomAvailableBeds] = useState(2);

  // Menu Form state
  const [menuMonday, setMenuMonday] = useState('Breakfast: Poha, Tea\nLunch: Dal, Roti, Rice, Veggie\nDinner: Paneer, Chapati, Kheer');
  const [menuTuesday, setMenuTuesday] = useState('Breakfast: Idli Sambar\nLunch: Rajma Chawal, Aloo Gobhi\nDinner: Mix Veg, Roti, Rice');
  const [menuWednesday, setMenuWednesday] = useState('Breakfast: Paratha, Curd\nLunch: Chole Puri, Rice\nDinner: Veg Biryani, Raita');
  const [menuThursday, setMenuThursday] = useState('Breakfast: Upma, Coffee\nLunch: Kadi Pakoda, Rice\nDinner: Aloo Matar, Roti, Sweet');
  const [menuFriday, setMenuFriday] = useState('Breakfast: Bread Butter, Egg/Tea\nLunch: Veg Thali\nDinner: Special Veg Pulao, Gulab Jamun');
  const [menuSaturday, setMenuSaturday] = useState('Breakfast: Aloo Paratha\nLunch: Dal Fry, Jeera Rice\nDinner: Sev Bhaji, Chapati');
  const [menuSunday, setMenuSunday] = useState('Breakfast: Puri Bhaji\nLunch: Special Sunday Thali\nDinner: Light Khichdi/Soup');

  // Photo Form state
  const [photoUrl, setPhotoUrl] = useState('/uploads/demo/du_boys_room.jpg');
  const [photoCategory, setPhotoCategory] = useState<any>('ROOM');
  const [photoCaption, setPhotoCaption] = useState('Spacious Student Room');

  // Mutations
  const createPgMutation = useMutation(
    trpc.pgs.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [['pgs', 'getOwnerListings']] });
        setShowPgModal(false);
        resetPgForm();
      },
    })
  );

  const updatePgStatusMutation = useMutation(
    trpc.pgs.updateStatus.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [['pgs', 'getOwnerListings']] });
      },
    })
  );

  const createRoomMutation = useMutation(
    trpc.rooms.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [['pgs', 'getOwnerListings']] });
        setShowRoomModal(false);
      },
    })
  );

  const upsertMenuMutation = useMutation(
    trpc.weeklyMenu.upsert.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [['pgs', 'getOwnerListings']] });
        setShowMenuModal(false);
      },
    })
  );

  const addPhotoMutation = useMutation(
    trpc.photos.add.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [['pgs', 'getOwnerListings']] });
        setShowPhotoModal(false);
      },
    })
  );

  const updateInquiryStatusMutation = useMutation(
    trpc.inquiries.updateStatus.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [['inquiries', 'getOwnerInquiries']] });
      },
    })
  );

  if (user && user.role !== 'OWNER' && user.role !== 'ADMIN') {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-2xl border border-rose-200 text-center shadow-lg">
        <HiExclamationTriangle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900">Owner Access Required</h2>
        <p className="text-xs text-slate-500 mt-2">You are currently logged in as a Student. Only registered PG Owners can access this dashboard.</p>
        <Link href="/" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold">
          Return to Student Search
        </Link>
      </div>
    );
  }

  const resetPgForm = () => {
    setPgTitle('');
    setPgCollegeId(1);
    setPgAddress('');
    setPgLocality('');
    setPgCity('');
    setPgPincode('');
    setPgGender('CO_ED');
    setPgMinRent(8000);
    setPgMaxRent(14000);
    setPgDeposit(10000);
    setPgFoodType('VEG_ONLY');
    setPgDescription('');
    setPgStatus('DRAFT');
    setEditingPg(null);
  };

  const handleSavePg = (e: React.FormEvent) => {
    e.preventDefault();
    createPgMutation.mutate({
      title: pgTitle,
      collegeId: Number(pgCollegeId),
      address: pgAddress,
      locality: pgLocality,
      city: pgCity,
      pincode: pgPincode,
      genderRestriction: pgGender,
      minRent: Number(pgMinRent),
      maxRent: Number(pgMaxRent),
      securityDeposit: Number(pgDeposit),
      foodType: pgFoodType,
      description: pgDescription,
      status: pgStatus,
    });
  };

  const handleAddRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetPgForRoom) return;
    createRoomMutation.mutate({
      pgId: targetPgForRoom.id,
      roomType,
      monthlyRent: Number(roomRent),
      securityDeposit: Number(roomDeposit),
      isAc: roomIsAc,
      hasAttachedBath: roomHasAttachedBath,
      totalBeds: Number(roomTotalBeds),
      availableBeds: Number(roomAvailableBeds),
    });
  };

  const handleSaveMenu = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetPgForMenu) return;
    upsertMenuMutation.mutate({
      pgId: targetPgForMenu.id,
      monday: menuMonday,
      tuesday: menuTuesday,
      wednesday: menuWednesday,
      thursday: menuThursday,
      friday: menuFriday,
      saturday: menuSaturday,
      sunday: menuSunday,
    });
  };

  const handleAddPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetPgForPhoto) return;
    addPhotoMutation.mutate({
      pgId: targetPgForPhoto.id,
      url: photoUrl,
      category: photoCategory,
      caption: photoCaption,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Dashboard Title Bar */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-extrabold uppercase tracking-wider bg-indigo-100 text-indigo-800">
                PG Owner Control Center
              </span>
              <span className="text-xs text-slate-500 font-semibold">Welcome, {user?.name}</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 mt-1">Manage Your PG Listings & Bookings</h1>
          </div>

          <button
            onClick={() => {
              resetPgForm();
              setShowPgModal(true);
            }}
            className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-2 shrink-0 transition-all"
          >
            <HiPlus className="w-4 h-4" />
            <span>Post New PG Listing</span>
          </button>
        </div>

        {/* Dashboard Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab('LISTINGS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'LISTINGS'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <HiBuildingOffice2 className="w-4 h-4" />
            <span>My PG Listings ({ownerPgsQuery.data?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('INQUIRIES')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'INQUIRIES'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <HiClipboardDocumentList className="w-4 h-4" />
            <span>Incoming Student Inquiries ({ownerInquiriesQuery.data?.length || 0})</span>
          </button>
        </div>

        {/* TAB 1: PG LISTINGS */}
        {activeTab === 'LISTINGS' && (
          <div className="space-y-4">
            {ownerPgsQuery.isLoading ? (
              <div className="p-8 bg-white rounded-2xl animate-pulse text-center">Loading your PG listings...</div>
            ) : ownerPgsQuery.data?.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center max-w-md mx-auto">
                <HiBuildingOffice2 className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <h3 className="font-bold text-slate-800 text-sm">No PG Listings Posted Yet</h3>
                <p className="text-xs text-slate-500 mt-1">Post your first PG listing to start accepting student inquiries.</p>
                <button
                  onClick={() => setShowPgModal(true)}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white font-semibold text-xs rounded-xl"
                >
                  Create Listing
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {ownerPgsQuery.data?.map((pg) => (
                  <div
                    key={pg.id}
                    className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Status Badge */}
                        <span
                          className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                            pg.status === 'PUBLISHED'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : pg.status === 'DRAFT'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {pg.status}
                        </span>

                        {/* Demo Data Flag */}
                        {pg.isDemoData && (
                          <span className="px-2 py-0.5 bg-amber-500 text-slate-950 text-[10px] font-extrabold rounded">
                            DEMO LISTING
                          </span>
                        )}

                        {/* Verification Flag */}
                        {pg.isVerified ? (
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold rounded flex items-center gap-1">
                            <HiCheckCircle className="w-3 h-3 text-emerald-600" /> Verified
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-medium rounded">
                            Unverified (Pending Admin Review)
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-bold text-slate-900">{pg.title}</h3>
                      <p className="text-xs text-slate-500">
                        {pg.address}, {pg.locality}, {pg.city} — College: <span className="font-semibold text-slate-700">{pg.college.name}</span>
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-700 pt-1">
                        <span className="font-bold text-blue-700">₹{pg.minRent} - ₹{pg.maxRent} /mo</span>
                        <span>Rooms: <strong className="text-slate-900">{pg.rooms.length}</strong></span>
                        <span>Photos: <strong className="text-slate-900">{pg.photos.length}</strong></span>
                        <span>Inquiries: <strong className="text-slate-900">{pg.inquiries.length}</strong></span>
                      </div>
                    </div>

                    {/* Manage Sub-components Actions */}
                    <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                      <Link
                        href={`/pg/${pg.id}`}
                        target="_blank"
                        className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1"
                        title="Preview Public Page"
                      >
                        <HiEye className="w-4 h-4 text-blue-600" /> Preview
                      </Link>

                      <button
                        onClick={() => {
                          setTargetPgForRoom(pg);
                          setShowRoomModal(true);
                        }}
                        className="px-3 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-xs border border-blue-200"
                      >
                        + Rooms ({pg.rooms.length})
                      </button>

                      <button
                        onClick={() => {
                          setTargetPgForMenu(pg);
                          setShowMenuModal(true);
                        }}
                        className="px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-xs border border-emerald-200 flex items-center gap-1"
                      >
                        <HiCalendar className="w-3.5 h-3.5" /> Mess Menu
                      </button>

                      <button
                        onClick={() => {
                          setTargetPgForPhoto(pg);
                          setShowPhotoModal(true);
                        }}
                        className="px-3 py-2 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold text-xs border border-indigo-200 flex items-center gap-1"
                      >
                        <HiPhoto className="w-3.5 h-3.5" /> Photos ({pg.photos.length})
                      </button>

                      {/* Status Toggle Button */}
                      <button
                        onClick={() =>
                          updatePgStatusMutation.mutate({
                            id: pg.id,
                            status: pg.status === 'PUBLISHED' ? 'UNPUBLISHED' : 'PUBLISHED',
                          })
                        }
                        className={`px-3 py-2 rounded-xl font-bold text-xs transition-all ${
                          pg.status === 'PUBLISHED'
                            ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700'
                        }`}
                      >
                        {pg.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: INCOMING INQUIRIES */}
        {activeTab === 'INQUIRIES' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Student Inquiries Received</h2>

            {ownerInquiriesQuery.isLoading ? (
              <p className="text-xs text-slate-500">Loading inquiries...</p>
            ) : ownerInquiriesQuery.data?.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No student inquiries received yet.</p>
            ) : (
              <div className="space-y-3">
                {ownerInquiriesQuery.data?.map((inq) => (
                  <div key={inq.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{inq.user.name}</span>
                        <span className="text-slate-500">({inq.user.email} / {inq.user.phone || 'No phone'})</span>
                      </div>
                      <p className="text-blue-700 font-semibold">PG: {inq.pg.title}</p>
                      <p className="text-slate-700 font-medium whitespace-pre-line">"{inq.message}"</p>
                      <p className="text-[11px] text-slate-500">
                        Move-in: <strong className="text-slate-800">{inq.moveInDate ? new Date(inq.moveInDate).toLocaleDateString() : 'N/A'}</strong> | Room Preference: <strong className="text-slate-800">{inq.preferredRoomType || 'Flexible'}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-600">Status:</span>
                      <select
                        value={inq.status}
                        onChange={(e) => updateInquiryStatusMutation.mutate({ id: inq.id, status: e.target.value as any })}
                        className="p-2 rounded-lg border border-slate-300 font-semibold bg-white"
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="CONTACTED">CONTACTED</option>
                        <option value="CLOSED">CLOSED</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* CREATE PG MODAL */}
      {showPgModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-slate-900">Post New PG Listing</h3>
              <button onClick={() => setShowPgModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleSavePg} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">PG Name / Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Heights Student Living"
                  value={pgTitle}
                  onChange={(e) => setPgTitle(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nearest College</label>
                  <select
                    value={pgCollegeId}
                    onChange={(e) => setPgCollegeId(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg border border-slate-200 font-medium"
                  >
                    <option value={1}>Delhi University — North Campus</option>
                    <option value={2}>IIT Bombay — Powai</option>
                    <option value={3}>Christ University — Koramangala</option>
                    <option value={4}>VIT Vellore</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Gender Restriction</label>
                  <select
                    value={pgGender}
                    onChange={(e) => setPgGender(e.target.value as any)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 font-medium"
                  >
                    <option value="CO_ED">Co-Ed PG</option>
                    <option value="BOYS">Boys PG Only</option>
                    <option value="GIRLS">Girls PG Only</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Locality</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kamla Nagar"
                    value={pgLocality}
                    onChange={(e) => setPgLocality(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. New Delhi"
                    value={pgCity}
                    onChange={(e) => setPgCity(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Pincode</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 110007"
                    value={pgPincode}
                    onChange={(e) => setPgPincode(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Street Address</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 42 B, Block A, Kamla Nagar"
                  value={pgAddress}
                  onChange={(e) => setPgAddress(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 font-medium"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Min Rent (₹/mo)</label>
                  <input
                    type="number"
                    required
                    value={pgMinRent}
                    onChange={(e) => setPgMinRent(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg border border-slate-200 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Max Rent (₹/mo)</label>
                  <input
                    type="number"
                    required
                    value={pgMaxRent}
                    onChange={(e) => setPgMaxRent(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg border border-slate-200 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Deposit (₹)</label>
                  <input
                    type="number"
                    required
                    value={pgDeposit}
                    onChange={(e) => setPgDeposit(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg border border-slate-200 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">PG Description</label>
                <textarea
                  rows={3}
                  required
                  value={pgDescription}
                  onChange={(e) => setPgDescription(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 font-medium"
                  placeholder="Describe your PG facilities..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowPgModal(false)} className="px-4 py-2 rounded-xl text-slate-600 font-semibold">
                  Cancel
                </button>
                <button type="submit" disabled={createPgMutation.isPending} className="px-5 py-2 bg-blue-600 text-white font-bold rounded-xl shadow-sm">
                  {createPgMutation.isPending ? 'Saving...' : 'Save PG Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE ROOM MODAL */}
      {showRoomModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-slate-900">Add Room — {targetPgForRoom?.title}</h3>
              <button onClick={() => setShowRoomModal(false)} className="text-slate-400 font-bold">✕</button>
            </div>

            <form onSubmit={handleAddRoom} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Room Sharing Type</label>
                <select
                  value={roomType}
                  onChange={(e) => setRoomType(e.target.value as any)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 font-medium"
                >
                  <option value="SINGLE">Single Room</option>
                  <option value="DOUBLE_SHARING">Double Sharing</option>
                  <option value="TRIPLE_SHARING">Triple Sharing</option>
                  <option value="FOUR_SHARING">Four Sharing</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Monthly Rent (₹)</label>
                  <input type="number" value={roomRent} onChange={(e) => setRoomRent(Number(e.target.value))} className="w-full p-2.5 rounded-lg border border-slate-200" required />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Deposit (₹)</label>
                  <input type="number" value={roomDeposit} onChange={(e) => setRoomDeposit(Number(e.target.value))} className="w-full p-2.5 rounded-lg border border-slate-200" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Total Beds</label>
                  <input type="number" value={roomTotalBeds} onChange={(e) => setRoomTotalBeds(Number(e.target.value))} className="w-full p-2.5 rounded-lg border border-slate-200" required />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Available Beds</label>
                  <input type="number" value={roomAvailableBeds} onChange={(e) => setRoomAvailableBeds(Number(e.target.value))} className="w-full p-2.5 rounded-lg border border-slate-200" required />
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <label className="flex items-center gap-1.5 font-semibold text-slate-700">
                  <input type="checkbox" checked={roomIsAc} onChange={(e) => setRoomIsAc(e.target.checked)} />
                  <span>AC Room</span>
                </label>
                <label className="flex items-center gap-1.5 font-semibold text-slate-700">
                  <input type="checkbox" checked={roomHasAttachedBath} onChange={(e) => setRoomHasAttachedBath(e.target.checked)} />
                  <span>Attached Bath</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setShowRoomModal(false)} className="px-4 py-2 rounded-xl text-slate-600 font-semibold">Cancel</button>
                <button type="submit" disabled={createRoomMutation.isPending} className="px-5 py-2 bg-blue-600 text-white font-bold rounded-xl">Add Room</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MENU MODAL */}
      {showMenuModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-slate-900">Update Mess Menu — {targetPgForMenu?.title}</h3>
              <button onClick={() => setShowMenuModal(false)} className="text-slate-400 font-bold">✕</button>
            </div>

            <form onSubmit={handleSaveMenu} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Monday Menu</label>
                <textarea rows={2} value={menuMonday} onChange={(e) => setMenuMonday(e.target.value)} className="w-full p-2 rounded-lg border border-slate-200" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tuesday Menu</label>
                <textarea rows={2} value={menuTuesday} onChange={(e) => setMenuTuesday(e.target.value)} className="w-full p-2 rounded-lg border border-slate-200" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Wednesday Menu</label>
                <textarea rows={2} value={menuWednesday} onChange={(e) => setMenuWednesday(e.target.value)} className="w-full p-2 rounded-lg border border-slate-200" />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowMenuModal(false)} className="px-4 py-2 rounded-xl text-slate-600 font-semibold">Cancel</button>
                <button type="submit" disabled={upsertMenuMutation.isPending} className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-xl">Save Mess Menu</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD PHOTO MODAL */}
      {showPhotoModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-slate-900">Add Photo — {targetPgForPhoto?.title}</h3>
              <button onClick={() => setShowPhotoModal(false)} className="text-slate-400 font-bold">✕</button>
            </div>

            <form onSubmit={handleAddPhoto} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Photo Category</label>
                <select
                  value={photoCategory}
                  onChange={(e) => setPhotoCategory(e.target.value as any)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 font-medium"
                >
                  <option value="ROOM">Room</option>
                  <option value="BATHROOM">Bathroom</option>
                  <option value="KITCHEN">Kitchen</option>
                  <option value="DINING">Dining</option>
                  <option value="COMMON_AREA">Common Area</option>
                  <option value="EXTERIOR">Exterior</option>
                  <option value="BUILDING">Building</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Photo URL / Local Asset Path</label>
                <input
                  type="text"
                  required
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 font-medium"
                  placeholder="/uploads/demo/..."
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Caption (Optional)</label>
                <input
                  type="text"
                  value={photoCaption}
                  onChange={(e) => setPhotoCaption(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 font-medium"
                  placeholder="e.g. Spacious Bed"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowPhotoModal(false)} className="px-4 py-2 rounded-xl text-slate-600 font-semibold">Cancel</button>
                <button type="submit" disabled={addPhotoMutation.isPending} className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-xl">Add Photo</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
