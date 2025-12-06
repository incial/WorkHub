
import React, { useState } from 'react';
import { Task, TaskPriority, TaskStatus } from '../../types';
import { formatDate, getTaskPriorityStyles, getTaskStatusStyles } from '../../utils';
import { Edit2, Trash2, ChevronDown, Calendar, User } from 'lucide-react';

interface TasksTableProps {
  data: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
  onStatusChange: (task: Task, newStatus: TaskStatus) => void;
  onPriorityChange: (task: Task, newPriority: TaskPriority) => void;
}

const Avatar = ({ name }: { name: string }) => {
    const initials = name === 'Unassigned' ? '?' : name.slice(0, 2).toUpperCase();
    const bg = name === 'Unassigned' ? 'bg-gray-100 text-gray-400' : 'bg-brand-100 text-brand-700';
    return (
        <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold ${bg}`} title={name}>
            {initials}
        </div>
    );
};

export const TasksTable: React.FC<TasksTableProps> = ({ data, onEdit, onDelete, onStatusChange, onPriorityChange }) => {
  // Inline editing popover states could be complex, using native selects styled as badges for simplicity and speed
  // To make it look "Notion-like", we style the select to be transparent and overlay the badge.

  return (
    <div className="overflow-x-auto bg-white min-h-[400px]">
        <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-6 py-3 text-xs font-bold text-gray-400 uppercase w-1/3">Task Name</th>
                    <th className="px-6 py-3 text-xs font-bold text-gray-400 uppercase">Status</th>
                    <th className="px-6 py-3 text-xs font-bold text-gray-400 uppercase">Assignee</th>
                    <th className="px-6 py-3 text-xs font-bold text-gray-400 uppercase">Due Date</th>
                    <th className="px-6 py-3 text-xs font-bold text-gray-400 uppercase">Priority</th>
                    <th className="px-6 py-3 text-xs font-bold text-gray-400 uppercase text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
                {data.map(task => (
                    <tr key={task.id} className="group hover:bg-gray-50/50 transition-colors">
                        {/* Name */}
                        <td className="px-6 py-3">
                            <button onClick={() => onEdit(task)} className="text-sm font-medium text-gray-900 hover:text-brand-600 hover:underline text-left truncate max-w-xs block">
                                {task.title}
                            </button>
                        </td>

                        {/* Status (Dropdown) */}
                        <td className="px-6 py-3">
                            <div className="relative inline-block group/select">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border shadow-sm ${getTaskStatusStyles(task.status)} pointer-events-none`}>
                                    {task.status}
                                    <ChevronDown className="h-3 w-3 opacity-50" />
                                </span>
                                <select 
                                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                    value={task.status}
                                    onChange={(e) => onStatusChange(task, e.target.value as TaskStatus)}
                                >
                                    <option value="Not Started">Not Started</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Completed">Completed</option>
                                </select>
                            </div>
                        </td>

                        {/* Assignee */}
                        <td className="px-6 py-3">
                             <div className="flex items-center gap-2">
                                <Avatar name={task.assignedTo} />
                                <span className="text-xs text-gray-600">{task.assignedTo}</span>
                             </div>
                        </td>

                        {/* Due Date */}
                        <td className="px-6 py-3">
                            <div className="flex items-center gap-2 text-sm text-gray-600 group-hover:text-gray-900">
                                <Calendar className="h-3.5 w-3.5 text-gray-400" />
                                {formatDate(task.dueDate)}
                            </div>
                        </td>

                        {/* Priority (Dropdown) */}
                        <td className="px-6 py-3">
                             <div className="relative inline-block">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${getTaskPriorityStyles(task.priority)}`}>
                                    {task.priority}
                                    <ChevronDown className="h-3 w-3 opacity-50" />
                                </span>
                                <select 
                                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                    value={task.priority}
                                    onChange={(e) => onPriorityChange(task, e.target.value as TaskPriority)}
                                >
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                </select>
                            </div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-3 text-right">
                             <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => onEdit(task)} className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg">
                                    <Edit2 className="h-4 w-4" />
                                </button>
                                <button onClick={() => onDelete(task.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                                    <Trash2 className="h-4 w-4" />
                                </button>
                             </div>
                        </td>
                    </tr>
                ))}
                {data.length === 0 && (
                     <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-400 text-sm">
                            No tasks found. Create one to get started!
                        </td>
                     </tr>
                )}
            </tbody>
        </table>
    </div>
  );
};
