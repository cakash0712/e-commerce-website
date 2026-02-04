import { useEffect, useState, createContext, useContext, useRef, useCallback } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import LandingSelector from "./components/LandingSelector";
import FoodApp from "./components/FoodDelivery/FoodApp";
import RestaurantLogin from "./components/FoodDelivery/RestaurantLogin";
import RestaurantDashboard from "./components/FoodDelivery/RestaurantDashboard";
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
  TrendingUp,
  CreditCard,
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

// Recently Viewed Context
const RecentViewedContext = createContext();

export const useRecentlyViewed = () => {
  const context = useContext(RecentViewedContext);
  if (!context) {
    throw new Error('useRecentlyViewed must be used within a RecentlyViewedProvider');
  }
  return context;
};

const RecentlyViewedProvider = ({ children }) => {
  const { user } = useAuth();
  const [recentProducts, setRecentProducts] = useState([]);
  const [pickupProducts, setPickupProducts] = useState([]);
  const recentLoaded = useRef(false);
  const userKey = user?.id ? `DACHCart_recent_${user.id}` : 'DACHCart_recent_guest';
  const pickupKey = user?.id ? `DACHCart_pickup_${user.id}` : 'DACHCart_pickup_guest';

  useEffect(() => {
    const fetchRecent = async () => {
      recentLoaded.current = false;
      const guestKey = 'DACHCart_recent_guest';
      const guestItems = JSON.parse(localStorage.getItem(guestKey) || '[]');

      if (user?.id) {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get(`${API}/users/recently-viewed`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (response.data) {
            let updatedRecent = response.data;
            // Merge guest items if they exist
            if (guestItems.length > 0) {
              const userRecentIds = new Set(updatedRecent.map(p => p.id));
              const uniqueGuestItems = guestItems.filter(p => !userRecentIds.has(p.id));

              if (uniqueGuestItems.length > 0) {
                updatedRecent = [...uniqueGuestItems, ...updatedRecent].slice(0, 10);
                // Clean up guest recent after merging
                localStorage.removeItem(guestKey);

                // Sync the merged list back to backend
                axios.put(`${API}/users/recently-viewed`, updatedRecent.map(p => p.id), {
                  headers: { Authorization: `Bearer ${token}` }
                });
              }
            }
            setRecentProducts(updatedRecent);
            recentLoaded.current = true;
            localStorage.setItem(userKey, JSON.stringify(updatedRecent));
            return;
          }
        } catch (e) {
          console.error("Failed to sync recently viewed from backend", e);
        }
      }

      // Fallback to local storage (for guest or if backend fails)
      const saved = localStorage.getItem(userKey);
      if (saved) {
        try {
          setRecentProducts(JSON.parse(saved));
        } catch (e) {
          setRecentProducts([]);
        }
      }
      recentLoaded.current = true;
    };

    const fetchPickup = async () => {
      const guestKey = 'DACHCart_pickup_guest';
      const guestItems = JSON.parse(localStorage.getItem(guestKey) || '[]');

      if (user?.id) {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get(`${API}/users/pickup-items`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (response.data) {
            let updatedPickup = response.data;
            if (guestItems.length > 0) {
              const userPickupIds = new Set(updatedPickup.map(p => p.id));
              const uniqueGuestItems = guestItems.filter(p => !userPickupIds.has(p.id));
              if (uniqueGuestItems.length > 0) {
                updatedPickup = [...uniqueGuestItems, ...updatedPickup].slice(0, 10);
                localStorage.removeItem(guestKey);
                axios.put(`${API}/users/pickup-items`, updatedPickup.map(p => p.id), {
                  headers: { Authorization: `Bearer ${token}` }
                });
              }
            }
            setPickupProducts(updatedPickup);
            localStorage.setItem(pickupKey, JSON.stringify(updatedPickup));
            return;
          }
        } catch (e) {
          console.error("Failed to fetch pickup items", e);
        }
      }
      const saved = localStorage.getItem(pickupKey);
      if (saved) {
        try { setPickupProducts(JSON.parse(saved)); } catch (e) { setPickupProducts([]); }
      }
    };

    fetchRecent();
    fetchPickup();
  }, [user?.id, userKey, pickupKey]);

  const addToRecentlyViewed = useCallback((product) => {
    // 1. Update Recently Viewed
    setRecentProducts(prev => {
      if (prev.length > 0 && prev[0].id === product.id) return prev;
      const filtered = prev.filter(p => p.id !== product.id);
      const newList = [product, ...filtered].slice(0, 10);

      const syncRecent = async () => {
        if (user?.id) {
          try {
            const token = localStorage.getItem('token');
            const ids = newList.map(p => p.id);
            await axios.put(`${API}/users/recently-viewed`, ids, {
              headers: { Authorization: `Bearer ${token}` }
            });
          } catch (e) { }
        }
        localStorage.setItem(userKey, JSON.stringify(newList));
      };
      syncRecent();
      return newList;
    });

    // 2. Update Pick Up Where You Left Off (Sync to MongoDB)
    setPickupProducts(prev => {
      if (prev.length > 0 && prev[0].id === product.id) return prev;
      const filtered = prev.filter(p => p.id !== product.id);
      const newList = [product, ...filtered].slice(0, 10); // Standard limit for pickup items

      const syncPickup = async () => {
        if (user?.id) {
          try {
            const token = localStorage.getItem('token');
            const ids = newList.map(p => p.id);
            await axios.put(`${API}/users/pickup-items`, ids, {
              headers: { Authorization: `Bearer ${token}` }
            });
          } catch (e) { }
        }
        localStorage.setItem(pickupKey, JSON.stringify(newList));
      };
      syncPickup();
      return newList;
    });
  }, [user?.id, userKey, pickupKey]);

  return (
    <RecentViewedContext.Provider value={{ recentProducts, pickupProducts, addToRecentlyViewed }}>
      {children}
    </RecentViewedContext.Provider>
  );
};

