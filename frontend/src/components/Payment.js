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
    ChevronRight,
    MapPin,
    CreditCard,
    Smartphone,
    Truck,
    CheckCircle2,
    ShieldCheck,
    Box,
    Check,
    ArrowLeft,
    Plus,
    X,
    Info,
    Mail,
    User,
    Shield,
    Tag
} from "lucide-react";
import { useCart, useOrders, useAuth, useCoupons } from "../App";

const Payment = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { cartItems, getCartTotal, removeFromCart, updateQuantity } = useCart();
    const { addOrder } = useOrders();
    const { user } = useAuth();
    const { validateCoupon } = useCoupons();

    const [activeSection, setActiveSection] = useState(2); // 1: Login, 2: Address, 3: Order Summary, 4: Payment
    const [isProcessing, setIsProcessing] = useState(false);
    const [orderComplete, setOrderComplete] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [appliedCoupon, setAppliedCoupon] = useState(location.state?.appliedCoupon || null);

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
    const [showAddressForm, setShowAddressForm] = useState(false);

    const subtotal = getCartTotal();
    const discount = appliedCoupon ? (appliedCoupon.type === 'percentage' ? (subtotal * appliedCoupon.value) / 100 : appliedCoupon.value) : 0;

    const shippingCost = cartItems.reduce((sum, item) => {
        if (item.delivery_type) {
            if (item.delivery_type === 'free') return sum;
            if (item.delivery_type === 'fixed') {
                const itemTotal = item.price * item.quantity;
                if (item.free_delivery_above > 0 && itemTotal >= item.free_delivery_above) {
                    return sum;
                }
                return sum + (item.delivery_charge || 0);
            }
            return sum + (item.delivery_charge || 0);
        }
        // Fallback
        const legacyThreshold = 500;
        const itemTotal = item.price * item.quantity;
        return sum + (itemTotal >= legacyThreshold ? 0 : 40);
    }, 0);

    const total = subtotal + shippingCost - discount;
    const platformFee = Math.round(subtotal * 0.10);
    const finalTotal = total + platformFee;

    const [couponCode, setCouponCode] = useState('');
    const [couponError, setCouponError] = useState('');

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
                        if (response.data.addresses.length > 0) {
                            setSelectedAddressId(response.data.addresses[0].id);
                            const addr = response.data.addresses[0];
                            const parts = addr.addr.split(',').map(s => s.trim());
                            setAddress({
                                email: user.email,
                                name: addr.name,
                                street: parts[0] || '',
                                city: parts[1] || '',
                                state: parts[2] || '',
                                zip: parts[parts.length - 1]?.match(/\d{6}/)?.[0] || '',
                                phone: addr.phone || ''
                            });
                        } else {
                            setShowAddressForm(true);
                        }
                    }
                } catch (e) { console.error(e); }
            }
        };
        fetchAddresses();
    }, [user]);

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
                total_amount: finalTotal,
                coupon_code: appliedCoupon?.code || null,
                discount_amount: discount
            };

            const response = await axios.post(`${API_BASE}/api/orders/checkout`, orderPayload, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            addOrder({
                ...orderPayload,
                id: response.data.order_id,
                date: new Date().toLocaleDateString('en-IN'),
                status: 'Confirmed'
            });

            setIsProcessing(false);
            setOrderComplete(true);
        } catch (e) {
            alert("Order Failed");
            setIsProcessing(false);
        }
    };

    if (orderComplete) {
        return (
            <div className="min-h-screen bg-[#f1f3f6] flex flex-col items-center justify-center p-4">
                <Card className="max-w-md w-full p-8 text-center rounded-sm shadow-md bg-white">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Check className="text-white w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2 text-violet-600">Order Placed Successfully!</h2>
                    <p className="text-gray-600 mb-8">Your order has been confirmed and will be delivered soon.</p>
                    <Button onClick={() => navigate('/')} className="w-full bg-violet-600 hover:bg-violet-700 h-12 rounded-sm font-bold uppercase">
                        Continue Shopping
                    </Button>
                </Card>
            </div>
        );
    }

    const StepHeader = ({ num, title, description, isCompleted, isActive, onEdit }) => (
        <div className={`p-4 flex items-center justify-between ${isActive ? 'bg-violet-600 text-white' : 'bg-white text-gray-500'} ${isCompleted ? 'cursor-pointer' : ''}`}>
            <div className="flex items-center gap-4">
                <span className={`w-5 h-5 flex items-center justify-center rounded-sm text-[10px] font-bold ${isActive ? 'bg-violet-50 text-violet-600' : 'bg-violet-50 text-violet-600'}`}>
                    {num}
                </span>
                <div className="flex items-center gap-2">
                    <span className={`font-bold uppercase tracking-tight ${isActive ? 'text-white' : 'text-gray-500'}`}>{title}</span>
                    {isCompleted && !isActive && <Check className="w-4 h-4 text-violet-600" />}
                </div>
            </div>
            {isCompleted && !isActive && (
                <button onClick={onEdit} className="text-violet-600 border border-violet-100 px-4 py-1.5 text-xs font-bold uppercase rounded-sm bg-white hover:shadow-sm">
                    Change
                </button>
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f1f3f6] font-sans pb-24 lg:pb-0">
            {/* Header */}
            <header className="bg-violet-600 py-3 px-4 sticky top-0 z-50 shadow-sm">
                <div className="max-w-[1248px] mx-auto flex items-center justify-between">
                    <Link to="/">
                        <img src="/assets/zlogo1.png" className="h-16 w-auto brightness-0 invert" alt="Logo" />
                    </Link>
                    <div className="flex items-center gap-2 text-white/70 text-sm font-medium">
                        <ShieldCheck className="w-4 h-4" />
                        <span className="hidden sm:inline">100% Safe Payments</span>
                    </div>
                </div>
            </header>

            <main className="max-w-[1248px] mx-auto py-4 px-2 sm:px-4 flex flex-col lg:flex-row gap-4 text-left">
                {/* Left Side: Steps */}
                <div className="flex-1 space-y-3">
                    {/* Step 1: Login */}
                    <div className="bg-white shadow-sm overflow-hidden">
                        <StepHeader num={1} title="Login" isCompleted={true} isActive={activeSection === 1} onEdit={() => setActiveSection(1)} />
                        {activeSection === 1 ? (
                            <div className="p-4 px-6 lg:px-12 border-t">
                                <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">{user?.name || 'Guest'}</p>
                                        <p className="text-xs text-gray-500 mt-1">{user?.email || address.email}</p>
                                    </div>
                                    <Button onClick={() => setActiveSection(2)} className="bg-violet-600 hover:bg-violet-700 rounded-sm px-8 uppercase font-bold text-xs w-full sm:w-auto">Continue Checkout</Button>
                                </div>
                            </div>
                        ) : (
                            <div className="px-6 lg:px-14 pb-4">
                                <p className="text-sm font-bold text-gray-900">{user?.name || 'Guest'} <span className="text-xs text-gray-500 ml-4">{user?.email || address.email}</span></p>
                            </div>
                        )}
                    </div>

                    {/* Step 2: Delivery Address */}
                    <div className="bg-white shadow-sm overflow-hidden text-left">
                        <StepHeader num={2} title="Delivery Address" isCompleted={activeSection > 2} isActive={activeSection === 2} onEdit={() => setActiveSection(2)} />
                        {activeSection === 2 && (
                            <div className="p-4 px-6 lg:px-12 border-t space-y-4">
                                {!showAddressForm && savedAddresses.map(addr => (
                                    <div key={addr.id} className={`flex gap-4 items-start p-4 border-b group cursor-pointer ${selectedAddressId === addr.id ? 'bg-violet-50/50' : ''}`} onClick={() => setSelectedAddressId(addr.id)}>
                                        <RadioGroup value={selectedAddressId}>
                                            <RadioGroupItem value={addr.id} id={addr.id} className="mt-1" />
                                        </RadioGroup>
                                        <div className="flex-1 text-left">
                                            <div className="flex flex-wrap items-center gap-3">
                                                <p className="font-bold text-sm">{addr.name}</p>
                                                <Badge className="bg-violet-50 text-violet-600 text-[10px] rounded-sm px-1.5 font-bold uppercase">{addr.type}</Badge>
                                                <p className="font-bold text-sm ml-auto sm:ml-4">{addr.phone}</p>
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1 leading-relaxed">{addr.addr}</p>
                                            {selectedAddressId === addr.id && (
                                                <Button onClick={(e) => { e.stopPropagation(); setActiveSection(3); }} className="mt-4 bg-violet-600 hover:bg-violet-700 h-12 w-full lg:w-48 rounded-sm font-bold uppercase shadow-md">Deliver Here</Button>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                <button onClick={() => setShowAddressForm(true)} className="flex items-center gap-2 text-violet-600 font-bold text-sm py-4 w-full border-b hover:bg-gray-50 px-4">
                                    <Plus className="w-4 h-4" /> ADD A NEW ADDRESS
                                </button>

                                {showAddressForm && (
                                    <div className="bg-violet-50/30 p-6 lg:p-8 space-y-6 text-left">
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <Label className="text-xs text-gray-500">Name</Label>
                                                <Input value={address.name} onChange={e => setAddress({ ...address, name: e.target.value })} className="rounded-sm border-gray-300 h-10 bg-white focus:border-violet-500" />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-xs text-gray-500">10-digit mobile number</Label>
                                                <Input value={address.phone} onChange={e => setAddress({ ...address, phone: e.target.value })} className="rounded-sm border-gray-300 h-10 bg-white focus:border-violet-500" />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-xs text-gray-500">Pincode</Label>
                                                <Input value={address.zip} onChange={e => setAddress({ ...address, zip: e.target.value })} className="rounded-sm border-gray-300 h-10 bg-white focus:border-violet-500" />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-xs text-gray-500">Locality</Label>
                                                <Input value={address.city} onChange={e => setAddress({ ...address, city: e.target.value })} className="rounded-sm border-gray-300 h-10 bg-white focus:border-violet-500" />
                                            </div>
                                            <div className="md:col-span-2 space-y-1">
                                                <Label className="text-xs text-gray-500">Address (Area and Street)</Label>
                                                <Input value={address.street} onChange={e => setAddress({ ...address, street: e.target.value })} className="rounded-sm border-gray-300 h-10 bg-white focus:border-violet-500" />
                                            </div>
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-4">
                                            <Button onClick={() => { setActiveSection(3); setShowAddressForm(false); }} className="bg-violet-600 hover:bg-violet-700 h-12 px-12 rounded-sm font-bold uppercase w-full sm:w-auto">Save and Deliver Here</Button>
                                            <Button onClick={() => setShowAddressForm(false)} variant="ghost" className="h-12 text-violet-600 font-bold">Cancel</Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        {activeSection > 2 && (
                            <div className="px-6 lg:px-14 pb-4">
                                <p className="text-sm font-bold text-gray-900">{address.name} <span className="text-xs font-normal text-gray-600 ml-4">{address.street}, {address.city}, {address.zip}</span></p>
                            </div>
                        )}
                    </div>

                    {/* Step 3: Order Summary */}
                    <div className="bg-white shadow-sm overflow-hidden text-left">
                        <StepHeader num={3} title="Order Summary" isCompleted={activeSection > 3} isActive={activeSection === 3} onEdit={() => setActiveSection(3)} />
                        {activeSection === 3 && (
                            <div className="p-0 border-t">
                                <div className="divide-y divide-gray-100">
                                    {cartItems.map(item => (
                                        <div key={item.id} className="p-4 sm:p-6 flex flex-col sm:flex-row gap-6">
                                            <div className="w-full sm:w-24 flex flex-row sm:flex-col items-center gap-4 sm:gap-3">
                                                <img src={item.image} className="w-20 h-20 sm:w-full sm:h-24 object-contain" alt={item.name} />
                                                <div className="flex items-center gap-3">
                                                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50">-</button>
                                                    <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                                                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50">+</button>
                                                </div>
                                            </div>
                                            <div className="flex-1 space-y-2">
                                                <h4 className="text-sm font-medium line-clamp-2">{item.name}</h4>
                                                <p className="text-xs text-gray-400">Seller: DACHCart Retail</p>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-lg font-bold">₹{(item.price * item.quantity).toLocaleString()}</span>
                                                    <span className="text-xs text-violet-600 font-bold">Offers Applied</span>
                                                </div>
                                                <button onClick={() => removeFromCart(item.id)} className="text-sm font-bold uppercase text-gray-600 hover:text-violet-600 tracking-tight">Remove</button>
                                            </div>
                                            <div className="hidden lg:block text-xs text-gray-500 whitespace-nowrap">
                                                Delivery by {new Date(Date.now() + 86400000 * 3).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })} | <span className="text-emerald-600 font-bold uppercase">Free</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-4 px-6 lg:px-12 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white shadow-[0_-2px_4px_rgba(0,0,0,0.05)] sticky bottom-0 border-t">
                                    <p className="text-xs text-gray-500">Order confirmation email will be sent to <span className="font-bold">{address.email || "your address"}</span></p>
                                    <Button onClick={() => setActiveSection(4)} className="bg-violet-600 hover:bg-violet-700 h-12 w-full sm:w-48 rounded-sm font-bold uppercase shadow-lg">Continue</Button>
                                </div>
                            </div>
                        )}
                        {activeSection > 3 && (
                            <div className="px-6 lg:px-14 pb-4">
                                <p className="text-sm font-bold text-gray-900">{cartItems.length} Item(s)</p>
                            </div>
                        )}
                    </div>

                    {/* Step 4: Payment Options */}
                    <div className="bg-white shadow-sm overflow-hidden mb-8 text-left">
                        <StepHeader num={4} title="Payment Options" isCompleted={false} isActive={activeSection === 4} />
                        {activeSection === 4 && (
                            <div className="p-4 px-6 lg:px-12 border-t space-y-6">
                                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-4">
                                    <div className={`flex items-start gap-4 p-4 border rounded-sm transition-colors ${paymentMethod === 'upi' ? 'bg-violet-50/50 border-violet-600' : 'border-gray-100 hover:bg-gray-50'}`}>
                                        <RadioGroupItem value="upi" id="upi" className="mt-1" />
                                        <div className="flex-1 -mt-1">
                                            <Label htmlFor="upi" className="font-bold text-sm cursor-pointer flex items-center gap-3">
                                                UPI
                                                <Smartphone className="w-4 h-4 text-violet-600" />
                                            </Label>
                                            {paymentMethod === 'upi' && (
                                                <div className="mt-4 space-y-4">
                                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Choose an option</p>
                                                    <div className="space-y-3">
                                                        <label className="flex items-center gap-3 p-3 border rounded-sm bg-white cursor-pointer hover:border-violet-600">
                                                            <input type="radio" name="upi_opt" defaultChecked />
                                                            <span className="text-sm">PhonePe / Google Pay / Other UPI Apps</span>
                                                        </label>
                                                    </div>
                                                    <Button onClick={handlePlaceOrder} disabled={isProcessing} className="bg-violet-600 hover:bg-violet-700 h-12 w-full lg:w-48 rounded-sm font-bold uppercase mt-2 shadow-md">
                                                        {isProcessing ? "Processing..." : "Pay ₹" + Math.round(finalTotal).toLocaleString()}
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className={`flex items-start gap-4 p-4 border rounded-sm transition-colors ${paymentMethod === 'card' ? 'bg-violet-50/50 border-violet-600' : 'border-gray-100 hover:bg-gray-50'}`}>
                                        <RadioGroupItem value="card" id="card" className="mt-1" />
                                        <div className="flex-1 -mt-1">
                                            <Label htmlFor="card" className="font-bold text-sm cursor-pointer flex items-center gap-3">
                                                Credit / Debit / ATM Card
                                                <CreditCard className="w-4 h-4 text-violet-600" />
                                            </Label>
                                            {paymentMethod === 'card' && (
                                                <div className="mt-4 space-y-3 max-w-sm">
                                                    <Input placeholder="Enter Card Number" className="rounded-sm bg-white focus:border-violet-500" />
                                                    <div className="flex gap-4">
                                                        <Input placeholder="MM/YY" className="rounded-sm bg-white focus:border-violet-500" />
                                                        <Input placeholder="CVV" className="rounded-sm bg-white w-24 focus:border-violet-500" />
                                                    </div>
                                                    <Button onClick={handlePlaceOrder} disabled={isProcessing} className="bg-violet-600 hover:bg-violet-700 h-12 w-full rounded-sm font-bold uppercase shadow-md">
                                                        {isProcessing ? "Processing..." : "Pay ₹" + Math.round(finalTotal).toLocaleString()}
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className={`flex items-start gap-4 p-4 border rounded-sm transition-colors ${paymentMethod === 'cod' ? 'bg-violet-50/50 border-violet-600' : 'border-gray-100 hover:bg-gray-50'}`}>
                                        <RadioGroupItem value="cod" id="cod" className="mt-1" />
                                        <div className="flex-1 -mt-1">
                                            <Label htmlFor="cod" className="font-bold text-sm cursor-pointer">Cash on Delivery</Label>
                                            {paymentMethod === 'cod' && (
                                                <div className="mt-4">
                                                    <Button onClick={handlePlaceOrder} disabled={isProcessing} className="bg-violet-600 hover:bg-violet-700 h-12 w-full lg:w-48 rounded-sm font-bold uppercase shadow-md">
                                                        {isProcessing ? "Processing..." : "Confirm Order"}
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </RadioGroup>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side: Price Details Sidebar */}
                <div className="lg:w-[380px] space-y-4 h-fit sticky top-20 text-left">
                    <Card className="rounded-sm shadow-sm overflow-hidden border-none bg-white">
                        <div className="p-4 border-b">
                            <h3 className="text-gray-500 font-bold uppercase tracking-tight text-sm">Price Details</h3>
                        </div>
                        <div className="p-4 px-6 space-y-5">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-800 font-medium">Price ({cartItems.length} items)</span>
                                <span className="font-bold">₹{subtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-800 font-medium">Discount</span>
                                <span className="text-emerald-600 font-bold">- ₹{Math.round(discount).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-800 font-medium">Delivery Charges</span>
                                <span className={`font-bold ${shippingCost === 0 ? 'text-emerald-600' : ''}`}>
                                    {shippingCost === 0 ? 'FREE' : '₹' + shippingCost}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-800 font-medium">Platform Fee (10%)</span>
                                <span className="font-bold">₹{platformFee.toLocaleString()}</span>
                            </div>
                            <Separator className="my-1 border-gray-100" />
                            <div className="flex justify-between text-lg font-bold pt-2">
                                <span>Total Amount</span>
                                <span className="text-violet-600">₹{Math.round(finalTotal).toLocaleString()}</span>
                            </div>
                            <Separator className="my-1 border-gray-100" />
                            <p className="text-emerald-600 font-bold text-[13px]">
                                You will save ₹{Math.round(discount).toLocaleString()} on this order
                            </p>
                        </div>
                    </Card>

                    <Card className="rounded-sm shadow-sm p-4 bg-white space-y-3">
                        <div className="flex gap-2">
                            <Tag className="w-4 h-4 text-violet-600 shrink-0 mt-1" />
                            <Label className="text-xs font-bold uppercase text-gray-500">Apply Coupon</Label>
                        </div>
                        <div className="flex gap-2">
                            <Input value={couponCode} onChange={e => setCouponCode(e.target.value)} placeholder="Enter Coupon Code" className="h-10 rounded-sm text-sm uppercase focus:border-violet-500" />
                            <Button onClick={handleApplyCoupon} variant="outline" className="h-10 border-violet-600 text-violet-600 font-bold uppercase text-xs hover:bg-violet-50">Apply</Button>
                        </div>
                        {appliedCoupon && <p className="text-[10px] text-emerald-600 font-bold border-l-2 border-emerald-600 pl-2 uppercase tracking-wider">{appliedCoupon.code} Applied: Success!</p>}
                        {couponError && <p className="text-[10px] text-rose-500 font-bold border-l-2 border-rose-500 pl-2">{couponError}</p>}
                    </Card>

                    <div className="flex items-start gap-4 text-gray-500 px-4 py-2 opacity-70">
                        <Shield className="w-10 h-10 mt-1 shrink-0 text-violet-200" />
                        <p className="text-[11px] font-medium leading-relaxed">Safe and Secure Payments. Easy returns. 100% Authentic products. Your data is encrypted and secure.</p>
                    </div>
                </div>
            </main>

            {/* Mobile View Price Bar */}
            <div className="lg:hidden fixed bottom-1 left-1 right-1 bg-white shadow-[0_-4px_12px_rgba(0,0,0,0.15)] p-4 px-6 flex items-center justify-between z-50 rounded-t-xl border-t border-[#f0f0f0]">
                <div>
                    <p className="text-lg font-bold leading-none mb-1 text-violet-600">₹{Math.round(finalTotal).toLocaleString()}</p>
                    <p className="text-violet-400 text-[10px] font-bold uppercase tracking-wider">View Price Details</p>
                </div>
                {activeSection < 4 ? (
                    <Button onClick={() => setActiveSection(activeSection + 1)} className="bg-violet-600 hover:bg-violet-700 rounded-sm px-12 uppercase font-bold h-12 shadow-lg">Continue</Button>
                ) : (
                    <Button onClick={handlePlaceOrder} disabled={isProcessing} className="bg-violet-600 hover:bg-violet-700 rounded-sm px-12 uppercase font-bold h-12 shadow-lg">
                        {isProcessing ? "Wait..." : "Place Order"}
                    </Button>
                )}
            </div>
        </div>
    );
};

export default Payment;
