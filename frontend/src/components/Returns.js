import React from 'react';
import Navigation from './Navigation';
import Footer from './Footer';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
    RotateCcw,
    CheckCircle2,
    RefreshCw,
    ArrowRight,
    ShieldCheck,
    Clock,
    FileText,
    Truck,
    Package,
    Undo2
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
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
                        <div className="max-w-3xl">
                            <Badge className="bg-violet-100 text-violet-600 border-none font-bold text-[10px] tracking-[0.3em] px-4 py-1.5 rounded-full uppercase mb-6">
                                Return Policy
                            </Badge>
                            <h1 className="text-4xl lg:text-7xl font-bold text-gray-900 mb-8 tracking-tight leading-tight">
                                Hassle-Free <br />
                                <span className="text-violet-600">Returns & Exchanges.</span>
                            </h1>
                            <p className="text-gray-500 text-lg lg:text-xl font-medium leading-relaxed max-w-2xl">
                                Your satisfaction is our priority. If you're not completely happy with your purchase, we've made the return process simple and transparent.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {/* Process Flow */}
                        <div className="grid lg:grid-cols-3 gap-12 mb-32 text-left">
                            {processes.map((proc, i) => (
                                <div key={i} className="bg-white border border-gray-100 p-10 rounded-[2.5rem] hover:shadow-xl transition-all duration-500 flex flex-col h-full shadow-sm">
                                    <div className="flex justify-between items-start mb-8">
                                        <div className="w-16 h-16 bg-violet-50 text-violet-600 rounded-2xl flex items-center justify-center">
                                            <proc.icon className="w-7 h-7" />
                                        </div>
                                        <span className="text-4xl font-black text-gray-100 uppercase tracking-tighter">{proc.step}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-4">{proc.title}</h3>
                                    <p className="text-gray-500 text-sm font-medium leading-relaxed">{proc.desc}</p>
                                </div>
                            ))}
                        </div>

                        {/* Details Grid */}
                        <div className="grid lg:grid-cols-12 gap-12 items-start mb-24 text-left">
                            <div className="lg:col-span-12 lg:col-span-5 space-y-8">
                                <div className="p-8 bg-gray-900 rounded-[2.5rem] text-white space-y-6 shadow-2xl">
                                    <ShieldCheck className="w-12 h-12 text-violet-400" />
                                    <h3 className="text-2xl font-bold">Our Guarantee</h3>
                                    <p className="text-gray-400 text-sm leading-relaxed">
                                        We stand behind every product we sell. If it doesn't meet your expectations, our team will work tirelessly to resolve the issue through a refund or exchange.
                                    </p>
                                    <ul className="space-y-4 pt-4 border-t border-white/10">
                                        {[
                                            "30-Day Return Window",
                                            "Pre-Paid Return Labels",
                                            "24-Hour Exchange Processing"
                                        ].map((item, i) => (
                                            <li key={i} className="flex items-center gap-3 text-xs font-bold text-gray-300">
                                                <div className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="p-8 bg-violet-50 rounded-[2rem] border border-violet-100 flex gap-4 items-start">
                                    <Clock className="w-6 h-6 text-violet-600 shrink-0" />
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-sm mb-1">Modern Processing</h4>
                                        <p className="text-gray-500 text-xs font-medium leading-relaxed">Most refunds are initiated within 24-48 hours of receiving your return.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-12 lg:col-span-7 space-y-12 pl-lg-12">
                                <div className="space-y-4">
                                    <h2 className="text-3xl font-bold text-gray-900">Important <span className="text-violet-600">Guidelines.</span></h2>
                                    <p className="text-gray-500 text-lg">
                                        To ensure a successful return, please follow these simple requirements for all items.
                                    </p>
                                </div>

                                <div className="grid sm:grid-cols-2 gap-8">
                                    {[
                                        { title: "Condition", desc: "Items must be unworn and in their original state with tags attached." },
                                        { title: "Documentation", desc: "Digital or physical receipt must accompany all returns." },
                                        { title: "Packing", desc: "Use the original shipping box or durable packaging to prevent damage." },
                                        { title: "Excluded Items", desc: "Final sale items and custom products cannot be returned." }
                                    ].map((req, i) => (
                                        <div key={i} className="space-y-3">
                                            <h4 className="font-bold text-gray-900 border-l-3 border-violet-600 pl-4">{req.title}</h4>
                                            <p className="text-gray-500 text-sm leading-relaxed pl-4">{req.desc}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-4">
                                    <Link to="/contact">
                                        <Button className="h-14 px-10 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-violet-100 transition-all flex items-center gap-2">
                                            Need Help? Contact Support
                                            <ArrowRight className="w-4 h-4" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* CTA Section */}
                        <div className="bg-violet-600 rounded-[3.5rem] p-12 lg:p-20 text-white text-center relative overflow-hidden shadow-2xl">
                            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[120px]" />
                            <div className="relative z-10 max-w-2xl mx-auto space-y-8">
                                <h2 className="text-3xl lg:text-5xl font-black tracking-tight leading-tight">Ready to Start a Return?</h2>
                                <p className="text-violet-100 text-lg font-medium opacity-90">
                                    Access your secure account dashboard to view your orders and initiate a return request.
                                </p>
                                <div className="pt-4">
                                    <Link to="/profile">
                                        <Button className="h-16 px-12 bg-white text-violet-600 hover:bg-gray-900 hover:text-white rounded-[2rem] text-sm font-bold shadow-2xl transition-all active:scale-95 border-0">
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
