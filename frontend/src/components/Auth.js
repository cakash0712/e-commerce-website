import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, LogIn, UserPlus, Phone, CheckCircle, FileText, Settings, Package, ShieldCheck } from "lucide-react";
import { useAuth } from "../App";

import Navigation from "./Navigation";
import Footer from "./Footer";

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login, logout, register, updateUser, loading, setUser } = useAuth();

  // Auth Mode States
  const [authMode, setAuthMode] = useState("login"); // login, signup
  const [authStep, setAuthStep] = useState("credentials"); // credentials, details
  const [loginMethod, setLoginMethod] = useState("phone"); // phone or email
  const [userType, setUserType] = useState(() => {
    const path = location.pathname;
    if (path.includes('/admin')) return "admin";
    if (path.includes('/vendor/ecommerce')) return "vendor_ecommerce";
    if (path.includes('/vendor/food')) return "vendor_food";
    if (path.includes('/vendor')) return "vendor"; // Fallback
    return "user";
  }); // user, vendor_ecommerce, vendor_food, or admin
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "",
    dob: "",
    address: "",
    password: "",
    business_name: "",
    business_category: "",
    business_categories: [],
    owner_name: ""
  });


  // Clear inputs on mount to prevent browser auto-fill
  useEffect(() => {
    setPhoneNumber("");
    setEmail("");
    setPassword("");
  }, []);

  // Listen for location changes to update userType if re-using component
  useEffect(() => {
    const path = location.pathname;
    let type = "user";
    if (path.includes('/admin')) type = "admin";
    else if (path.includes('/vendor/ecommerce')) type = "vendor_ecommerce";
    else if (path.includes('/vendor/food')) type = "vendor_food";
    else if (path.includes('/vendor')) type = "vendor";

    setUserType(type);

    // Reset to login mode if switching to admin
    if (type === 'admin') {
      setAuthMode('login');
    }
  }, [location.pathname]);

  const [error, setError] = useState("");

  const handleLogin = async () => {
    let identifier = loginMethod === "phone" ? phoneNumber : email;
    let isValid = false;
    if (loginMethod === "phone") {
      isValid = identifier.length === 10 && /^\d+$/.test(identifier);
      if (!isValid) {
        setError("Please enter a valid 10-digit phone number");
        return;
      }
    } else {
      isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
      if (!isValid) {
        setError("Please enter a valid email address");
        return;
      }
    }

    try {
      // Ensure we pass the correct userType based on current state, which should match the URL
      const currentPath = location.pathname;
      const type = currentPath.includes('/admin') ? "admin" : (currentPath.includes('/vendor') ? "vendor" : "user");

      const userData = await login(identifier, password, userType);
      const redirectPath = userData.user_type === "admin"
        ? "/admin/dashboard"
        : (userData.user_type.startsWith("vendor") ? "/vendor/dashboard" : "/profile");
      navigate(redirectPath);
    } catch (err) {
      // Special case for local admin demo login if backend is not available
      if (userType === 'admin' && identifier === 'admin@admin.com' && password === 'admin123') {
        const adminData = {
          id: 999,
          name: 'Super Admin',
          email: 'admin@admin.com',
          user_type: 'admin',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'
        };
        setUser(adminData);
        localStorage.setItem('user_data', JSON.stringify(adminData));
        localStorage.setItem('token', 'admin_token');
        navigate("/admin/dashboard");
        return;
      }
      // Show specific error message from backend
      const errorMessage = err.response?.data?.detail || err.message || "Login failed. Please check your credentials or sign up first.";
      setError(errorMessage);
    }
  };

  const handleSignupCredentials = () => {
    let identifier = loginMethod === "phone" ? phoneNumber : email;
    let isValid = false;
    if (loginMethod === "phone") {
      isValid = identifier.length === 10 && /^\d+$/.test(identifier);
      if (!isValid) {
        setError("Please enter a valid 10-digit phone number");
        return;
      }
    } else {
      isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
      if (!isValid) {
        setError("Please enter a valid email address");
        return;
      }
    }

    // Pre-fill signup data with credentials
    setSignupData(prev => ({
      ...prev,
      email: loginMethod === "phone" ? "" : email,
      phone: loginMethod === "phone" ? phoneNumber : "",
      password: password
    }));

    // For signup, go to details after credentials validation
    setAuthStep("details");
    setError("");
  };


  const handleCompleteSignup = async () => {
    const requiredEmail = loginMethod === "phone" ? signupData.email : email;
    const requiredPhone = loginMethod === "phone" ? phoneNumber : signupData.phone;

    if (!signupData.name.trim() || !requiredEmail.trim() || !requiredPhone.trim() || !signupData.password.trim()) {
      setError(`Please enter your name, ${loginMethod === "phone" ? "email" : "phone number"} and password`);
      return;
    }

    try {
      const userData = {
        name: signupData.name,
        email: loginMethod === "phone" ? signupData.email : email,
        phone: loginMethod === "phone" ? phoneNumber : signupData.phone,
        password: signupData.password,
        gender: signupData.gender,
        dob: signupData.dob,
        address: signupData.address,
        business_name: signupData.business_name,
        owner_name: signupData.owner_name,
        user_type: userType
      };

      const newUser = await register(userData);

      // Save signup data for profile pre-filling
      const signupProfileData = {
        gender: signupData.gender,
        dob: signupData.dob,
        address: signupData.address
      };
      localStorage.setItem('signup_data', JSON.stringify(signupProfileData));

      await login(loginMethod === "phone" ? signupData.email : email, signupData.password, userType);
      const redirectPath = userType.startsWith("vendor") ? "/vendor/dashboard" : "/profile";
      navigate(redirectPath);
    } catch (err) {
      // Show specific error message from backend
      const errorMessage = userType === "vendor" ? "Invalid vendor credentials" : (err.response?.data?.detail || err.message || "Registration failed. Please try again.");
      setError(errorMessage);
    }
  };

  const resetAuth = () => {
    setAuthStep("credentials");
    setPhoneNumber("");
    setEmail("");
    setPassword("");
    setSignupData({
      name: "",
      email: "",
      phone: "",
      gender: "",
      dob: "",
      address: "",
      password: "",
      business_name: "",
      business_category: "",
      business_categories: [],
      owner_name: ""
    });
    setError("");
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (user && user.user_type === userType) {
    const redirectPath = user.user_type === "admin"
      ? "/admin/dashboard"
      : (user.user_type === "vendor" ? "/vendor/dashboard" : "/profile");
    navigate(redirectPath);
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-white flex flex-col">
      <Navigation />
      <div className="flex-1 flex items-center justify-center p-4 pt-24">
        <Card className="w-full max-w-md shadow-2xl border-0 overflow-hidden rounded-2xl">
          {/* Header */}
          <div className="bg-gradient-to-br from-violet-600 to-indigo-700 p-8 text-center text-white relative overflow-hidden">
            <div className="relative">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                {userType === "admin" ? <Settings className="w-8 h-8" /> : userType === "vendor" ? <Package className="w-8 h-8" /> : (authMode === "login" ? <LogIn className="w-8 h-8" /> : <UserPlus className="w-8 h-8" />)}
              </div>
              <h2 className="text-2xl font-bold mb-1">
                {userType === "admin" ? "Admin Panel" :
                  userType === "vendor_ecommerce" ? "E-commerce Vendor" :
                    userType === "vendor_food" ? "Restaurant Owner Portal" :
                      userType === "vendor" ? "Vendor Portal" :
                        (authMode === "login" ? "Welcome Back" : "Create Account")}
              </h2>
              <p className="text-violet-200 text-sm">
                {userType === "admin" && "Access admin dashboard"}
                {userType === "vendor_ecommerce" && "Manage your shop and inventory"}
                {userType === "vendor_food" && "Manage your kitchen, menu and deliveries"}
                {userType === "vendor" && "Manage your products"}
                {userType === "user" && authStep === "credentials" && "Enter your login details"}
                {userType === "user" && authStep === "details" && (authMode === "signup" ? "Complete your profile information" : "Complete your profile")}
              </p>
            </div>
          </div>

          <CardContent className="p-6">
            {error && (
              <div className={`text-sm p-4 rounded-xl border mb-6 flex items-center gap-3 animate-in slide-in-from-top-2 duration-300 ${error.includes("successfully") || error.includes("pending administrative approval")
                ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                : "bg-red-50 text-red-600 border-red-100"
                }`}>
                <div className={`w-2 h-2 rounded-full animate-pulse ${error.includes("successfully") || error.includes("pending administrative approval")
                  ? "bg-emerald-500"
                  : "bg-red-500"
                  }`} />
                {error}
              </div>
            )}

            {userType.startsWith("vendor") ? (
              /* VENDOR CONTENT */
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {authMode === "signup" && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700">Business Name</Label>
                      <Input
                        placeholder="e.g. Acme Tech Solutions"
                        value={signupData.business_name}
                        onChange={(e) => setSignupData({ ...signupData, business_name: e.target.value })}
                        className="h-12 rounded-xl border-gray-200 focus:ring-2 focus:ring-indigo-600 transition-all shadow-sm"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-700">Business Categories (Multiple allowed)</Label>
                      <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-3 rounded-xl border border-gray-100 bg-gray-50/50">
                        {["Supermarket", "Electronics", "Fashion", "Home & Kitchen", "Food & Beverages", "Beauty & Personal Care", "Books", "Sports & Outdoors", "Toys & Games", "Automotive", "Grocery", "Health & Wellness"].map(cat => (
                          <label key={cat} className="flex items-center gap-2 p-2 rounded-lg hover:bg-white transition-colors cursor-pointer border border-transparent hover:border-violet-100">
                            <input
                              type="checkbox"
                              checked={signupData.business_categories.includes(cat)}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setSignupData(prev => ({
                                  ...prev,
                                  business_categories: checked
                                    ? [...prev.business_categories, cat]
                                    : prev.business_categories.filter(c => c !== cat),
                                  // Set business_category to the first one for backward compatibility
                                  business_category: checked
                                    ? [...prev.business_categories, cat][0]
                                    : prev.business_categories.filter(c => c !== cat)[0] || ""
                                }));
                              }}
                              className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                            />
                            <span className="text-xs font-bold text-gray-600 truncate">{cat}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700">Business Address</Label>
                      <Input
                        placeholder="e.g. 123 Business Park, Tech City"
                        value={signupData.address}
                        onChange={(e) => setSignupData({ ...signupData, address: e.target.value })}
                        className="h-12 rounded-xl border-gray-200 focus:ring-2 focus:ring-indigo-600 transition-all shadow-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700">Owner Name</Label>
                      <Input
                        placeholder="e.g. John Doe"
                        value={signupData.owner_name}
                        onChange={(e) => setSignupData({ ...signupData, owner_name: e.target.value })}
                        className="h-12 rounded-xl border-gray-200 focus:ring-2 focus:ring-indigo-600 transition-all shadow-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700">Phone Number</Label>
                      <div className="flex">
                        <div className="flex items-center justify-center px-4 bg-gray-50 border border-r-0 border-gray-200 rounded-l-xl text-gray-600 font-bold">
                          +91
                        </div>
                        <Input
                          type="tel"
                          placeholder="000 000 0000"
                          value={signupData.phone}
                          onChange={(e) => setSignupData({ ...signupData, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                          className="h-12 rounded-l-none rounded-r-xl border-gray-200 focus:ring-2 focus:ring-indigo-600 text-lg tracking-widest shadow-sm"
                        />
                      </div>
                    </div>
                  </>
                )}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Vendor Email</Label>
                  <Input
                    type="email"
                    placeholder="vendor@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 rounded-xl border-gray-200 focus:ring-2 focus:ring-indigo-600 transition-all shadow-sm"
                    autoComplete="new-password"
                    name="vendor-email"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Password</Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 rounded-xl border-gray-200 focus:ring-2 focus:ring-indigo-600 transition-all shadow-sm"
                    autoComplete="new-password"
                    name="vendor-password"
                  />
                </div>

                <Button
                  onClick={async () => {
                    if (authMode === "login") {
                      if (email === "vendor@vendor.com" && password === "vendor123") {
                        setUser({
                          id: 2,
                          username: 'vendor',
                          email: 'vendor@vendor.com',
                          name: 'Vendor User',
                          user_type: 'vendor'
                        });
                        navigate("/vendor");
                      } else {
                        try {
                          await login(email, password, userType);
                          navigate("/vendor");
                        } catch (err) {
                          setError(err.response?.data?.detail || "Invalid vendor credentials");
                        }
                      }
                    } else {
                      if (!signupData.business_name || !signupData.business_category || !signupData.address || !signupData.owner_name || !signupData.phone || !email || !password) {
                        setError("Please fill in all required fields (Business Name, Category, Address, Owner Name, Phone, Email, and Password)");
                        return;
                      }
                      try {
                        const userData = {
                          name: signupData.business_name,
                          email: email,
                          phone: signupData.phone,
                          password: password,
                          gender: "",
                          dob: "",
                          address: signupData.address,
                          business_name: signupData.business_name,
                          business_category: signupData.business_category,
                          business_categories: signupData.business_categories,
                          owner_name: signupData.owner_name,
                          user_type: userType
                        };
                        const registeredUser = await register(userData);

                        // Check if vendor is pending approval
                        if (registeredUser.status === "pending") {
                          setError("Vendor account created successfully! Your account is pending administrative approval. You will be notified once approved.");
                          // Reset form after showing success message
                          setTimeout(() => {
                            resetAuth();
                            setAuthMode("login");
                          }, 3000);
                          return;
                        }

                        await login(email, password, userType);
                        navigate("/vendor");
                      } catch (err) {
                        if (err.response?.data?.status === "pending") {
                          setError("Vendor account created successfully! Your account is pending administrative approval. You will be notified once approved.");
                          setTimeout(() => {
                            resetAuth();
                            setAuthMode("login");
                          }, 3000);
                          return;
                        }
                        const errorMsg = err.response?.data?.detail || err.message || "Vendor signup failed. Please try again.";
                        setError(errorMsg);
                      }
                    }
                  }}
                  className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 transition-all active:scale-[0.98] group"
                >
                  {authMode === "login" ? <LogIn className="w-5 h-5 mr-3 group-hover:translate-x-1 transition-transform" /> : <UserPlus className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />}
                  {authMode === "login" ? "Enter Vendor Portal" : "Join as Vendor"}
                </Button>
              </div>
            ) : (
              /* CUSTOMER CONTENT */
              authStep === "credentials" ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-gray-700">Login Method</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => { setLoginMethod("phone"); setEmail(""); }}
                        className={`flex items-center justify-center gap-2 h-11 rounded-xl border-2 transition-all ${loginMethod === 'phone' ? 'border-violet-600 bg-violet-50 text-violet-700' : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'}`}
                      >
                        <Phone className="w-4 h-4" />
                        <span className="text-sm font-bold">Phone</span>
                      </button>
                      <button
                        onClick={() => { setLoginMethod("email"); setPhoneNumber(""); }}
                        className={`flex items-center justify-center gap-2 h-11 rounded-xl border-2 transition-all ${loginMethod === 'email' ? 'border-violet-600 bg-violet-50 text-violet-700' : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'}`}
                      >
                        <User className="w-4 h-4" />
                        <span className="text-sm font-bold">Email</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700">{loginMethod === "phone" ? "Phone Number" : "Email Address"}</Label>
                      {loginMethod === "phone" ? (
                        <div className="flex">
                          <div className="flex items-center justify-center px-4 bg-gray-50 border border-r-0 border-gray-200 rounded-l-xl text-gray-600 font-bold">
                            +91
                          </div>
                          <Input
                            type="tel"
                            placeholder="000 000 0000"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                            className="h-12 rounded-l-none rounded-r-xl border-gray-200 focus:ring-2 focus:ring-violet-600 text-lg tracking-widest shadow-sm"
                            autoComplete="new-password"
                            name="phone"
                          />
                        </div>
                      ) : (
                        <Input
                          type="email"
                          placeholder="name@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="h-12 rounded-xl border-gray-200 focus:ring-2 focus:ring-violet-600 shadow-sm"
                          autoComplete="new-password"
                          name="user-email"
                        />
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700">Password</Label>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-12 rounded-xl border-gray-200 focus:ring-2 focus:ring-violet-600 shadow-sm"
                        autoComplete="new-password"
                        name="user-password"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={authMode === "login" ? handleLogin : handleSignupCredentials}
                    className="w-full h-12 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold shadow-lg shadow-violet-100 transition-all active:scale-[0.98] group"
                  >
                    <LogIn className="w-5 h-5 mr-3 group-hover:translate-x-1 transition-transform" />
                    {authMode === "login" ? "Sign In" : "Continue"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-6 animate-in zoom-in-95 duration-500">
                  <div className="text-center bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                    <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-2 text-white shadow-lg shadow-emerald-100">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                    <p className="text-emerald-700 font-bold text-sm">Credentials Secured!</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase tracking-widest text-gray-400">Full Name</Label>
                      <Input
                        placeholder="Your full name"
                        value={signupData.name}
                        onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                        className="h-11 rounded-lg border-gray-200 bg-white shadow-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase tracking-widest text-gray-400">Gender</Label>
                      <select
                        value={signupData.gender}
                        onChange={(e) => setSignupData({ ...signupData, gender: e.target.value })}
                        className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium"
                      >
                        <option value="">Select</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase tracking-widest text-gray-400">
                        {loginMethod === "phone" ? "Email Address" : "Phone Number"}
                      </Label>
                      {loginMethod === "phone" ? (
                        <Input
                          type="email"
                          placeholder="name@example.com"
                          value={signupData.email}
                          onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                          className="h-11 rounded-lg border-gray-200 bg-white shadow-sm"
                        />
                      ) : (
                        <div className="flex">
                          <div className="flex items-center justify-center px-3 bg-gray-50 border border-r-0 border-gray-200 rounded-l-lg text-gray-600 font-bold text-xs">
                            +91
                          </div>
                          <Input
                            type="tel"
                            placeholder="000 000 0000"
                            value={signupData.phone}
                            onChange={(e) => setSignupData({ ...signupData, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                            className="h-11 rounded-l-none rounded-r-lg border-gray-200 focus:ring-2 focus:ring-violet-600 shadow-sm"
                          />
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase tracking-widest text-gray-400">Date of Birth</Label>
                      <Input
                        type="date"
                        value={signupData.dob}
                        onChange={(e) => setSignupData({ ...signupData, dob: e.target.value })}
                        className="h-11 rounded-lg border-gray-200 bg-white shadow-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-gray-400">Address (Optional)</Label>
                    <Input
                      placeholder="Current residential address"
                      value={signupData.address}
                      onChange={(e) => setSignupData({ ...signupData, address: e.target.value })}
                      className="h-11 rounded-lg border-gray-200 bg-white shadow-sm"
                    />
                  </div>

                  <Button
                    onClick={handleCompleteSignup}
                    className="w-full h-12 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold shadow-lg shadow-violet-100"
                  >
                    Complete Account Setup
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={() => setAuthStep("credentials")}
                    className="w-full h-10 text-gray-400 hover:text-gray-600 font-medium"
                  >
                    Back to Credentials
                  </Button>
                </div>
              )
            )}
          </CardContent>

          {/* Footer */}
          <div className="px-8 pb-8 border-t border-gray-50 pt-6 space-y-4">
            {userType !== "admin" && (
              <p className="text-center text-sm text-gray-500 font-medium">
                {authMode === "login" ? "Don't have an account? " : "Already have an account? "}
                <button
                  onClick={() => { setAuthMode(authMode === "login" ? "signup" : "login"); resetAuth(); }}
                  className="text-violet-600 font-bold hover:underline decoration-2 underline-offset-4"
                >
                  {authMode === "login" ? "Create One" : "Sign In"}
                </button>
              </p>
            )}

            <div className="flex flex-col items-center gap-3 border-t border-gray-50 pt-4">
              <p className="text-xs text-gray-400 font-medium">
                {userType === "user" ? (
                  <div className="flex flex-wrap justify-center gap-2">
                    <span>Are you a vendor?</span>
                    <Link to="/auth/vendor/ecommerce" className="text-indigo-600 font-bold hover:underline">E-commerce Portal</Link>
                    <span className="text-gray-300">|</span>
                    <Link to="/food/vendor/login" className="text-orange-600 font-bold hover:underline">Food Portal</Link>
                  </div>
                ) : (
                  <Link to="/auth" className="text-indigo-600 font-bold hover:underline">Go to Customer Login</Link>
                )}
              </p>
              {userType !== "admin" && (
                <Link to="/auth/admin" className="text-[10px] text-gray-300 hover:text-gray-500 font-medium transition-colors">
                  Admin Access
                </Link>
              )}
            </div>

            <p className="text-center text-[10px] text-gray-400 mt-4 uppercase tracking-widest font-black flex items-center justify-center gap-2">
              <ShieldCheck className="w-3 h-3 text-emerald-500" />
              Secure 256-bit SSL Encrypted Connection
            </p>
          </div>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default Auth;
