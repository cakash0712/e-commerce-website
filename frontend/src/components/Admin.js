import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from "./Navigation";
import Footer from "./Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, ShoppingCart, Package, TrendingUp, Settings, BarChart3, LogIn, LayoutDashboard, Store, CreditCard, Tag, UserCheck } from "lucide-react";

const Admin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [activeSubMenu, setActiveSubMenu] = useState('total-orders');
  const [expandedMenus, setExpandedMenus] = useState(['dashboard']);

  const handleLogin = () => {
    if (email === 'admin@admin.com' && password === 'admin123') {
      setIsLoggedIn(true);
      setError('');
    } else {
      setError('Invalid admin credentials');
    }
  };

  const handleMenuClick = (menuId) => {
    setActiveMenu(menuId);
    if (expandedMenus.includes(menuId)) {
      setExpandedMenus(expandedMenus.filter(id => id !== menuId));
    } else {
      setExpandedMenus([menuId]);
    }
    // Set first subitem as active
    const menu = menuItems.find(m => m.id === menuId);
    if (menu && menu.subItems && menu.subItems.length > 0) {
      setActiveSubMenu(menu.subItems[0].id);
    }
  };

  const handleSubMenuClick = (subMenuId) => {
    setActiveSubMenu(subMenuId);
  };

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      subItems: [
        { id: 'total-orders', label: 'Total Orders' },
        { id: 'total-sales', label: 'Total Sales' },
        { id: 'total-vendors', label: 'Total Vendors' },
        { id: 'pending-approvals', label: 'Pending Approvals' },
        { id: 'recent-orders', label: 'Recent Orders' }
      ]
    },
    {
      id: 'vendors',
      label: 'Vendors',
      icon: Store,
      subItems: [
        { id: 'vendor-requests', label: 'Vendor Requests' },
        { id: 'active-vendors', label: 'Active Vendors' },
        { id: 'blocked-vendors', label: 'Blocked Vendors' },
        { id: 'vendor-details', label: 'Vendor Details' },
        { id: 'vendor-products', label: 'Vendor Products' },
        { id: 'vendor-orders', label: 'Vendor Orders' }
      ]
    },
    {
      id: 'products',
      label: 'Products',
      icon: Package,
      subItems: [
        { id: 'all-products', label: 'All Products' },
        { id: 'pending-products', label: 'Pending Products' },
        { id: 'approved-products', label: 'Approved Products' },
        { id: 'disabled-products', label: 'Disabled Products' }
      ]
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: ShoppingCart,
      subItems: [
        { id: 'all-orders', label: 'All Orders' },
        { id: 'new-orders', label: 'New Orders' },
        { id: 'completed-orders', label: 'Completed Orders' },
        { id: 'cancelled-orders', label: 'Cancelled Orders' }
      ]
    },
    {
      id: 'payments',
      label: 'Payments',
      icon: CreditCard,
      subItems: [
        { id: 'customer-payments', label: 'Customer Payments' },
        { id: 'vendor-earnings', label: 'Vendor Earnings' },
        { id: 'payout-history', label: 'Payout History' }
      ]
    },
    {
      id: 'categories',
      label: 'Categories',
      icon: Tag,
      subItems: [
        { id: 'categories-list', label: 'Categories' },
        { id: 'sub-categories', label: 'Sub-Categories' }
      ]
    },
    {
      id: 'users',
      label: 'Users',
      icon: UserCheck,
      subItems: [
        { id: 'all-users', label: 'All Users' },
        { id: 'blocked-users', label: 'Blocked Users' }
      ]
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      subItems: [
        { id: 'commission-percentage', label: 'Commission Percentage' },
        { id: 'website-status', label: 'Website Status' },
        { id: 'admin-password', label: 'Admin Password Change' }
      ]
    },
  ];

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-violet-50 to-white flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center p-4 pt-24">
          <Card className="w-full max-w-md shadow-2xl border-0 overflow-hidden rounded-2xl">
            <div className="bg-gradient-to-br from-violet-600 to-indigo-700 p-8 text-center text-white relative overflow-hidden">
              <div className="relative">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Settings className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold mb-1">Admin Panel</h2>
                <p className="text-violet-200 text-sm">Access admin dashboard</p>
              </div>
            </div>

            <CardContent className="p-6">
              {error && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100 mb-4">
                  {error}
                </div>
              )}

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Admin Email</Label>
                  <Input
                    type="email"
                    placeholder="Enter admin email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 rounded-lg border-gray-200 focus:ring-2 focus:ring-violet-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Password</Label>
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 rounded-lg border-gray-200 focus:ring-2 focus:ring-violet-600"
                  />
                </div>

                <Button
                  onClick={handleLogin}
                  className="w-full h-12 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-semibold"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Admin Login
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation />
      <div className="flex-1 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-sm rounded-lg p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Admin Panel</h2>
              <nav className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isExpanded = expandedMenus.includes(item.id);
                  return (
                    <div key={item.id}>
                      <button
                        onClick={() => handleMenuClick(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                          activeMenu === item.id
                            ? 'bg-violet-100 text-violet-700'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </button>
                      {isExpanded && item.subItems && (
                        <div className="ml-8 mt-1 space-y-1">
                          {item.subItems.map((subItem) => (
                            <button
                              key={subItem.id}
                              onClick={() => handleSubMenuClick(subItem.id)}
                              className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-colors ${
                                activeSubMenu === subItem.id
                                  ? 'bg-violet-50 text-violet-600'
                                  : 'text-gray-500 hover:bg-gray-50'
                              }`}
                            >
                              {subItem.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1">
              <div className="bg-white rounded-lg p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900 capitalize">
                  {menuItems.find(m => m.id === activeMenu)?.label} - {menuItems.find(m => m.id === activeMenu)?.subItems?.find(s => s.id === activeSubMenu)?.label}
                </h2>
                <p className="text-gray-600 mt-2">Manage your {activeSubMenu.replace(/-/g, ' ')} here.</p>

                {/* Dashboard Stats */}
                {activeMenu === 'dashboard' && activeSubMenu === 'total-orders' && (
                  <div className="mt-6">
                    <div className="text-4xl font-bold text-gray-900">1,234</div>
                    <p className="text-gray-600">Total Orders</p>
                  </div>
                )}

                {activeMenu === 'dashboard' && activeSubMenu === 'total-sales' && (
                  <div className="mt-6">
                    <div className="text-4xl font-bold text-gray-900">₹12,34,567</div>
                    <p className="text-gray-600">Total Sales</p>
                  </div>
                )}

                {activeMenu === 'dashboard' && activeSubMenu === 'total-vendors' && (
                  <div className="mt-6">
                    <div className="text-4xl font-bold text-gray-900">156</div>
                    <p className="text-gray-600">Total Vendors</p>
                  </div>
                )}

                {activeMenu === 'dashboard' && activeSubMenu === 'pending-approvals' && (
                  <div className="mt-6">
                    <div className="text-4xl font-bold text-gray-900">23</div>
                    <p className="text-gray-600">Pending Approvals</p>
                  </div>
                )}

                {activeMenu === 'dashboard' && activeSubMenu === 'recent-orders' && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full bg-white border border-gray-200">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="px-4 py-2 border">Order ID</th>
                            <th className="px-4 py-2 border">Customer</th>
                            <th className="px-4 py-2 border">Amount</th>
                            <th className="px-4 py-2 border">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="px-4 py-2 border">#12345</td>
                            <td className="px-4 py-2 border">John Doe</td>
                            <td className="px-4 py-2 border">₹2,500</td>
                            <td className="px-4 py-2 border">Completed</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2 border">#12346</td>
                            <td className="px-4 py-2 border">Jane Smith</td>
                            <td className="px-4 py-2 border">₹1,800</td>
                            <td className="px-4 py-2 border">Processing</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Placeholder for other sections */}
                {!(activeMenu === 'dashboard' && ['total-orders', 'total-sales', 'total-vendors', 'pending-approvals', 'recent-orders'].includes(activeSubMenu)) && (
                  <div className="mt-6">
                    <p className="text-gray-500">This section is under development.</p>
                  </div>
                )}
              </div>
            </main>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
  const adminStats = [
    { title: "Total Users", value: "1,234", icon: Users, color: "bg-blue-500" },
    { title: "Total Orders", value: "567", icon: ShoppingCart, color: "bg-green-500" },
    { title: "Products", value: "890", icon: Package, color: "bg-purple-500" },
    { title: "Revenue", value: "₹12,34,567", icon: TrendingUp, color: "bg-orange-500" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation />
      <div className="flex-1 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage your e-commerce platform</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {adminStats.map((stat, index) => (
              <Card key={index} className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  User Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Manage user accounts and permissions</p>
                <Button variant="outline" className="w-full">Manage Users</Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Product Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Add, edit, and manage products</p>
                <Button variant="outline" className="w-full">Manage Products</Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Order Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">View and process orders</p>
                <Button variant="outline" className="w-full">Manage Orders</Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">View sales and performance metrics</p>
                <Button variant="outline" className="w-full">View Analytics</Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Configure platform settings</p>
                <Button variant="outline" className="w-full">Platform Settings</Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Generate and download reports</p>
                <Button variant="outline" className="w-full">Generate Reports</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Admin;