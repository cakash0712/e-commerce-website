import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart, useCoupons } from "../App";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  Truck,
  Shield,
  ArrowLeft,
  ArrowRight,
  Tag,
  CreditCard,
  XCircle,
  BadgePercent
} from "lucide-react";

import Navigation from "./Navigation";
import Footer from "./Footer";

// Cart Page - Professional Formal Violet Style
const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart } = useCart();
  const { validateCoupon } = useCoupons();
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const applyCoupon = () => {
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

  const shippingThreshold = 499;
  const shipping = subtotal > shippingThreshold ? 0 : 99;
  const tax = subtotal * 0.18;

  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.type === 'percentage') {
      return (subtotal * appliedCoupon.value) / 100;
    }
    return appliedCoupon.value;
  };

  const discount = calculateDiscount();
  const total = subtotal + shipping + tax - discount;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation />

      <main className="flex-1 pt-20">
        {/* Hero Header */}
        <section className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 text-left">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <nav className="text-sm text-gray-400 mb-6 flex items-center gap-2">
                  <Link to="/" className="hover:text-violet-600 transition-colors">Home</Link>
                  <span className="text-gray-300">›</span>
                  <span className="text-gray-900 font-medium">Shopping Cart</span>
                </nav>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-violet-100 rounded-2xl flex items-center justify-center text-violet-600">
                    <ShoppingBag className="w-7 h-7" />
                  </div>
                  <div>
                    <h1 className="text-3xl md:text-5xl font-bold text-gray-900 tracking-tight leading-tight">Your <span className="text-violet-600">Cart</span></h1>
                    <p className="text-gray-500 font-medium mt-1">Review your selections before checkout</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="bg-violet-50 px-6 py-3 rounded-2xl border border-violet-100 text-center">
                  <p className="text-[10px] uppercase font-bold text-violet-400 tracking-widest mb-1">Total Items</p>
                  <p className="text-xl font-bold text-violet-700">{cartItems.length}</p>
                </div>
                <div className="bg-violet-600 px-6 py-3 rounded-2xl shadow-lg shadow-violet-100 text-center">
                  <p className="text-[10px] uppercase font-bold text-violet-200 tracking-widest mb-1">Estimated Total</p>
                  <p className="text-xl font-bold text-white">₹{Math.round(total).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
          {cartItems.length > 0 ? (
            <div className="grid lg:grid-cols-12 gap-8 items-start">

              {/* Product List */}
              <div className="lg:col-span-8 space-y-6">
                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden text-left">
                  <div className="hidden md:grid grid-cols-12 gap-4 p-6 bg-gray-50/50 border-b border-gray-100">
                    <div className="col-span-6 text-[10px] font-bold uppercase tracking-widest text-gray-400">Product Particulars</div>
                    <div className="col-span-3 text-[10px] font-bold uppercase tracking-widest text-gray-400 text-center">Quantity</div>
                    <div className="col-span-3 text-[10px] font-bold uppercase tracking-widest text-gray-400 text-right">Subtotal</div>
                  </div>

                  <div className="divide-y divide-gray-100">
                    {cartItems.map((item) => (
                      <div key={item.id} className="p-6 transition-all hover:bg-violet-50/10 group">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                          {/* Item Info */}
                          <div className="md:col-span-6 flex gap-6">
                            <Link to={`/product/${item.id}`} className="shrink-0">
                              <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 group-hover:border-violet-200 transition-all">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-full h-full object-contain p-2 mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                                />
                              </div>
                            </Link>
                            <div className="flex flex-col justify-center min-w-0">
                              <p className="text-[10px] uppercase font-bold text-violet-600 tracking-widest mb-1">{item.category}</p>
                              <Link to={`/product/${item.id}`}>
                                <h3 className="font-bold text-gray-900 hover:text-violet-600 transition-colors line-clamp-2 mb-1 leading-tight">{item.name}</h3>
                              </Link>
                              <p className="text-gray-900 font-bold">₹{item.price.toLocaleString()}</p>
                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="inline-flex items-center gap-1.5 text-[10px] font-bold text-rose-500 uppercase tracking-wider mt-3 hover:text-rose-600 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Remove Item
                              </button>
                            </div>
                          </div>

                          {/* Quantity Selector */}
                          <div className="md:col-span-3 flex justify-center">
                            <div className="flex items-center gap-4 bg-gray-100 p-1.5 rounded-xl border border-gray-200">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-white hover:text-violet-600 rounded-lg shadow-none hover:shadow-sm transition-all"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="w-6 text-center font-bold text-gray-900">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-white hover:text-violet-600 rounded-lg shadow-none hover:shadow-sm transition-all"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Net Price */}
                          <div className="md:col-span-3 text-right">
                            <p className="text-xl font-bold text-gray-900">₹{(item.price * item.quantity).toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center px-4">
                  <Link to="/shop" className="group inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-violet-600 transition-colors">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Return to Shop
                  </Link>
                </div>
              </div>

              {/* Order Summary Sidebar */}
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl shadow-gray-200/50 sticky top-24 text-left">
                  <h2 className="text-xl font-bold text-gray-900 mb-8 border-b border-gray-100 pb-4 tracking-tight">Order Procurement</h2>

                  {/* Coupon System */}
                  <div className="mb-8">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 block">Offer Authorization</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <BadgePercent className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-400" />
                        <Input
                          placeholder="Coupon Code"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          className="pl-11 h-14 rounded-xl bg-gray-50 border-gray-100 focus:bg-white transition-all font-bold placeholder:font-normal"
                        />
                      </div>
                      <Button
                        onClick={applyCoupon}
                        className="h-14 px-6 bg-gray-900 hover:bg-violet-600 text-white rounded-xl font-bold transition-all shadow-lg active:scale-95"
                      >
                        Apply
                      </Button>
                    </div>
                    {appliedCoupon && (
                      <div className="mt-4 p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-3">
                        <div className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                        <p className="text-xs font-bold text-emerald-700">Protocol "{appliedCoupon.code}" authorized: ₹{Math.round(discount).toLocaleString()} saved.</p>
                      </div>
                    )}
                    {couponError && (
                      <p className="mt-3 text-xs font-bold text-rose-500 flex items-center gap-1.5 ml-1 animate-shake">
                        <XCircle className="w-3.5 h-3.5" /> {couponError}
                      </p>
                    )}
                  </div>

                  {/* Pricing Matrix */}
                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between items-center text-gray-500">
                      <span className="text-sm font-medium">Merchandise Subtotal</span>
                      <span className="font-bold text-gray-900">₹{subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-gray-500">
                      <span className="text-sm font-medium">Logistical Service</span>
                      <span className={`font-bold ${shipping === 0 ? 'text-emerald-600' : 'text-gray-900'}`}>
                        {shipping === 0 ? 'COMPLIMENTARY' : `₹${shipping}`}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-gray-500">
                      <span className="text-sm font-medium">Regulatory GST (18%)</span>
                      <span className="font-bold text-gray-900">₹{Math.round(tax).toLocaleString()}</span>
                    </div>
                    {appliedCoupon && (
                      <div className="flex justify-between items-center text-emerald-600 bg-emerald-50/50 -mx-8 px-8 py-2">
                        <span className="text-sm font-bold">Authorized Discount</span>
                        <span className="font-bold">-₹{Math.round(discount).toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-6 border-t border-gray-100 mb-8">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Grand Total</p>
                        <p className="text-3xl font-black text-gray-900 tracking-tighter">₹{Math.round(total).toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Fully Secured</p>
                        <div className="flex gap-1">
                          <Shield className="w-3 h-3 text-emerald-500" />
                          <Shield className="w-3 h-3 text-emerald-500" />
                          <Shield className="w-3 h-3 text-emerald-500" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => window.location.href = '/payment'}
                    className="w-full h-16 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl font-bold text-sm uppercase tracking-widest shadow-xl shadow-violet-100 transition-all active:scale-95 flex items-center justify-center gap-3 group"
                  >
                    <CreditCard className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    Begin Secure Checkout
                  </Button>

                  {/* Trust Indicators */}
                  <div className="mt-8 space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                      <Truck className="w-5 h-5 text-violet-600" />
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">
                        {subtotal > shippingThreshold
                          ? "Logistics tier upgraded: Complimentary Delivery"
                          : `Spend ₹${shippingThreshold - subtotal} more for Complimentary Delivery`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            /* Empty State */
            <div className="py-24 max-w-lg mx-auto text-center animate-in zoom-in duration-700">
              <div className="w-24 h-24 bg-violet-100 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-violet-600 shadow-lg shadow-violet-50">
                <ShoppingBag className="w-10 h-10" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">Your cart is currently <span className="text-violet-600">vacant.</span></h2>
              <p className="text-gray-500 font-medium mb-10 leading-relaxed">
                It appears you haven't authorized any items for procurement yet. Explore our curated collections to find your perfect match.
              </p>
              <Link to="/shop">
                <Button className="h-16 px-12 bg-gray-900 hover:bg-violet-600 text-white rounded-2xl font-bold uppercase tracking-widest transition-all shadow-xl active:scale-95 flex items-center gap-3 mx-auto">
                  Initialize Shopping <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

const CheckCircle2 = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" /><path d="m9 12 2 2 4-4" /></svg>;

export default Cart;