const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const cartLoaded = useRef(false);
  const userKey = user?.id ? `DACHCart_cart_${user.id}` : 'DACHCart_cart_guest';

  // Load cart when user changes
  useEffect(() => {
    const fetchCart = async () => {
      cartLoaded.current = false;
      const guestItems = JSON.parse(localStorage.getItem('DACHCart_cart_guest') || '[]');
      let finalCart = [];

      if (user?.id) {
        try {
          const token = localStorage.getItem('token');
          // sync_user on backend already refreshes prices for logged-in users
          const response = await axios.get(`${API}/users/sync`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (response.data && response.data.cart) {
            let updatedCart = response.data.cart;
            if (guestItems.length > 0) {
              const userCartIds = new Set(updatedCart.map(i => i.id));
              const uniqueGuestItems = guestItems.filter(i => !userCartIds.has(i.id));
              if (uniqueGuestItems.length > 0) {
                for (const item of uniqueGuestItems) {
                  await axios.post(`${API}/users/cart/items`, item, {
                    headers: { Authorization: `Bearer ${token}` }
                  });
                }
                const refetch = await axios.get(`${API}/users/sync`, {
                  headers: { Authorization: `Bearer ${token}` }
                });
                updatedCart = refetch.data.cart;
                localStorage.removeItem('DACHCart_cart_guest');
              }
            }
            finalCart = updatedCart;
          }
        } catch (e) {
          console.error("Failed to sync cart from backend", e);
        }
      } else {
        // Guest mode: Refresh prices for local items
        try {
          const savedCart = localStorage.getItem(userKey);
          let localItems = savedCart ? JSON.parse(savedCart) : [];

          if (localItems.length > 0) {
            const productIds = localItems.map(item => item.id);
            const priceRes = await axios.post(`${API}/products/refresh-prices`, productIds);
            const updatedPrices = priceRes.data;

            localItems = localItems.map(item => ({
              ...item,
              price: updatedPrices[item.id] !== undefined ? updatedPrices[item.id] : item.price
            }));
          }
          finalCart = localItems;
        } catch (e) {
          console.error("Failed to refresh guest cart prices", e);
          finalCart = [];
        }
      }

      setCartItems(finalCart);
      cartLoaded.current = true;
    };

    fetchCart();
  }, [user?.id, userKey]);

  // Save cart to local storage always
  useEffect(() => {
    if (cartItems.length > 0 || localStorage.getItem(userKey)) {
      localStorage.setItem(userKey, JSON.stringify(cartItems));
    }
  }, [cartItems, userKey]);


  const addToCart = async (product) => {
    // 1. Optimistic UI Update
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + (product.quantity || 1) }
            : item
        );
      } else {
        return [...prevItems, {
          ...product,
          quantity: product.quantity || 1,
          selected: true,
          delivery_type: product.delivery_type,
          delivery_charge: product.delivery_charge,
          free_delivery_above: product.free_delivery_above
        }];
      }
    });

    // 2. Backend Sync if logged in
    if (user?.id) {
      try {
        const token = localStorage.getItem('token');
        // Construct the item payload exactly as expected by backend model
        const itemPayload = {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: product.quantity || 1,
          image: product.image || (product.images && product.images[0]) || "",
          vendor_id: product.vendor_id,
          category: product.category,
          delivery_type: product.delivery_type,
          delivery_charge: product.delivery_charge,
          free_delivery_above: product.free_delivery_above,
          selected: true
        };
        await axios.post(`${API}/users/cart/items`, itemPayload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (e) {
        console.error("Failed to add to cart backend", e);
        // Optionally revert state here if strict consistency needed
      }
    }
  };

  const removeFromCart = async (id) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== id));

    if (user?.id) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API}/users/cart/items/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (e) {
        console.error("Failed to remove from cart backend", e);
      }
    }
  };

  const toggleSelected = (id) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
    // Note: selection state is usually local, but if we want to persist it, we might need a specific endpoint or just leave it local/session
  };

  const updateQuantity = async (id, quantity) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }

    // Calculate difference for efficient update if needed, but for now we just "set" logic or "add" logic
    // Our backend adds quantity, so setting absolute quantity is tricky with just $inc unless we compute diff.
    // For simplicity with current backend add_to_cart (which is $inc), we might need an explicit 'update quantity' endpoint or careful logic.
    // Actually, let's just use the bulk update for quantity changes OR improved logic.
    // Given the constraints, let's just update local and do a debounced bulk sync OR implement a set_quantity endpoint.
    // For now, let's stick to Local + Background Sync for quantity to avoid complexity, or better:

    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );

    // Debounced sync for this specific item or just use the old Put for full cart if complex?
    // Let's rely on the fact that we can just Push the difference? No, easier to just use the PUT endpoint for quantity updates
    // if we don't want to make a new "set quantity" endpoint.
    // Lets use the existing Bulk PUT for quantity updates to be safe, but explicitly triggered, not effect based.

    if (user?.id) {
      // Create a small debounce or just fire and forget (eventual consistency)
      // We'll use a timeout ref in a real app, but here:
      setTimeout(async () => {
        try {
          const token = localStorage.getItem('token');
          // We need the latest items, but inside timeout we might have stale closure.
          // It's safer to use the Effect for "quantity" updates if we want to avoid refactoring everything.
          // BUT, the user complained about empty array.
          // Let's try to make a dedicated update call for the item using the add_to_cart with a "set" flag? 
          // Or just use the bulk update BUT ONLY when we confirm we have a non-empty cart?

          // Let's keep it simple: We already updated local state.
          // We will add a debounced sync in the Effect ONLY if cart is NOT empty.
        } catch (e) { }
      }, 500);
    }
  };

  // Re-enable the effect but with a guard clause
  useEffect(() => {
    const syncCart = async () => {
      if (user?.id && cartLoaded.current && cartItems.length > 0) {
        try {
          const token = localStorage.getItem('token');
          await axios.put(`${API}/users/cart`, cartItems, {
            headers: { Authorization: `Bearer ${token}` }
          });
        } catch (e) {
          console.error("Cart sync failed", e);
        }
      }
    };

    const timeoutId = setTimeout(syncCart, 2000);
    return () => clearTimeout(timeoutId);
  }, [cartItems, user?.id]);

  const getCartTotal = () => {
    return cartItems
      .filter(item => item.selected)
      .reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      toggleSelected,
      updateQuantity,
      getCartTotal,
      getCartCount
    }}>
      {children}
    </CartContext.Provider>
  );
};

