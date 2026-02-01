import { useEffect, useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useAuth, useCart, useWishlist, useRecentlyViewed } from "../App";
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
  Timer,
  ShoppingCart,
  ArrowLeft
} from "lucide-react";

import Navigation from "./Navigation";
import Footer from "./Footer";

// Deals page configuration
const DEALS_PAGE_TITLE = "Special Offers";

// Bottom Section for recently viewed items
const RecentlyViewedSection = () => {
  const { pickupProducts } = useRecentlyViewed();

  if (!pickupProducts || pickupProducts.length === 0) return null;

  return (
    <div className="mt-12 lg:mt-20">
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-1">
          <Badge className="bg-violet-100 text-violet-600 border-none px-3 py-1 text-[10px] font-black uppercase tracking-widest">Your History</Badge>
          <h2 className="text-2xl lg:text-3xl font-black text-gray-900 tracking-tighter uppercase">Pick up where you left off</h2>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {pickupProducts.map((product) => (
          <Link
            key={product.id}
            to={`/product/${product.id}`}
            className="group bg-white rounded-xl border border-gray-100 p-3 hover:shadow-xl transition-all duration-300"
          >
            <div className="aspect-square rounded-lg overflow-hidden bg-gray-50 mb-3 flex items-center justify-center p-2">
              <img
                src={product.image}
                alt={product.name}
                className="max-w-full max-h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
              />
            </div>
            <h3 className="text-xs font-bold text-gray-900 line-clamp-1 group-hover:text-violet-600">
              {product.name}
            </h3>
            <p className="text-sm font-black text-violet-600 mt-1">
              ₹{product.price?.toLocaleString()}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
};

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
        const response = await axios.get(`${API_BASE}/api/products?only_deals=true&limit=1000`);

        // Filter products with active special offers (Trusting the backend's is_special_active)
        const mappedDeals = response.data
          .filter(p => p.is_special_active)
          .map(p => ({
            ...p,
            timeLeft: calculateTimeLeft(p.special_offer_end || p.offer_expires_at),
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

      {/* Hero Header - Premium Dark Aesthetic */}
      <div className="bg-slate-950 border-b border-white/5 pt-24 sm:pt-32 pb-8 sm:pb-12 relative">
        {/* Subtle Background Glow */}
        <div className="absolute top-0 right-0 w-[500px] h-full bg-violet-600/10 blur-[120px] -z-0"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-full bg-blue-600/5 blur-[100px] -z-0"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="flex-1">
              <nav className="flex items-center gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-cyan-400 mb-4 sm:mb-6">
                <button
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-1.5 hover:text-white transition-colors mr-2 group"
                >
                  <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                  <span>Back</span>
                </button>
                <div className="w-px h-3 bg-white/20 mx-2" />
                <Link to="/" className="hover:text-white transition-colors text-slate-500">Home</Link>
                <ChevronRight className="w-3 h-3 opacity-30" />
                <span className="text-slate-300">Today's Deals</span>
              </nav>

              <div className="space-y-1 sm:space-y-2 text-left">
                <div className="flex items-center gap-3">
                  <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tighter uppercase leading-none">
                    {DEALS_PAGE_TITLE}
                  </h1>
                  <Badge className="bg-amber-400 text-black border-none px-3 py-0.5 text-[10px] font-black uppercase tracking-tighter rounded-sm hidden sm:block h-6 self-end mb-1">
                    Verified
                  </Badge>
                </div>
                <p className="text-slate-400 text-xs sm:text-sm font-medium max-w-xl">
                  Explore our best limited-time savings on top-rated products. Inventory synchronized in real-time.
                </p>
              </div>
            </div>

            {/* Top Filter Selection - Glassmorphism style */}
            <div className="relative">
              <button
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="flex items-center gap-3 px-6 h-12 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white shadow-2xl hover:bg-white/10 transition-all active:scale-95"
              >
                <TrendingDown className="w-4 h-4 text-amber-400" />
                <span>Filter By:</span>
                <span className="text-amber-400">
                  {sortBy.replace('-', ' ')}
                </span>
                <ChevronDown className={`w-3 h-3 transition-transform ${showSortMenu ? 'rotate-180' : ''}`} />
              </button>

              {showSortMenu && (
                <>
                  <div className="fixed inset-0 z-50" onClick={() => setShowSortMenu(false)} />
                  <div className="absolute right-0 mt-3 w-56 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl z-[60] overflow-hidden p-2 animate-in fade-in zoom-in-95 duration-200">
                    {[
                      { key: 'highest-discount', label: 'Highest Discount', icon: Percent },
                      { key: 'price-low', label: 'Price: Low to High', icon: TrendingDown },
                      { key: 'price-high', label: 'Price: High to Low', icon: TrendingDown },
                      { key: 'rating', label: 'Top Rated', icon: Star }
                    ].map(({ key, label, icon: Icon }) => (
                      <button
                        key={key}
                        onClick={() => { setSortBy(key); setShowSortMenu(false); }}
                        className={`w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all rounded-xl ${sortBy === key
                          ? 'bg-amber-400 text-black'
                          : 'text-slate-400 hover:bg-white/5 hover:text-white'
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

      {/* Main Content - Using standard 7xl container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12">
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
                <p className="text-xs text-gray-400 mt-1">Exclusive limited-time deals</p>
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
                  No products on special offer right now
                </p>
                <Link to="/shop">
                  <Button className="bg-violet-600 hover:bg-violet-700">
                    Browse All Products
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                {/* Product Grid - Proper Square Shape & Containerized */}
                <div className="flex flex-col gap-3 sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-6 sm:mt-0">
                  {sortedDeals.map((deal) => (
                    <Link
                      key={deal.id}
                      to={`/product/${deal.id}`}
                      className="group bg-white rounded-2xl sm:rounded-[1.5rem] border border-gray-100 overflow-hidden transition-all hover:shadow-[0_15px_40px_rgba(0,0,0,0.08)] hover:border-violet-200 flex flex-row sm:flex-col h-full"
                    >
                      {/* Product Image Section - Compact Size for Desktop */}
                      <div className="relative w-28 h-28 sm:w-full sm:h-[220px] bg-gray-50/30 flex items-center justify-center p-2 sm:p-6 overflow-hidden shrink-0 border-r sm:border-r-0 sm:border-b border-gray-100/50">
                        <img
                          src={deal.image}
                          alt={deal.name}
                          className="max-w-full max-h-full object-contain transition-all duration-700 group-hover:scale-105"
                          loading="lazy"
                        />

                        {/* Status Badges */}
                        <div className="absolute top-1.5 left-1.5 sm:top-4 sm:left-4 flex flex-wrap gap-1 sm:gap-1.5 max-w-[85%]">
                          <div className={`px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-full ${getDiscountBadgeStyle(deal.discount)} text-white text-[7px] sm:text-[9px] font-black uppercase tracking-widest shadow-lg`}>
                            {deal.discount}%
                          </div>
                          {deal.isFlashDeal && (
                            <div className="px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-slate-950 text-white text-[7px] sm:text-[9px] font-black uppercase tracking-widest flex items-center gap-1 shadow-lg">
                              <Zap className="w-2 h-2 sm:w-2.5 sm:h-2.5 fill-amber-400 text-amber-400" />
                            </div>
                          )}
                        </div>

                        {/* Wishlist Button */}
                        <button
                          onClick={(e) => handleWishlistAction(e, deal)}
                          className={`absolute top-1.5 right-1.5 sm:top-4 sm:right-4 w-6 h-6 sm:w-9 sm:h-9 rounded-full border border-white/20 flex items-center justify-center transition-all bg-white/40 backdrop-blur-xl shadow-lg hover:bg-white z-10 ${isInWishlist(deal.id) ? 'text-rose-500' : 'text-slate-400 hover:text-rose-500'}`}
                        >
                          <Heart className={`w-3 h-3 sm:w-4 sm:h-4 ${isInWishlist(deal.id) ? 'fill-current' : ''}`} />
                        </button>
                      </div>

                      {/* Content Area - Compact Desktop Layout */}
                      <div className="p-3 sm:p-5 flex flex-col flex-1 bg-white relative justify-between">
                        <div className="space-y-1 sm:space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[7px] sm:text-[9px] font-black text-violet-600 uppercase tracking-[0.15em] line-clamp-1">{deal.category}</span>
                            <div className="flex items-center gap-1">
                              <Star className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-orange-400 fill-current" />
                              <span className="text-[7px] sm:text-[8px] font-black text-gray-900">{deal.rating || '4.5'}</span>
                            </div>
                          </div>

                          <h3 className="text-xs sm:text-[15px] font-bold text-gray-900 line-clamp-2 leading-snug group-hover:text-violet-600 transition-colors h-8 sm:h-10">
                            {deal.name}
                          </h3>

                          <div className="pt-1">
                            <div className="flex items-baseline gap-1.5 sm:gap-2 mb-1">
                              <div className="text-base sm:text-2xl font-black text-gray-900 tracking-tighter">
                                ₹{deal.price?.toLocaleString()}
                              </div>
                              <div className="text-[9px] sm:text-xs text-gray-300 line-through font-bold">
                                ₹{deal.originalPrice?.toLocaleString()}
                              </div>
                              <div className={`text-[9px] font-black uppercase tracking-tighter self-end mb-1 ${deal.delivery_type === 'free' ? 'text-emerald-500' : 'text-slate-400'}`}>
                                {deal.delivery_type === 'free' ? 'FREE' : `+ ₹${deal.delivery_charge}`}
                              </div>
                            </div>

                            <div className="flex items-center gap-1 px-1.5 py-0.5 sm:px-2.5 sm:py-1.5 bg-rose-50 rounded-md sm:rounded-lg self-start border border-rose-100/30">
                              <Clock className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-rose-500" />
                              <div className="text-[7px] sm:text-[9px] font-black text-rose-600 uppercase tracking-widest">
                                {deal.timeLeft.hours}h {deal.timeLeft.minutes}m Left
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* CTA */}
                        <div className="mt-2.5 sm:mt-4">
                          <Button
                            onClick={(e) => handleAddToCart(e, deal)}
                            className="w-full h-8 sm:h-10 bg-slate-950 hover:bg-violet-600 text-white text-[8px] sm:text-[9px] font-black uppercase tracking-widest rounded-lg sm:rounded-xl transition-all active:scale-95 shadow-lg group/btn relative overflow-hidden"
                          >
                            <ShoppingCart className="w-3.5 h-3.5 mr-2 hidden sm:block" />
                            <span className="sm:hidden text-[7px]">Add</span>
                            <span className="hidden sm:block">Claim Deal</span>
                          </Button>
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
                      <h4 className="font-bold text-sm sm:text-base">Exclusive Special Offer Zone</h4>
                      <p className="text-violet-200 text-xs sm:text-sm mt-1">All products in this section are currently on limited-time special offer!</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recently Viewed Section - Pick up where you left off */}
        <RecentlyViewedSection />
      </main>

      <Footer />
    </div>
  );
};

export default Deals;