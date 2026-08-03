import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { useOrders } from "../hooks/useOrders";
import { User, Mail, MapPin, Loader2, Save, Award, ShoppingBag, CreditCard, Sparkles } from "lucide-react";

const AVATARS = [
  { emoji: "🍎", label: "Apple", bgColor: "bg-red-50 dark:bg-red-950/20" },
  { emoji: "🥑", label: "Avocado", bgColor: "bg-primary-50 dark:bg-primary-950/20" },
  { emoji: "🍪", label: "Cookie", bgColor: "bg-amber-50 dark:bg-amber-950/20" },
  { emoji: "🥛", label: "Milk", bgColor: "bg-blue-50 dark:bg-blue-950/20" },
  { emoji: "☕", label: "Coffee", bgColor: "bg-amber-100 dark:bg-amber-900/10" },
  { emoji: "🍉", label: "Watermelon", bgColor: "bg-rose-50 dark:bg-rose-950/20" },
  { emoji: "🧁", label: "Cupcake", bgColor: "bg-pink-50 dark:bg-pink-950/20" },
  { emoji: "🍕", label: "Pizza", bgColor: "bg-orange-50 dark:bg-orange-950/20" }
];

export const ProfileScreen = React.memo(({ onNavigateBack }) => {
  const { user, savedAddress, updateProfile, isLoading } = useAuth();
  const { orders } = useOrders();
  
  const [name, setName] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [address, setAddress] = useState(savedAddress || "");
  
  // Avatar selection state (persisted locally)
  const [selectedAvatar, setSelectedAvatar] = useState(() => {
    return localStorage.getItem("grocart_avatar") || "🍎";
  });
  
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

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
      localStorage.setItem("grocart_avatar", selectedAvatar);
      // Trigger local storage event to update other components
      window.dispatchEvent(new Event("storage"));
      alert("Profile saved successfully!");
      if (onNavigateBack) onNavigateBack();
    } else {
      alert(`Save failed: ${error}`);
    }
  }, [name, address, selectedAvatar, updateProfile, onNavigateBack]);

  // Shopping Stats computations
  const totalOrders = orders.length;
  const totalSpent = useMemo(() => {
    return orders.reduce((sum, o) => sum + o.totalPaid, 0);
  }, [orders]);

  const memberTier = useMemo(() => {
    if (totalOrders >= 5) return { name: "Gold Member", color: "text-amber-500", cardGradient: "from-primary-600 via-teal-700 to-amber-500" };
    if (totalOrders >= 2) return { name: "Silver Member", color: "text-slate-400", cardGradient: "from-slate-700 via-slate-800 to-primary-600" };
    return { name: "Club Member", color: "text-primary-500", cardGradient: "from-primary-700 via-teal-800 to-primary-600" };
  }, [totalOrders]);

  const memberId = useMemo(() => {
    if (!user?.id) return "GC-0000-0000";
    const cleanId = user.id.replace(/\D/g, "").substring(0, 8);
    const part1 = cleanId.substring(0, 4) || "4920";
    const part2 = cleanId.substring(4, 8) || "8831";
    return `GC-${part1}-${part2}`;
  }, [user]);

  return (
    <div className="flex flex-col pb-28 select-none w-full max-w-4xl mx-auto min-h-screen bg-transparent relative px-4 gap-6 text-left">
      
      {/* 2-Column Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mt-4">
        
        {/* Left Column: Avatar, Card & Stats */}
        <div className="lg:col-span-5 space-y-6 flex flex-col">
          
          {/* Visual Avatar Card */}
          <div className="bg-white dark:bg-[#111724] border border-slate-100 dark:border-slate-800/80 rounded-3xl p-6 text-center shadow-sm dark:shadow-none relative flex flex-col items-center overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent-500/5 rounded-full blur-2xl pointer-events-none" />

            {/* Circular Avatar Display with Edit overlay */}
            <div className="relative group">
              <div 
                onClick={() => setShowAvatarPicker(prev => !prev)}
                className="w-24 h-24 rounded-full bg-slate-50 dark:bg-slate-850 border-4 border-white dark:border-slate-800 shadow-md flex items-center justify-center text-5xl cursor-pointer hover:scale-105 active:scale-95 transition-all relative overflow-hidden"
              >
                <span>{selectedAvatar}</span>
                <div className="absolute inset-0 bg-black/45 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[10px] text-white font-black uppercase tracking-wider">Change</span>
                </div>
              </div>
            </div>

            <h3 className="text-xl font-black text-slate-850 dark:text-slate-100 mt-4 leading-tight">
              {name || "GroCart User"}
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-1 flex items-center justify-center space-x-1">
              <Mail size={12} className="text-primary-500" />
              <span>{email || "No Email"}</span>
            </p>

            {/* Expandable Avatar Grid Selector */}
            {showAvatarPicker && (
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/60 w-full animate-fade-in">
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-505 uppercase tracking-wider mb-3 text-left">Choose your Sticker</p>
                <div className="grid grid-cols-4 gap-2.5">
                  {AVATARS.map(av => (
                    <button
                      key={av.label}
                      type="button"
                      onClick={() => {
                        setSelectedAvatar(av.emoji);
                        setShowAvatarPicker(false);
                      }}
                      className={`h-11 rounded-2xl flex items-center justify-center text-2xl transition-all hover:scale-110 cursor-pointer ${av.bgColor} ${
                        selectedAvatar === av.emoji ? "ring-2 ring-primary-500 shadow-md" : "border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                      }`}
                    >
                      {av.emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Premium Glassmorphic Membership Card */}
          <div className={`w-full aspect-[1.62] bg-gradient-to-br ${memberTier.cardGradient} rounded-3xl p-6 text-white relative shadow-lg shadow-primary-500/10 border border-white/10 overflow-hidden flex flex-col justify-between select-none`}>
            {/* Glossy overlay effect */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_60%)] pointer-events-none" />
            <div className="absolute top-0 right-0 w-36 h-36 bg-white/5 rounded-full blur-2xl pointer-events-none" />

            {/* Top row: Brand & Chips */}
            <div className="flex justify-between items-start z-10">
              <div className="flex items-center space-x-1.5">
                <Sparkles size={16} className="text-amber-300 animate-pulse" />
                <span className="font-extrabold tracking-widest text-[11px] uppercase opacity-90">GroCart Club</span>
              </div>
              <span className="text-[9px] font-black tracking-widest bg-white/20 px-2 py-0.5 rounded uppercase backdrop-blur-sm border border-white/10">
                {memberTier.name}
              </span>
            </div>

            {/* Middle Section: Member ID */}
            <div className="my-3 z-10">
              <p className="text-[9px] uppercase tracking-wider text-white/60 font-semibold">Club Card Number</p>
              <h4 className="text-lg md:text-xl font-mono tracking-widest font-bold mt-1 text-white/95 font-bold">
                {memberId}
              </h4>
            </div>

            {/* Bottom Row: Name & Barcode */}
            <div className="flex justify-between items-end z-10">
              <div className="text-left max-w-[65%]">
                <p className="text-[9px] uppercase tracking-wider text-white/60 font-semibold">Club Member</p>
                <h5 className="text-sm font-black truncate mt-0.5 tracking-wide text-white">
                  {(name || "User").toUpperCase()}
                </h5>
              </div>

              {/* Mock Receipt/Card barcode lines */}
              <div className="flex flex-col items-end opacity-85">
                <div className="flex items-stretch h-6 bg-white/90 p-0.5 rounded border border-white/10">
                  {/* barcode lines using variable widths */}
                  <div className="w-[1px] bg-slate-900 mr-[1px]"></div>
                  <div className="w-[2px] bg-slate-900 mr-[1px]"></div>
                  <div className="w-[1px] bg-slate-900 mr-[2px]"></div>
                  <div className="w-[3px] bg-slate-900 mr-[1px]"></div>
                  <div className="w-[1px] bg-slate-900 mr-[1px]"></div>
                  <div className="w-[2px] bg-slate-900 mr-[2px]"></div>
                  <div className="w-[1px] bg-slate-900 mr-[1px]"></div>
                  <div className="w-[2px] bg-slate-900 mr-[1px]"></div>
                  <div className="w-[3px] bg-slate-900 mr-[1px]"></div>
                  <div className="w-[1px] bg-slate-900 mr-[1px]"></div>
                  <div className="w-[2px] bg-slate-900 mr-[2px]"></div>
                  <div className="w-[1px] bg-slate-900"></div>
                </div>
                <span className="text-[7px] font-mono tracking-widest mt-0.5 text-white/70">MEMBER GOLD</span>
              </div>
            </div>
          </div>

          {/* Wholesome Club Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white dark:bg-[#111724] border border-slate-100 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm dark:shadow-none flex items-center space-x-3 text-left">
              <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/20 flex items-center justify-center text-primary-500">
                <ShoppingBag size={20} />
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Total Orders</span>
                <span className="text-base font-black text-slate-800 dark:text-slate-200">{totalOrders} Orders</span>
              </div>
            </div>

            <div className="bg-white dark:bg-[#111724] border border-slate-100 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm dark:shadow-none flex items-center space-x-3 text-left">
              <div className="w-10 h-10 rounded-xl bg-accent-50 dark:bg-accent-950/20 flex items-center justify-center text-accent-500">
                <CreditCard size={20} />
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Total Spent</span>
                <span className="text-base font-black text-slate-800 dark:text-slate-200">₹{totalSpent}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Edit Account & Address Form */}
        <div className="lg:col-span-7">
          <form 
            onSubmit={handleSave}
            className="bg-white dark:bg-[#111724] border border-slate-100 dark:border-slate-800/80 rounded-3xl p-6 md:p-8 shadow-sm dark:shadow-none space-y-6 text-left relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary-500 to-primary-600" />
            
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/20 flex items-center justify-center text-primary-500">
                <User size={20} />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-800 dark:text-slate-200">Account Preferences</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-0.5">Manage your personal and delivery information</p>
              </div>
            </div>

            <hr className="border-slate-100 dark:border-slate-800/60" />

            {/* Inputs Grid */}
            <div className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1.5 text-left">
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-505 uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <User size={16} className="text-slate-400 dark:text-slate-600" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="block w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-[#0c101a] border border-slate-200/60 dark:border-slate-800/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm text-slate-800 dark:text-slate-100 font-bold transition-all shadow-inner placeholder-slate-400 dark:placeholder-slate-600"
                    required
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-1.5 text-left">
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-505 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail size={16} className="text-slate-400 dark:text-slate-655" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    placeholder="yourname@example.com"
                    disabled
                    className="block w-full pl-10 pr-4 py-3 bg-slate-100 dark:bg-[#131a29]/80 border border-slate-200/60 dark:border-slate-850 rounded-xl text-sm text-slate-400 dark:text-slate-500 font-bold cursor-not-allowed select-none"
                  />
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mt-1.5">Note: Email is locked to your auth credentials.</p>
              </div>

              {/* Delivery Address */}
              <div className="space-y-1.5 text-left">
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-505 uppercase tracking-wider">Delivery Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 pt-3.5 flex items-start pointer-events-none">
                    <MapPin size={16} className="text-slate-400 dark:text-slate-600" />
                  </div>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter flat number, wing, street address, and locality..."
                    rows={4}
                    className="block w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-[#0c101a] border border-slate-200/60 dark:border-slate-800/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm text-slate-800 dark:text-slate-100 font-bold transition-all shadow-inner placeholder-slate-400 dark:placeholder-slate-600 resize-none"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Action Row */}
            <div className="pt-4 flex items-center justify-between gap-4">
              {onNavigateBack && (
                <button
                  type="button"
                  onClick={onNavigateBack}
                  className="px-5 py-3 border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-355 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-xs font-black rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
              )}
              
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-3 bg-primary-500 hover:bg-primary-600 text-white font-black text-xs rounded-xl shadow-md transition-all active:scale-98 cursor-pointer flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Save size={14} />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

      </div>

      {/* Embedded slide animation */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
});

ProfileScreen.displayName = "ProfileScreen";
