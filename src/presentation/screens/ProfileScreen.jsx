import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../application/context/AuthContext";
import { User, Mail, MapPin, Loader2, Save } from "lucide-react";

export const ProfileScreen = React.memo(({ onNavigateBack }) => {
  const { user, savedAddress, updateProfile, isLoading } = useAuth();
  
  const [name, setName] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [address, setAddress] = useState(savedAddress || "");

  useEffect(() => {
    if (user) {
      setName(user.username || "");
      setEmail(user.email || "");
    }
  }, [user]);

  useEffect(() => {
    setAddress(savedAddress || "");
  }, [savedAddress]);

  const handleSave = useCallback(async (e) => {
    e.preventDefault();
    if (name.trim() === "" || address.trim() === "") {
      alert("Name and Address are required!");
      return;
    }

    const { success, error } = await updateProfile(name, address);
    if (success) {
      alert("Profile saved successfully!");
      if (onNavigateBack) onNavigateBack();
    } else {
      alert(`Save failed: ${error}`);
    }
  }, [name, address, updateProfile, onNavigateBack]);

  return (
    <div className="flex flex-col pb-28 select-none w-full max-w-2xl mx-auto min-h-screen bg-slate-50 dark:bg-[#111724] relative rounded-3xl overflow-hidden mt-2 shadow-sm dark:shadow-none border border-slate-100 dark:border-slate-800/80 transition-colors duration-300">
      {/* Gradient Header */}
      <div className="w-full h-56 bg-gradient-to-b from-cyan-600 to-teal-600 flex flex-col items-center justify-center text-white px-6">
        {/* Circular Avatar */}
        <div className="w-24 h-24 bg-white/20 border-4 border-white rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm relative">
          <User size={48} className="text-white" />
        </div>
        <h2 className="text-2xl font-black mt-3">{name || "User"}</h2>
        <p className="text-xs text-white/80 font-semibold mt-1">{email || "No Email"}</p>
      </div>

      {/* Form Card */}
      <div className="px-6 -mt-6 relative z-10 w-full pb-6">
        <form 
          onSubmit={handleSave}
          className="bg-white dark:bg-[#151C2C] border border-slate-100 dark:border-slate-800/80 rounded-3xl p-6 shadow-md dark:shadow-none space-y-5 text-left"
        >
          <h3 className="text-base font-black text-slate-800 dark:text-slate-200">Personal Information</h3>
          
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Full Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <User size={16} className="text-violet-600 dark:text-violet-400" />
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm bg-gray-50/50 dark:bg-slate-900/30 text-slate-800 dark:text-slate-100"
                required
              />
            </div>
          </div>

          {/* Email (Read-only as it maps from firebase auth account) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Mail size={16} className="text-violet-600 dark:text-violet-400" />
              </div>
              <input
                type="email"
                value={email}
                placeholder="email@example.com"
                disabled
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-slate-850 rounded-xl text-sm bg-gray-150 dark:bg-slate-900/60 text-gray-400 dark:text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Delivery Address */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Delivery Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 pt-3.5 flex items-start pointer-events-none">
                <MapPin size={16} className="text-violet-600 dark:text-violet-400" />
              </div>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your flat number, block, and locality..."
                rows={3}
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm bg-gray-50/50 dark:bg-slate-900/30 text-slate-800 dark:text-slate-100 resize-none"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-extrabold text-sm rounded-xl shadow-md flex items-center justify-center space-x-2 transition-all active:scale-98 cursor-pointer"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Save size={16} />
                  <span>Save Profile</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

ProfileScreen.displayName = "ProfileScreen";

