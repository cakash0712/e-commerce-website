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
    Receipt, ShieldCheck, ClipboardList, BellRing, Tag, Layers
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

const FoodVendor = () => {
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
        if (user.user_type !== 'food_vendor') {
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
            const restaurantRes = await fetch(`${API}/food/vendor/restaurant`, { headers });
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
            const menuRes = await fetch(`${API}/food/vendor/menu`, { headers });
            if (menuRes.ok) {
                const data = await menuRes.json();
                setMenuItems(data);
            }

            // Fetch orders
            const ordersRes = await fetch(`${API}/food/vendor/orders`, { headers });
            if (ordersRes.ok) {
                const data = await ordersRes.json();
                setOrders(data);
            }

            // Fetch stats
            const statsRes = await fetch(`${API}/food/vendor/stats`, { headers });
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
            const response = await fetch(`${API}/food/vendor/menu`, {
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
                const newItem = await response.json();
                setMenuItems([...menuItems, newItem]);
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
            const response = await fetch(`${API}/food/vendor/menu/${editingItem.id}`, {
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
                setMenuItems(menuItems.map(item =>
                    item.id === editingItem.id ? { ...item, ...menuForm, price: parseFloat(menuForm.price) } : item
                ));
                setEditingItem(null);
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
            const response = await fetch(`${API}/food/vendor/menu/${itemId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.ok) {
                setMenuItems(menuItems.filter(item => item.id !== itemId));
            }
        } catch (error) {
            console.error("Failed to delete menu item:", error);
        }
    };

    const handleToggleAvailability = async (itemId, currentStatus) => {
        try {
            const token = localStorage.getItem('token');
            await fetch(`${API}/food/vendor/menu/${itemId}/availability`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ is_available: !currentStatus })
            });

            setMenuItems(menuItems.map(item =>
                item.id === itemId ? { ...item, is_available: !currentStatus } : item
            ));
        } catch (error) {
            console.error("Failed to toggle availability:", error);
        }
    };

    const handleSaveProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API}/food/vendor/restaurant`, {
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
                setRestaurant({ ...restaurant, ...restaurantForm });
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
            await fetch(`${API}/food/vendor/orders/${orderId}/status`, {
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
    const DashboardView = () => (
        <div className="space-y-6">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl p-6 text-white">
                <h2 className="text-2xl font-bold mb-2">Welcome back, {user?.owner_name || user?.name}! 👋</h2>
                <p className="text-orange-100">Here's how your restaurant is performing today.</p>
            </div>

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

    // Menu Management View
    const MenuView = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Menu Items</h2>
                <Button
                    onClick={() => setShowAddMenu(true)}
                    className="bg-gradient-to-r from-orange-600 to-red-600 text-white"
                >
                    <Plus className="w-4 h-4 mr-2" /> Add Item
                </Button>
            </div>

            {/* Menu Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {menuItems.map(item => (
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
                                <Badge variant="outline">{item.category}</Badge>
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

            {menuItems.length === 0 && (
                <div className="text-center py-12">
                    <Utensils className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No menu items yet</h3>
                    <p className="text-gray-500 mb-4">Start by adding your first dish</p>
                    <Button onClick={() => setShowAddMenu(true)} className="bg-orange-600">
                        <Plus className="w-4 h-4 mr-2" /> Add Your First Item
                    </Button>
                </div>
            )}
        </div>
    );

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
                    <p className="text-sm text-green-600 mt-2 flex items-center"><TrendingUp className="w-4 h-4 mr-1" /> +12% from last month</p>
                </Card>
                <Card className="border-0 shadow-lg p-6">
                    <h3 className="text-gray-500 font-medium mb-2">Transactions</h3>
                    <p className="text-3xl font-bold text-gray-900">0</p>
                    <p className="text-sm text-gray-500 mt-2">Completed withdrawals</p>
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
            <Card className="border-0 shadow-lg h-64 flex items-center justify-center bg-gray-50">
                <p className="text-gray-400">Chart Visualization Placeholder</p>
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
                        <div className="bg-orange-50 border border-orange-100 rounded-lg p-4 flex justify-between items-center">
                            <div>
                                <p className="font-bold text-orange-800">20% OFF First Order</p>
                                <p className="text-sm text-orange-600">Code: WELCOME20</p>
                            </div>
                            <Switch checked={true} />
                        </div>
                        <Button className="w-full mt-4" variant="outline"><Plus className="w-4 h-4 mr-2" /> Create Discount</Button>
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
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span>Packaging Boxes</span>
                            <Badge className="bg-green-500">In Stock</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span>Cutlery Sets</span>
                            <Badge className="bg-yellow-500">Low Stock</Badge>
                        </div>
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
                        <ShieldCheck className="w-8 h-8 text-green-600" />
                        <div>
                            <p className="font-medium">FSSAI License</p>
                            <p className="text-sm text-gray-500">Verified</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="sm">View</Button>
                </Card>
                <Card className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <FileText className="w-8 h-8 text-blue-600" />
                        <div>
                            <p className="font-medium">GST Certificate</p>
                            <p className="text-sm text-gray-500">Verified</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="sm">View</Button>
                </Card>
                <Card className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Receipt className="w-8 h-8 text-purple-600" />
                        <div>
                            <p className="font-medium">Bank Details</p>
                            <p className="text-sm text-gray-500">Account Ending ****1234</p>
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
                <CardContent className="p-0">
                    <div className="divide-y divide-gray-100">
                        <div className="p-4 flex gap-3 hover:bg-gray-50">
                            <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                            <div>
                                <p className="font-medium">System Update</p>
                                <p className="text-sm text-gray-500">New dashboard features are available now.</p>
                                <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
                            </div>
                        </div>
                        <div className="p-4 flex gap-3 hover:bg-gray-50">
                            <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
                            <div>
                                <p className="font-medium">Order Completed</p>
                                <p className="text-sm text-gray-500">Order #12345 has been delivered successfully.</p>
                                <p className="text-xs text-gray-400 mt-1">Yesterday</p>
                            </div>
                        </div>
                    </div>
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
};

export default FoodVendor;
