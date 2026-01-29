import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  XCircle,
  BadgePercent,
  CheckCircle2
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
  const shipping = subtotal > 1499 ? 0 : 99;

  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.type === 'percentage') {
      return (subtotal * appliedCoupon.value) / 100;
    }
    return appliedCoupon.value;
  };

  const discount = calculateDiscount();
  const total = subtotal + shipping - discount;

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
    if (imageSource.startsWith('http')) {
      const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
      return `${API_BASE}/api/proxy-image?url=${encodeURIComponent(imageSource)}`;
    }
    return imageSource;
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navigation />

      <main className="flex-1 pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h1 className="text-4xl sm:text-6xl font-black text-gray-900 tracking-tighter uppercase leading-none mb-4">
              Your <span className="text-violet-600">Cart</span>
            </h1>
            <p className="text-gray-500 text-sm font-medium">Review your items and proceed to checkout</p>
          </div>

          {cartItems.length > 0 ? (
            <div className="grid lg:grid-cols-12 gap-12 items-start">

              {/* Product List */}
              <div className="lg:col-span-8 space-y-8">
                <div className="divide-y divide-gray-100 border-t border-b border-gray-100">
                  {cartItems.map((item) => (
                    <div key={item.id} className="py-8 flex gap-6 sm:gap-10">
                      <div className="w-24 h-32 sm:w-32 sm:h-40 bg-gray-50 rounded-3xl overflow-hidden shrink-0">
                        <img
                          src={getItemImage(item)}
                          alt={item.name}
                          className="w-full h-full object-contain p-4 mix-blend-multiply"
                        />
                      </div>

                      <div className="flex-1 flex flex-col justify-between py-2">
                        <div className="space-y-1">
                          <div className="flex justify-between items-start">
                            <h3 className="font-black text-gray-900 text-lg uppercase tracking-tight line-clamp-2">
                              {item.name}
                            </h3>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-gray-400 hover:text-rose-500 transition-colors"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                          <p className="text-violet-600 text-[10px] font-black uppercase tracking-widest">{item.category}</p>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-6 text-center font-black text-gray-900">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-xl font-black text-gray-900 tracking-tighter">
                            ₹{(item.price * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Link to="/shop" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-violet-600 transition-colors">
                  <ArrowLeft className="w-4 h-4" />
                  Continue Shopping
                </Link>
              </div>

              {/* Summary */}
              <div className="lg:col-span-4">
                <div className="bg-gray-50 rounded-[3rem] p-8 sm:p-10 sticky top-32">
                  <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter mb-8 text-left">Summary</h2>

                  <div className="flex justify-between items-end mb-10 pt-4">
                    <div className="text-left">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Amount</p>
                      <p className="text-4xl font-black text-gray-900 tracking-tighter">₹{total.toLocaleString()}</p>
                    </div>
                  </div>

                  <Button
                    onClick={() => navigate('/payment')}
                    className="w-full h-18 bg-violet-600 hover:bg-violet-700 text-white rounded-3xl font-black text-lg uppercase tracking-widest shadow-2xl shadow-violet-100 transition-all active:scale-95 py-8"
                  >
                    Checkout Now
                  </Button>
                </div>
              </div>

            </div>
          ) : (
            <div className="py-24 text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8">
                <ShoppingBag className="w-10 h-10 text-gray-200" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter mb-4">Cart is Empty</h2>
              <Link to="/shop">
                <Button className="h-16 px-12 bg-gray-900 hover:bg-violet-600 text-white rounded-2xl font-black uppercase tracking-widest">
                  Start Shopping
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