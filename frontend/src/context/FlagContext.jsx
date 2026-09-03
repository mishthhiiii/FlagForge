import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  apiGetFlags,
  apiCreateFlag,
  apiUpdateFlag,
  apiDeleteFlag,
  apiGetFlagRecommendation,
  apiGetAuditLogs
} from '../services/api.js';

const FlagContext = createContext();

// Default seed flags matching MySQL database/seed.sql
const DEFAULT_FLAGS = [
  {
    id: 1,
    name: 'ab-test-hero-cta',
    description: 'Evaluating conversion rate on indigo primary CTA versus emerald CTA on landing page.',
    status: 'Active',
    rollout_percentage: 50,
    environment: 'Production',
    metrics: { error_rate: 0.48, response_time: 125, api_failures: 1, user_adoption: 52 },
    aiRecommendation: {
      risk_score: 18,
      confidence_score: 92,
      recommendation: 'Continue',
      reason: 'Error rate is stable at 0.48% with average response time of 125ms. Rollout can safely proceed.'
    },
    created_at: '2026-08-10 10:00:00',
    updated_at: '2026-08-15 14:30:00'
  },
  {
    id: 2,
    name: 'ai-code-generation',
    description: 'Assisted code generation backend endpoint powered by contextual models.',
    status: 'Active',
    rollout_percentage: 75,
    environment: 'Staging',
    metrics: { error_rate: 1.25, response_time: 305, api_failures: 9, user_adoption: 75 },
    aiRecommendation: {
      risk_score: 28,
      confidence_score: 88,
      recommendation: 'Continue',
      reason: 'Metrics within acceptable bounds for Staging environment. Monitor API failures above 80%.'
    },
    created_at: '2026-08-12 11:30:00',
    updated_at: '2026-08-16 09:15:00'
  },
  {
    id: 3,
    name: 'stripe-billing-v3',
    description: 'Migration to multi-currency Stripe Billing API v3 webhooks.',
    status: 'Paused',
    rollout_percentage: 10,
    environment: 'Production',
    metrics: { error_rate: 8.20, response_time: 750, api_failures: 89, user_adoption: 10 },
    aiRecommendation: {
      risk_score: 82,
      confidence_score: 91,
      recommendation: 'Pause',
      reason: 'Error rate has reached 8.2%, so disabling this feature is recommended until stability improves.'
    },
    created_at: '2026-08-14 14:00:00',
    updated_at: '2026-08-17 16:45:00'
  },
  {
    id: 4,
    name: 'dashboard-analytics-v2',
    description: 'High-throughput Recharts visualization for edge latency monitoring.',
    status: 'Active',
    rollout_percentage: 100,
    environment: 'Development',
    metrics: { error_rate: 0.15, response_time: 85, api_failures: 0, user_adoption: 100 },
    aiRecommendation: {
      risk_score: 12,
      confidence_score: 95,
      recommendation: 'Continue',
      reason: 'Telemetry optimal with sub-100ms response time.'
    },
    created_at: '2026-08-15 16:00:00',
    updated_at: '2026-08-18 11:20:00'
  },
  {
    id: 5,
    name: 'realtime-websocket-bus',
    description: 'Low latency bidirectional event streaming layer for instant flag invalidation.',
    status: 'Draft',
    rollout_percentage: 0,
    environment: 'Development',
    metrics: { error_rate: 0.00, response_time: 45, api_failures: 0, user_adoption: 0 },
    aiRecommendation: {
      risk_score: 5,
      confidence_score: 80,
      recommendation: 'Continue',
      reason: 'Draft flag ready for initial canary rollout.'
    },
    created_at: '2026-08-18 08:30:00',
    updated_at: '2026-08-18 08:30:00'
  }
];

const DEFAULT_AUDIT_LOGS = [
  {
    id: 1,
    flag_id: 1,
    user_name: 'Mishthi Chaurasia',
    action: 'Created feature flag ab-test-hero-cta in Production at 0% rollout',
    timestamp: '2026-08-10 10:00:00'
  },
  {
    id: 2,
    flag_id: 1,
    user_name: 'Mishthi Chaurasia',
    action: 'Updated rollout percentage to 50% for ab-test-hero-cta',
    timestamp: '2026-08-15 14:30:00'
  },
  {
    id: 3,
    flag_id: 2,
    user_name: 'Mishthi Chaurasia',
    action: 'Created feature flag ai-code-generation in Testing at 75% rollout',
    timestamp: '2026-08-12 11:30:00'
  },
  {
    id: 4,
    flag_id: 3,
    user_name: 'Team Member',
    action: 'Created feature flag stripe-billing-v3 in Production at 10% rollout',
    timestamp: '2026-08-14 14:00:00'
  },
  {
    id: 5,
    flag_id: 3,
    user_name: 'Project Admin',
    action: 'Paused flag stripe-billing-v3 following AI risk alert of 82/100',
    timestamp: '2026-08-17 16:45:00'
  }
];

