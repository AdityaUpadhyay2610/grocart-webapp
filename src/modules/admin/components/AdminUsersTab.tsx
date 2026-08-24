import React from 'react';
import { Users, Search, User, Store, Trash2, ShieldCheck, Mail, Lock, Eye, EyeOff } from 'lucide-react';

interface AdminUsersTabProps {
  userSearch: string;
  setUserSearch: (v: string) => void;
  filteredUsers: any[];
  handleDeleteUser: (uid: string, role?: string) => void;
  
  // Create Admin Form
  adminName: string;
  setAdminName: (v: string) => void;
  adminEmail: string;
  setAdminEmail: (v: string) => void;
  adminPassword: string;
  setAdminPassword: (v: string) => void;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
  isCreatingAdmin: boolean;
  handleCreateAdmin: (e: React.FormEvent) => void;
}

export function AdminUsersTab({
  userSearch, setUserSearch, filteredUsers, handleDeleteUser,
  adminName, setAdminName, adminEmail, setAdminEmail, adminPassword, setAdminPassword,
  showPassword, setShowPassword, isCreatingAdmin, handleCreateAdmin
}: AdminUsersTabProps) {
  return (
    <div className="animate-fade-in relative z-10 space-y-6">
      
      {/* Title */}
      <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white tracking-tight px-2">Customer Directory</h2>

      {/* Glass Panel: Add New Admin */}
      <section className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl rounded-[2rem] shadow-sm border border-white/50 dark:border-slate-700/50 p-8">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
          <ShieldCheck size={20} className="text-emerald-500"/> Create New Administrator
        </h3>
        
        <form onSubmit={handleCreateAdmin} className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="relative">
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">Full Name</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                required 
                value={adminName} 
                onChange={(e) => setAdminName(e.target.value)} 
                className="w-full rounded-xl border border-white dark:border-slate-700/50 pl-10 pr-4 py-3 text-sm font-semibold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none bg-white/80 dark:bg-slate-800/80 shadow-sm" 
                placeholder="Admin Name" 
              />
            </div>
          </div>
          
          <div className="relative">
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">Email Address</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                required 
                type="email" 
                value={adminEmail} 
                onChange={(e) => setAdminEmail(e.target.value)} 
                className="w-full rounded-xl border border-white dark:border-slate-700/50 pl-10 pr-4 py-3 text-sm font-semibold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none bg-white/80 dark:bg-slate-800/80 shadow-sm" 
                placeholder="admin@gromart.com" 
              />
            </div>
          </div>
          
          <div className="relative">
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">Temporary Password</label>
            <div className="relative flex items-center">
              <Lock size={16} className="absolute left-3 text-slate-400" />
              <input 
                required 
                type={showPassword ? "text" : "password"} 
                value={adminPassword} 
                onChange={(e) => setAdminPassword(e.target.value)} 
                className="w-full rounded-xl border border-white dark:border-slate-700/50 pl-10 pr-10 py-3 text-sm font-semibold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none bg-white/80 dark:bg-slate-800/80 shadow-sm" 
                placeholder="Secure Password" 
              />
              <button type="button" onClick={() => setShowPassword && setShowPassword(!showPassword)} className="absolute right-3 text-slate-400 hover:text-emerald-500 transition-colors">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="md:col-span-3 flex justify-end mt-2">
            <button 
              type="submit" 
              disabled={isCreatingAdmin} 
              className="w-full md:w-auto rounded-xl bg-emerald-600 py-3.5 px-8 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 hover:shadow-emerald-600/40 active:scale-[0.99] disabled:opacity-50 transition-all flex justify-center items-center gap-2"
            >
              {isCreatingAdmin ? 'Processing...' : 'Create Administrator'}
            </button>
          </div>
        </form>
      </section>

      {/* Glass Panel: User Directory */}
      <section className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl rounded-[2rem] shadow-sm border border-white/50 dark:border-slate-700/50 overflow-hidden">
        <div className="p-6 md:p-8 border-b border-slate-200/50 dark:border-slate-800/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Users size={20} className="text-emerald-500"/> Platform Users
          </h3>
          
          <div className="relative w-full md:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              value={userSearch} onChange={(e) => setUserSearch(e.target.value)}
              placeholder="Search by name, email, or role..." 
              className="w-full pl-9 pr-3 py-2.5 bg-white/80 dark:bg-slate-800/80 border border-white dark:border-slate-700/50 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500/30 outline-none transition-colors shadow-sm"
            />
          </div>
        </div>
        
        {/* Table View (Desktop) */}
        <div className="overflow-x-auto hidden md:block">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-200/50 dark:border-slate-800/50">
              <tr>
                <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">User Details</th>
                <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Assigned Role</th>
                <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Additional Info</th>
                <th className="px-8 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/30">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-12 text-center text-slate-500 font-bold">No users found matching your search.</td>
                </tr>
              ) : filteredUsers.map(u => (
                <tr key={u.uid} className="hover:bg-white/40 dark:hover:bg-slate-800/40 transition-colors group">
                  <td className="px-8 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 flex items-center justify-center font-bold mr-4 shrink-0 shadow-sm">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`} alt={u.name} className="w-full h-full object-cover rounded-full" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white">{u.name}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${
                      u.role === 'admin' ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-400' :
                      u.role === 'retailer' ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400' : 
                      'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-400'
                    }`}>
                      {u.role || 'customer'}
                    </span>
                  </td>
                  <td className="px-8 py-4">
                    {u.role === 'retailer' ? (
                      <div className="text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg inline-flex items-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shadow-sm">
                        <Store size={14} className="mr-2 text-emerald-500"/> {u.storeName || 'Store Profile'}
                      </div>
                    ) : <span className="text-slate-400 dark:text-slate-600">-</span>}
                  </td>
                  <td className="px-8 py-4 text-right">
                    <button 
                      onClick={() => handleDeleteUser(u.uid, u.role)} 
                      className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-500 transition-colors p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-500/10 opacity-0 group-hover:opacity-100"
                      title="Remove User"
                    >
                      <Trash2 size={18}/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800/30">
          {filteredUsers.map(u => (
            <div key={u.uid} className="p-6 hover:bg-white/40 dark:hover:bg-slate-800/40">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0">
                    <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${u.name}`} alt={u.name} className="w-full h-full object-cover rounded-full" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white text-sm">{u.name}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{u.email}</div>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="flex flex-col gap-2">
                  <span className={`inline-flex w-max px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                    u.role === 'admin' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' :
                    u.role === 'retailer' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                  }`}>
                    {u.role || 'customer'}
                  </span>
                  {u.role === 'retailer' && (
                    <div className="text-[10px] font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                      <Store size={12}/> {u.storeName || 'N/A'}
                    </div>
                  )}
                </div>
                <button onClick={() => handleDeleteUser(u.uid, u.role)} className="text-rose-500 p-2 rounded-lg bg-rose-50 dark:bg-rose-900/20"><Trash2 size={16}/></button>
              </div>
            </div>
          ))}
          {filteredUsers.length === 0 && (
            <div className="px-6 py-12 text-center text-slate-500 font-bold">No users found.</div>
          )}
        </div>
      </section>
    </div>
  );
}
