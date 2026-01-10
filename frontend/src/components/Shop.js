import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { useCart, useWishlist } from "../App";
import { useWishlist as useWishlistContext } from "../App";
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
  Menu,
  X,
  User,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";

// Import Navigation and Footer from App.js or create shared components
// For now, duplicate Navigation and Footer here

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Navigation Component (duplicated from App.js)
const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { getCartCount } = useCart();
  const { getWishlistCount } = useWishlist();
  const cartCount = getCartCount();
  const wishlistCount = getWishlistCount();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 bg-gray-50/95 backdrop-blur-md shadow-lg border-b border-gray-200 transition-all duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">
              ShopVerse
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {["Home", "Shop", "Categories", "Deals", "About"].map((item) => (
              <Link
                key={item}
                to={item === "Home" ? "/" : `/${item.toLowerCase()}`}
                className="text-sm font-medium text-gray-700 transition-colors hover:text-violet-600"
              >
                {item}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center space-x-4">
            <Link to="/search">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-700 hover:bg-gray-100"
              >
                <Search className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/wishlist">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-700 hover:bg-gray-100"
              >
                <Heart className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/cart">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-700 hover:bg-gray-100 relative"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-violet-600 text-white text-xs rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>
            <Link to="/profile">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-700 hover:bg-gray-100"
              >
                <User className="w-5 h-5" />
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-gray-700 hover:bg-gray-100"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t">
          <div className="px-4 py-4 space-y-3">
            {["Home", "Shop", "Categories", "Deals", "About"].map((item) => (
              <Link
                key={item}
                to={item === "Home" ? "/" : `/${item.toLowerCase()}`}
                className="block py-2 text-gray-700 hover:text-violet-600"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item}
              </Link>
            ))}
            <div className="border-t pt-3 mt-3 space-y-3">
              <Link
                to="/search"
                className="flex items-center gap-2 py-2 text-gray-700 hover:text-violet-600"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Search className="w-4 h-4" />
                Search
              </Link>
              <Link
                to="/wishlist"
                className="flex items-center gap-2 py-2 text-gray-700 hover:text-violet-600"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Heart className="w-4 h-4" />
                Wishlist
              </Link>
              <Link
                to="/cart"
                className="flex items-center gap-2 py-2 text-gray-700 hover:text-violet-600 relative"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <ShoppingCart className="w-4 h-4" />
                Cart
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-violet-600 text-white text-xs rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
              <Link
                to="/profile"
                className="flex items-center gap-2 py-2 text-gray-700 hover:text-violet-600"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <User className="w-4 h-4" />
                Profile
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

// Footer Component (duplicated from App.js)
const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-xl flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">ShopVerse</span>
            </Link>
            <p className="text-gray-400 mb-6">
              Your one-stop destination for premium products at unbeatable
              prices.
            </p>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-white"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                </svg>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-white"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-white"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                </svg>
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-3">
              {["Home", "Shop", "Categories", "Deals", "About Us"].map(
                (link) => (
                  <li key={link}>
                    <Link
                      to={`/${link.toLowerCase().replace(" ", "-")}`}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {link}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="font-semibold mb-4">Customer Service</h3>
            <ul className="space-y-3">
              {[
                "Contact Us",
                "FAQs",
                "Shipping Info",
                "Returns & Exchanges",
                "Track Order",
              ].map((link) => (
                <li key={link}>
                  <Link
                    to="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-gray-400">
                <MapPin className="w-5 h-5" />
                <span>123 Commerce St, New York, NY</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400">
                <Phone className="w-5 h-5" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400">
                <Mail className="w-5 h-5" />
                <span>support@shopverse.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            © 2025 ShopVerse. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link to="#" className="text-gray-400 hover:text-white text-sm">
              Privacy Policy
            </Link>
            <Link to="#" className="text-gray-400 hover:text-white text-sm">
              Terms of Service
            </Link>
            <Link to="#" className="text-gray-400 hover:text-white text-sm">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Shop Page Component
const Shop = () => {
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("featured");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: "",
    priceRange: [0, 2000],
    rating: 0
  });
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  // Sample products data (can be fetched from API later)
  const products = [
    {
      id: 1,
      name: "Premium Wireless Headphones",
      price: 199.99,
      originalPrice: 249.99,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
      rating: 4.5,
      reviews: 128,
      discount: 20,
      isNew: true,
      category: "Electronics",
    },
    {
      id: 2,
      name: "Smart Watch Pro",
      price: 299.99,
      originalPrice: 399.99,
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
      rating: 4.8,
      reviews: 89,
      discount: 25,
      isBestSeller: true,
      category: "Electronics",
    },
    {
      id: 3,
      name: "Gaming Laptop Ultra",
      price: 1299.99,
      originalPrice: 1499.99,
      image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop",
      rating: 4.6,
      reviews: 67,
      discount: 13,
      category: "Electronics",
    },
    {
      id: 4,
      name: "Wireless Earbuds Elite",
      price: 149.99,
      originalPrice: 199.99,
      image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=400&fit=crop",
      rating: 4.3,
      reviews: 203,
      discount: 25,
      isNew: true,
      category: "Electronics",
    },
    {
      id: 5,
      name: "Classic Denim Jacket",
      price: 89.99,
      originalPrice: 119.99,
      image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop",
      rating: 4.4,
      reviews: 156,
      discount: 25,
      category: "Fashion",
    },
    {
      id: 6,
      name: "Running Shoes Pro",
      price: 129.99,
      originalPrice: 159.99,
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
      rating: 4.7,
      reviews: 89,
      discount: 19,
      category: "Sports",
    },
  ];

  // Filter and sort products
  const getFilteredProducts = () => {
    let filtered = products.filter(product => {
      // Search filter
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.category.toLowerCase().includes(searchQuery.toLowerCase());

      // Category filter
      const matchesCategory = !filters.category || product.category === filters.category;

      // Price filter
      const matchesPrice = product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1];

      // Rating filter
      const matchesRating = filters.rating === 0 || product.rating >= filters.rating;

      return matchesSearch && matchesCategory && matchesPrice && matchesRating;
    });

    // Apply sorting
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        filtered.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      default:
        // featured - keep original order
        break;
    }

    return filtered;
  };

  const filteredProducts = getFilteredProducts();

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
      );
    }
    if (hasHalfStar) {
      stars.push(
        <Star
          key="half"
          className="w-4 h-4 fill-amber-400/50 text-amber-400"
        />
      );
    }
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />
      );
    }
    return stars;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      {/* Shop Header */}
      <section className="pt-24 pb-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                Shop All Products
              </h1>
              <p className="text-gray-600">
                Discover our complete collection of premium products
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                {filteredProducts.length} products {searchQuery && `for "${searchQuery}"`}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Filters and Sort */}
      <section className="py-6 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search products..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className={`hidden lg:flex ${showFilters ? "bg-violet-50 border-violet-200" : ""}`}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
                {showFilters && <span className="ml-1">×</span>}
              </Button>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest</option>
              </select>

              {/* View Mode */}
              <div className="flex border border-gray-300 rounded-md">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-r-none"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-l-none"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            {/* Filter Sidebar */}
            {showFilters && (
              <div className="hidden lg:block w-64 flex-shrink-0">
                <Card className="p-6 sticky top-24">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Filters
                  </h3>

                  {/* Category Filter */}
                  <div className="mb-6">
                    <Label className="font-medium mb-3 block">Category</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="all-categories"
                          checked={!filters.category}
                          onCheckedChange={() => setFilters({...filters, category: ""})}
                        />
                        <label htmlFor="all-categories" className="text-sm">All Categories</label>
                      </div>
                      {["Electronics", "Fashion", "Sports"].map(cat => (
                        <div key={cat} className="flex items-center space-x-2">
                          <Checkbox
                            id={cat}
                            checked={filters.category === cat}
                            onCheckedChange={(checked) => setFilters({...filters, category: checked ? cat : ""})}
                          />
                          <label htmlFor={cat} className="text-sm">{cat}</label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div className="mb-6">
                    <Label className="font-medium mb-3 block">Price Range</Label>
                    <div className="px-2">
                      <Slider
                        value={filters.priceRange}
                        onValueChange={(value) => setFilters({...filters, priceRange: value})}
                        max={2000}
                        min={0}
                        step={10}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-gray-600 mt-2">
                        <span>${filters.priceRange[0]}</span>
                        <span>${filters.priceRange[1]}</span>
                      </div>
                    </div>
                  </div>

                  {/* Rating Filter */}
                  <div className="mb-6">
                    <Label className="font-medium mb-3 block">Minimum Rating</Label>
                    <Select value={filters.rating.toString()} onValueChange={(value) => setFilters({...filters, rating: parseFloat(value)})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Any Rating</SelectItem>
                        <SelectItem value="3">3+ Stars</SelectItem>
                        <SelectItem value="4">4+ Stars</SelectItem>
                        <SelectItem value="4.5">4.5+ Stars</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => setFilters({ category: "", priceRange: [0, 2000], rating: 0 })}
                    className="w-full"
                  >
                    Clear Filters
                  </Button>
                </Card>
              </div>
            )}

            {/* Products */}
            <div className="flex-1">
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    : "space-y-6"
                }
              >
            {filteredProducts.map((product) => (
              <Card
                key={product.id}
                className={`group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 ${
                  viewMode === "list" ? "flex" : ""
                }`}
              >
                <div
                  className={`relative overflow-hidden ${
                    viewMode === "list" ? "w-48 flex-shrink-0" : ""
                  }`}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className={`w-full object-cover group-hover:scale-105 transition-transform duration-500 ${
                      viewMode === "list" ? "h-48" : "h-64"
                    }`}
                  />
                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {product.discount && (
                      <Badge className="bg-red-500 hover:bg-red-500">
                        -{product.discount}%
                      </Badge>
                    )}
                    {product.isNew && (
                      <Badge className="bg-green-500 hover:bg-green-500">
                        New
                      </Badge>
                    )}
                    {product.isBestSeller && (
                      <Badge className="bg-amber-500 hover:bg-amber-500">
                        Best Seller
                      </Badge>
                    )}
                  </div>
                  {/* Quick Actions */}
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="icon"
                      variant="secondary"
                      className={`rounded-full bg-white/90 hover:bg-white ${isInWishlist(product.id) ? 'text-red-500' : ''}`}
                      onClick={() => isInWishlist(product.id) ? removeFromWishlist(product.id) : addToWishlist(product)}
                    >
                      <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                    </Button>
                  </div>
                </div>
                <CardContent
                  className={`p-5 ${viewMode === "list" ? "flex-1" : ""}`}
                >
                  <div className="mb-2">
                    <Badge variant="secondary" className="text-xs">
                      {product.category}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-violet-600 transition-colors line-clamp-2">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex">{renderStars(product.rating)}</div>
                    <span className="text-sm text-gray-500">
                      ({product.reviews})
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-gray-900">
                        ${product.price}
                      </span>
                      {product.originalPrice && (
                        <span className="text-sm text-gray-400 line-through">
                          ${product.originalPrice}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    className="w-full mt-4 bg-violet-600 hover:bg-violet-700"
                    onClick={() => addToCart(product)}
                    data-testid={`add-to-cart-${product.id}`}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add to Cart
                  </Button>
                </CardContent>
              </Card>
            ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Shop;