import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
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
    Zap,
    ArrowLeft,
    Shield,
    Sparkles,
    Wallet,
    Home
} from "lucide-react";
import { useCart, useOrders, useAuth, useCoupons } from "../App";

const Payment = () => {
    const navigate = useNavigate();
    const location = useLocation();
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
    const [appliedCoupon, setAppliedCoupon] = useState(location.state?.appliedCoupon || null);
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
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [saveNewAddress, setSaveNewAddress] = useState(false);

    // Fetch saved addresses from user profile/backend
    useEffect(() => {
        const fetchAddresses = async () => {
            if (user?.id) {
                try {
                    const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
                    const token = localStorage.getItem('token');
                    const response = await axios.get(`${API_BASE}/api/users/sync`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (response.data && response.data.addresses) {
                        setSavedAddresses(response.data.addresses);
                        // If user has a default profile address and no saved addresses, use it
                        if (response.data.addresses.length === 0 && user.address) {
                            // Split user's profile address if possible, or just put in street
                            setAddress(prev => ({ ...prev, street: user.address }));
                        }
                    }
                } catch (e) {
                    console.error("Failed to fetch addresses in payment:", e);
                }
            }
        };
        fetchAddresses();
    }, [user]);

    const handleSelectSavedAddress = (addr) => {
        setSelectedAddressId(addr.id);
        // Attempt to parse address string (Building, City, State ZIP)
        const parts = addr.addr.split(',').map(s => s.trim());
        setAddress({
            email: user?.email || '',
            name: addr.name,
            street: parts[0] || '',
            city: parts[1] || '',
            state: parts[2] || '',
            zip: parts[parts.length - 1]?.match(/\d{6}/)?.[0] || '',
            phone: addr.phone || user?.phone || ''
        });
    };

    const shippingCost = shippingMethod === 'express' ? 150 : (subtotal > 499 ? 0 : 99);
    const tax = subtotal * 0.18;
    const total = subtotal + shippingCost + tax - discount;

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [activeSection, orderComplete]);

    const handlePlaceOrder = async () => {
        setIsProcessing(true);
        try {
            const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
            const fullAddressString = `${address.street}, ${address.city}, ${address.state || ""} ${address.zip}`;

            const orderPayload = {
                customer_name: address.name,
                email: address.email,
                phone: address.phone || "",
                address: fullAddressString,
                payment_method: paymentMethod,
                items: cartItems.map(item => ({
                    product_id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    image: item.image,
                    vendor_id: item.vendor_id,
                    status: "processing"
                })),
                total_amount: total,
                coupon_code: appliedCoupon?.code || null,
                discount_amount: discount
            };

            const response = await axios.post(`${API_BASE}/api/orders/checkout`, orderPayload, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            // If user opted to save this address and it's not a saved one
            if (saveNewAddress && user?.id && !selectedAddressId) {
                const newSavedAddresses = [...savedAddresses, {
                    id: Date.now(),
                    name: address.name,
                    phone: address.phone,
                    addr: fullAddressString,
                    type: "HOME"
                }];
                const token = localStorage.getItem('token');
                await axios.put(`${API_BASE}/api/users/${user.id}`, { addresses: newSavedAddresses }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }

            // Sync with local state if needed
            addOrder({
                ...orderPayload,
                id: response.data.order_id,
                date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
                status: 'Confirmed',
                deliveryTimeline: shippingMethod === 'express' ? 'Arriving Tomorrow' : 'Arriving in 3-5 Days'
            });

            setIsProcessing(false);
            setOrderComplete(true);
        } catch (e) {
            console.error("Order Placement Error:", e);
            alert(`Failed to authorize transaction: ${e.response?.data?.detail || e.message}`);
            setIsProcessing(false);
        }
    };

    if (orderComplete) {
        return (
            <div className="min-h-screen bg-white flex flex-col font-sans">
                <header className="border-b border-gray-100 py-6 mb-8 bg-white/80 backdrop-blur-md fixed top-0 left-0 right-0 z-50">
                    <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                        <Link to="/" className="flex items-center gap-2">
                            <img
                                src="/assets/zlogo1.png"
                                alt="DACHCart Logo"
                                className="w-32 h-10 object-contain"
                            />
                        </Link>
                        <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 font-bold px-4 py-1.5 rounded-full uppercase tracking-widest text-[10px]">Order Fully Authorized</Badge>
                    </div>
                </header>

                <main className="max-w-5xl mx-auto px-6 pt-32 pb-20 flex-1 flex flex-col items-center">
                    <div className="w-full bg-gray-900 rounded-[3.5rem] p-16 text-center text-white relative overflow-hidden shadow-2xl mb-12 animate-in zoom-in duration-700">
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-600/20 blur-[130px] rounded-full -mr-48 -mt-48 animate-pulse"></div>
                        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/20 blur-[130px] rounded-full -ml-48 -mb-48 animate-pulse delay-1000"></div>

                        <div className="relative z-10">
                            <div className="w-24 h-24 bg-emerald-500 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-emerald-500/40 animate-in slide-in-from-top duration-500">
                                <Check className="w-12 h-12 text-white stroke-[4]" />
                            </div>
                            <h2 className="text-4xl lg:text-7xl font-black tracking-tighter mb-6 leading-none">Transaction <br /><span className="text-violet-400">Successful.</span></h2>
                            <p className="text-gray-400 font-medium text-lg lg:text-xl mb-12 max-w-xl mx-auto leading-relaxed italicLeading uppercaseTracking">
                                Process ID authorized. Your premium artifacts are being encrypted for logistical dispatch.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-6 justify-center">
                                <Button onClick={() => navigate('/profile')} variant="outline" className="h-16 bg-white/5 border-white/10 hover:bg-white/10 text-white rounded-2xl px-12 font-bold uppercase tracking-[0.2em] text-xs transition-all active:scale-95">
                                    Analyze Shipment
                                </Button>
                                <Button onClick={() => navigate('/')} className="h-16 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl px-12 font-bold uppercase tracking-[0.2em] text-xs shadow-xl shadow-violet-900/30 transition-all active:scale-95">
                                    Return to Marketplace
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-10 w-full animate-in fade-in slide-in-from-bottom-12 duration-700 delay-300">
                        <Card className="rounded-[3rem] border-gray-100 shadow-xl p-10 bg-white text-left">
                            <h3 className="text-xs font-black mb-8 uppercase tracking-[0.3em] text-violet-600">Shipment Manifest</h3>
                            <div className="space-y-6">
                                <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100/50 flex items-start gap-5">
                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-100 shrink-0">
                                        <MapPin className="w-5 h-5 text-violet-600" />
                                    </div>
                                    <div>
                                        <p className="font-black text-[10px] uppercase text-gray-400 tracking-widest mb-1.5">Authorized Destination</p>
                                        <p className="font-bold text-gray-900 text-lg leading-tight">{address.name}</p>
                                        <p className="text-gray-500 font-medium mt-1 leading-relaxed italicLeading">{address.street}, {address.city}, {address.zip}</p>
                                    </div>
                                </div>
                                <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100/50 flex items-start gap-5">
                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-100 shrink-0">
                                        <Clock className="w-5 h-5 text-violet-600" />
                                    </div>
                                    <div>
                                        <p className="font-black text-[10px] uppercase text-gray-400 tracking-widest mb-1.5">Temporal Window</p>
                                        <p className="font-bold text-gray-900 text-lg leading-tight">{shippingMethod === 'express' ? 'Accelerated: Arriving Tomorrow' : 'Standard: 3-5 Business Cycles'}</p>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <Card className="rounded-[3rem] border-gray-100 shadow-xl p-10 bg-white text-left">
                            <h3 className="text-xs font-black mb-8 uppercase tracking-[0.3em] text-violet-600">Fiscal Breakdown</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-sm font-medium text-gray-400 uppercase tracking-widest">
                                    <span>Subtotal Node</span>
                                    <span className="font-bold text-gray-900">₹{subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm font-medium text-gray-400 uppercase tracking-widest">
                                    <span>Logistics Fee</span>
                                    <span className={`font-bold ${shippingCost === 0 ? 'text-emerald-500' : 'text-gray-900'}`}>
                                        {shippingCost === 0 ? 'COMPLIMENTARY' : `₹${shippingCost}`}
                                    </span>
                                </div>
                                {discount > 0 && (
                                    <div className="flex justify-between items-center text-sm font-black text-emerald-600 uppercase tracking-widest">
                                        <span>Authorized Voucher</span>
                                        <span>-₹{discount.toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="h-px bg-gray-100 my-4" />
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-2">Grand Authorization</p>
                                        <p className="text-4xl font-black text-gray-900 tracking-tighter">₹{Math.round(total).toLocaleString()}</p>
                                    </div>
                                    <div className="w-14 h-14 bg-violet-50 rounded-[2rem] flex items-center justify-center text-violet-600 border border-violet-100 shadow-sm">
                                        <ShieldCheck className="w-7 h-7" />
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </main>
            </div>
        );
    }

    const ProgressHeader = () => (
        <div className="flex items-center justify-between mb-16 relative">
            <div className="absolute top-5 left-0 right-0 h-[3px] bg-gray-100 -z-10 rounded-full overflow-hidden">
                <div
                    className="h-full bg-violet-600 transition-all duration-700 ease-in-out"
                    style={{ width: `${((activeSection - 1) / 3) * 100}%` }}
                />
            </div>
            {[
                { step: 1, label: 'Identity', icon: User },
                { step: 2, label: 'Velocity', icon: Zap },
                { step: 3, label: 'Asset', icon: Wallet },
                { step: 4, label: 'Review', icon: Sparkles }
            ].map((s, idx) => (
                <div
                    key={idx}
                    className="flex flex-col items-center gap-3 group cursor-pointer"
                    onClick={() => (activeSection > s.step && setActiveSection(s.step))}
                >
                    <div className={`w-12 h-12 rounded-[1.5rem] flex items-center justify-center font-black transition-all duration-500 ${activeSection === s.step
                        ? 'bg-violet-600 text-white shadow-2xl shadow-violet-200 scale-110 ring-4 ring-white'
                        : activeSection > s.step
                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100'
                            : 'bg-white border-2 border-gray-100 text-gray-300'
                        }`}>
                        {activeSection > s.step ? <Check className="w-6 h-6 stroke-[4]" /> : <s.icon className={`w-5 h-5 ${activeSection === s.step ? 'animate-bounce-slow' : ''}`} />}
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-[0.25em] transition-colors duration-300 ${activeSection === s.step ? 'text-violet-600' : 'text-gray-400'}`}>
                        {s.label}
                    </span>
                </div>
            ))}
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50/30 font-sans">
            <header className="border-b border-gray-100 py-6 bg-white/90 backdrop-blur-2xl fixed top-0 left-0 right-0 z-50">
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Link to="/" className="flex items-center gap-2">
                            <img
                                src="/assets/zlogo1.png"
                                alt="DACHCart Logo"
                                className="w-32 h-10 object-contain"
                            />
                        </Link>
                        <Link to="/cart" className="hidden md:flex items-center gap-2 text-gray-400 hover:text-violet-600 transition-colors text-[10px] font-black uppercase tracking-[0.2em] group">
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            Back to System
                        </Link>
                    </div>
                    <div className="flex items-center gap-4 py-2 px-5 bg-emerald-50 rounded-full border border-emerald-100 animate-pulse">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700">Enterprise Encryption Active</span>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 pt-36 pb-24">
                <div className="grid lg:grid-cols-12 gap-16 items-start">

                    <div className="lg:col-span-8 animate-in slide-in-from-left duration-700">
                        <ProgressHeader />

                        <div className="space-y-8 text-left">
                            {/* Step 1: Address / Guest */}
                            <Card className={`rounded-[3.5rem] overflow-hidden border-none shadow-2xl transition-all duration-500 transform ${activeSection === 1 ? ' ring-1 ring-violet-200 bg-white ring-offset-8 ring-offset-transparent' : 'opacity-40 grayscale-[0.6] pointer-events-none scale-95'}`}>
                                <CardContent className="p-12">
                                    <div className="flex items-center justify-between mb-10">
                                        <div>
                                            <h3 className="text-3xl font-black italic tracking-tighter leading-none mb-2">Identity & <span className="text-violet-600">Location.</span></h3>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Provide your primary nexus coordinates</p>
                                        </div>
                                        {!user && activeSection === 1 && <Badge className="bg-amber-50 text-amber-600 border-amber-100 px-5 py-2 text-[9px] uppercase font-black tracking-widest rounded-full">Guest Mode Unauthorized</Badge>}
                                    </div>

                                    {activeSection === 1 ? (
                                        <div className="grid md:grid-cols-2 gap-8">
                                            {/* Saved Addresses Section */}
                                            {user && savedAddresses.length > 0 && (
                                                <div className="col-span-full mb-6">
                                                    <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-violet-600 mb-4 block">Use a Saved Address</Label>
                                                    <div className="grid sm:grid-cols-2 gap-4">
                                                        {savedAddresses.map(addr => (
                                                            <div
                                                                key={addr.id}
                                                                onClick={() => handleSelectSavedAddress(addr)}
                                                                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${selectedAddressId === addr.id ? 'border-violet-600 bg-violet-50' : 'border-gray-50 bg-gray-50/30 hover:border-gray-100'}`}
                                                            >
                                                                <div className="flex justify-between items-start mb-1">
                                                                    <span className="font-bold text-sm text-gray-900">{addr.name}</span>
                                                                    <Badge className="text-[8px] bg-white border-gray-100 text-gray-400">{addr.type}</Badge>
                                                                </div>
                                                                <p className="text-xs text-gray-500 line-clamp-2 mb-2">{addr.addr}</p>
                                                                <p className="text-[10px] font-bold text-gray-400">{addr.phone}</p>
                                                            </div>
                                                        ))}
                                                        <div
                                                            onClick={() => { setSelectedAddressId(null); setAddress({ ...address, street: '', city: '', zip: '', state: '' }); }}
                                                            className={`p-4 rounded-2xl border-2 border-dashed flex items-center justify-center gap-2 cursor-pointer transition-all ${!selectedAddressId ? 'border-violet-300 bg-white' : 'border-gray-200 text-gray-400 hover:border-violet-300 hover:text-violet-600'}`}
                                                        >
                                                            <Plus className="w-4 h-4" />
                                                            <span className="text-xs font-bold uppercase tracking-wider">New Address</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {!user && (
                                                <div className="col-span-full p-8 bg-violet-50/50 rounded-[2.5rem] border border-violet-100 flex items-start gap-5 mb-4 group hover:bg-violet-50 transition-colors">
                                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-violet-600 shadow-sm border border-violet-100 shrink-0 group-hover:scale-110 transition-transform">
                                                        <User className="w-6 h-6" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-black text-violet-900 uppercase tracking-[0.2em]">Procurement as Voyager</p>
                                                        <p className="text-xs font-medium text-violet-500 mt-2 leading-relaxed italicLeading uppercaseTracking">Establish your temporary identity below or <Link to="/auth" className="underline font-black hover:text-violet-900 transition-colors">Sign In</Link> for protocol rewards.</p>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 ml-3">Email Access Point</Label>
                                                <div className="relative">
                                                    <Smartphone className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-400" />
                                                    <Input
                                                        placeholder="e.g. nexus@DACH.com"
                                                        value={address.email}
                                                        onChange={e => setAddress({ ...address, email: e.target.value })}
                                                        className="h-16 pl-14 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white focus:border-violet-600 focus:ring-4 focus:ring-violet-50 transition-all font-bold text-gray-900"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 ml-3">Full Legal Name</Label>
                                                <div className="relative">
                                                    <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-400" />
                                                    <Input
                                                        placeholder="Entity Name"
                                                        value={address.name}
                                                        onChange={e => setAddress({ ...address, name: e.target.value })}
                                                        className="h-16 pl-14 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white focus:border-violet-600 focus:ring-4 focus:ring-violet-50 transition-all font-bold text-gray-900"
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-span-full space-y-3">
                                                <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 ml-3">Drop Zone Architecture (Street)</Label>
                                                <div className="relative">
                                                    <Home className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-400" />
                                                    <Input
                                                        placeholder="Building, Sector, Peripheral Node"
                                                        value={address.street}
                                                        onChange={e => setAddress({ ...address, street: e.target.value })}
                                                        className="h-16 pl-14 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white focus:border-violet-600 focus:ring-4 focus:ring-violet-50 transition-all font-bold text-gray-900"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 ml-3">Nexus Node (City)</Label>
                                                <div className="relative">
                                                    <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-400" />
                                                    <Input
                                                        placeholder="City Central"
                                                        value={address.city}
                                                        onChange={e => setAddress({ ...address, city: e.target.value })}
                                                        className="h-16 pl-14 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white focus:border-violet-600 focus:ring-4 focus:ring-violet-50 transition-all font-bold text-gray-900"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 ml-3">Spatial Hash (ZIP)</Label>
                                                <div className="relative">
                                                    <Tag className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-400" />
                                                    <Input
                                                        placeholder="000 000"
                                                        value={address.zip}
                                                        onChange={e => { setAddress({ ...address, zip: e.target.value }); setSelectedAddressId(null); }}
                                                        className="h-16 pl-14 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white focus:border-violet-600 focus:ring-4 focus:ring-violet-50 transition-all font-bold text-gray-900"
                                                    />
                                                </div>
                                            </div>

                                            {user && !selectedAddressId && (
                                                <div className="col-span-full flex items-center gap-3 ml-3 mt-2">
                                                    <input
                                                        type="checkbox"
                                                        id="save-addr"
                                                        checked={saveNewAddress}
                                                        onChange={(e) => setSaveNewAddress(e.target.checked)}
                                                        className="w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                                                    />
                                                    <Label htmlFor="save-addr" className="text-xs font-bold text-gray-600 cursor-pointer">Save this address to my profile</Label>
                                                </div>
                                            )}

                                            <Button onClick={() => setActiveSection(2)} className="col-span-full h-20 bg-gray-900 hover:bg-violet-600 text-white rounded-3xl font-black uppercase tracking-[0.3em] text-xs shadow-2xl transition-all mt-6 active:scale-95 flex items-center gap-4">
                                                Synchronize Coordinates <ChevronRight className="w-5 h-5" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="flex items-start gap-6 p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100">
                                            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center border border-gray-100 text-violet-600 shadow-sm">
                                                <MapPin className="w-6 h-6" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-black text-gray-900 [letter-spacing:0.1em] uppercase text-sm mb-1">{address.name}</p>
                                                <p className="text-gray-500 font-medium text-sm leading-relaxed italicLeading">{address.street}, {address.city}, {address.zip}</p>
                                            </div>
                                            <Button variant="ghost" onClick={() => setActiveSection(1)} className="text-violet-600 font-black uppercase tracking-widest text-[10px] hover:bg-violet-100 px-6 h-12 rounded-xl">Re-Configure</Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Step 2: Shipping Method */}
                            <Card className={`rounded-[3.5rem] overflow-hidden border-none shadow-2xl transition-all duration-500 transform ${activeSection === 2 ? ' ring-1 ring-violet-200 bg-white ring-offset-8 ring-offset-transparent scale-100' : activeSection < 2 ? 'pointer-events-none opacity-40 grayscale-[0.8] scale-90 translate-y-8' : 'opacity-40 grayscale-[0.6] pointer-events-none scale-95'}`}>
                                <CardContent className="p-12">
                                    <h3 className="text-3xl font-black italic tracking-tighter leading-none mb-10">Shipping <span className="text-violet-600">Velocity.</span></h3>

                                    {activeSection === 2 ? (
                                        <RadioGroup value={shippingMethod} onValueChange={setShippingMethod} className="grid md:grid-cols-2 gap-8">
                                            <div className={`p-10 rounded-[3rem] border-4 transition-all duration-300 cursor-pointer relative group ${shippingMethod === 'standard' ? 'border-violet-600 bg-violet-50/40 shadow-2xl shadow-violet-100' : 'border-gray-50 bg-white hover:border-gray-100 hover:shadow-xl'}`}>
                                                <RadioGroupItem value="standard" id="standard" className="sr-only" />
                                                <Label htmlFor="standard" className="cursor-pointer block">
                                                    <div className="flex items-center justify-between mb-8">
                                                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${shippingMethod === 'standard' ? 'bg-violet-600 text-white shadow-lg' : 'bg-gray-50 text-gray-300 group-hover:text-gray-400'}`}>
                                                            <Truck className="w-8 h-8" />
                                                        </div>
                                                        <Badge className={`font-black text-[9px] uppercase tracking-widest rounded-full px-4 py-1.5 ${shippingMethod === 'standard' ? 'bg-violet-200 text-violet-600' : 'bg-gray-100 text-gray-400'}`}>Standard</Badge>
                                                    </div>
                                                    <p className="text-2xl font-black text-gray-900 tracking-tighter italic">Normal <span className="text-gray-400">Node.</span></p>
                                                    <p className="text-sm font-medium text-gray-500 mt-3 leading-relaxed italicLeading">Equilibrium delivery within 3-5 standard cycles.</p>
                                                    <div className={`mt-6 font-black italic uppercase tracking-[0.2em] text-sm ${shippingMethod === 'standard' ? 'text-emerald-600' : 'text-gray-400'}`}>
                                                        {subtotal > 499 ? 'Protocol Offset' : '₹99 Processing'}
                                                    </div>
                                                </Label>
                                            </div>

                                            <div className={`p-10 rounded-[3rem] border-4 transition-all duration-300 cursor-pointer relative group ${shippingMethod === 'express' ? 'border-violet-600 bg-violet-50/40 shadow-2xl shadow-violet-100' : 'border-gray-50 bg-white hover:border-gray-100 hover:shadow-xl'}`}>
                                                <RadioGroupItem value="express" id="express" className="sr-only" />
                                                <Label htmlFor="express" className="cursor-pointer block">
                                                    <div className="flex items-center justify-between mb-8">
                                                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${shippingMethod === 'express' ? 'bg-violet-600 text-white shadow-lg' : 'bg-gray-50 text-gray-300 group-hover:text-gray-400'}`}>
                                                            <Zap className="w-8 h-8" />
                                                        </div>
                                                        <Badge className={`font-black text-[9px] uppercase tracking-widest rounded-full px-4 py-1.5 ${shippingMethod === 'express' ? 'bg-violet-600 text-white ring-4 ring-violet-100' : 'bg-gray-100 text-gray-400'}`}>Express</Badge>
                                                    </div>
                                                    <p className="text-2xl font-black text-gray-900 tracking-tighter italic">Accelerated <span className="text-violet-600">Access.</span></p>
                                                    <p className="text-sm font-medium text-gray-500 mt-3 leading-relaxed italicLeading">Priority dispatch arriving within 24 business hours.</p>
                                                    <div className={`mt-6 font-black italic uppercase tracking-[0.2em] text-sm ${shippingMethod === 'express' ? 'text-violet-600 font-black' : 'text-gray-400'}`}>₹150 Priority Fee</div>
                                                </Label>
                                            </div>

                                            <div className="col-span-full flex flex-col sm:flex-row gap-4 mt-6">
                                                <Button onClick={() => setActiveSection(1)} variant="outline" className="h-20 bg-white border-2 border-gray-100 hover:bg-gray-50 text-gray-400 rounded-3xl font-black uppercase tracking-[0.3em] text-xs transition-all flex items-center gap-4 px-10">
                                                    <ArrowLeft className="w-5 h-5" /> Back
                                                </Button>
                                                <Button onClick={() => setActiveSection(3)} className="flex-1 h-20 bg-gray-900 hover:bg-violet-600 text-white rounded-3xl font-black uppercase tracking-[0.3em] text-xs shadow-2xl transition-all active:scale-95 flex items-center gap-4">
                                                    Authorize Velocity <ChevronRight className="w-5 h-5" />
                                                </Button>
                                            </div>
                                        </RadioGroup>
                                    ) : activeSection > 2 && (
                                        <div className="flex items-center gap-6 p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100">
                                            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center border border-gray-100 text-violet-600 shadow-sm">
                                                <Zap className="w-6 h-6" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-black text-gray-900 [letter-spacing:0.1em] uppercase text-sm mb-1">{shippingMethod === 'standard' ? 'Normal Mode' : 'Accelerated Mode'}</p>
                                                <p className="text-gray-500 font-medium text-sm leading-relaxed italicLeading">{shippingMethod === 'standard' ? 'Projected 3-5 days' : 'Projected 24-hours'}</p>
                                            </div>
                                            <Button variant="ghost" onClick={() => setActiveSection(2)} className="text-violet-600 font-black uppercase tracking-widest text-[10px] hover:bg-violet-100 px-6 h-12 rounded-xl">Re-Configure</Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Step 3: Payment */}
                            <Card className={`rounded-[3.5rem] overflow-hidden border-none shadow-2xl transition-all duration-500 transform ${activeSection === 3 ? ' ring-1 ring-violet-200 bg-white ring-offset-8 ring-offset-transparent scale-100' : activeSection < 3 ? 'pointer-events-none opacity-40 grayscale-[0.8] scale-90 translate-y-16' : 'opacity-40 grayscale-[0.6] pointer-events-none scale-95'}`}>
                                <CardContent className="p-12">
                                    <div className="flex items-center justify-between mb-10">
                                        <h3 className="text-3xl font-black italic tracking-tighter leading-none">Asset <span className="text-violet-600">Sync.</span></h3>
                                        <div className="flex gap-2">
                                            <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-4 w-auto grayscale opacity-40" alt="Visa" />
                                            <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-4 w-auto grayscale opacity-40" alt="Mastercard" />
                                        </div>
                                    </div>

                                    {activeSection === 3 ? (
                                        <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-6">
                                            <div className={`p-8 rounded-[2.5rem] border-4 transition-all duration-300 cursor-pointer flex items-center gap-8 ${paymentMethod === 'card' ? 'border-violet-600 bg-violet-50/40 shadow-2xl shadow-violet-100' : 'border-gray-50 bg-white hover:border-gray-100 hover:shadow-xl'}`}>
                                                <RadioGroupItem value="card" id="p-card" className="sr-only" />
                                                <div className={`w-20 h-20 rounded-[1.5rem] flex items-center justify-center transition-all ${paymentMethod === 'card' ? 'bg-violet-600 text-white shadow-lg rotate-3' : 'bg-gray-100 text-gray-300'}`}>
                                                    <CreditCard className="w-10 h-10" />
                                                </div>
                                                <Label htmlFor="p-card" className="flex-1 cursor-pointer">
                                                    <p className="text-xl font-black text-gray-900 tracking-tighter uppercase italic leading-none mb-2">Credit / Debit terminal</p>
                                                    <p className="text-sm font-medium text-gray-400 italicLeading">PCI-DSS Level 1 Encrypted Transmission.</p>
                                                </Label>
                                                <CheckCircle2 className={`w-8 h-8 transition-opacity duration-300 ${paymentMethod === 'card' ? 'text-violet-600 opacity-100' : 'opacity-0'}`} />
                                            </div>

                                            <div className={`p-8 rounded-[2.5rem] border-4 transition-all duration-300 cursor-pointer flex items-center gap-8 ${paymentMethod === 'upi' ? 'border-violet-600 bg-violet-50/40 shadow-2xl shadow-violet-100' : 'border-gray-50 bg-white hover:border-gray-100 hover:shadow-xl'}`}>
                                                <RadioGroupItem value="upi" id="p-upi" className="sr-only" />
                                                <div className={`w-20 h-20 rounded-[1.5rem] flex items-center justify-center transition-all ${paymentMethod === 'upi' ? 'bg-violet-600 text-white shadow-lg rotate-3' : 'bg-gray-100 text-gray-300'}`}>
                                                    <Smartphone className="w-10 h-10" />
                                                </div>
                                                <Label htmlFor="p-upi" className="flex-1 cursor-pointer">
                                                    <p className="text-xl font-black text-gray-900 tracking-tighter uppercase italic leading-none mb-2">Unified Nexus (UPI)</p>
                                                    <p className="text-sm font-medium text-gray-400 italicLeading">Direct Node-to-Node Bank Transfer.</p>
                                                </Label>
                                                <CheckCircle2 className={`w-8 h-8 transition-opacity duration-300 ${paymentMethod === 'upi' ? 'text-violet-600 opacity-100' : 'opacity-0'}`} />
                                            </div>

                                            <div className="flex flex-col sm:flex-row gap-4 mt-6">
                                                <Button onClick={() => setActiveSection(2)} variant="outline" className="h-20 bg-white border-2 border-gray-100 hover:bg-gray-50 text-gray-400 rounded-3xl font-black uppercase tracking-[0.3em] text-xs transition-all flex items-center gap-4 px-10">
                                                    <ArrowLeft className="w-5 h-5" /> Back
                                                </Button>
                                                <Button onClick={() => setActiveSection(4)} className="flex-1 h-20 bg-gray-900 hover:bg-violet-600 text-white rounded-3xl font-black uppercase tracking-[0.3em] text-xs shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-4">
                                                    Lock Method <Shield className="w-5 h-5" />
                                                </Button>
                                            </div>
                                        </RadioGroup>
                                    ) : activeSection > 3 && (
                                        <div className="flex items-center gap-6 p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100">
                                            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center border border-gray-100 text-violet-600 shadow-sm">
                                                <ShieldCheck className="w-6 h-6" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-black text-gray-900 [letter-spacing:0.1em] uppercase text-sm mb-1">Encrypted Payload Linked</p>
                                                <p className="text-gray-500 font-medium text-sm leading-relaxed italicLeading uppercase">{paymentMethod} protocol synchronized.</p>
                                            </div>
                                            <Button variant="ghost" onClick={() => setActiveSection(3)} className="text-violet-600 font-black uppercase tracking-widest text-[10px] hover:bg-violet-100 px-6 h-12 rounded-xl">Re-Configure</Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Step 4: Review */}
                            <Card className={`rounded-[3.5rem] overflow-hidden border-none shadow-2xl transition-all duration-700 transform ${activeSection === 4 ? ' ring-1 ring-violet-200 bg-white ring-offset-8 ring-offset-transparent scale-100' : 'pointer-events-none opacity-40 grayscale-[0.9] scale-90 translate-y-24'}`}>
                                <CardContent className="p-12">
                                    <div className="flex items-center justify-between mb-10">
                                        <h3 className="text-3xl font-black italic tracking-tighter leading-none">Pre-Launch <span className="text-violet-600">Review.</span></h3>
                                        <Badge className="bg-emerald-50 text-emerald-600 font-black text-[9px] uppercase tracking-widest px-4 py-2 rounded-full border-emerald-100">Integrity Check Passing</Badge>
                                    </div>

                                    {activeSection === 4 && (
                                        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-500">
                                            <div className="p-10 bg-gray-900 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
                                                <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/10 rounded-full blur-[80px] -mr-32 -mt-32" />
                                                <div className="flex items-center justify-between mb-8">
                                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-violet-400 leading-none">Payload Manifest</span>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">{cartItems.length} Consolidated Units</span>
                                                </div>
                                                <div className="space-y-8 max-h-[350px] overflow-y-auto custom-scrollbar pr-6">
                                                    {cartItems.map((item) => (
                                                        <div key={item.id} className="flex gap-8 items-center border-b border-white/5 pb-8 last:border-0 last:pb-0">
                                                            <div className="w-24 h-24 bg-white/5 rounded-2xl overflow-hidden border border-white/10 shrink-0 p-3 flex items-center justify-center">
                                                                <img src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-lighten" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-400 mb-2 leading-none">{item.category}</p>
                                                                <h4 className="font-bold text-base uppercase tracking-tight leading-tight mb-3 line-clamp-1">{item.name}</h4>
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center gap-3">
                                                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Authorized Qty:</span>
                                                                        <span className="text-sm font-black text-white">{item.quantity}</span>
                                                                    </div>
                                                                    <span className="text-xl font-black text-violet-400 italic">₹{(item.price * item.quantity).toLocaleString()}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="p-8 bg-emerald-50 rounded-[2.5rem] border border-emerald-100 flex items-center gap-6 shadow-inner">
                                                <div className="w-16 h-16 bg-white rounded-[1.5rem] flex items-center justify-center text-emerald-600 border border-emerald-100 shadow-sm shrink-0">
                                                    <CheckCircle2 className="w-8 h-8" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-xs font-black text-emerald-900 uppercase tracking-[0.2em] leading-none mb-2">Security Verification Protocol</p>
                                                    <p className="text-[10px] font-bold text-emerald-600/70 uppercase tracking-[0.2em] leading-relaxed">All nexus nodes synchronized. Order integrity verified at 99.9%. Ready for terminal launch.</p>
                                                </div>
                                            </div>

                                            <div className="flex flex-col sm:flex-row gap-4 mt-6">
                                                <Button onClick={() => setActiveSection(3)} variant="outline" className="h-24 bg-white border-2 border-gray-100 hover:bg-gray-50 text-gray-400 rounded-[2.5rem] font-black uppercase tracking-[0.3em] text-sm transition-all flex items-center gap-4 px-10">
                                                    <ArrowLeft className="w-5 h-5" /> Back
                                                </Button>
                                                <Button
                                                    onClick={handlePlaceOrder}
                                                    disabled={isProcessing}
                                                    className="flex-1 h-24 bg-violet-600 hover:bg-violet-700 text-white rounded-[2.5rem] font-black uppercase tracking-[0.3em] text-sm shadow-2xl shadow-violet-200 transition-all active:scale-95 flex items-center justify-center gap-6 group overflow-hidden relative"
                                                >
                                                    {isProcessing ? (
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                                                            <span className="animate-pulse">Authorizing...</span>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                                            <Lock className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                                            Initialize Transaction
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Right Column: Sticky Sidebar Order Summary */}
                    <div className="lg:col-span-4 lg:sticky lg:top-36 h-fit animate-in slide-in-from-right duration-700 delay-200">
                        <Card className="rounded-[4rem] border-none shadow-2xl overflow-hidden bg-white group hover:shadow-violet-200/20 transition-all duration-500">
                            <div className="p-10 bg-gray-900 text-white relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-32 h-32 bg-violet-600/20 rounded-full blur-[60px] -ml-16 -mt-16" />
                                <h3 className="text-xs font-black uppercase tracking-[0.4em] text-violet-400 mb-8 relative z-10 leading-none">Procurement Hub</h3>
                                <div className="space-y-6 relative z-10">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-bold uppercase tracking-[0.2em] text-gray-500">Subtotal Node</span>
                                        <span className="font-black text-lg tracking-tight">₹{subtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-bold uppercase tracking-[0.2em] text-gray-500">Logistics Routing</span>
                                        <span className={`font-black tracking-tight ${shippingCost === 0 ? 'text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-lg' : 'text-violet-400'}`}>
                                            {shippingCost === 0 ? 'Protocol Offset' : `+₹${shippingCost}`}
                                        </span>
                                    </div>
                                    {discount > 0 && (
                                        <div className="flex justify-between items-center text-xs font-black text-emerald-400 bg-emerald-400/5 -mx-10 px-10 py-3 border-y border-emerald-400/20">
                                            <span className="uppercase tracking-[0.3em]">Voucher Authorized</span>
                                            <span className="text-lg">-₹{discount.toLocaleString()}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center text-xs mb-4">
                                        <span className="font-bold uppercase tracking-[0.2em] text-gray-500">Regulatory Tax (18%)</span>
                                        <span className="font-black tracking-tight text-white/80">₹{Math.round(tax).toLocaleString()}</span>
                                    </div>

                                    <div className="h-px bg-white/5 my-8" />

                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-violet-400 mb-3 leading-none">Total Commitment</p>
                                            <p className="text-5xl font-black italic tracking-tighter shadow-violet-600/50">₹{Math.round(total).toLocaleString()}</p>
                                        </div>
                                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                                            <CreditCard className="w-5 h-5 text-violet-500" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-10 space-y-10 bg-white">
                                <div className="space-y-6">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 ml-4 leading-none">Secure Authorization Code</Label>
                                    <div className="flex gap-3">
                                        <div className="relative flex-1">
                                            <Tag className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-400" />
                                            <Input
                                                value={couponCode}
                                                onChange={e => setCouponCode(e.target.value)}
                                                placeholder="CODE-2026"
                                                className="h-16 rounded-[1.5rem] border-gray-100 bg-gray-50 focus:bg-white focus:border-violet-600 focus:ring-4 focus:ring-violet-50 transition-all font-bold pl-14 uppercase tracking-[0.3em] text-xs placeholder:text-gray-300"
                                            />
                                        </div>
                                        <Button
                                            onClick={handleApplyCoupon}
                                            className="h-16 w-16 rounded-[1.5rem] bg-gray-900 hover:bg-violet-600 text-white shadow-xl transition-all active:scale-90 shrink-0 border-0"
                                        >
                                            <Check className="w-6 h-6 stroke-[4]" />
                                        </Button>
                                    </div>
                                    {appliedCoupon ? (
                                        <div className="flex items-center gap-3 py-3 px-5 bg-emerald-50 rounded-2xl border border-emerald-100 animate-in zoom-in duration-300">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                            <p className="text-[10px] text-emerald-700 font-black uppercase tracking-[0.2em]">
                                                Auth Success: -₹{Math.round(discount).toLocaleString()}
                                            </p>
                                        </div>
                                    ) : couponError && (
                                        <div className="flex items-center gap-3 py-3 px-5 bg-rose-50 rounded-2xl border border-rose-100 animate-in shake duration-500">
                                            <Info className="w-4 h-4 text-rose-600" />
                                            <p className="text-[10px] text-rose-700 font-black uppercase tracking-[0.2em]">
                                                {couponError}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <Separator className="bg-gray-100/50" />

                                <div className="space-y-6">
                                    <div className="flex items-center gap-4 py-4 px-6 bg-emerald-50/50 rounded-3xl border border-emerald-100/50 shadow-inner group">
                                        <ShieldCheck className="w-6 h-6 text-emerald-500 group-hover:scale-110 transition-transform" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-800 leading-tight">Bank-Grade <br />Asset Shield Active</span>
                                    </div>
                                    <div className="flex items-center gap-5 p-6 bg-gray-50/50 rounded-3xl border border-gray-100">
                                        <Info className="w-5 h-5 text-gray-300 shrink-0" />
                                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em] leading-relaxed">By authorizing procurement, you acknowledge the DACHCart framework and protocol mandates.</span>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <div className="mt-12 flex justify-center gap-10 text-[9px] font-black uppercase tracking-[0.4em] text-gray-400">
                            <Link to="/terms" className="hover:text-violet-600 transition-colors">Governance</Link>
                            <Link to="/privacy" className="hover:text-violet-600 transition-colors">Security</Link>
                            <Link to="/faq" className="hover:text-violet-600 transition-colors">Assistance</Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Payment;
