
import React from 'react';
import { Search, X } from 'lucide-react';
import { TaskFilterState } from '../../types';

interface TasksFilterProps {
  filters: TaskFilterState;
  setFilters: React.Dispatch<React.SetStateAction<TaskFilterState>>;
}

export const TasksFilter: React.FC<TasksFilterProps> = ({ filters, setFilters }) => {
  const handleChange = (key: keyof TaskFilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ search: '', status: '', priority: '', assignedTo: '' });
  };

  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between bg-white z-20">
      <div className="relative w-full md:w-64 group">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 group-focus-within:text-brand-500 transition-colors" />
        <input 
            type="text" 
            placeholder="Search tasks..." 
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
            value={filters.search}
            onChange={e => handleChange('search', e.target.value)}
        />
      </div>

      <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
         <select 
            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none hover:border-brand-300"
            value={filters.status}
            onChange={e => handleChange('status', e.target.value)}
         >
            <option value="">All Status</option>
            <option value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
         </select>

         <select 
            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none hover:border-brand-300"
            value={filters.priority}
            onChange={e => handleChange('priority', e.target.value)}
         >
            <option value="">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
         </select>

         <select 
            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none hover:border-brand-300"
            value={filters.assignedTo}
            onChange={e => handleChange('assignedTo', e.target.value)}
         >
            <option value="">All Assignees</option>
            <option value="Vallapata">Vallapata</option>
            <option value="John Doe">John Doe</option>
            <option value="Demo User">Demo User</option>
         </select>

         {hasFilters && (
             <button onClick={clearFilters} className="ml-2 text-xs font-medium text-red-600 hover:text-red-700 flex items-center gap-1">
                 <X className="h-3 w-3" /> Clear
             </button>
         )}
      </div>
    </div>
  );
};
