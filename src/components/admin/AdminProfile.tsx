'use client';

import { useAuth } from '@/lib/firebase/AuthContext';

export default function AdminProfile() {
  const { user, userData } = useAuth();

  const name = userData?.name || user?.displayName || 'Administrator';
  const email = userData?.email || user?.email || 'N/A';
  const role = userData?.role || 'admin';
  const uid = user?.uid || userData?.uid || 'N/A';

  return (
    <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-6 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-semibold text-white">Admin Identity &amp; Access</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Verified session credentials from Firebase Authentication
          </p>
        </div>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5"></span>
          Active Admin Session
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <div className="p-3.5 rounded-lg bg-slate-800/40 border border-slate-800">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
            Admin Name
          </span>
          <div className="text-sm font-semibold text-white mt-1 truncate">
            {name}
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-slate-800/40 border border-slate-800">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
            Email Address
          </span>
          <div className="text-sm font-semibold text-white mt-1 truncate font-mono text-xs">
            {email}
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-slate-800/40 border border-slate-800">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
            Assigned Role
          </span>
          <div className="mt-1 flex items-center gap-1.5">
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 uppercase">
              {role}
            </span>
            <span className="text-[10px] text-slate-500">(Read-Only)</span>
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-slate-800/40 border border-slate-800">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
            Firebase UID
          </span>
          <div className="text-xs font-mono text-slate-300 mt-1 truncate" title={uid}>
            {uid}
          </div>
        </div>
      </div>
    </div>
  );
}
