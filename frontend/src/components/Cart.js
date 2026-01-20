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
  XCircle
} from "lucide-react";

import Navigation from "./Navigation";
import Footer from "./Footer";

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
    <div className="min-h-screen bg-white flex flex-col">
      <Navigation />

      {/* Header */}
      <div className="bg-gradient-to-b from-violet-50 to-white border-b border-violet-100 pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-violet-100 text-violet-600 rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Shopping Cart</h1>
              <p className="text-gray-500 mt-1">{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart</p>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {cartItems.length > 0 ? (
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl border border-gray-100 hover:border-violet-200 hover:shadow-lg transition-all duration-300 p-4 md:p-6"
                >
                  <div className="flex gap-4 md:gap-6">
                    {/* Image */}
                    <Link to={`/product/${item.id}`} className="shrink-0">
                      <div className="w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden bg-gray-50">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                    </Link>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-[10px] uppercase tracking-widest text-violet-600 font-semibold mb-1">
                            {item.category}
                          </p>
                          <Link to={`/product/${item.id}`}>
                            <h3 className="font-semibold text-gray-900 hover:text-violet-600 transition-colors line-clamp-2 mb-2">
                              {item.name}
                            </h3>
                          </Link>
                          <p className="text-xl font-bold text-gray-900">
                            ₹{item.price.toLocaleString()}
                          </p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="shrink-0 w-9 h-9 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg flex items-center justify-center transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Quantity & Subtotal */}
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-white hover:text-violet-600 rounded-md transition-all"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center font-semibold text-gray-900">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-white hover:text-violet-600 rounded-md transition-all"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-lg font-bold text-gray-900">
                          ₹{(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <Link
                to="/shop"
                className="inline-flex items-center gap-2 text-violet-600 hover:text-violet-700 font-medium mt-4 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Continue Shopping
              </Link>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 rounded-2xl p-6 sticky top-24">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Order Summary</h2>

                {/* Promo Code */}
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Promo Code</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Enter code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="pl-10 h-11 bg-white border-gray-200 rounded-lg"
                      />
                    </div>
                    <Button
                      onClick={applyCoupon}
                      variant="outline"
                      className="h-11 px-5 border-violet-200 text-violet-600 hover:bg-violet-50 rounded-lg font-semibold"
                    >
                      Apply
                    </Button>
                  </div>
                  {appliedCoupon && (
                    <p className="text-sm text-emerald-600 mt-2 font-medium">
                      ✓ Protocol "{appliedCoupon.code}" active - ₹{Math.round(discount).toLocaleString()} discount authorized.
                    </p>
                  )}
                  {couponError && (
                    <p className="text-sm text-red-500 mt-2 font-medium flex items-center gap-1.5">
                      <XCircle className="w-4 h-4" /> {couponError}
                    </p>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({cartItems.length} items)</span>
                    <span className="font-medium text-gray-900">₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className={`font-medium ${shipping === 0 ? 'text-emerald-600' : 'text-gray-900'}`}>
                      {shipping === 0 ? 'FREE' : `₹${shipping}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>GST (18%)</span>
                    <span className="font-medium text-gray-900">₹{Math.round(tax).toLocaleString()}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Discount</span>
                      <span className="font-medium">-₹{discount.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                {/* Total */}
                <div className="flex justify-between items-center mb-6">
                  <span className="text-lg font-semibold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-gray-900">₹{Math.round(total).toLocaleString()}</span>
                </div>

                {/* Checkout Button */}
                <Button
                  onClick={() => window.location.href = '/payment'}
                  className="w-full h-12 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-semibold text-base transition-all"
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  Proceed to Checkout
                </Button>

                {/* Trust Badges */}
                <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Truck className="w-5 h-5 text-violet-600" />
                    <span>Free shipping on orders over ₹{shippingThreshold}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Shield className="w-5 h-5 text-violet-600" />
                    <span>Secure checkout with SSL encryption</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Empty Cart */
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-violet-100 text-violet-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-12 h-12" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Your cart is empty</h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Looks like you haven't added any items to your cart yet. Start shopping to fill it up!
            </p>
            <Link to="/shop">
              <Button className="bg-violet-600 hover:bg-violet-700 text-white h-12 px-8 rounded-xl font-semibold">
                Start Shopping <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Cart;