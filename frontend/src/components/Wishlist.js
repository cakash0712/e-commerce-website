import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useCart, useWishlist } from "../App";
import {
  Heart,
  ShoppingBag,
  Star,
  Trash2,
  ArrowRight,
  ChevronRight,
  ShoppingCart,
  MoreVertical
} from "lucide-react";

import Navigation from "./Navigation";
import Footer from "./Footer";

const Wishlist = () => {
  const { addToCart } = useCart();
  const { wishlistItems, removeFromWishlist } = useWishlist();

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return '/assets/zlogo.png';
    if (imageUrl.startsWith('http')) {
      const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
      return `${API_BASE}/api/proxy-image?url=${encodeURIComponent(imageUrl)}`;
    }
    return imageUrl;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navigation />

      <main className="flex-1 pt-32 sm:pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-0 sm:px-6 lg:px-8">

          {/* Mobile-Friendly Header */}
          <div className="px-4 sm:px-0 mb-6 sm:mb-12 text-left">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
              <Link to="/" className="hover:text-violet-600">Home</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-gray-900">Wishlist</span>
            </div>
            <h1 className="text-2xl sm:text-5xl font-black text-gray-900 tracking-tighter uppercase leading-none">
              Your <span className="text-violet-600">Wishlist</span>
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm font-medium mt-1">{wishlistItems.length} items saved for later</p>
          </div>

          {wishlistItems.length > 0 ? (
            <div className="bg-white sm:bg-transparent sm:border-0 border-y border-gray-100 divide-y divide-gray-100 sm:divide-y-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-6">
              {wishlistItems.map((item) => (
                <div
                  key={item.id}
                  className="group relative flex sm:flex-col bg-white sm:rounded-[2rem] sm:border sm:border-gray-100 sm:hover:border-violet-200 transition-all duration-500 overflow-hidden"
                >
                  {/* Image Container - Left on Mobile, Top on Desktop */}
                  <div className="w-[120px] sm:w-full aspect-square sm:aspect-square shrink-0 bg-gray-50/50 p-4 flex items-center justify-center">
                    <Link to={`/product/${item.id}`} className="w-full h-full">
                      <img
                        src={getImageUrl(item.image || item.images?.[0])}
                        alt={item.name}
                        className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-700"
                        onError={(e) => { e.target.src = '/assets/zlogo.png'; }}
                      />
                    </Link>
                  </div>

                  {/* Info Container - Right on Mobile, Bottom on Desktop */}
                  <div className="flex-1 p-4 sm:p-6 flex flex-col justify-between text-left">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[9px] font-bold text-violet-600 uppercase tracking-widest">{item.category}</span>
                        <div className="hidden sm:flex items-center gap-1">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span className="text-[10px] font-bold text-gray-400">{item.rating?.toFixed(1) || "5.0"}</span>
                        </div>
                      </div>

                      <Link to={`/product/${item.id}`}>
                        <h2 className="font-bold text-gray-900 text-sm sm:text-base tracking-tight leading-snug line-clamp-2 mb-2 group-hover:text-violet-600 transition-colors uppercaseTracking">
                          {item.name}
                        </h2>
                      </Link>

                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex text-amber-400 sm:hidden">
                          <Star className="w-3 h-3 fill-current" />
                          <span className="text-[11px] text-gray-500 ml-1 font-bold">{item.rating || "5.0"}</span>
                        </div>
                        <p className="text-lg sm:text-xl font-black text-gray-900 tracking-tighter">
                          ₹{item.price?.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Actions - Amazon Style Mobile / Boutique Style Desktop */}
                    <div className="flex flex-col sm:flex-row gap-2 mt-auto">
                      <Button
                        onClick={() => addToCart(item)}
                        className="h-10 sm:h-12 flex-1 bg-violet-600 hover:bg-violet-700 text-white rounded-xl sm:rounded-2xl font-bold text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-violet-100"
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" /> Add to Cart
                      </Button>

                      <button
                        onClick={() => removeFromWishlist(item.id)}
                        className="absolute sm:static top-2 right-2 sm:h-12 sm:w-12 bg-gray-50 sm:bg-gray-100 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl flex items-center justify-center transition-all p-2 sm:p-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-24 max-w-lg mx-auto text-center px-4">
              <div className="w-20 h-20 bg-gray-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 text-violet-600 shadow-xl shadow-violet-50/50">
                <Heart className="w-10 h-10 fill-violet-100" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-tight">Your wishlist is empty</h2>
              <p className="text-gray-500 text-sm mb-10 font-medium">
                Save products to your wishlist to track prices and availability.
              </p>
              <Link to="/shop">
                <Button className="h-16 px-10 bg-gray-900 hover:bg-violet-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-2xl active:scale-95 transition-all">
                  Initialize Shopping <ArrowRight className="w-4 h-4 ml-2" />
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

export default Wishlist;