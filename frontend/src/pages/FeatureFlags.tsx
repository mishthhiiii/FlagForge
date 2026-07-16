import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  Plus,
  MoreVertical,
  Eye,
  Edit2,
  Trash2,
  SlidersHorizontal,
  ChevronRight,
  ExternalLink,
  Tag
} from 'lucide-react';
import { useFlags } from '../context/FlagContext';
import { Button } from '../components/Button';
import { Card, CardContent } from '../components/Card';
import { Badge } from '../components/Badge';
import { Toggle } from '../components/Toggle';
import { Modal } from '../components/Modal';

export const FeatureFlags: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { flags, selectedEnvironment, toggleFlag, deleteFlag } = useFlags();

  // Search and Filter States
  const urlSearchQuery = searchParams.get('search') || '';
  const [searchQuery, setSearchQuery] = useState(urlSearchQuery);
  const [statusFilter, setStatusFilter] = useState<'all' | 'enabled' | 'disabled'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'boolean' | 'multivariate' | 'json'>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');

  // Deletion Modal States
  const [flagToDelete, setFlagToDelete] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Get unique tags for filter option
  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    flags.forEach((f) => f.tags.forEach((t) => tagsSet.add(t)));
    return Array.from(tagsSet);
  }, [flags]);

  // Sync state with URL search query if it changes
  React.useEffect(() => {
    setSearchQuery(urlSearchQuery);
  }, [urlSearchQuery]);

  // Filter and Search logic
  const filteredFlags = useMemo(() => {
    return flags.filter((flag) => {
      // Search text match
      const matchesSearch =
        flag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        flag.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
        flag.description.toLowerCase().includes(searchQuery.toLowerCase());

      // Status match based on chosen environment
      const isEnabled = flag.environments[selectedEnvironment]?.isEnabled;
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'enabled' && isEnabled) ||
        (statusFilter === 'disabled' && !isEnabled);

      // Type match
      const matchesType = typeFilter === 'all' || flag.type === typeFilter;

      // Tag match
      const matchesTag = selectedTag === 'all' || flag.tags.includes(selectedTag);

      return matchesSearch && matchesStatus && matchesType && matchesTag;
    });
  }, [flags, searchQuery, statusFilter, typeFilter, selectedTag, selectedEnvironment]);

  const handleDeleteTrigger = (id: string) => {
    setFlagToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (flagToDelete) {
      deleteFlag(flagToDelete);
      setFlagToDelete(null);
      setIsDeleteModalOpen(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    setSearchParams(val ? { search: val } : {});
  };

  return (
    <div className="space-y-6 select-none">
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white font-sans flex items-center gap-2.5">
            Feature Flags
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Create, target, and roll out features dynamically across client platforms.
          </p>
        </div>

        <Button
          variant="primary"
          icon={<Plus className="h-4.5 w-4.5" />}
          onClick={() => navigate('/flags/new')}
        >
          New Feature Flag
        </Button>
      </div>

      {/* Filter and Search Bar Card */}
      <Card className="border-zinc-800 bg-zinc-950/20">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Left search */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 h-4 w-4 text-zinc-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by key, name, description..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-md text-sm pl-10 pr-3.5 py-1.5 outline-none focus:ring-1 focus:ring-indigo-500 transition-all text-zinc-200"
            />
          </div>

          {/* Right Filters dropdown buttons */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Status filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status:</span>
              <select
                value={statusFilter}
                onChange={(e: any) => setStatusFilter(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 rounded-md text-xs px-2.5 py-1.5 outline-none text-zinc-300 focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="enabled">Active / On</option>
                <option value="disabled">Inactive / Off</option>
              </select>
            </div>

            {/* Type filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Type:</span>
              <select
                value={typeFilter}
                onChange={(e: any) => setTypeFilter(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 rounded-md text-xs px-2.5 py-1.5 outline-none text-zinc-300 focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="all">All Types</option>
                <option value="boolean">Boolean</option>
                <option value="multivariate">Multivariate</option>
                <option value="json">JSON Config</option>
              </select>
            </div>

            {/* Tag filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Tag:</span>
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 rounded-md text-xs px-2.5 py-1.5 outline-none text-zinc-300 focus:ring-1 focus:ring-indigo-500 cursor-pointer max-w-[120px]"
              >
                <option value="all">All Tags</option>
                {allTags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Flags Table Grid */}
      <Card className="border-zinc-800 bg-zinc-900/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/80 text-[11px] uppercase tracking-wider text-zinc-500">
                <th className="py-3 px-6 font-semibold">Flag Identity</th>
                <th className="py-3 px-4 font-semibold">Flag Type</th>
                <th className="py-3 px-4 font-semibold">Environment Rules</th>
                <th className="py-3 px-6 text-center font-semibold" style={{ width: '130px' }}>
                  {selectedEnvironment.toUpperCase()} Status
                </th>
                <th className="py-3 px-6 text-right font-semibold" style={{ width: '150px' }}></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {filteredFlags.length > 0 ? (
                filteredFlags.map((flag) => {
                  const isEnabledInEnv = flag.environments[selectedEnvironment]?.isEnabled;
                  const rulesCount = flag.environments[selectedEnvironment]?.rules?.length || 0;

                  return (
                    <tr
                      key={flag.id}
                      className="group hover:bg-zinc-900/10 transition-all align-middle"
                    >
                      {/* Flag Details columns */}
                      <td className="py-4 px-6">
                        <div className="flex flex-col gap-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              onClick={() => navigate(`/flags/${flag.id}`)}
                              className="text-sm font-bold text-zinc-100 hover:text-indigo-400 hover:underline cursor-pointer transition-colors"
                            >
                              {flag.name}
                            </span>
                            <span className="text-[10px] font-mono text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">
                              {flag.key}
                            </span>
                          </div>
                          <span className="text-xs text-zinc-400 truncate max-w-sm">
                            {flag.description || 'No description provided.'}
                          </span>
                          {/* Tags pill */}
                          {flag.tags && flag.tags.length > 0 && (
                            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                              {flag.tags.map((tag) => (
                                <span
                                  key={tag}
                                  onClick={() => setSelectedTag(tag)}
                                  className="inline-flex items-center gap-1 text-[10px] text-zinc-400 bg-zinc-900 hover:bg-zinc-800 hover:text-zinc-200 px-2 py-0.5 rounded cursor-pointer transition-colors border border-zinc-800/40"
                                >
                                  <Tag className="h-2.5 w-2.5 text-zinc-500" />
                                  <span>{tag}</span>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Flag Type badges */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <Badge
                          variant={
                            flag.type === 'boolean'
                              ? 'primary'
                              : flag.type === 'json'
                              ? 'warning'
                              : 'purple'
                          }
                          className="capitalize text-[10px]"
                        >
                          {flag.type}
                        </Badge>
                      </td>

                      {/* Environment configurations info */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="text-xs text-zinc-300">
                          {rulesCount > 0 ? (
                            <span className="text-indigo-400 font-semibold">
                              {rulesCount} target rules
                            </span>
                          ) : (
                            <span className="text-zinc-500">Default targeting fallback</span>
                          )}
                        </div>
                      </td>

                      {/* Live Environment Toggle switch */}
                      <td className="py-4 px-6 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <Toggle
                            checked={isEnabledInEnv}
                            onChange={() => toggleFlag(flag.id, selectedEnvironment)}
                            size="md"
                          />
                        </div>
                      </td>

                      {/* Control buttons */}
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1 justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-zinc-400 hover:text-white"
                            onClick={() => navigate(`/flags/${flag.id}`)}
                            title="View Flag targeting details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-zinc-400 hover:text-indigo-400"
                            onClick={() => navigate(`/flags/${flag.id}/edit`)}
                            title="Edit configurations"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-zinc-500 hover:text-red-400"
                            onClick={() => handleDeleteTrigger(flag.id)}
                            title="Delete flag key"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 px-6 text-center text-zinc-500">
                    <div className="max-w-md mx-auto space-y-2.5">
                      <SlidersHorizontal className="h-10 w-10 text-zinc-600 mx-auto opacity-70" />
                      <p className="font-semibold text-zinc-300">No feature flags found</p>
                      <p className="text-xs text-zinc-500 leading-normal">
                        We couldn't find any feature flags matching your search terms or filter combinations. Try resetting filters.
                      </p>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setSearchQuery('');
                          setStatusFilter('all');
                          setTypeFilter('all');
                          setSelectedTag('all');
                          setSearchParams({});
                        }}
                        className="mt-3 text-xs"
                      >
                        Reset Search Filters
                      </Button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* --- CONFIRM DELETION MODAL --- */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Feature Flag Deletion"
        description="This action is highly destructive and irreversible. Deleting a feature flag key will instantly trigger error catch-blocks in your SDK instances. Proceed with caution."
      >
        <div className="space-y-5 select-none">
          <div className="p-3.5 bg-red-500/10 border border-red-500/25 rounded-lg text-xs text-red-400 flex items-start gap-3">
            <Trash2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <span className="font-semibold">Safety warning:</span>
              <p className="leading-relaxed">
                Ensure that this key is completely removed from your code references across your production servers first. Active client SDKs requesting this key will receive the client-side fallback value instead.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteConfirm}>
              Permanently Delete Key
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
export default FeatureFlags;
