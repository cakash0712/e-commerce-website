import React, { useState, useEffect, createContext, useContext } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import {
    Utensils, ShoppingBag, MapPin, Clock, Star, Search, ChevronRight,
    Heart, Plus, Minus, X, ArrowLeft, Filter, Sparkles, Flame, Zap,
    Bike, Check, Home, User, ShoppingCart, Menu, Phone, Mail, Timer,
    ChefHat, Coffee, Pizza, Salad, Sandwich, IceCream, Soup, Beef,
    ArrowRight, Gift, Percent, TrendingUp
} from 'lucide-react';
import { useAuth } from '../../App';

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
            cartItems, addToCart, removeFromCart, updateQuantity, clearCart, getTotal, getItemCount
        }}>
            {children}
        </FoodCartContext.Provider>
    );
};

// Sample Data
const cuisines = [
    { id: 1, name: 'Pizza', icon: Pizza, color: 'bg-red-500' },
    { id: 2, name: 'Burgers', icon: Sandwich, color: 'bg-amber-500' },
    { id: 3, name: 'Indian', icon: ChefHat, color: 'bg-orange-500' },
    { id: 4, name: 'Chinese', icon: Soup, color: 'bg-rose-500' },
    { id: 5, name: 'Desserts', icon: IceCream, color: 'bg-pink-500' },
    { id: 6, name: 'Healthy', icon: Salad, color: 'bg-green-500' },
    { id: 7, name: 'Coffee', icon: Coffee, color: 'bg-amber-700' },
    { id: 8, name: 'BBQ', icon: Beef, color: 'bg-red-700' },
];

