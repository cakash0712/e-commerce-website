import React from 'react';
import Navigation from './Navigation';
import Footer from './Footer';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Truck,
    Globe,
    ShieldCheck,
    Zap,
    Package,
    MapPin,
    Clock,
    Search,
    ArrowRight,
    ShieldAlert,
    HelpCircle
} from "lucide-react";

const ShippingInfo = () => {
    return (
        <div className="min-h-screen bg-[#fcfdfe] flex flex-col">
            <Navigation />

            <main className="flex-1 pt-32 pb-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Editorial Header */}
                    <div className="max-w-3xl mb-20 animate-in fade-in slide-in-from-left duration-700">
                        <Badge className="bg-violet-50 text-violet-600 border-none font-bold text-[10px] tracking-[0.3em] px-4 py-1.5 rounded-full uppercase mb-6">
                            Logistics Protocol
                        </Badge>
                        <h1 className="text-4xl lg:text-7xl font-bold text-gray-900 mb-8 tracking-tighter italicLeading leading-tight">
                            Global Delivery <br />
                            <span className="text-violet-600 font-black italic">Network.</span>
                        </h1>
                        <p className="text-gray-500 text-lg lg:text-xl font-medium leading-relaxed max-w-2xl text-left italicLeading">
                            We operate a multi-layered logistical infrastructure designed to ensure
                            every artifact reaches its destination with medical-grade precision and speed.
                        </p>
                    </div>

                    {/* Operational Capabilities */}
                    <div className="grid lg:grid-cols-2 gap-12 items-center mb-32">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-in slide-in-from-bottom duration-700">
                            {[
                                {
                                    icon: Zap,
                                    title: "Express Stream",
                                    desc: "Priority handling within 24-48 hours in all metropolitan sectors.",
                                    color: "text-violet-600",
                                    bg: "bg-violet-50"
                                },
                                {
                                    icon: ShieldCheck,
                                    title: "Secured Transit",
                                    desc: "Fully insured shipping using shock-absorbent military-grade packaging.",
                                    color: "text-emerald-600",
                                    bg: "bg-emerald-50"
                                },
                                {
                                    icon: Globe,
                                    title: "Global Reach",
                                    desc: "Direct shipping to over 50 countries with automated customs clearing.",
                                    color: "text-indigo-600",
                                    bg: "bg-indigo-50"
                                },
                                {
                                    icon: Package,
                                    title: "Real-time Hub",
                                    desc: "Granular tracking updates from dispatch to the final destination point.",
                                    color: "text-slate-600",
                                    bg: "bg-slate-50"
                                }
                            ].map((item, i) => (
                                <Card key={i} className="border-0 shadow-sm rounded-3xl p-8 bg-white border border-gray-100/50 hover:shadow-lg transition-all">
                                    <div className={`${item.bg} ${item.color} w-14 h-14 rounded-2xl flex items-center justify-center mb-6`}>
                                        <item.icon className="w-6 h-6" />
                                    </div>
                                    <h4 className="font-bold text-gray-900 mb-2">{item.title}</h4>
                                    <p className="text-gray-400 text-xs font-medium leading-relaxed">{item.desc}</p>
                                </Card>
                            ))}
                        </div>

                        {/* Right Content: Visual Statistics */}
                        <div className="lg:pl-12 space-y-10 animate-in slide-in-from-right duration-700">
                            <div className="space-y-4">
                                <h3 className="text-2xl font-bold text-gray-900 tracking-tight">Institutional <span className="text-violet-600">Scale.</span></h3>
                                <p className="text-gray-500 font-medium text-sm leading-relaxed">
                                    Our logistical ecosystem is monitored 24/7 by a dedicated control team, ensuring
                                    optimized route planning and minimal transit interference across our entire network.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-1 border-l-4 border-violet-600 pl-6">
                                    <p className="text-3xl font-black text-gray-900 tracking-tighter">28k+</p>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-violet-400">Regional Sectors</p>
                                </div>
                                <div className="space-y-1 border-l-4 border-indigo-600 pl-6">
                                    <p className="text-3xl font-black text-gray-900 tracking-tighter">99.8%</p>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Delivery Accuracy</p>
                                </div>
                            </div>

                            <Button
                                onClick={() => window.location.href = '/shop'}
                                className="h-14 px-8 bg-gray-900 hover:bg-violet-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all group"
                            >
                                Track Current Request
                                <Search className="w-4 h-4 ml-3 group-hover:scale-110 transition-transform" />
                            </Button>
                        </div>
                    </div>

                    {/* Rate Matrix - Formal Pricing Table */}
                    <div className="mb-32">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Tiered <span className="text-violet-600 underline underline-offset-8 decoration-violet-100">Service matrix.</span></h2>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                {
                                    tier: "Standard Transit",
                                    price: "₹0",
                                    condition: "Orders above ₹999",
                                    time: "3-5 Business Days",
                                    features: ["End-to-end tracking", "Insured packaging", "Secure delivery"]
                                },
                                {
                                    tier: "Priority Priority",
                                    price: "₹149",
                                    condition: "Flat Rate Policy",
                                    time: "24-48 Hour Window",
                                    features: ["Priority handling", "VIP dispatch queue", "Enhanced tracking"],
                                    active: true
                                },
                                {
                                    tier: "Institutional Support",
                                    price: "PO Only",
                                    condition: "Corporate Clients",
                                    time: "Custom Timelines",
                                    features: ["Bulk handling", "Custom documentation", "Dedicated manager"]
                                }
                            ].map((tier, i) => (
                                <Card key={i} className={`border border-gray-100 rounded-[2.5rem] overflow-hidden ${tier.active ? 'shadow-2xl shadow-violet-100 scale-105 relative z-10' : 'shadow-sm'}`}>
                                    {tier.active && <div className="h-2 bg-violet-600" />}
                                    <CardContent className="p-10 text-left">
                                        <div className="flex justify-between items-start mb-8">
                                            <div>
                                                <h4 className="font-bold text-gray-900 text-lg mb-1">{tier.tier}</h4>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-violet-400">{tier.condition}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-black text-gray-900">{tier.price}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-xl mb-8">
                                            <Clock className="w-4 h-4 text-violet-600" />
                                            <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">{tier.time}</span>
                                        </div>

                                        <ul className="space-y-4 mb-8">
                                            {tier.features.map((feature, j) => (
                                                <li key={j} className="flex items-center gap-3 text-xs font-semibold text-gray-500">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-violet-200" />
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>

                                        <Button className={`w-full h-14 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${tier.active ? 'bg-violet-600 text-white hover:bg-violet-700' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>
                                            Select Service
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Support Section */}
                    <Card className="border-0 shadow-2xl rounded-[3rem] bg-gray-900 text-white overflow-hidden p-12 lg:p-24 relative group">
                        <div className="absolute top-0 right-0 -m-12 w-96 h-96 bg-violet-600/10 rounded-full blur-[100px] transition-transform group-hover:scale-110 duration-1000" />
                        <div className="relative z-10 flex flex-col items-center text-center">
                            <HelpCircle className="w-12 h-12 text-violet-400 mb-8" />
                            <h2 className="text-3xl lg:text-5xl font-bold mb-6 tracking-tight">Need Logistical <span className="text-violet-400 italic font-black">Clarity?</span></h2>
                            <p className="text-gray-400 text-lg font-medium max-w-2xl mb-12">
                                For inquiries regarding complex shipments, customs documentation, or bulk institutional
                                delivery protocols, our global operations desk is available 24/7.
                            </p>
                            <Button
                                onClick={() => window.location.href = '/contact'}
                                className="h-16 px-12 bg-white text-gray-900 hover:bg-violet-600 hover:text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-2xl shadow-white/5 transition-all"
                            >
                                Initiate Direct Support
                            </Button>
                        </div>
                    </Card>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ShippingInfo;
