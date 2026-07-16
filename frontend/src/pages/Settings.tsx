import React, { useState } from 'react';
import {
  Key,
  RotateCw,
  Copy,
  Check,
  Terminal,
  ShieldCheck,
  Users,
  Settings as SettingsIcon,
  Server,
  CloudLightning,
  AlertTriangle
} from 'lucide-react';
import { useFlags } from '../context/FlagContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Input } from '../components/Input';
import { Modal } from '../components/Modal';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'Owner' | 'Administrator' | 'Editor' | 'Developer';
  status: 'active' | 'pending';
}

export const Settings: React.FC = () => {
  const { environments, showToast } = useFlags();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Simulated keys rotation
  const [rotatedEnvId, setRotatedEnvId] = useState<string | null>(null);
  const [isRotateModalOpen, setIsRotateModalOpen] = useState(false);
  const [dynamicKeys, setDynamicKeys] = useState<Record<string, string>>(() => {
    const keys: Record<string, string> = {};
    environments.forEach((env) => {
      keys[env.id] = env.sdkKey;
    });
    return keys;
  });

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { id: 'u-1', name: 'Sarah Connor', email: 'sarah@flagforge.co', role: 'Owner', status: 'active' },
    { id: 'u-2', name: 'Alex Rivera', email: 'alex@flagforge.co', role: 'Administrator', status: 'active' },
    { id: 'u-3', name: 'James Carter', email: 'james@flagforge.co', role: 'Editor', status: 'active' },
    { id: 'u-4', name: 'Nikhil Mehta', email: 'nikhil@flagforge.co', role: 'Developer', status: 'pending' },
  ]);

  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'Owner' | 'Administrator' | 'Editor' | 'Developer'>('Developer');

  const handleCopyKey = (keyString: string, id: string) => {
    navigator.clipboard.writeText(keyString);
    setCopiedKey(id);
    showToast('Secret key copied to clipboard', 'success');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleRotateTrigger = (envId: string) => {
    setRotatedEnvId(envId);
    setIsRotateModalOpen(true);
  };

  const handleRotateConfirm = () => {
    if (rotatedEnvId) {
      const generated = `ff_sdk_${rotatedEnvId}_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`;
      setDynamicKeys((prev) => ({
        ...prev,
        [rotatedEnvId]: generated,
      }));
      showToast(`Rotated SDK key successfully for ${rotatedEnvId.toUpperCase()}`, 'success');
      setIsRotateModalOpen(false);
      setRotatedEnvId(null);
    }
  };

  const handleInviteMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberEmail.trim() || !newMemberEmail.includes('@')) {
      showToast('Please specify a valid email address.', 'error');
      return;
    }

    const newMember: TeamMember = {
      id: `u-${Math.random().toString(36).substring(2, 9)}`,
      name: newMemberEmail.split('@')[0],
      email: newMemberEmail,
      role: newMemberRole,
      status: 'pending',
    };

    setTeamMembers((prev) => [...prev, newMember]);
    setNewMemberEmail('');
    showToast(`Invite successfully transmitted to ${newMemberEmail}`, 'success');
  };

  return (
    <div className="space-y-6 select-none">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white font-sans flex items-center gap-2">
          Workspace Settings
        </h1>
        <p className="text-zinc-400 text-sm mt-1">
          Review secure platform secrets, team collaborators, and CLI installations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Secrets block (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* SDK keys Panel */}
          <Card className="border-zinc-800 bg-zinc-950/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5 text-indigo-400" />
                <span>Environment SDK Keys</span>
              </CardTitle>
              <CardDescription>
                Secrets authorized to make edge routing evaluations. Do not expose production secrets in browser client code.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {environments.map((env) => {
                const sdkKeyVal = dynamicKeys[env.id];
                return (
                  <div
                    key={env.id}
                    className="p-4 bg-zinc-900 border border-zinc-800 rounded-md space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold capitalize text-zinc-200">
                          {env.name}
                        </span>
                        <Badge variant="secondary" className="text-[9px] px-1.5 py-0 uppercase">
                          {env.id}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="password"
                        readOnly
                        value={sdkKeyVal}
                        className="flex-grow bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-xs font-mono text-zinc-400 outline-none select-all focus:ring-1 focus:ring-indigo-500"
                      />
                      <Button
                        variant="secondary"
                        size="icon"
                        onClick={() => handleCopyKey(sdkKeyVal, `${env.id}-sdk`)}
                        className="h-9 w-9 text-zinc-400 hover:text-white"
                        title="Copy to clipboard"
                      >
                        {copiedKey === `${env.id}-sdk` ? (
                          <Check className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRotateTrigger(env.id)}
                        className="h-9 w-9 text-zinc-500 hover:text-red-400"
                        title="Rotate key"
                      >
                        <RotateCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* CLI quickstart command block */}
          <Card className="border-zinc-800 bg-zinc-950/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Terminal className="h-5 w-5 text-indigo-400" />
                <span>Configure CLI Setup</span>
              </CardTitle>
              <CardDescription>
                Establish workspace queries on compile pipelines using our native CLI utility.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-zinc-400 leading-normal">
                Developers can interact with local flags directly via local environment hooks. Install and authenticate by pasting this command:
              </p>
              <div className="relative">
                <code className="block p-3.5 bg-zinc-900 border border-zinc-800 rounded-md text-xs font-mono text-zinc-300 pr-12 overflow-x-auto select-all leading-relaxed">
                  npm install -g @flagforge/cli && flagforge login --token=ff_tok_a7e2b39
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2 h-7 w-7 text-zinc-500 hover:text-white"
                  onClick={() => handleCopyKey('npm install -g @flagforge/cli && flagforge login --token=ff_tok_a7e2b39', 'cli')}
                >
                  {copiedKey === 'cli' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Team block (1/3 width) */}
        <div className="space-y-6">
          <Card className="border-zinc-800 bg-zinc-950/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-indigo-400" />
                <span>Team Members</span>
              </CardTitle>
              <CardDescription>Workspace access controls</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Member lists */}
              <div className="space-y-3.5 pb-4 border-b border-zinc-800">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <span className="font-semibold text-zinc-200 block capitalize">
                        {member.name}
                      </span>
                      <span className="text-[10px] text-zinc-500 block truncate max-w-[150px]">
                        {member.email}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold text-zinc-400 font-mono">
                        {member.role}
                      </span>
                      {member.status === 'pending' && (
                        <Badge variant="warning" className="text-[8px] px-1 py-0 font-mono">
                          Pending
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Add member form */}
              <form onSubmit={handleInviteMember} className="space-y-3">
                <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block">Invite Collaborator</span>
                <div className="grid grid-cols-1 gap-2">
                  <input
                    type="email"
                    placeholder="developer@company.com"
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    className="bg-zinc-900 border border-zinc-800 rounded-md text-xs px-3 py-2.5 outline-none text-zinc-200 focus:ring-1 focus:ring-indigo-500"
                  />
                  <div className="flex gap-2">
                    <select
                      value={newMemberRole}
                      onChange={(e: any) => setNewMemberRole(e.target.value)}
                      className="flex-grow bg-zinc-900 border border-zinc-800 rounded-md text-xs px-2.5 py-2 outline-none text-zinc-200 cursor-pointer focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="Administrator">Admin</option>
                      <option value="Editor">Editor</option>
                      <option value="Developer">Developer</option>
                    </select>
                    <Button type="submit" variant="primary" size="sm" className="h-9">
                      Invite
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* System status details card */}
          <Card className="border-zinc-800 bg-zinc-950/40">
            <CardContent className="p-4 space-y-3.5 text-xs text-zinc-400 leading-normal">
              <div className="flex items-center gap-2 text-zinc-200 font-semibold">
                <ShieldCheck className="h-4.5 w-4.5 text-indigo-400" />
                <span>Security Standards Compliance</span>
              </div>
              <p>
                FlagForge routing utilizes SHA-256 secure hash matching which guarantees that user context parameters never transmit or leak beyond memory cache blocks.
              </p>
              <div className="p-3 bg-indigo-950/20 border border-indigo-500/10 rounded-lg text-[11px] text-indigo-400">
                Uptime SLAs, logs configuration histories, and security audits can be verified in real-time.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* --- ROTATE KEY CONFIRMATION MODAL --- */}
      <Modal
        isOpen={isRotateModalOpen}
        onClose={() => setIsRotateModalOpen(false)}
        title="Confirm SDK Secrets Rotation"
        description="Warning: Rotating this SDK Secret will instantly invalidate the current active key inside your client integrations."
      >
        <div className="space-y-5 select-none">
          <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400 flex items-start gap-3">
            <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <span className="font-bold">Dangerous Action:</span>
              <p className="leading-relaxed">
                Make sure you have mapped the rotated key inside your server config variables before executing. Old keys are garbage-collected instantly.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setIsRotateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleRotateConfirm}>
              Rotate Secret Key
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
export default Settings;
