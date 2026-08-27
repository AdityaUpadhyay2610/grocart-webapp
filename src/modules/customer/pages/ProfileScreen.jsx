import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from '@global/context/AuthContext';
import { useOrders } from "../hooks/useOrders";
import { formatINR } from "@global/utils/calculations";
import { 
  User, Mail, Phone, MapPin, CreditCard, Bell, Shield, LogOut, 
  Plus, Trash2, Check, Sparkles, Home, Briefcase, ChevronRight, Save, Loader2 
} from "lucide-react";
import { useOutletContext } from "react-router";

const AVATARS = [
  { emoji: "🍎", label: "Apple" },
  { emoji: "🥑", label: "Avocado" },
  { emoji: "🍪", label: "Cookie" },
  { emoji: "🥛", label: "Milk" },
  { emoji: "☕", label: "Coffee" },
  { emoji: "🍉", label: "Watermelon" },
  { emoji: "🧁", label: "Cupcake" },
  { emoji: "🍕", label: "Pizza" }
];

export const ProfileScreen = React.memo(({ onNavigateBack }) => {
  const { user, savedAddress, localAddress, updateProfile, logout, isLoading } = useAuth();
  const { orders = [] } = useOrders();
  const { requestLocation, locationText } = useOutletContext() || {};

  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "addresses" | "payments" | "notifications" | "security"
  
  // Profile form state
  const [name, setName] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState("+91 98765 43210");
  const [selectedAvatar, setSelectedAvatar] = useState(() => {
    return localStorage.getItem("grocart_avatar") || "🍎";
  });

  // Saved Addresses State
  const [savedAddresses, setSavedAddresses] = useState(() => {
    try {
      const stored = localStorage.getItem("grocart_saved_locations");
      return stored ? JSON.parse(stored) : [
        { id: "1", label: "Home", isDefault: true, address: "742 Evergreen Terrace, DLF Phase 5", city: "Gurugram", state: "Haryana", pincode: "122002" },
        { id: "2", label: "Work", isDefault: false, address: "Cyber City, Building 10, Tower B, 4th Floor", city: "Gurugram", state: "Haryana", pincode: "122002" }
      ];
    } catch {
      return [];
    }
  });

  // New Address Form State
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newTag, setNewTag] = useState("Home");
  const [newStreet, setNewStreet] = useState("");
  const [newCity, setNewCity] = useState("New Delhi");
  const [newState, setNewState] = useState("Delhi");
  const [newPincode, setNewPincode] = useState("110001");
  const [pinError, setPinError] = useState("");

  // Notification toggles
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    flashDeals: true,
    weeklyRecipes: false,
    whatsappAlerts: true
  });

  // Save changes toast
  const [savedToast, setSavedToast] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.username || "");
      setEmail(user.email || "");
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem("grocart_saved_locations", JSON.stringify(savedAddresses));
  }, [savedAddresses]);

  const handleAvatarSelect = (emoji) => {
    setSelectedAvatar(emoji);
    localStorage.setItem("grocart_avatar", emoji);
    window.dispatchEvent(new Event("storage"));
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Name is required!");
      return;
    }
    const defaultAddr = savedAddresses.find(a => a.isDefault)?.address || savedAddress || "";
    await updateProfile(name, defaultAddr, locationText || "");
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  const handleAddAddress = (e) => {
    e.preventDefault();
    if (!newStreet.trim() || !newPincode.trim()) {
      alert("Street address and PIN code are required!");
      return;
    }

    // Indian 6-digit PIN validation
    if (!/^\d{6}$/.test(newPincode.trim())) {
      setPinError("Please enter a valid 6-digit Indian PIN code (e.g. 110001).");
      return;
    }
    setPinError("");

    const newEntry = {
      id: Date.now().toString(),
      label: newTag,
      isDefault: savedAddresses.length === 0,
      address: newStreet.trim(),
      city: newCity.trim(),
      state: newState.trim(),
      pincode: newPincode.trim()
    };

    setSavedAddresses(prev => [...prev, newEntry]);
    setNewStreet("");
    setNewPincode("110001");
    setShowAddressForm(false);
  };

  const handleDeleteAddress = (id) => {
    setSavedAddresses(prev => prev.filter(a => a.id !== id));
  };

  const handleSetDefaultAddress = (id) => {
    setSavedAddresses(prev => prev.map(a => ({
      ...a,
      isDefault: a.id === id
    })));
  };

  const totalOrders = orders.length;
  const totalSpent = useMemo(() => {
    return orders.reduce((sum, o) => sum + (o.totalPaid || 0), 0);
  }, [orders]);

  return (
    <div className="flex flex-col w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pb-32 select-none min-h-screen text-left animate-fade-in gap-8">
      
      {/* ── 1. PROFILE HEADER GREETING ── */}
      <div className="bg-surface-container-lowest rounded-3xl p-6 sm:p-8 border border-surface-variant/40 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-4xl shadow-inner border-2 border-primary/20">
            <span>{selectedAvatar}</span>
          </div>
          <div>
            <h1 className="font-display-lg text-on-surface text-2xl sm:text-3xl font-black">
              {name || "Customer Profile"}
            </h1>
            <p className="font-body-md text-xs text-on-surface-variant mt-0.5 flex items-center gap-2">
              <span>{email || "customer@grocart.com"}</span>
              <span>•</span>
              <span className="text-primary font-bold">Gold Eco-Shopper (12.4 kg CO₂e saved)</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-surface-container-low rounded-2xl border border-surface-variant/30 text-center">
            <span className="text-[10px] text-slate-text font-bold uppercase block">Orders</span>
            <span className="font-headline-md text-base font-black text-on-surface">{totalOrders}</span>
          </div>
          <div className="px-4 py-2 bg-surface-container-low rounded-2xl border border-surface-variant/30 text-center">
            <span className="text-[10px] text-slate-text font-bold uppercase block">Total Spent</span>
            <span className="font-headline-md text-base font-black text-primary">{formatINR(totalSpent, false)}</span>
          </div>
        </div>
      </div>

      {/* ── 2. 12-COLUMN PROFILE DASHBOARD ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ── Left: Sidebar Navigation Tabs (4 cols) ── */}
        <div className="col-span-1 lg:col-span-4 bg-surface-container-lowest rounded-3xl p-4 border border-surface-variant/40 shadow-sm flex flex-col gap-1.5">
          
          <button
            onClick={() => setActiveTab("overview")}
            className={`w-full p-3.5 rounded-2xl font-label-md text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
              activeTab === "overview" 
                ? "bg-primary text-on-primary shadow-md" 
                : "text-on-surface hover:bg-surface-container-low"
            }`}
          >
            <div className="flex items-center gap-3">
              <User size={18} />
              <span>Profile Overview</span>
            </div>
            <ChevronRight size={16} />
          </button>

          <button
            onClick={() => setActiveTab("addresses")}
            className={`w-full p-3.5 rounded-2xl font-label-md text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
              activeTab === "addresses" 
                ? "bg-primary text-on-primary shadow-md" 
                : "text-on-surface hover:bg-surface-container-low"
            }`}
          >
            <div className="flex items-center gap-3">
              <MapPin size={18} />
              <span>Saved Addresses</span>
            </div>
            <ChevronRight size={16} />
          </button>

          <button
            onClick={() => setActiveTab("payments")}
            className={`w-full p-3.5 rounded-2xl font-label-md text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
              activeTab === "payments" 
                ? "bg-primary text-on-primary shadow-md" 
                : "text-on-surface hover:bg-surface-container-low"
            }`}
          >
            <div className="flex items-center gap-3">
              <CreditCard size={18} />
              <span>Payment Methods</span>
            </div>
            <ChevronRight size={16} />
          </button>

          <button
            onClick={() => setActiveTab("notifications")}
            className={`w-full p-3.5 rounded-2xl font-label-md text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
              activeTab === "notifications" 
                ? "bg-primary text-on-primary shadow-md" 
                : "text-on-surface hover:bg-surface-container-low"
            }`}
          >
            <div className="flex items-center gap-3">
              <Bell size={18} />
              <span>Notification Settings</span>
            </div>
            <ChevronRight size={16} />
          </button>

          <button
            onClick={() => setActiveTab("security")}
            className={`w-full p-3.5 rounded-2xl font-label-md text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
              activeTab === "security" 
                ? "bg-primary text-on-primary shadow-md" 
                : "text-on-surface hover:bg-surface-container-low"
            }`}
          >
            <div className="flex items-center gap-3">
              <Shield size={18} />
              <span>Security & Privacy</span>
            </div>
            <ChevronRight size={16} />
          </button>

          <div className="border-t border-surface-variant/30 my-2 pt-2">
            <button
              onClick={() => {
                if (window.confirm("Are you sure you want to logout?")) logout();
              }}
              className="w-full p-3.5 rounded-2xl font-label-md text-xs font-bold text-error hover:bg-error-container/20 transition-all flex items-center gap-3 cursor-pointer"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* ── Right: Active Tab Pane (8 cols) ── */}
        <div className="col-span-1 lg:col-span-8 flex flex-col gap-6">
          
          {/* TAB 1: PROFILE OVERVIEW */}
          {activeTab === "overview" && (
            <div className="bg-surface-container-lowest rounded-3xl p-6 sm:p-8 border border-surface-variant/40 shadow-sm flex flex-col gap-6">
              <h3 className="font-headline-md text-lg font-black text-on-surface border-b border-surface-variant/30 pb-4">
                Personal Information
              </h3>

              {/* Avatar Selector Grid */}
              <div className="flex flex-col gap-3">
                <label className="font-label-sm text-xs font-bold text-on-surface">Choose Your Sticker Avatar</label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                  {AVATARS.map(av => (
                    <button
                      key={av.emoji}
                      type="button"
                      onClick={() => handleAvatarSelect(av.emoji)}
                      className={`h-12 rounded-2xl flex items-center justify-center text-2xl transition-all hover:scale-110 cursor-pointer bg-surface-container-low ${
                        selectedAvatar === av.emoji 
                          ? "ring-2 ring-primary bg-primary/10 shadow-sm" 
                          : "border border-surface-variant/30"
                      }`}
                    >
                      {av.emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Form inputs */}
              <form onSubmit={handleProfileSave} className="flex flex-col gap-4 mt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-label-sm text-xs font-bold text-on-surface">Full Name</label>
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-surface-container-low border border-surface-variant/40 rounded-xl px-4 py-2.5 text-xs font-bold text-on-surface focus:ring-1 focus:ring-primary focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-label-sm text-xs font-bold text-on-surface">Phone Number</label>
                    <input 
                      type="text" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="bg-surface-container-low border border-surface-variant/40 rounded-xl px-4 py-2.5 text-xs font-bold text-on-surface focus:ring-1 focus:ring-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-label-sm text-xs font-bold text-on-surface">Email Address</label>
                  <input 
                    type="email" 
                    value={email}
                    disabled
                    className="bg-surface-container-low/50 border border-surface-variant/30 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-text cursor-not-allowed"
                  />
                  <span className="text-[10px] text-slate-text">Email address is tied to your Google authentication account.</span>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="mt-4 px-6 py-3 bg-primary text-on-primary font-label-md text-xs font-bold rounded-xl hover:bg-primary-container shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer w-max"
                >
                  <Save size={16} />
                  <span>Save Changes</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: SAVED ADDRESSES */}
          {activeTab === "addresses" && (
            <div className="bg-surface-container-lowest rounded-3xl p-6 sm:p-8 border border-surface-variant/40 shadow-sm flex flex-col gap-6">
              <div className="flex justify-between items-center border-b border-surface-variant/30 pb-4">
                <div>
                  <h3 className="font-headline-md text-lg font-black text-on-surface">Saved Delivery Addresses</h3>
                  <p className="font-body-md text-xs text-on-surface-variant">Manage addresses for quick-commerce delivery</p>
                </div>
                <button
                  onClick={() => setShowAddressForm(prev => !prev)}
                  className="px-4 py-2 bg-primary text-on-primary rounded-xl font-label-md text-xs font-bold flex items-center gap-1.5 hover:bg-primary-container transition-all cursor-pointer shadow-xs"
                >
                  <Plus size={16} />
                  <span>Add New</span>
                </button>
              </div>

              {/* Add Address Form Modal/Pane */}
              {showAddressForm && (
                <form onSubmit={handleAddAddress} className="p-5 rounded-2xl bg-surface-container-low border border-surface-variant/40 flex flex-col gap-4 animate-fade-in">
                  <h4 className="font-label-md text-xs font-bold uppercase tracking-wider text-on-surface">Add New Address</h4>
                  
                  {/* Tag Selector */}
                  <div className="flex gap-2">
                    {["Home", "Work", "Other"].map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setNewTag(t)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          newTag === t ? 'bg-primary text-on-primary' : 'bg-surface-container-lowest text-on-surface border border-surface-variant/40'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-label-sm text-xs font-bold text-on-surface">Street Address & Landmark</label>
                    <input 
                      type="text"
                      value={newStreet}
                      onChange={(e) => setNewStreet(e.target.value)}
                      placeholder="Flat 302, Wing B, Galaxy Heights, Sector 45"
                      className="bg-surface-container-lowest border border-surface-variant/40 rounded-xl px-4 py-2.5 text-xs font-bold text-on-surface"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="font-label-sm text-xs font-bold text-on-surface">City</label>
                      <input 
                        type="text"
                        value={newCity}
                        onChange={(e) => setNewCity(e.target.value)}
                        className="bg-surface-container-lowest border border-surface-variant/40 rounded-xl px-4 py-2.5 text-xs font-bold text-on-surface"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="font-label-sm text-xs font-bold text-on-surface">State</label>
                      <input 
                        type="text"
                        value={newState}
                        onChange={(e) => setNewState(e.target.value)}
                        className="bg-surface-container-lowest border border-surface-variant/40 rounded-xl px-4 py-2.5 text-xs font-bold text-on-surface"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="font-label-sm text-xs font-bold text-on-surface">6-Digit Indian PIN</label>
                      <input 
                        type="text"
                        value={newPincode}
                        onChange={(e) => setNewPincode(e.target.value)}
                        placeholder="110001"
                        maxLength={6}
                        className="bg-surface-container-lowest border border-surface-variant/40 rounded-xl px-4 py-2.5 text-xs font-bold text-on-surface"
                        required
                      />
                    </div>
                  </div>

                  {pinError && <span className="text-xs text-error font-bold">{pinError}</span>}

                  <div className="flex justify-end gap-3 mt-2">
                    <button 
                      type="button" 
                      onClick={() => setShowAddressForm(false)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-on-surface hover:bg-surface-container cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="px-5 py-2 bg-primary text-on-primary rounded-xl text-xs font-bold hover:bg-primary-container cursor-pointer"
                    >
                      Save Address
                    </button>
                  </div>
                </form>
              )}

              {/* Saved Addresses List */}
              <div className="flex flex-col gap-3">
                {savedAddresses.map(addr => (
                  <div 
                    key={addr.id}
                    className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                      addr.isDefault 
                        ? 'bg-primary-50/20 border-primary/40' 
                        : 'bg-surface-container-low/40 border-surface-variant/30 hover:border-primary/30'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-surface-container-lowest border border-surface-variant/30 flex items-center justify-center text-primary mt-0.5">
                        {addr.label === "Home" ? <Home size={18} /> : addr.label === "Work" ? <Briefcase size={18} /> : <MapPin size={18} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-headline-md text-sm font-bold text-on-surface">{addr.label}</span>
                          {addr.isDefault && (
                            <span className="px-2 py-0.5 bg-primary text-on-primary rounded-md text-[9px] font-black uppercase">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="font-body-md text-xs text-on-surface-variant mt-1 leading-relaxed">
                          {addr.address}, {addr.city}, {addr.state} - {addr.pincode}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!addr.isDefault && (
                        <button
                          onClick={() => handleSetDefaultAddress(addr.id)}
                          className="px-3 py-1.5 rounded-lg border border-primary/30 text-primary hover:bg-primary hover:text-white text-xs font-bold transition-colors cursor-pointer"
                        >
                          Set Default
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="p-1.5 rounded-lg text-slate-text hover:text-error hover:bg-error-container/20 transition-colors cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: PAYMENT METHODS */}
          {activeTab === "payments" && (
            <div className="bg-surface-container-lowest rounded-3xl p-6 sm:p-8 border border-surface-variant/40 shadow-sm flex flex-col gap-6">
              <h3 className="font-headline-md text-lg font-black text-on-surface border-b border-surface-variant/30 pb-4">
                Saved Payment Methods
              </h3>

              <div className="flex flex-col gap-3">
                <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-variant/40 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-sm">
                      UPI
                    </div>
                    <div>
                      <p className="font-headline-md text-xs font-bold text-on-surface">Google Pay (UPI)</p>
                      <p className="text-[11px] text-slate-text">aditya@okhdfcbank</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 bg-primary text-on-primary rounded-md text-[9px] font-black uppercase">Active</span>
                </div>

                <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-variant/40 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-surface-container-lowest border border-surface-variant/30 flex items-center justify-center text-on-surface font-black text-xs">
                      VISA
                    </div>
                    <div>
                      <p className="font-headline-md text-xs font-bold text-on-surface">HDFC Bank Debit Card</p>
                      <p className="text-[11px] text-slate-text">Ending in •••• 4242 (Exp 08/28)</p>
                    </div>
                  </div>
                  <button className="text-xs text-slate-text hover:text-error cursor-pointer">Remove</button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: NOTIFICATIONS */}
          {activeTab === "notifications" && (
            <div className="bg-surface-container-lowest rounded-3xl p-6 sm:p-8 border border-surface-variant/40 shadow-sm flex flex-col gap-6">
              <h3 className="font-headline-md text-lg font-black text-on-surface border-b border-surface-variant/30 pb-4">
                Notification Preferences
              </h3>

              <div className="flex flex-col gap-4">
                <label className="flex items-center justify-between cursor-pointer p-3 rounded-xl bg-surface-container-low/40">
                  <div>
                    <p className="font-headline-md text-xs font-bold text-on-surface">Live Order Status Tracking (SMS & WhatsApp)</p>
                    <p className="text-[11px] text-slate-text">Receive real-time rider updates when out for delivery</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={notifications.orderUpdates}
                    onChange={() => setNotifications(prev => ({ ...prev, orderUpdates: !prev.orderUpdates }))}
                    className="w-5 h-5 accent-primary cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer p-3 rounded-xl bg-surface-container-low/40">
                  <div>
                    <p className="font-headline-md text-xs font-bold text-on-surface">Flash Deal & Seasonal Harvest Alerts</p>
                    <p className="text-[11px] text-slate-text">Get notified when organic produce arrives at promotional rates</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={notifications.flashDeals}
                    onChange={() => setNotifications(prev => ({ ...prev, flashDeals: !prev.flashDeals }))}
                    className="w-5 h-5 accent-primary cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer p-3 rounded-xl bg-surface-container-low/40">
                  <div>
                    <p className="font-headline-md text-xs font-bold text-on-surface">Weekly Organic Recipe & Nutrition Digest</p>
                    <p className="text-[11px] text-slate-text">Curated farm recipes with 1-click add ingredients</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={notifications.weeklyRecipes}
                    onChange={() => setNotifications(prev => ({ ...prev, weeklyRecipes: !prev.weeklyRecipes }))}
                    className="w-5 h-5 accent-primary cursor-pointer"
                  />
                </label>
              </div>
            </div>
          )}

          {/* TAB 5: SECURITY & SETTINGS */}
          {activeTab === "security" && (
            <div className="bg-surface-container-lowest rounded-3xl p-6 sm:p-8 border border-surface-variant/40 shadow-sm flex flex-col gap-6">
              <h3 className="font-headline-md text-lg font-black text-on-surface border-b border-surface-variant/30 pb-4">
                Security & Privacy
              </h3>

              <div className="flex flex-col gap-4 text-xs text-on-surface">
                <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-variant/30 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-on-surface">Two-Factor Authentication (2FA)</p>
                    <p className="text-[11px] text-slate-text">Secured via your linked Google / Firebase account</p>
                  </div>
                  <span className="px-2.5 py-0.5 bg-primary/20 text-primary font-black rounded text-[10px]">ENABLED</span>
                </div>

                <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-variant/30 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-on-surface">Data Retention & Privacy</p>
                    <p className="text-[11px] text-slate-text">Your location and address are strictly used for quick-delivery routing</p>
                  </div>
                  <span className="text-primary font-bold">Encrypted</span>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Toast */}
      {savedToast && (
        <div className="fixed bottom-6 right-6 z-[100] bg-primary text-on-primary px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 font-bold text-xs animate-slide-up">
          <Check size={18} />
          <span>Profile changes saved!</span>
        </div>
      )}
    </div>
  );
});

ProfileScreen.displayName = "ProfileScreen";

