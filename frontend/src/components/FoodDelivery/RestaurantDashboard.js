import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from "../../App";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
    Utensils, Plus, Edit, Trash2, LogOut, Menu as MenuIcon, X, Home,
    ShoppingBag, Clock, DollarSign, TrendingUp, Star, Package, Bell,
    Settings, ChevronRight, Search, Filter, MoreVertical, Eye, EyeOff,
    MapPin, Phone, Mail, Image as ImageIcon, CheckCircle, XCircle,
    AlertCircle, Users, BarChart3, Calendar, ArrowUpRight, ArrowDownRight,
    RefreshCw, Percent, Timer, ChefHat, UtensilsCrossed, FileText, Store,
    Receipt, ShieldCheck, ClipboardList, BellRing, Tag, Layers,
    Pizza, Sandwich, Soup, IceCream, Salad, Coffee, Beef, Cake
} from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
const API = `${BACKEND_URL}/api`;

// Food Categories for menu items
const FOOD_CATEGORIES = [
    { value: "biryani-rice", label: "Biryani & Rice" },
    { value: "pizza-italian", label: "Pizza & Italian" },
    { value: "burgers-fast-food", label: "Burgers & Fast Food" },
    { value: "chinese-asian", label: "Chinese & Asian" },
    { value: "north-indian", label: "North Indian" },
    { value: "south-indian", label: "South Indian" },
    { value: "desserts-sweets", label: "Desserts & Sweets" },
    { value: "beverages", label: "Beverages" },
    { value: "street-food", label: "Street Food" },
    { value: "healthy-salads", label: "Healthy & Salads" }
];

// Helper function to get icon for category
const getCategoryIcon = (categoryValue) => {
    const iconMap = {
        'biryani-rice': ChefHat,
        'pizza-italian': Pizza,
        'burgers-fast-food': Sandwich,
        'chinese-asian': Soup,
        'north-indian': ChefHat,
        'south-indian': Soup,
        'desserts-sweets': Cake,
        'beverages': Coffee,
        'street-food': Utensils,
        'healthy-salads': Salad
    };
    return iconMap[categoryValue] || Utensils;
};

// Helper function to format category for display
const formatCategory = (categoryValue) => {
    const category = FOOD_CATEGORIES.find(c => c.value === categoryValue);
    if (category) {
        return category.label;
    }
    // Fallback: convert hyphenated string to Title Case
    return categoryValue
        ?.split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ') || categoryValue;
};

