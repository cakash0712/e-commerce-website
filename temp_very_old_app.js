import { useEffect, useState, createContext, useContext } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from "react-router-dom";
import axios from "axios";
import { HelmetProvider, Helmet } from 'react-helmet-async';
import Shop from "./components/Shop";
import Categories from "./components/Categories";
import Deals from "./components/Deals";
import About from "./components/About";
import Cart from "./components/Cart";
import Wishlist from "./components/Wishlist";
import Profile from "./components/Profile";
import Admin from "./components/Admin";
import Vendor from "./components/Vendor";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";
import Payment from "./components/Payment";
import Contact from "./components/Contact";
import FAQ from "./components/FAQ";
import ShippingInfo from "./components/ShippingInfo";
import Returns from "./components/Returns";
import TrackOrder from "./components/TrackOrder";
import PrivacyPolicy from "./components/PrivacyPolicy";
import TermsOfService from "./components/TermsOfService";
import Cookies from "./components/Cookies";
import DetailsView from "./components/DetailsView";
import Auth from "./components/Auth";
import AdminLogin from "./components/AdminLogin";
import VendorLogin from "./components/VendorLogin";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
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
  CreditCard,
} from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Scroll to Top Component
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// Auth Context
const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user_data');
      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          // Configure axios for authenticated requests
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } catch (e) {
          localStorage.removeItem('token');
          localStorage.removeItem('user_data');
        }
      }
      setLoading(false);
    };

    // Axios Security Interceptor
    const interceptor = axios.interceptors.response.use(
      response => response,
      error => {
        if (error.response && [401, 403].includes(error.response.status)) {
          // Force logout on security breach or expiration
          logout();
          window.location.href = '/auth';
        }
        return Promise.reject(error);
      }
    );

    checkAuth();
    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  const login = async (identifier, password, userType = "user") => {
    try {
      const response = await axios.post(`${API}/users/login`, {
        identifier,
        password,
        user_type: userType
      });
      const userData = response.data;
      const { token, ...data } = userData;

      localStorage.setItem('token', token);
      localStorage.setItem('user_data', JSON.stringify(data));

      // Update default headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      setUser(data);
      return data;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post(`${API}/users/signup`, {
        ...userData,
        avatar: userData.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=John'
      });
      return response.data;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_data');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const updateUser = async (userId, updates) => {
    try {
      await axios.put(`${API}/users/${userId}`, updates);
    } catch (error) {
      console.error('Backend update failed, updating locally only:', error);
    }

    // Always update local state and storage
    setUser(prev => {
      const updatedUser = { ...prev, ...updates };
      localStorage.setItem('user_data', JSON.stringify(updatedUser));
      return updatedUser;
    });
    return updates;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, updateUser, loading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

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
// Coupon Context
const CouponContext = createContext();

export const useCoupons = () => {
  const context = useContext(CouponContext);
  if (!context) {
    throw new Error('useCoupons must be used within a CouponProvider');
  }
  return context;
};

const CouponProvider = ({ children }) => {
  const [availableCoupons, setAvailableCoupons] = useState([
    { id: 1, code: 'ZIPPY20', value: 20, type: 'percentage', target: 'global', minOrder: 1000, expiry: '2026-12-31', limit: 100, used: 45 },
    { id: 2, code: 'TECH500', value: 500, type: 'fixed', target: 'category', category: 'electronics', minOrder: 5000, expiry: '2026-02-15', limit: 50, used: 12 },
    { id: 3, code: 'VEND99', value: 15, type: 'percentage', target: 'vendor', vendorId: 'Global Partners', minOrder: 0, expiry: '2026-06-01', limit: 200, used: 8 },
  ]);

  const validateCoupon = (code, cartItems, subtotal) => {
    const coupon = availableCoupons.find(c => c.code.toUpperCase() === code.toUpperCase());

    if (!coupon) return { valid: false, message: 'Invalid protocol identifier.' };

    if (new Date(coupon.expiry) < new Date()) {
      return { valid: false, message: 'Coupon protocol has expired.' };
    }

    if (coupon.used >= coupon.limit) {
      return { valid: false, message: 'Usage threshold exceeded.' };
    }

    if (subtotal < coupon.minOrder) {
      return { valid: false, message: `Minimum commitment of Γé╣${coupon.minOrder} required.` };
    }

    if (coupon.target === 'category') {
      const hasCategoryItem = cartItems.some(item => item.category?.toLowerCase() === coupon.category.toLowerCase());
      if (!hasCategoryItem) return { valid: false, message: `Only valid for ${coupon.category} inventory.` };
    }

    if (coupon.target === 'vendor') {
      const hasVendorItem = cartItems.some(item => item.vendor === coupon.vendorId);
      if (!hasVendorItem) return { valid: false, message: `Valid only for ${coupon.vendorId} assets.` };
    }

    return { valid: true, coupon };
  };

  return (
    <CouponContext.Provider value={{ availableCoupons, validateCoupon }}>
      {children}
    </CouponContext.Provider>
  );
};// Orders Context
const OrderContext = createContext();

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};

const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem('ZippyCart_cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('ZippyCart_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + (product.quantity || 1) }
            : item
        );
      } else {
        return [...prevItems, { ...product, quantity: product.quantity || 1 }];
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

const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState(() => {
    const savedOrders = localStorage.getItem('orders');
    return savedOrders ? JSON.parse(savedOrders) : [];
  });

  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders));
  }, [orders]);

  const addOrder = (order) => {
    setOrders(prevOrders => [order, ...prevOrders]);
  };

  const getRecentOrders = (limit = 5) => {
    return orders.slice(0, limit);
  };

  return (
    <OrderContext.Provider value={{
      orders,
      addOrder,
      getRecentOrders
    }}>
      {children}
    </OrderContext.Provider>
  );
};

