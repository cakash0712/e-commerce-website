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
  Store
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
    rating: 0
  });

  // Update searchQuery when URL changes
  useEffect(() => {
    const urlSearch = searchParams.get("search");
    const urlCategory = searchParams.get("category");
    if (urlSearch) {
      setSearchQuery(urlSearch);
    }
    if (urlCategory) {
      setFilters(prev => ({ ...prev, category: urlCategory }));
    }
  }, [searchParams]);

  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
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
      return matchesSearch && matchesCategory && matchesPrice && matchesRating;
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
    setFilters({ category: "", subCategory: "", priceRange: [0, 100000], rating: 0 });
    setSearchQuery("");
  };

  const activeFilterCount = [
    filters.category,
    filters.subCategory,
    filters.rating > 0,
    filters.priceRange[0] > 0 || filters.priceRange[1] < 100000
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
              {filters.subCategory ? (
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
      <div className="bg-white border-b border-gray-200 sticky top-16 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Filter Toggle */}
              <Button
                variant="outline"
                className={`h-10 px-4 border-gray-300 hover:border-violet-500 hover:text-violet-600 ${showFilters ? 'bg-violet-50 border-violet-500 text-violet-600' : ''}`}
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="ml-2 w-5 h-5 bg-violet-600 text-white text-xs rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </Button>

              {/* Search */}
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-10 w-64 bg-gray-50 border-gray-300 focus:border-violet-500 focus:ring-violet-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Sort */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 hidden sm:block">Sort:</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[140px] h-10 border-gray-300 focus:ring-violet-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Top Rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* View Mode */}
              <div className="flex items-center border border-gray-300 rounded-lg p-1">
                <button
                  className={`p-1.5 rounded ${viewMode === "grid" ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-gray-600'}`}
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  className={`p-1.5 rounded ${viewMode === "list" ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-gray-600'}`}
                  onClick={() => setViewMode("list")}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <aside className={`${showFilters ? 'block' : 'hidden'} lg:block w-64 flex-shrink-0`}>
            <div className="bg-white rounded-lg border border-gray-200 p-5 sticky top-36 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900">Filters</h3>
                {activeFilterCount > 0 && (
                  <button onClick={clearFilters} className="text-sm text-violet-600 hover:underline">
                    Clear all
                  </button>
                )}
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
              <div className="text-center py-24 bg-white rounded-lg border border-gray-200">
                <p className="text-gray-900 font-medium mb-4">{error}</p>
                <Button onClick={() => window.location.reload()} className="bg-violet-600 hover:bg-violet-700 text-white">
                  Try Again
                </Button>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 px-6">
                <div className="max-w-lg w-full text-center">
                  <div className="relative inline-block mb-8">
                    <div className="w-24 h-24 bg-violet-50 rounded-full flex items-center justify-center mx-auto">
                      <Search className="w-12 h-12 text-violet-400" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                      <ShoppingBag className="w-4 h-4 text-amber-600" />
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-3">No products found</h3>
                  <p className="text-gray-600 mb-8 leading-relaxed">
                    We couldn't find any products matching your search. Try adjusting your filters or browse our popular categories.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
                    <Button onClick={clearFilters} className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-2.5 rounded-lg font-medium shadow-sm hover:shadow-md transition-all">
                      <SlidersHorizontal className="w-4 h-4 mr-2" />
                      Clear Filters
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => navigate('/categories')}
                      className="border-gray-300 hover:border-violet-300 hover:bg-violet-50 text-gray-700 px-6 py-2.5 rounded-lg font-medium"
                    >
                      <Grid3X3 className="w-4 h-4 mr-2" />
                      Browse Categories
                    </Button>
                  </div>

                  <div className="border-t border-gray-100 pt-8">
                    <p className="text-sm text-gray-500 mb-4 text-center">Popular searches:</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {['laptops', 'smartphones', 'fashion', 'home decor'].map((term) => (
                        <button
                          key={term}
                          onClick={() => setSearchQuery(term)}
                          className="px-3 py-1.5 bg-gray-100 hover:bg-violet-100 text-gray-600 hover:text-violet-700 rounded-full text-sm font-medium transition-colors"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className={viewMode === "grid"
                ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                : "space-y-4"
              }>
                {filteredProducts.map((product) => (
                  <div key={product.id} className={`group bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg hover:border-violet-200 transition-all ${viewMode === "list" ? "flex" : ""}`}>
                    {viewMode === "list" ? (
                      /* List View */
                      <>
                        <Link to={`/product/${product.id}`} className="block w-48 flex-shrink-0">
                          <div className="relative aspect-square bg-gray-50">
                            <img
                              src={getImageUrl(product.image)}
                              alt={product.name}
                              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                              onError={(e) => {
                                console.log('Image failed to load (list view):', e.target.src, 'for product:', product.name);
                                e.target.src = '/assets/zlogo.png'; // Fallback image
                              }}
                            />
                            {product.discount > 10 && (
                              <span className="absolute top-2 left-2 bg-rose-500 text-white text-xs font-bold px-2 py-1 rounded">
                                -{product.discount}%
                              </span>
                            )}
                            {product.offers && (
                              <span className={`absolute ${product.discount > 10 ? 'top-10' : 'top-2'} left-2 bg-violet-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg flex items-center gap-1`}>
                                <Zap className="w-3 h-3 fill-current" /> {product.offers}
                              </span>
                            )}
                          </div>
                        </Link>
                        <div className="flex-1 p-4 flex flex-col">
                          <span className="text-xs text-violet-600 font-medium capitalize mb-1">{product.category}</span>
                          <Link to={`/product/${product.id}`}>
                            <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-violet-600 transition-colors">{product.name}</h3>
                          </Link>
                          <div className="flex items-center gap-1 mb-2">
                            <Store className="w-3 h-3 text-gray-500" />
                            <span className="text-xs text-gray-600 font-medium">{product.vendor_name}</span>
                          </div>
                          <div className="flex items-center gap-1 mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-3 h-3 ${i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                            ))}
                            <span className="text-xs text-gray-500 ml-1">({product.reviews})</span>
                          </div>
                          <p className="text-sm text-gray-500 line-clamp-2 mb-3">{product.description}</p>
                          <div className="mt-auto flex items-center justify-between">
                            <div className="flex items-baseline gap-2">
                              <span className="text-xl font-bold text-gray-900">₹{product.price ? product.price.toLocaleString() : 'N/A'}</span>
                              {product.originalPrice && product.originalPrice > product.price && (
                                <span className="text-sm text-gray-400 line-through">₹{product.originalPrice.toLocaleString()}</span>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="icon"
                                variant="outline"
                                onClick={() => isInWishlist(product.id) ? removeFromWishlist(product.id) : addToWishlist(product)}
                                className={`h-9 w-9 rounded-lg border-gray-300 ${isInWishlist(product.id) ? 'border-rose-200 bg-rose-50 text-rose-500' : 'hover:border-violet-300 hover:text-violet-600'}`}
                              >
                                <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                              </Button>
                              <Button
                                onClick={() => addToCart(product)}
                                className="h-9 px-4 bg-violet-600 hover:bg-violet-700 text-white rounded-lg"
                              >
                                <ShoppingCart className="w-4 h-4 mr-2" /> Add
                              </Button>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      /* Grid View */
                      <>
                        <Link to={`/product/${product.id}`} className="block">
                          <div className="relative aspect-square bg-gray-50 overflow-hidden">
                            <img
                              src={getImageUrl(product.image)}
                              alt={product.name}
                              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                              onError={(e) => {
                                e.target.src = '/assets/zlogo.png'; // Fallback image
                              }}
                            />
                            {product.discount > 10 && (
                              <span className="absolute top-2 left-2 bg-rose-500 text-white text-xs font-bold px-2 py-1 rounded">
                                -{product.discount}%
                              </span>
                            )}
                            {product.offers && (
                              <span className={`absolute ${product.discount > 10 ? 'top-10' : 'top-2'} left-2 bg-violet-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg flex items-center gap-1`}>
                                <Zap className="w-3 h-3 fill-current" /> {product.offers}
                              </span>
                            )}
                            {/* Quick Actions */}
                            <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  isInWishlist(product.id) ? removeFromWishlist(product.id) : addToWishlist(product);
                                }}
                                className={`w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform ${isInWishlist(product.id) ? 'text-rose-500' : 'text-gray-600 hover:text-rose-500'}`}
                              >
                                <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                              </button>
                              <Link
                                to={`/product/${product.id}`}
                                className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md text-gray-600 hover:text-violet-600 hover:scale-110 transition-transform"
                              >
                                <Eye className="w-4 h-4" />
                              </Link>
                            </div>
                          </div>
                        </Link>
                        <div className="p-3 flex flex-col h-full">
                          <span className="text-xs text-violet-600 font-medium capitalize">{product.category}</span>
                          <Link to={`/product/${product.id}`}>
                            <h3 className="font-medium text-gray-900 line-clamp-2 mt-1 mb-2 text-sm group-hover:text-violet-600 transition-colors">
                              {product.name}
                            </h3>
                          </Link>
                          <div className="flex items-center gap-1 mb-2">
                            <Store className="w-3 h-3 text-gray-500" />
                            <span className="text-xs text-gray-600 font-medium">{product.vendor_name}</span>
                          </div>
                          <div className="flex items-center gap-1 mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-3 h-3 ${i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                            ))}
                            <span className="text-xs text-gray-500">({product.reviews})</span>
                          </div>
                          <div className="flex items-baseline gap-2 mb-1">
                            <span className="text-lg font-bold text-gray-900">₹{product.price ? product.price.toLocaleString() : 'N/A'}</span>
                            {product.originalPrice && product.originalPrice > product.price && (
                              <span className="text-sm text-gray-400 line-through">₹{product.originalPrice.toLocaleString()}</span>
                            )}
                          </div>
                          <p className="text-xs text-green-600 font-medium mb-3">Free delivery</p>
                          <Button
                            onClick={() => addToCart(product)}
                            className="w-full mt-auto h-9 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium"
                          >
                            Add to Cart
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
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