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
  Plus,
  Eye
} from "lucide-react";

import Navigation from "./Navigation";
import Footer from "./Footer";

// Wishlist Page - Professional Formal Violet Style
const Wishlist = () => {
  const { addToCart } = useCart();
  const { wishlistItems, removeFromWishlist } = useWishlist();

  // Helper function to get proxied image URL (same as Shop.js)
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return '/assets/zlogo.png';
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
      return `${API_BASE}/api/proxy-image?url=${encodeURIComponent(imageUrl)}`;
    }
    return imageUrl;
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />);
    }
    if ((rating || 0) % 1 !== 0) {
      stars.push(<Star key="half" className="w-3.5 h-3.5 fill-amber-400/50 text-amber-400" />);
    }
    return stars;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navigation />

      <main className="flex-1 pt-20">
        {/* Hero Header */}
        <section className="bg-white border-b border-gray-100 mb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 text-left">
              <div>
                <nav className="text-sm text-gray-400 mb-6 flex items-center gap-2">
                  <Link to="/" className="hover:text-violet-600 transition-colors">Home</Link>
                  <span className="text-gray-300">›</span>
                  <span className="text-gray-900 font-medium">My Wishlist</span>
                </nav>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-violet-100 rounded-[2rem] flex items-center justify-center text-violet-600 shadow-lg shadow-violet-50">
                    <Heart className="w-7 h-7 fill-current" />
                  </div>
                  <div>
                    <h1 className="text-3xl md:text-5xl font-bold text-gray-900 tracking-tight leading-tight">My <span className="text-violet-600">Wishlist</span></h1>
                    <p className="text-gray-500 font-medium mt-1">Items you've saved for later</p>
                  </div>
                </div>
              </div>
              <div className="bg-violet-600 px-6 py-3 rounded-2xl shadow-xl shadow-violet-100 text-center">
                <p className="text-[10px] uppercase font-bold text-violet-200 tracking-[0.2em] mb-1 leading-none">Total Items Saved</p>
                <p className="text-2xl font-black text-white">{wishlistItems.length}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-24">
          {wishlistItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {wishlistItems.map((item) => (
                <div
                  key={item.id}
                  className="group bg-white rounded-[2.5rem] border border-gray-100 hover:border-violet-200 hover:shadow-2xl transition-all duration-500 overflow-hidden text-left"
                >
                  {/* Product Image */}
                  <div className="relative aspect-square overflow-hidden bg-gray-50/50 p-4">
                    <Link to={`/product/${item.id}`}>
                      <img
                        src={getImageUrl(item.image || item.images?.[0])}
                        alt={item.name}
                        className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-700"
                        onError={(e) => { e.target.src = '/assets/zlogo.png'; }}
                      />
                    </Link>

                    {/* Badges */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      {item.discount && (
                        <span className="bg-rose-500 text-white px-3 py-1 text-[9px] uppercase tracking-widest font-black rounded-lg shadow-lg shadow-rose-100">
                          {item.discount}% Off
                        </span>
                      )}
                      {item.isNew && (
                        <span className="bg-violet-600 text-white px-3 py-1 text-[9px] uppercase tracking-widest font-black rounded-lg shadow-lg shadow-violet-100">
                          New
                        </span>
                      )}
                    </div>

                    {/* Quick Access Overlay */}
                    <div className="absolute inset-0 bg-violet-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                    {/* Action Buttons */}
                    <div className="absolute bottom-4 right-4 flex flex-col gap-2 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <button
                        onClick={() => removeFromWishlist(item.id)}
                        className="w-11 h-11 bg-white hover:bg-rose-50 text-gray-400 hover:text-rose-500 rounded-2xl flex items-center justify-center shadow-xl transition-all active:scale-90"
                        title="Remove from Wishlist"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                      <Link
                        to={`/product/${item.id}`}
                        className="w-11 h-11 bg-white hover:bg-violet-50 text-gray-400 hover:text-violet-600 rounded-2xl flex items-center justify-center shadow-xl transition-all active:scale-90"
                        title="View Details"
                      >
                        <Eye className="w-5 h-5" />
                      </Link>
                    </div>
                  </div>

                  {/* Metadata Content */}
                  <div className="p-6 pt-2">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-[10px] uppercase font-bold text-violet-600 tracking-[0.2em]">
                        {item.category}
                      </p>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.rating?.toFixed(1)}</span>
                      </div>
                    </div>

                    <Link to={`/product/${item.id}`}>
                      <h3 className="font-bold text-gray-900 leading-snug line-clamp-2 mb-4 text-sm group-hover:text-violet-600 transition-colors uppercaseTracking leading-tight h-10">
                        {item.name}
                      </h3>
                    </Link>

                    {/* Financial Information & Main Call to Action */}
                    <div className="flex items-center justify-between mt-auto">
                      <div>
                        <p className="text-xl font-black text-gray-900 tracking-tighter">
                          ₹{item.price?.toLocaleString()}
                        </p>
                        {item.originalPrice && item.originalPrice > item.price && (
                          <p className="text-[10px] text-gray-400 line-through font-bold uppercase tracking-widest decoration-rose-400/50">
                            MSRP: ₹{item.originalPrice?.toLocaleString()}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => addToCart(item)}
                        className="w-14 h-14 bg-gray-900 hover:bg-violet-600 text-white rounded-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-xl shadow-gray-200"
                        title="Add to Cart"
                      >
                        <ShoppingBag className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-24 max-w-lg mx-auto text-center animate-in zoom-in duration-700">
              <div className="w-24 h-24 bg-violet-100 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 text-violet-600 shadow-lg shadow-violet-50">
                <Heart className="w-10 h-10" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight leading-tight text-center">Your wishlist is <span className="text-violet-600">empty</span></h2>
              <p className="text-gray-500 font-medium mb-12 leading-relaxed text-center">
                Save items to your wishlist by clicking the heart icon on any product. You can access your saved items here anytime.
              </p>
              <Link to="/shop">
                <Button className="h-16 px-12 bg-gray-900 hover:bg-violet-600 text-white rounded-2xl font-bold uppercase tracking-widest transition-all shadow-xl active:scale-95 flex items-center gap-3 mx-auto">
                  Browse Products <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div >
  );
};

export default Wishlist;