import React from 'react';
import { Users, Search, User, Store, Trash2 } from 'lucide-react';

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
  isCreatingAdmin: boolean;
  handleCreateAdmin: (e: React.FormEvent) => void;
}

export function AdminUsersTab({
  userSearch, setUserSearch, filteredUsers, handleDeleteUser,
  adminName, setAdminName, adminEmail, setAdminEmail, adminPassword, setAdminPassword,
  showPassword, isCreatingAdmin, handleCreateAdmin
}: AdminUsersTabProps) {
  return (
    <section className="bg-white dark:bg-[#111724] rounded-2xl shadow-sm border border-slate-200/70 dark:border-slate-800/80 overflow-hidden animate-fade-in">
      <div className="p-4 md:p-6 border-b border-slate-100 dark:border-slate-800/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/50 dark:bg-[#090D16]/50">
        <h2 className="text-lg font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Users size={18} className="text-slate-500"/> Platform Users Directory
        </h2>
        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              value={userSearch} onChange={(e) => setUserSearch(e.target.value)}
              placeholder="Search users..." 
              className="w-full pl-9 pr-3 py-2 bg-white dark:bg-[#111724] border border-slate-200 rounded-lg text-sm font-semibold text-slate-800 dark:text-slate-100 focus:border-blue-500 focus:ring-1 outline-none shadow-sm transition-shadow"
            />
          </div>
        </div>
      </div>
      
      {/* Add Admin Inline Form */}
      <div className="p-4 bg-blue-50/50 border-b border-blue-100/50">
        <form onSubmit={handleCreateAdmin} className="flex flex-col sm:flex-row items-end gap-3">
          <div className="flex-1 w-full">
            <input required value={adminName} onChange={(e) => setAdminName(e.target.value)} className="w-full rounded-lg border border-slate-200 p-2 text-sm font-semibold outline-none focus:border-blue-500" placeholder="New Admin Name" />
          </div>
          <div className="flex-1 w-full">
            <input required type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} className="w-full rounded-lg border border-slate-200 p-2 text-sm font-semibold outline-none focus:border-blue-500" placeholder="Email" />
          </div>
          <div className="flex-1 w-full relative">
            <input required type={showPassword ? "text" : "password"} value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} className="w-full rounded-lg border border-slate-200 p-2 text-sm font-semibold outline-none focus:border-blue-500" placeholder="Password" />
          </div>
          <button type="submit" disabled={isCreatingAdmin} className="w-full sm:w-auto rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 transition-colors shrink-0">
            {isCreatingAdmin ? 'Creating...' : 'Add Admin'}
          </button>
        </form>
      </div>

      {/* Table View (Desktop) & Card View (Mobile) */}
      <div className="overflow-x-auto">
        <table className="w-full hidden md:table">
          <thead className="bg-slate-50 border-b border-slate-200/80">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Details</th>
              <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredUsers.map(u => (
              <tr key={u.uid} className="hover:bg-slate-50/50 dark:bg-[#090D16]/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center font-bold mr-3"><User size={16}/></div>
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">{u.name}</div>
                      <div className="text-xs text-slate-500">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    u.role === 'admin' ? 'bg-amber-100 text-amber-800' :
                    u.role === 'retailer' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {u.role || 'customer'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {u.role === 'retailer' ? (
                    <div className="text-xs font-bold text-slate-700 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded inline-block hover:bg-slate-200 transition-colors cursor-pointer"><Store size={12} className="inline mr-1"/> {u.storeName || 'N/A'}</div>
                  ) : <span className="text-slate-400">-</span>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => handleDeleteUser(u.uid, u.role)} className="text-slate-400 hover:text-red-600 transition-colors p-2 rounded-full hover:bg-red-50"><Trash2 size={16}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-slate-100">
          {filteredUsers.map(u => (
            <div key={u.uid} className="p-4 hover:bg-slate-50/50 dark:bg-[#090D16]/50">
              <div className="flex justify-between items-start mb-2">
                <div className="font-bold text-slate-900 dark:text-white">{u.name}</div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    u.role === 'admin' ? 'bg-amber-100 text-amber-800' :
                    u.role === 'retailer' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {u.role || 'customer'}
                  </span>
              </div>
              <div className="text-xs text-slate-500 mb-2">{u.email}</div>
              <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                {u.role === 'retailer' ? (
                  <div className="text-[10px] font-bold text-slate-600 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{u.storeName || 'N/A'}</div>
                ) : <div></div>}
                <button onClick={() => handleDeleteUser(u.uid, u.role)} className="text-red-500 p-1"><Trash2 size={14}/></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
