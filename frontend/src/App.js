import { useEffect, useState, createContext, useContext } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import axios from "axios";
import Shop from "./components/Shop";
import Categories from "./components/Categories";
import Deals from "./components/Deals";
import About from "./components/About";
import Cart from "./components/Cart";
import Wishlist from "./components/Wishlist";
import Profile from "./components/Profile";
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
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        // Demo check
        const demoUser = {
          id: 1,
          username: 'john',
          email: 'john@mail.com',
          name: 'John Doe',
          firstName: 'John',
          lastName: 'Doe',
          gender: 'male',
          image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John'
        };
        setUser(demoUser);
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    // Demo login
    const demoUser = {
      id: 1,
      username: email,
      email: email,
      name: 'John Doe',
      firstName: 'John',
      lastName: 'Doe',
      gender: 'male',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John'
    };
    localStorage.setItem('token', 'demo_token');
    setUser(demoUser);
    return demoUser;
  };

  const register = async (userData) => {
    const response = await axios.post('https://dummyjson.com/users/add', {
      ...userData,
      avatar: userData.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=John'
    });
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateUser = async (userId, updates) => {
    // Demo update
    setUser(prev => ({ ...prev, ...updates }));
    return { ...updates };
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
          <Badge className="w-fit bg-violet-600 text-white rounded-full px-4 font-bold border-none">The Lookbook</Badge>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <h2 className="text-4xl lg:text-6xl font-black text-gray-900 leading-tight">
              Curated <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-pink-500 italic">Collections</span>
            </h2>
            <p className="text-gray-500 text-lg max-w-md">
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
                      ₹{product.price}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-gray-400 line-through font-bold">
                        ₹{product.originalPrice}
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
      <ModernBentoGrid />
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
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <OrderProvider>
              <BrowserRouter>
                <ScrollToTop />
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
                  <Route path="/wishlist" element={<Wishlist />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="*" element={<Home />} />
                </Routes>
              </BrowserRouter>
            </OrderProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </div>
  );
}

export default App;
