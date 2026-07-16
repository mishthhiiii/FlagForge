import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layers,
  Activity,
  AlertTriangle,
  History,
  TrendingUp,
  Plus,
  GitBranch,
  Settings,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import { useFlags } from '../context/FlagContext';
import { Button } from '../components/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/Card';
import { Badge } from '../components/Badge';
import { EvaluationsChart, DistributionChart } from '../components/AnalyticsCharts';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { flags, selectedEnvironment, auditLogs, analytics } = useFlags();

  // Compute dynamic stats based on chosen environment
  const totalFlagsCount = flags.length;
  const activeFlagsCount = flags.filter((f) => f.environments[selectedEnvironment]?.isEnabled).length;
  const disabledFlagsCount = totalFlagsCount - activeFlagsCount;
  const productionActiveCount = flags.filter((f) => f.environments.production?.isEnabled).length;

  const stats = [
    {
      name: 'Total Feature Flags',
      value: totalFlagsCount,
      icon: Layers,
      description: 'Defined configurations',
      color: 'text-indigo-400 border-indigo-500/10 bg-indigo-500/5',
    },
    {
      name: `Active in ${selectedEnvironment.toUpperCase()}`,
      value: activeFlagsCount,
      icon: Activity,
      description: 'Serving target evaluations',
      color: 'text-emerald-400 border-emerald-500/10 bg-emerald-500/5',
    },
    {
      name: `Disabled in ${selectedEnvironment.toUpperCase()}`,
      value: disabledFlagsCount,
      icon: AlertTriangle,
      description: 'Off variation fallback',
      color: 'text-zinc-400 border-zinc-800 bg-zinc-900/40',
    },
    {
      name: 'Active in Production',
      value: productionActiveCount,
      icon: GitBranch,
      description: 'Live in end-user accounts',
      color: 'text-rose-400 border-rose-500/10 bg-rose-500/5',
    },
  ];

  return (
    <div className="space-y-8 select-none">
      {/* Top Welcome Title Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white font-sans">
            Dashboard Overview
          </h1>
          <p className="text-zinc-400 text-sm mt-1 leading-relaxed">
            Surgically control targeting parameters for <span className="text-white capitalize">{selectedEnvironment}</span> environment
          </p>
        </div>

        <Button
          variant="primary"
          icon={<Plus className="h-4.5 w-4.5" />}
          onClick={() => navigate('/flags/new')}
        >
          Create Feature Flag
        </Button>
      </div>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx} hoverGlow className="border-zinc-800/80 bg-zinc-950/40">
              <CardContent className="p-5 flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    {stat.name}
                  </p>
                  <h3 className="text-3xl font-black text-zinc-100 tracking-tight mt-2.5">
                    {stat.value}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1.5 flex items-center gap-1">
                    <span>{stat.description}</span>
                  </p>
                </div>
                <div className={`p-2.5 rounded-lg border ${stat.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Analytics Visualization Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Area */}
        <Card className="lg:col-span-2 border-zinc-800 bg-zinc-950/20">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Target Evaluation Frequency</CardTitle>
              <CardDescription>
                Consolidated client SDK evaluations across routing layers (last 24 hours)
              </CardDescription>
            </div>
            <Badge variant="success" dot>
              Real-time
            </Badge>
          </CardHeader>
          <CardContent className="pt-2">
            <EvaluationsChart data={analytics.evaluationsOverTime} />
          </CardContent>
        </Card>

        {/* Circular Distribution Card */}
        <Card className="border-zinc-800 bg-zinc-950/20">
          <CardHeader>
            <CardTitle>Evaluation Load Split</CardTitle>
            <CardDescription>
              Volume percentage ratio by individual flag Key
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center pt-0">
            <DistributionChart data={analytics.flagDistribution} />
          </CardContent>
        </Card>
      </div>

      {/* Row: Recent Flags List & Audit Trail Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Flags status view */}
        <Card className="lg:col-span-2 border-zinc-800 bg-zinc-950/20">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Active Config Indicators</CardTitle>
              <CardDescription>
                Currently toggled feature keys in {selectedEnvironment}
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/flags')}
              icon={<ArrowUpRight className="h-3.5 w-3.5" />}
              className="text-xs"
            >
              View All
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-zinc-800">
              {flags.slice(0, 4).map((flag) => {
                const isEnabledInEnv = flag.environments[selectedEnvironment]?.isEnabled;
                return (
                  <div
                    key={flag.id}
                    className="flex items-center justify-between p-4.5 hover:bg-zinc-900/20 transition-all cursor-pointer"
                    onClick={() => navigate(`/flags/${flag.id}`)}
                  >
                    <div className="flex flex-col gap-1 min-w-0 pr-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-zinc-100 truncate">
                          {flag.name}
                        </span>
                        <code className="text-[10px] font-mono text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded">
                          {flag.key}
                        </code>
                      </div>
                      <p className="text-xs text-zinc-400 truncate max-w-md">
                        {flag.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-3.5 flex-shrink-0">
                      <Badge variant={flag.type === 'boolean' ? 'primary' : 'purple'}>
                        {flag.type}
                      </Badge>
                      <Badge variant={isEnabledInEnv ? 'success' : 'secondary'} dot={isEnabledInEnv}>
                        {isEnabledInEnv ? 'On' : 'Off'}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Audit Log Timeline */}
        <Card className="border-zinc-800 bg-zinc-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-4.5 w-4.5 text-zinc-400" />
              <span>Workspace Audit Trail</span>
            </CardTitle>
            <CardDescription>
              Recent deployment and environment configurations
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="px-5 pb-5 space-y-4 max-h-[280px] overflow-y-auto">
              {auditLogs.slice(0, 4).map((log) => {
                let actionBadgeTheme: any = 'secondary';
                if (log.action === 'create') actionBadgeTheme = 'success';
                if (log.action === 'toggle') actionBadgeTheme = 'primary';
                if (log.action === 'delete') actionBadgeTheme = 'danger';

                return (
                  <div key={log.id} className="text-xs space-y-1.5 pb-3 border-b border-zinc-800 last:border-b-0 last:pb-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-zinc-300 truncate">
                        {log.actor.name}
                      </span>
                      <div className="flex items-center gap-1 text-[10px] text-zinc-500">
                        <Clock className="h-3 w-3" />
                        <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                    <p className="text-zinc-400 leading-normal">
                      {log.details}
                    </p>
                    <div className="flex items-center gap-1.5 pt-0.5">
                      <Badge variant={actionBadgeTheme} className="text-[9px] px-1.5 py-0">
                        {log.action}
                      </Badge>
                      {log.environment !== 'all' && (
                        <Badge variant="info" className="text-[9px] px-1.5 py-0 uppercase">
                          {log.environment}
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
export default Dashboard;
