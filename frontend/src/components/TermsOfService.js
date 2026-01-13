import React from 'react';
import Navigation from './Navigation';
import Footer from './Footer';
import { Card, CardContent } from "@/components/ui/card";
import { Gavel, Scale, AlertCircle, FileText, CheckCircle2, XCircle } from "lucide-react";

const TermsOfService = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navigation />

            <main className="flex-1 pt-32 pb-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-100 text-violet-600 rounded-full text-xs font-black uppercase tracking-widest mb-6">Terms & Usage</div>
                        <h1 className="text-4xl lg:text-7xl font-black text-gray-900 mb-6 tracking-tighter">Terms of <span className="text-violet-600">Service</span></h1>
                        <p className="text-gray-500 text-lg font-medium">Agreement between ShopVerse and the User</p>
                    </div>

                    <Card className="border-0 shadow-xl rounded-[3rem] overflow-hidden bg-white mb-10 text-left">
                        <CardContent className="p-10 lg:p-16 space-y-12">
                            <section className="space-y-6">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="p-2 bg-violet-50 rounded-xl text-violet-600"><Gavel className="w-6 h-6" /></div>
                                    <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase text-[10px]">1. Acceptance of Terms</h2>
                                </div>
                                <p className="text-gray-600 leading-relaxed font-medium">
                                    By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement. In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services.
                                </p>
                            </section>

                            <section className="space-y-6">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="p-2 bg-amber-50 rounded-xl text-amber-600"><AlertCircle className="w-6 h-6" /></div>
                                    <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase text-[10px]">2. User Responsibilities</h2>
                                </div>
                                <div className="grid gap-6">
                                    {[
                                        { icon: CheckCircle2, title: "Account Accuracy", desc: "You are responsible for maintaining the confidentiality of your account and password." },
                                        { icon: CheckCircle2, title: "Lawful Use", desc: "You agree to use the website only for lawful purposes and in a way that does not infringe the rights of others." },
                                        { icon: XCircle, title: "Prohibited Content", desc: "You may not upload viruses, malicious code, or use the service for any illegal activities." }
                                    ].map((item, i) => (
                                        <div key={i} className="flex gap-6 p-6 bg-gray-50 rounded-2xl hover:bg-violet-50 transition-colors group/item">
                                            <item.icon className={`w-6 h-6 flex-shrink-0 ${i === 2 ? 'text-red-500' : 'text-emerald-500'} group-hover/item:scale-110 transition-transform`} />
                                            <div>
                                                <h4 className="font-bold text-gray-900 mb-1">{item.title}</h4>
                                                <p className="text-sm text-gray-400 font-medium">{item.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section className="space-y-6">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="p-2 bg-violet-50 rounded-xl text-violet-600"><Scale className="w-6 h-6" /></div>
                                    <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase text-[10px]">3. Intellectual Property</h2>
                                </div>
                                <p className="text-gray-600 leading-relaxed font-medium">
                                    The website and its original content, features, and functionality are owned by ShopVerse and are protected by international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws. All materials, including images, illustrations, and designs are part of our exclusive digital heritage.
                                </p>
                            </section>

                            <section className="space-y-6">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600"><FileText className="w-6 h-6" /></div>
                                    <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase text-[10px]">4. Governing Law</h2>
                                </div>
                                <p className="text-gray-600 leading-relaxed font-medium">
                                    These terms and conditions are governed by and construed in accordance with the laws of Bharat and you irrevocably submit to the exclusive jurisdiction of the courts in your primary place of residence.
                                </p>
                            </section>
                        </CardContent>
                    </Card>

                    <div className="text-center p-10 bg-violet-600 rounded-[3rem] text-white relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-700 to-violet-800 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <h3 className="text-2xl font-black mb-4 tracking-tight relative z-10">Need Legal Clarification?</h3>
                        <p className="text-white/70 mb-8 font-medium relative z-10">Our legal framework is designed to protect both the consumer and the marketplace.</p>
                        <button className="px-10 py-4 bg-white text-violet-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:shadow-2xl transition-all active:scale-95 relative z-10">Download PDF</button>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default TermsOfService;
