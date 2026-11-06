import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@global/context/AuthContext";
import { useOrders } from "./useOrders";
import { DEFAULT_ADDRESSES } from "../constants/profileConstants";

export function useProfileScreen(locationText = "") {
  const { user, savedAddress, updateProfile, logout, isLoading } = useAuth();
  const { orders = [] } = useOrders();

  const [activeTab, setActiveTab] = useState("overview");

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
      return stored ? JSON.parse(stored) : DEFAULT_ADDRESSES;
    } catch {
      return DEFAULT_ADDRESSES;
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

  const [notifications] = useState({
    orderUpdates: true,
    flashDeals: true,
    weeklyRecipes: false,
    whatsappAlerts: true
  });

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
    const defaultAddr = savedAddresses.find((a) => a.isDefault)?.address || savedAddress || "";
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

    setSavedAddresses((prev) => [...prev, newEntry]);
    setNewStreet("");
    setNewPincode("110001");
    setShowAddressForm(false);
  };

  const handleDeleteAddress = (id) => {
    setSavedAddresses((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSetDefaultAddress = (id) => {
    setSavedAddresses((prev) =>
      prev.map((a) => ({
        ...a,
        isDefault: a.id === id
      }))
    );
  };

  const totalOrders = orders.length;
  const totalSpent = useMemo(() => {
    return orders.reduce((sum, o) => sum + (o.totalPaid || 0), 0);
  }, [orders]);

  return {
    user,
    isLoading,
    logout,
    activeTab,
    setActiveTab,
    name,
    setName,
    email,
    setEmail,
    phone,
    setPhone,
    selectedAvatar,
    handleAvatarSelect,
    savedAddresses,
    showAddressForm,
    setShowAddressForm,
    newTag,
    setNewTag,
    newStreet,
    setNewStreet,
    newCity,
    setNewCity,
    newState,
    setNewState,
    newPincode,
    setNewPincode,
    pinError,
    notifications,
    savedToast,
    handleProfileSave,
    handleAddAddress,
    handleDeleteAddress,
    handleSetDefaultAddress,
    totalOrders,
    totalSpent
  };
}

