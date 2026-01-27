import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { useCart, useWishlist } from "../App";
import {
  ShoppingBag,
  Star,
  Heart,
  Clock,
  Zap,
  ChevronDown,
  Filter,
  Grid3X3,
  List,
  TrendingDown,
  ChevronRight,
  Eye,
  Plus
} from "lucide-react";

import Navigation from "./Navigation";
import Footer from "./Footer";

// Deals Page Component - Clean Formal Violet Style
const Deals = () => {
  const navigate = useNavigate();
  const [deals, setDeals] = useState([]);
  const [displayedDeals, setDisplayedDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("featured");
  const [viewMode, setViewMode] = useState("grid");

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        setLoading(true);
        const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
        const response = await axios.get(`${API_BASE}/api/products`);
        const mappedDeals = response.data
          .filter(p => p.discount > 0 || (p.offers && p.offers.trim() !== ""))
          .map(p => ({
            ...p,
            timeLeft: `${Math.floor(Math.random() * 12) + 1} ${Math.random() > 0.5 ? "hours" : "days"}`,
            isFlashDeal: Math.random() > 0.6
          }));
        setDeals(mappedDeals);
        setDisplayedDeals(mappedDeals.slice(0, 24));
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
    setDisplayedDeals(deals.slice(0, displayedDeals.length + 24));
  };

  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation />

      {/* Header */}
      <div className="bg-white border-b border-gray-200 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <nav className="text-sm text-gray-500 mb-3">
            <Link to="/" className="hover:text-violet-600">Home</Link>
            <span className="mx-2">›</span>
            <span className="text-gray-900 font-medium font-medium">Deals & Offers</span>
          </nav>
          <div className="flex items-center gap-3">
            <Zap className="w-8 h-8 text-violet-600" />
            <h1 className="text-2xl font-bold text-gray-900">Limited Time Offers</h1>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-violet-100 text-violet-600' : 'text-gray-400 hover:bg-gray-100'}`}
                >
                  <Grid3X3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-violet-100 text-violet-600' : 'text-gray-400 hover:bg-gray-100'}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-gray-500 font-medium">{deals.length} active deals</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative group">
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:border-violet-300 transition-colors">
                  <TrendingDown className="w-4 h-4" />
                  Sort By: <span className="text-violet-600 capitalize">{sortBy}</span>
                  <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
                  {['featured', 'highest-discount', 'price-low', 'price-high'].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setSortBy(opt)}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-600 first:rounded-t-lg last:rounded-b-lg capitalize"
                    >
                      {opt.replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-500">Curating best deals for you...</p>
          </div>
        ) : error ? (
          <div className="text-center py-24">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} className="bg-violet-600">Retry</Button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Deals Grid */}
            <div className={viewMode === 'grid'
              ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4"
              : "space-y-4"
            }>
              {displayedDeals.map((deal) => (
                <div
                  key={deal.id}
                  className={`group bg-white rounded-xl border border-gray-200 transition-all duration-300 hover:shadow-xl hover:border-violet-200 overflow-hidden ${viewMode === 'list' ? 'flex flex-row h-48' : 'flex flex-col'
                    }`}
                >
                  <Link
                    to={`/product/${deal.id}`}
                    className={`relative bg-gray-50 overflow-hidden ${viewMode === 'list' ? 'w-48 h-full shrink-0' : 'aspect-square'}`}
                  >
                    <img
                      src={deal.image}
                      alt={deal.name}
                      className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-2 left-2 flex flex-col gap-2">
                      <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                        -{deal.discount}%
                      </span>
                      {deal.isFlashDeal && (
                        <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                          <Zap className="w-3 h-3 fill-current" /> Flash
                        </span>
                      )}
                    </div>
                    {/* Image Overlay Actions */}
                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          isInWishlist(deal.id) ? removeFromWishlist(deal.id) : addToWishlist(deal);
                        }}
                        className={`w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center transition-all hover:scale-110 ${isInWishlist(deal.id) ? 'text-rose-500' : 'text-gray-600 hover:text-rose-500'}`}
                      >
                        <Heart className={`w-5 h-5 ${isInWishlist(deal.id) ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                  </Link>

                  <div className="p-4 flex flex-col flex-1 justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-violet-600 font-bold mb-1 line-clamp-1">{deal.category}</p>
                      <Link to={`/product/${deal.id}`}>
                        <h3 className="text-sm font-semibold text-gray-900 group-hover:text-violet-600 transition-colors line-clamp-2 mb-2 leading-tight">
                          {deal.name}
                        </h3>
                      </Link>
                      <div className="flex items-center gap-1 mb-2">
                        <div className="flex text-amber-400">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3 h-3 ${i < Math.floor(deal.rating) ? 'fill-current' : 'text-gray-200'}`} />
                          ))}
                        </div>
                        <span className="text-[10px] text-gray-400 font-medium">({deal.reviews})</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-lg font-bold text-gray-900">₹{deal.price ? deal.price.toLocaleString() : 'N/A'}</span>
                        {deal.originalPrice && (
                          <span className="text-xs text-gray-400 line-through">₹{deal.originalPrice.toLocaleString()}</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-[10px] font-bold text-rose-500 mb-3 bg-rose-50 px-2 py-1 rounded-lg w-fit">
                        <Clock className="w-3 h-3" />
                        Ends in: {deal.timeLeft}
                      </div>

                      {deal.offers && (
                        <div className="text-[10px] sm:text-xs font-medium text-violet-600 bg-violet-50 px-2 py-1 rounded-lg mb-3 line-clamp-1">
                          {deal.offers}
                        </div>
                      )}

                      <Button
                        onClick={() => addToCart({ ...deal, quantity: 1 })}
                        className="w-full h-9 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-lg shadow-sm"
                      >
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {displayedDeals.length < deals.length && (
              <div className="flex justify-center py-10">
                <Button
                  variant="outline"
                  onClick={loadMore}
                  className="px-10 h-12 border-2 border-violet-100 text-violet-600 hover:bg-violet-50 font-bold rounded-xl"
                >
                  Load More Deals
                </Button>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Deals;