import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart, useWishlist, useAuth } from "../App";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import axios from "axios";
import {
  ShoppingCart,
  Search,
  Heart,
  User,
  Menu,
  X,
  ChevronDown,
  Clock,
  TrendingUp,
  Bell,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  Utensils,
  Home,
  Package,
  MapPin,
  Settings,
  ArrowLeft
} from "lucide-react";
import CartDrawer from "./CartDrawer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [products, setProducts] = useState([]);
  const [recentSearches, setRecentSearches] = useState(() => {
    const saved = localStorage.getItem('recentSearches');
    return saved ? JSON.parse(saved) : [];
  });
  const searchRef = useRef(null);
  const { getCartCount } = useCart();
  const { getWishlistCount } = useWishlist();
  const cartCount = getCartCount();
  const wishlistCount = getWishlistCount();

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);
  const recentSearchesFetched = useRef(false);

  // Fetch notifications for authenticated user
  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchRecentSearches();
      const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchRecentSearches = async () => {
    try {
      const guestSearches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
      const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
      const response = await axios.get(`${API_BASE}/api/users/recent-searches`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      let updatedSearches = response.data || [];
      if (guestSearches.length > 0) {
        const userSearchSet = new Set(updatedSearches.map(s => s.toLowerCase()));
        const uniqueGuestSearches = guestSearches.filter(s => !userSearchSet.has(s.toLowerCase()));

        if (uniqueGuestSearches.length > 0) {
          updatedSearches = [...uniqueGuestSearches, ...updatedSearches].slice(0, 10);
          // Sync merged back to backend
          await axios.put(`${API_BASE}/api/users/recent-searches`, updatedSearches, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
        }
      }

      setRecentSearches(updatedSearches);
      recentSearchesFetched.current = true;
    } catch (e) {
      console.error("Failed to fetch recent searches:", e);
    }
  };

  const fetchNotifications = async () => {
    try {
      const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
      const response = await axios.get(`${API_BASE}/api/notifications`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      // If we got new notifications, prepend them to the current list
      if (response.data && response.data.length > 0) {
        setNotifications(prev => {
          const existingIds = new Set(prev.map(n => n.id));
          const newNotifications = response.data.filter(n => !existingIds.has(n.id));
          return [...newNotifications, ...prev].slice(0, 20); // Keep a reasonable history limit
        });
      }
    } catch (e) {
      console.error("Failed to fetch notifications:", e);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
      await axios.post(`${API_BASE}/api/notifications/read/${notificationId}`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (e) {
      console.error("Failed to mark notification as read:", e);
    }
  };

  // Handle click outside to close notifications
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  // Fetch products for live suggestions from local backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
        const response = await axios.get(`${API_BASE}/api/products`);
        setProducts(response.data);
      } catch (err) {
        console.error("Failed to fetch local products for suggestions");
      }
    };
    fetchProducts();
  }, []);

  // Handle scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Save recent searches to localStorage and sync with backend
  useEffect(() => {
    localStorage.setItem('recentSearches', JSON.stringify(recentSearches));

    // Sync with backend if user is logged in
    const syncRecentSearches = async () => {
      if (user && recentSearchesFetched.current) {
        try {
          const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
          await axios.put(`${API_BASE}/api/users/recent-searches`, recentSearches, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
        } catch (e) {
          console.error("Failed to sync recent searches to backend:", e);
        }
      }
    };

    const timeoutId = setTimeout(syncRecentSearches, 1000);
    return () => clearTimeout(timeoutId);
  }, [recentSearches, user]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Update suggestions based on query using local product data
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      const query = searchQuery.toLowerCase();
      const matchingProducts = products
        .filter(p =>
          p.name?.toLowerCase().includes(query) ||
          p.category?.toLowerCase().includes(query) ||
          (p.brand && p.brand.toLowerCase().includes(query))
        )
        .slice(0, 8)
        .map(p => ({
          id: p.id,
          name: p.name,
          category: p.category,
          image: p.image || p.thumbnail
        }));
      setSuggestions(matchingProducts);
    } else {
      setSuggestions([]);
    }
  }, [searchQuery, products]);

  const handleSearch = (e) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      // Add to recent searches
      setRecentSearches(prev => {
        const filtered = prev.filter(s => s.toLowerCase() !== searchQuery.toLowerCase());
        return [searchQuery, ...filtered].slice(0, 5);
      });
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setShowSuggestions(false);
      setIsMobileMenuOpen(false);
    }
  };

  const handleSuggestionClick = (productName) => {
    setSearchQuery(productName);
    setRecentSearches(prev => {
      const filtered = prev.filter(s => s.toLowerCase() !== productName.toLowerCase());
      return [productName, ...filtered].slice(0, 5);
    });
    navigate(`/shop?search=${encodeURIComponent(productName)}`);
    setShowSuggestions(false);
  };

  const handleRecentClick = (search) => {
    setSearchQuery(search);
    navigate(`/shop?search=${encodeURIComponent(search)}`);
    setShowSuggestions(false);
  };

  const clearRecentSearch = (e, searchToRemove) => {
    e.stopPropagation();
    setRecentSearches(prev => prev.filter(s => s !== searchToRemove));
  };


  // Initialize location based on user
  const [selectedLocation, setSelectedLocation] = useState("Select a location");
  // Update location when user changes
  useEffect(() => {
    const updateHeaderLocation = async () => {
      if (user?.id) {
        try {
          const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
          const token = localStorage.getItem('token');
          const response = await axios.get(`${API_BASE}/api/users/sync`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          // 1. If we have a delivery_location in MongoDB, use it
          if (response.data && response.data.delivery_location) {
            setSelectedLocation(response.data.delivery_location);
            localStorage.setItem(`user_location_${user.id}`, response.data.delivery_location);
            return;
          }

          // 2. If no delivery_location but we have addresses, use the first one and SAVE to MongoDB
          if (response.data && response.data.addresses?.length > 0) {
            const firstAddr = response.data.addresses[0];
            const displayLoc = firstAddr.addr.length > 30 ? firstAddr.addr.substring(0, 30) + "..." : firstAddr.addr;
            setSelectedLocation(displayLoc);
            localStorage.setItem(`user_location_${user.id}`, displayLoc);

            // Sync this default back to MongoDB
            axios.put(`${API_BASE}/api/users/delivery-location`,
              { delivery_location: displayLoc },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            return;
          }
        } catch (e) {
          console.error("Navigation: Sync failed", e);
        }

        // Fallback to local storage
        const savedLoc = localStorage.getItem(`user_location_${user.id}`);
        if (savedLoc) {
          setSelectedLocation(savedLoc);
          return;
        }

        const savedAddr = localStorage.getItem(`user_addresses_${user.id}`);
        if (savedAddr) {
          try {
            const addresses = JSON.parse(savedAddr);
            if (addresses.length > 0) {
              const firstAddr = addresses[0].addr;
              const displayLoc = firstAddr.length > 30 ? firstAddr.substring(0, 30) + "..." : firstAddr;
              setSelectedLocation(displayLoc);
              localStorage.setItem(`user_location_${user.id}`, displayLoc);
            }
          } catch (e) { }
        }
      }
    };

    updateHeaderLocation();

    // Listen for updates from other components (like Profile)
    window.addEventListener('location_updated', updateHeaderLocation);
    return () => window.removeEventListener('location_updated', updateHeaderLocation);
  }, [user]);

  // Location Dialog State
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);
  const [pincode, setPincode] = useState("");
  const [savedAddresses, setSavedAddresses] = useState([]);

  useEffect(() => {
    // Load saved addresses from local storage (synced with Profile)
    const loadAddresses = () => {
      if (user?.id) {
        try {
          const saved = localStorage.getItem(`user_addresses_${user.id}`);
          if (saved) {
            setSavedAddresses(JSON.parse(saved));
          } else {
            setSavedAddresses([]);
          }
        } catch (e) {
          console.error("Failed to load addresses", e);
          setSavedAddresses([]);
        }
      } else {
        setSavedAddresses([]);
      }
    };
    loadAddresses();

    // Refresh addresses when location/profile updates
    window.addEventListener('location_updated', loadAddresses);
    return () => window.removeEventListener('location_updated', loadAddresses);
  }, [user]);

  const handleLocationClick = () => {
    setIsLocationDialogOpen(true);
  };

  const handleSelectAddress = (addr) => {
    // Format: "City - Pincode" or just "Address" or full address truncated
    let displayLoc = addr.addr;
    const finalLoc = displayLoc.length > 25 ? displayLoc.substring(0, 25) + "..." : displayLoc;

    setSelectedLocation(finalLoc);

    if (user?.id) {
      localStorage.setItem(`user_location_${user.id}`, finalLoc);

      // Save to MongoDB
      try {
        const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
        const token = localStorage.getItem('token');
        console.log("NAV: Updating Loc:", finalLoc);
        // Note: axios.put is async but we don't necessarily need to await it here if we don't block
        axios.put(`${API_BASE}/api/users/delivery-location`,
          { delivery_location: finalLoc },
          { headers: { Authorization: `Bearer ${token}` } }
        ).then(() => console.log("NAV: Loc Updated"))
          .catch(e => console.error("NAV: Loc Error", e.response?.data || e.message));
      } catch (e) {
        console.error("Failed to save delivery location to MongoDB", e);
      }
    }

    setIsLocationDialogOpen(false);
    window.dispatchEvent(new Event('location_updated'));
  };

  const handlePincodeSubmit = (e) => {
    e.preventDefault();
    if (pincode.length === 6) {
      const loc = `Pincode: ${pincode}`;
      setSelectedLocation(loc);
      if (user?.id) {
        localStorage.setItem(`user_location_${user.id}`, loc);

        // Save to MongoDB
        try {
          const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
          const token = localStorage.getItem('token');
          console.log("NAV: Updating Loc (Pin):", loc);
          axios.put(`${API_BASE}/api/users/delivery-location`,
            { delivery_location: loc },
            { headers: { Authorization: `Bearer ${token}` } }
          ).then(() => console.log("NAV: Loc Pin Updated"))
            .catch(e => console.error("NAV: Loc Pin Error", e.response?.data || e.message));
        } catch (e) {
          console.error("Failed to save pincode as delivery location to MongoDB", e);
        }
      }
      setIsLocationDialogOpen(false);
      setPincode("");
      window.dispatchEvent(new Event('location_updated'));
    } else {
      alert("Please enter a valid 6-digit pincode");
    }
  };

  useEffect(() => {
    const handleLocationUpdate = () => {
      if (user?.id) {
        const saved = localStorage.getItem(`user_location_${user.id}`);
        if (saved) {
          setSelectedLocation(saved);
        }
      }
    };

    window.addEventListener('location_updated', handleLocationUpdate);
    return () => window.removeEventListener('location_updated', handleLocationUpdate);
  }, [user]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-gray-100 transition-all duration-300">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-0 shrink-0">
            <img
              src="/assets/zlogo1.png"
              alt="DACHCart Logo"
              className="w-40 h-40 object-contain"
            />

          </Link>


          {/* Desktop Delivery Location - Hide for Vendors */}
          {(!user || user.user_type !== "vendor") && (
            <button
              onClick={handleLocationClick}
              className="hidden lg:flex flex-col items-start ml-2 mr-4 px-2 py-1 hover:bg-gray-50 rounded-lg transition-colors group cursor-pointer"
            >
              <span className="text-[10px] text-gray-500 font-medium ml-5 group-hover:text-violet-600 transition-colors">Deliver to</span>
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-gray-900 group-hover:text-violet-600 transition-colors" />
                <span className="font-bold text-gray-900 text-sm max-w-[140px] truncate group-hover:text-violet-700 transition-colors">
                  {selectedLocation}
                </span>
              </div>
            </button>
          )}

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            <Link
              to="/"
              className="text-sm font-medium text-gray-600 transition-colors hover:text-violet-600"
            >
              Home
            </Link>
            <div className="relative group">


              <Link
                to="/shop"
                className="text-sm font-medium text-gray-600 transition-colors hover:text-violet-600"
              >
                Products
              </Link>


            </div>
            {["Categories", "Deals", "About"].map((item) => (
              <Link
                key={item}
                to={`/${item.toLowerCase()}`}
                className="text-sm font-medium text-gray-600 transition-colors hover:text-violet-600"
              >
                {item}
              </Link>
            ))}
            <div className="relative group">
              <button className="text-sm font-medium text-gray-600 transition-colors hover:text-violet-600 flex items-center gap-1">
                Help
                <ChevronDown className="w-4 h-4 group-hover:rotate-180 transition-transform" />
              </button>
              <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                {[
                  { label: "Contact Us", to: "/contact" },
                  { label: "Shipping", to: "/shipping" },
                  { label: "Returns", to: "/returns" },
                  { label: "Track Order", to: "/track-order" },
                ].map((sub) => (
                  <Link
                    key={sub.to}
                    to={sub.to}
                    className="block px-4 py-2 text-sm text-gray-600 hover:text-violet-600 hover:bg-violet-50 transition-colors"
                  >
                    {sub.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Search Bar - Desktop */}
          <div ref={searchRef} className="hidden md:block flex-1 max-w-md mx-4 relative">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for products, brands and more..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  className="w-full h-11 pl-10 pr-4 rounded-lg bg-gray-100 border-0 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white transition-all"
                />
              </div>
            </form>

            {/* Suggestions Dropdown */}
            {showSuggestions && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 max-h-[70vh] overflow-y-auto">
                {/* Recent Searches */}
                {recentSearches.length > 0 && !searchQuery && (
                  <div className="p-3 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" /> Recent Searches
                      </span>
                    </div>
                    {recentSearches.map((search, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between py-2 px-2 hover:bg-gray-50 rounded-lg cursor-pointer group"
                        onClick={() => handleRecentClick(search)}
                      >
                        <div className="flex items-center gap-3">
                          <Clock className="w-4 h-4 text-gray-300" />
                          <span className="text-sm text-gray-700">{search}</span>
                        </div>
                        <button
                          onClick={(e) => clearRecentSearch(e, search)}
                          className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}



                {/* Product Suggestions */}
                {searchQuery && suggestions.length > 0 && (
                  <div className="py-2">
                    {suggestions.map((product) => (
                      <div
                        key={product.id}
                        onClick={() => handleSuggestionClick(product.name)}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <img
                          src={product.image}
                          alt=""
                          className="w-10 h-10 object-cover rounded-lg bg-gray-100"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 truncate">{product.name}</p>
                          <p className="text-xs text-gray-400 capitalize">{product.category.replace(/-/g, ' ')}</p>
                        </div>
                        <Search className="w-4 h-4 text-gray-300" />
                      </div>
                    ))}
                  </div>
                )}

                {/* No Results */}
                {searchQuery && suggestions.length === 0 && searchQuery.length >= 2 && (
                  <div className="p-4 text-center text-gray-400 text-sm">
                    No products found for "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center space-x-2">
            {/* Switch to Food App */}
            <button
              onClick={() => {
                localStorage.setItem('DACH_app_mode', 'food');
                window.location.href = '/food';
              }}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-orange-600 bg-orange-50 rounded-full hover:bg-orange-100 transition-colors"
            >
              <Utensils className="w-4 h-4" />
              <span className="hidden xl:inline">Food</span>
            </button>

            <Link to="/wishlist">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-600 hover:bg-gray-100 relative"
              >
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-violet-600 text-white text-xs rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* Notification Bell */}
            {user && (
              <div ref={notificationRef} className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-600 hover:bg-gray-100 relative"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <Bell className="w-5 h-5" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                      {notifications.length}
                    </span>
                  )}
                </Button>

                {showNotifications && (
                  <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                    <div className="p-4 border-b border-gray-100 bg-gray-50">
                      <h4 className="text-sm font-black uppercase tracking-widest text-gray-700">Notifications</h4>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center">
                          <Bell className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                          <p className="text-xs text-gray-400 font-medium">No new notifications</p>
                        </div>
                      ) : (
                        notifications.map(n => (
                          <div
                            key={n.id}
                            className="p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer"
                            onClick={() => markAsRead(n.id)}
                          >
                            <div className="flex gap-3">
                              <div className="mt-0.5">{getNotificationIcon(n.type)}</div>
                              <div className="flex-1">
                                <p className="text-sm font-bold text-gray-900">{n.title}</p>
                                <p className="text-xs text-gray-500 mt-1">{n.message}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <CartDrawer>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-600 hover:bg-gray-100 relative"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-violet-600 text-white text-xs rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Button>
            </CartDrawer>
            <Link to={user ? (
              user.user_type === "admin" ? "/admin/dashboard" :
                (user.user_type === "vendor" ? "/vendor/dashboard" :
                  (user.user_type === "restaurant" || user.user_type === "food_vendor" ? "/food/vendor/dashboard" : "/profile"))
            ) : "/auth"}>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-600 hover:bg-gray-100"
              >
                {user ? (
                  <Avatar className="w-5 h-5">
                    <AvatarImage src={`${user.avatar}?t=${Date.now()}`} className="object-contain" />
                    <AvatarFallback className="bg-violet-100 text-violet-600 text-xs">
                      {user.name?.charAt(0)?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <User className="w-5 h-5" />
                )}
              </Button>
            </Link>
          </div>

          {/* Mobile Actions */}
          <div className="flex lg:hidden items-center space-x-1">
            <Link to="/profile">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-600"
              >
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-gray-700 hidden sm:inline">Sign in</span>
                  <User className="w-5 h-5" />
                </div>
              </Button>
            </Link>
            <CartDrawer>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-600 relative"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-violet-600 text-white text-[10px] rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Button>
            </CartDrawer>
          </div>
        </div>

        {/* Amazon-style Mobile Search Row */}
        {location.pathname !== '/profile' && (
          <div className="lg:hidden px-4 pb-3 flex flex-col gap-2">
            <div className="relative" ref={searchRef}>
              <form onSubmit={handleSearch}>
                <div className="flex items-center gap-2">
                  {showSuggestions && (
                    <button
                      type="button"
                      onClick={() => setShowSuggestions(false)}
                      className="p-2 -ml-2 text-gray-400 hover:text-violet-600 transition-colors animate-in slide-in-from-left-2"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                  )}
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search DACHCart..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => setShowSuggestions(true)}
                      className="w-full h-11 pl-10 pr-4 rounded-xl bg-gray-50 border-gray-200 border text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white transition-all shadow-sm"
                    />
                  </div>
                </div>
              </form>

              {/* Mobile Search Suggestions */}
              {showSuggestions && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-[70] max-h-[60vh] overflow-y-auto">
                  {searchQuery && suggestions.length > 0 && (
                    <div className="py-2">
                      {suggestions.map((product) => (
                        <div
                          key={product.id}
                          onClick={() => handleSuggestionClick(product.name)}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 active:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-0"
                        >
                          <Search className="w-4 h-4 text-gray-300 shrink-0" />
                          <span className="text-sm text-gray-700 truncate">{product.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Location / Welcome Bar - Only show on Home Page for Mobile */}
            {location.pathname === '/' && (
              <div
                className="flex items-center gap-2 py-0.5 px-1 overflow-hidden cursor-pointer hover:bg-gray-50 rounded transition-colors active:scale-95 transform"
                onClick={handleLocationClick}
              >
                <MapPin className="w-3.5 h-3.5 text-violet-600 shrink-0" />
                <p className="text-[11px] font-medium text-gray-600 truncate">
                  Deliver to {user?.name?.split(' ')[0] || "Guest"} - {selectedLocation}
                </p>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </div>
            )}
          </div>
        )}

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-[60] bg-white animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between px-4 h-16 border-b border-gray-100">
              <h2 className="text-lg font-bold">Menu</h2>
              <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                <X className="w-6 h-6" />
              </Button>
            </div>
            <div className="px-4 py-4 space-y-6 overflow-y-auto h-[calc(100vh-64px)] pb-24">
              {/* User Info */}
              <div className="bg-violet-50 rounded-2xl p-4 flex items-center gap-4">
                <Avatar className="w-12 h-12 shadow-md">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="bg-violet-600 text-white font-bold">
                    {user?.name?.charAt(0)?.toUpperCase() || <User />}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Hello,</p>
                  <p className="text-lg font-bold text-gray-900">{user?.name || "Sign In"}</p>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Shop By Department</h3>
                  <div className="grid grid-cols-1 gap-2">
                    <Link to="/shop" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors border border-gray-50">
                      <span className="font-medium">All Products</span>
                      <ChevronDown className="w-4 h-4 -rotate-90 text-gray-400" />
                    </Link>
                    <Link to="/deals" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors border border-gray-50">
                      <span className="font-medium text-rose-600">Flash Deals</span>
                      <TrendingUp className="w-4 h-4 text-rose-600" />
                    </Link>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">App Mode</h3>
                  <button
                    onClick={() => {
                      localStorage.setItem('DACH_app_mode', 'food');
                      window.location.href = '/food';
                    }}
                    className="w-full flex items-center justify-between p-3 bg-orange-50 text-orange-600 rounded-xl transition-colors border border-orange-100"
                  >
                    <span className="font-bold flex items-center gap-2">
                      <Utensils className="w-5 h-5" /> Switch to DACHFood
                    </span>
                    <ChevronDown className="w-4 h-4 -rotate-90" />
                  </button>
                </div>

                <div>
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Help & Settings</h3>
                  <div className="grid grid-cols-1 gap-1">
                    {["About", "Contact", "Shipping", "Returns"].map((item) => (
                      <Link
                        key={item}
                        to={`/${item.toLowerCase()}`}
                        className="block py-2 text-gray-600 font-medium"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {item}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {user && (
                <Button
                  variant="outline"
                  className="w-full h-12 rounded-xl text-rose-600 border-rose-100 hover:bg-rose-50"
                  onClick={() => {
                    /* Logout logic */
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Sign Out
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Bottom Navigation - Mobile Only */}
        {location.pathname !== '/profile' && (
          <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-gray-100 px-2 pb-safe-area-inset-bottom shadow-[0_-8px_30px_rgb(0,0,0,0.04)]">
            <div className="flex items-center justify-around h-16">
              <Link to="/" className={`flex flex-col items-center gap-1 transition-all ${window.location.pathname === '/' ? 'text-violet-600' : 'text-gray-400'}`}>
                <Home className={`w-6 h-6 ${window.location.pathname === '/' ? 'fill-violet-50' : ''}`} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Home</span>
              </Link>
              <Link to="/shop" className={`flex flex-col items-center gap-1 transition-all ${window.location.pathname === '/shop' ? 'text-violet-600' : 'text-gray-400'}`}>
                <Package className="w-6 h-6" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Shop</span>
              </Link>
              <div className="relative -mt-8">
                <CartDrawer>
                  <button className="w-14 h-14 bg-gray-900 rounded-full flex items-center justify-center text-white shadow-xl shadow-gray-900/40 relative active:scale-90 transition-transform">
                    <ShoppingCart className="w-6 h-6" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-violet-600 text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">
                        {cartCount}
                      </span>
                    )}
                  </button>
                </CartDrawer>
              </div>
              <Link to="/wishlist" className={`flex flex-col items-center gap-1 transition-all ${window.location.pathname === '/wishlist' ? 'text-violet-600' : 'text-gray-400'}`}>
                <Heart className={`w-6 h-6 ${window.location.pathname === '/wishlist' ? 'fill-violet-50' : ''}`} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Saved</span>
              </Link>
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className={`flex flex-col items-center gap-1 transition-all ${isMobileMenuOpen ? 'text-violet-600' : 'text-gray-400'}`}
              >
                <Menu className="w-6 h-6" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Menu</span>
              </button>
            </div>
          </div>
        )}

        {/* Location Dialog */}
        <Dialog open={isLocationDialogOpen} onOpenChange={setIsLocationDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Choose your location</DialogTitle>
              <DialogDescription>
                Select a delivery location to see product availability and delivery options
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              {savedAddresses.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Saved Addresses</p>
                  <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                    {savedAddresses.map((addr) => (
                      <div key={addr.id} className="p-3 border rounded-lg hover:border-violet-500 hover:bg-violet-50 cursor-pointer transition-all" onClick={() => handleSelectAddress(addr)}>
                        <p className="font-bold text-sm text-gray-900">{addr.name}</p>
                        <p className="text-xs text-gray-600 truncate">{addr.addr}</p>
                        <p className="text-xs text-gray-400 mt-1">{addr.phone}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Or enter pincode</span>
                </div>
              </div>

              <form onSubmit={handlePincodeSubmit} className="flex gap-2">
                <div className="grid w-full items-center gap-1.5">
                  <Input
                    id="pincode"
                    placeholder="Enter 6-digit Pincode"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                  />
                </div>
                <Button type="submit" disabled={pincode.length !== 6}>Apply</Button>
              </form>
            </div>
            <DialogFooter className="sm:justify-start">
              <Link to="/profile" onClick={() => setIsLocationDialogOpen(false)} className="text-xs text-violet-600 hover:underline">
                Manage address book
              </Link>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </nav>
  );
};

export default Navigation;