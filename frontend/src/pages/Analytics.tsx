import React, { useState, useEffect } from 'react';
import { BarChart3, Clock, Cpu, Cloud, Sparkles, RefreshCw, Zap } from 'lucide-react';
import { useFlags } from '../context/FlagContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { EvaluationsChart, SDKUsageChart } from '../components/AnalyticsCharts';

interface LogStreamItem {
  id: string;
  timestamp: string;
  flagKey: string;
  context: string;
  variationServed: string;
  latency: number;
}

const INITIAL_STREAM: LogStreamItem[] = [
  {
    id: 's-1',
    timestamp: 'Just now',
    flagKey: 'ai-code-generation-v2',
    context: 'email: dev@google.com, tier: enterprise',
    variationServed: 'var-true (Enabled)',
    latency: 3.2,
  },
  {
    id: 's-2',
    timestamp: '1s ago',
    flagKey: 'billing-engine-v3-migration',
    context: 'company: acme-corp, region: US-East',
    variationServed: 'var-true (Enabled)',
    latency: 5.1,
  },
  {
    id: 's-3',
    timestamp: '3s ago',
    flagKey: 'ab-test-hero-cta-button',
    context: 'user_id: user_910c2e, country: CA',
    variationServed: 'var-cta-control (Control)',
    latency: 4.8,
  },
  {
    id: 's-4',
    timestamp: '5s ago',
    flagKey: 'custom-dashboard-layout-config',
    context: 'user_id: user_8b2d1, role: developer',
    variationServed: 'var-json-expanded (Expanded Grid)',
    latency: 6.0,
  }
];

export const Analytics: React.FC = () => {
  const { analytics, flags, selectedEnvironment } = useFlags();
  const [stream, setStream] = useState<LogStreamItem[]>(INITIAL_STREAM);
  const [isLiveStreaming, setIsLiveStreaming] = useState(true);

  // Simulate incoming evaluations stream
  useEffect(() => {
    if (!isLiveStreaming) return;

    const interval = setInterval(() => {
      const randomFlag = flags[Math.floor(Math.random() * flags.length)];
      if (!randomFlag) return;

      const randomLatency = +(3 + Math.random() * 5).toFixed(1);
      const isEnabled = randomFlag.environments[selectedEnvironment]?.isEnabled;
      const fallbackVar = isEnabled ? 'Enabled' : 'Disabled';

      const mockUsers = [
        'email: test-user@gmail.com, country: UK',
        'email: partner@acme.com, tier: premium',
        'user_id: user_5b382, region: EU-West',
        'company: globex, country: AU',
        'user_id: dev-sandbox, role: tester'
      ];

      const newItem: LogStreamItem = {
        id: `s-${Math.random().toString(36).substring(2, 9)}`,
        timestamp: 'Just now',
        flagKey: randomFlag.key,
        context: mockUsers[Math.floor(Math.random() * mockUsers.length)],
        variationServed: `var-${isEnabled ? 'true' : 'false'} (${fallbackVar})`,
        latency: randomLatency,
      };

      setStream((prev) => {
        // shift older timestamps
        const updated = prev.map((item) => {
          if (item.timestamp === 'Just now') return { ...item, timestamp: '1s ago' };
          if (item.timestamp === '1s ago') return { ...item, timestamp: '4s ago' };
          if (item.timestamp === '4s ago') return { ...item, timestamp: '10s ago' };
          return { ...item, timestamp: 'older' };
        });
        return [newItem, ...updated.slice(0, 5)];
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [flags, selectedEnvironment, isLiveStreaming]);

  const latencyMetrics = [
    { name: 'Average Latency', value: '4.8 ms', icon: Clock, desc: 'SLA standard (under 10ms)' },
    { name: 'p99 Latency', value: '12.4 ms', icon: Cpu, desc: '99% of requests serviced' },
    { name: 'Global Cache Hit', value: '99.8%', icon: Zap, desc: 'Edge-node memory matches' },
    { name: 'Node API Uptime', value: '100.0%', icon: Cloud, desc: 'Region routes active' },
  ];

  return (
    <div className="space-y-6 select-none">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white font-sans flex items-center gap-2">
            Platform Analytics
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Track evaluation latency metrics, server telemetry, and SDK usage profiles globally.
          </p>
        </div>

        <Button
          variant={isLiveStreaming ? 'success' : 'secondary'}
          size="sm"
          onClick={() => setIsLiveStreaming(!isLiveStreaming)}
          icon={<RefreshCw className={`h-4 w-4 ${isLiveStreaming ? 'animate-spin' : ''}`} />}
        >
          {isLiveStreaming ? 'Live Streaming active' : 'Pause Live stream'}
        </Button>
      </div>

      {/* Latency statistics columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {latencyMetrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <Card key={idx} hoverGlow className="border-zinc-800 bg-zinc-950/40">
              <CardContent className="p-5 flex items-start gap-4">
                <div className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-md text-indigo-400">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500">{m.name}</span>
                  <h4 className="text-2xl font-extrabold text-zinc-100 tracking-tight mt-1">{m.value}</h4>
                  <span className="text-[10px] text-zinc-500 mt-1 block">{m.desc}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Graphs Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Evaluations history */}
        <Card className="lg:col-span-2 border-zinc-800 bg-zinc-950/20">
          <CardHeader>
            <CardTitle>Evaluation Load (Total: {analytics.totalEvaluations.toLocaleString()})</CardTitle>
            <CardDescription>
              Hourly requests breakdown across configured environments.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <EvaluationsChart data={analytics.evaluationsOverTime} />
          </CardContent>
        </Card>

        {/* SDK distribution */}
        <Card className="border-zinc-800 bg-zinc-950/20">
          <CardHeader>
            <CardTitle>SDK Usage Shares</CardTitle>
            <CardDescription>Percentage share of requests handled by language SDKs.</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <SDKUsageChart data={analytics.clientSdkUsage} />
          </CardContent>
        </Card>
      </div>

      {/* Live evaluation stream logger */}
      <Card className="border-zinc-800 bg-zinc-950/20">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-4.5 w-4.5 text-amber-400" />
              <span>Real-time Evaluation Stream</span>
            </CardTitle>
            <CardDescription>
              Evaluations computed instantly on edge routers based on active client conditions.
            </CardDescription>
          </div>
          {isLiveStreaming && (
            <Badge variant="success" dot>
              LIVE STREAMING
            </Badge>
          )}
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-zinc-900/50 border-b border-zinc-800 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  <th className="py-3 px-6">Timestamp</th>
                  <th className="py-3 px-4">Flag Key Reference</th>
                  <th className="py-3 px-4">User Matching Context</th>
                  <th className="py-3 px-4">Result Served</th>
                  <th className="py-3 px-6 text-right">Compute Latency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 font-mono text-xs text-zinc-300">
                {stream.map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-900/10 transition-colors">
                    <td className="py-3 px-6 text-zinc-500 whitespace-nowrap">{log.timestamp}</td>
                    <td className="py-3 px-4 font-semibold text-indigo-400">{log.flagKey}</td>
                    <td className="py-3 px-4 text-zinc-400 max-w-xs truncate" title={log.context}>{log.context}</td>
                    <td className="py-3 px-4">
                      <span className="bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded text-zinc-100">
                        {log.variationServed}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-right font-semibold text-emerald-400">{log.latency} ms</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
export default Analytics;
