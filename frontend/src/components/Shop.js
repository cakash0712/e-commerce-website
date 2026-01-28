import { useEffect, useState, useMemo } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { useCart, useWishlist } from "../App";
import {
  ShoppingCart,
  Star,
  Filter,
  Grid3X3,
  List,
  Heart,
  ChevronRight,
  Search,
  X,
  Eye,
  ShoppingBag,
  SlidersHorizontal,
  ChevronDown,
  Zap,
  Store,
  Home,
  AlertCircle,
  RefreshCcw
} from "lucide-react";

import Navigation from "./Navigation";
import Footer from "./Footer";

// Shop Page Component - Professional Violet Theme
const Shop = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("featured");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: searchParams.get("category") || "",
    subCategory: "",
    priceRange: [0, 100000],
    rating: 0,
    brands: [],
    discount: 0,
    vendor: searchParams.get("vendor") || ""
  });

  // Update searchQuery when URL changes
  useEffect(() => {
    const urlSearch = searchParams.get("search");
    const urlCategory = searchParams.get("category");
    const urlVendor = searchParams.get("vendor");
    if (urlSearch) {
      setSearchQuery(urlSearch);
    }
    if (urlCategory) {
      setFilters(prev => ({ ...prev, category: urlCategory }));
    }
    if (urlVendor) {
      setFilters(prev => ({ ...prev, vendor: urlVendor }));
    }
  }, [searchParams]);

  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]); // Derived from products
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper function to get proxied image URL
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) {
      console.log('No image URL provided, using fallback');
      return '/assets/zlogo.png';
    }
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
      const proxiedUrl = `${API_BASE}/api/proxy-image?url=${encodeURIComponent(imageUrl)}`;
      console.log('Using proxied URL for:', imageUrl, '->', proxiedUrl);
      return proxiedUrl;
    }
    console.log('Using direct URL:', imageUrl);
    return imageUrl;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

        // Fetch products
        const prodRes = await axios.get(`${API_BASE}/api/products`);
        setProducts(prodRes.data);

        // Extract unique brands
        const uniqueBrands = [...new Set(prodRes.data.map(p => p.brand).filter(Boolean))];
        setBrands(uniqueBrands);

        // Fetch categories
        const catRes = await axios.get(`${API_BASE}/api/public/categories`);
        setCategories(catRes.data.map(cat => ({ name: cat.name, sub: [] })));
      } catch (err) {
        console.error("Error fetching shop data:", err);
        setError("Unable to load store data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredProducts = useMemo(() => {
    let result = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase());
      const normalize = (str) => str?.toLowerCase().replace(/[^a-z0-9]/g, '');
      const matchesCategory = !filters.category ||
        (normalize(product.category) === normalize(filters.category)) ||
        (filters.subCategory && normalize(product.category) === normalize(filters.subCategory));
      const matchesPrice = product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1];
      const matchesRating = filters.rating === 0 || product.rating >= filters.rating;

      const matchesBrand = filters.brands.length === 0 || filters.brands.includes(product.brand);
      const matchesDiscount = filters.discount === 0 || (product.discount && product.discount >= filters.discount);

      const matchesVendor = !filters.vendor || product.vendor_id === filters.vendor;

      return matchesSearch && matchesCategory && matchesPrice && matchesRating && matchesBrand && matchesDiscount && matchesVendor;
    });

    switch (sortBy) {
      case "price-low": result.sort((a, b) => a.price - b.price); break;
      case "price-high": result.sort((a, b) => b.price - a.price); break;
      case "rating": result.sort((a, b) => b.rating - a.rating); break;
      case "newest": result.sort((a, b) => (b.id < a.id ? -1 : 1)); break;
      default: break;
    }
    return result;
  }, [products, searchQuery, filters, sortBy]);



  const clearFilters = () => {
    setFilters({ category: "", subCategory: "", priceRange: [0, 100000], rating: 0, brands: [], discount: 0, vendor: "" });
    setSearchQuery("");
    setSearchParams({});
  };

  const activeFilterCount = [
    filters.category,
    filters.subCategory,
    filters.rating > 0,
    filters.priceRange[0] > 0 || filters.priceRange[1] < 100000,
    filters.brands.length > 0,
    filters.discount > 0,
    filters.vendor
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation />

      {/* Header */}
      <div className="bg-white border-b border-gray-200 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <nav className="text-sm text-gray-500 mb-3">
            <Link to="/" className="hover:text-violet-600">Home</Link>
            <span className="mx-2">›</span>
            <span className="text-gray-900 font-medium">Products</span>
            {filters.category && (
              <>
                <span className="mx-2">›</span>
                <span className="text-violet-600 font-medium capitalize">{filters.category}</span>
                {filters.subCategory && (
                  <>
                    <span className="mx-2">›</span>
                    <span className="text-violet-600 font-medium capitalize">{filters.subCategory}</span>
                  </>
                )}
              </>
            )}
          </nav>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              {filters.vendor && filteredProducts.length > 0 ? (
                <span>Products by {filteredProducts[0].vendor_name}</span>
              ) : filters.subCategory ? (
                <span className="capitalize">{filters.subCategory.replace(/-/g, ' ')}</span>
              ) : filters.category ? (
                <span className="capitalize">{filters.category.replace(/-/g, ' ')}</span>
              ) : (
                "All Products"
              )}
            </h1>
            <span className="text-sm text-gray-500">{filteredProducts.length} products</span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-20 shadow-sm sm:shadow-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-3">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3 flex-1">
              {/* Filter Toggle */}
              <Button
                variant="outline"
                className={`h-9 sm:h-10 px-3 sm:px-4 border-gray-300 rounded-lg sm:rounded-xl hover:border-violet-500 hover:text-violet-600 transition-all ${showFilters ? 'bg-violet-50 border-violet-500 text-violet-600' : ''}`}
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Filters</span>
                <span className="sm:hidden text-xs">Filter</span>
                {activeFilterCount > 0 && (
                  <span className="ml-1 sm:ml-2 w-4 h-4 sm:w-5 sm:h-5 bg-violet-600 text-white text-[10px] sm:text-xs rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </Button>

              {/* Search (Compact on Mobile) */}
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 sm:h-10 w-full sm:w-64 bg-gray-50 border-gray-300 rounded-lg sm:rounded-xl focus:border-violet-500 focus:ring-violet-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Sort (Compact on Mobile) */}
              <div className="flex items-center gap-2">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[100px] sm:w-[140px] h-9 sm:h-10 border-gray-300 rounded-lg sm:rounded-xl focus:ring-violet-500 text-xs sm:text-sm">
                    <SelectValue placeholder="Sort" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="price-low">Price: Low-High</SelectItem>
                    <SelectItem value="price-high">Price: High-Low</SelectItem>
                    <SelectItem value="rating">Top Rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* View Mode (Hidden on very small screens to save space if needed, but kept for now) */}
              <div className="hidden xs:flex items-center border border-gray-300 rounded-lg sm:rounded-xl p-1 bg-gray-50/50">
                <button
                  className={`p-1 sm:p-1.5 rounded-lg transition-all ${viewMode === "grid" ? 'bg-violet-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3X3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
                <button
                  className={`p-1 sm:p-1.5 rounded-lg transition-all ${viewMode === "list" ? 'bg-violet-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
                  onClick={() => setViewMode("list")}
                >
                  <List className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Filters Sidebar */}
          {/* Mobile Overlay Backdrop */}
          {showFilters && (
            <div
              className="fixed inset-0 bg-black/50 z-50 lg:hidden"
              onClick={() => setShowFilters(false)}
            />
          )}

          <aside className={`
            ${showFilters ? 'block' : 'hidden'} 
            fixed lg:relative inset-y-0 left-0 z-50 lg:z-0
            w-[280px] lg:w-64 transform lg:transform-none transition-transform duration-300
            ${showFilters ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            bg-white lg:bg-transparent flex-shrink-0
          `}>
            <div className="h-full lg:h-auto overflow-y-auto lg:overflow-visible p-5 lg:p-0 sticky top-0 lg:top-36">
              <div className="lg:bg-white lg:rounded-2xl lg:border lg:border-gray-200 lg:p-5 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-gray-900 flex items-center gap-2 text-sm sm:text-base">
                    <Filter className="w-4 h-4 text-violet-600" />
                    Filters
                  </h3>
                  <div className="flex items-center gap-2">
                    {activeFilterCount > 0 && (
                      <button onClick={clearFilters} className="text-xs text-violet-600 font-bold hover:underline">
                        Reset
                      </button>
                    )}
                    <button onClick={() => setShowFilters(false)} className="lg:hidden p-1 text-gray-400">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Categories */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-900">Categories</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {filters.category === "Food" ? (
                      <>
                        <button
                          className={`w-full text-left text-sm py-1.5 px-2 rounded transition-colors ${!filters.subCategory ? 'bg-violet-50 text-violet-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                          onClick={() => setFilters({ ...filters, subCategory: "" })}
                        >
                          All Food
                        </button>
                        {categories.find(cat => cat.name === "Food")?.sub.map(sub => (
                          <button
                            key={sub}
                            className={`w-full text-left text-sm py-1.5 px-2 rounded transition-colors ${filters.subCategory === sub ? 'bg-violet-50 text-violet-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                            onClick={() => setFilters({ ...filters, subCategory: sub })}
                          >
                            {sub}
                          </button>
                        ))}
                        <button
                          className="w-full text-left text-sm py-1.5 px-2 rounded transition-colors text-gray-500 hover:bg-gray-50"
                          onClick={() => setFilters({ ...filters, category: "", subCategory: "" })}
                        >
                          ← Back to All Categories
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className={`w-full text-left text-sm py-1.5 px-2 rounded transition-colors ${!filters.category ? 'bg-violet-50 text-violet-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                          onClick={() => setFilters({ ...filters, category: "", subCategory: "" })}
                        >
                          All Categories
                        </button>
                        {categories.map(cat => (
                          <div key={cat.name}>
                            <button
                              className={`w-full text-left text-sm py-1.5 px-2 rounded transition-colors ${filters.category === cat.name && !filters.subCategory ? 'bg-violet-50 text-violet-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                              onClick={() => setFilters({ ...filters, category: cat.name, subCategory: "" })}
                            >
                              {cat.name}
                            </button>
                            {cat.sub.length > 0 && (
                              <div className="ml-4 space-y-1">
                                {cat.sub.map(sub => (
                                  <button
                                    key={sub}
                                    className={`w-full text-left text-sm py-1 px-2 rounded transition-colors ${filters.category === cat.name && filters.subCategory === sub ? 'bg-violet-50 text-violet-700 font-medium' : 'text-gray-500 hover:bg-gray-50'}`}
                                    onClick={() => setFilters({ ...filters, category: cat.name, subCategory: sub })}
                                  >
                                    {sub}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>

                {filters.category !== "Food" && (
                  <>
                    {/* Price Range */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-gray-900">Price Range</h4>
                        <span className="text-xs text-gray-500">₹{filters.priceRange[0]} - ₹{filters.priceRange[1].toLocaleString()}</span>
                      </div>
                      <Slider
                        value={filters.priceRange}
                        onValueChange={(v) => setFilters({ ...filters, priceRange: v })}
                        max={100000}
                        step={500}
                        className="py-2"
                      />
                    </div>

                    {/* Rating */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-gray-900">Rating</h4>
                      <div className="space-y-2">
                        {[4, 3, 2, 0].map((rating) => (
                          <label key={rating} className="flex items-center gap-2 cursor-pointer">
                            <Checkbox
                              checked={filters.rating === rating}
                              onCheckedChange={() => setFilters({ ...filters, rating: filters.rating === rating ? 0 : rating })}
                              className="border-gray-300 data-[state=checked]:bg-violet-600 data-[state=checked]:border-violet-600"
                            />
                            <span className="text-sm text-gray-600 flex items-center gap-1">
                              {rating === 0 ? "All Ratings" : (
                                <>
                                  {rating}+ <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                </>
                              )}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </>
                )}
                {/* Brands */}
                {brands.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-gray-900">Brands</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {brands.map((brand) => (
                        <label key={brand} className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            checked={filters.brands.includes(brand)}
                            onCheckedChange={(checked) => {
                              setFilters(prev => ({
                                ...prev,
                                brands: checked
                                  ? [...prev.brands, brand]
                                  : prev.brands.filter(b => b !== brand)
                              }));
                            }}
                            className="border-gray-300 data-[state=checked]:bg-violet-600 data-[state=checked]:border-violet-600"
                          />
                          <span className="text-sm text-gray-600">{brand}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Discount */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-900">Discount</h4>
                  <div className="space-y-2">
                    {[50, 40, 30, 20, 10].map((discount) => (
                      <label key={discount} className="flex items-center gap-2 cursor-pointer">
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${filters.discount === discount ? 'border-violet-600' : 'border-gray-300'}`}>
                          {filters.discount === discount && <div className="w-2 h-2 bg-violet-600 rounded-full" />}
                        </div>
                        <input
                          type="radio"
                          name="discount"
                          className="hidden"
                          checked={filters.discount === discount}
                          onChange={() => setFilters({ ...filters, discount: filters.discount === discount ? 0 : discount })}
                        />
                        <span className="text-sm text-gray-600">
                          {discount}% or more
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24">
                <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-500">Loading products...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
                <div className="bg-rose-50 rounded-full p-6 mb-6">
                  <AlertCircle className="w-12 h-12 text-rose-500" />
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-2">Something went wrong</h3>
                <p className="text-gray-500 mb-8 max-w-sm mx-auto text-sm leading-relaxed">
                  We ran into an issue while retrieving the products. This might be due to a temporary connection problem.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={() => window.location.reload()}
                    className="bg-violet-600 hover:bg-violet-700 text-white px-8 h-12 rounded-xl font-bold shadow-lg shadow-violet-100 flex items-center gap-2 transition-all active:scale-95"
                  >
                    <RefreshCcw className="w-4 h-4" />
                    Retry Loading
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/')}
                    className="border-gray-200 hover:bg-gray-50 text-gray-700 px-8 h-12 rounded-xl font-bold transition-all active:scale-95"
                  >
                    Go Back Home
                  </Button>
                </div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-4">
                <div className="sm:bg-transparent bg-white sm:rounded-none rounded-3xl sm:border-0 border border-gray-100 p-8 sm:p-0 max-w-lg w-full text-center sm:shadow-none shadow-xl shadow-gray-200/50">
                  <div className="relative inline-block mb-8">
                    <div className="w-24 h-24 bg-violet-50 rounded-2xl flex items-center justify-center mx-auto rotate-12 group-hover:rotate-0 transition-transform">
                      <Search className="w-12 h-12 text-violet-500 -rotate-12" />
                    </div>
                  </div>

                  <h3 className="text-2xl font-black text-gray-900 mb-3">Oops! No results found</h3>
                  <p className="text-gray-500 mb-8 leading-relaxed text-sm sm:text-base">
                    We couldn't find any products matching your current filters. Try adjusting your search or clearing filters to see more options.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                    <Button
                      onClick={clearFilters}
                      className="bg-violet-600 hover:bg-violet-700 text-white h-12 rounded-xl font-bold shadow-lg shadow-violet-100 active:scale-95 transition-all"
                    >
                      <SlidersHorizontal className="w-4 h-4 mr-2" />
                      Clear Filters
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => navigate('/')}
                      className="border-gray-200 hover:bg-gray-50 text-gray-700 h-12 rounded-xl font-bold active:scale-95 transition-all"
                    >
                      <Home className="w-4 h-4 mr-2" />
                      Back to Home
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className={viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 bg-gray-50/50 sm:bg-transparent"
                : "space-y-4"
              }>
                {filteredProducts.map((product) => (
                  <div key={product.id} className={`group bg-white overflow-hidden transition-all duration-200
                      ${viewMode === "grid"
                      ? "border border-gray-100 sm:border-gray-200 rounded-xl sm:rounded-lg hover:shadow-lg sm:hover:border-violet-200 flex sm:flex-col shadow-sm sm:shadow-none mx-2 sm:mx-0"
                      : "border border-gray-200 rounded-xl flex"}`}>
                    {viewMode === "grid" ? (
                      /* Amazon-style View (Mobile: List, Desktop: Grid) */
                      <>
                        {/* Image Section */}
                        <Link
                          to={`/product/${product.id}`}
                          className="w-[35%] sm:w-full flex-shrink-0 relative overflow-hidden bg-white p-3 sm:p-0 flex items-center justify-center"
                        >
                          <div className="aspect-square sm:aspect-[4/3] w-full relative">
                            <img
                              src={getImageUrl(product.image || product.images?.[0])}
                              alt={product.name}
                              className="w-full h-full object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-105"
                              loading="lazy"
                              onError={(e) => { e.target.src = '/assets/zlogo.png'; }}
                            />
                          </div>

                          {/* Badges */}
                          {product.discount > 40 && (
                            <div className="absolute top-2 left-2 bg-rose-600 text-white text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded shadow-sm z-10 flex items-center gap-1 uppercase sm:hidden">
                              <Zap className="w-2.5 h-2.5 fill-current" /> Deal
                            </div>
                          )}
                          {product.discount > 10 && (
                            <div className="absolute top-2 left-2 bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm z-10 hidden sm:block">
                              -{product.discount}%
                            </div>
                          )}

                          {/* Desktop Hover Actions */}
                          <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                isInWishlist(product.id) ? removeFromWishlist(product.id) : addToWishlist(product);
                              }}
                              className={`w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform ${isInWishlist(product.id) ? 'text-rose-500' : 'text-gray-600 hover:text-rose-500'}`}
                            >
                              <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                            </button>
                          </div>
                        </Link>

                        {/* Info Section */}
                        <div className="flex-1 p-3 sm:p-3 flex flex-col min-w-0">
                          {/* Desktop Category */}
                          <span className="hidden sm:block text-[10px] text-violet-600 font-bold uppercase tracking-wider mb-1">{product.category}</span>

                          {/* Title */}
                          <Link to={`/product/${product.id}`} className="block">
                            <h3 className="text-[14px] sm:text-sm font-medium text-gray-900 leading-snug sm:leading-normal mb-1 sm:mb-2 line-clamp-2 group-hover:text-violet-600 transition-colors">
                              {product.name}
                            </h3>
                          </Link>

                          {/* Rating */}
                          <div className="flex items-center gap-1 mb-1.5 sm:mb-2 text-[11px] sm:text-xs">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-3 h-3 ${i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                              ))}
                            </div>
                            <span className="text-gray-500">({product.reviews})</span>
                          </div>

                          {/* Vendor Info */}
                          <div className="flex items-center gap-1 mb-2 sm:mb-2 text-[11px] text-gray-500">
                            <Store className="w-3 h-3" />
                            <span className="truncate">{product.vendor_name}</span>
                          </div>

                          {/* Pricing */}
                          <div className="mt-auto">
                            <div className="flex items-baseline flex-wrap gap-1.5 mb-1">
                              <span className="text-xl sm:text-lg font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
                              {product.originalPrice > product.price && (
                                <>
                                  <span className="text-xs text-gray-400 line-through">₹{product.originalPrice.toLocaleString()}</span>
                                  {/* Mobile Only Off % */}
                                  <span className="text-xs text-rose-600 font-bold sm:hidden">{product.discount}% off</span>
                                </>
                              )}
                            </div>

                            {/* Delivery Info */}
                            <div className="flex items-end justify-between">
                              <div className="space-y-0.5">
                                <p className={`text-[12px] font-medium ${product.delivery_type === 'free' ? 'text-green-600' : 'text-gray-500'}`}>
                                  {product.delivery_type === 'free' ? 'Free delivery' : `Delivery: ₹${product.delivery_charge}`}
                                </p>
                                <p className="text-[11px] text-gray-400 sm:hidden">
                                  Get it by <span className="text-gray-700 font-bold">{new Date(Date.now() + 172800000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                                </p>
                              </div>

                              {/* Mobile Add Button */}
                              <Button
                                size="icon"
                                onClick={(e) => { e.preventDefault(); addToCart(product); }}
                                className="h-8 w-8 bg-violet-600 hover:bg-violet-700 text-white rounded-lg sm:hidden flex-shrink-0"
                              >
                                <ShoppingCart className="w-3.5 h-3.5" />
                              </Button>
                            </div>

                            {/* Desktop Add Button */}
                            <div className="hidden sm:block pt-3">
                              <Button
                                onClick={(e) => { e.preventDefault(); addToCart(product); }}
                                className="w-full h-9 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium"
                              >
                                Add to Cart
                              </Button>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      /* Standard List View (Desktop Only Tool) */
                      <>
                        <Link to={`/product/${product.id}`} className="block w-48 lg:w-64 flex-shrink-0 relative overflow-hidden bg-gray-50/50 p-3 flex items-center justify-center">
                          <img
                            src={getImageUrl(product.image || product.images?.[0])}
                            alt={product.name}
                            className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-110"
                          />
                          {product.discount > 10 && (
                            <span className="absolute top-3 left-3 bg-rose-500 text-white text-[11px] font-bold px-2 py-1 rounded-md shadow-md">
                              -{product.discount}% OFF
                            </span>
                          )}
                        </Link>
                        <div className="flex-1 p-6 flex flex-col justify-center">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold text-violet-600 uppercase tracking-widest">{product.category}</span>
                            <div className="flex items-center gap-1">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              <span className="text-sm font-bold">{product.rating}</span>
                            </div>
                          </div>
                          <Link to={`/product/${product.id}`}>
                            <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-violet-600 transition-colors">{product.name}</h3>
                          </Link>
                          <p className="text-gray-500 line-clamp-2 mb-4 text-sm">{product.description}</p>
                          <div className="flex items-center justify-between mt-auto">
                            <div className="flex items-baseline gap-3">
                              <span className="text-2xl font-black text-gray-900">₹{product.price.toLocaleString()}</span>
                              {product.originalPrice > product.price && (
                                <span className="text-sm text-gray-400 line-through">₹{product.originalPrice.toLocaleString()}</span>
                              )}
                            </div>
                            <div className="flex gap-3">
                              <Button
                                variant="outline"
                                onClick={() => isInWishlist(product.id) ? removeFromWishlist(product.id) : addToWishlist(product)}
                                className={`rounded-xl h-11 w-11 ${isInWishlist(product.id) ? 'bg-rose-50 border-rose-200 text-rose-500' : 'hover:border-violet-300 hover:text-violet-600'}`}
                              >
                                <Heart className={`w-5 h-5 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                              </Button>
                              <Button
                                onClick={() => addToCart(product)}
                                className="h-11 px-8 bg-violet-600 hover:bg-violet-700 text-white rounded-xl shadow-lg shadow-violet-100 active:scale-95 transition-all"
                              >
                                Add to Cart
                              </Button>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main >

      <Footer />
    </div >
  );
};

export default Shop;