const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);
  const wishlistLoaded = useRef(false);
  const userKey = user?.id ? `DACHCart_wishlist_${user.id}` : 'DACHCart_wishlist_guest';

  // Load wishlist when user changes
  useEffect(() => {
    const fetchWishlist = async () => {
      wishlistLoaded.current = false;
      const guestItems = JSON.parse(localStorage.getItem('DACHCart_wishlist_guest') || '[]');

      if (user?.id) {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get(`${API}/users/sync`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (response.data && response.data.wishlist) {
            // Merge guest wishlist
            let updatedWishlist = response.data.wishlist;
            if (guestItems.length > 0) {
              const userWishIds = new Set(updatedWishlist.map(i => i.id));
              const uniqueGuestItems = guestItems.filter(i => !userWishIds.has(i.id));
              if (uniqueGuestItems.length > 0) {
                for (const item of uniqueGuestItems) {
                  await axios.post(`${API}/users/wishlist/items`, item, {
                    headers: { Authorization: `Bearer ${token}` }
                  });
                }
                const refetch = await axios.get(`${API}/users/sync`, {
                  headers: { Authorization: `Bearer ${token}` }
                });
                updatedWishlist = refetch.data.wishlist;

                localStorage.removeItem('DACHCart_wishlist_guest');
              }
            }
            setWishlistItems(updatedWishlist);
            wishlistLoaded.current = true;
            return;
          }
        } catch (e) {
          console.error("Failed to sync wishlist from backend", e);
        }
      }

      try {
        const savedWishlist = localStorage.getItem(userKey);
        setWishlistItems(savedWishlist ? JSON.parse(savedWishlist) : []);
      } catch (e) {
        setWishlistItems([]);
      }
      wishlistLoaded.current = true;
    };

    fetchWishlist();
  }, [user?.id, userKey]);

  // Save wishlist to local storage always
  useEffect(() => {
    if (wishlistItems.length > 0 || localStorage.getItem(userKey)) {
      localStorage.setItem(userKey, JSON.stringify(wishlistItems));
    }
  }, [wishlistItems, userKey]);

  const addToWishlist = async (product) => {
    setWishlistItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      if (!existingItem) {
        return [...prevItems, product];
      }
      return prevItems;
    });

    if (user?.id) {
      try {
        const token = localStorage.getItem('token');
        const itemPayload = {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image || (product.images && product.images[0]) || "",
          category: product.category,
          rating: product.rating || 5.0
        };
        await axios.post(`${API}/users/wishlist/items`, itemPayload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (e) {
        console.error("Failed to add to wishlist backend", e);
      }
    }
  };

  const removeFromWishlist = async (id) => {
    setWishlistItems(prevItems => prevItems.filter(item => item.id !== id));

    if (user?.id) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API}/users/wishlist/items/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (e) {
        console.error("Failed to remove from wishlist backend", e);
      }
    }
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
    { id: 1, code: 'DACH20', value: 20, type: 'percentage', target: 'global', minOrder: 1000, expiry: '2026-12-31', limit: 100, used: 45 },
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
    <section className="relative min-h-[30vh] md:min-h-[70vh] flex items-center overflow-hidden bg-gradient-to-br from-slate-950 via-violet-950 to-slate-950">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient Orbs */}
        <div className="absolute top-0 -left-40 w-[400px] h-[400px] bg-violet-600/20 rounded-full filter blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-0 -right-40 w-[500px] h-[500px] bg-indigo-600/15 rounded-full filter blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Main Content Container */}
      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="grid lg:grid-cols-12 gap-6 lg:gap-10 items-center">

          {/* Left Content - Text & CTA */}
          <div className="lg:col-span-6 text-center lg:text-left space-y-6 order-2 lg:order-1 hidden lg:block">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mt-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/80">New Season</span>
            </div>

            {/* Main Heading */}
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black leading-tight tracking-tighter">
                <span className="text-white">Discover Your</span>
                <br />
                <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 bg-clip-text text-transparent">Perfect Style</span>
              </h1>
              <p className="text-base lg:text-lg text-white/60 max-w-md mx-auto lg:mx-0 leading-relaxed font-medium">
                Premium products with elite deals and lightning-fast delivery.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/shop">
                <Button
                  size="default"
                  className="w-full sm:w-auto bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white border-0 px-6 py-5 text-sm font-black rounded-lg shadow-lg shadow-violet-500/20 transition-all duration-300 group uppercase tracking-widest"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Shop Now
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>

            {/* Trust Stats */}
            <div className="flex items-center gap-6 justify-center lg:justify-start pt-2">
              <div className="text-center lg:text-left">
                <p className="text-2xl font-black text-white leading-none">{stats.happy_customers?.toLocaleString() || '50K+'}</p>
                <p className="text-[10px] text-white/50 uppercase font-bold mt-1 tracking-widest">Customers</p>
              </div>
              <div className="w-px h-10 bg-white/10"></div>
              <div className="text-center lg:text-left">
                <p className="text-2xl font-black text-white leading-none">{stats.total_products?.toLocaleString() || '10K+'}</p>
                <p className="text-[10px] text-white/50 uppercase font-bold mt-1 tracking-widest">Products</p>
              </div>
            </div>
          </div>

          {/* Right Content - Hero Visual (Full width on mobile) */}
          <div className="lg:col-span-6 order-1 lg:order-2 w-full lg:w-auto">
            <div className="relative">
              {/* Main Image Card */}
              <div className="relative bg-transparent lg:bg-white/10 lg:backdrop-blur-xl rounded-none lg:rounded-[2.5rem] p-0 lg:p-2 border-0 lg:border lg:border-white/10 shadow-none lg:shadow-2xl">
                <Carousel className="relative rounded-none lg:rounded-[2rem] overflow-hidden">
                  <CarouselContent>
                    <CarouselItem>
                      <div className="relative h-[220px] sm:h-[350px] lg:h-[400px]">
                        <img
                          src="assets/slider1.jpeg"
                          alt="Modern fashion collection"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent lg:hidden"></div>
                        <div className="absolute bottom-4 left-4 lg:hidden">
                          <p className="text-white text-lg font-bold">New Fashion Arrivals</p>
                        </div>
                      </div>
                    </CarouselItem>
                    <CarouselItem>
                      <div className="relative h-[220px] sm:h-[350px] lg:h-[400px]">
                        <img
                          src="assets/slider2.jpeg"
                          alt="Premium tech products"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent lg:hidden"></div>
                        <div className="absolute bottom-4 left-4 lg:hidden">
                          <p className="text-white text-lg font-bold">Premium Electronics</p>
                        </div>
                      </div>
                    </CarouselItem>
                    <CarouselItem>
                      <div className="relative h-[220px] sm:h-[350px] lg:h-[400px]">
                        <img
                          src="assets/slider3.jpeg"
                          alt="Luxury watches"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent lg:hidden"></div>
                        <div className="absolute bottom-4 left-4 lg:hidden">
                          <p className="text-white text-lg font-bold">Luxury Collection</p>
                        </div>
                      </div>
                    </CarouselItem>
                  </CarouselContent>
                  <CarouselPrevious className="left-4 bg-white/10 border-white/20 text-white hover:bg-white/20 hidden lg:flex" />
                  <CarouselNext className="right-4 bg-white/10 border-white/20 text-white hover:bg-white/20 hidden lg:flex" />
                </Carousel>
              </div>

              {/* Floating Feature Cards (Desktop Only) */}
              <div className="hidden lg:block absolute -left-16 top-1/4 transform -translate-y-1/2 z-20">
                <div className="bg-white rounded-2xl p-4 shadow-2xl animate-[bounce_3s_ease-in-out_infinite] border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/30">
                      <Truck className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">Free Shipping</p>
                      <p className="text-xs text-gray-500">Orders over ₹1499</p>
                    </div>
                  </div>
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
      description: "Free shipping on all orders over ₹1499",
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
      image: "/assets/audio-elite.jpg",
      description: "Experience sound like never before with our studio-grade headphones.",
      width: "col-span-1 lg:col-span-2",
      height: "h-[240px] lg:h-[300px]",
      link: "/shop?category=electronics"
    },
    {
      title: "Pro Workspaces",
      tag: "Efficiency",
      image: "/assets/pro-workspaces.jpg",
      description: "Minimalist desk setups for maximum focus.",
      width: "col-span-1",
      height: "h-[240px] lg:h-[300px]",
      link: "/shop?category=home-garden"
    },
    {
      title: "Active Life",
      tag: "Peak Performance",
      image: "assets/active-life.jpg",
      description: "Gear that moves with you.",
      width: "col-span-1",
      height: "h-[240px] lg:h-[360px]",
      link: "/shop?category=sports"
    },
    {
      title: "Urban Style",
      tag: "2025 Look",
      image: "/assets/urban-style.jpg",
      description: "Modern fashion for the urban explorer.",
      width: "col-span-1 lg:col-span-2",
      height: "h-[240px] lg:h-[360px]",
      link: "/shop?category=fashion"
    }
  ];

  return (
    <section className="py-6 bg-white overflow-hidden">
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
    <section className="py-6 bg-gray-50/50 mb-[2px]">
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

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 md:gap-8">
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
                  <Link to={`/product/${product.id}`}>
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
          // Only consider actual active special offers
          const activeDeals = products.filter(p => p.is_special_active);

          if (activeDeals.length > 0) {
            activeDeals.sort((a, b) => b.discount - a.discount);
            setBestDeal(activeDeals[0]);
          } else {
            setBestDeal(null);
          }
        }
      } catch (error) {
        console.error("Failed to fetch deals", error);
      }
    };
    fetchBestDeal();
  }, []);

  useEffect(() => {
    if (!bestDeal || !bestDeal.special_offer_end) {
      setTimeLeft({ days: '00', hours: '00', mins: '00', secs: '00' });
      return;
    }

    const targetDate = new Date(bestDeal.special_offer_end);

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      if (distance <= 0) {
        setTimeLeft({ days: '00', hours: '00', mins: '00', secs: '00' });
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Mobile Layout (Different) */}
        <div className="lg:hidden py-8">
          {bestDeal ? (
            <Link to={`/product/${bestDeal.id}`} className="block">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-xl flex gap-4 items-center">
                <div className="w-1/3 aspect-square bg-white/5 rounded-xl flex items-center justify-center p-2 relative overflow-hidden">
                  <img
                    src={bestDeal.image}
                    alt={bestDeal.name}
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute top-0 left-0 bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-br-lg">
                    -{bestDeal.discount}%
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className="bg-amber-400 text-black text-[8px] px-1.5 py-0">FLASH SALE</Badge>
                    <p className="text-rose-300 text-[10px] font-bold animate-pulse">Ending Soon</p>
                  </div>
                  <h3 className="text-white font-bold text-lg leading-tight truncate mb-1">{bestDeal.name}</h3>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-xl font-black text-white">₹{bestDeal.price}</span>
                    <span className="text-xs text-white/50 line-through">₹{bestDeal.originalPrice}</span>
                  </div>
                  <div className="flex gap-1">
                    {[
                      { v: timeLeft.days, l: "D" },
                      { v: timeLeft.hours, l: "H" },
                      { v: timeLeft.mins, l: "M" },
                      { v: timeLeft.secs, l: "S" }
                    ].map((t, i) => (
                      <div key={i} className="bg-black/30 rounded px-1.5 py-0.5 min-w-[24px] text-center">
                        <span className="text-white font-bold text-xs block leading-none">{t.v}</span>
                        <span className="text-[8px] text-white/50 block leading-none mt-0.5">{t.l}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Link>
          ) : (
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 text-center">
              <Sparkles className="w-8 h-8 text-amber-400 mx-auto mb-3 opacity-50" />
              <p className="text-white font-bold uppercase tracking-widest text-[10px]">No deals available now</p>
              <p className="text-white/40 text-[9px] mt-1">Check back later for exclusive offers</p>
            </div>
          )}
        </div>

        {/* Desktop Layout (Original) */}
        <div className="hidden lg:grid grid-cols-[3fr_2fr] gap-8 items-center">
          <div className="space-y-4 text-left pt-16 pb-8">
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white text-[9px] font-black uppercase tracking-[0.2em]">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              Elite Deal Protocol
            </div>

            <h2 className="text-7xl font-black text-white leading-[0.9] tracking-tighter">
              THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-rose-300 to-violet-300">ULTIMATE</span>
              <span className="block mt-1">FLASH SALE.</span>
            </h2>

            <p className="text-white/60 text-base max-w-xl font-medium leading-relaxed">
              Unlock exclusive elite-tier discounts across our entire synchronized inventory.
            </p>

            <div className="flex items-center justify-start gap-5">
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

          <div className="relative">
            {bestDeal ? (
              <div className="relative group p-4 transform scale-100">
                <div className="absolute -inset-6 bg-gradient-to-tr from-rose-500/10 to-violet-600/10 rounded-full blur-[80px] opacity-50 group-hover:opacity-100 transition-opacity"></div>
                <Link to={`/product/${bestDeal.id}`} className="block">
                  <div className="relative bg-white/5 backdrop-blur-md rounded-[40px] p-6 border border-white/10 shadow-2xl overflow-hidden transform rotate-2 group-hover:rotate-0 transition-transform duration-1000 max-w-[400px] ml-auto cursor-pointer">
                    <img
                      src={bestDeal.image}
                      alt={bestDeal.name}
                      className="w-full object-contain rounded-[40px] brightness-90 group-hover:brightness-100 transition-all duration-700 mx-auto"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/80 via-transparent to-transparent"></div>
                    <div className="absolute bottom-10 left-8 right-8 text-left">
                      <p className="text-white font-black text-4xl leading-none tracking-tighter ml-6">{bestDeal.discount}% OFF</p>
                      <p className="text-white/60 text-[10px] font-bold uppercase mt-2 tracking-widest ml-6">Limited Batch Reveal</p>
                    </div>
                  </div>
                </Link>
              </div>
            ) : (
              <div className="relative bg-white/5 backdrop-blur-xl rounded-[40px] p-12 border border-white/10 shadow-2xl text-center max-w-[400px] ml-auto">
                <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-10 h-10 text-amber-400 opacity-20" />
                </div>
                <h3 className="text-white text-xl font-black uppercase tracking-tighter italic mb-2">No deals available now</h3>
                <p className="text-white/40 text-xs font-medium">Our elite-tier flash sales have concluded. Stay tuned for the next synchronization.</p>
              </div>
            )}
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

        const products = prodRes.data;
        setProducts(products);

        // Derive categories from actual products (same logic as Categories.js)
        const uniqueProductCategories = [...new Set(products.map(p => p.category).filter(Boolean))];
        const activeCategories = uniqueProductCategories.map(catName => {
          const metadata = catRes.data.find(bc => bc.name?.toLowerCase() === catName.toLowerCase());
          return {
            name: catName,
            link: metadata?.link || `/shop?category=${encodeURIComponent(catName.toLowerCase())}`
          };
        });

        setCategories(activeCategories);
      } catch (error) {
        console.error("Failed to fetch discovery data", error);
      }
    };
    fetchData();
  }, []);

  if (categories.length === 0) return null;

  return (
    <section className="py-16 bg-gray-50 border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <div className="space-y-2">
            <Badge className="bg-violet-100 text-violet-600 border-none px-4 py-1.5 font-bold text-[10px] uppercase tracking-widest">
              Collections
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 tracking-tight">
              Shop by <span className="text-violet-600">Category</span>
            </h2>
          </div>
          <Link to="/categories">
            <Button variant="ghost" className="text-violet-600 hover:text-violet-700 font-bold uppercase text-xs tracking-widest group">
              View All
              <ChevronRight className="ml-1 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories
            .slice(0, 4)
            .map((cat, i) => {
              const firstProduct = products.find(p => p.category?.toLowerCase() === cat.name?.toLowerCase());

              const iconMap = {
                'electronics': Laptop,
                'fashion': Shirt,
                'accessories': Watch,
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
                  className="group rounded-3xl border border-gray-200/60 p-10 flex flex-col items-center justify-center text-center hover:bg-white hover:shadow-2xl hover:border-violet-100 transition-all duration-500 min-h-[250px]"
                >
                  <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm group-hover:shadow-xl group-hover:scale-110 transition-all duration-300 relative overflow-hidden">
                    {firstProduct?.image ? (
                      <img src={firstProduct.image} alt={cat.name} className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-700" />
                    ) : (
                      <IconComponent className="w-12 h-12 text-violet-600" />
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-violet-600 transition-colors">
                    {cat.name}
                  </h3>
                  <div className="flex items-center gap-2 px-4 py-1.5 bg-gray-50 rounded-full group-hover:bg-violet-50 transition-colors">
                    <span className="text-xs font-bold text-violet-600 uppercase tracking-widest">
                      Explore
                    </span>
                    <ChevronRight className="w-4 h-4 text-violet-600 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
        </div>
      </div>
    </section>
  );
};

// Featured Categories Section
const FeaturedCategoriesSection = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchActiveCategories = async () => {
      try {
        const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
        const [catRes, prodRes] = await Promise.all([
          axios.get(`${API_BASE}/api/public/categories`),
          axios.get(`${API_BASE}/api/products`)
        ]);

        const products = prodRes.data;
        const uniqueProductCategories = [...new Set(products.map(p => p.category).filter(Boolean))];

        const colorMap = {
          0: "bg-blue-500", 1: "bg-pink-500", 2: "bg-amber-500",
          3: "bg-emerald-500", 4: "bg-violet-500", 5: "bg-rose-500",
          6: "bg-indigo-500", 7: "bg-orange-500"
        };

        const iconMap = {
          'electronics': Laptop,
          'fashion': Shirt,
          'accessories': Watch,
          'home': HomeIcon,
          'sports': Dumbbell,
          'books': BookOpen
        };

        const activeCategories = uniqueProductCategories.slice(0, 6).map((catName, index) => {
          const metadata = catRes.data.find(bc => bc.name?.toLowerCase() === catName.toLowerCase());
          return {
            name: catName,
            icon: iconMap[catName.toLowerCase()] || Sparkles,
            color: colorMap[index % 8],
            link: metadata?.link || `/shop?category=${encodeURIComponent(catName.toLowerCase())}`
          };
        });

        setCategories(activeCategories);
      } catch (err) {
        console.error("Failed to fetch featured categories", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchActiveCategories();
  }, []);

  if (isLoading || categories.length === 0) return null;

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-16 gap-6">
          <div className="space-y-4">
            <Badge className="bg-violet-100 text-violet-600 border-none font-bold uppercase tracking-widest px-4 py-1">Explore</Badge>
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 tracking-tight">Featured Categories</h2>
            <p className="text-gray-500 max-w-2xl text-lg">Browse our wide range of active categories and find exactly what you're looking for.</p>
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
        const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
        const response = await axios.get(`${API_BASE}/api/products?only_deals=true&limit=100`);

        // Sort by discount descending and take top 4
        const highestOffers = response.data
          .sort((a, b) => (b.discount || 0) - (a.discount || 0))
          .slice(0, 4);

        setDeals(highestOffers);
      } catch (e) {
        console.error("Error fetching homepage deals:", e);
      }
    };
    fetchDeals();

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.s > 0) return { ...prev, s: prev.s - 1 };
        if (prev.m > 0) return { h: prev.h, m: prev.m - 1, s: 59 };
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
            <div key={p.id} className="group bg-white/5 backdrop-blur-md border border-white/10 rounded-[2.5rem] p-6 transition-all duration-500 hover:bg-white/10 hover:-translate-y-2 shadow-2xl relative">
              <Link to={`/product/${p.id}`} className="block">
                <div className="relative aspect-square rounded-3xl overflow-hidden mb-6 bg-white/10">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-full object-contain p-4 transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                    onError={(e) => { e.target.src = "/assets/zlogo.png" }}
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-rose-600 text-white border-none font-black uppercase italic tracking-tighter">SAVE {p.discount}%</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-3 h-3 ${i < Math.floor(p.rating || 4) ? 'fill-amber-400 text-amber-400' : 'text-white/20'}`} />
                  ))}
                  <span className="text-[10px] text-gray-500 font-bold ml-1">({p.reviews?.length || 0})</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2 line-clamp-1 group-hover:text-violet-400 transition-colors">{p.name}</h3>
                <div className="flex items-end gap-3 mb-6">
                  <span className="text-3xl font-black text-white tracking-tighter">₹{p.price.toLocaleString()}</span>
                  {p.originalPrice > p.price && (
                    <span className="text-sm text-gray-400 line-through font-bold mb-1">₹{p.originalPrice.toLocaleString()}</span>
                  )}
                </div>
              </Link>
              <Button
                className="w-full bg-white text-gray-950 hover:bg-violet-400 hover:text-white rounded-2xl h-14 font-black uppercase tracking-widest transition-all shadow-xl mt-auto"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  addToCart({ ...p, quantity: 1 });
                }}
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

