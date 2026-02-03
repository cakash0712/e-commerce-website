import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCart, useCoupons } from "../App";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  Truck,
  Shield,
  ArrowLeft,
  XCircle,
  CheckCircle2,
  ShieldCheck,
  Tag,
  MapPin
} from "lucide-react";

import Navigation from "./Navigation";
import Footer from "./Footer";

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, updateQuantity, removeFromCart } = useCart();
  const { validateCoupon } = useCoupons();
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = appliedCoupon ? (appliedCoupon.type === 'percentage' ? (subtotal * appliedCoupon.value) / 100 : appliedCoupon.value) : 0;

  const shippingCost = cartItems.reduce((sum, item) => {
    // If item has specific delivery info
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
    // Fallback logic for legacy items
    const legacyThreshold = 500;
    const itemTotal = item.price * item.quantity;
    return sum + (itemTotal >= legacyThreshold ? 0 : 40);
  }, 0);

  const total = subtotal + shippingCost - discount;

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

  const getItemImage = (item) => {
    const imageSource = item.image || item.images?.[0] || item.thumbnail || '/assets/zlogo.png';
    return imageSource;
  };

  return (
    <div className="min-h-screen bg-[#f1f3f6] flex flex-col font-sans">
      <Navigation />

      <main className="flex-1 pt-24 pb-20 text-left">
        <div className="max-w-[1248px] mx-auto px-2 sm:px-4">

          {cartItems.length > 0 ? (
            <div className="grid lg:grid-cols-12 gap-4 items-start">

              {/* Product List */}
              <div className="lg:col-span-8 space-y-3">
                <div className="bg-white shadow-sm rounded-sm overflow-hidden border border-violet-100/30">
                  <div className="p-4 border-b flex items-center justify-between">
                    <h1 className="text-lg font-bold">My Cart ({cartItems.length})</h1>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-violet-600" />
                      <span className="text-gray-600">Deliver to</span>
                      <span className="font-bold border border-violet-100 px-2 py-1 rounded-sm text-xs text-violet-600 bg-violet-50/30">Pincode</span>
                    </div>
                  </div>

                  <div className="divide-y divide-gray-100">
                    {cartItems.map((item) => (
                      <div key={item.id} className="p-4 sm:p-6 flex flex-col sm:flex-row gap-6 hover:bg-violet-50/20 transition-colors">
                        <div className="w-full sm:w-28 flex flex-row sm:flex-col items-center gap-4">
                          <img
                            src={getItemImage(item)}
                            alt={item.name}
                            className="w-20 h-20 sm:w-full sm:h-28 object-contain mix-blend-multiply transition-transform hover:scale-105"
                          />
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-7 h-7 flex items-center justify-center border border-violet-200 rounded-full hover:bg-white hover:shadow-sm text-violet-600"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-8 text-center font-bold text-sm border border-violet-50 py-0.5 bg-white text-violet-900">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-7 h-7 flex items-center justify-center border border-violet-200 rounded-full hover:bg-white hover:shadow-sm text-violet-600"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        <div className="flex-1 flex flex-col justify-between py-1 text-left">
                          <div className="space-y-1">
                            <h3 className="font-medium text-gray-900 text-base line-clamp-1 hover:text-violet-600 cursor-pointer transition-colors font-semibold">
                              {item.name}
                            </h3>
                            <div className="flex items-center gap-4 text-xs text-gray-400 font-medium">
                              <span>Seller: DACHCart Retail</span>
                              <Badge className="bg-violet-50 text-violet-600 text-[9px] uppercase font-black px-1.5 border-violet-100">Assured</Badge>
                            </div>
                            <div className="flex items-center gap-2 mt-3">
                              <span className="text-xl font-bold text-violet-900">₹{(item.price * item.quantity).toLocaleString()}</span>
                              <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">Offers Applied</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-6 mt-4">
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-sm font-bold uppercase text-gray-400 hover:text-rose-500 transition-colors tracking-tight flex items-center gap-1.5"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Remove
                            </button>
                            <button className="text-sm font-bold uppercase text-gray-400 hover:text-violet-600 transition-colors tracking-tight">
                              Save for later
                            </button>
                          </div>
                        </div>

                        <div className="hidden md:block text-xs">
                          <p className="text-gray-400">Delivery by</p>
                          <p className="font-bold text-gray-800">{new Date(Date.now() + 86400000 * 3).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                          <p className="text-emerald-600 font-bold uppercase mt-1">Free Delivery</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 px-6 flex justify-end bg-white border-t border-violet-50 shadow-[0_-4px_12px_rgba(0,0,0,0.03)] sticky bottom-0">
                    <Button
                      onClick={() => navigate('/payment')}
                      className="bg-violet-600 hover:bg-violet-700 h-12 w-full sm:w-64 rounded-sm font-bold uppercase text-base shadow-xl shadow-violet-100"
                    >
                      Place Order
                    </Button>
                  </div>
                </div>

                <Link
                  to="/"
                  className="inline-flex items-center gap-2 text-sm font-bold text-violet-600 hover:text-violet-700 transition-all group mt-4"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  Continue Shopping
                </Link>
              </div>

              {/* Price Details Sidebar */}
              <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-4">
                <Card className="rounded-sm shadow-sm border-none bg-white overflow-hidden text-left border-t-2 border-t-violet-600">
                  <div className="p-4 border-b">
                    <h2 className="text-gray-500 font-bold uppercase text-sm tracking-tight">Price Details</h2>
                  </div>
                  <div className="p-4 px-6 space-y-5">
                    <div className="flex justify-between text-base">
                      <span className="text-gray-600">Price ({cartItems.length} items)</span>
                      <span className="font-bold">₹{subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-base">
                      <span className="text-gray-600">Discount</span>
                      <span className="text-emerald-600 font-bold">- ₹{Math.round(discount).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-base">
                      <span className="text-gray-600">Delivery Charges</span>
                      <span className={shippingCost === 0 ? 'text-emerald-600 font-bold' : 'font-bold'}>
                        {shippingCost === 0 ? 'FREE' : '₹' + shippingCost}
                      </span>
                    </div>

                    <div className="border-t border-dashed border-violet-100 pt-4 flex justify-between text-lg font-bold">
                      <span className="text-gray-800">Total Amount</span>
                      <span className="text-violet-600">₹{Math.round(total).toLocaleString()}</span>
                    </div>

                    <div className="border-t border-violet-50 pt-3 text-emerald-600 font-bold text-sm bg-emerald-50/30 -mx-6 px-6 py-2">
                      You will save ₹{Math.round(discount).toLocaleString()} on this order
                    </div>
                  </div>
                </Card>

                <div className="bg-white p-4 rounded-sm shadow-sm space-y-3 text-left border-l-2 border-l-violet-600">
                  <div className="flex items-center gap-2 text-violet-600 font-bold text-xs uppercase">
                    <Tag className="w-4 h-4" /> Apply Coupon Code
                  </div>
                  <div className="flex gap-2">
                    <input
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Enter Code"
                      className="flex-1 h-10 border border-violet-100 px-3 rounded-sm text-sm uppercase focus:outline-none focus:border-violet-600 transition-colors"
                    />
                    <button onClick={applyCoupon} className="font-bold text-violet-600 bg-white border border-violet-600 px-4 rounded-sm text-xs hover:bg-violet-50 transition-colors uppercase">Apply</button>
                  </div>
                  {appliedCoupon && <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider bg-emerald-50 py-1 px-2 rounded-sm">{appliedCoupon.code} Applied Successfully!</p>}
                  {couponError && <p className="text-[10px] text-rose-500 font-bold bg-rose-50 py-1 px-2 rounded-sm">{couponError}</p>}
                </div>

                <div className="flex items-start gap-4 p-5 text-gray-400 font-medium text-[11px] leading-relaxed border border-violet-50 rounded-sm">
                  <ShieldCheck className="w-10 h-10 shrink-0 text-violet-100 mt-1" />
                  <p>Safe and Secure Payments. Easy returns. 100% Authentic products. Your financial data is fully encrypted and never stored on our servers.</p>
                </div>
              </div>

            </div>
          ) : (
            <div className="py-24 bg-white shadow-sm rounded-sm flex flex-col items-center border border-violet-50">
              <div className="w-64 h-64 mb-8">
                <img src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/empty-cart_ee6141.png" className="w-full h-full object-contain mix-blend-multiply opacity-50" alt="Empty" />
              </div>
              <h2 className="text-2xl font-black text-violet-900 uppercase tracking-tighter mb-2">Your cart is empty!</h2>
              <p className="text-sm text-gray-500 mb-8 max-w-xs text-center font-medium">Add items to it now and explore our wide range of tailored products across all categories.</p>
              <Link to="/">
                <Button className="bg-violet-600 hover:bg-violet-700 text-white rounded-sm px-20 h-12 font-bold uppercase tracking-widest shadow-xl shadow-violet-100 transition-all active:scale-95">
                  Shop Now
                </Button>
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Cart;