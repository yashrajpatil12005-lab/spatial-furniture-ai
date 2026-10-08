'use client';

import { useAuth } from '@/lib/firebase/AuthContext';

export default function AdminProfile() {
  const { user, userData } = useAuth();

  const name = userData?.name || user?.displayName || 'Administrator';
  const email = userData?.email || user?.email || 'N/A';
  const role = userData?.role || 'admin';
  const uid = user?.uid || userData?.uid || 'N/A';

  return (
    <div className="rounded-xl bg-[#141414] border border-[#27272A] p-6 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-[#27272A]">
        <div>
          <h2 className="text-base font-bold text-[#F5F5F5]">Admin Identity &amp; Session</h2>
          <p className="text-xs text-[#71717A] mt-0.5">
            Verified session credentials from Firebase Authentication
          </p>
        </div>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] mr-1.5"></span>
          Active Admin Session
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <div className="p-3.5 rounded-xl bg-[#0A0A0A] border border-[#27272A]">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#71717A]">
            Admin Name
          </span>
          <div className="text-xs font-semibold text-[#F5F5F5] mt-1 truncate">
            {name}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0A0A0A] border border-[#27272A]">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#71717A]">
            Email Address
          </span>
          <div className="text-xs font-semibold text-[#F5F5F5] mt-1 truncate font-mono">
            {email}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0A0A0A] border border-[#27272A]">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#71717A]">
            Assigned Role
          </span>
          <div className="mt-1 flex items-center gap-1.5">
            <span className="text-[11px] font-mono font-bold text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded border border-[#10B981]/30 uppercase">
              {role}
            </span>
            <span className="text-[10px] text-[#71717A]">(Read-Only)</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0A0A0A] border border-[#27272A]">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#71717A]">
            Firebase UID
          </span>
          <div className="text-xs font-mono text-[#A1A1AA] mt-1 truncate" title={uid}>
            {uid}
          </div>
        </div>
      </div>
    </div>
  );
}
