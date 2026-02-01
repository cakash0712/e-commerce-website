import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navigation from './Navigation';
import Footer from './Footer';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, Globe, ShieldCheck, Headphones, ArrowRight, ArrowLeft } from "lucide-react";

const Contact = () => {
    const navigate = useNavigate();
    const [status, setStatus] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        setStatus("sending");
        setTimeout(() => {
            setStatus("success");
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Navigation />

            <main className="flex-1 pt-20">
                {/* Hero Header */}
                <section className="bg-gray-50 border-b border-gray-100">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
                        <div className="max-w-3xl">
                            <nav className="text-sm text-gray-400 mb-10 flex items-center gap-2">
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
                                <span className="text-gray-900 font-medium">Contact Us</span>
                            </nav>
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-100 text-violet-600 text-[10px] font-bold uppercase tracking-widest mb-6">
                                <Headphones className="w-4 h-4" />
                                Support Center
                            </div>
                            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                                Get in touch with <br />
                                <span className="text-violet-600">our team.</span>
                            </h1>
                            <p className="text-gray-500 text-lg lg:text-xl leading-relaxed max-w-2xl">
                                Have a question or need assistance? Our dedicated support team is here to provide you with the best shopping experience.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid lg:grid-cols-12 gap-12 items-start">

                            {/* Contact Info */}
                            <div className="lg:col-span-4 space-y-6">
                                {[
                                    {
                                        icon: Mail,
                                        title: "Email Support",
                                        desc: "support@zippycart.com",
                                        sub: "We respond within 24 hours",
                                        color: "text-violet-600",
                                        bg: "bg-violet-50"
                                    },
                                    {
                                        icon: Phone,
                                        title: "Call Us",
                                        desc: "+91 7305122455",
                                        sub: "Mon - Sat, 9am - 7pm",
                                        color: "text-violet-600",
                                        bg: "bg-violet-50"
                                    },
                                    {
                                        icon: MapPin,
                                        title: "Our Location",
                                        desc: "Residency Road, Bangalore",
                                        sub: "Karnataka, India 560001",
                                        color: "text-violet-600",
                                        bg: "bg-violet-50"
                                    }
                                ].map((item, i) => (
                                    <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 flex items-start gap-5 hover:shadow-md transition-shadow">
                                        <div className={`${item.bg} ${item.color} p-4 rounded-xl flex-shrink-0`}>
                                            <item.icon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 text-base mb-1">{item.title}</h4>
                                            <p className="text-gray-900 font-semibold text-sm mb-1">{item.desc}</p>
                                            <p className="text-gray-400 text-xs font-medium">{item.sub}</p>
                                        </div>
                                    </div>
                                ))}

                                <div className="p-8 bg-violet-600 rounded-3xl text-white space-y-4 shadow-lg shadow-violet-100">
                                    <ShieldCheck className="w-10 h-10 text-violet-200" />
                                    <h3 className="text-xl font-bold">Safe & Secure</h3>
                                    <p className="text-violet-100 text-sm leading-relaxed opacity-90 font-medium">
                                        Your inquiries are handled with the utmost confidentiality and security protocols.
                                    </p>
                                </div>
                            </div>

                            {/* Contact Form */}
                            <div className="lg:col-span-8">
                                <Card className="border border-gray-100 shadow-xl rounded-[2.5rem] overflow-hidden">
                                    <div className="h-2 bg-violet-600 w-full" />
                                    <CardContent className="p-8 lg:p-12">
                                        {status === "success" ? (
                                            <div className="py-20 flex flex-col items-center text-center animate-in zoom-in duration-500">
                                                <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-6">
                                                    <Send className="w-10 h-10" />
                                                </div>
                                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Message Sent!</h3>
                                                <p className="text-gray-500 max-w-sm">Thank you for reaching out. We've received your message and will get back to you shortly.</p>
                                                <Button onClick={() => setStatus("")} variant="outline" className="mt-8 rounded-xl px-10 border-violet-200 text-violet-600 hover:bg-violet-50">Send Another</Button>
                                            </div>
                                        ) : (
                                            <form onSubmit={handleSubmit} className="space-y-8">
                                                <div className="text-left mb-10">
                                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Send us a Message</h2>
                                                    <p className="text-gray-400 text-sm">Fill out the form below and our team will assist you.</p>
                                                </div>

                                                <div className="grid md:grid-cols-2 gap-8 text-left">
                                                    <div className="space-y-2.5">
                                                        <Label className="text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">Full Name</Label>
                                                        <Input placeholder="John Doe" required className="h-14 rounded-xl bg-gray-50 border-gray-100 focus:bg-white focus:ring-2 focus:ring-violet-600 focus:border-violet-600 transition-all font-medium" />
                                                    </div>
                                                    <div className="space-y-2.5">
                                                        <Label className="text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">Email Address</Label>
                                                        <Input type="email" placeholder="john@example.com" required className="h-14 rounded-xl bg-gray-50 border-gray-100 focus:bg-white focus:ring-2 focus:ring-violet-600 focus:border-violet-600 transition-all font-medium" />
                                                    </div>
                                                </div>

                                                <div className="space-y-2.5 text-left">
                                                    <Label className="text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">Subject</Label>
                                                    <Input placeholder="How can we help?" required className="h-14 rounded-xl bg-gray-50 border-gray-100 focus:bg-white focus:ring-2 focus:ring-violet-600 focus:border-violet-600 transition-all font-medium" />
                                                </div>

                                                <div className="space-y-2.5 text-left">
                                                    <Label className="text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">Message</Label>
                                                    <Textarea placeholder="Describe your inquiry in detail..." rows={5} required className="rounded-2xl bg-gray-50 border-gray-100 focus:bg-white focus:ring-2 focus:ring-violet-600 focus:border-violet-600 transition-all resize-none font-medium p-4" />
                                                </div>

                                                <Button
                                                    type="submit"
                                                    disabled={status === "sending"}
                                                    className="w-full h-16 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-violet-100 transition-all active:scale-95 flex items-center justify-center gap-2"
                                                >
                                                    {status === "sending" ? (
                                                        <>
                                                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                                            Sending...
                                                        </>
                                                    ) : (
                                                        <>
                                                            Send Message
                                                            <ArrowRight className="w-4 h-4" />
                                                        </>
                                                    )}
                                                </Button>
                                            </form>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default Contact;
