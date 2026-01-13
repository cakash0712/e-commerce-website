import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
    Lock,
    ChevronDown,
    ChevronRight,
    MapPin,
    CreditCard,
    Smartphone,
    Truck,
    CheckCircle2,
    ShieldCheck,
    Info,
    ArrowLeft,
    Box,
} from "lucide-react";
import { useCart, useOrders } from "../App";

const Payment = () => {
    const navigate = useNavigate();
    const { cartItems, getCartTotal } = useCart();
    const { addOrder } = useOrders();

    const [activeSection, setActiveSection] = useState(1); // 1: Shipping, 2: Payment, 3: Review
    const [isProcessing, setIsProcessing] = useState(false);
    const [orderComplete, setOrderComplete] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('card');

    const [address, setAddress] = useState({
        name: 'John Doe',
        street: '123 Shopping Lane',
        city: 'Bangalore',
        state: 'Karnataka',
        zip: '560102',
        phone: '+91 98765 43210'
    });

    const subtotal = getCartTotal();
    const shipping = subtotal > 499 ? 0 : 99;
    const tax = subtotal * 0.18;
    const total = subtotal + shipping + tax;

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [activeSection, orderComplete]);

    const handlePlaceOrder = () => {
        setIsProcessing(true);
        // Simulate Amazon-like "Processing"
        setTimeout(() => {
            const newOrder = {
                id: `SV-AMZ-${Math.floor(100000 + Math.random() * 900000)}`,
                date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
                items: [...cartItems],
                total: total,
                status: 'Ordered',
                paymentMethod: paymentMethod,
                deliveryTimeline: 'Arriving Friday'
            };
            addOrder(newOrder);
            setIsProcessing(false);
            setOrderComplete(true);
        }, 2000);
    };

    if (orderComplete) {
        return (
            <div className="min-h-screen bg-white">
                <header className="border-b border-gray-200 py-3 mb-8 bg-white fixed top-0 left-0 right-0 z-50">
                    <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
                        <Link to="/" className="text-2xl font-bold flex items-center gap-2">
                            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
                                <Box className="w-5 h-5 text-white" />
                            </div>
                            <span className="tracking-tighter">ShopVerse</span>
                        </Link>
                        <h1 className="text-xl font-medium tracking-tight text-gray-700">Order Placed</h1>
                    </div>
                </header>

                <main className="max-w-4xl mx-auto px-4 pt-28 pb-12">
                    <div className="border border-green-600 bg-green-50/20 rounded-lg p-6 flex gap-4 items-start mb-8">
                        <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <CheckCircle2 className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-green-800">Order successfully placed!</h2>
                            <p className="text-sm text-gray-700 mt-1">Confirmation will be sent to your email. Order ID: <span className="font-bold">#SV-AMZ-99210</span></p>
                            <div className="mt-4 flex gap-4">
                                <Button onClick={() => navigate('/profile')} variant="outline" className="h-9 border-gray-300 text-sm font-normal">View orders</Button>
                                <Button onClick={() => navigate('/')} className="h-9 bg-violet-600 hover:bg-violet-700 text-white border-none text-sm">Continue Shopping</Button>
                            </div>
                        </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-6 space-y-6">
                        <h3 className="font-bold text-lg">Order Summary</h3>
                        <div className="grid md:grid-cols-2 gap-8 text-sm">
                            <div className="space-y-4">
                                <div>
                                    <p className="font-bold">Shipping Address</p>
                                    <p>{address.name}</p>
                                    <p>{address.street}</p>
                                    <p>{address.city}, {address.state} {address.zip}</p>
                                </div>
                                <div>
                                    <p className="font-bold">Payment Method</p>
                                    <p className="capitalize">{paymentMethod} Payment</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span>Items:</span>
                                    <span>₹{subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Shipping:</span>
                                    <span>₹{shipping.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg border-t border-gray-100 pt-2 mt-2">
                                    <span>Grand Total:</span>
                                    <span>₹{total.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8f9f9] font-sans">
            {/* Amazon Distraction-Free Header with Website Colors */}
            <header className="border-b border-gray-200 py-3 bg-white fixed top-0 left-0 right-0 z-50">
                <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
                            <Box className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-2xl font-bold tracking-tighter">ShopVerse</span>
                    </Link>
                    <h1 className="text-2xl font-light text-gray-700 hidden sm:block">Checkout</h1>
                    <div className="text-gray-400">
                        <Lock className="w-6 h-6" />
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 pt-24 pb-12">
                <div className="grid lg:grid-cols-12 gap-6 items-start">

                    {/* Left Column: Amazon Steps */}
                    <div className="lg:col-span-8 space-y-3">

                        {/* 1. Shipping Address */}
                        <div className={`border border-gray-200 rounded bg-white overflow-hidden ${activeSection === 1 ? 'shadow-sm' : ''}`}>
                            <div className="px-6 py-4 flex items-start gap-5">
                                <span className={`text-xl font-bold mt-0.5 ${activeSection === 1 ? 'text-violet-600' : 'text-gray-400'}`}>1</span>
                                <div className="flex-1 flex items-start justify-between">
                                    <div>
                                        <h2 className="text-lg font-bold">Shipping address</h2>
                                        {activeSection !== 1 && (
                                            <div className="text-sm mt-1 text-gray-700">
                                                <p>{address.name}</p>
                                                <p>{address.street}, {address.city}, {address.zip}</p>
                                            </div>
                                        )}
                                    </div>
                                    {activeSection !== 1 && (
                                        <button onClick={() => setActiveSection(1)} className="text-xs text-violet-600 hover:text-violet-700 hover:underline">Change</button>
                                    )}
                                </div>
                            </div>

                            {activeSection === 1 && (
                                <div className="px-16 pb-6 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <Label className="text-sm font-bold">Full name</Label>
                                            <Input defaultValue={address.name} className="h-8 border-gray-300 focus:border-violet-600" />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-sm font-bold">Mobile number</Label>
                                            <Input defaultValue={address.phone} className="h-8 border-gray-300 focus:border-violet-600" />
                                        </div>
                                        <div className="space-y-1 col-span-full">
                                            <Label className="text-sm font-bold">Address line</Label>
                                            <Input defaultValue={address.street} className="h-8 border-gray-300 focus:border-violet-600" />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-sm font-bold">Town/City</Label>
                                            <Input defaultValue={address.city} className="h-8 border-gray-300 focus:border-violet-600" />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-sm font-bold">PIN code</Label>
                                            <Input defaultValue={address.zip} className="h-8 border-gray-300 focus:border-violet-600" />
                                        </div>
                                    </div>
                                    <Button
                                        onClick={() => setActiveSection(2)}
                                        className="bg-violet-600 hover:bg-violet-700 text-white rounded h-8 px-6 text-sm font-normal shadow-sm"
                                    >
                                        Use this address
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* 2. Payment Method */}
                        <div className={`border border-gray-200 rounded bg-white overflow-hidden ${activeSection === 2 ? 'shadow-sm' : ''}`}>
                            <div className="px-6 py-4 flex items-start gap-5">
                                <span className={`text-xl font-bold mt-0.5 ${activeSection === 2 ? 'text-violet-600' : 'text-gray-400'}`}>2</span>
                                <div className="flex-1 flex items-start justify-between">
                                    <div>
                                        <h2 className="text-lg font-bold">Payment method</h2>
                                        {activeSection > 2 && (
                                            <div className="text-sm mt-1 text-gray-700 capitalize">
                                                {paymentMethod} payment
                                            </div>
                                        )}
                                    </div>
                                    {activeSection > 2 && (
                                        <button onClick={() => setActiveSection(2)} className="text-xs text-violet-600 hover:text-violet-700 hover:underline">Change</button>
                                    )}
                                </div>
                            </div>

                            {activeSection === 2 && (
                                <div className="px-16 pb-6 space-y-6">
                                    <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-4">
                                        <div className="flex items-start gap-3 p-4 border rounded-md border-gray-200">
                                            <RadioGroupItem value="card" id="card" className="mt-1 border-gray-400 text-violet-600" />
                                            <div className="flex-1">
                                                <Label htmlFor="card" className="font-bold flex items-center justify-between cursor-pointer">
                                                    Credit or Debit Card
                                                    <CreditCard className="w-5 h-5 text-gray-400" />
                                                </Label>
                                                {paymentMethod === 'card' && (
                                                    <div className="mt-4 space-y-4">
                                                        <Input placeholder="Card number" className="h-8 border-gray-300" />
                                                        <div className="flex gap-4">
                                                            <Input placeholder="MM/YY" className="h-8 border-gray-300 flex-1" />
                                                            <Input placeholder="CVV" type="password" className="h-8 border-gray-300 flex-1" />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3 p-4 border rounded-md border-gray-200">
                                            <RadioGroupItem value="upi" id="upi" className="mt-1 border-gray-400 text-violet-600" />
                                            <div className="flex-1">
                                                <Label htmlFor="upi" className="font-bold flex items-center justify-between cursor-pointer">
                                                    UPI ID
                                                    <Smartphone className="w-5 h-5 text-gray-400" />
                                                </Label>
                                                {paymentMethod === 'upi' && (
                                                    <div className="mt-4">
                                                        <Input placeholder="yourname@bank" className="h-8 border-gray-300 max-w-sm" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </RadioGroup>
                                    <Button
                                        onClick={() => setActiveSection(3)}
                                        className="bg-violet-600 hover:bg-violet-700 text-white rounded h-8 px-6 text-sm font-normal shadow-sm"
                                    >
                                        Use this payment method
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* 3. Review Items */}
                        <div className={`border border-gray-200 rounded bg-white overflow-hidden ${activeSection === 3 ? 'shadow-sm' : ''}`}>
                            <div className="px-6 py-4 flex items-start gap-5">
                                <span className={`text-xl font-bold mt-0.5 ${activeSection === 3 ? 'text-violet-600' : 'text-gray-400'}`}>3</span>
                                <div className="flex-1 flex justify-between">
                                    <h2 className="text-lg font-bold">Review items and delivery</h2>
                                </div>
                            </div>

                            {activeSection === 3 && (
                                <div className="px-16 pb-8">
                                    <div className="border border-gray-200 rounded-md p-4 bg-white mb-6">
                                        <p className="font-bold text-green-700 text-sm mb-4">Arriving Friday, Jan 16</p>
                                        <div className="space-y-4">
                                            {cartItems.map((item) => (
                                                <div key={item.id} className="flex gap-4">
                                                    <div className="w-16 h-16 bg-gray-50 border p-1 rounded">
                                                        <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-sm line-clamp-1">{item.name}</h4>
                                                        <p className="text-xs font-bold text-gray-900 mt-1">₹{item.price.toLocaleString()}</p>
                                                        <p className="text-xs mt-1">Quantity: {item.quantity}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                        <p className="text-[10px] text-gray-600 max-w-[200px]">By placing your order, you agree to ShopVerse's privacy notice and conditions of use.</p>
                                        <Button
                                            onClick={handlePlaceOrder}
                                            disabled={isProcessing}
                                            className="bg-violet-600 hover:bg-violet-700 text-white rounded-md h-10 px-10 font-bold shadow-md text-sm"
                                        >
                                            {isProcessing ? "Processing..." : "Place your order"}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Amazon Sidebar */}
                    <div className="lg:col-span-4 sticky top-20">
                        <Card className="border border-gray-200 shadow-sm rounded-md bg-white p-5 space-y-5">
                            <Button
                                onClick={activeSection === 3 ? handlePlaceOrder : () => setActiveSection(activeSection + 1)}
                                disabled={isProcessing}
                                className="w-full bg-violet-600 hover:bg-violet-700 text-white rounded h-9 font-normal shadow-sm text-sm"
                            >
                                {isProcessing ? "Processing..." : activeSection === 3 ? "Place your order" : "Continue"}
                            </Button>

                            <p className="text-[10px] text-center text-gray-500">
                                Choose a payment method to continue. Your order is not yet final.
                            </p>

                            <Separator className="bg-gray-100" />

                            <div className="space-y-4">
                                <h3 className="text-sm font-bold">Order Summary</h3>
                                <div className="space-y-2 text-xs">
                                    <div className="flex justify-between">
                                        <span>Items:</span>
                                        <span>₹{subtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Shipping:</span>
                                        <span className={shipping === 0 ? 'text-green-700 font-bold' : ''}>{shipping === 0 ? '--' : `₹${shipping}`}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Total before tax:</span>
                                        <span>₹{(subtotal + shipping).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Estimated tax:</span>
                                        <span>₹{tax.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            <Separator className="bg-gray-100" />

                            <div className="flex justify-between items-center text-lg font-bold text-red-700">
                                <span>Order Total:</span>
                                <span>₹{total.toLocaleString()}</span>
                            </div>

                            <div className="bg-gray-50 rounded-md p-3 border border-gray-200 text-[10px] flex items-center gap-2 text-blue-600 hover:underline cursor-pointer">
                                <Info className="w-3 h-3 text-gray-400" />
                                How are shipping costs calculated?
                            </div>
                        </Card>

                        <div className="mt-3 p-3 border border-gray-200 rounded-md bg-white flex items-center justify-center gap-2 text-[10px] text-gray-600">
                            <ShieldCheck className="w-4 h-4 text-gray-400" />
                            Secure transaction
                        </div>
                    </div>
                </div>

                <div className="mt-20 text-[10px] text-gray-500 text-center space-y-4 max-w-4xl mx-auto">
                    <Separator className="bg-gray-200" />
                    <div className="flex justify-center gap-6">
                        <Link to="/terms" className="hover:text-red-700 hover:underline">Conditions</Link>
                        <Link to="/privacy" className="hover:text-red-700 hover:underline">Privacy</Link>
                        <Link to="/help" className="hover:text-red-700 hover:underline">Help</Link>
                    </div>
                    <p>© ShopVerse.com, Inc. or its affiliates</p>
                </div>
            </main>
        </div>
    );
};

export default Payment;
