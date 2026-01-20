import React, { useState } from 'react';
import Navigation from './Navigation';
import Footer from './Footer';
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Minus, Search, HelpCircle, Package, CreditCard, RefreshCcw, ShieldCheck, Heart, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const FAQItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className={`border-b border-gray-100 last:border-0 transition-all ${isOpen ? 'bg-violet-50/10' : ''}`}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-6 text-left group transition-all"
            >
                <span className={`font-semibold text-lg transition-colors ${isOpen ? 'text-violet-600' : 'text-gray-900 group-hover:text-violet-600'}`}>{question}</span>
                <div className={`flex-shrink-0 ml-4 p-2 rounded-xl transition-all ${isOpen ? 'bg-violet-600 text-white rotate-180' : 'bg-gray-100 text-gray-400 group-hover:bg-violet-100 group-hover:text-violet-600'}`}>
                    {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </div>
            </button>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100 pb-8 px-6' : 'max-h-0 opacity-0'}`}>
                <p className="text-gray-500 font-medium leading-relaxed border-t border-violet-50 pt-6">
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
            answer: "Once your order has been dispatched, you will receive a confirmation email containing your tracking number and a link to our logistics portal. You can also view real-time updates within your account under the 'Order History' section."
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
            answer: "Yes, we ship to over 50 countries worldwide. International orders are subject to local customs duties and taxes, which are calculated and applied during the checkout process for total transparency."
        },
        {
            id: 5,
            category: "orders",
            question: "Can I modify or cancel my order?",
            answer: "Orders can be modified or cancelled within 60 minutes of placement. If your order has already entered the processing phase, you may initiate a return once the item arrives."
        },
        {
            id: 6,
            category: "payments",
            question: "Is my payment information secure?",
            answer: "We adhere to Level 1 PCI DSS compliance standards. We do not store your credit card information on our servers; instead, we utilize industry-leading payment tokens to authorize transactions securely."
        }
    ];

    const filteredFaqs = allFaqs.filter(faq => {
        const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTab = activeTab === "all" || faq.category === activeTab;
        return matchesSearch && matchesTab;
    });

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Navigation />

            <main className="flex-1 pt-20">
                {/* Hero Header */}
                <section className="bg-gray-50 border-b border-gray-100">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-100 text-violet-600 text-[10px] font-bold uppercase tracking-widest mb-6 mx-auto">
                            Knowledge Base
                        </div>
                        <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-8 tracking-tight">
                            Frequently Asked <span className="text-violet-600">Questions.</span>
                        </h1>
                        <p className="text-gray-500 text-lg font-medium max-w-2xl mx-auto mb-12">
                            Find answers to common questions about your shopping experience.
                            Can't find what you're looking for? Our team is always here to help.
                        </p>

                        <div className="relative max-w-2xl mx-auto flex items-center">
                            <Search className="absolute left-6 text-gray-400 w-5 h-5" />
                            <Input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search for questions, topics..."
                                className="h-16 pl-14 pr-6 rounded-2xl bg-white border border-gray-200 shadow-xl shadow-gray-100/50 text-base font-medium placeholder:text-gray-300 focus:ring-2 focus:ring-violet-600 transition-all outline-none"
                            />
                        </div>
                    </div>
                </section>

                <section className="py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Category Tabs */}
                    <div className="flex flex-wrap justify-center gap-3 mb-12">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveTab(cat.id)}
                                className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === cat.id ? 'bg-violet-600 text-white shadow-lg shadow-violet-200 shadow-xl' : 'bg-white text-gray-500 border border-gray-100 hover:border-violet-200'}`}
                            >
                                <cat.icon className="w-4 h-4" />
                                {cat.name}
                            </button>
                        ))}
                    </div>

                    {/* FAQ List */}
                    <Card className="border border-gray-100 shadow-lg rounded-[2rem] overflow-hidden bg-white mb-20">
                        <CardContent className="p-0">
                            {filteredFaqs.length > 0 ? (
                                filteredFaqs.map((faq) => (
                                    <FAQItem key={faq.id} question={faq.question} answer={faq.answer} />
                                ))
                            ) : (
                                <div className="py-20 text-center text-gray-400 font-medium italic">
                                    No results found matching your search.
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Features Grid */}
                    <div className="grid md:grid-cols-3 gap-8 mb-20">
                        {[
                            { icon: ShieldCheck, title: "Secure Data", desc: "Every interaction is handled with industry-standard encryption." },
                            { icon: Clock, title: "Available 24/7", desc: "Our help center is always open for your convenience." },
                            { icon: Heart, title: "Priority Support", desc: "Our premium members get immediate access to human support." }
                        ].map((item, i) => (
                            <div key={i} className="flex gap-4 p-6 bg-gray-50 rounded-3xl border border-gray-100/50 text-left">
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-violet-600 shadow-sm shrink-0">
                                    <item.icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 text-sm mb-1">{item.title}</h4>
                                    <p className="text-gray-500 text-xs font-medium leading-relaxed">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* CTA Section */}
                    <div className="bg-gray-900 rounded-[3rem] p-8 lg:p-12 text-white text-center relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/20 rounded-full blur-[100px] -mr-48 -mt-48" />
                        <div className="relative z-10 space-y-6">
                            <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">Still have <span className="text-violet-400 italic font-black">Questions?</span></h2>
                            <p className="text-gray-400 text-sm max-w-sm mx-auto leading-relaxed">
                                Our support team is ready to help you with any further inquiries.
                            </p>
                            <div className="pt-4">
                                <Button
                                    onClick={() => window.location.href = '/contact'}
                                    className="h-14 px-8 bg-white text-gray-900 hover:bg-violet-600 hover:text-white rounded-2xl text-xs font-bold uppercase tracking-[0.2em] transition-all border-0 shadow-lg"
                                >
                                    Contact Support
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default FAQ;
