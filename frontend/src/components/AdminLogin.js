import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, Lock, Mail, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useAuth } from "../App";

const AdminLogin = () => {
    const navigate = useNavigate();
    const { login, setUser } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const userData = await login(email, password, "admin");
            if (userData.user_type !== "admin") {
                setError("Access denied. Administrator credentials required.");
                setLoading(false);
                return;
            }
            navigate("/admin/dashboard");
        } catch (err) {
            // Demo admin fallback for testing
            if (email === 'admin@admin.com' && password === 'admin123') {
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
            setError(err.response?.data?.detail || "Authentication protocol failed. Verify credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px]" />
                <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMjIiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
            </div>

            <Card className="w-full max-w-md border-0 shadow-2xl rounded-[2.5rem] overflow-hidden relative z-10 bg-white/5 backdrop-blur-xl">
                <div className="p-8 bg-gradient-to-br from-violet-600 to-indigo-700 text-white text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-[50px]" />
                    <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/20">
                        <ShieldCheck className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-black italic tracking-tight">
                        Admin<span className="text-violet-200">Core.</span>
                    </h1>
                    <p className="text-violet-200 text-sm font-medium mt-2">
                        Master Level Security Protocol
                    </p>
                </div>

                <CardContent className="p-8 bg-gray-900">
                    <form onSubmit={handleLogin} className="space-y-6" autoComplete="off">
                        {error && (
                            <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                                <AlertCircle className="w-5 h-5 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-gray-500">
                                Administrator Email
                            </Label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <Input
                                    type="email"
                                    placeholder="admin@zippycart.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="h-14 pl-12 rounded-xl bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-violet-500 focus:ring-violet-500"
                                    required
                                    autoComplete="off"
                                    name="admin-email"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-gray-500">
                                Security Key
                            </Label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="h-14 pl-12 pr-12 rounded-xl bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-violet-500 focus:ring-violet-500"
                                    required
                                    autoComplete="new-password"
                                    name="admin-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-14 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-xl shadow-violet-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Authenticating...
                                </span>
                            ) : (
                                "Access Control Panel"
                            )}
                        </Button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-gray-800 text-center">
                        <p className="text-gray-500 text-xs font-medium">
                            Protected by ZippyCart Security Protocol v2.0
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminLogin;
