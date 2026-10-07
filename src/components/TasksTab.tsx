/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  CalendarClock, 
  Plus, 
  Droplets, 
  Sprout, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Trash2, 
  Repeat, 
  Search, 
  Filter, 
  Sparkles, 
  Calendar, 
  X, 
  ChevronRight,
  Check,
  Wheat,
  Activity,
  Layers,
  ArrowRight
} from 'lucide-react';
import { CropTask, TaskType, TaskPriority, TaskFrequency } from '../types';
import { CROPS_DATA } from '../data/crops';

interface TasksTabProps {
  tasks: CropTask[];
  onAddTask: (task: Omit<CropTask, 'id' | 'createdAt' | 'status'>) => void;
  onToggleComplete: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onSnoozeTask: (taskId: string, days?: number) => void;
  swahiliPreference: boolean;
}

export default function TasksTab({
  tasks,
  onAddTask,
  onToggleComplete,
  onDeleteTask,
  onSnoozeTask,
  swahiliPreference
}: TasksTabProps) {
  const [filterType, setFilterType] = useState<'all' | 'due' | 'watering' | 'planting' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states for new task
  const [formTitle, setFormTitle] = useState('');
  const [formType, setFormType] = useState<TaskType>('watering');
  const [formCrop, setFormCrop] = useState('');
  const [formDueDate, setFormDueDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [formDueTime, setFormDueTime] = useState('07:00');
  const [formFrequency, setFormFrequency] = useState<TaskFrequency>('once');
  const [formPriority, setFormPriority] = useState<TaskPriority>('medium');
  const [formNotes, setFormNotes] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  // Quick Agronomic Preset Templates
  const AGRONOMIC_PRESETS = [
    {
      title: 'Morning Drip Irrigation Cycle',
      titleSw: 'Mzunguko wa Kumwagilia Asubuhi',
      type: 'watering' as TaskType,
      crop: 'Tomato',
      frequency: 'daily' as TaskFrequency,
      priority: 'high' as TaskPriority,
      notes: 'Apply 3.5L per plant via drip emitters before 09:00 AM heat.'
    },
    {
      title: 'Main Season Hybrid Maize Sowing',
      titleSw: 'Kupanda Mahindi Msimu Mkuu',
      type: 'planting' as TaskType,
      crop: 'Maize',
      frequency: 'once' as TaskFrequency,
      priority: 'critical' as TaskPriority,
      notes: 'Plant at 75cm x 25cm spacing with DAP basal dressing.'
    },
    {
      title: 'Knee-High Nitrogen (CAN) Top-Dressing',
      titleSw: 'Kuweka Mbolea ya Kukuzia (CAN)',
      type: 'fertilizer' as TaskType,
      crop: 'Maize',
      frequency: 'once' as TaskFrequency,
      priority: 'high' as TaskPriority,
      notes: 'Apply 50kg/acre CAN in moist soil around root drip line.'
    },
    {
      title: 'Weekly Fall Armyworm Leaf Scouting',
      titleSw: 'Ukaguzi wa Kila Wiki wa Funza wa Jeshi',
      type: 'pest_control' as TaskType,
      crop: 'Maize',
      frequency: 'weekly' as TaskFrequency,
      priority: 'medium' as TaskPriority,
      notes: 'Inspect central whorls across W-shaped field sampling pattern.'
    },
    {
      title: 'Pre-Flowering Coffee Rust Copper Spray',
      titleSw: 'Kupulizia Shaba Kuzuia Kutu ya Kahawa',
      type: 'pest_control' as TaskType,
      crop: 'Arabica Coffee',
      frequency: 'biweekly' as TaskFrequency,
      priority: 'high' as TaskPriority,
      notes: 'Apply Copper Oxychloride before seasonal long rains trigger sporulation.'
    }
  ];

  const handleApplyPreset = (preset: typeof AGRONOMIC_PRESETS[0]) => {
    setFormTitle(swahiliPreference ? preset.titleSw : preset.title);
    setFormType(preset.type);
    setFormCrop(preset.crop);
    setFormFrequency(preset.frequency);
    setFormPriority(preset.priority);
    setFormNotes(preset.notes);
    setShowAddModal(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    onAddTask({
      title: formTitle.trim(),
      taskType: formType,
      cropName: formCrop.trim() || undefined,
      dueDate: formDueDate,
      dueTime: formDueTime || undefined,
      frequency: formFrequency,
      priority: formPriority,
      notes: formNotes.trim() || undefined
    });

    // Reset and close
    setFormTitle('');
    setFormNotes('');
    setShowAddModal(false);
  };

  // Quick date setter helpers
  const setQuickDate = (offsetDays: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    setFormDueDate(d.toISOString().split('T')[0]);
  };

  // Filter tasks
  const filteredTasks = tasks.filter(t => {
    // Category filter
    if (filterType === 'completed') {
      if (t.status !== 'completed') return false;
    } else {
      if (t.status === 'completed') return false;
      if (filterType === 'due' && t.dueDate > todayStr) return false;
      if (filterType === 'watering' && t.taskType !== 'watering') return false;
      if (filterType === 'planting' && t.taskType !== 'planting') return false;
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchCrop = t.cropName ? t.cropName.toLowerCase().includes(q) : false;
      const matchNotes = t.notes ? t.notes.toLowerCase().includes(q) : false;
      if (!matchTitle && !matchCrop && !matchNotes) return false;
    }

    return true;
  });

  // Stats
  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const dueCount = pendingTasks.filter(t => t.dueDate <= todayStr).length;
  const wateringCount = pendingTasks.filter(t => t.taskType === 'watering').length;
  const plantingCount = pendingTasks.filter(t => t.taskType === 'planting').length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Top Banner & Stats */}
      <div className="glass-panel rounded-3xl p-6 sm:p-7 relative overflow-hidden border border-blue-900/60 shadow-xl">
        <div className="absolute top-0 right-0 w-72 h-72 bg-blue-600/5 rounded-full filter blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex gap-4 items-start">
            <div className="p-3.5 bg-blue-600/15 border border-blue-500/30 rounded-2xl text-blue-400">
              <CalendarClock className="w-8 h-8 stroke-2" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] uppercase font-mono tracking-widest bg-blue-900/40 text-blue-300 px-2.5 py-1 rounded-md border border-blue-800/30 font-semibold">
                  Field Operations Engine
                </span>
                {dueCount > 0 && (
                  <span className="text-[10px] uppercase font-mono tracking-widest bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-md border border-amber-500/40 font-bold flex items-center gap-1 animate-pulse">
                    <Clock className="w-3 h-3 text-amber-400" />
                    {dueCount} {swahiliPreference ? 'Zinazotakiwa Leo' : 'Due for Action'}
                  </span>
                )}
              </div>
              <h2 className="font-display font-medium text-xl sm:text-2xl text-white mt-1.5">
                {swahiliPreference ? 'Ratiba na Vikumbusho vya Shambani' : 'Planting & Irrigation Task Schedule'}
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed mt-1 max-w-2xl">
                {swahiliPreference 
                  ? 'Weka ratiba sahihi za umwagiliaji, tarehe za upandaji, uwekaji wa mbolea, na udhibiti wa wadudu. Vikumbusho vilivyofika vitaonekana juu ya dashibodi.'
                  : 'Manage operational watering cycles, sowing windows, fertilizer applications, and field scouting. Due tasks trigger persistent top-of-dashboard alerts.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-mono font-semibold tracking-wide transition-all cursor-pointer shadow-lg shadow-blue-950/60 flex items-center gap-2 self-start md:self-center shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{swahiliPreference ? 'Ongeza Kikumbusho Kipya' : 'Add Task / Alert'}</span>
          </button>
        </div>

        {/* Schedule Metric Counters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-5 border-t border-blue-950/70">
          <div className="p-3 bg-slate-950/80 rounded-xl border border-blue-950 text-left">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">Total Active</span>
            <span className="text-xl font-mono font-bold text-white mt-0.5 block">{pendingTasks.length}</span>
          </div>

          <div className="p-3 bg-slate-950/80 rounded-xl border border-blue-950 text-left">
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Due / Overdue
            </span>
            <span className={`text-xl font-mono font-bold mt-0.5 block ${dueCount > 0 ? 'text-amber-400' : 'text-slate-300'}`}>
              {dueCount}
            </span>
          </div>

          <div className="p-3 bg-slate-950/80 rounded-xl border border-blue-950 text-left">
            <span className="text-[10px] font-mono uppercase tracking-wider text-blue-400 flex items-center gap-1">
              <Droplets className="w-3 h-3" /> Watering
            </span>
            <span className="text-xl font-mono font-bold text-blue-400 mt-0.5 block">{wateringCount}</span>
          </div>

          <div className="p-3 bg-slate-950/80 rounded-xl border border-blue-950 text-left">
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 flex items-center gap-1">
              <Sprout className="w-3 h-3" /> Planting
            </span>
            <span className="text-xl font-mono font-bold text-emerald-400 mt-0.5 block">{plantingCount}</span>
          </div>

          <div className="p-3 bg-slate-950/80 rounded-xl border border-blue-950 text-left col-span-2 sm:col-span-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Completed
            </span>
            <span className="text-xl font-mono font-bold text-emerald-400 mt-0.5 block">{completedCount}</span>
          </div>
        </div>
      </div>

      {/* 1-Click Fast Presets Carousel */}
      <div className="space-y-2">
        <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center justify-between">
          <span>{swahiliPreference ? 'Mifano ya Haraka ya Kilimo (Bofya Kujaza Ratiba):' : 'Instant Agronomic Schedule Presets (Click to Load):'}</span>
          <span className="text-[9px] font-mono text-blue-400">1-Click Templates</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {AGRONOMIC_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyPreset(preset)}
              className="p-3 bg-slate-900/60 hover:bg-slate-900 border border-blue-950 hover:border-blue-700/80 rounded-xl text-left transition-all cursor-pointer flex flex-col justify-between gap-2 group"
            >
              <div className="flex items-center justify-between">
                <span className={`p-1.5 rounded-lg text-xs ${
                  preset.type === 'watering' ? 'bg-blue-600/20 text-blue-400' :
                  preset.type === 'planting' ? 'bg-emerald-600/20 text-emerald-400' :
                  'bg-amber-600/20 text-amber-400'
                }`}>
                  {preset.type === 'watering' ? <Droplets className="w-3.5 h-3.5" /> :
                   preset.type === 'planting' ? <Sprout className="w-3.5 h-3.5" /> :
                   <Sparkles className="w-3.5 h-3.5" />}
                </span>
                <span className="text-[9px] font-mono text-slate-500 uppercase">{preset.frequency}</span>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white group-hover:text-blue-300 transition-colors line-clamp-1">
                  {swahiliPreference ? preset.titleSw : preset.title}
                </h4>
                <p className="text-[10px] font-mono text-slate-400 mt-0.5">{preset.crop}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-900/40 p-2.5 rounded-2xl border border-blue-950/60 backdrop-blur-md">
        <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
          {[
            { id: 'all', label: swahiliPreference ? 'Zote Zinazosubiri' : 'All Active', icon: Layers },
            { id: 'due', label: swahiliPreference ? 'Zilizo Fika / Zilizochelewa' : 'Due Today / Overdue', icon: Clock },
            { id: 'watering', label: swahiliPreference ? 'Umwagiliaji' : 'Watering', icon: Droplets },
            { id: 'planting', label: swahiliPreference ? 'Upandaji' : 'Planting', icon: Sprout },
            { id: 'completed', label: swahiliPreference ? 'Zilizokamilika' : 'Completed', icon: CheckCircle2 }
          ].map(tab => {
            const Icon = tab.icon;
            const active = filterType === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterType(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  active 
                    ? 'bg-blue-600 text-white font-semibold shadow-md' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            placeholder={swahiliPreference ? "Tafuta kazi au zao..." : "Filter tasks or crop..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-blue-950/90 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-700"
          />
        </div>
      </div>

      {/* Task List Grid */}
      {filteredTasks.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/30 rounded-3xl border border-blue-950/60 space-y-3">
          <div className="p-4 bg-blue-950/30 rounded-2xl w-14 h-14 mx-auto flex items-center justify-center text-blue-400 border border-blue-900/40">
            <CalendarClock className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-white font-display">
            {swahiliPreference ? 'Hakuna vikumbusho vilivyopatikana' : 'No schedule alerts found in this view'}
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {swahiliPreference 
              ? 'Ongeza ratiba mpya ya kumwagilia au kupanda ili uweze kupata tahadhari inayotokea juu ya dashibodi.' 
              : 'Add a new watering or planting schedule alert to receive high-visibility alerts on your dashboard when due.'}
          </p>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-mono transition-colors cursor-pointer inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{swahiliPreference ? 'Unda Kikumbusho cha Kwanza' : 'Create First Alert'}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredTasks.map(task => {
            const isCompleted = task.status === 'completed';
            const isOverdue = !isCompleted && task.dueDate < todayStr;
            const isDueToday = !isCompleted && task.dueDate === todayStr;

            return (
              <div
                key={task.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                  isCompleted
                    ? 'bg-slate-950/40 border-slate-900/80 opacity-60'
                    : isOverdue
                    ? 'bg-red-950/20 border-red-900/50 hover:border-red-700'
                    : isDueToday
                    ? 'bg-amber-950/25 border-amber-800/60 hover:border-amber-600 shadow-md shadow-amber-950/20'
                    : task.taskType === 'watering'
                    ? 'bg-blue-950/20 border-blue-900/50 hover:border-blue-700'
                    : 'bg-slate-900/60 border-blue-950 hover:border-blue-800'
                }`}
              >
                <div>
                  {/* Top row: Type Icon, Title, Checkbox, Priority */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      {/* Interactive completion toggle checkbox */}
                      <button
                        type="button"
                        onClick={() => onToggleComplete(task.id)}
                        className={`w-5 h-5 rounded-md border mt-0.5 flex items-center justify-center transition-all cursor-pointer ${
                          isCompleted
                            ? 'bg-emerald-600 border-emerald-500 text-white'
                            : 'border-slate-600 hover:border-blue-400 bg-slate-950'
                        }`}
                        title={isCompleted ? 'Mark incomplete' : 'Mark completed'}
                      >
                        {isCompleted && <Check className="w-3.5 h-3.5" />}
                      </button>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className={`text-sm font-semibold font-display ${
                            isCompleted ? 'line-through text-slate-500' : 'text-white'
                          }`}>
                            {task.title}
                          </h4>
                          {task.cropName && (
                            <span className="text-[10px] font-mono bg-slate-950 text-blue-300 border border-blue-950 px-2 py-0.5 rounded">
                              {task.cropName}
                            </span>
                          )}
                        </div>

                        {task.notes && (
                          <p className={`text-xs leading-relaxed mt-1 ${isCompleted ? 'text-slate-500' : 'text-slate-300'}`}>
                            {task.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Priority badge */}
                    <span className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded shrink-0 font-bold ${
                      task.priority === 'critical' ? 'bg-red-950 text-red-300 border border-red-800' :
                      task.priority === 'high' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                      task.priority === 'medium' ? 'bg-blue-950 text-blue-300 border border-blue-900' :
                      'bg-slate-900 text-slate-400 border border-slate-800'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                </div>

                {/* Footer metadata & quick actions */}
                <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between gap-2 flex-wrap text-xs">
                  <div className="flex items-center gap-3 text-[11px] font-mono">
                    {/* Due Date Indicator */}
                    <span className={`flex items-center gap-1 font-semibold ${
                      isCompleted ? 'text-slate-500' :
                      isOverdue ? 'text-red-400' :
                      isDueToday ? 'text-amber-400' :
                      'text-slate-400'
                    }`}>
                      <Calendar className="w-3 h-3" />
                      {isOverdue ? (swahiliPreference ? 'Ilichelewa: ' : 'Overdue: ') : (swahiliPreference ? 'Tarehe: ' : 'Due: ')}
                      {task.dueDate}
                      {task.dueTime && ` @ ${task.dueTime}`}
                    </span>

                    {/* Recurring Frequency Badge */}
                    {task.frequency !== 'once' && (
                      <span className="text-slate-400 flex items-center gap-1 capitalize">
                        <Repeat className="w-3 h-3 text-blue-400" />
                        {task.frequency.replace('_', ' ')}
                      </span>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-1.5">
                    {!isCompleted && (
                      <button
                        type="button"
                        onClick={() => onSnoozeTask(task.id, 1)}
                        className="px-2 py-1 bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-white rounded text-[10px] font-mono transition-colors cursor-pointer"
                        title="Snooze 1 day"
                      >
                        {swahiliPreference ? '+1 Siku' : '+1d'}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onDeleteTask(task.id)}
                      className="p-1 text-slate-500 hover:text-red-400 transition-colors cursor-pointer rounded hover:bg-slate-800/60"
                      title="Delete alert"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ADD NEW TASK MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div 
            className="glass-panel w-full max-w-lg rounded-3xl overflow-hidden border border-blue-900/60 shadow-2xl flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-blue-950/80 flex items-center justify-between bg-slate-900/60">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-600/20 border border-blue-500/30 rounded-xl text-blue-400">
                  <CalendarClock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-medium text-base text-white">
                    {swahiliPreference ? 'Weka Kikumbusho Kipya cha Shamba' : 'Create New Farm Schedule Alert'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {swahiliPreference 
                      ? 'Tahadhari hii itaonekana juu ya dashibodi pindi itakapofika wakati.' 
                      : 'This schedule will alert you prominently at the top of the dashboard when due.'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/60 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="p-5 overflow-y-auto space-y-4">
              {/* Task Title */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  {swahiliPreference ? 'Kichwa cha Kikumbusho:' : 'Schedule / Alert Title:'} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tomato Morning Drip Cycle, Maize Seed Planting"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-blue-950 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 outline-none focus:border-blue-700"
                />
              </div>

              {/* Task Type Selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  {swahiliPreference ? 'Aina ya Kazi:' : 'Task Category:'}
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                  {[
                    { id: 'watering', label: swahiliPreference ? 'Umwagiliaji' : 'Watering', icon: Droplets, color: 'text-blue-400 border-blue-800' },
                    { id: 'planting', label: swahiliPreference ? 'Upandaji' : 'Planting', icon: Sprout, color: 'text-emerald-400 border-emerald-800' },
                    { id: 'fertilizer', label: swahiliPreference ? 'Mbolea' : 'Fertilizer', icon: Sparkles, color: 'text-amber-400 border-amber-800' },
                    { id: 'pest_control', label: swahiliPreference ? 'Wadudu' : 'Pest Control', icon: AlertTriangle, color: 'text-rose-400 border-rose-800' },
                    { id: 'harvesting', label: swahiliPreference ? 'Uvunaji' : 'Harvesting', icon: Wheat, color: 'text-yellow-400 border-yellow-800' },
                    { id: 'general', label: swahiliPreference ? 'Kazi Nyingine' : 'General', icon: Activity, color: 'text-slate-400 border-slate-800' }
                  ].map(typeItem => {
                    const Icon = typeItem.icon;
                    const isSelected = formType === typeItem.id;
                    return (
                      <button
                        key={typeItem.id}
                        type="button"
                        onClick={() => setFormType(typeItem.id as any)}
                        className={`p-2 rounded-xl border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600 text-white font-semibold shadow-md'
                            : 'bg-slate-950/80 border-blue-950 text-slate-400 hover:text-white'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{typeItem.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Associated Crop */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  {swahiliPreference ? 'Zao Linalohusika (Hiari):' : 'Associated Crop (Optional):'}
                </label>
                <div className="flex gap-2">
                  <select
                    value={formCrop}
                    onChange={(e) => setFormCrop(e.target.value)}
                    className="w-full bg-slate-950 border border-blue-950 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-blue-700"
                  >
                    <option value="">-- {swahiliPreference ? 'Chagua Zao au Andika' : 'Select Catalog Crop or None'} --</option>
                    {CROPS_DATA.map(c => (
                      <option key={c.id} value={c.name}>{c.name} ({c.category})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Due Date & Quick Date Buttons */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                    {swahiliPreference ? 'Tarehe ya Utekelezaji:' : 'Due Date:'} *
                  </label>
                  <div className="flex items-center gap-1 text-[10px] font-mono">
                    <button
                      type="button"
                      onClick={() => setQuickDate(0)}
                      className="px-2 py-0.5 rounded bg-slate-900 border border-blue-950 text-slate-400 hover:text-white cursor-pointer"
                    >
                      {swahiliPreference ? 'Leo' : 'Today'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickDate(1)}
                      className="px-2 py-0.5 rounded bg-slate-900 border border-blue-950 text-slate-400 hover:text-white cursor-pointer"
                    >
                      {swahiliPreference ? 'Kesho' : '+1d'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickDate(3)}
                      className="px-2 py-0.5 rounded bg-slate-900 border border-blue-950 text-slate-400 hover:text-white cursor-pointer"
                    >
                      +3d
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickDate(7)}
                      className="px-2 py-0.5 rounded bg-slate-900 border border-blue-950 text-slate-400 hover:text-white cursor-pointer"
                    >
                      +1w
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="date"
                    required
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    className="w-full bg-slate-950 border border-blue-950 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-blue-700 font-mono"
                  />
                  <input
                    type="time"
                    value={formDueTime}
                    onChange={(e) => setFormDueTime(e.target.value)}
                    className="w-full bg-slate-950 border border-blue-950 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-blue-700 font-mono"
                  />
                </div>
              </div>

              {/* Recurring Schedule & Priority */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                    {swahiliPreference ? 'Mzunguko (Kurudia):' : 'Repeat Frequency:'}
                  </label>
                  <select
                    value={formFrequency}
                    onChange={(e) => setFormFrequency(e.target.value as any)}
                    className="w-full bg-slate-950 border border-blue-950 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-700 capitalize"
                  >
                    <option value="once">{swahiliPreference ? 'Mara Moja Tu' : 'Once (Non-repeating)'}</option>
                    <option value="daily">{swahiliPreference ? 'Kila Siku' : 'Daily'}</option>
                    <option value="every_2_days">{swahiliPreference ? 'Kila Baada ya Siku 2' : 'Every 2 Days'}</option>
                    <option value="weekly">{swahiliPreference ? 'Kila Wiki' : 'Weekly'}</option>
                    <option value="biweekly">{swahiliPreference ? 'Kila Wiki 2' : 'Bi-weekly'}</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                    {swahiliPreference ? 'Kipaumbele:' : 'Priority Level:'}
                  </label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as any)}
                    className="w-full bg-slate-950 border border-blue-950 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-700 capitalize"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  {swahiliPreference ? 'Maelekezo au Vidokezo:' : 'Field Notes / Instructions:'}
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Target soil moisture at 25mm, check drip emitters for silt blockages"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-blue-950 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 outline-none focus:border-blue-700 resize-none font-sans"
                />
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="pt-2 flex justify-end gap-3 border-t border-blue-950/70">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-blue-950 text-xs font-mono text-slate-400 hover:text-white cursor-pointer"
                >
                  {swahiliPreference ? 'Ghairi' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer shadow-lg shadow-blue-950"
                >
                  {swahiliPreference ? 'Hifadhi Kikumbusho' : 'Save Schedule Alert'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
