/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import CameraView from './components/CameraView';
import Dashboard from './components/Dashboard';
import SettingsModal from './components/SettingsModal';
import { analyzeTrafficImage } from './services/aiService';
import { storageService } from './services/storageService';
import { settingsService, AppSettings } from './services/settingsService';
import { AnalyticRecord } from './types';
import { Store, BarChart3, Clock, LayoutDashboard, History, Settings as SettingsIcon } from 'lucide-react';
import { motion } from 'motion/react';

export default function App() {
  const [records, setRecords] = useState<AnalyticRecord[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<'realtime' | 'history'>('realtime');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(settingsService.getSettings());

  useEffect(() => {
    setRecords(storageService.getRecords());
  }, []);

  const handleCapture = async (base64: string) => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeTrafficImage(base64);
      if (result) {
        const newRecord = result as AnalyticRecord;
        storageService.saveRecord(newRecord);
        setRecords(prev => [...prev, newRecord]);
      }
    } catch (error) {
      console.error("Failed to analyze traffic:", error);
      alert("AI analysis failed. Please check your connection or try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearHistory = () => {
    if (confirm("Clear all historical data?")) {
      storageService.clearRecords();
      setRecords([]);
    }
  };

  const updateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
  };

  return (
    <div className="grid grid-cols-[1fr_340px] grid-rows-[60px_1fr_200px] h-screen gap-px bg-brand-line">
      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        onSave={updateSettings}
      />

      {/* Header */}
      <header className="col-span-2 bg-brand-bg flex items-center px-6 justify-between border-b border-brand-line">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-accent rounded-md flex items-center justify-center text-white font-bold text-lg">V</div>
          <h1 className="text-lg font-semibold m-0">
            VisionMetrics Pro <span className="text-brand-muted font-normal ml-2">| Unit #7742</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="status-badge">
            <span className="w-1.5 h-1.5 rounded-full bg-[#34d399] animate-pulse" />
            Live Feed Active
          </div>
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 text-brand-muted hover:text-brand-ink transition-colors"
            title="System Settings"
          >
            <SettingsIcon size={20} />
          </button>
          <button 
            onClick={clearHistory}
            className="text-[10px] uppercase tracking-widest font-bold text-brand-muted hover:text-brand-ink transition-colors"
          >
            Reset Logs
          </button>
        </div>
      </header>

      {/* Main View: Camera */}
      <main className="bg-brand-surface relative flex items-center justify-center overflow-hidden h-full">
        <CameraView 
          onCapture={handleCapture} 
          isAnalyzing={isAnalyzing} 
          interval={settings.analysisInterval}
          facingMode={settings.cameraFacingMode}
        />
      </main>

      {/* Sidebar: Current Demographics & Insights */}
      <aside className="bg-brand-panel p-5 flex flex-col gap-6 border-l border-brand-line overflow-y-auto">
        <Dashboard records={records} mode="sidebar" />
        
        <div className="mt-auto border-t border-brand-line pt-4">
          <div className="card-title">Key Insights</div>
          <p className="text-[13px] leading-relaxed text-[#cbd5e1]">
            <span className="font-bold text-brand-accent">Peak segment</span>: {records.length > 0 ? "Detected" : "Calculating..."}. 
            Traffic trend: <span className="text-[#4ade80]">Active</span>. 
            Monitoring stores at 5s resolution.
          </p>
        </div>
      </aside>

      {/* Bottom Panel: Trends & Totals */}
      <footer className="col-span-2 bg-brand-bg border-top border-brand-line p-5 flex gap-8">
        <div className="flex-1">
          <div className="card-title">Hourly Foot Traffic Distribution</div>
          <Dashboard records={records} mode="bottom" />
        </div>
        
        <div className="w-64 border-l border-brand-line pl-8 flex flex-col justify-center">
          <div className="card-title">Cumulative Total</div>
          <div className="stat-value">
            {records.reduce((acc, curr) => acc + curr.totalPeople, 0).toLocaleString()}
          </div>
          <div className="text-[12px] text-[#4ade80]">+ {records[records.length-1]?.totalPeople || 0} latest</div>
          <div className="mt-3 text-[11px] text-brand-muted">
            Average Snapshot: {records.length > 0 ? Math.round(records.reduce((acc, curr) => acc + curr.totalPeople, 0) / records.length) : 0} units
          </div>
        </div>
      </footer>
    </div>
  );
}


function NavIcon({ active, onClick, icon, label }: { active: boolean, onClick?: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`group relative flex flex-col items-center gap-1 transition-all duration-300 ${
        active ? 'text-brand-ink' : 'text-brand-ink opacity-30 hover:opacity-100'
      }`}
    >
      <div className={`p-2 rounded-lg transition-colors ${active ? 'bg-brand-bg shadow-inner' : ''}`}>
        {React.cloneElement(icon as React.ReactElement, { size: 20 })}
      </div>
      <span className="text-[9px] uppercase font-bold tracking-tighter transition-all opacity-0 group-hover:opacity-100">
        {label}
      </span>
      {active && (
        <motion.div 
          layoutId="active-indicator"
          className="absolute -right-[23px] w-1 h-8 bg-brand-ink rounded-l-full" 
        />
      )}
    </button>
  );
}

