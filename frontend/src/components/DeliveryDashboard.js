import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Truck, Package, MapPin, Phone, CheckCircle2, 
  Clock, AlertCircle, ChevronRight, Navigation as NavIcon,
  LogOut, LayoutDashboard, History, User, Bell,
  Power, Wallet, Shield, Settings, Menu, X,
  ExternalLink, CreditCard, Star, Bike, ChevronLeft,
  MoreVertical, Download, TrendingUp, Search, Sliders,
  BellRing, ShieldCheck, Mail, Map, Trash2, HelpCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "../App";

const DeliveryDashboard = () => {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState("dashboard");
    const [orders, setOrders] = useState([]);
    const [history, setHistory] = useState([]);
    const [stats, setStats] = useState({
        today_orders: 0,
        total_completed: 0,
        today_earnings: 0,
        total_earnings: 0,
        wallet_balance: 0,
        status: 'offline'
    });
    const [loading, setLoading] = useState(true);
    const [isOnline, setIsOnline] = useState(false);
    const [taskTimer, setTaskTimer] = useState(20);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [notifications, setNotifications] = useState([
        { id: 1, type: 'alert', title: 'New Area Active', message: 'Hitech City region is seeing high demand. Potential ₹20 surge active.', time: '2 mins ago', read: false },
        { id: 2, type: 'success', title: 'Payout Processed', message: 'Your withdrawal request for ₹500.00 has been successfully authorized.', time: '1 hour ago', read: true },
        { id: 3, type: 'info', title: 'Route Update', message: 'Traffic congestion reported on MG Road. Protocol suggests Inner Ring Road diversion.', time: '3 hours ago', read: true },
    ]);

    const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

    useEffect(() => {
        fetchAllData();
    }, []);

    useEffect(() => {
        let timer;
        if (orders.some(o => o.delivery_status === 'pending') && taskTimer > 0) {
            timer = setInterval(() => setTaskTimer(prev => prev - 1), 1000);
        }
        return () => clearInterval(timer);
    }, [orders, taskTimer]);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [statsRes, ordersRes, historyRes] = await Promise.all([
                axios.get(`${API_BASE}/api/rider/stats`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
                axios.get(`${API_BASE}/api/rider/orders`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
                axios.get(`${API_BASE}/api/rider/history`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
            ]);
            setStats(statsRes.data);
            setOrders(ordersRes.data);
            setHistory(historyRes.data);
            setIsOnline(statsRes.data.status === 'online');
        } catch (e) {
            console.error("Failed to fetch rider data:", e);
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async () => {
        try {
            const res = await axios.post(`${API_BASE}/api/rider/toggle-status`, {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setIsOnline(res.data.status === 'online');
            setStats(prev => ({ ...prev, status: res.data.status }));
        } catch (e) {
            alert("Failed to toggle status.");
        }
    };

    const updateStatus = async (orderId, newStatus) => {
        try {
            await axios.post(`${API_BASE}/api/rider/orders/${orderId}/status`, { status: newStatus }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            fetchAllData();
        } catch (e) {
            console.error("Failed to update status:", e);
        }
    };

    const renderDashboard = () => (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24 lg:pb-0">
            {/* Top Row - Status & Stats Summary */}
            <div className="grid lg:grid-cols-3 gap-6">
                <Card className={`lg:col-span-2 rounded-[2.5rem] border-none shadow-2xl transition-all duration-500 overflow-hidden relative group ${isOnline ? 'bg-emerald-600' : 'bg-slate-800'}`}>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
                    <CardContent className="p-10 flex items-center justify-between relative z-10">
                        <div>
                            <h2 className="text-white text-4xl font-black italic tracking-tighter">Go {isOnline ? 'Offline' : 'Online'}.</h2>
                            <p className="text-white/60 text-sm font-medium mt-2 max-w-xs">{isOnline ? "Operational nodes active. Monitoring territory for incoming assignments." : "System idle. Toggle activation to initiate logistical duty session."}</p>
                        </div>
                        <button 
                            onClick={toggleStatus}
                            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-2xl active:scale-95 ${isOnline ? 'bg-white text-emerald-600 scale-110' : 'bg-white/10 text-white hover:bg-white/20'}`}
                        >
                            <Power className="w-10 h-10" />
                        </button>
                    </CardContent>
                </Card>

                <div className="space-y-4">
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center justify-between">
                         <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Today's Pay</p>
                            <h3 className="text-3xl font-black italic text-slate-900">₹{stats.today_earnings}</h3>
                        </div>
                        <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600">
                            <Wallet className="w-7 h-7" />
                        </div>
                    </div>
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center justify-between">
                         <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Orders Done</p>
                            <h3 className="text-3xl font-black italic text-slate-900">{stats.today_orders}</h3>
                        </div>
                        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                            <CheckCircle2 className="w-7 h-7" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Active Orders Section */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <span className="w-3 h-10 bg-orange-500 rounded-full"></span>
                    <h3 className="text-2xl font-black italic">Active Tasks.</h3>
                </div>
                
                {orders.length === 0 ? (
                    <div className="bg-white py-24 rounded-[3rem] border-2 border-dashed border-slate-100 text-center">
                        <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6">
                            <Package className="w-12 h-12 text-slate-200" />
                        </div>
                        <p className="text-slate-400 font-black uppercase text-xs tracking-[0.2em]">No assigned orders at the moment</p>
                        <p className="text-slate-300 text-[10px] font-bold mt-2">Assignments will appear here once authorized by command.</p>
                    </div>
                ) : (
                    <div className="grid lg:grid-cols-2 gap-6">
                    {orders.map(order => (
                        <Card key={order.id} className="rounded-[3rem] border-none shadow-2xl bg-white overflow-hidden hover:shadow-orange-100 transition-all duration-500">
                            <CardHeader className="bg-slate-50 p-8 flex-row items-center justify-between">
                                <div>
                                    <Badge className="bg-orange-100 text-orange-600 border-none font-black text-[10px] uppercase px-4 py-1.5 mb-3 rounded-full">ORDER #{order.id.slice(0, 8)}</Badge>
                                    <h4 className="text-2xl font-black italic text-slate-900">{order.customer_name}</h4>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Material Value</p>
                                    <p className="text-2xl font-black text-emerald-600 italic">₹{order.amount || 50.00}</p>
                                </div>
                            </CardHeader>
                            <CardContent className="p-8 space-y-8">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="flex items-start gap-5">
                                        <div className="p-4 bg-slate-50 rounded-3xl text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                                            <MapPin className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Drop-off Point</p>
                                            <p className="text-sm font-bold text-slate-700 leading-relaxed truncate lg:whitespace-normal">{order.address}</p>
                                            <Button variant="link" className="p-0 h-auto text-blue-600 font-black text-[10px] uppercase tracking-widest mt-2 hover:no-underline" onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(order.address)}`, '_blank')}>
                                                Launch Navigation <ExternalLink className="w-3 h-3 ml-1" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-5">
                                        <div className="p-4 bg-slate-50 rounded-3xl text-slate-400">
                                            <Phone className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Customer Line</p>
                                            <p className="text-sm font-bold text-slate-700">{order.phone || "Secure Protocol"}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-50 flex items-center gap-4">
                                    {order.delivery_status === 'assigned' ? (
                                        <Button className="flex-1 h-20 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[1.5rem] font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-indigo-100" onClick={() => updateStatus(order.id, 'accepted')}>
                                            Accept Assignment
                                        </Button>
                                    ) : order.delivery_status === 'accepted' ? (
                                        <Button className="flex-1 h-20 bg-amber-600 hover:bg-amber-700 text-white rounded-[1.5rem] font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-amber-100" onClick={() => updateStatus(order.id, 'picked')}>
                                            Confirm Pick-up
                                        </Button>
                                    ) : order.delivery_status === 'picked' ? (
                                        <Button className="flex-1 h-20 bg-blue-600 hover:bg-blue-700 text-white rounded-[1.5rem] font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-blue-100" onClick={() => updateStatus(order.id, 'on_the_way')}>
                                            Start Field Transit
                                        </Button>
                                    ) : (
                                        <Button className="flex-1 h-20 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[1.5rem] font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-emerald-100" onClick={() => updateStatus(order.id, 'delivered')}>
                                            Mark as Delivered
                                        </Button>
                                    )}
                                    <Button variant="outline" className="w-20 h-20 rounded-[1.5rem] border-slate-100 text-slate-400">
                                        <MoreVertical className="w-6 h-6" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    </div>
                )}
            </div>
        </div>
    );

    const renderTasks = () => (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24 lg:pb-0">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-4xl font-black italic">Available <span className="text-orange-500">Tasks.</span></h3>
                    <p className="text-slate-400 font-medium mt-2">Global task cloud synchronization active.</p>
                </div>
                <div className="flex items-center gap-4">
                    <Badge className="bg-orange-500 text-white border-none font-black text-xs px-6 py-2 rounded-full shadow-lg shadow-orange-100">{orders.filter(o => o.delivery_status === 'pending').length} New Assignments</Badge>
                </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {orders.filter(o => o.delivery_status === 'pending').length === 0 ? (
                    <div className="col-span-full py-32 text-center bg-white rounded-[3rem] border border-slate-50 shadow-sm">
                        <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8">
                            <Clock className="w-12 h-12 text-slate-200 animate-pulse" />
                        </div>
                        <h4 className="text-2xl font-black italic text-slate-300 uppercase tracking-tighter">Scanning Territory...</h4>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-4">Waiting for mission deployment from central command</p>
                    </div>
                ) : (
                    orders.filter(o => o.delivery_status === 'pending').map(order => (
                        <Card key={order.id} className="rounded-[3rem] border-none shadow-xl bg-white overflow-hidden p-8 border-l-[12px] border-orange-500 hover:scale-[1.02] transition-all">
                             <div className="flex justify-between items-start mb-6">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Incoming</p>
                                        <Badge className="bg-orange-500 text-white border-none animate-pulse text-[10px] px-2">{taskTimer}s</Badge>
                                    </div>
                                    <h4 className="text-xl font-black italic text-slate-900 uppercase">Logistics #{order.id.slice(0, 8)}</h4>
                                </div>
                                <div className="text-right">
                                    <p className="text-3xl font-black text-emerald-600 italic">₹50</p>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Assignment Fee</p>
                                </div>
                            </div>

                            <div className="space-y-4 bg-slate-50 p-6 rounded-[2rem] border border-slate-100 mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-lg shadow-blue-200"></div>
                                    <p className="text-xs font-black text-slate-600 uppercase tracking-tight">Pickup: Central Merchant Hub</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-lg shadow-orange-200"></div>
                                    <p className="text-xs font-black text-slate-600 uppercase tracking-tight truncate">Drop: {order.address.split(',')[0]}</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <Button className="flex-1 h-16 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[1.2rem] font-black uppercase text-[11px] tracking-[0.2em] shadow-xl shadow-emerald-100" onClick={() => updateStatus(order.id, 'accepted')}>Accept Mission</Button>
                                <Button variant="outline" className="flex-1 h-16 border-slate-100 text-slate-400 rounded-[1.2rem] font-black uppercase text-[11px] tracking-[0.2em]">Decline</Button>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );

    const renderWallet = () => (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24 lg:pb-0">
             <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-4xl font-black italic uppercase">Wealth <span className="text-emerald-600">Protocol.</span></h3>
                    <p className="text-slate-400 font-medium mt-2">Manage your earnings and deployment payouts.</p>
                </div>
                <Button variant="outline" className="h-14 px-8 rounded-2xl border-slate-100 font-black uppercase text-[10px] tracking-widest text-slate-500">Download Report <Download className="ml-2 w-4 h-4" /></Button>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 rounded-[3rem] border-none shadow-2xl bg-slate-900 text-white overflow-hidden relative group">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500 rounded-full -mr-40 -mt-40 blur-[100px] opacity-20 group-hover:opacity-30 transition-opacity"></div>
                    <CardContent className="p-12 relative z-10">
                        <div className="flex justify-between items-start mb-12">
                            <div>
                                <p className="text-[11px] font-black uppercase tracking-[0.4em] text-white/40 mb-3">Withdrawable Balance</p>
                                <h2 className="text-7xl font-black italic tracking-tighter">₹{stats.wallet_balance.toFixed(2)}</h2>
                            </div>
                            <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-xl">
                                <Wallet className="w-10 h-10 text-white" />
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button className="h-16 px-12 bg-white text-slate-900 hover:bg-emerald-50 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] shadow-2xl shadow-emerald-900/40" onClick={() => axios.post(`${API_BASE}/api/rider/withdraw`, {}, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }).then(res => { alert(res.data.message); fetchAllData(); }).catch(e => alert(e.response.data.detail))}>Initiate Payout Pulse</Button>
                            <Button variant="outline" className="h-16 px-10 border-white/10 text-white hover:bg-white/5 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em]">View History</Button>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-4">
                    <Card className="rounded-[2.5rem] border-none shadow-sm bg-white p-8 flex items-center justify-between group hover:shadow-xl transition-shadow">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Life Earnings</p>
                            <h4 className="text-3xl font-black italic text-slate-900 tracking-tighter">₹{stats.total_earnings}</h4>
                        </div>
                        <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 transition-transform group-hover:scale-110">
                            <TrendingUp className="w-7 h-7" />
                        </div>
                    </Card>
                    <Card className="rounded-[2.5rem] border-none shadow-sm bg-white p-8 flex items-center justify-between group hover:shadow-xl transition-shadow">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Deliveries Done</p>
                            <h4 className="text-3xl font-black italic text-slate-900 tracking-tighter">{stats.total_completed}</h4>
                        </div>
                        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 transition-transform group-hover:scale-110">
                            <Bike className="w-7 h-7" />
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );

    const renderHistory = () => (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24 lg:pb-0">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-4xl font-black italic uppercase">Mission <span className="text-blue-600">History.</span></h3>
                    <p className="text-slate-400 font-medium mt-2">Comprehensive archive of your logistical executions.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="w-12 h-12 p-0 rounded-xl border-slate-100"><Search className="w-5 h-5 text-slate-400" /></Button>
                    <Button variant="outline" className="w-12 h-12 p-0 rounded-xl border-slate-100"><Sliders className="w-5 h-5 text-slate-400" /></Button>
                </div>
            </div>

            <div className="grid gap-4">
                {history.length === 0 ? (
                    <Card className="py-32 rounded-[3rem] border border-dashed text-center">
                        <History className="w-16 h-16 text-slate-100 mx-auto mb-6" />
                        <p className="text-slate-300 font-black uppercase text-xs tracking-widest">No historical logs authorized.</p>
                    </Card>
                ) : (
                    history.map(item => (
                        <Card key={item.id} className="p-8 rounded-[2rem] border-none shadow-sm bg-white hover:shadow-md transition-shadow group">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                        <CheckCircle2 className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h4 className="text-lg font-black text-slate-900 italic uppercase">Deliver: {item.customer_name}</h4>
                                            <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[8px] px-2 py-0.5 rounded-full">DELIVERED</Badge>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                                            <MapPin className="w-3 h-3" /> {item.address?.split(',')[0]}
                                            <span className="mx-2">•</span>
                                            <Clock className="w-3 h-3" /> {new Date(item.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-black italic text-slate-900">₹{item.amount || 50}</p>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Earned</p>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );

    const renderNotifications = () => (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24 lg:pb-0">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-4xl font-black italic uppercase">Sync <span className="text-orange-500">Alerts.</span></h3>
                    <p className="text-slate-400 font-medium mt-2">Critical channel updates and system notifications.</p>
                </div>
                <Button variant="ghost" className="text-xs font-black uppercase text-slate-400 hover:text-slate-900">Mark all as read</Button>
            </div>

            <div className="grid gap-4">
                {notifications.map(note => (
                    <Card key={note.id} className={`p-8 rounded-[2.5rem] border-none shadow-sm relative overflow-hidden transition-all hover:shadow-md ${note.read ? 'bg-white opacity-60' : 'bg-white border-l-[12px] border-orange-500'}`}>
                        <div className="flex items-start gap-6">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${note.type === 'alert' ? 'bg-orange-50 text-orange-500' : note.type === 'success' ? 'bg-emerald-50 text-emerald-500' : 'bg-blue-50 text-blue-500'}`}>
                                {note.type === 'alert' ? <BellRing className="w-6 h-6" /> : note.type === 'success' ? <CheckCircle2 className="w-6 h-6" /> : <Mail className="w-6 h-6" />}
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="text-lg font-black text-slate-900 italic uppercase">{note.title}</h4>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{note.time}</span>
                                </div>
                                <p className="text-sm font-medium text-slate-500 leading-relaxed">{note.message}</p>
                                {!note.read && (
                                    <Button variant="link" className="p-0 h-auto text-orange-500 font-black text-[10px] uppercase tracking-widest mt-4">Execute Action <ChevronRight className="w-3 h-3 ml-1" /></Button>
                                )}
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );

    const renderSettings = () => (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24 lg:pb-0">
             <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-4xl font-black italic uppercase">System <span className="text-slate-400">Settings.</span></h3>
                    <p className="text-slate-400 font-medium mt-2">Adjust deployment protocols and personnel preferences.</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                <Card className="rounded-[3rem] border-none shadow-xl bg-white p-10 space-y-8">
                    <h4 className="text-xl font-black italic uppercase border-b border-slate-50 pb-6 flex items-center gap-3">
                        <Sliders className="w-6 h-6 text-slate-300" />
                        Interface Config.
                    </h4>
                    <div className="space-y-6">
                        {[
                            { label: 'Dark Protocol Mode', desc: 'Activate high-contrast tactical night interface.', active: false },
                            { label: 'Real-time Sync', desc: 'Continuous background cloud synchronization.', active: true },
                            { label: 'Auto-Accept Missions', desc: 'Automatically acknowledge new task assignments.', active: false },
                            { label: 'Map Navigation Overlay', desc: 'Float navigation window over operational tasks.', active: true },
                        ].map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between group">
                                <div>
                                    <p className="text-sm font-black text-slate-800 uppercase tracking-tight group-hover:text-orange-500 transition-colors">{item.label}</p>
                                    <p className="text-[10px] font-medium text-slate-400 mt-1">{item.desc}</p>
                                </div>
                                <div className={`w-12 h-6 rounded-full flex items-center px-1 transition-colors cursor-pointer ${item.active ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                                    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${item.active ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card className="rounded-[3rem] border-none shadow-xl bg-white p-10 space-y-8">
                    <h4 className="text-xl font-black italic uppercase border-b border-slate-50 pb-6 flex items-center gap-3">
                        <ShieldCheck className="w-6 h-6 text-slate-300" />
                        Security & Privacy.
                    </h4>
                    <div className="space-y-4">
                        <Button variant="outline" className="w-full h-16 justify-between px-8 rounded-2xl border-slate-50 font-black uppercase text-[10px] tracking-widest text-slate-600 group hover:border-slate-300">
                           Change Access Credentials <ChevronRight className="w-4 h-4 text-slate-200 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
                        </Button>
                        <Button variant="outline" className="w-full h-16 justify-between px-8 rounded-2xl border-slate-50 font-black uppercase text-[10px] tracking-widest text-slate-600 group hover:border-slate-300">
                           Manage Location Permissions <Map className="w-4 h-4 text-slate-200" />
                        </Button>
                        <Button variant="outline" className="w-full h-16 justify-between px-8 rounded-2xl border-slate-50 font-black uppercase text-[10px] tracking-widest text-rose-500 hover:bg-rose-50 group border-rose-50/50">
                           Deactivate Operational Account <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                    <div className="pt-6 border-t border-slate-50">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em] text-center italic">Elite Fleet Core v2.4.0-Stable</p>
                    </div>
                </Card>
            </div>
        </div>
    );

    const MenuItems = [
        { id: 'dashboard', label: 'Duty Dashboard', icon: LayoutDashboard },
        { id: 'tasks', label: 'Task Assignments', icon: Package },
        { id: 'history', label: 'Mission History', icon: History },
        { id: 'wallet', label: 'Wealth Protocol', icon: Wallet },
        { id: 'notifications', label: 'Sync Alerts', icon: Bell },
        { id: 'profile', label: 'Self Identity', icon: User },
        { id: 'settings', label: 'System Settings', icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-orange-100 flex flex-col lg:flex-row">
            {/* Desktop Sidebar */}
            <div className={`hidden lg:flex fixed left-0 top-0 bottom-0 z-50 bg-white border-r border-slate-100 flex-col transition-all duration-500 ease-in-out ${isSidebarOpen ? 'w-80' : 'w-24'}`}>
                <div className="p-8 flex items-center justify-between">
                    {isSidebarOpen ? (
                        <div className="flex items-center gap-3 animate-in fade-in zoom-in duration-500">
                            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center shadow-xl">
                                <Truck className="w-7 h-7 text-orange-500" />
                            </div>
                            <h1 className="text-2xl font-black italic tracking-tighter uppercase">Elite<span className="text-orange-500">Fleet</span></h1>
                        </div>
                    ) : (
                        <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center shadow-xl mx-auto">
                            <Truck className="w-7 h-7 text-orange-500" />
                        </div>
                    )}
                </div>

                <nav className="flex-1 px-4 mt-8 space-y-2 overflow-y-auto custom-scrollbar">
                    {MenuItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-4 p-4 rounded-[1.2rem] transition-all duration-300 group ${activeTab === item.id ? 'bg-slate-900 text-white shadow-2xl shadow-slate-200' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'}`}
                        >
                            <item.icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${activeTab === item.id ? 'text-orange-500' : ''}`} />
                            {isSidebarOpen && <span className="font-black uppercase text-[10px] tracking-[0.2em] animate-in fade-in slide-in-from-left-4 duration-500">{item.label}</span>}
                        </button>
                    ))}
                </nav>

                <div className="p-6">
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="w-full h-12 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center hover:bg-slate-100 transition-colors">
                        {isSidebarOpen ? <ChevronLeft className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
                    </button>
                </div>

                <div className="p-6 border-t border-slate-50">
                    <button onClick={logout} className={`w-full flex items-center gap-4 p-5 rounded-2xl text-rose-500 hover:bg-rose-50 transition-all font-black uppercase text-[10px] tracking-widest ${!isSidebarOpen && 'justify-center'}`}>
                        <LogOut className="w-6 h-6" />
                        {isSidebarOpen && <span>Terminate Link</span>}
                    </button>
                </div>
            </div>

            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-2xl z-50 border-b border-slate-50 px-6 py-5 flex justify-between items-center transition-all duration-500">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-900 rounded-[1.2rem] flex items-center justify-center shadow-lg">
                        <Truck className="w-6 h-6 text-orange-500" />
                    </div>
                    <span className="text-xl font-black italic tracking-tighter uppercase">Elite<span className="text-orange-500">Fleet</span></span>
                </div>
                <div className="w-10 h-10 bg-slate-50 rounded-[1.2rem] flex items-center justify-center text-slate-400 shadow-inner relative" onClick={() => setActiveTab('notifications')}>
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-orange-500 rounded-full border-2 border-white animate-pulse"></span>
                </div>
            </div>

            {/* Main Content Area */}
            <main className={`flex-1 transition-all duration-500 bg-[#F8FAFC] lg:pt-10 lg:px-12 ${isSidebarOpen ? 'lg:ml-80' : 'lg:ml-24'}`}>
                <div className="pt-24 lg:pt-0 max-w-7xl mx-auto pb-12 px-6 lg:px-0">
                    {loading ? (
                        <div className="h-[70vh] flex flex-col items-center justify-center">
                            <div className="w-20 h-20 border-4 border-slate-900 border-t-orange-500 rounded-full animate-spin mb-8 shadow-2xl shadow-orange-100"></div>
                            <h3 className="text-xl font-black italic uppercase tracking-tighter animate-pulse">Synchronizing Personnel Grid...</h3>
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-4">Authorized Protocol Authentication active</p>
                        </div>
                    ) : (
                        <>
                            {activeTab === 'dashboard' && renderDashboard()}
                            {activeTab === 'tasks' && renderTasks()}
                            {activeTab === 'history' && renderHistory()}
                            {activeTab === 'wallet' && renderWallet()}
                            {activeTab === 'notifications' && renderNotifications()}
                            {activeTab === 'profile' && renderProfile()}
                            {activeTab === 'settings' && renderSettings()}
                        </>
                    )}
                </div>
            </main>

            {/* Mobile Bottom Navigation - Sticky to bottom */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 z-50 pointer-events-auto">
                <div className="bg-slate-900/95 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_-20px_60px_rgba(0,0,0,0.15)] p-2.5 flex items-center justify-around border border-white/10 overflow-x-auto custom-scrollbar no-scrollbar">
                    {MenuItems.map(item => (
                        <button 
                            key={item.id}
                            onClick={() => setActiveTab(item.id)} 
                            className={`flex flex-col items-center gap-1.5 min-w-[60px] p-3 rounded-2xl transition-all duration-500 scale-90 ${activeTab === item.id ? 'text-orange-500 scale-100 bg-white/5 shadow-xl' : 'text-slate-500 active:scale-75'}`}
                        >
                            <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'animate-bounce' : ''}`} />
                            <span className="text-[6px] font-black uppercase tracking-[0.2em] whitespace-nowrap">{item.id === 'dashboard' ? 'Duty' : item.id === 'tasks' ? 'Tasks' : item.id === 'history' ? 'History' : item.id === 'wallet' ? 'Pay' : item.id === 'notifications' ? 'Alerts' : item.id === 'settings' ? 'Settings' : 'Self'}</span>
                        </button>
                    ))}
                </div>
            </div>
            
            {/* Additional CSS for smooth animations & scrollbars */}
            <style jsx>{`
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-3px); }
                }
                .animate-bounce {
                    animation: bounce 2s infinite ease-in-out;
                }
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #E2E8F0;
                    border-radius: 10px;
                }
            `}</style>
        </div>
    );
};

export default DeliveryDashboard;
