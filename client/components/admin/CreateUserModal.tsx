
import React, { useState } from 'react';
import { X, Save, User, Mail, Lock, Shield } from 'lucide-react';
import { authApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { CustomSelect } from '../ui/CustomSelect';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ROLE_OPTIONS = [
    { label: 'Employee', value: 'ROLE_EMPLOYEE' },
    { label: 'Admin', value: 'ROLE_ADMIN' },
    { label: 'Super Admin', value: 'ROLE_SUPER_ADMIN' },
];

export const CreateUserModal: React.FC<CreateUserModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
      name: '',
      email: '',
      password: '',
      role: 'ROLE_EMPLOYEE'
  });
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
        await authApi.registerUser(formData);
        showToast(`User ${formData.name} created successfully`, 'success');
        // Reset form
        setFormData({
            name: '',
            email: '',
            password: '',
            role: 'ROLE_EMPLOYEE'
        });
        onSuccess();
        onClose();
    } catch (err: any) {
        showToast(err.message || 'Failed to create user', 'error');
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col transform transition-all scale-100" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <User className="h-5 w-5 text-brand-600" /> Create New User
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-200 transition-colors">
                <X className="h-5 w-5" />
            </button>
        </div>

        {/* Content */}
        <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* Name */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Full Name <span className="text-red-500">*</span></label>
                    <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <input 
                            type="text" 
                            required
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none transition-all"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                        />
                    </div>
                </div>

                {/* Email */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Email Address <span className="text-red-500">*</span></label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <input 
                            type="email" 
                            required
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none transition-all"
                            placeholder="john@incial.com"
                            value={formData.email}
                            onChange={e => setFormData({...formData, email: e.target.value})}
                        />
                    </div>
                </div>

                {/* Password */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Password <span className="text-red-500">*</span></label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <input 
                            type="password" 
                            required
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none transition-all"
                            placeholder="Min 6 characters"
                            value={formData.password}
                            onChange={e => setFormData({...formData, password: e.target.value})}
                            minLength={6}
                        />
                    </div>
                </div>

                {/* Role */}
                <div>
                    <CustomSelect 
                        label="System Role"
                        value={formData.role}
                        onChange={(val) => setFormData({...formData, role: val})}
                        options={ROLE_OPTIONS}
                        required
                    />
                    <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        Assign appropriate permissions.
                    </p>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-50 mt-2">
                    <button 
                        type="button" 
                        onClick={onClose} 
                        className="px-5 py-2.5 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="px-5 py-2.5 text-white bg-brand-600 hover:bg-brand-700 rounded-xl font-medium shadow-lg shadow-brand-500/20 flex items-center gap-2 transition-colors disabled:opacity-70"
                    >
                        {isLoading ? (
                            <span className="flex items-center gap-2">Creating...</span>
                        ) : (
                            <>
                                <Save className="h-4 w-4" /> Create User
                            </>
                        )}
                    </button>
                </div>

            </form>
        </div>
      </div>
    </div>
  );
};
