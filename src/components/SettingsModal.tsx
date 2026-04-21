import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, RotateCcw, Clock, Camera } from 'lucide-react';
import { AppSettings, settingsService } from '../services/settingsService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: AppSettings) => void;
}

export default function SettingsModal({ isOpen, onClose, onSave }: SettingsModalProps) {
  const currentSettings = settingsService.getSettings();
  const [tempSettings, setTempSettings] = useState<AppSettings>(currentSettings);

  const handleSave = () => {
    settingsService.saveSettings(tempSettings);
    onSave(tempSettings);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-brand-panel border border-brand-line rounded-xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-brand-line bg-brand-bg">
              <div>
                <h2 className="text-xl font-bold text-brand-ink uppercase tracking-tight">System Settings</h2>
                <p className="text-xs text-brand-muted mt-1 uppercase tracking-widest font-mono">Configuration Node: Config-01</p>
              </div>
              <button 
                onClick={onClose}
                className="p-2 text-brand-muted hover:text-brand-ink transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-8 space-y-10">
              {/* Interval Setting */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Clock className="text-brand-accent" size={18} />
                  <label className="card-title mb-0">Analysis Interval</label>
                </div>
                <div className="flex items-center gap-6">
                  <input 
                    type="range" 
                    min="3" 
                    max="60" 
                    step="1"
                    value={tempSettings.analysisInterval}
                    onChange={(e) => setTempSettings({ ...tempSettings, analysisInterval: parseInt(e.target.value) })}
                    className="flex-1 accent-brand-accent"
                  />
                  <div className="w-16 h-10 flex items-center justify-center bg-brand-surface border border-brand-line rounded-md font-mono text-lg font-bold">
                    {tempSettings.analysisInterval}s
                  </div>
                </div>
                <p className="text-[11px] text-brand-muted leading-relaxed">
                  Frequency of automatic crowd snapshots. Shorter intervals increase data resolution but consume more processing power.
                </p>
              </div>

              {/* Camera Setting */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Camera className="text-brand-accent" size={18} />
                  <label className="card-title mb-0">Camera Perspective</label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setTempSettings({ ...tempSettings, cameraFacingMode: 'environment' })}
                    className={`p-4 rounded-lg border flex flex-col items-center gap-2 transition-all ${
                      tempSettings.cameraFacingMode === 'environment' 
                        ? 'border-brand-accent bg-brand-accent/10' 
                        : 'border-brand-line bg-brand-surface'
                    }`}
                  >
                    <span className="text-sm font-bold uppercase tracking-tighter">Rear (Environment)</span>
                    <div className={`w-2 h-2 rounded-full ${tempSettings.cameraFacingMode === 'environment' ? 'bg-brand-accent animate-pulse' : 'bg-brand-line'}`} />
                  </button>
                  <button
                    onClick={() => setTempSettings({ ...tempSettings, cameraFacingMode: 'user' })}
                    className={`p-4 rounded-lg border flex flex-col items-center gap-2 transition-all ${
                      tempSettings.cameraFacingMode === 'user' 
                        ? 'border-brand-accent bg-brand-accent/10' 
                        : 'border-brand-line bg-brand-surface'
                    }`}
                  >
                    <span className="text-sm font-bold uppercase tracking-tighter">Front (User)</span>
                    <div className={`w-2 h-2 rounded-full ${tempSettings.cameraFacingMode === 'user' ? 'bg-brand-accent animate-pulse' : 'bg-brand-line'}`} />
                  </button>
                </div>
              </div>

              {/* API Management Section */}
              <div className="p-4 rounded-lg bg-brand-surface border border-brand-line/50">
                <div className="flex items-center justify-between pointer-events-none opacity-60">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                      <Save size={14} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase text-brand-ink">API Key Management</h4>
                      <p className="text-[10px] text-brand-muted">Managed by platform environment</p>
                    </div>
                  </div>
                  <div className="text-[10px] font-mono text-green-500 bg-green-500/10 px-2 py-1 rounded">
                    ACTIVE
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-brand-bg border-t border-brand-line flex justify-end gap-3">
              <button 
                onClick={onClose}
                className="px-6 py-2.5 text-sm font-bold uppercase tracking-widest text-brand-muted hover:text-brand-ink transition-colors"
              >
                Discard
              </button>
              <button 
                onClick={handleSave}
                className="flex items-center gap-2 px-8 py-2.5 bg-brand-accent text-white rounded-md font-bold text-sm uppercase tracking-widest shadow-lg shadow-brand-accent/20 hover:bg-opacity-90 transition-all"
              >
                <Save size={16} />
                Deploy Config
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
