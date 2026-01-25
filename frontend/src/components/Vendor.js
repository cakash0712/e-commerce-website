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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import {
  Package, Plus, Edit, Trash2, Eye, Upload, Star, ShoppingCart,
  TrendingUp, LayoutDashboard, DollarSign, User, LogOut,
  Box, Wallet, History, CreditCard, Banknote, MessageSquare,
  Settings, Image, FileText, CheckCircle2, AlertCircle,
  XCircle, Search, Bell, MoreVertical, Globe, ShieldCheck,
  ChevronRight, ChevronDown, Tag, UserCheck, Store, Mail, MapPin, Phone,
  RotateCcw, LifeBuoy, BookOpen, Headset, Send
} from "lucide-react";
import { useAuth } from "../App";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import * as XLSX from 'xlsx';

const Vendor = () => {
  const { user, updateUser, logout } = useAuth();
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [activeSubMenu, setActiveSubMenu] = useState("overview");

  // State for products and data
  const [products, setProducts] = useState([]);
  const [vendorOrders, setVendorOrders] = useState([]);

  useEffect(() => {
    fetchVendorProducts();
    fetchVendorOrders();
    fetchVendorFinance();
    fetchSupportTickets();
    fetchVendorCoupons();
    fetchVendorReviews();
  }, []);

  useEffect(() => {
    setStoreSettings({
      business_name: user?.business_name || '',
      owner_name: user?.owner_name || '',
      address: user?.address || '',
      phone: user?.phone || '',
      email: user?.email || '',
      logo: user?.logo || '',
      banner: user?.banner || '',
      business_category: user?.business_category || ''
    });
  }, [user]);

  const [financeData, setFinanceData] = useState({
    available_balance: 0,
    gross_revenue: 0,
    total_commission: 0,
    total_payouts: 0,
    earnings_protocol: [],
    withdrawals: []
  });

  const fetchVendorFinance = async () => {
    try {
      const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
      const response = await axios.get(`${API_BASE}/api/vendor/finance`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setFinanceData(response.data);
    } catch (e) {
      console.error("Failed to sync vendor finance:", e);
    }
  };

  const fetchVendorOrders = async () => {
    try {
      const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
      const response = await axios.get(`${API_BASE}/api/vendor/orders`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setVendorOrders(response.data);
    } catch (e) {
      console.error("Failed to sync vendor orders:", e);
    }
  };

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

  const [reviews, setReviews] = useState([]);

  // Profile Edit State
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [isEditingBusiness, setIsEditingBusiness] = useState(false);
  const [tempAddress, setTempAddress] = useState(user?.address || "");

  // Support Tickets State
  const [supportTickets, setSupportTickets] = useState([]);
  const [newTicket, setNewTicket] = useState({ subject: '', order_id: '', message: '' });

  const fetchSupportTickets = async () => {
    try {
      const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
      const response = await axios.get(`${API_BASE}/api/vendor/support/tickets`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSupportTickets(response.data);
    } catch (e) {
      console.error("Failed to fetch support tickets:", e);
    }
  };

  const fetchVendorCoupons = async () => {
    try {
      const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
      const response = await axios.get(`${API_BASE}/api/vendor/coupons`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setVendorCoupons(response.data);
    } catch (e) {
      console.error("Failed to fetch coupons:", e);
    }
  };

  const fetchVendorReviews = async () => {
    try {
      const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
      const response = await axios.get(`${API_BASE}/api/vendor/reviews`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setReviews(response.data);
    } catch (e) {
      console.error("Failed to fetch reviews:", e);
    }
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();

    // Validation
    if (!newCoupon.code || !newCoupon.discount || !newCoupon.limit || !newCoupon.expires) {
      alert("Please fill in all required fields.");
      return;
    }

    const limit = parseInt(newCoupon.limit);
    if (isNaN(limit) || limit <= 0) {
      alert("Please enter a valid usage limit.");
      return;
    }

    try {
      const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
      const payload = {
        code: newCoupon.code.trim(),
        discount: newCoupon.discount.trim(),
        limit: limit,
        expires: newCoupon.expires
      };
      await axios.post(`${API_BASE}/api/vendor/coupons`, payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      alert("Coupon created successfully.");
      setShowCreateCoupon(false);
      setNewCoupon({ code: '', discount: '', limit: '', expires: '' });
      fetchVendorCoupons();
    } catch (e) {
      console.error("Failed to create coupon:", e.response?.data || e.message);
      alert(`Failed to create coupon: ${e.response?.data?.detail || e.message}`);
    }
  };

  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    try {
      const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
      await axios.put(`${API_BASE}/api/vendor/profile`, storeSettings, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      alert("Store settings updated successfully.");
      await updateUser(user.id, storeSettings);
    } catch (e) {
      console.error("Failed to update settings:", e.response?.data || e.message);
      alert(`Failed to update settings: ${e.response?.data?.detail || e.message}`);
    }
  };

  const handleUpdateAddress = async () => {
    try {
      await updateUser(user.id, { address: tempAddress });
      setIsEditingAddress(false);
      alert("Address updated successfully.");
    } catch (e) {
      console.error("Failed to update address:", e);
      alert("Failed to update address.");
    }
  };

  const handleSendTicket = async (e) => {
    e.preventDefault();
    if (!newTicket.subject || !newTicket.message) return;
    try {
      const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
      await axios.post(`${API_BASE}/api/vendor/support/tickets`, newTicket, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      alert("Your message has been sent to the Admin team.");
      setNewTicket({ subject: '', order_id: '', message: '' });
      fetchSupportTickets();
    } catch (e) {
      console.error("Failed to send ticket:", e);
      alert("Failed to send message.");
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
      const response = await axios.post(`${API_BASE}/api/upload/image`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setNewProduct({ ...newProduct, image: response.data.image_url });
      alert("Image uploaded successfully!");
    } catch (error) {
      console.error("Failed to upload image:", error);
      alert("Failed to upload image. Please try again.");
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
      const response = await axios.post(`${API_BASE}/api/upload/image`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      // Update user profile (this also updates the backend)
      const userId = user?.id || localStorage.getItem('user_data') && JSON.parse(localStorage.getItem('user_data'))?.id;
      await updateUser(userId, { avatar: response.data.image_url });
      alert("Avatar uploaded successfully!");
    } catch (error) {
      console.error("Failed to upload avatar:", error);
      alert("Failed to upload avatar. Please try again.");
    }
  };

  const handleBannerUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
      const response = await axios.post(`${API_BASE}/api/upload/image`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      // Update user profile (this also updates the backend)
      const userId = user?.id || localStorage.getItem('user_data') && JSON.parse(localStorage.getItem('user_data'))?.id;
      await updateUser(userId, { banner: response.data.image_url });
      alert("Banner uploaded successfully!");
    } catch (error) {
      console.error("Failed to upload banner:", error);
      alert("Failed to upload banner. Please try again.");
    }
  };

  const exportEarningsToXLSX = () => {
    if (financeData.earnings_protocol.length === 0) {
      alert("No earnings data to export.");
      return;
    }

    // Prepare data for export
    const exportData = financeData.earnings_protocol.map(earning => ({
      'Order ID': earning.id,
      'Date': new Date(earning.date).toLocaleDateString(),
      'Gross Amount (₹)': earning.val,
      'Net Amount (₹)': earning.net,
      'Status': earning.status
    }));

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);

    // Add summary row
    const summaryRow = [
      'Summary',
      '',
      `Total Gross: ₹${financeData.gross_revenue.toLocaleString()}`,
      `Total Net: ₹${(financeData.gross_revenue - financeData.total_commission).toLocaleString()}`,
      `Total Commission: ₹${financeData.total_commission.toLocaleString()}`
    ];
    XLSX.utils.sheet_add_aoa(ws, [summaryRow], { origin: -1 });

    // Auto-size columns
    const colWidths = [
      { wch: 15 }, // Order ID
      { wch: 12 }, // Date
      { wch: 18 }, // Gross Amount
      { wch: 15 }, // Net Amount
      { wch: 10 }  // Status
    ];
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, 'Earnings Report');

    // Generate filename with current date
    const fileName = `earnings_report_${new Date().toISOString().split('T')[0]}.xlsx`;

    // Save file
    XLSX.writeFile(wb, fileName);
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Product Management', icon: Package },
    { id: 'orders', label: 'Order Management', icon: ShoppingCart },
    { id: 'inventory', label: 'Inventory', icon: Box },
    { id: 'finance', label: 'Earnings & Payouts', icon: DollarSign },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'coupons', label: 'Marketing & Coupons', icon: Tag },
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'support', label: 'Support', icon: MessageSquare },
  ];

  const [vendorCoupons, setVendorCoupons] = useState([]);
  const [showCreateCoupon, setShowCreateCoupon] = useState(false);
  const [newCoupon, setNewCoupon] = useState({ code: '', discount: '', limit: '', expires: '' });
  const [storeSettings, setStoreSettings] = useState({
    business_name: user?.business_name || '',
    owner_name: user?.owner_name || '',
    address: user?.address || '',
    phone: user?.phone || '',
    email: user?.email || '',
    logo: user?.logo || '',
    banner: user?.banner || '',
    business_category: user?.business_category || ''
  });

  // Dialog states
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);


  const renderCoupons = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center bg-white p-8 rounded-[2rem] shadow-sm">
        <div>
          <h3 className="text-3xl font-black italic">Manage <span className="text-violet-600">Coupons.</span></h3>
          <p className="text-gray-500 font-medium">Create and manage discount codes for your customers.</p>
        </div>
        <Button onClick={() => setShowCreateCoupon(true)} className="h-14 bg-violet-600 hover:bg-black text-white rounded-2xl font-black uppercase text-[10px] tracking-widest px-8 shadow-xl shadow-violet-200 transition-colors">
          <Plus className="w-4 h-4 mr-2" /> Create New Code
        </Button>
      </div>

      {showCreateCoupon && (
        <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white animate-in zoom-in-95 duration-500">
          <CardHeader className="bg-slate-900 text-white p-8">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl font-black uppercase tracking-tighter italic">
                  Create New Coupon
                </CardTitle>
                <CardDescription className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-2">
                  Set up a discount code for your customers.
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                onClick={() => { setShowCreateCoupon(false); setNewCoupon({ code: '', discount: '', limit: '', expires: '' }); }}
                className="text-slate-400 hover:text-white"
              >
                Cancel
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-10">
            <form onSubmit={handleCreateCoupon} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Coupon Code *</Label>
                  <Input
                    required
                    placeholder="SUMMER10"
                    value={newCoupon.code}
                    onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })}
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Discount *</Label>
                  <Input
                    required
                    placeholder="10% or ₹100"
                    value={newCoupon.discount}
                    onChange={(e) => setNewCoupon({ ...newCoupon, discount: e.target.value })}
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Usage Limit *</Label>
                  <Input
                    required
                    type="number"
                    placeholder="100"
                    value={newCoupon.limit}
                    onChange={(e) => setNewCoupon({ ...newCoupon, limit: e.target.value })}
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Expires *</Label>
                  <Input
                    required
                    type="date"
                    value={newCoupon.expires}
                    onChange={(e) => setNewCoupon({ ...newCoupon, expires: e.target.value })}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-black uppercase text-sm tracking-widest py-3">
                Create Coupon
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {(() => {
          const activeCodes = vendorCoupons.filter(c => c.status === 'active').length;
          const totalClaims = vendorCoupons.reduce((acc, c) => acc + c.usage, 0);
          const revenueSaved = '₹0'; // placeholder
          const avgDiscount = vendorCoupons.length > 0 ? (vendorCoupons.reduce((acc, c) => {
            const disc = c.discount;
            if (disc.endsWith('%')) {
              return acc + parseFloat(disc);
            }
            return acc;
          }, 0) / vendorCoupons.length).toFixed(1) + '%' : '0%';
          return [
            { label: 'Active Codes', val: activeCodes.toString(), icon: Tag, color: 'text-violet-600', bg: 'bg-violet-50' },
            { label: 'Total Claims', val: totalClaims.toString(), icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Revenue Saved', val: revenueSaved, icon: DollarSign, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Avg. Discount', val: avgDiscount, icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          ];
        })().map((stat, i) => (
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

  // Chart Data - will be fetched from backend
  const [salesData, setSalesData] = useState([]);

  /* Redundant check removed as ProtectedRoute handles it */

  const renderDashboard = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Products', value: products.length, trend: 'Products', icon: Package, color: 'text-violet-600', bg: 'bg-violet-100' },
          { label: 'Low Stock Items', value: products.filter(p => p.stock <= 5).length, trend: 'Check Stock', icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-100' },
          { label: 'Total Stock Value', value: `₹${products.reduce((acc, p) => acc + (p.price * p.stock), 0).toLocaleString()}`, trend: 'Value', icon: Wallet, color: 'text-emerald-600', bg: 'bg-emerald-100' },
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
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: '', category: '', price: '', stock: '', image: '', description: '',
    brand: '', discount: '', colors: '', weight: '', dimensions: '', material: '', offers: '',
    images: '', highlights: '', specifications: '', warranty: '', box_contents: ''
  });

  const handleEditInitiate = (product) => {
    setEditingProduct(product.id);
    setNewProduct({
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      stock: product.stock.toString(),
      image: product.image,
      images: (product.images || []).join(', '),
      description: product.description || '',
      highlights: (product.highlights || []).join('\n'),
      specifications: product.specifications ? Object.entries(product.specifications).map(([k, v]) => `${k}:${v}`).join('\n') : '',
      warranty: product.warranty || '',
      box_contents: product.box_contents || '',
      brand: product.brand || '',
      discount: (product.discount || 0).toString(),
      colors: (product.colors || []).join(', '),
      weight: product.weight || '',
      dimensions: product.dimensions || '',
      material: product.material || '',
      offers: product.offers || ''
    });
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    try {
      const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
      await axios.delete(`${API_BASE}/api/products/${productToDelete}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setShowDeleteDialog(false);
      setProductToDelete(null);
      fetchVendorProducts();
    } catch (e) {
      console.error("Delete Product Error:", e);
      setShowDeleteDialog(false);
      setProductToDelete(null);
    }
  };

  const confirmDeleteProduct = (productId) => {
    setProductToDelete(productId);
    setShowDeleteDialog(true);
  };

  const [errors, setErrors] = useState({});

  const handleAddProduct = async (e) => {
    e.preventDefault();

    // Validation Protocol
    const newErrors = {};
    if (!newProduct.name) newErrors.name = "Product Name is required";
    if (!newProduct.category) newErrors.category = "Category is required";
    if (!newProduct.price) newErrors.price = "Price is required";
    if (!newProduct.stock) newErrors.stock = "Stock is required";
    if (!newProduct.description) newErrors.description = "Description is required";
    if (!newProduct.image) newErrors.image = "Main Image is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      alert("Please fill in all required fields marked with *");
      return;
    }
    setErrors({}); // Clear errors if validation passes

    try {
      const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
      const specObj = {};
      if (newProduct.specifications) {
        newProduct.specifications.split('\n').forEach(line => {
          const [key, value] = line.split(':');
          if (key && value) specObj[key.trim()] = value.trim();
        });
      }

      const payload = {
        ...newProduct,
        price: parseFloat(newProduct.price),
        stock: parseInt(newProduct.stock),
        discount: parseInt(newProduct.discount || 0),
        colors: newProduct.colors.split(',').map(c => c.trim()).filter(c => c),
        images: newProduct.images.split(',').map(c => c.trim()).filter(c => c),
        highlights: newProduct.highlights.split('\n').map(c => c.trim()).filter(c => c),
        specifications: specObj,
        offers: newProduct.offers
      };

      if (editingProduct) {
        await axios.put(`${API_BASE}/api/products/${editingProduct}`, payload, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        alert("Product updated. Admin will review the changes soon.");
      } else {
        await axios.post(`${API_BASE}/api/products`, payload, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        alert("Product submitted for admin review.");
      }

      setShowAddForm(false);
      setEditingProduct(null);
      setNewProduct({
        name: '', category: '', price: '', stock: '', image: '', description: '',
        brand: '', discount: '', colors: '', weight: '', dimensions: '', material: '', offers: '',
        images: '', highlights: '', specifications: '', warranty: '', box_contents: ''
      });
      fetchVendorProducts();
    } catch (e) {
      console.error("Product Action Error:", e.response ? e.response.data : e.message);
      alert(`Operation failed: ${e.response?.data?.detail || e.message}`);
    }
  };

  const handleUpdateStock = async (productId, newStock) => {
    try {
      const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
      await axios.patch(`${API_BASE}/api/products/${productId}/stock`,
        { stock: parseInt(newStock) },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      alert("Inventory protocol synchronized: Stock levels updated.");
      fetchVendorProducts();
    } catch (e) {
      console.error("Stock Update Error:", e.response?.data || e.message);
      alert(`Failed to synchronize inventory levels: ${e.response?.data?.detail || e.message}`);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
      await axios.patch(`${API_BASE}/api/vendor/orders/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      alert("Logistics status updated and broadcasted to network.");
      fetchVendorOrders();
    } catch (e) {
      console.error("Order Status Update Error:", e);
      alert("Failed to update status protocol.");
    }
  };

  const renderProducts = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">My Product Catalog</h3>
        <Button className="bg-violet-600 hover:bg-violet-700 rounded-xl" onClick={() => {
          if (showAddForm) {
            setShowAddForm(false);
            setEditingProduct(null);
            setNewProduct({
              name: '', category: '', price: '', stock: '', image: '', description: '',
              brand: '', discount: '', colors: '', weight: '', dimensions: '', material: '', offers: ''
            });
          } else {
            setShowAddForm(true);
          }
        }}>
          <Plus className="w-4 h-4 mr-2" /> {showAddForm ? 'Cancel' : 'Add New Product'}
        </Button>
      </div>

      {showAddForm && (
        <Card className="border-0 shadow-2xl rounded-[2.5rem] overflow-hidden bg-white animate-in zoom-in-95 duration-500">
          <CardHeader className="bg-slate-900 text-white p-8">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl font-black uppercase tracking-tighter italic">
                  {editingProduct ? 'Edit' : 'Add'} <span className="text-violet-400">{editingProduct ? 'Product' : 'New Product'}</span>
                </CardTitle>
                <CardDescription className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-2">
                  Admin will review your product before it goes live.
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                onClick={() => { setShowAddForm(false); setEditingProduct(null); }}
                className="text-slate-400 hover:text-white"
              >
                Cancel
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <form onSubmit={handleAddProduct}>
              <Tabs defaultValue="essential" className="w-full">
                <TabsList className="w-full justify-start h-16 bg-slate-50 border-b border-slate-100 rounded-none p-0">
                  <TabsTrigger value="essential" className="h-full px-8 rounded-none border-b-2 border-transparent data-[state=active]:border-violet-600 data-[state=active]:bg-white font-black text-[10px] uppercase tracking-widest transition-all">01. Basic Info</TabsTrigger>
                  <TabsTrigger value="fiscal" className="h-full px-8 rounded-none border-b-2 border-transparent data-[state=active]:border-violet-600 data-[state=active]:bg-white font-black text-[10px] uppercase tracking-widest transition-all">02. Price & Stock</TabsTrigger>
                  <TabsTrigger value="media" className="h-full px-8 rounded-none border-b-2 border-transparent data-[state=active]:border-violet-600 data-[state=active]:bg-white font-black text-[10px] uppercase tracking-widest transition-all">03. Photos</TabsTrigger>
                  <TabsTrigger value="specifications" className="h-full px-8 rounded-none border-b-2 border-transparent data-[state=active]:border-violet-600 data-[state=active]:bg-white font-black text-[10px] uppercase tracking-widest transition-all">04. More Details</TabsTrigger>
                </TabsList>

                <div className="p-10">
                  <TabsContent value="essential" className="mt-0 space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Product Name *</Label>
                        <Input
                          required
                          placeholder="Titanium Grade-5 Mechanical Watch"
                          value={newProduct.name}
                          onChange={(e) => {
                            setNewProduct({ ...newProduct, name: e.target.value });
                            if (errors.name) setErrors({ ...errors, name: null });
                          }}
                          className={`h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all font-bold ${errors.name ? 'border-red-500 bg-red-50/10' : ''}`}
                        />
                        {errors.name && <span className="text-red-500 text-[10px] uppercase font-bold tracking-wider ml-2 animate-pulse">{errors.name}</span>}
                      </div>
                      <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Brand Name</Label>
                        <Input
                          placeholder="e.g. Sony, Apple, Nike"
                          value={newProduct.brand}
                          onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                          className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all font-bold"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Category *</Label>
                        <Select onValueChange={(val) => {
                          setNewProduct({ ...newProduct, category: val });
                          if (errors.category) setErrors({ ...errors, category: null });
                        }} defaultValue={newProduct.category}>
                          <SelectTrigger className={`h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white font-bold ${errors.category ? 'border-red-500 bg-red-50/10' : ''}`}>
                            <SelectValue placeholder="Select Category" />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl border-none shadow-2xl">
                            {["Electronics", "Fashion", "Home", "Beauty", "Sports", "Toys", "Health", "Grocery", "Office", "Automotive", "Books", "VideoGames", "PetSupplies", "Tools"].map(cat => (
                              <SelectItem key={cat} value={cat} className="font-bold text-xs">{cat}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.category && <span className="text-red-500 text-[10px] uppercase font-bold tracking-wider ml-2 animate-pulse">{errors.category}</span>}
                      </div>
                      <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Primary Material Base</Label>
                        <Input
                          placeholder="e.g. Brushed Steel, Organic Cotton"
                          value={newProduct.material}
                          onChange={(e) => setNewProduct({ ...newProduct, material: e.target.value })}
                          className="h-14 rounded-2xl border-slate-100 font-bold"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Available Palette / Colors</Label>
                        <Input
                          placeholder="e.g. Midnight Black, Crimson Red, Silver"
                          value={newProduct.colors}
                          onChange={(e) => setNewProduct({ ...newProduct, colors: e.target.value })}
                          className="h-14 rounded-2xl border-slate-100 font-bold"
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Description *</Label>
                      <Textarea
                        required
                        placeholder="Detailed technical and aesthetic overview of the product..."
                        rows={5}
                        value={newProduct.description}
                        onChange={(e) => {
                          setNewProduct({ ...newProduct, description: e.target.value });
                          if (errors.description) setErrors({ ...errors, description: null });
                        }}
                        className={`rounded-[2rem] border-slate-100 bg-slate-50/50 focus:bg-white font-medium p-6 ${errors.description ? 'border-red-500 bg-red-50/10' : ''}`}
                      />
                      {errors.description && <span className="text-red-500 text-[10px] uppercase font-bold tracking-wider ml-2 animate-pulse">{errors.description}</span>}
                    </div>
                  </TabsContent>

                  <TabsContent value="fiscal" className="mt-0 space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Price (₹) *</Label>
                        <div className="relative">
                          <Input
                            required
                            type="number"
                            placeholder="0.00"
                            value={newProduct.price}
                            onChange={(e) => {
                              setNewProduct({ ...newProduct, price: e.target.value });
                              if (errors.price) setErrors({ ...errors, price: null });
                            }}
                            className={`h-14 rounded-2xl border-slate-100 font-black text-xl pl-10 ${errors.price ? 'border-red-500 bg-red-50/10' : ''}`}
                          />
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 font-black">₹</span>
                        </div>
                        {errors.price && <span className="text-red-500 text-[10px] uppercase font-bold tracking-wider ml-2 animate-pulse">{errors.price}</span>}
                      </div>
                      <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Discount (%)</Label>
                        <Input
                          type="number"
                          placeholder="0"
                          max="100"
                          value={newProduct.discount}
                          onChange={(e) => setNewProduct({ ...newProduct, discount: e.target.value })}
                          className="h-14 rounded-2xl border-slate-100 font-black text-xl"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Items in Stock *</Label>
                        <Input
                          required
                          type="number"
                          placeholder="100"
                          value={newProduct.stock}
                          onChange={(e) => {
                            setNewProduct({ ...newProduct, stock: e.target.value });
                            if (errors.stock) setErrors({ ...errors, stock: null });
                          }}
                          className={`h-14 rounded-2xl border-slate-100 font-black text-xl ${errors.stock ? 'border-red-500 bg-red-50/10' : ''}`}
                        />
                        {errors.stock && <span className="text-red-500 text-[10px] uppercase font-bold tracking-wider ml-2 animate-pulse">{errors.stock}</span>}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Special Offers</Label>
                      <Input
                        placeholder="e.g. Buy 1 Get 1, Use code FIRST50 for 50% extra credit"
                        value={newProduct.offers}
                        onChange={(e) => setNewProduct({ ...newProduct, offers: e.target.value })}
                        className="h-14 rounded-2xl border-slate-100 font-bold"
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="media" className="mt-0 space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Main Image *</Label>
                      <div className="space-y-4">
                        <div className="flex gap-4">
                          <Input
                            required={!newProduct.image}
                            placeholder="https://cdn.zippycart.com/products/master-node.jpg"
                            value={newProduct.image}
                            onChange={(e) => {
                              setNewProduct({ ...newProduct, image: e.target.value });
                              if (errors.image) setErrors({ ...errors, image: null });
                            }}
                            className={`h-14 rounded-2xl border-slate-100 font-bold flex-1 ${errors.image ? 'border-red-500 bg-red-50/10' : ''}`}
                          />
                          <div className={`w-14 h-14 bg-slate-50 border border-dashed rounded-2xl flex items-center justify-center overflow-hidden ${errors.image ? 'border-red-500' : ''}`}>
                            {newProduct.image ? (
                              <img
                                src={newProduct.image}
                                alt="Product preview"
                                className="w-full h-full object-cover rounded-2xl"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            ) : (
                              <Image className="w-5 h-5 text-slate-300" />
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Label htmlFor="image-upload" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Or Upload Image:</Label>
                          <Input
                            id="image-upload"
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              handleImageUpload(e);
                              if (errors.image) setErrors({ ...errors, image: null });
                            }}
                            className="h-10 rounded-xl border-slate-100 font-medium flex-1"
                          />
                        </div>
                        {errors.image && <span className="text-red-500 text-[10px] uppercase font-bold tracking-wider ml-2 animate-pulse">{errors.image}</span>}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Additional Images (comma separated URLs)</Label>
                      <Textarea
                        placeholder="https://img1.jpg, https://img2.jpg, https://img3.jpg"
                        rows={3}
                        value={newProduct.images}
                        onChange={(e) => setNewProduct({ ...newProduct, images: e.target.value })}
                        className="rounded-2xl border-slate-100 font-medium"
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="specifications" className="mt-0 space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Dynamic Fields Based on Category */}
                      {(newProduct.category === "Fashion" || newProduct.category === "Apparel") && (
                        <>
                          <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Size / Fit</Label>
                            <Input placeholder="e.g. S, M, L, XL, Regular Fit" value={newProduct.dimensions} onChange={(e) => setNewProduct({ ...newProduct, dimensions: e.target.value })} className="h-12 rounded-xl border-slate-100 font-bold" />
                          </div>
                          <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Fabric / Material</Label>
                            <Input placeholder="e.g. 100% Cotton, Denim" value={newProduct.material} onChange={(e) => setNewProduct({ ...newProduct, material: e.target.value })} className="h-12 rounded-xl border-slate-100 font-bold" />
                          </div>
                          <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Gender / Target</Label>
                            <Input placeholder="e.g. Men, Women, Unisex, Kids" value={newProduct.weight} onChange={(e) => setNewProduct({ ...newProduct, weight: e.target.value })} className="h-12 rounded-xl border-slate-100 font-bold" />
                          </div>
                          <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Care Instructions</Label>
                            <Input placeholder="e.g. Machine Wash Cold" value={newProduct.box_contents} onChange={(e) => setNewProduct({ ...newProduct, box_contents: e.target.value })} className="h-12 rounded-xl border-slate-100 font-bold" />
                          </div>
                        </>
                      )}

                      {(newProduct.category === "Grocery" || newProduct.category === "Beauty" || newProduct.category === "Health") && (
                        <>
                          <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Expiry Date / Best Before</Label>
                            <Input placeholder="e.g. 12 Months from Mfg" value={newProduct.warranty} onChange={(e) => setNewProduct({ ...newProduct, warranty: e.target.value })} className="h-12 rounded-xl border-slate-100 font-bold" />
                          </div>
                          <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Ingredients</Label>
                            <Input placeholder="e.g. Aloe Vera, Vitamin E" value={newProduct.material} onChange={(e) => setNewProduct({ ...newProduct, material: e.target.value })} className="h-12 rounded-xl border-slate-100 font-bold" />
                          </div>
                          <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Net Weight / Volume</Label>
                            <Input placeholder="e.g. 500g, 200ml" value={newProduct.weight} onChange={(e) => setNewProduct({ ...newProduct, weight: e.target.value })} className="h-12 rounded-xl border-slate-100 font-bold" />
                          </div>
                          <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Storage Instructions</Label>
                            <Input placeholder="e.g. Cool & Dry Place" value={newProduct.box_contents} onChange={(e) => setNewProduct({ ...newProduct, box_contents: e.target.value })} className="h-12 rounded-xl border-slate-100 font-bold" />
                          </div>
                        </>
                      )}

                      {(newProduct.category === "Books") && (
                        <>
                          <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Author</Label>
                            <Input placeholder="e.g. J.K. Rowling" value={newProduct.material} onChange={(e) => setNewProduct({ ...newProduct, material: e.target.value })} className="h-12 rounded-xl border-slate-100 font-bold" />
                          </div>
                          <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Publisher</Label>
                            <Input placeholder="e.g. Penguin Books" value={newProduct.warranty} onChange={(e) => setNewProduct({ ...newProduct, warranty: e.target.value })} className="h-12 rounded-xl border-slate-100 font-bold" />
                          </div>
                          <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">ISBN / Edition</Label>
                            <Input placeholder="e.g. 978-3-16-148410-0" value={newProduct.dimensions} onChange={(e) => setNewProduct({ ...newProduct, dimensions: e.target.value })} className="h-12 rounded-xl border-slate-100 font-bold" />
                          </div>
                          <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Page Count</Label>
                            <Input placeholder="e.g. 350 Pages" value={newProduct.weight} onChange={(e) => setNewProduct({ ...newProduct, weight: e.target.value })} className="h-12 rounded-xl border-slate-100 font-bold" />
                          </div>
                        </>
                      )}

                      {/* Default Fields for Electronics, Home, Toys, Automotive, etc. if not matched above */}
                      {!["Fashion", "Apparel", "Grocery", "Beauty", "Health", "Books"].includes(newProduct.category) && (
                        <>
                          <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Item Mass / Weight</Label>
                            <Input placeholder="e.g. 450g, 1.2kg" value={newProduct.weight} onChange={(e) => setNewProduct({ ...newProduct, weight: e.target.value })} className="h-12 rounded-xl border-slate-100 font-bold" />
                          </div>
                          <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Dimensions (LxBxH)</Label>
                            <Input placeholder="e.g. 15x10x5 cm" value={newProduct.dimensions} onChange={(e) => setNewProduct({ ...newProduct, dimensions: e.target.value })} className="h-12 rounded-xl border-slate-100 font-bold" />
                          </div>
                          <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Warranty Details</Label>
                            <Input placeholder="e.g. 2-Year Global Warranty" value={newProduct.warranty} onChange={(e) => setNewProduct({ ...newProduct, warranty: e.target.value })} className="h-12 rounded-xl border-slate-100 font-bold" />
                          </div>
                          <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Inside the Box</Label>
                            <Input placeholder="e.g. Main Unit, Charger, Manual" value={newProduct.box_contents} onChange={(e) => setNewProduct({ ...newProduct, box_contents: e.target.value })} className="h-12 rounded-xl border-slate-100 font-bold" />
                          </div>
                        </>
                      )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
                      <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 flex items-center gap-2">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Key Features & Highlights (One per line)
                        </Label>
                        <Textarea
                          placeholder="Aerospace grade construction&#10;Water resistant up to 100m&#10;72-hour power reserve"
                          rows={4}
                          value={newProduct.highlights}
                          onChange={(e) => setNewProduct({ ...newProduct, highlights: e.target.value })}
                          className="rounded-2xl border-slate-100 font-medium"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 flex items-center gap-2">
                          <Settings className="w-3 h-3 text-violet-500" /> Technical Specs (Key:Value, one per line)
                        </Label>
                        <Textarea
                          placeholder="Battery:4000mAh&#10;Connectivity:Bluetooth 5.3&#10;Display:120Hz OLED"
                          rows={4}
                          value={newProduct.specifications}
                          onChange={(e) => setNewProduct({ ...newProduct, specifications: e.target.value })}
                          className="rounded-2xl border-slate-100 font-medium"
                        />
                      </div>
                    </div>
                  </TabsContent>
                </div>

                <div className="p-10 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">
                    Admin will review your product before it goes live.
                  </p>
                  <Button type="submit" className="h-14 px-12 bg-violet-600 hover:bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl shadow-violet-200 transition-all active:scale-95">
                    {editingProduct ? 'Save Changes' : 'Add Product'}
                  </Button>
                </div>
              </Tabs>
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
                      <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={p.image || '/assets/zlogo.png'}
                          alt={p.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = '/assets/zlogo.png';
                          }}
                        />
                      </div>
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
                  <td className="px-6 py-4 text-right">
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-black text-gray-900">₹{p.price}</span>
                      {p.discount > 0 && (
                        <span className="text-[10px] text-gray-400 line-through font-bold">
                          ₹{Math.round(p.price / (1 - p.discount / 100))}
                        </span>
                      )}
                    </div>
                  </td>
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
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-violet-600" onClick={() => handleEditInitiate(p)}><Edit className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600" onClick={() => confirmDeleteProduct(p.id)}><Trash2 className="w-4 h-4" /></Button>
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
        <Badge className="bg-red-100 text-red-600 border-none px-3 py-1">
          {products.filter(p => p.stock <= 5).length} Items at Low Stock
        </Badge>
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
              <Button size="sm" className="bg-red-500 hover:bg-red-600 rounded-lg" onClick={() => setActiveMenu('products')}>Restock</Button>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="border-0 shadow-sm p-6 bg-white rounded-[2rem]">
        <div className="flex items-center justify-between mb-6">
          <h4 className="font-black italic text-lg uppercase">Update <span className="text-violet-600">Stock Levels.</span></h4>
        </div>
        <div className="space-y-4">
          {products.map(p => (
            <div key={p.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-all border border-transparent hover:border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden">
                  <img src={p.image || '/assets/zlogo.png'} alt={p.name} className="w-full h-full object-cover" onError={(e) => { e.target.src = '/assets/zlogo.png'; }} />
                </div>
                <div>
                  <span className="text-sm font-black text-gray-900">{p.name}</span>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{p.category}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Input
                    id={`stock-${p.id}`}
                    className="w-24 h-11 rounded-xl text-center font-black pr-8"
                    defaultValue={p.stock}
                    type="number"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-gray-400">UNITS</span>
                </div>
                <Button
                  className="h-11 bg-black hover:bg-violet-600 hover:shadow-lg hover:shadow-violet-200 text-white px-6 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all active:scale-95 group"
                  onClick={() => {
                    const input = document.getElementById(`stock-${p.id}`);
                    handleUpdateStock(p.id, input.value);
                  }}
                >
                  <RotateCcw className="w-3 h-3 mr-2 group-hover:rotate-180 transition-transform duration-500" />
                  Sync Stock
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [bankDetails, setBankDetails] = useState({
    account_holder: "",
    account_number: "",
    bank_name: "",
    ifsc_code: "",
    account_type: "savings"
  });
  const [withdrawError, setWithdrawError] = useState("");

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setWithdrawError("");

    // Validation
    if (!withdrawAmount || isNaN(withdrawAmount) || parseFloat(withdrawAmount) <= 0) {
      setWithdrawError("Please enter a valid withdrawal amount.");
      return;
    }

    const amount = parseFloat(withdrawAmount);
    if (amount > financeData.available_balance) {
      setWithdrawError("Insufficient balance. Please enter an amount less than or equal to your available balance.");
      return;
    }

    // Validate bank details
    if (!bankDetails.account_holder || !bankDetails.account_number || !bankDetails.bank_name || !bankDetails.ifsc_code) {
      setWithdrawError("Please fill in all bank details.");
      return;
    }

    try {
      const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
      await axios.post(`${API_BASE}/api/vendor/withdraw`,
        {
          amount: amount,
          bank_details: bankDetails
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      alert("Withdrawal request sent successfully. Funds will be released after review.");
      setWithdrawAmount("");
      setBankDetails({
        account_holder: "",
        account_number: "",
        bank_name: "",
        ifsc_code: "",
        account_type: "savings"
      });
      setWithdrawError("");
      fetchVendorFinance();
    } catch (e) {
      console.error("Failed to request withdrawal:", e);
      setWithdrawError(e.response?.data?.detail || "Failed to request withdrawal. Please try again.");
    }
  };

  const renderFinance = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Premium Header Section */}
      <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
          <h3 className="text-4xl font-black italic tracking-tighter">My <span className="text-violet-600">Earnings.</span></h3>
          <p className="text-slate-500 font-medium mt-2 max-w-md">Manage your money, track sales, and withdraw your earnings safely.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-slate-900 text-white p-6 rounded-[2rem] min-w-[200px] shadow-2xl shadow-slate-200">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Total Available</p>
            <h4 className="text-3xl font-black italic">₹{financeData.available_balance.toLocaleString()}</h4>
            <div className="mt-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">Available to Withdraw</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Gross Sales', val: `₹${financeData.gross_revenue.toLocaleString()}`, icon: TrendingUp, color: 'text-violet-600', bg: 'bg-violet-50', desc: 'Total amount sold' },
          { label: 'Platform Fee (10%)', val: `₹${financeData.total_commission.toLocaleString()}`, icon: ShieldCheck, color: 'text-amber-600', bg: 'bg-amber-50', desc: 'Service fee' },
          { label: 'Total Settled', val: `₹${financeData.total_payouts.toLocaleString()}`, icon: Banknote, color: 'text-emerald-600', bg: 'bg-emerald-50', desc: 'Money sent to your bank' },
        ].map((item, i) => (
          <Card key={i} className="p-8 border-none shadow-sm rounded-[2.5rem] bg-white hover:shadow-xl transition-all duration-500 group">
            <div className={`p-4 w-fit rounded-2xl ${item.bg} ${item.color} mb-6 group-hover:scale-110 transition-transform`}>
              <item.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
              <h4 className="text-2xl font-black italic text-slate-900">{item.val}</h4>
              <p className="text-[10px] font-medium text-slate-400 mt-2">{item.desc}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Earnings Table */}
        <Card className="lg:col-span-2 border-none shadow-sm rounded-[3rem] bg-white overflow-hidden">
          <div className="p-10 border-b border-slate-50 flex items-center justify-between">
            <div>
              <h4 className="font-black italic text-xl uppercase tracking-tight">Recent <span className="text-violet-600">Earnings.</span></h4>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">A record of all your sales</p>
            </div>
            <Button variant="outline" onClick={exportEarningsToXLSX} className="rounded-2xl border-slate-100 text-[10px] font-black uppercase tracking-widest px-6 h-10">Export XLSX</Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Order ID</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Value</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Net</th>
                  <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {financeData.earnings_protocol.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-10 py-20 text-center">
                      <div className="flex flex-col items-center gap-4 opacity-30">
                        <History className="w-12 h-12" />
                        <p className="text-xs font-black uppercase tracking-widest">No transaction data synchronised.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  financeData.earnings_protocol.map((t, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-10 py-6">
                        <div className="flex flex-col">
                          <span className="font-black font-mono text-slate-900 group-hover:text-violet-600 transition-colors">#{t.id}</span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase">{new Date(t.date).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <span className="text-sm font-black text-slate-900">₹{t.val.toLocaleString()}</span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <span className="text-sm font-black text-emerald-600 italic">₹{t.net.toLocaleString()}</span>
                      </td>
                      <td className="px-10 py-6">
                        <Badge className={`px-4 py-1.5 rounded-full border-none font-black text-[9px] uppercase tracking-widest ${t.status === 'settled' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600 animate-pulse'
                          }`}>
                          {t.status}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Withdrawal Panel */}
        <Card className="border-none shadow-2xl rounded-[3rem] bg-violet-600 p-10 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center mb-8">
              <Wallet className="w-8 h-8 text-white" />
            </div>
            <h4 className="text-3xl font-black italic mb-2">Get <span className="text-violet-200">Paid.</span></h4>
            <p className="text-violet-200 text-xs font-medium leading-relaxed mb-10 opacity-80">Withdraw your earnings to your bank account securely.</p>

            <form onSubmit={handleWithdraw} className="space-y-8">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-violet-200 ml-2">Amount to Withdraw (₹)</Label>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="bg-black/20 border-white/10 text-white placeholder:text-white/20 h-16 rounded-3xl font-black text-2xl px-8 focus:ring-2 focus:ring-white/30 transition-all"
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-violet-300">INR</div>
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-widest text-violet-200 ml-2">Bank Details</Label>
                <div className="grid grid-cols-1 gap-4">
                  <Input
                    placeholder="Account Holder Name"
                    value={bankDetails.account_holder}
                    onChange={(e) => setBankDetails({ ...bankDetails, account_holder: e.target.value })}
                    className="bg-black/20 border-white/10 text-white placeholder:text-white/20 h-12 rounded-2xl px-6 focus:ring-2 focus:ring-white/30 transition-all"
                  />
                  <Input
                    placeholder="Account Number"
                    value={bankDetails.account_number}
                    onChange={(e) => setBankDetails({ ...bankDetails, account_number: e.target.value })}
                    className="bg-black/20 border-white/10 text-white placeholder:text-white/20 h-12 rounded-2xl px-6 focus:ring-2 focus:ring-white/30 transition-all"
                  />
                  <Input
                    placeholder="Bank Name"
                    value={bankDetails.bank_name}
                    onChange={(e) => setBankDetails({ ...bankDetails, bank_name: e.target.value })}
                    className="bg-black/20 border-white/10 text-white placeholder:text-white/20 h-12 rounded-2xl px-6 focus:ring-2 focus:ring-white/30 transition-all"
                  />
                  <Input
                    placeholder="IFSC Code"
                    value={bankDetails.ifsc_code}
                    onChange={(e) => setBankDetails({ ...bankDetails, ifsc_code: e.target.value })}
                    className="bg-black/20 border-white/10 text-white placeholder:text-white/20 h-12 rounded-2xl px-6 focus:ring-2 focus:ring-white/30 transition-all"
                  />
                  <Select value={bankDetails.account_type} onValueChange={(value) => setBankDetails({ ...bankDetails, account_type: value })}>
                    <SelectTrigger className="bg-black/20 border-white/10 text-white h-12 rounded-2xl px-6 focus:ring-2 focus:ring-white/30 transition-all">
                      <SelectValue placeholder="Account Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="savings">Savings Account</SelectItem>
                      <SelectItem value="current">Current Account</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {withdrawError && (
                <div className="text-red-300 text-xs font-bold uppercase tracking-widest bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                  {withdrawError}
                </div>
              )}

              <Button
                className="w-full h-16 bg-white text-violet-600 hover:bg-violet-50 font-black uppercase tracking-widest rounded-3xl shadow-2xl shadow-violet-900/40 active:scale-95 transition-all text-sm"
              >
                Request Withdrawal
              </Button>
            </form>
          </div>

          <div className="mt-10 pt-10 border-t border-white/10 flex items-center gap-5 relative z-10">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center animate-bounce">
              <ShieldCheck className="w-6 h-6 text-violet-200" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest">Safe Withdrawal</p>
              <p className="text-[10px] text-violet-200 uppercase font-bold opacity-60">Verified by ZippyCart</p>
            </div>
          </div>
        </Card>
      </div>

    </div>
  );


  const renderProfile = () => (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">My Profile</h3>
        {isEditingAddress ? (
          <div className="flex gap-2">
            <Button className="bg-emerald-600 hover:bg-emerald-700 rounded-xl" onClick={handleUpdateAddress}>Save Address</Button>
            <Button variant="ghost" className="rounded-xl" onClick={() => { setIsEditingAddress(false); setTempAddress(user?.address || ""); }}>Cancel</Button>
          </div>
        ) : (
          <Button className="bg-violet-600 hover:bg-violet-700 rounded-xl" onClick={() => setIsEditingAddress(true)}>Edit Address</Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <Card className="border-0 shadow-lg rounded-[2rem] overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-violet-600 to-indigo-600 relative overflow-hidden">
            {user?.banner && (
              <img src={user.banner} alt="Banner" className="w-full h-full object-cover" />
            )}
            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all flex items-center justify-center group">
              <label className="cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-white bg-opacity-90 rounded-lg px-4 py-2 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-gray-700" />
                  <span className="text-sm font-medium text-gray-700">Upload Banner</span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBannerUpload}
                  className="hidden"
                />
              </label>
            </div>
            <div className="absolute bottom-0 left-8">
              <div className="w-20 h-20 rounded-2xl bg-white p-1 shadow-xl">
                <div className="w-full h-full bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden relative group">
                  {user?.avatar ? (
                    <img src={`${user.avatar}?t=${Date.now()}`} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-10 h-10 text-gray-400" />
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                    <label className="cursor-pointer">
                      <Upload className="w-6 h-6 text-white" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <CardContent className="pt-18 px-8 pb-8">
            <h2 className="text-2xl font-black text-gray-900">{user?.name}</h2>
            <p className="text-sm font-medium text-violet-600 mb-6">{user?.user_type === 'vendor' ? 'Verified Merchant' : 'User'}</p>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                  <Mail className="w-4 h-4" />
                </div>
                {user?.email}
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                  <Phone className="w-4 h-4" />
                </div>
                {user?.phone || 'No phone number'}
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                  <MapPin className="w-4 h-4" />
                </div>
                {isEditingAddress ? (
                  <Input
                    value={tempAddress}
                    onChange={(e) => setTempAddress(e.target.value)}
                    placeholder="Enter your new address"
                    className="h-10 rounded-xl border-slate-200"
                  />
                ) : (
                  user?.address || 'No address provided'
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Details */}
        <Card className="lg:col-span-2 border-0 shadow-sm rounded-[2rem]">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>Official business details as registered on the platform.</CardDescription>
            </div>
            {isEditingBusiness ? (
              <div className="flex gap-2">
                <Button className="bg-emerald-600 hover:bg-emerald-700 rounded-xl" onClick={async (e) => {
                  try {
                    await handleUpdateSettings(e);
                    setIsEditingBusiness(false);
                  } catch (err) { }
                }}>Save Changes</Button>
                <Button variant="ghost" className="rounded-xl" onClick={() => {
                  setIsEditingBusiness(false);
                  // Reset to original user data
                  setStoreSettings({
                    ...storeSettings,
                    business_name: user?.business_name || '',
                    owner_name: user?.owner_name || '',
                    phone: user?.phone || '',
                    email: user?.email || '',
                    business_category: user?.business_category || ''
                  });
                }}>Cancel</Button>
              </div>
            ) : (
              <Button className="bg-violet-600 hover:bg-violet-700 rounded-xl" onClick={() => setIsEditingBusiness(true)}>Edit Details</Button>
            )}
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <Label className="text-xs font-black uppercase tracking-widest text-gray-400">Business Name</Label>
              {isEditingBusiness ? (
                <Input
                  value={storeSettings.business_name}
                  onChange={(e) => setStoreSettings({ ...storeSettings, business_name: e.target.value })}
                  className="bg-white border-violet-200 font-bold"
                />
              ) : (
                <Input value={user?.business_name || ''} readOnly className="bg-gray-50 border-gray-100 font-bold" />
              )}
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-black uppercase tracking-widest text-gray-400">Owner Name</Label>
              {isEditingBusiness ? (
                <Input
                  value={storeSettings.owner_name}
                  onChange={(e) => setStoreSettings({ ...storeSettings, owner_name: e.target.value })}
                  className="bg-white border-violet-200 font-bold"
                />
              ) : (
                <Input value={user?.owner_name || ''} readOnly className="bg-gray-50 border-gray-100 font-bold" />
              )}
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-black uppercase tracking-widest text-gray-400">Business Email</Label>
              {isEditingBusiness ? (
                <Input
                  value={storeSettings.email}
                  onChange={(e) => setStoreSettings({ ...storeSettings, email: e.target.value })}
                  className="bg-white border-violet-200 font-bold"
                />
              ) : (
                <Input value={user?.email || ''} readOnly className="bg-gray-50 border-gray-100 font-bold" />
              )}
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-black uppercase tracking-widest text-gray-400">Contact Number</Label>
              {isEditingBusiness ? (
                <Input
                  value={storeSettings.phone}
                  onChange={(e) => setStoreSettings({ ...storeSettings, phone: e.target.value })}
                  className="bg-white border-violet-200 font-bold"
                />
              ) : (
                <Input value={user?.phone || ''} readOnly className="bg-gray-50 border-gray-100 font-bold" />
              )}
            </div>

            <div className="space-y-1 md:col-span-2">
              <Label className="text-xs font-black uppercase tracking-widest text-gray-400">Business Category <span className="text-violet-600">*</span></Label>
              {isEditingBusiness ? (
                <Select
                  value={storeSettings.business_category}
                  onValueChange={(val) => setStoreSettings({ ...storeSettings, business_category: val })}
                >
                  <SelectTrigger className="bg-white border-violet-200 font-bold h-12">
                    <SelectValue placeholder="Select Primary Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {["Electronics", "Fashion", "Home & Kitchen", "Beauty & Personal Care", "Books", "Sports & Outdoors", "Toys & Games", "Automotive", "Grocery", "Health & Wellness"].map(cat => (
                      <SelectItem key={cat} value={cat} className="font-medium">{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input value={user?.business_category || 'Not Set'} readOnly className="bg-gray-50 border-gray-100 font-bold text-violet-600" />
              )}
            </div>

            <div className="md:col-span-2 mt-4 p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex items-start gap-4">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-emerald-900 text-sm">Verification Status: Verified</h4>
                <p className="text-xs text-emerald-700 mt-1">Your business identity has been verified and authenticated by the platform administration.</p>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );

  const renderOrders = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
        <div>
          <h3 className="text-3xl font-black italic">Manage <span className="text-violet-600">Orders.</span></h3>
          <p className="text-gray-500 font-medium mt-1">Track your orders and shipping status.</p>
        </div>
        <div className="flex gap-4">
          <Badge className="bg-violet-50 text-violet-600 border-none px-4 py-2 font-black text-[10px] uppercase">
            {vendorOrders.length} Total Orders
          </Badge>
        </div>
      </div>

      <Card className="border-none shadow-sm rounded-[2.5rem] bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b">
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Order ID</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer Info</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Price</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Update Status</th>
                <th className="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {vendorOrders.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-3 text-gray-400">
                      <ShoppingCart className="w-12 h-12 opacity-20" />
                      <p className="font-black italic uppercase tracking-tighter">No orders found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                vendorOrders.map(o => {
                  // Find items in this order belonging to current vendor
                  const myItems = o.items.filter(item => item.vendor_id === user?.id);
                  const myStatus = myItems[0]?.status || 'processing';

                  return (
                    <tr key={o.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-1">
                          <span className="font-black font-mono text-gray-900 tracking-wider">#{o.id.slice(0, 8)}...</span>
                          <span className="text-[10px] font-bold text-gray-400 uppercase">{new Date(o.created_at).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 font-black text-xs">
                            {o.customer_name[0]}
                          </div>
                          <div>
                            <p className="font-black text-gray-900 uppercase tracking-tight text-xs">{o.customer_name}</p>
                            <p className="text-[10px] font-medium text-gray-400">{o.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right font-black italic text-violet-600 text-base">₹{o.total_amount}</td>
                      <td className="px-8 py-6">
                        <Select
                          defaultValue={myStatus}
                          onValueChange={(val) => handleUpdateOrderStatus(o.id, val)}
                        >
                          <SelectTrigger className="w-40 h-10 rounded-xl bg-slate-50 border-none font-black text-[10px] uppercase italic tracking-widest">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-none shadow-2xl">
                            <SelectItem value="processing" className="text-[10px] font-black uppercase tracking-widest">Processing</SelectItem>
                            <SelectItem value="shipped" className="text-[10px] font-black uppercase tracking-widest">Shipped</SelectItem>
                            <SelectItem value="delivered" className="text-[10px] font-black uppercase tracking-widest">Delivered</SelectItem>
                            <SelectItem value="cancelled" className="text-[10px] font-black uppercase tracking-widest text-red-500">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-slate-100 bg-white hover:bg-violet-50 hover:text-violet-600 transition-all">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  const [replyingTo, setReplyingTo] = useState(null);
  const [vendorReply, setVendorReply] = useState('');

  const handleReplySubmit = (id) => {
    alert(`Your reply has been saved.`);
    setReplyingTo(null);
    setVendorReply('');
  };


  const renderSupport = () => (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-10">
      {/* Support Header */}
      <div className="bg-slate-900 rounded-[3rem] p-12 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <h3 className="text-4xl font-black italic tracking-tighter">Admin <span className="text-violet-400">Support.</span></h3>
            <p className="text-slate-400 font-medium mt-3 max-w-xl">Directly message our Admin team for any issues with your account, orders, or payouts.</p>
          </div>
          <div className="flex gap-4">
            <Button
              onClick={() => {
                const contactForm = document.getElementById('contact-admin-form');
                if (contactForm) {
                  contactForm.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                  });
                }
              }}
              className="h-16 px-8 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl shadow-violet-900/20 active:scale-95 transition-all"
            >
              <Headset className="w-5 h-5 mr-3" /> Contact Admin
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { icon: BookOpen, title: "Help Articles", desc: "Browse guides on how to grow your business.", color: "text-blue-600", bg: "bg-blue-50" },
          { icon: Headset, title: "Contact Us", desc: "Talk to our support team directly.", color: "text-violet-600", bg: "bg-violet-50" },
          { icon: LifeBuoy, title: "Ticket Status", desc: "Track your ongoing support requests.", color: "text-emerald-600", bg: "bg-emerald-50" }
        ].map((item, i) => (
          <Card key={i} className="p-8 border-none shadow-sm rounded-[2.5rem] bg-white hover:shadow-xl transition-all duration-500 group cursor-pointer border-b-4 border-transparent hover:border-violet-600">
            <div className={`w-16 h-16 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
              <item.icon className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-black italic mb-2">{item.title}</h4>
            <p className="text-slate-500 font-medium text-sm leading-relaxed">{item.desc}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* FAQ Section */}
        <div className="space-y-6">
          <h4 className="text-2xl font-black italic px-4">Common <span className="text-violet-600">Questions.</span></h4>
          <div className="space-y-4">
            {[
              { q: "How do I get my payments?", a: "Payments are automatically sent to your bank account every Friday for all delivered orders." },
              { q: "How to increase my sales?", a: "Try using our Coupon feature to offer discounts or optimize your product photos." },
              { q: "What are the platform fees?", a: "We charge a flat 10% service fee on every successful sale made through our platform." },
              { q: "How to ship my products?", a: "Once an order is placed, you can mark it as shipped and add the tracking ID in the Orders section." }
            ].map((faq, i) => (
              <Card key={i} className="border-none shadow-sm rounded-[2rem] overflow-hidden group">
                <CardHeader className="p-6 cursor-pointer hover:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-center">
                    <span className="font-black italic text-sm">{faq.q}</span>
                    <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-violet-600 transition-colors" />
                  </div>
                </CardHeader>
                <CardContent className="px-6 pb-6 pt-0">
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Contact Form */}
        <Card id="contact-admin-form" className="border-none shadow-2xl rounded-[3rem] bg-white p-10">
          <h4 className="text-2xl font-black italic mb-6">Contact <span className="text-violet-600">Admin.</span></h4>
          <form className="space-y-6" onSubmit={handleSendTicket}>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Subject</Label>
                <Input
                  required
                  placeholder="Need help with..."
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                  className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all font-bold"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Order ID (Optional)</Label>
                <Input
                  placeholder="#12345"
                  value={newTicket.order_id}
                  onChange={(e) => setNewTicket({ ...newTicket, order_id: e.target.value })}
                  className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all font-bold"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Message</Label>
              <Textarea
                required
                placeholder="How can we help you?"
                value={newTicket.message}
                onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
                className="min-h-[150px] rounded-[2rem] border-slate-100 bg-slate-50/50 focus:bg-white transition-all font-medium p-6"
              />
            </div>
            <Button type="submit" className="w-full h-16 bg-slate-900 hover:bg-violet-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl shadow-slate-200 active:scale-95 transition-all">
              <Send className="w-5 h-5 mr-3" /> Send to Admin
            </Button>
          </form>
        </Card>
      </div>

      {/* Ticket History */}
      <Card className="border-none shadow-sm rounded-[3rem] bg-white overflow-hidden mt-10">
        <div className="p-10 border-b border-slate-50 flex justify-between items-center">
          <div>
            <h4 className="font-black italic text-xl uppercase tracking-tight">Support <span className="text-violet-600">History.</span></h4>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Direct communication with Admin team</p>
          </div>
          <Badge className="bg-violet-50 text-violet-600 border-none px-4 py-2 font-black text-[10px] uppercase">{supportTickets.length} Total Tickets</Badge>
        </div>

        {supportTickets.length === 0 ? (
          <div className="p-10 text-center space-y-4 opacity-50">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            </div>
            <h5 className="font-black italic text-lg text-slate-900">No active issues.</h5>
            <p className="text-sm text-slate-500 font-medium max-w-xs mx-auto">Click above to message the admin team if you need any help.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {supportTickets.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50/50 transition-all">
                    <td className="px-10 py-6 text-[10px] font-bold text-slate-400 uppercase">{new Date(t.created_at).toLocaleDateString()}</td>
                    <td className="px-8 py-6">
                      <p className="font-black text-slate-900 italic">{t.subject}</p>
                      {t.order_id && <p className="text-[9px] text-violet-600 font-bold uppercase">Order: {t.order_id}</p>}
                    </td>
                    <td className="px-8 py-6">
                      <Badge className={`px-4 py-1.5 rounded-full border-none font-black text-[9px] uppercase tracking-widest ${t.status === 'resolved' ? 'bg-emerald-50 text-emerald-600' :
                        t.status === 'responding' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                        }`}>
                        {t.status}
                      </Badge>
                    </td>
                    <td className="px-10 py-6 text-right">
                      <Button variant="ghost" size="icon" className="rounded-xl"><Eye className="w-4 h-4" /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );

  const renderReviews = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center bg-white p-8 rounded-[2rem] shadow-sm">
        <div>
          <h3 className="text-3xl font-black italic">Customer <span className="text-violet-600">Reviews.</span></h3>
          <p className="text-gray-500 font-medium">Feedback from your customers on your products.</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-violet-600">{reviews.length}</p>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Reviews</p>
        </div>
      </div>

      <Card className="border-none shadow-sm rounded-[2.5rem] bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Product</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Rating</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Review</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm font-medium">
              {reviews.map(r => (
                <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <span className="font-black text-gray-900">{r.product_name}</span>
                  </td>
                  <td className="px-8 py-6 font-black italic text-violet-600">{r.user_name}</td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < r.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                      ))}
                      <span className="ml-2 text-[10px] font-black text-gray-400 uppercase">{r.rating}/5</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 max-w-xs truncate">{r.comment}</td>
                  <td className="px-8 py-6 text-gray-500 font-bold uppercase text-[10px] tracking-tight">
                    {new Date(r.created_at).toLocaleDateString()}
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center bg-white p-8 rounded-[2rem] shadow-sm">
        <div>
          <h3 className="text-3xl font-black italic">Store <span className="text-violet-600">Settings.</span></h3>
          <p className="text-gray-500 font-medium">Manage your store information and preferences.</p>
        </div>
      </div>

      <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
        <CardContent className="p-10">
          <form onSubmit={handleUpdateSettings} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Business Name</Label>
                <Input
                  value={storeSettings.business_name}
                  onChange={(e) => setStoreSettings({ ...storeSettings, business_name: e.target.value })}
                />
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Owner Name</Label>
                <Input
                  value={storeSettings.owner_name}
                  onChange={(e) => setStoreSettings({ ...storeSettings, owner_name: e.target.value })}
                />
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Phone</Label>
                <Input
                  value={storeSettings.phone}
                  onChange={(e) => setStoreSettings({ ...storeSettings, phone: e.target.value })}
                />
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Email</Label>
                <Input
                  type="email"
                  value={storeSettings.email}
                  onChange={(e) => setStoreSettings({ ...storeSettings, email: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Address</Label>
              <Textarea
                value={storeSettings.address}
                onChange={(e) => setStoreSettings({ ...storeSettings, address: e.target.value })}
              />
            </div>
            <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-black uppercase text-sm tracking-widest py-3">
              Update Settings
            </Button>
          </form>
        </CardContent>
      </Card>
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
      case 'profile': return renderProfile();
      case 'support': return renderSupport();
      default: return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-violet-50 rounded-full flex items-center justify-center mb-4">
            <Settings className="w-8 h-8 text-violet-300" />
          </div>
          <h3 className="text-lg font-bold">Work in Progress</h3>
          <p className="text-gray-500 text-sm mt-2">We're building the {activeMenu} page for you.</p>
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
                <h2 className="font-bold text-slate-900 leading-tight">Seller Panel</h2>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black">Seller Account</p>
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
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors bg-white font-bold text-sm"
                  >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure you want to sign out?</AlertDialogTitle>
                    <AlertDialogDescription>
                      You will be logged out of your vendor account and redirected to the login page.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={logout} className="bg-red-600 hover:bg-red-700">
                      Yes, Sign Out
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </aside>

          {/* Delete Product Confirmation Dialog */}
          <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Product</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this product? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteProduct} className="bg-red-600 hover:bg-red-700">
                  Delete Product
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

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

export default Vendor;