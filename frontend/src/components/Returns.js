import React from 'react';
import Navigation from './Navigation';
import Footer from './Footer';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
    RotateCcw,
    AlertCircle,
    CheckCircle2,
    RefreshCw,
    Undo2,
    ArrowRight,
    ShieldCheck,
    Clock,
    FileText,
    Truck
} from "lucide-react";

const Returns = () => {
    const processes = [
        {
            icon: FileText,
            step: "01",
            title: "Authorization",
            desc: "Initiate your formal return request through the customer dashboard within the 30-day window."
        },
        {
            icon: Package,
            step: "02",
            title: "Preparation",
            desc: "Secure the artifact in its original casing and attach the provided authorized shipping label."
        },
        {
            icon: RefreshCw,
            step: "03",
            title: "Reimbursement",
            desc: "Financial restitution is triggered immediately upon verified carrier pickup and scan."
        }
    ];

    return (
        <div className="min-h-screen bg-[#fcfdfe] flex flex-col">
            <Navigation />

            <main className="flex-1 pt-32 pb-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Professional Header */}
                    <div className="max-w-3xl mb-24 animate-in fade-in slide-in-from-left duration-700">
                        <Badge className="bg-violet-50 text-violet-600 border-none font-bold text-[10px] tracking-[0.3em] px-4 py-1.5 rounded-full uppercase mb-6">
                            Satisfaction Protocol
                        </Badge>
                        <h1 className="text-4xl lg:text-7xl font-bold text-gray-900 mb-8 tracking-tighter italicLeading leading-tight">
                            Returns & <br />
                            <span className="text-violet-600 font-black italic">Exchanges.</span>
                        </h1>
                        <p className="text-gray-500 text-lg lg:text-xl font-medium leading-relaxed max-w-2xl text-left italicLeading">
                            Our systematic fulfillment cycle includes a comprehensive restitution policy,
                            ensuring every transaction meets our institutional quality standards.
                        </p>
                    </div>

                    {/* Operational Flow */}
                    <div className="grid lg:grid-cols-3 gap-12 mb-32">
                        {processes.map((proc, i) => (
                            <div key={i} className="relative group">
                                <Card className="border-0 shadow-sm rounded-[2.5rem] bg-white border border-gray-100 p-10 hover:shadow-xl transition-all duration-500 flex flex-col h-full">
                                    <div className="flex justify-between items-start mb-8">
                                        <div className="w-16 h-16 bg-violet-50 text-violet-600 rounded-2xl flex items-center justify-center group-hover:bg-violet-600 group-hover:text-white transition-all duration-500">
                                            <proc.icon className="w-7 h-7" />
                                        </div>
                                        <span className="text-4xl font-black text-gray-100 group-hover:text-violet-100 transition-colors uppercaseLeading">{proc.step}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-4">{proc.title}</h3>
                                    <p className="text-gray-500 text-sm font-medium leading-relaxed">{proc.desc}</p>
                                </Card>
                            </div>
                        ))}
                    </div>

                    {/* Policy Matrix */}
                    <div className="grid lg:grid-cols-12 gap-12 items-start mb-24">
                        <div className="lg:col-span-5 space-y-8 animate-in slide-in-from-bottom duration-700">
                            <div className="p-8 bg-gray-900 rounded-[2.5rem] text-white space-y-6 shadow-2xl shadow-gray-200">
                                <ShieldCheck className="w-12 h-12 text-violet-400" />
                                <h3 className="text-2xl font-bold">Institutional Guarantee</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    Every ShopVerse artifact is backed by our verified assurance policy. If your
                                    procurement does not align with your technical requirements, our team will
                                    facilitate an immediate resolution.
                                </p>
                                <ul className="space-y-4 pt-4 border-t border-white/10">
                                    {[
                                        "30-Day Evaluation Period",
                                        "Pre-Paid Return Infrastructure",
                                        "Express Exchange Processing"
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-center gap-3 text-xs font-semibold text-gray-300">
                                            <div className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <Card className="border-0 shadow-sm rounded-[2rem] bg-violet-50/50 p-8 border border-violet-100/50">
                                <div className="flex gap-4 items-start">
                                    <Clock className="w-6 h-6 text-violet-600 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-sm mb-1">Restitution Window</h4>
                                        <p className="text-gray-500 text-xs font-medium">Standard processing completes within 24-48 hours of asset verification.</p>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        <div className="lg:col-span-7 space-y-12">
                            <div className="text-left space-y-4">
                                <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Technical <span className="text-violet-600 italic font-black">Requirements.</span></h2>
                                <p className="text-gray-500 text-sm font-medium leading-relaxed">
                                    To ensure successful restitution, artifacts must be surrendered in their
                                    original operational state with all institutional tagging intact.
                                </p>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-8">
                                {[
                                    { title: "Condition", desc: "Items must remain in unworn, unwashed states with original security seals." },
                                    { title: "Documentation", desc: "Original digital receipt or order authorization is required for processing." },
                                    { title: "Packaging", desc: "Use the reinforced outer casing provided to prevent transit interference." },
                                    { title: "Exclusions", desc: "Restricted data modules and customized artifacts are non-returnable." }
                                ].map((req, i) => (
                                    <div key={i} className="space-y-3">
                                        <h4 className="font-bold text-gray-900 border-l-2 border-violet-600 pl-4">{req.title}</h4>
                                        <p className="text-gray-400 text-xs font-medium leading-relaxed pl-4">{req.desc}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-8">
                                <Link to="/contact">
                                    <Button className="h-14 px-8 bg-gray-900 hover:bg-violet-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all group">
                                        Support Intervention
                                        <ArrowRight className="w-4 h-4 ml-3 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Institutional CTA */}
                    <div className="bg-violet-600 rounded-[3.5rem] p-8 lg:p-12 text-white text-center relative overflow-hidden group shadow-2xl shadow-violet-100">
                        <div className="absolute top-0 right-0 -m-16 w-[500px] h-[500px] bg-white/10 rounded-full blur-[120px] transition-transform group-hover:scale-110 duration-1000" />
                        <div className="relative z-10 max-w-2xl mx-auto space-y-6">
                            <h2 className="text-2xl lg:text-4xl font-black tracking-tight leading-tight">Begin Restitution <br />Process.</h2>
                            <p className="text-violet-100 text-base font-medium opacity-90 italicLeading leading-relaxed">
                                Access your secure dashboard to authorize your return or initiate an exchange request immediately.
                            </p>
                            <div className="pt-4">
                                <Link to="/profile">
                                    <Button className="h-14 px-8 bg-white text-violet-600 hover:bg-gray-900 hover:text-white rounded-[2rem] text-xs font-black uppercase tracking-[0.25em] shadow-2xl transition-all active:scale-95 border-0">
                                        Visit User Dashboard
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

const Package = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M11 15.5l9-5.5v-1.5l-9 -5.5l-9 5.5v1.5l9 5.5z" /><path d="M11 21.5l9-5.5v-6" /><path d="M11 21.5l-9-5.5v-6" /><path d="M11 15.5v6" /></svg>;

export default Returns;
