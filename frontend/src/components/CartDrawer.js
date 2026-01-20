import React from 'react';
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
    Lock
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const CartDrawer = ({ children }) => {
    const navigate = useNavigate();
    const { cartItems, updateQuantity, removeFromCart } = useCart();

    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = subtotal * 0.18;
    const total = subtotal + tax;

    const handleCheckout = () => {
        navigate('/payment');
    };

    return (
        <Sheet>
            <SheetTrigger asChild>
                {children}
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md flex flex-col p-0 border-l border-slate-100 bg-white shadow-2xl">
                <SheetHeader className="p-8 border-b border-slate-50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-lg">
                                <ShoppingCart className="w-5 h-5" />
                            </div>
                            <div>
                                <SheetTitle className="text-xl font-bold tracking-tight">Shopping Cart</SheetTitle>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{cartItems.length} Consolidated Items</p>
                            </div>
                        </div>
                    </div>
                </SheetHeader>

                <ScrollArea className="flex-1 px-8 py-6">
                    {cartItems.length > 0 ? (
                        <div className="space-y-10">
                            {cartItems.map((item) => (
                                <div key={item.id} className="flex gap-6 group">
                                    <div className="relative shrink-0">
                                        <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 group-hover:border-violet-100 transition-colors">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start gap-4">
                                                <Link to={`/product/${item.id}`} className="hover:text-violet-600 transition-colors">
                                                    <h3 className="text-sm font-bold text-slate-900 leading-tight line-clamp-2 uppercase tracking-tight">{item.name}</h3>
                                                </Link>
                                                <button
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="text-slate-300 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5">{item.category}</p>
                                        </div>

                                        <div className="flex items-center justify-between mt-4">
                                            <div className="flex items-center gap-1 bg-slate-50 rounded-lg border border-slate-100 p-0.5">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    disabled={item.quantity <= 1}
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="w-7 h-7 rounded-md hover:bg-white text-slate-400 hover:text-slate-900 shadow-none"
                                                >
                                                    <Minus className="w-3 h-3" />
                                                </Button>
                                                <span className="w-8 text-center text-[11px] font-black text-slate-900">{item.quantity}</span>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="w-7 h-7 rounded-md hover:bg-white text-slate-400 hover:text-slate-900 shadow-none"
                                                >
                                                    <Plus className="w-3 h-3" />
                                                </Button>
                                            </div>
                                            <span className="text-sm font-black text-slate-900 font-mono">₹{item.price.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="h-[60vh] flex flex-col items-center justify-center text-center">
                            <div className="w-20 h-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mb-6">
                                <ShoppingBag className="w-10 h-10 text-slate-200" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight">Cart is empty</h3>
                            <p className="text-slate-400 text-sm mt-2 max-w-[200px] font-medium leading-relaxed">Your procurement list is currently vacant.</p>
                            <SheetClose asChild>
                                <Button className="mt-8 bg-slate-900 text-white rounded-xl font-bold uppercase text-[10px] tracking-widest px-8">Return to Shop</Button>
                            </SheetClose>
                        </div>
                    )}
                </ScrollArea>

                {cartItems.length > 0 && (
                    <div className="p-8 bg-slate-50 border-t border-slate-100">
                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between items-center text-slate-500">
                                <span className="text-[10px] uppercase font-black tracking-[0.15em]">Order Subtotal</span>
                                <span className="text-sm font-black text-slate-900 font-mono">₹{subtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-slate-500">
                                <span className="text-[10px] uppercase font-black tracking-[0.15em]">Standard Tax (18%)</span>
                                <span className="text-sm font-black text-slate-900 font-mono">₹{Math.round(tax).toLocaleString()}</span>
                            </div>
                            <Separator className="bg-slate-200" />
                            <div className="flex justify-between items-center">
                                <span className="text-base font-black text-slate-900 uppercase tracking-tight">Total Value</span>
                                <span className="text-2xl font-black text-slate-900 font-mono">₹{Math.round(total).toLocaleString()}</span>
                            </div>
                        </div>

                        <Button
                            onClick={handleCheckout}
                            className="w-full h-16 bg-slate-900 hover:bg-violet-600 text-white rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] shadow-2xl transition-all duration-300 group"
                        >
                            Initialize Checkout
                            <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Button>

                        <div className="flex items-center justify-center gap-2 mt-6">
                            <Lock className="w-3 h-3 text-slate-300" />
                            <p className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.15em]">Secure Procurement Protocol Active</p>
                        </div>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
};

export default CartDrawer;
