import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navigation from "./Navigation";
import Footer from "./Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "../App";
import {
  Users, ShoppingCart, Package, TrendingUp, Settings, BarChart3,
  LogIn, LayoutDashboard, Store, CreditCard, Tag, UserCheck,
  AlertCircle, CheckCircle2, XCircle, Search, Filter,
  Plus, MoreVertical, MessageSquare, FileText, Bell,
  ShieldCheck, Languages, Truck, Globe, Mail,
  Megaphone, Star, ChevronRight, ChevronDown, Box, Trash2, Zap, History, RotateCcw,
  Utensils, Bike, ChefHat, MapPin, Clock, Lock, LifeBuoy, FileTerminal
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell,
  LineChart, Line, Legend
} from 'recharts';

const Admin = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [activeSubMenu, setActiveSubMenu] = useState('overview');
  const [expandedMenus, setExpandedMenus] = useState(['dashboard', 'vendors']);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  // States for dynamic data
  const [commissionRate, setCommissionRate] = useState(10);
  const [payoutRequests, setPayoutRequests] = useState([]);
  const [entities, setEntities] = useState([]);
  const [pendingProducts, setPendingProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [supportTickets, setSupportTickets] = useState([]);

  // Food Delivery States
  const [foodStats, setFoodStats] = useState({
    liveOrders: 0, todayOrders: 0, activeRestaurants: 0, partnersOnline: 0
  });
  const [dashboardStats, setDashboardStats] = useState({
    totalRevenue: 0, conversionRate: 0, activeSessions: 0, dailySales: 0
  });
  const [liveFoodOrders, setLiveFoodOrders] = useState([]);
  const [restaurantsList, setRestaurantsList] = useState([]);
  const [deliveryPartners, setDeliveryPartners] = useState([]);
  const [topRestaurants, setTopRestaurants] = useState([]);
  const [partnerActivityStats, setPartnerActivityStats] = useState({
    onDelivery: 0, available: 0, offline: 0
  });
  const [deliveryPartnersSummary, setDeliveryPartnersSummary] = useState({
    totalPartners: 0, onlineNow: 0, onDelivery: 0, avgDeliveryTime: '0 min'
  });

  const [pendingVendors, setPendingVendors] = useState([]);
  const [rejectionReasons, setRejectionReasons] = useState({});
  const [replyingTo, setReplyingTo] = useState(null);
  const [adminReply, setAdminReply] = useState('');

  useEffect(() => {
    if (activeSubMenu === 'product-approvals') fetchPendingProducts();
    if (activeSubMenu === 'vendor-onboarding') fetchPendingVendors();
    if (activeSubMenu === 'all-products') fetchAllProducts();
    if (activeSubMenu === 'vendor-payouts') fetchPayoutRequests();
    if (activeSubMenu === 'tickets') fetchSupportTickets();

    // Food Delivery Data Fetching
    if (activeSubMenu === 'food-dashboard') {
      fetchFoodStats();
      fetchTopRestaurants();
      fetchPartnerActivityStats();
      fetchLiveFoodOrders();
    }
    if (activeSubMenu === 'all-restaurants') fetchRestaurants();
    if (activeSubMenu === 'live-food-orders') fetchLiveFoodOrders();
    if (activeSubMenu === 'all-delivery-partners') {
      fetchDeliveryPartners();
      fetchDeliveryPartnersSummary();
    }

    // Moderation & Entity Management
    if (activeSubMenu === 'customer-list' || activeSubMenu === 'all-vendors') fetchEntities();

    // Main Dashboard Data
    if (activeSubMenu === 'overview') fetchDashboardStats();
  }, [activeSubMenu]);

  const fetchDashboardStats = async () => {
    try {
      const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
      const response = await axios.get(`${API_BASE}/api/admin/dashboard/stats`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setDashboardStats(response.data);
    } catch (e) { console.error("Dashboard stats fetch fail", e); }
  };

  const fetchFoodStats = async () => {
    try {
      const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
      const response = await axios.get(`${API_BASE}/api/admin/food/stats`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setFoodStats(response.data);
    } catch (e) { console.error("Food stats fetch fail", e); }
  };

  const fetchTopRestaurants = async () => {
    try {
      const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
      const response = await axios.get(`${API_BASE}/api/admin/food/restaurants/top`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setTopRestaurants(response.data);
    } catch (e) {
      console.error("Top restaurants fetch fail", e);
      // Fallback to empty array if API not available
      setTopRestaurants([]);
    }
  };

  const fetchPartnerActivityStats = async () => {
    try {
      const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
      const response = await axios.get(`${API_BASE}/api/admin/food/partners/activity`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setPartnerActivityStats(response.data);
    } catch (e) {
      console.error("Partner activity fetch fail", e);
      // Fallback if API not available
      setPartnerActivityStats({ onDelivery: 0, available: 0, offline: 0 });
    }
  };

  const fetchRestaurants = async () => {
    try {
      const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
      const response = await axios.get(`${API_BASE}/api/admin/food/restaurants`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setRestaurantsList(response.data);
    } catch (e) { console.error("Restaurants fetch fail", e); }
  };

  const fetchLiveFoodOrders = async () => {
    try {
      const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
      const response = await axios.get(`${API_BASE}/api/admin/food/orders/live`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setLiveFoodOrders(response.data);
    } catch (e) { console.error("Live orders fetch fail", e); }
  };

  const fetchDeliveryPartners = async () => {
    try {
      const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
      const response = await axios.get(`${API_BASE}/api/admin/food/partners`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setDeliveryPartners(response.data);
    } catch (e) { console.error("Partners fetch fail", e); }
  };

  const fetchDeliveryPartnersSummary = async () => {
    try {
      const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
      const response = await axios.get(`${API_BASE}/api/admin/food/partners/summary`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setDeliveryPartnersSummary(response.data);
    } catch (e) {
      console.error("Partners summary fetch fail", e);
      // Fallback if API not available
      setDeliveryPartnersSummary({ totalPartners: 0, onlineNow: 0, onDelivery: 0, avgDeliveryTime: '0 min' });
    }
  };

  const fetchPendingVendors = async () => {
    try {
      const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
      const response = await axios.get(`${API_BASE}/api/admin/vendors/pending`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setPendingVendors(response.data);
    } catch (e) {
      console.error("Failed to fetch pending onboarding assets:", e);
    }
  };

  const handleApproveVendor = async (id) => {
    try {
      const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
      await axios.post(`${API_BASE}/api/admin/vendors/approve/${id}`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setPendingVendors(prev => prev.filter(v => v.id !== id));
      alert("Vendor protocol authorized for live sync.");
    } catch (e) { alert("Authorization protocol failure."); }
  };

  const handleRejectVendor = async (id) => {
    const reason = prompt("Enter rejection reason (Non-compliance description):");
    if (!reason) return;
    try {
      const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
      await axios.post(`${API_BASE}/api/admin/vendors/reject/${id}`, { reason }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setPendingVendors(prev => prev.filter(v => v.id !== id));
      alert("Vendor asset rejected.");
    } catch (e) { alert("Rejection protocol failure."); }
  };

  const fetchPayoutRequests = async () => {
    try {
      const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
      const response = await axios.get(`${API_BASE}/api/admin/payouts`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setPayoutRequests(response.data);
    } catch (e) {
      console.error("Failed to fetch payout requests:", e);
    }
  };

  const handleApprovePayout = async (id) => {
    try {
      const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
      await axios.post(`${API_BASE}/api/admin/payouts/approve/${id}`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      alert("Payout successfully disbursed and authenticated.");
      fetchPayoutRequests();
    } catch (e) {
      alert("Disbursement protocol failed.");
    }
  };

  const handleRejectPayout = async (id) => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;
    try {
      const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
      await axios.post(`${API_BASE}/api/admin/payouts/reject/${id}`, { reason }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      alert("Payout request rejected for non-compliance.");
      fetchPayoutRequests();
    } catch (e) {
      alert("Rejection protocol failed.");
    }
  };

  const fetchPendingProducts = async () => {
    try {
      const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
      const response = await axios.get(`${API_BASE}/api/admin/products/pending`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setPendingProducts(response.data);
    } catch (e) {
      console.error("Failed to fetch pending inventory:", e);
    }
  };

  const fetchAllProducts = async () => {
    try {
      const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
      const response = await axios.get(`${API_BASE}/api/admin/products/all`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setAllProducts(response.data);
    } catch (e) {
      console.error("Failed to fetch all products:", e);
    }
  };

  const handleApproveProduct = async (productId) => {
    try {
      const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
      await axios.post(`${API_BASE}/api/admin/products/approve/${productId}`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setPendingProducts(prev => prev.filter(p => p.id !== productId));
      alert("Inventory Item successfully authorized for live network.");
    } catch (e) {
      alert("Authorization protocol failed. Check security logs.");
    }
  };

  const handleRejectProduct = async (productId) => {
    try {
      const reason = rejectionReasons[productId] || "Fails to meet compliance standards.";
      const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
      await axios.post(`${API_BASE}/api/admin/products/reject/${productId}`, { reason }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setPendingProducts(prev => prev.filter(p => p.id !== productId));
      alert("Inventory Item rejected for non-compliance.");
    } catch (e) {
      alert("Rejection protocol failed.");
    }
  };

  const handleApproveProductAll = async (productId) => {
    try {
      const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
      await axios.post(`${API_BASE}/api/admin/products/approve/${productId}`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setAllProducts(prev => prev.map(p => p.id === productId ? { ...p, status: 'approved' } : p));
      alert("Inventory Item successfully authorized for live network.");
    } catch (e) {
      alert("Authorization protocol failed. Check security logs.");
    }
  };

  const handleRejectProductAll = async (productId) => {
    try {
      const reason = rejectionReasons[productId] || "Fails to meet compliance standards.";
      const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
      await axios.post(`${API_BASE}/api/admin/products/reject/${productId}`, { reason }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setAllProducts(prev => prev.map(p => p.id === productId ? { ...p, status: 'rejected' } : p));
      alert("Inventory Item rejected for non-compliance.");
    } catch (e) {
      alert("Rejection protocol failed.");
    }
  };

  const fetchSupportTickets = async () => {
    try {
      const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
      const response = await axios.get(`${API_BASE}/api/admin/support/tickets`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSupportTickets(response.data);
    } catch (e) {
      console.error("Failed to fetch support tickets:", e);
    }
  };

  const handleModerationAction = async (id, action) => {
    try {
      const endpointMap = {
        'block': `/api/admin/moderation/block/${id}`,
        'unblock': `/api/admin/moderation/unblock/${id}`,
        'terminate': `/api/admin/moderation/force-logout/${id}`
      };

      const API_BASE = process.env.REACT_APP_BACKEND_URL;
      await axios.post(`${API_BASE}${endpointMap[action]}`);

      // Update local state for immediate feedback
      if (action === 'block') {
        setEntities(prev => prev.map(e => e.id === id ? { ...e, status: 'suspended' } : e));
      } else if (action === 'unblock') {
        setEntities(prev => prev.map(e => e.id === id ? { ...e, status: 'active' } : e));
      }

      alert(`Security protocol '${action}' executed successfully on UID: ${id}`);
    } catch (e) {
      console.error(e);
      alert("Security protocol failure. Authentication may be insufficient.");
    }
  };

  const fetchEntities = async () => {
    try {
      const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
      const response = await axios.get(`${API_BASE}/api/admin/entities`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setEntities(response.data);
    } catch (e) {
      console.error("Failed to fetch global entity directory:", e);
    }
  };

  const handleMenuClick = (menuId) => {
    setActiveMenu(menuId);
    if (expandedMenus.includes(menuId)) {
      setExpandedMenus(expandedMenus.filter(id => id !== menuId));
    } else {
      setExpandedMenus([...expandedMenus, menuId]);
    }
    const menu = menuItems.find(m => m.id === menuId);
    if (menu && menu.subItems && menu.subItems.length > 0) {
      setActiveSubMenu(menu.subItems[0].id);
    }
  };

  const toggleExpand = (e, menuId) => {
    e.stopPropagation();
    if (expandedMenus.includes(menuId)) {
      setExpandedMenus(expandedMenus.filter(id => id !== menuId));
    } else {
      setExpandedMenus([...expandedMenus, menuId]);
    }
  };

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      subItems: [
        { id: 'overview', label: 'Overview' },
        { id: 'analytics', label: 'Analytics' }
      ]
    },
    {
      id: 'users',
      label: 'Users',
      icon: Users,
      subItems: [
        { id: 'customer-list', label: 'Customers' },
        { id: 'super-admin', label: 'Administrators' }
      ]
    },
    {
      id: 'vendors',
      label: 'Vendors',
      icon: Store,
      subItems: [
        { id: 'all-vendors', label: 'All Vendors' },
        { id: 'vendor-onboarding', label: 'Onboarding' },
        { id: 'vendor-kyc', label: 'KYC Verification' },
        { id: 'commission-settings', label: 'Commission' },
        { id: 'vendor-payouts', label: 'Payouts' },
        { id: 'vendor-roles', label: 'Vendor Roles & Access' },
        { id: 'vendor-performance', label: 'Performance' }
      ]
    },
    {
      id: 'access-control',
      label: 'Access Control',
      icon: Lock,
      subItems: [
        { id: 'roles', label: 'Roles' },
        { id: 'permissions', label: 'Permissions' },
        { id: 'role-assignment', label: 'Role Assignment' }
      ]
    },
    {
      id: 'catalog',
      label: 'Products',
      icon: Package,
      subItems: [
        { id: 'all-products', label: 'All Products' },
        { id: 'product-approvals', label: 'Approvals' },
        { id: 'categories', label: 'Categories' },
        { id: 'brands', label: 'Brands' }
      ]
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: ShoppingCart,
      subItems: [
        { id: 'order-dashboard', label: 'All Orders' },
        { id: 'return-requests', label: 'Returns & Refunds' }
      ]
    },
    {
      id: 'inventory',
      label: 'Inventory',
      icon: Box,
      subItems: [
        { id: 'stock-management', label: 'Stock Management' },
        { id: 'low-stock-alerts', label: 'Low Stock Alerts' }
      ]
    },
    {
      id: 'payments',
      label: 'Payments',
      icon: CreditCard,
      subItems: [
        { id: 'platform-earnings', label: 'Earnings' },
        { id: 'pending-settlements', label: 'Settlements' },
        { id: 'gst-reports', label: 'Tax Reports' }
      ]
    },
    {
      id: 'food-delivery',
      label: 'Food Delivery',
      icon: Utensils,
      subItems: [
        { id: 'food-dashboard', label: 'Dashboard' },
        { id: 'live-food-orders', label: 'Live Orders' }
      ]
    },
    {
      id: 'restaurants',
      label: 'Restaurants',
      icon: ChefHat,
      subItems: [
        { id: 'all-restaurants', label: 'All Restaurants' },
        { id: 'restaurant-approvals', label: 'Approvals' }
      ]
    },
    {
      id: 'delivery-partners',
      label: 'Delivery Partners',
      icon: Bike,
      subItems: [
        { id: 'all-delivery-partners', label: 'All Partners' },
        { id: 'partner-payouts', label: 'Payouts' }
      ]
    },
    {
      id: 'marketing',
      label: 'Marketing',
      icon: Megaphone,
      subItems: [
        { id: 'coupons', label: 'Coupons' },
        { id: 'banners', label: 'Banners' }
      ]
    },
    {
      id: 'support',
      label: 'Support & Disputes',
      icon: LifeBuoy,
      subItems: [
        { id: 'tickets', label: 'Tickets' },
        { id: 'disputes', label: 'Disputes' }
      ]
    },
    {
      id: 'system-logs',
      label: 'System Logs',
      icon: FileTerminal,
      subItems: [
        { id: 'audit-logs', label: 'Audit Logs' },
        { id: 'error-logs', label: 'Error Logs' }
      ]
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      subItems: [
        { id: 'payment-gateway', label: 'Payment Gateway' },
        { id: 'shipping-partners', label: 'Shipping' },
        { id: 'tax-rules', label: 'Tax Rules' }
      ]
    }
  ];

  // Placeholder Chart Data (to be replaced with API data)
  const salesData = dashboardStats.salesChartData || [];
  const revenueData = dashboardStats.revenueChartData || [];
  const topProducts = [];
  const vendorData = [];

  const COLORS = ['#8b5cf6', '#6366f1', '#ec4899', '#f59e0b'];

  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Upper Stats Row */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Revenue', value: `₹${dashboardStats.totalRevenue.toLocaleString()}`, change: '0%', icon: CreditCard, color: 'text-violet-600', bg: 'bg-violet-100' },
          { label: 'Conversion Rate', value: `${dashboardStats.conversionRate}%`, change: '0%', icon: Zap, color: 'text-amber-600', bg: 'bg-amber-100' },
          { label: 'Active Sessions', value: dashboardStats.activeSessions.toLocaleString(), change: '0%', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-100' },
          { label: 'Daily Sales', value: dashboardStats.dailySales.toLocaleString(), change: '0%', icon: ShoppingCart, color: 'text-emerald-600', bg: 'bg-emerald-100' },
        ].map((stat, i) => (
          <Card key={i} className="border-0 shadow-sm hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">{stat.change}</Badge>
              </div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">{stat.label}</p>
              <p className="text-3xl font-black text-gray-900 tracking-tighter">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Primary Analytics Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Daily Sales Chart */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-violet-600" />
                Daily Sales Velocity
              </CardTitle>
              <Badge variant="outline" className="font-bold">Last 7 Days</Badge>
            </div>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                />
                <Line type="monotone" dataKey="sales" stroke="#8b5cf6" strokeWidth={4} dot={{ r: 6, fill: '#8b5cf6', strokeWidth: 3, stroke: '#fff' }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Revenue Chart */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
                Monthly Revenue Streams
              </CardTitle>
              <Badge variant="outline" className="font-bold">H1 2026</Badge>
            </div>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(value) => `₹${value / 1000000}M`} />
                <Tooltip
                  formatter={(value) => `₹${value.toLocaleString()}`}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="revenue" fill="#6366f1" radius={[8, 8, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Analytics Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Top Products Table-like List */}
        <Card className="lg:col-span-2 border-0 shadow-sm overflow-hidden">
          <CardHeader className="bg-gray-900 border-b border-gray-800">
            <CardTitle className="text-lg font-black uppercase tracking-widest text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-amber-400" />
              Top Performance Assets
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-800/50 text-gray-400 text-[10px] uppercase font-black tracking-widest">
                    <th className="px-6 py-4">Product Identity</th>
                    <th className="px-6 py-4 text-center">Unit Sales</th>
                    <th className="px-6 py-4 text-right">Revenue (INR)</th>
                    <th className="px-6 py-4 text-right">Momentum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {topProducts.map((p, i) => (
                    <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-black text-gray-900 text-sm italic">{p.name}</p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge variant="secondary" className="font-bold">{p.sales}</Badge>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-violet-600">₹{p.revenue.toLocaleString()}</td>
                      <td className={`px-6 py-4 text-right font-black text-xs ${p.growth >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {p.growth > 0 ? '+' : ''}{p.growth}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Vendor Market Share */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
              <Store className="w-5 h-5 text-fuchsia-600" />
              Vendor Market Share
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={vendorData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {vendorData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 space-y-3">
              {vendorData.map((v, i) => (
                <div key={i} className="flex justify-between items-center text-sm font-bold">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                    <span className="text-gray-500">{v.name}</span>
                  </div>
                  <span className="text-gray-900">{v.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderCommissionSettings = () => (
    <div className="space-y-6 max-w-2xl">
      <Card className="border-0 shadow-xl overflow-hidden rounded-[2.5rem]">
        <div className="p-10 bg-gray-900 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/20 blur-[60px]" />
          <h3 className="text-2xl font-black italic mb-2">Commission <span className="text-violet-400">Control.</span></h3>
          <p className="text-gray-400 text-sm">Set the global commission rate for all vendor transactions.</p>
        </div>
        <CardContent className="p-10 space-y-8 bg-white">
          <div className="space-y-4">
            <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Global Platform Fee (%)</Label>
            <div className="flex gap-4">
              <Input
                type="number"
                value={commissionRate}
                onChange={(e) => setCommissionRate(e.target.value)}
                className="h-16 rounded-2xl border-gray-100 focus:border-violet-600 font-black text-2xl px-6"
              />
              <Button className="h-16 px-10 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-violet-200">
                Update Rate
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Effective Earnings</p>
              <h4 className="text-2xl font-black italic">{100 - commissionRate}%</h4>
              <p className="text-[10px] font-medium text-gray-500 mt-1 italic">Goes to the Vendor</p>
            </div>
            <div className="p-6 bg-violet-50 rounded-[2rem] border border-violet-100">
              <p className="text-[10px] font-black text-violet-400 uppercase tracking-widest mb-1">Platform Revenue</p>
              <h4 className="text-2xl font-black italic text-violet-600">{commissionRate}%</h4>
              <p className="text-[10px] font-medium text-violet-500 mt-1 italic">Platform maintenance</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderVendorPayouts = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="flex justify-between items-center bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
        <div>
          <h3 className="text-4xl font-black italic tracking-tighter">Payout <span className="text-violet-600">Terminal.</span></h3>
          <p className="text-slate-500 font-medium mt-2">Oversee capital outflows and authenticate vendor withdrawal requests.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-amber-50 px-8 py-5 rounded-[2rem] border border-amber-100 text-right">
            <p className="text-[9px] font-black text-amber-400 uppercase tracking-widest">Awaiting Audit</p>
            <p className="text-2xl font-black text-amber-600 italic">
              {payoutRequests.filter(p => p.status === 'pending').length} Requests
            </p>
          </div>
        </div>
      </div>

      <Card className="border-none shadow-xl rounded-[3rem] bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest">Transaction ID</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest">Vendor Hub</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-right">Settlement Value</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest">Protocol Status</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-right">Moderation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {payoutRequests.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-10 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-20">
                      <CreditCard className="w-16 h-16" />
                      <p className="text-sm font-black uppercase tracking-widest italic">No payout requests detected in the registry.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                payoutRequests.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-all group">
                    <td className="px-10 py-8 font-mono font-bold text-slate-400 text-xs">
                      #{p.id.slice(0, 13)}...
                    </td>
                    <td className="px-8 py-8">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-black text-slate-400 text-sm">
                          {p.vendor_name[0]}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 uppercase tracking-tight text-sm italic">{p.vendor_name}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{new Date(p.date).toLocaleString()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-8 text-right font-black italic text-xl text-violet-600">
                      ₹{p.amount.toLocaleString()}
                    </td>
                    <td className="px-8 py-8">
                      <Badge className={`rounded-full px-4 py-1.5 font-black text-[9px] uppercase tracking-widest border-none ${p.status === 'completed' ? 'bg-emerald-50 text-emerald-600' :
                        p.status === 'rejected' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600 animate-pulse'
                        }`}>
                        {p.status}
                      </Badge>
                      {p.rejection_reason && (
                        <p className="text-[9px] text-red-400 font-bold mt-1 italic max-w-[150px] truncate" title={p.rejection_reason}>
                          {p.rejection_reason}
                        </p>
                      )}
                    </td>
                    <td className="px-10 py-8 text-right">
                      {p.status === 'pending' ? (
                        <div className="flex gap-3 justify-end items-center">
                          <Button
                            variant="ghost"
                            className="h-12 px-6 rounded-xl text-[10px] font-black uppercase text-red-500 hover:bg-red-50 transition-all"
                            onClick={() => handleRejectPayout(p.id)}
                          >
                            Decline
                          </Button>
                          <Button
                            className="h-12 px-8 rounded-xl bg-violet-600 text-white text-[10px] font-black uppercase tracking-[0.1em] shadow-xl shadow-violet-100 hover:bg-slate-900 transition-all active:scale-95"
                            onClick={() => handleApprovePayout(p.id)}
                          >
                            Disburse Funds
                          </Button>
                        </div>
                      ) : (
                        <div className="flex justify-end pr-4">
                          <CheckCircle2 className={`w-6 h-6 ${p.status === 'completed' ? 'text-emerald-400' : 'text-slate-200'}`} />
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  const [coupons, setCoupons] = useState([]);
  const handleCreateCoupon = () => {
    alert("New Promotional Asset successfully synchronized with the global network. Compliance check passed.");
  };

  const renderCoupons = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-3xl font-black italic">Promotional <span className="text-violet-600">Assets.</span></h3>
          <p className="text-gray-500 font-medium mt-1">Manage global and node-specific discount protocols.</p>
        </div>
        <Button className="h-14 bg-gray-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest px-8 shadow-xl hover:bg-violet-600 transition-all">
          <Plus className="w-4 h-4 mr-2" /> Initialize New Coupon
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Code Identifier</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Protocol Type</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Benefit</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Compliance</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {coupons.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-violet-50 text-violet-600 rounded-lg"><Tag className="w-4 h-4" /></div>
                        <div>
                          <p className="font-black text-gray-900 font-mono text-base">{c.code}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Usage: {c.usage}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <Badge className={`rounded-lg px-2 py-0.5 font-black text-[9px] uppercase tracking-widest border-none ${c.type === 'global' ? 'bg-blue-50 text-blue-600' :
                        c.type === 'category' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                        }`}>
                        {c.type} {c.category || c.vendor ? `(${c.category || c.vendor})` : ''}
                      </Badge>
                    </td>
                    <td className="px-8 py-6 text-right font-black italic text-lg text-gray-900">{c.discount}</td>
                    <td className="px-8 py-6">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-tight flex items-center gap-1.5 whitespace-nowrap">
                          <Clock className="w-3 h-3" /> Exp: {c.expires}
                        </p>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-tight flex items-center gap-1.5 whitespace-nowrap">
                          <ShoppingCart className="w-3 h-3" /> Min: ₹{c.minOrder}
                        </p>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <Button variant="ghost" size="icon" className="text-gray-300 hover:text-violet-600 rounded-xl"><MoreVertical className="w-4 h-4" /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="border-none shadow-2xl rounded-[2.5rem] bg-gray-900 p-8 text-white">
          <div className="space-y-6">
            <h4 className="text-2xl font-black italic">Asset <span className="text-violet-400">Creation.</span></h4>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Code Symbol</Label>
                <Input placeholder="E.G. FLASH50" className="h-14 bg-white/5 border-white/10 rounded-xl font-black uppercase tracking-widest text-violet-400" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Value</Label>
                  <Input placeholder="20%" className="h-14 bg-white/5 border-white/10 rounded-xl font-black" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Protocol</Label>
                  <div className="h-14 bg-white/5 border-white/10 rounded-xl flex items-center px-4 text-xs font-black uppercase tracking-widest">Global</div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Min Order Required (₹)</Label>
                <Input placeholder="999" className="h-14 bg-white/5 border-white/10 rounded-xl font-black" />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Deactivation Date</Label>
                <Input type="date" className="h-14 bg-white/5 border-white/10 rounded-xl font-black" />
              </div>

              <div className="space-y-2 pt-4">
                <Button
                  onClick={handleCreateCoupon}
                  className="w-full h-14 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-black uppercase tracking-widest shadow-xl shadow-violet-900/20 active:scale-95 transition-all"
                >
                  Sync to Network
                </Button>
              </div>
            </div>

            <div className="pt-6 border-t border-white/5 flex items-center gap-4">
              <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-violet-400" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest">Protocol Verified</p>
                <p className="text-[10px] text-gray-500 font-bold italic">Meets Master Compliance Rules</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  const [allReviews, setAllReviews] = useState([]);

  const renderReviewModeration = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center bg-white p-10 rounded-[2.5rem] shadow-sm">
        <div>
          <h3 className="text-3xl font-black italic">Feedback <span className="text-violet-600">Oversight.</span></h3>
          <p className="text-gray-500 font-medium mt-1">Monitor and moderate the global customer voice protocols.</p>
        </div>
        <div className="flex gap-4 text-left">
          <div className="bg-slate-50 px-6 py-4 rounded-2xl border border-slate-100">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Global Sentiment</p>
            <p className="text-xl font-black text-emerald-600 italic">Positive (88%)</p>
          </div>
          <div className="bg-slate-50 px-6 py-4 rounded-2xl border border-slate-100">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Pending Audit</p>
            <p className="text-xl font-black text-amber-600 italic">24 Logs</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {allReviews.map(r => (
          <Card key={r.id} className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden group hover:bg-slate-50/50 transition-all duration-500">
            <CardContent className="p-0">
              <div className="flex flex-col lg:flex-row">
                <div className="lg:w-1/4 p-10 border-r border-slate-100 bg-slate-50/30">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-lg">
                      {r.user[0]}
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 uppercase tracking-tight text-sm">{r.user}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{r.date}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3 h-3 ${i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                    ))}
                  </div>
                  <Badge className={`rounded-lg px-2 py-0.5 font-black text-[9px] uppercase tracking-widest border-none ${r.status === 'published' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                    {r.status}
                  </Badge>
                </div>

                <div className="flex-1 p-10 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Box className="w-4 h-4 text-violet-600" />
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject: <span className="text-slate-900">{r.product}</span></p>
                    </div>
                    <p className="text-slate-600 font-medium italic text-lg leading-relaxed">
                      &ldquo;{r.comment}&rdquo;
                    </p>
                  </div>

                  <div className="flex justify-end gap-3 pt-8 mt-8 border-t border-slate-50">
                    <Button variant="outline" className="h-12 px-6 rounded-xl border-slate-200 text-[10px] font-black uppercase text-slate-600 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-100 transition-all">
                      Flag as SPAM
                    </Button>
                    <Button variant="outline" className="h-12 px-6 rounded-xl border-slate-200 text-[10px] font-black uppercase text-red-500 hover:bg-red-50 hover:border-red-100 transition-all">
                      <Trash2 className="w-4 h-4 mr-2" /> Decommission Log
                    </Button>
                    <Button className="h-12 px-8 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-violet-600 transition-all">
                      Verify Integrity
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderEntityManagement = (type) => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center bg-white p-10 rounded-[2.5rem] shadow-sm">
        <div>
          <h3 className="text-3xl font-black italic uppercase">{type} <span className="text-violet-600">Inventory.</span></h3>
          <p className="text-gray-500 font-medium mt-1">Global directory of authenticated network {type}s.</p>
        </div>
        <div className="bg-slate-50 px-8 py-5 rounded-[2rem] border border-slate-100 flex items-center gap-4">
          <div className="text-right">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Population</p>
            <p className="text-2xl font-black text-slate-900 italic">{entities.filter(e => e.type === (type === 'user' ? 'user' : 'vendor')).length}</p>
          </div>
          <Users className="w-8 h-8 text-violet-600" />
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-slate-100">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-900 text-white">
              <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest">Identity / UID</th>
              <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest">Contact Protocol</th>
              <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest">Joined Net</th>
              <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest">Status</th>
              <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-right">Moderation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {entities.filter(e => e.type === (type === 'user' ? 'user' : 'vendor')).map((entity) => (
              <tr key={entity.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-10 py-8">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-white ${entity.status === 'active' ? 'bg-slate-900' : 'bg-red-500'}`}>
                      {entity.name[0]}
                    </div>
                    <div>
                      <p className="font-black text-slate-900 uppercase tracking-tight text-sm">{entity.name}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{entity.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-8">
                  <p className="text-sm font-medium text-slate-600">{entity.email}</p>
                </td>
                <td className="px-6 py-8">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{entity.joined}</p>
                </td>
                <td className="px-6 py-8">
                  <Badge className={`rounded-lg px-2 py-0.5 font-black text-[9px] uppercase tracking-widest border-none ${entity.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                    }`}>
                    {entity.status}
                  </Badge>
                </td>
                <td className="px-10 py-8 text-right">
                  <div className="flex justify-end gap-2">
                    {entity.status === 'active' ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl border-slate-200 text-[9px] font-black uppercase text-red-500 hover:bg-red-50 transition-all"
                        onClick={() => handleModerationAction(entity.id, 'block')}
                      >
                        Suspend
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl border-slate-200 text-[9px] font-black uppercase text-emerald-600 hover:bg-emerald-50 transition-all"
                        onClick={() => handleModerationAction(entity.id, 'unblock')}
                      >
                        Authorize
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-xl text-[9px] font-black uppercase text-slate-400 hover:text-slate-900 transition-all"
                      onClick={() => handleModerationAction(entity.id, 'terminate')}
                    >
                      Terminate Session
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderProductApprovals = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-3xl font-black italic">Inventory <span className="text-violet-600">Audit.</span></h3>
          <p className="text-gray-500 font-medium">Review and authorize new merchant products for the live network.</p>
        </div>
        <Badge className="bg-amber-50 text-amber-600 border-none px-6 py-2 rounded-xl font-black italic text-sm">
          {pendingProducts.length} PENDING AUDITS
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {pendingProducts.length === 0 ? (
          <div className="bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200 py-32 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">All inventory queues are currently clear.</p>
          </div>
        ) : (
          pendingProducts.map(product => (
            <Card key={product.id} className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden group hover:shadow-2xl transition-all duration-500">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/3 aspect-[4/3] md:aspect-auto relative overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-black/50 backdrop-blur-md text-white border-none px-4 py-2 font-black italic text-[10px] uppercase tracking-widest">
                      {product.category}
                    </Badge>
                  </div>
                </div>
                <div className="flex-1 p-10 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-2xl font-black italic text-gray-900 leading-tight mb-2">{product.name}</h4>
                        <p className="text-gray-400 text-sm font-medium leading-relaxed max-w-md">{product.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Price Point</p>
                        <p className="text-3xl font-black italic text-violet-600 tracking-tighter">₹{product.price ? product.price.toLocaleString() : 'N/A'}</p>
                      </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <div className="bg-gray-50 px-4 py-2 rounded-xl">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Initial Stock</p>
                        <p className="text-sm font-black italic text-gray-700">{product.stock} Units</p>
                      </div>
                      <div className="bg-gray-50 px-4 py-2 rounded-xl">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Merchant ID</p>
                        <p className="text-sm font-black italic text-gray-700">{product.vendor_id.slice(0, 8)}...</p>
                      </div>
                      {product.discount > 0 && (
                        <div className="bg-violet-50 px-4 py-2 rounded-xl">
                          <p className="text-[9px] font-black text-violet-400 uppercase tracking-widest">Discount</p>
                          <p className="text-sm font-black italic text-violet-700">{product.discount}% OFF</p>
                        </div>
                      )}
                    </div>

                    {/* Rich Details Audit Section */}
                    <div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-gray-50 mt-4">
                      {product.highlights && product.highlights.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Key Highlights</p>
                          <ul className="space-y-1">
                            {product.highlights.map((h, i) => (
                              <li key={i} className="text-xs font-semibold text-gray-600 flex items-center gap-2">
                                <div className="w-1 h-1 bg-violet-400 rounded-full" /> {h}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {product.specifications && Object.keys(product.specifications).length > 0 && (
                        <div className="space-y-2">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Technical Specifications</p>
                          <div className="grid grid-cols-2 gap-2">
                            {Object.entries(product.specifications).map(([k, v], i) => (
                              <div key={i} className="bg-gray-50/50 p-2 rounded-lg">
                                <p className="text-[8px] font-bold text-gray-400 uppercase">{k}</p>
                                <p className="text-[10px] font-bold text-gray-700">{v}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Logistics & Support</p>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-400">Warranty:</span>
                            <span className="font-bold text-gray-700">{product.warranty || "Standard"}</span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-400">Box Contents:</span>
                            <span className="font-bold text-gray-700">{product.box_contents || "N/A"}</span>
                          </div>
                          {product.offers && (
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-gray-400">Promotional:</span>
                              <span className="font-bold text-violet-600">{product.offers}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {product.images && product.images.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Additional Assets ({product.images.length})</p>
                          <div className="flex gap-2 overflow-x-auto pb-2">
                            {product.images.map((img, i) => (
                              <img key={i} src={img} alt="" className="w-12 h-12 object-cover rounded-lg border border-gray-100 flex-shrink-0" />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-10 space-y-4">
                    <Input
                      placeholder="Add compliance notes or rejection reason..."
                      className="h-12 rounded-xl border-gray-100 placeholder:text-gray-300 font-medium text-sm"
                      value={rejectionReasons[product.id] || ""}
                      onChange={(e) => setRejectionReasons(prev => ({ ...prev, [product.id]: e.target.value }))}
                    />
                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleApproveProduct(product.id)}
                        className="flex-1 h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-emerald-100"
                      >
                        Authorize & Go Live
                      </Button>
                      <Button
                        onClick={() => handleRejectProduct(product.id)}
                        className="flex-1 h-12 bg-white border-2 border-red-50 hover:bg-red-50 text-red-500 rounded-xl font-black uppercase text-[10px] tracking-widest transition-colors"
                      >
                        Reject Submission
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );

  const renderAllProducts = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-3xl font-black italic">Global <span className="text-violet-600">Inventory.</span></h3>
          <p className="text-gray-500 font-medium">Manage all vendor products across the platform.</p>
        </div>
        <Badge className="bg-blue-50 text-blue-600 border-none px-6 py-2 rounded-xl font-black italic text-sm">
          {allProducts.length} TOTAL PRODUCTS
        </Badge>
      </div>

      <Card className="border-0 shadow-xl rounded-[2.5rem] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Image</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Product</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Category</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Price</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Stock</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Vendor</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {allProducts.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-16 text-center">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No products found.</p>
                  </td>
                </tr>
              ) : (
                allProducts.map(product => (
                  <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded-lg border border-gray-100"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <p className="font-black text-gray-900 text-sm truncate">{product.name}</p>
                        <p className="text-gray-400 text-xs truncate">{product.description}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className="text-xs">{product.category}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-violet-600">₹{product.price ? product.price.toLocaleString() : 'N/A'}</p>
                      {product.discount > 0 && (
                        <p className="text-xs text-green-600">{product.discount}% OFF</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="secondary" className="text-xs">{product.stock} Units</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-mono text-gray-600">{product.vendor_id.slice(0, 8)}...</p>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={`text-xs ${product.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                        product.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                        {product.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {product.status !== 'approved' && (
                        <div className="flex gap-2 justify-end">
                          <Button
                            onClick={() => handleApproveProductAll(product.id)}
                            size="sm"
                            className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                          >
                            Approve
                          </Button>
                          <Button
                            onClick={() => handleRejectProductAll(product.id)}
                            size="sm"
                            variant="outline"
                            className="h-8 border-red-200 text-red-600 hover:bg-red-50 text-xs"
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                      {product.status === 'approved' && (
                        <Badge className="bg-emerald-100 text-emerald-700 text-xs">
                          Live
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  const renderSupport = () => (
    <div className="space-y-8">
      <div className="flex justify-between items-center bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
        <div>
          <h3 className="text-4xl font-black italic tracking-tighter">Support <span className="text-violet-600">Center.</span></h3>
          <p className="text-slate-500 font-medium mt-2">Manage vendor support tickets and provide assistance.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-amber-50 px-8 py-5 rounded-[2rem] border border-amber-100 text-right">
            <p className="text-[9px] font-black text-amber-400 uppercase tracking-widest">Open Tickets</p>
            <p className="text-2xl font-black text-amber-600 italic">
              {supportTickets.filter(t => t.status === 'open').length}
            </p>
          </div>
        </div>
      </div>

      <Card className="border-none shadow-xl rounded-[3rem] bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest">Ticket ID</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest">Vendor</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest">Subject</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest">Status</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {supportTickets.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-10 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-20">
                      <MessageSquare className="w-16 h-16" />
                      <p className="text-sm font-black uppercase tracking-widest italic">No support tickets found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                supportTickets.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50/50 transition-all group">
                    <td className="px-10 py-8 font-mono font-bold text-slate-400 text-xs">
                      #{t.id.slice(0, 13)}...
                    </td>
                    <td className="px-8 py-8">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-black text-slate-400 text-sm">
                          {t.vendor_name ? t.vendor_name[0] : 'V'}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 uppercase tracking-tight text-sm italic">{t.vendor_name || 'Unknown Vendor'}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{new Date(t.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-8">
                      <p className="font-black text-slate-900 italic">{t.subject}</p>
                      {t.order_id && <p className="text-[9px] text-violet-600 font-bold uppercase">Order: {t.order_id}</p>}
                    </td>
                    <td className="px-8 py-8">
                      <Badge className={`rounded-full px-4 py-1.5 font-black text-[9px] uppercase tracking-widest border-none ${t.status === 'resolved' ? 'bg-emerald-50 text-emerald-600' :
                        t.status === 'responding' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                        }`}>
                        {t.status}
                      </Badge>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setReplyingTo(replyingTo === t.id ? null : t.id)}
                        className="rounded-xl border-slate-200 hover:border-violet-300"
                      >
                        {replyingTo === t.id ? 'Cancel' : 'Reply'}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {replyingTo && (
        <Card className="border-none shadow-xl rounded-[3rem] bg-white p-8">
          <h4 className="text-2xl font-black italic mb-6">Reply to <span className="text-violet-600">Ticket.</span></h4>
          <div className="space-y-6">
            <div>
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Your Response</Label>
              <Textarea
                value={adminReply}
                onChange={(e) => setAdminReply(e.target.value)}
                placeholder="Type your response to the vendor..."
                rows={6}
                className="rounded-[2rem] border-slate-100 bg-slate-50/50 focus:bg-white font-medium p-6 mt-2"
              />
            </div>
            <div className="flex gap-4">
              <Button
                onClick={async () => {
                  try {
                    const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
                    await axios.post(`${API_BASE}/api/admin/support/tickets/${replyingTo}/reply`, {
                      message: adminReply
                    }, {
                      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                    });
                    alert("Reply sent successfully!");
                    setReplyingTo(null);
                    setAdminReply('');
                    fetchSupportTickets();
                  } catch (e) {
                    console.error("Failed to send reply:", e);
                    alert("Failed to send reply. Please try again.");
                  }
                }}
                className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl px-8"
              >
                Send Reply
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setReplyingTo(null);
                  setAdminReply('');
                }}
                className="rounded-xl border-slate-200"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );

  // ===== FOOD DELIVERY RENDER FUNCTIONS =====
  const renderFoodDashboard = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-3xl font-black italic">Food Delivery <span className="text-orange-500">Dashboard.</span></h3>
          <p className="text-gray-500 font-medium mt-1">Real-time overview of your food delivery operations.</p>
        </div>
        <Badge className="bg-orange-100 text-orange-600 border-orange-200 px-4 py-2 text-sm font-bold">
          <span className="w-2 h-2 bg-orange-500 rounded-full inline-block mr-2 animate-pulse"></span>
          Live View
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Live Orders', value: foodStats.liveOrders, change: '+12%', icon: Clock, color: 'text-orange-600', bg: 'bg-orange-100' },
          { label: 'Today\'s Orders', value: foodStats.todayOrders, change: '+18%', icon: ShoppingCart, color: 'text-green-600', bg: 'bg-green-100' },
          { label: 'Active Restaurants', value: foodStats.activeRestaurants, change: '+5%', icon: ChefHat, color: 'text-purple-600', bg: 'bg-purple-100' },
          { label: 'Delivery Partners Online', value: foodStats.partnersOnline, change: '+8%', icon: Bike, color: 'text-blue-600', bg: 'bg-blue-100' },
        ].map((stat, i) => (
          <Card key={i} className="border-0 shadow-sm hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">{stat.change}</Badge>
              </div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">{stat.label}</p>
              <p className="text-3xl font-black text-gray-900 tracking-tighter">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Live Orders & Restaurant Status */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Live Orders */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="bg-orange-500 text-white">
            <CardTitle className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Live Food Orders
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              {liveFoodOrders.length === 0 ? (
                <div className="p-10 text-center text-gray-400 font-bold uppercase text-xs tracking-widest opacity-50">No live orders detected</div>
              ) : liveFoodOrders.map((order, i) => (
                <div key={i} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-sm text-gray-400">#{order.id}</span>
                    <Badge className={`text-[10px] uppercase font-bold ${order.status === 'Out for Delivery' ? 'bg-blue-100 text-blue-600' :
                      order.status === 'Preparing' ? 'bg-amber-100 text-amber-600' :
                        'bg-green-100 text-green-600'
                      }`}>{order.status}</Badge>
                  </div>
                  <p className="font-bold text-gray-900">{order.restaurant}</p>
                  <div className="flex items-center justify-between mt-1 text-sm text-gray-500">
                    <span>{order.customer} • {order.items} items</span>
                    <span className="font-bold text-orange-600">₹{order.amount}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{order.time}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Restaurant Stats */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-purple-600" />
              Top Restaurants Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topRestaurants.length === 0 ? (
                <div className="p-6 text-center text-gray-400 font-bold uppercase text-xs tracking-widest opacity-50">No restaurant data available</div>
              ) : topRestaurants.map((restaurant, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 font-bold">
                      #{i + 1}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{restaurant.name}</p>
                      <p className="text-sm text-gray-500">{restaurant.orders || 0} orders • ⭐ {restaurant.rating || 'N/A'}</p>
                    </div>
                  </div>
                  <span className="font-bold text-green-600">₹{(restaurant.revenue || 0).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delivery Partner Status */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
            <Bike className="w-5 h-5 text-blue-600" />
            Delivery Partner Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { label: 'On Delivery', count: partnerActivityStats.onDelivery, color: 'bg-blue-500' },
              { label: 'Available', count: partnerActivityStats.available, color: 'bg-green-500' },
              { label: 'Offline', count: partnerActivityStats.offline, color: 'bg-gray-400' },
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-4 p-5 bg-gray-50 rounded-xl">
                <div className={`w-4 h-4 ${stat.color} rounded-full`}></div>
                <div>
                  <p className="text-2xl font-black text-gray-900">{stat.count}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderRestaurants = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-3xl font-black italic">Restaurant <span className="text-purple-600">Registry.</span></h3>
          <p className="text-gray-500 font-medium mt-1">Manage all registered restaurants on DACHBites.</p>
        </div>
        <Button className="h-14 bg-purple-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest px-8 shadow-xl hover:bg-purple-700 transition-all">
          <Plus className="w-4 h-4 mr-2" /> Add Restaurant
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search restaurants..."
            className="w-full h-12 pl-12 pr-4 rounded-xl bg-gray-100 border-0 focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <Button variant="outline" className="h-12 px-6 rounded-xl">
          <Filter className="w-4 h-4 mr-2" /> Filters
        </Button>
      </div>

      {/* Restaurant Table */}
      <Card className="border-0 shadow-sm overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-900 text-white">
                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest">Restaurant</th>
                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest">Cuisine</th>
                <th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-widest">Rating</th>
                <th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-widest">Orders Today</th>
                <th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {restaurantsList.length === 0 ? (
                <tr><td colSpan="6" className="py-20 text-center text-gray-400 font-bold uppercase text-xs tracking-widest opacity-50">No restaurants in database</td></tr>
              ) : restaurantsList.map((restaurant, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                        <ChefHat className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{restaurant.name}</p>
                        {restaurant.verified && <span className="text-xs text-green-600">✓ FSSAI Verified</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{restaurant.cuisine}</td>
                  <td className="px-6 py-4 text-center">
                    <Badge className="bg-amber-100 text-amber-700 border-amber-200">⭐ {restaurant.rating}</Badge>
                  </td>
                  <td className="px-6 py-4 text-center font-bold">{restaurant.orders}</td>
                  <td className="px-6 py-4 text-center">
                    <Badge className={`${restaurant.status === 'Active' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                      {restaurant.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  const renderLiveFoodOrders = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-3xl font-black italic">Live <span className="text-red-500">Orders.</span></h3>
          <p className="text-gray-500 font-medium mt-1">Real-time order tracking and management.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-full text-sm font-bold">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          {liveFoodOrders.length} Active Orders
        </div>
      </div>

      {/* Order Status Filters */}
      <div className="flex gap-3 flex-wrap">
        {['All Orders', 'Order Placed', 'Preparing', 'Ready for Pickup', 'Out for Delivery', 'Delivered'].map((status, i) => (
          <Button key={i} variant={i === 0 ? 'default' : 'outline'} className={`rounded-full ${i === 0 ? 'bg-gray-900' : ''}`}>
            {status}
          </Button>
        ))}
      </div>

      {/* Orders Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {liveFoodOrders.length === 0 ? (
          <div className="col-span-full py-20 text-center text-gray-400 font-bold uppercase text-xs tracking-widest opacity-50 bg-gray-50 rounded-3xl border border-dashed border-gray-200">No active orders monitored on live network</div>
        ) : liveFoodOrders.map((order, i) => (
          <Card key={i} className={`border-0 shadow-sm overflow-hidden ${order.status === 'Order Placed' ? 'ring-2 ring-green-500' : ''
            }`}>
            <div className={`p-3 ${order.status === 'Out for Delivery' ? 'bg-blue-500' :
              order.status === 'Preparing' ? 'bg-amber-500' :
                order.status === 'Ready for Pickup' ? 'bg-purple-500' :
                  'bg-green-500'
              }`}>
              <div className="flex items-center justify-between text-white">
                <span className="font-mono font-bold">#{order.id}</span>
                <span className="text-sm font-bold uppercase">{order.status}</span>
              </div>
            </div>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-bold text-gray-900">{order.restaurant}</p>
                <span className="text-xs text-gray-400">{order.time}</span>
              </div>
              <div className="text-sm text-gray-600">
                <p><strong>Customer:</strong> {order.customer}</p>
                <p><strong>Phone:</strong> {order.phone}</p>
              </div>
              <div className="text-sm bg-gray-50 p-2 rounded-lg">
                {order.items.map((item, j) => (
                  <p key={j} className="text-gray-600">{item}</p>
                ))}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">📍 {order.address.split(',')[0]}</span>
                <span className="font-bold text-orange-600">₹{order.amount}</span>
              </div>
              {order.partner && (
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <Bike className="w-4 h-4" />
                  <span className="font-medium">{order.partner}</span>
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <Button size="sm" className="flex-1 bg-gray-900 text-white">View Details</Button>
                {!order.partner && order.status === 'Order Placed' && (
                  <Button size="sm" variant="outline" className="flex-1">Assign Partner</Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderDeliveryPartners = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-3xl font-black italic">Delivery <span className="text-blue-600">Partners.</span></h3>
          <p className="text-gray-500 font-medium mt-1">Manage your delivery fleet.</p>
        </div>
        <Button className="h-14 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest px-8 shadow-xl hover:bg-blue-700 transition-all">
          <Plus className="w-4 h-4 mr-2" /> Add Partner
        </Button>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label: 'Total Partners', value: deliveryPartnersSummary.totalPartners, bg: 'bg-gray-100' },
          { label: 'Online Now', value: deliveryPartnersSummary.onlineNow, bg: 'bg-green-100', color: 'text-green-600' },
          { label: 'On Delivery', value: deliveryPartnersSummary.onDelivery, bg: 'bg-blue-100', color: 'text-blue-600' },
          { label: 'Avg. Delivery Time', value: deliveryPartnersSummary.avgDeliveryTime, bg: 'bg-amber-100', color: 'text-amber-600' },
        ].map((stat, i) => (
          <div key={i} className={`p-5 ${stat.bg} rounded-2xl`}>
            <p className="text-sm font-bold text-gray-500 mb-1">{stat.label}</p>
            <p className={`text-2xl font-black ${stat.color || 'text-gray-900'}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Partners Table */}
      <Card className="border-0 shadow-sm overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-900 text-white">
                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest">Partner</th>
                <th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-widest">Today's Deliveries</th>
                <th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-widest">Rating</th>
                <th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-widest">Earnings Today</th>
                <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {deliveryPartners.length === 0 ? (
                <tr><td colSpan="6" className="py-20 text-center text-gray-400 font-bold uppercase text-xs tracking-widest opacity-50">No delivery partners registered</td></tr>
              ) : deliveryPartners.map((partner, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Bike className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{partner.name}</p>
                        <p className="text-xs text-gray-500">{partner.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Badge className={`${partner.status === 'Available' ? 'bg-green-100 text-green-600' :
                      partner.status === 'On Delivery' ? 'bg-blue-100 text-blue-600' :
                        'bg-gray-100 text-gray-500'
                      }`}>
                      {partner.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-center font-bold">{partner.deliveries}</td>
                  <td className="px-6 py-4 text-center">
                    <Badge className="bg-amber-100 text-amber-700">⭐ {partner.rating}</Badge>
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-green-600">₹{partner.earnings}</td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  const renderPlaceholder = (title, description, icon = Box) => {
    const Icon = icon;
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center mb-6 shadow-sm border border-gray-100">
          <Icon className="w-10 h-10 text-gray-300" />
        </div>
        <h3 className="text-3xl font-black italic text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-500 font-medium max-w-md mx-auto leading-relaxed">{description}</p>
        <Button onClick={() => setActiveMenu('dashboard')} className="mt-8 h-12 bg-gray-900 text-white rounded-xl font-black uppercase text-[10px] tracking-widest px-8 shadow-xl hover:bg-violet-600 transition-all">
          Return to Dashboard
        </Button>
      </div>
    );
  };

  const renderContent = () => {
    // Dashboard
    if (activeMenu === 'dashboard' && activeSubMenu === 'overview') return renderDashboard();
    if (activeSubMenu === 'revenue-charts') return renderPlaceholder('Revenue Analytics', 'Detailed financial graphs and revenue breakdowns will appear here once sufficient data is collected.', BarChart3);
    if (activeSubMenu === 'recent-activity') return renderPlaceholder('System Activity', 'Real-time logs of system-wide actions and security events.', History);

    // Access Control (NEW)
    if (['roles', 'permissions', 'role-assignment'].includes(activeSubMenu)) {
      return renderPlaceholder('Access Control', 'Granular permission settings and role assignment matrix.', Lock);
    }

    // System Logs (NEW)
    if (['audit-logs', 'error-logs'].includes(activeSubMenu)) {
      return renderPlaceholder('System Logs', 'Comprehensive system activity and error tracking logs.', FileTerminal);
    }

    // Vendor Updates
    if (activeSubMenu === 'all-vendors') return renderEntityManagement('vendor'); // Logic matched to previous vendor-list
    if (activeSubMenu === 'vendor-roles') return renderPlaceholder('Vendor Roles', 'Manage vendor access levels and permissions.', Lock);

    // User Management
    if (activeSubMenu === 'all-users') return renderEntityManagement('user');
    if (activeSubMenu === 'roles-permissions') return renderPlaceholder('Access Control', 'Configure granular permissions and role-based access control policies.', ShieldCheck);

    // Vendor Management
    if (activeSubMenu === 'vendor-list') return renderEntityManagement('vendor');
    if (activeSubMenu === 'vendor-approvals') return renderPlaceholder('Vendor Applications', 'Review and approve new merchant applications.', UserCheck);
    if (activeSubMenu === 'vendor-performance') return renderPlaceholder('Vendor Metrics', 'Performance KPIs and reliability scores for all registered vendors.', TrendingUp);
    if (activeSubMenu === 'commission-settings') return renderCommissionSettings();
    if (activeSubMenu === 'vendor-payouts') return renderVendorPayouts();

    // Product Management
    if (activeSubMenu === 'all-products') return renderAllProducts();
    if (activeSubMenu === 'product-approvals') return renderProductApprovals();
    if (activeSubMenu === 'categories') return renderPlaceholder('Category Structure', 'Manage product taxonomy and category hierarchy.', Tag);

    // Order Management
    if (activeSubMenu === 'all-orders') return renderPlaceholder('Order Central', 'Global order processing and tracking terminal.', ShoppingCart);
    if (activeSubMenu === 'returns-refunds') return renderPlaceholder('RMA Center', 'Process return merchandise authorizations and refunds.', RotateCcw);
    if (activeSubMenu === 'shipping-status') return renderPlaceholder('Logistics Grid', 'Real-time shipping carrier integration and status updates.', Truck);

    // Marketing
    if (activeSubMenu === 'coupons') return renderCoupons();
    if (activeSubMenu === 'promotions') return renderPlaceholder('Campaign Manager', 'Schedule and manage seasonal promotions.', Star);
    if (activeSubMenu === 'newsletter') return renderPlaceholder('Email Marketing', 'Manage subscriber lists and newsletter campaigns.', Mail);

    // CMS
    if (activeSubMenu === 'pages') return renderPlaceholder('Page Builder', 'Edit static pages and content blocks.', LayoutDashboard);
    if (activeSubMenu === 'reviews') return renderReviewModeration();
    if (activeSubMenu === 'faq') return renderPlaceholder('Knowledge Base', 'Manage Frequently Asked Questions.', MessageSquare);
    if (activeSubMenu === 'blog') return renderPlaceholder('Blog Posts', 'Manage news articles and blog content.', FileText);

    // Support
    if (activeSubMenu === 'tickets') return renderSupport();
    if (activeSubMenu === 'chat-support') return renderPlaceholder('Live Support', 'Real-time chat support system for customer assistance.', MessageSquare);

    // Reports
    if (activeMenu === 'reports') return renderPlaceholder('Data Warehouse', 'Comprehensive system reports and data export tools.', BarChart3);

    // New sections - placeholders for now
    // User Management
    if (activeSubMenu === 'customer-list') return renderPlaceholder('All Customers', 'Complete directory of registered customers.', Users);
    if (activeSubMenu === 'kyc') return renderPlaceholder('KYC Verification', 'Know Your Customer verification process.', ShieldCheck);
    if (activeSubMenu === 'block-restrict') return renderPlaceholder('Block / Restrict', 'Block or restrict customer accounts.', XCircle);
    if (activeSubMenu === 'order-history') return renderPlaceholder('Order History', 'Customer order and return history.', History);
    if (activeSubMenu === 'wallet-logs') return renderPlaceholder('Wallet Logs', 'Customer wallet and refund logs.', CreditCard);
    if (activeSubMenu === 'super-admin') return renderPlaceholder('Super Admin', 'Super admin management.', ShieldCheck);
    if (activeSubMenu === 'sub-admin') return renderPlaceholder('Sub Admin', 'Sub admin management.', Users);
    if (activeSubMenu === 'support-staff') return renderPlaceholder('Support Staff', 'Support staff management.', MessageSquare);
    if (activeSubMenu === 'rbac') return renderPlaceholder('Access Control', 'Role-based access control configuration.', ShieldCheck);

    // Vendor Management
    if (activeSubMenu === 'vendor-onboarding') return renderPlaceholder('Vendor Onboarding', 'New vendor registration process.', UserCheck);
    if (activeSubMenu === 'vendor-kyc') return renderPlaceholder('KYC Verification', 'Vendor KYC verification.', ShieldCheck);
    if (activeSubMenu === 'vendor-categories') return renderPlaceholder('Vendor Categories', 'Gold / Silver / New vendor categories.', Star);
    if (activeSubMenu === 'vendor-profiles') return renderPlaceholder('Vendor Profile Control', 'Manage vendor profiles.', Store);
    if (activeSubMenu === 'vendor-products') return renderPlaceholder('Vendor Product Listing', 'Vendor product management.', Package);
    if (activeSubMenu === 'commission-rules') return renderPlaceholder('Commission Rules', 'Commission and fee management.', CreditCard);
    if (activeSubMenu === 'vendor-penalties') return renderPlaceholder('Penalty / Warning System', 'Vendor penalty and warning management.', AlertCircle);
    if (activeSubMenu === 'vendor-block') return renderPlaceholder('Block / Suspend', 'Block or suspend vendors.', XCircle);
    if (activeSubMenu === 'vendor-reviews') return renderPlaceholder('Review Moderation', 'Moderate vendor reviews.', Star);

    // Catalog Management
    if (activeSubMenu === 'product-edit') return renderPlaceholder('Edit / Disable', 'Edit or disable products.', Settings);
    if (activeSubMenu === 'duplicate-detection') return renderPlaceholder('Duplicate Detection', 'Detect duplicate products.', Search);
    if (activeSubMenu === 'variants') return renderPlaceholder('Variant Management', 'Manage product variants.', Box);
    if (activeSubMenu === 'seo-control') return renderPlaceholder('SEO Control', 'Product SEO optimization.', Globe);
    if (activeSubMenu === 'vendor-products-view') return renderPlaceholder('Vendor Products', 'View products by vendor.', Store);
    if (activeSubMenu === 'attributes') return renderPlaceholder('Attribute Mapping', 'Category to attribute mapping.', Tag);
    if (activeSubMenu === 'brands') return renderPlaceholder('Brand Management', 'Brand management.', Tag);

    // Order Management
    if (activeSubMenu === 'order-dashboard') return renderPlaceholder('Order Dashboard', 'Order management dashboard.', ShoppingCart);
    if (activeSubMenu === 'split-orders') return renderPlaceholder('Split Orders', 'Multi-vendor order splitting.', ShoppingCart);
    if (activeSubMenu === 'order-status') return renderPlaceholder('Order Status Override', 'Override order status.', Settings);
    if (activeSubMenu === 'shipping-labels') return renderPlaceholder('Shipping Label Generation', 'Generate shipping labels.', Truck);
    if (activeSubMenu === 'delivery-sla') return renderPlaceholder('Delivery SLA Monitoring', 'Monitor delivery SLAs.', Truck);
    if (activeSubMenu === 'auto-cancel') return renderPlaceholder('Auto Cancel Rules', 'Automatic order cancellation rules.', XCircle);
    if (activeSubMenu === 'cod-verification') return renderPlaceholder('COD Verification', 'Cash on delivery verification.', CreditCard);
    if (activeSubMenu === 'rto') return renderPlaceholder('RTO (Return to Origin)', 'Return to origin management.', RotateCcw);

    // Returns, Refunds & Disputes
    if (activeSubMenu === 'return-requests') return renderPlaceholder('Return Requests', 'Manage return requests.', RotateCcw);
    if (activeSubMenu === 'refund-approval') return renderPlaceholder('Refund Approval', 'Approve refunds.', CreditCard);
    if (activeSubMenu === 'disputes') return renderPlaceholder('Dispute Management', 'Manage customer-vendor disputes.', AlertCircle);
    if (activeSubMenu === 'evidence-upload') return renderPlaceholder('Evidence Upload', 'Upload dispute evidence.', FileText);
    if (activeSubMenu === 'auto-refund') return renderPlaceholder('Auto Refund Rules', 'Automatic refund rules.', CreditCard);
    if (activeSubMenu === 'chargeback') return renderPlaceholder('Chargeback Handling', 'Handle chargebacks.', CreditCard);

    // Inventory & Stock Intelligence
    if (activeSubMenu === 'real-time-inventory') return renderPlaceholder('Real-time Inventory', 'Real-time inventory tracking.', Box);
    if (activeSubMenu === 'stock-sync') return renderPlaceholder('Vendor Stock Sync', 'Sync vendor stock.', Box);
    if (activeSubMenu === 'low-stock-alerts') return renderPlaceholder('Low Stock Auto Alerts', 'Low stock alerts.', AlertCircle);
    if (activeSubMenu === 'stock-lock') return renderPlaceholder('Stock Lock (Checkout)', 'Lock stock during checkout.', Box);
    if (activeSubMenu === 'damaged-stock') return renderPlaceholder('Damaged / Lost Stock Logs', 'Damaged or lost stock logs.', Box);

    // Payments & Settlements
    if (activeSubMenu === 'platform-earnings') return renderPlaceholder('Platform Earnings', 'Platform earnings tracking.', CreditCard);
    if (activeSubMenu === 'commission-breakdown') return renderPlaceholder('Commission Breakdown', 'Commission breakdown.', CreditCard);
    if (activeSubMenu === 'tax-collection') return renderPlaceholder('Tax Collection', 'Tax collection management.', CreditCard);
    if (activeSubMenu === 'gst-reports') return renderPlaceholder('GST/VAT Reports', 'GST/VAT reports.', BarChart3);
    if (activeSubMenu === 'payout-cycle') return renderPlaceholder('Payout Cycle', 'Payout cycle configuration.', CreditCard);
    if (activeSubMenu === 'vendor-wallet') return renderPlaceholder('Vendor Wallet', 'Vendor wallet management.', CreditCard);
    if (activeSubMenu === 'pending-settlements') return renderPlaceholder('Pending Settlements', 'Pending settlement management.', CreditCard);
    if (activeSubMenu === 'manual-adjustments') return renderPlaceholder('Manual Adjustments', 'Manual settlement adjustments.', Settings);
    if (activeSubMenu === 'failed-payouts') return renderPlaceholder('Failed Payouts', 'Failed payout management.', AlertCircle);

    // Marketing & Growth Engine
    if (activeSubMenu === 'campaigns') return renderPlaceholder('Campaign Management', 'Marketing campaign management.', Megaphone);
    if (activeSubMenu === 'flash-sales') return renderPlaceholder('Flash Sales', 'Flash sales management.', Zap);
    if (activeSubMenu === 'sponsored-products') return renderPlaceholder('Sponsored Products', 'Sponsored product management.', Star);
    if (activeSubMenu === 'referral') return renderPlaceholder('Referral & Affiliate', 'Referral and affiliate management.', Users);
    if (activeSubMenu === 'email-campaigns') return renderPlaceholder('Email / SMS / Push', 'Email, SMS, and push campaigns.', Mail);
    if (activeSubMenu === 'abandoned-cart') return renderPlaceholder('Abandoned Cart Recovery', 'Abandoned cart recovery.', ShoppingCart);

    // Reviews, Ratings & Trust
    if (activeSubMenu === 'review-moderation') return renderPlaceholder('Review Moderation', 'Moderate reviews and ratings.', Star);
    if (activeSubMenu === 'fake-review-detection') return renderPlaceholder('Fake Review Detection', 'Detect fake reviews.', Search);
    if (activeSubMenu === 'vendor-rating') return renderPlaceholder('Vendor Rating Control', 'Control vendor ratings.', Star);
    if (activeSubMenu === 'abuse-reports') return renderPlaceholder('Abuse Reports', 'Manage abuse reports.', AlertCircle);
    if (activeSubMenu === 'qa-flags') return renderPlaceholder('QA Flags', 'Quality assurance flags.', CheckCircle2);

    // Support & Operations
    if (activeSubMenu === 'ticket-system') return renderPlaceholder('Ticket System', 'Support ticket system.', MessageSquare);
    if (activeSubMenu === 'vendor-support') return renderPlaceholder('Vendor Support', 'Vendor support management.', MessageSquare);
    if (activeSubMenu === 'customer-support') return renderPlaceholder('Customer Support', 'Customer support management.', MessageSquare);
    if (activeSubMenu === 'chat-logs') return renderPlaceholder('Chat & Call Logs', 'Chat and call logs.', MessageSquare);
    if (activeSubMenu === 'escalation') return renderPlaceholder('Escalation Matrix', 'Support escalation matrix.', AlertCircle);
    if (activeSubMenu === 'sla-tracking') return renderPlaceholder('SLA Tracking', 'SLA tracking for support.', BarChart3);

    // CMS & SEO
    if (activeSubMenu === 'static-pages') return renderPlaceholder('Static Pages', 'Manage static pages.', FileText);
    if (activeSubMenu === 'homepage-builder') return renderPlaceholder('Homepage Layout Builder', 'Build homepage layout.', LayoutDashboard);
    if (activeSubMenu === 'banners') return renderPlaceholder('Banners & Sliders', 'Manage banners and sliders.', FileText);
    if (activeSubMenu === 'blog-articles') return renderPlaceholder('Blog / Help Articles', 'Manage blog and help articles.', FileText);
    if (activeSubMenu === 'seo-meta') return renderPlaceholder('SEO Meta Rules', 'SEO meta rules.', Globe);
    if (activeSubMenu === 'url-management') return renderPlaceholder('URL Management', 'URL management.', Globe);

    // Reports & Business Intelligence
    if (activeSubMenu === 'sales-analytics') return renderPlaceholder('Sales Analytics', 'Sales analytics.', BarChart3);
    if (activeSubMenu === 'vendor-performance-reports') return renderPlaceholder('Vendor Performance', 'Vendor performance reports.', BarChart3);
    if (activeSubMenu === 'customer-ltv') return renderPlaceholder('Customer LTV', 'Customer lifetime value.', BarChart3);
    if (activeSubMenu === 'conversion-funnel') return renderPlaceholder('Funnel Conversion', 'Conversion funnel analysis.', BarChart3);
    if (activeSubMenu === 'category-growth') return renderPlaceholder('Category Growth', 'Category growth analysis.', BarChart3);
    if (activeSubMenu === 'profit-loss') return renderPlaceholder('Profit & Loss', 'Profit and loss reports.', BarChart3);

    // Automation & Rules Engine
    if (activeSubMenu === 'order-auto-assign') return renderPlaceholder('Order Auto Assign', 'Automatic order assignment.', Zap);
    if (activeSubMenu === 'auto-penalization') return renderPlaceholder('Auto Vendor Penalization', 'Automatic vendor penalization.', AlertCircle);
    if (activeSubMenu === 'auto-refund-rules') return renderPlaceholder('Auto Refund Rules', 'Automatic refund rules.', CreditCard);
    if (activeSubMenu === 'auto-settlement') return renderPlaceholder('Auto Settlement Rules', 'Automatic settlement rules.', CreditCard);
    if (activeSubMenu === 'fraud-detection') return renderPlaceholder('Fraud Detection Rules', 'Fraud detection rules.', ShieldCheck);

    // Vendor Management
    if (activeSubMenu === 'vendor-onboarding') return renderVendorOnboarding();
    if (activeSubMenu === 'vendor-kyc') return renderPlaceholder('KYC Verification', 'Review vendor identity documents.', ShieldCheck);
    if (activeSubMenu === 'vendor-profiles') return renderPlaceholder('Profile Control', 'Manage vendor public profiles.', Store);
    if (activeSubMenu === 'vendor-products') return renderPlaceholder('Product Control', 'Global product catalog management.', Package);
    if (activeSubMenu === 'commission-settings') return renderPlaceholder('Commission Control', 'Global commission parameters.', Tag);
    if (activeSubMenu === 'vendor-payouts') return renderPayouts();
    if (activeSubMenu === 'vendor-penalties') return renderPlaceholder('Penalty System', 'Compliance penalty management.', AlertCircle);

    // Business & Orders
    if (activeSubMenu === 'live-sales') return renderPlaceholder('Live Sales Analytics', 'Real-time sales velocity visualization.', BarChart3);
    if (activeSubMenu === 'orders-funnel') return renderPlaceholder('Conversion Funnel', 'Deep dive into user conversion paths.', Filter);
    if (activeSubMenu === 'vendor-snapshot') return renderPlaceholder('Vendor Performance', 'Aggregated vendor health metrics.', BarChart3);
    if (activeSubMenu === 'alerts') return renderPlaceholder('System Security Alerts', 'Real-time infrastructure and security alerts.', AlertCircle);
    if (activeSubMenu === 'all-orders') return renderPlaceholder('Order Nexus', 'Master control for all transaction records.', ShoppingCart);
    if (activeSubMenu === 'returns-nexus') return renderPlaceholder('Return / RMA Nexus', 'Management of return authorizations.', RotateCcw);
    if (activeSubMenu === 'logistics-hub') return renderPlaceholder('Logistics Network', 'Real-time tracking of global shipments.', Truck);

    // Default
    return renderPlaceholder('Module Incoming', `We are currently synchronizing the ${activeSubMenu || activeMenu} module with the Master Node.`);
  };

  const renderVendorOnboarding = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
        <div>
          <h3 className="text-4xl font-black italic tracking-tighter">Vendor <span className="text-violet-600">Onboarding.</span></h3>
          <p className="text-slate-500 font-medium mt-2">Authorize new vendor protocols for the live network.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-violet-50 px-8 py-5 rounded-[2rem] border border-violet-100 text-right">
            <p className="text-[9px] font-black text-violet-400 uppercase tracking-widest">Pending Sync</p>
            <p className="text-2xl font-black text-violet-600 italic">{pendingVendors.length}</p>
          </div>
        </div>
      </div>

      <Card className="border-none shadow-xl rounded-[3rem] bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest">Business Identity</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest">Ownership</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest">Credentials</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest">Status</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-right">Authorization</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {pendingVendors.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-10 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-20">
                      <Store className="w-16 h-16 text-slate-400" />
                      <p className="text-sm font-black uppercase tracking-widest italic text-slate-400">No pending vendor protocols detected.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                pendingVendors.map(v => (
                  <tr key={v.id} className="hover:bg-slate-50/50 transition-all group">
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-violet-100 rounded-2xl flex items-center justify-center font-black text-violet-600">
                          {v.business_name ? v.business_name[0] : 'V'}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 uppercase tracking-tight italic">{v.business_name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{v.business_category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-8">
                      <p className="font-bold text-slate-700">{v.owner_name}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{v.phone}</p>
                    </td>
                    <td className="px-8 py-8">
                      <p className="font-medium text-slate-600 text-xs">{v.email}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">ID: #{v.id.slice(0, 8)}</p>
                    </td>
                    <td className="px-8 py-8">
                      <Badge className="bg-amber-50 text-amber-600 rounded-full px-4 py-1 font-black text-[9px] uppercase tracking-widest border-none">
                        Pending Admin
                      </Badge>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          onClick={() => handleApproveVendor(v.id)}
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-4 font-bold text-[10px] uppercase shadow-lg shadow-emerald-100"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Approve
                        </Button>
                        <Button
                          onClick={() => handleRejectVendor(v.id)}
                          size="sm"
                          variant="outline"
                          className="border-rose-200 text-rose-500 hover:bg-rose-50 rounded-xl px-4 font-bold text-[10px] uppercase"
                        >
                          <XCircle className="w-3.5 h-3.5 mr-1.5" /> Reject
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-white flex flex-col relative">
      <Navigation />

      {/* Sidebar Toggle Button */}
      <button
        onClick={() => setIsSidebarVisible(!isSidebarVisible)}
        className={`fixed z-[60] bottom-8 left-8 w-14 h-14 bg-gray-900 text-white rounded-2xl shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 ${!isSidebarVisible ? 'rotate-180' : ''}`}
        title={isSidebarVisible ? "Collapse Menu" : "Expand Menu"}
      >
        <ChevronRight className={`w-6 h-6 transition-transform ${isSidebarVisible ? 'rotate-180' : ''}`} />
      </button>

      <div className="flex flex-1 pt-20 overflow-hidden relative">
        {/* Sidebar */}
        <aside className={`bg-gray-900 text-gray-300 flex flex-col border-r border-gray-800 shrink-0 transition-all duration-300 ease-in-out ${isSidebarVisible ? 'w-72 opacity-100 translate-x-0' : 'w-0 opacity-0 -translate-x-full overflow-hidden'}`}>
          <div className="p-4 border-b border-gray-800 whitespace-nowrap overflow-hidden flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center text-white shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="transition-opacity">
                <h2 className="font-semibold text-white text-base">Admin Panel</h2>
                <span className="text-xs text-gray-400">Management Console</span>
              </div>
            </div>
            {/* Close sidebar button inside header */}
            <button
              onClick={() => setIsSidebarVisible(false)}
              className="p-2 hover:bg-gray-800 rounded-lg text-gray-500 hover:text-white transition-colors lg:hidden"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 py-1">
            {menuItems.map((menu) => (
              <div key={menu.id}>
                <button
                  onClick={() => handleMenuClick(menu.id)}
                  className={`w-full flex items-center justify-between px-4 py-2 transition-all ${activeMenu === menu.id ? 'bg-violet-600 text-white' : 'hover:bg-gray-800'}`}
                >
                  <div className="flex items-center gap-3">
                    <menu.icon className={`w-4 h-4 shrink-0 ${activeMenu === menu.id ? 'text-white' : 'text-gray-400'}`} />
                    <span className="text-sm font-medium">{menu.label}</span>
                  </div>
                  {menu.subItems && <ChevronDown className={`w-4 h-4 transition-transform shrink-0 ${expandedMenus.includes(menu.id) ? 'rotate-180' : ''}`} />}
                </button>
                {menu.subItems && expandedMenus.includes(menu.id) && (
                  <div className="bg-gray-800/50 py-1">
                    {menu.subItems.map((sub) => (
                      <button
                        key={sub.id}
                        onClick={() => setActiveSubMenu(sub.id)}
                        className={`w-full text-left pl-10 pr-4 py-1.5 text-sm transition-colors ${activeSubMenu === sub.id ? 'text-violet-400 font-medium bg-gray-800/30' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/20'}`}
                      >
                        {sub.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-gray-800 mt-auto whitespace-nowrap overflow-hidden">
            <button
              onClick={logout}
              className="flex items-center gap-3 text-red-400 hover:text-red-300 transition-colors w-full"
            >
              <LogIn className="w-5 h-5 rotate-180" />
              <span className="text-sm font-medium">Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-8 lg:p-12 transition-all duration-300">
          <div className="max-w-7xl mx-auto min-h-screen">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-200 pb-10">
              <div>
                <p className="text-sm text-gray-500 mb-1">Admin Dashboard</p>
                <h1 className="text-3xl font-bold text-gray-900">
                  {activeSubMenu ? (
                    <>{activeSubMenu.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</>
                  ) : (
                    <>Overview</>
                  )}
                </h1>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="h-11 rounded-lg bg-white font-medium text-sm px-5">Export PDF</Button>
                <Button className="h-11 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-medium text-sm px-6">New Action</Button>
              </div>
            </div>
            {renderContent()}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Admin;