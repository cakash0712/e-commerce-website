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
    HelpCircle
} from "lucide-react";

const ShippingInfo = () => {
    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Navigation />

            <main className="flex-1 pt-20">
                {/* Hero Header */}
                <section className="bg-gray-50 border-b border-gray-100">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
                        <div className="max-w-3xl">
                            <Badge className="bg-violet-100 text-violet-600 border-none font-bold text-[10px] tracking-[0.3em] px-4 py-1.5 rounded-full uppercase mb-6">
                                Shipping Policy
                            </Badge>
                            <h1 className="text-4xl lg:text-7xl font-bold text-gray-900 mb-8 tracking-tight leading-tight">
                                Fast & Reliable <br />
                                <span className="text-violet-600">Global Delivery.</span>
                            </h1>
                            <p className="text-gray-500 text-lg lg:text-xl font-medium leading-relaxed max-w-2xl">
                                We've built an efficient logistical network focused on speed, security, and transparency, ensuring your orders reach you in perfect condition.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {/* Features Grid */}
                        <div className="grid lg:grid-cols-2 gap-12 items-center mb-32 text-left">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {[
                                    {
                                        icon: Zap,
                                        title: "Express Delivery",
                                        desc: "Standard 24-48 hour delivery in most metropolitan areas.",
                                        color: "text-violet-600",
                                        bg: "bg-violet-50"
                                    },
                                    {
                                        icon: ShieldCheck,
                                        title: "Insured Shipping",
                                        desc: "Every package is fully insured and packed with sustainable materials.",
                                        color: "text-violet-600",
                                        bg: "bg-violet-50"
                                    },
                                    {
                                        icon: Globe,
                                        title: "Worldwide Reach",
                                        desc: "Shipping to over 50 countries with end-to-end tracking.",
                                        color: "text-violet-600",
                                        bg: "bg-violet-50"
                                    },
                                    {
                                        icon: Package,
                                        title: "Smart Tracking",
                                        desc: "Real-time updates delivered straight to your account and phone.",
                                        color: "text-violet-600",
                                        bg: "bg-violet-50"
                                    }
                                ].map((item, i) => (
                                    <div key={i} className="bg-white p-8 rounded-3xl border border-gray-100 hover:shadow-lg transition-all">
                                        <div className={`${item.bg} ${item.color} w-14 h-14 rounded-2xl flex items-center justify-center mb-6`}>
                                            <item.icon className="w-6 h-6" />
                                        </div>
                                        <h4 className="font-bold text-gray-900 mb-2">{item.title}</h4>
                                        <p className="text-gray-500 text-xs font-medium leading-relaxed">{item.desc}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="lg:pl-12 space-y-8">
                                <h3 className="text-3xl font-bold text-gray-900">Efficiency at <span className="text-violet-600">Store Scale.</span></h3>
                                <p className="text-gray-500 font-medium text-lg leading-relaxed">
                                    Our logistics center works around the clock to process your orders as quickly as possible. We partner with world-class carriers to maintain a 99.8% delivery accuracy rate.
                                </p>
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-1 border-l-4 border-violet-600 pl-6 text-left">
                                        <p className="text-3xl font-black text-gray-900 tracking-tighter">28k+</p>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-violet-400">Pincodes Served</p>
                                    </div>
                                    <div className="space-y-1 border-l-4 border-violet-600 pl-6 text-left">
                                        <p className="text-3xl font-black text-gray-900 tracking-tighter">99.8%</p>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-violet-400">On-Time Delivery</p>
                                    </div>
                                </div>
                                <div className="text-left pt-4">
                                    <Button
                                        onClick={() => window.location.href = '/track'}
                                        className="h-14 px-10 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-violet-100 transition-all flex items-center gap-2"
                                    >
                                        Track Your Order
                                        <Search className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Service Matrix */}
                        <div className="mb-32">
                            <div className="text-center mb-16">
                                <h2 className="text-3xl font-bold text-gray-900">Delivery <span className="text-violet-600">Tiers.</span></h2>
                            </div>

                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
                                {[
                                    {
                                        tier: "Standard",
                                        price: "Free",
                                        condition: "Orders above ₹999",
                                        time: "3-5 Business Days",
                                        features: ["Tracked shipping", "Secure packaging", "Easy returns"]
                                    },
                                    {
                                        tier: "Priority",
                                        price: "₹149",
                                        condition: "Orders below ₹999",
                                        time: "24-48 Hours",
                                        features: ["Priority handling", "Live tracking", "Premium support"],
                                        active: true
                                    },
                                    {
                                        tier: "Business",
                                        price: "Custom",
                                        condition: "For Corporate Orders",
                                        time: "Scheduled Delivery",
                                        features: ["Bulk handling", "Custom documents", "Account manager"]
                                    }
                                ].map((tier, i) => (
                                    <div key={i} className={`bg-white border border-gray-100 rounded-[2.5rem] p-10 flex flex-col ${tier.active ? 'shadow-2xl shadow-violet-100 border-violet-200' : 'shadow-sm'}`}>
                                        <div className="flex justify-between items-start mb-8">
                                            <div>
                                                <h4 className="font-bold text-gray-900 text-xl mb-1">{tier.tier}</h4>
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-violet-600">{tier.condition}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-black text-gray-900">{tier.price}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 bg-gray-50 p-4 rounded-xl mb-8">
                                            <Clock className="w-4 h-4 text-violet-600" />
                                            <span className="text-xs font-bold text-gray-700 uppercase">{tier.time}</span>
                                        </div>

                                        <ul className="space-y-4 mb-10 flex-1">
                                            {tier.features.map((feature, j) => (
                                                <li key={j} className="flex items-center gap-3 text-sm font-medium text-gray-500">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-violet-300" />
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>

                                        <Button className={`w-full h-14 rounded-2xl text-xs font-bold uppercase tracking-[0.1em] transition-all ${tier.active ? 'bg-violet-600 text-white hover:bg-violet-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 shadow-none'}`}>
                                            Select Tier
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Support Card */}
                        <div className="bg-gray-900 rounded-[3rem] p-12 lg:p-24 text-white text-center relative overflow-hidden shadow-2xl">
                            <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/10 rounded-full blur-[100px]" />
                            <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
                                <HelpCircle className="w-12 h-12 text-violet-400 mb-8" />
                                <h2 className="text-3xl lg:text-5xl font-bold mb-6 tracking-tight">Need Shipping <span className="text-violet-400 italic font-black">Clarity?</span></h2>
                                <p className="text-gray-400 text-lg font-medium mb-12">
                                    For inquiries regarding complex shipments or delivery protocols, our support desk is available 24/7 to assist you.
                                </p>
                                <Button
                                    onClick={() => window.location.href = '/contact'}
                                    className="h-16 px-12 bg-white text-gray-900 hover:bg-violet-600 hover:text-white rounded-2xl text-xs font-bold uppercase tracking-[0.2em] transition-all shadow-xl"
                                >
                                    Contact Support
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default ShippingInfo;
