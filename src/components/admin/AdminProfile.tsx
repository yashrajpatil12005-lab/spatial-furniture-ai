'use client';

import { useAuth } from '@/lib/firebase/AuthContext';

export default function AdminProfile() {
  const { user, userData } = useAuth();

  const name = userData?.name || user?.displayName || 'Administrator';
  const email = userData?.email || user?.email || 'N/A';
  const role = userData?.role || 'admin';
  const uid = user?.uid || userData?.uid || 'N/A';

  return (
    <div className="rounded-2xl bg-white border border-[#E2E8F0] p-6 sm:p-8 card-shadow">
      <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0]">
        <div>
          <h2 className="text-base font-bold text-[#111827]">Admin Identity &amp; Session</h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Verified session credentials from Firebase Authentication
          </p>
        </div>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]">
          <span className="w-2 h-2 rounded-full bg-[#10B981] mr-1.5"></span>
          Active Admin Session
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
            Admin Name
          </span>
          <div className="text-xs font-bold text-[#111827] mt-1 truncate">
            {name}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
            Email Address
          </span>
          <div className="text-xs font-bold text-[#111827] mt-1 truncate font-mono">
            {email}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
            Assigned Role
          </span>
          <div className="mt-1 flex items-center gap-1.5">
            <span className="text-[11px] font-mono font-bold text-[#047857] bg-[#ECFDF5] px-2.5 py-0.5 rounded-full border border-[#A7F3D0] uppercase">
              {role}
            </span>
            <span className="text-[10px] text-[#64748B]">(Read-Only)</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
            Firebase UID
          </span>
          <div className="text-xs font-mono text-[#475569] mt-1 truncate" title={uid}>
            {uid}
          </div>
        </div>
      </div>
    </div>
  );
}
