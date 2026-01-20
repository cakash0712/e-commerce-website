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
        <div className="min-h-screen bg-white flex flex-col font-sans">
            <Navigation />

            <main className="flex-1 pt-20">
                {/* Hero Header */}
                <section className="bg-gray-50 border-b border-gray-100">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
                        <Badge className="bg-violet-100 text-violet-600 border-none font-bold text-[10px] tracking-[0.3em] px-4 py-1.5 rounded-full uppercase mb-6">
                            Order Tracking
                        </Badge>
                        <h1 className="text-4xl lg:text-6xl font-black text-gray-900 mb-6 tracking-tight">
                            Track Your <span className="text-violet-600">Shipment.</span>
                        </h1>
                        <p className="text-gray-500 text-lg font-medium max-w-2xl mx-auto mb-12">
                            Enter your tracking number below to get real-time updates on your order's status and expected delivery time.
                        </p>

                        <div className="max-w-2xl mx-auto">
                            <Card className="border border-gray-200 shadow-2xl rounded-2xl overflow-hidden bg-white p-2">
                                <form onSubmit={handleTrack} className="flex flex-col md:flex-row gap-2">
                                    <div className="flex-1 relative">
                                        <FileText className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <Input
                                            placeholder="Enter Tracking ID (e.g. ZP-99210)"
                                            className="h-16 pl-14 pr-6 rounded-xl bg-white border-0 text-base font-bold placeholder:text-gray-300 focus:ring-0 focus:bg-gray-50 transition-all outline-none"
                                            value={trackingId}
                                            onChange={(e) => setTrackingId(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <Button
                                        disabled={loading}
                                        type="submit"
                                        className="h-16 px-10 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-violet-100 transition-all active:scale-[0.98] border-0 flex items-center gap-2"
                                    >
                                        {loading ? (
                                            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>Track Now <ArrowRight className="w-4 h-4" /></>
                                        )}
                                    </Button>
                                </form>
                            </Card>
                        </div>
                    </div>
                </section>

                <section className="py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    {showStatus && (
                        <div className="space-y-8 animate-in slide-in-from-bottom duration-700">
                            {/* Order Status Card */}
                            <Card className="border border-gray-100 shadow-xl rounded-3xl overflow-hidden bg-white">
                                <CardContent className="p-0 text-left">
                                    <div className="bg-gray-50/50 p-10 border-b border-gray-100">
                                        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                                            <div className="text-center md:text-left">
                                                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1">Tracking Number</p>
                                                <h3 className="text-2xl font-black text-gray-900 tracking-tight">ZP-99210-2026</h3>
                                            </div>
                                            <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-2xl border border-gray-200 shadow-sm">
                                                <div className="relative">
                                                    <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping opacity-40" />
                                                    <div className="absolute inset-0 w-2.5 h-2.5 bg-green-500 rounded-full" />
                                                </div>
                                                <p className="text-gray-700 font-bold text-xs uppercase tracking-widest">In Transit</p>
                                            </div>
                                            <div className="text-center md:text-right">
                                                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1">Estimated Delivery</p>
                                                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Jan 22, 2026</h3>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-10 lg:p-16">
                                        {/* Delivery Stepper */}
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-20 relative text-center">
                                            <div className="hidden md:block absolute top-7 left-[10%] right-[10%] h-[2px] bg-gray-100" />
                                            <div className="hidden md:block absolute top-7 left-[10%] w-2/5 h-[2px] bg-violet-600" />

                                            {[
                                                { label: "Ordered", date: "Jan 18", icon: FileText, state: 'complete' },
                                                { label: "Processed", date: "Jan 18", icon: Box, state: 'complete' },
                                                { label: "In Transit", date: "Jan 19", icon: Truck, state: 'active' },
                                                { label: "Delivered", date: "Pending", icon: CheckCircle2, state: 'pending' }
                                            ].map((step, i) => (
                                                <div key={i} className="flex flex-col items-center gap-4 relative z-10">
                                                    <div className={`w-14 h-14 rounded-full flex items-center justify-center border-4 border-white shadow-lg transition-all ${step.state === 'complete' ? 'bg-violet-600 text-white' :
                                                        step.state === 'active' ? 'bg-white text-violet-600 border-violet-600' : 'bg-gray-50 text-gray-300'
                                                        }`}>
                                                        <step.icon className={`w-6 h-6 ${step.state === 'active' ? 'animate-pulse' : ''}`} />
                                                    </div>
                                                    <div>
                                                        <p className={`text-xs font-bold uppercase tracking-widest ${step.state !== 'pending' ? 'text-gray-900' : 'text-gray-400'}`}>{step.label}</p>
                                                        <p className="text-[10px] font-medium text-gray-400 mt-1 uppercase tracking-tight">{step.date}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Shipment Logs */}
                                        <div className="max-w-2xl mx-auto text-left">
                                            <div className="flex items-center justify-between mb-10 pb-4 border-b border-gray-100">
                                                <h4 className="font-bold text-gray-900 text-sm uppercase tracking-widest flex items-center gap-2">
                                                    <History className="w-4 h-4 text-gray-400" />
                                                    Shipment History
                                                </h4>
                                            </div>

                                            <div className="space-y-12">
                                                {[
                                                    { status: "Departure Authorized", loc: "Regional Logistic Center, Bangalore", date: "Jan 19, 2026 • 14:32", active: true },
                                                    { status: "Package Processed", loc: "Main Distribution Center", date: "Jan 18, 2026 • 11:20", active: false },
                                                    { status: "Order Confirmed", loc: "Zippy Fulfillment Hub", date: "Jan 18, 2026 • 09:15", active: false }
                                                ].map((log, i) => (
                                                    <div key={i} className="flex gap-8 items-start relative pl-4">
                                                        {i < 2 && <div className="absolute left-[31px] top-8 bottom-[-48px] w-[2px] border-l-2 border-dashed border-gray-200" />}

                                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border border-gray-200 ${log.active ? 'bg-violet-600 text-white border-violet-600 shadow-lg' : 'bg-white text-gray-400'}`}>
                                                            <MapPin className="w-4 h-4" />
                                                        </div>

                                                        <div className="flex-1">
                                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                                                                <h5 className={`font-bold text-sm uppercase tracking-tight ${log.active ? 'text-violet-600' : 'text-gray-900'}`}>
                                                                    {log.status}
                                                                </h5>
                                                                <span className="text-[10px] font-bold text-gray-400 uppercase">{log.date}</span>
                                                            </div>
                                                            <p className="text-gray-500 text-xs font-semibold uppercase tracking-widest flex items-center gap-1.5">
                                                                {log.loc}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="grid md:grid-cols-2 gap-8 text-left">
                                <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-8 flex gap-6 items-start">
                                    <div className="p-4 bg-violet-50 text-violet-600 rounded-xl">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Delivery Address</p>
                                        <h4 className="font-bold text-gray-900 text-sm">Residency Road, Area 51, Bangalore</h4>
                                        <p className="text-gray-500 text-xs font-medium mt-1">Karnataka, India 560001</p>
                                    </div>
                                </div>
                                <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-8 flex gap-6 items-start">
                                    <div className="p-4 bg-violet-50 text-violet-600 rounded-xl">
                                        <Truck className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Carrier Information</p>
                                        <h4 className="font-bold text-gray-900 text-sm">Zippy Logistics Express</h4>
                                        <button className="text-violet-600 font-bold text-[10px] uppercase tracking-widest mt-2 hover:underline">Track on Carrier Site</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default TrackOrder;
