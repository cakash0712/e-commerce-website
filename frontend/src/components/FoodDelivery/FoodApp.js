import React, { useState, useEffect, createContext, useContext } from 'react';
import { Routes, Route, Link, useNavigate, useLocation, useParams, useSearchParams, Navigate } from 'react-router-dom';
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

import { FoodCartProvider, useFoodCart } from '../../context/FoodCartContext';
import FoodNavigation from './FoodNavigation';

const cuisines = [
    { id: 1, name: 'Pizza', icon: Pizza, color: 'bg-red-500' },
    { id: 2, name: 'Burgers', icon: Sandwich, color: 'bg-amber-500' },
    {
        id: 3,
        name: 'Indian',
        icon: ChefHat,
        color: 'bg-orange-500'
    },
    { id: 4, name: 'Chinese', icon: Soup, color: 'bg-rose-500' },
    { id: 5, name: 'Desserts', icon: IceCream, color: 'bg-pink-500' },
    { id: 6, name: 'Healthy', icon: Salad, color: 'bg-green-500' },
    { id: 7, name: 'Coffee', icon: Coffee, color: 'bg-amber-700' },
    { id: 8, name: 'BBQ', icon: Beef, color: 'bg-red-700' },
];



// Food Home Page
const FoodHome = () => {
    const navigate = useNavigate();
    const { location: userLocation, handleLocationUpdate, wishlist = [], addToCart } = useFoodCart();
    const [restaurantsList, setRestaurantsList] = useState([]);
    const [trendingDishes, setTrendingDishes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeFilter, setActiveFilter] = useState('All');
    const [localSearch, setLocalSearch] = useState('');
    const [showLocationModal, setShowLocationModal] = useState(false);
    const [offeredItems, setOfferedItems] = useState([]);
    const [newLocationInput, setNewLocationInput] = useState('');

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

                // Fetch offered items
                const offeredResponse = await axios.get(`${API_BASE}/api/food/items?offers_only=true&limit=6`);
                setOfferedItems(offeredResponse.data);

            } catch (e) {
                console.error("Failed to fetch home data:", e);
                setError("Unable to load the culinary experience. Check your connection.");
            } finally {
                setLoading(false);
            }
        };
        fetchHomeData();
    }, []);



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
        // Handle no location or placeholder
        if (!userLocation || userLocation === 'Select Location') {
            // Apply other filters if selected
            if (activeFilter === 'All') return true;
        } else {
            // Location Filter
            const userLoc = userLocation.toLowerCase();
            const resCity = (res.city || "").toLowerCase();
            const resPincode = (res.pincode || "").toLowerCase();
            const resArea = (res.area || "").toLowerCase();
            
            const isMatch = userLoc.includes(resCity) || userLoc.includes(resPincode) || userLoc.includes(resArea) ||
                          resCity.includes(userLoc) || resArea.includes(userLoc);
                          
            if (!isMatch && resCity) return false;
        }

        if (activeFilter === 'All') return true;
        if (activeFilter === 'Rating 4.0+') return (res.rating || 4.0) >= 4.0;
        if (activeFilter === 'Fast Delivery') return (res.deliveryTime || 30) <= 30;
        if (activeFilter === 'Veg Only') return res.menu?.some(item => item.is_veg);
        if (activeFilter === 'Offers') return res.offers && res.offers.length > 0;
        return true;
    });

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="flex flex-col items-center gap-6">
                <div className="relative">
                    <div className="w-24 h-24 border-8 border-orange-100 rounded-full"></div>
                    <div className="w-24 h-24 border-8 border-orange-600 border-t-transparent rounded-full animate-spin absolute top-0"></div>
                    <Utensils className="w-10 h-10 text-orange-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <div className="text-center">
                    <h3 className="text-2xl font-black text-gray-900 mb-2">Preparing your menu...</h3>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs animate-pulse">Finding the best local flavors</p>
                </div>
            </div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen flex items-center justify-center bg-white p-4">
            <div className="text-center max-w-md">
                <div className="w-24 h-24 bg-red-50 rounded-[40px] flex items-center justify-center mx-auto mb-8 border-2 border-dashed border-red-200">
                    <Zap className="w-12 h-12 text-red-500" />
                </div>
                <h3 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Oops! Something went wrong</h3>
                <p className="text-gray-500 font-medium text-lg mb-8 leading-relaxed">{error}</p>
                <button 
                    onClick={() => window.location.reload()}
                    className="px-10 py-4 bg-gray-900 text-white font-black rounded-2xl hover:bg-orange-600 transition-all shadow-xl shadow-orange-100 flex items-center gap-3 mx-auto"
                >
                    Try Again <ArrowLeft className="w-5 h-5 rotate-90" />
                </button>
            </div>
        </div>
    );

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

                        <div className="max-w-4xl mx-auto">
                            <div className="flex flex-col md:flex-row items-stretch bg-white rounded-2xl md:rounded-full p-2 gap-2 shadow-2xl mb-10 border border-gray-200/50">
                                <div 
                                    className="flex items-center gap-3 px-6 py-4 md:border-r border-gray-100 flex-shrink-0 cursor-pointer hover:bg-gray-50 transition-all rounded-xl md:rounded-l-full group"
                                    onClick={() => setShowLocationModal(true)}
                                >
                                    <MapPin className="w-5 h-5 text-orange-500 group-hover:scale-110 transition-transform" />
                                    <span className="font-bold text-gray-700 whitespace-nowrap truncate max-w-[150px]">{userLocation || 'Select Location'}</span>
                                    <ChevronRight className="w-4 h-4 text-gray-400 rotate-90" />
                                </div>
                                <div className="flex-grow flex items-center relative">
                                    <Search className="absolute left-6 w-5 h-5 text-gray-400" />
                                    <input 
                                        type="text"
                                        placeholder="Search for restaurants, cuisines or dishes..."
                                        className="w-full pl-14 pr-6 py-4 text-base font-bold text-gray-900 bg-transparent outline-none placeholder:text-gray-400"
                                        value={localSearch}
                                        onChange={(e) => setLocalSearch(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && navigate(`/food/restaurants?search=${localSearch}`)}
                                    />
                                    <button 
                                        onClick={() => navigate(`/food/restaurants?search=${localSearch}`)}
                                        className="hidden sm:block absolute right-2 px-8 py-3 bg-orange-600 text-white font-black rounded-full hover:bg-orange-700 transition-all shadow-lg active:scale-95"
                                    >
                                        Search
                                    </button>
                                </div>
                                <button 
                                    onClick={() => navigate(`/food/restaurants?search=${localSearch}`)}
                                    className="sm:hidden w-full py-4 bg-orange-600 text-white font-black rounded-xl hover:bg-orange-700 transition-all shadow-lg mt-2"
                                >
                                    Search
                                </button>
                            </div>
                        </div>

                        {/* Location Select Modal Copy (simplified for Home) */}
                        {showLocationModal && (
                            <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 backdrop-blur-sm bg-black/60">
                                <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden p-8 animate-in zoom-in duration-300">
                                    <div className="flex items-center justify-between mb-8">
                                        <h3 className="text-3xl font-black text-gray-900">Set Delivery Location</h3>
                                        <button onClick={() => setShowLocationModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X className="w-6 h-6" /></button>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="relative">
                                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-orange-500" />
                                            <input 
                                                type="text" 
                                                className="w-full pl-14 pr-4 py-5 bg-gray-50 border-2 border-transparent focus:border-orange-500 focus:bg-white rounded-2xl font-black text-lg outline-none transition-all"
                                                placeholder="Enter your area or city..."
                                                value={newLocationInput}
                                                onChange={(e) => setNewLocationInput(e.target.value)}
                                                autoFocus
                                            />
                                        </div>
                                        <button 
                                            onClick={() => {
                                                handleLocationUpdate(newLocationInput);
                                                setShowLocationModal(false);
                                            }}
                                            className="w-full py-5 bg-orange-600 text-white font-black rounded-2xl hover:bg-orange-700 shadow-xl transition-all text-xl"
                                        >
                                            Confirm Location
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
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

            {/* Favorites Section (Conditional) */}
            {wishlist.length > 0 && (
                <section className="py-16 bg-gray-50/50 overflow-hidden">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h2 className="text-3xl font-black text-gray-900 mb-2 flex items-center gap-3">
                                    Your Favorites <Heart className="w-6 h-6 text-red-500 fill-red-500" />
                                </h2>
                                <p className="text-gray-500 font-bold">Quick access to the places you love</p>
                            </div>
                            <Link to="/food/wishlist" className="text-orange-600 font-black uppercase tracking-widest text-xs hover:text-orange-700 transition-colors">View All Wishlist</Link>
                        </div>
                        <div className="flex gap-8 overflow-x-auto pb-8 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide snap-x">
                            {restaurantsList.filter(r => wishlist.includes(r.id)).map(restaurant => (
                                <div key={restaurant.id} className="min-w-[320px] sm:min-w-[400px] snap-start">
                                    <RestaurantCard restaurant={restaurant} />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Offers Section */}
            {offeredItems.length > 0 && (
                <section className="py-20 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between mb-12">
                            <div>
                                <h2 className="text-4xl font-black text-gray-900 mb-2">Unmissable Deals</h2>
                                <p className="text-gray-500 font-bold text-lg">Grab the best offers from top restaurants</p>
                            </div>
                            <div className="hidden sm:flex gap-4">
                                <Link to="/food/restaurants?filter=Offers" className="px-6 py-3 bg-gray-100 text-gray-900 font-black rounded-xl hover:bg-orange-600 hover:text-white transition-all text-sm uppercase tracking-widest">View All Offers</Link>
                            </div>
                        </div>
                        
                        <div className="flex gap-6 overflow-x-auto pb-10 scrollbar-hide no-scrollbar snap-x snap-mandatory">
                            {offeredItems.map((item, idx) => (
                                <div 
                                    key={item.id} 
                                    className={`min-w-[320px] sm:min-w-[420px] bg-gradient-to-br ${idx % 3 === 0 ? 'from-orange-500 to-red-600' : idx % 3 === 1 ? 'from-blue-500 to-indigo-600' : 'from-emerald-500 to-teal-600'} rounded-[48px] p-8 text-white relative overflow-hidden shadow-2xl hover:scale-[1.02] transition-all cursor-pointer snap-start group`}
                                    onClick={() => navigate(`/food/restaurant/${item.restaurant_id}`)}
                                >
                                    <div className="relative z-10 flex flex-col h-full">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-full border border-white/30">
                                                <Percent className="w-4 h-4 text-white" />
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">{item.offer_text || 'Limited Offer'}</span>
                                            </div>
                                            <div className="bg-white/20 backdrop-blur-md p-2 rounded-xl group-hover:bg-white transition-colors">
                                                <TrendingUp className="w-5 h-5 text-white group-hover:text-gray-900 transition-colors" />
                                            </div>
                                        </div>
                                        
                                        <div className="flex gap-6 mb-8">
                                            <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-white/20 shadow-lg shrink-0">
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-black mb-1 group-hover:text-orange-200 transition-colors">{item.name}</h3>
                                                <p className="text-white/80 font-bold text-sm mb-2">{item.restaurant_name}</p>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-2xl font-black">₹{item.price}</span>
                                                    {item.original_price && (
                                                        <span className="text-sm font-medium text-white/50 line-through">₹{item.original_price}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center justify-between mt-auto">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-1">Status</span>
                                                <div className="px-4 py-2 bg-black/20 backdrop-blur-md border border-white/20 rounded-xl font-black text-xs tracking-widest uppercase">
                                                    Available Now
                                                </div>
                                            </div>
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    addToCart({
                                                        id: item.id,
                                                        name: item.name,
                                                        price: item.price,
                                                        image: item.image,
                                                        restaurantId: item.restaurant_id,
                                                        restaurantName: item.restaurant_name
                                                    });
                                                }}
                                                className="w-14 h-14 bg-white text-gray-900 rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform hover:bg-orange-100"
                                            >
                                                <Plus className="w-6 h-6 " />
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {/* Aesthetic elements */}
                                    <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all" />
                                    <div className="absolute top-1/2 right-0 -translate-y-1/2 h-full w-32 bg-gradient-to-l from-white/5 to-transparent blur-xl" />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

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
                        {trendingDishes.length > 0 ? trendingDishes.map((dish, i) => (
                            <div key={dish.id || i} className="bg-white rounded-3xl p-4 shadow-sm hover:shadow-xl transition-all group">
                                <div className="relative h-48 rounded-2xl overflow-hidden mb-4 bg-orange-50">
                                    {dish.image ? (
                                        <img src={dish.image} alt={dish.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Utensils className="w-12 h-12 text-orange-200" />
                                        </div>
                                    )}
                                    <div className="absolute top-3 left-3">
                                        <span className={`px-2 py-1 rounded-lg text-xs font-bold text-white ${dish.is_veg ? 'bg-green-600' : 'bg-red-500'}`}>
                                            {dish.is_veg ? '🌱 Veg' : '🍖 Non-Veg'}
                                        </span>
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <h3 className="font-bold text-gray-900 text-lg mb-1">{dish.name}</h3>
                                    <p className="text-gray-500 text-sm font-medium">{dish.restaurant_name || 'Restaurant'}</p>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xl font-black text-gray-900">₹{dish.base_price || dish.price}</span>
                                    <button
                                        onClick={() => addToCart({
                                            id: dish.id,
                                            name: dish.name,
                                            price: dish.base_price || dish.price,
                                            image: dish.image,
                                            restaurantId: dish.restaurant_id,
                                            restaurantName: dish.restaurant_name
                                        })}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-orange-600 transition-all shadow-md shadow-orange-100 active:scale-95 group/btn"
                                    >
                                        <Plus className="w-4 h-4 group-hover/btn:rotate-90 transition-transform" /> ADD
                                    </button>
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-full py-12 text-center">
                                <Utensils className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                                <p className="text-gray-400 font-medium">No dishes available yet. Check back soon!</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Main Restaurants Section */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
                        <div>
                            <h2 className="text-3xl font-black text-gray-900">Restaurants Near You</h2>
                            <p className="text-gray-500 font-bold text-sm tracking-tight italic mt-1 leading-none outline-none">
                                {userLocation !== 'Select Location' 
                                    ? `Found ${filteredRestaurants.length} best places in ${userLocation}`
                                    : `Showing ${filteredRestaurants.length} popular restaurants near you`
                                }
                            </p>
                        </div>

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
    const { toggleWishlist, isWishlisted } = useFoodCart();
    const isOpen = restaurant.is_open ?? true;
    const wishlisted = isWishlisted(restaurant.id);

    return (
        <div
            onClick={() => navigate(`/food/restaurant/${restaurant.id}`)}
            className="group bg-white rounded-[40px] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer border border-gray-100 flex flex-col h-full active:scale-[0.98]"
        >
            {/* Image Section */}
            <div className="relative h-64 overflow-hidden bg-orange-50">
                {restaurant.image ? (
                    <img
                        src={restaurant.image}
                        alt={restaurant.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Utensils className="w-16 h-16 text-orange-200" />
                    </div>
                )}

                {/* Offer Badge (Optional) */}
                {restaurant.offers && restaurant.offers.length > 0 && (
                    <div className="absolute bottom-4 left-4 right-4 bg-gradient-to-r from-orange-600 to-red-600 text-white p-3 rounded-2xl shadow-xl flex items-center justify-between pointer-events-none">
                        <div className="flex items-center gap-2">
                            <Percent className="w-5 h-5" />
                            <span className="font-black text-sm uppercase tracking-tight">{restaurant.offers[0]}</span>
                        </div>
                    </div>
                )}

                {/* Status Badge */}
                {!isOpen && (
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-[2px] flex items-center justify-center pointer-events-none">
                        <span className="px-6 py-2 bg-white text-gray-900 font-black rounded-full uppercase tracking-widest text-sm shadow-xl">Currently Closed</span>
                    </div>
                )}

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(restaurant.id);
                    }}
                    className="absolute top-4 right-4 w-12 h-12 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white shadow-lg group/btn z-10"
                >
                    <Heart className={`w-6 h-6 transition-all ${wishlisted ? 'text-red-500 fill-red-500 scale-110' : 'text-gray-400 group-hover/btn:text-red-500'}`} />
                </button>
            </div>

            {/* Content Section */}
            <div className="p-8 flex-grow flex flex-col">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h3 className="text-2xl font-black text-gray-900 mb-1 group-hover:text-orange-600 transition-colors leading-tight">{restaurant.name}</h3>
                        <p className="text-gray-500 font-bold text-xs uppercase tracking-wider mb-2">{restaurant.cuisine_type || restaurant.cuisine}</p>
                        <div className="flex items-center gap-1.5 text-gray-400 font-black text-[10px] uppercase tracking-widest italic leading-none outline-none">
                            <MapPin className="w-3 h-3 text-orange-500" />
                            <span>{restaurant.area || restaurant.city || "Nearby"}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-sm font-black rounded-xl shadow-lg shadow-green-100">
                        {restaurant.rating || "4.0"}
                        <Star className="w-3.5 h-3.5 fill-current" />
                    </div>
                </div>

                <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between text-gray-600">
                    <div className="flex items-center gap-1.5 font-bold">
                        <Clock className="w-5 h-5 text-orange-500" />
                        <span>{restaurant.delivery_time || restaurant.deliveryTime || "30-45"} min</span>
                    </div>
                    <div className="h-2 w-2 rounded-full bg-gray-300" />
                    <div className="font-black text-gray-900">
                        ₹{restaurant.delivery_fee || restaurant.deliveryFee || "0"} <span className="text-gray-400 font-bold text-xs uppercase">delivery</span>
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
                        {/* Menu is a categorized dict: { 'Pizza': [...], 'Burgers': [...] } */}
                        {restaurant.menu && Object.keys(restaurant.menu).length > 0 ? (
                            <div className="space-y-10">
                                {Object.entries(restaurant.menu).map(([categoryName, items]) => (
                                    <div key={categoryName}>
                                        <h3 className="text-xl font-black text-gray-800 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
                                            <Utensils className="w-5 h-5 text-orange-500" />
                                            {categoryName}
                                            <span className="text-sm font-normal text-gray-400">({items.length} items)</span>
                                        </h3>
                                        <div className="space-y-4">
                                            {items.map(item => {
                                                const quantity = getItemQuantity(item.id);
                                                const itemPrice = item.base_price || item.price;
                                                return (
                                                    <div
                                                        key={item.id}
                                                        id={item.id}
                                                        className="flex items-center gap-6 bg-white p-6 rounded-[32px] shadow-sm hover:shadow-xl transition-all duration-500 group border border-gray-100"
                                                    >
                                                        <div className="relative w-32 h-32 flex-shrink-0 rounded-2xl overflow-hidden bg-orange-50">
                                                            {item.image ? (
                                                                <img
                                                                    src={item.image}
                                                                    alt={item.name}
                                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center">
                                                                    <Utensils className="w-10 h-10 text-orange-200" />
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="flex-grow">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <div className={`w-3 h-3 rounded-full ${item.is_veg ? 'bg-green-500' : 'bg-red-500'}`} />
                                                                <h3 className="text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors">{item.name}</h3>
                                                            </div>
                                                            <p className="text-gray-500 text-sm mb-3 line-clamp-2 leading-relaxed">{item.description}</p>
                                                            {item.preparation_time && (
                                                                <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                                                                    <Clock className="w-3 h-3" /> {item.preparation_time}
                                                                </p>
                                                            )}
                                                            <p className="text-2xl font-black text-gray-900">₹{itemPrice}</p>
                                                        </div>

                                                        <div className="flex-shrink-0">
                                                            {quantity === 0 ? (
                                                                <button
                                                                    onClick={() => addToCart({ ...item, price: itemPrice }, restaurant.id, restaurant.name)}
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
                                                                        onClick={() => addToCart({ ...item, price: itemPrice }, restaurant.id, restaurant.name)}
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
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200">
                                <Utensils className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-gray-700 mb-2">Menu coming soon</h3>
                                <p className="text-gray-400">This restaurant hasn't added menu items yet.</p>
                            </div>
                        )}
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
    const [couponCode, setCouponCode] = useState('');
    const [discount, setDiscount] = useState(0);

    const deliveryFee = 40;
    const taxRate = 0.05;
    const subtotal = getTotal();
    const tax = subtotal * taxRate;
    const total = subtotal + deliveryFee + tax - discount;

    const applyCoupon = () => {
        if (couponCode.toUpperCase() === 'DACH50') {
            setDiscount(Math.min(subtotal * 0.5, 150));
            alert('Coupon applied successfully!');
        } else if (couponCode.toUpperCase() === 'WELCOME') {
            setDiscount(40);
            alert('Free delivery applied!');
        } else {
            alert('Invalid coupon code');
            setDiscount(0);
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <div className="w-32 h-32 bg-orange-100 rounded-[48px] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-orange-100/50 scale-110">
                        <ShoppingBag className="w-16 h-16 text-orange-600" />
                    </div>
                    <h2 className="text-4xl font-black text-gray-900 mb-4">Your cart is empty</h2>
                    <p className="text-gray-500 font-medium text-lg mb-10 leading-relaxed tracking-tight">Looks like you haven't added anything to your cart yet. Let's find you some delicious food!</p>
                    <button
                        onClick={() => navigate('/food')}
                        className="w-full py-5 bg-gray-900 text-white font-black rounded-2xl hover:bg-orange-600 transition-all shadow-xl shadow-orange-100 flex items-center justify-center gap-3 active:scale-95"
                    >
                        <Utensils className="w-6 h-6" /> START EXPLORING
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-32 pb-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-start">
                {/* Left Column: Items */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-black text-gray-900 tracking-tight">My Order</h1>
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mt-2">Items from {cartItems[0].restaurantName}</p>
                        </div>
                        <button onClick={clearCart} className="text-red-500 font-black text-xs uppercase tracking-widest hover:text-red-600 transition-colors">Clear Cart</button>
                    </div>

                    <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
                        {cartItems.map((item, idx) => (
                            <div key={item.id} className={`flex items-center gap-6 p-8 group transition-colors hover:bg-gray-50/50 ${idx !== cartItems.length - 1 ? 'border-b border-gray-50' : ''}`}>
                                <div className="w-24 h-24 rounded-3xl overflow-hidden bg-gray-100 shadow-lg group-hover:scale-105 transition-transform duration-500">
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-grow">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className={`w-3 h-3 rounded-full ${item.is_veg ? 'bg-green-500' : 'bg-red-500'}`} />
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.is_veg ? 'Veg' : 'Non-Veg'}</span>
                                    </div>
                                    <h3 className="font-black text-gray-900 text-xl mb-1">{item.name}</h3>
                                    <p className="text-gray-400 font-bold text-sm tracking-tight italic">₹{item.price}</p>
                                </div>
                                <div className="flex items-center gap-2 bg-gray-100 rounded-2xl p-1 shadow-inner group/controls">
                                    <button onClick={() => updateQuantity(item.id, -1)} className="p-2.5 hover:bg-white rounded-xl transition-all"><Minus className="w-4 h-4 text-gray-600" /></button>
                                    <span className="w-8 text-center font-black text-gray-900">{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.id, 1)} className="p-2.5 hover:bg-white rounded-xl transition-all"><Plus className="w-4 h-4 text-gray-600" /></button>
                                </div>
                                <div className="text-right min-w-[80px]">
                                    <p className="font-black text-gray-900 text-xl">₹{item.price * item.quantity}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Safe for delivery check */}
                    <div className="bg-green-50 border border-green-100 rounded-3xl p-6 flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                            <Check className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <p className="font-black text-green-900 text-sm italic">Safe Hygiene & Non-Toxic Packaging</p>
                            <p className="text-green-700 text-xs font-medium">FoodBites ensures all items are packed following strict guidelines.</p>
                        </div>
                    </div>
                </div>

                {/* Right Column: Checkout Summary */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white rounded-[40px] shadow-2xl border border-gray-100 p-8 pt-10 relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-orange-500 to-red-600" />
                        
                        {/* Coupon Section */}
                        <div className="mb-10">
                            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Promotions & Coupons</h4>
                            <div className="flex gap-2">
                                <div className="relative flex-grow">
                                    <Percent className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-500" />
                                    <input 
                                        type="text" 
                                        placeholder="Enter coupon code" 
                                        className="w-full pl-11 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-orange-500 focus:bg-white rounded-2xl text-sm font-black outline-none transition-all shadow-inner uppercase"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value)}
                                    />
                                </div>
                                <button onClick={applyCoupon} className="px-6 py-4 bg-gray-900 text-white font-black text-sm rounded-2xl hover:bg-orange-600 transition-all shadow-xl shadow-orange-100">APPLY</button>
                            </div>
                            {discount > 0 && <p className="mt-3 text-green-600 font-bold text-xs">✓ Applied - You saved ₹{discount}!</p>}
                        </div>

                        {/* Bill Breakdown */}
                        <div className="space-y-6 mb-10">
                            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Bill Summary</h4>
                            <div className="space-y-4">
                                <div className="flex justify-between text-gray-600 font-medium">
                                    <span className="flex items-center gap-2">Subtotal</span>
                                    <span>₹{subtotal}</span>
                                </div>
                                <div className="flex justify-between text-gray-600 font-medium">
                                    <span className="flex items-center gap-2">Delivery Fee <Clock className="w-3 h-3" /></span>
                                    <span className={discount === 40 || couponCode === 'WELCOME' ? 'line-through text-gray-300' : ''}>₹{deliveryFee}</span>
                                </div>
                                <div className="flex justify-between text-gray-600 font-medium">
                                    <span className="flex items-center gap-2">Tax & Charges (5%) <Sparkles className="w-3 h-3" /></span>
                                    <span>₹{tax.toFixed(0)}</span>
                                </div>
                                {discount > 0 && (
                                    <div className="flex justify-between text-green-600 font-black italic">
                                        <span>Discount Applied</span>
                                        <span>-₹{discount}</span>
                                    </div>
                                )}
                            </div>
                            <div className="border-t border-gray-100 pt-6 flex justify-between items-end">
                                <div>
                                    <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Total Payable</p>
                                    <p className="text-4xl font-black text-gray-900">₹{total.toFixed(0)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-orange-600 font-black text-xs italic">Inclusive of taxes</p>
                                </div>
                            </div>
                        </div>

                        {/* Payment Selection (Mock) */}
                        <div className="mb-10">
                            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Payment Method</h4>
                            <div className="grid grid-cols-3 gap-2">
                                <button className="p-3 bg-orange-50 border-2 border-orange-500 rounded-2xl flex flex-col items-center gap-1">
                                    <Check className="w-4 h-4 text-orange-600" />
                                    <span className="text-[10px] font-black text-orange-600 uppercase">COD</span>
                                </button>
                                <button className="p-3 bg-gray-50 border-2 border-transparent rounded-2xl flex flex-col items-center gap-1 opacity-50 grayscale">
                                    <CreditCard className="w-4 h-4 text-gray-400" />
                                    <span className="text-[10px] font-black text-gray-400 uppercase">UPI</span>
                                </button>
                                <button className="p-3 bg-gray-50 border-2 border-transparent rounded-2xl flex flex-col items-center gap-1 opacity-50 grayscale">
                                    <Building2 className="w-4 h-4 text-gray-400" />
                                    <span className="text-[10px] font-black text-gray-400 uppercase">CARD</span>
                                </button>
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
                                        delivery_address: "" 
                                    }, {
                                        headers: { Authorization: `Bearer ${token}` }
                                    });

                                    clearCart();
                                    navigate('/food/orders');
                                } catch (e) {
                                    console.error(e);
                                    alert("Failed to place order. Please try again.");
                                }
                            }}
                            className="w-full py-6 bg-gradient-to-r from-orange-500 to-red-600 text-white font-black rounded-3xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-lg"
                        >
                            CONFIRM ORDER <ArrowRight className="w-6 h-6" />
                        </button>
                    </div>

                    <p className="text-center text-gray-400 font-bold text-[10px] uppercase tracking-widest px-8">
                        By placing the order, you agree to our Terms of Use and Privacy Policy.
                    </p>
                </div>
            </div>
        </div>
    );
};

// Live Order Tracking Component (Simulated)
const LiveTracking = ({ order, onBack }) => {
    const [step, setStep] = useState(1);
    const [progress, setProgress] = useState(25);

    useEffect(() => {
        const timer = setInterval(() => {
            setStep(prev => (prev < 4 ? prev + 1 : prev));
            setProgress(prev => (prev < 100 ? prev + 25 : prev));
        }, 8000);
        return () => clearInterval(timer);
    }, []);

    const steps = [
        { id: 1, label: 'Order Confirmed', sub: 'The restaurant has received your order', icon: Check },
        { id: 2, label: 'Preparing', sub: 'Your food is being cooked with care', icon: ChefHat },
        { id: 3, label: 'Out for Delivery', sub: 'A rider is on their way with your food', icon: Bike },
        { id: 4, label: 'Delivered', sub: 'Enjoy your delicious meal!', icon: HomeIcon },
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* Tracking Header */}
            <header className="p-6 border-b border-gray-100 flex items-center gap-4">
                <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><ArrowLeft className="w-6 h-6 text-gray-900" /></button>
                <div>
                    <h2 className="text-xl font-black text-gray-900 leading-tight">Tracking Order #{order.id}</h2>
                    <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">{order.restaurant_name}</p>
                </div>
            </header>

            <div className="max-w-7xl mx-auto grid lg:grid-cols-2">
                {/* Visual Tracking (Mock Map) */}
                <div className="bg-gray-100 h-96 lg:h-[calc(100vh-80px)] relative overflow-hidden">
                    {/* Mock Map Background */}
                    <div className="absolute inset-0 opacity-20">
                        <svg width="100%" height="100%" className="text-gray-400">
                            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
                            </pattern>
                            <rect width="100%" height="100%" fill="url(#grid)" />
                        </svg>
                    </div>

                    {/* Animated Path */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative w-full max-w-lg p-12">
                            {/* Road Line */}
                            <div className="absolute left-10 right-10 top-1/2 -translate-y-1/2 h-1 bg-gray-200 rounded-full " />
                            <div 
                                className="absolute left-10 top-1/2 -translate-y-1/2 h-1 bg-orange-500 rounded-full transition-all duration-[8000ms] ease-linear" 
                                style={{ width: `calc(${progress}% - 80px)` }}
                            />

                            {/* Icons */}
                            <div className="relative flex justify-between">
                                <div className="w-16 h-16 bg-white rounded-3xl shadow-xl border-4 border-orange-50 flex items-center justify-center z-10">
                                    <ChefHat className="w-8 h-8 text-orange-600" />
                                </div>
                                <div 
                                    className="w-16 h-16 bg-orange-600 rounded-3xl shadow-2xl flex items-center justify-center z-20 absolute top-0 -translate-x-1/2 transition-all duration-[8000ms] ease-linear"
                                    style={{ left: `${progress}%` }}
                                >
                                    <Bike className="w-8 h-8 text-white animate-bounce" />
                                </div>
                                <div className="w-16 h-16 bg-white rounded-3xl shadow-xl border-4 border-green-50 flex items-center justify-center z-10">
                                    <HomeIcon className="w-8 h-8 text-green-600" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Rider Info Card */}
                    <div className="absolute bottom-8 left-8 right-8 bg-white/90 backdrop-blur-xl p-6 rounded-[32px] shadow-2xl border border-white/50 flex items-center gap-6 animate-in slide-in-from-bottom duration-500 delay-300">
                        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center font-black text-2xl text-orange-600">JS</div>
                        <div className="flex-grow">
                            <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest leading-none outline-none">Delivery Partner</p>
                            <h4 className="text-xl font-black text-gray-900 mb-1">John S.</h4>
                            <div className="flex items-center gap-2 text-sm text-gray-500 font-bold">
                                <Star className="w-4 h-4 text-orange-500 fill-orange-500" /> 4.9 • Superfast Partner
                            </div>
                        </div>
                        <button className="p-4 bg-gray-900 text-white rounded-2xl hover:bg-orange-600 transition-all shadow-lg active:scale-95"><Phone className="w-6 h-6" /></button>
                    </div>
                </div>

                {/* Status List */}
                <div className="p-8 lg:p-16 bg-white space-y-12 overflow-y-auto">
                    <div>
                        <h3 className="text-3xl font-black text-gray-900 mb-2">Order Status</h3>
                        <p className="text-gray-500 font-medium">Estimated arrival in {25 - (step * 5)} mins</p>
                    </div>

                    <div className="space-y-10">
                        {steps.map((s, idx) => {
                            const isPast = step > s.id;
                            const isCurrent = step === s.id;
                            return (
                                <div key={s.id} className="flex gap-6 relative group">
                                    {/* Vertical Line */}
                                    {idx !== steps.length - 1 && (
                                        <div className={`absolute left-8 top-16 bottom-[-40px] w-1 ${isPast ? 'bg-orange-500' : 'bg-gray-100'}`} />
                                    )}

                                    <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                                        isPast ? 'bg-orange-600 text-white shadow-xl shadow-orange-100' : 
                                        isCurrent ? 'bg-white text-orange-600 border-4 border-orange-500 shadow-2xl scale-110' : 
                                        'bg-gray-50 text-gray-300'
                                    }`}>
                                        <s.icon className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <h4 className={`text-xl font-black tracking-tight ${isCurrent || isPast ? 'text-gray-900' : 'text-gray-300'}`}>{s.label}</h4>
                                        <p className={`text-sm font-medium ${isCurrent || isPast ? 'text-gray-500' : 'text-gray-200'}`}>{s.sub}</p>
                                        {isCurrent && <span className="inline-block mt-3 px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse">In Progress</span>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Orders Page
const FoodOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [trackingOrder, setTrackingOrder] = useState(null);
    const navigate = useNavigate();

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

    if (trackingOrder) return <LiveTracking order={trackingOrder} onBack={() => setTrackingOrder(null)} />;

    return (
        <div className="min-h-screen bg-gray-50 pt-32 pb-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Order History</h1>
                        <p className="text-gray-500 font-bold text-lg">Manage and track your recent orders</p>
                    </div>
                </div>

                {loading ? (
                    <div className="space-y-6">
                        {[1, 2, 3].map(n => (
                            <div key={n} className="h-48 bg-white rounded-[32px] animate-pulse shadow-sm border border-gray-100" />
                        ))}
                    </div>
                ) : orders.length > 0 ? (
                    <div className="space-y-8">
                        {orders.map(order => (
                            <div key={order.id} className="bg-white rounded-[40px] shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 overflow-hidden group">
                                <div className="p-8 pb-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-3xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                                                <Utensils className="w-8 h-8" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="text-2xl font-black text-gray-900 leading-none outline-none">{order.restaurant_name}</h3>
                                                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-50 text-green-600 rounded-lg text-[10px] font-black shadow-sm">
                                                        4.2 <Star className="w-2.5 h-2.5 fill-current" />
                                                    </div>
                                                </div>
                                                <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Order #{order.id} • {new Date(order.created_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <span className={`self-start sm:self-center px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest border-2 ${
                                            order.status === 'delivered' ? 'bg-green-50 text-green-600 border-green-100' :
                                            order.status === 'cancelled' ? 'bg-red-50 text-red-600 border-red-100' :
                                            'bg-orange-50 text-orange-600 border-orange-100 animate-pulse'
                                        }`}>
                                            {order.status}
                                        </span>
                                    </div>
                                    <div className="flex gap-2 flex-wrap mb-6">
                                        {order.items.map((i, idx) => (
                                            <span key={idx} className="px-4 py-2 bg-gray-50 text-gray-700 rounded-xl text-xs font-black border border-gray-100 group-hover:bg-gray-100 transition-colors">
                                                {i.quantity} x {i.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-50 flex items-center justify-between group-hover:bg-gray-50 transition-colors">
                                    <div>
                                        <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest outline-none">Total Amount Paid</p>
                                        <p className="text-2xl font-black text-gray-900 tracking-tight">₹{order.total}</p>
                                    </div>
                                    <div className="flex gap-3">
                                        <button 
                                            onClick={() => navigate(`/food/restaurant/${order.restaurant_id}`)}
                                            className="px-6 py-3 bg-white text-gray-900 border-2 border-gray-100 font-black rounded-2xl hover:border-orange-500 hover:text-orange-600 transition-all text-xs uppercase tracking-widest"
                                        >
                                            View Menu
                                        </button>
                                        {order.status !== 'delivered' && order.status !== 'cancelled' && (
                                            <button 
                                                onClick={() => setTrackingOrder(order)}
                                                className="px-6 py-3 bg-gray-900 text-white font-black rounded-2xl hover:bg-orange-600 transition-all shadow-xl shadow-orange-100 text-xs uppercase tracking-widest flex items-center gap-2"
                                            >
                                                Track Now <Bike className="w-4 h-4" />
                                            </button>
                                        ) }
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-32 bg-white rounded-[48px] shadow-sm border border-gray-100">
                        <div className="w-24 h-24 bg-gray-50 rounded-[40px] flex items-center justify-center mx-auto mb-8 border-2 border-dashed border-gray-200">
                            <Clock className="w-12 h-12 text-gray-300" />
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 mb-4">No orders yet</h2>
                        <p className="text-gray-500 font-medium mb-10 max-w-xs mx-auto">Hungry? Discover the best flavors in town and start your first order!</p>
                        <button
                            onClick={() => navigate('/food')}
                            className="px-12 py-5 bg-orange-600 text-white font-black rounded-2xl hover:bg-orange-700 shadow-2xl shadow-orange-100 transition-all flex items-center gap-3 mx-auto"
                        >
                            GO TO CHOW <Utensils className="w-6 h-6" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// Cart Preview Component
const CartPreviewBar = () => {
    const { cartItems, getTotal, getItemCount } = useFoodCart();
    const navigate = useNavigate();
    
    if (cartItems.length === 0) return null;
    
    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-full max-w-4xl px-4 animate-in fade-in slide-in-from-bottom-10 duration-500">
            <div className="bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-[32px] p-5 shadow-2xl flex items-center justify-between ring-1 ring-white/20">
                <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center relative shadow-lg shadow-orange-600/20">
                        <ShoppingBag className="w-7 h-7 text-white" />
                        <span className="absolute -top-2 -right-2 w-7 h-7 bg-white text-orange-600 rounded-full flex items-center justify-center text-xs font-black border-2 border-orange-600 shadow-xl">
                            {getItemCount()}
                        </span>
                    </div>
                    <div className="hidden sm:block">
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Your Order from {cartItems[0].restaurantName || 'Restaurant'}</p>
                        <div className="flex items-center gap-3">
                            <p className="text-white font-black text-2xl tracking-tight">₹{getTotal()}</p>
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-600" />
                            <p className="text-gray-400 text-sm font-bold">{getItemCount()} {getItemCount() === 1 ? 'item' : 'items'}</p>
                        </div>
                    </div>
                    {/* Mobile view info */}
                    <div className="sm:hidden">
                        <p className="text-white font-black text-xl">₹{getTotal()}</p>
                        <p className="text-gray-400 text-[10px] uppercase font-black">{getItemCount()} items</p>
                    </div>
                </div>
                <button 
                    onClick={() => navigate('/food/cart')}
                    className="flex items-center gap-3 px-8 py-4 bg-white text-gray-900 font-black rounded-2xl hover:bg-orange-50 transition-all shadow-xl active:scale-95 group whitespace-nowrap"
                >
                    VIEW CART <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
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
                    <Route path="/profile" element={<Navigate to="/profile" replace />} />
                </Routes>
                <CartPreviewBar />
            </div>
        </FoodCartProvider>
    );
};

export default FoodApp;
