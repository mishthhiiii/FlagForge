import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Layers, Plus, Trash, HelpCircle, Save, ArrowLeft, PlusCircle } from 'lucide-react';
import { useFlags } from '../context/FlagContext';
import { Button } from '../components/Button';
import { Input, Textarea } from '../components/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/Card';
import { Badge } from '../components/Badge';

export const FlagForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { flags, addFlag, updateFlag, showToast } = useFlags();

  const isEditMode = !!id;

  // Form State
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'boolean' | 'multivariate' | 'json'>('boolean');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  // Variations list state
  const [variations, setVariations] = useState<any[]>([
    { id: 'var-true', value: 'true', name: 'Enabled' },
    { id: 'var-false', value: 'false', name: 'Disabled' }
  ]);

  // Environment configs (default selections)
  const [devDefaultServe, setDevDefaultServe] = useState('var-true');
  const [devOffServe, setDevOffServe] = useState('var-false');
  const [stgDefaultServe, setStgDefaultServe] = useState('var-true');
  const [stgOffServe, setStgOffServe] = useState('var-false');
  const [prodDefaultServe, setProdDefaultServe] = useState('var-true');
  const [prodOffServe, setProdOffServe] = useState('var-false');

  // Pre-populate if in edit mode
  useEffect(() => {
    if (isEditMode && flags) {
      const existing = flags.find((f) => f.id === id);
      if (existing) {
        setName(existing.name);
        setKey(existing.key);
        setDescription(existing.description);
        setType(existing.type);
        setTags(existing.tags || []);
        
        const vars = existing.variations || [];
        setVariations(vars);

        // Prepopulate defaults
        setDevDefaultServe(existing.environments.development.defaultServeVariationId || (vars[0]?.id || ''));
        setDevOffServe(existing.environments.development.offVariationId || (vars[1]?.id || ''));
        
        setStgDefaultServe(existing.environments.staging.defaultServeVariationId || (vars[0]?.id || ''));
        setStgOffServe(existing.environments.staging.offVariationId || (vars[1]?.id || ''));
        
        setProdDefaultServe(existing.environments.production.defaultServeVariationId || (vars[0]?.id || ''));
        setProdOffServe(existing.environments.production.offVariationId || (vars[1]?.id || ''));
      } else {
        showToast('Feature flag not found.', 'error');
        navigate('/flags');
      }
    }
  }, [isEditMode, id, flags]);

  // Auto-slugify key based on name (only in creation mode)
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!isEditMode) {
      const slugified = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setKey(slugified);
    }
  };

  // Switch variation layout depending on Type selected
  useEffect(() => {
    if (isEditMode) return; // variations are locked or pre-populated in edit mode
    
    if (type === 'boolean') {
      setVariations([
        { id: 'var-true', value: 'true', name: 'Enabled' },
        { id: 'var-false', value: 'false', name: 'Disabled' }
      ]);
      setDevDefaultServe('var-true');
      setDevOffServe('var-false');
    } else if (type === 'multivariate') {
      setVariations([
        { id: 'var-cta-control', value: 'control', name: 'Control (A)' },
        { id: 'var-cta-variant-b', value: 'variant-b', name: 'Variant B' },
      ]);
      setDevDefaultServe('var-cta-control');
      setDevOffServe('var-cta-control');
    } else if (type === 'json') {
      setVariations([
        { id: 'var-json-a', value: '{"layout":"grid","items":4}', name: 'Layout Grid' },
        { id: 'var-json-b', value: '{"layout":"list","items":10}', name: 'Layout List' }
      ]);
      setDevDefaultServe('var-json-a');
      setDevOffServe('var-json-b');
    }
  }, [type, isEditMode]);

  // Sync state selectors when variations change
  useEffect(() => {
    if (variations.length > 0) {
      const varIds = variations.map((v) => v.id);
      if (!varIds.includes(devDefaultServe)) setDevDefaultServe(varIds[0] || '');
      if (!varIds.includes(devOffServe)) setDevOffServe(varIds[0] || '');
      if (!varIds.includes(stgDefaultServe)) setStgDefaultServe(varIds[0] || '');
      if (!varIds.includes(stgOffServe)) setStgOffServe(varIds[0] || '');
      if (!varIds.includes(prodDefaultServe)) setProdDefaultServe(varIds[0] || '');
      if (!varIds.includes(prodOffServe)) setProdOffServe(varIds[0] || '');
    }
  }, [variations]);

  // Handle adding custom variations
  const handleAddVariation = () => {
    const newId = `var-custom-${Math.random().toString(36).substring(2, 9)}`;
    setVariations((prev) => [
      ...prev,
      {
        id: newId,
        value: type === 'json' ? '{}' : 'new-variation',
        name: `Variation #${prev.length + 1}`,
      },
    ]);
  };

  const handleRemoveVariation = (varId: string) => {
    if (variations.length <= 2) {
      showToast('A minimum of two variations is required to support toggling states', 'error');
      return;
    }
    setVariations((prev) => prev.filter((v) => v.id !== varId));
  };

  const handleVariationFieldChange = (idx: number, field: string, val: string) => {
    setVariations((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: val };
      return copy;
    });
  };

  // Add tag keys
  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const cleaned = tagInput.trim().replace(/[^a-zA-Z0-9_-]/g, '');
      if (cleaned && !tags.includes(cleaned)) {
        setTags((prev) => [...prev, cleaned]);
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (tagText: string) => {
    setTags((prev) => prev.filter((t) => t !== tagText));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!key || !name) {
      showToast('Name and unique Flag Key are required.', 'error');
      return;
    }

    // JSON variation validation
    if (type === 'json') {
      for (const v of variations) {
        try {
          JSON.parse(v.value);
        } catch (err) {
          showToast(`Invalid JSON syntax inside Variation: "${v.name}"`, 'error');
          return;
        }
      }
    }

    const payload: any = {
      key,
      name,
      description,
      type,
      tags,
      variations,
      environments: {
        development: {
          isEnabled: isEditMode ? flags.find((f) => f.id === id)?.environments.development.isEnabled || false : false,
          rules: isEditMode ? flags.find((f) => f.id === id)?.environments.development.rules || [] : [],
          defaultServeVariationId: devDefaultServe,
          offVariationId: devOffServe,
        },
        staging: {
          isEnabled: isEditMode ? flags.find((f) => f.id === id)?.environments.staging.isEnabled || false : false,
          rules: isEditMode ? flags.find((f) => f.id === id)?.environments.staging.rules || [] : [],
          defaultServeVariationId: stgDefaultServe,
          offVariationId: stgOffServe,
        },
        production: {
          isEnabled: isEditMode ? flags.find((f) => f.id === id)?.environments.production.isEnabled || false : false,
          rules: isEditMode ? flags.find((f) => f.id === id)?.environments.production.rules || [] : [],
          defaultServeVariationId: prodDefaultServe,
          offVariationId: prodOffServe,
        },
      },
    };

    if (isEditMode) {
      updateFlag(id!, payload);
      navigate(`/flags/${id}`);
    } else {
      const newId = addFlag(payload);
      navigate(`/flags/${newId}`);
    }
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-8 select-none">
      {/* Header and Back navigation */}
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => navigate(isEditMode ? `/flags/${id}` : '/flags')}
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors w-fit cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to feature flags</span>
        </button>

        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            {isEditMode ? 'Edit Feature Flag' : 'Create Feature Flag'}
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            {isEditMode
              ? `Update configurations and variations for ${key}`
              : 'Add a new toggle, string, or JSON-payload configuration flag.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core Settings Form (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-zinc-800 bg-zinc-950/40">
            <CardHeader>
              <CardTitle>Core Configurations</CardTitle>
              <CardDescription>Specify name and keys referencing code integrations.</CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input
                  label="Flag Display Name"
                  placeholder="e.g., New Stripe Checkout"
                  value={name}
                  onChange={handleNameChange}
                  required
                  disabled={isEditMode}
                />

                <Input
                  label="Flag Unique Key"
                  placeholder="e.g., new-stripe-checkout"
                  value={key}
                  onChange={(e) => setKey(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                  required
                  disabled={isEditMode}
                  helperText="The unique string key used to query evaluations within SDK code."
                />
              </div>

              <Textarea
                label="Description"
                placeholder="Describe why this feature flag exists, target release plan, or owner details..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              {/* Type Switcher Selector (Locked in Edit Mode) */}
              <div className="w-full flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                  Flag Evaluation Type
                </label>
                <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: 'boolean', label: 'Boolean', desc: 'true or false values' },
                        { id: 'multivariate', label: 'Multivariate', desc: 'Custom strings or weights' },
                        { id: 'json', label: 'JSON Config', desc: 'Structured config payloads' },
                      ].map((t) => {
                        const active = type === t.id;
                        const disabled = isEditMode;
                        return (
                          <div
                            key={t.id}
                            onClick={() => !disabled && setType(t.id as any)}
                            className={`p-3.5 border rounded-md text-left cursor-pointer transition-all ${
                              active
                                ? 'bg-indigo-500/10 border-indigo-500 text-white shadow-md shadow-indigo-600/5'
                                : 'border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-900/10'
                            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                        <span className="text-sm font-semibold block text-zinc-100">{t.label}</span>
                        <span className="text-[10px] text-zinc-500 mt-0.5 block">{t.desc}</span>
                      </div>
                    );
                  })}
                </div>
                {isEditMode && (
                  <span className="text-[10px] text-zinc-500">
                    * The evaluation type is locked to prevent code compilation failures.
                  </span>
                )}
              </div>

              {/* Tag configurations */}
              <div className="flex flex-col gap-1.5">
                <Input
                  label="Tags & Labels"
                  placeholder="Press Enter or ',' to add labels..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  helperText="Label tags are useful for quick filtering on the dashboard (e.g., 'Release-Q3', 'Billing')."
                />
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="py-1 px-2.5 flex items-center gap-1.5 cursor-pointer text-[10px]"
                        onClick={() => handleRemoveTag(tag)}
                      >
                        <span>{tag}</span>
                        <span className="text-red-400 text-xs font-black">×</span>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Variations Section */}
          <Card className="border-zinc-800 bg-zinc-950/40">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Evaluation Variations</CardTitle>
                <CardDescription>
                  Determine values returned by client integrations.
                </CardDescription>
              </div>

              {type !== 'boolean' && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleAddVariation}
                  icon={<PlusCircle className="h-4 w-4" />}
                >
                  Add Variation
                </Button>
              )}
            </CardHeader>

            <CardContent className="space-y-4">
              {variations.map((v, idx) => (
                <div key={v.id} className="flex gap-4 items-start p-4 bg-zinc-900 border border-zinc-800 rounded-md">
                  <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Label Name"
                      placeholder="e.g., Enable beta grid"
                      value={v.name}
                      onChange={(e) => handleVariationFieldChange(idx, 'name', e.target.value)}
                      required
                    />

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                        Returned Value
                      </label>
                      {type === 'json' ? (
                        <textarea
                          placeholder='{"theme":"dark"}'
                          value={v.value}
                          onChange={(e) => handleVariationFieldChange(idx, 'value', e.target.value)}
                          className="bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-md text-sm px-3 py-2 outline-none h-11 font-mono resize-y focus:ring-1 focus:ring-indigo-500"
                          required
                        />
                      ) : (
                        <input
                          type="text"
                          placeholder="e.g., true"
                          value={v.value}
                          disabled={type === 'boolean'}
                          onChange={(e) => handleVariationFieldChange(idx, 'value', e.target.value)}
                          className="bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-md text-sm px-3 py-2 outline-none h-11 disabled:opacity-50 focus:ring-1 focus:ring-indigo-500"
                          required
                        />
                      )}
                    </div>
                  </div>

                  {/* Delete button only if multivariate and variations > 2 */}
                  {type !== 'boolean' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveVariation(v.id)}
                      className="text-zinc-500 hover:text-red-400 mt-7"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Side Panel: Environment Default routing states (1/3 width) */}
        <div className="space-y-6">
          <Card className="border-zinc-800 bg-zinc-950/40">
            <CardHeader>
              <CardTitle>Default Fallbacks</CardTitle>
              <CardDescription>
                Define fallback routings per project environment.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Dev Environment Fallback */}
              <div className="space-y-3 pb-4 border-b border-zinc-850">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-400 font-mono tracking-wider">DEVELOPMENT</span>
                  <Badge variant="info" className="text-[9px] px-1.5 py-0">Dev</Badge>
                </div>
                <div className="space-y-3">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[11px] text-zinc-400 font-medium">When Flag is Enabled, serve:</span>
                    <select
                      value={devDefaultServe}
                      onChange={(e) => setDevDefaultServe(e.target.value)}
                      className="bg-zinc-900 border border-zinc-800 text-xs px-2.5 py-2 rounded-md text-zinc-200 cursor-pointer focus:ring-1 focus:ring-indigo-500"
                    >
                      {variations.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name} ({v.value})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[11px] text-zinc-400 font-medium">When Flag is Disabled, serve:</span>
                    <select
                      value={devOffServe}
                      onChange={(e) => setDevOffServe(e.target.value)}
                      className="bg-zinc-900 border border-zinc-800 text-xs px-2.5 py-2 rounded-md text-zinc-200 cursor-pointer focus:ring-1 focus:ring-indigo-500"
                    >
                      {variations.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name} ({v.value})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Stg Environment Fallback */}
              <div className="space-y-3 pb-4 border-b border-zinc-850">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 font-mono tracking-wider">STAGING</span>
                  <Badge variant="warning" className="text-[9px] px-1.5 py-0">Stg</Badge>
                </div>
                <div className="space-y-3">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[11px] text-zinc-400 font-medium">When Flag is Enabled, serve:</span>
                    <select
                      value={stgDefaultServe}
                      onChange={(e) => setStgDefaultServe(e.target.value)}
                      className="bg-zinc-900 border border-zinc-800 text-xs px-2.5 py-2 rounded-md text-zinc-200 cursor-pointer focus:ring-1 focus:ring-indigo-500"
                    >
                      {variations.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name} ({v.value})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[11px] text-zinc-400 font-medium">When Flag is Disabled, serve:</span>
                    <select
                      value={stgOffServe}
                      onChange={(e) => setStgOffServe(e.target.value)}
                      className="bg-zinc-900 border border-zinc-800 text-xs px-2.5 py-2 rounded-md text-zinc-200 cursor-pointer focus:ring-1 focus:ring-indigo-500"
                    >
                      {variations.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name} ({v.value})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Prod Environment Fallback */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 font-mono tracking-wider">PRODUCTION</span>
                  <Badge variant="success" className="text-[9px] px-1.5 py-0">Prod</Badge>
                </div>
                <div className="space-y-3">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[11px] text-zinc-400 font-medium">When Flag is Enabled, serve:</span>
                    <select
                      value={prodDefaultServe}
                      onChange={(e) => setDevDefaultServe(e.target.value)}
                      className="bg-zinc-900 border border-zinc-800 text-xs px-2.5 py-2 rounded-md text-zinc-200 cursor-pointer focus:ring-1 focus:ring-indigo-500"
                    >
                      {variations.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name} ({v.value})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[11px] text-zinc-400 font-medium">When Flag is Disabled, serve:</span>
                    <select
                      value={prodOffServe}
                      onChange={(e) => setProdOffServe(e.target.value)}
                      className="bg-zinc-900 border border-zinc-800 text-xs px-2.5 py-2 rounded-md text-zinc-200 cursor-pointer focus:ring-1 focus:ring-indigo-500"
                    >
                      {variations.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name} ({v.value})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-zinc-800 bg-zinc-950/40">
            <CardContent className="p-4 space-y-3 text-xs text-zinc-400 leading-normal">
              <div className="flex items-center gap-2 text-zinc-200 font-semibold mb-1">
                <HelpCircle className="h-4 w-4 text-indigo-400" />
                <span>Default Evaluation Logic</span>
              </div>
              <p>
                Default Serve configurations dictate values returned to client apps if the flag key evaluation does not match any custom targeting rules defined.
              </p>
              <p>
                Off configurations handle the absolute fallback state whenever a developer toggles the environment switch off entirely.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Form Action Controls footer */}
      <div className="flex items-center justify-end gap-3.5 pt-4 border-t border-zinc-800">
        <Button
          variant="secondary"
          onClick={() => navigate(isEditMode ? `/flags/${id}` : '/flags')}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          icon={<Save className="h-4.5 w-4.5" />}
        >
          {isEditMode ? 'Save Configurations' : 'Publish Feature Flag'}
        </Button>
      </div>
    </form>
  );
};
export default FlagForm;
