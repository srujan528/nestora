'use client';

import { useQuery } from '@tanstack/react-query';
import { useTRPC } from '@/lib/trpc';
import { useAuth } from '@/hooks/use-auth';
import { HiShieldCheck, HiUsers, HiBuildingOffice2, HiExclamationTriangle, HiCheckCircle } from 'react-icons/hi2';
import Link from 'next/link';

export default function AdminFoundationPage() {
  const { user } = useAuth();
  const trpc = useTRPC();

  const overviewQuery = useQuery(trpc.admin.getOverview.queryOptions());
  const usersQuery = useQuery(trpc.admin.listUsers.queryOptions());
  const listingsQuery = useQuery(trpc.admin.listListings.queryOptions());

  if (user && user.role !== 'ADMIN') {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-2xl border border-rose-200 text-center shadow-lg">
        <HiExclamationTriangle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900">Admin Access Required</h2>
        <p className="text-xs text-slate-500 mt-2">Only platform administrators can access the admin control panel.</p>
        <Link href="/" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold">
          Return to Student Search
        </Link>
      </div>
    );
  }

  const stats = overviewQuery.data;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded border border-amber-200">
              Admin Governance Center
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 mt-1 flex items-center gap-2">
              <HiShieldCheck className="w-6 h-6 text-amber-600" />
              Nestora Platform Overview
            </h1>
          </div>
        </div>

        {/* Stats Cards */}
        {overviewQuery.isLoading ? (
          <p className="text-xs text-slate-500">Loading admin statistics...</p>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs font-semibold text-slate-500">Total Users</span>
              <p className="text-2xl font-extrabold text-slate-900">{stats?.users.total}</p>
              <p className="text-[11px] text-slate-500 font-medium">Students: {stats?.users.students} | Owners: {stats?.users.owners}</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs font-semibold text-slate-500">Total PG Listings</span>
              <p className="text-2xl font-extrabold text-blue-700">{stats?.listings.total}</p>
              <p className="text-[11px] text-slate-500 font-medium">Real: {stats?.listings.real} | Demo: {stats?.listings.demo}</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs font-semibold text-slate-500">Verified Listings</span>
              <p className="text-2xl font-extrabold text-emerald-600">{stats?.listings.verified}</p>
              <p className="text-[11px] text-slate-500 font-medium">Official Badges Issued</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs font-semibold text-slate-500">Pending Verification</span>
              <p className="text-2xl font-extrabold text-amber-600">{stats?.listings.pendingVerification}</p>
              <p className="text-[11px] text-slate-500 font-medium">For Phase 6 Workflow</p>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <HiUsers className="w-5 h-5 text-blue-600" />
            <span>Platform Registered Users ({usersQuery.data?.length || 0})</span>
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b">
                <tr>
                  <th className="p-3">ID</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Created Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {usersQuery.data?.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">#{u.id}</td>
                    <td className="p-3">{u.name}</td>
                    <td className="p-3 text-slate-600">{u.email}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                        u.role === 'ADMIN' ? 'bg-amber-100 text-amber-800' : u.role === 'OWNER' ? 'bg-indigo-100 text-indigo-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* PG Listings Table */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <HiBuildingOffice2 className="w-5 h-5 text-blue-600" />
            <span>All PG Listings ({listingsQuery.data?.length || 0})</span>
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b">
                <tr>
                  <th className="p-3">ID</th>
                  <th className="p-3">PG Title</th>
                  <th className="p-3">Owner</th>
                  <th className="p-3">City</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {listingsQuery.data?.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">#{p.id}</td>
                    <td className="p-3 font-semibold text-slate-900">{p.title}</td>
                    <td className="p-3 text-slate-600">{p.owner.name}</td>
                    <td className="p-3">{p.city}</td>
                    <td className="p-3">
                      {p.isDemoData ? (
                        <span className="px-2 py-0.5 bg-amber-500 text-slate-950 text-[10px] font-extrabold rounded">DEMO</span>
                      ) : (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-extrabold rounded">REAL LISTING</span>
                      )}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-slate-100 text-slate-700">
                        {p.status}
                      </span>
                    </td>
                    <td className="p-3">
                      {p.isVerified ? (
                        <span className="text-emerald-600 font-bold flex items-center gap-1">
                          <HiCheckCircle className="w-3.5 h-3.5" /> Verified
                        </span>
                      ) : (
                        <span className="text-slate-500">Unverified</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
