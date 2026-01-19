import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import Navigation from "./Navigation";
import Footer from "./Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, Plus, Edit, Trash2, Eye, Upload, Star, ShoppingCart, TrendingUp, LayoutDashboard, DollarSign, User, LogOut } from "lucide-react";
import { useAuth } from "../App";

const Vendor = () => {
  const { user, updateUser, logout } = useAuth();



  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [profileData, setProfileData] = useState({
    business_name: "",
    owner_name: "",
    email: "",
    phone: "",
    address: ""
  });

  React.useEffect(() => {
    if (user) {
      setProfileData({
        business_name: user.business_name || "",
        owner_name: user.owner_name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || ""
      });
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    try {
      await updateUser(user.id, {
        business_name: profileData.business_name,
        owner_name: profileData.owner_name,
        phone: profileData.phone,
        address: profileData.address
      });
      alert("Profile updated successfully!");
    } catch (err) {
      alert("Failed to update profile.");
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'my-products', label: 'My Products', icon: Package },
    { id: 'my-orders', label: 'My Orders', icon: ShoppingCart },
    { id: 'earnings', label: 'Earnings', icon: DollarSign },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  // Mock data for demonstration
  const recentOrders = [
    { id: 'ORD-001', product: 'Wireless Headphones', quantity: 2, status: 'Processing' },
    { id: 'ORD-002', product: 'Smart Watch', quantity: 1, status: 'Shipped' },
    { id: 'ORD-003', product: 'Laptop', quantity: 1, status: 'Delivered' },
    { id: 'ORD-004', product: 'Headphones', quantity: 3, status: 'Processing' },
    { id: 'ORD-005', product: 'Tablet', quantity: 1, status: 'Cancelled' },
  ];

  const earningsData = [
    { orderId: 'ORD-001', orderAmount: 5998, commission: 600, vendorAmount: 5398, status: 'Pending' },
    { orderId: 'ORD-002', orderAmount: 4999, commission: 500, vendorAmount: 4499, status: 'Paid' },
  ];
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [products, setProducts] = useState([
    {
      id: 1,
      name: "Wireless Headphones",
      price: 2999,
      category: "Electronics",
      stock: 50,
      sales: 25,
      rating: 4.5,
      status: "active"
    },
    {
      id: 2,
      name: "Smart Watch",
      price: 4999,
      category: "Electronics",
      stock: 30,
      sales: 15,
      rating: 4.2,
      status: "active"
    }
  ]);

  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    category: "",
    description: "",
    stock: "",
    images: []
  });

  const vendorStats = [
    { title: "Total Products", value: products.length, icon: Package, color: "bg-blue-500" },
    { title: "Total Sales", value: products.reduce((sum, p) => sum + p.sales, 0), icon: ShoppingCart, color: "bg-green-500" },
    { title: "Revenue", value: `₹${products.reduce((sum, p) => sum + (p.price * p.sales), 0).toLocaleString()}`, icon: TrendingUp, color: "bg-purple-500" },
    { title: "Avg Rating", value: products.length > 0 ? (products.reduce((sum, p) => sum + p.rating, 0) / products.length).toFixed(1) : "0.0", icon: Star, color: "bg-orange-500" },
  ];

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price || !newProduct.category) {
      alert("Please fill in all required fields");
      return;
    }

    const product = {
      id: Date.now(),
      ...newProduct,
      price: parseInt(newProduct.price),
      stock: parseInt(newProduct.stock),
      sales: 0,
      rating: 0,
      status: "active"
    };

    setProducts([...products, product]);
    setNewProduct({ name: "", price: "", category: "", description: "", stock: "", images: [] });
    setShowAddProduct(false);
    alert("Product added successfully!");
  };

  const handleDeleteProduct = (id) => {
    setProducts(products.filter(p => p.id !== id));
    alert("Product deleted successfully!");
  };

  if (!user || user.user_type !== "vendor") {
    return <Navigate to="/auth" />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation />
      <div className="flex-1 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-sm rounded-lg p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Vendor Panel</h2>
              <nav className="space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveMenu(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeMenu === item.id
                        ? 'bg-violet-100 text-violet-700'
                        : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              <div className="mt-8 pt-6 border-t border-gray-100">
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-red-600 hover:bg-red-50 transition-colors group"
                >
                  <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                  <span className="font-bold">Logout</span>
                </button>
              </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1">

              {/* Dashboard */}
              {activeMenu === "dashboard" && (
                <div className="space-y-8">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-600 mt-2">Quick summary of your vendor activities</p>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card className="border-0 shadow-sm">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Total Products</p>
                            <p className="text-2xl font-bold text-gray-900">{products.length}</p>
                          </div>
                          <Package className="w-8 h-8 text-blue-500" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-0 shadow-sm">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Active Products</p>
                            <p className="text-2xl font-bold text-gray-900">{products.filter(p => p.status === 'active').length}</p>
                          </div>
                          <Package className="w-8 h-8 text-green-500" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-0 shadow-sm">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Total Orders</p>
                            <p className="text-2xl font-bold text-gray-900">{products.reduce((sum, p) => sum + p.sales, 0)}</p>
                          </div>
                          <ShoppingCart className="w-8 h-8 text-purple-500" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-0 shadow-sm">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                            <p className="text-2xl font-bold text-gray-900">{recentOrders.filter(o => o.status === 'Processing').length}</p>
                          </div>
                          <ShoppingCart className="w-8 h-8 text-orange-500" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-0 shadow-sm">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                            <p className="text-2xl font-bold text-gray-900">₹{products.reduce((sum, p) => sum + (p.price * p.sales), 0).toLocaleString()}</p>
                          </div>
                          <DollarSign className="w-8 h-8 text-green-500" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-0 shadow-sm">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Available Balance</p>
                            <p className="text-2xl font-bold text-gray-900">₹{(products.reduce((sum, p) => sum + (p.price * p.sales), 0) * 0.9).toLocaleString()}</p>
                          </div>
                          <DollarSign className="w-8 h-8 text-blue-500" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Recent Orders Table */}
                  <Card className="border-0 shadow-sm">
                    <CardHeader>
                      <CardTitle>Recent Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border border-gray-200">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="px-4 py-2 border">Order ID</th>
                              <th className="px-4 py-2 border">Product</th>
                              <th className="px-4 py-2 border">Quantity</th>
                              <th className="px-4 py-2 border">Order Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {recentOrders.map((order) => (
                              <tr key={order.id}>
                                <td className="px-4 py-2 border">{order.id}</td>
                                <td className="px-4 py-2 border">{order.product}</td>
                                <td className="px-4 py-2 border">{order.quantity}</td>
                                <td className="px-4 py-2 border">
                                  <span className={`px-2 py-1 rounded text-xs ${order.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                                    order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                                      order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                                        'bg-red-100 text-red-800'
                                    }`}>
                                    {order.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* My Products */}
              {activeMenu === "my-products" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-900">My Products</h2>
                    <Button onClick={() => setActiveMenu("add-product")} className="bg-violet-600 hover:bg-violet-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Product
                    </Button>
                  </div>

                  {/* Product Tabs */}
                  <div className="flex space-x-1 bg-white p-1 rounded-lg shadow-sm">
                    {[
                      { id: "all-products", label: "All Products" },
                      { id: "pending-products", label: "Pending Products" },
                      { id: "approved-products", label: "Approved Products" },
                      { id: "disabled-products", label: "Disabled Products" }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${true ? "bg-violet-600 text-white shadow-sm" : "text-gray-600 hover:text-violet-600 hover:bg-gray-50"
                          }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Product List */}
                  <Card className="border-0 shadow-sm">
                    <CardHeader>
                      <CardTitle>Product Management</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border border-gray-200">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="px-4 py-2 border">Product Name</th>
                              <th className="px-4 py-2 border">Category</th>
                              <th className="px-4 py-2 border">Price</th>
                              <th className="px-4 py-2 border">Stock</th>
                              <th className="px-4 py-2 border">Status</th>
                              <th className="px-4 py-2 border">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {products.map((product) => (
                              <tr key={product.id}>
                                <td className="px-4 py-2 border">{product.name}</td>
                                <td className="px-4 py-2 border">{product.category}</td>
                                <td className="px-4 py-2 border">₹{product.price}</td>
                                <td className="px-4 py-2 border">{product.stock}</td>
                                <td className="px-4 py-2 border">
                                  <span className={`px-2 py-1 rounded text-xs ${product.status === 'active' ? 'bg-green-100 text-green-800' :
                                    product.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-red-100 text-red-800'
                                    }`}>
                                    {product.status}
                                  </span>
                                </td>
                                <td className="px-4 py-2 border">
                                  <div className="flex gap-2">
                                    <Button variant="outline" size="sm">Edit</Button>
                                    <Button variant="outline" size="sm" className="text-red-600">Delete</Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Add Product */}
              {activeMenu === "add-product" && (
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle>Add New Product</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>Product Name *</Label>
                        <Input
                          placeholder="Enter product name"
                          value={newProduct.name}
                          onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Price *</Label>
                        <Input
                          type="number"
                          placeholder="Enter price in ₹"
                          value={newProduct.price}
                          onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Category *</Label>
                        <Select value={newProduct.category} onValueChange={(value) => setNewProduct({ ...newProduct, category: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Electronics">Electronics</SelectItem>
                            <SelectItem value="Fashion">Fashion</SelectItem>
                            <SelectItem value="Home">Home & Kitchen</SelectItem>
                            <SelectItem value="Sports">Sports</SelectItem>
                            <SelectItem value="Books">Books</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Stock Quantity</Label>
                        <Input
                          type="number"
                          placeholder="Enter stock quantity"
                          value={newProduct.stock}
                          onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        placeholder="Enter product description"
                        value={newProduct.description}
                        onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                        rows={4}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Product Images</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">Click to upload product images</p>
                        <p className="text-sm text-gray-400 mt-1">PNG, JPG up to 5MB each</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Button onClick={handleAddProduct} className="bg-violet-600 hover:bg-violet-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Product
                      </Button>
                      <Button variant="outline" onClick={() => setActiveMenu("my-products")}>
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* My Orders */}
              {activeMenu === "my-orders" && (
                <div className="space-y-6">
                  <div className="flex space-x-1 bg-white p-1 rounded-lg shadow-sm">
                    {[
                      { id: "all-orders", label: "All Orders" },
                      { id: "new-orders", label: "New Orders" },
                      { id: "completed-orders", label: "Completed Orders" },
                      { id: "cancelled-orders", label: "Cancelled Orders" }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${true ? "bg-violet-600 text-white shadow-sm" : "text-gray-600 hover:text-violet-600 hover:bg-gray-50"
                          }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <Card className="border-0 shadow-sm">
                    <CardHeader>
                      <CardTitle>Order Management</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border border-gray-200">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="px-4 py-2 border">Order ID</th>
                              <th className="px-4 py-2 border">Product Name</th>
                              <th className="px-4 py-2 border">Quantity</th>
                              <th className="px-4 py-2 border">Customer Name</th>
                              <th className="px-4 py-2 border">Order Status</th>
                              <th className="px-4 py-2 border">Payment Status</th>
                              <th className="px-4 py-2 border">Order Date</th>
                              <th className="px-4 py-2 border">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {recentOrders.map((order) => (
                              <tr key={order.id}>
                                <td className="px-4 py-2 border">{order.id}</td>
                                <td className="px-4 py-2 border">{order.product}</td>
                                <td className="px-4 py-2 border">{order.quantity}</td>
                                <td className="px-4 py-2 border">John Doe</td>
                                <td className="px-4 py-2 border">
                                  <span className={`px-2 py-1 rounded text-xs ${order.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                                    order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                                      order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                                        'bg-red-100 text-red-800'
                                    }`}>
                                    {order.status}
                                  </span>
                                </td>
                                <td className="px-4 py-2 border">
                                  <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800">Paid</span>
                                </td>
                                <td className="px-4 py-2 border">2024-01-15</td>
                                <td className="px-4 py-2 border">
                                  <div className="flex gap-2">
                                    <Button variant="outline" size="sm">View</Button>
                                    <Button variant="outline" size="sm">Update Status</Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Earnings */}
              {activeMenu === "earnings" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Earnings</h2>
                    <p className="text-gray-600 mt-2">Track your income and payouts</p>
                  </div>

                  {/* Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="border-0 shadow-sm">
                      <CardContent className="p-6">
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                          <p className="text-2xl font-bold text-gray-900">₹{products.reduce((sum, p) => sum + (p.price * p.sales), 0).toLocaleString()}</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-0 shadow-sm">
                      <CardContent className="p-6">
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-600">Admin Commission</p>
                          <p className="text-2xl font-bold text-gray-900">₹{(products.reduce((sum, p) => sum + (p.price * p.sales), 0) * 0.1).toLocaleString()}</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-0 shadow-sm">
                      <CardContent className="p-6">
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-600">Net Earnings</p>
                          <p className="text-2xl font-bold text-gray-900">₹{(products.reduce((sum, p) => sum + (p.price * p.sales), 0) * 0.9).toLocaleString()}</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-0 shadow-sm">
                      <CardContent className="p-6">
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-600">Available Balance</p>
                          <p className="text-2xl font-bold text-gray-900">₹{(products.reduce((sum, p) => sum + (p.price * p.sales), 0) * 0.9).toLocaleString()}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Earnings Table */}
                  <Card className="border-0 shadow-sm">
                    <CardHeader>
                      <CardTitle>Earnings History</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border border-gray-200">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="px-4 py-2 border">Order ID</th>
                              <th className="px-4 py-2 border">Order Amount</th>
                              <th className="px-4 py-2 border">Commission</th>
                              <th className="px-4 py-2 border">Vendor Amount</th>
                              <th className="px-4 py-2 border">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {earningsData.map((earning) => (
                              <tr key={earning.orderId}>
                                <td className="px-4 py-2 border">{earning.orderId}</td>
                                <td className="px-4 py-2 border">₹{earning.orderAmount}</td>
                                <td className="px-4 py-2 border">₹{earning.commission}</td>
                                <td className="px-4 py-2 border">₹{earning.vendorAmount}</td>
                                <td className="px-4 py-2 border">
                                  <span className={`px-2 py-1 rounded text-xs ${earning.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {earning.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Payout Section */}
                  <Card className="border-0 shadow-sm">
                    <CardHeader>
                      <CardTitle>Payout Management</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-gray-600">Request payout for available balance</p>
                          <p className="text-sm text-gray-500">Minimum payout: ₹1,000</p>
                        </div>
                        <Button className="bg-violet-600 hover:bg-violet-700">Request Payout</Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Profile */}
              {activeMenu === "profile" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Profile</h2>
                    <p className="text-gray-600 mt-2">Manage your vendor account and settings</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Profile Info */}
                    <Card className="border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle>Profile Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Business Name</Label>
                            <Input
                              value={profileData.business_name}
                              onChange={(e) => setProfileData({ ...profileData, business_name: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label>Owner Name</Label>
                            <Input
                              value={profileData.owner_name}
                              onChange={(e) => setProfileData({ ...profileData, owner_name: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label>Email</Label>
                            <Input value={profileData.email} disabled />
                          </div>
                          <div>
                            <Label>Phone Number</Label>
                            <Input
                              value={profileData.phone}
                              onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                            />
                          </div>
                        </div>
                        <div>
                          <Label>Address</Label>
                          <Textarea
                            value={profileData.address}
                            onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                          />
                        </div>
                        <Button
                          onClick={handleUpdateProfile}
                          className="bg-violet-600 hover:bg-violet-700"
                        >
                          Update Profile
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Business Details */}
                    <Card className="border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle>Business Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>Tax / GST Number</Label>
                          <Input defaultValue="GST123456789" />
                        </div>
                        <div>
                          <Label>Business Type</Label>
                          <Input defaultValue="Private Limited" />
                        </div>
                        <div>
                          <Label>Bank Account Details</Label>
                          <Textarea placeholder="Account Number, IFSC, Bank Name" />
                        </div>
                        <Button variant="outline">Upload Documents</Button>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Account Settings */}
                  <Card className="border-0 shadow-sm">
                    <CardHeader>
                      <CardTitle>Account Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Change Password</Label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                          <Input type="password" placeholder="Current Password" />
                          <Input type="password" placeholder="New Password" />
                          <Input type="password" placeholder="Confirm Password" />
                        </div>
                        <Button className="mt-4 bg-violet-600 hover:bg-violet-700">Change Password</Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

            </main>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Vendor;