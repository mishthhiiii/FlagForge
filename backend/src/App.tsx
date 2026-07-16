import React, { useState, useEffect } from 'react';
import { 
  GitBranch, 
  Play, 
  Terminal, 
  Sliders, 
  Settings, 
  Code, 
  Trash2, 
  Plus, 
  Search, 
  Check, 
  X, 
  ChevronRight, 
  ChevronDown, 
  Database, 
  ShieldAlert, 
  RefreshCw, 
  FileCode, 
  Folder, 
  FolderOpen, 
  Copy,
  Eye,
  ListFilter,
  CheckCircle,
  Clock,
  User,
  Info
} from 'lucide-react';
import { FeatureFlag, FlagType, TargetingRule, Environment, Project, AuditLog, BackendFile } from './types.ts';
import { backendFilesTree } from './codeContent.ts';

// Initial projects
const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    name: 'E-Commerce Platform',
    key: 'ecommerce',
    description: 'Main flagship e-commerce application platform.',
    flagsCount: 3,
    environments: [
      { id: 'env-1', name: 'Development', key: 'dev', sdkKey: 'ff_sdk_dev_7a42b9c1d8' },
      { id: 'env-2', name: 'Staging', key: 'staging', sdkKey: 'ff_sdk_staging_9c31e2f4a5' },
      { id: 'env-3', name: 'Production', key: 'prod', sdkKey: 'ff_sdk_prod_2e84d5c9f0' }
    ]
  },
  {
    id: 'proj-2',
    name: 'Mobile Core API',
    key: 'mobile-core',
    description: 'BFF and core API services for iOS and Android apps.',
    flagsCount: 0,
    environments: [
      { id: 'env-4', name: 'Development', key: 'dev', sdkKey: 'ff_sdk_dev_3e2187b9cc' },
      { id: 'env-5', name: 'Staging', key: 'staging', sdkKey: 'ff_sdk_staging_5f182ea38b' },
      { id: 'env-6', name: 'Production', key: 'prod', sdkKey: 'ff_sdk_prod_1a2c3d4e5f' }
    ]
  }
];

// Initial Flags
const INITIAL_FLAGS: FeatureFlag[] = [
  {
    id: 'flag-1',
    name: 'New Stripe Billing Flow',
    key: 'new-stripe-billing',
    description: 'Enables the brand-new, multi-tier subscription Stripe billing flow.',
    type: 'BOOLEAN',
    projectId: 'proj-1',
    flagStates: {
      dev: {
        enabled: true,
        defaultValue: 'true',
        rules: []
      },
      staging: {
        enabled: true,
        defaultValue: 'false',
        rules: [
          {
            id: 'rule-stripe-1',
            name: 'Beta Team Targeting',
            conditions: [
              { attribute: 'email', operator: 'ENDS_WITH', value: '@company.com' }
            ],
            serveValue: 'true'
          }
        ]
      },
      prod: {
        enabled: false,
        defaultValue: 'false',
        rules: []
      }
    }
  },
  {
    id: 'flag-2',
    name: 'Campaign Hero Banner Color',
    key: 'campaign-hero-color',
    description: 'Multivariate flag returning a hex color code for the campaign banner.',
    type: 'MULTIVARIATE',
    projectId: 'proj-1',
    flagStates: {
      dev: {
        enabled: true,
        defaultValue: '#3B82F6',
        rules: []
      },
      staging: {
        enabled: true,
        defaultValue: '#3B82F6',
        rules: [
          {
            id: 'rule-banner-1',
            name: 'Premium Account Tier',
            conditions: [
              { attribute: 'tier', operator: 'EQUALS', value: 'premium' }
            ],
            serveValue: '#F59E0B'
          }
        ]
      },
      prod: {
        enabled: true,
        defaultValue: '#10B981',
        rules: []
      }
    }
  },
  {
    id: 'flag-3',
    name: 'Algolia Search Config',
    key: 'search-config',
    description: 'Advanced Algolia query configurations returned as JSON.',
    type: 'JSON',
    projectId: 'proj-1',
    flagStates: {
      dev: {
        enabled: true,
        defaultValue: '{\n  "hitsPerPage": 10,\n  "analytics": true,\n  "enablePersonalization": false\n}',
        rules: []
      },
      staging: {
        enabled: true,
        defaultValue: '{\n  "hitsPerPage": 10,\n  "analytics": true,\n  "enablePersonalization": false\n}',
        rules: []
      },
      prod: {
        enabled: true,
        defaultValue: '{\n  "hitsPerPage": 20,\n  "analytics": true,\n  "enablePersonalization": true\n}',
        rules: [
          {
            id: 'rule-search-1',
            name: 'QA Internal Users',
            conditions: [
              { attribute: 'isStaff', operator: 'EQUALS', value: 'true' }
            ],
            serveValue: '{\n  "hitsPerPage": 50,\n  "analytics": false,\n  "enablePersonalization": false,\n  "debug": true\n}'
          }
        ]
      }
    }
  }
];

