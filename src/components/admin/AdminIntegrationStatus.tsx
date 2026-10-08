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
      textColor: 'text-[#10B981]',
      description: 'Client SDK initialization and user session token management',
    },
    {
      name: 'Cloud Firestore',
      category: 'Database',
      status: status?.firestore || 'Connected',
      statusDot: 'bg-[#10B981]',
      textColor: 'text-[#10B981]',
      description: 'Authoritative product collection, schema, and security rules',
    },
    {
      name: 'Google Gemini AI',
      category: 'Intelligence',
      status: status?.gemini || (loading ? 'Checking...' : 'Not configured'),
      statusDot: status?.gemini === 'Configured' ? 'bg-[#10B981]' : 'bg-[#F59E0B]',
      textColor: status?.gemini === 'Configured' ? 'text-[#10B981]' : 'text-amber-400',
      description: 'Gemini 2.5 Flash for multimodal room analysis & recommendations',
    },
    {
      name: 'AR / Spatial Computing',
      category: 'Augmented Reality',
      status: status?.spatialComputing || 'In Development',
      statusDot: 'bg-[#A1A1AA]',
      textColor: 'text-[#A1A1AA]',
      description: 'Unity AR Foundation mobile bridge & 3D model spatial preview pipeline',
    },
  ];

  return (
    <div className="rounded-xl bg-[#141414] border border-[#27272A] p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#27272A]">
        <div>
          <h2 className="text-base font-bold text-[#F5F5F5]">System Integrations</h2>
          <p className="text-xs text-[#71717A] mt-0.5">
            Core service configuration and environment indicators
          </p>
        </div>
        <span className="mt-2 sm:mt-0 text-[10px] font-mono text-[#A1A1AA] bg-[#0A0A0A] px-2.5 py-1 rounded-full border border-[#27272A]">
          Setup Status
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {integrations.map((item) => (
          <div
            key={item.name}
            className="p-4 rounded-xl bg-[#0A0A0A] border border-[#27272A] hover:border-slate-700 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#71717A]">
                  {item.category}
                </span>
                <h3 className="text-xs font-bold text-[#F5F5F5] mt-0.5">{item.name}</h3>
              </div>
              <span className={`inline-flex items-center text-xs font-mono font-medium ${item.textColor}`}>
                <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${item.statusDot}`} />
                {loading ? 'Checking...' : item.status}
              </span>
            </div>
            <p className="text-xs text-[#A1A1AA] mt-2.5 leading-relaxed">{item.description}</p>
          </div>
        ))}
      </div>

      <p className="mt-4 text-[10px] text-[#71717A] italic">
        * Status indicators represent static environment configuration and connection states.
      </p>
    </div>
  );
}
