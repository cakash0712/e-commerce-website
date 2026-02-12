import React, { useState, useEffect, createContext, useContext } from 'react';
import { Routes, Route, Link, useNavigate, useLocation, useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import {
    Utensils, ShoppingBag, MapPin, Clock, Star, Search, ChevronRight,
    Heart, Plus, Minus, X, ArrowLeft, Filter, Sparkles, Flame, Zap,
    Bike, Check, Home, User, ShoppingCart, Menu, Phone, Mail, Timer,
    ChefHat, Coffee, Pizza, Salad, Sandwich, IceCream, Soup, Beef,
    ArrowRight, Gift, Percent, TrendingUp, Building2, Store
} from 'lucide-react';
import { useAuth } from '../../App';
import FoodProfile from './FoodProfile';

// Food Cart Context
const FoodCartContext = createContext();

export const useFoodCart = () => {
    const context = useContext(FoodCartContext);
    if (!context) {
        throw new Error('useFoodCart must be used within a FoodCartProvider');
    }
    return context;
};

const FoodCartProvider = ({ children }) => {
    const { user, updateUser } = useAuth();
    const [location, setLocation] = useState(user?.address || localStorage.getItem('food_delivery_location') || 'New Delhi, India');
    const [cartItems, setCartItems] = useState(() => {
        try {
            const saved = localStorage.getItem('DACHBites_cart');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem('DACHBites_cart', JSON.stringify(cartItems));
    }, [cartItems]);

    // Sync location if user data changes
    useEffect(() => {
        if (user?.address) {
            setLocation(user.address);
        }
    }, [user?.address]);

    const handleLocationUpdate = async (newLoc) => {
        const finalLoc = typeof newLoc === 'string' ? newLoc.trim() : '';
        if (!finalLoc) return;

        setLocation(finalLoc);
        localStorage.setItem('food_delivery_location', finalLoc);

        if (user?.id) {
            try {
                await updateUser(user.id, { address: finalLoc });
            } catch (error) {
                console.error("Failed to sync location to backend:", error);
            }
        }
    };

    const addToCart = (item, restaurantId, restaurantName) => {
        setCartItems(prev => {
            // Check if adding from different restaurant
            if (prev.length > 0 && prev[0].restaurantId !== restaurantId) {
                // Clear cart and add new item
                return [{ ...item, quantity: 1, restaurantId, restaurantName }];
            }

            const existing = prev.find(i => i.id === item.id);
            if (existing) {
                return prev.map(i =>
                    i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
                );
            }
            return [...prev, { ...item, quantity: 1, restaurantId, restaurantName }];
        });
    };

    const removeFromCart = (itemId) => {
        setCartItems(prev => prev.filter(i => i.id !== itemId));
    };

    const updateQuantity = (itemId, quantity) => {
        if (quantity <= 0) {
            removeFromCart(itemId);
            return;
        }
        setCartItems(prev => prev.map(i =>
            i.id === itemId ? { ...i, quantity } : i
        ));
    };

    const clearCart = () => setCartItems([]);

    const getTotal = () => cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const getItemCount = () => cartItems.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <FoodCartContext.Provider value={{
            cartItems, addToCart, removeFromCart, updateQuantity, clearCart, getTotal, getItemCount,
            location, handleLocationUpdate
        }}>
            {children}
        </FoodCartContext.Provider>
    );
};

// Sample Data
// Cuisines and Restaurants will be fetched from the backend or handled via state
const cuisines = [
    { id: 1, name: 'Pizza', icon: Pizza, color: 'bg-red-500' },
    { id: 2, name: 'Burgers', icon: Sandwich, color: 'bg-amber-500' },
    {
        id: 3,
        name: 'Indian',
        icon: ChefHat,
        color: 'bg-orange-500',
        subCategories: [
            { id: 3.1, name: 'South Indian', icon: Soup, color: 'bg-green-600' },
            { id: 3.2, name: 'North Indian', icon: ChefHat, color: 'bg-orange-600' }
        ]
    },
    { id: 4, name: 'Chinese', icon: Soup, color: 'bg-rose-500' },
    { id: 5, name: 'Desserts', icon: IceCream, color: 'bg-pink-500' },
    { id: 6, name: 'Healthy', icon: Salad, color: 'bg-green-500' },
    { id: 7, name: 'Coffee', icon: Coffee, color: 'bg-amber-700' },
    { id: 8, name: 'BBQ', icon: Beef, color: 'bg-red-700' },
];

// Food Navigation Component
const FoodNavigation = ({ onSwitchApp }) => {
    const { getItemCount, location, handleLocationUpdate } = useFoodCart();
    const { user, logout } = useAuth();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showLocationModal, setShowLocationModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchSuggestions, setSearchSuggestions] = useState([]);
    const [newLocationInput, setNewLocationInput] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const navigate = useNavigate();
    const itemCount = getItemCount();

    // Main Search Suggestions Logic
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchQuery.trim().length > 1) {
                try {
                    const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
                    const response = await axios.get(`${API_BASE}/api/food/search/suggestions?q=${searchQuery}`);
                    setSearchSuggestions(response.data);
                } catch (error) {
                    console.error("Failed to fetch search suggestions:", error);
                    setSearchSuggestions([]);
                }
            } else {
                setSearchSuggestions([]);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Filter suggestions as user types - Fetching from MongoDB via Backend
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (newLocationInput.trim().length > 1) {
                try {
                    const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
                    const response = await axios.get(`${API_BASE}/api/food/locations/search?q=${newLocationInput}`);
                    setSuggestions(response.data);
                } catch (error) {
                    console.error("Failed to fetch location suggestions:", error);
                    setSuggestions([]);
                }
            } else {
                setSuggestions([]);
            }
        }, 300); // 300ms debounce

        return () => clearTimeout(timer);
    }, [newLocationInput]);

    const onLocationConfirm = async (selectedLoc = null) => {
        const finalLoc = (selectedLoc && typeof selectedLoc === 'string' ? selectedLoc : newLocationInput).trim();
        if (!finalLoc) return;

        await handleLocationUpdate(finalLoc);
        setShowLocationModal(false);
        setNewLocationInput('');
        setSuggestions([]);
    };

    const handleLogout = () => {
        logout();
        setShowUserMenu(false);
        navigate('/food');
    };

    return (
        <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
                    {/* Left: Logo */}
                    <Link to="/food" className="flex items-center gap-2 flex-shrink-0">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                            <Utensils className="w-5 h-5 text-white" />
                        </div>
                        <span className="hidden sm:block text-2xl font-black bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                            DACHBites
                        </span>
                    </Link>

                    {/* Center: Location & Search */}
                    <div className="hidden lg:flex items-center flex-grow max-w-2xl bg-gray-50 rounded-full border border-gray-200 p-1">
                        <div
                            onClick={() => {
                                setNewLocationInput(location);
                                setShowLocationModal(true);
                            }}
                            className="flex items-center gap-2 px-4 py-2 border-r border-gray-200 min-w-[200px] cursor-pointer hover:bg-gray-100 hover:text-orange-600 transition-all rounded-l-full"
                        >
                            <MapPin className="w-4 h-4 text-orange-500" />
                            <span className="text-sm font-medium truncate">{location}</span>
                        </div>
                        <div className="relative flex-grow">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search for restaurants, cuisines or dishes..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && navigate(`/food/restaurants?search=${searchQuery}`)}
                                className="w-full bg-transparent pl-11 pr-4 py-2 text-sm focus:outline-none"
                            />

                            {/* Search Suggestions Dropdown */}
                            {searchSuggestions.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 py-2">
                                    {searchSuggestions.map((suggestion, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => {
                                                setSearchQuery(suggestion.text);
                                                setSearchSuggestions([]);
                                                if (suggestion.type === 'dish') {
                                                    navigate(`/food/restaurant/${suggestion.restaurant_id}#${suggestion.id}`);
                                                } else if (suggestion.type === 'restaurant') {
                                                    navigate(`/food/restaurant/${suggestion.id}`);
                                                } else {
                                                    navigate(`/food/restaurants?search=${suggestion.text}`);
                                                }
                                            }}
                                            className="w-full flex items-center gap-4 px-4 py-3 hover:bg-orange-50 transition-colors text-left"
                                        >
                                            <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-white transition-colors">
                                                {suggestion.type === 'restaurant' ? <Building2 className="w-4 h-4 text-gray-500" /> :
                                                    suggestion.type === 'cuisine' ? <Utensils className="w-4 h-4 text-gray-500" /> :
                                                        <Pizza className="w-4 h-4 text-gray-500" />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900 leading-none mb-1">{suggestion.text}</p>
                                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{suggestion.type}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                        <button
                            onClick={onSwitchApp}
                            className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm font-medium text-violet-600 hover:bg-violet-50 rounded-xl transition-colors"
                        >
                            <ShoppingBag className="w-4 h-4" />
                            Shop
                        </button>

                        <div className="h-6 w-px bg-gray-200 hidden sm:block" />

                        {user ? (
                            <div className="relative">
                                <button
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    className="flex items-center gap-2 p-1 sm:px-2 sm:py-1 rounded-full hover:bg-gray-100 transition-colors"
                                >
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-100 rounded-full flex items-center justify-center">
                                        <User className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                                    </div>
                                    <span className="hidden md:inline text-sm font-semibold text-gray-700">
                                        {user.name?.split(' ')[0]}
                                    </span>
                                </button>
                                {showUserMenu && (
                                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-3 z-50">
                                        <div className="px-4 py-2 border-b border-gray-50 mb-2">
                                            <p className="text-sm font-bold text-gray-900">{user.name}</p>
                                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                        </div>
                                        <Link to="/food/profile" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600">
                                            <User className="w-4 h-4" /> My Profile
                                        </Link>
                                        <Link to="/food/orders" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600">
                                            <Clock className="w-4 h-4" /> My Orders
                                        </Link>
                                        {(user.user_type === 'restaurant' || user.user_type === 'food_vendor') && (
                                            <Link to="/food/vendor/dashboard" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-orange-600 hover:bg-orange-50 transition-colors">
                                                <Store className="w-4 h-4" /> Restaurant Dashboard
                                            </Link>
                                        )}
                                        <div className="border-t border-gray-50 my-2" />
                                        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full text-left">
                                            <ArrowLeft className="w-4 h-4" /> Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link
                                to="/auth"
                                className="text-sm font-bold text-gray-700 hover:text-orange-600 px-3 py-2 transition-colors"
                            >
                                Login / Sign up
                            </Link>
                        )}

                        <button
                            onClick={() => navigate('/food/cart')}
                            className="relative flex items-center gap-2 p-2 sm:px-4 sm:py-2.5 bg-orange-600 text-white rounded-2xl font-bold hover:shadow-lg hover:bg-orange-700 transition-all"
                        >
                            <ShoppingCart className="w-5 h-5" />
                            <span className="hidden sm:inline">Cart</span>
                            {itemCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-white text-orange-600 text-xs font-black rounded-full flex items-center justify-center border-2 border-orange-600">
                                    {itemCount}
                                </span>
                            )}
                        </button>

                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden p-2 text-gray-600">
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Search & Location (Visible only on mobile/tablet) */}
                <div className="lg:hidden pb-4 space-y-3">
                    <div
                        onClick={() => {
                            setNewLocationInput(location);
                            setShowLocationModal(true);
                        }}
                        className="flex items-center gap-2 bg-gray-100 rounded-xl px-4 py-2 cursor-pointer hover:bg-gray-200"
                    >
                        <MapPin className="w-4 h-4 text-orange-500" />
                        <span className="text-sm font-medium truncate">{location}</span>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search for restaurants or dishes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && navigate(`/food/restaurants?search=${searchQuery}`)}
                            className="w-full bg-gray-100 pl-11 pr-4 py-3 rounded-xl text-sm focus:outline-none"
                        />

                        {/* Mobile Search Suggestions Dropdown */}
                        {searchSuggestions.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 py-1">
                                {searchSuggestions.map((suggestion, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            setSearchQuery(suggestion.text);
                                            setSearchSuggestions([]);
                                            if (suggestion.type === 'dish') {
                                                navigate(`/food/restaurant/${suggestion.restaurant_id}#${suggestion.id}`);
                                            } else if (suggestion.type === 'restaurant') {
                                                navigate(`/food/restaurant/${suggestion.id}`);
                                            } else {
                                                navigate(`/food/restaurants?search=${suggestion.text}`);
                                            }
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-orange-50 transition-colors text-left"
                                    >
                                        <div className="p-1.5 bg-gray-100 rounded-lg">
                                            {suggestion.type === 'restaurant' ? <Building2 className="w-4 h-4 text-gray-400" /> :
                                                suggestion.type === 'cuisine' ? <Utensils className="w-4 h-4 text-gray-400" /> :
                                                    <Pizza className="w-4 h-4 text-gray-400" />}
                                        </div>
                                        <span className="text-sm font-semibold text-gray-800">{suggestion.text}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Location Selection Modal */}
            {showLocationModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowLocationModal(false)} />
                    <div className="relative bg-white w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-2xl font-black text-gray-900">Delivery Address</h3>
                                <button onClick={() => setShowLocationModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                    <X className="w-6 h-6 text-gray-500" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-black text-gray-500 uppercase tracking-widest">Select your location</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-500" />
                                        <input
                                            type="text"
                                            placeholder="Enter area, street or city..."
                                            value={newLocationInput}
                                            onChange={(e) => setNewLocationInput(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && onLocationConfirm()}
                                            autoFocus
                                            className={`w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-orange-500 focus:bg-white rounded-2xl text-gray-900 font-bold outline-none transition-all shadow-inner ${suggestions.length > 0 ? 'rounded-b-none' : ''}`}
                                        />

                                        {/* Autocomplete Suggestions */}
                                        {suggestions.length > 0 && (
                                            <div className="absolute left-0 right-0 top-full bg-white border-2 border-t-0 border-orange-500 rounded-b-2xl shadow-xl overflow-hidden z-20">
                                                {suggestions.map((loc, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => onLocationConfirm(loc)}
                                                        className="w-full px-12 py-3 text-left hover:bg-orange-50 font-bold text-gray-700 transition-colors flex items-center gap-3 border-b border-gray-50 last:border-0"
                                                    >
                                                        <Search className="w-4 h-4 text-gray-400" />
                                                        {loc}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 p-3 bg-blue-50 text-blue-700 rounded-xl text-xs font-bold uppercase tracking-wider">
                                        <Sparkles className="w-4 h-4" />
                                        <span>Now searching all over India</span>
                                    </div>
                                    <p className="text-gray-500 text-sm font-medium leading-relaxed">
                                        Type your state or district name above to find your exact delivery location.
                                    </p>
                                </div>

                                <button
                                    onClick={() => onLocationConfirm()}
                                    className="w-full py-5 bg-orange-600 text-white font-black rounded-2xl shadow-xl shadow-orange-200 hover:bg-orange-700 transition-all text-lg"
                                >
                                    Confirm Location
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};


// Food Home Page
const FoodHome = () => {
    const navigate = useNavigate();
    const { location: userLocation } = useFoodCart();
    const [restaurantsList, setRestaurantsList] = useState([]);
    const [trendingDishes, setTrendingDishes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('All');

    useEffect(() => {
        const fetchHomeData = async () => {
            try {
                const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
                // Fetch restaurants
                const resResponse = await axios.get(`${API_BASE}/api/food/restaurants`);
                setRestaurantsList(resResponse.data);

                // Fetch trending dishes from new endpoint
                const dishesResponse = await axios.get(`${API_BASE}/api/food/items?limit=8`);
                setTrendingDishes(dishesResponse.data);

            } catch (e) {
                console.error("Failed to fetch home data:", e);
            } finally {
                setLoading(false);
            }
        };
        fetchHomeData();
    }, []);

    const offers = [
        { id: 1, title: '50% OFF up to ₹150', sub: 'On all orders above ₹499', code: 'DACH50', color: 'from-orange-500 to-red-600' },
        { id: 2, title: 'FREE Delivery', sub: 'On your first 3 orders', code: 'WELCOME', color: 'from-blue-500 to-indigo-600' },
        { id: 3, title: 'Extra ₹100 Cashback', sub: 'Pay using DACH Wallet', code: 'CASH100', color: 'from-emerald-500 to-teal-600' },
    ];

    const filters = [
        { label: 'All', icon: null },
        { label: 'Rating 4.0+', icon: Star },
        { label: 'Fast Delivery', icon: Clock },
        { label: 'Veg Only', icon: Salad },
        { label: 'Offers', icon: Percent },
    ];

    const trustCards = [
        { title: 'Fast Delivery', desc: 'Orders delivered within 30 minutes', icon: Bike, color: 'bg-orange-100 text-orange-600' },
        { title: 'Verified Restaurants', desc: 'Quality and hygiene checked partners', icon: ChefHat, color: 'bg-green-100 text-green-600' },
        { title: 'Secure Payments', desc: '100% safe & encrypted payments', icon: Check, color: 'bg-blue-100 text-blue-600' },
        { title: '24/7 Support', desc: 'Real-time help whenever you need it', icon: Phone, color: 'bg-purple-100 text-purple-600' },
    ];

    const filteredRestaurants = restaurantsList.filter(res => {
        // Location Filter
        const userLoc = userLocation.toLowerCase();
        const resCity = (res.city || "").toLowerCase();
        const resPincode = (res.pincode || "").toLowerCase();
        const isNearby = !userLocation || userLoc.includes(resCity) || userLoc.includes(resPincode) || resCity.includes(userLoc);

        if (!isNearby && resCity) return false;

        if (activeFilter === 'All') return true;
        if (activeFilter === 'Rating 4.0+') return (res.rating || 4.0) >= 4.0;
        if (activeFilter === 'Fast Delivery') return (res.deliveryTime || 30) <= 30;
        if (activeFilter === 'Veg Only') return res.menu?.some(item => item.is_veg);
        if (activeFilter === 'Offers') return res.offers && res.offers.length > 0;
        return true;
    });

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="relative h-[500px] flex items-center bg-gray-900 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1600&q=80"
                        alt="Hero BG"
                        className="w-full h-full object-cover opacity-40"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/80 to-transparent" />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600/20 backdrop-blur-md rounded-full mb-6 border border-orange-500/30">
                            <Sparkles className="w-4 h-4 text-orange-400" />
                            <span className="text-orange-100 text-sm font-bold uppercase tracking-wider">Trusted by 50K+ Foodies</span>
                        </div>
                        <h1 className="text-5xl sm:text-7xl font-black text-white leading-tight mb-6">
                            Order food from your <br />
                            <span className="text-orange-500">favorite restaurants</span>
                        </h1>
                        <p className="text-xl text-gray-300 font-medium mb-10 flex items-center gap-6">
                            <span className="flex items-center gap-2"><Bike className="w-5 h-5 text-orange-500" /> Fast delivery</span>
                            <span className="flex items-center gap-2"><Star className="w-5 h-5 text-orange-500" /> Best offers</span>
                            <span className="flex items-center gap-2"><Utensils className="w-5 h-5 text-orange-500" /> Trusted restaurants</span>
                        </p>

                        <div className="flex flex-col sm:flex-row items-center gap-6">
                            <button
                                onClick={() => navigate('/food/items')}
                                className="w-full sm:w-auto px-12 py-5 bg-orange-600 text-white font-black rounded-2xl hover:bg-orange-700 transition-all text-xl shadow-2xl shadow-orange-600/30 hover:scale-105 active:scale-95"
                            >
                                Order Now
                            </button>
                            <button
                                onClick={() => navigate('/food/restaurants')}
                                className="w-full sm:w-auto px-12 py-5 bg-white/10 backdrop-blur-md text-white border-2 border-white/20 font-black rounded-2xl hover:bg-white/20 transition-all text-xl hover:scale-105 active:scale-95"
                            >
                                Restaurants
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories */}
            <section className="py-16 border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-black text-gray-900 mb-10 text-center">What's on your mind?</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-8">
                        {cuisines.map(cuisine => (
                            <div key={cuisine.id} className="relative group">
                                <Link
                                    to={`/food/items?category=${cuisine.name.toLowerCase()}`}
                                    className="flex flex-col items-center"
                                >
                                    <div className={`w-24 h-24 ${cuisine.color} rounded-full flex items-center justify-center p-6 shadow-xl group-hover:scale-110 transition-all duration-300 ring-4 ring-white`}>
                                        <cuisine.icon className="w-full h-full text-white" />
                                    </div>
                                    <span className="mt-4 text-base font-bold text-gray-800 group-hover:text-orange-600 transition-colors uppercase tracking-tight">{cuisine.name}</span>
                                </Link>
                                {/* Sub-categories dropdown */}
                                {cuisine.subCategories && (
                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                                        <div className="bg-white rounded-xl shadow-2xl p-3 min-w-[140px] border border-gray-100">
                                            {cuisine.subCategories.map(sub => (
                                                <Link
                                                    key={sub.id}
                                                    to={`/food/items?category=${sub.name.toLowerCase().replace(' ', '-')}`}
                                                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-orange-50 transition-colors"
                                                >
                                                    <div className={`w-8 h-8 ${sub.color} rounded-full flex items-center justify-center`}>
                                                        <sub.icon className="w-4 h-4 text-white" />
                                                    </div>
                                                    <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">{sub.name}</span>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Trending Dishes */}
            <section className="py-16 bg-gray-50 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h2 className="text-3xl font-black text-gray-900 mb-2">Popular Dishes</h2>
                            <p className="text-gray-500 font-medium">The most loved items in your area</p>
                        </div>
                        <div className="flex gap-2">
                            <button className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center bg-white hover:bg-orange-50 hover:border-orange-200 transition-colors">
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <button className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center bg-white hover:bg-orange-50 hover:border-orange-200 transition-colors">
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {trendingDishes.map((dish, i) => (
                            <div key={i} className="bg-white rounded-3xl p-4 shadow-sm hover:shadow-xl transition-all group">
                                <div className="relative h-48 rounded-2xl overflow-hidden mb-4">
                                    <img src={dish.image} alt={dish.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 text-xs font-bold text-gray-700 shadow-sm">
                                        <Star className="w-3 h-3 text-orange-500 fill-orange-500" /> 4.5
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <h3 className="font-bold text-gray-900 text-lg mb-1">{dish.name}</h3>
                                    <p className="text-gray-500 text-sm font-medium">{dish.restaurantName}</p>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xl font-black text-gray-900">₹{dish.price}</span>
                                    <button
                                        onClick={() => navigate(`/food/restaurant/${dish.restaurantId}`)}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-all shadow-md shadow-orange-200"
                                    >
                                        <Plus className="w-4 h-4" /> Add
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Main Restaurants Section */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
                        <h2 className="text-3xl font-black text-gray-900">Restaurants Near You</h2>

                        {/* Quick Filters */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            {filters.map(filter => (
                                <button
                                    key={filter.label}
                                    onClick={() => setActiveFilter(filter.label)}
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold border transition-all whitespace-nowrap ${activeFilter === filter.label
                                        ? 'bg-orange-600 text-white border-orange-600 shadow-lg shadow-orange-100'
                                        : 'bg-white text-gray-700 border-gray-200 hover:border-orange-300'
                                        }`}
                                >
                                    {filter.icon && <filter.icon className="w-4 h-4" />}
                                    {filter.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
                        {filteredRestaurants.length > 0 ? (
                            filteredRestaurants.map(restaurant => (
                                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                            ))
                        ) : (
                            <div className="col-span-full py-20 text-center bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200">
                                <MapPin className="w-20 h-20 text-gray-300 mx-auto mb-6" />
                                <h3 className="text-2xl font-bold text-gray-800 mb-2">No restaurants found in {userLocation}</h3>
                                <p className="text-gray-500 font-medium mb-6">We're expanding fast! Try searching another area or see all restaurants.</p>
                                <button onClick={() => navigate('/food/restaurants')} className="px-6 py-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-100 transition-colors">
                                    View All Restaurants
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="mt-16 text-center">
                        <button onClick={() => navigate('/food/restaurants')} className="px-12 py-5 bg-white border-2 border-orange-600 text-orange-600 font-black rounded-3xl hover:bg-orange-50 transition-all text-lg shadow-xl shadow-orange-50">
                            See More Restaurants
                        </button>
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="py-20 bg-gray-900 text-white overflow-hidden relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <h2 className="text-4xl font-black mb-4">Why Choose Us?</h2>
                    <p className="text-gray-400 font-medium mb-16 max-w-2xl mx-auto text-lg text-center">Discover the best of food delivery with your favorite partners and fast delivery.</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {trustCards.map((card, i) => (
                            <div key={i} className="bg-gray-800/50 backdrop-blur-md p-10 rounded-[40px] border border-gray-700 hover:border-orange-500/50 transition-all group">
                                <div className={`w-20 h-20 ${card.color} rounded-[28px] flex items-center justify-center mb-8 mx-auto group-hover:scale-110 transition-transform`}>
                                    <card.icon className="w-10 h-10" />
                                </div>
                                <h4 className="text-2xl font-bold mb-4">{card.title}</h4>
                                <p className="text-gray-400 font-medium leading-relaxed">{card.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* App Download Banner */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-[50px] p-10 lg:p-20 flex flex-col lg:flex-row items-center gap-16 overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
                        <div className="relative z-10 lg:w-3/5 text-center lg:text-left">
                            <h2 className="text-4xl sm:text-6xl font-black text-white mb-8">Best experience is on the DACHBites App</h2>
                            <p className="text-xl text-white/80 font-medium mb-12">Get special offers, track your order in real-time, and order faster with our mobile app.</p>
                            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6">
                                <div className="relative group">
                                    <button className="transition-transform opacity-50 cursor-not-allowed">
                                        <div className="bg-black px-8 py-4 rounded-2xl flex items-center gap-4 text-white">
                                            <div className="p-2 bg-white/10 rounded-lg"><Zap className="w-6 h-6 fill-white" /></div>
                                            <div className="text-left"><p className="text-xs font-bold text-gray-400 uppercase">Get it on</p><p className="text-xl font-black">Google Play</p></div>
                                        </div>
                                    </button>
                                    <div className="absolute top-0 right-0 -mr-2 -mt-2">
                                        <span className="bg-white text-orange-600 text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider shadow-xl border border-orange-100">Coming Soon</span>
                                    </div>
                                </div>

                                <div className="relative group">
                                    <button className="transition-transform opacity-50 cursor-not-allowed">
                                        <div className="bg-black px-8 py-4 rounded-2xl flex items-center gap-4 text-white border border-gray-800">
                                            <div className="p-2 bg-white/10 rounded-lg"><Sparkles className="w-6 h-6 fill-white" /></div>
                                            <div className="text-left"><p className="text-xs font-bold text-gray-400 uppercase">Download on the</p><p className="text-xl font-black">App Store</p></div>
                                        </div>
                                    </button>
                                    <div className="absolute top-0 right-0 -mr-2 -mt-2">
                                        <span className="bg-white text-orange-600 text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider shadow-xl border border-orange-100">Coming Soon</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="lg:w-2/5 relative">
                            <div className="w-full h-80 bg-white/20 backdrop-blur-md rounded-[40px] border border-white/20 p-8 transform lg:rotate-6">
                                <div className="space-y-4">
                                    <div className="h-4 w-3/4 bg-white/40 rounded-full" />
                                    <div className="h-40 w-full bg-white/20 rounded-2xl" />
                                    <div className="flex gap-2"><div className="h-10 w-10 bg-white/60 rounded-xl" /><div className="h-10 w-full bg-white/40 rounded-xl" /></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 border-t border-gray-800 py-24 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-16">
                        <div>
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-12 h-12 bg-orange-600 rounded-2xl flex items-center justify-center"><Utensils className="w-6 h-6 text-white" /></div>
                                <span className="text-3xl font-black tracking-tight">DACHBites</span>
                            </div>
                            <p className="text-gray-400 font-medium leading-relaxed text-lg">Delivering delicious food and happiness to your doorstep everyday.</p>
                        </div>
                        <div>
                            <h4 className="text-xl font-bold mb-8">Company</h4>
                            <ul className="space-y-4">
                                <li><Link to="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
                                <li><Link to="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
                                <li><Link to="/careers" className="text-gray-400 hover:text-white transition-colors">Careers</Link></li>
                                <li><Link to="/food/vendor/login" className="text-orange-500 font-bold hover:underline">Partner with us 🍽️</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-xl font-bold mb-8">Support</h4>
                            <ul className="space-y-4">
                                <li><Link to="/help" className="text-gray-400 hover:text-white transition-colors">Help Center</Link></li>
                                <li><Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
                                <li><Link to="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Use</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-xl font-bold mb-8">Follow Us</h4>
                            <div className="flex gap-4">
                                {[1, 2, 3, 4].map(i => (
                                    <button key={i} className="w-12 h-12 bg-gray-800 rounded-2xl flex items-center justify-center hover:bg-orange-600 transition-colors">
                                        <Heart className="w-5 h-5" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="mt-20 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-gray-500 font-medium">
                        <p>© 2024 DACHBites. Real-time food delivery engine.</p>
                        <div className="flex items-center gap-6">
                            <span>English (US)</span>
                            <span>₹ INR</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

// Restaurant Card Component
const RestaurantCard = ({ restaurant }) => {
    const navigate = useNavigate();
    const isOpen = restaurant.is_open ?? true;

    return (
        <div
            onClick={() => navigate(`/food/restaurant/${restaurant.id}`)}
            className="group bg-white rounded-[40px] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer border border-gray-100 flex flex-col h-full"
        >
            {/* Image Section */}
            <div className="relative h-64 overflow-hidden">
                <img
                    src={restaurant.image}
                    alt={restaurant.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />

                {/* Offer Badge */}
                {restaurant.offers && restaurant.offers.length > 0 && (
                    <div className="absolute bottom-4 left-4 right-4 bg-gradient-to-r from-orange-600 to-red-600 text-white p-3 rounded-2xl shadow-xl flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Percent className="w-5 h-5" />
                            <span className="font-black text-sm uppercase tracking-tight">{restaurant.offers[0]}</span>
                        </div>
                    </div>
                )}

                {/* Status Badge */}
                {!isOpen && (
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-[2px] flex items-center justify-center">
                        <span className="px-6 py-2 bg-white text-gray-900 font-black rounded-full uppercase tracking-widest text-sm shadow-xl">Currently Closed</span>
                    </div>
                )}

                <button className="absolute top-4 right-4 w-12 h-12 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white shadow-lg group/btn">
                    <Heart className="w-6 h-6 text-gray-400 group-hover/btn:text-red-500 group-hover/btn:fill-red-500 transition-all" />
                </button>
            </div>

            {/* Content Section */}
            <div className="p-8 flex-grow flex flex-col">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h3 className="text-2xl font-black text-gray-900 mb-1 group-hover:text-orange-600 transition-colors leading-tight">{restaurant.name}</h3>
                        <p className="text-gray-500 font-bold text-sm uppercase tracking-wider">{restaurant.cuisine}</p>
                    </div>
                    <div className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-sm font-black rounded-xl shadow-lg shadow-green-100">
                        {restaurant.rating || "4.0"}
                        <Star className="w-3.5 h-3.5 fill-current" />
                    </div>
                </div>

                <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between text-gray-600">
                    <div className="flex items-center gap-1.5 font-bold">
                        <Clock className="w-5 h-5 text-orange-500" />
                        <span>{restaurant.deliveryTime || "25-35"} min</span>
                    </div>
                    <div className="h-2 w-2 rounded-full bg-gray-300" />
                    <div className="font-black text-gray-900">
                        ₹{restaurant.avg_cost_for_one || "200"} <span className="text-gray-400 font-bold text-xs uppercase">for one</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Restaurant Detail Page
const RestaurantDetail = () => {
    const { id } = useParams();
    const location = useLocation();
    const [restaurant, setRestaurant] = useState(null);
    const [loading, setLoading] = useState(true);
    const { addToCart, cartItems, updateQuantity } = useFoodCart();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRestaurant = async () => {
            try {
                const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
                const response = await axios.get(`${API_BASE}/api/food/restaurants/${id}`);
                setRestaurant(response.data);
            } catch (e) {
                console.error("Failed to fetch restaurant:", e);
            } finally {
                setLoading(false);
            }
        };
        fetchRestaurant();
    }, [id]);

    useEffect(() => {
        if (!loading && restaurant && location.hash) {
            const dishId = location.hash.substring(1);
            const element = document.getElementById(dishId);
            if (element) {
                setTimeout(() => {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    element.classList.add('ring-2', 'ring-orange-500', 'ring-offset-4', 'scale-[1.02]');
                    setTimeout(() => {
                        element.classList.remove('ring-2', 'ring-orange-500', 'ring-offset-4', 'scale-[1.02]');
                    }, 3000);
                }, 500);
            }
        }
    }, [loading, restaurant, location.hash]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (!restaurant) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Restaurant not found</h2>
                    <button
                        onClick={() => navigate('/food')}
                        className="text-orange-600 font-medium hover:text-orange-700"
                    >
                        Go back home
                    </button>
                </div>
            </div>
        );
    }

    const getItemQuantity = (itemId) => {
        const item = cartItems.find(i => i.id === itemId);
        return item ? item.quantity : 0;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero */}
            <div className="relative h-64 lg:h-80">
                <img
                    src={restaurant.image}
                    alt={restaurant.name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-4 left-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-700" />
                </button>

                {/* Restaurant Info */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h1 className="text-3xl font-bold mb-2">{restaurant.name}</h1>
                    <p className="text-white/80 mb-3">{restaurant.cuisine}</p>
                    <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1 px-2 py-1 bg-green-500 rounded-lg">
                            {restaurant.rating} <Star className="w-3 h-3 fill-current" />
                        </span>
                        <span>{restaurant.reviews_count || 0} reviews</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {restaurant.deliveryTime} min
                        </span>
                    </div>
                </div>
            </div>

            {/* Offers */}
            {restaurant.offers.length > 0 && (
                <div className="bg-orange-50 border-b border-orange-100">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <div className="flex items-center gap-3 text-orange-700">
                            <Percent className="w-5 h-5" />
                            <span className="font-medium">{restaurant.offers[0]}</span>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid lg:grid-cols-3 gap-12">
                    {/* Left: Menu */}
                    <div className="lg:col-span-2">
                        <h2 className="text-3xl font-black text-gray-900 mb-8">Menu</h2>
                        <div className="space-y-6">
                            {restaurant.menu.map(item => {
                                const quantity = getItemQuantity(item.id);
                                return (
                                    <div
                                        key={item.id}
                                        id={item.id}
                                        className="flex items-center gap-6 bg-white p-6 rounded-[32px] shadow-sm hover:shadow-xl transition-all duration-500 group border border-gray-100"
                                    >
                                        <div className="relative w-32 h-32 flex-shrink-0 rounded-2xl overflow-hidden">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                            {item.bestseller && (
                                                <span className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider">
                                                    Bestseller
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex-grow">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className={`w-3 h-3 rounded-full ${item.is_veg ? 'bg-green-500' : 'bg-red-500'}`} />
                                                <h3 className="text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors">{item.name}</h3>
                                            </div>
                                            <p className="text-gray-500 text-sm mb-4 line-clamp-2 leading-relaxed">{item.description}</p>
                                            <p className="text-2xl font-black text-gray-900">₹{item.price}</p>
                                        </div>

                                        <div className="flex-shrink-0">
                                            {quantity === 0 ? (
                                                <button
                                                    onClick={() => addToCart(item, restaurant.id, restaurant.name)}
                                                    className="px-8 py-3 bg-white border-2 border-orange-500 text-orange-600 font-bold rounded-2xl hover:bg-orange-50 transition-all active:scale-95"
                                                >
                                                    ADD
                                                </button>
                                            ) : (
                                                <div className="flex items-center gap-4 bg-orange-600 rounded-2xl p-1 shadow-lg shadow-orange-100">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, quantity - 1)}
                                                        className="p-2 text-white hover:bg-orange-700 rounded-xl transition-colors"
                                                    >
                                                        <Minus className="w-5 h-5" />
                                                    </button>
                                                    <span className="text-white font-black text-lg min-w-[20px] text-center">{quantity}</span>
                                                    <button
                                                        onClick={() => addToCart(item, restaurant.id, restaurant.name)}
                                                        className="p-2 text-white hover:bg-orange-700 rounded-xl transition-colors"
                                                    >
                                                        <Plus className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right: Reviews & Feedback */}
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-3xl font-black text-gray-900 mb-8">Customer Reviews</h2>
                            <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm space-y-8">
                                {/* Summary */}
                                <div className="flex items-center gap-6 pb-8 border-b border-gray-50">
                                    <div className="text-center">
                                        <div className="text-5xl font-black text-gray-900 mb-1">{restaurant.rating}</div>
                                        <div className="flex items-center justify-center gap-0.5 text-orange-500">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={`w-4 h-4 ${i < Math.floor(restaurant.rating) ? 'fill-current' : ''}`} />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="h-16 w-px bg-gray-100" />
                                    <div>
                                        <div className="text-gray-900 font-bold text-lg">{restaurant.reviews_count || 0} Verified Reviews</div>
                                        <div className="text-gray-400 font-medium text-sm">From food lovers like you</div>
                                    </div>
                                </div>

                                {/* Reviews List */}
                                <div className="space-y-8 max-h-[600px] overflow-y-auto pr-2 scrollbar-hide">
                                    {(restaurant.user_reviews && restaurant.user_reviews.length > 0) ? (
                                        restaurant.user_reviews.map((rev, idx) => (
                                            <div key={idx} className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-black">
                                                            {rev.user_name?.charAt(0) || 'U'}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-gray-900">{rev.user_name}</div>
                                                            <div className="text-xs text-gray-400 font-medium">{new Date(rev.created_at).toLocaleDateString()}</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-600 rounded-lg text-xs font-black">
                                                        {rev.rating} <Star className="w-3 h-3 fill-current" />
                                                    </div>
                                                </div>
                                                <p className="text-gray-600 text-sm leading-relaxed font-medium bg-gray-50/50 p-4 rounded-2xl italic">"{rev.comment}"</p>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-12">
                                            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-gray-200">
                                                <Star className="w-8 h-8 text-gray-300" />
                                            </div>
                                            <p className="text-gray-400 font-bold">No reviews yet. Be the first!</p>
                                        </div>
                                    )}
                                </div>

                                {/* Review Form (Simplistic for this component) */}
                                <ReviewForm restaurantId={restaurant.id} onReviewAdded={() => {
                                    // Refresh data
                                    const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
                                    axios.get(`${API_BASE}/api/food/restaurants/${restaurant.id}`).then(res => setRestaurant(res.data));
                                }} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ReviewForm = ({ restaurantId, onReviewAdded }) => {
    const { user } = useAuth();
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) return alert('Please login to post a review');
        setLoading(true);
        try {
            const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
            const token = localStorage.getItem('token');
            await axios.post(`${API_BASE}/api/food/restaurants/${restaurantId}/reviews`,
                { rating, comment },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setComment('');
            onReviewAdded();
        } catch (e) {
            console.error("Failed to post review:", e);
        } finally {
            setLoading(false);
        }
    };

    if (!user) return (
        <div className="pt-8 border-t border-gray-50 text-center">
            <p className="text-gray-500 font-bold mb-4 uppercase tracking-widest text-xs">Share your experience</p>
            <Link to="/auth" className="inline-block px-6 py-3 bg-gray-900 text-white font-black rounded-2xl hover:bg-orange-600 transition-all">Sign In to Review</Link>
        </div>
    );

    return (
        <form onSubmit={handleSubmit} className="pt-8 border-t border-gray-50 space-y-4">
            <p className="text-gray-900 font-black uppercase tracking-widest text-xs">Rate your meal</p>
            <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map(num => (
                    <button
                        key={num}
                        type="button"
                        onClick={() => setRating(num)}
                        className={`p-2 transition-all ${rating >= num ? 'text-orange-500' : 'text-gray-200'}`}
                    >
                        <Star className={`w-8 h-8 ${rating >= num ? 'fill-current' : ''}`} />
                    </button>
                ))}
            </div>
            <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share more details about your experience..."
                className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-orange-500 focus:bg-white rounded-2xl text-gray-900 font-medium outline-none transition-all resize-none h-32"
                required
            />
            <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-orange-600 text-white font-black rounded-2xl hover:bg-orange-700 transition-all shadow-xl shadow-orange-100 disabled:opacity-50"
            >
                {loading ? 'POSTING...' : 'POST REVIEW'}
            </button>
        </form>
    );
};

// Restaurants List Page
const RestaurantsList = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCuisine, setSelectedCuisine] = useState(null);
    const [restaurantsList, setRestaurantsList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('Relevance');
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const cuisine = params.get('cuisine');
        const search = params.get('search');
        if (cuisine) setSelectedCuisine(cuisine);
        if (search) setSearchQuery(search);

        const fetchRestaurants = async () => {
            setLoading(true);
            try {
                const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
                const response = await axios.get(`${API_BASE}/api/food/restaurants`, {
                    params: { search, cuisine }
                });
                setRestaurantsList(response.data);
            } catch (e) {
                console.error("Failed to fetch restaurants:", e);
            } finally {
                setLoading(false);
            }
        };
        fetchRestaurants();
    }, [location.search]);

    const filteredRestaurants = restaurantsList
        .filter(r => {
            const restaurantCuisine = (r.cuisine_type || "").toLowerCase().replace(/-/g, ' ');
            const selectedCuisineNormalized = (selectedCuisine || "").toLowerCase().replace(/-/g, ' ');
            const matchesCuisine = !selectedCuisine || restaurantCuisine.includes(selectedCuisineNormalized);

            const matchesSearch = !searchQuery ||
                r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (r.cuisine_type || "").toLowerCase().includes(searchQuery.toLowerCase());

            return matchesCuisine && matchesSearch;
        })
        .sort((a, b) => {
            if (sortBy === 'Rating') return (b.rating || 0) - (a.rating || 0);
            if (sortBy === 'Delivery Time') return (a.deliveryTime || 30) - (b.deliveryTime || 30);
            if (sortBy === 'Cost: Low to High') return (a.avg_cost_for_one || 0) - (b.avg_cost_for_one || 0);
            if (sortBy === 'Cost: High to Low') return (b.avg_cost_for_one || 0) - (a.avg_cost_for_one || 0);
            return 0;
        });

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500 font-black uppercase tracking-widest animate-pulse">Finding best restaurants...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-white">
            {/* Premium Hero Section */}
            <div className="relative pt-32 pb-24 bg-gray-900 overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1920&q=80"
                        alt="Hero Background"
                        className="w-full h-full object-cover opacity-40"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-gray-900/40 via-gray-900 to-white" />
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 backdrop-blur-md rounded-full text-orange-400 text-xs font-black uppercase tracking-widest mb-6 border border-orange-500/20">
                        <Sparkles className="w-4 h-4" />
                        Premium Dining Experiences
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight">
                        Discover <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">Local Flavors</span>
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto font-medium">
                        From street food to fine dining, explore the culinary excellence available for delivery right to your doorstep.
                    </p>
                </div>
            </div>

            {/* Sticky Filter Bar */}
            <div className="sticky top-16 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm shadow-gray-100/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 flex-grow max-w-4xl">
                            {/* Modern Search */}
                            <div className="relative flex-grow group">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 transition-colors group-focus-within:text-orange-500" />
                                <input
                                    type="text"
                                    placeholder="Find your favorite restaurant or cuisine..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-14 pr-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-orange-500 focus:bg-white text-gray-900 font-bold outline-none transition-all shadow-inner"
                                />
                            </div>

                            {/* Sort Dropdown */}
                            <div className="relative min-w-[200px]">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="w-full pl-6 pr-10 py-4 appearance-none bg-gray-50 border-2 border-transparent focus:border-orange-500 focus:bg-white rounded-2xl text-gray-900 font-bold outline-none transition-all cursor-pointer shadow-inner"
                                >
                                    {['Relevance', 'Rating', 'Delivery Time', 'Cost: Low to High', 'Cost: High to Low'].map(opt => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 rotate-90 pointer-events-none" />
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="hidden lg:block text-right">
                            <span className="text-gray-400 font-bold text-xs uppercase tracking-widest block mb-1">Results Found</span>
                            <span className="text-3xl font-black text-gray-900">{filteredRestaurants.length}</span>
                        </div>
                    </div>

                    {/* Cuisine Quick Access */}
                    <div className="flex gap-3 mt-6 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
                        <button
                            onClick={() => setSelectedCuisine(null)}
                            className={`px-8 py-3 rounded-2xl text-sm font-black uppercase tracking-wider whitespace-nowrap transition-all border-2 ${!selectedCuisine
                                ? 'bg-orange-600 text-white border-orange-600 shadow-xl shadow-orange-100'
                                : 'bg-white text-gray-500 border-gray-100 hover:border-orange-200 hover:text-orange-600 shadow-sm'
                                }`}
                        >
                            All Cuisines
                        </button>
                        {cuisines.map(cuisine => (
                            <button
                                key={cuisine.id}
                                onClick={() => setSelectedCuisine(cuisine.name.toLowerCase())}
                                className={`flex items-center gap-2 px-8 py-3 rounded-2xl text-sm font-black uppercase tracking-wider whitespace-nowrap transition-all border-2 ${selectedCuisine === cuisine.name.toLowerCase()
                                    ? 'bg-orange-600 text-white border-orange-600 shadow-xl shadow-orange-100'
                                    : 'bg-white text-gray-500 border-gray-100 hover:border-orange-200 hover:text-orange-600 shadow-sm'
                                    }`}
                            >
                                {cuisine.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Elegant Results Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {filteredRestaurants.length > 0 ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
                        {filteredRestaurants.map(restaurant => (
                            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-32 bg-gray-50 rounded-[48px] border-2 border-dashed border-gray-200 max-w-4xl mx-auto">
                        <div className="w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-8">
                            <Utensils className="w-12 h-12 text-gray-300" />
                        </div>
                        <h3 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">No restaurants match your filters</h3>
                        <p className="text-gray-500 font-medium text-lg mb-8 max-w-sm mx-auto">Try adjusting your search query or explore other culinary categories.</p>
                        <button
                            onClick={() => { setSearchQuery(''); setSelectedCuisine(null); }}
                            className="px-10 py-4 bg-orange-600 text-white font-black rounded-2xl hover:bg-orange-700 transition-all shadow-xl shadow-orange-100 flex items-center gap-3 mx-auto"
                        >
                            Clear All Filters <Zap className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// Food Items List Page (New Marketplace)
const FoodItemsList = () => {
    const [itemsList, setItemsList] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useFoodCart();
    const [searchParams] = useSearchParams();
    const category = searchParams.get('cuisine') || searchParams.get('category');

    useEffect(() => {
        const fetchItems = async () => {
            setLoading(true);
            try {
                const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
                let url = `${API_BASE}/api/food/items?limit=50`;
                if (category) {
                    url += `&category=${encodeURIComponent(category)}`;
                }
                console.log('Fetching items from:', url);
                const response = await axios.get(url);
                console.log('Items fetched:', response.data);
                setItemsList(response.data);
            } catch (e) {
                console.error("Failed to fetch food items:", e);
                console.error("Error response:", e.response);
            } finally {
                setLoading(false);
            }
        };
        fetchItems();
    }, [category]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-12">
                    <h1 className="text-5xl font-black text-gray-900 mb-4">
                        {category ? `${category.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())} Dishes` : 'Order Your Favorite Dishes'}
                    </h1>
                    <p className="text-gray-500 font-bold text-xl uppercase tracking-widest">
                        {category ? `Showing all ${category.replace(/-/g, ' ')} items` : 'Global Marketplace / Freshly Prepared'}
                    </p>
                    {category && (
                        <Link to="/food/items" className="inline-flex items-center gap-2 mt-4 text-orange-600 font-bold hover:text-orange-700 transition-colors">
                            View All Items <ArrowRight className="w-4 h-4" />
                        </Link>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {itemsList.map((item, i) => (
                        <div key={i} className="bg-white rounded-[32px] p-4 shadow-sm hover:shadow-2xl transition-all duration-500 group border border-gray-100 flex gap-6 items-center">
                            {/* Flex Left: Image */}
                            <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-[24px] overflow-hidden flex-shrink-0">
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 text-[10px] font-black text-gray-900 shadow-sm uppercase tracking-tight">
                                    <Star className="w-3 h-3 text-orange-500 fill-orange-500" /> 4.8 Rating
                                </div>
                            </div>

                            {/* Flex Right: Content */}
                            <div className="flex-grow pr-4">
                                <div className="mb-4">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className={`w-3 h-3 rounded-full ${item.is_veg ? 'bg-green-500' : 'bg-red-500'}`} />
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none outline-none">{item.is_veg ? 'Veg' : 'Non-Veg'}</span>
                                    </div>
                                    <h3 className="font-black text-gray-900 text-xl sm:text-2xl mb-1 group-hover:text-orange-600 transition-colors leading-tight">{item.name}</h3>
                                    <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-2">{item.restaurant_name}</p>
                                    <p className="text-gray-500 text-sm line-clamp-2 font-medium leading-relaxed">{item.description || 'Succulent and flavorful dish prepared with fresh ingredients and traditional spices.'}</p>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-2xl font-black text-gray-900">₹{item.price}</span>
                                    <button
                                        onClick={() => addToCart(item, item.restaurant_id, item.restaurant_name)}
                                        className="px-6 py-2.5 bg-orange-600 text-white font-black rounded-xl hover:bg-orange-700 transition-all shadow-lg shadow-orange-100 flex items-center gap-2 hover:scale-105 active:scale-95 text-sm"
                                    >
                                        <Plus className="w-4 h-4" /> ADD
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Cart Page
const FoodCart = () => {
    const { cartItems, updateQuantity, removeFromCart, getTotal, clearCart } = useFoodCart();
    const navigate = useNavigate();
    const deliveryFee = 40;
    const taxRate = 0.05;

    const subtotal = getTotal();
    const tax = subtotal * taxRate;
    const total = subtotal + deliveryFee + tax;

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <ShoppingCart className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
                    <p className="text-gray-500 mb-6">Add some delicious food to get started!</p>
                    <button
                        onClick={() => navigate('/food')}
                        className="px-6 py-3 bg-orange-500 text-white font-medium rounded-xl hover:bg-orange-600 transition-colors"
                    >
                        Browse Restaurants
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Your Cart</h1>
                {cartItems.length > 0 && (
                    <p className="text-gray-500 mb-6">From {cartItems[0].restaurantName}</p>
                )}

                {/* Cart Items */}
                <div className="bg-white rounded-2xl shadow-sm mb-6">
                    {cartItems.map(item => (
                        <div key={item.id} className="flex items-center gap-4 p-4 border-b border-gray-100 last:border-0">
                            <img
                                src={item.image}
                                alt={item.name}
                                className="w-20 h-20 rounded-xl object-cover"
                            />
                            <div className="flex-grow">
                                <h3 className="font-semibold text-gray-900">{item.name}</h3>
                                <p className="text-gray-500 text-sm">₹{item.price}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 bg-gray-100 rounded-xl">
                                    <button
                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                        className="p-2 text-gray-600 hover:text-orange-500"
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="font-medium w-8 text-center">{item.quantity}</span>
                                    <button
                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                        className="p-2 text-gray-600 hover:text-orange-500"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                                <button
                                    onClick={() => removeFromCart(item.id)}
                                    className="p-2 text-gray-400 hover:text-red-500"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <p className="font-bold text-gray-900 w-20 text-right">
                                ₹{item.price * item.quantity}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Order Summary */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <h3 className="font-bold text-gray-900 mb-4">Order Summary</h3>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Subtotal</span>
                            <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Delivery Fee</span>
                            <span className="font-medium">₹{deliveryFee}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Taxes & Charges</span>
                            <span className="font-medium">₹{tax.toFixed(2)}</span>
                        </div>
                        <div className="border-t border-gray-100 pt-3 flex justify-between text-lg">
                            <span className="font-bold text-gray-900">Total</span>
                            <span className="font-bold text-gray-900">₹{total.toFixed(2)}</span>
                        </div>
                    </div>

                    <button
                        onClick={async () => {
                            try {
                                const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
                                const token = localStorage.getItem('token');
                                if (!token) {
                                    alert("Please login to place an order");
                                    navigate('/auth');
                                    return;
                                }

                                await axios.post(`${API_BASE}/api/food/orders`, {
                                    restaurant_id: cartItems[0].restaurantId,
                                    restaurant_name: cartItems[0].restaurantName,
                                    items: cartItems,
                                    total: total,
                                    delivery_address: "" // Backend will use user profile address if empty
                                }, {
                                    headers: { Authorization: `Bearer ${token}` }
                                });

                                alert('Order placed successfully!');
                                clearCart();
                                navigate('/food/orders');
                            } catch (e) {
                                console.error(e);
                                alert("Failed to place order. Please try again.");
                            }
                        }}
                        className="w-full mt-6 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-xl hover:shadow-lg transition-all"
                    >
                        Place Order • ₹{total.toFixed(2)}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Orders Page
const FoodOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
                const token = localStorage.getItem('token');
                if (!token) return;

                const response = await axios.get(`${API_BASE}/api/food/orders`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setOrders(response.data);
            } catch (e) {
                console.error("Failed to fetch orders:", e);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h1>

                {orders.length > 0 ? (
                    <div className="space-y-4">
                        {orders.map(order => (
                            <div key={order.id} className="bg-white rounded-2xl shadow-sm p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 className="font-bold text-gray-900">{order.restaurant_name}</h3>
                                        <p className="text-sm text-gray-500">Order #{order.id}</p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${order.status === 'delivered'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-orange-100 text-orange-700'
                                        }`}>
                                        {order.status === 'delivered' ? 'Delivered' : order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                    </span>
                                </div>
                                <p className="text-gray-600 text-sm mb-3">
                                    {order.items.map(i => i.name).join(', ')}
                                </p>
                                <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                                    <span className="text-gray-500 text-sm">
                                        {new Date(order.created_at).toLocaleDateString()}
                                    </span>
                                    <span className="font-bold text-gray-900">₹{order.total}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <Timer className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No orders yet</h3>
                        <p className="text-gray-500">Your order history will appear here</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// Main Food App Component
const FoodApp = ({ onSwitchApp }) => {
    return (
        <FoodCartProvider>
            <div className="min-h-screen bg-gray-50">
                <FoodNavigation onSwitchApp={onSwitchApp} />
                <Routes>
                    <Route path="/" element={<FoodHome />} />
                    <Route path="/items" element={<FoodItemsList />} />
                    <Route path="/restaurants" element={<RestaurantsList />} />
                    <Route path="/restaurant/:id" element={<RestaurantDetail />} />
                    <Route path="/cart" element={<FoodCart />} />
                    <Route path="/orders" element={<FoodOrders />} />
                    <Route path="/profile" element={<FoodProfile />} />
                </Routes>
            </div>
        </FoodCartProvider>
    );
};

export default FoodApp;