// Category Shelf Component
const CategoryProductShelf = ({ category, title }) => {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
        const response = await axios.get(`${API_BASE}/api/products?category=${category}&limit=4`);
        setProducts(response.data);
      } catch (err) {
        console.error(`Failed to fetch ${category} products`, err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [category]);

  if (isLoading || products.length === 0) return null;

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-16">
          <div className="space-y-2">
            <Badge className="bg-violet-100 text-violet-600 border-none font-black uppercase tracking-widest text-[10px]">Featured Collection</Badge>
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 tracking-tighter uppercase">{title}</h2>
          </div>
          <Link to={`/shop?category=${encodeURIComponent(category)}`} className="text-violet-600 font-black uppercase tracking-widest text-xs flex items-center gap-2 group bg-white px-6 py-3 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
            View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {products.map(p => (
            <div key={p.id} className="group relative">
              <div className="relative aspect-[3/4] rounded-[2rem] overflow-hidden bg-gray-100 mb-6 border border-gray-50 flex items-center justify-center p-4">
                <img src={p.image} alt={p.name} className="max-w-full max-h-full object-contain transition-transform duration-1000 group-hover:scale-110" loading="lazy" />
                <div className="absolute top-6 left-6 flex flex-col gap-2">
                  {p.discount > 0 && <Badge className="bg-rose-500 text-white border-none font-black px-3 py-1 text-[10px] shadow-xl">-{p.discount}% OFF</Badge>}
                </div>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                  <Button size="icon" className="bg-white text-gray-900 rounded-full hover:bg-violet-600 hover:text-white transition-all shadow-2xl" onClick={() => addToCart(p)}>
                    <ShoppingCart className="w-5 h-5" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-1 mb-2 px-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-3 h-3 ${i < Math.floor(p.rating || 0) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                ))}
                <span className="text-[9px] font-black text-gray-400 ml-1">({p.reviews?.length || 0})</span>
              </div>
              <Link to={`/product/${p.id}`}>
                <h3 className="text-xl font-bold text-gray-900 mb-1 px-2 line-clamp-1 hover:text-violet-600 transition-colors">{p.name}</h3>
              </Link>
              <p className="text-gray-500 text-sm px-2 mb-3 font-medium capitalize">{p.category}</p>
              <div className="flex items-center gap-2 px-2">
                <span className="text-2xl font-black text-violet-600 tracking-tighter">₹{p.price.toLocaleString()}</span>
                {p.discount > 0 && <span className="text-sm text-gray-400 line-through font-bold">₹{Math.round(p.price / (1 - p.discount / 100)).toLocaleString()}</span>}
              </div>
            </div>
          ))}
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
              <Link to={`/product/${p.id}`}>
                <h3 className="text-xl font-bold text-gray-900 mb-1 px-2 line-clamp-1 hover:text-violet-600 transition-colors">{p.title}</h3>
              </Link>
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


