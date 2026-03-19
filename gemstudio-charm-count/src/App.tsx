/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  History, 
  Settings, 
  Focus, 
  Download, 
  ChevronRight,
  Scan,
  Terminal,
  AlertTriangle,
  Info,
  ZoomIn,
  ZoomOut,
  MousePointer2,
  Layers,
  CheckCircle2,
  Edit3,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { type InventoryItem } from './constants';

import { countCharmsInImage } from './services/gemini';

type Tab = 'dashboard' | 'scanner' | 'settings';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [scannedItems, setScannedItems] = useState<InventoryItem[]>([]);

  const handleSaveScan = (item: InventoryItem) => {
    setScannedItems(prev => [item, ...prev]);
    setActiveTab('dashboard');
  };

  return (
    <div className="flex flex-col min-h-screen bg-background-dark text-slate-900 selection:bg-primary/30 selection:text-primary">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 lg:px-20 py-4 bg-background-dark/80 backdrop-blur-md border-b border-primary/10">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3 text-primary">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Package className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">GemStudio Charm Count</h1>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <nav className="hidden lg:flex items-center gap-8">
            {[
              { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
              { id: 'scanner', label: 'Counter', icon: Scan },
              { id: 'settings', label: 'Settings', icon: Settings },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={cn(
                  "text-sm font-medium transition-all relative py-1",
                  activeTab === tab.id ? "text-primary" : "text-slate-600 hover:text-primary/70"
                )}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary"
                  />
                )}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-primary/30 overflow-hidden">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuApa7lZSJqirfFNGedb5VAlS1aIn9ap8lnZsR2otk6bKDgpk1QTonkf6iyE_TINUhPpR-kwV0hZNgKlBCTYrZbh3mnT2vHEz9VtWvh8ktoRam6i5seLN75eG_v-F3Ra-RmR17t9fKGmNaPGS6xpYN__mYUCjLEYGjYMoDkL7FRUiA6Zh4-MvPNSo-zxoOXuyZsoT6rlWazNWa-Ca6Oooxwxz7zuhAxNm7IsRDe75RuKHseymYAEJz85QPx6mSDkFEAhcro-T7WBCjo" 
                alt="Profile"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row px-6 lg:px-20 py-8 gap-8 max-w-[1600px] mx-auto w-full">
        {/* Sidebar */}
        <aside className="w-full lg:w-64 flex flex-col gap-6 shrink-0">
          <nav className="flex flex-col gap-1">
            {[
              { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
              { id: 'scanner', label: 'Counter', icon: Focus },
              { id: 'settings', label: 'Settings', icon: Settings },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as Tab)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all group",
                  activeTab === item.id 
                    ? "bg-primary text-white font-bold shadow-lg shadow-primary/20" 
                    : "text-slate-600 hover:bg-primary/5 hover:text-primary"
                )}
              >
                <item.icon className={cn("w-5 h-5", activeTab === item.id ? "" : "group-hover:scale-110 transition-transform")} />
                <span className="text-sm">{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && <DashboardView items={scannedItems} onStartScan={() => setActiveTab('scanner')} />}
            {activeTab === 'scanner' && <ScannerView items={scannedItems} onSave={handleSaveScan} />}
            {activeTab === 'settings' && <SettingsView />}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 lg:px-20 py-8 border-t border-primary/10 mt-auto bg-surface-dark/30">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <Terminal className="w-4 h-4" />
            <span>GemStudio Charm Count v2.4.0 • All systems operational</span>
          </div>
          <div className="flex gap-8 text-sm text-slate-500">
            <a href="#" className="hover:text-primary transition-colors">Help Center</a>
            <a href="#" className="hover:text-primary transition-colors">API Status</a>
            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function DashboardView({ items, onStartScan }: { items: InventoryItem[], onStartScan: () => void }) {
  const totalCounted = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <div className="flex flex-wrap justify-between items-center gap-6">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900">Overview</h2>
          <p className="text-primary/60 mt-1">Track your charm counting activity</p>
        </div>
        <button 
          onClick={onStartScan}
          className="flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-2xl font-bold shadow-xl shadow-primary/20 hover:scale-105 transition-transform active:scale-95"
        >
          <Scan className="w-6 h-6" />
          Start New Count
        </button>
      </div>

      {items.length === 0 ? (
        <div className="bg-surface-dark/50 border-2 border-dashed border-primary/20 rounded-3xl p-12 text-center space-y-6">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <Scan className="w-10 h-10 text-primary" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-xl font-bold text-slate-900">No counts yet</h3>
            <p className="text-slate-500 mt-2">Upload a photo of your charms to get started with powered counting.</p>
          </div>
          <button 
            onClick={onStartScan}
            className="px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors"
          >
            Take First Photo
          </button>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-6">
            <StatCard 
              label="Total Scans Completed" 
              value={items.length.toString()} 
              trend="All-time activity" 
              icon={History}
            />
          </div>

          {/* History Table */}
          <div className="bg-surface-dark/50 border border-primary/10 rounded-2xl overflow-hidden backdrop-blur-sm">
            <div className="px-6 py-5 border-b border-primary/10">
              <h3 className="text-lg font-bold text-slate-900">Recent Activity</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-primary/5 text-primary/60 text-[10px] font-bold uppercase tracking-widest">
                    <th className="px-6 py-4">Thumbnail</th>
                    <th className="px-6 py-4">Tray / Item</th>
                    <th className="px-6 py-4 text-center">Count</th>
                    <th className="px-6 py-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary/5">
                  {items.slice(0, 10).map((item) => (
                    <tr key={item.id} className="hover:bg-primary/5 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="w-16 h-12 rounded-lg overflow-hidden border border-primary/10 group-hover:border-primary/30 transition-colors">
                          <img 
                            src={item.thumbnail} 
                            alt={item.name} 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold">{item.sku}</span>
                          <span className="text-xs text-slate-500">{item.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center font-mono font-bold text-primary">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {item.detectedAt}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}

function ScannerView({ items, onSave }: { items: InventoryItem[], onSave: (item: InventoryItem) => void }) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [aiResult, setAiResult] = useState<{ 
    trays: {
      tray_id: string;
      charm_type: string;
      color: string;
      count: number;
      detections: { x: number; y: number }[];
    }[];
    total_count: number;
    overall_confidence: number;
    summary: string;
  } | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const getContrastColor = (hex: string) => {
    if (!hex) return '#fff';
    
    // Simple mapping for common color names if AI ignores hex instruction
    const colorMap: { [key: string]: string } = {
      'red': '#FF0000', 'blue': '#0000FF', 'green': '#008000', 'yellow': '#FFFF00',
      'gold': '#FFD700', 'silver': '#C0C0C0', 'white': '#FFFFFF', 'black': '#000000',
      'purple': '#800080', 'pink': '#FFC0CB', 'orange': '#FFA500', 'emerald': '#50C878',
      'ruby': '#E0115F', 'sapphire': '#0F52BA', 'amethyst': '#9966CC', 'citrine': '#E4D00A'
    };

    const color = hex.startsWith('#') ? hex : (colorMap[hex.toLowerCase()] || '#FFFFFF');
    if (!color.startsWith('#')) return '#fff';

    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000' : '#fff';
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        setUploadedImage(base64);
        setIsScanning(true);
        setAiResult(null);

        try {
          const result = await countCharmsInImage(base64);
          setAiResult(result);
        } catch (error) {
          console.error("Scanning failed", error);
        } finally {
          setIsScanning(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirm = () => {
    if (!aiResult || !uploadedImage) return;
    
    // Save each tray as a separate inventory item
    aiResult.trays.forEach((tray, index) => {
      const newItem: InventoryItem = {
        id: `${Date.now()}-${index}`,
        sku: tray.tray_id,
        name: tray.charm_type,
        description: `Count: ${tray.count} in ${tray.tray_id} (${tray.color})`,
        quantity: tray.count,
        detectedAt: new Date().toLocaleString(),
        scannerId: 'Multi-Tray Scanner',
        status: tray.count < 5 ? 'Low Stock' : 'Verified',
        thumbnail: uploadedImage,
        aiCount: tray.count
      };
      onSave(newItem);
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex flex-col lg:flex-row gap-8 h-full"
    >
      <div className="flex-1 space-y-6">
        <div className="flex flex-wrap justify-between items-end gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-primary/60 font-bold uppercase tracking-widest">
              <span>Inventory Management</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-primary">Counter</span>
            </div>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-black tracking-tight text-slate-900">Charm Recognition & Counting</h2>
              <div className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-tighter rounded-md border border-emerald-200 flex items-center gap-1">
                <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                Precision Calibrated Counting
              </div>
            </div>
            <p className="text-slate-600">Identify trays and count charms individually in real-time.</p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 max-w-2xl shadow-sm">
            <h4 className="text-amber-800 font-bold text-sm flex items-center gap-2 mb-3">
              <Info className="w-4 h-4" />
              Scanning Tips for Best Accuracy
            </h4>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</div>
                <p className="text-xs text-amber-700 leading-relaxed">
                  <strong>Spread them out:</strong> Ensure charms are not overlapping. The system counts best when each charm is clearly visible and not overlapped.
                </p>
              </div>
              <div className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</div>
                <p className="text-xs text-amber-700 leading-relaxed">
                  <strong>High Volume?</strong> If you have a lot of charms, pour them out onto a table and spread them out in a single layer. Take one clear photo of the entire spread.
                </p>
              </div>
              <div className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">3</div>
                <p className="text-xs text-amber-700 leading-relaxed">
                  <strong>Low Volume?</strong> For fewer charms, you can keep them in the tray, but still spread them out so they don't touch each other.
                </p>
              </div>
              <div className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">4</div>
                <p className="text-xs text-amber-700 leading-relaxed">
                  <strong>Multiple Trays:</strong> You can take a photo of multiple trays at once to count everything in one go.
                </p>
              </div>
              <div className="flex gap-3 p-2 bg-amber-100/50 rounded-lg border border-amber-200/50">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <p className="text-[10px] text-amber-800 font-medium">
                  <strong>Disclaimer:</strong> The system is sometimes wrong. Please double-check the counts if a number seems incorrect.
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileUpload}
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform active:scale-95"
            >
              <Download className="w-5 h-5 rotate-180" />
              Upload Display Photo
            </button>
          </div>
        </div>

        {/* Canvas Area */}
        <div className={cn(
          "relative rounded-3xl overflow-hidden border border-primary/20 bg-black/40 shadow-2xl group transition-all duration-500 flex items-center justify-center",
          uploadedImage ? "min-h-[400px] h-auto" : "aspect-video"
        )}>
          {uploadedImage ? (
            <div className="relative inline-block max-w-full max-h-[70vh]">
              <img 
                src={uploadedImage} 
                alt="Uploaded Product"
                className={cn(
                  "w-full h-full object-contain transition-opacity duration-1000", 
                  isScanning ? "opacity-40" : "opacity-90"
                )}
              />
              
              {/* Real AI Markers - Now relative to the image itself */}
              <div className="absolute inset-0 pointer-events-none">
                {(!isScanning && aiResult?.trays) && aiResult.trays.flatMap((tray, trayIdx) => 
                  tray.detections.map((det, i) => (
                    <motion.div
                      key={`${trayIdx}-${i}`}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: (trayIdx * 10 + i) * 0.01 }}
                      className="absolute w-6 h-6 -ml-3 -mt-3 rounded-full flex items-center justify-center border-2 shadow-sm"
                      style={{ 
                        top: `${det.y / 10}%`, 
                        left: `${det.x / 10}%`,
                        backgroundColor: `${tray.color.startsWith('#') ? tray.color : '#FFFFFF'}30`,
                        borderColor: tray.color,
                        boxShadow: `0 0 10px ${tray.color.startsWith('#') ? tray.color : '#FFFFFF'}50`
                      }}
                    >
                      <div className="w-1 h-1 rounded-full" style={{ backgroundColor: tray.color }} />
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 text-slate-400">
              <Scan className="w-12 h-12 opacity-20" />
              <p className="text-sm font-medium">Upload a photo to begin counting</p>
            </div>
          )}
          
          {/* Scanning Animation */}
          {isScanning && (
            <motion.div 
              initial={{ top: '0%' }}
              animate={{ top: '100%' }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute left-0 right-0 h-1 bg-primary shadow-[0_0_15px_rgba(19,236,91,1)] z-10"
            />
          )}

          {/* Toolbar */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-background-dark/90 border border-primary/20 backdrop-blur-lg px-2 py-2 rounded-full flex gap-1 shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="p-2 hover:bg-primary/20 rounded-full text-slate-900 transition-colors"><ZoomIn className="w-5 h-5" /></button>
            <button className="p-2 hover:bg-primary/20 rounded-full text-slate-900 transition-colors"><ZoomOut className="w-5 h-5" /></button>
            <div className="w-px h-6 bg-primary/20 self-center mx-1" />
            <button className="p-2 bg-primary text-white rounded-full shadow-lg"><MousePointer2 className="w-5 h-5" /></button>
            <button className="p-2 hover:bg-primary/20 rounded-full text-slate-900 transition-colors"><Layers className="w-5 h-5" /></button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Confidence Score', value: isScanning ? '...' : (aiResult ? `${(aiResult.overall_confidence * 100).toFixed(1)}%` : '0%') },
            { label: 'Trays Detected', value: isScanning ? '...' : (aiResult?.trays.length || '0') },
            { label: 'Detection Model', value: 'Gemini-3.1-Pro' }
          ].map((stat) => (
            <div key={stat.label} className="bg-primary/5 border border-primary/10 p-4 rounded-2xl">
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary/60 mb-1">{stat.label}</p>
              <p className="text-xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Verification Panel */}
      <aside className="w-full lg:w-[400px] bg-surface-dark/40 border border-primary/10 rounded-3xl p-6 flex flex-col gap-8">
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-slate-900">Tray Breakdown</h3>
          
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {aiResult?.summary && (
              <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl mb-4">
                <p className="text-[10px] text-primary font-bold uppercase tracking-widest mb-1">Summary</p>
                <p className="text-xs text-slate-700 leading-relaxed italic">"{aiResult.summary}"</p>
              </div>
            )}
            {aiResult?.trays.map((tray, idx) => (
              <div 
                key={idx} 
                className="p-4 rounded-2xl space-y-2 border transition-all hover:shadow-md"
                style={{ 
                  backgroundColor: `${tray.color.startsWith('#') ? tray.color : '#FFFFFF'}10`, // 10% opacity for background
                  borderColor: `${tray.color.startsWith('#') ? tray.color : '#FFFFFF'}30` // 30% opacity for border
                }}
              >
                <div className="flex justify-between items-center">
                  <span 
                    className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                    style={{ 
                      backgroundColor: tray.color,
                      color: getContrastColor(tray.color)
                    }}
                  >
                    {tray.tray_id}
                  </span>
                  <span className="text-lg font-black" style={{ color: tray.color }}>{tray.count}</span>
                </div>
                <p className="text-sm font-bold text-slate-800">{tray.charm_type}</p>
              </div>
            ))}
            {!aiResult && !isScanning && (
              <p className="text-sm text-slate-500 italic">Upload an image to see tray breakdown</p>
            )}
            {isScanning && (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-20 bg-primary/5 animate-pulse rounded-2xl" />
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <button 
              onClick={handleConfirm}
              disabled={!aiResult || isScanning}
              className="w-full bg-primary disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform active:scale-95 flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              Save All Trays to List
            </button>
            <button className="w-full bg-surface-dark border border-primary/20 text-slate-800 font-bold py-4 rounded-2xl hover:bg-primary/5 transition-colors flex items-center justify-center gap-2">
              <Edit3 className="w-5 h-5" />
              Manual Adjust
            </button>
          </div>
        </div>

        <div className="mt-auto pt-6 border-t border-primary/10">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary/60 mb-4">Detection History</h4>
          <div className="space-y-3">
            {items.length === 0 ? (
              <p className="text-[10px] text-slate-500 italic">No recent scans</p>
            ) : items.slice(0, 3).map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-transparent hover:border-primary/20 transition-all cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                    <Package className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-bold">SKU: {item.sku}</p>
                    <p className="text-[10px] text-slate-500">{item.detectedAt}</p>
                  </div>
                </div>
                <span className="text-sm font-black text-slate-400">{item.quantity} units</span>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </motion.div>
  );
}function SettingsView() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <div>
        <h2 className="text-3xl font-black tracking-tight text-slate-900">Settings</h2>
        <p className="text-primary/60 mt-1">Configure your charm counting preferences</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-surface-dark/50 border border-primary/10 rounded-3xl p-8 space-y-6">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Scan className="w-5 h-5 text-primary" />
            Scanning Preferences
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-primary/5 rounded-2xl">
              <div>
                <p className="font-bold text-sm">Auto-Save Scans</p>
                <p className="text-xs text-slate-500">Automatically save results to history</p>
              </div>
              <div className="w-12 h-6 bg-primary rounded-full relative">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-primary/5 rounded-2xl">
              <div>
                <p className="font-bold text-sm">High Precision Mode</p>
                <p className="text-xs text-slate-500">Uses more tokens for better accuracy</p>
              </div>
              <div className="w-12 h-6 bg-primary rounded-full relative">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-surface-dark/50 border border-primary/10 rounded-3xl p-8 space-y-6">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Terminal className="w-5 h-5 text-primary" />
            System Information
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">App Version</span>
              <span className="font-mono font-bold">2.4.0</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Model</span>
              <span className="font-mono font-bold">Gemini 3.1 Pro</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Status</span>
              <span className="text-emerald-500 font-bold">Connected</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function StatCard({ label, value, trend, icon: Icon }: { 
  label: string; 
  value: string; 
  trend: string; 
  icon: any;
}) {
  return (
    <div className="p-6 bg-surface-dark/50 border border-primary/10 rounded-2xl space-y-4 backdrop-blur-sm hover:border-primary/30 transition-colors">
      <div className="flex justify-between items-start">
        <p className="text-[10px] font-bold uppercase tracking-widest text-primary/60">{label}</p>
        <div className="p-2 bg-primary/10 rounded-lg">
          <Icon className="w-5 h-5 text-primary" />
        </div>
      </div>
      <p className="text-4xl font-black tracking-tighter text-slate-900">{value}</p>
      <div className="flex items-center gap-1.5">
        <p className="text-xs font-bold text-slate-500">
          {trend}
        </p>
      </div>
    </div>
  );
}

