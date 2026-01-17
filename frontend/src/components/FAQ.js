import React, { useState } from 'react';
import Navigation from './Navigation';
import Footer from './Footer';
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Minus, Search, HelpCircle, MessageCircle, Package, CreditCard, RefreshCcw, ShieldCheck, Heart, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const FAQItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className={`border-b border-gray-100 last:border-0 transition-all ${isOpen ? 'bg-violet-50/20' : ''}`}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-6 lg:p-8 text-left group"
            >
                <span className={`font-semibold text-base lg:text-lg transition-colors ${isOpen ? 'text-violet-600' : 'text-gray-900 group-hover:text-violet-600'}`}>{question}</span>
                <div className={`flex-shrink-0 ml-4 p-2 rounded-xl transition-all ${isOpen ? 'bg-violet-600 text-white rotate-180' : 'bg-gray-50 text-gray-400 group-hover:bg-violet-50 group-hover:text-violet-600'}`}>
                    {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </div>
            </button>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[500px] pb-8 px-8' : 'max-h-0'}`}>
                <p className="text-gray-500 font-medium leading-relaxed text-sm lg:text-base border-t border-violet-100 pt-6">
                    {answer}
                </p>
            </div>
        </div>
    );
};

const FAQ = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState("all");

    const categories = [
        { id: "all", name: "All Topics", icon: HelpCircle },
        { id: "orders", name: "Ordering", icon: Package },
        { id: "payments", name: "Payments", icon: CreditCard },
        { id: "shipping", name: "Shipping", icon: RefreshCcw },
    ];

    const allFaqs = [
        {
            id: 1,
            category: "orders",
            question: "How do I track my order status?",
            answer: "Once your order has been dispatched, you will receive a confirmation email containing your tracking number and a link to our logistics portal. You can also view real-time updates within your ZippyCart account under the 'Order History' section."
        },
        {
            id: 2,
            category: "payments",
            question: "What payment methods are supported?",
            answer: "We accept all major credit and debit cards (Visa, Mastercard, American Express), UPI transfers, and digital wallets. All transactions are processed through a 256-bit SSL encrypted gateway to ensure your financial data remains secure."
        },
        {
            id: 3,
            category: "shipping",
            question: "What are your delivery timelines?",
            answer: "Standard domestic delivery typically takes 3-5 business days. Express shipping options are available for selected metropolitan areas with 24-48 hour delivery windows. International shipping timelines vary by region, usually taking 7-14 business days."
        },
        {
            id: 4,
            category: "shipping",
            question: "Do you offer international shipping?",
            answer: "Yes, ZippyCart currently ships to over 50 countries worldwide. International orders are subject to local customs duties and taxes, which are calculated and applied during the checkout process for total transparency."
        },
        {
            id: 5,
            category: "orders",
            question: "Can I modify or cancel my order?",
            answer: "Orders can be modified or cancelled within 60 minutes of placement. To ensure efficient delivery, our fulfillment process begins shortly after this window. If your order has already entered the processing phase, you may initiate a return once the item arrives."
        },
        {
            id: 6,
            category: "payments",
            question: "Is my payment information secure?",
            answer: "ZippyCart adheres to Level 1 PCI DSS compliance standards. We do not store your credit card information on our servers; instead, we utilize industry-leading payment tokens to authorize transactions securely."
        }
    ];

    const filteredFaqs = allFaqs.filter(faq => {
        const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTab = activeTab === "all" || faq.category === activeTab;
        return matchesSearch && matchesTab;
    });

    return (
        <div className="min-h-screen bg-[#fcfdfe] flex flex-col">
            <Navigation />

            <main className="flex-1 pt-32 pb-24">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Professional Header */}
                    <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <Badge className="bg-violet-50 text-violet-600 border-none font-bold text-[10px] tracking-[0.3em] px-4 py-1.5 rounded-full uppercase mb-6">
                            Knowledge Base
                        </Badge>
                        <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-8 tracking-tight italicLeading">
                            Support <span className="text-violet-600 font-black italic">Center.</span>
                        </h1>
                        <p className="text-gray-500 text-lg font-medium max-w-2xl mx-auto mb-12">
                            Find comprehensive answers to clinical and logistical questions.
                            If you require further assistance, our team is available 24/7.
                        </p>

                        <div className="relative max-w-2xl mx-auto flex items-center group">
                            <Search className="absolute left-6 text-gray-400 group-focus-within:text-violet-600 w-5 h-5 transition-colors" />
                            <Input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search for topics, keywords, or questions..."
                                className="h-16 pl-14 pr-6 rounded-2xl bg-white border border-gray-100 shadow-xl shadow-gray-100/50 text-base font-medium placeholder:text-gray-300 focus:ring-2 focus:ring-violet-600 transition-all outline-none"
                            />
                        </div>
                    </div>

                    {/* Category Navigation */}
                    <div className="flex flex-wrap justify-center gap-3 mb-12">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveTab(cat.id)}
                                className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === cat.id ? 'bg-violet-600 text-white shadow-lg shadow-violet-200 shadow-xl scale-105' : 'bg-white text-gray-500 border border-gray-100 hover:border-violet-200'}`}
                            >
                                <cat.icon className="w-4 h-4" />
                                {cat.name}
                            </button>
                        ))}
                    </div>

                    {/* FAQ Content Card */}
                    <Card className="border-0 shadow-2xl rounded-[2.5rem] overflow-hidden bg-white border border-gray-50 mb-16">
                        <CardContent className="p-0">
                            {filteredFaqs.length > 0 ? (
                                filteredFaqs.map((faq) => (
                                    <FAQItem key={faq.id} question={faq.question} answer={faq.answer} />
                                ))
                            ) : (
                                <div className="py-20 text-center text-gray-400 font-medium italicLeading">
                                    No results found matching your search coordinates.
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Security Badge Section */}
                    <div className="grid md:grid-cols-3 gap-8 mb-20 text-left">
                        {[
                            { icon: ShieldCheck, title: "Data Protection", desc: "Every interaction is handled with 256-bit encryption protocols." },
                            { icon: Clock, title: "24/7 Availability", desc: "Our automated knowledge base is accessible at all times." },
                            { icon: Heart, title: "Priority Support", desc: "Premium subscribers receive immediate human intervention." }
                        ].map((item, i) => (
                            <div key={i} className="flex gap-4 p-6 bg-gray-50 rounded-3xl border border-gray-100/50">
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-violet-600 shadow-sm flex-shrink-0">
                                    <item.icon className="w-6 h-6" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-bold text-gray-900 text-sm">{item.title}</h4>
                                    <p className="text-gray-400 text-xs font-medium leading-relaxed">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Professional CTA */}
                    <div className="bg-gray-900 rounded-[3rem] p-8 lg:p-12 text-white flex flex-col items-center text-center relative overflow-hidden group shadow-2xl shadow-gray-200">
                        {/* Background Accents */}
                        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/20 rounded-full blur-[100px] -mr-48 -mt-48 transition-transform group-hover:scale-110 duration-1000" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[80px] -ml-32 -mb-32" />

                        <div className="relative z-10 space-y-6">
                            <Badge className="bg-violet-600/20 text-violet-300 border-none font-bold text-[9px] tracking-[0.3em] px-4 py-1.5 rounded-full uppercase italic">Escalation Protocol</Badge>
                            <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">Still have <span className="text-violet-400 font-black italic">Questions?</span></h2>
                            <p className="text-gray-400 text-sm max-w-sm mx-auto leading-relaxed">
                                Our support engineers are standing by to resolve your complex logistical challenges.
                            </p>
                            <div className="pt-4">
                                <Button
                                    onClick={() => window.location.href = '/contact'}
                                    className="h-14 px-8 bg-white text-gray-900 hover:bg-violet-600 hover:text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-2xl shadow-white/5 transition-all active:scale-95 border-0"
                                >
                                    Initiate Direct Support
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default FAQ;
