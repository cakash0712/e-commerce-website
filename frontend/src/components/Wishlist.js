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
  Plus
} from "lucide-react";

import Navigation from "./Navigation";
import Footer from "./Footer";

const Wishlist = () => {
  const { addToCart } = useCart();
  const { wishlistItems, removeFromWishlist } = useWishlist();

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
    <div className="min-h-screen bg-white flex flex-col">
      <Navigation />

      {/* Header */}
      <div className="bg-gradient-to-b from-rose-50 to-white border-b border-rose-100 pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-rose-100 text-rose-500 rounded-xl flex items-center justify-center">
                <Heart className="w-7 h-7 fill-current" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">My Wishlist</h1>
                <p className="text-gray-500 mt-1">Your saved favorites</p>
              </div>
            </div>
            <div className="bg-rose-100 text-rose-600 px-4 py-2 rounded-full text-sm font-semibold">
              {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {wishlistItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map((item) => (
              <div
                key={item.id}
                className="group bg-white rounded-xl border border-gray-100 hover:border-violet-200 hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                {/* Image */}
                <div className="relative aspect-square overflow-hidden bg-gray-50">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {item.discount && (
                      <span className="bg-rose-500 text-white px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold rounded-full">
                        {item.discount}% OFF
                      </span>
                    )}
                    {item.isNew && (
                      <span className="bg-violet-600 text-white px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold rounded-full">
                        New
                      </span>
                    )}
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromWishlist(item.id)}
                    className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-red-50 hover:text-red-500 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  {/* Quick Actions */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                    <Link
                      to={`/product/${item.id}`}
                      className="w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-violet-600 hover:text-white transition-all"
                    >
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                    <button
                      onClick={() => addToCart(item)}
                      className="w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-violet-600 hover:text-white transition-all"
                    >
                      <ShoppingBag className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <p className="text-[10px] uppercase tracking-widest text-violet-600 font-semibold mb-1">
                    {item.category}
                  </p>

                  <Link to={`/product/${item.id}`}>
                    <h3 className="font-medium text-gray-900 leading-snug line-clamp-2 mb-2 text-sm hover:text-violet-600 transition-colors">
                      {item.name}
                    </h3>
                  </Link>

                  {/* Rating */}
                  {item.rating && (
                    <div className="flex items-center gap-1.5 mb-3">
                      <div className="flex items-center gap-0.5">
                        {renderStars(item.rating)}
                      </div>
                      <span className="text-xs text-gray-500">({item.reviews || 0})</span>
                    </div>
                  )}

                  {/* Price & Add to Cart */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-gray-900">
                        ₹{item.price?.toLocaleString()}
                      </span>
                      {item.originalPrice && item.originalPrice > item.price && (
                        <span className="text-sm text-gray-400 line-through">
                          ₹{item.originalPrice?.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => addToCart(item)}
                      className="w-10 h-10 bg-violet-600 hover:bg-violet-700 text-white rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-md"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty Wishlist */
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-12 h-12" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Your wishlist is empty</h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Save items you love by clicking the heart icon on any product. They'll appear here for easy access.
            </p>
            <Link to="/shop">
              <Button className="bg-violet-600 hover:bg-violet-700 text-white h-12 px-8 rounded-xl font-semibold">
                Explore Products <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Wishlist;