import React from 'react';
import Navigation from './Navigation';
import Footer from './Footer';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Globe,
    ShieldCheck,
    Zap,
    Package,
    Search,
    HelpCircle
} from "lucide-react";

const ShippingInfo = () => {
    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Navigation />

            <main className="flex-1 pt-20">
                {/* Hero Header */}
                <section className="bg-gray-50 border-b border-gray-100">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24">
                        <div className="max-w-3xl text-left">
                            <Badge className="bg-violet-100 text-violet-600 border-none font-bold text-[10px] tracking-[0.3em] px-4 py-1.5 rounded-full uppercase mb-6">
                                Shipping Policy
                            </Badge>
                            <h1 className="text-3xl md:text-5xl lg:text-7xl font-black text-gray-900 mb-6 md:mb-8 tracking-tight leading-[1.1]">
                                Fast & Reliable <br className="hidden md:block" />
                                <span className="text-violet-600">Global Delivery.</span>
                            </h1>
                            <p className="text-gray-500 text-base md:text-lg lg:text-xl font-medium leading-relaxed max-w-2xl">
                                We've built an efficient logistical network focused on speed, security, and transparency, ensuring your orders reach you in perfect condition.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="py-12 md:py-24 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {/* Features Grid and Efficiency Section */}
                        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-start mb-20 md:mb-32">
                            {/* Left Side: Features Cards */}
                            <div className="w-full lg:w-3/5 order-2 lg:order-1">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
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
                                        <div key={i} className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 hover:shadow-xl hover:shadow-gray-100/50 transition-all duration-300 group">
                                            <div className={`${item.bg} ${item.color} w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                                <item.icon className="w-5 h-5 md:w-6 md:h-6" />
                                            </div>
                                            <h4 className="font-bold text-gray-900 text-sm md:text-base mb-2">{item.title}</h4>
                                            <p className="text-gray-500 text-[10px] md:text-xs font-medium leading-relaxed">{item.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Right Side: Text and Stats */}
                            <div className="w-full lg:w-2/5 space-y-6 md:space-y-8 order-1 lg:order-2">
                                <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                                    Efficiency at <br className="hidden lg:block" />
                                    <span className="text-violet-600">Store Scale.</span>
                                </h3>
                                <p className="text-gray-500 font-medium text-base md:text-lg leading-relaxed">
                                    Our logistics center works around the clock to process your orders as quickly as possible. We partner with world-class carriers to maintain a 99.8% delivery accuracy rate.
                                </p>

                                <div className="grid grid-cols-2 gap-6 md:gap-8 pt-4">
                                    <div className="space-y-1 border-l-4 border-violet-600 pl-4 md:pl-6 text-left">
                                        <p className="text-2xl md:text-3xl font-black text-gray-900 tracking-tighter">28k+</p>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-violet-400">Pincodes</p>
                                    </div>
                                    <div className="space-y-1 border-l-4 border-violet-600 pl-4 md:pl-6 text-left">
                                        <p className="text-2xl md:text-3xl font-black text-gray-900 tracking-tighter">99.8%</p>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-violet-400">Accuracy</p>
                                    </div>
                                </div>

                                <div className="text-left pt-6">
                                    <Button
                                        onClick={() => window.location.href = '/track-order'}
                                        className="w-full md:w-auto h-14 px-10 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-violet-100 transition-all flex items-center justify-center gap-2 active:scale-95"
                                    >
                                        Track Your Order
                                        <Search className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Support Card */}
                        <div className="bg-gray-900 rounded-[2rem] md:rounded-[3rem] p-8 md:p-16 lg:p-24 text-white text-center relative overflow-hidden shadow-2xl">
                            <div className="absolute top-0 right-0 w-64 md:w-96 h-64 md:h-96 bg-violet-600/10 rounded-full blur-[80px] md:blur-[100px]" />
                            <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
                                <div className="w-12 h-12 md:w-16 md:h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6 md:mb-8">
                                    <HelpCircle className="w-6 h-6 md:w-8 md:h-8 text-violet-400" />
                                </div>
                                <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 tracking-tight leading-tight">
                                    Need Shipping <br className="md:hidden" />
                                    <span className="text-violet-400 italic font-black">Clarity?</span>
                                </h2>
                                <p className="text-gray-400 text-sm md:text-lg font-medium mb-8 md:mb-12 max-w-lg">
                                    For inquiries regarding complex shipments or delivery protocols, our support desk is available 24/7.
                                </p>
                                <Button
                                    onClick={() => window.location.href = '/contact'}
                                    className="w-full md:w-auto h-14 md:h-16 px-10 md:px-12 bg-white text-gray-900 hover:bg-violet-600 hover:text-white rounded-xl md:rounded-2xl text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95"
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
