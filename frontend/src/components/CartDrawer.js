import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
import { Checkbox } from "@/components/ui/checkbox";
import { useCart } from "../App";
import {
    ShoppingCart,
    Minus,
    Plus,
    Trash2,
    ChevronRight,
    ShoppingBag,
    Lock,
    ArrowRight
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const CartDrawer = ({ children }) => {
    const navigate = useNavigate();
    const { cartItems, updateQuantity, removeFromCart, toggleSelected, getCartTotal } = useCart();

    const subtotal = getCartTotal();
    const total = subtotal;

    const getImageUrl = (imageUrl) => {
        if (!imageUrl || imageUrl === '' || imageUrl === 'undefined' || imageUrl === 'null') {
            return '/assets/zlogo.png';
        }
        if (imageUrl.startsWith('http')) {
            const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
            return `${API_BASE}/api/proxy-image?url=${encodeURIComponent(imageUrl)}`;
        }
        return imageUrl;
    };

    const getItemImage = (item) => {
        const source = item.image || item.images?.[0] || item.thumbnail || null;
        return getImageUrl(source);
    };

    const handleCheckout = () => {
        const selectedItems = cartItems.filter(item => item.selected);
        if (selectedItems.length === 0) return;
        navigate('/payment');
    };

    const selectedCount = cartItems.filter(item => item.selected).length;

    return (
        <Sheet>
            <SheetTrigger asChild>
                {children}
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md flex flex-col p-0 border-l-0 sm:border-l border-gray-100 bg-white">
                {/* Header - Premium Mobile Design */}
                <SheetHeader className="p-6 sm:p-8 border-b border-gray-50 flex-shrink-0">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-gray-900 text-white rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-gray-200">
                            <ShoppingBag className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                            <SheetTitle className="text-2xl font-black text-gray-900 tracking-tighter uppercase leading-none mb-1">My Bag</SheetTitle>
                            <p className="text-[10px] font-black text-violet-600 uppercase tracking-widest">{cartItems.length} Products Added</p>
                        </div>
                    </div>
                </SheetHeader>

                {/* Body - Scroll Area */}
                <ScrollArea className="flex-1 px-4 sm:px-8 py-6">
                    {cartItems.length > 0 ? (
                        <div className="space-y-8">
                            {cartItems.map((item) => (
                                <div key={item.id} className={`flex gap-4 sm:gap-6 group relative transition-all duration-300 ${!item.selected ? 'opacity-60 saturate-50' : ''}`}>
                                    {/* Selection Checkbox */}
                                    <div className="flex items-center pt-2">
                                        <Checkbox
                                            checked={item.selected}
                                            onCheckedChange={() => toggleSelected(item.id)}
                                            className="w-5 h-5 rounded-lg border-2 border-gray-200 data-[state=checked]:bg-violet-600 data-[state=checked]:border-violet-600"
                                        />
                                    </div>

                                    {/* Product Visual */}
                                    <div className="relative shrink-0">
                                        <div className="w-20 h-28 sm:w-24 sm:h-32 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center p-2">
                                            <img
                                                src={getItemImage(item)}
                                                alt={item.name}
                                                className="w-full h-full object-contain mix-blend-multiply"
                                                onError={(e) => { e.target.src = '/assets/zlogo.png'; }}
                                            />
                                        </div>
                                    </div>

                                    {/* Product Info */}
                                    <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                                        <div className="text-left">
                                            <div className="flex justify-between items-start gap-2">
                                                <h3 className="text-[13px] sm:text-sm font-black text-gray-900 uppercase tracking-tight leading-snug line-clamp-2">
                                                    {item.name}
                                                </h3>
                                                <button
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1.5">{item.category}</p>
                                        </div>

                                        <div className="flex items-center justify-between mt-3">
                                            <div className="flex items-center gap-3 bg-white border border-gray-100 p-1 rounded-xl shadow-sm">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-900"
                                                >
                                                    <Minus className="w-3.5 h-3.5" />
                                                </button>
                                                <span className="text-xs font-black text-gray-900 w-4 text-center">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-900"
                                                >
                                                    <Plus className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                            <span className="text-sm sm:text-base font-black text-gray-900 tracking-tighter">₹{item.price.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center py-20">
                            <div className="w-24 h-24 bg-gray-50 rounded-[3rem] flex items-center justify-center mb-8">
                                <ShoppingBag className="w-10 h-10 text-gray-200" />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter mb-2">Cart is Empty</h3>
                            <SheetClose asChild>
                                <Button className="h-14 px-8 bg-gray-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest">Start Shopping</Button>
                            </SheetClose>
                        </div>
                    )}
                </ScrollArea>

                {/* Footer - Minimalist Premium Checkout */}
                {cartItems.length > 0 && (
                    <div className="p-6 sm:p-10 bg-white border-t border-gray-50 flex-shrink-0">
                        <div className="flex justify-between items-end mb-10">
                            <div className="text-left">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Checkout Amount</p>
                                <p className="text-4xl font-black text-gray-900 tracking-tighter">₹{Math.round(total).toLocaleString()}</p>
                                <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest mt-1">For {selectedCount} Selected Items</p>
                            </div>
                            <div className="text-right pb-1">
                                <Lock className="w-4 h-4 text-gray-200 ml-auto" />
                            </div>
                        </div>

                        <Button
                            onClick={handleCheckout}
                            disabled={selectedCount === 0}
                            className={`w-full h-20 rounded-[2.5rem] font-black uppercase text-xs tracking-widest transition-all active:scale-95 flex items-center justify-center gap-3 shadow-2xl ${selectedCount === 0 ? 'bg-gray-100 text-gray-400' : 'bg-violet-600 hover:bg-violet-700 text-white shadow-violet-100'}`}
                        >
                            Proceed to Checkout
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
};

export default CartDrawer;
