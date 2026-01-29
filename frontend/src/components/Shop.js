import { useEffect, useState, useMemo } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { useAuth, useCart, useWishlist } from "../App";
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
import { ArrowRight } from "lucide-react";

// Individual Product Card Component for reuse
const ProductItem = ({
  product,
  viewMode,
  getImageUrl,
  addToCart,
  isInWishlist,
  addToWishlist,
  removeFromWishlist
}) => {
  return (
    <div className={`group bg-white overflow-hidden transition-all duration-200
        ${viewMode === "grid"
        ? "border border-gray-100 sm:border-gray-200 rounded-xl sm:rounded-lg hover:shadow-lg sm:hover:border-violet-200 flex sm:flex-col shadow-sm sm:shadow-none mx-2 sm:mx-0"
        : "border border-gray-200 rounded-xl flex"}`}>
      {viewMode === "grid" ? (
        <>
          <Link
            to={`/product/${product.id}`}
            className="w-[35%] sm:w-full flex-shrink-0 relative overflow-hidden bg-white p-3 sm:p-0 flex items-center justify-center"
          >
            <div className="aspect-square w-full relative">
              <img
                src={getImageUrl(product.image || product.images?.[0])}
                alt={product.name}
                className="w-full h-full object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
                onError={(e) => { e.target.src = '/assets/zlogo.png'; }}
              />
            </div>

            {/* Mobile-Only Deal Badge */}
            {product.discount > 40 && (
              <div className="absolute top-2 left-2 bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm z-10 uppercase sm:hidden">
                Deal
              </div>
            )}

            {/* Desktop-Only Discount Badge */}
            {product.discount > 10 && (
              <div className="absolute top-2 left-2 bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm z-10 hidden sm:block">
                -{product.discount}%
              </div>
            )}

            {/* Desktop Actions Overlay */}
            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-all duration-300 hidden sm:flex items-center justify-center gap-3">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  isInWishlist(product.id) ? removeFromWishlist(product.id) : addToWishlist(product);
                }}
                className={`w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 ${isInWishlist(product.id) ? 'text-rose-500' : 'text-gray-900 hover:text-rose-500'}`}
              >
                <Heart className={`w-5 h-5 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={(e) => { e.preventDefault(); addToCart(product); }}
                className="w-10 h-10 bg-violet-600 text-white rounded-full flex items-center justify-center shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:bg-violet-700"
              >
                <ShoppingCart className="w-5 h-5" />
              </button>
            </div>
          </Link>

          <div className="flex-1 p-3 sm:p-2 sm:pt-3 flex flex-col min-w-0">
            <span className="hidden sm:block text-[10px] text-violet-600 font-bold uppercase tracking-wider mb-0.5">{product.category}</span>
            <Link to={`/product/${product.id}`} className="block">
              <h3 className="text-[14px] sm:text-[13px] font-semibold text-gray-900 leading-snug mb-1 line-clamp-2 group-hover:text-violet-600 transition-colors">
                {product.name}
              </h3>
            </Link>

            {/* Mobile-Only Meta Info (Stars & Store) */}
            <div className="sm:hidden space-y-1 mb-2">
              <div className="flex items-center gap-1 text-[11px]">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-3 h-3 ${i < Math.floor(product.rating || 0) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                  ))}
                </div>
                <span className="text-gray-500">({product.reviews?.length || 0})</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-gray-500">
                <Store className="w-3 h-3" />
                <span className="truncate">{product.vendor_name}</span>
              </div>
            </div>

            <div className="mt-auto flex items-end justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-xl sm:text-base font-black text-gray-900">₹{product.price.toLocaleString()}</span>
                  {product.originalPrice > product.price && (
                    <span className="text-xs sm:text-[10px] text-gray-400 line-through">₹{product.originalPrice.toLocaleString()}</span>
                  )}
                </div>
                <p className={`text-[11px] sm:text-[10px] font-bold ${product.delivery_type === 'free' ? 'text-green-600' : 'text-gray-500'}`}>
                  {product.delivery_type === 'free' ? 'Free Delivery' : `+ ₹${product.delivery_charge}`}
                </p>
              </div>

              {/* Mobile-Only Add to Cart Button */}
              <Button
                size="icon"
                onClick={(e) => { e.preventDefault(); addToCart(product); }}
                className="h-9 w-9 bg-violet-600 hover:bg-violet-700 text-white rounded-lg sm:hidden flex-shrink-0 shadow-md active:scale-95 transition-all"
              >
                <ShoppingCart className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </>
      ) : (
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
  );
};

// Filter Content Component to be reused in Desktop Sidebar and Mobile Drawer
const FilterContent = ({
  filters,
  setFilters,
  activeFilterCount,
  clearFilters,
  products,
  filteredProducts,
  brands
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-2 border-b border-gray-100 lg:border-none">
        <h3 className="font-black text-gray-900 flex items-center gap-2 text-sm">
          <Filter className="w-4 h-4 text-violet-600" />
          Filters
        </h3>
        {activeFilterCount > 0 && (
          <button onClick={clearFilters} className="text-xs text-rose-500 font-bold hover:underline">Reset</button>
        )}
      </div>

      {/* Sub-Categories (Context Related) */}
      {filters.category && products.some(p => p.category === filters.category && p.sub_category) && (
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400">Sub-Category</h4>
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
            {[...new Set(products.filter(p => p.category === filters.category).map(p => p.sub_category).filter(Boolean))].map(sub => (
              <button
                key={sub}
                onClick={() => setFilters({ ...filters, subCategory: filters.subCategory === sub ? "" : sub })}
                className={`w-full text-left px-2 py-1.5 rounded-lg text-sm transition-all ${filters.subCategory === sub ? 'bg-violet-600 text-white font-bold shadow-sm' : 'text-gray-600 hover:bg-violet-50 hover:text-violet-600'}`}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Price Range */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400">Price</h4>
          <span className="text-[10px] font-black py-0.5 px-2 bg-violet-50 text-violet-600 rounded-full">₹{filters.priceRange[1].toLocaleString()}</span>
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
        <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400">Rating</h4>
        <div className="flex flex-wrap gap-2">
          {[4, 3, 2, 1].map((star) => (
            <button
              key={star}
              onClick={() => setFilters({ ...filters, rating: filters.rating === star ? 0 : star })}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition-all ${filters.rating === star ? 'bg-violet-600 border-violet-600 text-white shadow-md' : 'bg-white border-gray-200 text-gray-600 hover:border-violet-300 hover:text-violet-600'}`}
            >
              {star} <Star className={`w-3 h-3 ${filters.rating === star ? 'fill-white' : 'fill-current'}`} />
            </button>
          ))}
        </div>
      </div>

      {/* Brands */}
      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400">Brands</h4>
        <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
          {[...new Set(filteredProducts.map(p => p.brand).filter(Boolean))].map((brand) => (
            <label key={brand} className="flex items-center gap-2 group cursor-pointer">
              <Checkbox
                checked={filters.brands.includes(brand)}
                onCheckedChange={(checked) => {
                  setFilters(prev => ({
                    ...prev,
                    brands: checked ? [...prev.brands, brand] : prev.brands.filter(b => b !== brand)
                  }));
                }}
                className="border-gray-300 data-[state=checked]:bg-violet-600 data-[state=checked]:border-violet-600"
              />
              <span className="text-sm text-gray-600 group-hover:text-violet-600 transition-colors">{brand}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Colors (Dynamic Related) */}
      {filteredProducts.some(p => p.colors && p.colors.length > 0) && (
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400">Available Colors</h4>
          <div className="flex flex-wrap gap-2">
            {[...new Set(filteredProducts.flatMap(p => p.colors || []))].map(color => (
              <button
                key={color}
                onClick={() => {
                  setFilters(prev => ({
                    ...prev,
                    colors: prev.colors.includes(color) ? prev.colors.filter(c => c !== color) : [...prev.colors, color]
                  }));
                }}
                className={`h-8 px-3 rounded-xl text-[10px] font-black uppercase tracking-tighter border transition-all ${filters.colors.includes(color) ? 'bg-gray-900 text-white border-gray-900 shadow-lg scale-105' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-900'}`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Availability */}
      <div className="space-y-3 pt-2 border-t border-gray-100 pt-4">
        <label className="flex items-center justify-between cursor-pointer group">
          <span className="text-sm font-bold text-gray-700 group-hover:text-violet-600">In Stock Only</span>
          <Checkbox
            checked={filters.inStockOnly}
            onCheckedChange={(checked) => setFilters({ ...filters, inStockOnly: checked })}
            className="border-gray-300 data-[state=checked]:bg-violet-600 data-[state=checked]:border-violet-600"
          />
        </label>
      </div>
    </div>
  );
};

// Shop Page Component - Professional Violet Theme
const Shop = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [viewMode, setViewMode] = useState(window.innerWidth < 1024 ? "grid" : "list");

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [sortBy, setSortBy] = useState("featured");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: searchParams.get("category") || "",
    subCategory: "",
    priceRange: [0, 100000],
    rating: 0,
    brands: [],
    colors: [],
    inStockOnly: false,
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

  const { user } = useAuth();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const handleWishlistAction = (product) => {
    if (!user) {
      navigate('/login');
      return;
    }
    isInWishlist(product.id) ? removeFromWishlist(product.id) : addToWishlist(product);
  };

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
      const matchesColor = filters.colors.length === 0 || (product.colors && product.colors.some(c => filters.colors.includes(c)));
      const matchesStock = !filters.inStockOnly || product.stock > 0;
      const matchesVendor = !filters.vendor || product.vendor_id === filters.vendor;

      return matchesSearch && matchesCategory && matchesPrice && matchesRating && matchesBrand && matchesDiscount && matchesVendor && matchesColor && matchesStock;
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
    setFilters({
      category: "",
      subCategory: "",
      priceRange: [0, 100000],
      rating: 0,
      brands: [],
      colors: [],
      inStockOnly: false,
      discount: 0,
      vendor: ""
    });
    setSearchQuery("");
    setSearchParams({});
  };

  const activeFilterCount = [
    filters.category,
    filters.subCategory,
    filters.rating > 0,
    filters.priceRange[0] > 0 || filters.priceRange[1] < 100000,
    filters.brands.length > 0,
    filters.colors.length > 0,
    filters.inStockOnly,
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

          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className={`sticky top-16 z-20 transition-all duration-300 ${(filters.category || searchQuery || filters.vendor) ? 'bg-white border-b border-gray-200 shadow-sm sm:shadow-none' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-3">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3 flex-1">
              {/* Filter & Search (Only show if filtering/searching) */}
              {(filters.category || searchQuery || filters.vendor) && (
                <>
                  <Button
                    variant="outline"
                    className={`h-9 sm:h-10 px-3 sm:px-4 border-gray-300 rounded-lg sm:rounded-xl hover:border-violet-500 hover:text-violet-600 transition-all ${showFilters ? 'bg-violet-50 border-violet-500 text-violet-600' : ''}`}
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <SlidersHorizontal className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Filters</span>
                    {activeFilterCount > 0 && (
                      <span className="ml-1 sm:ml-2 w-4 h-4 sm:w-5 sm:h-5 bg-violet-600 text-white text-[10px] sm:text-xs rounded-full flex items-center justify-center">
                        {activeFilterCount}
                      </span>
                    )}
                  </Button>

                  <div className="relative flex-1 sm:flex-none">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
                    <Input
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 h-9 sm:h-10 w-full sm:w-72 bg-gray-50 border-gray-300 rounded-lg sm:rounded-xl focus:border-violet-500 focus:ring-violet-500"
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
                </>
              )}
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Sort (Only show if filtering/searching) */}
              {(filters.category || searchQuery || filters.vendor) && (
                <div className="flex items-center gap-2">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[110px] sm:w-[160px] h-9 sm:h-10 border-gray-300 rounded-lg sm:rounded-xl focus:ring-violet-500 text-xs sm:text-sm">
                      <SelectValue placeholder="Sort By" />
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
              )}

              {/* View Mode */}
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

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        {/* Mobile Filter Drawer Overlay */}
        <div className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${showFilters && (filters.category || searchQuery || filters.vendor) ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowFilters(false)} />
          <div className={`absolute left-0 top-0 bottom-0 w-[280px] bg-white shadow-2xl transition-transform duration-300 ${showFilters ? 'translate-x-0' : '-translate-x-full'} p-6 overflow-y-auto`}>
            <FilterContent
              filters={filters}
              setFilters={setFilters}
              activeFilterCount={activeFilterCount}
              clearFilters={clearFilters}
              products={products}
              filteredProducts={filteredProducts}
              brands={brands}
            />
            <Button
              className="w-full mt-8 bg-violet-600"
              onClick={() => setShowFilters(false)}
            >
              Apply Filters
            </Button>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Desktop Filters Sidebar */}
          {showFilters && (filters.category || searchQuery || filters.vendor) && (
            <aside className="w-64 flex-shrink-0 hidden lg:block">
              <div className="bg-white rounded-2xl border border-gray-200 p-5 sticky top-36">
                <FilterContent
                  filters={filters}
                  setFilters={setFilters}
                  activeFilterCount={activeFilterCount}
                  clearFilters={clearFilters}
                  products={products}
                  filteredProducts={filteredProducts}
                  brands={brands}
                />
              </div>
            </aside>
          )}

          {/* Products Main Content Area */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm">
                <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-gray-500 font-medium">Loading products...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-20 px-4 bg-white rounded-3xl border border-gray-100 shadow-sm text-center">
                <div className="bg-rose-50 rounded-full p-6 mb-6">
                  <AlertCircle className="w-12 h-12 text-rose-500" />
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-2">Something went wrong</h3>
                <p className="text-gray-500 mb-8 max-w-sm mx-auto text-sm leading-relaxed">
                  We ran into an issue while retrieving the products.
                </p>
                <Button onClick={() => window.location.reload()} className="bg-violet-600 hover:bg-violet-700">Retry Loading</Button>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-4 bg-white rounded-3xl border border-gray-100 shadow-sm text-center">
                <div className="w-24 h-24 bg-violet-50 rounded-2xl flex items-center justify-center mx-auto mb-8">
                  <Search className="w-12 h-12 text-violet-500" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-3">No results found</h3>
                <p className="text-gray-500 mb-8 max-w-sm mx-auto">Try adjusting your search or filters to see more options.</p>
                <Button onClick={clearFilters} className="bg-violet-600">Clear All Filters</Button>
              </div>
            ) : (
              /* Display Logic: Shelves (Discovery Mode) vs Grid (Search/Filter Mode) */
              (!filters.category && !searchQuery && !filters.vendor && activeFilterCount === 0) ? (
                <div className="space-y-16">
                  {[...new Set(products.map(p => p.category))].map((category) => {
                    const categoryProducts = products.filter(p => p.category === category).slice(0, 4);
                    if (categoryProducts.length === 0) return null;

                    return (
                      <div key={category} className="space-y-6">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-1.5 h-8 bg-violet-600 rounded-full" />
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase italic">{category}</h2>
                          </div>
                          <Button
                            variant="ghost"
                            onClick={() => setFilters({ ...filters, category: category })}
                            className="text-violet-600 hover:text-violet-700 font-black uppercase tracking-widest text-xs flex items-center gap-2 group hover:bg-violet-50 px-4 py-2 rounded-xl"
                          >
                            Explore All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                          {categoryProducts.map(product => (
                            <ProductItem
                              key={product.id}
                              product={product}
                              viewMode="grid"
                              getImageUrl={getImageUrl}
                              addToCart={addToCart}
                              isInWishlist={isInWishlist}
                              addToWishlist={handleWishlistAction}
                              removeFromWishlist={removeFromWishlist}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className={isMobile ? (viewMode === "grid" ? "grid grid-cols-1 gap-4" : "space-y-4") : "space-y-4"}>
                  {filteredProducts.map((product) => (
                    <ProductItem
                      key={product.id}
                      product={product}
                      viewMode={isMobile ? viewMode : "list"}
                      getImageUrl={getImageUrl}
                      addToCart={addToCart}
                      isInWishlist={isInWishlist}
                      addToWishlist={handleWishlistAction}
                      removeFromWishlist={removeFromWishlist}
                    />
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Shop;