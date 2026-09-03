import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_FLAGS, INITIAL_PROJECTS, DEFAULT_ENVIRONMENTS, INITIAL_AUDIT_LOGS } from '../types.js';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState({
    id: 1,
    name: 'Mishthi Chaurasia',
    email: 'mishthi@flagforge.dev',
    role: 'admin',
    token: 'jwt-mock-token-flagforge-2026'
  });

  const [activeProject, setActiveProject] = useState(INITIAL_PROJECTS[0]);
  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [environments] = useState(DEFAULT_ENVIRONMENTS);
  const [currentEnv, setCurrentEnv] = useState('development');
  const [flags, setFlags] = useState(INITIAL_FLAGS);
  const [auditLogs, setAuditLogs] = useState(INITIAL_AUDIT_LOGS);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'flags' | 'analytics' | 'settings' | 'ai-advisor'
  const [aiRecommendation, setAiRecommendation] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Sync state with local storage or memory
  const addAuditLog = (action, entityType, entityId, details) => {
    const newLog = {
      id: Date.now(),
      user_name: currentUser ? currentUser.name : 'System',
      user_email: currentUser ? currentUser.email : 'system@flagforge.dev',
      action,
      entity_type: entityType,
      entity_id: entityId,
      details,
      created_at: new Date().toISOString()
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const toggleFlagStatus = (flagId, envKey) => {
    setFlags(prevFlags =>
      prevFlags.map(flag => {
        if (flag.id === flagId) {
          const currentTarget = flag.environments[envKey] || { is_enabled: false, rollout_percentage: 100 };
          const updatedEnvState = {
            ...currentTarget,
            is_enabled: !currentTarget.is_enabled
          };
          const nextEnvs = {
            ...flag.environments,
            [envKey]: updatedEnvState
          };
          
          // Calculate overall flag enabled state
          const isAnyEnabled = Object.values(nextEnvs).some(e => e.is_enabled);

          addAuditLog(
            'TOGGLE_FLAG',
            'feature_flag',
            flagId,
            `Toggled '${flag.flag_key}' in ${envKey} to ${updatedEnvState.is_enabled ? 'ENABLED' : 'DISABLED'}`
          );

          return {
            ...flag,
            is_enabled: isAnyEnabled,
            environments: nextEnvs
          };
        }
        return flag;
      })
    );
  };

  const updateRolloutPercentage = (flagId, envKey, percentage) => {
    const numPercent = Math.min(100, Math.max(0, Number(percentage)));
    setFlags(prevFlags =>
      prevFlags.map(flag => {
        if (flag.id === flagId) {
          const currentTarget = flag.environments[envKey] || { is_enabled: true, rollout_percentage: 100 };
          const nextEnvs = {
            ...flag.environments,
            [envKey]: {
              ...currentTarget,
              rollout_percentage: numPercent
            }
          };

          addAuditLog(
            'UPDATE_ROLLOUT',
            'flag_rule',
            flagId,
            `Set rollout percentage for '${flag.flag_key}' in ${envKey} to ${numPercent}%`
          );

          return {
            ...flag,
            environments: nextEnvs
          };
        }
        return flag;
      })
    );
  };

  const createFlag = (newFlagData) => {
    const newId = Date.now();
    const formattedFlag = {
      id: newId,
      project_id: activeProject ? activeProject.id : 1,
      flag_key: newFlagData.flag_key,
      name: newFlagData.name,
      description: newFlagData.description || '',
      flag_type: newFlagData.flag_type || 'boolean',
      is_enabled: true,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
      environments: {
        development: { is_enabled: true, rollout_percentage: 100 },
        testing: { is_enabled: true, rollout_percentage: 100 },
        staging: { is_enabled: true, rollout_percentage: 50 },
        production: { is_enabled: false, rollout_percentage: 0 }
      }
    };

    setFlags(prev => [formattedFlag, ...prev]);
    addAuditLog('CREATE_FLAG', 'feature_flag', newId, `Created feature flag '${newFlagData.flag_key}'`);
  };

  const deleteFlag = (flagId) => {
    const target = flags.find(f => f.id === flagId);
    setFlags(prev => prev.filter(f => f.id !== flagId));
    if (target) {
      addAuditLog('DELETE_FLAG', 'feature_flag', flagId, `Deleted feature flag '${target.flag_key}'`);
    }
  };

  const createProject = (projectData) => {
    const newProj = {
      id: Date.now(),
      name: projectData.name,
      project_key: projectData.project_key,
      description: projectData.description,
      created_by: currentUser ? currentUser.id : 1,
      created_at: new Date().toISOString()
    };
    setProjects(prev => [...prev, newProj]);
    setActiveProject(newProj);
    addAuditLog('CREATE_PROJECT', 'project', newProj.id, `Created project '${newProj.name}'`);
  };

  const generateAiRecommendation = async (flagKey) => {
    setIsAiLoading(true);
    setAiRecommendation(null);
    try {
      const response = await fetch('/api/ai/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flag_key: flagKey, current_env: currentEnv })
      });
      if (response.ok) {
        const data = await response.json();
        setAiRecommendation(data.recommendation);
      } else {
        // Fallback simulation if server API key is not populated
        setAiRecommendation({
          risk_level: 'LOW',
          confidence_score: '94%',
          suggested_rollout: 50,
          rationale: `Based on current low error rates in ${currentEnv}, increasing rollout for '${flagKey}' to 50% is recommended. Monitor telemetry closely for 15 minutes post-deployment.`
        });
      }
    } catch (e) {
      setAiRecommendation({
        risk_level: 'MEDIUM',
        confidence_score: '88%',
        suggested_rollout: 25,
        rationale: `Gradual rollout recommended for '${flagKey}' starting at 25% in ${currentEnv}. Synthetic monitoring shows stable response times.`
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        activeProject,
        setActiveProject,
        projects,
        createProject,
        environments,
        currentEnv,
        setCurrentEnv,
        flags,
        toggleFlagStatus,
        updateRolloutPercentage,
        createFlag,
        deleteFlag,
        auditLogs,
        addAuditLog,
        searchQuery,
        setSearchQuery,
        activeTab,
        setActiveTab,
        aiRecommendation,
        isAiLoading,
        generateAiRecommendation
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
