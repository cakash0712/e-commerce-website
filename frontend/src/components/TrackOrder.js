import React, { useState } from 'react';
import Navigation from './Navigation';
import Footer from './Footer';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    MapPin,
    Package,
    Truck,
    CheckCircle2,
    Search,
    ArrowRight,
    Box,
    Clock,
    Info,
    ShieldCheck,
    Globe
} from "lucide-react";

const TrackOrder = () => {
    const [trackingId, setTrackingId] = useState("");
    const [showStatus, setShowStatus] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleTrack = (e) => {
        e.preventDefault();
        if (trackingId.trim()) {
            setLoading(true);
            setTimeout(() => {
                setShowStatus(true);
                setLoading(false);
            }, 1000);
        }
    };

    return (
        <div className="min-h-screen bg-[#fcfdfe] flex flex-col">
            <Navigation />

            <main className="flex-1 pt-32 pb-24">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Professional Search Header */}
                    <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <Badge className="bg-violet-50 text-violet-600 border-none font-bold text-[10px] tracking-[0.3em] px-4 py-1.5 rounded-full uppercase mb-6">
                            Operational Hub
                        </Badge>
                        <h1 className="text-4xl lg:text-7xl font-bold text-gray-900 mb-8 tracking-tighter italicLeading">
                            Track Your <span className="text-violet-600 font-extrabold italic">Artifact.</span>
                        </h1>
                        <p className="text-gray-500 text-lg font-medium max-w-2xl mx-auto mb-12 italicLeading">
                            Enter your unique logistics identifier for real-time synchronization with our
                            global fulfillment network.
                        </p>

                        <Card className="border-0 shadow-2xl rounded-[2.5rem] overflow-hidden bg-white border border-gray-100 max-w-3xl mx-auto">
                            <CardContent className="p-4 lg:p-6">
                                <form onSubmit={handleTrack} className="flex flex-col md:flex-row gap-4">
                                    <div className="flex-1 relative group">
                                        <Box className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-violet-600 w-5 h-5 transition-colors" />
                                        <Input
                                            placeholder="Enter Logistical ID (e.g. SV-99210)"
                                            className="h-16 pl-14 pr-6 rounded-2xl bg-gray-50 border-none text-base font-bold placeholder:text-gray-300 focus:ring-2 focus:ring-violet-600 transition-all shadow-inner"
                                            value={trackingId}
                                            onChange={(e) => setTrackingId(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <Button
                                        disabled={loading}
                                        type="submit"
                                        className="h-16 px-10 bg-gray-900 hover:bg-violet-600 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-xl transition-all active:scale-[0.98] border-0 group"
                                    >
                                        {loading ? (
                                            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>Locate Asset <ArrowRight className="ml-3 w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                                        )}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {showStatus && (
                        <div className="space-y-8 animate-in slide-in-from-bottom-12 duration-1000">
                            {/* Order Status Overview */}
                            <Card className="border-0 shadow-xl rounded-[3rem] overflow-hidden bg-white border border-gray-100">
                                <CardContent className="p-0">
                                    <div className="bg-gray-50 p-10 lg:p-12 border-b border-gray-100">
                                        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                                            <div className="text-center md:text-left space-y-1">
                                                <p className="text-[10px] uppercase font-bold text-violet-400 tracking-[0.3em]">Logistical ID</p>
                                                <h3 className="text-3xl font-black text-gray-900 tracking-tighter italic">#SV-99210-PRO</h3>
                                            </div>
                                            <div className="flex items-center gap-4 bg-white px-8 py-4 rounded-2xl border border-violet-100 shadow-sm">
                                                <div className="relative">
                                                    <div className="w-3 h-3 bg-violet-600 rounded-full animate-ping opacity-40" />
                                                    <div className="absolute inset-0 w-3 h-3 bg-violet-600 rounded-full" />
                                                </div>
                                                <p className="text-violet-700 font-black text-sm uppercase tracking-[0.2em]">Asset in Transit</p>
                                            </div>
                                            <div className="text-center md:text-right space-y-1">
                                                <p className="text-[10px] uppercase font-bold text-violet-400 tracking-[0.3em]">Projected Arrival</p>
                                                <h3 className="text-3xl font-black text-gray-900 tracking-tighter italic">Jan 16, 2026</h3>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-10 lg:p-16">
                                        <div className="grid md:grid-cols-4 gap-4 mb-16 relative">
                                            {/* Horizontal line for progress */}
                                            <div className="hidden md:block absolute top-[27px] left-[50px] right-[50px] h-[2px] bg-gray-100" />
                                            <div className="hidden md:block absolute top-[27px] left-[50px] w-1/3 h-[2px] bg-violet-600" />

                                            {[
                                                { label: "Authorized", icon: ShieldCheck, active: true },
                                                { label: "Dispatched", icon: Box, active: true },
                                                { label: "In Transit", icon: Truck, active: true, pulse: true },
                                                { label: "Delivered", icon: CheckCircle2, active: false }
                                            ].map((step, i) => (
                                                <div key={i} className="flex flex-col items-center gap-4 relative z-10">
                                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-700 ${step.active ? 'bg-violet-600 text-white shadow-lg shadow-violet-100' : 'bg-gray-100 text-gray-300'}`}>
                                                        <step.icon className={`w-6 h-6 ${step.pulse ? 'animate-pulse' : ''}`} />
                                                    </div>
                                                    <p className={`text-[10px] font-black uppercase tracking-widest ${step.active ? 'text-gray-900' : 'text-gray-400'}`}>{step.label}</p>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="space-y-12 max-w-2xl mx-auto">
                                            <div className="flex items-center gap-4 text-left border-b border-gray-50 pb-4">
                                                <Badge className="bg-violet-50 text-violet-600 text-[10px] px-3">History</Badge>
                                                <h4 className="font-bold text-gray-900">Transit Logs</h4>
                                            </div>

                                            {[
                                                { status: "Hub Arrival", loc: "Sector 07 Redistribution Hub", date: "Jan 12, 04:15 PM", current: true },
                                                { status: "Package Verified", loc: "Central Distribution Center", date: "Jan 12, 11:30 AM", current: false },
                                                { status: "Dispatch Authorized", loc: "Origin Facility", date: "Jan 11, 09:00 AM", current: false }
                                            ].map((log, i) => (
                                                <div key={i} className="flex gap-6 items-start relative pl-10">
                                                    {/* Vertical line */}
                                                    {i < 2 && <div className="absolute left-[7px] top-6 bottom-[-48px] w-[2px] bg-gray-50" />}

                                                    <div className={`absolute left-0 top-1.5 w-4 h-4 rounded-full border-4 border-white shadow-sm ${log.current ? 'bg-violet-600' : 'bg-gray-200'}`} />

                                                    <div className="flex-1 space-y-1 text-left">
                                                        <div className="flex items-center justify-between">
                                                            <h5 className={`font-bold text-sm ${log.current ? 'text-violet-600' : 'text-gray-900'}`}>{log.status}</h5>
                                                            <span className="text-[10px] font-black text-gray-300">{log.date}</span>
                                                        </div>
                                                        <p className="text-gray-400 text-xs font-medium">{log.loc}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Additional Logistics Info */}
                            <div className="grid md:grid-cols-2 gap-8">
                                <Card className="border-0 shadow-sm rounded-3xl p-8 bg-white border border-gray-100 flex gap-6 items-start text-left">
                                    <div className="p-4 bg-violet-50 text-violet-600 rounded-2xl flex-shrink-0">
                                        <Globe className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 mb-1 leading-none">Destination Sector</h4>
                                        <p className="text-gray-400 text-xs font-medium leading-relaxed">
                                            Residency Road, Area 51, <br />
                                            Bangalore, KA 560001
                                        </p>
                                    </div>
                                </Card>
                                <Card className="border-0 shadow-sm rounded-3xl p-8 bg-white border border-gray-100 flex gap-6 items-start text-left">
                                    <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl flex-shrink-0">
                                        <Info className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 mb-1 leading-none">Logistics Support</h4>
                                        <p className="text-gray-400 text-xs font-medium leading-relaxed">
                                            Require manual intervention? <br />
                                            <button className="text-violet-600 font-bold hover:underline">Contact Fleet Manager</button>
                                        </p>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default TrackOrder;
