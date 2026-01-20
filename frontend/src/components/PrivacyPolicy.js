import React from 'react';
import Navigation from './Navigation';
import Footer from './Footer';
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Eye, Lock, FileText, Bell, Globe, ArrowLeft, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

const PrivacyPolicy = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-left">
            <Navigation />

            <main className="flex-1 pt-20">
                {/* Hero Header */}
                <section className="bg-white border-b border-gray-100">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 text-left">
                        <div className="max-w-3xl">
                            <nav className="text-sm text-gray-400 mb-8 flex items-center gap-2">
                                <Link to="/" className="hover:text-violet-600 transition-colors">Home</Link>
                                <span className="text-gray-300">›</span>
                                <span className="text-gray-900 font-medium">Privacy Policy</span>
                            </nav>
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-widest mb-6 border border-emerald-100/50">
                                <ShieldCheck className="w-3.5 h-3.5" /> Data Integrity Protocol
                            </div>
                            <h1 className="text-4xl lg:text-7xl font-black text-gray-900 mb-6 tracking-tight leading-tight">
                                Privacy & <br />
                                <span className="text-violet-600">Confidentiality.</span>
                            </h1>
                            <p className="text-gray-500 text-lg lg:text-xl font-medium leading-relaxed italicLeading uppercaseTracking">
                                Our commitment to safeguarding your digital identity through advanced encryption and stringent data governance.
                            </p>
                            <div className="mt-8 p-4 bg-gray-50 rounded-2xl border border-gray-100 inline-block">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Last Protocol Audit: January 12, 2026</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Card className="border border-gray-100 shadow-2xl rounded-[3rem] overflow-hidden bg-white mb-12">
                        <CardContent className="p-10 lg:p-16 space-y-16">

                            {/* Introduction */}
                            <section className="space-y-6">
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 bg-violet-50 rounded-2xl flex items-center justify-center text-violet-600 shadow-sm border border-violet-100/50">
                                        <Globe className="w-6 h-6" />
                                    </div>
                                    <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase tracking-widest text-[11px]">01. Strategic Context</h2>
                                </div>
                                <p className="text-gray-600 leading-relaxed font-medium pl-lg-16">
                                    Welcome to ZippyCart. At our core, we prioritize the sanctity of your personal data. This protocol outlines how we manage and protect your digital assets across our logistical and informational networks, ensuring compliance with global data protection mandates.
                                </p>
                            </section>

                            <div className="h-px bg-gray-100" />

                            {/* Data Collection */}
                            <section className="space-y-8">
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100/50">
                                        <Eye className="w-6 h-6" />
                                    </div>
                                    <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase tracking-widest text-[11px]">02. Data Acquisition Matrix</h2>
                                </div>
                                <div className="grid md:grid-cols-2 gap-6 pl-lg-16">
                                    {[
                                        { title: "Identity Metadata", desc: "Foundational identifiers including legal names and authorized usernames." },
                                        { title: "Point-of-Contact", desc: "Logistical details for delivery fulfillment and secure communications." },
                                        { title: "Technical Echoes", desc: "Encryption standards, IP addresses, and secure hardware identifiers." },
                                        { title: "Usage Analytics", desc: "Patterns of interaction within our digital marketplace architecture." }
                                    ].map((item, i) => (
                                        <div key={i} className="p-6 bg-gray-50 rounded-3xl border border-gray-100/50 hover:bg-violet-50/20 transition-all border-l-4 border-l-violet-200">
                                            <h4 className="font-bold text-gray-900 mb-2 uppercase tracking-tight text-sm">{item.title}</h4>
                                            <p className="text-xs text-gray-500 font-medium leading-relaxed uppercaseTracking">{item.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <div className="h-px bg-gray-100" />

                            {/* Data Security */}
                            <section className="space-y-6">
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100/50">
                                        <Lock className="w-6 h-6" />
                                    </div>
                                    <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase tracking-widest text-[11px]">03. Security Fortification</h2>
                                </div>
                                <p className="text-gray-600 leading-relaxed font-medium pl-lg-16">
                                    We deploy enterprise-grade security protocols to prevent unauthorized access, alteration, or exposure of your personal matrix. Data access is strictly limited to authorized personnel with mission-critical administrative needs, protected by multi-factor authentication.
                                </p>
                            </section>

                            <div className="h-px bg-gray-100" />

                            {/* Legal Rights */}
                            <section className="space-y-6">
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-600 shadow-sm border border-slate-200">
                                        <Bell className="w-6 h-6" />
                                    </div>
                                    <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase tracking-widest text-[11px]">04. Consumer Rights Portfolio</h2>
                                </div>
                                <p className="text-gray-600 leading-relaxed font-medium pl-lg-16">
                                    Under prevailing data statutes, you retain full sovereignty over your information. This includes the right to audit, amend, or purge your records from our system. Any requests for data migration or restriction are processed with high-priority status within our legal operations desk.
                                </p>
                            </section>
                        </CardContent>
                    </Card>

                    {/* Support Block */}
                    <div className="p-12 bg-gray-900 rounded-[3.5rem] text-white text-center shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-[120px]" />
                        <h3 className="text-2xl font-black mb-4 tracking-tight relative z-10 leading-tight">Questions about <br />Confidentiality?</h3>
                        <p className="text-gray-400 text-base font-medium mb-10 relative z-10 italicLeading">
                            Our data protection office is available to provide detailed insights into our encryption standards and compliance frameworks.
                        </p>
                        <div className="flex justify-center gap-4 relative z-10">
                            <button className="px-10 h-14 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl font-bold text-xs uppercase tracking-[0.2em] transition-all active:scale-95 shadow-xl shadow-violet-950/20">
                                Audit Report
                            </button>
                            <Link to="/contact">
                                <button className="px-10 h-14 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] transition-all">
                                    Contact DPO Desk
                                </button>
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default PrivacyPolicy;
