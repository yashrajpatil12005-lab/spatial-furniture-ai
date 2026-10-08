'use client';

interface IntegrationsState {
  firebase: string;
  firestore: string;
  gemini: string;
  spatialComputing: string;
}

interface AdminIntegrationStatusProps {
  status: IntegrationsState | null;
  loading: boolean;
}

export default function AdminIntegrationStatus({
  status,
  loading,
}: AdminIntegrationStatusProps) {
  const integrations = [
    {
      name: 'Firebase Auth & SDK',
      category: 'Authentication',
      status: status?.firebase || 'Configured',
      statusDot: 'bg-[#10B981]',
      textColor: 'text-[#047857]',
      description: 'Client SDK initialization and user session token management',
    },
    {
      name: 'Cloud Firestore',
      category: 'Database',
      status: status?.firestore || 'Connected',
      statusDot: 'bg-[#10B981]',
      textColor: 'text-[#047857]',
      description: 'Authoritative product collection, schema, and security rules',
    },
    {
      name: 'Google Gemini AI',
      category: 'Intelligence',
      status: status?.gemini || (loading ? 'Checking...' : 'Not configured'),
      statusDot: status?.gemini === 'Configured' ? 'bg-[#10B981]' : 'bg-[#F59E0B]',
      textColor: status?.gemini === 'Configured' ? 'text-[#047857]' : 'text-[#B45309]',
      description: 'Gemini 2.5 Flash for multimodal room analysis & recommendations',
    },
    {
      name: 'AR / Spatial Computing',
      category: 'Augmented Reality',
      status: status?.spatialComputing || 'In Development',
      statusDot: 'bg-[#94A3B8]',
      textColor: 'text-[#64748B]',
      description: 'Unity AR Foundation mobile bridge & 3D model spatial preview pipeline',
    },
  ];

  return (
    <div className="rounded-2xl bg-white border border-[#E2E8F0] p-6 sm:p-8 card-shadow">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E2E8F0]">
        <div>
          <h2 className="text-base font-bold text-[#111827]">System Integrations</h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Core service configuration and environment indicators
          </p>
        </div>
        <span className="mt-2 sm:mt-0 text-[10px] font-semibold text-[#047857] bg-[#ECFDF5] px-3 py-1 rounded-full border border-[#A7F3D0]">
          Active System
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {integrations.map((item) => (
          <div
            key={item.name}
            className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] hover:border-slate-300 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
                  {item.category}
                </span>
                <h3 className="text-xs font-bold text-[#111827] mt-0.5">{item.name}</h3>
              </div>
              <span className={`inline-flex items-center text-xs font-semibold ${item.textColor}`}>
                <span className={`w-2 h-2 rounded-full mr-1.5 ${item.statusDot}`} />
                {loading ? 'Checking...' : item.status}
              </span>
            </div>
            <p className="text-xs text-[#475569] mt-2.5 leading-relaxed">{item.description}</p>
          </div>
        ))}
      </div>

      <p className="mt-4 text-[10px] text-[#64748B] italic">
        * Status indicators represent static environment configuration and connection states.
      </p>
    </div>
  );
}
