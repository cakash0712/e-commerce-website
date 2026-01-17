import React from 'react';
import Navigation from './Navigation';
import Footer from './Footer';
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Eye, Lock, FileText, Bell, Globe } from "lucide-react";

const PrivacyPolicy = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navigation />

            <main className="flex-1 pt-32 pb-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-100 text-violet-600 rounded-full text-xs font-black uppercase tracking-widest mb-6">Trust & Security</div>
                        <h1 className="text-4xl lg:text-7xl font-black text-gray-900 mb-6 tracking-tighter">Privacy <span className="text-violet-600">Policy</span></h1>
                        <p className="text-gray-500 text-lg font-medium">Last Updated: January 12, 2026</p>
                    </div>

                    <Card className="border-0 shadow-xl rounded-[3rem] overflow-hidden bg-white mb-10 text-left">
                        <CardContent className="p-10 lg:p-16 space-y-12">
                            <section className="space-y-4">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="p-2 bg-violet-50 rounded-xl text-violet-600"><Globe className="w-6 h-6" /></div>
                                    <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase text-[10px]">1. Introduction</h2>
                                </div>
                                <p className="text-gray-600 leading-relaxed font-medium">
                                    Welcome to ZippyCart. At ZippyCart, we respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.
                                </p>
                            </section>

                            <section className="space-y-4">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600"><Eye className="w-6 h-6" /></div>
                                    <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase text-[10px]">2. Data We Collect</h2>
                                </div>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="p-6 bg-gray-50 rounded-2xl hover:bg-violet-50/50 transition-colors">
                                        <h4 className="font-bold text-gray-900 mb-2">Identity Data</h4>
                                        <p className="text-sm text-gray-500">Includes first name, last name, username or similar identifier.</p>
                                    </div>
                                    <div className="p-6 bg-gray-50 rounded-2xl hover:bg-violet-50/50 transition-colors">
                                        <h4 className="font-bold text-gray-900 mb-2">Contact Data</h4>
                                        <p className="text-sm text-gray-500">Includes billing address, delivery address, email address and telephone numbers.</p>
                                    </div>
                                    <div className="p-6 bg-gray-50 rounded-2xl hover:bg-violet-50/50 transition-colors">
                                        <h4 className="font-bold text-gray-900 mb-2">Technical Data</h4>
                                        <p className="text-sm text-gray-500">Includes internet protocol (IP) address, browser type, and version, time zone setting.</p>
                                    </div>
                                    <div className="p-6 bg-gray-50 rounded-2xl hover:bg-violet-50/50 transition-colors">
                                        <h4 className="font-bold text-gray-900 mb-2">Usage Data</h4>
                                        <p className="text-sm text-gray-500">Includes information about how you use our website, products and services.</p>
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-4">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="p-2 bg-violet-50 rounded-xl text-violet-600"><Lock className="w-6 h-6" /></div>
                                    <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase text-[10px]">3. Data Security</h2>
                                </div>
                                <p className="text-gray-600 leading-relaxed font-medium">
                                    We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.
                                </p>
                            </section>

                            <section className="space-y-4">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600"><Bell className="w-6 h-6" /></div>
                                    <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase text-[10px]">4. Your Legal Rights</h2>
                                </div>
                                <p className="text-gray-600 leading-relaxed font-medium">
                                    Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to request access, correction, erasure, restriction, transfer, or to object to processing.
                                </p>
                            </section>
                        </CardContent>
                    </Card>

                    <div className="text-center p-10 bg-gray-900 rounded-[3rem] text-white overflow-hidden relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 to-indigo-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <h3 className="text-2xl font-black mb-4 tracking-tight relative z-10">Questions about Privacy?</h3>
                        <p className="text-gray-400 mb-8 font-medium relative z-10">If you have any questions regarding this policy, please contact our legal team at legal@ZippyCart.com</p>
                        <button className="px-10 py-4 bg-violet-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-violet-700 transition-all active:scale-95 relative z-10">Contact Legal</button>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default PrivacyPolicy;
