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
    Globe,
    Building2,
    FileText,
    History
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
        <div className="min-h-screen bg-[#fafbfc] flex flex-col font-sans">
            <Navigation />

            <main className="flex-1 pt-32 pb-24">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Professional Search Header */}
                    <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <Badge className="bg-slate-100 text-slate-800 border-slate-200 font-black text-[9px] tracking-[0.2em] px-3 py-1 rounded-sm uppercase mb-6">
                            LOGISTICS MONITORING SYSTEM v4.2
                        </Badge>
                        <h1 className="text-4xl lg:text-6xl font-black text-slate-900 mb-6 tracking-tight">
                            Consignment <span className="text-violet-600">Verification.</span>
                        </h1>
                        <p className="text-slate-500 text-lg font-medium max-w-2xl mx-auto mb-12">
                            Access our global fulfillment orchestration network to monitor your shipment's
                            real-time progression and delivery authentication.
                        </p>

                        <Card className="border-0 shadow-2xl rounded-2xl overflow-hidden bg-white border border-slate-100 max-w-2xl mx-auto">
                            <CardContent className="p-2">
                                <form onSubmit={handleTrack} className="flex flex-col md:flex-row gap-2">
                                    <div className="flex-1 relative group">
                                        <FileText className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-violet-600 w-5 h-5 transition-colors" />
                                        <Input
                                            placeholder="Consignment Reference ID (e.g. ZP-99210)"
                                            className="h-16 pl-14 pr-6 rounded-xl bg-white border-0 text-base font-bold placeholder:text-slate-300 focus:ring-0 focus:bg-slate-50 transition-all"
                                            value={trackingId}
                                            onChange={(e) => setTrackingId(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <Button
                                        disabled={loading}
                                        type="submit"
                                        className="h-16 px-10 bg-slate-900 hover:bg-violet-600 text-white rounded-xl text-xs font-black uppercase tracking-[0.2em] shadow-lg transition-all active:scale-[0.98] border-0 group"
                                    >
                                        {loading ? (
                                            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>Track Shipment <ArrowRight className="ml-3 w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                                        )}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {showStatus && (
                        <div className="space-y-8 animate-in slide-in-from-bottom-12 duration-1000">
                            {/* Order Status Overview */}
                            <Card className="border-0 shadow-xl rounded-3xl overflow-hidden bg-white border border-slate-100">
                                <CardContent className="p-0">
                                    <div className="bg-slate-50 p-10 lg:p-12 border-b border-slate-200">
                                        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                                            <div className="text-center md:text-left space-y-1">
                                                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-[0.2em]">Shipment Reference</p>
                                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">ZP-99210-2026-HQ</h3>
                                            </div>
                                            <div className="flex items-center gap-4 bg-white px-8 py-4 rounded-xl border border-slate-200 shadow-sm">
                                                <div className="relative">
                                                    <div className="w-3 h-3 bg-emerald-500 rounded-full animate-ping opacity-40" />
                                                    <div className="absolute inset-0 w-3 h-3 bg-emerald-500 rounded-full" />
                                                </div>
                                                <p className="text-slate-800 font-black text-xs uppercase tracking-[0.2em]">Operational Pulse: Active</p>
                                            </div>
                                            <div className="text-center md:text-right space-y-1">
                                                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-[0.2em]">Estimated Fulfillment</p>
                                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Jan 22, 2026</h3>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-10 lg:p-16">
                                        {/* Professional Stepper */}
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-20 relative">
                                            <div className="hidden md:block absolute top-[28px] left-[10%] right-[10%] h-[2px] bg-slate-100" />
                                            <div className="hidden md:block absolute top-[28px] left-[10%] w-2/5 h-[2px] bg-violet-600" />

                                            {[
                                                { label: "Ordered", sub: "Signature Verified", icon: FileText, state: 'complete' },
                                                { label: "Processed", sub: "QC Standard Check", icon: Box, state: 'complete' },
                                                { label: "Dispatched", sub: "Carrier Assigned", icon: Truck, state: 'active' },
                                                { label: "Delivered", sub: "ID Required", icon: CheckCircle2, state: 'pending' }
                                            ].map((step, i) => (
                                                <div key={i} className="flex flex-col items-center text-center gap-4 relative z-10">
                                                    <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-700 border-4 border-white shadow-xl ${step.state === 'complete' ? 'bg-violet-600 text-white' :
                                                            step.state === 'active' ? 'bg-white text-violet-600 border-violet-600' : 'bg-slate-50 text-slate-300'
                                                        }`}>
                                                        <step.icon className={`w-6 h-6 ${step.state === 'active' ? 'animate-pulse' : ''}`} />
                                                    </div>
                                                    <div>
                                                        <p className={`text-[11px] font-black uppercase tracking-widest ${step.state !== 'pending' ? 'text-slate-900' : 'text-slate-400'}`}>{step.label}</p>
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-1">{step.sub}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="max-w-2xl mx-auto">
                                            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
                                                <h4 className="font-black text-slate-900 text-sm uppercase tracking-widest flex items-center gap-2">
                                                    <History className="w-4 h-4 text-slate-400" />
                                                    Chain of Custody
                                                </h4>
                                                <Badge className="bg-slate-100 text-slate-500 text-[9px] px-2 font-black uppercase tracking-widest">Internal logs</Badge>
                                            </div>

                                            <div className="space-y-10">
                                                {[
                                                    { status: "Departure Authorized", loc: "Regional Logistic Center - RLC-99", date: "Jan 19, 2026 • 14:32", active: true },
                                                    { status: "Package Consolidating", loc: "Main Distribution Hub", date: "Jan 18, 2026 • 11:20", active: false },
                                                    { status: "Verification Complete", loc: "Processing Facility B-12", date: "Jan 18, 2026 • 09:15", active: false }
                                                ].map((log, i) => (
                                                    <div key={i} className="flex gap-8 items-start relative lg:pl-4">
                                                        {i < 2 && <div className="absolute left-[31px] lg:left-[47px] top-8 bottom-[-40px] w-[2px] border-l-2 border-dashed border-slate-200" />}

                                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border border-slate-200 ${log.active ? 'bg-violet-600 text-white border-violet-600 shadow-lg shadow-violet-100' : 'bg-white text-slate-400'}`}>
                                                            <MapPin className="w-4 h-4" />
                                                        </div>

                                                        <div className="flex-1 text-left pb-1">
                                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                                                                <h5 className={`font-black text-sm uppercase tracking-tight ${log.active ? 'text-violet-600' : 'text-slate-900'}`}>
                                                                    {log.status}
                                                                </h5>
                                                                <span className="text-[10px] font-bold text-slate-400 uppercase">{log.date}</span>
                                                            </div>
                                                            <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest flex items-center gap-1.5">
                                                                <Building2 className="w-3 h-3" /> {log.loc}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="grid md:grid-cols-2 gap-8">
                                <Card className="border-0 shadow-sm rounded-2xl p-8 bg-white border border-slate-100 flex gap-6 items-start text-left">
                                    <div className="p-4 bg-slate-50 text-slate-900 rounded-xl border border-slate-200">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Authenticated Destination</p>
                                        <h4 className="font-bold text-slate-900 text-sm">Residency Road, Area 51, Bangalore</h4>
                                        <p className="text-slate-400 text-xs font-medium mt-1">Karnataka, India 560001</p>
                                    </div>
                                </Card>
                                <Card className="border-0 shadow-sm rounded-2xl p-8 bg-white border border-slate-100 flex gap-6 items-start text-left">
                                    <div className="p-4 bg-slate-50 text-slate-900 rounded-xl border border-slate-200">
                                        <Building2 className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Assigned Carrier</p>
                                        <h4 className="font-bold text-slate-900 text-sm">Zippy Logistics Express Limited</h4>
                                        <button className="text-violet-600 font-black text-[10px] uppercase tracking-widest mt-2 hover:underline">Contact Handler</button>
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
