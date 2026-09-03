import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { Settings, Shield, Key, Database, Server, Save } from 'lucide-react';

export default function SettingsPage() {
  const { currentUser, activeProject } = useApp();
  const [apiKey, setApiKey] = useState('ff_live_8f3a921b7c4d5e120a9931ef');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Project & Platform Settings</h1>
        <p className="text-xs text-gray-400 mt-1">
          Configure API credentials, Flask server host endpoints, and SDK SDK keys
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* API Credentials */}
        <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 border-b border-[#1e293b] pb-3">
            <Key className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-bold text-white">SDK Client Credentials</h2>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[#94a3b8]">Live Client SDK Key</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="flex-1 bg-[#1e293b] border border-[#334155] rounded-lg px-4 py-2 text-xs font-mono text-gray-200 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={() => setApiKey(`ff_live_${Math.random().toString(36).substring(2, 15)}`)}
                className="bg-[#1e293b] hover:bg-[#334155] text-xs font-semibold text-gray-200 px-3 py-2 rounded-lg border border-[#334155]"
              >
                Regenerate Key
              </button>
            </div>
          </div>
        </div>

        {/* Database & Flask Host Configuration */}
        <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 border-b border-[#1e293b] pb-3">
            <Database className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white">Backend Database Connection</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#94a3b8] mb-1">Database Engine</label>
              <input
                type="text"
                disabled
                value="MySQL 8.0 (Relational)"
                className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-4 py-2 text-xs font-mono text-[#94a3b8]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#94a3b8] mb-1">Flask Host Endpoint</label>
              <input
                type="text"
                defaultValue="http://127.0.0.1:5000"
                className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-4 py-2 text-xs font-mono text-gray-200"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-6 py-2.5 rounded-lg shadow-lg shadow-indigo-600/20 flex items-center gap-2 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>

          {isSaved && (
            <span className="text-xs font-semibold text-emerald-400">
              Settings updated successfully!
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
