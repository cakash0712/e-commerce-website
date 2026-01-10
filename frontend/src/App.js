import { useEffect, useState, createContext, useContext } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import axios from "axios";
import Shop from "./components/Shop";
import Categories from "./components/Categories";
import Deals from "./components/Deals";
import About from "./components/About";
import Cart from "./components/Cart";
import Wishlist from "./components/Wishlist";
import Profile from "./components/Profile";
import Search from "./components/Search";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  ShoppingCart,
  Star,
  Truck,
  Shield,
  RotateCcw,
  Headphones,
  ChevronRight,
  Laptop,
  Watch,
  Shirt,
  Home as HomeIcon,
  Dumbbell,
  BookOpen,
  Sparkles,
  Heart,
  Menu,
  X,
  Search as SearchIcon,
  User,
  ArrowRight,
  Quote,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Cart Context
const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

// Wishlist Context
const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (product) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevItems, { ...product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (id) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      getCartTotal,
      getCartCount
    }}>
      {children}
    </CartContext.Provider>
  );
};

const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);

  const addToWishlist = (product) => {
    setWishlistItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      if (!existingItem) {
        return [...prevItems, product];
      }
      return prevItems;
    });
  };

  const removeFromWishlist = (id) => {
    setWishlistItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const isInWishlist = (id) => {
    return wishlistItems.some(item => item.id === id);
  };

  const getWishlistCount = () => {
    return wishlistItems.length;
  };

  return (
    <WishlistContext.Provider value={{
      wishlistItems,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      getWishlistCount
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

// Hero Section
const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-violet-900 via-indigo-900 to-purple-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-72 h-72 bg-violet-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 lg:py-40">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left space-y-8">
            <Badge className="bg-white/10 text-white border-white/20 px-4 py-1.5 text-sm">
              <Sparkles className="w-4 h-4 mr-2" />
              Summer Collection 2025
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight">
              Discover Your
              <span className="block bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent">
                Perfect Style
              </span>
            </h1>
            <p className="text-lg lg:text-xl text-white/70 max-w-xl mx-auto lg:mx-0">
              Explore thousands of premium products with exclusive deals,
              lightning-fast delivery, and unmatched customer service.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/shop">
                <Button
                  size="lg"
                  className="bg-white text-violet-900 hover:bg-white/90 px-8 py-6 text-lg group"
                  data-testid="shop-now-btn"
                >
                  Shop Now
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/categories">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 px-8 py-6 text-lg"
                  data-testid="explore-btn"
                >
                  Explore Collections
                </Button>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="flex items-center gap-8 justify-center lg:justify-start pt-8">
              <div className="text-center">
                <p className="text-3xl font-bold text-white">50K+</p>
                <p className="text-white/60 text-sm">Happy Customers</p>
              </div>
              <div className="w-px h-12 bg-white/20"></div>
              <div className="text-center">
                <p className="text-3xl font-bold text-white">10K+</p>
                <p className="text-white/60 text-sm">Products</p>
              </div>
              <div className="w-px h-12 bg-white/20"></div>
              <div className="text-center">
                <p className="text-3xl font-bold text-white">99%</p>
                <p className="text-white/60 text-sm">Satisfaction</p>
              </div>
            </div>
          </div>

          {/* Right Content - Hero Image */}
          <div className="relative hidden lg:block">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-3xl blur-2xl opacity-30"></div>
              <img
                src="https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=600&h=500&fit=crop"
                alt="Modern tech products"
                className="relative rounded-3xl shadow-2xl w-full h-[500px] object-cover"
              />
            </div>
            {/* Floating Cards */}
            <div className="absolute -left-8 top-20 bg-white rounded-2xl p-4 shadow-xl animate-bounce-slow">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Truck className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Free Shipping</p>
                  <p className="text-sm text-gray-500">On orders $50+</p>
                </div>
              </div>
            </div>
            <div className="absolute -right-4 bottom-20 bg-white rounded-2xl p-4 shadow-xl animate-bounce-slow delay-500">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-violet-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Secure Payment</p>
                  <p className="text-sm text-gray-500">100% Protected</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-8 h-12 border-2 border-white/30 rounded-full flex justify-center pt-2">
          <div className="w-1.5 h-3 bg-white/60 rounded-full animate-scroll"></div>
        </div>
      </div>
    </section>
  );
};

// Features Section
const FeaturesSection = () => {
  const features = [
    {
      icon: Truck,
      title: "Free Shipping",
      description: "Free shipping on all orders over $50",
      color: "bg-blue-500",
    },
    {
      icon: Shield,
      title: "Secure Payment",
      description: "100% secure payment processing",
      color: "bg-green-500",
    },
    {
      icon: RotateCcw,
      title: "Easy Returns",
      description: "30-day hassle-free return policy",
      color: "bg-amber-500",
    },
    {
      icon: Headphones,
      title: "24/7 Support",
      description: "Dedicated customer support team",
      color: "bg-violet-500",
    },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="border-0 shadow-sm hover:shadow-lg transition-all duration-300 group"
              data-testid={`feature-${index}`}
            >
              <CardContent className="p-6 text-center">
                <div
                  className={`w-14 h-14 ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}
                >
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-500">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

// Categories Section
const CategoriesSection = () => {
  const categories = [
    {
      name: "Electronics",
      icon: Laptop,
      count: 245,
      image:
        "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=400&h=300&fit=crop",
      color: "from-blue-600 to-indigo-600",
    },
    {
      name: "Fashion",
      icon: Shirt,
      count: 189,
      image:
        "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=300&fit=crop",
      color: "from-pink-600 to-rose-600",
    },
    {
      name: "Home & Garden",
      icon: HomeIcon,
      count: 156,
      image:
        "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400&h=300&fit=crop",
      color: "from-green-600 to-emerald-600",
    },
    {
      name: "Sports",
      icon: Dumbbell,
      count: 98,
      image:
        "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=300&fit=crop",
      color: "from-orange-600 to-amber-600",
    },
    {
      name: "Books",
      icon: BookOpen,
      count: 312,
      image:
        "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=300&fit=crop",
      color: "from-purple-600 to-violet-600",
    },
    {
      name: "Beauty",
      icon: Sparkles,
      count: 87,
      image:
        "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=300&fit=crop",
      color: "from-red-600 to-pink-600",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge className="mb-4">Categories</Badge>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Shop by Category
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore our diverse range of products across multiple categories
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category, index) => (
            <Link
              key={index}
              to={`/shop?category=${category.name.toLowerCase()}`}
              className="group"
              data-testid={`category-${category.name.toLowerCase()}`}
            >
              <Card className="overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 h-full">
                <div className="relative h-32 overflow-hidden">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div
                    className={`absolute inset-0 bg-gradient-to-t ${category.color} opacity-60 group-hover:opacity-70 transition-opacity`}
                  ></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <category.icon className="w-10 h-10 text-white" />
                  </div>
                </div>
                <CardContent className="p-4 text-center">
                  <h3 className="font-semibold text-gray-900 group-hover:text-violet-600 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-500">{category.count} items</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

// Featured Products Section
const FeaturedProductsSection = () => {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const products = [
    {
      id: 1,
      name: "Premium Wireless Headphones",
      price: 199.99,
      originalPrice: 249.99,
      image:
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
      rating: 4.5,
      reviews: 128,
      discount: 20,
      isNew: true,
    },
    {
      id: 2,
      name: "Smart Watch Pro",
      price: 299.99,
      originalPrice: 399.99,
      image:
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
      rating: 4.8,
      reviews: 89,
      discount: 25,
      isBestSeller: true,
    },
    {
      id: 3,
      name: "Gaming Laptop Ultra",
      price: 1299.99,
      originalPrice: 1499.99,
      image:
        "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop",
      rating: 4.6,
      reviews: 67,
      discount: 13,
    },
    {
      id: 4,
      name: "Wireless Earbuds Elite",
      price: 149.99,
      originalPrice: 199.99,
      image:
        "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=400&fit=crop",
      rating: 4.3,
      reviews: 203,
      discount: 25,
      isNew: true,
    },
  ];

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
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
          <div>
            <Badge className="mb-4">Featured</Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Trending Products
            </h2>
            <p className="text-gray-600 max-w-xl">
              Discover our most popular and highly-rated products loved by
              thousands of customers
            </p>
          </div>
          <Link
            to="/shop"
            className="mt-6 md:mt-0 inline-flex items-center text-violet-600 hover:text-violet-700 font-medium group"
          >
            View All Products
            <ChevronRight className="ml-1 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card
              key={product.id}
              className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300"
              data-testid={`product-${product.id}`}
            >
              <div className="relative overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
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
              <CardContent className="p-5">
                <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-violet-600 transition-colors line-clamp-1">
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
    </section>
  );
};

// Promo Banner Section
const PromoBannerSection = () => {
  return (
    <section className="py-20 bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <Badge className="bg-white/20 text-white border-white/30 mb-6">
              Limited Time Offer
            </Badge>
            <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
              Summer Sale
              <span className="block text-amber-300">Up to 50% Off</span>
            </h2>
            <p className="text-white/80 text-lg mb-8 max-w-lg mx-auto lg:mx-0">
              Do not miss out on our biggest sale of the season. Get exclusive
              deals on thousands of products.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/deals">
                <Button
                  size="lg"
                  className="bg-white text-violet-700 hover:bg-white/90 px-8"
                  data-testid="shop-sale-btn"
                >
                  Shop the Sale
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>

            {/* Countdown Timer (Static for demo) */}
            <div className="flex justify-center lg:justify-start gap-4 mt-8">
              {[
                { value: "12", label: "Days" },
                { value: "08", label: "Hours" },
                { value: "45", label: "Mins" },
                { value: "30", label: "Secs" },
              ].map((item, index) => (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-sm rounded-lg p-3 min-w-[70px]"
                >
                  <p className="text-2xl font-bold text-white">{item.value}</p>
                  <p className="text-xs text-white/70">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="hidden lg:block">
            <img
              src="https://images.unsplash.com/photo-1524289286702-f07229da36f5?w=600&h=400&fit=crop"
              alt="Sale products"
              className="rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

// Testimonials Section
const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Verified Buyer",
      rating: 5,
      text: "Absolutely love shopping here! The product quality is exceptional and the delivery was faster than expected. Will definitely be a returning customer!",
      location: "New York, NY",
      avatar: "SJ",
    },
    {
      name: "Michael Chen",
      role: "Premium Member",
      rating: 5,
      text: "The best online shopping experience I've ever had. Great prices, easy navigation, and the customer service team is incredibly helpful.",
      location: "Los Angeles, CA",
      avatar: "MC",
    },
    {
      name: "Emily Davis",
      role: "Verified Buyer",
      rating: 5,
      text: "I was skeptical at first, but after my first purchase, I'm completely sold. The quality exceeded my expectations and the returns process is hassle-free.",
      location: "Chicago, IL",
      avatar: "ED",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge className="mb-4">Testimonials</Badge>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            What Our Customers Say
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Join thousands of satisfied customers who love shopping with us
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="border-0 shadow-lg hover:shadow-xl transition-shadow"
              data-testid={`testimonial-${index}`}
            >
              <CardContent className="p-6">
                <Quote className="w-10 h-10 text-violet-200 mb-4" />
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  &ldquo;{testimonial.text}&rdquo;
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                    <p className="text-xs text-gray-400">
                      {testimonial.location}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

// Newsletter Section
const NewsletterSection = () => {
  return (
    <section className="py-20 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-3xl p-8 lg:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>

          <div className="relative text-center max-w-2xl mx-auto">
            <Mail className="w-12 h-12 text-white/80 mx-auto mb-6" />
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Stay in the Loop
            </h2>
            <p className="text-white/80 mb-8">
              Subscribe to our newsletter and be the first to know about
              exclusive deals, new arrivals, and special offers.
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/20"
                data-testid="newsletter-email"
              />
              <Button
                type="submit"
                className="bg-white text-violet-700 hover:bg-white/90 px-8"
                data-testid="newsletter-submit"
              >
                Subscribe
              </Button>
            </form>
            <p className="text-white/60 text-sm mt-4">
              No spam, unsubscribe at any time.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

// Home Page Component
const Home = () => {
  const helloWorldApi = async () => {
    try {
      const response = await axios.get(`${API}/`);
      console.log(response.data.message);
    } catch (e) {
      console.error(e, `errored out requesting / api`);
    }
  };

  useEffect(() => {
    helloWorldApi();
  }, []);

  return (
    <div className="min-h-screen">
      <Navigation />
      <HeroSection />
      <FeaturesSection />
      <CategoriesSection />
      <FeaturedProductsSection />
      <PromoBannerSection />
      <TestimonialsSection />
      <NewsletterSection />
      <Footer />
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <CartProvider>
        <WishlistProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/deals" element={<Deals />} />
              <Route path="/about" element={<About />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/search" element={<Search />} />
              <Route path="*" element={<Home />} />
            </Routes>
          </BrowserRouter>
        </WishlistProvider>
      </CartProvider>
    </div>
  );
}

export default App;
