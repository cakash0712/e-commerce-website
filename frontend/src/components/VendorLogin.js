import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Store, Lock, Mail, Eye, EyeOff, AlertCircle, UserPlus, ArrowLeft } from "lucide-react";
import { useAuth } from "../App";

const VendorLogin = () => {
    const navigate = useNavigate();
    const { login, register, setUser } = useAuth();
    const [authMode, setAuthMode] = useState("login"); // login or signup
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [signupData, setSignupData] = useState({
        business_name: "",
        owner_name: "",
        email: "",
        phone: "",
        password: ""
    });

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const userData = await login(email, password, "vendor");
            if (userData.user_type !== "vendor") {
                setError("Access denied. Vendor credentials required.");
                setLoading(false);
                return;
            }
            navigate("/vendor/dashboard");
        } catch (err) {
            setError(err.response?.data?.detail || "Authentication failed. Please verify your credentials.");
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        if (!signupData.business_name || !signupData.owner_name || !signupData.email || !signupData.password) {
            setError("Please fill in all required fields.");
            setLoading(false);
            return;
        }

        try {
            await register({
                name: signupData.owner_name,
                email: signupData.email,
                phone: signupData.phone,
                password: signupData.password,
                business_name: signupData.business_name,
                owner_name: signupData.owner_name,
                user_type: "vendor"
            });
            await login(signupData.email, signupData.password, "vendor");
            navigate("/vendor/dashboard");
        } catch (err) {
            setError(err.response?.data?.detail || "Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-violet-900 to-purple-900 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px]" />
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* Back to Home */}
                <button
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-6 text-sm font-medium transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Store
                </button>

                <Card className="border-0 shadow-2xl rounded-[2.5rem] overflow-hidden bg-white/10 backdrop-blur-xl">
                    <div className="p-8 bg-gradient-to-br from-indigo-600 to-purple-700 text-white text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-[50px]" />
                        <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/20">
                            <Store className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-3xl font-black italic tracking-tight">
                            Vendor<span className="text-indigo-200">Hub.</span>
                        </h1>
                        <p className="text-indigo-200 text-sm font-medium mt-2">
                            {authMode === "login" ? "Access your seller dashboard" : "Register your business"}
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
                                        Vendor Email
                                    </Label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <Input
                                            type="email"
                                            placeholder="vendor@yourstore.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="h-14 pl-12 rounded-xl border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                                            required
                                            autoComplete="off"
                                            name="vendor-email"
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
                                            className="h-14 pl-12 pr-12 rounded-xl border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                                            required
                                            autoComplete="new-password"
                                            name="vendor-password"
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
                                    className="w-full h-14 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-200 disabled:opacity-50 transition-all"
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
                            <form onSubmit={handleSignup} className="space-y-4" autoComplete="off">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black uppercase tracking-widest text-gray-400">Business Name *</Label>
                                        <Input
                                            placeholder="Acme Store"
                                            value={signupData.business_name}
                                            onChange={(e) => setSignupData({ ...signupData, business_name: e.target.value })}
                                            className="h-12 rounded-xl"
                                            required
                                            autoComplete="off"
                                            name="vendor-business"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black uppercase tracking-widest text-gray-400">Owner Name *</Label>
                                        <Input
                                            placeholder="John Doe"
                                            value={signupData.owner_name}
                                            onChange={(e) => setSignupData({ ...signupData, owner_name: e.target.value })}
                                            className="h-12 rounded-xl"
                                            required
                                            autoComplete="off"
                                            name="vendor-owner"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-black uppercase tracking-widest text-gray-400">Email *</Label>
                                    <Input
                                        type="email"
                                        placeholder="vendor@yourstore.com"
                                        value={signupData.email}
                                        onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                                        className="h-12 rounded-xl"
                                        required
                                        autoComplete="off"
                                        name="vendor-signup-email"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-black uppercase tracking-widest text-gray-400">Phone</Label>
                                    <Input
                                        placeholder="9876543210"
                                        value={signupData.phone}
                                        onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                                        className="h-12 rounded-xl"
                                        autoComplete="off"
                                        name="vendor-phone"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-black uppercase tracking-widest text-gray-400">Password *</Label>
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        value={signupData.password}
                                        onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                                        className="h-12 rounded-xl"
                                        required
                                        autoComplete="new-password"
                                        name="vendor-signup-password"
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-14 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-200 disabled:opacity-50 transition-all"
                                >
                                    {loading ? (
                                        <span className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Creating Account...
                                        </span>
                                    ) : (
                                        "Register Business"
                                    )}
                                </Button>
                            </form>
                        )}

                        <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                            <p className="text-sm text-gray-500">
                                {authMode === "login" ? "New to selling? " : "Already have an account? "}
                                <button
                                    onClick={() => { setAuthMode(authMode === "login" ? "signup" : "login"); setError(""); }}
                                    className="text-indigo-600 font-bold hover:underline"
                                >
                                    {authMode === "login" ? "Register Now" : "Sign In"}
                                </button>
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <p className="text-center text-white/40 text-xs mt-6">
                    Looking for customer login? <Link to="/auth" className="text-white/70 hover:text-white underline">Go here</Link>
                </p>
            </div>
        </div>
    );
};

export default VendorLogin;
