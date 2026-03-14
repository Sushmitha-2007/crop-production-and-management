/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sprout, 
  Calendar, 
  Package, 
  CheckCircle2, 
  Plus, 
  ChevronRight, 
  CloudSun, 
  Droplets, 
  Thermometer,
  AlertTriangle,
  Info,
  TrendingUp,
  LayoutDashboard,
  Settings,
  Search,
  MoreVertical
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
import { format, addDays, isAfter, isBefore, parseISO } from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Crop, Task, InventoryItem, CropStatus } from './types';
import { getFarmingAdvice, FarmingAdvice } from './services/geminiService';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Mock initial data
const INITIAL_CROPS: Crop[] = [
  { id: '1', name: 'Wheat', variety: 'Durum', plantedDate: '2024-01-15', expectedHarvestDate: '2024-05-20', status: 'growing', area: 10, notes: 'Field A' },
  { id: '2', name: 'Corn', variety: 'Sweet Corn', plantedDate: '2024-02-10', expectedHarvestDate: '2024-06-15', status: 'growing', area: 5, notes: 'Field B' },
  { id: '3', name: 'Soybeans', variety: 'High Yield', status: 'planned', area: 8, notes: 'Field C - Pending soil prep' },
];

const INITIAL_TASKS: Task[] = [
  { id: '1', cropId: '1', title: 'Nitrogen Application', description: 'Apply urea fertilizer to Field A', dueDate: '2024-03-20', completed: false, category: 'fertilization' },
  { id: '2', cropId: '2', title: 'Irrigation Cycle', description: 'Evening watering for Field B', dueDate: '2024-03-14', completed: true, category: 'irrigation' },
  { id: '3', cropId: '1', title: 'Pest Inspection', description: 'Check for aphids in northern section', dueDate: '2024-03-16', completed: false, category: 'pest-control' },
];

const INITIAL_INVENTORY: InventoryItem[] = [
  { id: '1', name: 'Urea Fertilizer', category: 'fertilizer', quantity: 500, unit: 'kg', minThreshold: 100 },
  { id: '2', name: 'Soybean Seeds', category: 'seed', quantity: 200, unit: 'kg', minThreshold: 50 },
  { id: '3', name: 'Organic Pesticide', category: 'pesticide', quantity: 10, unit: 'L', minThreshold: 20 },
];