// Mobile Category Strip (Amazon Style)
const MobileCategoryStrip = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchActiveCategories = async () => {
      try {
        const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
        const [catRes, prodRes] = await Promise.all([
          axios.get(`${API_BASE}/api/public/categories`),
          axios.get(`${API_BASE}/api/products`)
        ]);

        const products = prodRes.data;
        const uniqueProductCategories = [...new Set(products.map(p => p.category).filter(Boolean))];

        const iconMap = {
          'electronics': Laptop,
          'fashion': Shirt,
          'accessories': Watch,
          'home': HomeIcon,
          'sports': Dumbbell,
          'books': BookOpen
        };

        const activeCategories = uniqueProductCategories.map((catName) => {
          const metadata = catRes.data.find(bc => bc.name?.toLowerCase() === catName.toLowerCase());
          const firstProduct = products.find(p => p.category?.toLowerCase() === catName.toLowerCase());

          return {
            name: catName,
            icon: iconMap[catName.toLowerCase()] || Sparkles,
            image: firstProduct?.image,
            link: metadata?.link || `/shop?category=${encodeURIComponent(catName.toLowerCase())}`
          };
        });

        // Add 'Flash Deals' at the start
        const allCats = [
          { name: "Deals", icon: TrendingUp, color: "text-rose-500", link: "/deals" },
          ...activeCategories.map(c => ({ ...c, color: "text-violet-600" }))
        ];

        setCategories(allCats);
      } catch (err) {
        console.error("Failed to fetch mobile categories", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchActiveCategories();
  }, []);

  if (isLoading || categories.length === 0) return null;

  return (
    <div className="lg:hidden bg-white border-b border-gray-100 overflow-x-auto no-scrollbar py-3 px-1">
      <div className="flex items-center gap-4 px-3 w-max">
        {categories.map((cat, i) => (
          <Link
            key={i}
            to={cat.link}
            className="flex flex-col items-center gap-2 flex-shrink-0"
          >
            <div className={`w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center shadow-sm border border-gray-100 active:scale-95 transition-transform overflow-hidden p-1`}>
              {cat.image ? (
                <img src={cat.image} alt={cat.name} className="w-full h-full object-contain" />
              ) : (
                <cat.icon className={`w-6 h-6 ${cat.color}`} />
              )}
            </div>
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-tighter whitespace-nowrap">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

// Amazon Style 2x2 Grid Card for Mobile
const AmazonGridCard = ({ title, items, link }) => (
  <Card className="lg:hidden border-0 shadow-sm rounded-none bg-white p-3 mb-2">
    <h3 className="text-sm font-bold text-gray-900 mb-2">{title}</h3>
    <div className="grid grid-cols-2 gap-2">
      {items.map((item, i) => (
        <Link key={i} to={item.link} className="flex flex-col gap-1">
          <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden border border-gray-50">
            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
          </div>
          <p className="text-[10px] font-medium text-gray-700 line-clamp-1">{item.name}</p>
        </Link>
      ))}
    </div>
    <Link to={link || "/shop"} className="inline-block mt-3 text-[10px] font-bold text-violet-600">
      See more
    </Link>
  </Card>
);

// Fallback items if nothing is viewed yet
const fallbackViews = [
  { name: "Smartphone", image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80", link: "/shop" },
  { name: "Headphones", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80", link: "/shop" },
  { name: "Smartwatch", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80", link: "/shop" },
  { name: "Camera", image: "https://images.unsplash.com/photo-1526170315870-ef6876f84d9d?w=400&q=80", link: "/shop" },
];

// Home Page Component
const Home = () => {
  const [stats, setStats] = useState({
    happy_customers: 0,
    total_products: 0,
    total_vendors: 0,
    satisfaction_rate: "100%"
  });
  const [reviews, setReviews] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);


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

  const { recentProducts, pickupProducts } = useRecentlyViewed();

  useEffect(() => {
    fetchStats();
    fetchReviews();
  }, []);

  // Use provider data for the mobile grid, or fallback if empty
  const displayPickupItems = pickupProducts.length > 0
    ? pickupProducts.slice(0, 4).map(p => ({
      name: p.name,
      image: p.image || p.thumbnail,
      link: `/product/${p.id}`
    }))
    : fallbackViews;

  return (
    <div className="min-h-screen bg-gray-50 lg:bg-white pb-20 lg:pb-0">
      <Navigation />

      {/* Mobile Layout - User said it's okay */}
      <div className="lg:hidden">
        {/* Mobile-Only Strip */}
        <div className="pt-[145px] mb-1">
          <MobileCategoryStrip />
        </div>

        {/* Hero Section */}
        <HeroSection stats={stats} />

        {/* Mobile Grid Sections */}
        <div className="space-y-2 mt-2">
          <AmazonGridCard
            title="Pick up where you left off"
            items={displayPickupItems}
          />
          <AmazonGridCard
            title="International Brands"
            items={[
              { name: "Electronics", image: "assets/electronics.jpg", link: "/shop?category=electronics" },
              { name: "Luxury Fashion", image: "assets/urban-style.jpg", link: "/shop?category=fashion" },
              { name: "Smart Home", image: "assets/smart-home.jpg", link: "/shop?category=home" },
              { name: "Pro Fitness", image: "assets/active-life.jpg", link: "/shop?category=sports" },
            ]}
            link="/categories"
          />
        </div>


        <PromoBannerSection />

        {/* Electronics Shelf (Mobile) */}
        <CategoryProductShelf category="electronics" title="Electronics" />

        <div className="bg-white px-4 py-6 mt-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 uppercase tracking-tighter">Recommended For You</h2>
            <Link to="/shop" className="text-xs font-bold text-violet-600">View All</Link>
          </div>
          <FeaturedProductsSection />
        </div>
      </div>

      {/* Desktop Layout - RESTORED OLD STYLE */}
      <div className="hidden lg:block">
        <HeroSection stats={stats} />
        <FeaturesSection />
        <CategoriesSection />
        <ModernBentoGrid />

        {/* Electronics Shelf (Desktop) */}
        <CategoryProductShelf category="electronics" title="Electronics" />

        <PromoBannerSection />
        <div className="bg-white">
          <FeaturedProductsSection />
        </div>
        <Footer />
      </div>
    </div >
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
    return localStorage.getItem('DACH_app_mode') || null;
  });
  const navigate = useNavigate();

  const handleSelectApp = (mode) => {
    setAppMode(mode);
    localStorage.setItem('DACH_app_mode', mode);
    if (mode === 'ecommerce') {
      navigate('/');
    } else if (mode === 'food') {
      navigate('/food');
    }
  };

  const switchToLanding = () => {
    setAppMode(null);
    localStorage.removeItem('DACH_app_mode');
    navigate('/');
  };

  const switchToEcommerce = () => {
    setAppMode('ecommerce');
    localStorage.setItem('DACH_app_mode', 'ecommerce');
    navigate('/');
  };

  const switchToFood = () => {
    setAppMode('food');
    localStorage.setItem('DACH_app_mode', 'food');
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
      {/* Restaurant Owner Routes */}
      <Route path="/food/vendor/login" element={<RestaurantLogin />} />
      <Route path="/food/vendor/dashboard" element={
        <ProtectedRoute requiredRole="restaurant">
          <RestaurantDashboard />
        </ProtectedRoute>
      } />
      <Route path="/food/vendor/*" element={
        <ProtectedRoute requiredRole="restaurant">
          <RestaurantDashboard />
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
        {commonRoutes}
        <Route path="/food/*" element={<FoodApp onSwitchApp={switchToEcommerce} />} />
        {/* If we are in food mode but land on any other page, go to FoodApp */}
        <Route path="*" element={<FoodApp onSwitchApp={switchToEcommerce} />} />
      </Routes>
    );
  }

  // Default: E-commerce mode (DACHCart)
  return (
    <Routes>
      {commonRoutes}
      <Route path="/food/*" element={<FoodApp onSwitchApp={switchToEcommerce} />} />
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
                <RecentlyViewedProvider> {/* Added RecentlyViewedProvider */}
                  <BrowserRouter>
                    <ScrollToTop />
                    <AppRouter />
                  </BrowserRouter>
                </RecentlyViewedProvider>
              </OrderProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </CouponProvider>
    </div>
  );
}

export default App;
