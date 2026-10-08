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
      category: 'Core Authentication',
      status: status?.firebase || 'Configured',
      badgeColor: 'emerald',
      description: 'Client SDK initialization and user authentication state management',
      type: 'Configured',
    },
    {
      name: 'Cloud Firestore',
      category: 'Primary Database',
      status: status?.firestore || 'Connected',
      badgeColor: 'emerald',
      description: 'Document database storing product catalog, metadata, and user roles',
      type: 'Connected',
    },
    {
      name: 'Google Gemini AI',
      category: 'Generative Intelligence',
      status: status?.gemini || (loading ? 'Checking...' : 'Not configured'),
      badgeColor: status?.gemini === 'Configured' ? 'emerald' : 'amber',
      description: 'Gemini 2.5 Flash for multimodal room analysis & recommendations',
      type: status?.gemini === 'Configured' ? 'Configured' : 'Missing Config',
    },
    {
      name: 'AR / Spatial Computing',
      category: '3D & Augmented Reality',
      status: status?.spatialComputing || 'In Development',
      badgeColor: 'blue',
      description: 'Unity AR Foundation mobile bridge & 3D model spatial preview pipeline',
      type: 'In Development',
    },
  ];

  const getBadgeClasses = (badgeColor: string) => {
    switch (badgeColor) {
      case 'emerald':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'amber':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'blue':
        return 'text-sky-400 bg-sky-500/10 border-sky-500/30';
      default:
        return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
    }
  };

  return (
    <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-semibold text-white">System Integrations</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Platform integration status indicators
          </p>
        </div>
        <span className="mt-2 sm:mt-0 text-[11px] font-mono text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded border border-slate-700">
          Environment &amp; Setup Status
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {integrations.map((item) => (
          <div
            key={item.name}
            className="p-4 rounded-lg bg-slate-800/40 border border-slate-800 hover:border-slate-700/80 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  {item.category}
                </span>
                <h3 className="text-sm font-semibold text-white mt-0.5">{item.name}</h3>
              </div>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getBadgeClasses(
                  item.badgeColor
                )}`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                    item.badgeColor === 'emerald'
                      ? 'bg-emerald-400'
                      : item.badgeColor === 'amber'
                      ? 'bg-amber-400'
                      : 'bg-sky-400'
                  }`}
                />
                {loading ? 'Checking...' : item.status}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-2">{item.description}</p>
          </div>
        ))}
      </div>

      <p className="mt-4 text-[11px] text-slate-500 italic">
        * Note: These indicators reflect static environment configuration and connection states, not active telemetry heartbeat streams.
      </p>
    </div>
  );
}
