import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Settings, ShoppingBag, Bell, Shield, CreditCard, LogIn, UserPlus, LogOut, Mail, Lock, Camera, Heart, Star, MapPin, Package, ChevronRight, Wallet, Box, Plus, Trash2, Phone, CheckCircle, FileText, Upload, Gift, Clock, Smartphone } from "lucide-react";
import { useAuth, useOrders } from "../App";

import Navigation from "./Navigation";
import Footer from "./Footer";

const Profile = () => {
  const navigate = useNavigate();
  const { user, login, logout, register, updateUser, loading, setUser } = useAuth();
  const { orders } = useOrders();
  const [activeView, setActiveView] = useState("overview");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  // State Management
  const [addresses, setAddresses] = useState([]);
  const [savedCards, setSavedCards] = useState([]);
  const [savedUPIs, setSavedUPIs] = useState([]);
  const [activeGiftCards, setActiveGiftCards] = useState([]);

  const profileLoaded = useRef(false);

  // Load all user data from backend specific to the logged-in user
  useEffect(() => {
    const fetchUserData = async () => {
      if (user?.id) {
        try {
          const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
          const token = localStorage.getItem('token');
          const response = await axios.get(`${API_BASE}/api/users/sync`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (response.data) {
            let fetchedAddresses = response.data.addresses || [];

            // If no addresses saved, but user has a profile address, create initial entry
            if (fetchedAddresses.length === 0 && (response.data.address || user.address)) {
              const initialAddress = {
                id: Date.now(),
                name: response.data.name || user.name,
                phone: response.data.phone || user.phone || "",
                addr: response.data.address || user.address,
                type: "HOME"
              };
              fetchedAddresses = [initialAddress];
            }

            setAddresses(fetchedAddresses);
            if (response.data.saved_cards) setSavedCards(response.data.saved_cards);
            if (response.data.saved_upis) setSavedUPIs(response.data.saved_upis);
            if (response.data.active_gift_cards) setActiveGiftCards(response.data.active_gift_cards);
            profileLoaded.current = true;
            return;
          }
        } catch (e) {
          console.error("Failed to fetch profile data from backend", e);
        }

        // Fallback to localStorage
        const userId = user.id;
        const savedAddr = localStorage.getItem(`user_addresses_${userId}`);
        const savedCardsLocal = localStorage.getItem(`user_cards_${userId}`);
        const savedUPIsLocal = localStorage.getItem(`user_upis_${userId}`);
        const savedGiftLocal = localStorage.getItem(`user_giftcards_${userId}`);

        if (savedAddr) {
          setAddresses(JSON.parse(savedAddr));
        } else {
          // Default initial address from profile
          setAddresses([{
            id: 1,
            type: "HOME",
            name: user.name,
            addr: user.address || "404 Sky Heights, Sector 72, Bangalore, KA 560102",
            phone: user.phone || "+91 98765 43210"
          }]);
        }

        if (savedCardsLocal) setSavedCards(JSON.parse(savedCardsLocal));
        else setSavedCards([
          { id: '1', brand: "QUANTUM", last4: "8892", exp: "12/26", type: "Credit" },
          { id: '2', brand: "NEBULA", last4: "4421", exp: "05/29", type: "Debit" }
        ]);

        if (savedUPIsLocal) setSavedUPIs(JSON.parse(savedUPIsLocal));
        else setSavedUPIs([
          { id: 'akash@oksbi', bank: 'State Bank of India', verified: true },
          { id: 'akash@paytm', bank: 'Paytm Payments Bank', verified: true }
        ]);

        if (savedGiftLocal) setActiveGiftCards(JSON.parse(savedGiftLocal));
        else setActiveGiftCards([]);

        profileLoaded.current = true;
      }
    };

    fetchUserData();
  }, [user?.id, user?.name, user?.phone]);

  // Save sync with debounce
  useEffect(() => {
    const syncData = async () => {
      if (user?.id && profileLoaded.current) {
        // Local persistence
        localStorage.setItem(`user_addresses_${user.id}`, JSON.stringify(addresses));
        localStorage.setItem(`user_cards_${user.id}`, JSON.stringify(savedCards));
        localStorage.setItem(`user_upis_${user.id}`, JSON.stringify(savedUPIs));
        localStorage.setItem(`user_giftcards_${user.id}`, JSON.stringify(activeGiftCards));

        // Backend persistence
        try {
          await updateUser(user.id, {
            addresses,
            saved_cards: savedCards,
            saved_upis: savedUPIs,
            active_gift_cards: activeGiftCards
          });
        } catch (e) {
          console.error("Failed to sync profile data to backend", e);
        }
      }
    };

    const timeoutId = setTimeout(syncData, 1000);
    return () => clearTimeout(timeoutId);
  }, [addresses, savedCards, savedUPIs, activeGiftCards, user?.id, updateUser]);

  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressFormData, setAddressFormData] = useState({ name: "", phone: "", addr: "", type: "HOME" });

  const handleEditAddress = (addr) => {
    setAddressFormData(addr);
    setEditingAddressId(addr.id);
    setIsAddressFormOpen(true);
  };

  const handleDeleteAddress = (id) => {
    setAddresses(addresses.filter(a => a.id !== id));
  };

  const handleSaveAddress = () => {
    if (!addressFormData.name || !addressFormData.phone || !addressFormData.addr) {
      alert("Please fill in all required fields");
      return;
    }

    let newAddresses;
    if (editingAddressId) {
      newAddresses = addresses.map(a => a.id === editingAddressId ? { ...addressFormData, id: editingAddressId } : a);
    } else {
      newAddresses = [...addresses, { ...addressFormData, id: Date.now() }];
    }
    setAddresses(newAddresses);

    // Automatically set the latest saved address as the active location in Navigation
    // Use user-specific location key as well
    const locationString = addressFormData.addr.substring(0, 30) + (addressFormData.addr.length > 30 ? "..." : "");
    if (user?.id) {
      localStorage.setItem(`user_location_${user.id}`, locationString);
    }
    window.dispatchEvent(new Event('location_updated'));

    setIsAddressFormOpen(false);
    setAddressFormData({ name: "", phone: "", addr: "", type: "HOME" });
    setEditingAddressId(null);
  };

  const handleAddNewAddress = () => {
    setAddressFormData({ name: user?.name || profileEdit?.name || "", phone: "", addr: "", type: "HOME" });
    setEditingAddressId(null);
    setIsAddressFormOpen(true);
  };

  // Payment & Wallet State
  const [isAddCardOpen, setIsAddCardOpen] = useState(false);
  const [newCard, setNewCard] = useState({ brand: "", number: "", exp: "", type: "Credit" });

  const handleAddCard = () => {
    if (!newCard.number || !newCard.exp || !newCard.brand) {
      alert("Please fill in all card details");
      return;
    }
    setSavedCards([...savedCards, {
      id: Date.now(),
      brand: newCard.brand.toUpperCase(),
      last4: newCard.number.slice(-4),
      exp: newCard.exp,
      type: newCard.type
    }]);
    setIsAddCardOpen(false);
    setNewCard({ brand: "", number: "", exp: "", type: "Credit" });
  };

  const handleDeleteCard = (id) => {
    setSavedCards(savedCards.filter(c => c.id !== id));
  };




  const [isAddUPIOpen, setIsAddUPIOpen] = useState(false);
  const [newUPI, setNewUPI] = useState("");

  const handleAddUPI = () => {
    if (!newUPI.includes('@')) {
      alert("Please enter a valid VPA (e.g., name@bank)");
      return;
    }
    setSavedUPIs([...savedUPIs, {
      id: newUPI,
      bank: 'Hook Bank',
      verified: true // Simulating verification
    }]);
    setIsAddUPIOpen(false);
    setNewUPI("");
  };

  const handleDeleteUPI = (id) => {
    setSavedUPIs(savedUPIs.filter(u => u.id !== id));
  };


  // Form states
  const [giftCardData, setGiftCardData] = useState({ voucher: "", pin: "" });


  const handleAddGiftCard = () => {
    if (giftCardData.voucher.length !== 16) {
      alert("Invalid Voucher Number: Must be 16 characters.");
      return;
    }
    if (giftCardData.pin.length !== 6) {
      alert("Invalid PIN: Must be 6 digits.");
      return;
    }
    const newCard = {
      id: Date.now(),
      code: `XXXX-XXXX-XXXX-${giftCardData.voucher.slice(-4)}`,
      balance: 500,
      expiry: "12/12/2026"
    };
    setActiveGiftCards([...activeGiftCards, newCard]);
    alert("Gift Card Valued ₹500.00 Added Successfully!");
    setGiftCardData({ voucher: "", pin: "" });
  };

  const handleRemoveGiftCard = (id) => {
    setActiveGiftCards(activeGiftCards.filter(c => c.id !== id));
  };

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [profileEdit, setProfileEdit] = useState({
    name: user?.name || "",
    avatar: user?.avatar || "",
    email: user?.email || "",
    gender: user?.gender || "",
    dob: user?.dob || "",
    address: user?.address || "",
    phone: user?.phone || "",
  });

  useEffect(() => {
    if (user) {
      const savedProfile = localStorage.getItem('user_profile');
      const profileData = savedProfile ? JSON.parse(savedProfile) : {};

      // Get signup data for pre-filling
      const signupData = JSON.parse(localStorage.getItem('signup_data') || '{}');

      // Only update avatar if we don't have a pending local upload
      const avatarToUse = profileEdit.avatar?.startsWith('data:')
        ? profileEdit.avatar
        : user.avatar;

      setProfileEdit({
        name: profileData.name || user.name,
        avatar: avatarToUse,
        email: profileData.email || user.email,
        phone: profileData.phone || user.phone || "",
        gender: profileData.gender || user.gender || signupData.gender || "",
        dob: profileData.dob || user.dob || signupData.dob || "",
        address: profileData.address || user.address || signupData.address || "",
      });
    }
  }, [user, profileEdit.avatar]);
  const handleUpdateProfile = async () => {
    setIsLoading(true);
    try {
      await updateUser(user?.id, {
        name: profileEdit.name,
        email: profileEdit.email,
        phone: profileEdit.phone,
        gender: profileEdit.gender,
        dob: profileEdit.dob,
        address: profileEdit.address,
        avatar: profileEdit.avatar // Include avatar if it was updated
      });
      const profileData = {
        name: profileEdit.name,
        email: profileEdit.email,
        phone: profileEdit.phone,
        gender: profileEdit.gender,
        dob: profileEdit.dob,
        address: profileEdit.address,
        avatar: profileEdit.avatar,
      };
      localStorage.setItem('user_profile', JSON.stringify(profileData));
      setUser(prev => ({ ...prev, ...profileData }));
      alert("Profile updated!");
    } catch (err) {
      alert("Error updating profile.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result;
        setProfileEdit(prev => ({ ...prev, avatar: base64String }));
        try {
          await updateUser(user?.id, { avatar: base64String });
          alert("Profile picture updated!");
        } catch (err) {
          alert("Updated locally, but failed to sync.");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const logoutAndRedirect = () => {
    logout();
    navigate("/auth");
  };

  const SidebarGroup = ({ title, icon: Icon, children }) => (
    <div className="border-b border-gray-100 last:border-0">
      <div className="px-6 py-4 flex items-center gap-4 text-gray-500">
        <Icon className="w-5 h-5 text-violet-600" />
        <span className="font-black text-[10px] uppercase tracking-widest">{title}</span>
      </div>
      <div className="pb-2">{children}</div>
    </div>
  );

  const SidebarLink = ({ id, label, active, onClick }) => (
    <button
      onClick={onClick}
      className={`w-full text-left px-16 py-3 text-[13px] transition-all ${active
        ? 'bg-violet-50 text-violet-600 font-bold'
        : 'text-gray-600 hover:bg-gray-50 hover:text-violet-600'
        }`}
    >
      {label}
    </button>
  );

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!user) {
    return <Navigate to="/auth" />;
  }

  if (user?.user_type === "vendor") {
    return <Navigate to="/vendor" />;
  }

  return (
    <div className="min-h-screen bg-[#f1f3f6] flex flex-col pt-20">
      <Navigation />
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />

      <div className="container mx-auto px-4 lg:px-8 py-8 flex-1">
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* Sidebar (Flipkart Style) */}
          <aside className="w-full lg:w-80 space-y-4 shrink-0">
            {/* User Header Card */}
            <Card className="border-0 shadow-sm rounded-none bg-white p-4 flex items-center gap-4">
              <div
                className="relative group cursor-pointer"
                onClick={() => fileInputRef.current.click()}
              >
                <Avatar className="w-14 h-14 ring-2 ring-violet-50 group-hover:ring-violet-200 transition-all">
                  <AvatarImage src={profileEdit.avatar || user?.avatar} />
                  <AvatarFallback className="bg-violet-100 text-violet-600 font-black italic">
                    {user?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                  <Camera className="w-5 h-5 text-white" />
                </div>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">Hello,</p>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-gray-900 text-lg tracking-tight italic">{profileEdit.name || user?.name || 'User'}</h3>
                  <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 border-emerald-100 text-[8px] font-bold">VERIFIED</Badge>
                </div>
              </div>
            </Card>

            {/* Menu Sections */}
            <Card className="border-0 shadow-sm rounded-none bg-white overflow-hidden">
              {/* MY ORDERS */}
              <button
                onClick={() => setActiveView("orders")}
                className={`w-full flex items-center justify-between px-6 py-5 border-b border-gray-100 transition-all ${activeView === 'orders' ? 'bg-violet-50 text-violet-600' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                <div className="flex items-center gap-4">
                  <Package className="w-5 h-5 text-violet-600" />
                  <span className="font-black text-[10px] uppercase tracking-widest">My Orders</span>
                </div>
                <ChevronRight className={`w-4 h-4 ${activeView === 'orders' ? 'text-violet-600' : 'text-gray-300'}`} />
              </button>

              {/* ACCOUNT SETTINGS */}
              <SidebarGroup title="Account Settings" icon={User}>
                <SidebarLink
                  label="Profile Information"
                  active={activeView === 'profile-info'}
                  onClick={() => setActiveView('profile-info')}
                />
                <SidebarLink
                  label="Manage Addresses"
                  active={activeView === 'addresses'}
                  onClick={() => setActiveView('addresses')}
                />
                <SidebarLink
                  label="PAN Card Information"
                  active={activeView === 'pan-card'}
                  onClick={() => setActiveView('pan-card')}
                />
              </SidebarGroup>

              {/* PAYMENTS */}
              <SidebarGroup title="Payments" icon={Wallet}>
                <SidebarLink
                  label="Gift Cards"
                  active={activeView === 'gift-cards'}
                  onClick={() => setActiveView('gift-cards')}
                />
                <SidebarLink
                  label="Saved Cards"
                  active={activeView === 'saved-cards'}
                  onClick={() => setActiveView('saved-cards')}
                />
                <SidebarLink
                  label="Saved UPI"
                  active={activeView === 'saved-upi'}
                  onClick={() => setActiveView('saved-upi')}
                />
                <SidebarLink
                  label="Refunds"
                  active={activeView === 'refunds'}
                  onClick={() => setActiveView('refunds')}
                />
              </SidebarGroup>


              {/* LOGOUT */}
              <button onClick={logoutAndRedirect} className="w-full flex items-center gap-4 px-6 py-5 border-t border-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500 transition-all group">
                <LogOut className="w-5 h-5 group-hover:text-red-500" />
                <span className="font-black text-[10px] uppercase tracking-widest">Logout</span>
              </button>
            </Card>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 w-full bg-white shadow-sm p-8 lg:p-12 min-h-[600px] animate-in fade-in duration-700">

            {/* OVERVIEW */}
            {(activeView === "overview" || activeView === "profile") && (
              <div className="space-y-12">
                <div>
                  <h2 className="text-3xl font-black text-gray-900 italic tracking-tighter mb-2">Account Dashboard</h2>
                  <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Verified Digital ID: {user?.email}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Card className="border-2 border-gray-50 shadow-none p-8 flex flex-col justify-between hover:border-violet-100 transition-colors">
                    <div className="flex justify-between items-start mb-6">
                      <div className="p-3 bg-violet-50 text-violet-600 rounded-xl"><Package className="w-6 h-6" /></div>
                      <Badge className="bg-emerald-100 text-emerald-600 border-none font-black text-[9px] uppercase tracking-widest">{orders.length} Active</Badge>
                    </div>
                    <h4 className="text-xl font-black text-gray-900 italic tracking-tight mb-2">Track Shipments</h4>
                    <p className="text-sm text-gray-400 italic mb-6">Monitor your pending acquisitions in real-time.</p>
                    <Button onClick={() => setActiveView("orders")} variant="outline" className="w-fit h-10 rounded-lg border-2 border-gray-100 font-bold text-[10px] uppercase tracking-widest">View Orders</Button>
                  </Card>

                  <Card className="border-2 border-gray-50 shadow-none p-8 flex flex-col justify-between hover:border-violet-100 transition-colors">
                    <div className="flex justify-between items-start mb-6">
                      <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><Wallet className="w-6 h-6" /></div>
                      <p className="font-black text-violet-600 italic">₹4,200</p>
                    </div>
                    <h4 className="text-xl font-black text-gray-900 italic tracking-tight mb-2">Digital Wallet</h4>
                    <p className="text-sm text-gray-400 italic mb-6">Manage your credits and saved payment vectors.</p>
                    <Button onClick={() => setActiveView("saved-cards")} variant="outline" className="w-fit h-10 rounded-lg border-2 border-gray-100 font-bold text-[10px] uppercase tracking-widest">Access Vault</Button>
                  </Card>
                </div>

              </div>
            )}

            {/* PROFILE INFO */}
            {activeView === "profile-info" && (
              <div className="space-y-12">
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-black text-gray-900 italic tracking-tighter">Profile Details</h2>
                </div>

                <div className="space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                    <div className="space-y-2">
                      <Label className="uppercase text-[10px] font-black tracking-widest text-gray-400">Full Name</Label>
                      <Input
                        value={profileEdit.name}
                        readOnly
                        className="h-12 rounded-lg bg-gray-50 border-transparent text-gray-600 cursor-not-allowed text-base font-bold"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="uppercase text-[10px] font-black tracking-widest text-gray-400">Email Address</Label>
                      <Input
                        value={profileEdit.email}
                        readOnly
                        className="h-12 rounded-lg bg-gray-50 border-transparent text-gray-600 cursor-not-allowed text-base font-bold"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="uppercase text-[10px] font-black tracking-widest text-gray-400">Gender</Label>
                      <select
                        value={profileEdit.gender}
                        disabled
                        className="h-12 w-full rounded-lg bg-gray-50 border-transparent text-gray-600 cursor-not-allowed text-base font-bold"
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label className="uppercase text-[10px] font-black tracking-widest text-gray-400">Date of Birth</Label>
                      <Input
                        type="date"
                        value={profileEdit.dob}
                        readOnly
                        className="h-12 rounded-lg bg-gray-50 border-transparent text-gray-600 cursor-not-allowed text-base font-bold"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 mt-8">
                    <div className="space-y-2">
                      <Label className="uppercase text-[10px] font-black tracking-widest text-gray-400">Phone Number</Label>
                      <Input
                        value={profileEdit.phone}
                        readOnly
                        className="h-12 rounded-lg bg-gray-50 border-transparent text-gray-600 cursor-not-allowed text-base font-bold"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="uppercase text-[10px] font-black tracking-widest text-gray-400">Address</Label>
                      <Input
                        value={profileEdit.address}
                        readOnly
                        className="h-12 rounded-lg bg-gray-50 border-transparent text-gray-600 cursor-not-allowed text-base font-bold"
                      />
                    </div>
                  </div>

                  <div className="bg-violet-50 p-6 rounded-2xl border border-violet-100 flex items-start gap-4 mt-12">
                    <Shield className="w-6 h-6 text-violet-600 shrink-0" />
                    <div>
                      <h4 className="text-sm font-bold text-violet-900 mb-1">Information Security</h4>
                      <p className="text-xs text-violet-700 leading-relaxed font-medium">To maintain account integrity, personal details cannot be changed directly after verification. Please contact support if you need to update your primary contact information.</p>
                    </div>
                  </div>


                  <div className="pt-12 border-t border-gray-100">
                    <h3 className="text-xl font-black italic tracking-tighter mb-8">Identification Graphics</h3>
                    <div className="flex items-center gap-8">
                      <Avatar className="w-24 h-24 border-4 border-gray-50">
                        <AvatarImage src={profileEdit.avatar || user.avatar} className="object-cover" />
                        <AvatarFallback className="text-2xl font-black bg-violet-100 text-violet-600">JB</AvatarFallback>
                      </Avatar>
                      <div className="space-y-4">
                        <Button
                          onClick={() => fileInputRef.current.click()}
                          variant="outline"
                          className="h-10 border-2 border-gray-100 rounded-lg px-6 font-black uppercase text-[10px] tracking-widest hover:bg-gray-50"
                        >
                          Update Gravatar
                        </Button>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Allowed Formats: JPG, PNG, WEBP (Max 2MB)</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ORDERS */}
            {activeView === 'orders' && (
              <div className="space-y-10">
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-black text-gray-900 italic tracking-tighter">Acquisition Log</h2>
                  <div className="flex gap-2">
                    <Input placeholder="Search orders..." className="h-10 w-64 rounded-lg bg-gray-50 border-0" />
                    <Button className="bg-violet-600 hover:bg-violet-700 h-10 px-6 rounded-lg font-black uppercase text-[10px] tracking-widest">Search</Button>
                  </div>
                </div>

                {orders.length > 0 ? (
                  <div className="space-y-6">
                    {orders.map((order) => (
                      <Card key={order.id} className="border-2 border-gray-50 shadow-none rounded-3xl overflow-hidden hover:border-violet-100 transition-colors group">

                        {/* Order Header Summary */}
                        <div className="bg-gray-50/50 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100">
                          <div className="space-y-1">
                            <div className="flex items-center gap-3">
                              <Badge className={`border-none font-bold text-[10px] uppercase tracking-widest px-3 py-1 ${order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-600' :
                                order.status === 'Processing' ? 'bg-amber-100 text-amber-600' :
                                  'bg-violet-100 text-violet-600'
                                }`}>
                                {order.status}
                              </Badge>
                              <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">{order.date}</span>
                            </div>
                            <p className="text-xs text-gray-400 font-medium">Order ID: <span className="text-gray-900 font-bold">#{order.id}</span></p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Amount</p>
                            <p className="text-xl font-black text-gray-900 italic tracking-tighter">₹{order.total.toLocaleString()}</p>
                          </div>
                        </div>

                        {/* Order Items List */}
                        <div className="p-6 space-y-6">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                              <div className="w-20 h-20 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0">
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-bold text-gray-900 text-base mb-1">{item.name}</h4>
                                <p className="text-sm text-gray-500 line-clamp-1">{item.description}</p>
                                <div className="mt-2 flex items-center gap-4">
                                  <span className="text-sm font-bold text-violet-600">₹{item.price.toLocaleString()}</span>
                                </div>
                              </div>
                              <Button variant="outline" size="sm" className="shrink-0 h-9 text-xs font-bold uppercase tracking-wider">
                                Buy Again
                              </Button>
                            </div>
                          ))}
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="border-2 border-dashed border-gray-100 bg-white rounded-3xl p-20 flex flex-col items-center justify-center text-center">
                    <Package className="w-16 h-16 text-gray-200 mb-6" />
                    <h3 className="text-2xl font-black italic tracking-tighter mb-2">No Active Shipments</h3>
                    <p className="text-gray-400 font-medium italic mb-8">You haven't initiated any material procurement sessions yet.</p>
                    <Link to="/shop">
                      <Button className="bg-gray-900 hover:bg-violet-600 h-14 px-10 rounded-xl font-black uppercase text-[10px] tracking-widest text-white transition-all shadow-xl shadow-gray-200">Start Shopping</Button>
                    </Link>
                  </Card>
                )}
              </div>
            )}

            {/* ADDRESSES */}
            {activeView === 'addresses' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xl font-bold text-gray-900">Manage Addresses</h2>
                </div>

                {isAddressFormOpen ? (
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <h3 className="font-bold text-lg mb-6 text-violet-600 uppercase tracking-wider">{editingAddressId ? 'Edit Address' : 'Add New Address'}</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">Contact Name <span className="text-red-500">*</span></Label>
                          <Input
                            value={addressFormData.name}
                            onChange={(e) => setAddressFormData({ ...addressFormData, name: e.target.value })}
                            className="bg-white"
                            placeholder="Name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">Phone Number <span className="text-red-500">*</span></Label>
                          <Input
                            value={addressFormData.phone}
                            onChange={(e) => setAddressFormData({ ...addressFormData, phone: e.target.value })}
                            className="bg-white"
                            placeholder="Phone number"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">Address / Area / Street <span className="text-red-500">*</span></Label>
                        <Input
                          value={addressFormData.addr}
                          onChange={(e) => setAddressFormData({ ...addressFormData, addr: e.target.value })}
                          className="bg-white h-12"
                          placeholder="House No, Building Name, Street, Area"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">Address Type</Label>
                        <div className="flex gap-4">
                          {['HOME', 'WORK', 'OTHER'].map(type => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => setAddressFormData({ ...addressFormData, type })}
                              className={`px-4 py-2 text-xs font-bold rounded-full border transition-all ${addressFormData.type === type ? 'bg-violet-600 text-white border-violet-600' : 'bg-white text-gray-500 border-gray-200 hover:border-violet-600'}`}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-4 pt-4">
                        <Button onClick={handleSaveAddress} className="bg-violet-600 hover:bg-violet-700 font-bold uppercase tracking-widest text-xs px-8">Save Address</Button>
                        <Button onClick={() => setIsAddressFormOpen(false)} variant="ghost" className="text-gray-500 font-bold uppercase tracking-widest text-xs">Cancel</Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Add New Address Button - Meesho Style */}
                    <div onClick={handleAddNewAddress} className="border border-gray-200 rounded-sm bg-white p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50 transition-colors">
                      <Plus className="w-4 h-4 text-violet-600" />
                      <span className="text-sm font-bold text-violet-600 uppercase tracking-wide">Add a new address</span>
                    </div>

                    {/* Address List */}
                    <div className="space-y-4">
                      {addresses.map((addr) => (
                        <div key={addr.id} className="border border-gray-200 rounded-sm bg-white p-6 relative group hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                              <h4 className="font-bold text-gray-900 text-sm">{addr.name}</h4>
                              <span className="font-bold text-gray-900 text-sm">{addr.phone}</span>
                            </div>
                            <div className="relative">
                              <button type="button" onClick={() => handleEditAddress(addr)} className="text-violet-600 font-bold text-xs uppercase hover:underline mr-4">Edit</button>
                              <button type="button" onClick={() => handleDeleteAddress(addr.id)} className="text-violet-600 font-bold text-xs uppercase hover:underline">Delete</button>
                            </div>
                          </div>

                          <p className="text-gray-600 text-sm leading-relaxed max-w-2xl mb-3">
                            {addr.addr}
                          </p>

                          <div className="inline-block px-2 py-1 bg-gray-100 rounded text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                            {addr.type}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* PAN CARD INFORMATION */}
            {activeView === 'pan-card' && (
              <div className="space-y-8 max-w-2xl">
                <div>
                  <h2 className="text-2xl font-black text-gray-900 italic tracking-tighter mb-2">PAN Card Information</h2>
                  <p className="text-gray-500 text-sm">Permanent Account Number (PAN) is a ten-character alphanumeric identifier, issued in the form of a laminated "PAN card", by the Indian Income Tax Department.</p>
                </div>

                {/* Why it's needed */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { title: "Identity Proof", icon: Shield, desc: "Valid government ID" },
                    { title: "Tax Compliance", icon: FileText, desc: "Required for TCS" },
                    { title: "High Value", icon: CreditCard, desc: "Transactions > ₹50K" }
                  ].map((item, i) => (
                    <Card key={i} className="bg-gray-50 border-0 p-4 flex flex-col items-center text-center gap-2 shadow-none">
                      <div className="bg-white p-2 rounded-full shadow-sm text-violet-600">
                        <item.icon className="w-5 h-5" />
                      </div>
                      <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wide">{item.title}</h4>
                      <p className="text-[10px] text-gray-500 font-medium">{item.desc}</p>
                    </Card>
                  ))}
                </div>

                {/* Form */}
                <Card className="border border-gray-200 shadow-none p-8 rounded-xl">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="uppercase text-[10px] font-black tracking-widest text-gray-500">PAN Number</Label>
                      <Input placeholder="ABCDE1234F" className="uppercase font-mono text-lg tracking-widest h-12 border-gray-200 focus:border-violet-600 focus:ring-violet-600" maxLength={10} />
                      <p className="text-[10px] text-gray-400 font-bold">Please enter your 10-digit PAN number as it appears on your card.</p>
                    </div>

                    <div className="space-y-2">
                      <Label className="uppercase text-[10px] font-black tracking-widest text-gray-500">Full Name on PAN Card</Label>
                      <Input placeholder="Enter full name" className="h-12 border-gray-200" />
                    </div>

                    <div className="space-y-4 pt-2">
                      <Label className="uppercase text-[10px] font-black tracking-widest text-gray-500">Upload PAN Card Image</Label>
                      <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center gap-4 hover:bg-gray-50 transition-colors cursor-pointer group">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-violet-100 transition-colors">
                          <Upload className="w-6 h-6 text-gray-400 group-hover:text-violet-600" />
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-sm text-gray-900">Click to upload or drag and drop</p>
                          <p className="text-xs text-gray-400">SVG, PNG, JPG or GIF (max. 800x400px)</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 bg-blue-50 p-4 rounded-lg">
                      <input type="checkbox" id="consent" className="mt-1 rounded border-gray-300 text-violet-600 focus:ring-violet-600" />
                      <label htmlFor="consent" className="text-xs text-blue-800 leading-relaxed font-medium">
                        I do hereby declare that the information given above is true and correct. I also authorize the company to verify my PAN details from the Income Tax Department's database.
                      </label>
                    </div>

                    <Button className="w-full h-12 bg-violet-600 hover:bg-violet-700 font-black uppercase tracking-widest text-xs rounded-xl shadow-lg shadow-violet-100">
                      Save PAN Details
                    </Button>
                  </div>
                </Card>

                <p className="text-center text-[10px] text-gray-400 uppercase tracking-widest flex items-center justify-center gap-2">
                  <Lock className="w-3 h-3" /> Your information is encrypted and stored securely
                </p>
              </div>
            )}

            {/* GIFT CARDS */}
            {activeView === 'gift-cards' && (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black text-gray-900 italic tracking-tighter">Gift Cards Wallet</h2>
                  <Button variant="outline" className="h-10 text-xs font-bold uppercase tracking-wider">
                    <Clock className="w-3 h-3 mr-2" /> Check Balance
                  </Button>
                </div>

                {/* Balance Card */}
                <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-8 text-white shadow-xl shadow-violet-200 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Gift className="w-32 h-32" />
                  </div>
                  <p className="text-violet-100 font-bold uppercase tracking-widest text-[10px] mb-2">Total Gift Card Balance</p>
                  <h3 className="text-4xl font-black tracking-tighter">₹0.00</h3>
                  <p className="text-violet-200 text-xs mt-4 font-medium max-w-md">Use this balance to purchase products across our entire catalog. Balance never expires.</p>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Add Gift Card Form */}
                  <Card className="border border-gray-200 shadow-none p-6 rounded-xl">
                    <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wide mb-6 flex items-center gap-2">
                      <Plus className="w-4 h-4 text-violet-600" /> Add A Gift Card
                    </h4>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Voucher Number</Label>
                        <Input
                          value={giftCardData.voucher}
                          onChange={(e) => setGiftCardData({ ...giftCardData, voucher: e.target.value })}
                          placeholder="Enter 16-digit voucher number"
                          className="h-12 border-gray-200 font-mono tracking-widest uppercase"
                          maxLength={16}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Voucher PIN</Label>
                        <Input
                          type="password"
                          value={giftCardData.pin}
                          onChange={(e) => setGiftCardData({ ...giftCardData, pin: e.target.value })}
                          placeholder="Enter 6-digit PIN"
                          className="h-12 border-gray-200 font-mono tracking-widest"
                          maxLength={6}
                        />
                      </div>
                      <Button onClick={handleAddGiftCard} className="w-full h-12 bg-gray-900 hover:bg-violet-600 font-black uppercase tracking-widest text-[10px]">Add to Wallet</Button>
                    </div>
                  </Card>

                  {/* Help / Info */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wide mb-2">How it works</h4>
                    <ul className="space-y-3">
                      {[
                        "Enter the 16-digit alphanumeric code from your email or physical card.",
                        "Enter the 6-digit PIN provided with the voucher.",
                        "Balance is instantly added to your wallet.",
                        "Use 'Gift Card' as a payment method during checkout."
                      ].map((text, i) => (
                        <li key={i} className="flex gap-3 text-sm text-gray-500 font-medium leading-relaxed">
                          <div className="w-1.5 h-1.5 rounded-full bg-violet-600 mt-2 shrink-0" />
                          {text}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Empty State / List for Cards */}
                <div>
                  <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wide mb-4">Active Gift Cards</h4>
                  {activeGiftCards.length > 0 ? (
                    <div className="space-y-4">
                      {activeGiftCards.map(card => (
                        <div key={card.id} className="border border-gray-200 rounded-xl p-4 flex items-center justify-between bg-white relative group">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-8 bg-gray-900 rounded-md flex items-center justify-center">
                              <Gift className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="font-mono font-bold text-gray-900 text-sm tracking-widest">{card.code}</p>
                              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Expires: {card.expiry}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <p className="text-violet-600 font-black italic">₹{card.balance}</p>
                            <Button onClick={() => handleRemoveGiftCard(card.id)} variant="ghost" size="icon" className="text-gray-300 hover:text-red-500 hover:bg-red-50">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-100 rounded-xl p-12 flex flex-col items-center justify-center text-center">
                      <Gift className="w-12 h-12 text-gray-200 mb-4" />
                      <p className="text-gray-400 font-bold text-sm">No active gift cards found</p>
                      <p className="text-gray-300 text-xs mt-1">Added cards will appear here</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SAVED CARDS */}
            {activeView === 'saved-cards' && (
              <div className="space-y-10">
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-black text-gray-900 italic tracking-tighter">Payment Vault</h2>
                  {!isAddCardOpen && (
                    <Button onClick={() => setIsAddCardOpen(true)} className="bg-violet-600 hover:bg-violet-700 h-12 px-8 rounded-xl font-black uppercase text-[10px] tracking-widest">
                      <Plus className="w-4 h-4 mr-2" /> Add Card
                    </Button>
                  )}
                </div>

                {isAddCardOpen && (
                  <Card className="border border-gray-200 p-6 bg-gray-50 rounded-xl mb-8">
                    <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wide mb-4">Add New Card</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        placeholder="Card Number"
                        value={newCard.number}
                        onChange={e => setNewCard({ ...newCard, number: e.target.value })}
                        maxLength={16}
                        className="bg-white"
                      />
                      <Input
                        placeholder="Card Brand (e.g. Visa)"
                        value={newCard.brand}
                        onChange={e => setNewCard({ ...newCard, brand: e.target.value })}
                        className="bg-white"
                      />
                      <Input
                        placeholder="Expiry (MM/YY)"
                        value={newCard.exp}
                        onChange={e => setNewCard({ ...newCard, exp: e.target.value })}
                        className="bg-white"
                      />
                      <select
                        className="h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background"
                        value={newCard.type}
                        onChange={e => setNewCard({ ...newCard, type: e.target.value })}
                      >
                        <option value="Credit">Credit Card</option>
                        <option value="Debit">Debit Card</option>
                      </select>
                    </div>
                    <div className="flex gap-4 mt-4">
                      <Button onClick={handleAddCard} className="bg-violet-600 hover:bg-violet-700 text-xs uppercase tracking-widest font-black">Save Card</Button>
                      <Button onClick={() => setIsAddCardOpen(false)} variant="ghost" className="text-xs uppercase tracking-widest font-black text-gray-500">Cancel</Button>
                    </div>
                  </Card>
                )}

                <div className="grid md:grid-cols-2 gap-8">
                  {savedCards.length > 0 ? (
                    savedCards.map((card) => (
                      <Card key={card.id} className="border-2 border-gray-50 shadow-none rounded-3xl p-10 bg-gradient-to-br from-white to-gray-50 hover:border-violet-200 transition-all flex flex-col justify-between h-56 relative group">
                        <Button
                          onClick={() => handleDeleteCard(card.id)}
                          size="icon"
                          variant="ghost"
                          className="absolute top-4 right-4 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>

                        <div className="flex justify-between items-start">
                          <p className="text-2xl font-black italic tracking-tighter text-violet-600">{card.brand}</p>
                          <CreditCard className="w-8 h-8 text-gray-200" />
                        </div>
                        <div>
                          <p className="text-xl font-mono tracking-widest mb-4">•••• •••• •••• {card.last4}</p>
                          <div className="flex justify-between items-end">
                            <div><p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1 leading-none">Expires</p><p className="font-bold text-gray-900">{card.exp}</p></div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">{card.type} Card</p>
                          </div>
                        </div>
                      </Card>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl">
                      <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-400 font-bold">No saved cards found</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SAVED UPI */}
            {activeView === 'saved-upi' && (
              <div className="space-y-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-black text-gray-900 italic tracking-tighter">Saved UPI</h2>
                    <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-1">Manage your Virtual Payment Addresses</p>
                  </div>
                  <Button onClick={() => setIsAddUPIOpen(true)} className="bg-violet-600 hover:bg-violet-700 h-12 px-8 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-violet-200">
                    <Plus className="w-4 h-4 mr-2" /> Add New VPA
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <Card
                    onClick={() => setIsAddUPIOpen(true)}
                    className="border-2 border-dashed border-violet-100 bg-violet-50/50 rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:bg-violet-50 transition-colors cursor-pointer group min-h-[180px]"
                  >
                    <div className="w-14 h-14 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Plus className="w-6 h-6 text-violet-600" />
                    </div>
                    <h4 className="font-black text-gray-900 text-sm uppercase tracking-wide">Add New UPI ID</h4>
                    <p className="text-[10px] text-gray-500 font-bold mt-2">Link a new VPA for faster checkout</p>
                  </Card>

                  {savedUPIs.length > 0 && savedUPIs.map((upi) => (
                    <Card key={upi.id} className="border-2 border-gray-50 shadow-none rounded-2xl p-6 hover:border-violet-200 transition-all flex flex-col justify-between min-h-[180px]">
                      <div className="flex justify-between items-start">
                        <div className="p-3 bg-violet-100 rounded-xl text-violet-600">
                          <Smartphone className="w-6 h-6" />
                        </div>
                        <Button onClick={() => handleDeleteUPI(upi.id)} variant="ghost" size="icon" className="text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-black text-gray-900 tracking-tight">{upi.id}</h3>
                          {upi.verified && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                        </div>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{upi.bank}</p>
                      </div>
                    </Card>
                  ))}
                </div>

                {isAddUPIOpen && (
                  <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setIsAddUPIOpen(false)}>
                    <Card className="w-full max-w-md bg-white p-6" onClick={e => e.stopPropagation()}>
                      <h3 className="text-xl font-bold mb-4">Link UPI ID</h3>
                      <div className="space-y-4">
                        <Input
                          placeholder="Ex: mobileNumber@upi"
                          value={newUPI}
                          onChange={e => setNewUPI(e.target.value)}
                        />
                        <div className="flex gap-4">
                          <Button onClick={handleAddUPI} className="flex-1 bg-violet-600">Verify & Save</Button>
                          <Button onClick={() => setIsAddUPIOpen(false)} variant="outline" className="flex-1">Cancel</Button>
                        </div>
                      </div>
                    </Card>
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-4 items-start">
                  <Shield className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-black text-blue-900 text-xs uppercase tracking-wide mb-1">Secure Payments</h4>
                    <p className="text-xs text-blue-700 leading-relaxed font-medium">Your UPI ID is encrypted and secured. We only use it to initiate payment requests. You will need to authorize every transaction from your UPI app.</p>
                  </div>
                </div>
              </div>
            )}

            {/* REFUNDS */}
            {activeView === 'refunds' && (
              <div className="space-y-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-black text-gray-900 italic tracking-tighter">Refund Status</h2>
                    <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-1">Track your return refunds</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {[
                    {
                      id: 'RF-882190',
                      orderId: 'ORD-44921',
                      amount: '₹2,499',
                      date: '12 Jan, 2024',
                      status: 'Processed',
                      items: 'Wireless Headphones (Blue)',
                      method: 'Original Payment Source'
                    },
                    {
                      id: 'RF-882450',
                      orderId: 'ORD-55002',
                      amount: '₹899',
                      date: '05 Jan, 2024',
                      status: 'Credited',
                      items: 'Cotton T-Shirt (L)',
                      method: 'Wallet'
                    }
                  ].map((refund, i) => (
                    <Card key={i} className="border-2 border-gray-50 shadow-none rounded-2xl overflow-hidden hover:border-violet-100 transition-all">
                      <div className="p-6 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge className={`border-none font-black text-[9px] uppercase tracking-widest px-3 py-1 ${refund.status === 'Credited' ? 'bg-emerald-100 text-emerald-600' :
                              refund.status === 'Processed' ? 'bg-blue-100 text-blue-600' :
                                'bg-amber-100 text-amber-600'
                              }`}>
                              {refund.status}
                            </Badge>
                            <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest">{refund.date}</span>
                          </div>
                          <h4 className="font-bold text-gray-900 text-sm">Refund for {refund.items}</h4>
                          <p className="text-xs text-gray-400 font-bold">Ref ID: {refund.id} • Order ID: {refund.orderId}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Refund Amount</p>
                          <p className="text-xl font-black text-violet-600 italic tracking-tighter">{refund.amount}</p>
                          <p className="text-[10px] text-gray-500 font-medium mt-1">To: {refund.method}</p>
                        </div>
                      </div>
                      {refund.status === 'Processed' && (
                        <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex items-center gap-3">
                          <Clock className="w-4 h-4 text-blue-500" />
                          <p className="text-xs text-gray-600 font-bold">Estimated credit by 15 Jan, 2024</p>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* WISHLIST */}
            {activeView === 'wishlist' && (
              <div className="space-y-10">
                <h2 className="text-3xl font-black text-gray-900 italic tracking-tighter px-4">My Collections</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[
                    { name: "Pro Headset X", price: "₹23,920", img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop" },
                    { name: "Quantum Watch", price: "₹47,920", img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop" },
                  ].map((item, i) => (
                    <Card key={i} className="border-0 shadow-sm rounded-2xl overflow-hidden group hover:shadow-xl transition-all h-full flex flex-col">
                      <div className="aspect-square bg-gray-100 overflow-hidden relative">
                        <img src={item.img} alt={item.name} className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700" />
                        <Button variant="ghost" size="icon" className="absolute top-2 right-2 bg-white/80 backdrop-blur-md rounded-lg text-violet-600 shadow-sm transition-all hover:bg-violet-600 hover:text-white"><Heart className="w-4 h-4" /></Button>
                      </div>
                      <CardContent className="p-4 flex flex-col flex-1">
                        <h4 className="font-bold text-gray-900 truncate mb-1 italic tracking-tight uppercaseLeading text-sm">{item.name}</h4>
                        <p className="text-violet-600 font-black italic tracking-tighter text-base mt-auto">{item.price}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* REWARDS */}
            {activeView === 'rewards' && (
              <div className="space-y-12">
                <h2 className="text-3xl font-black text-gray-900 italic tracking-tighter">Status Rewards</h2>
                <div className="grid gap-12">
                  <Card className="border-0 shadow-2xl rounded-[3rem] bg-gray-900 p-16 text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/20 rounded-full blur-[80px]" />
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                      <div className="w-32 h-32 bg-white/10 rounded-3xl flex items-center justify-center border border-white/10 shadow-inner">
                        <Star className="w-16 h-16 text-amber-400 fill-amber-400" />
                      </div>
                      <div className="text-center md:text-left">
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-violet-300 mb-2 italic">Total Reward Balance</p>
                        <h3 className="text-7xl font-black tracking-tighter mb-2 italic leading-none">1,250</h3>
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] italic leading-none">Credits Available for redemption</p>
                      </div>
                    </div>
                  </Card>

                  <div className="space-y-6">
                    <h3 className="text-xl font-black italic tracking-tighter">Activity History</h3>
                    <div className="bg-gray-50 rounded-2xl overflow-hidden divide-y divide-gray-100 border border-gray-100">
                      {[
                        { title: "Purchase Bonus", pts: "+450", date: "Jan 10, 2026" },
                        { title: "Daily Check-in", pts: "+10", date: "Jan 09, 2026" },
                        { title: "Review Calibration", pts: "+100", date: "Jan 05, 2026" }
                      ].map((item, i) => (
                        <div key={i} className="px-8 py-6 flex items-center justify-between hover:bg-white transition-all">
                          <div>
                            <p className="font-black text-gray-900 italic tracking-tight">{item.title}</p>
                            <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">{item.date}</p>
                          </div>
                          <p className="text-emerald-500 font-black italic text-xl">{item.pts}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* NOTIFICATIONS */}
            {activeView === 'notifications' && (
              <div className="space-y-10">
                <h2 className="text-3xl font-black text-gray-900 italic tracking-tighter">Inbox</h2>
                <div className="space-y-4">
                  {[
                    { title: "Order Confirmed!", msg: "Your session IDs are being processed.", time: "2h ago" },
                    { title: "Price Drop Alert", msg: "A shortlist item is now 20% cheaper.", time: "5h ago" }
                  ].map((notif, i) => (
                    <Card key={i} className="border-0 shadow-sm p-6 bg-gray-50 flex items-start gap-4 hover:border-violet-200 border-2 border-transparent transition-all">
                      <div className="p-2 bg-violet-100 text-violet-600 rounded-lg"><Bell className="w-5 h-5" /></div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 mb-1">{notif.title}</h4>
                        <p className="text-sm text-gray-500 italic mb-2">{notif.msg}</p>
                        <p className="text-[9px] font-black uppercase tracking-widest text-violet-400">{notif.time}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

          </main>
        </div>
      </div >
      <Footer />
    </div >
  );
};

export default Profile;