const RestaurantDashboard = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState("dashboard");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    // Restaurant Data
    const [restaurant, setRestaurant] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [orders, setOrders] = useState([]);
    const [stats, setStats] = useState({
        totalOrders: 0,
        pendingOrders: 0,
        totalRevenue: 0,
        avgRating: 0,
        todayOrders: 0,
        menuItemsCount: 0
    });

    // Form States
    const [showAddMenu, setShowAddMenu] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [menuForm, setMenuForm] = useState({
        name: "",
        description: "",
        price: "",
        category: "",
        image: "",
        is_veg: true,
        is_available: true,
        prep_time: "15-20",
        spice_level: "medium"
    });

    // Restaurant Profile Form State
    const [restaurantForm, setRestaurantForm] = useState({
        name: "",
        phone: "",
        address: "",
        cuisine_type: "",
        opening_time: "",
        closing_time: "",
        image: ""
    });

    // Check authentication
    useEffect(() => {
        if (!user) {
            navigate('/food/vendor/login');
            return;
        }
        if (user.user_type !== 'restaurant' && user.user_type !== 'food_vendor') {
            navigate('/');
            return;
        }
        fetchData();
    }, [user, navigate]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            // Fetch restaurant details
            const restaurantRes = await fetch(`${API}/food/restuarent/profile`, { headers });
            if (restaurantRes.ok) {
                const data = await restaurantRes.json();
                setRestaurant(data);
                // Initialize form
                setRestaurantForm({
                    name: data.name || "",
                    phone: data.phone || "",
                    address: data.address || "",
                    cuisine_type: data.cuisine_type || "",
                    opening_time: data.opening_time || "",
                    closing_time: data.closing_time || "",
                    image: data.image || ""
                });
            }

            // Fetch menu items
            const menuRes = await fetch(`${API}/food/restuarent/menu`, { headers });
            if (menuRes.ok) {
                const data = await menuRes.json();
                setMenuItems(data);
            }

            // Fetch orders
            const ordersRes = await fetch(`${API}/food/restuarent/orders`, { headers });
            if (ordersRes.ok) {
                const data = await ordersRes.json();
                setOrders(data);
            }

            // Fetch stats
            const statsRes = await fetch(`${API}/food/restuarent/stats`, { headers });
            if (statsRes.ok) {
                const data = await statsRes.json();
                setStats(data);
            }
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleAddMenuItem = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API}/food/restuarent/menu`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...menuForm,
                    price: parseFloat(menuForm.price)
                })
            });

            if (response.ok) {
                // Refresh menu items from server
                await fetchData();
                setShowAddMenu(false);
                resetMenuForm();
            }
        } catch (error) {
            console.error("Failed to add menu item:", error);
        }
    };

    const handleUpdateMenuItem = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API}/food/restuarent/menu/${editingItem.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...menuForm,
                    price: parseFloat(menuForm.price)
                })
            });

            if (response.ok) {
                // Refresh menu items from server
                await fetchData();
                setEditingItem(null);
                setShowAddMenu(false);
                resetMenuForm();
            }
        } catch (error) {
            console.error("Failed to update menu item:", error);
        }
    };

    const handleDeleteMenuItem = async (itemId) => {
        if (!window.confirm("Are you sure you want to delete this item?")) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API}/food/restuarent/menu/${itemId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.ok) {
                // Refresh menu items from server
                await fetchData();
            }
        } catch (error) {
            console.error("Failed to delete menu item:", error);
        }
    };

    const handleToggleAvailability = async (itemId, currentStatus) => {
        try {
            const token = localStorage.getItem('token');
            await fetch(`${API}/food/restuarent/menu/${itemId}/availability`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ is_available: !currentStatus })
            });

            // Refresh menu items from server
            await fetchData();
        } catch (error) {
            console.error("Failed to toggle availability:", error);
        }
    };

    const handleSaveProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API}/food/restuarent/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(restaurantForm)
            });

            if (response.ok) {
                const data = await response.json();
                alert(data.message || "Profile updated successfully!");
                // Refresh the restaurant data from the server
                await fetchData();
            } else {
                alert("Failed to update profile");
            }
        } catch (error) {
            console.error("Failed to update profile:", error);
            alert("Error updating profile");
        }
    };

    const handleUpdateOrderStatus = async (orderId, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            await fetch(`${API}/food/restuarent/orders/${orderId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            setOrders(orders.map(order =>
                order.id === orderId ? { ...order, status: newStatus } : order
            ));
        } catch (error) {
            console.error("Failed to update order status:", error);
        }
    };

    const resetMenuForm = () => {
        setMenuForm({
            name: "",
            description: "",
            price: "",
            category: "",
            image: "",
            is_veg: true,
            is_available: true,
            prep_time: "15-20",
            spice_level: "medium"
        });
    };

    const startEditItem = (item) => {
        setEditingItem(item);
        setMenuForm({
            name: item.name,
            description: item.description || "",
            price: item.price.toString(),
            category: item.category,
            image: item.image || "",
            is_veg: item.is_veg,
            is_available: item.is_available,
            prep_time: item.prep_time || "15-20",
            spice_level: item.spice_level || "medium"
        });
    };

    const menuTabs = [
        { id: "dashboard", label: "Dashboard", icon: Home },
        { id: "menu", label: "Menu Management", icon: UtensilsCrossed },
        { id: "orders", label: "Orders", icon: ShoppingBag },
        { id: "payments", label: "Payments", icon: DollarSign },
        { id: "reports", label: "Reports", icon: BarChart3 },
        { id: "offers", label: "Offers & Promotions", icon: Percent },
        { id: "inventory", label: "Inventory", icon: Package },
        { id: "profile", label: "Store Profile", icon: Store },
        { id: "documents", label: "Documents", icon: FileText },
        { id: "notifications", label: "Notifications", icon: Bell },
        { id: "settings", label: "Settings", icon: Settings }
    ];

    // Dashboard View
    const DashboardView = () => {
        // Group menu items by category
        const itemsByCategory = FOOD_CATEGORIES.reduce((acc, category) => {
            acc[category.value] = menuItems.filter(item => item.category === category.value);
            return acc;
        }, {});

        // Get categories that have items
        const categoriesWithItems = FOOD_CATEGORIES.filter(cat =>
            itemsByCategory[cat.value]?.length > 0
        );

        return (
            <div className="space-y-6">
                {/* Welcome Banner */}
                <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl p-6 text-white">
                    <h2 className="text-2xl font-bold mb-2">Welcome back, {user?.owner_name || user?.name}! 👋</h2>
                    <p className="text-orange-100">Here's how your restaurant is performing today.</p>
                </div>

                {/* What's on your mind - Menu Items by Category */}
                {categoriesWithItems.length > 0 ? (
                    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-900">What's on your mind?</h3>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setActiveTab("menu")}
                                className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                            >
                                View All <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        </div>

                        {/* Quick Add Categories */}
                        <div className="grid grid-cols-5 md:grid-cols-10 gap-2 mb-6">
                            {FOOD_CATEGORIES.map((category) => {
                                const IconComponent = getCategoryIcon(category.value);
                                const count = itemsByCategory[category.value]?.length || 0;
                                return (
                                    <button
                                        key={category.value}
                                        onClick={() => {
                                            setMenuForm({ ...menuForm, category: category.value });
                                            setShowAddMenu(true);
                                        }}
                                        className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-orange-50 transition-all group"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center group-hover:from-orange-200 group-hover:to-red-200 transition-all">
                                            <IconComponent className="w-5 h-5 text-orange-600" />
                                        </div>
                                        <span className="text-xs font-medium text-gray-600 group-hover:text-orange-600 transition-colors text-center line-clamp-2">
                                            {category.label.split(' & ')[0]}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Menu Items by Category */}
                        <div className="space-y-6">
                            {categoriesWithItems.slice(0, 4).map(category => {
                                const items = itemsByCategory[category.value];
                                const IconComponent = getCategoryIcon(category.value);
                                return (
                                    <div key={category.value} className="border-t border-gray-100 pt-4">
                                        <div className="flex items-center gap-2 mb-3">
                                            <IconComponent className="w-5 h-5 text-orange-600" />
                                            <h4 className="font-bold text-gray-900">{category.label}</h4>
                                            <Badge variant="secondary">{items.length} items</Badge>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            {items.slice(0, 4).map(item => (
                                                <div
                                                    key={item.id}
                                                    className="bg-gray-50 rounded-xl p-3 hover:bg-orange-50 transition-colors cursor-pointer"
                                                    onClick={() => startEditItem(item)}
                                                >
                                                    <div className="flex items-start justify-between mb-2">
                                                        <Badge className={item.is_veg ? 'bg-green-500 text-white text-xs' : 'bg-red-500 text-white text-xs'}>
                                                            {item.is_veg ? '🌱 Veg' : '🍖'}
                                                        </Badge>
                                                        <span className="font-bold text-orange-600">₹{item.price}</span>
                                                    </div>
                                                    <h5 className="font-medium text-gray-900 text-sm line-clamp-1">{item.name}</h5>
                                                </div>
                                            ))}
                                            {/* Add New Item Button */}
                                            <button
                                                onClick={() => {
                                                    setMenuForm({ ...menuForm, category: category.value });
                                                    setShowAddMenu(true);
                                                }}
                                                className="bg-gray-50 rounded-xl p-3 hover:bg-orange-50 hover:border-2 hover:border-orange-200 transition-all flex flex-col items-center justify-center gap-1 border-2 border-dashed border-gray-200"
                                            >
                                                <Plus className="w-5 h-5 text-gray-400" />
                                                <span className="text-xs font-medium text-gray-500">Add</span>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {categoriesWithItems.length > 4 && (
                            <Button
                                variant="ghost"
                                className="w-full text-orange-600"
                                onClick={() => setActiveTab("menu")}
                            >
                                View More Categories <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        )}
                    </div>
                ) : (
                    /* No menu items yet */
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-center">
                        <Utensils className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Add your first dish</h3>
                        <p className="text-gray-500 mb-4">Start by adding items to your menu</p>
                        <Button
                            onClick={() => setShowAddMenu(true)}
                            className="bg-gradient-to-r from-orange-600 to-red-600 text-white"
                        >
                            <Plus className="w-4 h-4 mr-2" /> Add Item
                        </Button>
                    </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="border-0 shadow-lg">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Today's Orders</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.todayOrders}</p>
                                </div>
                                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                                    <ShoppingBag className="w-6 h-6 text-orange-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Pending</p>
                                    <p className="text-2xl font-bold text-amber-600">{stats.pendingOrders}</p>
                                </div>
                                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                                    <Clock className="w-6 h-6 text-amber-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Revenue</p>
                                    <p className="text-2xl font-bold text-green-600">₹{stats.totalRevenue.toLocaleString()}</p>
                                </div>
                                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                    <DollarSign className="w-6 h-6 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Rating</p>
                                    <p className="text-2xl font-bold text-yellow-600">{stats.avgRating.toFixed(1)}</p>
                                </div>
                                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                                    <Star className="w-6 h-6 text-yellow-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Orders */}
                <Card className="border-0 shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg font-bold">Recent Orders</CardTitle>
                        <Button variant="ghost" size="sm" onClick={() => setActiveTab("orders")}>
                            View All <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {orders.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                <p>No orders yet</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {orders.slice(0, 5).map(order => (
                                    <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                        <div>
                                            <p className="font-medium">#{order.id.slice(-6).toUpperCase()}</p>
                                            <p className="text-sm text-gray-500">{order.items_count} items</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold">₹{order.total}</p>
                                            <Badge variant={order.status === 'pending' ? 'warning' : order.status === 'completed' ? 'success' : 'default'}>
                                                {order.status}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Menu Management View
    const MenuView = () => {
        // Filter items by selected category
        const filteredItems = selectedCategory === "all"
            ? menuItems
            : menuItems.filter(item => item.category === selectedCategory);

        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">Menu Items</h2>
                    <Button
                        onClick={() => {
                            setMenuForm({ ...menuForm, category: "" });
                            setShowAddMenu(true);
                        }}
                        className="bg-gradient-to-r from-orange-600 to-red-600 text-white"
                    >
                        <Plus className="w-4 h-4 mr-2" /> Add Item
                    </Button>
                </div>

                {/* Category Filter */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    <button
                        onClick={() => setSelectedCategory("all")}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === "all"
                            ? "bg-orange-600 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                    >
                        All ({menuItems.length})
                    </button>
                    {FOOD_CATEGORIES.map(category => {
                        const count = menuItems.filter(item => item.category === category.value).length;
                        if (count === 0) return null;
                        const IconComponent = getCategoryIcon(category.value);
                        return (
                            <button
                                key={category.value}
                                onClick={() => setSelectedCategory(category.value)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === category.value
                                    ? "bg-orange-600 text-white"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                    }`}
                            >
                                <IconComponent className="w-4 h-4" />
                                {category.label.split(' & ')[0]} ({count})
                            </button>
                        );
                    })}
                </div>

                {/* Menu Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredItems.map(item => (
                        <Card key={item.id} className={`border-0 shadow-lg overflow-hidden ${!item.is_available ? 'opacity-60' : ''}`}>
                            <div className="relative h-40 bg-gradient-to-br from-orange-100 to-red-100">
                                {item.image ? (
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Utensils className="w-12 h-12 text-orange-300" />
                                    </div>
                                )}
                                <div className="absolute top-2 left-2">
                                    <Badge className={item.is_veg ? 'bg-green-500' : 'bg-red-500'}>
                                        {item.is_veg ? '🌱 Veg' : '🍖 Non-Veg'}
                                    </Badge>
                                </div>
                                <div className="absolute top-2 right-2 flex gap-1">
                                    <button
                                        onClick={() => startEditItem(item)}
                                        className="w-8 h-8 bg-white/90 rounded-lg flex items-center justify-center hover:bg-white"
                                    >
                                        <Edit className="w-4 h-4 text-gray-600" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteMenuItem(item.id)}
                                        className="w-8 h-8 bg-white/90 rounded-lg flex items-center justify-center hover:bg-white"
                                    >
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                    </button>
                                </div>
                            </div>
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <h3 className="font-bold text-gray-900">{item.name}</h3>
                                    <p className="font-bold text-orange-600">₹{item.price}</p>
                                </div>
                                <p className="text-sm text-gray-500 mb-3 line-clamp-2">{item.description}</p>
                                <div className="flex items-center justify-between">
                                    <Badge variant="outline">{formatCategory(item.category)}</Badge>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-500">Available</span>
                                        <Switch
                                            checked={item.is_available}
                                            onCheckedChange={() => handleToggleAvailability(item.id, item.is_available)}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {filteredItems.length === 0 && (
                    <div className="text-center py-12">
                        <Utensils className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {selectedCategory === "all" ? "No menu items yet" : `No items in ${formatCategory(selectedCategory)}`}
                        </h3>
                        <p className="text-gray-500 mb-4">
                            {selectedCategory === "all" ? "Start by adding your first dish" : `Add your first ${formatCategory(selectedCategory)} item`}
                        </p>
                        <Button onClick={() => setShowAddMenu(true)} className="bg-orange-600">
                            <Plus className="w-4 h-4 mr-2" /> Add Item
                        </Button>
                    </div>
                )}
            </div>
        );
    };

    // Orders View
    const OrdersView = () => (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Orders</h2>

            {orders.length === 0 ? (
                <div className="text-center py-12">
                    <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No orders yet</h3>
                    <p className="text-gray-500">Orders will appear here when customers start ordering</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map(order => (
                        <Card key={order.id} className="border-0 shadow-lg">
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-lg">Order #{order.id.slice(-6).toUpperCase()}</h3>
                                            <Badge variant={
                                                order.status === 'pending' ? 'warning' :
                                                    order.status === 'preparing' ? 'info' :
                                                        order.status === 'ready' ? 'success' :
                                                            order.status === 'delivered' ? 'default' : 'destructive'
                                            }>
                                                {order.status}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-gray-500">{order.customer_name} • {order.created_at}</p>
                                    </div>
                                    <p className="text-xl font-bold text-orange-600">₹{order.total}</p>
                                </div>

                                <div className="bg-gray-50 rounded-xl p-3 mb-4">
                                    {order.items?.map((item, idx) => (
                                        <div key={idx} className="flex justify-between text-sm py-1">
                                            <span>{item.quantity}x {item.name}</span>
                                            <span>₹{item.price * item.quantity}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-2">
                                    {order.status === 'pending' && (
                                        <Button
                                            onClick={() => handleUpdateOrderStatus(order.id, 'preparing')}
                                            className="bg-blue-600"
                                        >
                                            Start Preparing
                                        </Button>
                                    )}
                                    {order.status === 'preparing' && (
                                        <Button
                                            onClick={() => handleUpdateOrderStatus(order.id, 'ready')}
                                            className="bg-green-600"
                                        >
                                            Mark Ready
                                        </Button>
                                    )}
                                    {order.status === 'ready' && (
                                        <Button
                                            onClick={() => handleUpdateOrderStatus(order.id, 'delivered')}
                                            className="bg-purple-600"
                                        >
                                            Mark Delivered
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );

    // Payments View
    const PaymentsView = () => (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Payments</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-0 shadow-lg p-6">
                    <h3 className="text-gray-500 font-medium mb-2">Earnings</h3>
                    <p className="text-3xl font-bold text-gray-900">₹{stats.totalRevenue.toLocaleString()}</p>
                    <p className="text-sm text-gray-400 mt-2">Total revenue from all orders</p>
                </Card>
                <Card className="border-0 shadow-lg p-6">
                    <h3 className="text-gray-500 font-medium mb-2">Completed Orders</h3>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
                    <p className="text-sm text-gray-500 mt-2">All time completed orders</p>
                </Card>
                <Card className="border-0 shadow-lg p-6">
                    <h3 className="text-gray-500 font-medium mb-2">Payout Requests</h3>
                    <Button className="w-full mt-4 bg-orange-600 hover:bg-orange-700">Request Payout</Button>
                </Card>
            </div>

            <Card className="border-0 shadow-lg">
                <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-gray-500">No transactions yet</div>
                </CardContent>
            </Card>
        </div>
    );

    // Reports View
    const ReportsView = () => (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Reports</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2 hover:border-orange-500 hover:text-orange-600">
                    <BarChart3 className="w-8 h-8" />
                    <span>Sales Report</span>
                </Button>
                <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2 hover:border-orange-500 hover:text-orange-600">
                    <TrendingUp className="w-8 h-8" />
                    <span>Item Performance</span>
                </Button>
                <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2 hover:border-orange-500 hover:text-orange-600">
                    <Clock className="w-8 h-8" />
                    <span>Order History</span>
                </Button>
            </div>
            <Card className="border-0 shadow-lg">
                <CardContent className="p-8 text-center">
                    <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="font-semibold text-gray-600 mb-1">No Report Data Yet</h3>
                    <p className="text-sm text-gray-400">Sales charts and analytics will appear here once you receive orders.</p>
                </CardContent>
            </Card>
        </div>
    );

    // Offers View
    const OffersView = () => (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Offers & Promotions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-0 shadow-lg">
                    <CardHeader><CardTitle>Active Discounts</CardTitle></CardHeader>
                    <CardContent>
                        <div className="text-center py-6">
                            <Percent className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                            <p className="text-gray-500 text-sm mb-4">No active discounts yet.</p>
                        </div>
                        <Button className="w-full" variant="outline"><Plus className="w-4 h-4 mr-2" /> Create Discount</Button>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-lg">
                    <CardHeader><CardTitle>Coupon Codes</CardTitle></CardHeader>
                    <CardContent>
                        <p className="text-gray-500 text-sm mb-4">No active custom coupons.</p>
                        <Button className="w-full" variant="outline"><Plus className="w-4 h-4 mr-2" /> Create Coupon</Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );

    // Inventory View
    const InventoryView = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Inventory</h2>
                <Badge variant="outline" className="text-orange-600 border-orange-200">Optional Feature</Badge>
            </div>
            <Card className="border-0 shadow-lg">
                <CardHeader><CardTitle>Stock List</CardTitle></CardHeader>
                <CardContent>
                    <div className="text-center py-10">
                        <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="font-semibold text-gray-600 mb-1">No Inventory Items</h3>
                        <p className="text-sm text-gray-400">Track your ingredients and packaging here.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    // Profile View (Previously Settings)
    const ProfileView = () => (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Store Profile</h2>
            <Card className="border-0 shadow-lg">
                <CardHeader>
                    <CardTitle>Store Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Restaurant Name</Label>
                            <Input
                                value={restaurantForm.name}
                                onChange={(e) => setRestaurantForm({ ...restaurantForm, name: e.target.value })}
                                placeholder="Restaurant Name"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Contact Phone</Label>
                            <Input
                                value={restaurantForm.phone}
                                onChange={(e) => setRestaurantForm({ ...restaurantForm, phone: e.target.value })}
                                placeholder="Phone Number"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Address</Label>
                        <Input
                            value={restaurantForm.address}
                            onChange={(e) => setRestaurantForm({ ...restaurantForm, address: e.target.value })}
                            placeholder="Full Address"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Cuisine Types</Label>
                        <Input
                            value={restaurantForm.cuisine_type}
                            onChange={(e) => setRestaurantForm({ ...restaurantForm, cuisine_type: e.target.value })}
                            placeholder="e.g. Indian, Chinese"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Operating Hours</Label>
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                placeholder="Open (e.g. 09:00)"
                                value={restaurantForm.opening_time}
                                onChange={(e) => setRestaurantForm({ ...restaurantForm, opening_time: e.target.value })}
                            />
                            <Input
                                placeholder="Close (e.g. 22:00)"
                                value={restaurantForm.closing_time}
                                onChange={(e) => setRestaurantForm({ ...restaurantForm, closing_time: e.target.value })}
                            />
                        </div>
                    </div>
                    <Button onClick={handleSaveProfile} className="bg-orange-600">Save Profile</Button>
                </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
                <CardHeader>
                    <CardTitle>Store Images</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Restaurant Banner/Main Image URL</Label>
                        <div className="flex gap-2">
                            <Input
                                value={restaurantForm.image}
                                onChange={(e) => setRestaurantForm({ ...restaurantForm, image: e.target.value })}
                                placeholder="https://images.unsplash.com/..."
                            />
                        </div>
                    </div>

                    {restaurantForm.image && (
                        <div className="relative h-48 rounded-xl overflow-hidden group">
                            <img
                                src={restaurantForm.image}
                                alt="Preview"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.src = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80";
                                }}
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <p className="text-white font-medium">Image Preview</p>
                            </div>
                        </div>
                    )}

                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-orange-400 transition-colors">
                        <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Enter a URL above to update your store image</p>
                    </div>

                    <Button onClick={handleSaveProfile} variant="outline" className="w-full">Update Store Images</Button>
                </CardContent>
            </Card>
        </div>
    );

    // Documents View
    const DocumentsView = () => (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Documents</h2>
            <div className="grid grid-cols-1 gap-4">
                <Card className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <ShieldCheck className={`w-8 h-8 ${restaurant?.fssai_license ? 'text-green-600' : 'text-gray-400'}`} />
                        <div>
                            <p className="font-medium">FSSAI License</p>
                            <p className="text-sm text-gray-500">{restaurant?.fssai_license || 'Not uploaded'}</p>
                        </div>
                    </div>
                    {restaurant?.fssai_license && <Button variant="ghost" size="sm">View</Button>}
                </Card>
                <Card className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <FileText className={`w-8 h-8 ${restaurant?.gst_number ? 'text-blue-600' : 'text-gray-400'}`} />
                        <div>
                            <p className="font-medium">GST Certificate</p>
                            <p className="text-sm text-gray-500">{restaurant?.gst_number || 'Not uploaded'}</p>
                        </div>
                    </div>
                    {restaurant?.gst_number && <Button variant="ghost" size="sm">View</Button>}
                </Card>
                <Card className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Receipt className={`w-8 h-8 ${restaurant?.bank_details?.account_number ? 'text-purple-600' : 'text-gray-400'}`} />
                        <div>
                            <p className="font-medium">Bank Details</p>
                            <p className="text-sm text-gray-500">
                                {restaurant?.bank_details?.account_number
                                    ? `Account ending ****${restaurant.bank_details.account_number.slice(-4)}`
                                    : 'Not linked'}
                            </p>
                        </div>
                    </div>
                    <Button variant="ghost" size="sm">Update</Button>
                </Card>
            </div>
        </div>
    );

    // Notifications View
    const NotificationsView = () => (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
            <Card className="border-0 shadow-lg">
                <CardContent className="p-8 text-center">
                    <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="font-semibold text-gray-600 mb-1">No Notifications</h3>
                    <p className="text-sm text-gray-400">You're all caught up! New order alerts and updates will appear here.</p>
                </CardContent>
            </Card>
        </div>
    );

    // Settings View (Updated)
    const SettingsView = () => (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
            <Card className="border-0 shadow-lg">
                <CardHeader><CardTitle>Security</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Current Password</Label>
                        <Input type="password" />
                    </div>
                    <div className="space-y-2">
                        <Label>New Password</Label>
                        <Input type="password" />
                    </div>
                    <Button variant="outline">Update Password</Button>
                </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
                <CardHeader><CardTitle>Notification Preferences</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label>Email Alerts for New Orders</Label>
                        <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                        <Label>SMS Alerts for New Orders</Label>
                        <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                        <Label>Daily Revenue Report</Label>
                        <Switch defaultChecked />
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    // Add/Edit Menu Modal
    // Add/Edit Menu Modal
    const renderMenuFormModal = () => (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <CardHeader className="flex flex-row items-center justify-between sticky top-0 bg-white z-10">
                    <CardTitle>{editingItem ? 'Edit Menu Item' : 'Add Menu Item'}</CardTitle>
                    <button
                        onClick={() => { setShowAddMenu(false); setEditingItem(null); resetMenuForm(); }}
                        className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </CardHeader>
                <CardContent>
                    <form onSubmit={editingItem ? handleUpdateMenuItem : handleAddMenuItem} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Item Name *</Label>
                            <Input
                                value={menuForm.name}
                                onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })}
                                placeholder="e.g., Butter Chicken"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                                value={menuForm.description}
                                onChange={(e) => setMenuForm({ ...menuForm, description: e.target.value })}
                                placeholder="Describe your dish..."
                                rows={3}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Price (₹) *</Label>
                                <Input
                                    type="number"
                                    value={menuForm.price}
                                    onChange={(e) => setMenuForm({ ...menuForm, price: e.target.value })}
                                    placeholder="199"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Category *</Label>
                                <select
                                    value={menuForm.category}
                                    onChange={(e) => setMenuForm({ ...menuForm, category: e.target.value })}
                                    className="w-full h-10 px-3 rounded-md border border-gray-200"
                                    required
                                >
                                    <option value="">Select Category</option>
                                    {FOOD_CATEGORIES.map(cat => (
                                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Image URL</Label>
                            <Input
                                value={menuForm.image}
                                onChange={(e) => setMenuForm({ ...menuForm, image: e.target.value })}
                                placeholder="https://..."
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Prep Time</Label>
                                <select
                                    value={menuForm.prep_time}
                                    onChange={(e) => setMenuForm({ ...menuForm, prep_time: e.target.value })}
                                    className="w-full h-10 px-3 rounded-md border border-gray-200"
                                >
                                    <option value="10-15">10-15 mins</option>
                                    <option value="15-20">15-20 mins</option>
                                    <option value="20-30">20-30 mins</option>
                                    <option value="30-45">30-45 mins</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label>Spice Level</Label>
                                <select
                                    value={menuForm.spice_level}
                                    onChange={(e) => setMenuForm({ ...menuForm, spice_level: e.target.value })}
                                    className="w-full h-10 px-3 rounded-md border border-gray-200"
                                >
                                    <option value="mild">Mild</option>
                                    <option value="medium">Medium</option>
                                    <option value="spicy">Spicy</option>
                                    <option value="extra_spicy">Extra Spicy</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <Switch
                                    checked={menuForm.is_veg}
                                    onCheckedChange={(checked) => setMenuForm({ ...menuForm, is_veg: checked })}
                                />
                                <Label>Vegetarian</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch
                                    checked={menuForm.is_available}
                                    onCheckedChange={(checked) => setMenuForm({ ...menuForm, is_available: checked })}
                                />
                                <Label>Available</Label>
                            </div>
                        </div>

                        <Button type="submit" className="w-full bg-gradient-to-r from-orange-600 to-red-600">
                            {editingItem ? 'Update Item' : 'Add Item'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your restaurant...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed top-0 left-0 h-full w-64 bg-white shadow-xl z-50 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
                <div className="p-6 border-b">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                            <Utensils className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="font-bold text-gray-900">Food Partner</h1>
                            <p className="text-xs text-gray-500">Restaurant Dashboard</p>
                        </div>
                    </div>
                </div>

                <nav className="p-4 space-y-1">
                    {menuTabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === tab.id
                                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                                : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            <tab.icon className="w-5 h-5" />
                            <span className="font-medium">{tab.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="md:ml-64">
                {/* Top Bar */}
                <header className="sticky top-0 bg-white shadow-sm z-30 px-4 md:px-6 py-4">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100"
                        >
                            <MenuIcon className="w-6 h-6" />
                        </button>

                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <Bell className="w-6 h-6 text-gray-400" />
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                                    {stats.pendingOrders}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-9 h-9 bg-orange-100 rounded-full flex items-center justify-center">
                                    <ChefHat className="w-5 h-5 text-orange-600" />
                                </div>
                                <span className="hidden md:block text-sm font-medium text-gray-700">
                                    {user?.restaurant_name || user?.name}
                                </span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <div className="p-4 md:p-6">
                    {activeTab === "dashboard" && <DashboardView />}
                    {activeTab === "menu" && <MenuView />}
                    {activeTab === "orders" && <OrdersView />}
                    {activeTab === "payments" && <PaymentsView />}
                    {activeTab === "reports" && <ReportsView />}
                    {activeTab === "offers" && <OffersView />}
                    {activeTab === "inventory" && <InventoryView />}
                    {activeTab === "profile" && <ProfileView />}
                    {activeTab === "documents" && <DocumentsView />}
                    {activeTab === "notifications" && <NotificationsView />}
                    {activeTab === "settings" && <SettingsView />}
                </div>
            </main>

            {/* Modals */}
            {(showAddMenu || editingItem) && renderMenuFormModal()}
        </div>
    );
}

export default RestaurantDashboard;
