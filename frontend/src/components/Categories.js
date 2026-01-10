import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useCart } from "../App";
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
  Laptop,
  Watch,
  Shirt,
  Home as HomeIcon,
  Dumbbell,
  BookOpen,
  Sparkles,
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
  const cartCount = getCartCount();

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

// Categories Page Component
const Categories = () => {
  const categories = [
    {
      name: "Electronics",
      icon: Laptop,
      count: 245,
      image: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=400&h=300&fit=crop",
      color: "from-blue-600 to-indigo-600",
      description: "Latest gadgets and tech accessories",
    },
    {
      name: "Fashion",
      icon: Shirt,
      count: 189,
      image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=300&fit=crop",
      color: "from-pink-600 to-rose-600",
      description: "Trendy clothing and accessories",
    },
    {
      name: "Home & Garden",
      icon: HomeIcon,
      count: 156,
      image: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400&h=300&fit=crop",
      color: "from-green-600 to-emerald-600",
      description: "Everything for your home and garden",
    },
    {
      name: "Sports",
      icon: Dumbbell,
      count: 98,
      image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=300&fit=crop",
      color: "from-orange-600 to-amber-600",
      description: "Sports equipment and fitness gear",
    },
    {
      name: "Books",
      icon: BookOpen,
      count: 312,
      image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=300&fit=crop",
      color: "from-purple-600 to-violet-600",
      description: "Wide selection of books and literature",
    },
    {
      name: "Beauty",
      icon: Sparkles,
      count: 87,
      image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=300&fit=crop",
      color: "from-red-600 to-pink-600",
      description: "Beauty products and cosmetics",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      {/* Categories Header */}
      <section className="pt-24 pb-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge className="mb-4">Categories</Badge>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Shop by Category
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore our diverse range of products across multiple categories.
              Find exactly what you're looking for with our organized shopping experience.
            </p>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category, index) => (
              <Link
                key={index}
                to={`/shop?category=${category.name.toLowerCase()}`}
                className="group"
              >
                <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-full">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div
                      className={`absolute inset-0 bg-gradient-to-t ${category.color} opacity-60 group-hover:opacity-70 transition-opacity`}
                    ></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <category.icon className="w-16 h-16 text-white" />
                    </div>
                  </div>
                  <CardContent className="p-6 text-center">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-violet-600 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-gray-600 mb-3">{category.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        {category.count} products
                      </span>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-violet-600 group-hover:translate-x-1 transition-all" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Can't Find What You're Looking For?
          </h2>
          <p className="text-white/80 mb-8 max-w-2xl mx-auto">
            Browse our complete shop or search for specific products using our advanced search filters.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/shop">
              <Button size="lg" className="bg-white text-violet-700 hover:bg-white/90">
                Browse All Products
              </Button>
            </Link>
            <Link to="/search">
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                Advanced Search
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Categories;