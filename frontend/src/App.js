import { useEffect, useState, createContext, useContext } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import LandingSelector from "./components/LandingSelector";
import FoodApp from "./components/FoodDelivery/FoodApp";
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
import ProtectedRoute from "./components/ProtectedRoute";
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
  Utensils,
  Bike,
} from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
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
        } catch (e) {
          localStorage.removeItem('token');
          localStorage.removeItem('user_data');
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (identifier, password, userType = "user") => {
    try {
      const response = await axios.post(`${API}/users/login`, {
        identifier,
        password,
        user_type: userType
      });
      const userData = response.data;
      localStorage.setItem('token', userData.token);
      localStorage.setItem('user_data', JSON.stringify(userData));
      setUser(userData);
      return userData;
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
    localStorage.removeItem('user_phone');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_password');
    localStorage.removeItem('user_profile');
    setUser(null);
  };

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401 ||
          error.response?.data?.detail === "Session protocol corrupted." ||
          error.response?.data?.detail === "Session expired. Re-authentication required.") {
          console.warn("Session expired or corrupted. Logging out.");
          logout();
        }
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  const updateUser = async (userId, updates) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API}/users/${userId}`, updates, {
        headers: { Authorization: `Bearer ${token}` }
      });
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

// Orders Context
const OrderContext = createContext();

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
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
      return { valid: false, message: `Minimum commitment of ₹${coupon.minOrder} required.` };
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
};

// Hero Section
const HeroSection = ({ stats }) => {
  return (
    <section className="relative min-h-[50vh] md:min-h-[70vh] flex items-center overflow-hidden bg-gradient-to-br from-slate-950 via-violet-950 to-slate-950">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient Orbs */}
        <div className="absolute top-0 -left-40 w-[500px] h-[500px] bg-violet-600/30 rounded-full filter blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-0 -right-40 w-[600px] h-[600px] bg-indigo-600/20 rounded-full filter blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-600/10 rounded-full filter blur-[150px]"></div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:60px_60px]"></div>

        {/* Floating Particles */}
        <div className="absolute top-20 left-[10%] w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDuration: '3s' }}></div>
        <div className="absolute top-40 right-[15%] w-3 h-3 bg-amber-400 rounded-full animate-bounce" style={{ animationDuration: '4s', animationDelay: '0.5s' }}></div>
        <div className="absolute bottom-32 left-[20%] w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '1s' }}></div>
        <div className="absolute bottom-40 right-[25%] w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '0.2s' }}></div>
      </div>

      {/* Main Content Container */}
      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">

          {/* Left Content - Text & CTA */}
          <div className="lg:col-span-6 text-center lg:text-left space-y-8 order-2 lg:order-1">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mt-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
              </span>
              <span className="text-sm font-medium text-white/80">New Collection</span>
              <ChevronRight className="w-4 h-4 text-white/60" />
            </div>

            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] tracking-tight">
                <span className="text-white">Discover Your</span>
                <br />
                <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 bg-clip-text text-transparent">Perfect Style</span>
              </h1>
              <p className="text-lg lg:text-xl text-white/60 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                Explore premium products with exclusive deals, curated collections, and lightning-fast delivery to your doorstep.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/shop">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white border-0 px-8 py-6 text-base font-semibold rounded-xl shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all duration-300 group"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Shop Now
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/categories">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-white/20 text-white hover:bg-white/10 hover:border-white/30 px-8 py-6 text-base font-semibold rounded-xl backdrop-blur-sm transition-all duration-300"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Explore Collections
                </Button>
              </Link>
            </div>

            {/* Trust Stats */}
            <div className="flex items-center gap-6 lg:gap-8 justify-center lg:justify-start pt-6">
              <div className="text-center lg:text-left">
                <p className="text-3xl lg:text-4xl font-bold text-white">{stats.happy_customers?.toLocaleString() || '50K+'}</p>
                <p className="text-sm text-white/50 font-medium mt-1">Happy Customers</p>
              </div>
              <div className="w-px h-14 bg-white/10"></div>
              <div className="text-center lg:text-left">
                <p className="text-3xl lg:text-4xl font-bold text-white">{stats.total_products?.toLocaleString() || '10K+'}</p>
                <p className="text-sm text-white/50 font-medium mt-1">Products</p>
              </div>
              <div className="w-px h-14 bg-white/10"></div>
              <div className="text-center lg:text-left">
                <p className="text-3xl lg:text-4xl font-bold text-white">{stats.satisfaction_rate || '98%'}</p>
                <p className="text-sm text-white/50 font-medium mt-1">Satisfaction</p>
              </div>
            </div>
          </div>

          {/* Right Content - Hero Visual */}
          <div className="lg:col-span-6 order-1 lg:order-2">
            <div className="relative">
              {/* Glow Effect Behind Cards */}
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-indigo-500/20 rounded-[3rem] blur-3xl scale-110"></div>

              {/* Main Image Card */}
              <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-[2.5rem] p-2 border border-white/10 shadow-2xl">
                <Carousel className="relative rounded-[2rem] overflow-hidden">
                  <CarouselContent>
                    <CarouselItem>
                      <div className="relative h-[300px] sm:h-[350px] lg:h-[400px]">
                        <img
                          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop"
                          alt="Modern fashion collection"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                        <div className="absolute bottom-6 left-6 right-6">
                          <Badge className="bg-white/90 text-gray-900 border-0 px-3 py-1 text-xs font-bold mb-2">TRENDING</Badge>
                          <p className="text-white text-lg font-semibold">Summer Collection 2026</p>
                        </div>
                      </div>
                    </CarouselItem>
                    <CarouselItem>
                      <div className="relative h-[300px] sm:h-[350px] lg:h-[400px]">
                        <img
                          src="https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=800&h=600&fit=crop"
                          alt="Premium tech products"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                        <div className="absolute bottom-6 left-6 right-6">
                          <Badge className="bg-violet-500/90 text-white border-0 px-3 py-1 text-xs font-bold mb-2">NEW ARRIVALS</Badge>
                          <p className="text-white text-lg font-semibold">Premium Electronics</p>
                        </div>
                      </div>
                    </CarouselItem>
                    <CarouselItem>
                      <div className="relative h-[300px] sm:h-[350px] lg:h-[400px]">
                        <img
                          src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=600&fit=crop"
                          alt="Luxury watches"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                        <div className="absolute bottom-6 left-6 right-6">
                          <Badge className="bg-amber-500/90 text-white border-0 px-3 py-1 text-xs font-bold mb-2">FEATURED</Badge>
                          <p className="text-white text-lg font-semibold">Luxury Accessories</p>
                        </div>
                      </div>
                    </CarouselItem>
                  </CarouselContent>
                  <CarouselPrevious className="left-4 bg-white/10 border-white/20 text-white hover:bg-white/20" />
                  <CarouselNext className="right-4 bg-white/10 border-white/20 text-white hover:bg-white/20" />
                </Carousel>
              </div>

              {/* Floating Feature Cards */}
              <div className="hidden lg:block absolute -left-16 top-1/4 transform -translate-y-1/2 z-20">
                <div className="bg-white rounded-2xl p-4 shadow-2xl animate-[bounce_3s_ease-in-out_infinite] border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/30">
                      <Truck className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">Free Shipping</p>
                      <p className="text-xs text-gray-500">Orders over ₹499</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="hidden lg:block absolute -right-12 bottom-1/4 transform translate-y-1/2 z-20">
                <div className="bg-white rounded-2xl p-4 shadow-2xl animate-[bounce_3.5s_ease-in-out_infinite] border border-gray-100" style={{ animationDelay: '0.5s' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/30">
                      <Star className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">Best Sellers</p>
                      <p className="text-xs text-gray-500">Top Rated Products</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="hidden lg:block absolute -left-8 bottom-10 z-20">
                <div className="bg-white rounded-2xl p-4 shadow-2xl animate-[bounce_4s_ease-in-out_infinite] border border-gray-100" style={{ animationDelay: '1s' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">Secure Payment</p>
                      <p className="text-xs text-gray-500">100% Protected</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave Decoration */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg className="w-full h-16 lg:h-24" viewBox="0 0 1440 74" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0 24L60 28C120 32 240 40 360 42.7C480 45.3 600 42.7 720 37.3C840 32 960 24 1080 22.7C1200 21.3 1320 26.7 1380 29.3L1440 32V74H1380C1320 74 1200 74 1080 74C960 74 840 74 720 74C600 74 480 74 360 74C240 74 120 74 60 74H0V24Z" fill="white" />
        </svg>
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
      description: "Free shipping on all orders over ₹999",
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
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
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
      link: "/shop?category=home-garden"
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
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
          <div>
            <Badge className="mb-4 bg-violet-100 text-violet-600 border-violet-200">The Lookbook</Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Curated Collections
            </h2>
            <p className="text-gray-600 max-w-xl">
              A bespoke selection of items chosen for their design, utility, and timeless appeal.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, idx) => (
            <div
              key={idx}
              className={`group relative ${item.width} ${item.height} rounded-[2.5rem] overflow-hidden shadow-2xl bg-gray-100 transition-all duration-700 hover:-translate-y-3`}
            >
              <img
                src={item.image}
                alt={item.title}
                loading="lazy"
                onLoad={(e) => e.target.classList.add('opacity-100')}
                className="w-full h-full object-cover transition-all duration-1000 opacity-0 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

              <div className="absolute inset-0 p-8 flex flex-col justify-end">
                <div className="space-y-4 translate-y-6 group-hover:translate-y-0 transition-transform duration-500">
                  <div className="flex items-center gap-2">
                    <span className="h-px w-8 bg-violet-400"></span>
                    <span className="text-violet-400 text-sm font-bold uppercase tracking-widest">{item.tag}</span>
                  </div>
                  <h3 className="text-3xl font-bold text-white leading-none">{item.title}</h3>
                  <p className="text-gray-300 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                    {item.description}
                  </p>
                  <Link to={item.link} className="inline-block mt-4">
                    <Button variant="outline" className="rounded-full border-white/20 text-white hover:bg-white hover:text-black transition-all">
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
        const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
        const response = await axios.get(`${API_BASE}/api/products?limit=8&sort=trending`);
        setProducts(response.data);
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
    <section className="py-24 bg-gray-50/50 mb-[3px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
          <div>
            <Badge className="mb-4 bg-violet-100 text-violet-600 border-violet-200">Featured</Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Trending Products
            </h2>
            <p className="text-gray-600 max-w-xl">
              Discover the perfect blend of high-performance favorites and fresh new arrivals trending right now.
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
              <div className="relative overflow-hidden aspect-[5/4] bg-gray-50/80 p-4">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700 mx-auto"
                  onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop" }}
                />
                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {product.discount && (
                    <Badge className="bg-violet-600 text-white border-0 font-bold px-2 py-0.5 text-[10px] shadow-xl">
                      -{product.discount}%
                    </Badge>
                  )}
                  {product.isNew && (
                    <Badge className="bg-indigo-500 text-white border-0 font-bold px-2 py-0.5 text-[10px] shadow-xl">
                      NEW
                    </Badge>
                  )}
                  {product.offers && (
                    <Badge className="bg-emerald-500 text-white border-0 font-bold px-2 py-0.5 text-[10px] shadow-xl max-w-[120px] truncate">
                      {product.offers}
                    </Badge>
                  )}
                </div>
                {/* Quick Actions */}
                <div className="absolute top-2 right-2 flex flex-col gap-2">
                  <Button
                    size="icon"
                    variant="secondary"
                    className={`w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow-xl hover:bg-white transition-all transform active:scale-95 ${isInWishlist(product.id) ? 'text-rose-500' : 'text-gray-400'}`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      isInWishlist(product.id) ? removeFromWishlist(product.id) : addToWishlist(product);
                    }}
                  >
                    <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                  </Button>
                </div>
              </div>
              <CardContent className="p-4 flex flex-col flex-1">
                <div className="flex-1">
                  <div className="flex items-center gap-1 mb-1">
                    <div className="flex">{renderStars(product.rating)}</div>
                    <span className="text-[10px] font-black text-gray-400 ml-1">
                      ({product.reviews})
                    </span>
                  </div>
                  <Link to={`/shop`}>
                    <h3 className="font-bold text-gray-900 mb-1 group-hover:text-violet-600 transition-colors line-clamp-2 text-sm leading-tight h-8">
                      {product.name}
                    </h3>
                  </Link>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-xl font-black text-gray-900 tracking-tighter">
                      ₹{product.price}
                    </span>
                    {product.originalPrice && (
                      <span className="text-xs text-gray-400 line-through font-bold">
                        ₹{product.originalPrice}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    className="flex-1 h-9 bg-gray-900 hover:bg-violet-600 text-white rounded-lg font-black text-[9px] uppercase tracking-widest transition-all active:scale-95 group/btn overflow-hidden relative shadow-lg shadow-gray-200"
                    onClick={() => addToCart(product)}
                  >
                    <ShoppingCart className="w-3 h-3 mr-1 group-hover/btn:animate-bounce" />
                    Cart
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 h-9 border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white rounded-lg font-black text-[9px] uppercase tracking-widest transition-all active:scale-95"
                    onClick={() => {
                      addToCart(product);
                      window.location.href = '/payment';
                    }}
                  >
                    Buy
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
  const [bestDeal, setBestDeal] = useState(null);
  const [timeLeft, setTimeLeft] = useState({ days: '00', hours: '00', mins: '00', secs: '00' });

  useEffect(() => {
    const fetchBestDeal = async () => {
      try {
        const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
        const response = await axios.get(`${API_BASE}/api/products`);
        const products = response.data;
        if (products.length > 0) {
          // Find product with max discount that has an expiry date if possible, otherwise just max discount
          const sorted = [...products].sort((a, b) => b.discount - a.discount);
          setBestDeal(sorted[0]);
        }
      } catch (error) {
        console.error("Failed to fetch deals", error);
      }
    };
    fetchBestDeal();
  }, []);

  useEffect(() => {
    const targetDate = bestDeal?.offer_expires_at ? new Date(bestDeal.offer_expires_at) : new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      if (distance < 0) {
        clearInterval(timer);
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)).toString().padStart(2, '0'),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)).toString().padStart(2, '0'),
        mins: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0'),
        secs: Math.floor((distance % (1000 * 60)) / 1000).toString().padStart(2, '0')
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [bestDeal]);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-indigo-700 via-violet-800 to-purple-900 border-y border-white/10">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-rose-500/10 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px]"></div>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>

      <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 relative z-10">
        <div className="grid lg:grid-cols-[3fr_2fr] gap-8 items-center">
          <div className="space-y-4 text-center lg:text-left pt-10 lg:pt-16 pb-5 lg:pb-8">
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white text-[9px] font-black uppercase tracking-[0.2em]">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              Elite Deal Protocol
            </div>

            <h2 className="text-3xl lg:text-7xl font-black text-white leading-[0.9] tracking-tighter">
              THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-rose-300 to-violet-300">ULTIMATE</span>
              <span className="block mt-1">FLASH SALE.</span>
            </h2>

            <p className="text-white/60 text-sm md:text-base max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed">
              Unlock exclusive elite-tier discounts across our entire synchronized inventory.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-5">
              <Link to="/deals">
                <Button
                  size="lg"
                  className="bg-white text-indigo-900 hover:bg-white/90 px-8 h-12 rounded-xl font-black shadow-[0_0_40px_rgba(255,255,255,0.15)] transition-all hover:scale-105 active:scale-95 text-xs"
                >
                  ACCESS DEALS
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>

              <div className="flex gap-3 p-2.5 bg-black/20 backdrop-blur-2xl rounded-xl border border-white/10">
                {[
                  { v: timeLeft.days, l: "DAYS" },
                  { v: timeLeft.hours, l: "HOURS" },
                  { v: timeLeft.mins, l: "MINS" },
                  { v: timeLeft.secs, l: "SECS" }
                ].map((t, i) => (
                  <div key={i} className="text-center min-w-[40px]">
                    <p className="text-xl font-black text-white leading-none tracking-tighter">{t.v}</p>
                    <p className="text-[7px] text-white/40 uppercase font-bold mt-1 tracking-widest leading-none">{t.l}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="relative group p-4 transform scale-100">
              <div className="absolute -inset-6 bg-gradient-to-tr from-rose-500/10 to-violet-600/10 rounded-full blur-[80px] opacity-50 group-hover:opacity-100 transition-opacity"></div>
              <Link to={bestDeal ? `/product/${bestDeal.id}` : '#'} className="block">
                <div className="relative bg-white/5 backdrop-blur-md rounded-[40px] p-6 border border-white/10 shadow-2xl overflow-hidden transform rotate-2 group-hover:rotate-0 transition-transform duration-1000 max-w-[400px] ml-auto cursor-pointer">
                  <img
                    src={bestDeal?.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=800&fit=crop"}
                    alt={bestDeal?.name || "Premium Deal"}
                    className="w-full object-contain rounded-[40px] brightness-90 group-hover:brightness-100 transition-all duration-700 mx-auto"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/80 via-transparent to-transparent"></div>
                  <div className="absolute bottom-10 left-8 right-8 text-center lg:text-left">
                    <p className="text-white font-black text-4xl leading-none tracking-tighter ml-6">{bestDeal?.discount || '60'}% OFF</p>
                    <p className="text-white/60 text-[10px] font-bold uppercase mt-2 tracking-widest ml-6">Limited Batch Reveal</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};






// Categories Section
const CategoriesSection = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
        const [catRes, prodRes] = await Promise.all([
          axios.get(`${API_BASE}/api/public/categories`),
          axios.get(`${API_BASE}/api/products`)
        ]);
        setCategories(catRes.data);
        setProducts(prodRes.data);
      } catch (error) {
        console.error("Failed to fetch discovery data", error);
      }
    };
    fetchData();
  }, []);

  if (categories.length === 0) return null;

  return (
    <section className="py-24 bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <div>
            <Badge className="mb-4 bg-violet-100 text-violet-600 border-none px-4 py-1.5 font-black text-[10px] uppercase tracking-widest">
              Collections
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-black text-gray-900 tracking-tighter">
              SHOP BY <span className="text-violet-600">CATEGORY.</span>
            </h2>
          </div>
          <Link to="/categories">
            <Button variant="ghost" className="text-violet-600 hover:text-violet-700 font-black uppercase text-[10px] tracking-widest group">
              View All
              <ChevronRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories
            .slice(0, 4)
            .map((cat, i) => {
              const firstProduct = products.find(p => p.category?.toLowerCase() === cat.name?.toLowerCase());

              const iconMap = {
                'electronics': Laptop,
                'fashion': Shirt,
                'home & garden': HomeIcon,
                'home': HomeIcon,
                'sports': Dumbbell,
                'beauty': Sparkles,
                'books': BookOpen
              };
              const IconComponent = iconMap[cat.name?.toLowerCase()] || Sparkles;

              return (
                <Link
                  key={i}
                  to={cat.link}
                  className="group bg-white p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-500 border border-gray-100 flex flex-col items-center text-center"
                >
                  <div className="w-28 h-28 bg-transparent rounded-full flex items-center justify-center mb-5 group-hover:bg-transparent transition-colors relative overflow-hidden shadow-inner">
                    {firstProduct?.image ? (
                      <img src={firstProduct.image} alt={cat.name} className="w-full h-full object-cover p-3 group-hover:scale-110 transition-transform duration-700" />
                    ) : (
                      <IconComponent className="w-12 h-12 text-violet-600" />
                    )}
                  </div>
                  <h3 className="text-lg font-black text-gray-900 group-hover:text-violet-600 transition-colors uppercase tracking-tight">
                    {cat.name}
                  </h3>
                  <div className="mt-4 flex items-center gap-1.5 px-4 py-1.5 bg-violet-50 rounded-full group-hover:bg-violet-600 transition-all duration-300">
                    <span className="text-[10px] font-black text-violet-600 group-hover:text-white uppercase tracking-widest">
                      Explore
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-violet-600 group-hover:text-white transition-colors" />
                  </div>
                </Link>
              );
            })}
        </div>
      </div>
    </section>
  );
};

// Home Page Component
const Home = () => {
  const [stats, setStats] = useState({
    happy_customers: 0,
    total_products: 0,
    total_vendors: 0,
    satisfaction_rate: "100%"
  });
  const [reviews, setReviews] = useState([]);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/public/stats`);
      setStats(response.data);
    } catch (e) {
      console.error("Failed to fetch platform stats", e);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`${API}/public/reviews`);
      setReviews(response.data);
    } catch (e) {
      console.error("Failed to fetch public reviews", e);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchReviews();
  }, []);

  return (
    <div className="min-h-screen">
      <Navigation />
      <HeroSection stats={stats} />
      <FeaturesSection />
      <CategoriesSection />
      <ModernBentoGrid />
      <PromoBannerSection />
      <FeaturedProductsSection />

      <Footer />
    </div>
  );
};