const restaurants = [
    {
        id: 1,
        name: "Spice Garden",
        cuisine: "Indian",
        rating: 4.5,
        reviews: 234,
        deliveryTime: "25-35",
        deliveryFee: 40,
        minOrder: 200,
        image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop",
        featured: true,
        offers: ["20% OFF on orders above ₹500"],
        menu: [
            { id: 101, name: "Butter Chicken", price: 320, description: "Creamy tomato-based curry with tender chicken", image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=300&h=200&fit=crop", veg: false, bestseller: true },
            { id: 102, name: "Paneer Tikka", price: 280, description: "Grilled cottage cheese with spices", image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=300&h=200&fit=crop", veg: true, bestseller: true },
            { id: 103, name: "Dal Makhani", price: 220, description: "Slow-cooked black lentils in butter", image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&h=200&fit=crop", veg: true },
            { id: 104, name: "Biryani", price: 350, description: "Fragrant basmati rice with spices and meat", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300&h=200&fit=crop", veg: false, bestseller: true },
            { id: 105, name: "Naan Basket", price: 120, description: "Assorted fresh-baked breads", image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=300&h=200&fit=crop", veg: true },
        ]
    },
    {
        id: 2,
        name: "Pizza Paradise",
        cuisine: "Italian",
        rating: 4.7,
        reviews: 567,
        deliveryTime: "20-30",
        deliveryFee: 30,
        minOrder: 250,
        image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=400&fit=crop",
        featured: true,
        offers: ["Free Garlic Bread on orders above ₹600"],
        menu: [
            { id: 201, name: "Margherita Pizza", price: 299, description: "Classic tomato, mozzarella & basil", image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=300&h=200&fit=crop", veg: true, bestseller: true },
            { id: 202, name: "Pepperoni Pizza", price: 449, description: "Loaded with pepperoni slices", image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=300&h=200&fit=crop", veg: false, bestseller: true },
            { id: 203, name: "Pasta Alfredo", price: 329, description: "Creamy white sauce pasta", image: "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=300&h=200&fit=crop", veg: true },
            { id: 204, name: "Garlic Bread", price: 149, description: "Crispy bread with garlic butter", image: "https://images.unsplash.com/photo-1619531040576-f9416740661b?w=300&h=200&fit=crop", veg: true },
        ]
    },
    {
        id: 3,
        name: "Dragon Wok",
        cuisine: "Chinese",
        rating: 4.3,
        reviews: 189,
        deliveryTime: "30-40",
        deliveryFee: 50,
        minOrder: 300,
        image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=600&h=400&fit=crop",
        featured: false,
        offers: [],
        menu: [
            { id: 301, name: "Hakka Noodles", price: 220, description: "Stir-fried noodles with vegetables", image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=300&h=200&fit=crop", veg: true, bestseller: true },
            { id: 302, name: "Manchurian", price: 250, description: "Crispy balls in spicy sauce", image: "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=300&h=200&fit=crop", veg: true },
            { id: 303, name: "Spring Rolls", price: 180, description: "Crispy rolls with vegetable filling", image: "https://images.unsplash.com/photo-1548507200-e587eb8ba5c4?w=300&h=200&fit=crop", veg: true },
        ]
    },
    {
        id: 4,
        name: "Burger Barn",
        cuisine: "American",
        rating: 4.6,
        reviews: 423,
        deliveryTime: "15-25",
        deliveryFee: 25,
        minOrder: 150,
        image: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=600&h=400&fit=crop",
        featured: true,
        offers: ["Buy 1 Get 1 Free on Classic Burger"],
        menu: [
            { id: 401, name: "Classic Burger", price: 199, description: "Beef patty with fresh veggies", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&h=200&fit=crop", veg: false, bestseller: true },
            { id: 402, name: "Cheese Burger", price: 249, description: "Double cheese loaded burger", image: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=300&h=200&fit=crop", veg: false },
            { id: 403, name: "Veggie Burger", price: 179, description: "Crispy veggie patty with sauce", image: "https://images.unsplash.com/photo-1520072959219-c595dc870360?w=300&h=200&fit=crop", veg: true },
            { id: 404, name: "French Fries", price: 99, description: "Crispy golden fries", image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=300&h=200&fit=crop", veg: true, bestseller: true },
        ]
    },
    {
        id: 5,
        name: "Sweet Tooth",
        cuisine: "Desserts",
        rating: 4.8,
        reviews: 312,
        deliveryTime: "20-30",
        deliveryFee: 35,
        minOrder: 200,
        image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600&h=400&fit=crop",
        featured: false,
        offers: ["Free brownie on orders above ₹400"],
        menu: [
            { id: 501, name: "Chocolate Lava Cake", price: 249, description: "Warm cake with molten chocolate", image: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=300&h=200&fit=crop", veg: true, bestseller: true },
            { id: 502, name: "Ice Cream Sundae", price: 179, description: "Premium ice cream with toppings", image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=300&h=200&fit=crop", veg: true },
            { id: 503, name: "Cheesecake", price: 299, description: "New York style cheesecake", image: "https://images.unsplash.com/photo-1524351199678-941a58a3df50?w=300&h=200&fit=crop", veg: true, bestseller: true },
        ]
    },
    {
        id: 6,
        name: "Green Bowl",
        cuisine: "Healthy",
        rating: 4.4,
        reviews: 156,
        deliveryTime: "25-35",
        deliveryFee: 40,
        minOrder: 250,
        image: "https://images.unsplash.com/photo-1466220549276-aef9ce186540?w=600&h=400&fit=crop",
        featured: false,
        offers: [],
        menu: [
            { id: 601, name: "Buddha Bowl", price: 349, description: "Quinoa, veggies, and tahini", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&h=200&fit=crop", veg: true, bestseller: true },
            { id: 602, name: "Avocado Toast", price: 249, description: "Sourdough with fresh avocado", image: "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=300&h=200&fit=crop", veg: true },
            { id: 603, name: "Protein Smoothie", price: 199, description: "Banana, peanut butter, oats", image: "https://images.unsplash.com/photo-1502741224143-90386d7f8c82?w=300&h=200&fit=crop", veg: true },
        ]
    }
];

// Food Navigation Component
const FoodNavigation = ({ onSwitchApp }) => {
    const { getItemCount } = useFoodCart();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const itemCount = getItemCount();

    const navLinks = [
        { path: '/food', label: 'Home', icon: Home },
        { path: '/food/restaurants', label: 'Restaurants', icon: Utensils },
        { path: '/food/orders', label: 'My Orders', icon: Timer },
    ];

    return (
        <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-100 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/food" className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                            <Utensils className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                            DACHBites
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map(link => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`flex items-center gap-2 text-sm font-medium transition-colors ${location.pathname === link.path
                                        ? 'text-orange-600'
                                        : 'text-gray-600 hover:text-orange-600'
                                    }`}
                            >
                                <link.icon className="w-4 h-4" />
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4">
                        {/* Switch to E-commerce */}
                        <button
                            onClick={onSwitchApp}
                            className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm text-violet-600 bg-violet-50 rounded-full hover:bg-violet-100 transition-colors"
                        >
                            <ShoppingBag className="w-4 h-4" />
                            Shop
                        </button>

                        {/* Cart */}
                        <button
                            onClick={() => navigate('/food/cart')}
                            className="relative flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full font-medium hover:shadow-lg transition-all"
                        >
                            <ShoppingCart className="w-5 h-5" />
                            <span className="hidden sm:inline">Cart</span>
                            {itemCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-white text-orange-600 text-xs font-bold rounded-full flex items-center justify-center">
                                    {itemCount}
                                </span>
                            )}
                        </button>

                        {/* Mobile Menu */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden p-2 text-gray-600 hover:text-orange-600"
                        >
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden py-4 border-t border-gray-100">
                        {navLinks.map(link => (
                            <Link
                                key={link.path}
                                to={link.path}
                                onClick={() => setIsMenuOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg ${location.pathname === link.path
                                        ? 'bg-orange-50 text-orange-600'
                                        : 'text-gray-600'
                                    }`}
                            >
                                <link.icon className="w-5 h-5" />
                                {link.label}
                            </Link>
                        ))}
                        <button
                            onClick={() => { onSwitchApp(); setIsMenuOpen(false); }}
                            className="flex items-center gap-3 px-4 py-3 text-violet-600 w-full"
                        >
                            <ShoppingBag className="w-5 h-5" />
                            Switch to E-Commerce
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
};

// Food Home Page
const FoodHome = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();
    const featuredRestaurants = restaurants.filter(r => r.featured);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 py-16 lg:py-24 overflow-hidden">
                {/* Background decorations */}
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-10 left-10 w-40 h-40 bg-white rounded-full blur-3xl" />
                    <div className="absolute bottom-10 right-10 w-60 h-60 bg-yellow-300 rounded-full blur-3xl" />
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6">
                                <Sparkles className="w-4 h-4 text-yellow-300" />
                                <span className="text-white text-sm font-medium">Delivering happiness since 2024</span>
                            </div>
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
                                Delicious Food,
                                <span className="block text-yellow-300">Delivered Fast!</span>
                            </h1>
                            <p className="text-lg text-white/80 mb-8 max-w-lg mx-auto lg:mx-0">
                                Order from your favorite restaurants and get food delivered to your doorstep in minutes.
                            </p>

                            {/* Search Bar */}
                            <div className="relative max-w-md mx-auto lg:mx-0">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search for restaurants or cuisines..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && navigate(`/food/restaurants?search=${searchQuery}`)}
                                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white shadow-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-white/30"
                                />
                            </div>

                            {/* Quick Stats */}
                            <div className="flex items-center gap-8 mt-8 justify-center lg:justify-start">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-white">500+</p>
                                    <p className="text-white/70 text-sm">Restaurants</p>
                                </div>
                                <div className="w-px h-10 bg-white/30" />
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-white">~25m</p>
                                    <p className="text-white/70 text-sm">Avg Delivery</p>
                                </div>
                                <div className="w-px h-10 bg-white/30" />
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-white">4.8★</p>
                                    <p className="text-white/70 text-sm">Rating</p>
                                </div>
                            </div>
                        </div>

                        {/* Hero Image */}
                        <div className="hidden lg:block relative">
                            <div className="relative">
                                <img
                                    src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=500&fit=crop"
                                    alt="Delicious food"
                                    className="rounded-3xl shadow-2xl"
                                />
                                {/* Floating Cards */}
                                <div className="absolute -left-8 top-1/4 bg-white rounded-2xl p-4 shadow-xl animate-bounce">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                            <Bike className="w-6 h-6 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">Fast Delivery</p>
                                            <p className="text-sm text-gray-500">Within 30 mins</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute -right-4 bottom-1/4 bg-white rounded-2xl p-4 shadow-xl animate-bounce delay-500">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                                            <Star className="w-6 h-6 text-orange-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">Top Rated</p>
                                            <p className="text-sm text-gray-500">500+ Reviews</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Cuisines */}
            <section className="py-12 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">What are you craving?</h2>
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-4">
                        {cuisines.map(cuisine => (
                            <Link
                                key={cuisine.id}
                                to={`/food/restaurants?cuisine=${cuisine.name.toLowerCase()}`}
                                className="flex flex-col items-center p-4 rounded-2xl hover:bg-gray-50 transition-colors group"
                            >
                                <div className={`w-16 h-16 ${cuisine.color} rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg`}>
                                    <cuisine.icon className="w-8 h-8 text-white" />
                                </div>
                                <span className="text-sm font-medium text-gray-700">{cuisine.name}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Restaurants */}
            <section className="py-12 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Featured Restaurants</h2>
                            <p className="text-gray-600">Handpicked favorites just for you</p>
                        </div>
                        <Link
                            to="/food/restaurants"
                            className="flex items-center gap-2 text-orange-600 font-medium hover:text-orange-700"
                        >
                            View All
                            <ChevronRight className="w-5 h-5" />
                        </Link>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {featuredRestaurants.map(restaurant => (
                            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                        ))}
                    </div>
                </div>
            </section>

            {/* All Restaurants */}
            <section className="py-12 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8">All Restaurants</h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {restaurants.map(restaurant => (
                            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Promo Banner */}
            <section className="py-12 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-3xl p-8 lg:p-12 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                        <div className="relative flex flex-col lg:flex-row items-center justify-between gap-6">
                            <div className="text-center lg:text-left">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full mb-4">
                                    <Gift className="w-4 h-4 text-white" />
                                    <span className="text-white text-sm font-medium">Limited Time</span>
                                </div>
                                <h3 className="text-3xl font-bold text-white mb-2">First Order? Get 50% OFF!</h3>
                                <p className="text-white/80">Use code DACHFIRST at checkout</p>
                            </div>
                            <Link
                                to="/food/restaurants"
                                className="px-8 py-4 bg-white text-orange-600 rounded-2xl font-bold hover:bg-white/90 transition-colors shadow-lg"
                            >
                                Order Now
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-4 gap-8">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                                    <Utensils className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-xl font-bold text-white">DACHBites</span>
                            </div>
                            <p className="text-gray-400 text-sm">
                                Delivering delicious food from the best restaurants near you.
                            </p>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
                            <ul className="space-y-2">
                                <li><Link to="/food" className="text-gray-400 hover:text-white text-sm">Home</Link></li>
                                <li><Link to="/food/restaurants" className="text-gray-400 hover:text-white text-sm">Restaurants</Link></li>
                                <li><Link to="/food/orders" className="text-gray-400 hover:text-white text-sm">My Orders</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-4">Support</h4>
                            <ul className="space-y-2">
                                <li><a href="#" className="text-gray-400 hover:text-white text-sm">Help Center</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white text-sm">Contact Us</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white text-sm">FAQs</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-4">Contact</h4>
                            <ul className="space-y-2">
                                <li className="flex items-center gap-2 text-gray-400 text-sm">
                                    <Phone className="w-4 h-4" /> +91 1234567890
                                </li>
                                <li className="flex items-center gap-2 text-gray-400 text-sm">
                                    <Mail className="w-4 h-4" /> support@DACHbites.com
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm">
                        © 2024 DACHBites. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
};

// Restaurant Card Component
const RestaurantCard = ({ restaurant }) => {
    const navigate = useNavigate();

    return (
        <div
            onClick={() => navigate(`/food/restaurant/${restaurant.id}`)}
            className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group"
        >
            {/* Image */}
            <div className="relative h-48 overflow-hidden">
                <img
                    src={restaurant.image}
                    alt={restaurant.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                {restaurant.offers.length > 0 && (
                    <div className="absolute bottom-3 left-3 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                        <Percent className="w-3 h-3" />
                        {restaurant.offers[0].split(' ')[0]}
                    </div>
                )}
                <button className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors">
                    <Heart className="w-5 h-5 text-gray-400 hover:text-red-500" />
                </button>
            </div>

            {/* Content */}
            <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">{restaurant.name}</h3>
                        <p className="text-gray-500 text-sm">{restaurant.cuisine}</p>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 bg-green-500 text-white text-sm font-bold rounded-lg">
                        {restaurant.rating}
                        <Star className="w-3 h-3 fill-current" />
                    </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-500 mt-3">
                    <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {restaurant.deliveryTime} min
                    </span>
                    <span>•</span>
                    <span>₹{restaurant.deliveryFee} delivery</span>
                </div>
            </div>
        </div>
    );
};

// Restaurant Detail Page
const RestaurantDetail = () => {
    const { id } = useLocation().pathname.split('/').pop();
    const restaurantId = parseInt(useLocation().pathname.split('/').pop());
    const restaurant = restaurants.find(r => r.id === restaurantId);
    const { addToCart, cartItems, updateQuantity } = useFoodCart();
    const navigate = useNavigate();

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
                        <span>{restaurant.reviews} reviews</span>
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

            {/* Menu */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Menu</h2>

                <div className="space-y-4">
                    {restaurant.menu.map(item => {
                        const quantity = getItemQuantity(item.id);

                        return (
                            <div
                                key={item.id}
                                className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
                            >
                                {/* Image */}
                                <div className="relative w-28 h-28 flex-shrink-0 rounded-xl overflow-hidden">
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-full h-full object-cover"
                                    />
                                    {item.bestseller && (
                                        <span className="absolute top-1 left-1 bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                            Bestseller
                                        </span>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-grow">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`w-4 h-4 rounded border-2 flex items-center justify-center ${item.veg ? 'border-green-500' : 'border-red-500'}`}>
                                            <span className={`w-2 h-2 rounded-full ${item.veg ? 'bg-green-500' : 'bg-red-500'}`} />
                                        </span>
                                        <h3 className="font-semibold text-gray-900">{item.name}</h3>
                                    </div>
                                    <p className="text-gray-500 text-sm mb-2 line-clamp-2">{item.description}</p>
                                    <p className="font-bold text-gray-900">₹{item.price}</p>
                                </div>

                                {/* Add to Cart */}
                                <div className="flex-shrink-0">
                                    {quantity === 0 ? (
                                        <button
                                            onClick={() => addToCart(item, restaurant.id, restaurant.name)}
                                            className="px-6 py-2 bg-white border-2 border-orange-500 text-orange-500 font-bold rounded-xl hover:bg-orange-50 transition-colors"
                                        >
                                            ADD
                                        </button>
                                    ) : (
                                        <div className="flex items-center gap-2 bg-orange-500 rounded-xl">
                                            <button
                                                onClick={() => updateQuantity(item.id, quantity - 1)}
                                                className="p-2 text-white hover:bg-orange-600 rounded-l-xl"
                                            >
                                                <Minus className="w-5 h-5" />
                                            </button>
                                            <span className="text-white font-bold px-2">{quantity}</span>
                                            <button
                                                onClick={() => addToCart(item, restaurant.id, restaurant.name)}
                                                className="p-2 text-white hover:bg-orange-600 rounded-r-xl"
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
        </div>
    );
};

// Restaurants List Page
const RestaurantsList = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCuisine, setSelectedCuisine] = useState(null);
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const cuisine = params.get('cuisine');
        const search = params.get('search');
        if (cuisine) setSelectedCuisine(cuisine);
        if (search) setSearchQuery(search);
    }, [location.search]);

    const filteredRestaurants = restaurants.filter(r => {
        const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.cuisine.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCuisine = !selectedCuisine || r.cuisine.toLowerCase() === selectedCuisine.toLowerCase();
        return matchesSearch && matchesCuisine;
    });

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-100 sticky top-16 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center gap-4">
                        {/* Search */}
                        <div className="relative flex-grow">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search restaurants..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-100 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                        </div>

                        {/* Filter */}
                        <button className="flex items-center gap-2 px-4 py-3 bg-gray-100 rounded-xl text-gray-700 hover:bg-gray-200">
                            <Filter className="w-5 h-5" />
                            <span className="hidden sm:inline">Filters</span>
                        </button>
                    </div>

                    {/* Cuisine Pills */}
                    <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                        <button
                            onClick={() => setSelectedCuisine(null)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${!selectedCuisine
                                    ? 'bg-orange-500 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            All
                        </button>
                        {cuisines.map(cuisine => (
                            <button
                                key={cuisine.id}
                                onClick={() => setSelectedCuisine(cuisine.name.toLowerCase())}
                                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCuisine === cuisine.name.toLowerCase()
                                        ? 'bg-orange-500 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {cuisine.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Results */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <p className="text-gray-600 mb-6">{filteredRestaurants.length} restaurants found</p>

                {filteredRestaurants.length > 0 ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredRestaurants.map(restaurant => (
                            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <Utensils className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No restaurants found</h3>
                        <p className="text-gray-500">Try adjusting your search or filters</p>
                    </div>
                )}
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
                        onClick={() => {
                            alert('Order placed successfully! (Demo)');
                            clearCart();
                            navigate('/food');
                        }}
                        className="w-full mt-6 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl hover:shadow-lg transition-all"
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
    const [orders] = useState([
        {
            id: 'ZB123456',
            restaurant: 'Pizza Paradise',
            items: ['Margherita Pizza', 'Garlic Bread'],
            total: 448,
            status: 'delivered',
            date: '2024-01-25'
        },
        {
            id: 'ZB123455',
            restaurant: 'Spice Garden',
            items: ['Butter Chicken', 'Naan Basket'],
            total: 440,
            status: 'delivered',
            date: '2024-01-23'
        }
    ]);

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
                                        <h3 className="font-bold text-gray-900">{order.restaurant}</h3>
                                        <p className="text-sm text-gray-500">Order #{order.id}</p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${order.status === 'delivered'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-orange-100 text-orange-700'
                                        }`}>
                                        {order.status === 'delivered' ? 'Delivered' : 'In Progress'}
                                    </span>
                                </div>
                                <p className="text-gray-600 text-sm mb-3">{order.items.join(', ')}</p>
                                <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                                    <span className="text-gray-500 text-sm">{order.date}</span>
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
                    <Route path="/restaurants" element={<RestaurantsList />} />
                    <Route path="/restaurant/:id" element={<RestaurantDetail />} />
                    <Route path="/cart" element={<FoodCart />} />
                    <Route path="/orders" element={<FoodOrders />} />
                </Routes>
            </div>
        </FoodCartProvider>
    );
};

export default FoodApp;
