import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
    Utensils, MapPin, Search, User, ShoppingCart, Menu, X, ArrowLeft, Building2, Pizza, Clock, Store, Home
} from 'lucide-react';
import { useAuth } from '../../App';
import { useFoodCart } from '../../context/FoodCartContext';

const FoodNavigation = ({ onSwitchApp }) => {
    const { getItemCount, location, handleLocationUpdate } = useFoodCart();
    const { user, logout, updateUser } = useAuth();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showLocationModal, setShowLocationModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchSuggestions, setSearchSuggestions] = useState([]);
    const [newLocationInput, setNewLocationInput] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [isScrolled, setIsScrolled] = useState(false);
    const locationPath = useLocation();
    const isHomePage = locationPath.pathname === '/food' || locationPath.pathname === '/food/';
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

    // Filter suggestions as user types
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
        }, 300);

        return () => clearTimeout(timer);
    }, [newLocationInput]);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 400);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const onLocationConfirm = async (selectedLoc = null) => {
        const finalLoc = (selectedLoc && typeof selectedLoc === 'string' ? selectedLoc : newLocationInput).trim();
        if (!finalLoc) return;

        await handleLocationUpdate(finalLoc);
        setShowLocationModal(false);
        setNewLocationInput('');
        setSuggestions([]);

        // Sync to Profile Addresses if Logged In
        if (user && updateUser) {
            try {
                const currentAddresses = user.addresses || [];
                const isDuplicate = currentAddresses.some(a => 
                    (a.addr || "").toLowerCase().trim() === finalLoc.toLowerCase().trim()
                );

                if (!isDuplicate) {
                    const newAddress = {
                        id: Date.now(),
                        name: user.name || 'User',
                        phone: user.phone || '',
                        addr: finalLoc,
                        type: 'HOME'
                    };
                    const updatedAddresses = [...currentAddresses, newAddress];
                    await updateUser(user.id, { addresses: updatedAddresses });
                }
            } catch (err) {
                console.error("Auto address capture failed:", err);
            }
        }
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

                    {/* Center: Location & Search (Hidden on Home top) */}
                    <div className={`hidden lg:flex items-center flex-grow max-w-2xl bg-gray-50 rounded-full border border-gray-200 p-1 transition-all duration-500 ${(!isScrolled && isHomePage) ? 'opacity-0 invisible scale-95 translate-y-2' : 'opacity-100 visible scale-100 translate-y-0'}`}>
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
                            <ShoppingCart className="w-4 h-4" />
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
                                        <Link to="/profile" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600">
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

                {/* Mobile Search & Location */}
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

                                        {/* Saved Addresses Section */}
                                        {user && user.addresses && user.addresses.length > 0 && (
                                            <div className="mt-6 space-y-4">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="h-[1px] flex-grow bg-gray-100" />
                                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-2">Saved Locations</span>
                                                    <div className="h-[1px] flex-grow bg-gray-100" />
                                                </div>
                                                <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                                    {user.addresses.map((addr, idx) => (
                                                        <button
                                                            key={idx}
                                                            onClick={() => onLocationConfirm(addr.addr)}
                                                            className="flex items-start gap-3 p-4 rounded-3xl bg-white border border-gray-100 hover:border-orange-200 hover:bg-orange-50 transition-all text-left shadow-sm hover:shadow-md group"
                                                        >
                                                            <div className="mt-1 p-2 bg-orange-50 rounded-xl text-orange-600 group-hover:bg-white transition-colors">
                                                                <Home className="w-4 h-4" />
                                                            </div>
                                                            <div className="flex-grow min-w-0">
                                                                <div className="flex items-center justify-between mb-1">
                                                                    <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">{addr.type || 'HOME'}</span>
                                                                    <span className="text-[8px] text-gray-400 font-bold uppercase tracking-tight">{addr.name}</span>
                                                                </div>
                                                                <p className="text-sm font-bold text-gray-900 truncate tracking-tight">{addr.addr}</p>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

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

export default FoodNavigation;
