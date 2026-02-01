import React from 'react';
import Navigation from './Navigation';
import Footer from './Footer';
import { Card, CardContent } from "@/components/ui/card";
import { Cookie, Settings, Info, ShieldCheck, PieChart, MousePointer2, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const Cookies = () => {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-left">
            <Navigation />

            <main className="flex-1 pt-20">
                {/* Hero Header */}
                <section className="bg-white border-b border-gray-100">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 text-left">
                        <div className="max-w-3xl">
                            <nav className="text-sm text-gray-400 mb-8 flex items-center gap-2">
                                <button
                                    onClick={() => navigate(-1)}
                                    className="flex items-center gap-1.5 hover:text-violet-600 transition-colors mr-2 group"
                                >
                                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                                    <span className="font-medium">Back</span>
                                </button>
                                <div className="w-px h-4 bg-gray-200 mx-2" />
                                <Link to="/" className="hover:text-violet-600 transition-colors">Home</Link>
                                <span className="text-gray-300">›</span>
                                <span className="text-gray-900 font-medium">Cookie Policy</span>
                            </nav>
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-100 text-violet-600 text-[10px] font-bold uppercase tracking-widest mb-6 border border-violet-100/50">
                                <Settings className="w-3.5 h-3.5" /> Experience Management
                            </div>
                            <h1 className="text-4xl lg:text-7xl font-black text-gray-900 mb-6 tracking-tight leading-tight">
                                Tracking & <br />
                                <span className="text-violet-600">Preferences.</span>
                            </h1>
                            <p className="text-gray-500 text-lg lg:text-xl font-medium leading-relaxed italicLeading uppercaseTracking">
                                Transparency in how we utilize digital identifiers to optimize your navigational efficiency and personalized commerce experience.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Card className="border border-gray-100 shadow-2xl rounded-[3rem] overflow-hidden bg-white mb-12">
                        <CardContent className="p-10 lg:p-16 space-y-16">

                            {/* Definition */}
                            <section className="space-y-6">
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 bg-violet-50 rounded-2xl flex items-center justify-center text-violet-600 shadow-sm border border-violet-100/50">
                                        <Cookie className="w-6 h-6" />
                                    </div>
                                    <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase tracking-widest text-[11px]">01. Protocol Definition</h2>
                                </div>
                                <p className="text-gray-600 leading-relaxed font-medium pl-lg-16">
                                    Cookies are sophisticated digital identifiers cached on your localized hardware. They facilitate seamless cross-session continuity, allowing our architecture to recognize your preferences and maintain your shopping states with high precision and security.
                                </p>
                            </section>

                            <div className="h-px bg-gray-100" />

                            {/* Cookie Types */}
                            <section className="space-y-8">
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100/50">
                                        <PieChart className="w-6 h-6" />
                                    </div>
                                    <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase tracking-widest text-[11px]">02. Functional Categorization</h2>
                                </div>
                                <div className="grid gap-4 pl-lg-16">
                                    {[
                                        { icon: ShieldCheck, title: "Mission Critical", desc: "Essential for core marketplace functions like authentication and cart persistence." },
                                        { icon: PieChart, title: "Optimization Logs", desc: "Diagnostic data used to enhance interface response times and navigational flow." },
                                        { icon: MousePointer2, title: "Preference Memory", desc: "Caches cultural settings, currency selections, and personalized interface layout." },
                                        { icon: Settings, title: "Targeted Outreach", desc: "Aligns promotional broadcasts with your demonstrated procurement interests." }
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-6 p-6 bg-gray-50 rounded-[2rem] border border-gray-100/50 group transition-all hover:bg-white hover:shadow-xl hover:border-violet-100">
                                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-violet-600 shadow-sm group-hover:scale-110 transition-transform"><item.icon className="w-5 h-5" /></div>
                                            <div>
                                                <h4 className="font-bold text-gray-900 text-sm">{item.title}</h4>
                                                <p className="text-xs text-gray-400 font-medium uppercaseTracking leading-tight">{item.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <div className="h-px bg-gray-100" />

                            {/* Control */}
                            <section className="space-y-6">
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-600 shadow-sm border border-slate-200">
                                        <Settings className="w-6 h-6" />
                                    </div>
                                    <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase tracking-widest text-[11px]">03. User Sovereignty</h2>
                                </div>
                                <p className="text-gray-600 leading-relaxed font-medium pl-lg-16">
                                    You maintain complete control over cookie authorization through your hardware's administrative settings. While restriction of non-essential identifiers may impact specific personalization features, core marketplace functionality remains accessible to all users.
                                </p>
                            </section>
                        </CardContent>
                    </Card>

                    {/* Preferences Block */}
                    <div className="p-12 bg-gray-900 rounded-[3.5rem] text-white text-center shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/10 rounded-full blur-[100px]" />
                        <h3 className="text-2xl font-black mb-4 tracking-tight relative z-10 leading-tight">Configure Tracking <br />Permissions</h3>
                        <p className="text-gray-400 text-base font-medium mb-10 relative z-10 italicLeading">
                            Adjust your data preferences to balance privacy and personalized shopping experiences.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4 relative z-10">
                            <button className="px-10 h-14 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl font-bold text-xs uppercase tracking-[0.2em] transition-all active:scale-95 shadow-xl shadow-violet-950/20">
                                Authorize All Cookies
                            </button>
                            <button className="px-10 h-14 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] transition-all active:scale-95">
                                Restrict Non-Essential
                            </button>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default Cookies;
