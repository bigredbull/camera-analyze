import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area
} from 'recharts';
import { AnalyticRecord } from '../types';
import { format, parseISO } from 'date-fns';
import { User, Users, Clock, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardProps {
  records: AnalyticRecord[];
  mode?: 'sidebar' | 'bottom';
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#6366f1'];
const GENDER_COLORS = { male: '#3b82f6', female: '#ec4899' };

export default function Dashboard({ records, mode = 'sidebar' }: DashboardProps) {
  const latestRecord = records[records.length - 1];

  const ageData = useMemo(() => {
    if (!latestRecord) return [];
    return Object.entries(latestRecord.ageDistribution).map(([name, value]) => ({
      name,
      label: name.charAt(0).toUpperCase() + name.slice(1),
      value
    }));
  }, [latestRecord]);

  const genderData = useMemo(() => {
    if (!latestRecord) return [];
    return Object.entries(latestRecord.genderDistribution).map(([name, value]) => ({
      name,
      label: name.charAt(0).toUpperCase() + name.slice(1),
      value
    }));
  }, [latestRecord]);

  const totalGender = (latestRecord?.genderDistribution.male || 0) + (latestRecord?.genderDistribution.female || 0);

  const hourlyData = useMemo(() => {
    const hours: Record<string, number> = {};
    const now = new Date();
    
    // Group all records by hour, limited to past 24h
    records.forEach(r => {
      const d = parseISO(r.timestamp);
      if ((now.getTime() - d.getTime()) <= 24 * 60 * 60 * 1000) {
        const hourLabel = format(d, 'HH:00');
        hours[hourLabel] = (hours[hourLabel] || 0) + r.totalPeople;
      }
    });

    return Object.entries(hours)
      .map(([time, count]) => ({ time, count }))
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [records]);

  const trendData = useMemo(() => {
    return records.slice(-20).map(r => ({
      time: format(parseISO(r.timestamp), 'HH:mm'),
      count: r.totalPeople
    }));
  }, [records]);

  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 opacity-20 border border-brand-line border-dashed rounded-lg h-full">
        <Users size={32} />
        <p className="mt-4 font-mono text-[10px] uppercase tracking-widest">Waiting for stream...</p>
      </div>
    );
  }

  if (mode === 'bottom') {
    return (
      <div className="flex gap-10 h-[130px] w-full">
        {/* Real-time Trend (AreaChart) */}
        <div className="flex-[2] h-full">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse" />
            <span className="text-[10px] text-brand-muted uppercase font-bold tracking-wider">Stream Trend</span>
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.1} />
              <XAxis dataKey="time" hide />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '4px', fontSize: '12px', color: '#fff' }}
                itemStyle={{ color: '#3b82f6' }}
              />
              <Area 
                type="monotone" 
                dataKey="count" 
                stroke="#3b82f6" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorCount)" 
                animationDuration={800}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Hourly Distribution (BarChart) - NEW */}
        <div className="flex-1 h-full border-l border-brand-line pl-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] text-brand-muted uppercase font-bold tracking-wider opacity-60">24h Hourly Spread</span>
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.1} />
              <XAxis dataKey="time" hide />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '4px', fontSize: '11px' }}
                labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
              />
              <Bar 
                dataKey="count" 
                fill="#3b82f6" 
                radius={[2, 2, 0, 0]} 
                animationDuration={1000}
                opacity={0.8}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Gender Split */}
      <div>
        <div className="card-title">Live Demographics</div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-brand-surface p-4 rounded-lg border border-brand-line">
            <div className="text-[11px] text-brand-muted mb-1">Male</div>
            <div className="text-2xl font-bold text-[#3b82f6]">
              {totalGender > 0 ? Math.round((latestRecord.genderDistribution.male / totalGender) * 100) : 0}%
            </div>
            <div className="text-[10px] text-brand-muted opacity-60">
              Count: {latestRecord.genderDistribution.male}
            </div>
          </div>
          <div className="bg-brand-surface p-4 rounded-lg border border-brand-line">
            <div className="text-[11px] text-brand-muted mb-1">Female</div>
            <div className="text-2xl font-bold text-[#ec4899]">
              {totalGender > 0 ? Math.round((latestRecord.genderDistribution.female / totalGender) * 100) : 0}%
            </div>
            <div className="text-[10px] text-brand-muted opacity-60">
              Count: {latestRecord.genderDistribution.female}
            </div>
          </div>
        </div>
      </div>

      {/* Age Distribution Horizontal Bars */}
      <div>
        <div className="card-title">Age Distribution</div>
        <div className="space-y-4">
          {ageData.map((item, idx) => {
            const percentage = latestRecord.totalPeople > 0 ? Math.round((item.value / latestRecord.totalPeople) * 100) : 0;
            return (
              <div key={item.name} className="flex flex-col gap-1.5">
                <div className="flex justify-between text-[11px] font-medium px-0.5">
                  <span className="text-brand-ink opacity-80">{item.label}</span>
                  <span className="text-brand-muted">{percentage}%</span>
                </div>
                <div className="h-2 bg-brand-line rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full bg-brand-accent rounded-full"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}


function MetricCard({ label, value, icon, trend, subtitle }: { label: string, value: string | number, icon: React.ReactNode, trend?: string, subtitle?: string }) {
  return (
    <div className="bg-white p-6 rounded-lg border border-brand-line shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
      <div className="absolute top-4 right-4">{icon}</div>
      <p className="col-header mb-1">{label}</p>
      <div className="flex items-baseline gap-2">
        <h4 className="text-3xl font-mono font-medium tracking-tight">{value}</h4>
        {subtitle && <span className="text-[10px] uppercase opacity-40 font-mono">{subtitle}</span>}
      </div>
      {trend && (
        <p className="mt-2 text-[10px] font-mono text-green-600 uppercase tracking-wider">
          {trend}
        </p>
      )}
    </div>
  );
}
