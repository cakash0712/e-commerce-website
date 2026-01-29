import { useEffect, useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { useAuth, useCart, useWishlist } from "../App";
import {
  ShoppingBag,
  Star,
  Heart,
  Clock,
  Zap,
  ChevronDown,
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

      {/* Premium Header Banner - Mobile Optimized with added Top Gap */}
      <div className="relative pt-24 sm:pt-20 lg:pt-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700" />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-72 h-72 bg-pink-500 rounded-full filter blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-400 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative px-4 py-6 sm:py-10 mt-2">
          {/* Breadcrumb */}
          <nav className="text-xs text-violet-200 mb-4 flex items-center gap-">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <span className="mx-1">›</span>
            <span className="text-white font-medium">Hot Deals</span>
          </nav>

          {/* Header Content */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="relative">
                  <Flame className="w-8 h-8 sm:w-10 sm:h-10 text-amber-400 animate-pulse" />
                  <Sparkles className="w-4 h-4 text-yellow-300 absolute -top-1 -right-1 animate-bounce" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Hot Deals
                </h1>
              </div>
              <p className="text-violet-200 text-sm sm:text-base font-medium">
                Save big with <span className="text-amber-300 font-bold">{MIN_DISCOUNT_THRESHOLD}%+</span> off exclusive offers
              </p>
            </div>

            {/* Deal Counter Badge */}
            <div className="flex flex-col items-center bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/20">
              <span className="text-2xl sm:text-3xl font-black text-white">{deals.length}</span>
              <span className="text-[10px] uppercase tracking-wider text-violet-200 font-bold">Deals</span>
            </div>
          </div>

          {/* Animated Offer Ticker */}
          <div className="mt-4 flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-2 border border-white/20 w-fit">
            <Timer className="w-4 h-4 text-amber-300 animate-pulse" />
            <span className="text-xs font-bold text-white">Limited Time • Hurry Up!</span>
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
      <main className="flex-1 px-3 sm:px-4 py-4 sm:py-6">
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
          <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto">
            {/* Mobile: Flex Layout (horizontal cards) | Desktop: Grid Layout (vertical cards) */}
            <div className="flex flex-col gap-3 sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-6">
              {sortedDeals.map((deal, index) => (
                <Link
                  key={deal.id}
                  to={`/product/${deal.id}`}
                  className="group bg-white rounded-2xl border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-violet-300 active:scale-[0.98] flex sm:flex-col"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Product Image - Mobile: Fixed left side | Desktop: Full width top */}
                  <div className="relative w-32 h-32 sm:w-full sm:aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden shrink-0">
                    <img
                      src={deal.image}
                      alt={deal.name}
                      className="w-full h-full object-contain p-2 sm:p-4 group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />

                    {/* Discount Badge - Responsive sizing */}
                    <div className="absolute top-1.5 left-1.5 sm:top-3 sm:left-3 flex flex-col gap-1">
                      <span className={`${getDiscountBadgeStyle(deal.discount)} text-white text-[10px] sm:text-xs font-black px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg shadow-lg flex items-center gap-0.5 sm:gap-1`}>
                        <Percent className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
                        <span className="hidden sm:inline">{deal.discount}% OFF</span>
                        <span className="sm:hidden">{deal.discount}%</span>
                      </span>

                      {deal.isSuperDeal && (
                        <span className="hidden sm:flex bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider items-center gap-1 shadow-lg animate-pulse">
                          <Flame className="w-3 h-3" /> Super
                        </span>
                      )}

                      {deal.isFlashDeal && !deal.isSuperDeal && (
                        <span className="hidden sm:flex bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider items-center gap-1 shadow-lg">
                          <Zap className="w-3 h-3 fill-current" /> Flash
                        </span>
                      )}
                    </div>

                    {/* Wishlist - Mobile: Bottom right | Desktop: Top right */}
                    <button
                      onClick={(e) => handleWishlistAction(e, deal)}
                      className={`absolute bottom-1.5 right-1.5 sm:top-3 sm:right-3 sm:bottom-auto w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all shadow-lg active:scale-90 ${isInWishlist(deal.id)
                        ? 'bg-rose-500 text-white'
                        : 'bg-white/90 backdrop-blur-sm text-gray-600 hover:text-rose-500'
                        }`}
                    >
                      <Heart className={`w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 ${isInWishlist(deal.id) ? 'fill-current' : ''}`} />
                    </button>

                    {/* Time Left Badge - Desktop Only */}
                    <div className="hidden sm:block absolute bottom-3 left-3 right-3">
                      <div className="bg-black/70 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1.5 rounded-lg flex items-center justify-center gap-1.5">
                        <Clock className="w-3 h-3 text-amber-400" />
                        <span>{deal.timeLeft.hours}h {deal.timeLeft.minutes}m left</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 p-3 sm:p-5 flex flex-col justify-between overflow-hidden">
                    <div className="space-y-1 sm:space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-[9px] sm:text-[10px] uppercase tracking-widest text-violet-600 font-bold truncate">
                          {deal.category}
                        </p>
                        <div className="flex items-center gap-0.5 sm:hidden">
                          <Star className="w-2.5 h-2.5 text-amber-500 fill-current" />
                          <span className="text-[9px] font-bold text-amber-700">{deal.rating?.toFixed(1) || '4.0'}</span>
                        </div>
                      </div>

                      <h3 className="text-xs sm:text-base font-bold text-gray-900 line-clamp-2 leading-tight group-hover:text-violet-700 transition-colors">
                        {deal.name}
                      </h3>

                      <div className="hidden sm:flex items-center gap-1.5">
                        <div className="flex items-center gap-0.5 bg-amber-50 px-2 py-0.5 rounded text-amber-700">
                          <Star className="w-3 h-3 fill-current" />
                          <span className="text-xs font-bold">{deal.rating?.toFixed(1) || '4.0'}</span>
                        </div>
                        <span className="text-[10px] text-gray-400">({deal.reviews || 0} reviews)</span>
                      </div>
                    </div>

                    <div className="mt-2 sm:mt-4 space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-3">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-base sm:text-xl font-black text-gray-900">
                            ₹{deal.price?.toLocaleString() || 'N/A'}
                          </span>
                          {deal.originalPrice && (
                            <span className="text-[10px] sm:text-sm text-gray-400 line-through">
                              ₹{deal.originalPrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                        {deal.originalPrice && deal.price && (
                          <span className="text-[9px] sm:text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full w-fit">
                            Save ₹{(deal.originalPrice - deal.price).toLocaleString()}
                          </span>
                        )}
                      </div>

                      {/* Info Row (Timer on mobile) */}
                      <div className="flex items-center justify-between sm:hidden">
                        <div className="flex items-center gap-1 text-[9px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                          <Clock className="w-3 h-3" />
                          {deal.timeLeft.hours}h {deal.timeLeft.minutes}m
                        </div>
                        {deal.offers && (
                          <div className="text-[9px] font-bold text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded truncate max-w-[80px]">
                            {deal.offers}
                          </div>
                        )}
                      </div>

                      {/* Offer Text (Desktop) */}
                      {deal.offers && (
                        <div className="hidden sm:block text-[11px] font-medium text-violet-600 bg-violet-50 px-2 py-1.5 rounded-lg line-clamp-1 border border-violet-100">
                          <Tag className="w-3 h-3 inline mr-1" />
                          {deal.offers}
                        </div>
                      )}

                      <Button
                        onClick={(e) => handleAddToCart(e, deal)}
                        className="w-full h-8 sm:h-11 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-[10px] sm:text-sm font-bold rounded-lg sm:rounded-xl shadow-lg shadow-violet-200 active:scale-95 transition-all mt-1"
                      >
                        <ShoppingBag className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5" />
                        Add to Cart
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
                  <h4 className="font-bold text-sm sm:text-base">Exclusive {MIN_DISCOUNT_THRESHOLD}%+ Discount Zone</h4>
                  <p className="text-violet-200 text-xs sm:text-sm mt-1">All deals on this page offer minimum {MIN_DISCOUNT_THRESHOLD}% off!</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Deals;