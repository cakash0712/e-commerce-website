import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import {
    Lock,
    ChevronRight,
    MapPin,
    CreditCard,
    Smartphone,
    Truck,
    CheckCircle2,
    ShieldCheck,
    Info,
    Box,
    Tag,
    Clock,
    User,
    Check,
    Zap
} from "lucide-react";
import { useCart, useOrders, useAuth, useCoupons } from "../App";

const Payment = () => {
    const navigate = useNavigate();
    const { cartItems, getCartTotal } = useCart();
    const { addOrder } = useOrders();
    const { user } = useAuth();

    const { validateCoupon } = useCoupons();
    const [activeSection, setActiveSection] = useState(1); // 1: Address/Guest, 2: Shipping, 3: Payment, 4: Review
    const [isProcessing, setIsProcessing] = useState(false);
    const [orderComplete, setOrderComplete] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [shippingMethod, setShippingMethod] = useState('standard');
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponError, setCouponError] = useState('');

    const subtotal = getCartTotal();

    const handleApplyCoupon = () => {
        setCouponError('');
        const result = validateCoupon(couponCode, cartItems, subtotal);
        if (result.valid) {
            setAppliedCoupon(result.coupon);
            setCouponCode('');
        } else {
            setCouponError(result.message);
            setAppliedCoupon(null);
        }
    };

    const getDiscountValue = () => {
        if (!appliedCoupon) return 0;
        if (appliedCoupon.type === 'percentage') {
            return (subtotal * appliedCoupon.value) / 100;
        }
        return appliedCoupon.value;
    };

    const discount = getDiscountValue();

    const [address, setAddress] = useState({
        email: user?.email || '',
        name: user?.name || '',
        street: '',
        city: '',
        state: '',
        zip: '',
        phone: ''
    });

    const shippingCost = shippingMethod === 'express' ? 150 : (subtotal > 499 ? 0 : 99);
    const tax = subtotal * 0.18;
    const total = subtotal + shippingCost + tax - discount;

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [activeSection, orderComplete]);

    const handlePlaceOrder = () => {
        setIsProcessing(true);
        setTimeout(() => {
            const newOrder = {
                id: `ZIP-${Math.floor(100000 + Math.random() * 900000)}`,
                date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
                items: [...cartItems],
                total: total,
                status: 'Confirmed',
                paymentMethod: paymentMethod,
                deliveryTimeline: shippingMethod === 'express' ? 'Arriving Tomorrow' : 'Arriving in 3-5 Days'
            };
            addOrder(newOrder);
            setIsProcessing(false);
            setOrderComplete(true);
        }, 2000);
    };

    if (orderComplete) {
        return (
            <div className="min-h-screen bg-white">
                <header className="border-b border-gray-100 py-6 mb-8 bg-white fixed top-0 left-0 right-0 z-50">
                    <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                        <Link to="/" className="text-3xl font-black flex items-center gap-2 tracking-tighter italic">
                            <div className="w-10 h-10 bg-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-200">
                                <Box className="w-6 h-6 text-white" />
                            </div>
                            <span>ZIPPY<span className="text-violet-600">CART.</span></span>
                        </Link>
                        <Badge className="bg-emerald-50 text-emerald-600 border-none font-black px-4 py-1.5 rounded-full uppercase tracking-widest text-[10px]">Order Confirmed</Badge>
                    </div>
                </header>

                <main className="max-w-4xl mx-auto px-6 pt-32 pb-20">
                    <div className="bg-gray-900 rounded-[3rem] p-12 text-center text-white relative overflow-hidden shadow-2xl mb-12">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/20 blur-[120px] rounded-full"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/20 blur-[120px] rounded-full"></div>

                        <div className="relative">
                            <div className="w-20 h-20 bg-emerald-500 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-500/20">
                                <Check className="w-10 h-10 text-white stroke-[4]" />
                            </div>
                            <h2 className="text-5xl font-black tracking-tighter mb-4 italic">Success <span className="text-violet-400">Locked.</span></h2>
                            <p className="text-gray-400 font-medium text-lg mb-10 max-w-sm mx-auto">Your order is being encrypted and transmitted to our global logistics node.</p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button onClick={() => navigate('/profile')} variant="outline" className="h-14 bg-white/5 border-white/10 hover:bg-white/10 text-white rounded-2xl px-8 font-black uppercase tracking-widest text-xs">
                                    Track Order
                                </Button>
                                <Button onClick={() => navigate('/')} className="h-14 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl px-10 font-black uppercase tracking-widest text-xs shadow-xl shadow-violet-600/20">
                                    Continue Shopping
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <Card className="rounded-[2.5rem] border-gray-100 shadow-xl p-8">
                            <h3 className="text-xl font-black mb-6 italic">Delivery <span className="text-violet-600">Details.</span></h3>
                            <div className="space-y-4 text-sm">
                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-start gap-3">
                                    <MapPin className="w-5 h-5 text-violet-600 mt-0.5" />
                                    <div>
                                        <p className="font-black text-[10px] uppercase text-gray-400 tracking-widest mb-1">Destination</p>
                                        <p className="font-bold text-gray-900">{address.name}</p>
                                        <p className="text-gray-500 font-medium">{address.street}, {address.city}</p>
                                    </div>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-start gap-3">
                                    <Clock className="w-5 h-5 text-violet-600 mt-0.5" />
                                    <div>
                                        <p className="font-black text-[10px] uppercase text-gray-400 tracking-widest mb-1">Timeline</p>
                                        <p className="font-bold text-gray-900">{shippingMethod === 'express' ? 'Arriving Tomorrow' : 'Arriving in 3-5 Days'}</p>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <Card className="rounded-[2.5rem] border-gray-100 shadow-xl p-8">
                            <h3 className="text-xl font-black mb-6 italic">Fiscal <span className="text-violet-600">Summary.</span></h3>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm font-medium text-gray-500">
                                    <span>Subtotal</span>
                                    <span>₹{subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm font-medium text-gray-500">
                                    <span>Shipping</span>
                                    <span>{shippingCost === 0 ? 'FREE' : `₹${shippingCost}`}</span>
                                </div>
                                {discount > 0 && (
                                    <div className="flex justify-between text-sm font-black text-emerald-600">
                                        <span>Discount</span>
                                        <span>-₹{discount.toLocaleString()}</span>
                                    </div>
                                )}
                                <Separator className="my-2 bg-gray-50" />
                                <div className="flex justify-between text-2xl font-black text-gray-900 italic">
                                    <span>Total</span>
                                    <span className="text-violet-600 font-black italic">₹{total.toLocaleString()}</span>
                                </div>
                            </div>
                        </Card>
                    </div>
                </main>
            </div>
        );
    }

    const ProgressHeader = () => (
        <div className="flex items-center justify-between mb-12">
            {[
                { step: 1, label: 'Address' },
                { step: 2, label: 'Delivery' },
                { step: 3, label: 'Payment' },
                { step: 4, label: 'Review' }
            ].map((s, idx) => (
                <React.Fragment key={idx}>
                    <div className="flex flex-col items-center gap-2 group cursor-pointer" onClick={() => (activeSection > s.step && setActiveSection(s.step))}>
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black transition-all ${activeSection === s.step ? 'bg-violet-600 text-white shadow-xl shadow-violet-200 scale-110' : activeSection > s.step ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>
                            {activeSection > s.step ? <Check className="w-5 h-5 stroke-[4]" /> : s.step}
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${activeSection === s.step ? 'text-violet-600' : 'text-gray-400'}`}>{s.label}</span>
                    </div>
                    {idx < 3 && <div className={`h-[2px] flex-1 mx-4 rounded-full ${activeSection > s.step ? 'bg-emerald-500' : 'bg-gray-100'}`} />}
                </React.Fragment>
            ))}
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50/50">
            <header className="border-b border-gray-100 py-6 bg-white/80 backdrop-blur-xl fixed top-0 left-0 right-0 z-50">
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                    <Link to="/" className="text-3xl font-black flex items-center gap-2 tracking-tighter italic">
                        <div className="w-10 h-10 bg-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-200">
                            <Box className="w-6 h-6 text-white" />
                        </div>
                        <span>ZIPPY<span className="text-violet-600">CART.</span></span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <ShieldCheck className="w-5 h-5 text-emerald-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Secure Protocol Active</span>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 pt-32 pb-20">
                <div className="grid lg:grid-cols-12 gap-12 items-start">

                    <div className="lg:col-span-8">
                        <ProgressHeader />

                        <div className="space-y-6">
                            {/* Step 1: Address / Guest */}
                            <Card className={`rounded-[2.5rem] overflow-hidden border-none shadow-xl transition-all ${activeSection === 1 ? 'ring-2 ring-violet-100' : 'opacity-60 grayscale-[0.5]'}`}>
                                <div className="p-10">
                                    <div className="flex items-center justify-between mb-8">
                                        <h3 className="text-2xl font-black italic">Address <span className="text-violet-600">& Contact.</span></h3>
                                        {!user && activeSection === 1 && <Badge className="bg-amber-50 text-amber-600 border-none px-4 py-1">Guest Checkout</Badge>}
                                    </div>

                                    {activeSection === 1 ? (
                                        <div className="grid md:grid-cols-2 gap-6">
                                            {!user && (
                                                <div className="col-span-full p-6 bg-violet-50 rounded-[2rem] border border-violet-100 flex items-start gap-4 mb-2">
                                                    <User className="w-6 h-6 text-violet-600" />
                                                    <div className="flex-1">
                                                        <p className="text-sm font-black text-violet-900 uppercase tracking-tight">Shopping as Guest</p>
                                                        <p className="text-xs font-medium text-violet-600 mt-1">Fill in your details below or <Link to="/auth" className="underline font-black hover:text-violet-900 transition-colors">Sign In</Link> for exclusive rewards.</p>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Email Terminal</Label>
                                                <Input
                                                    placeholder="e.g. pilot@zippy.com"
                                                    value={address.email}
                                                    onChange={e => setAddress({ ...address, email: e.target.value })}
                                                    className="h-14 rounded-2xl border-gray-100 focus:border-violet-600 font-bold"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Full Name</Label>
                                                <Input
                                                    placeholder="Pilot Identification"
                                                    value={address.name}
                                                    onChange={e => setAddress({ ...address, name: e.target.value })}
                                                    className="h-14 rounded-2xl border-gray-100 focus:border-violet-600 font-bold"
                                                />
                                            </div>
                                            <div className="col-span-full space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Secure Drop Point (Street)</Label>
                                                <Input
                                                    placeholder="Street, Block, Node"
                                                    value={address.street}
                                                    onChange={e => setAddress({ ...address, street: e.target.value })}
                                                    className="h-14 rounded-2xl border-gray-100 focus:border-violet-600 font-bold"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">City Node</Label>
                                                <Input
                                                    placeholder="Bangalore Central"
                                                    value={address.city}
                                                    onChange={e => setAddress({ ...address, city: e.target.value })}
                                                    className="h-14 rounded-2xl border-gray-100 focus:border-violet-600 font-bold"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">ZIP Hash</Label>
                                                <Input
                                                    placeholder="560102"
                                                    value={address.zip}
                                                    onChange={e => setAddress({ ...address, zip: e.target.value })}
                                                    className="h-14 rounded-2xl border-gray-100 focus:border-violet-600 font-bold"
                                                />
                                            </div>
                                            <Button onClick={() => setActiveSection(2)} className="col-span-full h-16 bg-gray-900 hover:bg-violet-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-2xl transition-all mt-4">
                                                Lock Address
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="flex items-start gap-4 p-6 bg-gray-50 rounded-[2rem] border border-gray-100">
                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-gray-100 text-violet-600">
                                                <MapPin className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-black text-gray-900 uppercase tracking-tight text-sm">{address.name}</p>
                                                <p className="text-gray-500 font-medium text-sm">{address.street}, {address.city}, {address.zip}</p>
                                            </div>
                                            <Button variant="ghost" onClick={() => setActiveSection(1)} className="text-violet-600 font-black uppercase tracking-widest text-[10px] hover:bg-violet-50 px-4">Change</Button>
                                        </div>
                                    )}
                                </div>
                            </Card>

                            {/* Step 2: Shipping Method */}
                            <Card className={`rounded-[2.5rem] overflow-hidden border-none shadow-xl transition-all ${activeSection === 2 ? 'ring-2 ring-violet-100' : 'opacity-60'}`}>
                                <div className="p-10">
                                    <h3 className="text-2xl font-black italic mb-8">Shipping <span className="text-violet-600">Velocity.</span></h3>

                                    {activeSection === 2 ? (
                                        <RadioGroup value={shippingMethod} onValueChange={setShippingMethod} className="grid md:grid-cols-2 gap-6">
                                            <div className={`p-8 rounded-[2rem] border-4 transition-all cursor-pointer relative ${shippingMethod === 'standard' ? 'border-violet-600 bg-violet-50/30' : 'border-gray-50 bg-white hover:border-gray-100'}`}>
                                                <RadioGroupItem value="standard" id="standard" className="sr-only" />
                                                <Label htmlFor="standard" className="cursor-pointer">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <Truck className={`w-8 h-8 ${shippingMethod === 'standard' ? 'text-violet-600' : 'text-gray-400'}`} />
                                                        <Badge className="bg-gray-100 text-gray-600 font-black">Standard</Badge>
                                                    </div>
                                                    <p className="text-xl font-black text-gray-900 tracking-tighter italic">Normal <span className="text-gray-400">Node.</span></p>
                                                    <p className="text-sm font-medium text-gray-500 mt-2">Delivery in 3-5 standard cycles.</p>
                                                    <div className="mt-4 text-emerald-600 font-black italic">
                                                        {subtotal > 499 ? 'FREE OF CHARGE' : '₹99 Processing'}
                                                    </div>
                                                </Label>
                                            </div>

                                            <div className={`p-8 rounded-[2rem] border-4 transition-all cursor-pointer relative ${shippingMethod === 'express' ? 'border-violet-600 bg-violet-50/30' : 'border-gray-50 bg-white hover:border-gray-100'}`}>
                                                <RadioGroupItem value="express" id="express" className="sr-only" />
                                                <Label htmlFor="express" className="cursor-pointer">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <Zap className={`w-8 h-8 ${shippingMethod === 'express' ? 'text-violet-600' : 'text-gray-400'}`} />
                                                        <Badge className="bg-violet-600 text-white font-black">Express</Badge>
                                                    </div>
                                                    <p className="text-xl font-black text-gray-900 tracking-tighter italic">Instant <span className="text-violet-600">Access.</span></p>
                                                    <p className="text-sm font-medium text-gray-500 mt-2">Delivery within 24 standard hours.</p>
                                                    <div className="mt-4 text-violet-600 font-black italic">₹150 Priority Fee</div>
                                                </Label>
                                            </div>

                                            <Button onClick={() => setActiveSection(3)} className="col-span-full h-16 bg-gray-900 hover:bg-violet-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-2xl transition-all mt-4">
                                                Confirm Velocity
                                            </Button>
                                        </RadioGroup>
                                    ) : activeSection > 2 && (
                                        <div className="flex items-center gap-4 p-6 bg-gray-50 rounded-[2rem] border border-gray-100">
                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-gray-100 text-violet-600">
                                                <Zap className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-black text-gray-900 uppercase tracking-tight text-sm">{shippingMethod === 'standard' ? 'Normal Mode' : 'Instant Access Mode'}</p>
                                                <p className="text-gray-500 font-medium text-sm">{shippingMethod === 'standard' ? 'Estimated 3-5 days' : 'Estimated Tomorrow'}</p>
                                            </div>
                                            <Button variant="ghost" onClick={() => setActiveSection(2)} className="text-violet-600 font-black uppercase tracking-widest text-[10px] hover:bg-violet-50 px-4">Change</Button>
                                        </div>
                                    )}
                                </div>
                            </Card>

                            {/* Step 3: Payment */}
                            <Card className={`rounded-[2.5rem] overflow-hidden border-none shadow-xl transition-all ${activeSection === 3 ? 'ring-2 ring-violet-100' : 'opacity-60'}`}>
                                <div className="p-10">
                                    <h3 className="text-2xl font-black italic mb-8">Asset <span className="text-violet-600">Transfer.</span></h3>

                                    {activeSection === 3 ? (
                                        <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-4">
                                            <div className={`p-6 rounded-[2rem] border-4 transition-all cursor-pointer flex items-center gap-6 ${paymentMethod === 'card' ? 'border-violet-600 bg-violet-50/30' : 'border-gray-50 bg-white hover:border-gray-100'}`}>
                                                <RadioGroupItem value="card" id="p-card" className="sr-only" />
                                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${paymentMethod === 'card' ? 'bg-violet-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                                    <CreditCard className="w-7 h-7" />
                                                </div>
                                                <Label htmlFor="p-card" className="flex-1 cursor-pointer">
                                                    <p className="text-lg font-black text-gray-900 tracking-tighter uppercase italic">Credit / Debit encrypted</p>
                                                    <p className="text-xs font-medium text-gray-400 mt-1">PCI-DSS Level 1 compliant gateway.</p>
                                                </Label>
                                            </div>

                                            <div className={`p-6 rounded-[2rem] border-4 transition-all cursor-pointer flex items-center gap-6 ${paymentMethod === 'upi' ? 'border-violet-600 bg-violet-50/30' : 'border-gray-50 bg-white hover:border-gray-100'}`}>
                                                <RadioGroupItem value="upi" id="p-upi" className="sr-only" />
                                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${paymentMethod === 'upi' ? 'bg-violet-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                                    <Smartphone className="w-7 h-7" />
                                                </div>
                                                <Label htmlFor="p-upi" className="flex-1 cursor-pointer">
                                                    <p className="text-lg font-black text-gray-900 tracking-tighter uppercase italic">Unified Payment ID</p>
                                                    <p className="text-xs font-medium text-gray-400 mt-1">Direct bank-to-bank node transfer.</p>
                                                </Label>
                                            </div>

                                            <Button onClick={() => setActiveSection(4)} className="w-full h-16 bg-gray-900 hover:bg-violet-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-2xl transition-all mt-4">
                                                Confirm Method
                                            </Button>
                                        </RadioGroup>
                                    ) : activeSection > 3 && (
                                        <div className="flex items-center gap-4 p-6 bg-gray-50 rounded-[2rem] border border-gray-100">
                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-gray-100 text-violet-600">
                                                <ShieldCheck className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-black text-gray-900 uppercase tracking-tight text-sm">Encrypted Asset Access</p>
                                                <p className="text-gray-500 font-medium text-sm capitalize">{paymentMethod} protocol synchronized.</p>
                                            </div>
                                            <Button variant="ghost" onClick={() => setActiveSection(3)} className="text-violet-600 font-black uppercase tracking-widest text-[10px] hover:bg-violet-50 px-4">Change</Button>
                                        </div>
                                    )}
                                </div>
                            </Card>

                            {/* Step 4: Review */}
                            <Card className={`rounded-[2.5rem] overflow-hidden border-none shadow-xl transition-all ${activeSection === 4 ? 'ring-2 ring-violet-100' : 'opacity-60'}`}>
                                <div className="p-10">
                                    <h3 className="text-2xl font-black italic mb-8">Final <span className="text-violet-600">Validation.</span></h3>

                                    {activeSection === 4 && (
                                        <div className="space-y-6">
                                            <div className="p-8 bg-gray-900 rounded-[2rem] text-white">
                                                <div className="flex items-center justify-between mb-8">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-violet-400 italic">Order Payload</span>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Ready to Send</span>
                                                </div>
                                                <div className="space-y-6 max-h-[300px] overflow-y-auto custom-scrollbar pr-4">
                                                    {cartItems.map((item) => (
                                                        <div key={item.id} className="flex gap-6 items-center">
                                                            <div className="w-20 h-20 bg-white/5 rounded-2xl overflow-hidden border border-white/10 shrink-0">
                                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <h4 className="font-black text-sm uppercase italic tracking-tight">{item.name}</h4>
                                                                <div className="flex items-center justify-between mt-2">
                                                                    <span className="text-xs font-medium text-gray-500">Qty: {item.quantity}</span>
                                                                    <span className="text-sm font-black text-violet-400 italic">₹{(item.price * item.quantity).toLocaleString()}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="p-6 bg-emerald-50 rounded-[2rem] border border-emerald-100 flex items-center gap-4">
                                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-600 border border-emerald-100 shadow-sm">
                                                    <CheckCircle2 className="w-6 h-6" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-xs font-black text-emerald-900 uppercase tracking-tight">One Last Verification</p>
                                                    <p className="text-[10px] font-medium text-emerald-600 mt-1 uppercase tracking-widest">Everything looks perfect. Proceed to launch.</p>
                                                </div>
                                            </div>

                                            <Button
                                                onClick={handlePlaceOrder}
                                                disabled={isProcessing}
                                                className="w-full h-20 bg-violet-600 hover:bg-violet-700 text-white rounded-3xl font-black uppercase tracking-widest text-lg shadow-2xl shadow-violet-200 transition-all active:scale-95 flex items-center justify-center gap-4 mb-2"
                                            >
                                                {isProcessing ? (
                                                    <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    <>
                                                        <Lock className="w-6 h-6" />
                                                        Place Final Order
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </div>
                    </div>

                    {/* Right Column: Sticky Sidebar Order Summary */}
                    <div className="lg:col-span-4 lg:sticky lg:top-32 h-fit">
                        <Card className="rounded-[3rem] border-none shadow-2xl overflow-hidden bg-white">
                            <div className="p-8 bg-gray-900 text-white">
                                <h3 className="text-2xl font-black italic mb-6">Financial <span className="text-violet-400">Hub.</span></h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="font-black uppercase tracking-widest text-gray-500 text-[10px]">Subtotal Node</span>
                                        <span className="font-black italic">₹{subtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="font-black uppercase tracking-widest text-gray-500 text-[10px]">Shipping Route</span>
                                        <span className={`font-black italic ${shippingCost === 0 ? 'text-emerald-400' : 'text-violet-400'}`}>
                                            {shippingCost === 0 ? 'COMPLIMENTARY' : `+₹${shippingCost}`}
                                        </span>
                                    </div>
                                    {discount > 0 && (
                                        <div className="flex justify-between items-center text-sm font-black text-emerald-400 underline underline-offset-8 decoration-emerald-400/30">
                                            <span className="uppercase tracking-widest text-[10px]">Discount Applied</span>
                                            <span className="italic">-₹{discount.toLocaleString()}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center text-sm mb-4">
                                        <span className="font-black uppercase tracking-widest text-gray-500 text-[10px]">Tax Allocation (18%)</span>
                                        <span className="font-black italic">₹{tax.toLocaleString()}</span>
                                    </div>

                                    <Separator className="bg-white/10 my-6" />

                                    <div className="flex justify-between items-center">
                                        <span className="text-[12px] font-black uppercase tracking-[0.2em] text-violet-400">Total Commitment</span>
                                        <span className="text-4xl font-black italic tracking-tighter shadow-violet-600/50">₹{total.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 space-y-6">
                                <div className="space-y-4">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Secure Coupon Access</Label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-400" />
                                            <Input
                                                value={couponCode}
                                                onChange={e => setCouponCode(e.target.value)}
                                                placeholder="ZIPPY20"
                                                className="h-14 rounded-2xl border-gray-100 focus:border-violet-600 font-bold pl-12 uppercase tracking-widest"
                                            />
                                        </div>
                                        <Button
                                            onClick={handleApplyCoupon}
                                            className="h-14 w-14 rounded-2xl bg-gray-900 hover:bg-violet-600 text-white shadow-lg transition-all active:scale-95"
                                        >
                                            <Check className="w-5 h-5 stroke-[4]" />
                                        </Button>
                                    </div>
                                    {appliedCoupon && (
                                        <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest ml-2 animate-pulse mt-2">
                                            ✓ Protocol Authorized: -₹{Math.round(discount).toLocaleString()}
                                        </p>
                                    )}
                                    {couponError && (
                                        <p className="text-[10px] text-red-500 font-black uppercase tracking-widest ml-2 mt-2">
                                            ⚠ {couponError}
                                        </p>
                                    )}
                                </div>

                                <Separator className="bg-gray-50" />

                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 shadow-inner">
                                        <ShieldCheck className="w-5 h-5 text-emerald-500" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-800">Bank-Grade Encryption On</span>
                                    </div>
                                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                        <Info className="w-5 h-5 text-gray-400" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 leading-tight">By clicking "Place Final Order" you agree to all Zippy Protocol terms.</span>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <div className="mt-8 flex justify-center gap-8 text-[10px] font-black uppercase tracking-widest text-gray-400">
                            <Link to="/terms" className="hover:text-violet-600 transition-colors">Safety</Link>
                            <Link to="/privacy" className="hover:text-violet-600 transition-colors">Privacy</Link>
                            <Link to="/help" className="hover:text-violet-600 transition-colors">Assistance</Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Payment;
