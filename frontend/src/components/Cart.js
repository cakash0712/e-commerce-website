import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useCart } from "../App";
import { Minus, Plus, Trash2, ShoppingBag, Gift, Truck, Shield, ArrowLeft } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);


  const applyCoupon = () => {
    // Mock coupon logic
    if (couponCode.toLowerCase() === 'save10') {
      setAppliedCoupon({ code: 'SAVE10', discount: 10 });
    } else if (couponCode.toLowerCase() === 'free') {
      setAppliedCoupon({ code: 'FREE', discount: 100 });
    } else {
      setAppliedCoupon(null);
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 50 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const discount = appliedCoupon ? Math.min(appliedCoupon.discount, subtotal) : 0;
  const total = subtotal + shipping + tax - discount;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

        {cartItems.length > 0 ? (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <Card key={item.id} className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full sm:w-24 h-48 sm:h-24 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">Category: {item.category}</p>
                        <p className="text-lg font-bold text-violet-600">${item.price}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                            className="w-16 text-center h-8"
                            min="1"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex gap-1">
                          <Link to="/wishlist">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Gift className="w-4 h-4 mr-1" />
                              Save for Later
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="text-lg font-semibold">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1 space-y-6">
              {/* Delivery Info */}
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Truck className="w-5 h-5 text-green-600" />
                    <div>
                      <h4 className="font-semibold">Estimated Delivery</h4>
                      <p className="text-sm text-gray-600">2-3 business days</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-blue-600" />
                    <div>
                      <h4 className="font-semibold">Secure Checkout</h4>
                      <p className="text-sm text-gray-600">SSL encrypted</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Order Summary */}
              <Card className="border-0 shadow-sm sticky top-4">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Subtotal ({cartItems.length} items)</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span className={shipping === 0 ? 'text-green-600' : ''}>
                        {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                    {appliedCoupon && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount ({appliedCoupon.code})</span>
                        <span>-${discount.toFixed(2)}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Coupon Code */}
                  <div className="space-y-2">
                    <Label htmlFor="coupon">Coupon Code</Label>
                    <div className="flex gap-2">
                      <Input
                        id="coupon"
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                      />
                      <Button onClick={applyCoupon} variant="outline">
                        Apply
                      </Button>
                    </div>
                    {appliedCoupon && (
                      <p className="text-sm text-green-600">Coupon applied successfully!</p>
                    )}
                  </div>

                  <Button className="w-full bg-violet-600 hover:bg-violet-700">
                    Proceed to Checkout
                  </Button>
                  <p className="text-xs text-gray-500 text-center">
                    Free shipping on orders over $50
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h3>
            <p className="text-gray-600 mb-6">Add some products to get started!</p>
            <Link to="/shop">
              <Button className="bg-violet-600 hover:bg-violet-700">
                Continue Shopping
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;