// Hero Section
const HeroSection = () => {
  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-gradient-to-br from-violet-950 via-indigo-950 to-purple-950">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-96 h-96 bg-violet-600 rounded-full mix-blend-multiply filter blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-[120px] animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-[120px] animate-pulse delay-500"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left space-y-10">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md text-white border border-white/20 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest shadow-2xl">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Next Gen E-Commerce Platform
            </div>

            <div className="space-y-4">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black text-white leading-[0.9] tracking-tighter">
                Premium Choice.<br />
                <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-amber-400 bg-clip-text text-transparent">
                  Smart Price.
                </span>
              </h1>
              <p className="text-xl lg:text-2xl text-white/60 max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed">
                Experience the future of shopping. <br className="hidden lg:block" />
                <span className="text-white font-bold tracking-tight">Fast ΓÇó Secure ΓÇó Affordable</span>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start">
              <Link to="/shop">
                <Button
                  size="lg"
                  className="bg-white text-violet-950 hover:bg-violet-50 px-10 py-8 text-xl font-black rounded-2xl group shadow-2xl shadow-violet-900/40"
                >
                  Shop Now
                  <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/categories">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 px-10 py-8 text-xl font-bold rounded-2xl backdrop-blur-sm"
                >
                  View Categories
                </Button>
              </Link>
            </div>

            {/* Value Props Row */}
            <div className="flex flex-wrap items-center gap-10 justify-center lg:justify-start pt-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                  <Truck className="w-6 h-6 text-violet-400" />
                </div>
                <div>
                  <p className="text-white font-black text-lg leading-none">Fast</p>
                  <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest mt-1">Delivery</p>
                </div>
              </div>
              <div className="w-px h-10 bg-white/10 hidden sm:block"></div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                  <Shield className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <p className="text-white font-black text-lg leading-none">Secure</p>
                  <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest mt-1">Payments</p>
                </div>
              </div>
              <div className="w-px h-10 bg-white/10 hidden sm:block"></div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                  <CreditCard className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <p className="text-white font-black text-lg leading-none">Best Price</p>
                  <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest mt-1">Guaranteed</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Hero Image Slider */}
          <div className="relative hidden lg:block">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-3xl blur-2xl opacity-30"></div>
              <Carousel className="relative rounded-3xl shadow-2xl w-full h-[400px] overflow-hidden">
                <CarouselContent>
                  <CarouselItem>
                    <img
                      src="https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=600&h=400&fit=crop"
                      alt="Modern tech products"
                      className="w-full h-[400px] object-cover"
                    />
                  </CarouselItem>
                  <CarouselItem>
                    <img
                      src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=400&fit=crop"
                      alt="Premium watches"
                      className="w-full h-[400px] object-cover"
                    />
                  </CarouselItem>
                  <CarouselItem>
                    <img
                      src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=400&fit=crop"
                      alt="Audio equipment"
                      className="w-full h-[400px] object-cover"
                      loading="lazy"
                    />
                  </CarouselItem>
                  <CarouselItem>
                    <img
                      src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&h=400&fit=crop"
                      alt="Fashion items"
                      className="w-full h-[400px] object-cover"
                      loading="lazy"
                    />
                  </CarouselItem>
                </CarouselContent>
                <CarouselPrevious className="left-4" />
                <CarouselNext className="right-4" />
              </Carousel>
            </div>
            {/* Floating Cards */}
            <div className="absolute -left-8 top-20 bg-white rounded-2xl p-4 shadow-xl animate-bounce-slow">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Truck className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Free Shipping</p>
                  <p className="text-sm text-gray-500">On orders Γé╣500+</p>
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

// Featured Categories Section
const FeaturedCategoriesSection = () => {
  const categories = [
    { name: "Electronics", icon: Laptop, color: "bg-blue-500", link: "/shop?category=electronics" },
    { name: "Fashion", icon: Shirt, color: "bg-pink-500", link: "/shop?category=fashion" },
    { name: "Accessories", icon: Watch, color: "bg-amber-500", link: "/shop?category=accessories" },
    { name: "Home & Decor", icon: HomeIcon, color: "bg-emerald-500", link: "/shop?category=home-decoration" },
    { name: "Sports", icon: Dumbbell, color: "bg-violet-500", link: "/shop?category=sports" },
    { name: "Books", icon: BookOpen, color: "bg-rose-500", link: "/shop?category=books" },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-16 gap-6">
          <div className="space-y-4">
            <Badge className="bg-violet-100 text-violet-600 border-none font-bold uppercase tracking-widest px-4 py-1">Explore</Badge>
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 tracking-tight">Featured Categories</h2>
            <p className="text-gray-500 max-w-2xl text-lg">Browse our wide range of categories and find exactly what you're looking for.</p>
          </div>
          <Link to="/categories">
            <Button className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold px-8 h-12 shadow-lg shadow-violet-200">
              View All Categories
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {categories.map((cat, i) => (
            <Link key={i} to={cat.link} className="group">
              <div className="flex flex-col items-center p-8 rounded-[2rem] bg-gray-50 border-2 border-transparent transition-all duration-500 group-hover:bg-white group-hover:border-violet-100 group-hover:shadow-2xl group-hover:-translate-y-2">
                <div className={`w-20 h-20 ${cat.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:rotate-6 transition-transform duration-500`}>
                  <cat.icon className="w-10 h-10 text-white" />
                </div>
                <h3 className="font-black text-gray-900 text-center group-hover:text-violet-600 transition-colors uppercase tracking-tighter">{cat.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

// Flash Deals Section
const FlashDealsSection = () => {
  const { addToCart } = useCart();
  const [deals, setDeals] = useState([]);
  const [timeLeft, setTimeLeft] = useState({ h: 12, m: 45, s: 30 });

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const response = await axios.get('https://dummyjson.com/products?limit=4&skip=20');
        setDeals(response.data.products.map(p => ({
          ...p,
          discountPrice: Math.round(p.price * 83),
          originalPrice: Math.round(p.price * 83 * 1.5),
          rating: p.rating,
          reviews: Math.floor(Math.random() * 200) + 50
        })));
      } catch (e) {
        console.error(e);
      }
    };
    fetchDeals();

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.s > 0) return { ...prev, s: prev.s - 1 };
        if (prev.m > 0) return { ...prev, m: 59, s: 59, m: prev.m - 1 };
        if (prev.h > 0) return { h: prev.h - 1, m: 59, s: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-24 bg-gray-950 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/2 h-full bg-violet-600/10 skew-x-12 translate-x-1/2"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex flex-col lg:flex-row items-center justify-between mb-16 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
              <Badge className="bg-red-500 text-white border-none font-black uppercase tracking-widest">Flash Sale Live</Badge>
            </div>
            <h2 className="text-4xl lg:text-6xl font-black text-white tracking-tighter">Don't Blink. <br /><span className="text-violet-400">Limited Offers.</span></h2>
          </div>

          <div className="flex items-center gap-4">
            {[
              { val: timeLeft.h, label: 'HOURS' },
              { val: timeLeft.m, label: 'MINS' },
              { val: timeLeft.s, label: 'SECS' }
            ].map((t, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-20 h-24 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center mb-2">
                  <span className="text-4xl font-black text-white">{t.val.toString().padStart(2, '0')}</span>
                </div>
                <span className="text-[10px] font-bold text-gray-500 tracking-widest uppercase">{t.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {deals.map(p => (
            <div key={p.id} className="group bg-white/5 backdrop-blur-md border border-white/10 rounded-[2.5rem] p-6 transition-all duration-500 hover:bg-white/10 hover:-translate-y-2 shadow-2xl">
              <div className="relative aspect-square rounded-3xl overflow-hidden mb-6">
                <img src={p.thumbnail} alt={p.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                <div className="absolute top-4 left-4">
                  <Badge className="bg-violet-600 text-white border-none font-black">SAVE 40%</Badge>
                </div>
              </div>
              <div className="flex items-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-3 h-3 ${i < Math.floor(p.rating) ? 'fill-amber-400 text-amber-400' : 'text-white/20'}`} />
                ))}
                <span className="text-[10px] text-gray-500 font-bold ml-1">({p.reviews})</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">{p.title}</h3>
              <div className="flex items-end gap-3 mb-6">
                <span className="text-3xl font-black text-white tracking-tighter">Γé╣{p.discountPrice}</span>
                <span className="text-sm text-gray-500 line-through font-bold mb-1">Γé╣{p.originalPrice}</span>
              </div>
              <Button
                className="w-full bg-white text-gray-950 hover:bg-violet-400 hover:text-white rounded-2xl h-14 font-black uppercase tracking-widest transition-all shadow-xl"
                onClick={() => addToCart({ ...p, price: p.discountPrice })}
              >
                Snap It Up
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Features Section
const FeaturesSection = () => {
  const features = [
    {
      icon: Shield,
      title: "Secure Payment",
      description: "100% secure payment processing with top-tier encryption.",
      color: "bg-emerald-500",
      accent: "text-emerald-500"
    },
    {
      icon: RotateCcw,
      title: "Easy Returns",
      description: "30-day hassle-free return policy. No questions asked.",
      color: "bg-amber-500",
      accent: "text-amber-500"
    },
    {
      icon: Truck,
      title: "Fast Delivery",
      description: "Get your products delivered in record time across the globe.",
      color: "bg-blue-500",
      accent: "text-blue-500"
    },
    {
      icon: Headphones,
      title: "24/7 Support",
      description: "Dedicated customer support team ready to help you anytime.",
      color: "bg-violet-500",
      accent: "text-violet-500"
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="relative p-8 rounded-[2.5rem] bg-white border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 group overflow-hidden"
            >
              <div className={`absolute top-0 right-0 w-32 h-32 ${feature.color} opacity-[0.03] rounded-bl-[5rem] group-hover:scale-150 transition-transform duration-700`}></div>

              <div
                className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}
              >
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-3 uppercase tracking-tighter">
                {feature.title}
              </h3>
              <p className="text-gray-500 font-medium leading-relaxed">
                {feature.description}
              </p>

              <div className="mt-6 flex items-center gap-2">
                <div className={`h-1 w-8 rounded-full ${feature.color}`}></div>
                <span className={`text-[10px] font-black uppercase tracking-widest ${feature.accent}`}>Trust Guaranteed</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Premium Bento Grid Section
const ModernBentoGrid = () => {
  const items = [
    {
      title: "Audio Elite",
      tag: "Pure Sound",
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
      description: "Experience sound like never before with our studio-grade headphones.",
      width: "col-span-1 lg:col-span-2",
      height: "h-[320px] lg:h-[400px]",
      link: "/shop?category=electronics"
    },
    {
      title: "Pro Workspaces",
      tag: "Efficiency",
      image: "https://images.unsplash.com/photo-1493934558415-9d19f0b2b4d2?w=800&q=80",
      description: "Minimalist desk setups for maximum focus.",
      width: "col-span-1",
      height: "h-[320px] lg:h-[400px]",
      link: "/shop?category=electronics"
    },
    {
      title: "Active Life",
      tag: "Peak Performance",
      image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80",
      description: "Gear that moves with you.",
      width: "col-span-1",
      height: "h-[320px] lg:h-[480px]",
      link: "/shop?category=sports"
    },
    {
      title: "Urban Style",
      tag: "2025 Look",
      image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80",
      description: "Modern fashion for the urban explorer.",
      width: "col-span-1 lg:col-span-2",
      height: "h-[320px] lg:h-[480px]",
      link: "/shop?category=fashion"
    }
  ];

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col mb-16 space-y-4">
          <Badge className="w-fit bg-violet-600 text-white rounded-full px-4 font-bold border-none uppercase tracking-widest text-[10px]">The Lookbook</Badge>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <h2 className="text-5xl lg:text-7xl font-black text-gray-900 leading-[0.9] tracking-tighter">
              Curated <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-pink-500 italic">Collections</span>
            </h2>
            <p className="text-gray-500 text-lg max-w-md font-medium">
              A bespoke selection of items chosen for their design, utility, and timeless appeal.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, idx) => (
            <div
              key={idx}
              className={`group relative ${item.width} ${item.height} rounded-[3.5rem] overflow-hidden shadow-2xl bg-gray-100 transition-all duration-700 hover:-translate-y-3 hover:shadow-violet-200/50`}
            >
              <img
                src={item.image}
                alt={item.title}
                loading="lazy"
                onLoad={(e) => e.target.classList.add('opacity-100')}
                className="w-full h-full object-cover transition-all duration-1000 opacity-0 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

              <div className="absolute inset-0 p-10 flex flex-col justify-end">
                <div className="space-y-4 translate-y-6 group-hover:translate-y-0 transition-transform duration-500">
                  <div className="flex items-center gap-2">
                    <span className="h-1 w-12 bg-violet-400 rounded-full"></span>
                    <span className="text-violet-400 text-xs font-black uppercase tracking-widest">{item.tag}</span>
                  </div>
                  <h3 className="text-4xl font-black text-white tracking-tighter leading-none">{item.title}</h3>
                  <p className="text-gray-300 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100 font-medium">
                    {item.description}
                  </p>
                  <Link to={item.link} className="inline-block mt-4">
                    <Button variant="outline" className="rounded-2xl border-white/20 text-white hover:bg-white hover:text-black transition-all font-black uppercase tracking-widest text-[10px] px-6 h-12">
                      Explore Series
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
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
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('https://dummyjson.com/products?limit=8&skip=10');
        const mappedProducts = response.data.products.map(p => ({
          id: p.id,
          name: p.title,
          price: Math.round(p.price * 83),
          originalPrice: Math.round(p.price * 83 * (1 + p.discountPercentage / 100)),
          image: p.thumbnail || p.images[0],
          rating: p.rating,
          reviews: p.reviews ? p.reviews.length : Math.floor(Math.random() * 500) + 50,
          discount: Math.round(p.discountPercentage),
          isNew: Math.random() > 0.8,
          isBestSeller: Math.random() > 0.8,
          description: p.description
        }));
        setProducts(mappedProducts);
      } catch (error) {
        console.error("Failed to fetch products", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

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

  if (isLoading) {
    return (
      <section className="py-24 bg-gray-50/50 flex justify-center items-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
          <div>
            <Badge className="mb-4 bg-violet-100 text-violet-600 border-violet-200">Featured</Badge>
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

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <Card
              key={product.id}
              className="group border-0 shadow-md hover:shadow-2xl transition-all duration-500 overflow-hidden bg-white flex flex-col"
              data-testid={`product-${product.id}`}
            >
              <div className="relative overflow-hidden aspect-square">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop" }}
                  loading="lazy"
                />
                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {product.discount && (
                    <Badge className="bg-violet-600 text-white border-0 font-bold px-3 py-1 text-xs shadow-xl">
                      -{product.discount}%
                    </Badge>
                  )}
                  {product.isNew && (
                    <Badge className="bg-indigo-500 text-white border-0 font-bold px-3 py-1 text-xs shadow-xl">
                      NEW
                    </Badge>
                  )}
                  {product.isBestSeller && (
                    <Badge className="bg-amber-500 text-white border-0 font-bold px-3 py-1 text-xs shadow-xl">
                      BEST SELLER
                    </Badge>
                  )}
                </div>
                {/* Quick Actions */}
                <div className="absolute top-4 right-4 translate-y-2 lg:translate-y-4 lg:opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  <Button
                    size="icon"
                    variant="secondary"
                    className={`rounded-2xl bg-white shadow-2xl hover:bg-white ${isInWishlist(product.id) ? 'text-violet-600' : 'text-gray-400'}`}
                    onClick={() => isInWishlist(product.id) ? removeFromWishlist(product.id) : addToWishlist(product)}
                  >
                    <Heart className={`w-5 h-5 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                  </Button>
                </div>
              </div>
              <CardContent className="p-6 flex flex-col flex-1">
                <div className="flex-1">
                  <div className="flex items-center gap-1 mb-3">
                    <div className="flex">{renderStars(product.rating)}</div>
                    <span className="text-[10px] font-black text-gray-400 ml-1">
                      ({product.reviews})
                    </span>
                  </div>
                  <Link to={`/shop`}>
                    <h3 className="font-bold text-gray-900 mb-2 group-hover:text-violet-600 transition-colors line-clamp-2 text-lg leading-tight">
                      {product.name}
                    </h3>
                  </Link>
                  <div className="flex items-baseline gap-2 mb-6">
                    <span className="text-2xl font-black text-gray-900 tracking-tighter">
                      Γé╣{product.price}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-gray-400 line-through font-bold">
                        Γé╣{product.originalPrice}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    className="flex-1 h-12 bg-gray-900 hover:bg-violet-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 group/btn overflow-hidden relative shadow-lg shadow-gray-200"
                    onClick={() => addToCart(product)}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2 group-hover/btn:animate-bounce" />
                    Cart
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 h-12 border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95"
                    onClick={() => {
                      addToCart(product);
                      window.location.href = '/payment';
                    }}
                  >
                    Buy Now
                  </Button>
                </div>
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
          <Badge className="mb-4 bg-violet-100 text-violet-600 border-violet-200">Testimonials</Badge>
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

// Best Sellers Section
const BestSellersSection = () => {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        const response = await axios.get('https://dummyjson.com/products?limit=4&skip=50');
        setProducts(response.data.products.map(p => ({
          ...p,
          price: Math.round(p.price * 83),
          originalPrice: Math.round(p.price * 83 * 1.2),
          rating: p.rating,
          reviews: Math.floor(Math.random() * 500) + 100,
          isBestSeller: true
        })));
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBestSellers();
  }, []);

  if (isLoading) return null;

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-16">
          <div className="space-y-2">
            <Badge className="bg-amber-100 text-amber-600 border-none font-black uppercase tracking-widest text-[10px]">Top Rated</Badge>
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 tracking-tighter">Best Sellers</h2>
          </div>
          <Link to="/shop" className="text-violet-600 font-black uppercase tracking-widest text-xs flex items-center gap-2 group">
            Explore All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {products.map(p => (
            <div key={p.id} className="group relative">
              <div className="relative aspect-[3/4] rounded-[2rem] overflow-hidden bg-gray-100 mb-6">
                <img src={p.thumbnail} alt={p.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" loading="lazy" />
                <div className="absolute top-6 left-6">
                  <Badge className="bg-amber-400 text-black border-none font-black px-3 py-1 text-[10px] shadow-xl">BEST SELLER</Badge>
                </div>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                  <Button size="icon" className="bg-white text-gray-900 rounded-full hover:bg-violet-600 hover:text-white transition-all shadow-2xl" onClick={() => addToCart(p)}>
                    <ShoppingCart className="w-5 h-5" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-1 mb-2 px-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-3 h-3 ${i < Math.floor(p.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                ))}
                <span className="text-[9px] font-black text-gray-400 ml-1">({p.reviews})</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1 px-2 line-clamp-1">{p.title}</h3>
              <p className="text-gray-500 text-sm px-2 mb-3 font-medium">{p.category}</p>
              <div className="flex items-center gap-2 px-2">
                <span className="text-2xl font-black text-violet-600 tracking-tighter">Γé╣{p.price}</span>
                <span className="text-sm text-gray-400 line-through font-bold">Γé╣{p.originalPrice}</span>
              </div>
            </div>
          ))}
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
      <FeaturedCategoriesSection />
      <FlashDealsSection />
      <BestSellersSection />
      <FeaturedProductsSection />
      <ModernBentoGrid />
      <PromoBannerSection />
      <TestimonialsSection />
      <NewsletterSection />
      <Footer />
    </div>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.user_type)) {
    // Redirect to home if user doesn't have the required role
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <div className="App selection:bg-violet-600/20 selection:text-violet-900">
      <HelmetProvider>
        <Helmet>
          <title>ZippyCart | Premium E-Commerce Intelligence</title>
          <meta name="description" content="Shop the future with ZippyCart. Premium products, secure payments, and lightning-fast logistics." />
          <meta name="keywords" content="e-commerce, shopping, premium products, fast delivery, secure checkout" />
          <meta property="og:site_name" content="ZippyCart" />
          <meta property="og:type" content="website" />
        </Helmet>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <OrderProvider>
                <CouponProvider>
                  <BrowserRouter>
                    <ScrollToTop />
                    <Routes>
                      {/* Public Routes */}
                      <Route path="/" element={<Home />} />
                      <Route path="/product/:id" element={<DetailsView />} />
                      <Route path="/shop" element={<Shop />} />
                      <Route path="/categories" element={<Categories />} />
                      <Route path="/deals" element={<Deals />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/faq" element={<FAQ />} />
                      <Route path="/shipping" element={<ShippingInfo />} />
                      <Route path="/returns" element={<Returns />} />
                      <Route path="/track-order" element={<TrackOrder />} />
                      <Route path="/privacy" element={<PrivacyPolicy />} />
                      <Route path="/terms" element={<TermsOfService />} />
                      <Route path="/cookies" element={<Cookies />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/auth" element={<Auth />} />

                      {/* Shared Protected Routes (Cart/Wishlist/Payment usually require account) */}
                      <Route path="/payment" element={
                        <ProtectedRoute allowedRoles={["user", "vendor", "admin"]}>
                          <Payment />
                        </ProtectedRoute>
                      } />
                      <Route path="/wishlist" element={
                        <ProtectedRoute allowedRoles={["user", "vendor", "admin"]}>
                          <Wishlist />
                        </ProtectedRoute>
                      } />

                      {/* Role-Specific Protected Routes */}
                      <Route path="/account" element={
                        <ProtectedRoute allowedRoles={["user"]}>
                          <Profile />
                        </ProtectedRoute>
                      } />
                      {/* Redirect /profile to /account for consistency */}
                      <Route path="/profile" element={<Navigate to="/account" replace />} />

                      <Route path="/admin/dashboard" element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                          <Admin />
                        </ProtectedRoute>
                      } />
                      <Route path="/admin" element={<AdminLogin />} />

                      <Route path="/vendor/dashboard" element={
                        <ProtectedRoute allowedRoles={["vendor"]}>
                          <Vendor />
                        </ProtectedRoute>
                      } />
                      <Route path="/vendor" element={<VendorLogin />} />

                      {/* Fallback */}
                      <Route path="*" element={<Home />} />
                    </Routes>
                  </BrowserRouter>
                </CouponProvider>
              </OrderProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </HelmetProvider>
    </div>
  );
}

export default App;
