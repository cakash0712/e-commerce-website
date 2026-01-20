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
  Megaphone, Star, ChevronRight, ChevronDown, Box, Trash2, Zap
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

  // Dummy data for commissions and payouts
  const [commissionRate, setCommissionRate] = useState(10);
  const [payoutRequests, setPayoutRequests] = useState([
    { id: 'PAY-8821', vendor: 'Global Partners', amount: 45000, date: '2026-01-18', status: 'pending' },
    { id: 'PAY-8822', vendor: 'Tech Haven', amount: 12800, date: '2026-01-19', status: 'processing' },
    { id: 'PAY-8823', vendor: 'Fashion Hub', amount: 8400, date: '2026-01-15', status: 'completed' },
  ]);
  const [entities, setEntities] = useState([
    { id: 'usr-101', name: 'John Doe', type: 'user', email: 'john@example.com', status: 'active', joined: '2025-12-10' },
    { id: 'usr-102', name: 'Alice Smith', type: 'user', email: 'alice@example.com', status: 'active', joined: '2025-12-15' },
    { id: 'vnd-201', name: 'Tech Haven', type: 'vendor', email: 'tech@haven.com', status: 'active', joined: '2026-01-02' },
    { id: 'vnd-202', name: 'Fashion Hub', type: 'vendor', email: 'fashion@hub.com', status: 'suspended', joined: '2026-01-05' },
  ]);

  const [pendingProducts, setPendingProducts] = useState([]);
  const [rejectionReasons, setRejectionReasons] = useState({});

  useEffect(() => {
    if (activeSubMenu === 'product-approvals') {
      fetchPendingProducts();
    }
  }, [activeSubMenu]);

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

  const handleMenuClick = (menuId) => {
    setActiveMenu(menuId);
    if (!expandedMenus.includes(menuId)) {
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
        { id: 'revenue-charts', label: 'Revenue Charts' },
        { id: 'recent-activity', label: 'Recent Activity' }
      ]
    },
    {
      id: 'users',
      label: 'User Management',
      icon: Users,
      subItems: [
        { id: 'all-users', label: 'All Users' },
        { id: 'roles-permissions', label: 'Roles & Permissions' }
      ]
    },
    {
      id: 'vendors',
      label: 'Vendor Management',
      icon: Store,
      subItems: [
        { id: 'vendor-list', label: 'Vendor List' },
        { id: 'vendor-approvals', label: 'Approvals' },
        { id: 'vendor-performance', label: 'Performance' },
        { id: 'commission-settings', label: 'Commissions' },
        { id: 'vendor-payouts', label: 'Payouts' }
      ]
    },
    {
      id: 'products',
      label: 'Product Management',
      icon: Package,
      subItems: [
        { id: 'all-products', label: 'All Products' },
        { id: 'product-approvals', label: 'Approvals' },
        { id: 'categories', label: 'Categories' }
      ]
    },
    {
      id: 'orders',
      label: 'Order Management',
      icon: ShoppingCart,
      subItems: [
        { id: 'all-orders', label: 'All Orders' },
        { id: 'returns-refunds', label: 'Returns & Refunds' },
        { id: 'shipping-status', label: 'Shipping Status' }
      ]
    },
    {
      id: 'marketing',
      label: 'Marketing',
      icon: Megaphone,
      subItems: [
        { id: 'coupons', label: 'Coupons' },
        { id: 'promotions', label: 'Promos' },
        { id: 'newsletter', label: 'Newsletter' }
      ]
    },
    {
      id: 'cms',
      label: 'CMS / Content',
      icon: FileText,
      subItems: [
        { id: 'pages', label: 'Pages' },
        { id: 'reviews', label: 'Reviews & Moderation' },
        { id: 'faq', label: 'FAQ' },
        { id: 'blog', label: 'Blog & News' }
      ]
    },
    {
      id: 'reports',
      label: 'Reports & Analytics',
      icon: BarChart3,
      subItems: [
        { id: 'sales-reports', label: 'Sales Reports' },
        { id: 'vendor-reports', label: 'Vendor Reports' },
        { id: 'customer-reports', label: 'Customer Reports' }
      ]
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      subItems: [
        { id: 'site-settings', label: 'Site Settings' },
        { id: 'currency-language', label: 'Currency & Language' },
        { id: 'shipping-rules', label: 'Shipping Rules' },
        { id: 'notification-settings', label: 'Notifications' },
        { id: 'security', label: 'Security' }
      ]
    }
  ];

  // Dummy Chart Data
  const salesData = [
    { name: 'Mon', sales: 420 },
    { name: 'Tue', sales: 380 },
    { name: 'Wed', sales: 510 },
    { name: 'Thu', sales: 490 },
    { name: 'Fri', sales: 620 },
    { name: 'Sat', sales: 740 },
    { name: 'Sun', sales: 690 },
  ];

  const revenueData = [
    { name: 'Jan', revenue: 2400000 },
    { name: 'Feb', revenue: 1398000 },
    { name: 'Mar', revenue: 9800000 },
    { name: 'Apr', revenue: 3908000 },
    { name: 'May', revenue: 4800000 },
    { name: 'Jun', revenue: 3800000 },
  ];

  const topProducts = [
    { name: 'Cyber-Watch Pro', sales: 1240, revenue: 350000, growth: 12.5 },
    { name: 'Audio-Max v3', sales: 890, revenue: 180000, growth: 8.2 },
    { name: 'Hyper-Book 14', sales: 560, revenue: 1200000, growth: -2.1 },
    { name: 'Smart-Fit Band', sales: 2100, revenue: 85000, growth: 25.4 },
    { name: 'Pro-Cam 4K', sales: 430, revenue: 210000, growth: 1.4 },
  ];

  const vendorData = [
    { name: 'Apex Tech', value: 45 },
    { name: 'Fashion Hub', value: 30 },
    { name: 'Home Essentials', value: 15 },
    { name: 'Beauty Direct', value: 10 },
  ];

  const COLORS = ['#8b5cf6', '#6366f1', '#ec4899', '#f59e0b'];

  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Upper Stats Row */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Revenue', value: '₹12.4M', change: '+14.2%', icon: CreditCard, color: 'text-violet-600', bg: 'bg-violet-100' },
          { label: 'Conversion Rate', value: '3.84%', change: '+0.45%', icon: Zap, color: 'text-amber-600', bg: 'bg-amber-100' },
          { label: 'Active Sessions', value: '1,842', change: '+5.4%', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-100' },
          { label: 'Daily Sales', value: '642', change: '+12.1%', icon: ShoppingCart, color: 'text-emerald-600', bg: 'bg-emerald-100' },
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
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-black italic">Payout <span className="text-violet-600">Terminal.</span></h3>
        <Badge className="bg-amber-50 text-amber-600 border-none px-4 py-2 rounded-xl font-bold">
          {payoutRequests.filter(p => p.status === 'pending').length} Pending Requests
        </Badge>
      </div>

      <Card className="border-0 shadow-xl rounded-[2.5rem] overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-900 text-white">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest">Transaction ID</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest">Vendor Hub</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-right">Net Value</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest">Status</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {payoutRequests.map(p => (
                <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-8 py-6 font-mono font-bold text-gray-500">{p.id}</td>
                  <td className="px-8 py-6">
                    <p className="font-black text-gray-900 italic uppercase spacing-tight">{p.vendor}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{p.date}</p>
                  </td>
                  <td className="px-8 py-6 text-right font-black italic text-violet-600">₹{p.amount.toLocaleString()}</td>
                  <td className="px-8 py-6">
                    <Badge className={`rounded-lg px-3 py-1 font-black text-[10px] uppercase tracking-widest border-none ${p.status === 'completed' ? 'bg-emerald-50 text-emerald-600' :
                      p.status === 'processing' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                      {p.status}
                    </Badge>
                  </td>
                  <td className="px-8 py-6 text-right">
                    {p.status === 'pending' && (
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" className="h-10 rounded-xl border-gray-100 text-[10px] font-black uppercase text-red-500 hover:bg-red-50">Decline</Button>
                        <Button className="h-10 rounded-xl bg-violet-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-violet-100">Approve</Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  const [coupons, setCoupons] = useState([
    { id: 1, code: 'WINTER20', type: 'global', discount: '20%', minOrder: 1000, expires: '2026-03-31', usage: '45/100', status: 'active' },
    { id: 2, code: 'TECH-OFF', type: 'category', category: 'Electronics', discount: '₹500', minOrder: 5000, expires: '2026-02-15', usage: '12/50', status: 'active' },
    { id: 3, code: 'VEND-99', type: 'vendor', vendor: 'Global Partners', discount: '15%', minOrder: 0, expires: '2026-06-01', usage: '8/200', status: 'active' },
  ]);
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

  const [allReviews, setAllReviews] = useState([
    { id: 1, user: 'Rahul K.', rating: 5, date: 'Jan 15, 2026', comment: 'Top-tier build quality. Worth every rupee.', product: 'Premium Leather Bag', status: 'published' },
    { id: 2, user: 'Sanya M.', rating: 2, date: 'Jan 18, 2026', comment: 'Delivery was late and box was slightly crushed.', product: 'Noise Cancelling Headphones', status: 'flagged' },
    { id: 3, user: 'Vikram Singh', rating: 4, date: 'Jan 19, 2026', comment: 'Good performance, but setup was tedious.', product: 'Smart Coffee Maker', status: 'published' },
  ]);

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
                        <p className="text-3xl font-black italic text-violet-600 tracking-tighter">₹{product.price.toLocaleString()}</p>
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

  const renderContent = () => {
    if (activeMenu === 'dashboard') return renderDashboard();
    if (activeSubMenu === 'all-users') return renderEntityManagement('user');
    if (activeSubMenu === 'vendor-list') return renderEntityManagement('vendor');
    if (activeSubMenu === 'commission-settings') return renderCommissionSettings();
    if (activeSubMenu === 'vendor-payouts') return renderVendorPayouts();
    if (activeSubMenu === 'coupons') return renderCoupons();
    if (activeSubMenu === 'reviews') return renderReviewModeration();
    if (activeSubMenu === 'product-approvals') return renderProductApprovals();

    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center mb-6">
          <Box className="w-10 h-10 text-gray-300" />
        </div>
        <h3 className="text-2xl font-black italic">Module <span className="text-violet-600">Incoming.</span></h3>
        <p className="text-gray-500 font-medium mt-2 max-w-sm mx-auto">We are currently synchronizing the {activeSubMenu || activeMenu} module with the Master Node.</p>
        <Button onClick={() => handleMenuClick('dashboard')} className="mt-8 bg-gray-900 text-white rounded-xl font-black uppercase text-[10px] tracking-widest px-8">Back to Overview</Button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navigation />
      <div className="flex flex-1 pt-20 overflow-hidden">
        <aside className="w-72 bg-gray-900 text-gray-300 flex flex-col border-r border-gray-800 shrink-0">
          <div className="p-6 border-b border-gray-800">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center text-white">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-bold text-white tracking-tight italic uppercase">Admin<span className="text-violet-400">Core.</span></h2>
                <span className="text-[10px] uppercase font-black text-gray-500">Master Level 9</span>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto py-4">
            {menuItems.map((menu) => (
              <div key={menu.id} className="mb-1">
                <button
                  onClick={() => handleMenuClick(menu.id)}
                  className={`w-full flex items-center justify-between px-6 py-4 transition-all ${activeMenu === menu.id ? 'bg-violet-600 text-white' : 'hover:bg-gray-800'}`}
                >
                  <div className="flex items-center gap-3">
                    <menu.icon className={`w-5 h-5 ${activeMenu === menu.id ? 'text-white' : 'text-gray-500'}`} />
                    <span className="text-xs font-black uppercase tracking-widest italic">{menu.label}</span>
                  </div>
                  {menu.subItems && <ChevronDown className={`w-4 h-4 transition-transform ${expandedMenus.includes(menu.id) ? 'rotate-180' : ''}`} />}
                </button>
                {menu.subItems && expandedMenus.includes(menu.id) && (
                  <div className="bg-black/20 py-2">
                    {menu.subItems.map((sub) => (
                      <button
                        key={sub.id}
                        onClick={() => setActiveSubMenu(sub.id)}
                        className={`w-full text-left px-14 py-2.5 text-[10px] font-black uppercase tracking-widest ${activeSubMenu === sub.id ? 'text-violet-400' : 'text-gray-500 hover:text-gray-300'}`}
                      >
                        {sub.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="p-6 border-t border-gray-800">
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-500 hover:text-white font-black uppercase text-[10px] tracking-widest"
              onClick={() => { logout(); navigate('/auth'); }}
            >
              <LogIn className="w-4 h-4 mr-3" />
              Terminate Session
            </Button>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto bg-gray-50 p-12">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-200 pb-10">
              <div>
                <Badge className="bg-violet-50 text-violet-600 border-none px-3 py-1 text-[10px] font-black uppercase italic mb-4">Internal Node Access</Badge>
                <h1 className="text-5xl font-black text-gray-900 tracking-tighter italic">
                  {activeSubMenu ? (
                    <>Master <span className="text-violet-600">{activeSubMenu.replace('-', ' ')}.</span></>
                  ) : (
                    <>System <span className="text-violet-600">Overview.</span></>
                  )}
                </h1>
              </div>
              <div className="flex gap-4">
                <Button variant="outline" className="h-14 rounded-2xl bg-white font-black text-[10px] uppercase px-8">extraction pdf</Button>
                <Button className="h-14 rounded-2xl bg-gray-900 text-white font-black text-[10px] uppercase px-10">new operation</Button>
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