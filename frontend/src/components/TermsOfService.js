import React from 'react';
import Navigation from './Navigation';
import Footer from './Footer';
import { Card, CardContent } from "@/components/ui/card";
import { Gavel, Scale, AlertCircle, FileText, CheckCircle2, XCircle, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const TermsOfService = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-left">
            <Navigation />

            <main className="flex-1 pt-20">
                {/* Hero Header */}
                <section className="bg-white border-b border-gray-100">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
                        <div className="max-w-3xl">
                            <nav className="text-sm text-gray-400 mb-8 flex items-center gap-2">
                                <Link to="/" className="hover:text-violet-600 transition-colors">Home</Link>
                                <span className="text-gray-300">›</span>
                                <span className="text-gray-900 font-medium">Terms of Service</span>
                            </nav>
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-100 text-violet-600 text-[10px] font-bold uppercase tracking-widest mb-6">
                                Governance Framework
                            </div>
                            <h1 className="text-4xl lg:text-7xl font-black text-gray-900 mb-6 tracking-tight leading-tight">
                                Terms of <br />
                                <span className="text-violet-600">Service.</span>
                            </h1>
                            <p className="text-gray-500 text-lg lg:text-xl font-medium leading-relaxed italicLeading uppercaseTracking">
                                The foundational agreement governing your interaction with the ZippyCart digital marketplace and logistics network.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Card className="border border-gray-100 shadow-2xl rounded-[3rem] overflow-hidden bg-white mb-12">
                        <CardContent className="p-10 lg:p-16 space-y-16">
                            {/* Section 1 */}
                            <section className="space-y-6">
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 bg-violet-50 rounded-2xl flex items-center justify-center text-violet-600 shadow-sm border border-violet-100/50">
                                        <Gavel className="w-6 h-6" />
                                    </div>
                                    <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase tracking-widest text-[11px]">01. Protocol Acceptance</h2>
                                </div>
                                <p className="text-gray-600 leading-relaxed font-medium pl-lg-16">
                                    By accessing and utilizing this interface, you acknowledge and agree to be contractually bound by the provisions of this agreement. Interaction with our services implies full consent to the prevailing guidelines and operational protocols established by ZippyCart.
                                </p>
                            </section>

                            <div className="h-px bg-gray-100" />

                            {/* Section 2 */}
                            <section className="space-y-8">
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 shadow-sm border border-rose-100/50">
                                        <AlertCircle className="w-6 h-6" />
                                    </div>
                                    <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase tracking-widest text-[11px]">02. User Conduct & Constraints</h2>
                                </div>
                                <div className="grid gap-6 pl-lg-16">
                                    {[
                                        { icon: CheckCircle2, title: "Identity Security", desc: "Users are responsible for the integrity and confidentiality of their security credentials and account architecture." },
                                        { icon: CheckCircle2, title: "Regulatory Compliance", desc: "Usage must align with all regional and international legal standards without infringing on third-party security." },
                                        { icon: XCircle, title: "Restricted Operations", desc: "Any attempt to inject malicious code, harvest data unauthorized, or disrupt system integrity is strictly prohibited." }
                                    ].map((item, i) => (
                                        <div key={i} className="flex gap-6 p-6 bg-gray-50 rounded-3xl border border-gray-100/50 group transition-all hover:bg-white hover:shadow-xl hover:border-violet-100">
                                            <item.icon className={`w-6 h-6 shrink-0 ${i === 2 ? 'text-rose-500' : 'text-emerald-500'} transition-transform group-hover:scale-110`} />
                                            <div>
                                                <h4 className="font-bold text-gray-900 mb-1.5">{item.title}</h4>
                                                <p className="text-xs text-gray-500 font-medium leading-relaxed uppercaseTracking">{item.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <div className="h-px bg-gray-100" />

                            {/* Section 3 */}
                            <section className="space-y-6">
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100/50">
                                        <Scale className="w-6 h-6" />
                                    </div>
                                    <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase tracking-widest text-[11px]">03. Proprietary Heritage</h2>
                                </div>
                                <p className="text-gray-600 leading-relaxed font-medium pl-lg-16">
                                    All digital artifacts, branding assets, and interface architectures are the exclusive property of ZippyCart. They are guarded by international intellectual property statutes. Unauthorized replication or distribution of this proprietary heritage is strictly actionable under global law.
                                </p>
                            </section>

                            <div className="h-px bg-gray-100" />

                            {/* Section 4 */}
                            <section className="space-y-6">
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-600 shadow-sm border border-slate-200">
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase tracking-widest text-[11px]">04. Jurisdictional Mandate</h2>
                                </div>
                                <p className="text-gray-600 leading-relaxed font-medium pl-lg-16">
                                    These provisions are governed by the legal mandates of Bharat. Any procedural disputes shall be resolved within the primary jurisdictional courts of our headquarters, subject to prevailing arbitration protocols.
                                </p>
                            </section>
                        </CardContent>
                    </Card>

                    {/* Support Block */}
                    <div className="p-12 bg-gray-900 rounded-[3.5rem] text-white text-center shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/10 rounded-full blur-[100px]" />
                        <h3 className="text-2xl font-black mb-4 tracking-tight relative z-10 leading-tight">Need Procedural <br />Clarification?</h3>
                        <p className="text-gray-400 text-base font-medium mb-10 relative z-10 italicLeading">
                            Our legal operations desk is available to discuss specific contractual frameworks for institutional clients.
                        </p>
                        <div className="flex justify-center gap-4 relative z-10">
                            <button className="px-10 h-14 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl font-bold text-xs uppercase tracking-[0.2em] transition-all active:scale-95 shadow-xl shadow-violet-950/20">
                                Request Full Document
                            </button>
                            <Link to="/contact">
                                <button className="px-10 h-14 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] transition-all">
                                    Contact Legal Desk
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

export default TermsOfService;
