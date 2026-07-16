import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Settings,
  Plus,
  Trash,
  Sliders,
  Code,
  Tag,
  Copy,
  Check,
  Save,
  HelpCircle,
  AlertCircle,
  Eye,
  RefreshCw,
  GitPullRequest
} from 'lucide-react';
import { useFlags } from '../context/FlagContext';
import { Button } from '../components/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/Card';
import { Badge } from '../components/Badge';
import { Toggle } from '../components/Toggle';
import { Input } from '../components/Input';
import { TargetingRule } from '../types';

export const FlagDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { flags, selectedEnvironment, toggleFlag, updateFlag, showToast } = useFlags();

  const [activeTab, setActiveTab] = useState<'targeting' | 'variations' | 'code'>('targeting');
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  // Retreive the active flag
  const flag = flags.find((f) => f.id === id);

  // Local targeting rules editor state
  const [localRules, setLocalRules] = useState<TargetingRule[]>([]);
  const [hasUnsavedRules, setHasUnsavedRules] = useState(false);

  useEffect(() => {
    if (flag) {
      setLocalRules(flag.environments[selectedEnvironment]?.rules || []);
      setHasUnsavedRules(false);
    } else {
      showToast('Flag not found', 'error');
      navigate('/flags');
    }
  }, [flag, selectedEnvironment]);

  if (!flag) return null;

  const handleToggleStateChange = () => {
    toggleFlag(flag.id, selectedEnvironment);
  };

  const handleAddRule = () => {
    const newRule: TargetingRule = {
      id: `rule-custom-${Math.random().toString(36).substring(2, 9)}`,
      attribute: 'email',
      operator: 'contains',
      values: [''],
      serveVariationId: flag.variations[0]?.id || '',
    };
    setLocalRules((prev) => [...prev, newRule]);
    setHasUnsavedRules(true);
  };

  const handleRemoveRule = (ruleId: string) => {
    setLocalRules((prev) => prev.filter((r) => r.id !== ruleId));
    setHasUnsavedRules(true);
  };

  const handleRuleFieldChange = (idx: number, field: keyof TargetingRule, val: any) => {
    setLocalRules((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: val };
      return copy;
    });
    setHasUnsavedRules(true);
  };

  const handleRuleValueListChange = (idx: number, valString: string) => {
    const arr = valString.split(',').map((s) => s.trim()).filter(Boolean);
    handleRuleFieldChange(idx, 'values', arr);
  };

  const handleSaveRules = () => {
    // Validate rules
    for (const rule of localRules) {
      if (rule.values.length === 0 || rule.values.some((v) => !v)) {
        showToast('Rule matching criteria list cannot contain empty fields.', 'error');
        return;
      }
    }

    const updatedEnvironments = {
      ...flag.environments,
      [selectedEnvironment]: {
        ...flag.environments[selectedEnvironment],
        rules: localRules,
      },
    };

    updateFlag(flag.id, { environments: updatedEnvironments });
    setHasUnsavedRules(false);
  };

  const handleCopyCode = (text: string, lang: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(lang);
    showToast('SDK snippet copied to clipboard', 'success');
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  // Build Code Snippets
  const codeSnippets = {
    react: `import { useFeatureFlag } from '@flagforge/react-sdk';

export default function CheckoutButton() {
  const isEnabled = useFeatureFlag('${flag.key}');

  return (
    <button className={isEnabled ? 'bg-indigo-600' : 'bg-zinc-800'}>
      {isEnabled ? 'Start Parallel Transactions' : 'Standard Checkout'}
    </button>
  );
}`,
    node: `const { FlagForgeClient } = require('@flagforge/node-sdk');

const ffClient = new FlagForgeClient({
  sdkKey: 'ff_sdk_${selectedEnvironment}_...'
});

async function handleRequest(userId, email) {
  const context = { userId, email };
  const variation = await ffClient.evaluate('${flag.key}', context);

  if (variation === 'var-true' || variation === true) {
    return runOptimalBillingEngine();
  }
  return runStandardBillingEngine();
}`,
    python: `from flagforge_sdk import FFClient

ff_client = FFClient(sdk_key="ff_sdk_${selectedEnvironment}_...")

def handle_user_event(user_id, company_name):
    context = {
        "user_id": user_id,
        "company": company_name
    }
    
    # Evaluate feature flag configuration
    variation = ff_client.evaluate("${flag.key}", context)
    
    if variation == "var-true" or variation is True:
        # Serve the optimal experience
        return launch_feature_v2()
    return launch_feature_fallback()`,
    curl: `curl -X POST "${window.location.origin || 'https://api.flagforge.co'}/api/v1/evaluate" \\
  -H "Authorization: Bearer ff_client_${selectedEnvironment}_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "flagKey": "${flag.key}",
    "context": {
      "email": "developer@flagforge.co",
      "country": "US"
    }
  }'`
  };

  return (
    <div className="space-y-6 select-none">
      {/* Upper header navigation */}
      <div className="flex flex-col gap-3">
        <button
          onClick={() => navigate('/flags')}
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors w-fit cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to feature flags</span>
        </button>

        {/* Info row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-extrabold text-zinc-100 tracking-tight">{flag.name}</h1>
              <code className="text-xs font-mono text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                {flag.key}
              </code>
              <Badge variant={flag.type === 'boolean' ? 'primary' : 'purple'} className="text-[10px]">
                {flag.type}
              </Badge>
            </div>
            <p className="text-sm text-zinc-400 max-w-2xl">{flag.description}</p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              onClick={() => navigate(`/flags/${flag.id}/edit`)}
              icon={<Settings className="h-4 w-4" />}
            >
              Configure
            </Button>
            <div className="flex items-center gap-2 px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-md h-10">
              <span className="text-xs text-zinc-400 mr-2.5 font-medium uppercase tracking-wider">{selectedEnvironment} Toggled:</span>
              <Toggle checked={flag.environments[selectedEnvironment]?.isEnabled} onChange={handleToggleStateChange} />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-zinc-800">
        {[
          { id: 'targeting', label: 'Targeting Rules', icon: Sliders },
          { id: 'variations', label: 'Variations payload', icon: Eye },
          { id: 'code', label: 'SDK Snippets', icon: Code },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-all border-b-2 cursor-pointer ${
                active
                  ? 'text-indigo-400 border-indigo-500'
                  : 'text-zinc-400 border-transparent hover:text-zinc-200'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* DYNAMIC TAB COMPONENT */}
      <div className="space-y-6">
        {activeTab === 'targeting' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Rules panel (2/3 width) */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-zinc-800 bg-zinc-950/40">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Custom Targeting Criteria</CardTitle>
                    <CardDescription>
                      Reroute evaluations based on runtime user context details in {selectedEnvironment.toUpperCase()} environment.
                    </CardDescription>
                  </div>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleAddRule}
                    icon={<Plus className="h-4 w-4" />}
                  >
                    Add Target Rule
                  </Button>
                </CardHeader>

                <CardContent className="space-y-4">
                  {localRules.length > 0 ? (
                    localRules.map((rule, idx) => (
                      <div
                        key={rule.id}
                        className="p-4 bg-zinc-900/40 border border-zinc-800 rounded-md space-y-3 relative"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-zinc-400">Rule #{idx + 1}</span>
                          <button
                            onClick={() => handleRemoveRule(rule.id)}
                            className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/5 rounded-md cursor-pointer transition-all"
                            title="Remove targeting rule"
                          >
                            <Trash className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 items-center">
                          {/* Attribute Name */}
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] text-zinc-500 font-semibold uppercase">Attribute</span>
                            <input
                              type="text"
                              value={rule.attribute}
                              onChange={(e) => handleRuleFieldChange(idx, 'attribute', e.target.value)}
                              className="bg-zinc-900 border border-zinc-800 rounded-md text-xs px-3 py-2 outline-none text-zinc-200 focus:ring-1 focus:ring-indigo-500"
                              placeholder="e.g., email, country"
                            />
                          </div>

                          {/* Operator */}
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] text-zinc-500 font-semibold uppercase">Condition</span>
                            <select
                              value={rule.operator}
                              onChange={(e) => handleRuleFieldChange(idx, 'operator', e.target.value)}
                              className="bg-zinc-900 border border-zinc-800 rounded-md text-xs px-2.5 py-2 outline-none text-zinc-200 cursor-pointer focus:ring-1 focus:ring-indigo-500"
                            >
                              <option value="is_one_of">is one of</option>
                              <option value="is_not_one_of">is not one of</option>
                              <option value="contains">contains</option>
                              <option value="does_not_contain">does not contain</option>
                            </select>
                          </div>

                          {/* Serve Variation */}
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] text-zinc-500 font-semibold uppercase">Serve Variation</span>
                            <select
                              value={rule.serveVariationId}
                              onChange={(e) => handleRuleFieldChange(idx, 'serveVariationId', e.target.value)}
                              className="bg-zinc-900 border border-zinc-800 rounded-md text-xs px-2.5 py-2 outline-none text-zinc-200 cursor-pointer focus:ring-1 focus:ring-indigo-500"
                            >
                              {flag.variations.map((v: any) => (
                                <option key={v.id} value={v.id}>
                                  {v.name} ({v.value})
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Values comma list */}
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] text-zinc-500 font-semibold uppercase">Match Values</span>
                          <input
                            type="text"
                            value={rule.values.join(', ')}
                            onChange={(e) => handleRuleValueListChange(idx, e.target.value)}
                            className="bg-zinc-900 border border-zinc-800 rounded-md text-xs px-3 py-2 outline-none text-zinc-200 font-mono focus:ring-1 focus:ring-indigo-500"
                            placeholder="e.g., @acme.com, @test-corp.com (comma separated)"
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-10 text-center text-zinc-500 space-y-1.5 border border-dashed border-zinc-800 rounded-md">
                      <Sliders className="h-8 w-8 text-zinc-700 mx-auto opacity-70" />
                      <p className="text-xs font-semibold text-zinc-400">No Custom Targeting Rules Defined</p>
                      <p className="text-[10px] text-zinc-500 leading-relaxed max-w-sm mx-auto">
                        All evaluators inside {selectedEnvironment.toUpperCase()} will receive the default environment fallback variation.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Action Floating Save block if rules have changed */}
              {hasUnsavedRules && (
                <div className="p-4 bg-indigo-600/10 border border-indigo-500/25 rounded-lg flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-xs text-indigo-400">
                    <AlertCircle className="h-4.5 w-4.5 text-indigo-400 flex-shrink-0" />
                    <span>Unsaved rule modifications exist in this environment. Proceed to persist.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setLocalRules(flag.environments[selectedEnvironment]?.rules || [])}>
                      Reset
                    </Button>
                    <Button variant="success" size="sm" onClick={handleSaveRules} icon={<Save className="h-3.5 w-3.5" />}>
                      Save Rules
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Default fallbacks side review (1/3 width) */}
            <div className="space-y-6">
              <Card className="border-zinc-800 bg-zinc-950/40">
                <CardHeader>
                  <CardTitle>Environment Fallbacks</CardTitle>
                  <CardDescription>
                    Default behavior for this environment.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 text-xs">
                  <div className="p-3.5 bg-zinc-900/60 rounded-lg border border-zinc-800/60 space-y-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400 font-semibold">Toggled State fallback:</span>
                      <Badge variant={flag.environments[selectedEnvironment]?.isEnabled ? 'success' : 'secondary'}>
                        {flag.environments[selectedEnvironment]?.isEnabled ? 'ENABLED (ON)' : 'DISABLED (OFF)'}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Default Active Variation:</span>
                      <div className="p-2 bg-zinc-900 border border-zinc-800 rounded font-mono text-[11px] text-zinc-300">
                        {
                          flag.variations.find(
                            (v: any) => v.id === flag.environments[selectedEnvironment]?.defaultServeVariationId
                          )?.name || 'Default'
                        } ({
                          flag.variations.find(
                            (v: any) => v.id === flag.environments[selectedEnvironment]?.defaultServeVariationId
                          )?.value || 'N/A'
                        })
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Default Off Variation:</span>
                      <div className="p-2 bg-zinc-900 border border-zinc-800 rounded font-mono text-[11px] text-zinc-300">
                        {
                          flag.variations.find(
                            (v: any) => v.id === flag.environments[selectedEnvironment]?.offVariationId
                          )?.name || 'Default'
                        } ({
                          flag.variations.find(
                            (v: any) => v.id === flag.environments[selectedEnvironment]?.offVariationId
                          )?.value || 'N/A'
                        })
                      </div>
                    </div>
                  </div>

                  <p className="text-zinc-500 leading-normal pt-2">
                    Custom rules above are evaluated sequentially. If a client context evaluation doesn't match any rules, the default Active variation is served instead.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'variations' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <Card className="border-zinc-800 bg-zinc-950/40">
                <CardHeader>
                  <CardTitle>Defined Output Payload Variations</CardTitle>
                  <CardDescription>
                    Review the payload and returned key configurations for this flag.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {flag.variations.map((v: any, idx: number) => (
                    <div key={v.id} className="p-4 bg-zinc-900/40 border border-zinc-800 rounded-md flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-zinc-100">{v.name}</span>
                          <span className="text-[10px] font-mono text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded">
                            ID: {v.id}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] text-zinc-500 uppercase font-bold">Returned Value:</span>
                          <code className="block p-2.5 bg-zinc-900 rounded-md text-xs text-indigo-300 font-mono max-w-lg overflow-x-auto">
                            {v.value}
                          </code>
                        </div>
                      </div>
                      <Badge variant="purple">Variant #{idx + 1}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <Card className="border-zinc-800 bg-zinc-950/40">
              <CardHeader>
                <CardTitle>Percentage Rollouts</CardTitle>
                <CardDescription>Target allocations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 text-xs text-zinc-400">
                <p>
                  For multivariate or A/B tests, configure random hash splits to target portions of your audience.
                </p>

                <div className="space-y-3 pt-2">
                  {flag.variations.map((v: any, idx: number) => {
                    // simulate rollout percentage
                    const percent = flag.type === 'boolean'
                      ? (idx === 0 ? 80 : 20)
                      : (idx === 0 ? 50 : idx === 1 ? 30 : 20);
                    return (
                      <div key={v.id} className="space-y-1.5">
                        <div className="flex justify-between font-semibold">
                          <span className="text-zinc-300">{v.name}</span>
                          <span className="text-zinc-100">{percent}%</span>
                        </div>
                        <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden border border-zinc-800/40">
                          <div
                            className={`h-full rounded-full ${
                              idx === 0 ? 'bg-indigo-500' : idx === 1 ? 'bg-emerald-500' : 'bg-amber-500'
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="p-3 bg-zinc-900/40 border border-zinc-800 rounded-lg leading-relaxed pt-3">
                  To update rollout metrics or to add more variations, click on the <strong>Configure</strong> button at the top header to edit.
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'code' && (
          <Card className="border-zinc-800 bg-zinc-950/40">
            <CardHeader>
              <CardTitle>Developer Code Integration SDK</CardTitle>
              <CardDescription>
                Copy precise integration commands mapped automatically for this flag key.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-1 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-zinc-800">
                {/* Languages selectors */}
                {Object.entries(codeSnippets).map(([lang, codeText]) => (
                  <div key={lang} className="p-6 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase font-mono tracking-wider text-zinc-400">
                          {lang === 'node' ? 'Node.js SDK' : lang === 'python' ? 'Python SDK' : lang === 'react' ? 'React Native/Hooks' : 'Raw Curl API'}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-zinc-500 hover:text-white"
                          onClick={() => handleCopyCode(codeText, lang)}
                        >
                          {copiedSnippet === lang ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                        </Button>
                      </div>
                      <code className="block whitespace-pre-wrap font-mono text-[10.5px] text-zinc-300 leading-normal p-3 bg-zinc-900 border border-zinc-800 rounded-md max-h-[250px] overflow-y-auto">
                        {codeText}
                      </code>
                    </div>
                    <p className="text-[10px] text-zinc-500 leading-normal pt-2">
                      {lang === 'react'
                        ? 'Optimal client-side caching hooks. Recovers parameters on load automatically.'
                        : lang === 'node'
                        ? 'Stateless evaluations. Safe for micro-services and database query nodes.'
                        : lang === 'python'
                        ? 'Optimized Python routing blocks utilizing direct background fetching threadpools.'
                        : 'Query routing engine directly bypassing SDK layers.'}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
export default FlagDetails;