// Initial Audit Logs
const INITIAL_AUDIT_LOGS: AuditLog[] = [
  { id: '1', action: 'PROJECT_CREATE', details: 'Created project E-Commerce Platform (ecommerce)', timestamp: '2026-07-16 10:15:30' },
  { id: '2', action: 'FLAG_CREATE', details: 'Created feature flag new-stripe-billing (BOOLEAN)', timestamp: '2026-07-16 10:20:12' },
  { id: '3', action: 'FLAG_STATE_UPDATE', details: 'Updated new-stripe-billing state in dev: enabled = true', timestamp: '2026-07-16 10:22:45' },
  { id: '4', action: 'FLAG_STATE_UPDATE', details: 'Configured Targeting Rule in staging for new-stripe-billing', timestamp: '2026-07-16 10:31:02' }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'flags' | 'playground' | 'code' | 'logs'>('flags');
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('proj-1');
  const [flags, setFlags] = useState<FeatureFlag[]>(INITIAL_FLAGS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);

  // Active Project Helper
  const activeProject = projects.find(p => p.id === selectedProjectId) || projects[0];

  // Selected Environment in the Flags and Playground tab
  const [selectedEnvKey, setSelectedEnvKey] = useState<string>('dev');

  // Interactive Flag Creation modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newFlagName, setNewFlagName] = useState('');
  const [newFlagKey, setNewFlagKey] = useState('');
  const [newFlagType, setNewFlagType] = useState<FlagType>('BOOLEAN');
  const [newFlagDesc, setNewFlagDesc] = useState('');

  // Expand state for editing rules
  const [expandedFlagId, setExpandedFlagId] = useState<string | null>(null);

  // Playground Sandbox state
  const [selectedPlaygroundFlagKey, setSelectedPlaygroundFlagKey] = useState<string>('new-stripe-billing');
  const [playgroundContext, setPlaygroundContext] = useState<string>(
    JSON.stringify({ userId: 'user_9921', email: 'alice@company.com', tier: 'premium', isStaff: 'true' }, null, 2)
  );
  const [evaluationResult, setEvaluationResult] = useState<any>(null);
  const [evaluationLogs, setEvaluationLogs] = useState<string[]>([]);
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  // Code Explorer State
  const [selectedFilePath, setSelectedFilePath] = useState<string>('backend/src/services/sdk.service.ts');
  const [openDirectories, setOpenDirectories] = useState<Record<string, boolean>>({
    'backend': true,
    'backend/src': true,
    'backend/src/services': true,
    'backend/src/config': true,
    'backend/prisma': true
  });
  const [searchCodeQuery, setSearchCodeQuery] = useState('');

  // Auto evaluate when parameters in Playground change
  useEffect(() => {
    if (activeTab === 'playground') {
      handleEvaluate();
    }
  }, [selectedPlaygroundFlagKey, selectedEnvKey, playgroundContext]);

  // Find flag by key
  const activePlaygroundFlag = flags.find(f => f.key === selectedPlaygroundFlagKey && f.projectId === selectedProjectId);

  // Evaluation simulation engine
  const handleEvaluate = () => {
    if (!activePlaygroundFlag) {
      setEvaluationResult({ error: 'Flag not found' });
      return;
    }

    const logs: string[] = [];
    logs.push(`🔍 Initiating evaluation for flag: "${activePlaygroundFlag.key}"`);
    logs.push(`🌍 Environment: "${selectedEnvKey.toUpperCase()}"`);

    // Parse context
    let contextObj: Record<string, any> = {};
    try {
      contextObj = JSON.parse(playgroundContext);
      logs.push(`👤 Context parsed successfully`);
    } catch (e) {
      logs.push(`❌ Failed to parse context JSON: ${(e as Error).message}`);
      setEvaluationResult({ value: 'ERROR', reason: 'Invalid Context JSON', error: true });
      setEvaluationLogs(logs);
      return;
    }

    const envState = activePlaygroundFlag.flagStates[selectedEnvKey];
    if (!envState) {
      logs.push(`❌ Flag state not found for environment: ${selectedEnvKey}`);
      setEvaluationResult({ value: 'ERROR', reason: 'Environment Misconfiguration', error: true });
      setEvaluationLogs(logs);
      return;
    }

    // 1. Check flag state (Enabled / Disabled)
    if (!envState.enabled) {
      logs.push(`⚠️ Flag is DISABLED in environment: ${selectedEnvKey}`);
      logs.push(`Serving environment fallback Default Value: "${envState.defaultValue}"`);
      setEvaluationResult({
        value: envState.defaultValue,
        reason: 'FLAG_DISABLED',
        type: activePlaygroundFlag.type
      });
      setEvaluationLogs(logs);
      return;
    }

    logs.push(`🟢 Flag is ENABLED. Evaluating targeting rules...`);

    // 2. Evaluate sequential rules
    const rules = envState.rules;
    let matchedRule: TargetingRule | null = null;

    for (let i = 0; i < rules.length; i++) {
      const rule = rules[i];
      logs.push(`📝 Checking Rule [${i + 1}/${rules.length}]: "${rule.name}"`);

      // Evaluate conditions
      let conditionsMatch = true;
      if (rule.conditions && rule.conditions.length > 0) {
        for (const cond of rule.conditions) {
          const userValRaw = contextObj[cond.attribute];
          if (userValRaw === undefined || userValRaw === null) {
            logs.push(`   ↳ Condition Failed: Attribute "${cond.attribute}" missing in context`);
            conditionsMatch = false;
            break;
          }

          const userVal = String(userValRaw).toLowerCase();
          const condVal = cond.value.toLowerCase();
          let match = false;

          switch (cond.operator) {
            case 'EQUALS':
              match = userVal === condVal;
              break;
            case 'NOT_EQUALS':
              match = userVal !== condVal;
              break;
            case 'CONTAINS':
              match = userVal.includes(condVal);
              break;
            case 'NOT_CONTAINS':
              match = !userVal.includes(condVal);
              break;
            case 'STARTS_WITH':
              match = userVal.startsWith(condVal);
              break;
            case 'ENDS_WITH':
              match = userVal.endsWith(condVal);
              break;
            case 'IN': {
              const allowed = condVal.split(',').map(s => s.trim());
              match = allowed.includes(userVal);
              break;
            }
            case 'NOT_IN': {
              const disallowed = condVal.split(',').map(s => s.trim());
              match = !disallowed.includes(userVal);
              break;
            }
          }

          if (match) {
            logs.push(`   ↳ Condition Match: ${cond.attribute} (${userValRaw}) ${cond.operator} ${cond.value}`);
          } else {
            logs.push(`   ↳ Condition Failed: ${cond.attribute} (${userValRaw}) ${cond.operator} ${cond.value}`);
            conditionsMatch = false;
            break;
          }
        }
      } else {
        logs.push(`   ↳ No targeting conditions specified, rule matches unconditionally`);
      }

      // Rollout check
      if (conditionsMatch && rule.rollout) {
        const { bucketBy, percentage } = rule.rollout;
        const bucketVal = contextObj[bucketBy];
        if (!bucketVal) {
          logs.push(`   ↳ Rollout Check Failed: Bucketing attribute "${bucketBy}" is missing`);
          conditionsMatch = false;
        } else {
          // Deterministic string hash
          let hash = 0;
          const str = String(bucketVal);
          for (let k = 0; k < str.length; k++) {
            hash = (hash << 5) - hash + str.charCodeAt(k);
            hash |= 0;
          }
          const finalBucket = Math.abs(hash) % 100;
          logs.push(`   ↳ Rollout: User "${bucketVal}" hashes to bucket: ${finalBucket} (Targeting: < ${percentage}%)`);

          if (finalBucket < percentage) {
            logs.push(`   ↳ Rollout SUCCESS: bucket ${finalBucket} < ${percentage}%`);
          } else {
            logs.push(`   ↳ Rollout FAIL: bucket ${finalBucket} >= ${percentage}%`);
            conditionsMatch = false;
          }
        }
      }

      if (conditionsMatch) {
        logs.push(`🎯 Rule "${rule.name}" matches! Serving target value: "${rule.serveValue}"`);
        matchedRule = rule;
        break;
      }
    }

    if (matchedRule) {
      setEvaluationResult({
        value: matchedRule.serveValue,
        reason: `RULE_MATCH: ${matchedRule.name}`,
        type: activePlaygroundFlag.type,
        ruleId: matchedRule.id
      });
    } else {
      logs.push(`🤷 No rules matched. Serving default fallback value: "${envState.defaultValue}"`);
      setEvaluationResult({
        value: envState.defaultValue,
        reason: 'DEFAULT_VALUE',
        type: activePlaygroundFlag.type
      });
    }

    setEvaluationLogs(logs);
  };

  // Preset contexts helper
  const handleApplyPreset = (type: 'beta' | 'premium' | 'anonymous') => {
    let context = {};
    if (type === 'beta') {
      context = { userId: 'usr_882', email: 'dev_team@company.com', isStaff: 'true', tier: 'free' };
    } else if (type === 'premium') {
      context = { userId: 'usr_009', email: 'gold_member@yahoo.com', isStaff: 'false', tier: 'premium' };
    } else {
      context = { userId: 'guest_4812', email: 'guest@unknown.org', isStaff: 'false', tier: 'free' };
    }
    setPlaygroundContext(JSON.stringify(context, null, 2));
  };

  // Flag creation handler
  const handleCreateFlag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFlagName || !newFlagKey) return;

    const formattedKey = newFlagKey.trim().toLowerCase().replace(/\s+/g, '-');
    
    // Check key duplicate
    if (flags.some(f => f.key === formattedKey && f.projectId === selectedProjectId)) {
      alert(`Flag with key "${formattedKey}" already exists in this project!`);
      return;
    }

    let defaultVal = 'false';
    if (newFlagType === 'MULTIVARIATE') {
      defaultVal = 'control';
    } else if (newFlagType === 'JSON') {
      defaultVal = '{\n  "enabled": true\n}';
    }

    const newFlag: FeatureFlag = {
      id: `flag-${Date.now()}`,
      name: newFlagName,
      key: formattedKey,
      description: newFlagDesc || 'No description provided.',
      type: newFlagType,
      projectId: selectedProjectId,
      flagStates: {
        dev: { enabled: false, defaultValue: defaultVal, rules: [] },
        staging: { enabled: false, defaultValue: defaultVal, rules: [] },
        prod: { enabled: false, defaultValue: defaultVal, rules: [] }
      }
    };

    setFlags([newFlag, ...flags]);
    
    // Audit Log
    const newLog: AuditLog = {
      id: String(Date.now()),
      action: 'FLAG_CREATE',
      details: `Created feature flag ${formattedKey} (${newFlagType})`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    setAuditLogs([newLog, ...auditLogs]);

    // Reset Form and close modal
    setNewFlagName('');
    setNewFlagKey('');
    setNewFlagType('BOOLEAN');
    setNewFlagDesc('');
    setShowCreateModal(false);
  };

  // Delete Flag Handler
  const handleDeleteFlag = (id: string, key: string) => {
    if (window.confirm(`Are you sure you want to delete flag "${key}"?`)) {
      setFlags(flags.filter(f => f.id !== id));
      
      const newLog: AuditLog = {
        id: String(Date.now()),
        action: 'FLAG_DELETE',
        details: `Deleted feature flag "${key}"`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
      };
      setAuditLogs([newLog, ...auditLogs]);
    }
  };

  // Toggle flag active environment state
  const handleToggleFlagState = (flagId: string, envKey: string) => {
    setFlags(flags.map(f => {
      if (f.id === flagId) {
        const currentEnv = f.flagStates[envKey];
        return {
          ...f,
          flagStates: {
            ...f.flagStates,
            [envKey]: {
              ...currentEnv,
              enabled: !currentEnv.enabled
            }
          }
        };
      }
      return f;
    }));

    const targetFlag = flags.find(f => f.id === flagId);
    if (targetFlag) {
      const isCurrentlyEnabled = targetFlag.flagStates[envKey].enabled;
      const newLog: AuditLog = {
        id: String(Date.now()),
        action: 'FLAG_STATE_UPDATE',
        details: `Toggled ${targetFlag.key} in ${envKey}: enabled = ${!isCurrentlyEnabled}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
      };
      setAuditLogs([newLog, ...auditLogs]);
    }
  };

  // Update Flag configuration defaults & rules
  const handleUpdateFlagConfig = (
    flagId: string, 
    envKey: string, 
    defaultValue: string, 
    rules: TargetingRule[]
  ) => {
    setFlags(flags.map(f => {
      if (f.id === flagId) {
        return {
          ...f,
          flagStates: {
            ...f.flagStates,
            [envKey]: {
              ...f.flagStates[envKey],
              defaultValue,
              rules
            }
          }
        };
      }
      return f;
    }));

    const targetFlag = flags.find(f => f.id === flagId);
    if (targetFlag) {
      const newLog: AuditLog = {
        id: String(Date.now()),
        action: 'FLAG_RULES_UPDATE',
        details: `Updated Targeting Rules & Defaults for ${targetFlag.key} in ${envKey}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
      };
      setAuditLogs([newLog, ...auditLogs]);
    }
  };

  // Mock SDK Code Snippet Generator
  const getCodeSnippet = (language: 'nodejs' | 'js' | 'python' | 'curl') => {
    const activeEnv = activeProject.environments.find(e => e.key === selectedEnvKey) || activeProject.environments[0];
    const sdkKey = activeEnv.sdkKey;

    switch (language) {
      case 'nodejs':
        return `import { FlagForgeClient } from '@flagforge/node-sdk';

const client = new FlagForgeClient({
  sdkKey: "${sdkKey}",
  refreshIntervalMs: 60000 // Configurable polling interval
});

await client.waitForInitialization();

const context = ${playgroundContext.replace(/\n/g, '\n')};

const isBillingEnabled = client.evaluate("${selectedPlaygroundFlagKey}", context, false);
console.log('Flag value:', isBillingEnabled);`;

      case 'js':
        return `import { FlagForgeClient } from '@flagforge/javascript-sdk';

const client = new FlagForgeClient({
  sdkKey: "${sdkKey}"
});

// The SDK handles real-time targeting in browser memory
const context = ${playgroundContext.replace(/\n/g, '\n')};

client.on('ready', () => {
  const isEnabled = client.evaluate("${selectedPlaygroundFlagKey}", context);
  console.log('Evaluate result:', isEnabled);
});`;

      case 'python':
        return `from flagforge_sdk import FlagForgeClient

client = FlagForgeClient(sdk_key="${sdkKey}")

context = {
    "userId": "user_9921",
    "email": "alice@company.com",
    "tier": "premium"
}

is_enabled = client.evaluate("${selectedPlaygroundFlagKey}", context, False)
print(f"Feature evaluation result: {is_enabled}")`;

      case 'curl':
        return `curl -X POST "${window.location.origin || 'http://localhost:3000'}/api/v1/sdk/flags/${selectedPlaygroundFlagKey}/evaluate" \\
  -H "x-sdk-key: ${sdkKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "context": ${playgroundContext.replace(/\n/g, '\n    ')}
  }'`;
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(type);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  // Directory collapse-expand
  const toggleDir = (dirPath: string) => {
    setOpenDirectories(prev => ({
      ...prev,
      [dirPath]: !prev[dirPath]
    }));
  };

  // Find file in tree helper
  const findFileInTree = (nodes: BackendFile[], path: string): BackendFile | null => {
    for (const node of nodes) {
      if (node.path === path) return node;
      if (node.children) {
        const found = findFileInTree(node.children, path);
        if (found) return found;
      }
    }
    return null;
  };

  const currentOpenFile = findFileInTree(backendFilesTree, selectedFilePath);

  // Render file tree recursively
  const renderFileTree = (nodes: BackendFile[], depth = 0) => {
    return nodes.map(node => {
      const isOpen = openDirectories[node.path];
      const isSelected = selectedFilePath === node.path;

      if (node.type === 'directory') {
        return (
          <div key={node.path} className="select-none">
            <button
              onClick={() => toggleDir(node.path)}
              className="w-full flex items-center gap-2 py-1 px-2 hover:bg-slate-800/50 rounded text-slate-300 text-sm font-medium transition"
              style={{ paddingLeft: `${depth * 12 + 8}px` }}
            >
              {isOpen ? <ChevronDown size={14} className="text-slate-500" /> : <ChevronRight size={14} className="text-slate-500" />}
              {isOpen ? <FolderOpen size={16} className="text-amber-400" /> : <Folder size={16} className="text-amber-400" />}
              <span>{node.name}</span>
            </button>
            {isOpen && node.children && (
              <div className="mt-0.5">
                {renderFileTree(node.children, depth + 1)}
              </div>
            )}
          </div>
        );
      } else {
        return (
          <button
            key={node.path}
            onClick={() => setSelectedFilePath(node.path)}
            className={`w-full flex items-center gap-2 py-1 px-2 rounded text-sm transition ${
              isSelected 
                ? 'bg-blue-500/20 text-blue-400 border-l-2 border-blue-500 font-medium' 
                : 'hover:bg-slate-800/40 text-slate-400'
            }`}
            style={{ paddingLeft: `${depth * 12 + 16}px` }}
          >
            <FileCode size={15} className={isSelected ? 'text-blue-400' : 'text-slate-500'} />
            <span className="truncate">{node.name}</span>
          </button>
        );
      }
    });
  };

  // Rule configuration editor helper component
  const RuleEditor = ({ flag, envKey }: { flag: FeatureFlag, envKey: string }) => {
    const config = flag.flagStates[envKey];
    const [rulesList, setRulesList] = useState<TargetingRule[]>(config.rules);
    const [defaultVal, setDefaultVal] = useState(config.defaultValue);

    const handleSave = () => {
      handleUpdateFlagConfig(flag.id, envKey, defaultVal, rulesList);
      alert('Targeting Rules & fallback defaults updated successfully!');
    };

    const addRule = () => {
      const newRule: TargetingRule = {
        id: `rule-${Date.now()}`,
        name: 'New Custom Targeting Rule',
        conditions: [
          { attribute: 'tier', operator: 'EQUALS', value: 'premium' }
        ],
        serveValue: flag.type === 'BOOLEAN' ? 'true' : flag.type === 'MULTIVARIATE' ? 'treatment' : '{\n  "custom": true\n}'
      };
      setRulesList([...rulesList, newRule]);
    };

    const deleteRule = (ruleId: string) => {
      setRulesList(rulesList.filter(r => r.id !== ruleId));
    };

    const updateRuleName = (ruleId: string, name: string) => {
      setRulesList(rulesList.map(r => r.id === ruleId ? { ...r, name } : r));
    };

    const updateRuleServe = (ruleId: string, serveValue: string) => {
      setRulesList(rulesList.map(r => r.id === ruleId ? { ...r, serveValue } : r));
    };

    const updateRuleCondition = (ruleId: string, condIndex: number, field: string, value: any) => {
      setRulesList(rulesList.map(r => {
        if (r.id === ruleId && r.conditions) {
          const newConds = [...r.conditions];
          newConds[condIndex] = { ...newConds[condIndex], [field]: value };
          return { ...r, conditions: newConds };
        }
        return r;
      }));
    };

    return (
      <div className="bg-slate-900/95 border border-slate-700/60 rounded-xl p-5 mt-3 space-y-4 animate-fadeIn shadow-lg">
        <div className="flex justify-between items-center pb-2 border-b border-slate-700/60">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Environment Setup ({envKey.toUpperCase()})
          </h4>
          <div className="flex items-center gap-2">
            <button
              onClick={addRule}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700/80 text-slate-200 text-xs py-1.5 px-3 rounded-lg border border-slate-700 font-medium transition"
            >
              <Plus size={13} /> Add Rule
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs py-1.5 px-3 rounded-lg font-medium transition shadow-sm shadow-indigo-950/20"
            >
              Save Configuration
            </button>
          </div>
        </div>

        {/* Fallback Environment Value */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/70 p-4 rounded-lg border border-slate-700/50">
          <div>
            <label className="block text-xs text-slate-300 font-medium mb-1">
              Fallback Environment Default Value
            </label>
            <p className="text-[11px] text-slate-400 mb-2">
              Served if the flag is enabled but no targeting rules below match the evaluation request.
            </p>
          </div>
          <div className="flex items-center">
            {flag.type === 'BOOLEAN' ? (
              <select
                value={defaultVal}
                onChange={(e) => setDefaultVal(e.target.value)}
                className="w-full bg-slate-900 text-sm border border-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-200 transition-all"
              >
                <option value="true">True</option>
                <option value="false">False</option>
              </select>
            ) : flag.type === 'MULTIVARIATE' ? (
              <input
                type="text"
                value={defaultVal}
                onChange={(e) => setDefaultVal(e.target.value)}
                className="w-full bg-slate-900 text-sm border border-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-200 transition-all"
                placeholder="Hex, variant key or text color"
              />
            ) : (
              <textarea
                value={defaultVal}
                onChange={(e) => setDefaultVal(e.target.value)}
                rows={3}
                className="w-full bg-slate-900 font-mono text-xs border border-slate-700 rounded-lg p-2.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-200 transition-all"
                placeholder="{}"
              />
            )}
          </div>
        </div>

        {/* List of Rules */}
        <div className="space-y-3">
          {rulesList.length === 0 ? (
            <div className="text-center py-5 bg-slate-950/40 rounded-lg border border-dashed border-slate-750">
              <ListFilter size={20} className="mx-auto text-slate-500 mb-1.5" />
              <p className="text-xs text-slate-400">No custom targeting rules set. Default environment fallback value will be served.</p>
            </div>
          ) : (
            rulesList.map((rule, rIndex) => (
              <div key={rule.id} className="bg-slate-950/90 border border-slate-700/50 rounded-lg p-3.5 space-y-3 shadow-inner">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-xs font-bold text-indigo-400">Rule {rIndex + 1}</span>
                    <input
                      type="text"
                      value={rule.name}
                      onChange={(e) => updateRuleName(rule.id, e.target.value)}
                      className="bg-transparent border-b border-transparent hover:border-slate-700 focus:border-indigo-500 text-xs font-medium text-slate-200 px-1 py-0.5 focus:outline-none flex-1 max-w-xs transition-colors"
                      placeholder="Rule name"
                    />
                  </div>
                  <button
                    onClick={() => deleteRule(rule.id)}
                    className="text-slate-400 hover:text-rose-400 transition p-1"
                    title="Delete Rule"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                {/* Conditions */}
                {rule.conditions && rule.conditions.map((cond, cIndex) => (
                  <div key={cIndex} className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Target Attribute</label>
                      <input
                        type="text"
                        value={cond.attribute}
                        onChange={(e) => updateRuleCondition(rule.id, cIndex, 'attribute', e.target.value)}
                        className="w-full bg-slate-950 text-xs border border-slate-700 rounded px-2 py-1 focus:outline-none focus:border-indigo-500 text-slate-300 transition-colors"
                        placeholder="e.g. email, tier"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Operator</label>
                      <select
                        value={cond.operator}
                        onChange={(e) => updateRuleCondition(rule.id, cIndex, 'operator', e.target.value)}
                        className="w-full bg-slate-950 text-xs border border-slate-700 rounded px-2 py-1 focus:outline-none focus:border-indigo-500 text-slate-300 transition-colors"
                      >
                        <option value="EQUALS">Equals</option>
                        <option value="NOT_EQUALS">Does Not Equal</option>
                        <option value="CONTAINS">Contains</option>
                        <option value="NOT_CONTAINS">Does Not Contain</option>
                        <option value="STARTS_WITH">Starts With</option>
                        <option value="ENDS_WITH">Ends With</option>
                        <option value="IN">In (comma-separated)</option>
                        <option value="NOT_IN">Not In (comma-separated)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Value</label>
                      <input
                        type="text"
                        value={cond.value}
                        onChange={(e) => updateRuleCondition(rule.id, cIndex, 'value', e.target.value)}
                        className="w-full bg-slate-950 text-xs border border-slate-700 rounded px-2 py-1 focus:outline-none focus:border-indigo-500 text-slate-300 transition-colors"
                        placeholder="Value to compare"
                      />
                    </div>
                  </div>
                ))}

                {/* Rollout percentage (mock integration for simple rules) */}
                <div className="flex flex-col sm:flex-row gap-3 pt-1 border-t border-slate-800 items-start sm:items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-medium text-slate-400">Rollout:</span>
                    <span className="text-[11px] font-medium text-emerald-400">100% of matching targets</span>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">Serve Value:</span>
                    {flag.type === 'BOOLEAN' ? (
                      <select
                        value={rule.serveValue}
                        onChange={(e) => updateRuleServe(rule.id, e.target.value)}
                        className="bg-slate-900 text-xs border border-slate-700 rounded px-2 py-1 focus:outline-none focus:border-indigo-500 text-slate-200 min-w-[80px]"
                      >
                        <option value="true">True</option>
                        <option value="false">False</option>
                      </select>
                    ) : flag.type === 'MULTIVARIATE' ? (
                      <input
                        type="text"
                        value={rule.serveValue}
                        onChange={(e) => updateRuleServe(rule.id, e.target.value)}
                        className="bg-slate-900 text-xs border border-slate-700 rounded px-2 py-1 focus:outline-none focus:border-indigo-500 text-slate-200"
                        placeholder="Value to serve"
                      />
                    ) : (
                      <textarea
                        value={rule.serveValue}
                        onChange={(e) => updateRuleServe(rule.id, e.target.value)}
                        rows={2}
                        className="bg-slate-900 text-xs font-mono border border-slate-700 rounded p-1.5 focus:outline-none focus:border-indigo-500 text-slate-200 w-44"
                        placeholder="{}"
                      />
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Premium Header */}
      <header className="border-b border-slate-700/80 bg-slate-950 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sticky top-0 z-10 shadow-md shadow-black/20">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2.5 rounded-lg shadow-sm shadow-indigo-950/40">
            <Sliders className="text-white" size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-white bg-gradient-to-r from-white via-slate-100 to-indigo-300 bg-clip-text text-transparent">
                FlagForge
              </span>
              <span className="bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Console
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">Enterprise Feature Flag Management Platform</p>
          </div>
        </div>

        {/* Project Selector & Nav */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 transition-colors focus-within:border-indigo-500">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Project:</span>
            <select 
              value={selectedProjectId} 
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="bg-transparent text-sm font-semibold text-slate-200 focus:outline-none cursor-pointer pr-1"
            >
              {projects.map(p => (
                <option key={p.id} value={p.id} className="bg-slate-900 text-slate-200">
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-700/60">
            <button
              onClick={() => setActiveTab('flags')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
                activeTab === 'flags' 
                  ? 'bg-indigo-600 text-white shadow shadow-indigo-950/30 border border-indigo-500/10' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <Sliders size={14} /> Flags
            </button>
            <button
              onClick={() => setActiveTab('playground')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
                activeTab === 'playground' 
                  ? 'bg-indigo-600 text-white shadow shadow-indigo-950/30 border border-indigo-500/10' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <Play size={14} /> SDK Playground
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
                activeTab === 'code' 
                  ? 'bg-indigo-600 text-white shadow shadow-indigo-950/30 border border-indigo-500/10' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <Code size={14} /> Explore Backend Code
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
                activeTab === 'logs' 
                  ? 'bg-indigo-600 text-white shadow shadow-indigo-950/30 border border-indigo-500/10' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <Terminal size={14} /> Audit Logs
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        
        {/* Banner/Info Section */}
        <div className="bg-slate-800/40 border border-slate-700/80 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex gap-3">
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-lg text-emerald-400 shrink-0 mt-0.5 md:mt-0">
              <Database size={18} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-200">Production-Ready Prisma + Postgres Backend Successfully Generated!</h3>
              <p className="text-xs text-slate-400">
                A pristine, structured backend project with schemas, validators, routes, controllers, and evaluation engines has been fully created in the workspace under <code className="bg-slate-950 px-1.5 py-0.5 rounded text-indigo-400 text-[11px]">/backend/</code>.
              </p>
            </div>
          </div>
          <button 
            onClick={() => setActiveTab('code')}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs px-3 py-1.5 rounded-lg border border-slate-700 font-medium transition whitespace-nowrap self-stretch md:self-auto justify-center"
          >
            <Code size={14} /> Browse Project Files
          </button>
        </div>

        {/* 1. FLAGS MANAGEMENT VIEW */}
        {activeTab === 'flags' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  Feature Flags <span className="text-xs font-normal text-slate-500">({flags.filter(f => f.projectId === selectedProjectId).length} flags configured)</span>
                </h2>
                <p className="text-xs text-slate-400">Create, manage, and toggle rules on environment levels.</p>
              </div>

              <div className="flex items-center gap-3">
                {/* Environment Selector */}
                <div className="flex bg-slate-950 border border-slate-700 rounded-lg p-1">
                  {activeProject.environments.map(e => (
                    <button
                      key={e.id}
                      onClick={() => setSelectedEnvKey(e.key)}
                      className={`text-xs px-3.5 py-1.5 rounded-md font-medium transition uppercase tracking-wider ${
                        selectedEnvKey === e.key 
                          ? 'bg-slate-800 text-slate-50 shadow-sm border border-slate-700/60' 
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {e.name}
                    </button>
                  ))}
                </div>

                {/* Create Flag Button */}
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500/20 text-xs px-3.5 py-2 rounded-lg font-semibold shadow-lg shadow-indigo-950/20 transition cursor-pointer"
                >
                  <Plus size={15} /> Create Feature Flag
                </button>
              </div>
            </div>

            {/* List of Flags */}
            <div className="space-y-4">
              {flags.filter(f => f.projectId === selectedProjectId).length === 0 ? (
                <div className="bg-slate-950/40 border border-slate-700/60 rounded-xl p-12 text-center">
                  <Sliders className="mx-auto text-slate-600 mb-3" size={36} />
                  <h3 className="text-sm font-semibold text-slate-300">No Feature Flags Found</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1.5">
                    Click "Create Feature Flag" to start building. Flags created here will be evaluatable in real-time under the SDK Playground.
                  </p>
                </div>
              ) : (
                flags.filter(f => f.projectId === selectedProjectId).map(flag => {
                  const state = flag.flagStates[selectedEnvKey];
                  const isExpanded = expandedFlagId === flag.id;

                  return (
                    <div 
                      key={flag.id} 
                      className={`bg-slate-950 border rounded-xl overflow-hidden transition-all ${
                        isExpanded ? 'border-slate-600 shadow-md shadow-indigo-950/20' : 'border-slate-700/60 hover:border-slate-600/80 shadow-sm'
                      }`}
                    >
                      {/* Flag Header Card */}
                      <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg mt-0.5 shrink-0 border ${
                            flag.type === 'BOOLEAN' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' :
                            flag.type === 'MULTIVARIATE' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                            'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                          }`}>
                            <Sliders size={16} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-sm font-bold text-white">{flag.name}</h3>
                              <code className="bg-slate-900 border border-slate-700 text-indigo-400 px-1.5 py-0.5 rounded text-[11px] font-mono font-medium">
                                {flag.key}
                              </code>
                              <span className={`text-[10px] px-2 py-0.5 rounded font-semibold uppercase tracking-wider ${
                                flag.type === 'BOOLEAN' ? 'bg-indigo-500/15 border border-indigo-500/30 text-indigo-400' :
                                flag.type === 'MULTIVARIATE' ? 'bg-amber-500/15 border border-amber-500/30 text-amber-400' :
                                'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                              }`}>
                                {flag.type}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1 max-w-xl">{flag.description}</p>
                          </div>
                        </div>

                        {/* Actions for Flags */}
                        <div className="flex items-center justify-end gap-3 shrink-0">
                          {/* Enable/Disable Toggle */}
                          <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-lg">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status:</span>
                            <button
                              onClick={() => handleToggleFlagState(flag.id, selectedEnvKey)}
                              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                state.enabled ? 'bg-indigo-600' : 'bg-slate-700'
                              }`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                  state.enabled ? 'translate-x-4' : 'translate-x-0'
                                }`}
                              />
                            </button>
                            <span className={`text-xs font-bold uppercase ${state.enabled ? 'text-indigo-400' : 'text-slate-400'}`}>
                              {state.enabled ? 'Active' : 'Off'}
                            </span>
                          </div>

                          {/* Rule configuration dropdown trigger */}
                          <button
                            onClick={() => setExpandedFlagId(isExpanded ? null : flag.id)}
                            className={`flex items-center gap-1.5 text-xs py-2 px-3 rounded-lg border font-medium transition ${
                              isExpanded 
                                ? 'bg-slate-800 text-slate-100 border-slate-700' 
                                : 'bg-slate-900 hover:bg-slate-800/80 text-slate-300 border-slate-700'
                            }`}
                          >
                            <Settings size={14} /> 
                            <span>{isExpanded ? 'Hide Setup' : 'Targeting Rules'}</span>
                            <span className="bg-slate-850/80 text-[10px] text-slate-400 font-bold px-1.5 py-0.5 rounded border border-slate-700">
                              {state.rules.length}
                            </span>
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDeleteFlag(flag.id, flag.key)}
                            className="p-2 hover:bg-rose-500/15 text-slate-400 hover:text-rose-400 rounded-lg transition"
                            title="Delete Flag"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>

                      {/* Expanded Settings area */}
                      {isExpanded && (
                        <div className="px-4 pb-4 border-t border-slate-700 bg-slate-950">
                          <RuleEditor flag={flag} envKey={selectedEnvKey} />
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* 2. REAL-TIME PLAYGROUND VIEW */}
        {activeTab === 'playground' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
            {/* Sandbox input controls */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 space-y-5 shadow-lg">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-1.5">
                    <Play className="text-indigo-400 fill-indigo-400/10" size={16} /> SDK Target Evaluation
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">Select a flag and context to simulate the deterministic compilation result.</p>
                </div>

                {/* Environment display */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Target Environment</label>
                  <div className="grid grid-cols-3 gap-2">
                    {activeProject.environments.map(e => (
                      <button
                        key={e.id}
                        onClick={() => setSelectedEnvKey(e.key)}
                        className={`text-xs py-2 rounded-lg border font-medium text-center transition ${
                          selectedEnvKey === e.key 
                            ? 'bg-indigo-500/15 border-indigo-500 text-indigo-400 font-bold shadow shadow-indigo-950/10' 
                            : 'bg-slate-900 border-slate-700 hover:border-slate-600 text-slate-400 hover:text-slate-300'
                        }`}
                      >
                        {e.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Select Flag Key */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Target Flag Key</label>
                  <select
                    value={selectedPlaygroundFlagKey}
                    onChange={(e) => setSelectedPlaygroundFlagKey(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-sm font-medium rounded-lg p-2.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  >
                    {flags.filter(f => f.projectId === selectedProjectId).map(f => (
                      <option key={f.id} value={f.key}>
                        {f.name} ({f.key})
                      </option>
                    ))}
                  </select>
                </div>

                {/* User Context JSON */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">User Evaluation Context (JSON)</label>
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold">Presets:</span>
                      <button 
                        onClick={() => handleApplyPreset('beta')}
                        className="text-[10px] font-semibold text-indigo-400 hover:text-indigo-300 transition bg-indigo-500/10 px-1.5 py-0.5 rounded"
                      >
                        Beta Dev
                      </button>
                      <button 
                        onClick={() => handleApplyPreset('premium')}
                        className="text-[10px] font-semibold text-amber-400 hover:text-amber-300 transition bg-amber-500/10 px-1.5 py-0.5 rounded"
                      >
                        Premium
                      </button>
                      <button 
                        onClick={() => handleApplyPreset('anonymous')}
                        className="text-[10px] font-semibold text-slate-400 hover:text-slate-300 transition bg-slate-700 px-1.5 py-0.5 rounded"
                      >
                        Guest
                      </button>
                    </div>
                  </div>
                  
                  <textarea
                    value={playgroundContext}
                    onChange={(e) => setPlaygroundContext(e.target.value)}
                    rows={8}
                    className="w-full bg-slate-950 font-mono text-xs border border-slate-750 rounded-lg p-3 text-slate-300 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 leading-relaxed transition-colors"
                  />
                </div>

                {/* Trigger Button */}
                <button
                  onClick={handleEvaluate}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 border border-indigo-500/20 text-white text-xs font-bold py-2.5 rounded-lg shadow-lg shadow-indigo-950/20 flex items-center justify-center gap-1.5 transition uppercase tracking-wider cursor-pointer"
                >
                  <RefreshCw size={14} className="animate-pulse" /> Re-Evaluate Compilation
                </button>
              </div>

              {/* Display code snippets */}
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 space-y-4 shadow-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <Code className="text-indigo-400" size={15} /> Client SDK Snippets
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">Integrate this client-side or server-side.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-700/60 text-[10px] font-semibold uppercase tracking-wider">
                    {['nodejs', 'js', 'python', 'curl'].map((lang) => (
                      <button
                        key={lang}
                        onClick={() => copyToClipboard(getCodeSnippet(lang as any), lang)}
                        className="flex-1 py-1 text-center rounded transition hover:text-white text-slate-400 bg-transparent"
                      >
                        {copiedSnippet === lang ? 'Copied! ✅' : lang === 'js' ? 'JS Browser' : lang}
                      </button>
                    ))}
                  </div>

                  <div className="bg-slate-950 border border-slate-700/60 rounded-lg p-3.5 relative group">
                    <pre className="text-[10px] font-mono text-slate-300 leading-relaxed overflow-x-auto whitespace-pre select-all max-h-[160px]">
                      {getCodeSnippet('nodejs')}
                    </pre>
                    <button
                      onClick={() => copyToClipboard(getCodeSnippet('nodejs'), 'generic')}
                      className="absolute top-2 right-2 p-1 bg-slate-900 border border-slate-700 rounded text-slate-400 hover:text-slate-200 transition opacity-0 group-hover:opacity-100"
                      title="Copy Snippet"
                    >
                      <Copy size={12} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Evaluation Results display */}
            <div className="lg:col-span-7 space-y-6">
              {evaluationResult && (
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg space-y-5">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                      <Sliders className="text-emerald-500" size={16} /> Resolved Flag State
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">The result compiled deterministically on the target SDK platform.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* The evaluated value card */}
                    <div className="bg-slate-950 border border-slate-700/60 rounded-xl p-4 flex flex-col justify-between min-h-[110px] relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/5 to-transparent rounded-full pointer-events-none" />
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Evaluated Serve Value</span>
                        {evaluationResult.type === 'JSON' ? (
                          <pre className="text-xs font-mono text-emerald-400 mt-2 bg-slate-950 p-2 rounded border border-slate-700/60 overflow-x-auto">
                            {typeof evaluationResult.value === 'object' ? JSON.stringify(evaluationResult.value, null, 2) : evaluationResult.value}
                          </pre>
                        ) : (
                          <span className={`text-2xl font-black mt-2 block tracking-tight ${
                            evaluationResult.value === true || evaluationResult.value === 'true' ? 'text-emerald-400' :
                            evaluationResult.value === false || evaluationResult.value === 'false' ? 'text-slate-500' :
                            'text-amber-400 font-mono font-bold'
                          }`}>
                            {String(evaluationResult.value)}
                          </span>
                        )}
                      </div>
                      <div className="mt-3 text-[10px] text-slate-400">
                        Type: <code className="bg-slate-900 px-1 rounded text-slate-400 font-mono">{evaluationResult.type || 'BOOLEAN'}</code>
                      </div>
                    </div>

                    {/* Metadata Card */}
                    <div className="bg-slate-950 border border-slate-700/60 rounded-xl p-4 flex flex-col justify-between min-h-[110px]">
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Compilation Reason</span>
                        <span className="text-sm font-semibold text-slate-200 mt-2 block">
                          {evaluationResult.reason}
                        </span>
                      </div>
                      <div className="mt-2 pt-2 border-t border-slate-900 text-[10px] text-slate-400 space-y-1">
                        <div>SDK Key: <code className="font-mono text-slate-400 font-semibold">ff_sdk_...{selectedEnvKey}</code></div>
                        {evaluationResult.ruleId && <div>Rule ID: <code className="font-mono text-slate-400 font-semibold">{evaluationResult.ruleId}</code></div>}
                      </div>
                    </div>
                  </div>

                  {/* Execution Path logs */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">SDK Compilation Resolution Path</span>
                    <div className="bg-slate-950 border border-slate-700/60 rounded-lg p-4 font-mono text-[10px] text-slate-300 space-y-1.5 leading-relaxed max-h-[300px] overflow-y-auto">
                      {evaluationLogs.map((log, index) => (
                        <div key={index} className={
                          log.includes('❌') ? 'text-red-400' :
                          log.includes('🎯') ? 'text-emerald-400 font-bold' :
                          log.includes('🟢') || log.includes('SUCCESS') ? 'text-emerald-400' :
                          log.includes('⚠️') ? 'text-amber-400' :
                          'text-slate-300'
                        }>
                          {log}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3. CODE EXPLORER VIEW */}
        {activeTab === 'code' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 border border-slate-700 rounded-xl overflow-hidden bg-slate-800 shadow-xl animate-fadeIn min-h-[580px]">
            {/* File navigator sidebar */}
            <div className="lg:col-span-4 border-r border-slate-700 bg-slate-950 p-4 flex flex-col">
              <div className="mb-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Database size={14} className="text-indigo-400" /> Backend Project Files
                </h3>
                <p className="text-[10px] text-slate-500 mt-0.5">Explore the production folder architecture.</p>
              </div>

              {/* Simple Filter input */}
              <div className="relative mb-3 shrink-0">
                <Search size={12} className="absolute left-2.5 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search file contents..."
                  value={searchCodeQuery}
                  onChange={(e) => setSearchCodeQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-xs rounded-lg pl-8 pr-2.5 py-2 text-slate-300 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>

              {/* Tree Navigation view */}
              <div className="flex-1 overflow-y-auto space-y-0.5 pr-1 max-h-[420px]">
                {renderFileTree(backendFilesTree)}
              </div>
            </div>

            {/* File display code viewer */}
            <div className="lg:col-span-8 flex flex-col min-h-[580px] bg-slate-900">
              {/* Header with name and Copy options */}
              <div className="px-5 py-3 border-b border-slate-700 bg-slate-850 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileCode size={16} className="text-indigo-400" />
                  <span className="text-xs font-mono font-medium text-slate-300">{selectedFilePath}</span>
                </div>
                {currentOpenFile && currentOpenFile.content && (
                  <button
                    onClick={() => copyToClipboard(currentOpenFile.content || '', 'file')}
                    className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-slate-200 text-xs py-1.5 px-3 rounded-lg font-medium transition"
                  >
                    {copiedSnippet === 'file' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                    <span>{copiedSnippet === 'file' ? 'Copied File!' : 'Copy Code'}</span>
                  </button>
                )}
              </div>

              {/* Code viewer container */}
              <div className="flex-1 p-5 overflow-auto font-mono text-xs text-slate-300 leading-relaxed bg-slate-950 max-h-[520px]">
                {currentOpenFile && currentOpenFile.content ? (
                  <pre className="whitespace-pre select-all text-[11px] text-slate-300 select-text leading-5">
                    {currentOpenFile.content}
                  </pre>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-600 py-16">
                    <Database size={32} className="opacity-30 mb-2" />
                    <p className="text-xs font-semibold">Select a file from the explorer directory to inspect its content.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 4. AUDIT LOGS VIEW */}
        {activeTab === 'logs' && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg space-y-4 animate-fadeIn">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-1.5">
                <Terminal className="text-indigo-400" size={16} /> Project Audit Logs
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Immutable record of configurations changed across FlagForge platform.</p>
            </div>

            <div className="border border-slate-700 rounded-lg overflow-hidden bg-slate-950/40">
              <div className="grid grid-cols-12 gap-3 bg-slate-900/60 p-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-700">
                <div className="col-span-3">Timestamp</div>
                <div className="col-span-3">Action</div>
                <div className="col-span-6">Details</div>
              </div>

              <div className="divide-y divide-slate-700/60">
                {auditLogs.map((log) => (
                  <div key={log.id} className="grid grid-cols-12 gap-3 p-3 text-xs font-mono text-slate-300 items-center hover:bg-slate-900/40 transition">
                    <div className="col-span-3 text-slate-500 flex items-center gap-1">
                      <Clock size={11} /> {log.timestamp}
                    </div>
                    <div className="col-span-3">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        log.action.includes('CREATE') ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25' :
                        log.action.includes('DELETE') ? 'bg-red-500/10 text-red-400 border border-red-500/25' :
                        'bg-indigo-500/10 text-indigo-400 border border-indigo-500/25'
                      }`}>
                        {log.action}
                      </span>
                    </div>
                    <div className="col-span-6 text-slate-300 text-[11px] truncate" title={log.details}>
                      {log.details}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Flag Creation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-md w-full overflow-hidden shadow-2xl">
            <div className="px-5 py-4 border-b border-slate-700 bg-slate-900/80 flex justify-between items-center">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Sliders className="text-indigo-400" size={15} /> Create Feature Flag
              </h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-slate-500 hover:text-slate-300 transition"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateFlag} className="p-5 space-y-4">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Flag Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. New Stripe Checkout"
                  value={newFlagName}
                  onChange={(e) => {
                    setNewFlagName(e.target.value);
                    if (!newFlagKey) {
                      setNewFlagKey(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-_]/g, ''));
                    }
                  }}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg p-2.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>

              {/* Key */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Flag Key (Unique ID)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. new-stripe-checkout"
                  value={newFlagKey}
                  onChange={(e) => setNewFlagKey(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-_]/g, ''))}
                  className="w-full bg-slate-900 border border-slate-700 font-mono text-xs rounded-lg p-2.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-indigo-400 transition-all"
                />
                <p className="text-[10px] text-slate-500">Key referenced in code. Hyphens and lowercase letters recommended.</p>
              </div>

              {/* Type */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Flag Value Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['BOOLEAN', 'MULTIVARIATE', 'JSON'] as FlagType[]).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setNewFlagType(type)}
                      className={`text-xs py-2 rounded-lg border font-semibold transition ${
                        newFlagType === type 
                          ? 'bg-indigo-500/15 border-indigo-500 text-indigo-400 shadow-sm' 
                          : 'bg-slate-900 border-slate-700 hover:border-slate-650 text-slate-400'
                      }`}
                    >
                      {type === 'BOOLEAN' ? 'Boolean' : type === 'MULTIVARIATE' ? 'String' : 'JSON'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Description</label>
                <textarea
                  placeholder="Specify purpose, owner, or SLA boundaries..."
                  value={newFlagDesc}
                  onChange={(e) => setNewFlagDesc(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-900 border border-slate-700 text-xs rounded-lg p-2.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-200 transition-all"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-slate-900 hover:bg-slate-850 text-slate-300 text-xs font-semibold py-2.5 rounded-lg border border-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 border border-indigo-500/20 text-white text-xs font-semibold py-2.5 rounded-lg shadow-lg shadow-indigo-950/20 transition cursor-pointer"
                >
                  Forge Flag
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-700/60 bg-slate-950 py-5 text-center text-xs text-slate-400">
        <p>© 2026 FlagForge Platform. Complete server-side logic compiled securely inside workspace.</p>
      </footer>
    </div>
  );
}
