import React from 'react';
import Navigation from './Navigation';
import Footer from './Footer';
import { Card, CardContent } from "@/components/ui/card";
import { Cookie, Settings, Info, ShieldCheck, PieChart, MousePointer2 } from "lucide-react";

const Cookies = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navigation />

            <main className="flex-1 pt-32 pb-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-100 text-violet-600 rounded-full text-xs font-black uppercase tracking-widest mb-6">User Experience</div>
                        <h1 className="text-4xl lg:text-7xl font-black text-gray-900 mb-6 tracking-tighter">Cookie <span className="text-violet-600">Policy</span></h1>
                        <p className="text-gray-500 text-lg font-medium">How we use cookies to improve your shopping experience</p>
                    </div>

                    <Card className="border-0 shadow-xl rounded-[3rem] overflow-hidden bg-white mb-10 text-left">
                        <CardContent className="p-10 lg:p-16 space-y-12">
                            <section className="space-y-6">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="p-2 bg-violet-50 rounded-xl text-violet-600"><Cookie className="w-6 h-6" /></div>
                                    <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase text-[10px]">1. What are Cookies?</h2>
                                </div>
                                <p className="text-gray-600 leading-relaxed font-medium">
                                    Cookies are small text files that are stored on your computer or mobile device when you visit a website. They are widely used to make websites work, or work more efficiently, and to provide information to the owners of the site.
                                </p>
                            </section>

                            <section className="space-y-6">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600"><PieChart className="w-6 h-6" /></div>
                                    <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase text-[10px]">2. Types of Cookies We Use</h2>
                                </div>
                                <div className="grid gap-6">
                                    {[
                                        { icon: ShieldCheck, title: "Essential Cookies", desc: "These are necessary for the website to function (e.g., login, shopping cart)." },
                                        { icon: PieChart, title: "Performance Cookies", desc: "Help us understand how visitors interact with the website (e.g., Google Analytics)." },
                                        { icon: MousePointer2, title: "Functionality Cookies", desc: "Used to remember choices you make (e.g., language or region selection)." },
                                        { icon: Settings, title: "Targeting Cookies", desc: "Used to deliver advertisements more relevant to you and your interests." }
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-6 p-6 border border-gray-100 rounded-3xl hover:border-violet-200 hover:bg-violet-50/20 transition-all group">
                                            <div className="p-3 bg-white shadow-sm rounded-xl text-violet-600 group-hover:scale-110 transition-transform"><item.icon className="w-5 h-5" /></div>
                                            <div>
                                                <h4 className="font-bold text-gray-900">{item.title}</h4>
                                                <p className="text-sm text-gray-400 font-medium">{item.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section className="space-y-6">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="p-2 bg-violet-50 rounded-xl text-violet-600"><Settings className="w-6 h-6" /></div>
                                    <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase text-[10px]">3. Controlling Cookies</h2>
                                </div>
                                <p className="text-gray-600 leading-relaxed font-medium">
                                    Most web browsers allow some control of most cookies through the browser settings. To find out more about cookies, including how to see what cookies have been set and how to manage and delete them, visit <a href="https://www.aboutcookies.org" className="text-violet-600 underline font-bold hover:text-violet-800 transition-colors" target="_blank" rel="noopener noreferrer">aboutcookies.org</a>.
                                </p>
                            </section>
                        </CardContent>
                    </Card>

                    <div className="text-center p-10 bg-violet-600 rounded-[3rem] text-white relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-700 to-violet-800 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <h3 className="text-2xl font-black mb-4 tracking-tight relative z-10">Manage Preferences</h3>
                        <p className="text-white/80 mb-8 font-medium relative z-10">You can choose to accept or decline cookies. Please note that declining may affect your experience.</p>
                        <div className="flex flex-wrap justify-center gap-4 relative z-10">
                            <button className="px-10 py-4 bg-white text-violet-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:shadow-2xl transition-all active:scale-95">Accept All</button>
                            <button className="px-10 py-4 bg-violet-700 border border-white/20 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-violet-800 transition-all active:scale-95">Decline Non-Essential</button>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Cookies;