const YIELD_DATA = [
  { month: 'Jan', yield: 400 },
  { month: 'Feb', yield: 300 },
  { month: 'Mar', yield: 600 },
  { month: 'Apr', yield: 800 },
  { month: 'May', yield: 1200 },
  { month: 'Jun', yield: 1100 },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'crops' | 'tasks' | 'inventory'>('dashboard');
  const [crops, setCrops] = useState<Crop[]>(INITIAL_CROPS);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [aiAdvice, setAiAdvice] = useState<FarmingAdvice | null>(null);
  const [loadingAdvice, setLoadingAdvice] = useState(false);

  useEffect(() => {
    const fetchInitialAdvice = async () => {
      setLoadingAdvice(true);
      const advice = await getFarmingAdvice('Wheat', 'Growing', 'Central Plains');
      setAiAdvice(advice);
      setLoadingAdvice(false);
    };
    fetchInitialAdvice();
  }, []);

  const stats = useMemo(() => ({
    totalArea: crops.reduce((acc, c) => acc + c.area, 0),
    activeCrops: crops.filter(c => c.status === 'growing').length,
    pendingTasks: tasks.filter(t => !t.completed).length,
    lowStock: inventory.filter(i => i.quantity < i.minThreshold).length,
  }), [crops, tasks, inventory]);

  const renderDashboard = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Sprout className="w-5 h-5" />} label="Total Area" value={`${stats.totalArea} Acres`} subValue="Across 3 Fields" />
        <StatCard icon={<TrendingUp className="w-5 h-5" />} label="Active Crops" value={stats.activeCrops} subValue="Healthy growth" />
        <StatCard icon={<CheckCircle2 className="w-5 h-5" />} label="Pending Tasks" value={stats.pendingTasks} subValue="Next 7 days" />
        <StatCard icon={<AlertTriangle className="w-5 h-5 text-amber-500" />} label="Low Stock" value={stats.lowStock} subValue="Inventory alerts" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Yield Projections */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-black/5">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-zinc-900">Yield Projections</h3>
            <select className="text-sm border-none bg-zinc-50 rounded-lg px-2 py-1 outline-none">
              <option>Last 6 Months</option>
              <option>Yearly View</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={YIELD_DATA}>
                <defs>
                  <linearGradient id="colorYield" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#71717a'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#71717a'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="yield" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorYield)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Advisor Panel */}
        <div className="bg-zinc-900 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <Info className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="font-semibold">AI Farming Advisor</h3>
          </div>
          
          {loadingAdvice ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-4 bg-white/10 rounded w-3/4"></div>
              <div className="h-20 bg-white/10 rounded"></div>
            </div>
          ) : aiAdvice ? (
            <div className="space-y-4">
              <p className="text-sm text-zinc-400 leading-relaxed">{aiAdvice.summary}</p>
              <div className="space-y-2">
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Recommendations</p>
                {aiAdvice.recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t border-white/10">
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Risks to Watch</p>
                <div className="flex flex-wrap gap-2">
                  {aiAdvice.risks.map((risk, i) => (
                    <span key={i} className="px-2 py-1 bg-amber-500/10 text-amber-400 text-xs rounded-md border border-amber-500/20">
                      {risk}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Recent Tasks & Weather */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-black/5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-zinc-900">Upcoming Tasks</h3>
            <button onClick={() => setActiveTab('tasks')} className="text-sm text-emerald-600 font-medium hover:underline">View all</button>
          </div>
          <div className="space-y-3">
            {tasks.filter(t => !t.completed).slice(0, 3).map(task => (
              <div key={task.id} className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl group hover:bg-zinc-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2 rounded-lg",
                    task.category === 'irrigation' ? "bg-blue-100 text-blue-600" :
                    task.category === 'fertilization' ? "bg-emerald-100 text-emerald-600" :
                    "bg-zinc-200 text-zinc-600"
                  )}>
                    {task.category === 'irrigation' ? <Droplets className="w-4 h-4" /> : <Package className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-900">{task.title}</p>
                    <p className="text-xs text-zinc-500">Due {format(parseISO(task.dueDate), 'MMM d')}</p>
                  </div>
                </div>
                <button className="p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <CheckCircle2 className="w-5 h-5 text-zinc-300 hover:text-emerald-500" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-black/5">
          <h3 className="font-semibold text-zinc-900 mb-4">Local Weather</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-amber-50 rounded-2xl">
                <CloudSun className="w-10 h-10 text-amber-500" />
              </div>
              <div>
                <p className="text-3xl font-bold text-zinc-900">24°C</p>
                <p className="text-zinc-500">Mostly Sunny</p>
              </div>
            </div>
            <div className="text-right space-y-1">
              <div className="flex items-center gap-2 text-sm text-zinc-500">
                <Droplets className="w-4 h-4" />
                <span>Humidity: 45%</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-zinc-500">
                <TrendingUp className="w-4 h-4" />
                <span>Wind: 12 km/h</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2 mt-6">
            {['Mon', 'Tue', 'Wed', 'Thu'].map((day, i) => (
              <div key={day} className="text-center p-2 rounded-xl bg-zinc-50">
                <p className="text-xs text-zinc-500 mb-1">{day}</p>
                <CloudSun className="w-5 h-5 mx-auto text-zinc-400 mb-1" />
                <p className="text-sm font-semibold">2{i + 2}°</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderCrops = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-zinc-900">Crop Management</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors">
          <Plus className="w-4 h-4" />
          <span>Add New Crop</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {crops.map(crop => (
          <div key={crop.id} className="bg-white rounded-2xl overflow-hidden border border-black/5 shadow-sm hover:shadow-md transition-shadow">
            <div className="h-32 bg-emerald-50 relative">
              <div className="absolute top-4 right-4">
                <span className={cn(
                  "px-2 py-1 rounded-md text-xs font-medium uppercase tracking-wider",
                  crop.status === 'growing' ? "bg-emerald-100 text-emerald-700" :
                  crop.status === 'planned' ? "bg-blue-100 text-blue-700" :
                  "bg-zinc-100 text-zinc-700"
                )}>
                  {crop.status}
                </span>
              </div>
              <div className="absolute bottom-0 left-0 p-4 w-full bg-gradient-to-t from-white/80 to-transparent">
                <h3 className="text-lg font-bold text-zinc-900">{crop.name}</h3>
                <p className="text-sm text-zinc-600">{crop.variety}</p>
              </div>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-zinc-500 uppercase">Planted</p>
                  <p className="text-sm font-medium">{crop.plantedDate ? format(parseISO(crop.plantedDate), 'MMM d, yyyy') : 'Not yet'}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 uppercase">Area</p>
                  <p className="text-sm font-medium">{crop.area} Acres</p>
                </div>
              </div>
              <div className="pt-4 border-t border-zinc-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-zinc-500">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs">Harvest: {crop.expectedHarvestDate ? format(parseISO(crop.expectedHarvestDate), 'MMM d') : 'TBD'}</span>
                </div>
                <button className="p-2 hover:bg-zinc-50 rounded-lg transition-colors">
                  <ChevronRight className="w-5 h-5 text-zinc-400" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderInventory = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-zinc-900">Inventory</h2>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Search inventory..." 
              className="pl-10 pr-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
          <button className="p-2 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50">
            <Plus className="w-5 h-5 text-zinc-600" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-50 border-bottom border-zinc-100">
              <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Item Name</th>
              <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Quantity</th>
              <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {inventory.map(item => (
              <tr key={item.id} className="hover:bg-zinc-50/50 transition-colors">
                <td className="px-6 py-4">
                  <p className="text-sm font-medium text-zinc-900">{item.name}</p>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-zinc-100 text-zinc-600 text-xs rounded-md capitalize">
                    {item.category}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-zinc-900">{item.quantity} {item.unit}</p>
                </td>
                <td className="px-6 py-4">
                  {item.quantity < item.minThreshold ? (
                    <span className="flex items-center gap-1 text-amber-600 text-xs font-medium">
                      <AlertTriangle className="w-3 h-3" />
                      Low Stock
                    </span>
                  ) : (
                    <span className="text-emerald-600 text-xs font-medium">In Stock</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="p-1 text-zinc-400 hover:text-zinc-600">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-zinc-200 flex flex-col sticky top-0 h-screen hidden lg:flex">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
            <Sprout className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">AgriGrow</h1>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <NavItem 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
            icon={<LayoutDashboard className="w-5 h-5" />} 
            label="Dashboard" 
          />
          <NavItem 
            active={activeTab === 'crops'} 
            onClick={() => setActiveTab('crops')} 
            icon={<Sprout className="w-5 h-5" />} 
            label="My Crops" 
          />
          <NavItem 
            active={activeTab === 'tasks'} 
            onClick={() => setActiveTab('tasks')} 
            icon={<Calendar className="w-5 h-5" />} 
            label="Tasks" 
          />
          <NavItem 
            active={activeTab === 'inventory'} 
            onClick={() => setActiveTab('inventory')} 
            icon={<Package className="w-5 h-5" />} 
            label="Inventory" 
          />
        </nav>

        <div className="p-4 border-t border-zinc-100">
          <div className="bg-zinc-50 rounded-2xl p-4">
            <p className="text-xs font-medium text-zinc-500 uppercase mb-2">Farm Profile</p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs">
                SG
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">Green Valley Farm</p>
                <p className="text-xs text-zinc-500 truncate">Sushmitha G.</p>
              </div>
              <Settings className="w-4 h-4 text-zinc-400 cursor-pointer hover:text-zinc-600" />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-zinc-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="lg:hidden flex items-center gap-3">
            <Sprout className="w-6 h-6 text-emerald-600" />
            <h1 className="text-lg font-bold">AgriGrow</h1>
          </div>
          <div className="flex-1 flex justify-center lg:justify-start">
            <div className="relative w-full max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input 
                type="text" 
                placeholder="Search crops, tasks, or advice..." 
                className="w-full pl-10 pr-4 py-2 bg-zinc-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-sm font-medium text-zinc-600">
              <CloudSun className="w-4 h-4 text-amber-500" />
              <span>24°C</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-zinc-400" />
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'crops' && renderCrops()}
          {activeTab === 'inventory' && renderInventory()}
          {activeTab === 'tasks' && (
            <div className="text-center py-20">
              <Calendar className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold">Task Board Coming Soon</h2>
              <p className="text-zinc-500">We're finalizing the interactive task management view.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function NavItem({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200",
        active 
          ? "bg-emerald-50 text-emerald-700 shadow-sm ring-1 ring-emerald-600/10" 
          : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
      )}
    >
      <span className={cn(active ? "text-emerald-600" : "text-zinc-400")}>
        {icon}
      </span>
      {label}
    </button>
  );
}

function StatCard({ icon, label, value, subValue }: { icon: React.ReactNode, label: string, value: string | number, subValue: string }) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-black/5 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 bg-zinc-50 rounded-lg text-zinc-600">
          {icon}
        </div>
        <span className="text-sm font-medium text-zinc-500">{label}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-zinc-900">{value}</span>
        <span className="text-xs text-zinc-400">{subValue}</span>
      </div>
    </div>
  );
}
