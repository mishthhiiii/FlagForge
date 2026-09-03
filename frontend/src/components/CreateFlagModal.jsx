import React, { useState, useEffect } from 'react';
import { X, Flag, AlertCircle } from 'lucide-react';
import { useFlags } from '../context/FlagContext.jsx';
import { Button } from './common/Button.jsx';

export function CreateFlagModal({ isOpen, onClose, flagToEdit = null }) {
  const { createFlag, editFlag } = useFlags();
  const isEditing = Boolean(flagToEdit);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'Active',
    environment: 'Development',
    rollout_percentage: 100
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (flagToEdit) {
      setFormData({
        name: flagToEdit.name || '',
        description: flagToEdit.description || '',
        status: flagToEdit.status || 'Active',
        environment: flagToEdit.environment === 'Testing' ? 'Staging' : (flagToEdit.environment || 'Development'),
        rollout_percentage: flagToEdit.rollout_percentage ?? 100
      });
    } else {
      setFormData({
        name: '',
        description: '',
        status: 'Active',
        environment: 'Development',
        rollout_percentage: 100
      });
    }
    setError('');
  }, [flagToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Please provide a feature flag name.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      if (isEditing && flagToEdit) {
        await editFlag(flagToEdit.id, formData);
      } else {
        await createFlag(formData);
      }
      onClose();
    } catch (err) {
      setError(err.message || (isEditing ? 'Failed to update feature flag' : 'Failed to create feature flag'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl w-full max-w-lg p-6 space-y-5 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          id="btn-close-flag-modal"
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-[#1e293b] pb-4">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
            <Flag className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">
              {isEditing ? `Edit Feature Flag: ${flagToEdit.name}` : 'Create New Feature Flag'}
            </h2>
            <p className="text-xs text-slate-400">
              {isEditing
                ? 'Modify configuration parameters, targeting environment, and initial rollout'
                : 'Define a feature toggle and configure its target environment'}
            </p>
          </div>
        </div>

        {error && (
          <div id="flag-modal-error" className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-lg text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Flag Identifier Name <span className="text-rose-400">*</span>
            </label>
            <input
              id="input-flag-name"
              type="text"
              required
              placeholder="e.g. checkout-redesign-v2"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-3.5 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">Unique key used to reference this feature in your application.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
            <textarea
              id="input-flag-description"
              rows="2"
              placeholder="Explain the intent, owner, and graduation criteria for this flag..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Target Environment</label>
              <select
                id="select-flag-environment"
                value={formData.environment}
                onChange={(e) => setFormData({ ...formData, environment: e.target.value })}
                className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="Development">Development</option>
                <option value="Staging">Staging</option>
                <option value="Production">Production</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
              <select
                id="select-flag-status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="Active">Active</option>
                <option value="Draft">Draft</option>
                <option value="Paused">Paused</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1">
              <span>Rollout Percentage</span>
              <span className="font-mono text-indigo-400 font-bold">{formData.rollout_percentage}%</span>
            </div>
            <input
              id="slider-initial-rollout"
              type="range"
              min="0"
              max="100"
              step="5"
              value={formData.rollout_percentage}
              onChange={(e) => setFormData({ ...formData, rollout_percentage: Number(e.target.value) })}
              className="w-full accent-indigo-500 cursor-pointer"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1e293b]">
            <Button variant="outline" onClick={onClose} id="btn-cancel-flag-modal">
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting} id="btn-save-flag-modal">
              {isSubmitting ? (isEditing ? 'Saving...' : 'Creating...') : (isEditing ? 'Save Changes' : 'Create Flag')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
