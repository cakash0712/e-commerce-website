import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Settings, ShoppingBag, Bell, Shield, CreditCard, LogIn, UserPlus, LogOut, Mail, Lock, Camera, Heart, Star, MapPin, Package, ChevronRight, Wallet, Box, Plus, Trash2, Phone, CheckCircle, FileText, Upload, Clock, Smartphone, ArrowLeft, LayoutDashboard, Laptop } from "lucide-react";
import { useAuth, useOrders, useCart } from "../App";

import Navigation from "./Navigation";
import Footer from "./Footer";

const Profile = () => {
  const navigate = useNavigate();
  const { user, login, logout, register, updateUser, loading, setUser } = useAuth();

  // If we are in food mode, redirect to the food-specific profile
  const appMode = localStorage.getItem('DACH_app_mode');
  if (appMode === 'food') {
    return <Navigate to="/food/profile" replace />;
  }
  const { orders } = useOrders();
  const { addToCart } = useCart();
  const [activeView, setActiveView] = useState("overview");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  // State Management
  const [addresses, setAddresses] = useState([]);
  const [savedCards, setSavedCards] = useState([]);
  const [savedUPIs, setSavedUPIs] = useState([]);

  const [contentLibrary, setContentLibrary] = useState([]);
  const [devices, setDevices] = useState([]);
  const [notifications, setNotifications] = useState([]);

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

            if (response.data.content_library) setContentLibrary(response.data.content_library);
            if (response.data.devices) setDevices(response.data.devices);
            profileLoaded.current = true;
            return;
          }
        } catch (e) {
          console.error("Failed to fetch profile data from backend", e);
        }

        // Fetch notifications
        try {
          const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
          const token = localStorage.getItem('token');
          const response = await axios.get(`${API_BASE}/api/notifications`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setNotifications(response.data);
        } catch (e) {
          console.error("Failed to fetch notifications in profile", e);
        }

        // Fallback to localStorage
        const userId = user.id;
        const savedAddr = localStorage.getItem(`user_addresses_${userId}`);
        const savedCardsLocal = localStorage.getItem(`user_cards_${userId}`);
        const savedUPIsLocal = localStorage.getItem(`user_upis_${userId}`);


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



        profileLoaded.current = true;
      }
    };

    fetchUserData();
  }, [user?.id, user?.name, user?.phone, user?.address]);

  // Save sync with debounce
  useEffect(() => {
    const syncData = async () => {
      if (user?.id && profileLoaded.current) {
        // Local persistence
        localStorage.setItem(`user_addresses_${user.id}`, JSON.stringify(addresses));
        localStorage.setItem(`user_cards_${user.id}`, JSON.stringify(savedCards));
        localStorage.setItem(`user_upis_${user.id}`, JSON.stringify(savedUPIs));


        // Backend persistence
        try {
          await updateUser(user.id, {
            addresses,
            saved_cards: savedCards,
            saved_upis: savedUPIs,

            delivery_location: localStorage.getItem(`user_location_${user.id}`) || ""
          });
        } catch (e) {
          console.error("Failed to sync profile data to backend", e);
        }
      }
    };

    const timeoutId = setTimeout(syncData, 1000);
    return () => clearTimeout(timeoutId);
  }, [addresses, savedCards, savedUPIs, user?.id, updateUser]);

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
    <div className="min-h-screen bg-[#f1f3f6] flex flex-col pt-16 lg:pt-20 pb-20 lg:pb-0">
      <Navigation />
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />

      <div className="container mx-auto px-4 lg:px-8 py-4 lg:py-8 flex-1">
        {/* Breadcrumb / Back Navigation (Desktop Only) */}
        <div className="hidden lg:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 hover:text-violet-600 transition-colors mr-2 group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back</span>
          </button>
          <div className="w-px h-3 bg-gray-200 mx-1.5" />
          <Link to="/" className="hover:text-violet-600">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-900">Account Profile</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* Sidebar (Flipkart Style - Desktop Only) */}
          <aside className="hidden lg:block w-80 space-y-4 shrink-0">
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
          <main className="flex-1 w-full min-w-0 bg-white shadow-sm p-4 lg:p-12 min-h-[600px] animate-in fade-in duration-700 rounded-sm">

            {/* OVERVIEW */}
            {(activeView === "overview" || activeView === "profile") && (
              <div className="space-y-8 lg:space-y-12">

                {/* Mobile Header Greeting (Amazon Style) */}
                <div className="lg:hidden flex items-center justify-between gap-4 mb-4 bg-gradient-to-r from-purple-500 to-violet-500 -m-4 p-6 text-white">
                  <div className="flex items-center gap-4">
                    <h2 className="text-xl font-normal">Hello, <span className="font-bold">{user?.name || "User"}</span></h2>
                  </div>
                  <Avatar className="w-12 h-12 border-2 border-white bg-gray-200">
                    <AvatarImage src={profileEdit.avatar || user?.avatar} />
                    <AvatarFallback className="text-gray-500 font-bold">
                      {user?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <div className="hidden lg:block">
                  <h2 className="text-3xl font-black text-gray-900 italic tracking-tighter mb-2">Account Dashboard</h2>
                  <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Verified Digital ID: {user?.email}</p>
                </div>

                {/* Mobile Quick Actions Grid (Amazon 4-Button Style) */}
                <div className="lg:hidden grid grid-cols-2 gap-3 mb-6 px-0">
                  <button onClick={() => setActiveView("orders")} className="p-3 bg-white border border-gray-300 rounded-full text-sm font-normal text-gray-800 shadow-sm active:bg-gray-100 transition-colors">
                    Your Orders
                  </button>
                  <button onClick={() => setActiveView("orders")} className="p-3 bg-white border border-gray-300 rounded-full text-sm font-normal text-gray-800 shadow-sm active:bg-gray-100 transition-colors">
                    Buy Again
                  </button>
                  <button onClick={() => setActiveView("profile-info")} className="p-3 bg-white border border-gray-300 rounded-full text-sm font-normal text-gray-800 shadow-sm active:bg-gray-100 transition-colors">
                    Your Account
                  </button>
                  <button onClick={() => setActiveView("addresses")} className="p-3 bg-white border border-gray-300 rounded-full text-sm font-normal text-gray-800 shadow-sm active:bg-gray-100 transition-colors">
                    Your Lists
                  </button>
                </div>

                {/* Mobile Your Orders Preview (Amazon Style Horizontal Scroll) */}
                <div className="lg:hidden mb-6">
                  <div className="flex justify-between items-center mb-4 px-1">
                    <h3 className="font-bold text-lg text-gray-900">Your Orders</h3>
                    <button onClick={() => setActiveView("orders")} className="text-cyan-700 text-sm">See all</button>
                  </div>
                  <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide px-1">
                    {orders.length > 0 ? orders.slice(0, 5).map(order => (
                      <div key={order.id} className="min-w-[150px] border border-gray-200 rounded-lg p-3 bg-white flex flex-col gap-2 shadow-sm">
                        <div className="w-full h-24 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center">
                          {order.items?.[0]?.image ? (
                            <img src={order.items[0].image} alt="Product" className="object-contain h-full" />
                          ) : (
                            <Package className="w-8 h-8 text-gray-300" />
                          )}
                        </div>
                        <p className="text-xs text-gray-500 truncate">{order.items?.[0]?.name || "Order Item"}</p>
                      </div>
                    )) : (
                      <div className="w-full p-4 text-center border border-dashed border-gray-300 rounded-lg text-gray-400 text-xs">
                        No recent orders
                      </div>
                    )}
                  </div>
                </div>

                {/* Mobile Account List (Amazon Style Lists) */}
                <div className="lg:hidden space-y-1 mb-8">
                  <h3 className="font-bold text-lg text-gray-900 mb-2 px-1">Your Account</h3>
                  <div className="bg-white border-y border-gray-200 divide-y divide-gray-100 -mx-4">
                    <button onClick={() => setActiveView("profile-info")} className="w-full flex justify-between items-center p-4 text-left">
                      <span className="text-sm text-gray-700">Login & security</span>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </button>
                    <button onClick={() => setActiveView("addresses")} className="w-full flex justify-between items-center p-4 text-left">
                      <span className="text-sm text-gray-700">Your Addresses</span>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </button>
                    <button onClick={() => setActiveView("saved-cards")} className="w-full flex justify-between items-center p-4 text-left">
                      <span className="text-sm text-gray-700">Manage Payment Options</span>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </button>

                  </div>
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

                </div>

                {/* Mobile Logout Button */}
                <div className="lg:hidden mt-4 mb-20 px-4">
                  <Button onClick={logoutAndRedirect} variant="outline" className="w-full h-12 bg-gray-100 border-gray-300 text-gray-800 font-normal rounded-lg shadow-sm">
                    Log Out
                  </Button>
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
                </div>

                {orders.length > 0 ? (
                  <div className="space-y-4 lg:space-y-6 pb-20">
                    {orders.map((order) => (
                      <Card key={order.id} className="border-2 border-gray-50 shadow-none rounded-xl lg:rounded-3xl overflow-hidden hover:border-violet-100 transition-colors group">

                        {/* Order Header Summary */}
                        <div className="bg-gray-50/50 p-4 lg:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-2 lg:gap-4 border-b border-gray-100">
                          <div className="space-y-1 w-full">
                            <div className="flex items-center justify-between lg:justify-start gap-3">
                              <Badge className={`border-none font-bold text-[10px] uppercase tracking-widest px-3 py-1 ${order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-600' :
                                order.status === 'Processing' ? 'bg-amber-100 text-amber-600' :
                                  'bg-violet-100 text-violet-600'
                                }`}>
                                {order.status}
                              </Badge>
                              <span className="text-gray-400 text-[10px] lg:text-xs font-bold uppercase tracking-widest">{order.date}</span>
                            </div>
                            <div className="flex justify-between items-center lg:block">
                              <p className="text-[10px] lg:text-xs text-gray-400 font-medium">Order ID: <span className="text-gray-900 font-bold">#{order.id}</span></p>
                              <div className="text-right lg:hidden">
                                <p className="text-sm font-black text-gray-900 italic tracking-tighter">₹{order.total ? order.total.toLocaleString() : '0'}</p>
                              </div>
                            </div>
                          </div>
                          <div className="text-right hidden lg:block">
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Amount</p>
                            <p className="text-xl font-black text-gray-900 italic tracking-tighter">₹{order.total ? order.total.toLocaleString() : '0'}</p>
                          </div>
                        </div>

                        {/* Order Items List */}
                        <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex flex-col lg:grid lg:grid-cols-12 items-start lg:items-center gap-4 lg:gap-6">
                              {/* Image & Details */}
                              <div className="lg:col-span-8 flex items-start gap-4 w-full">
                                <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gray-50 rounded-lg lg:rounded-xl overflow-hidden border border-gray-100 flex-shrink-0">
                                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0 pt-1">
                                  <h4 className="font-bold text-gray-900 text-sm lg:text-base mb-1 truncate">{item.name}</h4>
                                  <p className="text-xs lg:text-sm text-gray-500 line-clamp-1 mb-2">{item.description}</p>

                                  {/* Mobile Price & Action */}
                                  <div className="lg:hidden flex items-center justify-between mt-2">
                                    <span className="text-sm font-bold text-violet-600">₹{item.price ? item.price.toLocaleString() : '0'}</span>
                                    <Button onClick={() => { addToCart(item); navigate('/cart'); }} variant="outline" size="sm" className="h-8 text-[10px] font-bold uppercase tracking-wider">
                                      Buy Again
                                    </Button>
                                  </div>
                                </div>
                              </div>

                              {/* Desktop Price & Action */}
                              <div className="hidden lg:col-span-4 lg:flex items-center justify-end gap-6">
                                <span className="text-lg font-bold text-gray-900">₹{item.price ? item.price.toLocaleString() : '0'}</span>
                                <Button onClick={() => { addToCart(item); navigate('/cart'); }} variant="outline" className="h-10 px-6 border-2 border-gray-100 hover:border-violet-600 hover:bg-violet-50 hover:text-violet-700 font-bold uppercase tracking-widest text-xs transition-all">
                                  Buy Again
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="border-2 border-dashed border-gray-100 bg-white rounded-3xl p-10 lg:p-20 flex flex-col items-center justify-center text-center">
                    <Package className="w-12 h-12 lg:w-16 lg:h-16 text-gray-200 mb-6" />
                    <h3 className="text-xl lg:text-2xl font-black italic tracking-tighter mb-2">No Active Shipments</h3>
                    <p className="text-sm text-gray-400 font-medium italic mb-8">You haven't initiated any material procurement sessions yet.</p>
                    <Link to="/shop">
                      <Button className="bg-gray-900 hover:bg-violet-600 h-12 lg:h-14 px-8 lg:px-10 rounded-xl font-black uppercase text-[10px] tracking-widest text-white transition-all shadow-xl shadow-gray-200">Start Shopping</Button>
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
                              <Badge className="bg-gray-100 text-gray-500 border-none text-[10px] font-bold px-2 py-0.5">{addr.type}</Badge>
                            </div>
                            <div className="flex items-center gap-4">
                              <button
                                onClick={() => {
                                  const locStr = addr.addr.length > 30 ? addr.addr.substring(0, 30) + "..." : addr.addr;
                                  if (user?.id) {
                                    localStorage.setItem(`user_location_${user.id}`, locStr);
                                    // Trigger sync immediately
                                    updateUser(user.id, { delivery_location: locStr });
                                  }
                                  window.dispatchEvent(new Event('location_updated'));
                                }}
                                className={`text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border transition-all ${localStorage.getItem(`user_location_${user?.id}`) === (addr.addr.length > 30 ? addr.addr.substring(0, 30) + "..." : addr.addr)
                                  ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                  : 'bg-white text-violet-600 border-violet-100 hover:bg-violet-50'}`}
                              >
                                {localStorage.getItem(`user_location_${user?.id}`) === (addr.addr.length > 30 ? addr.addr.substring(0, 30) + "..." : addr.addr) ? 'Active Location' : 'Deliver Here'}
                              </button>
                              <div className="h-4 w-px bg-gray-200 mx-1" />
                              <button type="button" onClick={() => handleEditAddress(addr)} className="text-gray-400 hover:text-violet-600 font-bold text-xs uppercase transition-colors">Edit</button>
                              <button type="button" onClick={() => handleDeleteAddress(addr.id)} className="text-gray-400 hover:text-rose-600 font-bold text-xs uppercase transition-colors">Delete</button>
                            </div>
                          </div>

                          <p className="text-gray-600 text-sm leading-relaxed max-w-2xl">
                            {addr.addr}
                          </p>
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

            {/* SAVED CARDS */}
            {activeView === 'saved-cards' && (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black text-gray-900 italic tracking-tighter">Saved Cards</h2>
                  <Button onClick={() => setIsAddCardOpen(true)} className="bg-violet-600 hover:bg-violet-700 h-10 px-6 rounded-lg font-black uppercase text-[10px] tracking-widest">Add New Card</Button>
                </div>

                {isAddCardOpen && (
                  <Card className="p-6 border-0 shadow-sm bg-gray-50 rounded-2xl mb-8">
                    {/* ... (Add Card Form logic would go here, kept simple for brevity as user asked to remove static data mainly) ... */}
                    <div className="grid gap-4">
                      <Input placeholder="Card Number" value={newCard.number} onChange={e => setNewCard({ ...newCard, number: e.target.value })} />
                      <div className="flex gap-4">
                        <Input placeholder="MM/YY" value={newCard.exp} onChange={e => setNewCard({ ...newCard, exp: e.target.value })} />
                        <Input placeholder="Brand (e.g. VISA)" value={newCard.brand} onChange={e => setNewCard({ ...newCard, brand: e.target.value })} />
                      </div>
                      <div className="flex gap-4">
                        <Button onClick={handleAddCard} className="bg-violet-600">Save Card</Button>
                        <Button variant="ghost" onClick={() => setIsAddCardOpen(false)}>Cancel</Button>
                      </div>
                    </div>
                  </Card>
                )}

                <div className="grid gap-4">
                  {savedCards.map(card => (
                    <div key={card.id} className="p-4 border rounded-xl flex justify-between items-center bg-white">
                      <div className="flex items-center gap-4">
                        <CreditCard className="w-8 h-8 text-gray-400" />
                        <div>
                          <p className="font-bold text-gray-900">{card.brand} ending in {card.last4}</p>
                          <p className="text-xs text-gray-500">Expires {card.exp}</p>
                        </div>
                      </div>
                      <Button variant="ghost" onClick={() => handleDeleteCard(card.id)} className="text-red-500 hover:text-red-600"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  ))}
                  {savedCards.length === 0 && <p className="text-gray-500 italic">No saved cards found.</p>}
                </div>
              </div>
            )}

            {/* SAVED UPI */}
            {activeView === 'saved-upi' && (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black text-gray-900 italic tracking-tighter">Saved UPI</h2>
                  <Button onClick={() => setIsAddUPIOpen(true)} className="bg-violet-600 hover:bg-violet-700 h-10 px-6 rounded-lg font-black uppercase text-[10px] tracking-widest">Add New UPI</Button>
                </div>

                {isAddUPIOpen && (
                  <div className="flex gap-4 mb-8">
                    <Input placeholder="Enter UPI ID (e.g. name@bank)" value={newUPI} onChange={e => setNewUPI(e.target.value)} />
                    <Button onClick={handleAddUPI} className="bg-violet-600">Save</Button>
                    <Button variant="ghost" onClick={() => setIsAddUPIOpen(false)}>Cancel</Button>
                  </div>
                )}

                <div className="grid gap-4">
                  {savedUPIs.map(upi => (
                    <div key={upi.id} className="p-4 border rounded-xl flex justify-between items-center bg-white">
                      <div className="flex items-center gap-4">
                        <Smartphone className="w-6 h-6 text-gray-400" />
                        <p className="font-bold text-gray-900">{upi.id}</p>
                      </div>
                      <Button variant="ghost" onClick={() => handleDeleteUPI(upi.id)} className="text-red-500 hover:text-red-600"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  ))}
                  {savedUPIs.length === 0 && <p className="text-gray-500 italic">No saved UPI IDs found.</p>}
                </div>
              </div>
            )}







          </main>
        </div>
      </div >

      {/* Mobile Bottom Navigation (Amazon Style) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 pb-safe">
        <div className="flex justify-around items-center p-2">
          <button onClick={() => navigate('/')} className="flex flex-col items-center p-2 text-gray-500">
            <div className="w-6 h-6"><img src="/assets/zlogo1.png" className="w-full h-full object-contain grayscale opacity-50" /></div>
            <span className="text-[10px]">Home</span>
          </button>
          <button onClick={() => setActiveView('profile-info')} className={`flex flex-col items-center p-2 ${activeView === 'profile-info' ? 'text-violet-600' : 'text-gray-500'}`}>
            <User className="w-6 h-6" />
            <span className="text-[10px]">Profile</span>
          </button>
          <button onClick={() => setActiveView('orders')} className={`flex flex-col items-center p-2 ${activeView === 'orders' ? 'text-violet-600' : 'text-gray-500'}`}>
            <Package className="w-6 h-6" />
            <span className="text-[10px]">Orders</span>
          </button>
          <button onClick={() => setActiveView('overview')} className={`flex flex-col items-center p-2 ${activeView === 'overview' ? 'text-violet-600' : 'text-gray-500'}`}>
            <LayoutDashboard className="w-6 h-6" />
            <span className="text-[10px]">Menu</span>
          </button>
        </div>
      </div>

      <Footer />
    </div >
  );
};

export default Profile;
