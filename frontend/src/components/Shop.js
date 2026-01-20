import { useEffect, useState, useMemo } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useCart, useWishlist } from "../App";
import {
  ShoppingCart,
  Star,
  Filter,
  Grid,
  List,
  SlidersHorizontal,
  Heart,
  ChevronRight,
  Search,
  Box,
  LayoutDashboard,
  Maximize2,
  ArrowUpDown,
  Archive,
  Check,
  X,
  ArrowRight,
  ShoppingBag,
  Plus,
  Eye
} from "lucide-react";

import Navigation from "./Navigation";
import Footer from "./Footer";

// Shop Page Component
const Shop = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("featured");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [showFilters, setShowFilters] = useState(true);
  const [filters, setFilters] = useState({
    category: "",
    priceRange: [0, 100000],
    rating: 0
  });

  // Update searchQuery when URL changes
  useEffect(() => {
    const urlSearch = searchParams.get("search");
    if (urlSearch) {
      setSearchQuery(urlSearch);
    }
  }, [searchParams]);

  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get("https://dummyjson.com/products?limit=100");
        const mappedProducts = response.data.products.map(p => ({
          id: p.id,
          name: p.title,
          price: Math.round(p.price * 83), // Convert USD to INR
          originalPrice: Math.round(p.price * 83 * (1 + p.discountPercentage / 100)),
          image: p.thumbnail || p.images[0],
          rating: p.rating,
          reviews: p.reviews ? p.reviews.length : Math.floor(Math.random() * 500) + 100,
          isNew: Math.random() > 0.9,
          category: p.category, // DummyJSON returns category as a string
          description: p.description
        }));
        setProducts(mappedProducts);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Unable to load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    let result = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !filters.category || product.category === filters.category;
      const matchesPrice = product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1];
      const matchesRating = filters.rating === 0 || product.rating >= filters.rating;
      return matchesSearch && matchesCategory && matchesPrice && matchesRating;
    });

    switch (sortBy) {
      case "price-low": result.sort((a, b) => a.price - b.price); break;
      case "price-high": result.sort((a, b) => b.price - a.price); break;
      case "rating": result.sort((a, b) => b.rating - a.rating); break;
      case "newest": result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0)); break;
      default: break;
    }
    return result;
  }, [products, searchQuery, filters, sortBy]);

  const categories = Array.from(new Set(products.map(p => p.category)));

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-3.5 h-3.5 ${i < Math.floor(rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-gray-900">
      <Navigation />

      {/* Hero Header - Professional & Formal */}
      <div className="bg-gradient-to-b from-violet-50 to-white border-b border-violet-200 py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif text-gray-900 mb-4 md:mb-6 tracking-tight pt-4">
            The Catalog
          </h1>
          <div className="h-1 w-24 sm:w-32 bg-violet-600 mx-auto mb-6 md:mb-8 rounded-full"></div>
          <p className="text-gray-600 max-w-3xl mx-auto text-base uppercase tracking-widest font-medium leading-relaxed">
            Curated Essentials for the Discerning Professional
          </p>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <div className="flex flex-col lg:flex-row gap-8 md:gap-12">

          {/* Mobile Filter Toggle */}
          <div className="lg:hidden mb-8">
            <Button
              variant="outline"
              className="w-full flex items-center justify-between h-14 border-violet-300 rounded-none text-gray-900 font-medium hover:bg-violet-700 hover:text-white transition-all"
              onClick={() => setShowFilters(!showFilters)}
            >
              <span className="flex items-center gap-3 uppercase text-xs tracking-widest"><Filter className="w-5 h-5" /> Filter Catalog</span>
              {showFilters ? <X className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </Button>
          </div>

          {/* Filters Sidebar - Professional Structure */}
          <aside className={`lg:w-72 flex-shrink-0 space-y-10 md:space-y-14 ${showFilters ? 'block' : 'hidden lg:block'}`}>

            {/* Search */}
            <div className="space-y-6 pb-8">
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-900 border-b border-violet-200 pb-3">Search</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-600 focus:border-violet-600 placeholder:text-gray-400 font-medium transition-all"
                />
              </div>
            </div>

            {/* Categories */}
            <div className="space-y-6 pb-8">
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-900 border-b border-violet-200 pb-3">
                Departments
              </h3>
              <div className="space-y-2">
                <button
                  className={`w-full text-left text-sm py-3 px-3 transition-colors border-l-2 rounded-r-md ${!filters.category ? 'border-violet-700 font-bold text-violet-700 bg-violet-50' : 'border-transparent text-gray-600 hover:text-violet-700 hover:bg-violet-25'}`}
                  onClick={() => setFilters({ ...filters, category: "" })}
                >
                  View All
                </button>
                {categories.map(cat => (
                  <button
                    key={cat}
                    className={`w-full text-left text-sm py-3 px-3 capitalize transition-colors border-l-2 rounded-r-md ${filters.category === cat ? 'border-violet-700 font-bold text-violet-700 bg-violet-50' : 'border-transparent text-gray-600 hover:text-violet-700 hover:bg-violet-25'}`}
                    onClick={() => setFilters({ ...filters, category: cat })}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="space-y-8 pb-8">
              <div className="flex items-center justify-between border-b border-violet-200 pb-3">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-900">Price Range</h3>
                <span className="text-xs font-mono text-gray-600">₹{filters.priceRange[0]} - ₹{filters.priceRange[1].toLocaleString()}</span>
              </div>
              <Slider
                value={filters.priceRange}
                onValueChange={(v) => setFilters({ ...filters, priceRange: v })}
                max={100000}
                step={100}
                className="py-4"
              />
            </div>

            {/* Rating */}
            <div className="space-y-6 pb-8">
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-900 border-b border-violet-200 pb-3">Quality Rating</h3>
              <div className="space-y-4">
                {[4, 3, 0].map((rating) => (
                  <div key={rating} className="flex items-center space-x-3">
                    <Checkbox
                      id={`rating-${rating}`}
                      checked={filters.rating === rating}
                      onCheckedChange={() => setFilters({ ...filters, rating: filters.rating === rating ? 0 : rating })}
                      className="border-gray-300 rounded-none data-[state=checked]:bg-violet-700 data-[state=checked]:border-violet-700"
                    />
                    <Label htmlFor={`rating-${rating}`} className="text-sm text-gray-700 flex items-center gap-1 cursor-pointer font-medium">
                      {rating === 0 ? "All Ratings" : <>{rating}+ <Star className="w-3 h-3 fill-violet-700 text-violet-700" /></>}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-8">
              <Button
                variant="outline"
                className="w-full h-12 border border-violet-300 hover:bg-violet-700 hover:text-white rounded-none uppercase text-xs tracking-widest font-medium transition-all"
                onClick={() => setFilters({ category: "", priceRange: [0, 100000], rating: 0 })}
              >
                Reset Filters
              </Button>
            </div>
          </aside>

          {/* Product Grid Area */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 md:gap-8 mb-10 md:mb-12 border-b border-violet-200 pb-6 md:pb-8">
              <div className="flex items-center gap-8">
                <span className="text-gray-900 font-serif italic text-xl">{filteredProducts.length} Items</span>
                <div className="flex items-center border-l border-violet-200 pl-8 gap-3">
                  <button
                    className={`p-3 transition-colors rounded-md ${viewMode === "grid" ? 'text-violet-700 bg-violet-50' : 'text-gray-400 hover:text-violet-700 hover:bg-violet-25'}`}
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                  <button
                    className={`p-3 transition-colors rounded-md ${viewMode === "list" ? 'text-violet-700 bg-violet-50' : 'text-gray-400 hover:text-violet-700 hover:bg-violet-25'}`}
                    onClick={() => setViewMode("list")}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <span className="text-xs font-bold uppercase tracking-widest text-gray-600">Sort By</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-[200px] h-12 bg-transparent border-0 border-b border-violet-200 rounded-none font-medium text-sm focus:ring-0 focus:border-violet-700 px-0">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="rounded-none border-violet-200">
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="newest">New Arrivals</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Top Rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 md:py-32">
                <div className="w-px h-16 bg-gray-200 animate-pulse mb-4"></div>
                <p className="text-gray-400 font-serif italic">Loading catalog...</p>
              </div>
            ) : error ? (
              <div className="text-center py-16 md:py-32 bg-gray-50 border border-gray-200">
                <p className="text-gray-900 font-medium mb-4">{error}</p>
                <Button onClick={() => window.location.reload()} variant="outline" className="rounded-none border-violet-600 text-violet-600">Refetch</Button>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20 md:py-40">
                <div className="w-20 h-20 border-2 border-violet-200 rounded-full flex items-center justify-center mx-auto mb-8">
                  <Search className="w-8 h-8 text-violet-400" />
                </div>
                <h3 className="text-2xl font-serif text-gray-900 mb-4">No results found</h3>
                <p className="text-gray-600 max-w-md mx-auto mb-10">Adjust your filters to discover more products.</p>
                <Button onClick={() => setFilters({ category: "", priceRange: [0, 100000], rating: 0 })} className="bg-violet-700 text-white rounded-none h-14 px-10 uppercase text-xs tracking-widest hover:bg-violet-800 transition-all">
                  Reset Search
                </Button>
              </div>
            ) : (
              <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "space-y-4"}>
                {filteredProducts.map((product) => (
                  <div key={product.id} className={`group ${viewMode === "list" ? "bg-white rounded-xl border border-gray-100 hover:border-violet-200 hover:shadow-lg transition-all duration-300 overflow-hidden" : "bg-white rounded-lg border border-gray-100 hover:border-violet-200 hover:shadow-xl transition-all duration-300 overflow-hidden"}`}>
                    {viewMode === "list" ? (
                      /* List View - Mobile Optimized Card Layout */
                      <div className="flex flex-col sm:flex-row">
                        {/* Image - Full width on mobile, fixed width on larger */}
                        <div className="relative w-full sm:w-48 md:w-64 aspect-square sm:aspect-[4/5] shrink-0 overflow-hidden">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop" }}
                            loading="lazy"
                          />

                          {/* Badges */}
                          <div className="absolute top-3 left-3 flex gap-2">
                            {product.isNew && (
                              <span className="bg-violet-600 text-white px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold rounded-full shadow-sm">
                                New
                              </span>
                            )}
                            {product.originalPrice > product.price && (
                              <span className="bg-rose-500 text-white px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold rounded-full shadow-sm">
                                Sale
                              </span>
                            )}
                          </div>

                          {/* Wishlist Button */}
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              isInWishlist(product.id) ? removeFromWishlist(product.id) : addToWishlist(product);
                            }}
                            className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white hover:scale-110 transition-all"
                          >
                            <Heart className={`w-4 h-4 transition-colors ${isInWishlist(product.id) ? 'fill-rose-500 text-rose-500' : 'text-gray-600 hover:text-rose-500'}`} />
                          </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-4 sm:p-5 flex flex-col">
                          <p className="text-[10px] uppercase tracking-widest text-violet-600 font-semibold mb-1">
                            {product.category}
                          </p>

                          <Link to={`/product/${product.id}`} className="block mb-2 hover:text-violet-700 transition-colors">
                            <h3 className="font-semibold text-gray-900 leading-snug line-clamp-2 text-base sm:text-lg">
                              {product.name}
                            </h3>
                          </Link>

                          {/* Rating */}
                          <div className="flex items-center gap-1.5 mb-3">
                            <div className="flex items-center gap-0.5">
                              {renderStars(product.rating)}
                            </div>
                            <span className="text-xs text-gray-500">({product.reviews})</span>
                          </div>

                          {/* Description - Hidden on mobile */}
                          {product.description && (
                            <p className="hidden md:block text-gray-500 text-sm mb-4 leading-relaxed line-clamp-2">{product.description}</p>
                          )}

                          {/* Price and Actions */}
                          <div className="mt-auto">
                            <div className="flex items-center gap-3 mb-4">
                              <span className="text-xl font-bold text-gray-900">
                                ₹{product.price.toLocaleString()}
                              </span>
                              {product.originalPrice > product.price && (
                                <span className="text-sm text-gray-400 line-through">
                                  ₹{product.originalPrice.toLocaleString()}
                                </span>
                              )}
                              {product.originalPrice > product.price && (
                                <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded">
                                  {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                                </span>
                              )}
                            </div>

                            {/* Action Buttons - Stack on mobile */}
                            <div className="flex gap-2">
                              <Button
                                onClick={() => addToCart(product)}
                                className="flex-1 bg-violet-600 hover:bg-violet-700 text-white rounded-lg h-11 font-semibold transition-all"
                              >
                                <ShoppingBag className="w-4 h-4 mr-2" /> Add to Cart
                              </Button>
                              <Button
                                variant="outline"
                                className="rounded-lg h-11 px-4 border-2 border-violet-200 text-violet-700 font-semibold hover:bg-violet-50 transition-all"
                                onClick={() => { addToCart(product); navigate('/payment'); }}
                              >
                                Buy
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Grid View */
                      <div className="flex flex-col">
                        {/* Image Container */}
                        <div className="relative overflow-hidden bg-gray-50 aspect-square w-full">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop" }}
                            loading="lazy"
                          />

                          {/* Badges */}
                          <div className="absolute top-3 left-3 flex flex-col items-start gap-2">
                            {product.isNew && (
                              <span className="bg-violet-600 text-white px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold rounded-full shadow-sm">
                                New
                              </span>
                            )}
                            {product.originalPrice > product.price && (
                              <span className="bg-rose-500 text-white px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold rounded-full shadow-sm">
                                Sale
                              </span>
                            )}
                          </div>

                          {/* Wishlist Button */}
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              isInWishlist(product.id) ? removeFromWishlist(product.id) : addToWishlist(product);
                            }}
                            className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white hover:scale-110 transition-all"
                          >
                            <Heart className={`w-4 h-4 transition-colors ${isInWishlist(product.id) ? 'fill-rose-500 text-rose-500' : 'text-gray-600 hover:text-rose-500'}`} />
                          </button>

                          {/* Quick View Overlay */}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                            <Link
                              to={`/product/${product.id}`}
                              className="w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-violet-600 hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0"
                            >
                              <Eye className="w-5 h-5" />
                            </Link>
                            <button
                              onClick={() => addToCart(product)}
                              className="w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-violet-600 hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 delay-75"
                            >
                              <ShoppingBag className="w-5 h-5" />
                            </button>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-4 flex flex-col">
                          <p className="text-[10px] uppercase tracking-widest text-violet-600 font-semibold mb-1.5">
                            {product.category}
                          </p>

                          <Link to={`/product/${product.id}`} className="block mb-2 hover:text-violet-700 transition-colors">
                            <h3 className="font-medium text-gray-900 leading-snug line-clamp-2 text-sm">
                              {product.name}
                            </h3>
                          </Link>

                          {/* Rating */}
                          <div className="flex items-center gap-1.5 mb-3">
                            <div className="flex items-center gap-0.5">
                              {renderStars(product.rating)}
                            </div>
                            <span className="text-xs text-gray-500">({product.reviews})</span>
                          </div>

                          <div className="mt-auto flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold text-gray-900">
                                ₹{product.price.toLocaleString()}
                              </span>
                              {product.originalPrice > product.price && (
                                <span className="text-sm text-gray-400 line-through">
                                  ₹{product.originalPrice.toLocaleString()}
                                </span>
                              )}
                            </div>
                            <button
                              onClick={() => addToCart(product)}
                              className="w-10 h-10 bg-violet-600 hover:bg-violet-700 text-white rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-md"
                            >
                              <Plus className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Pagination - Formal */}
            {filteredProducts.length > 0 && (
              <div className="mt-16 md:mt-24 border-t border-violet-200 pt-8 md:pt-10 flex justify-between items-center">
                <p className="text-gray-500 text-sm font-medium uppercase tracking-widest">Page 1 of 3</p>
                <div className="flex gap-6">
                  <button className="text-sm uppercase tracking-widest font-bold text-gray-400 cursor-not-allowed">Previous</button>
                  <button className="text-sm uppercase tracking-widest font-bold text-violet-700 hover:underline transition-all">Next</button>
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

export default Shop;