import React, { createContext, useContext, useState, useEffect } from 'react';
import { FeatureFlag, AuditLog, AnalyticsSummary, ProjectEnvironment } from '../types';
import { flagsService } from '../services/flagsService';

interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface FlagContextType {
  flags: FeatureFlag[];
  selectedEnvironment: 'development' | 'staging' | 'production';
  setSelectedEnvironment: (env: 'development' | 'staging' | 'production') => void;
  environments: ProjectEnvironment[];
  auditLogs: AuditLog[];
  toasts: ToastItem[];
  addFlag: (flag: Omit<FeatureFlag, 'id' | 'createdAt' | 'updatedAt' | 'creator'>) => string;
  updateFlag: (id: string, updatedFlag: Partial<FeatureFlag>) => void;
  deleteFlag: (id: string) => void;
  toggleFlag: (flagId: string, env: 'development' | 'staging' | 'production') => void;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
  dismissToast: (id: string) => void;
  analytics: AnalyticsSummary;
  currentUser: { name: string; email: string; avatarUrl: string; role: string } | null;
  setCurrentUser: (user: any) => void;
}

const FlagContext = createContext<FlagContextType | undefined>(undefined);

export const FlagProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [flags, setFlags] = useState<FeatureFlag[]>(() => flagsService.getFlags());
  const [variationsStore, setVariationsStore] = useState<Record<string, any[]>>(() => flagsService.getVariationsStore());
  const [selectedEnvironment, setSelectedEnvironment] = useState<'development' | 'staging' | 'production'>(() => {
    const cached = localStorage.getItem('ff_selected_env');
    return (cached as any) || 'development';
  });
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => flagsService.getAuditLogs());
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(() => flagsService.getCurrentUser());

  useEffect(() => {
    flagsService.saveFlags(flags);
  }, [flags]);

  useEffect(() => {
    flagsService.saveVariationsStore(variationsStore);
  }, [variationsStore]);

  useEffect(() => {
    localStorage.setItem('ff_selected_env', selectedEnvironment);
  }, [selectedEnvironment]);

  useEffect(() => {
    flagsService.saveAuditLogs(auditLogs);
  }, [auditLogs]);

  useEffect(() => {
    flagsService.saveCurrentUser(currentUser);
  }, [currentUser]);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      dismissToast(id);
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const addFlag = (newFlagData: any) => {
    const flagId = `flag-${Math.random().toString(36).substring(2, 9)}`;
    const fullFlag: FeatureFlag = {
      id: flagId,
      key: newFlagData.key,
      name: newFlagData.name,
      description: newFlagData.description,
      type: newFlagData.type,
      status: 'active',
      tags: newFlagData.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      creator: {
        name: currentUser?.name || 'Sarah Connor',
        email: currentUser?.email || 'sarah@flagforge.co',
        avatarUrl: currentUser?.avatarUrl,
      },
      environments: {
        development: newFlagData.environments?.development || {
          isEnabled: false,
          rules: [],
          defaultServeVariationId: newFlagData.type === 'boolean' ? 'var-true' : '',
          offVariationId: newFlagData.type === 'boolean' ? 'var-false' : '',
        },
        staging: newFlagData.environments?.staging || {
          isEnabled: false,
          rules: [],
          defaultServeVariationId: newFlagData.type === 'boolean' ? 'var-true' : '',
          offVariationId: newFlagData.type === 'boolean' ? 'var-false' : '',
        },
        production: newFlagData.environments?.production || {
          isEnabled: false,
          rules: [],
          defaultServeVariationId: newFlagData.type === 'boolean' ? 'var-true' : '',
          offVariationId: newFlagData.type === 'boolean' ? 'var-false' : '',
        },
      },
    };

    const variations = newFlagData.variations || [
      { id: 'var-true', value: 'true', name: 'Enabled' },
      { id: 'var-false', value: 'false', name: 'Disabled' }
    ];
    setVariationsStore((prev) => ({
      ...prev,
      [flagId]: variations,
    }));

    setFlags((prev) => [fullFlag, ...prev]);

    const newLog: AuditLog = {
      id: `log-${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date().toISOString(),
      actor: {
        name: currentUser?.name || 'Sarah Connor',
        email: currentUser?.email || 'sarah@flagforge.co',
      },
      action: 'create',
      flagKey: fullFlag.key,
      flagName: fullFlag.name,
      environment: 'all',
      details: `Created feature flag: ${fullFlag.name} (${fullFlag.key})`
    };
    setAuditLogs((prev) => [newLog, ...prev]);
    showToast(`Feature flag '${fullFlag.name}' created successfully`, 'success');
    return flagId;
  };

  const updateFlag = (id: string, updatedFields: Partial<FeatureFlag> & { variations?: any[] }) => {
    setFlags((prev) =>
      prev.map((flag) => {
        if (flag.id === id) {
          const newFlag = {
            ...flag,
            ...updatedFields,
            updatedAt: new Date().toISOString(),
          };

          const log: AuditLog = {
            id: `log-${Math.random().toString(36).substring(2, 9)}`,
            timestamp: new Date().toISOString(),
            actor: {
              name: currentUser?.name || 'Sarah Connor',
              email: currentUser?.email || 'sarah@flagforge.co',
            },
            action: 'update',
            flagKey: flag.key,
            flagName: flag.name,
            environment: 'all',
            details: `Updated feature flag settings/rules for: ${flag.name}`
          };
          setAuditLogs((prevLogs) => [log, ...prevLogs]);

          return newFlag;
        }
        return flag;
      })
    );

    if (updatedFields.variations) {
      setVariationsStore((prev) => ({
        ...prev,
        [id]: updatedFields.variations!,
      }));
    }

    showToast('Feature flag updated successfully', 'success');
  };

  const deleteFlag = (id: string) => {
    const flag = flags.find((f) => f.id === id);
    if (!flag) return;

    setFlags((prev) => prev.filter((f) => f.id !== id));
    
    setVariationsStore((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });

    const log: AuditLog = {
      id: `log-${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date().toISOString(),
      actor: {
        name: currentUser?.name || 'Sarah Connor',
        email: currentUser?.email || 'sarah@flagforge.co',
      },
      action: 'delete',
      flagKey: flag.key,
      flagName: flag.name,
      environment: 'all',
      details: `Deleted feature flag: ${flag.name}`
    };
    setAuditLogs((prev) => [log, ...prev]);
    showToast(`Feature flag '${flag.name}' deleted`, 'info');
  };

  const toggleFlag = (flagId: string, env: 'development' | 'staging' | 'production') => {
    setFlags((prev) =>
      prev.map((flag) => {
        if (flag.id === flagId) {
          const currentStatus = flag.environments[env].isEnabled;
          const nextStatus = !currentStatus;

          const updatedEnvironments = {
            ...flag.environments,
            [env]: {
              ...flag.environments[env],
              isEnabled: nextStatus,
            },
          };

          const log: AuditLog = {
            id: `log-${Math.random().toString(36).substring(2, 9)}`,
            timestamp: new Date().toISOString(),
            actor: {
              name: currentUser?.name || 'Sarah Connor',
              email: currentUser?.email || 'sarah@flagforge.co',
            },
            action: 'toggle',
            flagKey: flag.key,
            flagName: flag.name,
            environment: env,
            details: `${nextStatus ? 'Enabled' : 'Disabled'} flag in ${env.toUpperCase()}`
          };
          setAuditLogs((prevLogs) => [log, ...prevLogs]);
          showToast(`${flag.name} is now ${nextStatus ? 'ENABLED' : 'DISABLED'} in ${env}`, 'success');

          return {
            ...flag,
            environments: updatedEnvironments,
            updatedAt: new Date().toISOString(),
          };
        }
        return flag;
      })
    );
  };

  const flagsWithVariations = flags.map(flag => ({
    ...flag,
    variations: variationsStore[flag.id] || []
  }));

  const initialAnalytics = flagsService.getAnalyticsSummary();
  const dynamicAnalytics = {
    ...initialAnalytics,
    totalEvaluations: initialAnalytics.totalEvaluations + (flags.length - 5) * 45000,
    activeEvaluations: flags.reduce((acc, flag) => {
      let activeCount = 0;
      if (flag.environments.development.isEnabled) activeCount++;
      if (flag.environments.staging.isEnabled) activeCount++;
      if (flag.environments.production.isEnabled) activeCount++;
      return acc + (activeCount * 24300);
    }, 150000),
  };

  return (
    <FlagContext.Provider
      value={{
        flags: flagsWithVariations,
        selectedEnvironment,
        setSelectedEnvironment,
        environments: flagsService.getEnvironments(),
        auditLogs,
        toasts,
        addFlag,
        updateFlag,
        deleteFlag,
        toggleFlag,
        showToast,
        dismissToast,
        analytics: dynamicAnalytics,
        currentUser,
        setCurrentUser,
      }}
    >
      {children}
    </FlagContext.Provider>
  );
};

export const useFlags = () => {
  const context = useContext(FlagContext);
  if (context === undefined) {
    throw new Error('useFlags must be used within a FlagProvider');
  }
  return context;
};
