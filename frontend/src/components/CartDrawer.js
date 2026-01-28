import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
    SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "../App";
import {
    ShoppingCart,
    X,
    Minus,
    Plus,
    Trash2,
    ArrowRight,
    ShoppingBag,
    CreditCard,
    ChevronRight,
    Lock,
    Tag,
    Check,
    X as XIcon
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const CartDrawer = ({ children }) => {
    const navigate = useNavigate();
    const { cartItems, updateQuantity, removeFromCart } = useCart();

    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponError, setCouponError] = useState('');

    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Helper function to get proxied image URL
    const getImageUrl = (imageUrl) => {
        if (!imageUrl || imageUrl === '' || imageUrl === 'undefined' || imageUrl === 'null') {
            return '/assets/zlogo.png';
        }
        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
            const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
            return `${API_BASE}/api/proxy-image?url=${encodeURIComponent(imageUrl)}`;
        }
        if (!imageUrl.startsWith('/')) return '/' + imageUrl;
        return imageUrl;
    };

    const getItemImage = (item) => {
        const source = item.image || item.images?.[0] || item.thumbnail || null;
        return getImageUrl(source);
    };

    // Calculate discount
    let discount = 0;
    if (appliedCoupon) {
        if (appliedCoupon.discount.endsWith('%')) {
            const percentage = parseFloat(appliedCoupon.discount) / 100;
            discount = subtotal * percentage;
        } else {
            discount = parseFloat(appliedCoupon.discount.replace('₹', ''));
        }
    }

    const discountedSubtotal = subtotal - discount;
    const tax = discountedSubtotal * 0.18;
    const total = discountedSubtotal + tax;

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;

        try {
            const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
            const response = await axios.get(`${API_BASE}/api/coupons/validate/${couponCode.trim().toUpperCase()}`);
            setAppliedCoupon(response.data);
            setCouponError('');
            setCouponCode('');
        } catch (error) {
            setCouponError(error.response?.data?.detail || 'Invalid coupon code');
            setAppliedCoupon(null);
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setCouponCode('');
        setCouponError('');
    };

    const handleCheckout = () => {
        navigate('/payment', {
            state: {
                appliedCoupon: appliedCoupon
            }
        });
    };

    return (
        <Sheet>
            <SheetTrigger asChild>
                {children}
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md flex flex-col p-0 border-l border-gray-100 bg-white shadow-[0_0_50px_rgba(0,0,0,0.1)]">
                <SheetHeader className="p-8 border-b border-gray-50 bg-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-violet-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-violet-100">
                                <ShoppingCart className="w-6 h-6" />
                            </div>
                            <div className="text-left">
                                <SheetTitle className="text-2xl font-bold tracking-tight text-gray-900 leading-none mb-1">Your Cart</SheetTitle>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">{cartItems.length} Authorized Items</p>
                            </div>
                        </div>
                    </div>
                </SheetHeader>

                <ScrollArea className="flex-1 px-8 py-6">
                    {cartItems.length > 0 ? (
                        <div className="space-y-10">
                            {cartItems.map((item) => (
                                <div key={item.id} className="flex gap-6 group text-left">
                                    <div className="relative shrink-0">
                                        <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 group-hover:border-violet-200 transition-all duration-500">
                                            <img
                                                src={getItemImage(item)}
                                                alt={item.name}
                                                className="w-full h-full object-contain p-2 transition-transform duration-700 group-hover:scale-110"
                                                onError={(e) => { e.target.src = '/assets/zlogo.png'; }}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start gap-4">
                                                <Link to={`/product/${item.id}`} className="hover:text-violet-600 transition-colors">
                                                    <h3 className="text-sm font-bold text-gray-900 leading-tight line-clamp-2 transition-colors">{item.name}</h3>
                                                </Link>
                                                <button
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="w-7 h-7 flex items-center justify-center text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <p className="text-[10px] font-bold text-violet-400 uppercase tracking-widest mt-2">{item.category}</p>
                                        </div>

                                        <div className="flex items-center justify-between mt-4">
                                            <div className="flex items-center gap-2 bg-gray-50 rounded-xl border border-gray-100 p-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    disabled={item.quantity <= 1}
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="w-8 h-8 rounded-lg hover:bg-white text-gray-400 hover:text-violet-600 shadow-none border-0"
                                                >
                                                    <Minus className="w-3.5 h-3.5" />
                                                </Button>
                                                <span className="w-6 text-center text-xs font-bold text-gray-900">{item.quantity}</span>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="w-8 h-8 rounded-lg hover:bg-white text-gray-400 hover:text-violet-600 shadow-none border-0"
                                                >
                                                    <Plus className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>
                                            <span className="text-base font-black text-gray-900 font-sans tracking-tight">₹{item.price.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="h-[60vh] flex flex-col items-center justify-center text-center">
                            <div className="w-20 h-20 bg-violet-50 rounded-[2rem] flex items-center justify-center mb-8 text-violet-600">
                                <ShoppingBag className="w-10 h-10" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 tracking-tight leading-none mb-3">Cart is Vacant</h3>
                            <p className="text-gray-400 text-sm font-medium leading-relaxed max-w-[200px] mb-10">Your procurement queue is currently empty.</p>
                            <SheetClose asChild>
                                <Button className="h-14 px-10 bg-gray-900 hover:bg-violet-600 text-white rounded-2xl font-bold uppercase text-[10px] tracking-widest shadow-xl active:scale-95 transition-all">Initialize Shopping</Button>
                            </SheetClose>
                        </div>
                    )}
                </ScrollArea>

                {cartItems.length > 0 && (
                    <div className="p-8 bg-gray-50 border-t border-gray-100">
                        {/* Coupon Section */}
                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-3">
                                <Tag className="w-4 h-4 text-violet-600" />
                                <span className="text-[10px] uppercase font-black tracking-[0.2em] text-violet-600">Apply Coupon Code</span>
                            </div>

                            {appliedCoupon ? (
                                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl p-3 mb-4">
                                    <div className="flex items-center gap-2">
                                        <Check className="w-4 h-4 text-emerald-600" />
                                        <span className="text-sm font-bold text-emerald-700">{appliedCoupon.code}</span>
                                        <span className="text-xs text-emerald-600">({appliedCoupon.discount} off)</span>
                                    </div>
                                    <button
                                        onClick={handleRemoveCoupon}
                                        className="text-emerald-600 hover:text-emerald-800"
                                    >
                                        <XIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex gap-2 mb-4">
                                    <Input
                                        placeholder="Enter coupon code"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                        className="flex-1 h-10 rounded-xl border-gray-200 focus:border-violet-300"
                                        onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
                                    />
                                    <Button
                                        onClick={handleApplyCoupon}
                                        disabled={!couponCode.trim()}
                                        className="h-10 px-4 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold text-xs"
                                    >
                                        Apply
                                    </Button>
                                </div>
                            )}

                            {couponError && (
                                <p className="text-xs text-red-600 font-medium">{couponError}</p>
                            )}
                        </div>

                        <div className="space-y-4 mb-8 text-left">
                            <div className="flex justify-between items-center text-gray-500">
                                <span className="text-[10px] uppercase font-bold tracking-[0.2em]">Procurement Subtotal</span>
                                <span className="text-sm font-bold text-gray-900">₹{subtotal.toLocaleString()}</span>
                            </div>

                            {discount > 0 && (
                                <div className="flex justify-between items-center text-emerald-600">
                                    <span className="text-[10px] uppercase font-bold tracking-[0.2em]">Coupon Discount</span>
                                    <span className="text-sm font-bold">-₹{Math.round(discount).toLocaleString()}</span>
                                </div>
                            )}

                            <div className="flex justify-between items-center text-gray-500">
                                <span className="text-[10px] uppercase font-bold tracking-[0.2em]">Compliance Tax (18%)</span>
                                <span className="text-sm font-bold text-gray-900">₹{Math.round(tax).toLocaleString()}</span>
                            </div>

                            <Separator className="bg-gray-200/50 h-0.5" />
                            <div className="flex justify-between items-end pt-2">
                                <div className="text-left">
                                    <p className="text-[10px] uppercase font-black tracking-[0.2em] text-violet-600 mb-1">Authorize Grand Total</p>
                                    <span className="text-3xl font-black text-gray-900 tracking-tighter">₹{Math.round(total).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        <Button
                            onClick={handleCheckout}
                            className="w-full h-16 bg-violet-600 hover:bg-violet-700 text-white rounded-[2rem] font-bold uppercase text-[12px] tracking-[0.2em] shadow-2xl shadow-violet-100 transition-all active:scale-95 flex items-center justify-center group"
                        >
                            Confirm & Checkout
                            <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Button>

                        <div className="flex items-center justify-center gap-2 mt-8">
                            <Lock className="w-3.5 h-3.5 text-gray-300" />
                            <p className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.2em]">Secure Checkout Protocol Enabled</p>
                        </div>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
};

export default CartDrawer;