export function FlagProvider({ children }) {
  const [flags, setFlags] = useState(DEFAULT_FLAGS);
  const [auditLogs, setAuditLogs] = useState(DEFAULT_AUDIT_LOGS);
  const [selectedEnv, setSelectedEnv] = useState('All'); // 'All' | 'Development' | 'Testing' | 'Production'
  const [searchQuery, setSearchQuery] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [activeRecommendation, setActiveRecommendation] = useState(null);
  const [selectedFlagId, setSelectedFlagId] = useState(3); // Default to flag 3 (Stripe billing with interesting AI alert)

  // Fetch flags on mount
  useEffect(() => {
    async function loadFlags() {
      try {
        const res = await apiGetFlags();
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          setFlags(res.data);
        }
      } catch (err) {
        console.log('[FlagContext] Using initialized state.');
      }
    }
    loadFlags();
  }, []);

  // Update Rollout Percentage
  const updateRolloutPercentage = async (flagId, newPercentage) => {
    const pct = Math.min(100, Math.max(0, Number(newPercentage)));
    
    // Optimistic UI update
    setFlags(prev =>
      prev.map(f => {
        if (f.id === flagId) {
          return {
            ...f,
            rollout_percentage: pct,
            status: pct > 0 && f.status === 'Draft' ? 'Active' : f.status,
            updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
          };
        }
        return f;
      })
    );

    // Add audit log
    const targetFlag = flags.find(f => f.id === flagId);
    const logText = `Adjusted rollout for '${targetFlag ? targetFlag.name : flagId}' to ${pct}%`;
    setAuditLogs(prev => [
      {
        id: Date.now(),
        flag_id: flagId,
        user_name: 'Mishthi Chaurasia',
        action: logText,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
      },
      ...prev
    ]);

    try {
      await apiUpdateFlag(flagId, { rollout_percentage: pct });
    } catch (e) {
      // Keep optimistic local update
    }
  };

  // Toggle or Update Status ('Draft', 'Active', 'Paused', 'Archived')
  const updateFlagStatus = async (flagId, newStatus) => {
    setFlags(prev =>
      prev.map(f => {
        if (f.id === flagId) {
          return {
            ...f,
            status: newStatus,
            updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
          };
        }
        return f;
      })
    );

    const targetFlag = flags.find(f => f.id === flagId);
    const logText = `Changed status of '${targetFlag ? targetFlag.name : flagId}' to ${newStatus}`;
    setAuditLogs(prev => [
      {
        id: Date.now(),
        flag_id: flagId,
        user_name: 'Mishthi Chaurasia',
        action: logText,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
      },
      ...prev
    ]);

    try {
      await apiUpdateFlag(flagId, { status: newStatus });
    } catch (e) {
      // Kept optimistic
    }
  };

  // Create Flag
  const createFlag = async (flagData) => {
    const newId = Date.now();
    const createdFlag = {
      id: newId,
      name: flagData.name.trim().toLowerCase().replace(/\s+/g, '-'),
      description: flagData.description || '',
      status: flagData.status || 'Draft',
      rollout_percentage: Number(flagData.rollout_percentage) || 0,
      environment: flagData.environment || 'Development',
      metrics: {
        error_rate: 0.1,
        response_time: 80,
        api_failures: 0,
        user_adoption: Number(flagData.rollout_percentage) || 0
      },
      aiRecommendation: {
        risk_score: 10,
        confidence_score: 85,
        recommendation: 'Continue',
        reason: 'Initial setup within baseline parameters.'
      },
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
      updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };

    setFlags(prev => [createdFlag, ...prev]);

    setAuditLogs(prev => [
      {
        id: Date.now(),
        flag_id: newId,
        user_name: 'Mishthi Chaurasia',
        action: `Created feature flag '${createdFlag.name}' in ${createdFlag.environment} (${createdFlag.rollout_percentage}% rollout)`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
      },
      ...prev
    ]);

    try {
      await apiCreateFlag(flagData);
    } catch (e) {
      // local fallback handled
    }

    return createdFlag;
  };

  // Edit Flag
  const editFlag = async (flagId, updates) => {
    const targetFlag = flags.find(f => f.id === flagId);
    setFlags(prev =>
      prev.map(f => {
        if (f.id === flagId) {
          return {
            ...f,
            ...updates,
            name: updates.name ? updates.name.trim().toLowerCase().replace(/\s+/g, '-') : f.name,
            rollout_percentage: updates.rollout_percentage !== undefined ? Number(updates.rollout_percentage) : f.rollout_percentage,
            updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
          };
        }
        return f;
      })
    );

    const flagName = targetFlag ? targetFlag.name : flagId;
    setAuditLogs(prev => [
      {
        id: Date.now(),
        flag_id: flagId,
        user_name: 'Project Admin',
        action: `Updated feature flag '${flagName}' configuration`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
      },
      ...prev
    ]);

    try {
      await apiUpdateFlag(flagId, updates);
    } catch (e) {
      // local fallback preserved
    }
  };

  // Delete Flag
  const deleteFlag = async (flagId) => {
    const targetFlag = flags.find(f => f.id === flagId);
    setFlags(prev => prev.filter(f => f.id !== flagId));

    const flagName = targetFlag ? targetFlag.name : flagId;
    const flagEnv = targetFlag ? targetFlag.environment : 'environment';
    setAuditLogs(prev => [
      {
        id: Date.now(),
        flag_id: null,
        user_name: 'Project Admin',
        action: `Deleted feature flag '${flagName}' from ${flagEnv}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
      },
      ...prev
    ]);

    try {
      await apiDeleteFlag(flagId);
    } catch (e) {
      // local fallback preserved
    }
  };

  // Run AI Decision-Support Assessment for a Flag
  const evaluateAiRecommendation = async (flagId) => {
    setIsAiLoading(true);
    setSelectedFlagId(flagId);
    try {
      const res = await apiGetFlagRecommendation(flagId);
      if (res && res.data) {
        setActiveRecommendation(res.data);
        return res.data;
      }
    } catch (e) {
      // Use flag's current telemetry to generate explainable advice
      const targetFlag = flags.find(f => f.id === Number(flagId));
      const metrics = targetFlag?.metrics || { error_rate: 0.5, response_time: 120, api_failures: 2, user_adoption: 30 };
      
      let riskScore = 15;
      let rec = 'Continue';
      let reason = `Rollout health is strong with an error rate of ${metrics.error_rate}%. Metrics remain within optimal performance limits.`;

      if (metrics.error_rate >= 5.0 || metrics.api_failures > 30) {
        riskScore = 82;
        rec = 'Pause';
        reason = `Error rate has reached ${metrics.error_rate}%, so disabling this feature is recommended until stability improves.`;
      } else if (metrics.error_rate >= 2.0 || metrics.response_time > 400) {
        riskScore = 55;
        rec = 'Pause';
        reason = `Response time is elevated at ${metrics.response_time}ms with an error rate of ${metrics.error_rate}%. Monitoring recommended before further rollout.`;
      }

      const fallbackResult = {
        flagId: Number(flagId),
        riskScore,
        reliabilityScore: 91,
        confidenceScore: 91,
        recommendation: rec,
        reason
      };

      setActiveRecommendation(fallbackResult);
      return fallbackResult;
    } finally {
      setIsAiLoading(false);
    }
  };

  // Filtered Flags
  const filteredFlags = flags.filter(flag => {
    const envFilter = selectedEnv.toLowerCase();
    const flagEnv = flag.environment.toLowerCase();
    const matchesEnv = selectedEnv === 'All' ||
      flagEnv === envFilter ||
      (envFilter === 'staging' && flagEnv === 'testing') ||
      (envFilter === 'testing' && flagEnv === 'staging');
    const matchesSearch = !searchQuery || 
      flag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      flag.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesEnv && matchesSearch;
  });

  return (
    <FlagContext.Provider
      value={{
        flags,
        filteredFlags,
        selectedEnv,
        setSelectedEnv,
        searchQuery,
        setSearchQuery,
        updateRolloutPercentage,
        updateFlagStatus,
        createFlag,
        editFlag,
        deleteFlag,
        auditLogs,
        evaluateAiRecommendation,
        activeRecommendation,
        isAiLoading,
        selectedFlagId,
        setSelectedFlagId
      }}
    >
      {children}
    </FlagContext.Provider>
  );
}

export function useFlags() {
  return useContext(FlagContext);
}
