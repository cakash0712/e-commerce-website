import React from 'react';
import Navigation from './Navigation';
import Footer from './Footer';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
    RefreshCw,
    ArrowRight,
    ShieldCheck,
    Clock,
    FileText,
    Package
} from "lucide-react";

const Returns = () => {
    const processes = [
        {
            icon: FileText,
            step: "01",
            title: "Request",
            desc: "Initiate your return request through your portal within 30 days of purchase."
        },
        {
            icon: Package,
            step: "02",
            title: "Pack",
            desc: "Secure the item in its original packaging with all tags intact."
        },
        {
            icon: RefreshCw,
            step: "03",
            title: "Refund",
            desc: "Your refund is processed once the item is inspected by our team."
        }
    ];

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Navigation />

            <main className="flex-1 pt-20">
                {/* Hero Header */}
                <section className="bg-gray-50 border-b border-gray-100">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24">
                        <div className="max-w-3xl text-left">
                            <Badge className="bg-violet-100 text-violet-600 border-none font-bold text-[10px] tracking-[0.3em] px-4 py-1.5 rounded-full uppercase mb-6">
                                Return Policy
                            </Badge>
                            <h1 className="text-3xl md:text-5xl lg:text-7xl font-black text-gray-900 mb-6 md:mb-8 tracking-tight leading-[1.1]">
                                Hassle-Free <br className="hidden md:block" />
                                <span className="text-violet-600">Returns & Exchanges.</span>
                            </h1>
                            <p className="text-gray-500 text-base md:text-lg lg:text-xl font-medium leading-relaxed max-w-2xl">
                                Your satisfaction is our priority. If you're not completely happy with your purchase, we've made the return process simple and transparent.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="py-12 md:py-24 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {/* Process Flow */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 lg:gap-12 mb-20 md:mb-32">
                            {processes.map((proc, i) => (
                                <div key={i} className="bg-white border border-gray-100 p-8 md:p-10 rounded-3xl md:rounded-[2.5rem] hover:shadow-xl hover:shadow-gray-100/50 transition-all duration-500 flex flex-col h-full shadow-sm group">
                                    <div className="flex justify-between items-start mb-8">
                                        <div className="w-14 h-14 md:w-16 md:h-16 bg-violet-50 text-violet-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <proc.icon className="w-6 h-6 md:w-7 md:h-7" />
                                        </div>
                                        <span className="text-3xl md:text-4xl font-black text-gray-100 uppercase tracking-tighter">{proc.step}</span>
                                    </div>
                                    <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4">{proc.title}</h3>
                                    <p className="text-gray-500 text-sm font-medium leading-relaxed">{proc.desc}</p>
                                </div>
                            ))}
                        </div>

                        {/* Details Grid */}
                        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-start mb-20 md:mb-32">
                            {/* Left Side: Guarantee and Micro-info */}
                            <div className="w-full lg:w-2/5 space-y-6 md:space-y-8 order-2 lg:order-1">
                                <div className="p-8 md:p-10 bg-gray-900 rounded-[2rem] md:rounded-[2.5rem] text-white space-y-6 shadow-2xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/10 rounded-full blur-2xl" />
                                    <ShieldCheck className="w-10 h-10 md:w-12 md:h-12 text-violet-400 relative z-10" />
                                    <h3 className="text-xl md:text-2xl font-bold relative z-10">Our Guarantee</h3>
                                    <p className="text-gray-400 text-sm leading-relaxed relative z-10">
                                        We stand behind every product we sell. If it doesn't meet your expectations, our team will work tirelessly to resolve the issue.
                                    </p>
                                    <ul className="space-y-4 pt-6 md:pt-8 border-t border-white/10 relative z-10">
                                        {[
                                            "30-Day Return Window",
                                            "Pre-Paid Return Labels",
                                            "24-Hour Exchange Processing"
                                        ].map((item, i) => (
                                            <li key={i} className="flex items-center gap-3 text-[10px] md:text-xs font-bold text-gray-300">
                                                <div className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="p-6 md:p-8 bg-violet-50 rounded-2xl md:rounded-[2rem] border border-violet-100 flex gap-4 items-start">
                                    <Clock className="w-5 h-5 md:w-6 md:h-6 text-violet-600 shrink-0" />
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-sm mb-1">Modern Processing</h4>
                                        <p className="text-gray-500 text-xs font-medium leading-relaxed">Most refunds are initiated within 24-48 hours of receiving your return.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Right Side: Guidelines */}
                            <div className="w-full lg:w-3/5 space-y-8 md:space-y-12 order-1 lg:order-2">
                                <div className="space-y-4">
                                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">Important <span className="text-violet-600">Guidelines.</span></h2>
                                    <p className="text-gray-500 text-base md:text-lg max-w-xl">
                                        To ensure a successful return, please follow these simple requirements for all items.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                                    {[
                                        { title: "Condition", desc: "Items must be unworn and in their original state with tags attached." },
                                        { title: "Documentation", desc: "Digital or physical receipt must accompany all returns." },
                                        { title: "Packing", desc: "Use original shipping box or durable packaging to prevent damage." },
                                        { title: "Excluded Items", desc: "Final sale items and custom products cannot be returned." }
                                    ].map((req, i) => (
                                        <div key={i} className="space-y-2 md:space-y-3 p-4 md:p-0 border-l-2 border-violet-100 md:border-l-0">
                                            <h4 className="font-bold text-gray-900 md:border-l-4 md:border-violet-600 md:pl-4 text-sm md:text-base">{req.title}</h4>
                                            <p className="text-gray-500 text-xs md:text-sm leading-relaxed md:pl-4">{req.desc}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-4 md:pt-6">
                                    <Link to="/contact">
                                        <Button className="w-full md:w-auto h-14 px-10 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-violet-100 transition-all flex items-center justify-center gap-2 active:scale-95">
                                            Need Help? Contact Support
                                            <ArrowRight className="w-4 h-4" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* CTA Section */}
                        <div className="bg-violet-600 rounded-[2.5rem] md:rounded-[3.5rem] p-10 md:p-20 text-white text-center relative overflow-hidden shadow-2xl">
                            <div className="absolute top-0 right-0 w-64 md:w-96 h-64 md:h-96 bg-white/10 rounded-full blur-[80px] md:blur-[120px]" />
                            <div className="relative z-10 max-w-2xl mx-auto space-y-6 md:space-y-8">
                                <h2 className="text-2xl md:text-4xl lg:text-5xl font-black tracking-tight leading-tight">Ready to Start a Return?</h2>
                                <p className="text-violet-100 text-sm md:text-lg font-medium opacity-90">
                                    Access your secure account dashboard to view your orders and initiate a return request.
                                </p>
                                <div className="pt-4">
                                    <Link to="/profile">
                                        <Button className="w-full md:w-auto h-14 md:h-16 px-10 md:px-12 bg-white text-violet-600 hover:bg-gray-900 hover:text-white rounded-xl md:rounded-[2rem] text-[10px] md:text-sm font-bold shadow-2xl transition-all active:scale-95 border-0">
                                            Go to My Account
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default Returns;
