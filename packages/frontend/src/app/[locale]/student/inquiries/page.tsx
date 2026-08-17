'use client';

import { useQuery } from '@tanstack/react-query';
import { useTRPC } from '@/lib/trpc';
import { useAuth } from '@/hooks/use-auth';
import { HiClipboardDocumentList, HiBuildingOffice2, HiExclamationTriangle, HiClock } from 'react-icons/hi2';
import Link from 'next/link';

export default function StudentInquiriesPage() {
  const { user } = useAuth();
  const trpc = useTRPC();

  const studentInquiriesQuery = useQuery(trpc.inquiries.getStudentInquiries.queryOptions());

  if (user && user.role !== 'STUDENT' && user.role !== 'ADMIN') {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-2xl border border-rose-200 text-center shadow-lg">
        <HiExclamationTriangle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900">Student Access Required</h2>
        <p className="text-xs text-slate-500 mt-2">Only registered students can view submitted PG inquiries.</p>
        <Link href="/" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold">
          Return to Student Search
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded">
              Student Workspace
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 mt-1 flex items-center gap-2">
              <HiClipboardDocumentList className="w-6 h-6 text-blue-600" />
              My Submitted Inquiries
            </h1>
          </div>
        </div>

        {studentInquiriesQuery.isLoading ? (
          <p className="text-xs text-slate-500 p-8 bg-white rounded-2xl">Loading your inquiries...</p>
        ) : studentInquiriesQuery.data?.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center max-w-md mx-auto">
            <HiClipboardDocumentList className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <h3 className="font-bold text-slate-800 text-sm">No Inquiries Submitted Yet</h3>
            <p className="text-xs text-slate-500 mt-1">Browse PGs and click "Contact Owner" to submit your first inquiry.</p>
            <Link href="/" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold">
              Browse Available PGs
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {studentInquiriesQuery.data?.map((inq) => (
              <div key={inq.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Link href={`/pg/${inq.pg.id}`} className="font-bold text-slate-900 text-base hover:text-blue-600">
                      {inq.pg.title}
                    </Link>
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                        inq.status === 'CONTACTED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : inq.status === 'CLOSED'
                          ? 'bg-slate-100 text-slate-700'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {inq.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 font-medium whitespace-pre-line">"{inq.message}"</p>

                  <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1 font-medium">
                    <span>Submitted: {new Date(inq.createdAt).toLocaleDateString()}</span>
                    <span>Preferred Room: <strong className="text-slate-800">{inq.preferredRoomType || 'Flexible'}</strong></span>
                  </div>
                </div>

                <Link
                  href={`/pg/${inq.pg.id}`}
                  className="px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs rounded-xl border border-blue-200 shrink-0"
                >
                  View PG Details
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
