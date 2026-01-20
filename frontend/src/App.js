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

// Hero Section - Professional E-commerce Style
const HeroSection = () => {
  const categories = [
    { name: "Electronics", icon: Laptop, link: "/shop?category=electronics" },
    { name: "Fashion", icon: Shirt, link: "/shop?category=fashion" },
    { name: "Home & Kitchen", icon: HomeIcon, link: "/shop?category=home-decoration" },
    { name: "Sports", icon: Dumbbell, link: "/shop?category=sports" },
    { name: "Books", icon: BookOpen, link: "/shop?category=books" },
    { name: "Accessories", icon: Watch, link: "/shop?category=accessories" },
  ];

  return (
    <section className="bg-gradient-to-br from-violet-700 via-indigo-700 to-purple-800">
      {/* Main Banner Carousel */}
      <div className="relative">
        <Carousel className="w-full">
          <CarouselContent>
            <CarouselItem>
              <div className="relative h-[300px] md:h-[400px] bg-gradient-to-r from-violet-800 to-indigo-800">
                <div className="absolute inset-0 flex items-center">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full grid md:grid-cols-2 gap-8 items-center">
                    <div className="text-white space-y-4">
                      <p className="text-violet-300 font-medium text-sm uppercase tracking-wider">New Arrivals</p>
                      <h1 className="text-3xl md:text-5xl font-bold leading-tight">
                        Premium Products at <span className="text-amber-400">Best Prices</span>
                      </h1>
                      <p className="text-gray-300 text-lg">Shop from thousands of products with fast delivery</p>
                      <Link to="/shop">
                        <Button className="bg-violet-500 hover:bg-violet-600 text-white font-bold px-8 h-12 rounded-lg shadow-lg">
                          Shop Now <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                      </Link>
                    </div>
                    <div className="hidden md:block">
                      <img
                        src="https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=500&h=350&fit=crop"
                        alt="Featured products"
                        className="rounded-lg shadow-2xl"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CarouselItem>
            <CarouselItem>
              <div className="relative h-[300px] md:h-[400px] bg-gradient-to-r from-indigo-800 to-violet-800">
                <div className="absolute inset-0 flex items-center">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full grid md:grid-cols-2 gap-8 items-center">
                    <div className="text-white space-y-4">
                      <p className="text-violet-300 font-medium text-sm uppercase tracking-wider">Flash Sale</p>
                      <h1 className="text-3xl md:text-5xl font-bold leading-tight">
                        Up to <span className="text-amber-400">50% Off</span> on Electronics
                      </h1>
                      <p className="text-gray-300 text-lg">Limited time offer. Don't miss out!</p>
                      <Link to="/deals">
                        <Button className="bg-violet-500 hover:bg-violet-600 text-white font-bold px-8 h-12 rounded-lg shadow-lg">
                          View Deals <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                      </Link>
                    </div>
                    <div className="hidden md:block">
                      <img
                        src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=350&fit=crop"
                        alt="Electronics sale"
                        className="rounded-lg shadow-2xl"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CarouselItem>
            <CarouselItem>
              <div className="relative h-[300px] md:h-[400px] bg-gradient-to-r from-purple-800 to-violet-800">
                <div className="absolute inset-0 flex items-center">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full grid md:grid-cols-2 gap-8 items-center">
                    <div className="text-white space-y-4">
                      <p className="text-violet-300 font-medium text-sm uppercase tracking-wider">Free Shipping</p>
                      <h1 className="text-3xl md:text-5xl font-bold leading-tight">
                        Free Delivery on Orders <span className="text-amber-400">₹500+</span>
                      </h1>
                      <p className="text-gray-300 text-lg">Fast & reliable shipping across India</p>
                      <Link to="/shop">
                        <Button className="bg-violet-500 hover:bg-violet-600 text-white font-bold px-8 h-12 rounded-lg shadow-lg">
                          Start Shopping <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                      </Link>
                    </div>
                    <div className="hidden md:block">
                      <img
                        src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=350&fit=crop"
                        alt="Fast delivery"
                        className="rounded-lg shadow-2xl"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CarouselItem>
          </CarouselContent>
          <CarouselPrevious className="left-4 bg-white/90 hover:bg-white border-none shadow-lg" />
          <CarouselNext className="right-4 bg-white/90 hover:bg-white border-none shadow-lg" />
        </Carousel>

        {/* Gradient fade at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-50 to-transparent"></div>
      </div>

      {/* Category Quick Links Strip */}
      <div className="bg-white border-b border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-2 md:gap-8 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat, i) => (
              <Link
                key={i}
                to={cat.link}
                className="flex flex-col items-center gap-2 px-4 py-2 rounded-lg hover:bg-violet-50 transition-colors min-w-[80px] group"
              >
                <div className="w-12 h-12 bg-violet-100 rounded-full flex items-center justify-center group-hover:bg-violet-200 transition-colors">
                  <cat.icon className="w-6 h-6 text-violet-600" />
                </div>
                <span className="text-xs font-medium text-gray-700 text-center whitespace-nowrap">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// Featured Categories Section - Professional Style
const FeaturedCategoriesSection = () => {
  const categories = [
    { name: "Electronics", icon: Laptop, image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=300&h=200&fit=crop", link: "/shop?category=electronics" },
    { name: "Fashion", icon: Shirt, image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=300&h=200&fit=crop", link: "/shop?category=fashion" },
    { name: "Home & Kitchen", icon: HomeIcon, image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=200&fit=crop", link: "/shop?category=home-decoration" },
    { name: "Sports", icon: Dumbbell, image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop", link: "/shop?category=sports" },
  ];

  return (
    <section className="py-10 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {categories.map((cat, i) => (
            <div key={i} className="bg-white p-5 rounded-xl shadow-sm hover:shadow-lg transition-shadow border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-3">{cat.name}</h3>
              <Link to={cat.link} className="block group">
                <div className="aspect-[3/2] overflow-hidden rounded-lg mb-3">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                <span className="text-sm text-violet-600 hover:text-violet-700 hover:underline font-medium">
                  Shop now
                </span>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Flash Deals Section - Professional Style
const FlashDealsSection = () => {
  const { addToCart } = useCart();
  const [deals, setDeals] = useState([]);
  const [timeLeft, setTimeLeft] = useState({ h: 12, m: 45, s: 30 });

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const response = await axios.get('https://dummyjson.com/products?limit=6&skip=20');
        setDeals(response.data.products.map(p => ({
          ...p,
          discountPrice: Math.round(p.price * 83),
          originalPrice: Math.round(p.price * 83 * 1.5),
          rating: p.rating,
          reviews: Math.floor(Math.random() * 200) + 50,
          discount: Math.round(p.discountPercentage)
        })));
      } catch (e) {
        console.error(e);
      }
    };
    fetchDeals();

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.s > 0) return { ...prev, s: prev.s - 1 };
        if (prev.m > 0) return { ...prev, m: prev.m - 1, s: 59 };
        if (prev.h > 0) return { h: prev.h - 1, m: 59, s: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-10 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 border-b border-gray-200 pb-4">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold text-gray-900">⚡ Limited Time Offer</h2>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-500">Ends in:</span>
                <div className="flex items-center gap-1">
                  <span className="bg-violet-600 text-white px-2 py-1 rounded text-sm font-bold">
                    {timeLeft.h.toString().padStart(2, '0')}
                  </span>
                  <span className="text-violet-600 font-bold">:</span>
                  <span className="bg-violet-600 text-white px-2 py-1 rounded text-sm font-bold">
                    {timeLeft.m.toString().padStart(2, '0')}
                  </span>
                  <span className="text-violet-600 font-bold">:</span>
                  <span className="bg-violet-600 text-white px-2 py-1 rounded text-sm font-bold">
                    {timeLeft.s.toString().padStart(2, '0')}
                  </span>
                </div>
              </div>
            </div>
            <Link to="/deals" className="text-sm text-violet-600 hover:text-violet-700 hover:underline font-medium">
              See all deals
            </Link>
          </div>

          {/* Deals Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {deals.map(p => (
              <Link key={p.id} to={`/product/${p.id}`} className="group block">
                <div className="text-center">
                  <div className="relative aspect-square mb-3 overflow-hidden rounded-lg bg-gray-50">
                    <img
                      src={p.thumbnail}
                      alt={p.title}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute top-2 left-2">
                      <span className="bg-rose-500 text-white text-xs font-bold px-2 py-1 rounded">
                        {p.discount}% off
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-violet-600 text-lg font-bold">₹{p.discountPrice.toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-gray-500">
                      M.R.P: <span className="line-through">₹{p.originalPrice.toLocaleString()}</span>
                    </p>
                    <p className="text-sm text-gray-900 line-clamp-2 font-medium">{p.title}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// Features Section - Trust Bar Style
const FeaturesSection = () => {
  const features = [
    { icon: Truck, title: "Free Delivery", desc: "On orders over ₹500" },
    { icon: RotateCcw, title: "Easy Returns", desc: "10 days return policy" },
    { icon: Shield, title: "Secure Payment", desc: "100% secure checkout" },
    { icon: Headphones, title: "24/7 Support", desc: "Dedicated support team" },
  ];

  return (
    <section className="py-4 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <div key={i} className="flex items-center gap-3 p-3">
              <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center flex-shrink-0">
                <f.icon className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">{f.title}</p>
                <p className="text-xs text-gray-500">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Shop by Collection Section - Clean Formal Style
const ModernBentoGrid = () => {
  const collections = [
    {
      title: "Electronics",
      subtitle: "Latest gadgets & tech",
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80",
      link: "/shop?category=electronics",
      productCount: 120
    },
    {
      title: "Fashion",
      subtitle: "Trending styles",
      image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=80",
      link: "/shop?category=fashion",
      productCount: 250
    },
    {
      title: "Home & Living",
      subtitle: "Decor essentials",
      image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80",
      link: "/shop?category=home-decoration",
      productCount: 80
    },
    {
      title: "Sports & Fitness",
      subtitle: "Active lifestyle",
      image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80",
      link: "/shop?category=sports",
      productCount: 95
    }
  ];

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Shop by Collection</h2>
            <p className="text-gray-500 mt-1">Explore our curated categories</p>
          </div>
          <Link to="/categories" className="text-violet-600 hover:underline font-medium text-sm">
            View All Categories
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {collections.map((item, idx) => (
            <Link
              key={idx}
              to={item.link}
              className="group relative aspect-[4/5] rounded-lg overflow-hidden bg-gray-100"
            >
              <img
                src={item.image}
                alt={item.title}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-lg font-bold text-white">{item.title}</h3>
                <p className="text-white/70 text-sm">{item.subtitle}</p>
                <p className="text-violet-300 text-xs mt-1">{item.productCount}+ products</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

// Featured Products Section - Professional Style
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

  if (isLoading) {
    return (
      <section className="py-10 bg-gray-50 flex justify-center items-center min-h-[300px]">
        <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
      </section>
    );
  }

  return (
    <section className="py-10 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6 border-b border-gray-200 pb-4">
            <h2 className="text-xl font-bold text-gray-900">🔥 Trending Products</h2>
            <Link to="/shop" className="text-sm text-violet-600 hover:text-violet-700 hover:underline font-medium">
              See more
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="group p-3 hover:shadow-lg transition-shadow rounded-lg border border-transparent hover:border-violet-100"
                data-testid={`product-${product.id}`}
              >
                <Link to={`/product/${product.id}`} className="block">
                  <div className="relative aspect-square mb-3 bg-gray-50 rounded-lg overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop" }}
                      loading="lazy"
                    />
                    {product.discount > 10 && (
                      <div className="absolute top-2 left-2">
                        <span className="bg-rose-500 text-white text-xs font-bold px-2 py-1 rounded">
                          {product.discount}% off
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-violet-600">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-1">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3 h-3 ${i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">({product.reviews})</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
                      {product.originalPrice && (
                        <span className="text-xs text-gray-400 line-through">₹{product.originalPrice.toLocaleString()}</span>
                      )}
                    </div>
                    <p className="text-xs text-green-600 font-medium">Free delivery</p>
                  </div>
                </Link>
                <Button
                  className="w-full mt-3 bg-violet-600 hover:bg-violet-700 text-white font-medium h-9 rounded-lg text-sm shadow-sm"
                  onClick={(e) => { e.preventDefault(); addToCart(product); }}
                >
                  Add to Cart
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// Why Shop With Us Section - Clean Formal Style
const PromoBannerSection = () => {
  const benefits = [
    { title: "Quality Products", desc: "Handpicked items from trusted brands" },
    { title: "Fast Delivery", desc: "Free shipping on orders over ₹500" },
    { title: "Easy Returns", desc: "10-day hassle-free return policy" },
    { title: "Secure Payments", desc: "100% safe & secure checkout" },
  ];

  return (
    <section className="py-12 bg-violet-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((item, i) => (
            <div key={i} className="text-center">
              <h3 className="text-white font-bold text-lg mb-1">{item.title}</h3>
              <p className="text-violet-200 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Customer Reviews Section - Clean Formal Style
const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Priya Sharma",
      rating: 5,
      text: "Excellent shopping experience! The product quality exceeded my expectations and delivery was super fast.",
      location: "Mumbai",
      date: "2 days ago"
    },
    {
      name: "Rahul Kumar",
      rating: 5,
      text: "Great prices and authentic products. Customer service was very helpful with my query.",
      location: "Delhi",
      date: "1 week ago"
    },
    {
      name: "Ananya Patel",
      rating: 5,
      text: "Love the easy returns policy. The app is so user-friendly and I got my refund within 3 days.",
      location: "Bangalore",
      date: "2 weeks ago"
    },
  ];

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">What Our Customers Say</h2>
          <p className="text-gray-500">Trusted by thousands of happy shoppers</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex gap-1 mb-3">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-4 leading-relaxed">
                "{testimonial.text}"
              </p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.location}</p>
                </div>
                <span className="text-xs text-gray-400">{testimonial.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Newsletter Section - Clean Formal Style
const NewsletterSection = () => {
  return (
    <section className="py-12 bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gray-50 rounded-lg p-8 lg:p-12">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Subscribe to Our Newsletter
            </h2>
            <p className="text-gray-500 mb-6">
              Get the latest deals, new arrivals, and exclusive offers delivered to your inbox.
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                className="flex-1 h-12 border-gray-300 focus:border-violet-500 focus:ring-violet-500"
                data-testid="newsletter-email"
              />
              <Button
                type="submit"
                className="h-12 px-8 bg-violet-600 hover:bg-violet-700 text-white font-medium"
                data-testid="newsletter-submit"
              >
                Subscribe
              </Button>
            </form>
            <p className="text-gray-400 text-xs mt-4">
              No spam, unsubscribe anytime.
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
                <span className="text-2xl font-black text-violet-600 tracking-tighter">₹{p.price}</span>
                <span className="text-sm text-gray-400 line-through font-bold">₹{p.originalPrice}</span>
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
