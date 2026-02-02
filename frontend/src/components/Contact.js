import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navigation from './Navigation';
import Footer from './Footer';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Phone, MapPin, Send, ArrowRight, ArrowLeft, ShieldCheck } from "lucide-react";

const Contact = () => {
    const navigate = useNavigate();
    const [status, setStatus] = useState("");
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: ""
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus("sending");
        setError("");

        try {
            const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
            const response = await fetch(`${API_URL}/api/contact`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

            const data = await response.json();
            setStatus("success");
            setFormData({ name: "", email: "", subject: "", message: "" });
        } catch (err) {
            setError("Failed to send message. Please try again later.");
            setStatus("");
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Navigation />

            <main className="flex-1 pt-20">
                <section className="bg-gray-50 border-b border-gray-100">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24">
                        <div className="max-w-3xl mx-auto lg:mx-0 text-left">
                            <nav className="text-sm text-gray-400 mb-8 flex items-center justify-start lg:justify-start gap-2">
                                <button
                                    onClick={() => navigate(-1)}
                                    className="hidden md:flex items-center gap-1.5 hover:text-violet-600 transition-colors mr-2 group"
                                >
                                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                                    <span className="font-medium text-xs md:text-sm">Back</span>
                                </button>
                                <div className="hidden md:block w-px h-4 bg-gray-200 mx-2" />
                                <Link to="/" className="hover:text-violet-600 transition-colors">Home</Link>
                                <span className="text-gray-300">/</span>
                                <span className="text-gray-900 font-medium">Contact Us</span>
                            </nav>
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-100 text-violet-600 text-[10px] font-bold uppercase tracking-widest mb-6 translate-y-0 hover:-translate-y-1 transition-transform cursor-default">
                                <Mail className="w-4 h-4" />
                                Support Center
                            </div>
                            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-6 leading-[1.1]">
                                Get in touch with <br className="hidden md:block" />
                                <span className="text-violet-600">our team.</span>
                            </h1>
                            <p className="text-gray-500 text-base md:text-lg lg:text-xl leading-relaxed max-w-2xl text-left">
                                Have a question or need assistance? Our dedicated support team is here to provide you with the best shopping experience.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="py-12 md:py-20 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                            <div className="lg:col-span-4 space-y-4 md:space-y-6">
                                {[
                                    {
                                        icon: Mail,
                                        title: "Email Support",
                                        desc: "dachcart@gmail.com",
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
                                    <div key={i} className="bg-white p-5 md:p-6 rounded-2xl border border-gray-100 flex items-center lg:items-start gap-4 md:gap-5 hover:shadow-xl hover:shadow-gray-100/50 transition-all duration-300 group">
                                        <div className={`${item.bg} ${item.color} p-3.5 md:p-4 rounded-xl flex-shrink-0 group-hover:scale-110 transition-transform`}>
                                            <item.icon className="w-5 h-5 md:w-6 md:h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 text-sm md:text-base mb-0.5 md:mb-1">{item.title}</h4>
                                            <p className="text-gray-900 font-semibold text-xs md:text-sm mb-0.5 md:mb-1">{item.desc}</p>
                                            <p className="text-gray-400 text-[10px] md:text-xs font-medium">{item.sub}</p>
                                        </div>
                                    </div>
                                ))}

                                <div className="p-6 md:p-8 bg-gradient-to-br from-violet-600 to-violet-700 rounded-3xl text-white space-y-4 shadow-xl shadow-violet-100">
                                    <ShieldCheck className="w-8 h-8 md:w-10 md:h-10 text-violet-200" />
                                    <h3 className="text-lg md:text-xl font-bold">Safe & Secure</h3>
                                    <p className="text-violet-100 text-xs md:text-sm leading-relaxed opacity-90 font-medium">
                                        Your inquiries are handled with the utmost confidentiality and security protocols.
                                    </p>
                                </div>
                            </div>

                            <div className="lg:col-span-8">
                                <Card className="border border-gray-100 shadow-2xl rounded-[2rem] md:rounded-[2.5rem] overflow-hidden">
                                    <div className="h-1.5 md:h-2 bg-violet-600 w-full" />
                                    <CardContent className="p-6 md:p-10 lg:p-12">
                                        {status === "success" ? (
                                            <div className="py-12 md:py-20 flex flex-col items-center text-center animate-in zoom-in duration-500">
                                                <div className="w-16 h-16 md:w-20 md:h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-6">
                                                    <Send className="w-8 h-8 md:w-10 md:h-10" />
                                                </div>
                                                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Message Sent!</h3>
                                                <p className="text-gray-500 text-sm md:text-base max-w-sm px-4">Thank you for reaching out. We have received your message and will get back to you shortly.</p>
                                                <Button onClick={() => setStatus("")} variant="outline" className="mt-8 rounded-xl px-10 border-violet-200 text-violet-600 hover:bg-violet-50">Send Another</Button>
                                            </div>
                                        ) : (
                                            <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
                                                <div className="text-center lg:text-left mb-8 md:mb-10">
                                                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Send us a Message</h2>
                                                    <p className="text-gray-400 text-xs md:text-sm">Fill out the form below and our team will assist you.</p>
                                                </div>

                                                {error && (
                                                    <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
                                                        {error}
                                                    </div>
                                                )}

                                                <div className="grid md:grid-cols-2 gap-5 md:gap-8 text-left">
                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">Full Name</Label>
                                                        <Input
                                                            name="name"
                                                            placeholder="John Doe"
                                                            required
                                                            value={formData.name}
                                                            onChange={handleChange}
                                                            className="h-12 md:h-14 rounded-xl bg-gray-50 border-gray-100 focus:bg-white focus:ring-2 focus:ring-violet-600 focus:border-violet-600 transition-all font-medium text-sm"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">Email Address</Label>
                                                        <Input
                                                            type="email"
                                                            name="email"
                                                            placeholder="john@example.com"
                                                            required
                                                            value={formData.email}
                                                            onChange={handleChange}
                                                            className="h-12 md:h-14 rounded-xl bg-gray-50 border-gray-100 focus:bg-white focus:ring-2 focus:ring-violet-600 focus:border-violet-600 transition-all font-medium text-sm"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-2 text-left">
                                                    <Label className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">Subject</Label>
                                                    <Input
                                                        name="subject"
                                                        placeholder="How can we help?"
                                                        required
                                                        value={formData.subject}
                                                        onChange={handleChange}
                                                        className="h-12 md:h-14 rounded-xl bg-gray-50 border-gray-100 focus:bg-white focus:ring-2 focus:ring-violet-600 focus:border-violet-600 transition-all font-medium text-sm"
                                                    />
                                                </div>

                                                <div className="space-y-2 text-left">
                                                    <Label className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">Message</Label>
                                                    <Textarea
                                                        name="message"
                                                        placeholder="Describe your inquiry in detail..."
                                                        rows={4}
                                                        required
                                                        value={formData.message}
                                                        onChange={handleChange}
                                                        className="rounded-xl md:rounded-2xl bg-gray-50 border-gray-100 focus:bg-white focus:ring-2 focus:ring-violet-600 focus:border-violet-600 transition-all resize-none font-medium p-3 md:p-4 text-sm"
                                                    />
                                                </div>

                                                <Button
                                                    type="submit"
                                                    disabled={status === "sending"}
                                                    className="w-full h-14 md:h-16 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-violet-100 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
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
