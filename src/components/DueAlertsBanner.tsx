/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Bell, 
  BellRing, 
  Droplets, 
  Sprout, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ArrowRight, 
  ChevronDown, 
  ChevronUp,
  Calendar,
  Sparkles,
  CalendarClock
} from 'lucide-react';
import { CropTask } from '../types';

interface DueAlertsBannerProps {
  tasks: CropTask[];
  onCompleteTask: (taskId: string) => void;
  onSnoozeTask: (taskId: string, days?: number) => void;
  onOpenTasksTab: () => void;
  swahiliPreference: boolean;
}

export default function DueAlertsBanner({
  tasks,
  onCompleteTask,
  onSnoozeTask,
  onOpenTasksTab,
  swahiliPreference
}: DueAlertsBannerProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Compute today's date string YYYY-MM-DD
  const todayStr = new Date().toISOString().split('T')[0];

  // Filter tasks that are pending and due today or overdue
  const dueTasks = tasks.filter(task => {
    if (task.status !== 'pending') return false;
    return task.dueDate <= todayStr;
  });

  if (dueTasks.length === 0) {
    return null;
  }

  const wateringAlerts = dueTasks.filter(t => t.taskType === 'watering');
  const plantingAlerts = dueTasks.filter(t => t.taskType === 'planting');
  const otherAlerts = dueTasks.filter(t => t.taskType !== 'watering' && t.taskType !== 'planting');

  const overdueCount = dueTasks.filter(t => t.dueDate < todayStr).length;

  return (
    <div className="w-full bg-gradient-to-r from-amber-950/40 via-blue-950/40 to-emerald-950/40 border border-amber-600/40 rounded-2xl p-4 sm:p-5 shadow-2xl relative overflow-hidden animate-fade-in backdrop-blur-md">
      {/* Background glow accent */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/10 rounded-full filter blur-2xl pointer-events-none" />

      {/* Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative p-2.5 bg-amber-500/20 border border-amber-500/40 rounded-xl text-amber-400 shrink-0">
            <BellRing className="w-5 h-5 animate-bounce" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-slate-950 animate-ping" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 rounded-full">
                {swahiliPreference ? 'Tahadhari ya Kazi Zilizofika Wakati' : 'Action Due Alert'}
              </span>
              {overdueCount > 0 && (
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-red-950 text-red-300 border border-red-700/50 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-red-400" />
                  {overdueCount} {swahiliPreference ? 'Zilizo Pitiliza' : 'Overdue'}
                </span>
              )}
            </div>

            <h3 className="font-display font-medium text-sm sm:text-base text-white mt-1">
              {swahiliPreference 
                ? `Una kazi ${dueTasks.length} za kilimo zinazohitaji hatua leo!` 
                : `You have ${dueTasks.length} schedule ${dueTasks.length === 1 ? 'alert' : 'alerts'} due for action today!`}
            </h3>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            type="button"
            onClick={onOpenTasksTab}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-blue-950"
          >
            <CalendarClock className="w-3.5 h-3.5" />
            <span>{swahiliPreference ? 'Tazama Kazi Zote' : 'View Task Manager'}</span>
            <ArrowRight className="w-3 h-3" />
          </button>

          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors cursor-pointer"
            title={isCollapsed ? 'Expand alerts' : 'Collapse alerts'}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Quick Task Cards Grid */}
      {!isCollapsed && (
        <div className="mt-4 pt-3 border-t border-amber-900/30 space-y-2.5">
          {/* Quick Badges Counter */}
          <div className="flex items-center gap-3 text-xs flex-wrap font-mono pb-1">
            {wateringAlerts.length > 0 && (
              <span className="flex items-center gap-1.5 text-blue-300 bg-blue-950/80 px-2.5 py-1 rounded-lg border border-blue-800/50">
                <Droplets className="w-3.5 h-3.5 text-blue-400" />
                <strong>{wateringAlerts.length}</strong> {swahiliPreference ? 'Umwagiliaji' : 'Watering Alerts'}
              </span>
            )}
            {plantingAlerts.length > 0 && (
              <span className="flex items-center gap-1.5 text-emerald-300 bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-800/50">
                <Sprout className="w-3.5 h-3.5 text-emerald-400" />
                <strong>{plantingAlerts.length}</strong> {swahiliPreference ? 'Upandaji' : 'Planting Alerts'}
              </span>
            )}
            {otherAlerts.length > 0 && (
              <span className="flex items-center gap-1.5 text-amber-300 bg-amber-950/80 px-2.5 py-1 rounded-lg border border-amber-800/50">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <strong>{otherAlerts.length}</strong> {swahiliPreference ? 'Kazi Nyingine' : 'Crop Management'}
              </span>
            )}
          </div>

          {/* Cards List (Showing up to 4 most critical due tasks) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {dueTasks.slice(0, 4).map(task => {
              const isOverdue = task.dueDate < todayStr;
              return (
                <div
                  key={task.id}
                  className={`p-3.5 rounded-xl border flex flex-col justify-between gap-3 transition-all ${
                    task.taskType === 'watering'
                      ? 'bg-blue-950/40 border-blue-800/60 hover:border-blue-600'
                      : task.taskType === 'planting'
                      ? 'bg-emerald-950/40 border-emerald-800/60 hover:border-emerald-600'
                      : 'bg-amber-950/30 border-amber-800/50 hover:border-amber-600'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                        task.taskType === 'watering'
                          ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                          : task.taskType === 'planting'
                          ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-600/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {task.taskType === 'watering' ? (
                          <Droplets className="w-4 h-4" />
                        ) : task.taskType === 'planting' ? (
                          <Sprout className="w-4 h-4" />
                        ) : (
                          <Calendar className="w-4 h-4" />
                        )}
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs font-semibold text-white font-display">
                            {task.title}
                          </h4>
                          {task.cropName && (
                            <span className="text-[9px] font-mono bg-slate-900 text-slate-300 px-1.5 py-0.2 rounded border border-slate-700">
                              {task.cropName}
                            </span>
                          )}
                        </div>

                        {task.notes && (
                          <p className="text-[11px] text-slate-300 line-clamp-1">
                            {task.notes}
                          </p>
                        )}

                        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                          <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-400 font-bold' : 'text-amber-300'}`}>
                            <Clock className="w-3 h-3" />
                            {isOverdue 
                              ? (swahiliPreference ? 'Ilichelewa: ' : 'Overdue: ') + task.dueDate
                              : (swahiliPreference ? 'Inastahili Leo' : 'Due Today') + (task.dueTime ? ` @ ${task.dueTime}` : '')}
                          </span>
                          {task.frequency !== 'once' && (
                            <span className="text-slate-500 capitalize">
                              • {task.frequency.replace('_', ' ')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Priority badge */}
                    <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded shrink-0 font-bold ${
                      task.priority === 'critical'
                        ? 'bg-red-950 text-red-300 border border-red-800'
                        : task.priority === 'high'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-slate-900 text-slate-400 border border-slate-800'
                    }`}>
                      {task.priority}
                    </span>
                  </div>

                  {/* Task Card Action Buttons */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/60">
                    <button
                      type="button"
                      onClick={() => onSnoozeTask(task.id, 1)}
                      className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg text-[10px] font-mono transition-colors cursor-pointer"
                    >
                      {swahiliPreference ? '+1 Siku' : 'Snooze 1d'}
                    </button>
                    <button
                      type="button"
                      onClick={() => onCompleteTask(task.id)}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-mono font-semibold transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{swahiliPreference ? 'Imekamilika' : 'Mark Done'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {dueTasks.length > 4 && (
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={onOpenTasksTab}
                className="text-[11px] font-mono text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
              >
                +{dueTasks.length - 4} {swahiliPreference ? 'vikumbusho zaidi. Fungua kichupo cha kazi kutazama vyote.' : 'more due alerts. Click to view all in Task Manager.'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
