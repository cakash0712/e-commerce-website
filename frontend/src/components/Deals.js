import { useEffect, useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useAuth, useCart, useWishlist } from "../App";
import {
  ShoppingBag,
  Star,
  Heart,
  Clock,
  Zap,
  ChevronDown,
  ChevronRight,
  Flame,
  Sparkles,
  TrendingDown,
  Percent,
  Tag,
  ArrowRight,
  BadgePercent,
  Timer
} from "lucide-react";

import Navigation from "./Navigation";
import Footer from "./Footer";

// Minimum discount threshold for deals
const MIN_DISCOUNT_THRESHOLD = 35;

// Deals Page Component - Premium Mobile-First Design
const Deals = () => {
  const navigate = useNavigate();
  const [deals, setDeals] = useState([]);
  const [displayedDeals, setDisplayedDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("highest-discount");
  const [showSortMenu, setShowSortMenu] = useState(false);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        setLoading(true);
        const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
        const response = await axios.get(`${API_BASE}/api/products`);

        // Filter products with minimum 35% discount
        const mappedDeals = response.data
          .filter(p => p.discount >= MIN_DISCOUNT_THRESHOLD)
          .map(p => ({
            ...p,
            timeLeft: calculateTimeLeft(p.offer_expires_at),
            isFlashDeal: p.discount >= 50,
            isSuperDeal: p.discount >= 60
          }));
        setDeals(mappedDeals);
        setDisplayedDeals(mappedDeals.slice(0, 20));
      } catch (err) {
        console.error("Error fetching deals:", err);
        setError("Failed to load deals. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, []);

  // Calculate real time left from MongoDB offer_expires_at
  const calculateTimeLeft = (expiresAt) => {
    if (!expiresAt) {
      // Default fallback if no expiry is set in DB (e.g., 24h from now)
      return { hours: 23, minutes: 59 };
    }

    const expiry = new Date(expiresAt);
    const now = new Date();
    const diff = expiry - now;

    if (diff <= 0) return { hours: 0, minutes: 0 };

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return { hours, minutes };
  };

  // Sort deals based on selection
  const sortedDeals = useMemo(() => {
    const sorted = [...displayedDeals];
    switch (sortBy) {
      case 'highest-discount':
        return sorted.sort((a, b) => b.discount - a.discount);
      case 'price-low':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-high':
        return sorted.sort((a, b) => b.price - a.price);
      case 'rating':
        return sorted.sort((a, b) => b.rating - a.rating);
      default:
        return sorted;
    }
  }, [displayedDeals, sortBy]);

  const loadMore = () => {
    setDisplayedDeals(deals.slice(0, displayedDeals.length + 20));
  };

  const { user } = useAuth();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const handleWishlistAction = (e, deal) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    isInWishlist(deal.id) ? removeFromWishlist(deal.id) : addToWishlist(deal);
  };

  const handleAddToCart = (e, deal) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({ ...deal, quantity: 1 });
  };

  // Get discount badge style based on discount percentage
  const getDiscountBadgeStyle = (discount) => {
    if (discount >= 60) return 'bg-gradient-to-r from-rose-600 to-pink-600';
    if (discount >= 50) return 'bg-gradient-to-r from-orange-500 to-amber-500';
    return 'bg-gradient-to-r from-violet-600 to-indigo-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-gray-100 flex flex-col">
      <Navigation />

      {/* Simplified Marketplace Header - Slimmer Height */}
      <div className="bg-white border-b border-gray-200 pt-24 pb-6 lg:pt-28 lg:pb-6">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
          {/* Breadcrumb */}
          <nav className="text-[10px] text-gray-400 mb-3 flex items-center gap-1 uppercase tracking-widest font-bold">
            <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <ChevronRight className="w-2.5 h-2.5" />
            <span className="text-gray-900">Today's Deals</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-0.5">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl lg:text-3xl font-black text-gray-900 tracking-tight">Today's Deals</h1>
                <Badge className="bg-blue-600 text-white hover:bg-blue-700 border-none px-3 py-0.5 text-[10px] font-black uppercase tracking-tighter rounded-sm">
                  Verified Offers
                </Badge>
              </div>
              <p className="text-gray-500 text-xs lg:text-sm font-medium">
                Explore our best limited-time savings on top-rated products.
              </p>
            </div>

            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-rose-50 border border-rose-100 rounded-lg">
              <Percent className="w-4 h-4 text-rose-600" />
              <span className="text-xs font-bold text-rose-700 uppercase tracking-tight">Save up to 80% today</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Sort Bar - Mobile Optimized */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-16 z-10 shadow-lg">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Deal Stats */}
            <div className="flex items-center gap-2">
              <BadgePercent className="w-5 h-5 text-violet-600" />
              <span className="text-sm font-semibold text-gray-700">
                {sortedDeals.length} <span className="text-gray-400 font-normal">offers</span>
              </span>
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 active:scale-95 transition-all"
              >
                <TrendingDown className="w-4 h-4 text-violet-600" />
                <span className="hidden sm:inline">Sort:</span>
                <span className="text-violet-600 capitalize text-xs sm:text-sm">
                  {sortBy.replace('-', ' ')}
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showSortMenu ? 'rotate-180' : ''}`} />
              </button>

              {showSortMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowSortMenu(false)} />
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-2xl z-20 overflow-hidden">
                    {[
                      { key: 'highest-discount', label: 'Highest Discount', icon: Percent },
                      { key: 'price-low', label: 'Price: Low to High', icon: TrendingDown },
                      { key: 'price-high', label: 'Price: High to Low', icon: TrendingDown },
                      { key: 'rating', label: 'Top Rated', icon: Star }
                    ].map(({ key, label, icon: Icon }) => (
                      <button
                        key={key}
                        onClick={() => { setSortBy(key); setShowSortMenu(false); }}
                        className={`w-full text-left px-4 py-3 text-sm flex items-center gap-3 transition-colors ${sortBy === key
                          ? 'bg-violet-50 text-violet-600 font-semibold'
                          : 'text-gray-700 hover:bg-gray-50'
                          }`}
                      >
                        <Icon className="w-4 h-4" />
                        {label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-[1600px] mx-auto w-full px-4 sm:px-6 py-8">
        <div className="flex flex-col gap-6">
          {/* Deals Grid Area */}
          <div className="flex-1">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-violet-200 rounded-full" />
                  <div className="absolute inset-0 w-16 h-16 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
                </div>
                <p className="mt-4 text-gray-500 font-medium">Finding best deals for you...</p>
                <p className="text-xs text-gray-400 mt-1">Minimum {MIN_DISCOUNT_THRESHOLD}% off guaranteed</p>
              </div>
            ) : error ? (
              <div className="text-center py-20">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-10 h-10 text-red-500" />
                </div>
                <p className="text-red-500 font-semibold mb-2">{error}</p>
                <Button
                  onClick={() => window.location.reload()}
                  className="bg-violet-600 hover:bg-violet-700 mt-4"
                >
                  Try Again
                </Button>
              </div>
            ) : sortedDeals.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-24 h-24 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Tag className="w-12 h-12 text-violet-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Deals Available</h3>
                <p className="text-gray-500 mb-4">
                  No products with {MIN_DISCOUNT_THRESHOLD}%+ discount right now
                </p>
                <Link to="/shop">
                  <Button className="bg-violet-600 hover:bg-violet-700">
                    Browse All Products
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-6 max-w-[1600px] mx-auto">
                {/* Product Grid - Amazon/Flipkart Density */}
                <div className="flex flex-col gap-3 sm:grid sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 sm:gap-4">
                  {sortedDeals.map((deal, index) => (
                    <Link
                      key={deal.id}
                      to={`/product/${deal.id}`}
                      className="group bg-white rounded-lg lg:rounded-md border border-gray-200 overflow-hidden transition-all hover:shadow-[0_2px_12px_0_rgba(0,0,0,0.12)] flex sm:flex-col lg:relative"
                    >
                      {/* Product Image */}
                      <div className="relative w-32 h-32 sm:w-full sm:aspect-square bg-white flex items-center justify-center p-2 lg:p-4 overflow-hidden shrink-0 border-b border-gray-50 lg:h-48">
                        <img
                          src={deal.image}
                          alt={deal.name}
                          className="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />

                        {/* Wishlist Button (Marketplace style) */}
                        <button
                          onClick={(e) => handleWishlistAction(e, deal)}
                          className={`absolute top-2 right-2 w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center transition-all bg-white shadow-sm hover:border-rose-200 ${isInWishlist(deal.id) ? 'text-rose-500' : 'text-gray-300 hover:text-rose-400'}`}
                        >
                          <Heart className={`w-4 h-4 ${isInWishlist(deal.id) ? 'fill-current' : ''}`} />
                        </button>
                      </div>

                      <div className="flex-1 p-3 lg:p-4 flex flex-col justify-between">
                        <div className="space-y-1.5 flex-1">
                          {/* Top Badge (Amazon Style) */}
                          <div className="hidden lg:flex items-center gap-1.5 mb-1">
                            {deal.discount >= 60 ? (
                              <span className="bg-rose-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm">Deal of the Day</span>
                            ) : (
                              <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm">Limited time deal</span>
                            )}
                          </div>

                          <h3 className="text-xs sm:text-sm text-gray-900 line-clamp-2 leading-snug group-hover:text-blue-700 lg:h-10">
                            {deal.name}
                          </h3>

                          {/* Ratings (Marketplace Style) */}
                          <div className="flex items-center gap-1 lg:mt-1">
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map(star => (
                                <Star key={star} className={`w-3 h-3 ${star <= Math.floor(deal.rating || 4) ? 'text-orange-400 fill-current' : 'text-gray-200'}`} />
                              ))}
                            </div>
                            <span className="text-[10px] text-blue-600 font-medium">{deal.reviews || 428}</span>
                          </div>
                        </div>

                        <div className="mt-2 lg:mt-3">
                          <div className="flex items-baseline gap-2">
                            <span className="text-lg lg:text-xl font-bold text-gray-900 tracking-tight">
                              ₹{deal.price?.toLocaleString()}
                            </span>
                            <span className="text-[10px] text-gray-500 line-through">
                              M.R.P: ₹{deal.originalPrice?.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs font-bold text-rose-600">({deal.discount}% off)</span>
                            <span className="hidden lg:inline text-[10px] text-gray-500 truncate">Inclusive of all taxes</span>
                          </div>

                          {/* Mobile-only CTA (Maintained) */}
                          <Button
                            onClick={(e) => handleAddToCart(e, deal)}
                            className="w-full mt-3 h-9 bg-amber-400 hover:bg-amber-500 text-black text-xs font-bold rounded-full lg:hidden"
                          >
                            Add to Cart
                          </Button>

                          {/* Desktop Minimalist Hover Action */}
                          <div className="hidden lg:block mt-3 pt-3 border-t border-gray-50 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              onClick={(e) => handleAddToCart(e, deal)}
                              className="w-full h-8 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-md"
                            >
                              Get this Deal
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Load More Button */}
                {displayedDeals.length < deals.length && (
                  <div className="flex justify-center py-6">
                    <Button
                      variant="outline"
                      onClick={loadMore}
                      className="px-8 h-12 border-2 border-violet-200 text-violet-600 hover:bg-violet-50 font-bold rounded-xl flex items-center gap-2 active:scale-95 transition-all"
                    >
                      Load More Deals
                      <span className="bg-violet-100 text-violet-700 text-xs font-bold px-2 py-0.5 rounded-full">
                        +{deals.length - displayedDeals.length}
                      </span>
                    </Button>
                  </div>
                )}

                {/* Bottom Info Banner */}
                <div className="mt-4 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-4 sm:p-6 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

                  <div className="relative flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                      <Percent className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm sm:text-base">Exclusive {MIN_DISCOUNT_THRESHOLD}%+ Discount Zone</h4>
                      <p className="text-violet-200 text-xs sm:text-sm mt-1">All deals on this page offer minimum {MIN_DISCOUNT_THRESHOLD}% off!</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Deals;