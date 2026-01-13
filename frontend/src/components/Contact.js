import React, { useState } from 'react';
import Navigation from './Navigation';
import Footer from './Footer';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, Globe, ShieldCheck, Headphones } from "lucide-react";

const Contact = () => {
    const [status, setStatus] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        setStatus("sending");
        setTimeout(() => {
            setStatus("success");
            // Reset form could be handled here
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-[#fcfdfe] flex flex-col">
            <Navigation />

            <main className="flex-1 pt-32 pb-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Professional Header */}
                    <div className="max-w-3xl mb-20 animate-in fade-in slide-in-from-left duration-700">
                        <div className="flex items-center gap-2 text-violet-600 font-bold uppercase text-[10px] tracking-[0.3em] mb-4">
                            <Headphones className="w-4 h-4" />
                            Customer Excellence
                        </div>
                        <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 tracking-tight leading-tight">
                            We're here to help <br />
                            <span className="text-violet-600">you succeed.</span>
                        </h1>
                        <p className="text-gray-500 text-lg lg:text-xl font-medium leading-relaxed max-w-2xl text-left">
                            Whether you have a question about our products, orders, or just want to share feedback,
                            our dedicated support team is ready to assist you in every step of your journey.
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-12 gap-12 items-start">

                        {/* Information Grid - Left Column */}
                        <div className="lg:col-span-4 space-y-6 animate-in slide-in-from-bottom duration-700 delay-150">
                            {[
                                {
                                    icon: Mail,
                                    title: "Email Us",
                                    desc: "support@shopverse.com",
                                    sub: "Response within 24 hours",
                                    color: "text-violet-600",
                                    bg: "bg-violet-50"
                                },
                                {
                                    icon: Phone,
                                    title: "Call Us",
                                    desc: "+1 (555) 000-1234",
                                    sub: "Mon-Fri, 9am - 6pm EST",
                                    color: "text-indigo-600",
                                    bg: "bg-indigo-50"
                                },
                                {
                                    icon: MapPin,
                                    title: "Headquarters",
                                    desc: "123 Business Plaza, Floor 12",
                                    sub: "New York, NY 10001, USA",
                                    color: "text-slate-600",
                                    bg: "bg-slate-50"
                                }
                            ].map((item, i) => (
                                <Card key={i} className="border-0 shadow-sm rounded-2xl bg-white border border-gray-100 hover:shadow-md transition-all overflow-hidden">
                                    <CardContent className="p-6 flex items-start gap-5 text-left">
                                        <div className={`${item.bg} ${item.color} p-4 rounded-xl flex-shrink-0`}>
                                            <item.icon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 text-base mb-1">{item.title}</h4>
                                            <p className="text-gray-900 font-semibold text-sm mb-1">{item.desc}</p>
                                            <p className="text-gray-400 text-xs font-medium">{item.sub}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}

                            <div className="p-8 bg-violet-600 rounded-[2rem] text-white space-y-4 shadow-xl shadow-violet-100">
                                <ShieldCheck className="w-10 h-10 text-violet-200" />
                                <h3 className="text-xl font-bold">Secure Support</h3>
                                <p className="text-violet-100 text-sm leading-relaxed opacity-90">
                                    Your data privacy is our priority. Every interaction is encrypted and handled with the highest level of security.
                                </p>
                            </div>
                        </div>

                        {/* Formal Contact Form - Right Column */}
                        <div className="lg:col-span-8 animate-in slide-in-from-right duration-700 delay-200">
                            <Card className="border-0 shadow-xl rounded-[2.5rem] bg-white border border-gray-100 overflow-hidden">
                                <div className="h-2 bg-gradient-to-r from-violet-600 to-indigo-600" />
                                <CardContent className="p-8 lg:p-12">
                                    <div className="mb-10 text-left">
                                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Send a Message</h2>
                                        <p className="text-gray-400 text-sm font-medium">Please fill out the form below and we'll get back to you shortly.</p>
                                    </div>

                                    {status === "success" ? (
                                        <div className="py-20 flex flex-col items-center text-center animate-in zoom-in duration-500">
                                            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-6">
                                                <Send className="w-10 h-10" />
                                            </div>
                                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Message Received</h3>
                                            <p className="text-gray-500 max-w-sm">Thank you for contacting us. One of our team members will review your message and reach out soon.</p>
                                            <Button onClick={() => setStatus("")} variant="outline" className="mt-8 rounded-xl px-10">Send Another</Button>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleSubmit} className="space-y-8 text-left">
                                            <div className="grid md:grid-cols-2 gap-8">
                                                <div className="space-y-2.5">
                                                    <Label className="text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">Full Name</Label>
                                                    <Input placeholder="Enter your name" required className="h-14 rounded-xl bg-gray-50 border-gray-100 focus:bg-white focus:ring-2 focus:ring-violet-600 transition-all font-medium" />
                                                </div>
                                                <div className="space-y-2.5">
                                                    <Label className="text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">Email Address</Label>
                                                    <Input type="email" placeholder="email@address.com" required className="h-14 rounded-xl bg-gray-50 border-gray-100 focus:bg-white focus:ring-2 focus:ring-violet-600 transition-all font-medium" />
                                                </div>
                                            </div>

                                            <div className="space-y-2.5">
                                                <Label className="text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">Subject</Label>
                                                <Input placeholder="How can we help?" required className="h-14 rounded-xl bg-gray-50 border-gray-100 focus:bg-white focus:ring-2 focus:ring-violet-600 transition-all font-medium" />
                                            </div>

                                            <div className="space-y-2.5">
                                                <Label className="text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">Message</Label>
                                                <Textarea placeholder="Please provide as much detail as possible..." rows={5} required className="rounded-2xl bg-gray-50 border-gray-100 focus:bg-white focus:ring-2 focus:ring-violet-600 transition-all resize-none font-medium p-6" />
                                            </div>

                                            <Button
                                                type="submit"
                                                disabled={status === "sending"}
                                                className="w-full h-16 bg-gray-900 hover:bg-violet-600 text-white rounded-xl text-xs font-bold uppercase tracking-[0.2em] shadow-lg shadow-gray-200 transition-all active:scale-95 group"
                                            >
                                                {status === "sending" ? (
                                                    <span className="flex items-center gap-2">
                                                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                                        Sending Message...
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-2">
                                                        Send Message
                                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                                    </span>
                                                )}
                                            </Button>
                                        </form>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

const ArrowRight = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>;

export default Contact;
