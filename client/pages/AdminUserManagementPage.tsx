
import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { usersApi } from '../services/api';
import { User } from '../types';
import { Plus, Search, Shield, ShieldCheck, User as UserIcon, Mail, Calendar, Crown, ShieldAlert } from 'lucide-react';
import { CreateUserModal } from '../components/admin/CreateUserModal';

export const AdminUserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
        const data = await usersApi.getAll();
        setUsers(data);
    } catch (e) {
        console.error("Failed to fetch users", e);
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const getRoleBadge = (role: string) => {
      switch(role) {
          case 'ROLE_SUPER_ADMIN':
              return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-yellow-50 text-yellow-700 border border-yellow-200"><Crown className="h-3 w-3 fill-yellow-500 text-yellow-600" /> Super Admin</span>;
          case 'ROLE_ADMIN':
              return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200"><ShieldCheck className="h-3 w-3" /> Admin</span>;
          case 'ROLE_EMPLOYEE':
              return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200"><UserIcon className="h-3 w-3" /> Employee</span>;
          default:
              return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-gray-50 text-gray-600 border border-gray-200">{role}</span>;
      }
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        
        <main className="flex-1 p-8 overflow-y-auto custom-scrollbar h-[calc(100vh-80px)]">
           <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
             <div>
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                    <Shield className="h-8 w-8 text-brand-600" /> Team Management
                </h1>
                <p className="text-gray-500 mt-1 font-medium">Manage system access and create new team members.</p>
             </div>
             
             <div className="flex items-center gap-4">
                 <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Search users..." 
                        className="pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 w-64 shadow-sm"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                 </div>
                 <button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold shadow-lg shadow-brand-500/30 transition-all active:scale-95"
                 >
                    <Plus className="h-5 w-5" />
                    Create User
                 </button>
             </div>
           </div>

           {/* User Grid */}
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {isLoading ? (
                   [1,2,3].map(i => <div key={i} className="h-48 bg-gray-100 rounded-2xl animate-pulse" />)
               ) : (
                   filteredUsers.map(user => (
                       <div key={user.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                           {/* BG Decoration */}
                           <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-bl-[4rem] -z-0 group-hover:scale-110 transition-transform origin-top-right duration-500" />
                           
                           <div className="relative z-10">
                               <div className="flex items-start justify-between mb-4">
                                   <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 p-1">
                                       {user.avatarUrl ? (
                                           <img src={user.avatarUrl} alt={user.name} className="h-full w-full rounded-xl object-cover bg-white" />
                                       ) : (
                                           <div className="h-full w-full rounded-xl bg-white flex items-center justify-center text-xl font-bold text-gray-500">
                                               {user.name.charAt(0)}
                                           </div>
                                       )}
                                   </div>
                                   {getRoleBadge(user.role)}
                               </div>

                               <h3 className="text-lg font-bold text-gray-900 truncate">{user.name}</h3>
                               
                               <div className="mt-4 space-y-2">
                                   <div className="flex items-center gap-2 text-sm text-gray-500 truncate">
                                       <Mail className="h-4 w-4 text-gray-400" />
                                       <span className="truncate">{user.email}</span>
                                   </div>
                                   <div className="flex items-center gap-2 text-sm text-gray-500">
                                       <Calendar className="h-4 w-4 text-gray-400" />
                                       <span>Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</span>
                                   </div>
                               </div>
                           </div>
                       </div>
                   ))
               )}
           </div>
        </main>

        <CreateUserModal 
            isOpen={isCreateModalOpen} 
            onClose={() => setIsCreateModalOpen(false)}
            onSuccess={fetchUsers}
        />
      </div>
    </div>
  );
};
