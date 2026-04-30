import React, { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { 
  Activity, 
  Database, 
  Cpu, 
  Server, 
  AlertTriangle, 
  ArrowRight,
  ShieldCheck,
  Zap,
  BarChart3,
  Bot
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import { cn } from './lib/utils';
import { TelemetryMetrics } from './types';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// --- Sub-components ---

const MetricCard = ({ title, value, unit, icon: Icon, color, trend }: any) => (
  <div className="bg-[#151518] border border-slate-800 p-4 rounded-xl relative overflow-hidden group">
    <div className={cn("absolute top-0 right-0 p-2 opacity-10 scale-150 transition-transform group-hover:scale-125", color)}>
      <Icon size={48} />
    </div>
    <div className="flex items-center gap-2 text-slate-400 mb-2">
      <Icon size={16} />
      <span className="text-xs uppercase font-mono tracking-wider">{title}</span>
    </div>
    <div className="flex items-baseline gap-1">
      <span className="text-2xl font-mono font-bold text-white tracking-tight">{value}</span>
      <span className="text-xs text-slate-500 font-mono">{unit}</span>
    </div>
    {trend && (
      <div className={cn("text-[10px] mt-2 font-mono flex items-center gap-1", trend > 0 ? "text-emerald-500" : "text-rose-500")}>
        {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% vs previous
      </div>
    )}
  </div>
);

const PipelineStage = ({ id, name, status, metrics, icon: Icon }: any) => {
  const isActive = status === 'active';
  return (
    <div className="flex flex-col items-center gap-4 relative z-10">
      <motion.div 
        animate={{ 
          borderColor: isActive ? '#06b6d4' : '#1e293b',
          boxShadow: isActive ? '0 0 20px rgba(6, 182, 212, 0.2)' : 'none'
        }}
        className={cn(
          "w-16 h-16 rounded-2xl bg-[#1A1A1E] border-2 flex items-center justify-center transition-colors duration-500",
        )}
      >
        <Icon className={isActive ? "text-cyan-400" : "text-slate-600"} size={28} />
      </motion.div>
      <div className="text-center">
        <div className="text-[10px] uppercase font-mono font-bold text-slate-500 mb-1">{name}</div>
        <div className="text-[9px] font-mono whitespace-pre text-cyan-400/80">{metrics}</div>
      </div>
    </div>
  );
};

const PipelineVisualizer = ({ metrics }: { metrics: TelemetryMetrics | null }) => {
  if (!metrics) return null;
  
  return (
    <div className="flex items-center justify-between w-full max-w-4xl mx-auto px-12 py-16 relative technical-grid rounded-2xl border border-slate-800 bg-[#0F0F12]">
      {/* Background Connectors */}
      <div className="absolute top-1/2 left-0 w-full h-[1px] bg-slate-800 -translate-y-1/2 z-0" />
      
      <PipelineStage 
        name="Ingestion" 
        icon={Zap} 
        status="active" 
        metrics={`${(metrics.throughput / 1000).toFixed(1)}k msg/s`}
      />
      
      <motion.div 
        animate={{ opacity: [0.2, 0.8, 0.2] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="flex-1 h-[2px] bg-cyan-500/30 mx-4"
      />
      
      <PipelineStage 
        name="Kafka Bus" 
        icon={Server} 
        status="active" 
        metrics={`Lag: ${metrics.kafkaLag}`}
      />

      <motion.div 
        animate={{ opacity: [0.2, 0.8, 0.2] }}
        transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
        className="flex-1 h-[2px] bg-cyan-400/30 mx-4"
      />

      <PipelineStage 
        name="Flink Compute" 
        icon={Cpu} 
        status="active" 
        metrics={`${(metrics.flinkProcessingRate / 1000).toFixed(1)}k ops/s`}
      />

      <motion.div 
        animate={{ opacity: [0.2, 0.8, 0.2] }}
        transition={{ repeat: Infinity, duration: 2, delay: 1 }}
        className="flex-1 h-[2px] bg-cyan-300/30 mx-4"
      />

      <PipelineStage 
        name="Ozone Store" 
        icon={Database} 
        status="active" 
        metrics={`${metrics.ozoneUsage.toFixed(3)}%`}
      />
    </div>
  );
};

export default function App() {
  const [metrics, setMetrics] = useState<TelemetryMetrics | null>(null);
  const [history, setHistory] = useState<TelemetryMetrics[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [aiInsight, setAiInsight] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    const s = io();
    setSocket(s);

    s.on("metrics:update", (data: TelemetryMetrics) => {
      setMetrics(data);
      setHistory(prev => {
        const next = [...prev, data];
        return next.slice(-40);
      });
    });

    // Initial fetch
    fetch("/api/metrics/history")
      .then(res => res.json())
      .then(data => setHistory(data));

    return () => {
      s.disconnect();
    };
  }, []);

  const analyzeMetrics = async () => {
    if (!metrics || isAnalyzing) return;
    setIsAnalyzing(true);
    setAiInsight("Analyzing telemetry patterns...");
    
    try {
      const prompt = `You are a Site Reliability Engineer and Data Architect. Analyze these real-time metrics for a high-speed IoT ingestion pipeline (Kafka -> Flink -> Ozone):
      - Throughput: ${metrics.throughput} events/s
      - Latency: ${metrics.latency}ms
      - Kafka Lag: ${metrics.kafkaLag}
      - Flink Rate: ${metrics.flinkProcessingRate}
      - Ozone Storage: ${metrics.ozoneUsage.toFixed(2)}%
      - System Errors: ${metrics.errors}
      - Active Sensors: ${metrics.activeSensors}

      Provide a concise summary of health and any performance recommendations. Focus on scalability and latency. Use professional, technical language. Keep it under 100 words.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      setAiInsight(response.text || "Analysis complete.");
    } catch (err) {
      setAiInsight("Failed to generate AI insights.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen p-8 max-w-[1600px] mx-auto space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Activity className="text-cyan-500 animate-pulse" size={32} />
            <h1 className="text-3xl font-mono font-bold tracking-tighter text-white uppercase italic">Vortex Ingestion Hub</h1>
          </div>
          <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">Global Telemetry Asset Operation • v1.4.2</p>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-[#1A1A1E] border border-slate-800 rounded-lg p-2 flex items-center gap-4 px-4 h-12">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-mono font-bold text-slate-400">ENGINE.CONNECTED</span>
            </div>
            <div className="w-[1px] h-4 bg-slate-700" />
            <div className="text-[10px] font-mono text-slate-500">
              {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </header>

      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Throughput" 
          value={metrics ? (metrics.throughput / 1000).toFixed(1) : '---'} 
          unit="K OPS/S" 
          icon={Zap} 
          color="text-amber-500" 
          trend={+2.4}
        />
        <MetricCard 
          title="End-to-End Latency" 
          value={metrics ? metrics.latency : '---'} 
          unit="MS" 
          icon={Activity} 
          color="text-cyan-500" 
          trend={-12.1}
        />
        <MetricCard 
          title="System Lag" 
          value={metrics ? metrics.kafkaLag : '---'} 
          unit="MSG" 
          icon={BarChart3} 
          color="text-rose-500" 
        />
        <MetricCard 
          title="Ozone Bucket Fill" 
          value={metrics ? metrics.ozoneUsage.toFixed(2) : '---'} 
          unit="%" 
          icon={Database} 
          color="text-indigo-500" 
        />
      </div>

      {/* Architecture Centerpiece */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-slate-500 font-mono text-[10px] uppercase tracking-widest px-1">
          <ShieldCheck size={14} className="text-emerald-500" />
          <span>Real-time Pipeline Topology</span>
        </div>
        <PipelineVisualizer metrics={metrics} />
      </section>

      {/* Charts and AI */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#121215] border border-slate-800 rounded-2xl overflow-hidden flex flex-col">
          <div className="p-4 border-bottom border-slate-800 flex justify-between items-center bg-[#18181B]">
            <div className="text-[10px] font-mono uppercase font-bold text-slate-400 flex items-center gap-2">
              <BarChart3 size={14} /> Performance Timeseries
            </div>
          </div>
          <div className="flex-1 min-h-[300px] p-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history}>
                <defs>
                  <linearGradient id="colorThr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis 
                  dataKey="timestamp" 
                  hide 
                />
                <YAxis 
                  stroke="#475569" 
                  fontSize={10} 
                  fontFamily="IBM Plex Mono" 
                  tickFormatter={(v) => `${(v/1000).toFixed(0)}k`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1A1A1E', border: '1px solid #334155', borderRadius: '8px' }}
                  itemStyle={{ color: '#06b6d4', fontSize: '12px', fontFamily: 'IBM Plex Mono' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="throughput" 
                  stroke="#06b6d4" 
                  fillOpacity={1} 
                  fill="url(#colorThr)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Assistant */}
        <div className="bg-[#121215] border border-slate-800 rounded-2xl overflow-hidden flex flex-col">
          <div className="p-4 border-bottom border-slate-800 flex justify-between items-center bg-[#18181B]">
            <div className="text-[10px] font-mono uppercase font-bold text-cyan-400 flex items-center gap-2">
              <Bot size={14} /> AI Guardian Analysis
            </div>
            <button 
              onClick={analyzeMetrics}
              disabled={isAnalyzing}
              className="p-1 px-3 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-mono hover:bg-cyan-500/20 transition-colors disabled:opacity-50"
            >
              RUN DIAGNOSTIC
            </button>
          </div>
          <div className="flex-1 p-6 relative">
            <AnimatePresence mode="wait">
              {aiInsight ? (
                <motion.div 
                  key="insight"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <div className="text-sm leading-relaxed text-slate-300 font-sans border-l-2 border-cyan-500 pl-4 py-1 italic">
                    {aiInsight}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="px-2 py-1 bg-slate-800 rounded text-[9px] font-mono text-slate-400 uppercase">Latency optimized</div>
                    <div className="px-2 py-1 bg-slate-800 rounded text-[9px] font-mono text-slate-400 uppercase">Scale: Stable</div>
                  </div>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full opacity-30 text-center space-y-2">
                  <Bot size={48} />
                  <p className="text-[10px] font-mono uppercase tracking-widest">Waiting for simulation scan...</p>
                </div>
              )}
            </AnimatePresence>
            
            {isAnalyzing && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
                  <span className="text-xs font-mono text-cyan-500">QUANTUM_SCANNING...</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <footer className="pt-8 border-t border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-2">
          <div className="text-[10px] font-mono uppercase font-bold text-slate-500 tracking-wider">Architecture Stack</div>
          <div className="flex gap-2 text-xs font-mono text-slate-400">
            <span className="px-2 py-1 border border-slate-800 rounded">KAFKA v3.2</span>
            <span className="px-2 py-1 border border-slate-800 rounded">APACHE FLINK</span>
            <span className="px-2 py-1 border border-slate-800 rounded">OZONE HDDS</span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="text-[10px] font-mono uppercase font-bold text-slate-500 tracking-wider">Security Layer</div>
          <div className="flex gap-2 text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1"><ShieldCheck size={12} className="text-emerald-500" /> OAuth2/JWT</span>
            <span className="flex items-center gap-1"><ShieldCheck size={12} className="text-emerald-500" /> RBAC Enabled</span>
          </div>
        </div>
        <div className="space-y-2 text-right md:text-right">
          <div className="text-[10px] font-mono uppercase font-bold text-slate-500 tracking-wider">Network Distribution</div>
          <div className="text-xs font-mono text-slate-400">US-EAST-1 • EU-WEST-2 • APAC-SOUTH</div>
        </div>
      </footer>
    </div>
  );
}
