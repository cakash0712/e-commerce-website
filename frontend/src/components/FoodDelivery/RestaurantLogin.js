import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Utensils, Lock, Mail, Eye, EyeOff, AlertCircle, ArrowLeft, Phone, User, MapPin, Clock } from "lucide-react";
import { useAuth } from "../../App";

const RestaurantLogin = () => {
    const navigate = useNavigate();
    const { login, setUser } = useAuth();
    const [authMode, setAuthMode] = useState("login"); // login or signup
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [signupStep, setSignupStep] = useState(1); // Multi-step signup
    const [signupData, setSignupData] = useState({
        // Step 1: Basic Info
        restaurant_name: "",
        owner_name: "",
        email: "",
        phone: "",
        password: "",
        // Step 2: Restaurant Details
        restaurant_type: "", // QSR, Fine Dining, Cafe, Cloud Kitchen, etc.
        cuisine_type: "",
        fssai_license: "", // Food safety license
        gst_number: "",
        // Step 3: Location & Operations
        address: "",
        city: "",
        pincode: "",
        opening_time: "09:00",
        closing_time: "22:00",
        delivery_radius: "5", // in km
        avg_delivery_time: "30-45",
        // Step 4: Bank Details (optional for now)
        bank_account_name: "",
        bank_account_number: "",
        bank_ifsc: "",
        upi_id: ""
    });

    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
    const API = `${BACKEND_URL}/api`;

    const RESTAURANT_TYPES = [
        { value: "qsr", label: "Quick Service Restaurant (QSR)" },
        { value: "fine_dining", label: "Fine Dining" },
        { value: "casual_dining", label: "Casual Dining" },
        { value: "cafe", label: "Cafe / Bakery" },
        { value: "cloud_kitchen", label: "Cloud Kitchen / Delivery Only" },
        { value: "food_truck", label: "Food Truck" },
        { value: "dhaba", label: "Dhaba / Street Food" },
        { value: "sweet_shop", label: "Sweet Shop / Mithai" }
    ];

    const CUISINE_TYPES = [
        "North Indian", "South Indian", "Chinese", "Italian", "Mexican",
        "Continental", "Thai", "Japanese", "Mughlai", "Bengali",
        "Punjabi", "Rajasthani", "Biryani", "Fast Food", "Desserts",
        "Beverages", "Multi-Cuisine"
    ];

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            // Use the existing login but with food_vendor user_type
            const userData = await login(email, password, "restaurant");
            if (userData.user_type !== "restaurant" && userData.user_type !== "food_vendor") {
                setError("Access denied. Restaurant owner credentials required.");
                setLoading(false);
                return;
            }
            navigate("/food/vendor/dashboard");
        } catch (err) {
            setError(err.response?.data?.detail || "Authentication failed. Please verify your credentials.");
        } finally {
            setLoading(false);
        }
    };

    const validateStep = (step) => {
        switch (step) {
            case 1:
                if (!signupData.restaurant_name || !signupData.owner_name || !signupData.email || !signupData.phone || !signupData.password) {
                    setError("Please fill in all required fields.");
                    return false;
                }
                if (signupData.password.length < 6) {
                    setError("Password must be at least 6 characters.");
                    return false;
                }
                break;
            case 2:
                if (!signupData.restaurant_type || !signupData.cuisine_type) {
                    setError("Please select restaurant type and cuisine.");
                    return false;
                }
                break;
            case 3:
                if (!signupData.address || !signupData.city || !signupData.pincode) {
                    setError("Please fill in location details.");
                    return false;
                }
                break;
            default:
                break;
        }
        setError("");
        return true;
    };

    const nextStep = () => {
        if (validateStep(signupStep)) {
            setSignupStep(prev => prev + 1);
        }
    };

    const prevStep = () => {
        setSignupStep(prev => prev - 1);
        setError("");
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            // Register as food_vendor
            const response = await fetch(`${API}/food/restuarent/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: signupData.owner_name,
                    email: signupData.email,
                    phone: signupData.phone,
                    password: signupData.password,
                    restaurant_name: signupData.restaurant_name,
                    owner_name: signupData.owner_name,
                    restaurant_type: signupData.restaurant_type,
                    cuisine_type: signupData.cuisine_type,
                    fssai_license: signupData.fssai_license,
                    gst_number: signupData.gst_number,
                    address: signupData.address,
                    city: signupData.city,
                    pincode: signupData.pincode,
                    opening_time: signupData.opening_time,
                    closing_time: signupData.closing_time,
                    delivery_radius: signupData.delivery_radius,
                    avg_delivery_time: signupData.avg_delivery_time,
                    bank_details: {
                        account_name: signupData.bank_account_name,
                        account_number: signupData.bank_account_number,
                        ifsc: signupData.bank_ifsc,
                        upi_id: signupData.upi_id
                    },
                    user_type: "restaurant"
                })
            });

            if (!response.ok) {
                let errorMsg = "Registration failed";
                try {
                    const data = await response.json();
                    console.error("Registration error response:", data);
                    errorMsg = data.detail || errorMsg;
                } catch (e) {
                    console.error("Failed to parse error response:", response.statusText);
                    errorMsg = `Registration failed: ${response.statusText}`;
                }
                throw new Error(errorMsg);
            }

            // After successful registration, login
            await login(signupData.email, signupData.password, "restaurant");
            navigate("/food/vendor/dashboard");
        } catch (err) {
            setError(err.message || "Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-900 via-red-900 to-amber-900 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-red-500/20 rounded-full blur-[100px]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[120px]" />
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* Back to Home */}
                <button
                    onClick={() => navigate("/")}
                    className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-6 text-sm font-medium transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Home
                </button>

                <Card className="border-0 shadow-2xl rounded-[2.5rem] overflow-hidden bg-white/10 backdrop-blur-xl">
                    <div className="p-8 bg-gradient-to-br from-orange-600 to-red-700 text-white text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-[50px]" />
                        <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/20">
                            <Utensils className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-3xl font-black italic tracking-tight">
                            Restuarent<span className="text-orange-200">Partner.</span>
                        </h1>
                        <p className="text-orange-200 text-sm font-medium mt-2">
                            {authMode === "login" ? "Access your restaurant dashboard" : "Register your restaurant"}
                        </p>
                    </div>

                    <CardContent className="p-8 bg-white">
                        {error && (
                            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm mb-6">
                                <AlertCircle className="w-5 h-5 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        {authMode === "login" ? (
                            <form onSubmit={handleLogin} className="space-y-5" autoComplete="off">
                                <div className="space-y-2">
                                    <Label className="text-xs font-black uppercase tracking-widest text-gray-400">
                                        Restaurant Email
                                    </Label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <Input
                                            type="email"
                                            placeholder="restaurant@email.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="h-14 pl-12 rounded-xl border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                                            required
                                            autoComplete="off"
                                            name="food-vendor-email"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-black uppercase tracking-widest text-gray-400">
                                        Password
                                    </Label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="h-14 pl-12 pr-12 rounded-xl border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                                            required
                                            autoComplete="new-password"
                                            name="food-vendor-password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-14 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-xl shadow-orange-200 disabled:opacity-50 transition-all"
                                >
                                    {loading ? (
                                        <span className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Signing In...
                                        </span>
                                    ) : (
                                        "Access Dashboard"
                                    )}
                                </Button>
                            </form>
                        ) : (
                            <div className="space-y-4">
                                {/* Step Indicator */}
                                <div className="flex items-center justify-center gap-2 mb-6">
                                    {[1, 2, 3, 4].map(step => (
                                        <div key={step} className="flex items-center">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${signupStep >= step ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-500'
                                                }`}>
                                                {step}
                                            </div>
                                            {step < 4 && <div className={`w-8 h-0.5 ${signupStep > step ? 'bg-orange-600' : 'bg-gray-200'}`} />}
                                        </div>
                                    ))}
                                </div>
                                <p className="text-center text-sm text-gray-500 mb-4">
                                    {signupStep === 1 && "Basic Information"}
                                    {signupStep === 2 && "Restaurant Details"}
                                    {signupStep === 3 && "Location & Operations"}
                                    {signupStep === 4 && "Bank Details (Optional)"}
                                </p>

                                {/* Step 1: Basic Info */}
                                {signupStep === 1 && (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-xs font-black uppercase tracking-widest text-gray-400">Restaurant Name *</Label>
                                                <div className="relative">
                                                    <Utensils className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                    <Input
                                                        placeholder="Tasty Kitchen"
                                                        value={signupData.restaurant_name}
                                                        onChange={(e) => setSignupData({ ...signupData, restaurant_name: e.target.value })}
                                                        className="h-12 pl-10 rounded-xl"
                                                        autoComplete="off"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-black uppercase tracking-widest text-gray-400">Owner Name *</Label>
                                                <div className="relative">
                                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                    <Input
                                                        placeholder="John Doe"
                                                        value={signupData.owner_name}
                                                        onChange={(e) => setSignupData({ ...signupData, owner_name: e.target.value })}
                                                        className="h-12 pl-10 rounded-xl"
                                                        autoComplete="off"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-black uppercase tracking-widest text-gray-400">Email *</Label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <Input
                                                    type="email"
                                                    placeholder="restaurant@email.com"
                                                    value={signupData.email}
                                                    onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                                                    className="h-12 pl-10 rounded-xl"
                                                    autoComplete="off"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-xs font-black uppercase tracking-widest text-gray-400">Phone *</Label>
                                                <div className="relative">
                                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                    <Input
                                                        placeholder="9876543210"
                                                        value={signupData.phone}
                                                        onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                                                        className="h-12 pl-10 rounded-xl"
                                                        autoComplete="off"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-black uppercase tracking-widest text-gray-400">Password *</Label>
                                                <div className="relative">
                                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                    <Input
                                                        type="password"
                                                        placeholder="••••••••"
                                                        value={signupData.password}
                                                        onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                                                        className="h-12 pl-10 rounded-xl"
                                                        autoComplete="new-password"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Step 2: Restaurant Details */}
                                {signupStep === 2 && (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-black uppercase tracking-widest text-gray-400">Restaurant Type *</Label>
                                            <select
                                                value={signupData.restaurant_type}
                                                onChange={(e) => setSignupData({ ...signupData, restaurant_type: e.target.value })}
                                                className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                                            >
                                                <option value="">Select Type</option>
                                                {RESTAURANT_TYPES.map(type => (
                                                    <option key={type.value} value={type.value}>{type.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-black uppercase tracking-widest text-gray-400">Cuisine Type *</Label>
                                            <select
                                                value={signupData.cuisine_type}
                                                onChange={(e) => setSignupData({ ...signupData, cuisine_type: e.target.value })}
                                                className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                                            >
                                                <option value="">Select Cuisine</option>
                                                {CUISINE_TYPES.map(cuisine => (
                                                    <option key={cuisine} value={cuisine}>{cuisine}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-xs font-black uppercase tracking-widest text-gray-400">FSSAI License No.</Label>
                                                <Input
                                                    placeholder="14 digit license number"
                                                    value={signupData.fssai_license}
                                                    onChange={(e) => setSignupData({ ...signupData, fssai_license: e.target.value })}
                                                    className="h-12 rounded-xl"
                                                    autoComplete="off"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-black uppercase tracking-widest text-gray-400">GST Number</Label>
                                                <Input
                                                    placeholder="22AAAAA0000A1Z5"
                                                    value={signupData.gst_number}
                                                    onChange={(e) => setSignupData({ ...signupData, gst_number: e.target.value })}
                                                    className="h-12 rounded-xl"
                                                    autoComplete="off"
                                                />
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-400 flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" />
                                            FSSAI license is required for food businesses in India
                                        </p>
                                    </div>
                                )}

                                {/* Step 3: Location & Operations */}
                                {signupStep === 3 && (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-black uppercase tracking-widest text-gray-400">Restaurant Address *</Label>
                                            <div className="relative">
                                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <Input
                                                    placeholder="123 Food Street, Area"
                                                    value={signupData.address}
                                                    onChange={(e) => setSignupData({ ...signupData, address: e.target.value })}
                                                    className="h-12 pl-10 rounded-xl"
                                                    autoComplete="off"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-xs font-black uppercase tracking-widest text-gray-400">City *</Label>
                                                <Input
                                                    placeholder="Mumbai"
                                                    value={signupData.city}
                                                    onChange={(e) => setSignupData({ ...signupData, city: e.target.value })}
                                                    className="h-12 rounded-xl"
                                                    autoComplete="off"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-black uppercase tracking-widest text-gray-400">Pincode *</Label>
                                                <Input
                                                    placeholder="400001"
                                                    value={signupData.pincode}
                                                    onChange={(e) => setSignupData({ ...signupData, pincode: e.target.value })}
                                                    className="h-12 rounded-xl"
                                                    autoComplete="off"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-xs font-black uppercase tracking-widest text-gray-400">Opening Time</Label>
                                                <div className="relative">
                                                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                    <Input
                                                        type="time"
                                                        value={signupData.opening_time}
                                                        onChange={(e) => setSignupData({ ...signupData, opening_time: e.target.value })}
                                                        className="h-12 pl-10 rounded-xl"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-black uppercase tracking-widest text-gray-400">Closing Time</Label>
                                                <div className="relative">
                                                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                    <Input
                                                        type="time"
                                                        value={signupData.closing_time}
                                                        onChange={(e) => setSignupData({ ...signupData, closing_time: e.target.value })}
                                                        className="h-12 pl-10 rounded-xl"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-xs font-black uppercase tracking-widest text-gray-400">Delivery Radius (km)</Label>
                                                <Input
                                                    type="number"
                                                    placeholder="5"
                                                    value={signupData.delivery_radius}
                                                    onChange={(e) => setSignupData({ ...signupData, delivery_radius: e.target.value })}
                                                    className="h-12 rounded-xl"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-black uppercase tracking-widest text-gray-400">Avg Delivery Time</Label>
                                                <select
                                                    value={signupData.avg_delivery_time}
                                                    onChange={(e) => setSignupData({ ...signupData, avg_delivery_time: e.target.value })}
                                                    className="w-full h-12 px-4 rounded-xl border border-gray-200"
                                                >
                                                    <option value="15-25">15-25 mins</option>
                                                    <option value="25-35">25-35 mins</option>
                                                    <option value="30-45">30-45 mins</option>
                                                    <option value="45-60">45-60 mins</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Step 4: Bank Details */}
                                {signupStep === 4 && (
                                    <div className="space-y-4">
                                        <p className="text-sm text-gray-500 bg-amber-50 p-3 rounded-xl">
                                            💰 Bank details are optional now. You can add them later from your dashboard to receive payouts.
                                        </p>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-black uppercase tracking-widest text-gray-400">Account Holder Name</Label>
                                            <Input
                                                placeholder="Account holder name"
                                                value={signupData.bank_account_name}
                                                onChange={(e) => setSignupData({ ...signupData, bank_account_name: e.target.value })}
                                                className="h-12 rounded-xl"
                                                autoComplete="off"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-xs font-black uppercase tracking-widest text-gray-400">Account Number</Label>
                                                <Input
                                                    placeholder="Bank account number"
                                                    value={signupData.bank_account_number}
                                                    onChange={(e) => setSignupData({ ...signupData, bank_account_number: e.target.value })}
                                                    className="h-12 rounded-xl"
                                                    autoComplete="off"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-black uppercase tracking-widest text-gray-400">IFSC Code</Label>
                                                <Input
                                                    placeholder="SBIN0001234"
                                                    value={signupData.bank_ifsc}
                                                    onChange={(e) => setSignupData({ ...signupData, bank_ifsc: e.target.value })}
                                                    className="h-12 rounded-xl"
                                                    autoComplete="off"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-black uppercase tracking-widest text-gray-400">UPI ID (Alternative)</Label>
                                            <Input
                                                placeholder="restaurant@upi"
                                                value={signupData.upi_id}
                                                onChange={(e) => setSignupData({ ...signupData, upi_id: e.target.value })}
                                                className="h-12 rounded-xl"
                                                autoComplete="off"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Navigation Buttons */}
                                <div className="flex gap-3 pt-4">
                                    {signupStep > 1 && (
                                        <Button
                                            type="button"
                                            onClick={prevStep}
                                            variant="outline"
                                            className="flex-1 h-12 rounded-xl"
                                        >
                                            Back
                                        </Button>
                                    )}
                                    {signupStep < 4 ? (
                                        <Button
                                            type="button"
                                            onClick={nextStep}
                                            className="flex-1 h-12 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-bold"
                                        >
                                            Next Step
                                        </Button>
                                    ) : (
                                        <Button
                                            type="button"
                                            onClick={handleSignup}
                                            disabled={loading}
                                            className="flex-1 h-12 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-xl shadow-orange-200 disabled:opacity-50 transition-all"
                                        >
                                            {loading ? (
                                                <span className="flex items-center gap-2">
                                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    Registering...
                                                </span>
                                            ) : (
                                                "Complete Registration"
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}


                        <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                            <p className="text-sm text-gray-500">
                                {authMode === "login" ? "New restaurant partner? " : "Already have an account? "}
                                <button
                                    onClick={() => { setAuthMode(authMode === "login" ? "signup" : "login"); setError(""); }}
                                    className="text-orange-600 font-bold hover:underline"
                                >
                                    {authMode === "login" ? "Register Now" : "Sign In"}
                                </button>
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <div className="mt-6 text-center space-y-2">
                    <p className="text-white/40 text-xs">
                        Looking for e-commerce vendor login? <Link to="/vendor/login" className="text-white/70 hover:text-white underline">Go here</Link>
                    </p>
                    <p className="text-white/40 text-xs">
                        Order food as customer? <Link to="/food" className="text-white/70 hover:text-white underline">Browse restaurants</Link>
                    </p>
                </div>
            </div >
        </div >
    );
};

export default RestaurantLogin;
