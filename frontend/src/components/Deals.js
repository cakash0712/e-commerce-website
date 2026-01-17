import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCart, useWishlist } from "../App";
import {
  ShoppingBag,
  Star,
  Heart,
  Clock,
  Zap,
  Percent,
  ArrowRight,
  Timer,
  TrendingDown
} from "lucide-react";

import Navigation from "./Navigation";
import Footer from "./Footer";

// Deals Page Component
const Deals = () => {
  const navigate = useNavigate();
  const [deals, setDeals] = useState([]);
  const [displayedDeals, setDisplayedDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        setLoading(true);
        const response = await axios.get("https://dummyjson.com/products?limit=100&skip=20");
        const mappedDeals = response.data.products
          .filter(p => p.discountPercentage > 5)
          .map(p => {
            const discount = Math.round(p.discountPercentage);
            const inrPrice = Math.round(p.price * 83);
            const originalPrice = Math.round(inrPrice * (1 + discount / 100));
            const timeLeftValue = Math.floor(Math.random() * 12) + 1;
            const timeLeftUnit = Math.random() > 0.5 ? "hours" : "days";

            return {
              id: p.id,
              name: p.title,
              price: inrPrice,
              originalPrice: originalPrice,
              image: p.thumbnail || p.images[0],
              rating: p.rating,
              reviews: p.reviews ? p.reviews.length : Math.floor(Math.random() * 200) + 50,
              discount: discount,
              timeLeft: `${timeLeftValue} ${timeLeftUnit}`,
              isFlashDeal: Math.random() > 0.6,
              category: p.category
            };
          });
        setDeals(mappedDeals);
        setDisplayedDeals(mappedDeals.slice(0, 48));
      } catch (err) {
        console.error("Error fetching deals:", err);
        setError("Failed to load deals. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, []);

  const loadMore = () => {
    setDisplayedDeals(deals.slice(0, displayedDeals.length + 48));
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />);
    }
    if (rating % 1 !== 0) {
      stars.push(<Star key="half" className="w-3.5 h-3.5 fill-amber-400/50 text-amber-400" />);
    }
    return stars;
  };

  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navigation />

      {/* Hero Header */}
      <div className="bg-gradient-to-b from-rose-50 to-white border-b border-rose-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-rose-100 text-rose-600 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Zap className="w-4 h-4" />
              Limited Time Offers
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
              Today's Best <span className="text-rose-600">Deals</span>
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
              Discover incredible savings on premium products. New deals added daily - don't miss out!
            </p>
          </div>

          {/* Deal Stats */}
          <div className="mt-12 flex flex-wrap justify-center gap-8">
            <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-xl shadow-sm border border-gray-100">
              <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center">
                <Percent className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">Up to 70%</p>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Discount</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-xl shadow-sm border border-gray-100">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <Timer className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{deals.length}+</p>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Active Deals</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-xl shadow-sm border border-gray-100">
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">Daily</p>
                <p className="text-xs text-gray-500 uppercase tracking-wider">New Offers</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Deals Grid */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mb-6"></div>
            <p className="text-gray-500 font-medium">Loading deals...</p>
          </div>
        ) : error ? (
          <div className="text-center py-24">
            <div className="bg-red-50 text-red-600 px-6 py-4 rounded-xl inline-block mb-6">
              {error}
            </div>
            <br />
            <Button onClick={() => window.location.reload()} className="bg-violet-600 hover:bg-violet-700 rounded-lg">
              Try Again
            </Button>
          </div>
        ) : deals.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-gray-500 text-xl">No deals available at the moment.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayedDeals.map((deal) => (
              <div
                key={deal.id}
                className="group bg-white rounded-xl border border-gray-100 hover:border-violet-200 hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                {/* Image Container */}
                <div className="relative aspect-square overflow-hidden bg-gray-50">
                  <img
                    src={deal.image}
                    alt={deal.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />

                  {/* Discount Badge */}
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    <span className="bg-rose-500 text-white px-3 py-1.5 text-sm font-bold rounded-lg shadow-lg flex items-center gap-1">
                      <TrendingDown className="w-4 h-4" />
                      {deal.discount}% OFF
                    </span>
                    {deal.isFlashDeal && (
                      <span className="bg-amber-500 text-white px-2.5 py-1 text-xs font-bold rounded-lg flex items-center gap-1">
                        <Zap className="w-3 h-3" /> Flash
                      </span>
                    )}
                  </div>

                  {/* Timer */}
                  <div className="absolute top-3 right-3 bg-gray-900/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    {deal.timeLeft}
                  </div>

                  {/* Wishlist Button */}
                  <button
                    onClick={() => isInWishlist(deal.id) ? removeFromWishlist(deal.id) : addToWishlist(deal)}
                    className="absolute bottom-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                  >
                    <Heart className={`w-5 h-5 transition-colors ${isInWishlist(deal.id) ? 'fill-rose-500 text-rose-500' : 'text-gray-600'}`} />
                  </button>
                </div>

                {/* Content */}
                <div className="p-4">
                  <p className="text-[10px] uppercase tracking-widest text-violet-600 font-semibold mb-1">
                    {deal.category}
                  </p>

                  <Link to={`/product/${deal.id}`}>
                    <h3 className="font-semibold text-gray-900 leading-snug line-clamp-2 mb-2 hover:text-violet-600 transition-colors">
                      {deal.name}
                    </h3>
                  </Link>

                  {/* Rating */}
                  <div className="flex items-center gap-1.5 mb-3">
                    <div className="flex items-center gap-0.5">
                      {renderStars(deal.rating)}
                    </div>
                    <span className="text-xs text-gray-500">({deal.reviews})</span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-xl font-bold text-gray-900">
                      ₹{deal.price.toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-400 line-through">
                      ₹{deal.originalPrice.toLocaleString()}
                    </span>
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                      Save ₹{(deal.originalPrice - deal.price).toLocaleString()}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      className="flex-1 bg-violet-600 hover:bg-violet-700 text-white rounded-lg h-11 font-semibold transition-all"
                      onClick={() => addToCart(deal)}
                    >
                      <ShoppingBag className="w-4 h-4 mr-2" /> Add to Cart
                    </Button>
                    <Button
                      variant="outline"
                      className="rounded-lg h-11 px-4 border-2 border-violet-200 text-violet-700 font-semibold hover:bg-violet-50 transition-all"
                      onClick={() => { addToCart(deal); navigate('/payment'); }}
                    >
                      Buy
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More */}
        {displayedDeals.length > 0 && displayedDeals.length < deals.length && (
          <div className="mt-16 text-center">
            <Button onClick={loadMore} variant="outline" className="rounded-lg h-12 px-8 border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50">
              Load More Deals <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Deals;