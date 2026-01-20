import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import Navigation from "./Navigation";
import Footer from "./Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Package, Plus, Edit, Trash2, Eye, Upload, Star, ShoppingCart,
  TrendingUp, LayoutDashboard, DollarSign, User, LogOut,
  Box, Wallet, History, CreditCard, Banknote, MessageSquare,
  Settings, Image, FileText, CheckCircle2, AlertCircle,
  XCircle, Search, Bell, MoreVertical, Globe, ShieldCheck,
  ChevronRight, ChevronDown, Tag, UserCheck
} from "lucide-react";
import { useAuth } from "../App";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';

const Vendor = () => {
  const { user, updateUser, logout } = useAuth();
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [activeSubMenu, setActiveSubMenu] = useState("overview");

  // State for products and data
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchVendorProducts();
  }, []);

  const fetchVendorProducts = async () => {
    try {
      const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
      const response = await axios.get(`${API_BASE}/api/vendor/products`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setProducts(response.data);
    } catch (e) {
      console.error("Failed to sync vendor inventory:", e);
    }
  };

  const [reviews] = useState([
    { id: 1, user: "Alice", rating: 5, comment: "Excellent quality!", product: "Premium Leather Bag", date: "2 days ago" },
    { id: 2, user: "Bob", rating: 4, comment: "Good, but shipping took long.", product: "Smart Coffee Maker", date: "1 week ago" },
  ]);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Product Management', icon: Package },
    { id: 'orders', label: 'Order Management', icon: ShoppingCart },
    { id: 'inventory', label: 'Inventory', icon: Box },
    { id: 'finance', label: 'Earnings & Payouts', icon: DollarSign },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'coupons', label: 'Marketing & Coupons', icon: Tag },
    { id: 'settings', label: 'Store Settings', icon: Settings },
    { id: 'support', label: 'Support', icon: MessageSquare },
  ];

  const [vendorCoupons, setVendorCoupons] = useState([
    { id: 1, code: 'SAVE10', discount: '10%', usage: 25, limit: 100, expires: '2026-06-01', status: 'active' },
    { id: 2, code: 'FLASH50', discount: '₹50', usage: 10, limit: 50, expires: '2026-02-15', status: 'expired' },
  ]);

  const renderCoupons = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center bg-white p-8 rounded-[2rem] shadow-sm">
        <div>
          <h3 className="text-3xl font-black italic">Sales <span className="text-violet-600">Accelerators.</span></h3>
          <p className="text-gray-500 font-medium">Create exclusive discount protocols for your target audience.</p>
        </div>
        <Button className="h-14 bg-violet-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest px-8 shadow-xl shadow-violet-200">
          <Plus className="w-4 h-4 mr-2" /> Generate Code
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {[
          { label: 'Active Codes', val: '12', icon: Tag, color: 'text-violet-600', bg: 'bg-violet-50' },
          { label: 'Total Claims', val: '438', icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Revenue Saved', val: '₹12,400', icon: DollarSign, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Avg. Discount', val: '14.2%', icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        ].map((stat, i) => (
          <Card key={i} className="p-6 border-none shadow-sm flex flex-col justify-between rounded-3xl bg-white">
            <div className={`p-3 w-fit rounded-xl ${stat.bg} ${stat.color}`}><stat.icon className="w-5 h-5" /></div>
            <div className="mt-4">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
              <h4 className="text-xl font-black italic text-gray-900">{stat.val}</h4>
            </div>
          </Card>
        ))}
      </div>

      <Card className="border-none shadow-sm rounded-[2.5rem] bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Promotion Code</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Benefit Amount</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Utilization</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Deactivation</th>
                <th className="px-8 py-5 text-[10px) font-black text-gray-400 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm font-medium">
              {vendorCoupons.map(c => (
                <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-violet-600 shadow-[0_0_8px_rgba(139,92,246,0.4)]" />
                      <span className="font-black text-gray-900 font-mono tracking-wider">{c.code}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 font-black italic text-violet-600 text-base">{c.discount}</td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full w-24 overflow-hidden">
                        <div className="h-full bg-violet-600 rounded-full" style={{ width: `${(c.usage / c.limit) * 100}%` }} />
                      </div>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{c.usage}/{c.limit}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-gray-500 font-bold uppercase text-[10px] tracking-tight whitespace-nowrap">
                    {c.expires}
                  </td>
                  <td className="px-8 py-6">
                    <Badge className={c.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-none px-3 py-1 font-black text-[9px] uppercase' : 'bg-red-50 text-red-600 border-none px-3 py-1 font-black text-[9px] uppercase'}>
                      {c.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  // Dummy Chart Data
  const salesData = [
    { name: 'Mon', sales: 400 }, { name: 'Tue', sales: 700 },
    { name: 'Wed', sales: 1200 }, { name: 'Thu', sales: 900 },
    { name: 'Fri', sales: 1500 }, { name: 'Sat', sales: 1800 },
    { name: 'Sun', sales: 1100 },
  ];

  /* Redundant check removed as ProtectedRoute handles it */

  const renderDashboard = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Weekly Sales', value: '₹45,290', trend: '+12%', icon: TrendingUp, color: 'text-violet-600', bg: 'bg-violet-100' },
          { label: 'Pending Orders', value: '18', trend: '5 new', icon: ShoppingCart, color: 'text-amber-600', bg: 'bg-amber-100' },
          { label: 'Total Earnings', value: '₹2,12,800', trend: '+8%', icon: Wallet, color: 'text-emerald-600', bg: 'bg-emerald-100' },
        ].map((stat, i) => (
          <Card key={i} className="border-0 shadow-sm">
            <CardContent className="p-6 flex items-center gap-4">
              <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                <span className="text-xs font-bold text-emerald-600">{stat.trend}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-0 shadow-sm">
          <CardHeader><CardTitle>Sales performance</CardTitle></CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="sales" stroke="#8b5cf6" strokeWidth={3} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="h-24 flex-col gap-2 rounded-2xl border-gray-100" onClick={() => setActiveMenu('products')}>
              <Plus className="w-6 h-6 text-violet-600" />
              <span>Add Product</span>
            </Button>
            <Button variant="outline" className="h-24 flex-col gap-2 rounded-2xl border-gray-100" onClick={() => setActiveMenu('finance')}>
              <DollarSign className="w-6 h-6 text-emerald-600" />
              <span>Withdraw</span>
            </Button>
            <Button variant="outline" className="h-24 flex-col gap-2 rounded-2xl border-gray-100" onClick={() => setActiveMenu('inventory')}>
              <AlertCircle className="w-6 h-6 text-amber-600" />
              <span>Low Stock</span>
            </Button>
            <Button variant="outline" className="h-24 flex-col gap-2 rounded-2xl border-gray-100" onClick={() => setActiveMenu('support')}>
              <MessageSquare className="w-6 h-6 text-indigo-600" />
              <span>Support</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '', category: '', price: '', stock: '', image: '', description: ''
  });

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
      await axios.post(`${API_BASE}/api/products`, {
        ...newProduct,
        price: parseFloat(newProduct.price),
        stock: parseInt(newProduct.stock)
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      alert("Inventory submitted for administrative compliance audit.");
      setShowAddForm(false);
      setNewProduct({ name: '', category: '', price: '', stock: '', image: '', description: '' });
      fetchVendorProducts();
    } catch (e) {
      alert("Inventory submission protocol failed.");
    }
  };

  const renderProducts = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">My Product Catalog</h3>
        <Button className="bg-violet-600 hover:bg-violet-700 rounded-xl" onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="w-4 h-4 mr-2" /> {showAddForm ? 'Cancel' : 'Add New Product'}
        </Button>
      </div>

      {showAddForm && (
        <Card className="border-0 shadow-xl rounded-[2rem] overflow-hidden">
          <CardHeader className="bg-gray-900 text-white">
            <CardTitle className="text-lg font-black uppercase tracking-widest italic">
              New <span className="text-violet-400">Inventory</span> Submission
            </CardTitle>
            <CardDescription className="text-gray-400 text-xs uppercase tracking-widest">
              Products are queued for administrative audit before going live.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-gray-400">Product Name *</Label>
                <Input
                  required
                  placeholder="Premium Wireless Headphones"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="h-12 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-gray-400">Category *</Label>
                <Select onValueChange={(val) => setNewProduct({ ...newProduct, category: val })}>
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Electronics">Electronics</SelectItem>
                    <SelectItem value="Fashion">Fashion</SelectItem>
                    <SelectItem value="Home">Home & Living</SelectItem>
                    <SelectItem value="Beauty">Beauty</SelectItem>
                    <SelectItem value="Sports">Sports</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-gray-400">Price (₹) *</Label>
                <Input
                  required
                  type="number"
                  placeholder="2999"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                  className="h-12 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-gray-400">Initial Stock *</Label>
                <Input
                  required
                  type="number"
                  placeholder="50"
                  value={newProduct.stock}
                  onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                  className="h-12 rounded-xl"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-gray-400">Image URL *</Label>
                <Input
                  required
                  placeholder="https://example.com/product-image.jpg"
                  value={newProduct.image}
                  onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                  className="h-12 rounded-xl"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-gray-400">Description</Label>
                <Textarea
                  placeholder="Describe your product features and specifications..."
                  rows={4}
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <Button type="submit" className="h-12 px-10 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-violet-200">
                  Submit for Audit
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="border-0 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Product</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Stock</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Price</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.map(p => (
                <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg" />
                      <div>
                        <p className="font-bold text-sm text-gray-900">{p.name}</p>
                        <p className="text-xs text-gray-500">{p.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-bold ${p.stock <= 5 ? 'text-red-500' : 'text-gray-600'}`}>
                      {p.stock} units
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold">₹{p.price}</td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <Badge className={`border-none px-3 py-1 font-black text-[9px] uppercase tracking-widest ${p.status === 'approved' ? 'bg-emerald-50 text-emerald-600' :
                        p.status === 'rejected' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                        }`}>
                        {p.status}
                      </Badge>
                      {p.status === 'rejected' && (
                        <p className="text-[10px] text-red-400 font-medium italic max-w-[150px] truncate" title={p.rejection_reason}>
                          {p.rejection_reason}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-violet-600"><Edit className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  const renderInventory = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">Inventory Management</h3>
        <Badge className="bg-red-100 text-red-600 border-none px-3 py-1">2 Items at Low Stock</Badge>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {products.filter(p => p.stock <= 5).map(p => (
          <Card key={p.id} className="border-0 shadow-sm bg-red-50/50 border-l-4 border-red-500">
            <CardContent className="p-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <AlertCircle className="text-red-500" />
                <div>
                  <p className="font-bold text-sm">{p.name}</p>
                  <p className="text-xs text-red-600">Only {p.stock} units left!</p>
                </div>
              </div>
              <Button size="sm" className="bg-red-500 hover:bg-red-600 rounded-lg">Update Stock</Button>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="border-0 shadow-sm p-6">
        <h4 className="font-bold mb-4">Update Stock Quantities</h4>
        <div className="space-y-4">
          {products.map(p => (
            <div key={p.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
              <span className="text-sm font-medium">{p.name}</span>
              <div className="flex items-center gap-3">
                <Input className="w-20 h-9" defaultValue={p.stock} type="number" />
                <Button variant="outline" size="sm">Save</Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const [withdrawals, setWithdrawals] = useState([
    { id: '#WTH-001', amount: '₹15,000', method: 'Bank Transfer', status: 'completed', date: '2026-01-15' },
    { id: '#WTH-002', amount: '₹8,500', method: 'UPI', status: 'pending', date: '2026-01-19' },
  ]);

  const [withdrawAmount, setWithdrawAmount] = useState("");

  const handleWithdraw = (e) => {
    e.preventDefault();
    if (!withdrawAmount) return;
    const newWithdrawal = {
      id: `#WTH-00${withdrawals.length + 1}`,
      amount: `₹${withdrawAmount}`,
      method: 'Bank Transfer',
      status: 'pending',
      date: new Date().toISOString().split('T')[0]
    };
    setWithdrawals([newWithdrawal, ...withdrawals]);
    setWithdrawAmount("");
  };

  const renderFinance = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-8 bg-black text-white border-none shadow-2xl rounded-[2rem] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/20 blur-3xl group-hover:bg-violet-600/40 transition-colors" />
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Available Balance</p>
          <h4 className="text-4xl font-black italic">₹84,200</h4>
          <div className="mt-6 flex items-center gap-2 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
            <TrendingUp className="w-4 h-4" />
            <span>+12.4% vs last week</span>
          </div>
        </Card>
        {[
          { label: 'Gross Revenue', val: '₹4,12,000', icon: CreditCard, color: 'text-violet-600', bg: 'bg-violet-50' },
          { label: 'Zippy Commission (10%)', val: '₹41,200', icon: History, color: 'text-red-500', bg: 'bg-red-50' },
          { label: 'Total Payouts', val: '₹3,70,800', icon: Banknote, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map((item, i) => (
          <Card key={i} className="p-8 border-none shadow-sm flex flex-col justify-between rounded-[2rem] bg-white">
            <div className={`p-3 w-fit rounded-2xl ${item.bg} ${item.color}`}><item.icon className="w-6 h-6" /></div>
            <div className="mt-6">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{item.label}</p>
              <h4 className="text-2xl font-black italic text-gray-900">{item.val}</h4>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-sm rounded-[2.5rem] bg-white overflow-hidden">
          <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-white">
            <h4 className="font-black italic text-xl uppercase tracking-tight">Earnings <span className="text-violet-600">Protocol.</span></h4>
            <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest text-gray-400">View All</Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Order Hash</th>
                  <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Value</th>
                  <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Fee (10%)</th>
                  <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Net</th>
                  <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm italic">
                {[
                  { id: '#TRX-9901', val: '2,500', comm: '250', net: '2,250', status: 'settled' },
                  { id: '#TRX-9902', val: '4,000', comm: '400', net: '3,600', status: 'pending' },
                  { id: '#TRX-9903', val: '1,200', comm: '120', net: '1,080', status: 'settled' },
                ].map(t => (
                  <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-5 font-bold font-mono text-gray-500">{t.id}</td>
                    <td className="px-8 py-5 text-right font-black">₹{t.val}</td>
                    <td className="px-8 py-5 text-right text-red-500 font-bold">-₹{t.comm}</td>
                    <td className="px-8 py-5 text-right font-black text-emerald-600">₹{t.net}</td>
                    <td className="px-8 py-5">
                      <Badge className={t.status === 'settled' ? 'bg-emerald-50 text-emerald-600 border-none' : 'bg-amber-50 text-amber-600 border-none'}>
                        {t.status.toUpperCase()}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="border-none shadow-2xl rounded-[2.5rem] bg-violet-600 p-8 text-white flex flex-col justify-between">
          <div>
            <h4 className="text-2xl font-black italic mb-2">Request <span className="text-violet-200">Withdrawal.</span></h4>
            <p className="text-violet-200 text-xs font-medium leading-relaxed mb-8">Move your locked earnings to your primary bank node instantly.</p>

            <form onSubmit={handleWithdraw} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-violet-200 ml-2">Amount to Unlock (₹)</Label>
                <Input
                  type="number"
                  placeholder="5000"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/30 h-14 rounded-2xl font-black text-xl px-6"
                />
              </div>
              <Button className="w-full h-14 bg-white text-violet-600 hover:bg-violet-50 font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-violet-900/20 active:scale-95 transition-all">
                Initiate Transfer
              </Button>
            </form>
          </div>

          <div className="mt-8 pt-8 border-t border-white/10 flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-violet-200" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase">Secure Protocol</p>
              <p className="text-[10px] text-violet-200 uppercase font-bold tracking-tighter">Verified by Zippy Finance Node</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="border-none shadow-sm rounded-[2.5rem] bg-white overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex items-center justify-between">
          <h4 className="font-black italic text-xl uppercase tracking-tight">Withdrawal <span className="text-violet-600">History.</span></h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">W/D Reference</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Timestamp</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Method</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Amount</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {withdrawals.map(w => (
                <tr key={w.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-8 py-5 font-bold font-mono text-gray-400 text-xs">{w.id}</td>
                  <td className="px-8 py-5 text-xs font-bold text-gray-900">{w.date}</td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-violet-500" />
                      <span className="text-xs font-black uppercase tracking-tighter">{w.method}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right font-black italic text-lg">{w.amount}</td>
                  <td className="px-8 py-5">
                    <Badge className={w.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-none' : 'bg-blue-50 text-blue-600 border-none'}>
                      {w.status.toUpperCase()}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">Store Settings</h3>
        <Button className="bg-violet-600 hover:bg-violet-700 rounded-xl">Save Store Profile</Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-0 shadow-sm">
          <CardHeader><CardTitle>Business Profile</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Store Name</Label>
                <Input defaultValue={user?.business_name} />
              </div>
              <div className="space-y-2">
                <Label>Owner Name</Label>
                <Input defaultValue={user?.owner_name} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Store Description</Label>
              <Textarea placeholder="Tell customers about your store..." rows={4} />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardHeader><CardTitle>Branding</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>Store Logo</Label>
              <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center border-2 border-dashed">
                <Image className="text-gray-400" />
              </div>
              <Button variant="outline" size="sm">Upload Logo</Button>
            </div>
            <div className="space-y-3">
              <Label>Store Banner</Label>
              <div className="w-full h-24 bg-gray-100 rounded-2xl flex items-center justify-center border-2 border-dashed">
                <Image className="text-gray-400" />
              </div>
              <Button variant="outline" size="sm">Upload Banner</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderOrders = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">Manage Orders</h3>
        <div className="flex gap-2">
          <Badge className="bg-blue-100 text-blue-700">12 New</Badge>
          <Badge className="bg-amber-100 text-amber-700">5 Shipping</Badge>
        </div>
      </div>
      <Card className="border-0 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Order ID</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm">
              {[
                { id: '#ORD-7721', name: 'John Doe', amt: '₹1,200', status: 'processing' },
                { id: '#ORD-7722', name: 'Jane Smith', amt: '₹4,500', status: 'shipped' },
              ].map(o => (
                <tr key={o.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4 font-bold">{o.id}</td>
                  <td className="px-6 py-4">{o.name}</td>
                  <td className="px-6 py-4 font-bold">{o.amt}</td>
                  <td className="px-6 py-4">
                    <Select defaultValue={o.status}>
                      <SelectTrigger className="w-32 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="sm">Details</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  const [replyingTo, setReplyingTo] = useState(null);
  const [vendorReply, setVendorReply] = useState('');

  const handleReplySubmit = (id) => {
    alert(`Official response for Review ID ${id} has been authenticated and synchronized.`);
    setReplyingTo(null);
    setVendorReply('');
  };

  const renderReviews = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div>
          <h3 className="text-3xl font-black italic">Customer <span className="text-violet-600">Voice.</span></h3>
          <p className="text-gray-500 font-medium mt-1">Monitor sentiment and authenticate official merchant responses.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-emerald-50 px-6 py-4 rounded-2xl border border-emerald-100">
            <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Satisfaction</p>
            <p className="text-xl font-black text-emerald-600 italic">4.8 / 5.0</p>
          </div>
          <div className="bg-slate-50 px-6 py-4 rounded-2xl border border-slate-100">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Response Rate</p>
            <p className="text-xl font-black text-slate-900 italic">94%</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {reviews.map(r => (
          <Card key={r.id} className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden group">
            <CardContent className="p-10">
              <div className="flex flex-col md:flex-row gap-10">
                <div className="md:w-1/4 flex flex-col items-center md:items-start text-center md:text-left space-y-4">
                  <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-xl group-hover:bg-violet-600 transition-colors">
                    {r.user[0]}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 uppercase tracking-tight">{r.user}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{r.date}</p>
                  </div>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                    ))}
                  </div>
                </div>

                <div className="flex-1 space-y-6">
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 relative">
                    <div className="absolute -left-2 top-6 w-4 h-4 bg-slate-50 border-l border-b border-slate-100 rotate-45 hidden md:block" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <Box className="w-3 h-3" /> Subject: {r.product}
                    </p>
                    <p className="text-slate-700 font-medium italic text-lg leading-relaxed">
                      &ldquo;{r.comment}&rdquo;
                    </p>
                  </div>

                  {replyingTo === r.id ? (
                    <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                      <Textarea
                        placeholder="Draft your official merchant response..."
                        className="min-h-[120px] rounded-2xl border-2 border-violet-100 focus:border-violet-300 font-medium"
                        value={vendorReply}
                        onChange={(e) => setVendorReply(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleReplySubmit(r.id)}
                          className="bg-slate-900 text-white rounded-xl px-8 h-12 font-black uppercase text-[10px] tracking-widest hover:bg-violet-600 shadow-lg"
                        >
                          Authenticate Response
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => setReplyingTo(null)}
                          className="rounded-xl px-6 h-12 font-black uppercase text-[10px] text-slate-400"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      onClick={() => setReplyingTo(r.id)}
                      className="h-12 px-8 bg-white border-2 border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-900 hover:border-violet-600 hover:text-violet-600 transition-all group"
                    >
                      Initialize Response <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeMenu) {
      case 'dashboard': return renderDashboard();
      case 'products': return renderProducts();
      case 'orders': return renderOrders();
      case 'inventory': return renderInventory();
      case 'finance': return renderFinance();
      case 'reviews': return renderReviews();
      case 'coupons': return renderCoupons();
      case 'settings': return renderSettings();
      default: return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-violet-50 rounded-full flex items-center justify-center mb-4">
            <Settings className="w-8 h-8 text-violet-300" />
          </div>
          <h3 className="text-lg font-bold">Module Under Construction</h3>
          <p className="text-gray-500 text-sm mt-2">We're building the {activeMenu} interface for you.</p>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      <Navigation />
      <div className="flex-1 pt-20">
        <div className="flex min-h-[calc(100vh-80px)]">
          {/* Sidebar */}
          <aside className="w-72 bg-white border-r border-slate-200 sticky top-20 h-[calc(100vh-80px)] p-6">
            <div className="flex items-center gap-3 mb-8 px-2">
              <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
                <Store className="text-white w-6 h-6" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 leading-tight">Seller Hub</h2>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black">Vendor Access</p>
              </div>
            </div>

            <nav className="space-y-1">
              {menuItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveMenu(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${activeMenu === item.id
                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-200'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                >
                  <item.icon className={`w-5 h-5 ${activeMenu === item.id ? 'text-white' : 'text-slate-400'}`} />
                  <span className="text-sm font-bold">{item.label}</span>
                  {item.id === 'inventory' && products.some(p => p.stock <= 5) && (
                    <div className="ml-auto w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  )}
                </button>
              ))}
            </nav>

            <div className="absolute bottom-6 left-6 right-6">
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors bg-white font-bold text-sm"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-8 overflow-y-auto bg-slate-50/50">
            <header className="mb-10 flex justify-between items-end">
              <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                  {menuItems.find(m => m.id === activeMenu)?.label}
                </h1>
                <p className="text-slate-500 font-medium mt-1">Hello, {user?.owner_name || 'Partner'}. Welcome back to your hub.</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="rounded-xl border-slate-200 bg-white">
                  <Bell className="w-4 h-4 text-slate-400" />
                </Button>
                <div className="flex items-center gap-3 bg-white p-1 pr-4 rounded-xl border border-slate-200 shadow-sm">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-black">
                    {user?.owner_name?.[0] || 'V'}
                  </div>
                  <span className="text-xs font-black text-slate-600 uppercase tracking-tighter">{user?.business_name || 'Store'}</span>
                </div>
              </div>
            </header>

            {renderContent()}
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
};

// Missing Store icon from import fix
const Store = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
    <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
    <path d="M2 7h20" />
    <path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7" />
  </svg>
);

export default Vendor;