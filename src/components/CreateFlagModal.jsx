import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { X, Flag, Plus } from 'lucide-react';

export default function CreateFlagModal({ isOpen, onClose }) {
  const { createFlag } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    flag_key: '',
    description: '',
    flag_type: 'boolean'
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.flag_key) return;

    createFlag(formData);
    setFormData({ name: '', flag_key: '', description: '', flag_type: 'boolean' });
    onClose();
  };

  const handleNameChange = (e) => {
    const nameVal = e.target.value;
    // Auto generate flag key slug
    const generatedSlug = nameVal
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-');

    setFormData(prev => ({
      ...prev,
      name: nameVal,
      flag_key: generatedSlug
    }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl w-full max-w-md p-6 space-y-5 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#94a3b8] hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-indigo-600 text-white">
            <Flag className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Create Feature Flag</h2>
            <p className="text-xs text-[#94a3b8]">Define a new toggle configuration for your project</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#94a3b8] mb-1">Flag Name</label>
            <input
              type="text"
              required
              placeholder="e.g. A/B Hero CTA Button"
              value={formData.name}
              onChange={handleNameChange}
              className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-3.5 py-2 text-xs text-gray-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#94a3b8] mb-1">Flag Key (SDK Identifier)</label>
            <input
              type="text"
              required
              placeholder="e.g. ab-hero-cta"
              value={formData.flag_key}
              onChange={(e) => setFormData({ ...formData, flag_key: e.target.value })}
              className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-3.5 py-2 text-xs font-mono text-gray-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#94a3b8] mb-1">Description</label>
            <textarea
              rows="2"
              placeholder="Describe the feature roll out intent..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-3.5 py-2 text-xs text-gray-200 focus:outline-none focus:border-indigo-500"
            ></textarea>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#94a3b8] hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2 rounded-lg shadow-md shadow-indigo-600/30 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create Flag</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
