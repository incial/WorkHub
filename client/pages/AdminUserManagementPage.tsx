
import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { usersApi } from '../services/api';
import { User, UserRole } from '../types';
import { Plus, Search, Shield, ShieldCheck, User as UserIcon, Mail, Calendar, Crown, Briefcase, Filter, ChevronRight, MoreHorizontal, Trash2 } from 'lucide-react';
import { CreateUserModal } from '../components/admin/CreateUserModal';
import { UserProfileModal } from '../components/admin/UserProfileModal';
import { DeleteConfirmationModal } from '../components/ui/DeleteConfirmationModal';
import { CustomSelect } from '../components/ui/CustomSelect';
import { useToast } from '../context/ToastContext';

const ROLE_FILTER_OPTIONS = [
    { label: 'All Roles', value: '' },
    { label: 'Super Admin', value: 'ROLE_SUPER_ADMIN' },
    { label: 'Admin', value: 'ROLE_ADMIN' },
    { label: 'Employee', value: 'ROLE_EMPLOYEE' },
    { label: 'Client', value: 'ROLE_CLIENT' },
];

export const AdminUserManagementPage: React.FC = () => {
  const { showToast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  
  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
        const data = await usersApi.getAll();
        setUsers(data);
    } catch (e) {
        console.error("Failed to fetch users", e);
        showToast("Failed to load users", "error");
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || 
                          u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = filterRole === '' || u.role === filterRole;
    return matchesSearch && matchesRole;
  }).sort((a, b) => {
      // Priority: Super Admin (1) > Admin (2) > Employee (3) > Client (4)
      const rolePriority: Record<string, number> = {
          'ROLE_SUPER_ADMIN': 1,
          'ROLE_ADMIN': 2,
          'ROLE_EMPLOYEE': 3,
          'ROLE_CLIENT': 4
      };

      const pA = rolePriority[a.role] || 99;
      const pB = rolePriority[b.role] || 99;

      if (pA !== pB) return pA - pB;
      
      // Secondary sort: Alphabetical by Name
      return a.name.localeCompare(b.name);
  });

  const handleDeleteUser = async () => {
      if (!userToDelete) return;
      try {
          await usersApi.delete(userToDelete.id);
          showToast(`User ${userToDelete.name} deleted successfully`, "success");
          setUsers(users.filter(u => u.id !== userToDelete.id));
          setUserToDelete(null);
          setSelectedUser(null); // Close profile modal too if it was open
      } catch (e: any) {
          showToast(e.message || "Failed to delete user", "error");
      }
  };

  const handleRoleUpdate = async (userId: number, newRole: string) => {
      try {
          await usersApi.update(userId, { role: newRole as UserRole });
          setUsers(users.map(u => u.id === userId ? { ...u, role: newRole as UserRole } : u));
          if (selectedUser && selectedUser.id === userId) {
              setSelectedUser({ ...selectedUser, role: newRole as UserRole });
          }
          showToast("User role updated successfully", "success");
      } catch (e: any) {
          showToast(e.message || "Failed to update role", "error");
      }
  };

  const getRoleBadge = (role: string) => {
      switch(role) {
          case 'ROLE_SUPER_ADMIN':
              return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-yellow-50 text-yellow-700 border border-yellow-200"><Crown className="h-3 w-3 fill-yellow-500 text-yellow-600" /> Super Admin</span>;
          case 'ROLE_ADMIN':
              return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200"><ShieldCheck className="h-3 w-3" /> Admin</span>;
          case 'ROLE_EMPLOYEE':
              return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200"><UserIcon className="h-3 w-3" /> Employee</span>;
          case 'ROLE_CLIENT':
              return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-orange-50 text-orange-700 border border-orange-200"><Briefcase className="h-3 w-3" /> Client</span>;
          default:
              return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-gray-50 text-gray-600 border border-gray-200">{role}</span>;
      }
  };

  const stats = useMemo(() => ({
      total: users.length,
      admins: users.filter(u => u.role.includes('ADMIN')).length,
      employees: users.filter(u => u.role === 'ROLE_EMPLOYEE').length,
      clients: users.filter(u => u.role === 'ROLE_CLIENT').length,
  }), [users]);

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        
        <main className="flex-1 p-8 overflow-y-auto custom-scrollbar h-[calc(100vh-80px)]">
           
           {/* Header */}
           <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
             <div>
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                    <Shield className="h-8 w-8 text-brand-600" /> Team Directory
                </h1>
                <p className="text-gray-500 mt-2 font-medium">Manage user access, roles, and permissions across the platform.</p>
             </div>
             
             <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-bold shadow-lg shadow-gray-200 transition-all active:scale-95"
             >
                <Plus className="h-5 w-5" />
                Add New User
             </button>
           </div>

           {/* Stats Overview */}
           <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <UserIcon className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Users</p>
                        <p className="text-2xl font-black text-gray-900">{stats.total}</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                        <ShieldCheck className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Admins</p>
                        <p className="text-2xl font-black text-gray-900">{stats.admins}</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <UserIcon className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Team</p>
                        <p className="text-2xl font-black text-gray-900">{stats.employees}</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                        <Briefcase className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Clients</p>
                        <p className="text-2xl font-black text-gray-900">{stats.clients}</p>
                    </div>
                </div>
           </div>

           {/* User Directory List */}
           <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
               
               {/* Controls Bar */}
               <div className="p-5 border-b border-gray-100 bg-white flex flex-col sm:flex-row gap-4 justify-between items-center sticky top-0 z-20">
                    <div className="relative w-full sm:w-96 group">
                        <Search className="absolute left-4 top-3 h-4 w-4 text-gray-400 group-focus-within:text-brand-500 transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Search by name or email..." 
                            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all font-medium"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    
                    <div className="w-full sm:w-48">
                        <CustomSelect 
                            value={filterRole}
                            onChange={(val) => setFilterRole(val)}
                            options={ROLE_FILTER_OPTIONS}
                            placeholder="Filter by Role"
                            className="w-full"
                        />
                    </div>
               </div>

               {/* List Header */}
               <div className="grid grid-cols-12 px-6 py-4 bg-gray-50/50 border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                   <div className="col-span-5 md:col-span-4">User Details</div>
                   <div className="col-span-4 md:col-span-3 text-center md:text-left">Role</div>
                   <div className="col-span-3 md:col-span-3 hidden md:block">Date Joined</div>
                   <div className="col-span-3 md:col-span-2 text-right">Actions</div>
               </div>

               {/* Loading State */}
               {isLoading && (
                   <div className="flex-1 flex flex-col items-center justify-center p-12 space-y-4">
                       <div className="w-12 h-12 border-4 border-gray-100 border-t-brand-600 rounded-full animate-spin"></div>
                       <p className="text-gray-400 text-sm font-medium animate-pulse">Loading directory...</p>
                   </div>
               )}

               {/* Users List */}
               {!isLoading && (
                   <div className="flex-1 overflow-y-auto">
                       {filteredUsers.length > 0 ? (
                           <div className="divide-y divide-gray-50">
                               {filteredUsers.map((user) => (
                                   <div 
                                        key={user.id} 
                                        onClick={() => setSelectedUser(user)}
                                        className="grid grid-cols-12 px-6 py-4 items-center hover:bg-slate-50/80 transition-all cursor-pointer group relative"
                                   >
                                       {/* Highlight Bar on Hover */}
                                       <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                                       {/* User Info */}
                                       <div className="col-span-5 md:col-span-4 flex items-center gap-4">
                                           <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0 border border-white shadow-sm overflow-hidden">
                                               {user.avatarUrl ? (
                                                   <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
                                               ) : (
                                                   <span className="text-sm font-bold text-gray-500">{user.name.charAt(0)}</span>
                                               )}
                                           </div>
                                           <div className="min-w-0">
                                               <h3 className="text-sm font-bold text-gray-900 truncate group-hover:text-brand-600 transition-colors">{user.name}</h3>
                                               <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                                                   <Mail className="h-3 w-3" />
                                                   <span className="truncate">{user.email}</span>
                                               </div>
                                           </div>
                                       </div>

                                       {/* Role */}
                                       <div className="col-span-4 md:col-span-3 flex justify-center md:justify-start">
                                           {getRoleBadge(user.role)}
                                       </div>

                                       {/* Joined Date */}
                                       <div className="col-span-3 md:col-span-3 hidden md:flex items-center gap-2 text-sm text-gray-500">
                                           <Calendar className="h-4 w-4 text-gray-300" />
                                           <span className="font-medium">
                                               {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                                           </span>
                                       </div>

                                       {/* Actions */}
                                       <div className="col-span-3 md:col-span-2 flex justify-end items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                           <button 
                                                onClick={(e) => { e.stopPropagation(); setSelectedUser(user); }}
                                                className="p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                                                title="View Profile"
                                           >
                                               <ChevronRight className="h-5 w-5" />
                                           </button>
                                       </div>
                                   </div>
                               ))}
                           </div>
                       ) : (
                           <div className="flex flex-col items-center justify-center p-20 text-center">
                               <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                   <Search className="h-8 w-8 text-gray-300" />
                               </div>
                               <h3 className="text-lg font-bold text-gray-900">No users found</h3>
                               <p className="text-gray-500 text-sm mt-1">Try adjusting your filters or search terms.</p>
                           </div>
                       )}
                   </div>
               )}
               
               {/* List Footer */}
               <div className="p-4 bg-gray-50 border-t border-gray-100 text-xs font-medium text-gray-400 flex justify-between rounded-b-[2.5rem]">
                   <span>Showing {filteredUsers.length} users</span>
                   <span className="hidden sm:inline">Sorted by Role</span>
               </div>
           </div>
        </main>

        <CreateUserModal 
            isOpen={isCreateModalOpen} 
            onClose={() => setIsCreateModalOpen(false)}
            onSuccess={fetchUsers}
        />

        <UserProfileModal 
            isOpen={!!selectedUser}
            onClose={() => setSelectedUser(null)}
            user={selectedUser}
            onDeleteRequest={(u) => setUserToDelete(u)}
            onRoleUpdate={handleRoleUpdate}
        />

        <DeleteConfirmationModal 
            isOpen={!!userToDelete}
            onClose={() => setUserToDelete(null)}
            onConfirm={handleDeleteUser}
            title="Delete User"
            message={`Are you sure you want to delete ${userToDelete?.name}? This action cannot be undone.`}
            itemName={userToDelete?.email}
        />
      </div>
    </div>
  );
};