// App Mode Context - allows switching between e-commerce and food delivery
const AppModeContext = createContext();

export const useAppMode = () => {
  const context = useContext(AppModeContext);
  if (!context) {
    throw new Error('useAppMode must be used within an AppModeProvider');
  }
  return context;
};

// E-commerce Routes Component
const EcommerceRoutes = ({ onSwitchApp }) => {
  return (
    <Routes>
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
      <Route path="/payment" element={<Payment />} />
      <Route path="/wishlist" element={
        <ProtectedRoute>
          <Wishlist />
        </ProtectedRoute>
      } />
      <Route path="*" element={<Home />} />
    </Routes>
  );
};

// Main App Router Component
const AppRouter = () => {
  const [appMode, setAppMode] = useState(() => {
    // Check localStorage for saved preference
    return localStorage.getItem('zippy_app_mode') || null;
  });
  const navigate = useNavigate();

  const handleSelectApp = (mode) => {
    setAppMode(mode);
    localStorage.setItem('zippy_app_mode', mode);
    if (mode === 'ecommerce') {
      navigate('/');
    } else if (mode === 'food') {
      navigate('/food');
    }
  };

  const switchToLanding = () => {
    setAppMode(null);
    localStorage.removeItem('zippy_app_mode');
    navigate('/');
  };

  const switchToEcommerce = () => {
    setAppMode('ecommerce');
    localStorage.setItem('zippy_app_mode', 'ecommerce');
    navigate('/');
  };

  const switchToFood = () => {
    setAppMode('food');
    localStorage.setItem('zippy_app_mode', 'food');
    navigate('/food');
  };

  // Common protected and auth routes that should be accessible in both modes
  const commonRoutes = (
    <>
      <Route path="/admin/*" element={
        <ProtectedRoute requiredRole="admin">
          <Admin />
        </ProtectedRoute>
      } />
      <Route path="/vendor/*" element={
        <ProtectedRoute requiredRole="vendor">
          <Vendor />
        </ProtectedRoute>
      } />
      <Route path="/auth/*" element={<Auth />} />
      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />
      <Route path="/account" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />
    </>
  );

  // If no app mode selected, show landing selector
  if (!appMode) {
    return (
      <Routes>
        <Route path="/" element={<LandingSelector onSelect={handleSelectApp} />} />
        {commonRoutes}
        {/* Redirect others back to home/selector */}
        <Route path="*" element={<LandingSelector onSelect={handleSelectApp} />} />
      </Routes>
    );
  }

  // Render based on app mode
  if (appMode === 'food') {
    return (
      <Routes>
        <Route path="/food/*" element={<FoodApp onSwitchApp={switchToEcommerce} />} />
        {commonRoutes}
        {/* If we are in food mode but land on any other page, go to FoodApp */}
        <Route path="*" element={<FoodApp onSwitchApp={switchToEcommerce} />} />
      </Routes>
    );
  }

  // Default: E-commerce mode (ZippyCart)
  return (
    <Routes>
      <Route path="/food/*" element={<FoodApp onSwitchApp={switchToEcommerce} />} />
      {commonRoutes}
      {/* All other e-commerce pages are handled within EcommerceRoutes */}
      <Route path="*" element={<EcommerceRoutes onSwitchApp={switchToFood} />} />
    </Routes>
  );
};

function App() {
  return (
    <div className="App">
      <CouponProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <OrderProvider>
                <BrowserRouter>
                  <ScrollToTop />
                  <AppRouter />
                </BrowserRouter>
              </OrderProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </CouponProvider>
    </div>
  );
}

export default App;
