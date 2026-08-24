import React, { useState } from 'react';
import { UserProfile } from '@global/models';
import { authApi } from '@global/services/api/authApi';
import { useToast } from '@global/context/ToastContext';
import { useDispatch } from 'react-redux';
import { setUserProfile } from '@global/store/authSlice';
import { RefreshCw, Save } from 'lucide-react';

interface RetailerSettingsTabProps {
  user: UserProfile;
}

export function RetailerSettingsTab({ user }: RetailerSettingsTabProps) {
  const { showToast } = useToast();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    name: user.name || '',
    storeName: user.storeName || '',
    phoneNumber: user.phoneNumber || '',
    address: user.address || '',
    avatarUrl: user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'Store')}&background=0ea5e9&color=fff&size=128`
  });
  
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFormData(prev => ({ ...prev, avatarUrl: event.target.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await authApi.updateProfile(user.uid, formData);
      dispatch(setUserProfile({ ...user, ...formData }));
      showToast('Settings saved successfully!', 'success');
    } catch (error) {
      showToast('Failed to save settings.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const initialsUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name || 'Store')}&background=0ea5e9&color=fff&size=128`;

  return (
    <div className="space-y-8 animate-fade-in relative z-10 text-slate-800 dark:text-slate-200">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white tracking-tight">Store Settings</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your store details and customize your character.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Profile Card & Avatar Customization */}
        <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl rounded-[2rem] shadow-sm border border-white/50 dark:border-slate-700/50 p-6 flex flex-col items-center">
          <div className="w-32 h-32 bg-slate-100 dark:bg-slate-800 rounded-full border-4 border-white dark:border-slate-700 shadow-lg relative overflow-hidden mb-6">
            <img src={formData.avatarUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
          </div>
          
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg mb-4 w-full text-left">Profile Image</h3>
          
          <div className="w-full">
            <p className="text-xs text-slate-500 mb-3">Upload a custom profile image for your store.</p>
            <div className="flex flex-col gap-4">
              <label className="cursor-pointer flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold rounded-xl border-2 border-dashed border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors">
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                Upload Image
              </label>
              <button type="button" onClick={() => setFormData(prev => ({ ...prev, avatarUrl: initialsUrl }))} className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                Reset to Initials
              </button>
            </div>
          </div>
        </div>

        {/* Store Details Form */}
        <div className="lg:col-span-2 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl rounded-[2rem] shadow-sm border border-white/50 dark:border-slate-700/50 p-6">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg mb-6">Store Details</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Owner Name</label>
              <input 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-emerald-500 outline-none text-sm font-bold text-slate-700 dark:text-slate-200"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Store Name</label>
              <input 
                type="text" 
                name="storeName" 
                value={formData.storeName} 
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-emerald-500 outline-none text-sm font-bold text-slate-700 dark:text-slate-200"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Phone Number</label>
              <input 
                type="tel" 
                name="phoneNumber" 
                value={formData.phoneNumber} 
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-emerald-500 outline-none text-sm font-bold text-slate-700 dark:text-slate-200"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Address</label>
              <input 
                type="text" 
                name="address" 
                value={formData.address} 
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-emerald-500 outline-none text-sm font-bold text-slate-700 dark:text-slate-200"
              />
            </div>
          </div>
          
          <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800/50">
            <button 
              type="submit" 
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm rounded-xl shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : <><Save size={16} /> Save Changes</>}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}
